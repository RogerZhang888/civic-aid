const { v4: uuidv4 } = require("uuid");
const pgsql = require("../config/db");

exports.startNewChat = async (req, res) => {
   try {
      const userId = req.user.id; // from auth middleware

      const newChatId = uuidv4();

      const result = await pgsql.query(
         `INSERT INTO chats (id, user_id, type) VALUES ($1, $2, $3) RETURNING *`,
         [newChatId, userId, 'unknown']
      );

      if (result.length === 0) {
         return res.status(500).json({ error: "Failed to create new chat" });
      }

      res.status(201).json(result[0]);
   } catch (err) {
      console.error("Failed to create new chat:", err);
      res.status(500).json({ error: "Failed to create new chat" });
   }
};

exports.getChatHistory = async (req, res) => {
   try {
      const userId = req.user.id; // from auth middleware
      // const chatId = req.params.chatId; // get chatId from request parameters
      // right now each user only has a single chat
      // (TODO) WE WILL IMPLEMENT MULTIPLE CHATS ONCE THIS WORKS

      const chatRes = await pgsql.query(
         `SELECT * FROM chats WHERE user_id = $1`,
         [userId]
      );

      if (chatRes.length === 0) {
         return res.status(404).json({ error: "No chats found" });
      };

      const chatId = chatRes[0].id;

      const queriesRes = await pgsql.query(
         `SELECT * FROM queries WHERE chat_id = $1 ORDER BY timestamp DESC`,
         [chatId]
      );

      if (queriesRes.length === 0) {
         return res.status(404).json({ error: `No queries found for chat id ${chatId}` });
      }

      res.status(200).json(queriesRes);
      
   } catch (err) {
      console.error("Failed to fetch chat history:", err);
      res.status(500).json({ error: "Failed to fetch chat history" });
   }
};
