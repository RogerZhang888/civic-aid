const { v4: uuidv4 } = require('uuid');
const pool = require("../config/db");
const { callModel } = require('../services/llmService');

const systempromptTemplates = {
    getTypeDecisionTemplate: (userprompt) => {
        return `Decide Type for ${userprompt}`
    },
    clarifyTypeDecisionTemplate: (userprompt) => {
        return `Ask the user follow up to clarify if this is a report or question`
    },
    getReportTemplate: (userprompt) => {
        return `Generate report and confidence for ${userprompt}`
    },
    clarifyReportTemplateLow: (userprompt) => {
        return `Ask for clarification for ${userprompt}`
    },
    clarifyReportTemplateMed: (userprompt) => {
        return `Summarise ${userprompt}, ask for clarification`
    },
    getQuestionTemplate: (userprompt) => {
        return `Respond to question ${userprompt}`
    },
    clarifyQuestionTemplateLow: (userprompt) => {
        return `Provide preliminary response and ask for clarification for ${userprompt}`
    },
    clarifyQuestionTemplateMed: (userprompt) => {
        return `Respond to ${userprompt}, ask for clarification`
    },
}

const responseParsers = {
    typeDecisionParser: (res) => {
        // QUESTION, REPORT + CONFIDENCE, VALID
        let r = {type: undefined, valid: undefined, confidence: undefined}

        return res
    },
    defaultParser: (res) => {
        // Just standard reply + confidence parser
        return res
    },
    reportParser: (res) => {
        return res
    }
}

const updateQueriesDB = (params)  => {
    params = {userId, chatId, userprompt, media, systemprompt, response, isValid, toReply, confidence}
    console.log("Updated Queries table", params)
}

const getChatHistory = async (chatId) => {
    // TODO: Check this SQL command
    return pool.query("SELECT * FROM Queries WHERE chat_id = $1", chatId)
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
    let queriesTracker = []

    async function queryLLM(query, parseResponse=responseParsers.defaultParser, reply='NEVER') {
        // reply enum: NEVER, ALWAYS, HIGH: 
        // NEVER means this output is never used as a reply, 
        // ALWAYS means this output will always be used as a reply, 
        // HIGH means this output will be used as a reply only when the confidence is HIGH

        // TODO: check whats the arguments required etc for calling model
        let parsedRes
        while (!parsedRes?.valid) {
            parsedRes = await callModel(query).then((res) => {
                parsed = parseResponse(res)
                queryParams = {
                    userId, 
                    chatId, 
                    userprompt, 
                    systemprompt:query, 
                    response:parsed.reply, 
                    isValid: parsed.valid, 
                    toReply:
                        reply=='ALWAYS'?parsed.reply
                        :(reply='HIGH'&&getConfidence(parsed.confidence)=='HIGH')?parsed.reply
                        :null, 
                    confidence:parsed.confidence
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

        return parsedRes
    }

    let reply
    // TODO: queryLLM function missing parser specifications
    if (!chat[chatId].type) {
        systemprompt = systempromptTemplates.getTypeDecisionTemplate(userprompt)
        response = queryLLM(systemprompt, responseParsers.typeDecisionParser, 'NEVER')
        
        if (getConfidence(response.confidence) == 'LOW' || getConfidence(response.confidence) == 'MED') {
            systemprompt = systempromptTemplates.clarifyTypeDecisionTemplate(userprompt)
            response = queryLLM(systemprompt, responseParsers.defaultParser, 'ALWAYS')
            reply = response.reply
        } else if (getConfidence(response.confidence) == 'HIGH') {
            chat[chatId].type = response.type
        }
    }

    if (chat[chatId].type == 'report') {
        let systemprompt = systempromptTemplates.getReportTemplate(userprompt)
        response = queryLLM(systemprompt, responseParsers.reportParser, 'HIGH')

        if (getConfidence(response.confidence) == 'LOW') {
            systemprompt = systempromptTemplates.clarifyReportTemplateLow(userprompt)
            response = queryLLM(systemprompt, responseParsers.defaultParser, 'ALWAYS')
            reply=response.reply
        } else if (getConfidence(response.confidence) == 'MED') {
            systemprompt = systempromptTemplates.clarifyReportTemplateMed(userprompt)
            response = queryLLM(systemprompt, responseParsers.defaultParser, 'ALWAYS')
            reply = response.reply 
        } else if (getConfidence(response.confidence) == 'HIGH') {
            // By the original prompt, this should be a report format already?? TODO: verify this
            reply = response.reply 
        }
    }

    if (chat[chatId].type == 'question') {
        let systemprompt = systempromptTemplates.getQuestionTemplate(userprompt)
        response = queryLLM(systemprompt, responseParsers.defaultParser, 'HIGH')

        if (getConfidence(response.confidence) == 'LOW') {
            systemprompt = systempromptTemplates.clarifyQuestionTemplateLow(userprompt)
            response = queryLLM(systemprompt, responseParsers.defaultParser, 'ALWAYS')
            reply = response.reply 
        } else if (getConfidence(response.confidence) == 'MED') {
            systemprompt = systempromptTemplates.clarifyQuestionTemplateMed(userprompt)
            response = queryLLM(systemprompt, responseParsers.defaultParser, 'ALWAYS')
            reply = response.reply 
        } else if (getConfidence(response.confidence) == 'HIGH') {
            reply = response.reply 
        }
    }
    
    return {
        queries: queriesTracker,
        reply
    }
}

exports.submitQuery = async (req, res) => {
  try {
    const { prompt, latitude, longitude, email, chatId } = req.body;
    const userId = req.user?.id || null;
    const uploadedFiles = req.files || [];

      console.log("Received prompt:", prompt);
      console.log("Location:", latitude, longitude);
      console.log("User ID:", userId);
      console.log("Uploaded file:", uploadedFile);

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


    let queryResult;
    try {
        userquery(prompt, userId, chatId)
    } catch (err) {
        console.error("Error handling user query", err);
        return res.status(500).json({ error: "Failed to generate a response." });
    }

    userquery(prompt, userId, chatId).then((r) => {
        res.json({
            reply: r.reply,
            queries: r.queries, 
        })
    })

    } catch (error) {
        console.error("Submit query error:", error);
        res.status(500).json({ error: error.message });
    }
};
