import nodemailer from 'nodemailer';
import { config } from 'dotenv';

config({ path: './.env' });

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_APP_PASSWORD
    }
  });
};

// Send appointment request notification to faculty/admin
export const sendAppointmentRequestEmail = async (facultyEmail, facultyName, appointmentData) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: facultyEmail,
      subject: 'Yeni Randevu Talebi',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Yeni Randevu Talebi</h2>
          <p>Sayın ${facultyName},</p>
          <p>Yeni bir randevu talebi aldınız:</p>
          
          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #374151; margin-top: 0;">Randevu Detayları</h3>
            <p><strong>Öğrenci Adı:</strong> ${appointmentData.studentName}</p>
            <p><strong>Öğrenci Numarası:</strong> ${appointmentData.studentId}</p>
            <p><strong>E-posta:</strong> ${appointmentData.studentEmail}</p>
            <p><strong>Konu:</strong> ${appointmentData.topic}</p>
            <p><strong>Tarih:</strong> ${new Date(appointmentData.date).toLocaleDateString('tr-TR')}</p>
            <p><strong>Saat:</strong> ${appointmentData.startTime} - ${appointmentData.endTime}</p>
            ${appointmentData.description ? `<p><strong>Açıklama:</strong> ${appointmentData.description}</p>` : ''}
          </div>
          
          <p>Randevuyu onaylamak veya reddetmek için sisteme giriş yapabilirsiniz.</p>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; font-size: 14px;">
              Bu e-posta otomatik olarak gönderilmiştir. Lütfen yanıtlamayınız.
            </p>
          </div>
        </div>
      `
    };
    
    await transporter.sendMail(mailOptions);
    console.log(`Appointment request email sent to ${facultyEmail}`);
    
  } catch (error) {
    console.error('Failed to send appointment request email:', error);
    throw error;
  }
};

// Send appointment approval email to student
export const sendAppointmentApprovalEmail = async (studentEmail, studentName, appointmentData, googleMeetLink = null) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: studentEmail,
      subject: 'Randevu Talebiniz Onaylandı',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #059669;">Randevu Talebiniz Onaylandı</h2>
          <p>Sayın ${studentName},</p>
          <p>Randevu talebiniz onaylanmıştır:</p>
          
          <div style="background-color: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #166534; margin-top: 0;">Randevu Detayları</h3>
            <p><strong>Öğretim Elemanı:</strong> ${appointmentData.facultyName}</p>
            <p><strong>Konu:</strong> ${appointmentData.topic}</p>
            <p><strong>Tarih:</strong> ${new Date(appointmentData.date).toLocaleDateString('tr-TR')}</p>
            <p><strong>Saat:</strong> ${appointmentData.startTime} - ${appointmentData.endTime}</p>
            ${appointmentData.description ? `<p><strong>Açıklama:</strong> ${appointmentData.description}</p>` : ''}
          </div>
          
          ${googleMeetLink ? `
            <div style="background-color: #eff6ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #1e40af; margin-top: 0;">Google Meet Linki</h3>
              <p>Randevunuz için Google Meet linki oluşturulmuştur:</p>
              <a href="${googleMeetLink}" style="display: inline-block; background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 10px;">
                Google Meet'e Katıl
              </a>
            </div>
          ` : ''}
          
          <p>Randevunuzu iptal etmek isterseniz, en az 2 saat öncesinden iptal etmeniz gerekmektedir.</p>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; font-size: 14px;">
              Bu e-posta otomatik olarak gönderilmiştir. Lütfen yanıtlamayınız.
            </p>
          </div>
        </div>
      `
    };
    
    await transporter.sendMail(mailOptions);
    console.log(`Appointment approval email sent to ${studentEmail}`);
    
  } catch (error) {
    console.error('Failed to send appointment approval email:', error);
    throw error;
  }
};

