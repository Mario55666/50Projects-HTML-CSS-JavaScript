# ForjaType — Editor de Glifos

Editor de fuentes tipográficas en un solo archivo HTML. Dibuja glifos letra por letra,
importa SVG complejos y exporta fuentes TrueType (.ttf) instalables.

## Características

- Herramientas de dibujo: pluma, línea, Bézier cuadrática y cúbica, borrador.
- **Importación SVG completa**: paths con todos los comandos (incluidos arcos `A/a` y
  comandos relativos), formas básicas (`rect`, `circle`, `ellipse`, `line`, `polyline`,
  `polygon`), grupos con `transform` (matrix, translate, scale, rotate, skew) y
  documentos con múltiples paths. Escalado automático a cap-height / x-height /
  ascender e inversión del eje Y al sistema tipográfico.
- **Corrección automática de dirección de contornos (winding)**: los agujeros
  (la "o", el interior de la "A") se orientan en sentido contrario al contorno
  exterior, tanto al importar como al exportar.
- **Exportación TTF real**: contornos cuadráticos TrueType vía conversión
  OTF→TTF integrada (fonteditor-core). Si la conversión no está disponible,
  exporta OTF como respaldo.
- Métricas globales (unitsPerEm, ascender, descender, x-height, cap-height),
  kerning por pares, capas de fondo, plantillas de imagen, componentes y
  letra guía de referencia.
- Sin dependencias de red: opentype.js y fonteditor-core van incrustados.

## Uso

Abre `index.html` en el navegador. El proyecto se guarda automáticamente en
`localStorage` y puede exportarse/importarse como JSON.

## Licencias de terceros

- [opentype.js](https://github.com/opentypejs/opentype.js) v1.3.4 — MIT
- [fonteditor-core](https://github.com/kekee000/fonteditor-core) v2.6.3 — MIT
