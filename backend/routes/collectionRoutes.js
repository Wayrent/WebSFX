const express = require('express');
const router = express.Router();
const collectionsController = require('../controllers/collectionController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.get('/', collectionsController.getCollections);
router.post('/', collectionsController.createCollection);
router.post('/add_sound', collectionsController.addSoundToCollection);
router.get('/:collectionId/sounds', collectionsController.getSoundsInCollection);
router.delete('/:collectionId/sounds/:soundId', collectionsController.removeSoundFromCollection); // Исправленный маршрут
router.delete('/:id', collectionsController.deleteCollection);

module.exports = router;