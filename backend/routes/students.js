import express from 'express';
import { asyncHandler } from '../middleware/errorHandler.js';
import { authMiddleware as auth } from '../middleware/auth.js';
import User from '../models/User.js';

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
  const { name, email, phone, studentNumber, department } = req.body;

  const user = await User.findById(req.user.id);

  if (name) user.name = name;
  if (email) user.email = email;
  if (phone) user.phone = phone;
  if (studentNumber) user.studentNumber = studentNumber;
  if (department) user.department = department;

  await user.save();

  res.json({
    success: true,
    data: user,
    message: 'Profil başarıyla güncellendi'
  });
}));

export default router; 