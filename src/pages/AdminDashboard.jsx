import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  UserGroupIcon, 
  CalendarIcon, 
  QrCodeIcon, 
  ChartBarIcon, 
  CogIcon, 
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  MapPinIcon,
  BellIcon,
  UserIcon,
  AcademicCapIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';
import styles from './AdminDashboard.module.css';
import apiService from '../services/apiService';

// Import modern components
import Header from '../components/Header/Header';
import headerStyles from '../components/Header/Header.module.css';
import StatsCard from '../components/StatsCard/StatsCard';
import FacultyList from '../components/FacultyList/FacultyList';
import FacultyAddModal from '../components/FacultyAddModal/FacultyAddModal';
import StudentDetailsModal from '../components/StudentDetailsModal/StudentDetailsModal';
import ProfileModal from '../components/ProfileModal/ProfileModal';
import PasswordModal from '../components/PasswordModal/PasswordModal';
import AppointmentList from '../components/AppointmentList/AppointmentList';
import AppointmentDetails from '../components/AppointmentDetails/AppointmentDetails';
import AvailabilityModal from '../components/AvailabilityModal/AvailabilityModal';
import GoogleCalendarEvents from '../components/GoogleCalendarUnavailableSlots/GoogleCalendarUnavailableSlots';
import AdminGeofenceManager from '../components/AdminGeofenceManager/AdminGeofenceManager';
import TabNavigation from '../components/TabNavigation';
import sectionThemes from '../styles/sectionThemes.module.css';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [systemAppointments, setSystemAppointments] = useState([]); // Tüm sistem randevuları
  const [adminAppointments, setAdminAppointments] = useState([]); // Sadece admin'e gelen randevular
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('users');
  const [appointmentTab, setAppointmentTab] = useState('system'); // 'system' veya 'admin'
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [showStudentDetailsModal, setShowStudentDetailsModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
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

  // Real-time notification states
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [lastAppointmentCount, setLastAppointmentCount] = useState(0);

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
  
  // Refs for real-time updates
  const notificationIntervalRef = useRef(null);
  const appointmentCheckIntervalRef = useRef(null);

  useEffect(() => {
    if (user) {
      loadDashboardData();
      loadFacultyData();
      loadNotificationsFromStorage(); // Load notifications from localStorage
      startRealTimeUpdates();
    }

    return () => {
      stopRealTimeUpdates();
    };
  }, [user]);

  // Save notifications to localStorage when they change
  useEffect(() => {
    if (notifications.length > 0 || unreadCount > 0) {
      saveNotificationsToStorage(notifications, unreadCount);
    }
  }, [notifications, unreadCount]);

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

  // Auto-load faculty data when availability tab is opened
  useEffect(() => {
    if (activeTab === 'availability' && user) {
      loadFacultyData();
    }
  }, [activeTab, user]);

  // Real-time updates setup
  const startRealTimeUpdates = () => {
    // Check for new appointments every 10 seconds
    appointmentCheckIntervalRef.current = setInterval(checkForNewAppointments, 10000);
    
    // Check for notifications every 30 seconds
    notificationIntervalRef.current = setInterval(checkForNotifications, 30000);
  };

  const stopRealTimeUpdates = () => {
    if (appointmentCheckIntervalRef.current) {
      clearInterval(appointmentCheckIntervalRef.current);
    }
    if (notificationIntervalRef.current) {
      clearInterval(notificationIntervalRef.current);
    }
  };

  // Helper: determine if appointment belongs to current admin (as faculty)
  const isOwnAppointment = (appointment) => {
    const currentUserId = user?.id || user?._id;
    if (!currentUserId) return false;
    const faculty = appointment?.facultyId;
    const facultyId = typeof faculty === 'object' && faculty !== null ? (faculty._id || faculty.id) : faculty;
    return String(facultyId) === String(currentUserId);
  };

  // Check for new appointments
  const checkForNewAppointments = async () => {
    try {
      const allAppointmentsResponse = await apiService.getAllAppointments();
      const allAppointments = allAppointmentsResponse.data?.appointments || allAppointmentsResponse.data || [];
      const ownAppointments = allAppointments.filter(isOwnAppointment);
      const otherAppointments = allAppointments.filter(a => !isOwnAppointment(a));
      
      // Sort appointments by creation date (newest first)
      const sortedAllAppointments = [...allAppointments].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      const sortedAdminAppointments = [...ownAppointments].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      
      // Check if there are new appointments
      const currentTotalCount = allAppointments.length;
      if (currentTotalCount > lastAppointmentCount && lastAppointmentCount > 0) {
        const newCount = currentTotalCount - lastAppointmentCount;
        showNewAppointmentNotification(newCount);
      }
      
      // Update state with sorted appointments
      setAppointments(sortedAllAppointments);
      setSystemAppointments(otherAppointments.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
      setAdminAppointments(sortedAdminAppointments);
      setLastAppointmentCount(currentTotalCount);
      
    } catch (error) {
      console.error('Real-time appointment check failed:', error);
    }
  };

  // Check for notifications
  const checkForNotifications = async () => {
    try {
      // This would typically call a notification endpoint
      // For now, we'll just check if there are new appointments
      const response = await apiService.getUnreadNotifications();
      if (response.success) {
        setNotifications(response.data.notifications || []);
        setUnreadCount(response.data.unreadCount || 0);
      }
    } catch (error) {
      console.error('Notification check failed:', error);
    }
  };

    // Show new appointment notification
  const showNewAppointmentNotification = (count) => {
    const notification = {
      id: Date.now(),
      type: 'appointment',
      title: 'Yeni Randevu',
      message: `${count} yeni randevu geldi!`,
      timestamp: new Date(),
      read: false
    };

    setNotifications(prev => [notification, ...prev]);
    setUnreadCount(prev => prev + 1);

    // Show browser notification if permitted
    if (Notification.permission === 'granted') {
      new Notification('Yeni Randevu', {
        body: `${count} yeni randevu geldi!`,
        icon: '/favicon.ico',
        tag: 'new-appointment'
      });
    }

    // Auto-remove notification after 5 seconds
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== notification.id));
      setUnreadCount(prev => Math.max(0, prev - 1));
    }, 5000);
  };

  // Mark all notifications as read
  const markAllNotificationsRead = async () => {
    try {
      // Mark all notifications as read (keep them, just mark as read)
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
      saveNotificationsToStorage(notifications.map(n => ({ ...n, read: true })));
      
      // Also call API to mark as read on server
      await apiService.markAllNotificationsAsRead();
    } catch (error) {
      console.error('Mark all notifications read error:', error);
    }
  };

  // Handle notification click
  const handleNotificationClick = (notification) => {
    // Bildirime göre ilgili sayfaya yönlendir
    if (notification.type === 'appointment') {
      // Randevu bildirimine tıklandıysa randevular sekmesine git
      setActiveTab('appointments');
    } else if (notification.type === 'system') {
      // Sistem bildirimi için ana sayfada kal
      setActiveTab('users');
    }
    // Bildirimi okundu olarak işaretle
    setNotifications(prev => prev.map(n =>
      n.id === notification.id ? { ...n, read: true } : n
    ));
    setUnreadCount(prev => Math.max(0, prev - 1));
    // localStorage automatically updated via useEffect
  };

  // Handle view student details
  const handleViewStudent = (student) => {
    setSelectedStudent(student);
    setShowStudentDetailsModal(true);
  };

  // Handle close student details modal
  const handleCloseStudentDetails = () => {
    setShowStudentDetailsModal(false);
    setSelectedStudent(null);
  };

  // Request notification permission
  const requestNotificationPermission = async () => {
    if (Notification.permission === 'default') {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        console.log('Notification permission granted');
      }
    }
  };

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      console.log('AdminDashboard: Loading dashboard data...');
      
      // Request notification permission
      await requestNotificationPermission();
      
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
      
      // Randevuları oluşturulma tarihine göre sırala (en yeni en üstte)
      const sortedAllAppointments = [...allAppointments].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      const ownAppointments = allAppointments.filter(isOwnAppointment);
      const otherAppointments = allAppointments.filter(a => !isOwnAppointment(a));
      setAppointments(sortedAllAppointments);
      setSystemAppointments(otherAppointments.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
      setAdminAppointments(ownAppointments.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
      setLastAppointmentCount(sortedAllAppointments.length);
      
      setStats(allStats);
      
      // Check Google Calendar connection status
      try {
        const googleStatusResponse = await apiService.getGoogleCalendarStatus();
        setGoogleConnected(googleStatusResponse.success && googleStatusResponse.data?.isConnected);
      } catch (error) {
        console.error('Failed to check Google Calendar status:', error);
        setGoogleConnected(false);
      }

      // Load profile data
      try {
        const profileResponse = await apiService.getCurrentUser();
        const profileData = profileResponse.data;

        // Update profile state with loaded data
        setProfileData({
          name: profileData.name || '',
          email: profileData.email || '',
          phone: profileData.phone || '',
          office: profileData.office || ''
        });

        // Update user context with complete profile data for ProfileDropdown
        if (profileData.phone || profileData.office || profileData.title || profileData.department) {
          const updatedUser = {
            ...user,
            phone: profileData.phone,
            office: profileData.office,
            title: profileData.title,
            department: profileData.department
          };
          // Update localStorage to persist the data
          localStorage.setItem('user', JSON.stringify(updatedUser));
        }
      } catch (error) {
        console.error('Failed to load profile data:', error);
      }
      
      console.log('Dashboard data loaded:', { 
        allUsers, 
        totalAppointments: sortedAllAppointments.length, 
        allStats, 
        ownAppointmentsCount: ownAppointments.length,
        systemAppointmentsCount: otherAppointments.length
      });
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

      if (availabilityResponse.success && availabilityResponse.data.availability && availabilityResponse.data.availability.length > 0) {
        setAvailability(availabilityResponse.data.availability);
        setSlotDuration(availabilityResponse.data.slotDuration || 30);
      } else {
        // Initialize default availability structure if none exists
        setAvailability(initializeAvailability());
        setSlotDuration(30);
      }
    } catch (error) {
      console.error('Faculty data error:', error);
      // Initialize default availability structure on error
      setAvailability(initializeAvailability());
      setSlotDuration(30);
    }
  };

  const handleDeleteUser = async (userId) => {
    // Öğrenciyi bul
    const userToDelete = users.find(user => user._id === userId);

    if (userToDelete && userToDelete.role === 'student') {
      alert('Öğrenciler admin tarafından silinemez.');
      return;
    }

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
      // Add required fields for faculty creation
      const facultyData = {
        ...newFaculty,
        role: 'faculty',
        slug: newFaculty.name.toLowerCase()
          .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
          .trim()
          .replace(/\s+/g, '-') // Replace spaces with hyphens
          .replace(/-+/g, '-') // Replace multiple hyphens with single
          .replace(/^-|-$/g, ''), // Remove leading/trailing hyphens
        password: Math.random().toString(36).slice(-8) // Generate temporary password
      };

      const response = await apiService.createFaculty(facultyData);
      
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

    // Check for duplicate time slots before saving
    const duplicateErrors = [];
    const conflictErrors = [];

    availability.forEach((day, dayIndex) => {
      if (!day.timeSlots || day.timeSlots.length === 0) return;

      const slots = day.timeSlots;
      const dayName = getDayDisplayName(day.day);

      // Check for duplicate slots
      const slotStrings = slots.map(slot => `${slot.start}-${slot.end}`);
      const uniqueSlots = new Set(slotStrings);

      if (uniqueSlots.size !== slotStrings.length) {
        duplicateErrors.push(`${dayName} günü için aynı zaman aralığı birden fazla kez eklenmiş!`);
      }

      // Check for overlapping slots
      for (let i = 0; i < slots.length; i++) {
        for (let j = i + 1; j < slots.length; j++) {
          const slot1 = slots[i];
          const slot2 = slots[j];

          const start1 = slot1.start;
          const end1 = slot1.end;
          const start2 = slot2.start;
          const end2 = slot2.end;

          // Check for time overlap
          if (start1 < end2 && end1 > start2) {
            conflictErrors.push(`${dayName} günü: ${start1}-${end1} ve ${start2}-${end2} zaman aralıkları çakışıyor!`);
          }
        }
      }
    });

    // If there are validation errors, show them and don't save
    if (duplicateErrors.length > 0 || conflictErrors.length > 0) {
      const allErrors = [...duplicateErrors, ...conflictErrors];
      setAvailabilityError(allErrors.join('\n'));
      setAvailabilityLoading(false);
      return;
    }

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
        // Reload appointments and re-separate lists
        const allAppointmentsResponse = await apiService.getAllAppointments();
        const allAppointments = allAppointmentsResponse.data?.appointments || allAppointmentsResponse.data || [];
        const ownAppointments = allAppointments.filter(isOwnAppointment);
        const otherAppointments = allAppointments.filter(a => !isOwnAppointment(a));
        
        const sortedAllAppointments = [...allAppointments].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        const sortedOwn = [...ownAppointments].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        const sortedOthers = [...otherAppointments].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        
        setAppointments(sortedAllAppointments);
        setSystemAppointments(sortedOthers);
        setAdminAppointments(sortedOwn);
        
        // Show success notification
        const actionText = action === 'approved' ? 'onaylandı' : action === 'rejected' ? 'reddedildi' : 'iptal edildi';
        showActionNotification(`Randevu başarıyla ${actionText}!`);
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
          // Reload appointments with proper sorting
          const [allAppointmentsResponse, facultyAppointmentsResponse] = await Promise.all([
            apiService.getAllAppointments(),
            apiService.getFacultyAppointments()
          ]);
          
          const allAppointments = allAppointmentsResponse.data?.appointments || allAppointmentsResponse.data || [];
          const adminAppts = facultyAppointmentsResponse.data?.appointments || facultyAppointmentsResponse.data || [];
          
          // Sort appointments by creation date (newest first)
          const sortedAllAppointments = allAppointments.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          const sortedAdminAppointments = adminAppts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          
          setAppointments(sortedAllAppointments);
          setSystemAppointments(sortedAllAppointments);
          setAdminAppointments(sortedAdminAppointments);
          
          // Show success notification
          showActionNotification('Randevu başarıyla iptal edildi!');
        }
      } catch (error) {
        console.error('Cancel appointment error:', error);
        alert('Randevu iptal edilirken hata oluştu: ' + error.message);
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
      admin: { text: 'Yönetici', color: 'bg-red-100 text-red-800 border-red-300' },
      faculty: { text: 'Öğretim Üyesi', color: 'bg-blue-100 text-blue-800 border-blue-300' },
      student: { text: 'Öğrenci', color: 'bg-green-100 text-green-800 border-green-300' }
    };

    const config = roleConfig[role] || { text: role, color: 'bg-gray-100 text-gray-800 border-gray-300' };

    return (
      <span className={`inline-flex items-center px-4 py-1.5 rounded-lg text-sm font-medium border ${config.color}`}>
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
      cancelled: <XCircleIcon className="h-5 w-5 text-gray-500" />,
      no_response: <ExclamationTriangleIcon className="h-5 w-5 text-orange-500" />
    };
    return iconConfig[status] || <ExclamationTriangleIcon className="h-5 w-5 text-gray-500" />;
  };

  const getStatusText = (status) => {
    const textConfig = {
      pending: 'Bekliyor',
      approved: 'Onaylandı',
      rejected: 'Reddedildi',
      cancelled: 'İptal Edildi',
      no_response: 'Cevaplamadı'
    };
    return textConfig[status] || status;
  };

  const getStatusColor = (status) => {
    const colorConfig = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      cancelled: 'bg-gray-100 text-gray-800',
      no_response: 'bg-orange-100 text-orange-800'
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
    // Sadece öğretim üyelerini düzenle (öğrenciler düzenlenemez)
    if (user.role === 'student') {
      alert('Öğrenciler admin tarafından düzenlenemez.');
      return;
    }

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

  // Öğretim üyesi güncelleme fonksiyonu
  const handleUpdateFaculty = async (e) => {
    e.preventDefault();
    setFacultyLoading(true);
    setFacultyError('');
    setFacultySuccess('');

    try {
      const response = await apiService.updateUser(editingUser._id, newFaculty);

      if (response.success) {
        setFacultySuccess('Öğretim üyesi başarıyla güncellendi!');

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

        // Modal'ı 2 saniye sonra kapat
        setTimeout(() => {
          setShowAddUserModal(false);
          setFacultySuccess('');
          setEditingUser(null);
        }, 2000);
      }
    } catch (error) {
      console.error('Faculty update error:', error);
      setFacultyError(error.message || 'Öğretim üyesi güncellenirken hata oluştu');
    } finally {
      setFacultyLoading(false);
    }
  };

  // Helper: check if a day is in the past (before today)
  const isDayPast = (dayName) => {
    const now = new Date();
    const todayName = now.toLocaleDateString('en-US', { weekday: 'long' });

    // If it's today, it's not past
    if (dayName === todayName) {
      return false;
    }

    // Map day names to numbers for comparison
    const dayMap = {
      'Monday': 1,
      'Tuesday': 2,
      'Wednesday': 3,
      'Thursday': 4,
      'Friday': 5,
      'Saturday': 6,
      'Sunday': 0
    };

    const dayNumber = dayMap[dayName];
    const todayNumber = now.getDay();

    // If day is before today in the week
    return dayNumber < todayNumber;
  };

  // Helper: check if slot time is past for today
  const isSlotTimePast = (slotEndTime) => {
    const now = new Date();
    const [endHour, endMinute] = slotEndTime.split(':').map(Number);
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();

    if (currentHour > endHour) return true;
    if (currentHour === endHour && currentMinute >= endMinute) return true;

    return false;
  };

  // Helper: check if slot should be available (considering date/time)
  // NEW AVAILABILITY SYSTEM - Simple and Clear Rules
  
  // Count confirmed appointments for a specific time slot
  const getConfirmedAppointmentCount = (slot, dayName) => {
    if (!appointments || appointments.length === 0) return 0;

    return appointments.filter(appointment => {
      const appointmentDate = new Date(appointment.appointmentDate);
      const appointmentDayName = appointmentDate.toLocaleDateString('en-US', { weekday: 'long' });
      
      return appointmentDayName === dayName &&
             appointment.startTime === slot.start &&
             appointment.status === 'confirmed';
    }).length;
  };

  // Calculate maximum appointments per slot based on duration
  const getMaxAppointmentsPerSlot = (slot) => {
    const slotStartHour = parseInt(slot.start.split(':')[0]);
    const slotStartMinute = parseInt(slot.start.split(':')[1]);
    const slotEndHour = parseInt(slot.end.split(':')[0]);
    const slotEndMinute = parseInt(slot.end.split(':')[1]);
    
    const slotDurationMinutes = (slotEndHour * 60 + slotEndMinute) - (slotStartHour * 60 + slotStartMinute);
    return Math.floor(slotDurationMinutes / slotDuration);
  };

  // Main availability logic - 4 Simple Rules
  const getSlotAvailabilityStatus = (slot, dayName) => {
    const confirmedCount = getConfirmedAppointmentCount(slot, dayName);
    const maxCount = getMaxAppointmentsPerSlot(slot);

    // RULE 1: Manual Unavailable = PERMANENT (Never changes)
    if (slot.manuallyUnavailable === true) {
      return {
        status: 'manually_unavailable',
        display: 'Kapalı (Manuel)',
        isBookable: false,
        count: confirmedCount,
        max: maxCount
      };
    }

    // RULE 2: Available + Fully Booked by Students = Show as Full
    if (slot.isAvailable === true && confirmedCount >= maxCount) {
      return {
        status: 'fully_booked',
        display: 'Doldu',
        isBookable: false,
        count: confirmedCount,
        max: maxCount
      };
    }

    // RULE 3: Available + Has Space = Show Available with Count
    if (slot.isAvailable === true) {
      return {
        status: 'available',
        display: 'Müsait',
        isBookable: true,
        count: confirmedCount,
        max: maxCount
      };
    }

    // RULE 4: Not Available (Faculty Set) = Show Unavailable
    return {
      status: 'unavailable',
      display: 'Kapalı',
      isBookable: false,
      count: confirmedCount,
      max: maxCount
    };
  };

  // Legacy function for backward compatibility
  const isSlotAvailableConsideringDate = (slot, dayName) => {
    const status = getSlotAvailabilityStatus(slot, dayName);
    return status.isBookable;
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

  // Show action notification
  const showActionNotification = (message) => {
    const notification = {
      id: Date.now(),
      type: 'action',
      title: 'İşlem Başarılı',
      message: message,
      timestamp: new Date(),
      read: false
    };
    
    setNotifications(prev => [notification, ...prev]);
    setUnreadCount(prev => prev + 1);
    
    // Auto-remove notification after 3 seconds
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== notification.id));
      setUnreadCount(prev => Math.max(0, prev - 1));
    }, 3000);
  };

  // Mark notification as read
  const markNotificationAsRead = (notificationId) => {
    setNotifications(prev => 
      prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  // Mark all notifications as read
  const markAllNotificationsAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  // Toggle notifications panel
  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
    if (!showNotifications) {
      markAllNotificationsAsRead();
    }
  };

  // Function to show a test notification
  const showTestNotification = () => {
    const notification = {
      id: Date.now(),
      type: 'test',
      title: 'Test Bildirimi',
      message: 'Bu bir test bildirimidir. Sistem çalışıyor!',
      timestamp: new Date(),
      read: false
    };
    setNotifications(prev => [notification, ...prev]);
    setUnreadCount(prev => prev + 1);

    if (Notification.permission === 'granted') {
      new Notification('Test Bildirimi', {
        body: 'Bu bir test bildirimidir. Sistem çalışıyor!',
        icon: '/favicon.ico',
        tag: 'test-notification'
      });
    }

    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== notification.id));
      setUnreadCount(prev => Math.max(0, prev - 1));
    }, 5000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gray-50 flex flex-col ${
      activeTab === 'users' ? sectionThemes.themeUsers :
      activeTab === 'appointments' ? sectionThemes.themeAppointments :
      activeTab === 'availability' ? sectionThemes.themeAvailability :
      activeTab === 'geofence' ? sectionThemes.themeGeofence :
      activeTab === 'stats' ? sectionThemes.themeStats : ''
    }`}>
      {/* Modern Header */}
            <Header
        user={user}
        onProfile={openProfileModal}
        onPassword={openPasswordModal}
        onLogout={handleLogout}
        notifications={notifications}
        unreadCount={unreadCount}
        onToggleNotifications={toggleNotifications}
        onMarkAllRead={markAllNotificationsRead}
        onNotificationClick={(notification) => {
          // Admin dashboard'da bildirimlere tıklandığında randevular sekmesine git
          setActiveTab('appointments');
          // Bildirimi okundu olarak işaretle
          setNotifications(prev => prev.map(n =>
            n.id === notification.id ? { ...n, read: true } : n
          ));
          setUnreadCount(prev => Math.max(0, prev - 1));
          // localStorage automatically updated via useEffect
        }}
        showNotifications={showNotifications}
        theme="admin"
      >

        <div className={headerStyles.navigationButtons}>
          <button
            onClick={openAvailabilityModal}
            className={headerStyles.navLink}
          >
            <ClockIcon className={headerStyles.navIcon} />
            Müsaitlik
          </button>
          <button
            onClick={googleConnected ? handleGoogleDisconnect : handleGoogleConnect}
            disabled={googleLoading}
            className={`${headerStyles.navLink} ${googleConnected ? headerStyles.navLinkActive : ''}`}
          >
            <CalendarIcon className={headerStyles.navIcon} />
            Calendar
          </button>
          <button
            onClick={() => window.location.href = '/qr-code'}
            className={headerStyles.navLink}
          >
            <QrCodeIcon className={headerStyles.navIcon} />
            QR Kod
          </button>
          <button
            onClick={() => setShowAddUserModal(true)}
            className={headerStyles.navLink}
          >
            <PlusIcon className={headerStyles.navIcon} />
            Ekle
          </button>
        </div>
      </Header>

      

      <div className="dashboard-main max-w-7xl mx-auto py-8">
        {/* Stats Cards */}
        <div className="stats-container">
          <div>
            <StatsCard
              title="Toplam Kullanıcı"
              value={stats.totalUsers || users.length}
              icon={<UserGroupIcon className="h-6 w-6" />}
              color="blue"
            />
          </div>
          <div>
            <StatsCard
              title="Öğretim Üyesi"
              value={stats.facultyCount || users.filter(u => u.role === 'faculty').length}
              icon={<UserGroupIcon className="h-6 w-6" />}
              color="teal"
            />
          </div>
          <div>
            <StatsCard
              title="Öğrenci"
              value={stats.studentCount || users.filter(u => u.role === 'student').length}
              icon={<UserGroupIcon className="h-6 w-6" />}
              color="purple"
            />
          </div>
          <div>
            <StatsCard
              title="Toplam Randevu"
              value={stats.totalAppointments || appointments.length}
              icon={<CalendarIcon className="h-6 w-6" />}
              color="pink"
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
                icon: <UserGroupIcon className="w-5 h-5" />
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
                id: 'geofence',
                label: 'Konum Yönetimi',
                icon: <MapPinIcon className="w-5 h-5" />
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
                  onViewStudent={handleViewStudent}
                  getRoleBadge={getRoleBadge}
                  getStatusBadge={getStatusBadge}
                />
              </div>
            )}

            {activeTab === 'appointments' && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Randevu Yönetimi</h3>
                </div>

                {/* Appointment Tab Navigation */}
                <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6 shadow-lg">
                  <div className={sectionThemes.toggleButtonContainer}>
                    <button
                      onClick={() => setAppointmentTab('system')}
                      className={`${sectionThemes.buttonToggle} ${appointmentTab === 'system' ? sectionThemes.buttonToggleActive : ''}`}
                    >
                      <div className="flex items-center justify-center space-x-2">
                        <ChartBarIcon className="w-5 h-5" />
                        <span>Sistem Randevuları</span>
                        <span className={`${sectionThemes.badge} ${appointmentTab === 'system' ? sectionThemes.badgeOn : sectionThemes.badgeOff}`}>
                          {systemAppointments.length}
                        </span>
                      </div>
                    </button>
                    <button
                      onClick={() => setAppointmentTab('admin')}
                      className={`${sectionThemes.buttonToggle} ${appointmentTab === 'admin' ? sectionThemes.buttonToggleActive : ''}`}
                    >
                      <div className="flex items-center justify-center space-x-2">
                        <CalendarIcon className="w-5 h-5" />
                        <span>Randevularım</span>
                        <span className={`${sectionThemes.badge} ${appointmentTab === 'admin' ? sectionThemes.badgeOn : sectionThemes.badgeOff}`}>
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
                            {day.timeSlots.map((slot, slotIndex) => {
                              const status = getSlotAvailabilityStatus(slot, day.day);
                              const statusStyles = {
                                available: { color: 'text-green-600', icon: '✅' },
                                fully_booked: { color: 'text-orange-600', icon: '👥' },
                                unavailable: { color: 'text-gray-500', icon: '🚫' },
                                manually_unavailable: { color: 'text-red-600', icon: '🔒' }
                              };
                              const style = statusStyles[status.status] || statusStyles.unavailable;

                              return (
                                <div key={slotIndex} className={`text-sm ${style.color} flex items-center gap-1`}>
                                  <span>{style.icon}</span>
                                  <span>{slot.start} - {slot.end}</span>
                                  <span className="text-xs">({status.display})</span>
                                </div>
                              );
                            })}
                            <p className="text-xs text-green-600">
                              {day.timeSlots.filter(slot => getSlotAvailabilityStatus(slot, day.day).isBookable).length} zaman aralığı müsait
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
                                  {day.timeSlots.map((slot, slotIndex) => {
                                    const status = getSlotAvailabilityStatus(slot, day.day);
                                    const statusStyles = {
                                      available: { color: 'text-green-600', icon: '✅' },
                                      fully_booked: { color: 'text-orange-600', icon: '👥' },
                                      unavailable: { color: 'text-gray-500', icon: '🚫' },
                                      manually_unavailable: { color: 'text-red-600', icon: '🔒' }
                                    };
                                    const style = statusStyles[status.status] || statusStyles.unavailable;

                                    return (
                                      <div key={slotIndex} className={`text-sm ${style.color} flex items-center gap-1`}>
                                        <span>{style.icon}</span>
                                        <span>{slot.start} - {slot.end}</span>
                                        <span className="text-xs">({status.display})</span>
                                      </div>
                                    );
                                  })}
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
                                  {day.timeSlots.filter(slot => getSlotAvailabilityStatus(slot, day.day).isBookable).length} / {day.timeSlots.length}
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
                <GoogleCalendarEvents />
              </div>
            )}

            {activeTab === 'geofence' && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Konum Yönetimi (Geofence)</h3>
                <p className="text-gray-600 mb-4">
                  Öğrencilerin randevu alabileceği konumları (geofence) yönetin. 
                  Bu sayede sadece belirli alanlarda bulunan öğrenciler randevu alabilir.
                </p>
                <AdminGeofenceManager />
              </div>
            )}

            {activeTab === 'stats' && (
              <div className={styles.statsSection}>
                <h3 className={styles.sectionTitle}>
                  <ChartBarIcon className={styles.sectionTitleIcon} />
                  Sistem İstatistikleri
                </h3>
                <div className={styles.statsGrid}>
                  {/* User Distribution Card */}
                  <div className={`${styles.statsCard} ${styles.userStatsCard}`}>
                    <div className={styles.cardHeader}>
                      <h4 className={styles.cardTitle}>
                        <UserGroupIcon className={styles.cardIcon} />
                        Kullanıcı Dağılımı
                      </h4>
                    </div>
                    <div className={styles.statsList}>
                      <div className={`${styles.statItem} ${styles.adminStat}`}>
                        <div className={styles.statLabel}>
                          <ShieldCheckIcon className={styles.statIcon} />
                          Yöneticiler
                        </div>
                        <div className={styles.statValue}>
                          <span className={styles.adminBadge}>{users.filter(u => u.role === 'admin').length}</span>
                        </div>
                      </div>
                      <div className={`${styles.statItem} ${styles.facultyStat}`}>
                        <div className={styles.statLabel}>
                          <AcademicCapIcon className={styles.statIcon} />
                          Öğretim Üyeleri
                        </div>
                        <div className={styles.statValue}>
                          <span className={styles.facultyBadge}>{users.filter(u => u.role === 'faculty').length}</span>
                        </div>
                      </div>
                      <div className={`${styles.statItem} ${styles.studentStat}`}>
                        <div className={styles.statLabel}>
                          <UserIcon className={styles.statIcon} />
                          Öğrenciler
                        </div>
                        <div className={styles.statValue}>
                          <span className={styles.studentBadge}>{users.filter(u => u.role === 'student').length}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Appointment Status Card */}
                  <div className={`${styles.statsCard} ${styles.appointmentStatsCard}`}>
                    <div className={styles.cardHeader}>
                      <h4 className={styles.cardTitle}>
                        <CalendarIcon className={styles.cardIcon} />
                        Randevu Durumu
                      </h4>
                    </div>
                    <div className={styles.statsList}>
                      <div className={`${styles.statItem} ${styles.pendingStat}`}>
                        <div className={styles.statLabel}>
                          <ClockIcon className={styles.statIcon} />
                          Bekleyen
                        </div>
                        <div className={styles.statValue}>
                          <span className={styles.pendingBadge}>{appointments.filter(a => a.status === 'pending').length}</span>
                        </div>
                      </div>
                      <div className={`${styles.statItem} ${styles.approvedStat}`}>
                        <div className={styles.statLabel}>
                          <CheckCircleIcon className={styles.statIcon} />
                          Onaylanan
                        </div>
                        <div className={styles.statValue}>
                          <span className={styles.approvedBadge}>{appointments.filter(a => a.status === 'approved').length}</span>
                        </div>
                      </div>
                      <div className={`${styles.statItem} ${styles.rejectedStat}`}>
                        <div className={styles.statLabel}>
                          <XCircleIcon className={styles.statIcon} />
                          Reddedilen
                        </div>
                        <div className={styles.statValue}>
                          <span className={styles.rejectedBadge}>{appointments.filter(a => a.status === 'rejected').length}</span>
                        </div>
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
          setEditingUser(null);
        }}
        facultyData={newFaculty}
        onInputChange={handleInputChange}
        onSubmit={editingUser ? handleUpdateFaculty : handleCreateFaculty}
        loading={facultyLoading}
        error={facultyError}
        success={facultySuccess}
        isEditMode={!!editingUser}
        editingUser={editingUser}
      />

      <StudentDetailsModal
        isOpen={showStudentDetailsModal}
        onClose={handleCloseStudentDetails}
        student={selectedStudent}
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