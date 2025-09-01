import express from 'express';
import { google } from 'googleapis';
import jwt from 'jsonwebtoken';
import { config } from 'dotenv';
import User from '../models/User.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { authMiddleware } from '../middleware/auth.js';

// Load environment variables in this module
config({ path: './.env' });

const router = express.Router();

// CORS middleware for Google OAuth
router.use((req, res, next) => {
  // Allow both old and new frontend ports
  const allowedOrigins = ['http://localhost:5173', 'http://localhost:8081'];
  const origin = req.headers.origin;
  
  if (allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  }
  
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, X-Client-Data');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Google OAuth 2.0 client - created dynamically to ensure environment variables are loaded
function createOAuth2Client() {
  // Always create a new instance to ensure environment variables are current
  const clientId = process.env.GOOGLE_CLIENT_ID || 'your-google-client-id';
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET || '';
  const redirectUri = process.env.GOOGLE_REDIRECT_URI || 'http://localhost:5000/api/google/callback';
  
  console.log('Creating OAuth2Client with:', {
    clientId: clientId,
    clientSecret: clientSecret ? 'present' : 'missing',
    redirectUri: redirectUri
  });
  
  return new google.auth.OAuth2(clientId, clientSecret, redirectUri);
}

// Log OAuth2Client configuration on startup
console.log('=== Google OAuth2Client Configuration ===');
console.log('Client ID:', process.env.GOOGLE_CLIENT_ID || 'your-google-client-id');
console.log('Client Secret:', process.env.GOOGLE_CLIENT_SECRET ? 'present' : 'missing');
console.log('Redirect URI:', process.env.GOOGLE_REDIRECT_URI || 'http://localhost:5000/api/google/callback');

// Test OAuth2Client creation for logging
console.log('Testing OAuth2Client creation...');
const testOAuth2Client = createOAuth2Client();
console.log('OAuth2Client test result - Client Secret:', testOAuth2Client._clientSecret ? 'present' : 'missing');

// Validate OAuth2Client configuration
if (!process.env.GOOGLE_CLIENT_SECRET) {
  console.error('⚠️  WARNING: GOOGLE_CLIENT_SECRET is missing! Google OAuth will not work properly.');
  console.error('Please create a .env file in the backend directory with the following content:');
  console.error(`
# Google OAuth Configuration
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=GOCSPX-your-actual-client-secret-here
GOOGLE_REDIRECT_URI=http://localhost:5000/api/google/callback
  `);
}

// @desc    Get Google OAuth URL
// @route   GET /api/google/auth-url
// @access  Public
router.get('/auth-url', asyncHandler(async (req, res) => {
  console.log('=== Generating Google OAuth URL ===');
  
  const scopes = [
    'https://www.googleapis.com/auth/calendar.readonly',
    'https://www.googleapis.com/auth/calendar.events',
    'https://www.googleapis.com/auth/userinfo.profile',
    'https://www.googleapis.com/auth/userinfo.email'
  ];

  console.log('Environment variables:');
  console.log('- GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID || 'your-google-client-id');
  console.log('- GOOGLE_CLIENT_SECRET:', process.env.GOOGLE_CLIENT_SECRET ? 'present' : 'missing');
  console.log('- GOOGLE_REDIRECT_URI:', process.env.GOOGLE_REDIRECT_URI || 'http://localhost:5000/api/google/callback');
  console.log('- Scopes:', scopes);

  // Check if required environment variables are set
  if (!process.env.GOOGLE_CLIENT_SECRET) {
    console.error('GOOGLE_CLIENT_SECRET is missing!');
    return res.status(500).json({
      success: false,
      message: 'Google OAuth configuration is incomplete. Please check environment variables.',
      details: `
GOOGLE_CLIENT_SECRET environment variable is missing. 

Please create a .env file in the backend directory with the following content:

# Google OAuth Configuration
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=GOCSPX-your-actual-client-secret-here
GOOGLE_REDIRECT_URI=http://localhost:5000/api/google/callback

You can get your client secret from:
https://console.cloud.google.com/apis/credentials
      `
    });
  }

  // Get OAuth2Client instance
  const oauth2Client = createOAuth2Client();
  
  // Validate OAuth2Client configuration
  if (!oauth2Client._clientSecret) {
    console.error('OAuth2Client is not properly configured!');
    return res.status(500).json({
      success: false,
      message: 'Google OAuth client is not properly configured.',
      details: `
OAuth2Client is missing client secret. Please check your environment variables.

Current configuration:
- Client ID: ${oauth2Client._clientId || 'missing'}
- Redirect URI: ${oauth2Client._redirectUri || 'missing'}
- Client Secret: ${oauth2Client._clientSecret ? 'present' : 'missing'}

Please ensure your .env file is properly configured and the backend has been restarted.
      `
    });
  }

  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
    prompt: 'consent', // Her zaman consent ekranını göster
    include_granted_scopes: true,
    response_type: 'code'
  });

  console.log('Generated auth URL:', authUrl);
  console.log('=== Google OAuth URL Generated Successfully ===');

  res.json({
    success: true,
    data: { authUrl }
  });
}));

// @desc    Google OAuth callback
// @route   GET /api/google/callback
// @access  Public
router.get('/callback', asyncHandler(async (req, res) => {
  const { code, error, state } = req.query;
  
  console.log('=== Google OAuth Callback Started ===');
  console.log('Query parameters:', req.query);
  console.log('Headers:', req.headers);
  
  // Check for OAuth errors first
  if (error) {
    console.error('Google OAuth error:', error);
    return res.status(400).json({
      success: false,
      message: `Google OAuth error: ${error}`
    });
  }
  
  if (!code) {
    console.error('No authorization code provided');
    return res.status(400).json({
      success: false,
      message: 'Authorization code is required'
    });
  }
  
  // Get userId from state parameter (for linking existing account)
  const userId = state;
  if (!userId) {
    console.error('No userId provided in state parameter for Google OAuth linking');
    return res.status(400).json({
      success: false,
      message: 'User ID is required to link Google Calendar'
    });
  }

  try {
    console.log('Processing OAuth callback with code:', code.substring(0, 10) + '...');
    
    // Get OAuth2Client instance
    const oauth2Client = createOAuth2Client();
    
    // Log OAuth2Client configuration
    console.log('OAuth2Client config:', {
      clientId: oauth2Client._clientId,
      redirectUri: oauth2Client._redirectUri,
      clientSecret: oauth2Client._clientSecret ? 'present' : 'missing'
    });
    
    // Validate OAuth2Client configuration before proceeding
    if (!oauth2Client._clientSecret) {
      throw new Error('OAuth2Client is not properly configured. Missing client secret.');
    }
    
    // Exchange code for tokens
    console.log('Exchanging code for tokens...');
    const { tokens } = await oauth2Client.getToken(code);
    console.log('Tokens received:', { 
      access_token: tokens.access_token ? 'present' : 'missing',
      refresh_token: tokens.refresh_token ? 'present' : 'missing',
      token_type: tokens.token_type
    });
    
    if (!tokens.access_token) {
      throw new Error('Failed to obtain access token from Google');
    }
    
    oauth2Client.setCredentials(tokens);

    // Get user info from Google
    console.log('Getting user info from Google...');
    const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
    const userInfo = await oauth2.userinfo.get();
    console.log('User info received:', { 
      id: userInfo.data.id,
      email: userInfo.data.email,
      name: userInfo.data.name
    });

    if (!userInfo.data.email) {
      throw new Error('Failed to obtain user email from Google');
    }

    // Find user by provided userId
    console.log('Looking for user with ID:', userId);
    let user = await User.findById(userId);

    if (!user) {
      console.error('User not found with ID:', userId);
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    console.log('Found existing user:', {
      userId: user._id,
      email: user.email,
      currentRole: user.role,
      existingGoogleId: user.googleId
    });

    // Check if this Google account is already linked to another user
    const existingGoogleUser = await User.findOne({ googleId: userInfo.data.id });
    if (existingGoogleUser && existingGoogleUser._id.toString() !== userId) {
      console.error('Google account already linked to another user:', existingGoogleUser._id);
      return res.status(400).json({
        success: false,
        message: 'Bu Google hesabı başka bir kullanıcıya bağlı. Lütfen farklı bir Google hesabı kullanın.'
      });
    }

    // Update user's Google info
    user.googleId = userInfo.data.id;
    user.googleAccessToken = tokens.access_token;
    user.googleRefreshToken = tokens.refresh_token || user.googleRefreshToken; // Keep existing refresh token if new one not provided
    user.googleTokenExpiry = tokens.expiry_date;
    
    // Update name if it changed
    if (user.name !== userInfo.data.name) {
      console.log('Name updated from', user.name, 'to', userInfo.data.name);
      user.name = userInfo.data.name;
    }

    console.log('Attempting to save user...');
    await user.save();
    console.log('User saved successfully with ID:', user._id);

    // Generate JWT token
    console.log('Generating JWT token for user:', user.email);
    const jwtSecret = process.env.JWT_SECRET || 'qrcal-super-secret-jwt-key-2024-change-this-in-production';
    
    const token = jwt.sign(
      { id: user._id },
      jwtSecret,
      { expiresIn: '7d' }
    );
    console.log('JWT token generated successfully');

    console.log('=== Google OAuth Callback Completed Successfully ===');
    console.log('User authenticated:', { email: user.email, role: user.role, googleConnected: true });

    // Redirect to frontend with JWT token
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const redirectUrl = `${frontendUrl}/google-auth-callback?token=${encodeURIComponent(token)}&success=true`;
    
    console.log('Redirecting to frontend:', redirectUrl);
    res.redirect(redirectUrl);

  } catch (error) {
    console.error('=== Google OAuth Callback Error ===');
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      code: error.code,
      status: error.status
    });
    
    // More specific error handling
    let errorMessage = 'Google authentication failed';
    let errorDetails = error.message;
    
    if (error.message.includes('invalid_request')) {
      errorMessage = 'Geçersiz OAuth isteği. Bu genellikle şu durumlardan kaynaklanır:';
      errorDetails = `
        1. Aynı hesap ile tekrar bağlanmaya çalışıyorsunuz
        2. Google Cloud Console'da redirect URI'lar doğru yapılandırılmamış
        3. Client ID veya Client Secret yanlış
        4. OAuth consent screen'de gerekli izinler verilmemiş
        
        Lütfen şunları kontrol edin:
        - Google Cloud Console'da "Authorized redirect URIs" listesinde "${process.env.GOOGLE_REDIRECT_URI || 'http://localhost:5000/api/google/callback'}" var mı?
        - OAuth consent screen'de Calendar API izinleri verilmiş mi?
        - Environment variables doğru yüklenmiş mi?
        - Backend log'larında "GOOGLE_CLIENT_SECRET is missing" uyarısı var mı?
      `;
    } else if (error.message.includes('access_denied')) {
      errorMessage = 'Erişim reddedildi. Lütfen izinleri onaylayın.';
    } else if (error.message.includes('invalid_grant')) {
      errorMessage = 'Geçersiz yetkilendirme kodu. Lütfen tekrar deneyin.';
    } else if (error.message.includes('redirect_uri_mismatch')) {
      errorMessage = 'Redirect URI uyumsuzluğu. Lütfen Google Cloud Console ayarlarını kontrol edin.';
    } else if (error.message.includes('OAuth2Client is not properly configured')) {
      errorMessage = 'Google OAuth yapılandırması eksik. Lütfen environment variables\'ları kontrol edin.';
    } else {
      errorMessage = `Google authentication failed: ${error.message}`;
    }
    
    res.status(500).json({
      success: false,
      message: errorMessage,
      details: errorDetails
    });
  }
}));

