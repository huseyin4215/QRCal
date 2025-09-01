import mongoose from 'mongoose';
import { config } from 'dotenv';
import Geofence from './models/Geofence.js';
import User from './models/User.js';

// Load environment variables
config({ path: './.env' });

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/qrcal');
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error);
    process.exit(1);
  }
};

// Create test geofence
const createTestGeofence = async () => {
  try {
    // Find an admin user
    const adminUser = await User.findOne({ role: 'admin' });
    if (!adminUser) {
      console.log('❌ No admin user found. Please create an admin user first.');
      return;
    }

    // Find a faculty user
    const facultyUser = await User.findOne({ role: 'faculty' });
    if (!facultyUser) {
      console.log('❌ No faculty user found. Please create a faculty user first.');
      return;
    }

    // Check if geofence already exists
    const existingGeofence = await Geofence.findOne({ facultyId: facultyUser._id });
    if (existingGeofence) {
      console.log('✅ Test geofence already exists:', existingGeofence.name);
      return;
    }

    // Create test geofence (Ankara Üniversitesi Tandoğan Kampüsü)
    const testGeofence = new Geofence({
      name: 'Ankara Üniversitesi Tandoğan Kampüsü',
      description: 'Test geofence for Ankara University Tandoğan Campus',
      facultyId: facultyUser._id,
      center: {
        latitude: 39.9334, // Ankara Üniversitesi Tandoğan
        longitude: 32.8597
      },
      radius: 500, // 500 metre yarıçap
      isActive: true,
      locationType: 'university',
      address: {
        street: 'Tandoğan Meydanı',
        city: 'Ankara',
        state: 'Ankara',
        country: 'Türkiye',
        postalCode: '06100'
      },
      workingHours: {
        monday: { start: '08:00', end: '18:00', isOpen: true },
        tuesday: { start: '08:00', end: '18:00', isOpen: true },
        wednesday: { start: '08:00', end: '18:00', isOpen: true },
        thursday: { start: '08:00', end: '18:00', isOpen: true },
        friday: { start: '08:00', end: '18:00', isOpen: true },
        saturday: { start: '09:00', end: '17:00', isOpen: false },
        sunday: { start: '09:00', end: '17:00', isOpen: false }
      },
      settings: {
        requireLocationVerification: true,
        maxAccuracy: 50, // 50 metre maksimum doğruluk
        locationFreshness: 60, // 60 saniye maksimum yaş
        allowManualOverride: false,
        requireAdminApproval: false
      },
      createdBy: adminUser._id
    });

    await testGeofence.save();

    console.log('✅ Test geofence created successfully:');
    console.log('   Name:', testGeofence.name);
    console.log('   Faculty:', facultyUser.name);
    console.log('   Center:', testGeofence.center);
    console.log('   Radius:', testGeofence.radius, 'metres');
    console.log('   Area:', testGeofence.area.toFixed(2), 'km²');
    console.log('   Circumference:', testGeofence.circumference.toFixed(2), 'km');

    // Test geofence functionality
    console.log('\n🧪 Testing geofence functionality...');
    
    // Test point inside geofence
    const testPointInside = { lat: 39.9334, lng: 32.8597 };
    const isInside = testGeofence.isPointInside(testPointInside.lat, testPointInside.lng);
    console.log('   Point inside test:', isInside ? '✅ PASS' : '❌ FAIL');
    
    // Test point outside geofence
    const testPointOutside = { lat: 39.9400, lng: 32.8700 };
    const isOutside = !testGeofence.isPointInside(testPointOutside.lat, testPointOutside.lng);
    console.log('   Point outside test:', isOutside ? '✅ PASS' : '❌ FAIL');
    
    // Test distance calculation
    const distance = testGeofence.calculateDistance(testPointOutside.lat, testPointOutside.lng);
    console.log('   Distance calculation:', distance, 'metres');
    
    // Test working hours
    const isOpenNow = testGeofence.isOpenNow();
    console.log('   Is open now:', isOpenNow ? '✅ Yes' : '❌ No');

  } catch (error) {
    console.error('❌ Failed to create test geofence:', error);
  }
};

// Main function
const main = async () => {
  try {
    await connectDB();
    await createTestGeofence();
    
    console.log('\n🎉 Test geofence setup completed!');
    console.log('\n📱 You can now test the location-based appointment system:');
    console.log('   1. Open the app in a mobile browser');
    console.log('   2. Go to a faculty appointment page');
    console.log('   3. Try to create an appointment with location verification');
    console.log('   4. The system will check if you are within the geofence area');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Script failed:', error);
    process.exit(1);
  }
};

// Run the script
main();
