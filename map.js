// map.js — v14 (sidebar toggle fix, no re-render panels)
import { MAPBOX_TOKEN, getBuildId } from '/dist/config.js';

/* global mapboxgl */
let map;
const healthEl = document.getElementById('map-health');
function setHealth(t){ /* noop, oculto */ }

let __MAPBOX_MOUNTED__ = false;
let listenersAttached = false;

const STYLES = {
  standard: 'mapbox://styles/mapbox/streets-v12',
  satellite: 'mapbox://styles/mapbox/satellite-v9',
  hybrid:   'mapbox://styles/mapbox/satellite-streets-v12'
};

const state = (window.__FILTERS__ = window.__FILTERS__ || {});
state.continent = state.continent || '';

let allDestinations = [];

// =====================================================
// BOOT / MAP INIT
// =====================================================
async function initMapOnce(){
  if (__MAPBOX_MOUNTED__) return;
  __MAPBOX_MOUNTED__ = true;

  const token = MAPBOX_TOKEN;
  if (!token) { setHealth('No token'); alert('Map cannot load (token missing).'); return; }
  if (typeof mapboxgl === 'undefined') { setHealth('Mapbox not loaded'); alert('Mapbox GL JS failed to load.'); return; }

  setHealth('Token OK');
  mapboxgl.accessToken = token;

  map = new mapboxgl.Map({
    container: 'map',
    style: STYLES.standard,
    center: [0, 0],
    zoom: 2
  });

  map.addControl(new mapboxgl.NavigationControl(), 'top-right');
  map.addControl(new mapboxgl.GeolocateControl({
    positionOptions: { enableHighAccuracy: true },
    trackUserLocation: false,
    showUserHeading: false
  }), 'top-right');

  map.on('load', () => {
    enableTerrainAndSky(map);
    buildStyleSwitcher();
    loadDestinos();
    setupPanelToggles();
  });

  map.on('style.load', () => enableTerrainAndSky(map));
}

document.addEventListener('DOMContentLoaded', initMapOnce);

// =====================================================
// TERRAIN + SKY
// =====================================================
function enableTerrainAndSky(m) {
  if (!m.getSource('mapbox-dem')) {
    m.addSource('mapbox-dem', {
      type: 'raster-dem',
      url: 'mapbox://mapbox.mapbox-terrain-dem-v1',
      tileSize: 512,
      maxzoom: 14
    });
  }
  m.setTerrain({ source: 'mapbox-dem', exaggeration: 1.0 });

  if (!m.getLayer('sky')) {
    m.addLayer({
      id: 'sky',
      type: 'sky',
      paint: {
        'sky-type': 'atmosphere',
        'sky-atmosphere-sun': [0.0, 0.0],
        'sky-atmosphere-sun-intensity': 15
      }
    });
  }
}

// =====================================================
// STYLE SWITCHER + 3D
// =====================================================
function buildStyleSwitcher() {
  const host = document.getElementById('basemap-switcher');
  if (!host) return;

  // Construir botones (Standard, Satellite, Hybrid, 3D)
  const defs = [
    ['Standard','standard'],
    ['Satellite','satellite'],
    ['Hybrid','hybrid'],
    ['3D','standard'] // 3D = toggle de pitch/bearing
  ];
  host.innerHTML = '';
  defs.forEach(([label, key]) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.textContent = label;
    b.addEventListener('click', () => {
      if (label === '3D') { toggle3D(); setActive(b); return; } // <-- NO ocultar
      const styleId = STYLES[key];
      if (!styleId) return;
      map.setStyle(styleId);
      map.once('style.load', () => {
        enableTerrainAndSky(map);
        reattachSourcesAndLayers();
      });
      setActive(b); // <-- NO ocultar switcher aquí
    });
    host.appendChild(b);
  });

  function setActive(btn){
    [...host.children].forEach(x => x.classList.toggle('active', x === btn));
  }
  if (host.firstChild) host.firstChild.classList.add('active');

  // Toggle botón Layers (mostrar/ocultar)
  const toggleBtn = document.getElementById('layers-toggle');
  const setPressed = (v) => toggleBtn?.setAttribute('aria-pressed', String(v));
  toggleBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    host.classList.toggle('hidden');
    setPressed(!host.classList.contains('hidden'));
  });

  // No cerrar por clicks dentro del switcher
  host.addEventListener('click', (e) => e.stopPropagation());

  // Auto-ocultar SOLO cuando interactúo con el mapa
  const hideSwitcher = () => { host.classList.add('hidden'); setPressed(false); };
  map.on('mousedown', hideSwitcher);
  map.on('dragstart', hideSwitcher);
  map.on('zoomstart', hideSwitcher);
  map.on('rotate', hideSwitcher);
  map.on('pitchstart', hideSwitcher);
  map.on('click', hideSwitcher);
}

