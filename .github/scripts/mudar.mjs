/* ============================================================
   Mudar archivos viejos a un repositorio aparte.

   Para qué: el sitio publicado de GitHub Pages tiene un tope DURO
   de 1 GB. Vamos en 649 MB y subiendo ~19 MB al día, así que el
   tope llega en semanas. Nada se borra: los archivos se copian a
   otro repositorio (público, sin sitio publicado) y recién después
   se sacan de este. Las direcciones de la app se actualizan solas,
   así que las fotos y videos viejos se siguen viendo igual.

   Por qué un repositorio aparte y no un fork: los forks comparten
   un mismo montón de objetos con el original, así que mudar a un
   fork no libera nada. Un repositorio normal sí.

   Tres modos, siempre en este orden:

     --plan      decide qué se muda y lo deja escrito en el plan
     --subir     copia al repositorio de archivo y COMPRUEBA que
                 llegó bien (compara el sha de git, que ES el
                 contenido: si cuadra, la copia es idéntica)
     --aplicar   recién ahora cambia los datos y borra de aquí

   La comprobación va antes de borrar, siempre. Si algo falla a
   mitad de camino, lo peor que pasa es que el archivo queda en los
   dos lados, nunca en ninguno.

   Qué se muda (modo "versiones", el de todos los días):
     · versiones anteriores de un archivo de una pieza, cuando ya
       hay una más nueva y pasaron DIAS días. La app las sigue
       mostrando en “Ver más · N archivos anteriores”.

   Qué se muda solo si alguien lo pide a mano (modo "todo", que hace lo
   de arriba y además):
     · archivos que están en el repositorio y que ninguna pieza,
       ni Marca, ni ninguna página interactiva usa. Van aparte
       porque para saber que de verdad no se usan hay que mirar,
       y eso lo decide una persona.

   Qué NO se muda nunca:
     · la última versión de cada archivo (es la que se está usando)
     · las páginas interactivas y todo lo que haya en su carpeta
       que ellas nombren (el sitio las sirve como páginas; si se
       van, dejan de abrirse)
     · los archivos de Marca
     · cualquier archivo cuyo nombre aparezca escrito dentro de un
       html, js o css del repositorio (puede que lo cargue solo)
   ============================================================ */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';

const RAIZ = process.cwd();
const DATOS = path.join(RAIZ, 'datos/contenido.json');
const LIBRO = path.join(RAIZ, 'datos/mudanzas.json');   // el registro de todo lo mudado
const PLAN = process.env.PLAN_MUDANZA || '/tmp/mudanza.json';
const DIR = 'archivos';

const REPO = process.env.ARCHIVO_REPO || '';            // "dueño/nombre" del repositorio de archivo
const RAMA = process.env.ARCHIVO_RAMA || 'main';
const LLAVE = process.env.ARCHIVO_TOKEN || '';
const DIAS = Number(process.env.DIAS || 7);
const TOPE_MB = Number(process.env.TOPE_MB || 300);
const MAX = Number(process.env.MAX_ARCHIVOS || 80);
const MODO = process.env.MODO || 'versiones';
const SIMULACRO = /^(1|true|si|sí)$/i.test(process.env.SIMULACRO || '');

const MB = 1048576;
const leer = (f, x) => { try { return JSON.parse(fs.readFileSync(f, 'utf8')); } catch (e) { return x; } };
const escribir = (f, o) => fs.writeFileSync(f, JSON.stringify(o, null, 1));
const mb = (n) => (n / MB).toFixed(1) + ' MB';

/* El sha de git ES el contenido: sha1 de "blob <largo>\0" + los bytes.
   Por eso sirve de comprobación: si el sha que devuelve GitHub al guardar
   la copia es el mismo que el de aquí, la copia es idéntica, byte a byte. */
function shaGit(buf) {
  return crypto.createHash('sha1').update(Buffer.concat([Buffer.from(`blob ${buf.length}\0`), buf])).digest('hex');
}

const splitName = (n) => {
  const m = String(n || '').match(/^(.*?)(?:-v(\d+))?(\.[^.]+)?$/);
  return { base: m[1] || '', version: m[2] ? +m[2] : 1 };
};

/* ---------- el árbol de verdad del repositorio ---------- */
function arbolDelRepo() {
  const txt = execFileSync('git', ['ls-tree', '-r', '-l', 'HEAD', '--', DIR], { cwd: RAIZ, maxBuffer: 1 << 28 }).toString();
  const out = new Map();
  for (const l of txt.trim().split('\n')) {
    const m = l.match(/^\S+\s+\S+\s+(\S+)\s+(\d+)\t(.*)$/);
    if (m) out.set(m[3], { sha: m[1], size: +m[2], path: m[3] });
  }
  return out;
}

