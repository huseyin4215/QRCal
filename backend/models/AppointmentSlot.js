import mongoose from 'mongoose';

const appointmentSlotSchema = new mongoose.Schema({
  facultyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Öğretim elemanı zorunludur']
  },
  date: {
    type: Date,
    required: [true, 'Tarih zorunludur']
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
  isAvailable: {
    type: Boolean,
    default: true
  },
  isBooked: {
    type: Boolean,
    default: false
  },
  appointmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment',
    default: null
  },
  // Slot metadata
  slotType: {
    type: String,
    enum: ['regular', 'emergency', 'makeup'],
    default: 'regular'
  },
  maxDuration: {
    type: Number,
    default: 60, // minutes
    min: 15,
    max: 240
  },
  // Booking restrictions
  requiresApproval: {
    type: Boolean,
    default: false
  },
  allowedTopics: [{
    type: String,
    enum: [
      'Staj görüşmesi',
      'Ders destek talebi',
      'Bitirme projesi danışmanlığı',
      'Kariyer gelişimi/mentorluk',
      'Akademik danışmanlık',
      'Ders değerlendirme görüşmesi'
    ]
  }],
  // Slot status tracking
  status: {
    type: String,
    enum: ['available', 'booked', 'cancelled', 'blocked'],
    default: 'available'
  },
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for formatted time range
appointmentSlotSchema.virtual('timeRange').get(function() {
  return `${this.startTime} - ${this.endTime}`;
});

// Virtual for duration in minutes
appointmentSlotSchema.virtual('duration').get(function() {
  const start = new Date(`2000-01-01T${this.startTime}`);
  const end = new Date(`2000-01-01T${this.endTime}`);
  return Math.round((end - start) / (1000 * 60));
});

// Indexes for efficient queries
appointmentSlotSchema.index({ facultyId: 1, date: 1 });
appointmentSlotSchema.index({ facultyId: 1, date: 1, startTime: 1 });
appointmentSlotSchema.index({ status: 1 });
appointmentSlotSchema.index({ isAvailable: 1 });
appointmentSlotSchema.index({ isBooked: 1 });

// Pre-save middleware to update timestamp
appointmentSlotSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Instance methods
appointmentSlotSchema.methods.isOverlapping = async function() {
  const AppointmentSlot = this.constructor;
  const overlapping = await AppointmentSlot.findOne({
    facultyId: this.facultyId,
    date: this.date,
    _id: { $ne: this._id },
    status: { $in: ['available', 'booked'] },
    $or: [
      {
        startTime: { $lt: this.endTime },
        endTime: { $gt: this.startTime }
      }
    ]
  });
  
  return overlapping !== null;
};

appointmentSlotSchema.methods.canBeBooked = function() {
  return this.isAvailable && !this.isBooked && this.status === 'available';
};

appointmentSlotSchema.methods.book = async function(appointmentId) {
  this.isBooked = true;
  this.isAvailable = false;
  this.status = 'booked';
  this.appointmentId = appointmentId;
  return await this.save();
};

appointmentSlotSchema.methods.unbook = async function() {
  this.isBooked = false;
  this.isAvailable = true;
  this.status = 'available';
  this.appointmentId = null;
  return await this.save();
};

// Static methods
appointmentSlotSchema.statics.findByFaculty = function(facultyId, options = {}) {
  const query = { facultyId };
  
  if (options.date) {
    const startDate = new Date(options.date);
    const endDate = new Date(options.date);
    endDate.setDate(endDate.getDate() + 1);
    query.date = { $gte: startDate, $lt: endDate };
  }
  
  if (options.status) {
    query.status = options.status;
  }
  
  if (options.isAvailable !== undefined) {
    query.isAvailable = options.isAvailable;
  }
  
  return this.find(query)
    .sort({ date: 1, startTime: 1 })
    .populate('appointmentId', 'studentName studentId topic status');
};

appointmentSlotSchema.statics.generateSlotsForDate = async function(facultyId, date, availability) {
  const slots = [];
  const targetDate = new Date(date);
  const dayName = targetDate.toLocaleDateString('en-US', { weekday: 'long' });
  
  const dayAvailability = availability.find(a => a.day === dayName && a.isActive);
  
  if (!dayAvailability || !dayAvailability.timeSlots) {
    return slots;
  }
  
  for (const timeSlot of dayAvailability.timeSlots) {
    if (!timeSlot.isAvailable) continue;
    
    const startTime = new Date(`2000-01-01T${timeSlot.start}`);
    const endTime = new Date(`2000-01-01T${timeSlot.end}`);
    const slotDuration = dayAvailability.slotDuration || 15;
    
    while (startTime < endTime) {
      const slotStart = startTime.toTimeString().slice(0, 5);
      startTime.setMinutes(startTime.getMinutes() + slotDuration);
      const slotEnd = startTime.toTimeString().slice(0, 5);
      
      if (slotEnd > timeSlot.end) break;
      
      // Check if slot already exists
      const existingSlot = await this.findOne({
        facultyId,
        date: targetDate,
        startTime: slotStart,
        endTime: slotEnd
      });
      
      if (!existingSlot) {
        slots.push({
          facultyId,
          date: targetDate,
          startTime: slotStart,
          endTime: slotEnd,
          isAvailable: true,
          isBooked: false,
          status: 'available'
        });
      }
    }
  }
  
  return slots;
};

export default mongoose.model('AppointmentSlot', appointmentSlotSchema); 