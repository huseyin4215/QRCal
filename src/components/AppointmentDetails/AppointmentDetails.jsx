import { XMarkIcon, CalendarIcon, ClockIcon, UserIcon, EnvelopeIcon, AcademicCapIcon, DocumentTextIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import styles from './AppointmentDetails.module.css';

export default function AppointmentDetails({ appointment, isOpen, onClose, onApprove, onReject, onCancel, getStatusText, formatDate, formatTime }) {
  if (!isOpen || !appointment) return null;

  // Varsayılan getStatusText fonksiyonu
  const defaultGetStatusText = (status) => {
    const statusMap = {
      'pending': 'Beklemede',
      'approved': 'Onaylandı',
      'rejected': 'Reddedildi',
      'cancelled': 'İptal Edildi',
      'completed': 'Tamamlandı'
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

          {/* Student Information */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>
              <UserIcon className="w-5 h-5 mr-2" />
              Öğrenci Bilgileri
            </h3>
            <div className={styles.infoGrid}>
              <div className={styles.infoItem}>
                <span className={styles.label}>Ad Soyad:</span>
                <span className={styles.value}>{appointment.studentName}</span>
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
                <span className={styles.value}>{appointment.topic}</span>
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
                  <span className={styles.value}>{appointment.facultyName}</span>
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
              {onCancel && (
                <button onClick={handleCancel} className={`${styles.actionButton} ${styles.cancelButton}`}>
                  İptal Et
                </button>
              )}
            </>
          )}
          <button onClick={onClose} className={`${styles.actionButton} ${styles.closeActionButton}`}>
            Kapat
          </button>
        </div>
      </div>
    </div>
  );
}
