const express = require('express');
const router = express.Router();
const { handleDownload } = require('../controllers/downloadController');
const { verifyToken } = require('../middleware/authMiddleware'); // ✅ должно быть именованное

router.get('/:soundId', verifyToken, handleDownload);

module.exports = router;