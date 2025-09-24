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

let allDestinations = [];
let visibleDestinations = [];
let filtersInitialized = false;

// ---- Global Filters State ----
const filtersState = {
  continente: '',
  dificultad: new Set(),
  tipo: new Set(),
  botas: new Set(),
  temporada: new Set(),
  altitud: { min: null, max: null }
};

const norm = v => (v ?? '').toString().trim().toLowerCase();

const toArray = (value) => {
  if (Array.isArray(value)) return value.filter(v => v != null && String(v).trim());
  if (value == null) return [];
  return String(value)
    .split(',')
    .map(v => v.trim())
    .filter(Boolean);
};

const getFilterValues = (set) => Array.from(set).map(norm).filter(Boolean);

const anyInValues = (arrayExpr, values) => {
  if (!values.length) return null;
  if (values.length === 1) return ['in', values[0], arrayExpr];
  return ['any', ...values.map(v => ['in', v, arrayExpr])];
};

function buildMapboxFilter(state = filtersState){
  const clauses = ['all'];

  const cont = norm(state.continente);
  if (cont && cont !== 'todos') {
    clauses.push(['==', ['coalesce', ['get','continente_norm'], ''], cont]);
  }

  const difVals = getFilterValues(state.dificultad);
  if (difVals.length) {
    clauses.push(['in', ['coalesce', ['get','dificultad_norm'], ''], ['literal', difVals]]);
  }

  const tipoVals = getFilterValues(state.tipo);
  if (tipoVals.length) {
    const expr = anyInValues(['coalesce', ['get','tipo_norm'], ['literal', []]], tipoVals);
    if (expr) clauses.push(expr);
  }

  const bootVals = getFilterValues(state.botas);
  if (bootVals.length) {
    const expr = anyInValues(['coalesce', ['get','botas_norm'], ['literal', []]], bootVals);
    if (expr) clauses.push(expr);
  }

  const seasonVals = getFilterValues(state.temporada);
  if (seasonVals.length) {
    const expr = anyInValues(['coalesce', ['get','temporada_norm'], ['literal', []]], seasonVals);
    if (expr) clauses.push(expr);
  }

  const { min, max } = state.altitud || {};
  if (Number.isFinite(min)) clauses.push(['>=', ['coalesce', ['get','altitud_val'], -Infinity], min]);
  if (Number.isFinite(max)) clauses.push(['<=', ['coalesce', ['get','altitud_val'], Infinity], max]);

  return clauses;
}

function toggleSet(set, value, isOn){ if (isOn) set.add(value); else set.delete(value); }
const debounce = (fn, ms = 200) => { let t; return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); }; };

