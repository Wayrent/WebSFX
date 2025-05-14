const express = require('express');
const router = express.Router();
const soundController = require('../controllers/soundController');
const { verifyToken } = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

router.get('/', async (req, res, next) => {
  try {
    const result = await soundController.getSounds();
    if (!result.success) {
      return res.status(500).json(result);
    }
    res.status(200).json({
      success: true,
      data: result.data
    });
  } catch (error) {
    next(error);
  }
});

router.get('/search', async (req, res) => {
  try {
    const filters = {
      searchTerm: req.query.q,
      category: req.query.category,
      bitrate: req.query.bitrate,
      quality: req.query.quality,
      sortBy: req.query.sortBy,
      sortOrder: req.query.sortOrder
    };
    
    const result = await soundController.searchSounds(filters);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/upload',
  verifyToken,
  adminMiddleware,
  soundController.upload.single('file'),
  async (req, res, next) => {
    try {
      const result = await soundController.uploadSound(req);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }
);

router.delete('/:id',
  verifyToken,
  adminMiddleware,
  soundController.deleteSound
);

module.exports = router;