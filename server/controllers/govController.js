const pgsql = require("../config/db");
const { parsePermissios } = require("../services/gov");

exports.getGovReports = async (req, res) => {
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
            const permissions = parsePermissios(req.user.permissions)
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

exports.patchReport = async (req, res) => {
    try {
        const permissions = parsePermissios(req.user.permissions)
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

        res.json(result[0]);
        pgsql.query(`UPDATE reports SET status = 'resolved', resolved_at = CURRENT_TIMESTAMP WHERE`)
    } catch(e) {
        console.error("Update error:", e);
        res.status(500).json({ error: e.message });
    }
}