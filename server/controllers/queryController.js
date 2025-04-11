const path = require('path');
const { v4: uuidv4 } = require('uuid');
const pool = require("../config/db");

// Placeholder LLM response
const mockLLMResponse = (prompt) => {
  return {
    raw: `${prompt} (simulated response)`,
    processed: "This is a placeholder response. LLM integration pending.",
    confidence: 0.85
  };
};

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

    // Simulate LLM response
    const llmResponse = mockLLMResponse(prompt);

    // Save query to DB
    const result = await pool.query(
      `INSERT INTO Queries 
       (user_id, user_prompt, system_prompt, response, valid, reply, confidence) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) 
       RETURNING id, created_at`,
      [
        userId,
        prompt,
        "System prompt placeholder",
        llmResponse.raw,
        true,
        llmResponse.processed,
        llmResponse.confidence
      ]
    );

    // TODO: optionally save file paths in a separate table tied to queryId

    res.json({
      queryId: result.rows[0].id,
      reply: llmResponse.processed,
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