// @desc    Test Google OAuth configuration
// @route   GET /api/google/test-config
// @access  Public
router.get('/test-config', asyncHandler(async (req, res) => {
  console.log('=== Testing Google OAuth Configuration ===');
  
  // Get OAuth2Client instance for testing
  const oauth2Client = createOAuth2Client();
  
  const config = {
    environment: {
      clientId: process.env.GOOGLE_CLIENT_ID || 'your-google-client-id',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ? 'present' : 'missing',
      redirectUri: process.env.GOOGLE_REDIRECT_URI || 'http://localhost:5000/api/google/callback',
      jwtSecret: process.env.JWT_SECRET ? 'present' : 'missing'
    },
    oauth2Client: {
      clientId: oauth2Client._clientId,
      redirectUri: oauth2Client._redirectUri,
      clientSecret: oauth2Client._clientSecret ? 'present' : 'missing'
    },
    validation: {
      hasClientSecret: !!process.env.GOOGLE_CLIENT_SECRET,
      hasOAuth2ClientSecret: !!oauth2Client._clientSecret,
      isConfigured: !!(process.env.GOOGLE_CLIENT_SECRET && oauth2Client._clientSecret)
    }
  };
  
  console.log('Configuration:', config);
  
  res.json({
    success: true,
    data: config,
    message: 'Google OAuth configuration test completed',
    status: config.validation.isConfigured ? 'ready' : 'not_configured'
  });
}));

