# Prompt actualizado — Mesa de Producción Textil Andes

Versión actualizada de la especificación original, con todas las modificaciones
efectivamente desarrolladas en `index.html` durante la construcción de la app. Úsala
como referencia de lo que la aplicación hace hoy (no como historial de la conversación).

---

Eres un experto en desarrollo de aplicaciones web con dominio en HTML, CSS y JavaScript.

Crea una aplicación PWA (Progressive Web App) con los siguientes requisitos:

### Nombre de la Aplicación

MESA DE PRODUCCIÓN TEXTIL ANDES

### Propósito / Función Principal

DINÁMICA: "MESA DE PRODUCCIÓN TEXTIL ANDES – RESOLVIENDO CUELLOS DE BOTELLA"

**Objetivo general:** que los participantes resuelvan, mediante negociación, planificación
estratégica y creatividad técnica, los 3 vacíos de información identificados en el
briefing, generando un cronograma integrado que conecte el taller de estampado, el
departamento de diseño y el equipo de redes sociales.

- **Duración estimada:** 60 minutos.
- **Participantes:** grupos de 6 a 24 personas (divididos en 3 equipos), o registro
  individual.
- **Materiales físicos de apoyo:** copias de las 3 preguntas, papelógrafos, post-its,
  marcadores y el dossier impreso del caso "Textil Andes".

**Las 3 preguntas críticas del briefing:**

1. **Secado vs. Empaquetado** (Equipo A · Gerencia de Taller / Logística).
2. **Adaptación del arte**: 2 tintas planas vs. degradados (Equipo B · Dirección de
   Arte / Serigrafía).
3. **Protocolo de aprobación y retraso por luz natural** (Equipo C · Community
   Management / Producción Audiovisual).

La secuencia de la dinámica (lluvia de ideas individual → formación de equipos →
propuesta de solución con Plan B e indicador de éxito → feria de soluciones → macro-
cronograma integrado → cierre reflexivo) se documenta íntegra dentro de la propia app,
en la sección **"📚 Dossier del caso y guía de la dinámica"** (acordeón con 4 bloques:
briefing, secuencia de 60 min, equipos/roles/respuestas esperadas, y macro-cronograma
de 3 días), para que el facilitador la tenga siempre a mano sin salir de la aplicación.

### Público Objetivo

Estudiantes de segundo semestre de la Carrera de Diseño Publicitario.

### Funcionalidades Desarrolladas

La app implementa un **Panel de Control Flotante (HUD)** anclado a la vista del
usuario (siempre visible, `position:fixed`, no depende de la rotación de la cámara),
más una **segunda pantalla flotante independiente**: el Glosario de términos.

#### 📐 Diseño del Panel (HUD)

- **Ubicación:** esquina inferior izquierda, superpuesto al render 3D
  (`pointer-events:auto`), colapsable con un botón `▾/▴`.
- **Estilo:** fondo `rgba(10,10,20,0.85)` con `backdrop-filter: blur(10px)`, bordes
  redondeados y sombra — paleta IDC (`#f3a100`, `#0072b9`) + acentos "Andes"
  (terracota `#c65d3a`, mostaza `#e0a83e`, cian `#25d3d3`).
- **Botones:** 4 botones rectangulares con ícono + texto, tipografía Rajdhani,
  resalte dorado en hover/focus, y **barra de progreso unificada** en la cabecera
  ("Progreso: N% · Resuelve retos para desbloquear el render final").
- **Tooltips:** atributo `data-tip` + CSS `::after` (sin librería adicional) muestran
  una descripción emergente al pasar el cursor o al enfocar con teclado.

#### 1️⃣ 📝 Preguntas dinámicas

- Banco de **10 preguntas** de opción múltiple (3 originales del caso + 7 derivadas),
  cada una con: 4 opciones, explicación técnica, "Dato extra", una **pista contextual**
  y un texto de **"aporte"** (cómo esa respuesta contribuye a resolver su fase).
- Cada pregunta muestra un **badge de fase numerado** (`Fase N/12 · nombre`) antes de
  responder, y un botón **"💡 Ver ayuda antes de responder"** que revela la pista sin
  dar la respuesta.
- La retroalimentación (correcta e incorrecta) siempre indica la fase y el aporte —
  no solo si acertó o falló.
- **Hipervínculo 3D:** acertar la Pregunta 1 (Fase 5) llama a `map().flashTaller()`,
  que ilumina en verde el nodo correspondiente del mapa.

#### 2️⃣ 🧩 Adivinanzas textiles

