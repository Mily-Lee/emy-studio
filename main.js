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
