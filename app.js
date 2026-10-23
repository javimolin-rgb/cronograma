/* Cronograma de contenido — interfaz y lógica */
(() => {
'use strict';
const CFG = window.CRONO_CONFIG;
const P = CFG.PEOPLE, STATUSES = CFG.STATUSES, PLATFORMS = CFG.PLATFORMS, FORMATS = CFG.FORMATS;

/* ---------- utilidades ---------- */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const uid = () => window.Store.uid();
const nowISO = () => new Date().toISOString();
const clone = (o) => JSON.parse(JSON.stringify(o));
const pad = (n) => String(n).padStart(2, '0');
const ymd = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const parseYmd = (s) => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };
const today = () => ymd(new Date());
const addDays = (s, n) => { const d = parseYmd(s); d.setDate(d.getDate() + n); return ymd(d); };
const diffDays = (a, b) => Math.round((parseYmd(a) - parseYmd(b)) / 864e5);
const MONTHS = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
const MS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
const DAYS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
const fmtShort = (s) => { const d = parseYmd(s); return `${d.getDate()} ${MS[d.getMonth()]}`; };
const fmtLong = (s) => { const d = parseYmd(s); return `${DAYS[d.getDay()]} ${d.getDate()} de ${MONTHS[d.getMonth()]}`; };
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
const daysSince = (iso) => Math.floor((Date.now() - new Date(iso)) / 864e5);
function ago(iso) {
  const m = Math.round((Date.now() - new Date(iso)) / 6e4);
  if (m < 1) return 'ahora';
  if (m < 60) return `hace ${m} min`;
  const h = Math.round(m / 60);
  if (h < 24) return `hace ${h} h`;
  const d = Math.round(h / 24);
  if (d < 7) return `hace ${d} d`;
  return fmtShort(ymd(new Date(iso)));
}
const debounce = (fn, ms) => { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); }; };
const byId = (arr, id) => arr.find((x) => x.id === id);
const person = (id) => byId(P, id) || { id, name: id || '—', color: '#999' };
const statusOf = (id) => byId(STATUSES, id) || STATUSES[0];
const platOf = (id) => byId(PLATFORMS, id) || { id, name: id, short: '?', color: '#888' };
const formatName = (id) => (byId(FORMATS, id) || { name: id }).name;
const descBy = (k) => (a, b) => (a[k] < b[k] ? 1 : -1);

