# 📧 Gmail SMTP Email Entegrasyonu Kurulum Rehberi

Bu rehber, QRCal sistemine Gmail SMTP email servisini entegre etmek için gerekli adımları açıklar.

## ⚙️ SMTP Konfigürasyonu

### Gmail SMTP Ayarları
- **Host:** `smtp.gmail.com`
- **Port:** `587`
- **Security:** `TLS`
- **Authentication:** `Required`

### Gmail App Password Oluşturma

1. **Google Hesabınıza Giriş Yapın**
   - [Google Account Settings](https://myaccount.google.com/) sayfasına gidin
   - "Security" sekmesine tıklayın

2. **2-Step Verification'ı Etkinleştirin**
   - "2-Step Verification" seçeneğini bulun
   - Telefon numaranızı doğrulayın

3. **App Passwords Oluşturun**
   - "App passwords" seçeneğine tıklayın
   - "Select app" dropdown'undan "Mail" seçin
   - "Select device" dropdown'undan "Other" seçin
   - "QRCal Email Service" gibi bir isim verin
   - "Generate" butonuna tıklayın

4. **App Password'ü Kopyalayın**
   - 16 karakterlik şifreyi kopyalayın (örn: `abcd efgh ijkl mnop`)
   - Bu şifreyi güvenli bir yere kaydedin

## 📁 Dosya Yapısı

```
backend/
├── services/
│   └── emailService.js          # Email servis fonksiyonları
├── .env                         # Environment değişkenleri
├── env.example                  # Environment örnek dosyası
└── test-email.js               # Email test scripti
```

## 🔧 Backend Konfigürasyonu

### 1. Environment Variables

`.env` dosyasına aşağıdaki değişkenleri ekleyin:

```env
# Email Configuration (Gmail SMTP)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
```

### 2. Email Service Test

Email servisini test etmek için:

```bash
cd backend
node test-email.js
```

## 📧 Email Gönderme Testi

```javascript
// Test email gönderme
const testEmail = {
  to: 'test@example.com',
  subject: '🧪 QRCal Email Test',
  html: `
    <h2>Email Test Başarılı!</h2>
    <p>Gmail SMTP konfigürasyonu başarıyla çalışıyor.</p>
  `
};

// Email gönder
await sendEmail(testEmail);
```

## ✅ Test Sonuçları

```
🔧 Testing Gmail SMTP Configuration...
✅ SMTP connection verified successfully!
📧 Test email sent successfully!
```

## 🚨 Güvenlik Önlemleri

### 1. Environment Variables
- `.env` dosyasını asla Git'e commit etmeyin
- `.gitignore` dosyasına `.env` ekleyin
- Production'da environment variables kullanın

### 2. App Password Güvenliği
- App password'ü güvenli bir yerde saklayın
- Düzenli olarak yenileyin
- Sadece gerekli uygulamalarda kullanın

### 3. Rate Limiting
- Email gönderim sayısını sınırlayın
- Spam koruması ekleyin
- Monitoring ve logging yapın

## 🔧 Email Servis Fonksiyonları

### Mevcut Email Fonksiyonları

1. **Randevu Talebi Bildirimi** - `sendAppointmentRequestEmail()`
2. **Randevu Onay Bildirimi** - `sendAppointmentApprovalEmail()`
3. **Randevu Red Bildirimi** - `sendAppointmentRejectionEmail()`
4. **Randevu Hatırlatması** - `sendAppointmentReminderEmail()`

### Email Gönderme Örneği

```javascript
import { sendAppointmentRequestEmail } from './services/emailService.js';

// Randevu talebi emaili gönder
await sendAppointmentRequestEmail(
  'faculty@example.com',
  'Dr. Ahmet Yılmaz',
  {
    studentName: 'Mehmet Demir',
    studentId: '2021001',
    studentEmail: 'mehmet@example.com',
    topic: 'Proje Danışmanlığı',
    description: 'Bitirme projesi hakkında görüşme',
    date: '2024-01-15',
    startTime: '14:00',
    endTime: '15:00'
  }
);
```

## 🔍 Troubleshooting

### Yaygın Hatalar

1. **Authentication Failed**
   - App password'ün doğru olduğundan emin olun
   - 2-Step Verification'ın etkin olduğunu kontrol edin

2. **Connection Timeout**
   - Firewall ayarlarını kontrol edin
   - Port 587'nin açık olduğundan emin olun

3. **Rate Limit Exceeded**
   - Gmail'in günlük email limitini kontrol edin
   - Email gönderim aralığını artırın

## 📚 Ek Kaynaklar

- [Gmail SMTP Settings](https://support.google.com/mail/answer/7126229)
- [Node.js Nodemailer Documentation](https://nodemailer.com/)
- [Gmail Security Best Practices](https://support.google.com/accounts/answer/185839)

## 🎯 Sonraki Adımlar

1. **Production Deployment**
   - Environment variables'ları production sunucusuna ekleyin
   - SSL sertifikalarını yapılandırın
   - Monitoring sistemini kurun

2. **Email Templates**
   - HTML email şablonları oluşturun
   - Responsive tasarım ekleyin
   - Branding ve logo ekleyin

3. **Advanced Features**
   - Email queue sistemi kurun
   - Retry mechanism ekleyin
   - Analytics ve tracking ekleyin

**Not:** Bu rehber QRCal sistemi için özel olarak hazırlanmıştır. Gmail SMTP ayarları değişirse güncelleyin.
