# Cronograma de contenido — app del equipo Neorigen

Calendario, agenda, tablero, entregas y panel de seguimiento. Se instala en la pantalla de inicio como una app, con el ícono y los colores de Neorigen, y avisa con notificaciones del celular cuando te etiquetan o mencionan.

Funciona sin servicios externos ni cuentas aparte: los datos y los archivos viven junto a la página y quedan enlazados para siempre.

## Lo que ya viene cargado

Las entregas de agosto a octubre de 2026: diagnóstico y resumen de marca, cotizador y sus cambios, el sitio web (maqueta, Wix, textos, portada y formulario), los carruseles de Instagram, el render de la Casa Lingue, las fotos de obra y la carpeta institucional completa hasta las 50 impresas. Cada una con su fecha, su proyecto, quién participó, el feedback que les dieron y los enlaces.

## Qué ve cada uno

- **Flavio y Maca** entran a **Entregas** y ven cada pieza terminada como resultado: el carrusel se desliza con el dedo, con su descripción, sus hashtags y los enlaces. Pueden comentar y descargar la versión final. No ven archivos sueltos, ni versiones, ni carpetas.
- **Javi** ve en esa misma pestaña la carpeta completa: proyectos, piezas, todos los archivos, las versiones anteriores y las descargas en zip.

## Feed: revisar rápido, como en Instagram

La pestaña **Feed** muestra cada pieza como una publicación: la foto o el video en grande (se desliza entre archivos) y, al lado en el computador o debajo en el celular, el copy, los comentarios y un campo para comentar. Lo más nuevo (archivo, edición o comentario) aparece primero. Filtros: Todo, Por revisar, Aprobado y Publicado.

Desde ahí mismo se puede **Aprobar** o **Pedir cambios** (se escribe qué cambiar y, al enviarlo, la pieza pasa a *Cambios*).

**Tipo de vista:** arriba a la derecha se cambia entre **Tarjetas** (la de trabajo), **Como en Instagram** (se ve igual que la publicación: la cuenta arriba, la imagen en 4:5 sobre negro y el copy debajo; en computador, la imagen a la izquierda y los comentarios a la derecha) y **Cuadrícula** (como el perfil de Instagram). La elección queda guardada en ese dispositivo.

## Archivos por tandas

Los archivos de una pieza se ordenan por **tandas**: lo que se subió de una vez queda junto, con su fecha y hora (“23 oct, 21:04 · 2 archivos”), y la tanda más nueva va arriba. Así lo último entregado —la versión final— es lo primero que se ve, tanto en Entregas como en el carrusel de la pieza.

Cuando un archivo se sube varias veces con el mismo nombre, la app lo guarda como **versiones** del mismo archivo: se muestra la última y las anteriores quedan detrás de *Ver más*.

## Ver fotos y videos

Tocar cualquier foto o video (en el feed, en una pieza, en un comentario) abre la galería a pantalla completa: se desliza con el dedo entre todos los archivos, los videos se reproducen ahí mismo, y tiene contador, X para cerrar y botón para descargar. En el computador, también con las flechas del teclado. Los videos muestran su primer cuadro con ▶ en vez de un ícono.

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

## Sumar mensajes de WhatsApp (solo Javi)

**Lo más rápido: reenviar.** En WhatsApp, mantén apretado un mensaje (texto, foto o audio; también varios a la vez) → **Compartir** → **Cronograma**. La app se abre con lo reenviado listo para revisar, sin exportar el chat. Si reenvías varias cosas seguidas, se juntan y aparece un aviso *“N reenvíos esperando revisión”*.

- **Audios:** se transcriben en el mismo teléfono (no se mandan a ningún servicio). La primera vez descarga el modelo de voz (unos 80 MB) y después queda guardado. Si no se puede, aparece un espacio para escribir lo importante.
- **Quién lo dijo:** al reenviar, WhatsApp no manda el nombre; se elige con un toque (y la app recuerda la última elección).
- *Compartir → Cronograma* funciona con la app instalada en **Android**. En **iPhone**, Apple no deja que las apps web aparezcan en *Compartir*, así que ahí es:
  1. En WhatsApp, mantén apretado el mensaje (o elige varios) → **Copiar**.
  2. En la app, el botón de **mensaje** de arriba (al lado de la campana) → **Pegar lo copiado**. Sirve para texto y para una foto copiada.
  3. Para un audio: **Reenviar → Compartir → Guardar en Archivos**, y en la app **Fotos o audios**.
  - Opcional: un **Atajo** de iPhone que reciba texto y abra `https://javimolin-rgb.github.io/cronograma/?texto=` seguido del texto también funciona: aparece en *Compartir* y lo manda directo a revisión.

**Importar el zip de una conversación.** En el **+** de abajo → **Importar zip de conversación**, y eliges el `.zip` que exporta WhatsApp (con fotos y audios; sirve también el fragmento recortado que sale de otra app, mientras sea un zip de exportación de WhatsApp). La app:

- Lee el chat y deja cada foto junto a su mensaje (y la sube a la pieza). Las fotos seguidas sin texto quedan juntas en un solo comentario.
- Abre el zip por partes y muestra miniaturas livianas, así no se cae en el iPhone aunque traiga muchas fotos o videos. Mientras abre e importa, se ve una pantalla de carga con el avance.
- Los audios se transcriben **solo si tocas Transcribir** (la primera vez descarga unos 80 MB); se puede importar sin transcribirlos.
- Separa la conversación por temas y reconoce de qué pieza habla cada uno; si es algo nuevo (*“el reel nuevo de…”*), propone **crear la pieza**, con el formato que nombraron.
- **Actualiza el estado** según lo último que se dijo: si pidieron cambios → *Cambios*; si lo aprobaron → *Aprobado*; si dijeron que quedó publicado → *Publicado*; si mandaste una versión → *En revisión*. Una conversación más vieja que el último cambio de estado no lo hace retroceder, y una pieza publicada no vuelve atrás sola. Antes de importar se ve el estado propuesto y por qué, y se puede cambiar.
- Los videos de más de 20 MB quedan desmarcados (mejor al Drive).
- Cada tema tiene **Quitar tema** por si no es una tarea (se puede restaurar). Los temas sin nada técnico (*“estoy afuera”*, saludos) aparecen ya quitados.

