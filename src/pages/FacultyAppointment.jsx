import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { CalendarIcon, ClockIcon, UserIcon, AcademicCapIcon, EnvelopeIcon, PhoneIcon, GlobeAltIcon, MapPinIcon } from '@heroicons/react/24/outline';
import apiService from '../services/apiService';
import locationService from '../services/locationService';
import styles from './FacultyAppointment.module.css';

const FacultyAppointment = () => {
  const { slug } = useParams();
  const [faculty, setFaculty] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [selectedDuration, setSelectedDuration] = useState(15); // 15 dakika varsayılan
  const [userProfile, setUserProfile] = useState(null);
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

  const topics = [
    { value: 'Staj görüşmesi', label: 'Staj görüşmesi' },
    { value: 'Ders destek talebi', label: 'Ders destek talebi' },
    { value: 'Bitirme projesi danışmanlığı', label: 'Bitirme projesi danışmanlığı' },
    { value: 'Kariyer gelişimi/mentorluk', label: 'Kariyer gelişimi/mentorluk' },
    { value: 'Akademik danışmanlık', label: 'Akademik danışmanlık' },
    { value: 'Ders değerlendirme görüşmesi', label: 'Ders değerlendirme görüşmesi' }
  ];

  const durationOptions = [
    { value: 10, label: '10 dakika' },
    { value: 15, label: '15 dakika' },
    { value: 20, label: '20 dakika' }
  ];

  useEffect(() => {
    loadFacultyData();
    loadUserProfile();
  }, [slug]);

  useEffect(() => {
    if (selectedDate) {
      loadAvailableSlots();
    }
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
      if (error.message.includes('fetch')) {
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
      console.log('Available slots response:', response);
      
      if (response.success) {
        setAvailableSlots(response.data.slots || []);
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

  const handleDurationChange = (duration) => {
    setSelectedDuration(duration);
    setSelectedSlot(null); // Slot seçimini sıfırla
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

    if (!formData.studentName || !formData.studentId || !formData.studentEmail || !formData.topic) {
      setError('Lütfen tüm zorunlu alanları doldurun.');
      return;
    }

    // Enforce manual geofence verification before submit
    if (!geofenceVerified || !locationPayload) {
      setError('Lütfen önce "Konumumu Doğrula" butonu ile konumunuzu doğrulayın.');
      return;
    }

    try {
      setSubmitting(true);
      setError('');

      const endTime = calculateEndTime(selectedSlot.startTime, selectedDuration);

      // Eğer geofence doğrulaması başarılı olduysa, konum doğruluğunu esnet
      let adjustedLocationPayload = locationPayload;
      if (geofenceVerified && locationPayload) {
        adjustedLocationPayload = {
          ...locationPayload,
          accuracy: Math.min(locationPayload.accuracy || 500, 50), // Maksimum 50m olarak sınırla
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
        // Include verified location payload
        location: adjustedLocationPayload
      };

      console.log('Submitting appointment data:', appointmentData);

      const result = await apiService.createAppointment(appointmentData);
      
      if (result.success) {
        setSuccess('Randevu talebiniz başarıyla gönderildi! Öğretim elemanı onayladıktan sonra size e-posta ile bilgilendirme yapılacaktır.');
        
        // Formu temizle
        setFormData({
          studentName: userProfile?.name || '',
          studentId: userProfile?.studentNumber || '',
          studentEmail: userProfile?.email || '',
          topic: '',
          description: ''
        });
        setSelectedSlot(null);
        
        // Slotları yeniden yükle
        loadAvailableSlots();
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
              <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                {faculty.office && (
                  <div className="flex items-center">
                    <UserIcon className="w-4 h-4 mr-1" />
                    {faculty.office}
                  </div>
                )}
                {faculty.phone && (
                  <div className="flex items-center">
                    <PhoneIcon className="w-4 h-4 mr-1" />
                    {faculty.phone}
                  </div>
                )}
                {faculty.email && (
                  <div className="flex items-center">
                    <EnvelopeIcon className="w-4 h-4 mr-1" />
                    {faculty.email}
                  </div>
                )}
                {/* Website removed */}
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

            {/* Süre Seçimi */}
            <div className="mb-6">
              <label className={styles.formLabel}>
                Randevu Süresi
              </label>
              <div className={styles.durationGrid}>
                {durationOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleDurationChange(option.value)}
                    className={`${styles.durationButton} ${selectedDuration === option.value ? styles.selected : ''}`}
                  >
                    <div>{option.label}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Müsait Saatler */}
            <div>
              <label className={styles.formLabel}>
                Müsait Saatler ({selectedDuration} dakika)
              </label>
              {availableSlots.length > 0 ? (
                <div className={styles.timeSlotsGrid}>
                  {availableSlots.map((slot, index) => {
                    const endTime = calculateEndTime(slot.startTime, selectedDuration);
                    const isSlotAvailable = slot.available && slot.status === 'available';
                    
                    return (
                      <button
                        key={index}
                        onClick={() => isSlotAvailable ? handleSlotSelect(slot) : null}
                        disabled={!isSlotAvailable}
                        className={`${styles.timeSlotButton} ${selectedSlot === slot ? styles.selected : ''}`}
                      >
                        <div>
                          {slot.startTime} - {endTime}
                        </div>
                        {!isSlotAvailable && (
                          <div className="text-xs text-gray-400">Dolu</div>
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
              <div className={`${styles.infoBox} ${
                geofenceStatus === 'allowed' ? styles.infoBoxSuccess : 
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
                  Açıklama
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
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
                  disabled={submitting}
                  className={`${styles.verifyButton} ${submitting ? styles.disabled : ''}`}
                >
                  <MapPinIcon className={styles.buttonIcon} />
                  {geofenceStatus === 'checking' ? 'Konum Doğrulanıyor...' : 'Konumumu Doğrula'}
                </button>
                <button
                  type="submit"
                  disabled={submitting || !geofenceVerified}
                  className={`${styles.submitButton} ${(submitting || !geofenceVerified) ? styles.disabled : ''}`}
                >
                  {submitting ? 'Gönderiliyor...' : 'Randevu Talebi Gönder'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FacultyAppointment; 