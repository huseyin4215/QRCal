#!/usr/bin/env node

/**
 * Google Cloud Console Configuration Checker
 * This script helps verify if your Google Cloud Console is properly configured for QRCal
 */

import https from 'https';
import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const CLIENT_ID = '194091113508-rvckovns6g1gnn7mrh8atrnjoq53dm6l.apps.googleusercontent.com';

console.log('🔍 QRCal Google Configuration Checker\n');
console.log('This script will help you verify your Google Cloud Console configuration.\n');

function checkGoogleAPIs() {
  console.log('📋 Checking Google APIs...\n');
  
  const requiredAPIs = [
    'Google+ API',
    'Google Calendar API', 
    'Google People API'
  ];
  
  console.log('Required APIs:');
  requiredAPIs.forEach(api => {
    console.log(`  ✅ ${api}`);
  });
  
  console.log('\n📝 Please verify these APIs are enabled in your Google Cloud Console:');
  console.log('   Go to: https://console.cloud.google.com/apis/library');
  console.log('   Search for and enable each API listed above\n');
}

function checkOAuthConfiguration() {
  console.log('🔐 OAuth 2.0 Configuration:\n');
  console.log(`Client ID: ${CLIENT_ID}\n`);
  
  console.log('Required Authorized JavaScript Origins:');
  console.log('  ✅ http://localhost:8081');
  console.log('  ✅ http://localhost:5173');
  console.log('  ✅ http://localhost:3000');
  console.log('  ✅ http://localhost:4173');
  console.log('  ✅ https://yourdomain.com (for production)\n');
  
  console.log('Required Authorized Redirect URIs:');
  console.log('  ✅ http://localhost:8081');
  console.log('  ✅ http://localhost:5173');
  console.log('  ✅ http://localhost:3000');
  console.log('  ✅ http://localhost:4173');
  console.log('  ✅ https://yourdomain.com (for production)\n');
  
  console.log('📝 Please verify these URLs are added in your Google Cloud Console:');
  console.log('   Go to: https://console.cloud.google.com/apis/credentials');
  console.log('   Edit your OAuth 2.0 Client ID');
  console.log('   Add the URLs above to the appropriate sections\n');
}

function checkOAuthConsentScreen() {
  console.log('📄 OAuth Consent Screen Configuration:\n');
  
  console.log('Required Scopes:');
  console.log('  ✅ https://www.googleapis.com/auth/userinfo.profile');
  console.log('  ✅ https://www.googleapis.com/auth/userinfo.email');
  console.log('  ✅ https://www.googleapis.com/auth/calendar.readonly');
  console.log('  ✅ https://www.googleapis.com/auth/calendar.events\n');
  
  console.log('📝 Please verify these scopes are added in your OAuth consent screen:');
  console.log('   Go to: https://console.cloud.google.com/apis/credentials/consent');
  console.log('   Add the scopes above to your app configuration\n');
}

function testClientID() {
  console.log('🧪 Testing Client ID...\n');
  
  const testUrl = `https://accounts.google.com/gsi/status?client_id=${CLIENT_ID}`;
  
  console.log(`Testing URL: ${testUrl}\n`);
  
  https.get(testUrl, (res) => {
    console.log(`Status Code: ${res.statusCode}`);
    
    if (res.statusCode === 200) {
      console.log('✅ Client ID appears to be valid');
    } else if (res.statusCode === 403) {
      console.log('❌ Client ID is valid but origin is not authorized');
      console.log('   This is the most common issue. Please add your domain to authorized origins.');
    } else {
      console.log(`⚠️  Unexpected status code: ${res.statusCode}`);
    }
    
    console.log('\n📝 Next steps:');
    console.log('   1. Follow the Google Sign-In Setup Guide: ./GOOGLE_SIGNIN_SETUP.md');
    console.log('   2. Add your development URL to authorized origins');
    console.log('   3. Wait 5-10 minutes for changes to propagate');
    console.log('   4. Test again\n');
    
    rl.close();
  }).on('error', (err) => {
    console.log('❌ Error testing client ID:', err.message);
    rl.close();
  });
}

function showSummary() {
  console.log('📊 Configuration Summary:\n');
  
  console.log('✅ What you need to do:');
  console.log('   1. Enable required Google APIs');
  console.log('   2. Configure OAuth 2.0 Client ID');
  console.log('   3. Set up OAuth consent screen');
  console.log('   4. Add authorized origins and redirect URIs');
  console.log('   5. Wait for changes to propagate\n');
  
  console.log('📚 Helpful Resources:');
  console.log('   - Google Sign-In Setup Guide: ./GOOGLE_SIGNIN_SETUP.md');
  console.log('   - Troubleshooting Guide: ./TROUBLESHOOTING.md');
  console.log('   - Google Cloud Console: https://console.cloud.google.com/\n');
  
  console.log('🔗 Quick Links:');
  console.log('   - APIs & Services: https://console.cloud.google.com/apis/library');
  console.log('   - Credentials: https://console.cloud.google.com/apis/credentials');
  console.log('   - OAuth Consent: https://console.cloud.google.com/apis/credentials/consent\n');
}

// Run all checks
checkGoogleAPIs();
checkOAuthConfiguration();
checkOAuthConsentScreen();
testClientID();
showSummary(); 