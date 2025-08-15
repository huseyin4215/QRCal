import mongoose from 'mongoose';

const geofenceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  facultyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  center: {
    latitude: {
      type: Number,
      required: true,
      min: -90,
      max: 90
    },
    longitude: {
      type: Number,
      required: true,
      min: -180,
      max: 180
    }
  },
  radius: {
    type: Number,
    required: true,
    min: 10, // Minimum 10 metre
    max: 10000 // Maximum 10 km
  },
  isActive: {
    type: Boolean,
    default: true
  },
  locationType: {
    type: String,
    enum: ['university', 'faculty', 'building', 'room', 'custom'],
    default: 'custom'
  },
  address: {
    street: String,
    city: String,
    state: String,
    country: String,
    postalCode: String
  },
  workingHours: {
    monday: { start: String, end: String, isOpen: { type: Boolean, default: true } },
    tuesday: { start: String, end: String, isOpen: { type: Boolean, default: true } },
    wednesday: { start: String, end: String, isOpen: { type: Boolean, default: true } },
    thursday: { start: String, end: String, isOpen: { type: Boolean, default: true } },
    friday: { start: String, end: String, isOpen: { type: Boolean, default: true } },
    saturday: { start: String, end: String, isOpen: { type: Boolean, default: false } },
    sunday: { start: String, end: String, isOpen: { type: Boolean, default: false } }
  },
  settings: {
    requireLocationVerification: {
      type: Boolean,
      default: true
    },
    maxAccuracy: {
      type: Number,
      default: 50, // metre cinsinden
      min: 5,
      max: 200
    },
    locationFreshness: {
      type: Number,
      default: 60, // saniye cinsinden
      min: 30,
      max: 300
    },
    allowManualOverride: {
      type: Boolean,
      default: false
    },
    requireAdminApproval: {
      type: Boolean,
      default: false
    }
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Geofence merkez noktası için 2dsphere index
geofenceSchema.index({ center: '2dsphere' });

// Faculty ID için index
geofenceSchema.index({ facultyId: 1 });

// Aktif geofence'ler için compound index
geofenceSchema.index({ facultyId: 1, isActive: 1 });

// Virtual field: Geofence alanı (km²)
geofenceSchema.virtual('area').get(function() {
  const radiusKm = this.radius / 1000;
  return Math.PI * radiusKm * radiusKm;
});

// Virtual field: Geofence çevresi (km)
geofenceSchema.virtual('circumference').get(function() {
  const radiusKm = this.radius / 1000;
  return 2 * Math.PI * radiusKm;
});

// Konum kontrolü metodu
geofenceSchema.methods.isPointInside = function(latitude, longitude) {
  const R = 6371000; // Dünya yarıçapı (metre)
  
  const lat1 = this.center.latitude * Math.PI / 180;
  const lat2 = latitude * Math.PI / 180;
  const deltaLat = (latitude - this.center.latitude) * Math.PI / 180;
  const deltaLon = (longitude - this.center.longitude) * Math.PI / 180;
  
  const a = Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
            Math.cos(lat1) * Math.cos(lat2) *
            Math.sin(deltaLon / 2) * Math.sin(deltaLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return distance <= this.radius;
};

// Mesafe hesaplama metodu
geofenceSchema.methods.calculateDistance = function(latitude, longitude) {
  const R = 6371000; // Dünya yarıçapı (metre)
  
  const lat1 = this.center.latitude * Math.PI / 180;
  const lat2 = latitude * Math.PI / 180;
  const deltaLat = (latitude - this.center.latitude) * Math.PI / 180;
  const deltaLon = (longitude - this.center.longitude) * Math.PI / 180;
  
  const a = Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
            Math.cos(lat1) * Math.cos(lat2) *
            Math.sin(deltaLon / 2) * Math.sin(deltaLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return Math.round(distance);
};

// Çalışma saatlerinde açık mı kontrolü
geofenceSchema.methods.isOpenNow = function() {
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0 = Sunday, 1 = Monday, ...
  const currentTime = now.toTimeString().slice(0, 5); // HH:MM format
  
  const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const today = dayNames[dayOfWeek];
  
  const todaySchedule = this.workingHours[today];
  
  if (!todaySchedule || !todaySchedule.isOpen) {
    return false;
  }
  
  return currentTime >= todaySchedule.start && currentTime <= todaySchedule.end;
};

// JSON serialization
geofenceSchema.methods.toJSON = function() {
  const obj = this.toObject();
  obj.area = this.area;
  obj.circumference = this.circumference;
  return obj;
};

const Geofence = mongoose.model('Geofence', geofenceSchema);

export default Geofence;
