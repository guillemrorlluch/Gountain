// config.js

let CACHED_TOKEN = null;
let TOKEN_PROMISE = null;

export async function getMapboxToken() {
  if (typeof window !== 'undefined' && window.__MAPBOX_TOKEN__) return window.__MAPBOX_TOKEN__;
  if (CACHED_TOKEN) return CACHED_TOKEN;
}

let BUILD_ID = null;

export function getBuildId() {
  
}