// @desc    Get user's Google Calendar events
// @route   GET /api/google/calendar/events
// @access  Private
router.get('/calendar/events', authMiddleware, asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  
  if (!user.googleAccessToken) {
    return res.status(400).json({
      success: false,
      message: 'Google Calendar not connected'
    });
  }

  try {
    // Get OAuth2Client instance and set credentials for this user
    const oauth2Client = createOAuth2Client();
    oauth2Client.setCredentials({
      access_token: user.googleAccessToken,
      refresh_token: user.googleRefreshToken
    });

    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
    
    const { timeMin, timeMax, maxResults = 50 } = req.query;
    
    const response = await calendar.events.list({
      calendarId: 'primary',
      timeMin: timeMin || new Date().toISOString(),
      timeMax: timeMax || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      maxResults: parseInt(maxResults),
      singleEvents: true,
      orderBy: 'startTime',
    });

    res.json({
      success: true,
      data: response.data.items || []
    });

  } catch (error) {
    console.error('Calendar API error:', error);
    
    // Handle invalid_grant error (token expired or revoked) - check multiple conditions
    const isInvalidGrant = (
      (error.code === 400 && error.message && error.message.includes('invalid_grant')) ||
      (error.message && error.message.includes('invalid_grant')) ||
      (error.response && error.response.data && error.response.data.error === 'invalid_grant') ||
      (typeof error === 'string' && error.includes('invalid_grant'))
    );
    
    if (isInvalidGrant) {
      console.log('Invalid grant error detected, clearing tokens...');
      console.log('Error details:', {
        code: error.code,
        message: error.message,
        response: error.response?.data
      });
      
      // Clear invalid tokens
      user.googleAccessToken = undefined;
      user.googleRefreshToken = undefined;
      user.googleTokenExpiry = undefined;
      await user.save();
      
      return res.status(401).json({
        success: false,
        message: 'Google Calendar access expired. Please reconnect your account.',
        error: 'invalid_grant',
        requiresReauth: true
      });
    }
    
    // If token expired, try to refresh
    if (error.code === 401 && user.googleRefreshToken) {
      try {
        console.log('Token expired, attempting to refresh...');
        
        // Get OAuth2Client instance for refresh
        const oauth2Client = createOAuth2Client();
        oauth2Client.setCredentials({
          refresh_token: user.googleRefreshToken
        });
        
        const { credentials } = await oauth2Client.refreshAccessToken();
        console.log('Token refreshed successfully');
        
        // Update user's tokens
        user.googleAccessToken = credentials.access_token;
        user.googleTokenExpiry = credentials.expiry_date;
        await user.save();

        // Retry the request with new token
        oauth2Client.setCredentials(credentials);
        const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
        
        const response = await calendar.events.list({
          calendarId: 'primary',
          timeMin: req.query.timeMin || new Date().toISOString(),
          timeMax: req.query.timeMax || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          maxResults: parseInt(req.query.maxResults) || 50,
          singleEvents: true,
          orderBy: 'startTime',
        });

        return res.json({
          success: true,
          data: response.data.items || []
        });

      } catch (refreshError) {
        console.error('Token refresh error:', refreshError);
        return res.status(401).json({
          success: false,
          message: 'Google Calendar access expired. Please reconnect your account.'
        });
      }
    }

    res.status(500).json({
      success: false,
      message: 'Failed to fetch calendar events',
      error: error.message
    });
  }
}));