/* ---------- archivos, versiones y descargas ---------- */
const slugify = (s, f) => window.Store.slug(s, f);
const VER_RE = /[ _.-]*(?:v|ver|versi[oó]n)\s*0*(\d+)\s*$/i;
function splitName(name) {
  const n = String(name || 'archivo');
  const i = n.lastIndexOf('.');
  let base = i > 0 ? n.slice(0, i) : n;
  const ext = i > 0 ? n.slice(i + 1).toLowerCase() : '';
  let version = 0;
  const m = base.match(VER_RE);
  if (m) { version = parseInt(m[1], 10); base = base.slice(0, m.index); }
  base = base.replace(/[ _-]*(final|definitiv[oa]|ok)\s*$/i, '');
  return { base: slugify(base, 'archivo'), label: base.trim() || n, ext, version };
}
const fileSrc = (f) => f.blobUrl || f.url || '';
const extOf = (f) => (splitName(f.name).ext || (f.path || '').split('.').pop() || '').toLowerCase();
const isImg = (f) => (f.type || '').startsWith('image/') || ['jpg', 'jpeg', 'png', 'gif', 'webp', 'avif', 'svg'].includes(extOf(f));
const isVideo = (f) => (f.type || '').startsWith('video/') || ['mp4', 'mov', 'webm', 'm4v'].includes(extOf(f));
const isPdf = (f) => (f.type || '') === 'application/pdf' || extOf(f) === 'pdf';
function prettySize(n) {
  if (!n && n !== 0) return '';
  if (n < 1024) return n + ' B';
  if (n < 1048576) return Math.round(n / 1024) + ' KB';
  return (n / 1048576).toFixed(n < 10485760 ? 1 : 0) + ' MB';
}
// Archivos de una pieza, ya ordenados y con su número de versión
function filesOf(p) {
  const groups = {};
  (p.files || []).forEach((f) => {
    const info = splitName(f.name);
    const base = f.base || info.base;
    (groups[base] = groups[base] || []).push(Object.assign({}, f, { base, version: f.version || info.version || 1, postId: p.id }));
  });
  Object.values(groups).forEach((g) => g.sort((a, b) => (b.version - a.version) || String(b.at || '').localeCompare(String(a.at || ''))));
  return groups;
}
function pieceFiles(p, lastOnly) {
  const g = filesOf(p);
  const out = [];
  Object.keys(g).sort().forEach((k) => { (lastOnly ? g[k].slice(0, 1) : g[k]).forEach((f) => out.push(Object.assign({}, f, { versions: g[k].length }))); });
  return out;
}
const findFile = (fid) => {
  for (const p of S.db.posts) { const f = (p.files || []).find((x) => x.id === fid); if (f) return { post: p, file: f }; }
  return null;
};
const projectName = (p) => (p.campaign || '').trim() || 'Sin proyecto';
function projects(lastOnly) {
  const map = new Map();
  filtered().forEach((p) => {
    const files = pieceFiles(p, lastOnly);
    const k = projectName(p);
    if (!map.has(k)) map.set(k, { name: k, posts: [], files: 0, size: 0 });
    const g = map.get(k);
    g.posts.push({ post: p, files });
    g.files += files.length;
    g.size += files.reduce((a, f) => a + (f.size || 0), 0);
  });
  const arr = [...map.values()];
  arr.forEach((g) => g.posts.sort((a, b) => String(b.post.date || b.post.createdAt || '').localeCompare(String(a.post.date || a.post.createdAt || ''))));
  return arr.sort((a, b) => b.files - a.files || a.name.localeCompare(b.name));
}
async function fetchFile(f) {
  if (f.blob) return f.blob; // contenido armado aquí mismo, no hay que ir a buscarlo
  const tries = [fileSrc(f)];
  if (f.path) tries.push(f.path.split('/').map(encodeURIComponent).join('/')); // copia publicada en esta misma página
  for (const u of tries) {
    if (!u) continue;
    try {
      const r = await fetch(u, { cache: 'no-store' });
      if (r.ok) return await r.blob();
    } catch (e) { /* probamos la siguiente */ }
  }
  throw new Error('no se pudo descargar ' + f.name);
}
async function downloadOne(f) {
  try {
    toast('Descargando ' + f.name + '…', 8000);
    window.Zip.save(await fetchFile(f), f.name);
    toast('Listo');
  } catch (e) { toast('No se pudo descargar: ' + (e.message || e), 4000); }
}
async function downloadZip(entries, zipName) {
  if (!entries.length) { toast('No hay archivos para descargar'); return; }
  try {
    const parts = [];
    for (let i = 0; i < entries.length; i++) {
      const e = entries[i];
      toast(`Preparando ${i + 1} de ${entries.length}…`, 15000);
      parts.push({ name: e.name, blob: await fetchFile(e.file), date: e.file.at ? new Date(e.file.at) : new Date() });
    }
    const blob = await window.Zip.make(parts);
    window.Zip.save(blob, zipName.replace(/[\\/:*?"<>|]+/g, '-') + '.zip');
    toast(`${parts.length} archivo${parts.length === 1 ? '' : 's'} · ${prettySize(blob.size)}`);
  } catch (e) { toast('No se pudo armar el zip: ' + (e.message || e), 4000); }
}

const IC = {
  calendar: '<rect x="3" y="4" width="18" height="18" rx="3"/><path d="M16 2v4M8 2v4M3 10h18"/>',
  list: '<path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>',
  board: '<rect x="3" y="3" width="7" height="18" rx="2"/><rect x="14" y="3" width="7" height="11" rx="2"/>',
  chart: '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
  bell: '<path d="M18 8a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 01-3.4 0"/>',
  bellOff: '<path d="M13.7 21a2 2 0 01-3.4 0M18.6 13A17 17 0 0118 8M6.3 6.3A6 6 0 006 8c0 7-3 9-3 9h14M18 8a6 6 0 00-9.3-5M1 1l22 22"/>',
  mic: '<rect x="9" y="2" width="6" height="12" rx="3"/><path d="M5 10a7 7 0 0014 0M12 17v5M8 22h8"/>',
  share: '<path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8M16 6l-4-4-4 4M12 2v13"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/>',
  sliders: '<path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6"/>',
  x: '<path d="M18 6L6 18M6 6l12 12"/>',
  trash: '<path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/>',
  paperclip: '<path d="M21 11l-9 9a5 5 0 01-7-7l9-9a3 3 0 014 4l-9 9a1 1 0 01-2-2l8-8"/>',
  link: '<path d="M10 13a5 5 0 007 0l3-3a5 5 0 00-7-7l-1 1M14 11a5 5 0 00-7 0l-3 3a5 5 0 007 7l1-1"/>',
  check: '<path d="M20 6L9 17l-5-5"/>',
  left: '<path d="M15 18l-6-6 6-6"/>',
  right: '<path d="M9 18l6-6-6-6"/>',
  msg: '<path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>',
  alert: '<path d="M12 9v4M12 17h.01"/><path d="M10.3 3.9L1.8 18a2 2 0 001.7 3h17a2 2 0 001.7-3L13.7 3.9a2 2 0 00-3.4 0z"/>',
  image: '<rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="9" cy="9" r="2"/><path d="M21 15l-5-5L5 21"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  download: '<path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/>',
  folder: '<path d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>',
  eye: '<path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z"/><circle cx="12" cy="12" r="3"/>',
  key: '<circle cx="7.5" cy="15.5" r="4.5"/><path d="M10.7 12.3L21 2M17 6l3 3M14 9l3 3"/>',
  cloud: '<path d="M20 17.6A4.5 4.5 0 0017.5 9h-1.3A7 7 0 103 15.9"/><path d="M12 12v9M8.5 16.5L12 13l3.5 3.5"/>',
  copy: '<rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>'
};
// Marca: un calendario con la división en T de Neorigen
const marca = () => '<svg viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="6" stroke-linejoin="round" stroke-linecap="round" aria-hidden="true"><path d="M18 27 H82 V80 H18 Z"/><path d="M18 42 H82"/><path d="M47 42 V80"/><path d="M33 18 V33"/><path d="M67 18 V33"/></svg>';
const ic = (n, s = 20) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${IC[n] || ''}</svg>`;

/* ---------- apariencia y secciones (cada uno en su teléfono) ---------- */
const UI_KEY = 'crono_ui_v1';
const UI = Object.assign({ tema: 'auto', escala: 1, oculto: [] }, (() => {
  try { return JSON.parse(localStorage.getItem(UI_KEY)) || {}; } catch (e) { return {}; }
})());
const TEMAS = [['auto', 'Según el sistema'], ['light', 'Claro'], ['dark', 'Oscuro']];
const ESCALAS = [[0.9, 'Chica'], [1, 'Normal'], [1.15, 'Grande'], [1.3, 'Más grande']];
const SECCIONES = [['calendar', 'Calendario'], ['list', 'Agenda'], ['board', 'Tablero'], ['files', 'Entregas'], ['dash', 'Panel']];
function guardarUI() { try { localStorage.setItem(UI_KEY, JSON.stringify(UI)); } catch (e) { /* sin espacio */ } }
function aplicarUI() {
  const r = document.documentElement;
  if (UI.tema === 'auto') r.removeAttribute('data-theme'); else r.setAttribute('data-theme', UI.tema);
  r.style.setProperty('--escala', String(UI.escala || 1));
  const color = getComputedStyle(r).getPropertyValue('--bg').trim();
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta && color) meta.setAttribute('content', UI.tema === 'auto' ? '#1F2A44' : color);
}
const visibles = () => SECCIONES.filter(([id]) => !UI.oculto.includes(id));
function asegurarVista() {
  const v = visibles();
  if (!v.some(([id]) => id === S.view)) { S.view = v[0][0]; localStorage.setItem('crono_view', S.view); }
}

/* ---------- estado ---------- */
const S = {
  me: null,
  view: localStorage.getItem('crono_view') || 'calendar',
  cursor: (() => { const d = new Date(); d.setDate(1); return d; })(),
  sel: today(),
  f: { q: '', person: '', platform: '', status: '', format: '', mine: false },
  offline: '',
  lastOnly: localStorage.getItem('crono_last_only') !== '0',
  conPrompts: localStorage.getItem('crono_prompts') === '1',
  openProject: localStorage.getItem('crono_open_project') || '',
  compartidos: 0,
  db: { posts: [], comments: [], activity: [], notifications: [], prefs: [] }
};
let store, ED = null, sheetOpen = false, toastT;

function normalize(db) {
  db.posts = (db.posts || []).map((p) => Object.assign({
    title: '', caption: '', notes: '', hashtags: '', campaign: '', time: '', date: '', format: 'post', status: 'idea', priority: 'normal', revisions: 0
  }, p, {
    platforms: p.platforms || [], assignees: p.assignees || [], files: p.files || [], links: p.links || [], checklist: p.checklist || []
  }));
  ['comments', 'activity', 'notifications', 'prefs', 'push_subs'].forEach((t) => { db[t] = db[t] || []; });
  return db;
}

/* ---------- guardado ---------- */
function requireWrite() {
  if (store.mode !== 'github' || store.canWrite) return true;
  toast('Para escribir necesitas la clave de acceso', 3400);
  openMe();
  return false;
}
async function save(table, obj) {
  const arr = S.db[table];
  const i = arr.findIndex((x) => x.id === obj.id);
  if (i >= 0) arr[i] = obj; else arr.unshift(obj);
  try { await store.put(table, obj); }
  catch (e) { console.error(e); toast('No se pudo guardar: ' + (e.message || e)); throw e; }
}
async function removeRow(table, id) {
  S.db[table] = S.db[table].filter((x) => x.id !== id);
  try { await store.del(table, id); } catch (e) { console.error(e); toast('No se pudo borrar: ' + (e.message || e)); }
}
async function log(p, type, text, meta) {
  try { await save('activity', { id: uid(), postId: p.id, postTitle: p.title, actor: S.me.id, type, text, meta: meta || null, createdAt: nowISO() }); } catch (e) { /* ya avisado */ }
}

/* ---------- preferencias y avisos ---------- */
const EVENTS = [
  { id: 'tagged', label: 'Me etiquetan en una pieza', hint: 'Al crear o agregarme como responsable' },
  { id: 'mention', label: 'Me mencionan en un comentario', hint: 'Cuando escriben @mi-nombre' },
  { id: 'comment', label: 'Comentan en mis piezas', hint: 'Piezas donde estoy etiquetado/a' },
  { id: 'status', label: 'Cambia el estado de mis piezas', hint: 'Ej. pasa a “Aprobado” o “Cambios”' },
  { id: 'reschedule', label: 'Cambia la fecha de mis piezas', hint: 'Reprogramaciones' },
  { id: 'update', label: 'Editan contenido o archivos', hint: 'Copy, archivos, enlaces, formato…' },
  { id: 'deadline', label: 'Vencimientos (hoy / atrasadas)', hint: 'Se muestran dentro de la app', appOnly: true }
];
const DEFAULT_EV = {
  tagged: { app: 1, push: 1 }, mention: { app: 1, push: 1 }, comment: { app: 1, push: 0 },
  status: { app: 1, push: 0 }, reschedule: { app: 1, push: 1 }, update: { app: 1, push: 0 }, deadline: { app: 1, push: 0 }
};
function prefsOf(pid) {
  const p = S.db.prefs.find((x) => x.id === pid) || {};
  const events = {};
  Object.keys(DEFAULT_EV).forEach((k) => { events[k] = Object.assign({}, DEFAULT_EV[k], (p.events || {})[k] || {}); });
  return { events, silenciadas: p.silenciadas || [], seguidas: p.seguidas || [] };
}
// Avisos de una pieza en particular: cada uno puede silenciarla o seguirla aunque no esté etiquetado
const silenciada = (pid, postId) => prefsOf(pid).silenciadas.includes(postId);
const sigue = (pid, postId) => prefsOf(pid).seguidas.includes(postId);
function recibeAvisos(pid, post) {
  if (!post || silenciada(pid, post.id)) return false;
  return post.assignees.includes(pid) || sigue(pid, post.id);
}
async function cambiarAvisosPieza(post) {
  const me = S.me.id;
  const old = S.db.prefs.find((x) => x.id === me) || { id: me, events: prefsOf(me).events, createdAt: nowISO() };
  const pr = Object.assign({}, old, { silenciadas: (old.silenciadas || []).filter((x) => x !== post.id), seguidas: (old.seguidas || []).filter((x) => x !== post.id) });
  const activar = !recibeAvisos(me, post);
  if (activar) { if (!post.assignees.includes(me)) pr.seguidas.push(post.id); }
  else pr.silenciadas.push(post.id);
  await save('prefs', pr);
  return activar;
}
const siteBase = () => CFG.SITE_URL || (location.origin + location.pathname);
const siteLink = (id) => `${siteBase()}#post=${id}`;

async function notify(type, post, targets, text) {
  // quienes siguen la pieza también se enteran; quienes la silenciaron, no
  const seguidores = ['comment', 'status', 'reschedule', 'update'].includes(type) ? P.filter((x) => sigue(x.id, post.id)).map((x) => x.id) : [];
  const set = [...new Set(targets.concat(seguidores))].filter((id) => id && id !== S.me.id && !silenciada(id, post.id));
  for (const pid of set) {
    const ev = prefsOf(pid).events[type];
    if (!ev || (!ev.app && !ev.push)) continue;
    try {
      await save('notifications', {
        id: uid(), to: pid, from: S.me.id, postId: post.id, type, text, read: false,
        inApp: !!ev.app, push: !!ev.push,
        title: CFG.APP_NAME, body: `${S.me.name} ${text}`.slice(0, 180), url: siteLink(post.id),
        createdAt: nowISO()
      });
    } catch (e) { /* ya avisado */ }
  }
}

/* ---------- guardar pieza (con seguimiento y avisos) ---------- */
const FIELD_LABEL = { title: 'título', caption: 'copy', hashtags: 'hashtags', notes: 'notas', format: 'formato', platforms: 'plataformas', priority: 'prioridad', time: 'hora', links: 'enlaces', files: 'archivos', campaign: 'campaña', checklist: 'checklist' };
const CONTENT_FIELDS = ['title', 'caption', 'hashtags', 'notes', 'format', 'platforms', 'priority', 'time', 'links', 'files', 'campaign'];
const sameJ = (a, b) => JSON.stringify(a ?? null) === JSON.stringify(b ?? null);

async function commitPost(old, p) {
  const me = S.me.id, at = nowISO(), isNew = !old;
  p.updatedAt = at; p.updatedBy = me;
  if (isNew) {
    Object.assign(p, { createdAt: at, createdBy: me, statusChangedAt: at, revisions: 0, publishedAt: p.status === 'publicado' ? at : null });
  } else {
    Object.assign(p, { createdAt: old.createdAt, createdBy: old.createdBy, revisions: old.revisions || 0, statusChangedAt: old.statusChangedAt, publishedAt: old.publishedAt || null });
    if (old.status !== p.status) {
      p.statusChangedAt = at;
      if (p.status === 'cambios') p.revisions += 1;
      p.publishedAt = p.status === 'publicado' ? at : null;
    }
  }
  await save('posts', p);

  if (isNew) {
    await log(p, 'created', 'creó la pieza');
    await notify('tagged', p, p.assignees, `te etiquetó en “${p.title}”`);
    return;
  }
  const added = p.assignees.filter((x) => !old.assignees.includes(x));
  const removed = old.assignees.filter((x) => !p.assignees.includes(x));
  const keep = p.assignees.filter((x) => old.assignees.includes(x));
  if (added.length) {
    await log(p, 'tag', `etiquetó a ${added.map((a) => person(a).name).join(', ')}`);
    await notify('tagged', p, added, `te etiquetó en “${p.title}”`);
  }
  if (removed.length) await log(p, 'untag', `quitó a ${removed.map((a) => person(a).name).join(', ')}`);
  if (old.status !== p.status) {
    await log(p, 'status', `movió de ${statusOf(old.status).name} a ${statusOf(p.status).name}`, { from: old.status, to: p.status });
    await notify('status', p, keep, `movió “${p.title}” a ${statusOf(p.status).name}`);
  }
  if ((old.date || '') !== (p.date || '')) {
    const nd = p.date ? fmtShort(p.date) : 'sin fecha';
    await log(p, 'reschedule', `cambió la fecha ${old.date ? 'de ' + fmtShort(old.date) + ' ' : ''}a ${nd}`, { from: old.date, to: p.date });
    await notify('reschedule', p, keep, `cambió la fecha de “${p.title}” a ${nd}`);
  }
  const changed = CONTENT_FIELDS.filter((k) => !sameJ(old[k], p[k]));
  const ckChanged = !sameJ(old.checklist, p.checklist);
  if (changed.length || ckChanged) {
    const labels = changed.concat(ckChanged ? ['checklist'] : []).map((k) => FIELD_LABEL[k]).join(', ');
    await log(p, 'edit', `editó ${labels}`);
    if (changed.length) await notify('update', p, keep, `editó “${p.title}” (${changed.map((k) => FIELD_LABEL[k]).join(', ')})`);
  }
}

async function changeStatus(id, status) {
  const old = S.db.posts.find((p) => p.id === id);
  if (!old || old.status === status) return;
  if (!requireWrite()) return;
  const p = clone(old); p.status = status;
  await commitPost(old, p);
  renderAll();
  toast(`Movida a ${statusOf(status).name}`);
}

/* ---------- vistas: piezas ---------- */
const isStalled = (p) => ['diseno', 'revision', 'cambios'].includes(p.status) && daysSince(p.statusChangedAt || p.updatedAt || nowISO()) >= 3;
const av = (pid, cls = '') => { const p = person(pid); return `<span class="av ${cls}" style="--c:${p.color}" title="${esc(p.name)}">${esc(p.name[0])}</span>`; };
const platBadge = (id) => { const p = platOf(id); return `<span class="plat" style="--c:${p.color}">${esc(p.short)}</span>`; };
const sortPosts = (a, b) => ((a.date || '9999') + (a.time || '99:99') + a.title).localeCompare((b.date || '9999') + (b.time || '99:99') + b.title);

function filtered() {
  const f = S.f, q = f.q.trim().toLowerCase();
  return S.db.posts.filter((p) => {
    if (f.mine && !p.assignees.includes(S.me.id)) return false;
    if (f.person && !p.assignees.includes(f.person)) return false;
    if (f.platform && !p.platforms.includes(f.platform)) return false;
    if (f.status && p.status !== f.status) return false;
    if (f.format && p.format !== f.format) return false;
    if (q && !`${p.title} ${p.caption} ${p.hashtags} ${p.notes} ${p.campaign || ''}`.toLowerCase().includes(q)) return false;
    return true;
  });
}
const filterCount = () => ['person', 'platform', 'status', 'format'].filter((k) => S.f[k]).length;

function card(p, o = {}) {
  const st = statusOf(p.status), t = today();
  const overdue = p.date && p.date < t && p.status !== 'publicado';
  const img = p.files.find((f) => (f.type || '').startsWith('image/'));
  const done = p.checklist.filter((c) => c.done).length;
  const nc = S.db.comments.filter((c) => c.postId === p.id).length;
  const when = p.date ? (o.noDate ? (p.time || '') : `${fmtShort(p.date)}${p.time ? ' · ' + p.time : ''}`) : 'Sin fecha';
  return `<article class="card${overdue ? ' overdue' : ''}" data-act="open-post" data-id="${esc(p.id)}"${o.drag ? ' draggable="true"' : ''} style="--c:${st.color}">
    <div class="thumb">${img ? `<img loading="lazy" alt="" src="${esc(img.thumb || img.url)}">` : ic('image', 22)}</div>
    <div class="cb">
      <div class="ctop"><h3>${p.priority === 'alta' ? '<i class="prio" title="Prioridad alta"></i>' : ''}${esc(p.title)}</h3>
        <button class="badge" data-act="status-menu" data-id="${esc(p.id)}">${esc(st.name)}</button></div>
      <div class="cmeta">${overdue ? `<b class="late">${ic('alert', 13)} Atrasada</b>` : ''}${when ? `<span>${esc(when)}</span>` : ''}<span>${esc(formatName(p.format))}</span>${isStalled(p) ? '<b class="stuck">Estancada</b>' : ''}</div>
      <div class="cfoot"><div class="plats">${p.platforms.map(platBadge).join('')}</div>
        <div class="cinfo">${nc ? `<span>${ic('msg', 14)}${nc}</span>` : ''}${p.files.length ? `<span>${ic('paperclip', 14)}${p.files.length}</span>` : ''}${p.checklist.length ? `<span>${ic('check', 14)}${done}/${p.checklist.length}</span>` : ''}<span class="avs">${p.assignees.map((a) => av(a, 'sm')).join('')}</span></div></div>
    </div></article>`;
}
const emptyBox = (title, sub, day) => `<div class="empty"><b>${esc(title)}</b>${esc(sub)}<div style="margin-top:14px"><button class="btn sm" data-act="new"${day ? ` data-d="${day}"` : ''}>${ic('plus', 16)} Nueva pieza</button></div></div>`;

function viewCalendar() {
  const c = S.cursor, y = c.getFullYear(), m = c.getMonth();
  const startDow = (new Date(y, m, 1).getDay() + 6) % 7;
  const nDays = new Date(y, m + 1, 0).getDate();
  const posts = filtered();
  const map = {};
  posts.forEach((p) => { if (p.date) (map[p.date] = map[p.date] || []).push(p); });
  const t = today();
  let cells = '';
  for (let i = 0; i < startDow; i++) cells += '<div class="cell empty"></div>';
  for (let d = 1; d <= nDays; d++) {
    const key = `${y}-${pad(m + 1)}-${pad(d)}`, ps = map[key] || [];
    const dots = ps.slice(0, 4).map((p) => `<i style="--c:${statusOf(p.status).color}"></i>`).join('') + (ps.length > 4 ? `<em>+${ps.length - 4}</em>` : '');
    cells += `<button class="cell${key === t ? ' today' : ''}${key === S.sel ? ' sel' : ''}" data-act="pick-day" data-d="${key}"><span class="n">${d}</span><div class="dots">${dots}</div></button>`;
  }
  const dayPosts = (map[S.sel] || []).sort(sortPosts);
  return `<div class="calhead"><h2>${MONTHS[m]} ${y}</h2><div class="nav">
      <button class="chip" data-act="today">Hoy</button>
      <button class="iconbtn" data-act="prev-m" aria-label="Mes anterior">${ic('left')}</button>
      <button class="iconbtn" data-act="next-m" aria-label="Mes siguiente">${ic('right')}</button></div></div>
    <div class="dow">${['L', 'M', 'X', 'J', 'V', 'S', 'D'].map((x) => `<span>${x}</span>`).join('')}</div>
    <div class="calgrid" id="calgrid">${cells}</div>
    <div class="dayhead"><h3>${cap(fmtLong(S.sel))}</h3><small>${dayPosts.length} pieza${dayPosts.length === 1 ? '' : 's'}</small></div>
    <div class="list">${dayPosts.length ? dayPosts.map((p) => card(p, { noDate: true })).join('') : emptyBox('Día libre', 'No hay piezas para este día.', S.sel)}</div>`;
}

function viewList() {
  const t = today(), ps = filtered().sort(sortPosts);
  const g = { late: [], today: [], tomorrow: [], week: [], later: [], nodate: [], done: [] };
  ps.forEach((p) => {
    if (p.status === 'publicado') g.done.push(p);
    else if (!p.date) g.nodate.push(p);
    else if (p.date < t) g.late.push(p);
    else if (p.date === t) g.today.push(p);
    else if (p.date === addDays(t, 1)) g.tomorrow.push(p);
    else if (p.date <= addDays(t, 7)) g.week.push(p);
    else g.later.push(p);
  });
  const sec = (title, arr, cls = '') => arr.length ? `<section class="group ${cls}"><h3>${title} <b>${arr.length}</b></h3><div class="list">${arr.map((p) => card(p)).join('')}</div></section>` : '';
  const html = sec('Atrasadas', g.late, 'late') + sec('Hoy', g.today) + sec('Mañana', g.tomorrow) + sec('Esta semana', g.week) + sec('Más adelante', g.later) + sec('Sin fecha', g.nodate) +
    (g.done.length ? `<details class="group"><summary>Publicadas <b>${g.done.length}</b></summary><div class="list">${g.done.slice().reverse().map((p) => card(p)).join('')}</div></details>` : '');
  return html || emptyBox('Aún no hay piezas', 'Crea la primera para empezar tu cronograma.');
}

function viewBoard() {
  const ps = filtered().sort(sortPosts);
  return `<div class="board">${STATUSES.map((s) => {
    const arr = ps.filter((p) => p.status === s.id);
    return `<section class="col" data-status="${s.id}"><h3><i style="background:${s.color}"></i>${esc(s.name)}<b>${arr.length}</b></h3>
      <div class="cards">${arr.length ? arr.map((p) => card(p, { drag: true })).join('') : '<div class="empty-col">Sin piezas</div>'}</div></section>`;
  }).join('')}</div>`;
}

/* ---------- vista: entregas (archivos) ---------- */
function fileTile(f) {
  const src = fileSrc(f);
  const thumb = isImg(f) && src
    ? `<img loading="lazy" alt="" src="${esc(src)}">`
    : `<span class="ext">${esc((extOf(f) || '?').slice(0, 4).toUpperCase())}</span>`;
  return `<div class="ftile" data-act="file-open" data-f="${esc(f.id)}">
    <div class="fthumb">${thumb}${f.version > 1 || f.versions > 1 ? `<i class="vtag">v${f.version}</i>` : ''}</div>
    <div class="fmeta"><b>${esc(f.name)}</b><small>${esc(prettySize(f.size))}${f.versions > 1 ? ` · ${f.versions} versiones` : ''}</small></div>
    <button class="fdl" data-act="file-dl" data-f="${esc(f.id)}" aria-label="Descargar ${esc(f.name)}">${ic('download', 18)}</button>
  </div>`;
}
function viewFiles() {
  const groups = projects(S.lastOnly);
  const totalFiles = groups.reduce((a, g) => a + g.files, 0);
  const head = `<div class="fhead">
      <div class="chips"><button class="chip${S.lastOnly ? ' on' : ''}" data-act="toggle-last">${ic('check', 15)} Solo última versión</button>
      <button class="chip${S.conPrompts ? ' on' : ''}" data-act="toggle-prompts">${ic('copy', 15)} Con prompt para IA</button>
      <button class="btn ghost sm" data-act="dl-all">${ic('download', 16)} Todo</button></div>
      <small>${groups.length} proyecto${groups.length === 1 ? '' : 's'} · ${totalFiles} archivo${totalFiles === 1 ? '' : 's'}</small></div>`;
  if (!groups.length) return head + emptyBox('Todavía no hay entregas', 'Cada pieza con archivos o enlaces aparece aquí, agrupada por proyecto.');
  const body = groups.map((g) => {
    const open = S.openProject === g.name;
    const piezas = g.posts.map(({ post, files }) => {
      const links = post.links || [];
      return `<details class="pz"${files.length || links.length ? '' : ''}>
        <summary><span class="dotst" style="background:${statusOf(post.status).color}"></span><b>${esc(post.title)}</b>
          <small>${post.date ? esc(fmtShort(post.date)) : 'sin fecha'}${files.length ? ' · ' + files.length + ' arch.' : ''}${links.length ? ' · ' + links.length + ' enl.' : ''}</small></summary>
        <div class="pzbody">
          ${files.length ? `<div class="fgrid">${files.map(fileTile).join('')}</div>` : '<p class="hint">Sin archivos subidos.</p>'}
          ${links.length ? `<div class="flinks">${links.map((l) => `<a href="${esc(l.url)}" target="_blank" rel="noopener">${ic('link', 15)}${esc(l.label || l.url)}</a>`).join('')}</div>` : ''}
          <div class="pzacts">
            ${files.length ? `<button class="btn ghost sm" data-act="dl-piece" data-id="${esc(post.id)}">${ic('download', 15)} Descargar pieza</button>` : ''}
            <button class="btn ghost sm" data-act="pr-open" data-id="${esc(post.id)}">${ic('copy', 15)} Prompt IA</button>
            <button class="btn ghost sm" data-act="open-post" data-id="${esc(post.id)}">Abrir pieza</button></div>
        </div></details>`;
    }).join('');
    return `<section class="box proj">
      <h3 class="projh"><button class="projt" data-act="toggle-project" data-p="${esc(g.name)}">${ic('folder', 18)}<span>${esc(g.name)}</span></button>
        <button class="btn ghost sm" data-act="dl-project" data-p="${esc(g.name)}">${ic('download', 15)} ZIP</button></h3>
      <small class="projs">${g.posts.length} pieza${g.posts.length === 1 ? '' : 's'} · ${g.files} archivo${g.files === 1 ? '' : 's'}${g.size ? ' · ' + prettySize(g.size) : ''}</small>
      <div class="pzs"${open ? '' : ''}>${piezas}</div></section>`;
  }).join('');
  return head + body;
}

function entriesOfPost(p, lastOnly) {
  return pieceFiles(p, lastOnly).map((f) => ({ name: f.name, file: f }));
}
function entriesOfProject(name, lastOnly) {
  const out = [];
  filtered().filter((p) => projectName(p) === name).forEach((p) => {
    const carpeta = slugify(p.title, 'pieza');
    const archivos = pieceFiles(p, lastOnly);
    archivos.forEach((f) => out.push({ name: `${carpeta}/${f.name}`, file: f }));
    if (S.conPrompts && (archivos.length || pendientesDe(p).length)) {
      const texto = promptDe(p, tipoTarea(p));
      out.push({ name: `${carpeta}/PROMPT.txt`, file: { name: 'PROMPT.txt', blob: new Blob([texto], { type: 'text/plain' }) } });
    }
  });
  return out;
}

/* ---------- ver un archivo ---------- */
function openFilePreview(fid) {
  const hit = findFile(fid);
  if (!hit) { toast('Ese archivo ya no está'); return; }
  const { post, file } = hit;
  const info = splitName(file.name);
  const all = (filesOf(post)[file.base || info.base] || []);
  const src = fileSrc(file);
  let media;
  if (isImg(file)) media = `<img src="${esc(src)}" alt="${esc(file.name)}" data-act="file-zoom" data-f="${esc(file.id)}">`;
  else if (isVideo(file)) media = `<video src="${esc(src)}" controls playsinline></video>`;
  else if (isPdf(file)) media = `<iframe src="${esc(src)}" title="${esc(file.name)}"></iframe>`;
  else media = `<div class="noprev"><span class="ext">${esc((extOf(file) || '?').toUpperCase())}</span><p class="hint">Este tipo de archivo no se puede ver aquí. Descárgalo para abrirlo.</p></div>`;
  openSheet(`<div class="ph"><button class="iconbtn" data-act="sheet-close" aria-label="Cerrar">${ic('x')}</button>
      <h2>${esc(esAdmin() ? file.name : post.title)}</h2><span style="width:40px"></span></div>
    <div class="pb">
      <div class="preview">${media}</div>
      <div class="track" style="margin-top:14px">
        <div><span>Pieza</span><b>${esc(post.title)}</b></div>
        <div><span>Proyecto</span><b>${esc(projectName(post))}</b></div>
        ${esAdmin() ? `<div><span>Versión</span><b>v${file.version || info.version || 1}${all.length > 1 ? ` de ${all.length}` : ''}</b></div>
        <div><span>Peso</span><b>${esc(prettySize(file.size) || '—')}</b></div>
        <div><span>Subido por</span><b>${esc(person(file.by).name)}</b></div>` : ''}
        <div><span>Cuándo</span><b>${file.at ? esc(ago(file.at)) : '—'}</b></div>
      </div>
      ${esAdmin() && all.length > 1 ? `<label class="lbl">Otras versiones</label><div class="vlist">${all.map((v) => `<button class="vrow${v.id === file.id ? ' on' : ''}" data-act="file-open" data-f="${esc(v.id)}"><b>v${v.version}</b><span>${esc(v.name)}</span><small>${esc(prettySize(v.size))}</small></button>`).join('')}</div>` : ''}
    </div>
    <div class="pf"><button class="btn ghost" data-act="open-post" data-id="${esc(post.id)}">Ver pieza</button>
      <button class="btn" data-act="file-dl" data-f="${esc(file.id)}">${ic('download', 18)} Descargar</button></div>`, true);
}

/* ---------- vista de resultado (lo que ven Flavio y Maca) ---------- */
// Un archivo dentro del carrusel: foto, video o documento
function slideHtml(f) {
  const src = fileSrc(f);
  if (isImg(f)) return `<div class="slide"><img loading="lazy" alt="" src="${esc(src)}" data-act="file-zoom"></div>`;
  if (isVideo(f)) return `<div class="slide"><video src="${esc(src)}" controls playsinline preload="metadata"></video></div>`;
  return `<div class="slide doc" data-act="file-open" data-f="${esc(f.id)}"><span class="ext">${esc((extOf(f) || 'archivo').toUpperCase())}</span><small>Tocar para abrir</small></div>`;
}
function carruselHtml(files, id) {
  if (!files.length) return '';
  const uno = files.length === 1;
  return `<div class="carru${uno ? ' uno' : ''}" id="c-${esc(id)}">
    <div class="carru-track">${files.map(slideHtml).join('')}</div>
    ${uno ? '' : `<button class="carru-ar prev" data-act="carru" data-d="-1" aria-label="Anterior">${ic('left', 20)}</button>
    <button class="carru-ar next" data-act="carru" data-d="1" aria-label="Siguiente">${ic('right', 20)}</button>
    <div class="carru-dots">${files.map((f, i) => `<i${i ? '' : ' class="on"'}></i>`).join('')}</div>
    <span class="carru-n">1/${files.length}</span>`}
  </div>`;
}
// Piezas que ya se mostraron al equipo: lo entregado, no lo que está en preparación
const esEntrega = (p) => !['idea', 'diseno'].includes(p.status);
function viewResultados() {
  const piezas = filtered().filter(esEntrega)
    .sort((a, b) => String(b.date || b.updatedAt || '').localeCompare(String(a.date || a.updatedAt || '')));
  if (!piezas.length) return emptyBox('Todavía no hay entregas', 'Aquí vas a ver cada pieza terminada, como se ve publicada.');
  return `<div class="resfeed">${piezas.map((p) => {
    const files = pieceFiles(p, true); // solo la versión final de cada archivo
    const st = statusOf(p.status);
    const tags = (p.hashtags || '').trim();
    return `<article class="res" style="--c:${st.color}">
      <header>
        <div><h3>${esc(p.title)}</h3>
          <small>${p.date ? esc(cap(fmtLong(p.date))) : 'Sin fecha'}${p.time ? ' · ' + esc(p.time) : ''} · ${esc(formatName(p.format))}</small></div>
        <span class="badge" style="--c:${st.color}">${esc(st.name)}</span>
      </header>
      ${carruselHtml(files, p.id)}
      <div class="resbody">
        <div class="plats">${p.platforms.map(platBadge).join('')}</div>
        ${p.caption ? `<p class="copy">${mentionHtml(p.caption)}</p>` : ''}
        ${tags ? `<p class="tags">${esc(tags)}</p>` : ''}
        ${(p.links || []).length ? `<div class="flinks">${p.links.map((l) => `<a href="${esc(l.url)}" target="_blank" rel="noopener">${ic('link', 15)}${esc(l.label || l.url)}</a>`).join('')}</div>` : ''}
        <div class="resacts">
          <button class="btn ghost sm" data-act="open-post" data-id="${esc(p.id)}">${ic('msg', 15)} Comentar</button>
          ${files.length ? `<button class="btn ghost sm" data-act="dl-final" data-id="${esc(p.id)}">${ic('download', 15)} Descargar</button>` : ''}
        </div>
      </div></article>`;
  }).join('')}</div>`;
}

/* ---------- vista: panel de seguimiento ---------- */
const bars = (rows) => { const max = Math.max(1, ...rows.map((r) => r.n)); return `<div class="bars">${rows.map((r) => `<div class="bar"><span class="bl">${esc(r.label)}</span><div class="bt"><i style="width:${(r.n / max) * 100}%;background:${r.color}"></i></div><b>${r.n}</b></div>`).join('')}</div>`; };
const miniRow = (p, extra) => `<div class="minirow" data-act="open-post" data-id="${esc(p.id)}"><span class="av md" style="--c:${statusOf(p.status).color}">${esc(statusOf(p.status).name[0])}</span><div class="t"><b>${esc(p.title)}</b><small>${esc(extra)}</small></div>${p.assignees.slice(0, 3).map((a) => av(a, 'sm')).join('')}</div>`;

function viewDash() {
  const all = S.db.posts, t = today(), mk = t.slice(0, 7);
  const month = all.filter((p) => (p.date || '').startsWith(mk));
  const mPub = month.filter((p) => p.status === 'publicado').length;
  const pct = month.length ? Math.round((mPub / month.length) * 100) : 0;
  const overdue = all.filter((p) => p.date && p.date < t && p.status !== 'publicado').sort(sortPosts);
  const week = all.filter((p) => p.date && p.date >= t && p.date <= addDays(t, 6) && p.status !== 'publicado');
  const review = all.filter((p) => p.status === 'revision' || p.status === 'cambios');
  const stalled = all.filter(isStalled);
  const unassigned = all.filter((p) => !p.assignees.length && p.status !== 'publicado');
  const noFile = all.filter((p) => ['revision', 'aprobado', 'programado'].includes(p.status) && !p.files.length);
  const pubs = all.filter((p) => p.status === 'publicado' && p.publishedAt);
  const onTime = pubs.length ? Math.round((pubs.filter((p) => !p.date || ymd(new Date(p.publishedAt)) <= p.date).length / pubs.length) * 100) : null;
  const cycle = pubs.length ? (pubs.reduce((a, p) => a + (new Date(p.publishedAt) - new Date(p.createdAt)) / 864e5, 0) / pubs.length).toFixed(1) : null;
  const rounds = all.length ? (all.reduce((a, p) => a + (p.revisions || 0), 0) / all.length).toFixed(1) : '0';

  const mon = (() => { const d = new Date(); d.setDate(d.getDate() - ((d.getDay() + 6) % 7)); return ymd(d); })();
  const weeks = [5, 4, 3, 2, 1, 0].map((k) => {
    const a = addDays(mon, -7 * k), b = addDays(a, 6);
    return { label: fmtShort(a), n: pubs.filter((p) => { const d = ymd(new Date(p.publishedAt)); return d >= a && d <= b; }).length };
  });
  const wmax = Math.max(1, ...weeks.map((w) => w.n));
  const mine = all.filter((p) => p.assignees.includes(S.me.id) && p.status !== 'publicado').sort(sortPosts).slice(0, 5);
  const camp = {};
  all.forEach((p) => { if (p.campaign) camp[p.campaign] = (camp[p.campaign] || 0) + 1; });
  const acts = S.db.activity.slice().sort(descBy('createdAt')).slice(0, 10);

  return `
  <div class="kpis">
    <div class="kpi wide"><small>Publicado este mes</small><b>${mPub} <span>de ${month.length} planificadas</span></b><div class="meter"><i style="width:${pct}%"></i></div></div>
    <div class="kpi ${overdue.length ? 'bad' : ''}"><small>Atrasadas</small><b>${overdue.length}</b><span>pasaron su fecha</span></div>
    <div class="kpi"><small>Próximos 7 días</small><b>${week.length}</b><span>por publicar</span></div>
    <div class="kpi"><small>En revisión / cambios</small><b>${review.length}</b><span>esperando feedback</span></div>
    <div class="kpi"><small>Estancadas</small><b>${stalled.length}</b><span>≥ 3 días sin avanzar</span></div>
  </div>

  <div class="box"><h3>Mis pendientes <small>${esc(S.me.name)}</small></h3>
    <div class="mini">${mine.length ? mine.map((p) => miniRow(p, `${p.date ? fmtShort(p.date) : 'Sin fecha'} · ${statusOf(p.status).name}`)).join('') : '<small style="color:var(--muted)">Nada pendiente. ¡Bien!</small>'}</div></div>

  ${overdue.length ? `<div class="box"><h3>Atrasadas <small>${overdue.length}</small></h3><div class="mini">${overdue.slice(0, 6).map((p) => miniRow(p, `Debía salir el ${fmtShort(p.date)} (${diffDays(t, p.date)} d)`)).join('')}</div></div>` : ''}

  <div class="box"><h3>Por estado</h3>${bars(STATUSES.map((s) => ({ label: s.name, color: s.color, n: all.filter((p) => p.status === s.id).length })))}</div>
  <div class="box"><h3>Por plataforma</h3>${bars(PLATFORMS.map((s) => ({ label: s.name, color: s.color, n: all.filter((p) => p.platforms.includes(s.id)).length })).filter((r) => r.n))}</div>
  <div class="box"><h3>Carga por persona <small>piezas abiertas</small></h3>${bars(P.map((x) => ({ label: x.name, color: x.color, n: all.filter((p) => p.assignees.includes(x.id) && p.status !== 'publicado').length })))}</div>
  ${Object.keys(camp).length ? `<div class="box"><h3>Por campaña</h3>${bars(Object.entries(camp).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([k, n]) => ({ label: k, color: 'var(--accent)', n })))}</div>` : ''}

  <div class="box"><h3>Publicaciones por semana <small>últimas 6</small></h3>
    <div class="weeks">${weeks.map((w) => `<div><b>${w.n}</b><i style="height:${(w.n / wmax) * 78}px"></i>${w.label}</div>`).join('')}</div></div>

  <div class="box"><h3>Calidad del proceso</h3>
    <div class="bars" style="gap:12px">
      <div class="bar" style="grid-template-columns:1fr auto"><span class="bl">Publicadas a tiempo</span><b>${onTime === null ? '—' : onTime + '%'}</b></div>
      <div class="bar" style="grid-template-columns:1fr auto"><span class="bl">Días promedio idea → publicada</span><b>${cycle === null ? '—' : cycle}</b></div>
      <div class="bar" style="grid-template-columns:1fr auto"><span class="bl">Rondas de cambios por pieza</span><b>${rounds}</b></div>
      <div class="bar" style="grid-template-columns:1fr auto"><span class="bl">Sin responsable</span><b>${unassigned.length}</b></div>
      <div class="bar" style="grid-template-columns:1fr auto"><span class="bl">En revisión+ sin archivo adjunto</span><b>${noFile.length}</b></div>
    </div></div>

  <div class="box"><h3>Actividad reciente</h3>
    ${acts.length ? `<ul class="feed">${acts.map((a) => `<li ${S.db.posts.some((p) => p.id === a.postId) ? `data-act="open-post" data-id="${esc(a.postId)}"` : ''}>${av(a.actor, 'md')}<div><b>${esc(person(a.actor).name)}</b> ${esc(a.text)} <b>“${esc(a.postTitle)}”</b><small>${ago(a.createdAt)}</small></div></li>`).join('')}</ul>` : '<small style="color:var(--muted)">Todavía no hay actividad.</small>'}</div>`;
}

/* ---------- render principal ---------- */
const myNotifs = () => S.db.notifications.filter((n) => n.to === S.me.id && n.inApp !== false);
function badgeCount() {
  const unread = myNotifs().filter((n) => !n.read).length;
  return unread + deadlineAlerts().length;
}
function deadlineAlerts() {
  if (!prefsOf(S.me.id).events.deadline.app) return [];
  const t = today(), lim = addDays(t, 1);
  return S.db.posts.filter((p) => recibeAvisos(S.me.id, p) && p.status !== 'publicado' && p.date && p.date <= lim).sort(sortPosts);
}
function renderHeader() {
  const n = badgeCount();
  try { if (navigator.setAppBadge) { if (n) navigator.setAppBadge(n); else navigator.clearAppBadge(); } } catch (e) { /* sin soporte */ }
  $('#top').innerHTML = `<div class="brand"><span class="logo">${marca()}</span><div><h1>${esc(CFG.APP_NAME)}</h1><small>Hola, ${esc(S.me.name)}</small></div></div>
    <div class="tools">${puedeImportar() ? `<button class="iconbtn" data-act="imp-abrir" aria-label="Sumar mensajes" title="Sumar mensajes de WhatsApp">${ic('msg')}</button>` : ''}<button class="iconbtn" data-act="bell" aria-label="Notificaciones">${ic('bell')}${n ? `<i class="dot">${n > 9 ? '9+' : n}</i>` : ''}</button>
    <button class="avbtn" data-act="me" aria-label="Ajustes">${av(S.me.id)}</button></div>`;
}
function renderToolbar() {
  const tb = $('#toolbar');
  if (S.view === 'dash') { tb.hidden = true; return; }
  tb.hidden = false;
  const fc = filterCount();
  tb.innerHTML = `<label class="search">${ic('search', 18)}<input id="q" type="search" placeholder="Buscar piezas…" value="${esc(S.f.q)}" autocomplete="off"></label>
    <button class="chip${S.f.mine ? ' on' : ''}" data-act="toggle-mine">Mías</button>
    <button class="iconbtn" data-act="filters" aria-label="Filtros">${ic('sliders')}${fc ? `<i class="fcount">${fc}</i>` : ''}</button>`;
}
function renderTabs() {
  const IC_TAB = { calendar: 'calendar', list: 'list', board: 'board', files: esAdmin() ? 'folder' : 'image', dash: 'chart' };
  const T = visibles().map(([id, l]) => [id, l, IC_TAB[id]]);
  $('#tabs').innerHTML = `<div class="in">${T.map(([id, l, i]) => `<button class="tab${S.view === id ? ' on' : ''}" data-act="nav" data-v="${id}">${ic(i, 22)}${l}</button>`).join('')}</div>`;
}
function renderMain() {
  const v = { calendar: viewCalendar, list: viewList, board: viewBoard, files: esAdmin() ? viewFiles : viewResultados, dash: viewDash }[S.view] || viewCalendar;
  const sy = window.scrollY;
  $('#main').innerHTML = v();
  $('.fab').hidden = S.view === 'files' || S.view === 'dash'; // en estas vistas estorba
  renderBanner();
  window.scrollTo(0, sy);
}
let deferredInstall = null;
window.addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); deferredInstall = e; if (S.me) renderBanner(); });
window.addEventListener('appinstalled', () => { deferredInstall = null; if (S.me) renderBanner(); });
function renderBanner() {
  const out = [];
  if (S.offline) out.push(`<div class="demo"><b>Sin conexión</b> · Se está usando una copia de prueba de este teléfono: lo que escribas aquí no le llega al equipo.</div>`);
  if (store.mode === 'local' && !S.offline) out.push(`<div class="demo"><b>Modo de prueba:</b> lo que hagas aquí solo queda en este dispositivo.</div>`);
  else if (!store.canWrite) out.push(`<div class="demo"><b>Solo lectura:</b> puedes ver y descargar todo. Para escribir, ${store.hayAcceso && store.hayAcceso() ? `<button class="lnk" data-act="acc-pedir">escribe tu clave</button>` : 'pídele la clave a Javi'}.</div>`);
  else if (store.caducada) out.push(`<div class="demo"><b>La clave dejó de servir.</b> Pídele una nueva a Javi.</div>`);
  if (S.compartidos && puedeImportar() && !(IMP && IMP.compartido)) out.push(`<div class="demo comp"><span>${ic('share', 16)} <b>${S.compartidos} reenvío${S.compartidos === 1 ? '' : 's'}</b> esperando revisión.</span><button class="btn sm" data-act="comp-revisar">Revisar</button></div>`);
  if (!isStandalone() && !localStorage.getItem('crono_hide_install')) {
    const how = deferredInstall ? `<button class="btn sm" data-act="install-app">Instalar</button>`
      : isIOS() ? 'Toca <b>Compartir</b> y luego <b>“Agregar a pantalla de inicio”</b>.' : 'Menú del navegador (⋮) → <b>“Instalar app”</b> o “Agregar a pantalla de inicio”.';
    out.push(`<div class="demo install"><span>📲 <b>Úsala como app:</b> ${how}</span><button class="iconbtn" data-act="hide-install" aria-label="Ocultar">${ic('x', 16)}</button></div>`);
  }
  $('#banner').innerHTML = out.join('');
}
function renderAll() { if (!S.me) return; asegurarVista(); renderHeader(); renderToolbar(); renderTabs(); renderMain(); }

