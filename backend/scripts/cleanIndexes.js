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
    const topicsCollection = db.collection('topics');

    // Check users collection
    console.log('\n📋 Current indexes on users collection:');
    const usersIndexes = await usersCollection.indexes();
    usersIndexes.forEach(index => {
      console.log(`  - ${index.name}:`, index.key);
    });

    // Check topics collection
    console.log('\n📋 Current indexes on topics collection:');
    const topicsIndexes = await topicsCollection.indexes();
    topicsIndexes.forEach(index => {
      console.log(`  - ${index.name}:`, index.key);
    });

    // List of indexes to drop from users collection
    const usersIndexesToDrop = ['name_1'];

    console.log('\n🗑️  Dropping duplicate indexes from users collection...');
    for (const indexName of usersIndexesToDrop) {
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

    // Check if topics has duplicate name index (name_1 exists alongside unique name index)
    const hasNameIndex = topicsIndexes.some(idx => idx.name === 'name_1' && !idx.unique);
    if (hasNameIndex) {
      console.log('\n🗑️  Dropping non-unique name index from topics collection...');
      try {
        await topicsCollection.dropIndex('name_1');
        console.log(`  ✅ Dropped index: name_1`);
      } catch (error) {
        if (error.codeName === 'IndexNotFound') {
          console.log(`  ⚠️  Index not found: name_1`);
        } else {
          console.error(`  ❌ Error dropping index name_1:`, error.message);
        }
      }
    } else {
      console.log('\n✅ Topics collection already has correct indexes (unique name index only)');
    }

    // Show final state
    console.log('\n📋 Indexes after cleanup:');
    console.log('\nUsers collection:');
    const updatedUsersIndexes = await usersCollection.indexes();
    updatedUsersIndexes.forEach(index => {
      console.log(`  - ${index.name}:`, index.key);
    });

    console.log('\nTopics collection:');
    const updatedTopicsIndexes = await topicsCollection.indexes();
    updatedTopicsIndexes.forEach(index => {
      console.log(`  - ${index.name}:`, index.key, index.unique ? '(unique)' : '');
    });

    console.log('\n✅ Index cleanup completed successfully!');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error cleaning indexes:', error);
    process.exit(1);
  }
}

cleanDuplicateIndexes();

