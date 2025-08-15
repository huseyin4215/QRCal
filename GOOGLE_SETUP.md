# Google Cloud Console Kurulum Rehberi

Bu rehber, QR Takvim uygulaması için Google OAuth ve Calendar API ayarlarını yapmanızı sağlar.

## 📋 Gereksinimler

- Google hesabı
- Google Cloud Console erişimi

## 🚀 Adım Adım Kurulum

### 1. Google Cloud Console'a Giriş

1. [Google Cloud Console](https://console.cloud.google.com/)'a gidin
2. Google hesabınızla giriş yapın

### 2. Proje Oluşturma

1. Üst menüden **"Select a project"** tıklayın
2. **"New Project"** butonuna tıklayın
3. Proje adını girin: `QR Takvim` (veya istediğiniz bir isim)
4. **"Create"** butonuna tıklayın
5. Proje oluşturulduktan sonra seçili olduğundan emin olun

### 3. Google Calendar API'yi Etkinleştirme

1. Sol menüden **"APIs & Services"** > **"Library"** seçin
2. Arama kutusuna **"Google Calendar API"** yazın
3. **"Google Calendar API"**'yi seçin
4. **"Enable"** butonuna tıklayın

### 4. OAuth Consent Screen Ayarları

1. Sol menüden **"APIs & Services"** > **"OAuth consent screen"** seçin
2. **"External"** seçin ve **"Create"** tıklayın
3. Aşağıdaki bilgileri doldurun:
   - **App name**: `QR Takvim`
   - **User support email**: E-posta adresiniz
   - **Developer contact information**: E-posta adresiniz
4. **"Save and Continue"** tıklayın
5. **"Scopes"** sayfasında **"Add or Remove Scopes"** tıklayın
6. Aşağıdaki scope'ları ekleyin:
   - `https://www.googleapis.com/auth/calendar.readonly`
   - `https://www.googleapis.com/auth/userinfo.email`
   - `https://www.googleapis.com/auth/userinfo.profile`
7. **"Update"** ve **"Save and Continue"** tıklayın
8. **"Test users"** sayfasında **"Add Users"** tıklayın
9. Kendi e-posta adresinizi ekleyin
10. **"Save and Continue"** tıklayın

### 5. OAuth 2.0 Client ID Oluşturma

1. Sol menüden **"APIs & Services"** > **"Credentials"** seçin
2. **"Create Credentials"** > **"OAuth client ID"** tıklayın
3. **"Application type"** olarak **"Web application"** seçin
4. **"Name"** alanına: `QR Takvim Web Client`
5. **"Authorized JavaScript origins"** bölümüne ekleyin:
   - `http://localhost:3000` (geliştirme için)
   - `http://localhost:5173` (Vite default port)
6. **"Authorized redirect URIs"** bölümüne ekleyin:
   - `http://localhost:3000`
   - `http://localhost:5173`
7. **"Create"** butonuna tıklayın
8. **Client ID**'yi kopyalayın (`.env` dosyasına eklenecek)

### 6. API Key Oluşturma

1. **"Create Credentials"** > **"API key"** tıklayın
2. **"API key"**'i kopyalayın (`.env` dosyasına eklenecek)
3. **"Restrict key"** tıklayın
4. **"Application restrictions"** bölümünde **"HTTP referrers"** seçin
5. **"Website restrictions"** bölümüne ekleyin:
   - `http://localhost:3000/*`
   - `http://localhost:5173/*`
6. **"API restrictions"** bölümünde **"Restrict key"** seçin
7. **"Select APIs"** tıklayın ve **"Google Calendar API"** seçin
8. **"Save"** tıklayın

### 7. Environment Variables Ayarlama

1. Proje klasörünüzde `env.example` dosyasını `.env` olarak kopyalayın:
   ```bash
   cp env.example .env
   ```

2. `.env` dosyasını düzenleyin:
   ```env
   VITE_GOOGLE_CLIENT_ID=your-client-id-here.apps.googleusercontent.com
   VITE_GOOGLE_API_KEY=your-api-key-here
   ```

3. `your-client-id-here` yerine 5. adımda aldığınız Client ID'yi yazın
4. `your-api-key-here` yerine 6. adımda aldığınız API Key'i yazın

### 8. Uygulamayı Test Etme

1. Terminal'de proje klasörüne gidin
2. Uygulamayı başlatın:
   ```bash
   npm run dev
   ```
3. Tarayıcıda `http://localhost:8081` (veya gösterilen port) açın
4. Google ile giriş yapmayı deneyin

## 🔧 Sorun Giderme

### "This app isn't verified" Hatası

Bu normal bir durumdur. Geliştirme aşamasında kendi hesabınızla test edebilirsiniz.

### "Access blocked" Hatası

1. OAuth consent screen'de test kullanıcısı olarak eklendiğinizden emin olun
2. Authorized origins'de doğru port numarasının olduğunu kontrol edin

### Calendar API Hatası

1. Google Calendar API'nin etkin olduğunu kontrol edin
2. API Key'in doğru olduğunu kontrol edin
3. API Key'in Calendar API için kısıtlandığını kontrol edin

### CORS Hatası

1. Authorized origins'de doğru domain'in olduğunu kontrol edin
2. Port numarasının doğru olduğunu kontrol edin

## 🚀 Production Deployment

Production'a deploy ederken:

1. **OAuth consent screen**'de **"Publish app"** yapın
2. **Authorized origins**'e production domain'inizi ekleyin
3. **Authorized redirect URIs**'e production URL'inizi ekleyin
4. Environment variables'ı production sunucunuzda ayarlayın

## 📞 Destek

Sorun yaşarsanız:

1. Google Cloud Console'da **"IAM & Admin"** > **"Quotas"** kontrol edin
2. **"APIs & Services"** > **"Dashboard"**'da API kullanımını kontrol edin
3. Browser console'da hata mesajlarını kontrol edin

---

**Not**: Bu ayarlar sadece geliştirme içindir. Production kullanımı için ek güvenlik önlemleri alınmalıdır. 