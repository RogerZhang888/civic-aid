import pgsql from "../config/db.js";
import { v4 as uuidv4 } from 'uuid';
import { generate } from "random-words";

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
         "SELECT * FROM chats WHERE id = $1 AND user_id = $2",
         [chat_id, userId]
      );

      if (chat.length === 0) {
         return res
            .status(403)
            .json({ error: `No record exists for user ${userId} and chat ${chat_id}` });
      }

      const currentReports = await pgsql.query(
         "SELECT * FROM reports WHERE chat_id = $1 AND user_id = $2",
         [chat_id, userId]
      );

      if (currentReports.length > 0) {
         return res.status(403).json({ error: `A report already exists for user ${userId} and chat ${chat_id}` });
      }

      // run LLM on the entire chat to decide
      // - description
      // - agency
      // - report_confidence
      // @ Sohan

      const newReportId = uuidv4();
      const agency = "NEA"; // Placeholder agency
      const title = generate({ exactly: 4, join: ' ' }); // Placeholder title
      const description = generate({ exactly: 100, join: ' ' }); // Placeholder description

      // Insert report
      const result = await pgsql.query(
         `INSERT INTO reports 
         (id, user_id, chat_id, title, description, media_url, incident_location, agency, recommended_steps, urgency, report_confidence, status) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) 
         RETURNING *`,
         [
            newReportId, // id
            userId, // user_id
            chat_id, // chat_id
            title, // title: placeholder for now
            description, // description: placeholder for now
            [], // media_url: no media for now
            null, // incident_location: no location for now
            agency, // agency: placeholder for now
            [], // recommended_steps: no steps for now
            0.6666, // urgency: placeholder for now
            0.5555, // report_confidence: placeholder for now
            "pending", // status: pending by default
         ]
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
      const result = await pgsql.query(
         "SELECT * FROM reports WHERE id = $1", 
         [reportId]
      );

      if (result.length === 0) {
         return res.status(404).json({ error: `Report ${reportId} not found` });
      }
      
      res.json(result[0]);
   } catch (error) {
      res.status(500).json({ error: error.message });
   }
}

// gets all reports made by a user
export async function getUserReports(req, res) {

   console.log("GETTING ALL USER REPORTS");

   try {
      const userId = req.user.id;
      const result = await pgsql.query(
         "SELECT * FROM reports WHERE user_id = $1", 
         [userId]
      );

      if (result.length === 0) {
         return res.status(404).json({ error: `No reports found for user ${userId}` });
      }

      res.json(result);
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
      const result = await pgsql.query(
         `UPDATE reports 
         SET status = $1 
         WHERE id = $2 
         RETURNING *`, 
         [newStatus, reportId]
      );

      if (result.length === 0) {
         return res.status(404).json({ error: `Report ${reportId} not found` });
      }

      res.json(result[0]);
   } catch (error) {
      console.error("Update error:", error);
      res.status(500).json({ error: error.message });
   }
}
