import React, { useState, useEffect, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { QrCodeIcon, DocumentArrowDownIcon, ArrowUpTrayIcon, SparklesIcon, HomeIcon, UserIcon, PlusIcon, MinusIcon, ArrowPathIcon, PencilIcon } from '@heroicons/react/24/outline';
import {
  PaintBrushIcon,
  EyeIcon,
  EyeSlashIcon,
  SwatchIcon,
  Cog6ToothIcon,
  PhotoIcon,
  ArrowDownTrayIcon
} from '@heroicons/react/24/outline';
import { jsPDF } from 'jspdf';
import { toPng } from 'html-to-image';
import styles from './QRCodeEditor.module.css';

// Import logo assets
import ankaraUniLogo from '../assets/logolar/ankara_uni.png';
import muhendislikLogo from '../assets/logolar/muhendislik_logo.png';
import googleCalendarLogo from '../assets/logolar/google_calendar.png';
import linkedinLogo from '../assets/logolar/linkedin.png';
import instagramLogo from '../assets/logolar/instagram.png';
import twitterLogo from '../assets/logolar/twitter.jpg';
import yilBeyazLogo from '../assets/logolar/80-yil-beyaz.png';
import yilLacivertLogo from '../assets/logolar/80-yil-lacivert.png';
import ankaraUniIngLogo from '../assets/logolar/Ankara_University_Logo_ing.png';
import osbMyoLogo from '../assets/logolar/OSB-MYO.png';
import qnnectLogo from '../assets/logolar/Qrnnect.png';

const QRCodeEditor = ({ value, onDownload, user }) => {
  const [qrConfig, setQrConfig] = useState({
    size: 256,
    level: 'M',
    bgColor: '#FFFFFF',
    fgColor: '#1D3F87',
    includeMargin: true,
    marginSize: 4
  });

  const [cardConfig, setCardConfig] = useState({
    showCard: true,
    cardColor: '#FFFFFF',
    cardBorder: '#E5E7EB',
    cardShadow: true,
    cardPadding: 20
  });

  const [logoConfig, setLogoConfig] = useState({
    showLogo: false,
    logoUrl: '',
    logoSize: 60,
    logoOpacity: 0.3,
    logoShape: 'round', // 'round' or 'square'
    logoType: 'custom', // 'custom', 'preset'
    logoBgColor: '' // empty = QR bgColor kullan, değilse özel renk
  });

  // İki çıktı tipi: logosuz (standart) | logolu (merkez excavate + ECC H)
  const isLogolu = logoConfig.showLogo && !!logoConfig.logoUrl;
  const eccLevel = isLogolu ? 'H' : qrConfig.level;
  const logoSizeCap = Math.min(100, Math.floor(qrConfig.size * 0.28));
  const effectiveLogoSize = Math.min(logoConfig.logoSize, logoSizeCap);
  // 1x1 transparent PNG for excavation (logo rendered via overlay for custom shape)
  const TRANSPARENT_PIXEL = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

  // Preset logo options - using imported assets
  const presetLogos = [
    {
      id: 'ankara_uni',
      name: 'Ankara Üniversitesi',
      url: ankaraUniLogo
    },
    {
      id: 'ankara_uni_ing',
      name: 'AU İngilizce',
      url: ankaraUniIngLogo
    },
    {
      id: 'muhendislik',
      name: 'Mühendislik',
      url: muhendislikLogo
    },
    {
      id: 'osb_myo',
      name: 'OSB-MYO',
      url: osbMyoLogo
    },
    {
      id: '80_yil_beyaz',
      name: '80. Yıl (Beyaz)',
      url: yilBeyazLogo,
      previewBg: '#1D3F87'
    },
    {
      id: '80_yil_lacivert',
      name: '80. Yıl (Lacivert)',
      url: yilLacivertLogo
    },
    {
      id: 'qnnect',
      name: 'Qrnnect',
      url: qnnectLogo
    },
    {
      id: 'google_calendar',
      name: 'Google Takvim',
      url: googleCalendarLogo
    },
    {
      id: 'linkedin',
      name: 'LinkedIn',
      url: linkedinLogo
    },
    {
      id: 'instagram',
      name: 'Instagram',
      url: instagramLogo
    },
    {
      id: 'twitter',
      name: 'Twitter',
      url: twitterLogo
    }
  ];

  const [contactConfig, setContactConfig] = useState({
    showName: true,
    showTitle: true,
    showEmail: true,
    showPhone: true,
    showDepartment: true,
    showOffice: true,
    textColor: '#374151',
    fontSize: 14,
    position: 'bottom', // 'top' or 'bottom'
    customText: 'Scan me', // New field for custom text
    showCustomText: true, // New field to control custom text visibility
    customTextPosition: 'center', // 'above', 'below', 'left', 'right', 'center'
    customTextStyle: 'pill', // 'pill', 'box', 'underline', 'none'
    customTextSize: 'medium', // 'small', 'medium', 'large'
    customTextColor: '#1D3F87', // New field for custom text color
    showAppName: true, // New field to control app name visibility
    appName: 'Qrnnect' // New field for app name
  });

  const [exportConfig, setExportConfig] = useState({
    format: 'png', // 'png', 'pdf'
    size: 'A4', // 'A4', 'A5'
    orientation: 'portrait' // 'portrait', 'landscape'
  });

  // Ensure landscape mode only allows custom text at top/bottom and put it inside contact block
  useEffect(() => {
    if (exportConfig.orientation === 'landscape') {
      if (contactConfig.customTextPosition !== 'above' && contactConfig.customTextPosition !== 'below') {
        setContactConfig(prev => ({ ...prev, customTextPosition: 'above' }));
      }
    }
  }, [exportConfig.orientation, contactConfig.customTextPosition]);

  // QR boyutu değiştiğinde logo boyutunu sınırla (maks 100px)
  useEffect(() => {
    if (logoConfig.showLogo && logoConfig.logoUrl) {
      const cap = Math.min(100, Math.floor(qrConfig.size * 0.28));
      if (logoConfig.logoSize > cap) {
        setLogoConfig(prev => ({ ...prev, logoSize: cap }));
      }
    }
  }, [qrConfig.size]);

  const [previewMode, setPreviewMode] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const qrRef = useRef(null);
  const previewCardRef = useRef(null);

  // Predefined color schemes
  const colorSchemes = [
    { name: 'Navy', bg: '#FFFFFF', fg: '#1D3F87' },
    { name: 'Yeşil', bg: '#FFFFFF', fg: '#10B981' },
    { name: 'Altın', bg: '#FFFFFF', fg: '#C5A25D' },
    { name: 'Turuncu', bg: '#FFFFFF', fg: '#F59E0B' },
    { name: 'Kırmızı', bg: '#FFFFFF', fg: '#EF4444' },
    { name: 'Siyah', bg: '#FFFFFF', fg: '#000000' },
    { name: 'Gradient Mavi', bg: '#F0F9FF', fg: '#3B82F6' },
    { name: 'Gradient Yeşil', bg: '#F0FDF4', fg: '#16A34A' },
  ];

  const handleDownloadFromPreview = async (format) => {
    const element = previewCardRef.current;
    if (!element) return;
    if (format === 'pdf') {
      setIsGeneratingPDF(true);
    }

    try {
      // html-to-image uses SVG foreignObject — browser renders natively
      // No onclone hacks needed, output matches screen exactly
      const dataUrl = await toPng(element, {
        pixelRatio: 4, // High resolution (4x)
        cacheBust: true, // Bypass CORS cache issues
        includeQueryParams: true,
        skipAutoScale: true,
      });

      // Convert data URL to canvas for finishExport compatibility
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        finishExport(canvas, format);
      };
      img.onerror = () => {
        console.error('Failed to load exported image');
        if (format === 'pdf') setIsGeneratingPDF(false);
        alert(`${format.toUpperCase()} oluşturulurken hata oluştu.`);
      };
      img.src = dataUrl;
    } catch (err) {
      console.error('Export error:', err);
      if (format === 'pdf') setIsGeneratingPDF(false);
      alert(`${format.toUpperCase()} oluşturulurken hata oluştu.`);
    }
  };

  const finishExport = (canvas, format) => {
    if (format === 'pdf') {
      let pdfSize = 'a4';
      let pdfOrientation = 'p';
      if (exportConfig.size === 'A5') pdfSize = 'a5';
      if (exportConfig.orientation === 'landscape') pdfOrientation = 'l';
      const pdf = new jsPDF(pdfOrientation, 'mm', pdfSize);
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 15;
      const imgWidth = pageWidth - (margin * 2);
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let finalImgHeight = imgHeight;
      let finalImgWidth = imgWidth;
      if (imgHeight > (pageHeight - (margin * 2))) {
        finalImgHeight = pageHeight - (margin * 2);
        finalImgWidth = (canvas.width * finalImgHeight) / canvas.height;
      }
      const x = (pageWidth - finalImgWidth) / 2;
      const y = (pageHeight - finalImgHeight) / 2;
      pdf.addImage(canvas.toDataURL('image/png', 1.0), 'PNG', x, y, finalImgWidth, finalImgHeight);
      const timestamp = new Date().toLocaleString('tr-TR');
      pdf.setFontSize(8);
      pdf.setTextColor(100, 100, 100);
      pdf.text(`Oluşturulma Tarihi: ${timestamp}`, margin, pageHeight - margin);
      pdf.text('Qrnnect - Randevu Sistemi', pageWidth - margin, pageHeight - margin, { align: 'right' });
      pdf.save(`qr-code-${user?.name || 'faculty'}-${exportConfig.size.toLowerCase()}.pdf`);
      setIsGeneratingPDF(false);
    } else {
      const link = document.createElement('a');
      link.download = `qr-code-${user?.name || 'faculty'}-${exportConfig.size.toLowerCase()}.png`;
      link.href = canvas.toDataURL('image/png', 1.0);
      link.click();
    }
  };

  const handleDownloadQR = () => {
    if (previewCardRef.current) {
      handleDownloadFromPreview(exportConfig.format);
      return;
    }
    if (qrRef.current) {
      if (exportConfig.format === 'pdf') {
        handleDownloadPDF();
      } else {
        handleDownloadPNG();
      }
    }
  };

  // Build a hidden DOM container that mirrors the on-screen card for export (PNG/PDF)
  const createExportContainer = () => {
    const isPortrait = exportConfig.orientation === 'portrait';
    const isA4 = exportConfig.size === 'A4';

    // Use half-resolution logical size and export with scale=2 for high DPI
    let baseWidth, baseHeight;
    if (isA4) {
      baseWidth = isPortrait ? 1240 : 1754;
      baseHeight = isPortrait ? 1754 : 1240;
    } else {
      baseWidth = isPortrait ? 874 : 1240;
      baseHeight = isPortrait ? 1240 : 874;
    }

    const hasContact = user && (
      contactConfig.showName ||
      contactConfig.showTitle ||
      contactConfig.showEmail ||
      contactConfig.showPhone ||
      contactConfig.showDepartment ||
      contactConfig.showOffice ||
      (contactConfig.showAppName && contactConfig.appName)
    );

    const buildCustomTextDiv = () => {
      const customTextDiv = document.createElement('div');
      const sizeMap = { small: '20px', medium: '28px', large: '36px' };
      customTextDiv.style.fontSize = sizeMap[contactConfig.customTextSize] || sizeMap.medium;
      customTextDiv.style.fontWeight = 'bold';
      customTextDiv.style.lineHeight = '1.2';
      customTextDiv.style.color = contactConfig.customTextColor;
      customTextDiv.style.textAlign = 'center';
      customTextDiv.style.width = 'auto';
      customTextDiv.style.display = 'inline-block';

      switch (contactConfig.customTextStyle) {
        case 'pill':
          customTextDiv.style.padding = '8px 16px';
          customTextDiv.style.backgroundColor = 'rgba(255,255,255,0.9)';
          customTextDiv.style.borderRadius = '25px';
          customTextDiv.style.border = `2px solid ${contactConfig.customTextColor}`;
          break;
        case 'box':
          customTextDiv.style.padding = '8px 16px';
          customTextDiv.style.backgroundColor = 'rgba(255,255,255,0.9)';
          customTextDiv.style.borderRadius = '8px';
          customTextDiv.style.border = `2px solid ${contactConfig.customTextColor}`;
          break;
        case 'underline':
          customTextDiv.style.padding = '4px 0';
          customTextDiv.style.borderBottom = `3px solid ${contactConfig.customTextColor}`;
          break;
        case 'none':
        default:
          customTextDiv.style.padding = '4px 0';
          break;
      }

      customTextDiv.textContent = contactConfig.customText;
      return customTextDiv;
    };

    const buildContactDiv = () => {
      const contactDiv = document.createElement('div');
      contactDiv.style.display = 'flex';
      contactDiv.style.flexDirection = 'column';
      contactDiv.style.gap = '12px';
      contactDiv.style.textAlign = exportConfig.orientation === 'landscape'
        ? (contactConfig.position === 'top' ? 'left' : 'right')
        : 'center';
      contactDiv.style.color = contactConfig.textColor;
      contactDiv.style.background = 'transparent';
      contactDiv.style.margin = '0';
      contactDiv.style.padding = '0';
      contactDiv.style.lineHeight = '1.3';

      const appendText = (text, sizePx, weight = 'normal', color) => {
        const el = document.createElement('div');
        el.style.fontSize = `${sizePx}px`;
        el.style.fontWeight = weight;
        el.style.margin = '0';
        el.style.lineHeight = '1.3';
        if (color) el.style.color = color;
        el.textContent = text;
        contactDiv.appendChild(el);
      };
      // Landscape: include custom text within the contact block at top/bottom only
      if (exportConfig.orientation === 'landscape' && contactConfig.showCustomText && contactConfig.customText && contactConfig.customTextPosition === 'above') {
        contactDiv.appendChild(buildCustomTextDiv());
      }

      if (contactConfig.showName && user.name) appendText(user.name, contactConfig.fontSize + 4, 'bold');
      if (contactConfig.showTitle && user.title) appendText(user.title, contactConfig.fontSize);
      if (contactConfig.showDepartment && user.department) appendText(user.department, contactConfig.fontSize);
      if (contactConfig.showEmail && user.email) appendText(user.email, contactConfig.fontSize);
      if (contactConfig.showPhone && user.phone) appendText(user.phone, contactConfig.fontSize);
      if (contactConfig.showOffice && user.office) appendText(`Ofis: ${user.office}`, contactConfig.fontSize);
      if (contactConfig.showAppName && contactConfig.appName) appendText(contactConfig.appName, contactConfig.fontSize + 8, 'bold', qrConfig.fgColor);

      if (exportConfig.orientation === 'landscape' && contactConfig.showCustomText && contactConfig.customText && contactConfig.customTextPosition === 'below') {
        contactDiv.appendChild(buildCustomTextDiv());
      }

      return contactDiv;
    };

    const container = document.createElement('div');
    container.style.position = 'absolute';
    container.style.left = '-9999px';
    container.style.top = '0';
    container.style.width = `${baseWidth}px`;
    container.style.minHeight = `${baseHeight}px`;
    container.style.backgroundColor = cardConfig.cardColor;
    container.style.padding = `${cardConfig.cardPadding * 2}px`;
    container.style.borderRadius = '20px';
    container.style.border = cardConfig.cardBorder ? `2px solid ${cardConfig.cardBorder}` : 'none';
    container.style.display = 'flex';
    container.style.flexDirection = 'column';
    container.style.alignItems = 'center';
    container.style.justifyContent = 'center';
    container.style.gap = '20px';
    container.style.overflow = 'hidden';
    container.style.boxShadow = cardConfig.cardShadow ? '0 10px 30px rgba(0, 0, 0, 0.1)' : 'none';
    container.style.fontFamily = 'Arial, sans-serif';
    container.style.lineHeight = '1.3';

    // Above custom text (only for portrait; landscape will render inside contact block)
    if (exportConfig.orientation !== 'landscape' && contactConfig.showCustomText && contactConfig.customText && contactConfig.customTextPosition === 'above') {
      container.appendChild(buildCustomTextDiv());
    }

    // Main row/column layout
    const layout = document.createElement('div');
    layout.style.display = 'flex';
    layout.style.flexDirection = exportConfig.orientation === 'landscape' ? 'row' : 'column';
    layout.style.alignItems = 'center';
    layout.style.gap = '20px';
    layout.style.width = '100%';

    // Left custom text removed

    // Contact info (left side when position === 'top' in landscape)
    if (hasContact && contactConfig.position === 'top') {
      layout.appendChild(buildContactDiv());
    }

    // QR clone
    const qrClone = qrRef.current ? qrRef.current.cloneNode(true) : null;
    if (qrClone) {
      qrClone.style.width = '300px';
      qrClone.style.height = '300px';
      qrClone.style.display = 'block';
      qrClone.style.margin = '0';
      qrClone.style.padding = '0';
      const svgElement = qrClone.querySelector('svg');
      if (svgElement) {
        svgElement.style.width = '100%';
        svgElement.style.height = '100%';
        svgElement.setAttribute('width', '300');
        svgElement.setAttribute('height', '300');
      }
      layout.appendChild(qrClone);
    }

    // Right custom text removed

    // Contact info (right side when position === 'bottom' in landscape)
    if (hasContact && contactConfig.position === 'bottom') {
      layout.appendChild(buildContactDiv());
    }

    container.appendChild(layout);

    // Below custom text (only for portrait; landscape will render inside contact block)
    if (exportConfig.orientation !== 'landscape' && contactConfig.showCustomText && contactConfig.customText && contactConfig.customTextPosition === 'below') {
      container.appendChild(buildCustomTextDiv());
    }

    document.body.appendChild(container);
    // After layout, get actual height for html2canvas bounds
    const actualHeight = Math.max(baseHeight, container.offsetHeight);
    return { container, width: baseWidth, height: actualHeight };
  };

  const handleDownloadPNG = () => {
    if (qrRef.current) {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const svg = qrRef.current.querySelector('svg');

      // Convert SVG to canvas
      const svgData = new XMLSerializer().serializeToString(svg);
      const img = new Image();

      img.onload = () => {
        // Calculate canvas size based on export config
        let canvasWidth, canvasHeight;
        const isPortrait = exportConfig.orientation === 'portrait';
        const isA4 = exportConfig.size === 'A4';

        if (isA4) {
          canvasWidth = isPortrait ? 2480 : 3508; // A4 dimensions in pixels (300 DPI)
          canvasHeight = isPortrait ? 3508 : 2480;
        } else {
          canvasWidth = isPortrait ? 1748 : 2480; // A5 dimensions in pixels (300 DPI)
          canvasHeight = isPortrait ? 2480 : 1748;
        }

        canvas.width = canvasWidth;
        canvas.height = canvasHeight;

        // Draw card background
        ctx.fillStyle = cardConfig.cardColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw card border
        if (cardConfig.cardBorder) {
          ctx.strokeStyle = cardConfig.cardBorder;
          ctx.lineWidth = 6;
          ctx.strokeRect(0, 0, canvas.width, canvas.height);
        }

        // Calculate positions for modern layout
        const padding = cardConfig.cardPadding * 3; // Scale up for high DPI
        const qrSize = qrConfig.size * 3; // Scale up for high DPI

        // Center QR code
        const qrX = (canvas.width - qrSize) / 2;
        const qrY = (canvas.height - qrSize) / 2;

        // Draw QR code
        ctx.drawImage(img, qrX, qrY, qrSize, qrSize);
        // Helper: draw contact info and trigger download
        // MUST be defined before logo code since logo uses async onload callback
        const drawContactAndDownload = () => {
          if (user && (contactConfig.showName || contactConfig.showTitle || contactConfig.showEmail || contactConfig.showPhone || contactConfig.showDepartment || contactConfig.showOffice || contactConfig.showCustomText)) {
            const lineHeight = (contactConfig.fontSize + 16) * 3;
            let textX, textY;

            if (isPortrait) {
              if (contactConfig.position === 'top') {
                textX = canvas.width / 2;
                textY = padding + 120;
              } else {
                textX = canvas.width / 2;
                textY = qrY + qrSize + 80;
              }
            } else {
              if (contactConfig.position === 'top') {
                textX = padding + 120;
                textY = canvas.height / 2;
              } else {
                textX = qrX + qrSize + 80;
                textY = canvas.height / 2;
              }
              if (contactConfig.position === 'top') {
                ctx.textAlign = 'left';
                textX = padding + 150;
              } else {
                ctx.textAlign = 'right';
                textX = qrX + qrSize + 120;
              }
            }

            ctx.fillStyle = contactConfig.textColor;
            ctx.textAlign = 'center';

            if (contactConfig.showCustomText && contactConfig.customText) {
              const sizeMap = { small: contactConfig.fontSize + 2, medium: contactConfig.fontSize + 10, large: contactConfig.fontSize + 18 };
              const customTextSize = sizeMap[contactConfig.customTextSize] || sizeMap.medium;
              const textMetrics = ctx.measureText(contactConfig.customText);
              const textWidth = textMetrics.width;
              const textHeight = customTextSize * 3;

              if (exportConfig.orientation !== 'landscape' && contactConfig.customTextPosition === 'center') {
                if (contactConfig.position === 'top') {
                  textX = canvas.width / 2;
                  textY = qrY - 40;
                } else {
                  textX = canvas.width / 2;
                  textY = qrY + qrSize + 40;
                }
              }

              if (contactConfig.customTextStyle === 'pill' || contactConfig.customTextStyle === 'box') {
                ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
                let bgX, bgY;
                if (exportConfig.orientation === 'landscape') {
                  if (contactConfig.position === 'top') { bgX = textX - 20; bgY = textY - textHeight / 2 - 10; }
                  else { bgX = textX - textWidth - 20; bgY = textY - textHeight / 2 - 10; }
                } else { bgX = textX - textWidth / 2 - 20; bgY = textY - textHeight - 10; }
                ctx.fillRect(bgX, bgY, textWidth + 40, textHeight + 20);
                ctx.strokeStyle = contactConfig.customTextColor;
                ctx.lineWidth = 6;
                ctx.strokeRect(bgX, bgY, textWidth + 40, textHeight + 20);
              } else if (contactConfig.customTextStyle === 'underline') {
                ctx.strokeStyle = contactConfig.customTextColor;
                ctx.lineWidth = 9;
                ctx.beginPath();
                let lineStartX, lineEndX;
                if (exportConfig.orientation === 'landscape') {
                  if (contactConfig.position === 'top') { lineStartX = textX; lineEndX = textX + textWidth; }
                  else { lineStartX = textX - textWidth; lineEndX = textX; }
                } else { lineStartX = textX - textWidth / 2; lineEndX = textX + textWidth / 2; }
                ctx.moveTo(lineStartX, textY + 15);
                ctx.lineTo(lineEndX, textY + 15);
                ctx.stroke();
              }

              ctx.fillStyle = contactConfig.customTextColor;
              ctx.font = `bold ${customTextSize * 3}px Arial`;
              ctx.fillText(contactConfig.customText, textX, textY);
              if (!(exportConfig.orientation !== 'landscape' && contactConfig.customTextPosition === 'center')) {
                textY += lineHeight + 40;
              }
              ctx.fillStyle = contactConfig.textColor;
            }

            ctx.font = `bold ${(contactConfig.fontSize + 6) * 3}px Arial`;
            if (contactConfig.showName && user.name) { ctx.fillText(user.name, textX, textY); textY += lineHeight + 20; }
            if (contactConfig.showTitle && user.title) { ctx.font = `${(contactConfig.fontSize + 2) * 3}px Arial`; ctx.fillText(user.title, textX, textY); textY += lineHeight + 15; }
            if (contactConfig.showDepartment && user.department) { ctx.font = `${contactConfig.fontSize * 3}px Arial`; ctx.fillText(user.department, textX, textY); textY += lineHeight + 15; }
            if (contactConfig.showEmail && user.email) { ctx.font = `${(contactConfig.fontSize - 2) * 3}px Arial`; ctx.fillText(user.email, textX, textY); textY += lineHeight + 15; }
            if (contactConfig.showPhone && user.phone) { ctx.font = `${(contactConfig.fontSize - 2) * 3}px Arial`; ctx.fillText(user.phone, textX, textY); textY += lineHeight + 15; }
            if (contactConfig.showOffice && user.office) { ctx.font = `${(contactConfig.fontSize - 2) * 3}px Arial`; ctx.fillText(`Ofis: ${user.office}`, textX, textY); textY += lineHeight + 15; }
            if (contactConfig.showAppName && contactConfig.appName) { ctx.font = `bold ${(contactConfig.fontSize + 10) * 3}px Arial`; ctx.fillStyle = qrConfig.fgColor; ctx.fillText(contactConfig.appName, textX, textY); }
          }

          const link = document.createElement('a');
          link.download = `qr-code-${user?.name || 'faculty'}-${exportConfig.size.toLowerCase()}.png`;
          link.href = canvas.toDataURL();
          link.click();
        };

        // Draw logo overlay on canvas (HTML overlay div is not part of SVG)
        if (isLogolu && logoConfig.logoUrl) {
          const logoBg = logoConfig.logoBgColor || qrConfig.bgColor;
          const scaledLogoSize = effectiveLogoSize * 3;
          const scaledOverlaySize = scaledLogoSize * 1.35; // Same size for both round and square
          const centerX = qrX + qrSize / 2;
          const centerY = qrY + qrSize / 2;

          ctx.save();
          if (logoConfig.logoShape === 'round') {
            ctx.beginPath();
            ctx.arc(centerX, centerY, scaledOverlaySize / 2 + 6, 0, Math.PI * 2);
            ctx.fillStyle = logoBg;
            ctx.fill();
          } else {
            const bgX = centerX - scaledOverlaySize / 2 - 6;
            const bgY = centerY - scaledOverlaySize / 2 - 6;
            const bgW = scaledOverlaySize + 12;
            const bgH = scaledOverlaySize + 12;
            const radius = 8 * 3;
            ctx.beginPath();
            ctx.moveTo(bgX + radius, bgY);
            ctx.lineTo(bgX + bgW - radius, bgY);
            ctx.quadraticCurveTo(bgX + bgW, bgY, bgX + bgW, bgY + radius);
            ctx.lineTo(bgX + bgW, bgY + bgH - radius);
            ctx.quadraticCurveTo(bgX + bgW, bgY + bgH, bgX + bgW - radius, bgY + bgH);
            ctx.lineTo(bgX + radius, bgY + bgH);
            ctx.quadraticCurveTo(bgX, bgY + bgH, bgX, bgY + bgH - radius);
            ctx.lineTo(bgX, bgY + radius);
            ctx.quadraticCurveTo(bgX, bgY, bgX + radius, bgY);
            ctx.closePath();
            ctx.fillStyle = logoBg;
            ctx.fill();
          }
          ctx.restore();

          const logoImg = new Image();
          logoImg.crossOrigin = 'anonymous';
          logoImg.onload = () => {
            ctx.save();
            if (logoConfig.logoShape === 'round') {
              ctx.beginPath();
              ctx.arc(centerX, centerY, scaledLogoSize / 2, 0, Math.PI * 2);
              ctx.clip();
            }
            ctx.globalAlpha = logoConfig.logoOpacity;
            const logoDrawX = centerX - scaledLogoSize / 2;
            const logoDrawY = centerY - scaledLogoSize / 2;
            ctx.drawImage(logoImg, logoDrawX, logoDrawY, scaledLogoSize, scaledLogoSize);
            ctx.restore();
            drawContactAndDownload();
          };
          logoImg.onerror = () => {
            console.warn('Logo image failed to load for export');
            drawContactAndDownload();
          };
          logoImg.src = logoConfig.logoUrl;
          return;
        }

        drawContactAndDownload();
      };

      img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
    }
  };

  const handleDownloadPDF = () => {
    const element = qrRef.current;
    if (element) {
      setIsGeneratingPDF(true);

      // Create a temporary container for better PDF layout
      const tempContainer = document.createElement('div');
      tempContainer.style.position = 'absolute';
      tempContainer.style.left = '-9999px';
      tempContainer.style.top = '0';
      tempContainer.style.width = exportConfig.orientation === 'landscape' ? '1000px' : '800px';
      tempContainer.style.height = exportConfig.orientation === 'landscape' ? '600px' : '800px';
      tempContainer.style.backgroundColor = cardConfig.cardColor;
      tempContainer.style.padding = '40px';
      tempContainer.style.borderRadius = '20px';
      tempContainer.style.border = cardConfig.cardBorder ? `2px solid ${cardConfig.cardBorder}` : 'none';
      tempContainer.style.display = 'flex';
      tempContainer.style.flexDirection = exportConfig.orientation === 'landscape' ? 'row' : 'column';
      tempContainer.style.alignItems = 'center';
      tempContainer.style.justifyContent = exportConfig.orientation === 'landscape' ? 'space-between' : 'center';
      tempContainer.style.gap = exportConfig.orientation === 'landscape' ? '60px' : '40px';
      tempContainer.style.overflow = 'hidden';
      tempContainer.style.boxShadow = '0 20px 60px rgba(0, 0, 0, 0.1)';
      tempContainer.style.fontFamily = 'Arial, sans-serif';
      tempContainer.style.lineHeight = '1.3';

      // Clone the QR code element
      const qrClone = element.cloneNode(true);
      qrClone.style.width = '300px';
      qrClone.style.height = '300px';
      qrClone.style.display = 'block';
      qrClone.style.margin = '0';
      qrClone.style.padding = '0';

      // Position QR code based on orientation
      if (exportConfig.orientation === 'landscape') {
        if (contactConfig.position === 'top') {
          qrClone.style.order = '2'; // QR code on the right
        } else {
          qrClone.style.order = '1'; // QR code on the left
        }
      }

      // Ensure SVG is properly sized
      const svgElement = qrClone.querySelector('svg');
      if (svgElement) {
        svgElement.style.width = '100%';
        svgElement.style.height = '100%';
        svgElement.setAttribute('width', '300');
        svgElement.setAttribute('height', '300');
      }

      // Add contact information if enabled (without gray background)
      if (user && (contactConfig.showName || contactConfig.showTitle || contactConfig.showEmail || contactConfig.showPhone || contactConfig.showDepartment || contactConfig.showOffice || contactConfig.showCustomText)) {
        const contactDiv = document.createElement('div');
        contactDiv.style.display = 'flex';
        contactDiv.style.flexDirection = exportConfig.orientation === 'landscape' ? 'row' : 'column';
        contactDiv.style.gap = '16px';
        contactDiv.style.textAlign = exportConfig.orientation === 'landscape' ?
          (contactConfig.position === 'top' ? 'left' : 'right') : 'center';
        contactDiv.style.color = contactConfig.textColor;
        contactDiv.style.fontFamily = 'Arial, sans-serif';
        contactDiv.style.background = 'transparent';
        contactDiv.style.margin = '0';
        contactDiv.style.padding = exportConfig.orientation === 'landscape' ? '20px' : '0';
        contactDiv.style.lineHeight = '1.3';

        // Position contact div based on orientation
        if (exportConfig.orientation === 'landscape') {
          if (contactConfig.position === 'top') {
            contactDiv.style.order = '1'; // Contact info on the left
            contactDiv.style.justifyContent = 'flex-start';
          } else {
            contactDiv.style.order = '2'; // Contact info on the right
            contactDiv.style.justifyContent = 'flex-end';
          }
        }

        // Add custom text if enabled
        if (contactConfig.showCustomText && contactConfig.customText) {
          const customTextDiv = document.createElement('div');

          // Set font size based on customTextSize
          const sizeMap = {
            small: '20px',
            medium: '28px',
            large: '36px'
          };
          customTextDiv.style.fontSize = sizeMap[contactConfig.customTextSize] || sizeMap.medium;

          customTextDiv.style.fontWeight = 'bold';
          customTextDiv.style.marginBottom = '12px';
          customTextDiv.style.marginTop = '0';
          customTextDiv.style.lineHeight = '1.2';
          customTextDiv.style.color = contactConfig.customTextColor;
          customTextDiv.style.display = 'inline-block';
          customTextDiv.style.textAlign = 'center';
          customTextDiv.style.width = '100%';

          // Apply styling based on customTextStyle
          switch (contactConfig.customTextStyle) {
            case 'pill':
              customTextDiv.style.padding = '8px 16px';
              customTextDiv.style.backgroundColor = 'rgba(255,255,255,0.9)';
              customTextDiv.style.borderRadius = '25px';
              customTextDiv.style.border = `2px solid ${contactConfig.customTextColor}`;
              customTextDiv.style.display = 'inline-block';
              customTextDiv.style.width = 'auto';
              customTextDiv.style.minWidth = 'fit-content';
              break;
            case 'box':
              customTextDiv.style.padding = '8px 16px';
              customTextDiv.style.backgroundColor = 'rgba(255,255,255,0.9)';
              customTextDiv.style.borderRadius = '8px';
              customTextDiv.style.border = `2px solid ${contactConfig.customTextColor}`;
              customTextDiv.style.display = 'inline-block';
              customTextDiv.style.width = 'auto';
              customTextDiv.style.minWidth = 'fit-content';
              break;
            case 'underline':
              customTextDiv.style.padding = '4px 0';
              customTextDiv.style.borderBottom = `3px solid ${contactConfig.customTextColor}`;
              customTextDiv.style.display = 'inline-block';
              customTextDiv.style.width = 'auto';
              break;
            case 'none':
            default:
              customTextDiv.style.padding = '4px 0';
              customTextDiv.style.display = 'inline-block';
              customTextDiv.style.width = 'auto';
              break;
          }

          customTextDiv.textContent = contactConfig.customText;
          // In portrait center mode, do not append into contact block here
          if (!(exportConfig.orientation !== 'landscape' && contactConfig.customTextPosition === 'center')) {
            contactDiv.appendChild(customTextDiv);
          }
        }

        if ((contactConfig.showName && user.name) || (contactConfig.showTitle && user.title)) {
          const combinedDiv = document.createElement('div');
          combinedDiv.style.fontSize = '28px';
          combinedDiv.style.fontWeight = 'bold';
          combinedDiv.style.marginBottom = '16px';
          combinedDiv.style.marginTop = '0';
          combinedDiv.style.lineHeight = '1.3';

          let text = '';
          if (contactConfig.showTitle && user.title) text += `${user.title} `;
          if (contactConfig.showName && user.name) text += user.name;

          combinedDiv.textContent = text;
          contactDiv.appendChild(combinedDiv);
        }

        if (contactConfig.showDepartment && user.department) {
          const deptDiv = document.createElement('div');
          deptDiv.style.fontSize = '20px';
          deptDiv.style.marginBottom = '16px';
          deptDiv.style.marginTop = '0';
          deptDiv.style.lineHeight = '1.3';
          deptDiv.style.fontWeight = '500';
          deptDiv.textContent = user.department;
          contactDiv.appendChild(deptDiv);
        }

        if (contactConfig.showEmail && user.email) {
          const emailDiv = document.createElement('div');
          emailDiv.style.fontSize = '18px';
          emailDiv.style.marginBottom = '12px';
          emailDiv.style.marginTop = '0';
          emailDiv.style.lineHeight = '1.3';
          emailDiv.style.fontWeight = '400';
          emailDiv.textContent = user.email;
          contactDiv.appendChild(emailDiv);
        }

        if (contactConfig.showPhone && user.phone) {
          const phoneDiv = document.createElement('div');
          phoneDiv.style.fontSize = '18px';
          phoneDiv.style.marginBottom = '12px';
          phoneDiv.style.marginTop = '0';
          phoneDiv.style.lineHeight = '1.3';
          phoneDiv.style.fontWeight = '400';
          phoneDiv.textContent = user.phone;
          contactDiv.appendChild(phoneDiv);
        }

        if (contactConfig.showOffice && user.office) {
          const officeDiv = document.createElement('div');
          officeDiv.style.fontSize = '18px';
          officeDiv.style.marginBottom = '12px';
          officeDiv.style.marginTop = '0';
          officeDiv.style.lineHeight = '1.3';
          officeDiv.style.fontWeight = '400';
          officeDiv.textContent = `Ofis: ${user.office}`;
          contactDiv.appendChild(officeDiv);
        }

        // Add App Name
        if (contactConfig.showAppName && contactConfig.appName) {
          const appNameDiv = document.createElement('div');
          appNameDiv.style.fontSize = '24px';
          appNameDiv.style.fontWeight = 'bold';
          appNameDiv.style.marginTop = '16px';
          appNameDiv.style.marginBottom = '0';
          appNameDiv.style.lineHeight = '1.3';
          appNameDiv.style.color = qrConfig.fgColor;
          appNameDiv.textContent = contactConfig.appName;
          contactDiv.appendChild(appNameDiv);
        }

        // Add custom text based on customTextPosition
        if (contactConfig.showCustomText && contactConfig.customText) {
          const customTextDiv = document.createElement('div');

          // Set font size based on customTextSize
          const sizeMap = {
            small: '20px',
            medium: '28px',
            large: '36px'
          };
          customTextDiv.style.fontSize = sizeMap[contactConfig.customTextSize] || sizeMap.medium;

          customTextDiv.style.fontWeight = 'bold';
          customTextDiv.style.marginBottom = '12px';
          customTextDiv.style.marginTop = '0';
          customTextDiv.style.lineHeight = '1.2';
          customTextDiv.style.color = contactConfig.customTextColor;
          customTextDiv.style.display = 'inline-block';
          customTextDiv.style.textAlign = 'center';
          customTextDiv.style.width = '100%';

          // Apply styling based on customTextStyle
          switch (contactConfig.customTextStyle) {
            case 'pill':
              customTextDiv.style.padding = '8px 16px';
              customTextDiv.style.backgroundColor = 'rgba(255,255,255,0.9)';
              customTextDiv.style.borderRadius = '25px';
              customTextDiv.style.border = `2px solid ${contactConfig.customTextColor}`;
              break;
            case 'box':
              customTextDiv.style.padding = '8px 16px';
              customTextDiv.style.backgroundColor = 'rgba(255,255,255,0.9)';
              customTextDiv.style.borderRadius = '8px';
              customTextDiv.style.border = `2px solid ${contactConfig.customTextColor}`;
              break;
            case 'underline':
              customTextDiv.style.padding = '4px 0';
              customTextDiv.style.borderBottom = `3px solid ${contactConfig.customTextColor}`;
              break;
            case 'none':
            default:
              customTextDiv.style.padding = '4px 0';
              break;
          }

          customTextDiv.textContent = contactConfig.customText;

          // Position custom text based on customTextPosition
          switch (contactConfig.customTextPosition) {
            case 'above':
              tempContainer.insertBefore(customTextDiv, tempContainer.firstChild);
              break;
            case 'below':
              tempContainer.appendChild(customTextDiv);
              break;
            case 'center':
              if (exportConfig.orientation !== 'landscape') {
                if (contactConfig.position === 'top') {
                  tempContainer.appendChild(contactDiv);
                  tempContainer.appendChild(customTextDiv);
                  tempContainer.appendChild(qrClone);
                } else {
                  tempContainer.appendChild(qrClone);
                  tempContainer.appendChild(customTextDiv);
                  tempContainer.appendChild(contactDiv);
                }
              }
              break;
            // left/right removed
          }
        } else {
          // Add contact info and QR code based on position
          if (contactConfig.position === 'top') {
            tempContainer.appendChild(contactDiv);
            tempContainer.appendChild(qrClone);
          } else {
            tempContainer.appendChild(qrClone);
            tempContainer.appendChild(contactDiv);
          }
        }
      } else {
        // Only QR code
        tempContainer.appendChild(qrClone);
      }

      document.body.appendChild(tempContainer);

      // Convert to canvas and then to PDF
      html2canvas(tempContainer, {
        scale: 3, // Higher scale for better quality
        backgroundColor: cardConfig.cardColor,
        width: 800,
        height: 600,
        useCORS: true,
        allowTaint: true,
        logging: false,
        imageTimeout: 15000,
        removeContainer: true
      }).then(canvas => {
        document.body.removeChild(tempContainer);

        const imgData = canvas.toDataURL('image/png', 1.0);

        // Determine PDF size and orientation
        let pdfSize = 'a4';
        let pdfOrientation = 'p'; // portrait

        if (exportConfig.size === 'A5') {
          pdfSize = 'a5';
        }

        if (exportConfig.orientation === 'landscape') {
          pdfOrientation = 'l';
        }

        const pdf = new jsPDF(pdfOrientation, 'mm', pdfSize);
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();

        // Calculate image dimensions to fit the page with proper margins
        const margin = 15; // 15mm margin on each side
        const imgWidth = pageWidth - (margin * 2);
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        // Check if image height exceeds page height
        let finalImgHeight = imgHeight;
        let finalImgWidth = imgWidth;

        if (imgHeight > (pageHeight - (margin * 2))) {
          finalImgHeight = pageHeight - (margin * 2);
          finalImgWidth = (canvas.width * finalImgHeight) / canvas.height;
        }

        // Center the image on the page
        const x = (pageWidth - finalImgWidth) / 2;
        const y = (pageHeight - finalImgHeight) / 2;

        pdf.addImage(imgData, 'PNG', x, y, finalImgWidth, finalImgHeight);

        // Add footer with timestamp
        const timestamp = new Date().toLocaleString('tr-TR');
        pdf.setFontSize(8);
        pdf.setTextColor(100, 100, 100);
        pdf.text(`Oluşturulma Tarihi: ${timestamp}`, margin, pageHeight - margin);
        pdf.text('Qrnnect - Randevu Sistemi', pageWidth - margin, pageHeight - margin, { align: 'right' });

        pdf.save(`qr-code-${user?.name || 'faculty'}-${exportConfig.size.toLowerCase()}.pdf`);
        setIsGeneratingPDF(false);
      }).catch(error => {
        console.error('PDF generation error:', error);
        if (document.body.contains(tempContainer)) {
          document.body.removeChild(tempContainer);
        }
        setIsGeneratingPDF(false);
        alert('PDF oluşturulurken hata oluştu. Lütfen tekrar deneyin.');
      });
    }
  };

  const handleLogoUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setLogoConfig(prev => ({
          ...prev,
          logoUrl: e.target.result,
          showLogo: true,
          logoType: 'custom'
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePresetLogoSelect = (logoUrl) => {
    setLogoConfig(prev => ({
      ...prev,
      logoUrl: logoUrl,
      showLogo: true,
      logoType: 'preset'
    }));
  };

  const getCustomTextStyle = () => {
    const baseStyle = {
      fontWeight: 'bold',
      color: contactConfig.customTextColor,
      textShadow: '0 1px 2px rgba(0,0,0,0.1)',
      textAlign: 'center',
      margin: '8px 0'
    };

    // Size variations
    const sizeMap = {
      small: contactConfig.fontSize + 2,
      medium: contactConfig.fontSize + 6,
      large: contactConfig.fontSize + 10
    };
    baseStyle.fontSize = `${sizeMap[contactConfig.customTextSize]}px`;

    // Style variations
    switch (contactConfig.customTextStyle) {
      case 'pill':
        return {
          ...baseStyle,
          padding: '8px 16px',
          backgroundColor: 'rgba(255,255,255,0.9)',
          borderRadius: '25px',
          border: `2px solid ${contactConfig.customTextColor}`,
          display: 'inline-block'
        };
      case 'box':
        return {
          ...baseStyle,
          padding: '8px 16px',
          backgroundColor: 'rgba(255,255,255,0.9)',
          borderRadius: '8px',
          border: `2px solid ${contactConfig.customTextColor}`,
          display: 'inline-block'
        };
      case 'underline':
        return {
          ...baseStyle,
          padding: '4px 0',
          borderBottom: `3px solid ${contactConfig.customTextColor}`,
          display: 'inline-block'
        };
      case 'none':
      default:
        return {
          ...baseStyle,
          padding: '4px 0'
        };
    }
  };

  const applyColorScheme = (scheme) => {
    setQrConfig(prev => ({
      ...prev,
      bgColor: scheme.bg,
      fgColor: scheme.fg
    }));
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3 className={styles.title}>
          <PaintBrushIcon className="h-6 w-6" />
          QR Kod Tasarım Editörü
        </h3>
        <button
          onClick={() => setPreviewMode(!previewMode)}
          className={styles.previewButton}
        >
          {previewMode ? <EyeSlashIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
          {previewMode ? 'Düzenle' : 'Önizle'}
        </button>
      </div>

      <div className={styles.grid} style={{ gridTemplateColumns: qrConfig.size > 352 ? '1fr' : undefined }}>
        {/* QR Code Preview */}
        <div className={styles.previewSection}>
          <div ref={previewCardRef} className={styles.qrPreview} style={{
            backgroundColor: cardConfig.cardColor,
            padding: cardConfig.cardPadding,
            borderRadius: '20px',
            border: cardConfig.cardBorder ? `2px solid ${cardConfig.cardBorder}` : 'none',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
            position: 'relative',
            overflow: 'hidden',
            ...(isLogolu && { ['--qr-bg-color']: qrConfig.bgColor })
          }}>


            {/* Contact Information Preview */}
            {user && (contactConfig.showName || contactConfig.showTitle || contactConfig.showEmail || contactConfig.showPhone || contactConfig.showDepartment || contactConfig.showOffice || contactConfig.showCustomText) && (
              <div style={{
                display: 'flex',
                flexDirection: exportConfig.orientation === 'landscape' ? 'row' : 'column',
                alignItems: 'center',
                gap: '20px',
                marginBottom: '20px',
                width: '100%'
              }}>
                {/* Custom Text positioning (portrait: wrapper-level; landscape handled inside contact block) */}
                {exportConfig.orientation !== 'landscape' && contactConfig.showCustomText && contactConfig.customText && contactConfig.customTextPosition === 'above' && (
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                    textAlign: 'center',
                    width: '100%'
                  }}>
                    <div style={getCustomTextStyle()}>
                      {contactConfig.customText}
                    </div>
                  </div>
                )}

                {/* Left custom text removed */}

                {contactConfig.position === 'top' && (
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                    textAlign: 'center',
                    color: contactConfig.textColor,
                    background: 'transparent'
                  }}>
                    {/* Landscape: render custom text inside this block at top */}
                    {exportConfig.orientation === 'landscape' && contactConfig.showCustomText && contactConfig.customText && contactConfig.customTextPosition === 'above' && (
                      <div style={getCustomTextStyle()}>
                        {contactConfig.customText}
                      </div>
                    )}
                    {contactConfig.showName && user.name && (
                      <div style={{ fontSize: `${contactConfig.fontSize + 4}px`, fontWeight: 'bold' }}>
                        {user.name}
                      </div>
                    )}

                    {contactConfig.showTitle && user.title && (
                      <div style={{ fontSize: `${contactConfig.fontSize}px` }}>
                        {user.title}
                      </div>
                    )}

                    {contactConfig.showDepartment && user.department && (
                      <div style={{ fontSize: `${contactConfig.fontSize}px` }}>
                        {user.department}
                      </div>
                    )}

                    {contactConfig.showEmail && user.email && (
                      <div style={{ fontSize: `${contactConfig.fontSize}px` }}>
                        {user.email}
                      </div>
                    )}

                    {contactConfig.showPhone && user.phone && (
                      <div style={{ fontSize: `${contactConfig.fontSize}px` }}>
                        {user.phone}
                      </div>
                    )}

                    {contactConfig.showOffice && user.office && (
                      <div style={{ fontSize: `${contactConfig.fontSize}px` }}>
                        Ofis: {user.office}
                      </div>
                    )}

                    {/* App Name */}
                    {contactConfig.showAppName && contactConfig.appName && (
                      <div style={{
                        fontSize: `${contactConfig.fontSize + 8}px`,
                        fontWeight: 'bold',
                        marginTop: '8px',
                        color: qrConfig.fgColor
                      }}>
                        {contactConfig.appName}
                      </div>
                    )}
                    {/* Landscape: render custom text inside this block at bottom */}
                    {exportConfig.orientation === 'landscape' && contactConfig.showCustomText && contactConfig.customText && contactConfig.customTextPosition === 'below' && (
                      <div style={getCustomTextStyle()}>
                        {contactConfig.customText}
                      </div>
                    )}
                  </div>
                )}

                {/* Portrait center: render between contact block (top) and QR */}
                {exportConfig.orientation !== 'landscape' && contactConfig.showCustomText && contactConfig.customText && contactConfig.customTextPosition === 'center' && contactConfig.position === 'top' && (
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                    textAlign: 'center',
                    width: '100%'
                  }}>
                    <div style={getCustomTextStyle()}>
                      {contactConfig.customText}
                    </div>
                  </div>
                )}

                <div
                  ref={qrRef}
                  className={styles.qrCodeWrapper}
                  style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    position: 'relative',
                    width: qrConfig.size,
                    height: qrConfig.size,
                    ...(isLogolu && {
                      ['--logo-area-bg']: qrConfig.bgColor,
                      backgroundColor: qrConfig.bgColor
                    })
                  }}
                >
                  <QRCodeSVG
                    value={value}
                    size={qrConfig.size}
                    level={eccLevel}
                    bgColor={qrConfig.bgColor}
                    fgColor={qrConfig.fgColor}
                    includeMargin={qrConfig.includeMargin}
                    marginSize={isLogolu ? 2 : qrConfig.marginSize}
                    imageSettings={isLogolu ? {
                      src: TRANSPARENT_PIXEL,
                      height: effectiveLogoSize,
                      width: effectiveLogoSize,
                      excavate: true,
                      crossOrigin: 'anonymous'
                    } : undefined}
                  />
                  {isLogolu && (
                    <div
                      key={`logo-area-${logoConfig.logoBgColor || qrConfig.bgColor}`}
                      className={`${logoConfig.logoShape === 'round' ? styles.logoAreaRound : styles.logoAreaSquare} ${styles.logoAreaBg}`}
                      style={{
                        ['--logo-area-bg']: logoConfig.logoBgColor || qrConfig.bgColor,
                        position: 'absolute',
                        left: '50%',
                        top: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: effectiveLogoSize * 1.35,
                        height: effectiveLogoSize * 1.35,
                        backgroundColor: logoConfig.logoBgColor || qrConfig.bgColor,
                        zIndex: 10,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        overflow: 'hidden',
                        boxShadow: `0 0 0 6px ${logoConfig.logoBgColor || qrConfig.bgColor}`
                      }}
                    >
                      <img
                        src={logoConfig.logoUrl}
                        alt="Logo"
                        data-logo-overlay
                        className={logoConfig.logoShape === 'round' ? styles.logoImageRound : styles.logoImageSquare}
                        style={{
                          width: '85%',
                          height: '85%',
                          objectFit: 'contain',
                          opacity: logoConfig.logoOpacity,
                          position: 'relative',
                          zIndex: 20
                        }}
                        crossOrigin="anonymous"
                      />
                    </div>
                  )}
                </div>

                {/* Portrait center: render between QR and contact block (bottom) */}
                {exportConfig.orientation !== 'landscape' && contactConfig.showCustomText && contactConfig.customText && contactConfig.customTextPosition === 'center' && contactConfig.position === 'bottom' && (
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                    textAlign: 'center',
                    width: '100%'
                  }}>
                    <div style={getCustomTextStyle()}>
                      {contactConfig.customText}
                    </div>
                  </div>
                )}

                {/* Right custom text removed */}

                {contactConfig.position === 'bottom' && (
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                    textAlign: 'center',
                    color: contactConfig.textColor,
                    background: 'transparent'
                  }}>
                    {/* Landscape: render custom text inside this block at top */}
                    {exportConfig.orientation === 'landscape' && contactConfig.showCustomText && contactConfig.customText && contactConfig.customTextPosition === 'above' && (
                      <div style={getCustomTextStyle()}>
                        {contactConfig.customText}
                      </div>
                    )}
                    {(contactConfig.showName && user.name || contactConfig.showTitle && user.title) && (
                      <div style={{ fontSize: `${contactConfig.fontSize + 4}px`, fontWeight: 'bold' }}>
                        {contactConfig.showTitle && user.title ? `${user.title} ` : ''}{contactConfig.showName && user.name ? user.name : ''}
                      </div>
                    )}

                    {contactConfig.showDepartment && user.department && (
                      <div style={{ fontSize: `${contactConfig.fontSize}px` }}>
                        {user.department}
                      </div>
                    )}

                    {contactConfig.showEmail && user.email && (
                      <div style={{ fontSize: `${contactConfig.fontSize}px` }}>
                        {user.email}
                      </div>
                    )}

                    {contactConfig.showPhone && user.phone && (
                      <div style={{ fontSize: `${contactConfig.fontSize}px` }}>
                        {user.phone}
                      </div>
                    )}

                    {contactConfig.showOffice && user.office && (
                      <div style={{ fontSize: `${contactConfig.fontSize}px` }}>
                        Ofis: {user.office}
                      </div>
                    )}

                    {/* App Name */}
                    {contactConfig.showAppName && contactConfig.appName && (
                      <div style={{
                        fontSize: `${contactConfig.fontSize + 8}px`,
                        fontWeight: 'bold',
                        marginTop: '8px',
                        color: qrConfig.fgColor
                      }}>
                        {contactConfig.appName}
                      </div>
                    )}
                    {/* Landscape: render custom text inside this block at bottom */}
                    {exportConfig.orientation === 'landscape' && contactConfig.showCustomText && contactConfig.customText && contactConfig.customTextPosition === 'below' && (
                      <div style={getCustomTextStyle()}>
                        {contactConfig.customText}
                      </div>
                    )}
                  </div>
                )}

                {/* Custom Text positioning (portrait: wrapper-level; landscape handled inside contact block) */}
                {exportConfig.orientation !== 'landscape' && contactConfig.showCustomText && contactConfig.customText && contactConfig.customTextPosition === 'below' && (
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                    textAlign: 'center',
                    width: '100%'
                  }}>
                    <div style={getCustomTextStyle()}>
                      {contactConfig.customText}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <button
            onClick={handleDownloadQR}
            className={styles.downloadButton}
            disabled={isGeneratingPDF}
          >
            {isGeneratingPDF ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                PDF Oluşturuluyor...
              </>
            ) : (
              <>
                <ArrowDownTrayIcon className="h-4 w-4" />
                {exportConfig.format.toUpperCase()} İndir ({exportConfig.size} - {exportConfig.orientation === 'portrait' ? 'Dikey' : 'Yatay'})
              </>
            )}
          </button>
        </div>

        {/* Configuration Panel */}
        {!previewMode && (
          <div className={styles.configPanel}>
            {/* Color Schemes */}
            <div className={styles.section}>
              <label className={styles.sectionTitle}>
                <SwatchIcon className="h-4 w-4" />
                Renk Şemaları
              </label>
              <div className={styles.colorSchemes}>
                {colorSchemes.map((scheme, index) => (
                  <button
                    key={index}
                    onClick={() => applyColorScheme(scheme)}
                    className={styles.colorSchemeButton}
                    title={scheme.name}
                  >
                    <div
                      className={styles.colorPreview}
                      style={{
                        backgroundColor: scheme.bg,
                        borderColor: scheme.fg
                      }}
                    >
                      <div
                        className={styles.colorPreviewInner}
                        style={{ backgroundColor: scheme.fg }}
                      />
                    </div>
                    <div className={styles.schemeName}>{scheme.name}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Contact Information Configuration */}
            <div className={styles.divider}>
              <h4 className={styles.sectionTitle}>
                <UserIcon className="h-5 w-5" />
                İletişim Bilgileri
              </h4>

              <div className={styles.section}>
                <div className={styles.inputGroup}>
                  <label className={styles.label}>İletişim Bilgilerinin Konumu</label>
                  <select
                    value={contactConfig.position}
                    onChange={(e) => setContactConfig(prev => ({ ...prev, position: e.target.value }))}
                    className={styles.selectInput}
                  >
                    <option value="top">QR Kodun Üstünde</option>
                    <option value="bottom">QR Kodun Altında</option>
                  </select>
                </div>

                <div className={styles.checkboxGroup}>
                  <input
                    type="checkbox"
                    id="showName"
                    checked={contactConfig.showName}
                    onChange={(e) => setContactConfig(prev => ({ ...prev, showName: e.target.checked }))}
                    className={styles.checkbox}
                  />
                  <label htmlFor="showName" className={styles.checkboxLabel}>
                    Ad Soyad
                  </label>
                </div>

                <div className={styles.checkboxGroup}>
                  <input
                    type="checkbox"
                    id="showTitle"
                    checked={contactConfig.showTitle}
                    onChange={(e) => setContactConfig(prev => ({ ...prev, showTitle: e.target.checked }))}
                    className={styles.checkbox}
                  />
                  <label htmlFor="showTitle" className={styles.checkboxLabel}>
                    Ünvan
                  </label>
                </div>

                <div className={styles.checkboxGroup}>
                  <input
                    type="checkbox"
                    id="showDepartment"
                    checked={contactConfig.showDepartment}
                    onChange={(e) => setContactConfig(prev => ({ ...prev, showDepartment: e.target.checked }))}
                    className={styles.checkbox}
                  />
                  <label htmlFor="showDepartment" className={styles.checkboxLabel}>
                    Bölüm
                  </label>
                </div>

                <div className={styles.checkboxGroup}>
                  <input
                    type="checkbox"
                    id="showEmail"
                    checked={contactConfig.showEmail}
                    onChange={(e) => setContactConfig(prev => ({ ...prev, showEmail: e.target.checked }))}
                    className={styles.checkbox}
                  />
                  <label htmlFor="showEmail" className={styles.checkboxLabel}>
                    E-posta
                  </label>
                </div>

                <div className={styles.checkboxGroup}>
                  <input
                    type="checkbox"
                    id="showPhone"
                    checked={contactConfig.showPhone}
                    onChange={(e) => setContactConfig(prev => ({ ...prev, showPhone: e.target.checked }))}
                    className={styles.checkbox}
                  />
                  <label htmlFor="showPhone" className={styles.checkboxLabel}>
                    Telefon
                  </label>
                </div>

                <div className={styles.checkboxGroup}>
                  <input
                    type="checkbox"
                    id="showOffice"
                    checked={contactConfig.showOffice}
                    onChange={(e) => setContactConfig(prev => ({ ...prev, showOffice: e.target.checked }))}
                    className={styles.checkbox}
                  />
                  <label htmlFor="showOffice" className={styles.checkboxLabel}>
                    Ofis
                  </label>
                </div>

                {/* Custom Text Configuration */}
                <div className={styles.divider} style={{ marginTop: '20px', marginBottom: '15px' }}>
                  <h5 style={{ fontSize: '14px', fontWeight: '600', color: '#374151', margin: '0 0 10px 0' }}>
                    Özel Metin
                  </h5>
                </div>

                <div className={styles.checkboxGroup}>
                  <input
                    type="checkbox"
                    id="showCustomText"
                    checked={contactConfig.showCustomText}
                    onChange={(e) => setContactConfig(prev => ({ ...prev, showCustomText: e.target.checked }))}
                    className={styles.checkbox}
                  />
                  <label htmlFor="showCustomText" className={styles.checkboxLabel}>
                    Özel Metin Göster
                  </label>
                </div>

                {contactConfig.showCustomText && (
                  <>
                    <div className={styles.inputGroup}>
                      <label className={styles.label}>Özel Metin</label>
                      <input
                        type="text"
                        value={contactConfig.customText}
                        onChange={(e) => setContactConfig(prev => ({ ...prev, customText: e.target.value }))}
                        placeholder="Örn: Scan me, Tıkla, Randevu al..."
                        className={styles.textInput}
                      />
                    </div>

                    <div className={styles.inputGroup}>
                      <label className={styles.label}>Metin Konumu</label>
                      <select
                        value={contactConfig.customTextPosition}
                        onChange={(e) => setContactConfig(prev => ({ ...prev, customTextPosition: e.target.value }))}
                        className={styles.selectInput}
                      >
                        <option value="above">Üstte</option>
                        {exportConfig.orientation !== 'landscape' && <option value="center">Ortada</option>}
                        <option value="below">Altta</option>
                        {/* Left/Right options removed */}
                      </select>
                    </div>

                    <div className={styles.inputGroup}>
                      <label className={styles.label}>Metin Stili</label>
                      <select
                        value={contactConfig.customTextStyle}
                        onChange={(e) => setContactConfig(prev => ({ ...prev, customTextStyle: e.target.value }))}
                        className={styles.selectInput}
                      >
                        <option value="pill">Yuvarlak</option>
                        <option value="box">Kutu</option>
                        <option value="underline">Altı Çizili</option>
                        <option value="none">Yok</option>
                      </select>
                    </div>

                    <div className={styles.inputGroup}>
                      <label className={styles.label}>Metin Boyutu</label>
                      <select
                        value={contactConfig.customTextSize}
                        onChange={(e) => setContactConfig(prev => ({ ...prev, customTextSize: e.target.value }))}
                        className={styles.selectInput}
                      >
                        <option value="small">Küçük</option>
                        <option value="medium">Orta</option>
                        <option value="large">Büyük</option>
                      </select>
                    </div>

                    <div className={styles.inputGroup}>
                      <label className={styles.label}>Metin Rengi</label>
                      <input
                        type="color"
                        value={contactConfig.customTextColor}
                        onChange={(e) => setContactConfig(prev => ({ ...prev, customTextColor: e.target.value }))}
                        className={styles.colorInput}
                      />
                    </div>
                  </>
                )}

                {/* App Name Configuration */}
                <div className={styles.divider} style={{ marginTop: '20px', marginBottom: '15px' }}>
                  <h5 style={{ fontSize: '14px', fontWeight: '600', color: '#374151', margin: '0 0 10px 0' }}>
                    Uygulama Adı
                  </h5>
                </div>

                <div className={styles.checkboxGroup}>
                  <input
                    type="checkbox"
                    id="showAppName"
                    checked={contactConfig.showAppName}
                    onChange={(e) => setContactConfig(prev => ({ ...prev, showAppName: e.target.checked }))}
                    className={styles.checkbox}
                  />
                  <label htmlFor="showAppName" className={styles.checkboxLabel}>
                    Uygulama Adını Göster
                  </label>
                </div>

                {contactConfig.showAppName && (
                  <div className={styles.inputGroup}>
                    <label className={styles.label}>Uygulama Adı</label>
                    <input
                      type="text"
                      value={contactConfig.appName}
                      onChange={(e) => setContactConfig(prev => ({ ...prev, appName: e.target.value }))}
                      placeholder="Örn: Qrnnect"
                      className={styles.textInput}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Export Configuration */}
            <div className={styles.divider}>
              <h4 className={styles.sectionTitle}>
                <DocumentArrowDownIcon className="h-5 w-5" />
                İndirme Seçenekleri
              </h4>

              <div className={styles.section}>
                <div className={styles.inputGroup}>
                  <label className={styles.label}>Format</label>
                  <select
                    value={exportConfig.format}
                    onChange={(e) => setExportConfig(prev => ({ ...prev, format: e.target.value }))}
                    className={styles.selectInput}
                  >
                    <option value="png">PNG</option>
                    <option value="pdf">PDF</option>
                  </select>
                </div>

                <div className={styles.inputGroup}>
                  <label className={styles.label}>Boyut</label>
                  <select
                    value={exportConfig.size}
                    onChange={(e) => setExportConfig(prev => ({ ...prev, size: e.target.value }))}
                    className={styles.selectInput}
                  >
                    <option value="A4">A4</option>
                    <option value="A5">A5</option>
                  </select>
                </div>

                <div className={styles.inputGroup}>
                  <label className={styles.label}>Oryantasyon</label>
                  <select
                    value={exportConfig.orientation}
                    onChange={(e) => setExportConfig(prev => ({ ...prev, orientation: e.target.value }))}
                    className={styles.selectInput}
                  >
                    <option value="portrait">Dikey</option>
                    <option value="landscape">Yatay</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Size Configuration */}
            <div className={styles.section}>
              <label className={styles.sectionTitle}>
                <Cog6ToothIcon className="h-4 w-4" />
                QR Kod Boyutu
              </label>
              <div className={styles.inputGroup}>
                <input
                  type="range"
                  min="128"
                  max="512"
                  step="32"
                  value={qrConfig.size}
                  onChange={(e) => setQrConfig(prev => ({ ...prev, size: parseInt(e.target.value) }))}
                  className={styles.rangeInput}
                />
                <div className={styles.valueText}>
                  {qrConfig.size} x {qrConfig.size} piksel
                </div>
              </div>
            </div>

            {/* Custom Color Configuration */}
            <div className={styles.section}>
              <div className={styles.grid} style={{ gridTemplateColumns: '1fr 1fr' }}>
                <div className={styles.inputGroup}>
                  <label className={styles.label}>Arka Plan Rengi</label>
                  <input
                    type="color"
                    value={qrConfig.bgColor}
                    onChange={(e) => setQrConfig(prev => ({ ...prev, bgColor: e.target.value }))}
                    className={styles.colorInput}
                  />
                </div>
                <div className={styles.inputGroup}>
                  <label className={styles.label}>QR Kod Rengi</label>
                  <input
                    type="color"
                    value={qrConfig.fgColor}
                    onChange={(e) => setQrConfig(prev => ({ ...prev, fgColor: e.target.value }))}
                    className={styles.colorInput}
                  />
                </div>
              </div>
            </div>

            {/* Card Configuration */}
            <div className={styles.divider}>
              <h4 className={styles.sectionTitle}>
                <PencilIcon className="h-5 w-5" />
                Kart Tasarımı
              </h4>

              <div className={styles.section}>
                <div className={styles.checkboxGroup}>
                  <input
                    type="checkbox"
                    id="showCard"
                    checked={cardConfig.showCard}
                    onChange={(e) => setCardConfig(prev => ({ ...prev, showCard: e.target.checked }))}
                    className={styles.checkbox}
                  />
                  <label htmlFor="showCard" className={styles.checkboxLabel}>
                    Kart arka planı göster
                  </label>
                </div>

                {cardConfig.showCard && (
                  <>
                    <div className={styles.inputGroup}>
                      <label className={styles.label}>Kart Rengi</label>
                      <input
                        type="color"
                        value={cardConfig.cardColor}
                        onChange={(e) => setCardConfig(prev => ({ ...prev, cardColor: e.target.value }))}
                        className={styles.colorInput}
                      />
                    </div>

                    <div className={styles.inputGroup}>
                      <label className={styles.label}>Kenarlık Rengi</label>
                      <input
                        type="color"
                        value={cardConfig.cardBorder}
                        onChange={(e) => setCardConfig(prev => ({ ...prev, cardBorder: e.target.value }))}
                        className={styles.colorInput}
                      />
                    </div>

                    <div className={styles.inputGroup}>
                      <label className={styles.label}>Kart Dolgusu</label>
                      <input
                        type="range"
                        min="10"
                        max="40"
                        step="5"
                        value={cardConfig.cardPadding}
                        onChange={(e) => setCardConfig(prev => ({ ...prev, cardPadding: parseInt(e.target.value) }))}
                        className={styles.rangeInput}
                      />
                      <div className={styles.valueText}>
                        {cardConfig.cardPadding}px dolgu
                      </div>
                    </div>

                    <div className={styles.checkboxGroup}>
                      <input
                        type="checkbox"
                        id="cardShadow"
                        checked={cardConfig.cardShadow}
                        onChange={(e) => setCardConfig(prev => ({ ...prev, cardShadow: e.target.checked }))}
                        className={styles.checkbox}
                      />
                      <label htmlFor="cardShadow" className={styles.checkboxLabel}>
                        Gölge efekti
                      </label>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Error Correction Level - Logolu modda otomatik H */}
            <div className={styles.section}>
              <label className={styles.label}>Hata Düzeltme Seviyesi {isLogolu && '(Logolu: H)'}</label>
              <select
                value={eccLevel}
                onChange={(e) => !isLogolu && setQrConfig(prev => ({ ...prev, level: e.target.value }))}
                className={styles.selectInput}
                disabled={isLogolu}
              >
                <option value="L">Düşük (7%)</option>
                <option value="M">Orta (15%)</option>
                <option value="Q">Yüksek (25%)</option>
                <option value="H">En Yüksek (30%)</option>
              </select>
            </div>

            {/* Logo Configuration - Logosuz (standart) | Logolu (excavate + ECC H) */}
            <div className={styles.divider}>
              <h4 className={styles.sectionTitle}>
                <PhotoIcon className="h-5 w-5" />
                Logo Ayarları
              </h4>
              {isLogolu && (
                <p style={{ fontSize: '0.75rem', margin: '0 0 0.5rem 0', color: '#6b7280' }}>
                  ✓ Logolu: Merkez excavate, ECC H — tarayıcılar için optimize
                </p>
              )}
              <div className={styles.section}>
                <div className={styles.checkboxGroup}>
                  <input
                    type="checkbox"
                    id="showLogo"
                    checked={logoConfig.showLogo}
                    onChange={(e) => setLogoConfig(prev => ({ ...prev, showLogo: e.target.checked }))}
                    className={styles.checkbox}
                  />
                  <label htmlFor="showLogo" className={styles.checkboxLabel}>
                    Logo Göster
                  </label>
                </div>

                {logoConfig.showLogo && (
                  <>
                    <div className={styles.inputGroup}>
                      <label className={styles.label}>Logo Tipi</label>
                      <div className={styles.checkboxGroup}>
                        <input
                          type="radio"
                          id="logoCustom"
                          name="logoType"
                          checked={logoConfig.logoType === 'custom'}
                          onChange={() => setLogoConfig(prev => ({
                            ...prev,
                            logoType: 'custom',
                            logoUrl: '' // Clear logo when switching types
                          }))}
                          className={styles.radio}
                        />
                        <label htmlFor="logoCustom" className={styles.checkboxLabel}>
                          Kendi Logom
                        </label>

                        <input
                          type="radio"
                          id="logoPreset"
                          name="logoType"
                          checked={logoConfig.logoType === 'preset'}
                          onChange={() => setLogoConfig(prev => ({
                            ...prev,
                            logoType: 'preset',
                            logoUrl: '' // Clear logo when switching types
                          }))}
                          className={styles.radio}
                        />
                        <label htmlFor="logoPreset" className={styles.checkboxLabel}>
                          Hazır Logo
                        </label>
                      </div>
                    </div>

                    {logoConfig.logoType === 'custom' ? (
                      <>
                        <div className={styles.inputGroup}>
                          <label className={styles.label}>Logo Yükle</label>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleLogoUpload}
                            className={styles.fileInput}
                          />
                        </div>

                        {logoConfig.logoUrl && (
                          <div className={styles.logoPreview}>
                            <img
                              src={logoConfig.logoUrl}
                              alt="Logo Preview"
                              style={{
                                width: '60px',
                                height: '60px',
                                objectFit: 'contain',
                                border: '1px solid #e5e7eb',
                                borderRadius: '8px'
                              }}
                            />
                            <div className={styles.logoInfo}>
                              <span className={styles.logoType}>
                                {logoConfig.logoType === 'preset' ? 'Hazır Logo' : 'Kendi Logom'}
                              </span>
                              {logoConfig.logoType === 'preset' && (
                                <span className={styles.logoName}>
                                  {presetLogos.find(logo => logo.url === logoConfig.logoUrl)?.name || 'Bilinmeyen Logo'}
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className={styles.inputGroup}>
                        <label className={styles.label}>Hazır Logo Seç</label>
                        <div className={styles.presetLogos}>
                          {presetLogos.map((logo) => (
                            <button
                              key={logo.id}
                              onClick={() => handlePresetLogoSelect(logo.url)}
                              className={`${styles.presetLogoButton} ${logoConfig.logoUrl === logo.url ? styles.presetLogoButtonActive : ''}`}
                              title={logo.name}
                            >
                              <div className={styles.presetLogoPreview} style={logo.previewBg ? { background: logo.previewBg } : {}}>
                                <img
                                  src={logo.url}
                                  alt={logo.name}
                                  className={styles.presetLogoImage}
                                />
                              </div>
                              <span className={styles.presetLogoName}>{logo.name}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className={styles.inputGroup}>
                      <label className={styles.label}>Logo Boyutu (max: {logoSizeCap}px)</label>
                      <input
                        type="range"
                        min="20"
                        max={Math.max(20, logoSizeCap)}
                        value={Math.min(logoConfig.logoSize, logoSizeCap)}
                        onChange={(e) => setLogoConfig(prev => ({ ...prev, logoSize: Math.min(parseInt(e.target.value), logoSizeCap) }))}
                        className={styles.rangeInput}
                      />
                      <span className={styles.rangeValue}>{logoConfig.logoSize}px</span>
                    </div>

                    <div className={styles.inputGroup}>
                      <label className={styles.label}>Logo Şeffaflığı</label>
                      <input
                        type="range"
                        min="0.1"
                        max="1"
                        step="0.1"
                        value={logoConfig.logoOpacity}
                        onChange={(e) => setLogoConfig(prev => ({ ...prev, logoOpacity: parseFloat(e.target.value) }))}
                        className={styles.rangeInput}
                      />
                      <span className={styles.rangeValue}>{Math.round(logoConfig.logoOpacity * 100)}%</span>
                    </div>

                    <div className={styles.inputGroup}>
                      <label className={styles.label}>Ayrılan alan şekli</label>
                      <div className={styles.toggleButtonGroup}>
                        <button
                          type="button"
                          onClick={() => setLogoConfig(prev => ({ ...prev, logoShape: 'round' }))}
                          className={`${styles.toggleButton} ${logoConfig.logoShape === 'round' ? styles.toggleButtonActive : ''}`}
                        >
                          <span className={styles.toggleIcon}>⭕</span>
                          Yuvarlak
                        </button>
                        <button
                          type="button"
                          onClick={() => setLogoConfig(prev => ({ ...prev, logoShape: 'square' }))}
                          className={`${styles.toggleButton} ${logoConfig.logoShape === 'square' ? styles.toggleButtonActive : ''}`}
                        >
                          <span className={styles.toggleIcon}>⬜</span>
                          Kare
                        </button>
                      </div>
                    </div>

                    <div className={styles.inputGroup}>
                      <label className={styles.label}>Logo Arkaplan Rengi</label>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <input
                          type="color"
                          value={logoConfig.logoBgColor || qrConfig.bgColor}
                          onChange={(e) => setLogoConfig(prev => ({ ...prev, logoBgColor: e.target.value }))}
                          className={styles.colorInput}
                          style={{ flex: 1 }}
                        />
                        {logoConfig.logoBgColor && (
                          <button
                            type="button"
                            onClick={() => setLogoConfig(prev => ({ ...prev, logoBgColor: '' }))}
                            className={styles.toggleButton}
                            style={{ fontSize: '0.75rem', padding: '0.4rem 0.6rem' }}
                            title="QR arkaplan rengini kullan"
                          >
                            ↩ Varsayılan
                          </button>
                        )}
                      </div>
                    </div>

                    <div className={styles.inputGroup}>
                      <button
                        type="button"
                        onClick={() => setLogoConfig(prev => ({
                          ...prev,
                          logoUrl: '',
                          showLogo: false
                        }))}
                        className={styles.clearLogoButton}
                      >
                        <PhotoIcon className="h-4 w-4" />
                        Logoyu Kaldır
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QRCodeEditor; 