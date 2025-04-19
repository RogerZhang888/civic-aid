const { v4: uuidv4 } = require('uuid');
const pgsql = require("../config/db");
const { callModel } = require('../services/llmService');
const { systempromptTemplates } = require('../services/promptbook');
const { responseParsers } = require('../services/parsers');

const updateQueriesDB = (params)  => {
    // TODO: Actually update the DB
    return;
    params = {userId, chatId, userprompt, media, systemprompt, response, isValid, toReply, confidence}
    console.log("Updated Queries table", params)
}

const getChatHistory = async (chatId) => {
    // TODO: Check this SQL command
    let chatHistory = await pgsql.query("SELECT * FROM Queries WHERE chat_id = $1", [chatId]);
    console.log("Extracting chat history", chatHistory)
    return chatHistory
}
const getChat = async (chatId) => {
    let chat = await pgsql.query("SELECT * FROM Chats WHERE id = $1", [chatId])
    console.log("Extracting chat info", chat)
    return chat[0]
}

const getConfidence = (score) => {
    // TOOD: Confirm boundaries
    if (score > 0.8) return 'HIGH'
    else if (score > 0.4) return 'MED'
    else return 'LOW'
}

// TOOD: media support
const userquery = async (userprompt, userId, chatId) => {
    const chatHistory = await getChatHistory(chatId)
    const chat = await getChat(chatId)
    let queriesTracker = []

    async function queryLLM(query, parseResponse=responseParsers.defaultParser, reply='NEVER') {
        // reply enum: NEVER, ALWAYS, HIGH: 
        // NEVER means this output is never used as a reply, 
        // ALWAYS means this output will always be used as a reply, 
        // HIGH means this output will be used as a reply only when the confidence is HIGH
        console.log("Querying LLM", query)

        // TODO: check whats the arguments required etc for calling model
        let parsedRes
        let promptcount = 0
        // Provisional limit for 1 reprompt only for testing
        while (!parsedRes?.valid && promptcount < 1) {
            promptcount++
            parsedRes = await callModel(query).then((res) => {
                console.log(`${promptcount}: Received raw LLM response`, res)
                parsed = parseResponse(res)
                queryParams = {
                    userId, 
                    chatId, 
                    userprompt, 
                    systemprompt:query, 
                    response:res, 
                    isValid: parsed.valid, 
                    toReply:
                        reply=='ALWAYS'?parsed.answer
                        :(reply='HIGH'&&getConfidence(parsed.confidence)=='HIGH')?parsed.answer
                        :null, 
                    confidence:parsed.confidence,
                    sources:parsed.sources,
                }
                updateQueriesDB(queryParams) // For long term record in DB
                queriesTracker.push(queryParams) // For temporary tracking

                return parsed
            }).catch((err) => {
                console.log('Error calling model', err)
                return {valid:false}
            })
        }
        // TOOD: better way to reprompt for invalid output format?

        console.log(`Result for query ${query}`, parsedRes)
        return parsedRes
    }

    let answer
    // TODO: queryLLM function missing parser specifications
    if (chat.type == 'unknown') {
        systemprompt = systempromptTemplates.getTypeDecisionTemplate(userprompt)
        response = await queryLLM(systemprompt, responseParsers.typeDecisionParser, 'NEVER')
        
        if (getConfidence(response.confidence) == 'LOW' || getConfidence(response.confidence) == 'MED') {
            systemprompt = systempromptTemplates.clarifyTypeDecisionTemplate(userprompt)
            response = await queryLLM(systemprompt, responseParsers.defaultParser, 'ALWAYS')
            answer = response.answer
        } else if (getConfidence(response.confidence) == 'HIGH') {
            chat.type = response.type
        }
    }

    if (chat.type == 'report') {
        let systemprompt = systempromptTemplates.getReportTemplate(userprompt)
        response = await queryLLM(systemprompt, responseParsers.reportParser, 'HIGH')

        if (getConfidence(response.confidence) == 'LOW') {
            systemprompt = systempromptTemplates.clarifyReportTemplateLow(userprompt)
            response = await queryLLM(systemprompt, responseParsers.defaultParser, 'ALWAYS')
            answer=response.answer
        } else if (getConfidence(response.confidence) == 'MED') {
            systemprompt = systempromptTemplates.clarifyReportTemplateMed(userprompt)
            response = await queryLLM(systemprompt, responseParsers.defaultParser, 'ALWAYS')
            answer = response.answer 
        } else if (getConfidence(response.confidence) == 'HIGH') {
            // By the original prompt, this should be a report format already?? TODO: verify this
            answer = response.answer 
        }
    }

    if (chat.type == 'question') {
        let systemprompt = systempromptTemplates.getQuestionTemplate(userprompt)
        response = await queryLLM(systemprompt, responseParsers.defaultParser, 'HIGH')

        if (getConfidence(response.confidence) == 'LOW') {
            systemprompt = systempromptTemplates.clarifyQuestionTemplateLow(userprompt)
            response = await queryLLM(systemprompt, responseParsers.defaultParser, 'ALWAYS')
            answer = response.answer 
        } else if (getConfidence(response.confidence) == 'MED') {
            systemprompt = systempromptTemplates.clarifyQuestionTemplateMed(userprompt)
            response = await queryLLM(systemprompt, responseParsers.defaultParser, 'ALWAYS')
            answer = response.answer 
        } else if (getConfidence(response.confidence) == 'HIGH') {
            answer = response.answer 
        }
    }
    
    return {
        queries: queriesTracker,
        answer
    }
}

exports.submitQuery = async (req, res) => {
    // TODO: Add validation to verify that the user is accessing his own chat
  try {
    const { prompt, latitude, longitude, chatId } = req.body;
    const userId = req.user?.id || null;
    // const uploadedFiles = req.files || [];

      console.log("Received prompt:", prompt);
      console.log("Location:", latitude, longitude);
      console.log("User ID:", userId);
    //   console.log("Uploaded file:", uploadedFile);

    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" });
    }

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

    userquery(prompt, userId, chatId).then((r) => {
        // TOOD: Remove queries history
        res.json({
            answer: r.answer,
            queries: r.queries, 
            sources: r.sources,
        })
    }).catch((err) => {
        console.error("Error handling user query", err);
        return res.status(500).json({ error: "Failed to generate a response." });
    })

    } catch (error) {
        console.error("Submit query error:", error);
        res.status(500).json({ error: error.message });
    }
};

function simulateLLMResponse() {
   return new Promise((resolve) => {
      setTimeout(() => {
         resolve({
            answer: generate({ exactly: 20, join: ' ' }),
            confidence: 0.9,
         });
      }, 1000);
   });
}