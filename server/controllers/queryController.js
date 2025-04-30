const { v4: uuidv4 } = require('uuid');
const pgsql = require("../config/db");
const { callModel } = require('../services/llmService');
const { systempromptTemplates } = require('../services/promptbook');
const { responseParsers } = require('../services/parsers');
const { updateReportsDB: createReport } = require('./reportController');

const updateQueriesDB = (params)  => {
    let {userId, chatId, userprompt, media, systemprompt, location, response, isValid, toReply, confidence, sources} = params
    // console.log("PRE QUERY CHECK", {userId, chatId, userprompt, media, systemprompt, location, response, isValid, toReply, confidence})
    pgsql.query(
        `INSERT INTO queries
        (user_id, chat_id, user_prompt, media_url, query_location, system_prompt, response, sources, is_valid, to_reply, query_confidence)
        VALUES (
          $1, $2, $3, $4,
          CASE
            WHEN $5::double precision IS NOT NULL AND $6::double precision IS NOT NULL
            THEN ST_SetSRID(ST_MakePoint($5, $6), 4326)
            ELSE NULL
          END,
          $7, $8, $9, $10, $11, $12
        )`,
        [
            userId,
            chatId,
            userprompt,
            media? [media] : [],
            location.latitude,
            location.longitude,
            systemprompt,
            response,
            sources??[],
            isValid,
            toReply,
            confidence
        ]
      ).then(() => {
        return;
        // console.log("Updated Queries table", params)
    }).catch((err) => {
        console.log("Error updating queries table", err)
    })
}

const getChatHistory = async (chatId) => {
    let chatHistory = await pgsql.query("SELECT * FROM queries WHERE chat_id = $1", [chatId]);
    // console.log("Extracting chat history", chatHistory)
    return chatHistory
}
const getChat = async (chatId) => {
    let chat = await pgsql.query("SELECT * FROM chats WHERE id = $1", [chatId])
    // console.log("Extracting chat info", chat)
    if (chat.length === 0) return {id:null}
    return chat[0]
}
const updateChatType = async (chatId, type, title) => {
    return pgsql.query("UPDATE chats SET type = $1, title = $2 WHERE id = $3", [type, title, chatId])
}

const getConfidence = (score, count) => {
    // TOOD: Confirm boundaries
    if (!score) return 'LOW'
    const adjustedScore = score + (1 - score) * ( 1 / (1 + Math.exp(3.5 - 0.3 * count)))
    console.log(`Confidence score adjustments, raw ${score} count ${count}`, adjustedScore)
    if (adjustedScore > 0.8) return 'HIGH'
    else if (adjustedScore > 0.3) return 'MED'
    else return 'LOW'
}