Solo lo ve Javi: para Flavio y Maca, el **+** sigue creando una pieza nueva.

**También se puede pegar** el chat exportado (*Exportar chat → Sin archivos*) en el mismo lugar (o en **Ajustes → Importar mensajes**).

Al importar, siempre:

- **Filtra la conversación:** los saludos, felicitaciones, agradecimientos, risas y emojis quedan fuera. Lo técnico se guarda escrito de forma objetiva (*“Guaaau te pasaste!!! en la foto 2 porfa saca la camioneta jaja”* → *“En la foto 2 saca la camioneta.”*). Un “¡Está todo ok!” queda como *“Aprobado.”*. Se puede ver el original antes de importar.
- **Cuenta los cambios** que pidieron y los muestra en una lista numerada por pieza.
- **Reconoce de qué pieza se habla** (y si son varias, separa la conversación por temas). Se puede cambiar a mano.
- **Detecta lo repetido:** si un mensaje ya estaba en la pieza, o si un cambio ya estaba en pendientes o ya se hizo, lo marca y no lo duplica.
- Los cambios pedidos pasan a **pendientes** de la pieza, las fotos quedan dentro del comentario que las pidió, y los enlaces se suman a la pieza. En la pieza no queda ninguna marca de que vino de WhatsApp.

Lo que Flavio y Maca escriben directo en la app no se filtra ni se toca.

## Perfil de Javi con contraseña

Al elegir **Javi** en *¿Quién eres?* la app pide la contraseña. Queda recordada en ese teléfono hasta que se toque **Cambiar de persona**. Para cambiarla, se reemplaza la huella en `PERFIL_CLAVE`, dentro de `config.js` (la instrucción está ahí mismo).

## Avisar para revisar (solo Javi)

Al subir archivos a una pieza aparece *“Subiste N archivos. ¿Les avisas para que lo revisen?”* → **Avisar** (también está el botón de avión de papel abajo, en cualquier pieza). Eliges a quién (por defecto Flavio y Maca), escribes un mensaje si quieres y, si corresponde, la pieza pasa a **En revisión**. Al enviar se guarda la pieza y les llega una notificación directa *“Para revisar”* al celular y a la campana, aunque tengan apagados los avisos de “editan contenido”. La pantalla muestra a quién le llega al celular y a quién solo en la app (si no activó las notificaciones).

## Dispositivos (solo Javi)

**Ajustes → Equipo → Dispositivos** muestra qué teléfonos y computadores tienen la app, con qué persona, si está instalada en la pantalla de inicio o abierta en el navegador, si recibe notificaciones, cuándo se abrió por última vez y en qué versión. Cada dispositivo se anota solo al abrir la app (solo los que entraron con la clave). **Olvidar** saca uno de la lista y deja de mandarle notificaciones.

## El número rojo de la campana

El número de la campana cuenta los avisos sin leer y los vencimientos cercanos. **Se apaga al abrir el aviso que lo gatilló**: al abrir la campana o al entrar a la pieza avisada. Los vencimientos no vuelven a contar hasta que esa pieza cambie de verdad (otra fecha, otro estado o una edición nueva); ahí sí vuelve a avisar.

## Avisos de cada pieza

Dentro de cada pieza, la **campana** de arriba activa o silencia los avisos de *esa* pieza: silenciada, no llega nada de ella (ni a la app ni al celular); activada, llegan los comentarios, cambios de estado, de fecha y de contenido aunque no estés etiquetado.

## Javi se entera de todo (solo Javi)

Cada **comentario, pieza nueva o cambio** que hagan Flavio o Maca le llega a Javi, esté o no etiquetada. Llega **un aviso por acción**, con el resumen de lo que pasó (“en «X»: la movió a Aprobado; cambió la fecha a 5 nov”), y también al celular. Se apaga desde Ajustes, en el interruptor **“Todo lo que haga el equipo”**, que solo ella ve. Las piezas silenciadas desde su campana quedan fuera igual.

Quién lo recibe se define en `SUPERVISA`, dentro de `config.js`.

## Ver la publicación ya publicada

Si en una pieza guardas el **enlace de la publicación de Instagram** (en *Enlaces*), aparece el bloque **Publicado**: al tocar *Ver la publicación* se abre ahí mismo, dentro de la app, tal como quedó en Instagram —con su carrusel, su copy y su cuenta de me gusta—. También lo ven Flavio y Maca en la vista de resultado.

No hace falta conectar ninguna cuenta ni crear claves: Instagram deja mostrar así cualquier publicación pública. Si el navegador bloquea el contenido de Instagram (pasa con algunos bloqueadores), el bloque queda en blanco y al lado está el enlace para abrirla en Instagram.

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
- Lo mismo al importar mensajes: desmarca lo que no quieras que quede a la vista.
- Hasta 24 MB por archivo. Las fotos grandes se achican solas al subirlas; los videos pesados, mejor al Drive.
- Si abajo dice **“Guardando…”**, espera un segundo antes de cerrar.
