import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import apiService from '../services/apiService';
import { 
  AcademicCapIcon,
  ArrowLeftIcon,
  EnvelopeIcon
} from '@heroicons/react/24/outline';
import styles from '../styles/login.module.css';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await apiService.forgotPassword(email);
      
      if (response.success) {
        setSuccess('Şifre sıfırlama bağlantısı e-posta adresinize gönderildi.');
      }
    } catch (error) {
      setError(error.message || 'Şifre sıfırlama işlemi sırasında bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.logo}>
            <AcademicCapIcon />
          </div>
          <h1 className={styles.title}>Qnnect</h1>
          <p className={styles.subtitle}>Akıllı Akademik Randevu Sistemi</p>
          <p className={styles.description}>Şifrenizi sıfırlayın</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className={`${styles.message} ${styles.errorMessage}`}>
            <svg className={styles.messageIcon} viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            {error}
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className={`${styles.message} ${styles.successMessage}`}>
            <svg className={styles.messageIcon} viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            {success}
          </div>
        )}

        {/* Form */}
        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label htmlFor="email" className={styles.label}>
              E-posta Adresi
            </label>
            <div className={styles.inputWrapper}>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={styles.input}
                placeholder="ornek@email.com"
              />
              <EnvelopeIcon className={styles.inputIcon} />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`${styles.button} ${styles.primaryButton}`}
          >
            {loading ? (
              <>
                <div className={styles.spinner}></div>
                Gönderiliyor...
              </>
            ) : (
              'Şifre Sıfırlama Bağlantısı Gönder'
            )}
          </button>
        </form>

        {/* Back to Login */}
        <div className={styles.backLink}>
          <Link to="/login" className={styles.link}>
            <ArrowLeftIcon className={styles.backIcon} />
            Giriş sayfasına dön
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword; 