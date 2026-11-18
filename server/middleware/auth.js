const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect routes - verify JWT token
const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'super_secret_jwt_key_leave_portal_2026_secure'
      );

      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'User no longer exists',
        });
      }

      if (req.user.status === 'inactive') {
        return res.status(403).json({
          success: false,
          code: 'ACCOUNT_INACTIVE',
          message: 'Your account has been deactivated. Please contact HR or System Administrator.',
        });
      }

      if (req.user.status === 'pending') {
        return res.status(403).json({
          success: false,
          code: 'ACCOUNT_PENDING',
          message: 'Your account is pending administrator approval. Zero system access is granted until an administrator activates your account.',
        });
      }

      return next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized, token failed or expired',
      });
    }
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized, no token provided',
    });
  }
};

// Authorize roles
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized',
      });
    }

    // Platform Master Maker has universal administrative access
    if (req.user.role === 'master') {
      return next();
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Role (${req.user.role}) is not authorized to access this resource`,
      });
    }

    next();
  };
};

module.exports = { protect, authorize };
