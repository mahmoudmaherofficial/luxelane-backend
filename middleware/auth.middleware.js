// middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authMiddleware = (...allowedRoles) => {
  return async (req, res, next) => {
    try {
      const authHeader = req.headers.authorization;

      // التحقق من وجود الهيدر وصحته
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Access denied: No token provided' });
      }

      const token = authHeader.split(' ')[1];

      // تحقق من التوكن
      if (!token) {
        return res.status(401).json({ error: 'Access denied: Token missing' });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // تحقق من وجود المستخدم
      const user = await User.findById(decoded.userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      req.user = {
        userId: user._id,
        role: user.role,
      };

      // التحقق من صلاحيات الدور
      if (allowedRoles.length && !allowedRoles.includes(user.role)) {
        return res.status(403).json({ error: 'Access denied: Unauthorized' });
      }

      next();
    } catch (err) {
      console.error('Auth error:', err);
      return res.status(401).json({ error: 'Invalid or expired token' });
    }
  };
};

module.exports = authMiddleware;
