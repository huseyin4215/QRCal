import { XMarkIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';
import styles from './PasswordModal.module.css';

export default function PasswordModal({ 
  isOpen, 
  onClose, 
  passwordData, 
  onInputChange, 
  onSubmit, 
  loading, 
  error, 
  success 
}) {
  const [showPassword, setShowPassword] = useState(false);

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h3 className={styles.modalTitle}>Şifre Değiştir</h3>
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

          <form onSubmit={onSubmit}>
            <div className={styles.formGroup}>
              <label htmlFor="currentPassword" className={styles.formLabel}>
                Mevcut Şifre *
              </label>
              <div className={styles.inputContainer}>
                <input
                  type={showPassword ? "text" : "password"}
                  id="currentPassword"
                  name="currentPassword"
                  required
                  value={passwordData.currentPassword || ''}
                  onChange={onInputChange}
                  className={styles.formInput}
                  placeholder="Mevcut şifrenizi girin"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={styles.passwordToggle}
                >
                  {showPassword ? (
                    <EyeSlashIcon className={styles.passwordIcon} />
                  ) : (
                    <EyeIcon className={styles.passwordIcon} />
                  )}
                </button>
              </div>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="newPassword" className={styles.formLabel}>
                Yeni Şifre *
              </label>
              <div className={styles.inputContainer}>
                <input
                  type={showPassword ? "text" : "password"}
                  id="newPassword"
                  name="newPassword"
                  required
                  value={passwordData.newPassword || ''}
                  onChange={onInputChange}
                  className={styles.formInput}
                  placeholder="Yeni şifrenizi girin"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={styles.passwordToggle}
                >
                  {showPassword ? (
                    <EyeSlashIcon className={styles.passwordIcon} />
                  ) : (
                    <EyeIcon className={styles.passwordIcon} />
                  )}
                </button>
              </div>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="confirmPassword" className={styles.formLabel}>
                Şifre Tekrar *
              </label>
              <div className={styles.inputContainer}>
                <input
                  type={showPassword ? "text" : "password"}
                  id="confirmPassword"
                  name="confirmPassword"
                  required
                  value={passwordData.confirmPassword || ''}
                  onChange={onInputChange}
                  className={styles.formInput}
                  placeholder="Yeni şifrenizi tekrar girin"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={styles.passwordToggle}
                >
                  {showPassword ? (
                    <EyeSlashIcon className={styles.passwordIcon} />
                  ) : (
                    <EyeIcon className={styles.passwordIcon} />
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>

        <div className={styles.modalFooter}>
          <button
            type="button"
            onClick={onClose}
            className={`${styles.button} ${styles.secondaryButton}`}
          >
            İptal
          </button>
          <button
            type="submit"
            disabled={loading}
            onClick={onSubmit}
            className={`${styles.button} ${styles.primaryButton} ${loading ? styles.buttonLoading : ''}`}
          >
            {loading ? 'Değiştiriliyor...' : 'Şifre Değiştir'}
          </button>
        </div>
      </div>
    </div>
  );
} 