import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
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
  ShieldCheckIcon,
  ArrowDownTrayIcon,
  DocumentTextIcon,
  ExclamationCircleIcon,
  NoSymbolIcon,
  MagnifyingGlassIcon
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
import settingsStyles from '../styles/settings.module.css';
import statsStyles from '../styles/stats.module.css';
import AppointmentDetails from '../components/AppointmentDetails/AppointmentDetails';
import AvailabilityModal from '../components/AvailabilityModal/AvailabilityModal';
import GoogleCalendarEvents from '../components/GoogleCalendarUnavailableSlots/GoogleCalendarUnavailableSlots';
import AdminGeofenceManager from '../components/AdminGeofenceManager/AdminGeofenceManager';
import TabNavigation from '../components/TabNavigation';
import RejectModal from '../components/RejectModal/RejectModal';
import CancelModal from '../components/CancelModal/CancelModal';
import StatisticsCards from '../components/StatisticsCards/StatisticsCards';
import ConflictWarningModal from '../components/ConflictWarningModal/ConflictWarningModal';
import ConfirmModal from '../components/ConfirmModal/ConfirmModal';
import { exportAppointmentsToPDF } from '../utils/pdfExport';
import { formatUserName } from '../utils/formatUserName';
import sectionThemes from '../styles/sectionThemes.module.css';

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [systemAppointments, setSystemAppointments] = useState([]); // Tüm sistem randevuları
  const [adminAppointments, setAdminAppointments] = useState([]); // Sadece admin'e gelen randevular
  const [facultySearchQuery, setFacultySearchQuery] = useState(''); // Öğretim üyeleri arama
  const [studentSearchQuery, setStudentSearchQuery] = useState(''); // Öğrenciler arama
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('users');
  const [appointmentTab, setAppointmentTab] = useState('system'); // 'system' veya 'admin'
  const [facultyStatsTimeFilter, setFacultyStatsTimeFilter] = useState('all'); // all, month, 3months, 6months, year
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
  const [showFirstLoginModal, setShowFirstLoginModal] = useState(false);
  const [firstLoginData, setFirstLoginData] = useState({
    title: '',
    department: ''
  });
  const [firstLoginLoading, setFirstLoginLoading] = useState(false);
  const [firstLoginError, setFirstLoginError] = useState('');
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
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
  const [appointmentTimeout, setAppointmentTimeout] = useState(24); // Default 24 hours
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

  // Google Calendar conflict modal states
  const [showConflictModal, setShowConflictModal] = useState(false);
  const [conflictData, setConflictData] = useState(null);
  const [conflictDismissedAt, setConflictDismissedAt] = useState(null);
  
  // Load acknowledged conflicts from localStorage
  const getAcknowledgedConflicts = () => {
    try {
      const stored = localStorage.getItem(`acknowledgedConflicts_${user?._id || user?.id}`);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error loading acknowledged conflicts:', error);
      return [];
    }
  };
  
  // Save acknowledged conflicts to localStorage
  const saveAcknowledgedConflicts = (conflicts) => {
    try {
      localStorage.setItem(`acknowledgedConflicts_${user?._id || user?.id}`, JSON.stringify(conflicts));
    } catch (error) {
      console.error('Error saving acknowledged conflicts:', error);
    }
  };

  // Real-time notification states
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [lastAppointmentCount, setLastAppointmentCount] = useState(0);

  // Reject Modal State
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectingAppointment, setRejectingAppointment] = useState(null);
  const [rejectLoading, setRejectLoading] = useState(false);

  // Cancel Modal State (for approved appointments - admin as faculty)
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancellingAppointment, setCancellingAppointment] = useState(null);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [appointmentActionLoading, setAppointmentActionLoading] = useState(null); // Store appointment ID that's being processed

  // Department State
  const [departments, setDepartments] = useState([]);
  const [newDepartmentName, setNewDepartmentName] = useState('');
  const [departmentLoading, setDepartmentLoading] = useState(false);

  // Topic Management States
  const [topics, setTopics] = useState([]);
  const [topicsLoading, setTopicsLoading] = useState(false);
  const [editingTopicId, setEditingTopicId] = useState(null);

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
  const userCheckIntervalRef = useRef(null);

  useEffect(() => {
    if (user) {
      // Check if admin needs to complete first login setup
      // Only show first login modal if isFirstLogin is true AND title/department is missing
      // This prevents showing the modal when user already completed first login via /change-password
      if (user.role === 'admin' && user.isFirstLogin === true && (!user.title || !user.department)) {
        // Load departments first for the first login modal
        const loadDepartmentsForFirstLogin = async () => {
          try {
            const departmentsResponse = await apiService.getDepartments();
            if (departmentsResponse.success) {
              setDepartments(departmentsResponse.data || []);
            }
          } catch (error) {
            console.error('Failed to load departments for first login:', error);
          }
        };
        loadDepartmentsForFirstLogin();
        setShowFirstLoginModal(true);
      } else {
        loadDashboardData();
        loadFacultyData();
        loadNotificationsFromStorage(); // Load notifications from localStorage
        startRealTimeUpdates();
      }
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

    // Check for new users every 15 seconds (when users tab is active)
    userCheckIntervalRef.current = setInterval(() => {
      if (activeTab === 'users') {
        refreshUsersList();
      }
    }, 15000);
  };

  const stopRealTimeUpdates = () => {
    if (appointmentCheckIntervalRef.current) {
      clearInterval(appointmentCheckIntervalRef.current);
    }
    if (notificationIntervalRef.current) {
      clearInterval(notificationIntervalRef.current);
    }
    if (userCheckIntervalRef.current) {
      clearInterval(userCheckIntervalRef.current);
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

  // Handle view appointment history
  const handleViewAppointmentHistory = (user) => {
    navigate(`/appointment-history/${user._id}`);
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
      }
    }
  };

  // Lightweight function to refresh only users list
  const refreshUsersList = async () => {
    try {
      const usersResponse = await apiService.getAllUsers();
      const allUsers = usersResponse.data?.users || [];
      setUsers(allUsers);
    } catch (error) {
      console.error('Error refreshing users list:', error);
    }
  };

  const loadDashboardData = async () => {
    try {
      setLoading(true);


      // Request notification permission
      await requestNotificationPermission();

      // Paralel olarak verileri yükle
      const [usersResponse, appointmentsResponse, statsResponse, departmentsResponse, topicsResponse] = await Promise.all([
        apiService.getAllUsers(),
        apiService.getAllAppointments(),
        apiService.getSystemStats(),
        apiService.getDepartments(),
        apiService.get('/topics')
      ]);

      console.log('AdminDashboard: Departments response:', departmentsResponse);
      console.log('AdminDashboard: Topics response:', topicsResponse);

      // Set departments
      if (departmentsResponse.success) {
        setDepartments(departmentsResponse.data || []);
      }

      // Set topics
      if (topicsResponse.success) {
        setTopics(topicsResponse.data || []);
      }

      // Fetch slot duration setting
      try {
        const slotDurationResponse = await apiService.getSetting('slotDuration');
        if (slotDurationResponse.success && slotDurationResponse.data && slotDurationResponse.data.value) {
          setSlotDuration(slotDurationResponse.data.value);
        }
      } catch (error) {
        console.error('Failed to fetch slot duration:', error);
        // Keep default 15 if fetch fails
      }

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

  const handleDeleteUser = (userId) => {
    const user = users.find(u => u._id === userId);
    setUserToDelete(user);
    setShowDeleteConfirmModal(true);
  };

  const confirmDeleteUser = async () => {
    if (!userToDelete) return;

    try {
      await apiService.deleteUser(userToDelete._id);
      
      // Kullanıcı listesini yenile - hem local state hem de server'dan
      const updatedUsers = users.filter(user => user._id !== userToDelete._id);
      setUsers(updatedUsers);
      
      // Server'dan güncel verileri yükle (sadece kullanıcı listesi ve istatistikler)
      try {
        await Promise.all([
          refreshUsersList(),
          apiService.getSystemStats().then(statsResponse => {
            const allStats = statsResponse.data || {};
            setStats(allStats);
          })
        ]);
      } catch (reloadError) {
        console.error('Error reloading data:', reloadError);
        // Hata olsa bile devam et
      }
      
      setShowDeleteConfirmModal(false);
      setUserToDelete(null);
    } catch (error) {
      console.error('User delete error:', error);
      alert('Kullanıcı silinirken hata oluştu');
      setShowDeleteConfirmModal(false);
      setUserToDelete(null);
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

      // Loading state'i hemen kapat
      setFacultyLoading(false);

      if (response && response.success) {
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

        // Kullanıcı listesini ve istatistikleri arka planda yenile (beklemeden)
        refreshUsersList().catch(err => console.error('Error refreshing users:', err));
        apiService.getSystemStats().then(statsResponse => {
          const allStats = statsResponse.data || {};
          setStats(allStats);
        }).catch(err => console.error('Error refreshing stats:', err));

        // Modal otomatik kapanmasın - kullanıcı kendisi kapatsın
      } else {
        // Response başarısız olduğunda
        const errorMessage = response?.message || 'Öğretim üyesi oluşturulurken hata oluştu';
        setFacultyError(errorMessage);
      }
    } catch (error) {
      console.error('Faculty creation error:', error);
      setFacultyError(error.message || error.response?.data?.message || 'Öğretim üyesi oluşturulurken hata oluştu');
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
      const conflicts = [];

      events.forEach(event => {
        const startDate = new Date(event.start.dateTime || event.start.date);
        const dayName = startDate.toLocaleDateString('en-US', { weekday: 'long' });

        if (!eventsByDay[dayName]) {
          eventsByDay[dayName] = [];
        }
        eventsByDay[dayName].push(event);
      });

      // Ensure a 7-day baseline even if current availability is empty
      const baseline = (availability && availability.length > 0) ? availability : initializeAvailability();

      // Update availability based on Google Calendar events
      const updatedAvailability = baseline.map(day => {
        const dayEvents = eventsByDay[day.day] || [];

        if (dayEvents.length > 0) {
          // Mark time slots as unavailable if there are events
          const updatedTimeSlots = day.timeSlots.map(slot => {
            const slotStart = new Date(`2000-01-01T${slot.start}`);
            const slotEnd = new Date(`2000-01-01T${slot.end}`);

            // Check if any event overlaps with this time slot
            // Filter out system-created appointments (summary starts with "Randevu:")
            const conflictingEvents = dayEvents.filter(event => {
              // Skip system-created appointments
              if (event.summary && event.summary.startsWith('Randevu:')) {
                return false;
              }
              
              const eventStart = new Date(event.start.dateTime || event.start.date);
              const eventEnd = new Date(event.end.dateTime || event.end.date);

              const eventStartTime = new Date(`2000-01-01T${eventStart.toTimeString().slice(0, 5)}`);
              const eventEndTime = new Date(`2000-01-01T${eventEnd.toTimeString().slice(0, 5)}`);

              return (slotStart < eventEndTime && slotEnd > eventStartTime);
            });

            // If there's a conflict and slot was previously available, add to conflicts list
            if (conflictingEvents.length > 0 && slot.isAvailable !== false) {
              const dayNameTR = {
                'Monday': 'Pazartesi', 'Tuesday': 'Salı', 'Wednesday': 'Çarşamba',
                'Thursday': 'Perşembe', 'Friday': 'Cuma', 'Saturday': 'Cumartesi', 'Sunday': 'Pazar'
              };
              const acknowledgedConflicts = getAcknowledgedConflicts();
              
              conflictingEvents.forEach(event => {
                const eventStart = new Date(event.start.dateTime || event.start.date);
                const eventEnd = new Date(event.end.dateTime || event.end.date);
                
                // Create a unique conflict identifier
                const conflictId = `${day.day}_${slot.start}_${slot.end}_${event.summary || event.id || ''}`;
                
                // Skip if this conflict was already acknowledged
                if (acknowledgedConflicts.includes(conflictId)) {
                  return;
                }
                
                conflicts.push({
                  id: conflictId,
                  day: dayNameTR[day.day] || day.day,
                  slot: `${slot.start} - ${slot.end}`,
                  eventName: event.summary || 'Google Calendar Etkinliği',
                  eventTime: `${eventStart.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })} - ${eventEnd.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}`
                });
              });
            }

            return {
              ...slot,
              isAvailable: conflictingEvents.length === 0 ? slot.isAvailable : false
            };
          });

          return {
            ...day,
            timeSlots: updatedTimeSlots
          };
        }

        return day;
      });

      // If there are conflicts, show warning modal (only if not recently dismissed)
      if (conflicts.length > 0) {
        const now = Date.now();
        const dismissedAt = conflictDismissedAt;
        const fiveMinutes = 5 * 60 * 1000; // 5 minutes in ms
        
        // Show modal if never dismissed or dismissed more than 5 minutes ago
        if (!dismissedAt || (now - dismissedAt) > fiveMinutes) {
          setConflictData(conflicts);
          setShowConflictModal(true);
        }
      }

      console.log('Google Calendar events processed, conflicts found:', conflicts.length);
    } catch (error) {
      console.error('Error processing Google Calendar events:', error);
    }
  };

  // Handle conflict modal dismiss (just close, don't update anything)
  const handleConflictDismiss = () => {
    setShowConflictModal(false);
    setConflictDismissedAt(Date.now()); // Remember when dismissed to avoid spam
  };

  // Handle acknowledging conflicts (mark as acknowledged, don't show again)
  const handleConflictAcknowledge = () => {
    if (!conflictData || conflictData.length === 0) return;
    
    const acknowledgedConflicts = getAcknowledgedConflicts();
    const newAcknowledgedConflicts = [...acknowledgedConflicts];
    
    // Add all current conflicts to acknowledged list
    conflictData.forEach(conflict => {
      if (conflict.id && !newAcknowledgedConflicts.includes(conflict.id)) {
        newAcknowledgedConflicts.push(conflict.id);
      }
    });
    
    saveAcknowledgedConflicts(newAcknowledgedConflicts);
    setShowConflictModal(false);
    setConflictDismissedAt(Date.now());
  };

  // Handle going to availability settings to fix conflicts
  const handleGoToAvailability = () => {
    setShowConflictModal(false);
    setActiveTab('availability');
    openAvailabilityModal();
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

        // Modal otomatik kapanmasın - kullanıcı kendisi kapatsın
      }
    } catch (error) {
      console.error('Profile update error:', error);
      setProfileError(error.message || 'Profil güncellenirken hata oluştu');
    } finally {
      setProfileLoading(false);
    }
  };

  const handleFirstLoginSubmit = async (e) => {
    e.preventDefault();
    setFirstLoginLoading(true);
    setFirstLoginError('');

    if (!firstLoginData.title || !firstLoginData.department) {
      setFirstLoginError('Lütfen tüm alanları doldurun');
      setFirstLoginLoading(false);
      return;
    }

    try {
      const response = await apiService.updateFacultyProfile({
        title: firstLoginData.title,
        department: firstLoginData.department
      });

      if (response.success) {
        // Update local user data
        const updatedUser = { ...user, title: firstLoginData.title, department: firstLoginData.department };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        
        // Close first login modal
        setShowFirstLoginModal(false);
        
        // Redirect to change password page instead of showing modal
        // This prevents duplicate password modals
        navigate('/change-password');
      }
    } catch (error) {
      console.error('First login setup error:', error);
      setFirstLoginError(error.message || 'Profil güncellenirken hata oluştu');
    } finally {
      setFirstLoginLoading(false);
    }
  };

  const handleFirstLoginInputChange = (e) => {
    const { name, value } = e.target;
    setFirstLoginData(prev => ({
      ...prev,
      [name]: value
    }));
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

        // Update user data to mark first login as complete
        const updatedUser = { ...user, isFirstLogin: false };
        localStorage.setItem('user', JSON.stringify(updatedUser));

        // Close modal after 2 seconds and reload
        setTimeout(() => {
          setShowPasswordModal(false);
          setPasswordSuccess('');
          window.location.reload(); // Refresh to update header and remove first login modal
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
    // Set loading state for the specific appointment
    setAppointmentActionLoading(appointmentId);
    
    try {
      let response;

      if (action === 'approved') {
        response = await apiService.approveAppointment(appointmentId);
      } else if (action === 'rejected') {
        const rejectReason = reason || prompt('Red nedeni:');
        if (rejectReason) {
          response = await apiService.rejectAppointment(appointmentId, rejectReason);
        } else {
          setAppointmentActionLoading(null);
          return;
        }
      } else if (action === 'cancelled') {
        response = await apiService.cancelAppointment(appointmentId);
      } else {
        response = await apiService.updateAppointment(appointmentId, { status: action });
      }

      // Loading state'i hemen kapat - kullanıcı bekletilmesin
      setAppointmentActionLoading(null);

      if (response.success) {
        // Show success notification immediately
        const actionText = action === 'approved' ? 'onaylandı' : action === 'rejected' ? 'reddedildi' : 'iptal edildi';
        showActionNotification(`Randevu başarıyla ${actionText}!`);
        
        // Close appointment details modal if open
        if (showAppointmentDetails && selectedAppointment?._id === appointmentId) {
          setShowAppointmentDetails(false);
          setSelectedAppointment(null);
        }

        // Reload appointments in background (don't await)
        apiService.getAllAppointments().then(allAppointmentsResponse => {
          const allAppointments = allAppointmentsResponse.data?.appointments || allAppointmentsResponse.data || [];
          const ownAppointments = allAppointments.filter(isOwnAppointment);
          const otherAppointments = allAppointments.filter(a => !isOwnAppointment(a));

          const sortedAllAppointments = [...allAppointments].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          const sortedOwn = [...ownAppointments].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          const sortedOthers = [...otherAppointments].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

          setAppointments(sortedAllAppointments);
          setSystemAppointments(sortedOthers);
          setAdminAppointments(sortedOwn);
        }).catch(err => console.error('Error refreshing appointments:', err));

        // Refresh stats in background
        apiService.getSystemStats().then(statsResponse => {
          const allStats = statsResponse.data || {};
          setStats(allStats);
        }).catch(err => console.error('Error refreshing stats:', err));
      }
    } catch (error) {
      console.error('Appointment action error:', error);
      alert('İşlem sırasında hata oluştu: ' + error.message);
      setAppointmentActionLoading(null);
    }
  };

  const handleCancelAppointment = async (appointment) => {
    if (window.confirm('Bu randevuyu iptal etmek istediğinizden emin misiniz?')) {
      try {
        const response = await apiService.cancelAppointment(appointment._id);
        if (response.success) {
          // Show success notification immediately
          showActionNotification('Randevu başarıyla iptal edildi!');

          // Reload appointments and stats in background
          Promise.all([
            apiService.getAllAppointments(),
            apiService.getFacultyAppointments(),
            apiService.getSystemStats()
          ]).then(([allAppointmentsResponse, facultyAppointmentsResponse, statsResponse]) => {
            const allAppointments = allAppointmentsResponse.data?.appointments || allAppointmentsResponse.data || [];
            const adminAppts = facultyAppointmentsResponse.data?.appointments || facultyAppointmentsResponse.data || [];

            const sortedAllAppointments = allAppointments.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            const sortedAdminAppointments = adminAppts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

            setAppointments(sortedAllAppointments);
            setSystemAppointments(sortedAllAppointments);
            setAdminAppointments(sortedAdminAppointments);

            if (statsResponse.success) {
              const allStats = statsResponse.data || {};
              setStats(allStats);
            }
          }).catch(err => console.error('Error refreshing after cancel:', err));
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
    // If reason is provided directly, use it
    if (reason) {
      handleAppointmentAction(appointmentId, 'rejected', reason);
      return;
    }
    // Otherwise, show the reject modal
    const allAppts = [...systemAppointments, ...adminAppointments];
    const appointment = allAppts.find(a => a._id === appointmentId);
    setRejectingAppointment(appointment);
    setShowRejectModal(true);
  };

  const handleRejectConfirm = async (reason) => {
    if (!rejectingAppointment) return;

    setRejectLoading(true);
    // Don't await - let it run in background
    handleAppointmentAction(rejectingAppointment._id, 'rejected', reason);
    setRejectLoading(false);
    setShowRejectModal(false);
    setRejectingAppointment(null);
  };

  // Handle cancel approved appointment (admin as faculty - own appointments)
  const handleCancelApprovedAppointment = (appointmentId) => {
    const appointment = adminAppointments.find(a => a._id === appointmentId);
    if (appointment && appointment.status === 'approved') {
      // Check if appointment is in the future (date + time)
      const now = new Date();
      const dateObj = new Date(appointment.date);
      const year = dateObj.getFullYear();
      const month = dateObj.getMonth();
      const day = dateObj.getDate();
      const [hours, minutes] = appointment.startTime.split(':').map(Number);
      const appointmentDateTime = new Date(year, month, day, hours, minutes, 0, 0);

      if (appointmentDateTime <= now) {
        alert('Geçmiş randevular iptal edilemez.');
        return;
      }

      setCancellingAppointment(appointment);
      setShowCancelModal(true);
    }
  };

  const handleCancelConfirm = async (reason) => {
    if (!cancellingAppointment) return;

    setCancelLoading(true);
    try {
      const response = await apiService.cancelAdminAppointment(cancellingAppointment._id, reason);
      
      // Close modal immediately
      setCancelLoading(false);
      setShowCancelModal(false);
      setCancellingAppointment(null);

      if (response.success) {
        // Show success notification immediately
        showActionNotification('Onaylanmış randevu başarıyla iptal edildi ve öğrenciye bildirim gönderildi!');

        // Refresh appointments and stats in background
        Promise.all([
          apiService.getAllAppointments(),
          apiService.getSystemStats()
        ]).then(([allAppointmentsResponse, statsResponse]) => {
          const allAppointments = allAppointmentsResponse.data?.appointments || allAppointmentsResponse.data || [];
          const ownAppointments = allAppointments.filter(isOwnAppointment);
          const otherAppointments = allAppointments.filter(a => !isOwnAppointment(a));

          setAppointments(allAppointments.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
          setSystemAppointments(otherAppointments.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
          setAdminAppointments(ownAppointments.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));

          if (statsResponse.success) {
            const allStats = statsResponse.data || {};
            setStats(allStats);
          }
        }).catch(err => console.error('Error refreshing after cancel:', err));
      }
    } catch (error) {
      console.error('Cancel appointment error:', error);
      alert('Randevu iptal edilirken hata oluştu: ' + error.message);
      setCancelLoading(false);
      setShowCancelModal(false);
      setCancellingAppointment(null);
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

      // Loading state'i hemen kapat
      setFacultyLoading(false);

      if (response && response.success) {
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

        // Kullanıcı listesini ve istatistikleri arka planda yenile (beklemeden)
        refreshUsersList().catch(err => console.error('Error refreshing users:', err));
        apiService.getSystemStats().then(statsResponse => {
          const allStats = statsResponse.data || {};
          setStats(allStats);
        }).catch(err => console.error('Error refreshing stats:', err));

        // Modal otomatik kapanmasın - kullanıcı kendisi kapatsın
      } else {
        // Response başarısız olduğunda
        const errorMessage = response?.message || 'Öğretim üyesi güncellenirken hata oluştu';
        setFacultyError(errorMessage);
      }
    } catch (error) {
      console.error('Faculty update error:', error);
      setFacultyError(error.message || error.response?.data?.message || 'Öğretim üyesi güncellenirken hata oluştu');
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


  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gray-50 flex flex-col ${activeTab === 'users' ? sectionThemes.themeUsers :
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



      <div className="dashboard-main max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
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
              },
              {
                id: 'settings',
                label: 'Ayarlar',
                icon: <CogIcon className="w-5 h-5" />
              }
            ]}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />

          <div className="p-6">
            {activeTab === 'users' && (
              <div className="space-y-8">
                {/* Öğretim Üyeleri Bölümü */}
                <div>
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-6">
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-1">Öğretim Üyeleri</h3>
                      <p className="text-sm text-gray-500">Öğretim üyelerini ve yöneticileri yönetin</p>
                    </div>
                    <button
                      onClick={() => setShowAddUserModal(true)}
                      className="btn-primary whitespace-nowrap"
                    >
                      <PlusIcon className="w-4 h-4 mr-2" />
                      Öğretim Üyesi Ekle
                    </button>
                  </div>
                  
                  {/* Arama Kutusu */}
                  <div className="mb-4">
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        value={facultySearchQuery}
                        onChange={(e) => setFacultySearchQuery(e.target.value)}
                        placeholder="İsim, e-posta veya bölüm ile ara..."
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      />
                    </div>
                  </div>

                  <FacultyList
                    users={users.filter(user => {
                      const isFacultyOrAdmin = user.role === 'faculty' || user.role === 'admin';
                      if (!isFacultyOrAdmin) return false;
                      
                      if (!facultySearchQuery.trim()) return true;
                      
                      const query = facultySearchQuery.toLowerCase();
                      return (
                        (user.name && user.name.toLowerCase().includes(query)) ||
                        (user.email && user.email.toLowerCase().includes(query)) ||
                        (user.department && user.department.toLowerCase().includes(query)) ||
                        (user.title && user.title.toLowerCase().includes(query)) ||
                        (user.phone && user.phone.includes(query))
                      );
                    })}
                    onEdit={handleEditUser}
                    onDelete={handleDeleteUser}
                    onViewStudent={handleViewStudent}
                    onViewAppointmentHistory={handleViewAppointmentHistory}
                    getRoleBadge={getRoleBadge}
                    getStatusBadge={getStatusBadge}
                  />
                </div>

                {/* Öğrenciler Bölümü */}
                <div>
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-6">
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-1">Öğrenciler</h3>
                      <p className="text-sm text-gray-500">Kayıtlı öğrencileri görüntüleyin</p>
                    </div>
                  </div>
                  
                  {/* Arama Kutusu */}
                  <div className="mb-4">
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        value={studentSearchQuery}
                        onChange={(e) => setStudentSearchQuery(e.target.value)}
                        placeholder="İsim, e-posta, öğrenci numarası veya bölüm ile ara..."
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      />
                    </div>
                  </div>

                  <FacultyList
                    users={users.filter(user => {
                      const isStudent = user.role === 'student';
                      if (!isStudent) return false;
                      
                      if (!studentSearchQuery.trim()) return true;
                      
                      const query = studentSearchQuery.toLowerCase();
                      return (
                        (user.name && user.name.toLowerCase().includes(query)) ||
                        (user.email && user.email.toLowerCase().includes(query)) ||
                        (user.studentNumber && user.studentNumber.toString().includes(query)) ||
                        (user.department && user.department.toLowerCase().includes(query)) ||
                        (user.phone && user.phone.includes(query))
                      );
                    })}
                    onEdit={handleEditUser}
                    onDelete={handleDeleteUser}
                    onViewStudent={handleViewStudent}
                    onViewAppointmentHistory={handleViewAppointmentHistory}
                    getRoleBadge={getRoleBadge}
                    getStatusBadge={getStatusBadge}
                  />
                </div>
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
                      showHistoryButton={true}
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
                      onCancelApproved={handleCancelApprovedAppointment}
                      onDetails={handleAppointmentDetails}
                      showCancel={false}
                      showActions={true}
                      showHistoryButton={true}
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
                      className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${viewMode === 'grid'
                        ? 'bg-white text-blue-600 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                        }`}
                    >
                      Kart Görünümü
                    </button>
                    <button
                      onClick={() => setViewMode('table')}
                      className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${viewMode === 'table'
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
                  <div className="w-full bg-white rounded-lg shadow overflow-hidden border border-gray-200">
                    <table className="w-full table-fixed divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="w-[15%] px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                            Gün
                          </th>
                          <th className="w-[10%] px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                            Durum
                          </th>
                          <th className="w-[55%] px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                            Zaman Aralıkları
                          </th>
                          <th className="w-[20%] px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Müsait Aralık
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {availability.map((day, index) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 border-r border-gray-200">
                              {getDayDisplayName(day.day)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap border-r border-gray-200">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${day.isActive
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
                                }`}>
                                {day.isActive ? 'Aktif' : 'Pasif'}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-900 border-r border-gray-200">
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



            {/* Google Calendar Unavailable Slots Section - show under availability */}
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
              <div className={statsStyles.statsContainer}>
                {/* Overall Statistics */}
                <div style={{ marginBottom: '32px' }}>
                  <StatisticsCards
                    appointments={appointments}
                    title="Genel Randevu İstatistikleri"
                    onExportPDF={async () => await exportAppointmentsToPDF(appointments, 'Tüm Sistem Randevuları', topics)}
                  />
                </div>

                <div className={statsStyles.header}>
                  <h3 className={statsStyles.title}>
                    <ChartBarIcon className={statsStyles.icon} />
                    Öğretim Üyesi İstatistikleri
                  </h3>
                  <div className={statsStyles.filterContainer}>
                    <label className={statsStyles.filterLabel}>Zaman Aralığı:</label>
                    <select
                      value={facultyStatsTimeFilter}
                      onChange={(e) => setFacultyStatsTimeFilter(e.target.value)}
                      className={statsStyles.filterSelect}
                    >
                      <option value="month">Bu Ay</option>
                      <option value="3months">3 Ay</option>
                      <option value="6months">6 Ay</option>
                      <option value="year">1 Yıl</option>
                      <option value="all">Tüm Zamanlar</option>
                    </select>
                  </div>
                </div>

                <div className={statsStyles.cardsGrid}>
                  {users.filter(u => u.role === 'faculty' || u.role === 'admin').map((faculty) => {
                    // Filter by faculty
                    // Format faculty name with title for comparison
                    const facultyNameWithTitle = faculty.title ? `${faculty.title} ${faculty.name}` : faculty.name;
                    let facultyAppts = appointments.filter(a =>
                      a.facultyId === faculty._id ||
                      (a.facultyId && typeof a.facultyId === 'object' && a.facultyId._id === faculty._id) ||
                      a.facultyName === faculty.name ||
                      a.facultyName === facultyNameWithTitle
                    );

                    // Apply time filter
                    const now = new Date();
                    let filterLabel = 'Tüm Zamanlar';
                    if (facultyStatsTimeFilter !== 'all') {
                      let daysToFilter = 30;
                      if (facultyStatsTimeFilter === 'month') {
                        daysToFilter = 30;
                        filterLabel = 'Son 30 Gün';
                      } else if (facultyStatsTimeFilter === '3months') {
                        daysToFilter = 90;
                        filterLabel = 'Son 3 Ay';
                      } else if (facultyStatsTimeFilter === '6months') {
                        daysToFilter = 180;
                        filterLabel = 'Son 6 Ay';
                      } else if (facultyStatsTimeFilter === 'year') {
                        daysToFilter = 365;
                        filterLabel = 'Son 1 Yıl';
                      }
                      const filterDate = new Date(now.getTime() - daysToFilter * 24 * 60 * 60 * 1000);
                      facultyAppts = facultyAppts.filter(a => new Date(a.createdAt || a.date) >= filterDate);
                    }

                    const stats = {
                      total: facultyAppts.length,
                      approved: facultyAppts.filter(a => a.status === 'approved').length,
                      rejected: facultyAppts.filter(a => a.status === 'rejected').length,
                      pending: facultyAppts.filter(a => a.status === 'pending').length,
                      noResponse: facultyAppts.filter(a => a.status === 'no_response').length,
                      cancelled: facultyAppts.filter(a => a.status === 'cancelled').length
                    };

                    // Calculate percentages
                    const getPercent = (val) => stats.total > 0 ? Math.round((val / stats.total) * 100) : 0;

                    return (
                      <div key={faculty._id} className={statsStyles.card}>
                        <div className={statsStyles.cardHeader}>
                          {faculty.picture ? (
                            <img
                              src={faculty.picture}
                              alt={faculty.name}
                              className={statsStyles.avatar}
                              style={{ objectFit: 'cover' }}
                            />
                          ) : (
                            <div className={statsStyles.avatar}>
                              {faculty.name ? faculty.name.charAt(0).toUpperCase() : 'U'}
                            </div>
                          )}
                          <div className={statsStyles.facultyInfo}>
                            <h4 className={statsStyles.facultyName}>
                              {faculty.title ? `${faculty.title} ${faculty.name}` : faculty.name}
                            </h4>
                            <p className={statsStyles.facultyDept}>{faculty.department || 'Bölüm Yok'}</p>
                          </div>
                        </div>

                        <div className={statsStyles.filterBadge}>
                          {filterLabel}
                        </div>

                        <div className={statsStyles.statsList}>
                          <div className={statsStyles.statItem}>
                            <span className={statsStyles.statLabel}>Toplam Randevu</span>
                            <span className={statsStyles.statValue}>{stats.total}</span>
                          </div>
                          <div className={statsStyles.statItem}>
                            <span className={`${statsStyles.statLabel} ${statsStyles.approved}`}>
                              <CheckCircleIcon className={statsStyles.iconSmall} /> Onaylanan
                            </span>
                            <span className={`${statsStyles.statValue} ${statsStyles.approved}`}>
                              {stats.approved} <span className={statsStyles.percent}>(%{getPercent(stats.approved)})</span>
                            </span>
                          </div>
                          <div className={statsStyles.statItem}>
                            <span className={`${statsStyles.statLabel} ${statsStyles.rejected}`}>
                              <XCircleIcon className={statsStyles.iconSmall} /> Reddedilen
                            </span>
                            <span className={`${statsStyles.statValue} ${statsStyles.rejected}`}>
                              {stats.rejected} <span className={statsStyles.percent}>(%{getPercent(stats.rejected)})</span>
                            </span>
                          </div>
                          <div className={statsStyles.statItem}>
                            <span className={`${statsStyles.statLabel} ${statsStyles.pending}`}>
                              <ClockIcon className={statsStyles.iconSmall} /> Beklemede
                            </span>
                            <span className={`${statsStyles.statValue} ${statsStyles.pending}`}>
                              {stats.pending} <span className={statsStyles.percent}>(%{getPercent(stats.pending)})</span>
                            </span>
                          </div>
                          <div className={statsStyles.statItem}>
                            <span className={`${statsStyles.statLabel} ${statsStyles.noResponse}`}>
                              <ExclamationCircleIcon className={statsStyles.iconSmall} /> Cevaplanmadı
                            </span>
                            <span className={`${statsStyles.statValue} ${statsStyles.noResponse}`}>
                              {stats.noResponse} <span className={statsStyles.percent}>(%{getPercent(stats.noResponse)})</span>
                            </span>
                          </div>
                          <div className={statsStyles.statItem}>
                            <span className={`${statsStyles.statLabel} ${statsStyles.cancelled}`}>
                              <NoSymbolIcon className={statsStyles.iconSmall} /> İptal Edilen
                            </span>
                            <span className={`${statsStyles.statValue} ${statsStyles.cancelled}`}>
                              {stats.cancelled} <span className={statsStyles.percent}>(%{getPercent(stats.cancelled)})</span>
                            </span>
                          </div>
                        </div>

                        <div className={statsStyles.cardActions}>
                          <button
                            onClick={() => handleViewAppointmentHistory(faculty)}
                            className={statsStyles.historyButton}
                          >
                            <ClockIcon className="w-4 h-4" />
                            Randevu Geçmişi
                          </button>
                          <button
                            onClick={async () => await exportAppointmentsToPDF(facultyAppts, `${formatUserName(faculty)} - Randevu Raporu (${filterLabel})`, topics)}
                            disabled={stats.total === 0}
                            className={statsStyles.pdfButton}
                            style={stats.total === 0 ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
                          >
                            <ArrowDownTrayIcon className="w-4 h-4" />
                            PDF İndir
                          </button>
                        </div>
                      </div>
                    );
                  })}

                  {users.filter(u => u.role === 'faculty').length === 0 && (
                    <div className={statsStyles.emptyState}>
                      Henüz sistemde kayıtlı öğretim üyesi bulunmamaktadır.
                    </div>
                  )}
                </div>
              </div>
            )}

            {users.filter(u => u.role === 'faculty').length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <AcademicCapIcon className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                Henüz öğretim üyesi bulunmamaktadır.
              </div>
            )}
          </div>
        </div>


        {activeTab === 'settings' && (
          <div className={settingsStyles.settingsContainer}>
            {/* Slot Duration Settings */}
            <div className={settingsStyles.settingsCard}>
              <div className={settingsStyles.cardHeader}>
                <h4 className={settingsStyles.cardTitle}>
                  <ClockIcon className={settingsStyles.cardIcon} />
                  Randevu Ayarları
                </h4>
              </div>
              <div className={settingsStyles.settingRow}>
                <label className={settingsStyles.settingLabel}>
                  Varsayılan Randevu Süresi
                </label>
                <div className={settingsStyles.settingControl}>
                  <select
                    value={slotDuration}
                    onChange={(e) => setSlotDuration(parseInt(e.target.value))}
                    className={settingsStyles.select}
                  >
                    <option value={10}>10 dakika</option>
                    <option value={15}>15 dakika</option>
                    <option value={20}>20 dakika</option>
                    <option value={30}>30 dakika</option>
                    <option value={45}>45 dakika</option>
                    <option value={60}>60 dakika</option>
                  </select>
                  <button
                    onClick={async () => {
                      try {
                        const response = await apiService.updateSetting('slotDuration', slotDuration);
                        if (response.success) {
                          alert('Randevu süresi ayarı kaydedildi: ' + slotDuration + ' dakika');
                        }
                      } catch (error) {
                        alert('Ayar kaydedilirken hata oluştu: ' + error.message);
                      }
                    }}
                    className={settingsStyles.saveButton}
                  >
                    Kaydet
                  </button>
                </div>
              </div>

              {/* Appointment Timeout Setting */}
              <div className={settingsStyles.settingRow} style={{ marginTop: '24px', paddingTop: '24px', borderTop: '1px solid #f3f4f6' }}>
                <label className={settingsStyles.settingLabel}>
                  Maksimum Bekleme Süresi
                  <span style={{ display: 'block', fontSize: '12px', color: '#6b7280', fontWeight: 'normal', marginTop: '4px' }}>
                    Öğretim üyesi bu süre içinde cevap vermezse randevu otomatik olarak "Cevaplanmadı" durumuna düşer.
                  </span>
                </label>
                <div className={settingsStyles.settingControl}>
                  <select
                    value={appointmentTimeout}
                    onChange={(e) => setAppointmentTimeout(parseInt(e.target.value))}
                    className={settingsStyles.select}
                  >
                    <option value={12}>12 Saat</option>
                    <option value={24}>24 Saat (1 Gün)</option>
                    <option value={48}>48 Saat (2 Gün)</option>
                    <option value={72}>72 Saat (3 Gün)</option>
                    <option value={168}>1 Hafta</option>
                  </select>
                  <button
                    onClick={async () => {
                      try {
                        const response = await apiService.updateSetting('appointmentTimeoutHours', appointmentTimeout);
                        if (response.success) {
                          alert('Maksimum bekleme süresi ayarı kaydedildi: ' + appointmentTimeout + ' saat');
                        }
                      } catch (error) {
                        alert('Ayar kaydedilirken hata oluştu: ' + error.message);
                      }
                    }}
                    className={settingsStyles.saveButton}
                  >
                    Kaydet
                  </button>
                </div>
              </div>
            </div>

            {/* Department Management */}
            <div className={settingsStyles.settingsCard}>
              <div className={settingsStyles.cardHeader}>
                <h4 className={settingsStyles.cardTitle}>
                  <AcademicCapIcon className={settingsStyles.cardIcon} />
                  Bölüm Yönetimi
                </h4>
              </div>

              {/* Add New Department */}
              <div className={settingsStyles.addDepartmentRow}>
                <input
                  type="text"
                  value={newDepartmentName}
                  onChange={(e) => setNewDepartmentName(e.target.value)}
                  placeholder="Yeni bölüm adı..."
                  className={settingsStyles.departmentInput}
                />
                <button
                  onClick={async () => {
                    if (!newDepartmentName.trim()) {
                      alert('Bölüm adı gereklidir');
                      return;
                    }
                    setDepartmentLoading(true);
                    try {
                      const response = await apiService.addDepartment(newDepartmentName.trim());
                      if (response.success) {
                        setDepartments([...departments, response.data]);
                        setNewDepartmentName('');
                        alert('Bölüm başarıyla eklendi');
                      }
                    } catch (error) {
                      alert(error.message || 'Bölüm eklenirken hata oluştu');
                    } finally {
                      setDepartmentLoading(false);
                    }
                  }}
                  disabled={departmentLoading || !newDepartmentName.trim()}
                  className={settingsStyles.addButton}
                >
                  <PlusIcon className={settingsStyles.addButtonIcon} />
                  Ekle
                </button>
              </div>

              {/* Department List */}
              <div className={settingsStyles.tableContainer}>
                <table className={settingsStyles.table}>
                  <thead className={settingsStyles.tableHeader}>
                    <tr className={settingsStyles.tableHeaderRow}>
                      <th className={settingsStyles.tableHeaderCell}>Bölüm Adı</th>
                      <th className={settingsStyles.tableHeaderCell}>Öğretim Üyesi</th>
                      <th className={settingsStyles.tableHeaderCell}>Öğrenci</th>
                      <th className={settingsStyles.tableHeaderCell} style={{ textAlign: 'right' }}>İşlemler</th>
                    </tr>
                  </thead>
                  <tbody className={settingsStyles.tableBody}>
                    {departments.map((dept) => (
                      <tr key={dept._id} className={settingsStyles.tableRow}>
                        <td className={settingsStyles.tableCell} data-label="Bölüm Adı">{dept.name}</td>
                        <td className={settingsStyles.tableCellSecondary} data-label="Öğretim Üyesi">
                          {users.filter(u => u.role === 'faculty' && u.department === dept.name).length}
                        </td>
                        <td className={settingsStyles.tableCellSecondary} data-label="Öğrenci">
                          {users.filter(u => u.role === 'student' && u.department === dept.name).length}
                        </td>
                        <td className={settingsStyles.tableCellSecondary} data-label="İşlemler" style={{ textAlign: 'right' }}>
                          <button
                            onClick={async () => {
                              if (window.confirm(`"${dept.name}" bölümünü silmek istediğinizden emin misiniz?`)) {
                                try {
                                  const response = await apiService.deleteDepartment(dept._id);
                                  if (response.success) {
                                    setDepartments(departments.filter(d => d._id !== dept._id));
                                    alert('Bölüm başarıyla silindi');
                                  }
                                } catch (error) {
                                  alert(error.message || 'Bölüm silinirken hata oluştu');
                                }
                              }
                            }}
                            className={settingsStyles.deleteButton}
                          >
                            <TrashIcon className={settingsStyles.deleteIcon} />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {departments.length === 0 && (
                      <tr>
                        <td colSpan={4} className={settingsStyles.emptyState}>
                          Henüz kayıtlı bölüm bulunmamaktadır.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Topic Management */}
            <div className={settingsStyles.settingsCard}>
              <div className={settingsStyles.cardHeader}>
                <h4 className={settingsStyles.cardTitle}>
                  <DocumentTextIcon className={settingsStyles.cardIcon} />
                  Görüşme Konuları Yönetimi
                </h4>
              </div>

              {/* Add New Topic */}
              <div className={settingsStyles.topicInputRow}>
                <div className={settingsStyles.topicInputWrapper}>
                  <input
                    type="text"
                    placeholder="Yeni konu adı..."
                    className={settingsStyles.departmentInput}
                    id="newTopicName"
                  />
                </div>
                <label className={settingsStyles.topicCheckboxLabel}>
                  <input
                    type="checkbox"
                    id="newTopicAdvisorOnly"
                    className={settingsStyles.topicCheckbox}
                  />
                  Danışmana özel
                </label>
                <button
                  onClick={async () => {
                    const nameInput = document.getElementById('newTopicName');
                    const advisorOnlyCheckbox = document.getElementById('newTopicAdvisorOnly');
                    const name = nameInput.value.trim();
                    const isAdvisorOnly = advisorOnlyCheckbox.checked;

                    if (!name) {
                      alert('Konu adı gereklidir');
                      return;
                    }

                    setTopicsLoading(true);
                    try {
                      const response = await apiService.post('/topics', {
                        name,
                        isAdvisorOnly
                      });

                      if (response.success) {
                        nameInput.value = '';
                        advisorOnlyCheckbox.checked = false;
                        // Refresh topics list
                        const topicsResponse = await apiService.get('/topics');
                        if (topicsResponse.success) {
                          setTopics(topicsResponse.data);
                        }
                      }
                    } catch (error) {
                      alert(error.message || 'Konu eklenirken hata oluştu');
                    } finally {
                      setTopicsLoading(false);
                    }
                  }}
                  disabled={topicsLoading}
                  className={settingsStyles.addButton}
                >
                  <PlusIcon className={settingsStyles.addButtonIcon} />
                  Ekle
                </button>
              </div>

              {/* Topics List Table */}
              <div className={settingsStyles.tableContainer}>
                <table className={settingsStyles.table}>
                  <thead className={settingsStyles.tableHeader}>
                    <tr className={settingsStyles.tableHeaderRow}>
                      <th className={settingsStyles.tableHeaderCell}>Konu Adı</th>
                      <th className={settingsStyles.tableHeaderCell} style={{ textAlign: 'center', width: '140px' }}>Danışmana Özel</th>
                      <th className={settingsStyles.tableHeaderCell} style={{ textAlign: 'center', width: '100px' }}>İşlemler</th>
                    </tr>
                  </thead>
                  <tbody className={settingsStyles.tableBody}>
                    {topics.map((topic, index) => (
                      <tr key={topic._id} className={settingsStyles.tableRow}>
                        <td className={settingsStyles.tableCell} data-label="Konu Adı">
                          {editingTopicId === topic._id ? (
                            <input
                              type="text"
                              defaultValue={topic.name}
                              id={`edit-name-${topic._id}`}
                              className={settingsStyles.topicEditInput}
                            />
                          ) : (
                            topic.name
                          )}
                        </td>
                        <td className={settingsStyles.tableCellSecondary} data-label="Danışmana Özel" style={{ textAlign: 'center' }}>
                          <input
                            type="checkbox"
                            checked={topic.isAdvisorOnly || false}
                            onChange={async (e) => {
                              const newValue = e.target.checked;
                              try {
                                const response = await apiService.put(`/topics/${topic._id}`, {
                                  isAdvisorOnly: newValue
                                });
                                if (response.success) {
                                  // Update local state
                                  setTopics(topics.map(t =>
                                    t._id === topic._id ? { ...t, isAdvisorOnly: newValue } : t
                                  ));
                                }
                              } catch (error) {
                                alert('Güncelleme hatası: ' + error.message);
                                e.target.checked = !newValue; // Revert
                              }
                            }}
                            disabled={editingTopicId === topic._id}
                            className={settingsStyles.topicCheckbox}
                            style={{
                              cursor: editingTopicId === topic._id ? 'not-allowed' : 'pointer'
                            }}
                          />
                        </td>
                        <td className={settingsStyles.tableCellSecondary} data-label="İşlemler" style={{ textAlign: 'center' }}>
                          {editingTopicId === topic._id ? (
                            <div className={settingsStyles.editButtonGroup}>
                              <button
                                onClick={async () => {
                                  const nameInput = document.getElementById(`edit-name-${topic._id}`);
                                  const newName = nameInput.value.trim();

                                  if (!newName) {
                                    alert('Konu adı gereklidir');
                                    return;
                                  }

                                  try {
                                    const response = await apiService.put(`/topics/${topic._id}`, {
                                      name: newName
                                    });
                                    if (response.success) {
                                      setTopics(topics.map(t =>
                                        t._id === topic._id ? { ...t, name: newName } : t
                                      ));
                                      setEditingTopicId(null);
                                    }
                                  } catch (error) {
                                    alert('Güncelleme hatası: ' + error.message);
                                  }
                                }}
                                className={settingsStyles.editSaveButton}
                              >
                                Kaydet
                              </button>
                              <button
                                onClick={() => setEditingTopicId(null)}
                                className={settingsStyles.editCancelButton}
                              >
                                İptal
                              </button>
                            </div>
                          ) : (
                            <div className={settingsStyles.actionButtonGroup}>
                              <button
                                onClick={() => setEditingTopicId(topic._id)}
                                className={settingsStyles.editButton}
                              >
                                <PencilIcon className={settingsStyles.editIcon} />
                              </button>
                              <button
                                onClick={async () => {
                                  if (window.confirm(`"${topic.name}" konusunu silmek istediğinizden emin misiniz?`)) {
                                    try {
                                      const response = await apiService.delete(`/topics/${topic._id}`);
                                      if (response.success) {
                                        setTopics(topics.filter(t => t._id !== topic._id));
                                      }
                                    } catch (error) {
                                      alert('Silme hatası: ' + error.message);
                                    }
                                  }
                                }}
                                className={settingsStyles.deleteButton}
                              >
                                <TrashIcon className={settingsStyles.deleteIcon} />
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                    {topics.length === 0 && (
                      <tr>
                        <td colSpan={3} className={settingsStyles.emptyState}>
                          Henüz kayıtlı görüşme konusu bulunmamaktadır.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
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
        departments={departments}
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
        showActions={selectedAppointment && isOwnAppointment(selectedAppointment)}
        onApprove={handleApproveAppointment}
        onReject={handleRejectAppointment}
        onCancel={handleCancelAppointment}
        onCancelApproved={handleCancelApprovedAppointment}
        getStatusText={getStatusText}
        formatDate={formatDate}
        formatTime={formatTime}
        currentUserId={null}
      />

      {/* Reject Modal */}
      <RejectModal
        isOpen={showRejectModal}
        onClose={() => {
          setShowRejectModal(false);
          setRejectingAppointment(null);
        }}
        onConfirm={handleRejectConfirm}
        loading={rejectLoading}
        appointmentInfo={rejectingAppointment}
      />

      {/* Cancel Modal (for approved appointments - admin as faculty) */}
      <CancelModal
        isOpen={showCancelModal}
        onClose={() => {
          setShowCancelModal(false);
          setCancellingAppointment(null);
        }}
        onConfirm={handleCancelConfirm}
        loading={cancelLoading}
        appointmentInfo={cancellingAppointment}
      />

      {/* Google Calendar Conflict Warning Modal */}
      <ConflictWarningModal
        isOpen={showConflictModal}
        conflictData={conflictData}
        onDismiss={handleConflictDismiss}
        onAcknowledge={handleConflictAcknowledge}
        onGoToAvailability={handleGoToAvailability}
      />

      {/* First Login Setup Modal */}
      <ProfileModal
        isOpen={showFirstLoginModal}
        onClose={() => {}} // Prevent closing without completing setup
        profileData={firstLoginData}
        onInputChange={handleFirstLoginInputChange}
        onSubmit={handleFirstLoginSubmit}
        loading={firstLoginLoading}
        error={firstLoginError}
        success=""
        disableClose={true}
        title="İlk Giriş Ayarları"
        fields={[
          {
            name: 'title',
            label: 'Ünvan',
            type: 'select',
            required: true,
            placeholder: 'Ünvan seçin',
            options: [
              { value: 'Prof. Dr.', label: 'Prof. Dr.' },
              { value: 'Doç. Dr.', label: 'Doç. Dr.' },
              { value: 'Dr. Öğr. Üyesi', label: 'Dr. Öğr. Üyesi' },
              { value: 'Öğr. Gör. Dr.', label: 'Öğr. Gör. Dr.' },
              { value: 'Öğr. Gör.', label: 'Öğr. Gör.' },
              { value: 'Arş. Gör. Dr.', label: 'Arş. Gör. Dr.' },
              { value: 'Arş. Gör.', label: 'Arş. Gör.' }
            ]
          },
          {
            name: 'department',
            label: 'Bölüm',
            type: 'select',
            required: true,
            placeholder: 'Bölüm seçin',
            options: departments.map(dept => ({
              value: dept.name,
              label: dept.name
            }))
          }
        ]}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteConfirmModal}
        onClose={() => {
          setShowDeleteConfirmModal(false);
          setUserToDelete(null);
        }}
        onConfirm={confirmDeleteUser}
        title="Kullanıcıyı Sil"
        message={
          userToDelete
            ? `${formatUserName(userToDelete)} (${userToDelete.email}) adlı kullanıcıyı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`
            : 'Bu kullanıcıyı silmek istediğinizden emin misiniz?'
        }
        confirmText="Evet, Sil"
        cancelText="İptal"
        type="danger"
      />
    </div >
  );
};

export default AdminDashboard; 