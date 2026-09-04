# Generador de Prompts para Dirección de Arte y Gestión de Proyectos

Aplicación web de una sola página que convierte los datos de un encargo de diseño en tres
salidas escritas: un prompt estructurado bajo el método CB&CB&CB, un mapa de proceso de nueve
fases y seis prompts de imagen para las piezas de marca.

Unidad Didáctica de Producción de Piezas Gráficas 2026 · Mg. Mario Quiroz Martínez.
Destinatario: estudiantes de segundo semestre de diseño publicitario.

## Qué hace y qué no hace

Recibe cliente, cantidad y soporte de las piezas, canales digitales, presupuesto en soles,
plazo en días hábiles, formato de entrega y los ámbitos de investigación del Context Box, y
devuelve texto ordenado. Ese texto se entrega a un modelo de lenguaje o a un modelo de imagen
para obtener el plan del proyecto o las piezas visuales.

No genera imágenes, no redacta el proyecto y no sustituye el trabajo de campo. Produce el
encargo escrito con el que se pide ese trabajo, y la base de fases contra la cual se revisa la
respuesta.

## Archivos

| Archivo | Contenido | Tamaño |
| --- | --- | --- |
| `index.html` | Interfaz, lógica y estilos propios en un solo archivo (1876 líneas) | 108 KB |
| `manifest.json` | Manifiesto PWA: nombre, iconos, `display: standalone`, color `#0f172a` | 0.8 KB |
| `sw.js` | Service worker; caché `prompts-da-v1` con los archivos locales y el CSS de Bootstrap | 1.4 KB |
| `icons/icon-192.png`, `icons/icon-512.png` | Iconos de instalación | 0.6 KB y 3.0 KB |
| `PROMPT.md` | Encargo de construcción de la aplicación, versión 3.0 | 21 KB |

## Ejecución

- **Doble clic sobre `index.html`.** Funciona en `file://`. En ese modo no se registra el
  service worker y el manifiesto se genera en memoria.
- **Servida por HTTP.** `python3 -m http.server` en la carpeta, o GitHub Pages. Registra el
  service worker, admite instalación como PWA y funciona sin conexión tras la primera visita.

Requiere un navegador con soporte de `localStorage`, `<details>` y `URL.createObjectURL`:
Chrome, Edge, Firefox o Safari en versiones de los últimos cinco años.

## Uso

1. Registrarse con nombre y apellidos, correo institucional, usuario y contraseña. La cuenta
   queda en el navegador donde se creó.
2. Pulsar «Plantilla Café Origen» para ver un encargo resuelto, o escribir el propio.
3. Revisar la vista previa del prompt, el mapa del proceso y los seis prompts de imagen, que se
   rehacen con cada tecla.
4. Contrastar con el checklist de once criterios de la guía estructural.
5. Copiar o descargar. Al copiar y al descargar, el prompt se archiva en el historial.

Cada etiqueta del formulario lleva un botón **?** con la regla de redacción del campo y un
ejemplo que se puede insertar con un clic. Son 26 instructivos: 24 en el panel y 2 en el
registro.

## El formulario, en cuatro pasos

| Paso | Campos |
| --- | --- |
| 1. Encargo | Cliente; cantidad y soporte; siete canales digitales en casillas más canales libres; presupuesto; plazo hábil; formato de entrega (Digital, Analógico, Mixto); metodología; estructura del prompt |
| 2. Context Box | Rol del director de arte; público del proyecto; objetivo; referentes y tendencias; expresión (tono, estilo, género y color); los «noes» |
| 3. Identidad visual | Concepto nuclear; símbolos y elementos icónicos; tipografía; paleta cromática; estilo gráfico; motor de imagen; persona emblemática; espacio emblemático |
| 4. Salidas solicitadas | Mapa de proceso; tabla de fases; desglose técnico; presupuesto por partidas; checklist de entrega |

## Salida 1: el prompt CB&CB&CB

El texto se arma con la ficha del encargo, los cuatro pasos del método —Context Box, Wall
Concept, Concept Board y Creative Book—, las salidas solicitadas con sus reglas, y la base de
fases calculada. La estructura elegida reordena esos bloques; el contenido es el mismo.

| Estructura | Componentes | Ventaja estratégica |
| --- | --- | --- |
| RACE | Rol, Acción, Contexto, Expectativa | El rol abre y la expectativa cierra: la respuesta se revisa sin releer el encargo |
| APE | Acción, Propósito, Expectativa | Menos de 120 palabras; admite varias consultas seguidas |
| IDEA | Instrucción, Detalle, Ejemplo, Ajuste | Solo se reescribe el ajuste, y se ve qué cambió entre versiones |
| TAG | Tarea, Acción, Meta | La meta queda en piezas, días y monto, comparables contra el cronograma |
| CARE | Contexto, Acción, Resultado, Ejemplo | El ejemplo fija el formato y reduce la variación entre respuestas |
| RISEN | Rol, Instrucciones, Pasos, Meta final, Acotación | Sostiene el orden de fases en textos largos y mantiene las exclusiones a la vista |

