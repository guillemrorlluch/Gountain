// map.js - tokenless MapLibre sources and layers

const protocol = new pmtiles.Protocol();
maplibregl.addProtocol('pmtiles', protocol.tile);
const PMTILES_URL = 'https://r2-public.protomaps.com/protomaps-basemap.pmtiles';
protocol.add(new pmtiles.PMTiles(PMTILES_URL));

const style = {
  version: 8,
  glyphs: 'https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf',
  sources: {
    dem: {
      type: 'raster-dem',
      tiles: [
        'https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png'
      ],
      tileSize: 256,
      maxzoom: 15,
      encoding: 'terrarium'
    },
    topo: {
      type: 'raster',
      tiles: [
        'https://{a,b,c}.tile.opentopomap.org/{z}/{x}/{y}.png'
      ],
      tileSize: 256,
      maxzoom: 17,
      attribution:
        'Map data: © OpenStreetMap contributors, SRTM | Map style: © OpenTopoMap (CC-BY-SA)'
    },
    satellite: {
      type: 'raster',
      tiles: [
        'https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
      ],
      tileSize: 256,
      maxzoom: 19,
      attribution:
        'Imagery © Esri — Source: Esri, Maxar, Earthstar Geographics, and the GIS User Community'
    },
    hillshade: {
      type: 'raster',
      tiles: [
        'https://services.arcgisonline.com/ArcGIS/rest/services/Elevation/World_Hillshade/MapServer/tile/{z}/{y}/{x}'
      ],
      tileSize: 256,
      maxzoom: 19
    },
    protomaps: {
      type: 'vector',
      url: 'pmtiles://' + PMTILES_URL
    },
    contours: {
      type: 'raster',
      tiles: [
        'https://tiles.opentopomap.org/contours/{z}/{x}/{y}.png'
      ],
      tileSize: 256,
      maxzoom: 15
    }
  },
  layers: [
    {
      id: 'satellite-layer',
      type: 'raster',
      source: 'satellite',
      layout: { visibility: 'none' }
    },
    {
      id: 'topo-layer',
      type: 'raster',
      source: 'topo',
      layout: { visibility: 'none' }
    },
    {
      id: 'hillshade-layer',
      type: 'raster',
      source: 'hillshade',
      layout: { visibility: 'none' },
      paint: { 'raster-opacity': 0.25 }
    },
    {
      id: 'pm-admin',
      type: 'line',
      source: 'protomaps',
      'source-layer': 'admin',
      layout: { visibility: 'none' },
      paint: { 'line-color': '#555', 'line-width': 1 }
    },
    {
      id: 'pm-labels',
      type: 'symbol',
      source: 'protomaps',
      'source-layer': 'place',
      layout: {
        visibility: 'none',
        'text-field': ['get', 'name'],
        'text-size': 12,
        'text-font': ['Open Sans Regular', 'Arial Unicode MS Regular']
      },
      paint: {
        'text-color': '#222',
        'text-halo-color': '#fff',
        'text-halo-width': 1
      }
    },
    {
      id: 'contours-layer',
      type: 'raster',
      source: 'contours',
      layout: { visibility: 'none' },
      paint: { 'raster-opacity': 0.3 }
    }
  ]
};

const map = new maplibregl.Map({
  container: 'map',
  style,
  center: [0, 0],
  zoom: 2,
  pitch: 0,
  bearing: 0,
  antialias: true
});

map.on('load', () => {
  const MODE_KEY = 'map-mode';
  const THREE_D_KEY = 'map-3d';
  const CONTOURS_KEY = 'map-contours';

  let currentMode = localStorage.getItem(MODE_KEY) || 'topo';
  let is3D = localStorage.getItem(THREE_D_KEY) === 'true';
  let showContours = localStorage.getItem(CONTOURS_KEY) === 'true';

  function setMode(mode) {
    map.setLayoutProperty('satellite-layer', 'visibility', mode === 'satellite' ? 'visible' : 'none');
    map.setLayoutProperty('topo-layer', 'visibility', mode === 'topo' ? 'visible' : 'none');
    currentMode = mode;
    try { localStorage.setItem(MODE_KEY, mode); } catch {}
  }

  function set3D(enabled) {
    if (enabled) {
      map.setTerrain({ source: 'dem', exaggeration: 1.5 });
      map.setLayoutProperty('hillshade-layer', 'visibility', 'visible');
      map.setPitch(45);
    } else {
      map.setTerrain(null);
      map.setLayoutProperty('hillshade-layer', 'visibility', 'none');
      map.setPitch(0);
    }
    is3D = enabled;
    try { localStorage.setItem(THREE_D_KEY, String(enabled)); } catch {}
  }

  function setContours(visible) {
    map.setLayoutProperty('contours-layer', 'visibility', visible ? 'visible' : 'none');
    showContours = visible;
    try { localStorage.setItem(CONTOURS_KEY, String(visible)); } catch {}
  }

  setMode(currentMode);
  set3D(is3D);
  setContours(showContours);

  const btnMode = document.getElementById('btnMode');
  const btn3d = document.getElementById('btn3d');
  const btnContours = document.getElementById('btnContours');

  if (btnMode) {
    btnMode.addEventListener('click', () => {
      setMode(currentMode === 'topo' ? 'satellite' : 'topo');
    });
  }

  if (btn3d) {
    btn3d.addEventListener('click', () => {
      set3D(!is3D);
    });
  }

  if (btnContours) {
    btnContours.addEventListener('click', () => {
      setContours(!showContours);
    });
  }

  const topbar = document.querySelector('.topbar');
  let debugVisible = false;

  function setDebug(v) {
    map.setLayoutProperty('pm-admin', 'visibility', v ? 'visible' : 'none');
    map.setLayoutProperty('pm-labels', 'visibility', v ? 'visible' : 'none');
    debugVisible = v;
  }

  if (topbar) {
    const btnDebug = document.createElement('button');
    btnDebug.id = 'btnDebug';
    btnDebug.textContent = '🐞';
    btnDebug.setAttribute('aria-label', 'Debug overlay');
    topbar.appendChild(btnDebug);
    btnDebug.addEventListener('click', () => setDebug(!debugVisible));
  }
});
