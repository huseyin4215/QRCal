import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Circle, useMap } from 'react-leaflet';
import { Icon } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './AdminGeofenceManager.module.css';

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
  
  React.useEffect(() => {
    if (center && center.lat && center.lng) {
      map.setView(center, zoom);
    }
  }, [center, zoom, map]);
  
  return null;
}

const GeofenceDemo = () => {
  const [activeTab, setActiveTab] = useState('admin');
  const [demoGeofences] = useState([
    {
      id: 1,
      name: 'Bilgisayar Mühendisliği Fakültesi',
      center: { latitude: 39.9334, longitude: 32.8597 },
      radius: 150,
      isActive: true,
      facultyName: 'Bilgisayar Mühendisliği'
    },
    {
      id: 2,
      name: 'Elektrik-Elektronik Fakültesi',
      center: { latitude: 39.9340, longitude: 32.8600 },
      radius: 120,
      isActive: true,
      facultyName: 'Elektrik-Elektronik Mühendisliği'
    }
  ]);

  const [studentLocation, setStudentLocation] = useState({ latitude: 39.9330, longitude: 32.8590 });
  const [isLocationVerified, setIsLocationVerified] = useState(false);
  const [verificationMessage, setVerificationMessage] = useState('');

  const verifyStudentLocation = () => {
    // Find the closest geofence
    let closestGeofence = null;
    let minDistance = Infinity;

    for (const geofence of demoGeofences) {
      if (!geofence.isActive) continue;
      
      const distance = calculateDistance(
        studentLocation.latitude,
        studentLocation.longitude,
        geofence.center.latitude,
        geofence.center.longitude
      );
      
      if (distance < minDistance) {
        minDistance = distance;
        closestGeofence = geofence;
      }
    }

    if (closestGeofence && minDistance <= closestGeofence.radius) {
      setIsLocationVerified(true);
      setVerificationMessage(`✅ Konum doğrulandı! ${closestGeofence.name} alanındasınız. Randevu alabilirsiniz.`);
    } else {
      setIsLocationVerified(false);
      setVerificationMessage(`❌ Konum doğrulanamadı! En yakın geofence'den ${Math.round(minDistance)}m uzaktasınız.`);
    }
  };

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371000; // Earth radius in meters
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const moveStudentLocation = (direction) => {
    const step = 0.0001; // Small movement step
    setStudentLocation(prev => {
      switch (direction) {
        case 'north':
          return { ...prev, latitude: prev.latitude + step };
        case 'south':
          return { ...prev, latitude: prev.latitude - step };
        case 'east':
          return { ...prev, longitude: prev.longitude + step };
        case 'west':
          return { ...prev, longitude: prev.longitude - step };
        default:
          return prev;
      }
    });
    setIsLocationVerified(false);
    setVerificationMessage('');
  };

  return (
    <div className="geofence-demo">
      <div className="demo-header">
        <h2>🗺️ Geofence Sistemi Demo</h2>
        <p>Admin ve öğrenci perspektifinden geofence yönetimi ve konum doğrulama</p>
      </div>

      <div className="demo-tabs">
        <button 
          className={`tab-btn ${activeTab === 'admin' ? 'active' : ''}`}
          onClick={() => setActiveTab('admin')}
        >
          👨‍💼 Admin Görünümü
        </button>
        <button 
          className={`tab-btn ${activeTab === 'student' ? 'active' : ''}`}
          onClick={() => setActiveTab('student')}
        >
          👨‍🎓 Öğrenci Görünümü
        </button>
      </div>

      {activeTab === 'admin' && (
        <div className="admin-demo">
          <div className="demo-section">
            <h3>🎯 Admin Özellikleri</h3>
            <ul>
              <li>✅ Haritaya geofence konumu ekleme</li>
              <li>✅ Sürükle-bırak ile konum değiştirme</li>
              <li>✅ Yarıçap ayarlama (10m - 10km)</li>
              <li>✅ Çalışma saatleri tanımlama</li>
              <li>✅ Konum doğrulama ayarları</li>
              <li>✅ Geofence aktif/pasif yapma</li>
            </ul>
          </div>

          <div className="demo-map-section">
            <h3>🗺️ Geofence Haritası</h3>
            <div className="map-container">
              <MapContainer 
                center={[39.9334, 32.8597]} 
                zoom={16} 
                style={{ height: '400px', width: '100%' }}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                
                <MapUpdater center={{ lat: 39.9334, lng: 32.8597 }} zoom={16} />
                
                {/* Demo geofences */}
                {demoGeofences.map(geofence => (
                  <div key={geofence.id}>
                    <Marker 
                      position={[geofence.center.latitude, geofence.center.longitude]}
                      title={geofence.name}
                    />
                    <Circle
                      center={[geofence.center.latitude, geofence.center.longitude]}
                      radius={geofence.radius}
                      pathOptions={{ 
                        color: geofence.isActive ? '#10b981' : '#6b7280', 
                        fillColor: geofence.isActive ? '#10b981' : '#6b7280', 
                        fillOpacity: 0.2 
                      }}
                      title={`${geofence.name} (${geofence.radius}m)`}
                    />
                  </div>
                ))}
              </MapContainer>
            </div>
          </div>

          <div className="demo-info">
            <h4>💡 Nasıl Kullanılır?</h4>
            <ol>
              <li><strong>Yeni Geofence:</strong> "Yeni Geofence" butonuna tıklayın</li>
              <li><strong>Konum Seçimi:</strong> Haritaya tıklayarak konum belirleyin</li>
              <li><strong>Yarıçap Ayarı:</strong> Slider ile yarıçapı ayarlayın</li>
              <li><strong>Sürükleme:</strong> Marker'ı sürükleyerek konumu değiştirin</li>
              <li><strong>Kaydetme:</strong> Form bilgilerini doldurup kaydedin</li>
            </ol>
          </div>
        </div>
      )}

      {activeTab === 'student' && (
        <div className="student-demo">
          <div className="demo-section">
            <h3>🎓 Öğrenci Özellikleri</h3>
            <ul>
              <li>📍 Konum bilgisi alma</li>
              <li>✅ Geofence içinde olup olmadığını kontrol etme</li>
              <li>⏰ Çalışma saatleri kontrolü</li>
              <li>📱 Randevu alma (sadece geofence içindeyken)</li>
            </ul>
          </div>

          <div className="demo-map-section">
            <h3>🗺️ Öğrenci Konumu ve Geofence Kontrolü</h3>
            <div className="map-container">
              <MapContainer 
                center={[39.9334, 32.8597]} 
                zoom={16} 
                style={{ height: '400px', width: '100%' }}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                
                <MapUpdater center={{ lat: 39.9334, lng: 32.8597 }} zoom={16} />
                
                {/* Demo geofences */}
                {demoGeofences.map(geofence => (
                  <div key={geofence.id}>
                    <Marker 
                      position={[geofence.center.latitude, geofence.center.longitude]}
                      title={geofence.name}
                    />
                    <Circle
                      center={[geofence.center.latitude, geofence.center.longitude]}
                      radius={geofence.radius}
                      pathOptions={{ 
                        color: geofence.isActive ? '#10b981' : '#6b7280', 
                        fillColor: geofence.isActive ? '#10b981' : '#6b7280', 
                        fillOpacity: 0.2 
                      }}
                      title={`${geofence.name} (${geofence.radius}m)`}
                    />
                  </div>
                ))}
                
                {/* Student location */}
                <Marker 
                  position={[studentLocation.latitude, studentLocation.longitude]}
                  title="Öğrenci Konumu"
                  icon={new Icon({
                    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
                    iconSize: [25, 41],
                    iconAnchor: [12, 41],
                    popupAnchor: [1, -34],
                    shadowSize: [41, 41]
                  })}
                />
              </MapContainer>
            </div>
          </div>

          <div className="demo-controls">
            <h4>🎮 Öğrenci Konumunu Kontrol Et</h4>
            <div className="location-controls">
              <button onClick={() => moveStudentLocation('north')}>⬆️ Kuzey</button>
              <button onClick={() => moveStudentLocation('south')}>⬇️ Güney</button>
              <button onClick={() => moveStudentLocation('east')}>➡️ Doğu</button>
              <button onClick={() => moveStudentLocation('west')}>⬅️ Batı</button>
            </div>
            
            <div className="verification-section">
              <button 
                onClick={verifyStudentLocation}
                className="verify-btn"
              >
                🔍 Konum Doğrula
              </button>
              
              {verificationMessage && (
                <div className={`verification-message ${isLocationVerified ? 'success' : 'error'}`}>
                  {verificationMessage}
                </div>
              )}
            </div>
          </div>

          <div className="demo-info">
            <h4>💡 Nasıl Çalışır?</h4>
            <ol>
              <li><strong>Konum Kontrolü:</strong> Yukarıdaki butonlarla öğrenci konumunu değiştirin</li>
              <li><strong>Doğrulama:</strong> "Konum Doğrula" butonuna tıklayın</li>
              <li><strong>Sonuç:</strong> Geofence içinde olup olmadığınızı görün</li>
              <li><strong>Randevu:</strong> Sadece geofence içindeyken randevu alabilirsiniz</li>
            </ol>
          </div>
        </div>
      )}
    </div>
  );
};

export default GeofenceDemo;
