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
const popupToast = document.getElementById('popupToast');

let book = null;
let rendition = null;
let toastTimeoutId = null;

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

// ---- Video/hyperlink popup windows -----------------------------------
//
// Any <video> or absolute (external, href contains "://") <a> inside the
// EPUB content opens enlarged in a real browser popup window
// (window.open), instead of navigating away in place or replacing the
// reader. Relative links (chapters within the book) are left alone so
// normal reading navigation keeps working.

const YOUTUBE_RE = /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([\w-]{6,})/i;
const VIMEO_RE = /vimeo\.com\/(\d+)/i;
const VIDEO_FILE_RE = /\.(mp4|webm|ogv|ogg|mov)(\?.*)?$/i;

const openPopups = [];

const getVideoEmbedUrl = (href) => {
  const yt = href.match(YOUTUBE_RE);
  if (yt) return `https://www.youtube-nocookie.com/embed/${yt[1]}?autoplay=1`;

  const vm = href.match(VIMEO_RE);
  if (vm) return `https://player.vimeo.com/video/${vm[1]}?autoplay=1`;

  return null;
};

const showToast = (message) => {
  popupToast.textContent = message;
  popupToast.classList.remove('hidden');
  clearTimeout(toastTimeoutId);
  toastTimeoutId = setTimeout(() => popupToast.classList.add('hidden'), 4000);
};

// Centers a sensibly large popup window on the user's screen so a video or
// linked page reads as "enlarged", not a cramped little box.
const popupFeatures = () => {
  const width = Math.min(1100, Math.round(window.screen.availWidth * 0.85));
  const height = Math.min(760, Math.round(window.screen.availHeight * 0.85));
  const left = Math.round((window.screen.availWidth - width) / 2);
  const top = Math.round((window.screen.availHeight - height) / 2);
  // Not "noopener" here: that feature makes window.open() return null,
  // which we need for tracking/closing popups and for writing the video
  // player markup into the video/embed ones.
  return `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes`;
};

const trackPopup = (popup) => {
  if (!popup) {
    showToast('El navegador bloqueó la ventana emergente. Permite ventanas emergentes para este sitio y vuelve a intentarlo.');
    return null;
  }
  openPopups.push(popup);
  return popup;
};

const writePopupDocument = (popup, title, bodyHtml) => {
  popup.document.open();
  popup.document.write(`<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <title>${title}</title>
  <style>
    html, body { margin: 0; height: 100%; background: #000; }
    body { display: flex; align-items: center; justify-content: center; }
    video, iframe { width: 100%; height: 100%; border: 0; background: #000; }
  </style>
</head>
<body>${bodyHtml}</body>
</html>`);
  popup.document.close();
};

const openVideoFilePopup = (src) => {
  const popup = trackPopup(window.open('', '_blank', popupFeatures()));
  if (!popup) return;
  writePopupDocument(popup, 'Video', `<video src="${src}" controls autoplay></video>`);
};

const openVideoEmbedPopup = (embedUrl) => {
  const popup = trackPopup(window.open('', '_blank', popupFeatures()));
  if (!popup) return;
  writePopupDocument(
    popup,
    'Video',
    `<iframe src="${embedUrl}" allow="autoplay; fullscreen; picture-in-picture; encrypted-media" allowfullscreen></iframe>`,
  );
};

// Generic external links navigate the popup window directly to the href
// (rather than embedding it in an iframe) so the linked site renders with
// its own layout/scripts intact instead of hitting X-Frame-Options blocks.
const openLinkPopup = (href) => {
  const popup = trackPopup(window.open(href, '_blank', popupFeatures()));
  // Manual opener isolation (instead of the "noopener" window feature,
  // which would make window.open() return null and break tracking above):
  // the external page shouldn't be able to reach back into this reader.
  if (popup) popup.opener = null;
};

const handleExternalLink = (href) => {
  if (VIDEO_FILE_RE.test(href)) {
    openVideoFilePopup(href);
    return;
  }

  const embedUrl = getVideoEmbedUrl(href);
  if (embedUrl) {
    openVideoEmbedPopup(embedUrl);
    return;
  }

  openLinkPopup(href);
};

const closeAllPopups = () => {
  while (openPopups.length) {
    const popup = openPopups.pop();
    if (popup && !popup.closed) popup.close();
  }
};

// Intercepts clicks inside a rendered EPUB page. Attached per-page (in the
// 'rendered' hook) because epub.js swaps in a fresh iframe/document for
// every section. Uses the capture phase so it always runs before epub.js's
// own bubble-phase link handling and any script bundled in the EPUB page.
const attachContentLinkHandling = (_section, view) => {
  try {
    const win = (view && view.window) || (view && view.iframe && view.iframe.contentWindow);
    const doc = win && win.document;
    if (!doc || doc.__popupWindowBound) return;
    doc.__popupWindowBound = true;

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
          openVideoFilePopup(source);
        }
      }
    }, true);
  } catch (err) {
    console.warn('No se pudo activar la ventana emergente de enlaces/videos en esta página', err);
  }
};

const openBook = async (file) => {
  if (!file) return;

  closeAllPopups();
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