function toggle3D(){
  const pitch = map.getPitch();
  map.easeTo({
    pitch:   pitch === 0 ? 60 : 0,
    bearing: pitch === 0 ? -30 : 0,
    duration: 1000
  });
}

// =====================================================
// SAFE AREAS + AUTOPAN
// =====================================================
const $ = s => document.querySelector(s);
const byId = s => document.getElementById(s);
const isVisible = el => el && getComputedStyle(el).display !== 'none' && !el.classList.contains('hidden');

const isMobile = () => matchMedia('(max-width: 640px)').matches;
const getMarkerGap = () => isMobile() ? 24 : 16;

function getSafeAreas() {
  const topbar   = $('.topbar');
  const sidebar  = byId('sidebar');
  const glossary = byId('glossary');
  const chipbar  = $('.chip-bar') || byId('dest-chips');

  const base = isMobile() ? 28 : 16;

  const top    = (topbar?.offsetHeight || 0) + base;
  const left   = (isVisible(sidebar)  ? sidebar.offsetWidth  : 0) + base;
  const right  = (isVisible(glossary) ? glossary.offsetWidth : 0) + base;

  const chipH  = (chipbar && isVisible(chipbar)) ? chipbar.getBoundingClientRect().height : 0;
  const bottom = Math.max(chipH + base, base + (isMobile() ? 12 : 0));

  return { top, right, bottom, left };
}

// Recentrar el mapa considerando el padding real que deja la UI
function easeToRespectingSafeAreas() {
  if (!map) return;
  const sa = getSafeAreas();

  const p = map.project(map.getCenter());
  const dx = (sa.left - sa.right) / 2;
  const dy = (sa.top  - sa.bottom) / 2;

  const newCenter = map.unproject([p.x + dx, p.y + dy]);

  map.easeTo({
    center: newCenter,
    padding: sa,
    duration: 450,
    easing: t => t * (2 - t)
  });
}

// Ejecuta resize y luego recentra tras el cambio de layout
function scheduleRecenter() {
  if (!map) return;
  requestAnimationFrame(() => {
    map.resize();
    requestAnimationFrame(() => easeToRespectingSafeAreas());
  });
}

function autopanToFitPoint(mapInstance, lngLat, opts = {}) {
  const sa = getSafeAreas();
  const { clientWidth: W, clientHeight: H } = mapInstance.getContainer();
  const p = mapInstance.project(lngLat);

  const leftBound   = sa.left;
  const rightBound  = W - sa.right;
  const topBound    = sa.top;
  const bottomBound = H - sa.bottom;

  let dx = 0, dy = 0;
  if (p.x < leftBound)        dx = leftBound - p.x;
  else if (p.x > rightBound)  dx = rightBound - p.x;
  if (p.y < topBound)         dy = topBound - p.y;
  else if (p.y > bottomBound) dy = bottomBound - p.y;

  if (dx || dy) {
    mapInstance.easeTo({
      center: mapInstance.unproject([p.x + dx, p.y + dy]),
      padding: sa,
      duration: opts.duration ?? 450,
      easing: t => t * (2 - t)
    });
    return true;
  }
  return false;
}

// =====================================================
// Popup inteligente
// =====================================================
const POPUP_CFG = { maxWidthPx: 420 };

