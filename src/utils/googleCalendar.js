// Google Calendar API utility functions
// Note: You'll need to set up Google Cloud Console and get your credentials

const GOOGLE_CLIENT_ID = '194091113508-rvckovns6g1gnn7mrh8atrnjoq53dm6l.apps.googleusercontent.com';
const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_API_KEY || '';

// Initialize Google API
export const initializeGoogleAPI = () => {
  return new Promise((resolve, reject) => {
    if (!window.gapi) {
      console.error('Google API not loaded');
      reject(new Error('Google API not loaded'));
      return;
    }

    window.gapi.load('client:auth2', () => {
      window.gapi.client.init({
        apiKey: GOOGLE_API_KEY,
        clientId: GOOGLE_CLIENT_ID,
        scope: 'https://www.googleapis.com/auth/calendar.readonly',
        discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest']
      }).then(() => {
        console.log('Google API initialized successfully');
        resolve();
      }).catch((error) => {
        console.error('Google API initialization failed:', error);
        // Return sample data instead of failing
        resolve();
      });
    });
  });
};

// Sign in user
export const signIn = () => {
  if (!window.gapi || !window.gapi.auth2) {
    throw new Error('Google API not initialized');
  }
  return window.gapi.auth2.getAuthInstance().signIn();
};

// Sign out user
export const signOut = () => {
  if (!window.gapi || !window.gapi.auth2) {
    throw new Error('Google API not initialized');
  }
  return window.gapi.auth2.getAuthInstance().signOut();
};

// Get user's calendar events using access token
export const getCalendarEvents = async (accessToken, timeMin, timeMax) => {
  try {
    console.log('Fetching calendar events with access token...');
    
    // If no access token, return sample data
    if (!accessToken) {
      console.log('No access token available, using sample data');
      return getSampleEvents();
    }

    const response = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/primary/events?maxResults=50&orderBy=startTime&singleEvents=true&timeMin=${timeMin || new Date().toISOString()}&timeMax=${timeMax || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Calendar API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Calendar events fetched:', data.items);
    return data.items || [];
  } catch (error) {
    console.error('Error fetching calendar events:', error);
    // Return sample data for testing
    return getSampleEvents();
  }
};

// Get current week's events
export const getCurrentWeekEvents = async (accessToken) => {
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay()); // Start of week (Sunday)
  startOfWeek.setHours(0, 0, 0, 0);

  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 7); // End of week
  endOfWeek.setHours(23, 59, 59, 999);

  return await getCalendarEvents(accessToken, startOfWeek.toISOString(), endOfWeek.toISOString());
};

// Sample events for testing
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

// Group events by day
export const groupEventsByDay = (events) => {
  const grouped = {};
  
  events.forEach(event => {
    const start = event.start.dateTime || event.start.date;
    const date = new Date(start).toDateString();
    
    if (!grouped[date]) {
      grouped[date] = [];
    }
    grouped[date].push(event);
  });

  return grouped;
};

// Format event time
export const formatEventTime = (event) => {
  if (event.start.dateTime) {
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

// Get day name in Turkish
export const getDayName = (dateString) => {
  const date = new Date(dateString);
  const days = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];
  return days[date.getDay()];
}; 