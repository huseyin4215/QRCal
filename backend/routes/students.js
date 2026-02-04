import express from 'express';
import { asyncHandler } from '../middleware/errorHandler.js';
import { authMiddleware as auth } from '../middleware/auth.js';
import User from '../models/User.js';
import crypto from 'crypto';
import { sendEmailVerificationCode } from '../services/emailService.js';

const router = express.Router();

// @desc    Get student profile
// @route   GET /api/students/profile
// @access  Private
router.get('/profile', auth, asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).select('-password');

  res.json({
    success: true,
    data: user
  });
}));

// @desc    Update student profile
// @route   PUT /api/students/profile
// @access  Private
router.put('/profile', auth, asyncHandler(async (req, res) => {
  const { name, email, phone, studentNumber, department, advisor } = req.body;

  const user = await User.findById(req.user.id);

  // Prevent student number changes
  if (studentNumber && studentNumber !== user.studentNumber) {
    return res.status(400).json({
      success: false,
      message: 'Öğrenci numarası değiştirilemez'
    });
  }

  // Prevent direct email changes - must use verification
  if (email && email.toLowerCase() !== user.email.toLowerCase()) {
    return res.status(400).json({
      success: false,
      message: 'E-posta adresini değiştirmek için doğrulama kodu gereklidir. Lütfen e-posta değişikliği için ayrı endpoint\'i kullanın.'
    });
  }

  if (name) user.name = name;
  if (phone !== undefined) user.phone = phone || null;
  if (department) user.department = department;
  if (advisor !== undefined) {
    user.advisor = advisor && advisor.trim() !== '' ? advisor : null;
  }

  await user.save();

  res.json({
    success: true,
    data: user,
    message: 'Profil başarıyla güncellendi'
  });
}));

// @desc    Request email change verification code
// @route   POST /api/students/email/request-change
// @access  Private
router.post('/email/request-change', auth, asyncHandler(async (req, res) => {
  const { newEmail } = req.body;

  if (!newEmail) {
    return res.status(400).json({
      success: false,
      message: 'Yeni e-posta adresi gereklidir'
    });
  }

  const user = await User.findById(req.user.id);

  // Check if new email is same as current
  if (newEmail.toLowerCase() === user.email.toLowerCase()) {
    return res.status(400).json({
      success: false,
      message: 'Yeni e-posta adresi mevcut e-posta adresiyle aynı olamaz'
    });
  }

  // Check if new email already exists
  const existingUser = await User.findOne({ email: newEmail.toLowerCase() });
  if (existingUser) {
    return res.status(400).json({
      success: false,
      message: 'Bu e-posta adresi zaten kullanılıyor'
    });
  }

  // Generate 6-digit verification code
  const verificationCode = crypto.randomInt(100000, 999999).toString();
  const verificationExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  // Store verification code in user document
  user.emailVerificationCode = verificationCode;
  user.emailVerificationExpiry = verificationExpiry;
  user.pendingEmail = newEmail.toLowerCase();
  await user.save();

  // Send verification code to new email
  try {
    await sendEmailVerificationCode(newEmail, user.name, verificationCode);
  } catch (error) {
    console.error('Failed to send verification code:', error);
    // Clear verification data if email sending fails
    user.emailVerificationCode = undefined;
    user.emailVerificationExpiry = undefined;
    user.pendingEmail = undefined;
    await user.save();
    
    return res.status(500).json({
      success: false,
      message: 'Doğrulama kodu gönderilemedi. Lütfen tekrar deneyin.'
    });
  }

  res.json({
    success: true,
    message: 'Doğrulama kodu yeni e-posta adresinize gönderildi'
  });
}));

// @desc    Verify email change with code
// @route   POST /api/students/email/verify-change
// @access  Private
router.post('/email/verify-change', auth, asyncHandler(async (req, res) => {
  const { verificationCode } = req.body;

  if (!verificationCode) {
    return res.status(400).json({
      success: false,
      message: 'Doğrulama kodu gereklidir'
    });
  }

  const user = await User.findById(req.user.id);

  // Check if verification code exists and matches
  if (!user.emailVerificationCode || user.emailVerificationCode !== verificationCode) {
    return res.status(400).json({
      success: false,
      message: 'Geçersiz doğrulama kodu'
    });
  }

  // Check if verification code has expired
  if (!user.emailVerificationExpiry || new Date() > user.emailVerificationExpiry) {
    // Clear expired verification data
    user.emailVerificationCode = undefined;
    user.emailVerificationExpiry = undefined;
    user.pendingEmail = undefined;
    await user.save();
    
    return res.status(400).json({
      success: false,
      message: 'Doğrulama kodu süresi dolmuş. Lütfen yeni bir kod isteyin.'
    });
  }

  // Check if pending email still available
  if (user.pendingEmail) {
    const existingUser = await User.findOne({ email: user.pendingEmail });
    if (existingUser) {
      // Clear verification data
      user.emailVerificationCode = undefined;
      user.emailVerificationExpiry = undefined;
      user.pendingEmail = undefined;
      await user.save();
      
      return res.status(400).json({
        success: false,
        message: 'Bu e-posta adresi artık kullanılıyor. Lütfen başka bir e-posta adresi deneyin.'
      });
    }

    // Update email
    user.email = user.pendingEmail;
    user.emailVerificationCode = undefined;
    user.emailVerificationExpiry = undefined;
    user.pendingEmail = undefined;
    await user.save();

    res.json({
      success: true,
      data: user,
      message: 'E-posta adresi başarıyla güncellendi'
    });
  } else {
    return res.status(400).json({
      success: false,
      message: 'Bekleyen e-posta adresi bulunamadı'
    });
  }
}));

export default router; 