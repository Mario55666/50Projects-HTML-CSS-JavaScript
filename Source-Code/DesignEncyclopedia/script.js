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

/* ---------- 6. Formulario de necesidades → prompt utilitario ----------
   Cada estilo recibe un formulario que recoge contexto temporal, espacio/
   medio, grupo objetivo y demás atributos, y genera un prompt listo para
   usar como brief de diseño o como prompt para IA generativa de imágenes. */

const STYLE_FORMS = [
  {
    id: 'renacimiento',
    nombre: 'Renacimiento y Barroco',
    epoca: 's. XV – XVII',
    variantes: [{
      label: 'Renacimiento / Barroco',
      visual: 'composición centrada y simétrica sobre proporción áurea, márgenes generosos de incunable, texturas de pergamino y fresco, capitulares y filigranas doradas, claroscuro barroco en los detalles',
      paleta: 'pergamino #F3EAD8, sepia #2E1F14, oro #A67C1E, marfil #FFFCF3',
      tipografia: 'garaldas humanistas (Cormorant Garamond / EB Garamond) con versalitas y ligaduras; gótica textur solo como acento histórico'
    }]
  },
  {
    id: 'impresionismo',
    nombre: 'Impresionismo y Romanticismo',
    epoca: 's. XIX',
    variantes: [{
      label: 'Impresionismo / Romanticismo',
      visual: 'luz atmosférica, pinceladas difusas de colores puros que el ojo mezcla a distancia, degradados de bruma sin aristas, acentos complementarios vibrantes según Chevreul, emoción sublime',
      paleta: 'lavanda #CFD8F5, malva #E8D9EF, melocotón #FBE3D2, naranja complementario #B05A2E',
      tipografia: 'serifas orgánicas de remates suaves: Playfair Display Italic en titulares, Lora en texto'
    }]
  },
  {
    id: 'vanguardias',
    nombre: 'Vanguardias del s. XX',
    epoca: '1907 – 1970',
    variantes: [
      {
        label: 'Cubismo',
        visual: 'deconstrucción geométrica: planos fracturados y solapados, puntos de vista simultáneos, collage y rotaciones',
        paleta: 'ocres #D9CBAA y #8C7A5B, grises, negro',
        tipografia: 'grotescas pesadas inclinadas (Archivo Black), recortes tipográficos tipo collage'
      },
      {
        label: 'Expresionismo',
        visual: 'distorsión emocional: trazos violentos y angulosos, contrastes crudos, composición inestable, expresión antes que forma',
        paleta: 'rojo #E33D2E, amarillo #F5C518, negro #14121A',
        tipografia: 'palo seco de peso máximo en mayúsculas, con carácter xilográfico'
      },
      {
        label: 'Surrealismo',
        visual: 'estética onírica: yuxtaposiciones imposibles, horizontes infinitos, objetos flotantes fuera de escala, atmósfera de sueño',
        paleta: 'cielo #7FB4D9, celeste #CFE4EE, arena #E8D9B8',
        tipografia: 'serifa clásica en itálica (Playfair Display) que contrasta con lo imposible de la escena'
      },
      {
        label: 'Pop Art',
        visual: 'cultura de masas: tramas de semitono, repetición serial, contornos de cómic, colores planos saturados',
        paleta: 'amarillo #F5C518, magenta #E3306D, negro #16131F',
        tipografia: 'rotulación de cómic (Bangers) con contorno; onomatopeyas como titulares'
      }
    ]
  },
  {
    id: 'bauhaus',
    nombre: 'Bauhaus y Estilo Tipográfico Internacional',
    epoca: '1919 – 1970',
    variantes: [{
      label: 'Bauhaus / Estilo Suizo',
      visual: 'retícula matemática visible, composición asimétrica equilibrada, fondo blanco, formas geométricas básicas, colores primarios como señal, fotografía objetiva, cero ornamento — la forma sigue a la función',
      paleta: 'blanco #FFFFFF, negro #14121A, rojo #D02E26, azul #1C50A0, amarillo #F5C518',
      tipografia: 'sans-serif estricta (Helvetica / Inter), alineación a la izquierda con bandera derecha irregular, jerarquía solo por tamaño y peso'
    }]
  },
  {
    id: 'artdeco',
    nombre: 'Art Déco',
    epoca: '1920 – 1939',
    variantes: [{
      label: 'Art Déco',
      visual: 'simetría rigurosa en eje central, línea recta y zig-zag, motivos sunburst y escalonados, materiales lujosos (oro, mármol, laca) en contraste elegante',
      paleta: 'negro #101014, oro #C9A747, champán #E8D59A, marfil #EFE3B8',
      tipografia: 'geométrica elegante y estilizada de astas altas (Poiret One, Limelight), versales con espaciado generoso'
    }]
  },
  {
    id: 'minmax',
    nombre: 'Minimalismo / Maximalismo',
    epoca: '1960 – hoy',
    variantes: [
      {
        label: 'Minimalismo',
        visual: 'reducción a lo esencial: espacio en blanco como material de diseño, un solo acento de color, claridad visual y funcional',
        paleta: 'blanco roto #FCFCFA, tinta #1C1B22, un único acento a elección',
        tipografia: 'una sola familia sans (Inter) en máximo dos pesos; jerarquía por espacio, no por ornamento'
      },
      {
        label: 'Maximalismo (Memphis)',
        visual: 'acumulación ecléctica: mezcla de formas, patrones (lunares, zig-zags, squiggles), texturas y rotaciones; horror vacui celebratorio heredero del Grupo Memphis',
        paleta: 'rosa #FF5CA8, amarillo #FFF338, turquesa #00B8A9, cian #7DE8FF, naranja #FF9F1C',
        tipografia: 'Rubik Black desproporcionada con sombras de color múltiples — siempre legible'
      }
    ]
  },
  {
    id: 'brutalismo',
    nombre: 'Brutalismo',
    epoca: '2014 – hoy',
    variantes: [{
      label: 'Brutalismo',
      visual: 'crudo y sin pulir: retícula rota a propósito, elementos solapados, bordes duros, sombras sólidas sin difuminar, estética de HTML sin CSS, provocación deliberada sin sacrificar contraste',
      paleta: 'amarillo señal #F5F200, negro #000000, blanco #FFFFFF, rojo-naranja #FF4911, azul enlace #0000FF',
      tipografia: 'Archivo Black a tamaño desproporcionado en titulares; Space Mono utilitaria para el cuerpo; subrayados por defecto'
    }]
  },
  {
    id: 'cybercore',
    nombre: 'Cybercore · Y2K · Retrowave',
    epoca: '1982 / 2000 / 2015 – hoy',
    variantes: [
      {
        label: 'Retrowave',
        visual: 'horizonte de rejilla en perspectiva, sol degradado, atardecer sintético ochentero, glow de neón sobre negro-violeta',
        paleta: 'negro-violeta #0B0416 → #33104D, magenta neón #FF5CC8, cian neón #7CF0FF',
        tipografia: 'Orbitron retrofuturista con glow; monoespaciada Share Tech Mono para datos'
      },
      {
        label: 'Y2K',
        visual: 'optimismo del milenio: cromados líquidos, blobs metálicos, lens flares, degradados plateado-azulados, estética de CD-ROM y salvapantallas',
        paleta: 'plata cromada, azul hielo #9FB6FF, blanco #FDFDFF, lila #E6B6FF',
        tipografia: 'logotipos cromados líquidos (Orbitron con gradiente metálico); pixel arcade Press Start 2P como acento'
      },
      {
        label: 'Cybercore',
        visual: 'tecnología cruda: glitch, scanlines, HUD y terminales, densidad de datos, saturación neón sobre negro',
        paleta: 'negro #0B0416, verde terminal, cian #7CF0FF, magenta #FF5CC8',
        tipografia: 'monoespaciada tecnológica (Share Tech Mono); coordenadas y datos como textura gráfica'
      }
    ]
  },
  {
    id: 'frutiger',
    nombre: 'Frutiger Aero',
    epoca: '2004 – 2013',
    variantes: [{
      label: 'Frutiger Aero',
      visual: 'esqueumorfismo luminoso y optimismo tecnológico: cielos azules, agua cristalina, césped, peces y burbujas; paneles glossy con brillo especular y lens flares',
      paleta: 'azul cielo #7EC9F5, celeste #B8E6FB, blanco #FFFFFF, verde césped #8FD44A, azul profundo #0D4F8B',
      tipografia: 'humanista clara y redondeada evocando a Frutiger (Nunito Sans), pesos medios, alta legibilidad'
    }]
  },
  {
    id: 'glass',
    nombre: 'Glassmorphism',
    epoca: '2020 – hoy',
    variantes: [{
      label: 'Glassmorphism',
      visual: 'paneles de vidrio esmerilado flotantes: capas translúcidas con desenfoque de fondo (backdrop blur), bordes de luz de 1px, jerarquía por profundidad sobre fondos de color saturado',
      paleta: 'fondo noche #0F1024, violeta #7C5CFF, rosa #FF5C8A, teal #2DD4BF, blanco al 10–28% en paneles',
      tipografia: 'palo seco delgada (Inter 200–300) en blanco puro, subiendo de peso donde el fondo se agita'
    }]
  }  ,
  {
    id: 'antiguedad',
    nombre: 'Antigüedad y Edad Media',
    epoca: '3000 a. C. – s. XV',
    variantes: [
      {
        label: 'Egipcio',
        visual: 'frisos en registros horizontales, figuras de perfil con jerarquía por tamaño, símbolos y escritura sagrada como textura decorativa',
        paleta: 'arena #E4C989, ocre rojizo #A64B2A, lapislázuli #1F4E79, oro #C9A747, basalto #1E1B14',
        tipografia: 'lapidaria de rasgo grabado, capitales espaciadas (Cinzel); glifos y símbolos como ornamento'
      },
      {
        label: 'Grecorromano',
        visual: 'proporción y armonía clásicas: columnas, frontones, greca (meandro) como marco, mármol y relieve',
        paleta: 'mármol #F5F1E8, terracota #B4552F, negro ánfora #26211C',
        tipografia: 'capitales romanas talladas (Cinzel / Trajan), numeración romana, inscripción monumental'
      },
      {
        label: 'Bizantino',
        visual: 'mosaico de teselas con fondo de oro, frontalidad hierática, halos y brillo sagrado',
        paleta: 'oro #C9A747, púrpura imperial #3B1F4E, esmeralda #1F6E5A, marfil #F0E3B2',
        tipografia: 'uncial solemne, iniciales doradas, texto centrado como icono'
      },
      {
        label: 'Islámico',
        visual: 'geometría infinita: lacería de estrellas, arabescos vegetales, ausencia de figuración; la escritura como ornamento central',
        paleta: 'turquesa #0F5E5A, cobalto #1F4E79, oro #C9A747, marfil #F2E8CE',
        tipografia: 'la caligrafía es protagonista; para alfabeto latino, serifa humanista con orlas geométricas'
      },
      {
        label: 'Románico',
        visual: 'muro de piedra y arco de medio punto: composición maciza, simétrica y didáctica',
        paleta: 'piedra #B3A48D, tierra #6E5A3E, rojo almagre #8E3B2F',
        tipografia: 'carolingia robusta, capitales anchas de trazo firme'
      },
      {
        label: 'Gótico',
        visual: 'verticalidad y luz coloreada: arcos apuntados, tracería, vitrales de tonos joya sobre piedra oscura',
        paleta: 'azul vitral #1F3A93, rubí #8E1F3B, oro #C9A747, piedra oscura #171226',
        tipografia: 'gótica textur (UnifrakturMaguntia) con capitulares miniadas'
      }
    ]
  },
  {
    id: 'neoclasico',
    nombre: 'Neoclasicismo',
    epoca: '1760 – 1830',
    variantes: [{
      label: 'Neoclasicismo',
      visual: 'orden y racionalidad frente a la frivolidad rococó: simetría axial, filetes finos, blancos de mármol, grises de grabado, ornamento mínimo',
      paleta: 'mármol #F7F4EE, gris grabado #26303B, azul Wedgwood #5C7A9E',
      tipografia: 'didonas de contraste extremo (Bodoni Moda / Didot), versales espaciadas de inscripción'
    }]
  },
  {
    id: 'realismo',
    nombre: 'Realismo',
    epoca: '1840 – 1880',
    variantes: [{
      label: 'Realismo',
      visual: 'representación objetiva y exacta de lo cotidiano: fotografía documental sin retoque, luz neutra de galería, pies de foto tipo ficha de museo, retícula honesta sin efectos',
      paleta: 'tierras #7A5C3D, gris neutro #4A4740, blanco roto #E9E4DB',
      tipografia: 'serifa de lectura sobria (Lora) y monoespaciada para fichas técnicas; jerarquía discreta, sin idealizar'
    }]
  },
  {
    id: 'futurismo',
    nombre: 'Futurismo',
    epoca: '1909 – 1944',
    variantes: [{
      label: 'Futurismo',
      visual: 'dinamismo y velocidad: diagonales ascendentes, líneas de velocidad, secuencias de movimiento tipo cronofotografía, culto a la máquina, metal y humo',
      paleta: 'acero #2C2F3A, rojo #E63946, humo #8D99AE, blanco faro #EDEFF5',
      tipografia: 'palabras en libertad: grotescas pesadas en cursiva forzada (Archivo Black inclinada, Oswald), tamaños que aceleran'
    }]
  },
  {
    id: 'dadaismo',
    nombre: 'Dadaísmo',
    epoca: '1916 – 1924',
    variantes: [{
      label: 'Dadaísmo',
      visual: 'anti-composición: collage de recortes de periódico, rotaciones al azar, sellos, tachaduras y papel envejecido; el absurdo y el azar como método',
      paleta: 'papel prensa #E8E2D0, negro tinta #1E1A16, rojo #C1272D',
      tipografia: 'nota de rescate: cada letra de una familia distinta, cuerpos dispares, líneas de base bailando'
    }]
  },
  {
    id: 'constructivismo',
    nombre: 'Constructivismo y De Stijl',
    epoca: '1917 – 1931',
    variantes: [
      {
        label: 'Constructivismo',
        visual: 'agitación gráfica: diagonales y cuñas (cuña roja de Lissitzky), fotomontaje, flechas, bloques tipográficos a 90° y 45°',
        paleta: 'rojo #D40920, negro #16131F, crema #F1EBDD',
        tipografia: 'palo seco condensada en mayúsculas (Oswald), compuesta en bloques y ángulos; la letra como ladrillo'
      },
      {
        label: 'Neoplasticismo (De Stijl)',
        visual: 'retícula de líneas negras perpendiculares con campos de color primario puro; equilibrio asimétrico absoluto (Mondrian, Rietveld)',
        paleta: 'blanco #FFFFFF, negro #16131F, rojo #D40920, amarillo #F7D842, azul #1356A2',
        tipografia: 'geométrica de palo seco, composición estrictamente ortogonal'
      }
    ]
  },
  {
    id: 'abstracto',
    nombre: 'Expresionismo Abstracto',
    epoca: '1943 – 1965',
    variantes: [{
      label: 'Expresionismo Abstracto',
      visual: 'gesto a escala heroica: goteos y salpicaduras (dripping) sobre lienzo crudo, manchas superpuestas, o grandes campos de color de bordes difusos (color field)',
      paleta: 'lienzo #EFE9DC, negro gestual #16131F, rojo cadmio #C0392B, ocre #E9B44C',
      tipografia: 'caligráfica gestual (Caveat) como trazo de pincel, sobre sans neutra que no compite con la mancha'
    }]
  },
  {
    id: 'opart',
    nombre: 'Arte Cinético y Op Art',
    epoca: '1955 – 1970',
    variantes: [
      {
        label: 'Op Art',
        visual: 'ilusión óptica estática: dameros deformados, ondas y círculos concéntricos en blanco y negro, moiré, pares complementarios que vibran en los bordes',
        paleta: 'negro #111111, blanco #F7F7F7, un par vibrante puntual',
        tipografia: 'geométrica de alto contraste; la letra integrada al patrón óptico'
      },
      {
        label: 'Arte Cinético',
        visual: 'movimiento real o aparente: patrones que se animan con el scroll y el cursor, rotaciones lentas, parallax — siempre desactivable con prefers-reduced-motion',
        paleta: 'blanco y negro + un color vibrante en movimiento',
        tipografia: 'geométrica limpia que no compita con el movimiento'
      }
    ]
  },
  {
    id: 'conceptual',
    nombre: 'Conceptual · Land Art · Povera',
    epoca: '1965 – hoy',
    variantes: [
      {
        label: 'Arte Conceptual',
        visual: 'la idea sobre el objeto: declaraciones mecanografiadas, certificados e instrucciones, vacío deliberado; la documentación es la obra',
        paleta: 'blanco papel #FAF7EF, negro tinta, gris archivo',
        tipografia: 'máquina de escribir (Space Mono), sin jerarquía decorativa'
      },
      {
        label: 'Land Art',
        visual: 'paisaje intervenido: tierra, espirales y líneas a escala territorial, fotografía aérea como registro de la obra',
        paleta: 'tierra #8A6F4D, piedra #B3A48D, verde musgo #5C6B47, cielo neutro',
        tipografia: 'humanista discreta sobre fotografía; coordenadas y datos en monoespaciada'
      },
      {
        label: 'Arte Povera',
        visual: 'materiales pobres ennoblecidos: arpillera, cartón, kraft, óxido y objetos de desecho; la textura es el mensaje',
        paleta: 'kraft #C9B594, óxido #8E5B3B, gris ceniza #6F6A60',
        tipografia: 'serifa gastada o mono de sello; imperfección deliberada'
      }
    ]
  },
  {
    id: 'hiperrealismo',
    nombre: 'Hiperrealismo',
    epoca: '1965 – hoy',
    variantes: [{
      label: 'Hiperrealismo',
      visual: 'detalle extremo: macrofotografía de altísima resolución, enfoque selectivo, brillos especulares, bordes de un píxel, sombras físicas exactas; interfaz de lupa con zoom',
      paleta: 'grises de estudio #FAFAFB – #26262B, color fiel de la fotografía',
      tipografia: 'neutra afinada (Inter con tracking cerrado), cuerpos pequeños de precisión técnica'
    }]
  },
  {
    id: 'posmoderno',
    nombre: 'Posmodernismo',
    epoca: '1975 – 1990',
    variantes: [{
      label: 'Posmodernismo',
      visual: 'pastiche e ironía: códigos clásicos citados sobre tramas pop, marcos dorados en fondos chillones, comillas gigantes, alta y baja cultura en la misma pieza; la retícula moderna se rompe con intención',
      paleta: 'verdeazulado #3AAFA9, salmón #F28C6B, mostaza #D9A404, púrpura #6B3FA0',
      tipografia: 'choque deliberado: didona elegante + cómic + geométrica déco conviviendo'
    }]
  },
  {
    id: 'artsandcrafts',
    nombre: 'Arts and Crafts',
    epoca: '1860 – 1910',
    variantes: [{
      label: 'Arts and Crafts',
      visual: 'artesanía y naturaleza: patrones vegetales que tapizan (hojas, zarcillos, granadas), márgenes ornamentados de libro Kelmscott, papel crudo, tintas densas, capitulares ornadas',
      paleta: 'crema #F2E8D5, oliva #5B6E3F, terracota #A85A38, índigo #33415C',
      tipografia: 'serifa veneciana caligráfica (estilo Golden Type: Cormorant) con capitulares; texto denso de incunable artesanal'
    }]
  },
  {
    id: 'megabrutalismo',
    nombre: 'Megabrutalismo',
    epoca: '2022 – hoy',
    variantes: [{
      label: 'Megabrutalismo',
      visual: 'impacto inmediato: un titular a 15–25vw llena la pantalla, blanco y negro absolutos más un color eléctrico, marquesinas y cursores enormes; la tipografía es la interfaz',
      paleta: 'negro #000000, blanco #FFFFFF, lima eléctrico #C6FF00',
      tipografia: 'grotesca ultra pesada (Archivo Black) a escala de vía pública, tracking negativo, interlineado 0.8; contraste 21:1'
    }]
  },
  {
    id: 'scrapbook',
    nombre: 'Scrapbook',
    epoca: '2023 – hoy',
    variantes: [{
      label: 'Scrapbook',
      visual: 'álbum de recortes: polaroids y papeles rotados, cinta washi translúcida, cuadrícula de cuaderno, kraft, garabatos a bolígrafo, stickers y sellos; espontáneo a propósito',
      paleta: 'papel #FBF7EC, washi pastel, tinta BIC #2A4DA0, rojo margen #C1272D, kraft #C9B594',
      tipografia: 'mezcla despareja: manuscrita (Caveat), serifa de revista y mono de etiqueta; líneas de base imperfectas'
    }]
  },
  {
    id: 'liquidglass',
    nombre: 'Liquid Glass',
    epoca: '2025 – hoy',
    variantes: [{
      label: 'Liquid Glass',
      visual: 'vidrio líquido: desenfoque alto con saturación, borde iridiscente de refracción, destello especular que recorre el panel, curvatura acentuada; el material se adapta al contenido y al cursor',
      paleta: 'fondo noche #0A0B1E, aurora violeta #7C5CFF / teal #2DD4BF / rosa #FF5C8A, blanco vidrio 8–20%',
      tipografia: 'palo seco de peso medio con grosor dinámico según la agitación del fondo; blanco puro sobre la refracción'
    }]
  },
  {
    id: 'phygital',
    nombre: 'Phygital',
    epoca: '2024 – hoy',
    variantes: [{
      label: 'Phygital',
      visual: 'mundo físico intervenido por capas digitales: corchetes de enfoque AR, etiquetas flotantes ancladas a objetos reales, beams de luz, QR como puente, profundidad espacial real (Spatial UI)',
      paleta: 'tonos reales cálidos #241F1B – #EFE6D8 + cian digital #45E3FF y acentos de interfaz',
      tipografia: 'sans neutra para lo físico y monoespaciada de datos para la capa digital; la tipografía señala en qué capa estás'
    }]
  }
];

