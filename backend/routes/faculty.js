import express from 'express';
import { body, validationResult } from 'express-validator';
import { google } from 'googleapis';
import User from '../models/User.js';
import Appointment from '../models/Appointment.js';
import AppointmentSlot from '../models/AppointmentSlot.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { facultyMiddleware, authMiddleware } from '../middleware/auth.js';
import { sendAppointmentApprovalEmail } from '../services/emailService.js';

const router = express.Router();

// Apply faculty middleware only (auth middleware is already applied in server.js)
// Note: Admin users should also have access to faculty routes
router.use(facultyMiddleware);

// @desc    Get faculty profile
// @route   GET /api/faculty/profile
// @access  Private
router.get('/profile', asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).select('-password');

  res.json({
    success: true,
    data: user
  });
}));

// @desc    Update faculty profile
// @route   PUT /api/faculty/profile
// @access  Private
router.put('/profile', asyncHandler(async (req, res) => {
  const { name, email, phone, office, website, title, department } = req.body;

  const user = await User.findById(req.user.id);

  if (name) user.name = name;
  if (email) user.email = email;
  if (title) user.title = title;
  if (department) user.department = department;
  if (office) user.office = office;
  if (phone) user.phone = phone;
  if (website) user.website = website;

  await user.save();

  res.json({
    success: true,
    data: user,
    message: 'Profil başarıyla güncellendi'
  });
}));

// @desc    Get faculty availability
// @route   GET /api/faculty/availability
// @access  Private
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

