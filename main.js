const burger = document.querySelector('.nav-burger');
const links = document.querySelector('.nav-links');

// ===== Menu (les trois petites barres sur mobile) =====
function toggleMenu() {
  const isOpen = burger.classList.toggle('open');
  links.classList.toggle('open');
  burger.setAttribute('aria-expanded', isOpen);
  burger.setAttribute('aria-label', isOpen ? 'Fermer le menu' : 'Ouvrir le menu');
  document.body.style.overflow = isOpen ? 'hidden' : '';
  document.body.classList.toggle('menu-open', isOpen);
}

burger.addEventListener('click', toggleMenu);

// Le menu prend un fond dès qu'on quitte le haut de la page
// Mobile : le logo apparaît à gauche une fois arrivé aux réalisations
const logoFrom = document.getElementById('realisations');
const markScrolled = () => {
  document.body.classList.toggle('scrolled', window.scrollY > 10);
  if (logoFrom) document.body.classList.toggle('show-logo', logoFrom.getBoundingClientRect().top <= 1);
};
window.addEventListener('scroll', markScrolled, { passive: true });
markScrolled();

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && burger.classList.contains('open')) toggleMenu();
});

// Un clic à côté du menu le referme (pas besoin de viser la croix)
document.addEventListener('click', (e) => {
  if (burger.classList.contains('open') && !e.target.closest('.nav-links a, .nav-burger')) toggleMenu();
});

// ===== Bouton « on remonte ! » =====
// Créé une seule fois et accroché au body, il ne bouge plus.
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

// ===== Fiches projets : la fenêtre qui s'ouvre au clic sur une réalisation =====
// Toutes les images du projet côte à côte dans une grille.
// Chaque nom de typo s'affiche dans sa propre police, hébergée sur le site
// (assets/fonts/preview-*.woff2 : juste les lettres du nom, déclarées dans style.css).
// Nouvelle typo dans un projet ? Ajouter son fichier preview et son @font-face, et le tour est joué.
// Les polices manuscrites sont toutes fines à taille normale, alors on les grossit
// (le multiplicateur est lu par le CSS via --font-scale)
const FONT_SCALES = { 'Arizonia': 1.5 };
function applyFontPreview(el, name) {
  el.style.fontFamily = `'${name}', 'Lato', sans-serif`;
  if (FONT_SCALES[name]) el.style.setProperty('--font-scale', FONT_SCALES[name]);
}