## Salida 2: el mapa del proceso

Nueve fases del brief a la publicación, con días asignados, entregable y su formato técnico,
responsable sugerido y restricciones.

- **Días.** Se reparten sobre pesos fijos (5, 20, 8, 10, 15, 20, 8, 8 y 6 %) con el método del
  resto mayor: la suma de la columna coincide siempre con el plazo declarado. Una fase con menos
  de un día se marca `<1`.
- **Formatos según entrega.** Analógico: PDF/X-1a:2001, CMYK, 300 ppp, 3 mm de sangrado, marcas
  de corte y troquel vectorial; prueba de color y ozalid firmado, a cargo de preprensa. Digital:
  PNG y JPG en sRGB, MP4 H.264 a 1080p y editables; validación en dispositivo real con contraste
  mínimo 4.5:1 y texto alternativo. Mixto suma ambos.
- **Formatos según canal.** La fila de adaptación se arma con los canales marcados: Instagram
  1080 × 1350 y 1080 × 1920 px; TikTok 1080 × 1920 px hasta 60 s; sitio web JPG o WebP de
  1600 px por debajo de 300 KB; email 600 × 1200 px; Pinterest 1000 × 1500 px; YouTube
  1920 × 1080 px con miniatura 1280 × 720 px; punto de venta PDF/X-1a a tamaño real.
- **Restricciones.** Citan el monto, el plazo, la fecha límite calculada saltando fines de
  semana, y los «noes» escritos en el formulario.

La tabla se copia en Markdown, se descarga en `.csv` y viaja dentro del prompt como base de
fases que el modelo debe respetar o discutir fila por fila.

## Salida 3: los prompts de imagen

| Pieza | Relación | Especificación propia |
| --- | --- | --- |
| Imagen de marca | 1:1 | Símbolo solo, fondo neutro, color plano, versión a color y a un color, sin escenografía ni sombras |
| Plano de la caja | 4:3 | Troquel desplegado, corte continuo y plegado discontinuo, pestañas, cotas en milímetros, proyección ortogonal |
| Envase | 4:5 | Tres cuartos, lente 85 mm, f/5.6, luz lateral difusa, sombra corta |
| Etiqueta | 2:3 | Arte plano al 100 %, jerarquía en cuatro niveles, zona de seguridad 4 mm, sangrado 3 mm |
| Persona emblemática | 4:5 | Retrato ambiental, plano medio, 50 a 85 mm, luz natural direccional |
| Espacio emblemático | 16:9 | Vista general, 24 a 35 mm, verticales corregidas, punto de vista a 1.60 m |

Cada prompt combina el concepto nuclear, los símbolos, la tipografía, la paleta, el estilo
gráfico, la expresión y el público con las especificaciones de la pieza. Las exclusiones suman
los «noes» del encargo y una salvaguarda fija: sin marcas de agua, sin texto ilegible, sin
logotipos de marcas existentes y sin imitación del estilo de un artista vivo identificable; en
la pieza de persona, sin reproducir el rostro de una persona real ni de una figura pública.

El selector de motor reescribe solo la línea final de parámetros: banderas
`--ar --style raw --q 2 --no` en Midjourney; prompt negativo con 30 pasos, CFG 6 y muestreador
DPM++ 2M Karras en Stable Diffusion; aviso de no incluir texto en DALL·E; relación y resolución
descritas en texto para Firefly y el modo genérico.

Cada pieza se copia por separado, las seis a la vez, o se descargan en su propio `.md`.

## Validación de los campos numéricos

- **Presupuesto.** `oninput` elimina lo que no sea dígito o punto, admite un solo separador
  decimal y recorta a dos decimales; `onblur` aplica `toFixed(2)`. La comprobación final usa
  `/^\d+(\.\d{1,2})?$/`. El prefijo `S/` vive en el `input-group`, no en el valor.
- **Plazo.** `Math.max(1, parseInt(valor) || 0)`. Un valor negativo, cero o vacío se ajusta a 1.
- **Retroalimentación.** El campo inválido recibe `border-red-500` e `is-invalid`, y su
  identificador entra en el conjunto `camposInvalidos`, que detiene el renderizado mientras no
  esté vacío. La validación es por campo: corregir el presupuesto no desbloquea un plazo
  inválido.

## Sesión y almacenamiento

Navegación tipo SPA: `showApp()` añade `hidden` a `#authSection` y lo retira de `#appSection`,
sin peticiones ni recargas. `window.onload` lee la sesión y entra directo al panel si existe.
`logout()` borra la sesión, reinicia el formulario y restaura la pantalla de acceso.

| Clave de `localStorage` | Contenido |
| --- | --- |
| `usuarios_prompts_da` | Objeto de cuentas: usuario, nombre, correo, contraseña y fecha de alta |
| `currentUser` | Sesión activa |
| `prompts_<usuario>` | Historial: `{ id, cliente, fecha, estructura, contenidoPrompt }`, con `unshift()`, máximo 50 registros y sin duplicados consecutivos |
| `checklist_<usuario>` | Índices de los criterios marcados en el checklist |

