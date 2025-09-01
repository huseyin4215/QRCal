import apiService from './apiService';

class LocationService {
  constructor() {
    this.currentPosition = null;
    this.watchId = null;
    this.isLocationEnabled = false;
    this.locationAccuracy = null;
    this.lastLocationTime = null;
  }

  // Konum izinlerini kontrol et
  async checkLocationPermission() {
    try {
      if (!navigator.geolocation) {
        throw new Error('Tarayıcınız konum servislerini desteklemiyor');
      }

      const permission = await navigator.permissions.query({ name: 'geolocation' });
      return permission.state;
    } catch (error) {
      console.error('Konum izni kontrol edilemedi:', error);
      return 'denied';
    }
  }

  // Yüksek hassasiyetli konum al
  async getCurrentLocation(options = {}) {
    const defaultOptions = {
      enableHighAccuracy: true,
      timeout: 30000,
      maximumAge: 60000, // 1 dakika
      ...options
    };

    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          this.currentPosition = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: position.timestamp,
            altitude: position.coords.altitude,
            heading: position.coords.heading,
            speed: position.coords.speed
          };
          
          this.locationAccuracy = position.coords.accuracy;
          this.lastLocationTime = Date.now();
          this.isLocationEnabled = true;
          
          resolve(this.currentPosition);
        },
        (error) => {
          let errorMessage = 'Konum alınamadı';
          
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Konum izni reddedildi';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Konum bilgisi mevcut değil';
              break;
            case error.TIMEOUT:
              errorMessage = 'Konum alma zaman aşımına uğradı';
              break;
            default:
              errorMessage = 'Bilinmeyen konum hatası';
          }
          
          reject(new Error(errorMessage));
        },
        defaultOptions
      );
    });
  }

  // Konum izlemeyi başlat
  startLocationWatching(callback, options = {}) {
    const defaultOptions = {
      enableHighAccuracy: true,
      timeout: 30000,
      maximumAge: 30000, // 30 saniye
      ...options
    };

    if (this.watchId) {
      this.stopLocationWatching();
    }

    this.watchId = navigator.geolocation.watchPosition(
      (position) => {
        const newPosition = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: position.timestamp
        };
        
        this.currentPosition = newPosition;
        this.locationAccuracy = position.coords.accuracy;
        this.lastLocationTime = Date.now();
        
        if (callback) {
          callback(newPosition);
        }
      },
      (error) => {
        console.error('Konum izleme hatası:', error);
      },
      defaultOptions
    );

    return this.watchId;
  }

  // Konum izlemeyi durdur
  stopLocationWatching() {
    if (this.watchId) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }
  }

  // Konum doğruluğunu kontrol et
  isLocationAccurate(maxAccuracy = 50) {
    if (!this.locationAccuracy) return false;
    return this.locationAccuracy <= maxAccuracy;
  }

  // Konum tazeliğini kontrol et (60 saniye)
  isLocationFresh(maxAge = 60000) {
    if (!this.lastLocationTime) return false;
    return (Date.now() - this.lastLocationTime) <= maxAge;
  }

  // Geofence kontrolü için konum verilerini hazırla
  prepareLocationData() {
    if (!this.currentPosition) {
      throw new Error('Konum bilgisi mevcut değil');
    }

    // Best-effort: tazelik veya doğruluk düşük olsa bile sunucuya gönder

    return {
      latitude: this.currentPosition.latitude,
      longitude: this.currentPosition.longitude,
      accuracy: Math.min(Math.max(this.locationAccuracy ?? 0, 0), 50000),
      timestamp: this.lastLocationTime,
      isFresh: this.isLocationFresh(),
      isAccurate: this.isLocationAccurate(this.getDefaultAccuracyThreshold()),
      deviceInfo: {
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        language: navigator.language
      }
    };
  }

  // Sunucuda geofence kontrolü yap
  async checkGeofenceAccess(facultyId) {
    try {
      // Ensure we have a recent and accurate location before sending
      await this.ensureRecentAccurateLocation({
        maxAccuracy: this.getDefaultAccuracyThreshold(),
        timeout: 12000,
        retry: true,
        relaxUntil: 200
      });

      const locationData = this.prepareLocationData();
      
      const response = await apiService.post('/geofence/verify-location', {
        facultyId,
        location: locationData
      });

      return {
        success: true,
        allowed: response.allowed ?? false,
        message: response.message,
        distance: response.distance ?? 0,
        geofence: response.geofence ?? null
      };
    } catch (error) {
      console.error('Geofence kontrol hatası:', error, {
        accuracy: this.locationAccuracy,
        isFresh: this.isLocationFresh(),
      });
      return {
        success: false,
        allowed: false,
        message: error.message || 'Konum kontrolü yapılamadı',
        error: error
      };
    }
  }

  // Konum tabanlı randevu oluşturma
  async createLocationBasedAppointment(appointmentData) {
    try {
      // Ensure fresh and accurate location before creating
      await this.ensureRecentAccurateLocation({
        maxAccuracy: this.getDefaultAccuracyThreshold(),
        timeout: 12000,
        retry: true,
        relaxUntil: 200
      });

      const locationData = this.prepareLocationData();
      
      const response = await apiService.post('/appointments', {
        ...appointmentData,
        location: locationData
      });

      return {
        success: true,
        appointment: response.appointment,
        message: 'Randevu başarıyla oluşturuldu'
      };
    } catch (error) {
      console.error('Konum tabanlı randevu oluşturma hatası:', error);
      return {
        success: false,
        message: error.message || 'Randevu oluşturulamadı',
        error: error
      };
    }
  }

  // Konum bilgilerini temizle (KVKK uyumluluğu)
  clearLocationData() {
    this.currentPosition = null;
    this.locationAccuracy = null;
    this.lastLocationTime = null;
    this.isLocationEnabled = false;
    this.stopLocationWatching();
  }

  // Konum servis durumunu al
  getLocationStatus() {
    return {
      isEnabled: this.isLocationEnabled,
      hasPermission: this.checkLocationPermission(),
      currentPosition: this.currentPosition,
      accuracy: this.locationAccuracy,
      isFresh: this.isLocationFresh(),
      isAccurate: this.isLocationAccurate(),
      lastUpdate: this.lastLocationTime
    };
  }

  // Cihaz tipine göre varsayılan doğruluk eşiği belirle
  getDefaultAccuracyThreshold() {
    const ua = (navigator.userAgent || '').toLowerCase();
    const isMobile = /android|iphone|ipad|ipod|mobile/.test(ua);
    // Mobilde 200m, masaüstünde 300m (daha toleranslı)
    return isMobile ? 200 : 300;
  }

  // Daha hassas ve güncel konum elde etmeyi dener (gerekirse tekrar dener)
  async ensureRecentAccurateLocation(options = {}) {
    const {
      maxAccuracy = this.getDefaultAccuracyThreshold(),
      timeout = 12000,
      retry = true,
      relaxUntil = 200 // son çare tolerans (masaüstü için)
    } = options;

    // Eğer veri yoksa veya eskiyse veya yeterince hassas değilse, yeniden al
    if (!this.currentPosition || !this.isLocationFresh() || !this.isLocationAccurate(maxAccuracy)) {
      try {
        await this.getCurrentLocation({ enableHighAccuracy: true, timeout, maximumAge: 0 });
      } catch (e) {
        // İlk deneme başarısız olabilir, aşağıda yeniden ele alınacak
      }
    }

    // Hâlâ yeterince hassas değilse tek seferlik tekrar dene
    if (retry && !this.isLocationAccurate(maxAccuracy)) {
      try {
        await this.getCurrentLocation({ enableHighAccuracy: true, timeout: Math.max(timeout, 15000), maximumAge: 0 });
      } catch (e) {
        // yoksay, mevcut veriye bakacağız
      }
    }

    // Son deneme: kısa süreli izleme ile doğruluğu artırmayı dene (maks 6s)
    if (!this.isLocationAccurate(maxAccuracy)) {
      await this._tryImproveAccuracyQuickly({ desiredAccuracy: maxAccuracy, maxWaitMs: 6000 });
    }

    // Best-effort: bu noktada hata fırlatma, mevcut verilerle devam et
    return this.isLocationAccurate(maxAccuracy) || (this.locationAccuracy && this.locationAccuracy <= relaxUntil);
  }

  // Kısa süreli izleme ile doğruluğu artırmayı dener
  _tryImproveAccuracyQuickly({ desiredAccuracy, maxWaitMs = 6000 }) {
    return new Promise((resolve) => {
      if (!navigator.geolocation) return resolve();
      let resolved = false;
      const cleanup = (id, timer) => {
        try { if (id) navigator.geolocation.clearWatch(id); } catch (_) {}
        try { if (timer) clearTimeout(timer); } catch (_) {}
      };
      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          this.currentPosition = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: position.timestamp
          };
          this.locationAccuracy = position.coords.accuracy;
          this.lastLocationTime = Date.now();
          if (!resolved && this.locationAccuracy <= desiredAccuracy) {
            resolved = true;
            cleanup(watchId, timerId);
            resolve();
          }
        },
        () => {
          // Hata durumunda da zaman aşımını bekle
        },
        { enableHighAccuracy: true, maximumAge: 0, timeout: maxWaitMs }
      );
      const timerId = setTimeout(() => {
        if (!resolved) {
          resolved = true;
          cleanup(watchId, timerId);
          resolve();
        }
      }, maxWaitMs);
    });
  }
}

export const locationService = new LocationService();
export default locationService;
