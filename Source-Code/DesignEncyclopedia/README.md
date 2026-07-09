# ESTILO — Enciclopedia Interactiva de Estilos Visuales y Tipografía

Propuesta de diseño web (wireframe de contenidos + guía de estilos) e implementación funcional de una
página inmersiva que caracteriza cada movimiento artístico **en su entorno visual** (composición,
color, textura, UX/UI) **y en su tipografía**. Proyecto educativo orientado a carreras de diseño.

**Demo local:** abrir `index.html` en el navegador (no requiere build ni dependencias).

---

## 1 · Mapa del sitio (Sitemap)

```
INICIO (Hero)
│   Armonía geométrica renacentista (círculo, cuadrado, espiral áurea en SVG)
│   fusionada con gradientes y orbes 3D modernos. Titular en tipografía
│   variable que cambia de peso con el scroll.
│
├── I. MOVIMIENTOS CLÁSICOS E HISTÓRICOS
│   ├── 1. Antigüedad y Edad Media (Egipcio · Grecorromano · Bizantino · Islámico · Románico · Gótico)
│   ├── 2. Renacimiento y Barroco
│   ├── 3. Neoclasicismo
│   ├── 4. Realismo
│   └── 5. Impresionismo y Romanticismo
│
├── II. VANGUARDIAS DEL SIGLO XX
│   ├── 6. Cubismo · Expresionismo · Surrealismo · Pop Art
│   ├── 7. Futurismo
│   ├── 8. Dadaísmo
│   ├── 9. Constructivismo y Neoplasticismo (De Stijl)
│   ├── 10. Expresionismo Abstracto
│   └── 11. Arte Cinético y Op Art
│
├── III. ARTE CONTEMPORÁNEO Y POSMODERNO
│   ├── 12. Arte Conceptual · Land Art · Arte Povera
│   ├── 13. Hiperrealismo
│   └── 14. Posmodernismo
│
├── IV. CORRIENTES DE DISEÑO GRÁFICO
│   ├── 15. Arts and Crafts
│   ├── 16. Bauhaus y Estilo Tipográfico Internacional (Suizo)
│   ├── 17. Art Déco
│   ├── 18. Minimalismo vs. Maximalismo  ← sección interactiva conmutable
│   ├── 19. Brutalismo
│   ├── 20. Megabrutalismo
│   └── 21. Scrapbook
│
└── V. TENDENCIAS DE INTERFACES DIGITALES
    ├── 22. Cybercore · Y2K · Retrowave
    ├── 23. Frutiger Aero
    ├── 24. Glassmorphism
    ├── 25. Liquid Glass
    ├── 26. Phygital
    └── 27. Tendencias UX/UI 2026 (tipografía variable · Spatial UI · motion graphics)
```

**Navegación:** barra fija con cinco menús desplegables (uno por categoría), operables con ratón,
teclado (foco + Escape) y táctil; estado activo sincronizado con el scroll mediante
`IntersectionObserver` y barra de progreso de lectura como metáfora del "viaje" a través de los estilos.

---

## 2 · Especificaciones de diseño frontend por estilo

### 1. Renacimiento y Barroco

| | |
|---|---|
| **Paleta** | Pergamino `#F3EAD8` · Tinta sepia `#2E1F14` · Pan de oro `#A67C1E` · Marfil `#FFFCF3` |
| **Layout CSS** | Composición **centrada y especular** (`text-align: center`, contenido en eje único); doble marco filete dorado (`border` + `outline` con offset) como página de incunable; capitular con `::first-letter`; proporciones áureas en márgenes (`clamp` basado en 1.618) |
| **Tipografía** | **Cormorant Garamond** (Google Fonts) — garalda humanista heredera de los primeros tipos móviles; **UnifrakturMaguntia** como cita de la gótica textur de Gutenberg (solo acentos). Alternativas: EB Garamond, Cardo |
| **Nota** | El Barroco entra como ornamento (filigrana, claroscuro en sombras) sin romper la simetría renacentista |

### 2. Impresionismo y Romanticismo

