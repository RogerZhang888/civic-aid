const express = require('express');
const multer = require('multer');
const queryController = require('../controllers/queryController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

let storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads')
    },
    filename: function (req, file, cb) {
        let extArray = file.mimetype.split("/");
        let extension = extArray[extArray.length - 1];
        cb(null, file.fieldname + file.originalname.replace(/[\s_-]/g, '').substring(0, Math.min(10, file.originalname.replace(/\s_-/g, '').length)) + '-' + Date.now()+ '.' +extension)
    }
})

const upload = multer({ storage: storage });

router.post('/query', authMiddleware, upload.single('image'), queryController.submitQuery);

module.exports = router;
