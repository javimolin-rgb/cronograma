/* Envía las notificaciones pendientes a los celulares suscritos.
   Lo ejecuta GitHub Actions; no se usa desde la página. */
import fs from 'node:fs';
import webpush from 'web-push';

const DATOS = 'datos/contenido.json';
const REGISTRO = 'datos/avisos-enviados.json';
const DIAS = 3;                       // avisos más viejos que esto ya no se mandan
const MAX_REGISTRO = 3000;

const { VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_SUBJECT } = process.env;
if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
  console.log('Faltan las claves VAPID en los secretos del repositorio: no se envía nada.');
  process.exit(0);
}
webpush.setVapidDetails(VAPID_SUBJECT || 'mailto:admin@example.com', VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);

const leer = (f, x) => { try { return JSON.parse(fs.readFileSync(f, 'utf8')); } catch { return x; } };
const db = leer(DATOS, {});
const registro = leer(REGISTRO, { enviados: [] });
const yaEnviado = new Set(registro.enviados || []);
// Celulares que ya no existen (la app se borró o la suscripción venció): no se les insiste,
// y la app los saca solos de la lista la próxima vez que alguien la abre.
const muertos = new Set(registro.muertos || []);

const corte = Date.now() - DIAS * 864e5;
const pendientes = (db.notifications || []).filter((n) =>
  n && n.push && n.to && !yaEnviado.has(n.id) && new Date(n.createdAt || 0).getTime() > corte);

if (!pendientes.length) { console.log('No hay avisos pendientes.'); process.exit(0); }

const subs = db.push_subs || [];
let enviados = 0, fallidos = 0;

for (const n of pendientes) {
  const destinos = subs.filter((s) => s.person === n.to && s.sub && !muertos.has(s.id));
  const carga = JSON.stringify({
    title: n.title || 'Cronograma',
    body: n.body || n.text || '',
    url: n.url || './',
    postId: n.postId || null,
    tag: n.postId ? 'post-' + n.postId : undefined
  });
  for (const s of destinos) {
    try { await webpush.sendNotification(s.sub, carga); enviados++; }
    catch (e) {
      const codigo = e.statusCode || 0;
      if (codigo === 404 || codigo === 410) { muertos.add(s.id); console.log('Suscripción vencida de', n.to, '— se borrará de la lista'); }
      else { fallidos++; console.log('No se pudo enviar a', n.to, codigo || e.message); }
    }
  }
  yaEnviado.add(n.id);
}

const lista = [...yaEnviado].slice(-MAX_REGISTRO);
fs.writeFileSync(REGISTRO, JSON.stringify({ enviados: lista, muertos: [...muertos].slice(-200) }, null, 1) + '\n');
console.log(`Avisos procesados: ${pendientes.length} · notificaciones enviadas: ${enviados} · fallidas: ${fallidos} · suscripciones vencidas: ${muertos.size}`);

// Si nadie quedó para recibir un aviso, conviene verlo en el registro del flujo
for (const n of pendientes) {
  if (!subs.some((s) => s.person === n.to && s.sub && !muertos.has(s.id))) console.log(`Aviso para ${n.to}: no tiene ningún celular con notificaciones activas.`);
}
