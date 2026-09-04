# Prompt de construcción — versión 2.0

Encargo para reconstruir la aplicación desde cero con todo lo que ya está implementado.
Sustituye a la versión 1.0 del encargo. Los datos técnicos corresponden al archivo entregado:
`index.html` de 1583 líneas y 89 KB, más `sw.js` (1.4 KB), `manifest.json` (0.8 KB) y dos
iconos PNG (0.6 KB y 3.0 KB).

---

Eres un desarrollador web con dominio de HTML, CSS y JavaScript. Construye una PWA con los
siguientes requisitos.

## Nombre de la aplicación

Generador de Prompts para Dirección de Arte y Gestión de Proyectos.

## Propósito

Convertir encargos reales de diseño —cliente, cantidad y soporte de las piezas, canales
digitales, presupuesto, plazo hábil y formato de entrega— en un prompt estructurado bajo el
método CB&CB&CB (Context Box, Concept Board, Creative Book), y calcular a partir de esos
mismos datos un mapa de proceso con fases, formatos técnicos, responsables y restricciones.

La aplicación no genera imágenes ni redacta el proyecto: produce el encargo escrito con el
que se pide ese trabajo a un modelo de lenguaje, y la base de fases contra la cual se revisa
la respuesta.

## Público objetivo

Estudiantes de segundo semestre de diseño publicitario. Unidad Didáctica de Producción de
Piezas Gráficas 2026, Mg. Mario Quiroz Martínez.

## Funcionalidades

1. **Formulario del encargo.** Cliente, cantidad y soporte, siete canales digitales en
   casillas más un campo de canales libres, presupuesto en soles, plazo en días hábiles,
   formato de entrega (Digital, Analógico, Mixto) y variante metodológica. Segundo bloque
   con los ámbitos del Context Box: rol del director de arte, público del proyecto,
   objetivo, referentes y tendencias, expresión y los «noes». Tercer bloque con las salidas
   solicitadas en casillas: mapa de proceso, tabla de fases, desglose técnico, presupuesto
   por partidas y checklist de entrega.
2. **Plantilla predeterminada.** Un botón autorrellena el caso «Café Origen»: 3 empaques con
   medidas, S/ 4800.00, 15 días hábiles, entrega mixta, cuatro canales y estructura RISEN.
   Un segundo botón limpia el formulario.
3. **Generación en tiempo real.** El prompt se reconstruye en cada `oninput`, `onchange` y
   `onblur`, sin botón de generar.
4. **Instructivo emergente por campo.** Cada etiqueta lleva un botón `?` que abre una
   ventana con el nombre del dato, entre dos y cinco reglas de redacción y un ejemplo
   escrito. En los campos de texto, un botón «Insertar ejemplo» escribe ese valor y dispara
   la validación y el renderizado. Son 18 instructivos: 16 del formulario y 2 del registro.
   La ventana se cierra con `Escape`, con un clic fuera o con su botón, y se reposiciona
   para no salir de pantalla.
5. **Mapa del proceso calculado.** Tabla de ancho completo con nueve fases del brief a la
   publicación: Brief y encargo, Context Box, Wall Concept, Concept Board, Creative Book,
   Producción de piezas, Validación técnica, Adaptación por canal, Publicación o entrega.
   Columnas: fase, días, entregable con su formato técnico, responsable sugerido y
   restricciones. Detalle en el apartado «Interacción», punto 4.
6. **Copiado al portapapeles.** Botón que cambia a «Copiado» durante 1.6 s y notificación
   emergente. Recurre a `document.execCommand('copy')` cuando `navigator.clipboard` no está
   disponible, caso de `file://`.
7. **Exportación.** Prompt en `.md` (con ficha de datos en tabla, mapa del proceso y prompt
   en bloque de código), `.csv` (BOM UTF-8, cabecera de 20 campos y una fila de datos) y
   `.txt`. El mapa se exporta aparte en `.csv` y se copia en Markdown.
8. **Historial por usuario.** Clave `prompts_<usuario>` con registros
   `{ id, cliente, fecha, estructura, contenidoPrompt }`, insertados con `unshift()`,
   limitados a 50 y sin duplicados consecutivos. Panel lateral con botones que reinyectan
   cualquier prompt antiguo en la vista previa; un aviso permite volver al actual.
