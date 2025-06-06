require('dotenv').config();

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { query } = require('../models/userModel');
const nodemailer = require('nodemailer');
const crypto = require('crypto');

// Gmail SMTP
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// --- Вспомогательная функция: перенос скачиваний гостя в аккаунт ---
async function migrateGuestDownloadsToUser(userId, ip) {
  try {
    // Обновляем все записи в downloads с этим IP и user_id = NULL
    const result = await query(
      'UPDATE downloads SET user_id = $1 WHERE ip_address = $2 AND user_id IS NULL RETURNING *',
      [userId, ip]
    );

    // Считаем сколько записей было перенесено
    const count = result.rows.length;

    if (count > 0) {
      // Обновляем статистику пользователя
      await query(
        'UPDATE users SET downloads_today = downloads_today + $1, last_download = NOW() WHERE id = $2',
        [count, userId]
      );
    }

    console.log(`Перенесено ${count} скачиваний гостя на пользователя ID=${userId}`);
  } catch (error) {
    console.error('Ошибка при переносе скачиваний гостя:', error);
  }
}

// -------------------- РЕГИСТРАЦИЯ --------------------
const registerUser = async (req, res) => {
  const { username, email, password, role = 'user' } = req.body;
  const ip = req.ip || req.connection.remoteAddress;

  try {
    if (!email || !password || !username) {
      return res.status(400).json({ error: 'Не заполнены необходимые поля' });
    }

    const emailCheck = await query('SELECT * FROM users WHERE email = $1', [email]);

    if (emailCheck.rows.length > 0) {
      const user = emailCheck.rows[0];
      if (user.email_verified) {
        return res.status(400).json({ error: 'Почта уже зарегистрирована' });
      } else {
        // пользователь есть, но не подтвердил email — обновим код
        const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
        const expires = new Date(Date.now() + 3600000);

        await query(
          'UPDATE users SET verification_code = $1, verification_expires = $2 WHERE email = $3',
          [verificationCode, expires, email]
        );

        const mailOptions = {
          from: `"Auris SFX" <${process.env.EMAIL_FROM}>`,
          to: email,
          subject: 'Повторная отправка кода',
          text: `Ваш код подтверждения: ${verificationCode}. Он действителен в течение 1 часа.`
        };

        await transporter.sendMail(mailOptions);

        return res.status(200).json({
          success: true,
          message: 'Код подтверждения повторно отправлен на email'
        });
      }
    }


    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date(Date.now() + 3600000); // 1 час

    const result = await query(
      'INSERT INTO users (username, email, password, role, email_verified, verification_code, verification_expires) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id',
      [username, email, hashedPassword, role, false, verificationCode, expires]
    );

    const newUser = result.rows[0];

    const mailOptions = {
      from: `"Auris SFX" <${process.env.EMAIL_FROM}>`,
      to: email,
      subject: 'Подтверждение регистрации',
      text: `Ваш код подтверждения: ${verificationCode}. Он действителен в течение 1 часа.`
    };

    await transporter.sendMail(mailOptions);

    // ✅ Переносим скачивания гостя в новый аккаунт
    await migrateGuestDownloadsToUser(newUser.id, ip);

    res.status(201).json({
      success: true,
      message: 'Код подтверждения отправлен на email. Пожалуйста, введите его для активации аккаунта.'
    });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ error: 'Ошибка сервера при регистрации' });
  }
};

// -------------------- ПОДТВЕРЖДЕНИЕ ПОЧТЫ --------------------
const verifyEmail = async (req, res) => {
  const { token } = req.query;

  try {
    const result = await query(
      'UPDATE users SET email_verified = TRUE, reset_password_token = NULL WHERE reset_password_token = $1 RETURNING *',
      [token]
    );

    if (result.rowCount === 0) {
      return res.status(400).json({ success: false, error: 'Неверный проверочный токен' });
    }

    res.status(200).json({ success: true, message: 'Почта успешно подтверждена' });
  } catch (error) {
    console.error('Error verifying email:', error);
    res.status(500).json({ success: false, error: 'Ошибка подтверждения почты' });
  }
};

const verifyRegistrationCode = async (req, res) => {
  const { email, code } = req.body;

  try {
    const result = await query(
      'UPDATE users SET email_verified = TRUE, verification_code = NULL, verification_expires = NULL WHERE email = $1 AND verification_code = $2 AND verification_expires > NOW() RETURNING *',
      [email, code]
    );

    if (result.rowCount === 0) {
      return res.status(400).json({ success: false, error: 'Неверный или истекший проверочный код' });
    }

    res.status(200).json({ success: true, message: 'Почта успешно подтверждена. Вы можете войти' });
  } catch (error) {
    console.error('Error verifying registration code:', error);
    res.status(500).json({ success: false, error: 'Подтверждение не удалось' });
  }
};

