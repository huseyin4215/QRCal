import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import apiService from '../services/apiService';
import api from '../services/api';
import {
  EyeIcon,
  EyeSlashIcon,
  AcademicCapIcon,
  UserIcon,
  EnvelopeIcon,
  LockClosedIcon,
  IdentificationIcon,
  BuildingOfficeIcon
} from '@heroicons/react/24/outline';
import styles from '../styles/login.module.css';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    studentNumber: '',
    department: '',
    advisor: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [departments, setDepartments] = useState([]);
  const [facultyList, setFacultyList] = useState([]);

  const navigate = useNavigate();
  const { login } = useAuth();

  // Fetch departments and faculty list from API on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [deptResponse, facultyResponse] = await Promise.all([
          apiService.getDepartments(),
          apiService.get('/auth/faculty')
        ]);

        if (deptResponse.success && deptResponse.data) {
          setDepartments(deptResponse.data);
        }

        if (facultyResponse.success && facultyResponse.data) {
          setFacultyList(facultyResponse.data);
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
      }
    };
    fetchData();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const validateForm = () => {
    if (formData.password !== formData.confirmPassword) {
      setError('Şifreler eşleşmiyor');
      return false;
    }

    if (formData.password.length < 6) {
      setError('Şifre en az 6 karakter olmalıdır');
      return false;
    }

    // Validate student number: exactly 8 digits
    if (!/^\d{8}$/.test(formData.studentNumber)) {
      setError('Öğrenci numarası tam olarak 8 haneli olmalıdır');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await apiService.register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        studentNumber: formData.studentNumber,
        department: formData.department,
        advisor: formData.advisor
      });

      if (response.success) {
        setSuccess('Kayıt başarılı! Giriş yapılıyor...');
        login(response.data.token, response.data.user);

        // Redirect to student dashboard
        setTimeout(() => {
          navigate('/student-dashboard');
        }, 1500);
      }
    } catch (error) {
      setError(error.message || 'Kayıt olurken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleRegister = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await api.getGoogleAuthUrl();
      const authUrl = response?.data?.authUrl || response?.data?.url || response?.authUrl;
      if (response?.success && authUrl) {
        window.location.href = authUrl;
      } else {
        setError(response?.message || 'Google ile kayıt başlatılamadı');
        setLoading(false);
      }
    } catch (error) {
      setError(error.message || 'Google ile kayıt başlatılamadı');
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
          <p className={styles.description}>Öğrenci hesabı oluşturun</p>
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

        {/* Register Form */}
        <form className={styles.form} onSubmit={handleSubmit}>
          {/* Name Field */}
          <div className={styles.formGroup}>
            <label htmlFor="name" className={styles.label}>
              Ad Soyad
            </label>
            <div className={styles.inputWrapper}>
              <input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                required
                value={formData.name}
                onChange={handleChange}
                className={styles.input}
                placeholder="Ad Soyad"
              />
              <UserIcon className={styles.inputIcon} />
            </div>
          </div>

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

          {/* Student Number Field */}
          <div className={styles.formGroup}>
            <label htmlFor="studentNumber" className={styles.label}>
              Öğrenci Numarası
            </label>
            <div className={styles.inputWrapper}>
              <input
                id="studentNumber"
                name="studentNumber"
                type="text"
                required
                value={formData.studentNumber}
                onChange={(e) => {
                  // Only allow digits and limit to 8 characters
                  const value = e.target.value.replace(/\D/g, '').slice(0, 8);
                  handleChange({ ...e, target: { ...e.target, value } });
                }}
                className={styles.input}
                placeholder="20000000"
                maxLength={8}
              />
              <IdentificationIcon className={styles.inputIcon} />
            </div>
          </div>

          {/* Department Field */}
          <div className={styles.formGroup}>
            <label htmlFor="department" className={styles.label}>
              Bölüm
            </label>
            <div className={styles.inputWrapper}>
              <select
                id="department"
                name="department"
                required
                value={formData.department}
                onChange={handleChange}
                className={`${styles.input} ${styles.select}`}
              >
                <option value="">Bölüm seçiniz</option>
                {departments.map((dept) => (
                  <option key={dept._id} value={dept.name}>
                    {dept.name}
                  </option>
                ))}
              </select>
              <BuildingOfficeIcon className={styles.inputIcon} />
            </div>
          </div>

          {/* Advisor Field - Required */}
          <div className={styles.formGroup}>
            <label htmlFor="advisor" className={styles.label}>
              Danışman *
            </label>
            <div className={styles.inputWrapper}>
              <select
                id="advisor"
                name="advisor"
                value={formData.advisor}
                onChange={handleChange}
                required
                className={`${styles.input} ${styles.select}`}
              >
                <option value="">Danışman seçiniz</option>
                {Object.entries(
                  facultyList.reduce((acc, faculty) => {
                    const dept = faculty.department || 'Diğer';
                    if (!acc[dept]) acc[dept] = [];
                    acc[dept].push(faculty);
                    return acc;
                  }, {})
                ).map(([department, members]) => (
                  <optgroup key={department} label={department}>
                    {members.map((faculty) => (
                      <option key={faculty._id} value={faculty._id} style={{ paddingLeft: '0px' }}>
                        {faculty.title ? `${faculty.title} ` : ''}{faculty.name}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
              <UserIcon className={styles.inputIcon} />
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
                autoComplete="new-password"
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
          </div>

          {/* Confirm Password Field */}
          <div className={styles.formGroup}>
            <label htmlFor="confirmPassword" className={styles.label}>
              Şifre Tekrar
            </label>
            <div className={styles.inputWrapper}>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                autoComplete="new-password"
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                className={`${styles.input} ${styles.passwordInput}`}
                placeholder="••••••••"
              />
              <LockClosedIcon className={styles.inputIcon} />
              <button
                type="button"
                className={styles.passwordToggle}
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? (
                  <EyeSlashIcon />
                ) : (
                  <EyeIcon />
                )}
              </button>
            </div>
          </div>

          {/* Register Button */}
          <button
            type="submit"
            disabled={loading}
            className={`${styles.button} ${styles.primaryButton}`}
          >
            {loading ? (
              <>
                <div className={styles.spinner}></div>
                Kayıt olunuyor...
              </>
            ) : (
              'Kayıt Ol'
            )}
          </button>
        </form>

        {/* Google Register */}
        <div className={styles.googleButton}>
          <button
            onClick={handleGoogleRegister}
            disabled={loading}
            className={`${styles.button} ${styles.secondaryButton}`}
          >
            <svg className={styles.googleIcon} viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Google ile Kayıt Ol
          </button>
        </div>

        {/* Login Link */}
        <div className={styles.registerLink}>
          <p>
            Zaten hesabınız var mı?{' '}
            <Link to="/login" className={styles.link}>
              Giriş yapın
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register; 