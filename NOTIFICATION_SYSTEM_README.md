# 🔔 Gerçek Zamanlı Bildirim Sistemi

Bu sistem, admin kullanıcılarına yeni randevular ve sistem güncellemeleri hakkında anında bildirim gönderir.

## ✨ Özellikler

### 🔔 Bildirim Türleri
- **Randevu Bildirimleri**: Yeni randevu talepleri geldiğinde
- **Durum Güncellemeleri**: Randevu onaylandığında, reddedildiğinde veya iptal edildiğinde
- **Sistem Bildirimleri**: Genel sistem güncellemeleri
- **Hatırlatıcılar**: Zamanlanmış hatırlatıcılar

### 📱 Bildirim Kanalları
- **Tarayıcı Bildirimleri**: Desktop notification API kullanarak
- **In-App Bildirimler**: Header'daki zil ikonu ile
- **Gerçek Zamanlı Güncellemeler**: 10 saniyede bir kontrol

### 🎯 Hedef Kullanıcılar
- **Admin Kullanıcılar**: Tüm sistem bildirimleri
- **Öğretim Üyeleri**: Kendi randevuları hakkında bildirimler

## 🚀 Kurulum

### Backend Gereksinimleri
```bash
cd backend
npm install
```

### Frontend Gereksinimleri
```bash
npm install
```

### Environment Variables
```env
MONGODB_URI=mongodb://localhost:27017/qrcal
PORT=5000
FRONTEND_URL=http://localhost:8081
```

## 📱 Kullanım

### Admin Dashboard
1. **Bildirim İkonu**: Header'da zil ikonu görünür
2. **Okunmamış Sayısı**: Kırmızı badge ile gösterilir
3. **Bildirim Paneli**: Zil ikonuna tıklayarak açılır
4. **Test Bildirimi**: "Test Bildirim" butonu ile test edilebilir

### Bildirim Yönetimi
- **Tümünü Okundu İşaretle**: Tüm bildirimleri okundu olarak işaretler
- **Otomatik Temizlik**: 5 saniye sonra test bildirimleri otomatik silinir
- **Sıralama**: En yeni bildirimler en üstte görünür

## 🔧 Teknik Detaylar

### Backend Yapısı

#### Notification Model
```javascript
{
  userId: ObjectId,           // Bildirim alacak kullanıcı
  type: String,               // Bildirim türü (appointment, system, reminder, action)
  title: String,              // Bildirim başlığı
  message: String,            // Bildirim mesajı
  read: Boolean,              // Okundu durumu
  data: Object,               // Ek veriler
  priority: String,           // Öncelik (low, medium, high)
  expiresAt: Date,            // Son kullanma tarihi
  createdAt: Date,            // Oluşturulma tarihi
  updatedAt: Date             // Güncellenme tarihi
}
```

#### API Endpoints
- `GET /api/notifications/unread` - Okunmamış bildirimleri getir
- `PUT /api/notifications/:id/read` - Bildirimi okundu olarak işaretle
- `PUT /api/notifications/mark-all-read` - Tüm bildirimleri okundu olarak işaretle
- `GET /api/notifications` - Tüm bildirimleri getir (sayfalama ile)
- `DELETE /api/notifications/:id` - Bildirimi sil

### Frontend Yapısı

#### Real-time Updates
```javascript
// 10 saniyede bir yeni randevuları kontrol et
appointmentCheckIntervalRef.current = setInterval(checkForNewAppointments, 10000);

// 30 saniyede bir bildirimleri kontrol et
notificationIntervalRef.current = setInterval(checkForNotifications, 30000);
```

#### Browser Notifications
```javascript
// Bildirim izni iste
const permission = await Notification.requestPermission();

// Bildirim gönder
if (Notification.permission === 'granted') {
  new Notification('Yeni Randevu', {
    body: 'Yeni randevu talebi geldi!',
    icon: '/favicon.ico',
    tag: 'new-appointment'
  });
}
```

## 🔄 Bildirim Akışı

### 1. Yeni Randevu Oluşturulduğunda
1. Öğrenci randevu talebinde bulunur
2. `Notification.createAppointmentNotification()` çağrılır
3. Öğretim üyesine bildirim gönderilir
4. Admin dashboard'da gerçek zamanlı güncellenir

### 2. Randevu Durumu Değiştiğinde
1. Admin randevu durumunu günceller
2. `Notification.createSystemNotification()` çağrılır
3. İlgili kullanıcıya bildirim gönderilir
4. Bildirim panelinde görünür

### 3. Gerçek Zamanlı Kontrol
1. Frontend 10 saniyede bir yeni randevuları kontrol eder
2. Yeni randevu varsa bildirim gösterir
3. Browser notification API kullanarak desktop bildirimi gönderir
4. In-app bildirim panelinde gösterir

## 🎨 UI Bileşenleri

### Header Notification Bell
- **Zil İkonu**: Bildirim sayısını gösterir
- **Kırmızı Badge**: Okunmamış bildirim sayısı
- **Hover Efekti**: Tıklanabilir olduğunu belirtir

### Notifications Dropdown
- **Header**: "Bildirimler" başlığı ve "Tümünü Okundu İşaretle" butonu
- **Bildirim Listesi**: En son 10 bildirim
- **Okunmamış Stil**: Mavi sol kenarlık ile vurgulanır
- **Zaman Bilgisi**: Her bildirimin oluşturulma saati

### Responsive Tasarım
- **Desktop**: 400px genişliğinde dropdown
- **Tablet**: 320px genişliğinde dropdown
- **Mobile**: 280px genişliğinde dropdown

## 🛡️ Güvenlik

### Yetki Kontrolü
- Sadece kendi bildirimlerini görebilir
- Admin tüm sistem bildirimlerini görebilir
- Bildirimler kullanıcı ID'sine göre filtrelenir

### Veri Doğrulama
- Bildirim türü enum ile sınırlandırılmış
- Mesaj uzunluğu maksimum 500 karakter
- Başlık uzunluğu maksimum 100 karakter

## 🔍 Hata Ayıklama

### Yaygın Sorunlar
1. **Bildirim İzni Yok**: Tarayıcı ayarlarından izin verin
2. **Bildirimler Görünmüyor**: Console'da hata mesajlarını kontrol edin
3. **Real-time Güncelleme Çalışmıyor**: Network sekmesinde API çağrılarını kontrol edin

### Log Kontrolü
```bash
# Backend logları
npm run dev

# Frontend console
F12 > Console > "Real-time" araması
```

## 🚀 Gelecek Özellikler

- [ ] Push notification desteği
- [ ] E-posta bildirimleri
- [ ] SMS bildirimleri
- [ ] Bildirim tercihleri
- [ ] Ses bildirimleri
- [ ] Bildirim geçmişi
- [ ] Toplu bildirim gönderimi

## 📞 Destek

Herhangi bir sorun yaşarsanız:
1. Console loglarını kontrol edin
2. Network sekmesinde API çağrılarını inceleyin
3. Bildirim izinlerini kontrol edin
4. Detaylı hata mesajı ile GitHub Issues'da bildirin

## 📄 Lisans

Bu proje MIT lisansı altında lisanslanmıştır.

---

**Not**: Bu sistem, gerçek zamanlı bildirimler gönderir. Tarayıcı bildirim izinlerinin verilmesi gerekir.
