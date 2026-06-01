/* ============================================================
   sw.js — Service worker for yasirbilgin.com
   Caches shell assets so the site loads instantly on repeat
   visits and works offline for previously visited pages.
   ============================================================ */

const CACHE = 'ynb-v13';
const SHELL = [
  '/',
  '/index.html',
  '/404.html',
  '/nav.js',
  '/assets/fonts.css',
  '/assets/tokens.css',
  '/assets/section.css',
  '/assets/article.css',
  '/assets/search-index.json',
];

// Install: pre-cache shell assets
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())
  );
});

// Activate: delete old caches
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Fetch: cache-first for shell assets, network-first for HTML pages
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);

  // Only handle same-origin requests
  if (url.origin !== self.location.origin) return;

  // Network-first for HTML (always fresh content)
  if (e.request.headers.get('accept')?.includes('text/html')) {
    e.respondWith(
      fetch(e.request)
        .then(res => { caches.open(CACHE).then(c => c.put(e.request, res.clone())); return res; })
        .catch(() => caches.match(e.request).then(r => r || caches.match('/404.html')))
    );
    return;
  }

  // Cache-first for everything else (CSS, JS, JSON, fonts)
  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(res => {
        if (res.ok) caches.open(CACHE).then(c => c.put(e.request, res.clone()));
        return res;
      });
    })
  );
});
