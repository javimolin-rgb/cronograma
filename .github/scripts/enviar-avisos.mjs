/* Envía las notificaciones pendientes a los celulares suscritos.
   Lo ejecuta GitHub Actions; no se usa desde la página. */
import fs from 'node:fs';
import webpush from 'web-push';

const DATOS = 'datos/contenido.json';
const REGISTRO = 'datos/avisos-enviados.json';
const DIAS = 3;                       // avisos más viejos que esto ya no se mandan
const MAX_REGISTRO = 3000;
// Dónde anotar lo que se manda en ESTA pasada, fuera del repositorio. Hace falta
// porque el registro se guarda con un commit que puede chocar con un guardado de
// la app: si eso pasa, el paso de anotar rehace la anotación sobre lo último
// usando este archivo. Sin él, el aviso quedaría sin anotar y se mandaría otra vez.
const AHORA = process.env.ENVIADOS_AHORA || '';

const { VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_SUBJECT } = process.env;
if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
  console.log('Faltan las claves VAPID en los secretos del repositorio: no se envía nada.');
  process.exit(0);
}
webpush.setVapidDetails(VAPID_SUBJECT || 'mailto:admin@example.com', VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);

const leer = (f, x) => { try { return JSON.parse(fs.readFileSync(f, 'utf8')); } catch { return x; } };
const db = leer(DATOS, {});
const registro = leer(REGISTRO, { enviados: [] });
// Lo que ya se entregó. Cada entrada es un par "aviso|suscripción", porque lo
// que importa no es si el aviso salió, sino si salió a CADA aparato: si el
// iPhone lo recibió y el Mac falló, hay que reintentar solo el Mac. Las
// entradas sin "|" vienen del formato viejo y significan "ya está, a todos".
const hechos = new Set(registro.enviados || []);
const yaLoTiene = (idAviso, idSub) => hechos.has(idAviso) || hechos.has(idAviso + '|' + idSub);
// Celulares que ya no existen (la app se borró o la suscripción venció): no se les insiste,
// y la app los saca solos de la lista la próxima vez que alguien la abre.
const muertos = new Set(registro.muertos || []);
const muertosNuevos = new Set();   // solo las que vencieron en esta pasada

const corte = Date.now() - DIAS * 864e5;
const candidatos = (db.notifications || []).filter((n) =>
  n && n.push && n.to && !hechos.has(n.id) && new Date(n.createdAt || 0).getTime() > corte);

if (!candidatos.length) { console.log('No hay avisos pendientes.'); process.exit(0); }

const subs = db.push_subs || [];
let enviados = 0, fallidos = 0, procesados = 0;

// Lo que se va entregando en esta pasada. Se escribe en disco después de CADA
// entrega, no al final: si esto se corta por la mitad, lo que ya salió queda
// anotado igual y no se vuelve a mandar.
const mandados = [];
const guardarAhora = () => {
  if (!AHORA) return;
  fs.writeFileSync(AHORA, JSON.stringify({ enviados: mandados, muertos: [...muertosNuevos] }, null, 1) + '\n');
};
const apuntar = (clave) => { hechos.add(clave); mandados.push(clave); guardarAhora(); };

for (const n of candidatos) {
  const vivas = subs.filter((s) => s.person === n.to && s.sub && !muertos.has(s.id));
  if (!vivas.length) {
    // No hay dónde entregarlo. Se da por terminado para no repetir este mismo
    // aviso en cada pasada durante tres días.
    console.log(`Aviso para ${n.to}: no tiene ningún celular con notificaciones activas.`);
    apuntar(n.id);
    continue;
  }
  const faltan = vivas.filter((s) => !yaLoTiene(n.id, s.id));
  if (!faltan.length) continue;        // todos sus aparatos ya lo tienen
  procesados++;

  const carga = JSON.stringify({
    title: n.title || 'Cronograma',
    body: n.body || n.text || '',
    url: n.url || './',
    postId: n.postId || null,
    urgente: !!n.urgente,
    // los avisos de una misma pieza se reemplazan entre sí; los zumbidos no, cada uno suena
    tag: n.urgente ? 'zumbido-' + n.id : (n.postId ? 'post-' + n.postId : undefined)
  });
  // un zumbido se entrega de inmediato, aunque el teléfono esté ahorrando batería
  const opciones = n.urgente ? { urgency: 'high', TTL: 3600 } : {};

  for (const s of faltan) {
    try {
      await webpush.sendNotification(s.sub, carga, opciones);
      enviados++;
      apuntar(n.id + '|' + s.id);      // este aparato ya lo tiene: no se le repite
    } catch (e) {
      const codigo = e.statusCode || 0;
      if (codigo === 404 || codigo === 410) {
        // la suscripción ya no existe: insistir no sirve de nada
        muertos.add(s.id); muertosNuevos.add(s.id);
        apuntar(n.id + '|' + s.id);
        console.log('Suscripción vencida de', n.to, '— se borrará de la lista');
      } else {
        // Fallo que puede ser pasajero. NO se apunta, así que la pasada
        // siguiente lo reintenta, y solo en este aparato: los que ya lo
        // recibieron no lo reciben de nuevo.
        fallidos++;
        console.log('No se pudo enviar a', n.to, codigo || e.message, '— se reintenta en la pasada siguiente');
      }
    }
  }
}

const lista = [...hechos].slice(-MAX_REGISTRO);
fs.writeFileSync(REGISTRO, JSON.stringify({ enviados: lista, muertos: [...muertos].slice(-200) }, null, 1) + '\n');
console.log(`Avisos procesados: ${procesados} · notificaciones enviadas: ${enviados} · fallidas: ${fallidos} · suscripciones vencidas: ${muertos.size}`);
