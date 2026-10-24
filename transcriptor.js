/* ============================================================
   Transcribe los audios en segundo plano (un "worker"), para que
   la pantalla nunca se trabe mientras el modelo escucha.
   Lo usa app.js; no se abre directamente.
   ============================================================ */
import { pipeline, env } from 'https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.7.6/dist/transformers.min.js';

env.allowLocalModels = false;
let asr = null;
const vistos = {};

async function modelo() {
  if (!asr) {
    asr = pipeline('automatic-speech-recognition', 'Xenova/whisper-base', {
      dtype: 'q8',
      progress_callback: (p) => {
        if (p.status !== 'progress' || !p.total) return;
        vistos[p.file] = [p.loaded, p.total];
        const v = Object.values(vistos);
        self.postMessage({ tipo: 'progreso', pct: Math.round(100 * v.reduce((a, x) => a + x[0], 0) / v.reduce((a, x) => a + x[1], 0)) });
      }
    });
  }
  try { return await asr; } catch (e) { asr = null; throw e; }
}

self.onmessage = async (e) => {
  const { id, audio } = e.data || {};
  try {
    const t = await modelo();
    self.postMessage({ tipo: 'escuchando', id });
    const r = await t(audio, { language: 'spanish', task: 'transcribe', chunk_length_s: 30, stride_length_s: 5 });
    self.postMessage({ tipo: 'listo', id, texto: String((r && r.text) || '').trim() });
  } catch (err) {
    self.postMessage({ tipo: 'error', id, error: String((err && err.message) || err) });
  }
};
