# Laboratorio Digital de Blasones

Herramienta interactiva y pedagógica de **diseño heráldico** en un único archivo
`index.html` (sin dependencias ni build). Compón escudos, tinturas y figuras sobre una
mesa de trabajo SVG, y obtén al vuelo el **blasonamiento** y la **interpretación
simbólica** de tu diseño.

![Laboratorio Digital de Blasones](https://img.shields.io/badge/single--file-HTML%2FCSS%2FJS-D4A853)

## Cómo usarlo

Abre `index.html` en cualquier navegador moderno (Chrome, Edge, Firefox). No requiere
servidor.

## Funcionalidades

- **Biblioteca heráldica** — 9 formas de escudo, 12 particiones del campo, 29 figuras
  (muebles) y 11 ornamentos exteriores, todos como SVG vectoriales. Clic para añadir al
  centro o arrastra a una posición concreta.
- **Mesa de trabajo SVG** — zoom, paneo (herramienta Mano / barra espaciadora / rueda),
  cuadrícula de 25 px con guías centrales y ajuste a cuadrícula (*snap*).
- **Edición directa** — selecciona un elemento y usa las manijas para escalar y rotar, o
  arrástralo. Las figuras y particiones se **recortan al contorno del escudo**
  (`clipPath`); los ornamentos quedan por fuera.
- **Panel de propiedades** — posición, tamaño, rotación, opacidad, relleno, borde, orden
  de capas, recorte y reflejo.
- **Capas** — visibilidad, bloqueo y reordenamiento.
- **Paleta de esmaltes** — 9 tinturas heráldicas + color personalizado, con validación
  no bloqueante de la **regla de esmaltes** (evitar metal sobre metal / color sobre color).
- **Blasonamiento automático** — descripción textual en lenguaje heráldico, actualizada
  en tiempo real.
- **Interpretación simbólica** — significado de cada tintura y figura.
- **Modo didáctico** — etiquetas sobre el lienzo y una **ficha de análisis imprimible**
  (doble clic en «Didáctico» para abrirla).
- **Proyecto** — guardado automático y manual en `localStorage`, importar/exportar
  **JSON**, y exportación a **SVG** y **PNG**.

## Atajos de teclado

| Acción | Tecla |
|---|---|
| Seleccionar / Mano | `V` / `H` |
| Deshacer / Rehacer | `Ctrl+Z` / `Ctrl+Y` (o `Ctrl+Shift+Z`) |
| Duplicar / Eliminar | `Ctrl+D` / `Supr` |
| Guardar | `Ctrl+S` |
| Mover selección | Flechas (con `Shift` = pasos de cuadrícula) |
| Paneo temporal | Mantener `Espacio` + arrastrar |

## Arquitectura

Todo vive en `index.html`: CSS embebido (sistema de diseño con tema oscuro editorial y
acentos dorado/cobre/plata) y JavaScript organizado en módulos por responsabilidad:

`CanvasHeraldico` (mesa SVG), `ElementoHeraldico` (modelo), `GestorCapas`,
`PaletaEsmaltes`, `GeneradorBlasonamiento`, `InterpreteSimbolico`, `GestorProyecto`,
`BibliotecaHeraldica`, `SistemaArrastre` y `ModoDidactico`.

> Las figuras heráldicas son SVG **estilizados y simplificados** para mantener el archivo
> manejable como pieza única, priorizando la funcionalidad completa de la herramienta.
