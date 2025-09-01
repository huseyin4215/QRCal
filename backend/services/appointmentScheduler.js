import cron from 'node-cron';
import Appointment from '../models/Appointment.js';
import AppointmentSlot from '../models/AppointmentSlot.js';
import Notification from '../models/Notification.js';

/**
 * Otomatik randevu işleme servisi
 * Zamanı geçen pending randevuları 'no_response' durumuna çevirir
 */

// Her saat başında çalışacak cron job
const scheduleAppointmentChecker = () => {
  // Her saat başında çalış (0 * * * *)
  cron.schedule('0 * * * *', async () => {
    console.log('🔄 Otomatik randevu kontrolü başlıyor...');
    
    try {
      await checkExpiredAppointments();
      console.log('✅ Otomatik randevu kontrolü tamamlandı');
    } catch (error) {
      console.error('❌ Otomatik randevu kontrolü hatası:', error);
    }
  });

  console.log('📅 Otomatik randevu kontrol servisi başlatıldı (her saat başında çalışacak)');
};

// Zamanı geçen randevuları kontrol et
const checkExpiredAppointments = async () => {
  const now = new Date();
  
  try {
    // Bugünden önceki pending randevuları bul
    const expiredAppointments = await Appointment.find({
      status: 'pending',
      date: { $lt: now }
    }).populate('facultyId', 'name email');

    console.log(`📋 ${expiredAppointments.length} adet zamanı geçen pending randevu bulundu`);

    for (const appointment of expiredAppointments) {
      await processExpiredAppointment(appointment);
    }

    return expiredAppointments.length;
  } catch (error) {
    console.error('Zamanı geçen randevuları kontrol ederken hata:', error);
    throw error;
  }
};

// Zamanı geçen randevuyu işle
const processExpiredAppointment = async (appointment) => {
  try {
    console.log(`⏰ Randevu işleniyor: ${appointment._id} - ${appointment.studentName}`);

    // Randevu durumunu güncelle
    appointment.status = 'no_response';
    appointment.cancelledBy = 'system';
    appointment.cancelledAt = new Date();
    appointment.cancellationReason = 'Öğretim üyesi belirlenen süre içinde yanıt vermediği için sistem tarafından otomatik olarak kapatıldı.';
    
    await appointment.save();

    // İlgili slot'u serbest bırak
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
      console.log(`📅 Slot serbest bırakıldı: ${appointment.date} ${appointment.startTime}`);
    }

    // Öğrenciye bildirim gönder
    try {
      await Notification.create({
        userId: null, // Öğrenci ID'si yok, email ile gönderilecek
        type: 'appointment_no_response',
        title: 'Randevu Otomatik Kapatıldı',
        message: `${appointment.facultyName} ile ${new Date(appointment.date).toLocaleDateString('tr-TR')} tarihli randevunuz, öğretim üyesi yanıt vermediği için otomatik olarak kapatılmıştır.`,
        data: {
          appointmentId: appointment._id,
          studentEmail: appointment.studentEmail,
          facultyName: appointment.facultyName,
          date: appointment.date,
          startTime: appointment.startTime,
          topic: appointment.topic
        }
      });

      console.log(`📧 Öğrenciye bildirim gönderildi: ${appointment.studentEmail}`);
    } catch (notificationError) {
      console.error('Bildirim gönderirken hata:', notificationError);
    }

    // Öğretim üyesine de bildirim gönder (uyarı amaçlı)
    try {
      if (appointment.facultyId) {
        await Notification.create({
          userId: appointment.facultyId,
          type: 'appointment_auto_closed',
          title: 'Randevu Otomatik Kapatıldı',
          message: `${appointment.studentName} (${appointment.studentId}) öğrencisinin ${new Date(appointment.date).toLocaleDateString('tr-TR')} tarihli randevusu, yanıt verilmediği için otomatik olarak kapatılmıştır.`,
          data: {
            appointmentId: appointment._id,
            studentName: appointment.studentName,
            studentId: appointment.studentId,
            date: appointment.date,
            startTime: appointment.startTime,
            topic: appointment.topic
          }
        });

        console.log(`📧 Öğretim üyesine uyarı bildirimi gönderildi: ${appointment.facultyId}`);
      }
    } catch (facultyNotificationError) {
      console.error('Öğretim üyesi bildirimi gönderirken hata:', facultyNotificationError);
    }

    console.log(`✅ Randevu başarıyla işlendi: ${appointment._id}`);

  } catch (error) {
    console.error(`❌ Randevu işlenirken hata (${appointment._id}):`, error);
    throw error;
  }
};

// Manuel olarak zamanı geçen randevuları kontrol et (test amaçlı)
const checkExpiredAppointmentsManual = async () => {
  console.log('🔍 Manuel randevu kontrolü başlıyor...');
  
  try {
    const count = await checkExpiredAppointments();
    console.log(`✅ Manuel kontrol tamamlandı. ${count} randevu işlendi.`);
    return count;
  } catch (error) {
    console.error('❌ Manuel kontrol hatası:', error);
    throw error;
  }
};

// Belirli bir randevuyu manuel olarak kontrol et
const checkSpecificAppointment = async (appointmentId) => {
  try {
    const appointment = await Appointment.findById(appointmentId).populate('facultyId', 'name email');
    
    if (!appointment) {
      throw new Error('Randevu bulunamadı');
    }

    if (appointment.status !== 'pending') {
      console.log(`ℹ️ Randevu zaten işlenmiş: ${appointment.status}`);
      return false;
    }

    const now = new Date();
    const appointmentDate = new Date(appointment.date);

    if (appointmentDate >= now) {
      console.log(`ℹ️ Randevu henüz zamanı gelmedi: ${appointment.date}`);
      return false;
    }

    await processExpiredAppointment(appointment);
    return true;

  } catch (error) {
    console.error('Belirli randevu kontrol edilirken hata:', error);
    throw error;
  }
};

// Servisi durdur
const stopScheduler = () => {
  cron.getTasks().forEach((task) => {
    task.stop();
  });
  console.log('🛑 Otomatik randevu kontrol servisi durduruldu');
};

export {
  scheduleAppointmentChecker,
  checkExpiredAppointments,
  checkExpiredAppointmentsManual,
  checkSpecificAppointment,
  stopScheduler
};

export default {
  start: scheduleAppointmentChecker,
  checkExpired: checkExpiredAppointments,
  checkManual: checkExpiredAppointmentsManual,
  checkSpecific: checkSpecificAppointment,
  stop: stopScheduler
};
