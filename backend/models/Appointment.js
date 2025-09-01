import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema({
  studentName: {
    type: String,
    required: [true, 'Öğrenci adı zorunludur'],
    trim: true,
    maxlength: [100, 'Öğrenci adı 100 karakterden uzun olamaz']
  },
  studentId: {
    type: String,
    required: [true, 'Öğrenci numarası zorunludur'],
    trim: true,
    maxlength: [20, 'Öğrenci numarası 20 karakterden uzun olamaz']
  },
  studentEmail: {
    type: String,
    required: [true, 'Öğrenci e-posta adresi zorunludur'],
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Geçerli bir e-posta adresi giriniz']
  },
  topic: {
    type: String,
    enum: [
      'Staj görüşmesi',
      'Ders destek talebi',
      'Bitirme projesi danışmanlığı',
      'Kariyer gelişimi/mentorluk',
      'Akademik danışmanlık',
      'Ders değerlendirme görüşmesi'
    ],
    required: [true, 'Görüşme konusu zorunludur']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Açıklama 500 karakterden uzun olamaz']
  },
  date: {
    type: Date,
    required: [true, 'Randevu tarihi zorunludur']
  },
  startTime: {
    type: String,
    required: [true, 'Başlangıç saati zorunludur'],
    match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Geçerli bir saat formatı giriniz (HH:MM)']
  },
  endTime: {
    type: String,
    required: [true, 'Bitiş saati zorunludur'],
    match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Geçerli bir saat formatı giriniz (HH:MM)']
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'cancelled', 'no_response'],
    default: 'pending'
  },
  facultyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Öğretim elemanı zorunludur']
  },
  facultyName: {
    type: String,
    required: [true, 'Öğretim elemanı adı zorunludur']
  },
  rejectionReason: {
    type: String,
    trim: true,
    maxlength: [200, 'Red gerekçesi 200 karakterden uzun olamaz']
  },
  googleCalendarEventId: {
    type: String,
    default: null
  },
  googleMeetLink: {
    type: String,
    default: null
  },
  // Location verification data
  location: {
    latitude: {
      type: Number,
      min: -90,
      max: 90
    },
    longitude: {
      type: Number,
      min: -180,
      max: 180
    },
    accuracy: {
      type: Number,
      min: 0,
      max: 1000
    },
    timestamp: {
      type: Number
    },
    verified: {
      type: Boolean,
      default: false
    },
    geofenceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Geofence'
    }
  },
  // Notification tracking
  studentNotified: {
    type: Boolean,
    default: false
  },
  facultyNotified: {
    type: Boolean,
    default: false
  },
  // Additional metadata
  ipAddress: {
    type: String,
    default: null
  },
  userAgent: {
    type: String,
    default: null
  },
  // Cancellation tracking
  cancelledBy: {
    type: String,
    enum: ['student', 'faculty', 'system'],
    default: null
  },
  cancelledAt: {
    type: Date,
    default: null
  },
  cancellationReason: {
    type: String,
    trim: true,
    maxlength: [200, 'İptal gerekçesi 200 karakterden uzun olamaz']
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for formatted date
appointmentSchema.virtual('formattedDate').get(function() {
  return this.date.toLocaleDateString('tr-TR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
});

// Virtual for time range
appointmentSchema.virtual('timeRange').get(function() {
  return `${this.startTime} - ${this.endTime}`;
});

// Virtual for status in Turkish
appointmentSchema.virtual('statusTR').get(function() {
  const statusMap = {
    pending: 'Beklemede',
    approved: 'Onaylandı',
    rejected: 'Reddedildi',
    cancelled: 'İptal Edildi',
    no_response: 'Öğretim Üyesi Cevaplamadı'
  };
  return statusMap[this.status] || this.status;
});

// Virtual for topic in Turkish
appointmentSchema.virtual('topicTR').get(function() {
  return this.topic; // Already in Turkish
});

// Indexes
appointmentSchema.index({ facultyId: 1, date: 1 });
appointmentSchema.index({ status: 1 });
appointmentSchema.index({ studentEmail: 1 });
appointmentSchema.index({ createdAt: -1 });
appointmentSchema.index({ date: 1, startTime: 1, endTime: 1 });

// Pre-save middleware
appointmentSchema.pre('save', function(next) {
  // Auto-generate faculty name if not provided
  if (!this.facultyName && this.facultyId) {
    // This will be populated when querying
  }
  
  next();
});

// Instance methods
appointmentSchema.methods.isOverlapping = async function() {
  const Appointment = this.constructor;
  const overlapping = await Appointment.findOne({
    facultyId: this.facultyId,
    date: this.date,
    status: { $in: ['pending', 'approved'] },
    _id: { $ne: this._id },
    $or: [
      {
        startTime: { $lt: this.endTime },
        endTime: { $gt: this.startTime }
      }
    ]
  });
  
  return overlapping !== null;
};

appointmentSchema.methods.canBeCancelled = function() {
  const now = new Date();
  const appointmentDate = new Date(this.date);
  const timeDiff = appointmentDate - now;
  const hoursDiff = timeDiff / (1000 * 60 * 60);
  
  // Can be cancelled if more than 2 hours before appointment
  return hoursDiff > 2;
};

appointmentSchema.methods.toPublicJSON = function() {
  const appointment = this.toObject();
  delete appointment.ipAddress;
  delete appointment.userAgent;
  return appointment;
};

// Static methods
appointmentSchema.statics.findByFaculty = function(facultyId, options = {}) {
  const query = { facultyId };
  
  if (options.status) {
    query.status = options.status;
  }
  
  if (options.date) {
    query.date = {
      $gte: new Date(options.date),
      $lt: new Date(new Date(options.date).setDate(new Date(options.date).getDate() + 1))
    };
  }
  
  return this.find(query)
    .sort({ date: 1, startTime: 1 })
    .populate('facultyId', 'name title department');
};

appointmentSchema.statics.findByStudent = function(studentEmail) {
  return this.find({ studentEmail })
    .sort({ createdAt: -1 })
    .populate('facultyId', 'name title department');
};

appointmentSchema.statics.getStats = async function(facultyId, startDate, endDate) {
  const stats = await this.aggregate([
    {
      $match: {
        facultyId: new mongoose.Types.ObjectId(facultyId),
        date: { $gte: new Date(startDate), $lte: new Date(endDate) }
      }
    },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);
  
  const result = {
    pending: 0,
    approved: 0,
    rejected: 0,
    cancelled: 0,
    total: 0
  };
  
  stats.forEach(stat => {
    result[stat._id] = stat.count;
    result.total += stat.count;
  });
  
  return result;
};

export default mongoose.model('Appointment', appointmentSchema); 