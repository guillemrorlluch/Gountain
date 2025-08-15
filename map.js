import { getMapboxToken } from './config.js';

/* global mapboxgl */
(async () => {
  const token = await getMapboxToken();
  if (!token) { 
    console.error('Missing Mapbox token'); 
    alert('Map cannot load (token missing).'); 
    return; 
  }
  mapboxgl.accessToken = token;

  const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v12',
    center: [0, 0],
    zoom: 2
  });

  // ... tu lógica (capas, clústeres, popups, filtros) ...
})();

    map.addControl(new mapboxgl.NavigationControl(), 'top-right');

    (function setupLocate(){
      const btn = document.getElementById('btnLocate');
      if (!btn || !('geolocation' in navigator)) return;
      let userMarker=null;
      const onClick = () => {
        navigator.geolocation.getCurrentPosition(
          (pos)=>{ const {longitude:lng, latitude:lat}=pos.coords;
            userMarker = userMarker || new mapboxgl.Marker({color:'#111'}).addTo(map);
            userMarker.setLngLat([lng,lat]);
            map.easeTo({center:[lng,lat], zoom:Math.max(map.getZoom(),11)});
          },
          ()=>alert('Location not available. Allow permissions (HTTPS required).'),
          { enableHighAccuracy:true, timeout:10000 }
        );
      };
      btn.addEventListener('click', onClick, { passive:true });
    })();

    map.on('load', () => {
      loadDestinos();
    });
  } catch (err) {
    console.error('Error bootstrapping map:', err);
    alert('There was a problem starting the map.');
  }
}

bootstrap();


const state = window.__FILTERS__ = window.__FILTERS__ || {};
state.continents = state.continents || new Set();
let allDestinations = [];

function asPill(t){ return `<span class="pill">${t}</span>`; }
function field(label,val){ if(val==null) return ''; const v=String(val).trim(); if(!v) return ''; return `<div><strong>${label}:</strong> ${v}</div>`; }

function normalizePhotos(d){
  const c = [d.fotos, d.photos, d.images, d.photo];
  const a = c.flatMap(x => Array.isArray(x) ? x : (x ? [x] : [])).filter(u => typeof u === 'string' && u.trim());
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
  const boots = Array.isArray(d.botas) ? d.botas.map(asPill).join('') : '';
  const links = [
    ['Google', d.link || d.google_search],
    ['AllTrails', d.alltrails],
    ['Wikiloc', d.wikiloc],
    ['Wikipedia', d.wikipedia]
  ].filter(([,u]) => u && String(u).trim());
  const linksHtml = links.length ? `<div class="links">${links.map(([L,U])=>`<a class="btn-link" href="${U}" target="_blank" rel="noopener">${L}</a>`).join('')}</div>` : '';

  return `<div class="popup">
    <h3>${d.nombre||''}${d.pais ? ` (${d.pais})` : ''}</h3>
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
      ${field('Scrambling/Escalada', d.scrambling)}
      ${field('Grado', d.grado)}
      ${field('Arnés', d.arnes)}
      ${field('Equipo', d.equipo || '—')}
      ${field('Vivac', d.vivac)}
      ${field('Camping gas', d.camping_gas)}
      ${field('Permisos', d.permisos)}
      ${field('Guía', d.guia)}
      ${field('Coste estancia', d.coste_estancia)}
    </div>
    ${field('Reseña', d.resena ? `“${d.resena}”` : '')}
    ${linksHtml}
    ${photosHtml(d)}
  </div>`;
}

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

function updateMapWith(list){
  const geo = buildGeo(list);
  const src = map.getSource('destinos');
  if (src) {
    src.setData(geo);
    return;
  }
  map.addSource('destinos', { type: 'geojson', data: geo, cluster: true, clusterRadius: 50, clusterMaxZoom: 9 });

  map.addLayer({
    id: 'clusters',
    type: 'circle',
    source: 'destinos',
    filter: ['has', 'point_count'],
    paint: {
      'circle-color': '#2b6cb0',
      'circle-radius': [
        'step', ['get', 'point_count'],
        18, 10, 22, 50, 28, 100, 34, 500, 40
      ],
      'circle-stroke-width': 2,
      'circle-stroke-color': '#fff'
    }
  });

  map.addLayer({
    id: 'cluster-count',
    type: 'symbol',
    source: 'destinos',
    filter: ['has', 'point_count'],
    layout: {
      'text-field': ['get', 'point_count_abbreviated'],
      'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'],
      'text-size': 14
    },
    paint: { 'text-color': '#ffffff' }
  });

  map.addLayer({
    id: 'unclustered-point',
    type: 'circle',
    source: 'destinos',
    filter: ['!', ['has', 'point_count']],
    paint: {
      'circle-radius': 6,
      'circle-color': ['get', 'color'],
      'circle-stroke-width': 1,
      'circle-stroke-color': '#fff'
    }
  });

  map.on('click', 'unclustered-point', (e) => {
    const f = e.features && e.features[0];
    if (!f) return;
    const coords = f.geometry.coordinates.slice();
    const html = f.properties.html || '';
    new mapboxgl.Popup({ closeOnMove: true })
      .setLngLat(coords)
      .setHTML(html)
      .addTo(map);
  });

  map.on('click', 'clusters', (e) => {
    const features = map.queryRenderedFeatures(e.point, { layers: ['clusters'] });
    const clusterId = features[0].properties.cluster_id;
    map.getSource('destinos').getClusterExpansionZoom(clusterId, (err, zoom) => {
      if (err) return;
      map.easeTo({ center: features[0].geometry.coordinates, zoom });
    });
  });

  map.on('mouseenter', 'clusters', () => map.getCanvas().style.cursor = 'pointer');
  map.on('mouseleave', 'clusters', () => map.getCanvas().style.cursor = '');
}

function bindContinentChips(){
  const wrap = document.querySelector('[data-filter="continent"]');
  if (!wrap) return;
  wrap.querySelectorAll('.chip').forEach(btn=>{
    btn.addEventListener('click', () => {
      const v = btn.getAttribute('data-v');
      const on = btn.classList.toggle('active');
      on ? state.continents.add(v) : state.continents.delete(v);
      applyFilters();
    }, { passive: true });
  });
}

function passContinent(d){
  if (!state.continents.size) return true;
  return state.continents.has(d.continente);
}

function applyFilters(){
  const visible = allDestinations.filter(d =>
    passContinent(d)
  );
  updateMapWith(visible);
}

async function loadDestinos(){
  try {
    const res = await fetch(`/data/destinos.json?v=${BUILD_ID}`);
    const data = await res.json();
    allDestinations = data.map(normalizeContinent);
    applyFilters();
  } catch(err){
    console.error('Error loading destinos:', err);
  }
}

bindContinentChips();