function getPopupMeasureEl() {
  let el = document.getElementById('popup-measure');
  if (!el) {
    el = document.createElement('div');
    el.id = 'popup-measure';
    el.style.position = 'fixed';
    el.style.left = '-9999px';
    el.style.top = '-9999px';
    el.style.opacity = '0';
    el.style.pointerEvents = 'none';
    document.body.appendChild(el);
  }
  return el;
}

function measurePopupSize(html) {
  const maxW = Math.min(window.innerWidth * 0.92, POPUP_CFG.maxWidthPx);
  const holder = getPopupMeasureEl();
  holder.style.maxWidth = maxW + 'px';
  holder.innerHTML = `<div class="mapboxgl-popup-content">${html}</div>`;
  const rect = holder.firstChild.getBoundingClientRect();
  const size = { w: Math.ceil(rect.width), h: Math.ceil(rect.height) };
  holder.innerHTML = '';
  return size;
}

function choosePopupAnchor(p, size, sa, W, H, gap = getMarkerGap()) {
  const space = {
    left:   p.x - sa.left  - gap,
    right:  (W - sa.right) - p.x - gap,
    top:    p.y - sa.top   - gap,
    bottom: (H - sa.bottom) - p.y - gap
  };
  if (space.right >= size.w) return 'left';
  if (space.left  >= size.w) return 'right';
  if (space.top    >= size.h) return 'bottom';
  if (space.bottom >= size.h) return 'top';
  const best = Object.entries(space).sort((a,b)=>b[1]-a[1])[0][0];
  return (best === 'right') ? 'left' : (best === 'left') ? 'right' : (best === 'top') ? 'bottom' : 'top';
}

function computePopupBounding(p, size, anchor, gap = getMarkerGap()) {
  switch (anchor) {
    case 'left':   return { x: p.x + gap,          y: p.y - size.h/2, w: size.w, h: size.h };
    case 'right':  return { x: p.x - gap - size.w, y: p.y - size.h/2, w: size.w, h: size.h };
    case 'top':    return { x: p.x - size.w/2,     y: p.y - gap - size.h,       w: size.w, h: size.h };
    case 'bottom': return { x: p.x - size.w/2,     y: p.y + gap,                w: size.w, h: size.h };
    default:       return { x: p.x + gap,          y: p.y - size.h/2, w: size.w, h: size.h };
  }
}

function boundingExcess(b, sa, W, H) {
  const leftBound = sa.left, rightBound = W - sa.right;
  const topBound  = sa.top,  bottomBound = H - sa.bottom;
  let dx = 0, dy = 0;
  if (b.x < leftBound)             dx = leftBound - b.x;
  else if (b.x + b.w > rightBound) dx = rightBound - (b.x + b.w);
  if (b.y < topBound)              dy = topBound - b.y;
  else if (b.y + b.h > bottomBound)dy = bottomBound - (b.y + b.h);
  return { dx, dy };
}

// =====================================================
// POPUP HTML (igual que v13)
// =====================================================
function asPill(t){ return `<span class="pill">${t}</span>`; }
function field(label,val){
  if (val == null) return '';
  const v = String(val).trim();
  if (!v) return '';
  return `<div><strong>${label}</strong> ${v}</div>`;
}

function normalizePhotos(d){
  const c = [d.fotos, d.photos, d.images, d.photo];
  const a = c.flatMap(x => Array.isArray(x) ? x : (x ? [x] : []))
             .filter(u => typeof u === 'string' && u.trim());
  return Array.from(new Set(a));
}

function photosHtml(d){
  const ph = normalizePhotos(d);
  if (!ph.length) return '';
  return `<div class="gallery" role="region" aria-label="Fotos del destino">
    ${ph.map(u => `<img loading="lazy" src="${u}" alt="${d.nombre || 'foto'}" />`).join('')}
  </div>`;
}

