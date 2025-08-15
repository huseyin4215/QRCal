import User from '../models/User.js';

export const checkAdmin = async (req, res, next) => {
  try {
    // Check if user exists in request (set by auth middleware)
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Yetkilendirme gerekli'
      });
    }

    // Check if user has admin role
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin yetkisi gerekli'
      });
    }

    // User is admin, proceed to next middleware/route
    next();
  } catch (error) {
    console.error('Admin check error:', error);
    return res.status(500).json({
      success: false,
      message: 'Admin kontrolü sırasında hata oluştu'
    });
  }
};
