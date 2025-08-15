import express from 'express';
import jwt from 'jsonwebtoken';
import { google } from 'googleapis';
import User from '../models/User.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { authMiddleware } from '../middleware/auth.js';
import bcrypt from 'bcryptjs';

const router = express.Router();

// Google OAuth configuration
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID || '194091113508-rvckovns6g1gnn7mrh8atrnjoq53dm6l.apps.googleusercontent.com',
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

// Generate JWT token
const generateToken = (id) => {
  console.log('Generating token for user ID:', id);
  return jwt.sign({ id }, process.env.JWT_SECRET || 'qrcal-super-secret-jwt-key-2024-change-this-in-production', {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

// @desc    Register new user (student)
// @route   POST /api/auth/register
// @access  Public
router.post('/register', asyncHandler(async (req, res) => {
  const { name, email, password, studentNumber, department } = req.body;

  // Validation
  if (!name || !email || !password || !studentNumber || !department) {
    return res.status(400).json({
      success: false,
      message: 'Tüm alanlar zorunludur'
    });
  }

  // Check if user already exists
  const existingUser = await User.findOne({
    $or: [{ email: email.toLowerCase() }, { studentNumber }]
  });

  if (existingUser) {
    return res.status(400).json({
      success: false,
      message: 'Bu e-posta adresi veya öğrenci numarası zaten kullanılıyor'
    });
  }

  // Create new student
  const user = new User({
    name,
    email: email.toLowerCase(),
    password,
    studentNumber,
    department,
    role: 'student'
  });

  await user.save();

  // Generate token
  const token = generateToken(user._id);

  res.status(201).json({
    success: true,
    data: {
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        studentNumber: user.studentNumber
      }
    },
    message: 'Kayıt başarılı'
  });
}));

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
router.post('/login', asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  console.log('Login - Request received:', { email, hasPassword: !!password });

  // Validation
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'E-posta ve şifre zorunludur'
    });
  }

  // Find user
  const user = await User.findOne({ email: email.toLowerCase() });

  if (!user) {
    console.log('Login - User not found:', email);
    return res.status(401).json({
      success: false,
      message: 'Geçersiz e-posta veya şifre'
    });
  }

  console.log('Login - User found:', { 
    userId: user._id, 
    email: user.email, 
    role: user.role,
    isFirstLogin: user.isFirstLogin 
  });

  // Check password
  const isPasswordValid = await user.comparePassword(password);
  console.log('Login - Password valid:', isPasswordValid);

  if (!isPasswordValid) {
    console.log('Login - Invalid password for user:', email);
    return res.status(401).json({
      success: false,
      message: 'Geçersiz e-posta veya şifre'
    });
  }

  // Update last login
  user.lastLogin = new Date();
  await user.save();

  // Generate token
  const token = generateToken(user._id);

  console.log('Login successful for user:', user.email, 'Role:', user.role, 'isFirstLogin:', user.isFirstLogin);

  const userResponse = {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    department: user.department,
    studentNumber: user.studentNumber,
    isFirstLogin: user.isFirstLogin
  };

  console.log('Login response user data:', userResponse);

  res.json({
    success: true,
    data: {
      token,
      user: userResponse
    },
    message: 'Giriş başarılı'
  });
}));

// @desc    Change password
// @route   POST /api/auth/change-password
// @access  Private
router.post('/change-password', authMiddleware, asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  console.log('Change Password - Request received:', { 
    userId: req.user.id, 
    hasCurrentPassword: !!currentPassword, 
    hasNewPassword: !!newPassword 
  });

  if (!currentPassword || !newPassword) {
    res.status(400);
    throw new Error('Mevcut şifre ve yeni şifre gereklidir');
  }

  const user = await User.findById(req.user.id);
  console.log('Change Password - User found:', { 
    userId: user._id, 
    email: user.email, 
    role: user.role,
    isFirstLogin: user.isFirstLogin 
  });

  // Check current password
  const isMatch = await bcrypt.compare(currentPassword, user.password);
  console.log('Change Password - Password match:', isMatch);
  
  if (!isMatch) {
    res.status(400);
    throw new Error('Mevcut şifre yanlış');
  }

  // Update user - password will be hashed by pre-save middleware
  user.password = newPassword;
  user.isFirstLogin = false;
  
  await user.save();
  console.log('Change Password - User saved successfully:', { 
    isFirstLogin: user.isFirstLogin 
  });

  // Generate new token after password change
  const newToken = generateToken(user._id);

  res.json({
    success: true,
    message: 'Şifre başarıyla değiştirildi',
    data: {
      token: newToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        studentNumber: user.studentNumber,
        isFirstLogin: user.isFirstLogin
      }
    }
  });
}));

