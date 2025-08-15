import { useState, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { 
  ArrowDownTrayIcon, 
  PaintBrushIcon, 
  PhotoIcon, 
  DocumentArrowDownIcon,
  UserIcon,
  EyeIcon,
  EyeSlashIcon,
  SwatchIcon,
  Cog6ToothIcon,
  PencilIcon
} from '@heroicons/react/24/outline';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import styles from './QRCodeEditor.module.css';

// Import logo assets
import ankaraUniLogo from '../assets/ankara_uni.png';
import muhendislikLogo from '../assets/muhendislik_logo.png';
import googleCalendarLogo from '../assets/google_calendar.png';
import linkedinLogo from '../assets/linkedin.png';
import instagramLogo from '../assets/instagram.png';
import twitterLogo from '../assets/twitter.jpg';

const QRCodeEditor = ({ value, onDownload, user }) => {
  const [qrConfig, setQrConfig] = useState({
    size: 256,
    level: 'M',
    bgColor: '#FFFFFF',
    fgColor: '#667eea',
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
    logoType: 'custom' // 'custom', 'preset'
  });

  // Preset logo options - using imported assets
  const presetLogos = [
    { 
      id: 'ankara_uni', 
      name: 'Ankara Üniversitesi', 
      url: ankaraUniLogo 
    },
    { 
      id: 'muhendislik', 
      name: 'Mühendislik', 
      url: muhendislikLogo 
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
    customTextPosition: 'above', // 'above', 'below', 'left', 'right'
    customTextStyle: 'pill', // 'pill', 'box', 'underline', 'none'
    customTextSize: 'medium', // 'small', 'medium', 'large'
    customTextColor: '#667eea' // New field for custom text color
  });

  const [exportConfig, setExportConfig] = useState({
    format: 'png', // 'png', 'pdf'
    size: 'A4', // 'A4', 'A5'
    orientation: 'portrait' // 'portrait', 'landscape'
  });

  const [previewMode, setPreviewMode] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const qrRef = useRef(null);

  // Predefined color schemes
  const colorSchemes = [
    { name: 'Mavi', bg: '#FFFFFF', fg: '#667eea' },
    { name: 'Yeşil', bg: '#FFFFFF', fg: '#10B981' },
    { name: 'Mor', bg: '#FFFFFF', fg: '#8B5CF6' },
    { name: 'Turuncu', bg: '#FFFFFF', fg: '#F59E0B' },
    { name: 'Kırmızı', bg: '#FFFFFF', fg: '#EF4444' },
    { name: 'Siyah', bg: '#FFFFFF', fg: '#000000' },
    { name: 'Gradient Mavi', bg: '#F0F9FF', fg: '#3B82F6' },
    { name: 'Gradient Yeşil', bg: '#F0FDF4', fg: '#16A34A' },
  ];

  const handleDownloadQR = () => {
    if (qrRef.current) {
      if (exportConfig.format === 'pdf') {
        handleDownloadPDF();
      } else {
        handleDownloadPNG();
      }
    }
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
        
        // Add contact information if enabled (without gray background)
        if (user && (contactConfig.showName || contactConfig.showTitle || contactConfig.showEmail || contactConfig.showPhone || contactConfig.showDepartment || contactConfig.showOffice || contactConfig.showCustomText)) {
          const lineHeight = (contactConfig.fontSize + 8) * 3; // Scale up for high DPI
          let textX, textY;
          
          if (isPortrait) {
            // Vertical layout
            if (contactConfig.position === 'top') {
              textX = canvas.width / 2;
              textY = padding + 90;
            } else {
              textX = canvas.width / 2;
              textY = qrY + qrSize + 60;
            }
          } else {
            // Horizontal layout
            if (contactConfig.position === 'top') {
              textX = padding + 90;
              textY = canvas.height / 2;
            } else {
              textX = qrX + qrSize + 60;
              textY = canvas.height / 2;
            }
          }
          
          ctx.fillStyle = contactConfig.textColor;
          ctx.textAlign = 'center';
          
                     // Custom text if enabled
           if (contactConfig.showCustomText && contactConfig.customText) {
             // Calculate custom text size based on customTextSize
             const sizeMap = {
               small: contactConfig.fontSize + 2,
               medium: contactConfig.fontSize + 10,
               large: contactConfig.fontSize + 18
             };
             const customTextSize = sizeMap[contactConfig.customTextSize] || sizeMap.medium;
             
             // Draw custom text based on style
             const textMetrics = ctx.measureText(contactConfig.customText);
             const textWidth = textMetrics.width;
             const textHeight = customTextSize * 3;
             
             if (contactConfig.customTextStyle === 'pill' || contactConfig.customTextStyle === 'box') {
               // Draw background
               ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
               const borderRadius = contactConfig.customTextStyle === 'pill' ? 25 : 8;
               ctx.fillRect(textX - textWidth/2 - 20, textY - textHeight - 10, textWidth + 40, textHeight + 20);
               
               // Draw border
               ctx.strokeStyle = contactConfig.customTextColor;
               ctx.lineWidth = 6;
               ctx.strokeRect(textX - textWidth/2 - 20, textY - textHeight - 10, textWidth + 40, textHeight + 20);
             } else if (contactConfig.customTextStyle === 'underline') {
               // Draw underline
               ctx.strokeStyle = contactConfig.customTextColor;
               ctx.lineWidth = 9;
               ctx.beginPath();
               ctx.moveTo(textX - textWidth/2, textY + 15);
               ctx.lineTo(textX + textWidth/2, textY + 15);
               ctx.stroke();
             }
             
             // Draw custom text
             ctx.fillStyle = contactConfig.customTextColor;
             ctx.font = `bold ${customTextSize * 3}px Arial`;
             ctx.fillText(contactConfig.customText, textX, textY);
             textY += lineHeight + 40;
             ctx.fillStyle = contactConfig.textColor;
           }
          
          ctx.font = `bold ${(contactConfig.fontSize + 4) * 3}px Arial`;
          
          // Name
          if (contactConfig.showName && user.name) {
            ctx.fillText(user.name, textX, textY);
            textY += lineHeight;
          }
          
          // Title
          if (contactConfig.showTitle && user.title) {
            ctx.font = `${contactConfig.fontSize * 3}px Arial`;
            ctx.fillText(user.title, textX, textY);
            textY += lineHeight;
          }
          
          // Department
          if (contactConfig.showDepartment && user.department) {
            ctx.fillText(user.department, textX, textY);
            textY += lineHeight;
          }
          
          // Email
          if (contactConfig.showEmail && user.email) {
            ctx.fillText(user.email, textX, textY);
            textY += lineHeight;
          }
          
          // Phone
          if (contactConfig.showPhone && user.phone) {
            ctx.fillText(user.phone, textX, textY);
            textY += lineHeight;
          }
          
          // Office
          if (contactConfig.showOffice && user.office) {
            ctx.fillText(`Ofis: ${user.office}`, textX, textY);
          }
        }
        
        // Add logo if enabled
        if (logoConfig.showLogo && logoConfig.logoUrl) {
          const logoImg = new Image();
          logoImg.onload = () => {
            const logoSize = logoConfig.logoSize * 3; // Scale up for high DPI
            const logoX = (canvas.width - logoSize) / 2;
            const logoY = (canvas.height - logoSize) / 2;
            
            // Draw logo background circle/square
            ctx.globalAlpha = logoConfig.logoOpacity;
            ctx.fillStyle = qrConfig.bgColor;
            
            if (logoConfig.logoShape === 'round') {
              ctx.beginPath();
              ctx.arc(logoX + logoSize/2, logoY + logoSize/2, logoSize/2 + 8, 0, 2 * Math.PI);
              ctx.fill();
            } else {
              ctx.fillRect(logoX - 8, logoY - 8, logoSize + 16, logoSize + 16);
            }
            
            // Draw logo image
            ctx.drawImage(logoImg, logoX, logoY, logoSize, logoSize);
            
            // Reset global alpha
            ctx.globalAlpha = 1;
            
            // Download
            const link = document.createElement('a');
            link.download = `qr-code-${user?.name || 'faculty'}-${exportConfig.size.toLowerCase()}.png`;
            link.href = canvas.toDataURL();
            link.click();
          };
          logoImg.src = logoConfig.logoUrl;
        } else {
          // Download without logo
          const link = document.createElement('a');
          link.download = `qr-code-${user?.name || 'faculty'}-${exportConfig.size.toLowerCase()}.png`;
          link.href = canvas.toDataURL();
          link.click();
        }
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
      tempContainer.style.width = '800px';
      tempContainer.style.height = '600px';
      tempContainer.style.backgroundColor = cardConfig.cardColor;
      tempContainer.style.padding = '40px';
      tempContainer.style.borderRadius = '20px';
      tempContainer.style.border = cardConfig.cardBorder ? `2px solid ${cardConfig.cardBorder}` : 'none';
      tempContainer.style.display = 'flex';
      tempContainer.style.flexDirection = exportConfig.orientation === 'landscape' ? 'row' : 'column';
      tempContainer.style.alignItems = 'center';
      tempContainer.style.justifyContent = 'center';
      tempContainer.style.gap = '40px';
      tempContainer.style.overflow = 'hidden';
      tempContainer.style.boxShadow = '0 20px 60px rgba(0, 0, 0, 0.1)';
      tempContainer.style.fontFamily = 'Arial, sans-serif';
      tempContainer.style.lineHeight = '1.2';
      
              // Add logo if enabled
        if (logoConfig.showLogo && logoConfig.logoUrl) {
          const logoDiv = document.createElement('div');
          logoDiv.style.position = 'absolute';
          logoDiv.style.zIndex = '10';
          logoDiv.style.opacity = logoConfig.logoOpacity;
          logoDiv.style.top = '50%';
          logoDiv.style.left = '50%';
          logoDiv.style.transform = 'translate(-50%, -50%)';
          logoDiv.style.backgroundColor = qrConfig.bgColor;
          logoDiv.style.borderRadius = logoConfig.logoShape === 'round' ? '50%' : '12px';
          logoDiv.style.padding = '8px';
          logoDiv.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
          logoDiv.style.width = (logoConfig.logoSize + 16) + 'px';
          logoDiv.style.height = (logoConfig.logoSize + 16) + 'px';
          logoDiv.style.display = 'flex';
          logoDiv.style.alignItems = 'center';
          logoDiv.style.justifyContent = 'center';
          
          const logoImg = document.createElement('img');
          logoImg.src = logoConfig.logoUrl;
          logoImg.style.width = logoConfig.logoSize + 'px';
          logoImg.style.height = logoConfig.logoSize + 'px';
          logoImg.style.objectFit = 'contain';
          logoImg.style.display = 'block';
          logoImg.style.borderRadius = logoConfig.logoShape === 'round' ? '50%' : '8px';
          logoImg.crossOrigin = 'anonymous';
          
          logoDiv.appendChild(logoImg);
          tempContainer.appendChild(logoDiv);
        }
      
      // Clone the QR code element
      const qrClone = element.cloneNode(true);
      qrClone.style.width = '300px';
      qrClone.style.height = '300px';
      qrClone.style.display = 'block';
      qrClone.style.margin = '0';
      qrClone.style.padding = '0';
      
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
          contactDiv.style.flexDirection = 'column';
          contactDiv.style.gap = '8px';
          contactDiv.style.textAlign = 'center';
          contactDiv.style.color = contactConfig.textColor;
          contactDiv.style.fontFamily = 'Arial, sans-serif';
          contactDiv.style.background = 'transparent';
          contactDiv.style.margin = '0';
          contactDiv.style.padding = '0';
          contactDiv.style.lineHeight = '1.2';
          
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
             contactDiv.appendChild(customTextDiv);
           }
          
          if (contactConfig.showName && user.name) {
            const nameDiv = document.createElement('div');
            nameDiv.style.fontSize = '24px';
            nameDiv.style.fontWeight = 'bold';
            nameDiv.style.marginBottom = '8px';
            nameDiv.style.marginTop = '0';
            nameDiv.style.lineHeight = '1.2';
            nameDiv.textContent = user.name;
            contactDiv.appendChild(nameDiv);
          }
          
          if (contactConfig.showTitle && user.title) {
            const titleDiv = document.createElement('div');
            titleDiv.style.fontSize = '18px';
            titleDiv.style.marginBottom = '8px';
            titleDiv.style.marginTop = '0';
            titleDiv.style.lineHeight = '1.2';
            titleDiv.textContent = user.title;
            contactDiv.appendChild(titleDiv);
          }
          
          if (contactConfig.showDepartment && user.department) {
            const deptDiv = document.createElement('div');
            deptDiv.style.fontSize = '16px';
            deptDiv.style.marginBottom = '8px';
            deptDiv.style.marginTop = '0';
            deptDiv.style.lineHeight = '1.2';
            deptDiv.textContent = user.department;
            contactDiv.appendChild(deptDiv);
          }
          
          if (contactConfig.showEmail && user.email) {
            const emailDiv = document.createElement('div');
            emailDiv.style.fontSize = '14px';
            emailDiv.style.marginBottom = '4px';
            emailDiv.style.marginTop = '0';
            emailDiv.style.lineHeight = '1.2';
            emailDiv.textContent = user.email;
            contactDiv.appendChild(emailDiv);
          }
          
          if (contactConfig.showPhone && user.phone) {
            const phoneDiv = document.createElement('div');
            phoneDiv.style.fontSize = '14px';
            phoneDiv.style.marginBottom = '4px';
            phoneDiv.style.marginTop = '0';
            phoneDiv.style.lineHeight = '1.2';
            phoneDiv.textContent = user.phone;
            contactDiv.appendChild(phoneDiv);
          }
          
          if (contactConfig.showOffice && user.office) {
            const officeDiv = document.createElement('div');
            officeDiv.style.fontSize = '14px';
            officeDiv.style.marginTop = '0';
            officeDiv.style.lineHeight = '1.2';
            officeDiv.textContent = `Ofis: ${user.office}`;
            contactDiv.appendChild(officeDiv);
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
               case 'left':
                 // For left positioning, we need to restructure the layout
                 const leftContainer = document.createElement('div');
                 leftContainer.style.display = 'flex';
                 leftContainer.style.flexDirection = 'row';
                 leftContainer.style.alignItems = 'center';
                 leftContainer.style.gap = '20px';
                 leftContainer.appendChild(customTextDiv);
                 leftContainer.appendChild(qrClone);
                 tempContainer.appendChild(leftContainer);
                 break;
               case 'right':
                 // For right positioning, we need to restructure the layout
                 const rightContainer = document.createElement('div');
                 rightContainer.style.display = 'flex';
                 rightContainer.style.flexDirection = 'row';
                 rightContainer.style.alignItems = 'center';
                 rightContainer.style.gap = '20px';
                 rightContainer.appendChild(qrClone);
                 rightContainer.appendChild(customTextDiv);
                 tempContainer.appendChild(rightContainer);
                 break;
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
        pdf.text('QR Calendar - Randevu Sistemi', pageWidth - margin, pageHeight - margin, { align: 'right' });
        
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
          border: `2px solid ${qrConfig.fgColor}`,
          display: 'inline-block'
        };
      case 'box':
        return {
          ...baseStyle,
          padding: '8px 16px',
          backgroundColor: 'rgba(255,255,255,0.9)',
          borderRadius: '8px',
          border: `2px solid ${qrConfig.fgColor}`,
          display: 'inline-block'
        };
      case 'underline':
        return {
          ...baseStyle,
          padding: '4px 0',
          borderBottom: `3px solid ${qrConfig.fgColor}`,
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

      <div className={styles.grid}>
        {/* QR Code Preview */}
        <div className={styles.previewSection}>
          <div className={styles.qrPreview} style={{
            backgroundColor: cardConfig.cardColor,
            padding: cardConfig.cardPadding,
            borderRadius: '20px',
            border: cardConfig.cardBorder ? `2px solid ${cardConfig.cardBorder}` : 'none',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
            position: 'relative',
            overflow: 'hidden'
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
                {/* Custom Text positioning based on customTextPosition */}
                {contactConfig.showCustomText && contactConfig.customText && contactConfig.customTextPosition === 'above' && (
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

                {contactConfig.showCustomText && contactConfig.customText && contactConfig.customTextPosition === 'left' && (
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                    textAlign: 'center',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minWidth: '120px'
                  }}>
                    <div style={getCustomTextStyle()}>
                      {contactConfig.customText}
                    </div>
                  </div>
                )}
                
                {contactConfig.position === 'top' && (
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                    textAlign: 'center',
                    color: contactConfig.textColor,
                    background: 'transparent'
                  }}>
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
                  </div>
                )}
                
                <div ref={qrRef} style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  position: 'relative'
                }}>
                  <QRCodeSVG
                    value={value}
                    size={qrConfig.size}
                    level={qrConfig.level}
                    bgColor={qrConfig.bgColor}
                    fgColor={qrConfig.fgColor}
                    includeMargin={qrConfig.includeMargin}
                    marginSize={qrConfig.marginSize}
                  />
                  
                  {/* Logo positioned directly on QR code */}
                  {logoConfig.showLogo && logoConfig.logoUrl && (
                    <div style={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      zIndex: 10,
                      opacity: logoConfig.logoOpacity,
                      backgroundColor: qrConfig.bgColor,
                      borderRadius: logoConfig.logoShape === 'round' ? '50%' : '12px',
                      padding: '8px',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                    }}>
                      <img 
                        src={logoConfig.logoUrl} 
                        alt="Logo" 
                        style={{
                          width: logoConfig.logoSize,
                          height: logoConfig.logoSize,
                          objectFit: 'contain',
                          display: 'block',
                          borderRadius: logoConfig.logoShape === 'round' ? '50%' : '8px'
                        }}
                      />
                    </div>
                  )}
                </div>

                {contactConfig.showCustomText && contactConfig.customText && contactConfig.customTextPosition === 'right' && (
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                    textAlign: 'center',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minWidth: '120px'
                  }}>
                    <div style={getCustomTextStyle()}>
                      {contactConfig.customText}
                    </div>
                  </div>
                )}
                
                {contactConfig.position === 'bottom' && (
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                    textAlign: 'center',
                    color: contactConfig.textColor,
                    background: 'transparent'
                  }}>
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
                  </div>
                )}

                {/* Custom Text positioning based on customTextPosition */}
                {contactConfig.showCustomText && contactConfig.customText && contactConfig.customTextPosition === 'below' && (
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
                        <option value="below">Altta</option>
                        <option value="left">Solda</option>
                        <option value="right">Sağda</option>
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

            {/* Error Correction Level */}
            <div className={styles.section}>
              <label className={styles.label}>Hata Düzeltme Seviyesi</label>
              <select
                value={qrConfig.level}
                onChange={(e) => setQrConfig(prev => ({ ...prev, level: e.target.value }))}
                className={styles.selectInput}
              >
                <option value="L">Düşük (7%)</option>
                <option value="M">Orta (15%)</option>
                <option value="Q">Yüksek (25%)</option>
                <option value="H">En Yüksek (30%)</option>
              </select>
            </div>

            {/* Logo Configuration */}
            <div className={styles.divider}>
              <h4 className={styles.sectionTitle}>
                <PhotoIcon className="h-5 w-5" />
                Logo Ayarları
              </h4>
              
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
                               <div className={styles.presetLogoPreview}>
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
                      <label className={styles.label}>Logo Boyutu</label>
                      <input
                        type="range"
                        min="20"
                        max="100"
                        value={logoConfig.logoSize}
                        onChange={(e) => setLogoConfig(prev => ({ ...prev, logoSize: parseInt(e.target.value) }))}
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
                      <label className={styles.label}>Logo Şekli</label>
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