const resendVerificationCode = async (req, res) => {
  const { email } = req.body;

  try {
    const result = await query('SELECT * FROM users WHERE email = $1', [email]);
    if (!result.rows.length) {
      return res.status(404).json({ success: false, error: 'Пользователь не найден' });
    }

    const user = result.rows[0];
    if (user.email_verified) {
      return res.status(400).json({ success: false, error: 'Почта уже подтверждена' });
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date(Date.now() + 3600000);

    await query(
      'UPDATE users SET verification_code = $1, verification_expires = $2 WHERE email = $3',
      [code, expires, email]
    );

    const mailOptions = {
      from: `"Auris SFX" <${process.env.EMAIL_FROM}>`,
      to: email,
      subject: 'Повторная отправка кода',
      text: `Ваш новый код подтверждения: ${code}. Он действителен в течение 1 часа.`
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ success: true, message: 'Код отправлен повторно' });
  } catch (error) {
    console.error('Ошибка при повторной отправке кода:', error);
    res.status(500).json({ success: false, error: 'Ошибка сервера' });
  }
};


// -------------------- ЛОГИН --------------------
const loginUser = async (req, res) => {
  const { email, password } = req.body;
  const ip = req.ip || req.connection.remoteAddress;

  try {
    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Необходимы почта и пароль' });
    }

    const result = await query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rowCount === 0) {
      return res.status(401).json({ success: false, error: 'Неверный логин или пароль' });
    }

    const user = result.rows[0];

      if (!user.email_verified) {
    const newCode = Math.floor(100000 + Math.random() * 900000).toString();
    const newExpires = new Date(Date.now() + 3600000); // 1 час

    await query(
      'UPDATE users SET verification_code = $1, verification_expires = $2 WHERE id = $3',
      [newCode, newExpires, user.id]
    );

    const mailOptions = {
      from: `"Auris SFX" <${process.env.EMAIL_FROM}>`,
      to: user.email,
      subject: 'Подтверждение email (повторно)',
      text: `Ваш код подтверждения: ${newCode}. Он действителен в течение 1 часа.`
    };

    await transporter.sendMail(mailOptions);

    return res.status(403).json({
      success: false,
      error: 'Почта не подтверждена. Мы повторно отправили код подтверждения на ваш email.'
    });
  }


    if (!user.password) {
      return res.status(500).json({ success: false, error: 'Пароль отсутствует в базе данных' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ success: false, error: 'Неверный логин или пароль' });
    }

    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // ✅ Переносим скачивания гостя в аккаунт после входа
    await migrateGuestDownloadsToUser(user.id, ip);

    res.status(200).json({
      success: true,
      token,
      role: user.role,
      email: user.email,
      userId: user.id,
      username: user.username
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, error: 'Внутренняя ошибка сервера' });
  }
};

// -------------------- СБРОС ПАРОЛЯ (запрос) --------------------
const requestPasswordReset = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await query('SELECT * FROM users WHERE email = $1', [email]);
    if (!user.rows.length) {
      return res.status(404).json({ success: false, error: 'Пользователь не найден' });
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString(); // 6-значный код
    const expires = new Date(Date.now() + 3600000); // 1 час

    await query(
      'UPDATE users SET reset_password_token = $1, reset_password_expires = $2 WHERE email = $3',
      [code, expires, email]
    );

    const mailOptions = {
      from: `"Auris SFX" <${process.env.EMAIL_FROM}>`,
      to: email,
      subject: 'Сброс пароля',
      text: `Ваш код для сброса пароля: ${code}. Он действителен в течение 1 часа.`
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ success: true, message: 'Код для сброса отправлен на почту' });
  } catch (error) {
    console.error('Error in requestPasswordReset:', error);
    res.status(500).json({ success: false, error: 'Ошибка отправки кода для сброса' });
  }
};

// -------------------- СБРОС ПАРОЛЯ (проверка кода) --------------------
const verifyResetCode = async (req, res) => {
  const { email, token } = req.body;

  try {
    const result = await query(
      'SELECT * FROM users WHERE email = $1 AND reset_password_token = $2 AND reset_password_expires > NOW()',
      [email, token]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ success: false, error: 'Неверный или истекший код для сброса' });
    }

    res.status(200).json({ success: true, message: 'Код для сброса подтвержден' });
  } catch (error) {
    console.error('Error in verifyResetCode:', error);
    res.status(500).json({ success: false, error: 'Ошибка в проверке кода для сброса' });
  }
};

// -------------------- СБРОС ПАРОЛЯ (установка нового) --------------------
const resetPassword = async (req, res) => {
  const { email, token, newPassword, confirmPassword } = req.body;

  if (newPassword !== confirmPassword) {
    return res.status(400).json({ success: false, error: 'Пароли не совпадают' });
  }

  try {
    const user = await query(
      'SELECT * FROM users WHERE email = $1 AND reset_password_token = $2 AND reset_password_expires > NOW()',
      [email, token]
    );

    if (!user.rows.length) {
      return res.status(400).json({ success: false, error: 'Неверный или истекший код для сброса' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await query(
      'UPDATE users SET password = $1, reset_password_token = NULL, reset_password_expires = NULL WHERE email = $2',
      [hashedPassword, email]
    );

    res.status(200).json({ success: true, message: 'Пароль успешно обновлен' });
  } catch (error) {
    console.error('Error in resetPassword:', error);
    res.status(500).json({ success: false, error: 'Ошибка при сбросе пароля' });
  }
};

module.exports = {
  registerUser,
  loginUser,
  verifyEmail,
  requestPasswordReset,
  verifyResetCode,
  resetPassword,
  verifyRegistrationCode, // ← ЭТО ДОБАВЬ
  resendVerificationCode
};