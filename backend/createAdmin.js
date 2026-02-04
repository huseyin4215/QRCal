import mongoose from 'mongoose';
import { config } from 'dotenv';
import readline from 'readline';
import User from './models/User.js';

// Load environment variables
config();

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Promisify readline question
const question = (query) => new Promise((resolve) => rl.question(query, resolve));

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/qrcal');
    console.log('✅ MongoDB bağlantısı başarılı\n');
  } catch (error) {
    console.error('❌ MongoDB bağlantı hatası:', error);
    process.exit(1);
  }
};

// Validate email format
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Validate password strength
const isValidPassword = (password) => {
  return password.length >= 6;
};

// Create admin user
const createAdmin = async () => {
  try {
    console.log('═══════════════════════════════════════════');
    console.log('   🔐 ADMİN KULLANICI OLUŞTURMA ARAÇ   ');
    console.log('═══════════════════════════════════════════\n');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ role: 'admin' });

    if (existingAdmin) {
      console.log('⚠️  Admin kullanıcısı zaten mevcut!');
      console.log(`📧 E-posta: ${existingAdmin.email}`);
      console.log(`👤 Ad: ${existingAdmin.name}\n`);

      const overwrite = await question('❓ Mevcut admin kullanıcısını silip yeni bir tane oluşturmak ister misiniz? (evet/hayır): ');

      if (overwrite.toLowerCase() !== 'evet' && overwrite.toLowerCase() !== 'e') {
        console.log('✅ İşlem iptal edildi.');
        return;
      }

      await User.deleteOne({ _id: existingAdmin._id });
      console.log('🗑️  Mevcut admin kullanıcısı silindi.\n');
    }

    // Get admin details from user
    let name, email, password, department;

    // Name input
    while (!name || name.trim().length < 2) {
      name = await question('👤 Admin kullanıcı adı (min. 2 karakter): ');
      if (!name || name.trim().length < 2) {
        console.log('❌ İsim en az 2 karakter olmalıdır!\n');
      }
    }

    // Email input
    while (!email || !isValidEmail(email)) {
      email = await question('📧 Admin e-posta adresi: ');
      if (!isValidEmail(email)) {
        console.log('❌ Geçerli bir e-posta adresi giriniz!\n');
      }
    }

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log('❌ Bu e-posta adresi zaten kullanılıyor!');
      return;
    }

    // Password input
    while (!password || !isValidPassword(password)) {
      password = await question('🔑 Admin şifresi (min. 6 karakter): ');
      if (!isValidPassword(password)) {
        console.log('❌ Şifre en az 6 karakter olmalıdır!\n');
      }
    }

    // Department input
    department = await question('🏢 Departman (isteğe bağlı, varsayılan: Yönetim): ');
    if (!department || department.trim().length === 0) {
      department = 'Yönetim';
    }

    // Create slug from name
    const slug = name.toLowerCase()
      .replace(/ğ/g, 'g')
      .replace(/ü/g, 'u')
      .replace(/ş/g, 's')
      .replace(/ı/g, 'i')
      .replace(/ö/g, 'o')
      .replace(/ç/g, 'c')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    // Create admin user
    const admin = new User({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password: password,
      department: department.trim(),
      role: 'admin',
      slug: slug,
      isFirstLogin: false
    });

    await admin.save();

    console.log('\n═══════════════════════════════════════════');
    console.log('   ✅ Admin kullanıcısı başarıyla oluşturuldu!   ');
    console.log('═══════════════════════════════════════════');
    console.log(`📧 E-posta: ${admin.email}`);
    console.log(`👤 Ad: ${admin.name}`);
    console.log(`🏢 Departman: ${admin.department}`);
    console.log(`🎯 Rol: ${admin.role}`);
    console.log(`🔗 Slug: ${admin.slug}`);
    console.log('═══════════════════════════════════════════\n');

  } catch (error) {
    console.error('❌ Admin oluşturma hatası:', error.message);
  }
};

// Main function
const main = async () => {
  await connectDB();
  await createAdmin();

  // Close readline and connection
  rl.close();
  await mongoose.connection.close();
  console.log('🔌 MongoDB bağlantısı kapatıldı');
  process.exit(0);
};

// Run the script
main().catch((error) => {
  console.error(error);
  rl.close();
  process.exit(1);
}); 