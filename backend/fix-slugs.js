import mongoose from 'mongoose';
import User from './models/User.js';

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/qrcal')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

async function fixSlugs() {
  try {
    // Find all users with null slugs
    const usersWithNullSlugs = await User.find({ slug: null });
    console.log(`Found ${usersWithNullSlugs.length} users with null slugs`);
    
    for (const user of usersWithNullSlugs) {
      console.log(`Processing user: ${user.name} (${user.role})`);
      
      if (user.role === 'student') {
        // For students, just remove the slug field
        await User.updateOne(
          { _id: user._id },
          { $unset: { slug: 1 } }
        );
        console.log(`Removed slug for student: ${user.name}`);
      } else if (user.role === 'faculty' || user.role === 'admin') {
        // For faculty/admin, generate a slug
        const slug = await user.generateUniqueSlug();
        await User.updateOne(
          { _id: user._id },
          { slug }
        );
        console.log(`Generated slug for ${user.role}: ${user.name} -> ${slug}`);
      }
    }
    
    console.log('Slug fix completed');
  } catch (error) {
    console.error('Error fixing slugs:', error);
  } finally {
    mongoose.connection.close();
  }
}

fixSlugs();
