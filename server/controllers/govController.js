import pgsql from '../config/db.js';
import { parsePermissions } from '../services/gov.js';
import parquet from "parquetjs";
import { callModel } from "../services/llmService.js";
import { systempromptTemplates } from "../services/promptbook.js";
import { responseParsers } from "../services/parsers.js";
import { createReportNotification } from '../services/notifications.js';

export const getGovReports = async (req, res) => {
    try {
        const includeResolved = req.query.include_resolved == 1
        if (req.user.permissions.includes("ADMIN")) {
            pgsql.query(`SELECT * FROM reports ${includeResolved?"":"WHERE status != 'resolved'"}`).then((result) => {
                res.json(result)
            }).catch((e) => {
                console.error("DB error:", e);
                res.status(500).json({ error: e.message });
            })
        } else {
            const permissions = parsePermissions(req.user.permissions)
            const qlist = []

            if (permissions.length === 0) {
                res.status(403).json({error: "Unauthorised"})
            }

            for (let permission of permissions) {
                if (permission.role === 'ADMIN') qlist.push(pgsql.query(`SELECT * FROM reports WHERE agency = $1 ${includeResolved?"":"AND status != 'resolved'"}`, [permission.agency]))
            }

            Promise.all(qlist).then((r) => {
                return res.json(r.flat())
            })
        }
        
    } catch(e) {
        console.error("Update error:", e);
        res.status(500).json({ error: e.message });
    }
}

export const patchReport = async (req, res) => {
    try {
        const permissions = parsePermissions(req.user.permissions)
        if ((!req.user.permissions.includes('ADMIN')) && permissions.length === 0) {
            res.status(403).json({ error: "Unauthorised" })
            return
        }

        const reportId = req.params.id;
        const { newStatus, remarks } = req.body;

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

        const result = req.user.permissions.includes('ADMIN') ? await pgsql.query(
            `UPDATE reports 
            SET status = $1 ${newStatus==='resolved'?", resolved_at = CURRENT_TIMESTAMP":""}, remarks = $2
            WHERE id = $3
            RETURNING *`,
            [newStatus, remarks, reportId]
        ) : await pgsql.query(
            `SELECT agency FROM reports WHERE id = $1`,
            [reportId]
        ).then((r) => {
            console.log("FIND BY AGENCY", r)
            if (r.length === 0) return []
            if (permissions.find((e) => e.agency === r[0].agency)) {
                return pgsql.query(
                    `UPDATE reports 
                    SET status = $1 ${newStatus==='resolved'?", resolved_at = CURRENT_TIMESTAMP":""}, remarks = $2
                    WHERE id = $3
                    RETURNING *`,
                    [newStatus, remarks, reportId]
                )
            } else {
                return []
            }
        })

        if (result.length === 0) {
            return res
                .status(404)
                .json({ error: `Report ${reportId} not found` });
        }

        createReportNotification(result[0].title, result[0].id, result[0].status, result[0].user_id)
        
        res.json(result[0]);
    } catch(e) {
        console.error("Update error:", e);
        res.status(500).json({ error: e.message });
    }
}

export async function getReportSummaries(req, res) {
    const permissions = parsePermissions(req.user.permissions)
    if ((!req.user.permissions.includes('ADMIN')) && permissions.length === 0) {
        res.status(403).json({ error: "Unauthorised" })
        return
    }

    const reportParquetSchema = new parquet.ParquetSchema({
        id: { type: "UTF8" },
        description: { type: "UTF8" },
    });
    
    let reports = []
    if (req.user.permissions.includes("ADMIN")) {
        reports = await pgsql.query(`SELECT * FROM reports`).catch((e) => {
            console.error("DB error:", e);
            res.status(500).json({ error: e });
        })
    } else {
        const permissions = parsePermissions(req.user.permissions)
        const qlist = []

        if (permissions.length === 0) {
            res.status(403).json({error: "Unauthorised"})
        }

        for (let permission of permissions) {
            if (permission.role === 'ADMIN') qlist.push(pgsql.query(`SELECT * FROM reports WHERE agency = $1`, [permission.agency]))
        }

        reports = await Promise.all(qlist).then((r) => {
            return res.json(r.flat())
        })
    }

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
            }).catch((e) => {
                res.status(500).json({error: e})
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
            finalReportPromises.push(
                callModel({query:reportQuery, prompt:systempromptTemplates.checkReportSummaryTemplate(reportQuery), model:"basic"}).then((newReport) => {
                    return {
                        newReport: responseParsers.reportParser(newReport),
                        sourceReports: reportGroup.map((report) => report.id)
                    }
                }).catch((e) => {
                    return res.status(500).json({error: "Invalid summarised report"})
                })
            )
        }
        return Promise.all(finalReportPromises)
    }).then((r) => {
        res.json(r)
    }).catch((e) => {
        res.status(500).json({error: e})
    })
    // res.json(Promise.all(summaries))
}