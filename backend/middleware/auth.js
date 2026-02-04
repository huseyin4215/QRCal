import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const authMiddleware = async (req, res, next) => {
  try {
    let token;

    // Check for token in headers
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    // Check for token in cookies
    if (!token && req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    console.log('Auth Middleware: Token found:', !!token);

    if (!token) {
      console.log('Auth Middleware: No token found');
      return res.status(401).json({
        success: false,
        message: 'Erişim token\'ı bulunamadı'
      });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'qrcal-super-secret-jwt-key-2024-change-this-in-production');
      console.log('Auth Middleware: Token decoded:', decoded);

      // Get user from database
      const user = await User.findById(decoded.id).select('-password');
      console.log('Auth Middleware: User found:', user ? user.email : 'Not found');

      if (!user) {
        console.log('Auth Middleware: User not found in database');
        return res.status(401).json({
          success: false,
          message: 'Geçersiz token'
        });
      }

      // Temporarily disable isActive check for debugging
      // if (!user.isActive) {
      //   console.log('Auth Middleware: User is not active');
      //   return res.status(401).json({
      //     success: false,
      //     message: 'Hesabınız aktif değil'
      //   });
      // }

      console.log('Auth Middleware: User authenticated successfully:', user.email, user.role);
      // Add user to request
      req.user = user;
      next();
    } catch (error) {
      console.error('Auth Middleware: Token verification failed:', error);
      return res.status(401).json({
        success: false,
        message: 'Geçersiz token'
      });
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(500).json({
      success: false,
      message: 'Sunucu hatası'
    });
  }
};

export const adminMiddleware = async (req, res, next) => {
  try {
    console.log('Admin Middleware: Checking admin access');
    console.log('Admin Middleware: User:', req.user ? req.user.email : 'No user');
    console.log('Admin Middleware: User role:', req.user ? req.user.role : 'No role');

    if (!req.user) {
      console.log('Admin Middleware: No user found');
      return res.status(401).json({
        success: false,
        message: 'Yetkilendirme gerekli'
      });
    }

    if (req.user.role !== 'admin') {
      console.log('Admin Middleware: User is not admin, role:', req.user.role);
      return res.status(403).json({
        success: false,
        message: 'Admin yetkisi gerekli'
      });
    }

    console.log('Admin Middleware: Admin access granted');
    next();
  } catch (error) {
    console.error('Admin middleware error:', error);
    return res.status(500).json({
      success: false,
      message: 'Sunucu hatası'
    });
  }
};

export const facultyMiddleware = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Yetkilendirme gerekli'
      });
    }

    if (req.user.role !== 'faculty' && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Öğretim elemanı yetkisi gerekli'
      });
    }

    next();
  } catch (error) {
    console.error('Faculty middleware error:', error);
    return res.status(500).json({
      success: false,
      message: 'Sunucu hatası'
    });
  }
};

export const optionalAuth = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).select('-password');

        if (user) {
          req.user = user;
        }
      } catch (error) {
        // Token is invalid, but we don't throw error for optional auth
        console.log('Optional auth: Invalid token');
      }
    }

    next();
  } catch (error) {
    console.error('Optional auth middleware error:', error);
    next();
  }
};

// Aliases for compatibility
export const protect = authMiddleware;
export const authorize = (...roles) => {
  return async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Yetkilendirme gerekli'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Bu işlem için yetkiniz yok'
      });
    }

    next();
  };
};
