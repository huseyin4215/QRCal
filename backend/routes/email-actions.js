import express from 'express';
import { body, validationResult } from 'express-validator';
import Appointment from '../models/Appointment.js';
import AppointmentSlot from '../models/AppointmentSlot.js';
import User from '../models/User.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { sendAppointmentApprovalEmail, sendAppointmentRejectionEmail } from '../services/emailService.js';
import { google } from 'googleapis';

const router = express.Router();

// @desc    Approve appointment via email token
// @route   GET /api/email-actions/approve/:token
// @access  Public (token-based)
router.get('/approve/:token', asyncHandler(async (req, res) => {
  const { token } = req.params;
  
  console.log('Email Action - Approve GET request for token:', token);

  let appointment;
  try {
    appointment = await Appointment.findOne({
      emailActionToken: token,
      emailActionTokenExpiry: { $gt: new Date() },
      status: 'pending'
    });
    
    console.log('Email Action - Appointment found:', appointment ? 'Yes' : 'No');
  } catch (dbError) {
    console.error('Email Action - Database error:', dbError);
    throw dbError;
  }

  if (!appointment) {
    return res.status(404).json({
      success: false,
      message: 'Geçersiz veya süresi dolmuş token, ya da randevu zaten işleme alınmış'
    });
  }

  // Get faculty info
  const faculty = await User.findById(appointment.facultyId);
  if (!faculty) {
    return res.status(404).json({
      success: false,
      message: 'Öğretim elemanı bulunamadı'
    });
  }

  appointment.status = 'approved';
  appointment.facultyNotified = true;

  // Update slot status to booked
  const slot = await AppointmentSlot.findOne({
    facultyId: appointment.facultyId,
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
  if (faculty.googleAccessToken) {
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

      // Format date as YYYY-MM-DD (appointment.date is stored in UTC, we just need the date part)
      const dateStr = appointment.date.toISOString().split('T')[0];
      // Create datetime strings in local format (Google Calendar will use timeZone to interpret)
      const startDateTime = `${dateStr}T${appointment.startTime}:00`;
      const endDateTime = `${dateStr}T${appointment.endTime}:00`;

      const event = {
        summary: `Randevu: ${appointment.topicName || appointment.topic}`,
        description: `Öğrenci: ${appointment.studentName} (${appointment.studentId})\nE-posta: ${appointment.studentEmail}\nAçıklama: ${appointment.description || 'Açıklama yok'}`,
        start: {
          dateTime: startDateTime,
          timeZone: 'Europe/Istanbul',
        },
        end: {
          dateTime: endDateTime,
          timeZone: 'Europe/Istanbul',
        },
        location: faculty.office || 'Ofis belirtilmemiş',
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
        colorId: '1'
      };

      const response = await calendar.events.insert({
        calendarId: 'primary',
        resource: event,
        conferenceDataVersion: 1
      });

      appointment.googleCalendarEventId = response.data.id;
      appointment.googleMeetLink = response.data.conferenceData?.entryPoints?.[0]?.uri || null;

      console.log('Google Calendar event created:', response.data.id);
    } catch (error) {
      console.error('Failed to create Google Calendar event:', error);
    }
  }

  await appointment.save();

  // Send approval email to student
  try {
    await sendAppointmentApprovalEmail(
      appointment.studentEmail,
      appointment.studentName,
      {
        facultyName: faculty.title ? `${faculty.title} ${faculty.name}` : faculty.name,
        topic: appointment.topicName || appointment.topic,
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

  // Redirect to success page or return JSON
  res.json({
    success: true,
    data: appointment,
    message: 'Randevu başarıyla onaylandı. Öğrenciye bildirim gönderildi.'
  });
}));

// @desc    Show reject form (returns HTML page)
// @route   GET /api/email-actions/reject/:token
// @access  Public (token-based)
router.get('/reject/:token', asyncHandler(async (req, res) => {
  const { token } = req.params;
  
  console.log('Email Action - Reject GET request for token:', token);

  let appointment;
  try {
    appointment = await Appointment.findOne({
      emailActionToken: token,
      emailActionTokenExpiry: { $gt: new Date() },
      status: 'pending'
    }).populate('facultyId', 'name');
    
    console.log('Email Action - Appointment found:', appointment ? 'Yes' : 'No');
  } catch (dbError) {
    console.error('Email Action - Database error:', dbError);
    throw dbError;
  }

  if (!appointment) {
    return res.status(404).send(`
      <!DOCTYPE html>
      <html lang="tr">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Hata - Randevu Sistemi</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0;
            padding: 20px;
          }
          .container {
            background: white;
            border-radius: 12px;
            padding: 40px;
            max-width: 500px;
            width: 100%;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
          }
          .error-icon {
            font-size: 64px;
            text-align: center;
            margin-bottom: 20px;
          }
          h1 {
            color: #dc2626;
            text-align: center;
            margin: 0 0 16px 0;
            font-size: 24px;
          }
          p {
            color: #6b7280;
            text-align: center;
            margin: 0;
            line-height: 1.6;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="error-icon">⚠️</div>
          <h1>Geçersiz veya Süresi Dolmuş Link</h1>
          <p>Bu randevu linki geçersiz, süresi dolmuş veya randevu zaten işleme alınmış olabilir.</p>
        </div>
      </body>
      </html>
    `);
  }

  // Return HTML form for rejection
  res.send(`
    <!DOCTYPE html>
    <html lang="tr">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Randevu Reddetme - Randevu Sistemi</title>
      <style>
        * {
          box-sizing: border-box;
        }
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0;
          padding: 20px;
        }
        .container {
          background: white;
          border-radius: 12px;
          padding: 40px;
          max-width: 600px;
          width: 100%;
          box-shadow: 0 20px 60px rgba(0,0,0,0.3);
        }
        h1 {
          color: #1f2937;
          text-align: center;
          margin: 0 0 24px 0;
          font-size: 28px;
        }
        .appointment-details {
          background: #f3f4f6;
          padding: 20px;
          border-radius: 8px;
          margin-bottom: 24px;
        }
        .appointment-details h3 {
          color: #374151;
          margin: 0 0 12px 0;
          font-size: 18px;
        }
        .appointment-details p {
          color: #6b7280;
          margin: 8px 0;
          line-height: 1.6;
        }
        .appointment-details strong {
          color: #1f2937;
        }
        .form-group {
          margin-bottom: 20px;
        }
        label {
          display: block;
          color: #374151;
          font-weight: 600;
          margin-bottom: 8px;
        }
        textarea {
          width: 100%;
          padding: 12px;
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          font-family: inherit;
          font-size: 14px;
          resize: vertical;
          min-height: 100px;
          transition: border-color 0.2s;
        }
        textarea:focus {
          outline: none;
          border-color: #667eea;
        }
        .button-group {
          display: flex;
          gap: 12px;
        }
        button {
          flex: 1;
          padding: 14px 24px;
          border: none;
          border-radius: 8px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }
        .btn-reject {
          background: #dc2626;
          color: white;
        }
        .btn-reject:hover {
          background: #b91c1c;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(220, 38, 38, 0.4);
        }
        .btn-reject:disabled {
          background: #9ca3af;
          cursor: not-allowed;
          transform: none;
        }
        .btn-cancel {
          background: #e5e7eb;
          color: #374151;
        }
        .btn-cancel:hover {
          background: #d1d5db;
        }
        .message {
          padding: 12px 16px;
          border-radius: 8px;
          margin-bottom: 20px;
          display: none;
        }
        .message.success {
          background: #d1fae5;
          color: #065f46;
          border: 1px solid #10b981;
        }
        .message.error {
          background: #fee2e2;
          color: #991b1b;
          border: 1px solid #dc2626;
        }
        .message.show {
          display: block;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>Randevu Reddetme</h1>
        
        <div class="appointment-details">
          <h3>Randevu Detayları</h3>
          <p><strong>Öğrenci Adı:</strong> ${appointment.studentName}</p>
          <p><strong>Öğrenci Numarası:</strong> ${appointment.studentId}</p>
          <p><strong>E-posta:</strong> ${appointment.studentEmail}</p>
          <p><strong>Konu:</strong> ${appointment.topicName || appointment.topic}</p>
          <p><strong>Tarih:</strong> ${new Date(appointment.date).toLocaleDateString('tr-TR')}</p>
          <p><strong>Saat:</strong> ${appointment.startTime} - ${appointment.endTime}</p>
          ${appointment.description ? `<p><strong>Açıklama:</strong> ${appointment.description}</p>` : ''}
        </div>

        <div id="message" class="message"></div>

        <form id="rejectForm">
          <div class="form-group">
            <label for="rejectionReason">Reddetme Nedeni:</label>
            <textarea 
              id="rejectionReason" 
              name="rejectionReason" 
              placeholder="Lütfen randevuyu neden reddettiğinizi belirtin (isteğe bağlı)"
              maxlength="200"
            ></textarea>
            <small style="color: #6b7280; font-size: 12px;">Maksimum 200 karakter</small>
          </div>

          <div class="button-group">
            <button type="button" class="btn-cancel" onclick="window.close()">İptal</button>
            <button type="submit" class="btn-reject" id="submitBtn">Reddet</button>
          </div>
        </form>
      </div>

      <script>
        document.getElementById('rejectForm').addEventListener('submit', async (e) => {
          e.preventDefault();
          
          const submitBtn = document.getElementById('submitBtn');
          const message = document.getElementById('message');
          const rejectionReason = document.getElementById('rejectionReason').value;

          submitBtn.disabled = true;
          submitBtn.textContent = 'İşleniyor...';

          try {
            const response = await fetch('/api/email-actions/reject/${token}', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ rejectionReason })
            });

            const data = await response.json();

            if (data.success) {
              message.className = 'message success show';
              message.textContent = 'Randevu başarıyla reddedildi. Öğrenciye bildirim gönderildi.';
              
              setTimeout(() => {
                window.close();
              }, 3000);
            } else {
              throw new Error(data.message || 'Bir hata oluştu');
            }
          } catch (error) {
            message.className = 'message error show';
            message.textContent = error.message || 'Randevu reddedilirken bir hata oluştu.';
            submitBtn.disabled = false;
            submitBtn.textContent = 'Reddet';
          }
        });
      </script>
    </body>
    </html>
  `);
}));

// @desc    Process rejection via email token
// @route   POST /api/email-actions/reject/:token
// @access  Public (token-based)
router.post('/reject/:token', [
  body('rejectionReason').optional().trim().isLength({ max: 200 }).withMessage('Red gerekçesi 200 karakterden uzun olamaz')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validasyon hatası',
      errors: errors.array()
    });
  }

  const { token } = req.params;
  const { rejectionReason } = req.body;

  const appointment = await Appointment.findOne({
    emailActionToken: token,
    emailActionTokenExpiry: { $gt: new Date() },
    status: 'pending'
  });

  if (!appointment) {
    return res.status(404).json({
      success: false,
      message: 'Geçersiz veya süresi dolmuş token, ya da randevu zaten işleme alınmış'
    });
  }

  // Get faculty info
  const faculty = await User.findById(appointment.facultyId);
  if (!faculty) {
    return res.status(404).json({
      success: false,
      message: 'Öğretim elemanı bulunamadı'
    });
  }

  appointment.status = 'rejected';
  appointment.rejectionReason = rejectionReason;
  appointment.facultyNotified = true;

  // Update slot status back to available
  const slot = await AppointmentSlot.findOne({
    facultyId: appointment.facultyId,
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

  // Send rejection email to student
  try {
    await sendAppointmentRejectionEmail(
      appointment.studentEmail,
      appointment.studentName,
      {
        facultyName: faculty.title ? `${faculty.title} ${faculty.name}` : faculty.name,
        topic: appointment.topicName || appointment.topic,
        description: appointment.description,
        date: appointment.date,
        startTime: appointment.startTime,
        endTime: appointment.endTime
      },
      rejectionReason
    );
    console.log('Rejection email sent to student:', appointment.studentEmail);
  } catch (emailError) {
    console.error('Failed to send rejection email:', emailError);
  }

  res.json({
    success: true,
    data: appointment,
    message: 'Randevu başarıyla reddedildi. Öğrenciye bildirim gönderildi.'
  });
}));

export default router;

