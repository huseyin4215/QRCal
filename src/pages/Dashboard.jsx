import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { groupEventsByDay, formatEventTime, getDayName, initializeGoogleAPI, getCurrentWeekEvents } from '../utils/googleCalendar';
import { generatePDF, generateSimplePDF, createQRCodeData, generatePersonalCalendarURL } from '../utils/pdfGenerator';
import QRCodeEditor from '../components/QRCodeEditor';
import { DocumentArrowDownIcon, CalendarIcon, CloudArrowDownIcon, UserIcon, CogIcon } from '@heroicons/react/24/outline';

const Dashboard = () => {
  const { user, logout, updateUser } = useAuth();
  const [groupedEvents, setGroupedEvents] = useState({});
  const [loading, setLoading] = useState(false);
  const [calendarLoading, setCalendarLoading] = useState(false);
  const [calendarInitialized, setCalendarInitialized] = useState(false);
  const [showQREditor, setShowQREditor] = useState(false);
  const [showUserForm, setShowUserForm] = useState(false);
  
  // User profile data - Load from localStorage
  const [userProfile, setUserProfile] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
    department: '',
    title: '',
    office: '',
    website: ''
  });

  // Load user profile from localStorage on component mount
  useEffect(() => {
    const savedProfile = localStorage.getItem('qrcal_user_profile');
    if (savedProfile) {
      const parsedProfile = JSON.parse(savedProfile);
      setUserProfile(prev => ({
        ...prev,
        ...parsedProfile,
        name: parsedProfile.name || user?.name || '',
        email: parsedProfile.email || user?.email || ''
      }));
    }
  }, [user]);

  useEffect(() => {
    if (user?.events && user.events.length > 0) {
      const grouped = groupEventsByDay(user.events);
      setGroupedEvents(grouped);
    }
  }, [user]);

  const handleLoadCalendar = async () => {
    setCalendarLoading(true);
    try {
      // Check if user has access token
      if (!user?.accessToken) {
        alert('Takvim erişimi için lütfen tekrar giriş yapın.');
        return;
      }
      
      // Get calendar events using access token
      const events = await getCurrentWeekEvents(user.accessToken);
      
      // Update user with events
      updateUser({ events });
      
    } catch (error) {
      console.error('Calendar loading error:', error);
      alert('Takvim yüklenirken bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setCalendarLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    setLoading(true);
    try {
      console.log('Starting PDF download...');
      
      // Try the main PDF generation first
      try {
        await generatePDF('print-section', `${userProfile.name || user.name}_program.pdf`);
        console.log('PDF generated successfully');
      } catch (pdfError) {
        console.warn('Main PDF generation failed, trying fallback:', pdfError);
        
        // Fallback to simple PDF generation
        const allEvents = user?.events || [];
        await generateSimplePDF(userProfile, allEvents, `${userProfile.name || user.name}_program.pdf`);
        console.log('Fallback PDF generated successfully');
      }
      
    } catch (error) {
      console.error('PDF oluşturma hatası:', error);
      alert(`PDF oluşturulurken bir hata oluştu: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
  };

  const handleProfileSave = () => {
    localStorage.setItem('qrcal_user_profile', JSON.stringify(userProfile));
    setShowUserForm(false);
    alert('Profil bilgileri kaydedildi!');
  };

  const calendarUrl = generatePersonalCalendarURL(user?.id);
  const qrCodeData = createQRCodeData(user, calendarUrl);

  // Get current week dates
  const getWeekDates = () => {
    const dates = [];
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      dates.push(date);
    }
    
    return dates;
  };

  const weekDates = getWeekDates();
  const hasEvents = user?.events && user.events.length > 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <CalendarIcon className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-xl font-semibold text-gray-900">QR Takvim</h1>
                <p className="text-sm text-gray-500">Haftalık Program</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <img 
                  src={user?.picture} 
                  alt={user?.name}
                  className="h-8 w-8 rounded-full"
                />
                <span className="text-sm font-medium text-gray-700">
                  {user?.name}
                </span>
              </div>
              
              <button
                onClick={() => setShowUserForm(!showUserForm)}
                className="btn-secondary text-sm flex items-center gap-2"
              >
                <UserIcon className="h-4 w-4" />
                Profil
              </button>
              
              <button
                onClick={handleLogout}
                className="btn-secondary text-sm"
              >
                Çıkış
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Calendar Section */}
          <div className="lg:col-span-3">
            <div className="card">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold text-gray-900">
                  Bu Hafta
                </h2>
                <div className="flex space-x-2">
                  {!hasEvents && (
                    <button
                      onClick={handleLoadCalendar}
                      disabled={calendarLoading}
                      className="btn-secondary flex items-center space-x-2"
                    >
                      <CloudArrowDownIcon className="h-4 w-4" />
                      <span>{calendarLoading ? 'Yükleniyor...' : 'Takvimi Yükle'}</span>
                    </button>
                  )}
                  {hasEvents && (
                    <button
                      onClick={handleDownloadPDF}
                      disabled={loading}
                      className="btn-primary flex items-center space-x-2"
                    >
                      <DocumentArrowDownIcon className="h-4 w-4" />
                      <span>{loading ? 'Oluşturuluyor...' : 'PDF İndir'}</span>
                    </button>
                  )}
                </div>
              </div>

              {!hasEvents ? (
                <div className="text-center py-12">
                  <CalendarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Takvim Verisi Yok
                  </h3>
                  <p className="text-gray-500 mb-4">
                    {!user?.accessToken ? (
                      <>
                        Google Calendar erişimi için backend entegrasyonu gereklidir. 
                        Şu anda örnek veriler kullanılmaktadır.
                      </>
                    ) : (
                      'Haftalık programınızı görüntülemek için Google Calendar verilerinizi yükleyin.'
                    )}
                  </p>
                  <button
                    onClick={handleLoadCalendar}
                    disabled={calendarLoading}
                    className="btn-primary"
                  >
                    {calendarLoading ? 'Yükleniyor...' : 'Takvimi Yükle'}
                  </button>
                  {!user?.accessToken && (
                    <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-sm text-yellow-800">
                        <strong>Not:</strong> Gerçek Google Calendar verilerine erişim için backend API'si gereklidir. 
                        Şu anda örnek veriler gösterilmektedir.
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                /* Weekly Calendar */
                <div className="grid grid-cols-7 gap-4">
                  {weekDates.map((date, index) => {
                    const dateString = date.toDateString();
                    const dayEvents = groupedEvents[dateString] || [];
                    
                    return (
                      <div key={index} className="space-y-2">
                        <div className="text-center">
                          <div className="text-sm font-medium text-gray-900">
                            {getDayName(date)}
                          </div>
                          <div className="text-xs text-gray-500">
                            {date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })}
                          </div>
                        </div>
                        
                        <div className="space-y-1">
                          {dayEvents.map((event, eventIndex) => (
                            <div
                              key={eventIndex}
                              className="p-2 bg-blue-50 border border-blue-200 rounded text-xs"
                            >
                              <div className="font-medium text-blue-900 truncate">
                                {event.summary}
                              </div>
                              <div className="text-blue-700">
                                {formatEventTime(event)}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* QR Code Section */}
          <div className="lg:col-span-1 space-y-6">
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Kişisel QR Kod
                </h3>
                <button
                  onClick={() => setShowQREditor(!showQREditor)}
                  className="btn-secondary text-sm flex items-center gap-2"
                >
                  <CogIcon className="h-4 w-4" />
                  Düzenle
                </button>
              </div>
              <QRCodeEditor value={qrCodeData} />
              <div className="mt-4 text-center">
                <p className="text-xs text-gray-500">
                  Bu QR kodu tarayarak kişisel takvim bağlantısına erişebilirsiniz.
                </p>
              </div>
            </div>

            {/* QR Code Editor */}
            {showQREditor && (
              <div className="mt-6">
                <QRCodeEditor value={qrCodeData} />
              </div>
            )}
          </div>
        </div>

        {/* User Profile Form */}
        {showUserForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl p-6 max-w-md w-full max-h-90vh overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold gradient-text flex items-center gap-2">
                  <UserIcon className="h-6 w-6" />
                  Profil Bilgileri
                </h3>
                <button
                  onClick={() => setShowUserForm(false)}
                  className="text-gray-400 hover-text-gray-600"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ad Soyad
                  </label>
                  <input
                    type="text"
                    value={userProfile.name}
                    onChange={(e) => setUserProfile(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full p-2 border border-gray-300 rounded-lg focus-ring-2 focus-ring-blue-500 focus-border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    E-posta
                  </label>
                  <input
                    type="email"
                    value={userProfile.email}
                    onChange={(e) => setUserProfile(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full p-2 border border-gray-300 rounded-lg focus-ring-2 focus-ring-blue-500 focus-border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Telefon
                  </label>
                  <input
                    type="tel"
                    value={userProfile.phone}
                    onChange={(e) => setUserProfile(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full p-2 border border-gray-300 rounded-lg focus-ring-2 focus-ring-blue-500 focus-border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Bölüm
                  </label>
                  <input
                    type="text"
                    value={userProfile.department}
                    onChange={(e) => setUserProfile(prev => ({ ...prev, department: e.target.value }))}
                    className="w-full p-2 border border-gray-300 rounded-lg focus-ring-2 focus-ring-blue-500 focus-border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Unvan
                  </label>
                  <input
                    type="text"
                    value={userProfile.title}
                    onChange={(e) => setUserProfile(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full p-2 border border-gray-300 rounded-lg focus-ring-2 focus-ring-blue-500 focus-border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ofis
                  </label>
                  <input
                    type="text"
                    value={userProfile.office}
                    onChange={(e) => setUserProfile(prev => ({ ...prev, office: e.target.value }))}
                    className="w-full p-2 border border-gray-300 rounded-lg focus-ring-2 focus-ring-blue-500 focus-border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Web Sitesi
                  </label>
                  <input
                    type="url"
                    value={userProfile.website}
                    onChange={(e) => setUserProfile(prev => ({ ...prev, website: e.target.value }))}
                    className="w-full p-2 border border-gray-300 rounded-lg focus-ring-2 focus-ring-blue-500 focus-border-transparent"
                  />
                </div>
              </div>

              <div className="flex space-x-3 mt-6">
                <button
                  onClick={handleProfileSave}
                  className="btn-primary flex-1"
                >
                  Kaydet
                </button>
                <button
                  onClick={() => setShowUserForm(false)}
                  className="btn-secondary flex-1"
                >
                  İptal
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Hidden Print Section - Fixed for PDF generation */}
      <div id="print-section" className="hidden">
        <div className="p-8 bg-white" style={{ width: '210mm', minHeight: '297mm', fontFamily: 'Arial, sans-serif' }}>
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {userProfile.name || user?.name}
            </h1>
            <p className="text-gray-600">{userProfile.email || user?.email}</p>
            {userProfile.title && <p className="text-gray-600">{userProfile.title}</p>}
            {userProfile.department && <p className="text-gray-600">{userProfile.department}</p>}
            {userProfile.phone && <p className="text-gray-600">{userProfile.phone}</p>}
            {userProfile.office && <p className="text-gray-600">Ofis: {userProfile.office}</p>}
            <p className="text-sm text-gray-500">
              Haftalık Program - {new Date().toLocaleDateString('tr-TR')}
            </p>
          </div>

          {/* QR Code */}
          <div className="flex justify-center mb-8">
            <QRCodeEditor value={qrCodeData} size={150} />
          </div>

          {/* Weekly Schedule */}
          <div className="grid grid-cols-7 gap-4">
            {weekDates.map((date, index) => {
              const dateString = date.toDateString();
              const dayEvents = groupedEvents[dateString] || [];
              
              return (
                <div key={index} className="border border-gray-200 rounded p-2">
                  <div className="text-center mb-2">
                    <div className="text-sm font-medium text-gray-900">
                      {getDayName(date)}
                    </div>
                    <div className="text-xs text-gray-500">
                      {date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })}
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    {dayEvents.map((event, eventIndex) => (
                      <div
                        key={eventIndex}
                        className="p-1 bg-gray-50 rounded text-xs"
                      >
                        <div className="font-medium text-gray-900 truncate">
                          {event.summary}
                        </div>
                        <div className="text-gray-600">
                          {formatEventTime(event)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 