// config.js

let CACHED_TOKEN = null;

export async function getMapboxToken() {
  if (typeof window !== 'undefined' && window.__MAPBOX_TOKEN__) return window.__MAPBOX_TOKEN__;
  if (CACHED_TOKEN) return CACHED_TOKEN;
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
  } catch {}
  return '';
}

export function getBuildId() {
  if (typeof window !== 'undefined' && window.__BUILD_ID__) return window.__BUILD_ID__;
  const id = String(Date.now());
  if (typeof window !== 'undefined') window.__BUILD_ID__ = id;
  return id;
}
