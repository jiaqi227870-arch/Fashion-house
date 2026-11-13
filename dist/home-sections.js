import { categories } from './data.js';

const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, character => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
}[character]));

const processStages = [
  {
    title: 'Sketch',
    image: './assets/illustration-study.png',
    alt: 'Expressive fashion illustration with loose lines and painted shapes',
    text: 'Start with a gesture. Let an unexpected line suggest a new silhouette.',
  },
  {
    title: 'Material',
    image: './assets/textile-study.png',
    alt: 'A textile study exploring woven texture, pattern and color',
    text: 'Explore texture, weight, and color. Find the material that gives the idea its character.',
  },
  {
    title: 'Construction',
    image: './assets/design-study.png',
    alt: 'A garment design study showing shape and construction',
    text: 'Cut, fold, assemble, repeat. Give the idea structure while leaving room for discovery.',
  },
  {
    title: 'Final artwork',
    image: './assets/digital-study.png',
    alt: 'A completed digital couture dress in cobalt glass with a pale lime ribbon',
    text: 'Bring the elements together. Share a finished piece and the story behind it.',
  },
];

function archiveSelection(artworks) {
  const available = Array.isArray(artworks) ? artworks.filter(art => art?.id && art?.image) : [];
  const preferred = ['the-third-act', 'room-for-a-garment', 'wear-another-world'];
  const candidates = [
    ...preferred.map(id => available.find(art => art.id === id)).filter(Boolean),
    ...available,
  ];
  const seen = new Set();
  return candidates.filter(art => {
    if (seen.has(art.id)) return false;
    seen.add(art.id);
    return true;
  }).slice(0, 3);
}

export function supportingSections(artworks, icon) {
  const selected = archiveSelection(artworks);
  const process = processStages.map((stage, index) => `
    <article class="process-step" data-reveal style="--reveal-delay:${index * 70}ms">
      <div class="process-image">
        <img src="${stage.image}" alt="${stage.alt}" loading="lazy" decoding="async" width="600" height="600">
        <span class="process-index" aria-hidden="true">0${index + 1}</span>
      </div>
      <div class="process-step-heading">
        <h3>${stage.title}</h3>
        ${index < processStages.length - 1 ? `<span class="process-arrow" aria-hidden="true">${icon('arrow-right', 20)}</span>` : '<span class="process-end" aria-hidden="true">✳</span>'}
      </div>
      <p>${stage.text}</p>
    </article>`).join('');

  const archive = selected.map((art, index) => {
    const category = categories.find(item => item.id === art.category)?.name || art.category || 'Fashion art';
    const artist = art.artist || 'Independent artist';
    const initials = artist.trim().split(/\s+/).slice(0, 2).map(part => part[0]).join('').toUpperCase();
    const portrait = art.avatar
      ? `<img class="archive-avatar" src="${escapeHtml(art.avatar)}" alt="" loading="lazy" decoding="async" width="42" height="42">`
      : `<span class="archive-avatar archive-initials" aria-hidden="true">${escapeHtml(initials)}</span>`;
    return `
      <a class="archive-row" href="#/artwork/${encodeURIComponent(art.id)}" data-reveal style="--reveal-delay:${index * 60}ms" aria-label="View ${escapeHtml(art.title)} by ${escapeHtml(artist)}">
        <span class="archive-index" aria-hidden="true">0${index + 1}</span>
        <div class="archive-art">
          <img src="${escapeHtml(art.image)}" alt="${escapeHtml(art.title)}" loading="lazy" decoding="async" width="200" height="200">
        </div>
        <div class="archive-work">
          <span class="archive-category">${escapeHtml(category)}</span>
          <h3>${escapeHtml(art.title)}</h3>
          <p class="archive-media">${escapeHtml(art.media)}</p>
        </div>
        <div class="archive-artist">
          ${portrait}
          <div><span class="archive-artist-label">Artist</span><span class="archive-artist-name">${escapeHtml(artist)}</span></div>
        </div>
        <span class="archive-arrow" aria-hidden="true">${icon('arrow-up-right', 22)}</span>
      </a>`;
  }).join('');

  return `
    <section class="process-section section shell" id="process" aria-labelledby="process-title">
      <div class="supporting-heading" data-reveal>
        <div><p class="supporting-kicker">The creative process</p><h2 id="process-title">Ideas take shape.</h2></div>
        <p class="supporting-intro">From a first mark to a final form.<br>A closer look at the making of fashion art.</p>
      </div>
      <div class="process-grid">${process}</div>
      <div class="process-footnote" data-reveal>
        <span>No single way to make it. Every reason to begin.</span>
        <a class="supporting-link" href="#/upload">Start your next piece ${icon('arrow-up-right', 16)}</a>
      </div>
    </section>
    <section class="archive-section section shell" id="archive" aria-labelledby="archive-title">
      <div class="supporting-heading" data-reveal>
        <div><p class="supporting-kicker">Selected from the collection</p><h2 id="archive-title">Inside the archive.</h2></div>
        <a class="supporting-link" href="#/collection">Explore all artworks ${icon('arrow-up-right', 16)}</a>
      </div>
      <div class="archive-list">${archive || '<p class="archive-empty">The next chapter is waiting to be made. Explore the collection or share a work of your own.</p>'}</div>
      <p class="archive-note">Concept selection · Illustrative artworks and artist profiles.</p>
    </section>`;
}
