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
  const TABLES = ['posts', 'comments', 'activity', 'notifications', 'prefs', 'push_subs', 'dispositivos'];
  const LS_KEY = 'crono_db_v1';
  const TOKEN_KEY = 'crono_gh_token';
  const API = 'https://api.github.com';

  /* La clave del equipo se guarda cifrada con una contraseña corta.
     En el archivo publicado solo queda texto ilegible: sin la contraseña no sirve de nada. */
  const b64 = (buf) => btoa(String.fromCharCode(...new Uint8Array(buf)));
  const deB64 = (s) => Uint8Array.from(atob(String(s || '')), (c) => c.charCodeAt(0));
  async function derivar(pass, salt) {
    const base = await crypto.subtle.importKey('raw', new TextEncoder().encode(pass), 'PBKDF2', false, ['deriveKey']);
    return crypto.subtle.deriveKey(
      { name: 'PBKDF2', salt, iterations: 150000, hash: 'SHA-256' },
      base, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']);
  }
  async function cifrar(pass, texto) {
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const k = await derivar(pass, salt);
    const ct = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, k, new TextEncoder().encode(texto));
    return { v: 1, salt: b64(salt), iv: b64(iv), ct: b64(ct) };
  }
  async function descifrar(pass, obj) {
    const k = await derivar(pass, deB64(obj.salt));
    const txt = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: deB64(obj.iv) }, k, deB64(obj.ct));
    return new TextDecoder().decode(txt);
  }

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
    acceso: null,      // sobre cifrado con la clave del equipo, si la administradora lo dejó
    caducada: false,   // la clave dejó de servir
    user: '',
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
      if (r.status === 401) throw new Error('esa clave no es válida o ya venció');
      if (r.status === 403 || r.status === 404) throw new Error('esa clave no da acceso a esta aplicación');
      if (!r.ok) throw new Error('no se pudo comprobar la clave (error ' + r.status + ')');
      const repo = await r.json();
      if (!repo.permissions || !repo.permissions.push) throw new Error('esa clave solo deja mirar, no guardar');
      this.token = tok;
      this.caducada = false;
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
    async init() {
      this.loadToken();
      if (!this.token) await this.buscarAcceso();
      return this.load();
    },
    hayAcceso() { return !!(this.acceso && this.acceso.ct); },
    // Sobre cifrado que dejó la administradora para que el resto solo escriba una contraseña
    async buscarAcceso() {
      const leer = async (url, cab) => {
        const r = await fetch(url, { headers: cab || {}, cache: 'no-store' });
        return r.ok ? r.json() : null;
      };
      try {
        let j = null;
        try {
          const api = await leer(`${this.contentsUrl(this.cfg.access)}?ref=${encodeURIComponent(this.cfg.branch)}`, this.headers());
          if (api && api.content) j = JSON.parse(b64ToUtf8(api.content));
        } catch (e) { /* probamos la copia publicada */ }
        if (!j) j = await leer(this.rawUrl(this.cfg.access) + '?t=' + Date.now());
        if (j && j.ct && j.salt && j.iv) this.acceso = j;
      } catch (e) { /* sin sobre: queda en solo lectura */ }
    },
    // Escribe la contraseña una vez y este teléfono queda listo para siempre
    async entrarConContrasena(pass) {
      if (!this.hayAcceso()) throw new Error('todavía no hay una entrada preparada');
      let clave = '';
      try { clave = await descifrar(String(pass || ''), this.acceso); }
      catch (e) { throw new Error('esa contraseña no es'); }
      await this.setToken(clave);
      return true;
    },
    // La administradora deja preparada la entrada para el resto del equipo
    async prepararAcceso(pass) {
      if (!this.token) throw new Error('primero necesitas tu propia clave');
      if (String(pass || '').length < 4) throw new Error('usa una contraseña de al menos 4 letras');
      const sobre = await cifrar(String(pass), this.token);
      sobre.at = new Date().toISOString();
      await this.putJson(this.cfg.access, sobre);
      this.acceso = sobre;
    },
    async quitarAcceso() {
      const r = await fetch(`${this.contentsUrl(this.cfg.access)}?ref=${encodeURIComponent(this.cfg.branch)}`, { headers: this.headers(), cache: 'no-store' });
      if (!r.ok) { this.acceso = null; return; }
      const j = await r.json();
      await fetch(this.contentsUrl(this.cfg.access), {
        method: 'DELETE', headers: Object.assign({ 'Content-Type': 'application/json' }, this.headers()),
        body: JSON.stringify({ message: 'Cronograma: quita la entrada del equipo', sha: j.sha, branch: this.cfg.branch })
      });
      this.acceso = null;
    },
    async putJson(path, obj) {
      let sha = null;
      try {
        const r = await fetch(`${this.contentsUrl(path)}?ref=${encodeURIComponent(this.cfg.branch)}`, { headers: this.headers(), cache: 'no-store' });
        if (r.ok) sha = (await r.json()).sha;
      } catch (e) { /* no existía */ }
      const body = { message: 'Cronograma: ' + path, content: utf8ToB64(JSON.stringify(obj, null, 1)), branch: this.cfg.branch };
      if (sha) body.sha = sha;
      const r2 = await fetch(this.contentsUrl(path), {
        method: 'PUT', headers: Object.assign({ 'Content-Type': 'application/json' }, this.headers()), body: JSON.stringify(body)
      });
      if (!r2.ok) {
        let msg = 'no se pudo guardar (' + r2.status + ')';
        try { const e = await r2.json(); if (e.message) msg = e.message; } catch (e) { /* sin detalle */ }
        throw new Error(msg);
      }
    },
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
        if (!raw.ok) throw new Error('no se pudieron leer los datos (error ' + r.status + ')');
        this.db = this.normalizeDb(await raw.json());
        return clone(this.db);
      }
      if (!r.ok) throw new Error('no se pudieron leer los datos (error ' + r.status + ')');
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
    // Lo que subió otra persona (o yo desde otro aparato) después de que copié la pieza
    // no se pisa al guardar: los interactivos nuevos se conservan.
    fusionar(t, previo, nuevo) {
      if (t !== 'posts' || !previo || !Array.isArray(previo.artefactos) || !previo.artefactos.length) return nuevo;
      const mios = Array.isArray(nuevo.artefactos) ? nuevo.artefactos : [];
      const ids = new Set(mios.map((x) => x && x.id));
      const faltan = previo.artefactos.filter((x) => x && !ids.has(x.id) && String(x.at || '') > String(nuevo.updatedAt || ''));
      return faltan.length ? Object.assign({}, nuevo, { artefactos: mios.concat(faltan) }) : nuevo;
    },
    async put(t, o) {
      const a = this.db[t];
      const i = a.findIndex((x) => x.id === o.id);
      if (i >= 0) { o = this.fusionar(t, a[i], o); a[i] = clone(o); } else a.unshift(clone(o));
      if (!this.token) throw new Error('modo solo lectura');
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
          if (i >= 0) a[i] = this.fusionar(t, a[i], row); else a.unshift(row);
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
      let msg = 'error ' + r.status;
      try { const e = await r.json(); if (e.message) msg = e.message; } catch (e) { /* sin detalle */ }
      if (r.status === 401 || r.status === 403) { this.caducada = true; msg = 'la clave de acceso ya no sirve'; }
      throw new Error(msg);
    },

    /* --- archivos --- */
    async upload(file, opts = {}) {
      if (!this.token) throw new Error('modo solo lectura: no se pueden subir archivos');
      const max = 24 * 1024 * 1024;
      const small = await resize(file, 1800, 0.84);
      let blob = small || file;
      // Una foto que sigue pesando demasiado se achica un poco más, hasta que entre
      if (blob.size > max && /^image\//.test(file.type || '')) {
        for (const [lado, calidad] of [[1600, 0.78], [1280, 0.72], [1024, 0.66]]) {
          const otra = await resize(file, lado, calidad);
          if (otra && otra.size < blob.size) blob = otra;
          if (blob.size <= max) break;
        }
      }
      if (blob.size > max) throw new Error('pesa más de 24 MB y no se pudo achicar; súbelo a Drive y pega el enlace');
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
        let msg = 'error ' + r.status;
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
    /* Artefactos: carpetas completas que se reemplazan al actualizarlas.
       A diferencia de upload(), aquí la ruta es exacta: si ya había algo, se reemplaza. */
    async shaDe(path) {
      try {
        const r = await fetch(`${this.contentsUrl(path)}?ref=${encodeURIComponent(this.cfg.branch)}`, { headers: this.headers(), cache: 'no-store' });
        if (!r.ok) return '';
        const j = await r.json();
        return j.sha || '';
      } catch (e) { return ''; }
    },
    async putPath(path, blob, mensaje, shaPrevio) {
      if (!this.token) throw new Error('modo solo lectura: no se pueden subir archivos');
      if (blob.size > 24 * 1024 * 1024) throw new Error('“' + path.split('/').pop() + '” pesa más de 24 MB');
      const body = { message: mensaje || ('Cronograma: ' + path), content: await toBase64(blob), branch: this.cfg.branch };
      const sha = shaPrevio || await this.shaDe(path);
      if (sha) body.sha = sha;
      const r = await fetch(this.contentsUrl(path), {
        method: 'PUT', headers: Object.assign({ 'Content-Type': 'application/json' }, this.headers()), body: JSON.stringify(body)
      });
      if (!r.ok) {
        let msg = 'error ' + r.status;
        try { const e = await r.json(); if (e.message) msg = e.message; } catch (e) { /* sin detalle */ }
        throw new Error(msg);
      }
      const j = await r.json();
      return { path, url: this.rawUrl(path), sha: j.content && j.content.sha, size: blob.size };
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
      files: g.FILES || 'archivos',
      access: g.ACCESS || 'datos/acceso.json'
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