| | |
|---|---|
| **Paleta** | Lavanda `#CFD8F5` · Malva `#E8D9EF` · Melocotón `#FBE3D2` · acento complementario naranja `#B05A2E` sobre campos azules (contraste simultáneo de **Chevreul**) |
| **Layout CSS** | "Pinceladas" como `radial-gradient` superpuestos con `filter: blur(18px)` y deriva lenta (`animation` 18s alternate); tarjetas translúcidas de bordes muy redondeados; ninguna arista dura |
| **Tipografía** | **Playfair Display** *italic* para titulares sublimes (Romanticismo); **Lora** para lectura — modulación a pincel, remates suaves |

### 3. Vanguardias del siglo XX

Cuatro tarjetas, cada una un mini-sistema visual:

| Vanguardia | Paleta | Recursos CSS | Tipografía |
|---|---|---|---|
| Cubismo | Ocres `#D9CBAA` `#8C7A5B` + negro | `clip-path: polygon()` para planos fracturados, `linear-gradient` angulares, `rotate`/`skewX` | Archivo Black inclinada |
| Expresionismo | Rojo `#E33D2E` + amarillo `#F5C518` | `box-shadow` dura desplazada, `skewY`, `text-shadow` de bloque | Archivo Black, mayúsculas |
| Surrealismo | Cielo `#7FB4D9` → arena `#E8D9B8` | `border-radius` asimétrico onírico, degradado horizonte infinito | Playfair Display *italic* |
| Pop Art | Amarillo `#F5C518` + magenta `#E3306D` | Trama de semitono con `radial-gradient` repetido 14px, borde cómic 4px | **Bangers** con `-webkit-text-stroke` |

### 4. Bauhaus y Estilo Tipográfico Internacional

| | |
|---|---|
| **Paleta** | Blanco `#FFFFFF` · Negro `#14121A` · Rojo `#D02E26` · Azul `#1C50A0` · Amarillo `#F5C518` (primarios como señal, nunca decoración) |
| **Layout CSS** | **Retícula de 12 columnas visible** dibujada con `linear-gradient` de 1px; composición **asimétrica** alineada al margen izquierdo de la retícula; formas básicas (círculo/triángulo/cuadrado) como único ornamento; fotografía objetiva en lugar de ilustración |
| **Tipografía** | Estrictamente **sans-serif**: Helvetica / **Inter** (Google Fonts, equivalente libre). `text-align: left` con **bandera derecha irregular** (sin justificar, `hyphens: none`); jerarquía solo por tamaño y peso. *"La forma sigue a la función"* |

### 5. Art Déco

| | |
|---|---|
| **Paleta** | Negro profundo `#101014` · Oro `#C9A747` · Champán `#E8D59A` · Marfil `#EFE3B8` |
| **Layout CSS** | Simetría rigurosa en eje central; cenefas **zig-zag** con `linear-gradient` 135°/225° repetido; doble marco filete (`border` + `outline`); motivos sunburst y escalonados; `letter-spacing` generoso en versales |
| **Tipografía** | **Poiret One** (geométrica lineal elegante) y **Limelight** (rótulo de marquesina) — Google Fonts. Alternativas Adobe Fonts: Ambroise, Bifur |

### 6. Minimalismo vs. Maximalismo (sección interactiva)

| | Minimalismo | Maximalismo (Memphis) |
|---|---|---|
| **Paleta** | Blanco roto `#FCFCFA`, tinta `#1C1B22`, un solo acento | Rosa `#FF5CA8` · Amarillo `#FFF338` · Turquesa `#00B8A9` · Cian `#7DE8FF` · Naranja `#FF9F1C` |
| **Layout CSS** | Espacio en blanco como material; bordes 1px, radios 8px; jerarquía por espacio | Acumulación: patrones de lunares, zig-zags y squiggles flotantes; tarjetas rotadas con `box-shadow` dura de color; *horror vacui* |
| **Tipografía** | **Inter** Light/ExtraLight, máx. 2 pesos | **Rubik** Black, tamaños desproporcionados, `text-shadow` múltiple |
| **Interacción** | Toggle accesible (`aria-pressed`) que conmuta `data-mode` en la sección; los textos, fondos y tipografías transicionan en 0.7s | |

### 7. Brutalismo