/* ---------- hojas ---------- */
function openSheet(html, full) {
  const panel = $('#panel');
  panel.className = 'panel' + (full ? ' full' : '');
  if (html !== null) panel.innerHTML = html;
  $('#sheet').hidden = false;
  if (!sheetOpen) { sheetOpen = true; history.pushState({ sheet: 1 }, ''); document.body.style.overflow = 'hidden'; }
}
function closeSheet(fromPop) {
  if (!sheetOpen) return;
  sheetOpen = false; ED = null;
  if (IMP) { IMP.msgs.forEach((m) => { if (m.foto && m.foto.blobUrl) URL.revokeObjectURL(m.foto.blobUrl); }); IMP = null; if (S.compartidos) setTimeout(renderBanner, 0); }
  $('#sheet').hidden = true; $('#panel').innerHTML = '';
  document.body.style.overflow = '';
  if (!fromPop) history.back();
}
window.addEventListener('popstate', () => { if (sheetOpen) closeSheet(true); });
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') { if (!$('#lightbox').hidden) $('#lightbox').hidden = true; else closeSheet(); } });

function toast(msg, ms = 2600) {
  const t = $('#toast'); t.textContent = msg; t.classList.add('show');
  clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('show'), ms);
}

function openStatusMenu(id) {
  const p = S.db.posts.find((x) => x.id === id); if (!p) return;
  openSheet(`<div class="ph"><h2>Mover “${esc(p.title.slice(0, 28))}${p.title.length > 28 ? '…' : ''}”</h2><button class="iconbtn" data-act="sheet-close">${ic('x')}</button></div>
    <div class="pb">${STATUSES.map((s) => `<button class="opt${p.status === s.id ? ' on' : ''}" style="--c:${s.color}" data-act="set-status" data-id="${esc(id)}" data-v="${s.id}"><i></i>${esc(s.name)}${p.status === s.id ? '<span>actual</span>' : ''}</button>`).join('')}</div>`);
}

function openFilters() {
  const opt = (arr, key, all) => `<select class="sel" data-filter="${key}"><option value="">${all}</option>${arr.map((x) => `<option value="${x.id}"${S.f[key] === x.id ? ' selected' : ''}>${esc(x.name)}</option>`).join('')}</select>`;
  openSheet(`<div class="ph"><h2>Filtros</h2><button class="iconbtn" data-act="sheet-close">${ic('x')}</button></div>
    <div class="pb"><label class="lbl">Etiquetado/a</label>${opt(P, 'person', 'Todas las personas')}
    <label class="lbl">Plataforma</label>${opt(PLATFORMS, 'platform', 'Todas')}
    <label class="lbl">Estado</label>${opt(STATUSES, 'status', 'Todos')}
    <label class="lbl">Formato</label>${opt(FORMATS, 'format', 'Todos')}</div>
    <div class="pf"><button class="btn ghost" data-act="clear-filters">Limpiar</button><button class="btn" data-act="sheet-close">Listo</button></div>`);
}

/* ---------- notificaciones ---------- */
function openBell() {
  const mine = myNotifs().sort(descBy('createdAt')).slice(0, 60);
  const dl = deadlineAlerts(), t = today();
  const dlTxt = (p) => p.date < t ? `Atrasada ${diffDays(t, p.date)} d` : p.date === t ? 'Vence hoy' : 'Vence mañana';
  const unreadIds = mine.filter((n) => !n.read).map((n) => n.id);
  openSheet(`<div class="ph"><h2>Notificaciones</h2><button class="iconbtn" data-act="sheet-close">${ic('x')}</button></div>
    <div class="pb">
      ${dl.length ? `<div class="nh">Vencimientos</div>${dl.map((p) => `<div class="nrow alert" data-act="open-post" data-id="${esc(p.id)}"><span>${ic('alert', 22)}</span><div><b>${esc(p.title)}</b><small>${dlTxt(p)} · ${statusOf(p.status).name}</small></div></div>`).join('')}` : ''}
      <div class="nh">Avisos</div>
      ${mine.length ? mine.map((n) => `<div class="nrow${n.read ? '' : ' unread'}" data-act="open-post" data-id="${esc(n.postId)}">${av(n.from, 'md')}<div><b>${esc(person(n.from).name)}</b> ${esc(n.text)}<small>${ago(n.createdAt)}</small></div></div>`).join('') : '<div class="empty">Sin avisos todavía.<br>Aquí verás cuando te etiqueten o comenten.</div>'}
    </div>
    <div class="pf"><button class="btn ghost" data-act="me">Ajustes de avisos</button></div>`);
  // marcar como leídas después de mostrarlas
  mine.filter((n) => unreadIds.includes(n.id)).forEach((n) => { n.read = true; save('notifications', n).catch(() => {}); });
  setTimeout(renderHeader, 50);
}

/* ---------- notificaciones push (celular) ---------- */
const pushSupported = () => 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
const isStandalone = () => (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) || navigator.standalone === true;
const isIOS = () => /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
const b64ToU8 = (s) => { const b = atob((s + '='.repeat((4 - (s.length % 4)) % 4)).replace(/-/g, '+').replace(/_/g, '/')); return Uint8Array.from(b, (ch) => ch.charCodeAt(0)); };
async function subId(endpoint) {
  const h = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(endpoint));
  return 'ps_' + [...new Uint8Array(h)].slice(0, 16).map((b) => b.toString(16).padStart(2, '0')).join('');
}
async function currentSub() {
  if (!pushSupported()) return null;
  try { const reg = await navigator.serviceWorker.getRegistration(); return reg ? await reg.pushManager.getSubscription() : null; } catch (e) { return null; }
}
async function pushState() {
  if (store.mode !== 'github') return 'norepo';
  if (!store.canWrite) return 'notoken';
  if (isIOS() && !isStandalone()) return 'install';
  if (!pushSupported()) return 'unsupported';
  if (Notification.permission === 'denied') return 'blocked';
  const sub = await currentSub();
  return sub && Notification.permission === 'granted' ? 'on' : 'off';
}
async function registerSub(sub) {
  await save('push_subs', { id: await subId(sub.endpoint), person: S.me.id, sub: sub.toJSON(), ua: navigator.userAgent.slice(0, 120), createdAt: nowISO() });
}
async function enablePush() {
  const perm = await Notification.requestPermission();
  if (perm !== 'granted') { toast('No diste permiso para notificar'); return false; }
  const reg = await navigator.serviceWorker.ready;
  let sub = await reg.pushManager.getSubscription();
  if (!sub) sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: b64ToU8(CFG.PUSH.VAPID_PUBLIC_KEY) });
  await registerSub(sub);
  return true;
}
async function disablePush() {
  const sub = await currentSub(); if (!sub) return;
  await removeRow('push_subs', await subId(sub.endpoint));
  try { await sub.unsubscribe(); } catch (e) { /* ya estaba */ }
}
async function syncPushSub() { // este celular pasa a ser de la persona que está usando la app
  try {
    if (store.mode !== 'github' || !store.canWrite || !pushSupported() || Notification.permission !== 'granted') return;
    const sub = await currentSub(); if (sub) await registerSub(sub);
  } catch (e) { /* silencioso */ }
}
async function renderPushBox() {
  if (!$('#push-box')) return;
  const st = await pushState();
  const box = $('#push-box'); if (!box) return;
  const M = {
    norepo: ['Modo de prueba: sin notificaciones', 'Las notificaciones funcionan en la aplicación publicada, no en esta copia de prueba.', ''],
    notoken: ['Primero entra con tu clave', 'Escribe la clave de acceso aquí arriba y después activa las notificaciones.', ''],
    install: ['Primero instala la app', 'En iPhone: toca Compartir → “Agregar a pantalla de inicio”, ábrela desde ese ícono y vuelve a Ajustes.', ''],
    unsupported: ['Este navegador no permite notificaciones', 'Usa Chrome en Android, o Safari con la app instalada en la pantalla de inicio en iPhone.', ''],
    blocked: ['Notificaciones bloqueadas', 'Actívalas en los ajustes del celular (o del navegador) para esta app y vuelve a intentar.', ''],
    off: ['Notificaciones en este celular: apagadas', 'Actívalas para recibir avisos aunque la app esté cerrada.', '<button class="btn sm" data-act="push-on">Activar en este celular</button>'],
    on: ['Notificaciones en este celular: activas ✅', 'Te llegan los avisos que dejaste marcados en “Celular”.', '<button class="btn ghost sm" data-act="push-test">Enviarme una de prueba</button><button class="btn ghost sm" data-act="push-off">Desactivar</button>']
  }[st];
  box.innerHTML = `<b>${esc(M[0])}</b><p class="hint">${esc(M[1])}</p><div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:10px">${M[2]}</div>`;
}

function openMe() {
  const pr = prefsOf(S.me.id);
  openSheet(`<div class="ph"><h2>Ajustes</h2><button class="iconbtn" data-act="sheet-close">${ic('x')}</button></div>
    <div class="pb">
      <div class="meinfo">${av(S.me.id, 'xl')}<div><h3>${esc(S.me.name)}</h3><small style="color:var(--muted)">${store.mode === 'github' ? (store.canWrite ? 'Conectada al equipo' : 'Solo lectura') : 'Modo de prueba (solo este dispositivo)'}</small></div></div>
      ${store.mode === 'github' ? `<label class="lbl">Acceso <small>una sola vez por celular</small></label>
      <div class="pushbox" id="gh-box">${ghBoxHtml()}</div>` : ''}
      <label class="lbl">Este celular</label>
      <div class="pushbox" id="push-box"><b>Revisando…</b></div>
      <label class="lbl">Apariencia <small>solo en este dispositivo</small></label>
      <div class="pushbox">
        <small class="ap-t">Colores</small>
        <div class="chips">${TEMAS.map(([v, n]) => `<button class="chip${UI.tema === v ? ' on' : ''}" data-act="ui-tema" data-v="${v}">${esc(n)}</button>`).join('')}</div>
        <small class="ap-t">Tamaño de la letra</small>
        <div class="chips">${ESCALAS.map(([v, n]) => `<button class="chip${UI.escala === v ? ' on' : ''}" data-act="ui-escala" data-v="${v}">${esc(n)}</button>`).join('')}</div>
        <small class="ap-t">Secciones que quiero ver</small>
        <div class="chips">${SECCIONES.map(([id, n]) => `<button class="chip${UI.oculto.includes(id) ? '' : ' on'}" data-act="ui-seccion" data-v="${id}">${UI.oculto.includes(id) ? '' : ic('check', 14)}${esc(n)}</button>`).join('')}</div>
        <p class="hint">Se guarda en este teléfono; a los demás no les cambia nada.</p>
      </div>
      <label class="lbl">Avisarme cuando…<small>App · Celular</small></label>
      <div class="sgrid"><span></span><span class="h">App</span><span class="h">Celular</span>
        ${EVENTS.map((e) => `<div class="n">${esc(e.label)}<small>${esc(e.hint)}</small></div>
          <label class="sw"><input type="checkbox" data-ev="${e.id}" data-ch="app"${pr.events[e.id].app ? ' checked' : ''}><span></span></label>
          <label class="sw"><input type="checkbox" data-ev="${e.id}" data-ch="push"${pr.events[e.id].push && !e.appOnly ? ' checked' : ''}${e.appOnly ? ' disabled' : ''}><span></span></label>`).join('')}
      </div>
      <p class="hint">“App” = campana dentro de la aplicación. “Celular” = notificación del teléfono, incluso con la app cerrada.</p>
      ${puedeImportar() ? `<label class="lbl">Herramientas</label>
      <button class="btn ghost block" data-act="import-open">${ic('msg', 18)} Importar mensajes</button>
      <p class="hint">Reenvía desde WhatsApp (Compartir → Cronograma) o pega el chat: queda solo lo técnico, a nombre de quien lo dijo, con los cambios como pendientes.</p>` : ''}
      <div style="display:flex;gap:8px;margin-top:14px;flex-wrap:wrap">
        <button class="btn ghost sm" data-act="switch-user">Cambiar de persona</button>
        <button class="btn ghost sm" data-act="buscar-update">Buscar actualización</button>
      </div>
      <p class="hint">Versión <span id="ver-txt">${esc(SW_VERSION || '—')}</span>. La app se actualiza sola al abrirla; este botón la revisa al instante.</p>
    </div>`);
  renderPushBox();
  if (navigator.serviceWorker && navigator.serviceWorker.controller) navigator.serviceWorker.controller.postMessage({ type: 'version' });
}
function ghBoxHtml() {
  const admin = esAdmin();
  if (!store.canWrite) {
    return `<b>Modo solo lectura</b>
      <p class="hint">Puedes ver y descargar todo. Para escribir, entra con la clave que te mandó Javi.</p>
      <div class="addrow" style="margin-top:10px">
        <input class="field" id="acc-pass" type="password" autocomplete="current-password" placeholder="Clave de acceso">
        <button class="btn sm" data-act="acc-entrar">Entrar</button>
      </div>
      ${admin ? `<p class="hint" style="margin-top:12px">Como administradora, aquí va tu clave larga (la que creaste en tu cuenta, empieza con <code>github_pat_</code>):</p>
      <div class="addrow"><input class="field" id="gh-token" type="password" autocomplete="off" placeholder="github_pat_…"><button class="btn sm" data-act="gh-save">Guardar</button></div>` : ''}`;
  }
  const hay = store.hayAcceso && store.hayAcceso();
  return `<b>Puedes guardar cambios ✅</b>
    <p class="hint">Lo que escribas lo ve todo el equipo${store.caducada ? '' : ''}.</p>
    ${admin ? `<label class="lbl" style="margin-top:14px">Entrada del equipo</label>
      <p class="hint">Elige una clave simple, deja la entrada preparada y mándasela a Flavio y a Maca. Ellos la escriben una vez en su teléfono y listo: no tienen que configurar nada más.</p>
      <div class="addrow" style="margin-top:10px">
        <input class="field" id="acc-pass2" type="text" autocomplete="off" placeholder="${hay ? 'Nueva clave para el equipo' : 'Clave para el equipo'}">
        <button class="btn sm" data-act="acc-preparar">${hay ? 'Cambiar' : 'Preparar'}</button>
      </div>
      ${hay ? `<div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:10px"><button class="btn ghost sm" data-act="acc-quitar">Quitar la entrada del equipo</button></div>` : ''}` : ''}
    <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:12px"><button class="btn ghost sm" data-act="gh-forget">Salir de este teléfono</button></div>`;
}
async function savePrefs() {
  const events = {};
  Object.keys(DEFAULT_EV).forEach((k) => { events[k] = { app: 0, push: 0 }; });
  $$('#panel input[data-ev]').forEach((i) => { events[i.dataset.ev][i.dataset.ch] = i.checked ? 1 : 0; });
  const old = S.db.prefs.find((x) => x.id === S.me.id) || {};
  await save('prefs', Object.assign({}, old, { id: S.me.id, events, createdAt: old.createdAt || nowISO() }));
  renderHeader();
}

