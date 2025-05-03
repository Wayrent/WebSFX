const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

// Получение списка пользователей
router.get('/users', adminController.getAllUsers);

// Обновление данных пользователя
router.put('/users/:id', adminController.updateUser);

// Сброс пароля пользователя
router.post('/users/:id/reset-password', adminController.resetPassword);

router.delete('/users/:id', adminController.deleteUser);

module.exports = router;