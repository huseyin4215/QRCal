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
    min: 10,
    max: 10000
  },
  locationType: {
    type: String,
    enum: ['university', 'faculty', 'building', 'room', 'custom'],
    default: 'custom'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  workingHours: {
    monday: {
      start: { type: String, default: '09:00' },
      end: { type: String, default: '17:00' },
      isOpen: { type: Boolean, default: true }
    },
    tuesday: {
      start: { type: String, default: '09:00' },
      end: { type: String, default: '17:00' },
      isOpen: { type: Boolean, default: true }
    },
    wednesday: {
      start: { type: String, default: '09:00' },
      end: { type: String, default: '17:00' },
      isOpen: { type: Boolean, default: true }
    },
    thursday: {
      start: { type: String, default: '09:00' },
      end: { type: String, default: '17:00' },
      isOpen: { type: Boolean, default: true }
    },
    friday: {
      start: { type: String, default: '09:00' },
      end: { type: String, default: '17:00' },
      isOpen: { type: Boolean, default: true }
    },
    saturday: {
      start: { type: String, default: '09:00' },
      end: { type: String, default: '13:00' },
      isOpen: { type: Boolean, default: false }
    },
    sunday: {
      start: { type: String, default: '09:00' },
      end: { type: String, default: '13:00' },
      isOpen: { type: Boolean, default: false }
    }
  },
  settings: {
    requireLocationVerification: { type: Boolean, default: true },
    maxAccuracy: { type: Number, default: 50, min: 1, max: 1000 },
    locationFreshness: { type: Number, default: 60, min: 10, max: 3600 },
    allowManualOverride: { type: Boolean, default: false },
    requireAdminApproval: { type: Boolean, default: false }
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

// Basic indexes
geofenceSchema.index({ facultyId: 1 });
geofenceSchema.index({ isActive: 1 });
geofenceSchema.index({ center: '2dsphere' }); // Geospatial index for location queries

// Calculate distance between two points using Haversine formula
geofenceSchema.methods.calculateDistance = function(latitude, longitude) {
  const R = 6371000; // Earth radius in meters
  
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

// Simple point inside check
geofenceSchema.methods.isPointInside = function(latitude, longitude) {
  const distance = this.calculateDistance(latitude, longitude);
  return distance <= this.radius;
};

// Check if geofence is currently open based on working hours
geofenceSchema.methods.isOpenNow = function() {
  const now = new Date();
  const dayOfWeek = now.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
  const currentTime = now.toTimeString().slice(0, 5); // HH:MM format
  
  const todayHours = this.workingHours[dayOfWeek];
  
  if (!todayHours || !todayHours.isOpen) {
    return false;
  }
  
  return currentTime >= todayHours.start && currentTime <= todayHours.end;
};

// Get current working hours for a specific day
geofenceSchema.methods.getWorkingHoursForDay = function(dayOfWeek) {
  const day = dayOfWeek.toLowerCase();
  return this.workingHours[day] || null;
};

// Check if a specific time is within working hours
geofenceSchema.methods.isTimeWithinWorkingHours = function(dayOfWeek, time) {
  const dayHours = this.getWorkingHoursForDay(dayOfWeek);
  if (!dayHours || !dayHours.isOpen) {
    return false;
  }
  
  return time >= dayHours.start && time <= dayHours.end;
};

export default mongoose.model('Geofence', geofenceSchema);
