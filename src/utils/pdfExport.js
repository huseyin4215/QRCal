// PDF Export Utility for Appointment Statistics
import pdfMakeModule from 'pdfmake/build/pdfmake';
import { formatFacultyName } from './formatUserName';

const pdfMake = pdfMakeModule?.default || pdfMakeModule;

// Initialize vfs fonts - lazy load to prevent build errors
let vfsInitialized = false;

const initializeVfs = async () => {
  if (vfsInitialized || !pdfMake) return;
  
  try {
    // Try to import vfs_fonts dynamically
    const pdfFontsModule = await import('pdfmake/build/vfs_fonts');
    const fonts = pdfFontsModule?.default || pdfFontsModule;
    
    // Handle different module structures
    if (fonts?.pdfMake?.vfs) {
      pdfMake.vfs = fonts.pdfMake.vfs;
    } else if (fonts) {
      pdfMake.vfs = fonts;
    } else {
      // Initialize empty vfs to prevent errors
      pdfMake.vfs = pdfMake.vfs || {};
    }
    vfsInitialized = true;
  } catch (e) {
    // If vfs_fonts can't be loaded, initialize empty vfs
    console.warn('Could not load pdfmake vfs_fonts. PDF may have limited font support.');
    pdfMake.vfs = pdfMake.vfs || {};
    vfsInitialized = true;
  }
};

const getStatusText = (status) => {
    const statusMap = {
        pending: 'Beklemede',
        approved: 'Onaylandı',
        rejected: 'Reddedildi',
        cancelled: 'İptal Edildi',
        no_response: 'Cevaplanmadı'
    };
    return statusMap[status] || status;
};

const buildTopicMap = (topics = []) => {
    const map = new Map();
    topics.forEach((topic) => {
        const id = topic?._id || topic?.value;
        const name = topic?.name || topic?.label;
        if (id && name) {
            map.set(String(id), name);
        }
    });
    return map;
};

const formatFacultyNameForPDF = (apt) => {
    // Use the centralized formatFacultyName utility function
    return formatFacultyName(apt) || 'Bilinmiyor';
};

const buildReportTableData = (appointments = [], topics = []) => {
    const topicMap = buildTopicMap(topics);
    return appointments.map((apt) => {
        const studentName = apt?.studentName || apt?.student?.name || 'Bilinmiyor';
        const facultyName = formatFacultyNameForPDF(apt);
        const rawTopicId = apt?.topic?._id || apt?.topic;
        const topicName = apt?.topicName || apt?.topic?.name || topicMap.get(String(rawTopicId)) || apt?.topic;
        const topic = topicName || 'Belirtilmedi';
        const date = apt?.date ? new Date(apt.date).toLocaleDateString('tr-TR') : '-';
        const time = apt?.startTime || '-';
        const status = apt?.status ? getStatusText(apt.status) : '-';

        return [studentName, facultyName, topic, date, time, status];
    });
};

export const exportAppointmentsToPDF = async (appointments, title = 'Tüm Sistem Randevuları', topics = []) => {
    try {
        // Ensure vfs is initialized before creating PDF
        await initializeVfs();
        
        if (!appointments || !Array.isArray(appointments)) {
            alert('Geçerli randevu verisi bulunamadı.');
            return { success: false, error: 'Invalid appointments data' };
        }

        if (appointments.length === 0) {
            alert('Dışa aktarılacak randevu bulunamadı.');
            return { success: false, error: 'No appointments to export' };
        }

        const stats = {
            generatedAt: new Date().toLocaleString('tr-TR'),
            total: appointments.length,
            approved: appointments.filter(a => a && a.status === 'approved').length,
            rejected: appointments.filter(a => a && a.status === 'rejected').length,
            pending: appointments.filter(a => a && a.status === 'pending').length,
            noResponse: appointments.filter(a => a && a.status === 'no_response').length,
            cancelled: appointments.filter(a => a && a.status === 'cancelled').length
        };

        const rows = buildReportTableData(appointments, topics);
        const fileName = `randevu-raporu-${new Date().toISOString().split('T')[0]}.pdf`;
        const docDefinition = {
            pageSize: 'A4',
            pageMargins: [40, 40, 40, 40],
            defaultStyle: {
                font: 'Roboto',
                fontSize: 10
            },
            content: [
                {
                    table: {
                        widths: ['*'],
                        body: [[
                            { text: title || 'Tüm Sistem Randevuları', style: 'title' }
                        ]]
                    },
                    layout: {
                        fillColor: '#4f46e5',
                        hLineColor: '#4f46e5',
                        vLineColor: '#4f46e5',
                        paddingLeft: () => 10,
                        paddingRight: () => 10,
                        paddingTop: () => 8,
                        paddingBottom: () => 8
                    },
                    margin: [0, 0, 0, 10]
                },
                { text: `Oluşturulma: ${stats.generatedAt}`, style: 'subtitle' },
                { text: 'Özet İstatistikler', style: 'section' },
                {
                    table: {
                        widths: ['*', '*'],
                        body: [
                            ['Toplam', stats.total],
                            ['Onaylanan', stats.approved],
                            ['Reddedilen', stats.rejected],
                            ['Beklemede', stats.pending],
                            ['Cevaplanmadı', stats.noResponse],
                            ['İptal Edilen', stats.cancelled]
                        ]
                    },
                    layout: {
                        fillColor: (rowIndex) => (rowIndex % 2 === 0 ? '#f9fafb' : null),
                        hLineColor: '#e5e7eb',
                        vLineColor: '#e5e7eb',
                        paddingLeft: () => 6,
                        paddingRight: () => 6,
                        paddingTop: () => 4,
                        paddingBottom: () => 4
                    },
                    margin: [0, 0, 0, 12]
                },
                {
                    table: {
                        headerRows: 1,
                        widths: ['*', '*', '*', 'auto', 'auto', 'auto'],
                        body: [
                            ['Öğrenci', 'Öğretim Üyesi', 'Görüşme Konusu', 'Tarih', 'Saat', 'Durum'],
                            ...rows
                        ]
                    },
                    layout: {
                        fillColor: (rowIndex) => {
                            if (rowIndex === 0) return '#4f46e5';
                            return rowIndex % 2 === 0 ? '#f9fafb' : null;
                        },
                        hLineColor: '#e5e7eb',
                        vLineColor: '#e5e7eb',
                        paddingLeft: () => 6,
                        paddingRight: () => 6,
                        paddingTop: () => 4,
                        paddingBottom: () => 4
                    }
                }
            ],
            styles: {
                title: { fontSize: 16, bold: true, color: '#ffffff' },
                subtitle: { fontSize: 10, color: '#374151', margin: [0, 0, 0, 12] },
                section: { fontSize: 12, bold: true, margin: [0, 6, 0, 6], color: '#111827' }
            }
        };

        pdfMake.createPdf(docDefinition).download(fileName);
        return { success: true, fileName };
    } catch (error) {
        console.error('PDF export error:', error);
        alert('PDF oluşturulurken bir hata oluştu: ' + error.message);
        return { success: false, error: error.message };
    }
};

export default exportAppointmentsToPDF;
