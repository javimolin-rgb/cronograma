/* ============================================================
   Lee una conversación de WhatsApp pegada como texto y la
   convierte en mensajes ordenados: quién, cuándo, qué dijo,
   qué cambios pidió y qué fotos había.
   Solo entiende el texto; no toca la pantalla ni guarda nada.
   ============================================================ */
(function () {
  'use strict';

  // [05-10-26, 11:43:34] Nombre: mensaje   ·   [5/10/2026, 11:43 p. m.] Nombre: mensaje
  const CABECERA = /^[‎‏‪-‮]*\[(\d{1,2})[-/.](\d{1,2})[-/.](\d{2,4})[,\s]+(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(a\.?\s?m\.?|p\.?\s?m\.?|AM|PM)?\]\s*([^:]{1,60}?):\s?([\s\S]*)$/;
  // Variante sin corchetes:  22/10/26, 15:47 - Nombre: mensaje
  const CABECERA2 = /^[‎‏‪-‮]*(\d{1,2})[-/.](\d{1,2})[-/.](\d{2,4})[,\s]+(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(a\.?\s?m\.?|p\.?\s?m\.?|AM|PM)?\s[-–]\s([^:]{1,60}?):\s?([\s\S]*)$/;

  const SISTEMA = [
    /cifrados de extremo a extremo/i, /creó este grupo/i, /te añadió/i, /añadió a/i, /salió del grupo/i,
    /cambió (la imagen|el asunto|la descripción) /i, /Cambiaste (la descripción|el asunto)/i,
    /se eliminó este mensaje/i, /eliminaste este mensaje/i, /este mensaje fue eliminado/i,
    /^‎?(Llamada|Videollamada)/i, /llamada perdida/i, /se respondió en otro dispositivo/i,
    /cambió a un nuevo número/i, /^\s*$/
  ];

  // Adjuntos: el que exporta con archivos y el que los omite
  const ADJUNTO = /<(?:adjunto|attached):\s*([^>]+)>/i;
  // Android: "IMG-20261022-WA0003.jpg (archivo adjunto)"
  const ADJUNTO2 = /([^\s<>:"/\\|?*]+\.[a-z0-9]{2,4})\s*\((?:archivo adjunto|file attached)\)/i;
  const OMITIDO = [
    [/imagen omitida|image omitted/i, 'imagen'],
    [/(?:^|\s)video omitido|video omitted/i, 'video'],
    [/audio omitido|audio omitted|mensaje de voz/i, 'audio'],
    [/sticker omitido|sticker omitted/i, 'sticker'],
    [/(?:documento|archivo) omitido|document omitted/i, 'documento'],
    [/gif omitido/i, 'imagen'],
    [/contacto omitido|\.vcf\b/i, 'contacto']
  ];
  const EXT_TIPO = {
    jpg: 'imagen', jpeg: 'imagen', png: 'imagen', webp: 'imagen', heic: 'imagen', gif: 'imagen',
    mp4: 'video', mov: 'video', webm: 'video', '3gp': 'video',
    opus: 'audio', ogg: 'audio', m4a: 'audio', mp3: 'audio', wav: 'audio', aac: 'audio', amr: 'audio',
    pdf: 'documento', zip: 'documento', xlsx: 'documento', docx: 'documento', pptx: 'documento',
    ai: 'documento', psd: 'documento', indd: 'documento', vcf: 'contacto'
  };
  // "Carpeta_Neorigen_propuestas.pdf • 30 páginas"
  const NOMBRE_DOC = /([\w\-. áéíóúñÁÉÍÓÚÑ()]+\.(pdf|zip|xlsx|docx|pptx|ai|psd|indd|png|jpe?g|mp4|mov))\s*(?:•|•)?/i;

  // Lo que suena a cambio pedido
  const PIDE = /\b(cambi[ae]|cámbi|sac[ae]r?|saqu|quit[ae]|elimin|borr[ae]|agrand|achic|agreg|sum[ae]|pon(?:er|le|go)?|mov[ei]|ajust|corrig|corrij|arregl|reemplaz|deja(?:r|lo|la)?|sub[ei]r?|baj[ae]|falta|revis|prueb|afin|mejor|repon|modific|actualiz|invert|voltea|recort|destac|resalt)\w*\b/i;
  const CORTESIA = /\b(porfa|por favor|porfis|ideal|podr[íi]as|puedes|ser[íi]a bueno|me gustar[íi]a|te tinca|tendr[íi]as)\b/i;
  const INDICA = /\b(en vez de|en lugar de|mejor (?:poner|dejar|usar|con|sin)|va (?:primero|al final|antes|despu[ée]s|arriba|abajo)|sin (?:el|la|los|las)|m[áa]s (?:grande|chico|peque|arriba|abajo|corto|largo|claro|oscuro))\b/i;
  const APRUEBA = /\b(aprobad[ií]simo|aprobad[oa]|estamos ok|est[áa] (?:todo )?ok|todo ok|qued[óo] (?:perfecto|increíble)|me encanta|me encantó|perfect|d[áa]le|publ[íi]ca|subelo|súbelo|listo para (?:subir|publicar)|vamos con (?:ese|esa|ella|él))\b/i;
  const URL_RE = /https?:\/\/[^\s<>"']+/gi;
  const PUBLICA = /\b(ya (?:est[áa] )?publicad[oa]|lo publiqu[ée]|la publiqu[ée]|qued[óo] publicad[oa]|ya (?:lo|la) sub[íi]|ya est[áa] (?:arriba|en el feed|en instagram)|est[áa] programad[oa]|qued[óo] programad[oa])\b/i;

  const limpio = (s) => String(s || '').replace(/[‎‏‪-‮﻿]/g, '').trim();

  function fecha(d, m, y, hh, mm, ss, ampm) {
    d = +d; m = +m; y = +y; hh = +hh; mm = +mm; ss = +(ss || 0);
    if (y < 100) y += 2000;
    if (ampm) {
      const pm = /p/i.test(ampm);
      if (pm && hh < 12) hh += 12;
      if (!pm && hh === 12) hh = 0;
    }
    // En Chile se escribe día-mes-año; si el primer número no puede ser día, se invierte
    if (d > 12 && m <= 12) { /* día-mes, como corresponde */ }
    else if (m > 12 && d <= 12) { const t = d; d = m; m = t; }
    const f = new Date(y, m - 1, d, hh, mm, ss);
    return isNaN(f) ? null : f;
  }

  function tipoAdjunto(texto) {
    const m = texto.match(ADJUNTO) || texto.match(ADJUNTO2);
    if (m) {
      const nombre = m[1].trim();
      const ext = (nombre.split('.').pop() || '').toLowerCase();
      return { kind: EXT_TIPO[ext] || 'documento', name: nombre, presente: true };
    }
    for (const [re, kind] of OMITIDO) {
      if (re.test(texto)) {
        const n = texto.match(NOMBRE_DOC);
        return { kind, name: n ? n[1].trim() : '', presente: false };
      }
    }
    const n = texto.match(NOMBRE_DOC);
    if (n) {
      const ext = (n[1].split('.').pop() || '').toLowerCase();
      return { kind: EXT_TIPO[ext] || 'documento', name: n[1].trim(), presente: false };
    }
    return null;
  }

  function esSistema(t) { return SISTEMA.some((re) => re.test(t)); }

  function parse(texto) {
    const lineas = String(texto || '').split(/\r?\n/);
    const msgs = [];
    let actual = null;
    for (const linea of lineas) {
      const m = linea.match(CABECERA) || linea.match(CABECERA2);
      if (m) {
        if (actual) msgs.push(actual);
        const f = fecha(m[1], m[2], m[3], m[4], m[5], m[6], m[7]);
        actual = { autor: limpio(m[8]), texto: limpio(m[9]), fecha: f };
      } else if (actual) {
        actual.texto = (actual.texto + '\n' + limpio(linea)).trim();
      }
    }
    if (actual) msgs.push(actual);

    return msgs.filter((x) => x.fecha).map((x, i) => {
      const adj = tipoAdjunto(x.texto);
      let texto = x.texto;
      if (adj) {
        texto = texto.replace(ADJUNTO, '').replace(ADJUNTO2, '').replace(NOMBRE_DOC, '');
        OMITIDO.forEach(([re]) => { texto = texto.replace(re, ''); });
        texto = texto.replace(/[••]\s*\d+\s*(páginas?|hojas?|pages?)/i, '').replace(/\s{2,}/g, ' ').trim();
      }
      const enlaces = (x.texto.match(URL_RE) || []).map((u) => u.replace(/[),.]+$/, ''));
      const pide = !!(texto && (PIDE.test(texto) || CORTESIA.test(texto) || INDICA.test(texto))) && texto.length < 420;
      return {
        id: 'wa' + i,
        at: x.fecha.toISOString(),
        dia: x.fecha.getFullYear() + '-' + String(x.fecha.getMonth() + 1).padStart(2, '0') + '-' + String(x.fecha.getDate()).padStart(2, '0'),
        hora: String(x.fecha.getHours()).padStart(2, '0') + ':' + String(x.fecha.getMinutes()).padStart(2, '0'),
        autor: x.autor,
        texto,
        adjunto: adj,
        enlaces,
        pide,
        aprueba: !!(texto && APRUEBA.test(texto)),
        sistema: esSistema(x.texto) || (!texto && !adj && !enlaces.length)
      };
    });
  }

  // "Macarena Miquel NEO" -> maca   (usa los alias de config.js y, si no, el nombre de pila)
  function mapearAutores(msgs, gente, alias) {
    const tabla = {};
    Object.keys(alias || {}).forEach((k) => { tabla[k.toLowerCase().trim()] = alias[k]; });
    const sinMapear = {};
    msgs.forEach((m) => {
      const bruto = m.autor.toLowerCase().trim();
      let id = tabla[bruto];
      if (!id) {
        const p = gente.find((g) => {
          const n = g.name.toLowerCase();
          return bruto === n || bruto.startsWith(n + ' ') || bruto.split(/\s+/).includes(n);
        });
        if (p) id = p.id;
      }
      if (!id) {
        const p = gente.find((g) => bruto.replace(/[^a-záéíóúñ ]/g, '').includes(g.name.toLowerCase().slice(0, 4)));
        if (p) id = p.id;
      }
      m.persona = id || null;
      if (!id) sinMapear[m.autor] = (sinMapear[m.autor] || 0) + 1;
    });
    return sinMapear;
  }

  /* ---------- filtro: deja solo lo técnico, dicho de forma objetiva ---------- */
  const EMOJI = /[\p{Extended_Pictographic}\u{1F1E6}-\u{1F1FF}\u{1F3FB}-\u{1F3FF}‍️⃣]/gu;
  const ELOGIO = /\b(te pasaste|qu[ée] sec[oa]|incre[íi]ble|maravill|precios|lind[oa]s?\b|hermos|bell[oa]s?\b|genial|buen[íi]sim|excelente|espectacular|at[óo]mic|bac[áa]n|wow|guau|me encant|me fascin|me gust[aó](?: (?:mucho|harto|caleta))?|(?:est[áa]|qued[óo]|va) (?:quedando )?(?:muy |s[úu]per )?(?:bien|lind|incre[íi]ble|precios|bacan|hermos|ideal)|felicit|bravo|crack|lo m[áa]ximo|te embalaste|s[úu]per\b|top\b|amo\b|qu[ée] bueno|buen trabajo|impecable|lujo|filete|la raja|demasiado bueno)/i;
  const GRACIAS = /\b(gracias|grax|gx|thanks|thx|te pasaste)\b/i;
  const RISA = /\b(?:j[aeiou]){2,}j?\b|\bjsj\w*|\blol\b|\bxd\b/gi;
  const RELLENO = /\b(porfa(?:vor)?|porfis|por favor|plis|pls|cachai|po|oye|ya)\b[,]?/gi;
  const VOCATIVO = /^(?:(?:hol+[aie]+s?|buen[oa]s(?: d[íi]as| tardes| noches)?|hey|ok(?:ey)?|ya|ok?)\b[\s,!.:-]*)*(?:(?:javi|javiera|maca|macarena|flavio|chiquill[oa]s|equipo)\b[\s,!.:-]*)?/i;
  const PROMESA = /\b(estoy (?:afuera|abajo|llegando|en camino|saliendo)|voy (?:en camino|saliendo|llegando)|(?:ya )?(?:llegu[ée]|llego)|ya voy|te llamo|me llamas|hablamos|nos vemos|te escribo|te mando (?:un )?audio|te comento|te cuento|te aviso|lo reviso|lo veo|lo vemos|lo conversamos|cualquier cosa|estuve revisando|estoy revisando|ahora lo veo|despu[ée]s lo veo)(?![\wáéíóúñ])/i;
  const SOLO_OK = /^(ok|okey|oka|vale|dale|listo|si|sí|ya|bueno|perfecto|genial|de una)$/i;
  const ABREV = [[/\bq\b/gi, 'que'], [/\bxq\b/gi, 'porque'], [/\bpq\b/gi, 'porque'], [/\btb\b/gi, 'también'], [/\btmb\b/gi, 'también'], [/\bx\s+favor\b/gi, 'por favor'], [/\bpa\b/gi, 'para'], [/\bk\b/gi, 'que']];

  // ¿Esta frase trae información de trabajo? (un pedido, una pregunta, un dato)
  const tieneContenido = (f) => PIDE.test(f) || INDICA.test(f) || /\?$/.test(f) ||
    /\d|\b(foto|l[áa]mina|texto|copy|t[íi]tulo|logo|color|letra|fondo|portada|p[áa]gina|bot[óo]n|formulario|archivo|precio|fecha|imprenta|render|video|reel|carrusel|link|enlace)\b/i.test(f);

  function objetivar(texto) {
    let t = String(texto || '').replace(/[‎‏‪-‮﻿]/g, '').replace(EMOJI, ' ');
    t = t.replace(/([a-záéíóúñ])\1{2,}/gi, '$1');            // "Guaaaauuuu" -> "Guau"
    ABREV.forEach(([re, s]) => { t = t.replace(re, s); });
    let aprueba = false;
    const frases = [];
    // Separa por frases (respetando las preguntas) y, dentro de cada una, por comas
    (t.match(/[^.!?¡¿\n]+[.!?\n]*/g) || []).forEach((bruta) => {
      const pregunta = /\?/.test(bruta);
      const partes = bruta.replace(/[.!?\n]+$/g, '').split(/,\s*/).map((c) => {
        let x = c.replace(RISA, ' ').replace(RELLENO, ' ').replace(/\s{2,}/g, ' ').trim();
        x = x.replace(VOCATIVO, '').trim();
        return x;
      }).filter((x) => {
        if (!x || x.length < 2) return false;
        if (SOLO_OK.test(x)) return false;
        if (PROMESA.test(x) && !/\d|\bfoto|l[áa]mina/i.test(x)) return false;
        if (!tieneContenido(x) && APRUEBA.test(x)) { aprueba = true; return false; }
        if (/\baprobad/i.test(x) && !PIDE.test(x)) { aprueba = true; return false; }
        if (!tieneContenido(x) && (ELOGIO.test(x) || GRACIAS.test(x))) return false;
        return true;
      }).map((x) => x.replace(new RegExp('(?:\\s+y)?\\s*' + ELOGIO.source + '[\\wáéíóú]*', 'gi'), '').replace(/^y\s+/i, '')
        .replace(/\b(funciona|funcionando|anda|andando)\s+perfect\w*/gi, '$1 correctamente').replace(/^esta\b/i, 'Está')
        .replace(GRACIAS, '').replace(/\s{2,}/g, ' ').trim()).filter(Boolean);
      if (!partes.length) return;
      let f = partes.join(', ');
      f = f.charAt(0).toUpperCase() + f.slice(1);
      frases.push(pregunta ? '¿' + f.replace(/^¿/, '') + '?' : f + '.');
    });
    let out = frases.join(' ').replace(/\s+([.,?])/g, '$1').replace(/\.{2,}/g, '.').trim();
    if (!out && aprueba) out = 'Aprobado.';
    return { texto: out, charla: !out, aprueba };
  }

  // Palabras importantes de un texto, para comparar si dos mensajes hablan de lo mismo
  const VACIAS = new Set('para como esta este esto pero porque cuando donde sobre entre desde hasta tiene tienen hacer puede quizas tambien solo todo todos todas cada otra otro otras otros mismo misma algo bien mejor mucho poco quiero creo seria ideal tipo casa casas neorigen hola gracias muchas javi maca flavio ahora hoy'.split(' '));
  const sinTilde = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '');
  function palabras(t) {
    return [...new Set(sinTilde(String(t || '').toLowerCase()).split(/[^a-z0-9ñ]+/).filter((w) => w.length > 3 && !VACIAS.has(w)).map((w) => w.replace(/(es|s)$/, '')))];
  }
  function parecido(a, b) {
    const A = palabras(a), B = new Set(palabras(b));
    if (!A.length || !B.size) return 0;
    const comunes = A.filter((w) => B.has(w)).length;
    return comunes / Math.min(A.length, B.size);
  }

  // Corta la conversación en tramos: cuando pasan varias horas sin mensajes, suele ser otro tema
  function tramos(msgs, horas) {
    const lim = (horas || 5) * 3600e3;
    let n = 0, prev = null;
    msgs.forEach((m) => {
      const t = new Date(m.at).getTime();
      if (prev !== null && t - prev > lim) n++;
      m.tramo = n;
      prev = t;
    });
    return n + 1;
  }

  const resumen = (msgs) => ({
    total: msgs.length,
    utiles: msgs.filter((m) => !m.sistema).length,
    cambios: msgs.filter((m) => m.pide && !m.sistema).length,
    fotos: msgs.filter((m) => m.adjunto && m.adjunto.kind === 'imagen').length,
    archivos: msgs.filter((m) => m.adjunto && m.adjunto.kind === 'documento').length,
    desde: msgs.length ? msgs[0].dia : '',
    hasta: msgs.length ? msgs[msgs.length - 1].dia : ''
  });

  // ¿Este mensaje pide un cambio? (sirve también para textos sueltos y audios transcritos)
  const pideCambio = (t) => !!(t && (PIDE.test(t) || CORTESIA.test(t) || INDICA.test(t))) && t.length < 600;

  window.WhatsApp = { parse, mapearAutores, resumen, objetivar, palabras, parecido, tramos, pideCambio, aprueba: (t) => APRUEBA.test(t || ''), publica: (t) => PUBLICA.test(t || '') };
})();
