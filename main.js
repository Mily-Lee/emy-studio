const burger = document.querySelector('.nav-burger');
const links = document.querySelector('.nav-links');

// ===== Menu en quart de rond (tout le site) =====
function toggleMenu() {
  const isOpen = burger.classList.toggle('open');
  links.classList.toggle('open');
  burger.setAttribute('aria-expanded', isOpen);
  burger.setAttribute('aria-label', isOpen ? 'Fermer le menu' : 'Ouvrir le menu');
  document.body.style.overflow = isOpen ? 'hidden' : '';
  document.body.classList.toggle('menu-open', isOpen);
}

burger.addEventListener('click', toggleMenu);

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && burger.classList.contains('open')) toggleMenu();
});

// Un clic hors du menu le referme
document.addEventListener('click', (e) => {
  if (burger.classList.contains('open') && !e.target.closest('.nav-links a, .nav-burger')) toggleMenu();
});

// ===== Bouton retour en haut =====
// Créé une seule fois et attaché au body (jamais touché par la navigation AJAX).
const scrollTopBtn = document.createElement('button');
scrollTopBtn.type = 'button';
scrollTopBtn.className = 'scroll-top';
scrollTopBtn.setAttribute('aria-label', 'Retour en haut');
scrollTopBtn.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none">
  <path d="M12 19V5M5 12l7-7 7 7" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;
document.body.appendChild(scrollTopBtn);

window.addEventListener('scroll', () => {
  scrollTopBtn.classList.toggle('visible', window.scrollY > 500);
});

scrollTopBtn.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

// ===== Modale projets (page Réalisations) =====
// Vue d'ensemble : toutes les images du projet côte à côte dans une grille.
// Chaque nom de typo s'affiche dans sa propre police, chargée depuis Google Fonts
// à la première ouverture (seulement les lettres du nom, via &text=).
// Archivo Expanded n'existe pas sous ce nom chez Google : c'est Archivo en largeur 125 %.
const FONT_ALIASES = {
  'Archivo Expanded': { query: 'Archivo:wdth@125', family: 'Archivo', stretch: '125%' },
  // Police manuscrite, trop fine à taille normale : affichée plus grande
  'Arizonia': { query: 'Arizonia', family: 'Arizonia', size: '1.7em' },
};
const loadedFonts = new Set();
function applyFontPreview(el, name) {
  const spec = FONT_ALIASES[name] || { query: name.replace(/ /g, '+'), family: name };
  if (!loadedFonts.has(name)) {
    loadedFonts.add(name);
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = `https://fonts.googleapis.com/css2?family=${spec.query}&text=${encodeURIComponent(name)}&display=swap`;
    document.head.appendChild(link);
  }
  el.style.fontFamily = `'${spec.family}', 'Lato', sans-serif`;
  if (spec.stretch) el.style.fontStretch = spec.stretch;
  if (spec.size) el.style.fontSize = spec.size;
}

