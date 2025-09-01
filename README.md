# Qnnect - Akademik Randevu Yönetim Sistemi

Modern ve kullanıcı dostu akademik randevu yönetim platformu. QR kod teknolojisi ile kolay randevu alma, Google Calendar entegrasyonu ve gerçek zamanlı bildirimler.

## 🚀 Özellikler

- **QR Kod Tabanlı Randevu Sistemi**: Hızlı ve kolay randevu alma
- **Google Calendar Entegrasyonu**: Çift yönlü senkronizasyon
- **Konum Bazlı Doğrulama**: Geofence teknolojisi ile güvenli randevu alma
- **Gerçek Zamanlı Bildirimler**: Anlık bildirim sistemi
- **Responsive Tasarım**: Tüm cihazlarda mükemmel görünüm
- **Rol Bazlı Yetkilendirme**: Admin, Faculty, Student rolleri

## 🛠️ Teknoloji Stack

### Frontend
- React.js 18
- CSS Modules
- Vite
- Heroicons
- QR Code React
- Leaflet (Harita)

### Backend
- Node.js
- Express.js
- MongoDB
- JWT Authentication
- Google APIs
- Nodemailer

## 📋 Kurulum

### Gereksinimler
- Node.js 18+
- MongoDB 6.0+
- npm veya yarn

### 1. Projeyi Klonlayın
```bash
git clone https://github.com/huseyin4215/QRCal.git
cd QRCal
```

### 2. Frontend Kurulumu
```bash
npm install
```

### 3. Backend Kurulumu
```bash
cd backend
npm install
```

### 4. Environment Dosyalarını Yapılandırın

#### Frontend (.env)
```bash
cp env.example .env
```

#### Backend (backend/.env)
```bash
cd backend
cp env.example .env
```

Environment dosyalarını kendi bilgilerinizle güncelleyin.

### 5. Uygulamayı Başlatın

#### Backend
```bash
cd backend
npm run dev
```

#### Frontend
```bash
npm run dev
```

## 🔧 Yapılandırma

### Google OAuth Kurulumu
1. Google Cloud Console'da proje oluşturun
2. OAuth 2.0 Client ID oluşturun
3. Redirect URI'leri ekleyin
4. Client ID ve Secret'ı env dosyalarına ekleyin

### MongoDB Kurulumu
1. MongoDB'yi yerel olarak kurun veya MongoDB Atlas kullanın
2. Connection string'i backend/.env dosyasına ekleyin

### Email Kurulumu
1. Gmail App Password oluşturun
2. Email bilgilerini backend/.env dosyasına ekleyin

## 📱 Kullanım

### Admin Paneli
- Kullanıcı yönetimi
- Sistem istatistikleri
- Geofence yönetimi
- QR kod oluşturma

### Faculty Dashboard
- Müsaitlik takvimi
- Randevu yönetimi
- Google Calendar senkronizasyonu
- Öğrenci listesi

### Student Dashboard
- Randevu alma
- QR kod tarama
- Randevu geçmişi
- Bildirimler

## 🔒 Güvenlik

- JWT tabanlı authentication
- Role-based access control
- Input validation
- XSS ve CSRF koruması
- Rate limiting



## 🤝 Katkıda Bulunma

1. Fork edin
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Commit edin (`git commit -m 'Add amazing feature'`)
4. Push edin (`git push origin feature/amazing-feature`)
5. Pull Request açın

## 📞 İletişim

- Email: infoqrcal@gmail.com
- Proje Linki: https://github.com/huseyin4215/QRCal

## 🙏 Teşekkürler

Bu projeyi geliştirirken kullanılan açık kaynak kütüphanelerin geliştiricilerine teşekkürler.