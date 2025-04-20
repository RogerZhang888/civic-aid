const express = require('express');
const router = express.Router();
const { createReport, getReport, getUserReports, updateReportStatus } = require('../controllers/reportController');
const authMiddleware = require('../middleware/authMiddleware');

// create a report (TODO: DEPRECATE??)
router.post('/reports', authMiddleware, createReport);

// get a specific report based on its id
router.get('/reports/:id', authMiddleware, getReport);

// get all reports made by a user
router.get('/reports', authMiddleware, getUserReports);

// update a specific report based on its id
router.patch('/reports/:id', authMiddleware, updateReportStatus);

module.exports = router;
