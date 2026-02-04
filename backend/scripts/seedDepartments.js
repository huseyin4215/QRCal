// Seed default departments into database
import mongoose from 'mongoose';
import Department from '../models/Department.js';
import { config } from 'dotenv';

config({ path: './.env' });

const defaultDepartments = [
    'Yapay Zeka ve Veri Mühendisliği',
    'Yazılım Mühendisliği',
    'Bilgisayar Mühendisliği',
    'Elektrik Elektronik Mühendisliği',
    'Enerji Mühendisliği',
    'BiyoMedikal Mühendisliği',
    'Gıda Mühendisliği',
    'Fizik Mühendisliği'
];

async function seedDepartments() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/qrcal');
        console.log('Connected to MongoDB');

        for (const name of defaultDepartments) {
            const existing = await Department.findOne({ name });
            if (!existing) {
                await Department.create({ name });
                console.log(`✅ Added department: ${name}`);
            } else {
                console.log(`⏭️ Department exists: ${name}`);
            }
        }

        console.log('\n✅ Department seeding complete!');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding departments:', error);
        process.exit(1);
    }
}

seedDepartments();
