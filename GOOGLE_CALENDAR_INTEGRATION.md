# Google Calendar Entegrasyonu

Bu dokümantasyon, QRCal uygulamasında Google Calendar entegrasyonunun nasıl kurulacağını ve kullanılacağını açıklar.

## 🎯 Özellikler

- ✅ Google OAuth 2.0 ile güvenli kimlik doğrulama
- ✅ Google Calendar etkinliklerini görüntüleme
- ✅ Yeni etkinlik oluşturma
- ✅ Otomatik token yenileme
- ✅ Randevu çakışması kontrolü
- ✅ Tüm kullanıcı rolleri için destek (Admin, Faculty, Student)

## 🔧 Kurulum

### 1. Google Cloud Console Ayarları

1. [Google Cloud Console](https://console.cloud.google.com/)'a gidin
2. Projenizi seçin veya yeni bir proje oluşturun
3. **APIs & Services > Library** bölümüne gidin
4. Aşağıdaki API'leri etkinleştirin:
   - Google Calendar API
   - Google+ API (veya Google Identity API)

### 2. OAuth 2.0 Kimlik Bilgileri

1. **APIs & Services > Credentials** bölümüne gidin
2. **Create Credentials > OAuth 2.0 Client IDs** seçin
3. Uygulama türünü seçin:
   - **Web application** (backend için)
   - **JavaScript origins** (frontend için)

### 3. Environment Variables

Backend `.env` dosyasına aşağıdaki değişkenleri ekleyin:

```env
# Google OAuth Configuration
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_REDIRECT_URI=http://localhost:5000/api/google/callback

# Frontend URL
FRONTEND_URL=http://localhost:5173
```

## 🚀 Kullanım

### Backend API Endpoints

#### 1. Google OAuth URL Alma
```http
GET /api/google/auth-url
```

#### 2. OAuth Callback
```http
GET /api/google/callback?code=authorization_code
```

#### 3. Calendar Etkinliklerini Alma
```http
GET /api/google/calendar/events?timeMin=2024-01-01T00:00:00Z&timeMax=2024-01-07T23:59:59Z&maxResults=50
```

#### 4. Yeni Etkinlik Oluşturma
```http
POST /api/google/calendar/events
Content-Type: application/json

{
  "summary": "Toplantı",
  "description": "Proje toplantısı",
  "start": "2024-01-15T10:00:00Z",
  "end": "2024-01-15T11:00:00Z",
  "attendees": ["user@example.com"]
}
```

#### 5. Google Calendar Bağlantısını Kesme
```http
DELETE /api/google/disconnect
```

### Frontend Komponentleri

#### 1. GoogleCalendarConnect
Google Calendar bağlantısını yöneten komponent:

```jsx
import GoogleCalendarConnect from '../components/GoogleCalendarConnect';

<GoogleCalendarConnect />
```

#### 2. GoogleCalendarWidget
Calendar etkinliklerini görüntüleyen widget:

```jsx
import GoogleCalendarWidget from '../components/GoogleCalendarWidget';

<GoogleCalendarWidget />
```

### API Service Metodları

```javascript
import apiService from '../services/apiService';

// Google OAuth URL alma
const authUrlResponse = await apiService.getGoogleAuthUrl();

// Calendar etkinliklerini alma
const eventsResponse = await apiService.getGoogleCalendarEvents(
  startTime,
  endTime,
  maxResults
);

// Yeni etkinlik oluşturma
const createEventResponse = await apiService.createGoogleCalendarEvent({
  summary: 'Toplantı',
  description: 'Açıklama',
  start: '2024-01-15T10:00:00Z',
  end: '2024-01-15T11:00:00Z'
});

// Bağlantıyı kesme
const disconnectResponse = await apiService.disconnectGoogleCalendar();
```

## 🔐 Güvenlik

### Token Yönetimi
- Access token'lar güvenli bir şekilde veritabanında saklanır
- Refresh token'lar otomatik olarak yenilenir
- Token'lar düzenli olarak kontrol edilir

### OAuth Scopes
```javascript
const scopes = [
  'https://www.googleapis.com/auth/calendar.readonly',
  'https://www.googleapis.com/auth/calendar.events',
  'https://www.googleapis.com/auth/userinfo.profile',
  'https://www.googleapis.com/auth/userinfo.email'
];
```

## 📱 Kullanıcı Deneyimi

### Bağlantı Süreci
1. Kullanıcı "Google Calendar Bağla" butonuna tıklar
2. Google OAuth sayfasına yönlendirilir
3. İzinleri onaylar
4. Callback sayfasında başarılı bağlantı mesajı görür
5. Dashboard'a yönlendirilir

### Etkinlik Görüntüleme
- Haftalık etkinlikler otomatik olarak yüklenir
- Etkinlik detayları (başlık, saat, açıklama) görüntülenir
- Yenileme butonu ile güncel veriler alınabilir

## 🛠️ Geliştirme

### Yeni Özellik Ekleme

#### 1. Yeni API Endpoint
```javascript
// backend/routes/googleAuth.js
router.get('/calendar/calendars', authMiddleware, asyncHandler(async (req, res) => {
  // Kullanıcının tüm takvimlerini listele
}));
```

#### 2. Frontend Service Metodu
```javascript
// src/services/apiService.js
async getGoogleCalendars() {
  return this.request('/google/calendar/calendars');
}
```

#### 3. Frontend Komponenti
```jsx
// src/components/GoogleCalendarSelector.jsx
const GoogleCalendarSelector = () => {
  // Takvim seçici komponenti
};
```

### Hata Yönetimi
```javascript
try {
  const response = await apiService.getGoogleCalendarEvents();
  // Başarılı işlem
} catch (error) {
  if (error.code === 401) {
    // Token yenileme gerekli
  } else {
    // Genel hata
  }
}
```

## 🔍 Debugging

### Backend Logları
```javascript
console.log('Google OAuth callback:', { code, userInfo });
console.log('Calendar API response:', response.data);
console.log('Token refresh:', credentials);
```

### Frontend Logları
```javascript
console.log('Calendar events loaded:', events);
console.log('Google connection status:', isConnected);
```

## 📋 Test Senaryoları

### 1. Bağlantı Testi
- [ ] Google OAuth URL alma
- [ ] OAuth callback işleme
- [ ] Token saklama
- [ ] Kullanıcı bilgileri güncelleme

### 2. Calendar Testi
- [ ] Etkinlik listesi alma
- [ ] Yeni etkinlik oluşturma
- [ ] Token yenileme
- [ ] Bağlantı kesme

### 3. Hata Senaryoları
- [ ] Geçersiz token
- [ ] Network hatası
- [ ] API limit aşımı
- [ ] Kullanıcı izni reddetme

## 🚨 Bilinen Sorunlar

1. **Token Yenileme**: Refresh token'lar bazen geçersiz olabilir
2. **API Limitleri**: Google Calendar API günlük limitleri
3. **CORS**: Frontend-backend CORS ayarları

## 📞 Destek

Sorun yaşarsanız:
1. Console loglarını kontrol edin
2. Network sekmesinde API çağrılarını inceleyin
3. Google Cloud Console'da API kullanımını kontrol edin
4. Environment variable'ları doğrulayın

## 🔄 Güncellemeler

- **v1.0.0**: Temel Google Calendar entegrasyonu
- **v1.1.0**: Token yenileme eklendi
- **v1.2.0**: Widget komponenti eklendi
- **v1.3.0**: Hata yönetimi iyileştirildi 