# Google Calendar Erişimi Kurulum Rehberi

Bu rehber, QR Takvim uygulamasında Google Calendar verilerine erişim sağlamak için gerekli adımları açıklar.

## 🔧 Mevcut Durum

Şu anda uygulama Google Identity Services kullanarak kullanıcı girişi yapmaktadır, ancak Calendar API erişimi için backend entegrasyonu gereklidir.

## 📋 Gerekli Adımlar

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

### 3. Gerekli OAuth Scopes

Calendar erişimi için aşağıdaki scope'lar gereklidir:

```javascript
// Sadece okuma izni
'https://www.googleapis.com/auth/calendar.readonly'

// Okuma ve yazma izni (etkinlik oluşturmak için)
'https://www.googleapis.com/auth/calendar.events'

// Kullanıcı bilgileri
'https://www.googleapis.com/auth/userinfo.profile'
'https://www.googleapis.com/auth/userinfo.email'
```

## 🚀 Backend Entegrasyonu

### Node.js/Express Örneği

```javascript
const express = require('express');
const { google } = require('googleapis');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Google OAuth 2.0 client
const oauth2Client = new google.auth.OAuth2(
  'YOUR_CLIENT_ID',
  'YOUR_CLIENT_SECRET',
  'http://localhost:3000/auth/callback'
);

// Authorization URL oluştur
app.get('/auth/google', (req, res) => {
  const scopes = [
    'https://www.googleapis.com/auth/calendar.readonly',
    'https://www.googleapis.com/auth/userinfo.profile',
    'https://www.googleapis.com/auth/userinfo.email'
  ];

  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
    prompt: 'consent'
  });

  res.json({ authUrl });
});

// OAuth callback
app.get('/auth/callback', async (req, res) => {
  const { code } = req.query;
  
  try {
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);
    
    // Access token'ı frontend'e gönder
    res.redirect(`/dashboard?token=${tokens.access_token}`);
  } catch (error) {
    console.error('Token exchange error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
});

// Calendar events endpoint
app.get('/api/calendar/events', async (req, res) => {
  try {
    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
    
    const response = await calendar.events.list({
      calendarId: 'primary',
      timeMin: new Date().toISOString(),
      maxResults: 50,
      singleEvents: true,
      orderBy: 'startTime',
    });

    res.json(response.data.items);
  } catch (error) {
    console.error('Calendar API error:', error);
    res.status(500).json({ error: 'Failed to fetch calendar events' });
  }
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});
```

### Frontend Güncellemeleri

```javascript
// GoogleLogin.jsx güncellemesi
const handleGoogleLogin = async () => {
  try {
    // Backend'den authorization URL al
    const response = await fetch('/auth/google');
    const { authUrl } = await response.json();
    
    // Kullanıcıyı Google OAuth sayfasına yönlendir
    window.location.href = authUrl;
  } catch (error) {
    console.error('Login error:', error);
  }
};

// Dashboard.jsx güncellemesi
const handleLoadCalendar = async () => {
  setCalendarLoading(true);
  try {
    const response = await fetch('/api/calendar/events', {
      headers: {
        'Authorization': `Bearer ${user.accessToken}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch calendar events');
    }
    
    const events = await response.json();
    updateUser({ events });
  } catch (error) {
    console.error('Calendar loading error:', error);
    alert('Takvim yüklenirken bir hata oluştu.');
  } finally {
    setCalendarLoading(false);
  }
};
```

## 🔐 Güvenlik Notları

1. **Client Secret**: Asla frontend kodunda saklamayın
2. **Access Token**: Güvenli bir şekilde saklayın ve düzenli olarak yenileyin
3. **HTTPS**: Production'da mutlaka HTTPS kullanın
4. **CORS**: Backend'de CORS ayarlarını doğru yapılandırın

## 📱 Mevcut Uygulama Durumu

Şu anda uygulama:
- ✅ Google Identity Services ile kullanıcı girişi
- ✅ Kullanıcı profil bilgileri
- ✅ Örnek takvim verileri
- ❌ Gerçek Google Calendar erişimi (backend gereklidir)

## 🎯 Sonraki Adımlar

1. Backend API'si oluşturun
2. OAuth 2.0 flow'unu implement edin
3. Calendar API entegrasyonunu tamamlayın
4. Access token yenileme mekanizması ekleyin
5. Hata yönetimi ve kullanıcı deneyimini iyileştirin

## 📚 Faydalı Kaynaklar

- [Google Calendar API Documentation](https://developers.google.com/calendar/api)
- [Google OAuth 2.0 Guide](https://developers.google.com/identity/protocols/oauth2)
- [Google Identity Services](https://developers.google.com/identity/gsi/web) 