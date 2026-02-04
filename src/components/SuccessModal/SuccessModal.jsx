import { CheckCircleIcon, XMarkIcon } from '@heroicons/react/24/outline';
import styles from './SuccessModal.module.css';

export default function SuccessModal({
  isOpen,
  onClose,
  title = 'İşlem Başarılı!',
  message,
  details,
  buttonText = 'Kapat',
  showCopyButton = false
}) {
  if (!isOpen) return null;

  const handleCopy = () => {
    if (details) {
      navigator.clipboard.writeText(details);
      // Optional: Show a toast notification
      const btn = document.getElementById('copy-btn');
      if (btn) {
        const originalText = btn.innerText;
        btn.innerText = 'Kopyalandı!';
        setTimeout(() => {
          btn.innerText = originalText;
        }, 2000);
      }
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button 
          onClick={onClose} 
          className={styles.closeButton}
          aria-label="Kapat"
        >
          <XMarkIcon className={styles.closeIcon} />
        </button>

        <div className={styles.content}>
          <div className={styles.iconWrapper}>
            <div className={styles.iconCircle}>
              <CheckCircleIcon className={styles.checkIcon} />
            </div>
            <div className={styles.successPulse}></div>
          </div>

          <h3 className={styles.title}>{title}</h3>

          {message && (
            <p className={styles.message}>{message}</p>
          )}

          {details && (
            <div className={styles.detailsBox}>
              <div className={styles.detailsContent}>
                {details}
              </div>
              {showCopyButton && (
                <button
                  id="copy-btn"
                  onClick={handleCopy}
                  className={styles.copyButton}
                  type="button"
                >
                  📋 Kopyala
                </button>
              )}
            </div>
          )}

          <button
            onClick={onClose}
            className={styles.closeBtn}
            type="button"
          >
            {buttonText}
          </button>
        </div>
      </div>
    </div>
  );
}

