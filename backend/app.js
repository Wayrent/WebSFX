// app.js
require('dotenv').config(); // Убедитесь, что эта строка есть в начале файла
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const soundRoutes = require('./routes/soundRoutes');
const authRoutes = require('./routes/authRoutes');
const collectionRoutes = require('./routes/collectionRoutes');
const userRoutes = require('./routes/userRoutes');
const authMiddleware = require('./middleware/authMiddleware');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware для CORS
app.use(cors({ origin: 'http://localhost:3000' }));

// Middleware для парсинга JSON
app.use(bodyParser.json());

// Обслуживание статических файлов из папки uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Подключение маршрутов
app.use('/api/sounds', soundRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/collections', authMiddleware, collectionRoutes);
app.use('/api/user', authMiddleware, userRoutes);

// Централизованная обработка ошибок
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

console.log('JWT_SECRET:', process.env.JWT_SECRET); // Логирование секрета
console.log('PORT:', process.env.PORT); // Логирование порта

// Запуск сервера
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});