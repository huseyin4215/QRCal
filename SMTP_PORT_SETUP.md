# SMTP Port Açma Rehberi (Hestia Control Panel)

Gmail SMTP (port 587 ve 465) kullanmak için firewall portlarını açmanız gerekiyor.

## 🏛️ Hestia Control Panel Firewall

### Yöntem 1: Hestia Web Arayüzünden (Önerilen)

1. **Hestia Control Panel'e giriş yapın** (genellikle `https://your-server-ip:8083` veya domain üzerinden)

2. **Server** sekmesine gidin → **Firewall** bölümüne tıklayın

3. **Add Rule** butonuna tıklayın

4. **SMTP Port 587 için:**
   - **Action:** `Allow`
   - **Protocol:** `TCP`
   - **Port:** `587`
   - **Direction:** `Outbound` (ÖNEMLİ: Outbound olmalı!)
   - **Description:** `SMTP Submission (Gmail)`
   - **Save** butonuna tıklayın

5. **SMTP Port 465 için:**
   - **Add Rule** butonuna tekrar tıklayın
   - **Action:** `Allow`
   - **Protocol:** `TCP`
   - **Port:** `465`
   - **Direction:** `Outbound` (ÖNEMLİ: Outbound olmalı!)
   - **Description:** `SMTP SSL (Gmail)`
   - **Save** butonuna tıklayın

6. Firewall'u yeniden başlatın (genellikle otomatik olur, ama kontrol edin)

### Yöntem 2: Hestia CLI ile (SSH üzerinden)

SSH ile sunucuya bağlanın ve şu komutları çalıştırın:

```bash
# SMTP port 587 için outbound kuralı ekle
v-add-firewall-rule allow tcp 587 out SMTP-Submission

# SMTP port 465 için outbound kuralı ekle
v-add-firewall-rule allow tcp 465 out SMTP-SSL

# Firewall kurallarını listele (kontrol için)
v-list-firewall-rules

# Firewall'u yeniden başlat
v-restart-firewall
```

**Not:** Eğer `v-add-firewall-rule` komutu çalışmıyorsa, Hestia'nın firewall yönetimi farklı olabilir. Bu durumda UFW kullanabilirsiniz.

### Yöntem 3: UFW (Uncomplicated Firewall) ile

Hestia'nın firewall'u UFW kullanıyorsa:

```bash
# UFW durumunu kontrol et
sudo ufw status verbose

# SMTP portlarını aç (outbound için)
sudo ufw allow out 587/tcp comment 'SMTP Submission (Gmail)'
sudo ufw allow out 465/tcp comment 'SMTP SSL (Gmail)'

# UFW'yi aktif et (eğer değilse)
sudo ufw enable

# Durumu kontrol et
sudo ufw status numbered
```

### Yöntem 4: iptables ile (Manuel)

Eğer yukarıdaki yöntemler çalışmazsa, direkt iptables kullanabilirsiniz:

```bash
# SMTP port 587 için outbound kuralı
sudo iptables -A OUTPUT -p tcp --dport 587 -j ACCEPT

# SMTP port 465 için outbound kuralı
sudo iptables -A OUTPUT -p tcp --dport 465 -j ACCEPT

# Kuralları kaydet (iptables-persistent kuruluysa)
sudo iptables-save | sudo tee /etc/iptables/rules.v4

# Veya Hestia'nın kendi kayıt sistemini kullanın
```

## ✅ Port Açıldığını Test Etme

### 1. Telnet ile Test

```bash
# Port 587 testi
telnet smtp.gmail.com 587

# Port 465 testi
telnet smtp.gmail.com 465
```

**Başarılı bağlantı için şu çıktıyı görmelisiniz:**
```
Trying 142.251.127.109...
Connected to smtp.gmail.com.
Escape character is '^]'.
```

**Hata alırsanız (Connection timeout):**
- Port hala kapalı demektir
- Firewall kurallarını tekrar kontrol edin
- `Direction: Outbound` olduğundan emin olun (Inbound değil!)

### 2. nc (netcat) ile Test

