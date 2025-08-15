import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { QrCodeIcon, DocumentArrowDownIcon, ArrowUpTrayIcon, SparklesIcon, HomeIcon, UserIcon } from '@heroicons/react/24/outline';
import apiService from '../services/apiService';
import Header from '../components/Header/Header';
import QRCodeEditor from '../components/QRCodeEditor';
import styles from '../styles/QrCodePage.module.css';

const QrCodePage = () => {
  const { user } = useAuth();
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [qrCodeData, setQrCodeData] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showEditor, setShowEditor] = useState(false);
  const navigate = useNavigate();

  // Profile dropdown handlers
  const handleProfile = () => {
    navigate('/profile');
  };

  const handlePassword = () => {
    navigate('/change-password');
  };

  const handleLogout = () => {
    // Logout logic will be handled by AuthContext
    window.location.href = '/login';
  };

  // Debug: Log user information
  useEffect(() => {
    console.log('QrCodePage - User:', user);
    console.log('QrCodePage - User role:', user?.role);
    console.log('QrCodePage - User ID:', user?._id);
  }, [user]);

  // Check if user has permission to access QR code page
  useEffect(() => {
    if (user && user.role !== 'faculty' && user.role !== 'admin') {
      console.log('QrCodePage - User role not allowed:', user.role);
      setError('Bu sayfaya erişim yetkiniz yok. Sadece öğretim elemanları ve yöneticiler QR kod oluşturabilir.');
    }
  }, [user]);

  useEffect(() => {
    if (user && (user.role === 'faculty' || user.role === 'admin')) {
      loadQrCode();
    }
  }, [user]);

  const loadQrCode = async () => {
    try {
      setLoading(true);
      setError('');
      
      console.log('Loading QR code...');
      const response = user?.role === 'admin' 
        ? await apiService.getAdminQrCode()
        : await apiService.getQrCode();
      
      console.log('QR code response:', response);
      
      if (response.success) {
        setQrCodeUrl(response.data.qrCodeUrl);
        const qrData = response.data.qrCodeUrl || `${window.location.origin}/appointment/${user?.slug || 'admin'}`;
        setQrCodeData(qrData);
      } else {
        setError(response.message || 'QR kod yüklenemedi');
      }
    } catch (error) {
      console.error('QR code load error:', error);
      setError('QR kod yüklenirken hata oluştu. Backend sunucusunun çalıştığından emin olun.');
    } finally {
      setLoading(false);
    }
  };

  const generateQrCode = async () => {
    try {
      setLoading(true);
      setError('');
      setSuccess('');
      
      console.log('Generating QR code...');
      const response = user?.role === 'admin'
        ? await apiService.generateAdminQrCode()
        : await apiService.generateQrCode();
      
      console.log('Generate QR code response:', response);
      
      if (response.success) {
        setQrCodeUrl(response.data.qrCodeUrl);
        setSuccess('QR kod başarıyla oluşturuldu!');
        
        let qrData = response.data.qrCodeUrl;
        
        // If it's a localhost URL, check if servers are running
        if (qrData && qrData.includes('localhost:3000')) {
          try {
            const backendCheck = await fetch('http://localhost:5000/api/health', { 
              method: 'GET',
              signal: AbortSignal.timeout(2000)
            });
            if (!backendCheck.ok) {
              qrData = `QR Kod: ${user?.name || 'Faculty'} - Randevu Alma\n\nBu QR kodu tarayarak randevu alabilirsiniz.\n\nÖğretim Elemanı: ${user?.name}\nBölüm: ${user?.department}\n\nNot: Sunucu çalışmadığı için randevu alma özelliği geçici olarak kullanılamıyor.`;
            }
          } catch (error) {
            qrData = `QR Kod: ${user?.name || 'Faculty'} - Randevu Alma\n\nBu QR kodu tarayarak randevu alabilirsiniz.\n\nÖğretim Elemanı: ${user?.name}\nBölüm: ${user?.department}\n\nNot: Sunucu çalışmadığı için randevu alma özelliği geçici olarak kullanılamıyor.`;
          }
        }
        
        setQrCodeData(qrData);
      } else {
        setError(response.message || 'QR kod oluşturulamadı');
      }
    } catch (error) {
      console.error('QR code generation error:', error);
      setError('QR kod oluşturulurken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const downloadQrCode = () => {
    if (qrCodeUrl) {
      const link = document.createElement('a');
      link.href = qrCodeUrl;
      link.download = `qr-code-${user?.name || 'admin'}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const shareQrCode = async () => {
    if (navigator.share && qrCodeUrl) {
      try {
        await navigator.share({
          title: `${user?.name || 'Faculty'} - QR Kod`,
          text: 'QR kodu tarayarak randevu alabilirsiniz',
          url: qrCodeUrl
        });
      } catch (error) {
        console.log('Share cancelled or failed');
      }
    } else {
      // Fallback to clipboard
      try {
        await navigator.clipboard.writeText(qrCodeUrl);
        setSuccess('QR kod URL\'si panoya kopyalandı!');
      } catch (error) {
        setError('QR kod URL\'si kopyalanamadı');
      }
    }
  };

  const handleDownloadQR = (qrCodeUrl) => {
    if (qrCodeUrl) {
      const link = document.createElement('a');
      link.href = qrCodeUrl;
      link.download = `qr-code-${user?.name || 'admin'}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  // If user doesn't have permission, show error message
  if (user && user.role !== 'faculty' && user.role !== 'admin') {
    return (
      <div className={styles.pageContainer}>
        <Header />
        <div className={styles.contentContainer}>
          <div className={styles.mainCard}>
            <div className={styles.errorMessage}>
              <h2>Erişim Reddedildi</h2>
              <p>Bu sayfaya erişim yetkiniz yok. Sadece öğretim elemanları ve yöneticiler QR kod oluşturabilir.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.pageContainer}>
      <Header 
        user={user}
        onProfile={handleProfile}
        onPassword={handlePassword}
        onLogout={handleLogout}
      />
      <div className={styles.contentContainer}>
        <div className={styles.mainCard}>
          {/* User Info and Navigation Header */}
          <div className={styles.userHeader}>
            <div className={styles.userInfo}>
              <div className={styles.userAvatar}>
                <UserIcon className="w-6 h-6" />
              </div>
              <div className={styles.userDetails}>
                <h2 className={styles.userName}>{user?.name || 'Kullanıcı'}</h2>
                <p className={styles.userRole}>
                  {user?.role === 'admin' ? 'Yönetici' : 
                   user?.role === 'faculty' ? 'Öğretim Elemanı' : 
                   user?.role === 'student' ? 'Öğrenci' : 'Kullanıcı'}
                </p>
                {user?.department && (
                  <p className={styles.userDepartment}>{user.department}</p>
                )}
              </div>
            </div>
            
            <div className={styles.navigationButtons}>
              <button
                onClick={() => navigate('/')}
                className={styles.navButton}
                title="Anasayfaya Dön"
              >
                <HomeIcon className="w-5 h-5" />
                <span>Anasayfa</span>
              </button>
            </div>
          </div>

          <div className={styles.headerSection}>
            <div className={styles.headerIcon}>
              <QrCodeIcon className="w-8 h-8" />
            </div>
            <h1 className={styles.headerTitle}>QR Kod Oluşturucu</h1>
            <p className={styles.headerSubtitle}>
              Öğrencilerinizin kolayca randevu alabilmesi için QR kodunuzu oluşturun ve özelleştirin
            </p>
          </div>

          {/* Error and Success Messages */}
          {error && (
            <div className={styles.messageContainer}>
              <div className={styles.errorMessage}>{error}</div>
            </div>
          )}

          {success && (
            <div className={styles.messageContainer}>
              <div className={styles.successMessage}>{success}</div>
            </div>
          )}

          {/* Generate QR Code Button */}
          {!qrCodeUrl && (
            <button
              onClick={generateQrCode}
              disabled={loading}
              className={styles.generateButton}
            >
              {loading ? (
                <>
                  <div className={styles.loadingSpinner} />
                  QR Kod Oluşturuluyor...
                </>
              ) : (
                <>
                  <SparklesIcon className="w-6 h-6" />
                  QR Kod Oluştur
                </>
              )}
            </button>
          )}

          {/* QR Code Display */}
          {qrCodeUrl && (
            <div className={styles.qrCodeSection}>
              <div className={styles.qrCodeContainer}>
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrCodeUrl)}`}
                  alt="QR Code"
                  className={styles.qrCodeImage}
                />
              </div>

              {/* Action Buttons */}
              <div className={styles.actionButtons}>
                <button
                  onClick={() => setShowEditor(!showEditor)}
                  className={`${styles.actionButton} ${showEditor ? 'bg-purple-600' : ''}`}
                >
                  <QrCodeIcon className={styles.actionIcon} />
                  {showEditor ? 'Düzenlemeyi Kapat' : 'QR Kodu Düzenle'}
                </button>
                
                <button
                  onClick={downloadQrCode}
                  className={styles.actionButton}
                >
                  <DocumentArrowDownIcon className={styles.actionIcon} />
                  QR Kodu İndir
                </button>
                
                <button
                  onClick={shareQrCode}
                  className={styles.actionButton}
                >
                  <ArrowUpTrayIcon className={styles.actionIcon} />
                  Paylaş
                </button>
              </div>

              {/* QR Code Editor */}
              {showEditor && (
                <QRCodeEditor 
                  value={qrCodeData} 
                  onDownload={handleDownloadQR}
                  user={user}
                />
              )}

              {/* Usage Information */}
              <div className={styles.usageInfo}>
                <h3 className={styles.usageTitle}>QR Kodunuzu Nasıl Kullanabilirsiniz?</h3>
                <ul className={styles.usageList}>
                  <li>QR kodu yazdırıp ofisinizin kapısına asın</li>
                  <li>E-posta imzanıza ekleyin</li>
                  <li>Sosyal medya profilinizde paylaşın</li>
                  <li>Öğrencilerinize dijital olarak gönderin</li>
                  <li>Sunumlarınızda ve materyallerinizde kullanın</li>
                </ul>
              </div>
            </div>
          )}

          {/* Loading State */}
          {loading && !qrCodeUrl && (
            <div className={styles.loadingContainer}>
              <div className={styles.loadingSpinner} />
              <p className={styles.loadingText}>QR kod oluşturuluyor...</p>
            </div>
          )}

          {/* Empty State */}
          {!loading && !qrCodeUrl && !error && (
            <div className={styles.emptyState}>
              <QrCodeIcon className={styles.emptyIcon} />
              <p className={styles.emptyText}>
                QR kodunuzu oluşturmak için yukarıdaki butona tıklayın
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QrCodePage; 