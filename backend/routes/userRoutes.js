const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');

// Маршруты для пользователя
router.get('/', authMiddleware, userController.getUserData);
router.put('/note', authMiddleware, userController.updateUserNote);

module.exports = router;
