# Cronograma de contenido — app del equipo Neorigen

Calendario (mes, carta Gantt y línea), piezas, entregas y panel de seguimiento. Se instala en la pantalla de inicio como una app, con el ícono y los colores de Neorigen, y avisa con notificaciones del celular cuando te etiquetan o mencionan.

Funciona sin servicios externos ni cuentas aparte: los datos y los archivos viven junto a la página y quedan enlazados para siempre.

## Lo que ya viene cargado

Las entregas de agosto a octubre de 2026: diagnóstico y resumen de marca, cotizador y sus cambios, el sitio web (maqueta, Wix, textos, portada y formulario), los carruseles de Instagram, el render de la Casa Lingue, las fotos de obra y la carpeta institucional completa hasta las 50 impresas. Cada una con su fecha, su proyecto, quién participó, el feedback que les dieron y los enlaces.

## Qué ve cada uno

- **Flavio y Maca** entran a **Entregas** y ven cada pieza terminada como resultado: el carrusel se desliza con el dedo, con su descripción, el guión si lo tiene y los enlaces. Pueden comentar y descargar la versión final. No ven archivos sueltos, ni versiones, ni carpetas.
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

## Mandar una foto nueva en el comentario

La primera miniatura es una **cámara**: abre la galería o la cámara del teléfono para sumar una foto (o un video) que todavía no está en la pieza. En el **Feed** está el mismo botón, a la izquierda del casillero de escribir.

- La foto **se sube de inmediato a los archivos de la pieza**, en la misma carpeta de proyecto que el resto, y aparece en **Entregas** como cualquier otro archivo. No es un adjunto suelto del comentario.
- Queda **marcada sola** para el comentario que estás escribiendo. Si al final no mandas el comentario, la foto no se pierde: sigue guardada en la pieza.
- Se le pone el nombre de la pieza si venía con uno inservible (`IMG_4821`, un número largo…), se numera como versión y las fotos grandes se achican solas, igual que cuando subes desde *Archivos*.
- Si mandas **la misma foto dos veces**, no se vuelve a subir: se usa la que ya estaba.
- En el Feed, antes de mandar, las fotos elegidas se ven arriba del casillero con una **✕** para sacarlas del comentario (del archivo de la pieza no se borran).

Lo pueden usar los tres, no solo Javi: es la forma de que Flavio o Maca manden una referencia o una captura sin salirse de la conversación. En modo solo lectura el botón no aparece.

## Pulgar arriba o abajo

Cada comentario tiene **👍** y **👎**: sirven para decir “lo leí / de acuerdo” sin escribir. Se toca una vez para ponerlo y otra para sacarlo, y al pasar el dedo (o el mouse) sobre el número se ve quién lo puso. Están tanto en la pieza como en el feed.

A quien escribió el comentario le llega el aviso **dentro de la app** (en la campana), sin sonar el teléfono. Se puede apagar en Ajustes, en *“Pulgar en mis comentarios”*.

## Piezas: agenda y tablero en la misma pestaña

**Agenda** y **Tablero** dejaron de ser dos pestañas: ahora son una sola, **Piezas**, con un conmutador arriba para pasar de una a otra. *Agenda* ordena por fecha (atrasadas, hoy, mañana, esta semana, más adelante, sin fecha); *Tablero* ordena por estado, con las columnas que se arrastran. El buscador y los filtros sirven igual en las dos, y la app recuerda con cuál estabas.

Así la barra de abajo quedó en seis pestañas: Feed, Calendario, Piezas, Entregas, Marca y Panel.

## Calendario: mes, carta Gantt y línea

El **Calendario** también tiene su conmutador arriba, con tres maneras de mirar lo mismo. Las flechas y el botón **Hoy** mueven las tres, y la app recuerda cuál estabas usando.

| Vista | Qué muestra |
|---|---|
| **Mes** | La cuadrícula de siempre, con los puntitos de cada día y las piezas del día elegido abajo. |
| **Gantt** | Doce semanas seguidas, de corrido hacia el lado. Se arrastra con el dedo; la columna de la izquierda queda fija y una línea marca el día de hoy (se abre ahí puesta). Los fines de semana van sombreados. Arriba se elige **qué va en esa columna**. |
| **Línea** | El cronograma que baja: mes a mes y día a día, con las tarjetas completas al lado de cada fecha y cuánto falta (“hoy”, “en 8 días”, “ya pasó”). |

