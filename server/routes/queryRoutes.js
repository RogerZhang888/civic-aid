const express = require('express');
const multer = require('multer');
const queryController = require('../controllers/queryController');
const auth = require('../middleware/auth');

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

router.post('/query', auth, upload.single('image'), queryController.submitQuery);

module.exports = router;
