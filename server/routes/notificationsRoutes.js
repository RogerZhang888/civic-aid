import express from 'express'
const router = express.Router();
import authMiddleware from '../middleware/authMiddleware.js';
import { getNotifications, setNotificationsRead } from '../controllers/notificationsController.js';

router.get("/notifications", authMiddleware, getNotifications)

router.post("/notifications/:id", authMiddleware, setNotificationsRead)

export default router