// @desc    Create Google Calendar event for appointment
// @route   POST /api/google/calendar/appointment-event
// @access  Private
router.post('/calendar/appointment-event', authMiddleware, asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  
  if (!user.googleAccessToken) {
    return res.status(400).json({
      success: false,
      message: 'Google Calendar not connected'
    });
  }

  const { 
    summary, 
    description, 
    startDateTime, 
    endDateTime, 
    studentEmail,
    location = 'Ofis'
  } = req.body;

  if (!summary || !startDateTime || !endDateTime) {
    return res.status(400).json({
      success: false,
      message: 'Summary, startDateTime, and endDateTime are required'
    });
  }

  try {
    // Get OAuth2Client instance and set credentials for this user
    const oauth2Client = createOAuth2Client();
    oauth2Client.setCredentials({
      access_token: user.googleAccessToken,
      refresh_token: user.googleRefreshToken
    });

    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
    
    const event = {
      summary: summary,
      description: description || 'Öğrenci randevu talebi',
      start: {
        dateTime: startDateTime,
        timeZone: 'Europe/Istanbul',
      },
      end: {
        dateTime: endDateTime,
        timeZone: 'Europe/Istanbul',
      },
      location: location,
      attendees: studentEmail ? [{ email: studentEmail }] : [],
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'email', minutes: 24 * 60 }, // 24 hours before
          { method: 'popup', minutes: 30 }, // 30 minutes before
        ],
      },
      colorId: '1', // Blue color for appointments
    };

    const response = await calendar.events.insert({
      calendarId: 'primary',
      resource: event,
      sendUpdates: 'all',
    });

    console.log('Google Calendar event created:', response.data.id);

    res.json({
      success: true,
      data: {
        eventId: response.data.id,
        event: response.data
      },
      message: 'Google Calendar event created successfully'
    });

  } catch (error) {
    console.error('Calendar event creation error:', error);
    
    // If token expired, try to refresh
    if (error.code === 401 && user.googleRefreshToken) {
      try {
        console.log('Token expired during event creation, attempting to refresh...');
        
        const oauth2Client = createOAuth2Client();
        oauth2Client.setCredentials({
          refresh_token: user.googleRefreshToken
        });
        
        const { credentials } = await oauth2Client.refreshAccessToken();
        
        // Update user's tokens
        user.googleAccessToken = credentials.access_token;
        user.googleTokenExpiry = credentials.expiry_date;
        await user.save();

        // Retry the request with new token
        oauth2Client.setCredentials(credentials);
        const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
        
        const response = await calendar.events.insert({
          calendarId: 'primary',
          resource: event,
          sendUpdates: 'all',
        });

        console.log('Google Calendar event created after token refresh:', response.data.id);

        return res.json({
          success: true,
          data: {
            eventId: response.data.id,
            event: response.data
          },
          message: 'Google Calendar event created successfully'
        });

      } catch (refreshError) {
        console.error('Token refresh error during event creation:', refreshError);
        return res.status(401).json({
          success: false,
          message: 'Google Calendar access expired. Please reconnect your account.'
        });
      }
    }

    res.status(500).json({
      success: false,
      message: 'Failed to create calendar event',
      error: error.message
    });
  }
}));

