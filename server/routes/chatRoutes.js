const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { 
   startNewChat,
   updateChatName,
   getChatHistory, 
   getSpecificChatHistory,
   deleteSpecificChat
} = require('../controllers/chatController');

// Endpoint to start a new chat for a user
router.post('/chats', authMiddleware, startNewChat);

// update name of a chat
router.patch('/chats/:chatId', authMiddleware, updateChatName);

// Endpoint to get all chats for a user
router.get('/chats', authMiddleware, getChatHistory);

// Endpoint to get chat history for a specific chat
router.get('/chats/:chatId', authMiddleware, getSpecificChatHistory);

// Endpoint to delete a chat
router.delete('/chats/:chatId', authMiddleware, deleteSpecificChat);

module.exports = router;