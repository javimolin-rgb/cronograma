/* ============================================================
   Red de seguridad: si un guardado se llevó por delante algo que
   ya estaba, lo vuelve a poner.

   Para qué: la app guarda la pieza entera. Si dos personas la
   tienen abierta a la vez y una guarda con su copia vieja, se
   pierde lo que subió la otra (pasó el 19 de noviembre con seis
   videos). La app ya junta las listas en vez de pisarlas, pero
   mientras alguien siga con la versión anterior abierta en su
   teléfono, el riesgo sigue.

   Esto corre en GitHub después de cada guardado y compara con la
   versión anterior:

     · un ARCHIVO que desapareció de una pieza, que nadie anotó
       como quitado y cuya copia sigue guardada en el repositorio
       → vuelve. (Cuando se quita a propósito, la app borra también
       la copia; si la copia está, no fue a propósito.)
     · un COMENTARIO, un MOVIMIENTO o un AVISO que desapareció sin
       que se haya borrado su pieza → vuelve.

   Nunca borra nada: solo repone.
   ============================================================ */
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const RAIZ = process.cwd();
const DATOS = path.join(RAIZ, 'datos/contenido.json');
const HIST = path.join(RAIZ, 'datos/historial');
const TABLAS = ['comments', 'activity', 'notifications'];

const leer = (f, x) => { try { return JSON.parse(fs.readFileSync(f, 'utf8')); } catch (e) { return x; } };
const escribir = (f, o) => fs.writeFileSync(f, JSON.stringify(o, null, 1));

function versionAnterior() {
  try {
    const txt = execFileSync('git', ['show', 'HEAD~1:datos/contenido.json'], { cwd: RAIZ, maxBuffer: 1 << 28 }).toString('utf8');
    return JSON.parse(txt);
  } catch (e) { return null; }
}

const ahora = leer(DATOS, null);
const antes = versionAnterior();
if (!ahora || !antes) { console.log('No hay con qué comparar: no se toca nada.'); process.exit(0); }

// lo que está guardado aparte no se cuenta como perdido
const archivadas = new Set();
if (fs.existsSync(HIST)) {
  for (const f of fs.readdirSync(HIST)) {
    if (!/^\d{4}-\d{2}\.json$/.test(f)) continue;
    const d = leer(path.join(HIST, f), {});
    for (const t of TABLAS) for (const r of (d[t] || [])) archivadas.add(r.id);
  }
}

let archivos = 0, filas = 0;
const detalle = [];

/* --- archivos que se cayeron de una pieza --- */
const porId = new Map(ahora.posts.map((p) => [p.id, p]));
for (const viejo of antes.posts || []) {
  const p = porId.get(viejo.id);
  if (!p) continue;                                   // la pieza entera se borró: así se quiso
  const hay = new Set((p.files || []).map((f) => f.id));
  const quitados = new Set([].concat(p.quitados || [], viejo.quitados || []));
  const faltan = (viejo.files || []).filter((f) => f && f.id && !hay.has(f.id) && !quitados.has(f.id)
    && f.path && fs.existsSync(path.join(RAIZ, f.path)));   // si la copia sigue guardada, no se quiso borrar
  if (!faltan.length) continue;
  p.files = (p.files || []).concat(faltan);
  archivos += faltan.length;
  detalle.push(`${faltan.length} en “${p.title}”: ${faltan.map((f) => f.name).join(', ')}`);
}

/* --- comentarios, movimientos y avisos que se cayeron --- */
const vivas = new Set(ahora.posts.map((p) => p.id));
for (const t of TABLAS) {
  const hay = new Set((ahora[t] || []).map((r) => r.id));
  const faltan = (antes[t] || []).filter((r) => r && r.id && !hay.has(r.id) && !archivadas.has(r.id)
    && (!r.postId || vivas.has(r.postId)));
  if (!faltan.length) continue;
  ahora[t] = (ahora[t] || []).concat(faltan);
  filas += faltan.length;
  detalle.push(`${faltan.length} ${t}`);
}

if (!archivos && !filas) { console.log('Nada que rescatar.'); process.exit(0); }
escribir(DATOS, ahora);
console.log('Rescatado: ' + detalle.join(' · '));
