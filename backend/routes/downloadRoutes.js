const express = require('express');
const { verifyTokenOptional } = require('../middleware/authMiddleware'); // ← новый middleware
const downloadController = require('../controllers/downloadController');

const router = express.Router();

// Гости и авторизованные могут скачивать → проверка внутри контроллера
router.get('/:soundId', verifyTokenOptional, downloadController.handleDownload);

module.exports = router;