// @desc    Update faculty availability
// @route   PUT /api/faculty/availability
// @access  Private
router.put('/availability', asyncHandler(async (req, res) => {
  const { availability, slotDuration } = req.body;

  const user = await User.findById(req.user.id);

  if (availability) {
    user.availability = availability;
  }

  if (slotDuration) {
    // Validate slot duration before saving
    if (slotDuration < 10 || slotDuration > 20) {
      return res.status(400).json({
        success: false,
        error: 'Slot süresi 10-20 dakika arasında olmalıdır'
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
    message: 'Müsaitlik saatleri güncellendi'
  });
}));

// @desc    Get faculty appointments
// @route   GET /api/faculty/appointments
// @access  Private
router.get('/appointments', asyncHandler(async (req, res) => {
  const { status, date, page = 1, limit = 10 } = req.query;

  const query = { facultyId: req.user.id };

  if (status) {
    query.status = status;
  }

  if (date) {
    const startDate = new Date(date);
    const endDate = new Date(date);
    endDate.setDate(endDate.getDate() + 1);
    query.date = { $gte: startDate, $lt: endDate };
  }

  const skip = (page - 1) * limit;

  const appointments = await Appointment.find(query)
    .sort({ date: 1, startTime: 1 })
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
// @route   GET /api/faculty/appointments/:id
// @access  Private
router.get('/appointments/:id', asyncHandler(async (req, res) => {
  const appointment = await Appointment.findOne({
    _id: req.params.id,
    facultyId: req.user.id
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

// @desc    Approve appointment
// @route   PUT /api/faculty/appointments/:id/approve
// @access  Private
router.put('/appointments/:id/approve', asyncHandler(async (req, res) => {
  const appointment = await Appointment.findOne({
    _id: req.params.id,
    facultyId: req.user.id,
    status: 'pending'
  });

  if (!appointment) {
    return res.status(404).json({
      success: false,
      message: 'Bekleyen randevu bulunamadı'
    });
  }

  appointment.status = 'approved';
  appointment.facultyNotified = true;

  // Update slot status to booked
  const slot = await AppointmentSlot.findOne({
    facultyId: req.user.id,
    date: appointment.date,
    startTime: appointment.startTime
  });

  if (slot) {
    slot.status = 'booked';
    slot.isBooked = true;
    slot.isAvailable = false;
    await slot.save();
  }

  // Create Google Calendar event if faculty has Google Calendar connected
  if (req.user.googleAccessToken) {
    try {
      const oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        process.env.GOOGLE_REDIRECT_URI
      );

      oauth2Client.setCredentials({
        access_token: req.user.googleAccessToken,
        refresh_token: req.user.googleRefreshToken
      });

      // Create Google Meet link
      const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
      
      const event = {
        summary: `Randevu: ${appointment.topic}`,
        description: `Öğrenci: ${appointment.studentName} (${appointment.studentId})\nE-posta: ${appointment.studentEmail}\nAçıklama: ${appointment.description || 'Açıklama yok'}`,
        start: {
          dateTime: new Date(appointment.date.getTime() + appointment.startTime.split(':').reduce((acc, time) => acc * 60 + parseInt(time), 0) * 60000).toISOString(),
          timeZone: 'Europe/Istanbul',
        },
        end: {
          dateTime: new Date(appointment.date.getTime() + appointment.endTime.split(':').reduce((acc, time) => acc * 60 + parseInt(time), 0) * 60000).toISOString(),
          timeZone: 'Europe/Istanbul',
        },
        location: req.user.office || 'Ofis belirtilmemiş',
        attendees: [
          { email: appointment.studentEmail, displayName: appointment.studentName }
        ],
        reminders: {
          useDefault: false,
          overrides: [
            { method: 'email', minutes: 24 * 60 },
            { method: 'popup', minutes: 15 },
          ],
        },
        conferenceData: {
          createRequest: {
            requestId: `meet-${appointment._id}`,
            conferenceSolutionKey: {
              type: 'hangoutsMeet'
            }
          }
        },
        colorId: '1' // Blue color
      };

      const response = await calendar.events.insert({
        calendarId: 'primary',
        resource: event,
        conferenceDataVersion: 1
      });

      // Update appointment with Google Calendar event ID and Meet link
      appointment.googleCalendarEventId = response.data.id;
      appointment.googleMeetLink = response.data.conferenceData?.entryPoints?.[0]?.uri || null;
      await appointment.save();

      console.log('Google Calendar event created:', response.data.id);
      
      // Send approval email with Google Meet link
      try {
        await sendAppointmentApprovalEmail(
          appointment.studentEmail,
          appointment.studentName,
          {
            facultyName: req.user.name,
            topic: appointment.topic,
            description: appointment.description,
            date: appointment.date,
            startTime: appointment.startTime,
            endTime: appointment.endTime
          },
          appointment.googleMeetLink
        );
        console.log('Approval email sent to student:', appointment.studentEmail);
      } catch (emailError) {
        console.error('Failed to send approval email:', emailError);
      }

    } catch (error) {
      console.error('Failed to create Google Calendar event:', error);
      // Don't fail the appointment approval if Google Calendar fails
    }
  } else {
    // Send approval email without Google Meet link
    try {
      await sendAppointmentApprovalEmail(
        appointment.studentEmail,
        appointment.studentName,
        {
          facultyName: req.user.name,
          topic: appointment.topic,
          description: appointment.description,
          date: appointment.date,
          startTime: appointment.startTime,
          endTime: appointment.endTime
        }
      );
      console.log('Approval email sent to student:', appointment.studentEmail);
    } catch (emailError) {
      console.error('Failed to send approval email:', emailError);
    }
  }

  await appointment.save();

  res.json({
    success: true,
    data: appointment,
    message: 'Randevu onaylandı'
  });
}));

// @desc    Reject appointment
// @route   PUT /api/faculty/appointments/:id/reject
// @access  Private
router.put('/appointments/:id/reject', asyncHandler(async (req, res) => {
  const { rejectionReason } = req.body;

  const appointment = await Appointment.findOne({
    _id: req.params.id,
    facultyId: req.user.id,
    status: 'pending'
  });

  if (!appointment) {
    return res.status(404).json({
      success: false,
      message: 'Bekleyen randevu bulunamadı'
    });
  }

  appointment.status = 'rejected';
  appointment.rejectionReason = rejectionReason;
  appointment.facultyNotified = true;

  // Update slot status back to available
  const slot = await AppointmentSlot.findOne({
    facultyId: req.user.id,
    date: appointment.date,
    startTime: appointment.startTime
  });

  if (slot) {
    slot.status = 'available';
    slot.isBooked = false;
    slot.isAvailable = true;
    slot.appointmentId = null;
    await slot.save();
  }

  await appointment.save();

  res.json({
    success: true,
    data: appointment,
    message: 'Randevu reddedildi'
  });
}));

// @desc    Cancel appointment
// @route   PUT /api/faculty/appointments/:id/cancel
// @access  Private
router.put('/appointments/:id/cancel', asyncHandler(async (req, res) => {
  const appointment = await Appointment.findOne({
    _id: req.params.id,
    facultyId: req.user.id,
    status: { $in: ['pending', 'approved'] }
  });

  if (!appointment) {
    return res.status(404).json({
      success: false,
      message: 'Randevu bulunamadı'
    });
  }

  appointment.status = 'cancelled';
  appointment.facultyNotified = true;

  // Update slot status back to available
  const slot = await AppointmentSlot.findOne({
    facultyId: req.user.id,
    date: appointment.date,
    startTime: appointment.startTime
  });

  if (slot) {
    slot.status = 'available';
    slot.isBooked = false;
    slot.isAvailable = true;
    slot.appointmentId = null;
    await slot.save();
  }

  await appointment.save();

  res.json({
    success: true,
    data: appointment,
    message: 'Randevu iptal edildi'
  });
}));

// @desc    Update appointment
// @route   PUT /api/faculty/appointments/:id
// @access  Private
router.put('/appointments/:id', asyncHandler(async (req, res) => {
  const { status, feedback, rejectionReason } = req.body;

  const appointment = await Appointment.findOne({
    _id: req.params.id,
    facultyId: req.user.id
  });

  if (!appointment) {
    return res.status(404).json({
      success: false,
      message: 'Randevu bulunamadı'
    });
  }

  // Update appointment fields
  if (status) {
    appointment.status = status;
  }

  if (feedback) {
    appointment.feedback = feedback;
  }

  if (rejectionReason) {
    appointment.rejectionReason = rejectionReason;
  }

  appointment.facultyNotified = true;

  // Update slot status based on new status
  const slot = await AppointmentSlot.findOne({
    facultyId: req.user.id,
    date: appointment.date,
    startTime: appointment.startTime
  });

  if (slot) {
    if (status === 'approved') {
      slot.status = 'booked';
      slot.isBooked = true;
      slot.isAvailable = false;
    } else if (status === 'rejected' || status === 'cancelled') {
      slot.status = 'available';
      slot.isBooked = false;
      slot.isAvailable = true;
      slot.appointmentId = null;
    }
    await slot.save();
  }

  await appointment.save();

  res.json({
    success: true,
    data: appointment,
    message: 'Randevu güncellendi'
  });
}));

// @desc    Get faculty statistics
// @route   GET /api/faculty/stats
// @access  Private
router.get('/stats', asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;

  const start = startDate ? new Date(startDate) : new Date(new Date().setDate(new Date().getDate() - 30));
  const end = endDate ? new Date(endDate) : new Date();

  const stats = await Appointment.getStats(req.user.id, start, end);

  // Get recent appointments
  const recentAppointments = await Appointment.find({
    facultyId: req.user.id,
    date: { $gte: new Date() }
  })
  .sort({ date: 1, startTime: 1 })
  .limit(5);

  res.json({
    success: true,
    data: {
      stats,
      recentAppointments
    }
  });
}));

// @desc    Get available slots for a date
// @route   GET /api/faculty/slots/:date
// @access  Private
router.get('/slots/:date', asyncHandler(async (req, res) => {
  const { date } = req.params;
  const targetDate = new Date(date);

  const user = await User.findById(req.user.id).select('availability slotDuration');
  const dayName = targetDate.toLocaleDateString('en-US', { weekday: 'long' });

  const availability = user.availability.find(a => a.day === dayName && a.isActive);

  if (!availability || !availability.timeSlots || availability.timeSlots.length === 0) {
    return res.json({
      success: true,
      data: { slots: [] }
    });
  }

  // Get existing slots from database
  let slots = await AppointmentSlot.findByFaculty(req.user.id, { date: targetDate });

  // If no slots exist for this date, generate them
  if (slots.length === 0) {
    const generatedSlots = await AppointmentSlot.generateSlotsForDate(req.user.id, targetDate, user.availability);
    
    if (generatedSlots.length > 0) {
      await AppointmentSlot.insertMany(generatedSlots);
      slots = await AppointmentSlot.findByFaculty(req.user.id, { date: targetDate });
    }
  }

  // Format slots for response
  const formattedSlots = slots.map(slot => ({
    startTime: slot.startTime,
    endTime: slot.endTime,
    available: slot.canBeBooked(),
    slotId: slot._id,
    status: slot.status,
    appointmentId: slot.appointmentId,
    isBooked: slot.isBooked
  }));

  res.json({
    success: true,
    data: { slots: formattedSlots }
  });
}));

// @desc    Get faculty QR code
// @route   GET /api/faculty/qr-code
// @access  Private
router.get('/qr-code', asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).select('qrCodeUrl slug');

  res.json({
    success: true,
    data: {
      qrCodeUrl: user.qrCodeUrl
    }
  });
}));

// @desc    Generate faculty QR code
// @route   POST /api/faculty/qr-code
// @access  Private
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

// @desc    Get Google OAuth URL
// @route   GET /api/faculty/google/auth-url
// @access  Private
router.get('/google/auth-url', asyncHandler(async (req, res) => {
  const { google } = await import('googleapis');
  
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );

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
    data: {
      url: authUrl
    }
  });
}));

// @desc    Google OAuth callback
// @route   GET /api/faculty/google/callback
// @access  Public
router.get('/google/callback', asyncHandler(async (req, res) => {
  const { code } = req.query;
  
  if (!code) {
    return res.status(400).json({
      success: false,
      message: 'Authorization code is required'
    });
  }

  try {
    const { google } = await import('googleapis');
    
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );

    const { tokens } = await oauth2Client.getToken(code);
    
    // Store tokens in user's profile
    const user = await User.findById(req.user.id);
    user.googleTokens = tokens;
    user.googleConnected = true;
    await user.save();

    res.json({
      success: true,
      message: 'Google Calendar başarıyla bağlandı'
    });
  } catch (error) {
    console.error('Google OAuth callback error:', error);
    res.status(500).json({
      success: false,
      message: 'Google Calendar bağlantısı başarısız'
    });
  }
}));

export default router; 