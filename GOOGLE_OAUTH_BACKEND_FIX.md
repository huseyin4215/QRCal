# Google OAuth Backend Configuration Fix

## 🔍 Problem
You're getting the error: `Google OAuth client is not properly configured.`

**Specific Error:** `OAuth2Client is missing client secret.`

This happens because the backend is missing the `GOOGLE_CLIENT_SECRET` environment variable.

## 🚀 Quick Fix

### Step 1: Create Backend Environment File

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Create .env file:**
   ```bash
   # Windows PowerShell
   New-Item -Path ".env" -ItemType File -Force
   
   # Or manually create .env file in backend directory
   ```

3. **Add the following content to .env file:**
   ```env
   # Backend Environment Variables
   
   # Database Configuration
   MONGODB_URI=mongodb://localhost:27017/qrcal
   
   # JWT Configuration
   JWT_SECRET=qrcal-super-secret-jwt-key-2024-change-this-in-production
   JWT_EXPIRE=7d
   
   # Server Configuration
   PORT=5000
   NODE_ENV=development
   
   # Frontend URL
   FRONTEND_URL=http://localhost:8081
   
   # Google OAuth Configuration
   GOOGLE_CLIENT_ID=194091113508-rvckovns6g1gnn7mrh8atrnjoq53dm6l.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=GOCSPX-your-actual-client-secret-here
   GOOGLE_REDIRECT_URI=http://localhost:5000/api/google/callback
   ```

### Step 2: Get Your Google Client Secret

1. **Go to Google Cloud Console:**
   - Visit: https://console.cloud.google.com/
   - Select your project

2. **Navigate to OAuth 2.0 Credentials:**
   - Go to: **APIs & Services** > **Credentials**
   - Find your OAuth 2.0 Client ID: `194091113508-rvckovns6g1gnn7mrh8atrnjoq53dm6l.apps.googleusercontent.com`
   - Click on it to edit

3. **Copy the Client Secret:**
   - Look for the **Client Secret** field
   - Click **Show** to reveal the secret
   - Copy the entire secret (starts with `GOCSPX-`)

4. **Update your .env file:**
   - Replace `GOCSPX-your-actual-client-secret-here` with your actual client secret
   - Example: `GOOGLE_CLIENT_SECRET=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45pqr678stu901vwx234yz`

### Step 3: Restart Backend Server

1. **Stop your backend server** (Ctrl+C)
2. **Restart the backend server:**
   ```bash
   npm start
   # or
   node server.js
   ```

### Step 4: Test the Configuration

1. **Check backend logs** for successful configuration:
   ```
   === Google OAuth2Client Configuration ===
   Client ID: 194091113508-rvckovns6g1gnn7mrh8atrnjoq53dm6l.apps.googleusercontent.com
   Client Secret: present
   Redirect URI: http://localhost:5000/api/google/callback
   ```

2. **Test the OAuth URL endpoint:**
   - Visit: `http://localhost:5000/api/google/auth-url`
   - Should return a successful response with an auth URL

## 🔧 Alternative Solutions

### Option 1: Use Environment Variables (Recommended)

Make sure your backend `.env` file contains all required variables:

```env
# Google OAuth Configuration
GOOGLE_CLIENT_ID=194091113508-rvckovns6g1gnn7mrh8atrnjoq53dm6l.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-your-actual-client-secret-here
GOOGLE_REDIRECT_URI=http://localhost:5000/api/google/callback
```

### Option 2: Check Google Cloud Console Settings

1. **Verify OAuth 2.0 Client ID settings:**
   - **Authorized JavaScript origins:**
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

   - **Authorized redirect URIs:**
     ```
     http://localhost:5000/api/google/callback
     http://localhost:8081
     http://localhost:5173
     http://localhost:3000
     ```

## 🎯 Testing

1. **Check backend logs** for configuration messages
2. **Test OAuth URL generation:**
   ```bash
   curl http://localhost:5000/api/google/auth-url
   ```
3. **Try Google Sign-In again** from the frontend

## 🚨 Common Issues

### Issue 1: Still getting "client secret missing"
**Solution**: 
1. Make sure the `.env` file is in the `backend` directory
2. Restart the backend server after creating the file
3. Check that the client secret is copied correctly

### Issue 2: "Invalid client secret"
**Solution**: 
1. Verify the client secret from Google Cloud Console
2. Make sure there are no extra spaces or characters
3. The secret should start with `GOCSPX-`

### Issue 3: "Redirect URI mismatch"
**Solution**: 
1. Add the correct redirect URI to Google Cloud Console
2. Make sure it matches exactly: `http://localhost:5000/api/google/callback`

## 📞 Support

If you're still having issues:

1. **Check the backend logs** for specific error messages
2. **Verify your .env file** is in the correct location
3. **Ensure your Google Cloud Console settings** are correct
4. **Restart the backend server** after making changes

## 🔄 Code Changes Made

The following files have been updated to provide better error handling:

- `backend/routes/googleAuth.js` - Enhanced error messages and configuration validation
- `backend/.env.example` - Created example environment file

This ensures better debugging and configuration management.
