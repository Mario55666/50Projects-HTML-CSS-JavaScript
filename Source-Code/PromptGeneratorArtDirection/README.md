# Generador de Prompts para Dirección de Arte y Gestión de Proyectos

Aplicación web de una sola página que convierte los datos de un encargo de diseño
(cliente, cantidad y soporte, canales digitales, presupuesto, plazo hábil y formato de
entrega) en un prompt estructurado según el método CB&CB&CB —Context Box, Concept Board,
Creative Book— descrito por Jordi Cano (ELISAVA, 2012).

Destinatario: estudiantes de segundo semestre de diseño publicitario, Unidad Didáctica de
Producción de Piezas Gráficas 2026, Mg. Mario Quiroz Martínez.

El aplicativo no genera imágenes ni redacta el proyecto: produce el encargo escrito con el
que se pide ese trabajo a un modelo de lenguaje. El estudiante ejercita cuatro operaciones:
traducir un brief a lenguaje verbal preciso, cuantificar el encargo, declarar los «noes»
antes de producir y fijar el formato de salida que se exige. Esa explicación aparece en el
panel «Qué es "Generador de Prompts · Dirección de Arte" y para qué sirve», desplegado al
inicio del panel principal.

## Archivos

| Archivo | Contenido |
| --- | --- |
| `index.html` | Interfaz, lógica y estilos propios en un solo archivo (60 KB aprox.). |
| `manifest.json` | Manifiesto PWA: nombre, iconos, `display: standalone`, color `#0f172a`. |
| `sw.js` | Service worker: precarga los archivos locales y el CSS de Bootstrap; responde desde caché cuando no hay red. |
| `icons/icon-192.png`, `icons/icon-512.png` | Iconos de instalación. |

## Ejecución

- Doble clic sobre `index.html`: la aplicación funciona en `file://`. En ese modo no se
  registra el service worker y el manifiesto se genera en memoria.
- Servida por HTTP (`python3 -m http.server`, GitHub Pages): registra el service worker,
  admite instalación como PWA y funciona sin conexión tras la primera visita.

## Funciones

1. **Formulario del encargo.** Cliente, cantidad y soporte, siete canales digitales más
   canales libres, presupuesto en soles, plazo en días hábiles, formato de entrega
   (digital, analógico o mixto) y variante metodológica.
2. **Plantilla «Café Origen».** Un botón rellena el caso de estudio completo: 3 empaques,
   S/ 4800.00, 15 días hábiles, entrega mixta y estructura RISEN.
3. **Vista previa en tiempo real.** El prompt se reconstruye en cada `oninput`,
   `onchange` y `onblur`.
4. **Seis estructuras de prompt.** RACE, APE, IDEA, TAG, CARE y RISEN. Cada una reordena
   los bloques del texto generado y aparece descrita en la guía lateral.
5. **Copiado y exportación.** Botón de copia con notificación emergente y descarga en
   `.md`, `.csv` (con BOM UTF-8, una fila de datos y el prompt completo) y `.txt`.
6. **Historial por usuario.** Clave `prompts_<usuario>` en `localStorage`, con registros
   `{ id, cliente, fecha, estructura, contenidoPrompt }` insertados con `unshift()` y
   limitados a 50. Un clic reinyecta cualquier prompt antiguo en la vista previa.
7. **Checklist de once criterios** del prompt y resumen de las etapas CB&CB&CB, con estado
   guardado en `checklist_<usuario>`.
8. **Mapa del proceso.** Tabla de ancho completo con nueve fases, del brief a la
   publicación o entrega: Context Box, Wall Concept, Concept Board, Creative Book,
   producción, validación técnica, adaptación por canal y entrega. Cada fila indica días
   asignados, entregable con su formato técnico, responsable sugerido y restricciones. Los
   formatos cambian según el formato de entrega —PDF/X-1a con 3 mm de sangrado para
   impresión, sRGB y MP4 H.264 para digital— y según los canales marcados (1080 × 1350 y
   1080 × 1920 px para Instagram, 1080 × 1920 px hasta 60 s para TikTok, y así). El plazo se
   reparte con el método del resto mayor, de modo que la suma de la columna coincide con el
   total declarado; una fase con menos de un día se marca «<1». La tabla se copia en
   Markdown, se descarga en `.csv`, entra en el `.md` exportado y viaja dentro del prompt
   como base de fases que el modelo debe respetar o justificar.
