import { config } from 'dotenv';

// Load environment variables FIRST, before any other imports
config({ path: './.env' });

// Debug environment variables
console.log('=== Environment Variables Debug ===');
console.log('Current working directory:', process.cwd());
console.log('GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID);
console.log('GOOGLE_CLIENT_SECRET:', process.env.GOOGLE_CLIENT_SECRET ? 'present' : 'missing');
console.log('GOOGLE_REDIRECT_URI:', process.env.GOOGLE_REDIRECT_URI);
console.log('================================');

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import mongoose from 'mongoose';

// Import routes
import authRoutes from './routes/auth.js';
import facultyRoutes from './routes/faculty.js';
import appointmentRoutes from './routes/appointments.js';
import adminRoutes from './routes/admin.js';
import qrRoutes from './routes/qr.js';
import userRoutes from './routes/users.js';
import studentRoutes from './routes/students.js';
import googleRoutes from './routes/googleAuth.js';
import geofenceRoutes from './routes/geofence.js';
import notificationRoutes from './routes/notifications.js';

// Import appointment scheduler
import appointmentScheduler from './services/appointmentScheduler.js';

// Import middleware
import { errorHandler } from './middleware/errorHandler.js';
import { authMiddleware } from './middleware/auth.js';
const app = express();
const PORT = process.env.PORT || 5000;
// Security middleware (configure for cross-origin API usage in dev)
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  crossOriginOpenerPolicy: { policy: 'same-origin-allow-popups' },
  contentSecurityPolicy: false
}));

// Rate limiting - temporarily disabled for development
// const limiter = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 minutes
//   max: 100, // limit each IP to 100 requests per windowMs
//   message: 'Too many requests from this IP, please try again later.'
// });
// app.use(limiter);

// CORS configuration for Google Sign-In compatibility
app.use(cors({
  origin: function (origin, callback) {
    const allowedOrigins = [
      'http://localhost:8081', // Ana frontend port
      'http://localhost:5173', 
      'http://localhost:8082', 
      'http://localhost:3000', 
      'http://127.0.0.1:8081',
      'http://127.0.0.1:5173',
      'http://192.168.0.103:8081',
      'http://192.168.0.103:5173',
      'http://192.168.0.103:8082',
      'http://192.168.0.103:3000',
      'https://accounts.google.com',
      'https://www.googleapis.com'
    ];
    
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'X-Requested-With', 
    'Origin', 
    'Accept', 
    'Access-Control-Request-Method', 
    'Access-Control-Request-Headers',
    'X-Client-Data',
    'Sec-Fetch-Mode',
    'Sec-Fetch-Site',
    'Sec-Fetch-Dest'
  ],
  exposedHeaders: [
    'Access-Control-Allow-Origin', 
    'Access-Control-Allow-Credentials',
    'Access-Control-Allow-Methods',
    'Access-Control-Allow-Headers'
  ]
}));

// Handle preflight OPTIONS requests for Google Sign-In
app.options('*', (req, res) => {
  const origin = req.headers.origin;
  const allowedOrigins = [
    'http://localhost:8081', // Ana frontend port
    'http://localhost:5173', 
    'http://localhost:8082', 
    'http://localhost:3000', 
    'http://127.0.0.1:8081',
    'http://127.0.0.1:5173',
    'http://192.168.0.103:8081',
    'http://192.168.0.103:5173',
    'http://192.168.0.103:8082',
    'http://192.168.0.103:3000'
  ];
  
  if (allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  }
  
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, X-Client-Data, Sec-Fetch-Mode, Sec-Fetch-Site, Sec-Fetch-Dest');
  res.sendStatus(200);
});

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/qrcal', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('✅ MongoDB connected successfully');
})
.catch((error) => {
  console.error('❌ MongoDB connection error:', error);
  process.exit(1);
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Backend is running',
    timestamp: new Date().toISOString()
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/faculty', authMiddleware, facultyRoutes);
app.use('/api/students', authMiddleware, studentRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/admin', authMiddleware, adminRoutes);
app.use('/api/qr', qrRoutes);
app.use('/api/users', userRoutes);
app.use('/api/google', googleRoutes);
app.use('/api/geofence', geofenceRoutes);
app.use('/api/notifications', notificationRoutes);

// Error handling middleware
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    message: `Cannot ${req.method} ${req.originalUrl}`
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📱 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:8081'}`);
  console.log(`🔗 API URL: http://localhost:${PORT}/api`);
  
  // Start appointment scheduler
  try {
    appointmentScheduler.start();
    console.log('📅 Otomatik randevu kontrol servisi başlatıldı');
  } catch (error) {
    console.error('❌ Otomatik randevu kontrol servisi başlatılamadı:', error);
  }
});

export default app; 