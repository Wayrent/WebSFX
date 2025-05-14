const { query } = require('../models/userModel');
const path = require('path')
const fs = require('fs')

// Функция для подсчёта скачиваний — принимает ip и userId
async function getDownloadCount(userId, ip) {
  const today = new Date().toISOString().slice(0, 10)
  let text = 'SELECT COUNT(*) FROM downloads WHERE DATE(created_at) = $1'
  const values = [today]

  if (userId) {
    text += ' AND user_id = $2'
    values.push(userId)
  } else {
    text += ' AND ip_address = $2'
    values.push(ip)
  }

  try {
    const result = await query(text, values)
    return parseInt(result.rows[0].count, 10) || 0
  } catch (err) {
    console.error('Ошибка подсчёта скачиваний:', err)
    return 0
  }
}

const handleDownload = async (req, res) => {
  console.log('handleDownload called')
  const { soundId } = req.params
  const ip = req.ip || req.connection.remoteAddress
  const userId = req.user?.userId ?? null

  try {
    // Проверяем звук
    const soundResult = await query('SELECT * FROM sounds WHERE id = $1', [soundId])
    if (!soundResult.rows.length) {
      return res.status(404).json({ error: 'Звук не найден' })
    }

    const sound = soundResult.rows[0]

    // Премиум-звук доступен только подписчикам
    if (sound.premium_only && userId) {
      const userResult = await query('SELECT subscription_status FROM users WHERE id = $1', [userId])
      const isSubscribed = userResult.rows[0]?.subscription_status === 'active'
      if (!isSubscribed) {
        return res.status(403).json({ error: 'Этот звук доступен только подписчикам' })
      }
    }

    // Логика ограничений
    if (userId) {
      const userResult = await query('SELECT * FROM users WHERE id = $1', [userId])
      const user = userResult.rows[0]
      const today = new Date().toISOString().slice(0, 10)
      const lastDownload = user.last_download ? user.last_download.toISOString().slice(0, 10) : null

      if (lastDownload !== today) {
        await query('UPDATE users SET downloads_today = 0, last_download = NOW() WHERE id = $1', [userId])
        user.downloads_today = 0
      }

      const limit = user.subscription_status === 'active' ? Infinity : 20
      if (user.downloads_today >= limit) {
        return res.status(403).json({
          error: 'Превышен дневной лимит скачиваний. Купите подписку.'
        })
      }

      // Увеличиваем счётчик
      await query(
        'UPDATE users SET downloads_today = downloads_today + 1, last_download = NOW() WHERE id = $1',
        [userId]
      )
    } else {
      // Гость — проверяем по IP
      const downloadCount = await getDownloadCount(null, ip)
      if (downloadCount >= 5) {
        return res.status(403).json({
          error: 'Вы достигли лимита бесплатных скачиваний. Зарегистрируйтесь, чтобы продолжить.',
          guestLimitReached: true
        })
      }
    }

    // Логируем скачивание
    await query(
      'INSERT INTO downloads (sound_id, user_id, ip_address) VALUES ($1, $2, $3)',
      [soundId, userId, ip]
    )

    // Отдаём файл
    const filePath = path.join(__dirname, '../../public', sound.url.replace(/^\/+/, ''))
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Файл не найден' })
    }

    res.download(filePath)

  } catch (error) {
    console.error('Ошибка при скачивании:', error)
    res.status(500).json({ error: 'Ошибка при скачивании файла' })
  }
}

module.exports = { handleDownload }