- Banco de **7 acertijos** de vocabulario serigráfico y andino (serigrafía, emulsión
  fotosensible, rasero, rack de secado, halftone, motivo andino, paleta de color
  tierra), cada uno con pista bajo demanda (botón "💡 Pista"), fase asignada y aporte.
- Al acertar se desbloquea un **comodín** (-3 s en el Reto contra reloj) y se enruta
  la recompensa 3D según la fase real del término: si es de **Producción** llama a
  `map().flashTaller()`; si es de **Diseño**, a `map().resolveEstudio()`.
- Al fallar, `map().illuminateFloor()` resalta brevemente la grilla del suelo 3D
  como pista visual.

#### 3️⃣ ⚡ Retos contra reloj

- Minijuego de ordenamiento: 5 tarjetas (Aprobar diseño, Preparar tinta, Secar al
  ambiente, Doblar polo, Publicar en IG) a reordenar por clic en **15 segundos**
  (12 s si ya se desbloqueó el comodín).
- Incluye botón **"💡 Ver ayuda antes de empezar"** con una pista de razonamiento
  (agrupar en aprobar → producir → comunicar) sin revelar el orden exacto.
- El orden perfecto llama a `map().showTrophy()` (trofeo 3D sobre el nodo Fase 12) y
  también a `map().flashTaller()`, reforzando que la secuencia pertenece a la misma
  fase (5) que la Pregunta 1; activa el Plan B de entregas escalonadas.

#### 4️⃣ 🎨 Generador de prompts & anagramas

- **Modo 1 — Anagramas:** 6 palabras clave del caso (Textura, Paleta, Andino,
  Halftone, Vectorial, Serigrafía) con 3 intentos cada una; cada acierto desbloquea
  una palabra clave (con su fase y aporte) reutilizable en el generador.
- **Modo 2 — Generador de prompts:** 3 selectores (Estilo / Color / Formato) +
  chips de palabras clave desbloqueadas; el botón "⚙️ Generar prompt" compone un
  prompt en inglés listo para Midjourney/Stable Diffusion.
- Incluye un **banner de propósito** al inicio de la pestaña explicando que el
  prompt no es un ejercicio aislado, sino el insumo que el Equipo B entrega al
  Equipo C; y, tras generar, un bloque dinámico que indica explícitamente
  **"Fase 6/12"** (Diseño) → **"Fase 7/12"** (Publicación) y cómo se usa.
- **Hipervínculo 3D:** cada generación llama a `map().updateOfficeScreen(prompt)`,
  que redibuja el `CanvasTexture` del monitor 3D ubicado junto al nodo Fase 7.

#### 🔗 Integración y flujo dentro del mapa 3D

- **Barra de progreso unificada** en el HUD (0–100%, 4 retos).
- **Recompensas visuales en 3D** vía una API pública única expuesta como
  `window.AndesMap`, con los métodos: `flashTaller()`, `resolveEstudio()`,
  `updateOfficeScreen(text)`, `showTrophy()`, `illuminateFloor()`, `finalRender()`
  (esta última se dispara automáticamente al llegar al 100% de progreso).
- **Accesibilidad:** todos los botones tienen `aria-label`; los modales usan
  Bootstrap 5 (cierre con botón grande "✕" y tecla `ESC` nativos); el Glosario y el
  panel del mapa también cierran con `ESC`.

#### 📖 Glosario de términos — pantalla flotante (nuevo)

- Botón circular **📖** fijo en la esquina inferior derecha (independiente del HUD),
  siempre visible, `aria-expanded` sincronizado.
- Al abrirse despliega un panel flotante (`backdrop-filter: blur`, mismo lenguaje
  visual del HUD) con: buscador en vivo (`input type="search"`, sin distinción de
  acentos ni mayúsculas) y **20 términos técnicos** (Dossier, Briefing, Motivo
  andino, Cuello de botella, Serigrafía, Emulsión fotosensible, Rasero, Rack de
  secado, Curado, Moodboard, Paleta de color tierra, Textura, Vectorial, Halftone,
  Ganancia de punto/TVI, Prompt, Community Manager, Reel de making-of, Plan B,
  Indicador de éxito), **agrupados por la fase numerada del mapa 3D** a la que
  pertenecen (los dos últimos son transversales y no llevan fase fija).
- Cierra con botón "✕" o tecla `ESC`.

#### 🎯 Retroalimentación con identificación numérica de fase (1–12) — nuevo

En **todas** las actividades (Preguntas, Adivinanzas, Retos, Anagramas y Generador
de prompts) cada interacción sigue el ciclo
**instrucción → interacción → respuesta → retroalimentación → fase del proceso**:

