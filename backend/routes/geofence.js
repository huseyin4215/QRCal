import express from 'express';
import { body, validationResult } from 'express-validator';
import Geofence from '../models/Geofence.js';
import { authMiddleware as auth } from '../middleware/auth.js';
import { checkAdmin } from '../middleware/checkAdmin.js';

const router = express.Router();

// Validation rules
const geofenceValidation = [
  body('name').trim().isLength({ min: 2, max: 100 }).withMessage('İsim 2-100 karakter arasında olmalı'),
  body('description').optional().trim().isLength({ max: 500 }).withMessage('Açıklama 500 karakterden uzun olamaz'),
  body('center.latitude').isFloat({ min: -90, max: 90 }).withMessage('Geçersiz enlem değeri'),
  body('center.longitude').isFloat({ min: -180, max: 180 }).withMessage('Geçersiz boylam değeri'),
  body('radius').isInt({ min: 10, max: 10000 }).withMessage('Yarıçap 10-10000 metre arasında olmalı'),
  body('locationType').isIn(['university', 'faculty', 'building', 'room', 'custom']).withMessage('Geçersiz konum tipi'),
  body('isActive').optional().isBoolean().withMessage('Geçersiz aktiflik değeri')
];

// Tüm geofence'leri listele (Admin)
router.get('/admin', auth, checkAdmin, async (req, res) => {
  try {
    const geofences = await Geofence.find()
      .populate('facultyId', 'name email department')
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: geofences,
      count: geofences.length
    });
  } catch (error) {
    console.error('Geofence listesi alınamadı:', error);
    res.status(500).json({
      success: false,
      message: 'Geofence listesi alınamadı',
      error: error.message
    });
  }
});

// Faculty'ye ait geofence'leri listele
router.get('/faculty/:facultyId', auth, async (req, res) => {
  try {
    const { facultyId } = req.params;
    
    const geofences = await Geofence.find({ 
      facultyId, 
      isActive: true 
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      data: geofences,
      count: geofences.length
    });
  } catch (error) {
    console.error('Faculty geofence listesi alınamadı:', error);
    res.status(500).json({
      success: false,
      message: 'Faculty geofence listesi alınamadı',
      error: error.message
    });
  }
});

// Yeni geofence oluştur (Admin/Faculty)
router.post('/', auth, geofenceValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validasyon hatası',
        errors: errors.array()
      });
    }

    const { facultyId, center, radius, ...otherData } = req.body;
    
    // Faculty ID kontrolü
    if (!facultyId) {
      return res.status(400).json({
        success: false,
        message: 'Faculty ID gerekli'
      });
    }

    // Çakışan geofence kontrolü
    const existingGeofence = await Geofence.findOne({
      facultyId,
      isActive: true,
      center: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [center.longitude, center.latitude]
          },
          $maxDistance: radius * 2 // Çakışma kontrolü için 2x yarıçap
        }
      }
    });

    if (existingGeofence) {
      return res.status(400).json({
        success: false,
        message: 'Bu konumda zaten aktif bir geofence bulunuyor',
        existingGeofence: {
          id: existingGeofence._id,
          name: existingGeofence.name,
          distance: existingGeofence.calculateDistance(center.latitude, center.longitude)
        }
      });
    }

    const geofence = new Geofence({
      ...otherData,
      facultyId,
      center,
      radius,
      createdBy: req.user.id
    });

    await geofence.save();

    const populatedGeofence = await Geofence.findById(geofence._id)
      .populate('facultyId', 'name email department')
      .populate('createdBy', 'name email');

    res.status(201).json({
      success: true,
      message: 'Geofence başarıyla oluşturuldu',
      data: populatedGeofence
    });
  } catch (error) {
    console.error('Geofence oluşturulamadı:', error);
    res.status(500).json({
      success: false,
      message: 'Geofence oluşturulamadı',
      error: error.message
    });
  }
});

