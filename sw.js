const CACHE = 'misnotas-v4';

const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './icon-maskable-512.png',
  './apple-touch-icon.png',
  './icons/home.png',
  './icons/shared.png',
  './icons/calendar.png',
  './icons/trash.png',
  './icons/settings.png',
  './icons/folder.png',
  './icons/search.png',
  './icons/view.png',
  './icons/list.png',
  './icons/options.png',
  './icons/pencil.png',
  './icons/plant.png',
  './icons/note.png',
  './icons/table.png',
  './icons/checklist.png',
  './icons/bell.png',
  './icons/bell-off.png',
  './icons/pin.png',
  './icons/folder-plus.png',
  './icons/close.png',
  './icons/back.png',
  './icons/next.png',
  './icons/plus-white.png',
  './icons/play.png',
  './icons/pause.png',
  './icons/check.png',
  './icons/drop.png',
  './icons/drop-white.png',
  './icons/wand.png',
  './icons/folder-cc1919.png',
  './icons/folder-f59e0b.png',
  './icons/folder-22c55e.png',
  './icons/folder-3b82f6.png',
  './icons/folder-1c1c1e.png',
  'https://cdn.tailwindcss.com',
  'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE)
      // add() individual para que un fallo de red no rompa la instalación
      .then(c => Promise.all(ASSETS.map(url => c.add(url).catch(() => null))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;

  // Navegación: red primero, cache de respaldo
  if (req.mode === 'navigate') {
    e.respondWith(
      fetch(req)
        .then(res => {
          const copy = res.clone();
          caches.open(CACHE).then(c => c.put('./index.html', copy));
          return res;
        })
        .catch(() => caches.match('./index.html'))
    );
    return;
  }

  // Resto (CSS/JS/fuentes de CDN): cache primero, actualización en segundo plano
  e.respondWith(
    caches.match(req).then(cached => {
      const network = fetch(req).then(res => {
        if (res && (res.status === 200 || res.type === 'opaque')) {
          const copy = res.clone();
          caches.open(CACHE).then(c => c.put(req, copy));
        }
        return res;
      }).catch(() => cached);
      return cached || network;
    })
  );
});