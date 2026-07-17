'use strict';

/* ------------------------------------------------------------------ */
/* Estado global                                                       */
/* ------------------------------------------------------------------ */

const state = {
  zip: null,               // instancia JSZip del .epub cargado
  opfPath: '',              // ruta del archivo .opf dentro del zip
  opfDir: '',                // carpeta que contiene el .opf (base para rutas relativas)
  manifest: new Map(),      // id -> { href, mediaType }
  spine: [],                // [{ idref, href }] en orden de lectura
  toc: [],                  // [{ label, href, depth }]
  chapterIndex: -1,
  chapterState: new Map(),  // href -> { doc, history:[], historyIndex, blobUrls:Map, dirty }
  bookViewport: null,       // { width, height } declarado a nivel de libro (rendition:viewport), si existe
  selectedUid: null,
  textEditMode: false,
  theme: 'dark',
  hasBook: false,
  exportDirty: false,
};

let euidCounter = 0;
let htmlEditorCM = null;
let cssEditorCM = null;

/* ------------------------------------------------------------------ */
/* Referencias DOM                                                     */
/* ------------------------------------------------------------------ */

const el = {
  fileInput: document.getElementById('fileInput'),
  dropHint: document.getElementById('dropHint'),
  viewerContainer: document.getElementById('viewerContainer'),
  chapterFrame: document.getElementById('chapterFrame'),
  loadingSpinner: document.getElementById('loadingSpinner'),
  prevChapterBtn: document.getElementById('prevChapterBtn'),
  nextChapterBtn: document.getElementById('nextChapterBtn'),
  chapterLabel: document.getElementById('chapterLabel'),
  undoBtn: document.getElementById('undoBtn'),
  redoBtn: document.getElementById('redoBtn'),
  exportBtn: document.getElementById('exportBtn'),
  readerPreviewBtn: document.getElementById('readerPreviewBtn'),
  themeToggleBtn: document.getElementById('themeToggleBtn'),
  textEditModeToggle: document.getElementById('textEditModeToggle'),
  dirtyIndicator: document.getElementById('dirtyIndicator'),
  domSearch: document.getElementById('domSearch'),
  domTree: document.getElementById('domTree'),
  selectedElementLabel: document.getElementById('selectedElementLabel'),
  htmlEditorArea: document.getElementById('htmlEditor'),
  applyHtmlBtn: document.getElementById('applyHtmlBtn'),
  resetHtmlBtn: document.getElementById('resetHtmlBtn'),
  cssTargetSelector: document.getElementById('cssTargetSelector'),
  cssEditorArea: document.getElementById('cssEditor'),
  applyCssBtn: document.getElementById('applyCssBtn'),
  propColor: document.getElementById('propColor'),
  propColorNone: document.getElementById('propColorNone'),
  propBackground: document.getElementById('propBackground'),
  propBackgroundNone: document.getElementById('propBackgroundNone'),
  propFontFamily: document.getElementById('propFontFamily'),
  propFontSize: document.getElementById('propFontSize'),
  propMargin: document.getElementById('propMargin'),
  propPadding: document.getElementById('propPadding'),
  textBulkEditor: document.getElementById('textBulkEditor'),
  applyTextBtn: document.getElementById('applyTextBtn'),
  tocList: document.getElementById('tocList'),
  animPresetSelect: document.getElementById('animPresetSelect'),
  animPresetDescription: document.getElementById('animPresetDescription'),
  animDuration: document.getElementById('animDuration'),
  animDelay: document.getElementById('animDelay'),
  animEasing: document.getElementById('animEasing'),
  animIterations: document.getElementById('animIterations'),
  animCssPreview: document.getElementById('animCssPreview'),
  previewAnimBtn: document.getElementById('previewAnimBtn'),
  applyAnimBtn: document.getElementById('applyAnimBtn'),
  helpToggleBtn: document.getElementById('helpToggleBtn'),
  helpPanel: document.getElementById('helpPanel'),
  helpPanelText: document.getElementById('helpPanelText'),
  helpCloseBtn: document.getElementById('helpCloseBtn'),
  selectedElementLayerInfo: document.getElementById('selectedElementLayerInfo'),
  buttonEditorSection: document.getElementById('buttonEditorSection'),
  buttonLabelInput: document.getElementById('buttonLabelInput'),
  buttonHrefInput: document.getElementById('buttonHrefInput'),
  applyButtonEditBtn: document.getElementById('applyButtonEditBtn'),
  insertButtonBtn: document.getElementById('insertButtonBtn'),
  tabs: Array.from(document.querySelectorAll('.tab-btn')),
  panels: Array.from(document.querySelectorAll('.tab-panel')),
  toast: document.getElementById('toast'),
};

/* ------------------------------------------------------------------ */
/* Utilidades generales                                                */
/* ------------------------------------------------------------------ */

let toastTimer = null;
function showToast(message, isError) {
  el.toast.textContent = message;
  el.toast.classList.toggle('toast-error', Boolean(isError));
  el.toast.classList.remove('hidden');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.toast.classList.add('hidden'), 3200);
}

function showSpinner(show) {
  el.loadingSpinner.classList.toggle('hidden', !show);
}

