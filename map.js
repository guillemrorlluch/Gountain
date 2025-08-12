// map.js
import { PMTiles, Protocol } from 'https://unpkg.com/pmtiles@3.0.2/dist/index.js?module';

const protocol = new Protocol();
maplibregl.addProtocol('pmtiles', protocol.tile);
const pmtilesUrl = 'https://protomaps.github.io/pmtiles/planet.pmtiles';
protocol.add(new PMTiles(pmtilesUrl));

const style = {
  version: 8,
  glyphs: 'https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf',
  sources: {
    'terrain-dem': {
      type: 'raster-dem',
      tiles: ['https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png'],
      tileSize: 256,
      maxzoom: 15,
      encoding: 'terrarium'
    },
    'esri-imagery': {
      type: 'raster',
      tiles: ['https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'],
      tileSize: 256,
      attribution: '© Esri'
    },
    'opentopo': {
      type: 'raster',
      tiles: ['https://tile.opentopomap.org/{z}/{x}/{y}.png'],
      tileSize: 256,
      attribution: '© OpenTopoMap'
    },
    'hillshade': {
      type: 'raster',
      tiles: ['https://services.arcgisonline.com/ArcGIS/rest/services/Elevation/World_Hillshade/MapServer/tile/{z}/{y}/{x}'],
      tileSize: 256,
      attribution: '© Esri'
    },
    'protomaps': {
      type: 'vector',
      url: 'pmtiles://' + pmtilesUrl
    },
    'contours': {
      type: 'vector',
      tiles: ['https://demotiles.maplibre.org/contours/{z}/{x}/{y}.pbf'],
      maxzoom: 14
    }
  },
  layers: [
    { id: 'hillshade', type: 'raster', source: 'hillshade', layout: { visibility: 'visible' } },
    { id: 'opentopo', type: 'raster', source: 'opentopo', layout: { visibility: 'visible' } },
    { id: 'satellite', type: 'raster', source: 'esri-imagery', layout: { visibility: 'none' } },
    {
      id: 'pm-label',
      type: 'symbol',
      source: 'protomaps',
      'source-layer': 'place',
      layout: { 'text-field': ['get', 'name'], 'text-size': 12 },
      paint: { 'text-color': '#222', 'text-halo-color': '#fff', 'text-halo-width': 1 }
    },
    {
      id: 'contours-line',
      type: 'line',
      source: 'contours',
      'source-layer': 'contours',
      layout: { visibility: 'none' },
      paint: { 'line-color': '#877b59', 'line-width': 1, 'line-opacity': 0.5 }
    }
  ]
};

const map = new maplibregl.Map({
  container: 'map',
  style,
  center: [10, 28],
  zoom: 3,
  pitch: 0,
  bearing: 0,
  antialias: true
});

window.map = map;

const MODES = ['standard', 'satellite', 'hybrid'];
let mode = localStorage.getItem('mode') || 'standard';
let is3D = localStorage.getItem('is3d') === 'true';
let contours = false;

function applyMode() {
  if (!map.getStyle()) return;
  const satVis = mode === 'satellite' || mode === 'hybrid' ? 'visible' : 'none';
  const topoVis = mode === 'standard' ? 'visible' : 'none';
  map.setLayoutProperty('satellite', 'visibility', satVis);
  map.setLayoutProperty('opentopo', 'visibility', topoVis);
  map.setLayoutProperty('pm-label', 'visibility', mode === 'standard' || mode === 'hybrid' ? 'visible' : 'none');
  localStorage.setItem('mode', mode);
  const btn = document.getElementById('btnMode');
  if (btn) {
    btn.textContent = mode === 'satellite' ? '🛰️' : mode === 'hybrid' ? '🛰️🗺️' : '🗺️';
  }
}

function cycleMode() {
  const idx = MODES.indexOf(mode);
  mode = MODES[(idx + 1) % MODES.length];
  applyMode();
}

function apply3D() {
  if (is3D) {
    map.setTerrain({ source: 'terrain-dem', exaggeration: 1.5 });
  } else {
    map.setTerrain(null);
  }
  localStorage.setItem('is3d', is3D);
  const btn = document.getElementById('btn3d');
  if (btn) btn.classList.toggle('active', is3D);
}

function toggle3D() {
  is3D = !is3D;
  apply3D();
}

function toggleContours() {
  contours = !contours;
  if (map.getLayer('contours-line')) {
    map.setLayoutProperty('contours-line', 'visibility', contours ? 'visible' : 'none');
  }
  const btn = document.getElementById('btnContours');
  if (btn) btn.classList.toggle('active', contours);
}

document.getElementById('btnMode')?.addEventListener('click', cycleMode);
document.getElementById('btn3d')?.addEventListener('click', toggle3D);
document.getElementById('btnContours')?.addEventListener('click', toggleContours);

map.on('load', () => {
  applyMode();
  apply3D();

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      pos => map.jumpTo({ center: [pos.coords.longitude, pos.coords.latitude], zoom: 8 }),
      err => console.warn('geolocation error', err),
      { enableHighAccuracy: true }
    );
  }
});

const DEV = location.search.includes('dev');
if (DEV) {
  const debug = document.createElement('div');
  debug.id = 'debug-overlay';
  Object.assign(debug.style, {
    position: 'absolute',
    top: '0',
    left: '0',
    background: 'rgba(0,0,0,0.5)',
    color: '#fff',
    padding: '4px',
    fontSize: '12px',
    zIndex: 1000
  });
  document.body.appendChild(debug);
  let lastTime = performance.now();
  function updateDebug(now) {
    const dt = now - lastTime;
    lastTime = now;
    const fps = (1000 / dt).toFixed(0);
    debug.textContent = `mode:${mode} zoom:${map.getZoom().toFixed(2)} pitch:${map.getPitch().toFixed(0)} fps:${fps}`;
    requestAnimationFrame(updateDebug);
  }
  requestAnimationFrame(updateDebug);
}