// Geofence güncelle (Admin/Faculty)
router.put('/:id', auth, geofenceValidation, async (req, res) => {
  try {
    const { id } = req.params;
    const errors = validationResult(req);
    
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validasyon hatası',
        errors: errors.array()
      });
    }

    const geofence = await Geofence.findById(id);
    if (!geofence) {
      return res.status(404).json({
        success: false,
        message: 'Geofence bulunamadı'
      });
    }

    // Yetki kontrolü
    if (!req.user.isAdmin && geofence.createdBy.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Bu geofence\'i düzenleme yetkiniz yok'
      });
    }

    const { center, radius, ...otherData } = req.body;
    
    // Çakışma kontrolü (kendisi hariç)
    if (center && radius) {
      const existingGeofence = await Geofence.findOne({
        _id: { $ne: id },
        facultyId: geofence.facultyId,
        isActive: true,
        center: {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: [center.longitude, center.latitude]
            },
            $maxDistance: radius * 2
          }
        }
      });

      if (existingGeofence) {
        return res.status(400).json({
          success: false,
          message: 'Bu konumda zaten aktif bir geofence bulunuyor',
          existingGeofence: {
            id: existingGeofence._id,
            name: existingGeofence.name,
            distance: existingGeofence.calculateDistance(center.latitude, center.longitude)
          }
        });
      }
    }

    Object.assign(geofence, otherData);
    if (center) geofence.center = center;
    if (radius) geofence.radius = radius;
    
    geofence.updatedBy = req.user.id;
    await geofence.save();

    const updatedGeofence = await Geofence.findById(id)
      .populate('facultyId', 'name email department')
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email');

    res.json({
      success: true,
      message: 'Geofence başarıyla güncellendi',
      data: updatedGeofence
    });
  } catch (error) {
    console.error('Geofence güncellenemedi:', error);
    res.status(500).json({
      success: false,
      message: 'Geofence güncellenemedi',
      error: error.message
    });
  }
});

// Geofence sil (Admin/Faculty)
router.delete('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    
    const geofence = await Geofence.findById(id);
    if (!geofence) {
      return res.status(404).json({
        success: false,
        message: 'Geofence bulunamadı'
      });
    }

    // Yetki kontrolü
    if (!req.user.isAdmin && geofence.createdBy.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Bu geofence\'i silme yetkiniz yok'
      });
    }

    await Geofence.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Geofence başarıyla silindi'
    });
  } catch (error) {
    console.error('Geofence silinemedi:', error);
    res.status(500).json({
      success: false,
      message: 'Geofence silinemedi',
      error: error.message
    });
  }
});