// Send appointment rejection email to student
export const sendAppointmentRejectionEmail = async (studentEmail, studentName, appointmentData, rejectionReason) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: studentEmail,
      subject: 'Randevu Talebiniz Reddedildi',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #dc2626;">Randevu Talebiniz Reddedildi</h2>
          <p>Sayın ${studentName},</p>
          <p>Maalesef randevu talebiniz reddedilmiştir:</p>
          
          <div style="background-color: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #991b1b; margin-top: 0;">Randevu Detayları</h3>
            <p><strong>Öğretim Elemanı:</strong> ${appointmentData.facultyName}</p>
            <p><strong>Konu:</strong> ${appointmentData.topic}</p>
            <p><strong>Tarih:</strong> ${new Date(appointmentData.date).toLocaleDateString('tr-TR')}</p>
            <p><strong>Saat:</strong> ${appointmentData.startTime} - ${appointmentData.endTime}</p>
            ${rejectionReason ? `<p><strong>Red Gerekçesi:</strong> ${rejectionReason}</p>` : ''}
          </div>
          
          <p>Başka bir tarih veya saat için yeni randevu talebinde bulunabilirsiniz.</p>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; font-size: 14px;">
              Bu e-posta otomatik olarak gönderilmiştir. Lütfen yanıtlamayınız.
            </p>
          </div>
        </div>
      `
    };
    
    await transporter.sendMail(mailOptions);
    console.log(`Appointment rejection email sent to ${studentEmail}`);
    
  } catch (error) {
    console.error('Failed to send appointment rejection email:', error);
    throw error;
  }
};

// Send password reset email
export const sendPasswordResetEmail = async (toEmail, toName, resetLink) => {
  try {
    const transporter = createTransporter();
    const appName = process.env.APP_NAME || 'QRCal';

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: toEmail,
      subject: `${appName} | Şifre Sıfırlama`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Şifre Sıfırlama</h2>
          <p>Sayın ${toName || 'Kullanıcı'},</p>
          <p>Şifrenizi sıfırlamak için aşağıdaki bağlantıya tıklayın. Bağlantı 1 saat içerisinde geçerlidir.</p>
          <a href="${resetLink}" style="display: inline-block; background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 16px 0;">Şifremi Sıfırla</a>
          <p>Bağlantı çalışmazsa, aşağıdaki adresi tarayıcınıza yapıştırın:</p>
          <p style="word-break: break-all; color: #374151;">${resetLink}</p>
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; font-size: 14px;">Bu e-posta otomatik olarak gönderilmiştir. Lütfen yanıtlamayınız.</p>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`Password reset email sent to ${toEmail}`);
  } catch (error) {
    console.error('Failed to send password reset email:', error);
    throw error;
  }
};

// Send temporary password to newly created faculty
export const sendTemporaryPasswordEmail = async (toEmail, toName, tempPassword, loginUrl) => {
  try {
    const transporter = createTransporter();
    const appName = process.env.APP_NAME || 'QRCal';
    const url = loginUrl || `${process.env.FRONTEND_URL || 'http://localhost:8081'}/login`;

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: toEmail,
      subject: `${appName} | Geçici Şifreniz`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">${appName} | Öğretim Üyesi Hesabı</h2>
          <p>Sayın ${toName || 'Kullanıcı'},</p>
          <p>Yönetici tarafından sizin adınıza bir öğretim üyesi hesabı oluşturulmuştur.</p>
          <div style="background-color: #f3f4f6; padding: 16px; border-radius: 8px; margin: 16px 0;">
            <p style="margin: 0 0 8px 0;"><strong>Giriş E-posta:</strong> ${toEmail}</p>
            <p style="margin: 0 0 8px 0;"><strong>Geçici Şifre:</strong> <span style="font-family: monospace; background: #fff; padding: 2px 6px; border-radius: 4px;">${tempPassword}</span></p>
          </div>
          <p>Lütfen aşağıdaki bağlantıyı kullanarak giriş yapın ve ilk girişte şifrenizi değiştirin.</p>
          <a href="${url}" style="display: inline-block; background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 10px;">Giriş Yap</a>
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; font-size: 14px;">Bu e-posta otomatik olarak gönderilmiştir. Lütfen yanıtlamayınız.</p>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`Temporary password email sent to ${toEmail}`);
  } catch (error) {
    console.error('Failed to send temporary password email:', error);
    throw error;
  }
};

export default {
  sendAppointmentRequestEmail,
  sendAppointmentApprovalEmail,
  sendAppointmentRejectionEmail,
  sendPasswordResetEmail,
  sendTemporaryPasswordEmail
};
