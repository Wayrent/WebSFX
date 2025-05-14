const { query } = require('../models/userModel');
const path = require('path');
const fs = require('fs');

const handleDownload = async (req, res) => {
  console.log('handleDownload called');
  console.log('req.user:', req.user);

  const { soundId } = req.params;
  const userId = req.user.userId;

  try {
    const result = await query('SELECT * FROM users WHERE id = $1', [userId]);
    const user = result.rows[0];
    console.log('USER DATA:', user);

    const today = new Date().toISOString().slice(0, 10);
    const lastDownload = user.last_download ? user.last_download.toISOString().slice(0, 10) : null;

    console.log('Сброс лимита: lastDownload =', lastDownload, 'today =', today);

    if (lastDownload !== today) {
      await query('UPDATE users SET downloads_today = 0, last_download = $1 WHERE id = $2', [today, userId]);
      console.log('Сброс лимита и установка last_download на', today);
      user.downloads_today = 0;
    }

    const limit = user.subscription_status === 'active' ? Infinity : user.email_verified ? 20 : 3;
    if (user.downloads_today >= limit) {
      return res.status(403).json({ error: 'Превышен лимит скачиваний' });
    }

    const soundResult = await query('SELECT * FROM sounds WHERE id = $1', [soundId]);
    const sound = soundResult.rows[0];

    if (!sound) {
      return res.status(404).json({ error: 'Звук не найден' });
    }

    if (sound.premium_only && user.subscription_status !== 'active') {
      return res.status(403).json({ error: 'Этот звук доступен только подписчикам' });
    }

    await query(
      'UPDATE users SET downloads_today = downloads_today + 1, last_download = $1 WHERE id = $2',
      [new Date(), userId]
    );
    console.log(`Обновляем downloads_today и last_download для userId=${userId}`);

    const filePath = path.join(__dirname, '../../public', sound.url.replace(/^\/+/, ''));
    console.log('Скачиваем файл по пути:', filePath);

    if (!fs.existsSync(filePath)) {
      console.error('Файл не найден:', filePath);
      return res.status(404).json({ error: 'Файл не найден' });
    }

    res.download(filePath);
  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({ error: 'Ошибка при скачивании' });
  }
};

module.exports = { handleDownload };
