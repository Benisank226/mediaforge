const CACHE_NAME = 'mediaforge-v1';
const urlsToCache = [
  '/',
  '/static/css/style.css',
  '/static/js/main.js',
  '/static/img/logo.png',
  '/static/img/icon-192.png',
  '/static/img/icon-512.png',
  '/static/manifest.json',
  '/convert',
  '/editor',
  '/subtitles',
  '/gifmaker',
  '/history',
  '/static/img/gifs/demo.gif'  
];

// Installation : met en cache les ressources statiques
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
      .then(() => self.skipWaiting())
  );
});

// Activation : supprime les anciens caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
    ))
  );
  self.clients.claim();
});

// Interception des requêtes
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // Stratégie : cache d'abord pour les assets statiques (CSS, JS, images)
  if (url.pathname.match(/\.(css|js|png|jpg|jpeg|svg|gif|webp)$/)) {
    event.respondWith(
      caches.match(event.request)
        .then(response => response || fetch(event.request))
    );
    return;
  }

  // Pour les pages HTML : réseau d'abord, fallback sur cache
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseClone);
          });
          return response;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  // Pour les requêtes API : réseau uniquement (pas de cache)
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(fetch(event.request));
    return;
  }

  // Fallback : réseau d'abord, cache en secours
  event.respondWith(
    fetch(event.request)
      .catch(() => caches.match(event.request))
  );
});