9. **Prompts de imagen de la marca.** Sección con seis piezas: imagen de marca (1:1), plano
   de la caja o troquel (4:3), envase (4:5), etiqueta (2:3), persona emblemática (4:5) y
   espacio emblemático (16:9). Cada prompt se arma con el concepto nuclear, los símbolos,
   la tipografía, la paleta, el estilo gráfico y el público declarados en el paso 3, más las
   especificaciones técnicas de la pieza: encuadre y óptica, luz y materialidad, contenido
   obligatorio y nota de producción. Las exclusiones suman los «noes» del encargo y una
   salvaguarda fija contra marcas de agua, logotipos de marcas existentes, imitación del
   estilo de un artista vivo identificable y reproducción del rostro de personas reales. El
   selector de motor —Genérico, Midjourney, DALL·E, Firefly, Stable Diffusion— cambia solo
   la línea final de parámetros. Cada pieza se copia por separado, las seis a la vez, o se
   descargan en `.md`.
10. **Ventaja estratégica por estructura.** Cada una de las seis estructuras declara para
   qué sirve y qué gana quien la elige; el texto aparece bajo el selector, en la ayuda
   emergente y en la guía comparativa.
11. **Instructivo por campo.** Cada etiqueta lleva un botón `?` que abre una ventana
   emergente con la regla de redacción del campo, entre dos y cuatro indicaciones y un
   ejemplo. Donde el campo admite texto, un botón inserta ese ejemplo y dispara la
   validación y el renderizado. Los dieciséis instructivos están en la constante `AYUDAS`
   y se inyectan en `window.onload` con `inyectarAyudas()`; la ventana se cierra con
   `Escape`, con un clic fuera o con su propio botón. Con los ocho campos de identidad
   visual son 24 instructivos en el panel y 2 en el registro.

## El método CB&CB&CB y su lectura actual

La guía del aplicativo mantiene las tres definiciones del método —Context Box con sus nueve
ámbitos, Concept Board con un único concepto por proyecto, Creative Book como Universo
Visual Sintético— y añade a cada una su registro en canales digitales y con modelos
generativos: archivo de referencias con URL, autor y fecha; registro de modelo, versión,
prompt y semilla para el material generado; especificaciones por formato, límite de peso,
contraste mínimo de 4.5:1 y texto alternativo en el manual. El trabajo de campo con
usuarios, la regla de un concepto por proyecto y la declaración de los «noes» se mantienen
sin delegar.

## Validación de campos numéricos

- Presupuesto: `oninput` elimina lo que no sea dígito o punto, permite un solo separador
  decimal y recorta a dos decimales; `onblur` aplica `toFixed(2)`. La comprobación final
  usa `/^\d+(\.\d{1,2})?$/`.
- Plazo: `Math.max(1, parseInt(valor) || 0)`. Un valor negativo, cero o vacío se ajusta a 1.
- Un campo inválido recibe las clases `border-red-500` e `is-invalid` y su identificador
  entra en el conjunto `camposInvalidos`, que detiene el renderizado del prompt hasta que
  se corrija el dato.

## Navegación y sesión

- `currentUser` guarda la identidad tras validar las credenciales en `localStorage`.
- `showApp()` añade la clase `hidden` a `#authSection` y la retira de `#appSection`.
- `window.onload` lee la clave `currentUser` y salta al panel si existe.
- `logout()` borra la sesión, reinicia el formulario y devuelve la pantalla de acceso.

## Dependencias

CSS de Bootstrap 5.3.3 por CDN, cacheado por el service worker. No se usa el bundle de
JavaScript de Bootstrap: el cajón del historial, el menú de usuario y la guía plegable
están resueltos con CSS propio, `<details>` y JavaScript vanilla, de modo que la aplicación
sigue operativa si la CDN no responde. En ese caso `respaldoDeEstilos()` inyecta una hoja
mínima de rejilla y controles.

## Límites

`localStorage` guarda las contraseñas en texto plano y los datos quedan en el navegador
donde se registró la cuenta. No hay servidor ni sincronización entre dispositivos.

## Referencia

Cano, J. (2012). *El método CB&CB&CB 1.0*. Máster en Diseño y Dirección de Arte, ELISAVA,
Barcelona.
