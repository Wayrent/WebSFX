require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const { verifyToken } = require('./middleware/authMiddleware');
const adminMiddleware = require('./middleware/adminMiddleware');
const PORT = process.env.PORT || 5000;

const downloadRoutes = require('./routes/downloadRoutes');

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
app.use('/api/collections', verifyToken, require('./routes/collectionRoutes'));
app.use('/api/user', verifyToken, require('./routes/userRoutes'));
app.use('/api/download', require('./routes/downloadRoutes'));

// Admin routes - ДОБАВЛЯЕМ ЭТОТ БЛОК
app.use('/api/admin', verifyToken, adminMiddleware, require('./routes/adminRoutes'));

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