| | |
|---|---|
| **Paleta** | Amarillo señal `#F5F200` · Negro `#000000` · Blanco `#FFFFFF` · Rojo-naranja `#FF4911` · Azul enlace por defecto `#0000FF` |
| **Layout CSS** | Retícula rota a propósito: elementos solapados (`transform: translate/rotate`), bordes duros de 4px, `box-shadow` sólida sin blur, cero radios; estética "el CSS no cargó" |
| **Tipografía** | **Archivo Black** a tamaño desproporcionado (`clamp(4rem, 15vw, 12rem)`, titulares partidos con `<br>`); **Space Mono** utilitaria para el cuerpo |
| **Accesibilidad** | La provocación es estética: negro sobre amarillo ≈ 17:1 (AAA). Nunca ilegible |

### 8. Cybercore · Y2K · Retrowave

| | |
|---|---|
| **Paleta** | Negro-violeta `#0B0416` → `#33104D` · Neón magenta `#FF5CC8` · Neón cian `#7CF0FF` · Cromo (gradiente blanco-azulado) |
| **Layout CSS** | Rejilla en perspectiva hacia el horizonte: `linear-gradient` en cuadrícula + `transform: perspective() rotateX(58deg)` + `mask-image`; glow con `text-shadow`/`box-shadow` de color; **texto cromado líquido** con `background-clip: text` sobre gradiente metálico + `drop-shadow` |
| **Tipografía** | **Orbitron** (retrofuturista) · **Press Start 2P** (arcade pixel) · **Share Tech Mono** (monoespaciada tecnológica) — todas en Google Fonts |

### 9. Frutiger Aero

| | |
|---|---|
| **Paleta** | Azul cielo `#7EC9F5` · Celeste `#B8E6FB` · Blanco brillante `#FFFFFF` · Verde césped `#8FD44A` · Azul profundo `#0D4F8B` |
| **Layout CSS** | Degradado vertical cielo→agua→césped; paneles **esqueumórficos glossy**: gradiente con "línea de brillo" al 50%, `inset box-shadow` blanca superior, borde blanco translúcido; burbujas ascendentes (`radial-gradient` especular + `animation`) |
| **Tipografía** | **Nunito Sans** — humanista, clara y redondeada, evocando a la familia **Frutiger** (en Adobe Fonts: Frutiger Neue directamente) |

### 10. Glassmorphism

| | |
|---|---|
| **Paleta** | Fondo noche `#0F1024` con blobs saturados violeta `#7C5CFF`, rosa `#FF5C8A`, teal `#2DD4BF`; paneles blanco 10 % |
| **Layout CSS** | La regla canónica: `background: rgb(255 255 255 / 10%); backdrop-filter: blur(18px) saturate(1.4); border: 1px solid rgb(255 255 255 / 28%); border-radius: 20px; box-shadow: 0 24px 60px rgb(0 0 0 / 35%);` — jerarquía por profundidad (más cerca = menos blur, más opacidad) |
| **Tipografía** | Palo seco **delgada** (Inter 200–300) con contraste reforzado: blanco puro sobre paneles, subiendo de peso donde el fondo se agita, para asegurar legibilidad sobre transparencias |

### 11. Tendencias UX/UI 2026 (aplicadas en toda la página)

- **Tipografía variable en tiempo real:** los titulares en **Fraunces** animan sus ejes `wght` (250→900)
  y `opsz` (60→144) según la posición de scroll (`font-variation-settings` + `requestAnimationFrame`).
- **Spatial UI:** tarjetas con `perspective` + `translateZ`/`rotateX` al hover; capas por profundidad
  heredadas del glassmorphism.
- **Motion graphics de transición:** cada sección entra con su propia coreografía de revelado
  (`IntersectionObserver` + delays escalonados), coherente con su estilo.
- **Accesibilidad transversal:** `prefers-reduced-motion` desactiva las animaciones; skip-link;
  menús con `aria-expanded`/`aria-pressed`; contrastes WCAG AA/AAA incluso en los estilos disruptivos;
  color según Chevreul para que acentos y fondos no compitan.


### Ampliación: estilos añadidos

