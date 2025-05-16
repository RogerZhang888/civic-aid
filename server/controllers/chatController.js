import pgsql from '../config/db.js';
import { responseParsers } from '../services/parsers.js';

export const startNewChat = async (req, res) => {
    try {
        const userId = req.user.id; // from auth middleware

        console.log(req.body);

        const { id: chatId, title, type, createdAt } = req.body;

        pgsql
            .query(
                `INSERT INTO chats (id, user_id, type, created_at, title) VALUES ($1, $2, $3, $4, $5)`,
                [chatId, userId, type??"unknown", createdAt, title]
            )
            .then(() => {
                console.log("CREATED NEW CHAT", chatId);
                res.status(201).json({ success: true });
            });
    } catch (err) {
        console.error("Failed to create new chat:", err);
        res.status(500).json({ error: "Failed to create new chat" });
    }
};

export const updateChatName = async (req, res) => {
    try {
        const userId = req.user.id; // from auth middleware
        const chatId = req.params.chatId; // from request parameters
        const { title } = req.body; // new title from request body

        await pgsql.query(
            `UPDATE chats SET title = $1 WHERE user_id = $2 AND id = $3`,
            [title, userId, chatId]
        );

        res.status(200).json({ success: true });
    } catch (err) {
        console.error("Failed to update chat name:", err);
        res.status(500).json({ error: "Failed to update chat name" });
    }
};

export const getChatHistory = async (req, res) => {

    console.log("GETTING ALL CHAT HISTORY FOR USER");

    try {
        const userId = req.user.id; // from auth middleware

        const chatRes = await pgsql.query(
            `SELECT * FROM chats WHERE user_id = $1 ORDER BY created_at DESC`,
            [userId]
        );

      console.log(`${chatRes.length} chats found for user ${userId}`);

        res.status(200).json(chatRes);
    } catch (err) {
        console.error("Failed to fetch chat history:", err);
        res.status(500).json({ error: "Failed to fetch user's chat history" });
    }

};

export const getSpecificChatHistory = async (req, res) => {
    console.log("GETTING SPECIFIC CHAT HISTORY FOR USER");

    try {
        const userId = req.user.id; // from auth middleware
        const chatId = req.params.chatId; // from request parameters

        const queriesRes = await pgsql.query(
            `SELECT * FROM queries WHERE user_id = $1 AND chat_id = $2 AND to_reply = true AND is_valid = true ORDER BY created_at ASC`,
            [userId, chatId]
        );

        if (queriesRes.length > 0) {
            console.log(`${queriesRes.length} queries fetched for chatid ${chatId}`);

            let queries = await Promise.all(
                queriesRes.map((q) => {
                    // Extracts required information from DB only
                    return {
                        prompt: q.user_prompt,
                        media: q.media_url.length == 0? undefined:q.media_url[0],
                        response: q.response,
                        timestamp: new Date(q.created_at)
                    }
                }).map(async (q) => {
                    // Parsing check
                    for (let parser in responseParsers) {
                        let parsedRes = responseParsers[parser](q.response)
                        if (parsedRes.valid) {
                            if (parser === "reportParser") {
                                reports = await pgsql.query("SELECT * FROM reports WHERE chat_id = $1", [chatId])
                                return {
                                    prompt: q.prompt,
                                    media: q.media,
                                    ...parsedRes,
                                    confidence: undefined,
                                    reportId: reports? reports[0].id : undefined,
                                    timestamp: q.timestamp
                                }
                            }
                            return {
                                prompt: q.prompt,
                                media: q.media,
                                ...parsedRes,
                                confidence: undefined,
                                timestamp: q.timestamp
                            }
                        }
                    }
                })
            )

            res.status(200).json(queries);
        } else {
            // no queries associated with this chat
            console.log(`No queries fetched for chatid ${chatId}`);

            // don't delete if chat was created recently
            const chat = await pgsql.query(
               `SELECT created_at FROM chats WHERE id = $1`,
               [chatId]
            );
            const chatAge = Date.now() - new Date(chat[0].created_at).getTime();

            if (chatAge < 60000) { // 60 second grace period
               console.log(`chat ${chatId} age less than 60 seconds - will not be deleted`);
               return res.status(200).json([]);
            } else {
               // only delete chat if it wasn't created recently
               console.log(`chat ${chatId} age more than 60 seconds - will be deleted`);
               await pgsql.query(
                   `DELETE FROM chats WHERE user_id = $1 AND id = $2`,
                   [userId, chatId]
               );
               return res.status(404).json({ error: "No queries for this chat" });
            }

        }
    } catch (err) {
        console.error("Failed to fetch specific chat history:", err);
        res.status(500).json({
            error: "Failed to fetch user's specific chat history",
        });
    }
};


export const deleteSpecificChat = async (req, res) => {
    console.log("DELETING SPECIFIC CHAT FOR USER");

    try {
        const userId = req.user.id; // from auth middleware
        const chatId = req.params.chatId; // from request parameters

        await pgsql.query(`DELETE FROM chats WHERE user_id = $1 AND id = $2`, [
            userId,
            chatId,
        ]);
        // the chat id in neon db is set to cascade
        // so all queries related to that chat will be deleted as well

        res.status(200).json({ success: true });
    } catch (err) {
        console.error("Failed to delete specific chat:", err);
        res.status(500).json({
            error: `Failed to delete chat with id ${chatId}`,
        });
    }
};
