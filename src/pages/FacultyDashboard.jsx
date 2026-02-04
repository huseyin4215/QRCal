import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  CalendarIcon,
  ClockIcon,
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  GlobeAltIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  QrCodeIcon,
  SparklesIcon,
  HomeIcon,
  ArrowUpTrayIcon,
  DocumentArrowDownIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import {
  AcademicCapIcon,
  ChartBarIcon
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
import GoogleCalendarEvents from '../components/GoogleCalendarUnavailableSlots/GoogleCalendarUnavailableSlots';
import TabNavigation from '../components/TabNavigation';
import RejectModal from '../components/RejectModal/RejectModal';
import CancelModal from '../components/CancelModal/CancelModal';
import StatisticsCards from '../components/StatisticsCards/StatisticsCards';
import ConflictWarningModal from '../components/ConflictWarningModal/ConflictWarningModal';
import AppointmentHistory from './AppointmentHistory';
import { exportAppointmentsToPDF } from '../utils/pdfExport';
import { formatUserName } from '../utils/formatUserName';

const FacultyDashboard = () => {
  const { user, login } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [availability, setAvailability] = useState([]);
  const [availabilityLoaded, setAvailabilityLoaded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('appointments');
  const [slotDuration, setSlotDuration] = useState(15);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [showQRModal, setShowQRModal] = useState(false);
  const [googleConnected, setGoogleConnected] = useState(false);
  // Notifications state
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);

  // Reject Modal State
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectingAppointment, setRejectingAppointment] = useState(null);
  const [rejectLoading, setRejectLoading] = useState(false);

  // Cancel Modal State (for approved appointments)
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancellingAppointment, setCancellingAppointment] = useState(null);
  const [cancelLoading, setCancelLoading] = useState(false);

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
  const [showGoogleSetup, setShowGoogleSetup] = useState(false);

  // Profile management states
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    office: '',
    website: '',
    title: '',
    department: ''
  });
  const [departments, setDepartments] = useState([]);
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
  const [googleLoading, setGoogleLoading] = useState(false);

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

  useEffect(() => {
    if (user) {
      loadDashboardData();
      loadNotificationsFromStorage(); // Load notifications from localStorage
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

  // Auto-load Google Calendar events when connected, after availability is loaded
  useEffect(() => {
    if (googleConnected && user && availabilityLoaded) {
      loadGoogleCalendarEvents();
    }
  }, [googleConnected, user, availabilityLoaded]);

  // Auto-load Google Calendar events when availability tab is opened
  useEffect(() => {
    if (activeTab === 'availability' && user) {
      (async () => {
        // Always ensure DB-backed availability is loaded first
        await loadAvailabilityData();
        if (googleConnected) {
          // Then optionally merge Google data onto it
          await loadGoogleCalendarEvents();
        }
      })();
    }
  }, [activeTab, googleConnected, user]);

  // Auto-load availability data when availability tab is opened
  useEffect(() => {
    if (activeTab === 'availability' && user) {
      loadAvailabilityData();
    }
  }, [activeTab, user]);

  // Handle Google OAuth callback (ensure fast redirect)
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
      handleOAuthCallback(code);
    } else if (token && (googleConnectedParam === 'true' || !googleConnected)) {
      // Handle direct token (e.g., from old flow or other redirects)

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

      // Clear URL parameters and ensure we land once
      navigate('/faculty-dashboard', { replace: true });

      // Show success message
      alert('Google Calendar başarıyla bağlandı!');
    }
  }, [searchParams, user, login, navigate]);

  // Handle OAuth 2.0 callback
  const handleOAuthCallback = async (code) => {
    try {
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

  const openProfileModal = async () => {
    // Fetch departments list
    try {
      const deptResponse = await apiService.getDepartments();
      if (deptResponse.success && deptResponse.data) {
        setDepartments(deptResponse.data);
      }
    } catch (error) {
      console.error('Failed to fetch departments:', error);
    }

    setProfileData({
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      office: user?.office || '',
      website: user?.website || '',
      title: user?.title || '',
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

    console.log('=== AVAILABILITY SAVE DEBUG ===');
    console.log('Current availability state:', availability);
    console.log('Availability length:', availability.length);
    console.log('Availability type:', typeof availability);
    console.log('Availability JSON:', JSON.stringify(availability, null, 2));

    try {
      const requestData = { availability };
      console.log('Request data being sent:', requestData);
      console.log('Request data JSON:', JSON.stringify(requestData, null, 2));

      const response = await apiService.updateFacultyAvailability(requestData);

      console.log('Availability save response:', response);
      console.log('Response success:', response.success);
      console.log('Response data:', response.data);

      if (response.success) {
        setAvailabilitySuccess('Müsaitlik durumu başarıyla kaydedildi!');

        // Reload availability data to verify it was saved
        setTimeout(() => {
          loadAvailabilityData();
          setShowAvailabilityModal(false);
          setAvailabilitySuccess('');
        }, 2000);
      } else {
        console.error('Response indicates failure:', response);
        setAvailabilityError('Sunucu yanıtı başarısız: ' + (response.message || 'Bilinmeyen hata'));
      }
    } catch (error) {
      console.error('Availability save error:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        response: error.response
      });
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

        // Reload availability data to reflect changes
        setTimeout(() => {
          loadAvailabilityData();
        }, 1000);
      }
    } catch (error) {
      console.error('Google Calendar availability load error:', error);
      setAvailabilityError(error.message || 'Google Calendar\'dan müsaitlik yüklenirken hata oluştu');
    } finally {
      setAvailabilityLoading(false);
    }
  };

  const loadAvailabilityData = async () => {
    try {
      console.log('=== LOADING AVAILABILITY DATA ===');
      const availabilityResponse = await apiService.getFacultyAvailability();
      console.log('API Response:', availabilityResponse);

      const defaultAvailability = initializeAvailability();
      console.log('Default availability template:', defaultAvailability);

      let serverAvailability = [];

      if (
        availabilityResponse.success &&
        availabilityResponse.data.availability &&
        Array.isArray(availabilityResponse.data.availability)
      ) {
        serverAvailability = availabilityResponse.data.availability;
        console.log('Server availability found:', serverAvailability);
      } else {
        console.log('No server availability data found, using defaults');
      }

      // Merge server data into default 7-day template to ensure all days are shown
      const dayOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
      const merged = defaultAvailability.map(defDay => {
        const match = serverAvailability.find(d => d.day === defDay.day);
        const result = match ? { ...defDay, ...match } : defDay;
        console.log(`Day ${defDay.day}: ${match ? 'found match' : 'using default'}`, result);
        return result;
      }).sort((a, b) => dayOrder.indexOf(a.day) - dayOrder.indexOf(b.day));

      setAvailability(merged);
      setSlotDuration(availabilityResponse.data.slotDuration || 30);
      setAvailabilityLoaded(true);
      console.log('Final merged availability set to state:', merged);

      // Persist baseline to DB if server had none to avoid disappearing after relogin
      if (!serverAvailability || serverAvailability.length === 0) {
        try {
          await apiService.updateFacultyAvailability({ availability: merged });
          console.log('Persisted default availability to DB');
        } catch (persistError) {
          console.error('Failed to persist default availability to DB:', persistError);
        }
      }
    } catch (error) {
      console.error('Availability data load error:', error);
      const fallback = initializeAvailability();
      setAvailability(fallback);
      setAvailabilityLoaded(true);
      console.log('Set fallback availability:', fallback);
    }
  };

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Load appointments
      const appointmentsResponse = await apiService.getFacultyAppointments();
      const appointmentsData = appointmentsResponse.data?.appointments || appointmentsResponse.data || [];

      // Randevuları oluşturulma tarihine göre sırala (en yeni en üstte)
      const sortedAppointments = [...appointmentsData].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setAppointments(sortedAppointments);

      // Load profile data
      const profileResponse = await apiService.getCurrentUser();
      const profileData = profileResponse.data;

      // Update profile state with loaded data
      setProfileData({
        name: profileData.name || '',
        email: profileData.email || '',
        phone: profileData.phone || '',
        office: profileData.office || '',
        website: profileData.website || '',
        title: profileData.title || '',
        department: profileData.department || '',
        role: profileData.role || ''
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

      // Load availability data - her zaman çağır
      await loadAvailabilityData();

      if (profileData.googleId) {
        setGoogleConnected(true);
      }

      console.log('Dashboard data loaded:', {
        appointmentsData,
        profileData
      });
    } catch (error) {
      console.error('Dashboard data load error:', error);
      setAppointments([]);
      setAvailability(initializeAvailability());
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

        // Randevuları oluşturulma tarihine göre sırala (en yeni en üstte)
        const sortedUpdatedAppointments = [...updatedAppointments].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setAppointments(sortedUpdatedAppointments);
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
      cancelled: { text: 'İptal Edildi', color: 'bg-gray-100 text-gray-800' },
      no_response: { text: 'Cevaplamadı', color: 'bg-orange-100 text-orange-800' }
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
        return 'Cevaplamadı';
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
    // If reason is provided directly, use it
    if (reason) {
      handleAppointmentAction(appointmentId, 'rejected', reason);
      return;
    }
    // Otherwise, show the reject modal
    const appointment = appointments.find(a => a._id === appointmentId);
    setRejectingAppointment(appointment);
    setShowRejectModal(true);
  };

  const handleRejectConfirm = async (reason) => {
    if (!rejectingAppointment) return;

    setRejectLoading(true);
    await handleAppointmentAction(rejectingAppointment._id, 'rejected', reason);
    setRejectLoading(false);
    setShowRejectModal(false);
    setRejectingAppointment(null);
  };

  // Handle cancel approved appointment
  const handleCancelApprovedAppointment = (appointmentId) => {
    const appointment = appointments.find(a => a._id === appointmentId);
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
      const response = await apiService.cancelFacultyAppointment(cancellingAppointment._id, reason);
      if (response.success) {
        // Refresh appointments
        const appointmentsResponse = await apiService.getFacultyAppointments();
        if (appointmentsResponse.success) {
          const sortedAppointments = (appointmentsResponse.data?.appointments || appointmentsResponse.data || [])
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          setAppointments(sortedAppointments);
        }
        // Show success notification
        const newNotification = {
          id: Date.now(),
          title: 'Randevu İptal Edildi',
          message: 'Onaylanmış randevu başarıyla iptal edildi ve öğrenciye bildirim gönderildi.',
          type: 'success',
          time: new Date().toISOString(),
          read: false
        };
        setNotifications(prev => [newNotification, ...prev]);
      }
    } catch (error) {
      console.error('Cancel appointment error:', error);
      alert('Randevu iptal edilirken hata oluştu: ' + error.message);
    }
    setCancelLoading(false);
    setShowCancelModal(false);
    setCancellingAppointment(null);
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
      setGoogleLoading(true);
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
    } finally {
      setGoogleLoading(false);
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
      name: 'title',
      label: 'Ünvan',
      type: 'text',
      required: false,
      placeholder: 'Ünvan (örn: Prof. Dr., Doç. Dr., Dr. Öğr. Üyesi)'
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
      placeholder: 'Web sitesi URL'
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
        theme="faculty"
        notifications={notifications}
        unreadCount={unreadCount}
        onToggleNotifications={toggleNotifications}
        onMarkAllRead={markAllNotificationsRead}
        onNotificationClick={(notification) => {
          // Faculty dashboard'da bildirimlere tıklandığında appointments sekmesine git
          setActiveTab('appointments');
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
            onClick={openAvailabilityModal}
            className={headerStyles.navLink}
          >
            <ClockIcon className={headerStyles.navIcon} />
            Müsaitlik
          </button>
          <button
            onClick={() => window.location.href = '/qr-code'}
            className={headerStyles.navLink}
          >
            <QrCodeIcon className={headerStyles.navIcon} />
            QR Kod
          </button>
          <button
            onClick={googleConnected ? handleGoogleDisconnect : handleGoogleConnect}
            className={`${headerStyles.navLink} ${googleConnected ? headerStyles.navLinkActive : ''}`}
          >
            <CalendarIcon className={headerStyles.navIcon} />
            Calendar
          </button>
        </div>
      </Header>



      <div className="dashboard-main max-w-7xl mx-auto py-8">
        {/* Stats Cards */}
        <div className="stats-container">
          <div>
            <StatsCard
              title="Toplam Randevu"
              value={appointments.length}
              icon={<CalendarIcon className="h-6 w-6" />}
              color="indigo"
            />
          </div>
          <div>
            <StatsCard
              title="Bekleyen"
              value={appointments.filter(apt => apt.status === 'pending').length}
              icon={<ClockIcon className="h-6 w-6" />}
              color="yellow"
            />
          </div>
          <div>
            <StatsCard
              title="Onaylanan"
              value={appointments.filter(apt => apt.status === 'approved').length}
              icon={<CheckCircleIcon className="h-6 w-6" />}
              color="green"
            />
          </div>
          <div>
            <StatsCard
              title="Reddedilen"
              value={appointments.filter(apt => apt.status === 'rejected').length}
              icon={<XCircleIcon className="h-6 w-6" />}
              color="red"
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
                id: 'history',
                label: 'Randevu Geçmişi',
                icon: <ClockIcon className="w-5 h-5" />
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
            {activeTab === 'appointments' && (
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
                  onCancelApproved={handleCancelApprovedAppointment}
                  onDetails={handleViewDetails}
                  showCancel={false}
                  showActions={true}
                  showHistoryButton={true}
                />
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

                {/* Ensure the section always shows once availability is loaded */}
                {!availabilityLoaded ? (
                  <div className="text-sm text-gray-500">Müsaitlik yükleniyor...</div>
                ) : null}

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

            {/* History Tab */}
            {activeTab === 'history' && (
              <div>
                <AppointmentHistory userId={user?._id} embedded={true} />
              </div>
            )}

            {/* Statistics Tab */}
            {activeTab === 'stats' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-medium text-gray-900">Randevu İstatistiklerim</h3>
                </div>
                
                <StatisticsCards
                  appointments={appointments}
                  onExportPDF={async () => await exportAppointmentsToPDF(appointments, `${formatUserName(user) || 'Öğretim Üyesi'} - Randevu Raporu`)}
                  title="Genel Randevu İstatistikleri"
                />

                {/* Quick Stats */}
                <div className="mt-8 bg-white rounded-lg shadow p-6">
                  <h4 className="text-md font-medium text-gray-900 mb-4">Hızlı Özet</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    <div className="bg-blue-50 rounded-lg p-4 text-center">
                      <p className="text-2xl font-bold text-blue-600">{appointments.length}</p>
                      <p className="text-sm text-blue-700">Toplam</p>
                    </div>
                    <div className="bg-green-50 rounded-lg p-4 text-center">
                      <p className="text-2xl font-bold text-green-600">
                        {appointments.filter(a => a.status === 'approved').length}
                      </p>
                      <p className="text-sm text-green-700">Onaylanan</p>
                    </div>
                    <div className="bg-red-50 rounded-lg p-4 text-center">
                      <p className="text-2xl font-bold text-red-600">
                        {appointments.filter(a => a.status === 'rejected').length}
                      </p>
                      <p className="text-sm text-red-700">Reddedilen</p>
                    </div>
                    <div className="bg-yellow-50 rounded-lg p-4 text-center">
                      <p className="text-2xl font-bold text-yellow-600">
                        {appointments.filter(a => a.status === 'pending').length}
                      </p>
                      <p className="text-sm text-yellow-700">Bekleyen</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4 text-center">
                      <p className="text-2xl font-bold text-gray-600">
                        {appointments.filter(a => a.status === 'no_response').length}
                      </p>
                      <p className="text-sm text-gray-700">Cevaplanmadı</p>
                    </div>
                    <div className="bg-orange-50 rounded-lg p-4 text-center">
                      <p className="text-2xl font-bold text-orange-600">
                        {appointments.filter(a => a.status === 'cancelled').length}
                      </p>
                      <p className="text-sm text-orange-700">İptal Edilen</p>
                    </div>
                  </div>
                </div>

                {/* Response Rate */}
                <div className="mt-6 bg-white rounded-lg shadow p-6">
                  <h4 className="text-md font-medium text-gray-900 mb-4">Yanıt Oranları</h4>
                  <div className="space-y-4">
                    {(() => {
                      const total = appointments.length;
                      const approved = appointments.filter(a => a.status === 'approved').length;
                      const rejected = appointments.filter(a => a.status === 'rejected').length;
                      const responded = approved + rejected;
                      const responseRate = total > 0 ? Math.round((responded / total) * 100) : 0;
                      const approvalRate = responded > 0 ? Math.round((approved / responded) * 100) : 0;
                      
                      return (
                        <>
                          <div>
                            <div className="flex justify-between text-sm mb-1">
                              <span className="text-gray-600">Yanıt Oranı</span>
                              <span className="font-medium text-gray-900">{responseRate}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${responseRate}%` }}
                              />
                            </div>
                          </div>
                          <div>
                            <div className="flex justify-between text-sm mb-1">
                              <span className="text-gray-600">Onay Oranı (Yanıtlananlar İçinde)</span>
                              <span className="font-medium text-gray-900">{approvalRate}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-green-600 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${approvalRate}%` }}
                              />
                            </div>
                          </div>
                        </>
                      );
                    })()}
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

      <AvailabilityModal
        isOpen={showAvailabilityModal}
        onClose={() => {
          setShowAvailabilityModal(false);
          setAvailabilityError('');
          setAvailabilitySuccess('');
        }}
        availability={availability}
        slotDuration={30}
        onSlotDurationChange={() => { }}
        onDayAvailabilityChange={updateDayAvailability}
        onSave={handleSaveAvailability}
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

      {/* Cancel Modal (for approved appointments) */}
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
    </div>
  );
};

export default FacultyDashboard;