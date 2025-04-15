const express = require('express');
const multer = require('multer');
const queryController = require('../controllers/queryController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

router.post('/query', authMiddleware, upload.single('image'), queryController.submitQuery);

module.exports = router;
