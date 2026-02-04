# Qnnect Deployment Guide

Bu dokümantasyon, Qnnect uygulamasını SSH üzerinden bir sunucuya kurmak için adım adım talimatlar içerir.

## 📋 Gereksinimler

- Ubuntu 20.04+ veya Debian 11+ sunucu
- Root veya sudo yetkisine sahip kullanıcı
- En az 2GB RAM
- En az 20GB disk alanı
- SSH erişimi

## 🚀 Hızlı Kurulum (Otomatik)

### 1. Deployment Script'i Çalıştırma

```bash
# Environment değişkenlerini ayarlayın
export DEPLOY_HOST="your-server-ip-or-domain.com"
export DEPLOY_USER="root"  # veya sudo yetkili kullanıcı
export DEPLOY_PORT="22"    # SSH portu (varsayılan: 22)
export APP_DIR="/var/www/qnnect"  # Uygulama dizini

# Script'i çalıştırın
chmod +x deploy.sh
./deploy.sh
```

## 📝 Manuel Kurulum Adımları

### 1. Sunucuya Bağlanın

```bash
ssh root@your-server-ip
```

### 2. Sistem Güncellemeleri

```bash
sudo apt-get update
sudo apt-get upgrade -y
```

### 3. Node.js Kurulumu

```bash
# Node.js 18.x kurulumu
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Versiyon kontrolü
node --version
npm --version
```

### 4. MongoDB Kurulumu

```bash
# MongoDB GPG key ekleme
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -

# MongoDB repository ekleme
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list

# MongoDB kurulumu
sudo apt-get update
sudo apt-get install -y mongodb-org

# MongoDB servisini başlatma
sudo systemctl enable mongod
sudo systemctl start mongod

# MongoDB durum kontrolü
sudo systemctl status mongod
```

### 5. Git Kurulumu

```bash
sudo apt-get install -y git
```

### 6. PM2 Kurulumu (Process Manager)

```bash
sudo npm install -g pm2
```

### 7. Uygulama Dizini Oluşturma

```bash
sudo mkdir -p /var/www/qnnect
sudo chown -R $USER:$USER /var/www/qnnect
cd /var/www/qnnect
```

### 8. Repository'yi Klonlama

```bash
git clone https://github.com/huseyin4215/QRCal.git .
```

### 9. Frontend Bağımlılıklarını Kurma

```bash
npm install
```

### 10. Backend Bağımlılıklarını Kurma

```bash
cd backend
npm install
cd ..
```

### 11. Environment Dosyalarını Oluşturma

#### Frontend `.env` Dosyası

```bash
nano .env
```

İçeriği:

```env
VITE_API_URL=http://localhost:5000
VITE_GOOGLE_CLIENT_ID=your-google-client-id
```

#### Backend `.env` Dosyası

```bash
nano backend/.env
```

İçeriği:

```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb://localhost:27017/qnnect
JWT_SECRET=your-super-secret-jwt-key-change-this
JWT_EXPIRE=30d

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_REDIRECT_URI=http://your-domain.com/api/google/callback

# Frontend URL
FRONTEND_URL=http://your-domain.com

# Other settings
SESSION_SECRET=your-session-secret-change-this
```

### 12. Frontend Build

```bash
npm run build
```

### 13. PM2 ile Backend'i Başlatma

#### PM2 Ecosystem Dosyası Oluşturma

```bash
nano ecosystem.config.js
```

İçeriği:

```javascript
module.exports = {
  apps: [
    {
      name: 'qnnect-backend',
      script: './backend/server.js',
      cwd: '/var/www/qnnect',
      instances: 1,
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 5000
      },
      error_file: './logs/backend-error.log',
      out_file: './logs/backend-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G'
    }
  ]
};
```

#### PM2'yi Başlatma

```bash
# Logs dizini oluşturma
mkdir -p logs

# PM2 ile başlatma
pm2 start ecosystem.config.js

# PM2'yi kaydetme (sunucu yeniden başlatıldığında otomatik başlatma için)
pm2 save

# PM2 startup script'i oluşturma
pm2 startup
# Çıkan komutu çalıştırın
```