| Estilo | Paleta | Layout CSS | Tipografía (Google Fonts) |
|---|---|---|---|
| **Egipcio** | Arena `#E4C989` · Ocre `#A64B2A` · Lapislázuli `#1F4E79` · Oro `#C9A747` | Frisos: bordes superior/inferior gruesos de color, registros horizontales, jerarquía por tamaño | **Cinzel** (lapidaria de capitales) |
| **Grecorromano** | Mármol `#F5F1E8` · Terracota `#B4552F` · Negro ánfora `#26211C` | `border: double` + `box-shadow inset` como greca; simetría de frontón | **Cinzel** / Trajan |
| **Bizantino** | Oro `#C9A747` · Púrpura `#3B1F4E` · Esmeralda `#1F6E5A` | Teselas: doble `linear-gradient(45deg)` desplazado 9px (damero dorado) | Uncial (acentos), Cinzel |
| **Islámico** | Turquesa `#0F5E5A` · Cobalto `#1F4E79` · Oro `#C9A747` | Lacería: `repeating-linear-gradient` ±45° superpuestos; arco con `border-radius` compuesto | Caligrafía protagonista; serifa humanista |
| **Románico** | Piedra `#B3A48D` · Tierra `#6E5A3E` · Almagre `#8E3B2F` | Arco de medio punto: `border-radius: 120px 120px 10px 10px`; hiladas de piedra con gradiente 1px | Carolingia robusta (Cinzel peso alto) |
| **Gótico** | Azul vitral `#1F3A93` · Rubí `#8E1F3B` · Oro sobre `#171226` | Vitral: franjas verticales translúcidas con "plomo" oscuro; arco apuntado | **UnifrakturMaguntia** (textur) |
| **Neoclasicismo** | Mármol `#F7F4EE` · Gris grabado `#26303B` · Azul Wedgwood `#5C7A9E` | Simetría axial, filetes `double`, columnas estriadas laterales (`repeating-linear-gradient` 90°) | **Bodoni Moda** (didona) |
| **Realismo** | Tierras `#7A5C3D` · Gris `#4A4740` · Blanco roto `#E9E4DB` | Galería neutra: tarjetas-ficha de museo con pie técnico; cero efectos | **Lora** + Space Mono (fichas) |
| **Futurismo** | Acero `#2C2F3A` · Rojo `#E63946` · Humo `#8D99AE` | Diagonales: `skewX/skewY`, líneas de velocidad con `repeating-linear-gradient(105deg)` | **Oswald** itálica forzada + Archivo Black |
| **Dadaísmo** | Papel prensa `#E8E2D0` · Negro · Rojo `#C1272D` | Collage: fichas rotadas al azar, sombras duras, borde `dashed`; título "nota de rescate" (una fuente por letra) | Mezcla deliberada de 8 familias |
| **Constructivismo / De Stijl** | Rojo `#D40920` · Amarillo `#F7D842` · Azul `#1356A2` + negro/blanco | Retícula Mondrian con `background-image` múltiple (líneas 10px + campos primarios); cuña roja con `border` triangular | **Oswald** condensada mayúsculas |
| **Expresionismo Abstracto** | Lienzo `#EFE9DC` · Negro · Cadmio `#C0392B` · Ocre `#E9B44C` | Dripping: `radial-gradient` puntuales + elipses alargadas; campos de color difusos | **Caveat** (gestual) + Inter |
| **Op Art / Cinético** | Negro `#111` · Blanco `#F7F7F7` | Damero `repeating-conic-gradient` animado (`background-position`); texto con patrón vía `background-clip: text` | Archivo Black (la letra como patrón) |
| **Conceptual · Land · Povera** | Kraft `#C9B594` · Óxido `#8E5B3B` · Musgo `#5C6B47` | Hoja mecanografiada rotada + tarjeta kraft `dashed`; vacío deliberado | **Space Mono** (máquina de escribir) |
| **Hiperrealismo** | Estudio `#FAFAFB`–`#D9DADE` | Lupa decorativa con retícula; sombras físicas en dos capas; `scale(1.025)` al hover | **Inter** tracking cerrado, cuerpos pequeños |
| **Posmodernismo** | Verdeazulado `#3AAFA9` · Salmón `#F28C6B` · Mostaza `#D9A404` · Púrpura `#6B3FA0` | Fondo partido en diagonal + trama de lunares; comillas Bodoni gigantes; ficha clásica vs. ficha pop | Playfair itálica + Bangers + Bodoni (pastiche) |
| **Arts and Crafts** | Crema `#F2E8D5` · Oliva `#5B6E3F` · Terracota `#A85A38` | Patrón vegetal de puntos dobles; marco `double` 6px estilo Kelmscott; capitular `::first-letter` | **Cormorant Garamond** (Golden Type) |
| **Megabrutalismo** | Negro `#000` · Blanco `#FFF` · Lima `#C6FF00` | Titular `clamp(4rem, 19vw, 17rem)`, interlínea 0.82; marquesina CSS infinita; contraste 21:1 | **Archivo Black** + Space Mono |
| **Scrapbook** | Papel `#FBF7EC` · Tinta BIC `#2A4DA0` · Washi pastel | Cuadrícula de cuaderno + línea de margen roja; polaroids rotadas con cinta washi (`::before` translúcido) | **Caveat** + Lora + Space Mono (desparejas) |
| **Liquid Glass** | Noche `#0A0B1E` + aurora `#7C5CFF/#2DD4BF/#FF5C8A` | `backdrop-filter: blur(26px) saturate(1.8)`; borde iridiscente `conic-gradient` + `mask-composite`; destello especular animado | **Inter** peso medio dinámico |
| **Phygital** | Reales cálidos `#241F1B`–`#EFE6D8` + cian AR `#45E3FF` | Corchetes de enfoque en las 4 esquinas (pseudo-bordes) con pulso; ficha física (papel) vs. ficha digital (vidrio `dashed`) | Inter (físico) + Space Mono (capa AR) |

