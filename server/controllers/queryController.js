const { v4: uuidv4 } = require('uuid');
const pgsql = require("../config/db");
const { callModel } = require('../services/llmService');
const { generate } = require('random-words');

exports.submitQuery = async (req, res) => {

	console.log("RECEIVED REQUEST TO SUBMIT QUERY:");

   try {

      // Extract from req.body (processed by multer) and auth middleware
      const { prompt, chat_id } = req.body;
      const userId = req.user.id;
      
      // Process and store uploaded files (mock URLs for now)
      // const savedMedia = uploadedFiles.map((file) => {
      //    return {
      //       originalName: file.originalname,
      //       mimeType: file.mimetype,
      //       size: file.size,
      //       path: file.path,
      //       url: `/uploads/${file.filename}`, // Using the stored filename
      //    };
      // });

      // let llmResponse;
      // try {
      //    llmResponse = await callModel({
      //       query: prompt,
      //       queryType,
      //       imagePath
      // });
      // } catch (err) {
      //    console.error("LLM model call failed:", err);
      //    return res.status(500).json({ error: "Model failed to generate a response." });
      // }

      // Simulate response for now
      const { answer, confidence } = await simulateLLMResponse();

      // Insert the query into the database (fingers crossed)
      await pgsql.query(
         `INSERT INTO queries
         (user_id, chat_id, user_prompt, media_url, query_location, system_prompt, response, sources, is_valid, to_reply, query_confidence)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
         [
            userId, // user_id
            chat_id, // chat_id
            prompt, // user_prompt
            [], // media_url: no media for now
            null, // query_location: no location for now
            "placeholder system prompt", // system_prompt: placeholder for now
            answer, // response: llm response
            [], // sources: no sources for now
            true, // is_valid: true for now
            true, // to_reply: true for now
            confidence, // query_confidence
         ]
      );

      res.json({
         answer,
      });

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