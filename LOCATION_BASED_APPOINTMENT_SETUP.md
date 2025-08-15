# 📍 Konum Tabanlı Randevu Sistemi Kurulum Rehberi

## 🎯 Genel Bakış

Bu rehber, QRCal sistemine konum tabanlı randevu alma özelliğini entegre etmek için gerekli adımları açıklar. Sistem, kullanıcıların belirli bir alan (geofence) içinde olduğunu doğrulayarak randevu almasına izin verir.

## 🚀 Özellikler

### ✅ **PWA (Progressive Web App)**
- Mobil web uygulaması deneyimi
- Ana ekrana ekleme desteği
- Offline çalışma kapasitesi
- Push notification desteği

### 📍 **Konum Servisleri**
- HTML5 Geolocation API
- Yüksek hassasiyetli GPS desteği
- Konum doğruluk kontrolü
- Konum tazeliği kontrolü

### 🗺️ **Geofence Yönetimi**
- Admin panelinden geofence oluşturma
- Harita üzerinden konum seçimi
- Yarıçap tabanlı alan tanımlama
- Çalışma saatleri kontrolü

### 🔒 **Güvenlik Özellikleri**
- Sunucu tarafında konum doğrulama
- Sahte GPS koruması
- IP-şehir tutarlılık kontrolü
- Konum veri tazeliği kontrolü

## 📁 Dosya Yapısı

```
QrCal/
├── public/
│   └── manifest.json                    # PWA manifest dosyası
├── src/
│   ├── components/
│   │   ├── LocationBasedAppointment/    # Konum tabanlı randevu komponenti
│   │   └── AdminGeofenceManager/        # Admin geofence yönetimi
│   └── services/
│       └── locationService.js           # Konum servisleri
├── backend/
│   ├── models/
│   │   └── Geofence.js                 # Geofence veri modeli
│   └── routes/
│       └── geofence.js                 # Geofence API endpoint'leri
└── docs/
    └── LOCATION_BASED_APPOINTMENT_SETUP.md
```

## ⚙️ Kurulum Adımları

### 1️⃣ **Gerekli Paketlerin Kurulumu**

#### Frontend Dependencies
```bash
cd QrCal
npm install leaflet react-leaflet
```

#### Backend Dependencies
```bash
cd backend
npm install express-validator
```

### 2️⃣ **PWA Manifest Konfigürasyonu**

`public/manifest.json` dosyası otomatik olarak oluşturuldu. Bu dosya:
- Uygulama adı ve açıklaması
- İkon boyutları ve renkleri
- Konum izinleri
- PWA özellikleri

### 3️⃣ **Backend Geofence Modeli**

`backend/models/Geofence.js` dosyası oluşturuldu ve şunları içerir:
- Konum merkezi (enlem/boylam)
- Yarıçap (metre cinsinden)
- Çalışma saatleri
- Güvenlik ayarları
- Haversine mesafe hesaplama

### 4️⃣ **Backend API Endpoint'leri**

`backend/routes/geofence.js` dosyası şu endpoint'leri sağlar:
- `GET /api/geofence/admin` - Tüm geofence'leri listele
- `POST /api/geofence` - Yeni geofence oluştur
- `PUT /api/geofence/:id` - Geofence güncelle
- `DELETE /api/geofence/:id` - Geofence sil
- `POST /api/geofence/verify-location` - Konum doğrulama

### 5️⃣ **Frontend Konum Servisleri**

`src/services/locationService.js` dosyası:
- Konum izinlerini kontrol eder
- Yüksek hassasiyetli konum alır
- Konum izleme yapar
- Geofence erişim kontrolü yapar

### 6️⃣ **Frontend Komponentleri**

#### LocationBasedAppointment
- Konum tabanlı randevu alma
- Harita entegrasyonu
- Konum doğrulama
- Randevu formu

#### AdminGeofenceManager
- Geofence CRUD işlemleri
- Harita üzerinden konum seçimi
- Geofence yönetimi

## 🔧 Konfigürasyon

### Backend Server.js'e Geofence Route'u Ekleme

```javascript
// backend/server.js
import geofenceRoutes from './routes/geofence.js';

// ... existing code ...

app.use('/api/geofence', geofenceRoutes);
```

### Frontend Routing'e Geofence Sayfası Ekleme

```javascript
// src/App.jsx veya routing dosyası
import AdminGeofenceManager from './components/AdminGeofenceManager/AdminGeofenceManager';

// Admin route'una ekleyin
<Route path="/admin/geofence" element={<AdminGeofenceManager />} />
```

## 📱 Kullanım Senaryoları

### 👨‍🎓 **Öğrenci Randevu Alma**
1. Öğrenci randevu sayfasına gider
2. "Konumumu Kullan" butonuna tıklar
3. Tarayıcı konum izni ister
4. Konum alındıktan sonra haritada gösterilir
5. "Konumumu Doğrula" butonuna tıklar
6. Sunucu geofence kontrolü yapar
7. Konum doğrulanırsa randevu formu açılır
8. Randevu bilgileri girilir ve gönderilir

