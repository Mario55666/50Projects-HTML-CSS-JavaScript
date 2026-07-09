/* ==========================================================================
   ESTILO — Enciclopedia interactiva de estilos visuales
   Interactividad: tipografía variable ligada al scroll, revelado de
   secciones, barra de progreso, menú accesible y toggle min/max.
   ========================================================================== */

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- 1. Tipografía variable ligada al scroll ----------
   El titular del hero y el de Tendencias animan su eje `wght`
   (250 → 900) según la posición de scroll. */

const heroTitle = document.getElementById('heroTitle');
const variableDemo = document.querySelector('.variable-demo');

function lerp(a, b, t) {
  return a + (b - a) * Math.min(Math.max(t, 0), 1);
}

function updateVariableType() {
  if (prefersReducedMotion) return;

  // Hero: engorda a medida que desaparece de pantalla
  const heroProgress = Math.min(window.scrollY / (window.innerHeight * 0.9), 1);
  const heroWeight = lerp(300, 900, heroProgress);
  heroTitle.style.fontVariationSettings = `"wght" ${heroWeight.toFixed(0)}, "opsz" 144`;

  // Demo de tendencias: engorda al entrar en el viewport
  if (variableDemo) {
    const rect = variableDemo.getBoundingClientRect();
    const t = 1 - rect.top / window.innerHeight; // 0 al asomar, 1 arriba
    const w = lerp(250, 900, t);
    const opsz = lerp(60, 144, t); // el eje óptico afina los remates al crecer
    variableDemo.style.fontVariationSettings = `"wght" ${w.toFixed(0)}, "opsz" ${opsz.toFixed(0)}`;
  }
}

/* ---------- 2. Barra de progreso de lectura ---------- */

const progressBar = document.getElementById('progressBar');

function updateProgress() {
  const total = document.documentElement.scrollHeight - window.innerHeight;
  progressBar.style.width = `${(window.scrollY / total) * 100}%`;
}

let ticking = false;
window.addEventListener('scroll', () => {
  if (ticking) return;
  ticking = true;
  requestAnimationFrame(() => {
    updateVariableType();
    updateProgress();
    ticking = false;
  });
}, { passive: true });

updateVariableType();
updateProgress();

/* ---------- 3. Revelado de secciones (motion graphics de entrada) ---------- */

const revealTargets = document.querySelectorAll('.estilo-head, .ficha, .v-card, .t-card');
revealTargets.forEach((el, i) => {
  el.classList.add('reveal');
  el.style.transitionDelay = `${(i % 4) * 90}ms`;
});

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('in-view');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.18 });

revealTargets.forEach((el) => revealObserver.observe(el));

/* ---------- 4. Navegación: estado activo + desplegables accesibles ---------- */

const navLinks = document.querySelectorAll('.nav-drop a');
const sections = [...navLinks].map((a) => document.querySelector(a.getAttribute('href'))).filter(Boolean);

const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    navLinks.forEach((a) => {
      a.classList.toggle('active', a.getAttribute('href') === `#${entry.target.id}`);
    });
  });
}, { rootMargin: '-40% 0px -50% 0px' });

sections.forEach((s) => sectionObserver.observe(s));

// Desplegables operables con teclado y táctil (además del :hover CSS)
document.querySelectorAll('.nav-group').forEach((group) => {
  const btn = group.querySelector('.nav-group-btn');
  btn.addEventListener('click', () => {
    const isOpen = group.classList.toggle('open');
    btn.setAttribute('aria-expanded', String(isOpen));
    document.querySelectorAll('.nav-group.open').forEach((other) => {
      if (other !== group) {
        other.classList.remove('open');
        other.querySelector('.nav-group-btn').setAttribute('aria-expanded', 'false');
      }
    });
  });
});

// Cierra el menú al elegir un estilo o al pulsar Escape
document.addEventListener('click', (e) => {
  if (!e.target.closest('.nav-group')) {
    document.querySelectorAll('.nav-group.open').forEach((g) => {
      g.classList.remove('open');
      g.querySelector('.nav-group-btn').setAttribute('aria-expanded', 'false');
    });
  }
});

navLinks.forEach((a) => a.addEventListener('click', () => {
  a.closest('.nav-group')?.classList.remove('open');
}));

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    document.querySelectorAll('.nav-group.open').forEach((g) => {
      g.classList.remove('open');
      g.querySelector('.nav-group-btn').setAttribute('aria-expanded', 'false');
    });
  }
});

/* ---------- 5. Minimalismo vs. Maximalismo: sección conmutable ---------- */

const minmaxSection = document.getElementById('minmax');
const btnMin = document.getElementById('btnMin');
const btnMax = document.getElementById('btnMax');

function setMode(mode) {
  minmaxSection.dataset.mode = mode;
  btnMin.classList.toggle('is-active', mode === 'min');
  btnMax.classList.toggle('is-active', mode === 'max');
  btnMin.setAttribute('aria-pressed', String(mode === 'min'));
  btnMax.setAttribute('aria-pressed', String(mode === 'max'));

  // Intercambia los textos descriptivos según el modo
  minmaxSection.querySelectorAll('.txt-swap').forEach((p) => {
    p.textContent = p.dataset[mode];
  });
  minmaxSection.querySelectorAll('[data-min][data-max]').forEach((el) => {
    if (el.tagName === 'H3') el.textContent = el.dataset[mode];
  });
}

btnMin.addEventListener('click', () => setMode('min'));
btnMax.addEventListener('click', () => setMode('max'));
