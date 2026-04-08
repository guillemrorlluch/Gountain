export const BOOT_COLORS = {
  Cualquiera: '#22c55e',
  Depende: '#f59e0b',
  'Bestard Teix Lady GTX': '#3498db',
  'Scarpa Ribelle Lite HD': '#e74c3c',
  'Scarpa Zodiac Tech LT GTX': '#7f8c8d',
  'La Sportiva Aequilibrium ST GTX': '#9b59b6',
  'La Sportiva Nepal Cube GTX': '#ef4444',
  'Nepal (doble bota técnica de alta montaña)': '#dc2626',
  'Botas triple capa (8000 m+)': '#d97706',
  'Otras ligeras (para trekking no técnico)': '#14b8a6'
};

const BOOT_PRIORITY = [
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

const CONTINENT_MAP = new Map([
  ['asia', 'Asia'],
  ['áfrica', 'África'],
  ['africa', 'África'],
  ['north america', 'América del Norte'],
  ['norteamérica', 'América del Norte'],
  ['south america', 'América del Sur'],
  ['sudamérica', 'América del Sur'],
  ['antarctica', 'Antártida'],
  ['antartida', 'Antártida'],
  ['europe', 'Europa'],
  ['oceania', 'Oceanía'],
  ['oceanía', 'Oceanía']
]);

export function normalizeDiff(diff) {
  if (!diff) return 'Trek';
  if (diff.startsWith('AD')) return 'AD';
  if (diff.startsWith('PD')) return 'PD';
  if (diff.startsWith('D')) return 'D';
  if (diff.startsWith('F')) return 'F';
  return diff.includes('Trek') ? 'Trek' : diff;
}

export function markerColor(destination, bootColors = BOOT_COLORS) {
  for (const boot of BOOT_PRIORITY) {
    if (Array.isArray(destination.botas) && destination.botas.includes(boot)) {
      return bootColors[boot] || '#22c55e';
    }
  }
  return '#22c55e';
}

export function monthsToSeasons(meses) {
  const monthMap = { Jan:1, Feb:2, Mar:3, Apr:4, May:5, Jun:6, Jul:7, Aug:8, Sep:9, Oct:10, Nov:11, Dec:12 };
  if (!meses) return [];
  if (meses.toLowerCase().includes('todo')) return ['Invierno', 'Primavera', 'Verano', 'Otoño'];
  const parts = meses.split(/[–-]/).map((p) => p.trim());
  if (parts.length < 2) return [];
  const start = monthMap[parts[0].slice(0, 3)];
  const end = monthMap[parts[1].slice(0, 3)];
  if (!start || !end) return [];

  const months = [];
  let m = start;
  while (true) {
    months.push(m);
    if (m === end) break;
    m = (m % 12) + 1;
  }

  const seasons = new Set();
  months.forEach((month) => {
    if ([12, 1, 2].includes(month)) seasons.add('Invierno');
    else if ([3, 4, 5].includes(month)) seasons.add('Primavera');
    else if ([6, 7, 8].includes(month)) seasons.add('Verano');
    else if ([9, 10, 11].includes(month)) seasons.add('Otoño');
  });

  return [...seasons];
}

export function normalizeDestination(record = {}) {
  const coords = Array.isArray(record.coords) ? record.coords : [null, null];
  const lat = Number(coords[0]);
  const lng = Number(coords[1]);
  const normalizedContinent = normalizeContinent(record.continente);

  return {
    ...record,
    id: record.id || `${record.nombre || record.name || 'dest'}-${lat}-${lng}`,
    name: record.name || record.nombre || '',
    nombre: record.nombre || record.name || '',
    continente: normalizedContinent,
    coords: [Number.isFinite(lat) ? lat : 0, Number.isFinite(lng) ? lng : 0]
  };
}

export function normalizeContinent(continent) {
  if (!continent) return continent;
  const key = String(continent).trim().toLowerCase();
  return CONTINENT_MAP.get(key) || continent;
}

function matchesSeason(destination, selectedSeasons) {
  if (!selectedSeasons?.size) return true;
  const explicit = Array.isArray(destination.seasons) ? destination.seasons : monthsToSeasons(destination.meses);
  return explicit.some((season) => selectedSeasons.has(season));
}

export function withinFilters(destination, filters = {}) {
  const continent = filters.continente?.size === 0 || filters.continente?.has?.(destination.continente);
  const difficulty = filters.dificultad?.size === 0 || filters.dificultad?.has?.(normalizeDiff(destination.dificultad));
  const type = filters.tipo?.size === 0 || filters.tipo?.has?.(destination.tipo);
  const boots = filters.botas?.size === 0 || (Array.isArray(destination.botas) && destination.botas.some((b) => filters.botas.has(b)));
  const season = matchesSeason(destination, filters.season);
  const altitudeValue = Number(destination.altitud_m ?? destination.altitud);
  const altitudeMin = filters.altitude?.min == null || altitudeValue >= filters.altitude.min;
  const altitudeMax = filters.altitude?.max == null || altitudeValue <= filters.altitude.max;
  return continent && difficulty && type && boots && season && altitudeMin && altitudeMax;
}

export function computeBounds(list) {
  if (!Array.isArray(list) || list.length === 0) return null;
  let west = Infinity;
  let south = Infinity;
  let east = -Infinity;
  let north = -Infinity;

  for (const destination of list) {
    const lat = destination.coords[0];
    const lng = destination.coords[1];
    if (lng < west) west = lng;
    if (lng > east) east = lng;
    if (lat < south) south = lat;
    if (lat > north) north = lat;
  }

  return { west, south, east, north };
}
