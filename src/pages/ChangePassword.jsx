import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import apiService from '../services/apiService';
import { 
  EyeIcon, 
  EyeSlashIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import styles from './ChangePassword.module.css';

const ChangePassword = () => {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const navigate = useNavigate();
  const { user, updateUser, logout } = useAuth();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const validateForm = () => {
    if (formData.newPassword !== formData.confirmPassword) {
      setError('Yeni şifreler eşleşmiyor');
      return false;
    }

    if (formData.newPassword.length < 6) {
      setError('Yeni şifre en az 6 karakter olmalıdır');
      return false;
    }

    if (formData.currentPassword === formData.newPassword) {
      setError('Yeni şifre mevcut şifre ile aynı olamaz');
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
      const response = await apiService.changePassword(
        formData.currentPassword,
        formData.newPassword
      );
      
      if (response && response.success) {
        setSuccess('Şifre başarıyla değiştirildi! Yönlendiriliyorsunuz...');
        
        // Update token and user's information in AuthContext with data from backend
        if (response.data) {
          // Update token if provided
          if (response.data.token) {
            localStorage.setItem('token', response.data.token);
            apiService.setToken(response.data.token);
          }
          
          // Update user data
          if (response.data.user) {
            updateUser(response.data.user);
            localStorage.setItem('user', JSON.stringify(response.data.user));
          } else {
            // Fallback: just update isFirstLogin status
            updateUser({ isFirstLogin: false });
            const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
            currentUser.isFirstLogin = false;
            localStorage.setItem('user', JSON.stringify(currentUser));
          }
        }
        
        // Redirect based on role
        setTimeout(() => {
          switch (user.role) {
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
        }, 2000);
      } else {
        const errorMessage = response?.message || 'Şifre değiştirilemedi.';
        setError(errorMessage);
      }
    } catch (error) {
      console.error('ChangePassword error:', error);
      
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
        setError(error.message || 'Şifre değiştirilirken bir hata oluştu');
      }
    } finally {
      setLoading(false);
    }
  };

      return (
      <div className={styles._modalOverlay_7cf25_1}>
        <div className={styles._modalContent_7cf25_33}>
          <div className={styles._modalHeader_7cf25_61}>
            <h3 className={styles._modalTitle_7cf25_77}>İlk Giriş - Şifre Değiştirme</h3>
          </div>

          <div className={styles._firstLoginNotice}>
            <p>İlk giriş olduğu için şifrenizi değiştirmeniz gerekiyor.</p>
          </div>
          
          <div className={styles._modalBody_7cf25_147}>
            <form>
              <div className={styles._formGroup_7cf25_155}>
                <label htmlFor="currentPassword" className={styles._formLabel_7cf25_165}>Mevcut Şifre *</label>
                <div className={styles._inputContainer_7cf25_181}>
                  <input 
                    type={showCurrentPassword ? 'text' : 'password'}
                    id="currentPassword" 
                    name="currentPassword" 
                    required 
                    className={styles._formInput_7cf25_189} 
                    placeholder="Mevcut şifrenizi girin" 
                    value={formData.currentPassword}
                    onChange={handleChange}
                  />
                  <button 
                    type="button" 
                    className={styles._passwordToggle_7cf25_235}
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  >
                    {showCurrentPassword ? (
                      <EyeSlashIcon className={styles._passwordIcon_7cf25_273} />
                    ) : (
                      <EyeIcon className={styles._passwordIcon_7cf25_273} />
                    )}
                  </button>
                </div>
              </div>
              
              <div className={styles._formGroup_7cf25_155}>
                <label htmlFor="newPassword" className={styles._formLabel_7cf25_165}>Yeni Şifre *</label>
                <div className={styles._inputContainer_7cf25_181}>
                  <input 
                    type={showNewPassword ? 'text' : 'password'}
                    id="newPassword" 
                    name="newPassword" 
                    required 
                    className={styles._formInput_7cf25_189} 
                    placeholder="Yeni şifrenizi girin" 
                    value={formData.newPassword}
                    onChange={handleChange}
                  />
                  <button 
                    type="button" 
                    className={styles._passwordToggle_7cf25_235}
                    onClick={() => setShowNewPassword(!showNewPassword)}
                  >
                    {showNewPassword ? (
                      <EyeSlashIcon className={styles._passwordIcon_7cf25_273} />
                    ) : (
                      <EyeIcon className={styles._passwordIcon_7cf25_273} />
                    )}
                  </button>
                </div>
              </div>
              
              <div className={styles._formGroup_7cf25_155}>
                <label htmlFor="confirmPassword" className={styles._formLabel_7cf25_165}>Şifre Tekrar *</label>
                <div className={styles._inputContainer_7cf25_181}>
                  <input 
                    type={showConfirmPassword ? 'text' : 'password'}
                    id="confirmPassword" 
                    name="confirmPassword" 
                    required 
                    className={styles._formInput_7cf25_189} 
                    placeholder="Yeni şifrenizi tekrar girin" 
                    value={formData.confirmPassword}
                    onChange={handleChange}
                  />
                  <button 
                    type="button" 
                    className={styles._passwordToggle_7cf25_235}
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeSlashIcon className={styles._passwordIcon_7cf25_273} />
                    ) : (
                      <EyeIcon className={styles._passwordIcon_7cf25_273} />
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>

          <div className={styles._modalFooter_7cf25_283}>
            <button 
              type="button" 
              onClick={() => {
                logout();
                navigate('/login');
              }}
              className={`${styles._button_7cf25_299} ${styles._secondaryButton_7cf25_383}`}
              disabled={loading}
            >
              Çıkış Yap
            </button>
            <button 
              type="submit" 
              onClick={handleSubmit}
              className={`${styles._button_7cf25_299} ${styles._primaryButton_7cf25_361}`}
              disabled={loading}
            >
              {loading ? 'Değiştiriliyor...' : 'Şifre Değiştir'}
            </button>
          </div>
        </div>
      </div>
    );
};

export default ChangePassword; 