# Cronograma de contenido — app del equipo Neorigen (léeme)

Calendario, agenda, tablero, **entregas** y panel de seguimiento. Se instala en la pantalla de inicio como una app, con el ícono y los colores de Neorigen, y avisa con notificaciones del celular cuando te etiquetan o mencionan.

**Todo vive en este mismo repositorio**, no hay otro servicio ni cuentas aparte:

- lo que escriben (piezas, comentarios, historial) → `datos/contenido.json`
- los archivos que suben → carpeta `archivos/`, ordenados por proyecto

Es gratis, no se borra y queda enlazado para siempre. Y como es un repositorio de GitHub, cualquier cosa se puede recuperar aunque se borre por error.

## Lo que ya viene cargado

Las entregas de agosto a octubre de 2026 están registradas: diagnóstico y resumen de marca, cotizador y sus tres cambios, el sitio web (maqueta, Wix, textos, portada y formulario), los carruseles de Instagram, el render de la Casa Lingue, las fotos de obra y la carpeta institucional completa, hasta las 50 carpetas impresas. Cada una con su fecha, su proyecto, quién participó, el feedback que les dieron por WhatsApp y los enlaces a la publicación o al Drive.

## Cómo se usa

- **Calendario / Agenda / Tablero**: lo de siempre, para planificar y mover piezas de estado.
- **Entregas**: todo agrupado por proyecto. Desde ahí puedes:
  - **ver** una imagen, un PDF o un video sin salir de la app;
  - **descargar un archivo** suelto;
  - **descargar una pieza completa** o **un proyecto completo** en un `.zip`, con sus carpetas ordenadas;
  - **descargar todo** de una vez;
  - elegir entre **solo la última versión** (lo normal) o **todas las versiones**.
- **Versiones**: si subes dos veces un archivo con el mismo nombre, el segundo queda como `v2` automáticamente. En la app se ve la etiqueta `v2` y puedes volver a cualquier versión anterior.
- **Panel**: cumplimiento del mes, atrasadas, estancadas, % a tiempo, días promedio de idea a publicada, rondas de cambios y carga por persona.

## Importar una conversación de WhatsApp

Está en **Ajustes → Importar conversación de WhatsApp** y solo lo ve Javi (se cambia en `IMPORT_PEOPLE` de `config.js`).

1. En WhatsApp, abre el chat → los tres puntos → **Más** → **Exportar chat** → **Sin archivos**, y mándatelo a ti misma. También sirve seleccionar mensajes y copiarlos.
2. Pega el texto en la app y toca **Leer conversación**.
3. La app lo ordena solo: reconoce quién escribió cada mensaje (Maca, Flavio o tú) y la fecha y hora real, **marca los cambios que te pidieron** y muestra dónde había una foto.
4. Eliges a qué pieza van (te propone una si reconoce de cuál están hablando, o crea una nueva) y desmarcas lo que no quieras.
5. **Las fotos**: copia la foto donde esté (Drive, WhatsApp, el computador) y pégala con Ctrl+V — se va poniendo sola en el siguiente mensaje que tenía foto. En el teléfono, toca **Elegir foto** en ese mensaje.
6. **Importar**.

Queda todo junto en la pieza: los mensajes como comentarios con la cara y el nombre de quien los escribió (lo que dijo Maca aparece como Maca) y con su fecha original, cada foto pegada al comentario que la pidió, y los cambios pedidos convertidos en **pendientes** de la pieza para ir tachándolos.

Si vuelves a importar la misma conversación, los mensajes repetidos salen marcados como *ya importado* y no se duplican.

## Pegar fotos sin descargarlas

Con una pieza abierta, **pega una imagen (Ctrl+V) o arrástrala** y se sube sola al repositorio, sin pasar por la carpeta de descargas. Sirve igual para una captura de pantalla o para una foto copiada desde el Drive.

## Paso 1 · Publicar la página

**Settings → Pages** → *Deploy from a branch* → rama `main` → carpeta `/ (root)` → **Save**.

Queda en `https://javimolin-rgb.github.io/cronograma/`. Esa es la dirección que abren las tres.

## Paso 2 · La llave para poder guardar (una vez por persona)

Sin llave la app se abre igual: se ve todo y se descarga todo, pero no deja escribir. Para crear piezas, comentar o subir archivos, cada una pega su propia llave:

1. En GitHub: foto de perfil → **Settings** → abajo del todo **Developer settings** → **Personal access tokens** → **Fine-grained tokens** → **Generate new token**.
2. Nombre: `cronograma`. Vencimiento: el más largo que te deje (cuando venza, se repite este paso).
3. **Repository access** → *Only select repositories* → elige **cronograma**.
4. **Permissions** → *Repository permissions* → **Contents: Read and write**. Nada más.
5. **Generate token** y copia el texto que aparece (`github_pat_…`). Solo se ve una vez.
6. En la app: tu foto arriba a la derecha → **Ajustes** → **Guardar cambios** → pega la llave → **Guardar**.

