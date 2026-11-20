# Encargo: dejar andando la mudanza al repositorio de archivo

Esto es lo que quedó pendiente de la tarea *Mudar lo viejo al archivo*
(commit `5f2498e`). El código ya está listo y subido a `main`; faltan dos
cosas que no se pueden hacer desde una sesión en la nube: **crear el
repositorio de archivo** y **guardar un token con permiso para escribir en
él**. Las dos se pueden hacer desde un computador con `gh` ya conectado.

El porqué de todo esto está en el README, en *Mudar lo viejo a otro
repositorio*. En corto: el sitio publicado de GitHub Pages tiene un tope
duro de 1 GB, vamos en ~650 MB y subiendo ~19 MB al día.

---

## 1. Crear el repositorio de archivo

Tiene que ser **público** y **sin GitHub Pages**. Público porque, si no, el
navegador no podría mostrar las fotos que vivan ahí; sin Pages porque así su
peso no cuenta contra ningún tope de sitio publicado.

```bash
gh repo create javimolin-rgb/cronograma-archivo-2026 --public --description "Archivo del cronograma de contenido: versiones anteriores y material viejo. Nada se borra."
```

Comprobar que quedó público:

```bash
gh api repos/javimolin-rgb/cronograma-archivo-2026 --jq '{private, has_pages, default_branch}'
```

Debe decir `"private": false`. Si saliera `true`, arreglarlo antes de seguir:

```bash
gh repo edit javimolin-rgb/cronograma-archivo-2026 --visibility public --accept-visibility-change-consequences
```

No hace falta ponerle nada dentro: la primera mudanza crea la rama `main`
sola.

## 2. El token (este paso es a mano, en el navegador)

GitHub no deja crear tokens desde la línea de comandos, así que esta parte
va sí o sí por la web:

1. Entrar a <https://github.com/settings/personal-access-tokens/new>
2. **Token name**: `cronograma-archivo`
3. **Expiration**: lo más largo que ofrezca. Anotar la fecha: cuando caduque,
   la mudanza deja de correr y hay que repetir este paso.
4. **Repository access** → *Only select repositories* → elegir
   **solo** `cronograma-archivo-2026`.
5. **Permissions** → *Repository permissions* → **Contents: Read and write**.
   Nada más. Con eso basta.
6. Generar y copiar el token.

Y guardarlo como secreto del repositorio del cronograma. Usar este comando
**sin** `--body`, para que lo pida por teclado y el token no quede escrito en
el historial del terminal ni en esta conversación:

```bash
gh secret set ARCHIVO_TOKEN --repo javimolin-rgb/cronograma
```

Comprobar que quedó guardado (muestra el nombre, nunca el valor):

```bash
gh secret list --repo javimolin-rgb/cronograma
```

## 3. Probar en seco

Primero un simulacro: dice qué movería, sin mover nada.

```bash
gh workflow run "Mudar lo viejo al archivo" --repo javimolin-rgb/cronograma -f modo=versiones -f simulacro=true
```

Esperar un minuto y mirar el resultado:

```bash
ID=$(gh run list --workflow "Mudar lo viejo al archivo" --repo javimolin-rgb/cronograma --limit 1 --json databaseId --jq '.[0].databaseId')
gh run watch "$ID" --repo javimolin-rgb/cronograma
gh run view "$ID" --repo javimolin-rgb/cronograma --log | tail -40
```

**Qué tiene que decir:** `Modo versiones: N candidatos, se mudan N (… MB)`
con unos 56 archivos y ~68 MB, y la lista de los más pesados. Si en cambio
dice *"Falta el secreto ARCHIVO_TOKEN"*, el paso 2 no quedó bien.

## 4. Una mudanza chica de verdad

Sin simulacro, pero con tope de 20 MB: se mueven uno o dos archivos nada más.
La idea es comprobar que todo el camino funciona antes de soltar el resto.

```bash
gh workflow run "Mudar lo viejo al archivo" --repo javimolin-rgb/cronograma -f modo=versiones -f simulacro=false -f tope_mb=20
```

Después de que termine, revisar las tres señales:

```bash
# a) el archivo llegó al otro repositorio
gh api repos/javimolin-rgb/cronograma-archivo-2026/contents/archivos --jq '.[].name'

# b) quedó anotado en el registro
gh api repos/javimolin-rgb/cronograma/contents/datos/mudanzas.json -H "Accept: application/vnd.github.raw" | head -20

# c) y el commit en el cronograma
gh api repos/javimolin-rgb/cronograma/commits --jq '.[0].commit.message'
```

**La comprobación que de verdad importa** es mirar la app: abrir el
cronograma, entrar a la pieza *¿Son prefabricadas?*, tocar
*"Ver más · N archivos anteriores"* y confirmar que el video mudado
(`reel_son_prefabricadas-v2.mp4` o el que haya tocado) **se sigue viendo**.
Si se ve, está todo bien. En *Entregas → Espacio* debería aparecer además el
recuadro **"Guardado en el archivo (no pesa aquí)"**.

## 5. Soltar el resto

Si lo anterior salió bien, ya no hay que hacer nada más: cada madrugada a
las 05:43 de Chile se mudan solas las versiones anteriores de más de 7 días.

Para recuperar espacio de golpe, una vez, incluyendo los archivos sueltos
(son ~53 más, hasta 212 MB entre los dos grupos), primero en simulacro para
mirar la lista:

```bash
gh workflow run "Mudar lo viejo al archivo" --repo javimolin-rgb/cronograma -f modo=todo -f simulacro=true -f tope_mb=400
```

Y si la lista convence, en serio:

```bash
gh workflow run "Mudar lo viejo al archivo" --repo javimolin-rgb/cronograma -f modo=todo -f simulacro=false -f tope_mb=400
```

---

## Cosas que conviene saber antes de tocar nada

- **Nada se borra.** El orden es copiar → comprobar que la copia es idéntica
  (comparando el sha de git, que es el contenido mismo) → y recién entonces
  cambiar la dirección en los datos y sacar el archivo de aquí. Si algo falla
  a mitad de camino, el archivo queda en los dos lados, nunca en ninguno.
- **No hagas un fork** del cronograma para esto: los forks comparten un mismo
  montón de objetos con el original, así que no liberan nada.
- **No pongas el repositorio de archivo en privado** ni le enciendas Pages.
- **No uses Releases** para guardar estos archivos: sus assets llegan sin
  `access-control-allow-origin` y como `application/octet-stream`, y eso
  rompería exportar para publicar, el zip y el paso a PNG.
- Si el repositorio de archivo se llena algún día, se crea el del año
  siguiente y se cambia `ARCHIVO_REPO` en `.github/workflows/mudanza.yml`.
  Lo ya mudado se queda donde está y se sigue viendo.

Si algo no calza con lo que dice aquí, **para y pregunta** antes de mover
archivos: lo que está en juego es el material de las piezas.