### 14. Nginx Kurulumu ve Yapılandırması

```bash
# Nginx kurulumu
sudo apt-get install -y nginx

# Nginx yapılandırma dosyası oluşturma
sudo nano /etc/nginx/sites-available/qnnect
```

Nginx yapılandırması:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    # Frontend static files
    root /var/www/qnnect/dist;
    index index.html;

    # Frontend routes
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Google OAuth callback
    location /api/google {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Nginx'i etkinleştirme:

```bash
sudo ln -s /etc/nginx/sites-available/qnnect /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 15. SSL Sertifikası (Let's Encrypt)

```bash
# Certbot kurulumu
sudo apt-get install -y certbot python3-certbot-nginx

# SSL sertifikası alma
sudo certbot --nginx -d your-domain.com

# Otomatik yenileme testi
sudo certbot renew --dry-run
```

### 16. Firewall Yapılandırması

```bash
# UFW firewall kurulumu
sudo apt-get install -y ufw

# Gerekli portları açma
sudo ufw allow 22/tcp   # SSH
sudo ufw allow 80/tcp   # HTTP
sudo ufw allow 443/tcp  # HTTPS

# Firewall'u etkinleştirme
sudo ufw enable
sudo ufw status
```

## 🔧 Yönetim Komutları

### PM2 Komutları

```bash
# Uygulama durumu
pm2 status

# Logları görüntüleme
pm2 logs qnnect-backend

# Uygulamayı yeniden başlatma
pm2 restart qnnect-backend

# Uygulamayı durdurma
pm2 stop qnnect-backend

# Uygulamayı başlatma
pm2 start qnnect-backend

# Tüm uygulamaları listeleme
pm2 list

# Uygulamayı silme
pm2 delete qnnect-backend
```

### MongoDB Komutları

```bash
# MongoDB durumu
sudo systemctl status mongod

# MongoDB'yi başlatma
sudo systemctl start mongod

# MongoDB'yi durdurma
sudo systemctl stop mongod

# MongoDB'yi yeniden başlatma
sudo systemctl restart mongod

# MongoDB shell'e bağlanma
mongosh
```

### Nginx Komutları

```bash
# Nginx durumu
sudo systemctl status nginx

# Nginx'i yeniden başlatma
sudo systemctl restart nginx

# Nginx yapılandırmasını test etme
sudo nginx -t

# Nginx logları
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log
```

## 🔄 Güncelleme

```bash
cd /var/www/qnnect

# Değişiklikleri çekme
git pull origin main

# Frontend bağımlılıklarını güncelleme
npm install

# Backend bağımlılıklarını güncelleme
cd backend
npm install
cd ..

# Frontend'i yeniden build etme
npm run build

# Backend'i yeniden başlatma
pm2 restart qnnect-backend
```

## 🐛 Sorun Giderme

### Backend çalışmıyor

```bash
# PM2 loglarını kontrol edin
pm2 logs qnnect-backend

# MongoDB bağlantısını kontrol edin
sudo systemctl status mongod

# Port kullanımını kontrol edin
sudo netstat -tulpn | grep 5000
```

### Frontend yüklenmiyor

```bash
# Nginx loglarını kontrol edin
sudo tail -f /var/log/nginx/error.log

# Nginx yapılandırmasını test edin
sudo nginx -t

# Build dosyalarını kontrol edin
ls -la /var/www/qnnect/dist
```

### MongoDB bağlantı hatası

```bash
# MongoDB servisini kontrol edin
sudo systemctl status mongod

# MongoDB loglarını kontrol edin
sudo tail -f /var/log/mongodb/mongod.log

# MongoDB'yi yeniden başlatın
sudo systemctl restart mongod
```

## 📞 Destek

Sorun yaşarsanız:
- Email: infoqrcal@gmail.com
- GitHub Issues: https://github.com/huseyin4215/QRCal/issues

