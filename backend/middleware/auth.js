const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'goget-super-secret-key-for-dev';

// Middleware to verify JWT token and optionally allow without token (for needy users)
exports.auth = (optional = false) => {
  return (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      if (optional) return next();
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded;
      next();
    } catch (err) {
      res.status(401).json({ message: 'Token is not valid' });
    }
  };
};
