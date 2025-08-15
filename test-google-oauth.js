#!/usr/bin/env node

/**
 * Google OAuth Client ID Test Script
 * This script tests if the Google OAuth client ID is properly configured
 */

const CLIENT_ID = '194091113508-rvckovns6g1gnn7mrh8atrnjoq53dm6l.apps.googleusercontent.com';

console.log('🔍 Testing Google OAuth Client ID Configuration\n');

console.log('Client ID:', CLIENT_ID);
console.log('\nTesting origins...\n');

const testOrigins = [
  'http://localhost:8081',
  'http://localhost:5173', 
  'http://localhost:3000',
  'http://127.0.0.1:8081',
  'http://127.0.0.1:5173'
];

console.log('Required Authorized JavaScript Origins:');
testOrigins.forEach(origin => {
  console.log(`  ${origin}`);
});

console.log('\n📝 To fix the "unregistered_origin" error:');
console.log('1. Go to: https://console.cloud.google.com/apis/credentials');
console.log('2. Find your OAuth 2.0 Client ID');
console.log('3. Click on the client ID to edit');
console.log('4. Under "Authorized JavaScript origins", add:');
testOrigins.forEach(origin => {
  console.log(`   - ${origin}`);
});

console.log('\n5. Click "Save"');
console.log('6. Wait 5-10 minutes for changes to propagate');
console.log('7. Test again\n');

console.log('🔗 Direct Links:');
console.log('- Google Cloud Console: https://console.cloud.google.com/');
console.log('- APIs & Services > Credentials: https://console.cloud.google.com/apis/credentials');
console.log('- OAuth 2.0 Client IDs: https://console.cloud.google.com/apis/credentials/oauthclient');

console.log('\n⚠️  Important Notes:');
console.log('- Make sure you are using the correct Google Cloud Project');
console.log('- Ensure the OAuth consent screen is configured');
console.log('- Verify that required APIs are enabled');
console.log('- Wait for changes to propagate (5-10 minutes)'); 