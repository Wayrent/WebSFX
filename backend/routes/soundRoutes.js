const express = require('express');
const { getSounds, addFavorite, downloadSound } = require('../controllers/soundController');
const router = express.Router();

router.get('/', getSounds);
router.post('/add_favorite', addFavorite);
router.get('/download_sound', downloadSound);

module.exports = router;
