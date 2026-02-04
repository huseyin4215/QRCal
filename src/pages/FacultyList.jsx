import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import apiService from '../services/apiService';
import {
  AcademicCapIcon,
  BuildingOfficeIcon,
  EnvelopeIcon,
  CalendarIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  HomeIcon
} from '@heroicons/react/24/outline';
import Header from '../components/Header/Header';
import ProfileModal from '../components/ProfileModal/ProfileModal';
import PasswordModal from '../components/PasswordModal/PasswordModal';
import headerStyles from '../components/Header/Header.module.css';
import styles from './FacultyList.module.css';

const FacultyList = () => {
  const { user, logout } = useAuth();
  const [faculty, setFaculty] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [departments, setDepartments] = useState([]);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  // Profile Modal States
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    studentNumber: '',
    department: ''
  });
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');

  // Password Modal States
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  // Profile fields configuration
  const profileFields = [
    { name: 'name', label: 'Ad Soyad', type: 'text', required: true, placeholder: 'Ad Soyad' },
    { name: 'email', label: 'E-posta', type: 'email', required: true, placeholder: 'E-posta adresi' },
    { name: 'studentNumber', label: 'Öğrenci No', type: 'text', required: false, placeholder: 'Öğrenci numarası' },
    { name: 'department', label: 'Bölüm', type: 'text', required: false, placeholder: 'Bölüm' }
  ];

  useEffect(() => {
    loadFaculty();
  }, []);

  useEffect(() => {
    // Initialize profile data from user
    if (user) {
      setProfileData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        studentNumber: user.studentNumber || '',
        department: user.department || ''
      });
    }
  }, [user]);

  const loadFaculty = async () => {
    try {
      setLoading(true);
      const response = await apiService.getFacultyList();

      if (response.success) {
        // Show both faculty and admin users (admins can also be faculty members)
        setFaculty(response.data || []);

        // Extract unique departments
        const uniqueDepartments = [...new Set((response.data || []).map(f => f.department))];
        setDepartments(uniqueDepartments);
      } else {
        console.error('Faculty list response error:', response.message);
        setFaculty([]);
      }
    } catch (error) {
      console.error('Öğretim elemanları yüklenirken hata:', error);
      setFaculty([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredFaculty = faculty.filter(f => {
    const matchesSearch = f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.department.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = !selectedDepartment || f.department === selectedDepartment;
    return matchesSearch && matchesDepartment;
  });

  const handleAppointmentClick = (facultySlug) => {
    window.location.href = `/appointment/${facultySlug}`;
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const openProfileModal = () => {
    setProfileError('');
    setProfileSuccess('');
    setShowProfileModal(true);
  };

  const openPasswordModal = () => {
    setPasswordError('');
    setPasswordSuccess('');
    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    setShowPasswordModal(true);
  };

  const handleProfileInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, [name]: value }));
  };

  const handlePasswordInputChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
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

        setTimeout(() => {
          setShowProfileModal(false);
          setProfileSuccess('');
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
      >
        <div className={headerStyles.navigationButtons}>
          <button
            onClick={() => window.location.href = user?.role === 'admin' ? '/admin-dashboard' : user?.role === 'faculty' ? '/faculty-dashboard' : '/student-dashboard'}
            className={headerStyles.navLink}
          >
            <HomeIcon className={headerStyles.navIcon} />
            Anasayfa
          </button>
        </div>
      </Header>

      <div className="dashboard-main w-full px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Title */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Öğretim Elemanları</h1>
          <p className="mt-1 text-sm text-gray-500">
            Randevu almak istediğiniz öğretim elemanını seçin
          </p>
        </div>

        {/* Search and Filter */}
        <div className="bg-white shadow rounded-lg mb-8">
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Search */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Öğretim elemanı ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>

              {/* Department Filter */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FunnelIcon className="h-5 w-5 text-gray-400" />
                </div>
                <select
                  value={selectedDepartment}
                  onChange={(e) => setSelectedDepartment(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="">Tüm Bölümler</option>
                  {departments.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>

              {/* Results Count */}
              <div className="flex items-center justify-end">
                <span className="text-sm text-gray-500">
                  {filteredFaculty.length} öğretim elemanı bulundu
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Faculty Grid */}
        {filteredFaculty.length === 0 ? (
          <div className="text-center py-12">
            <AcademicCapIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Öğretim elemanı bulunamadı</h3>
            <p className="mt-1 text-sm text-gray-500">
              Arama kriterlerinizi değiştirmeyi deneyin.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6">
            {filteredFaculty.map((facultyMember) => (
              <div key={facultyMember._id} className={`${styles.card} overflow-hidden`}>
                <div className="p-6 flex flex-col h-full">
                  {/* Faculty Info */}
                  <div className="flex items-center mb-4">
                    <div className="flex-shrink-0">
                      {facultyMember.picture ? (
                        <img
                          className="h-12 w-12 rounded-full"
                          src={facultyMember.picture}
                          alt={facultyMember.name}
                        />
                      ) : (
                        <div className={styles.avatar}>
                          <AcademicCapIcon className="h-6 w-6 text-blue-600" />
                        </div>
                      )}
                    </div>
                    <div className="ml-4">
                      <h3 className={styles.title}>
                        {facultyMember.title} {facultyMember.name}
                      </h3>
                      <p className={styles.subtle}>{facultyMember.department}</p>
                    </div>
                  </div>

                  {/* Contact Info */}
                  <div className="space-y-2 mb-4">
                    {facultyMember.office && (
                      <div className="flex items-center text-sm text-gray-500">
                        <BuildingOfficeIcon className="h-4 w-4 mr-2" />
                        <span className="font-medium mr-1">Ofis:</span>
                        {facultyMember.office}
                      </div>
                    )}
                    {/* Phone number hidden for students */}
                    <div className="flex items-center text-sm text-gray-500">
                      <EnvelopeIcon className="h-4 w-4 mr-2" />
                      {facultyMember.email}
                    </div>
                  </div>

                  {/* Availability Status */}
                  <div className="mb-4">
                    <div className="flex items-center">
                      <div className={`${styles.statusDot} ${facultyMember.isActive ? 'bg-green-400' : 'bg-gray-400'}`}></div>
                      <span className={styles.subtle}>
                        {facultyMember.isActive ? 'Randevu almaya açık' : 'Şu anda randevu almıyor'}
                      </span>
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="mt-auto">
                    <button
                      onClick={() => handleAppointmentClick(facultyMember.slug)}
                      disabled={!facultyMember.isActive}
                      className={`${styles.primaryButton} ${!facultyMember.isActive ? 'opacity-60 cursor-not-allowed' : ''}`}
                    >
                      <CalendarIcon className={styles.icon} />
                      {facultyMember.isActive ? 'Randevu Al' : 'Randevu Almıyor'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Profile Modal */}
      <ProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        profileData={profileData}
        onInputChange={handleProfileInputChange}
        onSubmit={handleUpdateProfile}
        loading={profileLoading}
        error={profileError}
        success={profileSuccess}
        fields={profileFields}
      />

      {/* Password Modal */}
      <PasswordModal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        passwordData={passwordData}
        onInputChange={handlePasswordInputChange}
        onSubmit={handleChangePassword}
        loading={passwordLoading}
        error={passwordError}
        success={passwordSuccess}
      />
    </div>
  );
};

export default FacultyList; 