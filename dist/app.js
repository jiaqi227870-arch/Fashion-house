import { categories, icon } from './data.js';
import { staticAsset } from './asset-url.js';
import { figmaArtworks, artworkAliases } from './figma-data.js';
import { initMotion } from './motion.js';
import { initHeroModel } from './hero-interaction.js';
import { collectionMarkup, uploadMarkup } from './figma-pages.js';
import { sharedHeader, sharedFooter, homepageMarkup, wireSharedUI } from './presentation.js';
import { isSaved, viewCount, recordView, toggleSaved, rememberCollection, recalledCollection } from './collection-state.js';

const app = document.querySelector('#app');
const samples = figmaArtworks;
const demoNote = 'Concept collection with Figma reference photography and illustrative artwork studies. Artist profiles and statements are demonstration content.';
let localWorks = [];
let cleanupMotion = () => {};
let cleanupPage = () => {};
let cleanupShared = () => {};
let toastTimer;
let lastCollection = recalledCollection();
let dbPromise;
const ownedUrls = [];
const esc = text => String(text ?? '').replace(/[&<>"']/g, char => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[char]));
const allWorks = () => [...localWorks, ...samples];
const categoryFor = id => categories.find(category => category.id === id);
const button = (label, href, type = '', symbol = 'arrow-up-right') => `<a class="button ${type}" data-magnetic href="${href}"><span class="button-label">${label}</span>${icon(symbol, 17)}</a>`;
const label = (number, text) => `<span class="eyebrow">(${number}) — ${text}</span>`;

function header(active = '') { return sharedHeader(active, button); }
function footer() { return sharedFooter(); }
function card(art, index, reveal = true) {
  return `<a class="art-card" href="#/artwork/${encodeURIComponent(art.id)}" ${reveal ? 'data-reveal' : ''} style="--reveal-delay:${Math.min(index % 5 * 50, 200)}ms" aria-label="View ${esc(art.title)} by ${esc(art.artist)}"><div class="art-image" data-artwork><img src="${esc(art.image)}" alt="${esc(art.title)} — ${esc(categoryFor(art.category)?.name)}" loading="lazy" decoding="async"><span class="art-number">${String(index + 1).padStart(3, '0')} / ${esc(categoryFor(art.category)?.shortName.toUpperCase())}</span><span class="art-open" aria-hidden="true">${icon('arrow-up-right', 15)}</span><span class="local-light"></span><span class="edge-light"></span></div><div class="art-info"><h3 class="art-title">${esc(art.title)}</h3><p class="art-artist">by ${esc(art.artist)}${art.local ? ' · Your artwork' : ''}</p><p class="art-media">${esc(art.media)}</p><p class="art-statement">${esc(art.statement)}</p></div></a>`;
}
function home() {
  document.title = 'Fashion House — Art meets couture.';
  app.innerHTML = homepageMarkup({samples,card,button,header,footer,demoNote});
  cleanupPage = initHeroModel();
}

function collection(params) {
  const selected = categoryFor(params.get('category'));
  lastCollection = location.hash;
  rememberCollection(lastCollection);
  document.title = `${selected?.name || 'The Collection'} — Fashion House`;
  app.innerHTML = collectionMarkup({selected,categories,header,footer,button,icon,demoNote,esc});
  const input = document.querySelector('#art-search');
  const sort = document.querySelector('#art-sort');
  input.value = params.get('q') || '';
  sort.value = ['curated','newest','popular','saved','title','artist'].includes(params.get('sort')) ? params.get('sort') : 'curated';
  const update = () => {
    const query = input.value.trim().toLowerCase();
    let works = allWorks().filter(art => (!selected || art.category === selected.id) && `${art.title} ${art.artist} ${art.media} ${art.statement}`.toLowerCase().includes(query));
    if (sort.value === 'title' || sort.value === 'artist') works.sort((a,b) => a[sort.value].localeCompare(b[sort.value]));
    if (sort.value === 'newest') works.sort((a,b) => (b.createdAt || 0) - (a.createdAt || 0));
    if (sort.value === 'popular') works.sort((a,b) => viewCount(b.id) - viewCount(a.id));
    if (sort.value === 'saved') works = works.filter(art => isSaved(art.id));
    document.querySelectorAll('[data-mode]').forEach(control => control.setAttribute('aria-pressed',String(control.dataset.mode===sort.value)));
    const route = new URLSearchParams();
    if (selected) route.set('category',selected.id);
    if (input.value) route.set('q',input.value);
    if (sort.value!=='curated') route.set('sort',sort.value);
    lastCollection = '#/collection' + (route.size ? '?' + route : '');
    try { history.replaceState(null,'',lastCollection); } catch { /* Some browsers restrict history changes for local files. */ }
    rememberCollection(lastCollection);
    document.querySelector('#result-count').textContent = `${works.length} work${works.length === 1 ? '' : 's'}`;
    document.querySelector('#collection-grid').innerHTML = works.length ? works.map((art,i) => card(art,i,false)).join('') : `<div class="empty-state"><span class="eyebrow">A LITTLE ROOM FOR DISCOVERY</span><h2>${sort.value==='saved'?'Your saved collection starts here.':'No matching works. Yet.'}</h2><p>${sort.value==='saved'?'Open an artwork and choose Save to keep it here.':'Try another artist, title, or material.'}</p><button class="button button-outline" id="clear-search">Clear search ${icon('arrow-right',16)}</button></div>`;
    document.querySelector('#clear-search')?.addEventListener('click', () => { input.value=''; if(sort.value==='saved')sort.value='curated'; update(); input.focus(); });
    cleanupMotion(); cleanupMotion = initMotion();
    wireImageFallbacks();
  };
  input.addEventListener('input', update);
  sort.addEventListener('change', update);
  document.querySelectorAll('[data-mode]').forEach(control=>control.addEventListener('click',()=>{sort.value=control.dataset.mode;update();}));
  update();
  if(params.get('focus')==='search') requestAnimationFrame(()=>input.focus());
}

function getDb() {
  if (!dbPromise) dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open('fashion-house', 1);
    request.onupgradeneeded = () => request.result.createObjectStore('artworks', { keyPath: 'id' });
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
  return dbPromise;
}
async function storeArtwork(artwork) {
  const db = await getDb();
  return new Promise((resolve,reject) => {
    const tx = db.transaction('artworks','readwrite');
    tx.objectStore('artworks').put(artwork);
    tx.oncomplete = resolve;
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);
  });
}
function withUrls(art) {
  const image = URL.createObjectURL(art.imageBlob);
  ownedUrls.push(image);
  let avatar = '';
  if (art.avatarBlob) { avatar = URL.createObjectURL(art.avatarBlob); ownedUrls.push(avatar); }
  return { ...art, image, avatar, local: true };
}
async function loadLocalArtworks() {
  try {
    const db = await getDb();
    const entries = await new Promise((resolve,reject) => {
      const request = db.transaction('artworks','readonly').objectStore('artworks').getAll();
      request.onsuccess = () => resolve(request.result); request.onerror = () => reject(request.error);
    });
    localWorks = entries.sort((a,b)=> b.createdAt-a.createdAt).map(withUrls);
  } catch { localWorks = []; }
}

function upload(params) {
  document.title = 'Submit your artwork — Fashion House';
  let selectedFile = null, avatarFile = null, previewUrl = '', avatarUrl = '';
  let fileVersion = 0, avatarVersion = 0, disposed = false, imagePending = false, avatarPending = false, saving = false;
  app.innerHTML = uploadMarkup({selected:categoryFor(params.get('category')),categories,header,footer,icon,esc,lastCollection});
  const form = document.querySelector('#upload-form');
  const drop = document.querySelector('#drop-zone');
  const fileInput = document.querySelector('#art-file');
  const fileError = document.querySelector('#file-error');
  const formError = document.querySelector('#form-error');
  const preview = document.createElement('img');
  preview.className = 'upload-preview'; preview.alt = 'Your artwork preview';
  const overlay = document.createElement('div'); overlay.className = 'preview-overlay';
  const validImage = async (file, maxMb) => {
    if (!file || !['image/jpeg','image/png','image/webp'].includes(file.type)) throw new Error('Please choose a JPG, PNG, or WEBP image.');
    if (file.size > maxMb * 1024 * 1024) throw new Error(`Please choose an image smaller than ${maxMb} MB.`);
    const image = new Image(); const url = URL.createObjectURL(file);
    try { await new Promise((resolve,reject)=>{ image.onload=resolve; image.onerror=()=>reject(new Error('This image could not be opened. Please try a different file.')); image.src=url; }); }
    finally { URL.revokeObjectURL(url); }
  };
  async function chooseFile(file) {
    const version = ++fileVersion;
    imagePending = true;
    const submit = form.querySelector('[type=submit]');
    submit.disabled = true;
    try {
      await validImage(file,20);
      if (disposed || version !== fileVersion) return;
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      selectedFile=file; previewUrl=URL.createObjectURL(file); preview.src=previewUrl;
      drop.querySelector('.drop-zone-content').hidden=true; drop.classList.add('has-image');
      overlay.innerHTML=`<span>${esc(file.name)}</span><strong>CHANGE ↗</strong>`;
      drop.append(preview,overlay); fileError.textContent=''; formError.textContent='';
    } catch (error) { if (!disposed && version===fileVersion) fileError.textContent=error.message; }
    finally { if (!disposed && version===fileVersion) { imagePending=false; submit.disabled=avatarPending||saving; } }
  }
  fileInput.addEventListener('change',()=>{ if (fileInput.files[0]) chooseFile(fileInput.files[0]); });
  ['dragenter','dragover'].forEach(type=>drop.addEventListener(type,event=>{ event.preventDefault(); drop.classList.add('dragover'); }));
  ['dragleave','drop'].forEach(type=>drop.addEventListener(type,event=>{ event.preventDefault(); drop.classList.remove('dragover'); }));
  drop.addEventListener('drop',event=>{ if(event.dataTransfer.files[0]) chooseFile(event.dataTransfer.files[0]); });
  form.elements.statement.addEventListener('input',()=>document.querySelector('#statement-count').textContent=form.elements.statement.value.length);
  document.querySelector('#artist-photo').addEventListener('change', async event=>{
    const file=event.target.files[0]; if(!file) return;
    const version=++avatarVersion;
    avatarPending=true; form.querySelector('[type=submit]').disabled=true;
    try {
      await validImage(file,2); if(disposed || version!==avatarVersion) return;
      if(avatarUrl) URL.revokeObjectURL(avatarUrl); avatarFile=file; avatarUrl=URL.createObjectURL(file);
      document.querySelector('#avatar-preview').innerHTML=`<img src="${avatarUrl}" alt="Your artist photo">`; formError.textContent='';
    } catch(error) { if(!disposed && version===avatarVersion) formError.textContent=error.message; }
    finally { if(!disposed && version===avatarVersion) { avatarPending=false;form.querySelector('[type=submit]').disabled=imagePending||saving; } }
  });
  form.addEventListener('submit',async event=>{
    event.preventDefault();
    if(saving)return;
    if(imagePending||avatarPending) { formError.textContent='Please wait while your image is checked.'; return; }
    if(!selectedFile) { fileError.textContent='Choose your artwork image to continue.'; fileInput.focus(); return; }
    const data=Object.fromEntries(new FormData(form));
    for(const key of ['title','artist','category','media','statement']) {
      data[key]=data[key].trim();
      if(!data[key]) { formError.textContent='Please complete all required fields.'; form.elements[key].focus(); return; }
    }
    const submit=form.querySelector('[type=submit]'); saving=true; submit.disabled=true;
    submit.querySelector('.button-label').textContent='Saving your work…'; formError.textContent='';
    try {
      const id=crypto.randomUUID?.() ?? Array.from(crypto.getRandomValues(new Uint8Array(16)), byte=>byte.toString(16).padStart(2,'0')).join('');
      const art={...data,id:`local-${id}`,year:new Date().getFullYear(),createdAt:Date.now(),imageBlob:selectedFile,avatarBlob:avatarFile,local:true};
      await storeArtwork(art); localWorks.unshift(withUrls(art));
      if(!disposed) { location.hash=`#/artwork/${art.id}`; toast('Your artwork is in the house. Saved on this device.'); }
    } catch {
      saving=false;
      if(!disposed) { formError.textContent='Your browser could not save this artwork. Storage may be full or disabled. Try a smaller image or a regular browser window.'; submit.disabled=false; submit.querySelector('.button-label').textContent='Try again'; }
    }
  });
  cleanupPage=()=>{ disposed=true; if(previewUrl)URL.revokeObjectURL(previewUrl); if(avatarUrl)URL.revokeObjectURL(avatarUrl); };
}

function viewer(id) {
  id=artworkAliases[id] || id;
  let disposed=false;
  const works=allWorks(), artwork=works.find(art=>art.id===id);
  if(!artwork) { app.innerHTML=`${header()}<main id="main" tabindex="-1" class="shell section"><div class="empty-state"><h1 class="display page-title">This work isn't here.</h1><p>Local uploads are available only in the browser where they were added.</p>${button('Back to the collection','#/collection')}</div></main>${footer()}`; return; }
  const index=works.findIndex(art=>art.id===id);
  recordView(id);
  document.title=`${artwork.title} by ${artwork.artist} — Fashion House`;
  const avatar=artwork.avatar?`<img class="avatar" src="${esc(artwork.avatar)}" alt="${esc(artwork.artist)}${artwork.demo?' — illustrative portrait':''}">`:`<span class="avatar avatar-fallback" aria-label="Artist initials">${esc(artwork.artist.split(/\s+/).slice(0,2).map(part=>part[0]).join('').toUpperCase())}</span>`;
  app.innerHTML=`${header('artwork')}<main class="viewer-page" id="main" tabindex="-1"><header class="viewer-header"><a class="viewer-back" href="${esc(lastCollection)}">${icon('arrow-left',17)} BACK TO COLLECTION</a><div class="viewer-identity">${avatar}<div><h1>${esc(artwork.title)}</h1><p>by ${esc(artwork.artist)}</p></div></div><div class="viewer-actions"><button class="viewer-action" id="save-artwork" aria-pressed="${isSaved(id)}">${isSaved(id)?'✓ SAVED':'♡ SAVE'}</button><button class="viewer-action" id="share-artwork">SHARE ${icon('arrow-up-right',13)}</button><button class="icon-button" id="art-details" aria-label="Show artwork details" aria-expanded="false">${icon('plus',18)}</button><button class="icon-button" id="fullscreen" aria-label="Enter full screen">${icon('expand',18)}</button><a class="icon-button" href="${esc(lastCollection)}" aria-label="Close artwork">${icon('close',18)}</a></div></header><div class="viewer-stage"><img class="viewer-image" src="${esc(artwork.image)}" alt="${esc(artwork.title)} — ${esc(artwork.statement)}"><a class="icon-button viewer-nav viewer-prev" href="#/artwork/${works[(index-1+works.length)%works.length].id}" aria-label="Previous artwork">${icon('arrow-left',18)}</a><a class="icon-button viewer-nav viewer-next" href="#/artwork/${works[(index+1)%works.length].id}" aria-label="Next artwork">${icon('arrow-right',18)}</a><aside class="viewer-details" hidden><button class="icon-button detail-close" aria-label="Close details">${icon('close',16)}</button><span class="eyebrow">${esc(categoryFor(artwork.category)?.name)}</span><h2>${esc(artwork.title)}</h2><p>${esc(artwork.statement)}</p><p class="eyebrow" style="margin-top:18px">${esc(artwork.media)}</p><p class="eyebrow muted">${artwork.demo?'CONCEPT ARTWORK · FICTIONAL ARTIST': 'YOUR ARTWORK · SAVED ON THIS DEVICE'}</p></aside></div><div class="viewer-bottom"><span>${esc(categoryFor(artwork.category)?.name.toUpperCase())} / ${esc(artwork.media)}</span><span class="keyboard-hint">← → EXPLORE &nbsp; / &nbsp; ESC CLOSE</span><span>${String(index+1).padStart(2,'0')} / ${String(works.length).padStart(2,'0')}</span></div></main>`;
  const related=works.filter(art=>art.id!==id).sort((a,b)=>Number(b.artist===artwork.artist)-Number(a.artist===artwork.artist)).slice(0,4);
  document.querySelector('.viewer-page').insertAdjacentHTML('beforeend',`<section class="viewer-story shell"><div><span class="eyebrow">MEDIA & MATERIALS</span><p>${esc(artwork.media)}</p></div><div><h2>ARTIST STATEMENT</h2><p>${esc(artwork.statement)}</p><p class="demo-note">${artwork.demo?'Reference imagery · Illustrative artist profile':'Your artwork · Saved on this device'}</p></div></section><section class="viewer-related shell"><h2>MORE WORKS</h2><div class="art-grid">${related.map((art,i)=>card(art,i)).join('')}</div></section>`);
  document.querySelector('#save-artwork').addEventListener('click',event=>{
    const result=toggleSaved(id);
    event.currentTarget.setAttribute('aria-pressed',String(result.saved));
    event.currentTarget.textContent=result.saved?'✓ SAVED':'♡ SAVE';
    toast(result.persisted?(result.saved?'Saved to your collection in this browser.':'Removed from your saved collection.'):'Browser storage is unavailable. This choice lasts for this visit.');
  });
  document.querySelector('#share-artwork').addEventListener('click',async()=>{
    const link=new URL(location.href);link.hash=`/artwork/${encodeURIComponent(id)}`;
    try {
      if(!navigator.clipboard?.writeText)throw new Error('Clipboard unavailable');
      await navigator.clipboard.writeText(link.href);
      if(disposed)return;
      toast(artwork.local?'Local artwork link copied. It opens only in this browser.':'Artwork link copied.');
    } catch {
      if(disposed)return;
      const dialog=document.createElement('dialog');
      dialog.innerHTML=`<button class="icon-button dialog-close" aria-label="Close share link">${icon('close',16)}</button><h2>Share this work.</h2><p>${artwork.local?'This local artwork is available only in this browser.':'Copy this artwork link.'}</p><label class="field"><span class="field-label">Artwork link</span><input readonly value="${esc(link.href)}"></label>`;
      document.body.append(dialog);dialog.showModal();dialog.querySelector('input').select();
      dialog.querySelector('button').addEventListener('click',()=>dialog.close());dialog.addEventListener('close',()=>dialog.remove());
    }
  });
  const panel=document.querySelector('.viewer-details'), details=document.querySelector('#art-details');
  const toggle=()=>{ panel.hidden=!panel.hidden; details.setAttribute('aria-expanded',String(!panel.hidden)); details.setAttribute('aria-label',panel.hidden?'Show artwork details':'Hide artwork details'); };
  details.addEventListener('click',toggle); panel.querySelector('button').addEventListener('click',()=>{ toggle(); details.focus(); });
  document.querySelector('#fullscreen').addEventListener('click',async()=>{
    try { if(document.fullscreenElement) await document.exitFullscreen(); else if(document.documentElement.requestFullscreen) await document.documentElement.requestFullscreen(); else toast('This browser does not support immersive full screen.'); } catch { toast('Full screen is unavailable in this browser.'); }
  });
  const fullscreenChange=()=>document.querySelector('#fullscreen')?.setAttribute('aria-label',document.fullscreenElement?'Exit full screen':'Enter full screen');
  fullscreenChange();
  const keys=event=>{
    if(event.defaultPrevented||event.altKey||event.ctrlKey||event.metaKey)return;
    if(document.querySelector('dialog[open]') || /INPUT|TEXTAREA|SELECT/.test(event.target.tagName))return;
    if(event.key==='ArrowLeft') {event.preventDefault();document.querySelector('.viewer-prev').click();}
    if(event.key==='ArrowRight') {event.preventDefault();document.querySelector('.viewer-next').click();}
    if(event.key==='Escape'&&!document.fullscreenElement) { if(!panel.hidden) toggle(); else location.hash=lastCollection; }
  };
  document.addEventListener('keydown',keys); document.addEventListener('fullscreenchange',fullscreenChange);
  cleanupPage=()=>{ disposed=true;document.removeEventListener('keydown',keys);document.removeEventListener('fullscreenchange',fullscreenChange); };
}

function showAbout(event) {
  event.preventDefault();
  const dialog=document.createElement('dialog');
  dialog.setAttribute('aria-labelledby','about-title');
  dialog.innerHTML=`<button class="icon-button dialog-close" aria-label="Close our story">${icon('close',18)}</button><span class="eyebrow">AN OPEN HOUSE. AN OPEN MIND.</span><h2 id="about-title">Fashion is a language.<br>Everyone has a voice.</h2><p>Fashion House brings nine creative disciplines under one roof — from a charcoal sketch to a garment that exists only in a virtual world.</p><p>Explore an idea. Discover a different perspective. Give your own work a place to belong.</p><p class="demo-note">This interactive concept includes illustrative sample works and fictional artist profiles. Artwork uploads are stored on your device, with no account or public publishing.</p>${button('Find your medium','#/collection','button-outline')}`;
  document.body.append(dialog);dialog.showModal();
  const close=()=>{dialog.close();dialog.remove();};
  dialog.querySelector('button').addEventListener('click',close);
  dialog.addEventListener('click',e=>{if(e.target===dialog) {const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)close();}});
  dialog.addEventListener('close',()=>dialog.remove());
  dialog.querySelector('a').addEventListener('click',close);
}
function toast(message) {
  const node=document.querySelector('#toast'); clearTimeout(toastTimer);node.textContent=message;node.classList.add('visible');toastTimer=setTimeout(()=>node.classList.remove('visible'),4500);
}
function wireImageFallbacks() {
  document.querySelectorAll('img').forEach(img=>{
    if(img.dataset.errorWired)return;img.dataset.errorWired='true';
    img.addEventListener('error',()=>{
      if(img.dataset.fallback)return; img.dataset.fallback='true';
      if(img.closest('.model-layer,.reference-card')) {toast('A reference image could not load. Please reload the page.');return;}
      if(img.classList.contains('avatar')) {const replacement=document.createElement('span');replacement.className='avatar avatar-fallback';replacement.textContent='FH';replacement.setAttribute('aria-label','Artist portrait unavailable');img.replaceWith(replacement);}
      else {img.src=staticAsset('fashion-collage.png');img.alt+=' (editorial placeholder)';}
    });
  });
}
function render() {
  const hash=location.hash || '#/';
  const anchor=['#mediums','#featured','#process','#archive'].includes(hash)?hash:null;
  const scrollAnchor=behavior=>document.querySelector(anchor)?.scrollIntoView({behavior,block:'start'});
  const markSection = () => {
    const homeLink = document.querySelector('.header-nav a[href="#/"]');
    const categoryLink = document.querySelector('.categories-link');
    if(homeLink && categoryLink) {
      homeLink.classList.toggle('active', !anchor || anchor!=='#mediums');
      categoryLink.classList.toggle('active', anchor==='#mediums');
    }
  };
  if(anchor && document.querySelector(anchor)) {markSection();scrollAnchor(matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth');return;}
  const [path,query='']=hash.replace(/^#\/?/,'').split('?'), params=new URLSearchParams(query);
  cleanupPage();cleanupPage=()=>{};cleanupShared();cleanupMotion();
  document.querySelectorAll('dialog').forEach(dialog=>dialog.remove());
  if(path==='collection')collection(params);
  else if(path==='upload')upload(params);
  else if(path.startsWith('artwork/')) {
    let id;try{id=decodeURIComponent(path.slice(8));}catch{id='';}viewer(id);
  } else home();
  document.body.classList.toggle('is-viewer',path.startsWith('artwork/'));
  if(!path.startsWith('artwork/')&&document.fullscreenElement) document.exitFullscreen().catch(()=>{});
  document.querySelectorAll('[data-about]').forEach(link=>link.addEventListener('click',showAbout));
  cleanupMotion();cleanupMotion=initMotion();cleanupShared=wireSharedUI();wireImageFallbacks();
  window.scrollTo({top:0,behavior:'instant'});
  document.querySelector('#main')?.focus({preventScroll:true});
  if(anchor) {markSection();requestAnimationFrame(()=>scrollAnchor('auto'));}
}
document.querySelector('.skip-link').addEventListener('click',event=>{ event.preventDefault(); document.querySelector('#main')?.focus(); });
window.addEventListener('hashchange',render);
window.addEventListener('beforeunload',()=>ownedUrls.forEach(url=>URL.revokeObjectURL(url)));
await loadLocalArtworks();
render();
