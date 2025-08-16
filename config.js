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

let BUILD_ID = null;

export function getBuildId() {
  if (typeof window !== 'undefined') {
    return (window.__BUILD_ID__ ||= Date.now().toString());
  }
  return BUILD_ID ||= Date.now().toString();
}
