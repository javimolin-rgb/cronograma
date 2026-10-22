# Cronograma de contenido — app móvil

Calendario, agenda, tablero y panel de seguimiento. Se instala en la pantalla de inicio como una app y avisa con **notificaciones del celular** cuando te etiquetan o mencionan. Sin correos.

## Qué hay en este repositorio

- **La raíz** (`index.html`, `app.js`, `store.js`, `styles.css`, `config.js`, `sw.js` e iconos) → es el sitio que publica GitHub Pages.
- `supabase/` → se pega solo en Supabase (base de datos y notificaciones). No forma parte de la página.
- `supabase/CLAVES-PRIVADAS.txt` **no se sube**: está en `.gitignore`. Cópialo desde `supabase/CLAVES-PRIVADAS.ejemplo.txt` en tu computador.

Sin configurar nada la app abre en **modo demo** (datos solo en tu navegador, sin notificaciones push).

## Paso 1 · Supabase (base de datos y archivos)

1. supabase.com → **New project**.
2. **SQL Editor → New query** → pega `supabase/setup.sql` → **Run**.
3. **Project Settings → API**: copia **Project URL** y **anon public** y pégalas en `config.js` (`SUPABASE_URL`, `SUPABASE_ANON_KEY`).

## Paso 2 · Enviar las notificaciones (una sola vez)

La página sola no puede avisar a un celular con la app cerrada; una función de Supabase (gratis) lo hace.

1. **Edge Functions → Deploy a new function → Via Editor**. Nombre: `send-push`. Pega el contenido de `supabase/send-push/index.ts` → **Deploy**.
2. **Edge Functions → Secrets** (o Project Settings → Edge Functions): agrega `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY` y `VAPID_SUBJECT`. Si no tienes un par de claves, genéralo una vez con `npx web-push generate-vapid-keys`: la **pública** va además en `config.js` (`PUSH.VAPID_PUBLIC_KEY`) y la **privada** solo aquí. El detalle está en `supabase/CLAVES-PRIVADAS.ejemplo.txt`.
3. **Database → Webhooks → Create a new hook**: tabla `notifications`, evento **Insert**, tipo **Supabase Edge Functions**, función `send-push`, método POST → Confirm.

(Los nombres de los menús pueden variar un poco según la versión del panel de Supabase.)

## Paso 3 · GitHub Pages

1. **Settings → Pages** → *Deploy from a branch* → `main` → `/ (root)` → Save.
2. Queda en `https://TU-USUARIO.github.io/NOMBRE-DEL-REPO/`. Pon esa URL en `SITE_URL` de `config.js`.

## Paso 4 · Instalar y activar avisos en cada celular

- **iPhone (iOS 16.4 o más):** abre la URL en **Safari** → Compartir → **Agregar a pantalla de inicio**. Las notificaciones **solo funcionan si abres la app desde ese ícono**.
- **Android:** abre la URL en Chrome → botón **Instalar** del aviso superior (o menú ⋮ → Instalar app).
- Abre la app, elige quién eres → tu foto → **Ajustes** → **Activar en este celular** → acepta el permiso → **Enviarme una de prueba**.
- En la misma pantalla marcas qué avisos quieres en **App** (campana) y en **Celular** (notificación).

## Uso

- **+** crea una pieza (estado, fecha/hora, plataformas, formato, copy, hashtags, archivos, enlaces, checklist, notas).
- **Etiquetar** a alguien en la pieza o escribir `@Maca` en un comentario → le llega la notificación; al tocarla se abre esa pieza.
- **Tablero:** toca el estado de una tarjeta para moverla (en computador también se arrastra).
- **Panel:** cumplimiento del mes, atrasadas, estancadas, % a tiempo, días promedio idea→publicada, rondas de cambios, carga por persona y actividad.
- El ícono de la app muestra el número de avisos sin leer (donde el celular lo permite).

## Limitaciones

- **No hay contraseña**: el selector “¿Quién eres?” registra autoría y a quién avisar. GitHub Pages gratis exige repo público; cualquiera con el link podría entrar. Para privacidad real, el siguiente paso es agregar inicio de sesión con Supabase.
- Si un celular cambia de persona (Ajustes → Cambiar de persona), las notificaciones pasan a la persona nueva.
- Los avisos de **vencimiento** se ven en la campana de la app, no como notificación del celular.
- Archivos: hasta 50 MB cada uno; el plan gratis de Supabase da 1 GB.
