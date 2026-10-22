# Cronograma de contenido — app del equipo Neorigen

Calendario, agenda, tablero, entregas y panel de seguimiento. Se instala en la pantalla de inicio como una app, con el ícono y los colores de Neorigen, y avisa con notificaciones del celular cuando te etiquetan o mencionan.

Funciona sin servicios externos ni cuentas aparte: los datos y los archivos viven junto a la página y quedan enlazados para siempre.

## Lo que ya viene cargado

Las entregas de agosto a octubre de 2026: diagnóstico y resumen de marca, cotizador y sus cambios, el sitio web (maqueta, Wix, textos, portada y formulario), los carruseles de Instagram, el render de la Casa Lingue, las fotos de obra y la carpeta institucional completa hasta las 50 impresas. Cada una con su fecha, su proyecto, quién participó, el feedback que les dieron y los enlaces.

## Qué ve cada uno

- **Flavio y Maca** entran a **Entregas** y ven cada pieza terminada como resultado: el carrusel se desliza con el dedo, con su descripción, sus hashtags y los enlaces. Pueden comentar y descargar la versión final. No ven archivos sueltos, ni versiones, ni carpetas.
- **Javi** ve en esa misma pestaña la carpeta completa: proyectos, piezas, todos los archivos, las versiones anteriores y las descargas en zip.

## Apariencia (cada uno en su teléfono)

En **Ajustes → Apariencia**: colores (según el sistema, claro u oscuro), tamaño de la letra (cuatro tamaños) y qué secciones mostrar en la barra de abajo. Se guarda en ese dispositivo y no le cambia nada a los demás.

## Prompts para la IA (solo Javi)

En cada pieza, el botón **Prompt IA** arma el texto para pedirle los cambios a Gemini, ChatGPT o Claude, usando los pendientes de la pieza y los comentarios del equipo. Detecta solo de qué se trata —editar fotos, generar una imagen, código, copy o diseño de láminas— y se puede cambiar a mano. Desde ahí:

- **Copiar prompt**: el texto al portapapeles.
- **Foto + prompt**: copia la foto *y* el texto juntos, para pegar una sola vez en la IA.
- **ZIP**: la entrega con un `PROMPT.txt` adentro.
- En la cabecera de Entregas, el interruptor **Con prompt para IA** agrega ese `PROMPT.txt` a los zips de proyectos completos.

El contexto de marca que se incluye en los prompts se edita en `MARCA`, en `config.js`.

## Quién entra y cómo

| | Qué tiene que hacer |
|---|---|
| **Flavio y Maca** | Abrir el link, elegir quién son y escribir **una vez** la clave que les manda Javi. Nada más. |
| **Javi** | Guarda su propia clave larga en Ajustes y desde ahí prepara la clave del equipo. |

Sin clave, la app igual abre: se ve y se descarga todo, solo que no deja escribir.

## Puesta en marcha

### 1. Publicar la página
**Settings → Pages** → *Deploy from a branch* → rama `main` → carpeta `/ (root)`.
Queda en `https://javimolin-rgb.github.io/cronograma/`.

### 2. La clave larga de la administradora
Una sola, la crea Javi:

1. Foto de perfil → **Settings** → abajo **Developer settings** → **Personal access tokens** → **Fine-grained tokens** → **Generate new token**.
2. Nombre `cronograma`, vencimiento el más largo posible.
3. **Repository access** → *Only select repositories* → `cronograma`.
4. **Permissions** → *Repository permissions* → **Contents: Read and write**. Nada más.
5. Copiar el `github_pat_…` y pegarlo en la app: avatar → **Ajustes** → **Acceso**.

### 3. La clave del equipo
En **Ajustes → Entrada del equipo**: escribe una clave simple y toca **Preparar**. Esa es la que les mandas a Flavio y a Maca. La clave larga queda guardada cifrada con ella: sin la clave simple no sirve de nada.

Para cortarle el acceso a alguien: **Cambiar** la clave del equipo y avisarle solo a quien corresponde.

### 4. Notificaciones al celular
En **Settings → Secrets and variables → Actions**, tres secretos: `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY` y `VAPID_SUBJECT`. Después, en cada celular: **Ajustes → Activar en este celular → Enviarme una de prueba**.

### 5. Instalar en el teléfono
- **iPhone (iOS 16.4+):** abrir en **Safari** → Compartir → **Agregar a pantalla de inicio**. Las notificaciones solo funcionan abriéndola desde ese ícono.
- **Android:** abrir en Chrome → **Instalar** en el aviso de arriba.

## Cómo se mantiene al día

La app se actualiza sola: cada vez que se abre revisa si hay una versión nueva y, si la hay, se recarga con los cambios. En **Ajustes** aparece el número de versión y un botón **Buscar actualización** para forzarla al instante.

Al publicar cambios, sube el número de `VERSION` en `sw.js` para que todos los teléfonos la tomen.

En iPhone, el **ícono** de la pantalla de inicio es lo único que no se renueva solo: si cambia el diseño del ícono, hay que borrar el acceso directo y volver a agregarlo. El contenido sí se actualiza siempre.

## Importar una conversación de WhatsApp

**Ajustes → Importar conversación de WhatsApp** (solo Javi). Pegas el chat exportado *sin archivos*, la app reconoce quién escribió cada mensaje y cuándo, marca los cambios que pidieron y deja un espacio para cada foto. Las fotos se pegan con Ctrl+V (o se eligen desde el teléfono) y quedan dentro del comentario que las pidió. Al importar, todo queda en la pieza: comentarios con su autor y fecha, los cambios como pendientes, y los enlaces.

## Dónde queda cada cosa

| Qué | Dónde |
|---|---|
| Piezas, comentarios, historial, avisos | `datos/contenido.json` |
| Archivos subidos | `archivos/<proyecto>/<archivo>-v1.jpg` |
| Clave del equipo (cifrada) | `datos/acceso.json` |
| Envío de notificaciones | `.github/workflows/avisos.yml` |
| Equipo, estados, plataformas, formatos | `config.js` |

## Cuidados

- Esto es público: todo lo que se suba lo puede ver cualquiera con el link. Nada de datos de clientes, precios reservados ni capturas con nombres o correos. Para eso, el archivo al Drive y aquí solo el enlace.
- Lo mismo al importar de WhatsApp: desmarca lo que no quieras que quede a la vista.
- Hasta 24 MB por archivo. Las fotos grandes se achican solas al subirlas; los videos pesados, mejor al Drive.
- Si abajo dice **“Guardando…”**, espera un segundo antes de cerrar.
