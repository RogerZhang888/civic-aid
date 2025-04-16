import pgsql from "../config/db";
import { v4 as uuidv4 } from "uuid";

// manually creates a report based on: 
// 1. user_id (from JWT)
// 2. chat_id (chat which report is based on)
// not to be used, for testing only
// @ Roger: either use a JWT in postman, 
// or remove the authMiddleware from the route
export async function createReport(req, res) {

   console.log("MAKING REPORT MANUALLY");

   try {
      const { chat_id } = req.body;
      const userId = req.user.id;

      const chat = await pgsql.query(
         "SELECT * FROM chats WHERE id = $1",
         [chat_id]
      );

      if (chat.length === 0) {
         return res
            .status(403)
            .json({ error: `Chat with id ${chat_id} not found` });
      }

      // run LLM on the entire chat to decide
      // - description
      // - agency
      // - report_confidence
      // @ Sohan

      const newReportId = uuidv4();
      const report_confidence = 0.8; // Placeholder confidence score
      const agency = "NEA"; // Placeholder agency
      const description = "This is a test report"; // Placeholder description

      // Insert report
      const result = await pgsql.query(
         `INSERT INTO reports 
         (id, user_id, chat_id, description, media_url, report_confidence, agency) 
         VALUES ($1, $2, $3, $4, $5) 
         RETURNING *`,
         [newReportId, userId, chat_id, description, "https://some.media.com", report_confidence, agency]
      );

      if (result.length === 0) {
         return res.status(500).json({ error: "Failed to create report" });
      }

      // return the report
      res.status(201).json(result[0]);

   } catch (error) {
      res.status(500).json({ error: error.message });
   }
}

// gets a specific report based on its id (in the URL params)
export async function getReport(req, res) {

   console.log("GETTING SPECIFIC REPORT");

   try {
      const reportId = req.params.id;
      const result = await query(
         "SELECT * FROM reports WHERE id = $1", 
         [reportId]
      );

      if (result.length === 0) {
         return res.status(404).json({ error: "Report not found" });
      }
      
      res.json(result[0]);
   } catch (error) {
      res.status(500).json({ error: error.message });
   }
}

// updates a specific report based on its id (in the URL params)
// and the new status (in the body)
export async function updateReportStatus(req, res) {

   console.log("UPDATING REPORT STATUS");

   try {

      const reportId = req.params.id;
      const { newStatus } = req.body;

      // Add validation for allowed status values
      const allowedStatuses = [
         "pending",
         "in progress",
         "resolved",
         "rejected",
      ];

      if (!allowedStatuses.includes(newStatus)) {
         return res.status(400).json({ error: "Invalid status value" });
      }

      // Explicitly return updated record
      const result = await query(
         `UPDATE reports 
         SET status = $1 
         WHERE id = $2 
         RETURNING *`, 
         [newStatus, reportId]
      );

      if (result.length === 0) {
         return res.status(404).json({ error: "Report not found" });
      }

      res.json(result[0]);
   } catch (error) {
      console.error("Update error:", error);
      res.status(500).json({ error: error.message });
   }
}
