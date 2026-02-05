import express from 'express';
import { body, validationResult } from 'express-validator';
import mongoose from 'mongoose';
import User from '../models/User.js';
import Appointment from '../models/Appointment.js';
import AppointmentSlot from '../models/AppointmentSlot.js';
import Geofence from '../models/Geofence.js';
import Notification from '../models/Notification.js';
import Topic from '../models/Topic.js';
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

  // Get slot duration from system settings
  let slotDuration = 15;
  try {
    const SystemSettings = mongoose.model('SystemSettings');
    const setting = await SystemSettings.findOne({ key: 'slotDuration' });
    if (setting && setting.value) {
      slotDuration = parseInt(setting.value);
    }
  } catch (err) {
    console.error('Error fetching slot duration:', err);
  }

  // Always generate slots to ensure all available times are covered
  const generatedSlots = await AppointmentSlot.generateSlotsForDate(
    faculty._id, 
    targetDate, 
    faculty.availability,
    slotDuration
  );

  console.log(`[SLOTS DEBUG] Date: ${date}, Day: ${dayName}, Generated: ${generatedSlots.length} new slots`);

  // Insert new slots if any (duplicates will be ignored)
  if (generatedSlots.length > 0) {
    try {
      await AppointmentSlot.insertMany(generatedSlots, { ordered: false });
      console.log(`[SLOTS DEBUG] Inserted ${generatedSlots.length} new slots`);
    } catch (err) {
      // Ignore duplicate key errors (E11000)
      if (err.code !== 11000 && !err.message?.includes('duplicate key')) {
        console.error('[SLOTS DEBUG] Error inserting slots:', err);
      }
    }
  }

  // Get all slots for this date
  let slots = await AppointmentSlot.findByFaculty(faculty._id, { date: targetDate });
  
  console.log(`[SLOTS DEBUG] findByFaculty returned ${slots.length} slots for date ${targetDate.toISOString()}`);
  if (slots.length > 0) {
    console.log(`[SLOTS DEBUG] First slot date: ${slots[0].date}, startTime: ${slots[0].startTime}`);
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
  body('topic').isMongoId().withMessage('Geçerli bir görüşme konusu seçiniz'),
  body('description').optional().trim().isLength({ max: 500 }).withMessage('Açıklama 500 karakterden uzun olamaz'),
  body('advisorOnlyWarning').optional().isBoolean().withMessage('Geçersiz uyarı değeri'),
  body('facultyId').isMongoId().withMessage('Geçerli bir öğretim elemanı seçiniz'),
  body('date').isISO8601().withMessage('Geçerli bir tarih giriniz'),
  body('startTime').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Geçerli bir başlangıç saati giriniz'),
  body('endTime').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Geçerli bir bitiş saati giriniz'),
  body('location').optional().isObject().withMessage('Geçersiz konum bilgisi'),
  body('location.latitude').optional().isFloat({ min: -90, max: 90 }).withMessage('Geçersiz enlem değeri'),
  body('location.longitude').optional().isFloat({ min: -180, max: 180 }).withMessage('Geçersiz boylam değeri'),
  body('location.accuracy').optional().isFloat({ min: 0 }).withMessage('Geçersiz doğruluk değeri'),
  body('location.timestamp').optional().isInt({ min: 0 }).withMessage('Geçersiz timestamp')
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
    duration,
    location,
    advisorOnlyWarning
  } = req.body;

  // Check if faculty exists
  const faculty = await User.findById(facultyId);
  if (!faculty || !faculty.isActive) {
    return res.status(404).json({
      success: false,
      message: 'Öğretim elemanı bulunamadı'
    });
  }

  // Check if topic exists and get topic name
  const topicDoc = await Topic.findById(topic);
  if (!topicDoc) {
    return res.status(404).json({
      success: false,
      message: 'Geçerli bir görüşme konusu seçiniz'
    });
  }
  const topicName = topicDoc.name;

  // Location verification and requirement when geofences exist
  {
    try {
      // Check if faculty has geofence restrictions
      const geofences = await Geofence.find({
        facultyId,
        isActive: true
      });

      if (geofences.length > 0) {
        // Location verification is now OPTIONAL
        // If location is provided, validate it against geofences
        // If not provided, allow appointment without location verification
        if (location) {
          // Faculty has geofence restrictions and location was provided, verify location
          let locationVerified = false;
          let closestGeofence = null;
          let minDistance = Infinity;

          for (const geofence of geofences) {
            const distance = geofence.calculateDistance(location.latitude, location.longitude);

            if (distance < minDistance) {
              minDistance = distance;
              closestGeofence = geofence;
            }
          }

          if (closestGeofence) {
            // Check accuracy requirements
            if (location.accuracy > closestGeofence.settings.maxAccuracy) {
              return res.status(400).json({
                success: false,
                message: `Konum doğruluğu yetersiz. Gerekli: ${closestGeofence.settings.maxAccuracy}m, Mevcut: ${location.accuracy}m`
              });
            }

            // Check location freshness
            const locationAge = (Date.now() - location.timestamp) / 1000; // seconds
            if (locationAge > closestGeofence.settings.locationFreshness) {
              return res.status(400).json({
                success: false,
                message: `Konum bilgisi çok eski. Gerekli: ${closestGeofence.settings.locationFreshness}s, Mevcut: ${Math.round(locationAge)}s`
              });
            }

            // Check if inside geofence
            if (closestGeofence.isPointInside(location.latitude, location.longitude)) {
              // Accept regardless of working hours
              locationVerified = true;
              // Store the verified geofence ID for later use
              location.geofenceId = closestGeofence._id;
            } else {
              return res.status(400).json({
                success: false,
                message: `Belirtilen alan dışındasınız. Mesafe: ${minDistance}m, Yarıçap: ${closestGeofence.radius}m`
              });
            }
          }

          if (!locationVerified) {
            return res.status(400).json({
              success: false,
              message: 'Konum doğrulaması başarısız. Lütfen geofence alanı içinde olduğunuzdan emin olun.'
            });
          }
        }
        // If no location provided, continue without verification (optional)
        console.log('Location not provided, proceeding without geofence verification');
      }
    } catch (error) {
      console.error('Location verification error:', error);
      return res.status(500).json({
        success: false,
        message: 'Konum doğrulaması yapılamadı'
      });
    }
  }

  // Check if date and time is valid (same day is allowed if time is in future)
  const appointmentDate = new Date(date);

  // Check daily appointment limit - same student can only have 1 appointment per day from same faculty
  const startOfDay = new Date(appointmentDate);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(appointmentDate);
  endOfDay.setHours(23, 59, 59, 999);

  const existingDailyAppointment = await Appointment.findOne({
    studentEmail: studentEmail.toLowerCase(),
    facultyId,
    date: { $gte: startOfDay, $lte: endOfDay },
    status: { $in: ['pending', 'approved'] }
  });

  if (existingDailyAppointment) {
    return res.status(400).json({
      success: false,
      message: 'Bu öğretim üyesinden bugün için zaten bir randevunuz bulunmaktadır. Aynı gün içinde aynı kişiden sadece 1 randevu alabilirsiniz.'
    });
  }

  // Check if student has another appointment at the same date and time (time conflict check)
  const existingAppointmentsSameTime = await Appointment.find({
    studentEmail: studentEmail.toLowerCase(),
    date: { $gte: startOfDay, $lte: endOfDay },
    status: { $in: ['pending', 'approved'] }
  });

  // Check for time conflicts
  const [newStartHour, newStartMinute] = startTime.split(':').map(Number);
  const [newEndHour, newEndMinute] = endTime.split(':').map(Number);
  const newStartMinutes = newStartHour * 60 + newStartMinute;
  const newEndMinutes = newEndHour * 60 + newEndMinute;

  for (const existingAppt of existingAppointmentsSameTime) {
    const [existingStartHour, existingStartMinute] = existingAppt.startTime.split(':').map(Number);
    const [existingEndHour, existingEndMinute] = existingAppt.endTime.split(':').map(Number);
    const existingStartMinutes = existingStartHour * 60 + existingStartMinute;
    const existingEndMinutes = existingEndHour * 60 + existingEndMinute;

    // Check if time ranges overlap
    // Two time ranges overlap if: newStart < existingEnd AND newEnd > existingStart
    if (newStartMinutes < existingEndMinutes && newEndMinutes > existingStartMinutes) {
      const facultyName = existingAppt.facultyName || 'Öğretim Üyesi';
      return res.status(400).json({
        success: false,
        message: `Bu tarih ve saatte zaten bir randevunuz bulunmaktadır (${existingAppt.startTime} - ${existingAppt.endTime}, ${facultyName}). Aynı saatte birden fazla randevu alamazsınız.`
      });
    }
  }

  // Automatically update availability from Google Calendar
  await updateAvailabilityFromGoogleCalendar(faculty, appointmentDate);
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
  // Use date range to handle timezone issues
  const slotDateStart = new Date(appointmentDate);
  slotDateStart.setHours(0, 0, 0, 0);
  const slotDateEnd = new Date(appointmentDate);
  slotDateEnd.setHours(23, 59, 59, 999);

  console.log(`[APPOINTMENT] Looking for slot: facultyId=${facultyId}, date=${appointmentDate.toISOString()}, startTime=${startTime}`);
  console.log(`[APPOINTMENT] Date range: ${slotDateStart.toISOString()} to ${slotDateEnd.toISOString()}`);

  // Use findOneAndUpdate with atomic operation to prevent race conditions
  // This ensures only ONE request can book the slot
  const slot = await AppointmentSlot.findOneAndUpdate(
    {
      facultyId,
      date: { $gte: slotDateStart, $lte: slotDateEnd },
      startTime,
      status: 'available',
      isBooked: false
    },
    {
      $set: {
        status: 'pending',
        isBooked: true,
        bookedAt: new Date()
      }
    },
    { new: true }
  );

  console.log(`[APPOINTMENT] Atomic slot reservation result:`, slot ? slot._id : 'null (slot already taken or not found)');

  if (!slot) {
    return res.status(400).json({
      success: false,
      message: 'Bu saat dilimi başka bir öğrenci tarafından alındı veya müsait değil. Lütfen başka bir saat seçin.'
    });
  }

  // Create appointment
  const appointment = new Appointment({
    studentName,
    studentId,
    studentEmail,
    topic,
    topicName,
    description,
    facultyId,
    facultyName: faculty.title ? `${faculty.title} ${faculty.name}` : faculty.name,
    date: appointmentDate,
    startTime,
    endTime,
    duration, // Store the duration from frontend
    advisorOnlyWarning: advisorOnlyWarning || false,
    location: location ? {
      ...location,
      verified: true
    } : undefined,
    ipAddress: req.ip,
    userAgent: req.get('User-Agent')
  });

  try {
    await appointment.save();
  } catch (saveError) {
    // If appointment save fails, release the slot
    await AppointmentSlot.findByIdAndUpdate(slot._id, {
      $set: {
        status: 'available',
        isBooked: false,
        bookedAt: null,
        appointmentId: null
      }
    });
    throw saveError;
  }

  // Create notification for faculty
  try {
    await Notification.createAppointmentNotification(facultyId, {
      _id: appointment._id,
      studentName: appointment.studentName,
      studentId: appointment.studentId,
      studentEmail: appointment.studentEmail,
      topic: appointment.topic,
      date: appointment.date,
      startTime: appointment.startTime,
      endTime: appointment.endTime
    });
    console.log('Appointment notification created for faculty:', facultyId);
  } catch (notificationError) {
    console.error('Failed to create appointment notification:', notificationError);
    // Don't fail the appointment creation if notification fails
  }

  // Update slot status to booked (was pending during atomic reservation)
  await AppointmentSlot.findByIdAndUpdate(slot._id, {
    $set: {
      status: 'booked',
      appointmentId: appointment._id
    }
  });

  // Send email notification to faculty
  try {
    await sendAppointmentRequestEmail(
      faculty.email,
      faculty.name,
      {
        studentName: appointment.studentName,
        studentId: appointment.studentId,
        studentEmail: appointment.studentEmail,
        topic: appointment.topicName,
        description: appointment.description,
        date: appointment.date,
        startTime: appointment.startTime,
        endTime: appointment.endTime
      },
      appointment.emailActionToken // Pass the token for email actions
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