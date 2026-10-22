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
    mp4: 'video', mov: 'video', webm: 'video',
    opus: 'audio', ogg: 'audio', m4a: 'audio', mp3: 'audio', wav: 'audio',
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
    const m = texto.match(ADJUNTO);
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
        texto = texto.replace(ADJUNTO, '').replace(NOMBRE_DOC, '');
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

  const resumen = (msgs) => ({
    total: msgs.length,
    utiles: msgs.filter((m) => !m.sistema).length,
    cambios: msgs.filter((m) => m.pide && !m.sistema).length,
    fotos: msgs.filter((m) => m.adjunto && m.adjunto.kind === 'imagen').length,
    archivos: msgs.filter((m) => m.adjunto && m.adjunto.kind === 'documento').length,
    desde: msgs.length ? msgs[0].dia : '',
    hasta: msgs.length ? msgs[msgs.length - 1].dia : ''
  });

  window.WhatsApp = { parse, mapearAutores, resumen };
})();
