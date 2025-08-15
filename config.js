// config.js
export const BUILD_ID =
  process.env.NEXT_PUBLIC_BUILD_ID ||
  (typeof window !== 'undefined' && window.__BUILD_ID__) ||
  String(Date.now());

export const MAPBOX_TOKEN =
  process.env.NEXT_PUBLIC_MAPBOX_TOKEN ||
  (typeof window !== 'undefined' && window.__MAPBOX_TOKEN__) ||
  '';
