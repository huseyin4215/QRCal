import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { MapContainer, TileLayer, Marker, Circle, useMap, useMapEvents } from 'react-leaflet';
import { Icon } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import apiService from '../../services/apiService';
import styles from './AdminGeofenceManager.module.css';
import gcStyles from './GeofenceControls.module.css';

// Leaflet marker icon fix
delete Icon.Default.prototype._getIconUrl;
Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Map center updater component
function MapUpdater({ center, isInteracting, shouldRecenter, onDone }) {
  const map = useMap();
  
  useEffect(() => {
    if (shouldRecenter && !isInteracting && center && center.lat && center.lng) {
      // Re-center without altering the user's current zoom level
      const currentZoom = map.getZoom();
      map.setView(center, currentZoom);
      if (onDone) onDone();
    }
  }, [center, isInteracting, shouldRecenter, map, onDone]);
  
  return null;
}

// Draggable marker component for form
function DraggableMarker({ position, onPositionChange, isEditing }) {
  const map = useMap();
  
  const handleDragEnd = (e) => {
    const { lat, lng } = e.target.getLatLng();
    onPositionChange({ latitude: lat, longitude: lng });
  };

  if (!isEditing) return null;

  return (
    <Marker
      position={[position.latitude, position.longitude]}
      draggable={true}
      eventHandlers={{
        dragend: handleDragEnd
      }}
      title="Sürükleyerek konumu değiştirin"
    />
  );
}

// Map click handler component
function MapClickHandler({ onMapClick, allowClicks }) {
  useMapEvents({
    click: (e) => {
      if (allowClicks) {
        onMapClick(e);
      }
    }
  });
  
  return null;
}

// Track map interactions to prevent unwanted re-centering
function MapInteractionHandler({ onStart, onEnd }) {
  useMapEvents({
    zoomstart: () => onStart && onStart('zoom'),
    zoomend:   () => onEnd && onEnd('zoom'),
    dragstart: () => onStart && onStart('drag'),
    dragend:   () => onEnd && onEnd('drag')
  });
  return null;
}

