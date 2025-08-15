import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { 
  CalendarIcon, 
  ClockIcon, 
  AcademicCapIcon, 
  CheckCircleIcon, 
  XCircleIcon, 
  EyeIcon,
  QrCodeIcon,
  ChartBarIcon,
  EnvelopeIcon,
  PhoneIcon,
  GlobeAltIcon,
  PlusIcon,
  MinusIcon
} from '@heroicons/react/24/outline';
import apiService from '../services/apiService';

// Import modern components
import Header from '../components/Header/Header';
import headerStyles from '../components/Header/Header.module.css';
import StatsCard from '../components/StatsCard/StatsCard';
import AppointmentList from '../components/AppointmentList/AppointmentList';
import AppointmentDetails from '../components/AppointmentDetails/AppointmentDetails';
import ProfileModal from '../components/ProfileModal/ProfileModal';
import PasswordModal from '../components/PasswordModal/PasswordModal';
import AvailabilityModal from '../components/AvailabilityModal/AvailabilityModal';
import GoogleCalendarUnavailableSlots from '../components/GoogleCalendarUnavailableSlots/GoogleCalendarUnavailableSlots';
import TabNavigation from '../components/TabNavigation';

const FacultyDashboard = () => {
  const { user, login } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [availability, setAvailability] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('appointments');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [showQRModal, setShowQRModal] = useState(false);
  const [googleConnected, setGoogleConnected] = useState(false);
  const [showGoogleSetup, setShowGoogleSetup] = useState(false);
  
  // Profile management states
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    office: '',
    website: ''
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
  
  // Availability management states
  const [showAvailabilityModal, setShowAvailabilityModal] = useState(false);
  const [availabilityLoading, setAvailabilityLoading] = useState(false);
  const [availabilityError, setAvailabilityError] = useState('');
  const [availabilitySuccess, setAvailabilitySuccess] = useState('');
  
  // Google Calendar modal states
  const [viewMode, setViewMode] = useState('grid'); // Add this state for view mode
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showAppointmentDetails, setShowAppointmentDetails] = useState(false);

  useEffect(() => {
    if (user) {
      loadDashboardData();
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

  // Handle Google OAuth callback
  useEffect(() => {
    const token = searchParams.get('token');
    const googleConnectedParam = searchParams.get('googleConnected');
    const error = searchParams.get('error');
    const code = searchParams.get('code'); // Check for OAuth 2.0 authorization code

    if (error) {
      // Google OAuth error
      console.error('Google OAuth error:', error);
      alert('Google Calendar bağlantısı başarısız: ' + decodeURIComponent(error));
      navigate('/faculty-dashboard', { replace: true });
      return;
    }

    if (code) {
      // Handle OAuth 2.0 authorization code
      console.log('Google OAuth authorization code received');
      handleOAuthCallback(code);
    } else if (token && googleConnectedParam === 'true') {
      // Handle direct token (e.g., from old flow or other redirects)
      console.log('Google OAuth callback successful');
      
      // Store token
      localStorage.setItem('token', token);
      apiService.setToken(token);
      
      // Update user context
      if (user) {
        // Update user with Google connection status
        const updatedUser = { ...user, googleConnected: true };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        login(token, updatedUser);
      }
      
      // Set Google connected state
      setGoogleConnected(true);
      
      // Load Google Calendar events
      loadGoogleCalendarEvents();
      
      // Clear URL parameters
      navigate('/faculty-dashboard', { replace: true });
      
      // Show success message
      alert('Google Calendar başarıyla bağlandı!');
    }
  }, [searchParams, user, login, navigate]);

  // Handle OAuth 2.0 callback
  const handleOAuthCallback = async (code) => {
    try {
      console.log('Processing OAuth callback with code:', code);
      
      // Call backend to exchange code for tokens
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/google/callback?code=${code}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const data = await response.json();
      console.log('OAuth callback response:', data);

      if (data.success && data.token) {
        console.log('OAuth callback successful');
        
        // Store token
        localStorage.setItem('token', data.token);
        apiService.setToken(data.token);
        
        // Update user context
        if (data.user) {
          const updatedUser = { ...data.user, googleConnected: true };
          localStorage.setItem('user', JSON.stringify(updatedUser));
          login(data.token, updatedUser);
        }
        
        // Set Google connected state
        setGoogleConnected(true);
        
        // Load Google Calendar events
        loadGoogleCalendarEvents();
        
        // Clear URL parameters
        navigate('/faculty-dashboard', { replace: true });
        
        // Show success message
        alert('Google Calendar başarıyla bağlandı!');
      } else {
        // Handle specific error cases
        let errorMessage = data.message || 'Token alınamadı';
        
        if (data.details) {
          console.error('OAuth error details:', data.details);
          errorMessage += '\n\nDetaylar:\n' + data.details;
        }
        
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error('OAuth callback error:', error);
      
      // Show detailed error message
      let errorMessage = 'Google Calendar bağlantısı başarısız: ' + error.message;
      
      if (error.message.includes('invalid_request')) {
        errorMessage = `
Google Calendar bağlantısı başarısız!

Muhtemel nedenler:
1. Aynı hesap ile tekrar bağlanmaya çalışıyorsunuz
2. Google Cloud Console ayarları eksik
3. Environment variables doğru yüklenmemiş

Çözüm adımları:
1. Önce mevcut bağlantıyı kesin (eğer varsa)
2. Google Cloud Console'da redirect URI'ları kontrol edin
3. Backend log'larını kontrol edin
4. Tekrar deneyin

Hata detayı: ${error.message}
        `;
      }
      
      alert(errorMessage);
      navigate('/faculty-dashboard', { replace: true });
    }
  };

  // Load Google Calendar events when connected
  useEffect(() => {
    if (googleConnected) {
      loadGoogleCalendarEvents();
    }
  }, [googleConnected]);

  // Check if Google Calendar is connected on component mount
  useEffect(() => {
    const checkGoogleConnection = async () => {
      try {
        console.log('Checking Google Calendar connection...');
        
        // Check if user has Google tokens by trying to get current user data
        const userResponse = await apiService.getCurrentUser();
        if (userResponse.success && userResponse.data) {
          const userData = userResponse.data;
          console.log('User data received:', {
            email: userData.email,
            googleId: userData.googleId,
            hasAccessToken: !!userData.googleAccessToken
          });
          
          if (userData.googleAccessToken || userData.googleId) {
            console.log('Google Calendar connected for user:', userData.email);
            setGoogleConnected(true);
          } else {
            console.log('Google Calendar not connected for user:', userData.email);
            setGoogleConnected(false);
          }
        } else {
          console.log('Failed to get user data, assuming not connected');
          setGoogleConnected(false);
        }
      } catch (error) {
        console.error('Error checking Google connection:', error);
        setGoogleConnected(false);
      }
    };

    if (user) {
      checkGoogleConnection();
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
      office: user?.office || '',
      website: user?.website || ''
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

  const handleSaveAvailability = async () => {
    setAvailabilityLoading(true);
    setAvailabilityError('');
    setAvailabilitySuccess('');

    try {
      const response = await apiService.updateFacultyAvailability({
        availability
      });
      
      if (response.success) {
        setAvailabilitySuccess('Müsaitlik durumu başarıyla kaydedildi!');
        
        setTimeout(() => {
          setShowAvailabilityModal(false);
          setAvailabilitySuccess('');
        }, 2000);
      }
    } catch (error) {
      console.error('Availability save error:', error);
      setAvailabilityError(error.message || 'Müsaitlik durumu kaydedilirken hata oluştu');
    } finally {
      setAvailabilityLoading(false);
    }
  };

  const loadAvailabilityFromGoogleCalendar = async () => {
    setAvailabilityLoading(true);
    setAvailabilityError('');
    setAvailabilitySuccess('');

    try {
      const response = await apiService.loadAvailabilityFromGoogleCalendar();
      
      if (response.success) {
        setAvailability(response.data.availability);
        setAvailabilitySuccess('Google Calendar\'dan müsaitlik başarıyla yüklendi');
        
        // Reload dashboard data to reflect changes
        setTimeout(() => {
          loadDashboardData();
        }, 1000);
      }
    } catch (error) {
      console.error('Google Calendar availability load error:', error);
      setAvailabilityError(error.message || 'Google Calendar\'dan müsaitlik yüklenirken hata oluştu');
    } finally {
      setAvailabilityLoading(false);
    }
  };

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load appointments
      const appointmentsResponse = await apiService.getFacultyAppointments();
      const appointmentsData = appointmentsResponse.data?.appointments || appointmentsResponse.data || [];
      setAppointments(appointmentsData);
      
      // Load profile and availability
      const profileResponse = await apiService.getCurrentUser();
      const profileData = profileResponse.data;
      
      if (profileData.availability) {
        setAvailability(profileData.availability);
      }
      

      
      if (profileData.googleId) {
        setGoogleConnected(true);
      }
      
      console.log('Dashboard data loaded:', { appointmentsData, profileData });
    } catch (error) {
      console.error('Dashboard data load error:', error);
      setAppointments([]);
      setAvailability([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAppointmentAction = async (appointmentId, action, rejectionReason = null) => {
    try {
      let response;
      
      if (action === 'approved') {
        response = await apiService.approveAppointment(appointmentId);
      } else if (action === 'rejected') {
        response = await apiService.rejectAppointment(appointmentId, rejectionReason);
      } else if (action === 'cancelled') {
        response = await apiService.cancelAppointment(appointmentId);
      } else {
        response = await apiService.updateAppointment(appointmentId, { status: action });
      }
      
      if (response.success) {
        // Reload appointments
        const updatedResponse = await apiService.getFacultyAppointments();
        const updatedAppointments = updatedResponse.data?.appointments || updatedResponse.data || [];
        setAppointments(updatedAppointments);
      }
    } catch (error) {
      console.error('Appointment action error:', error);
      alert('İşlem sırasında hata oluştu: ' + error.message);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { text: 'Beklemede', color: 'bg-yellow-100 text-yellow-800' },
      approved: { text: 'Onaylandı', color: 'bg-green-100 text-green-800' },
      rejected: { text: 'Reddedildi', color: 'bg-red-100 text-red-800' },
      cancelled: { text: 'İptal Edildi', color: 'bg-gray-100 text-gray-800' }
    };
    
    const config = statusConfig[status] || { text: status, color: 'bg-gray-100 text-gray-800' };
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {config.text}
      </span>
    );
  };

  const getTopicLabel = (topic) => {
    const topicLabels = {
      'academic_advice': 'Akademik Danışmanlık',
      'course_registration': 'Ders Kaydı',
      'thesis_guidance': 'Tez Danışmanlığı',
      'project_guidance': 'Proje Danışmanlığı',
      'other': 'Diğer'
    };
    return topicLabels[topic] || topic;
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <ClockIcon className="h-5 w-5 text-yellow-500" />;
      case 'approved':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'rejected':
        return <XCircleIcon className="h-5 w-5 text-red-500" />;
      case 'cancelled':
        return <XCircleIcon className="h-5 w-5 text-gray-500" />;
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

  const handleCancelAppointment = (appointment) => {
    if (window.confirm('Bu randevuyu iptal etmek istediğinizden emin misiniz?')) {
      handleAppointmentAction(appointment._id, 'cancelled');
    }
  };

  const handleApproveAppointment = (appointmentId) => {
    if (window.confirm('Bu randevuyu onaylamak istediğinizden emin misiniz?')) {
      handleAppointmentAction(appointmentId, 'approved');
    }
  };

  const handleRejectAppointment = (appointmentId, reason) => {
    if (reason) {
      if (window.confirm('Bu randevuyu reddetmek istediğinizden emin misiniz?')) {
        handleAppointmentAction(appointmentId, 'rejected', reason);
      }
    }
  };

  const handleViewDetails = (appointment) => {
    setSelectedAppointment(appointment);
    setShowAppointmentDetails(true);
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
    if (!window.confirm('Google Calendar bağlantısını kesmek istediğinizden emin misiniz?')) {
      return;
    }

    try {
      const result = await apiService.disconnectGoogleCalendar();
      
      if (result.success) {
        setGoogleConnected(false);
        loadDashboardData();
        console.log('Google Calendar bağlantısı kesildi');
        alert('Google Calendar bağlantısı başarıyla kesildi.');
      } else {
        alert('Google Calendar bağlantısı kesilemedi: ' + result.message);
      }
    } catch (error) {
      console.error('Google disconnect error:', error);
      alert('Google Calendar bağlantısı kesilemedi: ' + error.message);
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

      // Update availability based on Google Calendar events
      const updatedAvailability = availability.map(day => {
        const dayEvents = eventsByDay[day.day] || [];
        
        if (dayEvents.length > 0) {
          // Mark time slots as unavailable if there are events
          const updatedTimeSlots = day.timeSlots.map(slot => {
            const slotStart = new Date(`2000-01-01T${slot.start}`);
            const slotEnd = new Date(`2000-01-01T${slot.end}`);
            
            // Check if any event overlaps with this time slot
            const hasConflict = dayEvents.some(event => {
              const eventStart = new Date(event.start.dateTime || event.start.date);
              const eventEnd = new Date(event.end.dateTime || event.end.date);
              
              const eventStartTime = new Date(`2000-01-01T${eventStart.toTimeString().slice(0, 5)}`);
              const eventEndTime = new Date(`2000-01-01T${eventEnd.toTimeString().slice(0, 5)}`);
              
              return (slotStart < eventEndTime && slotEnd > eventStartTime);
            });
            
            return {
              ...slot,
              isAvailable: !hasConflict
            };
          });
          
          return {
            ...day,
            timeSlots: updatedTimeSlots
          };
        }
        
        return day;
      });

      setAvailability(updatedAvailability);
      
      // Save updated availability to backend
      await apiService.updateFacultyAvailability({
        availability: updatedAvailability
      });
      
      console.log('Google Calendar events processed and availability updated');
    } catch (error) {
      console.error('Error processing Google Calendar events:', error);
    }
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
    },
    {
      name: 'website',
      label: 'Web Sitesi',
      type: 'url',
      required: false,
      placeholder: 'https://example.com'
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
          <h1 className={headerStyles.headerTitle}>Öğretim Üyesi Paneli</h1>
          <p className={headerStyles.headerSubtitle}>
            Hoş geldiniz, {user?.name}
          </p>
        </div>
        <div className={headerStyles.headerRight}>
          <button
            onClick={openAvailabilityModal}
            className={`${headerStyles.button} ${headerStyles.primaryButton}`}
          >
            <ClockIcon className={headerStyles.buttonIcon} />
            Müsaitlik Ayarları
          </button>
          <button
            onClick={() => window.location.href = '/qr-code'}
            className={`${headerStyles.button} ${headerStyles.secondaryButton}`}
          >
            <QrCodeIcon className={headerStyles.buttonIcon} />
            QR Kod Oluştur
          </button>
          <button
            onClick={googleConnected ? handleGoogleDisconnect : () => setShowGoogleSetup(true)}
            className={`${headerStyles.button} ${googleConnected ? headerStyles.successButton : headerStyles.secondaryButton}`}
          >
            <CalendarIcon className={headerStyles.buttonIcon} />
            {googleConnected ? 'Google Calendar Bağlı' : 'Google Calendar'}
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
              title="Toplam Randevu"
              value={appointments.length}
              icon={<CalendarIcon className="h-6 w-6 text-gray-400" />}
              color="border-gray-400"
            />
          </div>
          <div className="flex-1 min-w-[200px]">
            <StatsCard
              title="Bekleyen"
              value={appointments.filter(apt => apt.status === 'pending').length}
              icon={<ClockIcon className="h-6 w-6 text-yellow-500" />}
              color="border-yellow-500"
            />
          </div>
          <div className="flex-1 min-w-[200px]">
            <StatsCard
              title="Onaylanan"
              value={appointments.filter(apt => apt.status === 'approved').length}
              icon={<CheckCircleIcon className="h-6 w-6 text-green-500" />}
              color="border-green-500"
            />
          </div>
          <div className="flex-1 min-w-[200px]">
            <StatsCard
              title="Reddedilen"
              value={appointments.filter(apt => apt.status === 'rejected').length}
              icon={<XCircleIcon className="h-6 w-6 text-red-500" />}
              color="border-red-500"
            />
          </div>
        </div>

        {/* Modern Tab Navigation */}
        <div className="bg-white shadow rounded-lg mb-8">
          <TabNavigation
            tabs={[
              {
                id: 'appointments',
                label: 'Randevular',
                icon: <CalendarIcon className="w-5 h-5" />
              },
              {
                id: 'availability',
                label: 'Müsaitlik Durumu',
                icon: <ClockIcon className="w-5 h-5" />
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
                  onApprove={handleApproveAppointment}
                  onReject={handleRejectAppointment}
                  onDetails={handleViewDetails}
                  showCancel={false}
                  showActions={true}
                />
              </div>
            ) : (
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

            {/* Google Calendar Unavailable Slots Section */}
            {googleConnected && (
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

      <AvailabilityModal
        isOpen={showAvailabilityModal}
        onClose={() => {
          setShowAvailabilityModal(false);
          setAvailabilityError('');
          setAvailabilitySuccess('');
        }}
        availability={availability}
        onDayAvailabilityChange={updateDayAvailability}
        onSave={handleSaveAvailability}
        onLoadFromGoogleCalendar={loadAvailabilityFromGoogleCalendar}
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
        onCancel={handleAppointmentAction}
        getStatusText={getStatusText}
        formatDate={formatDate}
        formatTime={formatTime}
      />
    </div>
  );
};

export default FacultyDashboard;