/* ---------- editor de pieza ---------- */
function openEditor(id, preset = {}) {
  const old = id ? S.db.posts.find((p) => p.id === id) : null;
  if (id && !old) { toast('Esa pieza ya no existe'); return; }
  const d = old ? clone(old) : {
    id: uid(), title: '', caption: '', notes: '', hashtags: '', campaign: '', date: preset.date || (S.view === 'calendar' ? S.sel : today()), time: '',
    platforms: [], format: 'post', status: 'idea', assignees: [S.me.id], priority: 'normal', links: [], files: [], checklist: []
  };
  ED = { old, d, comment: '', newLink: { label: '', url: '' }, newCheck: '', uploading: 0 };
  openSheet('', true);
  renderEditor();
}
function syncDraft() {
  if (!ED || !$('#e-title')) return;
  const g = (i) => document.getElementById(i), d = ED.d;
  d.title = g('e-title').value; d.date = g('e-date').value; d.time = g('e-time').value; d.format = g('e-format').value;
  d.caption = g('e-caption').value; d.hashtags = g('e-tags').value; d.notes = g('e-notes').value; d.campaign = g('e-camp').value;
  ED.comment = g('e-comment') ? g('e-comment').value : '';
  ED.newLink = { label: g('e-llabel').value, url: g('e-lurl').value };
  ED.newCheck = g('e-newck').value;
  $$('#pb input.ckt').forEach((i) => { const it = d.checklist.find((c) => c.id === i.dataset.ck); if (it) it.text = i.value; });
}
const mentionHtml = (t) => esc(t).replace(new RegExp('@(' + P.map((x) => x.name).join('|') + ')', 'gi'), '<span class="mention">@$1</span>').replace(/\n/g, '<br>');
function normUrl(u) {
  u = (u || '').trim(); if (!u) return '';
  if (!/^[a-z][a-z0-9+.-]*:/i.test(u)) u = 'https://' + u;
  return /^https?:\/\//i.test(u) ? u : '';
}

function renderEditor() {
  if (!ED || !sheetOpen) return;
  const { d, old } = ED, sc = $('#pb') ? $('#pb').scrollTop : 0;
  const comments = old ? S.db.comments.filter((c) => c.postId === d.id).sort((a, b) => (a.createdAt < b.createdAt ? -1 : 1)) : [];
  const acts = old ? S.db.activity.filter((a) => a.postId === d.id).sort(descBy('createdAt')).slice(0, 15) : [];
  const camps = [...new Set(S.db.posts.map((p) => p.campaign).filter(Boolean))];
  const st = statusOf(d.status);
  const html = `
  <div class="ph"><button class="iconbtn" data-act="sheet-close" aria-label="Cerrar">${ic('x')}</button><h2>${old ? 'Editar pieza' : 'Nueva pieza'}</h2>
    ${old ? `<div class="phacts">${(() => { const on = recibeAvisos(S.me.id, old); return `<button class="iconbtn avisos${on ? ' on' : ''}" data-act="ed-avisos" aria-label="${on ? 'Silenciar avisos de esta pieza' : 'Activar avisos de esta pieza'}" title="${on ? 'Recibes avisos de esta pieza' : 'Avisos de esta pieza apagados'}">${ic(on ? 'bell' : 'bellOff')}</button>`; })()}<button class="iconbtn danger" data-act="ed-delete" aria-label="Eliminar">${ic('trash')}</button></div>` : '<span style="width:40px"></span>'}</div>
  <div class="pb" id="pb">
    <input id="e-title" class="title-in" placeholder="Título de la pieza" value="${esc(d.title)}" autocomplete="off">

    <label class="lbl">Estado</label>
    <div class="chips scroll">${STATUSES.map((s) => `<button class="chip${d.status === s.id ? ' on' : ''}" style="--c:${s.color}" data-act="ed-status" data-v="${s.id}">${esc(s.name)}</button>`).join('')}</div>
    ${old ? `<div class="stage" style="--c:${st.color}"><i></i>${esc(statusOf(old.status).name)} desde ${ago(old.statusChangedAt || old.createdAt)}${isStalled(old) ? ' · <b class="stuck">estancada</b>' : ''}</div>` : ''}

    <label class="lbl">Cuándo se publica</label>
    <div class="row2"><input class="field" id="e-date" type="date" value="${esc(d.date || '')}"><input class="field" id="e-time" type="time" value="${esc(d.time || '')}"></div>

    <label class="lbl">Plataformas</label>
    <div class="chips">${PLATFORMS.map((p) => `<button class="chip${d.platforms.includes(p.id) ? ' on' : ''}" style="--c:${p.color}" data-act="ed-plat" data-v="${p.id}">${esc(p.name)}</button>`).join('')}</div>

    <div class="row2"><div><label class="lbl">Formato</label><select class="sel" id="e-format">${FORMATS.map((f) => `<option value="${f.id}"${d.format === f.id ? ' selected' : ''}>${esc(f.name)}</option>`).join('')}</select></div>
      <div><label class="lbl">Prioridad</label><div class="chips"><button class="chip${d.priority === 'alta' ? ' on' : ''}" style="--c:#E5484D" data-act="ed-prio">${d.priority === 'alta' ? 'Alta' : 'Normal'}</button></div></div></div>

    <label class="lbl">Etiquetar <small>reciben un aviso al guardar</small></label>
    <div class="chips">${P.map((x) => `<button class="person${d.assignees.includes(x.id) ? ' on' : ''}" style="--c:${x.color}" data-act="ed-person" data-v="${x.id}">${av(x.id)}${esc(x.name)}</button>`).join('')}</div>

    <label class="lbl">Copy / texto <small id="e-count">${d.caption.length} caracteres</small></label>
    <textarea class="area" id="e-caption" placeholder="Texto de la publicación…">${esc(d.caption)}</textarea>
    <label class="lbl">Hashtags</label><input class="field" id="e-tags" placeholder="#marca #campaña" value="${esc(d.hashtags)}">
    <label class="lbl">Campaña / pilar</label><input class="field" id="e-camp" list="camps" placeholder="Ej. Lanzamiento, Educativo…" value="${esc(d.campaign || '')}">
    <datalist id="camps">${camps.map((c) => `<option value="${esc(c)}">`).join('')}</datalist>

    ${!esAdmin() ? (d.files.length ? `<label class="lbl">La entrega</label>${carruselHtml(pieceFiles(d, true), 'ed-' + d.id)}` : '') : `
    <label class="lbl">Archivos <small>imágenes, videos, PDF</small></label>
    <div class="files">${d.files.map((f) => `<div class="file" data-act="ed-view" data-id="${esc(f.id)}">${isImg(f)
      ? `<img loading="lazy" alt="" src="${esc(fileSrc(f))}">`
      : `<span class="fileico">${ic('paperclip', 24)}<span>${esc(f.name)}</span></span>`}
      ${(f.version || splitName(f.name).version) > 1 ? `<i class="vtag">v${f.version || splitName(f.name).version}</i>` : ''}
      <button class="x" data-act="ed-rmfile" data-id="${esc(f.id)}" aria-label="Quitar">${ic('x', 14)}</button></div>`).join('')}
      <label class="addfile">${ic('plus', 24)}${ED.uploading ? 'Subiendo…' : 'Subir'}<input id="e-file" type="file" multiple accept="image/*,video/*,application/pdf,.psd,.ai,.fig,.zip"></label></div>`}

    <label class="lbl">Enlaces <small>Canva, Drive, Figma…</small></label>
    ${d.links.map((l) => `<div class="linkrow">${ic('link', 18)}<a href="${esc(l.url)}" target="_blank" rel="noopener">${esc(l.label || l.url)}</a><button data-act="ed-rmlink" data-id="${esc(l.id)}" aria-label="Quitar">${ic('x', 16)}</button></div>`).join('')}
    <div class="addrow"><input class="field" id="e-llabel" placeholder="Nombre" value="${esc(ED.newLink.label)}" style="flex:1"><input class="field" id="e-lurl" inputmode="url" placeholder="https://…" value="${esc(ED.newLink.url)}" style="flex:2"><button class="btn sm" data-act="ed-addlink">${ic('plus', 16)}</button></div>

    <label class="lbl">Checklist <small>${d.checklist.filter((c) => c.done).length}/${d.checklist.length}</small></label>
    ${d.checklist.map((c) => `<div class="ck"><label class="cb2"><input type="checkbox" data-act="ed-check" data-ck="${esc(c.id)}"${c.done ? ' checked' : ''}><span>${ic('check', 16)}</span></label><input class="ckt" data-ck="${esc(c.id)}" value="${esc(c.text)}"><button data-act="ed-rmcheck" data-id="${esc(c.id)}" aria-label="Quitar">${ic('x', 16)}</button></div>`).join('')}
    <div class="addrow"><input class="field" id="e-newck" placeholder="Ej. Revisar ortografía" value="${esc(ED.newCheck)}"><button class="btn sm" data-act="ed-addcheck">${ic('plus', 16)}</button></div>

    <label class="lbl">Notas internas</label><textarea class="area" id="e-notes" style="min-height:80px" placeholder="Referencias, indicaciones…">${esc(d.notes)}</textarea>

    ${old ? `
    <label class="lbl">Seguimiento</label>
    <div class="track">
      <div><span>Creada</span><b>${esc(person(old.createdBy).name)} · ${ago(old.createdAt)}</b></div>
      <div><span>Última edición</span><b>${esc(person(old.updatedBy).name)} · ${ago(old.updatedAt)}</b></div>
      <div><span>Rondas de cambios</span><b>${old.revisions || 0}</b></div>
      <div><span>Publicación</span><b>${old.publishedAt ? (old.date && ymd(new Date(old.publishedAt)) > old.date ? 'Tarde · ' : 'A tiempo · ') + fmtShort(ymd(new Date(old.publishedAt))) : 'Pendiente'}</b></div>
    </div>
    <details class="hist"><summary>Historial de cambios (${acts.length})</summary><ul>${acts.map((a) => `<li>${av(a.actor, 'sm')} <b>${esc(person(a.actor).name)}</b> ${esc(a.text)}<br><small>${ago(a.createdAt)}</small></li>`).join('') || '<li><small>Sin movimientos</small></li>'}</ul></details>

    <label class="lbl">Comentarios <small>${comments.length}</small></label>
    ${comments.map((c) => {
      const fotos = (c.fileIds || []).map((fid) => d.files.find((f) => f.id === fid)).filter(Boolean);
      return `<div class="cm">${av(c.author, 'md')}<div class="bubble"><small><b>${esc(person(c.author).name)}</b> · ${ago(c.createdAt)}</small>${mentionHtml(c.text)}
        ${fotos.length ? `<div class="cmfotos">${fotos.map((f) => `<img loading="lazy" alt="" src="${esc(fileSrc(f))}" data-act="ed-view" data-id="${esc(f.id)}">`).join('')}</div>` : ''}</div></div>`;
    }).join('')}
    <div class="compose"><textarea class="area" id="e-comment" style="min-height:70px" placeholder="Escribe un comentario…">${esc(ED.comment)}</textarea>
      <div class="chips">${P.filter((x) => x.id !== S.me.id).map((x) => `<button class="chip" data-act="ed-mention" data-v="${esc(x.name)}">@${esc(x.name)}</button>`).join('')}<button class="btn sm" data-act="ed-comment" style="margin-left:auto">Comentar</button></div></div>
    ` : '<p class="hint" style="margin-top:20px">Guarda la pieza para poder comentar y ver el historial.</p>'}
  </div>
  <div class="pf">${old && esAdmin() ? `<button class="btn ghost" data-act="pr-open" data-id="${esc(d.id)}" aria-label="Prompt para la IA">${ic('copy', 18)}</button>` : ''}
    <button class="btn block" data-act="ed-save">${old ? 'Guardar cambios' : 'Crear pieza'}</button></div>`;
  $('#panel').innerHTML = html;
  if ($('#pb')) $('#pb').scrollTop = sc;
}

async function saveEditor() {
  if (!ED) return;
  if (!requireWrite()) return;
  if (ED.uploading) { toast('Espera a que terminen de subirse los archivos'); return; }
  syncDraft();
  const d = ED.d;
  if (!d.title.trim()) { toast('Ponle un título a la pieza'); const t = $('#e-title'); if (t) t.focus(); return; }
  d.title = d.title.trim();
  const nu = normUrl(ED.newLink.url);
  if (nu) d.links.push({ id: uid(), label: ED.newLink.label.trim(), url: nu });
  if (ED.newCheck.trim()) d.checklist.push({ id: uid(), text: ED.newCheck.trim(), done: false });
  const btn = $('[data-act="ed-save"]'); if (btn) btn.disabled = true;
  const wasNew = !ED.old;
  try { await commitPost(ED.old, d); } catch (e) { if (btn) btn.disabled = false; return; }
  closeSheet(); renderAll();
  toast(wasNew ? 'Pieza creada' : 'Cambios guardados');
}

async function addComment() {
  if (!requireWrite()) return;
  syncDraft();
  const text = (ED.comment || '').trim(); if (!text) return;
  const p = ED.old; if (!p) return;
  await save('comments', { id: uid(), postId: p.id, author: S.me.id, text, createdAt: nowISO() });
  const ments = P.filter((x) => new RegExp('@' + x.name + '(?![\\p{L}])', 'iu').test(text)).map((x) => x.id);
  await log(p, 'comment', 'comentó');
  const snippet = text.length > 80 ? text.slice(0, 80) + '…' : text;
  await notify('mention', p, ments, `te mencionó en “${p.title}”: ${snippet}`);
  await notify('comment', p, p.assignees.filter((x) => !ments.includes(x)), `comentó en “${p.title}”: ${snippet}`);
  ED.comment = '';
  renderEditor();
}

async function onFiles(input) {
  const ed = ED; if (!ed) return;
  syncDraft();
  const files = [...input.files]; input.value = '';
  if (!files.length) return;
  ed.uploading += files.length; renderEditor();
  toast(`Subiendo ${files.length} archivo${files.length > 1 ? 's' : ''}…`, 10000);
  for (const f of files) {
    try {
      const info = splitName(f.name);
      const previas = (ed.d.files || []).filter((x) => (x.base || splitName(x.name).base) === info.base);
      const version = info.version || (previas.length ? Math.max(...previas.map((x) => x.version || 1)) + 1 : 1);
      const nombre = `${info.base}-v${version}${info.ext ? '.' + info.ext : ''}`;
      const r = await store.upload(f, { dir: projectName(ed.d), name: nombre });
      ed.d.files.push(Object.assign({ id: uid(), by: S.me.id, at: nowISO(), base: info.base, version }, r));
    }
    catch (e) { console.error(e); toast(`No se pudo subir ${f.name}: ${e.message || e}`, 4000); }
    ed.uploading -= 1;
  }
  if (ED === ed) renderEditor();
  toast('Archivos listos');
}


/* ---------- prompts para la IA (solo quien administra) ---------- */
const TIPOS = [
  ['editar-imagen', 'Editar fotos', 'image'],
  ['generar-imagen', 'Generar imagen', 'plus'],
  ['codigo', 'Código / web', 'board'],
  ['texto', 'Texto y copy', 'msg'],
  ['diseno', 'Diseño de láminas', 'folder']
];
// Qué le estamos pidiendo a la pieza: se adivina y después se puede cambiar a mano
function tipoTarea(post) {
  const files = pieceFiles(post, true);
  const hayImg = files.some(isImg);
  const txt = (pendientesDe(post).join(' ') + ' ' + post.title + ' ' + (post.notes || '') + ' ' + (post.caption || '')).toLowerCase();
  const web = post.format === 'web' || post.platforms.includes('web') ||
    /cotizador|sitio web|p[áa]gina|formulario|bot[óo]n|enlace|link|c[óo]digo|wix|men[úu]|landing/.test(txt);
  if (web) return 'codigo';
  if (hayImg && /sacar|saquemos|quita|limpia|borra|elimina|retoca|recorta|sombra|luz|color|fondo|cielo|escombro|pl[áa]stico|camioneta|reflejo|brillo/.test(txt)) return 'editar-imagen';
  if (!files.length && /genera|crear|ilustra|render|imagen de|mockup/.test(txt)) return 'generar-imagen';
  if (/copy|texto|t[íi]tulo|titular|hashtag|redacta|descripci[óo]n|caption|ortograf/.test(txt)) return 'texto';
  if (hayImg) return 'editar-imagen';
  if (['carrusel', 'banner', 'grafica', 'pdf'].includes(post.format)) return 'diseno';
  return 'texto';
}
const pendientesDe = (post) => (post.checklist || []).filter((c) => !c.done).map((c) => c.text);
function feedbackDe(post) {
  return S.db.comments.filter((c) => c.postId === post.id && c.author !== S.me.id)
    .sort((a, b) => String(a.createdAt).localeCompare(String(b.createdAt)))
    .slice(-8).map((c) => `${person(c.author).name}: ${c.text.replace(/\s+/g, ' ').trim()}`);
}
function promptDe(post, tipo) {
  const files = pieceFiles(post, true);
  const imgs = files.filter(isImg);
  const pend = pendientesDe(post);
  const fb = feedbackDe(post);
  const marca = CFG.MARCA || '';
  const cambios = (pend.length ? pend : fb).map((t, i) => `${i + 1}. ${t}`).join('\n') || '(todavía no hay cambios anotados: escríbelos aquí)';
  const ficha = [
    `Pieza: ${post.title}`,
    post.campaign ? `Proyecto: ${post.campaign}` : '',
    `Formato: ${formatName(post.format)}${post.platforms.length ? ' · ' + post.platforms.map((x) => platOf(x).name).join(', ') : ''}`,
    post.date ? `Se publica: ${fmtLong(post.date)}` : ''
  ].filter(Boolean).join('\n');

  const base = `CONTEXTO DE MARCA\n${marca}\n\nFICHA\n${ficha}\n\nCAMBIOS PEDIDOS\n${cambios}`;
  const extra = fb.length && pend.length ? `\n\nCOMENTARIOS DEL EQUIPO (por si ayudan)\n${fb.map((t) => '- ' + t).join('\n')}` : '';

  const plantillas = {
    'editar-imagen': `Actúa como retocador fotográfico profesional.
Te adjunto ${imgs.length > 1 ? imgs.length + ' fotos' : 'una foto'} de un proyecto real.
${imgs.length > 1 ? 'Edita cada una aplicando' : 'Edítala aplicando'} SOLO los cambios pedidos, sin alterar nada más.

${base}${extra}

REGLAS
- Respeta el encuadre, la perspectiva y la proporción original.
- Conserva la luz natural y los colores reales; nada de filtros ni saturación extra.
- Si hay que quitar un objeto, rellena el fondo de forma realista y coherente.
- No agregues texto, logos ni marcas de agua.
- Devuélveme la imagen en la mayor resolución posible.`,

    'generar-imagen': `Genera una imagen para una publicación de Neorigen.

${base}${extra}

CÓMO DEBE VERSE
- Fotografía realista, no ilustración; luz natural, hora dorada o día nublado suave.
- Madera a la vista, ventanales grandes, integración con el paisaje chileno.
- Sin texto, sin logos, sin personas reconocibles.
- Proporción ${post.format === 'reel' || post.format === 'story' ? '9:16 (vertical para historias)' : post.platforms.includes('instagram') ? '4:5 (vertical de Instagram)' : '16:9'}.`,

    codigo: `Actúa como desarrollador web. Vas a modificar una página ya hecha.

${base}${extra}

CÓMO QUIERO LA RESPUESTA
- Primero, en dos líneas, qué vas a cambiar y dónde.
- Después el código completo de cada archivo modificado, listo para reemplazar (no fragmentos sueltos).
- Mantén el estilo, los nombres y la estructura que ya existen.
- Que funcione igual en celular y en computador.`,

    texto: `Actúa como redactor de redes sociales de Neorigen.

${base}${extra}

CÓMO QUIERO EL TEXTO
- Español de Chile, cercano y sobrio. Nada de signos de exclamación de más ni palabras infladas.
- Primera línea con gancho, de una sola frase.
- ${post.platforms.includes('instagram') ? 'Máximo 150 palabras, con saltos de línea para que se lea fácil.' : 'Breve y directo.'}
- Cierra con una pregunta al lector y luego los hashtags (máximo 6, al final).
- Dame 3 versiones para elegir.`,

    diseno: `Actúa como diseñador gráfico. Vas a ajustar las láminas de ${formatName(post.format).toLowerCase()} que te adjunto.

${base}${extra}

REGLAS
- Respeta la grilla, la tipografía y la paleta de la marca.
- Los textos tienen que leerse en un celular: nada de letra chica.
- Mantén el orden de las láminas, salvo que el cambio diga otra cosa.
- Entrega cada lámina por separado, en la misma proporción del original.`
  };
  return plantillas[tipo] || plantillas.texto;
}

