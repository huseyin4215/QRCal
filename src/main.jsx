import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import './styles/dashboard-responsive.css'

// PWA Service Worker Registration
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    // Check if service worker registration is blocked (e.g., by ad blocker)
    try {
      navigator.serviceWorker.register('/sw.js', { scope: '/' })
        .then((registration) => {
          console.log('Service Worker registered successfully:', registration);
          
          // Check for updates
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  // New service worker available
                  console.log('New service worker available');
                  // You can show a notification to the user here
                }
              });
            }
          });
        })
        .catch((error) => {
          // Silently handle service worker registration errors
          // This is often caused by ad blockers or privacy extensions
          if (error.name === 'SecurityError' || error.message.includes('blocked')) {
            console.warn('Service Worker registration blocked (likely by browser extension):', error.message);
          } else {
            console.error('Service Worker registration failed:', error);
          }
        });
    } catch (error) {
      // Handle synchronous errors
      console.warn('Service Worker registration error:', error.message);
    }
  });
}

ReactDOM.createRoot(document.getElementById('root')).render(
  // StrictMode dev’de bazı efektleri iki kez çalıştırır; sorun yaşıyorsanız geçici olarak kaldırıldı
  <App />
);
