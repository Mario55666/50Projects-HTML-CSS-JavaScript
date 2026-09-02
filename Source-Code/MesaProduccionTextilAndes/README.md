# Mesa de Producción Textil Andes (PWA)

Centro de aprendizaje inmersivo (PWA instalable, offline) para la dinámica
**"Mesa de Producción Textil Andes — Resolviendo cuellos de botella"**, dirigida a
estudiantes de Diseño Publicitario. Resuelve los 3 vacíos del briefing del caso
Textil Andes (secado/empaquetado, adaptación de arte a 2 tintas, aprobación y luz natural).

## Contenido

- **Mapa 3D** (Three.js + `OrbitControls` + `CSS2DRenderer`) con líneas de proyección, perspectiva
  e isometría: un diagrama de flujo de **12 fases numeradas** (Fase 1 · Recepción y observación →
  Fase 12 · Cierre y entrega a la mesa de producción) que explica cómo se llega del dossier a las
  3 preguntas críticas. Cada nodo muestra su número en la etiqueta 3D; al pasar el cursor aparece
  un **pop-up emergente** con el nombre y la fase, y un clic abre el panel lateral con el detalle
  completo. Los nodos de las 3 preguntas críticas (Fases 5, 6 y 7) se iluminan al resolver los
  retos del HUD, y un monitor 3D con `CanvasTexture` junto a la Fase 7 muestra el prompt generado
  en el Generador de IA.
- **Panel de control flotante (HUD)** siempre visible, con barra de progreso unificada y 4 retos.
  Cada uno muestra un badge de fase numerado (p. ej. "Fase 5/12") y explica, en su retroalimentación,
  cómo la respuesta contribuye a esa fase del dossier — no solo si fue correcta:
  1. 📝 **Preguntas dinámicas** — banco de 10 preguntas de opción múltiple (3 originales + 7 derivadas), con botón de ayuda contextual antes de responder. Acertar la Pregunta 1 ilumina en verde la Fase 5.
  2. 🧩 **Adivinanzas textiles** — acertijos de vocabulario serigráfico/andino con pista; resolver uno desbloquea un comodín e ilumina la Fase 5 o 6 según el término.
  3. ⚡ **Retos contra reloj** — ordenar el flujo de producción en menos de 15 s (con ayuda previa); el orden perfecto activa el Plan B y muestra un trofeo 3D sobre la Fase 12.
  4. 🎨 **Generador de prompts & anagramas** — anagramas que desbloquean palabras clave (Fase 6) y un generador de prompts para IA (Midjourney/Stable Diffusion) que explica su propósito dentro del dossier y se refleja en el monitor 3D de la Fase 7.
- **Glosario de términos** como pantalla flotante independiente (botón 📖 fijo, esquina inferior
  derecha): 20 términos técnicos con buscador, agrupados por la fase numerada del mapa 3D a la
  que pertenecen.
- **Feedback formativo** (Pausa → Pista → Dato → Contexto → Reintento), sin penalización terminal.
- **Registro de equipo/individual** y exportación a **PDF** (jsPDF), **Markdown** y envío por correo.
- **Dossier del caso** y guía de la dinámica (accordion) para consulta.

## Tecnología

Un solo `index.html` con Bootstrap 5, Three.js (ESM, con los addons `OrbitControls` y
`CSS2DRenderer`), Anime.js y jsPDF por CDN (cacheadas por el service worker para uso offline).
Estado en memoria (sin `localStorage`).

## Uso

Servir la carpeta con cualquier servidor estático y abrir `index.html`. El service worker
requiere origen `https://` o `http://localhost`. Es instalable como app (botón "Instalar app").

```bash
# ejemplo
python3 -m http.server 8080
# luego: http://localhost:8080/Source-Code/MesaProduccionTextilAndes/
```

## Archivos

- `index.html` — aplicación completa.
- `manifest.json` — manifiesto PWA.
- `sw.js` — service worker (precache del shell + runtime caching de CDN).
- `icons/` — iconos 192 y 512.

---
Docente: Mg. Mario Quiroz · Unidad didáctica de Producción y publicación de piezas gráficas · 2026 · Semana 1
