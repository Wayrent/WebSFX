const { query } = require('../models/soundModel');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Multer configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../public/uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname);
    cb(null, `sound-${uniqueSuffix}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['audio/mpeg', 'audio/wav', 'audio/x-wav'];
  allowedTypes.includes(file.mimetype) ? cb(null, true) : cb(new Error('Invalid file type. Only MP3/WAV allowed'), false);
};

const upload = multer({ 
  storage,
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter
});

const getSounds = async () => {
  try {
    const result = await query(`
      SELECT id, title, category, tags, bitrate, quality, duration, url 
      FROM sounds
      ORDER BY id DESC
    `);
    
    return {
      success: true,
      data: result.rows
    };
  } catch (error) {
    console.error('Database error:', error);
    return {
      success: false,
      error: 'Failed to fetch sounds from database'
    };
  }
};

const uploadSound = async (req) => {
  try {
    if (!req.file) {
      throw new Error('No file uploaded');
    }

    const { title, category, tags, bitrate, quality, duration } = req.body;
    const filePath = `/uploads/${req.file.filename}`;

    const result = await query(
      `INSERT INTO sounds (title, category, tags, bitrate, quality, duration, url)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [title, category, tags, bitrate, quality, duration, filePath]
    );

    return {
      success: true,
      data: result.rows[0]
    };
  } catch (error) {
    console.error('Upload error:', error);
    throw error;
  }
};

module.exports = {
  upload,
  getSounds,
  uploadSound
};