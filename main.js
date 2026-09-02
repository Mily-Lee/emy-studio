const burger = document.querySelector('.nav-burger');
const links = document.querySelector('.nav-links');

function toggleMenu() {
  const isOpen = burger.classList.toggle('open');
  links.classList.toggle('open');
  burger.setAttribute('aria-expanded', isOpen);
  document.body.style.overflow = isOpen ? 'hidden' : '';
}

burger.addEventListener('click', toggleMenu);

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && burger.classList.contains('open')) toggleMenu();
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
// Vue d'ensemble : toutes les images du projet côte à côte dans une grille,
// plus de carrousel à faire défiler une image à la fois.
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
  galleryEl.classList.toggle('two-col', tile.dataset.twoColGallery === 'true');
  images.forEach((src, i) => {
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
  fontsEl.textContent = fontsRaw;

  if (tile.dataset.url) {
    linkEl.href = tile.dataset.url;
    linkEl.style.display = 'inline-flex';
    soonEl.style.display = 'none';
  } else {
    linkEl.style.display = 'none';
    soonEl.style.display = 'inline-block';
  }

  modal.classList.add('open');
  modal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}

function closeProjectModal() {
  const modal = document.getElementById('projectModal');
  if (!modal) return;
  modal.classList.remove('open');
  modal.setAttribute('aria-hidden', 'true');
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

// ===== Formulaire de contact (page Contact) =====
function initContactForm() {
  const form = document.getElementById('contactForm');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const status = document.getElementById('formStatus');
    const btn = form.querySelector('button[type="submit"]');
    btn.disabled = true;
    status.className = 'form-status';
    status.textContent = '';

    try {
      const res = await fetch('https://formspree.io/f/xvkorgeb', {
        method: 'POST',
        body: new FormData(form),
        headers: { Accept: 'application/json' },
      });
      if (res.ok) {
        status.textContent = 'Message envoyé ! Je vous réponds rapidement.';
        status.className = 'form-status success';
        form.reset();
      } else {
        status.textContent = 'Une erreur est survenue, réessayez.';
        status.className = 'form-status error';
      }
    } catch {
      status.textContent = 'Une erreur est survenue. Appelez-moi directement au 07 64 62 88 43';
      status.className = 'form-status error';
    }

    btn.disabled = false;
  });
}

initGallery();
initContactForm();

// ===== Navigation sans rechargement — le menu reste en place =====
// On ne remplace que le contenu de <main>, jamais le header/burger/menu.
function setActiveLinks(page) {
  document.querySelectorAll('.nav-links a, .top-nav-links a').forEach(a => {
    a.classList.toggle('active', a.getAttribute('href') === page);
  });
}

async function navigateTo(page, addToHistory = true) {
  const current = document.querySelector('main');

  try {
    const response = await fetch(page);
    if (!response.ok) throw new Error('Page introuvable');
    const html = await response.text();
    const nextDoc = new DOMParser().parseFromString(html, 'text/html');
    const nextMain = nextDoc.querySelector('main');
    if (!nextMain) throw new Error('Pas de <main> dans la page cible');

    current.classList.add('is-leaving');
    await new Promise(resolve => setTimeout(resolve, 250));

    document.body.className = nextDoc.body.className;
    document.title = nextDoc.title;
    current.replaceWith(document.adoptNode(nextMain));
    setActiveLinks(page);
    initGallery();
    initContactForm();

    if (addToHistory) history.pushState({ page }, '', page);
    window.scrollTo(0, 0);

    if (burger.classList.contains('open')) toggleMenu();
  } catch (err) {
    window.location.href = page;
  }
}

document.addEventListener('click', (e) => {
  const link = e.target.closest('a');
  if (!link) return;

  const href = link.getAttribute('href');
  if (!href || !href.endsWith('.html')) return;
  if (link.target === '_blank') return;

  e.preventDefault();

  const current = location.pathname.split('/').pop() || 'index.html';
  if (href === current) {
    if (burger.classList.contains('open')) toggleMenu();
    return;
  }

  navigateTo(href);
});

window.addEventListener('popstate', () => {
  const page = location.pathname.split('/').pop() || 'index.html';
  navigateTo(page, false);
});
