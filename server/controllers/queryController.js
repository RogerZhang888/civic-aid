const { v4: uuidv4 } = require('uuid');
const pgsql = require("../config/db");
const { callModel } = require('../services/llmService');


exports.submitQuery = async (req, res) => {

	console.log("RECEIVED REQUEST TO SUBMIT QUERY:");

   try {

      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate delay

      // return res.json({ reply: "This is a mock reply", confidence: 0.9 });
      // Extract form fields from req.body (processed by multer)
      const { prompt, latitude, longitude, user_id } = req.body;
      const userId = req.user?.id || user_id || null; // Use authenticated user ID if available

      // File available in req.file
      const uploadedFile = req.file;

      console.log("Received prompt:", prompt);
      console.log("Location:", latitude, longitude);
      console.log("User ID:", userId);
      console.log("Uploaded file:", uploadedFile);

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

      const queryType = "query";
      const imagePath = uploadedFile?.path || null;

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

    console.log(llmResponse)

      // Save query to DB
      // TODO: CHANGE TO NEON DB!!
      // const result = await pgsql.query(
      //    `INSERT INTO Queries
      //  (user_id, chat_id, user_prompt, system_prompt, response, valid, reply, confidence)
      //  VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      //  RETURNING id, created_at`,
      //    [
      //       userId,
      //       chatId,
      //       prompt,
      //       "System prompt placeholder",
      //       llmResponse.answer,
      //       true,
      //       llmResponse.answer,
      //       llmResponse.confidence?.score || 0,
      //    ]
      // );

      // TODO: optionally save file paths in a separate table tied to queryId

      res.json({
         // queryId: result.rows[0].id,
         // reply: llmResponse.answer,
         // confidence: llmResponse.confidence,
         // uploadedMedia: savedMedia,
         // location: latitude && longitude ? { latitude, longitude } : null,
         // email,
         reply: llmResponse
      });
   } catch (error) {
      console.error("Submit query error:", error);
      res.status(500).json({ error: error.message });
   }
};
