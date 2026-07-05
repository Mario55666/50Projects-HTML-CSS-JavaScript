# IPD · Documento Integrado — IDC 2026

Documento único que **fusiona** los dos instrumentos del Índice de Pertinencia
Documental (IPD) del **IDC — Instituto de Diseño y Comunicación** (Instituto de
Educación Superior Público) en un solo recurso navegable, organizado en dos
contextos:

| # | Contexto | Contenido | Origen |
|---|----------|-----------|--------|
| 1 | **Contexto Teórico** — Fundamentos del IPD | Definición, fórmula ponderada, calculadora, dimensiones evaluativas, contextos por carrera, estadística y matriz de criterios. | *IPD — Índice de Pertinencia Documental* |
| 2 | **Contexto Práctico** — Implementación Pedagógica | Registro docente, contexto del proyecto, simulador de evaluación de fuentes, guía pedagógica por fases y reporte final. | *Guía de Implementación Pedagógica IPD* |

Cada contexto conserva **el 100 % de su interactividad original** (calculadora,
simulador, acordeones, gráficos). Se integran mediante secciones aisladas dentro
de un documento maestro con navegación por pestañas, evitando colisiones de
estilos y de scripts entre ambas piezas.

## Marca

Se insertaron los **logotipos institucionales del IDC** como **imágenes raster
PNG y JPG** (no SVG). Están embebidos en `index.html` y disponibles sueltos en
`assets/`: **PNG** (fondo transparente) y **JPG**, en versión a color (fondos
claros) y en blanco (fondos oscuros). Colores institucionales aplicados en todo
el documento:

| Muestra | Hex | Uso |
|---------|-----|-----|
| 🟧 | `#f3a100` | Naranja — acento / Contexto Práctico |
| 🟦 | `#0072b9` | Azul — primario / Contexto Teórico |
| ⬛ | `#555553` | Gris 1 — tipografía "diseño & comunicación" |
| ⬛ | `#545452` | Gris 2 — tipografía secundaria |

## Uso

Abre `index.html` en cualquier navegador moderno. El archivo es **autónomo**: los
logos y ambos documentos van embebidos, no requiere conexión ni servidor.

```
IPD-IDC-DocumentoIntegrado/
├── index.html                 ← documento fusionado (autónomo)
├── assets/
│   ├── logo-idc-color.png     ← logo a color, PNG transparente
│   ├── logo-idc-color.jpg     ← logo a color, JPG fondo blanco
│   ├── logo-idc-white.png     ← logo en blanco, PNG transparente
│   └── logo-idc-white.jpg     ← logo en blanco, JPG fondo oscuro
└── README.md
```