const OPCIONES = {
  pieza: ['Cartel / afiche', 'Portada editorial', 'Post para redes sociales', 'Banner o pieza web', 'Packaging / etiqueta', 'Identidad visual / logotipo', 'Infografía', 'Ilustración o fotografía de campaña'],
  formato: ['A3 vertical (impreso)', 'A4 vertical (impreso)', 'Cuadrado 1:1', 'Vertical 9:16 (stories / reel)', 'Horizontal 16:9 (pantalla)', 'Panorámico (vía pública)'],
  fidelidad: ['Fiel a la época original', 'Reinterpretación contemporánea', 'Fusión retro-futurista'],
  medios: ['Impreso', 'Vía pública', 'Pantalla móvil', 'Pantalla de escritorio', 'Redes sociales', 'Proyección / ambientación'],
  edad: ['Niños (6–12)', 'Adolescentes (13–17)', 'Jóvenes (18–25)', 'Adultos (26–40)', 'Adultos (41–60)', 'Mayores (60+)', 'Intergeneracional'],
  familiaridad: ['Nula — primer contacto con el estilo', 'Media — reconoce el estilo', 'Alta — público experto / diseñadores'],
  objetivo: ['Informar', 'Vender / promocionar', 'Educar', 'Provocar / generar debate', 'Celebrar / conmemorar', 'Concientizar'],
  wcag: ['Contraste WCAG AA (recomendado)', 'Contraste WCAG AAA', 'Sin requisito estricto']
};

