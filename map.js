// map.js — v12
import { MAPBOX_TOKEN, getBuildId } from '/dist/config.js';

/* global mapboxgl */
let map;
const healthEl = document.getElementById('map-health');
function setHealth(t){ if (healthEl) healthEl.textContent = t; }

let __MAPBOX_MOUNTED__ = false;

const STYLES = {
  standard: 'mapbox://styles/mapbox/streets-v12',
  satellite: 'mapbox://styles/mapbox/satellite-v9',
  hybrid:   'mapbox://styles/mapbox/satellite-streets-v12'
};

const state = (window.__FILTERS__ = window.__FILTERS__ || {});
state.continent = state.continent || '';

let allDestinations = [];

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
   SOURCES + LAYERS (clusters, points, labels)
---------------------------- */
function reattachSourcesAndLayers() {
  const data = buildGeo(allDestinations.filter(passContinent));

  if (map.getSource('destinos')) {
    if (map.getLayer('cluster-count'))     map.removeLayer('cluster-count');
    if (map.getLayer('clusters'))          map.removeLayer('clusters');
    if (map.getLayer('unclustered-point')) map.removeLayer('unclustered-point');
    if (map.getLayer('destino-labels'))    map.removeLayer('destino-labels');
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

  const top = map.getStyle().layers.at(-1).id;
  ['clusters','cluster-count','unclustered-point','destino-labels']
    .forEach(id => map.moveLayer(id, top));

  // Re-attach layer-bound events every time (layers are recreated after setStyle)
  ['unclustered-point','clusters'].forEach(layer => {
    map.off('click', layer, onUnclusteredClick);
    map.off('mouseenter', layer, onClusterEnter);
    map.off('mouseleave', layer, onClusterLeave);
  });
  map.on('click', 'unclustered-point', onUnclusteredClick);
  map.on('click', 'clusters', onClusterClick);
  map.on('mouseenter', 'clusters', onClusterEnter);
  map.on('mouseleave', 'clusters', onClusterLeave);

}

function onClusterEnter(){ map.getCanvas().style.cursor = 'pointer'; }
function onClusterLeave(){ map.getCanvas().style.cursor = ''; }

/* ---------------------------
   EVENTS (popup, clusters)
---------------------------- */
function onUnclusteredClick(e) {
  console.log('CLICK FEATURE', e.features?.[0]);
  const f = e.features && e.features[0];
  if (!f) return;

  const coords = f.geometry.coordinates.slice();
  const html = f.properties.html || '';

  const autoPanPadding = { top: 80, right: 28, bottom: 140, left: 28 };

  new mapboxgl.Popup({
    closeOnMove: true,
    offset: 16,
    anchor: 'bottom',
    maxWidth: '420px',
    className: 'gountain-popup'
  })
    .setLngLat(coords)
    .setHTML(html)
    .addTo(map);

  // Nudge view so the popup never clips on mobile chrome/safari UI
  try { map.panBy([0, 0], { padding: autoPanPadding }); } catch {}
}

function onClusterClick(e) {
  const features = map.queryRenderedFeatures(e.point, { layers: ['clusters'] });
  const clusterId = features[0].properties.cluster_id;
  map.getSource('destinos').getClusterExpansionZoom(clusterId, (err, zoom) => {
    if (err) return;
    map.easeTo({ center: features[0].geometry.coordinates, zoom });
  });
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
    features: list.map(d => ({
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [d.coords[1], d.coords[0]] },
      properties: { ...d, color: markerColor(d), html: popupHtml(d) }
    }))
  };
}

/* ---------------------------
   DATA / FILTERS / FIT
---------------------------- */
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

function passContinent(d){
  if (!state.continent) return true;
  return d.continente === state.continent;
}

function fitToList(list){
  if (!list || !list.length) return;
  const west  = Math.min(...list.map(d => d.coords[1]));
  const east  = Math.max(...list.map(d => d.coords[1]));
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
    const res  = await fetch(`/data/destinos.json?v=${getBuildId()}`, { cache: 'no-store' });
    const data = await res.json();
    allDestinations = data.map(normalizeContinent);
    applyFilters();
    renderChips(allDestinations);
  } catch(err){
    console.error('Error loading destinos:', err);
  }
}

/* ---------------------------
   CHIP BAR (responsive list of destination names)
---------------------------- */
function renderChips(list){
  const bar = document.getElementById('chip-bar');
  if (!bar) return;
  bar.innerHTML = '';
  const names = [...new Set(list.map(d => d.nombre).filter(Boolean))];
  names.forEach(name => {
    const chip = document.createElement('div');
    chip.className = 'chip';
    chip.textContent = name;
    chip.addEventListener('click', () => {
      const destino = allDestinations.find(d => d.nombre === name);
      if (destino) {
        map.flyTo({ center: [destino.coords[1], destino.coords[0]], zoom: 8 });
      }
    });
    bar.appendChild(chip);
  });
}
