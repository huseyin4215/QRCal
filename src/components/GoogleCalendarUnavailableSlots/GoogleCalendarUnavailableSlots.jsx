import React, { useState, useEffect } from 'react';
import { CalendarIcon, ClockIcon, ArrowPathIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import apiService from '../../services/apiService';
import { useAuth } from '../../contexts/AuthContext';
import styles from './GoogleCalendarUnavailableSlots.module.css';

const GoogleCalendarEvents = ({ compact = false }) => {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
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
          loadEvents();
        }
      } else {
        console.log('Google Calendar not connected:', response.message);
        setIsConnected(false);
      }
    } catch (error) {
      console.error('Failed to check Google Calendar status:', error);
      setIsConnected(false);
      loadEvents(); // Try to load events anyway to see if we can get sample data
    }
  };

  const loadEvents = async () => {
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
        const calendarEvents = response.data || [];
        const processedEvents = processEvents(calendarEvents);
        setEvents(processedEvents);
        setLastUpdated(new Date());
        setIsConnected(true);
      } else {
        throw new Error(response.message || 'Takvim yüklenemedi');
      }
    } catch (error) {
      console.error('Calendar loading error:', error);
      
      // Check if it's an auth error
      if (error.requiresReauth || error.message?.includes('invalid_grant') || error.message?.includes('access expired')) {
        setError('Google Calendar bağlantınızın süresi dolmuş. Yeniden bağlanmanız gerekiyor.');
        setIsConnected(false);
        setEvents([]);
      } else {
        // Try to use sample data as fallback for other errors
        try {
          const sampleEvents = getSampleEvents();
          const processedEvents = processEvents(sampleEvents);
          setEvents(processedEvents);
          setLastUpdated(new Date());
          setError('Google Calendar bağlantısı yok. Örnek veriler gösteriliyor.');
        } catch (fallbackError) {
          console.error('Fallback data error:', fallbackError);
          setError('Takvim yüklenirken bir hata oluştu. Lütfen Google Calendar bağlantınızı kontrol edin.');
        }
        setIsConnected(false);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const processEvents = (calendarEvents) => {
    const processed = [];
    
    // Group events by day
    const eventsByDay = {};
    calendarEvents.forEach(event => {
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
      
      if (dayEvents.length > 0) {
        processed.push({
          date: date,
          dateKey: dateKey,
          dayName: getDayDisplayName(date),
          events: dayEvents.map(event => ({
            title: event.summary || 'Etkinlik',
            start: new Date(event.start.dateTime).toLocaleTimeString('tr-TR', {
              hour: '2-digit',
              minute: '2-digit'
            }),
            end: new Date(event.end.dateTime).toLocaleTimeString('tr-TR', {
              hour: '2-digit',
              minute: '2-digit'
            }),
            duration: Math.round((new Date(event.end.dateTime) - new Date(event.start.dateTime)) / (1000 * 60))
          }))
        });
      }
    });

    return processed;
  };

  const getDayDisplayName = (date) => {
    const days = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];
    return days[date.getDay()];
  };

  const getSlotTypeColor = (type) => {
    const colors = {
      'before_first': 'bg-blue-100 text-blue-800',
      'between_events': 'bg-yellow-100 text-yellow-800',
      'after_last': 'bg-navy-100 text-navy-800',
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
          <p className={styles.notConnectedText}>Etkinlikleri görmek için Google Calendar hesabınızı bağlayın.</p>
          <button
            className={styles.viewButton}
            onClick={() => (window.location.href = '/google-connect')}
          >
            Google Calendar'a Bağlan
          </button>
        </div>
      </div>
    );
  }

  // Compact view for grid layout
  if (compact) {
    return (
      <div className={styles.compactContainer}>
        {isLoading ? (
          <div className={styles.compactLoading}>
            <div className={styles.loadingSpinner}></div>
          </div>
        ) : events.length > 0 ? (
          <div className={styles.compactEventsList}>
            {events.slice(0, 5).map((day, dayIndex) => (
              day.events.length > 0 && (
                <div key={dayIndex} className={styles.compactDay}>
                  <div className={styles.compactDayHeader}>
                    <span className={styles.compactDayName}>{day.dayName}</span>
                    <span className={styles.compactDate}>
                      {day.date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })}
                    </span>
                  </div>
                  <div className={styles.compactEvents}>
                    {day.events.slice(0, 3).map((event, eventIndex) => (
                      <div key={eventIndex} className={styles.compactEvent}>
                        <span className={styles.compactEventTime}>{event.start} - {event.end}</span>
                        <span className={styles.compactEventTitle} title={event.title}>
                          {event.title.length > 20 ? `${event.title.substring(0, 20)}...` : event.title}
                        </span>
                      </div>
                    ))}
                    {day.events.length > 3 && (
                      <span className={styles.compactMore}>+{day.events.length - 3} daha</span>
                    )}
                  </div>
                </div>
              )
            ))}
            {events.filter(d => d.events.length > 0).length === 0 && (
              <p className={styles.compactEmpty}>Etkinlik yok</p>
            )}
          </div>
        ) : (
          <p className={styles.compactEmpty}>Etkinlik yok</p>
        )}
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <CalendarIcon className={styles.headerIcon} />
          <h3 className={styles.headerTitle}>
            Google Calendar - Haftalık Etkinlikler
          </h3>
        </div>
        <div className={styles.headerRight}>
          {lastUpdated && (
            <span className={styles.lastUpdated}>
              Son güncelleme: {lastUpdated.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
          <button
            className={styles.refreshButton}
            onClick={loadEvents}
            disabled={isLoading}
            title="Etkinlikleri yenile"
          >
            <ArrowPathIcon className={`${styles.refreshIcon} ${isLoading ? styles.spinning : ''}`} />
            {isLoading ? 'Yükleniyor...' : 'Yenile'}
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
      ) : events.length > 0 ? (
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead className={styles.tableHeader}>
              <tr>
                <th className={styles.tableHeaderCell}>Gün</th>
                <th className={styles.tableHeaderCell}>Tarih</th>
                <th className={styles.tableHeaderCell}>Etkinlikler</th>
                <th className={styles.tableHeaderCell}>Toplam Süre</th>
              </tr>
            </thead>
            <tbody className={styles.tableBody}>
              {events.map((day, dayIndex) => (
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
                    <div className={styles.eventsContainer}>
                      {day.events.map((event, eventIndex) => (
                        <div key={eventIndex} className={styles.eventItem}>
                          <div className={styles.eventTime}>
                            <ClockIcon className={styles.eventIcon} />
                            <span>{event.start} - {event.end}</span>
                          </div>
                          <div className={styles.eventDetails}>
                            <span className={styles.eventTitle}>{event.title}</span>
                            <span className={styles.eventDuration}>({event.duration} dk)</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </td>
                  <td className={styles.tableCell}>
                    <span className={styles.totalTime}>
                      {calculateTotalEventTime(day.events)}
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
            Bu hafta için etkinlik bulunamadı.
          </p>
          <p className={styles.emptySubtext}>
            Google Calendar'da henüz etkinlik eklenmemiş.
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

const calculateTotalEventTime = (events) => {
  let totalMinutes = 0;
  
  events.forEach(event => {
    totalMinutes += event.duration;
  });
  
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  
  if (hours > 0) {
    return `${hours}s ${minutes}dk`;
  }
  return `${minutes}dk`;
};

export default GoogleCalendarEvents;
