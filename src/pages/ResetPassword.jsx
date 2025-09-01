import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import apiService from '../services/apiService';
import { AcademicCapIcon, LockClosedIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import styles from '../styles/login.module.css';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (password.length < 6) {
      setError('Şifre en az 6 karakter olmalıdır');
      return;
    }
    if (password !== confirmPassword) {
      setError('Şifreler eşleşmiyor');
      return;
    }
    setLoading(true);
    try {
      const res = await apiService.resetPassword(token, password);
      if (res?.success) {
        setSuccess('Şifreniz başarıyla sıfırlandı. Giriş sayfasına yönlendiriliyorsunuz...');
        setTimeout(() => navigate('/login'), 1800);
      } else {
        setError(res?.message || 'Şifre sıfırlanamadı');
      }
    } catch (e) {
      setError(e.message || 'Şifre sıfırlanamadı');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <div className={styles.logo}><AcademicCapIcon /></div>
          <h1 className={styles.title}>QRCal</h1>
          <p className={styles.subtitle}>Akıllı Akademik Randevu Sistemi</p>
          <p className={styles.description}>Yeni şifrenizi belirleyin</p>
        </div>

        {error && (
          <div className={`${styles.message} ${styles.errorMessage}`}>
            <svg className={styles.messageIcon} viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            {error}
          </div>
        )}

        {success && (
          <div className={`${styles.message} ${styles.successMessage}`}>
            <svg className={styles.messageIcon} viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            {success}
          </div>
        )}

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label className={styles.label}>Yeni Şifre</label>
            <div className={styles.inputWrapper}>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`${styles.input} ${styles.passwordInput}`}
                placeholder="••••••••"
                required
              />
              <LockClosedIcon className={styles.inputIcon} />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Şifre Tekrar</label>
            <div className={styles.inputWrapper}>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={`${styles.input} ${styles.passwordInput}`}
                placeholder="••••••••"
                required
              />
              <LockClosedIcon className={styles.inputIcon} />
            </div>
          </div>

          <button type="submit" disabled={loading} className={`${styles.button} ${styles.primaryButton}`}>
            {loading ? 'Sıfırlanıyor...' : 'Şifreyi Sıfırla'}
          </button>
        </form>

        <div className={styles.backLink}>
          <Link to="/login" className={styles.link}>
            <ArrowLeftIcon className={styles.backIcon} /> Giriş sayfasına dön
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;


