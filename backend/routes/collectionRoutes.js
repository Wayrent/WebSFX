const express = require('express');
const router = express.Router();
const collectionsController = require('../controllers/collectionController'); // Исправляем имя модуля
const authMiddleware = require('../middleware/authMiddleware');

// Маршруты для коллекций
router.get('/', authMiddleware, collectionsController.getCollections);
router.post('/', authMiddleware, collectionsController.createCollection);
router.post('/add_sound', authMiddleware, collectionsController.addSoundToCollection);
router.get('/:collectionId/sounds', authMiddleware, collectionsController.getSoundsInCollection);
router.delete('/:id', authMiddleware, collectionsController.deleteCollection); // Маршрут для удаления коллекции

module.exports = router;
