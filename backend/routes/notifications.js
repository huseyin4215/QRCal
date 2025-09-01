import express from 'express';
import { authMiddleware as auth } from '../middleware/auth.js';
import { checkAdmin } from '../middleware/checkAdmin.js';
import Notification from '../models/Notification.js';

const router = express.Router();

// Get unread notifications for user
router.get('/unread', auth, async (req, res) => {
  try {
    const notifications = await Notification.find({
      userId: req.user.id,
      read: false
    }).sort({ createdAt: -1 });

    const unreadCount = notifications.length;

    res.json({
      success: true,
      data: {
        notifications,
        unreadCount
      }
    });
  } catch (error) {
    console.error('Notifications fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Bildirimler alınamadı',
      error: error.message
    });
  }
});

// Mark notification as read
router.put('/:id/read', auth, async (req, res) => {
  try {
    const { id } = req.params;
    
    const notification = await Notification.findOneAndUpdate(
      { _id: id, userId: req.user.id },
      { read: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Bildirim bulunamadı'
      });
    }

    res.json({
      success: true,
      message: 'Bildirim okundu olarak işaretlendi',
      data: notification
    });
  } catch (error) {
    console.error('Notification mark as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Bildirim güncellenemedi',
      error: error.message
    });
  }
});

// Mark all notifications as read
router.put('/mark-all-read', auth, async (req, res) => {
  try {
    const result = await Notification.updateMany(
      { userId: req.user.id, read: false },
      { read: true }
    );

    res.json({
      success: true,
      message: 'Tüm bildirimler okundu olarak işaretlendi',
      data: {
        updatedCount: result.modifiedCount
      }
    });
  } catch (error) {
    console.error('Mark all notifications as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Bildirimler güncellenemedi',
      error: error.message
    });
  }
});

// Get all notifications for user (with pagination)
router.get('/', auth, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const notifications = await Notification.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Notification.countDocuments({ userId: req.user.id });

    res.json({
      success: true,
      data: {
        notifications,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Notifications fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Bildirimler alınamadı',
      error: error.message
    });
  }
});

// Delete notification
router.delete('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    
    const notification = await Notification.findOneAndDelete({
      _id: id,
      userId: req.user.id
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Bildirim bulunamadı'
      });
    }

    res.json({
      success: true,
      message: 'Bildirim silindi'
    });
  } catch (error) {
    console.error('Notification delete error:', error);
    res.status(500).json({
      success: false,
      message: 'Bildirim silinemedi',
      error: error.message
    });
  }
});

export default router;
