# 🚀 Hızlı Kurulum - Termius Üzerinden

Bu rehber, Termius üzerinden SSH bağlantısı kurduktan sonra Qnnect'i hızlıca kurmanızı sağlar.

## 📋 Adımlar

### 1. Termius'ta SSH Bağlantısı Kurun

1. Termius'u açın
2. Yeni bir host ekleyin:
   - **Alias**: Qnnect Server (veya istediğiniz isim)
   - **Hostname**: Sunucu IP adresi veya domain
   - **Username**: root (veya sudo yetkili kullanıcı)
   - **Port**: 22 (veya özel SSH portu)
   - **Authentication**: Password veya SSH Key

3. Bağlan butonuna tıklayın

### 2. Kurulum Scriptini Sunucuya Kopyalayın

**Windows'tan (PowerShell):**
```powershell
scp install.sh root@your-server-ip:/root/
```

**Mac/Linux'tan:**
```bash
scp install.sh root@your-server-ip:/root/
```

### 3. Termius'ta Script'i Çalıştırın

Termius terminalinde şu komutları çalıştırın:

```bash
# Script'e çalıştırma izni verin
chmod +x install.sh

# Script'i çalıştırın
./install.sh
```

### 4. Environment Dosyalarını Düzenleyin

Script çalıştıktan sonra environment dosyalarını düzenleyin:

```bash
# Frontend .env dosyasını düzenleyin
nano /var/www/qnnect/.env

# Backend .env dosyasını düzenleyin
nano /var/www/qnnect/backend/.env
```

**Önemli:** Aşağıdaki değerleri mutlaka güncelleyin:
- `JWT_SECRET` - Güçlü bir rastgele string
- `SESSION_SECRET` - Güçlü bir rastgele string
- `MONGODB_URI` - MongoDB bağlantı string'i
- `EMAIL_USER` ve `EMAIL_PASS` - Email bilgileri
- `GOOGLE_CLIENT_ID` ve `GOOGLE_CLIENT_SECRET` - Google OAuth bilgileri
- `FRONTEND_URL` ve `GOOGLE_REDIRECT_URI` - Domain bilgileri

### 5. Nginx Yapılandırması

```bash
# Nginx yapılandırma dosyası oluşturun
sudo nano /etc/nginx/sites-available/qnnect
```

Aşağıdaki içeriği ekleyin (domain'i kendi domain'inizle değiştirin):

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

Nginx'i etkinleştirin ve başlatın:

```bash
sudo ln -s /etc/nginx/sites-available/qnnect /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 6. SSL Sertifikası (Opsiyonel ama Önerilen)

```bash
sudo apt-get install -y certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

### 7. Uygulamayı Yeniden Başlatın

Environment dosyalarını güncelledikten sonra:

```bash
pm2 restart qnnect-backend
pm2 logs qnnect-backend
```

## ✅ Kontrol Komutları

```bash
# PM2 durumu
pm2 status

# Backend logları
pm2 logs qnnect-backend

# MongoDB durumu
sudo systemctl status mongod

# Nginx durumu
sudo systemctl status nginx

# Port kontrolü
sudo netstat -tulpn | grep 5000
```

## 🔄 Güncelleme

Yeni değişiklikleri çekmek için:

```bash
cd /var/www/qnnect
git pull origin main
npm install
cd backend && npm install && cd ..
npm run build
pm2 restart qnnect-backend
```

## 🐛 Sorun Giderme

### Backend çalışmıyor
```bash
pm2 logs qnnect-backend --lines 50
```

### MongoDB bağlantı hatası
```bash
sudo systemctl status mongod
sudo tail -f /var/log/mongodb/mongod.log
```

### Nginx hataları
```bash
sudo nginx -t
sudo tail -f /var/log/nginx/error.log
```

## 📞 Yardım

Sorun yaşarsanız:
- Email: infoqrcal@gmail.com
- GitHub: https://github.com/huseyin4215/QRCal

