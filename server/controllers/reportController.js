const pool = require("../config/db");

exports.createReport = async (req, res) => {
  try {
    const { queryId, description, link, agency } = req.body;
    const userId = req.user.id;

    // Validate query belongs to user
    const queryCheck = await pool.query(
      "SELECT * FROM Queries WHERE id = $1 AND user_id = $2",
      [queryId, userId]
    );

    if (queryCheck.rows.length === 0) {
      return res.status(403).json({ error: "Query not found or access denied" });
    }

    // Insert report
    const result = await pool.query(
      `INSERT INTO Reports 
       (user_id, query_id, description, link, agency, confidence) 
       VALUES ($1, $2, $3, $4, $5, 
         (SELECT confidence FROM Queries WHERE id = $2)
       ) 
       RETURNING *`,
      [userId, queryId, description, link, agency]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getReport = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      "SELECT * FROM Reports WHERE id = $1",
      [id]
    );
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateReportStatus = async (req, res) => {
  try {
    // Get ID from URL params instead of body
    const reportId = req.params.id; // Changed from req.body.reportId
    const { status } = req.body;

    // Add validation for allowed status values
    const allowedStatuses = ['pending', 'in_progress', 'resolved', 'rejected'];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ error: "Invalid status value" });
    }

    // Explicitly return updated record
    const result = await pool.query(
      `UPDATE Reports 
       SET status = $1 
       WHERE id = $2 
       RETURNING *`,  // <-- Crucial: Add RETURNING *
      [status, reportId] // Parameter order matches $1/$2
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Report not found" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Update error:", error); // Add logging
    res.status(500).json({ error: error.message });
  }
};