function openProjectModal(tile) {
  const modal = document.getElementById('projectModal');
  if (!modal) return;

  const galleryEl = document.getElementById('modalGallery');
  const tagEl = document.getElementById('modalTag');
  const titleEl = document.getElementById('modalTitle');
  const detailEl = document.getElementById('modalDetail');
  const toolsWrap = document.getElementById('modalToolsWrap');
  const toolsEl = document.getElementById('modalTools');
  const colorsWrap = document.getElementById('modalColorsWrap');
  const swatchesEl = document.getElementById('modalSwatches');
  const fontsWrap = document.getElementById('modalFontsWrap');
  const fontsEl = document.getElementById('modalFonts');
  const linkEl = document.getElementById('modalLink');
  const siteLinkEl = document.getElementById('modalSiteLink');
  const actionsEl = document.getElementById('modalActions');
  const soonEl = document.getElementById('modalSoon');

  const imgsRaw = tile.dataset.imgs || '';
  const captionsRaw = tile.dataset.captions || '';
  const images = imgsRaw ? imgsRaw.split(',').map(s => s.trim()).filter(Boolean) : [];
  const captions = captionsRaw ? captionsRaw.split(',').map(s => s.trim()) : [];

  tagEl.textContent = tile.dataset.tag || '';
  titleEl.textContent = tile.dataset.title || '';
  detailEl.textContent = tile.dataset.detail || '';

  galleryEl.innerHTML = '';
  galleryEl.classList.toggle('single', images.length <= 1);
  galleryEl.classList.toggle('crop', tile.dataset.cropGallery === 'true');
  images.forEach((src, i) => {
    // Vidéo : lecture auto en boucle, muette (obligatoire pour l'autoplay mobile).
    // L'affiche (même nom en -poster.jpg) s'affiche le temps du chargement.
    if (/\.mp4$/i.test(src)) {
      const video = document.createElement('video');
      Object.assign(video, { src, muted: true, loop: true, autoplay: true, playsInline: true, preload: 'auto' });
      video.poster = src.replace(/\.mp4$/i, '-poster.jpg');
      video.setAttribute('aria-label', captions[i] || tile.dataset.title || '');
      galleryEl.appendChild(video);
      return;
    }

    const img = document.createElement('img');
    img.src = src;
    img.alt = captions[i] || tile.dataset.title || '';
    img.loading = 'lazy';

    if (/icon|logo/i.test(src)) {
      img.classList.add('is-icon');
      const card = document.createElement('div');
      card.className = 'modal-gallery-card';
      card.style.background = tile.dataset.iconBg || 'var(--sand)';
      card.appendChild(img);
      galleryEl.appendChild(card);
    } else {
      galleryEl.appendChild(img);
    }
  });

  const toolsRaw = tile.dataset.tools || '';
  toolsWrap.style.display = toolsRaw ? 'block' : 'none';
  toolsEl.textContent = toolsRaw;

  const colorsRaw = tile.dataset.colors || '';
  swatchesEl.innerHTML = '';
  if (colorsRaw) {
    colorsRaw.split(',').map(c => c.trim()).filter(Boolean).forEach(hex => {
      const swatch = document.createElement('span');
      swatch.className = 'modal-swatch';
      swatch.innerHTML = `<span class="modal-swatch-dot" style="background:${hex};"></span>${hex}`;
      swatchesEl.appendChild(swatch);
    });
    colorsWrap.style.display = 'block';
  } else {
    colorsWrap.style.display = 'none';
  }

  const fontsRaw = tile.dataset.fonts || '';
  fontsWrap.style.display = fontsRaw ? 'block' : 'none';
  fontsEl.textContent = '';
  fontsRaw.split('·').map(s => s.trim()).filter(Boolean).forEach((name, i) => {
    if (i) fontsEl.append(' · ');
    const span = document.createElement('span');
    span.textContent = name;
    applyFontPreview(span, name);
    fontsEl.appendChild(span);
  });

  // Lien discret sous le titre + grand bouton sous les visuels
  const url = tile.dataset.url;
  if (url) {
    linkEl.href = siteLinkEl.href = url;
    siteLinkEl.textContent = `${new URL(url).hostname.replace(/^www\./, '')} ↗`;
  }
  siteLinkEl.style.display = url ? 'inline-block' : 'none';
  actionsEl.style.display = url ? 'flex' : 'none';
  soonEl.style.display = url ? 'none' : 'inline-block';

  modal.classList.add('open');
  modal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}

function closeProjectModal() {
  const modal = document.getElementById('projectModal');
  if (!modal) return;
  modal.classList.remove('open');
  modal.setAttribute('aria-hidden', 'true');
  modal.querySelectorAll('video').forEach(v => v.pause());
  document.body.style.overflow = '';
}

function initGallery() {
  const modal = document.getElementById('projectModal');
  const tiles = document.querySelectorAll('.project-tile');
  if (!modal || !tiles.length) return;

  tiles.forEach(tile => tile.addEventListener('click', () => openProjectModal(tile)));
  document.getElementById('modalClose').addEventListener('click', closeProjectModal);
  modal.querySelector('.modal-backdrop').addEventListener('click', closeProjectModal);
}

// Enregistré une seule fois au chargement du script : safe contre les navigations répétées
document.addEventListener('keydown', (e) => {
  const modal = document.getElementById('projectModal');
  if (modal && modal.classList.contains('open') && e.key === 'Escape') closeProjectModal();
});

// ===== Copie de l'email au clic (page Contact) =====
document.addEventListener('click', async (e) => {
  const card = e.target.closest('[data-copy]');
  if (!card) return;
  const hint = card.querySelector('.contact-card-hint');
  try {
    await navigator.clipboard.writeText(card.dataset.copy);
  } catch {
    window.location.href = `mailto:${card.dataset.copy}`;
    return;
  }
  card.classList.add('is-copied');
  hint.textContent = 'Adresse copiée !';
  clearTimeout(card._t);
  card._t = setTimeout(() => {
    card.classList.remove('is-copied');
    hint.textContent = hint.dataset.default;
  }, 2200);
});

