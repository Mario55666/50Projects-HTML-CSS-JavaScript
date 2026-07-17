# Editor Visual de EPUB

Aplicación web hecha en **HTML, CSS y JavaScript puro** (sin frameworks ni compilación) para **leer y editar visualmente** el HTML, CSS y texto de un archivo `.epub`, y exportar el resultado como un nuevo EPUB.

## Características

- **Carga de EPUB** por arrastrar-y-soltar o con el botón "Abrir .epub" ([JSZip](https://stuk.github.io/jszip/) lee el `.epub` como archivo ZIP y ubica el `.opf`, el `manifest`, el `spine` y el índice — `nav.xhtml` en EPUB 3 o `toc.ncx` en EPUB 2).
- **Navegación por capítulos**: botones anterior/siguiente y panel de Índice con los enlaces del propio libro.
- **Explorador de DOM**: árbol jerárquico del capítulo actual (etiqueta, `id`, clases). Al hacer clic en un nodo se resalta en el visor y se carga en el editor de HTML. Incluye un buscador por tag, `.clase` o `#id`.
- **Editor de HTML** (CodeMirror, resaltado de sintaxis): muestra el HTML del elemento seleccionado. "Aplicar cambios" reemplaza ese elemento en el documento y actualiza el visor; "Reiniciar" descarta lo escrito y vuelve a cargar el HTML original del elemento.
- **Editor de CSS** (CodeMirror con autocompletado de propiedades, `Ctrl+Espacio`): reglas CSS libres con vista previa en vivo mientras escribes. Incluye un panel de propiedades comunes (color de texto, fondo, fuente, tamaño, margen, padding) con selectores visuales que generan la regla CSS automáticamente para el selector indicado.
- **Edición de texto**:
  - Modo "Edición de texto": actívalo y haz clic en cualquier texto del visor para editarlo directamente en la página (`contentEditable`), con guardado automático al salir del campo.
  - O selecciona un elemento y edita todo su texto de una vez en el campo dedicado del panel "Texto".
- **Deshacer / rehacer** (`Ctrl+Z` / `Ctrl+Y`) por capítulo, con historial de hasta 60 pasos.
- **Exportar EPUB**: genera un `.epub` nuevo con todos los cambios aplicados a los capítulos visitados, conservando el resto del archivo original intacto.
- **Modo oscuro / claro** y editores de código a juego.
- Diseño en dos paneles pensado para pantallas de **1366px** de ancho en adelante.

## Cómo usar

1. Abre `index.html` en el navegador (necesita conexión a internet la primera vez, para cargar JSZip y CodeMirror desde CDN).
2. Carga un `.epub` arrastrándolo a la pantalla o con el botón **"Abrir .epub"**.
3. Recorre los capítulos con las flechas de la barra superior o desde el panel **Índice**.
4. En el panel **DOM** explora la estructura del capítulo y haz clic en un elemento para seleccionarlo (se resalta en el visor).
5. Edita su HTML en el panel **HTML** y pulsa **"Aplicar cambios"**.
6. Define estilos en el panel **CSS** (a mano o con el panel de propiedades comunes) y pulsa **"Aplicar CSS"**; la vista previa se actualiza mientras escribes.
7. Edita texto en el panel **Texto**, o activa "Modo edición de texto" en el visor y haz clic directamente sobre el contenido.
8. Usa **deshacer/rehacer** si te equivocas.
9. Cuando termines, pulsa **"Exportar EPUB"** para descargar el archivo modificado.

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
- Las imágenes y hojas de estilo enlazadas del capítulo se resuelven a `blob:` URLs solo para la vista previa; al exportar, esas referencias se revierten a sus rutas originales para no dejar URLs temporales dentro del EPUB final.
- La serialización usa `XMLSerializer` (no `outerHTML`) para producir XHTML válido, incluyendo el auto-cierre de etiquetas vacías (`<br/>`) y la redeclaración `<?xml version="1.0" encoding="UTF-8"?>` al exportar.

## Tecnologías

- HTML5, CSS3 (flexbox, variables CSS, tema claro/oscuro)
- JavaScript (ES6+, sin build step)
- [JSZip](https://stuk.github.io/jszip/) `3.10.1` — lectura/escritura del `.epub` como ZIP
- [CodeMirror](https://codemirror.net/5/) `5.65.16` — editores de código HTML y CSS con resaltado de sintaxis y autocompletado

## Créditos

Curso de Infografía 2026 · Mg Mario Quiroz Martinez