// TOOD: media support
const userquery = async (userprompt, userId, chatId, chat, location, media) => {
    let chatHistory = await getChatHistory(chatId)
    let chatMedia = []
    
    for (let row of chatHistory) {
        if (Array.isArray(row.media_url) && row.media_url != 0) {
            for (let m of row.media_url) chatMedia.push(m)
        }
    }
    if (media) chatMedia.push(media)
    chatMedia = [...new Set(chatMedia)]
        
    // console.log("CHATMEDIA", chatMedia)
    let queriesTracker = []
    let response = {}

    async function queryLLM({query, prompt, model}, parseResponse=responseParsers.defaultParser, reply='NEVER') {
        // reply enum: NEVER, ALWAYS, HIGH: 
        // NEVER means this output is never used as a reply, 
        // ALWAYS means this output will always be used as a reply, 
        // HIGH means this output will be used as a reply only when the confidence is HIGH
        // console.log("Querying LLM", query)

        let parsedRes
        let promptcount = 0
        const repromptLimit = 3
        while (!parsedRes?.valid && promptcount < repromptLimit) {
            promptcount++
            parsedRes = await callModel({query, prompt, model, imagePath: media, chatHistory}).then((res) => {
                console.log(`${promptcount}: Received raw LLM response`, res)
                parsed = parseResponse(res)
                console.log(`RESPONSE PARSED VALID? ${parsed.valid}`)
                queryParams = {
                    userId, 
                    chatId, 
                    userprompt, 
                    systemprompt:prompt, 
                    response:res, 
                    isValid: parsed.valid, 
                    toReply: reply=='ALWAYS' || (reply=='HIGH'&&getConfidence(parsed.confidence, chatHistory.length + 1)=='HIGH'), 
                    confidence:parsed.confidence,
                    sources:parsed.sources,
                    location,
                    media,
                }
                updateQueriesDB(queryParams) // For long term record in DB
                queriesTracker.push(queryParams) // For temporary tracking
                chatHistory.push(queryParams)

                return parsed
            }).catch((err) => {
                console.log('Error calling model', err)
                return parsedRes = {valid:false}
            })
        }
        // TOOD: better way to reprompt for invalid output format?

        // console.log(`Result for query ${query}`, parsedRes)
        return parsedRes
    }

    if (userprompt == "") {
        if (media == "") throw new Error("Invalid prompt")
        // MEDIA ONLY
        userprompt = await queryLLM({query:"", prompt:"", model:"captioner"}, responseParsers.noParser, reply='ALWAYS').then((res) => {
            return res.answer
        })
    }
    if (chat.type == 'unknown') {
        systemprompt = systempromptTemplates.getTypeDecisionTemplate(userprompt, chatHistory)
        response = await queryLLM({query:userprompt, prompt: systemprompt, model:'basic'}, responseParsers.typeDecisionParser, 'NEVER')
        
        if (getConfidence(response.confidence, chatHistory.length) == 'LOW' || getConfidence(response.confidence, chatHistory.length) == 'MED') {
            systemprompt = systempromptTemplates.clarifyTypeDecisionTemplate(userprompt, chatHistory)
            response = await queryLLM({query:userprompt, prompt: systemprompt, model: 'basic'}, responseParsers.noParser, 'ALWAYS')
        } else if (getConfidence(response.confidence, chatHistory.length) == 'HIGH') {
            chat.type = response.type
            chat.title = response.title
            updateChatType(chatId, response.type, response.title)
        }
    }

    let report
    if (chat.type == 'report') {
        let systemprompt = systempromptTemplates.getReportTemplate(userprompt, chatHistory)
        response = await queryLLM({query:userprompt, prompt: systemprompt, model:'main'}, responseParsers.reportParser, 'HIGH')

        if (getConfidence(response.confidence, chatHistory.length) == 'LOW') {
            systemprompt = systempromptTemplates.clarifyReportTemplateLow(userprompt, chatHistory)
            response = await queryLLM({query:userprompt, prompt: systemprompt, model:'basic'}, responseParsers.noParser, 'ALWAYS')
        } else if (getConfidence(response.confidence, chatHistory.length) == 'MED') {
            systemprompt = systempromptTemplates.clarifyReportTemplateMed(userprompt, chatHistory)
            response = await queryLLM({query:userprompt, prompt: systemprompt, model:'basic'}, responseParsers.noParser, 'ALWAYS')
        } else if (getConfidence(response.confidence, chatHistory.length) == 'HIGH') {
            report = await createReport({
                userId,
                chatId,
                title:chat.title,
                summary: response.summary,
                location,
                agency: response.agency,
                recommendedSteps: response.recommendedSteps,
                urgency: response.urgency,
                confidence: response.confidence,
                media: chatMedia
            })
        }
        // ELSE when HIGH - already report - no further action required
    }

    if (chat.type == 'question') {
        let systemprompt = systempromptTemplates.getQuestionTemplate(userprompt, chatHistory)
        response = await queryLLM({query:userprompt, prompt: systemprompt, model:'main'}, responseParsers.defaultParser, 'HIGH')

        if (getConfidence(response.confidence, chatHistory.length) == 'LOW') {
            systemprompt = systempromptTemplates.clarifyQuestionTemplateLow(userprompt, chatHistory)
            response = await queryLLM({query:userprompt, prompt: systemprompt, model:'basic'}, responseParsers.noParser, 'ALWAYS')
        } else if (getConfidence(response.confidence, chatHistory.length) == 'MED') {
            systemprompt = systempromptTemplates.clarifyQuestionTemplateMed(userprompt, chatHistory)
            response = await queryLLM({query:userprompt, prompt: systemprompt, model:'basic'}, responseParsers.noParser, 'ALWAYS')
        }
    }
    
    return {
        response: {
            ...response,
            title: chat.title,
            confidence: undefined,
            media,
            reportId: report?report[0]?.id:undefined,
            queries: queriesTracker,
        }
    }
}

exports.submitQuery = async (req, res) => {
    try {
        const { latitude, longitude, chatId } = req.body;
        const prompt = req.body.prompt??""
        const userId = req.user?.id || null;
        const uploadedFile = req.file;

        // console.log("Received prompt:", prompt);
        // console.log("Location:", latitude, longitude);
        // console.log("User ID:", userId);
        // console.log("Uploaded file:", uploadedFile);

        if ((!prompt) && (!uploadedFile)) {
            return res.status(400).json({ error: "Prompt is required" });
        }

        const chat = await getChat(chatId).then((r) => {
            if (r.id !== chatId) res.status(500).json({ error: "Invalid Chat ID" })
            else if (r.user_id !== userId) res.status(401).json({ error: "User does not have access to this chat ID" })
            else return r

            return {}
        })

        // Process and store uploaded files (mock URLs for now)
        // const savedMedia = uploadedFiles.map(file => {
        //   const ext = path.extname(file.originalname);
        //   const id = uuidv4();
        //   const filename = `${id}${ext}`;
        //   const mockUrl = `/uploads/${filename}`;
        //   return {
        //     originalName: file.originalname,
        //     mimeType: file.mimetype,
        //     url: mockUrl,
        //   };
        // });

        // const queryType = 'query'; // or 'report' — set based on context or user input
        // const imagePath = uploadedFiles.length > 0 ? uploadedFiles[0].path : null;

        if (chat.id) userquery(prompt, userId, chatId, chat, {longitude, latitude}, uploadedFile?.filename).then((r) => {
            res.json(r.response)
        }).catch((err) => {
            console.error("Error handling user query", err);
            return res.status(500).json({ error: "Failed to generate a response." });
        })
    } catch (error) {
        console.error("Submit query error:", error);
        res.status(500).json({ error: error.message });
    }
};

