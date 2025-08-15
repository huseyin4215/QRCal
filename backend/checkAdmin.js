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

// Check admin user
const checkAdmin = async () => {
  try {
    const admin = await User.findOne({ role: 'admin' });
    
    if (admin) {
      console.log('✅ Admin kullanıcısı bulundu:');
      console.log(`📧 E-posta: ${admin.email}`);
      console.log(`👤 Ad: ${admin.name}`);
      console.log(`🎯 Rol: ${admin.role}`);
      console.log(`🔑 Şifre hash'lenmiş: ${admin.password ? 'Evet' : 'Hayır'}`);
      console.log(`📅 Oluşturulma: ${admin.createdAt}`);
    } else {
      console.log('❌ Admin kullanıcısı bulunamadı!');
      
      // Create admin user
      const newAdmin = new User({
        name: 'Hüseyin Sari',
        email: 'saribugahuseyin770@gmail.com',
        password: '123456',
        department: 'Yönetim',
        role: 'admin',
        isFirstLogin: false
      });

      await newAdmin.save();
      console.log('✅ Yeni admin kullanıcısı oluşturuldu!');
      console.log(`📧 E-posta: ${newAdmin.email}`);
      console.log(`🔑 Şifre: 123456`);
    }

  } catch (error) {
    console.error('❌ Admin kontrol hatası:', error);
  }
};

// Main function
const main = async () => {
  await connectDB();
  await checkAdmin();
  
  // Close connection
  await mongoose.connection.close();
  console.log('🔌 MongoDB bağlantısı kapatıldı');
  process.exit(0);
};

// Run the script
main().catch(console.error); 