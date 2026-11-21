/* ============================================================
   Guarda aparte lo que ya nadie mira, para que el archivo de
   datos no crezca sin fin.

   Por qué: todo vive en datos/contenido.json y se vuelve a subir
   entero cada vez que alguien guarda. Cuando ese archivo pasó de
   1 MB, GitHub dejó de mandar su contenido junto con la ficha y
   empezaron a perderse comentarios (está contado en el README).
   Eso ya está arreglado de raíz, pero un archivo más chico es más
   rápido en el celular y deja todo con más holgura.

   Qué se mueve: los avisos y los movimientos viejos, y los
   comentarios de hace más de dos meses. Nada se borra: cada fila
   queda en datos/historial/<año-mes>.json, y la app los trae de
   vuelta cuando alguien toca “ver lo anterior”.

   No se toca nunca: las piezas, los recursos, las preferencias,
   los dispositivos ni las vistas.
   ============================================================ */
import fs from 'node:fs';
import path from 'node:path';

const RAIZ = process.cwd();
const DATOS = path.join(RAIZ, 'datos/contenido.json');
const DIR = path.join(RAIZ, 'datos/historial');
const INDICE = path.join(DIR, 'indice.json');
const ENVIADOS = path.join(RAIZ, 'datos/avisos-enviados.json');

// Cuánto tiempo se queda cada cosa a mano, en días
const DIAS = { notifications: 10, activity: 10, comments: 60 };
const DIAS_SIN_LEER = 45;          // un aviso sin abrir se queda, pero no para siempre
const TABLAS = ['comments', 'activity', 'notifications'];

const leer = (f, x) => { try { return JSON.parse(fs.readFileSync(f, 'utf8')); } catch (e) { return x; } };
// Igual que la app: JSON.stringify(obj, null, 1) y sin salto al final
const escribir = (f, o) => fs.writeFileSync(f, JSON.stringify(o, null, 1));
const cuando = (r) => String(r.createdAt || r.at || '');
const mesDe = (r) => cuando(r).slice(0, 7) || 'sin-fecha';
const diasDesde = (iso) => (Date.now() - Date.parse(iso)) / 86400000;

const db = leer(DATOS, null);
if (!db) { console.log('No se pudo leer el archivo de datos: no se toca nada.'); process.exit(0); }

// --- qué se va ---
const seVan = { comments: [], activity: [], notifications: [] };
const sigueDentro = {};
for (const t of TABLAS) {
  const filas = Array.isArray(db[t]) ? db[t] : [];
  sigueDentro[t] = filas.filter((r) => {
    const f = cuando(r);
    if (!f) return true;                                    // sin fecha, por las dudas, se queda
    const d = diasDesde(f);
    if (!(d > DIAS[t])) return true;
    // un aviso que todavía no abren se queda a la vista un buen rato más
    if (t === 'notifications' && !r.read && d < DIAS_SIN_LEER) return true;
    seVan[t].push(r);
    return false;
  });
}
const total = TABLAS.reduce((a, t) => a + seVan[t].length, 0);

// --- al historial, por mes, sin repetir ---
fs.mkdirSync(DIR, { recursive: true });
const meses = new Set(fs.existsSync(DIR) ? fs.readdirSync(DIR).filter((f) => /^\d{4}-\d{2}\.json$/.test(f)).map((f) => f.slice(0, 7)) : []);
if (total) {
  const porMes = {};
  for (const t of TABLAS) for (const r of seVan[t]) ((porMes[mesDe(r)] = porMes[mesDe(r)] || { comments: [], activity: [], notifications: [] })[t]).push(r);
  for (const [mes, filas] of Object.entries(porMes)) {
    const f = path.join(DIR, mes + '.json');
    const ya = leer(f, { comments: [], activity: [], notifications: [] });
    for (const t of TABLAS) {
      const ids = new Set((ya[t] || []).map((x) => x.id));
      ya[t] = (ya[t] || []).concat(filas[t].filter((x) => !ids.has(x.id)));
      ya[t].sort((a, b) => cuando(a).localeCompare(cuando(b)));
    }
    escribir(f, ya);
    meses.add(mes);
  }
}

// --- el índice: qué hay guardado y de qué pieza, para que la app sepa qué ofrecer ---
const piezas = {};
const suma = { comments: 0, activity: 0, notifications: 0 };
for (const mes of [...meses].sort()) {
  const filas = leer(path.join(DIR, mes + '.json'), null);
  if (!filas) continue;
  for (const t of TABLAS) for (const r of (filas[t] || [])) {
    suma[t]++;
    if (!r.postId) continue;
    (piezas[r.postId] = piezas[r.postId] || { comments: 0, activity: 0, notifications: 0 })[t]++;
  }
}
escribir(INDICE, { actualizado: new Date().toISOString(), meses: [...meses].sort(), total: suma, piezas });

// --- la lista de avisos ya enviados no necesita acordarse de los archivados ---
const env = leer(ENVIADOS, null);
if (env && Array.isArray(env.enviados)) {
  const vivos = new Set((sigueDentro.notifications || []).map((n) => n.id));
  const antes = env.enviados.length;
  // Cada entrada es "aviso|suscripción" (o solo el aviso, en el formato viejo):
  // se compara la parte del aviso, no la entrada entera. Si esto se compara mal,
  // el registro queda vacío y todos los avisos se mandan de nuevo.
  env.enviados = env.enviados.filter((e) => vivos.has(String(e).split('|')[0]));
  if (env.enviados.length !== antes) { escribir(ENVIADOS, env); console.log(`avisos-enviados: ${antes} → ${env.enviados.length}`); }
}

// --- y el archivo de datos queda más liviano ---
if (total) {
  for (const t of TABLAS) db[t] = sigueDentro[t];
  escribir(DATOS, db);
}
const kb = (f) => (fs.statSync(f).size / 1024).toFixed(0);
console.log(total
  ? `Al historial: ${TABLAS.map((t) => `${seVan[t].length} ${t}`).join(', ')} · contenido.json queda en ${kb(DATOS)} KB`
  : `Nada que archivar · contenido.json está en ${kb(DATOS)} KB`);
