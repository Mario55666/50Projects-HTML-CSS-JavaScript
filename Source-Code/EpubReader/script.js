const fileInput = document.getElementById('fileInput');
const stage = document.getElementById('stage');
const dropHint = document.getElementById('dropHint');
const spinner = document.getElementById('loadingSpinner');
const viewerEl = document.getElementById('viewer');
const layoutBadge = document.getElementById('layoutBadge');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const fullscreenBtn = document.getElementById('fullscreenBtn');
const statusText = document.getElementById('statusText');
const progressFill = document.getElementById('progressFill');

let book = null;
let rendition = null;

const setLoading = (isLoading) => {
  spinner.classList.toggle('hidden', !isLoading);
  dropHint.classList.toggle('hidden', isLoading || book !== null);
};

const setStatus = (text) => {
  statusText.textContent = text;
};

// Re-kick page-load style animations/scripts every time epub.js swaps in a
// new page, since it reuses/replaces iframe documents instead of doing a
// full browser navigation (so DOMContentLoaded/load never fire naturally).
const rekickPageAnimations = (_section, view) => {
  try {
    const win = (view && view.window) || (view && view.iframe && view.iframe.contentWindow);
    const doc = win && win.document;
    if (doc && doc.readyState === 'complete') {
      doc.dispatchEvent(new Event('DOMContentLoaded', { bubbles: true, cancelable: true }));
      win.dispatchEvent(new Event('load'));
    }
  } catch (err) {
    console.warn('No se pudieron re-disparar los eventos de animación de la página', err);
  }
};

const updateProgress = (location) => {
  if (book.locations && book.locations.length() > 0) {
    const pct = book.locations.percentageFromCfi(location.start.cfi);
    progressFill.style.width = `${Math.round(pct * 100)}%`;
  }
  prevBtn.disabled = location.atStart;
  nextBtn.disabled = location.atEnd;
};

const openBook = async (file) => {
  if (!file) return;

  setLoading(true);
  viewerEl.innerHTML = '';
  // The viewer must stay laid out (not display:none) while epub.js renders
  // into it, otherwise it measures a 0x0 container and every page comes out
  // collapsed. The spinner overlays on top instead.
  viewerEl.classList.remove('hidden');
  dropHint.classList.add('hidden');
  layoutBadge.classList.add('hidden');
  setStatus(`Cargando "${file.name}"...`);

  if (book) {
    book.destroy();
    book = null;
  }

  const arrayBuffer = await file.arrayBuffer();
  book = ePub(arrayBuffer);

  try {
    await book.ready;

    // EPUB3 fixed-layout ("diseño fijo") books declare
    // <meta property="rendition:layout">pre-paginated</meta> in the OPF.
    // epub.js exposes it on book.packaging.metadata.layout once book.ready resolves.
    const layout = (book.packaging && book.packaging.metadata && book.packaging.metadata.layout) || '';
    const isFixedLayout = layout === 'pre-paginated';
    layoutBadge.classList.toggle('hidden', !isFixedLayout);

    rendition = book.renderTo(viewerEl, {
      width: '100%',
      height: '100%',
      flow: 'paginated',
      manager: 'default',
      // Allows embedded <script> tags and CSS animations inside the EPUB
      // pages (fixed-layout comics/animated books) to run.
      allowScriptedContent: true,
      spread: isFixedLayout ? 'none' : 'auto',
    });

    rendition.on('rendered', rekickPageAnimations);
    rendition.on('relocated', updateProgress);

    await rendition.display();

    prevBtn.disabled = false;
    nextBtn.disabled = false;
    fullscreenBtn.disabled = false;
    setStatus(`${isFixedLayout ? 'Diseño fijo · ' : 'Reflow · '}${file.name}`);

    book.locations.generate(600).then(() => {
      const cfi = rendition.location && rendition.location.start && rendition.location.start.cfi;
      if (cfi) {
        progressFill.style.width = `${Math.round(book.locations.percentageFromCfi(cfi) * 100)}%`;
      }
    });
  } catch (err) {
    console.error('No se pudo abrir el EPUB', err);
    setStatus('Error al abrir el archivo. ¿Es un .epub válido?');
    viewerEl.classList.add('hidden');
    dropHint.classList.remove('hidden');
    book = null;
  } finally {
    setLoading(false);
  }
};

fileInput.addEventListener('change', (e) => {
  const file = e.target.files && e.target.files[0];
  openBook(file);
});

stage.addEventListener('dragover', (e) => {
  e.preventDefault();
});

stage.addEventListener('drop', (e) => {
  e.preventDefault();
  const file = e.dataTransfer.files && e.dataTransfer.files[0];
  if (file) openBook(file);
});

prevBtn.addEventListener('click', () => {
  if (rendition) rendition.prev();
});

nextBtn.addEventListener('click', () => {
  if (rendition) rendition.next();
});

window.addEventListener('keydown', (e) => {
  if (!rendition) return;
  if (e.key === 'ArrowLeft') rendition.prev();
  if (e.key === 'ArrowRight') rendition.next();
});

fullscreenBtn.addEventListener('click', () => {
  if (!document.fullscreenElement) {
    stage.requestFullscreen();
  } else {
    document.exitFullscreen();
  }
});

// Keep the rendition sized correctly as the viewer box changes.
window.addEventListener('resize', () => {
  if (!rendition) return;
  requestAnimationFrame(() => {
    const rect = viewerEl.getBoundingClientRect();
    rendition.resize(rect.width, rect.height);
  });
});
