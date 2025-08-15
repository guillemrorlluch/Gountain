// map.js - Mapbox GL JS implementation
(function() {
  const token = window.MAPBOX_TOKEN;
  const errorEl = document.getElementById('map-error');
  if (!token) {
    showError('Mapbox token missing/invalid.');
    return;
  }
  mapboxgl.accessToken = token;

  const MODE_KEY = 'mapMode';
  const THREE_D_KEY = 'map3D';
  let currentMode = 'standard';
  let is3D = false;
  try {
    currentMode = localStorage.getItem(MODE_KEY) || 'standard';
    is3D = localStorage.getItem(THREE_D_KEY) === 'true';
  } catch {}

  function styleFor(mode) {
    switch (mode) {
      case 'satellite':
        return 'mapbox://styles/mapbox/satellite-v9';
      case 'hybrid':
        return 'mapbox://styles/mapbox/satellite-streets-v12';
      default:
        return 'mapbox://styles/mapbox/outdoors-v12';
    }
  }

  const map = new mapboxgl.Map({
    container: 'map',
    style: styleFor(currentMode),
    center: [20, 10],
    zoom: 2.4,
    pitch: is3D ? 60 : 0
  });

  map.addControl(new mapboxgl.NavigationControl(), 'top-right');

  // ----- Data loading -----
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

  function popupHtml(d) {
    const name = d.nombre || '';
    const country = d.pais || '';
    const alt = d.altitud_m != null ? d.altitud_m + ' m' : '';
    const boots = Array.isArray(d.botas)
      ? d.botas.map(b => `<span class="boot">${b}</span>`).join(' ')
      : '';
    return `<strong>${name}</strong><br>${country} — ${alt}<br>${boots}`;
  }

  let destGeoJSON = null;
  let clickAdded = false;

  async function loadDestinos() {
    try {
      const res = await fetch('/data/destinos.json');
      const data = await res.json();
      destGeoJSON = {
        type: 'FeatureCollection',
        features: data.map(d => ({
          type: 'Feature',
          geometry: { type: 'Point', coordinates: [d.coords[1], d.coords[0]] },
          properties: { ...d, color: markerColor(d), html: popupHtml(d) }
        }))
      };
      if (map.isStyleLoaded()) addDestinosLayer();
    } catch (err) {
      console.error('Error loading destinos:', err);
    }
  }

  function addDestinosLayer() {
    if (!destGeoJSON || map.getSource('destinos')) return;
    map.addSource('destinos', { type: 'geojson', data: destGeoJSON });
    map.addLayer({
      id: 'destinos',
      type: 'circle',
      source: 'destinos',
      paint: {
        'circle-radius': 6,
        'circle-color': ['get', 'color'],
        'circle-stroke-width': 1,
        'circle-stroke-color': '#fff'
      }
    });
    if (!clickAdded) {
      map.on('click', 'destinos', e => {
        const f = e.features[0];
        new mapboxgl.Popup().setLngLat(f.geometry.coordinates).setHTML(f.properties.html).addTo(map);
      });
      clickAdded = true;
    }
  }

  function addTerrainSource() {
    if (!map.getSource('mapbox-dem')) {
      map.addSource('mapbox-dem', {
        type: 'raster-dem',
        url: 'mapbox://mapbox.mapbox-terrain-dem-v1',
        tileSize: 512,
        maxzoom: 14
      });
    }
  }

  function enable3D() {
    addTerrainSource();
    map.setTerrain({ source: 'mapbox-dem', exaggeration: 1.3 });
    if (!map.getLayer('sky')) {
      map.addLayer({
        id: 'sky',
        type: 'sky',
        paint: {
          'sky-type': 'atmosphere',
          'sky-atmosphere-sun': [0.0, 0.0],
          'sky-atmosphere-sun-intensity': 15
        }
      });
    }
    map.setPitch(60);
  }

  function disable3D() {
    map.setTerrain(null);
    if (map.getLayer('sky')) map.removeLayer('sky');
    map.setPitch(0);
  }

  function setMode(mode) {
    if (mode === currentMode) return;
    currentMode = mode;
    try { localStorage.setItem(MODE_KEY, mode); } catch {}
    map.setStyle(styleFor(mode));
  }

  function set3D(enabled) {
    is3D = enabled;
    try { localStorage.setItem(THREE_D_KEY, String(enabled)); } catch {}
    if (enabled) enable3D(); else disable3D();
    updateButtons();
  }

  function updateButtons() {
    modeButtons.forEach(btn => btn.classList.toggle('active', btn.dataset.mode === currentMode));
    btn3D.classList.toggle('active', is3D);
  }

  // ----- UI -----
  const panel = document.createElement('div');
  panel.style.position = 'absolute';
  panel.style.top = '10px';
  panel.style.left = '10px';
  panel.style.display = 'flex';
  panel.style.gap = '4px';
  panel.style.background = '#1f2937';
  panel.style.padding = '4px';
  panel.style.borderRadius = '6px';
  panel.style.zIndex = '1';

  const modes = [
    { id: 'standard', label: 'Standard' },
    { id: 'satellite', label: 'Satellite' },
    { id: 'hybrid', label: 'Hybrid' }
  ];
  const modeButtons = modes.map(m => {
    const b = document.createElement('button');
    b.textContent = m.label;
    b.dataset.mode = m.id;
    b.style.background = '#374151';
    b.style.color = '#fff';
    b.style.border = 'none';
    b.style.padding = '4px 6px';
    b.style.cursor = 'pointer';
    b.style.borderRadius = '4px';
    b.addEventListener('click', () => setMode(m.id));
    panel.appendChild(b);
    return b;
  });

  const btn3D = document.createElement('button');
  btn3D.textContent = '3D';
  btn3D.style.background = '#374151';
  btn3D.style.color = '#fff';
  btn3D.style.border = 'none';
  btn3D.style.padding = '4px 6px';
  btn3D.style.cursor = 'pointer';
  btn3D.style.borderRadius = '4px';
  btn3D.addEventListener('click', () => set3D(!is3D));
  panel.appendChild(btn3D);

  map.getContainer().appendChild(panel);

  function showError(msg) {
    if (errorEl) {
      errorEl.textContent = msg;
      errorEl.classList.remove('hidden');
    }
  }

  map.on('style.load', () => {
    addTerrainSource();
    if (is3D) enable3D();
    else disable3D();
    addDestinosLayer();
    updateButtons();
  });

  loadDestinos();

  map.on('error', e => {
    const err = e && e.error;
    if (err && err.status === 401) {
      showError('Mapbox token missing/invalid.');
    }
  });
})();