La llave queda guardada **solo en ese celular**. Si cambias de teléfono, se repite el paso.

> Para que Flavio y Maca puedan guardar, primero tienen que estar invitados al repositorio: **Settings → Collaborators → Add people**. Si no, verán todo pero no podrán escribir.

## Paso 3 · Notificaciones al celular (opcional)

Esto es lo de las “claves privadas”, explicado de nuevo y más corto.

**Qué son.** Son dos claves que van juntas, como una chapa y su llave:

- la **pública** identifica a esta app ante el celular. Es pública de verdad: ya está escrita en `config.js` y no hay que esconderla.
- la **privada** es la que firma los avisos. Es la única que hay que cuidar: **no se sube al repositorio**, se pega una sola vez en una caja de GitHub que nadie más puede leer.

Ya te generé el par, así que solo tienes que copiar y pegar. (El que está guardado en GitHub es lo único que hace falta; si lo pierdes, se genera otro par y listo.)

**Dónde se pegan.** En tu repositorio: **Settings → Secrets and variables → Actions → New repository secret**. Vas a crear **tres**, uno por uno (nombre arriba, valor abajo, *Add secret*):

| Name | Secret |
|---|---|
| `VAPID_PUBLIC_KEY` | la clave pública (la misma que está en `config.js`) |
| `VAPID_PRIVATE_KEY` | la clave privada (te la paso por chat, no está en el repositorio) |
| `VAPID_SUBJECT` | `https://javimolin-rgb.github.io/cronograma/` |

Después de eso no hay que tocar nada más: cuando alguien te etiqueta, GitHub firma el aviso con esa clave y lo manda al celular. Eso lo hace solo el archivo `.github/workflows/avisos.yml`, que ya está puesto.

**Si alguna vez quieres claves nuevas** (porque crees que la privada se filtró, por ejemplo): en un computador con Node, `npx web-push generate-vapid-keys` te da un par nuevo; la pública va en `config.js` y las tres cajas se actualizan. Al cambiarlas, cada celular tiene que volver a entrar a Ajustes → *Activar en este celular*.

**Para terminar**, en cada celular: **Ajustes → Activar en este celular** → aceptar el permiso → **Enviarme una de prueba**.

Sin este paso todo funciona igual, pero los avisos solo se ven en la campana de la app.

## Paso 4 · Instalarla como app

- **iPhone (iOS 16.4 o más):** abre la dirección en **Safari** → Compartir → **Agregar a pantalla de inicio**. Las notificaciones **solo funcionan abriéndola desde ese ícono**.
- **Android:** ábrela en Chrome → botón **Instalar** del aviso de arriba (o menú ⋮ → Instalar app).

Se ve a pantalla completa, sin barra del navegador, y se adapta sola al ancho de cualquier teléfono.

## Dónde queda cada cosa

| Qué | Dónde |
|---|---|
| Piezas, comentarios, historial, avisos | `datos/contenido.json` |
| Archivos subidos desde la app | `archivos/<proyecto>/<archivo>-v1.jpg` |
| La página | `index.html`, `app.js`, `store.js`, `zip.js`, `whatsapp.js`, `styles.css`, `config.js` |
| Lectura de conversaciones de WhatsApp | `whatsapp.js` |
| Equipo, estados, plataformas y formatos | `config.js` |
| Envío de notificaciones | `.github/workflows/avisos.yml` |

Cada cambio que hacen en la app queda como un commit en el historial del repositorio, así que siempre se puede ver quién cambió qué y volver atrás.

## Cuidados

- **Las conversaciones importadas también quedan públicas.** Antes de importar, desmarca lo que no quieras que se vea (datos de clientes, precios, claves). El repositorio es público.
- **El repositorio es público.** Todo lo que suban (archivos, copys, comentarios) lo puede ver cualquiera que tenga el link. No subas datos de clientes, precios reservados, capturas con nombres o correos, ni contraseñas. Para eso, deja el archivo en el Drive y pega solo el enlace.
- **No hay contraseña para entrar.** El “¿Quién eres?” sirve para registrar autoría y para saber a quién avisar; cualquiera con el link puede abrir la app. Escribir sí requiere llave.
- **Tamaño:** hasta 24 MB por archivo, y conviene no pasar de 1 GB en todo el repositorio. Las fotos muy grandes se achican solas al subirlas. Videos pesados: mejor al Drive y pegar el enlace.
- **Al subir algo, GitHub se demora un poco** (menos de un minuto) en publicar el archivo. En tu celular lo ves al instante igual.
- Si dice **“Guardando…”** abajo, espera un segundo antes de cerrar la app.
