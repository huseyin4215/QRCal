import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  UsersIcon, 
  CalendarIcon, 
  ChartBarIcon, 
  PlusIcon,
  AcademicCapIcon,
  QrCodeIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import apiService from '../services/apiService';

// Import modern components
import Header from '../components/Header/Header';
import headerStyles from '../components/Header/Header.module.css';
import StatsCard from '../components/StatsCard/StatsCard';
import FacultyList from '../components/FacultyList/FacultyList';
import FacultyAddModal from '../components/FacultyAddModal/FacultyAddModal';
import ProfileModal from '../components/ProfileModal/ProfileModal';
import PasswordModal from '../components/PasswordModal/PasswordModal';
import AppointmentList from '../components/AppointmentList/AppointmentList';
import AppointmentDetails from '../components/AppointmentDetails/AppointmentDetails';
import AvailabilityModal from '../components/AvailabilityModal/AvailabilityModal';
import GoogleCalendarUnavailableSlots from '../components/GoogleCalendarUnavailableSlots/GoogleCalendarUnavailableSlots';
import TabNavigation from '../components/TabNavigation';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [systemAppointments, setSystemAppointments] = useState([]); // Sistem randevuları
  const [adminAppointments, setAdminAppointments] = useState([]); // Admin randevuları
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('users');
  const [appointmentTab, setAppointmentTab] = useState('system'); // 'system' veya 'admin'
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [newFaculty, setNewFaculty] = useState({
    name: '',
    email: '',
    title: '',
    department: '',
    phone: '',
    office: ''
  });
  const [facultyLoading, setFacultyLoading] = useState(false);
  const [facultyError, setFacultyError] = useState('');
  const [facultySuccess, setFacultySuccess] = useState('');
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showAvailabilityModal, setShowAvailabilityModal] = useState(false);
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    office: ''
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [availability, setAvailability] = useState([]);
  const [slotDuration, setSlotDuration] = useState(15);
  const [profileLoading, setProfileLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [availabilityLoading, setAvailabilityLoading] = useState(false);
  const [profileError, setProfileError] = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [availabilityError, setAvailabilityError] = useState('');
  const [availabilitySuccess, setAvailabilitySuccess] = useState('');
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showAppointmentDetails, setShowAppointmentDetails] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' veya 'table'
  
  // Google Calendar integration states
  const [googleConnected, setGoogleConnected] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showGoogleSetup, setShowGoogleSetup] = useState(false);

  useEffect(() => {
    if (user) {
      loadDashboardData();
      loadFacultyData();
    }
  }, [user]);

  // Auto-load Google Calendar events when connected
  useEffect(() => {
    if (googleConnected && user) {
      loadGoogleCalendarEvents();
    }
  }, [googleConnected, user]);

  // Auto-load Google Calendar events when availability tab is opened
  useEffect(() => {
    if (activeTab === 'availability' && googleConnected && user) {
      loadGoogleCalendarEvents();
    }
  }, [activeTab, googleConnected, user]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      console.log('AdminDashboard: Loading dashboard data...');
      
      // Paralel olarak verileri yükle
      const [usersResponse, appointmentsResponse, statsResponse] = await Promise.all([
        apiService.getAllUsers(),
        apiService.getAllAppointments(),
        apiService.getSystemStats()
      ]);
      
      console.log('AdminDashboard: Users response:', usersResponse);
      console.log('AdminDashboard: Appointments response:', appointmentsResponse);
      console.log('AdminDashboard: Stats response:', statsResponse);
      
      // API response yapısını düzgün şekilde işle
      const allUsers = usersResponse.data?.users || [];
      const allAppointments = appointmentsResponse.data?.appointments || appointmentsResponse.data || [];
      const allStats = statsResponse.data || {};
      
      setUsers(allUsers);
      setAppointments(allAppointments);
      setStats(allStats);
      
      // Admin'e gelen randevuları yükle
      const facultyAppointmentsResponse = await apiService.getFacultyAppointments();
      const adminAppts = facultyAppointmentsResponse.data?.appointments || facultyAppointmentsResponse.data || [];
      
      // Sistem randevuları = tüm randevular - admin randevuları
      const adminAppointmentIds = adminAppts.map(apt => apt._id);
      const systemAppts = allAppointments.filter(appointment => !adminAppointmentIds.includes(appointment._id));
      
      setSystemAppointments(systemAppts);
      setAdminAppointments(adminAppts);
      
      // Check Google Calendar connection status
      try {
        const googleStatusResponse = await apiService.getGoogleCalendarStatus();
        setGoogleConnected(googleStatusResponse.success && googleStatusResponse.data?.isConnected);
      } catch (error) {
        console.error('Failed to check Google Calendar status:', error);
        setGoogleConnected(false);
      }
      
      console.log('Dashboard data loaded:', { allUsers, allAppointments, allStats, systemAppts, adminAppts });
    } catch (error) {
      console.error('Dashboard data load error:', error);
      setUsers([]);
      setAppointments([]);
      setSystemAppointments([]);
      setAdminAppointments([]);
      setStats({});
    } finally {
      setLoading(false);
    }
  };

  const loadFacultyData = async () => {
    try {
      // Admin kendi öğretim üyesi verilerini yükle (sadece availability)
      const availabilityResponse = await apiService.getAdminAvailability();

      if (availabilityResponse.success) {
        setAvailability(availabilityResponse.data.availability || []);
        setSlotDuration(availabilityResponse.data.slotDuration || 30);
      }
    } catch (error) {
      console.error('Faculty data error:', error);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Bu kullanıcıyı silmek istediğinizden emin misiniz?')) {
      try {
        await apiService.deleteUser(userId);
        // Kullanıcı listesini yenile
        const updatedUsers = users.filter(user => user._id !== userId);
        setUsers(updatedUsers);
      } catch (error) {
        console.error('User delete error:', error);
        alert('Kullanıcı silinirken hata oluştu');
      }
    }
  };

  const handleCreateFaculty = async (e) => {
    e.preventDefault();
    setFacultyLoading(true);
    setFacultyError('');
    setFacultySuccess('');

    try {
      const response = await apiService.createFaculty(newFaculty);
      
      console.log('Faculty creation response:', response);
      
      if (response.success) {
        console.log('Temp password from response:', response.data.tempPassword);
        setFacultySuccess(`Öğretim üyesi başarıyla oluşturuldu!\n\nGeçici şifre: ${response.data.tempPassword}\n\nÖğretim üyesi ilk girişte bu şifreyi kullanarak giriş yapmalı ve şifresini değiştirmelidir.`);
        
        // Form'u temizle
        setNewFaculty({
          name: '',
          email: '',
          title: '',
          department: '',
          phone: '',
          office: ''
        });
        
        // Kullanıcı listesini yenile
        loadDashboardData();
        
        // Modal'ı 5 saniye sonra kapat
        setTimeout(() => {
          setShowAddUserModal(false);
          setFacultySuccess('');
        }, 5000);
      }
    } catch (error) {
      console.error('Faculty creation error:', error);
      setFacultyError(error.message || 'Öğretim üyesi oluşturulurken hata oluştu');
    } finally {
      setFacultyLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewFaculty(prev => ({
      ...prev,
      [name]: value
    }));
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
      office: user?.office || ''
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

  // Initialize availability for each day
  const initializeAvailability = () => {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    return days.map(day => ({
      day,
      isActive: false,
      timeSlots: []
    }));
  };

  const updateDayAvailability = (dayIndex, field, value) => {
    setAvailability(prev => {
      const newAvailability = [...prev];
      newAvailability[dayIndex] = { ...newAvailability[dayIndex], [field]: value };
      return newAvailability;
    });
  };

  const openAvailabilityModal = () => {
    if (availability.length === 0) {
      setAvailability(initializeAvailability());
    }
    setShowAvailabilityModal(true);
    setAvailabilityError('');
    setAvailabilitySuccess('');
  };

  const handleGoogleConnect = async () => {
    try {
      // Önce mevcut bağlantı durumunu kontrol et
      if (googleConnected) {
        const confirmReconnect = window.confirm(
          'Google Calendar zaten bağlı. Tekrar bağlanmak istediğinizden emin misiniz? Bu işlem mevcut bağlantıyı yenileyecektir.'
        );
        if (!confirmReconnect) {
          return;
        }
      }

      console.log('Initiating Google OAuth flow...');
      
      // Test configuration first
      try {
        const configResponse = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/google/test-config`);
        const configData = await configResponse.json();
        console.log('Google OAuth config test:', configData);
        
        if (!configData.success || configData.data.clientSecret === 'missing') {
          alert('Google OAuth yapılandırması eksik! Lütfen backend log\'larını kontrol edin.');
          return;
        }
      } catch (configError) {
        console.error('Config test failed:', configError);
      }
      
      // Use OAuth 2.0 flow instead of Google Sign-In for Calendar access
      const response = await apiService.getGoogleAuthUrl();
      
      if (response.success) {
        console.log('Google OAuth URL received:', response.data.authUrl);
        // Add userId to the OAuth URL for account linking
        const authUrl = new URL(response.data.authUrl);
        authUrl.searchParams.set('state', user.id); // Use state parameter to pass userId
        console.log('Redirecting to Google OAuth with userId:', user.id);
        // Redirect to Google OAuth page
        window.location.href = authUrl.toString();
      } else {
        alert('Google OAuth URL alınamadı: ' + response.message);
      }
    } catch (error) {
      console.error('Google OAuth error:', error);
      alert('Google Calendar bağlantısı başlatılamadı: ' + error.message);
    }
  };

  const handleGoogleDisconnect = async () => {
    try {
      setGoogleLoading(true);
      const response = await apiService.disconnectGoogleCalendar();
      
      if (response.success) {
        setGoogleConnected(false);
        alert('Google Calendar bağlantısı kesildi');
      }
    } catch (error) {
      console.error('Google disconnect error:', error);
      alert('Google Calendar bağlantısı kesilirken hata oluştu: ' + error.message);
    } finally {
      setGoogleLoading(false);
    }
  };

  const loadGoogleCalendarEvents = async () => {
    if (!googleConnected) {
      console.log('Google Calendar not connected, skipping events load');
      return;
    }
    
    try {
      console.log('Loading Google Calendar events...');
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 7); // Next 7 days
      
      const result = await apiService.getGoogleCalendarEvents(
        startDate.toISOString(),
        endDate.toISOString(),
        50
      );
      
      if (result.success) {
        // Process calendar events and update availability
        const events = result.data || [];
        console.log('Google Calendar events loaded:', events.length, 'events');
        
        // Process events and update availability
        if (events.length > 0) {
          await processGoogleCalendarEvents(events);
        }
        
        return events;
      } else {
        console.error('Failed to load Google Calendar events:', result.message);
        // If the error indicates connection issues, update the status
        if (result.message && (
          result.message.includes('not connected') || 
          result.message.includes('expired') ||
          result.message.includes('access expired')
        )) {
          console.log('Google Calendar connection issue detected, updating status');
          setGoogleConnected(false);
        }
      }
    } catch (error) {
      console.error('Error loading Google Calendar events:', error);
      // If Google Calendar is not connected, set connected to false
      if (error.message && (
        error.message.includes('not connected') || 
        error.message.includes('expired') ||
        error.message.includes('access expired')
      )) {
        console.log('Google Calendar not connected, setting connected to false');
        setGoogleConnected(false);
      }
    }
  };

  const processGoogleCalendarEvents = async (events) => {
    try {
      // Group events by day
      const eventsByDay = {};
      
      events.forEach(event => {
        const startDate = new Date(event.start.dateTime || event.start.date);
        const dayName = startDate.toLocaleDateString('en-US', { weekday: 'long' });
        
        if (!eventsByDay[dayName]) {
          eventsByDay[dayName] = [];
        }
        eventsByDay[dayName].push(event);
      });

      // Update availability based on events
      const updatedAvailability = availability.map(day => {
        const dayEvents = eventsByDay[day.day] || [];
        
        if (dayEvents.length > 0) {
          // Mark day as active and create time slots based on events
          const timeSlots = dayEvents.map(event => {
            const start = new Date(event.start.dateTime || event.start.date);
            const end = new Date(event.end.dateTime || event.end.date);
            
            return {
              start: start.toLocaleTimeString('tr-TR', { 
                hour: '2-digit', 
                minute: '2-digit' 
              }),
              end: end.toLocaleTimeString('tr-TR', { 
                hour: '2-digit', 
                minute: '2-digit' 
              }),
              isAvailable: false, // Events make time slots unavailable
              eventId: event.id,
              eventTitle: event.summary
            };
          });
          
          return {
            ...day,
            isActive: true,
            timeSlots
          };
        }
        
        return day;
      });
      
      setAvailability(updatedAvailability);
      
      // Save updated availability to backend
      await apiService.updateAdminAvailability({
        availability: updatedAvailability
      });
      
      console.log('Google Calendar events processed and availability updated');
      alert('Google Calendar\'dan müsaitlik durumu başarıyla yüklendi!');
      
    } catch (error) {
      console.error('Error processing Google Calendar events:', error);
      alert('Google Calendar olayları işlenirken hata oluştu: ' + error.message);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setProfileLoading(true);
    setProfileError('');
    setProfileSuccess('');

    try {
      const response = await apiService.updateFacultyProfile(profileData);
      
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

  const handleUpdateAvailability = async () => {
    setAvailabilityLoading(true);
    setAvailabilityError('');
    setAvailabilitySuccess('');

    try {
      const response = await apiService.updateAdminAvailability({
        availability,
        slotDuration
      });

      if (response.success) {
        setAvailabilitySuccess('Müsaitlik saatleri başarıyla güncellendi!');
        
        setTimeout(() => {
          setShowAvailabilityModal(false);
          setAvailabilitySuccess('');
        }, 2000);
      }
    } catch (error) {
      console.error('Availability update error:', error);
      setAvailabilityError(error.message || 'Müsaitlik saatleri güncellenirken hata oluştu');
    } finally {
      setAvailabilityLoading(false);
    }
  };

  const handleAppointmentAction = async (appointmentId, action, reason = null) => {
    try {
      let response;
      
      if (action === 'approved') {
        response = await apiService.approveAppointment(appointmentId);
      } else if (action === 'rejected') {
        const rejectReason = reason || prompt('Red nedeni:');
        if (rejectReason) {
          response = await apiService.rejectAppointment(appointmentId, rejectReason);
        } else {
          return;
        }
      } else if (action === 'cancelled') {
        response = await apiService.cancelAppointment(appointmentId);
      } else {
        response = await apiService.updateAppointment(appointmentId, { status: action });
      }
      
      if (response.success) {
        // Reload appointments
        const [allAppointmentsResponse, facultyAppointmentsResponse] = await Promise.all([
          apiService.getAllAppointments(),
          apiService.getFacultyAppointments()
        ]);
        
        const allAppointments = allAppointmentsResponse.data?.appointments || allAppointmentsResponse.data || [];
        const adminAppts = facultyAppointmentsResponse.data?.appointments || facultyAppointmentsResponse.data || [];
        
        // Sistem randevuları = tüm randevular - admin randevuları
        const adminAppointmentIds = adminAppts.map(apt => apt._id);
        const systemAppts = allAppointments.filter(appointment => !adminAppointmentIds.includes(appointment._id));
        
        setAppointments(allAppointments);
        setSystemAppointments(systemAppts);
        setAdminAppointments(adminAppts);
      }
    } catch (error) {
      console.error('Appointment action error:', error);
      alert('İşlem sırasında hata oluştu: ' + error.message);
    }
  };

  const handleCancelAppointment = async (appointment) => {
    if (window.confirm('Bu randevuyu iptal etmek istediğinizden emin misiniz?')) {
      try {
        const response = await apiService.cancelAppointment(appointment._id);
        if (response.success) {
          // Reload appointments
          const [allAppointmentsResponse, facultyAppointmentsResponse] = await Promise.all([
            apiService.getAllAppointments(),
            apiService.getFacultyAppointments()
          ]);
          
          const allAppointments = allAppointmentsResponse.data?.appointments || allAppointmentsResponse.data || [];
          const adminAppts = facultyAppointmentsResponse.data?.appointments || facultyAppointmentsResponse.data || [];
          
          // Sistem randevuları = tüm randevular - admin randevuları
          const adminAppointmentIds = adminAppts.map(apt => apt._id);
          const systemAppts = allAppointments.filter(appointment => !adminAppointmentIds.includes(appointment._id));
          
          setAppointments(allAppointments);
          setSystemAppointments(systemAppts);
          setAdminAppointments(adminAppts);
        }
      } catch (error) {
        console.error('Cancel appointment error:', error);
        alert('Randevu iptal edilirken hata oluştu');
      }
    }
  };

  const handleApproveAppointment = (appointmentId) => {
    if (window.confirm('Bu randevuyu onaylamak istediğinizden emin misiniz?')) {
      handleAppointmentAction(appointmentId, 'approved');
    }
  };

  const handleRejectAppointment = (appointmentId, reason) => {
    if (window.confirm('Bu randevuyu reddetmek istediğinizden emin misiniz?')) {
      if (reason) {
        handleAppointmentAction(appointmentId, 'rejected', reason);
      } else {
        const rejectReason = prompt('Red nedeni:');
        if (rejectReason) {
          handleAppointmentAction(appointmentId, 'rejected', rejectReason);
        }
      }
    }
  };

  const handleAppointmentDetails = (appointment) => {
    setSelectedAppointment(appointment);
    setShowAppointmentDetails(true);
  };

  const getRoleBadge = (role) => {
    const roleConfig = {
      admin: { text: 'Yönetici', color: 'bg-red-100 text-red-800' },
      faculty: { text: 'Öğretim Üyesi', color: 'bg-blue-100 text-blue-800' },
      student: { text: 'Öğrenci', color: 'bg-green-100 text-green-800' }
    };
    
    const config = roleConfig[role] || { text: role, color: 'bg-gray-100 text-gray-800' };
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {config.text}
      </span>
    );
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      active: { text: 'Aktif', color: 'bg-green-100 text-green-800' },
      inactive: { text: 'Pasif', color: 'bg-gray-100 text-gray-800' }
    };
    
    const config = statusConfig[status] || { text: status, color: 'bg-gray-100 text-gray-800' };
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {config.text}
      </span>
    );
  };

  const getStatusIcon = (status) => {
    const iconConfig = {
      pending: <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />,
      approved: <CheckCircleIcon className="h-5 w-5 text-green-500" />,
      rejected: <XCircleIcon className="h-5 w-5 text-red-500" />,
      cancelled: <XCircleIcon className="h-5 w-5 text-gray-500" />
    };
    return iconConfig[status] || <ExclamationTriangleIcon className="h-5 w-5 text-gray-500" />;
  };

  const getStatusText = (status) => {
    const textConfig = {
      pending: 'Bekliyor',
      approved: 'Onaylandı',
      rejected: 'Reddedildi',
      cancelled: 'İptal Edildi'
    };
    return textConfig[status] || status;
  };

  const getStatusColor = (status) => {
    const colorConfig = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      cancelled: 'bg-gray-100 text-gray-800'
    };
    return colorConfig[status] || 'bg-gray-100 text-gray-800';
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (time) => {
    return time;
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
    setNewFaculty({
      name: user.name || '',
      email: user.email || '',
      title: user.title || '',
      department: user.department || '',
      phone: user.phone || '',
      office: user.office || ''
    });
    setShowAddUserModal(true);
  };

  // Map English day names to Turkish for display
  const getDayDisplayName = (englishDay) => {
    const dayMap = {
      'Monday': 'Pazartesi',
      'Tuesday': 'Salı',
      'Wednesday': 'Çarşamba',
      'Thursday': 'Perşembe',
      'Friday': 'Cuma',
      'Saturday': 'Cumartesi',
      'Sunday': 'Pazar'
    };
    return dayMap[englishDay] || englishDay;
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
      name: 'phone',
      label: 'Telefon',
      type: 'tel',
      required: false,
      placeholder: 'Telefon numarası'
    },
    {
      name: 'office',
      label: 'Ofis',
      type: 'text',
      required: false,
      placeholder: 'Ofis numarası'
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
          <h1 className={headerStyles.headerTitle}>Yönetici Paneli</h1>
          <p className={headerStyles.headerSubtitle}>
            Hoş geldiniz, {user?.name}
          </p>
        </div>
        <div className={headerStyles.headerRight}>
          <button
            onClick={openAvailabilityModal}
            className={`${headerStyles.button} ${headerStyles.secondaryButton}`}
          >
            <ClockIcon className={headerStyles.buttonIcon} />
            Müsaitlik Ayarları
          </button>
          <button
            onClick={googleConnected ? handleGoogleDisconnect : handleGoogleConnect}
            disabled={googleLoading}
            className={`${headerStyles.button} ${headerStyles.secondaryButton} ${
              googleConnected ? 'bg-green-100 text-green-700 hover:bg-green-200' : ''
            }`}
          >
            <CalendarIcon className={headerStyles.buttonIcon} />
            {googleConnected ? 'Google Calendar Bağlı' : 'Google Calendar'}
          </button>
          <button
            onClick={() => window.location.href = '/qr-code'}
            className={`${headerStyles.button} ${headerStyles.secondaryButton}`}
          >
            <QrCodeIcon className={headerStyles.buttonIcon} />
            QR Kod Oluştur
          </button>
          <button
            onClick={() => setShowAddUserModal(true)}
            className={`${headerStyles.button} ${headerStyles.primaryButton}`}
          >
            <PlusIcon className={headerStyles.buttonIcon} />
            Öğretim Üyesi Ekle
          </button>
        </div>
      </Header>

      {/* Google Calendar Integration Toggle */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <CalendarIcon className={`h-6 w-6 ${googleConnected ? 'text-green-500' : 'text-gray-400'}`} />
            <div>
              <h3 className="text-lg font-medium text-gray-900">
                Google Calendar Bağlantısı
              </h3>
              <p className="text-sm text-gray-600">
                {googleConnected 
                  ? 'Haftalık müsaitlik durumunuzu yönetebilir ve QR kod oluşturabilirsiniz.'
                  : 'Haftalık müsaitlik durumunuzu yönetmek ve QR kod oluşturmak için Google hesabınızı bağlayın.'
                }
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${googleConnected ? 'bg-green-500' : 'bg-gray-300'}`}></div>
              <span className={`text-sm font-medium ${googleConnected ? 'text-green-600' : 'text-gray-500'}`}>
                {googleConnected ? 'Bağlı' : 'Bağlı Değil'}
              </span>
            </div>
            
            <button
              onClick={googleConnected ? handleGoogleDisconnect : () => setShowGoogleSetup(true)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                googleConnected
                  ? 'bg-green-100 text-green-700 hover:bg-green-200 border border-green-300'
                  : 'bg-blue-100 text-blue-700 hover:bg-blue-200 border border-blue-300'
              }`}
            >
              {googleConnected ? 'Bağlantıyı Kes' : 'Google ile Bağlan'}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1">
        {/* Stats Cards */}
        <div className="flex flex-wrap gap-4 mb-8">
          <div className="flex-1 min-w-[200px]">
            <StatsCard
              title="Toplam Kullanıcı"
              value={stats.totalUsers || users.length}
              icon={<UsersIcon className="h-6 w-6 text-blue-500" />}
              color="border-blue-500"
            />
          </div>
          <div className="flex-1 min-w-[200px]">
            <StatsCard
              title="Öğretim Üyesi"
              value={stats.facultyCount || users.filter(u => u.role === 'faculty').length}
              icon={<AcademicCapIcon className="h-6 w-6 text-green-500" />}
              color="border-green-500"
            />
          </div>
          <div className="flex-1 min-w-[200px]">
            <StatsCard
              title="Öğrenci"
              value={stats.studentCount || users.filter(u => u.role === 'student').length}
              icon={<UsersIcon className="h-6 w-6 text-purple-500" />}
              color="border-purple-500"
            />
          </div>
          <div className="flex-1 min-w-[200px]">
            <StatsCard
              title="Toplam Randevu"
              value={stats.totalAppointments || appointments.length}
              icon={<CalendarIcon className="h-6 w-6 text-orange-500" />}
              color="border-orange-500"
            />
          </div>
        </div>

        {/* Modern Tab Navigation */}
        <div className="bg-white shadow rounded-lg mb-8">
          <TabNavigation
            tabs={[
              {
                id: 'users',
                label: 'Kullanıcılar',
                icon: <UsersIcon className="w-5 h-5" />
              },
              {
                id: 'appointments',
                label: 'Randevular',
                icon: <CalendarIcon className="w-5 h-5" />
              },
              {
                id: 'availability',
                label: 'Müsaitlik Durumu',
                icon: <ClockIcon className="w-5 h-5" />
              },
              {
                id: 'stats',
                label: 'İstatistikler',
                icon: <ChartBarIcon className="w-5 h-5" />
              }
            ]}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />

          <div className="p-6">
            {activeTab === 'users' && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Kullanıcı Yönetimi</h3>
                  <button
                    onClick={() => setShowAddUserModal(true)}
                    className="btn-primary"
                  >
                    <PlusIcon className="w-4 h-4 mr-2" />
                    Öğretim Üyesi Ekle
                  </button>
                </div>
                <FacultyList
                  users={users}
                  onEdit={handleEditUser}
                  onDelete={handleDeleteUser}
                  getRoleBadge={getRoleBadge}
                  getStatusBadge={getStatusBadge}
                />
              </div>
            )}

            {activeTab === 'appointments' && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Randevu Yönetimi</h3>
                  <div className="flex gap-2">
                    <button
                      onClick={openAvailabilityModal}
                      className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
                    >
                      <ClockIcon className="w-4 h-4 mr-2" />
                      Müsaitlik Ayarları
                    </button>
                    <button
                      onClick={handleGoogleConnect}
                      className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
                    >
                      <CalendarIcon className="w-4 h-4 mr-2" />
                      Google Calendar
                    </button>
                  </div>
                </div>

                {/* Appointment Tab Navigation */}
                <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6 shadow-lg">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setAppointmentTab('system')}
                      className={`flex-1 px-6 py-4 rounded-xl font-semibold text-sm transition-all duration-300 transform hover:scale-105 ${
                        appointmentTab === 'system'
                          ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-xl shadow-blue-200 ring-2 ring-blue-300'
                          : 'bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700 hover:from-gray-100 hover:to-gray-200 hover:shadow-lg border border-gray-200'
                      }`}
                    >
                      <div className="flex items-center justify-center space-x-2">
                        <ChartBarIcon className="w-5 h-5" />
                        <span>Sistem Randevuları</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                          appointmentTab === 'system' 
                            ? 'bg-white text-blue-600' 
                            : 'bg-blue-100 text-blue-600'
                        }`}>
                          {systemAppointments.length}
                        </span>
                      </div>
                    </button>
                    <button
                      onClick={() => setAppointmentTab('admin')}
                      className={`flex-1 px-6 py-4 rounded-xl font-semibold text-sm transition-all duration-300 transform hover:scale-105 ${
                        appointmentTab === 'admin'
                          ? 'bg-gradient-to-r from-green-600 to-green-700 text-white shadow-xl shadow-green-200 ring-2 ring-green-300'
                          : 'bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700 hover:from-gray-100 hover:to-gray-200 hover:shadow-lg border border-gray-200'
                      }`}
                    >
                      <div className="flex items-center justify-center space-x-2">
                        <CalendarIcon className="w-5 h-5" />
                        <span>Randevularım</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                          appointmentTab === 'admin' 
                            ? 'bg-white text-green-600' 
                            : 'bg-green-100 text-green-600'
                        }`}>
                          {adminAppointments.length}
                        </span>
                      </div>
                    </button>
                  </div>
                </div>

                {appointmentTab === 'system' && (
                  <div>
                    <h4 className="text-lg font-medium text-gray-900 mb-4">Sistem Randevuları</h4>
                    <p className="text-gray-600 mb-4">
                      Öğretim üyelerinin randevularını görüntüleyin. Bu randevular üzerinde işlem yapamazsınız.
                    </p>
                    <AppointmentList
                      appointments={systemAppointments}
                      getStatusIcon={getStatusIcon}
                      getStatusText={getStatusText}
                      getStatusColor={getStatusColor}
                      formatDate={formatDate}
                      formatTime={formatTime}
                      onDetails={handleAppointmentDetails}
                      showCancel={false}
                      showActions={false} // Sistem randevularında hiçbir aksiyon butonu gösterme
                    />
                  </div>
                )}

                {appointmentTab === 'admin' && (
                  <div>
                    <h4 className="text-lg font-medium text-gray-900 mb-4">Randevularım</h4>
                    <p className="text-gray-600 mb-4">
                      Size gelen randevuları yönetin. Tüm işlemleri yapabilirsiniz.
                    </p>
                    <AppointmentList
                      appointments={adminAppointments}
                      getStatusIcon={getStatusIcon}
                      getStatusText={getStatusText}
                      getStatusColor={getStatusColor}
                      formatDate={formatDate}
                      formatTime={formatTime}
                      onApprove={handleApproveAppointment}
                      onReject={handleRejectAppointment}
                      onDetails={handleAppointmentDetails}
                      showCancel={false}
                      showActions={true}
                    />
                  </div>
                )}
              </div>
            )}

            {activeTab === 'availability' && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Haftalık Müsaitlik</h3>
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={openAvailabilityModal}
                      className="btn-primary"
                    >
                      <PlusIcon className="w-4 h-4 mr-2" />
                      Müsaitlik Düzenle
                    </button>
                  </div>
                </div>

                {/* View Toggle */}
                <div className="flex items-center space-x-4 mb-4">
                  <span className="text-sm font-medium text-gray-700">Görünüm:</span>
                  <div className="flex bg-gray-100 rounded-lg p-1">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                        viewMode === 'grid' 
                          ? 'bg-white text-blue-600 shadow-sm' 
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      Kart Görünümü
                    </button>
                    <button
                      onClick={() => setViewMode('table')}
                      className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                        viewMode === 'table' 
                          ? 'bg-white text-blue-600 shadow-sm' 
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      Tablo Görünümü
                    </button>
                  </div>
                </div>

                {viewMode === 'grid' ? (
                  <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
                    {availability.map((day, index) => (
                      <div key={index} className="card p-4">
                        <h4 className="font-medium text-gray-900 mb-2">{getDayDisplayName(day.day)}</h4>
                        {day.isActive && day.timeSlots && day.timeSlots.length > 0 ? (
                          <div className="space-y-2">
                            {day.timeSlots.map((slot, slotIndex) => (
                              <div key={slotIndex} className={`text-sm ${slot.isAvailable ? 'text-green-600' : 'text-gray-500'}`}>
                                {slot.start} - {slot.end}
                                {!slot.isAvailable && <span className="ml-1">(Kapalı)</span>}
                              </div>
                            ))}
                            <p className="text-xs text-green-600">
                              {day.timeSlots.filter(slot => slot.isAvailable).length} zaman aralığı müsait
                            </p>
                          </div>
                        ) : day.isActive ? (
                          <p className="text-sm text-gray-500">Henüz zaman aralığı eklenmemiş</p>
                        ) : (
                          <p className="text-sm text-gray-500">Müsait değil</p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-white rounded-lg shadow overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Gün
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Durum
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Zaman Aralıkları
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Müsait Aralık
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {availability.map((day, index) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {getDayDisplayName(day.day)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                day.isActive 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-gray-100 text-gray-800'
                              }`}>
                                {day.isActive ? 'Aktif' : 'Pasif'}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-900">
                              {day.isActive && day.timeSlots && day.timeSlots.length > 0 ? (
                                <div className="space-y-1">
                                  {day.timeSlots.map((slot, slotIndex) => (
                                    <div key={slotIndex} className={`text-sm ${slot.isAvailable ? 'text-green-600' : 'text-gray-500'}`}>
                                      {slot.start} - {slot.end}
                                      {!slot.isAvailable && <span className="ml-1">(Kapalı)</span>}
                                    </div>
                                  ))}
                                </div>
                              ) : day.isActive ? (
                                <span className="text-gray-500">Henüz zaman aralığı eklenmemiş</span>
                              ) : (
                                <span className="text-gray-500">Müsait değil</span>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {day.isActive && day.timeSlots ? (
                                <span className="text-green-600 font-medium">
                                  {day.timeSlots.filter(slot => slot.isAvailable).length} / {day.timeSlots.length}
                                </span>
                              ) : (
                                <span className="text-gray-500">-</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}



            {activeTab === 'availability' && googleConnected && (
              <div className="mt-8">
                {googleLoading && (
                  <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                      <span className="text-sm text-blue-700">Google Calendar verileri yükleniyor...</span>
                    </div>
                  </div>
                )}
                <GoogleCalendarUnavailableSlots />
              </div>
            )}

            {activeTab === 'stats' && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Sistem İstatistikleri</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="card p-6">
                    <h4 className="font-medium text-gray-900 mb-4">Kullanıcı Dağılımı</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span>Yöneticiler:</span>
                        <span className="font-medium">{users.filter(u => u.role === 'admin').length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Öğretim Üyeleri:</span>
                        <span className="font-medium">{users.filter(u => u.role === 'faculty').length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Öğrenciler:</span>
                        <span className="font-medium">{users.filter(u => u.role === 'student').length}</span>
                      </div>
                    </div>
                  </div>
                  <div className="card p-6">
                    <h4 className="font-medium text-gray-900 mb-4">Randevu Durumu</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span>Bekleyen:</span>
                        <span className="font-medium">{appointments.filter(a => a.status === 'pending').length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Onaylanan:</span>
                        <span className="font-medium">{appointments.filter(a => a.status === 'approved').length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Reddedilen:</span>
                        <span className="font-medium">{appointments.filter(a => a.status === 'rejected').length}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modern Modals */}
      <FacultyAddModal
        isOpen={showAddUserModal}
        onClose={() => {
          setShowAddUserModal(false);
          setFacultyError('');
          setFacultySuccess('');
        }}
        facultyData={newFaculty}
        onInputChange={handleInputChange}
        onSubmit={handleCreateFaculty}
        loading={facultyLoading}
        error={facultyError}
        success={facultySuccess}
      />

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

      <AvailabilityModal
        isOpen={showAvailabilityModal}
        onClose={() => {
          setShowAvailabilityModal(false);
          setAvailabilityError('');
          setAvailabilitySuccess('');
        }}
        availability={availability}
        slotDuration={slotDuration}
        onSlotDurationChange={setSlotDuration}
        onDayAvailabilityChange={updateDayAvailability}
        onSave={handleUpdateAvailability}
        loading={availabilityLoading}
        error={availabilityError}
        success={availabilitySuccess}
      />

      {/* Appointment Details Modal */}
      <AppointmentDetails
        appointment={selectedAppointment}
        isOpen={showAppointmentDetails}
        onClose={() => {
          setShowAppointmentDetails(false);
          setSelectedAppointment(null);
        }}
        onApprove={handleApproveAppointment}
        onReject={handleRejectAppointment}
        onCancel={handleCancelAppointment}
        getStatusText={getStatusText}
        formatDate={formatDate}
        formatTime={formatTime}
      />
    </div>
  );
};

export default AdminDashboard; 