En las tres, tocar una pieza la abre. Las piezas **sin fecha** aparecen al final de Gantt y de Línea, como chips, para que no se pierdan.

### Qué va en el eje de la izquierda

Arriba de la carta hay un menú, **“Cada línea es”**, con cuatro maneras de leer lo mismo:

| Cada línea es | Qué se ve |
|---|---|
| **Campaña** | Una sola línea por campaña, con todas sus publicaciones puestas encima. Es la que viene puesta: se ve de un vistazo cómo avanza cada campaña en el tiempo. |
| **Estado** | Una línea por estado (Idea, Estructura por aprobar, En diseño…), para ver dónde está atascado el trabajo. |
| **Persona** | Una línea por persona, con lo que tiene encima cada una. Una pieza con dos responsables sale en las dos líneas. |
| **Pieza** | Como antes: una línea por publicación, agrupadas por campaña. |

Cuando dos piezas de la misma línea se pisan en el tiempo, se ponen **una debajo de la otra** dentro de esa línea, así que nunca se tapan. Cada barra mantiene el color de su estado, y tocarla abre la pieza. La app recuerda cuál elegiste.

### Campañas: renombrar y mover

Cuando las piezas tienen **campaña**, la carta Gantt las agrupa y cada grupo se maneja entero:

- Tocar el **nombre del grupo** abre su menú: cuántas piezas tiene, desde cuándo hasta cuándo, la lista para saltar a cualquiera, y el **nombre**. Cambiarlo ahí se lo cambia **a todas sus piezas de una vez**, sin ir una por una. También está **“quitársela a todas”**, que las deja sin campaña sin borrar nada.
- En el computador, cada pieza se **arrastra** hasta el grupo donde va (el grupo se ilumina al pasar por encima): con el eje en *Pieza*, desde su nombre; con el eje en *Campaña*, arrastrando la barra misma a otra línea.
- En el teléfono, cada fila tiene un botón de **carpeta**: abre la lista de campañas, con *Sin campaña* y un casillero para crear una nueva ahí mismo.

Flavio y Maca ven los grupos, pero no pueden renombrarlos ni mover piezas.

### De cuándo a cuándo va una barra

Cada barra va desde que se empieza a trabajar la pieza hasta el día en que se publica.

- Dentro de la pieza hay un campo nuevo, **“se trabaja desde”**, para fijar ese comienzo.
- Si está vacío, la barra se calcula sola: una semana antes de publicar, o desde el día en que creaste la pieza si es más cerca. Esas barras salen **rayadas**, para que se note que son un cálculo y no algo que dijiste tú.


## Las publicadas se archivan solas

Cuando una pieza está en **Publicado**, el trabajo se terminó: la app la **archiva sola**, para que lo que ya está hecho no siga estorbando en las listas de lo que falta. Vale para las que publiques de ahora en adelante y también para **las que ya tenías publicadas**.

- **Desaparece de Piezas y del Calendario** (agenda, tablero, mes, Gantt y línea). Eso es todo lo que cambia.
- **No se borra nada** ni se pierde nada: sigue entera en el **Feed** (y en su pestaña *Publicadas*), en **Entregas** con todos sus archivos, en el **Panel** y en las búsquedas del archivo.
- En **Piezas** y en **Calendario** aparece arriba un botón **Archivo** con el número de piezas archivadas: tocarlo las trae de vuelta a la vista, y tocarlo otra vez las esconde. También está como casilla dentro de **Filtros**.
- Si una pieza publicada hay que volver a tocarla, se abre y se toca **“Sacar del archivo”**: vuelve a las listas aunque siga marcada como Publicado, y se queda ahí. Si después la mueves a otro estado y la vuelves a publicar, se archiva de nuevo.

Es automático: no hay que archivar nada a mano.


## Cuando la llave de GitHub deja de servir

Las llaves de GitHub (`github_pat_…`) **vencen**, y también se pueden revocar o cambiar. Cuando pasa, GitHub contesta *“Bad credentials”* y **no se guarda ni se sube nada**, aunque la app se vea normal.

Ahora la app lo dice en claro:

