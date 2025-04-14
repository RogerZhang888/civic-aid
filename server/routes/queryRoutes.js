const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

const queryController = require('../controllers/queryController');
const auth = require('../middleware/auth');

router.post('/query', auth, upload.array('image'), queryController.submitQuery);

module.exports = router;
