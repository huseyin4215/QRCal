# Google OAuth Origin Issue Fix

## 🔍 Problem
You're getting the error: `[GSI_LOGGER]: The given origin is not allowed for the given client ID.`

**Specific Error:** `unregistered_origin`

This happens because the current origin (domain) is not authorized in your Google Cloud Console configuration.

## 🚀 Quick Fix

### Step 1: Check Your Current Origin
Open your browser's developer tools (F12) and check the console. The error will show you the current origin that needs to be authorized.

**Common development origins:**
- `http://localhost:5173` (Vite default)
- `http://localhost:3000` (React default)
- `http://localhost:8081` (Custom port)
- `http://localhost:4173` (Vite preview)
- `http://127.0.0.1:5173` (Alternative localhost)

### Step 2: Update Google Cloud Console

1. **Go to Google Cloud Console**
   - Visit: https://console.cloud.google.com/
   - Select your project

2. **Navigate to OAuth 2.0 Credentials**
   - Go to: **APIs & Services** > **Credentials**
   - Find your OAuth 2.0 Client ID: `194091113508-rvckovns6g1gnn7mrh8atrnjoq53dm6l.apps.googleusercontent.com`
   - Click on it to edit

3. **Add Authorized JavaScript Origins**
   Add these URLs to the **Authorized JavaScript origins** section:
   ```
   http://localhost:5173
   http://localhost:3000
   http://localhost:8081
   http://localhost:4173
   http://127.0.0.1:5173
   http://127.0.0.1:3000
   http://127.0.0.1:8081
   http://127.0.0.1:4173
   ```

4. **Add Authorized Redirect URIs**
   Add these URLs to the **Authorized redirect URIs** section:
   ```
   http://localhost:5173
   http://localhost:3000
   http://localhost:8081
   http://localhost:4173
   http://127.0.0.1:5173
   http://127.0.0.1:3000
   http://127.0.0.1:8081
   http://127.0.0.1:4173
   ```

5. **Save Changes**
   - Click **Save** at the bottom of the page
   - Wait 5-10 minutes for changes to propagate

### Step 3: Environment Configuration

1. **Create .env file** (if not exists):
   ```bash
   cp env.example .env
   ```

2. **Update .env file**:
   ```env
   # Frontend Environment Variables
   VITE_API_URL=http://localhost:5000/api
   VITE_APP_NAME=QR Takvim
   VITE_APP_DESCRIPTION=Akademik Randevu Sistemi
   
   # Google OAuth Configuration
   VITE_GOOGLE_CLIENT_ID=194091113508-rvckovns6g1gnn7mrh8atrnjoq53dm6l.apps.googleusercontent.com
   ```

### Step 4: Restart Development Server

1. **Stop your development server** (Ctrl+C)
2. **Clear browser cache** (Ctrl+Shift+R)
3. **Restart development server**:
   ```bash
   npm run dev
   ```

## 🔧 Enhanced Error Handling

The code has been updated to provide better error messages. When you encounter the `unregistered_origin` error, you'll now see:

1. **Specific error details** including the current origin
2. **Step-by-step solution** with exact URLs to add
3. **Direct link** to Google Cloud Console

### Error Message Example:
```
Google OAuth yapılandırması eksik.

Hata: unregistered_origin
Mevcut origin: http://localhost:5173

Çözüm:
1. Google Cloud Console'a gidin: https://console.cloud.google.com/
2. APIs & Services > Credentials
3. OAuth 2.0 Client ID'nizi düzenleyin
4. "Authorized JavaScript origins" bölümüne şunu ekleyin:
   http://localhost:5173

5. Değişiklikleri kaydedin ve 5-10 dakika bekleyin.
```

## 🎯 Testing

1. **Clear browser cache and cookies**
2. **Restart development server**
3. **Try Google Sign-In again**
4. **Check browser console for errors**

## 🚨 Common Issues

### Issue 1: Still getting origin error
**Solution**: Wait 5-10 minutes for Google Cloud Console changes to propagate

### Issue 2: "This app isn't verified"
**Solution**: This is normal for development. Click "Advanced" > "Go to [App Name] (unsafe)"

### Issue 3: "Access blocked"
**Solution**: 
1. Go to **OAuth consent screen**
2. Add your email as a test user
3. Or publish the app for production

### Issue 4: Popup blocked
**Solution**: 
1. Allow popups for your domain
2. Disable popup blockers
3. Try incognito mode

## 📞 Support

If you're still having issues:

1. **Check the console logs** for specific error messages
2. **Verify your Google Cloud Console settings**
3. **Ensure your .env file is properly configured**
4. **Wait for changes to propagate** (5-10 minutes)

## 🔄 Code Changes Made

The following files have been updated to use environment variables and provide better error handling:

- `src/pages/AdminDashboard.jsx` - Enhanced error handling with specific origin information
- `src/pages/FacultyDashboard.jsx` - Enhanced error handling with specific origin information
- `env.example` - Added Google client ID configuration

This ensures better security and flexibility for different environments.
