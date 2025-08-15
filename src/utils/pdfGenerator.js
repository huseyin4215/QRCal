import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// Generate PDF from HTML element
export const generatePDF = async (elementId, filename = 'program.pdf') => {
  try {
    console.log('Starting PDF generation...');
    
    const element = document.getElementById(elementId);
    if (!element) {
      throw new Error(`Element with id '${elementId}' not found`);
    }

    console.log('Element found, creating canvas...');

    // Wait a bit for any dynamic content to load
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Create canvas from HTML element with better options
    const canvas = await html2canvas(element, {
      scale: 1.5, // Reduced scale for better performance
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false, // Disable logging
      width: element.offsetWidth,
      height: element.offsetHeight,
      scrollX: 0,
      scrollY: 0,
      windowWidth: element.offsetWidth,
      windowHeight: element.offsetHeight
    });

    console.log('Canvas created, converting to image...');

    // Convert canvas to image with error handling
    let imgData;
    try {
      imgData = canvas.toDataURL('image/png', 0.8); // Reduced quality for better performance
    } catch (imgError) {
      console.error('Error converting canvas to image:', imgError);
      // Try with lower quality
      imgData = canvas.toDataURL('image/jpeg', 0.7);
    }

    console.log('Image created, generating PDF...');

    // Create PDF with A4 dimensions
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    
    // Calculate image dimensions to fit page
    const imgWidth = pageWidth - 20; // 10mm margin on each side
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
    console.log(`Page dimensions: ${pageWidth}x${pageHeight}mm`);
    console.log(`Image dimensions: ${imgWidth}x${imgHeight}mm`);

    // If image fits on one page
    if (imgHeight <= pageHeight - 20) {
      pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight);
    } else {
      // Multiple pages needed
      let heightLeft = imgHeight;
      let position = 10; // Start with 10mm margin
      let pageNumber = 1;

      while (heightLeft > 0) {
        const pageImgHeight = Math.min(heightLeft, pageHeight - 20);
        const pageImgWidth = imgWidth;
        
        pdf.addImage(
          imgData, 
          'PNG', 
          10, 
          position, 
          pageImgWidth, 
          pageImgHeight,
          undefined,
          'FAST'
        );

        heightLeft -= (pageHeight - 20);
        position -= (pageHeight - 20);

        if (heightLeft > 0) {
          pdf.addPage();
          pageNumber++;
        }
      }
    }

    console.log('PDF generated, saving...');

    // Save PDF
    pdf.save(filename);
    
    console.log('PDF saved successfully');
    return true;
    
  } catch (error) {
    console.error('Error generating PDF:', error);
    
    // Provide more specific error messages
    if (error.message.includes('Element not found')) {
      throw new Error('PDF oluşturulacak içerik bulunamadı. Lütfen sayfayı yenileyin ve tekrar deneyin.');
    } else if (error.message.includes('canvas')) {
      throw new Error('Görsel oluşturulurken hata oluştu. Lütfen tekrar deneyin.');
    } else {
      throw new Error(`PDF oluşturma hatası: ${error.message}`);
    }
  }
};

// Alternative simple PDF generation (fallback)
export const generateSimplePDF = async (userData, events, filename = 'program.pdf') => {
  try {
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    // Add title
    pdf.setFontSize(20);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Haftalık Program', pageWidth / 2, 20, { align: 'center' });

    // Add user info
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Ad: ${userData.name || 'Belirtilmemiş'}`, 20, 35);
    pdf.text(`E-posta: ${userData.email || 'Belirtilmemiş'}`, 20, 45);
    if (userData.phone) pdf.text(`Telefon: ${userData.phone}`, 20, 55);
    if (userData.department) pdf.text(`Bölüm: ${userData.department}`, 20, 65);
    if (userData.title) pdf.text(`Unvan: ${userData.title}`, 20, 75);

    // Add date
    pdf.text(`Tarih: ${new Date().toLocaleDateString('tr-TR')}`, 20, 85);

    // Add events if available
    if (events && events.length > 0) {
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Bu Hafta:', 20, 105);

      let yPosition = 115;
      events.forEach((event, index) => {
        if (yPosition > pageHeight - 20) {
          pdf.addPage();
          yPosition = 20;
        }

        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        pdf.text(`${event.summary} - ${event.start.dateTime ? new Date(event.start.dateTime).toLocaleString('tr-TR') : 'Tüm gün'}`, 20, yPosition);
        yPosition += 8;
      });
    } else {
      pdf.setFontSize(12);
      pdf.text('Bu hafta için etkinlik bulunmuyor.', 20, 105);
    }

    pdf.save(filename);
    return true;
  } catch (error) {
    console.error('Error generating simple PDF:', error);
    throw new Error('PDF oluşturulurken hata oluştu.');
  }
};

// Format date for display
export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('tr-TR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

// Format time for display
export const formatTime = (dateTime) => {
  return new Date(dateTime).toLocaleTimeString('tr-TR', {
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Generate personal calendar URL
export const generatePersonalCalendarURL = (userId) => {
  // This would be your actual calendar sharing URL
  // For now, we'll use a placeholder
  return `https://calendar.google.com/calendar/embed?src=${userId}`;
};

// Create QR code data
export const createQRCodeData = (user, calendarUrl) => {
  const data = {
    name: user.name,
    email: user.email,
    calendarUrl: calendarUrl,
    generatedAt: new Date().toISOString()
  };
  
  return JSON.stringify(data);
}; 