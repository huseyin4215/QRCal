# 🗺️ Gelişmiş Geofence Yönetim Sistemi

Bu sistem, admin kullanıcıların harita üzerinde geofence (coğrafi sınır) tanımlaması yapmasına ve öğrencilerin bu alanlar içindeyken randevu alabilmesine olanak sağlar.

## ✨ Özellikler

### 👨‍💼 Admin Özellikleri
- **Harita Üzerinde Konum Ekleme**: Haritaya tıklayarak geofence merkezi belirleme
- **Sürükle-Bırak**: Marker'ları sürükleyerek konum değiştirme
- **Yarıçap Ayarı**: Slider ile 10m - 10km arası yarıçap belirleme
- **Çalışma Saatleri**: Her gün için özel çalışma saatleri tanımlama
- **Konum Doğrulama Ayarları**: Doğruluk, tazelik ve manuel override seçenekleri
- **Geofence Yönetimi**: Aktif/pasif yapma, düzenleme ve silme

### 👨‍🎓 Öğrenci Özellikleri
- **Konum Doğrulama**: Gerçek zamanlı konum kontrolü
- **Geofence Kontrolü**: Belirlenen alan içinde olup olmadığını kontrol etme
- **Çalışma Saatleri Kontrolü**: Sadece açık saatlerde randevu alma
- **Otomatik Doğrulama**: Randevu sırasında otomatik konum kontrolü

## 🚀 Kurulum

### Gereksinimler
- Node.js 16+
- MongoDB 4.4+
- React 18+
- Leaflet (harita kütüphanesi)

### Backend Kurulumu
```bash
cd backend
npm install
```

### Frontend Kurulumu
```bash
npm install
npm install leaflet react-leaflet
```

### Environment Variables
```env
MONGODB_URI=mongodb://localhost:27017/qrcal
PORT=5000
FRONTEND_URL=http://localhost:8081
```

## 📱 Kullanım

### Admin Paneli

#### 1. Yeni Geofence Oluşturma
1. "Yeni Geofence" butonuna tıklayın
2. Haritaya tıklayarak konum belirleyin
3. Yarıçap slider'ını kullanarak alan boyutunu ayarlayın
4. Faculty seçin ve diğer bilgileri doldurun
5. Kaydedin

#### 2. Geofence Düzenleme
1. Mevcut geofence kartında "Düzenle" butonuna tıklayın
2. Marker'ı sürükleyerek konumu değiştirin
3. Yarıçap slider'ını kullanarak boyutu ayarlayın
4. Diğer ayarları güncelleyin
5. Kaydedin

#### 3. Harita Kontrolleri
- **Tıklama**: Haritaya tıklayarak yeni konum belirleme
- **Sürükleme**: Marker'ı sürükleyerek konum değiştirme
- **Zoom**: Fare tekerleği ile yakınlaştırma/uzaklaştırma
- **Pan**: Fare ile haritayı kaydırma

### Öğrenci Randevu Sistemi

#### 1. Konum Doğrulama
1. Randevu formunda konum bilgisi alın
2. "Konum Doğrula" butonuna tıklayın
3. Sistem otomatik olarak geofence kontrolü yapar
4. Başarılı doğrulama sonrası randevu alabilirsiniz

#### 2. Geofence Kontrolü
- Konum geofence içindeyse: ✅ Randevu alınabilir
- Konum geofence dışındaysa: ❌ Randevu alınamaz
- Çalışma saatleri dışındaysa: ⏰ Randevu alınamaz

## 🗄️ Veritabanı Yapısı

### Geofence Modeli
```javascript
{
  name: String,                    // Geofence adı
  description: String,             // Açıklama
  facultyId: ObjectId,            // Faculty referansı
  center: {                       // Merkez koordinatları
    latitude: Number,
    longitude: Number
  },
  radius: Number,                  // Yarıçap (metre)
  locationType: String,            // Konum tipi
  isActive: Boolean,               // Aktiflik durumu
  workingHours: {                  // Çalışma saatleri
    monday: { start, end, isOpen },
    // ... diğer günler
  },
  settings: {                      // Konum doğrulama ayarları
    requireLocationVerification: Boolean,
    maxAccuracy: Number,
    locationFreshness: Number,
    allowManualOverride: Boolean,
    requireAdminApproval: Boolean
  },
  createdBy: ObjectId,             // Oluşturan kullanıcı
  updatedBy: ObjectId              // Güncelleyen kullanıcı
}
```

