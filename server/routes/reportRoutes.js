import express from 'express';
import {
  createReport,
  getReport,
  getUserReports,
  updateReportStatus,
  getDoesUserHaveReward,
  setIsPublic,
  getPublicReports,
  upvote,
  undoUpvote,
  getUpvoteStatus
} from '../controllers/reportController.js';
import authMiddleware from '../middleware/authMiddleware.js';
const router = express.Router();

// create a report (TODO: DEPRECATE??)
router.post('/reports', authMiddleware, createReport);

// Get public reports
router.get('/reports/public', authMiddleware, getPublicReports)

// Check upvotes
router.get('/reports/upvote_status', authMiddleware, getUpvoteStatus)

// get a specific report based on its id
router.get('/reports/:id', authMiddleware, getReport);

// get all reports made by a user
router.get('/reports', authMiddleware, getUserReports);

// update a specific report based on its id
router.patch('/reports/:id', authMiddleware, updateReportStatus);

// check if user is eligible for reward this month
router.get('/reports_reward', authMiddleware, getDoesUserHaveReward);

// Set report is_public
router.post('/reports/set_is_public/:id', authMiddleware, setIsPublic)

// Upvote
router.post('/reports/upvote/:id', authMiddleware, upvote)

// Unupvote
router.post('/reports/undo_upvote/:id', authMiddleware, undoUpvote)

export default router