- Un **badge de fase** (`Fase N/12 · nombre`) identifica en qué paso del mapa 3D se
  encuentra la actividad, calculado desde un único registro `FASES` (12 entradas,
  una por nodo) compartido entre el mapa y la lógica de la app.
- La retroalimentación —correcta **e** incorrecta— siempre explica **cómo esa
  respuesta contribuye** a resolver esa fase concreta del dossier (bloque
  "🧩 Cómo contribuye" / "🧩 Por qué importa"), no solo si fue acertada.

#### 🧭 Ayuda contextual antes de responder — nuevo

Ninguna actividad se limita a marcar correcto/incorrecto después del hecho:

- **Preguntas dinámicas** y **Retos contra reloj** incorporan un botón de ayuda
  (`💡 Ver ayuda…`) que revela una pista de razonamiento **antes** de responder, sin
  entregar la respuesta.
- **Adivinanzas** ya contaba con un botón "💡 Pista" bajo demanda; se mantiene y se
  refuerza con el aporte de fase en el feedback.
- **Anagramas** muestran la pista de forma permanente junto al espacio de respuesta.

#### 🗺️ Pop-ups emergentes en el mapa 3D — nuevo

- Cada uno de los **12 nodos** dispara, al pasar el cursor, un **pop-up flotante**
  (`#nodeHoverTip`) con su nombre y su fase ("Fase N de 12"), posicionado junto al
  cursor y con contraste alto (texto casi blanco sobre fondo casi negro).
- Un clic sobre el nodo abre además el **panel lateral** (`#nodePanel`) con la
  descripción completa, un tag de tipo (PROCESO/DECISIÓN/INICIO/FIN) y un tag de
  fase — ambos pop-ups quedan explícitamente vinculados al elemento visual y a la
  fase del proceso que representa.

#### 🎨 Revisión de contraste y legibilidad — nuevo

- Texto claro sobre fondos oscuros en toda la interfaz (tema oscuro consistente);
  los nuevos badges/cajas de ayuda siguen ese mismo criterio.
- La hoja de estilos de impresión (`@media print`) fuerza texto oscuro sobre fondo
  blanco en todos los bloques que se imprimen (acordeón del dossier, tablas,
  tarjetas `.glass`), evitando el contraste insuficiente de un tema oscuro impreso
  en papel.

### Diseño y Estilo Visual

Tecnología espacial 3D con líneas de proyección, perspectiva e isometría: grilla
`GridHelper`, líneas de proyección verticales desde cada nodo hasta el suelo,
conexiones curvas (Bézier cuadrática) entre nodos, niebla (`FogExp2`) y una
paleta oscura de fondo (`#070b1c → #0a1028 → #0c1226`) con acentos IDC/Andes.

### Mapa 3D — Interacción y Comportamiento

El mapa reemplaza el flujo por "zonas Taller/Estudio/Oficina" de una versión previa
por un **diagrama de flujo de 12 fases numeradas** (Three.js ESM + los addons
`OrbitControls` y `CSS2DRenderer`), que va de la **Fase 1** (comienzo) a la
**Fase 12** (término):

| Fase | Nodo (`id`) | Paso |
|---|---|---|
| 1  | `inicio` | Recepción y observación del dossier |
| 2  | `extraccion` | Extracción de datos duros |
| 3  | `deteccion` | Detección de cuellos de botella |
| 4  | `decision_vacios` | Decisión: ¿hay vacíos de información? |
| 5  | `pregunta1` | Pregunta 1 · Secado vs. empaquetado (Taller) |
| 6  | `pregunta2` | Pregunta 2 · Adaptación del arte (Diseño) |
| 7  | `pregunta3` | Pregunta 3 · Aprobación y publicación (CM) |
| 8  | `relectura` | Relectura forzada (si no hay vacíos) |
| 9  | `trasladar` | Trasladar las preguntas al cuaderno |
| 10 | `validacion` | Validación ética (sin fuentes externas) |
| 11 | `reformular` | Reformular pregunta (si se rompió la regla) |
| 12 | `cierre` | Cierre y entrega a la mesa de producción |

Comportamiento implementado:

- **Cámara y controles:** `OrbitControls` con `enableDamping`, `autoRotate` suave,
  distancia mínima/máxima y `maxPolarAngle` acotado; la cámara y el radio de
  encuadre se calculan a partir del bounding box de los 12 nodos (no hay
  coordenadas fijas de cámara).
- **Etiquetas 3D:** `CSS2DObject` con el texto `"{número} · {nombre}"` sobre cada
  nodo, estilo diferenciado por tipo (inicio/proceso/decisión/fin).
