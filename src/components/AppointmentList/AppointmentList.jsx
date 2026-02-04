import { CalendarIcon, ClockIcon, CheckCircleIcon, XCircleIcon, NoSymbolIcon, AcademicCapIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
import apiService from '../../services/apiService';
import { formatFacultyName, formatStudentName } from '../../utils/formatUserName';
import styles from './AppointmentList.module.css';

// Helper function to check if appointment is in the future (date + time)
function isAppointmentInFuture(appointment) {
  const now = new Date();
  
  // Parse date properly to avoid timezone issues
  const dateObj = new Date(appointment.date);
  const year = dateObj.getFullYear();
  const month = dateObj.getMonth();
  const day = dateObj.getDate();
  
  // Parse start time
  const [hours, minutes] = (appointment.startTime || '00:00').split(':').map(Number);
  
  // Create appointment datetime with both date AND time
  const appointmentDateTime = new Date(year, month, day, hours, minutes, 0, 0);
  
  // Compare: appointment must be in the future
  return appointmentDateTime > now;
}

export default function AppointmentList({ appointments, getStatusIcon, getStatusText, getStatusColor, formatDate, formatTime, onCancel, onCancelApproved, onDetails, onApprove, onReject, showCancel = true, showActions = true, currentUserId = null, showHistoryButton = true }) {
  const navigate = useNavigate();

  const handleViewHistory = async (appointment) => {
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
    }
  };
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
                  {appointment.studentName ? formatStudentName(appointment) : formatFacultyName(appointment)}
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
                  <span className={styles.topicLabel}>Konu:</span> {appointment.topicName || appointment.topic?.name || 'Görüşme Talebi'}
                </div>
                {/* Show faculty name for admin viewing system appointments */}
                {appointment.studentName && appointment.facultyName && (
                  <div className={styles.infoRow}>
                    <AcademicCapIcon className={styles.infoIcon} />
                    <span className={styles.infoLabel}>Öğretim Üyesi:</span> {formatFacultyName(appointment)}
                  </div>
                )}
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
                    onClick={() => onReject(appointment._id)} 
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
              {showActions && appointment.status === 'approved' && onCancelApproved && (
                <button 
                  onClick={() => onCancelApproved(appointment._id)} 
                  className={`${styles.actionButton} ${styles.cancelApprovedButton} hover:shadow-lg transition-all duration-200`}
                  disabled={!isAppointmentInFuture(appointment)}
                  style={!isAppointmentInFuture(appointment) ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
                  title={!isAppointmentInFuture(appointment) ? 'Geçmiş randevular iptal edilemez' : 'Randevuyu iptal et'}
                >
                  <NoSymbolIcon className="w-4 h-4 mr-1" />
                  {isAppointmentInFuture(appointment) ? 'Randevuyu İptal Et' : 'İptal Edilemez'}
                </button>
              )}
              <button 
                onClick={() => onDetails(appointment)} 
                className={`${styles.actionButton} ${styles.detailsButton} hover:shadow-lg transition-all duration-200`}
              >
                Detaylar
              </button>
              {showHistoryButton && (appointment.student?._id || appointment.student || appointment.studentEmail) && (
                <button 
                  onClick={() => handleViewHistory(appointment)} 
                  className={`${styles.actionButton} ${styles.historyButton} hover:shadow-lg transition-all duration-200`}
                  title="Öğrenci Randevu Geçmişi"
                >
                  <ClockIcon className="w-4 h-4 mr-1" />
                  Öğrenci Geçmişi
                </button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}