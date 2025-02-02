const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const soundRoutes = require('./routes/soundRoutes');
const authRoutes = require('./routes/authRoutes');
const collectionRoutes = require('./routes/collectionRoutes');
const userRoutes = require('./routes/userRoutes'); // Импортируем маршруты пользователя
const authMiddleware = require('./middleware/authMiddleware');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: 'http://localhost:3000' }));
app.use(bodyParser.json());

// Использование маршрутов
app.use('/api/sounds', soundRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/collections', authMiddleware, collectionRoutes);
app.use('/api/user', authMiddleware, userRoutes); // Подключаем маршруты пользователя

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
