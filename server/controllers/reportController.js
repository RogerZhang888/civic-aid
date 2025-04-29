import pgsql from "../config/db.js";
import { v4 as uuidv4 } from "uuid";
import { generate } from "random-words";
import parquet from "parquetjs";
import { callModel } from "../services/llmService.js";
import { systempromptTemplates } from "../services/promptbook.js";
import { responseParsers } from "../services/parsers.js";

export const updateReportsDB = async (params) => {
    let {userId, chatId, title, summary, media, location, agency, recommendedSteps, urgency, confidence} = params
    return pgsql.query(`SELECT * FROM reports WHERE chat_id = $1`, [chatId]).then((res) => {
        if (res.length == 0 || chatId == null) {
            return pgsql.query(`
                INSERT INTO reports 
                (user_id, chat_id, title, description, media_url, incident_location, agency, recommended_steps, urgency, report_confidence)
                VALUES (
                    $1, $2, $3, $4, $5, 
                    CASE
                        WHEN $6::double precision IS NOT NULL AND $7::double precision IS NOT NULL
                        THEN ST_SetSRID(ST_MakePoint($6, $7), 4326)
                        ELSE NULL
                    END,
                    $8, $9, $10, $11
                )
                RETURNING id
            `, [
                userId,
                chatId,
                title,
                summary,
                media,
                location.latitude,
                location.longitude,
                agency,
                recommendedSteps, 
                urgency,
                confidence
            ])
        } else {
            return pgsql.query(`
                UPDATE reports 
                SET description = $1, media_url = $2, agency = $3, recommended_steps = $4, urgency = $5, report_confidence = $6
                WHERE chat_id = $7
                RETURNING id
            `, [
                summary,
                media,
                agency,
                recommendedSteps,
                urgency,
                confidence,
                chatId
            ])
        }
    })
}

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
                .json({
                    error: `No record exists for user ${userId} and chat ${chat_id}`,
                });
        }

        const currentReports = await pgsql.query(
            "SELECT * FROM reports WHERE chat_id = $1 AND user_id = $2",
            [chat_id, userId]
        );

        if (currentReports.length > 0) {
            return res
                .status(403)
                .json({
                    error: `A report already exists for user ${userId} and chat ${chat_id}`,
                });
        }

        // run LLM on the entire chat to decide
        // - description
        // - agency
        // - report_confidence
        // @ Sohan

        const newReportId = uuidv4();
        const agency = "NEA"; // Placeholder agency
        const title = generate({ exactly: 4, join: " " }); // Placeholder title
        const description = generate({ exactly: 100, join: " " }); // Placeholder description

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
            return res
                .status(404)
                .json({ error: `Report ${reportId} not found` });
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
        const result = await pgsql.query(`
            SELECT
               id,
               user_id,
               chat_id,
               title,
               description,
               media_url,
               ST_X(incident_location::geometry) as longitude,
               ST_Y(incident_location::geometry) as latitude,
               agency,
               recommended_steps,
               urgency,
               report_confidence,
               status,
               created_at,
               resolved_at
            FROM
               reports
            WHERE 
               user_id = $1`,
            [userId]
        );

        if (result.length === 0) {
            return res
                .status(404)
                .json({ error: `No reports found for user ${userId}` });
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
            return res
                .status(404)
                .json({ error: `Report ${reportId} not found` });
        }

        res.json(result[0]);
    } catch (error) {
        console.error("Update error:", error);
        res.status(500).json({ error: error.message });
    }
}