let PR = null;
function openPrompt(postId, tipo) {
  const post = S.db.posts.find((p) => p.id === postId);
  if (!post) { toast('Esa pieza ya no está'); return; }
  const t = tipo || tipoTarea(post);
  PR = { postId, tipo: t, texto: promptDe(post, t) };
  renderPrompt();
}
function renderPrompt() {
  const post = S.db.posts.find((p) => p.id === PR.postId);
  const imgs = pieceFiles(post, true).filter((f) => isImg(f) || isVideo(f));
  const files = pieceFiles(post, true);
  openSheet(`<div class="ph"><button class="iconbtn" data-act="sheet-close">${ic('x')}</button><h2>Prompt para la IA</h2><span style="width:40px"></span></div>
    <div class="pb">
      <p class="hint">Hecho con los pendientes y los comentarios de “${esc(post.title)}”. Revísalo y pégalo en Gemini, ChatGPT o Claude.</p>
      <label class="lbl">Qué le vamos a pedir</label>
      <div class="chips scroll">${TIPOS.map(([id, n, i]) => `<button class="chip${PR.tipo === id ? ' on' : ''}" data-act="pr-tipo" data-v="${id}">${ic(i, 15)}${esc(n)}</button>`).join('')}</div>
      <label class="lbl">Prompt <small>se puede editar</small></label>
      <textarea class="area" id="pr-texto" style="min-height:260px;font-size:0.82rem">${esc(PR.texto)}</textarea>
      ${imgs.length ? `<label class="lbl">Fotos de la entrega <small>versión final</small></label>
      <div class="prfotos">${imgs.map((f, i) => `<button class="prfoto" data-act="pr-copiar-foto" data-f="${esc(f.id)}">
        <img loading="lazy" alt="" src="${esc(fileSrc(f))}"><span>${ic('copy', 15)} Foto ${i + 1} + prompt</span></button>`).join('')}</div>
      <p class="hint">Copia la foto y el prompt juntos: en Gemini pegas una sola vez con Ctrl+V (o mantén apretado → Pegar).</p>` : ''}
    </div>
    <div class="pf">
      ${files.length ? `<button class="btn ghost" data-act="pr-zip">${ic('download', 17)} ZIP</button>` : ''}
      <button class="btn" data-act="pr-copiar">${ic('copy', 17)} Copiar prompt</button>
    </div>`, true);
}

async function copiarTexto(txt) {
  try { await navigator.clipboard.writeText(txt); return true; }
  catch (e) {
    const ta = document.createElement('textarea');
    ta.value = txt; ta.style.position = 'fixed'; ta.style.opacity = '0';
    document.body.appendChild(ta); ta.select();
    let ok = false;
    try { ok = document.execCommand('copy'); } catch (e2) { ok = false; }
    ta.remove();
    return ok;
  }
}
// Convierte lo que sea a PNG, que es lo que acepta el portapapeles
async function comoPng(blob) {
  const bmp = await createImageBitmap(blob);
  const c = document.createElement('canvas');
  c.width = bmp.width; c.height = bmp.height;
  c.getContext('2d').drawImage(bmp, 0, 0);
  return new Promise((res) => c.toBlob(res, 'image/png'));
}
async function copiarFotoYPrompt(fileId) {
  const hit = findFile(fileId); if (!hit) return;
  const texto = ($('#pr-texto') || {}).value || PR.texto;
  const png = (async () => comoPng(await fetchFile(hit.file)))();
  try {
    await navigator.clipboard.write([new ClipboardItem({
      'image/png': png,
      'text/plain': new Blob([texto], { type: 'text/plain' })
    })]);
    toast('Foto y prompt copiados: pégalos en la IA', 3800);
  } catch (e) {
    try {
      await navigator.clipboard.write([new ClipboardItem({ 'image/png': await png })]);
      toast('Foto copiada. El prompt va aparte con “Copiar prompt”.', 4200);
    } catch (e2) {
      const ok = await copiarTexto(texto);
      toast(ok ? 'Este navegador no deja copiar la foto: copié solo el prompt. Descarga la foto y adjúntala.' : 'No se pudo copiar aquí', 5200);
    }
  }
}
// ZIP de la pieza con el prompt adentro
async function zipConPrompt(post) {
  const texto = ($('#pr-texto') || {}).value || promptDe(post, tipoTarea(post));
  const entradas = entriesOfPost(post, true);
  entradas.push({ name: 'PROMPT.txt', file: { name: 'PROMPT.txt', url: 'data:texto', blob: new Blob([texto], { type: 'text/plain' }) } });
  await downloadZip(entradas, slugify(post.title, 'entrega'));
}

/* ---------- entrada con contraseña ---------- */
const esAdmin = () => (CFG.ADMIN_PEOPLE || []).includes(S.me.id);
function pedirContrasena() {
  openSheet(`<div class="ph"><h2>Clave de acceso</h2><button class="iconbtn" data-act="sheet-close">${ic('x')}</button></div>
    <div class="pb">
      <div class="pushbox">
        <b>Escribe la clave que te mandó Javi</b>
        <p class="hint">Es una sola vez en este teléfono: después entras directo.</p>
        <div class="addrow" style="margin-top:10px">
          <input class="field" id="acc-pass" type="password" autocomplete="current-password" placeholder="Clave">
          <button class="btn sm" data-act="acc-entrar">Entrar</button>
        </div>
      </div>
      <p class="hint">Si no la tienes a mano, puedes mirar y descargar todo igual; solo no vas a poder escribir.</p>
    </div>`);
  setTimeout(() => { const i = $('#acc-pass'); if (i) i.focus(); }, 120);
}