9. **Guía estructural.** Checklist de once criterios con estado guardado en
   `checklist_<usuario>`, comparativa de las seis estructuras con su uso y su ventaja
   estratégica, y las tres etapas del método con su lectura en canales digitales.
10. **Panel explicativo.** Bloque desplegado al inicio del panel con cuatro apartados: qué
    es el aplicativo, qué hace por dentro, qué practica el estudiante en la unidad didáctica
    y cómo se trabaja con él.
11. **Métricas del encargo.** Cuatro contadores sobre la vista previa: piezas detectadas en
    el campo de soporte, días hábiles, presupuesto y palabras del prompt.
12. **PWA.** Manifiesto, service worker, iconos de 192 y 512 px, botón de instalación con
    `beforeinstallprompt` e indicador de «Sin conexión».

## Diseño y estilo visual

- Modern Dark / Slate con acento ámbar `#D97706`; escala de grises de `#020617` a `#f1f5f9`.
- Tipografía Inter con `system-ui` como respaldo.
- Dos columnas en escritorio: formulario a la izquierda (`col-lg-5`), vista previa a la
  derecha (`col-lg-7`) con posición fija al hacer scroll. El mapa del proceso ocupa una
  sección de ancho completo debajo. Una sola columna por debajo de 992 px.
- Sin scroll horizontal de página en 390 px. Las tablas se desplazan dentro de su propio
  contenedor.

## Interacción y comportamiento

### 1. Validación sintáctica de campos numéricos

- **Presupuesto.** En `oninput` se eliminan los caracteres que no sean dígito o punto, se
  admite un solo separador decimal y se recorta a dos decimales; en `onblur` se aplica
  `toFixed(2)`. La comprobación final usa `/^\d+(\.\d{1,2})?$/`. El prefijo `S/` vive en el
  `input-group`, no en el valor.
- **Días hábiles.** `Math.max(1, parseInt(valor) || 0)`. Un valor negativo, cero o vacío se
  reajusta a 1.
- **Retroalimentación.** El campo inválido recibe las clases `border-red-500` e
  `is-invalid`, y su identificador entra en un conjunto `camposInvalidos`; mientras ese
  conjunto no esté vacío, la actualización del prompt queda detenida. La validación es por
  campo: corregir el presupuesto no desbloquea un plazo inválido.

### 2. Cambio dinámico entre autenticación y panel principal

| Mecanismo | Funcionamiento técnico |
| --- | --- |
| Manejo de estado | `currentUser` almacena la identidad tras validar credenciales en `localStorage` (clave `usuarios_prompts_da`). |
| Alternancia de vistas | `showApp()` añade la clase `hidden` a `#authSection` y la retira de `#appSection`. |
| Persistencia de sesión | En `window.onload` se lee la clave `currentUser`; si existe, se entra directamente al panel. |
| Cierre de sesión | `logout()` borra la sesión, reinicia el formulario, cierra menú e historial y restaura la pantalla de acceso. |

El registro pide nombre y apellidos, correo institucional, usuario y contraseña, y valida
que el nombre tenga al menos dos palabras, que el correo cumpla el patrón de dirección y que
el usuario tenga entre 3 y 20 caracteres sin espacios.

### 3. Persistencia del historial

Descrita en Funcionalidades, punto 8. El guardado ocurre al copiar y al descargar, en
cualquiera de los formatos.

### 4. Mapa del proceso

- **Reparto del plazo.** Los días se distribuyen sobre pesos fijos por fase (5, 20, 8, 10,
  15, 20, 8, 8 y 6 %) con el método del resto mayor, de modo que la suma de la columna
  coincida siempre con el plazo declarado. Una fase con menos de un día se marca `<1`.
- **Formatos según entrega.** Analógico: PDF/X-1a:2001, CMYK, 300 ppp, 3 mm de sangrado,
  marcas de corte y troquel vectorial; validación con prueba de color y ozalid firmado, a
  cargo de preprensa. Digital: PNG y JPG en sRGB, MP4 H.264 a 1080p y editables; validación
  en dispositivo real con contraste mínimo 4.5:1 y texto alternativo, a cargo de desarrollo
  o gestión de contenidos. Mixto suma ambos.
