const express = require('express');
const { getCollections, createCollection, addSoundToCollection, getSoundsInCollection } = require('../controllers/collectionController');
const router = express.Router();

router.get('/', getCollections);
router.post('/', createCollection);
router.post('/add_sound', addSoundToCollection);
router.get('/:collectionId/sounds', getSoundsInCollection);

module.exports = router;
