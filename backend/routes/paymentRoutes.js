const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { verifyToken } = require('../middleware/authMiddleware');

// Создание платежа
router.post('/create', verifyToken, paymentController.createPayment);

// Демонстрационная подписка
router.post('/simulate', verifyToken, paymentController.simulateSubscription);

// Отмена подписки
router.post('/cancel', verifyToken, paymentController.cancelSubscription);

// Webhook от ЮKassa
router.post('/webhook', express.raw({ type: 'application/json' }), paymentController.handleWebhook);

module.exports = router;
