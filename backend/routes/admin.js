import express from 'express';
import User from '../models/User.js';
import Appointment from '../models/Appointment.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { authMiddleware, adminMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Apply auth middleware first, then admin middleware to all routes
router.use(authMiddleware);
router.use(adminMiddleware);

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private (Admin)
router.get('/users', asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, role, department, search } = req.query;

  const query = {};

  if (role) {
    query.role = role;
  }

  if (department) {
    query.department = { $regex: department, $options: 'i' };
  }

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { department: { $regex: search, $options: 'i' } },
      { studentNumber: { $regex: search, $options: 'i' } }
    ];
  }

  const skip = (page - 1) * limit;

  const users = await User.find(query)
    .select('-password')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  const total = await User.countDocuments(query);

  res.json({
    success: true,
    data: {
      users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    }
  });
}));

// @desc    Get user by ID
// @route   GET /api/admin/users/:id
// @access  Private (Admin)
router.get('/users/:id', asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select('-password');

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

// @desc    Get admin availability (as faculty)
// @route   GET /api/admin/availability
// @access  Private (Admin)
router.get('/availability', asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).select('availability slotDuration');

  res.json({
    success: true,
    data: {
      availability: user.availability,
      slotDuration: user.slotDuration
    }
  });
}));

// @desc    Update admin availability (as faculty)
// @route   PUT /api/admin/availability
// @access  Private (Admin)
router.put('/availability', asyncHandler(async (req, res) => {
  const { availability, slotDuration, googleCalendarSettings } = req.body;

  const user = await User.findById(req.user.id);

  if (availability) {
    // Validate availability structure
    if (!Array.isArray(availability)) {
      return res.status(400).json({
        success: false,
        error: 'Availability must be an array'
      });
    }

    // Validate each day's availability
    for (const day of availability) {
      if (!day.day || !['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].includes(day.day)) {
        return res.status(400).json({
          success: false,
          error: `Invalid day: ${day.day}`
        });
      }

      if (day.isActive && day.timeSlots) {
        for (const slot of day.timeSlots) {
          if (!slot.start || !slot.end) {
            return res.status(400).json({
              success: false,
              error: `Time slot must have start and end times for ${day.day}`
            });
          }

          // Validate time format (HH:MM)
          const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
          if (!timeRegex.test(slot.start) || !timeRegex.test(slot.end)) {
            return res.status(400).json({
              success: false,
              error: `Invalid time format for ${day.day}. Use HH:MM format.`
            });
          }

          // Validate start time is before end time
          const startTime = new Date(`2000-01-01T${slot.start}`);
          const endTime = new Date(`2000-01-01T${slot.end}`);
          if (startTime >= endTime) {
            return res.status(400).json({
              success: false,
              error: `Start time must be before end time for ${day.day}`
            });
          }
        }
      }
    }

    user.availability = availability;
  }

  if (slotDuration) {
    // Validate slot duration
    if (slotDuration < 10 || slotDuration > 120) {
      return res.status(400).json({
        success: false,
        error: 'Slot süresi 10-120 dakika arasında olmalıdır'
      });
    }
    user.slotDuration = slotDuration;
  }

  await user.save();

  res.json({
    success: true,
    data: {
      availability: user.availability,
      slotDuration: user.slotDuration
    },
    message: 'Müsaitlik durumu başarıyla güncellendi'
  });
}));

// @desc    Create faculty user
// @route   POST /api/admin/users/faculty
// @access  Private (Admin)
router.post('/users/faculty', asyncHandler(async (req, res) => {
  const { name, email, department, phone, title, office } = req.body;

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

  // Generate temporary password (more robust)
  const tempPassword = Math.random().toString(36).substring(2, 10);
  
  console.log('Generated temp password:', tempPassword);

  // Create faculty user
  const faculty = new User({
    name,
    email: email.toLowerCase(),
    password: tempPassword,
    department,
    phone,
    title: title || 'Öğretim Elemanı',
    office,
    role: 'faculty',
    isFirstLogin: true
  });

  await faculty.save();
  
  console.log('Faculty saved with ID:', faculty._id);
  console.log('Faculty slug:', faculty.slug);

  res.status(201).json({
    success: true,
    data: {
      user: {
        id: faculty._id,
        name: faculty.name,
        email: faculty.email,
        role: faculty.role,
        department: faculty.department,
        phone: faculty.phone,
        title: faculty.title,
        office: faculty.office
      },
      tempPassword
    },
    message: 'Öğretim elemanı başarıyla oluşturuldu'
  });
}));

// @desc    Update user
// @route   PUT /api/admin/users/:id
// @access  Private (Admin)
router.put('/users/:id', asyncHandler(async (req, res) => {
  const {
    name,
    email,
    role,
    department,
    title,
    office,
    phone,
    website,
    isActive,
    studentNumber
  } = req.body;

  const user = await User.findById(req.params.id);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'Kullanıcı bulunamadı'
    });
  }

  // Check if email is already taken by another user
  if (email && email !== user.email) {
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Bu e-posta adresi zaten kullanılıyor'
      });
    }
  }

  // Check if student number is already taken by another user
  if (studentNumber && studentNumber !== user.studentNumber) {
    const existingUser = await User.findOne({ studentNumber });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Bu öğrenci numarası zaten kullanılıyor'
      });
    }
  }

  if (name) user.name = name;
  if (email) user.email = email.toLowerCase();
  if (role) user.role = role;
  if (department) user.department = department;
  if (title) user.title = title;
  if (office !== undefined) user.office = office;
  if (phone !== undefined) user.phone = phone;
  if (website !== undefined) user.website = website;
  if (typeof isActive === 'boolean') user.isActive = isActive;
  if (studentNumber) user.studentNumber = studentNumber;

  await user.save();

  res.json({
    success: true,
    data: user.toPublicJSON(),
    message: 'Kullanıcı başarıyla güncellendi'
  });
}));

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private (Admin)
router.delete('/users/:id', asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'Kullanıcı bulunamadı'
    });
  }

  // Prevent admin from deleting themselves
  if (user.role === 'admin' && user._id.toString() === req.user.id) {
    return res.status(400).json({
      success: false,
      message: 'Kendi hesabınızı silemezsiniz'
    });
  }

  // Check if user has appointments
  const appointmentCount = await Appointment.countDocuments({ 
    $or: [
      { facultyId: user._id },
      { studentEmail: user.email }
    ]
  });

  if (appointmentCount > 0) {
    return res.status(400).json({
      success: false,
      message: 'Bu kullanıcının randevuları bulunduğu için silinemez'
    });
  }

  await User.findByIdAndDelete(req.params.id);

  res.json({
    success: true,
    message: 'Kullanıcı başarıyla silindi'
  });
}));

