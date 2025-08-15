import mapboxgl from 'mapbox-gl';
import { MAPBOX_TOKEN, BUILD_ID } from './config.js';

if (!MAPBOX_TOKEN) {
  alert('Map cannot load: missing or invalid Mapbox token.');
  throw new Error('Missing MAPBOX_TOKEN');
}
mapboxgl.accessToken = MAPBOX_TOKEN;

const map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/mapbox/outdoors-v12',
  center: [20, 10],
  zoom: 2.4
});

map.addControl(new mapboxgl.NavigationControl(), 'top-right');

const state = { continents: new Set() };
let allDestinos = [];

function normalizePhotos(d){
  const cands = [d.fotos, d.photos, d.images, d.photo];
  const arr = cands.flatMap(x => Array.isArray(x) ? x : (x ? [x] : []))
                   .filter(u => typeof u === 'string' && u.trim().length > 0);
  return Array.from(new Set(arr));
}

function photosHtml(d){
  const ph = normalizePhotos(d);
  if (!ph.length) return '';
  return `
    <div class="gallery" role="region" aria-label="Fotos del destino">
      ${ph.map(u => `<img loading="lazy" src="${u}" alt="${d.nombre || 'foto'}" />`).join('')}
    </div>
  `;
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

function popupHtml(d) {
  const name = d.nombre || '';
  const country = d.pais || '';
  const alt = (d.altitud_m != null) ? `${d.altitud_m} m` : '';
  const boots = Array.isArray(d.botas) ? d.botas.map(b => `<span class="boot">${b}</span>`).join(' ') : '';

  const price = (d.coste_estancia != null && String(d.coste_estancia).trim() !== '')
    ? `<div><strong>Estimated cost:</strong> ${d.coste_estancia}</div>` : '';

  const guide = (d.guia != null && String(d.guia).trim() !== '')
    ? `<div><strong>Guide needed:</strong> ${d.guia}</div>` : '';

  const review = (d.resena != null && String(d.resena).trim() !== '')
    ? `<div><em>“${d.resena}”</em></div>` : '';

  const links = [];
  const g = d.link || d.google_search;
  if (g) links.push(`<a href="${g}" target="_blank" rel="noopener">Google</a>`);
  if (d.alltrails) links.push(`<a href="${d.alltrails}" target="_blank" rel="noopener">AllTrails</a>`);
  if (d.wikiloc) links.push(`<a href="${d.wikiloc}" target="_blank" rel="noopener">Wikiloc</a>`);
  if (d.wikipedia) links.push(`<a href="${d.wikipedia}" target="_blank" rel="noopener">Wikipedia</a>`);
  const linksHtml = links.length ? `<div class="links">${links.map(l => `<div>${l}</div>`).join('')}</div>` : '';

  return `
  <div class="popup">
    <strong>${name}</strong><br>${country} — ${alt}<br>${boots}
    ${price}${guide}${review}
    ${linksHtml}
    ${photosHtml(d)}
  </div>`;
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
  document.querySelectorAll('#filter-continente .chip').forEach(btn => {
    btn.addEventListener('click', () => {
      const v = btn.getAttribute('data-v');
      const on = btn.classList.toggle('active');
      on ? state.continents.add(v) : state.continents.delete(v);
      applyFilters();
    });
  });
}

function passContinent(d){
  if (!state.continents.size) return true;
  return state.continents.has(d.continente);
}

function applyFilters(){
  const visible = allDestinos.filter(d => passContinent(d));
  updateMapWith(visible);
}

async function loadDestinos(){
  try {
    const res = await fetch(`/data/destinos.json?v=${BUILD_ID}`);
    const data = await res.json();
    allDestinos = data;
    applyFilters();
  } catch(err){
    console.error('Error loading destinos:', err);
  }
}

map.on('load', () => {
  loadDestinos();
});

bindContinentChips();
