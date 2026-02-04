# Termius Üzerinden Deployment Rehberi

Bu rehber, Qnnect projesini Termius SSH client kullanarak sunucuya deploy etmek için adım adım talimatlar içerir.

## 📋 Ön Gereksinimler

1. **Termius** uygulaması yüklü olmalı
2. Sunucuya SSH erişimi olmalı
3. Sunucuda Node.js ve MongoDB kurulu olmalı
4. Domain ve SSL sertifikası yapılandırılmış olmalı

## 🔧 Sunucu Hazırlığı

### 1. Termius ile Sunucuya Bağlanma

1. Termius'u açın
2. Yeni bir host ekleyin:
   - **Label**: `Qnnect Production Server`
   - **Address**: Sunucu IP adresi veya domain
   - **Username**: `root` veya kullanıcı adınız
   - **Port**: `22` (varsayılan SSH portu)
   - **Authentication**: SSH Key veya Password seçin

3. Bağlantıyı kaydedin ve bağlanın

### 2. Proje Dizinine Gitme

```bash
cd /home/soltudo/QRCal
# veya projenizin bulunduğu dizin
```

### 3. Git Pull (Kodları Güncelleme)

```bash
git pull origin main
# veya master branch kullanıyorsanız
git pull origin master
```

## 🔐 Environment Variables Ayarlama

### Backend .env Dosyası

Backend dizinine gidin ve `.env` dosyasını düzenleyin:

```bash
cd backend
nano .env
```

Aşağıdaki environment variables'ları ayarlayın:

```env
# Backend Environment Variables
NODE_ENV=production
PORT=5001
MONGODB_URI=mongodb://localhost:27017/qrcal

# JWT Configuration
JWT_SECRET=qrcal-super-secret-jwt-key-2024-change-this-in-production
JWT_EXPIRE=7d

# Frontend URL - QR kodların yönlendirileceği URL
FRONTEND_URL=https://qrnnect.com

# Backend URL - Email action linkleri için
BACKEND_URL=https://qrnnect.com/api

# Google OAuth Configuration
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret-here
GOOGLE_REDIRECT_URI=https://qrnnect.com/api/google/callback

# CORS Configuration (virgülle ayrılmış)
CORS_ORIGIN=http://localhost:8081,http://localhost:5173,http://localhost:3000,http://qrnnect.com,https://qrnnect.com

# Email Configuration
EMAIL_USER=your-email@gmail.com
EMAIL_APP_PASSWORD="your-app-password-here"
```

**Önemli Notlar:**
- `JWT_SECRET` değerini production'da mutlaka değiştirin!
- `GOOGLE_CLIENT_SECRET` değerini güvenli tutun
- `EMAIL_APP_PASSWORD` değerini tırnak içinde tutun (boşluk içerdiği için)
- `CORS_ORIGIN` değerlerini virgülle ayırın, boşluk bırakmayın

### Frontend .env Dosyası (Eğer varsa)

```bash
cd ..
nano .env
```

```env
# Frontend Environment Variables
VITE_API_URL=https://qrnnect.com/api
VITE_APP_NAME=QR Takvim
VITE_APP_DESCRIPTION=Akademik Randevu Sistemi
VITE_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
```

## 📦 Bağımlılıkları Yükleme

### Backend Bağımlılıkları

```bash
cd backend
npm install
```

### Frontend Bağımlılıkları (Eğer varsa)

```bash
cd ..
npm install
```

## 🏗️ Frontend Build (Production)

```bash
npm run build
```

Build çıktısı genellikle `dist` veya `build` klasörüne çıkar.

## 🚀 Backend'i Başlatma

### PM2 ile (Önerilen)

PM2 kurulu değilse:

```bash
npm install -g pm2
```

Backend'i PM2 ile başlatın:

```bash
cd backend
pm2 start server.js --name qnnect-backend
```

PM2 komutları:
- `pm2 list` - Çalışan process'leri listele
- `pm2 logs qnnect-backend` - Logları görüntüle
- `pm2 restart qnnect-backend` - Yeniden başlat
- `pm2 stop qnnect-backend` - Durdur
- `pm2 delete qnnect-backend` - Sil

### PM2'nin otomatik başlamasını sağlama