// @desc    Create admin user (first time setup)
// @route   POST /api/auth/setup-admin
// @access  Public (only if no admin exists)
router.post('/setup-admin', asyncHandler(async (req, res) => {
  // Check if admin already exists
  const existingAdmin = await User.findOne({ role: 'admin' });

  if (existingAdmin) {
    return res.status(400).json({
      success: false,
      message: 'Admin kullanıcısı zaten mevcut'
    });
  }

  const { name, email, password } = req.body;

  // Validation
  if (!name || !email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Tüm alanlar zorunludur'
    });
  }

  // Create admin user
  const admin = new User({
    name,
    email: email.toLowerCase(),
    password,
    department: 'Yönetim',
    role: 'admin',
    isFirstLogin: false
  });

  await admin.save();

  // Generate token
  const token = generateToken(admin._id);

  res.status(201).json({
    success: true,
    data: {
      token,
      user: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        department: admin.department
      }
    },
    message: 'Admin kullanıcısı oluşturuldu'
  });
}));

// @desc    Create faculty user (admin only)
// @route   POST /api/auth/create-faculty
// @access  Private (Admin only)
router.post('/create-faculty', authMiddleware, asyncHandler(async (req, res) => {
  const { name, email, department, phone } = req.body;

  // Check if user is admin
  const admin = await User.findById(req.user.id);
  if (admin.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Bu işlem için admin yetkisi gerekli'
    });
  }

  // Validation
  if (!name || !email || !department) {
    return res.status(400).json({
      success: false,
      message: 'Ad, e-posta ve bölüm zorunludur'
    });
  }

  // Check if user already exists
  const existingUser = await User.findOne({ email: email.toLowerCase() });

  if (existingUser) {
    return res.status(400).json({
      success: false,
      message: 'Bu e-posta adresi zaten kullanılıyor'
    });
  }

  // Generate temporary password
  const tempPassword = Math.random().toString(36).slice(-8);

  // Create faculty user
  const faculty = new User({
    name,
    email: email.toLowerCase(),
    password: tempPassword,
    department,
    phone,
    role: 'faculty',
    isFirstLogin: true
  });

  await faculty.save();

  res.status(201).json({
    success: true,
    data: {
      user: {
        id: faculty._id,
        name: faculty.name,
        email: faculty.email,
        role: faculty.role,
        department: faculty.department,
        phone: faculty.phone
      },
      tempPassword
    },
    message: 'Öğretim elemanı oluşturuldu'
  });
}));

// @desc    Get Google OAuth URL
// @route   GET /api/auth/google/url
// @access  Public
router.get('/google/url', asyncHandler(async (req, res) => {
  const scopes = [
    'https://www.googleapis.com/auth/userinfo.profile',
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/calendar.readonly',
    'https://www.googleapis.com/auth/calendar.events'
  ];

  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
    prompt: 'consent'
  });

  res.json({
    success: true,
    data: { authUrl }
  });
}));

// @desc    Google OAuth with ID token
// @route   POST /api/auth/google
// @access  Public
router.post('/google', asyncHandler(async (req, res) => {
  // Set CORS headers for Google OAuth
  res.header('Access-Control-Allow-Origin', 'http://localhost:8081');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, X-Client-Data');
  
  const { idToken } = req.body;

  if (!idToken) {
    return res.status(400).json({
      success: false,
      message: 'ID token gerekli'
    });
  }

  try {
    // Verify ID token with Google
    const ticket = await oauth2Client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID
    });

    const payload = ticket.getPayload();
    const userInfo = {
      id: payload.sub,
      name: payload.name,
      email: payload.email,
      picture: payload.picture
    };

    // Check if user exists
    let user = await User.findOne({ googleId: userInfo.id });

    if (!user) {
      // Check if user exists with email
      user = await User.findOne({ email: userInfo.email });

      if (user) {
        // Update existing user with Google ID
        user.googleId = userInfo.id;
        user.picture = userInfo.picture;
        user.lastLogin = new Date();
        await user.save();
      } else {
        return res.status(404).json({
          success: false,
          message: 'Bu Google hesabı ile kayıtlı kullanıcı bulunamadı. Önce sisteme kayıt olun.'
        });
      }
    } else {
      // Update existing user
      user.lastLogin = new Date();
      user.picture = userInfo.picture;
      await user.save();
    }

    // Generate JWT token
    const token = generateToken(user._id);

    res.json({
      success: true,
      data: {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          picture: user.picture,
          role: user.role,
          department: user.department,
          slug: user.slug,
          isFirstLogin: user.isFirstLogin
        }
      }
    });

  } catch (error) {
    console.error('Google ID token verification error:', error);
    res.status(401).json({
      success: false,
      message: 'Geçersiz ID token'
    });
  }
}));

