// Seed default slot duration setting
import mongoose from 'mongoose';
import SystemSettings from '../models/SystemSettings.js';
import { config } from 'dotenv';

config({ path: './.env' });

async function seedSlotDuration() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/qrcal');
        console.log('Connected to MongoDB');

        const existing = await SystemSettings.findOne({ key: 'slotDuration' });
        if (!existing) {
            await SystemSettings.create({
                key: 'slotDuration',
                value: 15,
                description: 'Default appointment slot duration in minutes'
            });
            console.log('✅ Default slot duration set to 15 minutes');
        } else {
            console.log('⏭️ Slot duration already exists:', existing.value, 'minutes');
        }

        console.log('\n✅ Slot duration seeding complete!');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding slot duration:', error);
        process.exit(1);
    }
}

seedSlotDuration();
