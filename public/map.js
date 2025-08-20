import { MAPBOX_TOKEN, getBuildId } from '/dist/app.bundle.js';

const debug = (...args) => { if (localStorage.debug === '1') console.log(...args); };
const STYLES = {
  standard: 'mapbox://styles/mapbox/streets-v12',
  satellite: 'mapbox://styles/mapbox/satellite-v9',
  hybrid:   'mapbox://styles/mapbox/satellite-streets-v12'
};

let map;
let allDestinos = [];
const healthEl = document.getElementById('map-health');
const setHealth = t => { if (healthEl) healthEl.textContent = t; };

function mount(){
  if (window.__GOUNTAIN_MAP_MOUNTED__) return;
  window.__GOUNTAIN_MAP_MOUNTED__ = true;
  debug('mount');

  if (!MAPBOX_TOKEN){ setHealth('Missing Mapbox token'); return; }
  if (typeof mapboxgl === 'undefined'){ setHealth('Mapbox GL JS not loaded'); return; }

  mapboxgl.accessToken = MAPBOX_TOKEN;
  map = new mapboxgl.Map({
    container: 'map',
    style: STYLES.standard,
    center: [0,0],
    zoom: 2
  });

  map.addControl(new mapboxgl.NavigationControl(), 'top-right');
  map.addControl(new mapboxgl.GeolocateControl({
    positionOptions: { enableHighAccuracy: true },
    trackUserLocation: false,
    showUserHeading: false
  }), 'top-right');

  map.on('load', () => {
    setHealth('Map ready');
    enableTerrainAndSky();
    buildStyleSwitcher();
    loadDestinos();
  });

  map.on('style.load', () => {
    enableTerrainAndSky();
    if (allDestinos.length) reattachSourcesAndLayers();
  });
}

document.addEventListener('DOMContentLoaded', mount);

function enableTerrainAndSky(){
  if (!map.getSource('mapbox-dem')){
    map.addSource('mapbox-dem', {
      type:'raster-dem',
      url:'mapbox://mapbox.mapbox-terrain-dem-v1',
      tileSize:512,
      maxzoom:14
    });
  }
  map.setTerrain({ source:'mapbox-dem', exaggeration:1.0 });
  if (!map.getLayer('sky')){
    map.addLayer({
      id:'sky', type:'sky',
      paint:{ 'sky-type':'atmosphere', 'sky-atmosphere-sun':[0,0], 'sky-atmosphere-sun-intensity':15 }
    });
  }
}

function buildStyleSwitcher(){
  const host = document.getElementById('basemap-switcher');
  if (!host) return;
  host.innerHTML = '';
  const buttons = [
    ['Standard','standard'],
    ['Satellite','satellite'],
    ['Hybrid','hybrid'],
    ['3D','3d']
  ];
  buttons.forEach(([label,key]) => {
    const btn = document.createElement('button');
    btn.textContent = label;
    btn.addEventListener('click', () => {
      if (key === '3d'){ toggle3D(); setActive(btn); return; }
      const style = STYLES[key];
      if (style){
        debug('style switch', style);
        map.setStyle(style);
        setActive(btn);
      }
    });
    host.appendChild(btn);
  });
  function setActive(active){
    [...host.children].forEach(b => b.classList.toggle('active', b === active));
  }
  if (host.firstChild) setActive(host.firstChild);
}

function toggle3D(){
  const pitch = map.getPitch();
  map.easeTo({ pitch: pitch === 0 ? 60 : 0, bearing: pitch === 0 ? -30 : 0, duration: 1000 });
}

async function loadDestinos(){
  try{
    const res = await fetch(`/data/destinos.json?v=${getBuildId()}`, { cache: 'no-store' });
    const data = await res.json();
    allDestinos = data.map(d => ({ ...d }));
    debug('data loaded', allDestinos.length);
    reattachSourcesAndLayers();
    renderChips(allDestinos);
  }catch(err){
    console.error('Error loading destinos', err);
    setHealth('Failed to load data');
  }
}

