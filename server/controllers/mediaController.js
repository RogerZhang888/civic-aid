const path = require('path');
const { v4: uuidv4 } = require('uuid');

exports.handleMediaUpload = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    // Temporary local storage (replace with Huawei OBS later)
    const fileId = uuidv4();
    const fileExt = path.extname(req.file.originalname);
    const fileName = `${fileId}${fileExt}`;

    // In production: Save to cloud storage
    const mockUrl = `/uploads/${fileName}`;

    res.json({
      url: mockUrl,
      mediaType: req.file.mimetype.startsWith('image/') ? 'image' : 'video'
    });
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};