- **Geometría por tipo:** cubo (`BoxGeometry`) para procesos/inicio/fin, octaedro
  (`OctahedronGeometry`) para decisiones; anillo (`RingGeometry`) como halo.
- **Conexiones:** líneas curvas Bézier entre nodos según el grafo del flujo
  (incluye los dos bucles de retorno: `relectura → deteccion` y
  `reformular → trasladar`).
- **Monitor 3D:** un plano con `CanvasTexture` junto al nodo `pregunta3` (Fase 7)
  redibuja el prompt de IA generado (`drawScreen()` / `updateOfficeScreen()`).
- **Trofeo:** grupo 3D (copa + base) oculto por defecto, se revela sobre el nodo
  `cierre` (Fase 12) al completar el Reto contra reloj.
- **Raycaster:** un único listener de `click` (con umbral de 6 px para distinguir
  clic de arrastre de órbita) y uno de `pointermove` para el hover, ambos sobre
  la misma lista de mallas de nodos.
- **API pública** (`window.AndesMap`): `flashTaller()`, `resolveEstudio()`,
  `updateOfficeScreen(text)`, `showTrophy()`, `illuminateFloor()`, `finalRender()`
  — consumida exclusivamente por la lógica del HUD, para mantener el mapa 3D y la
  lógica de la app desacoplados.
- **Degradación sin conexión:** todo el bloque de Three.js está envuelto en un
  `try/catch`; si la CDN no responde, se muestra un aviso dentro de `#escena` y el
  resto de la app (HUD, registro, exportación) sigue funcionando con normalidad.

### Tecnologías y Estructura

Aplicación de **un solo archivo** `index.html` (sin build ni dependencias
instaladas), con:

- **Bootstrap 5** (CSS + JS bundle) — maquetación responsiva, modales, pestañas.
- **Three.js** (ESM vía `importmap`) + addons `OrbitControls` y `CSS2DRenderer`
  — mapa 3D.
- **Anime.js** — disponible para animaciones puntuales (uso opcional, con
  comprobación `window.anime || null`).
- **jsPDF** — exportación del análisis del caso a PDF.
- Todas las librerías se cargan por CDN (jsdelivr / cdnjs) y quedan cacheadas por
  el service worker para uso offline tras la primera visita.
- **Estado en memoria** (sin `localStorage`), como exige la naturaleza de un
  recurso que puede ejecutarse en cualquier dispositivo sin persistencia previa.

### Requisitos Adicionales

**Datos del Equipo** (tabla editable, 1 a 4 filas según el modo):

| N° | Nombres | Apellidos | Correo Electrónico |
|----|---------|-----------|---------------------|
| 1  | [Campo] | [Campo]   | [Campo]             |
| 2  | [Campo] | [Campo]   | [Campo]             |
| 3  | [Campo] | [Campo]   | [Campo]             |
| 4  | [Campo] | [Campo]   | [Campo]             |

#### 🔘 Acciones

- **[👥 Registrar Equipo]** — modo grupal (4 filas). Botón activo con estilo IDC.
- **[🙋 Registrar Individual]** — modo individual (1 fila). Mutuamente excluyentes
  (`aria-pressed` sincronizado en ambos).

#### 📄 Botones de Acción

| Botón | Función |
|-------|---------|
| **📥 Generar PDF** | Exporta el análisis del caso (integrantes, las 3 preguntas con solución/Plan B/indicador, macro-cronograma y progreso) a PDF con `jsPDF`. |
| **📄 Generar Markdown (.md)** | Genera el mismo contenido como archivo `.md` descargable. |
| **📧 Enviar a Miembros** | Abre el cliente de correo (`mailto:`) con los correos registrados, asunto y un resumen precargado en el cuerpo; el PDF/Markdown se descarga aparte para adjuntarlo manualmente (los formularios web no pueden adjuntar archivos por seguridad del navegador). |

#### 📜 Footer Institucional

> **Docente: Mg. Mario Quiroz · Unidad didáctica de Producción y publicación de piezas gráficas · 2026 · Semana 1**

### Instrucciones Finales — estado de cumplimiento

- ✅ Toda la aplicación entregada en un único archivo `index.html` ejecutable.
- ✅ Bootstrap 5 para un diseño moderno y responsivo.
- ✅ Service worker (`sw.js`, precache + runtime caching) y `manifest.json`
  (con iconos 192/512) para funcionamiento offline e instalación como PWA.
- ✅ Diseño responsivo verificado en móvil (HUD, mapa 3D, Glosario y modales
  reflow por media query `max-width:576px`).

---
Docente: Mg. Mario Quiroz · Unidad didáctica de Producción y publicación de piezas gráficas · 2026 · Semana 1