- Lo detecta tanto al **subir archivos** como al guardar datos (antes solo al guardar), y lo traduce: *“tu llave de GitHub ya no sirve (venció, la revocaron o la cambiaste)”*.
- Aparece un cartel arriba. A Javi le dice qué pasó y le pone el botón **Cambiar la llave**, que abre Ajustes con el casillero listo; a Flavio y Maca les dice que le pidan una nueva a Javi.
- El archivo que no se subió queda con su botón **Reintentar** en la pieza: al pegar la llave nueva, se reintenta y se sube.
- Mientras tanto la app queda en solo lectura, para no hacer creer que algo se guardó.

**Cómo renovarla (Javi):**

1. En GitHub: *Settings → Developer settings → Personal access tokens → Fine-grained tokens → Generate new token*. Repositorio: `javimolin-rgb/cronograma`. Permisos: **Contents: Read and write** (y *Metadata: Read*, que viene solo). Vencimiento: el más largo que ofrezca, y anotar la fecha.
2. En la app: **Ajustes → tu clave larga**, pegarla y *Guardar*.
3. En el mismo Ajustes, en la entrada del equipo, volver a poner la clave simple y tocar **Cambiar**: eso vuelve a guardar la llave nueva para Flavio y Maca.
4. Ellos, la próxima vez que abran, escriben esa clave simple una vez y siguen como siempre.

## Zumbido: el aviso urgente de una pieza

Para cuando hace falta de verdad y no se puede esperar. Dentro de una pieza, arriba a la derecha, está el **rayo ⚡**.

- Se elige **a quién** (Flavio, Maca o los dos) y **qué decir**: hay cuatro frases listas —*“está esperando tu respuesta”*, *“necesita que revises esto hoy”*, *“te está esperando para poder seguir”*, *“necesita esto con urgencia”*— o se escribe cualquier otra cosa.
- Abajo se ve **tal cual le va a llegar** al celular antes de mandarlo.
- Llega como una notificación **aparte de las demás**: no se junta con los otros avisos de esa pieza, vibra distinto y **se queda en la pantalla** hasta que la tocan. Llega aunque tengan apagados los avisos de esa pieza.
- En la campana de la app queda marcada con un **⚡** y una raya al costado.
- **No cambia ni guarda nada** de la pieza: solo manda el aviso y lo anota en el historial.

Lo puede mandar cualquiera que tenga la clave de escritura, no solo Javi. Como suena por encima de todo, conviene dejarlo para cuando de verdad hace falta.


## Avisar al equipo sin subir ni cambiar nada

Para decir cosas como *“las publicaciones de noviembre ya están todas subidas”*, Javi tiene **Avisar al equipo**: en **+ → Avisar al equipo**, y también en el botón **Avisar** de la campana.

- Se elige **a quién** (Flavio, Maca o los dos) y se escribe el mensaje. Debajo de los nombres dice si a cada uno le va a llegar **al celular** o solo a la campana de la app.
- Opcionalmente se puede colgar de **una pieza**: entonces, al tocar el aviso, se abre esa pieza. Si no, es un aviso general y no abre nada.
- El aviso **llega igual aunque tengan apagados los avisos de las piezas**, como las menciones.
- No toca ninguna pieza: no cambia estados, ni fechas, ni archivos.

## Estado “Estructura por aprobar”

Entre **Idea** y **En diseño** hay un paso más: **Estructura por aprobar**. Es para las piezas donde ya está la estructura o la base, pero no vale la pena ponerse a diseñar hasta que la aprueben.

- En el feed, el botón de aprobar cambia a **“Aprobar la estructura”**, y al tocarlo la pieza pasa a **En diseño** (no a *Aprobado*: lo que se aprobó fue la estructura, el diseño viene después).
- Si lleva tres días o más esperando, se marca como **estancada**, igual que las demás etapas de trabajo.

## Los colores de los estados

Los ocho estados tienen ahora **un color por familia de tono**, elegidos para que se distingan de verdad —el morado y el gris de antes se parecían demasiado—:

| Estado | Color |
|---|---|
| Idea | gris pizarra |
| Estructura por aprobar | morado |
| En diseño | azul |
| En revisión | ámbar |
| Cambios | rojo |
| Aprobado | verde |
| Programado | celeste |
| Publicado | verde oscuro |

