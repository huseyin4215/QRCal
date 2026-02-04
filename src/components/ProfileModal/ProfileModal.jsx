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
  fields = [],
  disableClose = false,
  title = 'Profil Ayarları'
}) {
  if (!isOpen) return null;

  const handleOverlayClick = disableClose ? undefined : onClose;
  const handleCloseClick = disableClose ? undefined : onClose;

  return (
    <div className={styles.modalOverlay} onClick={handleOverlayClick}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h3 className={styles.modalTitle}>{title}</h3>
          {!disableClose && (
            <button onClick={handleCloseClick} className={styles.closeButton}>
              <XMarkIcon className={styles.closeIcon} />
            </button>
          )}
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

          <form onSubmit={(e) => {
            e.preventDefault();
            onSubmit(e);
          }}>
            {fields.map((field) => (
              <div key={field.name} className={styles.formGroup}>
                <label htmlFor={field.name} className={styles.formLabel}>
                  {field.label} {field.required && '*'}
                </label>
                {field.type === 'select' ? (
                  <select
                    id={field.name}
                    name={field.name}
                    required={field.required}
                    value={profileData[field.name] || ''}
                    onChange={onInputChange}
                    className={styles.formInput}
                  >
                    {field.placeholder && <option value="">{field.placeholder}</option>}
                    {field.options && field.options.map((option) => {
                      if (option.optgroup) {
                        // Optgroup support
                        return (
                          <optgroup key={option.label} label={option.label}>
                            {option.options.map((opt) => (
                              <option key={opt.value} value={opt.value}>
                                {opt.label}
                              </option>
                            ))}
                          </optgroup>
                        );
                      } else {
                        // Regular option
                        return (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        );
                      }
                    })}
                  </select>
                ) : (
                  <input
                    type={field.type}
                    id={field.name}
                    name={field.name}
                    required={field.required}
                    value={profileData[field.name] || ''}
                    onChange={onInputChange}
                    className={styles.formInput}
                    placeholder={field.placeholder}
                    disabled={field.disabled || false}
                    readOnly={field.readOnly || false}
                  />
                )}
              </div>
            ))}
          </form>
        </div>

        <div className={styles.modalFooter}>
          {!disableClose && (
            <button
              type="button"
              onClick={onClose}
              className={`${styles.button} ${styles.secondaryButton}`}
            >
              İptal
            </button>
          )}
          <button
            type="submit"
            disabled={loading}
            onClick={onSubmit}
            className={`${styles.button} ${styles.primaryButton} ${loading ? styles.buttonLoading : ''}`}
          >
            {loading ? 'Güncelleniyor...' : 'Devam Et'}
          </button>
        </div>
      </div>
    </div>
  );
} 