// @desc    Google OAuth callback
// @route   GET /api/auth/google/callback
// @access  Public
router.get('/google/callback', asyncHandler(async (req, res) => {
  // Set CORS headers for Google OAuth callback with FedCM support
  res.header('Access-Control-Allow-Origin', 'http://localhost:8081');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, X-Client-Data, Sec-Fetch-Mode, Sec-Fetch-Site, Sec-Fetch-Dest');
  
  const { code } = req.query;

  if (!code) {
    return res.status(400).json({
      success: false,
      message: 'Authorization code bulunamadı'
    });
  }

  try {
    // Exchange code for tokens
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    // Get user info from Google
    const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
    const { data: userInfo } = await oauth2.userinfo.get();

    // Check if user exists
    let user = await User.findByGoogleId(userInfo.id);

    if (!user) {
      // Check if user exists with email
      user = await User.findOne({ email: userInfo.email });

      if (user) {
        // Update existing user with Google ID
        user.googleId = userInfo.id;
        user.picture = userInfo.picture;
        user.lastLogin = new Date();
        // Store Google tokens for calendar access
        user.googleAccessToken = tokens.access_token;
        user.googleRefreshToken = tokens.refresh_token;
        await user.save();
      } else {
        return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:8081'}/auth/error?message=Bu Google hesabı ile kayıtlı kullanıcı bulunamadı`);
      }
    } else {
      // Update existing user
      user.lastLogin = new Date();
      user.picture = userInfo.picture;
      // Store Google tokens for calendar access
      user.googleAccessToken = tokens.access_token;
      user.googleRefreshToken = tokens.refresh_token;
      await user.save();
    }

    // Generate JWT token
    const token = generateToken(user._id);

    // Redirect to frontend with token and Google connection status
    const redirectUrl = `${process.env.FRONTEND_URL || 'http://localhost:8081'}/faculty-dashboard?token=${token}&googleConnected=true`;
    res.redirect(redirectUrl);

  } catch (error) {
    console.error('Google OAuth error:', error);
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:8081'}/auth/error?message=OAuth hatası`);
  }
}));

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
router.get('/me', authMiddleware, asyncHandler(async (req, res) => {
  console.log('getCurrentUser: Request from user:', req.user.email);
  
  const user = await User.findById(req.user.id).select('-password');
  
  console.log('getCurrentUser: User data retrieved:', {
    id: user._id,
    email: user.email,
    role: user.role,
    studentNumber: user.studentNumber,
    isActive: user.isActive
  });

  res.json({
    success: true,
    data: user
  });
}));

// @desc    Test admin user
// @route   GET /api/auth/test-admin
// @access  Public
router.get('/test-admin', asyncHandler(async (req, res) => {
  const adminUser = await User.findOne({ role: 'admin' }).select('-password');
  
  if (!adminUser) {
    return res.status(404).json({
      success: false,
      message: 'Admin kullanıcısı bulunamadı'
    });
  }

  res.json({
    success: true,
    data: adminUser
  });
}));

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
router.post('/logout', authMiddleware, asyncHandler(async (req, res) => {
  res.json({
    success: true,
    message: 'Başarıyla çıkış yapıldı'
  });
}));

// @desc    Refresh token
// @route   POST /api/auth/refresh
// @access  Public
router.post('/refresh', asyncHandler(async (req, res) => {
  const { token } = req.body;

  if (!token) {
    return res.status(400).json({
      success: false,
      message: 'Token gerekli'
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Geçersiz token'
      });
    }

    const newToken = generateToken(user._id);

    res.json({
      success: true,
      data: {
        token: newToken,
        user
      }
    });
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Geçersiz token'
    });
  }
}));

export default router; 