// @desc    Reset user password
// @route   POST /api/admin/users/:id/reset-password
// @access  Private (Admin)
router.post('/users/:id/reset-password', asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'Kullanıcı bulunamadı'
    });
  }

  // Generate new temporary password
  const tempPassword = Math.random().toString(36).slice(-8);

  // Update password and set first login flag
  user.password = tempPassword;
  user.isFirstLogin = true;
  await user.save();

  res.json({
    success: true,
    data: {
      tempPassword
    },
    message: 'Şifre başarıyla sıfırlandı'
  });
}));

// @desc    Get all appointments
// @route   GET /api/admin/appointments
// @access  Private (Admin)
router.get('/appointments', asyncHandler(async (req, res) => {
  const { 
    page = 1, 
    limit = 10, 
    status, 
    facultyId, 
    startDate, 
    endDate,
    search 
  } = req.query;

  const query = {};

  if (status) {
    query.status = status;
  }

  if (facultyId) {
    query.facultyId = facultyId;
  }

  if (startDate && endDate) {
    query.date = {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    };
  }

  if (search) {
    query.$or = [
      { studentName: { $regex: search, $options: 'i' } },
      { studentId: { $regex: search, $options: 'i' } },
      { studentEmail: { $regex: search, $options: 'i' } },
      { facultyName: { $regex: search, $options: 'i' } }
    ];
  }

  const skip = (page - 1) * limit;

  const appointments = await Appointment.find(query)
    .populate('facultyId', 'name title department')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  const total = await Appointment.countDocuments(query);

  res.json({
    success: true,
    data: {
      appointments,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    }
  });
}));

