import express from 'express';
import Topic from '../models/Topic.js';
import { protect, authorize } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = express.Router();

// @desc    Get all active topics
// @route   GET /api/topics
// @access  Public
router.get('/', asyncHandler(async (req, res) => {
    const topics = await Topic.findActive();

    res.json({
        success: true,
        count: topics.length,
        data: topics.map(t => t.toPublicJSON())
    });
}));

// @desc    Get single topic by ID
// @route   GET /api/topics/:id
// @access  Public
router.get('/:id', asyncHandler(async (req, res) => {
    const topic = await Topic.findById(req.params.id);

    if (!topic || !topic.isActive) {
        return res.status(404).json({
            success: false,
            message: 'Konu bulunamadı'
        });
    }

    res.json({
        success: true,
        data: topic.toPublicJSON()
    });
}));

// @desc    Create new topic
// @route   POST /api/topics
// @access  Admin only
router.post('/', protect, authorize('admin'), asyncHandler(async (req, res) => {
    const { name, description, isAdvisorOnly } = req.body;

    // Check if topic with same name already exists
    const existingTopic = await Topic.findOne({ name });
    if (existingTopic) {
        return res.status(400).json({
            success: false,
            message: 'Bu isimde bir konu zaten mevcut'
        });
    }

    // Get max order
    const maxOrderTopic = await Topic.findOne().sort({ order: -1 });
    const nextOrder = maxOrderTopic ? maxOrderTopic.order + 1 : 1;

    const topic = await Topic.create({
        name,
        description: description || '',
        isAdvisorOnly: isAdvisorOnly || false,
        order: nextOrder
    });

    res.status(201).json({
        success: true,
        message: 'Konu başarıyla oluşturuldu',
        data: topic.toPublicJSON()
    });
}));

// @desc    Update topic
// @route   PUT /api/topics/:id
// @access  Admin only
router.put('/:id', protect, authorize('admin'), asyncHandler(async (req, res) => {
    let topic = await Topic.findById(req.params.id);

    if (!topic) {
        return res.status(404).json({
            success: false,
            message: 'Konu bulunamadı'
        });
    }

    const { name, description, isAdvisorOnly, isActive } = req.body;

    // If name is being changed, check for duplicates
    if (name && name !== topic.name) {
        const existingTopic = await Topic.findOne({ name, _id: { $ne: topic._id } });
        if (existingTopic) {
            return res.status(400).json({
                success: false,
                message: 'Bu isimde bir konu zaten mevcut'
            });
        }
    }

    // Update fields
    if (name !== undefined) topic.name = name;
    if (description !== undefined) topic.description = description;
    if (isAdvisorOnly !== undefined) topic.isAdvisorOnly = isAdvisorOnly;
    if (isActive !== undefined) topic.isActive = isActive;

    await topic.save();

    res.json({
        success: true,
        message: 'Konu başarıyla güncellendi',
        data: topic.toPublicJSON()
    });
}));

// @desc    Delete topic (soft delete)
// @route   DELETE /api/topics/:id
// @access  Admin only
router.delete('/:id', protect, authorize('admin'), asyncHandler(async (req, res) => {
    const topic = await Topic.findById(req.params.id);

    if (!topic) {
        return res.status(404).json({
            success: false,
            message: 'Konu bulunamadı'
        });
    }

    // Soft delete
    topic.isActive = false;
    await topic.save();

    res.json({
        success: true,
        message: 'Konu başarıyla silindi'
    });
}));

// @desc    Reorder topics
// @route   PUT /api/topics/reorder
// @access  Admin only
router.put('/reorder/batch', protect, authorize('admin'), asyncHandler(async (req, res) => {
    const { topicOrders } = req.body; // Array of { id, order }

    if (!Array.isArray(topicOrders)) {
        return res.status(400).json({
            success: false,
            message: 'topicOrders bir dizi olmalıdır'
        });
    }

    // Update each topic's order
    const updatePromises = topicOrders.map(async ({ id, order }) => {
        await Topic.findByIdAndUpdate(id, { order }, { new: true });
    });

    await Promise.all(updatePromises);

    const topics = await Topic.findActive();

    res.json({
        success: true,
        message: 'Konu sıralaması güncellendi',
        data: topics.map(t => t.toPublicJSON())
    });
}));

export default router;