```bash
pm2 startup
pm2 save
```

### Manuel Başlatma (Alternatif)

```bash
cd backend
node server.js
```

## 🌐 Nginx/Apache Yapılandırması

### Nginx Örnek Yapılandırması

```nginx
server {
    listen 80;
    server_name qrnnect.com www.qrnnect.com;
    
    # Frontend için
    location / {
        root /home/soltudo/QRCal/dist;  # veya build klasörü
        try_files $uri $uri/ /index.html;
        index index.html;
    }
    
    # Backend API için
    location /api {
        proxy_pass http://localhost:5001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
    
    # SSL yapılandırması (Let's Encrypt)
    # listen 443 ssl;
    # ssl_certificate /etc/letsencrypt/live/qrnnect.com/fullchain.pem;
    # ssl_certificate_key /etc/letsencrypt/live/qrnnect.com/privkey.pem;
}
```

Nginx'i yeniden yükleyin:

```bash
sudo nginx -t  # Yapılandırmayı test et
sudo systemctl reload nginx  # Nginx'i yeniden yükle
```

## 📁 .htaccess Dosyası (Apache için)

Frontend build klasörüne `.htaccess` dosyası ekleyin:

```bash
cd dist  # veya build klasörü
nano .htaccess
```

İçeriği:

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  
  # Eğer dosya veya klasör değilse, index.html'e yönlendir
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteCond %{REQUEST_FILENAME} !-l
  RewriteRule . /index.html [L]
</IfModule>
```

## 🔍 Kontrol ve Test

### Backend Sağlık Kontrolü

```bash
curl http://localhost:5001/api/health
```

Veya tarayıcıdan:
```
https://qrnnect.com/api/health
```

### MongoDB Bağlantısını Kontrol Etme

```bash
mongo
use qrcal
show collections
exit
```

### Logları İnceleme

```bash
# PM2 logları
pm2 logs qnnect-backend

# Nginx logları
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log

# Backend logları (eğer dosyaya yazıyorsa)
tail -f backend/error.log
```

## 🔄 Güncelleme İşlemi

Kodları güncelledikten sonra:

```bash
# 1. Git pull
git pull origin main

# 2. Backend bağımlılıklarını güncelle (gerekirse)
cd backend
npm install

# 3. Frontend build (gerekirse)
cd ..
npm run build

# 4. Backend'i yeniden başlat
pm2 restart qnnect-backend
```

## 🐛 Sorun Giderme

### Port Zaten Kullanımda

```bash
# Port 5001'i kullanan process'i bul
lsof -i :5001
# veya
netstat -tulpn | grep 5001

# Process'i sonlandır
kill -9 <PID>
```

### MongoDB Bağlantı Hatası

```bash
# MongoDB servisini kontrol et
sudo systemctl status mongod

# MongoDB'yi başlat
sudo systemctl start mongod
```

### CORS Hatası

`.env` dosyasındaki `CORS_ORIGIN` değerini kontrol edin. Frontend URL'inin listede olduğundan emin olun.

### Environment Variables Yüklenmiyor

```bash
# .env dosyasının konumunu kontrol et
cd backend
pwd
ls -la .env

# Dosya izinlerini kontrol et
chmod 600 .env
```

## 📝 Önemli Notlar

1. **Güvenlik**: Production'da mutlaka güçlü `JWT_SECRET` kullanın
2. **SSL**: HTTPS kullanmak için Let's Encrypt sertifikası kurun
3. **Backup**: Düzenli olarak MongoDB backup alın
4. **Monitoring**: PM2 monitoring kullanarak server durumunu izleyin
5. **Logs**: Log dosyalarını düzenli kontrol edin

## 🔗 Faydalı Komutlar

```bash
# Disk kullanımı
df -h

# Memory kullanımı
free -h

# Process'leri görüntüle
top
# veya
htop

# Node.js versiyonu
node -v
npm -v

# MongoDB versiyonu
mongod --version
```

## 📞 Destek

Sorun yaşarsanız:
1. Log dosyalarını kontrol edin
2. Environment variables'ları doğrulayın
3. Port ve firewall ayarlarını kontrol edin
4. MongoDB bağlantısını test edin

