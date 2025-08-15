// config.js  ✅ ESM-first + browser fallback
const HARD_CODED_TOKEN = 'pk.eyJ1IjoiZ3VpbGxlcm1vcmxsdWNoIiwiYSI6ImNtZWQzNDZ0cjA0YnQybXM1ZGwyd2t1c2QifQ.Utr765WPrIAc_oPl3T_uGw.';
// Build id for cache-busting (SW, JSON, etc.)
export const BUILD_ID =
  (typeof process !== 'undefined' && process.env && process.env.NEXT_PUBLIC_BUILD_ID) ??
  (typeof window !== 'undefined' && window.__BUILD_ID__) ??
  String(Date.now());

// Mapbox token: prefer env var, then window-injected, then hardcoded (optional)
const HARD_CODED_TOKEN = ''; // ← leave empty (recommended), or paste pk_... only for quick tests

export const MAPBOX_TOKEN =
  (typeof process !== 'undefined' && process.env && process.env.NEXT_PUBLIC_MAPBOX_TOKEN) ??
  (typeof window !== 'undefined' && (window.__MAPBOX_TOKEN__ || window.MAPBOX_TOKEN)) ??
  HARD_CODED_TOKEN;

// Also expose to window for any non-module scripts that expect it
if (typeof window !== 'undefined') {
  window.MAPBOX_TOKEN = MAPBOX_TOKEN;
  window.__BUILD_ID__ = BUILD_ID;
}

// Default export for convenience
export default { BUILD_ID, MAPBOX_TOKEN };
