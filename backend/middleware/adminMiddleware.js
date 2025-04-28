const jwt = require('jsonwebtoken');

const adminMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Access denied, no token provided' });
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'Access denied, invalid token format' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied, admin rights required' });
    }
    req.user = decoded;
    next();
  } catch (error) {
    console.error('Invalid token:', error.message);
    return res.status(401).json({ error: 'Invalid token' });
  }
};

module.exports = adminMiddleware;