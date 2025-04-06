const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  console.log('Authorization header:', authHeader); // Отладочное сообщение
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Access denied, no token provided' });
  }
  const token = authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'Access denied, invalid token format' });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { userId: decoded.userId, role: decoded.role }; // Добавляем роль
    console.log('Authenticated user:', req.user);
    next();
  } catch (error) {
    console.error('Invalid token:', error.message);
    return res.status(401).json({ error: 'Invalid token' });
  }
};

module.exports = authMiddleware;