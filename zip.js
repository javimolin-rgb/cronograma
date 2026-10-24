/* ============================================================
   Arma un .zip dentro del navegador (sin comprimir: las imágenes,
   los PDF y los videos ya vienen comprimidos). Sirve para
   "descargar la pieza" o "descargar el proyecto completo".
   ============================================================ */
(function () {
  'use strict';

  const CRC = (() => {
    const t = new Uint32Array(256);
    for (let i = 0; i < 256; i++) {
      let c = i;
      for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1;
      t[i] = c >>> 0;
    }
    return t;
  })();
  function crc32(buf) {
    let c = 0xFFFFFFFF;
    for (let i = 0; i < buf.length; i++) c = CRC[(c ^ buf[i]) & 0xFF] ^ (c >>> 8);
    return (c ^ 0xFFFFFFFF) >>> 0;
  }
  function dosTime(d) {
    const time = ((d.getHours() & 31) << 11) | ((d.getMinutes() & 63) << 5) | ((d.getSeconds() / 2) & 31);
    const date = (((d.getFullYear() - 1980) & 127) << 9) | (((d.getMonth() + 1) & 15) << 5) | (d.getDate() & 31);
    return { time, date };
  }
  const view = (n) => { const b = new Uint8Array(n); return { b, v: new DataView(b.buffer), o: 0 }; };
  const u16 = (w, n) => { w.v.setUint16(w.o, n, true); w.o += 2; };
  const u32 = (w, n) => { w.v.setUint32(w.o, n >>> 0, true); w.o += 4; };
  const raw = (w, a) => { w.b.set(a, w.o); w.o += a.length; };

  // Evita nombres repetidos dentro del zip: informe.pdf, informe (2).pdf…
  function uniqueNames(entries) {
    const seen = new Set();
    return entries.map((e) => {
      let name = String(e.name || 'archivo').replace(/[\\:*?"<>|]+/g, '-').replace(/^\/+/, '');
      if (seen.has(name)) {
        const i = name.lastIndexOf('.');
        const base = i > 0 ? name.slice(0, i) : name;
        const ext = i > 0 ? name.slice(i) : '';
        let n = 2;
        while (seen.has(`${base} (${n})${ext}`)) n++;
        name = `${base} (${n})${ext}`;
      }
      seen.add(name);
      return Object.assign({}, e, { name });
    });
  }

  async function makeZip(entries, onStep) {
    const list = uniqueNames(entries);
    const parts = [], central = [];
    let offset = 0, i = 0;
    const enc = new TextEncoder();

    for (const e of list) {
      if (onStep) onStep(++i, list.length, e.name);
      const data = new Uint8Array(await (e.blob instanceof Blob ? e.blob.arrayBuffer() : Promise.resolve(e.blob)));
      const name = enc.encode(e.name);
      const crc = crc32(data);
      const { time, date } = dosTime(e.date instanceof Date ? e.date : new Date());

      const lh = view(30 + name.length);
      u32(lh, 0x04034b50); u16(lh, 20); u16(lh, 0x0800); u16(lh, 0); u16(lh, time); u16(lh, date);
      u32(lh, crc); u32(lh, data.length); u32(lh, data.length); u16(lh, name.length); u16(lh, 0); raw(lh, name);
      parts.push(lh.b, data);

      const ch = view(46 + name.length);
      u32(ch, 0x02014b50); u16(ch, 20); u16(ch, 20); u16(ch, 0x0800); u16(ch, 0); u16(ch, time); u16(ch, date);
      u32(ch, crc); u32(ch, data.length); u32(ch, data.length);
      u16(ch, name.length); u16(ch, 0); u16(ch, 0); u16(ch, 0); u16(ch, 0); u32(ch, 0); u32(ch, offset);
      raw(ch, name);
      central.push(ch.b);

      offset += lh.b.length + data.length;
    }

    const cdSize = central.reduce((a, c) => a + c.length, 0);
    const end = view(22);
    u32(end, 0x06054b50); u16(end, 0); u16(end, 0); u16(end, list.length); u16(end, list.length);
    u32(end, cdSize); u32(end, offset); u16(end, 0);

    return new Blob(parts.concat(central, [end.b]), { type: 'application/zip' });
  }

  function saveBlob(blob, filename) {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 4000);
  }

  /* ---------- leer un .zip (por ejemplo, un chat exportado de WhatsApp con sus fotos y audios) ---------- */
  // Lee el .zip por partes (sin cargarlo entero en memoria: en iPhone un chat con fotos y videos puede pesar cientos de MB)
  const leer = async (blob, ini, fin) => new DataView(await blob.slice(ini, fin).arrayBuffer());
  async function readZip(blob) {
    const cola = Math.min(blob.size, 65557);
    const t = await leer(blob, blob.size - cola, blob.size);
    // Fin del directorio central: se busca desde el final (puede tener un comentario)
    let fin = -1;
    for (let i = t.byteLength - 22; i >= 0; i--) {
      if (t.getUint32(i, true) === 0x06054b50) { fin = i; break; }
    }
    if (fin < 0) throw new Error('no parece un archivo .zip');
    let total = t.getUint16(fin + 10, true), cdTam = t.getUint32(fin + 12, true), cdIni = t.getUint32(fin + 16, true);
    if (cdIni === 0xFFFFFFFF || total === 0xFFFF) {
      // ZIP64 (archivos de más de 4 GB o más de 65.535 archivos)
      const loc = fin - 20;
      if (loc < 0 || t.getUint32(loc, true) !== 0x07064b50) throw new Error('zip demasiado grande');
      const z = await leer(blob, Number(t.getBigUint64(loc + 8, true)), Number(t.getBigUint64(loc + 8, true)) + 56);
      total = Number(z.getBigUint64(32, true)); cdTam = Number(z.getBigUint64(40, true)); cdIni = Number(z.getBigUint64(48, true));
    }
    const cd = await leer(blob, cdIni, cdIni + cdTam);
    const bytes = new Uint8Array(cd.buffer);
    const utf8 = new TextDecoder('utf-8'), latin = new TextDecoder('latin1');
    const out = [];
    let p = 0;
    for (let k = 0; k < total && p + 46 <= cd.byteLength; k++) {
      if (cd.getUint32(p, true) !== 0x02014b50) break;
      const flags = cd.getUint16(p + 8, true), metodo = cd.getUint16(p + 10, true);
      let comp = cd.getUint32(p + 20, true), tam = cd.getUint32(p + 24, true);
      const ln = cd.getUint16(p + 28, true), le = cd.getUint16(p + 30, true), lc = cd.getUint16(p + 32, true);
      let local = cd.getUint32(p + 42, true);
      const crudo = bytes.subarray(p + 46, p + 46 + ln);
      const nombre = (flags & 0x800) ? utf8.decode(crudo) : (/^[\x00-\x7f]*$/.test(latin.decode(crudo)) ? latin.decode(crudo) : utf8.decode(crudo));
      // Tamaños de ZIP64 en el campo extra
      let x = p + 46 + ln;
      const xfin = x + le;
      while (x + 4 <= xfin) {
        const id = cd.getUint16(x, true), sz = cd.getUint16(x + 2, true);
        if (id === 1) {
          let q = x + 4;
          if (tam === 0xFFFFFFFF) { tam = Number(cd.getBigUint64(q, true)); q += 8; }
          if (comp === 0xFFFFFFFF) { comp = Number(cd.getBigUint64(q, true)); q += 8; }
          if (local === 0xFFFFFFFF) { local = Number(cd.getBigUint64(q, true)); }
        }
        x += 4 + sz;
      }
      p += 46 + ln + le + lc;
      if (nombre.endsWith('/') || /(^|\/)(__MACOSX|\.DS_Store)/.test(nombre)) continue;
      out.push({
        name: nombre.split('/').pop(), path: nombre, size: tam,
        // El contenido se saca recién cuando se pide, y sin copiarlo entero si viene sin comprimir
        async blob(tipo) {
          const h = await leer(blob, local, local + 30);
          const ini = local + 30 + h.getUint16(26, true) + h.getUint16(28, true);
          const datos = blob.slice(ini, ini + comp);
          if (metodo === 0) return new Blob([datos], { type: tipo || '' });
          if (metodo === 8) {
            if (typeof DecompressionStream !== 'function') throw new Error('este navegador no puede abrir archivos .zip comprimidos');
            const s = datos.stream().pipeThrough(new DecompressionStream('deflate-raw'));
            return new Blob([await new Response(s).arrayBuffer()], { type: tipo || '' });
          }
          throw new Error('compresión no soportada en ' + nombre);
        },
        async text() { return utf8.decode(new Uint8Array(await (await this.blob()).arrayBuffer())); }
      });
    }
    return out;
  }

  window.Zip = { make: makeZip, save: saveBlob, read: readZip };
})();
