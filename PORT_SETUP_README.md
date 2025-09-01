# 🚀 QrCal Port Yapılandırması

## 📋 Port Bilgileri

| Servis | Port | Açıklama |
|--------|------|----------|
| **Frontend (Vite)** | 8081 | React uygulaması |
| **Backend (Express)** | 5000 | API server |
| **MongoDB** | 27017 | Veritabanı |

## 🔧 Yapılandırma

### Frontend (Vite)
- **Port:** 8081
- **API:** `http://localhost:5000/api`
- **HMR:** 8081 portunda WebSocket

### Backend (Express)
- **Port:** 5000
- **CORS:** 8081 portundan gelen istekleri kabul eder
- **API Base:** `/api`

## 🚀 Çalıştırma

### 1. Backend'i Başlat
```bash
cd backend
npm start
# Backend http://localhost:5000'de çalışacak
```

### 2. Frontend'i Başlat
```bash
npm run dev
# Frontend http://localhost:8081'de çalışacak
```

### 3. Test Et
```bash
# Test dosyasını aç
open test-ports.html
```

## 🔗 API İstekleri

### Development (Proxy)
```
Frontend: http://localhost:5173
API: /api/health → http://localhost:5000/api/health
```

### Production
```
Frontend: https://yourdomain.com
API: https://yourdomain.com/api/health
```

## 🌐 CORS Ayarları

Backend'de izin verilen origin'ler:
- `http://localhost:8081` (Ana frontend)
- `http://localhost:5173` (Alternatif port)
- `http://localhost:3000` (Alternatif port)

## 🔐 Google OAuth

### Google Cloud Console'da Eklenecek URI'ler:
```
http://localhost:8081
http://localhost:8081/auth/callback
http://localhost:8081/auth-success
http://localhost:8081/auth-error
http://localhost:8081/login
http://localhost:8081/register
```

### Backend Callback:
```
http://localhost:5000/api/google/callback
```

## 🧪 Test

`test-ports.html` dosyasını kullanarak:
- Frontend bağlantısını test et
- Backend bağlantısını test et
- Proxy çalışmasını test et
- Google OAuth'u test et

## ❗ Sorun Giderme

### WebSocket Hatası
- Frontend 5173 portunda çalışıyor mu?
- HMR port ayarı doğru mu?

### API Hatası
- Backend 5000 portunda çalışıyor mu?
- Proxy yapılandırması doğru mu?
- CORS ayarları güncel mi?

### Google OAuth Hatası
- Google Cloud Console'da 5173 portu ekli mi?
- Backend environment variables doğru mu?
