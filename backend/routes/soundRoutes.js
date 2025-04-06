// soundRoutes.js
const express = require('express');
const router = express.Router();
const soundController = require('../controllers/soundController');
const authMiddleware = require('../middleware/authMiddleware');
const { upload } = require('../controllers/soundController'); // Импортируем multer

// Получение списка звуков
router.get('/', soundController.getSounds);

// Получение коллекций для звука
router.get('/:soundId/collections', authMiddleware, soundController.getSoundCollections);

// Добавление звука в коллекцию
router.post('/:collectionId/sounds', authMiddleware, soundController.addSoundToCollection);

// Удаление звука из коллекции
router.delete('/:collectionId/sounds/:soundId', authMiddleware, soundController.removeSoundFromCollection);

// Загрузка звука
router.post('/upload', authMiddleware, upload.single('file'), soundController.uploadSound);

module.exports = router;