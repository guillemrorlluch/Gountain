const fs = require('fs');
const path = require('path');

// Archivo de destinos
const filePath = path.join(__dirname, 'data', 'destinos.json');
let destinos = JSON.parse(fs.readFileSync(filePath, 'utf8'));

// Utilidad para normalizar nombres (sin acentos/diacríticos, lowercase)
const normalize = str =>
  str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();

// Lista completa de 125 nombres y continentes (mapeados a la app)
const nuevos = [
  // --- América del Norte
  ['Chilkoot Trail', 'América del Norte'],
  ['Apsciik Tasii', 'América del Norte'],
  ['Canol Heritage Trail', 'América del Norte'],
  ['Tonquin Valley Trail', 'América del Norte'],
  ['Plain of Six Glaciers Trail', 'América del Norte'],
  ['Bruce Trail', 'América del Norte'],
  ['Charlevoix Traverse', 'América del Norte'],
  ['Fundy Footpath', 'América del Norte'],
  ['Skyline Trail', 'América del Norte'],
  ['East Coast Trail', 'América del Norte'],
  ['Kaʻena Point Trail', 'América del Norte'],
  ['Hoh River Trail', 'América del Norte'],
  ['Wapama and Rancheria Falls Trail', 'América del Norte'],
  ['Pacific Crest Trail', 'América del Norte'],
  ['East Mesa Trail to Observation Point', 'América del Norte'],
  ['Fairyland Loop Trail', 'América del Norte'],
  ['Teton Crest Trail', 'América del Norte'],
  ['Rim-to-Rim', 'América del Norte'],
  ['West Maroon Pass Trail', 'América del Norte'],
  ['Black Elk Peak Trail', 'América del Norte'],
  ['Pueblo Alto Loop Trail', 'América del Norte'],
  ['Superior Hiking Trail', 'América del Norte'],
  ['Spite Highway', 'América del Norte'],
  ['Lake Chicot Loop', 'América del Norte'],
  ['Northville–Placid Trail', 'América del Norte'],
  ['Appalachian Trail', 'América del Norte'],
  ['The Bermuda Railway Trail', 'América del Norte'],
  ['Blue Mountain Peak Trail', 'América del Norte'],
  ['Waitukubuli National Trail', 'América del Norte'],
  ['Arctic Circle Trail', 'América del Norte'],

  // --- América del Sur
  ['Tararecua Canyon', 'América del Sur'],
  ['El Mirador', 'América del Sur'],
  ['The Quetzal Trail', 'América del Sur'],
  ['Corcovado National Park', 'América del Sur'],
  ['Valle de Cocora', 'América del Sur'],
  ['Quilotoa Loop', 'América del Sur'],
  ['Choquequirao', 'América del Sur'],
  ['Colca Canyon', 'América del Sur'],
  ['Isla del Sol', 'América del Sur'],
  ['Trilho do Ouro', 'América del Sur'],
  ['Ilha Grande Circuit', 'América del Sur'],
  ['Laguna de los Tres', 'América del Sur'],
  ['Birdman Trail', 'América del Sur'],
  ['Dientes de Navarino Circuit', 'América del Sur'],

  // --- Europa
  ['Laugavegurinn Trail', 'Europa'],
  ['The Postman’s Path', 'Europa'],
  ['The Besseggen Ridge', 'Europa'],
  ['Skåneleden', 'Europa'],
  ['Camønoen', 'Europa'],
  ['National Famine Way', 'Europa'],
  ['South West Coast Path', 'Europa'],
  ['Peddars Way and Norfolk Coast Path', 'Europa'],
  ['Cat Bells', 'Europa'],
  ['Twin Valley Ley Line Trail', 'Europa'],
  ['Cwm Idwal', 'Europa'],
  ['The Great Glen Way', 'Europa'],
  ['Fife Coastal Path', 'Europa'],
  ['Pieterpad', 'Europa'],
  ['Escapardenne Eislek Trail', 'Europa'],
  ['Moselsteig', 'Europa'],
  ['The Malerweg', 'Europa'],
  ['Heidschnuckenweg', 'Europa'],
  ['Inn Valley High Trail', 'Europa'],
  ['Adlerweg', 'Europa'],
  ['Tre Cime di Lavaredo', 'Europa'],
  ['Faulhornweg', 'Europa'],
  ['Tour du Mont Blanc', 'Europa'],
  ['Loire Valley', 'Europa'],
  ['GR20', 'Europa'],
  ['Cares Gorge', 'Europa'],
  ['Sámara Circuit', 'Europa'],
  ['Camino de Santiago', 'Europa'],
  ['Levada das 25 Fontes', 'Europa'],
  ['Seven Hanging Valleys Trail', 'Europa'],
  ['Viru Bog Trail', 'Europa'],
  ['Wooden Architecture Route', 'Europa'],
  ['Via Transilvanica', 'Europa'],
  ['Planinica', 'Europa'],
  ['Samaria Gorge', 'Europa'],
  ['Carian Trail', 'Europa'],
  ['Upper Svaneti', 'Europa'],

  // --- África
  ['Palestinian Heritage Trail', 'África'],
  ['Wadi Ghuweir Trail', 'África'],
  ['The Balcony Walk', 'África'],
  ['The Toubkal Circuit', 'África'],
  ['Gola Rainforest to Tiwai Island', 'África'],
  ['Simien Mountains National Park', 'África'],
  ['Congo-Nile Trail', 'África'],
  ['Ngare Ndare Forest', 'África'],
  ['Mulanje Grand Traverse', 'África'],
  ['Grands Circuits', 'África'],
  ['Tok Tokkie Trails', 'África'],
  ['Otter Trail', 'África'],

  // --- Asia
  ['Ak-Suu Transverse', 'Asia'],
  ['K2 Base Camp Trek', 'Asia'],
  ['Chhattisgarh Jungle Trek', 'Asia'],
  ['Valley of Flowers', 'Asia'],
  ['World’s End and Baker’s Falls', 'Asia'],
  ['Langtang Valley', 'Asia'],
  ['The Druk Path', 'Asia'],
  ['Tab Kak Hang Nak Nature Trail', 'Asia'],
  ['Kulen Mountain', 'Asia'],
  ['Viet Hai Trail', 'Asia'],
  ['Batad Rice Terrace Trail', 'Asia'],
  ['MacLehose Trail', 'Asia'],
  ['Teapot Trail', 'Asia'],
  ['The Great Wall', 'Asia'],
  ['Tiger Leaping Gorge Trail', 'Asia'],
  ['Great Baikal Trail', 'Asia'],
  ['Seoul City Wall Trail', 'Asia'],
  ['Mount Miyanoura', 'Asia'],
  ['Michinoku Coastal Trail', 'Asia'],

  // --- Oceanía
  ['Cape to Cape', 'Oceanía'],
  ['Barrk Sandstone Walk', 'Oceanía'],
  ['The Heysen Trail', 'Oceanía'],
  ['Grampians Peak Trail', 'Oceanía'],
  ['Dove Lake–Cradle Mountain', 'Oceanía'],
  ['K’gari (Fraser Island) Great Walk', 'Oceanía'],
  ['Solitary Islands Coastal Walk', 'Oceanía'],
  ['Rakiura Track', 'Oceanía'],
  ['Hooker Valley Track', 'Oceanía'],
  ['Milford Track', 'Oceanía'],
  ['Queen Charlotte Track', 'Oceanía'],
  ['Tongariro Alpine Crossing', 'Oceanía'],
  ['Lake Waikaremoana Track', 'Oceanía'],
];

