# Transformación Data-Driven · Caso RetailMax

PWA educativa **gamificada** con enfoque **DUA-Experiencial** (Instituto de Diseño y Comunicación) para el objetivo de aprendizaje:

> Al finalizar la sesión de 90 min, los estudiantes serán capaces de diseñar una estrategia de marketing data-driven para revertir una crisis de rentabilidad: integrar silos de información, calcular el CLTV en lenguaje aritmético normal y sustentar financieramente sus decisiones con un simulador web gamificado.

Basada en la metodología de **Mark Jeffery** (*Data-Driven Marketing: The 15 Metrics*).

## Actividad: "Rescate Data-Driven: El Caso RetailMax"

Los estudiantes son consultores de BI que deben salvar a RetailMax (márgenes 22% → 12%). Ruta gamificada de **4 niveles / 5 estaciones DUA** con insignias:

| Nivel | Estación DUA | Mecánica interactiva | Insignia |
|-------|--------------|----------------------|----------|
| 1 · Diagnóstico (15 min) | Activación inmersiva | Scorecard auditable de las **15 métricas de Jeffery** → revela madurez BI y el *Marketing Divide* | 🔍 Diagnóstico |
| 2 · Silos → Arquitectura (20 min) | Definición contextualizada | **Ordenar** el flujo `Fuentes → ETL → EDW → BI → Usuarios` (drag & drop + fallback táctil) + definiciones flip y quiz | 🏗️ Arquitecto |
| 3 · CLTV & Segmentación (30 min) | Simulador de contexto | **Simulador CLTV** en tiempo real + dashboard de **6 visualizaciones** (SVG puro) + pirámide de valor Pareto | 💎 Segmentador |
| — Refuerzo | Anagrama conceptual (obligatorio) | **Anagrama** de 5 términos clave (CLTV, CHURN, SEGMENTACIÓN, ROMI, ETL) con pistas | 🔤 Léxico |
| 4 · Sustento financiero (25 min) | Simulador + Transferencia y reflexión | **ROMI / NPV / IRR / Payback** + análisis de sensibilidad + ticket de salida + autoevaluación | 💰 Financiero |

### Retroalimentación por niveles (anagramas de refuerzo)

Al **cierre de cada nivel** aparece un anagrama-relámpago de retroalimentación que consolida el
concepto clave antes de avanzar (widget reutilizable con el mismo feedback de error productivo):

| Nivel | Concepto consolidado | Anagrama | Gatilla |
|-------|----------------------|----------|---------|
| 1 · Diagnóstico | `REZAGADA` (Marketing Divide) | libera el paso al Nivel 2 |
| 2 · Silos | `SILOS` (integración de datos) | libera el paso al Nivel 3 |
| 3 · CLTV | `PARETO` (20/80 del valor) | desbloquea la estación de anagramas conceptuales |
| 4 · Financiero | `PAYBACK` (recuperación) | refuerzo de cierre |

Cada uno permite reintentos ilimitados y "pista extra" (sin bloqueo punitivo).

## Características técnicas

- **Un solo `index.html` autónomo**: funciona offline sin dependencias críticas (Bootstrap 5 y fuentes se cargan como mejora progresiva con *fallback* a `system-ui`/monospace).
- **PWA real**: `manifest.json`, `sw.js` (cache-first) e `icon.svg` para instalación y uso offline. El manifest también se genera en memoria como respaldo.
- **Estado 100% en memoria** (sin `localStorage`/`sessionStorage`).
- **Feedback de error productivo**: Pausa → Pista → Dato → Contexto → Reintento (sin "game over" conceptual).
- **Entregables**: exportación en **CSV** (dataset de 500 clientes × 19 variables), **Excel (.xls)** y **PDF** (vía impresión con `@media print`).
- **Diseño brutalista "ARCHIVO BLACK"**: Space Mono, bordes duros de 4px, colores IDC a plena saturación (`#f3a100`, `#0072b9`, `#555553`), contraste AAA. Responsivo *mobile-first*.
- Justificación pedagógica DUA-Experiencial visible para el docente.

## Uso

Abre `index.html` en el navegador. Para instalación PWA / offline completo, sírvelo por HTTP (p. ej. `python3 -m http.server`) para que se registre el service worker.

---
*Mg. Mario Quiroz Martínez — Unidad didáctica Investigación e Innovación Tecnológica · Instituto de Diseño y Comunicación*
