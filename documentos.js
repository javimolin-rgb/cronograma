/* ============================================================
   Ver documentos sin bajarlos.

   Un .xlsx, un .docx y un .pptx son, por dentro, un .zip con XML
   adentro: se abren con el mismo lector de zip que ya usa la app
   (zip.js), se les saca el texto y las imágenes, y se muestran
   como una tabla o como páginas. No hay nada que instalar ni
   ninguna librería de afuera: todo pasa dentro del teléfono.

   Lo que sabe abrir:
     · planillas  .xlsx  (con las imágenes pegadas en las celdas)
     · documentos .docx
     · presentaciones .pptx
     · texto: .csv .tsv .txt .md .json .srt .vtt y similares
     · cualquier .zip: al menos la lista de lo que trae

   Devuelve además las filas de la planilla, para poder traerlas
   a la Estructura de la pieza.
   ============================================================ */
(function () {
  'use strict';

  const EXT = (n) => (String(n || '').match(/\.([a-z0-9]+)$/i) || [, ''])[1].toLowerCase();
  const TEXTO = ['csv', 'tsv', 'txt', 'md', 'markdown', 'json', 'srt', 'vtt', 'log', 'xml', 'html', 'htm', 'css', 'js', 'rtf'];
  const OFICINA = { xlsx: 'hoja', xlsm: 'hoja', docx: 'doc', pptx: 'diapos' };
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  function puedeVer(nombre) {
    const e = EXT(nombre);
    return !!OFICINA[e] || TEXTO.includes(e) || e === 'zip';
  }
  const comoSeLlama = (nombre) => ({ hoja: 'planilla', doc: 'documento', diapos: 'presentación' })[OFICINA[EXT(nombre)]]
    || (EXT(nombre) === 'zip' ? 'carpeta comprimida' : 'documento');

  /* ---------- utilidades ---------- */
  const xml = (txt) => new DOMParser().parseFromString(txt, 'application/xml');
  // Los XML de Office usan prefijos (w:, a:, xdr:…): se busca por nombre local y basta
  const hijos = (nodo, local) => [...nodo.getElementsByTagName('*')].filter((e) => e.localName === local);
  const attr = (e, nombre) => {
    if (!e) return '';
    for (const a of e.attributes) if (a.localName === nombre) return a.value;
    return '';
  };
  const mapaDe = (lista) => { const m = new Map(); lista.forEach((e) => m.set(e.path, e)); return m; };
  // "../media/image1.png" visto desde "xl/drawings/" → "xl/media/image1.png"
  function resolver(base, rel) {
    const partes = (base.replace(/[^/]*$/, '') + rel).split('/');
    const out = [];
    for (const p of partes) { if (p === '.' || !p) continue; if (p === '..') out.pop(); else out.push(p); }
    return out.join('/');
  }
  async function rels(mapa, archivo) {
    const r = mapa.get(archivo.replace(/([^/]+)$/, '_rels/$1.rels'));
    const out = {};
    if (!r) return out;
    try {
      const d = xml(await r.text());
      hijos(d, 'Relationship').forEach((e) => { out[attr(e, 'Id')] = resolver(archivo, attr(e, 'Target')); });
    } catch (e) { /* sin relaciones */ }
    return out;
  }
  const TIPO_IMG = { png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', gif: 'image/gif', webp: 'image/webp', bmp: 'image/bmp', svg: 'image/svg+xml', emf: '', wmf: '', tiff: '' };
  async function imagenDe(mapa, ruta, medios) {
    const e = mapa.get(ruta);
    if (!e) return null;
    const tipo = TIPO_IMG[EXT(ruta)];
    if (tipo === '' || tipo === undefined) return null;      // formatos que el navegador no dibuja
    const ya = medios.find((m) => m.ruta === ruta);
    if (ya) return ya;
    const blob = await e.blob(tipo);
    const m = { ruta, nombre: ruta.split('/').pop(), blob, url: URL.createObjectURL(blob) };
    medios.push(m);
    return m;
  }

  /* ---------- planilla (.xlsx) ---------- */
  const LETRAS = (ref) => (String(ref || '').match(/^([A-Z]+)/) || [, 'A'])[1];
  const col = (ref) => { let n = 0; for (const c of LETRAS(ref)) n = n * 26 + (c.charCodeAt(0) - 64); return n - 1; };
  const FECHA_FIJAS = new Set([14, 15, 16, 17, 22, 45, 46, 47]);
  // El número 45678 de una planilla es una fecha si su formato lo dice
  function formatosDeFecha(doc) {
    const fechas = new Set();
    try {
      const propios = {};
      hijos(doc, 'numFmt').forEach((e) => {
        const codigo = attr(e, 'formatCode') || '';
        if (/[dmy]/i.test(codigo) && !/[#?]/.test(codigo)) propios[attr(e, 'numFmtId')] = true;
      });
      const xf = hijos(doc, 'cellXfs')[0];
      if (xf) hijos(xf, 'xf').forEach((e, i) => {
        const id = +attr(e, 'numFmtId');
        if (FECHA_FIJAS.has(id) || propios[id]) fechas.add(i);
      });
    } catch (e) { /* sin estilos */ }
    return fechas;
  }
  const comoFecha = (n) => {
    const ms = Math.round((n - 25569) * 86400000);
    const d = new Date(ms);
    if (isNaN(d)) return String(n);
    const p = (x) => String(x).padStart(2, '0');
    const dia = `${p(d.getUTCDate())}-${p(d.getUTCMonth() + 1)}-${d.getUTCFullYear()}`;
    const hora = n % 1 ? ` ${p(d.getUTCHours())}:${p(d.getUTCMinutes())}` : '';
    return dia + hora;
  };

  async function leerHoja(lista, mapa, medios) {
    const libro = mapa.get('xl/workbook.xml');
    if (!libro) throw new Error('la planilla viene incompleta');
    const doc = xml(await libro.text());
    const rl = await rels(mapa, 'xl/workbook.xml');
    const hojas = hijos(doc, 'sheet').map((e) => ({ nombre: attr(e, 'name') || 'Hoja', ruta: rl[attr(e, 'id')] }))
      .filter((h) => h.ruta && mapa.get(h.ruta));
    // textos compartidos
    const compartidos = [];
    const ss = mapa.get('xl/sharedStrings.xml');
    if (ss) hijos(xml(await ss.text()), 'si').forEach((si) => compartidos.push(hijos(si, 't').map((t) => t.textContent).join('')));
    // formatos de fecha
    const est = mapa.get('xl/styles.xml');
    const fechas = est ? formatosDeFecha(xml(await est.text())) : new Set();

    const out = [];
    for (const h of hojas) {
      const d = xml(await mapa.get(h.ruta).text());
      const filas = [];
      let ancho = 0;
      hijos(d, 'row').forEach((r) => {
        const n = +attr(r, 'r') || (filas.length + 1);
        const fila = filas[n - 1] = filas[n - 1] || [];
        hijos(r, 'c').forEach((c) => {
          const ref = attr(c, 'r'), t = attr(c, 't'), s = attr(c, 's');
          const v = hijos(c, 'v')[0];
          let txt = '';
          if (t === 's' && v) txt = compartidos[+v.textContent] || '';
          else if (t === 'inlineStr') txt = hijos(c, 't').map((x) => x.textContent).join('');
          else if (v) {
            txt = v.textContent || '';
            if (!t && s !== '' && fechas.has(+s) && txt !== '' && !isNaN(+txt)) txt = comoFecha(+txt);
          }
          const i = ref ? col(ref) : fila.length;
          fila[i] = txt;
          if (i + 1 > ancho) ancho = i + 1;
        });
      });
      // celdas unidas: se dibujan como una sola
      const unidas = hijos(d, 'mergeCell').map((e) => attr(e, 'ref')).filter(Boolean).map((ref) => {
        const [a, b] = ref.split(':');
        return { c1: col(a), f1: +(a.match(/\d+/) || [1])[0] - 1, c2: col(b), f2: +(b.match(/\d+/) || [1])[0] - 1 };
      });
      // imágenes pegadas: se guardan en la celda donde empiezan
      const imgs = {};
      const rh = await rels(mapa, h.ruta);
      for (const rid of Object.keys(rh)) {
        const dib = rh[rid];
        if (!/drawings\/drawing/.test(dib) || !mapa.get(dib)) continue;
        const dd = xml(await mapa.get(dib).text());
        const rd = await rels(mapa, dib);
        for (const anchor of [...hijos(dd, 'twoCellAnchor'), ...hijos(dd, 'oneCellAnchor'), ...hijos(dd, 'absoluteAnchor')]) {
          const desde = hijos(anchor, 'from')[0];
          const f = desde ? +(hijos(desde, 'row')[0] || {}).textContent || 0 : 0;
          const c = desde ? +(hijos(desde, 'col')[0] || {}).textContent || 0 : 0;
          const blip = hijos(anchor, 'blip')[0];
          const ruta = blip ? rd[attr(blip, 'embed')] : '';
          if (!ruta) continue;
          const m = await imagenDe(mapa, ruta, medios);
          if (!m) continue;
          (imgs[f + ':' + c] = imgs[f + ':' + c] || []).push(m);
          if (c + 1 > ancho) ancho = c + 1;
          if (!filas[f]) filas[f] = [];
        }
      }
      for (let i = 0; i < filas.length; i++) { filas[i] = filas[i] || []; for (let j = 0; j < ancho; j++) filas[i][j] = filas[i][j] || ''; }
      // una hoja sin nada no se muestra
      const vacia = !filas.some((f) => f.some((c) => String(c).trim())) && !Object.keys(imgs).length;
      if (!vacia) out.push({ nombre: h.nombre, filas, imgs, unidas, ancho });
    }
    if (!out.length) throw new Error('la planilla está vacía');
    return { tipo: 'hoja', hojas: out };
  }

  /* ---------- documento (.docx) ---------- */
  async function leerDoc(lista, mapa, medios) {
    const e = mapa.get('word/document.xml');
    if (!e) throw new Error('el documento viene incompleto');
    const d = xml(await e.text());
    const rl = await rels(mapa, 'word/document.xml');
    const cuerpo = hijos(d, 'body')[0] || d.documentElement;
    const partes = [];
    const textoDe = (p) => hijos(p, 't').map((t) => t.textContent).join('');
    const imagenesDe = async (p) => {
      const out = [];
      for (const b of hijos(p, 'blip')) {
        const m = await imagenDe(mapa, rl[attr(b, 'embed')] || '', medios);
        if (m) out.push(m);
      }
      return out;
    };
    for (const nodo of [...cuerpo.children]) {
      if (nodo.localName === 'p') {
        const txt = textoDe(nodo), imgs = await imagenesDe(nodo);
        const estilo = attr(hijos(nodo, 'pStyle')[0], 'val') || '';
        const titulo = /heading|t[ií]tulo/i.test(estilo) ? (parseInt(estilo.replace(/\D+/g, ''), 10) || 1) : 0;
        if (txt.trim() || imgs.length) partes.push({ que: 'p', txt, imgs, titulo, lista: /list/i.test(estilo) });
      } else if (nodo.localName === 'tbl') {
        const filas = hijos(nodo, 'tr').map((tr) => hijos(tr, 'tc').map((tc) => hijos(tc, 'p').map(textoDe).join('\n')));
        if (filas.length) partes.push({ que: 'tabla', filas });
      }
    }
    if (!partes.length) throw new Error('el documento está vacío');
    return { tipo: 'doc', partes };
  }

  /* ---------- presentación (.pptx) ---------- */
  async function leerDiapos(lista, mapa, medios) {
    const rutas = lista.map((x) => x.path).filter((p) => /^ppt\/slides\/slide\d+\.xml$/.test(p))
      .sort((a, b) => (+a.replace(/\D+/g, '')) - (+b.replace(/\D+/g, '')));
    if (!rutas.length) throw new Error('la presentación viene sin diapositivas');
    const diapos = [];
    for (const ruta of rutas) {
      const d = xml(await mapa.get(ruta).text());
      const rl = await rels(mapa, ruta);
      const textos = hijos(d, 'sp').map((sp) => hijos(sp, 'p').map((p) => hijos(p, 't').map((t) => t.textContent).join('')).join('\n').trim()).filter(Boolean);
      const imgs = [];
      for (const b of hijos(d, 'blip')) {
        const m = await imagenDe(mapa, rl[attr(b, 'embed')] || '', medios);
        if (m) imgs.push(m);
      }
      diapos.push({ n: diapos.length + 1, textos, imgs });
    }
    return { tipo: 'diapos', diapos };
  }

  /* ---------- texto y csv ---------- */
  // Un csv de verdad: comillas, comas adentro y saltos de línea adentro
  function partirCsv(txt, sep) {
    const filas = [[]];
    let celda = '', comillas = false;
    for (let i = 0; i < txt.length; i++) {
      const c = txt[i];
      if (comillas) {
        if (c === '"' && txt[i + 1] === '"') { celda += '"'; i++; }
        else if (c === '"') comillas = false;
        else celda += c;
      } else if (c === '"') comillas = true;
      else if (c === sep) { filas[filas.length - 1].push(celda); celda = ''; }
      else if (c === '\n') { filas[filas.length - 1].push(celda); celda = ''; filas.push([]); }
      else if (c !== '\r') celda += c;
    }
    filas[filas.length - 1].push(celda);
    while (filas.length && filas[filas.length - 1].every((x) => !x.trim())) filas.pop();
    return filas;
  }
  async function leerTexto(blob, nombre) {
    const txt = await blob.text();
    const e = EXT(nombre);
    if (e === 'csv' || e === 'tsv') {
      const sep = e === 'tsv' ? '\t' : ((txt.split('\n')[0] || '').split(';').length > (txt.split('\n')[0] || '').split(',').length ? ';' : ',');
      const filas = partirCsv(txt, sep);
      const ancho = filas.reduce((a, f) => Math.max(a, f.length), 0);
      filas.forEach((f) => { while (f.length < ancho) f.push(''); });
      return { tipo: 'hoja', hojas: [{ nombre: nombre, filas, imgs: {}, unidas: [], ancho }] };
    }
    if (e === 'json') { try { return { tipo: 'texto', txt: JSON.stringify(JSON.parse(txt), null, 2) }; } catch (x) { /* tal cual */ } }
    return { tipo: 'texto', txt };
  }

  /* ---------- lo que no se sabe abrir: al menos qué trae adentro ---------- */
  const leerLista = (lista) => ({ tipo: 'lista', archivos: lista.map((e) => ({ nombre: e.path, peso: e.size })).sort((a, b) => a.nombre.localeCompare(b.nombre)) });

  /* ---------- la puerta de entrada ---------- */
  async function ver(blob, nombre) {
    const e = EXT(nombre);
    const medios = [];           // las imágenes que se sacaron, para poder soltarlas después
    if (TEXTO.includes(e)) { const r = await leerTexto(blob, nombre); r.medios = medios; return r; }
    const lista = await window.Zip.read(blob);
    const mapa = mapaDe(lista);
    let r;
    try {
      if (e === 'xlsx' || e === 'xlsm') r = await leerHoja(lista, mapa, medios);
      else if (e === 'docx') r = await leerDoc(lista, mapa, medios);
      else if (e === 'pptx') r = await leerDiapos(lista, mapa, medios);
      else r = leerLista(lista);
    } catch (err) {
      // si el documento trae algo raro, al menos se ve lo que hay adentro
      r = leerLista(lista);
      r.aviso = err.message || String(err);
    }
    r.medios = medios;
    return r;
  }
  const soltar = (r) => { (r && r.medios || []).forEach((m) => { try { URL.revokeObjectURL(m.url); } catch (e) { /* nada */ } }); };

  window.Doc = { puedeVer, comoSeLlama, ver, soltar, esc, EXT };
})();
