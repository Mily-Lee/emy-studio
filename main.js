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

// ===== Modale projets (page Réalisations) =====
// Etat au niveau module : persiste entre deux appels d'initGallery,
// donc pas de listener keydown dupliqué à chaque navigation AJAX.
let gallerySlides = [];
let galleryIndex = 0;

function updateGallerySlide() {
  const img = document.getElementById('modalImg');
  if (!img) return;
  const dotsWrap = document.getElementById('modalDots');
  const prevBtn = document.getElementById('modalPrev');
  const nextBtn = document.getElementById('modalNext');

  img.style.opacity = '0';
  setTimeout(() => {
    img.src = gallerySlides[galleryIndex];
    img.style.opacity = '1';
  }, 200);

  if (dotsWrap) {
    dotsWrap.querySelectorAll('.modal-dot').forEach((d, i) => d.classList.toggle('active', i === galleryIndex));
  }
  if (prevBtn) prevBtn.classList.toggle('hidden', gallerySlides.length < 2);
  if (nextBtn) nextBtn.classList.toggle('hidden', gallerySlides.length < 2);
}

function openProjectModal(tile) {
  const modal = document.getElementById('projectModal');
  if (!modal) return;

  const img = document.getElementById('modalImg');
  const dotsWrap = document.getElementById('modalDots');
  const prevBtn = document.getElementById('modalPrev');
  const nextBtn = document.getElementById('modalNext');
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
  gallerySlides = imgsRaw ? imgsRaw.split(',').map(s => s.trim()).filter(Boolean) : [];
  galleryIndex = 0;

  tagEl.textContent = tile.dataset.tag || '';
  titleEl.textContent = tile.dataset.title || '';
  detailEl.textContent = tile.dataset.detail || '';

  dotsWrap.innerHTML = '';
  if (gallerySlides.length) {
    img.style.display = 'block';
    img.alt = tile.dataset.title || '';
    img.src = gallerySlides[0];
    img.style.opacity = '1';
    if (gallerySlides.length > 1) {
      gallerySlides.forEach((_, i) => {
        const dot = document.createElement('button');
        dot.type = 'button';
        dot.className = 'modal-dot' + (i === 0 ? ' active' : '');
        dot.setAttribute('aria-label', `Image ${i + 1}`);
        dot.addEventListener('click', () => { galleryIndex = i; updateGallerySlide(); });
        dotsWrap.appendChild(dot);
      });
    }
    prevBtn.classList.toggle('hidden', gallerySlides.length < 2);
    nextBtn.classList.toggle('hidden', gallerySlides.length < 2);
  } else {
    img.style.display = 'none';
    prevBtn.classList.add('hidden');
    nextBtn.classList.add('hidden');
  }

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
  document.getElementById('modalPrev').addEventListener('click', () => {
    galleryIndex = (galleryIndex - 1 + gallerySlides.length) % gallerySlides.length;
    updateGallerySlide();
  });
  document.getElementById('modalNext').addEventListener('click', () => {
    galleryIndex = (galleryIndex + 1) % gallerySlides.length;
    updateGallerySlide();
  });
}

// Enregistré une seule fois au chargement du script : safe contre les navigations répétées
document.addEventListener('keydown', (e) => {
  const modal = document.getElementById('projectModal');
  if (!modal || !modal.classList.contains('open')) return;
  if (e.key === 'Escape') closeProjectModal();
  if (e.key === 'ArrowLeft' && gallerySlides.length > 1) {
    galleryIndex = (galleryIndex - 1 + gallerySlides.length) % gallerySlides.length;
    updateGallerySlide();
  }
  if (e.key === 'ArrowRight' && gallerySlides.length > 1) {
    galleryIndex = (galleryIndex + 1) % gallerySlides.length;
    updateGallerySlide();
  }
});

initGallery();

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
