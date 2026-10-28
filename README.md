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

## Interactivos (los sube Javi)

Además de fotos y videos, una pieza puede llevar una **página interactiva**: por ejemplo, el reel de Casa Huingán con sus cinco pistas de música para que el cliente las compare sin salir de la app.

**Para subirla:** el interactivo viene en un **.zip con un `index.html` adentro** (y al lado sus videos, audios e imágenes). Dentro de la pieza, bajo el título *Interactivo*, está el botón **Subir un interactivo (.zip)** —también funciona el botón de archivos de siempre, o soltar el .zip encima en el computador—. La app descomprime su contenido en el repositorio y lo deja como interactivo en vez de guardar el .zip tal cual; el nombre lo toma del `<title>` de la página. Después hay que tocar **Guardar cambios**, como con cualquier archivo.

**Si la subida se corta** (se cae la señal, se bloquea el teléfono, se cierra la app), no queda nada a medias: el `index.html` se sube **al final**, así que el interactivo que ya estaba sigue funcionando igual. En la pieza aparece el aviso rojo diciendo en qué archivo se cortó, y **Reintentar** retoma desde ahí: lo que ya había llegado no se vuelve a subir. Mientras sube, la app pide que el teléfono no se duerma y muestra cuántos MB van.

Antes de empezar una subida grande (más de 60 MB) la app avisa cuánto pesa y cuántos archivos son, para que sepas que va a tardar. Cada archivo suelto tiene que pesar menos de 24 MB: si uno se pasa, no se sube nada y la app dice cuál es.

**Para actualizarla:** se toca **Actualizar** en la tarjeta del interactivo y se elige el **.zip completo nuevo**. No se duplica: se reemplaza lo que cambió, se borra lo que el zip nuevo ya no trae, y la versión sube a 2, 3… Los archivos que siguen iguales (el video, por ejemplo) no se vuelven a subir, así que actualizar solo los textos es cuestión de segundos.

**Cómo se ve:** la pieza queda marcada como **Interactivo** (en las tarjetas, en el feed y en la vista de resultado) y cualquiera del equipo puede tocar **Abrir** para usarla a pantalla completa dentro de la app.

**El enlace del original (solo lo ve quien administra):** en la tarjeta se puede guardar el enlace de donde salió el interactivo (por ejemplo el artefacto en Claude). Flavio y Maca no lo ven —a ellos les queda el botón *Abrir* y nada más—, y cualquier enlace a Claude que se pegue en *Enlaces* también queda oculto para ellos, porque sin la cuenta de Javi no les serviría. Sirve para volver a él cuando haya que exportar una versión nueva, pero **no se actualiza solo**: Claude no deja que sus artefactos se muestren dentro de otra página ni que se descarguen sin la sesión de uno, así que el contenido vive siempre en el repositorio. El camino corto para actualizar es: en Claude, descargar el .zip → soltarlo sobre la pieza (o *Actualizar*) → *Guardar cambios*.

Un par de cuidados: la página se abre **aislada**, sin acceso a los datos ni a la clave de la app (si guarda algo “recordado”, como la última pista elegida, no lo va a recordar). Cada archivo puede pesar hasta 24 MB, y como todo queda en el repositorio, conviene no dejar interactivos que ya no se usan: **Quitar** borra también sus archivos.

## Nombrar una foto o un video en un comentario

Debajo del cuadro de comentario, en cada pieza, están las miniaturas de sus fotos y videos: al tocar una (o varias) el comentario queda enganchado a ese archivo, y las miniaturas aparecen dentro del comentario para que no haya dudas de cuál es. Es la forma de decir “en esta saquemos la camioneta” sin tener que explicarlo. Si solo marcas archivos y no escribes nada, igual se puede enviar.

## Pulgar arriba o abajo

Cada comentario tiene **👍** y **👎**: sirven para decir “lo leí / de acuerdo” sin escribir. Se toca una vez para ponerlo y otra para sacarlo, y al pasar el dedo (o el mouse) sobre el número se ve quién lo puso. Están tanto en la pieza como en el feed.

A quien escribió el comentario le llega el aviso **dentro de la app** (en la campana), sin sonar el teléfono. Se puede apagar en Ajustes, en *“Pulgar en mis comentarios”*.

## Corregir un comentario

Debajo de cada comentario propio está **Editar**: se corrige el texto y se guarda. En el feed, el mismo *Editar* abre la pieza con ese comentario listo para arreglar.

El comentario corregido queda marcado como **corregido**, y con **“Cómo decía antes”** cualquiera del equipo puede ver las versiones anteriores, con la fecha y quién las cambió (se guardan las últimas 20). Nada se pierde ni se reescribe a escondidas.

Cada uno corrige **solo lo suyo**: los comentarios de Flavio los edita Flavio, los de Maca los edita Maca. Nadie puede reescribir lo que escribió otro, ni siquiera quien administra.

## Tareas sin fecha límite

En cada pieza, debajo de *Cuándo se publica*, está el botón **Sin fecha límite**: al tocarlo se borra la fecha y la hora, y la pieza queda como pendiente sin vencimiento. Sirve para lo que hay que hacer pero no tiene día: pendientes, ideas, encargos.

Las piezas sin fecha aparecen en **Agenda**, agrupadas al final bajo *Sin fecha*, y en el **Tablero** según su estado (en el calendario no, porque no tienen día). No generan avisos de vencimiento. Para ponerle fecha después, se toca el mismo botón y vuelve a aparecer el día de hoy.

