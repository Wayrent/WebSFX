const express = require('express');
const router = express.Router();
const soundController = require('../controllers/soundController');
const authMiddleware = require('../middleware/authMiddleware');
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

router.post('/upload',
  authMiddleware,
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

module.exports = router;