function resolvePath(baseDir, href) {
  if (!href) return href;
  if (/^([a-z]+:)?\/\//i.test(href) || href.startsWith('data:')) return href;
  const cleanHref = href.split('#')[0];
  const stack = baseDir ? baseDir.split('/').filter(Boolean) : [];
  const parts = cleanHref.split('/');
  for (const part of parts) {
    if (part === '' || part === '.') continue;
    if (part === '..') stack.pop();
    else stack.push(part);
  }
  return stack.join('/');
}

function dirOf(path) {
  const idx = path.lastIndexOf('/');
  return idx === -1 ? '' : path.slice(0, idx);
}

function setDirty(dirty) {
  state.exportDirty = dirty;
  el.dirtyIndicator.classList.toggle('hidden', !dirty);
}

/* ------------------------------------------------------------------ */
/* Carga de EPUB                                                       */
/* ------------------------------------------------------------------ */

async function loadEpubFile(file) {
  showSpinner(true);
  try {
    const zip = await JSZip.loadAsync(file);
    await parseEpub(zip);
    state.hasBook = true;
    el.dropHint.classList.add('hidden');
    el.viewerContainer.classList.remove('hidden');
    el.exportBtn.disabled = false;
    el.readerPreviewBtn.disabled = false;
    setDirty(false);
    renderToc();
    await loadChapter(0);
    showToast('EPUB cargado: ' + (state.spine.length) + ' capítulo(s).');
  } catch (err) {
    console.error(err);
    showToast('No se pudo leer el archivo .epub: ' + err.message, true);
  } finally {
    showSpinner(false);
  }
}

async function parseEpub(zip) {
  state.zip = zip;
  state.manifest = new Map();
  state.spine = [];
  state.toc = [];
  state.chapterIndex = -1;
  state.chapterState = new Map();
  state.selectedUid = null;

  const containerXml = await zip.file('META-INF/container.xml').async('string');
  const containerDoc = new DOMParser().parseFromString(containerXml, 'application/xml');
  const rootfileEl = containerDoc.querySelector('rootfile');
  state.opfPath = rootfileEl.getAttribute('full-path');
  state.opfDir = dirOf(state.opfPath);

  const opfXml = await zip.file(state.opfPath).async('string');
  const opfDoc = new DOMParser().parseFromString(opfXml, 'application/xml');

  opfDoc.querySelectorAll('manifest > item').forEach((item) => {
    state.manifest.set(item.getAttribute('id'), {
      href: resolvePath(state.opfDir, item.getAttribute('href')),
      mediaType: item.getAttribute('media-type') || '',
      properties: item.getAttribute('properties') || '',
    });
  });

  opfDoc.querySelectorAll('spine > itemref').forEach((itemref) => {
    const idref = itemref.getAttribute('idref');
    const manifestItem = state.manifest.get(idref);
    if (manifestItem) {
      state.spine.push({ idref, href: manifestItem.href });
    }
  });

  const viewportMeta = opfDoc.querySelector('metadata meta[property="rendition:viewport"]');
  state.bookViewport = viewportMeta
    ? parseViewportSize((viewportMeta.textContent || '').trim() || viewportMeta.getAttribute('content'))
    : null;

  await loadToc(zip, opfDoc);
}

// Lee un tamaño de página tipo "width=600,height=800" (o "width=600, height=800px"),
// tal como lo declaran el <meta name="viewport"> de un capítulo XHTML o el
// <meta property="rendition:viewport"> a nivel de libro en el .opf.
function parseViewportSize(content) {
  if (!content) return null;
  const w = /width\s*=\s*([\d.]+)/i.exec(content);
  const h = /height\s*=\s*([\d.]+)/i.exec(content);
  if (!w || !h) return null;
  const width = parseFloat(w[1]);
  const height = parseFloat(h[1]);
  if (!width || !height) return null;
  return { width, height };
}

async function loadToc(zip, opfDoc) {
  const navItem = Array.from(state.manifest.values()).find((item) =>
    item.properties.split(/\s+/).includes('nav'));

  if (navItem && zip.file(navItem.href)) {
    const navXml = await zip.file(navItem.href).async('string');
    const navDoc = new DOMParser().parseFromString(navXml, 'application/xhtml+xml');
    const navEl = navDoc.querySelector('nav[*|type="toc"], nav');
    if (navEl) {
      const navDir = dirOf(navItem.href);
      state.toc = extractNavList(navEl, navDir, 0);
      return;
    }
  }

  const tocItem = Array.from(state.manifest.values()).find((item) =>
    item.mediaType === 'application/x-dtbncx+xml');
  if (tocItem && zip.file(tocItem.href)) {
    const ncxXml = await zip.file(tocItem.href).async('string');
    const ncxDoc = new DOMParser().parseFromString(ncxXml, 'application/xml');
    const navMap = ncxDoc.querySelector('navMap');
    if (navMap) {
      const ncxDir = dirOf(tocItem.href);
      state.toc = extractNavPoints(navMap, ncxDir, 0);
      return;
    }
  }

  // Sin TOC declarado: se genera uno a partir del spine.
  state.toc = state.spine.map((entry, i) => ({
    label: 'Capítulo ' + (i + 1),
    href: entry.href,
    depth: 0,
  }));
}

function extractNavList(navEl, baseDir, depth) {
  const items = [];
  const listEl = navEl.querySelector(':scope > ol');
  if (!listEl) return items;
  listEl.querySelectorAll(':scope > li').forEach((li) => {
    const link = li.querySelector(':scope > a, :scope > span');
    const label = link ? link.textContent.trim() : '';
    const href = link && link.getAttribute('href')
      ? resolvePath(baseDir, link.getAttribute('href'))
      : '';
    if (label) items.push({ label, href, depth });
    const subOl = li.querySelector(':scope > ol');
    if (subOl) {
      items.push(...extractNavList(li, baseDir, depth + 1));
    }
  });
  return items;
}

function extractNavPoints(parentEl, baseDir, depth) {
  const items = [];
  parentEl.querySelectorAll(':scope > navPoint').forEach((navPoint) => {
    const label = navPoint.querySelector(':scope > navLabel > text');
    const content = navPoint.querySelector(':scope > content');
    const href = content && content.getAttribute('src')
      ? resolvePath(baseDir, content.getAttribute('src'))
      : '';
    if (label) items.push({ label: label.textContent.trim(), href, depth });
    items.push(...extractNavPoints(navPoint, baseDir, depth + 1));
  });
  return items;
}

/* ------------------------------------------------------------------ */
/* Índice (TOC)                                                        */
/* ------------------------------------------------------------------ */

function renderToc() {
  el.tocList.innerHTML = '';
  if (!state.toc.length) {
    el.tocList.innerHTML = '<li class="empty-hint">Este EPUB no declara un índice.</li>';
    return;
  }
  state.toc.forEach((entry) => {
    const li = document.createElement('li');
    li.className = 'toc-item';
    li.style.paddingLeft = (entry.depth * 1) + 'rem';
    li.textContent = entry.label;
    li.dataset.href = entry.href.split('#')[0];
    li.addEventListener('click', () => {
      const spineIndex = state.spine.findIndex((s) => s.href === li.dataset.href);
      if (spineIndex !== -1) loadChapter(spineIndex);
      else showToast('No se encontró ese capítulo en el spine.', true);
    });
    el.tocList.appendChild(li);
  });
}

function highlightActiveToc() {
  const currentHref = state.spine[state.chapterIndex]
    ? state.spine[state.chapterIndex].href
    : '';
  el.tocList.querySelectorAll('.toc-item').forEach((li) => {
    li.classList.toggle('active', li.dataset.href === currentHref);
  });
}

/* ------------------------------------------------------------------ */
/* Carga y render de capítulos                                         */
/* ------------------------------------------------------------------ */

async function loadChapter(index) {
  if (index < 0 || index >= state.spine.length) return;
  showSpinner(true);
  try {
    const entry = state.spine[index];
    state.chapterIndex = index;
    state.selectedUid = null;
    clearSelectionUI();

    let chapter = state.chapterState.get(entry.href);
    if (!chapter) {
      chapter = await buildChapterState(entry.href);
      state.chapterState.set(entry.href, chapter);
    }

    await renderChapterDoc(chapter);
    updateChapterNavUI();
    highlightActiveToc();
    renderDomTree();
    updateUndoRedoUI();
    el.insertButtonBtn.disabled = false;
  } catch (err) {
    console.error(err);
    showToast('No se pudo cargar el capítulo: ' + err.message, true);
  } finally {
    showSpinner(false);
  }
}

async function buildChapterState(href) {
  const rawXml = await state.zip.file(href).async('string');
  const doc = new DOMParser().parseFromString(rawXml, 'application/xhtml+xml');
  if (doc.querySelector('parsererror')) {
    // Reintenta como HTML si el XHTML es inválido (algunos EPUB mal formados).
    const fallback = new DOMParser().parseFromString(rawXml, 'text/html');
    return finalizeChapterState(href, fallback);
  }
  return finalizeChapterState(href, doc);
}

function finalizeChapterState(href, doc) {
  assignUids(doc);
  const viewportEl = doc.querySelector('meta[name="viewport"]');
  const chapter = {
    href,
    dir: dirOf(href),
    doc,
    customCss: '',
    history: [],
    historyIndex: -1,
    blobUrls: new Map(), // ruta original -> blob URL
    pageSize: viewportEl ? parseViewportSize(viewportEl.getAttribute('content')) : null,
  };
  pushHistory(chapter);
  return chapter;
}

function assignUids(doc) {
  const walker = doc.createTreeWalker
    ? doc.createTreeWalker(doc.body || doc.documentElement, NodeFilter.SHOW_ELEMENT)
    : null;
  if (!walker) return;
  let node = walker.currentNode;
  while (node) {
    if (node.nodeType === 1 && !node.hasAttribute('data-euid')) {
      node.setAttribute('data-euid', 'e' + (euidCounter += 1));
    }
    node = walker.nextNode();
  }
}

const EDITOR_INTERNAL_CSS = '.epub-editor-selected { outline: 3px solid #38bdf8 !important; '
  + 'outline-offset: 1px !important; background-color: rgba(56, 189, 248, 0.12) !important; } '
  + '.epub-editor-editable-text { outline: 2px dashed #f97316 !important; outline-offset: 1px !important; } '
  + '.epub-editor-textmode { cursor: text; }';

const EDITOR_TRANSIENT_CLASSES = [
  'epub-editor-selected', 'epub-editor-editable-text', 'epub-editor-textmode', 'epub-editor-anim-preview',
];

function stripEditorArtifacts(doc) {
  doc.querySelectorAll('#epub-editor-internal-css, #epub-editor-custom-css, #epub-editor-anim-preview-css')
    .forEach((n) => n.remove());
  EDITOR_TRANSIENT_CLASSES.forEach((cls) => {
    doc.querySelectorAll('.' + cls).forEach((n) => n.classList.remove(cls));
  });
}

async function renderChapterDoc(chapter) {
  stripEditorArtifacts(chapter.doc);
  await resolveAssets(chapter);
  const html = serializeLive(chapter.doc);
  const withInternalCss = injectStyleTag(html, 'epub-editor-internal-css', EDITOR_INTERNAL_CSS);
  const withCss = injectStyleTag(withInternalCss, 'epub-editor-custom-css', chapter.customCss);

  await new Promise((resolve) => {
    const frame = el.chapterFrame;
    const onLoad = () => {
      frame.removeEventListener('load', onLoad);
      wireIframeInteractions(chapter);
      applyViewerFormat(chapter);
      resolve();
    };
    frame.addEventListener('load', onLoad);
    frame.srcdoc = withCss;
  });
}

// Ajusta el tamaño del visor al formato de página que declare el propio EPUB
// (meta viewport del capítulo, o rendition:viewport del libro) en vez de estirar
// siempre el iframe al 100% del panel. Si el libro no declara un tamaño de
// página (típico en EPUB de flujo continuo/reflowable), el iframe vuelve a
// ocupar todo el espacio disponible.
function applyViewerFormat(chapter) {
  const pageSize = (chapter && chapter.pageSize) || state.bookViewport || null;
  const container = el.viewerContainer;

  if (!pageSize) {
    el.chapterFrame.style.width = '';
    el.chapterFrame.style.height = '';
    container.classList.remove('viewer-container-fixed');
    return;
  }

  container.classList.add('viewer-container-fixed');
  const style = getComputedStyle(container);
  const padX = parseFloat(style.paddingLeft) + parseFloat(style.paddingRight);
  const padY = parseFloat(style.paddingTop) + parseFloat(style.paddingBottom);
  const availW = Math.max(container.clientWidth - padX, 50);
  const availH = Math.max(container.clientHeight - padY, 50);
  const scale = Math.min(availW / pageSize.width, availH / pageSize.height);

  el.chapterFrame.style.width = Math.round(pageSize.width * scale) + 'px';
  el.chapterFrame.style.height = Math.round(pageSize.height * scale) + 'px';
}

function injectStyleTag(html, id, css) {
  if (!css || !css.trim()) return html;
  const styleTag = '<style id="' + id + '">' + css + '</style>';
  if (html.includes('</head>')) return html.replace('</head>', styleTag + '</head>');
  return styleTag + html;
}

/* ------------------------------------------------------------------ */
/* Resolución de recursos (imágenes, CSS enlazado)                     */
/* ------------------------------------------------------------------ */

async function resolveAssets(chapter) {
  const doc = chapter.doc;
  const refs = [];

  doc.querySelectorAll('img[src], image').forEach((node) => {
    const attr = node.tagName.toLowerCase() === 'image' ? 'href' : 'src';
    const raw = node.getAttribute(attr) || node.getAttributeNS('http://www.w3.org/1999/xlink', 'href');
    if (raw && !raw.startsWith('blob:') && !raw.startsWith('data:')) {
      refs.push({ node, attr, raw });
    }
  });

  doc.querySelectorAll('link[rel="stylesheet"][href]').forEach((node) => {
    const raw = node.getAttribute('href');
    if (raw && !raw.startsWith('blob:')) refs.push({ node, attr: 'href', raw });
  });

  for (const ref of refs) {
    const fullPath = resolvePath(chapter.dir, ref.raw);
    let blobUrl = chapter.blobUrls.get(fullPath);
    if (!blobUrl) {
      const zipFile = state.zip.file(fullPath);
      if (!zipFile) continue;
      const mediaType = guessMediaType(fullPath);
      const blob = await zipFile.async('blob');
      const typedBlob = mediaType ? blob.slice(0, blob.size, mediaType) : blob;
      blobUrl = URL.createObjectURL(typedBlob);
      chapter.blobUrls.set(fullPath, blobUrl);
    }
    if (!ref.node.hasAttribute('data-original-' + ref.attr)) {
      ref.node.setAttribute('data-original-' + ref.attr, ref.raw);
    }
    ref.node.setAttribute(ref.attr, blobUrl);
  }
}

function guessMediaType(path) {
  const ext = path.split('.').pop().toLowerCase();
  const map = {
    png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', gif: 'image/gif',
    svg: 'image/svg+xml', webp: 'image/webp', css: 'text/css',
  };
  return map[ext] || '';
}

/* ------------------------------------------------------------------ */
/* Serialización                                                       */
/* ------------------------------------------------------------------ */

function serializeLive(doc) {
  const serializer = new XMLSerializer();
  let html = serializer.serializeToString(doc);
  if (!html.startsWith('<?xml')) {
    html = '<?xml version="1.0" encoding="UTF-8"?>\n' + html;
  }
  return html;
}

// Limpia un documento de capítulo de todo rastro interno del editor (data-euid,
// contenteditable, clases/estilos de resaltado y de vista previa) y reinserta el
// CSS aplicado como una hoja de estilos permanente. Con revertBlobUrls=true las
// imágenes/CSS vuelven a sus rutas relativas originales (para el EPUB exportado);
// con revertBlobUrls=false se conservan las blob: URLs (para la ventana emergente
// de "probar como lector", que no tiene un servidor de archivos detrás).
function serializeCleanDoc(doc, customCss, revertBlobUrls) {
  const clone = doc.cloneNode(true);
  clone.querySelectorAll('[data-euid]').forEach((n) => n.removeAttribute('data-euid'));
  clone.querySelectorAll('[contenteditable]').forEach((n) =>
    n.removeAttribute('contenteditable'));
  stripEditorArtifacts(clone);
  clone.querySelectorAll('[class=""]').forEach((n) => n.removeAttribute('class'));

  ['src', 'href'].forEach((attr) => {
    clone.querySelectorAll('[data-original-' + attr + ']').forEach((n) => {
      if (revertBlobUrls) n.setAttribute(attr, n.getAttribute('data-original-' + attr));
      n.removeAttribute('data-original-' + attr);
    });
  });

  if (customCss && customCss.trim()) {
    const styleEl = clone.createElement('style');
    styleEl.textContent = customCss;
    const head = clone.querySelector('head');
    if (head) head.appendChild(styleEl);
    else clone.documentElement.insertBefore(styleEl, clone.documentElement.firstChild);
  }

  return serializeLive(clone);
}

function serializeForExport(doc, customCss) {
  return serializeCleanDoc(doc, customCss, true);
}

function serializeForReaderPreview(chapter) {
  return serializeCleanDoc(chapter.doc, chapter.customCss, false);
}

function openReaderPreview() {
  const chapter = currentChapter();
  if (!chapter) return;

  const pageSize = chapter.pageSize || state.bookViewport;
  const popupW = pageSize ? Math.min(Math.round(pageSize.width) + 40, screen.availWidth - 60) : 820;
  const popupH = pageSize ? Math.min(Math.round(pageSize.height) + 80, screen.availHeight - 60) : 1000;

  const html = serializeForReaderPreview(chapter).replace(/^<\?xml[^>]*\?>\s*/, '');
  const popup = window.open('', '_blank', 'width=' + popupW + ',height=' + popupH);
  if (!popup) {
    showToast('El navegador bloqueó la ventana emergente. Permite ventanas emergentes para este sitio.', true);
    return;
  }
  popup.opener = null;
  popup.document.open();
  popup.document.write(html);
  popup.document.close();
}

/* ------------------------------------------------------------------ */
/* Historial (undo/redo)                                               */
/* ------------------------------------------------------------------ */

const HISTORY_LIMIT = 60;

function currentChapter() {
  const entry = state.spine[state.chapterIndex];
  if (!entry) return null;
  return state.chapterState.get(entry.href) || null;
}

function pushHistory(chapter) {
  const snapshot = {
    html: serializeLive(chapter.doc),
    customCss: chapter.customCss,
  };
  chapter.history = chapter.history.slice(0, chapter.historyIndex + 1);
  chapter.history.push(snapshot);
  if (chapter.history.length > HISTORY_LIMIT) chapter.history.shift();
  chapter.historyIndex = chapter.history.length - 1;
}

async function restoreSnapshot(chapter, snapshot) {
  const doc = new DOMParser().parseFromString(snapshot.html, 'application/xhtml+xml');
  chapter.doc = doc;
  chapter.customCss = snapshot.customCss;
  await renderChapterDoc(chapter);
  renderDomTree();
  clearSelectionUI();
}

async function undo() {
  const chapter = currentChapter();
  if (!chapter || chapter.historyIndex <= 0) return;
  chapter.historyIndex -= 1;
  await restoreSnapshot(chapter, chapter.history[chapter.historyIndex]);
  updateUndoRedoUI();
  setDirty(true);
}

async function redo() {
  const chapter = currentChapter();
  if (!chapter || chapter.historyIndex >= chapter.history.length - 1) return;
  chapter.historyIndex += 1;
  await restoreSnapshot(chapter, chapter.history[chapter.historyIndex]);
  updateUndoRedoUI();
  setDirty(true);
}

function updateUndoRedoUI() {
  const chapter = currentChapter();
  el.undoBtn.disabled = !chapter || chapter.historyIndex <= 0;
  el.redoBtn.disabled = !chapter || chapter.historyIndex >= chapter.history.length - 1;
}

/* ------------------------------------------------------------------ */
/* Navegación de capítulos                                             */
/* ------------------------------------------------------------------ */

function updateChapterNavUI() {
  const total = state.spine.length;
  el.chapterLabel.textContent = total
    ? 'Capítulo ' + (state.chapterIndex + 1) + ' de ' + total
    : 'Sin libro cargado';
  el.prevChapterBtn.disabled = state.chapterIndex <= 0;
  el.nextChapterBtn.disabled = state.chapterIndex >= total - 1;
}

/* ------------------------------------------------------------------ */
/* Interacción dentro del iframe (selección, resaltado, edición texto) */
/* ------------------------------------------------------------------ */

function wireIframeInteractions(chapter) {
  const frameDoc = el.chapterFrame.contentDocument;
  if (!frameDoc) return;

  frameDoc.body.addEventListener('click', (e) => {
    const target = e.target.closest('[data-euid]');
    if (!target) return;

    if (state.textEditMode) {
      enableInlineTextEdit(target, chapter);
      return;
    }
    e.preventDefault();
    selectElementByUid(target.getAttribute('data-euid'), chapter);
  }, true);

  applyTextEditModeToFrame();
  if (state.selectedUid) highlightInFrame(state.selectedUid);
}

function enableInlineTextEdit(target, chapter) {
  target.setAttribute('contenteditable', 'true');
  target.classList.add('epub-editor-editable-text');
  target.focus();

  const commit = () => {
    target.removeEventListener('blur', commit);
    target.removeAttribute('contenteditable');
    target.classList.remove('epub-editor-editable-text');
    syncDocFromFrame(chapter);
    pushHistory(chapter);
    updateUndoRedoUI();
    setDirty(true);
    showToast('Texto actualizado.');
  };
  target.addEventListener('blur', commit, { once: true });
}

function syncDocFromFrame(chapter) {
  // Reconstruye chapter.doc a partir del DOM actual del iframe (fuente de verdad tras ediciones inline).
  const frameDoc = el.chapterFrame.contentDocument;
  frameDoc.body.classList.remove('epub-editor-textmode');
  const serializer = new XMLSerializer();
  const html = serializer.serializeToString(frameDoc.documentElement);
  const cleanHtml = html.includes('<?xml')
    ? html
    : '<?xml version="1.0" encoding="UTF-8"?>\n' + html;
  chapter.doc = new DOMParser().parseFromString(cleanHtml, 'application/xhtml+xml');
  stripEditorArtifacts(chapter.doc);
  frameDoc.body.classList.toggle('epub-editor-textmode', state.textEditMode);
}

function applyTextEditModeToFrame() {
  const frameDoc = el.chapterFrame.contentDocument;
  if (!frameDoc) return;
  frameDoc.body.classList.toggle('epub-editor-textmode', state.textEditMode);
}

/* ------------------------------------------------------------------ */
/* Explorador DOM                                                      */
/* ------------------------------------------------------------------ */

function renderDomTree() {
  const chapter = currentChapter();
  el.domTree.innerHTML = '';
  if (!chapter || !chapter.doc.body) {
    el.domTree.innerHTML = '<p class="empty-hint">Este capítulo no tiene contenido.</p>';
    return;
  }
  const rootNode = buildDomNodeUI(chapter.doc.body, 0);
  el.domTree.appendChild(rootNode);
  applyDomSearchFilter();
}

function buildDomNodeUI(element, depth) {
  const wrapper = document.createElement('div');
  wrapper.className = 'dom-node';

  const row = document.createElement('div');
  row.className = 'dom-node-row';
  row.style.paddingLeft = depth + 'rem';
  row.dataset.uid = element.getAttribute('data-euid') || '';

  const children = Array.from(element.children);
  const toggle = document.createElement('span');
  toggle.className = 'dom-toggle';
  toggle.textContent = children.length ? '▾' : '';

  const type = identifyLayerType(element);
  const typeSpan = document.createElement('span');
  typeSpan.className = 'dom-type-badge dom-type-' + type.kind;
  typeSpan.textContent = type.icon;
  typeSpan.title = type.label;

  const tagSpan = document.createElement('span');
  tagSpan.className = 'dom-tag';
  tagSpan.textContent = '<' + element.tagName.toLowerCase() + '>';

  row.appendChild(toggle);
  row.appendChild(typeSpan);
  row.appendChild(tagSpan);

  if (element.id) {
    const idSpan = document.createElement('span');
    idSpan.className = 'dom-id';
    idSpan.textContent = '#' + element.id;
    row.appendChild(idSpan);
  }
  if (element.className && typeof element.className === 'string') {
    const classSpan = document.createElement('span');
    classSpan.className = 'dom-class';
    classSpan.textContent = element.className
      .split(/\s+/)
      .filter(Boolean)
      .map((c) => '.' + c)
      .join('');
    row.appendChild(classSpan);
  }

  row.addEventListener('click', (e) => {
    e.stopPropagation();
    selectElementByUid(row.dataset.uid, currentChapter());
  });

  wrapper.appendChild(row);

  if (children.length) {
    const childrenWrap = document.createElement('div');
    childrenWrap.className = 'dom-children';
    children.forEach((child) => {
      childrenWrap.appendChild(buildDomNodeUI(child, depth + 1));
    });
    wrapper.appendChild(childrenWrap);

    toggle.addEventListener('click', (e) => {
      e.stopPropagation();
      childrenWrap.classList.toggle('collapsed');
      toggle.textContent = childrenWrap.classList.contains('collapsed') ? '▸' : '▾';
    });
  }

  return wrapper;
}

function applyDomSearchFilter() {
  const query = el.domSearch.value.trim().toLowerCase();
  const rows = el.domTree.querySelectorAll('.dom-node-row');
  if (!query) {
    rows.forEach((row) => row.closest('.dom-node').classList.remove('filtered-out'));
    return;
  }
  rows.forEach((row) => {
    const text = row.textContent.toLowerCase();
    const matches = text.includes(query);
    row.closest('.dom-node').classList.toggle('filtered-out', !matches);
  });
}

/* ------------------------------------------------------------------ */
/* Selección de elementos                                              */
/* ------------------------------------------------------------------ */

function selectElementByUid(uid, chapter) {
  if (!uid || !chapter) return;
  state.selectedUid = uid;
  // Se lee el estilo computado (para identificar transparencia real) ANTES de
  // aplicar el resaltado de selección: el propio resaltado usa un fondo semi-
  // transparente que, si ya estuviera aplicado, contaminaría esa lectura.
  loadElementIntoEditors(uid, chapter);
  highlightInFrame(uid);
  highlightInDomTree(uid);
}

function findElementByUid(doc, uid) {
  return doc.querySelector('[data-euid="' + uid + '"]');
}

function highlightInFrame(uid) {
  const frameDoc = el.chapterFrame.contentDocument;
  if (!frameDoc) return;
  frameDoc.querySelectorAll('.epub-editor-selected').forEach((n) =>
    n.classList.remove('epub-editor-selected'));
  const target = findElementByUid(frameDoc, uid);
  if (target) {
    target.classList.add('epub-editor-selected');
    target.scrollIntoView({ block: 'center', behavior: 'smooth' });
  }
}

function highlightInDomTree(uid) {
  el.domTree.querySelectorAll('.dom-node-row').forEach((row) => {
    row.classList.toggle('selected', row.dataset.uid === uid);
  });
}

function clearSelectionUI() {
  state.selectedUid = null;
  el.selectedElementLabel.textContent = 'Ningún elemento seleccionado';
  el.applyHtmlBtn.disabled = true;
  el.resetHtmlBtn.disabled = true;
  el.textBulkEditor.disabled = true;
  el.textBulkEditor.value = '';
  el.applyTextBtn.disabled = true;
  el.cssTargetSelector.value = '';
  el.previewAnimBtn.disabled = true;
  el.applyAnimBtn.disabled = true;
  el.propColorNone.checked = true;
  el.propColor.disabled = true;
  el.propBackgroundNone.checked = true;
  el.propBackground.disabled = true;
  el.selectedElementLayerInfo.textContent = '';
  el.buttonEditorSection.classList.add('hidden');
  setEditorValue(htmlEditorCM, el.htmlEditorArea, '');
  updateAnimCssPreviewText();
}

// Muchos EPUB exportados (p. ej. desde Adobe InDesign) reutilizan la misma clase
// CSS en decenas de objetos distintos (como "_idGenObjectAttribute-1"), así que
// identificar el objeto seleccionado por su clase no lo distingue de los demás.
// Por eso, al seleccionarlo, se le asigna un id propio y estable (si no tiene uno
// ya) para poder identificarlo y aplicarle HTML/CSS/animaciones de forma exclusiva.
function ensureStableId(node, uid) {
  if (!node.id) {
    node.id = 'edobj-' + uid;
  }
  return node.id;
}

function loadElementIntoEditors(uid, chapter) {
  const source = findElementByUid(chapter.doc, uid);
  if (!source) return;

  ensureStableId(source, uid);
  const frameDoc = el.chapterFrame.contentDocument;
  const liveEl = frameDoc && findElementByUid(frameDoc, uid);
  if (liveEl && !liveEl.id) liveEl.id = source.id;

  const label = describeElement(source);
  el.selectedElementLabel.textContent = label;

  const html = new XMLSerializer().serializeToString(source);
  setEditorValue(htmlEditorCM, el.htmlEditorArea, html);
  el.applyHtmlBtn.disabled = false;
  el.resetHtmlBtn.disabled = false;

  el.textBulkEditor.disabled = false;
  el.textBulkEditor.value = source.textContent;
  el.applyTextBtn.disabled = false;

  el.cssTargetSelector.value = '#' + source.id;
  loadComputedPropsIntoPanel(uid);

  el.previewAnimBtn.disabled = false;
  el.applyAnimBtn.disabled = false;
  updateAnimCssPreviewText();

  updateLayerInfo(source, liveEl);
  updateButtonEditorUI(source);
}

/* ------------------------------------------------------------------ */
/* Identificación de capas (imagen / vector / texto / transparencia)   */
/* ------------------------------------------------------------------ */

function identifyLayerType(node) {
  const tag = node.tagName.toLowerCase();
  // Preferir data-original-src/href: una vez que resolveAssets() reescribe src/href
  // a una blob: URL para poder previsualizar la imagen, la extensión original
  // (.svg vs .png/.jpg) ya no es visible en el atributo src/href en sí.
  const ref = (node.getAttribute && (
    node.getAttribute('data-original-src')
    || node.getAttribute('data-original-href')
    || node.getAttribute('src')
    || node.getAttribute('href')
    || (node.getAttributeNS ? node.getAttributeNS('http://www.w3.org/1999/xlink', 'href') : '')
  )) || '';

  if (tag === 'svg' || /\.svg(\?|#|$)/i.test(ref)) {
    return { kind: 'vector', icon: '◆', label: 'Vectorial (SVG)' };
  }
  if (tag === 'img' || tag === 'image') {
    return { kind: 'image', icon: '▧', label: 'Imagen' };
  }
  const textTags = ['p', 'span', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'a', 'li', 'td', 'th', 'em', 'strong', 'b', 'i', 'button'];
  if (textTags.includes(tag) && node.children.length === 0) {
    return { kind: 'text', icon: 'T', label: 'Texto' };
  }
  return { kind: 'container', icon: '▢', label: 'Contenedor' };
}

function describeTransparency(computed) {
  const opacity = parseFloat(computed.opacity);
  const bgMatch = /rgba?\(\s*[\d.]+\s*,\s*[\d.]+\s*,\s*[\d.]+\s*(?:,\s*([\d.]+)\s*)?\)/.exec(computed.backgroundColor || '');
  const bgAlpha = bgMatch ? (bgMatch[1] === undefined ? 1 : parseFloat(bgMatch[1])) : null;

  const parts = [];
  if (!Number.isNaN(opacity) && opacity < 1) parts.push('opacidad ' + Math.round(opacity * 100) + '%');
  if (bgAlpha !== null && bgAlpha < 1) {
    parts.push(bgAlpha === 0 ? 'fondo transparente' : 'fondo ' + Math.round(bgAlpha * 100) + '% opaco');
  }
  return parts.length ? parts.join(', ') : 'totalmente opaco';
}

function updateLayerInfo(source, liveEl) {
  const type = identifyLayerType(source);
  let text = 'Tipo: ' + type.label;
  if (liveEl && el.chapterFrame.contentDocument && el.chapterFrame.contentDocument.defaultView) {
    const computed = el.chapterFrame.contentDocument.defaultView.getComputedStyle(liveEl);
    text += ' · ' + describeTransparency(computed);
  }
  el.selectedElementLayerInfo.textContent = text;
}

/* ------------------------------------------------------------------ */
/* Editor de botones                                                    */
/* ------------------------------------------------------------------ */

function isButtonLike(node) {
  const tag = node.tagName.toLowerCase();
  if (tag === 'button' || tag === 'a') return true;
  if (tag === 'input') {
    const type = (node.getAttribute('type') || '').toLowerCase();
    return type === 'button' || type === 'submit' || type === 'reset';
  }
  return false;
}

function updateButtonEditorUI(source) {
  const isBtn = isButtonLike(source);
  el.buttonEditorSection.classList.toggle('hidden', !isBtn);
  if (!isBtn) return;

  const tag = source.tagName.toLowerCase();
  el.buttonLabelInput.value = tag === 'input' ? (source.getAttribute('value') || '') : source.textContent.trim();
  el.buttonHrefInput.value = tag === 'a' ? (source.getAttribute('href') || '') : '';
  el.buttonHrefInput.disabled = tag !== 'a';
}

function applyButtonEdit() {
  const chapter = currentChapter();
  if (!chapter || !state.selectedUid) return;
  const source = findElementByUid(chapter.doc, state.selectedUid);
  if (!source || !isButtonLike(source)) return;

  const tag = source.tagName.toLowerCase();
  if (tag === 'input') source.setAttribute('value', el.buttonLabelInput.value);
  else source.textContent = el.buttonLabelInput.value;

  if (tag === 'a') {
    const href = el.buttonHrefInput.value.trim();
    if (href) source.setAttribute('href', href);
    else source.removeAttribute('href');
  }

  renderChapterDoc(chapter).then(() => {
    renderDomTree();
    loadElementIntoEditors(state.selectedUid, chapter);
    pushHistory(chapter);
    updateUndoRedoUI();
    setDirty(true);
    showToast('Botón actualizado.');
  });
}

const DEFAULT_BUTTON_CSS = '.epub-btn {\n  display: inline-block;\n  padding: 0.5em 1.2em;\n'
  + '  border-radius: 6px;\n  background: #2563eb;\n  color: #ffffff;\n'
  + '  text-decoration: none;\n  font-weight: 600;\n  cursor: pointer;\n}';

function insertNewButton() {
  const chapter = currentChapter();
  if (!chapter) {
    showToast('Carga un EPUB primero.', true);
    return;
  }
  const parent = (state.selectedUid && findElementByUid(chapter.doc, state.selectedUid)) || chapter.doc.body;
  if (!parent) return;

  const newBtn = chapter.doc.createElement('a');
  newBtn.setAttribute('href', '#');
  newBtn.setAttribute('class', 'epub-btn');
  newBtn.textContent = 'Nuevo botón';
  parent.appendChild(newBtn);
  assignUids(chapter.doc);

  if (!chapter.customCss.includes('.epub-btn')) {
    chapter.customCss += (chapter.customCss.trim() ? '\n\n' : '') + DEFAULT_BUTTON_CSS;
    setEditorValue(cssEditorCM, el.cssEditorArea, chapter.customCss);
  }

  renderChapterDoc(chapter).then(() => {
    renderDomTree();
    pushHistory(chapter);
    updateUndoRedoUI();
    setDirty(true);
    showToast('Botón insertado. Selecciónalo en el panel DOM para editar su texto y destino.');
  });
}

function describeElement(node) {
  let desc = '<' + node.tagName.toLowerCase() + '>';
  if (node.id) desc += ' #' + node.id;
  if (node.className && typeof node.className === 'string' && node.className.trim()) {
    desc += ' .' + node.className.trim().split(/\s+/).join('.');
  }
  return desc;
}

function loadComputedPropsIntoPanel(uid) {
  const frameDoc = el.chapterFrame.contentDocument;
  const liveEl = frameDoc && findElementByUid(frameDoc, uid);
  if (!liveEl || !frameDoc.defaultView) return;
  const computed = frameDoc.defaultView.getComputedStyle(liveEl);
  // El color se muestra solo a modo informativo (valor computado actual) y queda
  // deshabilitado con "Ninguno" marcado, para no forzar un color al aplicar CSS
  // hasta que el usuario decida explícitamente cambiarlo.
  el.propColor.value = rgbToHex(computed.color) || '#000000';
  el.propColorNone.checked = true;
  el.propColor.disabled = true;
  el.propBackground.value = rgbToHex(computed.backgroundColor) || '#ffffff';
  el.propBackgroundNone.checked = true;
  el.propBackground.disabled = true;
  el.propFontSize.value = parseInt(computed.fontSize, 10) || '';
  el.propMargin.value = parseInt(computed.marginTop, 10) || '';
  el.propPadding.value = parseInt(computed.paddingTop, 10) || '';
  el.propFontFamily.value = '';
}

function wireNoneToggle(checkbox, input) {
  checkbox.addEventListener('change', () => {
    input.disabled = checkbox.checked;
  });
}

function rgbToHex(rgb) {
  const match = rgb.match(/\d+/g);
  if (!match) return '';
  const [r, g, b] = match;
  return '#' + [r, g, b].map((v) => Number(v).toString(16).padStart(2, '0')).join('');
}

/* ------------------------------------------------------------------ */
/* Editor de código HTML                                               */
/* ------------------------------------------------------------------ */

function setEditorValue(cmInstance, textarea, value) {
  if (cmInstance) cmInstance.setValue(value || '');
  else textarea.value = value || '';
}

function getEditorValue(cmInstance, textarea) {
  return cmInstance ? cmInstance.getValue() : textarea.value;
}

async function applyHtmlChanges() {
  const chapter = currentChapter();
  if (!chapter || !state.selectedUid) return;
  const newHtml = getEditorValue(htmlEditorCM, el.htmlEditorArea);

  try {
    const wrapperDoc = new DOMParser().parseFromString(
      '<root xmlns="http://www.w3.org/1999/xhtml">' + newHtml + '</root>',
      'application/xml',
    );
    if (wrapperDoc.querySelector('parsererror')) throw new Error('HTML/XML inválido.');

    const newNode = wrapperDoc.documentElement.firstElementChild;
    const oldNode = findElementByUid(chapter.doc, state.selectedUid);
    if (!oldNode || !newNode) throw new Error('No se pudo ubicar el elemento a reemplazar.');

    const imported = chapter.doc.importNode(newNode, true);
    if (!imported.hasAttribute('data-euid')) {
      imported.setAttribute('data-euid', oldNode.getAttribute('data-euid'));
    }
    assignUids(chapter.doc);
    oldNode.replaceWith(imported);

    await renderChapterDoc(chapter);
    renderDomTree();
    pushHistory(chapter);
    updateUndoRedoUI();
    setDirty(true);
    showToast('HTML aplicado.');
  } catch (err) {
    console.error(err);
    showToast('Error al aplicar el HTML: ' + err.message, true);
  }
}

function resetHtmlEditor() {
  const chapter = currentChapter();
  if (!chapter || !state.selectedUid) return;
  loadElementIntoEditors(state.selectedUid, chapter);
}

/* ------------------------------------------------------------------ */
/* Editor de código CSS                                                */
/* ------------------------------------------------------------------ */

let cssPreviewTimer = null;
function schedulePreviewCss() {
  clearTimeout(cssPreviewTimer);
  cssPreviewTimer = setTimeout(previewCssInFrame, 250);
}

function previewCssInFrame() {
  const frameDoc = el.chapterFrame.contentDocument;
  if (!frameDoc) return;
  let styleTag = frameDoc.getElementById('epub-editor-custom-css');
  if (!styleTag) {
    styleTag = frameDoc.createElement('style');
    styleTag.id = 'epub-editor-custom-css';
    frameDoc.head.appendChild(styleTag);
  }
  styleTag.textContent = getEditorValue(cssEditorCM, el.cssEditorArea);
}

function applyCssChanges() {
  const chapter = currentChapter();
  if (!chapter) return;
  chapter.customCss = getEditorValue(cssEditorCM, el.cssEditorArea);
  previewCssInFrame();
  pushHistory(chapter);
  updateUndoRedoUI();
  setDirty(true);
  showToast('CSS aplicado.');
}

function buildCssRuleFromProps() {
  const selector = el.cssTargetSelector.value.trim() || '*';
  const declarations = [];
  if (!el.propColorNone.checked) declarations.push('color: ' + el.propColor.value + ';');
  if (!el.propBackgroundNone.checked) declarations.push('background-color: ' + el.propBackground.value + ';');
  if (el.propFontFamily.value) declarations.push('font-family: ' + el.propFontFamily.value + ';');
  if (el.propFontSize.value) declarations.push('font-size: ' + el.propFontSize.value + 'px;');
  if (el.propMargin.value) declarations.push('margin: ' + el.propMargin.value + 'px;');
  if (el.propPadding.value) declarations.push('padding: ' + el.propPadding.value + 'px;');

  if (!declarations.length) return;

  const existing = getEditorValue(cssEditorCM, el.cssEditorArea);
  const rule = selector + ' {\n  ' + declarations.join('\n  ') + '\n}\n';
  setEditorValue(cssEditorCM, el.cssEditorArea, existing + (existing.trim() ? '\n' : '') + rule);
  schedulePreviewCss();
}

/* ------------------------------------------------------------------ */
/* Catálogo de animaciones CSS                                          */
/* Propiedades inspiradas en https://animejs.com/v3/documentation/#cssProperties */
/* ------------------------------------------------------------------ */

const ANIMATION_PRESETS = [
  {
    id: 'fadeIn', name: 'Aparecer (Fade In)',
    description: 'Aparece gradualmente desde transparente hasta opaco.',
    keyframes: '  0% { opacity: 0; }\n  100% { opacity: 1; }',
    defaultDuration: 0.8, defaultEasing: 'ease-out', defaultIterations: '1',
  },
  {
    id: 'fadeOut', name: 'Desaparecer (Fade Out)',
    description: 'Desaparece gradualmente desde opaco hasta transparente.',
    keyframes: '  0% { opacity: 1; }\n  100% { opacity: 0; }',
    defaultDuration: 0.8, defaultEasing: 'ease-in', defaultIterations: '1',
  },
  {
    id: 'slideInLeft', name: 'Entrada desde la izquierda',
    description: 'Entra deslizándose desde la izquierda.',
    keyframes: '  0% { transform: translateX(-60px); opacity: 0; }\n  100% { transform: translateX(0); opacity: 1; }',
    defaultDuration: 0.7, defaultEasing: 'ease-out', defaultIterations: '1',
  },
  {
    id: 'slideInRight', name: 'Entrada desde la derecha',
    description: 'Entra deslizándose desde la derecha.',
    keyframes: '  0% { transform: translateX(60px); opacity: 0; }\n  100% { transform: translateX(0); opacity: 1; }',
    defaultDuration: 0.7, defaultEasing: 'ease-out', defaultIterations: '1',
  },
  {
    id: 'slideInUp', name: 'Entrada desde abajo',
    description: 'Entra deslizándose desde abajo hacia arriba.',
    keyframes: '  0% { transform: translateY(40px); opacity: 0; }\n  100% { transform: translateY(0); opacity: 1; }',
    defaultDuration: 0.7, defaultEasing: 'ease-out', defaultIterations: '1',
  },
  {
    id: 'slideInDown', name: 'Entrada desde arriba',
    description: 'Entra deslizándose desde arriba hacia abajo.',
    keyframes: '  0% { transform: translateY(-40px); opacity: 0; }\n  100% { transform: translateY(0); opacity: 1; }',
    defaultDuration: 0.7, defaultEasing: 'ease-out', defaultIterations: '1',
  },
  {
    id: 'zoomIn', name: 'Acercamiento (Zoom In)',
    description: 'Aparece agrandándose desde el centro.',
    keyframes: '  0% { transform: scale(0.4); opacity: 0; }\n  100% { transform: scale(1); opacity: 1; }',
    defaultDuration: 0.6, defaultEasing: 'cubic-bezier(0.68, -0.55, 0.27, 1.55)', defaultIterations: '1',
  },
  {
    id: 'zoomOut', name: 'Alejamiento (Zoom Out)',
    description: 'Desaparece encogiéndose hacia el centro.',
    keyframes: '  0% { transform: scale(1); opacity: 1; }\n  100% { transform: scale(0.4); opacity: 0; }',
    defaultDuration: 0.6, defaultEasing: 'ease-in', defaultIterations: '1',
  },
  {
    id: 'rotateIn', name: 'Rotación de entrada',
    description: 'Entra girando sobre sí mismo.',
    keyframes: '  0% { transform: rotate(-200deg); opacity: 0; }\n  100% { transform: rotate(0deg); opacity: 1; }',
    defaultDuration: 0.8, defaultEasing: 'ease-out', defaultIterations: '1',
  },
  {
    id: 'bounce', name: 'Rebote (Bounce)',
    description: 'Rebota verticalmente, como una pelota.',
    keyframes: '  0%, 20%, 50%, 80%, 100% { transform: translateY(0); }\n'
      + '  40% { transform: translateY(-20px); }\n  60% { transform: translateY(-10px); }',
    defaultDuration: 1, defaultEasing: 'ease', defaultIterations: 'infinite',
  },
  {
    id: 'pulse', name: 'Pulso (Pulse)',
    description: 'Late suavemente cambiando de tamaño.',
    keyframes: '  0%, 100% { transform: scale(1); }\n  50% { transform: scale(1.08); }',
    defaultDuration: 1.2, defaultEasing: 'ease-in-out', defaultIterations: 'infinite',
  },
  {
    id: 'shake', name: 'Sacudida (Shake)',
    description: 'Se sacude horizontalmente (efecto de alerta).',
    keyframes: '  0%, 100% { transform: translateX(0); }\n  20% { transform: translateX(-8px); }\n'
      + '  40% { transform: translateX(8px); }\n  60% { transform: translateX(-6px); }\n  80% { transform: translateX(6px); }',
    defaultDuration: 0.6, defaultEasing: 'ease-in-out', defaultIterations: '1',
  },
  {
    id: 'swing', name: 'Balanceo (Swing)',
    description: 'Se balancea como un péndulo colgado desde arriba.',
    keyframes: '  20% { transform: rotate(12deg); }\n  40% { transform: rotate(-8deg); }\n'
      + '  60% { transform: rotate(4deg); }\n  80% { transform: rotate(-2deg); }\n  100% { transform: rotate(0deg); }',
    defaultDuration: 1, defaultEasing: 'ease-in-out', defaultIterations: '3',
    extraCss: 'transform-origin: top center;',
  },
  {
    id: 'flipX', name: 'Voltear (Flip)',
    description: 'Se voltea sobre su eje horizontal (efecto tarjeta).',
    keyframes: '  0% { transform: rotateY(0deg); }\n  50% { transform: rotateY(90deg); }\n  100% { transform: rotateY(0deg); }',
    defaultDuration: 0.9, defaultEasing: 'ease-in-out', defaultIterations: '1',
  },
  {
    id: 'blurIn', name: 'Desenfoque de entrada (Blur In)',
    description: 'Aparece desde un desenfoque hasta verse nítido.',
    keyframes: '  0% { filter: blur(8px); opacity: 0; }\n  100% { filter: blur(0); opacity: 1; }',
    defaultDuration: 1, defaultEasing: 'ease-out', defaultIterations: '1',
  },
  {
    id: 'grayscaleIn', name: 'Escala de grises',
    description: 'Pasa de color a escala de grises.',
    keyframes: '  0% { filter: grayscale(0); }\n  100% { filter: grayscale(1); }',
    defaultDuration: 1, defaultEasing: 'linear', defaultIterations: '1',
  },
];

function populateAnimPresetSelect() {
  el.animPresetSelect.innerHTML = ANIMATION_PRESETS.map((p) =>
    '<option value="' + p.id + '">' + p.name + '</option>').join('');
}

function getSelectedPreset() {
  const id = el.animPresetSelect.value;
  return ANIMATION_PRESETS.find((p) => p.id === id) || ANIMATION_PRESETS[0];
}

function onAnimPresetChange() {
  const preset = getSelectedPreset();
  el.animDuration.value = preset.defaultDuration;
  el.animEasing.value = preset.defaultEasing;
  el.animIterations.value = preset.defaultIterations;
  updateAnimCssPreviewText();
}

function buildAnimationCssBlock(animName, preset, selector, duration, easing, delay, iterations) {
  const extra = preset.extraCss ? '\n  ' + preset.extraCss : '';
  return '@keyframes ' + animName + ' {\n' + preset.keyframes + '\n}\n\n'
    + selector + ' {\n'
    + '  animation-name: ' + animName + ';\n'
    + '  animation-duration: ' + duration + 's;\n'
    + '  animation-timing-function: ' + easing + ';\n'
    + '  animation-delay: ' + delay + 's;\n'
    + '  animation-iteration-count: ' + iterations + ';\n'
    + '  animation-fill-mode: both;' + extra + '\n'
    + '}';
}

function updateAnimCssPreviewText() {
  const preset = getSelectedPreset();
  el.animPresetDescription.textContent = preset.description;
  const duration = el.animDuration.value || preset.defaultDuration;
  const easing = el.animEasing.value || preset.defaultEasing;
  const delay = el.animDelay.value || '0';
  const iterations = el.animIterations.value || preset.defaultIterations;
  const selector = el.cssTargetSelector.value.trim() || '.mi-elemento';
  el.animCssPreview.textContent = buildAnimationCssBlock(
    'anim-' + preset.id, preset, selector, duration, easing, delay, iterations,
  );
}

function previewAnimationOnSelected() {
  if (!state.selectedUid) {
    showToast('Selecciona un objeto primero.', true);
    return;
  }
  const frameDoc = el.chapterFrame.contentDocument;
  const target = frameDoc && findElementByUid(frameDoc, state.selectedUid);
  if (!target) return;

  const selector = el.cssTargetSelector.value.trim();
  if (!selector) {
    showToast('Indica un selector CSS destino.', true);
    return;
  }

  const preset = getSelectedPreset();
  const duration = el.animDuration.value || preset.defaultDuration;
  const easing = el.animEasing.value || preset.defaultEasing;
  const delay = el.animDelay.value || '0';
  const iterations = el.animIterations.value || preset.defaultIterations;
  const previewClass = 'epub-editor-anim-preview';
  // Combina el selector real del objeto con la clase de vista previa: así esta
  // regla temporal siempre tiene más especificidad que cualquier animación o CSS
  // ya aplicado y persistido (que usa un simple "#id"), y la vista previa nunca
  // queda tapada silenciosamente por una regla anterior sobre el mismo objeto.
  const previewSelector = selector + '.' + previewClass;

  let styleTag = frameDoc.getElementById('epub-editor-anim-preview-css');
  if (!styleTag) {
    styleTag = frameDoc.createElement('style');
    styleTag.id = 'epub-editor-anim-preview-css';
    frameDoc.head.appendChild(styleTag);
  }
  styleTag.textContent = buildAnimationCssBlock(
    'epub-editor-anim-preview-kf', preset, previewSelector, duration, easing, delay, iterations,
  );

  target.classList.remove(previewClass);
  void target.offsetWidth; // fuerza reflow para poder reiniciar la animación
  target.classList.add(previewClass);
  target.scrollIntoView({ block: 'center', behavior: 'smooth' });
  showToast('Reproduciendo vista previa en el visor...');
}

function applyAnimationToSelected() {
  const chapter = currentChapter();
  if (!chapter || !state.selectedUid) {
    showToast('Selecciona un objeto primero.', true);
    return;
  }
  const selector = el.cssTargetSelector.value.trim();
  if (!selector) {
    showToast('Indica un selector CSS destino.', true);
    return;
  }

  const preset = getSelectedPreset();
  const duration = el.animDuration.value || preset.defaultDuration;
  const easing = el.animEasing.value || preset.defaultEasing;
  const delay = el.animDelay.value || '0';
  const iterations = el.animIterations.value || preset.defaultIterations;
  const animName = 'anim-' + preset.id + '-' + Date.now().toString(36);

  const cssBlock = buildAnimationCssBlock(animName, preset, selector, duration, easing, delay, iterations);
  const existingCss = getEditorValue(cssEditorCM, el.cssEditorArea);
  const newCss = existingCss + (existingCss.trim() ? '\n\n' : '') + cssBlock;
  setEditorValue(cssEditorCM, el.cssEditorArea, newCss);
  chapter.customCss = newCss;
  previewCssInFrame();
  pushHistory(chapter);
  updateUndoRedoUI();
  setDirty(true);
  showToast('Animación aplicada al objeto seleccionado.');
}

/* ------------------------------------------------------------------ */
/* Editor de texto (masivo)                                            */
/* ------------------------------------------------------------------ */

function applyBulkTextChanges() {
  const chapter = currentChapter();
  if (!chapter || !state.selectedUid) return;
  const target = findElementByUid(chapter.doc, state.selectedUid);
  if (!target) return;
  target.textContent = el.textBulkEditor.value;

  renderChapterDoc(chapter).then(() => {
    renderDomTree();
    pushHistory(chapter);
    updateUndoRedoUI();
    setDirty(true);
    showToast('Texto aplicado.');
  });
}

/* ------------------------------------------------------------------ */
/* Exportación                                                         */
/* ------------------------------------------------------------------ */

async function exportEpub() {
  if (!state.hasBook) return;
  showSpinner(true);
  try {
    const newZip = state.zip.clone ? state.zip.clone() : await cloneZip();

    for (const [href, chapter] of state.chapterState.entries()) {
      const exportedHtml = serializeForExport(chapter.doc, chapter.customCss);
      newZip.file(href, exportedHtml);
    }

    const blob = await newZip.generateAsync({ type: 'blob', mimeType: 'application/epub+zip' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'libro-editado.epub';
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 5000);

    setDirty(false);
    showToast('EPUB exportado correctamente.');
  } catch (err) {
    console.error(err);
    showToast('Error al exportar: ' + err.message, true);
  } finally {
    showSpinner(false);
  }
}

async function cloneZip() {
  const buffer = await state.zip.generateAsync({ type: 'arraybuffer' });
  return JSZip.loadAsync(buffer);
}

/* ------------------------------------------------------------------ */
/* Pestañas                                                             */
/* ------------------------------------------------------------------ */

let activeTabName = 'dom';

function activateTab(tabName) {
  activeTabName = tabName;
  el.tabs.forEach((btn) => btn.classList.toggle('active', btn.dataset.tab === tabName));
  el.panels.forEach((panel) =>
    panel.classList.toggle('active', panel.id === 'panel-' + tabName));
  if (tabName === 'html' && htmlEditorCM) setTimeout(() => htmlEditorCM.refresh(), 0);
  if (tabName === 'css' && cssEditorCM) setTimeout(() => cssEditorCM.refresh(), 0);
  if (!el.helpPanel.classList.contains('hidden')) showHelpForActiveTab();
}

/* ------------------------------------------------------------------ */
/* Sistema de ayuda por pestaña                                        */
/* ------------------------------------------------------------------ */

const HELP_TEXTS = {
  dom: 'Este panel muestra el árbol de elementos HTML reales del capítulo actual '
    + '(las etiquetas <p>, <div>, <img>, etc. que forman el archivo .xhtml de ese '
    + 'capítulo dentro del .epub). El icono junto a cada elemento indica su tipo: '
    + 'imagen, vector (SVG), texto o contenedor. Hacer clic en un elemento solo lo '
    + 'selecciona para editarlo en las demás pestañas — por sí solo no modifica el archivo.',
  html: 'Edita directamente el código HTML del elemento seleccionado. Al pulsar '
    + '"Aplicar cambios" se reemplaza ese fragmento dentro del archivo .xhtml del '
    + 'capítulo — el mismo formato que usa cualquier lector EPUB para mostrar el '
    + 'contenido — así que un error de sintaxis aquí puede impedir que el capítulo '
    + 'se abra bien en otros lectores. "Reiniciar" descarta lo escrito sin tocar el archivo.',
  css: 'Escribe reglas CSS libres o usa el panel de propiedades comunes. Al aplicar, '
    + 'esas reglas se guardan como una hoja de estilos dentro del propio archivo '
    + '.xhtml del capítulo, igual que el CSS que ya trae el EPUB — por eso conviven '
    + 'con los estilos originales del libro y pueden sobrescribirlos si tienen más '
    + 'especificidad (por ejemplo, un selector "#id" le gana a uno de clase ".clase").',
  text: 'Cambia el texto visible del objeto seleccionado, ya sea haciendo clic '
    + 'directamente en el visor con "Modo edición de texto" activo, o escribiendo en '
    + 'el campo de abajo. Esto modifica el contenido de texto dentro del archivo '
    + '.xhtml del capítulo; el marcado HTML alrededor del texto no cambia.',
  toc: 'Muestra la tabla de contenidos que ya declara el propio EPUB (nav.xhtml en '
    + 'EPUB3 o toc.ncx en EPUB2). Sirve para navegar rápido entre capítulos; no se '
    + 'edita desde aquí ni modifica ningún archivo del libro.',
  anim: 'Aplica animaciones CSS (@keyframes) al objeto seleccionado. "Aplicar '
    + 'animación" guarda el código generado en la misma hoja de estilos del capítulo '
    + '(igual que la pestaña CSS), así que la animación queda dentro del .xhtml '
    + 'exportado y se reproduce en cualquier lector EPUB compatible con animaciones CSS.',
};

function showHelpForActiveTab() {
  el.helpPanelText.textContent = HELP_TEXTS[activeTabName] || '';
  el.helpPanel.classList.remove('hidden');
}

function toggleHelpPanel() {
  if (el.helpPanel.classList.contains('hidden')) showHelpForActiveTab();
  else el.helpPanel.classList.add('hidden');
}

/* ------------------------------------------------------------------ */
/* Tema                                                                 */
/* ------------------------------------------------------------------ */

function toggleTheme() {
  state.theme = state.theme === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', state.theme);
  el.themeToggleBtn.textContent = state.theme === 'dark' ? '☀' : '☽';
  const cmTheme = state.theme === 'dark' ? 'dracula' : 'default';
  if (htmlEditorCM) htmlEditorCM.setOption('theme', cmTheme);
  if (cssEditorCM) cssEditorCM.setOption('theme', cmTheme);
}

/* ------------------------------------------------------------------ */
/* Carga de archivos: input + drag and drop                            */
/* ------------------------------------------------------------------ */

function initFileLoading() {
  el.fileInput.addEventListener('change', () => {
    const file = el.fileInput.files[0];
    if (file) loadEpubFile(file);
    el.fileInput.value = '';
  });

  ['dragenter', 'dragover'].forEach((evtName) => {
    document.body.addEventListener(evtName, (e) => {
      e.preventDefault();
      el.dropHint.classList.add('drag-active');
    });
  });

  ['dragleave', 'drop'].forEach((evtName) => {
    document.body.addEventListener(evtName, (e) => {
      e.preventDefault();
      el.dropHint.classList.remove('drag-active');
    });
  });

  document.body.addEventListener('drop', (e) => {
    const file = e.dataTransfer.files && e.dataTransfer.files[0];
    if (file && /\.epub$/i.test(file.name)) loadEpubFile(file);
    else if (file) showToast('Solo se admiten archivos .epub', true);
  });
}

/* ------------------------------------------------------------------ */
/* Inicialización de CodeMirror                                        */
/* ------------------------------------------------------------------ */

function initEditors() {
  const cmTheme = state.theme === 'dark' ? 'dracula' : 'default';

  htmlEditorCM = CodeMirror.fromTextArea(el.htmlEditorArea, {
    mode: 'htmlmixed',
    theme: cmTheme,
    lineNumbers: true,
    lineWrapping: true,
    tabSize: 2,
  });

  cssEditorCM = CodeMirror.fromTextArea(el.cssEditorArea, {
    mode: 'css',
    theme: cmTheme,
    lineNumbers: true,
    lineWrapping: true,
    tabSize: 2,
    extraKeys: { 'Ctrl-Space': 'autocomplete' },
  });

  cssEditorCM.on('change', () => {
    schedulePreviewCss();
  });

  cssEditorCM.on('inputRead', (cm, change) => {
    if (change.text[0] && /[a-zA-Z-]/.test(change.text[0])) {
      cm.showHint({ completeSingle: false });
    }
  });
}

/* ------------------------------------------------------------------ */
/* Wiring de eventos                                                   */
/* ------------------------------------------------------------------ */

function initEvents() {
  el.prevChapterBtn.addEventListener('click', () => loadChapter(state.chapterIndex - 1));
  el.nextChapterBtn.addEventListener('click', () => loadChapter(state.chapterIndex + 1));

  el.undoBtn.addEventListener('click', undo);
  el.redoBtn.addEventListener('click', redo);
  document.addEventListener('keydown', (e) => {
    if (!(e.ctrlKey || e.metaKey)) return;
    if (e.key.toLowerCase() === 'z' && !e.shiftKey) { e.preventDefault(); undo(); }
    else if (e.key.toLowerCase() === 'y' || (e.key.toLowerCase() === 'z' && e.shiftKey)) {
      e.preventDefault();
      redo();
    }
  });

  el.exportBtn.addEventListener('click', exportEpub);
  el.readerPreviewBtn.addEventListener('click', openReaderPreview);
  el.themeToggleBtn.addEventListener('click', toggleTheme);

  el.textEditModeToggle.addEventListener('change', () => {
    state.textEditMode = el.textEditModeToggle.checked;
    applyTextEditModeToFrame();
  });

  el.domSearch.addEventListener('input', applyDomSearchFilter);

  el.applyHtmlBtn.addEventListener('click', applyHtmlChanges);
  el.resetHtmlBtn.addEventListener('click', resetHtmlEditor);

  el.applyCssBtn.addEventListener('click', applyCssChanges);
  [el.propColor, el.propBackground, el.propFontFamily, el.propFontSize, el.propMargin, el.propPadding]
    .forEach((input) => input.addEventListener('change', buildCssRuleFromProps));
  wireNoneToggle(el.propColorNone, el.propColor);
  wireNoneToggle(el.propBackgroundNone, el.propBackground);

  el.applyTextBtn.addEventListener('click', applyBulkTextChanges);

  el.animPresetSelect.addEventListener('change', onAnimPresetChange);
  [el.animDuration, el.animDelay, el.animEasing, el.animIterations].forEach((input) =>
    input.addEventListener('input', updateAnimCssPreviewText));
  el.previewAnimBtn.addEventListener('click', previewAnimationOnSelected);
  el.applyAnimBtn.addEventListener('click', applyAnimationToSelected);

  el.applyButtonEditBtn.addEventListener('click', applyButtonEdit);
  el.insertButtonBtn.addEventListener('click', insertNewButton);

  el.helpToggleBtn.addEventListener('click', toggleHelpPanel);
  el.helpCloseBtn.addEventListener('click', () => el.helpPanel.classList.add('hidden'));

  el.tabs.forEach((btn) => {
    btn.addEventListener('click', () => activateTab(btn.dataset.tab));
  });

  window.addEventListener('beforeunload', (e) => {
    if (state.exportDirty) {
      e.preventDefault();
      e.returnValue = '';
    }
  });

  let resizeTimer = null;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      if (state.hasBook) applyViewerFormat(currentChapter());
    }, 150);
  });
}

/* ------------------------------------------------------------------ */
/* Arranque                                                             */
/* ------------------------------------------------------------------ */

function init() {
  initEditors();
  initEvents();
  initFileLoading();
  populateAnimPresetSelect();
  updateAnimCssPreviewText();
}

document.addEventListener('DOMContentLoaded', init);
