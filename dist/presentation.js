import { staticAsset } from './asset-url.js';
import { categories, icon } from './data.js';
import { referenceCategories } from './reference-categories.js';

export function sharedHeader(active='home', button) {
  const stage={home:'01 / HOME',collection:'02 / GALLERY',upload:'03 / UPLOAD',artwork:'04 / ARTWORK'}[active] || '01 / HOME';
  return `<header class="site-header figma-header"><div class="header-inner"><a class="brand" href="#/" aria-label="Fashion House home"><span class="brand-wordmark">FASHION HOUSE</span></a><span class="figma-page-index">${stage}</span>${button('BROWSE ART','#/collection','header-explore','arrow-right')}<button class="menu-toggle" type="button" aria-label="Open menu" aria-expanded="false" aria-controls="primary-navigation"><span></span><span></span></button><nav class="header-nav" id="primary-navigation" aria-label="Main navigation"><a class="nav-link" href="#/">Home</a><a class="nav-link categories-link" href="#mediums">Categories</a><a class="nav-link" href="#/collection">Artworks</a><a class="nav-link" href="#/upload">Submit Work</a><a class="nav-link" href="#about" data-about>About</a></nav></div></header><div class="scroll-progress" aria-hidden="true"></div>`;
}
export function sharedFooter() {
  return `<footer class="site-footer figma-footer"><a class="brand" href="#/"><span class="brand-wordmark">FASHION HOUSE</span></a><span>© 2026 ALL RIGHTS RESERVED ★</span><a href="#/upload">SHARE YOUR VISION ↗</a></footer>`;
}
export function sloganMarquee() {
  const phrase='<span>★ FASHION HOUSE ★ ART MEETS COUTURE ★ UPLOAD YOUR VISION ★ BROWSE THE ARCHIVE ★ DIGITAL COUTURE ★ Y2K FOREVER ★&nbsp;</span>';
  return `<div class="marquee slogan-marquee" aria-label="Fashion House. Art meets couture. Upload your vision. Browse the archive."><div class="marquee-track" aria-hidden="true"><div class="marquee-set">${phrase}${phrase}</div><div class="marquee-set">${phrase}${phrase}</div></div><button class="marquee-control" aria-label="Pause marquee" aria-pressed="false">${icon('pause',12)}</button></div>`;
}
export function categoryMarquee() {
  const links=hidden=>categories.map((category,index)=>`<a href="#/collection?category=${category.id}" ${hidden?'tabindex="-1"':''}><small>${String(index+1).padStart(2,'0')}</small>${category.name}<b aria-hidden="true">★</b></a>`).join('');
  return `<div class="marquee category-marquee" aria-label="Explore the nine fashion art categories"><div class="marquee-track"><div class="marquee-set">${links(false)}</div><div class="marquee-set" aria-hidden="true">${links(true)}</div></div><button class="marquee-control" aria-label="Pause marquee" aria-pressed="false">${icon('pause',12)}</button></div>`;
}
export function homepageMarkup({button,header,footer}) {
  return `${header('home')}<main id="main" tabindex="-1" class="figma-home"><section class="hero brand-hero shell"><div class="hero-copy"><div class="hero-kicker" data-reveal>★ EST. Y2K — FASHION ART PLATFORM</div><h1 class="hero-title" aria-label="Fashion House"><span class="title-mask"><span data-reveal>FASHION</span></span><span class="title-mask"><span data-reveal style="--reveal-delay:140ms">HOUSE</span></span></h1><div class="figma-color-bars" aria-hidden="true" data-reveal><i></i><i></i><i></i></div><p class="hero-description" data-reveal style="--reveal-delay:240ms">Where art meets couture — explore, upload, and celebrate every dimension of fashion creativity.</p><div class="hero-actions" data-reveal style="--reveal-delay:320ms">${button('EXPLORE GALLERY ★','#/collection','figma-primary','arrow-right')}${button('SUBMIT WORK','#/upload','figma-secondary','arrow-right')}</div><p class="figma-tags" data-reveal style="--reveal-delay:400ms">#Y2K #Couture #DigitalFashion #ArtHouse #Y2KForever</p></div><div class="model-column"><div class="model-overline"><span>COLOR, UNTIL YOU LOOK CLOSER.</span><span>FH / 01</span></div><button class="hero-model" data-hero-model aria-label="Show model as a sketch" aria-pressed="false" type="button"><span class="model-art"><span class="model-color model-layer"><img src="${staticAsset('hero-model-reference.png')}" width="1536" height="1024" alt="Vivid pink and electric blue fashion illustration of the supplied model" fetchpriority="high"></span><span class="model-sketch model-layer" aria-hidden="true"><img src="${staticAsset('hero-model-reference.png')}" width="1536" height="1024" alt="Vintage pencil sketch of the same model"></span></span></button><div class="model-under"><span class="desktop-model-hint">HOVER TO REVEAL THE SKETCH</span><span class="touch-model-hint">TAP TO SWITCH COLOR / SKETCH</span><span class="model-state"><i></i> COLOR ↔ SKETCH</span></div></div></section>${sloganMarquee()}${categoryMarquee()}${sloganMarquee()}<section class="figma-categories-heading"><p>★ BROWSE BY TYPE</p><div><h2>Categories</h2><span>09</span></div></section>${referenceCategories(categories)}<section class="figma-cta"><div data-reveal><p>READY TO SHARE YOUR VISION?</p><h2>Upload Your Artwork</h2></div>${button('SUBMIT NOW ★','#/upload','figma-green','plus')}</section></main>${footer()}`;
}

