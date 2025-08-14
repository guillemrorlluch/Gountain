// map.js - tokenless MapLibre sources and layers

// --- PMTiles protocol ---
const protocol = new pmtiles.Protocol();
maplibregl.addProtocol('pmtiles', protocol.tile);
const PMTILES_URL = 'https://r2-public.protomaps.com/protomaps-basemap.pmtiles';
protocol.add(new pmtiles.PMTiles(PMTILES_URL));

// --- Helpers for markers ---
function markerColor(d) {
  return '#22c55e';
}

function popupHtml(d) {
  const name = d.nombre || '';
  const country = d.pais || '';
  const alt = d.altitud_m != null ? d.altitud_m : '?';
  return `<strong>${name}</strong><br>${country} — ${alt} m`;
}

function computeBounds(list) {
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

// --- Base style ---
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

// --- Map instance ---
const mlMap = new maplibregl.Map({
  container: 'map',
  style,
  center: [0, 0],
  zoom: 2,
  pitch: 0,
  bearing: 0,
  antialias: true
});

window.mlMap = mlMap;

let destData = [];

function addDestinations() {
  const geojson = {
    type: 'FeatureCollection',
    features: destData.map(d => ({
      type: 'Feature',
      properties: { color: markerColor(d), popup: popupHtml(d) },
      geometry: { type: 'Point', coordinates: [d.coords[1], d.coords[0]] }
    }))
  };

  if (mlMap.getSource('destinations')) {
    mlMap.getSource('destinations').setData(geojson);
  } else {
    mlMap.addSource('destinations', {
      type: 'geojson',
      data: geojson,
      cluster: true,
      clusterRadius: 40
    });

    mlMap.addLayer({
      id: 'clusters',
      type: 'circle',
      source: 'destinations',
      filter: ['has', 'point_count'],
      paint: {
        'circle-color': '#1e3a8a',
        'circle-radius': ['step', ['get', 'point_count'], 15, 10, 20, 30, 25]
      }
    });

    mlMap.addLayer({
      id: 'cluster-count',
      type: 'symbol',
      source: 'destinations',
      filter: ['has', 'point_count'],
      layout: {
        'text-field': '{point_count_abbreviated}',
        'text-size': 12
      },
      paint: { 'text-color': '#fff' }
    });

    mlMap.addLayer({
      id: 'unclustered-point',
      type: 'circle',
      source: 'destinations',
      filter: ['!', ['has', 'point_count']],
      paint: {
        'circle-color': ['get', 'color'],
        'circle-radius': 6,
        'circle-stroke-width': 1,
        'circle-stroke-color': '#fff'
      }
    });

    mlMap.on('click', 'clusters', e => {
      const features = mlMap.queryRenderedFeatures(e.point, { layers: ['clusters'] });
      const clusterId = features[0].properties.cluster_id;
      mlMap.getSource('destinations').getClusterExpansionZoom(clusterId, (err, zoom) => {
        if (err) return;
        mlMap.easeTo({ center: features[0].geometry.coordinates, zoom });
      });
    });

    mlMap.on('click', 'unclustered-point', e => {
      const coordinates = e.features[0].geometry.coordinates.slice();
      const html = e.features[0].properties.popup;
      new maplibregl.Popup().setLngLat(coordinates).setHTML(html).addTo(mlMap);
    });

    mlMap.on('mouseenter', 'clusters', () => { mlMap.getCanvas().style.cursor = 'pointer'; });
    mlMap.on('mouseleave', 'clusters', () => { mlMap.getCanvas().style.cursor = ''; });
  }

  const b = computeBounds(destData);
  if (b) {
    const bounds = new maplibregl.LngLatBounds([b.west, b.south], [b.east, b.north]);
    mlMap.fitBounds(bounds, { padding: 40 });
  }
}

window.MapAPI = {
  setDestinations(data) {
    destData = Array.isArray(data) ? data : [];
    if (mlMap.isStyleLoaded()) addDestinations();
  }
};

// --- UI controls ---
mlMap.on('load', () => {
  const MODE_KEY = 'map-mode';
  const THREE_D_KEY = 'map-3d';
  const CONTOURS_KEY = 'map-contours';

  let currentMode = localStorage.getItem(MODE_KEY) || 'topo';
  let is3D = localStorage.getItem(THREE_D_KEY) === 'true';
  let showContours = localStorage.getItem(CONTOURS_KEY) === 'true';

  function setMode(mode) {
    mlMap.setLayoutProperty('satellite-layer', 'visibility', mode === 'satellite' || mode === 'hybrid' ? 'visible' : 'none');
    mlMap.setLayoutProperty('topo-layer', 'visibility', mode === 'topo' ? 'visible' : 'none');
    mlMap.setLayoutProperty('pm-labels', 'visibility', mode === 'hybrid' ? 'visible' : 'none');
    currentMode = mode;
    try { localStorage.setItem(MODE_KEY, mode); } catch {}
  }

  function set3D(enabled) {
    if (enabled) {
      mlMap.setTerrain({ source: 'dem', exaggeration: 1.5 });
      mlMap.setLayoutProperty('hillshade-layer', 'visibility', 'visible');
      mlMap.setPitch(45);
    } else {
      mlMap.setTerrain(null);
      mlMap.setLayoutProperty('hillshade-layer', 'visibility', 'none');
      mlMap.setPitch(0);
    }
    is3D = enabled;
    try { localStorage.setItem(THREE_D_KEY, String(enabled)); } catch {}
  }

  function setContours(visible) {
    mlMap.setLayoutProperty('contours-layer', 'visibility', visible ? 'visible' : 'none');
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
      const modes = ['topo', 'satellite', 'hybrid'];
      const idx = modes.indexOf(currentMode);
      setMode(modes[(idx + 1) % modes.length]);
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
    mlMap.setLayoutProperty('pm-admin', 'visibility', v ? 'visible' : 'none');
    mlMap.setLayoutProperty('pm-labels', 'visibility', v ? 'visible' : 'none');
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
  
  if (destData.length) addDestinations();
  window.dispatchEvent(new Event('map-ready'));
});