- **Formatos según canal.** La fila de adaptación se arma con los canales marcados:
  Instagram 1080 × 1350 y 1080 × 1920 px; TikTok 1080 × 1920 px, MP4 H.264, hasta 60 s;
  sitio web JPG o WebP de 1600 px por debajo de 300 KB; email 600 × 1200 px con menos de
  1 MB; Pinterest 1000 × 1500 px; YouTube 1920 × 1080 px con miniatura 1280 × 720 px; punto
  de venta PDF/X-1a a tamaño real.
- **Restricciones.** Citan el monto, el plazo, la fecha límite calculada y los «noes»
  escritos en el formulario, e incluyen el registro de modelo, versión, prompt y semilla
  para el material producido con modelos generativos.
- **Salidas.** La tabla se copia en Markdown, se descarga en `.csv`, entra en el `.md` y
  viaja dentro del prompt como base de fases, con la instrucción de respetarla o indicar en
  qué fila se cambia y por qué.

## Contenido metodológico obligatorio

### Las tres etapas, con su registro actual

- **Context Box.** Nueve ámbitos de investigación: contexto, referentes, tendencias, trabajo
  de campo, la imagen, el relato, la palabra, la expresión y los «noes». Todo se almacena en
  una caja analógica y se traslada al *wall concept*. En canales digitales y con modelos
  generativos: los nueve ámbitos no cambian, cambia el registro. Cada captura se archiva con
  URL, autor y fecha de consulta; cada imagen obtenida de un modelo, con modelo, versión,
  prompt y semilla. El trabajo de campo sigue siendo presencial.
- **Concept Board.** Documento A4 con una frase sintética de la idea nuclear, imágenes de
  anclaje y una disposición que transmite valores expresivos. Un solo concepto por proyecto.
  Hoy la frase es además el núcleo del prompt maestro y la base del texto de las piezas; las
  imágenes generadas se marcan como prueba. Publicar en cinco canales autoriza cinco
  declinaciones de forma, no cinco conceptos.
- **Creative Book.** Universo Visual Sintético: manual que transmite la estrategia estética a
  realizadores y especialistas. Incorpora medidas y duración por formato, límite de peso,
  contraste 4.5:1 y texto alternativo; con material generativo, el prompt base, el modelo y
  su versión, la semilla, los parámetros y los criterios de descarte.

Referencia: Cano, J. (2012). *El método CB&CB&CB 1.0*. Máster en Diseño y Dirección de Arte,
ELISAVA, Barcelona.

### Las seis estructuras, con uso y ventaja estratégica

| Estructura | Componentes | Uso | Ventaja estratégica |
| --- | --- | --- | --- |
| RACE | Rol, Acción, Contexto, Expectativa | Encargo completo con cliente definido | El rol abre el texto y la expectativa lo cierra: la respuesta se revisa contra el formato pedido sin releer el encargo |
| APE | Acción, Propósito, Expectativa | Consultas breves | Menos de 120 palabras, admite varias consultas seguidas en una sesión |
| IDEA | Instrucción, Detalle, Ejemplo, Ajuste | Corrección por rondas | Solo se reescribe el bloque de ajuste, lo que deja ver qué cambió entre versiones |
| TAG | Tarea, Acción, Meta | Gestión de proyecto | La meta queda en piezas, días y monto, comparables contra el cronograma |
| CARE | Contexto, Acción, Resultado, Ejemplo | El contexto de marca pesa más que la ejecución | El ejemplo fija el formato y reduce la variación entre respuestas del equipo |
| RISEN | Rol, Instrucciones, Pasos, Meta final, Acotación | Proyectos con fases y varios especialistas | Sostiene el orden de las fases en textos largos y mantiene las exclusiones a la vista |

La estructura elegida reordena los bloques del prompt; el contenido del encargo es el mismo.

### Checklist de once criterios

Rol declarado; tarea en una frase con verbo de acción; cliente, piezas y soporte; canales y
formatos; presupuesto y plazo; público del proyecto; referentes y tendencias; tono, estilo,
género y paleta; los «noes»; formato de salida exigido; criterio de verificación.

## Tecnologías y estructura

Arquitectura de archivo único: interfaz, lógica y estilos propios en `index.html`. Sin
empaquetadores, sin `npm install` y sin backend. Se ejecuta abriendo el archivo o servido por
HTTP.

- **HTML5.** Etiquetas `<nav>`, `<main>`, `<section>`, `<aside>`, `<footer>` y `<details>`;
  atributos nativos `required`, `type="email"`, `type="password"`, `type="number"`.
