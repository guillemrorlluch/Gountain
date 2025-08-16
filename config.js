// config.js

let CACHED_TOKEN = null;
let TOKEN_PROMISE = null;

export async function getMapboxToken() {
  if (CACHED_TOKEN) return CACHED_TOKEN;
  if (typeof window !== 'undefined' && window.__MAPBOX_TOKEN__) {
    return (CACHED_TOKEN = window.__MAPBOX_TOKEN__);
  }
  if (!TOKEN_PROMISE) {
    TOKEN_PROMISE = fetch('/api/env', { cache: 'no-store' })
      .then(res => (res.ok ? res.json() : {}))
      .then(({ MAPBOX_TOKEN }) => {
        const token = (MAPBOX_TOKEN || '').trim();
        if (token) {
          CACHED_TOKEN = token;
          if (typeof window !== 'undefined') window.__MAPBOX_TOKEN__ = token;
        }
        return token || '';
      })
      .catch(() => '');
  }
  return TOKEN_PROMISE;
}

let BUILD_ID = null;

export function getBuildId() {
  if (typeof window !== 'undefined') {
    return (window.__BUILD_ID__ ||= Date.now().toString());
  }
  return BUILD_ID ||= Date.now().toString();
}
