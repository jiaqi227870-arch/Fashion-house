const { chromium } = require('C:/Users/jiaqi/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs = require('node:fs');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const assert = require('node:assert/strict');
const offlineFile = process.argv[2] || process.env.FH_QA_FILE;
const base = offlineFile ? pathToFileURL(path.resolve(offlineFile)).href : 'http://127.0.0.1:4186';
const output = process.env.FH_QA_OUTPUT || path.join(__dirname, 'output', offlineFile ? 'offline' : '');
const artifact = name => path.join(output, offlineFile ? name.replace(/\.(\w+)$/, '-offline.$1') : name);
const routeUrl = route => offlineFile ? base + route.slice(1) : base + route;
const shortened = url => url.length > 180 ? url.slice(0,180) + '…' : url;
(async()=>{
  if (offlineFile) assert.ok(fs.statSync(offlineFile).isFile(), 'Expected an HTML file');
  fs.mkdirSync(output, {recursive:true});
  const browser = await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});
  try {
  const context = await browser.newContext({viewport:{width:1440,height:1000},deviceScaleFactor:1, ...(offlineFile ? {offline:true} : {})});
  const page = await context.newPage();
  const errors=[]; const checks=[]; const skipped=[]; const resourceErrors=[]; const unexpectedRequests=[];
  page.on('pageerror',error=>errors.push(error.message));
  if (offlineFile) {
    page.on('request', request => {
      const url = new URL(request.url());
      url.hash = '';
      if (url.href !== base && !['data:', 'blob:'].includes(url.protocol)) {
        unexpectedRequests.push(shortened(request.url()));
      }
    });
    page.on('requestfailed', request => resourceErrors.push(`${shortened(request.url())}: ${request.failure()?.errorText}`));
    page.on('response', response => {
      if (response.status() >= 400) resourceErrors.push(`${shortened(response.url())}: HTTP ${response.status()}`);
    });
  }
  const check = (name, value) => {assert.ok(value,name);checks.push(name);console.log('PASS '+name);};
  const pause = ms => page.waitForTimeout(ms);
  const goto = async route => {await page.goto(routeUrl(route),{waitUntil:'networkidle'});await pause(900);};
  const screenshot = async name => {await page.locator('img').evaluateAll(images=>Promise.all(images.filter(image=>image.loading!=='lazy'||image.complete).map(image=>image.decode().catch(()=>{})))); await pause(200); await page.screenshot({path:artifact(name+'.png'),fullPage:true});};
  const reveal = async()=> {for(let y=0;y<await page.evaluate(()=>document.body.scrollHeight);y+=650){await page.evaluate(y=>scrollTo({top:y,behavior:'instant'}),y);await pause(100);}await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}));await pause(1000);};
  await goto('/');
  check('Homepage exposes all nine disciplines',await page.locator('.reference-card').count()===9);
  check('Hero visual loads',await page.locator('.model-color img').evaluate(img=>img.complete&&img.naturalWidth>0));
  if (offlineFile) {
    check('Opened the HTML file directly with the browser offline',await page.evaluate(()=>location.protocol==='file:'&&!navigator.onLine));
    const hero = page.locator('[data-hero-model]');
    await page.waitForSelector('[data-hero-model].is-model-ready');
    check('Both original model images decode',await hero.locator('img').evaluateAll(images=>images.length===2&&images.every(img=>img.complete&&img.naturalWidth>0)));
    await hero.hover();
    await page.waitForFunction(()=>getComputedStyle(document.querySelector('.model-sketch')).opacity==='1');
    check('Hover switches the model to the sketch',await hero.getAttribute('aria-pressed')==='true');
    await page.mouse.move(1,1);
    await page.waitForFunction(()=>getComputedStyle(document.querySelector('.model-color')).opacity==='1');
    check('Mouse leave switches the model back to color',await hero.getAttribute('aria-pressed')==='false');
  }
  await reveal();await screenshot('01-home-desktop');
  if (offlineFile) {
    check('All nine category images decode',await page.locator('.reference-sheet').evaluateAll(images=>images.length===9&&images.every(img=>img.complete&&img.naturalWidth>0)));
    await page.locator('.reference-card[href="#/collection?category=textile"]').click();
    await page.waitForURL(/#\/collection\?category=textile$/);
    await page.locator('#collection-title').waitFor();
    check('A homepage category opens its gallery',await page.locator('#collection-title').textContent()==='Textile Design'&&await page.locator('.art-card').count()===1);
  }
  await goto('/#/collection');
  const artHover=page.locator('.art-card .art-image').first();await artHover.hover();await pause(200);
  check('Artwork-only custom cursor shows',await page.locator('#art-cursor').evaluate(el=>getComputedStyle(el).visibility==='visible'&&getComputedStyle(el).opacity==='1'));
  check('Hero edge light is scoped to hover',await artHover.locator('.edge-light').evaluate(el=>getComputedStyle(el).animationName==='edge-travel'));
  await page.mouse.move(10,110);await pause(200);
  check('Custom cursor hides outside artworks',await page.locator('#art-cursor').evaluate(el=>getComputedStyle(el).opacity==='0'));
  const magnet=page.locator('.figma-collection-actions .button').first();const box=await magnet.boundingBox();await page.mouse.move(box.x+box.width-12,box.y+box.height/2);await pause(300);
  check('Magnetic button responds with spring displacement',Math.abs(await magnet.evaluate(el=>parseFloat(el.style.getPropertyValue('--mx'))))>1);
  await page.locator('.marquee-control').first().click();
  check('Marquee pause control pauses',await page.locator('.marquee-track').first().evaluate(el=>getComputedStyle(el).animationPlayState==='paused'));
  await page.locator('.marquee-control').first().click();
  check('Marquee play resumes while focused',await page.locator('.marquee-track').first().evaluate(el=>getComputedStyle(el).animationPlayState==='running'));
  await goto('/#/collection');
  check('Collection contains 10 sample works',await page.locator('.art-card').count()===10);
  check('Desktop gallery renders five columns',await page.locator('.art-grid').evaluate(el=>getComputedStyle(el).gridTemplateColumns.split(' ').length===5));
  await reveal();await screenshot('02-collection-desktop');
  if (offlineFile) check('Gallery images decode without a network connection',await page.locator('.art-image img').evaluateAll(images=>images.length===10&&images.every(img=>img.complete&&img.naturalWidth>0&&!img.dataset.fallback)));
  await page.getByRole('link',{name:'Textile',exact:true}).click();
  check('Discipline filter works',await page.locator('.art-card').count()===1);
  await page.getByRole('searchbox').fill('no-such-artwork-xyz');
  check('Search empty state works',await page.locator('.empty-state').count()===1);
  await page.getByRole('button',{name:'Clear search'}).click();
  check('Search reset restores filtered results',await page.locator('.art-card').count()===1);
  await goto('/#/upload?category=illustration');await screenshot('03-upload-desktop');
  check('Category passes into upload',await page.locator('select[name=category]').inputValue()==='illustration');
  const uploadHash=await page.evaluate(()=>location.hash);await page.locator('.skip-link').focus();await page.keyboard.press('Enter');
  check('Skip navigation preserves upload route',await page.evaluate(()=>location.hash)===uploadHash);
  await page.locator('#art-file').setInputFiles({name:'not-an-image.txt',mimeType:'text/plain',buffer:Buffer.from('invalid')});await pause(100);
  check('Invalid file type is rejected',await page.locator('#file-error').textContent()==='Please choose a JPG, PNG, or WEBP image.');
  await page.locator('#art-file').setInputFiles(path.join(__dirname,'dist/assets/illustration-study.png'));
  await page.waitForSelector('.upload-preview');
  await page.locator('input[name=title]').fill('QA Paper Silhouette');
  await page.locator('input[name=artist]').fill('Test Artist');
  await page.locator('input[name=media]').fill('Ink on paper');
  await page.locator('textarea[name=statement]').fill('A small exploration of form, fabric, and possibility.');
  const storageError = offlineFile && await page.evaluate(async()=>{
    try {
      await new Promise((resolve,reject)=>{
        const request=indexedDB.open('fashion-house-qa-capability',1);
        request.onupgradeneeded=()=>request.result.createObjectStore('blob-test');
        request.onerror=()=>reject(request.error);
        request.onsuccess=()=>{
          const db=request.result;
          const tx=db.transaction('blob-test','readwrite');
          tx.objectStore('blob-test').put(new Blob(['test']),'key');
          tx.oncomplete=()=>{ db.close();resolve(); };
          tx.onabort=()=>{ db.close();reject(tx.error); };
          tx.onerror=()=>reject(tx.error);
        };
      });
      return '';
    } catch(error) { return `${error.name}: ${error.message}`; }
  });
  if (!storageError) {
  await page.getByRole('button',{name:'SUBMIT ARTWORK'}).click();
  await page.waitForURL(/artwork\/local-/);
  check('Upload opens its full-screen artwork page',await page.locator('.viewer-identity h1').textContent()==='QA Paper Silhouette');
  await page.reload({waitUntil:'networkidle'});
  check('Artwork persists after reload',await page.locator('.viewer-identity h1').textContent()==='QA Paper Silhouette');
  } else {
    skipped.push(`Upload persistence: Chrome blocked file storage (${storageError})`);
    console.log('SKIP '+skipped.at(-1));
    await goto('/#/artwork/chrome-bloom');
  }
  await page.getByRole('button',{name:'Show artwork details'}).click();
  check('Artist statement opens in detail view',await page.locator('.viewer-details').isVisible());
  await page.keyboard.press('Escape');check('Escape closes details first',!await page.locator('.viewer-details').isVisible());
  await page.keyboard.press(storageError ? 'ArrowLeft' : 'ArrowRight');await page.waitForURL(/velvet-horizon/);
  check('Keyboard artwork navigation works',await page.locator('.viewer-identity h1').textContent()==='Velvet Horizon');
  await screenshot('04-artwork-desktop');
  await page.getByRole('button',{name:'Enter full screen'}).click();await pause(200);
  if(await page.evaluate(()=>!!document.fullscreenElement)) {
    await page.keyboard.press('ArrowRight');await pause(200);
    check('Fullscreen state survives artwork navigation',await page.getByRole('button',{name:'Exit full screen'}).count()===1);
    await page.getByRole('link',{name:'Close artwork'}).click();await pause(200);
    check('Leaving artwork exits fullscreen',!await page.evaluate(()=>!!document.fullscreenElement));
  }
  if (!storageError) {
    await goto('/#/collection');await page.getByRole('searchbox').fill('QA Paper Silhouette');
    check('Uploaded work is discoverable in collection',await page.locator('.art-card').count()===1);
  }
  await goto('/#mediums');
  check('Direct medium anchor renders homepage',await page.locator('.reference-card').count()===9);
  await page.setViewportSize({width:390,height:844});
  for(const [route,name] of [['/','01-home-mobile'],['/#/collection','02-collection-mobile'],['/#/upload','03-upload-mobile'],['/#/artwork/velvet-horizon','04-artwork-mobile']]) {
    await goto(route);await reveal();
    check(name+' has no horizontal overflow',await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
    await screenshot(name);
  }
  await page.setViewportSize({width:1440,height:1000});await page.emulateMedia({reducedMotion:'reduce'});await goto('/');
  check('Reduced-motion reveals remain visible',await page.locator('[data-reveal]').evaluateAll(nodes=>nodes.every(node=>getComputedStyle(node).opacity==='1')));
  check('Reduced-motion marquee does not animate',await page.locator('.marquee-track').first().evaluate(el=>getComputedStyle(el).animationName==='none'));
  if (!storageError) await page.evaluate(()=>new Promise((resolve,reject)=>{const request=indexedDB.open('fashion-house',1);request.onsuccess=()=>{const tx=request.result.transaction('artworks','readwrite');tx.objectStore('artworks').clear();tx.oncomplete=resolve;tx.onerror=reject;};request.onerror=reject;}));
  await page.emulateMedia({reducedMotion:'no-preference'});
  await goto('/#/artwork/velvet-horizon');await screenshot('04-artwork-desktop');
  await page.setViewportSize({width:390,height:844});await goto('/#/artwork/velvet-horizon');await screenshot('04-artwork-mobile');
  check('No browser runtime errors: '+JSON.stringify(errors),errors.length===0);
  if (offlineFile) {
    check('No external or sibling-file requests: '+JSON.stringify(unexpectedRequests),unexpectedRequests.length===0);
    check('No failed subresources: '+JSON.stringify(resourceErrors),resourceErrors.length===0);
  }
  const report = artifact('verification.json');
  fs.writeFileSync(report,JSON.stringify({mode:offlineFile?'offline':'hosted',checks,errors,skipped,resourceErrors,unexpectedRequests,passed:checks.length},null,2));
  console.log(`Report: ${report}`);
  } finally { await browser.close(); }
})().catch(error=>{console.error(error);process.exit(1);});