### 👨‍🏫 **Admin Geofence Yönetimi**
1. Admin panelinde "Geofence Yönetimi" sayfasına gider
2. "Yeni Geofence" butonuna tıklar
3. Geofence bilgilerini girer:
   - İsim ve açıklama
   - Faculty seçimi
   - Haritadan konum seçimi
   - Yarıçap belirleme
   - Çalışma saatleri
4. Geofence'i kaydeder
5. Mevcut geofence'leri düzenleyebilir/silebilir

## 🛠️ Güvenlik Önlemleri

### 1️⃣ **Konum Doğrulama**
- Sunucu tarafında Haversine mesafe hesaplama
- Konum doğruluğu kontrolü (max 50m)
- Konum tazeliği kontrolü (max 60s)

### 2️⃣ **Sahte GPS Koruması**
- Konum veri tutarlılık kontrolü
- IP-şehir eşleşmesi
- Konum değişim hızı kontrolü

### 3️⃣ **KVKK Uyumluluğu**
- Konum verileri sadece randevu oluşturma sırasında kullanılır
- Konum verileri otomatik olarak temizlenir
- Kullanıcı onayı gerekli

## 📊 Performans Optimizasyonu

### 1️⃣ **Konum Servisleri**
- Yüksek hassasiyet sadece gerektiğinde
- Konum izleme optimize edilmiş
- Gereksiz API çağrıları önlenir

### 2️⃣ **Harita Performansı**
- Leaflet ile hafif harita
- OpenStreetMap ücretsiz tile'ları
- Marker ve circle optimizasyonu

### 3️⃣ **Backend Optimizasyonu**
- MongoDB 2dsphere index'leri
- Geofence sorguları optimize edilmiş
- Caching stratejileri

## 🧪 Test Etme

### 1️⃣ **Konum Servisi Testi**
```javascript
// Browser console'da
import('./services/locationService.js').then(module => {
  const locationService = module.default;
  locationService.getCurrentLocation().then(console.log);
});
```

### 2️⃣ **Geofence API Testi**
```bash
# Geofence listesi
curl -H "Authorization: Bearer TOKEN" http://localhost:5000/api/geofence/admin

# Konum doğrulama
curl -X POST -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{"facultyId":"ID","location":{"latitude":39.9334,"longitude":32.8597,"accuracy":10,"timestamp":1234567890}}' \
  http://localhost:5000/api/geofence/verify-location
```

### 3️⃣ **PWA Testi**
- Chrome DevTools > Application > Manifest
- Lighthouse PWA audit
- Offline çalışma testi

## 🚀 Production Deployment

### 1️⃣ **Environment Variables**
```env
# Backend .env
NODE_ENV=production
GEOLOCATION_ENABLED=true
MAX_GEOLOCATION_ACCURACY=50
MAX_GEOLOCATION_AGE=60
```

### 2️⃣ **HTTPS Zorunluluğu**
- Geolocation API sadece HTTPS'te çalışır
- SSL sertifikası gerekli
- HTTP'den HTTPS'e yönlendirme

### 3️⃣ **Monitoring ve Logging**
- Konum doğrulama logları
- Geofence erişim istatistikleri
- Hata oranları takibi

## 🆘 Sorun Giderme

### 1️⃣ **Konum Alınamıyor**
- Tarayıcı konum izni kontrol edin
- HTTPS kullanıldığından emin olun
- GPS açık mı kontrol edin
- Tarayıcı güncel mi kontrol edin

### 2️⃣ **Geofence Kontrolü Başarısız**
- Konum doğruluğu yeterli mi kontrol edin
- Konum taze mi kontrol edin
- Geofence aktif mi kontrol edin
- Çalışma saatleri uygun mu kontrol edin

### 3️⃣ **Harita Yüklenmiyor**
- İnternet bağlantısı kontrol edin
- Leaflet CSS/JS dosyaları yüklendi mi kontrol edin
- Console hataları kontrol edin

## 📚 Ek Kaynaklar

- [HTML5 Geolocation API](https://developer.mozilla.org/en-US/docs/Web/API/Geolocation_API)
- [Leaflet Documentation](https://leafletjs.com/reference.html)
- [PWA Best Practices](https://web.dev/pwa-checklist/)
- [Haversine Formula](https://en.wikipedia.org/wiki/Haversine_formula)

## 🔮 Gelecek Geliştirmeler

### 1️⃣ **Gelişmiş Özellikler**
- Çoklu geofence desteği
- Dinamik yarıçap ayarlama
- Zaman bazlı geofence kuralları
- Konum geçmişi takibi

### 2️⃣ **Entegrasyonlar**
- Google Maps API entegrasyonu
- Foursquare venue entegrasyonu
- Bluetooth beacon desteği
- NFC tag desteği

### 3️⃣ **Analytics ve Raporlama**
- Konum bazlı randevu istatistikleri
- Geofence kullanım analizi
- Kullanıcı davranış analizi
- Performans metrikleri

---

**Not:** Bu rehber QRCal sistemi için özel olarak hazırlanmıştır. Geliştirme sürecinde güncel tutulmalıdır.
