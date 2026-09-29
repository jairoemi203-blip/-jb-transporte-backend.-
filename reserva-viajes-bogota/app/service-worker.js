const CACHE = 'jb-transporte-v1';
const ARCHIVOS = ['./index.html', './style.css', './app.js', './manifest.json'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ARCHIVOS)));
  self.skipWaiting();
});
self.addEventListener('activate', (e) => { self.clients.claim(); });
self.addEventListener('fetch', (e) => {
  if (e.request.url.includes('/api/')) return;
  e.respondWith(caches.match(e.request).then((cached) => cached || fetch(e.request)));
});
