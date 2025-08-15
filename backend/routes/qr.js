import express from 'express';
import QRCode from 'qrcode';
import puppeteer from 'puppeteer';
import User from '../models/User.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// @desc    Generate QR code for faculty
// @route   GET /api/qr/generate/:slug
// @access  Public
router.get('/generate/:slug', asyncHandler(async (req, res) => {
  const { slug } = req.params;

  const faculty = await User.findBySlug(slug);

  if (!faculty) {
    return res.status(404).json({
      success: false,
      message: 'Öğretim elemanı bulunamadı'
    });
  }

  const appointmentUrl = `${process.env.FRONTEND_URL}/appointment/${slug}`;

  try {
    // Generate QR code as data URL
    const qrCodeDataUrl = await QRCode.toDataURL(appointmentUrl, {
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });

    res.json({
      success: true,
      data: {
        qrCode: qrCodeDataUrl,
        url: appointmentUrl,
        faculty: faculty.toPublicJSON()
      }
    });
  } catch (error) {
    console.error('QR code generation error:', error);
    res.status(500).json({
      success: false,
      message: 'QR kod oluşturulurken hata oluştu'
    });
  }
}));

// @desc    Generate QR code as image
// @route   GET /api/qr/image/:slug
// @access  Public
router.get('/image/:slug', asyncHandler(async (req, res) => {
  const { slug } = req.params;
  const { size = 300, format = 'png' } = req.query;

  const faculty = await User.findBySlug(slug);

  if (!faculty) {
    return res.status(404).json({
      success: false,
      message: 'Öğretim elemanı bulunamadı'
    });
  }

  const appointmentUrl = `${process.env.FRONTEND_URL}/appointment/${slug}`;

  try {
    // Generate QR code as buffer
    const qrCodeBuffer = await QRCode.toBuffer(appointmentUrl, {
      width: parseInt(size),
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      },
      type: format === 'svg' ? 'svg' : 'image/png'
    });

    res.setHeader('Content-Type', format === 'svg' ? 'image/svg+xml' : 'image/png');
    res.setHeader('Content-Disposition', `attachment; filename="qr-${slug}.${format}"`);
    res.send(qrCodeBuffer);
  } catch (error) {
    console.error('QR code generation error:', error);
    res.status(500).json({
      success: false,
      message: 'QR kod oluşturulurken hata oluştu'
    });
  }
}));