// Detección duplicados
const existentes = new Set(destinos.map(d => normalize(d.nombre)));

let maxOrden = destinos.reduce((m, d) => Math.max(m, d.id_orden || 0), 0);

// Añadir nuevos
for (const [nombre, continente] of nuevos) {
  if (existentes.has(normalize(nombre))) continue;

  maxOrden++;
  const slug = normalize(nombre).replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

  destinos.push({
    id: slug,
    nombre,
    coords: null,
    pais: null,
    continente,
    tipo: /\b(mount|peak)\b/i.test(nombre) ? 'Pico' : 'Travesía',
    altitud_m: null,
    dificultad: null,
    meses: null,
    temp_aprox: null,
    botas: null,
    scramble: { si: false, grado: '-', arnes: false },
    equipo: null,
    vivac: null,
    gas: null,
    permisos: null,
    guia: null,
    coste_estancia: null,
    reseña: null,
    id_orden: maxOrden,
    google_search: 'https://www.google.com/search?q=' + encodeURIComponent(nombre),
    link: null,
  });
}

// Ordenar por id_orden
destinos.sort((a, b) => a.id_orden - b.id_orden);

// Guardar archivo
fs.writeFileSync(filePath, JSON.stringify(destinos, null, 2), 'utf8');

console.log('Destinos actualizados. Total:', destinos.length);
