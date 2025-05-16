import express from 'express';
import authMiddleware from '../middleware/authMiddleware.js';
import { getGovReports, patchReport, getReportSummaries } from '../controllers/govController.js'
const router = express.Router();

router.get("/gov/reports", authMiddleware, getGovReports)

router.patch("/gov/reports/:id", authMiddleware, patchReport)

// get summarised reports
router.get('/gov/reports_summary', authMiddleware, getReportSummaries);

export default router