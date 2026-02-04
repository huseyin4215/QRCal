# ✅ Production Deployment Checklist

Bu dosya, Qnnect uygulamasını production'a almadan önce kontrol edilmesi gereken tüm öğeleri içerir.

## 🔒 Güvenlik

### Environment Variables
- [ ] `JWT_SECRET` - Güçlü bir rastgele string (en az 32 karakter)
- [ ] `SESSION_SECRET` - Güçlü bir rastgele string (en az 32 karakter)
- [ ] `MONGODB_URI` - Production MongoDB bağlantı string'i
- [ ] `EMAIL_USER` ve `EMAIL_PASS` - Email servis bilgileri
- [ ] `GOOGLE_CLIENT_ID` ve `GOOGLE_CLIENT_SECRET` - Google OAuth bilgileri
- [ ] `FRONTEND_URL` - Production frontend URL'i (örn: https://qrnnect.com)
- [ ] `BACKEND_URL` - Production backend URL'i (örn: https://api.qrnnect.com)
- [ ] `GOOGLE_REDIRECT_URI` - Production callback URL'i

### Backend Güvenlik Ayarları
- [x] Rate limiting aktif (100 request/15 dakika)
- [x] CORS yapılandırması production domain'leri için ayarlandı
- [x] Helmet.js güvenlik başlıkları aktif
- [x] Console.log'lar production'da devre dışı
- [x] Debug route'ları sadece development'ta aktif

### Frontend Güvenlik
- [x] Console.log'lar production build'de kaldırılıyor (terser)
- [x] Debug sayfası sadece development'ta erişilebilir
- [x] API URL environment variable'dan alınıyor

## 🗄️ Veritabanı

- [ ] MongoDB production instance'ı hazır
- [ ] Veritabanı yedekleme stratejisi belirlendi
- [ ] Connection string doğru yapılandırıldı
- [ ] Index'ler oluşturuldu (performans için)

## 📧 Email Servisi

- [ ] Email servis bilgileri doğru yapılandırıldı
- [ ] Test email'i gönderildi ve kontrol edildi
- [ ] Email template'leri production için hazır

## 🔐 Google OAuth

- [ ] Google Cloud Console'da production OAuth credentials oluşturuldu
- [ ] Redirect URI'lar production domain'leri için ayarlandı
- [ ] OAuth callback URL'i doğru yapılandırıldı

## 🌐 Domain ve SSL

- [ ] Domain adı satın alındı/yapılandırıldı
- [ ] SSL sertifikası kuruldu (Let's Encrypt/Certbot)
- [ ] Nginx reverse proxy yapılandırıldı
- [ ] DNS kayıtları doğru yapılandırıldı

## 🚀 Deployment

### Sunucu Hazırlığı
- [ ] Node.js 18+ kurulu
- [ ] MongoDB kurulu ve çalışıyor
- [ ] PM2 kurulu ve yapılandırıldı
- [ ] Nginx kurulu ve yapılandırıldı
- [ ] Firewall kuralları ayarlandı (port 80, 443 açık)

### Uygulama Deployment
- [ ] Repository clone edildi
- [ ] Dependencies kuruldu (`npm install`)
- [ ] Frontend build edildi (`npm run build`)
- [ ] Environment dosyaları oluşturuldu ve dolduruldu
- [ ] PM2 ile backend başlatıldı
- [ ] PM2 startup script'i ayarlandı

### Kontroller
- [ ] Backend health check endpoint'i çalışıyor (`/api/health`)
- [ ] Frontend sayfaları yükleniyor
- [ ] API endpoint'leri çalışıyor
- [ ] Google OAuth çalışıyor
- [ ] Email gönderimi çalışıyor
- [ ] MongoDB bağlantısı çalışıyor

## 📊 Monitoring

- [ ] PM2 monitoring aktif
- [ ] Log dosyaları yapılandırıldı
- [ ] Error tracking (opsiyonel: Sentry, LogRocket vb.)
- [ ] Uptime monitoring (opsiyonel: UptimeRobot, Pingdom vb.)

## 🔄 Backup ve Recovery

- [ ] MongoDB backup stratejisi belirlendi
- [ ] Düzenli backup schedule'ı ayarlandı
- [ ] Backup restore testi yapıldı
- [ ] Disaster recovery planı hazır

## 📝 Dokümantasyon

- [ ] Deployment dokümantasyonu güncel
- [ ] Environment variables dokümante edildi
- [ ] API dokümantasyonu hazır (opsiyonel)

## ✅ Son Kontroller

- [ ] Tüm testler geçti
- [ ] Performance testleri yapıldı
- [ ] Security audit yapıldı
- [ ] Load test yapıldı (opsiyonel)

## 🎯 Post-Deployment

- [ ] Admin kullanıcı oluşturuldu
- [ ] İlk test randevusu oluşturuldu
- [ ] Email bildirimleri test edildi
- [ ] Google Calendar entegrasyonu test edildi
- [ ] QR kod oluşturma test edildi

---

**Not:** Bu checklist'i deployment öncesi ve sonrası kontrol edin. Her maddeyi işaretleyerek ilerleyin.

