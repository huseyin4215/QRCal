import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import apiService from '../services/apiService';
import { 
  CalendarIcon, 
  ClockIcon, 
  AcademicCapIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon as ClockIconSolid,
  ExclamationTriangleIcon,
  PlusIcon
} from '@heroicons/react/24/outline';

// Import modern components
import Header from '../components/Header/Header';
import headerStyles from '../components/Header/Header.module.css';
import StatsCard from '../components/StatsCard/StatsCard';
import AppointmentList from '../components/AppointmentList/AppointmentList';
import AppointmentDetails from '../components/AppointmentDetails/AppointmentDetails';
import ProfileModal from '../components/ProfileModal/ProfileModal';
import PasswordModal from '../components/PasswordModal/PasswordModal';
import EmailVerificationModal from '../components/EmailVerificationModal/EmailVerificationModal';
import TabNavigation from '../components/TabNavigation';
import AppointmentHistory from './AppointmentHistory';

const StudentDashboard = () => {
  const { user, login, logout } = useAuth();
  const [searchParams] = useSearchParams();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('appointments');

  // URL'deki ?tab=appointments ile Randevular sekmesine yönlendirme (footer linki vb.)
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab === 'appointments' || tab === 'history' || tab === 'new') {
      setActiveTab(tab);
    }
  }, [searchParams]);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    cancelled: 0
  });
  
  // Profile management states
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    studentNumber: '',
    department: '',
    advisor: ''
  });
  const [departments, setDepartments] = useState([]);
  const [facultyList, setFacultyList] = useState([]);
  const [showEmailVerificationModal, setShowEmailVerificationModal] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [emailVerificationLoading, setEmailVerificationLoading] = useState(false);
  const [emailVerificationError, setEmailVerificationError] = useState('');
  const [emailVerificationSuccess, setEmailVerificationSuccess] = useState('');
  const [verificationCodeSent, setVerificationCodeSent] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [profileLoading, setProfileLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [profileError, setProfileError] = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showAppointmentDetails, setShowAppointmentDetails] = useState(false);
  const [globalError, setGlobalError] = useState('');
  const [globalSuccess, setGlobalSuccess] = useState('');
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [historyRefreshTrigger, setHistoryRefreshTrigger] = useState(0); // Trigger to refresh AppointmentHistory

  // Load notifications from localStorage
  const loadNotificationsFromStorage = () => {
    try {
      const storedNotifications = localStorage.getItem('notifications');
      const storedUnreadCount = localStorage.getItem('unreadCount');
      if (storedNotifications) {
        const parsedNotifications = JSON.parse(storedNotifications);
        setNotifications(parsedNotifications);
        setUnreadCount(storedUnreadCount ? parseInt(storedUnreadCount) : 0);
      }
    } catch (error) {
      console.error('Error loading notifications from storage:', error);
    }
  };

  // Save notifications to localStorage
  const saveNotificationsToStorage = (newNotifications, newUnreadCount) => {
    try {
      localStorage.setItem('notifications', JSON.stringify(newNotifications));
      localStorage.setItem('unreadCount', newUnreadCount.toString());
    } catch (error) {
      console.error('Error saving notifications to storage:', error);
    }
  };

  useEffect(() => {
    if (user) {
      console.log('StudentDashboard - User loaded:', user);
      loadAppointments();
      loadNotificationsFromStorage(); // Load notifications from localStorage
    } else {
      console.log('StudentDashboard - User not loaded yet');
    }
  }, [user]);

  // Save notifications to localStorage when they change
  useEffect(() => {
    if (notifications.length > 0 || unreadCount > 0) {
      saveNotificationsToStorage(notifications, unreadCount);
    }
  }, [notifications, unreadCount]);

  // Load notifications on mount and when dropdown opens
  useEffect(() => {
    if (!user) return;
    const load = async () => {
      try {
        const res = await apiService.getUnreadNotifications();
        if (res.success) {
          const list = res.data?.notifications || res.data || [];
          setNotifications(list);
          setUnreadCount(res.data?.unreadCount ?? list.filter(n => !n.read).length);
        }
      } catch (e) {
        console.error('Notifications load error:', e);
      }
    };
    load();
  }, [user]);

  const toggleNotifications = async () => {
    const next = !showNotifications;
    setShowNotifications(next);
    if (next) {
      try {
        const res = await apiService.getUnreadNotifications();
        if (res.success) {
          const list = res.data?.notifications || res.data || [];
          setNotifications(list);
          setUnreadCount(res.data?.unreadCount ?? list.filter(n => !n.read).length);
        }
      } catch (e) {
        console.error('Notifications refresh error:', e);
      }
    }
  };

  const markAllNotificationsRead = async () => {
    try {
      // Mark all notifications as read (keep them, just mark as read)
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
      saveNotificationsToStorage(notifications.map(n => ({ ...n, read: true })));
      
      // Also call API to mark as read on server
      await apiService.markAllNotificationsAsRead();
    } catch (e) {
      console.error('Mark all read failed:', e);
    }
  };

  const handleLogout = () => {
    if (window.confirm('Çıkış yapmak istediğinizden emin misiniz?')) {
      logout(); // AuthContext'teki logout'u kullan
    }
  };

  const openProfileModal = async () => {
    // Fetch departments and faculty list
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
      console.error('Failed to fetch departments/faculty:', error);
    }

    setProfileData({
      name: user?.name || '',
      email: user?.email || '',
      studentNumber: user?.studentNumber || '',
      department: user?.department || '',
      advisor: user?.advisor || ''
    });
    setShowProfileModal(true);
    setProfileError('');
    setProfileSuccess('');
  };

  const openPasswordModal = () => {
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    setShowPasswordModal(true);
    setPasswordError('');
    setPasswordSuccess('');
  };

  const handleProfileInputChange = (e) => {
    const { name, value } = e.target;
    
    // If email is being changed, show email verification modal
    if (name === 'email' && value !== user?.email) {
      setShowEmailVerificationModal(true);
      setNewEmail(value);
      return; // Don't update profileData yet
    }
    
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePasswordInputChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setProfileLoading(true);
    setProfileError('');
    setProfileSuccess('');

    try {
      // Don't send email in profile update if it's different (should use verification)
      const profileDataToSend = { ...profileData };
      if (profileDataToSend.email !== user?.email) {
        delete profileDataToSend.email; // Remove email from update
      }
      
      const response = await apiService.updateStudentProfile(profileDataToSend);
      
      if (response.success) {
        setProfileSuccess('Profil başarıyla güncellendi!');
        
        // Update local user data
        const updatedUser = { ...user, ...profileDataToSend };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        
        // Modal otomatik kapanmasın - kullanıcı kendisi kapatsın
      }
    } catch (error) {
      console.error('Profile update error:', error);
      setProfileError(error.message || 'Profil güncellenirken hata oluştu');
    } finally {
      setProfileLoading(false);
    }
  };

  const handleRequestEmailVerificationCode = async () => {
    if (!newEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail)) {
      setEmailVerificationError('Geçerli bir e-posta adresi giriniz');
      return;
    }

    setEmailVerificationLoading(true);
    setEmailVerificationError('');
    setEmailVerificationSuccess('');

    try {
      const response = await apiService.requestEmailChange(newEmail);
      
      if (response.success) {
        setEmailVerificationSuccess('Doğrulama kodu yeni e-posta adresinize gönderildi');
        setVerificationCodeSent(true);
      }
    } catch (error) {
      console.error('Email verification request error:', error);
      setEmailVerificationError(error.message || 'Doğrulama kodu gönderilemedi');
    } finally {
      setEmailVerificationLoading(false);
    }
  };

  const handleVerifyEmailChange = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      setEmailVerificationError('6 haneli doğrulama kodunu giriniz');
      return;
    }

    setEmailVerificationLoading(true);
    setEmailVerificationError('');
    setEmailVerificationSuccess('');

    try {
      const response = await apiService.verifyEmailChange(verificationCode);
      
      if (response.success) {
        setEmailVerificationSuccess('E-posta adresi başarıyla güncellendi!');
        
        // Update profile data with new email
        setProfileData(prev => ({
          ...prev,
          email: newEmail
        }));
        
        // Update local user data
        const updatedUser = { ...user, email: newEmail };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        
        // Close modal after 2 seconds
        setTimeout(() => {
          setShowEmailVerificationModal(false);
          setVerificationCodeSent(false);
          setVerificationCode('');
          setNewEmail('');
          setEmailVerificationSuccess('');
          window.location.reload(); // Refresh to update header
        }, 2000);
      }
    } catch (error) {
      console.error('Email verification error:', error);
      setEmailVerificationError(error.message || 'Doğrulama kodu geçersiz');
    } finally {
      setEmailVerificationLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordLoading(true);
    setPasswordError('');
    setPasswordSuccess('');

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('Yeni şifreler eşleşmiyor');
      setPasswordLoading(false);
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setPasswordError('Yeni şifre en az 6 karakter olmalıdır');
      setPasswordLoading(false);
      return;
    }

    try {
      const response = await apiService.changePassword(passwordData.currentPassword, passwordData.newPassword);
      
      if (response.success) {
        setPasswordSuccess('Şifre başarıyla değiştirildi!');
        
        // Close modal after 2 seconds
        setTimeout(() => {
          setShowPasswordModal(false);
          setPasswordSuccess('');
        }, 2000);
      }
    } catch (error) {
      console.error('Password change error:', error);
      setPasswordError(error.message || 'Şifre değiştirilirken hata oluştu');
    } finally {
      setPasswordLoading(false);
    }
  };

  const loadAppointments = async () => {
    try {
      setLoading(true);

      // Load profile data first
      try {
        const profileResponse = await apiService.getCurrentUser();
        const profileData = profileResponse.data;

        // Update profile state with loaded data
        setProfileData({
          name: profileData.name || '',
          email: profileData.email || '',
          studentNumber: profileData.studentNumber || '',
          department: profileData.department || '',
          advisor: profileData.advisor || ''
        });
      } catch (error) {
        console.error('Failed to load profile data:', error);
      }

      const response = await apiService.getStudentAppointments();

      // API response yapısını düzgün şekilde işle
      const appointmentsData = response.data?.appointments || response.data || [];

      // Randevuları oluşturulma tarihine göre sırala (en yeni en üstte)
      const sortedAppointments = [...appointmentsData].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setAppointments(sortedAppointments);

      // Refresh AppointmentHistory when appointments are loaded
      setHistoryRefreshTrigger(prev => prev + 1);

      // Calculate stats
      const stats = {
        total: sortedAppointments.length,
        pending: sortedAppointments.filter(apt => apt.status === 'pending').length,
        approved: sortedAppointments.filter(apt => apt.status === 'approved').length,
        rejected: sortedAppointments.filter(apt => apt.status === 'rejected').length,
        cancelled: sortedAppointments.filter(apt => apt.status === 'cancelled').length
      };
      setStats(stats);
    } catch (error) {
      console.error('Randevular yüklenirken hata:', error);
      // Hata durumunda boş array set et
      setAppointments([]);
      setStats({
        total: 0,
        pending: 0,
        approved: 0,
        rejected: 0,
        cancelled: 0
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <ClockIconSolid className="h-5 w-5 text-yellow-500" />;
      case 'approved':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'rejected':
        return <XCircleIcon className="h-5 w-5 text-red-500" />;
      case 'cancelled':
        return <ExclamationTriangleIcon className="h-5 w-5 text-gray-500" />;
      case 'no_response':
        return <ExclamationTriangleIcon className="h-5 w-5 text-orange-500" />;
      default:
        return <ClockIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending':
        return 'Beklemede';
      case 'approved':
        return 'Onaylandı';
      case 'rejected':
        return 'Reddedildi';
      case 'cancelled':
        return 'İptal Edildi';
      case 'no_response':
        return 'Öğretim Üyesi Cevaplamadı';
      default:
        return status;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800';
      case 'no_response':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    return timeString;
  };

  const handleCancelAppointment = async (appointment) => {
    if (window.confirm('Bu randevuyu iptal etmek istediğinizden emin misiniz?')) {
      try {
        const cancellationReason = prompt('İptal nedeni (opsiyonel):') || '';
        
        // Debug: user.email'in mevcut olduğundan emin ol
        if (!user || !user.email) {
          console.error('User or user.email not available:', { user });
          alert('Kullanıcı bilgileri yüklenemedi. Lütfen sayfayı yenileyin.');
          return;
        }
        
        console.log('Cancelling appointment:', {
          appointmentId: appointment._id,
          studentEmail: user.email,
          cancellationReason,
          user: user
        });
        
        const response = await apiService.cancelAppointment(appointment._id, user.email, cancellationReason);
        if (response.success) {
          // Show success message immediately
          setGlobalSuccess('Randevu başarıyla iptal edildi');
          setTimeout(() => setGlobalSuccess(''), 3000);
          
          // Refresh appointments in background
          loadAppointments().catch(err => console.error('Error loading appointments:', err));
          setHistoryRefreshTrigger(prev => prev + 1);
        } else {
          setGlobalError(response.message || 'Randevu iptal edilirken hata oluştu');
          setTimeout(() => setGlobalError(''), 4000);
        }
      } catch (error) {
        console.error('Cancel appointment error:', error);
        setGlobalError(error.message || 'Randevu iptal edilirken hata oluştu');
        setTimeout(() => setGlobalError(''), 4000);
      }
    }
  };

  const handleViewDetails = (appointment) => {
    setSelectedAppointment(appointment);
    setShowAppointmentDetails(true);
  };

  // Profile modal fields configuration
  // Build profile fields dynamically with select options
  const profileFields = [
    {
      name: 'name',
      label: 'Ad Soyad',
      type: 'text',
      required: true,
      placeholder: 'Ad Soyad'
    },
    {
      name: 'email',
      label: 'E-posta Adresi',
      type: 'email',
      required: true,
      placeholder: 'E-posta adresi'
    },
    {
      name: 'studentNumber',
      label: 'Öğrenci Numarası',
      type: 'text',
      required: true,
      placeholder: 'Öğrenci numarası',
      disabled: true,
      readOnly: true
    },
    {
      name: 'department',
      label: 'Bölüm',
      type: 'select',
      required: true,
      placeholder: 'Bölüm seçiniz',
      options: departments.map((dept) => ({
        value: dept.name,
        label: dept.name
      }))
    },
    {
      name: 'advisor',
      label: 'Danışman',
      type: 'select',
      required: true,
      placeholder: 'Danışman seçiniz',
      options: Object.entries(
        facultyList.reduce((acc, faculty) => {
          const dept = faculty.department || 'Diğer';
          if (!acc[dept]) acc[dept] = [];
          acc[dept].push(faculty);
          return acc;
        }, {})
      ).map(([department, members]) => ({
        optgroup: true,
        label: department,
        options: members.map((faculty) => ({
          value: faculty._id,
          label: `${faculty.title ? `${faculty.title} ` : ''}${faculty.name}`
        }))
      }))
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Modern Header */}
            <Header
        user={user}
        onProfile={openProfileModal}
        onPassword={openPasswordModal}
        onLogout={handleLogout}
        theme="student"
        notifications={notifications}
        unreadCount={unreadCount}
        onToggleNotifications={toggleNotifications}
        onMarkAllRead={markAllNotificationsRead}
        onNotificationClick={(notification) => {
          // Student dashboard'da bildirimlere tıklandığında faculty listesine git
          window.location.href = '/faculty-list';
          // Bildirimi okundu olarak işaretle
          setNotifications(prev => prev.map(n =>
            n.id === notification.id ? { ...n, read: true } : n
          ));
          setUnreadCount(prev => Math.max(0, prev - 1));
          // localStorage automatically updated via useEffect
        }}
        showNotifications={showNotifications}
      >

        <div className={headerStyles.navigationButtons}>
          <button
            onClick={() => window.location.href = '/faculty-list'}
            className={headerStyles.navLink}
          >
            <CalendarIcon className={headerStyles.navIcon} />
            Yeni Randevu
          </button>
        </div>
      </Header>

      <div className="dashboard-main max-w-7xl mx-auto py-8">
        {/* Stats Cards */}
        <div className="stats-container">
          <div>
            <StatsCard
              title="Toplam Randevu"
              value={stats.total}
              icon={<CalendarIcon className="h-6 w-6" />}
              color="blue"
            />
          </div>
          <div>
            <StatsCard
              title="Bekleyen"
              value={stats.pending}
              icon={<ClockIconSolid className="h-6 w-6" />}
              color="yellow"
            />
          </div>
          <div>
            <StatsCard
              title="Onaylanan"
              value={stats.approved}
              icon={<CheckCircleIcon className="h-6 w-6" />}
              color="green"
            />
          </div>
          <div>
            <StatsCard
              title="Reddedilen"
              value={stats.rejected}
              icon={<XCircleIcon className="h-6 w-6" />}
              color="red"
            />
          </div>
          <div>
            <StatsCard
              title="İptal Edilen"
              value={stats.cancelled}
              icon={<ExclamationTriangleIcon className="h-6 w-6" />}
              color="navy"
            />
          </div>
        </div>

        {/* Modern Tab Navigation */}
        <div className="bg-white shadow rounded-lg mb-8">
          <TabNavigation
            tabs={[
              {
                id: 'appointments',
                label: 'Randevularım',
                icon: <CalendarIcon className="w-5 h-5" />
              },
              {
                id: 'history',
                label: 'Randevu Geçmişi',
                icon: <ClockIcon className="w-5 h-5" />
              },
              {
                id: 'new-appointment',
                label: 'Yeni Randevu',
                icon: <PlusIcon className="w-5 h-5" />
              }
            ]}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />

          <div className="p-6">
            {globalError && (
              <div className="mb-4 rounded-md border border-red-200 bg-red-50 p-3 text-red-700">
                {globalError}
              </div>
            )}
            {globalSuccess && (
              <div className="mb-4 rounded-md border border-green-200 bg-green-50 p-3 text-green-700">
                {globalSuccess}
              </div>
            )}
            {activeTab === 'appointments' ? (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Randevularım</h3>
                </div>
                <AppointmentList
                  appointments={appointments}
                  getStatusIcon={getStatusIcon}
                  getStatusText={getStatusText}
                  getStatusColor={getStatusColor}
                  formatDate={formatDate}
                  formatTime={formatTime}
                  onCancel={handleCancelAppointment}
                  onDetails={handleViewDetails}
                  showCancel={true}
                  showActions={true}
                  currentUserId={user?._id}
                  showHistoryButton={false}
                />
              </div>
            ) : activeTab === 'history' ? (
              <div>
                <AppointmentHistory userId={user?._id} embedded={true} refreshTrigger={historyRefreshTrigger} />
              </div>
            ) : (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Yeni Randevu Al</h3>
                </div>
                <div className="text-center py-12">
                  <AcademicCapIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">Öğretim Üyeleri</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Randevu almak istediğiniz öğretim üyesini seçin
                  </p>
                  <div className="mt-6">
                    <button
                      onClick={() => window.location.href = '/faculty-list'}
                      className="btn-primary"
                    >
                      <AcademicCapIcon className="h-5 w-5 mr-2" />
                      Öğretim Üyelerini Görüntüle
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modern Modals */}
      <ProfileModal
        isOpen={showProfileModal}
        onClose={() => {
          setShowProfileModal(false);
          setProfileError('');
          setProfileSuccess('');
        }}
        profileData={profileData}
        onInputChange={handleProfileInputChange}
        onSubmit={handleUpdateProfile}
        loading={profileLoading}
        error={profileError}
        success={profileSuccess}
        fields={profileFields}
      />

      <PasswordModal
        isOpen={showPasswordModal}
        onClose={() => {
          setShowPasswordModal(false);
          setPasswordError('');
          setPasswordSuccess('');
        }}
        passwordData={passwordData}
        onInputChange={handlePasswordInputChange}
        onSubmit={handleChangePassword}
        loading={passwordLoading}
        error={passwordError}
        success={passwordSuccess}
      />

      <EmailVerificationModal
        isOpen={showEmailVerificationModal}
        onClose={() => {
          setShowEmailVerificationModal(false);
          setVerificationCodeSent(false);
          setVerificationCode('');
          setNewEmail('');
          setEmailVerificationError('');
          setEmailVerificationSuccess('');
          // Reset email in profileData to original
          setProfileData(prev => ({
            ...prev,
            email: user?.email || ''
          }));
        }}
        newEmail={newEmail}
        verificationCode={verificationCode}
        onVerificationCodeChange={setVerificationCode}
        onRequestCode={handleRequestEmailVerificationCode}
        onVerify={handleVerifyEmailChange}
        loading={emailVerificationLoading}
        error={emailVerificationError}
        success={emailVerificationSuccess}
        codeSent={verificationCodeSent}
      />

      {/* Appointment Details Modal */}
      <AppointmentDetails
        isOpen={showAppointmentDetails}
        onClose={() => {
          setShowAppointmentDetails(false);
          setSelectedAppointment(null);
        }}
        appointment={selectedAppointment}
        getStatusText={getStatusText}
        formatDate={formatDate}
        formatTime={formatTime}
        currentUserId={user?._id}
      />
    </div>
  );
};

export default StudentDashboard; 