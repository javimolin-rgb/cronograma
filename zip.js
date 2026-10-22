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

  window.Zip = { make: makeZip, save: saveBlob };
})();
