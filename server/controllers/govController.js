const pgsql = require("../config/db");

exports.getGovReports = async (req, res) => {
    try {
        if (req.user.permissions !== 'ADMIN') {
            res.status(403).json({ error: "Unauthorised" })
            return
        }

        pgsql.query(`SELECT * FROM reports`).then((result) => {
            res.json(result)
        }).catch((e) => {
            console.error("DB error:", e);
            res.status(500).json({ error: e.message });
        })
    } catch(e) {
        console.error("Update error:", e);
        res.status(500).json({ error: e.message });
    }
}

exports.patchReport = async (req, res) => {
    try {
        if (req.user.permissions !== 'ADMIN') {
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
        const result = await pgsql.query(
            `UPDATE reports 
            SET status = $1 ${newStatus==='resolved'?", resolved_at = CURRENT_TIMESTAMP":""}, remarks = $2
            WHERE id = $3 
            RETURNING *`,
            [newStatus, remarks, reportId]
        );

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