// @desc    Check if user is connected to Google Calendar
// @route   GET /api/google/status
// @access  Private
router.get('/status', authMiddleware, asyncHandler(async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const isConnected = !!(user.googleAccessToken || user.googleId);
    
    res.json({
      success: true,
      data: {
        isConnected,
        googleId: user.googleId,
        hasAccessToken: !!user.googleAccessToken,
        hasRefreshToken: !!user.googleRefreshToken,
        tokenExpiry: user.googleTokenExpiry
      }
    });
  } catch (error) {
    console.error('Google status check error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check Google connection status'
    });
  }
}));

// @desc    Disconnect Google Calendar
// @route   DELETE /api/google/disconnect
// @access  Private
router.delete('/disconnect', authMiddleware, asyncHandler(async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Clear Google tokens
    user.googleId = undefined;
    user.googleAccessToken = undefined;
    user.googleRefreshToken = undefined;
    user.googleTokenExpiry = undefined;
    
    await user.save();

    res.json({
      success: true,
      message: 'Google Calendar bağlantısı başarıyla kesildi'
    });
  } catch (error) {
    console.error('Google disconnect error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to disconnect Google Calendar'
    });
  }
}));

// @desc    Load availability from Google Calendar
// @route   POST /api/google/calendar/load-availability
// @access  Private
router.post('/calendar/load-availability', authMiddleware, asyncHandler(async (req, res) => {
  const { user } = req;
  
  if (!user.googleAccessToken) {
    return res.status(400).json({
      success: false,
      message: 'Google Calendar bağlı değil'
    });
  }

  try {
    const oauth2Client = createOAuth2Client();
    oauth2Client.setCredentials({
      access_token: user.googleAccessToken,
      refresh_token: user.googleRefreshToken
    });

    // Get current week's start and end
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay() + 1); // Monday
    startOfWeek.setHours(0, 0, 0, 0);
    
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6); // Sunday
    endOfWeek.setHours(23, 59, 59, 999);

    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
    
    const response = await calendar.events.list({
      calendarId: 'primary',
      timeMin: startOfWeek.toISOString(),
      timeMax: endOfWeek.toISOString(),
      singleEvents: true,
      orderBy: 'startTime'
    });

    const events = response.data.items || [];
    
    // Process events to find busy times
    const busyTimes = events.map(event => {
      const start = new Date(event.start.dateTime || event.start.date);
      const end = new Date(event.end.dateTime || event.end.date);
      
      return {
        start: start.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
        end: end.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
        date: start.toISOString().split('T')[0],
        day: start.toLocaleDateString('en-US', { weekday: 'long' }),
        summary: event.summary || 'Meşgul'
      };
    });

    // Group by day
    const availabilityByDay = {};
    const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    
    dayNames.forEach(day => {
      availabilityByDay[day] = {
        day,
        isActive: true,
        timeSlots: []
      };
    });

    // Add busy times to availability
    busyTimes.forEach(busyTime => {
      if (availabilityByDay[busyTime.day]) {
        availabilityByDay[busyTime.day].timeSlots.push({
          start: busyTime.start,
          end: busyTime.end,
          isAvailable: false,
          summary: busyTime.summary
        });
      }
    });

    // Update user's availability
    user.availability = Object.values(availabilityByDay);
    await user.save();

    res.json({
      success: true,
      message: 'Google Calendar\'dan müsaitlik yüklendi',
      data: {
        busyTimes,
        availability: user.availability
      }
    });

  } catch (error) {
    console.error('Failed to load availability from Google Calendar:', error);
    
    // Try to refresh token
    if (error.code === 401) {
      try {
        const oauth2Client = createOAuth2Client();
        oauth2Client.setCredentials({
          refresh_token: user.googleRefreshToken
        });
        
        const { tokens } = await oauth2Client.refreshAccessToken();
        
        // Update user's tokens
        user.googleAccessToken = tokens.access_token;
        if (tokens.refresh_token) {
          user.googleRefreshToken = tokens.refresh_token;
        }
        user.googleTokenExpiry = tokens.expiry_date;
        await user.save();
        
        // Retry the request
        return res.redirect(req.originalUrl);
        
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
        return res.status(401).json({
          success: false,
          message: 'Google Calendar erişimi süresi doldu. Lütfen tekrar bağlanın.'
        });
      }
    }
    
    res.status(500).json({
      success: false,
      message: 'Google Calendar\'dan müsaitlik yüklenemedi',
      error: error.message
    });
  }
}));

export default router; 