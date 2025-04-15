const path = require('path');
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
    parseTypeDecision: (res) => {
        // QUESTION, REPORT + CONFIDENCE, VALID
        return res
    },
    defaultParser: (res) => {
        // Just standard reply + confidence parser
        return res
    }
}

const updateQueriesDB = (params)  => {
    params = {userId, chatId, userprompt, media, systemprompt, response, isValid, toReply, confidence}
    console.log("Updated DB", )
}

// TOOD: media support
function userquery(userprompt, userId, chatId) {
    async function queryLLM(query, parseResponse=responseParsers.defaultParser, reply='NEVER') {
        // reply enum: NEVER, ALWAYS, HIGH: 
        // NEVER means this output is never used as a reply, 
        // ALWAYS means this output will always be used as a reply, 
        // HIGH means this output will be used as a reply only when the confidence is HIGH

        // TODO: check whats the arguments required etc for calling model
        let parsedRes
        while (!parsedRes?.valid) {
            parsedRes = await callModel(query, getChatHistory(chatId)).then((res) => {
                parsed = parseResponse(res)
                updateQueriesDB({userId, chatId, userprompt, systemprompt:query, response:parsed.reply, isValid: parsed.valid, toReply:reply=='ALWAYS'?parsed.reply:(reply='HIGH'&&parsed.confidence==HIGH)?parsed.reply:null, confidence:parsed.confidence})
                return parsed
            }).catch((err) => {
                console.log('Error calling model', err)
                return {valid:false}
            })
        }
        // TOOD: better way to reprompt for invalid output format

        return parsedRes
    }

    let reply
    while (!reply) {
        // CHAIN prompts until a reply condition is met
        // TODO: queryLLM function missing parser specifications
        if (chat[chatId].type == UNDECIDED) {
            systemprompt = systempromptTemplates.getTypeDecisionTemplate(userprompt)
            response = queryLLM(systemprompt, responseParsers.parseTypeDecision, 'NEVER')
            
            if (response.confidence == LOW || response.confidence == MED) {
                systemprompt = systempromptTemplates.clarifyTypeDecisionTemplate(userprompt)
                response = queryLLM(systemprompt, responseParsers.defaultParser, 'ALWAYS')
                reply = response.reply
            } else if (response.confidence == HIGH) {
                chat[chatId].type = response.type
            }
        }

        if (chat[chatId].type == REPORT) {
            let systemprompt = systempromptTemplates.getReportTemplate(userprompt)
            response = queryLLM(systemprompt, responseParsers.defaultParser, 'HIGH')

            if (response.confidence == LOW) {
                systemprompt = systempromptTemplates.clarifyReportTemplateLow(userprompt)
                response = queryLLM(systemprompt, responseParsers.defaultParser, 'ALWAYS')
                reply=response.reply
            } else if (response.confidence == MED) {
                systemprompt = systempromptTemplates.clarifyReportTemplateMed(userprompt)
                response = queryLLM(systemprompt, responseParsers.defaultParser, 'ALWAYS')
                reply = response.reply 
            } else if (response.confidence == HIGH) {
                // By the original prompt, this should be a report format already?? TODO: verify this
                reply = response.reply 
            }
        }

        if (chat[chatId].type == QUESTION) {
            let systemprompt = systempromptTemplates.getQuestionTemplate(userprompt)
            response = queryLLM(systemprompt, responseParsers.defaultParser, 'HIGH')

            if (response.confidence == LOW) {
                systemprompt = systempromptTemplates.clarifyQuestionTemplateLow(userprompt)
                response = queryLLM(systemprompt, responseParsers.defaultParser, 'ALWAYS')
                reply = response.reply 
            } else if (response.confidence == MED) {
                systemprompt = systempromptTemplates.clarifyQuestionTemplateMed(userprompt)
                response = queryLLM(systemprompt, responseParsers.defaultParser, 'ALWAYS')
                reply = response.reply 
            } else if (response.confidence == HIGH) {
                reply = response.reply 
            }
        }
    }
    
}

exports.submitQuery = async (req, res) => {
  try {
    const { prompt, latitude, longitude, email } = req.body;
    const userId = req.user?.id || null;
    const uploadedFiles = req.files || [];

    console.log("Received prompt:", prompt);
    console.log("Location:", latitude, longitude);
    console.log("Email:", email);
    console.log("Uploaded files:", uploadedFiles);

    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" });
    }

    // Process and store uploaded files (mock URLs for now)
    const savedMedia = uploadedFiles.map(file => {
      const ext = path.extname(file.originalname);
      const id = uuidv4();
      const filename = `${id}${ext}`;
      const mockUrl = `/uploads/${filename}`;
      return {
        originalName: file.originalname,
        mimeType: file.mimetype,
        url: mockUrl,
      };
    });

    const queryType = 'query'; // or 'report' — set based on context or user input
    const imagePath = uploadedFiles.length > 0 ? uploadedFiles[0].path : null;


    let llmResponse;
    try {
      llmResponse = await callModel({
        query: prompt,
        queryType,
        imagePath
      });
    } catch (err) {
      console.error("LLM model call failed:", err);
      return res.status(500).json({ error: "Model failed to generate a response." });
    }


    // Save query to DB
    const result = await pool.query(
      `INSERT INTO Queries 
       (user_id, chat_id, user_prompt, system_prompt, response, valid, reply, confidence) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
       RETURNING id, created_at`,
      [
        userId,
        chatId,
        prompt,
        "System prompt placeholder",
        llmResponse.answer,
        true,
        llmResponse.answer,
        llmResponse.confidence?.score || 0
      ]
    );
    

    // TODO: optionally save file paths in a separate table tied to queryId

    res.json({
      queryId: result.rows[0].id,
      reply: llmResponse.answer,
      confidence: llmResponse.confidence,  
      uploadedMedia: savedMedia,
      location: latitude && longitude ? { latitude, longitude } : null,
      email,
    });

  } catch (error) {
    console.error("Submit query error:", error);
    res.status(500).json({ error: error.message });
  }
};