function openProjectModal(tile) {
  const modal = document.getElementById('projectModal');
  if (!modal) return;

  const galleryEl = document.getElementById('modalGallery');
  const tagEl = document.getElementById('modalTag');
  const titleEl = document.getElementById('modalTitle');
  const detailEl = document.getElementById('modalDetail');
  const toolsWrap = document.getElementById('modalToolsWrap');
  const roleWrap = document.getElementById('modalRoleWrap');
  const roleEl = document.getElementById('modalRole');
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
  images.forEach((src, i) => {
    // Vidéo : lecture auto en boucle et sans le son (sinon les téléphones refusent de la lancer).
    // L'affiche (même nom en -poster.jpg) fait patienter pendant le chargement.
    if (/\.mp4$/i.test(src)) {
      const video = document.createElement('video');
      Object.assign(video, { src, muted: true, loop: true, autoplay: true, playsInline: true, preload: 'auto' });
      video.poster = src.replace(/\.mp4$/i, '-poster.jpg');
      // Fond transparent : un masque (-mask.png) découpe les appareils et leur ombre. Du travail d'orfèvre.
      const mask = `url("${src.replace(/\.mp4$/i, '-mask.png')}")`;
      video.style.webkitMaskImage = mask;
      video.style.maskImage = mask;
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

  const myRole = (tile.dataset.role || '').split(';').map(s => s.trim()).filter(Boolean);
  roleWrap.style.display = myRole.length ? 'block' : 'none';
  roleEl.innerHTML = '';
  myRole.forEach(text => {
    const li = document.createElement('li');
    li.textContent = text;
    roleEl.appendChild(li);
  });

  const toolsRaw = tile.dataset.tools || '';
  toolsWrap.style.display = toolsRaw ? 'block' : 'none';
  toolsEl.innerHTML = '';
  toolsRaw.split('·').map(s => s.trim()).filter(Boolean).forEach(name => {
    const li = document.createElement('li');
    li.textContent = name;
    toolsEl.appendChild(li);
  });

  const colorsRaw = tile.dataset.colors || '';
  swatchesEl.innerHTML = '';
  if (colorsRaw) {
    colorsRaw.split(',').map(c => c.trim()).filter(Boolean).forEach(hex => {
      // Une carte remplie de la couleur, avec son code écrit en clair ou en foncé selon le fond
      const swatch = document.createElement('span');
      swatch.className = 'modal-swatch';
      swatch.style.background = hex;
      const [r, g, b] = [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16));
      swatch.style.color = (r * 299 + g * 587 + b * 114) / 1000 > 150 ? '#183D40' : '#FFF7EC';
      swatch.textContent = hex;
      swatchesEl.appendChild(swatch);
    });
    colorsWrap.style.display = 'block';
  } else {
    colorsWrap.style.display = 'none';
  }

  const fontsRaw = tile.dataset.fonts || '';
  fontsWrap.style.display = fontsRaw ? 'block' : 'none';
  fontsEl.textContent = '';
  // Une ligne par typo : « Aa » en grand, puis le nom et son rôle (la 1re pour les titres, la 2e pour le texte)
  const fonts = fontsRaw.split('·').map(s => s.trim()).filter(Boolean);
  const roles = fonts.length === 2 ? ['Titres', 'Texte'] : [];
  fonts.forEach((name, i) => {
    const row = document.createElement('div');
    row.className = 'modal-font';
    const sample = document.createElement('span');
    sample.className = 'modal-font-sample';
    sample.textContent = 'Aa';
    sample.setAttribute('aria-hidden', 'true');
    const info = document.createElement('span');
    info.className = 'modal-font-info';
    const fontName = document.createElement('span');
    fontName.className = 'modal-font-name';
    fontName.textContent = name;
    info.appendChild(fontName);
    if (roles[i]) {
      const role = document.createElement('span');
      role.className = 'modal-font-role';
      role.textContent = roles[i];
      info.appendChild(role);
    }
    applyFontPreview(sample, name);
    applyFontPreview(fontName, name);
    row.append(sample, info);
    fontsEl.appendChild(row);
  });
  // Le logo du projet en grand, sur la couleur de sa marque (data-logo-bg, sinon data-icon-bg)
  const logoWrap = document.getElementById('modalLogoWrap');
  const logoSrc = tile.dataset.logo || '';
  logoWrap.style.display = logoSrc ? '' : 'none';
  if (logoSrc) {
    const logoImg = document.getElementById('modalLogo');
    logoImg.src = logoSrc;
    logoImg.alt = `Logo ${tile.dataset.title || ''}`;
    logoWrap.style.background = tile.dataset.logoBg || tile.dataset.iconBg || 'var(--sand)';
  }
  document.getElementById('modalIdentity').style.display = logoSrc || fontsRaw || colorsRaw ? '' : 'none';

  // Déclinaisons (t-shirt, icône…) : « image|titre|texte|fond », séparées par « ;; ».
  // Avec un fond : l'image garde sa taille, centrée. Sans fond : la photo remplit la carte.
  const extrasEl = document.getElementById('modalExtras');
  extrasEl.innerHTML = '';
  const extras = (tile.dataset.extras || '').split(';;').map(s => s.trim()).filter(Boolean);
  extras.forEach(entry => {
    const [src, title, text, bg] = entry.split('|').map(s => s.trim());
    const fig = document.createElement('figure');
    fig.className = 'modal-extra';
    // Un clic sur l'image l'agrandit en plein écran
    const visual = document.createElement('button');
    visual.type = 'button';
    visual.setAttribute('aria-label', `Agrandir l'image : ${title}`);
    visual.addEventListener('click', () => openLightbox(src, title));
    visual.className = 'modal-extra-visual' + (bg ? ' is-contained' : '');
    if (bg) visual.style.background = bg;
    const img = document.createElement('img');
    img.src = src;
    img.alt = title;
    img.loading = 'lazy';
    visual.appendChild(img);
    const caption = document.createElement('figcaption');
    const h = document.createElement('h4');
    h.textContent = title;
    const p = document.createElement('p');
    p.textContent = text;
    caption.append(h, p);
    fig.append(visual, caption);
    extrasEl.appendChild(fig);
  });
  document.getElementById('modalExtrasWrap').style.display = extras.length ? '' : 'none';

  // Un lien discret sous le titre et un grand bouton sous les visuels
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
  // Accueil : chaque carte « Dernières réalisations » ouvre directement la fiche du projet
  document.querySelectorAll('.home-projects a[data-project]').forEach(link => {
    const tile = [...tiles].find(t => t.dataset.title === link.dataset.project);
    if (tile) link.addEventListener('click', (e) => { e.preventDefault(); openProjectModal(tile); });
  });
  document.getElementById('modalClose').addEventListener('click', closeProjectModal);
  modal.querySelector('.modal-backdrop').addEventListener('click', closeProjectModal);
}

// Branché une seule fois au chargement, pour ne pas empiler les écouteurs
document.addEventListener('keydown', (e) => {
  const modal = document.getElementById('projectModal');
  // Échap ferme d'abord l'image agrandie, pas toute la fiche (chaque chose en son temps)
  if (document.getElementById('lightbox')?.open) return;
  if (modal && modal.classList.contains('open') && e.key === 'Escape') closeProjectModal();
});

// ===== Image agrandie (flyer, t-shirt…) : un clic n'importe où la referme =====
function openLightbox(src, alt) {
  const box = document.getElementById('lightbox');
  if (!box) return;
  const img = box.querySelector('img');
  img.src = src;
  img.alt = alt;
  box.showModal();
}
document.getElementById('lightbox')?.addEventListener('click', (e) => e.currentTarget.close());

// ===== Contact : un clic sur l'email le copie. Plus d'excuse pour ne pas m'écrire ! =====
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

// ===== Formulaire de devis : envoyé via Formspree, sans quitter la page =====
// Le navigateur a déjà vérifié les champs obligatoires avant d'arriver ici.
document.getElementById('contactForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const form = e.currentTarget;
  const btn = form.querySelector('button[type="submit"]');
  const status = form.querySelector('.form-status');
  form.querySelector('[name="_subject"]').value =
    `[Emy Studio] Devis ${form.objet.value} : ${form.prenom.value} ${form.nom.value}`;
  btn.disabled = true;
  status.className = 'form-status';
  status.textContent = 'Envoi en cours…';
  try {
    const res = await fetch(form.action, {
      method: 'POST',
      body: new FormData(form),
      headers: { Accept: 'application/json' },
    });
    if (!res.ok) throw new Error(res.status);
    form.reset();
    status.textContent = 'Merci ! Votre demande est bien partie, je vous réponds très vite.';
  } catch {
    status.classList.add('is-error');
    status.textContent = "Oups, l'envoi n'a pas marché. Réessayez, ou écrivez-moi à contact@emystudio.fr.";
  }
  btn.disabled = false;
});

// ===== Une seule page : les liens du menu =====
// Un clic sur un lien referme le menu mobile avant de glisser jusqu'à la section.
links.addEventListener('click', (e) => {
  if (e.target.closest('a') && burger.classList.contains('open')) toggleMenu();
});

// Le lien de la section affichée s'allume pendant qu'on défile
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

// ===== Transition « le bureau de la créatrice », entre les sections =====
// Chaque .chapter = une section + une scène de papiers. À la fin de la section,
// elle se fige et recule doucement pendant que les morceaux de papier glissent un à un
// pour la recouvrir ; puis ils s'écartent depuis le centre pour dévoiler le titre
// de la section suivante. Tout suit le scroll, dans les deux sens. Oui, même à reculons.
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const chapters = [...document.querySelectorAll('.chapter')];
if (chapters.length && !reduceMotion.matches) {
  const clamp = (v) => Math.min(Math.max(v, 0), 1);
  // Puzzle : la photo de mon bureau découpée en morceaux de papier déchiré.
  // Les bords sont partagés entre voisins, donc les morceaux s'emboîtent pile poil.
  const fits = [];
  document.querySelectorAll('.puzzle').forEach(box => {
    let seed = 7;
    const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    const portrait = window.innerHeight > window.innerWidth;
    const cols = portrait ? 3 : 5, rows = portrait ? 5 : 4;
    const V = [];
    for (let j = 0; j <= rows; j++) {
      V[j] = [];
      for (let i = 0; i <= cols; i++) {
        const ex = i === 0 || i === cols, ey = j === 0 || j === rows;
        V[j][i] = [i / cols * 100 + (ex ? 0 : (rnd() - 0.5) * 40 / cols),
                   j / rows * 100 + (ey ? 0 : (rnd() - 0.5) * 40 / rows)];
      }
    }
    const edges = new Map();
    const torn = (a, b, straight) => {
      const back = edges.get(b + '>' + a);
      if (back) return back.slice().reverse();
      const pts = [];
      const dx = b[0] - a[0], dy = b[1] - a[1], len = Math.hypot(dx, dy);
      if (!straight) for (let k = 1; k < 7; k++) {
        const t = k / 7, off = (rnd() - 0.5) * 2.2;
        pts.push([a[0] + dx * t - dy / len * off, a[1] + dy * t + dx / len * off]);
      }
      edges.set(a + '>' + b, pts);
      return pts;
    };
    const pieces = [];
    for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
      const tl = V[j][i], tr = V[j][i + 1], br = V[j + 1][i + 1], bl = V[j + 1][i];
      const poly = [tl, ...torn(tl, tr, j === 0), tr, ...torn(tr, br, i + 1 === cols),
                    br, ...torn(br, bl, j + 1 === rows), bl, ...torn(bl, tl, i === 0)];
      const xs = poly.map(p => p[0]), ys = poly.map(p => p[1]);
      const x = Math.min(...xs), y = Math.min(...ys), w = Math.max(...xs) - x, h = Math.max(...ys) - y;
      const el = document.createElement('div');
      el.className = 'note piece';
      el.style.cssText = `left:${x}%;top:${y}%;width:${w}%;height:${h}%;` +
        `--x:${(tl[0] + tr[0] + br[0] + bl[0]) / 4};--y:${(tl[1] + tr[1] + br[1] + bl[1]) / 4};--r:0`;
      const img = document.createElement('span');
      img.style.backgroundImage = `url(${box.dataset.img})`;
      img.style.clipPath = `polygon(${poly.map(p => `${(p[0] - x) / w * 100}% ${(p[1] - y) / h * 100}%`).join(',')})`;
      el.appendChild(img);
      box.appendChild(el);
      pieces.push([img, x, y]);
    }
    // Photo entière posée par-dessus une fois tout assemblé : aucune jointure ne se voit
    const full = document.createElement('div');
    full.className = 'puzzle-full';
    full.style.backgroundImage = `url(${box.dataset.img})`;
    box.appendChild(full);
    fits.push(() => {
      const W = box.clientWidth, H = box.clientHeight, ratio = +box.dataset.ratio;
      const iw = Math.max(W, H * ratio), ih = iw / ratio, ox = (W - iw) / 2, oy = (H - ih) / 2;
      pieces.forEach(([img, x, y]) => {
        img.style.backgroundSize = `${iw}px ${ih}px`;
        img.style.backgroundPosition = `${ox - x / 100 * W}px ${oy - y / 100 * H}px`;
      });
    });
  });

  const scenes = chapters.map(chapter => {
    const scene = chapter.querySelector('.paper-scene');
    const notes = [...scene.querySelectorAll('.note')].map((el, i) => {
      const x = parseFloat(el.style.getPropertyValue('--x'));
      const y = parseFloat(el.style.getPropertyValue('--y'));
      const r = parseFloat(el.style.getPropertyValue('--r'));
      let dx = x - 50, dy = y - 50;
      const len = Math.hypot(dx, dy);
      if (len < 4) { dx = i % 2 ? 1 : -1; dy = -0.4; }   // pile au centre : il part sur le côté
      const n = Math.hypot(dx, dy);
      return { el, r, ux: dx / n, uy: dy / n, d: Math.min(len / 60, 1), piece: el.classList.contains('piece'), spin: (i % 2 ? 1 : -1) * (14 + (i * 7) % 18) };
    });
    return {
      chapter, scene, notes,
      outgoing: chapter.firstElementChild,                       // section qui se termine
      header: scene.querySelector('.paper-sticky').firstElementChild, // titre de la suivante
      veil: scene.querySelector('.paper-veil'),
      full: scene.querySelector('.puzzle-full'),
    };
  });

  const place = (n, dist, rot, scale) => {
    n.el.style.transform =
      (n.piece ? '' : 'translate(-50%, -50%) ') +
      `translate(${n.ux * dist}px, ${n.uy * dist}px) rotate(${rot}deg) scale(${scale})`;
  };

  const renderScene = (sc, W, H) => {
    const rect = sc.scene.getBoundingClientRect();
    if (rect.bottom < 0 || rect.top > H) return;   // hors de l'écran : rien à calculer, on se repose
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
      if (sc.full) sc.full.style.opacity = q >= 1 ? 1 : 0;
      sc.header.style.opacity = 0;
    } else {
      // Envol : le centre s'ouvre en premier, les bords suivent
      const u = clamp((p - 0.55) / 0.45);
      sc.notes.forEach(n => {
        const t = clamp((u - 0.1 - n.d * 0.3) / 0.5);
        const e = t * t * (3 - 2 * t) * t;
        place(n, e * far, n.r + n.spin * e, 1 + e * 0.12);
      });
      sc.outgoing.style.opacity = 0;
      sc.header.style.opacity = 1;
      if (sc.full) sc.full.style.opacity = u <= 0.1 ? 1 : 0;
    }
    // Voile abricot sous les papiers quand tout est couvert : personne ne voit l'échange, chut
    sc.veil.style.opacity = clamp(1 - Math.abs(p - 0.5) / 0.07);
  };

  let ticking = false;
  const render = () => {
    ticking = false;
    const W = window.innerWidth, H = window.innerHeight;
    scenes.forEach(sc => renderScene(sc, W, H));
  };
  const onScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(render); } };
  // Section plus haute que l'écran : elle défile jusqu'en bas, puis se fige
  const pin = () => {
    fits.forEach(f => f());
    scenes.forEach(sc => { sc.outgoing.style.top = Math.min(0, window.innerHeight - sc.outgoing.offsetHeight) + 'px'; });
    onScroll();
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', pin);
  chapters.forEach(c => c.classList.add('is-live'));
  pin();
  // Les images qui arrivent en retard changent la hauteur des sections : on recalcule
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

// ===== La méthode : les ronds se remplissent un à un pendant qu'on défile =====
document.querySelectorAll('.process').forEach(process => {
  const steps = [...process.querySelectorAll('.process-step')];
  let busy = false;
  const update = () => {
    busy = false;
    const line = window.innerHeight * 0.75;
    steps.forEach(el => el.classList.toggle('is-reached', el.getBoundingClientRect().top < line));
  };
  window.addEventListener('scroll', () => { if (!busy) { busy = true; requestAnimationFrame(update); } }, { passive: true });
  process.classList.add('is-live');
  update();
});

// ===== Pages titre : un titre plus haut que l'écran défile jusqu'en bas, puis se fige =====
{
  const titles = document.querySelectorAll('.title-page');
  const pinTitles = () => titles.forEach(t => { t.style.top = Math.min(0, window.innerHeight - t.offsetHeight) + 'px'; });
  window.addEventListener('resize', pinTitles);
  window.addEventListener('load', pinTitles);
  pinTitles();
}

// ===== Le fond change de couleur selon la section, comme un caméléon =====
// La section qui passe au milieu de l'écran donne sa couleur au fond (data-bg).
{
  const BG = { pale: '#FFEBCF' };   // abricot clair
  const tinted = [...document.querySelectorAll('[data-bg]')];

  let busy = false;
  const update = () => {
    busy = false;
    const mid = window.innerHeight / 2;
    let color = '';
    tinted.forEach(el => {
      const r = el.getBoundingClientRect();
      const on = r.top <= mid && r.bottom >= mid;
      el.classList.toggle('bg-on', on);   // pour les blocs qui ont leur propre fond
      if (on) color = BG[el.dataset.bg] || '';
    });
    document.body.style.backgroundColor = color;
  };
  const queue = () => { if (!busy) { busy = true; requestAnimationFrame(update); } };
  window.addEventListener('scroll', queue, { passive: true });
  window.addEventListener('resize', queue);
  queue();
}

// ===== Pied de page : l'année du copyright se met à jour toute seule (une chose de moins à penser) =====
document.querySelector('.footer-year').textContent = new Date().getFullYear();

// ===== Accueil, téléphone : les réalisations défilent doucement toutes seules =====
// On double la liste pour boucler sans à-coup. Un doigt posé met en pause,
// le défilement reprend tranquillement quelques secondes après.
const hpList = document.querySelector('.home-projects ul');
const phone = window.matchMedia('(max-width: 559px)');
if (hpList && !reduceMotion.matches) {
  const originals = [...hpList.children];
  originals.forEach(li => {
    const copy = li.cloneNode(true);
    copy.setAttribute('aria-hidden', 'true');
    const link = copy.querySelector('a');
    link.tabIndex = -1;
    link.addEventListener('click', (e) => { e.preventDefault(); li.querySelector('a').click(); });
    hpList.appendChild(copy);
  });

  const SPEED = 22;            // pixels par seconde : tout doux
  let pos = 0, last = 0, pausedUntil = performance.now() + 4500; // on attend la fin de l'arrivée des cartes
  const pause = () => { pausedUntil = Infinity; };
  const resume = () => { pausedUntil = performance.now() + 3000; };
  hpList.addEventListener('pointerdown', pause);
  hpList.addEventListener('touchstart', pause, { passive: true });
  hpList.addEventListener('touchend', resume);
  hpList.addEventListener('pointerup', resume);
  hpList.addEventListener('pointercancel', resume);

  let running = false;
  const step = (now) => {
    if (!phone.matches) { running = false; return; } // ordinateur : la boucle s'arrête
    const dt = Math.min(now - last, 100) / 1000;
    last = now;
    if (now >= pausedUntil) {
      const loop = hpList.children[originals.length].offsetLeft - hpList.children[0].offsetLeft;
      if (Math.abs(hpList.scrollLeft - pos) > 2) pos = hpList.scrollLeft; // le doigt a bougé la bande
      pos += SPEED * dt;
      if (pos >= loop) pos -= loop;
      hpList.scrollLeft = pos;
    }
    requestAnimationFrame(step);
  };
  const start = () => {
    if (running || !phone.matches) return;
    running = true;
    requestAnimationFrame((now) => { last = now; step(now); });
  };
  phone.addEventListener('change', start);
  start();
}