function bfSelect(id, etiqueta, opciones) {
  return `<div class="bf-field">
    <label for="${id}">${etiqueta}</label>
    <select id="${id}">${opciones.map((o) => `<option>${o}</option>`).join('')}</select>
  </div>`;
}

function bfText(id, etiqueta, placeholder) {
  return `<div class="bf-field">
    <label for="${id}">${etiqueta}</label>
    <input type="text" id="${id}" placeholder="${placeholder}" />
  </div>`;
}

function construirFormulario(estilo) {
  const p = estilo.id;
  const details = document.createElement('details');
  details.className = 'brief';
  details.innerHTML = `
    <summary>Formulario de necesidades · generar prompt</summary>
    <div class="brief-panel">
      <p class="bf-intro">Define el contexto (tiempo, espacio, grupo objetivo…) de tu pieza gráfica en estilo
      <strong>${estilo.nombre}</strong> y genera un prompt utilitario para caracterizarla.</p>
      <form novalidate>
        <div class="bf-grid">
          ${estilo.variantes.length > 1 ? bfSelect(`${p}-variante`, 'Variante del estilo', estilo.variantes.map((v) => v.label)) : ''}
          ${bfText(`${p}-proyecto`, 'Proyecto / marca', 'nombre del proyecto, marca o asignatura')}
          ${bfSelect(`${p}-pieza`, 'Tipo de pieza gráfica', OPCIONES.pieza)}
          ${bfSelect(`${p}-formato`, 'Formato / proporción', OPCIONES.formato)}
          ${bfSelect(`${p}-fidelidad`, 'Contexto temporal (tratamiento)', OPCIONES.fidelidad)}
          ${bfText(`${p}-ocasion`, 'Momento / ocasión de uso', 'p. ej. campaña 2026, festival, aniversario, entrega académica')}
          <fieldset class="bf-fieldset">
            <legend>Espacio / medio de difusión</legend>
            ${OPCIONES.medios.map((m, i) => `<label><input type="checkbox" id="${p}-medio-${i}" value="${m}" /> ${m}</label>`).join('')}
          </fieldset>
          ${bfSelect(`${p}-edad`, 'Grupo objetivo · edad', OPCIONES.edad)}
          ${bfText(`${p}-perfil`, 'Grupo objetivo · perfil', 'intereses, ocupación, cultura visual, contexto socioeconómico…')}
          ${bfSelect(`${p}-familiaridad`, 'Familiaridad con el estilo', OPCIONES.familiaridad)}
          ${bfSelect(`${p}-objetivo`, 'Objetivo comunicacional', OPCIONES.objetivo)}
          ${bfText(`${p}-tono`, 'Tono / mood', 'p. ej. elegante, nostálgico, irreverente, optimista')}
          ${bfText(`${p}-mensaje`, 'Mensaje o titular principal', 'idea o texto que debe comunicar la pieza')}
          ${bfText(`${p}-elementos`, 'Elementos obligatorios', 'logo, fotografía, ilustración, QR, datos de contacto…')}
          ${bfSelect(`${p}-wcag`, 'Accesibilidad', OPCIONES.wcag)}
          <fieldset class="bf-fieldset">
            <legend>Uso del prompt</legend>
            <label><input type="radio" name="${p}-uso" value="brief" checked /> Brief para diseñador(a)</label>
            <label><input type="radio" name="${p}-uso" value="ia" /> Prompt para IA de imágenes</label>
          </fieldset>
        </div>
        <div class="bf-actions">
          <button type="submit" class="bf-generate">Generar prompt</button>
          <button type="button" class="bf-copy" disabled>Copiar</button>
          <span class="bf-status" role="status"></span>
        </div>
        <textarea class="bf-output" rows="14" readonly aria-label="Prompt generado"></textarea>
      </form>
    </div>`;
  return details;
}

