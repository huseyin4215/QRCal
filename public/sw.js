// Service Worker - Cache Busting Strategy
// Version is embedded at build time via vite plugin (replaced below)
const SW_VERSION = '__SW_VERSION__';
const CACHE_NAME = 'qrnnect-v' + SW_VERSION;

// On install: skip waiting to activate immediately
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

// On activate: clear all old caches and take control
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch strategy:
// - index.html & version.json: always network-first (never cache)
// - /assets/ (hashed files): cache-first (safe because hashes change on deploy)
// - everything else: network-first
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Always fetch HTML and version.json from network
  if (
    url.pathname === '/' ||
    url.pathname === '/index.html' ||
    url.pathname.startsWith('/version.json') ||
    event.request.mode === 'navigate'
  ) {
    event.respondWith(
      fetch(event.request, { cache: 'no-store' })
        .catch(() => caches.match('/index.html'))
    );
    return;
  }

  // Cache-first for hashed assets
  if (url.pathname.startsWith('/assets/')) {
    event.respondWith(
      caches.open(CACHE_NAME).then((cache) => {
        return cache.match(event.request).then((cached) => {
          if (cached) return cached;
          return fetch(event.request).then((response) => {
            if (response.ok) cache.put(event.request, response.clone());
            return response;
          });
        });
      })
    );
    return;
  }

  // Network-first for everything else
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});