/* ---------- lo que no se puede tocar ---------- */
function intocables(db) {
  const fijos = new Set();           // rutas que alguien usa de verdad
  const carpetasArte = new Set();    // carpetas de páginas interactivas
  (db.posts || []).forEach((p) => {
    (p.artefactos || []).forEach((a) => {
      carpetasArte.add(a.carpeta);
      (a.archivos || []).forEach((x) => fijos.add(`${a.carpeta}/${x.ruta}`));
    });
  });
  (db.recursos || []).forEach((r) => { if (r.path) fijos.add(r.path); });   // Marca
  return { fijos, carpetasArte };
}

/* Nombres escritos dentro de los html/js/css del repositorio: si un archivo
   aparece nombrado ahí, puede que una página lo cargue sola. No se toca. */
function nombresNombrados() {
  const vistos = new Set();
  const textos = /\.(html?|js|mjs|css|json|md|txt|svg|csv|webmanifest)$/i;
  const recorrer = (dir) => {
    let hijos = [];
    try { hijos = fs.readdirSync(dir, { withFileTypes: true }); } catch (e) { return; }
    for (const h of hijos) {
      const p = path.join(dir, h.name);
      if (h.isDirectory()) { recorrer(p); continue; }
      if (!textos.test(h.name)) continue;
      let st; try { st = fs.statSync(p); } catch (e) { continue; }
      if (st.size > 4 * MB) continue;
      let txt = ''; try { txt = fs.readFileSync(p, 'utf8'); } catch (e) { continue; }
      vistos.add(txt);
    }
  };
  recorrer(path.join(RAIZ, DIR));
  const todo = [...vistos].join('\n');
  return (nombre) => todo.includes(nombre);
}

/* ---------- qué se muda ---------- */
function planear() {
  if (!REPO) { console.log('No hay repositorio de archivo configurado (ARCHIVO_REPO): no se hace nada.'); return null; }
  const db = leer(DATOS, null);
  if (!db) { console.log('No se pudieron leer los datos: no se toca nada.'); return null; }
  const arbol = arbolDelRepo();
  const { fijos, carpetasArte } = intocables(db);
  const estaNombrado = nombresNombrados();
  const corte = Date.now() - DIAS * 86400000;

  /* TODA ruta que aparezca en los datos, sea la última versión o una
     anterior. Es lo que separa “suelto” de “viejo”: un archivo nombrado en
     los datos nunca se trata como suelto, porque su fila hay que actualizarla.
     (Si no, una versión anterior que todavía no cumple los DIAS caería en el
     saco de los sueltos, se mudaría sin tocar su fila, y la foto se rompería.) */
  const referenciados = new Set();
  (db.posts || []).forEach((p) => (p.files || []).forEach((f) => { if (f.path) referenciados.add(f.path); }));
  fijos.forEach((x) => referenciados.add(x));

  const candidatos = [];

  // primero, qué está en uso y qué son versiones anteriores
  (db.posts || []).forEach((p) => {
    const grupos = {};
    (p.files || []).forEach((f) => {
      const b = f.base || splitName(f.name).base;
      (grupos[b] = grupos[b] || []).push(f);
    });
    Object.values(grupos).forEach((g) => {
      g.sort((a, b) => ((b.version || 1) - (a.version || 1)) || String(b.at || '').localeCompare(String(a.at || '')));
      g.forEach((f, i) => {
        if (!f.path) return;
        if (i === 0) return;                           // la última versión se queda
        if (f.externo) return;                         // ya está mudada
        if (fijos.has(f.path) || !arbol.has(f.path)) return;
        if (Date.parse(f.at || 0) > corte) return;     // todavía muy reciente
        if (estaNombrado(path.basename(f.path))) return;
        candidatos.push({
          path: f.path, sha: arbol.get(f.path).sha, size: arbol.get(f.path).size,
          de: 'versiones', pieza: p.id, fila: f.id, nombre: f.name
        });
      });
    });
  });

  if (MODO === 'todo') {
    let enArte = 0;
    for (const x of arbol.values()) {
      if (referenciados.has(x.path)) continue;              // lo nombran los datos: no es suelto
      if (estaNombrado(path.basename(x.path))) continue;     // lo nombra alguna página: puede cargarlo solo
      const dentroDeArte = [...carpetasArte].some((c) => x.path.startsWith(c + '/'));
      if (dentroDeArte) enArte++;
      candidatos.push({ path: x.path, sha: x.sha, size: x.size, de: 'sueltos', dentroDeArte });
    }
    if (enArte) console.log(`  (${enArte} están dentro de la carpeta de una página interactiva, pero esa página no los nombra)`);
  }

  // lo más pesado primero: así cada pasada libera lo más posible
  candidatos.sort((a, b) => b.size - a.size);
  const elegidos = [];
  let bytes = 0;
  for (const c of candidatos) {
    if (elegidos.length >= MAX || bytes + c.size > TOPE_MB * MB) continue;
    elegidos.push(c); bytes += c.size;
  }

  const plan = { repo: REPO, rama: RAMA, modo: MODO, hecho: new Date().toISOString(), archivos: elegidos, bytes };
  console.log(`Modo ${MODO}: ${candidatos.length} candidatos, se mudan ${elegidos.length} (${mb(bytes)}).`);
  const porTipo = {};
  elegidos.forEach((c) => { porTipo[c.de] = (porTipo[c.de] || 0) + 1; });
  Object.entries(porTipo).forEach(([k, v]) => console.log(`  ${k}: ${v}`));
  elegidos.slice(0, 12).forEach((c) => console.log(`   ${mb(c.size).padStart(9)}  ${c.path}`));
  if (elegidos.length > 12) console.log(`   … y ${elegidos.length - 12} más`);
  escribir(PLAN, plan);
  return plan;
}