function popupHtml(d){
  const title = d.nombre || '';
  const where = d.pais ? ` (${d.pais})` : '';
  const q = encodeURIComponent(`${title}${where ? ' ' + d.pais : ''}`);
  const gUrl = `https://www.google.com/search?q=${q}`;

  const boots = Array.isArray(d.botas) ? d.botas.map(asPill).join('') : '';

  const links = [
    ['AllTrails', d.alltrails],
    ['Wikiloc', d.wikiloc],
    ['Wikipedia', d.wikipedia]
  ].filter(([,u]) => u && String(u).trim());

  const linksHtml = links.length
    ? `<div class="links">${links.map(([L,U]) =>
         `<a class="btn-link" href="${U}" target="_blank" rel="noopener">${L}</a>`
       ).join('')}</div>`
    : '';

  return `<div class="popup">
    <h3><a href="${gUrl}" target="_blank" rel="noopener">${title}${where}</a></h3>
    <div class="grid">
      ${field('Continente', d.continente)}
      ${field('Tipo', d.tipo)}
      ${field('Altitud', d.altitud_m ? `${d.altitud_m} m` : '')}
      ${field('Dificultad', d.dificultad)}
      ${field('Meses', d.meses)}
      ${field('Temp aprox', d.temp_aprox)}
    </div>
    ${boots ? `<div class="section"><strong>Botas:</strong><div class="pills">${boots}</div></div>` : ''}
    <div class="section">
      ${field('Equipo', d.equipo || '—')}
      ${field('Vivac', d.vivac)}
      ${field('Permisos', d.permisos)}
      ${field('Guía', d.guia)}
      ${field('Coste estancia', d.coste_estancia)}
    </div>
    ${field('Reseña', d.resena ? `“${d.resena}”` : '')}
    ${linksHtml}
    ${photosHtml(d)}
  </div>`;
}

