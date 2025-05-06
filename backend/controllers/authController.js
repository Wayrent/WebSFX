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

// -------------------- РЕГИСТРАЦИЯ --------------------
const registerUser = async (req, res) => {
  const { username, email, password, role = 'user' } = req.body;

  try {
    if (!email || !password || !username) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const emailCheck = await query('SELECT * FROM users WHERE email = $1', [email]);
    if (emailCheck.rows.length) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationToken = crypto.randomBytes(20).toString('hex');

    const result = await query(
      'INSERT INTO users (username, email, password, role, email_verified, reset_password_token) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [username, email, hashedPassword, role, false, verificationToken]
    );

    const mailOptions = {
      from: `"SoundFX" <${process.env.EMAIL_FROM}>`,
      to: email,
      subject: 'Email Verification',
      html: `<p>Please verify your email by <a href="${process.env.BASE_URL}/verify-email?token=${verificationToken}">clicking here</a></p>`
    };

    await transporter.sendMail(mailOptions);

    res.status(201).json({
      success: true,
      message: 'Registration successful. Please check your email to verify your account.'
    });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ error: 'Server error during registration' });
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
      return res.status(400).json({ success: false, error: 'Invalid verification token' });
    }

    res.status(200).json({ success: true, message: 'Email verified successfully' });
  } catch (error) {
    console.error('Error verifying email:', error);
    res.status(500).json({ success: false, error: 'Error verifying email' });
  }
};

// -------------------- ЛОГИН --------------------
const loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email and password required' });
    }

    const result = await query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rowCount === 0) {
      return res.status(401).json({ success: false, error: 'Invalid email or password' });
    }

    const user = result.rows[0];

    if (!user.password) {
      return res.status(500).json({ success: false, error: 'Password missing in database' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ success: false, error: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

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
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

// -------------------- СБРОС ПАРОЛЯ (запрос) --------------------
const requestPasswordReset = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await query('SELECT * FROM users WHERE email = $1', [email]);
    if (!user.rows.length) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString(); // 6-значный код
    const expires = new Date(Date.now() + 3600000); // 1 час

    await query(
      'UPDATE users SET reset_password_token = $1, reset_password_expires = $2 WHERE email = $3',
      [code, expires, email]
    );

    const mailOptions = {
      to: email,
      from: process.env.EMAIL_FROM,
      subject: 'Password Reset Code',
      text: `You requested a password reset.\nYour code is: ${code}\n\nIf you did not request this, ignore this email.`
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ success: true, message: 'Reset code sent to email' });
  } catch (error) {
    console.error('Error in requestPasswordReset:', error);
    res.status(500).json({ success: false, error: 'Error sending reset email' });
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
      return res.status(400).json({ success: false, error: 'Invalid or expired reset code' });
    }

    res.status(200).json({ success: true, message: 'Reset code verified' });
  } catch (error) {
    console.error('Error in verifyResetCode:', error);
    res.status(500).json({ success: false, error: 'Error verifying reset code' });
  }
};

// -------------------- СБРОС ПАРОЛЯ (установка нового) --------------------
const resetPassword = async (req, res) => {
  const { email, token, newPassword, confirmPassword } = req.body;

  if (newPassword !== confirmPassword) {
    return res.status(400).json({ success: false, error: 'Passwords do not match' });
  }

  try {
    const user = await query(
      'SELECT * FROM users WHERE email = $1 AND reset_password_token = $2 AND reset_password_expires > NOW()',
      [email, token]
    );

    if (!user.rows.length) {
      return res.status(400).json({ success: false, error: 'Invalid or expired reset code' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await query(
      'UPDATE users SET password = $1, reset_password_token = NULL, reset_password_expires = NULL WHERE email = $2',
      [hashedPassword, email]
    );

    res.status(200).json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    console.error('Error in resetPassword:', error);
    res.status(500).json({ success: false, error: 'Error resetting password' });
  }
};

module.exports = {
  registerUser,
  loginUser,
  verifyEmail,
  requestPasswordReset,
  verifyResetCode,
  resetPassword
};
