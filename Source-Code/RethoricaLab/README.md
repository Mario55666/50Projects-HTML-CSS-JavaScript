# RethoricaLab — Simulador de Análisis Retórico Publicitario

PWA de un solo archivo (`index.html`) para el análisis semiótico-retórico de piezas
publicitarias aplicando el modelo de **figuras de adjunción de Jacques Durand**.
Diseñada para la asignatura *Semiótica de la Imagen · Unidad 4: Figuras Semióticas* (Semana 16).

## Flujo didáctico (IUTPC)
Observación → Identificación → Efecto → Conexión → **Dictamen** (Inicio · Utilidad · Transformación · Práctica · Cierre).

1. **Registro del analista** — nombre, código/correo, sección (puerta de acceso).
2. **Galería** de 7 avisos del banco (Audio Pro, TAG Heuer, Hudson's Bay, Mionetto, Rocco Forte, CyberPowerPC, Jones/Bugatti).
3. **Ficha guiada** en 4 fases con scroll pedagógico, animaciones en cascada y contadores (mín. 80 caracteres).
4. **Selector de figuras** (Repetición/Identidad, Comparación/Similitud, Antítesis/Oposición, Acumulación/Diferencia) con retroalimentación automática de Durand.
5. **Dictamen Retórico** ensamblado en tiempo real, exportable a PDF (`window.print`).
6. **Panel teórico permanente** con el cuadro Operación × Relación de Durand.

## Características técnicas
- Un único archivo HTML, sin servidor ni dependencias externas.
- PWA instalable: `manifest` y `service worker` embebidos vía `Blob` (offline).
- Estética cubista + branding IDC: `#f3a100`, `#0072b9`, `#555553`, `#545452`.
- SVG inline para iconos, logo IDC y previsualización de cada aviso.
- Responsivo desde 375px. Estilos de impresión que aíslan el dictamen.

## Uso
Abre `index.html` en cualquier navegador moderno. Para instalarla como app,
sírvela por HTTPS/localhost (el service worker requiere contexto seguro).

---
Mg. Mario Quiroz Martínez — Semiótica de la Imagen | Unidad 4: Figuras Semióticas
