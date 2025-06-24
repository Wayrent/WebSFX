const YooKassa = require('yookassa');
const { query } = require('../models/userModel');

const yookassa = new YooKassa({
  shopId: process.env.YOOKASSA_SHOP_ID,
  secretKey: process.env.YOOKASSA_SECRET_KEY
});

// Демонстрационный режим подписки
const simulateSubscription = async (req, res) => {
  const userId = req.user?.userId;

  if (!userId) {
    return res.status(401).json({ error: 'User ID not found' });
  }

  const now = new Date();
  const end = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 дней вперёд

  try {
    await query(
      'UPDATE users SET subscription_status = $1, subscription_start = $2, subscription_end = $3 WHERE id = $4',
      ['active', now, end, userId]
    );

    // Добавление записи в историю подписки
    await query(
      'INSERT INTO subscription_history (user_id, activated_at, expires_at) VALUES ($1, $2, $3)',
      [userId, now, end]
    );

    console.log(`🎫 Симулированная подписка активирована для пользователя ID=${userId}`);
    res.status(200).json({ success: true });
  } catch (err) {
    console.error('Ошибка активации подписки (симуляция):', err);
    res.status(500).json({ error: 'Ошибка активации подписки' });
  }
};

const createPayment = async (req, res) => {
  const userId = req.user?.userId;
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const payment = await yookassa.createPayment({
      amount: { value: '100.00', currency: 'RUB' },
      confirmation: {
        type: 'redirect',
        return_url: `${process.env.FRONTEND_URL}/payment-success`
      },
      capture: true,
      description: `Подписка на SoundFX для пользователя ID ${userId}`,
      metadata: { userId: String(userId) }
    });

    res.status(200).json({ url: payment.confirmation.confirmation_url });
  } catch (error) {
    console.error('Ошибка создания платежа:', error);
    res.status(500).json({ error: 'Ошибка при создании платежа' });
  }
};

const cancelSubscription = async (req, res) => {
  const userId = req.user?.userId;

  if (!userId) {
    return res.status(401).json({ error: 'User ID not found' });
  }

  try {
    await query(
      'UPDATE users SET subscription_status = $1, subscription_start = NULL, subscription_end = NULL WHERE id = $2',
      ['inactive', userId]
    );

    res.status(200).json({ success: true });
  } catch (err) {
    console.error('Ошибка при отмене подписки:', err);
    res.status(500).json({ error: 'Не удалось отменить подписку' });
  }
};

const getSubscriptionHistory = async (req, res) => {
  const userId = req.user?.userId;
  try {
    const result = await query(
    'SELECT activated_at AS start, expires_at AS "end" FROM subscription_history WHERE user_id = $1 ORDER BY activated_at DESC',
    [userId]
  );

    res.json({ history: result.rows });
  } catch (error) {
    console.error('Ошибка при получении истории подписки:', error);
    res.status(500).json({ error: 'Не удалось загрузить историю подписки' });
  }
};


const handleWebhook = async (req, res) => {
  try {
    const event = req.body;
    if (event.event === 'payment.succeeded') {
      const userId = event.object.metadata?.userId;
      if (userId) {
        const now = new Date();
        const end = new Date(now);
        end.setMonth(now.getMonth() + 1);

        await query(`
          UPDATE users SET 
            subscription_status = 'active',
            subscription_start = $1,
            subscription_end = $2
          WHERE id = $3
        `, [now, end, userId]);

        await query(`
          INSERT INTO subscription_history (user_id, activated_at, expires_at)
          VALUES ($1, $2, $3)
        `, [userId, now, end]);

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
  handleWebhook,
  simulateSubscription,
  cancelSubscription,
  getSubscriptionHistory
};

