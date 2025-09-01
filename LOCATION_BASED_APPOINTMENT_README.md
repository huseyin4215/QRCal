# 📍 Konum Tabanlı Randevu Sistemi - Kurulum ve Test Rehberi

## 🎯 Sistem Özeti

Bu sistem, öğrencilerin sadece belirli alanlar (geofence) içindeyken randevu alabilmesini sağlar. Mobil web (PWA) üzerinden çalışır ve konum doğrulaması yapar.

## ✨ Özellikler

- **PWA (Progressive Web App)** - Mobil uygulama deneyimi
- **Konum Doğrulama** - GPS/Wi-Fi tabanlı konum kontrolü
- **Geofence Yönetimi** - Admin panelinden konum alanları tanımlama
- **Güvenlik** - Sunucu tarafında konum doğrulama
- **KVKK Uyumlu** - Konum verileri sadece randevu sırasında kullanılır

## 🚀 Hızlı Başlangıç

### 1. Test Geofence Oluşturma

```bash
cd backend
node createTestGeofence.js
```

Bu script otomatik olarak:
- Ankara Üniversitesi Tandoğan Kampüsü için test geofence oluşturur
- 500 metre yarıçapında bir alan tanımlar
- Çalışma saatlerini ayarlar (Pazartesi-Cuma 08:00-18:00)

### 2. Sistemi Test Etme

1. **Mobil tarayıcıda açın** (Chrome, Safari)
2. **Admin paneline giriş yapın**
3. **"Konum Yönetimi" sekmesine gidin**
4. **Geofence'leri görüntüleyin ve düzenleyin**

## 📱 PWA Özellikleri

### Ana Ekrana Ekleme
- Mobil tarayıcıda "Ana Ekrana Ekle" seçeneği görünür
- Uygulama ikonu ve splash screen
- Offline çalışma kapasitesi

### Konum İzinleri
- Tarayıcı konum izni ister
- Yüksek hassasiyetli GPS desteği
- Konum doğruluk kontrolü

## 🗺️ Geofence Yönetimi

### Admin Panelinde
1. **Konum Yönetimi** sekmesine gidin
2. **Yeni Geofence** oluşturun
3. **Haritadan konum seçin**
4. **Yarıçap belirleyin** (10m - 10km)
5. **Çalışma saatlerini ayarlayın**

### Geofence Ayarları
- **Konum Doğrulama**: Zorunlu/Opsiyonel
- **Maksimum Doğruluk**: 5m - 200m
- **Konum Tazeliği**: 30s - 300s
- **Manuel Override**: İzin ver/verme

## 🔒 Güvenlik Özellikleri

### Konum Doğrulama
- **Haversine mesafe hesaplama**
- **Doğruluk kontrolü** (max 50m)
- **Tazelik kontrolü** (max 60s)
- **Çalışma saatleri kontrolü**

### Sahte GPS Koruması
- **Konum tutarlılık kontrolü**
- **IP-şehir eşleşmesi**
- **Konum değişim hızı kontrolü**

## 📊 Test Senaryoları

### 1. Geofence İçinde Randevu Alma
```
✅ Konum alındı
✅ Geofence kontrolü yapıldı
✅ Konum doğrulandı
✅ Randevu formu açıldı
✅ Randevu oluşturuldu
```

### 2. Geofence Dışında Randevu Alma
```
✅ Konum alındı
✅ Geofence kontrolü yapıldı
❌ Konum doğrulanamadı
❌ "Belirtilen alan dışındasınız" hatası
```

### 3. Konum Doğruluğu Yetersiz
```
✅ Konum alındı
❌ Doğruluk yetersiz (örn: 100m, gerekli: 50m)
❌ "Konum doğruluğu yetersiz" hatası
```

## 🛠️ Teknik Detaylar

### Backend API Endpoints
```
GET    /api/geofence/admin          - Tüm geofence'leri listele
POST   /api/geofence                - Yeni geofence oluştur
PUT    /api/geofence/:id            - Geofence güncelle
DELETE /api/geofence/:id            - Geofence sil
POST   /api/geofence/verify-location - Konum doğrulama
```

### Frontend Komponentleri
- **AdminGeofenceManager**: Geofence CRUD işlemleri
- **LocationBasedAppointment**: Konum tabanlı randevu alma
- **LocationService**: Konum servisleri

### Veri Modelleri
- **Geofence**: Konum alanı tanımları
- **Appointment**: Konum doğrulama verileri ile randevular

## 🔧 Sorun Giderme

### Konum Alınamıyor
- HTTPS kullanıldığından emin olun
- Tarayıcı konum iznini kontrol edin
- GPS açık mı kontrol edin

### Geofence Kontrolü Başarısız
- Konum doğruluğu yeterli mi (max 50m)
- Konum taze mi (max 60s)
- Geofence aktif mi
- Çalışma saatleri uygun mu

### PWA Çalışmıyor
- Service worker kayıtlı mı kontrol edin
- Manifest dosyası doğru mu
- HTTPS kullanılıyor mu

## 📚 API Kullanımı

### Konum Doğrulama
```javascript
const response = await fetch('/api/geofence/verify-location', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    facultyId: 'faculty_id_here',
    location: {
      latitude: 39.9334,
      longitude: 32.8597,
      accuracy: 10,
      timestamp: Date.now()
    }
  })
});
```

### Randevu Oluşturma (Konum ile)
```javascript
const response = await fetch('/api/appointments', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    studentName: 'Öğrenci Adı',
    studentId: '12345',
    studentEmail: 'ogrenci@email.com',
    topic: 'Staj görüşmesi',
    facultyId: 'faculty_id_here',
    date: '2024-08-20',
    startTime: '10:00',
    endTime: '11:00',
    location: {
      latitude: 39.9334,
      longitude: 32.8597,
      accuracy: 10,
      timestamp: Date.now()
    }
  })
});
```

## 🎯 Gelecek Geliştirmeler

### Kısa Vadeli
- [ ] Çoklu geofence desteği
- [ ] Dinamik yarıçap ayarlama
- [ ] Zaman bazlı kurallar

### Orta Vadeli
- [ ] Bluetooth beacon desteği
- [ ] NFC tag entegrasyonu
- [ ] Konum geçmişi takibi

### Uzun Vadeli
- [ ] AI tabanlı konum analizi
- [ ] Çoklu kampüs desteği
- [ ] Gelişmiş güvenlik önlemleri

## 📞 Destek

Herhangi bir sorun yaşarsanız:
1. Console loglarını kontrol edin
2. Network sekmesinde API çağrılarını inceleyin
3. Konum izinlerini kontrol edin
4. Geofence ayarlarını doğrulayın

---

**Not:** Bu sistem KVKK uyumlu olarak tasarlanmıştır. Konum verileri sadece randevu oluşturma sırasında kullanılır ve otomatik olarak temizlenir.
