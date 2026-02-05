import React from 'react';
import { ExclamationTriangleIcon, XMarkIcon } from '@heroicons/react/24/outline';
import styles from './AdvisorWarningModal.module.css';

const AdvisorWarningModal = ({ isOpen, onClose, onConfirm, facultyName }) => {
  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeButton} onClick={onClose}>
          <XMarkIcon className={styles.closeIcon} />
        </button>
        
        <div className={styles.iconContainer}>
          <div className={styles.iconBackground}>
            <ExclamationTriangleIcon className={styles.warningIcon} />
          </div>
        </div>

        <h3 className={styles.title}>Danışmana Özel Konu</h3>
        
        <p className={styles.message}>
          Seçtiğiniz görüşme konusu <strong>danışmanınıza özel</strong> bir konudur.
        </p>
        
        <p className={styles.subMessage}>
          <strong>{facultyName || 'Bu öğretim üyesi'}</strong> sizin danışmanınız değildir. 
          Yine de randevu talebinizi göndermek istiyor musunuz?
        </p>

        <div className={styles.infoBox}>
          <ExclamationTriangleIcon className={styles.infoIcon} />
          <span>Öğretim üyesi bu uyarıyı görecektir.</span>
        </div>

        <div className={styles.buttonGroup}>
          <button className={styles.cancelButton} onClick={onClose}>
            İptal
          </button>
          <button className={styles.confirmButton} onClick={onConfirm}>
            Yine de Gönder
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdvisorWarningModal;

