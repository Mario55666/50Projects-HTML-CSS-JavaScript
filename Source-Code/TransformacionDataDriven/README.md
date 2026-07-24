# UTP · Data-Driven · Caso RetailMax

PWA educativa **gamificada** con enfoque **DUA-Experiencial** — **Universidad Tecnológica del Perú (UTP)**,
Curso **DATA+IA · Semana 1** — para el objetivo de aprendizaje:

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

## Módulos añadidos (Semana 1 · UTP)

- **🧠 Mapa mental de arquitectura** (Nivel 2): recreación pastel del diagrama `Fuentes → ETL → EDW → BI → Usuarios de negocio` con el stack tecnológico 2025.
- **📥 Dashboard desde Excel real** (Nivel 3): sube `retailmax_herramientas_bi.xlsx` (hoja `Dataset_Clientes`, 500×19) o un `.csv`. Se lee **en el navegador** con un parser propio de ZIP+XLSX (`DecompressionStream`), sin subirlo a ningún servidor, y genera 4 visualizaciones (CLTV por segmento, canales, satisfacción vs. churn, ganancia por región).
- **🤖 Generador de prompts** (Nivel 4): arma un prompt de estrategia de comunicación a partir de opciones (segmento, canal, objetivo, tono, presupuesto) + campos de texto para que el estudiante responda (mensaje, plan de 30 días, KPI).
- **📖 Glosario técnico global**: botón flotante presente en **todas** las pantallas, con búsqueda de ~29 términos/procedimientos (CLTV, ETL, EDW, ROMI, Pareto, NASync…).
- **🛰️ Monitoreo / control de respuestas · NASync DX2800**: registra en memoria una bitácora de eventos y un snapshot del equipo; permite **sincronizar con el NAS** (WebDAV PUT / webhook POST) o **descargar JSON** para subirlo a su carpeta compartida.
- **🖨️ Informe PDF completo** (botón de impresión): incorpora diagnóstico, arquitectura, CLTV, ROMI, dashboard de Excel, estrategia de comunicación y cierre, con cabecera y pie UTP.
- **🎨 Rediseño pastel**: paleta suave (tomada del diagrama de arquitectura) para reducir la carga cognitiva ante información densa, manteniendo buen contraste. Cabecera: `UTP · DATA-DRIVEN · RETAILMAX`. Pie: `UTP · Mg. Mario Quiroz Martínez — Semana 1 · Curso de DATA+IA · Universidad Tecnológica del Perú`.

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
