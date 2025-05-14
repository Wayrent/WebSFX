const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { verifyToken } = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');
const soundController = require('../controllers/soundController'); // Импортируем soundController

// Маршрут для получения данных пользователя
router.get('/profile', verifyToken, userController.getUserData);

// Маршрут для обновления заметки пользователя
router.put('/note', verifyToken, userController.updateUserNote);

// Маршрут для загрузки звука (только для администраторов)
router.post('/upload', adminMiddleware, soundController.uploadSound);

router.get('/', verifyToken, userController.getUserData);

module.exports = router;