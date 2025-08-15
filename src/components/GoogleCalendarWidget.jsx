import React, { useState, useEffect } from 'react';
import { CalendarIcon, PlusIcon, RefreshIcon } from '@heroicons/react/24/outline';
import apiService from '../services/apiService';
import { useAuth } from '../contexts/AuthContext';
import styles from './GoogleCalendarWidget.module.css';

const GoogleCalendarWidget = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

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
          loadCalendarEvents();
        }
      }
    } catch (error) {
      console.error('Failed to check Google Calendar status:', error);
      setIsConnected(false);
    }
  };

  const loadCalendarEvents = async () => {
    if (!isConnected) {
      setError('Google Calendar bağlı değil');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const now = new Date();
      const endOfWeek = new Date(now);
      endOfWeek.setDate(now.getDate() + 7);

      const response = await apiService.getGoogleCalendarEvents(
        now.toISOString(),
        endOfWeek.toISOString(),
        10
      );

      if (response.success) {
        setEvents(response.data);
      } else {
        throw new Error(response.message || 'Takvim yüklenemedi');
      }
    } catch (error) {
      console.error('Calendar loading error:', error);
      setError('Takvim yüklenirken bir hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  const formatEventTime = (event) => {
    if (event.start?.dateTime) {
      const start = new Date(event.start.dateTime);
      const end = new Date(event.end.dateTime);
      
      const startTime = start.toLocaleTimeString('tr-TR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
      const endTime = end.toLocaleTimeString('tr-TR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
      
      return `${startTime} - ${endTime}`;
    }
    
    return 'Tüm gün';
  };

  const formatEventDate = (event) => {
    if (event.start?.dateTime) {
      const date = new Date(event.start.dateTime);
      return date.toLocaleDateString('tr-TR', {
        weekday: 'short',
        month: 'short',
        day: 'numeric'
      });
    } else if (event.start?.date) {
      const date = new Date(event.start.date);
      return date.toLocaleDateString('tr-TR', {
        weekday: 'short',
        month: 'short',
        day: 'numeric'
      });
    }
    return '';
  };

  if (!isConnected) {
    return (
      <div className={styles.widget}>
        <div className={styles.notConnected}>
          <CalendarIcon className={styles.notConnectedIcon} />
          <h3 className={styles.notConnectedTitle}>
            Google Calendar Bağlı Değil
          </h3>
          <p className={styles.notConnectedText}>
            Takvim etkinliklerinizi görmek için Google Calendar hesabınızı bağlayın.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.widget}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <CalendarIcon className={styles.headerIcon} />
          <h3 className={styles.headerTitle}>
            Google Calendar
          </h3>
        </div>
        <button
          onClick={loadCalendarEvents}
          disabled={isLoading}
          className={styles.refreshButton}
        >
          <RefreshIcon className={`${styles.refreshIcon} ${isLoading ? styles.spinning : ''}`} />
        </button>
      </div>

      {error && (
        <div className={styles.errorMessage}>
          <p className={styles.errorText}>{error}</p>
        </div>
      )}

      {isLoading ? (
        <div className={styles.loadingContainer}>
          <div className={styles.loadingSpinner}></div>
          <span className={styles.loadingText}>Yükleniyor...</span>
        </div>
      ) : events.length > 0 ? (
        <div className={styles.eventsList}>
          {events.slice(0, 5).map((event, index) => (
            <div key={index} className={styles.eventItem}>
              <div className={styles.eventDot}></div>
              <div className={styles.eventContent}>
                <p className={styles.eventTitle}>
                  {event.summary || 'Başlıksız Etkinlik'}
                </p>
                <p className={styles.eventTime}>
                  {formatEventDate(event)} • {formatEventTime(event)}
                </p>
                {event.description && (
                  <p className={styles.eventDescription}>
                    {event.description}
                  </p>
                )}
              </div>
            </div>
          ))}
          
          {events.length > 5 && (
            <div className={styles.moreEvents}>
              <p className={styles.moreEventsText}>
                +{events.length - 5} daha fazla etkinlik
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className={styles.emptyState}>
          <CalendarIcon className={styles.emptyIcon} />
          <p className={styles.emptyText}>
            Bu hafta için etkinlik bulunamadı.
          </p>
        </div>
      )}

      <div className={styles.footer}>
        <button
          onClick={() => window.open('https://calendar.google.com', '_blank')}
          className={styles.viewButton}
        >
          <PlusIcon className={styles.viewButtonIcon} />
          <span>Google Calendar'da Görüntüle</span>
        </button>
      </div>
    </div>
  );
};

export default GoogleCalendarWidget; 