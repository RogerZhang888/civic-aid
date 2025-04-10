const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const auth = require('../middleware/auth');

router.post('/reports', auth, reportController.createReport);
router.get('/reports/:id', auth, reportController.getReport);
router.patch('/reports/:id', auth, reportController.updateReportStatus);

module.exports = router;
