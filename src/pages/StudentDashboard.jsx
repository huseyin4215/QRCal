import { useState, useEffect } from 'react';
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
import StatsCard from '../components/StatsCard/StatsCard';
import AppointmentList from '../components/AppointmentList/AppointmentList';
import AppointmentDetails from '../components/AppointmentDetails/AppointmentDetails';
import ProfileModal from '../components/ProfileModal/ProfileModal';
import PasswordModal from '../components/PasswordModal/PasswordModal';
import TabNavigation from '../components/TabNavigation';

const StudentDashboard = () => {
  const { user, login } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('appointments');
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
    phone: '',
    studentNumber: '',
    department: ''
  });
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

  useEffect(() => {
    if (user) {
      console.log('StudentDashboard - User loaded:', user);
      loadAppointments();
    } else {
      console.log('StudentDashboard - User not loaded yet');
    }
  }, [user]);

  const handleLogout = () => {
    if (window.confirm('Çıkış yapmak istediğinizden emin misiniz?')) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
  };

  const openProfileModal = () => {
    setProfileData({
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      studentNumber: user?.studentNumber || '',
      department: user?.department || ''
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
      const response = await apiService.updateStudentProfile(profileData);
      
      if (response.success) {
        setProfileSuccess('Profil başarıyla güncellendi!');
        
        // Update local user data
        const updatedUser = { ...user, ...profileData };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        
        // Close modal after 2 seconds
        setTimeout(() => {
          setShowProfileModal(false);
          setProfileSuccess('');
          window.location.reload(); // Refresh to update header
        }, 2000);
      }
    } catch (error) {
      console.error('Profile update error:', error);
      setProfileError(error.message || 'Profil güncellenirken hata oluştu');
    } finally {
      setProfileLoading(false);
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
      const response = await apiService.getStudentAppointments();
      
      // API response yapısını düzgün şekilde işle
      const appointmentsData = response.data?.appointments || response.data || [];
      setAppointments(appointmentsData);
      
      // Calculate stats
      const stats = {
        total: appointmentsData.length,
        pending: appointmentsData.filter(apt => apt.status === 'pending').length,
        approved: appointmentsData.filter(apt => apt.status === 'approved').length,
        rejected: appointmentsData.filter(apt => apt.status === 'rejected').length,
        cancelled: appointmentsData.filter(apt => apt.status === 'cancelled').length
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
          // Randevuları yeniden yükle
          await loadAppointments();
          alert('Randevu başarıyla iptal edildi');
        } else {
          alert('Randevu iptal edilirken hata oluştu: ' + response.message);
        }
      } catch (error) {
        console.error('Cancel appointment error:', error);
        alert('Randevu iptal edilirken hata oluştu: ' + error.message);
      }
    }
  };

  const handleViewDetails = (appointment) => {
    setSelectedAppointment(appointment);
    setShowAppointmentDetails(true);
  };

  // Profile modal fields configuration
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
      placeholder: 'Öğrenci numarası'
    },
    {
      name: 'department',
      label: 'Bölüm',
      type: 'text',
      required: true,
      placeholder: 'Bölüm'
    },
    {
      name: 'phone',
      label: 'Telefon',
      type: 'tel',
      required: false,
      placeholder: 'Telefon numarası'
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
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Öğrenci Paneli</h1>
          <p className="mt-1 text-sm text-gray-500">
            Hoş geldiniz, {user?.name}
          </p>
        </div>
        <button
          onClick={() => window.location.href = '/faculty-list'}
          className="btn-primary"
        >
          <CalendarIcon className="w-4 h-4 mr-2" />
          Yeni Randevu
        </button>
      </Header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1">
        {/* Stats Cards */}
        <div className="flex flex-wrap gap-4 mb-8">
          <div className="flex-1 min-w-[200px]">
            <StatsCard
              title="Toplam Randevu"
              value={stats.total}
              icon={<CalendarIcon className="h-6 w-6 text-gray-400" />}
              color="border-gray-400"
            />
          </div>
          <div className="flex-1 min-w-[200px]">
            <StatsCard
              title="Bekleyen"
              value={stats.pending}
              icon={<ClockIconSolid className="h-6 w-6 text-yellow-500" />}
              color="border-yellow-500"
            />
          </div>
          <div className="flex-1 min-w-[200px]">
            <StatsCard
              title="Onaylanan"
              value={stats.approved}
              icon={<CheckCircleIcon className="h-6 w-6 text-green-500" />}
              color="border-green-500"
            />
          </div>
          <div className="flex-1 min-w-[200px]">
            <StatsCard
              title="Reddedilen"
              value={stats.rejected}
              icon={<XCircleIcon className="h-6 w-6 text-red-500" />}
              color="border-red-500"
            />
          </div>
          <div className="flex-1 min-w-[200px]">
            <StatsCard
              title="İptal Edilen"
              value={stats.cancelled}
              icon={<ExclamationTriangleIcon className="h-6 w-6 text-gray-500" />}
              color="border-gray-500"
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
                id: 'new-appointment',
                label: 'Yeni Randevu',
                icon: <PlusIcon className="w-5 h-5" />
              }
            ]}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />

          <div className="p-6">
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
                />
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
      />
    </div>
  );
};

export default StudentDashboard; 