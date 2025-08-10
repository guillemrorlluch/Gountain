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

function withinFilters(d, F) {
  const cont = F.continente.size === 0 || F.continente.has(d.continente);
  const dif = F.dificultad.size === 0 || F.dificultad.has(normalizeDiff(d.dificultad));
  const tipo = F.tipo.size === 0 || F.tipo.has(d.tipo);
  const botas =
    F.botas.size === 0 || (Array.isArray(d.botas) && d.botas.some(b => F.botas.has(b)));
  return cont && dif && tipo && botas;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { normalizeDiff, markerColor, withinFilters, BOOT_COLORS };
}

if (typeof window !== 'undefined') {
  // --- Config ---
  const DATA_VER = '9';
  const DATA_URL = `/data/destinos.json?v=${DATA_VER}`;
  
  // --- Mapa ---
  const MAPBOX_TOKEN =
    window.MAPBOX_TOKEN && !window.MAPBOX_TOKEN.includes('your_token_here')
      ? window.MAPBOX_TOKEN
      : '';
  const MAPTILER_KEY = window.MAPTILER_KEY || '';
  
  const style = {
    version: 8,
    glyphs: 'https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf',
    sources: {},
    layers: []
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
  const errorEl = document.getElementById('map-error');
  function showError(msg) {
    if (!errorEl) return;
    errorEl.textContent = msg;
    errorEl.classList.remove('hidden');
  }
  function hideError() {
    if (!errorEl) return;
    errorEl.classList.add('hidden');
  }
  let labelsVisible = true;
  let terrainVisible = false;
  let satelliteEnabled = false;
  
  map.on('error', (e) => {
    console.error('Map load error', e.error);
    if (e && e.sourceId) {
      showError(`Error al cargar ${e.sourceId}. Reintentando...`);
      if (e.sourceId === 'satellite') {
        if (map.getLayer('nasa-bluemarble')) map.setLayoutProperty('nasa-bluemarble', 'visibility', 'visible');
        if (map.getLayer('nasa-viirs')) map.setLayoutProperty('nasa-viirs', 'visibility', 'visible');
        if (map.getLayer('satellite')) map.setLayoutProperty('satellite', 'visibility', 'none');
        setTimeout(() => {
          hideError();
          updateSatelliteVisibility();
        }, 5000);
      }
    } else {
      showError('Error al cargar el mapa');
    }
  });
  map.on('data', (ev) => {
    if (ev.sourceId && ev.isSourceLoaded) hideError();
  });

  map.on('load', () => {
    // Center on user's location if available
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          map.jumpTo({ center: [pos.coords.longitude, pos.coords.latitude], zoom: 8 });
        },
        (err) => console.warn('geolocation error', err),
        { enableHighAccuracy: true }
      );
    }
    
    // NASA imagery
    map.addSource('nasa-bluemarble', {
      type: 'raster',
      tiles: [
        'https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/BlueMarble_ShadedRelief/default/GoogleMapsCompatible_Level8/{z}/{y}/{x}.jpg'
      ],
      tileSize: 256,
      minzoom: 0,
      maxzoom: 8,
      attribution: 'Imagery © NASA'
    });
    map.addLayer({ id: 'nasa-bluemarble', type: 'raster', source: 'nasa-bluemarble', minzoom: 0, maxzoom: 8, layout: { visibility: 'none' } });

    map.addSource('nasa-viirs', {
      type: 'raster',
      tiles: [
        'https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/VIIRS_SNPP_CorrectedReflectance_TrueColor/default/GoogleMapsCompatible_Level9/{z}/{y}/{x}.jpg'
      ],
      tileSize: 256,
      minzoom: 9,
      maxzoom: 13,
      attribution: 'Imagery © NASA'
    });
    map.addLayer({ id: 'nasa-viirs', type: 'raster', source: 'nasa-viirs', minzoom: 9, maxzoom: 13, layout: { visibility: 'none' } });

    if (MAPBOX_TOKEN) {
      map.addSource('satellite', {
        type: 'raster',
        tiles: [
          `https://api.mapbox.com/styles/v1/mapbox/satellite-v9/tiles/512/{z}/{x}/{y}@2x?access_token=${MAPBOX_TOKEN}`
        ],
        tileSize: 512,
        maxzoom: 19,
        attribution: '© Mapbox, © Maxar/DigitalGlobe'
      });
      map.addLayer({ id: 'satellite', type: 'raster', source: 'satellite' });

      map.addSource('streets', {
        type: 'vector',
        tiles: [
          `https://api.mapbox.com/v4/mapbox.mapbox-streets-v8/{z}/{x}/{y}.vector.pbf?access_token=${MAPBOX_TOKEN}`
        ],
        minzoom: 0,
        maxzoom: 14
      });

      map.addLayer({
        id: 'country-boundaries',
        type: 'line',
        source: 'streets',
        'source-layer': 'admin',
        filter: ['==', ['get', 'admin_level'], 2],
        paint: { 'line-color': '#333', 'line-width': 1, 'line-opacity': 0.5 }
      });

      map.addLayer({
        id: 'country-label',
        type: 'symbol',
        source: 'streets',
        'source-layer': 'country_label',
        layout: { 'text-field': ['get', 'name_en'], 'text-size': 14 },
        paint: { 'text-color': '#000', 'text-halo-color': '#fff', 'text-halo-width': 1 }
      });
      map.addLayer({
        id: 'place-label',
        type: 'symbol',
        source: 'streets',
        'source-layer': 'place_label',
        layout: { 'text-field': ['get', 'name_en'], 'text-size': 12 },
        paint: { 'text-color': '#000', 'text-halo-color': '#fff', 'text-halo-width': 1 }
      });
       map.addLayer({
        id: 'state-label',
        type: 'symbol',
        source: 'streets',
        'source-layer': 'state_label',
        layout: { 'text-field': ['get', 'name_en'], 'text-size': 12 },
        paint: { 'text-color': '#222', 'text-halo-color': '#fff', 'text-halo-width': 1 }
      });
      
      map.addSource('mb-dem', {
        type: 'raster-dem',
        tiles: [`https://api.mapbox.com/v4/mapbox.terrain-rgb/{z}/{x}/{y}.pngraw?access_token=${MAPBOX_TOKEN}`],
        tileSize: 512,
        maxzoom: 14
      });
      map.addLayer({ id: 'hillshade', type: 'hillshade', source: 'mb-dem', layout: { visibility: 'none' } });
      map.addSource('contours', {
        type: 'vector',
        tiles: [
          `https://api.mapbox.com/v4/mapbox.mapbox-terrain-v2/{z}/{x}/{y}.vector.pbf?access_token=${MAPBOX_TOKEN}`
        ],
        minzoom: 0,
        maxzoom: 14
      });
      map.addLayer({
        id: 'contours-line',
        type: 'line',
        source: 'contours',
        'source-layer': 'contour',
        layout: { 'line-join': 'round', 'line-cap': 'round' },
        paint: { 'line-color': '#877b59', 'line-width': 1, 'line-opacity': 0.5 }
      });
    } else if (MAPTILER_KEY) {
      map.addSource('satellite', {
        type: 'raster',
        tiles: [`https://api.maptiler.com/tiles/satellite/{z}/{x}/{y}.jpg?key=${MAPTILER_KEY}`],
        tileSize: 256,
        maxzoom: 20,
        attribution: '© MapTiler, © OpenStreetMap contributors'
      });
      map.addLayer({ id: 'satellite', type: 'raster', source: 'satellite' });

      map.addSource('streets', {
        type: 'vector',
        tiles: [`https://api.maptiler.com/tiles/v3/{z}/{x}/{y}.pbf?key=${MAPTILER_KEY}`],
        minzoom: 0,
        maxzoom: 14
      });
      map.addLayer({
        id: 'country-boundaries',
        type: 'line',
        source: 'streets',
        'source-layer': 'administrative',
        filter: ['==', ['get', 'admin_level'], 2],
        paint: { 'line-color': '#333', 'line-width': 1, 'line-opacity': 0.5 }
      });
    } else {
      map.addSource('satellite', {
        type: 'raster',
        tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
        tileSize: 256,
        maxzoom: 19,
        attribution: '© OpenStreetMap contributors'
      });
      map.addLayer({ id: 'satellite', type: 'raster', source: 'satellite' });

      map.addSource('streets', {
        type: 'vector',
        tiles: ['https://demotiles.maplibre.org/tiles/v3/{z}/{x}/{y}.pbf'],
        minzoom: 0,
        maxzoom: 14
      });
      map.addLayer({
        id: 'country-boundaries',
        type: 'line',
        source: 'streets',
        'source-layer': 'administrative',
        filter: ['==', ['get', 'admin_level'], 2],
        paint: { 'line-color': '#333', 'line-width': 1, 'line-opacity': 0.5 }
      });
    }

    updateLabelVisibility();
    updateTerrainVisibility();
    updateSatelliteVisibility();
  });

  map.addControl(new maplibregl.NavigationControl({ visualizePitch: true }));
  map.addControl(
    new maplibregl.GeolocateControl({
      positionOptions: { enableHighAccuracy: true },
      trackUserLocation: true
    })
  );
  class CompassControl {
    onAdd(map) {
      this._map = map;
      this._container = document.createElement('div');
      this._container.className = 'maplibregl-ctrl maplibregl-ctrl-group compass-ctrl';
      this._arrow = document.createElement('div');
      this._arrow.className = 'compass-arrow';
      this._container.appendChild(this._arrow);
      this._update = () => {
        const b = this._map.getBearing();
        this._arrow.style.transform = `rotate(${-b}deg)`;
      };
      this._map.on('rotate', this._update);
      this._update();
      return this._container;
    }
    onRemove() {
      this._map.off('rotate', this._update);
      this._container.remove();
      this._map = undefined;
    }
  }
  map.addControl(new CompassControl());
  function updateLabelVisibility() {
    const vis = labelsVisible ? 'visible' : 'none';
    ['country-label', 'state-label', 'place-label'].forEach(id => {
      if (map.getLayer(id)) map.setLayoutProperty(id, 'visibility', vis);
    });
  }

  function toggleLabels() {
    labelsVisible = !labelsVisible;
    updateLabelVisibility();
  }
  
  function updateTerrainVisibility() {
    if (!MAPBOX_TOKEN) return;
    if (terrainVisible) {
      map.setTerrain({ source: 'mb-dem' });
      if (map.getLayer('hillshade')) map.setLayoutProperty('hillshade', 'visibility', 'visible');
      if (map.getLayer('contours-line')) map.setLayoutProperty('contours-line', 'visibility', 'visible');
    } else {
      map.setTerrain(null);
      if (map.getLayer('hillshade')) map.setLayoutProperty('hillshade', 'visibility', 'none');
      if (map.getLayer('contours-line')) map.setLayoutProperty('contours-line', 'visibility', 'none');
    }
  }

  function toggleTerrain() {
    terrainVisible = !terrainVisible;
    updateTerrainVisibility();
  }

  function updateSatelliteVisibility() {
    if (MAPBOX_TOKEN || MAPTILER_KEY) {
      if (satelliteEnabled) {
        if (map.getLayer('satellite')) map.setLayoutProperty('satellite', 'visibility', 'visible');
        if (map.getLayer('nasa-bluemarble')) map.setLayoutProperty('nasa-bluemarble', 'visibility', 'none');
        if (map.getLayer('nasa-viirs')) map.setLayoutProperty('nasa-viirs', 'visibility', 'none');
      } else {
        if (map.getLayer('satellite')) map.setLayoutProperty('satellite', 'visibility', 'none');
        if (map.getLayer('nasa-bluemarble')) map.setLayoutProperty('nasa-bluemarble', 'visibility', 'visible');
        if (map.getLayer('nasa-viirs')) map.setLayoutProperty('nasa-viirs', 'visibility', 'visible');
      }
    } else {
      if (satelliteEnabled) {
        if (map.getLayer('nasa-bluemarble')) map.setLayoutProperty('nasa-bluemarble', 'visibility', 'visible');
        if (map.getLayer('nasa-viirs')) map.setLayoutProperty('nasa-viirs', 'visibility', 'visible');
        if (map.getLayer('satellite')) map.setLayoutProperty('satellite', 'visibility', 'none');
      } else {
        if (map.getLayer('satellite')) map.setLayoutProperty('satellite', 'visibility', 'visible');
        if (map.getLayer('nasa-bluemarble')) map.setLayoutProperty('nasa-bluemarble', 'visibility', 'none');
        if (map.getLayer('nasa-viirs')) map.setLayoutProperty('nasa-viirs', 'visibility', 'none');
      }
    }
    if (btnSat) {
      btnSat.textContent = satelliteEnabled ? '🗺️' : '🛰️';
      btnSat.classList.toggle('active', satelliteEnabled);
    }
  }

  function toggleSatellite() {
    satelliteEnabled = !satelliteEnabled;
    updateSatelliteVisibility();
  }

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
  const btnSat = $('#btnSat');
  btnSat.onclick = toggleSatellite;
  const btnTerrain = $('#btnTerrain');
  btnTerrain.onclick = toggleTerrain;
  if (!MAPBOX_TOKEN) btnTerrain.classList.add('hidden');
  const btnLabels = $('#btnLabels');
  btnLabels.onclick = toggleLabels;
  $('#clearFilters').onclick = () => {
    for (const k of Object.keys(state.filters)) state.filters[k].clear();
    renderFilters();
    renderMarkers();
     };

  function bootLegendList() {
    const ul = document.getElementById('legend-botas');
    if (!ul) return;
    ul.innerHTML = '';
    for (const [k, color] of Object.entries(BOOT_COLORS)) {
      const li = document.createElement('li');
      li.innerHTML = `<span style="display:inline-block;width:10px;height:10px;background:${color};border-radius:2px;margin-right:6px;"></span>${k}`;
      ul.appendChild(li);
    }
  }

  function chip(label, group, key) {
    const el = document.createElement('button');
    el.className = 'chip';
    el.textContent = label;
    if (state.filters[group].has(key)) el.classList.add('active');
    el.onclick = () => {
      if (state.filters[group].has(key)) state.filters[group].delete(key);
      else state.filters[group].add(key);
      el.classList.toggle('active');
      renderMarkers();
    };
    return el;
  }

  function renderFilters() {
    const fc = document.getElementById('filter-continente'),
      fd = document.getElementById('filter-dificultad'),
      fb = document.getElementById('filter-botas'),
      ft = document.getElementById('filter-tipo');
    if (!fc || !fd || !fb || !ft) return;
    fc.innerHTML = fd.innerHTML = fb.innerHTML = ft.innerHTML = '';
    [...state.continents].sort().forEach(c => fc.appendChild(chip(c, 'continente', c)));
    [...state.difficulties].sort().forEach(d => fd.appendChild(chip(d, 'dificultad', d)));
    [...state.boots].forEach(b => fb.appendChild(chip(b, 'botas', b)));
    [...state.tipos].sort().forEach(t => ft.appendChild(chip(t, 'tipo', t)));
  }

  // Helpers delegating to pure functions
  const markerColorLocal = (d) => markerColor(d);
  const withinFiltersLocal = (d) => withinFilters(d, state.filters);
  
  function popupHtml(d) {
    const url = d.link || d.google_search || null;
    const title = url
      ? `<a href="${url}" target="_blank" rel="noopener noreferrer" style="font-weight:700;font-size:15px;margin-bottom:4px;color:#3b82f6;text-decoration:underline;">${d.nombre} (${d.pais})</a>`
      : `<div style="font-weight:700;font-size:15px;margin-bottom:4px">${d.nombre} (${d.pais})</div>`;

    const bootsBadges = (d.botas || []).map(b => `<span class="badge">${b}</span>`).join(' ');

    return `<div style="min-width:260px;max-width:360px">
      ${title}
      <div><b>Continente:</b> ${d.continente} · <b>Tipo:</b> ${d.tipo}</div>
      <div><b>Altitud:</b> ${d.altitud_m} m · <b>Dificultad:</b> ${d.dificultad}</div>
      <div style="margin-top:4px"><b>Meses:</b> ${d.meses} · <b>Temp aprox:</b> ${d.temp_aprox}</div>
      <div style="margin-top:6px"><b>Botas:</b><br>${bootsBadges}</div>
      <div style="margin-top:6px"><b>Scrambling/Escalada:</b> ${d.scramble?.si ? 'Sí' : 'No'}; Grado: ${d.scramble?.grado || '-'}; Arnés: ${d.scramble?.arnes ? 'Sí' : 'No'}</div>
      <div><b>Equipo:</b> ${(d.equipo || []).join(', ') || '—'}</div>
      <div><b>Vivac:</b> ${d.vivac} · <b>Camping gas:</b> ${d.gas}</div>
      <div><b>Permisos:</b> ${d.permisos} · <b>Guía:</b> ${d.guia}</div>
      <div><b>Coste estancia:</b> ${d.coste_estancia}</div>
      <div style="margin-top:6px"><b>Reseña:</b> ${d.resena}</div>
    </div>`;
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

    function addMarker(d) {
      const el = document.createElement('div');
      el.className = 'marker';
      el.style.backgroundColor = markerColorLocal(d);
      const popup = new maplibregl.Popup({
        maxWidth: window.matchMedia('(max-width: 600px)').matches ? '300px' : '400px'
      }).setHTML(popupHtml(d));
      return new maplibregl.Marker({ element: el })
        .setLngLat([d.coords[1], d.coords[0]])
        .setPopup(popup);
    }
  
  function renderMarkers() {
    clearMarkers();
    const filtered = state.data.filter(withinFiltersLocal);
    const bounds = new maplibregl.LngLatBounds();
    filtered.forEach(d => {
      const marker = addMarker(d).addTo(map);
      state.markers.push(marker);
      bounds.extend([d.coords[1], d.coords[0]]);
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
        const reg = await navigator.serviceWorker.register('/sw-v9.js');
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
        });
      } catch (err) {
        console.error('❌ Error registrando SW:', err);
      }
    });
  }
}
