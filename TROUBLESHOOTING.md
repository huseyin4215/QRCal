# QRCal Troubleshooting Guide

## Common Issues and Solutions

### 1. Google Sign-In 403 Forbidden Error

**Problem**: `GET https://accounts.google.com/gsi/status?client_id=... 403 (Forbidden)`

**Solution**: 
1. Follow the [Google Sign-In Setup Guide](./GOOGLE_SIGNIN_SETUP.md)
2. Add your development URL to Google Cloud Console:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Navigate to "APIs & Services" > "Credentials"
   - Edit your OAuth 2.0 Client ID
   - Add `http://localhost:8081` to "Authorized JavaScript origins"
   - Save changes and wait 5-10 minutes

### 2. Students Getting Logged Out When Creating Appointments

**Problem**: Students are redirected to login page when trying to create new appointments

**Causes**:
- Missing Google Calendar permissions
- Authentication token expired
- API endpoint errors

**Solutions**:
1. **Check Google Calendar Permissions**:
   - Students need to grant Google Calendar access
   - The system will prompt for permissions when needed
   - Ensure the Google Calendar API is enabled in Google Cloud Console

2. **Check Authentication**:
   - Verify the user is properly logged in
   - Check if the token is valid
   - Clear browser cache and cookies if needed

3. **Check API Endpoints**:
   - Ensure the backend server is running
   - Check network connectivity
   - Verify API routes are working

### 3. Admin Dashboard Not Loading

**Problem**: Admin users are redirected back to login page

**Causes**:
- User role not properly set to 'admin'
- Authentication middleware issues
- Route protection problems

**Solutions**:
1. **Check User Role**:
   - Verify the user has `role: 'admin'` in the database
   - Check the user object in localStorage
   - Ensure the admin user was created properly

2. **Check Authentication**:
   - Verify the JWT token is valid
   - Check if the token hasn't expired
   - Ensure the user is active in the database

3. **Check Route Protection**:
   - Verify the AdminRoute component is working
   - Check browser console for any errors
   - Ensure the auth context is properly initialized

### 4. API Connection Issues

**Problem**: Frontend can't connect to backend API

**Solutions**:
1. **Check Backend Server**:
   ```bash
   cd backend
   npm start
   ```
   - Ensure the server is running on the correct port
   - Check for any error messages

2. **Check Environment Variables**:
   - Verify `VITE_API_URL` is set correctly in `.env`
   - Default should be `http://localhost:5000/api`

3. **Check CORS Settings**:
   - Ensure the backend allows requests from the frontend
   - Check if the frontend URL is in the allowed origins

### 5. Database Connection Issues

**Problem**: Backend can't connect to MongoDB

**Solutions**:
1. **Check MongoDB Connection**:
   - Ensure MongoDB is running
   - Verify the connection string in `.env`
   - Check if the database exists

2. **Check Environment Variables**:
   ```env
   MONGODB_URI=mongodb://localhost:27017/qrcal
   ```

### 6. Google Calendar Integration Issues

**Problem**: Calendar events not syncing properly

**Solutions**:
1. **Check Google Calendar API**:
   - Enable Google Calendar API in Google Cloud Console
   - Verify the API key has proper permissions
   - Check if the service account is configured

2. **Check Scopes**:
   - Ensure the required scopes are included:
     - `https://www.googleapis.com/auth/calendar.readonly`
     - `https://www.googleapis.com/auth/calendar.events`

### 7. Development Environment Setup

**Problem**: Application not working in development

**Solutions**:
1. **Install Dependencies**:
   ```bash
   # Frontend
   npm install
   
   # Backend
   cd backend
   npm install
   ```

2. **Start Development Servers**:
   ```bash
   # Frontend (in root directory)
   npm run dev
   
   # Backend (in backend directory)
   npm start
   ```

3. **Check Ports**:
   - Frontend: `http://localhost:5173`
   - Backend: `http://localhost:5000`

### 8. Production Deployment Issues

**Problem**: Application not working in production

**Solutions**:
1. **Environment Variables**:
   - Set all required environment variables
   - Use HTTPS URLs for Google APIs
   - Configure proper CORS settings

2. **Google Cloud Console**:
   - Add production domain to authorized origins
   - Update OAuth consent screen
   - Configure proper redirect URIs

3. **Database**:
   - Use production MongoDB instance
   - Ensure proper network access
   - Configure backup and monitoring

## Debugging Steps

### 1. Check Browser Console
- Open Developer Tools (F12)
- Look for JavaScript errors
- Check Network tab for failed requests

### 2. Check Backend Logs
- Monitor the backend server console
- Look for error messages
- Check database connection logs

### 3. Check Database
- Verify user records exist
- Check user roles are correct
- Ensure appointments are being created

### 4. Test API Endpoints
- Use Postman or curl to test API endpoints
- Verify authentication is working
- Check response formats

## Common Error Messages

### "The given origin is not allowed for the given client ID"
- Add your domain to Google Cloud Console authorized origins

### "Invalid redirect URI"
- Add your redirect URI to Google Cloud Console

### "Access blocked"
- Check OAuth consent screen settings
- Add test users if in testing mode

### "Token expired"
- User needs to log in again
- Check JWT secret configuration

### "User not found"
- Check if user exists in database
- Verify email/username is correct

## Getting Help

If you're still experiencing issues:

1. Check the browser console for specific error messages
2. Review the backend server logs
3. Verify all environment variables are set correctly
4. Ensure all dependencies are installed
5. Check if the issue is related to recent changes

For additional support, please provide:
- Error messages from browser console
- Backend server logs
- Steps to reproduce the issue
- Environment details (OS, Node.js version, etc.) 