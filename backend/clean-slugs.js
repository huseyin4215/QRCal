import mongoose from 'mongoose';

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/qrcal')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

async function cleanSlugs() {
  try {
    // Wait for connection
    await mongoose.connection.asPromise();
    
    // Remove slug field from all student users
    const result = await mongoose.connection.db.collection('users').updateMany(
      { role: 'student' },
      { $unset: { slug: 1 } }
    );
    
    console.log(`Removed slug from ${result.modifiedCount} student users`);
    
    // Also remove slug from any user with null slug
    const result2 = await mongoose.connection.db.collection('users').updateMany(
      { slug: null },
      { $unset: { slug: 1 } }
    );
    
    console.log(`Removed slug from ${result2.modifiedCount} users with null slug`);
    
    // Drop the slug index and recreate it as sparse
    try {
      await mongoose.connection.db.collection('users').dropIndex('slug_1');
      console.log('Dropped existing slug index');
    } catch (error) {
      console.log('No existing slug index to drop');
    }
    
    // Create new sparse index
    await mongoose.connection.db.collection('users').createIndex({ slug: 1 }, { sparse: true });
    console.log('Created new sparse slug index');
    
  } catch (error) {
    console.error('Error cleaning slugs:', error);
  } finally {
    await mongoose.connection.close();
  }
}

cleanSlugs();

