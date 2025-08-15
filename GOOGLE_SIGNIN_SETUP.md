# Google Sign-In Setup Guide

## Problem
You're getting a 403 Forbidden error when trying to use Google Sign-In. This is because the origin (domain) is not allowed in your Google Cloud Console configuration.

## Solution

### 1. Go to Google Cloud Console
1. Visit [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project or create a new one
3. Go to "APIs & Services" > "Credentials"

### 2. Configure OAuth 2.0 Client ID
1. Find your OAuth 2.0 Client ID: `194091113508-rvckovns6g1gnn7mrh8atrnjoq53dm6l.apps.googleusercontent.com`
2. Click on it to edit
3. In the "Authorized JavaScript origins" section, add these URLs:
   ```
   http://localhost:8081
   http://localhost:5173
   http://localhost:3000
   http://localhost:4173
   https://yourdomain.com (if you have a production domain)
   ```

### 3. Configure Authorized Redirect URIs
Add these redirect URIs:
```
http://localhost:8081
http://localhost:5173
http://localhost:3000
http://localhost:4173
https://yourdomain.com (if you have a production domain)
```

### 4. Enable Required APIs
Go to "APIs & Services" > "Library" and enable:
- Google+ API
- Google Calendar API
- Google People API

### 5. Configure Consent Screen
1. Go to "APIs & Services" > "OAuth consent screen"
2. Add your domain to "Authorized domains"
3. Add the required scopes:
   - `https://www.googleapis.com/auth/userinfo.profile`
   - `https://www.googleapis.com/auth/userinfo.email`
   - `https://www.googleapis.com/auth/calendar.readonly`
   - `https://www.googleapis.com/auth/calendar.events`

### 6. Test the Configuration
After making these changes, wait a few minutes for the changes to propagate, then test your Google Sign-In again.

## Common Issues

### Issue 1: "The given origin is not allowed for the given client ID"
**Solution**: Make sure you've added your development URL to "Authorized JavaScript origins"

### Issue 2: "Invalid redirect URI"
**Solution**: Add your redirect URI to the "Authorized redirect URIs" list

### Issue 3: "Access blocked"
**Solution**: Check if your app is in "Testing" mode and add test users, or publish it

## Development vs Production

### Development
- Use `http://localhost:5173` (Vite default)
- Use `http://localhost:3000` (if using different port)

### Production
- Replace with your actual domain
- Use HTTPS URLs only
- Update environment variables accordingly

## Environment Variables

Make sure your `.env` file has:
```
VITE_GOOGLE_CLIENT_ID=194091113508-rvckovns6g1gnn7mrh8atrnjoq53dm6l.apps.googleusercontent.com
```

## Testing

1. Clear your browser cache
2. Restart your development server
3. Try Google Sign-In again
4. Check browser console for any remaining errors

## Additional Notes

- Google Sign-In requires HTTPS in production
- The client ID must match exactly
- Changes in Google Console can take up to 10 minutes to propagate
- Make sure you're using the correct client ID for your environment 