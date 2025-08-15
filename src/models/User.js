// User Model - MongoDB Schema
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  role: {
    type: String,
    enum: ['faculty', 'student', 'admin'],
    default: 'faculty'
  },
  slug: {
    type: String,
    unique: true,
    required: true
  },
  picture: {
    type: String
  },
  googleId: {
    type: String,
    unique: true
  },
  calendarId: {
    type: String // Google Calendar ID
  },
  qrCodeUrl: {
    type: String
  },
  department: {
    type: String,
    required: true
  },
  title: {
    type: String,
    default: 'Öğretim Elemanı'
  },
  office: {
    type: String
  },
  phone: {
    type: String
  },
  website: {
    type: String
  },
  // Faculty specific fields
  availability: [{
    day: {
      type: String,
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    },
    startTime: {
      type: String,
      required: true
    },
    endTime: {
      type: String,
      required: true
    },
    isActive: {
      type: Boolean,
      default: true
    }
  }],
  slotDuration: {
    type: Number,
    default: 15, // minutes
    min: 10,
    max: 20
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update timestamp on save
userSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Generate slug from name
userSchema.pre('save', function(next) {
  if (this.isModified('name') && !this.slug) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }
  next();
});

export default mongoose.model('User', userSchema); 