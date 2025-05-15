const YooKassa = require('yookassa');
const { query } = require('../models/userModel');

const yookassa = new YooKassa({
  shopId: process.env.YOOKASSA_SHOP_ID,
  secretKey: process.env.YOOKASSA_SECRET_KEY
});

// Создание платежа
const createPayment = async (req, res) => {
  const userId = req.user?.userId;
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const payment = await yookassa.createPayment({
      amount: {
        value: '50.00',
        currency: 'RUB'
      },
      confirmation: {
        type: 'redirect',
        return_url: `${process.env.FRONTEND_URL}/payment-success`
      },
      capture: true,
      description: `Подписка на SoundFX для пользователя ID ${userId}`,
      metadata: {
        userId: String(userId)
      }
    });

    res.status(200).json({ url: payment.confirmation.confirmation_url });
  } catch (error) {
    console.error('Ошибка создания платежа:', error);
    res.status(500).json({ error: 'Ошибка при создании платежа' });
  }
};

// Вебхук для обработки успешной оплаты
const handleWebhook = async (req, res) => {
  try {
    const event = req.body;

    if (event.event === 'payment.succeeded') {
      const userId = event.object.metadata?.userId;

      if (userId) {
        await query(
          'UPDATE users SET subscription_status = $1 WHERE id = $2',
          ['active', userId]
        );
        console.log(`✅ Подписка активирована для пользователя ID=${userId}`);
      }
    }

    res.status(200).send('OK');
  } catch (err) {
    console.error('Ошибка обработки вебхука:', err);
    res.status(500).send('Webhook error');
  }
};

module.exports = {
  createPayment,
  handleWebhook
};
