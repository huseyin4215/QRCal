# Qnnect - QR Takvim Randevu Sistemi

Akademik randevu yönetimi için QR kod tabanlı sistem.

## Kurulum

### 1. Tüm Bağımlılıkları Kur (Tek Seferde)

```bash
npm run setup
```

Bu komut hem frontend hem backend için tüm paketleri kuracak.

### 2. Ortam Değişkenlerini Ayarla

`.env` dosyasını düzenleyin:

```bash
# Backend Environment Variables
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/qrcal

# JWT Configuration
JWT_SECRET=qrcal-super-secret-jwt-key-2024-change-this-in-production
JWT_EXPIRE=7d

# Frontend URL
FRONTEND_URL=http://localhost:8081

# Google OAuth Configuration
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_REDIRECT_URI=http://localhost:8081/api/google/callback

# CORS Configuration
CORS_ORIGIN=http://localhost:8081,http://localhost:5173,http://localhost:3000

# Email Configuration
EMAIL_USER=your-email@gmail.com
EMAIL_APP_PASSWORD="your-app-password"

# Frontend Environment Variables
VITE_API_URL=http://localhost:5000/api
VITE_APP_NAME=QR Takvim
VITE_APP_DESCRIPTION=Akademik Randevu Sistemi
VITE_GOOGLE_CLIENT_ID=your-client-id
```

### 3. MongoDB'yi Başlat

MongoDB'nin çalıştığından emin olun:

```bash
mongod
```

### 4. Admin Kullanıcı Oluştur

```bash
cd backend
node createAdmin.js
```

Script sizden şu bilgileri isteyecek:
- 👤 **Ad Soyad** (minimum 2 karakter)
- 📧 **E-posta adresi** (geçerli format kontrolü)
- 🔑 **Şifre** (minimum 6 karakter)
- 🏢 **Departman** (isteğe bağlı, varsayılan: "Yönetim")

**Not:** Eğer admin kullanıcı zaten varsa, script size mevcut admin bilgilerini gösterecek ve yeni bir tane oluşturmak isteyip istemediğinizi soracak.

## Çalıştırma

### Tek Komutla Her Şeyi Başlat

```bash
npm start
```

Bu komut hem frontend (port 8081) hem backend (port 5000) servislerini başlatacak.

### Ayrı Ayrı Başlatma

**Frontend:**
```bash
npm run dev
```

**Backend:**
```bash
npm run dev:backend
```

## Kullanılan Teknolojiler

### Frontend
- React 18
- Vite
- TailwindCSS
- React Router
- QRCode.react
- Leaflet (harita)

### Backend
- Node.js
- Express
- MongoDB
- Mongoose
- JWT
- Google OAuth
- Nodemailer

