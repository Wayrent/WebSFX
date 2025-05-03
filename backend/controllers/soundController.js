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
      error: 'Failed to fetch sounds from database',
      data: []
    };
  }
};

const searchSounds = async (filters) => {
  try {
    let queryText = 'SELECT * FROM sounds WHERE 1=1';
    const params = [];
    let paramIndex = 1;

    if (filters.searchTerm) {
      queryText += ` AND (title ILIKE $${paramIndex} OR tags ILIKE $${paramIndex} OR category ILIKE $${paramIndex})`;
      params.push(`%${filters.searchTerm}%`);
      paramIndex++;
    }

    if (filters.category) {
      queryText += ` AND category = $${paramIndex}`;
      params.push(filters.category);
      paramIndex++;
    }

    if (filters.bitrate) {
      queryText += ` AND bitrate = $${paramIndex}`;
      params.push(filters.bitrate);
      paramIndex++;
    }

    if (filters.quality) {
      queryText += ` AND quality = $${paramIndex}`;
      params.push(filters.quality);
      paramIndex++;
    }

    if (filters.sortBy) {
      const sortOrder = filters.sortOrder === 'desc' ? 'DESC' : 'ASC';
      queryText += ` ORDER BY ${filters.sortBy} ${sortOrder}`;
    } else {
      queryText += ' ORDER BY title ASC';
    }

    const result = await query(queryText, params);
    return {
      success: true,
      data: result.rows
    };
  } catch (error) {
    console.error('Search error:', error);
    return {
      success: false,
      error: 'Failed to search sounds'
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

const deleteSound = async (req, res) => {
  const { id } = req.params;
  
  try {
    const soundResult = await query('SELECT url FROM sounds WHERE id = $1', [id]);
    
    if (soundResult.rowCount === 0) {
      return res.status(404).json({ success: false, error: 'Sound not found' });
    }
    
    const sound = soundResult.rows[0];
    const filePath = path.join(__dirname, '../../public', sound.url);
    
    await query('DELETE FROM collection_sounds WHERE sound_id = $1', [id]);
    await query('DELETE FROM sounds WHERE id = $1', [id]);
    
    fs.unlink(filePath, (err) => {
      if (err) console.error('Error deleting file:', err);
    });
    
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error deleting sound:', error);
    res.status(500).json({ success: false, error: 'Failed to delete sound' });
  }
};

module.exports = {
  upload,
  getSounds,
  uploadSound,
  deleteSound,
  searchSounds
};