const AdminGeofenceManager = () => {
  const { user } = useAuth();
  const [geofences, setGeofences] = useState([]);
  const [faculties, setFaculties] = useState([]);
  const [selectedGeofence, setSelectedGeofence] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [mapCenter, setMapCenter] = useState([39.9334, 32.8597]); // Ankara default
  const [mapZoom, setMapZoom] = useState(13);
  const [isDragging, setIsDragging] = useState(false);
  const [isInteracting, setIsInteracting] = useState(false);
  const [history, setHistory] = useState([]);
  const [future, setFuture] = useState([]);
  const [shouldRecenter, setShouldRecenter] = useState(false);
  
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
  const [saveAndAdd, setSaveAndAdd] = useState(false);
  const [isQuickCreating, setIsQuickCreating] = useState(false);
  const [quickCreateError, setQuickCreateError] = useState('');
  const [quickCreateSuccess, setQuickCreateSuccess] = useState('');
  const [quickPickEnabled, setQuickPickEnabled] = useState(true);

  // Component mount
  useEffect(() => {
    fetchGeofences();
    fetchFaculties();
  }, []);

  // No need to require faculty selection; backend defaults to current admin

  // Geofence'leri getir
  const fetchGeofences = async () => {
    try {
      setIsLoading(true);
      const response = await apiService.get('/geofence/admin');
      
      if (response.success) {
        setGeofences(response.data);
      }
    } catch (error) {
      console.error('Geofence\'ler alınamadı:', error);
      setError('Geofence\'ler alınamadı');
    } finally {
      setIsLoading(false);
    }
  };

  // Undo/redo helpers
  const deepCloneGeofences = (list) => list.map(g => ({ ...g, center: { ...g.center } }));
  const takeSnapshot = () => ({ geofences: deepCloneGeofences(geofences), formData: JSON.parse(JSON.stringify(formData)), mapCenter: [...mapCenter] });
  const pushHistory = () => { setHistory(prev => [...prev, takeSnapshot()].slice(-50)); setFuture([]); };
  const undo = () => setHistory(prev => {
    if (prev.length === 0) return prev;
    const last = prev[prev.length - 1];
    setFuture(f => [takeSnapshot(), ...f]);
    setGeofences(deepCloneGeofences(last.geofences));
    setFormData(last.formData);
    setMapCenter(last.mapCenter);
    return prev.slice(0, -1);
  });
  const redo = () => setFuture(prev => {
    if (prev.length === 0) return prev;
    const next = prev[0];
    setHistory(h => [...h, takeSnapshot()]);
    setGeofences(deepCloneGeofences(next.geofences));
    setFormData(next.formData);
    setMapCenter(next.mapCenter);
    return prev.slice(1);
  });

  useEffect(() => {
    const onKey = (e) => {
      const isMac = navigator.platform.toUpperCase().includes('MAC');
      const ctrl = isMac ? e.metaKey : e.ctrlKey;
      if (!ctrl) return;
      const key = e.key.toLowerCase();
      if (key === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
      } else if (key === 'y' || (key === 'z' && e.shiftKey)) {
        e.preventDefault();
        redo();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [geofences, formData, mapCenter]);

  // Faculty'leri getir
  const fetchFaculties = async () => {
    try {
      const response = await apiService.get('/users/faculty');
      
      if (response.success) {
        setFaculties(response.data);
      }
    } catch (error) {
      console.error('Faculty\'ler alınamadı:', error);
    }
  };

  // Inline düzenleme başlat
  const startInlineEdit = (geofence) => {
    setSelectedGeofence(geofence);
    setFormData({
      name: geofence.name,
      description: geofence.description || '',
      facultyId: geofence.facultyId._id || geofence.facultyId,
      center: geofence.center,
      radius: geofence.radius,
      locationType: geofence.locationType,
      isActive: geofence.isActive,
      workingHours: geofence.workingHours || formData.workingHours,
      settings: geofence.settings || formData.settings
    });
    // Düzenleme başlarken haritayı yeniden merkezleme veya sayfayı kaydırma yapma
  };

  // Modal kapatma
  const closeModal = () => {
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
    pushHistory();
    const { lat, lng } = e.latlng;
    setFormData(prev => ({
      ...prev,
      center: { latitude: lat, longitude: lng }
    }));
    setMapCenter([lat, lng]);
    // Keep current zoom level when updating center by click
    if (mapRef.current) {
      const map = mapRef.current;
      try {
        const currentZoom = map._leaflet_id ? map._zoom : map.getZoom?.();
        setMapZoom(currentZoom || mapZoom);
      } catch {}
    }
  };

  // Marker pozisyon değişikliği (drag & drop)
  const handleMarkerPositionChange = (newPosition) => {
    pushHistory();
    setFormData(prev => ({
      ...prev,
      center: newPosition
    }));
    setMapCenter([newPosition.latitude, newPosition.longitude]);
    if (mapRef.current) {
      const map = mapRef.current;
      try {
        const currentZoom = map._leaflet_id ? map._zoom : map.getZoom?.();
        setMapZoom(currentZoom || mapZoom);
      } catch {}
    }
  };

  // Radius değişikliği
  const handleRadiusChange = (e) => {
    const newRadius = parseInt(e.target.value);
    pushHistory();
    setFormData(prev => ({
      ...prev,
      radius: newRadius
    }));
  };

  // Radius numeric input change
  const handleRadiusNumberChange = (e) => {
    let value = parseInt(e.target.value || '0', 10);
    if (Number.isNaN(value)) value = 10;
    if (value < 10) value = 10;
    if (value > 10000) value = 10000;
    pushHistory();
    setFormData(prev => ({ ...prev, radius: value }));
  };

  const getAreaText = (radiusMeters) => {
    const areaM2 = Math.PI * radiusMeters * radiusMeters;
    if (areaM2 >= 1000000) {
      const km2 = areaM2 / 1000000;
      return `${km2.toFixed(2)} km²`;
    }
    return `${Math.round(areaM2).toLocaleString('tr-TR')} m²`;
  };

  // Form gönderimi
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setIsLoading(true);
      setError(null);

      if (isEditing) {
        // Güncelleme: sadece değişen alanları gönder
        const updateData = {};
        if (formData.name && formData.name !== selectedGeofence.name) {
          updateData.name = formData.name;
        }
        if (
          formData.center && (
            formData.center.latitude !== selectedGeofence.center.latitude ||
            formData.center.longitude !== selectedGeofence.center.longitude
          )
        ) {
          updateData.center = formData.center;
        }
        if (formData.radius && formData.radius !== selectedGeofence.radius) {
          updateData.radius = formData.radius;
        }
        if (formData.locationType && formData.locationType !== selectedGeofence.locationType) {
          updateData.locationType = formData.locationType;
        }
        if (typeof formData.isActive === 'boolean' && formData.isActive !== selectedGeofence.isActive) {
          updateData.isActive = formData.isActive;
        }

        const response = await apiService.put(`/geofence/${selectedGeofence._id}`, updateData);
        
        if (response.success) {
          await fetchGeofences();
          closeModal();
          alert('Geofence başarıyla güncellendi');
        }
      } else {
        // Yeni oluşturma
        const response = await apiService.post('/geofence', formData);
        
        if (response.success) {
          await fetchGeofences();
          if (saveAndAdd) {
            setFormData(prev => ({
              ...prev,
              name: '',
              description: '',
              facultyId: '',
              center: { latitude: 39.9334, longitude: 32.8597 },
              radius: 100,
              locationType: 'custom',
              isActive: true
            }));
            setMapCenter([39.9334, 32.8597]);
            setSaveAndAdd(false);
            alert('Geofence oluşturuldu. Başka bir geofence ekleyebilirsiniz.');
          } else {
            closeModal();
            alert('Geofence başarıyla oluşturuldu');
          }
        }
      }
      
    } catch (error) {
      console.error('Geofence işlemi başarısız:', error);
      setError(error.response?.data?.message || 'İşlem başarısız');
    } finally {
      setIsLoading(false);
    }
  };

  // Quick create from inline form
  const handleQuickCreate = async (keepOpen = false) => {
    try {
      setIsQuickCreating(true);
      setQuickCreateError('');
      setQuickCreateSuccess('');

      const response = await apiService.post('/geofence', formData);
      if (response.success) {
        await fetchGeofences();
        if (keepOpen) {
          setQuickCreateSuccess('Geofence eklendi, bir tane daha ekleyebilirsiniz.');
          setFormData(prev => ({
            ...prev,
            name: '',
            description: '',
            center: { latitude: 39.9334, longitude: 32.8597 },
            radius: 100,
            locationType: 'custom',
            isActive: true
          }));
          setMapCenter([39.9334, 32.8597]);
        } else {
          setQuickCreateSuccess('Geofence başarıyla eklendi.');
          // Başarıyla eklendikten sonra formu boşalt
          setFormData(prev => ({
            ...prev,
            name: '',
            description: '',
            center: { latitude: 39.9334, longitude: 32.8597 },
            radius: 100,
            locationType: 'custom',
            isActive: true
          }));
          setMapCenter([39.9334, 32.8597]);
        }
        setTimeout(() => setQuickCreateSuccess(''), 2000);
      }
    } catch (error) {
      console.error('Hızlı geofence eklenemedi:', error);
      setQuickCreateError(error.response?.data?.message || error.message || 'İşlem başarısız');
    } finally {
      setIsQuickCreating(false);
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
      
      if (response.success) {
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
      
      if (response.success) {
        await fetchGeofences();
      }
    } catch (error) {
      console.error('Geofence durumu değiştirilemedi:', error);
      setError('Durum değiştirilemedi');
    }
  };

  return (
    <div className={styles['admin-geofence-manager']}>
      <div className={styles.header}>
        <div>
          <h2>🗺️ Geofence Yönetimi</h2>
          <p className={styles.subheader}>Öğrencilerin randevu alabileceği konumları yönetin. Belirli alanlarda randevu alın.</p>
        </div>
      </div>

      {error && (
        <div className={styles['error-message']}>
          <span>❌ {error}</span>
          <button onClick={() => setError(null)} className={styles['close-btn']}>✕</button>
        </div>
      )}

      <div className={styles.content}>
        <div className={styles['geofence-list']}>
          <h3>Mevcut Geofence'ler</h3>
          
          {isLoading ? (
            <div className={styles.loading}>Yükleniyor...</div>
          ) : geofences.length === 0 ? (
            <div className={styles['empty-state']}>Henüz geofence oluşturulmamış</div>
          ) : (
            <div className={styles['geofence-grid']}>
              {geofences.map(geofence => (
                <div key={geofence._id} className={styles['geofence-card']}>
                  <div className={styles['card-header']}>
                    <h4>{geofence.name}</h4>
                    <span className={`${styles.status} ${geofence.isActive ? styles.active : styles.inactive}`}>
                      {geofence.isActive ? 'Aktif' : 'Pasif'}
                    </span>
                  </div>
                  
                  <div className={styles['card-content']}>
                    <p><strong>Tip:</strong> {geofence.locationType}</p>
                    <p><strong>Yarıçap:</strong> {geofence.radius}m</p>
                    <p><strong>Merkez:</strong> {geofence.center.latitude.toFixed(6)}, {geofence.center.longitude.toFixed(6)}</p>
                  </div>
                  
                  <div className={styles['card-actions']}>
                    <button 
                      onClick={() => startInlineEdit(geofence)}
                      className={styles['edit-btn']}
                    >
                      ✏️ Düzenle
                    </button>
                    
                    <button 
                      onClick={() => toggleGeofenceStatus(geofence._id, geofence.isActive)}
                      className={`${styles['toggle-btn']} ${geofence.isActive ? styles.deactivate : styles.activate}`}
                    >
                      {geofence.isActive ? '⏸️ Pasif Yap' : '▶️ Aktif Yap'}
                    </button>
                    
                    <button 
                      onClick={() => handleDelete(geofence._id)}
                      className={styles['delete-btn']}
                    >
                      🗑️ Sil
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className={styles['map-preview']}>
          <h3>Geofence Haritası</h3>
          <div className={styles['map-container']}>
            <MapContainer 
              whenCreated={(map) => { mapRef.current = map; }}
              center={mapCenter} 
              zoom={mapZoom} 
              style={{ height: '500px', width: '100%' }}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
              
              <MapUpdater 
                center={{ lat: mapCenter[0], lng: mapCenter[1] }} 
                isInteracting={isInteracting}
                shouldRecenter={shouldRecenter}
                onDone={() => setShouldRecenter(false)}
              />
              <MapClickHandler onMapClick={handleMapClick} allowClicks={quickPickEnabled} />
              <MapInteractionHandler onStart={() => setIsInteracting(true)} onEnd={() => setIsInteracting(false)} />
              
              {/* Mevcut geofence'ler */}
              {geofences.map(geofence => (
                <div key={geofence._id}>
                  <Marker 
                    position={[geofence.center.latitude, geofence.center.longitude]}
                    title={geofence.name}
                    draggable={true}
                    eventHandlers={{
                      dragstart: () => pushHistory(),
                      dragend: (e) => {
                        const { lat, lng } = e.target.getLatLng();
                        setGeofences(prev => prev.map(g => g._id === geofence._id ? ({ ...g, center: { latitude: lat, longitude: lng } }) : g));
                        setMapCenter([lat, lng]);
                      },
                      click: () => startInlineEdit(geofence)
                    }}
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
                    eventHandlers={{ click: () => startInlineEdit(geofence) }}
                  />
                </div>
              ))}
              
              <DraggableMarker 
                position={formData.center}
                onPositionChange={handleMarkerPositionChange}
                isEditing={true}
              />
              <Circle
                center={[formData.center.latitude, formData.center.longitude]}
                radius={formData.radius}
                pathOptions={{ 
                  color: '#3b82f6', 
                  fillColor: '#3b82f6', 
                  fillOpacity: 0.3,
                  dashArray: '5, 5'
                }}
                title={`Önizleme: ${formData.radius}m yarıçap`}
              />
            </MapContainer>
          </div>

          {/* Inline quick-create form */}
          <div className={gcStyles.inlineForm}>
            <div className={gcStyles.inlineRow}>
              <div className={gcStyles.inlineCol}>
                <label>İsim *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Örn: Mühendislik Binası Girişi"
                />
              </div>
            </div>

            <div className={gcStyles.inlineRow}>
              <div className={gcStyles.inlineCol}>
                <label>Merkez (Enlem, Boylam)</label>
                <div className={gcStyles.inlineCoordRow}>
                  <input
                    type="number"
                    step="0.000001"
                    min="-90"
                    max="90"
                    value={formData.center.latitude}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      center: { ...prev.center, latitude: Number(e.target.value) }
                    }))}
                  />
                  <input
                    type="number"
                    step="0.000001"
                    min="-180"
                    max="180"
                    value={formData.center.longitude}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      center: { ...prev.center, longitude: Number(e.target.value) }
                    }))}
                  />
                </div>
                <small>Haritaya tıklayarak da merkez seçebilirsiniz.</small>
              </div>
              <div className={gcStyles.inlineCol}>
                <label>Yarıçap (m)</label>
                <div className={gcStyles.radiusInputs}>
                  <input
                    className={gcStyles.radiusNumber}
                    type="number"
                    min={10}
                    max={10000}
                    step={10}
                    value={formData.radius}
                    onChange={handleRadiusNumberChange}
                  />
                  <input
                    type="range"
                    min="10"
                    max="10000"
                    step="10"
                    value={formData.radius}
                    onChange={handleRadiusChange}
                  />
                </div>
                <small>Alan: {getAreaText(formData.radius)}</small>
              </div>
            </div>

            <div className={gcStyles.inlineActions}>
              <label className={gcStyles.quickPickToggle}>
                <input type="checkbox" checked={quickPickEnabled} onChange={(e) => setQuickPickEnabled(e.target.checked)} />
                Haritaya tıklayarak merkez seç
              </label>
              <div className={gcStyles.inlineButtons}>
                <button className="submit-btn" disabled={isQuickCreating} onClick={() => handleQuickCreate(false)}>
                  {isQuickCreating ? 'Kaydediliyor...' : (isEditing ? 'Güncelle' : 'Ekle')}
                </button>
              </div>
            </div>

            {quickCreateError && (
              <div className="error-message" style={{ marginTop: 8 }}>
                {quickCreateError}
              </div>
            )}
            {quickCreateSuccess && (
              <div className="success-message" style={{ marginTop: 8 }}>
                {quickCreateSuccess}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal */}
      {selectedGeofence !== null && (
        <div className={styles['modal-overlay']}>
          <div className={styles.modal}>
            <div className={styles['modal-header']}>
              <h3>{isEditing ? 'Geofence Düzenle' : 'Yeni Geofence'}</h3>
              <button onClick={closeModal} className={styles['close-btn']}>✕</button>
            </div>
            
            <form onSubmit={handleSubmit} className={styles['modal-form']}>
              <div className={gcStyles.inlineForm}>
                <div className={gcStyles.inlineRow}>
                  <div className={gcStyles.inlineCol}>
                    <label>İsim *</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Örn: Mühendislik Binası Girişi"
                    />
                  </div>
                </div>

                <div className={gcStyles.inlineRow}>
                  <div className={gcStyles.inlineCol}>
                    <label>Merkez (Enlem, Boylam)</label>
                    <div className={gcStyles.inlineCoordRow}>
                      <input
                        type="number"
                        step="0.000001"
                        min="-90"
                        max="90"
                        value={formData.center.latitude}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          center: { ...prev.center, latitude: Number(e.target.value) }
                        }))}
                        placeholder="Enlem"
                      />
                      <input
                        type="number"
                        step="0.000001"
                        min="-180"
                        max="180"
                        value={formData.center.longitude}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          center: { ...prev.center, longitude: Number(e.target.value) }
                        }))}
                        placeholder="Boylam"
                      />
                    </div>
                    <small>Haritaya tıklayarak da merkez seçebilirsiniz.</small>
                  </div>
                  <div className={gcStyles.inlineCol}>
                    <label>Yarıçap (m)</label>
                    <div className={gcStyles.radiusInputs}>
                      <input
                        className={gcStyles.radiusNumber}
                        type="number"
                        min={10}
                        max={10000}
                        step={10}
                        value={formData.radius}
                        onChange={handleRadiusNumberChange}
                      />
                      <input
                        type="range"
                        min="10"
                        max="10000"
                        step="10"
                        value={formData.radius}
                        onChange={handleRadiusChange}
                      />
                    </div>
                    <small>Alan: {getAreaText(formData.radius)}</small>
                  </div>
                </div>

                <div className={gcStyles.inlineActions}>
                  <label className={gcStyles.quickPickToggle}>
                    <input
                      type="checkbox"
                      checked={quickPickEnabled}
                      onChange={(e) => setQuickPickEnabled(e.target.checked)}
                    />
                    Haritaya tıklayarak merkez seç
                  </label>
                  <div className={gcStyles.inlineButtons}>
                    <button
                      type="submit"
                      className="submit-btn"
                      disabled={isLoading}
                      onClick={(e) => {
                        // Sadece name veya radius değiştiyse de kaydetmeye izin ver
                        // formData zaten güncel alanları içeriyor; merkez aynı kalabilir
                      }}
                    >
                      {isLoading ? 'Kaydediliyor...' : 'Kaydet'}
                    </button>
                    <button type="button" className={styles['delete-btn']} onClick={() => handleDelete(selectedGeofence._id)} disabled={isLoading}>
                      Sil
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminGeofenceManager;