// =====================================================
// COLORS + GEO
// =====================================================
const BOOT_COLORS = {
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

function markerColor(d, bootColors = BOOT_COLORS) {
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

const MAP_CONT = new Map([
  ['asia','Asia'], ['áfrica','África'], ['africa','África'],
  ['north america','América del Norte'], ['norteamérica','América del Norte'],
  ['south america','América del Sur'], ['sudamérica','América del Sur'],
  ['antarctica','Antártida'], ['antartida','Antártida'],
  ['europe','Europa'],
  ['oceania','Oceanía'], ['oceanía','Oceanía']
]);

function normalizeContinent(d){
  if (!d.continente) return d;
  const k = String(d.continente).trim().toLowerCase();
  d.continente = MAP_CONT.get(k) || d.continente;
  return d;
}

function buildGeo(list){
  return {
    type: 'FeatureCollection',
    features: list.map(d => {
      const properties = { ...d, color: markerColor(d), html: popupHtml(d) };
      return {
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [d.coords[1], d.coords[0]] },
        properties
      };
    })
  };
}

function updateMapWith(list){
  const geo = buildGeo(list);
  const src = map.getSource('destinos');
  if (src) {
    src.setData(geo);
  } else {
    allDestinations = list;
    reattachSourcesAndLayers();
  }
}

// =====================================================
// SOURCES + LAYERS (clusters, points, labels)
// =====================================================
function reattachSourcesAndLayers() {
  const data = buildGeo(allDestinations.filter(passContinent));

  if (map.getSource('destinos')) {
    if (map.getLayer('cluster-count')) map.removeLayer('cluster-count');
    if (map.getLayer('clusters')) map.removeLayer('clusters');
    if (map.getLayer('unclustered-point')) map.removeLayer('unclustered-point');
    if (map.getLayer('destino-labels')) map.removeLayer('destino-labels');
    map.removeSource('destinos');
  }

  map.addSource('destinos', {
    type: 'geojson',
    data,
    cluster: true,
    clusterRadius: 50,
    clusterMaxZoom: 9
  });

  map.addLayer({
    id: 'clusters',
    type: 'circle',
    source: 'destinos',
    filter: ['has','point_count'],
    paint: {
      'circle-color': '#2b6cb0',
      'circle-radius': ['step', ['get','point_count'], 18, 10, 22, 50, 28, 100, 34, 500, 40],
      'circle-stroke-width': 2,
      'circle-stroke-color': '#fff'
    }
  });

  map.addLayer({
    id: 'cluster-count',
    type: 'symbol',
    source: 'destinos',
    filter: ['has','point_count'],
    layout: { 'text-field':['get','point_count_abbreviated'], 'text-size':14 },
    paint: { 'text-color':'#ffffff' }
  });

  map.addLayer({
    id: 'unclustered-point',
    type: 'circle',
    source: 'destinos',
    filter: ['!',['has','point_count']],
    paint: {
      'circle-radius': 6,
      'circle-color': ['get','color'],
      'circle-stroke-width': 1,
      'circle-stroke-color': '#fff'
    }
  });

  map.addLayer({
    id: 'destino-labels',
    type: 'symbol',
    source: 'destinos',
    filter: ['!',['has','point_count']],
    layout: {
      'text-field': ['get','nombre'],
      'text-size': 12,
      'text-offset': [0, 1.2],
      'text-allow-overlap': true
    },
    paint: { 'text-color': '#e5e7eb', 'text-halo-color':'#111827', 'text-halo-width':1 }
  });

  if (!listenersAttached) {
    map.on('click', 'unclustered-point', onUnclusteredClick);
    map.on('click', 'clusters', onClusterClick);
    map.on('mouseenter', 'clusters', () => map.getCanvas().style.cursor = 'pointer');
    map.on('mouseleave', 'clusters', () => map.getCanvas().style.cursor = '');
    listenersAttached = true;
  }
}

// =====================================================
// openPopupAt (mobile-aware con auto–reencuadre por panBy)
// =====================================================
let __activePopup = null;

function openPopupAt(coords, html, anchor = 'auto') {
  const isMobile = matchMedia('(max-width: 768px)').matches
    || document.body.classList.contains('is-mobile');

  const desktopMaxPx = Math.min(window.innerWidth * 0.92, POPUP_CFG.maxWidthPx);
  const maxW = isMobile ? '78vw' : `${desktopMaxPx}px`;

  const resolvedAnchor = isMobile ? 'bottom' : anchor;
  const gap = getMarkerGap();
  const resolvedOffset = isMobile ? 8 : gap; // un pelín más de aire

  try { __activePopup?.remove?.(); } catch {}

  const popup = new mapboxgl.Popup({
    closeOnMove: isMobile ? false : true,      // importante: false mientras panBy
    offset: resolvedOffset,
    anchor: resolvedAnchor,
    maxWidth: maxW,
    className: 'gountain-popup',
  })
    .setLngLat(coords)
    .setHTML(html)
    .addTo(map);

  // Dimensionado interno seguro
  const sa = getSafeAreas(); // { top, bottom }
  const content = popup.getElement().querySelector('.mapboxgl-popup-content');
  if (content) {
    const maxH = Math.floor(
      window.innerHeight - sa.top - sa.bottom - (isMobile ? 8 : resolvedOffset)
    );
    content.style.maxHeight = `${Math.max(120, maxH)}px`;
    content.style.overflowY = 'auto';
  }

  __activePopup = popup;

  // --- SOLO MÓVIL: panear en píxeles para que el popup quepa completo ---
  if (isMobile) {
    // Espera un frame para tener el layout correcto
    requestAnimationFrame(() => {
      const el = popup.getElement();
      if (!el) return;

      const rect = el.getBoundingClientRect();
      const topbarH = (document.querySelector('.topbar')?.offsetHeight || 0);
      const safeTop = topbarH + 8;                            // margen superior
      const safeBottom = window.innerHeight - (sa.bottom || 0) - 8; // margen inferior

      let dy = 0;
      if (rect.top < safeTop) {
        // popup demasiado alto → bajamos el contenido
        dy = safeTop - rect.top;               // panBy positivo mueve el contenido hacia abajo
      } else if (rect.bottom > safeBottom) {
        // popup se sale por abajo → subimos el contenido
        dy = -(rect.bottom - safeBottom);      // panBy negativo mueve el contenido hacia arriba
      }

      if (dy !== 0) {
        map.panBy([0, dy], { duration: 300, essential: true });
      }
    });
  }

  return popup;
}

// Safe popup opener: usa showHikePopup si existe; si no, usa tu popup de siempre.
function openHikePopup(feature, lngLat) {
  try {
    if (window.showHikePopup) {
      return window.showHikePopup(feature, lngLat);
    }
  } catch (_) {
    // si algo falla, cae al fallback
  }

  // Fallback: tu popup clásico (AJÚSTALO si usas otra plantilla)
  const html = window.renderHikeHTML
    ? renderHikeHTML(feature?.properties || {})
    : `<div>${feature?.properties?.title || ''}</div>`;

  return new mapboxgl.Popup()
    .setLngLat(lngLat)
    .setHTML(html)
    .addTo(map);
}

// =====================================================
// Click handlers
// =====================================================
function onUnclusteredClick(e) {
  const f = e.features && e.features[0];
  if (!f) return;

  const coords = f.geometry.coordinates.slice();
  const html   = f.properties.html || '';

  const sa  = getSafeAreas();
  const gap = getMarkerGap();
  let size = measurePopupSize(html);

  const allowedH = Math.max(120, window.innerHeight - sa.top - sa.bottom - gap);
  size.h = Math.min(size.h, allowedH);

  const { clientWidth: W, clientHeight: H } = map.getContainer();
  const p = map.project(coords);
  const anchor = choosePopupAnchor(p, size, sa, W, H, gap);

  const bbox = computePopupBounding(p, size, anchor, gap);
  const { dx, dy } = boundingExcess(bbox, sa, W, H);

  if (dx || dy) {
    const newCenter = map.unproject([p.x + dx, p.y + dy]);
    map.easeTo({ center: newCenter, padding: sa, duration: 450, easing: t => t * (2 - t) });
    map.once('moveend', () => openPopupAt(coords, html, anchor));
  } else {
    openPopupAt(coords, html, anchor);
  }
}

function onClusterClick(e) {
  const features = map.queryRenderedFeatures(e.point, { layers: ['clusters'] });
  const clusterId = features[0].properties.cluster_id;
  map.getSource('destinos').getClusterExpansionZoom(clusterId, (err, zoom) => {
    if (err) return;
    map.easeTo({ center: features[0].geometry.coordinates, zoom });
  });
}

// =====================================================
// Filters + fit
// =====================================================
function onFiltersChanged() {
  const c = (window.__FILTERS__ && window.__FILTERS__.continent) || '';
  const visible = allDestinations.filter(d => !c || d.continente === c);
  updateMapWith(visible);
  fitToList(visible);
  syncAvailableDestinations(visible);
}
window.addEventListener('gountain:filters-changed', onFiltersChanged);

function passContinent(d){
  if (!state.continent) return true;
  return d.continente === state.continent;
}

function fitToList(list){
  if (!list || !list.length) return;
  const west = Math.min(...list.map(d => d.coords[1]));
  const east = Math.max(...list.map(d => d.coords[1]));
  const south = Math.min(...list.map(d => d.coords[0]));
  const north = Math.max(...list.map(d => d.coords[0]));
  if ([west,east,south,north].some(v => !isFinite(v))) return;
  map.fitBounds([[west, south], [east, north]], { padding: 64, duration: 900, maxZoom: 7.5 });
}

function applyFilters(){
  const visible = allDestinations.filter(passContinent);
  updateMapWith(visible);
  fitToList(visible);
  syncAvailableDestinations(visible);
}

function syncAvailableDestinations(list){
  if (typeof window === 'undefined') return;
  window.__AVAILABLE_DESTINATIONS__ = list;
  window.dispatchEvent(new CustomEvent('gountain:destinations-updated', { detail: list }));
}

async function loadDestinos(){
  try {
    const res = await fetch(`/data/destinos.json?v=${getBuildId()}`, { cache: 'no-store' });
    const data = await res.json();
    allDestinations = data.map(normalizeContinent);
    applyFilters();
  } catch(err){
    console.error('Error loading destinos:', err);
  }
}

// =====================================================
// Panels (toggles) — usa el HTML existente, no renderiza
// =====================================================
function setupPanelToggles() {
  const btnMenu  = byId('btnMenu');
  const btnInfo  = byId('btnInfo');
  const sidebar  = byId('sidebar');
  const glossary = byId('glossary');

  const closeSidebar = () => {
    if (!sidebar) return;
    if (!sidebar.classList.contains('hidden')) {
      sidebar.classList.add('hidden');
      sidebar.setAttribute('inert','');
      btnMenu?.setAttribute('aria-expanded','false');
      scheduleRecenter();
    }
  };

  const openSidebar = () => {
    if (!sidebar) return;
    sidebar.classList.remove('hidden');
    sidebar.removeAttribute('inert');
    btnMenu?.setAttribute('aria-expanded','true');
    if (glossary && !glossary.classList.contains('hidden')) {
      glossary.classList.add('hidden');
      glossary.setAttribute('inert','');
      btnInfo?.setAttribute('aria-expanded','false');
    }
    scheduleRecenter();
  };

  const toggleSidebar = () =>
    sidebar?.classList.contains('hidden') ? openSidebar() : closeSidebar();

  const closeGlossary = () => {
    if (!glossary) return;
    if (!glossary.classList.contains('hidden')) {
      glossary.classList.add('hidden');
      glossary.setAttribute('inert','');
      btnInfo?.setAttribute('aria-expanded','false');
      scheduleRecenter();
    }
  };

  const openGlossary = () => {
    if (!glossary) return;
    glossary.classList.remove('hidden');
    glossary.removeAttribute('inert');
    btnInfo?.setAttribute('aria-expanded','true');
    closeSidebar();
    scheduleRecenter();
  };

  const toggleGlossary = () =>
    glossary?.classList.contains('hidden') ? openGlossary() : closeGlossary();

  btnMenu?.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); toggleSidebar(); });
  btnInfo?.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); toggleGlossary(); });

  window.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    if (glossary && !glossary.classList.contains('hidden')) { closeGlossary(); return; }
    if (sidebar && !sidebar.classList.contains('hidden')) { closeSidebar(); return; }
  });

  const ro = new ResizeObserver(() => map?.resize());
  sidebar && ro.observe(sidebar);
  glossary && ro.observe(glossary);

  if (sidebar?.classList.contains('hidden')) { sidebar.setAttribute('inert',''); btnMenu?.setAttribute('aria-expanded','false'); }
  if (glossary?.classList.contains('hidden')) { glossary.setAttribute('inert',''); btnInfo?.setAttribute('aria-expanded','false'); }
}

