import express from 'express';
import { body, validationResult } from 'express-validator';
import User from '../models/User.js';
import Appointment from '../models/Appointment.js';
import AppointmentSlot from '../models/AppointmentSlot.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { optionalAuth, authMiddleware } from '../middleware/auth.js';
import { sendAppointmentRequestEmail } from '../services/emailService.js';
import { google } from 'googleapis';

const router = express.Router();

// Helper function to check and update availability from Google Calendar
const updateAvailabilityFromGoogleCalendar = async (faculty, targetDate) => {
  if (!faculty.googleAccessToken) {
    return; // Faculty doesn't have Google Calendar connected
  }

  try {
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );

    oauth2Client.setCredentials({
      access_token: faculty.googleAccessToken,
      refresh_token: faculty.googleRefreshToken
    });

    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
    
    // Get events for the target date
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    const response = await calendar.events.list({
      calendarId: 'primary',
      timeMin: startOfDay.toISOString(),
      timeMax: endOfDay.toISOString(),
      singleEvents: true,
      orderBy: 'startTime'
    });

    const events = response.data.items || [];
    
    if (events.length > 0) {
      // Update faculty availability for this date
      const dayName = targetDate.toLocaleDateString('en-US', { weekday: 'long' });
      const existingAvailability = faculty.availability.find(a => a.day === dayName);
      
      if (existingAvailability) {
        // Add busy times to availability
        const busySlots = events.map(event => {
          const start = new Date(event.start.dateTime || event.start.date);
          const end = new Date(event.end.dateTime || event.end.date);
          
          return {
            start: start.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
            end: end.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
            isAvailable: false,
            summary: event.summary || 'Meşgul'
          };
        });

        // Merge with existing slots
        existingAvailability.timeSlots = [
          ...(existingAvailability.timeSlots || []),
          ...busySlots
        ];

        // Save updated availability
        await faculty.save();
        console.log(`Updated availability for ${faculty.name} on ${targetDate.toDateString()}`);
      }
    }
  } catch (error) {
    console.error('Failed to update availability from Google Calendar:', error);
    // Don't fail the appointment creation if Google Calendar fails
  }
};

// @desc    Get faculty by slug
// @route   GET /api/appointments/faculty/:slug
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

// @desc    Get student appointments
// @route   GET /api/appointments/student
// @access  Private (Student)
router.get('/student', authMiddleware, asyncHandler(async (req, res) => {
  const { user } = req;
  
  if (!user || user.role !== 'student') {
    return res.status(403).json({
      success: false,
      message: 'Bu işlem için öğrenci yetkisi gerekli'
    });
  }

  const appointments = await Appointment.findByStudent(user.email);

  res.json({
    success: true,
    data: appointments
  });
}));

// @desc    Get faculty list for students
// @route   GET /api/appointments/faculty-list
// @access  Public
router.get('/faculty-list', asyncHandler(async (req, res) => {
  const faculty = await User.find({ 
    $or: [
      { role: 'faculty', isActive: true },
      { role: 'admin', isActive: true, slug: { $exists: true, $ne: null } }
    ]
  }).select('name title department office phone email picture slug isActive role');

  res.json({
    success: true,
    data: faculty
  });
}));

