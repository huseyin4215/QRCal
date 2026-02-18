import React from 'react';
import { CalendarDaysIcon, XMarkIcon, LinkIcon } from '@heroicons/react/24/outline';
import styles from './CalendarRequiredModal.module.css';

const CalendarRequiredModal = ({ isOpen, onClose, onConnect, userName }) => {
  if (!isOpen) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.iconContainer}>
          <div className={styles.iconBackground}>
            <CalendarDaysIcon className={styles.calendarIcon} />
          </div>
        </div>

        <h3 className={styles.title}>Google Calendar Bağlantısı Gerekli</h3>
        
        <p className={styles.message}>
          Merhaba <strong>{userName || 'Kullanıcı'}</strong>, sistemi kullanabilmek için 
          Google Calendar hesabınızı bağlamanız gerekmektedir.
        </p>
        
        <p className={styles.subMessage}>
          Bu bağlantı sayesinde randevularınız otomatik olarak takviminize eklenecek ve 
          müsaitlik durumunuz senkronize edilecektir.
        </p>

        <div className={styles.featureList}>
          <div className={styles.featureItem}>
            <div className={styles.featureIcon}>✓</div>
            <span>Randevular otomatik takvime eklenir</span>
          </div>
          <div className={styles.featureItem}>
            <div className={styles.featureIcon}>✓</div>
            <span>Müsaitlik durumu senkronize edilir</span>
          </div>
          <div className={styles.featureItem}>
            <div className={styles.featureIcon}>✓</div>
            <span>Çakışan randevular engellenir</span>
          </div>
        </div>

        <div className={styles.buttonGroup}>
          <button className={styles.connectButton} onClick={onConnect}>
            <LinkIcon className={styles.buttonIcon} />
            Google Calendar Bağla
          </button>
        </div>

        <p className={styles.note}>
          Bu adımı tamamlamadan sistemi kullanamazsınız.
        </p>
      </div>
    </div>
  );
};

export default CalendarRequiredModal;
