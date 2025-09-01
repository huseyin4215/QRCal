import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['appointment', 'system', 'reminder', 'action'],
    default: 'system'
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  message: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500
  },
  read: {
    type: Boolean,
    default: false
  },
  data: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  expiresAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
notificationSchema.index({ userId: 1, read: 1 });
notificationSchema.index({ userId: 1, createdAt: -1 });
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Instance methods
notificationSchema.methods.markAsRead = function() {
  this.read = true;
  return this.save();
};

notificationSchema.methods.isExpired = function() {
  if (!this.expiresAt) return false;
  return new Date() > this.expiresAt;
};

// Static methods
notificationSchema.statics.createAppointmentNotification = function(userId, appointmentData) {
  return this.create({
    userId,
    type: 'appointment',
    title: 'Yeni Randevu',
    message: `${appointmentData.studentName} adlı öğrenci size randevu talebinde bulundu.`,
    data: {
      appointmentId: appointmentData._id,
      studentName: appointmentData.studentName,
      date: appointmentData.date,
      time: appointmentData.startTime
    },
    priority: 'high'
  });
};

notificationSchema.statics.createSystemNotification = function(userId, title, message, data = {}) {
  return this.create({
    userId,
    type: 'system',
    title,
    message,
    data,
    priority: 'medium'
  });
};

notificationSchema.statics.createReminderNotification = function(userId, title, message, reminderTime, data = {}) {
  return this.create({
    userId,
    type: 'reminder',
    title,
    message,
    data,
    priority: 'medium',
    expiresAt: reminderTime
  });
};

// Clean up expired notifications
notificationSchema.statics.cleanupExpired = async function() {
  const result = await this.deleteMany({
    expiresAt: { $lt: new Date() }
  });
  
  console.log(`Cleaned up ${result.deletedCount} expired notifications`);
  return result;
};

// Pre-save middleware
notificationSchema.pre('save', function(next) {
  // Set default expiration for system notifications (7 days)
  if (this.type === 'system' && !this.expiresAt) {
    this.expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  }
  
  next();
});

export default mongoose.model('Notification', notificationSchema);
