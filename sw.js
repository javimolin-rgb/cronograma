/* Service worker: notificaciones y funcionamiento tipo app.
   Al cambiar VERSION, todas las apps instaladas se actualizan solas la próxima vez que se abren. */
const VERSION = '2026.10.26-4';
const CACHE = 'crono-' + VERSION;
const SHELL = ['./', 'index.html', 'styles.css', 'config.js', 'store.js', 'zip.js', 'whatsapp.js', 'app.js', 'icon.svg', 'icon-192.png'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).catch(() => {}));
  self.skipWaiting();
});
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys()
    .then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener('message', (e) => {
  const d = e.data || {};
  if (d.type === 'version' && e.source) e.source.postMessage({ type: 'version', version: VERSION });
  if (d.type === 'skip-waiting') self.skipWaiting();
});

/* Lo que llega con "Compartir → Cronograma" (texto, fotos, audios de WhatsApp).
   Se guarda aquí mismo, en el teléfono, y la app lo abre para revisarlo antes de importarlo. */
const CACHE_COMP = 'crono-compartido';
const urlComp = (k) => new URL('__compartido/' + k, self.registration.scope).href;
async function recibirCompartido(req) {
  try {
    const fd = await req.formData();
    const c = await caches.open(CACHE_COMP);
    const prev = await c.match(urlComp('lista'));
    const lista = prev ? await prev.json() : [];
    const t = Date.now();
    const item = { at: new Date().toISOString(), title: String(fd.get('title') || ''), text: String(fd.get('text') || ''), url: String(fd.get('url') || ''), files: [] };
    let n = 0;
    for (const f of fd.getAll('archivos')) {
      if (!f || typeof f === 'string') continue;
      const key = `a-${t}-${n++}`;
      await c.put(urlComp(key), new Response(f, { headers: { 'Content-Type': f.type || 'application/octet-stream' } }));
      item.files.push({ key, name: f.name || key, type: f.type || '', size: f.size || 0 });
    }
    if (item.title || item.text || item.url || item.files.length) lista.push(item);
    await c.put(urlComp('lista'), new Response(JSON.stringify(lista), { headers: { 'Content-Type': 'application/json' } }));
  } catch (err) { /* si falla, igual se abre la app */ }
  return Response.redirect(new URL('./?compartido=1', self.registration.scope).href, 303);
}

// Red primero (siempre la versión más nueva); si no hay internet, usa lo guardado.
self.addEventListener('fetch', (e) => {
  const r = e.request;
  const u = new URL(r.url);
  if (r.method === 'POST' && u.origin === location.origin && u.pathname.endsWith('/compartir')) { e.respondWith(recibirCompartido(r)); return; }
  if (r.method !== 'GET' || u.origin !== location.origin) return;
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
