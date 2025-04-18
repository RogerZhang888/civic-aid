const pgsql = require("../config/db");

exports.startNewChat = async (req, res) => {
   try {
      const userId = req.user.id; // from auth middleware

      console.log(req.body)

      const { id, title, type, createdAt } = req.body;

      await pgsql.query(
         `INSERT INTO chats (id, user_id, type, created_at, title) VALUES ($1, $2, $3, $4, $5)`,
         [id, userId, type, createdAt, title]
      );

      res.status(201).json({ success: true });
   } catch (err) {
      console.error("Failed to create new chat:", err);
      res.status(500).json({ error: "Failed to create new chat" });
   }
};

exports.getChatHistory = async (req, res) => {

   console.log("GETTING ALL CHAT HISTORY FOR USER");

   try {
      const userId = req.user.id; // from auth middleware

      const chatRes = await pgsql.query(
         `SELECT * FROM chats WHERE user_id = $1`,
         [userId]
      );

      console.log(chatRes)

      res.status(200).json(chatRes);
      
   } catch (err) {
      console.error("Failed to fetch chat history:", err);
      res.status(500).json({ error: "Failed to fetch user's chat history" });
   }
};

exports.getSpecificChatHistory = async (req, res) => {

   console.log("GETTING SPECIFIC CHAT HISTORY FOR USER");

   try {
      const userId = req.user.id; // from auth middleware
      const chatId = req.params.chatId; // from request parameters

      const queriesRes = await pgsql.query(
         `SELECT * FROM queries WHERE user_id = $1 AND chat_id = $2`,
         [userId, chatId]
      );

      console.log(queriesRes)

      res.status(200).json(queriesRes);
      
   } catch (err) {
      console.error("Failed to fetch specific chat history:", err);
      res.status(500).json({ error: "Failed to fetch user's specific chat history" });
   }
};

exports.deleteSpecificChat = async (req, res) => {
   console.log("DELETING SPECIFIC CHAT FOR USER");

   try {
      const userId = req.user.id; // from auth middleware
      const chatId = req.params.chatId; // from request parameters

      await pgsql.query(
         `DELETE FROM chats WHERE user_id = $1 AND id = $2`,
         [userId, chatId]
      );
      // the chat id in neon db is set to cascade
      // so all queries related to that chat will be deleted as well

      res.status(200).json({ success: true });
      
   } catch (err) {
      console.error("Failed to delete specific chat:", err);
      res.status(500).json({ error: `Failed to delete chat with id ${chatId}` });
   }
}