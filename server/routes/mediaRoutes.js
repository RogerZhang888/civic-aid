const express = require('express');
const multer = require('multer');
const mediaController = require('../controllers/mediaController'); // Import your mediaController
const upload = multer({ dest: 'uploads/' }); // Temporary local storage directory (adjust if needed)

const router = express.Router();

// Route for handling media uploads
router.post('/upload', upload.single('file'), mediaController.handleMediaUpload);

module.exports = router;
