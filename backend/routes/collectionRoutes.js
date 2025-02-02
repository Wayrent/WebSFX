const express = require('express');
const router = express.Router();
const collectionsController = require('../controllers/collectionController'); // Исправляем имя модуля

// Маршруты для коллекций
router.get('/', collectionsController.getCollections);
router.post('/', collectionsController.createCollection);
router.post('/add_sound', collectionsController.addSoundToCollection);
router.get('/:collectionId/sounds', collectionsController.getSoundsInCollection);
router.delete('/:id', collectionsController.deleteCollection); // Маршрут для удаления коллекции

module.exports = router;
