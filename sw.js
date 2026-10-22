/* Service worker: notificaciones push + funcionamiento tipo app */
const CACHE = 'crono-shell-v1';
const SHELL = ['./', 'index.html', 'styles.css', 'config.js', 'store.js', 'app.js', 'icon.svg', 'icon-192.png'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).catch(() => {}));
  self.skipWaiting();
});
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});

// Red primero (siempre la versión más nueva); si no hay internet, usa lo guardado.
self.addEventListener('fetch', (e) => {
  const r = e.request;
  if (r.method !== 'GET' || new URL(r.url).origin !== location.origin) return;
  e.respondWith(
    fetch(r).then((res) => {
      const copy = res.clone();
      caches.open(CACHE).then((c) => c.put(r, copy)).catch(() => {});
      return res;
    }).catch(() => caches.match(r).then((m) => m || caches.match('index.html')))
  );
});

self.addEventListener('push', (e) => {
  let d = {};
  try { d = e.data ? e.data.json() : {}; } catch (err) { d = { body: e.data ? e.data.text() : '' }; }
  const title = d.title || 'Cronograma';
  e.waitUntil(self.registration.showNotification(title, {
    body: d.body || '',
    icon: 'icon-192.png',
    badge: 'badge.png',
    tag: d.tag || undefined,
    renotify: !!d.tag,
    data: { url: d.url || './', postId: d.postId || null }
  }));
});

self.addEventListener('notificationclick', (e) => {
  e.notification.close();
  const { url, postId } = e.notification.data || {};
  e.waitUntil((async () => {
    const all = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    for (const c of all) {
      if ('focus' in c) {
        await c.focus();
        if (postId) c.postMessage({ type: 'open-post', postId });
        return;
      }
    }
    await self.clients.openWindow(url || './');
  })());
});
