const jwt = require('jsonwebtoken');

const adminMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('No token provided');
      return res.status(401).json({ 
        success: false,
        error: 'Access denied, no token provided' 
      });
    }

    const token = authHeader.split(' ')[1];
    
    // Верификация токена
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Decoded token:', decoded);

    // Проверка роли
    if (decoded.role !== 'admin') {
      console.log('User is not admin');
      return res.status(403).json({ 
        success: false,
        error: 'Access denied, admin rights required' 
      });
    }

    req.user = decoded;
    next();
  } catch (error) {
    console.error('Admin middleware error:', error);
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false,
        error: 'Token expired' 
      });
    }
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        success: false,
        error: 'Invalid token' 
      });
    }

    res.status(500).json({ 
      success: false,
      error: 'Internal server error' 
    });
  }
};

module.exports = adminMiddleware;