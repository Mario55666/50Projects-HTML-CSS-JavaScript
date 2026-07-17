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
const linkModal = document.getElementById('linkModal');
const modalBox = document.getElementById('modalBox');
const modalTitle = document.getElementById('modalTitle');
const modalBody = document.getElementById('modalBody');
const modalCloseBtn = document.getElementById('modalCloseBtn');

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

// ---- Video/hyperlink popup modal -----------------------------------
//
// Any <video> or absolute (external, href contains "://") <a> inside the
// EPUB content opens here instead of navigating away or opening a new
// browser tab. Relative links (chapters within the book) are left alone
// so normal reading navigation keeps working.

const YOUTUBE_RE = /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([\w-]{6,})/i;
const VIMEO_RE = /vimeo\.com\/(\d+)/i;
const VIDEO_FILE_RE = /\.(mp4|webm|ogv|ogg|mov)(\?.*)?$/i;

const getVideoEmbedUrl = (href) => {
  const yt = href.match(YOUTUBE_RE);
  if (yt) return `https://www.youtube-nocookie.com/embed/${yt[1]}?autoplay=1`;

  const vm = href.match(VIMEO_RE);
  if (vm) return `https://player.vimeo.com/video/${vm[1]}?autoplay=1`;

  return null;
};

const openModal = (title) => {
  modalTitle.textContent = title;
  modalBody.innerHTML = '';
  linkModal.classList.remove('hidden');
};

const closeModal = () => {
  linkModal.classList.add('hidden');
  // Clearing the body stops any playing <video>/<iframe> embed immediately.
  modalBody.innerHTML = '';
};

const openVideoFileModal = (src) => {
  openModal('Video');
  const video = document.createElement('video');
  video.src = src;
  video.controls = true;
  video.autoplay = true;
  video.className = 'modal-video';
  modalBody.appendChild(video);
};

const openVideoEmbedModal = (embedUrl) => {
  openModal('Video');
  const iframe = document.createElement('iframe');
  iframe.src = embedUrl;
  iframe.className = 'modal-video-frame';
  iframe.allow = 'autoplay; fullscreen; picture-in-picture; encrypted-media';
  iframe.allowFullscreen = true;
  modalBody.appendChild(iframe);
};

const openLinkPreviewModal = (href) => {
  openModal(href);

  const iframe = document.createElement('iframe');
  iframe.src = href;
  iframe.className = 'modal-link-frame';
  modalBody.appendChild(iframe);

  const fallback = document.createElement('a');
  fallback.href = href;
  fallback.target = '_blank';
  fallback.rel = 'noopener noreferrer';
  fallback.className = 'modal-fallback-link';
  fallback.textContent = 'Abrir en una pestaña nueva ↗';
  modalBody.appendChild(fallback);
};

const handleExternalLink = (href) => {
  if (VIDEO_FILE_RE.test(href)) {
    openVideoFileModal(href);
    return;
  }

  const embedUrl = getVideoEmbedUrl(href);
  if (embedUrl) {
    openVideoEmbedModal(embedUrl);
    return;
  }

  openLinkPreviewModal(href);
};

// Intercepts clicks inside a rendered EPUB page. Attached per-page (in the
// 'rendered' hook) because epub.js swaps in a fresh iframe/document for
// every section. Uses the capture phase so it always runs before epub.js's
// own bubble-phase link handling and any script bundled in the EPUB page.
const attachContentLinkHandling = (_section, view) => {
  try {
    const win = (view && view.window) || (view && view.iframe && view.iframe.contentWindow);
    const doc = win && win.document;
    if (!doc || doc.__linkModalBound) return;
    doc.__linkModalBound = true;

    doc.addEventListener('click', (e) => {
      const link = e.target.closest && e.target.closest('a[href]');
      if (link) {
        const rawHref = link.getAttribute('href') || '';
        // Matches epub.js's own definition of "external": epub.js leaves
        // these as normal target="_blank" anchors instead of intercepting
        // them for internal chapter navigation.
        if (rawHref.indexOf('://') > -1) {
          e.preventDefault();
          e.stopPropagation();
          handleExternalLink(link.href);
        }
        return;
      }

      const video = e.target.closest && e.target.closest('video');
      if (video) {
        const source = video.currentSrc || video.getAttribute('src')
          || (video.querySelector('source') && video.querySelector('source').src);
        if (source) {
          e.preventDefault();
          e.stopPropagation();
          video.pause();
          openVideoFileModal(source);
        }
      }
    }, true);
  } catch (err) {
    console.warn('No se pudo activar la pantalla emergente de enlaces/videos en esta página', err);
  }
};

modalCloseBtn.addEventListener('click', closeModal);

linkModal.addEventListener('click', (e) => {
  if (!modalBox.contains(e.target)) closeModal();
});

window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && !linkModal.classList.contains('hidden')) closeModal();
});

const openBook = async (file) => {
  if (!file) return;

  closeModal();
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
    rendition.on('rendered', attachContentLinkHandling);
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
