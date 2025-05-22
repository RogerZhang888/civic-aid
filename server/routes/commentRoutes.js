import express from 'express'
const router = express.Router();
import authMiddleware from '../middleware/authMiddleware.js';
import { addComment, deleteComment, getComments, patchComment } from '../controllers/commentsController.js';

router.post("/comment", authMiddleware, addComment)

router.get("/comments/:id", authMiddleware, getComments)

router.patch("/comment/:id", authMiddleware, patchComment)

router.delete("/comment/:id", authMiddleware, deleteComment)

export default router