// =====================================================
// Filtros básicos integrados (extend passContinent)
// =====================================================
state.filters = state.filters || {};
const __passContinentBase = passContinent;
passContinent = function(d){
  if (!__passContinentBase(d)) return false;

  const f = state.filters || {};
  if (f.dificultad?.length && !f.dificultad.some(tag => (d.dificultad || '').includes(tag))) return false;

  if (f.botas?.length) {
    const boots = Array.isArray(d.botas) ? d.botas : [];
    if (!boots.some(b => f.botas.includes(b))) return false;
  }

  if (f.tipo?.length && !f.tipo.includes(d.tipo)) return false;

  if (f.meses?.length) {
    const m = String(d.meses || '');
    if (!f.meses.some(x => m.includes(x))) return false;
  }

  const minI = byId('alt-min'); const maxI = byId('alt-max');
  const min = minI?.value ? Number(minI.value) : -Infinity;
  const max = maxI?.value ? Number(maxI.value) :  Infinity;
  const alt = Number(d.altitud_m ?? d.altitud ?? NaN);
  if (!Number.isNaN(alt) && !(alt >= min && alt <= max)) return false;

  return true;
};

// ---- Hook select continente (topbar)
(function hookContinentSelect(){
  const sel = byId('continent-select');
  if (!sel) return;
  sel.addEventListener('change', () => {
    state.continent = sel.value || '';
    applyFilters();
  });
})();