// @desc    Get available slots for faculty
// @route   GET /api/appointments/faculty/:slug/slots
// @access  Public
router.get('/faculty/:slug/slots', asyncHandler(async (req, res) => {
  const { slug } = req.params;
  const { date } = req.query;

  if (!date) {
    return res.status(400).json({
      success: false,
      message: 'Tarih parametresi gerekli'
    });
  }

  const faculty = await User.findBySlug(slug);

  if (!faculty) {
    return res.status(404).json({
      success: false,
      message: 'Öğretim elemanı bulunamadı'
    });
  }

  const targetDate = new Date(date);
  const dayName = targetDate.toLocaleDateString('en-US', { weekday: 'long' });

  const availability = faculty.availability.find(a => a.day === dayName && a.isActive);

  if (!availability || !availability.timeSlots || availability.timeSlots.length === 0) {
    return res.json({
      success: true,
      data: { slots: [] }
    });
  }

  // Get existing slots from database
  let slots = await AppointmentSlot.findByFaculty(faculty._id, { date: targetDate });

  // If no slots exist for this date, generate them
  if (slots.length === 0) {
    const generatedSlots = await AppointmentSlot.generateSlotsForDate(faculty._id, targetDate, faculty.availability);
    
    if (generatedSlots.length > 0) {
      await AppointmentSlot.insertMany(generatedSlots);
      slots = await AppointmentSlot.findByFaculty(faculty._id, { date: targetDate });
    }
  }

  // Format slots for response
  const formattedSlots = slots.map(slot => ({
    startTime: slot.startTime,
    endTime: slot.endTime,
    available: slot.canBeBooked(),
    slotId: slot._id,
    status: slot.status,
    isBooked: slot.isBooked
  }));

  res.json({
    success: true,
    data: { slots: formattedSlots }
  });
}));

// @desc    Create appointment
// @route   POST /api/appointments
// @access  Public
router.post('/', [
  body('studentName').trim().isLength({ min: 2, max: 100 }).withMessage('Öğrenci adı 2-100 karakter arasında olmalıdır'),
  body('studentId').trim().isLength({ min: 1, max: 20 }).withMessage('Öğrenci numarası 1-20 karakter arasında olmalıdır'),
  body('studentEmail').isEmail().withMessage('Geçerli bir e-posta adresi giriniz'),
  body('topic').isIn([
    'Staj görüşmesi',
    'Ders destek talebi',
    'Bitirme projesi danışmanlığı',
    'Kariyer gelişimi/mentorluk',
    'Akademik danışmanlık',
    'Ders değerlendirme görüşmesi'
  ]).withMessage('Geçerli bir görüşme konusu seçiniz'),
  body('description').optional().trim().isLength({ max: 500 }).withMessage('Açıklama 500 karakterden uzun olamaz'),
  body('facultyId').isMongoId().withMessage('Geçerli bir öğretim elemanı seçiniz'),
  body('date').isISO8601().withMessage('Geçerli bir tarih giriniz'),
  body('startTime').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Geçerli bir başlangıç saati giriniz'),
  body('endTime').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Geçerli bir bitiş saati giriniz')
], asyncHandler(async (req, res) => {
  // Check validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validasyon hatası',
      errors: errors.array()
    });
  }

  const {
    studentName,
    studentId,
    studentEmail,
    topic,
    description,
    facultyId,
    date,
    startTime,
    endTime,
    duration
  } = req.body;

  // Check if faculty exists
  const faculty = await User.findById(facultyId);
  if (!faculty || !faculty.isActive) {
    return res.status(404).json({
      success: false,
      message: 'Öğretim elemanı bulunamadı'
    });
  }

  // Automatically update availability from Google Calendar
  await updateAvailabilityFromGoogleCalendar(faculty, appointmentDate);

  // Check if date and time is valid (same day is allowed if time is in future)
  const appointmentDate = new Date(date);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()); // Start of today
  
  // If appointment is today, check if time is in the future
  if (appointmentDate.getTime() === today.getTime()) {
    const [startHour, startMinute] = startTime.split(':').map(Number);
    const appointmentTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), startHour, startMinute);
    
    if (appointmentTime <= now) {
      return res.status(400).json({
        success: false,
        message: 'Randevu saati gelecekte olmalıdır'
      });
    }
  } else if (appointmentDate <= today) {
    // If appointment is not today, it must be in the future
    return res.status(400).json({
      success: false,
      message: 'Randevu tarihi gelecekte olmalıdır'
    });
  }

  // Check if slot exists and is available
  const slot = await AppointmentSlot.findOne({
    facultyId,
    date: appointmentDate,
    startTime,
    status: 'available'
  });

  if (!slot) {
    return res.status(400).json({
      success: false,
      message: 'Bu saatte müsait slot bulunmamaktadır'
    });
  }

  if (!slot.canBeBooked()) {
    return res.status(400).json({
      success: false,
      message: 'Bu slot daha önce rezerve edilmiş'
    });
  }

  // Check if the requested duration fits within the slot
  const slotDuration = slot.duration || 15;
  const requestedDuration = duration || 15;
  
  if (requestedDuration > slotDuration) {
    return res.status(400).json({
      success: false,
      message: `Bu slot maksimum ${slotDuration} dakika randevu alabilir`
    });
  }

  // Create appointment
  const appointment = new Appointment({
    studentName,
    studentId,
    studentEmail,
    topic,
    description,
    facultyId,
    facultyName: faculty.name,
    date: appointmentDate,
    startTime,
    endTime,
    ipAddress: req.ip,
    userAgent: req.get('User-Agent')
  });

  await appointment.save();

  // Update slot status
  await slot.book(appointment._id);

  // Send email notification to faculty
  try {
    await sendAppointmentRequestEmail(
      faculty.email,
      faculty.name,
      {
        studentName: appointment.studentName,
        studentId: appointment.studentId,
        studentEmail: appointment.studentEmail,
        topic: appointment.topic,
        description: appointment.description,
        date: appointment.date,
        startTime: appointment.startTime,
        endTime: appointment.endTime
      }
    );
    console.log('Appointment request email sent to faculty:', faculty.email);
  } catch (emailError) {
    console.error('Failed to send appointment request email:', emailError);
    // Don't fail the appointment creation if email fails
  }

  res.status(201).json({
    success: true,
    data: appointment,
    message: 'Randevu talebi başarıyla oluşturuldu'
  });
}));