function reattachSourcesAndLayers(){
  const geo = buildGeo(allDestinos);
  if (map.getSource('destinos')){
    ['cluster-count','clusters','unclustered-point','destino-labels'].forEach(id => {
      if (map.getLayer(id)) map.removeLayer(id);
    });
    map.removeSource('destinos');
  }
  map.addSource('destinos', {
    type:'geojson',
    data: geo,
    cluster:true,
    clusterRadius:50,
    clusterMaxZoom:9
  });
  map.addLayer({
    id:'clusters', type:'circle', source:'destinos', filter:['has','point_count'],
    paint:{
      'circle-color':'#2b6cb0',
      'circle-radius':['step',['get','point_count'],18,10,22,50,28,100,34,500,40],
      'circle-stroke-width':2,
      'circle-stroke-color':'#fff'
    }
  });
  map.addLayer({
    id:'cluster-count', type:'symbol', source:'destinos', filter:['has','point_count'],
    layout:{ 'text-field':['get','point_count_abbreviated'], 'text-size':14 },
    paint:{ 'text-color':'#ffffff' }
  });
  map.addLayer({
    id:'unclustered-point', type:'circle', source:'destinos', filter:['!',['has','point_count']],
    paint:{ 'circle-radius':6, 'circle-color':['get','color'], 'circle-stroke-width':1, 'circle-stroke-color':'#fff' }
  });
  map.addLayer({
    id:'destino-labels', type:'symbol', source:'destinos', filter:['!',['has','point_count']],
    layout:{ 'text-field':['get','nombre'], 'text-size':12, 'text-offset':[0,1.2], 'text-allow-overlap':true },
    paint:{ 'text-color':'#e5e7eb', 'text-halo-color':'#111827', 'text-halo-width':1 }
  });

  map.off('click', 'unclustered-point', onUnclusteredClick);
  map.off('click', 'clusters', onClusterClick);
  map.off('mouseenter', 'clusters', onClusterEnter);
  map.off('mouseleave', 'clusters', onClusterLeave);

  map.on('click', 'unclustered-point', onUnclusteredClick);
  map.on('click', 'clusters', onClusterClick);
  map.on('mouseenter', 'clusters', onClusterEnter);
  map.on('mouseleave', 'clusters', onClusterLeave);
  debug('layers reattached');
}

function onUnclusteredClick(e){
  const f = e.features && e.features[0];
  if (!f) return;
  const coords = f.geometry.coordinates.slice();
  const html = f.properties && f.properties.html ? f.properties.html : '';
  const popup = new mapboxgl.Popup({
    closeOnMove:false,
    offset:16,
    anchor:'top',
    maxWidth:'420px'
  })
    .setLngLat(coords)
    .setHTML(html)
    .addTo(map);
  map.easeTo({ center: coords, duration:800, padding:{ top:80, right:28, bottom:140, left:28 } });
}

function onClusterClick(e){
  const features = map.queryRenderedFeatures(e.point, { layers:['clusters'] });
  const clusterId = features[0].properties.cluster_id;
  map.getSource('destinos').getClusterExpansionZoom(clusterId, (err, zoom) => {
    if (err) return;
    map.easeTo({ center: features[0].geometry.coordinates, zoom });
  });
}
function onClusterEnter(){ map.getCanvas().style.cursor = 'pointer'; }
function onClusterLeave(){ map.getCanvas().style.cursor = ''; }

function buildGeo(list){
  return {
    type:'FeatureCollection',
    features:list.map(d => ({
      type:'Feature',
      geometry:{ type:'Point', coordinates:[d.coords[1], d.coords[0]] },
      properties:{ ...d, color: markerColor(d), html: popupHtml(d) }
    }))
  };
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
function markerColor(d){
  if (Array.isArray(d.botas)){
    for (const [boot,color] of Object.entries(BOOT_COLORS)){
      if (d.botas.includes(boot)) return color;
    }
  }
  return '#22c55e';
}

function popupHtml(d){
  const title = d.nombre || '';
  const where = d.pais ? ` (${d.pais})` : '';
  const q = encodeURIComponent(`${title}${where}`);
  const gUrl = `https://www.google.com/search?q=${q}`;
  const boots = Array.isArray(d.botas) ? d.botas.map(b=>`<span class="pill">${b}</span>`).join('') : '';
  const links = [
    ['AllTrails', d.alltrails],
    ['Wikiloc', d.wikiloc],
    ['Wikipedia', d.wikipedia]
  ].filter(([,u]) => u);
  const linksHtml = links.length ? `<div class="links">${links.map(([L,U])=>`<a class="btn-link" href="${U}" target="_blank" rel="noopener">${L}</a>`).join('')}</div>` : '';
  return `<div class="popup">
    <h3><a href="${gUrl}" target="_blank" rel="noopener">${title}${where}</a></h3>
    ${boots ? `<div class="section"><strong>Botas:</strong><div class="pills">${boots}</div></div>` : ''}
    ${linksHtml}
  </div>`;
}

function renderChips(list){
  const bar = document.getElementById('dest-chips');
  if (!bar) return;
  bar.innerHTML = '';
  const names = [...new Set(list.map(d => d.nombre).filter(Boolean))];
  names.forEach(name => {
    const chip = document.createElement('div');
    chip.className = 'chip';
    chip.textContent = name;
    chip.addEventListener('click', () => {
      const destino = list.find(d => d.nombre === name);
      if (destino) {
        map.flyTo({ center:[destino.coords[1], destino.coords[0]], zoom:8 });
      }
    });
    bar.appendChild(chip);
  });
  debug('chips rendered', names.length);
}