## Exportaciones

| Archivo | Contenido |
| --- | --- |
| `prompt-<cliente>-<estructura>.md` | Ficha del encargo en tabla, mapa del proceso, los seis prompts de imagen y el prompt principal en bloque de código |
| `prompt-<cliente>-<estructura>.csv` | BOM UTF-8, cabecera de 28 campos y una fila con todo el encargo más el prompt |
| `prompt-<cliente>-<estructura>.txt` | Solo el prompt principal |
| `mapa-proceso-<cliente>.csv` | Cabecera y nueve filas del mapa |
| `prompts-imagen-<cliente>.md` | Los seis prompts de imagen en bloques de código |

## PWA y funcionamiento sin conexión

El service worker precarga los archivos locales y el CSS de Bootstrap en el caché
`prompts-da-v1`, responde desde caché y devuelve `index.html` ante una navegación sin red. El
botón «Instalar app» aparece cuando el navegador dispara `beforeinstallprompt`, y una insignia
señala el estado sin conexión.

## Respaldos cuando falla la CDN

- `respaldoDeEstilos()` comprueba si `.row` recibió `display:flex`. Si no, inyecta una hoja
  mínima de rejilla, controles y utilidades, y la aplicación sigue operativa.
- El bundle de JavaScript de Bootstrap no se carga: el cajón del historial, el menú de usuario,
  la guía plegable y las tarjetas de imagen usan CSS propio, `<details>` y JavaScript vanilla.
- En `file://` el manifiesto se genera como blob en memoria con un icono SVG.
- El copiado recurre a `document.execCommand('copy')` cuando `navigator.clipboard` no está
  disponible.

## Mapa del código

El bloque `<script>` está dividido en secciones numeradas y comentadas, en este orden:

| Sección | Contenido |
| --- | --- |
| 1. Estado | `currentUser`, `promptActual`, `viendoHistorial`, `camposInvalidos` y las claves de almacenamiento |
| 2. Estructuras | `ESTRUCTURAS` con componentes, uso y ventaja; `CHECKLIST` |
| 2b. Instructivos por campo | `AYUDAS`, con reglas y ejemplo por campo |
| 3. Autenticación | `registrar()`, `login()`, `showApp()`, `logout()` |
| 4. Validación numérica | `sanitizarPresupuesto()`, `normalizarPresupuesto()`, `sanitizarDias()`, `marcarError()` |
| 5. Datos y prompt | `datosFormulario()`, `fichaEncargo()`, `bloquesEstructura()`, `construirPrompt()`, `actualizarPrompt()` |
| 5b. Mapa del proceso | `FASES()`, `repartirDias()`, `renderMapa()`, `mapaMarkdown()`, `mapaCSV()` |
| 5c. Prompts de imagen | `PIEZAS_IMAGEN()`, `construirPromptImagen()`, `renderImagenes()`, `paramsMotor()` |
| 6. Plantilla de caso | `PLANTILLA_CAFE`, `cargarPlantilla()`, `limpiarFormulario()` |
| 7. Historial | `guardarEnHistorial()`, `renderHistorial()`, `verDelHistorial()`, `volverAlActual()` |
| 8. Copiar y exportar | `copiarPrompt()`, `comoMarkdown()`, `comoCSV()`, `descargar()`, `bajarArchivo()` |
| 9. Guía y checklist | `pintarGuiaEstructura()`, `pintarChecklist()` |
| 10. Ayudas emergentes | `inyectarAyudas()`, `abrirAyuda()`, `insertarEjemplo()` |
| 11. Respaldo de estilos | `respaldoDeEstilos()` |
| 12. PWA | `instalarPWA()`, `estadoRed()`, `manifiestoDeRespaldo()` |
| 13. Arranque | `window.onload` |

El contenido generado se inserta con `textContent`, no con `innerHTML`.

## Pruebas

La versión publicada se verificó en Chromium con Playwright: registro y sesión persistente,
sanitización de presupuesto y plazo, las seis estructuras, copiado e historial, las cinco
descargas, suma exacta de días con 5, 15 y 40 días, cambio de formatos y responsables por tipo
de entrega, generación de las seis piezas de imagen y cambio de motor, apertura de los 24
instructivos a 1440 y 390 px, carga sin red tras la primera visita, ejecución desde `file://` y
ausencia de scroll horizontal a 390 px.

## Límites

- `localStorage` guarda las contraseñas en texto plano. No usar credenciales de otros servicios.
- Los datos viven en el navegador donde se creó la cuenta: no hay servidor ni sincronización.
- La primera visita necesita red para el CSS de Bootstrap; después queda en caché.
- Los modelos de imagen componen mal el texto: la tipografía real se monta en el archivo
  editable, no se pide al modelo.

## Referencia

Cano, J. (2012). *El método CB&CB&CB 1.0*. Máster en Diseño y Dirección de Arte, ELISAVA,
Barcelona.
