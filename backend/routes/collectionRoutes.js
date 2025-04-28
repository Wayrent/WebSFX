const express = require('express');
const router = express.Router();
const collectionsController = require('../controllers/collectionController');
const authMiddleware = require('../middleware/authMiddleware');

// Все маршруты требуют аутентификации
router.use(authMiddleware);

// Маршруты для коллекций
router.get('/', collectionsController.getCollections);
router.post('/', collectionsController.createCollection);
router.post('/add_sound', collectionsController.addSoundToCollection);
router.get('/:collectionId/sounds', collectionsController.getSoundsInCollection);
router.delete('/:id', collectionsController.deleteCollection);

module.exports = router;