// @desc    Check appointment status
// @route   GET /api/appointments/check/:id
// @access  Public
router.get('/check/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { studentEmail } = req.query;

  if (!studentEmail) {
    return res.status(400).json({
      success: false,
      message: 'Öğrenci e-posta adresi gerekli'
    });
  }

  const appointment = await Appointment.findOne({
    _id: id,
    studentEmail: studentEmail.toLowerCase()
  });

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

// @desc    Get appointments by student email
// @route   GET /api/appointments/student/:email
// @access  Public
router.get('/student/:email', asyncHandler(async (req, res) => {
  const { email } = req.params;

  const appointments = await Appointment.findByStudent(email.toLowerCase());

  res.json({
    success: true,
    data: appointments
  });
}));

// @desc    Cancel appointment
// @route   PUT /api/appointments/:id/cancel
// @access  Public
router.put('/:id/cancel', [
  body('studentEmail').isEmail().withMessage('Geçerli bir e-posta adresi giriniz'),
  body('cancellationReason').optional().isLength({ max: 200 }).withMessage('İptal gerekçesi 200 karakterden uzun olamaz')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validasyon hatası',
      errors: errors.array()
    });
  }

  const { studentEmail, cancellationReason } = req.body;
  const { id } = req.params;

  const appointment = await Appointment.findOne({
    _id: id,
    studentEmail: studentEmail.toLowerCase(),
    status: { $in: ['pending', 'approved'] }
  });

  if (!appointment) {
    return res.status(404).json({
      success: false,
      message: 'Randevu bulunamadı'
    });
  }

  if (!appointment.canBeCancelled()) {
    return res.status(400).json({
      success: false,
      message: 'Randevu iptal edilemez (2 saatten az kaldı)'
    });
  }

  appointment.status = 'cancelled';
  appointment.cancelledBy = 'student';
  appointment.cancelledAt = new Date();
  appointment.cancellationReason = cancellationReason;

  await appointment.save();

  res.json({
    success: true,
    data: appointment,
    message: 'Randevu iptal edildi'
  });
}));

export default router; 