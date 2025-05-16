import express from 'express';
import authMiddleware from '../middleware/authMiddleware.js';
import {
  startNewChat,
  updateChatName,
  getChatHistory,
  getSpecificChatHistory,
  deleteSpecificChat
} from '../controllers/chatController.js';

const router = express.Router();

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

export default router;