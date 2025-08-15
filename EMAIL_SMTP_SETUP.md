# 📧 Gmail SMTP Email Entegrasyonu Kurulum Rehberi

## 🎯 Genel Bakış

Bu rehber, QRCal sistemine Gmail SMTP email servisini entegre etmek için gerekli adımları açıklar.

## ⚙️ SMTP Konfigürasyonu

### Gmail SMTP Ayarları
- **Host:** `smtp.gmail.com`
- **Port:** `465` (SSL) veya `587` (TLS)
- **Güvenlik:** SSL/TLS
- **Kullanıcı:** `infoqrcal@gmail.com`
- **Şifre:** `wzsb tybn ohyp zoep`

## 📁 Dosya Yapısı

```
backend/
├── services/
│   └── emailService.js          # Email servis fonksiyonları
├── .env                         # Environment değişkenleri
├── env.example                  # Environment örnek dosyası
└── test-email.js               # Email test scripti
```

## 🚀 Kurulum Adımları

### 1. Environment Dosyası Oluşturma

Backend klasöründe `.env` dosyası oluşturun:

```bash
cd backend
cp env.example .env
```

`.env` dosyasını düzenleyin:

```env
# Email Configuration (Gmail SMTP)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=465
EMAIL_SECURE=true
EMAIL_USER=infoqrcal@gmail.com
EMAIL_PASSWORD=wzsb tybn ohyp zoep

# Diğer gerekli ayarlar...
```

### 2. Email Servisini Test Etme

```bash
cd backend
node test-email.js
```

Başarılı çıktı:
```
🔧 Testing Gmail SMTP Configuration...
✅ SMTP connection verified successfully!
✅ Test email sent successfully!
📧 Message ID: <message-id>
📤 Email sent to: infoqrcal@gmail.com
```

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

## 🛠️ Sorun Giderme

### Yaygın Hatalar ve Çözümleri

#### 1. Authentication Failed (EAUTH)
```
❌ Email test failed: Invalid login
🔐 Authentication failed. Check your email and password.
```

**Çözüm:**
- Gmail şifresini kontrol edin
- 2FA aktifse uygulama şifresi kullanın
- Gmail'de "Less secure app access" ayarını kontrol edin

#### 2. Connection Failed (ECONNECTION)
```
❌ Email test failed: Connection failed
🌐 Connection failed. Check your internet connection and firewall settings.
```

**Çözüm:**
- İnternet bağlantısını kontrol edin
- Firewall ayarlarını kontrol edin
- Port 465/587'nin açık olduğundan emin olun

#### 3. Connection Timeout (ETIMEDOUT)
```
❌ Email test failed: Connection timeout
⏰ Connection timeout. Check your network settings.
```

**Çözüm:**
- Ağ ayarlarını kontrol edin
- Proxy ayarlarını kontrol edin
- Gmail SMTP sunucusuna erişimi test edin

## 🔒 Güvenlik Notları

### Environment Variables
- Email bilgilerini `.env` dosyasında saklayın
- `.env` dosyasını `.gitignore`'a ekleyin
- Production'da güvenli şifre yönetimi kullanın

### Gmail Güvenlik
- Uygulama şifresi kullanın (2FA aktifse)
- Gmail güvenlik ayarlarını kontrol edin
- Düzenli olarak şifreleri güncelleyin

## 📧 Email Template'leri

### HTML Email Template'leri
Tüm email'ler HTML formatında gönderilir ve responsive tasarıma sahiptir:
- Modern ve profesyonel görünüm
- Türkçe dil desteği
- QRCal branding
- Responsive tasarım

### Özelleştirme
Email template'lerini `emailService.js` dosyasında düzenleyebilirsiniz:
- Renk şemaları
- Logo ve branding
- İçerik ve metin
- CSS stilleri

## 🚀 Production Deployment

### Production Environment
```env
NODE_ENV=production
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=465
EMAIL_SECURE=true
EMAIL_USER=infoqrcal@gmail.com
EMAIL_PASSWORD=your_production_password
```

### Monitoring
- Email gönderim loglarını takip edin
- Başarısız email'leri izleyin
- SMTP performansını ölçün

## 📚 Ek Kaynaklar

- [Nodemailer Documentation](https://nodemailer.com/)
- [Gmail SMTP Settings](https://support.google.com/mail/answer/7126229)
- [Email Best Practices](https://www.emailjs.com/docs/best-practices/)

## 🆘 Destek

Herhangi bir sorun yaşarsanız:
1. `test-email.js` scriptini çalıştırın
2. Hata mesajlarını kontrol edin
3. Gmail ayarlarını doğrulayın
4. Network ve firewall ayarlarını kontrol edin

---

**Not:** Bu rehber QRCal sistemi için özel olarak hazırlanmıştır. Gmail SMTP ayarları değişirse güncelleyin.
