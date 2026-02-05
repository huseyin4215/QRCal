import { XMarkIcon, UserIcon, EnvelopeIcon, PhoneIcon, AcademicCapIcon, ClockIcon, UserGroupIcon } from '@heroicons/react/24/outline';
import styles from './StudentDetailsModal.module.css';

export default function StudentDetailsModal({ isOpen, onClose, student }) {
  if (!isOpen || !student) return null;
  
  // Get advisor name - handle both populated object and string ID
  const getAdvisorName = () => {
    if (!student.advisor) return null;
    if (typeof student.advisor === 'object') {
      return student.advisor.title 
        ? `${student.advisor.title} ${student.advisor.name}` 
        : student.advisor.name;
    }
    return null; // If it's just an ID, we don't have the name
  };
  
  const advisorName = getAdvisorName();

  const formatDate = (dateString) => {
    if (!dateString) return 'Belirtilmemiş';
    try {
      return new Date(dateString).toLocaleDateString('tr-TR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return 'Belirtilmemiş';
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContainer} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalContent}>
          {/* Header */}
          <div className={styles.modalHeader}>
            <div className={styles.headerContent}>
              <div className={styles.headerLeft}>
                <div className={styles.iconContainer}>
                  <UserIcon className={styles.headerIcon} />
                </div>
                <div>
                  <h3 className={styles.headerTitle}>Öğrenci Bilgileri</h3>
                  <p className={styles.headerSubtitle}>Detaylı öğrenci profili</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className={styles.closeButton}
              >
                <XMarkIcon className={styles.closeIcon} />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className={styles.modalBody}>
            <div className={styles.contentSection}>
              {/* Basic Info Card */}
              <div className={styles.infoCard}>
                <div className={styles.userInfo}>
                  <div className={styles.userAvatar}>
                    <UserIcon className={styles.avatarIcon} />
                  </div>
                  <div>
                    <h4 className={styles.userName}>{student.name}</h4>
                    <p className={styles.userRole}>Öğrenci</p>
                  </div>
                </div>

                <div className={styles.detailsList}>
                  <div className={styles.detailItem}>
                    <EnvelopeIcon className={styles.detailIcon} />
                    <span className={styles.detailText}>{student.email}</span>
                  </div>
                  {student.studentNumber && (
                    <div className={styles.detailItem}>
                      <AcademicCapIcon className={styles.detailIcon} />
                      <span className={styles.detailText}>Öğrenci No: {student.studentNumber}</span>
                    </div>
                  )}
                  {student.department && (
                    <div className={styles.detailItem}>
                      <AcademicCapIcon className={styles.detailIcon} />
                      <span className={styles.detailText}>{student.department}</span>
                    </div>
                  )}
                  {student.phone && (
                    <div className={styles.detailItem}>
                      <PhoneIcon className={styles.detailIcon} />
                      <span className={styles.detailText}>{student.phone}</span>
                    </div>
                  )}
                  {advisorName && (
                    <div className={styles.detailItem}>
                      <UserGroupIcon className={styles.detailIcon} />
                      <span className={styles.detailText}>
                        <strong>Danışman:</strong> {advisorName}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Status & Dates Grid */}
              <div className={styles.statusGrid}>
                <div className={`${styles.statusCard} ${student.isActive ? styles.statusCardGreen : styles.statusCardGray}`}>
                  <div className={`${styles.statusBadge} ${student.isActive ? styles.statusBadgeActive : styles.statusBadgeInactive}`}>
                    <div className={`${styles.statusDot} ${student.isActive ? styles.statusDotActive : styles.statusDotInactive}`}></div>
                    {student.isActive ? 'Aktif' : 'Pasif'}
                  </div>
                  <p className={styles.statusLabel}>Durum</p>
                </div>

                <div className={`${styles.statusCard} ${styles.statusCardBlue}`}>
                  <ClockIcon className={styles.dateIcon} />
                  <p className={styles.dateLabel}>Kayıt Tarihi</p>
                  <p className={styles.dateValue}>{formatDate(student.createdAt)}</p>
                </div>
              </div>

              {/* Additional Info */}
              {(student.updatedAt && student.updatedAt !== student.createdAt) && (
                <div className={styles.updateInfo}>
                  <div className={styles.updateInfoContent}>
                    <ClockIcon className={styles.updateIcon} />
                    <span className={styles.updateText}>Son güncelleme: {formatDate(student.updatedAt)}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className={styles.modalFooter}>
            <button
              onClick={onClose}
              className={styles.closeButtonFooter}
            >
              Kapat
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
