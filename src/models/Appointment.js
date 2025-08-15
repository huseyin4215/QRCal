// Appointment Model - MongoDB Schema
import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema({
  studentName: {
    type: String,
    required: true,
    trim: true
  },
  studentId: {
    type: String,
    required: true,
    trim: true
  },
  studentEmail: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
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
    required: true
  },
  description: {
    type: String,
    trim: true,
    maxlength: 500
  },
  date: {
    type: Date,
    required: true
  },
  startTime: {
    type: String,
    required: true
  },
  endTime: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'cancelled'],
    default: 'pending'
  },
  facultyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  facultyName: {
    type: String,
    required: true
  },
  rejectionReason: {
    type: String,
    trim: true
  },
  googleCalendarEventId: {
    type: String
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
appointmentSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Index for efficient queries
appointmentSchema.index({ facultyId: 1, date: 1 });
appointmentSchema.index({ status: 1 });
appointmentSchema.index({ studentEmail: 1 });

export default mongoose.model('Appointment', appointmentSchema); 