/**
 * Crossfade the reference model between its color and sketch treatments.
 * The button is the stable hit area; CSS transforms only its .model-art child.
 */
const heroInstances = new WeakMap();

export function initHeroModel(root = document) {
  heroInstances.get(root)?.();
  const doc = root.nodeType === 9 ? root : root.ownerDocument;
  const win = doc?.defaultView;
  if (!win) return () => {};

  const reduced = win.matchMedia('(prefers-reduced-motion: reduce)');
  const coarse = win.matchMedia('(pointer: coarse)');
  const cleanups = [];
  const refreshers = [];
  let disposed = false;
  const buttons = [...root.querySelectorAll('[data-hero-model]')];
  if (root.nodeType === 1 && root.matches('[data-hero-model]')) buttons.unshift(root);

  function listen(target, type, callback, options) {
    target.addEventListener(type, callback, options);
    cleanups.push(() => target.removeEventListener(type, callback, options));
  }

  function waitForImage(img) {
    return new Promise(resolve => {
      let finished = false;
      const finish = success => {
        if (finished) return;
        finished = true;
        img.removeEventListener('load', loaded);
        img.removeEventListener('error', failed);
        resolve(success);
      };
      const failed = () => finish(false);
      const loaded = async () => {
        if (!img.naturalWidth) return finish(false);
        try { if (typeof img.decode === 'function') await img.decode(); }
        catch { /* Some browsers reject decode for an already usable image. */ }
        finish(!disposed && img.naturalWidth > 0);
      };
      if (img.complete) loaded();
      else {
        img.addEventListener('load', loaded);
        img.addEventListener('error', failed);
      }
      cleanups.push(() => finish(false));
    });
  }

  for (const button of buttons) {
    const modelArt = button.querySelector('.model-art');
    const layers = [...button.querySelectorAll('.model-color, .model-sketch')];
    const images = [...new Set(layers.flatMap(layer =>
      layer.tagName === 'IMG' ? [layer] : [...layer.querySelectorAll('img')]
    ))];
    const original = {
      pressed: button.getAttribute('aria-pressed'),
      label: button.getAttribute('aria-label'),
      busy: button.getAttribute('aria-busy'),
      type: button.getAttribute('type'),
      sketch: button.classList.contains('is-sketch'),
      ready: button.classList.contains('is-model-ready'),
      rx: modelArt?.style.getPropertyValue('--model-rx') || '',
      ry: modelArt?.style.getPropertyValue('--model-ry') || '',
    };
    let ready = false;
    let failed = false;
    let requestedSketch = original.sketch;
    let intent = 'toggle';
    let hovering = false;
    let lastPointerType = '';
    let frame = 0;
    let rx = 0, ry = 0, targetRx = 0, targetRy = 0;

    if (button.tagName === 'BUTTON') button.type = 'button';
    button.setAttribute('aria-busy', 'true');

    function paint() {
      // Keep the loaded color layer visible until both treatments are decoded.
      button.classList.toggle('is-sketch', ready && requestedSketch);
      button.classList.toggle('is-model-ready', ready);
      button.setAttribute('aria-pressed', String(!failed && requestedSketch));
      button.setAttribute('aria-label', failed
        ? 'Model illustration; sketch view unavailable'
        : requestedSketch ? 'Show model in color' : 'Show model as a sketch');
    }

    function writeTilt() {
      if (!modelArt) return;
      modelArt.style.setProperty('--model-rx', `${rx.toFixed(3)}deg`);
      modelArt.style.setProperty('--model-ry', `${ry.toFixed(3)}deg`);
    }

    function tick() {
      frame = 0;
      if (disposed) return;
      rx += (targetRx - rx) * 0.2;
      ry += (targetRy - ry) * 0.2;
      if (Math.abs(targetRx - rx) < 0.01 && Math.abs(targetRy - ry) < 0.01) {
        rx = targetRx;
        ry = targetRy;
      } else frame = win.requestAnimationFrame(tick);
      writeTilt();
    }

    function scheduleTilt() {
      if (!modelArt || frame || disposed) return;
      frame = win.requestAnimationFrame(tick);
    }

    function resetTilt(immediate = false) {
      targetRx = targetRy = 0;
      if (immediate || reduced.matches || coarse.matches) {
        if (frame) win.cancelAnimationFrame(frame);
        frame = 0;
        rx = ry = 0;
        writeTilt();
      } else scheduleTilt();
    }

    function leave() {
      hovering = false;
      if (intent === 'hover') {
        requestedSketch = false;
        paint();
      }
      resetTilt();
    }

    listen(button, 'pointerenter', event => {
      if (coarse.matches || (event.pointerType && event.pointerType !== 'mouse')) return;
      hovering = true;
      intent = 'hover';
      requestedSketch = true;
      paint();
    }, { passive: true });
    listen(button, 'pointermove', event => {
      if (!ready || reduced.matches || coarse.matches || !hovering
        || (event.pointerType && event.pointerType !== 'mouse')) return;
      const rect = button.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      const x = Math.max(-1, Math.min(1, (event.clientX - rect.left - rect.width / 2) / (rect.width / 2)));
      const y = Math.max(-1, Math.min(1, (event.clientY - rect.top - rect.height / 2) / (rect.height / 2)));
      targetRx = -y * 2;
      targetRy = x * 2;
      scheduleTilt();
    }, { passive: true });
    listen(button, 'pointerleave', leave, { passive: true });
    listen(button, 'pointercancel', leave, { passive: true });
    listen(button, 'pointerdown', event => { lastPointerType = event.pointerType || 'mouse'; }, { passive: true });
    listen(button, 'click', event => {
      // Native button activation supplies Enter/Space and assistive-tech clicks.
      event.preventDefault();
      const pointerType = event.pointerType || lastPointerType;
      if (failed || !(event.detail === 0 || coarse.matches || pointerType === 'touch' || pointerType === 'pen')) return;
      intent = 'toggle';
      requestedSketch = !requestedSketch;
      paint();
    });
    listen(win, 'blur', leave);
    listen(doc, 'visibilitychange', () => { if (doc.hidden) leave(); });

    refreshers.push(() => {
      resetTilt(true);
      if (coarse.matches) leave();
    });

    // Eager-load the overlaid image, which a lazy-loading browser may otherwise
    // postpone. Keep native keyboard activation available throughout decoding.
    images.forEach(img => {
      const loading = img.getAttribute('loading');
      img.loading = 'eager';
      cleanups.push(() => {
        if (loading === null) img.removeAttribute('loading');
        else img.setAttribute('loading', loading);
      });
    });
    Promise.all(images.map(waitForImage)).then(results => {
      if (disposed) return;
      ready = images.length >= 2 && results.every(Boolean);
      failed = !ready;
      if (failed) requestedSketch = false;
      button.removeAttribute('aria-busy');
      paint();
    });
    paint();

    cleanups.push(() => {
      if (frame) win.cancelAnimationFrame(frame);
      button.classList.toggle('is-sketch', original.sketch);
      button.classList.toggle('is-model-ready', original.ready);
      for (const [attribute, value] of [
        ['aria-pressed', original.pressed], ['aria-label', original.label],
        ['aria-busy', original.busy], ['type', original.type],
      ]) {
        if (value === null) button.removeAttribute(attribute);
        else button.setAttribute(attribute, value);
      }
      if (modelArt) {
        if (original.rx) modelArt.style.setProperty('--model-rx', original.rx);
        else modelArt.style.removeProperty('--model-rx');
        if (original.ry) modelArt.style.setProperty('--model-ry', original.ry);
        else modelArt.style.removeProperty('--model-ry');
      }
    });
  }

  const refresh = () => refreshers.forEach(callback => callback());
  for (const query of [reduced, coarse]) {
    if (query.addEventListener) listen(query, 'change', refresh);
    else {
      query.addListener(refresh);
      cleanups.push(() => query.removeListener(refresh));
    }
  }

  function cleanup() {
    if (disposed) return;
    disposed = true;
    cleanups.reverse().forEach(callback => callback());
    if (heroInstances.get(root) === cleanup) heroInstances.delete(root);
  }
  heroInstances.set(root, cleanup);
  return cleanup;
}