No es a ojo: la paleta está medida con el validador de color (distancia ΔE de OKLab). Entre **todos** los pares hay ≥ 15 de diferencia a vista normal —antes el peor par, morado contra azul, tenía 5,5— y ≥ 7 simulando daltonismo, con todos los tonos dentro de la claridad que se ve bien tanto en modo claro como en oscuro. Donde el color va solo (los puntitos del calendario) siempre está además el nombre del estado al abrir el día.

## Importar un documento de publicaciones

En **+ → Importar un documento** entra un `.md` o `.txt` con varias publicaciones adentro —de los que traen guion, idea, copy y voz en off— y la app **separa sola las publicaciones del contexto**.

- Cuenta como publicación la sección que trae **copy**, o una **tabla con voz en off**, o un título numerado con su línea de formato (*“Reel · POV · 18 s”*).
- Todo lo demás —lo que ya está en el feed, las tendencias, la tabla “de un vistazo”, los datos por confirmar, las fuentes— queda marcado como **contexto** y no se importa, aunque puedes marcarlo si en algún caso sí lo quieres.
- La tabla de resumen del documento (la de fechas) le pone a cada pieza su **fecha** y su **formato**; el resto sale de su propia sección.

Antes de crear nada aparece la pantalla de **revisar**: cada publicación con su fecha, su formato y qué se encontró (guión de N filas, copy, enlaces), con su casilla para dejarla fuera. Abajo se elige la **campaña** —así quedan agrupadas en la carta Gantt— y con qué **estado** entran.

De cada publicación se guarda:

| En el documento | Dónde queda |
|---|---|
| Caption + hashtags | El **copy** de la pieza |
| Tabla de tiempo · imagen · texto en pantalla · voz en off | El **guión**, como tabla |
| Idea, imagen, láminas, fuente | Las **notas internas** |
| Enlaces de la fuente | Los **enlaces** de la pieza |
| Fecha sugerida y formato | La **fecha** y el **formato** |

Si vuelves a importar el mismo documento, las que ya existen aparecen marcadas como repetidas y desmarcadas, así que no se duplican.

## Editar una pieza: lo justo a la vista

La ventana de **editar pieza** está ordenada para que se vea poco y se encuentre todo.

- Arriba, en una línea: **Estado** (menú) y a quién **etiquetar** (los avatares).
- Debajo, la fecha; el botón **“se trabaja desde…”** solo abre su casilla cuando lo necesitas.
- En una sola fila y como menús: **Plataforma · Formato · Prioridad**. Si una pieza va a más de una plataforma, se elige **Varias…** y recién ahí aparecen los chips.
- Después el **copy** y los **archivos**, que es lo que de verdad se usa todos los días.
- Lo demás —**guión / voz en off, interactivo, de Marca, enlaces, checklist, campaña y notas internas**— vive plegado en una línea cada uno. Si tienen algo adentro se abren solos y llevan un punto verde; si no, son una línea delgada con un **+**. Tocarlos los abre y los cierra.

### Guión / voz en off

Donde antes estaban los *hashtags* ahora está el **guión / voz en off**, porque los hashtags van dentro del copy. Se guarda con sus versiones anteriores (*“cómo decía antes”*), avisa al equipo cuando cambia —igual que el copy— y el buscador lo encuentra. Flavio y Maca lo ven en el feed y en Entregas, plegado bajo *“Guión / voz en off”*.

**El guión puede ser una tabla.** Si lo escribes en una tabla —momento · en pantalla · voz— cópiala y **pégala dentro del guión**: llega entera, con sus columnas, y se sigue viendo como tabla. Funciona pegando desde Word, Google Docs, Sheets, Notion o Claude (tabla de verdad), desde una planilla (columnas separadas por tabulaciones) y desde texto en Markdown (`| … | … |`). Si lo que pegas no es una tabla, se pega como texto normal, como siempre.

- Cada casilla se corrige ahí mismo y crece sola con lo que escribes.
- **+ Fila** y **+ Columna** para agregar; la **×** de cada fila la quita (pregunta antes si tenía algo).
- **Copiar la tabla** la deja lista para pegar de vuelta en Word, Docs o Sheets.
- **Quitar la tabla** la saca sin tocar el texto de abajo, que sirve para notas sueltas (“música: algo tranquilo, piano”).
- Flavio y Maca la ven, pero no la editan. En el teléfono se desliza hacia el lado para ver todas las columnas.

