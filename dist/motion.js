/**
 * Small, dependency-free interactions for Fashion House.
 * Call again after a view change; the previous instance on the same root is
 * cleaned automatically. The returned function also supports explicit teardown.
 */
const instances = new WeakMap();

export function initMotion(root = document) {
  instances.get(root)?.();

  const doc = root.nodeType === 9 ? root : root.ownerDocument;
  const win = doc.defaultView;
  if (!win) return () => {};

  const reducedQuery = win.matchMedia('(prefers-reduced-motion: reduce)');
  const coarseQuery = win.matchMedia('(pointer: coarse)');
  const lifetimeCleanups = [];
  let viewCleanup = () => {};
  let disposed = false;

  const collect = selector => {
    const nodes = [...root.querySelectorAll(selector)];
    if (root.nodeType === 1 && root.matches(selector)) nodes.unshift(root);
    return nodes;
  };

  function mount() {
    viewCleanup();
    const cleanups = [];
    const reduced = reducedQuery.matches;
    const interactive = !reduced && !coarseQuery.matches;
    let frame = 0;
    let stopped = false;

    function listen(target, type, callback, options) {
      target.addEventListener(type, callback, options);
      cleanups.push(() => target.removeEventListener(type, callback, options));
    }

    const reveals = collect('[data-reveal]');
    if (reduced || coarseQuery.matches || !('IntersectionObserver' in win)) {
      reveals.forEach(node => node.classList.add('is-visible'));
    } else {
      const observer = new win.IntersectionObserver(entries => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        }
      }, { threshold: 0.08, rootMargin: '0px 0px -24px 0px' });
      reveals.forEach(node => {
        if (!node.classList.contains('is-visible')) observer.observe(node);
      });
      cleanups.push(() => observer.disconnect());
    }

    const magnets = [];
    const artwork = collect('[data-artwork]');
    const artworkCursors = new WeakMap();
    let cursor = null;
    let currentArtwork = null;
    const pointer = { x: 0, y: 0, targetX: 0, targetY: 0 };

    const isMouse = event => !event.pointerType || event.pointerType === 'mouse';
    const near = (a, b) => Math.abs(a - b) < 0.025;

    function schedule() {
      if (!frame && !stopped) frame = win.requestAnimationFrame(tick);
    }

    function tick() {
      frame = 0;
      let moving = false;

      for (const item of magnets) {
        // Damped spring: tactile movement with only a few pixels of travel.
        item.vx = (item.vx + (item.targetX - item.x) * 0.14) * 0.7;
        item.vy = (item.vy + (item.targetY - item.y) * 0.14) * 0.7;
        item.x += item.vx;
        item.y += item.vy;
        const settled = near(item.x, item.targetX) && near(item.y, item.targetY)
          && Math.abs(item.vx) < 0.025 && Math.abs(item.vy) < 0.025;
        if (settled) {
          item.x = item.targetX;
          item.y = item.targetY;
          item.vx = item.vy = 0;
        } else moving = true;
        item.node.style.setProperty('--mx', `${item.x.toFixed(3)}px`);
        item.node.style.setProperty('--my', `${item.y.toFixed(3)}px`);
      }

      if (cursor && currentArtwork) {
        pointer.x += (pointer.targetX - pointer.x) * 0.28;
        pointer.y += (pointer.targetY - pointer.y) * 0.28;
        if (Math.abs(pointer.x - pointer.targetX) > 0.1
          || Math.abs(pointer.y - pointer.targetY) > 0.1) moving = true;
        else {
          pointer.x = pointer.targetX;
          pointer.y = pointer.targetY;
        }
        cursor.style.transform = `translate3d(${pointer.x}px, ${pointer.y}px, 0) translate(-50%, -50%)`;
      }

      if (moving) schedule();
    }

    function hideCursor() {
      if (currentArtwork) {
        currentArtwork.classList.remove('is-hovered');
        currentArtwork.style.cursor = artworkCursors.get(currentArtwork) || '';
        currentArtwork = null;
      }
      if (cursor) {
        cursor.classList.remove('is-active', 'is-pressed');
        cursor.style.opacity = '0';
      }
    }

    function reset() {
      hideCursor();
      magnets.forEach(item => { item.targetX = item.targetY = 0; });
      schedule();
    }

    if (interactive) {
      for (const node of collect('[data-magnetic]')) {
        const originalX = node.style.getPropertyValue('--mx');
        const originalY = node.style.getPropertyValue('--my');
        const item = { node, x: 0, y: 0, vx: 0, vy: 0, targetX: 0, targetY: 0 };
        magnets.push(item);
        listen(node, 'pointermove', event => {
          if (!isMouse(event) || node.disabled) return;
          const rect = node.getBoundingClientRect();
          if (!rect.width || !rect.height) return;
          // The button's hit area stays fixed; only its visual children move.
          const x = (event.clientX - (rect.left + rect.width / 2)) / (rect.width / 2);
          const y = (event.clientY - (rect.top + rect.height / 2)) / (rect.height / 2);
          const distance = Math.max(1, Math.hypot(x, y));
          item.targetX = x / distance * 7;
          item.targetY = y / distance * 7;
          schedule();
        }, { passive: true });
        const release = () => {
          item.targetX = item.targetY = 0;
          schedule();
        };
        listen(node, 'pointerleave', release, { passive: true });
        listen(node, 'pointercancel', release, { passive: true });
        listen(node, 'blur', release);
        cleanups.push(() => {
          if (originalX) node.style.setProperty('--mx', originalX);
          else node.style.removeProperty('--mx');
          if (originalY) node.style.setProperty('--my', originalY);
          else node.style.removeProperty('--my');
        });
      }

      if (artwork.length) {
        cursor = doc.getElementById('art-cursor');
        const createdCursor = !cursor;
        if (!cursor) {
          cursor = doc.createElement('div');
          cursor.id = 'art-cursor';
          cursor.textContent = 'OPEN ↗';
          doc.body.append(cursor);
        }
        const originalStyle = cursor.getAttribute('style');
        const originalAriaHidden = cursor.getAttribute('aria-hidden');
        const originalClassName = cursor.className;
        cursor.setAttribute('aria-hidden', 'true');
        Object.assign(cursor.style, {
          position: 'fixed', top: '0px', left: '0px',
          pointerEvents: 'none', opacity: '0', zIndex: '1000',
        });
        cleanups.push(() => {
          if (createdCursor) cursor.remove();
          else {
            if (originalStyle === null) cursor.removeAttribute('style');
            else cursor.setAttribute('style', originalStyle);
            if (originalAriaHidden === null) cursor.removeAttribute('aria-hidden');
            else cursor.setAttribute('aria-hidden', originalAriaHidden);
            cursor.className = originalClassName;
          }
        });

        for (const node of artwork) {
          const originalX = node.style.getPropertyValue('--pointer-x');
          const originalY = node.style.getPropertyValue('--pointer-y');
          const originalCursor = node.style.cursor;
          artworkCursors.set(node, originalCursor);
          function updatePosition(event) {
            const rect = node.getBoundingClientRect();
            node.style.setProperty('--pointer-x', `${Math.max(0, Math.min(rect.width, event.clientX - rect.left))}px`);
            node.style.setProperty('--pointer-y', `${Math.max(0, Math.min(rect.height, event.clientY - rect.top))}px`);
            pointer.targetX = event.clientX;
            pointer.targetY = event.clientY;
          }
          const enter = event => {
            if (!isMouse(event)) return;
            hideCursor();
            currentArtwork = node;
            node.classList.add('is-hovered');
            node.style.cursor = 'none';
            updatePosition(event);
            pointer.x = pointer.targetX;
            pointer.y = pointer.targetY;
            cursor.style.transform = `translate3d(${pointer.x}px, ${pointer.y}px, 0) translate(-50%, -50%)`;
            cursor.classList.add('is-active');
            cursor.style.opacity = '1';
            schedule();
          };
          listen(node, 'pointerenter', enter, { passive: true });
          listen(node, 'pointermove', event => {
            if (!isMouse(event)) return;
            if (currentArtwork !== node) enter(event);
            updatePosition(event);
            schedule();
          }, { passive: true });
          const leave = () => {
            node.style.cursor = originalCursor;
            node.classList.remove('is-hovered');
            if (currentArtwork === node) hideCursor();
          };
          listen(node, 'pointerleave', leave, { passive: true });
          listen(node, 'pointercancel', leave, { passive: true });
          listen(node, 'pointerdown', () => cursor.classList.add('is-pressed'), { passive: true });
          listen(node, 'pointerup', () => cursor.classList.remove('is-pressed'), { passive: true });
          cleanups.push(() => {
            node.classList.remove('is-hovered');
            node.style.cursor = originalCursor;
            if (originalX) node.style.setProperty('--pointer-x', originalX);
            else node.style.removeProperty('--pointer-x');
            if (originalY) node.style.setProperty('--pointer-y', originalY);
            else node.style.removeProperty('--pointer-y');
          });
        }
      }

      listen(win, 'blur', reset);
      listen(doc, 'visibilitychange', () => { if (doc.hidden) reset(); });
      listen(doc, 'keydown', event => { if (event.key === 'Tab') reset(); });
      listen(win, 'scroll', hideCursor, { passive: true });
    }

    viewCleanup = () => {
      stopped = true;
      if (frame) win.cancelAnimationFrame(frame);
      hideCursor();
      cleanups.reverse().forEach(cleanup => cleanup());
    };
  }

  for (const query of [reducedQuery, coarseQuery]) {
    const onChange = () => { if (!disposed) mount(); };
    if (query.addEventListener) {
      query.addEventListener('change', onChange);
      lifetimeCleanups.push(() => query.removeEventListener('change', onChange));
    } else {
      query.addListener(onChange);
      lifetimeCleanups.push(() => query.removeListener(onChange));
    }
  }

  function cleanup() {
    if (disposed) return;
    disposed = true;
    viewCleanup();
    lifetimeCleanups.forEach(dispose => dispose());
    if (instances.get(root) === cleanup) instances.delete(root);
  }

  instances.set(root, cleanup);
  mount();
  return cleanup;
}
