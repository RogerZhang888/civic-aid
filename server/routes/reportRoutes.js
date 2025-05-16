const express = require('express');
const router = express.Router();
const { createReport, getReport, getUserReports, updateReportStatus, getReportSummaries, getDoesUserHaveReward, setIsPublic, getPublicReports } = require('../controllers/reportController');
const authMiddleware = require('../middleware/authMiddleware');

// create a report (TODO: DEPRECATE??)
router.post('/reports', authMiddleware, createReport);

// Get public reports
router.get('/reports/public', authMiddleware, getPublicReports)

// get a specific report based on its id
router.get('/reports/:id', authMiddleware, getReport);

// get all reports made by a user
router.get('/reports', authMiddleware, getUserReports);

// update a specific report based on its id
router.patch('/reports/:id', authMiddleware, updateReportStatus);

// get summarised reports
router.get('/reports_summary', authMiddleware, getReportSummaries);

// check if user is eligible for reward this month
router.get('/reports_reward', authMiddleware, getDoesUserHaveReward);

// Set report is_public
router.post('/reports/set_is_public/:id', authMiddleware, setIsPublic)

module.exports = router;
