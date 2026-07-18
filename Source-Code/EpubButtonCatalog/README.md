# Catálogo de Botones Interactivos para EPUB3

Catálogo autocontenido de **botones con efectos hover en CSS y animaciones de clic con [Anime.js](https://animejs.com/v3/documentation/#cssProperties)**, diseñado para insertarse como capítulo de un **EPUB3 interactivo** (con la propiedad `scripted`). Todo el HTML, CSS y JavaScript vive en un solo archivo, comentado en español.

## Contenido

```
EpubButtonCatalog/
├── catalogo-botones.html    # El catálogo completo (HTML + CSS + JS en un archivo)
├── catalogo-botones.epub    # EPUB3 ya empaquetado y listo para probar en un lector
├── make_catalog_epub.py     # Script que genera el .epub a partir del .html
└── README.md
```

## Los 6 efectos hover (inspirados en [Prismic — CSS hover effects](https://prismic.io/blog/css-hover-effects))

| # | Botón | Efecto hover | Animación de clic (Anime.js, camelCase) |
|---|-------|--------------|------------------------------------------|
| 1 | Subrayado deslizante | Línea que crece bajo el texto | Rebote elástico (`scale`) |
| 2 | Relleno líquido | Ola que inunda el fondo | Cambio de color (`backgroundColor`) |
| 3 | Tarjeta de dos caras | Giro 3D que muestra el reverso | Giro completo (`rotateY`) |
| 4 | Holográfico | Degradado multicolor + brillo | Pulso de radio (`borderRadius`) |
| 5 | Elevación con sombra | Se levanta de la página | Sacudida (`translateX`) |
| 6 | Borde dibujado | El marco se dibuja solo | Espaciado de letras (`letterSpacing`) |

## Componentes de la interfaz

- **Contenedor tipo libro** de 600×800 px con scroll interno; el contenido es fluido (reflowable) dentro de él, y el `<meta name="viewport" content="width=600, height=800"/>` hace que los visores que respetan el formato del documento (como el Editor Visual de EPUB de esta colección) lo enmarquen con proporción de libro.
- **Lista de botones**: panel desplegable que enumera los 6 botones; al tocar uno, la vista se desplaza hasta él y lo resalta.
- **Tres diálogos modales** (implementados con divs superpuestos, por compatibilidad con motores que aún no soportan `dialog`):
  - **Bienvenida** al cargar la página, explicando el catálogo.
  - **Confirmación** al tocar cualquier botón: *"Efecto aplicado correctamente sobre [nombre del botón]"*.
  - **Prueba** con el botón "Probar efecto": *"Prueba realizada. Revisa la previsualización para ver el efecto en acción."*
- **Diagnóstico de eventos**: botón que verifica y reporta si JavaScript está activo, si Anime.js cargó, cuántos oyentes de eventos hay registrados y si el entorno tiene soporte táctil.

## La solución al problema de los clics en lectores EPUB

Los botones fallan en lectores EPUB por tres causas típicas, y el código las ataca todas:

1. **El visor entrega eventos táctiles, no clics.** Cada acción se registra con `addEventListener` tanto para `click` como para `touchend`, así el toque responde de inmediato sin depender del clic sintético.
2. **Escuchar ambos eventos dispara la acción dos veces.** `preventDefault()` en `touchend` cancela el clic emulado, y un sello de tiempo ignora cualquier clic que llegue menos de 700 ms después de un toque (verificado con prueba automatizada: exactamente 1 disparo por tap).
3. **El visor tiene JavaScript desactivado.** Eso no puede arreglarse desde el código, pero se hace visible al instante: la insignia de estado dice "JavaScript inactivo" por defecto y solo el propio script la cambia a "activo". Si la ves roja dentro de un lector, ya sabes la causa.

Además, `touch-action: manipulation` elimina el retraso de ~300 ms del doble toque en visores móviles, y todo botón responde visualmente incluso sin Anime.js (animación CSS de respaldo) para que el tacto nunca parezca "muerto".

## Cómo usar

- **En el navegador**: abre `catalogo-botones.html` directamente (carga Anime.js desde CDN, necesita conexión).
- **En un lector EPUB**: abre `catalogo-botones.epub` (lleva Anime.js empaquetado dentro, funciona sin conexión). Probado con lectores basados en navegador; en lectores con JavaScript desactivado, la insignia roja lo indica.
- **Para regenerar el EPUB**: descarga `anime.min.js` (v3) a `vendor/anime.min.js` y ejecuta `python3 make_catalog_epub.py`.

## Nota sobre el Editor Visual de EPUB

El proyecto hermano `EpubVisualEditor` puede abrir este EPUB: el visor de edición muestra el contenido **sin ejecutar sus scripts** (aislamiento deliberado del sandbox), y el botón **"Probar como lector"** lo abre en una ventana emergente **con los scripts activos**, donde los botones, diálogos y animaciones funcionan exactamente como en un lector real.

## Créditos

Curso de Infografía 2026 · Mg Mario Quiroz Martinez
