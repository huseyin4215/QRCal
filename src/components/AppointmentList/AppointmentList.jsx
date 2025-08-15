import { CalendarIcon, ClockIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';
import styles from './AppointmentList.module.css';

export default function AppointmentList({ appointments, getStatusIcon, getStatusText, getStatusColor, formatDate, formatTime, onCancel, onDetails, onApprove, onReject, showCancel = true, showActions = true }) {
  if (!appointments || appointments.length === 0) {
    return (
      <div className={styles.emptyState}>
        <CalendarIcon className={styles.emptyIcon} />
        <h3 className={styles.emptyTitle}>Henüz randevunuz yok</h3>
        <p className={styles.emptyDescription}>
          İlk randevunuzu almak için "Yeni Randevu Al" butonuna tıklayın.
        </p>
      </div>
    );
  }
  
  const getStatusClass = (status) => {
    switch (status) {
      case 'pending':
        return styles.statusPending;
      case 'approved':
        return styles.statusApproved;
      case 'rejected':
        return styles.statusRejected;
      case 'cancelled':
        return styles.statusCancelled;
      case 'completed':
        return styles.statusCompleted;
      default:
        return styles.statusPending;
    }
  };

  return (
    <div className={styles.container}>
      {appointments.map((appointment) => (
        <div key={appointment._id} className={styles.appointmentItem}>
          <div className={styles.appointmentContent}>
            <div className={styles.appointmentInfo}>
              <div className={styles.statusIcon}>{getStatusIcon(appointment.status)}</div>
              <div className={styles.appointmentDetails}>
                <div className={styles.facultyName}>
                  {appointment.studentName || appointment.facultyName}
                  <span className={`${styles.statusBadge} ${getStatusClass(appointment.status)}`}>
                    {getStatusText(appointment.status)}
                  </span>
                </div>
                <div className={styles.infoRow}>
                  <CalendarIcon className={styles.infoIcon} />
                  {formatDate(appointment.date)}
                </div>
                <div className={styles.infoRow}>
                  <ClockIcon className={styles.infoIcon} />
                  {formatTime(appointment.startTime)} - {formatTime(appointment.endTime)}
                </div>
                <div className={styles.topic}>
                  <span className={styles.topicLabel}>Konu:</span> {appointment.topic}
                </div>
                {appointment.studentId && (
                  <div className={styles.infoRow}>
                    <span className={styles.infoLabel}>Öğrenci No:</span> {appointment.studentId}
                  </div>
                )}
                {appointment.studentEmail && (
                  <div className={styles.infoRow}>
                    <span className={styles.infoLabel}>E-posta:</span> {appointment.studentEmail}
                  </div>
                )}
              </div>
            </div>
            <div className={styles.appointmentActions}>
              {showActions && appointment.status === 'pending' && onApprove && onReject && (
                <>
                  <button 
                    onClick={() => onApprove(appointment._id)} 
                    className={`${styles.actionButton} ${styles.approveButton} hover:shadow-lg transition-all duration-200`}
                  >
                    <CheckCircleIcon className="w-4 h-4 mr-1" />
                    Onayla
                  </button>
                  <button 
                    onClick={() => {
                      const reason = prompt('Red nedeni:');
                      if (reason) {
                        onReject(appointment._id, reason);
                      }
                    }} 
                    className={`${styles.actionButton} ${styles.rejectButton} hover:shadow-lg transition-all duration-200`}
                  >
                    <XCircleIcon className="w-4 h-4 mr-1" />
                    Reddet
                  </button>
                </>
              )}
              {showActions && appointment.status === 'pending' && onCancel && showCancel && (
                <button 
                  onClick={() => onCancel(appointment)} 
                  className={`${styles.actionButton} ${styles.cancelButton} hover:shadow-lg transition-all duration-200`}
                >
                  İptal Et
                </button>
              )}
              <button 
                onClick={() => onDetails(appointment)} 
                className={`${styles.actionButton} ${styles.detailsButton} hover:shadow-lg transition-all duration-200`}
              >
                Detaylar
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}