## Archivos pesados

Las fotos se achican solas antes de subirse (y si siguen pesando mucho, se achican otro poco). Un **video de más de 24 MB se comprime en el mismo teléfono**: se vuelve a grabar más liviano, sin que se escuche, conservando el audio, y se sube esa copia. Tarda lo que dura el video, y mientras tanto se ve el avance.

**Si un archivo no se sube, queda a la vista.** Dentro de la pieza aparece un aviso rojo con el nombre y el motivo (“pesa 25 MB y no se pudo achicar en este aparato”), con un botón **Reintentar**. Y si se intenta guardar la pieza con algo pendiente, la app pregunta antes, nombrando los archivos que no van a quedar. Así no se da por subido algo que en realidad no está.

Un truco que funciona siempre cuando un video no entra: mandárselo por WhatsApp y subir esa copia, que viene comprimida.

## Que el repositorio no se llene

Todo vive en el repositorio, así que la app cuida el espacio sola:

- **Las fotos se guardan en el formato más liviano** que el navegador sepa escribir (normalmente **WebP**, que pesa como la mitad de un JPEG igual de bueno) y achicadas a 1800 px. En las pruebas, una foto de 180 KB quedó en 106 KB sin que se note.
- **No se guarda dos veces lo mismo.** Antes de subir, la app compara el contenido con lo que ya está: si ese archivo exacto ya existe —en esta pieza o en otra— no lo vuelve a subir, lo enlaza. Al quitar un archivo que otra pieza también usa, solo se saca de la pieza, no se borra.
- **Los videos de más de 24 MB se comprimen** antes de subirse (ver más arriba).

### Espacio (solo Javi)

En **Entregas → Espacio** se ve cuánto ocupa todo y qué se puede soltar, en tres grupos:

| Grupo | Qué es |
|---|---|
| Versiones anteriores | Lo que quedó atrás al subir una versión nueva. Se conserva siempre la última de cada archivo. |
| Archivos sueltos | Están en el repositorio pero ninguna pieza los usa: sobras de subidas que no terminaron. |
| Repetidos | El mismo contenido guardado dos veces. Se deja una copia y las piezas apuntan a ella. |

Cada grupo se suelta por separado, con su confirmación y el peso que libera. Ojo: eso libera el sitio publicado, pero el historial de GitHub sigue guardando lo que hubo (es así por diseño).

## Archivos por tandas

Los archivos de una pieza se ordenan por **tandas**: lo que se subió de una vez queda junto, con su fecha y hora (“23 oct, 21:04 · 2 archivos”), y la tanda más nueva va arriba. Así lo último entregado —la versión final— es lo primero que se ve, tanto en Entregas como en el carrusel de la pieza.

Cuando un archivo se sube varias veces con el mismo nombre, la app lo guarda como **versiones** del mismo archivo: se muestra la última y las anteriores quedan detrás de *Ver más*.

## Ver fotos y videos

Tocar cualquier foto o video (en el feed, en una pieza, en un comentario) abre la galería a pantalla completa: se desliza con el dedo entre todos los archivos, los videos se reproducen ahí mismo, y tiene contador, X para cerrar y botón para descargar. En el computador, también con las flechas del teclado. Los videos muestran su primer cuadro con ▶ en vez de un ícono.

**Con sonido:** los videos nunca van silenciados. Al abrir uno en grande empieza a reproducirse solo, con audio; en el feed y en los carruseles tienen sus controles y suenan al darles play. Si un archivo no trae pista de audio (pasa con los renders), sale el aviso **“sin sonido”** encima, para que quede claro que es el archivo y no la app.

En iPhone, ojo con el **interruptor de silencio** del costado: con el teléfono en silencio, Safari no deja que suene el video dentro de la app aunque esté todo bien.

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

## Si no te llegan las notificaciones al celular

El aviso se guarda siempre (la campana dentro de la app), pero para que suene el teléfono ese aparato tiene que estar **suscrito**. Lo primero: abrir la app desde el ícono de la pantalla de inicio y mirar **Ajustes**; ahí dice si este celular las tiene activas, y con *Enviarme una de prueba* se comprueba en el momento.

Lo que más pasa: **se borró y se volvió a instalar la app**. iOS borra con ella el permiso y la suscripción, así que hay que volver a tocar *Activar en este celular* aunque antes funcionara. Para que no pase inadvertido, cuando la app está instalada y este aparato no está recibiendo nada, aparece un aviso arriba con el botón **Activar** (se puede ocultar y vuelve a la semana).

Si el permiso sigue dado pero la suscripción se perdió, la app la rehace sola al abrirla. Y cuando el envío descubre que un celular ya no existe (el servidor responde que la suscripción venció), queda anotado y se borra solo de la lista, para que *Dispositivos* no muestre celulares que en realidad no reciben nada.

Si en el teléfono están bloqueadas: **Ajustes del iPhone → Cronograma → Notificaciones → Permitir**.

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

Dentro de cada pieza, la **campana** de arriba activa o silencia los avisos de *esa* pieza: silenciada, no llegan sus comentarios ni sus cambios; activada, llegan aunque no estés etiquetado.

**Una excepción, siempre:** si te **mencionan** (@tu-nombre) o te **etiquetan** en una pieza, el aviso llega igual, esté silenciada o no, y aunque además recibas el resumen de todo lo que hace el equipo. Nombrarte a ti es directo y no se pierde. Para no avisar dos veces de lo mismo, a quien ya recibió el aviso directo no le llega después el resumen.

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
