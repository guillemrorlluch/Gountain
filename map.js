// map.js — v13
import { MAPBOX_TOKEN, getBuildId } from '/dist/config.js';

/* global mapboxgl */
let map;
const healthEl = document.getElementById('map-health');
function setHealth(t){ if (healthEl) healthEl.textContent = t; }

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

window.addEventListener('gountain:filters-changed', () => {
  const c = (window.__FILTERS__ && window.__FILTERS__.continent) || '';
  const visible = allDestinations.filter(d => !c || d.continente === c);
  updateMapWith(visible);
  fitToList(visible);
});

/* ---------------------------
   BOOT / MAP INIT
---------------------------- */
async function initMapOnce(){
  if (__MAPBOX_MOUNTED__) return;
  __MAPBOX_MOUNTED__ = true;

  const token = MAPBOX_TOKEN;
  if (!token) {
    setHealth('No token');
    alert('Map cannot load (token missing).');
    return;
  }
  if (typeof mapboxgl === 'undefined') {
    setHealth('Mapbox not loaded');
    alert('Mapbox GL JS failed to load.');
    return;
  }

  setHealth('Token OK');
  mapboxgl.accessToken = token;

  map = new mapboxgl.Map({
    container: 'map',
    style: STYLES.standard,
    center: [0, 0],
    zoom: 2
  });

  map.on('click', ev => console.log('map click', ev.point));

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
  });

  map.on('style.load', () => {
    enableTerrainAndSky(map);
  });
}

document.addEventListener('DOMContentLoaded', initMapOnce);

/* ---------------------------
   TERRAIN + SKY
---------------------------- */
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

/* ---------------------------
   STYLE SWITCHER + 3D
---------------------------- */
function buildStyleSwitcher() {
  const host = document.getElementById('basemap-switcher');
  if (!host) return;

  const buttons = [
    ['Standard','standard'],
    ['Satellite','satellite'],
    ['Hybrid','hybrid'],
    ['3D','standard'] // 3D is a pitch/bearing toggle on the current style
  ];

  host.innerHTML = '';
  buttons.forEach(([label, key]) => {
    const btn = document.createElement('button');
    btn.textContent = label;

    btn.addEventListener('click', () => {
      if (label === '3D') {
        toggle3D();
        setActive(btn);
        return;
      }
      const newStyle = STYLES[key];
      map.setStyle(newStyle);
      map.once('style.load', () => {
        enableTerrainAndSky(map);
        reattachSourcesAndLayers(); // must recreate sources/layers/events
      });
      setActive(btn);
    });

    host.appendChild(btn);
  });

  function setActive(activeBtn) {
    [...host.children].forEach(b => b.classList.toggle('active', b === activeBtn));
  }
  if (host.firstChild) host.firstChild.classList.add('active');
}

function toggle3D(){
  const pitch = map.getPitch();
  map.easeTo({
    pitch:   pitch === 0 ? 60 : 0,
    bearing: pitch === 0 ? -30 : 0,
    duration: 1000
  });
}

/* ---------------------------
   🆕 SAFE AREAS + AUTOPAN (helpers)
---------------------------- */
// Helpers DOM
function $(sel) { return document.querySelector(sel); }
function byId(id) { return document.getElementById(id); }
function isVisible(el) {
  if (!el) return false;
  const cs = getComputedStyle(el);
  return cs.display !== 'none' && !el.classList.contains('hidden') && cs.visibility !== 'hidden';
}

/** Márgenes útiles (px) según UI visible */
function getSafeAreas() {
  const topbar   = $('.topbar');
  const sidebar  = byId('sidebar');
  const glossary = byId('glossary');
  const chipbar  = $('.chip-bar') || byId('dest-chips');

  const top    = (topbar?.offsetHeight || 0) + 16;
  const left   = (isVisible(sidebar)  ? sidebar.offsetWidth  : 0) + 16;
  const right  = (isVisible(glossary) ? glossary.offsetWidth : 0) + 16;
  const bottom = ((chipbar && isVisible(chipbar)) ? chipbar.getBoundingClientRect().height : 0) + 16;

  return { top, right, bottom, left };
}

