const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { query } = require('../models/userModel');

// Регистрация пользователя
const registerUser = async (req, res) => {
  const { username, email, password, role = 'user' } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await query(
      'INSERT INTO users (username, email, password, role) VALUES ($1, $2, $3, $4) RETURNING *',
      [username, email, hashedPassword, role]
    );
    const user = result.rows[0];
    const token = jwt.sign({ userId: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.status(201).json({ token, role: user.role }); // Добавлено возвращение роли
  } catch (error) {
    if (error.constraint === 'users_email_key') {
      return res.status(400).json({ error: 'Email already registered' });
    }
    console.error('Error registering user:', error);
    res.status(500).json({ error: error.message });
  }
};

// Авторизация пользователя
const loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const result = await query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rowCount === 0) {
      return res.status(401).json({ 
        success: false,
        error: 'Invalid email or password' 
      });
    }

    const user = result.rows[0];
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ 
        success: false,
        error: 'Invalid email or password' 
      });
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
    res.status(500).json({ 
      success: false,
      error: 'Internal server error' 
    });
  }
};

module.exports = {
  registerUser,
  loginUser,
};