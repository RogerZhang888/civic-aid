import pgsql from "../config/db.js";
import { v4 as uuidv4 } from "uuid";
import { generate } from "random-words";

export const updateReportsDB = async (params) => {
    let {userId, chatId, title, summary, media, location, agency, recommendedSteps, urgency, confidence} = params
    return pgsql.query(`SELECT * FROM reports WHERE chat_id = $1`, [chatId]).then((res) => {
        if (res.length == 0 || chatId == null) {
            return pgsql.query(`
                INSERT INTO reports 
                (user_id, chat_id, title, description, media_url, incident_address, agency, recommended_steps, urgency, report_confidence)
                VALUES (
                    $1, $2, $3, $4, $5, 
                    $6, $7,
                    $8, $9, $10
                )
                RETURNING id
            `, [
                userId,
                chatId,
                title,
                summary,
                media,
                location,
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
    res.status(400).json({error: "Route deprecated"})
    return

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
        const userId = req.user.id
        const result = await pgsql.query(
            "SELECT * FROM reports WHERE id = $1",
            [reportId]
        );

        console.log("REPORT", result)
        if (result.length === 0) {
            return res
                .status(404)
                .json({ error: `Report ${reportId} not found` });
        }
        if ((!result[0].is_public) && result[0].user_id != userId) {
            return res.status(403).json({error:"Unauthorised"})
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
               *
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
    // TODO: Check own route
    res.json({ error: "Route deprecated" })
    return
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
      console.log("Failed to check if user is eligible for reward: " + error);
       res.status(500).json({ error: error.message });
   }
}

export async function setIsPublic(req, res) {
    try {
        const userId = req.user.id;
        const reportId = req.params.id;
        const isPublic = req.body.is_public;

        if (!reportId) {
            res.status(400).json({error: "Report ID not provided"})
            return
        } 
        if (isPublic === undefined) {
            res.status(400).json({error: "is_public not provided"})
            return
        }

        pgsql.query(`UPDATE reports SET is_public = $1 WHERE id = $2 AND user_id = $3 RETURNING *`, [isPublic, reportId, userId]).then((qr) => {
            if (qr.length === 0) {
                res.status(500).json({error: "No matching report found in database"})
                return
            } 
            res.json({success:true})
        })
    } catch(e) {
        res.status(500).json({error: e})
    }
}

export async function getPublicReports(req, res) {
    try {
        pgsql.query("SELECT * FROM reports WHERE is_public = TRUE").then((qr) => {
            res.json(qr)
        })
    } catch (e) {
        return res.status(500).json({error: e})
    }
}

const updateUpvoteCount = async (reportId) => {
    return pgsql.query(`
        WITH upvote_cte AS (
            SELECT report_id, COUNT(*) AS cnt
            FROM upvotes
            WHERE report_id = $1
            GROUP BY report_id
        )
        UPDATE reports
        SET upvote_count = upvote_cte.cnt
        FROM upvote_cte
        WHERE reports.id = upvote_cte.report_id
        RETURNING reports.upvote_count;    
    `, [reportId])
}

export async function upvote(req, res) {
    const userId = req.user.id;
    const reportId = req.params.id;

    if (!reportId) {
        res.status(400).json({error: "Report ID not provided"})
        return
    }

    try {
        pgsql.query(`SELECT * FROM upvotes WHERE report_id = $1 AND user_id = $2`, [reportId, userId]).then((qr) => {
            if (qr.length !== 0) {
                res.status(400).json({error: "Report already upvoted"})
                return
            } else {
                return pgsql.query(`INSERT INTO upvotes (report_id, user_id) VALUES ($1, $2)`, [reportId, userId])
            }
        }).then((qr) => {
            if (!qr) return
            return updateUpvoteCount(reportId)
        }).then((qr) => {
            if (!qr) return
            res.json(qr[0])
        }).catch((e) => {
            res.status(500).json({error: e})
        })
    } catch (e) {
        res.status(500).json({error: e})
    }
}

export async function undoUpvote(req, res) {
    const userId = req.user.id;
    const reportId = req.params.id;

    if (!reportId) {
        res.status(400).json({error: "Report ID not provided"})
        return
    }

    try {
        pgsql.query(`DELETE FROM upvotes WHERE report_id = $1 AND user_id = $2`, [reportId, userId]).then((qr) => {
            if (qr === 0) {
                res.status(400).json({error: "No upvote to undo"})
                return
            } else {
                return updateUpvoteCount(reportId)
            }
        }).then((qr) => {
            if (!qr) return
            res.json(qr[0])
        }).catch((e) => {
            res.status(500).json({error: e})
        })
    } catch (e) {
        res.status(500).json({error: e})
    }
}

export async function getUpvoteStatus(req, res) {
    const userId = req.user.id;
    pgsql.query("SELECT report_id FROM upvotes WHERE user_id = $1", [userId]).then((qr) => {
        res.json(qr.map(e => e.report_id))
    }).catch((e) => {
        res.status(500).json({error: e})
    })
}