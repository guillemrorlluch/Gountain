// app.js — v9

// Normaliza etiquetas de dificultad a buckets
function normalizeDiff(diff) {
  if (!diff) return 'Trek';
  if (diff.startsWith('AD')) return 'AD';
  if (diff.startsWith('PD')) return 'PD';
  if (diff.startsWith('D')) return 'D';
  if (diff.startsWith('F')) return 'F';
  return diff.includes('Trek') ? 'Trek' : diff;
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

function monthsToSeasons(meses) {
  const map = { Jan:1, Feb:2, Mar:3, Apr:4, May:5, Jun:6, Jul:7, Aug:8, Sep:9, Oct:10, Nov:11, Dec:12 };
  if (!meses) return [];
  if (meses.toLowerCase().includes('todo')) return ['Invierno','Primavera','Verano','Otoño'];
  const parts = meses.split(/[–-]/).map(p => p.trim());
  if (parts.length < 2) return [];
  const start = map[parts[0].slice(0,3)];
  const end = map[parts[1].slice(0,3)];
  if (!start || !end) return [];
  const months = [];
  let m = start;
  while (true) {
    months.push(m);
    if (m === end) break;
    m = m % 12 + 1;
  }
  const seasons = new Set();
  months.forEach(mon => {
    if ([12,1,2].includes(mon)) seasons.add('Invierno');
    else if ([3,4,5].includes(mon)) seasons.add('Primavera');
    else if ([6,7,8].includes(mon)) seasons.add('Verano');
    else if ([9,10,11].includes(mon)) seasons.add('Otoño');
  });
  return [...seasons];
}

function withinFilters(d, F) {
  const cont = F.continente.size === 0 || F.continente.has(d.continente);
  const dif = F.dificultad.size === 0 || F.dificultad.has(normalizeDiff(d.dificultad));
  const tipo = F.tipo.size === 0 || F.tipo.has(d.tipo);
  const botas =
    F.botas.size === 0 || (Array.isArray(d.botas) && d.botas.some(b => F.botas.has(b)));
  const season = F.season.size === 0 || (Array.isArray(d.seasons) && d.seasons.some(s => F.season.has(s)));
  const altMin = F.altitude.min == null || d.altitud_m >= F.altitude.min;
  const altMax = F.altitude.max == null || d.altitud_m <= F.altitude.max;
  return cont && dif && tipo && botas && season && altMin && altMax;
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

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { normalizeDiff, markerColor, withinFilters, BOOT_COLORS, monthsToSeasons, computeBounds };
}

if (typeof window !== 'undefined') {
  // --- Config ---
  const DATA_VER = '9';
  const DATA_URL = `/data/destinos.json?v=${DATA_VER}`;
  
  const map = window.map;
  
  // --- Estado ---
  const state = {
    data: [],
    continents: new Set(),
    difficulties: new Set(),
    boots: new Set(),
    tipos: new Set(),
    seasons: new Set(),
    filters: {
      continente: new Set(),
      dificultad: new Set(),
      botas: new Set(),
      tipo: new Set(),
      season: new Set(),
      altitude: { min: null, max: null }
    }
  };
  
  // --- Helpers UI ---
  const $ = (sel) => document.querySelector(sel);
  const btnMenu = $('#btnMenu');
  if (btnMenu) btnMenu.onclick = () => $('#sidebar').classList.toggle('hidden');
  const btnInfo = $('#btnInfo');
  if (btnInfo) btnInfo.onclick = () => $('#glossary').classList.toggle('hidden');
  const btnClearFilters = $('#clearFilters');
  if (btnClearFilters) btnClearFilters.onclick = () => {
    for (const k of ['continente','dificultad','botas','tipo','season']) state.filters[k].clear();
    state.filters.altitude.min = state.filters.altitude.max = null;
    const mi = document.getElementById('alt-min'), ma = document.getElementById('alt-max');
    if (mi) mi.value = '';
    if (ma) ma.value = '';
    renderFilters();
    renderAltitudeChip();
    renderMarkers();
  };

  const altMinInput = $('#alt-min');
  const altMaxInput = $('#alt-max');
  function handleAltChange() {
    state.filters.altitude.min = altMinInput && altMinInput.value !== '' ? parseInt(altMinInput.value, 10) : null;
    state.filters.altitude.max = altMaxInput && altMaxInput.value !== '' ? parseInt(altMaxInput.value, 10) : null;
    renderAltitudeChip();
    renderMarkers();
  }
  if (altMinInput) altMinInput.oninput = handleAltChange;
  if (altMaxInput) altMaxInput.oninput = handleAltChange;
  
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
      ft = document.getElementById('filter-tipo'),
      fs = document.getElementById('filter-season');
    if (!fc || !fd || !fb || !ft || !fs) return;
    fc.innerHTML = fd.innerHTML = fb.innerHTML = ft.innerHTML = fs.innerHTML = '';
    [...state.continents].sort().forEach(c => fc.appendChild(chip(c, 'continente', c)));
    [...state.difficulties].sort().forEach(d => fd.appendChild(chip(d, 'dificultad', d)));
    [...state.boots].forEach(b => fb.appendChild(chip(b, 'botas', b)));
    [...state.tipos].sort().forEach(t => ft.appendChild(chip(t, 'tipo', t)));
    [...state.seasons].forEach(s => fs.appendChild(chip(s, 'season', s)));
  }

  function renderAltitudeChip() {
    const el = document.getElementById('altitude-chip');
    if (!el) return;
    el.innerHTML = '';
    const { min, max } = state.filters.altitude;
    if (min != null || max != null) {
      const span = document.createElement('span');
      span.className = 'badge';
      span.textContent = `${min ?? 0}–${max ?? '∞'} m`;
      el.appendChild(span);
    }
  }

  // Helpers delegating to pure functions
  const markerColorLocal = (d) => markerColor(d);
  const withinFiltersLocal = (d) => withinFilters(d, state.filters);
  
  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function safeUrl(url) {
    return /^https?:\/\//i.test(url) ? url : null;
  }

  function popupHtml(d) {
    const url = safeUrl(d.link || d.google_search || '');
    const name = escapeHtml(d.nombre);
    const country = escapeHtml(d.pais);
    const title = url
      ? `<a href="${url}" target="_blank" rel="noopener noreferrer" style="font-weight:700;font-size:15px;margin-bottom:4px;color:#3b82f6;text-decoration:underline;">${name} (${country})</a>`
      : `<div style="font-weight:700;font-size:15px;margin-bottom:4px">${name} (${country})</div>`;
    
    const bootsBadges = (d.botas || []).map(b => `<span class="badge">${escapeHtml(b)}</span>`).join(' ');
    const scramble = d.scramble || {};

    return `<div style="min-width:260px;max-width:360px">
      ${title}
      <div><b>Continente:</b> ${escapeHtml(d.continente)} · <b>Tipo:</b> ${escapeHtml(d.tipo)}</div>
      <div><b>Altitud:</b> ${escapeHtml(d.altitud_m)} m · <b>Dificultad:</b> ${escapeHtml(d.dificultad)}</div>
      <div style="margin-top:4px"><b>Meses:</b> ${escapeHtml(d.meses)} · <b>Temp aprox:</b> ${escapeHtml(d.temp_aprox)}</div>
      <div style="margin-top:6px"><b>Botas:</b><br>${bootsBadges}</div>
      <div style="margin-top:6px"><b>Scrambling/Escalada:</b> ${scramble.si ? 'Sí' : 'No'}; Grado: ${escapeHtml(scramble.grado || '-')}; Arnés: ${scramble.arnes ? 'Sí' : 'No'}</div>
      <div><b>Equipo:</b> ${(d.equipo || []).map(escapeHtml).join(', ') || '—'}</div>
      <div><b>Vivac:</b> ${escapeHtml(d.vivac)} · <b>Camping gas:</b> ${escapeHtml(d.gas)}</div>
      <div><b>Permisos:</b> ${escapeHtml(d.permisos)} · <b>Guía:</b> ${escapeHtml(d.guia)}</div>
      <div><b>Coste estancia:</b> ${escapeHtml(d.coste_estancia)}</div>
      <div style="margin-top:6px"><b>Reseña:</b> ${escapeHtml(d.resena)}</div>
    </div>`;
  }
  
  // --- Data ---
  async function fetchDestinos() {
    const res = await fetch(DATA_URL, { cache: 'no-store' });
    return await res.json();
  }

  function validateDestinos(list) {
    return list.filter(d =>
      d && typeof d.id === 'string' && Array.isArray(d.coords) && d.coords.length === 2 && typeof d.altitud_m === 'number'
    );
  }

  async function loadData() {
    try {
      const raw = await fetchDestinos();
      const data = validateDestinos(raw);

      state.data = data;
      data.forEach(d => {
        state.continents.add(d.continente);
        state.difficulties.add(normalizeDiff(d.dificultad));
        (d.botas || []).forEach(b => state.boots.add(b));
        state.tipos.add(d.tipo);
        d.seasons = monthsToSeasons(d.meses);
        d.seasons.forEach(s => state.seasons.add(s));
      });

      renderFilters();
      renderAltitudeChip();
      renderMarkers();
      bootLegendList();
    } catch (err) {
      console.error('❌ Error cargando datos:', err);
      if (navigator.serviceWorker && navigator.serviceWorker.ready) {
        navigator.serviceWorker.ready.then(reg => {
          if (reg.sync) reg.sync.register('sync-destinos');
        });
      }
    }
  }

  function renderMarkers() {
    if (!map || !map.isStyleLoaded()) { map.once('load', renderMarkers); return; }
    const filtered = state.data.filter(withinFiltersLocal);
    const geojson = {
      type: 'FeatureCollection',
      features: filtered.map(d => ({
        type: 'Feature',
        properties: {
          color: markerColorLocal(d),
          popup: popupHtml(d)
        },
        geometry: { type: 'Point', coordinates: [d.coords[1], d.coords[0]] }
      }))
    };

    if (map.getSource('destinations')) {
      map.getSource('destinations').setData(geojson);
    } else {
      map.addSource('destinations', {
        type: 'geojson',
        data: geojson,
        cluster: true,
        clusterRadius: 40
      });

      map.addLayer({
        id: 'clusters',
        type: 'circle',
        source: 'destinations',
        filter: ['has', 'point_count'],
        paint: {
          'circle-color': '#1e3a8a',
          'circle-radius': ['step', ['get', 'point_count'], 15, 10, 20, 30, 25]
        }
      });

      map.addLayer({
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

      map.addLayer({
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

      // Clarify event variables to avoid accidental reliance on an implicit global
      // "e" when handlers are executed.
      map.on('click', 'clusters', evt => {
        const features = map.queryRenderedFeatures(evt.point, { layers: ['clusters'] });
        const clusterId = features[0].properties.cluster_id;
        map.getSource('destinations').getClusterExpansionZoom(clusterId, (err, zoom) => {
          if (err) return;
          map.easeTo({ center: features[0].geometry.coordinates, zoom });
        });
      });

      map.on('click', 'unclustered-point', evt => {
        const coordinates = evt.features[0].geometry.coordinates.slice();
        const html = evt.features[0].properties.popup;
        new maplibregl.Popup().setLngLat(coordinates).setHTML(html).addTo(map);
      });

      map.on('mouseenter', 'clusters', () => { map.getCanvas().style.cursor = 'pointer'; });
      map.on('mouseleave', 'clusters', () => { map.getCanvas().style.cursor = ''; });
    }

    const b = computeBounds(filtered);
    if (b) {
      const bounds = new maplibregl.LngLatBounds([b.west, b.south], [b.east, b.north]);
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
