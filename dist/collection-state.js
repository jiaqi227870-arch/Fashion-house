const storageKey = 'fashion-house-preferences-v1';
let state = { saved: [], views: {} };
try {
  const stored = JSON.parse(localStorage.getItem(storageKey) || 'null');
  if (stored && Array.isArray(stored.saved) && stored.views && typeof stored.views === 'object') {
    state.saved = stored.saved.filter(id => typeof id === 'string');
    state.views = Object.fromEntries(Object.entries(stored.views).filter(([id, count]) => typeof id === 'string' && Number.isSafeInteger(count) && count >= 0));
  }
} catch { /* Browsers that block storage can still browse with in-memory state. */ }

function persist() {
  try { localStorage.setItem(storageKey, JSON.stringify(state)); return true; }
  catch { return false; }
}
export const isSaved = id => state.saved.includes(id);
export const viewCount = id => state.views[id] || 0;
export function recordView(id) {
  state.views[id] = viewCount(id) + 1;
  persist();
}
export function toggleSaved(id) {
  const saved = !isSaved(id);
  state.saved = saved ? [...state.saved, id] : state.saved.filter(item => item !== id);
  return { saved, persisted: persist() };
}
export function rememberCollection(hash) {
  try { sessionStorage.setItem('fashion-house-return', hash); } catch { /* Navigation still works without storage. */ }
}
export function recalledCollection() {
  try {
    const hash = sessionStorage.getItem('fashion-house-return');
    return /^#\/collection(?:\?|$)/.test(hash || '') ? hash : '#/collection';
  } catch { return '#/collection'; }
}
