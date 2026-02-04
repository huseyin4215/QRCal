import express from 'express';
import Department from '../models/Department.js';
import { authMiddleware, adminMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Get all departments (public - for registration and forms)
router.get('/', async (req, res) => {
    try {
        const departments = await Department.find({ isActive: true }).sort({ name: 1 });
        res.json({
            success: true,
            data: departments
        });
    } catch (error) {
        console.error('Get departments error:', error);
        res.status(500).json({
            success: false,
            message: 'Bölümler yüklenirken hata oluştu'
        });
    }
});

// Add new department (admin only)
router.post('/', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const { name } = req.body;

        if (!name || !name.trim()) {
            return res.status(400).json({
                success: false,
                message: 'Bölüm adı gereklidir'
            });
        }

        // Check if department already exists
        const existingDepartment = await Department.findOne({
            name: { $regex: new RegExp(`^${name.trim()}$`, 'i') }
        });

        if (existingDepartment) {
            return res.status(400).json({
                success: false,
                message: 'Bu bölüm zaten mevcut'
            });
        }

        const department = new Department({
            name: name.trim()
        });

        await department.save();

        res.status(201).json({
            success: true,
            message: 'Bölüm başarıyla eklendi',
            data: department
        });
    } catch (error) {
        console.error('Add department error:', error);
        res.status(500).json({
            success: false,
            message: 'Bölüm eklenirken hata oluştu'
        });
    }
});

// Delete department (admin only)
router.delete('/:id', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const department = await Department.findByIdAndDelete(req.params.id);

        if (!department) {
            return res.status(404).json({
                success: false,
                message: 'Bölüm bulunamadı'
            });
        }

        res.json({
            success: true,
            message: 'Bölüm başarıyla silindi'
        });
    } catch (error) {
        console.error('Delete department error:', error);
        res.status(500).json({
            success: false,
            message: 'Bölüm silinirken hata oluştu'
        });
    }
});

export default router;
