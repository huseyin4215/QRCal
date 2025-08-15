import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { config } from 'dotenv';

// Load environment variables
config();

// Import User model
import User from './models/User.js';

const createTestUser = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/qrcal', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('✅ MongoDB connected successfully');

    // Check if test user already exists
    const existingUser = await User.findOne({ email: 'test@example.com' });
    
    if (existingUser) {
      console.log('Test user already exists:', existingUser.email);
      console.log('Password: test123');
      return;
    }

    // Create test user
    const testUser = new User({
      name: 'Test User',
      email: 'test@example.com',
      password: 'test123',
      role: 'faculty',
      department: 'Test Department',
      isFirstLogin: true,
      isActive: true
    });

    await testUser.save();
    console.log('✅ Test user created successfully');
    console.log('Email: test@example.com');
    console.log('Password: test123');
    console.log('Role: faculty');
    console.log('isFirstLogin: true');

  } catch (error) {
    console.error('❌ Error creating test user:', error);
  } finally {
    await mongoose.disconnect();
    console.log('MongoDB disconnected');
  }
};

createTestUser(); 