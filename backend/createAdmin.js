import mongoose from 'mongoose';
import { config } from 'dotenv';
import User from './models/User.js';

// Load environment variables
config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/qrcal');
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// Create admin user
const createAdmin = async () => {
  try {
    // Check if admin already exists
    const existingAdmin = await User.findOne({ role: 'admin' });
    
    if (existingAdmin) {
      console.log('⚠️  Admin kullanıcısı zaten mevcut!');
      console.log(`📧 E-posta: ${existingAdmin.email}`);
      console.log(`👤 Ad: ${existingAdmin.name}`);
      return;
    }

    // Create admin user
    const admin = new User({
      name: 'Admin User',
      email: 'admin@example.com',
      password: '123456',
      department: 'Yönetim',
      role: 'admin',
      isFirstLogin: false
    });

    await admin.save();

    console.log('✅ Admin kullanıcısı başarıyla oluşturuldu!');
    console.log(`📧 E-posta: ${admin.email}`);
    console.log(`🔑 Şifre: 123456`);
    console.log(`👤 Ad: ${admin.name}`);
    console.log(`🎯 Rol: ${admin.role}`);

  } catch (error) {
    console.error('❌ Admin oluşturma hatası:', error);
  }
};

// Main function
const main = async () => {
  await connectDB();
  await createAdmin();
  
  // Close connection
  await mongoose.connection.close();
  console.log('🔌 MongoDB bağlantısı kapatıldı');
  process.exit(0);
};

// Run the script
main().catch(console.error); 