/** Autopan rápido para encajar un punto dentro del rectángulo útil */
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

  if (dx !== 0 || dy !== 0) {
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

/* -----------------------------------------
   🆕 Popup inteligente: medida + anclaje + bbox
------------------------------------------*/
const POPUP_CFG = {
  maxWidthPx: 420,   // mismo límite que tu CSS (26.25rem)
  markerGap: 16      // separación entre marcador y card
};

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

function choosePopupAnchor(p, size, sa, W, H, gap = POPUP_CFG.markerGap) {
  const space = {
    left:   p.x - sa.left  - gap,
    right:  (W - sa.right) - p.x - gap,
    top:    p.y - sa.top   - gap,
    bottom: (H - sa.bottom) - p.y - gap
  };
  if (space.right >= size.w) return 'left';   // card a la derecha del punto
  if (space.left  >= size.w) return 'right';  // card a la izquierda del punto
  if (space.top    >= size.h) return 'bottom';
  if (space.bottom >= size.h) return 'top';
  const entries = Object.entries(space).sort((a,b)=>b[1]-a[1]);
  const best = entries[0][0];
  return (best === 'right') ? 'left' :
         (best === 'left')  ? 'right' :
         (best === 'top')   ? 'bottom' : 'top';
}

function computePopupBounding(p, size, anchor, gap = POPUP_CFG.markerGap) {
  switch (anchor) {
    case 'left':   return { x: p.x + gap,            y: p.y - size.h/2, w: size.w, h: size.h };
    case 'right':  return { x: p.x - gap - size.w,   y: p.y - size.h/2, w: size.w, h: size.h };
    case 'top':    return { x: p.x - size.w/2,       y: p.y - gap - size.h,       w: size.w, h: size.h };
    case 'bottom': return { x: p.x - size.w/2,       y: p.y + gap,                w: size.w, h: size.h };
    default:       return { x: p.x + gap,            y: p.y - size.h/2, w: size.w, h: size.h };
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

/* ---------------------------
   POPUP HTML
---------------------------- */
function asPill(t){ return `<span class="pill">${t}</span>`; }
function field(label,val){
  if (val == null) return '';
  const v = String(val).trim();
  if (!v) return '';
  return `<div><strong>${label}</strong> ${v}</div>`;
}

function normalizePhotos(d){
  const c = [d.fotos, d.photos, d.images, d.photo];
  const a = c
    .flatMap(x => Array.isArray(x) ? x : (x ? [x] : []))
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

/* ---------------------------
   COLORS + GEO
---------------------------- */
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
      console.assert(properties.html, 'Missing popup HTML for', d);
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

/* ---------------------------
   SOURCES + LAYERS (clusters, points, labels)
---------------------------- */
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

/* ---------------------------
   🆕 openPopupAt con anclaje dinámico
---------------------------- */
function openPopupAt(coords, html, anchor = 'auto') {
  const maxW = Math.min(window.innerWidth * 0.92, POPUP_CFG.maxWidthPx);
  new mapboxgl.Popup({
    closeOnMove: true,
    offset: POPUP_CFG.markerGap,
    anchor,                          // anclaje dinámico elegido
    maxWidth: `${maxW}px`,
    className: 'gountain-popup',
  })
    .setLngLat(coords)
    .setHTML(html)
    .addTo(map);
}

/* ---------------------------
   🆕 Click en punto: medir → anclar → autopan mínimo → abrir
---------------------------- */
function onUnclusteredClick(e) {
  const f = e.features && e.features[0];
  if (!f) return;

  const coords = f.geometry.coordinates.slice();
  const html   = f.properties.html || '';

  // 1) Medir popup con HTML real (máx. ancho responsive)
  const size = measurePopupSize(html);

  // 2) Elegir anclaje según aire disponible (incluye safe areas)
  const sa = getSafeAreas();
  const { clientWidth: W, clientHeight: H } = map.getContainer();
  const p = map.project(coords);
  const anchor = choosePopupAnchor(p, size, sa, W, H);

  // 3) Calcular bbox del popup y ver si se sale. Si sí, autopan mínimo.
  const bbox = computePopupBounding(p, size, anchor);
  const { dx, dy } = boundingExcess(bbox, sa, W, H);

  if (dx || dy) {
    const newCenter = map.unproject([p.x + dx, p.y + dy]);
    map.easeTo({
      center: newCenter,
      padding: sa,
      duration: 450,
      easing: t => t * (2 - t)
    });
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

/* =========================================================
   Panels (Sidebar filters & Glossary) + Filters logic
========================================================= */

function setupPanelToggles() {
  const btnMenu  = document.getElementById('btnMenu');
  const btnInfo  = document.getElementById('btnInfo');
  const sidebar  = document.getElementById('sidebar');
  const glossary = document.getElementById('glossary');

  console.debug('[UI] wiring panel toggles', { btnMenu: !!btnMenu, btnInfo: !!btnInfo, sidebar: !!sidebar, glossary: !!glossary });

  if (btnMenu && sidebar) {
    btnMenu.addEventListener('click', (e) => {
      e.preventDefault(); e.stopPropagation();
      sidebar.classList.toggle('hidden');
      if (!sidebar.classList.contains('hidden') && glossary) glossary.classList.add('hidden');
    });
  }

  if (btnInfo && glossary) {
    btnInfo.addEventListener('click', (e) => {
      e.preventDefault(); e.stopPropagation();
      glossary.classList.toggle('hidden');
      if (!glossary.classList.contains('hidden') && sidebar) sidebar.classList.add('hidden');
    });
  }

  /* Fallback por si el DOM cambia en runtime (delegación) */
  document.body.addEventListener('click', (e) => {
    const m = e.target.closest && e.target.closest('#btnMenu');
    const i = e.target.closest && e.target.closest('#btnInfo');
    if (m && sidebar) {
      e.preventDefault(); e.stopPropagation();
      sidebar.classList.toggle('hidden');
      if (!sidebar.classList.contains('hidden') && glossary) glossary.classList.add('hidden');
    }
    if (i && glossary) {
      e.preventDefault(); e.stopPropagation();
      glossary.classList.toggle('hidden');
      if (!glossary.classList.contains('hidden') && sidebar) sidebar.classList.add('hidden');
    }
  });
}

function renderSidebarPanel() {
  const el = document.getElementById('sidebar');
  if (!el) return;
  el.innerHTML = `
    <div class="panel-section">
      <h2>Filtros</h2>

      <details open>
        <summary>Dificultad</summary>
        <div id="filter-dificultad" class="chips"></div>
      </details>

      <details>
        <summary>Botas</summary>
        <div id="filter-botas" class="chips"></div>
      </details>

      <details>
        <summary>Tipo</summary>
        <div id="filter-tipo" class="chips"></div>
      </details>

      <details>
        <summary>Altitud (m)</summary>
        <div class="altitude-inputs">
          <label for="alt-min">Min</label>
          <input id="alt-min" class="input" type="number" inputmode="numeric" placeholder="0">
          <label for="alt-max">Max</label>
          <input id="alt-max" class="input" type="number" inputmode="numeric" placeholder="9000">
        </div>
      </details>

      <details>
        <summary>Temporada</summary>
        <div id="filter-season" class="chips"></div>
      </details>

      <button id="clearFilters" class="btn">Limpiar filtros</button>
    </div>
  `;

  putChips('filter-dificultad', ['F','PD','AD','D'], v => toggleFilter('dificultad', v));
  putChips('filter-botas', [
    'Bestard Teix Lady GTX','Scarpa Ribelle Lite HD','Scarpa Zodiac Tech LT GTX',
    'La Sportiva Aequilibrium ST GTX','La Sportiva Nepal Cube GTX','Nepal (doble bota técnica de alta montaña)',
    'Botas triple capa (8000 m+)','Cualquiera','Depende','Otras ligeras (para trekking no técnico)'
  ], v => toggleFilter('botas', v));
  putChips('filter-tipo', ['Pico','Travesía','Volcán','Glaciar'], v => toggleFilter('tipo', v));
  putChips('filter-season', ['Jan–Mar','Apr–Jun','Jul–Sep','Oct–Dec'], v => toggleFilter('meses', v));

  const minI = document.getElementById('alt-min');
  const maxI = document.getElementById('alt-max');
  [minI, maxI].forEach(i => i && i.addEventListener('change', applyFilters));

  const clear = document.getElementById('clearFilters');
  clear && clear.addEventListener('click', () => {
    state.filters = {};
    if (minI) minI.value = '';
    if (maxI) maxI.value = '';
    document.querySelectorAll('#sidebar .chip.active').forEach(c => c.classList.remove('active'));
    applyFilters();
  });
}

function renderGlossaryPanel() {
  const el = document.getElementById('glossary');
  if (!el) return;
  el.innerHTML = `
    <div class="panel-section">
      <h2>Glosario</h2>

      <details open>
        <summary>Siglas</summary>
        <ul>
          <li><b>PN</b>: Parque Nacional</li>
          <li><b>UIAA</b>: Escala de dificultad</li>
          <li><b>F</b> Fácil · <b>PD</b> Poco Difícil · <b>AD</b> Bastante Difícil · <b>D</b> Difícil</li>
          <li><b>Vivac</b>: pernocta ligera</li>
          <li><b>Scrambling</b>: progresión sin ser deportiva</li>
        </ul>
      </details>

      <details open>
        <summary>Leyenda de botas</summary>
        <ul id="legend-botas"></ul>
      </details>
    </div>
  `;

  const ul = el.querySelector('#legend-botas');
  if (ul && typeof BOOT_COLORS === 'object') {
    ul.innerHTML = Object.entries(BOOT_COLORS)
      .map(([name, color]) =>
        `<li style="display:flex;align-items:center;gap:8px;margin:6px 0">
           <span style="width:14px;height:14px;border-radius:3px;background:${color};display:inline-block;border:1px solid #00000022"></span>
           <span>${name}</span>
         </li>`
      ).join('');
  }
}

/* ---- helpers de chips/filtros ---- */
state.filters = state.filters || {};

function putChips(hostId, values, onClick){
  const host = document.getElementById(hostId);
  if (!host) return;
  host.innerHTML = '';
  values.forEach(v => {
    const c = document.createElement('button');
    c.className = 'chip';
    c.type = 'button';
    c.textContent = v;
    c.addEventListener('click', () => {
      c.classList.toggle('active');
      onClick && onClick(v);
      applyFilters();
    });
    host.appendChild(c);
  });
}

function toggleFilter(key, value){
  const s = new Set(state.filters[key] || []);
  if (s.has(value)) s.delete(value); else s.add(value);
  state.filters[key] = [...s];
}

/* ---- Extiende passContinent con filtros básicos ---- */
const __passContinentBase = passContinent;
passContinent = function(d){
  if (!__passContinentBase(d)) return false;

  const f = state.filters || {};

  if (f.dificultad?.length) {
    if (!f.dificultad.some(tag => (d.dificultad || '').includes(tag))) return false;
  }
  if (f.botas?.length) {
    const boots = Array.isArray(d.botas) ? d.botas : [];
    if (!boots.some(b => f.botas.includes(b))) return false;
  }
  if (f.tipo?.length) {
    if (!f.tipo.includes(d.tipo)) return false;
  }
  if (f.meses?.length) {
    const m = String(d.meses || '');
    if (!f.meses.some(x => m.includes(x))) return false;
  }
  const minI = document.getElementById('alt-min');
  const maxI = document.getElementById('alt-max');
  const min = minI?.value ? Number(minI.value) : -Infinity;
  const max = maxI?.value ? Number(maxI.value) : Infinity;
  const alt = Number(d.altitud_m ?? d.altitud ?? NaN);
  if (!Number.isNaN(alt) && !(alt >= min && alt <= max)) return false;

  return true;
};

/* ---- Select de continente (topbar) ---- */
(function hookContinentSelect(){
  const sel = document.getElementById('continent-select');
  if (!sel) return;
  sel.addEventListener('change', () => {
    state.continent = sel.value || '';
    applyFilters();
  });
})();

/* ---- Inicializa paneles (si el DOM ya está listo, corre ya) ---- */
function ready(fn){
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', fn, { once:true });
  } else {
    fn();
  }
}
ready(() => {
  setupPanelToggles();
  renderSidebarPanel();
  renderGlossaryPanel();
});