// @desc    Generate QR code with custom design
// @route   POST /api/qr/custom
// @access  Private
router.post('/custom', authMiddleware, asyncHandler(async (req, res) => {
  const {
    facultyId,
    design = 'default',
    colors = {},
    size = 300,
    includeLogo = false
  } = req.body;

  const faculty = await User.findById(facultyId);

  if (!faculty) {
    return res.status(404).json({
      success: false,
      message: 'Öğretim elemanı bulunamadı'
    });
  }

  const appointmentUrl = `${process.env.FRONTEND_URL}/appointment/${faculty.slug}`;

  try {
    let qrCodeDataUrl;

    if (design === 'custom') {
      // Custom design with colors
      qrCodeDataUrl = await QRCode.toDataURL(appointmentUrl, {
        width: parseInt(size),
        margin: 2,
        color: {
          dark: colors.dark || '#000000',
          light: colors.light || '#FFFFFF'
        }
      });
    } else {
      // Default design
      qrCodeDataUrl = await QRCode.toDataURL(appointmentUrl, {
        width: parseInt(size),
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
    }

    // Update faculty QR code URL
    faculty.qrCodeUrl = qrCodeDataUrl;
    await faculty.save();

    res.json({
      success: true,
      data: {
        qrCode: qrCodeDataUrl,
        url: appointmentUrl,
        faculty: faculty.toPublicJSON()
      }
    });
  } catch (error) {
    console.error('Custom QR code generation error:', error);
    res.status(500).json({
      success: false,
      message: 'QR kod oluşturulurken hata oluştu'
    });
  }
}));

// @desc    Generate PDF with QR code and schedule
// @route   POST /api/qr/pdf
// @access  Private
router.post('/pdf', authMiddleware, asyncHandler(async (req, res) => {
  const { facultyId, includeSchedule = true } = req.body;

  const faculty = await User.findById(facultyId);

  if (!faculty) {
    return res.status(404).json({
      success: false,
      message: 'Öğretim elemanı bulunamadı'
    });
  }

  try {
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    
    // Generate HTML content
    const htmlContent = generatePDFHTML(faculty, includeSchedule);
    
    await page.setContent(htmlContent);
    await page.setViewport({ width: 794, height: 1123 }); // A4 size

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20mm',
        right: '20mm',
        bottom: '20mm',
        left: '20mm'
      }
    });

    await browser.close();

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="qr-schedule-${faculty.slug}.pdf"`);
    res.send(pdfBuffer);

  } catch (error) {
    console.error('PDF generation error:', error);
    res.status(500).json({
      success: false,
      message: 'PDF oluşturulurken hata oluştu'
    });
  }
}));

// Helper function to generate PDF HTML
function generatePDFHTML(faculty, includeSchedule) {
  const appointmentUrl = `${process.env.FRONTEND_URL}/appointment/${faculty.slug}`;
  
  return `
    <!DOCTYPE html>
    <html lang="tr">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>QR Takvim - ${faculty.name}</title>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          margin: 0;
          padding: 20px;
          background: white;
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
          border-bottom: 2px solid #667eea;
          padding-bottom: 20px;
        }
        .title {
          color: #667eea;
          font-size: 24px;
          font-weight: bold;
          margin-bottom: 10px;
        }
        .subtitle {
          color: #666;
          font-size: 16px;
        }
        .content {
          display: flex;
          gap: 30px;
        }
        .qr-section {
          flex: 1;
          text-align: center;
        }
        .info-section {
          flex: 2;
        }
        .qr-code {
          border: 2px solid #ddd;
          padding: 20px;
          border-radius: 10px;
          margin-bottom: 20px;
        }
        .faculty-info {
          background: #f8f9fa;
          padding: 20px;
          border-radius: 10px;
          margin-bottom: 20px;
        }
        .info-row {
          display: flex;
          margin-bottom: 10px;
        }
        .info-label {
          font-weight: bold;
          width: 120px;
          color: #667eea;
        }
        .info-value {
          flex: 1;
        }
        .schedule-section {
          margin-top: 30px;
        }
        .schedule-title {
          color: #667eea;
          font-size: 18px;
          font-weight: bold;
          margin-bottom: 15px;
          border-bottom: 1px solid #ddd;
          padding-bottom: 5px;
        }
        .schedule-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 15px;
        }
        .schedule-item {
          background: #f8f9fa;
          padding: 15px;
          border-radius: 8px;
          border-left: 4px solid #667eea;
        }
        .day-name {
          font-weight: bold;
          color: #667eea;
          margin-bottom: 5px;
        }
        .time-range {
          color: #666;
          font-size: 14px;
        }
        .instructions {
          background: #e3f2fd;
          padding: 15px;
          border-radius: 8px;
          margin-top: 20px;
          border-left: 4px solid #2196f3;
        }
        .instructions h4 {
          color: #1976d2;
          margin-top: 0;
          margin-bottom: 10px;
        }
        .instructions ol {
          margin: 0;
          padding-left: 20px;
        }
        .instructions li {
          margin-bottom: 5px;
          color: #333;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="title">QR Takvim</div>
        <div class="subtitle">Akademik Randevu Sistemi</div>
      </div>
      
      <div class="content">
        <div class="qr-section">
          <div class="qr-code">
            <div style="font-weight: bold; margin-bottom: 10px; color: #667eea;">QR Kod</div>
            <div style="font-size: 12px; color: #666; margin-bottom: 15px;">Randevu almak için tarayın</div>
            <div style="width: 200px; height: 200px; background: #f0f0f0; margin: 0 auto; display: flex; align-items: center; justify-content: center; border: 1px solid #ddd;">
              <div style="text-align: center; color: #999;">
                <div style="font-size: 12px;">QR Kod</div>
                <div style="font-size: 10px;">Burada görünecek</div>
              </div>
            </div>
          </div>
          
          <div class="instructions">
            <h4>Nasıl Kullanılır?</h4>
            <ol>
              <li>Telefonunuzun kamera uygulamasını açın</li>
              <li>QR kodu tarayın</li>
              <li>Randevu sayfasında bilgilerinizi girin</li>
              <li>Uygun saati seçin ve talebinizi gönderin</li>
            </ol>
          </div>
        </div>
        
        <div class="info-section">
          <div class="faculty-info">
            <div class="info-row">
              <div class="info-label">Ad Soyad:</div>
              <div class="info-value">${faculty.title} ${faculty.name}</div>
            </div>
            <div class="info-row">
              <div class="info-label">Bölüm:</div>
              <div class="info-value">${faculty.department}</div>
            </div>
            <div class="info-row">
              <div class="info-label">Ofis:</div>
              <div class="info-value">${faculty.office || 'Belirtilmemiş'}</div>
            </div>
            <div class="info-row">
              <div class="info-label">Telefon:</div>
              <div class="info-value">${faculty.phone || 'Belirtilmemiş'}</div>
            </div>
            <div class="info-row">
              <div class="info-label">E-posta:</div>
              <div class="info-value">${faculty.email}</div>
            </div>
            <div class="info-row">
              <div class="info-label">Randevu Süresi:</div>
              <div class="info-value">${faculty.slotDuration} dakika</div>
            </div>
          </div>
          
          ${includeSchedule ? `
            <div class="schedule-section">
              <div class="schedule-title">Haftalık Müsaitlik Saatleri</div>
              <div class="schedule-grid">
                ${faculty.availability.map(slot => `
                  <div class="schedule-item">
                    <div class="day-name">${getDayName(slot.day)}</div>
                    <div class="time-range">${slot.startTime} - ${slot.endTime}</div>
                  </div>
                `).join('')}
              </div>
            </div>
          ` : ''}
        </div>
      </div>
    </body>
    </html>
  `;
}

// Helper function to get Turkish day names
function getDayName(englishDay) {
  const dayMap = {
    'Monday': 'Pazartesi',
    'Tuesday': 'Salı',
    'Wednesday': 'Çarşamba',
    'Thursday': 'Perşembe',
    'Friday': 'Cuma',
    'Saturday': 'Cumartesi',
    'Sunday': 'Pazar'
  };
  return dayMap[englishDay] || englishDay;
}

export default router; 