export async function getReportSummaries(req, res) {
    const reportParquetSchema = new parquet.ParquetSchema({
        id: { type: "UTF8" },
        description: { type: "UTF8" },
    });
    const reports = await pgsql.query("SELECT * FROM reports");

    const groupedReports = Object.entries(
        reports.reduce((acc, report) => {
            if (!acc[report.agency]) {
                acc[report.agency] = [];
            }
            acc[report.agency].push(report);
            return acc;
        }, {})
    ).map(([agency, reports]) => ({
        agency,
        reports,
    }));

    let summaries = []
    for (let reportGroup of groupedReports) {
        let path = `${reportGroup.agency}-${Date.now()}.parquet`;
        let curParquetWriter = await parquet.ParquetWriter.openFile(
            reportParquetSchema,
            `./parquets/${path}`
        );
        for (let report of reportGroup.reports) {
            await curParquetWriter.appendRow({
                id: report.id,
                description: report.description,
            });
        }
        await curParquetWriter.close();

        summaries.push(
            fetch(`${process.env.MODELURL}/api/callsummariser`, {
                method:"POST",
                body:JSON.stringify({parquet_path: path}),
                headers:{
                    'Content-Type': 'application/json'
                }
            }).then((r) => {
                return r.json()
            }).then((r) => {
                return {
                    agency:reportGroup.agency,
                    response: r
                }
            })
        )
    }

    Promise.all(summaries).then((r) => {
        console.log("SUMMARY", r)
        let compiledSummary = []
        for (let summary of r) {
            console.log(`Processing summary for ${summary.agency}`, summary.response)
            if (summary.response.length == 0) continue
            for (let subgroup of summary.response) {
                compiledSummary.push(subgroup.map((reportId) => reports.find((e) => e.id == reportId)))
            }
        }
        return compiledSummary
    }).then((reportGroups) => {
        let finalReportPromises = []
        for (let reportGroup of reportGroups) {
            const reportQuery = "---\n---\nREPORTS\n" + reportGroup.map((report, i) => `Report ${i}:\n\`\`\`\n${JSON.stringify({
                summary:report.description, 
                recommendedSteps:report.recommended_steps,
                agency:report.agency,
                confidence:report.report_confidence,
                urgency:report.urgency
            })}\n\`\`\`\n`).join("---\n")
            finalReportPromises.push(callModel({query:reportQuery, prompt:systempromptTemplates.checkReportSummaryTemplate(reportQuery), model:"basic"}))
        }
        return Promise.all(finalReportPromises)
    }).then((r) => {
        const reports = r.map((raw) => responseParsers.reportParser(raw))

        let dbUpdatePromises = []
        for (let report of reports) {
            dbUpdatePromises.push(updateReportsDB({
                userId: -2,
                chatId: null,
                title: `Summarised report ${new Date().toISOString()} ${report.agency}`,
                summary: report.summary,
                media: [],
                location: {longitude:null, latitude:null},
                agency: report.agency,
                recommendedSteps: report.recommendedSteps,
                urgency: report.urgency,
                confidence: report.confidence
            }))
        }

        Promise.all(dbUpdatePromises).then((r) => {
            res.json(reports)
        }).catch((e) => {
            console.log("Error updating reports DB", e)
            res.status(500).json({ error: e.message });
        })
    })
    // res.json(Promise.all(summaries))
}

export async function getDoesUserHaveReward(req, res) {
   const now = new Date();
   const userId = req.user.id;
   console.log(`CHECKING IF USER ${userId} IS ELIGIBLE FOR REWARD THIS MONTH (${now.toDateString()})`);

   try {

       const firstDayPrevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
       const firstDayPrevMthFormatted = [
         firstDayPrevMonth.getFullYear(),
         String(firstDayPrevMonth.getMonth() + 1).padStart(2, '0'),
         '01'
       ].join('-');

       const result = await pgsql.query(
           "SELECT * FROM awards WHERE month = $1",
           [firstDayPrevMthFormatted]
       );

       if (result.length === 0) {
           return res
               .status(404)
               .json({ error: `Reward data missing for month of ${firstDayPrevMthFormatted}` });
       }

       console.log("Rewarded users: id " + result[0].rewarded_users);

       res.json(result[0].rewarded_users.includes(userId));

   } catch (error) {
       res.status(500).json({ error: error.message });
   }
}