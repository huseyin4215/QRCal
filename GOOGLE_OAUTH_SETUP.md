# Google OAuth 2.0 Kurulum Rehberi

## 🔧 Sorun: "Missing required parameter: client_id"

Bu hata Google OAuth yapılandırmasının eksik olmasından kaynaklanıyor.

## 📋 Çözüm Adımları

### 1. Google Cloud Console'a Gidin
1. [Google Cloud Console](https://console.cloud.google.com/)'a gidin
2. Projenizi seçin veya yeni proje oluşturun

### 2. OAuth 2.0 Kimlik Bilgilerini Oluşturun
1. **APIs & Services > Credentials** bölümüne gidin
2. **+ CREATE CREDENTIALS > OAuth 2.0 Client IDs** tıklayın
3. **Application type** olarak **Web application** seçin
4. **Name** alanına: `QR Calendar Backend`

### 3. Authorized JavaScript Origins Ekleme
```
http://localhost:8081
http://localhost:5173
http://localhost:3000
http://localhost:4173
```

### 4. Authorized Redirect URIs Ekleme
```
http://localhost:5000/api/google/callback
http://localhost:8081/auth/google/callback
http://localhost:5173/auth/google/callback
```

### 5. Client ID ve Client Secret'ı Kopyalayın
- **Client ID**: `194091113508-rvckovns6g1gnn7mrh8atrnjoq53dm6l.apps.googleusercontent.com`
- **Client Secret**: [Google Cloud Console'dan kopyalayın]

### 6. Backend .env Dosyası Oluşturun
```bash
cd backend
cp env.example .env
```

### 7. .env Dosyasını Düzenleyin
```env
# Google OAuth Configuration
GOOGLE_CLIENT_ID=194091113508-rvckovns6g1gnn7mrh8atrnjoq53dm6l.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-your-actual-client-secret-here
GOOGLE_REDIRECT_URI=http://localhost:5000/api/google/callback

# Frontend URL
FRONTEND_URL=http://localhost:8081
```

### 8. Gerekli API'leri Etkinleştirin
**APIs & Services > Library** bölümünde:
- ✅ Google Calendar API
- ✅ Google+ API
- ✅ Google People API

### 9. OAuth Consent Screen Ayarları
1. **APIs & Services > OAuth consent screen**
2. **User Type**: External
3. **App name**: QR Calendar
4. **User support email**: [email adresiniz]
5. **Developer contact information**: [email adresiniz]

### 10. Scopes Ekleme
**Scopes** bölümünde:
- `https://www.googleapis.com/auth/userinfo.profile`
- `https://www.googleapis.com/auth/userinfo.email`
- `https://www.googleapis.com/auth/calendar.readonly`
- `https://www.googleapis.com/auth/calendar.events`

### 11. Test Users Ekleme
**Test users** bölümünde kendi email adresinizi ekleyin.

## 🚀 Test Etme

### Backend'i Yeniden Başlatın
```bash
cd backend
npm start
```

### Frontend'i Test Edin
1. Tarayıcıda `http://localhost:8081` açın
2. Google ile giriş yapmayı deneyin

## ❌ Yaygın Hatalar

### Hata 1: "Invalid client_id"
**Çözüm**: Client ID'nin doğru kopyalandığından emin olun

### Hata 2: "Redirect URI mismatch"
**Çözüm**: Authorized redirect URIs'e doğru URL'leri ekleyin

### Hata 3: "Access blocked"
**Çözüm**: Test users listesine email adresinizi ekleyin

## 📞 Yardım

Eğer hala sorun yaşıyorsanız:
1. Google Cloud Console'da tüm ayarları kontrol edin
2. .env dosyasının doğru konumda olduğundan emin olun
3. Backend'i yeniden başlatın
4. Browser cache'ini temizleyin 