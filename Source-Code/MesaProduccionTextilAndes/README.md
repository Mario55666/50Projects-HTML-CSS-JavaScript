# Mesa de Producción Textil Andes

PWA educativa e inmersiva para la dinámica **"Mesa de Producción Textil Andes — Resolviendo
cuellos de botella"**, dirigida a estudiantes de segundo semestre de Diseño Publicitario.
La aplicación traduce el caso del dossier "Textil Andes" en un mapa 3D navegable y cuatro
retos interactivos, con el objetivo de que el estudiante resuelva —mediante negociación,
planificación estratégica y creatividad técnica— los 3 vacíos de información del briefing:

1. **Secado vs. empaquetado** — cómo evitar el cuello de botella al producir 500 polos.
2. **Adaptación del arte** — cómo llevar 2 tintas planas a un arte con degradados para Instagram.
3. **Aprobación y luz natural** — qué protocolo seguir ante un retraso en la sesión de fotos.

Instalable como app (offline, sin conexión) y pensada para ejecutarse en una sola sesión de
clase de 60 minutos, individual o en equipos de trabajo.

## Contenido

### Mapa 3D · 12 fases numeradas

Construido con Three.js (`OrbitControls` + `CSS2DRenderer`), representa como diagrama de flujo
el camino completo del proceso: desde la lectura del dossier hasta quedar listo para negociar
en la mesa de producción. Usa líneas de proyección, perspectiva e isometría para dar una
estética de "tecnología espacial".

| Fase | Paso |
|---|---|
| 1  | Recepción y observación del dossier |
| 2  | Extracción de datos duros |
| 3  | Detección de cuellos de botella |
| 4  | Decisión: ¿hay vacíos de información? |
| 5  | **Pregunta 1** · Secado vs. empaquetado (Taller / Logística) |
| 6  | **Pregunta 2** · Adaptación del arte (Dirección de Arte / Serigrafía) |
| 7  | **Pregunta 3** · Aprobación y publicación (Community Management) |
| 8  | Relectura forzada (si no se detectaron vacíos) |
| 9  | Trasladar las preguntas al cuaderno |
| 10 | Validación ética (sin consultar fuentes externas) |
| 11 | Reformular pregunta (si se rompió la regla) |
| 12 | Cierre y entrega a la mesa de producción |

Cada nodo del mapa muestra su número directamente en la etiqueta 3D. Al pasar el cursor
aparece un **pop-up emergente** con el nombre y la fase del nodo; un clic abre un panel
lateral con el detalle completo. Las Fases 5, 6 y 7 se iluminan en el mapa a medida que se
resuelven los retos correspondientes del panel de control, y un monitor 3D con
`CanvasTexture` junto a la Fase 7 muestra en vivo el prompt de IA generado por el estudiante.

### Panel de control (HUD) · 4 retos

Panel flotante siempre visible con barra de progreso unificada. Cada reto muestra un badge de
fase numerado (p. ej. `Fase 5/12`) y explica en su retroalimentación cómo la respuesta
contribuye a esa fase del dossier, no solo si fue correcta o incorrecta:

- **📝 Preguntas dinámicas** — banco de 10 preguntas de opción múltiple (las 3 originales del
  caso + 7 derivadas), con botón de ayuda contextual antes de responder. Acertar la Pregunta 1
  ilumina en verde la Fase 5 del mapa.
- **🧩 Adivinanzas textiles** — acertijos de vocabulario serigráfico y andino, con pista bajo
  demanda; resolver uno desbloquea un comodín e ilumina la Fase 5 o 6 según el término.
- **⚡ Retos contra reloj** — ordenar el flujo de producción en menos de 15 segundos; el orden
  perfecto activa el Plan B de entregas escalonadas y muestra un trofeo 3D sobre la Fase 12.
- **🎨 Generador de prompts y anagramas** — anagramas que desbloquean palabras clave (Fase 6)
  y un generador de prompts para IA (Midjourney / Stable Diffusion) que explica su propósito
  dentro del dossier antes de usarse, y se refleja en el monitor 3D de la Fase 7.

### Glosario de términos

Pantalla flotante independiente del HUD (botón 📖, esquina inferior derecha) con 20 términos
técnicos del caso —serigrafía, halftone, moodboard, rack de secado, prompt, Community Manager,
etc.— con buscador en vivo, agrupados por la fase numerada del mapa a la que pertenecen.

### Registro y entregables

Formulario de registro individual o por equipo (hasta 4 integrantes), con exportación del
análisis del caso a:

- **PDF** (jsPDF), listo para imprimir.
- **Markdown** (.md), para archivo o edición posterior.
- **Correo electrónico**, con resumen precargado a los correos registrados.

### Dossier y guía de la dinámica

Sección de consulta (acordeón) con el briefing del caso, la secuencia de la dinámica de
60 minutos, los roles y respuestas esperadas de cada equipo, y el macro-cronograma integrado
de 3 días.

## Diseño pedagógico

Sigue un enfoque DUA-Experiencial: cada actividad recorre el ciclo
*instrucción → interacción → respuesta → retroalimentación → fase del proceso*, con
retroalimentación formativa de 5 componentes (Pausa → Pista → Dato → Contexto → Reintento
guiado) y sin penalización terminal por error. Colores institucionales del IDC
(`#f3a100`, `#0072b9`, `#555553`, `#545452`) combinados con la paleta "Andes"
(terracota, mostaza, cian).

## Tecnología

Aplicación de un solo archivo (`index.html`), sin build ni dependencias instaladas:

- **Bootstrap 5** — maquetación responsiva, modales y componentes de UI.
- **Three.js** (ESM) con los addons `OrbitControls` y `CSS2DRenderer` — mapa 3D.
- **Anime.js** y **jsPDF** — animaciones puntuales y exportación a PDF.

Todas las librerías se cargan por CDN y quedan cacheadas por el service worker para uso
offline tras la primera visita. El estado de la aplicación vive en memoria (no usa
`localStorage`).

## Uso

Servir la carpeta con cualquier servidor estático y abrir `index.html`. El service worker
requiere origen `https://` o `http://localhost` para registrarse; sin él, la app funciona
igual mientras haya conexión.

```bash
# ejemplo
python3 -m http.server 8080
# luego abrir: http://localhost:8080/Source-Code/MesaProduccionTextilAndes/
```

Una vez cargada, el botón **"⬇️ Instalar app"** de la barra de navegación permite instalarla
como aplicación en el dispositivo (donde el navegador lo soporte).

## Archivos

| Archivo | Descripción |
|---|---|
| `index.html` | Aplicación completa (HTML, CSS y JavaScript). |
| `manifest.json` | Manifiesto PWA (nombre, iconos, colores, modo `standalone`). |
| `sw.js` | Service worker: precache del shell de la app + runtime caching de CDN. |
| `icons/icon-192.png`, `icons/icon-512.png` | Iconos de instalación. |

---
Docente: Mg. Mario Quiroz · Unidad didáctica de Producción y publicación de piezas gráficas · 2026 · Semana 1
