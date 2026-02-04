import express from 'express';
import User from '../models/User.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { authMiddleware as auth } from '../middleware/auth.js';

const router = express.Router();

// @desc    Get all faculty members
// @route   GET /api/users/faculty
// @access  Public
router.get('/faculty', asyncHandler(async (req, res) => {
  const faculty = await User.find({
    $or: [
      { role: 'faculty', isActive: true },
      { role: 'admin', isActive: true }
    ]
  }).select('name title department office phone email picture slug isActive availability slotDuration role');

  res.json({
    success: true,
    data: faculty
  });
}));

// @desc    Get faculty by slug
// @route   GET /api/users/faculty/:slug
// @access  Public
router.get('/faculty/:slug', asyncHandler(async (req, res) => {
  const { slug } = req.params;

  const faculty = await User.findBySlug(slug);

  if (!faculty) {
    return res.status(404).json({
      success: false,
      message: 'Öğretim elemanı bulunamadı'
    });
  }

  res.json({
    success: true,
    data: faculty.toPublicJSON()
  });
}));

// @desc    Get current user profile
// @route   GET /api/users/profile
// @access  Private
router.get('/profile', auth, asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'Kullanıcı bulunamadı'
    });
  }

  res.json({
    success: true,
    data: user.toPublicJSON()
  });
}));

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
router.put('/profile', auth, asyncHandler(async (req, res) => {
  const { name, title, department, office, phone, website } = req.body;

  const user = await User.findById(req.user.id);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'Kullanıcı bulunamadı'
    });
  }

  // Update fields
  if (name) user.name = name;
  if (title) user.title = title;
  if (department) user.department = department;
  if (office !== undefined) user.office = office;
  if (phone !== undefined) user.phone = phone;
  if (website !== undefined) user.website = website;

  await user.save();

  res.json({
    success: true,
    data: user.toPublicJSON(),
    message: 'Profil başarıyla güncellendi'
  });
}));

// @desc    Update faculty availability
// @route   PUT /api/users/faculty/availability
// @access  Private (Faculty)
router.put('/faculty/availability', auth, asyncHandler(async (req, res) => {
  const { availability, slotDuration } = req.body;

  const user = await User.findById(req.user.id);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'Kullanıcı bulunamadı'
    });
  }

  if (user.role !== 'faculty') {
    return res.status(403).json({
      success: false,
      message: 'Bu işlem için öğretim elemanı yetkisi gerekli'
    });
  }

  // Update availability
  if (availability) {
    user.availability = availability;
  }

  // Update slot duration - minimum 15 minutes, no maximum
  if (slotDuration) {
    if (slotDuration < 15) {
      return res.status(400).json({
        success: false,
        message: 'Slot süresi minimum 15 dakika olmalıdır'
      });
    }
    user.slotDuration = slotDuration;
  }

  await user.save();

  res.json({
    success: true,
    data: user.toPublicJSON(),
    message: 'Müsaitlik durumu başarıyla güncellendi'
  });
}));

// @desc    Toggle faculty active status
// @route   PUT /api/users/faculty/toggle-active
// @access  Private (Faculty)
router.put('/faculty/toggle-active', auth, asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'Kullanıcı bulunamadı'
    });
  }

  if (user.role !== 'faculty') {
    return res.status(403).json({
      success: false,
      message: 'Bu işlem için öğretim elemanı yetkisi gerekli'
    });
  }

  user.isActive = !user.isActive;
  await user.save();

  res.json({
    success: true,
    data: {
      isActive: user.isActive
    },
    message: user.isActive ? 'Randevu almaya açıldınız' : 'Randevu almayı durdurdunuz'
  });
}));

// @desc    Get user by email
// @route   GET /api/users/email/:email
// @access  Private (Authenticated users)
router.get('/email/:email', auth, asyncHandler(async (req, res) => {
  const email = decodeURIComponent(req.params.email);
  const user = await User.findOne({ email: email.toLowerCase() }).select('-password');

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'Kullanıcı bulunamadı'
    });
  }

  res.json({
    success: true,
    data: user
  });
}));

// @desc    Get user statistics
// @route   GET /api/users/stats
// @access  Private
router.get('/stats', auth, asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'Kullanıcı bulunamadı'
    });
  }

  // Import Appointment model for stats
  const Appointment = (await import('../models/Appointment.js')).default;

  let stats = {};

  if (user.role === 'faculty') {
    // Faculty stats
    const totalAppointments = await Appointment.countDocuments({ facultyId: user._id });
    const pendingAppointments = await Appointment.countDocuments({
      facultyId: user._id,
      status: 'pending'
    });
    const approvedAppointments = await Appointment.countDocuments({
      facultyId: user._id,
      status: 'approved'
    });
    const rejectedAppointments = await Appointment.countDocuments({
      facultyId: user._id,
      status: 'rejected'
    });

    stats = {
      totalAppointments,
      pendingAppointments,
      approvedAppointments,
      rejectedAppointments
    };
  } else if (user.role === 'student') {
    // Student stats
    const totalAppointments = await Appointment.countDocuments({ studentEmail: user.email });
    const pendingAppointments = await Appointment.countDocuments({
      studentEmail: user.email,
      status: 'pending'
    });
    const approvedAppointments = await Appointment.countDocuments({
      studentEmail: user.email,
      status: 'approved'
    });
    const rejectedAppointments = await Appointment.countDocuments({
      studentEmail: user.email,
      status: 'rejected'
    });

    stats = {
      totalAppointments,
      pendingAppointments,
      approvedAppointments,
      rejectedAppointments
    };
  }

  res.json({
    success: true,
    data: stats
  });
}));

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private (Users can view their own profile, admins can view any profile)
// NOTE: This route must be last because it matches any :id, including 'email', 'stats', 'faculty', etc.
router.get('/:id', auth, asyncHandler(async (req, res) => {
  const { id } = req.params;
  const requestingUser = await User.findById(req.user.id);

  if (!requestingUser) {
    return res.status(404).json({
      success: false,
      message: 'Kullanıcı bulunamadı'
    });
  }

  // Users can view their own profile, admins can view any profile
  if (requestingUser.role !== 'admin' && requestingUser._id.toString() !== id) {
    return res.status(403).json({
      success: false,
      message: 'Bu kullanıcının bilgilerini görüntüleme yetkiniz yok'
    });
  }

  const user = await User.findById(id).select('-password');

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'Kullanıcı bulunamadı'
    });
  }

  res.json({
    success: true,
    data: user
  });
}));

export default router; 