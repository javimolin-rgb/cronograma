/* Mete en el registro los avisos que se acaban de mandar.

   Se usa cuando el registro no se pudo guardar de primera porque la app guardó
   un cambio en el mismo momento: entonces se vuelve a traer lo último del
   repositorio y se rehace esta anotación encima.

   Juntar dos listas de ids no puede dar conflicto, porque es una unión: lo que
   anotó la app y lo que anotó esta pasada caben los dos. Y repetirlo no hace
   daño: si el id ya estaba, queda igual.

   Importa que esto no falle nunca en silencio: un aviso que sale y no queda
   anotado se vuelve a mandar, y al celular llegan dos notificaciones iguales. */
import fs from 'node:fs';

const REGISTRO = 'datos/avisos-enviados.json';
const MAX_REGISTRO = 3000;
const AHORA = process.env.ENVIADOS_AHORA || '';

const leer = (f, x) => { try { return JSON.parse(fs.readFileSync(f, 'utf8')); } catch { return x; } };

const ahora = AHORA ? leer(AHORA, null) : null;
if (!ahora || !(ahora.enviados || []).length) {
  console.log('No se mandó nada en esta pasada: no hay nada que anotar.');
  process.exit(0);
}

const registro = leer(REGISTRO, { enviados: [], muertos: [] });
const enviados = new Set(registro.enviados || []);
const muertos = new Set(registro.muertos || []);

let faltaban = 0;
for (const id of ahora.enviados) if (!enviados.has(id)) { enviados.add(id); faltaban++; }
for (const id of ahora.muertos || []) muertos.add(id);

fs.writeFileSync(REGISTRO, JSON.stringify({
  enviados: [...enviados].slice(-MAX_REGISTRO),
  muertos: [...muertos].slice(-200)
}, null, 1) + '\n');

console.log(`Anotados ${ahora.enviados.length} avisos de esta pasada (${faltaban} que faltaban) · suscripciones vencidas: ${(ahora.muertos || []).length}`);
