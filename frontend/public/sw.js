// Minimal Service Worker for PWA installation support
const CACHE_NAME = 'restaurant-pwa-cache-v1';
const ASSETS = [
  '/',
  '/index.html',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS).catch(() => {});
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Let the browser handle standard requests; fallback to cache if offline
  event.respondWith(
    fetch(event.request).catch(() => {
      return caches.match(event.request);
    })
  );
});

// Push Notifications
self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : { title: 'Bhoj360 Alert', body: 'New notification' };
  const options = {
    body: data.body,
    icon: '/favicon.png',
    badge: '/favicon.png',
    data: { url: data.url || '/' }
  };
  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: 'window' }).then((clientList) => {
      const targetUrl = event.notification.data.url;
      for (const client of clientList) {
        if (client.url === targetUrl && 'focus' in client) {
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    })
  );
});

// Background Sync
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-orders') {
    console.log('[Service Worker] Background Syncing orders...');
  }
});

// Periodic Sync
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'sync-menu') {
    console.log('[Service Worker] Periodic Syncing menu...');
  }
});
