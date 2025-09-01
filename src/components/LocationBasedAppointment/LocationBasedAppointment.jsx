import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Circle, useMap } from 'react-leaflet';
import { Icon } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import locationService from '../../services/locationService';
import apiService from '../../services/apiService';
import './LocationBasedAppointment.module.css';

// Leaflet marker icon fix
delete Icon.Default.prototype._getIconUrl;
Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Map center updater component
function MapUpdater({ center, zoom }) {
  const map = useMap();
  
  useEffect(() => {
    if (center && center.lat && center.lng) {
      const currentZoom = map.getZoom();
      map.setView(center, typeof zoom === 'number' ? zoom : currentZoom);
    }
  }, [center, zoom, map]);
  
  return null;
}

const LocationBasedAppointment = ({ facultyId, facultyName, onAppointmentCreated }) => {
  const [locationStatus, setLocationStatus] = useState('idle'); // idle, loading, success, error
  const [currentLocation, setCurrentLocation] = useState(null);
  const [locationAccuracy, setLocationAccuracy] = useState(null);
  const [geofenceStatus, setGeofenceStatus] = useState(null);
  const [appointmentData, setAppointmentData] = useState({
    topic: '',
    description: '',
    date: '',
    startTime: '',
    endTime: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [mapCenter, setMapCenter] = useState([39.9334, 32.8597]); // Ankara default
  const [mapZoom, setMapZoom] = useState(15);
  
  const mapRef = useRef(null);
  const locationWatchRef = useRef(null);

  // Konum servisini başlat
  useEffect(() => {
    initializeLocationService();
    return () => {
      if (locationWatchRef.current) {
        locationService.stopLocationWatching();
      }
    };
  }, []);

  const initializeLocationService = async () => {
    try {
      setLocationStatus('loading');
      
      // Konum izni kontrolü
      const permission = await locationService.checkLocationPermission();
      
      if (permission === 'denied') {
        setError('Konum izni reddedildi. Lütfen tarayıcı ayarlarından konum iznini verin.');
        setLocationStatus('error');
        return;
      }

      // Konum alma
      const position = await locationService.getCurrentLocation({
        enableHighAccuracy: true,
        timeout: 30000,
        maximumAge: 60000
      });

      setCurrentLocation(position);
      setLocationAccuracy(position.accuracy);
      setMapCenter([position.latitude, position.longitude]);
      setLocationStatus('success');

      // Konum izlemeyi başlat
      locationWatchRef.current = locationService.startLocationWatching((newPosition) => {
        setCurrentLocation(newPosition);
        setLocationAccuracy(newPosition.accuracy);
      });

    } catch (error) {
      console.error('Konum servisi başlatılamadı:', error);
      setError(error.message);
      setLocationStatus('error');
    }
  };

  // Konum yenileme
  const refreshLocation = async () => {
    try {
      setLocationStatus('loading');
      setError(null);
      
      const position = await locationService.getCurrentLocation({
        enableHighAccuracy: true,
        timeout: 30000,
        maximumAge: 0 // Her zaman yeni konum al
      });

      setCurrentLocation(position);
      setLocationAccuracy(position.accuracy);
      setMapCenter([position.latitude, position.longitude]);
      setLocationStatus('success');

    } catch (error) {
      console.error('Konum yenilenemedi:', error);
      setError(error.message);
      setLocationStatus('error');
    }
  };

  // Geofence kontrolü
  const checkGeofenceAccess = async () => {
    if (!currentLocation) {
      setError('Önce konum bilgisi alınmalı');
      return;
    }

    try {
      setGeofenceStatus('checking');
      
      const result = await locationService.checkGeofenceAccess(facultyId);
      
      if (result.success && result.allowed) {
        setGeofenceStatus('allowed');
        setError(null);
      } else {
        setGeofenceStatus('denied');
        setError(result.message);
      }
      
    } catch (error) {
      console.error('Geofence kontrol hatası:', error);
      setGeofenceStatus('error');
      setError('Konum kontrolü yapılamadı');
    }
  };

  // Form değişiklikleri
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setAppointmentData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Randevu oluşturma
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!currentLocation) {
      setError('Konum bilgisi gerekli');
      return;
    }

    if (geofenceStatus !== 'allowed') {
      setError('Konum doğrulaması yapılmamış');
      return;
    }

    // Form validasyonu
    if (!appointmentData.topic || !appointmentData.date || !appointmentData.startTime || !appointmentData.endTime) {
      setError('Lütfen tüm gerekli alanları doldurun');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      const result = await locationService.createLocationBasedAppointment({
        facultyId,
        ...appointmentData
      });

      if (result.success) {
        // Başarılı randevu oluşturma
        if (onAppointmentCreated) {
          onAppointmentCreated(result.appointment);
        }
        
        // Form temizleme
        setAppointmentData({
          topic: '',
          description: '',
          date: '',
          startTime: '',
          endTime: ''
        });
        
        setGeofenceStatus(null);
        
        // Başarı mesajı
        alert('Randevu başarıyla oluşturuldu!');
        
      } else {
        setError(result.message);
      }
      
    } catch (error) {
      console.error('Randevu oluşturma hatası:', error);
      setError(error.message || 'Randevu oluşturulamadı');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Konum durumu göstergesi
  const renderLocationStatus = () => {
    switch (locationStatus) {
      case 'loading':
        return (
          <div className="location-status loading">
            <div className="spinner"></div>
            <span>Konum alınıyor...</span>
          </div>
        );
      
      case 'success':
        return (
          <div className="location-status success">
            <span>✅ Konum alındı</span>
            <span className="accuracy">Hassasiyet: {locationAccuracy}m</span>
            <button onClick={refreshLocation} className="refresh-btn">
              🔄 Yenile
            </button>
          </div>
        );
      
      case 'error':
        return (
          <div className="location-status error">
            <span>❌ Konum alınamadı</span>
            <button onClick={refreshLocation} className="retry-btn">
              🔄 Tekrar Dene
            </button>
          </div>
        );
      
      default:
        return null;
    }
  };

  // Geofence durumu göstergesi
  const renderGeofenceStatus = () => {
    if (!currentLocation) return null;

    switch (geofenceStatus) {
      case 'checking':
        return (
          <div className="geofence-status checking">
            <div className="spinner"></div>
            <span>Konum kontrol ediliyor...</span>
          </div>
        );
      
      case 'allowed':
        return (
          <div className="geofence-status allowed">
            <span>✅ Konum doğrulandı - Randevu alabilirsiniz</span>
          </div>
        );
      
      case 'denied':
        return (
          <div className="geofence-status denied">
            <span>❌ Konum doğrulanamadı</span>
            <button onClick={checkGeofenceAccess} className="retry-btn">
              🔄 Tekrar Dene
            </button>
          </div>
        );
      
      default:
        return (
          <div className="geofence-status pending">
            <button 
              onClick={checkGeofenceAccess} 
              className="check-location-btn"
              disabled={!currentLocation}
            >
              📍 Konumumu Doğrula
            </button>
          </div>
        );
    }
  };

  return (
    <div className="location-based-appointment">
      <div className="header">
        <h2>📍 Konum Tabanlı Randevu</h2>
        <p className="faculty-name">{facultyName}</p>
      </div>

      <div className="location-section">
        <h3>Konum Bilgisi</h3>
        {renderLocationStatus()}
        
        {currentLocation && (
          <div className="location-details">
            <p><strong>Enlem:</strong> {currentLocation.latitude.toFixed(6)}</p>
            <p><strong>Boylam:</strong> {currentLocation.longitude.toFixed(6)}</p>
            <p><strong>Hassasiyet:</strong> {locationAccuracy}m</p>
            <p><strong>Son Güncelleme:</strong> {new Date(currentLocation.timestamp).toLocaleTimeString('tr-TR')}</p>
          </div>
        )}
      </div>

      <div className="map-section">
        <h3>Harita</h3>
        <div className="map-container">
          <MapContainer 
            ref={mapRef}
            center={mapCenter} 
            zoom={mapZoom} 
            style={{ height: '400px', width: '100%' }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            
            <MapUpdater center={{ lat: mapCenter[0], lng: mapCenter[1] }} zoom={mapZoom} />
            
            {/* Mevcut konum marker'ı */}
            {currentLocation && (
              <Marker 
                position={[currentLocation.latitude, currentLocation.longitude]}
                title="Mevcut Konumunuz"
              />
            )}
            
            {/* Konum hassasiyeti çemberi */}
            {currentLocation && locationAccuracy && (
              <Circle
                center={[currentLocation.latitude, currentLocation.longitude]}
                radius={locationAccuracy}
                pathOptions={{ 
                  color: '#3b82f6', 
                  fillColor: '#3b82f6', 
                  fillOpacity: 0.2 
                }}
                title={`Konum Hassasiyeti: ${locationAccuracy}m`}
              />
            )}
          </MapContainer>
        </div>
      </div>

      <div className="geofence-section">
        <h3>Konum Doğrulama</h3>
        {renderGeofenceStatus()}
      </div>

      {geofenceStatus === 'allowed' && (
        <div className="appointment-form-section">
          <h3>Randevu Bilgileri</h3>
          
          <form onSubmit={handleSubmit} className="appointment-form">
            <div className="form-group">
              <label htmlFor="topic">Konu *</label>
              <input
                type="text"
                id="topic"
                name="topic"
                value={appointmentData.topic}
                onChange={handleInputChange}
                placeholder="Randevu konusu"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="description">Açıklama</label>
              <textarea
                id="description"
                name="description"
                value={appointmentData.description}
                onChange={handleInputChange}
                placeholder="Randevu açıklaması (opsiyonel)"
                rows="3"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="date">Tarih *</label>
                <input
                  type="date"
                  id="date"
                  name="date"
                  value={appointmentData.date}
                  onChange={handleInputChange}
                  min={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="startTime">Başlangıç Saati *</label>
                <input
                  type="time"
                  id="startTime"
                  name="startTime"
                  value={appointmentData.startTime}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="endTime">Bitiş Saati *</label>
                <input
                  type="time"
                  id="endTime"
                  name="endTime"
                  value={appointmentData.endTime}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div className="form-actions">
              <button 
                type="submit" 
                className="submit-btn"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Gönderiliyor...' : 'Randevu Oluştur'}
              </button>
            </div>
          </form>
        </div>
      )}

      {error && (
        <div className="error-message">
          <span>❌ {error}</span>
        </div>
      )}

      <div className="info-section">
        <h4>ℹ️ Bilgi</h4>
        <ul>
          <li>Randevu almak için konumunuzun doğrulanması gerekmektedir</li>
          <li>Konum bilgisi yalnızca randevu oluşturma sırasında kullanılır</li>
          <li>Konum bilgileri KVKK uyumlu olarak işlenir</li>
          <li>Yüksek hassasiyetli konum için GPS kullanımı önerilir</li>
        </ul>
      </div>
    </div>
  );
};

export default LocationBasedAppointment;
