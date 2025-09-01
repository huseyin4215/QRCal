import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import './styles/dashboard-responsive.css'

// PWA Service Worker Registration
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('Service Worker registered successfully:', registration);
        
        // Check for updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New service worker available
              console.log('New service worker available');
              // You can show a notification to the user here
            }
          });
        });
      })
      .catch((error) => {
        console.error('Service Worker registration failed:', error);
      });
  });
}

ReactDOM.createRoot(document.getElementById('root')).render(
  // StrictMode dev’de bazı efektleri iki kez çalıştırır; sorun yaşıyorsanız geçici olarak kaldırıldı
  <App />
);
