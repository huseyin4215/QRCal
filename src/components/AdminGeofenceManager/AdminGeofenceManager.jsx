import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Circle, useMap } from 'react-leaflet';
import { Icon } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { apiService } from '../../services/apiService';
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
  
  useEffect(() => {
    if (center && center.lat && center.lng) {
      map.setView(center, zoom);
    }
  }, [center, zoom, map]);
  
  return null;
}

const AdminGeofenceManager = () => {
  const [geofences, setGeofences] = useState([]);
  const [faculties, setFaculties] = useState([]);
  const [selectedGeofence, setSelectedGeofence] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [mapCenter, setMapCenter] = useState([39.9334, 32.8597]); // Ankara default
  const [mapZoom, setMapZoom] = useState(10);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    facultyId: '',
    center: { latitude: 39.9334, longitude: 32.8597 },
    radius: 100,
    locationType: 'custom',
    isActive: true,
    workingHours: {
      monday: { start: '09:00', end: '17:00', isOpen: true },
      tuesday: { start: '09:00', end: '17:00', isOpen: true },
      wednesday: { start: '09:00', end: '17:00', isOpen: true },
      thursday: { start: '09:00', end: '17:00', isOpen: true },
      friday: { start: '09:00', end: '17:00', isOpen: true },
      saturday: { start: '09:00', end: '13:00', isOpen: false },
      sunday: { start: '09:00', end: '13:00', isOpen: false }
    },
    settings: {
      requireLocationVerification: true,
      maxAccuracy: 50,
      locationFreshness: 60,
      allowManualOverride: false,
      requireAdminApproval: false
    }
  });

  const mapRef = useRef(null);
  const isEditing = selectedGeofence !== null;

  // Component mount
  useEffect(() => {
    fetchGeofences();
    fetchFaculties();
  }, []);

  // Geofence'leri getir
  const fetchGeofences = async () => {
    try {
      setIsLoading(true);
      const response = await apiService.get('/geofence/admin');
      
      if (response.data.success) {
        setGeofences(response.data.data);
      }
    } catch (error) {
      console.error('Geofence\'ler alınamadı:', error);
      setError('Geofence\'ler alınamadı');
    } finally {
      setIsLoading(false);
    }
  };

  // Faculty'leri getir
  const fetchFaculties = async () => {
    try {
      const response = await apiService.get('/users/faculty');
      
      if (response.data.success) {
        setFaculties(response.data.data);
      }
    } catch (error) {
      console.error('Faculty\'ler alınamadı:', error);
    }
  };

  // Modal açma
  const openModal = (geofence = null) => {
    if (geofence) {
      setSelectedGeofence(geofence);
      setFormData({
        name: geofence.name,
        description: geofence.description || '',
        facultyId: geofence.facultyId._id || geofence.facultyId,
        center: geofence.center,
        radius: geofence.radius,
        locationType: geofence.locationType,
        isActive: geofence.isActive,
        workingHours: geofence.workingHours,
        settings: geofence.settings
      });
      setMapCenter([geofence.center.latitude, geofence.center.longitude]);
    } else {
      setSelectedGeofence(null);
      setFormData({
        name: '',
        description: '',
        facultyId: '',
        center: { latitude: 39.9334, longitude: 32.8597 },
        radius: 100,
        locationType: 'custom',
        isActive: true,
        workingHours: {
          monday: { start: '09:00', end: '17:00', isOpen: true },
          tuesday: { start: '09:00', end: '17:00', isOpen: true },
          wednesday: { start: '09:00', end: '17:00', isOpen: true },
          thursday: { start: '09:00', end: '17:00', isOpen: true },
          friday: { start: '09:00', end: '17:00', isOpen: true },
          saturday: { start: '09:00', end: '13:00', isOpen: false },
          sunday: { start: '09:00', end: '13:00', isOpen: false }
        },
        settings: {
          requireLocationVerification: true,
          maxAccuracy: 50,
          locationFreshness: 60,
          allowManualOverride: false,
          requireAdminApproval: false
        }
      });
      setMapCenter([39.9334, 32.8597]);
    }
    setIsModalOpen(true);
  };

  // Modal kapatma
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedGeofence(null);
    setFormData({
      name: '',
      description: '',
      facultyId: '',
      center: { latitude: 39.9334, longitude: 32.8597 },
      radius: 100,
      locationType: 'custom',
      isActive: true,
      workingHours: {
        monday: { start: '09:00', end: '17:00', isOpen: true },
        tuesday: { start: '09:00', end: '17:00', isOpen: true },
        wednesday: { start: '09:00', end: '17:00', isOpen: true },
        thursday: { start: '09:00', end: '17:00', isOpen: true },
        friday: { start: '09:00', end: '17:00', isOpen: true },
        saturday: { start: '09:00', end: '13:00', isOpen: false },
        sunday: { start: '09:00', end: '13:00', isOpen: false }
      },
      settings: {
        requireLocationVerification: true,
        maxAccuracy: 50,
        locationFreshness: 60,
        allowManualOverride: false,
        requireAdminApproval: false
      }
    });
  };

  // Form değişiklikleri
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: type === 'checkbox' ? checked : value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  // Harita tıklama
  const handleMapClick = (e) => {
    const { lat, lng } = e.latlng;
    setFormData(prev => ({
      ...prev,
      center: { latitude: lat, longitude: lng }
    }));
    setMapCenter([lat, lng]);
  };

  // Form gönderimi
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setIsLoading(true);
      setError(null);

      if (isEditing) {
        // Güncelleme
        const response = await apiService.put(`/geofence/${selectedGeofence._id}`, formData);
        
        if (response.data.success) {
          await fetchGeofences();
          closeModal();
          alert('Geofence başarıyla güncellendi');
        }
      } else {
        // Yeni oluşturma
        const response = await apiService.post('/geofence', formData);
        
        if (response.data.success) {
          await fetchGeofences();
          closeModal();
          alert('Geofence başarıyla oluşturuldu');
        }
      }
      
    } catch (error) {
      console.error('Geofence işlemi başarısız:', error);
      setError(error.response?.data?.message || 'İşlem başarısız');
    } finally {
      setIsLoading(false);
    }
  };

  // Geofence silme
  const handleDelete = async (id) => {
    if (!confirm('Bu geofence\'i silmek istediğinizden emin misiniz?')) {
      return;
    }

    try {
      setIsLoading(true);
      const response = await apiService.delete(`/geofence/${id}`);
      
      if (response.data.success) {
        await fetchGeofences();
        alert('Geofence başarıyla silindi');
      }
    } catch (error) {
      console.error('Geofence silinemedi:', error);
      setError('Geofence silinemedi');
    } finally {
      setIsLoading(false);
    }
  };

  // Geofence durumu değiştirme
  const toggleGeofenceStatus = async (id, currentStatus) => {
    try {
      const response = await apiService.put(`/geofence/${id}`, {
        isActive: !currentStatus
      });
      
      if (response.data.success) {
        await fetchGeofences();
      }
    } catch (error) {
      console.error('Geofence durumu değiştirilemedi:', error);
      setError('Durum değiştirilemedi');
    }
  };

  return (
    <div className="admin-geofence-manager">
      <div className="header">
        <h2>🗺️ Geofence Yönetimi</h2>
        <button 
          onClick={() => openModal()} 
          className="add-btn"
        >
          ➕ Yeni Geofence
        </button>
      </div>

      {error && (
        <div className="error-message">
          <span>❌ {error}</span>
          <button onClick={() => setError(null)} className="close-btn">✕</button>
        </div>
      )}

      <div className="content">
        <div className="geofence-list">
          <h3>Mevcut Geofence'ler</h3>
          
          {isLoading ? (
            <div className="loading">Yükleniyor...</div>
          ) : geofences.length === 0 ? (
            <div className="empty-state">Henüz geofence oluşturulmamış</div>
          ) : (
            <div className="geofence-grid">
              {geofences.map(geofence => (
                <div key={geofence._id} className="geofence-card">
                  <div className="card-header">
                    <h4>{geofence.name}</h4>
                    <span className={`status ${geofence.isActive ? 'active' : 'inactive'}`}>
                      {geofence.isActive ? 'Aktif' : 'Pasif'}
                    </span>
                  </div>
                  
                  <div className="card-content">
                    <p><strong>Faculty:</strong> {geofence.facultyId?.name || 'Bilinmiyor'}</p>
                    <p><strong>Tip:</strong> {geofence.locationType}</p>
                    <p><strong>Yarıçap:</strong> {geofence.radius}m</p>
                    <p><strong>Merkez:</strong> {geofence.center.latitude.toFixed(6)}, {geofence.center.longitude.toFixed(6)}</p>
                  </div>
                  
                  <div className="card-actions">
                    <button 
                      onClick={() => openModal(geofence)}
                      className="edit-btn"
                    >
                      ✏️ Düzenle
                    </button>
                    
                    <button 
                      onClick={() => toggleGeofenceStatus(geofence._id, geofence.isActive)}
                      className={`toggle-btn ${geofence.isActive ? 'deactivate' : 'activate'}`}
                    >
                      {geofence.isActive ? '⏸️ Pasif Yap' : '▶️ Aktif Yap'}
                    </button>
                    
                    <button 
                      onClick={() => handleDelete(geofence._id)}
                      className="delete-btn"
                    >
                      🗑️ Sil
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="map-preview">
          <h3>Geofence Haritası</h3>
          <div className="map-container">
            <MapContainer 
              ref={mapRef}
              center={mapCenter} 
              zoom={mapZoom} 
              style={{ height: '500px', width: '100%' }}
              onClick={handleMapClick}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
              
              <MapUpdater center={{ lat: mapCenter[0], lng: mapCenter[1] }} zoom={mapZoom} />
              
              {/* Mevcut geofence'ler */}
              {geofences.map(geofence => (
                <div key={geofence._id}>
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
              
              {/* Form için seçilen konum */}
              {isModalOpen && (
                <Marker 
                  position={[formData.center.latitude, formData.center.longitude]}
                  title="Seçilen Konum"
                />
              )}
            </MapContainer>
          </div>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>{isEditing ? 'Geofence Düzenle' : 'Yeni Geofence'}</h3>
              <button onClick={closeModal} className="close-btn">✕</button>
            </div>
            
            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="name">İsim *</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="facultyId">Faculty *</label>
                  <select
                    id="facultyId"
                    name="facultyId"
                    value={formData.facultyId}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Faculty Seçin</option>
                    {faculties.map(faculty => (
                      <option key={faculty._id} value={faculty._id}>
                        {faculty.name} - {faculty.department}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="description">Açıklama</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="3"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="latitude">Enlem *</label>
                  <input
                    type="number"
                    id="latitude"
                    name="center.latitude"
                    value={formData.center.latitude}
                    onChange={handleInputChange}
                    step="0.000001"
                    min="-90"
                    max="90"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="longitude">Boylam *</label>
                  <input
                    type="number"
                    id="longitude"
                    name="center.longitude"
                    value={formData.center.longitude}
                    onChange={handleInputChange}
                    step="0.000001"
                    min="-180"
                    max="180"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="radius">Yarıçap (metre) *</label>
                  <input
                    type="number"
                    id="radius"
                    name="radius"
                    value={formData.radius}
                    onChange={handleInputChange}
                    min="10"
                    max="10000"
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="locationType">Konum Tipi</label>
                  <select
                    id="locationType"
                    name="locationType"
                    value={formData.locationType}
                    onChange={handleInputChange}
                  >
                    <option value="university">Üniversite</option>
                    <option value="faculty">Fakülte</option>
                    <option value="building">Bina</option>
                    <option value="room">Oda</option>
                    <option value="custom">Özel</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label>
                    <input
                      type="checkbox"
                      name="isActive"
                      checked={formData.isActive}
                      onChange={handleInputChange}
                    />
                    Aktif
                  </label>
                </div>
              </div>

              <div className="form-actions">
                <button 
                  type="button" 
                  onClick={closeModal}
                  className="cancel-btn"
                >
                  İptal
                </button>
                
                <button 
                  type="submit" 
                  className="submit-btn"
                  disabled={isLoading}
                >
                  {isLoading ? 'Kaydediliyor...' : (isEditing ? 'Güncelle' : 'Oluştur')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminGeofenceManager;