initGallery();

// ===== One page : liens du menu =====
// Un clic sur un lien du menu referme le menu mobile avant de glisser vers la section.
links.addEventListener('click', (e) => {
  if (e.target.closest('a') && burger.classList.contains('open')) toggleMenu();
});

// Le lien de la section affichée s'allume pendant le défilement
const navAnchors = [...document.querySelectorAll('.nav-links a[href^="#"]')];
const spied = document.querySelectorAll('[data-section]');
if (spied.length) {
  const spy = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const id = entry.target.dataset.section;
      navAnchors.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + id));
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  spied.forEach(el => spy.observe(el));
}

// ===== Transition « bureau de la créatrice », entre chaque section =====
// Chaque .chapter = une section + une scène de papiers. À la fin de la section,
// elle se fige et recule doucement pendant que post-it et croquis glissent un à un
// pour la recouvrir ; puis ils s'écartent depuis le centre pour dévoiler le titre
// de la section suivante. Tout suit le scroll, dans les deux sens.
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const chapters = [...document.querySelectorAll('.chapter')];
if (chapters.length && !reduceMotion.matches) {
  const clamp = (v) => Math.min(Math.max(v, 0), 1);
  const scenes = chapters.map(chapter => {
    const scene = chapter.querySelector('.paper-scene');
    const notes = [...scene.querySelectorAll('.note')].map((el, i) => {
      const x = parseFloat(el.style.getPropertyValue('--x'));
      const y = parseFloat(el.style.getPropertyValue('--y'));
      const r = parseFloat(el.style.getPropertyValue('--r'));
      let dx = x - 50, dy = y - 50;
      const len = Math.hypot(dx, dy);
      if (len < 4) { dx = i % 2 ? 1 : -1; dy = -0.4; }   // pile au centre : part sur le côté
      const n = Math.hypot(dx, dy);
      return { el, r, ux: dx / n, uy: dy / n, d: Math.min(len / 60, 1), spin: (i % 2 ? 1 : -1) * (14 + (i * 7) % 18) };
    });
    return {
      chapter, scene, notes,
      outgoing: chapter.firstElementChild,                       // section qui se termine
      header: scene.querySelector('.paper-sticky').firstElementChild, // titre de la suivante
      veil: scene.querySelector('.paper-veil'),
    };
  });

  const place = (n, dist, rot, scale) => {
    n.el.style.transform =
      `translate(-50%, -50%) translate(${n.ux * dist}px, ${n.uy * dist}px) rotate(${rot}deg) scale(${scale})`;
  };

  const renderScene = (sc, W, H) => {
    const rect = sc.scene.getBoundingClientRect();
    if (rect.bottom < 0 || rect.top > H) return;   // hors écran : rien à calculer
    const far = Math.max(W, H) * 1.1;
    const p = clamp(-rect.top / (sc.scene.offsetHeight - H));
    if (p < 0.5) {
      // Arrivée : les bords d'abord, le centre en dernier
      const q = clamp(p / 0.45);
      sc.notes.forEach(n => {
        const t = clamp((q - (1 - n.d) * 0.45) / 0.55);
        const e = 1 - Math.pow(1 - t, 3);
        place(n, far * (1 - e), n.r - n.spin * 0.6 * (1 - e), 1);
      });
      sc.outgoing.style.transform = q ? `scale(${1 - 0.07 * q})` : '';
      sc.outgoing.style.opacity = 1 - 0.5 * q;
      sc.header.style.opacity = 0;
    } else {
      // Envol : le centre s'ouvre d'abord, les bords suivent
      const u = clamp((p - 0.55) / 0.45);
      sc.notes.forEach(n => {
        const t = clamp((u - 0.1 - n.d * 0.3) / 0.5);
        const e = t * t * (3 - 2 * t) * t;
        place(n, e * far, n.r + n.spin * e, 1 + e * 0.12);
      });
      sc.outgoing.style.opacity = 0;
      sc.header.style.opacity = 1;
    }
    // Voile abricot sous les papiers au moment où tout est couvert : l'échange ne se voit pas
    sc.veil.style.opacity = clamp(1 - Math.abs(p - 0.5) / 0.07);
  };

  let ticking = false;
  const render = () => {
    ticking = false;
    const W = window.innerWidth, H = window.innerHeight;
    scenes.forEach(sc => renderScene(sc, W, H));
  };
  const onScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(render); } };
  // Section plus haute que l'écran : elle défile jusqu'à son bas, puis se fige
  const pin = () => {
    scenes.forEach(sc => { sc.outgoing.style.top = Math.min(0, window.innerHeight - sc.outgoing.offsetHeight) + 'px'; });
    onScroll();
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', pin);
  chapters.forEach(c => c.classList.add('is-live'));
  pin();
  // Les images chargées tard changent la hauteur des sections : on recalcule
  window.addEventListener('load', pin);
}

