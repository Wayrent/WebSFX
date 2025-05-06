require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/sounds', require('./routes/soundRoutes'));
app.use('/api/collections', require('./middleware/authMiddleware'), require('./routes/collectionRoutes'));
app.use('/api/user', require('./middleware/authMiddleware'), require('./routes/userRoutes'));

// Admin routes - ДОБАВЛЯЕМ ЭТОТ БЛОК
app.use('/api/admin', 
  require('./middleware/authMiddleware'),
  require('./middleware/adminMiddleware'), 
  require('./routes/adminRoutes') // Создадим новый файл для админских маршрутов
);

// Error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    success: false,
    error: err.message
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});