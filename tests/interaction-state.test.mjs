import test from 'node:test';
import assert from 'node:assert/strict';
import { initHeroModel } from '../dist/hero-interaction.js';

// A small event harness exercises touch, keyboard and loading races without
// depending on a particular browser automation provider.
class Node extends EventTarget {
  constructor() {
    super();
    this.attrs = new Map();
    const classes = new Set();
    this.classList = {
      contains: value => classes.has(value),
      toggle: (value, enabled) => enabled ? classes.add(value) : classes.delete(value),
    };
    const styles = new Map();
    this.style = {
      getPropertyValue: name => styles.get(name) || '',
      setProperty: (name, value) => styles.set(name, value),
      removeProperty: name => styles.delete(name),
    };
  }
  getAttribute(name) { return this.attrs.get(name) ?? null; }
  setAttribute(name, value) { this.attrs.set(name, String(value)); }
  removeAttribute(name) { this.attrs.delete(name); }
}
function harness({ coarse = false, reduced = false, broken = false, decode } = {}) {
  const root = new Node(), win = new Node(), button = new Node(), art = new Node();
  root.nodeType = 9;
  root.defaultView = win;
  win.matchMedia = query => Object.assign(new Node(), { matches: query.includes('coarse') ? coarse : reduced });
  win.requestAnimationFrame = callback => setTimeout(callback, 0);
  win.cancelAnimationFrame = clearTimeout;
  button.tagName = 'BUTTON';
  button.querySelector = () => art;
  button.getBoundingClientRect = () => ({ left: 0, top: 0, width: 400, height: 500 });
  const layers = [0, 1].map(() => {
    const image = Object.assign(new Node(), { complete: true, naturalWidth: broken ? 0 : 1536, decode: decode || (() => Promise.resolve()) });
    return { tagName: 'SPAN', querySelectorAll: () => [image] };
  });
  button.querySelectorAll = () => layers;
  root.querySelectorAll = () => [button];
  const send = (type, fields = {}) => {
    const event = Object.assign(new Event(type, { cancelable: true }), fields);
    button.dispatchEvent(event);
  };
  return { root, button, art, send };
}
const ready = () => new Promise(resolve => setImmediate(resolve));

test('mouse hover reveals the sketch and leaving restores color', async () => {
  const h = harness(), cleanup = initHeroModel(h.root);
  await ready();
  assert.equal(h.button.classList.contains('is-sketch'), false);
  h.send('pointerenter', { pointerType: 'mouse' });
  assert.equal(h.button.getAttribute('aria-pressed'), 'true');
  assert.equal(h.button.classList.contains('is-sketch'), true);
  h.send('pointerleave', { pointerType: 'mouse' });
  assert.equal(h.button.classList.contains('is-sketch'), false);
  cleanup();
});
test('touch activation toggles and stays selected after pointer leaves', async () => {
  const h = harness({ coarse: true }), cleanup = initHeroModel(h.root);
  await ready();
  h.send('pointerenter', { pointerType: 'touch' });
  assert.equal(h.button.classList.contains('is-sketch'), false);
  h.send('pointerdown', { pointerType: 'touch' });
  h.send('click', { pointerType: 'touch', detail: 1 });
  h.send('pointerleave', { pointerType: 'touch' });
  assert.equal(h.button.classList.contains('is-sketch'), true);
  h.send('click', { pointerType: 'touch', detail: 1 });
  assert.equal(h.button.classList.contains('is-sketch'), false);
  cleanup();
});
test('keyboard and assistive activation toggle without hover', async () => {
  const h = harness(), cleanup = initHeroModel(h.root);
  await ready();
  h.send('click', { detail: 0 });
  assert.equal(h.button.getAttribute('aria-label'), 'Show model in color');
  h.send('click', { detail: 0 });
  assert.equal(h.button.getAttribute('aria-label'), 'Show model as a sketch');
  cleanup();
});
test('both image states decode before any crossfade', async () => {
  let resolveDecode;
  const pending = new Promise(resolve => { resolveDecode = resolve; });
  const h = harness({ decode: () => pending }), cleanup = initHeroModel(h.root);
  h.send('pointerenter', { pointerType: 'mouse' });
  assert.equal(h.button.classList.contains('is-sketch'), false);
  resolveDecode();
  await ready();
  assert.equal(h.button.classList.contains('is-sketch'), true);
  cleanup();
});
test('failed image keeps color state and exposes an accessible explanation', async () => {
  const h = harness({ broken: true }), cleanup = initHeroModel(h.root);
  await ready();
  h.send('click', { detail: 0 });
  assert.equal(h.button.classList.contains('is-sketch'), false);
  assert.match(h.button.getAttribute('aria-label'), /unavailable/);
  cleanup();
});
test('reduced motion disables tilt while keeping the content toggle', async () => {
  const h = harness({ reduced: true }), cleanup = initHeroModel(h.root);
  await ready();
  h.send('pointerenter', { pointerType: 'mouse' });
  h.send('pointermove', { pointerType: 'mouse', clientX: 390, clientY: 400 });
  assert.equal(h.button.classList.contains('is-sketch'), true);
  assert.equal(h.art.style.getPropertyValue('--model-rx'), '');
  cleanup();
});
test('cleanup prevents an old page from responding to later events', async () => {
  const h = harness(), cleanup = initHeroModel(h.root);
  await ready();
  cleanup();
  h.send('click', { detail: 0 });
  assert.equal(h.button.classList.contains('is-sketch'), false);
});
test('a disposed page does not paint when its image finishes decoding', async () => {
  let finish;
  const pending = new Promise(resolve => { finish = resolve; });
  const h = harness({ decode: () => pending }), cleanup = initHeroModel(h.root);
  h.send('pointerenter', { pointerType: 'mouse' });
  cleanup();
  finish();
  await ready();
  assert.equal(h.button.classList.contains('is-sketch'), false);
});

test('saved works and view counts persist; corrupt data and unavailable storage are handled', async () => {
  const data = new Map(), sessions = new Map();
  globalThis.localStorage = { getItem: key => data.get(key) || null, setItem: (key, value) => data.set(key, value) };
  globalThis.sessionStorage = { getItem: key => sessions.get(key) || null, setItem: (key, value) => sessions.set(key, value) };
  const state = await import('../dist/collection-state.js?test=first');
  assert.deepEqual(state.toggleSaved('art-one'), { saved: true, persisted: true });
  state.recordView('art-one');
  state.recordView('art-one');
  state.rememberCollection('#/collection?category=illustration&sort=newest');
  const reloaded = await import('../dist/collection-state.js?test=reloaded');
  assert.equal(reloaded.isSaved('art-one'), true);
  assert.equal(reloaded.viewCount('art-one'), 2);
  assert.equal(reloaded.recalledCollection(), '#/collection?category=illustration&sort=newest');
  data.set('fashion-house-preferences-v1', '{broken json');
  const corrupt = await import('../dist/collection-state.js?test=corrupt');
  assert.equal(corrupt.viewCount('art-one'), 0);
  assert.equal(corrupt.isSaved('art-one'), false);
  globalThis.localStorage.setItem = () => { throw new Error('Storage blocked'); };
  assert.deepEqual(corrupt.toggleSaved('art-two'), { saved: true, persisted: false });
  assert.equal(corrupt.isSaved('art-two'), true);
});
