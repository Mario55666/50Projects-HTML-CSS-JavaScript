# Editor Visual de EPUB

Aplicación web hecha en **HTML, CSS y JavaScript puro** (sin frameworks ni compilación) para **leer y editar visualmente** el HTML, CSS y texto de un archivo `.epub`, y exportar el resultado como un nuevo EPUB.

## Características

- **Carga de EPUB** por arrastrar-y-soltar o con el botón "Abrir .epub" ([JSZip](https://stuk.github.io/jszip/) lee el `.epub` como archivo ZIP y ubica el `.opf`, el `manifest`, el `spine` y el índice — `nav.xhtml` en EPUB 3 o `toc.ncx` en EPUB 2).
- **Navegación por capítulos**: botones anterior/siguiente y panel de Índice con los enlaces del propio libro.
- **Explorador de DOM**: árbol jerárquico del capítulo actual (etiqueta, `id`, clases). Al hacer clic en un nodo se resalta en el visor y se carga en el editor de HTML. Incluye un buscador por tag, `.clase` o `#id`.
- **Identificación única de objetos**: muchos EPUB exportados desde herramientas como Adobe InDesign reutilizan la misma clase CSS en decenas de objetos distintos (p. ej. `_idGenObjectAttribute-1`). Al seleccionar cualquier objeto, el editor le asigna automáticamente un `id` propio y estable (si no tiene uno) para poder identificarlo y editar su HTML/CSS/animación de forma exclusiva, sin afectar a otros objetos que compartan la misma clase.
- **Editor de HTML** (CodeMirror, resaltado de sintaxis): muestra el HTML del elemento seleccionado. "Aplicar cambios" reemplaza ese elemento en el documento y actualiza el visor; "Reiniciar" descarta lo escrito y vuelve a cargar el HTML original del elemento.
- **Editor de CSS** (CodeMirror con autocompletado de propiedades, `Ctrl+Espacio`): reglas CSS libres con vista previa en vivo mientras escribes. Incluye un panel de propiedades comunes (color de texto, fondo, fuente, tamaño, margen, padding) con selectores visuales que generan la regla CSS automáticamente para el selector indicado. Los selectores de color tienen una casilla **"Ninguno"** (marcada por defecto) para no forzar un color hasta que la desmarques explícitamente.
- **Catálogo de animaciones CSS** (pestaña "Animación"): 16 animaciones listas para usar (aparecer/desaparecer, deslizamientos, zoom, rotación, rebote, pulso, sacudida, balanceo, voltear, desenfoque, escala de grises), con propiedades inspiradas en las que documenta [anime.js](https://animejs.com/v3/documentation/#cssProperties) (transformaciones, filtros, opacidad y color). Cada animación muestra su código `@keyframes` real, permite ajustar duración, retraso, easing y repetición, reproducir una vista previa en vivo sobre el propio objeto seleccionado (siempre visible, aunque el objeto ya tenga otra animación aplicada), y aplicarla de forma permanente.
- **Identificación de capas**: cada nodo del árbol DOM muestra un icono según su tipo (imagen, vectorial/SVG, texto o contenedor). Al seleccionar un objeto, además se indica su opacidad y transparencia de fondo real (computada, no la del resaltado del propio editor), para saber de un vistazo si es una imagen, un gráfico vectorial o un elemento con transparencia.
- **Editor de botones**: al seleccionar un `<button>`, un `<a>` o un `<input type="button/submit/reset">`, aparece un panel dedicado para cambiar su texto visible y, en el caso de los enlaces, su destino (`href`), sin tocar el HTML a mano. También se puede **insertar un botón nuevo** (con estilo por defecto) dentro del objeto seleccionado.
- **Vista previa que se adapta al formato del EPUB**: si el capítulo (o el libro) declara un tamaño de página propio (`<meta name="viewport">` o `rendition:viewport`), el visor deja de estirarse al 100% del panel y muestra el contenido a su proporción real, centrado.
- **Probar como lector**: abre el capítulo actual en una **ventana emergente real del navegador**, limpia de cualquier marca interna del editor, tal como lo vería alguien leyendo el EPUB — útil para comprobar el resultado antes de exportar.
- **Sistema de ayuda por pestaña**: el botón "?" junto a las pestañas explica qué hace cada herramienta (DOM, HTML, CSS, Texto, Índice, Animación) y cómo el cambio se refleja concretamente en el archivo `.xhtml`/`.epub`.
- **Edición de texto**:
  - Modo "Edición de texto": actívalo y haz clic en cualquier texto del visor para editarlo directamente en la página (`contentEditable`), con guardado automático al salir del campo.
  - O selecciona un elemento y edita todo su texto de una vez en el campo dedicado del panel "Texto".
- **Deshacer / rehacer** (`Ctrl+Z` / `Ctrl+Y`) por capítulo, con historial de hasta 60 pasos.
- **Exportar EPUB**: genera un `.epub` nuevo con todos los cambios aplicados a los capítulos visitados (incluyendo el CSS, los botones y las animaciones aplicadas, que se guardan como una hoja de estilos permanente en cada capítulo), conservando el resto del archivo original intacto.
- **Modo oscuro / claro** y editores de código a juego.
- Diseño en dos paneles pensado para pantallas de **1366px** de ancho en adelante.

## Cómo usar

1. Abre `index.html` en el navegador (necesita conexión a internet la primera vez, para cargar JSZip y CodeMirror desde CDN).
2. Carga un `.epub` arrastrándolo a la pantalla o con el botón **"Abrir .epub"**.
3. Recorre los capítulos con las flechas de la barra superior o desde el panel **Índice**.
4. En el panel **DOM** explora la estructura del capítulo y haz clic en un elemento para seleccionarlo (se resalta en el visor).
5. Edita su HTML en el panel **HTML** y pulsa **"Aplicar cambios"**.
6. Define estilos en el panel **CSS** (a mano o con el panel de propiedades comunes) y pulsa **"Aplicar CSS"**; la vista previa se actualiza mientras escribes.
7. Anima el objeto seleccionado desde el panel **Animación**: elige una animación del catálogo, ajusta duración/retraso/easing/repetición, pulsa **"Reproducir vista previa"** para verla en el objeto real, y **"Aplicar animación"** para guardarla.
8. Edita texto en el panel **Texto**, o activa "Modo edición de texto" en el visor y haz clic directamente sobre el contenido.
9. Usa **deshacer/rehacer** si te equivocas.
10. Cuando termines, pulsa **"Exportar EPUB"** para descargar el archivo modificado.

## Estructura de archivos

```
EpubVisualEditor/
├── index.html   # Estructura de la página: visor + panel de herramientas en pestañas
├── style.css    # Estilos, tema claro/oscuro y diseño en dos paneles
└── script.js    # Lógica: parseo del EPUB, navegación, DOM explorer,
                 # editores de HTML/CSS/texto, undo/redo y exportación
```

## Notas técnicas

- El contenido de cada capítulo se muestra en un `<iframe sandbox="allow-same-origin">` aislado del resto de la página, y **sin ejecutar scripts embebidos** del EPUB (por seguridad, dado que el propio editor necesita acceso al documento del iframe para funcionar).
- Las imágenes y hojas de estilo enlazadas del capítulo se resuelven a `blob:` URLs solo para la vista previa; al exportar, esas referencias se revierten a sus rutas originales para no dejar URLs temporales dentro del EPUB final. La ventana emergente de "Probar como lector" sí conserva las `blob:` URLs (comparte origen con la pestaña principal), ya que no hay un servidor de archivos detrás.
- La serialización usa `XMLSerializer` (no `outerHTML`) para producir XHTML válido, incluyendo el auto-cierre de etiquetas vacías (`<br/>`) y la redeclaración `<?xml version="1.0" encoding="UTF-8"?>` al exportar.
- Cada objeto que se selecciona recibe, si no tiene uno, un `id` propio y estable — necesario porque muchos EPUB (p. ej. exportados desde Adobe InDesign) reutilizan la misma clase CSS en decenas de objetos distintos, así que apuntar por clase no bastaría para editar uno solo de forma exclusiva.

## Tecnologías

- HTML5, CSS3 (flexbox, variables CSS, tema claro/oscuro)
- JavaScript (ES6+, sin build step)
- [JSZip](https://stuk.github.io/jszip/) `3.10.1` — lectura/escritura del `.epub` como ZIP
- [CodeMirror](https://codemirror.net/5/) `5.65.16` — editores de código HTML y CSS con resaltado de sintaxis y autocompletado

## Créditos

Curso de Infografía 2026 · Mg Mario Quiroz Martinez
