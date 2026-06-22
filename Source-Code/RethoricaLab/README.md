# 🕵️ RethoricaLab — Simulador de Análisis Retórico Publicitario

**El robo del mensaje secreto** · Actividad detectivesca de Semiótica de la Imagen
**Universidad Tecnológica del Perú (UTP) · 2026 — Unidad 4: Figuras Semióticas (Semana 16)**

PWA de **un solo archivo** (`index.html`) para el análisis semiótico‑retórico de piezas
publicitarias reales aplicando el modelo de **figuras de adjunción de Jacques Durand**.
El estudiante trabaja en grupo, resuelve un caso narrativo (un mensaje secreto robado),
analiza 4 piezas, refuerza la teoría con minijuegos y genera un **Dictamen Retórico**
exportable como evidencia de aprendizaje.

---

## 🎯 Logro de aprendizaje

Al resolver el caso, el grupo es capaz de **identificar y clasificar las figuras de
adjunción de Durand** —Repetición (identidad), Comparación (similitud), Antítesis
(oposición) y Acumulación (diferencia)— en piezas publicitarias reales,
**argumentando su efecto persuasivo** y proyectándolas a una campaña propia.

---

## 🧩 Flujo de la actividad

```
Contexto del caso  →  Registro del grupo  →  Sorteo + elegir 4 piezas
   →  Análisis por pieza (Observación → Identificación → Efecto → Conexión)
   →  Refuerzo obligatorio (Quiz)  →  Dictamen Retórico  →  Exportar (PDF / CSV)
```

Alineado al modelo didáctico de la sesión: **Inicio · Utilidad · Transformación ·
Práctica · Cierre**.

---

## ✨ Funcionalidades

### Narrativa y acceso
- **Pantalla de contexto detectivesca** ("El robo del mensaje secreto") con el logro de
  aprendizaje y los **7 sospechosos** (las piezas bajo investigación).
- **Registro grupal**: de **2 a 4 integrantes** (nombre + código/correo) y sección.
  Validación e integrantes dinámicos (agregar / quitar).

### Banco de imágenes
- **Sorteo automático** de las 7 piezas en cada ingreso.
- El grupo debe **seleccionar exactamente 4 piezas** (contador y numeración de selección).
- **Lightbox**: ampliar cualquier pieza a pantalla completa para analizarla (Esc / clic para cerrar).
- Botón **"Iniciar análisis"** destacado (animación de pulso) y barra de selección fija.

### Ficha de análisis (modelo de Durand) — por cada pieza
1. **Observación denotativa** (texto, mín. 80 caracteres).
2. **Identificación de la figura** de adjunción con retroalimentación inmediata
   (operación, relación semiótica y definición de Durand).
3. **Efecto persuasivo** (texto).
4. **Conexión con campaña propia** (texto).
- **Análisis secuencial de las 4 piezas** con indicador de progreso.
- **Refuerzo positivo escalonado** y **conectores insertables** para mejorar la
  coherencia y redacción de las respuestas abiertas.

### Refuerzo teórico (3 juegos interactivos y animados)
- **① Quiz de figuras** — preguntas cerradas con retroalimentación y **pistas (indicios)**.
  **Obligatorio**: cada pieza requiere aprobarlo (mín. 4/5) para finalizar su análisis.
- **② Caso ramificado** — árbol de decisión del método de análisis, con pistas.
- **③ Flashcards** — repaso del vocabulario (volteo 3D).

### Ayudas de estado (cuadros de diálogo)
- Botón **📋 Estado**: muestra el **resumen de las 4 piezas** (terminada / en curso /
  pendiente), el detalle de la pieza en curso y el avance global.
- Diálogos de confirmación al terminar cada pieza y al **resolver el caso**.

### Dictamen y exportación
- **Dictamen Retórico** que compila las 4 piezas (los 4 puntos + puntaje del quiz) y una
  **síntesis general**, firmado por el grupo.
- **🖨 Imprimir / PDF** (estilos de impresión que aíslan el dictamen).
- **⬇ Exportar CSV** con todo (grupo, integrantes, 4 piezas y quiz), en **formato
  regional de Excel en español** (separador `;`, BOM UTF‑8).

---

## 🎨 Diseño

- **Identidad UTP**: rojo `#E4032E`, grafito `#33373A` y grises, sobre estética cubista
  (bloques planos, recortes geométricos, collage).
- **SVG inline** para logos, iconos y el cuadro de Durand.
- **Fotografías reales** de las 7 piezas incrustadas en **base64** (autosuficiente).
- **Responsivo** desde 375px.

---

## 🛠️ Tecnologías

- **HTML5 semántico**, **CSS** propio (sin frameworks externos → funciona offline).
- **JavaScript vanilla** (sin dependencias ni servidor).
- **PWA**: `manifest` y `service worker` embebidos vía `Blob` (instalable / offline).
- Toda la información del estudiante se gestiona **en memoria temporal**.

---

## 🚀 Uso

Abre `index.html` en cualquier navegador moderno. No requiere instalación ni servidor.

Para instalarla como app (PWA) o que el service worker funcione, sírvela por
**HTTPS / localhost**:

```bash
# desde la carpeta del proyecto
python3 -m http.server 8000
# luego abre http://localhost:8000
```

> La carpeta `img/` contiene las fotos originales de respaldo; el `index.html` ya las
> lleva incrustadas, por lo que el archivo funciona por sí solo.

---

## 📁 Estructura

```
Source-Code/RethoricaLab/
├── index.html   # Aplicación completa (HTML + CSS + JS + imágenes base64)
├── img/         # Fotografías originales de las 7 piezas (respaldo)
└── README.md
```

---

Mg. **Mario Quiroz Martínez** — Semiótica de la Imagen | Unidad 4: Figuras Semióticas
Universidad Tecnológica del Perú (UTP) · 2026
