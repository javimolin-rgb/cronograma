/* ============================================================
   Capa de datos.

   - "github": todo vive en este mismo repositorio.
       · los datos  → datos/contenido.json
       · los archivos → archivos/<proyecto>/<archivo>
     Para leer no hace falta nada. Para guardar, cada persona pega
     una vez su llave de GitHub en Ajustes (queda solo en su celular).
   - "local": modo demo, solo en este navegador.
   ============================================================ */
(function () {
  'use strict';
  const TABLES = ['posts', 'comments', 'activity', 'notifications', 'prefs', 'push_subs'];
  const LS_KEY = 'crono_db_v1';
  const TOKEN_KEY = 'crono_gh_token';
  const API = 'https://api.github.com';

  const uid = () => (window.crypto && crypto.randomUUID)
    ? crypto.randomUUID()
    : Date.now().toString(36) + Math.random().toString(36).slice(2, 10);
  const clone = (o) => JSON.parse(JSON.stringify(o));
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  /* ---------- utilidades de archivos ---------- */
  // Achica una imagen grande para no llenar el repositorio
  function resize(file, max, quality) {
    return new Promise((resolve) => {
      if (!file.type || !file.type.startsWith('image/') || file.type === 'image/svg+xml' ||
          typeof createImageBitmap !== 'function') return resolve(null);
      createImageBitmap(file).then((bmp) => {
        if (Math.max(bmp.width, bmp.height) <= max && file.size < 900000) return resolve(null);
        const r = Math.min(1, max / Math.max(bmp.width, bmp.height));
        const c = document.createElement('canvas');
        c.width = Math.max(1, Math.round(bmp.width * r));
        c.height = Math.max(1, Math.round(bmp.height * r));
        c.getContext('2d').drawImage(bmp, 0, 0, c.width, c.height);
        c.toBlob((b) => resolve(b && b.size < file.size ? b : null), 'image/jpeg', quality);
      }).catch(() => resolve(null));
    });
  }
  const readDataUrl = (blob) => new Promise((res, rej) => {
    const fr = new FileReader();
    fr.onload = () => res(fr.result);
    fr.onerror = rej;
    fr.readAsDataURL(blob);
  });
  async function toBase64(blob) {
    const d = await readDataUrl(blob);
    return d.slice(d.indexOf(',') + 1);
  }
  const utf8ToB64 = (s) => {
    const bytes = new TextEncoder().encode(s);
    let bin = '';
    const CH = 0x8000;
    for (let i = 0; i < bytes.length; i += CH) bin += String.fromCharCode.apply(null, bytes.subarray(i, i + CH));
    return btoa(bin);
  };
  const b64ToUtf8 = (b64) => {
    const bin = atob(b64.replace(/\s/g, ''));
    const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0));
    return new TextDecoder().decode(bytes);
  };
  // "Carrusel Fachada ventilada" -> "carrusel-fachada-ventilada"
  const slug = (s, fallback) => {
    const out = String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '')
      .toLowerCase().replace(/[^a-z0-9.\-_ ]+/g, '').trim().replace(/\s+/g, '-').replace(/-+/g, '-').slice(0, 60);
    return out || fallback || 'sin-nombre';
  };
  const safeFileName = (name) => {
    const n = String(name || 'archivo');
    const i = n.lastIndexOf('.');
    const base = i > 0 ? n.slice(0, i) : n;
    const ext = i > 0 ? n.slice(i + 1).toLowerCase().replace(/[^a-z0-9]/g, '') : '';
    return slug(base, 'archivo') + (ext ? '.' + ext : '');
  };

  /* ---------- modo demo (solo este navegador) ---------- */
  const Local = {
    mode: 'local',
    canWrite: true,
    db: null,
    async init() { return this.load(); },
    isFirstRun() { return !localStorage.getItem(LS_KEY); },
    async load() {
      let raw = {};
      try { raw = JSON.parse(localStorage.getItem(LS_KEY)) || {}; } catch (e) { raw = {}; }
      const out = {};
      TABLES.forEach((t) => { out[t] = raw[t] || []; });
      this.db = out;
      return clone(out);
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
      return { url, name: file.name, path: '', type: blob ? 'image/jpeg' : file.type, size: src.size };
    },
    async deleteFile() { /* en demo no hay nada que borrar */ },
    pending() { return false; },
    async flushNow() { /* el modo demo guarda al instante */ },
    subscribe(cb) { window.addEventListener('storage', (e) => { if (e.key === LS_KEY) cb(); }); }
  };

  /* ---------- GitHub (este mismo repositorio) ---------- */
  const Gh = {
    mode: 'github',
    cfg: null,        // { owner, repo, branch, data, files }
    token: '',
    user: '',         // nombre de la cuenta de GitHub, si la llave es válida
    db: null,
    sha: null,        // sha actual de datos/contenido.json
    etag: null,
    dirty: new Set(), // "tabla:id" pendientes de subir
    gone: new Set(),
    saving: false,
    again: false,
    onChange: null,

    get canWrite() { return !!this.token; },

    /* --- llave --- */
    loadToken() { try { this.token = localStorage.getItem(TOKEN_KEY) || ''; } catch (e) { this.token = ''; } },
    async setToken(t) {
      const tok = (t || '').trim();
      if (!tok) throw new Error('Pega la llave');
      const r = await fetch(`${API}/repos/${this.cfg.owner}/${this.cfg.repo}`, { headers: this.headers(tok) });
      if (r.status === 401) throw new Error('La llave no es válida o ya venció');
      if (r.status === 403 || r.status === 404) throw new Error('La llave no tiene acceso a este repositorio');
      if (!r.ok) throw new Error('GitHub respondió ' + r.status);
      const repo = await r.json();
      if (!repo.permissions || !repo.permissions.push) throw new Error('La llave puede leer pero no escribir (necesita permiso de Contenido: lectura y escritura)');
      this.token = tok;
      try { localStorage.setItem(TOKEN_KEY, tok); } catch (e) { /* sin espacio */ }
      try {
        const me = await (await fetch(`${API}/user`, { headers: this.headers(tok) })).json();
        this.user = me.login || '';
      } catch (e) { this.user = ''; }
      return true;
    },
    clearToken() { this.token = ''; this.user = ''; try { localStorage.removeItem(TOKEN_KEY); } catch (e) { /* nada */ } },

    headers(tok) {
      const h = { Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28' };
      const t = tok || this.token;
      if (t) h.Authorization = 'Bearer ' + t;
      return h;
    },
    rawUrl(path) {
      const c = this.cfg;
      return `https://raw.githubusercontent.com/${c.owner}/${c.repo}/${c.branch}/${path.split('/').map(encodeURIComponent).join('/')}`;
    },
    contentsUrl(path) {
      const c = this.cfg;
      return `${API}/repos/${c.owner}/${c.repo}/contents/${path.split('/').map(encodeURIComponent).join('/')}`;
    },

    /* --- lectura --- */
    async init() { this.loadToken(); return this.load(); },
    emptyDb() { const o = {}; TABLES.forEach((t) => { o[t] = []; }); return o; },

    async load() {
      const c = this.cfg;
      const r = await fetch(`${this.contentsUrl(c.data)}?ref=${encodeURIComponent(c.branch)}`, {
        headers: Object.assign(this.headers(), this.etag ? { 'If-None-Match': this.etag } : {}),
        cache: 'no-store'
      });
      if (r.status === 304) return clone(this.db || this.emptyDb());
      if (r.status === 404) { // todavía no existe el archivo de datos
        this.sha = null;
        this.db = this.emptyDb();
        return clone(this.db);
      }
      if (r.status === 403 && !this.token) {
        // Se acabaron las consultas sin llave: leemos la copia publicada
        const raw = await fetch(this.rawUrl(c.data) + '?t=' + Date.now(), { cache: 'no-store' });
        if (!raw.ok) throw new Error('No se pudo leer los datos (GitHub respondió ' + r.status + ')');
        this.db = this.normalizeDb(await raw.json());
        return clone(this.db);
      }
      if (!r.ok) throw new Error('No se pudo leer los datos (GitHub respondió ' + r.status + ')');
      this.etag = r.headers.get('ETag');
      const j = await r.json();
      this.sha = j.sha;
      let text;
      if (j.content) text = b64ToUtf8(j.content);
      else text = await (await fetch(j.download_url, { cache: 'no-store' })).text();
      let parsed = {};
      try { parsed = JSON.parse(text); } catch (e) { throw new Error('El archivo de datos está dañado'); }
      this.db = this.normalizeDb(parsed);
      return clone(this.db);
    },
    normalizeDb(o) {
      const out = {};
      TABLES.forEach((t) => { out[t] = Array.isArray(o && o[t]) ? o[t] : []; });
      return out;
    },

    /* --- escritura --- */
    async put(t, o) {
      const a = this.db[t];
      const i = a.findIndex((x) => x.id === o.id);
      if (i >= 0) a[i] = clone(o); else a.unshift(clone(o));
      if (!this.token) throw new Error('solo lectura: agrega tu llave de GitHub en Ajustes');
      this.dirty.add(t + ':' + o.id);
      this.gone.delete(t + ':' + o.id);
      this.queueSave(); // se sube en segundo plano, junto con los demás cambios
    },
    async del(t, id) {
      this.db[t] = this.db[t].filter((x) => x.id !== id);
      if (!this.token) throw new Error('solo lectura: agrega tu llave de GitHub en Ajustes');
      this.dirty.delete(t + ':' + id);
      this.gone.add(t + ':' + id);
      this.queueSave();
    },
    pending() { return this.saving || this.dirty.size > 0 || this.gone.size > 0; },
    queueSave() {
      if (this.saving) { this.again = true; return this.savingPromise; }
      this.saving = true;
      this.savingPromise = (async () => {
        try {
          do {
            this.again = false;
            await sleep(600); // junta todos los cambios seguidos en un solo commit
            await this.commit();
          } while (this.again || this.dirty.size || this.gone.size);
        } catch (e) {
          if (this.onError) this.onError(e); else console.error(e);
        } finally { this.saving = false; }
      })();
      return this.savingPromise;
    },
    async flushNow() { if (this.pending()) { this.again = true; await this.queueSave(); } },
    // Vuelve a traer la versión del repositorio y le aplica encima lo que cambié yo
    async rebase() {
      const mine = {};
      this.dirty.forEach((k) => {
        const i = k.indexOf(':'), t = k.slice(0, i), id = k.slice(i + 1);
        const row = (this.db[t] || []).find((x) => x.id === id);
        if (row) (mine[t] = mine[t] || []).push(clone(row));
      });
      const gone = [...this.gone];
      this.etag = null;
      await this.load();
      Object.keys(mine).forEach((t) => {
        mine[t].forEach((row) => {
          const a = this.db[t], i = a.findIndex((x) => x.id === row.id);
          if (i >= 0) a[i] = row; else a.unshift(row);
        });
      });
      gone.forEach((k) => {
        const i = k.indexOf(':'), t = k.slice(0, i), id = k.slice(i + 1);
        this.db[t] = (this.db[t] || []).filter((x) => x.id !== id);
      });
    },
    async commit(intento = 0) {
      if (!this.dirty.size && !this.gone.size) return;
      const body = {
        message: 'Cronograma: cambios desde la app',
        content: utf8ToB64(JSON.stringify(this.db, null, 1)),
        branch: this.cfg.branch
      };
      if (this.sha) body.sha = this.sha;
      const r = await fetch(this.contentsUrl(this.cfg.data), {
        method: 'PUT', headers: Object.assign({ 'Content-Type': 'application/json' }, this.headers()), body: JSON.stringify(body)
      });
      if (r.ok) {
        const j = await r.json();
        this.sha = j.content && j.content.sha;
        this.etag = null;
        this.dirty.clear(); this.gone.clear();
        return;
      }
      if ((r.status === 409 || r.status === 422) && intento < 4) { // alguien guardó antes: reintentamos sobre lo suyo
        await sleep(400 + intento * 600);
        await this.rebase();
        return this.commit(intento + 1);
      }
      let msg = 'GitHub respondió ' + r.status;
      try { const e = await r.json(); if (e.message) msg = e.message; } catch (e) { /* sin detalle */ }
      if (r.status === 401) msg = 'la llave no es válida o ya venció';
      if (r.status === 403) msg = 'la llave no tiene permiso para escribir en el repositorio';
      throw new Error(msg);
    },

    /* --- archivos --- */
    async upload(file, opts = {}) {
      if (!this.token) throw new Error('agrega tu llave de GitHub en Ajustes para poder subir archivos');
      const max = 24 * 1024 * 1024;
      const small = await resize(file, 1800, 0.84);
      const blob = small || file;
      if (blob.size > max) throw new Error('pesa más de 24 MB; súbelo a Drive y pega el enlace');
      const dir = this.cfg.files + '/' + slug(opts.dir, 'general');
      const name = safeFileName(opts.name || file.name);
      const path = await this.freePath(dir, name);
      const body = {
        message: 'Cronograma: ' + path,
        content: await toBase64(blob),
        branch: this.cfg.branch
      };
      const r = await fetch(this.contentsUrl(path), {
        method: 'PUT', headers: Object.assign({ 'Content-Type': 'application/json' }, this.headers()), body: JSON.stringify(body)
      });
      if (!r.ok) {
        let msg = 'GitHub respondió ' + r.status;
        try { const e = await r.json(); if (e.message) msg = e.message; } catch (e) { /* sin detalle */ }
        throw new Error(msg);
      }
      const j = await r.json();
      return {
        name: opts.name || file.name,
        path,
        url: this.rawUrl(path),
        sha: j.content && j.content.sha,
        type: small ? 'image/jpeg' : (file.type || 'application/octet-stream'),
        size: blob.size,
        blobUrl: URL.createObjectURL(blob) // para verlo al instante, antes de que GitHub lo publique
      };
    },
    // Si ya existe un archivo con ese nombre, le agrega -2, -3…
    async freePath(dir, name) {
      const i = name.lastIndexOf('.');
      const base = i > 0 ? name.slice(0, i) : name;
      const ext = i > 0 ? name.slice(i) : '';
      for (let n = 1; n < 50; n++) {
        const path = dir + '/' + base + (n > 1 ? '-' + n : '') + ext;
        const r = await fetch(`${this.contentsUrl(path)}?ref=${encodeURIComponent(this.cfg.branch)}`, { headers: this.headers(), cache: 'no-store' });
        if (r.status === 404) return path;
        if (!r.ok && r.status !== 200) return path; // si no podemos comprobar, seguimos igual
      }
      return dir + '/' + Date.now() + '-' + name;
    },
    async deleteFile(path, sha) {
      if (!this.token || !path) return;
      let s = sha;
      if (!s) {
        const r = await fetch(`${this.contentsUrl(path)}?ref=${encodeURIComponent(this.cfg.branch)}`, { headers: this.headers() });
        if (!r.ok) return;
        s = (await r.json()).sha;
      }
      await fetch(this.contentsUrl(path), {
        method: 'DELETE', headers: Object.assign({ 'Content-Type': 'application/json' }, this.headers()),
        body: JSON.stringify({ message: 'Cronograma: borra ' + path, sha: s, branch: this.cfg.branch })
      });
    },

    /* --- mantenerse al día --- */
    subscribe(cb) {
      this.onChange = cb;
      const tick = async () => {
        if (document.hidden || this.saving) return;
        try {
          const before = this.sha;
          await this.load();
          if (before !== this.sha) cb();
        } catch (e) { /* sin conexión: reintenta después */ }
      };
      setInterval(tick, this.token ? 45000 : 120000);
    }
  };

  /* ---------- elección del modo ---------- */
  // Si la página está publicada en usuario.github.io/repositorio/, se deduce solo.
  function detectRepo(cfg) {
    const g = cfg.GITHUB || {};
    let owner = g.OWNER || '', repo = g.REPO || '';
    if (!owner || !repo) {
      const m = location.hostname.match(/^([\w.-]+)\.github\.io$/i);
      if (m) {
        owner = owner || m[1];
        const seg = location.pathname.split('/').filter(Boolean);
        repo = repo || (seg.length ? seg[0] : m[1] + '.github.io');
      }
    }
    if (!owner || !repo) return null;
    return {
      owner, repo,
      branch: g.BRANCH || 'main',
      data: g.DATA || 'datos/contenido.json',
      files: g.FILES || 'archivos'
    };
  }

  window.Store = {
    uid, slug, safeFileName,
    create(cfg) {
      const r = detectRepo(cfg);
      if (r && !(cfg.GITHUB && cfg.GITHUB.OFF)) { Gh.cfg = r; return Gh; }
      return Local;
    },
    local: Local,
    github: Gh
  };
})();