// =====================================================
// BOOT / MAP INIT
// =====================================================
async function initMapOnce(){
  if (__MAPBOX_MOUNTED__) return;
  __MAPBOX_MOUNTED__ = true;

  setupFiltersUI();

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

  const mobileViewport = matchMedia('(max-width: 768px)').matches;
  if (mobileViewport){
    map.dragRotate.disable();
    map.touchZoomRotate.enable();
    map.touchZoomRotate.disableRotation();
    map.setPitch(0);
  }

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

  let lastMove = 0;
  map.on('move', () => {
    const now = performance.now();
    if (now - lastMove < 120) return;
    lastMove = now;
    // placeholder for heavy handlers if needed
  });
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

function renderHikeHTML(props = {}){
  if (!props) return '';
  return props.html || popupHtml(props);
}

function showHikePopup(feature, lngLat){
  const html = renderHikeHTML(feature?.properties || {});
  const isMobileViewport = window.matchMedia('(max-width: 768px)').matches;

  try { __activePopup?.remove?.(); } catch {}

  __activePopup = new mapboxgl.Popup({
    closeButton: true,
    closeOnClick: true,
    closeOnMove: false,
    anchor: isMobileViewport ? 'bottom' : 'auto',
    maxWidth: isMobileViewport ? '90vw' : '400px'
  })
    .setLngLat(lngLat)
    .setHTML(html)
    .addTo(map);

  if (isMobileViewport){
    map.easeTo({
      center: lngLat,
      offset: [0, 120],
      duration: 500,
      essential: true
    });
  }
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

function prepareDestination(raw){
  const base = normalizeContinent({ ...raw });
  const botas = toArray(base.botas);
  const tipo = toArray(base.tipo);
  const seasonSources = [
    base.temporada,
    base.temporadas,
    base.temporada_recomendada,
    base.temporada_optima,
    base.temporada_ideal,
    base.season,
    base.seasons
  ];
  let season = [];
  for (const src of seasonSources) {
    if (season.length) break;
    season = toArray(src);
  }

  const altRaw = base.altitud_m ?? base.altitud ?? null;
  const altNum = Number(altRaw);
  const altitudVal = Number.isFinite(altNum) ? altNum : null;

  return {
    ...base,
    color: markerColor(base),
    html: popupHtml(base),
    continente_norm: norm(base.continente),
    dificultad_norm: norm(base.dificultad),
    tipo_norm: tipo.map(norm).filter(Boolean),
    botas_norm: botas.map(norm).filter(Boolean),
    temporada_norm: season.map(norm).filter(Boolean),
    altitud_val: altitudVal
  };
}

function buildGeo(list){
  return {
    type: 'FeatureCollection',
    features: list.map(d => ({
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [d.coords[1], d.coords[0]] },
      properties: { ...d }
    }))
  };
}

// =====================================================
// SOURCES + LAYERS (clusters, points, labels)
// =====================================================
function reattachSourcesAndLayers() {
  const data = buildGeo(visibleDestinations.length ? visibleDestinations : allDestinations);

  if (map.getSource('hikes')) {
    if (map.getLayer('hikes-cluster-count')) map.removeLayer('hikes-cluster-count');
    if (map.getLayer('hikes-clusters')) map.removeLayer('hikes-clusters');
    if (map.getLayer('hikes-tap-hit')) map.removeLayer('hikes-tap-hit');
    if (map.getLayer('hikes-points')) map.removeLayer('hikes-points');
    if (map.getLayer('hikes-labels')) map.removeLayer('hikes-labels');
    map.removeSource('hikes');
  }

  map.addSource('hikes', {
    type: 'geojson',
    data,
    cluster: true,
    clusterRadius: 50,
    clusterMaxZoom: 10
  });

  map.addLayer({
    id: 'hikes-clusters',
    type: 'circle',
    source: 'hikes',
    filter: ['has','point_count'],
    paint: {
      'circle-color': '#2b6cb0',
      'circle-radius': ['step', ['get','point_count'], 18, 10, 22, 50, 28, 100, 34, 500, 40],
      'circle-stroke-width': 2,
      'circle-stroke-color': '#fff'
    }
  });

  map.addLayer({
    id: 'hikes-cluster-count',
    type: 'symbol',
    source: 'hikes',
    filter: ['has','point_count'],
    layout: { 'text-field':['get','point_count_abbreviated'], 'text-size':14 },
    paint: { 'text-color':'#ffffff' }
  });

  map.addLayer({
    id: 'hikes-points',
    type: 'circle',
    source: 'hikes',
    filter: ['!',['has','point_count']],
    paint: {
      'circle-radius': 6,
      'circle-color': ['get','color'],
      'circle-stroke-width': 1,
      'circle-stroke-color': '#fff'
    }
  });

  map.addLayer({
    id: 'hikes-tap-hit',
    type: 'circle',
    source: 'hikes',
    filter: ['!',['has','point_count']],
    paint: {
      'circle-radius': ['interpolate', ['linear'], ['zoom'], 2, 8, 8, 18],
      'circle-color': 'rgba(0,0,0,0)'
    }
  });

  map.addLayer({
    id: 'hikes-labels',
    type: 'symbol',
    source: 'hikes',
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
    map.on('click', 'hikes-tap-hit', (e) => {
      const feature = e.features?.[0];
      if (!feature) return;
      showHikePopup(feature, e.lngLat);
    });
    map.on('click', 'hikes-clusters', onClusterClick);
    map.on('mouseenter', 'hikes-points', () => map.getCanvas().style.cursor = 'pointer');
    map.on('mouseleave', 'hikes-points', () => map.getCanvas().style.cursor = '');
    map.on('mouseenter', 'hikes-clusters', () => map.getCanvas().style.cursor = 'pointer');
    map.on('mouseleave', 'hikes-clusters', () => map.getCanvas().style.cursor = '');
    listenersAttached = true;
  }

  applyFilters({ fit: false });
}

// =====================================================
// POPUP STATE
// =====================================================
let __activePopup = null;

function onClusterClick(e) {
  const features = map.queryRenderedFeatures(e.point, { layers: ['hikes-clusters'] });
  const clusterId = features[0].properties.cluster_id;
  map.getSource('hikes').getClusterExpansionZoom(clusterId, (err, zoom) => {
    if (err) return;
    map.easeTo({ center: features[0].geometry.coordinates, zoom });
  });
}

// =====================================================
// Filters + fit
// =====================================================

function matchesFilters(item, state = filtersState){
  const cont = norm(state.continente);
  if (cont && cont !== 'todos' && item.continente_norm !== cont) return false;

  const difVals = getFilterValues(state.dificultad);
  if (difVals.length && (!item.dificultad_norm || !difVals.includes(item.dificultad_norm))) return false;

  const tipoVals = getFilterValues(state.tipo);
  if (tipoVals.length) {
    const tipos = item.tipo_norm || [];
    if (!tipos.some(v => tipoVals.includes(v))) return false;
  }

  const bootVals = getFilterValues(state.botas);
  if (bootVals.length) {
    const botas = item.botas_norm || [];
    if (!botas.some(v => bootVals.includes(v))) return false;
  }

  const seasonVals = getFilterValues(state.temporada);
  if (seasonVals.length) {
    const seasons = item.temporada_norm || [];
    if (!seasons.some(v => seasonVals.includes(v))) return false;
  }

  const { min, max } = state.altitud || {};
  const alt = item.altitud_val;
  if (Number.isFinite(min) && !(alt != null && alt >= min)) return false;
  if (Number.isFinite(max) && !(alt != null && alt <= max)) return false;

  return true;
}

function fitToList(list){
  if (!map || !list || !list.length) return;
  const west = Math.min(...list.map(d => d.coords[1]));
  const east = Math.max(...list.map(d => d.coords[1]));
  const south = Math.min(...list.map(d => d.coords[0]));
  const north = Math.max(...list.map(d => d.coords[0]));
  if ([west,east,south,north].some(v => !isFinite(v))) return;
  map.fitBounds([[west, south], [east, north]], { padding: 64, duration: 900, maxZoom: 7.5 });
}

function applyFilters({ fit = true } = {}){
  const filtered = allDestinations.filter(d => matchesFilters(d));
  visibleDestinations = filtered;

  if (!map) return;

  const filterExpr = buildMapboxFilter();
  if (map.getLayer('hikes-points')) map.setFilter('hikes-points', filterExpr);
  if (map.getLayer('hikes-labels')) map.setFilter('hikes-labels', filterExpr);
  if (map.getLayer('hikes-tap-hit')) map.setFilter('hikes-tap-hit', filterExpr);
  if (map.getLayer('hikes-clusters')) map.setFilter('hikes-clusters', ['has','point_count']);
  if (map.getLayer('hikes-cluster-count')) map.setFilter('hikes-cluster-count', ['has','point_count']);

  if (map.getSource('hikes')) {
    map.getSource('hikes').setData(buildGeo(filtered));
  }

  if (fit) fitToList(filtered);
}

function setupFiltersUI(){
  if (filtersInitialized) return;
  filtersInitialized = true;

  const FILTER_OPTIONS = Object.assign({
    dificultad: ['F','PD','AD','D'],
    botas: [
      'Cualquiera','Depende','Bestard Teix Lady GTX','Scarpa Ribelle Lite HD',
      'Scarpa Zodiac Tech LT GTX','La Sportiva Aequilibrium ST GTX',
      'La Sportiva Nepal Cube GTX','Nepal (doble bota técnica de alta montaña)'
    ],
    tipo: ['Travesía','Ascensión','Circular','Lineal','Alpinismo','Scrambling'],
    temporada: ['Invierno','Primavera','Verano','Otoño']
  }, window.__FILTER_OPTIONS__ || {});

  const renderChips = (containerId, options = [], key) => {
    const el = document.getElementById(containerId);
    if (!el) return;
    el.innerHTML = '';
    options.forEach(opt => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'chip';
      btn.dataset.value = opt;
      btn.dataset.key = key;
      btn.textContent = opt;
      btn.setAttribute('aria-pressed', 'false');
      el.appendChild(btn);
    });
  };

  renderChips('filter-dificultad', FILTER_OPTIONS.dificultad, 'dificultad');
  renderChips('filter-botas', FILTER_OPTIONS.botas, 'botas');
  renderChips('filter-tipo', FILTER_OPTIONS.tipo, 'tipo');
  const seasonOptions = FILTER_OPTIONS.temporada || FILTER_OPTIONS.season || [];
  renderChips('filter-season', seasonOptions, 'temporada');

  const bindChipToggle = (selector, set) => {
    const container = document.querySelector(selector);
    container?.addEventListener('click', (e) => {
      const btn = e.target.closest('.chip');
      if (!btn) return;
      const val = btn.dataset.value;
      const nowActive = !btn.classList.contains('is-active');
      btn.classList.toggle('is-active', nowActive);
      btn.setAttribute('aria-pressed', nowActive ? 'true' : 'false');
      toggleSet(set, val, nowActive);
      applyFilters();
    });
  };

  bindChipToggle('#filter-dificultad', filtersState.dificultad);
  bindChipToggle('#filter-tipo', filtersState.tipo);
  bindChipToggle('#filter-botas', filtersState.botas);
  bindChipToggle('#filter-season', filtersState.temporada);

  const altMin = document.getElementById('alt-min');
  const altMax = document.getElementById('alt-max');
  const altChipBox = document.getElementById('altitude-chip');

  const renderAltChip = () => {
    if (!altChipBox) return;
    altChipBox.innerHTML = '';
    const { min, max } = filtersState.altitud || {};
    const hasValues = Number.isFinite(min) || Number.isFinite(max);
    if (!hasValues) return;
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'chip is-active';
    btn.textContent = `${Number.isFinite(min) ? min : '–'}–${Number.isFinite(max) ? max : '–'} m`;
    btn.title = 'Quitar filtro de altitud';
    btn.setAttribute('aria-pressed', 'true');
    btn.addEventListener('click', () => {
      filtersState.altitud = { min: null, max: null };
      if (altMin) altMin.value = '';
      if (altMax) altMax.value = '';
      renderAltChip();
      applyFilters();
    });
    altChipBox.appendChild(btn);
  };

  const updateAlt = debounce(() => {
    const minVal = altMin?.value !== '' ? Number(altMin.value) : null;
    const maxVal = altMax?.value !== '' ? Number(altMax.value) : null;
    const min = Number.isFinite(minVal) ? minVal : null;
    const max = Number.isFinite(maxVal) ? maxVal : null;
    filtersState.altitud = { min, max };
    renderAltChip();
    applyFilters();
  }, 250);

  altMin?.addEventListener('input', updateAlt);
  altMax?.addEventListener('input', updateAlt);

  const selCont = document.getElementById('continent-select');
  selCont?.addEventListener('change', (e) => {
    filtersState.continente = e.target.value || '';
    applyFilters();
  });

  const clearBtn = document.getElementById('clearFilters');
  clearBtn?.addEventListener('click', () => {
    filtersState.continente = '';
    filtersState.dificultad.clear();
    filtersState.tipo.clear();
    filtersState.botas.clear();
    filtersState.temporada.clear();
    filtersState.altitud = { min: null, max: null };

    document.querySelectorAll('#sidebar .chip.is-active').forEach(btn => {
      btn.classList.remove('is-active');
      btn.setAttribute('aria-pressed', 'false');
    });

    if (altMin) altMin.value = '';
    if (altMax) altMax.value = '';
    if (selCont) selCont.value = '';
    renderAltChip();
    applyFilters();
  });

  renderAltChip();
}

async function loadDestinos(){
  try {
    const res = await fetch(`/data/destinos.json?v=${getBuildId()}`, { cache: 'no-store' });
    const data = await res.json();
    allDestinations = data.map(prepareDestination);
    visibleDestinations = [...allDestinations];
    reattachSourcesAndLayers();
    applyFilters({ fit: true });
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

