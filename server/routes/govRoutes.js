const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { getGovReports, patchReport } = require('../controllers/govController');

router.get("/gov/reports", authMiddleware, getGovReports)

router.patch("/gov/reports/:id", authMiddleware, patchReport)

module.exports = router