/* ---------- hablar con GitHub ---------- */
async function api(metodo, ruta, cuerpo) {
  const url = `https://api.github.com/repos/${REPO}/${ruta}`;
  for (let intento = 0; ; intento++) {
    const r = await fetch(url, {
      method: metodo,
      headers: {
        Authorization: 'Bearer ' + LLAVE,
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
        ...(cuerpo ? { 'Content-Type': 'application/json' } : {})
      },
      body: cuerpo ? JSON.stringify(cuerpo) : undefined
    });
    if (r.status === 404 && metodo === 'GET') return null;
    if (r.ok) return r.status === 204 ? {} : r.json();
    const txt = await r.text();
    const reintentable = r.status >= 500 || r.status === 429 || r.status === 403 && /rate limit|secondary/i.test(txt);
    if (reintentable && intento < 4) { await new Promise((s) => setTimeout(s, 1500 + intento * 2500)); continue; }
    throw new Error(`${metodo} ${ruta} → ${r.status} ${txt.slice(0, 300)}`);
  }
}

/* ---------- copiar al repositorio de archivo ---------- */
async function subir() {
  const plan = leer(PLAN, null);
  if (!plan || !plan.archivos.length) { console.log('Nada que subir.'); return; }
  if (!LLAVE) throw new Error('falta ARCHIVO_TOKEN: sin llave no se puede escribir en el repositorio de archivo');
  if (SIMULACRO) { console.log('SIMULACRO: no se sube nada.'); return; }

  // qué hay ya allá, para no subir dos veces lo mismo
  const ref = await api('GET', `git/ref/heads/${encodeURIComponent(RAMA)}`);
  const head = ref && ref.object && ref.object.sha;
  let yaEsta = new Map();
  if (head) {
    const commit = await api('GET', `git/commits/${head}`);
    const arbol = await api('GET', `git/trees/${commit.tree.sha}?recursive=1`);
    if (arbol && !arbol.truncated) yaEsta = new Map((arbol.tree || []).filter((x) => x.type === 'blob').map((x) => [x.path, x.sha]));
    else if (arbol) console.log('(el árbol de allá vino cortado: se comprobará archivo por archivo)');
  }

  const entradas = [];
  for (const c of plan.archivos) {
    const buf = fs.readFileSync(path.join(RAIZ, c.path));
    const mio = shaGit(buf);
    if (mio !== c.sha) throw new Error(`${c.path}: el archivo cambió desde que se hizo el plan (${c.sha} → ${mio})`);
    if (yaEsta.get(c.path) === c.sha) { console.log(`ya estaba  ${c.path}`); entradas.push({ path: c.path, sha: c.sha }); continue; }
    const hecho = await api('POST', 'git/blobs', { content: buf.toString('base64'), encoding: 'base64' });
    /* La comprobación que lo hace seguro: GitHub devuelve el sha de lo que
       guardó. Si es el mismo que el de aquí, la copia es idéntica. */
    if (!hecho || hecho.sha !== c.sha) throw new Error(`${c.path}: la copia no coincide (esperaba ${c.sha}, llegó ${hecho && hecho.sha})`);
    console.log(`copiado   ${mb(c.size).padStart(9)}  ${c.path}`);
    entradas.push({ path: c.path, sha: c.sha });
  }

  // un solo commit con todo
  const arbolNuevo = await api('POST', 'git/trees', {
    ...(head ? { base_tree: (await api('GET', `git/commits/${head}`)).tree.sha } : {}),
    tree: entradas.map((e) => ({ path: e.path, mode: '100644', type: 'blob', sha: e.sha }))
  });
  const commitNuevo = await api('POST', 'git/commits', {
    message: `Mudado del cronograma: ${entradas.length} archivos (${mb(plan.bytes)})`,
    tree: arbolNuevo.sha,
    ...(head ? { parents: [head] } : { parents: [] })
  });
  if (head) await api('PATCH', `git/refs/heads/${encodeURIComponent(RAMA)}`, { sha: commitNuevo.sha });
  else await api('POST', 'git/refs', { ref: `refs/heads/${RAMA}`, sha: commitNuevo.sha });

  // y se vuelve a mirar el resultado antes de dar permiso para borrar
  const comprobar = await api('GET', `git/trees/${arbolNuevo.sha}?recursive=1`);
  const puestos = new Map((comprobar.tree || []).filter((x) => x.type === 'blob').map((x) => [x.path, x.sha]));
  if (comprobar.truncated) {
    /* El árbol de allá vino cortado (son demasiados archivos para una
       respuesta). No se puede releer entero, pero la comprobación que
       importa ya se hizo: de cada archivo se comparó el sha que devolvió
       GitHub al guardarlo, y el árbol se armó con esos mismos shas. */
    console.log('(el árbol de allá vino cortado: vale la comprobación archivo por archivo de más arriba)');
  } else {
    const faltan = plan.archivos.filter((c) => puestos.get(c.path) !== c.sha);
    if (faltan.length) throw new Error(`no quedaron guardados: ${faltan.map((f) => f.path).join(', ').slice(0, 300)}`);
  }

  plan.commit = commitNuevo.sha;
  plan.verificado = true;
  escribir(PLAN, plan);
  console.log(`Listo allá: commit ${commitNuevo.sha.slice(0, 7)} con ${entradas.length} archivos.`);
}

