import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import apiService from '../services/apiService';
import { 
  EyeIcon, 
  EyeSlashIcon,
  AcademicCapIcon,
  EnvelopeIcon,
  LockClosedIcon
} from '@heroicons/react/24/outline';
import styles from '../styles/login.module.css';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      console.log('Login: Attempting login for email:', formData.email);
      const response = await apiService.login(formData.email, formData.password);
      console.log('Login: Response received:', response);
      
      // Check if response exists and has success property
      if (response && response.success) {
        console.log('Login: Login successful, user data:', response.data.user);
        setSuccess('Giriş başarılı!');
        login(response.data.token, response.data.user);
        
        // Show success message for 1.5 seconds, then redirect
        setTimeout(() => {
          // Redirect based on role and first login status
          if (response.data.user.isFirstLogin) {
            console.log('Login: Redirecting to change password');
            navigate('/change-password');
          } else {
            console.log('Login: Redirecting based on role:', response.data.user.role);
            switch (response.data.user.role) {
              case 'student':
                navigate('/student-dashboard');
                break;
              case 'faculty':
                navigate('/faculty-dashboard');
                break;
              case 'admin':
                navigate('/admin-dashboard');
                break;
              default:
                navigate('/');
            }
          }
        }, 1500);
      } else {
        // Handle case where response exists but success is false
        const errorMessage = response?.message || 'Giriş başarısız. Lütfen bilgilerinizi kontrol edin.';
        setError(errorMessage);
        console.error('Login: Login failed:', errorMessage);
      }
    } catch (error) {
      console.error('Login: Error during login:', error);
      
      // Handle different types of errors
      if (error.response) {
        // Server responded with error status
        const errorMessage = error.response.data?.message || `Sunucu hatası: ${error.response.status}`;
        setError(errorMessage);
      } else if (error.request) {
        // Network error
        setError('Sunucuya bağlanılamıyor. Lütfen internet bağlantınızı kontrol edin.');
      } else {
        // Other error
        setError(error.message || 'Giriş yapılırken bir hata oluştu');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');

    try {
      // Initialize Google Sign-In
      if (window.google) {
        window.google.accounts.id.initialize({
          client_id: '194091113508-rvckovns6g1gnn7mrh8atrnjoq53dm6l.apps.googleusercontent.com',
          callback: async (response) => {
            try {
              console.log('Google OAuth response:', response);
              
              const result = await apiService.googleAuth(response.credential);
              
              if (result && result.success) {
                setSuccess('Google ile giriş başarılı!');
                login(result.data.token, result.data.user);
                
                // Show success message for 1.5 seconds, then redirect
                setTimeout(() => {
                  // Let AuthContext handle the redirect
                  console.log('Google login successful, AuthContext will handle redirect');
                  if (result.data.user.isFirstLogin) {
                    navigate('/change-password');
                  } else {
                    switch (result.data.user.role) {
                      case 'student':
                        navigate('/student-dashboard');
                        break;
                      case 'faculty':
                        navigate('/faculty-dashboard');
                        break;
                      case 'admin':
                        navigate('/admin-dashboard');
                        break;
                      default:
                        navigate('/');
                    }
                  }
                }, 1500);
              } else {
                const errorMessage = result?.message || 'Google ile giriş başarısız.';
                setError(errorMessage);
                console.error('Google login failed:', errorMessage);
              }
            } catch (error) {
              console.error('Google auth error:', error);
              setError(error.message || 'Google ile giriş yapılırken bir hata oluştu');
            } finally {
              setLoading(false);
            }
          },
          auto_select: false,
          cancel_on_tap_outside: true,
          prompt_parent_id: 'google-login-container'
        });

        window.google.accounts.id.prompt();
      } else {
        setError('Google Sign-In yüklenemedi');
        setLoading(false);
      }

    } catch (error) {
      setError('Google ile giriş yapılırken bir hata oluştu');
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
          <h1 className={styles.title}>QRCal</h1>
          <p className={styles.subtitle}>Akıllı Akademik Randevu Sistemi</p>
          <p className={styles.description}>Hesabınıza giriş yapın</p>
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

        {/* Login Form */}
        <form className={styles.form} onSubmit={handleSubmit}>
          {/* Email Field */}
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
                value={formData.email}
                onChange={handleChange}
                className={styles.input}
                placeholder="ornek@email.com"
              />
              <EnvelopeIcon className={styles.inputIcon} />
            </div>
          </div>

          {/* Password Field */}
          <div className={styles.formGroup}>
            <label htmlFor="password" className={styles.label}>
              Şifre
            </label>
            <div className={styles.inputWrapper}>
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                required
                value={formData.password}
                onChange={handleChange}
                className={`${styles.input} ${styles.passwordInput}`}
                placeholder="••••••••"
              />
              <LockClosedIcon className={styles.inputIcon} />
              <button
                type="button"
                className={styles.passwordToggle}
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeSlashIcon />
                ) : (
                  <EyeIcon />
                )}
              </button>
            </div>
            <div className={styles.forgotPassword}>
              <Link to="/forgot-password" className={styles.link}>
                Şifremi unuttum
              </Link>
            </div>
          </div>

          {/* Login Button */}
          <button
            type="submit"
            disabled={loading}
            className={`${styles.button} ${styles.primaryButton}`}
          >
            {loading ? (
              <>
                <div className={styles.spinner}></div>
                Giriş yapılıyor...
              </>
            ) : (
              'Giriş Yap'
            )}
          </button>
        </form>

        {/* Google Login */}
        <div className={styles.googleButton}>
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className={`${styles.button} ${styles.secondaryButton}`}
          >
            <svg className={styles.googleIcon} viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Google ile Giriş Yap
          </button>
        </div>

        {/* Register Link */}
        <div className={styles.registerLink}>
          <p>
            Hesabınız yok mu?{' '}
            <Link to="/register" className={styles.link}>
              Kayıt olun
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login; 