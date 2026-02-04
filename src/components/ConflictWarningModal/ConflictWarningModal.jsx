import { ExclamationTriangleIcon, CalendarIcon } from '@heroicons/react/24/outline';
import styles from './ConflictWarningModal.module.css';

export default function ConflictWarningModal({
  isOpen,
  conflictData = [],
  onDismiss,
  onGoToAvailability,
  onAcknowledge
}) {
  if (!isOpen || !conflictData || conflictData.length === 0) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContainer}>
        {/* Header */}
        <div className={styles.modalHeader}>
          <div className={styles.headerContent}>
            <div className={styles.headerIcon}>
              <ExclamationTriangleIcon className={styles.icon} />
            </div>
            <div className={styles.headerText}>
              <h3 className={styles.modalTitle}>Takvim Çakışması</h3>
              <p className={styles.modalSubtitle}>
                {conflictData.length} adet etkinlikte zaman çakışması
              </p>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className={styles.modalBody}>
          <p className={styles.description}>
            Google Takviminizdeki etkinlik, mevcut planlarınızla örtüşmüyor. Lütfen saat tercihlerinizi güncelleyin.
          </p>

          {/* Conflict List */}
          <div className={styles.conflictList}>
            {conflictData.map((conflict, index) => (
              <div key={index} className={styles.conflictCard}>
                <div className={styles.conflictIcon}>
                  <CalendarIcon className={styles.calendarIcon} />
                </div>
                <div className={styles.conflictContent}>
                  <div className={styles.conflictHeader}>
                    <h4 className={styles.conflictTitle}>{conflict.eventName}</h4>
                    <span className={styles.conflictDay}>{conflict.day}</span>
                  </div>
                  <div className={styles.conflictDetails}>
                    <span className={styles.conflictBadge}>
                      Çakışan: {conflict.slot}
                    </span>
                    <span className={styles.conflictTime}>{conflict.eventTime}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Info Badge */}
          <div className={styles.infoBadge}>
            <svg className={styles.infoIcon} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className={styles.infoText}>
              Erteleme durumunda bildirim <span className={styles.infoHighlight}>5 dakika</span> içinde tekrar görüntülenecektir.
            </p>
          </div>

          {/* Actions */}
          <div className={styles.modalActions}>
            <button
              onClick={onDismiss}
              className={styles.dismissButton}
            >
              Ertele
            </button>
            {onAcknowledge && (
              <button
                onClick={onAcknowledge}
                className={styles.acknowledgeButton}
              >
                Farkındayım
              </button>
            )}
            <button
              onClick={onGoToAvailability}
              className={styles.primaryButton}
            >
              Şimdi Düzenle
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

