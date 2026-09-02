# Mesa de Producción Textil Andes (PWA)

Centro de aprendizaje inmersivo (PWA instalable, offline) para la dinámica
**"Mesa de Producción Textil Andes — Resolviendo cuellos de botella"**, dirigida a
estudiantes de Diseño Publicitario. Resuelve los 3 vacíos del briefing del caso
Textil Andes (secado/empaquetado, adaptación de arte a 2 tintas, aprobación y luz natural).

## Contenido

- **Mapa 3D** (Three.js + `OrbitControls` + `CSS2DRenderer`) con líneas de proyección, perspectiva
  e isometría: un diagrama de flujo de 13 nodos que explica cómo se llega del dossier a las 3
  preguntas críticas (inicio, procesos, decisiones y fin). Clic en cualquier nodo abre un panel
  lateral con su detalle; los nodos de las 3 preguntas críticas se iluminan al resolver los retos
  del HUD, y un monitor 3D con `CanvasTexture` junto al nodo de Publicación muestra el prompt
  generado en el Generador de la IA.
- **Panel de control flotante (HUD)** siempre visible, con barra de progreso unificada y 4 retos:
  1. 📝 **Preguntas dinámicas** — banco de 10 preguntas de opción múltiple (3 originales + 7 derivadas). Acertar la Pregunta 1 ilumina en verde el nodo "Pregunta 1 · Secado vs. empaquetado".
  2. 🧩 **Adivinanzas textiles** — acertijos de vocabulario serigráfico/andino; resolver una desbloquea un comodín y cambia el color del nodo "Pregunta 2 · Adaptación del arte".
  3. ⚡ **Retos contra reloj** — ordenar el flujo de producción en menos de 15 s; el orden perfecto activa el Plan B y muestra un trofeo 3D sobre el nodo final.
  4. 🎨 **Generador de prompts & anagramas** — anagramas que desbloquean palabras clave y un generador de prompts para IA (Midjourney/Stable Diffusion) que se refleja en el monitor 3D junto al nodo "Pregunta 3 · Aprobación y publicación".
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
