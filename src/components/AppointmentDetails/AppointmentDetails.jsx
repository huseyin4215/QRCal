import { XMarkIcon, CalendarIcon, ClockIcon, UserIcon, EnvelopeIcon, AcademicCapIcon, DocumentTextIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
import apiService from '../../services/apiService';
import { formatFacultyName, formatStudentName } from '../../utils/formatUserName';
import styles from './AppointmentDetails.module.css';

export default function AppointmentDetails({ appointment, isOpen, onClose, onApprove, onReject, onCancel, onCancelApproved, getStatusText, formatDate, formatTime, showActions = true, currentUserId = null }) {
  const navigate = useNavigate();
  
  if (!isOpen || !appointment) return null;

  const handleViewHistory = async () => {
    // Always navigate to student's appointment history
    let userId = null;
    
    // If currentUserId is provided (e.g., from StudentDashboard), use it (student's own history)
    if (currentUserId) {
      userId = currentUserId;
    } else {
      // Otherwise, find the student's ID from the appointment
      // Try student object first
      if (appointment.student?._id) {
        userId = appointment.student._id;
      } else if (appointment.student) {
        userId = appointment.student;
      }
      
      // If we have studentEmail but no userId, fetch user by email
      if (!userId && appointment.studentEmail) {
        try {
          const response = await apiService.getUserByEmail(appointment.studentEmail);
          if (response.success && response.data) {
            userId = response.data._id;
          }
        } catch (error) {
          console.error('Failed to fetch user by email:', error);
        }
      }
    }
    
    if (userId) {
      navigate(`/appointment-history/${userId}`);
      onClose();
    }
  };

  // Varsayılan getStatusText fonksiyonu
  const defaultGetStatusText = (status) => {
    const statusMap = {
      'pending': 'Beklemede',
      'approved': 'Onaylandı',
      'rejected': 'Reddedildi',
      'cancelled': 'İptal Edildi',
      'completed': 'Tamamlandı',
      'no_response': 'Öğretim Üyesi Cevaplamadı'
    };
    return statusMap[status] || status;
  };

  // Varsayılan formatDate fonksiyonu
  const defaultFormatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Varsayılan formatTime fonksiyonu
  const defaultFormatTime = (timeString) => {
    return timeString;
  };

  const statusText = getStatusText ? getStatusText(appointment.status) : defaultGetStatusText(appointment.status);
  const formattedDate = formatDate ? formatDate(appointment.date) : defaultFormatDate(appointment.date);
  const formattedStartTime = formatTime ? formatTime(appointment.startTime) : defaultFormatTime(appointment.startTime);
  const formattedEndTime = formatTime ? formatTime(appointment.endTime) : defaultFormatTime(appointment.endTime);

  const handleApprove = () => {
    if (onApprove) {
      onApprove(appointment._id);
      onClose();
    }
  };

  const handleReject = () => {
    if (onReject) {
      const reason = prompt('Red nedeni:');
      if (reason) {
        onReject(appointment._id, reason);
        onClose();
      }
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel(appointment);
      onClose();
    }
  };

  const handleCancelApproved = () => {
    if (onCancelApproved) {
      onCancelApproved(appointment._id);
      onClose();
    }
  };

  // Check if approved appointment can be cancelled (future date)
  const canCancelApproved = () => {
    if (appointment.status !== 'approved') return false;
    const now = new Date();
    const appointmentDate = new Date(appointment.date);
    const [hours, minutes] = appointment.startTime.split(':').map(Number);
    appointmentDate.setHours(hours, minutes, 0, 0);
    return appointmentDate > now;
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>Randevu Detayları</h2>
          <button onClick={onClose} className={styles.closeButton}>
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <div className={styles.content}>
          {/* Status Badge */}
          <div className={styles.statusSection}>
            <span className={`${styles.statusBadge} ${styles[`status${appointment.status}`]}`}>
              {statusText}
            </span>
          </div>

          {/* Advisor Only Warning */}
          {appointment.advisorOnlyWarning && (
            <div className={styles.warningBox}>
              <strong>⚠️ Uyarı:</strong> Bu konu öğrencinin danışmanına özeldir. Öğrenci size bu konuda randevu talep etmiştir.
            </div>
          )}

          {/* Student Information */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>
              <UserIcon className="w-5 h-5 mr-2" />
              Öğrenci Bilgileri
            </h3>
            <div className={styles.infoGrid}>
              <div className={styles.infoItem}>
                <span className={styles.label}>Ad Soyad:</span>
                <span className={styles.value}>{formatStudentName(appointment)}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.label}>Öğrenci No:</span>
                <span className={styles.value}>{appointment.studentId}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.label}>E-posta:</span>
                <span className={styles.value}>{appointment.studentEmail}</span>
              </div>
            </div>
          </div>

          {/* Appointment Information */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>
              <CalendarIcon className="w-5 h-5 mr-2" />
              Randevu Bilgileri
            </h3>
            <div className={styles.infoGrid}>
              <div className={styles.infoItem}>
                <span className={styles.label}>Tarih:</span>
                <span className={styles.value}>{formattedDate}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.label}>Saat:</span>
                <span className={styles.value}>{formattedStartTime} - {formattedEndTime}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.label}>Süre:</span>
                <span className={styles.value}>{appointment.duration || 15} dakika</span>
              </div>
            </div>
          </div>

          {/* Topic and Description */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>
              <DocumentTextIcon className="w-5 h-5 mr-2" />
              Görüşme Detayları
            </h3>
            <div className={styles.infoGrid}>
              <div className={styles.infoItem}>
                <span className={styles.label}>Konu:</span>
                <span className={styles.value}>{appointment.topicName || appointment.topic?.name || 'Görüşme Talebi'}</span>
              </div>
              {appointment.description && (
                <div className={styles.infoItem}>
                  <span className={styles.label}>Açıklama:</span>
                  <span className={styles.value}>{appointment.description}</span>
                </div>
              )}
            </div>
          </div>

          {/* Faculty Information */}
          {appointment.facultyName && (
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>
                <AcademicCapIcon className="w-5 h-5 mr-2" />
                Öğretim Üyesi Bilgileri
              </h3>
              <div className={styles.infoGrid}>
                <div className={styles.infoItem}>
                  <span className={styles.label}>Ad Soyad:</span>
                  <span className={styles.value}>{formatFacultyName(appointment)}</span>
                </div>
                {appointment.facultyDepartment && (
                  <div className={styles.infoItem}>
                    <span className={styles.label}>Bölüm:</span>
                    <span className={styles.value}>{appointment.facultyDepartment}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Rejection Reason */}
          {appointment.rejectionReason && (
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>Red Nedeni</h3>
              <div className={styles.rejectionReason}>
                {appointment.rejectionReason}
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        {showActions && (
          <div className={styles.actions}>
            {appointment.status === 'pending' && (
              <>
                {onApprove && (
                  <button onClick={handleApprove} className={`${styles.actionButton} ${styles.approveButton}`}>
                    <CheckCircleIcon className="w-4 h-4 mr-2" />
                    Onayla
                  </button>
                )}
                {onReject && (
                  <button onClick={handleReject} className={`${styles.actionButton} ${styles.rejectButton}`}>
                    <XMarkIcon className="w-4 h-4 mr-2" />
                    Reddet
                  </button>
                )}
              </>
            )}
            {appointment.status === 'approved' && onCancelApproved && canCancelApproved() && (
              <button onClick={handleCancelApproved} className={`${styles.actionButton} ${styles.cancelApprovedButton}`}>
                <XMarkIcon className="w-4 h-4 mr-2" />
                Randevuyu İptal Et
              </button>
            )}
            {(appointment.student?._id || appointment.student || appointment.studentEmail) && (
              <button onClick={handleViewHistory} className={`${styles.actionButton} ${styles.historyButton}`}>
                <ClockIcon className="w-4 h-4 mr-2" />
                Öğrenci Randevu Geçmişi
              </button>
            )}
            <button onClick={onClose} className={`${styles.actionButton} ${styles.closeActionButton}`}>
              Kapat
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
