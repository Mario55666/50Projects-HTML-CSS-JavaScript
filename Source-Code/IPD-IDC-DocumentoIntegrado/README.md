# IPD · Documento Integrado — IDC 2026

Documento único que **fusiona** los dos instrumentos del Índice de Pertinencia
Documental (IPD) del **IDC — Instituto de Diseño y Comunicación** (Instituto de
Educación Superior Público) en un solo recurso navegable, organizado en dos
contextos:

| # | Contexto | Contenido | Archivo |
|---|----------|-----------|---------|
| 1 | **Contexto Teórico** — Fundamentos del IPD | Definición, fórmula ponderada, calculadora, dimensiones evaluativas, contextos por carrera, estadística y matriz de criterios. | `contexto-teorico.html` |
| 2 | **Contexto Práctico** — Implementación Pedagógica | Registro docente, contexto del proyecto, simulador de evaluación de fuentes, guía pedagógica por fases y reporte final. | `contexto-practico.html` |

`index.html` es el **documento maestro** con la marca institucional y navegación
por pestañas; incrusta cada contexto desde su propio archivo, conservando **el
100 % de su interactividad original** (calculadora, simulador, acordeones,
gráficos) sin colisiones de estilos ni de scripts entre ambas piezas.

> **Sin `data:` URIs.** Todo se referencia como **archivos reales** (logos e
> infografías), por lo que renderiza correctamente en cualquier navegador,
> también en vistas con políticas de seguridad (CSP/sandbox) estrictas.

## Marca

Los **logotipos institucionales del IDC** se insertan como **imágenes raster
PNG y JPG** (no SVG), desde `assets/` mediante `<img src="assets/…">`. Colores
institucionales aplicados en todo el documento:

| Muestra | Hex | Uso |
|---------|-----|-----|
| 🟧 | `#f3a100` | Naranja — acento / Contexto Práctico |
| 🟦 | `#0072b9` | Azul — primario / Contexto Teórico |
| ⬛ | `#555553` | Gris 1 — tipografía "diseño & comunicación" |
| ⬛ | `#545452` | Gris 2 — tipografía secundaria |

## Uso

Abre **`index.html`** desde esta carpeta (mantén junto el folder `assets/` y los
dos archivos de contexto). Funciona con doble clic en cualquier navegador
moderno; no requiere servidor.

```
IPD-IDC-DocumentoIntegrado/
├── index.html                 ← documento maestro (marca + pestañas)
├── contexto-teorico.html      ← Contexto Teórico (Fundamentos del IPD)
├── contexto-practico.html     ← Contexto Práctico (Guía de Implementación)
├── assets/
│   ├── logo-idc-color.png     ← logo a color · PNG transparente
│   ├── logo-idc-color.jpg     ← logo a color · JPG fondo blanco
│   ├── logo-idc-white.png     ← logo en blanco · PNG transparente
│   └── logo-idc-white.jpg     ← logo en blanco · JPG fondo oscuro
└── README.md
```