```bash
# Port 587 testi
nc -zv smtp.gmail.com 587

# Port 465 testi
nc -zv smtp.gmail.com 465
```

**Başarılı çıktı:**
```
Connection to smtp.gmail.com 587 port [tcp/submission] succeeded!
```

### 3. Backend'den Test

Backend loglarını kontrol edin:

```bash
cd /home/soltudo/QRCal/backend
pm2 logs qrcal-backend --lines 50 | grep -i "smtp\|email\|mail"
```

Email göndermeyi deneyin (örneğin yeni bir öğretim üyesi oluşturun) ve logları kontrol edin.

## 🔧 Backend .env Ayarları

Backend `.env` dosyasında şunlar olmalı:

```env
# Email Configuration (Gmail SMTP)
EMAIL_USER=infoqrcal@gmail.com
EMAIL_APP_PASSWORD=your-16-char-app-password
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USE_SENDMAIL=false
```

**Not:** Gmail App Password oluşturmak için:
1. Google Account → **Security** → **2-Step Verification** (açık olmalı)
2. **App Passwords** → Select app: **Mail** → Select device: **Other** → **Generate**
3. 16 karakterlik şifreyi kopyalayın ve `.env` dosyasına yapıştırın

## 🚨 Sorun Giderme

### Port Hala Kapalı

1. **Hestia Firewall kontrolü:**
   ```bash
   # Hestia CLI ile kontrol
   v-list-firewall-rules
   ```

2. **UFW durumu:**
   ```bash
   sudo ufw status verbose
   ```

3. **iptables kontrolü:**
   ```bash
   sudo iptables -L OUTPUT -n -v | grep -E "587|465"
   ```

4. **Hestia'nın kullandığı firewall servisini kontrol et:**
   ```bash
   # Hestia genellikle UFW veya iptables kullanır
   sudo systemctl status ufw
   sudo systemctl status firewalld
   ```

### Connection Timeout Hatası

- Port açık olsa bile timeout alıyorsanız:
  1. **Outbound** kurallarını kontrol edin (Inbound değil!)
  2. Gmail App Password'un doğru olduğundan emin olun
  3. "Less secure app access" kapalı olmalı (App Password kullanıyorsanız)
  4. Sunucunun internet bağlantısını kontrol edin:
     ```bash
     ping 8.8.8.8
     curl -I https://smtp.gmail.com
     ```

### Email Gönderilemiyor

Backend loglarını kontrol edin:
```bash
pm2 logs qrcal-backend --lines 100 | grep -i "email\|smtp\|mail"
```

Hata mesajlarını kontrol edin ve gerekirse `.env` dosyasını güncelleyin.

### Hestia Firewall Komutları Çalışmıyor

Eğer `v-add-firewall-rule` komutu bulunamıyorsa:

1. **Hestia versiyonunu kontrol edin:**
   ```bash
   v-list-sys-info
   ```

2. **UFW kullanın** (yukarıdaki Yöntem 3)

3. **Hestia dokümantasyonunu kontrol edin:**
   - Hestia'nın firewall yönetimi versiyona göre değişebilir
   - Web arayüzünden yapmak genellikle daha güvenilirdir

## 📝 Özet Adımlar

1. ✅ Hestia Control Panel → **Server** → **Firewall**
2. ✅ **Add Rule** → Port **587** (TCP, Outbound) ekle
3. ✅ **Add Rule** → Port **465** (TCP, Outbound) ekle
4. ✅ Backend `.env` dosyasında Gmail SMTP ayarlarını yap
5. ✅ Gmail App Password oluştur
6. ✅ Backend'i restart et: `pm2 restart qrcal-backend --update-env`
7. ✅ Test et: `telnet smtp.gmail.com 587`

**ÖNEMLİ:** Port kurallarını eklerken **Direction: Outbound** seçtiğinizden emin olun! SMTP için sunucunun dışarıya bağlanması gerekiyor, dışarıdan içeriye değil.

Portlar açıldıktan sonra email gönderme çalışmalı! 🎉

