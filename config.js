// config.js
let CACHED_TOKEN = null;

export async function getMapboxToken() {
  // 1) Window-injected or previously set
  if (typeof window !== 'undefined') {
    if (window.__MAPBOX_TOKEN__) return window.__MAPBOX_TOKEN__;
  }
  if (CACHED_TOKEN) return CACHED_TOKEN;

  // 2) Try API route (Vercel function)
  try {
    const r = await fetch('/api/env', { cache: 'no-store' });
    if (r.ok) {
      const { MAPBOX_TOKEN } = await r.json();
      if (MAPBOX_TOKEN && MAPBOX_TOKEN.trim()) {
        CACHED_TOKEN = MAPBOX_TOKEN.trim();
        if (typeof window !== 'undefined') window.__MAPBOX_TOKEN__ = CACHED_TOKEN;
        return CACHED_TOKEN;
      }
    }
  } catch (_) {}

  // 3) Last resort: empty string (caller must handle)
  return '';
}

export function getBuildId() {
  // simple cache-busting id
  if (typeof window !== 'undefined' && window.__BUILD_ID__) return window.__BUILD_ID__;
  const id = String(Date.now());
  if (typeof window !== 'undefined') window.__BUILD_ID__ = id;
  return id;
}
