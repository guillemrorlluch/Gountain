// config.js
export const BUILD_ID =
  (typeof process !== 'undefined' && process.env && process.env.NEXT_PUBLIC_BUILD_ID) ??
  (typeof window !== 'undefined' && window.__BUILD_ID__) ??
  String(Date.now());

const HARD_CODED_TOKEN = ''; // leave empty in prod; you can paste pk... only for quick local tests
export const MAPBOX_TOKEN =
  (typeof process !== 'undefined' && process.env && process.env.NEXT_PUBLIC_MAPBOX_TOKEN) ??
  (typeof window !== 'undefined' && (window.__MAPBOX_TOKEN__ || window.MAPBOX_TOKEN)) ??
  HARD_CODED_TOKEN;

if (typeof window !== 'undefined') {
  window.__BUILD_ID__ = BUILD_ID;
  window.MAPBOX_TOKEN = MAPBOX_TOKEN; // expose for any inline scripts
}

export default { BUILD_ID, MAPBOX_TOKEN };
