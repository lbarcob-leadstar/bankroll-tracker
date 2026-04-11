const CACHE_NAME = 'bankroll-tracker-v12';
const urlsToCache = [
  './',
  './index.html',
  './manifest.json',
  './supabase-client.js',
  './supabase-auth.js',
  './supabase-data.js'
];

// Install Service Worker
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
  self.skipWaiting();
});

// Activate Service Worker
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch: network-first for HTML/JS, stale-while-revalidate for images
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  
  // Skip non-GET and API calls
  if (event.request.method !== 'GET' || url.pathname.startsWith('/api/')) {
    return;
  }
  
  // Images: serve from cache, update in background
  if (event.request.destination === 'image') {
    event.respondWith(
      caches.open(CACHE_NAME).then(cache =>
        cache.match(event.request).then(cached => {
          const fetchPromise = fetch(event.request).then(response => {
            if (response && response.status === 200) {
              cache.put(event.request, response.clone());
            }
            return response;
          }).catch(() => cached);
          return cached || fetchPromise;
        })
      )
    );
    return;
  }
  
  // HTML/JS/CSS: network first, fallback to cache
  event.respondWith(
    fetch(event.request).then(response => {
      if (response && response.status === 200) {
        const responseToCache = response.clone();
        caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, responseToCache);
        });
      }
      return response;
    }).catch(() => caches.match(event.request))
  );
});
