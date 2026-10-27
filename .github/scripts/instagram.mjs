/* Trae el rendimiento de Instagram y lo deja en datos/instagram.json.
   Lo ejecuta GitHub Actions con el token guardado en los secretos del repositorio:
   el token nunca pasa por la página ni por el teléfono de nadie. */
import fs from 'node:fs';

const SALIDA = 'datos/instagram.json';
const TOKEN = process.env.IG_TOKEN;
const USER = process.env.IG_USER_ID || '';   // solo hace falta por el camino de Facebook
const MAX = 60;                               // últimas publicaciones que se miran

if (!TOKEN) {
  console.log('Falta IG_TOKEN en los secretos del repositorio: no se actualiza nada.');
  process.exit(0);
}

const api = async (base, ruta, params = {}) => {
  const u = new URL(base + ruta);
  Object.entries(params).forEach(([k, v]) => v != null && u.searchParams.set(k, v));
  u.searchParams.set('access_token', TOKEN);
  const r = await fetch(u, { headers: { 'User-Agent': 'cronograma-neorigen' } });
  const j = await r.json().catch(() => ({}));
  if (!r.ok || j.error) {
    const e = new Error((j.error && j.error.message) || ('HTTP ' + r.status));
    e.codigo = j.error && j.error.code;
    throw e;
  }
  return j;
};

/* Hay dos formas de conectar una cuenta; probamos la simple primero. */
async function conectar() {
  const CAMPOS = 'id,username,name,followers_count,follows_count,media_count,profile_picture_url';
  try {
    const me = await api('https://graph.instagram.com', '/v21.0/me', { fields: CAMPOS });
    return { base: 'https://graph.instagram.com/v21.0', id: me.id, cuenta: me, via: 'instagram' };
  } catch (e) {
    console.log('Por Instagram directo no se pudo (' + e.message + '). Pruebo por Facebook…');
  }
  let id = USER;
  if (!id) {
    const paginas = await api('https://graph.facebook.com', '/v21.0/me/accounts', { fields: 'instagram_business_account{id,username}' });
    const con = (paginas.data || []).find((p) => p.instagram_business_account);
    if (!con) throw new Error('la cuenta de Instagram no aparece conectada a ninguna página de Facebook');
    id = con.instagram_business_account.id;
  }
  const cuenta = await api('https://graph.facebook.com', '/v21.0/' + id, { fields: CAMPOS });
  return { base: 'https://graph.facebook.com/v21.0', id, cuenta, via: 'facebook' };
}

// Las métricas disponibles cambian según el tipo de publicación; se piden de a poco y se guarda lo que llegue.
const METRICAS = {
  REEL: ['reach', 'likes', 'comments', 'saved', 'shares', 'views', 'total_interactions'],
  VIDEO: ['reach', 'likes', 'comments', 'saved', 'shares', 'views', 'total_interactions'],
  CAROUSEL_ALBUM: ['reach', 'likes', 'comments', 'saved', 'shares', 'total_interactions'],
  IMAGE: ['reach', 'likes', 'comments', 'saved', 'shares', 'total_interactions'],
  STORY: ['reach', 'views', 'replies']
};
async function insights(base, id, tipo, producto) {
  const pedir = METRICAS[producto === 'REELS' ? 'REEL' : (tipo || 'IMAGE')] || METRICAS.IMAGE;
  const out = {};
  // Primero todas juntas; si Meta rechaza alguna, se piden una por una
  try {
    const j = await api(base, `/${id}/insights`, { metric: pedir.join(',') });
    (j.data || []).forEach((m) => { out[m.name] = (m.values && m.values[0] && m.values[0].value) ?? 0; });
    return out;
  } catch (e) { /* vamos una por una */ }
  for (const m of pedir) {
    try {
      const j = await api(base, `/${id}/insights`, { metric: m });
      const v = j.data && j.data[0] && j.data[0].values && j.data[0].values[0];
      if (v) out[m] = v.value ?? 0;
    } catch (e) { /* esa métrica no aplica a esta publicación */ }
  }
  return out;
}

async function resumenCuenta(base, id) {
  const out = {};
  for (const [clave, metric] of [['alcance', 'reach'], ['visitas', 'profile_views'], ['seguidores_nuevos', 'follower_count']]) {
    try {
      const j = await api(base, `/${id}/insights`, { metric, period: 'day', metric_type: 'total_value', since: Math.floor(Date.now() / 1000) - 30 * 86400, until: Math.floor(Date.now() / 1000) });
      const serie = (j.data && j.data[0] && j.data[0].values) || [];
      out[clave] = serie.reduce((a, v) => a + (Number(v.value) || 0), 0) || (j.data && j.data[0] && j.data[0].total_value && j.data[0].total_value.value) || 0;
    } catch (e) { /* la cuenta puede no tener permiso para esta métrica */ }
  }
  return out;
}

try {
  const { base, id, cuenta, via } = await conectar();
  console.log(`Conectado a @${cuenta.username} (${via}), ${cuenta.media_count || '?'} publicaciones.`);

  const medios = [];
  let ruta = `/${id}/media`;
  let params = { fields: 'id,caption,media_type,media_product_type,media_url,thumbnail_url,permalink,timestamp,like_count,comments_count', limit: 50 };
  let pagina = await api(base, ruta, params);
  let lista = pagina.data || [];
  while (lista.length < MAX && pagina.paging && pagina.paging.next) {
    const r = await fetch(pagina.paging.next); pagina = await r.json();
    lista = lista.concat(pagina.data || []);
    if (!pagina.data || !pagina.data.length) break;
  }
  lista = lista.slice(0, MAX);

  for (const m of lista) {
    const ins = await insights(base, m.id, m.media_type, m.media_product_type);
    medios.push({
      id: m.id,
      tipo: m.media_product_type === 'REELS' ? 'REEL' : (m.media_type || ''),
      fecha: m.timestamp,
      permalink: m.permalink,
      miniatura: m.thumbnail_url || m.media_url || '',
      copy: (m.caption || '').slice(0, 300),
      likes: m.like_count ?? ins.likes ?? 0,
      comentarios: m.comments_count ?? ins.comments ?? 0,
      guardados: ins.saved ?? null,
      compartidos: ins.shares ?? null,
      alcance: ins.reach ?? null,
      vistas: ins.views ?? null,
      interacciones: ins.total_interactions ?? null
    });
  }

  const datos = {
    actualizado: new Date().toISOString(),
    cuenta: {
      usuario: cuenta.username || '', nombre: cuenta.name || '',
      seguidores: cuenta.followers_count ?? null, sigue: cuenta.follows_count ?? null,
      publicaciones: cuenta.media_count ?? null, foto: cuenta.profile_picture_url || ''
    },
    resumen30: await resumenCuenta(base, id),
    medios
  };
  fs.mkdirSync('datos', { recursive: true });
  fs.writeFileSync(SALIDA, JSON.stringify(datos, null, 1) + '\n');
  console.log(`Guardadas ${medios.length} publicaciones en ${SALIDA}.`);
} catch (e) {
  console.error('No se pudo actualizar el rendimiento:', e.message);
  if (e.codigo === 190) console.error('El token venció o fue revocado: hay que generar uno nuevo y actualizar el secreto IG_TOKEN.');
  process.exit(1);
}
