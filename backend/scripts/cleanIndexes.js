import mongoose from 'mongoose';
import { config } from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
config({ path: path.join(__dirname, '../.env') });

async function cleanDuplicateIndexes() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/qrcal');
    console.log('✅ Connected to MongoDB');

    const db = mongoose.connection.db;
    const usersCollection = db.collection('users');

    console.log('\n📋 Current indexes on users collection:');
    const indexes = await usersCollection.indexes();
    indexes.forEach(index => {
      console.log(`  - ${index.name}:`, index.key);
    });

    // List of indexes to drop (duplicate ones)
    const indexesToDrop = ['name_1'];

    console.log('\n🗑️  Dropping duplicate indexes...');
    for (const indexName of indexesToDrop) {
      try {
        await usersCollection.dropIndex(indexName);
        console.log(`  ✅ Dropped index: ${indexName}`);
      } catch (error) {
        if (error.codeName === 'IndexNotFound') {
          console.log(`  ⚠️  Index not found (already removed): ${indexName}`);
        } else {
          console.error(`  ❌ Error dropping index ${indexName}:`, error.message);
        }
      }
    }

    console.log('\n📋 Indexes after cleanup:');
    const updatedIndexes = await usersCollection.indexes();
    updatedIndexes.forEach(index => {
      console.log(`  - ${index.name}:`, index.key);
    });

    console.log('\n✅ Index cleanup completed successfully!');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error cleaning indexes:', error);
    process.exit(1);
  }
}

cleanDuplicateIndexes();

