import { staticAsset } from './asset-url.js';

// Source artwork is preserved unchanged. Each link is a proportional window
// into the supplied nine-category sheet; tiny CSS patches remove only its icons.
const crops = [
  [10,85,505,280,114,102,76,79], [524,85,487,280,647,105,59,73], [1020,85,505,280,1147,102,49,84],
  [10,373,505,280,136,399,67,70], [524,373,487,280,646,392,58,66], [1020,373,505,280,1140,379,84,89],
  [10,660,505,280,125,678,59,80], [524,660,487,280,646,679,75,73], [1020,660,505,280,1142,681,76,71],
];
const escape = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function referenceCategories(categories) {
  return `<section class="reference-section" id="mediums" aria-labelledby="category-title"><div class="reference-section-head"><h2 id="category-title">NINE DISCIPLINES. ENDLESS POSSIBILITIES.</h2><span>CHOOSE YOUR CREATIVE WORLD ↘</span></div><div class="reference-grid">${categories.map((category,i)=>{
    const [x,y,w,h,px,py,pw,ph] = crops[i];
    return `<a class="reference-card category-card-${i+1}" href="#/collection?category=${category.id}" style="--card-ratio:${w}/${h};--sheet-width:${1536/w*100}%;--sheet-left:${-x/w*100}%;--sheet-top:${-y/h*100}%;--patch-x:${(px-x)/w*100}%;--patch-y:${(py-y)/h*100}%;--patch-w:${pw/w*100}%;--patch-h:${ph/h*100}%" aria-label="${String(i+1).padStart(2,'0')}. Explore ${escape(category.name)}"><img class="reference-sheet" src="${staticAsset('categories-reference.png')}" alt="" loading="lazy" decoding="async" width="1536" height="1024"><span class="category-icon-patch" aria-hidden="true"></span><span class="reference-focus" aria-hidden="true"></span><span class="sr-only"><strong>${category.name}</strong> — ${category.description}</span></a>`;
  }).join('')}</div><div class="reference-bottom"><span class="reference-globe" aria-hidden="true">◎ ✦</span><strong>FASHION ART CONNECTS THE WORLDS</strong><a href="#featured">KEEP EXPLORING ↓</a></div></section>`;
}
