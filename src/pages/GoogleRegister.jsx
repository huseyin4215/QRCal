import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import apiService from '../services/apiService';
import { AcademicCapIcon, UserIcon, EnvelopeIcon, IdentificationIcon, BuildingOfficeIcon } from '@heroicons/react/24/outline';
import styles from '../styles/login.module.css';

const GoogleRegister = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const [prefill, setPrefill] = useState({ name: '', email: '' });
  const [studentNumber, setStudentNumber] = useState('');
  const [department, setDepartment] = useState('');
  const [name, setName] = useState('');
  const [advisor, setAdvisor] = useState('');
  const [facultyList, setFacultyList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const departments = [
    'Yapay Zeka ve Veri Mühendisliği',
    'Yazılım Mühendisliği',
    'Bilgisayar Mühendisliği',
    'Elektrik Elektronik Mühendisliği',
    'Enerji Mühendisliği',
    'BiyoMedikal Mühendisliği',
    'Gıda Mühendisliği',
    'Fizik Mühendisliği'
  ];

  useEffect(() => {
    const loadInfo = async () => {
      try {
        // Fetch Google register info
        const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/auth/google/register-info?token=${encodeURIComponent(token)}`);
        const data = await res.json();
        if (data?.success) {
          setPrefill({ name: data.data.name, email: data.data.email });
          setName(data.data.name || '');
        } else {
          setError(data?.message || 'Kayıt bilgileri alınamadı');
        }

        // Fetch faculty list
        try {
          const facultyResponse = await apiService.get('/auth/faculty');
          if (facultyResponse.success && facultyResponse.data) {
            setFacultyList(facultyResponse.data);
          }
        } catch (facultyError) {
          console.warn('Faculty listesi yüklenemedi:', facultyError);
          // Faculty listesi yüklenemese bile kayıt devam edebilir (advisor optional)
        }
      } catch (e) {
        setError(e.message || 'Kayıt bilgileri alınamadı');
      }
    };
    if (token) loadInfo();
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!studentNumber || !department || !advisor) {
      setError('Öğrenci numarası, bölüm ve danışman zorunludur');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/auth/google/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, studentNumber, department, name, advisor })
      });
      const data = await res.json();
      if (data?.success) {
        setSuccess('Kayıt başarılı! Giriş yapılıyor...');
        login(data.data.token, data.data.user);
        setTimeout(() => {
          navigate('/student-dashboard');
        }, 1500);
      } else {
        setError(data?.message || 'Kayıt tamamlanamadı');
      }
    } catch (e) {
      setError(e.message || 'Kayıt tamamlanamadı');
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
          <h1 className={styles.title}>QRCal</h1>
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

        {/* Form */}
        <form className={styles.form} onSubmit={handleSubmit}>
          {/* Name */}
          <div className={styles.formGroup}>
            <label className={styles.label}>Ad Soyad</label>
            <div className={styles.inputWrapper}>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className={styles.input}
                placeholder="Ad Soyad"
              />
              <UserIcon className={styles.inputIcon} />
            </div>
          </div>

          {/* Email (readonly) */}
          <div className={styles.formGroup}>
            <label className={styles.label}>E-posta</label>
            <div className={styles.inputWrapper}>
              <input
                type="email"
                value={prefill.email}
                readOnly
                className={`${styles.input} bg-gray-100`}
              />
              <EnvelopeIcon className={styles.inputIcon} />
            </div>
          </div>

          {/* Student Number */}
          <div className={styles.formGroup}>
            <label className={styles.label}>Öğrenci Numarası</label>
            <div className={styles.inputWrapper}>
              <input
                type="text"
                value={studentNumber}
                onChange={(e) => {
                  // Only allow digits and limit to 8 characters
                  const value = e.target.value.replace(/\D/g, '').slice(0, 8);
                  setStudentNumber(value);
                }}
                required
                className={styles.input}
                placeholder="20000000"
                maxLength={8}
                inputMode="numeric"
              />
              <IdentificationIcon className={styles.inputIcon} />
            </div>
          </div>

          {/* Department */}
          <div className={styles.formGroup}>
            <label className={styles.label}>Bölüm</label>
            <div className={styles.inputWrapper}>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                required
                className={`${styles.input} ${styles.select}`}
              >
                <option value="">Bölüm seçiniz</option>
                {departments.map((dept) => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
              <BuildingOfficeIcon className={styles.inputIcon} />
            </div>
          </div>

          {/* Advisor Field - Required */}
          <div className={styles.formGroup}>
            <label className={styles.label}>Danışman *</label>
            <div className={styles.inputWrapper}>
              <select
                value={advisor}
                onChange={(e) => setAdvisor(e.target.value)}
                required
                className={`${styles.input} ${styles.select}`}
              >
                <option value="">Danışman seçiniz</option>
                {Object.entries(
                  facultyList.reduce((acc, faculty) => {
                    const dept = faculty.department || (faculty.role === 'admin' ? 'Yönetim' : 'Diğer');
                    if (!acc[dept]) acc[dept] = [];
                    acc[dept].push(faculty);
                    return acc;
                  }, {})
                ).flatMap(([department, members]) => [
                  <option key={`header-${department}`} disabled style={{ fontWeight: 'bold', color: '#000' }}>
                    {department}
                  </option>,
                  ...members.map((faculty) => (
                    <option key={faculty._id} value={faculty._id}>
                      {faculty.title ? `${faculty.title} ` : ''}{faculty.name}{faculty.role === 'admin' ? ' (Admin)' : ''}
                    </option>
                  ))
                ])}
              </select>
              <UserIcon className={styles.inputIcon} />
            </div>
          </div>

          {/* Submit */}
          <button type="submit" disabled={loading} className={`${styles.button} ${styles.primaryButton}`}>
            {loading ? (
              <>
                <div className={styles.spinner}></div>
                Kayıt tamamlanıyor...
              </>
            ) : (
              'Kaydı Tamamla'
            )}
          </button>
        </form>

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

export default GoogleRegister;