/* ---------- importar conversaciones (pegadas o reenviadas desde WhatsApp) ---------- */
let IMP = null;
const W = () => window.WhatsApp;
const puedeImportar = () => (CFG.IMPORT_PEOPLE || []).includes(S.me.id) && store.canWrite;
const hashCorto = (t) => { let h = 0; for (let i = 0; i < t.length; i++) { h = (h * 31 + t.charCodeAt(i)) | 0; } return Math.abs(h).toString(36); };
const impId = (m) => 'wa_' + m.at.slice(0, 16) + '_' + (m.persona || m.autor || 'x').toLowerCase().slice(0, 6) + '_' + hashCorto((m.original || m.texto || '').slice(0, 60));
const idsImportados = (postId) => new Set(S.db.comments.filter((c) => c.postId === postId).map((c) => c.impId || c.waId).filter(Boolean));
const URLS = /https?:\/\/[^\s<>"']+/gi;

// Puntaje de cada pieza según cuánto se parece a lo que dicen los mensajes.
// Las palabras que aparecen en muchas piezas (foto, carrusel, obra…) pesan poco; las raras, mucho.
function candidatas(msgs) {
  const texto = msgs.map((m) => (m.original || m.texto || '') + ' ' + ((m.adjunto && m.adjunto.name) || '')).join(' ');
  const dichas = new Set(W().palabras(texto));
  if (!dichas.size) return [];
  const N = S.db.posts.length || 1, df = {};
  const bolsa = S.db.posts.map((p) => {
    const tit = W().palabras(p.title);
    const resto = W().palabras(`${p.campaign || ''} ${p.caption || ''} ${(p.files || []).map((f) => f.name).join(' ')}`);
    const extra = W().palabras(`${p.notes || ''} ${(p.checklist || []).map((c) => c.text).join(' ')}`);
    new Set(tit.concat(resto)).forEach((w) => { df[w] = (df[w] || 0) + 1; });
    return { p, tit, resto, extra };
  });
  const peso = (w) => Math.log(1 + N / (df[w] || 1));
  const ahora = Date.now();
  // Si nombran un formato (reel, carrusel…), las piezas de otro formato bajan mucho; si dicen "nuevo/otro", todo baja
  const FMT = [[/\breels?\b/i, ['reel', 'video']], [/\bcarrusel/i, ['carrusel']], [/\b(stor(y|ies)|historias?)\b/i, ['story']], [/\bvideos? largo/i, ['video']],
    [/\b(post|publicaci[óo]n)\b/i, ['post', 'carrusel']], [/\b(p[áa]gina|sitio|web|formulario|cotizador)\b/i, ['web']], [/\b(carpeta|impres|imprenta|folleto)/i, ['grafica', 'pdf']], [/\bbanner/i, ['banner']]];
  const formatos = new Set(FMT.filter(([re]) => re.test(texto)).flatMap(([, f]) => f));
  const pideNueva = /\b(nuev[oa]s?|otr[oa]s?)\s+(reel|carrusel|post|story|historia|video|pieza|publicaci[óo]n|l[áa]mina|banner)/i.test(texto) ||
    /\b(reel|carrusel|post|story|video|pieza|publicaci[óo]n)\s+(?:\S+\s+){0,4}nuev[oa]\b/i.test(texto);
  const orden = W().palabras(texto);
  const pares = new Set(orden.slice(1).map((w, i) => orden[i] + ' ' + w));
  const lista = bolsa.map(({ p, tit, resto, extra }) => {
    // Título: cuenta qué parte del título se nombró (y si se nombró seguido, mejor)
    const total = tit.reduce((a, w) => a + peso(w), 0) || 1;
    const dicho = tit.filter((w) => dichas.has(w)).reduce((a, w) => a + peso(w), 0);
    let pts = 2 * dicho * (0.3 + dicho / total);
    tit.slice(1).forEach((w, i) => { if (pares.has(tit[i] + ' ' + w)) pts += 2 * (peso(w) + peso(tit[i])); });
    resto.forEach((w) => { if (dichas.has(w)) pts += 0.6 * peso(w); });
    extra.forEach((w) => { if (dichas.has(w)) pts += 0.3 * peso(w); });
    if (pts && formatos.size && !formatos.has(p.format)) pts *= 0.35;
    if (pts && pideNueva) pts *= 0.4;
    if (pts && ['diseno', 'revision', 'cambios', 'aprobado', 'idea'].includes(p.status)) pts *= 1.25; // lo que está en curso
    if (pts && ahora - new Date(p.updatedAt || 0).getTime() < 7 * 864e5) pts *= 1.1;                // y lo reciente
    return { post: p, pts };
  }).filter((x) => x.pts > 0).sort((a, b) => b.pts - a.pts);
  lista.nueva = pideNueva;
  return lista;
}

function openImport() {
  IMP = { paso: 1, texto: '', msgs: [], tramos: [], sinMapear: {}, compartido: false };
  openSheet('', true);
  renderImport();
}

function leerConversacion() {
  const t = ($('#imp-texto') || {}).value || '';
  if (t.trim().length < 20) { toast('Pega primero la conversación'); return; }
  const msgs = W().parse(t);
  if (!msgs.length) { toast('No reconocí mensajes en ese texto', 4000); return; }
  IMP.texto = t;
  prepararImport(msgs);
  renderImport();
}

// Deja los mensajes listos: los filtra, los dice de forma objetiva y adivina a qué pieza van
function prepararImport(msgs) {
  IMP.sinMapear = W().mapearAutores(msgs.filter((m) => !m.manual), P, CFG.WHATSAPP_ALIAS || {});
  msgs.forEach((m) => {
    if (m.manual && !m.persona) m.persona = autorPorDefecto();
    filtrarMensaje(m);
    m.usar = !m.sistema && (!m.charla || !!m.foto || !!m.audio || (m.adjunto && m.adjunto.kind === 'imagen'));
    if (m.foto === undefined) m.foto = null;
  });
  IMP.msgs = msgs;
  // Tramos de conversación: cada uno puede ser sobre una pieza distinta
  const n = W().tramos(msgs, 5);
  let tramos = [];
  for (let k = 0; k < n; k++) {
    const del = msgs.filter((m) => m.tramo === k && !m.sistema);
    const c = candidatas(del);
    const mejor = c[0] && c[0].pts >= 4 && (!c[1] || c[0].pts >= c[1].pts * 1.25) ? c[0].post : null;
    tramos.push({ destino: mejor ? mejor.id : 'nuevo', seguro: !!mejor, cands: c.slice(0, 3).map((x) => x.post.id), nueva: !!c.nueva, titulo: '', proyecto: '' });
  }
  // Tramos seguidos que hablan de lo mismo se juntan; uno sin pista se suma al anterior
  const mapa = [];
  tramos.forEach((t, k) => {
    const prev = mapa.length ? tramos[mapa[mapa.length - 1]] : null;
    // un tramo sin ninguna pista (p. ej. "y la foto 3 también") sigue al anterior; uno que habla de otra cosa, no
    const sinPista = !t.seguro && !t.nueva && !t.cands.length;
    if (prev && ((t.destino === prev.destino && t.destino !== 'nuevo') || (sinPista && prev.seguro && !IMP.compartido))) mapa.push(mapa[mapa.length - 1]);
    else mapa.push(k);
  });
  msgs.forEach((m) => { m.tramo = mapa[m.tramo]; });
  const usados = [...new Set(mapa)];
  IMP.tramos = tramos.map((t, k) => (usados.includes(k) ? t : null));
  // Si todo es una sola conversación sin pista, se sugiere la pieza más parecida igual
  IMP.tramos.forEach((t, k) => {
    if (!t || t.destino !== 'nuevo') return;
    const del = msgs.filter((m) => m.tramo === k && !m.sistema);
    const otros = [...new Set(del.filter((m) => m.persona && m.persona !== S.me.id).map((m) => person(m.persona).name))];
    t.titulo = (del.find((m) => m.texto) || {}).texto ? del.find((m) => m.texto).texto.split(/[.?]/)[0].slice(0, 60) : `Pedido de ${otros.join(' y ') || 'el equipo'}`;
    t.proyecto = '';
  });
  marcarRepetidos();
  IMP.tramos.forEach((t, k) => { if (t) sugerirEstado(t, k); });
  IMP.paso = 2;
}

// Qué estado debería tener la pieza según lo último que se dijo (en orden: el último hecho manda)
function sugerirEstado(t, k) {
  const del = IMP.msgs.filter((m) => m.tramo === k && m.usar && !m.sistema);
  let est = null, at = null, motivo = '';
  del.forEach((m) => {
    const quien = person(m.persona || S.me.id).name, otro = m.persona && m.persona !== S.me.id;
    if (W().publica(m.original || m.texto)) { est = 'publicado'; at = m.at; motivo = `${quien} dijo que quedó publicado`; }
    else if (otro && m.pide) { est = 'cambios'; at = m.at; motivo = `${quien} pidió cambios`; }
    else if (otro && m.aprueba) { est = 'aprobado'; at = m.at; motivo = `${quien} lo aprobó`; }
    else if (!otro && (m.foto || m.adjunto) && est !== 'aprobado' && est !== 'publicado') { est = 'revision'; at = m.at; motivo = 'Mandaste una versión para revisar'; }
  });
  const post = t.destino !== 'nuevo' ? S.db.posts.find((p) => p.id === t.destino) : null;
  if (post) {
    // Solo si lo conversado es más nuevo que el último cambio de estado (un fragmento viejo no la hace retroceder)
    const ultimo = post.statusChangedAt || post.updatedAt || post.createdAt || '';
    if (!est || est === post.status || (at && ultimo && at <= ultimo)) { est = ''; motivo = ''; }
    else if (post.status === 'publicado' && est !== 'publicado') {
      // Lo publicado no retrocede solo: suele ser una pieza nueva parecida
      motivo = `${motivo}, pero “${post.title}” ya está publicada. Si es otra pieza, elige “Crear una pieza nueva”; si de verdad hay que corregirla, elige el estado a mano`;
      est = '';
    }
  } else if (!est || est === 'cambios') { est = 'diseno'; motivo = est === 'cambios' ? 'Es un pedido nuevo: queda en diseño' : ''; }
  t.estado = est; t.estadoAt = at || nowISO(); t.motivo = motivo;
}

// Texto objetivo, si pide un cambio y si es pura conversación
function filtrarMensaje(m) {
  if (m.original === undefined) m.original = m.texto || '';
  const o = W().objetivar(m.original);
  m.texto = o.texto;
  m.charla = o.charla;
  m.aprueba = !!(m.aprueba || o.aprueba);
  // lo que escribe Javi describe su propio trabajo: no cuenta como cambio pedido
  m.pide = W().pideCambio(m.original) && !o.charla && !(o.aprueba && !W().pideCambio(o.texto)) && m.persona !== S.me.id;
  m.pendiente = m.pide && m.persona !== S.me.id;
}

// ¿Ya está en la pieza? (mismo mensaje importado antes, o el mismo cambio ya anotado)
function marcarRepetidos() {
  IMP.msgs.forEach((m) => {
    const t = IMP.tramos[m.tramo];
    m.repetido = false; m.yaPedido = '';
    if (!t || t.destino === 'nuevo') return;
    const post = S.db.posts.find((p) => p.id === t.destino);
    if (!post) return;
    const coms = S.db.comments.filter((c) => c.postId === post.id);
    if (idsImportados(post.id).has(impId(m)) || (m.texto && coms.some((c) => W().parecido(c.text, m.texto) >= 0.85))) m.repetido = true;
    if (m.pide && m.texto) {
      const igual = (post.checklist || []).find((c) => W().parecido(c.text.replace(/^[^:]{1,20}:\s*/, ''), m.texto) >= 0.7);
      if (igual) { m.yaPedido = igual.done ? 'ya se había hecho' : 'ya estaba en pendientes'; m.pendiente = false; }
    }
  });
}

function autorPorDefecto() {
  const ult = localStorage.getItem('crono_ultimo_autor');
  if (ult && byId(P, ult)) return ult;
  const otro = P.find((x) => x.id !== S.me.id);
  return otro ? otro.id : S.me.id;
}

function syncImport() {
  if (!IMP || IMP.paso !== 2) return;
  $$('[data-imp-titulo]').forEach((i) => { const t = IMP.tramos[+i.dataset.impTitulo]; if (t) t.titulo = i.value; });
  $$('[data-imp-proyecto]').forEach((i) => { const t = IMP.tramos[+i.dataset.impProyecto]; if (t) t.proyecto = i.value; });
}

function estadoAudio(m) {
  if (!m.audio) return '';
  const T = {
    espera: 'En cola para transcribir…',
    cargando: `Preparando la transcripción${TRANS.progreso ? ' · ' + TRANS.progreso + '%' : ''} (la primera vez tarda un poco)…`,
    escuchando: 'Escuchando el audio…',
    listo: 'Audio transcrito',
    error: 'No se pudo transcribir aquí: escribe lo importante del audio.'
  };
  return `<p class="hint audiost">${ic('mic', 14)} ${esc(T[m.trans] || T.espera)}</p>`;
}

function renderImport() {
  if (!IMP) return;
  if (IMP.paso === 1) {
    $('#panel').innerHTML = `<div class="ph"><button class="iconbtn" data-act="sheet-close">${ic('x')}</button><h2>Importar mensajes</h2><span style="width:40px"></span></div>
      <div class="pb">
        ${isIOS()
          ? `<p class="hint"><b>Desde WhatsApp:</b> mantén apretado el mensaje (o elige varios) → <b>Copiar</b>, y vuelve aquí a <b>Pegar lo copiado</b>. Para un audio: <b>Reenviar → Compartir → Guardar en Archivos</b> y elígelo con el otro botón.</p>`
          : `<p class="hint"><b>Lo más rápido:</b> en WhatsApp mantén apretado un mensaje (texto, foto o audio) → <b>Compartir</b> → <b>Cronograma</b>. Llega aquí solo, sin exportar el chat.</p>`}
        <div class="impbtns">
          <button class="btn" data-act="imp-pegar">${ic('copy', 17)} Pegar lo copiado</button>
          <label class="btn ghost">${ic('mic', 17)} Fotos o audios<input type="file" id="imp-archivos" accept="image/*,audio/*,video/*,.opus,.ogg,.m4a,.mp3" multiple hidden></label>
        </div>
        <p class="hint">También puedes pegar abajo una conversación exportada (<b>Exportar chat → Sin archivos</b>).</p>
        <label class="lbl">Conversación</label>
        <textarea class="area" id="imp-texto" style="min-height:240px;font-size:13px" placeholder="[05-10-26, 11:59:29] Macarena Miquel NEO: …">${esc(IMP.texto || '')}</textarea>
        <p class="hint">Las fotos no viajan en el texto: después de leerla, puedes <b>pegarlas o elegirlas</b> y quedan junto al mensaje que las pidió.</p>
      </div>
      <div class="pf"><button class="btn block" data-act="imp-leer">Leer</button></div>`;
    return;
  }
  const sc = $('#imp-pb') ? $('#imp-pb').scrollTop : 0;
  const sin = Object.keys(IMP.sinMapear);
  const piezas = S.db.posts.slice().sort((a, b) => String(b.updatedAt || '').localeCompare(String(a.updatedAt || ''))).slice(0, 60);
  const camps = [...new Set(S.db.posts.map((p) => p.campaign).filter(Boolean))];
  const utiles = IMP.msgs.filter((m) => !m.sistema);
  const charla = utiles.filter((m) => m.charla && !m.foto && !m.audio && !(m.adjunto && m.adjunto.kind === 'imagen')).length;
  const nTramos = IMP.tramos.filter(Boolean).length;
  const cambiosTot = utiles.filter((m) => m.pide && m.usar).length;

  const fila = (m, i) => {
    const quien = m.persona ? person(m.persona) : { name: m.autor || '¿?', color: '#9A97A6', id: '' };
    const foto = m.foto || (m.adjunto && m.adjunto.kind === 'imagen');
    const editable = m.manual || m.audio;
    return `<div class="improw${m.usar ? ' on' : ''}${m.repetido ? ' rep' : ''}${m.charla ? ' charla' : ''}" data-i="${i}">
      <label class="cb2"><input type="checkbox" data-act="imp-usar" data-i="${i}"${m.usar && !m.repetido ? ' checked' : ''}${m.repetido ? ' disabled' : ''}><span>${ic('check', 16)}</span></label>
      <div class="impcon">
        <small><span class="av sm" style="--c:${quien.color};margin:0">${esc(quien.name[0] || '?')}</span> <b>${esc(quien.name)}</b>${m.manual ? '' : ' · ' + esc(m.dia === today() ? m.hora : fmtShort(m.dia) + ' ' + m.hora)}
          ${m.pide ? '<i class="imptag cambio">cambio</i>' : ''}${m.aprueba && !m.pide ? '<i class="imptag ok">aprobación</i>' : ''}${m.charla && !foto && !m.audio ? '<i class="imptag">conversación, no se importa</i>' : ''}${m.repetido ? '<i class="rept">ya está en la pieza</i>' : ''}</small>
        ${m.manual ? `<div class="chips quien">${P.map((x) => `<button class="chip${m.persona === x.id ? ' on' : ''}" style="--c:${x.color}" data-act="imp-autor" data-i="${i}" data-v="${x.id}">${esc(x.name)}</button>`).join('')}</div>` : ''}
        ${estadoAudio(m)}
        ${editable ? `<textarea class="area imptxt" data-imp-txt="${i}" placeholder="${m.audio ? 'Lo que dice el audio…' : 'Mensaje'}">${esc(m.texto)}</textarea>`
          : (m.texto ? `<p>${mentionHtml(m.texto)}</p>` : '')}
        ${!editable && m.original && m.original !== m.texto ? `<details class="orig"><summary>Ver original</summary><p>${esc(m.original)}</p></details>` : ''}
        ${m.adjunto && !['imagen', 'audio'].includes(m.adjunto.kind) && !m.foto ? `<p class="hint">📎 ${esc(m.adjunto.name || m.adjunto.kind)}${m.adjunto.name ? '' : ' (no viene en el texto)'}</p>` : ''}
        ${m.enlaces.length ? `<p class="hint">${m.enlaces.map((l) => `<a href="${esc(l)}" target="_blank" rel="noopener">${esc(l.slice(0, 44))}…</a>`).join('<br>')}</p>` : ''}
        ${foto ? (m.foto
          ? `<div class="impfoto">${(m.foto.file.type || '').startsWith('image/') ? `<img src="${esc(m.foto.blobUrl)}" alt="">` : `<span class="ext">${esc((m.foto.file.name.split('.').pop() || 'archivo').toUpperCase())}</span>`}<button class="x" data-act="imp-quitar-foto" data-i="${i}">${ic('x', 14)}</button></div>`
          : `<label class="impslot">${ic('image', 18)} Elegir foto<input type="file" accept="image/*" data-imp-foto="${i}" hidden></label>`) : ''}
        ${m.pide && m.persona !== S.me.id ? (m.yaPedido ? `<p class="hint">↺ Este cambio ${esc(m.yaPedido)}.</p>` : `<label class="imppend"><input type="checkbox" data-act="imp-pend" data-i="${i}"${m.pendiente ? ' checked' : ''}> Sumar a pendientes de la pieza</label>`) : ''}
      </div></div>`;
  };

  const bloques = IMP.tramos.map((t, k) => {
    if (!t) return '';
    const del = IMP.msgs.map((m, i) => [m, i]).filter(([m]) => m.tramo === k && !(m.sistema && !m.usar));
    if (!del.length) return '';
    const cambios = del.filter(([m]) => m.pide && m.usar && !m.repetido);
    const nuevos = cambios.filter(([m]) => !m.yaPedido);
    const post = t.destino !== 'nuevo' ? S.db.posts.find((p) => p.id === t.destino) : null;
    const aprob = del.some(([m]) => m.aprueba && m.usar && !m.pide);
    const fechas = del.map(([m]) => m.dia).filter(Boolean);
    const ops = [...new Set(t.cands.concat(piezas.map((p) => p.id)))].map((id) => S.db.posts.find((p) => p.id === id)).filter(Boolean);
    return `<section class="tramo">
      <div class="tramoh">
        <small>${nTramos > 1 ? `Tema ${IMP.tramos.slice(0, k + 1).filter(Boolean).length} · ` : ''}${del.length} mensaje${del.length === 1 ? '' : 's'}${!IMP.compartido && fechas.length ? ` · ${esc(fmtShort(fechas[0]))}${fechas[fechas.length - 1] !== fechas[0] ? ' al ' + esc(fmtShort(fechas[fechas.length - 1])) : ''}` : ''}</small>
        <b class="tramoveredicto">${post ? `${t.seguro ? 'Es la misma pieza:' : 'Va a:'} “${esc(post.title)}”` : (t.cands.length ? 'Puede ser más de una pieza: elige (★ las más parecidas) o crea una nueva' : 'Contenido nuevo')}</b>
        <select class="sel" data-imp-destino="${k}">
          <option value="nuevo"${t.destino === 'nuevo' ? ' selected' : ''}>➕ Crear una pieza nueva</option>
          ${ops.map((p) => `<option value="${esc(p.id)}"${t.destino === p.id ? ' selected' : ''}>${t.cands.includes(p.id) ? '★ ' : ''}${esc(p.title.slice(0, 54))}</option>`).join('')}
        </select>
        ${t.destino === 'nuevo' ? `<div class="row2" style="margin-top:8px">
          <input class="field" data-imp-titulo="${k}" placeholder="Título de la pieza" value="${esc(t.titulo)}">
          <input class="field" data-imp-proyecto="${k}" list="camps2" placeholder="Proyecto" value="${esc(t.proyecto)}"></div>` : ''}
        <div class="estadorow"><span>Estado</span>
          <select class="sel" data-imp-estado="${k}">
            ${post ? `<option value=""${!t.estado ? ' selected' : ''}>Dejar en ${esc(statusOf(post.status).name)}</option>` : ''}
            ${STATUSES.filter((x) => !post || x.id !== post.status).map((x) => `<option value="${x.id}"${t.estado === x.id ? ' selected' : ''}>${post ? 'Pasar a ' : ''}${esc(x.name)}</option>`).join('')}
          </select></div>
        ${t.motivo ? `<p class="hint">${t.estado ? `→ ${esc(statusOf(t.estado).name)}: ` : ''}${esc(t.motivo)}.</p>` : ''}
        <div class="cambios">
          <b>${cambios.length ? `${cambios.length} cambio${cambios.length === 1 ? '' : 's'} pedido${cambios.length === 1 ? '' : 's'}${cambios.length !== nuevos.length ? ` · ${nuevos.length} nuevo${nuevos.length === 1 ? '' : 's'}` : ''}` : (aprob ? 'Sin cambios: lo aprobaron ✅' : 'Sin cambios pedidos')}</b>
          ${cambios.length ? `<ol>${cambios.map(([m]) => `<li${m.yaPedido ? ' class="ya"' : ''}>${esc(m.texto || '(audio por transcribir)')}${m.yaPedido ? ` <small>(${esc(m.yaPedido)})</small>` : ''}</li>`).join('')}</ol>` : ''}
        </div>
      </div>
      <div class="implist">${del.map(([m, i]) => fila(m, i)).join('')}</div>
    </section>`;
  }).join('');

  $('#panel').innerHTML = `<div class="ph"><button class="iconbtn" data-act="imp-volver">${ic('left')}</button><h2>Revisar e importar</h2><span style="width:40px"></span></div>
    <div class="pb" id="imp-pb">
      <div class="impres"><b>${cambiosTot} cambio${cambiosTot === 1 ? '' : 's'} detectado${cambiosTot === 1 ? '' : 's'}</b> en ${nTramos === 1 ? 'una pieza' : nTramos + ' temas'} · ${utiles.length} mensaje${utiles.length === 1 ? '' : 's'}${charla ? ` · ${charla} de pura conversación quedan fuera` : ''}</div>
      <p class="hint">Se guarda solo lo técnico, escrito de forma objetiva. Lo que escriban directo en la app no se toca.</p>
      ${sin.length ? `<p class="hint">No reconocí a: ${sin.map(esc).join(', ')}. Sus mensajes quedarán a tu nombre.</p>` : ''}
      <datalist id="camps2">${camps.map((c) => `<option value="${esc(c)}">`).join('')}</datalist>
      ${bloques || '<p class="hint">No hay mensajes que importar.</p>'}
    </div>
    <div class="pf">${IMP.compartido ? `<button class="btn ghost" data-act="imp-descartar">Descartar</button>` : `<button class="btn ghost" data-act="imp-todas-fotos">${ic('image', 16)} Pegar fotos</button>`}
      <button class="btn" data-act="imp-ok">Importar</button></div>`;
  if ($('#imp-pb')) $('#imp-pb').scrollTop = sc;
}

// Recibe una imagen pegada o elegida y la deja junto a su mensaje
function ponerFoto(i, file) {
  const m = IMP.msgs[i];
  if (!m) return;
  if (m.foto && m.foto.blobUrl) URL.revokeObjectURL(m.foto.blobUrl);
  m.foto = { file, blobUrl: URL.createObjectURL(file) };
  m.usar = true;
  IMP.objetivoFoto = null;
  renderImport();
}
function siguienteSlot() {
  return IMP.msgs.findIndex((m) => m.usar && m.adjunto && m.adjunto.kind === 'imagen' && !m.foto);
}

async function hacerImport() {
  syncImport();
  const btn = $('[data-act="imp-ok"]'); if (btn) btn.disabled = true;
  try {
    if (IMP.msgs.some((m) => m.usar && m.audio && ['espera', 'cargando', 'escuchando'].includes(m.trans) && !m.texto)) {
      toast('Espera a que terminen de transcribirse los audios', 3500); if (btn) btn.disabled = false; return;
    }
    const elegidos = IMP.msgs.filter((m) => m.usar && !m.repetido && (m.texto || m.foto));
    if (!elegidos.length && !IMP.tramos.some((t) => t && t.estado && t.destino !== 'nuevo')) { toast('No hay mensajes marcados'); if (btn) btn.disabled = false; return; }
    const grupos = new Map();
    elegidos.forEach((m) => {
      const t = IMP.tramos[m.tramo] || IMP.tramos.find(Boolean);
      const clave = t.destino === 'nuevo' ? 'nuevo:' + m.tramo : t.destino;
      if (!grupos.has(clave)) grupos.set(clave, { t, msgs: [] });
      grupos.get(clave).msgs.push(m);
    });
    let totM = 0, totF = 0, totC = 0, totE = 0, totN = 0, ultimo = null;
    // también los temas donde solo cambia el estado (sin mensajes nuevos que guardar)
    IMP.tramos.forEach((t, k) => {
      if (!t || !t.estado || t.destino === 'nuevo') return;
      if (![...grupos.values()].some((g) => g.t === t)) grupos.set('estado:' + k, { t, msgs: [] });
    });
    for (const { t, msgs } of grupos.values()) {
      const r = await importarEn(t, msgs);
      totM += r.nuevos; totF += r.fotos; totC += r.cambios; totE += r.estado ? 1 : 0; totN += r.nueva ? 1 : 0; ultimo = r.post;
    }
    if (IMP.desdeCache) await borrarCompartidos();
    const varias = grupos.size > 1;
    IMP = null; closeSheet(); renderAll(); renderBanner();
    const extra = [totE ? `${totE} estado${totE === 1 ? '' : 's'} actualizado${totE === 1 ? '' : 's'}` : '', totN ? `${totN} pieza${totN === 1 ? '' : 's'} nueva${totN === 1 ? '' : 's'}` : ''].filter(Boolean).join(', ');
    toast(`Listo: ${totM} comentario${totM === 1 ? '' : 's'}, ${totC} cambio${totC === 1 ? '' : 's'} a pendientes y ${totF} archivo${totF === 1 ? '' : 's'}${varias ? ` en ${grupos.size} piezas` : ` en “${ultimo.title}”`}${extra ? ' · ' + extra : ''}`, 5200);
    if (!varias && ultimo) setTimeout(() => openEditor(ultimo.id), 350);
  } catch (e) {
    console.error(e); toast('No se pudo importar: ' + (e.message || e), 5000);
    if (btn) btn.disabled = false;
  }
}

async function importarEn(t, elegidos) {
  let post, viejo = null;
  if (t.destino === 'nuevo') {
    post = {
      id: uid(), title: (t.titulo || '').trim() || 'Pedido del equipo', caption: '', notes: '', hashtags: '',
      campaign: (t.proyecto || '').trim(), date: elegidos[0].dia || today(), time: '',
      status: 'diseno', assignees: [...new Set(elegidos.map((m) => m.persona).filter(Boolean))],
      format: formatoDe(elegidos.map((m) => m.original || m.texto).join(' ')),
      platforms: /\b(reel|carrusel|story|historia|instagram|post)\b/i.test(elegidos.map((m) => m.original || m.texto).join(' ')) ? ['instagram'] : [],
      priority: 'normal', links: [], files: [], checklist: []
    };
    if (!post.assignees.includes(S.me.id)) post.assignees.push(S.me.id);
  } else {
    viejo = S.db.posts.find((p) => p.id === t.destino);
    if (!viejo) throw new Error('esa pieza ya no existe');
    post = clone(viejo);
  }

  // 1) fotos y archivos al repositorio
  const conFoto = elegidos.filter((m) => m.foto);
  for (let k = 0; k < conFoto.length; k++) {
    const m = conFoto[k];
    toast(`Subiendo archivo ${k + 1} de ${conFoto.length}…`, 15000);
    const base = slugify(post.title, 'foto').slice(0, 34).replace(/-+$/, '');
    const n = post.files.filter((f) => (f.base || '').startsWith(base)).length + 1;
    const ext = (m.foto.file.type || '').startsWith('image/') ? 'jpg' : ((m.foto.file.name || '').split('.').pop() || 'bin').toLowerCase();
    try {
      const r = await store.upload(m.foto.file, { dir: projectName(post), name: `${base}-${n}-v1.${ext}` });
      m.archivo = Object.assign({ id: uid(), by: m.persona || S.me.id, at: m.at, base: `${base}-${n}`, version: 1 }, r);
      post.files.push(m.archivo);
    } catch (e) { toast('No se pudo subir un archivo: ' + (e.message || e), 4000); }
  }

  // 2) los cambios pedidos pasan a pendientes, sin repetir lo que ya estaba
  let cambios = 0;
  elegidos.filter((m) => m.pendiente && m.texto && !m.yaPedido).forEach((m) => {
    const tx = m.texto.length > 160 ? m.texto.slice(0, 160) + '…' : m.texto;
    const etiqueta = `${person(m.persona || S.me.id).name}: ${tx}`;
    if (!post.checklist.some((c) => c.text === etiqueta || W().parecido(c.text, tx) >= 0.8)) { post.checklist.push({ id: uid(), text: etiqueta, done: false }); cambios++; }
  });

  // 3) enlaces que aparezcan
  elegidos.forEach((m) => m.enlaces.forEach((u) => {
    const url = normUrl(u);
    if (url && !post.links.some((l) => l.url === url)) post.links.push({ id: uid(), label: 'Enlace', url });
  }));

  post.updatedAt = nowISO(); post.updatedBy = S.me.id;
  if (!viejo) {
    if (t.estado) post.status = t.estado;
    Object.assign(post, { createdAt: nowISO(), createdBy: S.me.id, statusChangedAt: t.estadoAt || nowISO(), revisions: post.status === 'cambios' ? 1 : 0, publishedAt: post.status === 'publicado' ? (t.estadoAt || nowISO()) : null });
  } else {
    Object.assign(post, { createdAt: viejo.createdAt, createdBy: viejo.createdBy, revisions: viejo.revisions || 0, statusChangedAt: viejo.statusChangedAt, publishedAt: viejo.publishedAt || null });
    if (t.estado && t.estado !== viejo.status) {
      post.status = t.estado;
      post.statusChangedAt = t.estadoAt && t.estadoAt > (viejo.statusChangedAt || '') ? t.estadoAt : nowISO();
      if (t.estado === 'cambios') post.revisions += 1;
      post.publishedAt = t.estado === 'publicado' ? post.statusChangedAt : null;
    }
  }
  await save('posts', post);
  const estadoCambio = viejo ? (viejo.status !== post.status) : false;
  if (!viejo) await log(post, 'created', 'creó la pieza');
  if (estadoCambio) {
    await log(post, 'status', `movió de ${statusOf(viejo.status).name} a ${statusOf(post.status).name}`, { from: viejo.status, to: post.status });
    await notify('status', post, post.assignees, `movió “${post.title}” a ${statusOf(post.status).name}`);
  }

  // 4) los mensajes como comentarios, con su fecha y su autor
  const previos = idsImportados(post.id);
  let nuevos = 0;
  for (const m of elegidos) {
    const id = impId(m);
    if (previos.has(id)) continue;
    const texto = m.texto || (m.foto ? 'Archivo de referencia.' : '');
    if (!texto) continue;
    await save('comments', {
      id: uid(), postId: post.id, author: m.persona || S.me.id, text: texto,
      createdAt: m.at, via: 'imp', impId: id,
      fileIds: m.archivo ? [m.archivo.id] : []
    });
    previos.add(id); nuevos++;
  }
  if (nuevos || cambios) await log(post, 'edit', `sumó ${nuevos} observaci${nuevos === 1 ? 'ón' : 'ones'}${cambios ? ` y ${cambios} pendiente${cambios === 1 ? '' : 's'}` : ''}`);
  if (cambios) await notify('update', post, post.assignees, `sumó ${cambios} cambio${cambios === 1 ? '' : 's'} pendiente${cambios === 1 ? '' : 's'} en “${post.title}”`);
  return { post, nuevos, fotos: conFoto.length, cambios, estado: estadoCambio, nueva: !viejo };
}

const formatoDe = (t) => [[/\breels?\b/i, 'reel'], [/\bcarrusel/i, 'carrusel'], [/\b(stor(y|ies)|historias?)\b/i, 'story'], [/\b(p[áa]gina|sitio|web|formulario)\b/i, 'web'],
  [/\b(carpeta|impres|imprenta|folleto)/i, 'grafica'], [/\bbanner/i, 'banner'], [/\bvideo/i, 'video'], [/\bpdf\b/i, 'pdf']].find(([re]) => re.test(t || ''))?.[1] || 'post';

/* ---------- el "+" de Javi: pieza nueva o importar ---------- */
function openAgregar() {
  openSheet(`<div class="ph"><h2>Agregar</h2><button class="iconbtn" data-act="sheet-close" aria-label="Cerrar">${ic('x')}</button></div>
    <div class="pb agregar">
      <button class="opt2" data-act="new-pieza">${ic('plus', 22)}<span><b>Nueva pieza</b><small>Crear una pieza a mano</small></span></button>
      <label class="opt2">${ic('folder', 22)}<span><b>Importar zip de conversación</b><small>El .zip exportado de WhatsApp (con fotos y audios). Actualiza el estado de las piezas o crea las que falten.</small></span>
        <input type="file" id="zip-in" accept=".zip,application/zip,application/x-zip-compressed" hidden></label>
      <button class="opt2" data-act="imp-abrir">${ic('msg', 22)}<span><b>Pegar mensajes</b><small>Texto copiado de WhatsApp o un chat exportado sin archivos</small></span></button>
    </div>`);
}

// Abre el .zip, busca el chat y sus archivos, y deja todo listo para revisar
async function importarZip(file) {
  if (!file) return;
  if (!puedeImportar()) { toast('Primero entra con tu clave'); return; }
  toast('Abriendo la conversación…', 20000);
  try {
    const entradas = await window.Zip.read(file);
    const txts = entradas.filter((e) => /\.txt$/i.test(e.name));
    const chat = txts.find((e) => /chat|whatsapp/i.test(e.name)) || txts.sort((a, b) => b.size - a.size)[0];
    if (!chat) { toast('Ese zip no trae el texto de la conversación (.txt)', 5000); return; }
    const msgs = W().parse(await chat.text());
    if (!msgs.length) { toast('No reconocí mensajes en esa conversación', 5000); return; }
    const porNombre = new Map(entradas.map((e) => [e.name.toLowerCase(), e]));
    const TIPO = { jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp', gif: 'image/gif', heic: 'image/heic', mp4: 'video/mp4', mov: 'video/quicktime', '3gp': 'video/3gpp', opus: 'audio/ogg', ogg: 'audio/ogg', m4a: 'audio/mp4', mp3: 'audio/mpeg', aac: 'audio/aac', wav: 'audio/wav', pdf: 'application/pdf' };
    let fotos = 0, audios = 0;
    for (const m of msgs) {
      const e = m.adjunto && m.adjunto.name && porNombre.get(m.adjunto.name.toLowerCase());
      if (!e) continue;
      const ext = (e.name.split('.').pop() || '').toLowerCase();
      const f = new File([await e.blob(TIPO[ext])], e.name, { type: TIPO[ext] || '' });
      if (m.adjunto.kind === 'audio') { m.audio = f; m.trans = 'espera'; audios++; }
      else if (m.adjunto.kind === 'sticker' || m.adjunto.kind === 'contacto') continue;
      else { m.foto = { file: f, blobUrl: URL.createObjectURL(f) }; fotos++; if (m.adjunto.kind === 'video' && f.size > 20e6) m.pesado = true; }
    }
    IMP = { paso: 2, texto: '', msgs: [], tramos: [], sinMapear: {}, compartido: false, zip: file.name };
    prepararImport(msgs);
    msgs.forEach((m) => { if (m.pesado) m.usar = false; }); // los videos muy pesados, mejor al Drive
    openSheet(sheetOpen ? null : '', true);
    renderImport();
    toast(`${msgs.length} mensajes · ${fotos} archivo${fotos === 1 ? '' : 's'} · ${audios} audio${audios === 1 ? '' : 's'}`, 3000);
    transcribirPendientes();
  } catch (e) { console.error(e); toast('No se pudo abrir el zip: ' + (e.message || e), 5000); }
}

/* ---------- lo que llega reenviado desde WhatsApp (Compartir → Cronograma) ---------- */
const CACHE_COMP = 'crono-compartido';
const urlComp = (k) => new URL('__compartido/' + k, location.href.split(/[?#]/)[0]).href;
async function leerCompartidos() {
  if (!('caches' in window)) return [];
  try {
    const c = await caches.open(CACHE_COMP);
    const r = await c.match(urlComp('lista'));
    return r ? await r.json() : [];
  } catch (e) { return []; }
}
async function guardarCompartido(item) {
  try {
    const c = await caches.open(CACHE_COMP);
    const lista = await leerCompartidos();
    lista.push(item);
    await c.put(urlComp('lista'), new Response(JSON.stringify(lista), { headers: { 'Content-Type': 'application/json' } }));
  } catch (e) { /* sin caché: se pierde */ }
}
async function borrarCompartidos() {
  try { await caches.delete(CACHE_COMP); } catch (e) { /* nada */ }
  S.compartidos = 0;
}
async function revisarCompartidos(abrir) {
  const lista = await leerCompartidos();
  S.compartidos = lista.length;
  if (S.me) renderBanner();
  if (abrir && lista.length) {
    if (!puedeImportar()) { toast(store.canWrite ? 'Solo Javi puede sumar mensajes reenviados' : 'Primero entra con tu clave para guardar lo reenviado', 4000); return; }
    await abrirCompartidos(lista);
  }
}
function msgSuelto(texto, at, extra) {
  const d = new Date(at);
  return Object.assign({
    id: 'sh' + Math.random().toString(36).slice(2, 8), at: d.toISOString(), dia: ymd(d),
    hora: pad(d.getHours()) + ':' + pad(d.getMinutes()), autor: '', persona: null, manual: true,
    texto: texto || '', adjunto: null, enlaces: ((texto || '').match(URLS) || []).map((u) => u.replace(/[),.]+$/, '')),
    pide: false, aprueba: false, sistema: false, foto: null
  }, extra || {});
}
async function abrirCompartidos(lista) {
  const c = await caches.open(CACHE_COMP);
  for (const it of lista) {
    const files = [];
    for (const f of it.files || []) {
      const r = await c.match(urlComp(f.key));
      if (!r) continue;
      const blob = await r.blob();
      files.push(new File([blob], f.name || f.key, { type: f.type || blob.type }));
    }
    it.archivos = files;
  }
  await abrirItems(lista, true);
}
// Arma la revisión con lo que llegó: textos (sueltos o copiados con autor y hora), fotos y audios
async function abrirItems(lista, desdeCache) {
  const msgs = [];
  for (const it of lista) {
    const texto = [it.title, it.text, it.url].filter((x) => x && String(x).trim()).join('\n').trim();
    const deChat = texto ? W().parse(texto) : [];
    let conTexto = null;
    if (deChat.length) deChat.forEach((m) => msgs.push(m));                 // varios mensajes copiados con su autor y hora
    else if (texto) { conTexto = msgSuelto(texto, it.at); msgs.push(conTexto); }
    for (const file of it.archivos || []) {
      if (/^audio\//.test(file.type) || /\.(opus|ogg|m4a|mp3|wav|aac)$/i.test(file.name)) {
        msgs.push(msgSuelto('', it.at, { audio: file, trans: 'espera', adjunto: { kind: 'audio', name: '' } }));
      } else if (conTexto && !conTexto.foto) {                                // foto con su texto: van juntos
        conTexto.foto = { file, blobUrl: URL.createObjectURL(file) };
      } else {
        msgs.push(msgSuelto('', it.at, { foto: { file, blobUrl: URL.createObjectURL(file) }, adjunto: { kind: /^image\//.test(file.type) ? 'imagen' : 'documento', name: file.name } }));
      }
    }
  }
  if (!msgs.length) { if (desdeCache) await borrarCompartidos(); else toast('No encontré nada para importar'); return; }
  msgs.sort((a, b) => a.at.localeCompare(b.at));
  IMP = { paso: 2, texto: '', msgs: [], tramos: [], sinMapear: {}, compartido: true, desdeCache: !!desdeCache };
  prepararImport(msgs);
  openSheet(sheetOpen ? null : '', true); // si ya hay una hoja abierta, se reusa (cerrarla y abrir otra se pisan)
  renderImport();
  transcribirPendientes();
}

// iPhone no deja aparecer en "Compartir": se copia en WhatsApp y se pega aquí (texto y foto)
async function pegarLoCopiado() {
  const it = { at: nowISO(), text: '', archivos: [] };
  try {
    if (navigator.clipboard && navigator.clipboard.read) {
      for (const item of await navigator.clipboard.read()) {
        const img = item.types.find((t) => t.startsWith('image/'));
        if (img) { const b = await item.getType(img); it.archivos.push(new File([b], `copiada-${Date.now()}.${img.split('/')[1] || 'png'}`, { type: img })); }
        if (item.types.includes('text/plain')) it.text += (it.text ? '\n' : '') + await (await item.getType('text/plain')).text();
      }
    } else if (navigator.clipboard && navigator.clipboard.readText) it.text = await navigator.clipboard.readText();
  } catch (e) { /* sin permiso: queda el campo para pegar a mano */ }
  if (!it.text.trim() && !it.archivos.length) { toast('No hay nada copiado. En WhatsApp: mantén apretado el mensaje → Copiar.', 4500); return; }
  if (W().parse(it.text).length && !it.archivos.length) { IMP.texto = it.text; const ta = $('#imp-texto'); if (ta) ta.value = it.text; leerConversacion(); return; }
  await abrirItems([it], false);
}
async function elegirArchivosImport(files) {
  if (!files.length) return;
  await abrirItems([{ at: nowISO(), text: (($('#imp-texto') || {}).value || '').trim(), archivos: [...files] }], false);
}

/* ---------- transcribir audios (en el mismo teléfono, sin mandarlos a ningún lado) ---------- */
const TRANS = { asr: null, progreso: 0, corriendo: false };
async function transcriptor() {
  if (!TRANS.asr) {
    TRANS.asr = (async () => {
      const T = await import('https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.7.6/dist/transformers.min.js');
      T.env.allowLocalModels = false;
      const vistos = {};
      return T.pipeline('automatic-speech-recognition', 'Xenova/whisper-base', {
        dtype: 'q8',
        progress_callback: (p) => {
          if (p.status !== 'progress' || !p.total) return;
          vistos[p.file] = [p.loaded, p.total];
          const v = Object.values(vistos);
          const pr = Math.round(100 * v.reduce((a, x) => a + x[0], 0) / v.reduce((a, x) => a + x[1], 0));
          if (pr !== TRANS.progreso) { TRANS.progreso = pr; const el = $('.audiost'); if (el && IMP) renderImport(); }
        }
      });
    })();
  }
  try { return await TRANS.asr; } catch (e) { TRANS.asr = null; throw e; }
}
async function audioMono16k(file) {
  const AC = window.AudioContext || window.webkitAudioContext;
  const ctx = new AC({ sampleRate: 16000 });
  try {
    const ab = await ctx.decodeAudioData(await file.arrayBuffer());
    if (ab.numberOfChannels < 2) return ab.getChannelData(0);
    const a = ab.getChannelData(0), b = ab.getChannelData(1), out = new Float32Array(a.length);
    for (let i = 0; i < a.length; i++) out[i] = (a[i] + b[i]) / 2;
    return out;
  } finally { if (ctx.close) ctx.close(); }
}
async function transcribirPendientes() {
  if (TRANS.corriendo) return;
  TRANS.corriendo = true;
  try {
    while (IMP) {
      const m = IMP.msgs.find((x) => x.audio && x.trans === 'espera');
      if (!m) break;
      try {
        m.trans = 'cargando'; renderImport();
        const asr = await transcriptor();
        m.trans = 'escuchando'; renderImport();
        const r = await asr(await audioMono16k(m.audio), { language: 'spanish', task: 'transcribe', chunk_length_s: 30, stride_length_s: 5 });
        if (!IMP || !IMP.msgs.includes(m)) break;
        m.original = String((r && r.text) || '').trim();
        filtrarMensaje(m);
        m.usar = !!m.texto;
        m.trans = 'listo';
      } catch (e) {
        console.warn('transcripción', e);
        m.trans = 'error'; m.usar = true;
      }
      marcarRepetidos();
      IMP && IMP.tramos.forEach((t, k) => { if (t && !t.aMano) sugerirEstado(t, k); }); // un audio puede pedir cambios
      renderImport();
    }
  } finally { TRANS.corriendo = false; }
}

/* Pegar imágenes: dentro del editor van a la pieza; en la importación, al mensaje */
async function pegarImagenes(files) {
  if (!files.length) return;
  if (IMP && sheetOpen && IMP.paso === 2) {
    let i = IMP.objetivoFoto != null ? IMP.objetivoFoto : siguienteSlot();
    for (const f of files) {
      if (i < 0) { toast('No quedan mensajes con foto pendiente'); break; }
      ponerFoto(i, f);
      i = siguienteSlot();
    }
    return;
  }
  if (ED && sheetOpen) {
    if (!esAdmin()) { toast('Mándale la foto a Javi y ella la suma a la entrega'); return; }
    const dt = new DataTransfer();
    files.forEach((f) => dt.items.add(f));
    await onFiles({ files: dt.files, value: '' });
    return;
  }
  toast('Abre una pieza para pegar la foto ahí');
}
document.addEventListener('paste', (e) => {
  if (!S.me) return;
  const t = e.target;
  const escribiendo = t && t.matches && t.matches('input,textarea') && !(IMP && IMP.objetivoFoto != null);
  const items = [...((e.clipboardData && e.clipboardData.items) || [])];
  const imgs = items.filter((i) => i.kind === 'file' && /^image\//.test(i.type)).map((i) => i.getAsFile()).filter(Boolean);
  if (!imgs.length) return;
  if (escribiendo && !ED && !IMP) return;
  e.preventDefault();
  pegarImagenes(imgs.map((f, n) => new File([f], f.name && f.name !== 'image.png' ? f.name : `pegada-${Date.now()}-${n + 1}.png`, { type: f.type })));
});
document.addEventListener('dragover', (e) => { if (sheetOpen && e.dataTransfer && [...e.dataTransfer.types].includes('Files')) e.preventDefault(); });
document.addEventListener('drop', (e) => {
  if (!sheetOpen || !e.dataTransfer || !e.dataTransfer.files.length) return;
  const imgs = [...e.dataTransfer.files].filter((f) => /^image\//.test(f.type));
  if (!imgs.length) return;
  e.preventDefault();
  pegarImagenes(imgs);
});

/* ---------- acciones (clicks) ---------- */
const ACTS = {
  nav: (el) => { S.view = el.dataset.v; localStorage.setItem('crono_view', S.view); renderAll(); window.scrollTo(0, 0); },
  'prev-m': () => { S.cursor = new Date(S.cursor.getFullYear(), S.cursor.getMonth() - 1, 1); renderMain(); },
  'next-m': () => { S.cursor = new Date(S.cursor.getFullYear(), S.cursor.getMonth() + 1, 1); renderMain(); },
  today: () => { const d = new Date(); d.setDate(1); S.cursor = d; S.sel = today(); renderMain(); },
  'pick-day': (el) => { S.sel = el.dataset.d; renderMain(); },
  new: (el) => {
    if (!requireWrite()) return;
    if (el.classList.contains('fab') && puedeImportar()) openAgregar(); else openEditor(null, { date: el.dataset.d });
  },
  'new-pieza': () => openEditor(null, {}),
  'open-post': (el) => openEditor(el.dataset.id),
  'status-menu': (el) => openStatusMenu(el.dataset.id),
  'set-status': async (el) => { closeSheet(); await changeStatus(el.dataset.id, el.dataset.v); },
  bell: () => openBell(),
  me: () => openMe(),
  filters: () => openFilters(),
  'clear-filters': () => { Object.assign(S.f, { person: '', platform: '', status: '', format: '' }); closeSheet(); renderToolbar(); renderMain(); },
  'toggle-mine': () => { S.f.mine = !S.f.mine; renderToolbar(); renderMain(); },
  carru: (el) => {
    const c = el.closest('.carru'); if (!c) return;
    const t = c.querySelector('.carru-track');
    t.scrollBy({ left: (+el.dataset.d) * t.clientWidth, behavior: 'smooth' });
  },
  'dl-final': async (el, e) => {
    if (e) e.stopPropagation();
    const p = S.db.posts.find((x) => x.id === el.dataset.id); if (!p) return;
    const fs = pieceFiles(p, true);
    if (fs.length === 1) await downloadOne(fs[0]);            // uno solo: el archivo tal cual
    else await downloadZip(entriesOfPost(p, true), slugify(p.title, 'entrega'));
  },
  'toggle-prompts': () => { S.conPrompts = !S.conPrompts; localStorage.setItem('crono_prompts', S.conPrompts ? '1' : '0'); renderMain(); },
  'pr-open': (el, e) => { if (e) e.stopPropagation(); if (!esAdmin()) return; openPrompt(el.dataset.id); },
  'pr-tipo': (el) => { PR.tipo = el.dataset.v; PR.texto = promptDe(S.db.posts.find((p) => p.id === PR.postId), PR.tipo); renderPrompt(); },
  'pr-copiar': async () => {
    const t = ($('#pr-texto') || {}).value || PR.texto;
    toast(await copiarTexto(t) ? 'Prompt copiado ✅' : 'No se pudo copiar; selecciona el texto a mano', 3000);
  },
  'pr-copiar-foto': (el, e) => { if (e) e.stopPropagation(); copiarFotoYPrompt(el.dataset.f); },
  'pr-zip': async () => { const p = S.db.posts.find((x) => x.id === PR.postId); if (p) await zipConPrompt(p); },
  'ui-tema': (el) => { UI.tema = el.dataset.v; guardarUI(); aplicarUI(); openMe(); },
  'ui-escala': (el) => { UI.escala = parseFloat(el.dataset.v); guardarUI(); aplicarUI(); openMe(); },
  'ui-seccion': (el) => {
    const v = el.dataset.v;
    const i = UI.oculto.indexOf(v);
    if (i >= 0) UI.oculto.splice(i, 1);
    else { if (visibles().length <= 1) { toast('Deja al menos una sección'); return; } UI.oculto.push(v); }
    guardarUI(); renderAll(); openMe();
  },
  'buscar-update': (el) => buscarActualizacion(el),
  'acc-pedir': () => pedirContrasena(),
  'acc-entrar': async (el) => {
    const i = $('#acc-pass'); if (!i) return;
    el.disabled = true;
    try {
      await store.entrarConContrasena(i.value);
      closeSheet(); await reload(); renderAll();
      toast('Listo, ya puedes escribir ✅');
    } catch (e) { toast(String(e.message || e), 4000); el.disabled = false; i.select(); }
  },
  'acc-preparar': async (el) => {
    const i = $('#acc-pass2'); if (!i) return;
    el.disabled = true;
    try {
      await store.prepararAcceso(i.value);
      toast('Entrada lista. Mándales esa clave a Flavio y Maca.', 5000);
      $('#gh-box').innerHTML = ghBoxHtml();
    } catch (e) { toast('No se pudo: ' + (e.message || e), 5000); el.disabled = false; }
  },
  'acc-quitar': async () => {
    try { await store.quitarAcceso(); toast('Entrada quitada. Los demás volverán a solo lectura.', 4000); $('#gh-box').innerHTML = ghBoxHtml(); }
    catch (e) { toast('No se pudo quitar: ' + (e.message || e), 4000); }
  },
  'import-open': () => { closeSheet(); setTimeout(openImport, 60); },
  'imp-leer': () => leerConversacion(),
  'imp-volver': () => { if (IMP && IMP.paso === 2 && !IMP.compartido) { IMP.paso = 1; renderImport(); } else closeSheet(); },
  'imp-autor': (el) => {
    const m = IMP && IMP.msgs[+el.dataset.i]; if (!m) return;
    syncImport();
    m.persona = el.dataset.v;
    localStorage.setItem('crono_ultimo_autor', m.persona);
    IMP.msgs.forEach((x) => { if (x.manual && x !== m && !x.autorElegido) x.persona = m.persona; }); // el resto sigue al primero que se elige
    m.autorElegido = true;
    m.pide = W().pideCambio(m.texto) && m.persona !== S.me.id;
    m.pendiente = m.pide && !m.yaPedido;
    IMP.tramos.forEach((t, k) => { if (t && !t.aMano) sugerirEstado(t, k); });
    renderImport();
  },
  'imp-descartar': async () => {
    if (!confirm('¿Descartar esto? No se guarda nada.')) return;
    if (IMP && IMP.desdeCache) await borrarCompartidos();
    IMP = null; closeSheet(); renderBanner();
  },
  'imp-pegar': () => pegarLoCopiado(),
  'imp-abrir': () => { if (!puedeImportar()) { toast('Primero entra con tu clave'); return; } openImport(); },
  'comp-revisar': () => revisarCompartidos(true),
  'imp-quitar-foto': (el, e) => { if (e) e.stopPropagation(); const m = IMP.msgs[+el.dataset.i]; if (m && m.foto) { URL.revokeObjectURL(m.foto.blobUrl); m.foto = null; renderImport(); } },
  'imp-todas-fotos': () => toast('Copia una foto (en el Drive, en WhatsApp o donde esté) y pégala con Ctrl+V o pegar: se va poniendo sola en el siguiente mensaje con foto.', 6000),
  'imp-ok': () => hacerImport(),
  'toggle-last': () => { S.lastOnly = !S.lastOnly; localStorage.setItem('crono_last_only', S.lastOnly ? '1' : '0'); renderMain(); },
  'toggle-project': (el) => { S.openProject = S.openProject === el.dataset.p ? '' : el.dataset.p; localStorage.setItem('crono_open_project', S.openProject); renderMain(); },
  'file-open': (el, e) => { if (e) e.stopPropagation(); openFilePreview(el.dataset.f); },
  'file-dl': (el, e) => { if (e) e.stopPropagation(); const h = findFile(el.dataset.f); if (h) downloadOne(h.file); },
  'file-zoom': (el) => { const lb = $('#lightbox'); lb.innerHTML = `<img src="${esc(el.getAttribute('src'))}" alt="">`; lb.hidden = false; },
  'dl-piece': async (el, e) => { if (e) e.stopPropagation(); const p = S.db.posts.find((x) => x.id === el.dataset.id); if (p) await downloadZip(entriesOfPost(p, S.lastOnly), slugify(p.title, 'pieza')); },
  'dl-project': async (el, e) => { if (e) e.stopPropagation(); await downloadZip(entriesOfProject(el.dataset.p, S.lastOnly), slugify(el.dataset.p, 'proyecto')); },
  'dl-all': async () => {
    const out = [];
    projects(S.lastOnly).forEach((g) => entriesOfProject(g.name, S.lastOnly).forEach((e) => out.push({ name: `${slugify(g.name, 'proyecto')}/${e.name}`, file: e.file })));
    await downloadZip(out, 'entregas-' + today());
  },
  'sheet-close': () => closeSheet(),
  'gh-save': async (el) => {
    const i = $('#gh-token'); if (!i) return;
    el.disabled = true;
    try {
      await store.setToken(i.value);
      toast('Clave guardada. Ya puedes escribir.');
      $('#gh-box').innerHTML = ghBoxHtml();
      renderPushBox(); renderAll();
      await reload();
    } catch (e) { toast('No sirvió: ' + (e.message || e), 5000); el.disabled = false; }
  },
  'gh-forget': () => { store.clearToken(); toast('Clave borrada de este teléfono'); $('#gh-box').innerHTML = ghBoxHtml(); renderPushBox(); renderAll(); },
  'switch-user': async () => {
    await disablePush().catch(() => {});
    if (S.me && claveDe(S.me.id)) localStorage.removeItem('crono_perfil_' + S.me.id); // al salir, la próxima vez vuelve a pedirla
    localStorage.removeItem('crono_me'); location.reload();
  },
  'push-on': async (el) => { el.disabled = true; try { if (await enablePush()) toast('Notificaciones activadas'); } catch (e) { console.error(e); toast('No se pudo activar: ' + (e.message || e)); } renderPushBox(); },
  'push-off': async () => { await disablePush(); toast('Notificaciones desactivadas en este celular'); renderPushBox(); },
  'push-test': async () => {
    await save('notifications', { id: uid(), to: S.me.id, from: S.me.id, postId: null, type: 'test', text: 'probó las notificaciones', read: true, inApp: false, push: true, title: CFG.APP_NAME, body: 'Si ves esto, las notificaciones funcionan ✅', url: siteBase(), createdAt: nowISO() });
    toast('Enviada. Debería llegar en unos segundos.');
  },
  'install-app': async () => { if (!deferredInstall) return; deferredInstall.prompt(); await deferredInstall.userChoice.catch(() => {}); deferredInstall = null; renderBanner(); },
  'hide-install': () => { localStorage.setItem('crono_hide_install', '1'); renderBanner(); },
  'pick-me': (el) => {
    const id = el.dataset.id;
    if (!perfilAbierto(id)) { pedirClavePerfil(id); return; }
    localStorage.setItem('crono_me', id); S.me = person(id); startApp();
  },
  'who-volver': () => showWho(),
  /* editor */
  'ed-status': (el) => { syncDraft(); ED.d.status = el.dataset.v; renderEditor(); },
  'ed-plat': (el) => { syncDraft(); const a = ED.d.platforms, v = el.dataset.v; a.includes(v) ? a.splice(a.indexOf(v), 1) : a.push(v); renderEditor(); },
  'ed-person': (el) => { syncDraft(); const a = ED.d.assignees, v = el.dataset.v; a.includes(v) ? a.splice(a.indexOf(v), 1) : a.push(v); renderEditor(); },
  'ed-prio': () => { syncDraft(); ED.d.priority = ED.d.priority === 'alta' ? 'normal' : 'alta'; renderEditor(); },
  'ed-rmfile': (el) => {
    syncDraft();
    const f = ED.d.files.find((x) => x.id === el.dataset.id);
    ED.d.files = ED.d.files.filter((x) => x.id !== el.dataset.id);
    renderEditor();
    if (f && f.path && store.deleteFile) store.deleteFile(f.path, f.sha).catch(() => {});
  },
  'ed-view': (el) => {
    const f = ED && ED.d.files.find((x) => x.id === el.dataset.id); if (!f) return;
    if (isImg(f)) { const lb = $('#lightbox'); lb.innerHTML = `<img src="${esc(fileSrc(f))}" alt=""><a class="lbdl" href="${esc(fileSrc(f))}" download="${esc(f.name)}" target="_blank" rel="noopener">${ic('download', 18)} ${esc(f.name)}</a>`; lb.hidden = false; }
    else downloadOne(f);
  },
  'ed-addlink': () => {
    syncDraft();
    const u = normUrl(ED.newLink.url);
    if (!u) { toast('Escribe un enlace válido (https://…)'); return; }
    ED.d.links.push({ id: uid(), label: ED.newLink.label.trim(), url: u }); ED.newLink = { label: '', url: '' }; renderEditor();
  },
  'ed-rmlink': (el) => { syncDraft(); ED.d.links = ED.d.links.filter((l) => l.id !== el.dataset.id); renderEditor(); },
  'ed-addcheck': () => { syncDraft(); const t = ED.newCheck.trim(); if (!t) return; ED.d.checklist.push({ id: uid(), text: t, done: false }); ED.newCheck = ''; renderEditor(); const i = $('#e-newck'); if (i) i.focus(); },
  'ed-check': (el) => { const it = ED.d.checklist.find((c) => c.id === el.dataset.ck); if (it) it.done = el.checked; },
  'ed-rmcheck': (el) => { syncDraft(); ED.d.checklist = ED.d.checklist.filter((c) => c.id !== el.dataset.id); renderEditor(); },
  'ed-mention': (el) => { const t = $('#e-comment'); t.value = (t.value + ' @' + el.dataset.v + ' ').trimStart(); t.focus(); },
  'ed-comment': () => addComment(),
  'ed-avisos': async () => {
    const p = ED && ED.old; if (!p || !requireWrite()) return;
    syncDraft();
    try {
      const on = await cambiarAvisosPieza(p);
      toast(on ? 'Te vamos a avisar de los cambios en esta pieza 🔔' : 'Avisos de esta pieza silenciados', 3200);
      renderEditor(); renderHeader();
    } catch (e) { /* ya avisado */ }
  },
  'ed-save': () => saveEditor(),
  'ed-delete': async () => {
    const p = ED && ED.old; if (!p) return;
    if (!confirm(`¿Eliminar “${p.title}”? Esta acción no se puede deshacer.`)) return;
    await log(p, 'deleted', 'eliminó la pieza');
    for (const c of S.db.comments.filter((x) => x.postId === p.id)) await removeRow('comments', c.id);
    await removeRow('posts', p.id);
    closeSheet(); renderAll(); toast('Pieza eliminada');
  }
};
document.addEventListener('click', (e) => {
  if (e.target.id === 'lightbox' || e.target.closest('#lightbox')) { $('#lightbox').hidden = true; return; }
  const el = e.target.closest('[data-act]');
  if (!el) return;
  const fn = ACTS[el.dataset.act];
  if (fn) fn(el, e);
});
document.addEventListener('input', (e) => {
  if (e.target.id === 'q') { S.f.q = e.target.value; renderMain(); }
  if (e.target.dataset && e.target.dataset.impTxt != null && IMP) {
    const m = IMP.msgs[+e.target.dataset.impTxt];
    if (m) { m.texto = e.target.value; m.original = m.original || e.target.value; m.pide = W().pideCambio(m.texto) && m.persona !== S.me.id; m.charla = !m.texto.trim(); m.usar = !!m.texto.trim() || !!m.foto; }
  }
  if (e.target.id === 'e-caption') { const c = $('#e-count'); if (c) c.textContent = `${e.target.value.length} caracteres`; }
});
document.addEventListener('change', (e) => {
  const t = e.target;
  if (t.dataset && t.dataset.impFoto != null && t.files && t.files[0]) { ponerFoto(+t.dataset.impFoto, t.files[0]); return; }
  if (t.dataset && t.dataset.act === 'imp-usar') {
    const m = IMP.msgs[+t.dataset.i]; m.usar = t.checked;
    const tr = IMP.tramos[m.tramo];
    if (tr && !tr.aMano) { syncImport(); sugerirEstado(tr, m.tramo); renderImport(); } else t.closest('.improw').classList.toggle('on', t.checked);
    return;
  }
  if (t.dataset && t.dataset.act === 'imp-pend') { IMP.msgs[+t.dataset.i].pendiente = t.checked; return; }
  if (t.dataset && t.dataset.impDestino != null) {
    syncImport();
    const tr = IMP.tramos[+t.dataset.impDestino];
    if (tr) { tr.destino = t.value; tr.seguro = false; }
    marcarRepetidos(); sugerirEstado(tr, +t.dataset.impDestino); renderImport(); return;
  }
  if (t.dataset && t.dataset.impEstado != null) {
    const tr = IMP.tramos[+t.dataset.impEstado];
    if (tr) { tr.estado = t.value; tr.motivo = t.value ? 'elegido a mano' : ''; tr.aMano = true; }
    renderImport(); return;
  }
  if (t.dataset && t.dataset.filter) { S.f[t.dataset.filter] = t.value; renderToolbar(); renderMain(); }
  else if (t.dataset && t.dataset.ev) savePrefs();
  else if (t.id === 'e-file') onFiles(t);
  else if (t.id === 'zip-in') { const f = t.files[0]; t.value = ''; importarZip(f); }
  else if (t.id === 'imp-archivos') { const fs = [...t.files]; t.value = ''; elegirArchivosImport(fs); }
});
/* Arrastrar y soltar en el tablero (escritorio) */
document.addEventListener('dragstart', (e) => { const c = e.target.closest && e.target.closest('.card[draggable]'); if (c) e.dataTransfer.setData('text/plain', c.dataset.id); });
document.addEventListener('dragover', (e) => { const col = e.target.closest && e.target.closest('.col'); if (col) { e.preventDefault(); col.classList.add('over'); } });
document.addEventListener('dragleave', (e) => { const col = e.target.closest && e.target.closest('.col'); if (col) col.classList.remove('over'); });
document.addEventListener('drop', (e) => {
  const col = e.target.closest && e.target.closest('.col'); if (!col) return;
  e.preventDefault(); col.classList.remove('over');
  const id = e.dataTransfer.getData('text/plain'); if (id) changeStatus(id, col.dataset.status);
});
/* Puntitos y contador del carrusel */
document.addEventListener('scroll', (e) => {
  const t = e.target;
  if (!t.classList || !t.classList.contains('carru-track')) return;
  const i = Math.round(t.scrollLeft / Math.max(1, t.clientWidth));
  const c = t.parentElement;
  const dots = c.querySelectorAll('.carru-dots i');
  dots.forEach((d, n) => d.classList.toggle('on', n === i));
  const n = c.querySelector('.carru-n');
  if (n) n.textContent = `${Math.min(i + 1, dots.length || 1)}/${dots.length || 1}`;
}, true);

/* Deslizar para cambiar de mes */
let tx = 0, ty = 0;
document.addEventListener('touchstart', (e) => { tx = e.touches[0].clientX; ty = e.touches[0].clientY; }, { passive: true });
document.addEventListener('touchend', (e) => {
  if (S.view !== 'calendar' || sheetOpen || !e.target.closest || !e.target.closest('#calgrid')) return;
  const dx = e.changedTouches[0].clientX - tx, dy = e.changedTouches[0].clientY - ty;
  if (Math.abs(dx) > 70 && Math.abs(dx) > Math.abs(dy) * 2) ACTS[dx < 0 ? 'next-m' : 'prev-m']();
}, { passive: true });

/* ---------- arranque ---------- */
// Perfiles con contraseña (Javi): se pide al elegirlo y queda recordada en este teléfono
const huella = async (id, clave) => [...new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(`neorigen-perfil:${id}:${clave}`)))].map((b) => b.toString(16).padStart(2, '0')).join('');
window.Crono = { huella };
const claveDe = (id) => (CFG.PERFIL_CLAVE || {})[id] || '';
const perfilAbierto = (id) => { const h = claveDe(id); if (!h) return true; try { return localStorage.getItem('crono_perfil_' + id) === h; } catch (e) { return false; } };
function pedirClavePerfil(id) {
  const p = person(id);
  const w = $('#who'); w.hidden = false; $('#app').hidden = true;
  w.innerHTML = `<div class="who-in"><div class="logo">${marca()}</div><h1>${esc(p.name)}</h1><p class="q">Escribe tu contraseña</p>
    <form class="who-pass" data-perfil="${esc(id)}">
      <input class="field" id="perfil-pass" type="password" autocomplete="current-password" placeholder="Contraseña" autofocus>
      <button class="btn" type="submit">Entrar</button>
    </form>
    <p class="hint" id="perfil-err" style="margin-top:12px"></p>
    <button class="btn ghost sm" data-act="who-volver" style="margin-top:8px">Volver</button></div>`;
  setTimeout(() => { const i = $('#perfil-pass'); if (i) i.focus(); }, 60);
}
document.addEventListener('submit', async (e) => {
  const f = e.target.closest && e.target.closest('form.who-pass');
  if (!f) return;
  e.preventDefault();
  const id = f.dataset.perfil, i = $('#perfil-pass');
  if (await huella(id, (i.value || '').trim()) === claveDe(id)) {
    try { localStorage.setItem('crono_perfil_' + id, claveDe(id)); } catch (er) { /* sin espacio */ }
    localStorage.setItem('crono_me', id); S.me = person(id); startApp();
  } else {
    $('#perfil-err').textContent = 'Esa no es la contraseña.';
    i.value = ''; i.focus();
  }
});
function showWho() {
  $('#app').hidden = true;
  const w = $('#who'); w.hidden = false;
  w.innerHTML = `<div class="who-in"><div class="logo">${marca()}</div><h1>${esc(CFG.APP_NAME)}</h1><p class="q">¿Quién eres?</p>
    <div class="who-list">${P.map((p) => `<button class="who-card" data-act="pick-me" data-id="${p.id}">${av(p.id)}<span>${esc(p.name)}</span></button>`).join('')}</div>
    <p class="hint" style="margin-top:20px">Solo sirve para registrar quién hace cada cambio y a quién avisar.</p></div>`;
}
async function seedDemo() {
  const t = today(), at = nowISO();
  const mk = (o) => Object.assign({ id: uid(), title: '', caption: '', notes: '', hashtags: '', campaign: '', time: '', platforms: [], format: 'post', status: 'idea', assignees: [], priority: 'normal', links: [], files: [], checklist: [], createdBy: 'maca', createdAt: at, updatedAt: at, updatedBy: 'maca', statusChangedAt: at, revisions: 0, publishedAt: null }, o);
  const demo = [
    mk({ title: 'Carrusel: 5 errores de branding', date: addDays(t, 1), time: '12:00', platforms: ['instagram', 'linkedin'], format: 'carrusel', status: 'revision', assignees: ['flavio', 'maca'], campaign: 'Educativo', caption: 'Los 5 errores que frenan a tu marca…', hashtags: '#branding #diseño', checklist: [{ id: uid(), text: 'Revisar ortografía', done: true }, { id: uid(), text: 'Subir portada', done: false }] }),
    mk({ title: 'Reel: detrás de cámara', date: addDays(t, 3), time: '18:30', platforms: ['instagram', 'tiktok'], format: 'reel', status: 'diseno', assignees: ['javi'], priority: 'alta', campaign: 'Marca personal' }),
    mk({ title: 'Banner web de temporada', date: addDays(t, -2), platforms: ['web'], format: 'banner', status: 'cambios', assignees: ['maca'], revisions: 1, campaign: 'Lanzamiento' }),
    mk({ title: 'Idea: serie “Un día en el estudio”', platforms: ['instagram'], format: 'story', status: 'idea', assignees: ['flavio'] }),
    mk({ title: 'Post de bienvenida', date: addDays(t, -5), platforms: ['facebook', 'instagram'], status: 'publicado', assignees: ['maca', 'javi'], publishedAt: new Date(Date.now() - 5 * 864e5).toISOString(), campaign: 'Lanzamiento' })
  ];
  for (const p of demo) await save('posts', p);
}
// Los avisos viejos se borran solos para que el archivo de datos no crezca sin fin
async function pruneOld() {
  try {
    if (store.mode !== 'github' || !store.canWrite) return;
    const limite = Date.now() - 45 * 864e5;
    const viejas = S.db.notifications.filter((n) => new Date(n.createdAt || 0).getTime() < limite);
    if (viejas.length < 20) return;
    for (const n of viejas) await removeRow('notifications', n.id);
  } catch (e) { /* no es importante */ }
}
async function startApp() {
  $('#who').hidden = true; $('#app').hidden = false;
  S.f.mine = false;
  renderAll();
  openFromHash();
  syncPushSub();
  pruneOld();
  const qs = new URLSearchParams(location.search);
  const llegoTexto = qs.get('texto');
  const llegoCompartido = qs.get('compartido') === '1' || !!llegoTexto;
  if (llegoTexto) await guardarCompartido({ at: nowISO(), title: '', text: llegoTexto, url: '', files: [] });
  if (llegoCompartido) history.replaceState(null, '', location.pathname + location.hash);
  revisarCompartidos(llegoCompartido);
  if (store.mode === 'github' && !store.canWrite && store.hayAcceso && store.hayAcceso() && !llegoCompartido) setTimeout(pedirContrasena, 400);
}
function openFromHash() {
  const m = location.hash.match(/post=([\w-]+)/);
  if (!m) return;
  history.replaceState(null, '', location.pathname + location.search);
  if (S.db.posts.some((p) => p.id === m[1])) openEditor(m[1]);
}
window.addEventListener('hashchange', () => { if (S.me) openFromHash(); });
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.addEventListener('message', async (e) => {
    if (e.data && e.data.type === 'open-post' && S.me) { await reload(); if (S.db.posts.some((p) => p.id === e.data.postId)) openEditor(e.data.postId); }
  });
}
async function reload() {
  try { S.db = normalize(await store.load()); if (S.me) { renderAll(); if (ED && sheetOpen && !(document.activeElement && document.activeElement.matches('input,textarea,select'))) { syncDraft(); renderEditor(); } } }
  catch (e) { console.warn('No se pudo refrescar', e); }
}
/* ---------- mantenerse al día ---------- */
let SW_REG = null, SW_VERSION = '', yaRecargando = false;
function prepararActualizaciones() {
  if (!('serviceWorker' in navigator) || !/^https?:$/.test(location.protocol)) return;
  let tuvoControlador = !!navigator.serviceWorker.controller;
  navigator.serviceWorker.register('sw.js', { updateViaCache: 'none' }).then((reg) => {
    SW_REG = reg;
    const buscar = () => { if (!document.hidden) reg.update().catch(() => {}); };
    buscar();
    setInterval(buscar, 10 * 60 * 1000);
    document.addEventListener('visibilitychange', buscar);
    window.addEventListener('online', buscar);
  }).catch((e) => console.warn('SW', e));

  // Cuando entra una versión nueva, la app se recarga sola una vez
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    // La primera vez solo toma el control (no hay nada viejo que refrescar)
    if (!tuvoControlador) { tuvoControlador = true; return; }
    if (yaRecargando) return;
    yaRecargando = true;
    location.reload();
  });
  navigator.serviceWorker.addEventListener('message', (e) => {
    if (e.data && e.data.type === 'version') { SW_VERSION = e.data.version; const v = $('#ver-txt'); if (v) v.textContent = SW_VERSION; }
  });
  const pedirVersion = () => { if (navigator.serviceWorker.controller) navigator.serviceWorker.controller.postMessage({ type: 'version' }); };
  pedirVersion();
  setTimeout(pedirVersion, 1500);
}
async function buscarActualizacion(el) {
  if (el) el.disabled = true;
  try {
    if (!SW_REG) { location.reload(); return; }
    await SW_REG.update();
    const nueva = SW_REG.waiting || SW_REG.installing;
    if (nueva) {
      toast('Hay una versión nueva, actualizando…');
      if (SW_REG.waiting) SW_REG.waiting.postMessage({ type: 'skip-waiting' });
      setTimeout(() => { yaRecargando = true; location.reload(); }, 1200);
    } else {
      toast('Ya tienes la última versión');
      if (el) el.disabled = false;
    }
  } catch (e) { toast('No se pudo comprobar: ' + (e.message || e)); if (el) el.disabled = false; }
}

/* ---------- aviso de guardado ---------- */
function watchSaving() {
  const el = $('#saving');
  if (!el) return;
  let visto = false;
  setInterval(() => {
    const p = store.pending && store.pending();
    if (p === visto) return;
    visto = p;
    el.hidden = !p;
  }, 400);
  window.addEventListener('beforeunload', (e) => {
    if (store.pending && store.pending()) { e.preventDefault(); e.returnValue = ''; }
  });
  document.addEventListener('visibilitychange', () => { if (document.hidden && store.flushNow) store.flushNow(); });
}

function quitarCarga() {
  const c = document.getElementById('carga');
  if (!c) return;
  c.classList.add('fuera');
  setTimeout(() => c.remove(), 400);
}
async function boot() {
  prepararActualizaciones();
  store = window.Store.create(CFG);
  try { S.db = normalize(await store.init()); }
  catch (e) {
    console.error(e);
    S.offline = e.message || String(e);
    store = window.Store.local; S.db = normalize(await store.init());
  }
  if (store.mode === 'local' && store.isFirstRun() && !S.db.posts.length) await seedDemo();
  aplicarUI();
  store.onError = (e) => toast('No se pudo guardar: ' + (e.message || e), 6000);
  watchSaving();
  try { store.subscribe(debounce(reload, 500)); } catch (e) { /* sin actualización automática */ }
  document.addEventListener('visibilitychange', () => { if (!document.hidden && S.me) reload(); });
  const saved = localStorage.getItem('crono_me');
  if (saved && byId(P, saved) && perfilAbierto(saved)) { S.me = byId(P, saved); startApp(); } else showWho();
  quitarCarga();
}
boot();
})();
