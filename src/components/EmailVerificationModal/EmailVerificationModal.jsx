import { XMarkIcon } from '@heroicons/react/24/outline';
import styles from './EmailVerificationModal.module.css';

export default function EmailVerificationModal({
  isOpen,
  onClose,
  newEmail,
  verificationCode,
  onVerificationCodeChange,
  onRequestCode,
  onVerify,
  loading,
  error,
  success,
  codeSent
}) {
  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h3 className={styles.modalTitle}>E-posta Değişikliği</h3>
          <button onClick={onClose} className={styles.closeButton}>
            <XMarkIcon className={styles.closeIcon} />
          </button>
        </div>

        <div className={styles.modalBody}>
          {error && (
            <div className={styles.errorMessage}>
              {error}
            </div>
          )}

          {success && (
            <div className={styles.successMessage}>
              {success}
            </div>
          )}

          {!codeSent ? (
            <div>
              <p className={styles.description}>
                E-posta adresinizi <strong>{newEmail}</strong> olarak değiştirmek istiyorsunuz.
                Devam etmek için yeni e-posta adresinize gönderilecek doğrulama kodunu onaylamanız gerekmektedir.
              </p>
              <div className={styles.emailDisplay}>
                <span className={styles.emailLabel}>Yeni E-posta:</span>
                <span className={styles.emailValue}>{newEmail}</span>
              </div>
              <button
                onClick={onRequestCode}
                disabled={loading}
                className={`${styles.button} ${styles.primaryButton} ${loading ? styles.buttonLoading : ''}`}
              >
                {loading ? 'Gönderiliyor...' : 'Doğrulama Kodu Gönder'}
              </button>
            </div>
          ) : (
            <div>
              <p className={styles.description}>
                <strong>{newEmail}</strong> adresine gönderilen 6 haneli doğrulama kodunu giriniz.
              </p>
              <div className={styles.formGroup}>
                <label htmlFor="verificationCode" className={styles.formLabel}>
                  Doğrulama Kodu *
                </label>
                <input
                  type="text"
                  id="verificationCode"
                  value={verificationCode}
                  onChange={(e) => {
                    // Only allow digits and limit to 6 characters
                    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                    onVerificationCodeChange(value);
                  }}
                  className={styles.formInput}
                  placeholder="123456"
                  maxLength={6}
                  autoComplete="off"
                />
              </div>
              <div className={styles.buttonGroup}>
                <button
                  onClick={onClose}
                  className={`${styles.button} ${styles.secondaryButton}`}
                >
                  İptal
                </button>
                <button
                  onClick={onVerify}
                  disabled={loading || verificationCode.length !== 6}
                  className={`${styles.button} ${styles.primaryButton} ${loading ? styles.buttonLoading : ''}`}
                >
                  {loading ? 'Doğrulanıyor...' : 'Doğrula ve Güncelle'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

