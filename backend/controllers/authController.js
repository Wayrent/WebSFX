const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { query } = require('../models/userModel');

// Регистрация пользователя
const registerUser = async (req, res) => {
  const { username, email, password, role = 'user' } = req.body; // Устанавливаем роль по умолчанию
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await query(
      'INSERT INTO users (username, email, password, role) VALUES ($1, $2, $3, $4) RETURNING *',
      [username, email, hashedPassword, role]
    );
    const user = result.rows[0];
    const token = jwt.sign({ userId: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.status(201).json({ token });
  } catch (error) {
    if (error.constraint === 'users_email_key') {
      return res.status(400).json({ error: 'Email already registered' });
    }
    console.error('Error registering user:', error);
    res.status(500).json({ error: error.message });
  }
};

// Авторизация пользователя
// authController.js
const loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    console.log('Attempting to log in user with email:', email); // Логирование
    const result = await query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rowCount === 0) {
      return res.status(400).json({ error: 'User not found' });
    }
    const user = result.rows[0];
    console.log('User found:', user); // Логирование
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ error: 'Invalid password' });
    }
    const token = jwt.sign({ userId: user.id, role: user.role }, process.env.JWT_SECRET || 'default_secret', { expiresIn: '1h' });
    console.log('Token generated:', token); // Логирование
    res.status(200).json({ token, role: user.role }); // Возвращаем токен и роль
  } catch (error) {
    console.error('Error logging in user:', error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  registerUser,
  loginUser,
};