import React, { useState, useEffect } from 'react';
import { CalendarIcon, ClockIcon, ArrowPathIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import apiService from '../../services/apiService';
import { useAuth } from '../../contexts/AuthContext';
import styles from './GoogleCalendarUnavailableSlots.module.css';

const GoogleCalendarUnavailableSlots = () => {
  const { user } = useAuth();
  const [unavailableSlots, setUnavailableSlots] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    checkGoogleCalendarStatus();
  }, [user]);

  const checkGoogleCalendarStatus = async () => {
    if (!user) return;
    
    try {
      const response = await apiService.getGoogleCalendarStatus();
      if (response.success) {
        setIsConnected(response.data.isConnected);
        if (response.data.isConnected) {
          loadUnavailableSlots();
        }
      } else {
        console.log('Google Calendar not connected:', response.message);
        setIsConnected(false);
      }
    } catch (error) {
      console.error('Failed to check Google Calendar status:', error);
      setIsConnected(false);
      // Try to load events anyway to see if we can get sample data
      loadUnavailableSlots();
    }
  };

  const loadUnavailableSlots = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const now = new Date();
      const endOfWeek = new Date(now);
      endOfWeek.setDate(now.getDate() + 7);

      const response = await apiService.getGoogleCalendarEvents(
        now.toISOString(),
        endOfWeek.toISOString(),
        50
      );

      if (response.success) {
        const events = response.data || [];
        const unavailable = processEventsToUnavailableSlots(events);
        setUnavailableSlots(unavailable);
        setLastUpdated(new Date());
        setIsConnected(true);
      } else {
        throw new Error(response.message || 'Takvim yüklenemedi');
      }
    } catch (error) {
      console.error('Calendar loading error:', error);
      // Try to use sample data as fallback
      try {
        const sampleEvents = getSampleEvents();
        const unavailable = processEventsToUnavailableSlots(sampleEvents);
        setUnavailableSlots(unavailable);
        setLastUpdated(new Date());
        setError('Google Calendar bağlantısı yok. Örnek veriler gösteriliyor.');
      } catch (fallbackError) {
        console.error('Fallback data error:', fallbackError);
        setError('Takvim yüklenirken bir hata oluştu. Lütfen Google Calendar bağlantınızı kontrol edin.');
      }
      setIsConnected(false);
    } finally {
      setIsLoading(false);
    }
  };

  const processEventsToUnavailableSlots = (events) => {
    const unavailable = [];
    
    // Group events by day
    const eventsByDay = {};
    events.forEach(event => {
      if (event.start?.dateTime) {
        const date = new Date(event.start.dateTime);
        const dateKey = date.toDateString();
        
        if (!eventsByDay[dateKey]) {
          eventsByDay[dateKey] = [];
        }
        eventsByDay[dateKey].push(event);
      }
    });

    // Process each day
    Object.keys(eventsByDay).forEach(dateKey => {
      const date = new Date(dateKey);
      const dayEvents = eventsByDay[dateKey];
      
      // Sort events by start time
      dayEvents.sort((a, b) => new Date(a.start.dateTime) - new Date(b.start.dateTime));
      
      // Find unavailable time slots (gaps between events and outside business hours)
      const businessStart = 9; // 9:00 AM
      const businessEnd = 17; // 5:00 PM
      
      const unavailableSlots = [];
      
      // Check before first event
      if (dayEvents.length > 0) {
        const firstEventStart = new Date(dayEvents[0].start.dateTime);
        const firstEventHour = firstEventStart.getHours();
        
        if (firstEventHour > businessStart) {
          unavailableSlots.push({
            start: `${businessStart.toString().padStart(2, '0')}:00`,
            end: firstEventStart.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
            reason: 'İlk etkinlikten önce',
            type: 'before_first'
          });
        }
      }
      
      // Check between events
      for (let i = 0; i < dayEvents.length - 1; i++) {
        const currentEventEnd = new Date(dayEvents[i].end.dateTime);
        const nextEventStart = new Date(dayEvents[i + 1].start.dateTime);
        
        if (nextEventStart - currentEventEnd > 15 * 60 * 1000) { // More than 15 minutes gap
          unavailableSlots.push({
            start: currentEventEnd.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
            end: nextEventStart.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
            reason: 'Etkinlikler arası boşluk',
            type: 'between_events'
          });
        }
      }
      
      // Check after last event
      if (dayEvents.length > 0) {
        const lastEventEnd = new Date(dayEvents[dayEvents.length - 1].end.dateTime);
        const lastEventHour = lastEventEnd.getHours();
        
        if (lastEventHour < businessEnd) {
          unavailableSlots.push({
            start: lastEventEnd.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
            end: `${businessEnd.toString().padStart(2, '0')}:00`,
            reason: 'Son etkinlikten sonra',
            type: 'after_last'
          });
        }
      }
      
      // If no events, mark entire business day as unavailable
      if (dayEvents.length === 0) {
        unavailableSlots.push({
          start: `${businessStart.toString().padStart(2, '0')}:00`,
          end: `${businessEnd.toString().padStart(2, '0')}:00`,
          reason: 'Etkinlik yok',
          type: 'no_events'
        });
      }
      
      if (unavailableSlots.length > 0) {
        unavailable.push({
          date: date,
          dateKey: dateKey,
          dayName: getDayDisplayName(date),
          slots: unavailableSlots
        });
      }
    });

    return unavailable;
  };

  const getDayDisplayName = (date) => {
    const days = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];
    return days[date.getDay()];
  };

  const getSlotTypeColor = (type) => {
    const colors = {
      'before_first': 'bg-blue-100 text-blue-800',
      'between_events': 'bg-yellow-100 text-yellow-800',
      'after_last': 'bg-purple-100 text-purple-800',
      'no_events': 'bg-red-100 text-red-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  const getSlotTypeLabel = (type) => {
    const labels = {
      'before_first': 'İlk Etkinlik Öncesi',
      'between_events': 'Etkinlikler Arası',
      'after_last': 'Son Etkinlik Sonrası',
      'no_events': 'Etkinlik Yok'
    };
    return labels[type] || type;
  };

  if (!isConnected) {
    return (
      <div className={styles.container}>
        <div className={styles.notConnected}>
          <CalendarIcon className={styles.notConnectedIcon} />
          <h3 className={styles.notConnectedTitle}>
            Google Calendar Bağlı Değil
          </h3>
          <p className={styles.notConnectedText}>
            Müsait olmayan zaman aralıklarını görmek için Google Calendar hesabınızı bağlayın.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <CalendarIcon className={styles.headerIcon} />
          <h3 className={styles.headerTitle}>
            Google Calendar - Müsait Olmayan Zaman Aralıkları
          </h3>
        </div>
        <div className={styles.headerRight}>
          {lastUpdated && (
            <span className={styles.lastUpdated}>
              Son güncelleme: {lastUpdated.toLocaleTimeString('tr-TR')}
            </span>
          )}
          <button
            onClick={loadUnavailableSlots}
            disabled={isLoading}
            className={styles.refreshButton}
          >
            <ArrowPathIcon className={`${styles.refreshIcon} ${isLoading ? styles.spinning : ''}`} />
            Yenile
          </button>
        </div>
      </div>

      {error && (
        <div className={`${styles.errorMessage} ${error.includes('Örnek veriler') ? styles.warningMessage : ''}`}>
          <ExclamationTriangleIcon className={styles.errorIcon} />
          <p className={styles.errorText}>{error}</p>
        </div>
      )}

      {isLoading ? (
        <div className={styles.loadingContainer}>
          <div className={styles.loadingSpinner}></div>
          <span className={styles.loadingText}>Yükleniyor...</span>
        </div>
      ) : unavailableSlots.length > 0 ? (
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead className={styles.tableHeader}>
              <tr>
                <th className={styles.tableHeaderCell}>Gün</th>
                <th className={styles.tableHeaderCell}>Tarih</th>
                <th className={styles.tableHeaderCell}>Müsait Olmayan Zaman Aralıkları</th>
                <th className={styles.tableHeaderCell}>Toplam Süre</th>
              </tr>
            </thead>
            <tbody className={styles.tableBody}>
              {unavailableSlots.map((day, dayIndex) => (
                <tr key={dayIndex} className={styles.tableRow}>
                  <td className={styles.tableCell}>
                    <div className={styles.dayInfo}>
                      <span className={styles.dayName}>{day.dayName}</span>
                    </div>
                  </td>
                  <td className={styles.tableCell}>
                    <span className={styles.dateText}>
                      {day.date.toLocaleDateString('tr-TR', {
                        day: 'numeric',
                        month: 'short'
                      })}
                    </span>
                  </td>
                  <td className={styles.tableCell}>
                    <div className={styles.slotsContainer}>
                      {day.slots.map((slot, slotIndex) => (
                        <div key={slotIndex} className={styles.slotItem}>
                          <div className={styles.slotTime}>
                            <ClockIcon className={styles.slotIcon} />
                            <span>{slot.start} - {slot.end}</span>
                          </div>
                          <div className={styles.slotDetails}>
                            <span className={`${styles.slotType} ${getSlotTypeColor(slot.type)}`}>
                              {getSlotTypeLabel(slot.type)}
                            </span>
                            <span className={styles.slotReason}>{slot.reason}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </td>
                  <td className={styles.tableCell}>
                    <span className={styles.totalTime}>
                      {calculateTotalUnavailableTime(day.slots)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className={styles.emptyState}>
          <CalendarIcon className={styles.emptyIcon} />
          <p className={styles.emptyText}>
            Bu hafta için müsait olmayan zaman aralığı bulunamadı.
          </p>
          <p className={styles.emptySubtext}>
            Tüm zaman aralıkları müsait veya henüz etkinlik eklenmemiş.
          </p>
        </div>
      )}

      <div className={styles.footer}>
        <p className={styles.footerText}>
          Bu tablo Google Calendar'daki etkinliklerinize göre otomatik olarak oluşturulur.
        </p>
        <button
          onClick={() => window.open('https://calendar.google.com', '_blank')}
          className={styles.viewButton}
        >
          <CalendarIcon className={styles.viewButtonIcon} />
          <span>Google Calendar'da Görüntüle</span>
        </button>
      </div>
    </div>
  );
};

const getSampleEvents = () => {
  const now = new Date();
  const events = [];
  
  // Add sample events for each day of the week
  for (let i = 0; i < 7; i++) {
    const date = new Date(now);
    date.setDate(now.getDate() - now.getDay() + i);
    
    // Morning meeting
    const morningTime = new Date(date);
    morningTime.setHours(9, 0, 0, 0);
    events.push({
      summary: 'Sabah Toplantısı',
      start: { dateTime: morningTime.toISOString() },
      end: { dateTime: new Date(morningTime.getTime() + 60 * 60 * 1000).toISOString() }
    });
    
    // Afternoon class
    const afternoonTime = new Date(date);
    afternoonTime.setHours(14, 0, 0, 0);
    events.push({
      summary: 'Ders Saati',
      start: { dateTime: afternoonTime.toISOString() },
      end: { dateTime: new Date(afternoonTime.getTime() + 90 * 60 * 1000).toISOString() }
    });
  }
  
  return events;
};

const calculateTotalUnavailableTime = (slots) => {
  let totalMinutes = 0;
  
  slots.forEach(slot => {
    const startTime = slot.start.split(':').map(Number);
    const endTime = slot.end.split(':').map(Number);
    
    const startMinutes = startTime[0] * 60 + startTime[1];
    const endMinutes = endTime[0] * 60 + endTime[1];
    
    totalMinutes += endMinutes - startMinutes;
  });
  
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  
  if (hours > 0) {
    return `${hours}s ${minutes}dk`;
  }
  return `${minutes}dk`;
};

export default GoogleCalendarUnavailableSlots;