- **Bootstrap 5.3.3, solo la hoja de estilos, por CDN.** Rejilla, formularios y utilidades.
  El bundle de JavaScript no se carga: el cajón del historial, el menú de usuario y la guía
  plegable se resuelven con CSS propio, `<details>` y JavaScript vanilla, de modo que la
  aplicación sigue operativa si la CDN no responde. Las dos clases utilitarias que el
  proyecto usa por nombre, `hidden` y `border-red-500`, se declaran en la hoja propia.
- **JavaScript vanilla ES6+.** Manejo de eventos, `classList`, `localStorage` con
  `JSON.stringify` y `JSON.parse`, plantillas de cadena y `Blob` con `URL.createObjectURL`
  para las descargas.
- **Respaldos.** `respaldoDeEstilos()` comprueba si `.row` recibió `display:flex`; si no,
  inyecta una hoja mínima de rejilla, controles y utilidades. En `file://` el manifiesto se
  genera en memoria como blob con un icono SVG y el service worker no se registra.
- **Service worker.** Precarga los archivos locales y el CSS de Bootstrap; responde desde
  caché y devuelve `index.html` ante una navegación sin red.

### Balance técnico

| Criterio | Ventajas | Límites |
| --- | --- | --- |
| Despliegue | Basta con compartir el `.html`; los tres archivos restantes solo hacen falta para instalar la PWA | La primera visita necesita red para el CSS de Bootstrap; a partir de ahí queda en caché |
| Mantenimiento | Todo el proyecto está en un lugar visible | 1583 líneas: conviene mantener los comentarios de sección numerados |
| Seguridad | No expone servidores ni bases de datos | `localStorage` guarda las contraseñas en texto plano; no aplica a información bancaria o médica |
| Rendimiento | 89 KB de HTML, sin dependencias de JavaScript externas | El CSS de la CDN pesa más que una hoja purgada |

## Requisitos adicionales

- Registro del estudiante con nombre, apellidos y correo institucional; ambos datos
  encabezan cada prompt exportado.
- Footer con «Unidad Didáctica de Producción de Piezas Gráficas 2026 · Mg. Mario Quiroz
  Martínez» y la referencia del método. La firma aparece también en la pantalla de acceso y
  al cierre del `.md`.
- Botones de descarga en Markdown, CSV y texto plano, más el CSV del mapa.
- Guía estructural con el checklist, las seis estructuras y las etapas del método.

## Instrucciones finales

Entrega la aplicación en un único archivo HTML listo para ejecutarse, acompañado de
`manifest.json`, `sw.js` y los dos iconos PNG para la instalación y el uso sin conexión. Usa
Bootstrap 5 para la rejilla y los controles. El diseño debe funcionar en móvil sin scroll
horizontal de página.

## Criterios de aceptación

La entrega se comprueba con estas verificaciones, todas automatizables en navegador:

1. Registro, inicio de sesión, sesión persistente tras recargar y cierre de sesión.
2. Credenciales incorrectas muestran aviso y no entran al panel.
3. La plantilla «Café Origen» rellena los doce campos de texto del encargo, los dos selectores y las casillas de canales y salidas.
4. `abc123.456` en presupuesto queda como `123.45`; `12..3` queda como `12.3`; el campo
   vacío no marca error; `onblur` normaliza a dos decimales.
5. `-7` y `0` en días quedan en `1`.
6. Las seis estructuras cambian los bloques del prompt y su cabecera.
7. Copiar deja el texto en el portapapeles y suma un registro al historial; un clic en el
   historial reinyecta el prompt y el aviso permite volver al actual.
8. Las tres descargas del prompt y el CSV del mapa producen archivos con nombre derivado del
   cliente; el CSV del mapa tiene cabecera y nueve filas.
9. La suma de la columna de días coincide con el plazo para 5, 15 y 40 días; con 5 días
   aparecen fases marcadas `<1`.
10. Cambiar el formato de entrega cambia formatos técnicos y responsables de las filas de
    producción, validación y entrega.
11. Los 16 botones `?` del panel abren su instructivo dentro de la pantalla en 1440 y en
    390 px, e insertan el ejemplo donde corresponde.
12. La aplicación carga y genera prompts sin red tras la primera visita, y funciona abierta
    desde `file://` sin errores de consola.
13. Sin scroll horizontal de página a 390 px; la tabla del mapa se desplaza dentro de su
    contenedor.
