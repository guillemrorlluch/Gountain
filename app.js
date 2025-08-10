// app.js — v9

// --- Config ---
const DATA_VER = '9';
const DATA_URL = `/data/destinos.json?v=${DATA_VER}`;

// Paleta por botas
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
const map = L.map('map', { zoomControl: true }).setView([28, 10], 3);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 18,
  attribution: '&copy; OpenStreetMap'
}).addTo(map);

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
  ul.innerHTML = '';
  for (const [k,color] of Object.entries(BOOT_COLORS)) {
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
  [...state.continents].sort().forEach(c => fc.appendChild(chip(c,'continente',c)));
  [...state.difficulties].sort().forEach(d => fd.appendChild(chip(d,'dificultad',d)));
  [...state.boots].forEach(b => fb.appendChild(chip(b,'botas',b)));
  [...state.tipos].sort().forEach(t => ft.appendChild(chip(t,'tipo',t)));
}

// Normaliza etiquetas de dificultad a buckets
function normalizeDiff(diff) {
  if (!diff) return 'Trek';
  if (diff.startsWith('D')) return 'D';
  if (diff.startsWith('AD')) return 'AD';             // ojo: startsWith bien escrito
  if (diff.startsWith('PD')) return 'PD';
  if (diff.startsWith('F')) return 'F';
  return diff.includes('Trek') ? 'Trek' : 'Trek';
}

function withinFilters(d) {
  const F = state.filters;
  const cont = F.continente.size===0 || F.continente.has(d.continente);
  const dif  = F.dificultad.size===0 || F.dificultad.has(normalizeDiff(d.dificultad));
  const tipo = F.tipo.size===0 || F.tipo.has(d.tipo);
  const botas = F.botas.size===0 || (Array.isArray(d.botas) && d.botas.some(b => F.botas.has(b)));
  return cont && dif && tipo && botas;
}

function markerColor(d) {
  const pr = [
    "Scarpa Ribelle Lite HD",
    "La Sportiva Aequilibrium ST GTX",
    "Scarpa Zodiac Tech LT GTX",
    "Bestard Teix Lady GTX",
    "La Sportiva Nepal Cube GTX",
    "Nepal (doble bota técnica de alta montaña)",
    "Botas triple capa (8000 m+)",
    "Cualquiera",
    "Depende",
    "Otras ligeras (para trekking no técnico)"
  ];
  for (const p of pr) if (Array.isArray(d.botas) && d.botas.includes(p)) return BOOT_COLORS[p] || '#22c55e';
  return '#22c55e';
}

// Pop-up con enlace si hay `link` o `google_search`
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
    <div><b>Equipo:</b> ${(d.equipo||[]).join(', ') || '—'}</div>
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
  state.markers.forEach(m => map.removeLayer(m)); 
  state.markers = []; 
}

function renderMarkers() {
  clearMarkers();
  const filtered = state.data.filter(withinFilters);
  filtered.forEach(d => {
    const col = markerColor(d);
    const marker = L.circleMarker(d.coords, { radius: 8, color: col, fillColor: col, fillOpacity: 0.9 });
    marker.bindPopup(popupHtml(d));
    marker.addTo(map);
    state.markers.push(marker);
  });
  if (filtered.length) {
    const group = new L.featureGroup(state.markers);
    map.fitBounds(group.getBounds().pad(0.2));
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
      });

      let refreshing = false;
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (refreshing) return;
        refreshing = true;
        window.location.reload();
      });
    } catch (err) {
      console.error('❌ Error registrando SW:', err);
    }
  });
}
