import { useState } from 'react';
import { XMarkIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import styles from './CancelModal.module.css';

export default function CancelModal({
    isOpen,
    onClose,
    onConfirm,
    loading = false,
    appointmentInfo = null
}) {
    const [reason, setReason] = useState('');
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const handleConfirm = () => {
        setError('');
        onConfirm(reason);
        setReason('');
    };

    const handleClose = () => {
        setReason('');
        setError('');
        onClose();
    };

    return (
        <div className={styles.modalOverlay} onClick={handleClose}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                <div className={styles.modalHeader}>
                    <div className={styles.headerIcon}>
                        <ExclamationTriangleIcon className={styles.warningIcon} />
                    </div>
                    <h3 className={styles.modalTitle}>Randevuyu İptal Et</h3>
                    <button onClick={handleClose} className={styles.closeButton}>
                        <XMarkIcon className={styles.closeIcon} />
                    </button>
                </div>

                <div className={styles.modalBody}>
                    <div className={styles.warningBanner}>
                        <p>⚠️ Bu randevu onaylanmış bir randevudur. İptal ettiğinizde:</p>
                        <ul>
                            <li>Öğrenciye e-posta bildirimi gönderilecektir</li>
                            <li>Google Calendar etkinliği silinecektir</li>
                            <li>Bu saat dilimi tekrar müsait hale gelecektir</li>
                        </ul>
                    </div>

                    {appointmentInfo && (
                        <div className={styles.appointmentInfo}>
                            <p><strong>Öğrenci:</strong> {appointmentInfo.studentName || appointmentInfo.student?.name || 'Bilinmiyor'}</p>
                            <p><strong>Konu:</strong> {appointmentInfo.topicName || appointmentInfo.topic?.name || 'Görüşme Talebi'}</p>
                            <p><strong>Tarih:</strong> {new Date(appointmentInfo.date).toLocaleDateString('tr-TR')}</p>
                            <p><strong>Saat:</strong> {appointmentInfo.startTime} - {appointmentInfo.endTime}</p>
                        </div>
                    )}

                    <div className={styles.formGroup}>
                        <label htmlFor="cancelReason" className={styles.formLabel}>
                            İptal Nedeni (İsteğe Bağlı)
                        </label>
                        <textarea
                            id="cancelReason"
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            className={styles.formTextarea}
                            placeholder="Öğrenciye iletilecek iptal nedenini yazabilirsiniz..."
                            rows={4}
                            maxLength={200}
                        />
                        <div className={styles.charCount}>
                            {reason.length}/200 karakter
                        </div>
                    </div>

                    {error && (
                        <div className={styles.errorMessage}>
                            {error}
                        </div>
                    )}
                </div>

                <div className={styles.modalFooter}>
                    <button
                        type="button"
                        onClick={handleClose}
                        className={`${styles.button} ${styles.secondaryButton}`}
                        disabled={loading}
                    >
                        Vazgeç
                    </button>
                    <button
                        type="button"
                        onClick={handleConfirm}
                        disabled={loading}
                        className={`${styles.button} ${styles.warningButton} ${loading ? styles.buttonLoading : ''}`}
                    >
                        {loading ? 'İşleniyor...' : 'Randevuyu İptal Et'}
                    </button>
                </div>
            </div>
        </div>
    );
}

