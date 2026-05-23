/* ==========================================================================
   DEN TAMME BEVER SERVICE WORKER
   Network-First falling back to Cache strategy.
   Ensures fresh content while allowing 100% offline reading support.
   ========================================================================== */

const CACHE_NAME = 'bever-cache-v1';
const PRE_CACHE_ASSETS = [
  '/',
  '/css/style.css',
  '/js/main.js',
  '/404.html',
  '/offline/',
  '/offline/index.html'
];


// Install event - Pre-cache core layouts
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(PRE_CACHE_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate event - Clean old caches
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch event - Network-First, cache fallback
self.addEventListener('fetch', e => {
  // Only handle GET requests and local origins
  if (e.request.method !== 'GET' || !e.request.url.startsWith(self.location.origin)) {
    return;
  }

  e.respondWith(
    fetch(e.request)
      .then(response => {
        // If successful response, cache it dynamically
        if (response.status === 200) {
          const responseCopy = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(e.request, responseCopy);
          });
        }
        return response;
      })
      .catch(() => {
        // Offline: Fallback to cache
        return caches.match(e.request).then(cachedResponse => {
          if (cachedResponse) {
            return cachedResponse;
          }
          // If offline and request is HTML, we can return the cached offline guide page
          if (e.request.headers.get('accept').includes('text/html')) {
            return caches.match('/offline/');
          }
        });
      })
  );
});