## Compartir con enlace directo (solo Javi)

En cada pieza —desde el botón de compartir del editor, del feed o de la vista de resultado— se abre la lista de lo que se puede mandar:

| Qué | Para qué sirve |
|---|---|
| **La pieza** | Abre el cronograma en esa pieza. Para Flavio y Maca. |
| **El texto** | Copia el copy completo, listo para pegar. |
| **Cada archivo** | Enlace directo al archivo: lo abre cualquiera, sin entrar al cronograma ni tener la clave. |
| **El interactivo** | El enlace de la página interactiva, que se abre sola. |
| **Lo que usa de Marca** | El logo o la pista que la pieza tiene mencionados. |

Al tocar compartir —una pieza, un archivo, una carpeta de Marca— se abre un cartel con el enlace a la vista y tres opciones: **Copiar enlace** (para pegarlo donde quieras), **Compartir…** (el menú del teléfono: WhatsApp, correo, mensajes, notas) y **Abrir**, para ver qué va a ver quien lo reciba. Los archivos sueltos y los de Marca también se comparten desde su propia ficha.

También se comparte **una carpeta entera de Marca**: su enlace abre el cronograma justo en esa carpeta, con todo lo que tenga dentro.

Para alguien de fuera del equipo conviene mandar el **enlace del archivo**, no el de la pieza: va directo a lo que quieres mostrar.

## Copiar el copy de una pieza

Junto a *Copy / texto* hay dos atajos: **Copiar**, que se lleva el copy entero listo para pegar en Instagram (te dice cuántos caracteres), y **Seleccionar todo**, para reemplazarlo de una sin pelear con el dedo.

En la vista de resultado, cada entrega tiene **Copiar texto**: así Flavio o Maca se llevan el texto sin tener que abrir la pieza ni seleccionar a mano.

## Avisar de un cambio de copy

Igual que al subir archivos: apenas cambias el **copy**, el **título** o el **guión** de una pieza ya guardada, aparece la barra *“Cambiaste el texto de la pieza. ¿Les avisas para que lo revisen?”* con el botón **Avisar**.

Ese aviso guarda la pieza, puede pasarla a *En revisión* y manda una notificación directa —al celular y a la campana— que dice qué cambió: “cambió el copy en «Pilotes» para revisar”, o “subió 2 archivos y cambió el copy…” si hiciste las dos cosas. Llega aunque tengan apagados los avisos de “editan contenido”. Las notas internas no cuentan: son tuyas.

## Versiones del copy y los textos

Cada vez que se guarda una pieza, lo que decían antes el **título**, el **copy**, el **guión** y las **notas internas** queda guardado. Debajo de cada uno aparece **“Cómo decía antes (N)”**: al tocarlo se despliegan las versiones anteriores, con la fecha hasta la que estuvieron y quién las cambió, y cada una trae **“Volver a este”** para recuperarla en el editor (después hay que guardar la pieza, como siempre).

Se guardan las últimas 40 versiones de la pieza y solo ocupan texto, así que no pesan nada. Sirve para cuando el cliente pide volver al copy de antes, o para comparar dos redacciones sin tener que acordarse.

## Corregir un comentario

Debajo de cada comentario propio está **Editar**: se corrige el texto y se guarda. En el feed, el mismo *Editar* abre la pieza con ese comentario listo para arreglar.

El comentario corregido queda marcado como **corregido**, y con **“Cómo decía antes”** cualquiera del equipo puede ver las versiones anteriores, con la fecha y quién las cambió (se guardan las últimas 20). Nada se pierde ni se reescribe a escondidas.

Cada uno corrige **solo lo suyo**: los comentarios de Flavio los edita Flavio, los de Maca los edita Maca. Nadie puede reescribir lo que escribió otro, ni siquiera quien administra.

## Tareas sin fecha límite

En cada pieza, debajo de *Cuándo se publica*, está el botón **Sin fecha límite**: al tocarlo se borra la fecha y la hora, y la pieza queda como pendiente sin vencimiento. Sirve para lo que hay que hacer pero no tiene día: pendientes, ideas, encargos.

Las piezas sin fecha aparecen en **Agenda**, agrupadas al final bajo *Sin fecha*, y en el **Tablero** según su estado (en el calendario no, porque no tienen día). No generan avisos de vencimiento. Para ponerle fecha después, se toca el mismo botón y vuelve a aparecer el día de hoy.

