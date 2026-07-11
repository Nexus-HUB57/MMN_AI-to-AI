// D42 Nexus SW · network-first para HTML, cache-first para assets estáticos
const CACHE = 'oneverso-v2-20260711';
const HTML_CACHE = 'oneverso-html-v2';
const ASSET_HOSTS = ['/assets/', '/ebooks/', '/manifest.json', '/favicon'];

self.addEventListener('install', (e) => {
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => k !== CACHE && k !== HTML_CACHE).map(k => caches.delete(k)));
    await self.clients.claim();
    const clients = await self.clients.matchAll({ type: 'window' });
    clients.forEach(c => c.postMessage({ type: 'SW_UPDATED', cache: CACHE }));
  })());
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  // Never cache API/webhooks
  if (url.pathname.startsWith('/api/') || url.pathname.startsWith('/webhooks/')) return;

  // Network-first for HTML navigations (prevents black screen on stale bundle)
  const isHTML = req.mode === 'navigate' || (req.headers.get('accept') || '').includes('text/html');
  if (isHTML) {
    e.respondWith((async () => {
      try {
        const fresh = await fetch(req, { cache: 'no-store' });
        if (fresh && fresh.status === 200) {
          const copy = fresh.clone();
          caches.open(HTML_CACHE).then(c => c.put(req, copy)).catch(() => null);
        }
        return fresh;
      } catch (err) {
        const cached = await caches.match(req);
        return cached || Response.error();
      }
    })());
    return;
  }

  // Cache-first for hashed assets
  const isStatic = ASSET_HOSTS.some(prefix => url.pathname.startsWith(prefix));
  if (isStatic) {
    e.respondWith((async () => {
      const cached = await caches.match(req);
      if (cached) return cached;
      try {
        const res = await fetch(req);
        if (res && res.status === 200 && url.origin === self.location.origin) {
          const copy = res.clone();
          caches.open(CACHE).then(c => c.put(req, copy)).catch(() => null);
        }
        return res;
      } catch (err) {
        return Response.error();
      }
    })());
    return;
  }
});
