import express from 'express';
import jwt from 'jsonwebtoken';
import { google } from 'googleapis';
import User from '../models/User.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { authMiddleware } from '../middleware/auth.js';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { sendPasswordResetEmail } from '../services/emailService.js';

const router = express.Router();

// Google OAuth configuration for LOGIN (separate from calendar linking)
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID || 'your-google-client-id',
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_AUTH_REDIRECT_URI || 'http://localhost:5000/api/auth/google/callback'
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
  const { name, email, password, studentNumber, department, advisor } = req.body;

  // Validation
  if (!name || !email || !password || !studentNumber || !department) {
    return res.status(400).json({
      success: false,
      message: 'Tüm alanlar zorunludur'
    });
  }

  // Validate student number format (8 digits)
  if (!/^\d{8}$/.test(studentNumber)) {
    return res.status(400).json({
      success: false,
      message: 'Öğrenci numarası tam olarak 8 haneli olmalıdır'
    });
  }

  // Validate advisor if provided
  if (advisor) {
    const advisorUser = await User.findById(advisor);
    if (!advisorUser || advisorUser.role !== 'faculty') {
      return res.status(400).json({
        success: false,
        message: 'Geçersiz danışman seçimi'
      });
    }
  }

  // Check if email already exists
  const existingEmail = await User.findOne({ email: email.toLowerCase() });
  if (existingEmail) {
    return res.status(400).json({
      success: false,
      message: 'Bu e-posta adresi zaten kullanılıyor'
    });
  }

  // Check if student number already exists
  const existingStudentNumber = await User.findOne({ studentNumber });
  if (existingStudentNumber) {
    return res.status(400).json({
      success: false,
      message: 'Bu öğrenci numarası zaten kullanılıyor'
    });
  }

  // Create new student
  const user = new User({
    name,
    email: email.toLowerCase(),
    password,
    studentNumber,
    department,
    role: 'student',
    advisor: advisor || null
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

// @desc    Forgot password - send reset email
// @route   POST /api/auth/forgot-password
// @access  Public
router.post('/forgot-password', asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ success: false, message: 'E-posta zorunludur' });
  }

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    // Do not reveal user existence
    return res.json({ success: true, message: 'Eğer bu e-posta sistemde kayıtlı ise sıfırlama maili gönderildi' });
  }

  const token = crypto.randomBytes(32).toString('hex');
  user.passwordResetToken = token;
  user.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
  await user.save();

  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:8081';
  const resetLink = `${frontendUrl}/reset-password?token=${encodeURIComponent(token)}`;

  try {
    await sendPasswordResetEmail(user.email, user.name, resetLink);
  } catch (e) {
    // Still return success for security; log the error
    console.error('Failed to send reset email:', e);
  }

  return res.json({ success: true, message: 'Eğer bu e-posta sistemde kayıtlı ise sıfırlama maili gönderildi' });
}));

// @desc    Reset password
// @route   POST /api/auth/reset-password
// @access  Public
router.post('/reset-password', asyncHandler(async (req, res) => {
  const { token, newPassword } = req.body;

  if (!token || !newPassword) {
    return res.status(400).json({ success: false, message: 'Token ve yeni şifre zorunludur' });
  }

  const user = await User.findOne({
    passwordResetToken: token,
    passwordResetExpires: { $gt: new Date() }
  });

  if (!user) {
    return res.status(400).json({ success: false, message: 'Geçersiz veya süresi geçmiş token' });
  }

  user.password = newPassword;
  user.passwordResetToken = null;
  user.passwordResetExpires = null;
  user.isFirstLogin = false;
  await user.save();

  return res.json({ success: true, message: 'Şifreniz başarıyla sıfırlandı' });
}));

// @desc    Change password
// @route   POST /api/auth/change-password
// @access  Private
router.post('/change-password', authMiddleware, asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    res.status(400);
    throw new Error('Mevcut şifre ve yeni şifre gereklidir');
  }

  const user = await User.findById(req.user.id);

  // Check current password
  const isMatch = await bcrypt.compare(currentPassword, user.password);

  if (!isMatch) {
    res.status(400);
    throw new Error('Mevcut şifre yanlış');
  }

  // Update user - password will be hashed by pre-save middleware
  user.password = newPassword;
  user.isFirstLogin = false;

  await user.save();

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
        // No user exists -> redirect to Google registration page with short-lived token
        const regToken = jwt.sign(
          {
            type: 'google_register',
            googleId: userInfo.id,
            email: (userInfo.email || '').toLowerCase(),
            name: userInfo.name,
            picture: userInfo.picture || null,
            tokens: {
              access_token: tokens.access_token || null,
              refresh_token: tokens.refresh_token || null
            }
          },
          process.env.JWT_SECRET || 'qrcal-super-secret-jwt-key-2024-change-this-in-production',
          { expiresIn: '15m' }
        );

        const redirectUrl = `${process.env.FRONTEND_URL || 'http://localhost:8081'}/google-register?token=${encodeURIComponent(regToken)}`;
        return res.redirect(redirectUrl);
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

    // Redirect to frontend callback page with token
    const redirectUrl = `${process.env.FRONTEND_URL || 'http://localhost:8081'}/google-auth-callback?token=${encodeURIComponent(token)}&success=true`;
    res.redirect(redirectUrl);

  } catch (error) {
    console.error('Google OAuth error:', error);
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:8081'}/auth/error?message=OAuth hatası`);
  }
}));

