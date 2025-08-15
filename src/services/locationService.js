import { apiService } from './apiService';

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
          longitude: position.coords.latitude,
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

    if (!this.isLocationFresh()) {
      throw new Error('Konum bilgisi çok eski, yeniden alınmalı');
    }

    if (!this.isLocationAccurate()) {
      throw new Error('Konum bilgisi yeterince hassas değil');
    }

    return {
      latitude: this.currentPosition.latitude,
      longitude: this.currentPosition.longitude,
      accuracy: this.locationAccuracy,
      timestamp: this.lastLocationTime,
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
      const locationData = this.prepareLocationData();
      
      const response = await apiService.post('/appointments/check-location', {
        facultyId,
        location: locationData
      });

      return {
        success: true,
        allowed: response.data.allowed,
        message: response.data.message,
        distance: response.data.distance,
        geofence: response.data.geofence
      };
    } catch (error) {
      console.error('Geofence kontrol hatası:', error);
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
      const locationData = this.prepareLocationData();
      
      const response = await apiService.post('/appointments/create-with-location', {
        ...appointmentData,
        location: locationData
      });

      return {
        success: true,
        appointment: response.data.appointment,
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
}

export const locationService = new LocationService();
export default locationService;
