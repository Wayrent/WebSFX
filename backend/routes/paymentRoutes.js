const express = require('express');
const router = express.Router();
const { createPayment, handleWebhook } = require('../controllers/paymentController');
const { verifyToken } = require('../middleware/authMiddleware');

// Создание платежа пользователем
router.post('/create', verifyToken, createPayment);

// Webhook от ЮKassa (важно: raw-обработчик!)
router.post('/webhook', express.raw({ type: 'application/json' }), handleWebhook);

module.exports = router;