Fuentes añadidas en esta ampliación: **Cinzel**, **Bodoni Moda**, **Caveat** y **Oswald**.

---

## 3 · Formulario de necesidades por estilo → prompt utilitario

Cada estilo incluye un **formulario de necesidades** (botón *"Formulario de necesidades · generar
prompt"* al final de su sección) que caracteriza la pieza gráfica según contexto, tiempo, espacio y
grupo objetivo, y genera un **prompt listo para copiar** en dos modos:

- **Brief para diseñador(a):** prompt estructurado (contexto → grupo objetivo → comunicación → ADN
  del estilo → restricciones → entregables) para pedir dirección de arte a un asistente de IA o
  usar como brief académico.
- **Prompt para IA de imágenes:** descripción compacta y visual para generadores de imagen,
  con la estética, paleta hex y rotulación del estilo ya incorporadas.

### Campos del formulario

| Dimensión | Campos |
|---|---|
| **Estilo** | Variante (en estilos múltiples: Cubismo/Expresionismo/Surrealismo/Pop Art · Minimal/Maximal · Retrowave/Y2K/Cybercore) — el ADN visual, paleta y tipografía se inyectan automáticamente |
| **Pieza** | Proyecto/marca · tipo de pieza (cartel, portada, post, banner, packaging, identidad, infografía, campaña) · formato/proporción |
| **Tiempo** | Tratamiento temporal (fiel a la época / reinterpretación contemporánea / fusión retro-futurista) · momento/ocasión de uso |
| **Espacio** | Medios de difusión (impreso, vía pública, pantalla móvil/escritorio, redes, proyección) |
| **Grupo objetivo** | Rango de edad · perfil (intereses, ocupación, cultura visual) · familiaridad con el estilo (nula/media/alta) |
| **Comunicación** | Objetivo comunicacional (informar, vender, educar, provocar, celebrar, concientizar) · tono/mood · mensaje principal · elementos obligatorios |
| **Restricciones** | Nivel de accesibilidad (WCAG AA/AAA) — siempre presente en el prompt generado |

Los campos vacíos aparecen como «(por definir)» en el prompt, útil como lista de pendientes del brief.

---

## 4 · Estructura de archivos

```
DesignEncyclopedia/
├── index.html   → estructura semántica: nav + hero + 11 secciones + footer
├── style.css    → base global mínima + un sistema visual autocontenido por sección
├── script.js    → tipografía variable por scroll, revelados, nav activa, toggle min/max
│                  y generador de formularios de necesidades → prompts por estilo
└── README.md    → esta propuesta (sitemap + guía de estilos)
```
