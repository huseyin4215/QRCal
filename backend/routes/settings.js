import express from 'express';
import SystemSettings from '../models/SystemSettings.js';
import AppointmentSlot from '../models/AppointmentSlot.js';
import { authMiddleware, adminMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Get all system settings (admin only)
router.get('/', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const settings = await SystemSettings.find({});

        // Convert to key-value object
        const settingsObject = {};
        settings.forEach(s => {
            settingsObject[s.key] = s.value;
        });

        res.json({
            success: true,
            data: settingsObject
        });
    } catch (error) {
        console.error('Get settings error:', error);
        res.status(500).json({
            success: false,
            message: 'Ayarlar yüklenirken hata oluştu'
        });
    }
});

// Get specific setting (public - for slot duration etc)
router.get('/:key', async (req, res) => {
    try {
        const { key } = req.params;
        const value = await SystemSettings.getSetting(key);

        res.json({
            success: true,
            data: { key, value }
        });
    } catch (error) {
        console.error('Get setting error:', error);
        res.status(500).json({
            success: false,
            message: 'Ayar yüklenirken hata oluştu'
        });
    }
});

// Update a setting (admin only)
router.put('/:key', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const { key } = req.params;
        const { value, description } = req.body;

        const setting = await SystemSettings.setSetting(
            key,
            value,
            req.user._id,
            description || ''
        );

        // If slot duration changed, delete all future available slots to regenerate
        if (key === 'slotDuration') {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            const deleteResult = await AppointmentSlot.deleteMany({
                date: { $gte: today },
                status: 'available',
                isBooked: false
            });
            
            console.log(`[SETTINGS] Slot duration changed to ${value}. Deleted ${deleteResult.deletedCount} future available slots.`);
        }

        res.json({
            success: true,
            message: 'Ayar başarıyla güncellendi',
            data: setting
        });
    } catch (error) {
        console.error('Update setting error:', error);
        res.status(500).json({
            success: false,
            message: 'Ayar güncellenirken hata oluştu'
        });
    }
});

export default router;
