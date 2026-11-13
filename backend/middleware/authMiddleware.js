const jwt = require('jsonwebtoken');
const User = require('../models/User');

// 1. Check if user is logged in
const protect = async (req, res, next) => {
  let token;

  // Header mein: Authorization: Bearer <token>
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];

      // Token verify karna
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Decoded ID se user nikalna aur request object me attach karna
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        return res.status(401).json({ message: 'User not found with this token' });
      }

      if (req.user.status === 'blocked') {
        return res.status(403).json({ message: 'Your account is blocked. Contact support.' });
      }

      next(); // Sab theek hai, agle step par bhejo
    } catch (error) {
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token provided' });
  }
};

// 2. Check if user is an Admin
const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied: Admin privileges required' });
  }
};

module.exports = { protect, adminOnly };