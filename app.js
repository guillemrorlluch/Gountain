// app.js — v11
import { getBuildId } from './config.js';

// Normaliza etiquetas de dificultad a buckets
export function normalizeDiff(diff) {
  if (!diff) return 'Trek';
  if (diff.startsWith('AD')) return 'AD';
  if (diff.startsWith('PD')) return 'PD';
  if (diff.startsWith('D')) return 'D';
  if (diff.startsWith('F')) return 'F';
  return diff.includes('Trek') ? 'Trek' : diff;
}

// Paleta para botas
export const BOOT_COLORS = {
  "Cualquiera": "#22c55e",
  "Depende": "#f59e0b",
  "Bestard Teix Lady GTX": "#3498db",
  "Scarpa Ribelle Lite HD": "#e74c3c",
  "Scarpa Zodiac Tech LT GTX": "#7f8c8d",
  "La Sportiva Aequilibrium ST GTX": "#9b59b6",
  "La Sportiva Nepal Cube GTX": "#ef4444",
  "Nepal (doble bota técnica de alta montaña)": "#dc2626",
  "Botas triple capa (8000 m+)": "#d97706",
  "Otras ligeras (para trekking no técnico)": "#14b8a6"
};

export function markerColor(d, bootColors = BOOT_COLORS) {
  const pr = [
    'Scarpa Ribelle Lite HD',
    'La Sportiva Aequilibrium ST GTX',
    'Scarpa Zodiac Tech LT GTX',
    'Bestard Teix Lady GTX',
    'La Sportiva Nepal Cube GTX',
    'Nepal (doble bota técnica de alta montaña)',
    'Botas triple capa (8000 m+)',
    'Cualquiera',
    'Depende',
    'Otras ligeras (para trekking no técnico)'
  ];
  for (const p of pr)
    if (Array.isArray(d.botas) && d.botas.includes(p)) return bootColors[p] || '#22c55e';
  return '#22c55e';
}

export function monthsToSeasons(meses) {
  const monthMap = { Jan:1, Feb:2, Mar:3, Apr:4, May:5, Jun:6, Jul:7, Aug:8, Sep:9, Oct:10, Nov:11, Dec:12 };
  if (!meses) return [];
  if (meses.toLowerCase().includes('todo')) return ['Invierno','Primavera','Verano','Otoño'];
  const parts = meses.split(/[–-]/).map(p => p.trim());
  if (parts.length < 2) return [];
  const start = monthMap[parts[0].slice(0,3)];
  const end = monthMap[parts[1].slice(0,3)];
  if (!start || !end) return [];
  const months = [];
  let m = start;
  while (true) {
    months.push(m);
    if (m === end) break;
    m = m % 12 + 1;
  }
  const seasons = new Set();
  months.forEach(mon => {
    if ([12,1,2].includes(mon)) seasons.add('Invierno');
    else if ([3,4,5].includes(mon)) seasons.add('Primavera');
    else if ([6,7,8].includes(mon)) seasons.add('Verano');
    else if ([9,10,11].includes(mon)) seasons.add('Otoño');
  });
  return [...seasons];
}

export function withinFilters(d, F) {
  const cont = F.continente.size === 0 || F.continente.has(d.continente);
  const dif = F.dificultad.size === 0 || F.dificultad.has(normalizeDiff(d.dificultad));
  const tipo = F.tipo.size === 0 || F.tipo.has(d.tipo);
  const botas =
    F.botas.size === 0 || (Array.isArray(d.botas) && d.botas.some(b => F.botas.has(b)));
  const season = F.season.size === 0 || (Array.isArray(d.seasons) && d.seasons.some(s => F.season.has(s)));
  const altMin = F.altitude.min == null || d.altitud_m >= F.altitude.min;
  const altMax = F.altitude.max == null || d.altitud_m <= F.altitude.max;
  return cont && dif && tipo && botas && season && altMin && altMax;
}

export function computeBounds(list) {
  if (!Array.isArray(list) || list.length === 0) return null;
  let west = Infinity, south = Infinity, east = -Infinity, north = -Infinity;
  for (const d of list) {
    const lat = d.coords[0];
    const lng = d.coords[1];
    if (lng < west) west = lng;
    if (lng > east) east = lng;
    if (lat < south) south = lat;
    if (lat > north) north = lat;
  }
  return { west, south, east, north };
}

if (typeof window !== 'undefined') {
  const btnInfo = document.getElementById('btnInfo');
  const glossary = document.getElementById('glossary');
  if (btnInfo && glossary) {
    btnInfo.addEventListener('click', () => {
      glossary.classList.toggle('hidden');
    });
  }

  // ---- Service Worker ----
  if ('serviceWorker' in navigator) {
      window.addEventListener('load', async () => {
        const reg = await navigator.serviceWorker.register(`/sw-v11.js?v=${getBuildId()}`);

        // If there’s a waiting SW, tell it to activate; do NOT await a reply.
        if (reg.waiting) {
          try { reg.waiting.postMessage({ type: 'SKIP_WAITING' }); } catch {}
        }

        reg.addEventListener('updatefound', () => {
          const nw = reg.installing;
          if (!nw) return;
          nw.addEventListener('statechange', () => {
            if (nw.state === 'installed' && reg.waiting) {
              try { reg.waiting.postMessage({ type: 'SKIP_WAITING' }); } catch {}
            }
          });
        });

        navigator.serviceWorker.addEventListener('controllerchange', () => window.location.reload());
      });
  }
}

export default {
  normalizeDiff,
  markerColor,
  withinFilters,
  BOOT_COLORS,
  monthsToSeasons,
  computeBounds
};
