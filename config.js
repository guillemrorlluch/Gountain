// config.js

export async function getMapboxToken() {
  if (typeof window !== 'undefined' && window.__MAPBOX_TOKEN__) {
    return window.__MAPBOX_TOKEN__;
  }
  try {
    const res = await fetch('/api/env', { cache: 'no-store' });
    if (res.ok) {
      const { MAPBOX_TOKEN } = await res.json();
      const token = (MAPBOX_TOKEN || '').trim();
      if (token) {
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
