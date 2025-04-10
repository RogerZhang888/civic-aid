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
    const userId = req.user?.id || null; // Optional: fallback if auth not ready
    const uploadedFiles = req.files || [];

    console.log("Received prompt:", prompt);
    console.log("Location:", latitude, longitude);
    console.log("Email:", email);
    console.log("Uploaded files:", uploadedFiles);

    // Simulate LLM processing
    const llmResponse = mockLLMResponse(prompt);

    // TODO: Optional — Save file paths to a related table if needed

    // Save to database
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

    res.json({
      queryId: result.rows[0].id,
      reply: llmResponse.processed,
      confidence: llmResponse.confidence
    });

  } catch (error) {
    console.error("Submit query error:", error);
    res.status(500).json({ error: error.message });
  }
};
