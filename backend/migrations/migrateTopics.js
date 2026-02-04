import mongoose from 'mongoose';
import Topic from '../models/Topic.js';

/**
 * Migration script to populate the Topic collection with default topics
 * This should run once when the server starts if the Topic collection is empty
 */
const defaultTopics = [
    { name: 'Staj görüşmesi', isAdvisorOnly: false, order: 1 },
    { name: 'Ders destek talebi', isAdvisorOnly: false, order: 2 },
    { name: 'Bitirme projesi danışmanlığı', isAdvisorOnly: true, order: 3 },
    { name: 'Kariyer gelişimi/mentorluk', isAdvisorOnly: false, order: 4 },
    { name: 'Akademik danışmanlık', isAdvisorOnly: true, order: 5 },
    { name: 'Ders değerlendirme görüşmesi', isAdvisorOnly: false, order: 6 }
];

export const migrateTopics = async () => {
    try {
        console.log('🔄 Syncing default topics to database...');

        // Upsert each default topic
        for (const topicData of defaultTopics) {
            await Topic.findOneAndUpdate(
                { name: topicData.name },
                topicData,
                { upsert: true, new: true }
            );
        }

        const totalTopics = await Topic.countDocuments();
        console.log(`✅ Topics synced successfully (${totalTopics} total topics)`);

    } catch (error) {
        console.error('❌ Error migrating topics:', error);
        throw error;
    }
};

export default migrateTopics;