## Archivos pesados

Las fotos se achican solas antes de subirse (y si siguen pesando mucho, se achican otro poco). Un **video de más de 24 MB se comprime en el mismo teléfono**: se vuelve a grabar más liviano, sin que se escuche, conservando el audio, y se sube esa copia. Tarda lo que dura el video, y mientras tanto se ve el avance.

Cuando el computador no deja leer el archivo (pasa si se eligió mientras todavía se descargaba, o si está en iCloud/Drive sin bajar), la app lo intenta una segunda vez sola y, si tampoco, lo dice con esas palabras en vez de un error técnico.

Cada archivo muestra su **barra de avance** mientras sube, y si dos personas (o tú desde dos aparatos) guardan al mismo tiempo, la app reintenta sola en vez de fallar con un error de GitHub.

**Si un archivo no se sube, queda a la vista.** Dentro de la pieza aparece un aviso rojo con el nombre y el motivo (“pesa 25 MB y no se pudo achicar en este aparato”), con un botón **Reintentar**. Y si se intenta guardar la pieza con algo pendiente, la app pregunta antes, nombrando los archivos que no van a quedar. Así no se da por subido algo que en realidad no está.

Un truco que funciona siempre cuando un video no entra: mandárselo por WhatsApp y subir esa copia, que viene comprimida.

## Marca: la nube de recursos

La pestaña **Marca** guarda lo que la marca usa todo el tiempo y no pertenece a ninguna pieza: el **manual**, los **logos**, las **tipografías**, la **música**, **plantillas** y lo que haga falta.

- **Sube Javi**, ven y escuchan todos. Flavio y Maca no pueden subir ni quitar.
- **Carpetas de verdad.** Marca se abre como una nube: primero las carpetas, después los archivos. Están las de siempre (Logos, Manual, Tipografías, Música, Fotos, Plantillas y Otros) y las que cree Javi con **Nueva carpeta**, que pueden ir unas dentro de otras, sin límite de niveles. Arriba quedan las migas de pan (`Marca › Música › Reels de verano`) para volver, y tocar la pestaña **Marca** devuelve a la primera pantalla.
- Cada archivo cae solo en la carpeta que le corresponde según lo que sea (un .ttf a Tipografías, un .mp3 a Música, un PDF al Manual…). Si Javi entra primero a una carpeta y sube ahí, queda en esa.
- **Ver todo junto** muestra, de una, los archivos de la carpeta y de todas las que tiene adentro.
- **El enlace de una carpeta se comparte.** El botón de compartir de cada carpeta copia un enlace que abre el cronograma justo ahí, con todo lo que tenga dentro. Solo Javi los crea.
- El botón de ajustes de una carpeta deja cambiarle el nombre, moverla a otra, crear una adentro o quitarla. Al quitarla **no se borra nada**: lo que tenía pasa a la carpeta de arriba. Las siete de siempre no se quitan ni se renombran.
- **El mismo material en varios formatos es una sola ficha.** `neorigen_pino_completa.wav` y `.mp3` se muestran juntos, con el peso de cada uno; al descargar, Javi elige en qué formato.
- **Reproductor para todo:** al tocar un archivo se abre a pantalla completa y se pasa de uno a otro deslizando — fotos, videos y también **audios**, con su reproductor y el nombre de la pista.
- **Renombrar y mover:** el botón de ajustes de cada ficha deja cambiar el nombre (se lo cambia a todos sus formatos), moverla a cualquier carpeta (incluidas las nuevas), copiar su enlace o quitarla.
- **Ver y escuchar sí, descargar solo con permiso.** Flavio y Maca pueden abrir y escuchar todo, pero el botón de descargar aparece únicamente en lo que Javi marcó como libre; en el resto les sale un botón para **pedírselo**, que le llega como aviso. (El repositorio es público, así que es un acuerdo del equipo, no un candado.)
- Mientras sube, cada archivo muestra su **barra de avance** con el porcentaje.
- Se guardan en `archivos/marca-<carpeta>/` y cuentan como archivos en uso, así que la limpieza de *Espacio* nunca los toca.

### Usar un recurso de marca en una pieza

