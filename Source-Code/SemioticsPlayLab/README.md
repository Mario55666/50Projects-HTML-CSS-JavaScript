# Semiotics PlayLab · Introducción a la Semiótica

PWA (Progressive Web App) educativa gamificada para dominar los conceptos de
**denotación, connotación, sintagma y paradigma** aplicados al análisis de piezas
publicitarias reales. Construida con HTML, CSS y JavaScript vanilla + Bootstrap 5,
con enfoque pedagógico **DUA-Experiencial** y estructura de sesión **IUTPC**
(Inicio · Utilidad · Transformación · Práctica · Cierre).

## Características

- **Trivia / Quiz** — denotación vs. connotación, sintagma, paradigma y el signo de Saussure, con piezas reproducidas en CSS (afiche *PAPEL*, Domino's, RE/MAX).
- **Anagrama conceptual** — reconstrucción de los 5 términos clave con pistas.
- **Memoria** — parejas concepto ↔ ejemplo con sistema de combos.
- **Simulador paradigmático** — cambia color, tipografía y encuadre (la vista previa reacciona en vivo) y cumple el encargo del cliente para completar el laboratorio.
- **Secuencia (Simon)** — memoriza el orden del análisis semiótico; se gana al superar **5 rondas**.
- **Tablero / carrera** — avanza respondiendo preguntas por categoría.
- **Ficha de análisis** — muestra la **imagen real** de la pieza asignada y un gráfico interactivo **Shannon-Weaver** (competencia por atención, modelo comunicacional, impacto semiótico); exporta **PDF** (impresión), **Markdown (.md)** y envío por **correo** al equipo.
- **Sala de exposición** — publica hallazgos y reacciona (puesta en común del cierre).
- **Gamificación** — XP, niveles, insignias y barra de progreso IUTPC.
- **Retroalimentación DUA** — cada error abre un panel de 5 componentes: *Pausa → Pista → Dato → Contexto → Reintento* (sin castigo terminal).

## Uso

Abre `index.html` en un navegador moderno. Para instalarla como app (PWA) y usarla
offline, sírvela desde un servidor (por ejemplo GitHub Pages): el `manifest.json`
y el `sw.js` habilitan la instalación y el cacheo offline. El `index.html` también
funciona de forma autónoma como archivo único.

## Estado

- Sin dependencias de runtime propias (Bootstrap y fuentes vía CDN, cacheadas por el service worker).
- Estado 100% en memoria (sin `localStorage`).
- Responsivo y con soporte táctil.

---

Docente: **Mg. Mario Quiroz Martínez** · Curso: Semiótica de la Imagen · 2026 · Semana 1
Universidad Tecnológica del Perú
