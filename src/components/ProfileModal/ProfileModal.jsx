import { XMarkIcon } from '@heroicons/react/24/outline';
import styles from './ProfileModal.module.css';

export default function ProfileModal({ 
  isOpen, 
  onClose, 
  profileData, 
  onInputChange, 
  onSubmit, 
  loading, 
  error, 
  success,
  fields = []
}) {
  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h3 className={styles.modalTitle}>Profil Ayarları</h3>
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
            {fields.map((field) => (
              <div key={field.name} className={styles.formGroup}>
                <label htmlFor={field.name} className={styles.formLabel}>
                  {field.label} {field.required && '*'}
                </label>
                <input
                  type={field.type}
                  id={field.name}
                  name={field.name}
                  required={field.required}
                  value={profileData[field.name] || ''}
                  onChange={onInputChange}
                  className={styles.formInput}
                  placeholder={field.placeholder}
                />
              </div>
            ))}
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
            {loading ? 'Güncelleniyor...' : 'Güncelle'}
          </button>
        </div>
      </div>
    </div>
  );
} 