function valor(id, porDefecto = '(por definir)') {
  const el = document.getElementById(id);
  const v = el && el.value.trim();
  return v || porDefecto;
}

function construirPrompt(estilo) {
  const p = estilo.id;
  const idx = estilo.variantes.length > 1
    ? document.getElementById(`${p}-variante`).selectedIndex
    : 0;
  const dna = estilo.variantes[idx];
  const nombreEstilo = estilo.variantes.length > 1 ? `${dna.label} — ${estilo.nombre}` : estilo.nombre;

  const medios = OPCIONES.medios
    .filter((_, i) => document.getElementById(`${p}-medio-${i}`).checked)
    .join(', ') || '(por definir)';
  const uso = document.querySelector(`input[name="${p}-uso"]:checked`).value;

  const d = {
    proyecto: valor(`${p}-proyecto`),
    pieza: valor(`${p}-pieza`),
    formato: valor(`${p}-formato`),
    fidelidad: valor(`${p}-fidelidad`),
    ocasion: valor(`${p}-ocasion`),
    edad: valor(`${p}-edad`),
    perfil: valor(`${p}-perfil`),
    familiaridad: valor(`${p}-familiaridad`),
    objetivo: valor(`${p}-objetivo`),
    tono: valor(`${p}-tono`),
    mensaje: valor(`${p}-mensaje`),
    elementos: valor(`${p}-elementos`, 'sin elementos obligatorios'),
    wcag: valor(`${p}-wcag`)
  };

  if (uso === 'ia') {
    return `Genera una imagen: ${d.pieza.toLowerCase()} en estilo ${nombreEstilo} (${estilo.epoca}), tratamiento: ${d.fidelidad.toLowerCase()}.
Mensaje/escena: «${d.mensaje}». Elementos que deben aparecer: ${d.elementos}.
Estética del estilo: ${dna.visual}.
Paleta dominante: ${dna.paleta}.
Rotulación/tipografía: ${dna.tipografia}.
Formato ${d.formato.toLowerCase()}, pensada para ${medios.toLowerCase()}.
Dirigida a ${d.edad.toLowerCase()}, perfil: ${d.perfil}. Familiaridad con el estilo: ${d.familiaridad.toLowerCase()}.
Tono ${d.tono.toLowerCase()}, objetivo comunicacional: ${d.objetivo.toLowerCase()}. Ocasión: ${d.ocasion}.
Requisito: alta legibilidad del texto y ${d.wcag.toLowerCase()}.`;
  }

  return `Actúa como director(a) de arte experto(a) en ${nombreEstilo} (${estilo.epoca}).
Ayúdame a caracterizar la siguiente pieza gráfica según este brief de necesidades:

CONTEXTO DE LA PIEZA
• Proyecto / marca: ${d.proyecto}
• Pieza: ${d.pieza}, formato ${d.formato}
• Contexto temporal: ${d.fidelidad}; momento/ocasión de uso: ${d.ocasion}
• Espacio / medio de difusión: ${medios}

GRUPO OBJETIVO
• Edad: ${d.edad}
• Perfil: ${d.perfil}
• Familiaridad con el estilo: ${d.familiaridad}

COMUNICACIÓN
• Objetivo: ${d.objetivo}
• Tono / mood: ${d.tono}
• Mensaje o titular principal: «${d.mensaje}»
• Elementos obligatorios: ${d.elementos}

ADN DEL ESTILO A RESPETAR
• Entorno visual: ${dna.visual}
• Paleta recomendada: ${dna.paleta}
• Tipografía: ${dna.tipografia}

RESTRICCIONES
• ${d.wcag}: el estilo, por disruptivo que sea, no debe comprometer la legibilidad ni la accesibilidad.

ENTREGABLES QUE TE PIDO
1) Concepto y composición (retícula, jerarquía, recorrido visual)
2) Paleta aplicada con proporciones de uso (dominante / secundario / acento)
3) Sistema tipográfico (familias, pesos y escala)
4) Texturas y recursos gráficos propios del estilo
5) Justificación de cada decisión respecto al grupo objetivo, al medio y al contexto temporal.`;
}

STYLE_FORMS.forEach((estilo) => {
  const seccion = document.getElementById(estilo.id);
  if (!seccion) return;
  const details = construirFormulario(estilo);
  seccion.appendChild(details);

  const form = details.querySelector('form');
  const output = details.querySelector('.bf-output');
  const copyBtn = details.querySelector('.bf-copy');
  const status = details.querySelector('.bf-status');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    output.value = construirPrompt(estilo);
    output.classList.add('visible');
    copyBtn.disabled = false;
    status.textContent = '';
    output.style.height = 'auto';
    output.style.height = `${output.scrollHeight + 6}px`;
  });

  copyBtn.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(output.value);
      status.textContent = '✓ Copiado al portapapeles';
    } catch {
      output.select();
      document.execCommand('copy');
      status.textContent = '✓ Copiado';
    }
    setTimeout(() => { status.textContent = ''; }, 2500);
  });
});