/* ---------- recién ahora: cambiar los datos y borrar de aquí ---------- */
function aplicar() {
  const plan = leer(PLAN, null);
  if (!plan || !plan.archivos.length) { console.log('Nada que aplicar.'); return; }
  if (!plan.verificado) throw new Error('el plan no está comprobado: no se borra nada');
  if (SIMULACRO) { console.log('SIMULACRO: no se cambia nada.'); return; }

  const db = leer(DATOS, null);
  if (!db) throw new Error('no se pudieron leer los datos');
  const base = `https://raw.githubusercontent.com/${plan.repo}/${plan.rama}/`;
  const porPath = new Map(plan.archivos.map((c) => [c.path, c]));

  // 1) las filas de las piezas apuntan ahora al repositorio de archivo
  let filas = 0;
  (db.posts || []).forEach((p) => {
    (p.files || []).forEach((f) => {
      const c = f.path && porPath.get(f.path);
      if (!c || c.de !== 'versiones' || f.externo) return;
      f.url = base + f.path.split('/').map(encodeURIComponent).join('/');
      f.externo = plan.repo;
      filas++;
    });
  });

  // 2) el registro de todo lo que se ha mudado: para que se pueda encontrar siempre
  const libro = leer(LIBRO, null) || { repo: plan.repo, mudanzas: [] };
  libro.repo = plan.repo;
  libro.actualizado = new Date().toISOString();
  libro.mudanzas.push({
    fecha: libro.actualizado, commit: plan.commit, modo: plan.modo,
    archivos: plan.archivos.map((c) => ({ path: c.path, sha: c.sha, size: c.size, de: c.de, pieza: c.pieza || null }))
  });
  const todas = libro.mudanzas.flatMap((m) => m.archivos);
  libro.total = { archivos: todas.length, bytes: todas.reduce((a, x) => a + (x.size || 0), 0) };

  // 3) y ahora sí, fuera de este repositorio
  let borrados = 0, bytes = 0;
  for (const c of plan.archivos) {
    const abs = path.join(RAIZ, c.path);
    try {
      if (fs.existsSync(abs)) { fs.unlinkSync(abs); borrados++; bytes += c.size; }
      const dir = path.dirname(abs);
      if (fs.existsSync(dir) && !fs.readdirSync(dir).length) fs.rmdirSync(dir);
    } catch (e) { console.log(`no se pudo borrar ${c.path}: ${e.message}`); }
  }

  escribir(DATOS, db);
  escribir(LIBRO, libro);
  console.log(`Aplicado: ${filas} filas apuntando al archivo, ${borrados} archivos fuera de aquí (${mb(bytes)}).`);
  console.log(`En el archivo hay ya ${libro.total.archivos} archivos (${mb(libro.total.bytes)}).`);
}

/* ---------- ---------- */
const que = process.argv[2] || '--plan';
try {
  if (que === '--plan') { if (!planear()) process.exit(0); }
  else if (que === '--subir') await subir();
  else if (que === '--aplicar') aplicar();
  else { console.error('uso: mudar.mjs --plan | --subir | --aplicar'); process.exit(2); }
} catch (e) {
  console.error('Falló: ' + (e && e.message || e));
  process.exit(1);
}
