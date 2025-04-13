const path = require('path');
const { v4: uuidv4 } = require('uuid');
const pool = require("../config/db");
const { callModel } = require('../services/llmService');


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
