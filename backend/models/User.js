import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'İsim zorunludur'],
    trim: true,
    maxlength: [100, 'İsim 100 karakterden uzun olamaz']
  },
  email: {
    type: String,
    required: [true, 'E-posta zorunludur'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Geçerli bir e-posta adresi giriniz']
  },
  password: {
    type: String,
    required: function () {
      // Şifre sadece öğrenci ve admin için zorunlu
      return this.role === 'student' || this.role === 'admin';
    },
    minlength: [6, 'Şifre en az 6 karakter olmalıdır']
  },
  studentNumber: {
    type: String,
    required: function () {
      return this.role === 'student';
    },
    unique: true,
    sparse: true,
    trim: true
  },
  role: {
    type: String,
    enum: ['student', 'faculty', 'admin'],
    default: 'student'
  },
  slug: {
    type: String,
    unique: true,
    sparse: true,
    required: function () {
      return this.role === 'faculty' || this.role === 'admin';
    }
  },
  picture: {
    type: String,
    default: null
  },
  googleId: {
    type: String,
    unique: true,
    sparse: true
  },
  googleAccessToken: {
    type: String,
    default: null
  },
  googleRefreshToken: {
    type: String,
    default: null
  },
  googleTokenExpiry: {
    type: Date,
    default: null
  },
  calendarId: {
    type: String,
    default: 'primary'
  },
  qrCodeUrl: {
    type: String,
    default: null
  },
  department: {
    type: String,
    required: [true, 'Bölüm zorunludur'],
    trim: true
  },
  title: {
    type: String,
    default: 'Öğretim Elemanı',
    trim: true
  },
  office: {
    type: String,
    trim: true
  },
  phone: {
    type: String,
    trim: true
  },
  website: {
    type: String,
    trim: true
  },
  // Faculty specific fields
  availability: [{
    day: {
      type: String,
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    },
    isActive: {
      type: Boolean,
      default: false
    },
    timeSlots: [{
      start: {
        type: String,
        required: true,
        match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Geçerli bir saat formatı giriniz (HH:MM)']
      },
      end: {
        type: String,
        required: true,
        match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Geçerli bir saat formatı giriniz (HH:MM)']
      },
      isAvailable: {
        type: Boolean,
        default: true
      }
    }]
  }],
  slotDuration: {
    type: Number,
    default: 15,
    min: [15, 'Slot süresi minimum 15 dakika olmalıdır']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date,
    default: null
  },
  isFirstLogin: {
    type: Boolean,
    default: true
  },
  passwordResetToken: {
    type: String,
    default: null
  },
  passwordResetExpires: {
    type: Date,
    default: null
  },
  preferences: {
    theme: {
      type: String,
      enum: ['light', 'dark'],
      default: 'light'
    },
    language: {
      type: String,
      enum: ['tr', 'en'],
      default: 'tr'
    },
    notifications: {
      email: {
        type: Boolean,
        default: true
      },
      push: {
        type: Boolean,
        default: true
      }
    }
  },
  // Student-specific: Academic advisor assignment
  advisor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false,
    default: null,
    validate: {
      validator: async function (v) {
        // Only validate if advisor is set
        if (!v) return true;

        // Only students can have advisors
        if (this.role !== 'student') return false;

        // Advisor must be a faculty member
        const advisor = await mongoose.model('User').findById(v);
        return advisor && advisor.role === 'faculty';
      },
      message: 'Danışman bir öğretim üyesi olmalıdır'
    }
  },
  // Email verification for email changes
  emailVerificationCode: {
    type: String,
    default: null
  },
  emailVerificationExpiry: {
    type: Date,
    default: null
  },
  pendingEmail: {
    type: String,
    default: null
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for full name
userSchema.virtual('fullName').get(function () {
  return `${this.title} ${this.name}`;
});

// Virtual for appointment URL
userSchema.virtual('appointmentUrl').get(function () {
  return `${process.env.FRONTEND_URL}/appointment/${this.slug}`;
});

// Indexes
// Note: email, googleId, slug, and studentNumber already have unique indexes defined in schema fields
// Only add indexes for fields that don't have unique: true
userSchema.index({ role: 1 });
userSchema.index({ department: 1 });
// Note: name index removed to avoid duplicate index warning

// Pre-save middleware
userSchema.pre('save', async function (next) {
  // Generate slug if not exists (only for faculty and admin)
  if ((this.role === 'faculty' || this.role === 'admin') && (!this.slug || this.isModified('name'))) {
    try {
      this.slug = await this.generateUniqueSlug();
    } catch (error) {
      console.error('Error generating slug:', error);
    }
  }

  // Hash password if modified
  if (this.isModified('password') && this.password) {
    this.password = await bcrypt.hash(this.password, 12);
  }

  next();
});

// Instance methods
userSchema.methods.generateSlug = function () {
  const transliterate = (input) => {
    // Normalize and map Turkish characters to ASCII equivalents
    const map = {
      'ç': 'c', 'ğ': 'g', 'ı': 'i', 'ö': 'o', 'ş': 's', 'ü': 'u',
      'Ç': 'c', 'Ğ': 'g', 'İ': 'i', 'I': 'i', 'Ö': 'o', 'Ş': 's', 'Ü': 'u'
    };
    return (input || '')
      .replace(/[çğıöşüÇĞİIÖŞÜ]/g, ch => map[ch] || ch)
      .normalize('NFD').replace(/\p{Diacritic}+/gu, '');
  };

  const asciiName = transliterate(this.name || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');

  return asciiName || `user-${this._id?.toString().slice(-6)}`;
};

userSchema.methods.generateUniqueSlug = async function () {
  let baseSlug = this.generateSlug();
  let slug = baseSlug;
  let counter = 1;

  // Check if slug already exists and generate a unique one
  while (await this.constructor.findOne({ slug, _id: { $ne: this._id } })) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  return slug;
};

userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.toPublicJSON = function () {
  const user = this.toObject();
  delete user.password;
  delete user.googleId;
  delete user.calendarId;
  return user;
};

// Static methods
userSchema.statics.findBySlug = function (slug) {
  return this.findOne({ slug, isActive: true });
};

userSchema.statics.findByEmail = function (email) {
  return this.findOne({ email: email.toLowerCase() });
};

userSchema.statics.findByGoogleId = function (googleId) {
  return this.findOne({ googleId });
};

userSchema.statics.findByStudentNumber = function (studentNumber) {
  return this.findOne({ studentNumber });
};

export default mongoose.model('User', userSchema); 