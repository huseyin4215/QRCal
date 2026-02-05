import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { CalendarIcon, ClockIcon, UserIcon, AcademicCapIcon, EnvelopeIcon, GlobeAltIcon, MapPinIcon, BuildingOfficeIcon } from '@heroicons/react/24/outline';
import apiService from '../services/apiService';
import locationService from '../services/locationService';
import AdvisorWarningModal from '../components/AdvisorWarningModal/AdvisorWarningModal';
import styles from './FacultyAppointment.module.css';

const FacultyAppointment = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [faculty, setFaculty] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [selectedDuration, setSelectedDuration] = useState(15); // Default 15, will be fetched from DB
  const [userProfile, setUserProfile] = useState(null);
  const [showAdvisorWarning, setShowAdvisorWarning] = useState(false);
  const [pendingSubmit, setPendingSubmit] = useState(false);
  const [formData, setFormData] = useState({
    studentName: '',
    studentId: '',
    studentEmail: '',
    topic: '',
    description: ''
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [geofenceStatus, setGeofenceStatus] = useState('idle'); // idle | checking | allowed | denied
  const [locationAccuracy, setLocationAccuracy] = useState(null);
  const [geofenceVerified, setGeofenceVerified] = useState(false);
  const [locationPayload, setLocationPayload] = useState(null);
  const [topics, setTopics] = useState([]);

  // Fetch slot duration and topics on mount
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        // Fetch slot duration
        const durationResponse = await apiService.getSetting('slotDuration');
        if (durationResponse.success && durationResponse.data && durationResponse.data.value) {
          setSelectedDuration(durationResponse.data.value);
        }

        // Fetch topics from database
        const topicsResponse = await apiService.get('/topics');
        if (topicsResponse.success && topicsResponse.data) {
          setTopics(topicsResponse.data.map(t => ({ 
            value: t._id, 
            label: t.name,
            isAdvisorOnly: t.isAdvisorOnly || false
          })));
        }
      } catch (error) {
        console.error('Failed to fetch settings:', error);
      }
    };
    fetchSettings();
  }, []);

  useEffect(() => {
    loadFacultyData();
    loadUserProfile();
  }, [slug]);

  useEffect(() => {
    if (selectedDate) {
      // Reset selected slot when date changes
      setSelectedSlot(null);
      setAvailableSlots([]);  // Clear old slots immediately
      loadAvailableSlots();
    }
  }, [selectedDate, slug]);

  // Auto-refresh slots every 2 minutes to sync across browsers
  useEffect(() => {
    if (!selectedDate) return;
    
    const refreshInterval = setInterval(() => {
      loadAvailableSlots();
    }, 120000); // 2 minutes

    return () => clearInterval(refreshInterval);
  }, [selectedDate, slug]);

  // Load user profile from localStorage or API
  const loadUserProfile = async () => {
    try {
      // First try to get from localStorage
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const user = JSON.parse(storedUser);
        console.log('FacultyAppointment: User from localStorage:', user);
        setUserProfile(user);

        // Auto-fill form data if user is logged in
        if (user.role === 'student') {
          console.log('FacultyAppointment: Auto-filling form for student:', {
            name: user.name,
            studentNumber: user.studentNumber,
            email: user.email,
            department: user.department
          });
          setFormData(prev => ({
            ...prev,
            studentName: user.name || '',
            studentId: user.studentNumber || '',
            studentEmail: user.email || '',
            department: user.department || ''
          }));
        }
      } else {
        // If not in localStorage, try to get from API
        try {
          const response = await apiService.getCurrentUser();
          console.log('FacultyAppointment: User from API:', response);
          if (response.success && response.data) {
            setUserProfile(response.data);

            // Auto-fill form data if user is logged in
            if (response.data.role === 'student') {
              console.log('FacultyAppointment: Auto-filling form for student from API:', {
                name: response.data.name,
                studentNumber: response.data.studentNumber,
                email: response.data.email,
                department: response.data.department
              });
              setFormData(prev => ({
                ...prev,
                studentName: response.data.name || '',
                studentId: response.data.studentNumber || '',
                studentEmail: response.data.email || '',
                department: response.data.department || ''
              }));
            }
          }
        } catch (error) {
          console.log('User not logged in, will use manual form');
        }
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  };

  const loadFacultyData = async () => {
    try {
      setLoading(true);
      setError('');

      console.log('Loading faculty data for slug:', slug);
      const facultyData = await apiService.getFacultyBySlug(slug);
      console.log('Faculty data loaded:', facultyData);

      if (facultyData.success) {
        setFaculty(facultyData.data);
        // Bugünün tarihini varsayılan olarak ayarla
        const today = new Date().toISOString().split('T')[0];
        setSelectedDate(today);
      } else {
        setError(facultyData.message || 'Öğretim elemanı bulunamadı.');
      }
    } catch (error) {
      console.error('Faculty data error:', error);
      if (error.message.includes('404') || error.message.includes('bulunamadı')) {
        setError('Aradığınız öğretim elemanı bulunamadı. Lütfen doğru linki kullandığınızdan emin olun.');
      } else if (error.message.includes('fetch')) {
        setError('Backend sunucusuna bağlanılamıyor. Lütfen sunucunun çalıştığından emin olun.');
      } else {
        setError('Öğretim elemanı bilgileri yüklenirken hata oluştu: ' + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const loadAvailableSlots = async () => {
    try {
      setError('');
      const response = await apiService.getFacultySlots(slug, selectedDate);
      console.log('[SLOTS DEBUG] Available slots response:', response);
      console.log('[SLOTS DEBUG] Slots count:', response.data?.slots?.length || 0);
      console.log('[SLOTS DEBUG] First 3 slots:', response.data?.slots?.slice(0, 3));

      if (response.success) {
        const slots = response.data.slots || [];
        setAvailableSlots(slots);
        console.log('[SLOTS DEBUG] Set availableSlots state with', slots.length, 'slots');
      } else {
        setError(response.message || 'Müsait saatler yüklenirken hata oluştu.');
      }
    } catch (error) {
      setError('Müsait saatler yüklenirken hata oluştu.');
      console.error('Slots error:', error);
    }
  };

  const handleSlotSelect = (slot) => {
    setSelectedSlot(slot);
    setError('');
  };



  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const calculateEndTime = (startTime, duration) => {
    const [hours, minutes] = startTime.split(':').map(Number);
    const startDate = new Date(2000, 0, 1, hours, minutes);
    const endDate = new Date(startDate.getTime() + duration * 60000);
    return endDate.toTimeString().slice(0, 5);
  };

  // Check if a slot time is in the past (for today's date)
  const isSlotPast = (slotStartTime, date) => {
    const today = new Date().toISOString().split('T')[0];
    if (date !== today) {
      return false; // Not today, so not past
    }
    
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    
    const [slotHour, slotMinute] = slotStartTime.split(':').map(Number);
    
    // Compare hours and minutes
    if (slotHour < currentHour) {
      return true; // Past hour
    }
    if (slotHour === currentHour && slotMinute < currentMinute) {
      return true; // Same hour but past minute
    }
    
    return false; // Future or current time
  };

  const handleVerifyLocation = async () => {
    try {
      setGeofenceStatus('checking');
      setError('');
      // Server-side geofence check (service internally ensures fresh location)
      const geofenceCheck = await locationService.checkGeofenceAccess(faculty._id);
      if (geofenceCheck.success && geofenceCheck.allowed) {
        setGeofenceStatus('allowed');
        setGeofenceVerified(true);
        // Prepare payload for submit and set last accuracy
        setLocationPayload(locationService.prepareLocationData());
        setLocationAccuracy(locationService.locationAccuracy || geofenceCheck.accuracy || null);
      } else {
        setGeofenceStatus('denied');
        setGeofenceVerified(false);
        setLocationPayload(null);
        setError(geofenceCheck.message || 'Konum doğrulaması başarısız. Belirtilen alan içinde olmalısınız.');
      }
    } catch (err) {
      setGeofenceStatus('denied');
      setGeofenceVerified(false);
      setLocationPayload(null);
      setError(err.message || 'Konum doğrulaması başarısız. Lütfen konum izni verin ve tekrar deneyin.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedSlot) {
      setError('Lütfen bir saat seçin.');
      return;
    }

    if (!formData.studentName || !formData.studentId || !formData.studentEmail || !formData.topic || !formData.description) {
      setError('Lütfen tüm zorunlu alanları doldurun.');
      return;
    }

    // Check if selected topic is advisor-only
    const selectedTopic = topics.find(t => t.value === formData.topic);
    let advisorOnlyWarning = false;
    
    if (selectedTopic && selectedTopic.isAdvisorOnly && userProfile && !pendingSubmit) {
      // Get advisor ID - handle both populated object and string ID
      const userAdvisorId = typeof userProfile.advisor === 'object' 
        ? userProfile.advisor?._id 
        : userProfile.advisor;
      
      // Check if the student's advisor is the same as the faculty
      const isAdvisor = userAdvisorId && (
        userAdvisorId === faculty._id || 
        userAdvisorId === faculty.id ||
        String(userAdvisorId) === String(faculty._id)
      );
      
      console.log('[ADVISOR CHECK] Topic isAdvisorOnly:', selectedTopic.isAdvisorOnly);
      console.log('[ADVISOR CHECK] User advisor:', userAdvisorId);
      console.log('[ADVISOR CHECK] Faculty ID:', faculty._id);
      console.log('[ADVISOR CHECK] Is advisor:', isAdvisor);
      
      if (!isAdvisor) {
        advisorOnlyWarning = true;
        // Show warning modal
        setShowAdvisorWarning(true);
        return;
      }
    }

    // Location verification is now OPTIONAL
    // If user verified location, use it; otherwise proceed without location

    try {
      setSubmitting(true);
      if (!advisorOnlyWarning) {
        setError('');
      }

      const endTime = calculateEndTime(selectedSlot.startTime, selectedDuration);

      // Konum doğrulaması isteğe bağlıdır
      let adjustedLocationPayload = null;
      if (geofenceVerified && locationPayload) {
        adjustedLocationPayload = {
          ...locationPayload,
          accuracy: Math.min(locationPayload.accuracy || 500, 50),
          latitude: locationPayload.latitude,
          longitude: locationPayload.longitude
        };
      }

      const appointmentData = {
        facultyId: faculty._id,
        facultyName: faculty.name,
        studentName: formData.studentName,
        studentId: formData.studentId,
        studentEmail: formData.studentEmail,
        topic: formData.topic,
        description: formData.description,
        date: selectedDate,
        startTime: selectedSlot.startTime,
        endTime: endTime,
        duration: selectedDuration,
        advisorOnlyWarning: advisorOnlyWarning,
        // Include location only if verified (optional)
        ...(adjustedLocationPayload && { location: adjustedLocationPayload })
      };

      console.log('Submitting appointment data:', appointmentData);

      const result = await apiService.createAppointment(appointmentData);

      if (result.success) {
        setSuccess('Randevu talebiniz başarıyla gönderildi! Öğretim elemanı onayladıktan sonra size e-posta ile bilgilendirme yapılacaktır.');
        setPendingSubmit(false);

        // 2 saniye sonra anasayfaya yönlendir
        setTimeout(() => {
          if (user?.role === 'student') {
            navigate('/student-dashboard');
          } else {
            navigate('/');
          }
        }, 2000);
      } else {
        setError(result.message || 'Randevu talebi gönderilirken hata oluştu.');
      }

    } catch (error) {
      setError(error.message || 'Randevu talebi gönderilirken hata oluştu. Lütfen konum izni verip alan içinde olduğunuzdan emin olun.');
      console.error('Appointment submission error:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const getNextWeekDates = () => {
    const dates = [];
    const today = new Date();

    // Start from today (i = 0) instead of tomorrow
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push(date.toISOString().split('T')[0]);
    }

    return dates;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (!faculty) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Öğretim Elemanı Bulunamadı</h1>
          <p className="text-gray-600">Aradığınız öğretim elemanı sistemde bulunmamaktadır.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex items-center space-x-4">
            <div className="flex-shrink-0">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                <AcademicCapIcon className="w-8 h-8 text-blue-600" />
              </div>
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900">{faculty.name}</h1>
              <p className="text-gray-600">{faculty.title} - {faculty.department}</p>
              <div className="flex items-center flex-wrap gap-4 mt-2 text-sm text-gray-500">
                {faculty.office && (
                  <div className="flex items-center">
                    <BuildingOfficeIcon className="w-4 h-4 mr-1" />
                    <span className="font-medium mr-1">Ofis:</span>
                    {faculty.office}
                  </div>
                )}
                {/* Phone number hidden for students */}
                {faculty.email && (
                  <div className="flex items-center">
                    <EnvelopeIcon className="w-4 h-4 mr-1" />
                    {faculty.email}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Sol Taraf - Tarih ve Saat Seçimi */}
          <div className={styles.formContainer}>
            <h2 className={styles.formTitle}>
              <CalendarIcon className={styles.titleIcon} />
              Tarih ve Saat Seçimi
            </h2>

            {/* Tarih Seçimi */}
            <div className="mb-6">
              <label className={styles.formLabel}>
                Tarih Seçin
              </label>
              <div className={styles.dateGrid}>
                {getNextWeekDates().map((date) => {
                  const dateObj = new Date(date);
                  const dayName = dateObj.toLocaleDateString('tr-TR', { weekday: 'short' });
                  const dayNumber = dateObj.getDate();
                  const isSelected = selectedDate === date;
                  const isToday = date === new Date().toISOString().split('T')[0];

                  return (
                    <button
                      key={date}
                      onClick={() => setSelectedDate(date)}
                      className={`${styles.dateButton} ${isSelected ? styles.selected : ''}`}
                    >
                      <div className={styles.dayName}>{dayName}</div>
                      <div className={styles.dayNumber}>{dayNumber}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Randevu süresi sabit 15 dakika */}

            {/* Müsait Saatler */}
            <div>
              <label className={styles.formLabel}>
                Müsait Saatler ({selectedDuration} dakika)
              </label>
              {availableSlots.length > 0 ? (
                <div className={styles.timeSlotsGrid}>
                  {availableSlots.map((slot, index) => {
                    const endTime = calculateEndTime(slot.startTime, selectedDuration);
                    const isSlotPastTime = isSlotPast(slot.startTime, selectedDate);
                    const isSlotAvailable = slot.available && slot.status === 'available' && !isSlotPastTime;

                    return (
                      <button
                        key={index}
                        onClick={() => isSlotAvailable ? handleSlotSelect(slot) : null}
                        disabled={!isSlotAvailable}
                        className={`${styles.timeSlotButton} ${selectedSlot === slot ? styles.selected : ''} ${isSlotPastTime ? styles.pastSlot : ''}`}
                      >
                        <div>
                          {slot.startTime} - {endTime}
                        </div>
                        {!isSlotAvailable && (
                          <div className="text-xs text-gray-400">
                            {isSlotPastTime ? 'Geçmiş' : 'Dolu'}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <ClockIcon className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p>Seçilen tarihte müsait saat bulunmamaktadır.</p>
                </div>
              )}
            </div>
          </div>

          {/* Sağ Taraf - Randevu Formu */}
          <div className={styles.formContainer}>
            <h2 className={styles.formTitle}>
              Randevu Talebi
            </h2>

            {/* Kullanıcı durumu bilgisi */}
            {userProfile ? (
              <div className={`${styles.infoBox} ${styles.infoBoxSuccess}`}>
                <p>
                  <strong>Hoş geldiniz, {userProfile.name}!</strong><br />
                  Bilgileriniz otomatik olarak doldurulmuştur.
                </p>
              </div>
            ) : (
              <div className={`${styles.infoBox} ${styles.infoBoxInfo}`}>
                <p>
                  <strong>Bilgi:</strong> Giriş yaparak bilgilerinizin otomatik doldurulmasını sağlayabilirsiniz.
                </p>
              </div>
            )}

            {error && (
              <div className={`${styles.infoBox} ${styles.infoBoxError}`}>
                <p>{error}</p>
              </div>
            )}

            {success && (
              <div className={`${styles.infoBox} ${styles.infoBoxSuccess}`}>
                <p>{success}</p>
              </div>
            )}

            {/* Geofence status info */}
            {geofenceStatus !== 'idle' && (
              <div className={`${styles.infoBox} ${geofenceStatus === 'allowed' ? styles.infoBoxSuccess :
                geofenceStatus === 'checking' ? styles.infoBoxInfo :
                  styles.infoBoxWarning
                }`}>
                <p>
                  {geofenceStatus === 'checking' && 'Konum doğrulaması yapılıyor...'}
                  {geofenceStatus === 'allowed' && `Konum doğrulandı${locationAccuracy ? ` (±${Math.round(locationAccuracy)}m)` : ''}. Randevu oluşturulabilir.`}
                  {geofenceStatus === 'denied' && 'Konum doğrulanamadı. Lütfen konum iznini verin ve belirtilen alan içinde olduğunuzdan emin olun.'}
                </p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Öğrenci Bilgileri - Otomatik doldurulur */}
              <div>
                <label className={styles.formLabel}>
                  Ad Soyad *
                </label>
                {userProfile ? (
                  <input
                    type="text"
                    name="studentName"
                    value={formData.studentName}
                    readOnly
                    className={styles.formInput}
                    required
                  />
                ) : (
                  <input
                    type="text"
                    name="studentName"
                    value={formData.studentName}
                    onChange={handleInputChange}
                    className={styles.formInput}
                    required
                  />
                )}
              </div>

              <div>
                <label className={styles.formLabel}>
                  Öğrenci Numarası *
                </label>
                {userProfile ? (
                  <input
                    type="text"
                    name="studentId"
                    value={formData.studentId}
                    readOnly
                    className={styles.formInput}
                    required
                  />
                ) : (
                  <input
                    type="text"
                    name="studentId"
                    value={formData.studentId}
                    onChange={handleInputChange}
                    className={styles.formInput}
                    required
                  />
                )}
              </div>

              <div>
                <label className={styles.formLabel}>
                  E-posta *
                </label>
                {userProfile ? (
                  <input
                    type="email"
                    name="studentEmail"
                    value={formData.studentEmail}
                    readOnly
                    className={styles.formInput}
                    required
                  />
                ) : (
                  <input
                    type="email"
                    name="studentEmail"
                    value={formData.studentEmail}
                    onChange={handleInputChange}
                    className={styles.formInput}
                    required
                  />
                )}
              </div>

              {/* Bölüm bilgisi - sadece görüntüleme */}
              {userProfile && userProfile.department && (
                <div>
                  <label className={styles.formLabel}>
                    Bölüm
                  </label>
                  <input
                    type="text"
                    value={userProfile.department}
                    readOnly
                    className={styles.formInput}
                  />
                </div>
              )}

              <div>
                <label className={styles.formLabel}>
                  Görüşme Konusu *
                </label>
                <select
                  name="topic"
                  value={formData.topic}
                  onChange={handleInputChange}
                  className={styles.formSelect}
                  required
                >
                  <option value="">Konu seçin</option>
                  {topics.map((topic) => (
                    <option key={topic.value} value={topic.value}>
                      {topic.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className={styles.formLabel}>
                  Açıklama <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  rows="3"
                  className={styles.formTextarea}
                  placeholder="Görüşme konusu hakkında ek bilgi verebilirsiniz..."
                />
              </div>

              {selectedSlot && (
                <div className={`${styles.infoBox} ${styles.infoBoxInfo}`}>
                  <p>
                    <strong>Seçilen Randevu:</strong><br />
                    Tarih: {new Date(selectedDate).toLocaleDateString('tr-TR')}<br />
                    Saat: {selectedSlot.startTime} - {calculateEndTime(selectedSlot.startTime, selectedDuration)}<br />
                    Süre: {selectedDuration} dakika
                  </p>
                </div>
              )}

              <div className={styles.actionRow}>
                <button
                  type="button"
                  onClick={handleVerifyLocation}
                  disabled={true}
                  className={`${styles.verifyButton} ${styles.disabled}`}
                  style={{ opacity: 0.5, cursor: 'not-allowed' }}
                >
                  <MapPinIcon className={styles.buttonIcon} />
                  Konumumu Doğrula
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className={`${styles.submitButton} ${submitting ? styles.disabled : ''}`}
                >
                  {submitting ? 'Gönderiliyor...' : 'Randevu Talebi Gönder'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Danışmana Özel Konu Uyarı Modalı */}
      <AdvisorWarningModal
        isOpen={showAdvisorWarning}
        onClose={() => {
          setShowAdvisorWarning(false);
          setPendingSubmit(false);
        }}
        onConfirm={() => {
          setShowAdvisorWarning(false);
          setPendingSubmit(true);
          // Form'u yeniden submit et
          setTimeout(() => {
            const form = document.querySelector('form');
            if (form) form.requestSubmit();
          }, 100);
        }}
        facultyName={faculty?.title ? `${faculty.title} ${faculty.name}` : faculty?.name}
      />
    </div>
  );
};

export default FacultyAppointment; 