// Konum doğrulama endpoint'i
router.post('/verify-location', auth, [
  body('facultyId').isMongoId().withMessage('Geçersiz faculty ID'),
  body('location.latitude').isFloat({ min: -90, max: 90 }).withMessage('Geçersiz enlem'),
  body('location.longitude').isFloat({ min: -180, max: 180 }).withMessage('Geçersiz boylam'),
  body('location.accuracy').isFloat({ min: 0, max: 1000 }).withMessage('Geçersiz doğruluk değeri'),
  body('location.timestamp').isInt({ min: 0 }).withMessage('Geçersiz timestamp')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validasyon hatası',
        errors: errors.array()
      });
    }

    const { facultyId, location } = req.body;
    const { latitude, longitude, accuracy, timestamp } = location;

    // Faculty için aktif geofence'leri bul
    const geofences = await Geofence.find({
      facultyId,
      isActive: true
    });

    if (geofences.length === 0) {
      return res.json({
        success: true,
        allowed: true,
        message: 'Bu faculty için konum kısıtlaması bulunmuyor',
        geofence: null,
        distance: 0
      });
    }

    // En yakın geofence'i bul
    let closestGeofence = null;
    let minDistance = Infinity;

    for (const geofence of geofences) {
      const distance = geofence.calculateDistance(latitude, longitude);
      
      if (distance < minDistance) {
        minDistance = distance;
        closestGeofence = geofence;
      }
    }

    if (!closestGeofence) {
      return res.json({
        success: true,
        allowed: false,
        message: 'Geofence bulunamadı',
        geofence: null,
        distance: 0
      });
    }

    // Konum doğruluk kontrolü
    if (accuracy > closestGeofence.settings.maxAccuracy) {
      return res.json({
        success: true,
        allowed: false,
        message: `Konum doğruluğu yetersiz. Gerekli: ${closestGeofence.settings.maxAccuracy}m, Mevcut: ${accuracy}m`,
        geofence: closestGeofence,
        distance: minDistance,
        accuracy: accuracy,
        requiredAccuracy: closestGeofence.settings.maxAccuracy
      });
    }

    // Konum tazeliği kontrolü
    const locationAge = (Date.now() - timestamp) / 1000; // saniye
    if (locationAge > closestGeofence.settings.locationFreshness) {
      return res.json({
        success: true,
        allowed: false,
        message: `Konum bilgisi çok eski. Gerekli: ${closestGeofence.settings.locationFreshness}s, Mevcut: ${Math.round(locationAge)}s`,
        geofence: closestGeofence,
        distance: minDistance,
        locationAge: Math.round(locationAge),
        maxAge: closestGeofence.settings.locationFreshness
      });
    }

    // Geofence içinde mi kontrolü
    const isInside = closestGeofence.isPointInside(latitude, longitude);
    
    if (!isInside) {
      return res.json({
        success: true,
        allowed: false,
        message: `Belirtilen alan dışındasınız. Mesafe: ${minDistance}m, Yarıçap: ${closestGeofence.radius}m`,
        geofence: closestGeofence,
        distance: minDistance,
        radius: closestGeofence.radius
      });
    }

    // Çalışma saatleri kontrolü
    if (!closestGeofence.isOpenNow()) {
      return res.json({
        success: true,
        allowed: false,
        message: 'Şu anda çalışma saatleri dışındasınız',
        geofence: closestGeofence,
        distance: minDistance,
        workingHours: closestGeofence.workingHours
      });
    }

    // Başarılı konum doğrulama
    res.json({
      success: true,
      allowed: true,
      message: 'Konum doğrulaması başarılı',
      geofence: closestGeofence,
      distance: minDistance,
      accuracy: accuracy,
      locationAge: Math.round(locationAge)
    });

  } catch (error) {
    console.error('Konum doğrulama hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Konum doğrulaması yapılamadı',
      error: error.message
    });
  }
});

// Geofence istatistikleri (Admin)
router.get('/stats/admin', auth, checkAdmin, async (req, res) => {
  try {
    const totalGeofences = await Geofence.countDocuments();
    const activeGeofences = await Geofence.countDocuments({ isActive: true });
    const inactiveGeofences = totalGeofences - activeGeofences;

    const locationTypeStats = await Geofence.aggregate([
      {
        $group: {
          _id: '$locationType',
          count: { $sum: 1 }
        }
      }
    ]);

    const facultyStats = await Geofence.aggregate([
      {
        $lookup: {
          from: 'users',
          localField: 'facultyId',
          foreignField: '_id',
          as: 'faculty'
        }
      },
      {
        $group: {
          _id: '$facultyId',
          facultyName: { $first: '$faculty.name' },
          geofenceCount: { $sum: 1 }
        }
      },
      {
        $sort: { geofenceCount: -1 }
      }
    ]);

    res.json({
      success: true,
      data: {
        total: totalGeofences,
        active: activeGeofences,
        inactive: inactiveGeofences,
        locationTypes: locationTypeStats,
        facultyDistribution: facultyStats
      }
    });
  } catch (error) {
    console.error('Geofence istatistikleri alınamadı:', error);
    res.status(500).json({
      success: false,
      message: 'Geofence istatistikleri alınamadı',
      error: error.message
    });
  }
});

export default router;