// @desc    Get registration info from Google reg token
// @route   GET /api/auth/google/register-info
// @access  Public
router.get('/google/register-info', asyncHandler(async (req, res) => {
  const { token } = req.query;
  if (!token) {
    return res.status(400).json({ success: false, message: 'Token gerekli' });
  }
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'qrcal-super-secret-jwt-key-2024-change-this-in-production');
    if (payload.type !== 'google_register') {
      return res.status(400).json({ success: false, message: 'Geçersiz token türü' });
    }
    return res.json({
      success: true,
      data: {
        email: payload.email,
        name: payload.name,
        picture: payload.picture
      }
    });
  } catch (e) {
    return res.status(400).json({ success: false, message: 'Geçersiz veya süresi geçmiş token' });
  }
}));

// @desc    Complete registration with Google token
// @route   POST /api/auth/google/register
// @access  Public
router.post('/google/register', asyncHandler(async (req, res) => {
  const { token, studentNumber, department, name, advisor } = req.body;

  if (!token || !studentNumber || !department) {
    return res.status(400).json({ success: false, message: 'Token, öğrenci numarası ve bölüm zorunludur' });
  }

  // Validate student number format (8 digits)
  if (!/^\d{8}$/.test(studentNumber)) {
    return res.status(400).json({ success: false, message: 'Öğrenci numarası tam olarak 8 haneli olmalıdır' });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'qrcal-super-secret-jwt-key-2024-change-this-in-production');
    if (payload.type !== 'google_register') {
      return res.status(400).json({ success: false, message: 'Geçersiz token türü' });
    }

    // Validate advisor if provided
    if (advisor) {
      const advisorUser = await User.findById(advisor);
      if (!advisorUser || advisorUser.role !== 'faculty') {
        return res.status(400).json({ success: false, message: 'Geçersiz danışman seçimi' });
      }
    }

    // Check if email already exists
    const existingEmail = await User.findOne({ email: payload.email });
    if (existingEmail) {
      return res.status(409).json({ success: false, message: 'Bu e-posta adresi zaten kullanılıyor' });
    }

    // Check if student number already exists
    const existingStudentNumber = await User.findOne({ studentNumber });
    if (existingStudentNumber) {
      return res.status(409).json({ success: false, message: 'Bu öğrenci numarası zaten kullanılıyor' });
    }

    // Create student user
    const user = new User({
      name: name || payload.name,
      email: payload.email,
      password: Math.random().toString(36).slice(-10),
      studentNumber,
      department,
      role: 'student',
      googleId: payload.googleId,
      picture: payload.picture || null,
      isFirstLogin: false,
      advisor: advisor || null
    });

    // Store Google tokens if present
    if (payload.tokens) {
      user.googleAccessToken = payload.tokens.access_token || null;
      user.googleRefreshToken = payload.tokens.refresh_token || null;
    }

    await user.save();

    // Send password reset email (optional, since Google is linked)
    try {
      const resetToken = crypto.randomBytes(32).toString('hex');
      user.passwordResetToken = resetToken;
      user.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000);
      await user.save();
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:8081';
      const resetLink = `${frontendUrl}/reset-password?token=${encodeURIComponent(resetToken)}`;
      await sendPasswordResetEmail(user.email, user.name, resetLink);
    } catch (e) {
      console.error('Failed to send password reset after Google register:', e);
    }

    // Generate JWT token and return user
    const authToken = generateToken(user._id);

    return res.json({
      success: true,
      data: {
        token: authToken,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          department: user.department,
          studentNumber: user.studentNumber,
          isFirstLogin: user.isFirstLogin
        }
      },
      message: 'Kayıt tamamlandı. Şifre sıfırlama bağlantısı e-postanıza gönderildi.'
    });
  } catch (e) {
    console.error('Google register failed:', e);
    return res.status(400).json({ success: false, message: 'Geçersiz veya süresi geçmiş token' });
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

// @desc    Get faculty list (public endpoint for registration)
// @route   GET /api/auth/faculty
// @access  Public
router.get('/faculty', asyncHandler(async (req, res) => {
  const faculty = await User.find({
    $or: [{ role: 'faculty' }, { role: 'admin' }]
  })
    .select('name email department title')
    .sort({ name: 1 });

  res.json({
    success: true,
    data: faculty
  });
}));

export default router; 