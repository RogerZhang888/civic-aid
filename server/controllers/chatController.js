// allows frontend to request a chat_id before sending any queries

const { v4: uuidv4 } = require('uuid');
const pool = require('../config/db');

exports.startNewChat = async (req, res) => {
  try {
    const userId = req.user.id; // assumes auth middleware is in place
    const chatId = uuidv4();

    await pool.query(
      `INSERT INTO Chats (id, user_id) VALUES ($1, $2)`,
      [chatId, userId]
    );

    res.status(201).json({ chatId });
  } catch (err) {
    console.error('Failed to create new chat:', err);
    res.status(500).json({ error: 'Failed to create new chat' });
  }
};
