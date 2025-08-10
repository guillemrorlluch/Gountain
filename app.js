// app.js — v9

// Normaliza etiquetas de dificultad a buckets
function normalizeDiff(diff) {
  if (!diff) return 'Trek';
  if (diff.startsWith('D')) return 'D';
  if (diff.startsWith('AD')) return 'AD';             // ojo: startsWith bien escrito
  if (diff.startsWith('PD')) return 'PD';
  if (diff.startsWith('F')) return 'F';
  return diff.includes('Trek') ? 'Trek' : 'Trek';
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { normalizeDiff };
  }

if (typeof window !== 'undefined') {
  // --- Config ---
  const DATA_VER = '9';
  const DATA_URL = `/data/destinos.json?v=${DATA_VER}`;

  // Paleta para botas
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

  // --- Mapa ---
  const MAPBOX_TOKEN = window.MAPBOX_TOKEN || '';
  const style = {
    version: 8,
    sources: {
       'nasa-bm': {
        type: 'raster',
        tiles: [
          'https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/BlueMarble_ShadedRelief/default/GoogleMapsCompatible_Level8/{z}/{y}/{x}.jpg'
        ],
        tileSize: 256,
        attribution: 'Imagery © NASA Blue Marble'
      },
      ...(MAPBOX_TOKEN
        ? {
            'mb-sat': {
              type: 'raster',
              tiles: [
                `https://api.mapbox.com/styles/v1/mapbox/satellite-v9/tiles/{z}/{x}/{y}?access_token=${MAPBOX_TOKEN}`
              ],
              tileSize: 256,
              attribution: '&copy; Mapbox'
            },
            'mb-dem': {
              type: 'raster-dem',
              tiles: [
                `https://api.mapbox.com/v4/mapbox.terrain-rgb/{z}/{x}/{y}.pngraw?access_token=${MAPBOX_TOKEN}`
              ],
              tileSize: 512,
              maxzoom: 14
            }
          }
        : {})
    },
    layers: [
      { id: 'nasa-bm', type: 'raster', source: 'nasa-bm' },
      ...(MAPBOX_TOKEN
        ? [{ id: 'mb-sat', type: 'raster', source: 'mb-sat' }]
        : [])
    ]
  };

  const map = new maplibregl.Map({
    container: 'map',
    style,
    center: [10, 28],
    zoom: 3,
    pitch: 45,
    bearing: 0,
    antialias: true
  });

  map.on('load', () => {
    if (MAPBOX_TOKEN) {
      map.setTerrain({ source: 'mb-dem' });
    }
    map.addLayer({
      id: 'sky',
      type: 'sky',
      paint: {
        'sky-type': 'atmosphere',
        'sky-atmosphere-sun-intensity': 15
      }
    });
  });

  map.addControl(new maplibregl.NavigationControl({ visualizePitch: true }));
  map.addControl(
    new maplibregl.GeolocateControl({
      positionOptions: { enableHighAccuracy: true },
      trackUserLocation: true
    })
  );
  
  // --- Estado ---
  const state = {
    data: [],
    continents: new Set(),
    difficulties: new Set(),
    boots: new Set(),
    tipos: new Set(),
    filters: { continente: new Set(), dificultad: new Set(), botas: new Set(), tipo: new Set() },
    markers: []
  };
  
  // --- Helpers UI ---
  const $ = (sel) => document.querySelector(sel);
  $('#btnMenu').onclick = () => $('#sidebar').classList.toggle('hidden');
  $('#btnInfo').onclick = () => $('#glossary').classList.toggle('hidden');
  $('#clearFilters').onclick = () => {
    for (const k of Object.keys(state.filters)) state.filters[k].clear();
    renderFilters();
    renderMarkers();
     };

  function bootLegendList() {
    const ul = document.getElementById('legend-botas');
    if (!ul) return;
@@ -150,67 +217,76 @@ function renderFilters() {
  }

  // --- Data ---
  async function loadData() {
    try {
      const res = await fetch(DATA_URL, { cache: 'no-store' });
      const data = await res.json();

      state.data = data;
      data.forEach(d => {
        state.continents.add(d.continente);
        state.difficulties.add(normalizeDiff(d.dificultad));
        (d.botas || []).forEach(b => state.boots.add(b));
        state.tipos.add(d.tipo);
      });

          renderFilters();
      renderMarkers();
      bootLegendList();
    } catch (err) {
            console.error('❌ Error cargando datos:', err);
    }
  }

  function clearMarkers() {
    state.markers.forEach(m => m.remove());
    state.markers = [];
  }

  function renderMarkers() {
    clearMarkers();
    const filtered = state.data.filter(withinFilters);
    const bounds = new maplibregl.LngLatBounds();
    filtered.forEach(d => {
      const col = markerColor(d);
      const el = document.createElement('div');
      el.style.width = '12px';
      el.style.height = '12px';
      el.style.backgroundColor = col;
      el.style.borderRadius = '50%';
      el.style.border = '2px solid #fff';
      const ll = [d.coords[1], d.coords[0]];
      const marker = new maplibregl.Marker({ element: el })
        .setLngLat(ll)
        .setPopup(new maplibregl.Popup({ offset: 25 }).setHTML(popupHtml(d)))
        .addTo(map);
      state.markers.push(marker);
      bounds.extend(ll);
    });
    if (filtered.length) {
      map.fitBounds(bounds, { padding: 40 });
    }
  }

  // Init
  loadData();

  // ---- Service Worker ----
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', async () => {
      try {
        const reg = await navigator.serviceWorker.register('/sw.js');
        console.log('✅ SW registrado:', reg.scope);

        if (reg.waiting) {
          reg.waiting.postMessage({ type: 'SKIP_WAITING' });
        }

        reg.addEventListener('updatefound', () => {
          const nw = reg.installing;
          if (!nw) return;
          nw.addEventListener('statechange', () => {
            if (nw.state === 'installed' && navigator.serviceWorker.controller) {
              nw.postMessage({ type: 'SKIP_WAITING' });
            }
          });
