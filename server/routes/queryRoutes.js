const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

const queryController = require('../controllers/queryController');
const auth = require('../middleware/auth');

// Upload multiple images as 'images'
router.post('/queries', auth, upload.array('images'), queryController.submitQuery);

module.exports = router;
