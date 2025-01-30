const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: 'Access denied, no token provided' });
  }
  
  const token = authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'Access denied, invalid token format' });
  }

  try {
    const decoded = jwt.verify(token, 'your_jwt_secret');
    req.user = { userId: decoded.userId }; // Устанавливаем userId в req.user
    console.log('Authenticated user:', decoded); // Логирование данных пользователя
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

module.exports = authMiddleware;
