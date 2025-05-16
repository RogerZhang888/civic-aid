import express from 'express'
const router = express.Router();
import authMiddleware from '../middleware/authMiddleware.js';
import { getTranslation } from '../controllers/translatorController.js';

router.post("/translate", authMiddleware, getTranslation)

export default router