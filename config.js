// config.js

let CACHED_TOKEN = null;

export async function getMapboxToken() {
  if (CACHED_TOKEN) return CACHED_TOKEN;
  if (typeof window !== 'undefined' && window.__MAPBOX_TOKEN__) {
    return (CACHED_TOKEN = window.__MAPBOX_TOKEN__);
  }
  try {
    const res = await fetch('/api/env', { cache: 'no-store' });
    if (res.ok) {
      const { MAPBOX_TOKEN } = await res.json();
      const token = (MAPBOX_TOKEN || '').trim();
      if (token) {
        CACHED_TOKEN = token;
        if (typeof window !== 'undefined') window.__MAPBOX_TOKEN__ = token;
        return token;
      }
    }
  } catch (_) {}
  return '';
}

export function getBuildId() {
  if (typeof window !== 'undefined' && window.__BUILD_ID__) return window.__BUILD_ID__;
  const id = String(Date.now());
  if (typeof window !== 'undefined') window.__BUILD_ID__ = id;
  return id;
}