// @desc    Get appointment by ID
// @route   GET /api/admin/appointments/:id
// @access  Private (Admin)
router.get('/appointments/:id', asyncHandler(async (req, res) => {
  const appointment = await Appointment.findById(req.params.id)
    .populate('facultyId', 'name title department email');

  if (!appointment) {
    return res.status(404).json({
      success: false,
      message: 'Randevu bulunamadı'
    });
  }

  res.json({
    success: true,
    data: appointment
  });
}));

// @desc    Update appointment status (admin can approve/reject)
// @route   PUT /api/admin/appointments/:id/status
// @access  Private (Admin)
router.put('/appointments/:id/status', asyncHandler(async (req, res) => {
  const { status, feedback } = req.body;

  const appointment = await Appointment.findById(req.params.id);

  if (!appointment) {
    return res.status(404).json({
      success: false,
      message: 'Randevu bulunamadı'
    });
  }

  if (!['approved', 'rejected', 'cancelled'].includes(status)) {
    return res.status(400).json({
      success: false,
      message: 'Geçersiz durum'
    });
  }

  appointment.status = status;
  if (feedback) {
    appointment.feedback = feedback;
  }

  await appointment.save();

  res.json({
    success: true,
    data: appointment,
    message: 'Randevu durumu başarıyla güncellendi'
  });
}));

// @desc    Get system statistics
// @route   GET /api/admin/stats
// @access  Private (Admin)
router.get('/stats', asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;

  const start = startDate ? new Date(startDate) : new Date(new Date().setDate(new Date().getDate() - 30));
  const end = endDate ? new Date(endDate) : new Date();

  // User statistics
  const totalUsers = await User.countDocuments();
  const activeUsers = await User.countDocuments({ isActive: true });
  const facultyUsers = await User.countDocuments({ role: 'faculty' });
  const studentUsers = await User.countDocuments({ role: 'student' });
  const adminUsers = await User.countDocuments({ role: 'admin' });

  // Appointment statistics
  const totalAppointments = await Appointment.countDocuments({
    createdAt: { $gte: start, $lte: end }
  });

  const appointmentStats = await Appointment.aggregate([
    {
      $match: {
        createdAt: { $gte: start, $lte: end }
      }
    },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);

  const stats = {
    pending: 0,
    approved: 0,
    rejected: 0,
    cancelled: 0
  };

  appointmentStats.forEach(stat => {
    stats[stat._id] = stat.count;
  });

  // Department statistics
  const departmentStats = await User.aggregate([
    {
      $match: { role: 'faculty' }
    },
    {
      $group: {
        _id: '$department',
        count: { $sum: 1 }
      }
    },
    {
      $sort: { count: -1 }
    }
  ]);

  // Recent activity
  const recentAppointments = await Appointment.find({
    createdAt: { $gte: new Date(new Date().setDate(new Date().getDate() - 7)) }
  })
  .populate('facultyId', 'name title department')
  .sort({ createdAt: -1 })
  .limit(10);

  const recentUsers = await User.find({
    createdAt: { $gte: new Date(new Date().setDate(new Date().getDate() - 7)) }
  })
  .select('name email role department createdAt')
  .sort({ createdAt: -1 })
  .limit(10);

  res.json({
    success: true,
    data: {
      users: {
        total: totalUsers,
        active: activeUsers,
        faculty: facultyUsers,
        student: studentUsers,
        admin: adminUsers
      },
      appointments: {
        total: totalAppointments,
        ...stats
      },
      departments: departmentStats,
      recent: {
        appointments: recentAppointments,
        users: recentUsers
      }
    }
  });
}));

