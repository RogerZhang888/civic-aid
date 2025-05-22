import pgsql from "../config/db.js"
import { createCommentNotification } from "../services/notifications.js"

export const addComment = async (req, res) => {
    const userId = req.user.id
    const reportId = req.body.report_id
    const parentId = req.body.parent_id
    const text = req.body.text

    if (!reportId) {
        res.status(400).json({error: "Report ID required"})
        return
    }
    if (!text) {
        res.status(400).json({error: "Comment text required"})
        return
    }

    if (parentId) {
        let parent = await pgsql.query(`SELECT report_id FROM comments WHERE id=$1`, [parentId])
        if (parent.length === 0 || parent[0].report_id !== reportId) {
            res.status(400).json({error: "Invalid parent ID"})
            return
        }
    }
    pgsql.query(`INSERT INTO comments (report_id, text, parent_id, user_id) VALUES ($1, $2, $3, $4)`, [reportId, text, parentId, userId]).then(() => {
        pgsql.query(`SELECT * FROM reports WHERE id = $1`, [reportId]).then((qr) => {
            if (qr.length === 0) return;
            return createCommentNotification(qr[0].title, reportId, qr[0].user_id)
        }).catch((e) => {
            console.log("Error creating comment notification", e)
        })
        res.json({success: true})
    }).catch((e) => {
        res.status(500).json({error: e})
    })
}

export const getComments = async (req, res) => {
    const reportId = req.params.id

    pgsql.query(`SELECT * FROM comments WHERE report_id = $1`, [reportId]).then((qr) => {
        let adjl = {}
        adjl[-1] = []

        for (let comment of qr) {
            if (!(comment.id in adjl)) {
                adjl[comment.id] = []
            }
            if (comment.parent_id !== null) {
                let parent_id = comment.parent_id
                if (!(parent_id in adjl)) adjl[parent_id] = []
                adjl[parent_id].push(comment.id)
            } else {
                adjl[-1].push(comment.id)
            }
        }

        const generateCommentTreeDFS = (curCommentId) => {
            let curCommentObj = qr.find((e) => e.id === curCommentId) ?? {}
            curCommentObj.children = []
            for (let childId of adjl[curCommentId]) {
                curCommentObj.children.push(generateCommentTreeDFS(childId))
            }

            return curCommentObj
        }

        let result = generateCommentTreeDFS(-1).children

        res.json(result)
    })
}

export const patchComment = async (req, res) => {
    const userId = req.user.id
    const text = req.body.text
    const commentId = req.params.id

    if (!commentId) {
        res.status(400).json({error: "Comment ID required"})
        return
    }
    if (!text) {
        res.status(400).json({error: "Comment text required"})
        return
    }

    pgsql.query(`SELECT * FROM comments WHERE id = $1`, [commentId]).then((qr) => {
        if (qr.length === 0) {
            res.status(400).json({error: "Comment ID not found"})
            return
        } 
        if ((!"ADMIN" in req.user.permissions) && qr[0].user_id !== userId) {
            res.status(403).json({error: "Unauthorised"})
            return
        }

        return pgsql.query(`UPDATE comments SET text = $1 WHERE id = $2`, [text, commentId])
    }).then((qr) => {
        if (!qr) return

        res.json({success: true})
    }).catch((e) => {
        res.status(500).json({error: e})
    })
}

export const deleteComment = async (req, res) => {
    const userId = req.user.id
    const commentId = req.params.id

    if (!commentId) {
        res.status(400).json({error: "Comment ID required"})
        return
    }

    pgsql.query(`SELECT * FROM comments WHERE id = $1`, [commentId]).then((qr) => {
        if (qr.length === 0) {
            res.status(400).json({error: "Comment ID not found"})
            return
        } 
        if ((!"ADMIN" in req.user.permissions) && qr[0].user_id !== userId) {
            res.status(403).json({error: "Unauthorised"})
            return
        }

        return pgsql.query(`UPDATE comments SET text = NULL, deleted = TRUE WHERE id = $1`, [commentId])
    }).then((qr) => {
        if (!qr) return
        if (qr === 0) res.status(400).json({error: "No comment deleted"})
        else res.json({success: true})
    }).catch((e) => {
        res.status(500).json({error: e})
    })
}