export function wireSharedUI() {
  const cleanups=[];
  const nav=document.querySelector('#primary-navigation'), toggle=document.querySelector('.menu-toggle');
  const setMenu=open=>{if(!toggle||!nav)return;toggle.setAttribute('aria-expanded',String(open));toggle.setAttribute('aria-label',open?'Close menu':'Open menu');nav.classList.toggle('is-open',open);document.body.classList.toggle('menu-open',open);};
  if(toggle) {toggle.addEventListener('click',()=>setMenu(toggle.getAttribute('aria-expanded')!=='true'));nav.querySelectorAll('a').forEach(link=>link.addEventListener('click',()=>setMenu(false)));}
  const key=event=>{if(event.key==='Escape'&&toggle?.getAttribute('aria-expanded')==='true'){setMenu(false);toggle.focus();}};
  document.addEventListener('keydown',key);cleanups.push(()=>document.removeEventListener('keydown',key));
  document.querySelectorAll('.marquee').forEach(ticker=>{ticker.querySelector('button')?.addEventListener('click',event=>{const paused=ticker.classList.toggle('paused');event.currentTarget.setAttribute('aria-pressed',String(paused));event.currentTarget.setAttribute('aria-label',paused?'Play marquee':'Pause marquee');event.currentTarget.innerHTML=icon(paused?'play':'pause',14);});});
  document.querySelectorAll('.category-marquee').forEach(ticker=>{
    let focusFrame=0;
    ticker.addEventListener('focusin',event=>{
      const link=event.target.closest('.marquee-set a');
      if(!link)return;
      ticker.classList.add('keyboard-browsing');
      cancelAnimationFrame(focusFrame);
      focusFrame=requestAnimationFrame(()=>link.scrollIntoView({behavior:'instant',block:'nearest',inline:'center'}));
    });
    ticker.addEventListener('focusout',event=>{
      if(!event.relatedTarget?.closest('.marquee-set')) {
        ticker.classList.remove('keyboard-browsing');
        ticker.scrollLeft=0;
      }
    });
    cleanups.push(()=>cancelAnimationFrame(focusFrame));
  });
  const progress=document.querySelector('.scroll-progress');
  let raf=0;
  const update=()=>{raf=0;if(progress){const max=document.documentElement.scrollHeight-innerHeight;progress.style.transform=`scaleX(${max>0?scrollY/max:0})`;}};
  const onScroll=()=>{if(!raf)raf=requestAnimationFrame(update);};
  window.addEventListener('scroll',onScroll,{passive:true});window.addEventListener('resize',onScroll,{passive:true});update();
  cleanups.push(()=>{window.removeEventListener('scroll',onScroll);window.removeEventListener('resize',onScroll);cancelAnimationFrame(raf);document.body.classList.remove('menu-open');});
  return ()=>cleanups.forEach(fn=>fn());
}