## 🔧 API Endpoints

### Geofence Yönetimi
- `GET /api/geofence/admin` - Tüm geofence'leri listele (Admin)
- `POST /api/geofence` - Yeni geofence oluştur
- `PUT /api/geofence/:id` - Geofence güncelle
- `DELETE /api/geofence/:id` - Geofence sil

### Konum Doğrulama
- `POST /api/geofence/verify-location` - Öğrenci konum doğrulama

### İstatistikler
- `GET /api/geofence/stats/admin` - Admin istatistikleri

## 🎯 Demo Bileşeni

Sistem, hem admin hem de öğrenci perspektifini gösteren interaktif bir demo içerir:

### Demo Özellikleri
- **Admin Görünümü**: Geofence oluşturma ve yönetim özellikleri
- **Öğrenci Görünümü**: Konum kontrolü ve doğrulama süreci
- **İnteraktif Harita**: Gerçek zamanlı konum güncelleme
- **Konum Kontrolü**: Yön butonları ile öğrenci konumu değiştirme

### Demo Kullanımı
1. "Admin Görünümü" sekmesinde geofence özelliklerini inceleyin
2. "Öğrenci Görünümü" sekmesine geçin
3. Yön butonları ile öğrenci konumunu değiştirin
4. "Konum Doğrula" butonuna tıklayın
5. Sonucu görün

## 🛡️ Güvenlik ve Doğrulama

### Konum Doğrulama Kriterleri
1. **Doğruluk**: Konum hassasiyeti belirlenen limit altında olmalı
2. **Tazelik**: Konum bilgisi belirlenen süre içinde alınmış olmalı
3. **Mesafe**: Öğrenci geofence yarıçapı içinde olmalı
4. **Saat**: Çalışma saatleri içinde olmalı

### Yetki Kontrolü
- Sadece admin kullanıcılar geofence oluşturabilir/düzenleyebilir
- Faculty kullanıcıları kendi geofence'lerini yönetebilir
- Öğrenciler sadece konum doğrulama yapabilir

## 📱 Responsive Tasarım

Sistem tüm cihazlarda çalışacak şekilde tasarlanmıştır:
- **Desktop**: Tam özellikli harita ve form
- **Tablet**: Optimize edilmiş layout
- **Mobile**: Dokunmatik dostu arayüz

## 🔍 Hata Ayıklama

### Yaygın Sorunlar
1. **Harita Yüklenmiyor**: Leaflet CSS dosyasının import edildiğinden emin olun
2. **Konum Alınamıyor**: Tarayıcı konum iznini kontrol edin
3. **Geofence Kaydedilemiyor**: MongoDB bağlantısını kontrol edin

### Log Kontrolü
```bash
# Backend logları
npm run dev

# Frontend console
F12 > Console
```

## 🚀 Gelecek Özellikler

- [ ] Çoklu geofence desteği
- [ ] Gelişmiş çalışma saatleri (tatil günleri, özel durumlar)
- [ ] Konum geçmişi takibi
- [ ] Push notification desteği
- [ ] Offline konum doğrulama
- [ ] 3D harita desteği

## 📞 Destek

Herhangi bir sorun yaşarsanız:
1. GitHub Issues'da sorun bildirin
2. Detaylı hata mesajı ve log ekleyin
3. Kullandığınız cihaz ve tarayıcı bilgisini belirtin

## 📄 Lisans

Bu proje MIT lisansı altında lisanslanmıştır.

---

**Not**: Bu sistem, gerçek zamanlı konum takibi yapar. KVKK uyumluluğu için konum verilerinin güvenli şekilde saklanması ve işlenmesi önemlidir.
