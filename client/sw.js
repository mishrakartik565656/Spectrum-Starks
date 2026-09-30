const CACHE_NAME = 'cleancity-v1';
const ASSETS = [
  '/',
  '/index.html',
  '/css/tokens.css',
  '/css/styles.css',
  '/js/app.js',
  '/js/api.js',
  '/js/components/cc-button.js',
  '/js/components/cc-input.js',
  '/js/components/cc-card.js',
  '/js/views/auth.js',
  '/js/views/citizen.js',
  '/js/views/admin.js',
  '/js/views/worker.js'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
});

self.addEventListener('fetch', (e) => {
  // Network first for API calls
  if (e.request.url.includes('/api/')) {
    e.respondWith(
      fetch(e.request).catch(() => {
        // Here we could return queued offline responses from IndexedDB
        return new Response(JSON.stringify({ error: 'Offline' }), {
          headers: { 'Content-Type': 'application/json' },
          status: 503
        });
      })
    );
    return;
  }

  // Cache first for assets
  e.respondWith(
    caches.match(e.request).then(res => {
      return res || fetch(e.request);
    })
  );
});
