const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { startNewChat } = require('../controllers/chatController');

// Endpoint to start a new chat
router.post('/chats', auth, startNewChat);

module.exports = router;
