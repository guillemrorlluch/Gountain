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

const map = L.map('map', { zoomControl: true }).setView([28, 10], 3);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 18,
  attribution: '&copy; OpenStreetMap'
}).addTo(map);

const state = {
  data: [],
  continents: new Set(),
  difficulties: new Set(),
  boots: new Set(),
  tipos: new Set(),
  filters: { continente: new Set(), dificultad: new Set(), botas: new Set(), tipo: new Set() },
  markers: []
};

const $ = (sel) => document.querySelector(sel);
$('#btnMenu').onclick = () => $('#sidebar').classList.toggle('hidden');
$('#btnInfo').onclick = () => $('#glossary').classList.toggle('hidden');
$('#clearFilters').onclick = () => { for (const k of Object.keys(state.filters)) state.filters[k].clear(); renderFilters(); renderMarkers(); };

function bootLegendList() {
  const ul = document.getElementById('legend-botas'); ul.innerHTML = '';
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
  el.onclick = () => { if (state.filters[group].has(key)) state.filters[group].delete(key); else state.filters[group].add(key); el.classList.toggle('active'); renderMarkers(); };
  return el;
}

function renderFilters() {
  const fc = document.getElementById('filter-continente'),
        fd = document.getElementById('filter-dificultad'),
        fb = document.getElementById('filter-botas'),
        ft = document.getElementById('filter-tipo');
  fc.innerHTML = fd.innerHTML = fb.innerHTML = ft.innerHTML = '';
  [...state.continents].sort().forEach(c => fc.appendChild(chip(c,'continente',c)));
  [...state.difficulties].sort().forEach(d => fd.appendChild(chip(d,'dificultad',d)));
  [...state.boots].forEach(b => fb.appendChild(chip(b,'botas',b)));
  [...state.tipos].sort().forEach(t => ft.appendChild(chip(t,'tipo',t)));
}

function normalizeDiff(diff) {
  if (!diff) return 'Trek';
  if (diff.startsWith('D')) return 'D';
  if (diff.startswith?.('AD') || diff.startsWith('AD')) return 'AD';
  if (diff.startsWith('PD')) return 'PD';
  if (diff.startsWith('F')) return 'F';
  return diff.includes('Trek') ? 'Trek' : 'Trek';
}

function withinFilters(d) {
  const F = state.filters;
  const cont = F.continente.size===0 || F.continente.has(d.continente);
  const dif  = F.dificultad.size===0 || F.dificultad.has(normalizeDiff(d.dificultad));
  const tipo = F.tipo.size===0 || F.tipo.has(d.tipo);
  const botas = F.botas.size===0 || d.botas.some(b => F.botas.has(b));
  return cont && dif && tipo && botas;
}

function markerColor(d) {
  const pr = ["Scarpa Ribelle Lite HD","La Sportiva Aequilibrium ST GTX","Scarpa Zodiac Tech LT GTX","Bestard Teix Lady GTX","La Sportiva Nepal Cube GTX","Nepal (doble bota técnica de alta montaña)","Botas triple capa (8000 m+)","Cualquiera","Depende","Otras ligeras (para trekking no técnico)"];
  for (const p of pr) if (d.botas.includes(p)) return BOOT_COLORS[p] || '#22c55e';
  return '#22c55e';
}

function popupHtml(d) {
  const bootsBadges = d.botas.map(b => `<span class="badge">${b}</span>`).join(' ');
  return `<div style="min-width:260px;max-width:360px">
    <div style="font-weight:700;font-size:15px;margin-bottom:4px">${d.nombre} (${d.pais})</div>
    <div><b>Continente:</b> ${d.continente} · <b>Tipo:</b> ${d.tipo}</div>
    <div><b>Altitud:</b> ${d.altitud_m} m · <b>Dificultad:</b> ${d.dificultad}</div>
    <div style="margin-top:4px"><b>Meses:</b> ${d.meses} · <b>Temp aprox:</b> ${d.temp_aprox}</div>
    <div style="margin-top:6px"><b>Botas:</b><br>${bootsBadges}</div>
    <div style="margin-top:6px"><b>Scrambling/Escalada:</b> ${d.scramble.si ? 'Sí' : 'No'}; Grado: ${d.scramble.grado || '-'}; Arnés: ${d.scramble.arnes ? 'Sí' : 'No'}</div>
    <div><b>Equipo:</b> ${(d.equipo||[]).join(', ') || '—'}</div>
    <div><b>Vivac:</b> ${d.vivac} · <b>Camping gas:</b> ${d.gas}</div>
    <div><b>Permisos:</b> ${d.permisos} · <b>Guía:</b> ${d.guia}</div>
    <div><b>Coste estancia:</b> ${d.coste_estancia}</div>
    <div style="margin-top:6px"><b>Reseña:</b> ${d.resena}</div>
  </div>`;
}

async function loadData() {
  const res = await fetch('./data/destinos.json');
  const data = await res.json();
  state.data = data;
  data.forEach(d => {
    state.continents.add(d.continente);
    state.difficulties.add(normalizeDiff(d.dificultad));
    d.botas.forEach(b => state.boots.add(b));
    state.tipos.add(d.tipo);
  });
  renderFilters();
  renderMarkers();
  bootLegendList();
}

function clearMarkers() { state.markers.forEach(m => map.removeLayer(m)); state.markers = []; }

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

loadData();

// ... aquí va todo tu código de la app ...

// 🔹 Registro del Service Worker para controlar el caché
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw-v4.js")
      .then(reg => console.log("✅ Service Worker registrado:", reg.scope))
      .catch(err => console.error("❌ Error al registrar SW:", err));
  });
}
