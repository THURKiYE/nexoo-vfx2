const FALLBACK_PACKS = [
  { title: 'The Amazing Spider-Man', type: 'movie', year: '2012', url: 'https://vlscenepacks.com/scenepack/10165' },
  { title: 'Stranger Things', type: 'show', year: '2016', url: 'https://vlscenepacks.com/scenepack/10353' },
  { title: 'Dispatch', type: 'game', year: '2025', url: 'https://vlscenepacks.com/scenepack/10366' }
];

const grid = document.getElementById('grid');
const count = document.getElementById('count');
const allCount = document.getElementById('allCount');
const movieCount = document.getElementById('movieCount');
const showCount = document.getElementById('showCount');
const gameCount = document.getElementById('gameCount');
const search = document.getElementById('search');
const clearSearch = document.getElementById('clearSearch');
const sort = document.getElementById('sort');
const emptyState = document.getElementById('emptyState');
const setupState = document.getElementById('setupState');
const resetSearch = document.getElementById('resetSearch');
const syncStatus = document.getElementById('syncStatus');
let packs = [];
let activeFilter = 'all';

const TYPE_LABEL = { movie: 'MOVIE', show: 'TV SHOW', game: 'GAME' };
const TYPE_YEAR = { movie: 'MOVIE', show: 'TV', game: 'GAME' };

function escapeHtml(value = '') {
  return String(value).replace(/[&<>'"]/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', "'":'&#39;', '"':'&quot;' }[c]));
}

function initials(title = '') {
  return title.split(/\s+/).slice(0, 2).map(w => w[0] || '').join('').toUpperCase();
}

function typeLabel(type) { return TYPE_LABEL[type] || 'PACK'; }

function sourceOrder(list) { return list.map((p, i) => ({ ...p, sourceIndex: p.sourceIndex ?? i })); }

function filteredPacks() {
  const q = search.value.trim().toLowerCase();
  const list = packs.filter(p => {
    const typeOk = activeFilter === 'all' || p.type === activeFilter;
    const text = `${p.title} ${p.type} ${p.year || ''}`.toLowerCase();
    return typeOk && (!q || text.includes(q));
  });
  return list.sort((a, b) => {
    if (sort.value === 'az') return a.title.localeCompare(b.title);
    if (sort.value === 'za') return b.title.localeCompare(a.title);
    return (a.sourceIndex ?? 0) - (b.sourceIndex ?? 0);
  });
}

function renderCounts() {
  allCount.textContent = packs.length;
  movieCount.textContent = packs.filter(p => p.type === 'movie').length;
  showCount.textContent = packs.filter(p => p.type === 'show').length;
  gameCount.textContent = packs.filter(p => p.type === 'game').length;
}

function cardHtml(p, index) {
  const title = escapeHtml(p.title);
  const href = escapeHtml(p.url);
  const image = p.image ? escapeHtml(p.image) : '';
  const yr = p.year ? escapeHtml(String(p.year)) : '';
  const poster = image
    ? `<img loading="lazy" src="${image}" alt="${title}" referrerpolicy="no-referrer" onerror="this.remove();this.closest('.poster').classList.add('fallback')">`
    : `<div class="scan"></div><span class="initials">${escapeHtml(initials(p.title))}</span>`;

  return `
    <article class="card">
      <a class="card-link" href="${href}" target="_blank" rel="noopener noreferrer">
        <div class="poster">
          ${poster}
          <span class="corner">DIRECT LINK</span>
          <span class="corner right">${String(index + 1).padStart(3, '0')}</span>
          <div class="poster-title">${title}</div>
        </div>
      </a>
      <div class="card-body">
        <div class="card-top"><span class="type">${typeLabel(p.type)}</span><span class="year">${yr || '—'}</span></div>
        <h3>${title}</h3>
        <div class="card-sub">Visual Logoless scenepack page</div>
        <div class="card-bottom">
          <span class="direct">/scenepack/</span>
          <a class="view" href="${href}" target="_blank" rel="noopener noreferrer">VIEW PACK <b>↗</b></a>
        </div>
      </div>
    </article>`;
}

function render() {
  const list = filteredPacks();
  count.textContent = `(${list.length})`;
  renderCounts();
  grid.innerHTML = list.map(cardHtml).join('');
  const noData = packs.length === 0;
  setupState.hidden = !noData;
  emptyState.hidden = noData || list.length !== 0;
}

function setFilter(type) {
  activeFilter = type;
  document.querySelectorAll('[data-filter]').forEach(el => el.classList.toggle('active', el.dataset.filter === type));
  render();
  if (type !== 'all') document.getElementById('packs')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

document.querySelectorAll('[data-filter]').forEach(el => el.addEventListener('click', () => setFilter(el.dataset.filter)));
document.querySelectorAll('[data-search]').forEach(el => el.addEventListener('click', () => {
  search.value = el.dataset.search;
  activeFilter = 'all';
  document.querySelectorAll('[data-filter]').forEach(x => x.classList.toggle('active', x.dataset.filter === 'all'));
  render();
  document.getElementById('packs')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}));
search.addEventListener('input', render);
sort.addEventListener('change', render);
clearSearch.addEventListener('click', () => { search.value = ''; search.focus(); render(); });
resetSearch.addEventListener('click', () => { search.value = ''; activeFilter = 'all'; sort.value = 'source'; setFilter('all'); });
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') { search.value = ''; search.blur(); render(); }
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); search.focus(); }
});

async function loadPacks() {
  syncStatus.textContent = 'SYNCING INDEX…';
  try {
    const response = await fetch(`data/packs.json?ts=${Date.now()}`, { cache: 'no-store' });
    if (!response.ok) throw new Error('data not found');
    const data = await response.json();
    if (!Array.isArray(data) || !data.length) throw new Error('empty data');
    packs = sourceOrder(data).map(p => ({
      title: p.title || 'Untitled',
      type: p.type || 'movie',
      year: p.year || '',
      url: p.url,
      image: p.image || ''
    }));
    syncStatus.textContent = `${packs.length.toLocaleString()} TITLES INDEXED`;
  } catch (err) {
    packs = sourceOrder(FALLBACK_PACKS);
    syncStatus.textContent = 'BOOTSTRAP INDEX';
  }
  render();
}

const menuTrigger = document.getElementById('menuTrigger');
const mobilePanel = document.getElementById('mobilePanel');
const closePanel = document.getElementById('closePanel');
function toggleMobile(open) {
  mobilePanel.classList.toggle('open', open);
  mobilePanel.setAttribute('aria-hidden', String(!open));
  menuTrigger.setAttribute('aria-expanded', String(open));
}
menuTrigger?.addEventListener('click', () => toggleMobile(true));
closePanel?.addEventListener('click', () => toggleMobile(false));
mobilePanel?.querySelectorAll('a,button:not(.close-panel)').forEach(el => el.addEventListener('click', () => toggleMobile(false)));

loadPacks();
