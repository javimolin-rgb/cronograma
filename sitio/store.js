/* Capa de datos: Supabase (compartido) o localStorage (modo demo). */
(function () {
  'use strict';
  const TABLES = ['posts', 'comments', 'activity', 'notifications', 'prefs', 'push_subs'];
  const LS_KEY = 'crono_db_v1';
  const uid = () => (window.crypto && crypto.randomUUID)
    ? crypto.randomUUID()
    : Date.now().toString(36) + Math.random().toString(36).slice(2, 10);

  // Reduce una imagen y devuelve un Blob JPEG (o null si no se puede)
  function resize(file, max, quality) {
    return new Promise((resolve) => {
      if (!file.type || !file.type.startsWith('image/') || file.type === 'image/svg+xml' ||
          typeof createImageBitmap !== 'function') return resolve(null);
      createImageBitmap(file).then((bmp) => {
        const r = Math.min(1, max / Math.max(bmp.width, bmp.height));
        const c = document.createElement('canvas');
        c.width = Math.max(1, Math.round(bmp.width * r));
        c.height = Math.max(1, Math.round(bmp.height * r));
        c.getContext('2d').drawImage(bmp, 0, 0, c.width, c.height);
        c.toBlob((b) => resolve(b), 'image/jpeg', quality);
      }).catch(() => resolve(null));
    });
  }
  const readDataUrl = (blob) => new Promise((res, rej) => {
    const fr = new FileReader();
    fr.onload = () => res(fr.result);
    fr.onerror = rej;
    fr.readAsDataURL(blob);
  });

  /* ---------- Modo demo (solo este navegador) ---------- */
  const Local = {
    mode: 'local',
    db: null,
    async init() { return this.load(); },
    isFirstRun() { return !localStorage.getItem(LS_KEY); },
    async load() {
      let raw = {};
      try { raw = JSON.parse(localStorage.getItem(LS_KEY)) || {}; } catch (e) { raw = {}; }
      const out = {};
      TABLES.forEach((t) => { out[t] = raw[t] || []; });
      this.db = out;
      return JSON.parse(JSON.stringify(out));
    },
    flush() {
      try { localStorage.setItem(LS_KEY, JSON.stringify(this.db)); }
      catch (e) { throw new Error('El almacenamiento del navegador está lleno'); }
    },
    async put(t, o) {
      const a = this.db[t];
      const i = a.findIndex((x) => x.id === o.id);
      if (i >= 0) a[i] = o; else a.unshift(o);
      this.flush();
    },
    async del(t, id) { this.db[t] = this.db[t].filter((x) => x.id !== id); this.flush(); },
    async upload(file) {
      const blob = await resize(file, 1100, 0.78);
      if (!blob && file.size > 600000) throw new Error('en modo demo solo caben imágenes o archivos chicos');
      const src = blob || file;
      const url = await readDataUrl(src);
      return { url, thumb: url, name: file.name, type: blob ? 'image/jpeg' : file.type, size: src.size };
    },
    subscribe(cb) { window.addEventListener('storage', (e) => { if (e.key === LS_KEY) cb(); }); }
  };

  /* ---------- Supabase ---------- */
  const Sb = {
    mode: 'supabase',
    cfg: null,
    sb: null,
    async init() {
      this.sb = window.supabase.createClient(this.cfg.SUPABASE_URL, this.cfg.SUPABASE_ANON_KEY);
      return this.load();
    },
    async load() {
      const out = {};
      await Promise.all(TABLES.map(async (t) => {
        const { data, error } = await this.sb.from(t).select('id,data')
          .order('created_at', { ascending: false }).limit(t === 'posts' || t === 'prefs' || t === 'push_subs' ? 2000 : 3000);
        if (error) throw error;
        out[t] = data.map((r) => Object.assign({}, r.data, { id: r.id }));
      }));
      return out;
    },
    async put(t, o) {
      const { error } = await this.sb.from(t).upsert({ id: o.id, data: o });
      if (error) throw error;
    },
    async del(t, id) {
      const { error } = await this.sb.from(t).delete().eq('id', id);
      if (error) throw error;
    },
    async upload(file) {
      const bucket = this.cfg.STORAGE_BUCKET || 'media';
      const stamp = Date.now().toString(36) + '-' + uid().slice(0, 6);
      const path = stamp + '-' + file.name.replace(/[^\w.\-]+/g, '_');
      const up = await this.sb.storage.from(bucket).upload(path, file, {
        contentType: file.type || 'application/octet-stream', cacheControl: '31536000'
      });
      if (up.error) throw up.error;
      const url = this.sb.storage.from(bucket).getPublicUrl(path).data.publicUrl;
      let thumb = url;
      const tb = await resize(file, 520, 0.8); // miniatura liviana para el teléfono
      if (tb) {
        const tp = 'thumbs/' + stamp + '.jpg';
        const t = await this.sb.storage.from(bucket).upload(tp, tb, { contentType: 'image/jpeg', cacheControl: '31536000' });
        if (!t.error) thumb = this.sb.storage.from(bucket).getPublicUrl(tp).data.publicUrl;
      }
      return { url, thumb, name: file.name, type: file.type, size: file.size };
    },
    subscribe(cb) {
      this.sb.channel('crono-live')
        .on('postgres_changes', { event: '*', schema: 'public' }, () => cb())
        .subscribe();
    }
  };

  window.Store = {
    uid,
    create(cfg) {
      if (cfg.SUPABASE_URL && cfg.SUPABASE_ANON_KEY && window.supabase) { Sb.cfg = cfg; return Sb; }
      return Local;
    },
    local: Local
  };
})();