// @desc    Get department statistics
// @route   GET /api/admin/stats/departments
// @access  Private (Admin)
router.get('/stats/departments', asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;

  const start = startDate ? new Date(startDate) : new Date(new Date().setDate(new Date().getDate() - 30));
  const end = endDate ? new Date(endDate) : new Date();

  const departmentStats = await Appointment.aggregate([
    {
      $match: {
        createdAt: { $gte: start, $lte: end }
      }
    },
    {
      $lookup: {
        from: 'users',
        localField: 'facultyId',
        foreignField: '_id',
        as: 'faculty'
      }
    },
    {
      $unwind: '$faculty'
    },
    {
      $group: {
        _id: '$faculty.department',
        totalAppointments: { $sum: 1 },
        pending: {
          $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
        },
        approved: {
          $sum: { $cond: [{ $eq: ['$status', 'approved'] }, 1, 0] }
        },
        rejected: {
          $sum: { $cond: [{ $eq: ['$status', 'rejected'] }, 1, 0] }
        },
        cancelled: {
          $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] }
        }
      }
    },
    {
      $sort: { totalAppointments: -1 }
    }
  ]);

  res.json({
    success: true,
    data: departmentStats
  });
}));

// @desc    Export appointments to CSV
// @route   GET /api/admin/export/appointments
// @access  Private (Admin)
router.get('/export/appointments', asyncHandler(async (req, res) => {
  const { startDate, endDate, status, facultyId } = req.query;

  const query = {};

  if (status) {
    query.status = status;
  }

  if (facultyId) {
    query.facultyId = facultyId;
  }

  if (startDate && endDate) {
    query.date = {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    };
  }

  const appointments = await Appointment.find(query)
    .populate('facultyId', 'name title department')
    .sort({ createdAt: -1 });

  // Convert to CSV format
  const csvHeaders = [
    'ID',
    'Öğrenci Adı',
    'Öğrenci Numarası',
    'Öğrenci E-posta',
    'Görüşme Konusu',
    'Açıklama',
    'Tarih',
    'Başlangıç Saati',
    'Bitiş Saati',
    'Durum',
    'Öğretim Elemanı',
    'Bölüm',
    'Oluşturulma Tarihi'
  ];

  const csvData = appointments.map(apt => [
    apt._id,
    apt.studentName,
    apt.studentId,
    apt.studentEmail,
    apt.topic,
    apt.description || '',
    apt.date.toLocaleDateString('tr-TR'),
    apt.startTime,
    apt.endTime,
    apt.statusTR,
    apt.facultyId?.name || apt.facultyName,
    apt.facultyId?.department || '',
    apt.createdAt.toLocaleDateString('tr-TR')
  ]);

  const csvContent = [csvHeaders, ...csvData]
    .map(row => row.map(field => `"${field}"`).join(','))
    .join('\n');

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="appointments.csv"');
  res.send(csvContent);
}));

// @desc    Get admin QR code (as faculty)
// @route   GET /api/admin/qr-code
// @access  Private (Admin)
router.get('/qr-code', asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).select('qrCodeUrl slug');

  res.json({
    success: true,
    data: {
      qrCodeUrl: user.qrCodeUrl
    }
  });
}));

// @desc    Generate admin QR code (as faculty)
// @route   POST /api/admin/qr-code
// @access  Private (Admin)
router.post('/qr-code', asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);

  if (!user.slug) {
    return res.status(400).json({
      success: false,
      message: 'QR kod oluşturmak için önce profil bilgilerinizi güncelleyin'
    });
  }

  // Generate QR code URL
  const qrCodeUrl = `${process.env.FRONTEND_URL || 'http://localhost:8081'}/appointment/${user.slug}`;
  
  // Update user's QR code URL
  user.qrCodeUrl = qrCodeUrl;
  await user.save();

  res.json({
    success: true,
    data: {
      qrCodeUrl: qrCodeUrl
    },
    message: 'QR kod başarıyla oluşturuldu'
  });
}));

export default router; 