// ===== Les éléments se posent un à un, avec un petit rebond =====
const pops = document.querySelectorAll('.pop-in');
if (pops.length && 'IntersectionObserver' in window) {
  pops.forEach(el => {
    const siblings = [...el.parentElement.children].filter(c => c.classList.contains('pop-in'));
    el.style.setProperty('--i', siblings.indexOf(el) % 6);
  });
  const popObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-in');
      popObserver.unobserve(entry.target);
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });
  document.body.classList.add('pops-live');
  pops.forEach(el => popObserver.observe(el));
}

// ===== Fond qui change de couleur selon la section + trait de feutre =====
// La section qui passe au milieu de l'écran donne sa couleur au fond (data-bg) ;
// pour les réalisations, le gris arrive pile quand les post-it s'écartent.
// Dans la marge, un trait de feutre se dessine au fil du scroll et relie les sections.
{
  const BG = { grey: '#D5DEDE' };
  const tinted = [...document.querySelectorAll('[data-bg]')];
  const paperScene = document.querySelector('.paper-scene');
  const sceneVeil = paperScene && paperScene.querySelector('.paper-veil');
  const flow = document.querySelector('.flow');
  const felt = flow && flow.querySelector('.felt-line');
  const feltPath = felt && felt.querySelector('path');
  let feltLength = 0;

  const buildFelt = () => {
    if (!felt) return;
    const W = window.innerWidth;
    const margin = (W - Math.min(W, 1152)) / 2;   // espace libre à gauche du contenu (72rem)
    felt.classList.toggle('is-on', margin > 90);
    if (margin <= 90) return;
    const h = flow.offsetHeight, cx = margin * 0.5, amp = margin * 0.28;
    const pts = [];
    for (let y = 40, k = 0; y < h - 40; y += 230, k++) pts.push([cx + Math.sin(k * 1.35) * amp, y]);
    // Courbe lisse passant par les points (Catmull-Rom → Bézier)
    let d = `M${pts[0][0].toFixed(1)},${pts[0][1]}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2;
      const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
      const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
      d += ` C${c1[0].toFixed(1)},${c1[1].toFixed(1)} ${c2[0].toFixed(1)},${c2[1].toFixed(1)} ${p2[0].toFixed(1)},${p2[1]}`;
    }
    feltPath.setAttribute('d', d);
    feltLength = feltPath.getTotalLength();
    feltPath.style.strokeDasharray = feltLength;
  };

  let busy = false;
  const update = () => {
    busy = false;
    const H = window.innerHeight, mid = H / 2;
    let color = '';
    if (paperScene) {
      const r = paperScene.getBoundingClientRect();
      const p = -r.top / (paperScene.offsetHeight - H);
      if (p >= 0.5 && r.bottom > mid) color = BG.grey;
    }
    tinted.forEach(el => {
      const r = el.getBoundingClientRect();
      if (r.top <= mid && r.bottom >= mid) color = BG[el.dataset.bg] || '';
    });
    document.body.style.backgroundColor = color;
    if (sceneVeil) sceneVeil.style.backgroundColor = color;
    if (feltLength) {
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const r = flow.getBoundingClientRect();
      const frac = reduce ? 1 : Math.min(Math.max((H * 0.65 - r.top) / r.height, 0), 1);
      feltPath.style.strokeDashoffset = feltLength * (1 - frac);
    }
  };
  const queue = () => { if (!busy) { busy = true; requestAnimationFrame(update); } };
  const rebuild = () => { buildFelt(); queue(); };
  window.addEventListener('scroll', queue, { passive: true });
  window.addEventListener('resize', rebuild);
  window.addEventListener('load', rebuild);
  rebuild();
}

// ===== Pied de page : année du copyright =====
document.querySelector('.footer-year').textContent = new Date().getFullYear();