Dentro de una pieza, en **De Marca**, se eligen los recursos que esa publicación usa: la pista de música, el logo, la tipografía. No se copian —quedan apuntados al archivo de Marca—, así que no ocupan espacio de nuevo y se ven como fichas en la pieza, en el feed y en la vista de resultado. Al tocarlas se abren en el reproductor.

## Que el repositorio no se llene

Todo vive en el repositorio, así que la app cuida el espacio sola:

- **Las fotos se guardan en el formato más liviano** que el navegador sepa escribir (normalmente **WebP**, que pesa como la mitad de un JPEG igual de bueno) y achicadas a 1800 px. En las pruebas, una foto de 180 KB quedó en 106 KB sin que se note. Funciona igual desde el teléfono: si la foto viene sin tipo (pasa en iPhone) se reconoce por el nombre, y si es tan grande que Safari no la puede abrir de una, se abre de la otra forma en vez de rendirse.
- **No se guarda dos veces lo mismo.** Antes de subir, la app compara el contenido con lo que ya está: si ese archivo exacto ya existe —en esta pieza o en otra— no lo vuelve a subir, lo enlaza. Al quitar un archivo que otra pieza también usa, solo se saca de la pieza, no se borra.
- **Los videos se comprimen cuando conviene**, no solo cuando no entran: si vienen en 4K o con mucho más dato del necesario (más de ~4,5 Mbps), se vuelven a grabar más livianos. Un video que ya está bien no se toca, para no perder calidad por nada.
- **Los nombres del teléfono se arreglan solos.** iOS entrega los archivos como `0232b0d2-556c-…mov`; la app los guarda con el nombre de la pieza (`video-3d-huingan-1`) para poder reconocerlos después.
- **Si subes un video que parece el mismo** que ya está en la pieza (igual duración y tamaño), la app pregunta antes de repetirlo.

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

## Qué se ve en la notificación del celular

La notificación es poco espacio —sobre todo en un reloj—, así que no se gasta en repetir el nombre de la app:

- **Arriba va el nombre de la publicación** de la que se trata (“Casa Peumo”), no “Cronograma”. El logo y el nombre de la app ya los pone el teléfono encima.
- **Abajo va quién fue y qué hizo**, sin repetir el título: *“Maca comentó: me gusta el encuadre”*, *“Javi la movió a En revisión”*, *“Flavio te etiquetó como responsable”*, *“Javi cambió la fecha a 12 nov”*.
- En los avisos generales (los que no son de ninguna pieza) arriba dice **“Aviso de Javi”** y abajo el mensaje tal cual.

Dentro de la app, en la campana, los avisos siguen diciendo de qué pieza son, porque ahí se ven todos juntos.


## Si no te llegan las notificaciones al celular

El aviso se guarda siempre (la campana dentro de la app), pero para que suene el teléfono ese aparato tiene que estar **suscrito**. Lo primero: abrir la app desde el ícono de la pantalla de inicio y mirar **Ajustes**; ahí dice si este celular las tiene activas, y con *Enviarme una de prueba* se comprueba en el momento.

Lo que más pasa: **se borró y se volvió a instalar la app**. iOS borra con ella el permiso y la suscripción, así que hay que volver a tocar *Activar en este celular* aunque antes funcionara. Para que no pase inadvertido, cuando la app está instalada y este aparato no está recibiendo nada, aparece un aviso arriba con el botón **Activar** (se puede ocultar y vuelve a la semana).

Si el permiso sigue dado pero la suscripción se perdió, la app la rehace sola al abrirla. Y cuando el envío descubre que un celular ya no existe (el servidor responde que la suscripción venció), queda anotado y se borra solo de la lista, para que *Dispositivos* no muestre celulares que en realidad no reciben nada.

Si en el teléfono están bloqueadas: **Ajustes del iPhone → Cronograma → Notificaciones → Permitir**.

## Deslizar para actualizar

En el celular, estando arriba del todo, se **tira la pantalla hacia abajo** y aparece el círculo con la flecha: al soltarlo la app sube lo que estuviera pendiente, trae lo último del equipo y de paso mira si hay una versión nueva. Cuando termina dice *“Al día”*.

Si la página está desplazada, el gesto sigue siendo un scroll normal; tampoco se activa dentro de una hoja abierta, del visor de fotos ni de un carrusel.

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
