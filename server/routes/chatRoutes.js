const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { startNewChat, getChatHistory } = require('../controllers/chatController');

// Endpoint to start a new chat for a user
router.post('/chats', authMiddleware, startNewChat);

// Endpoint to get all chat histories for a user
// NOTE: RIGHT NOW EACH USER ONLY HAS A SINGLE CHAT
router.get('/chats', authMiddleware, getChatHistory);

module.exports = router;