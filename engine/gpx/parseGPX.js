const EARTH_RADIUS_M = 6371000;

function toRad(value) {
  return (value * Math.PI) / 180;
}

function haversineMeters(a, b) {
  if (!a || !b) return 0;
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lon - a.lon);

  const h = Math.sin(dLat / 2) ** 2
    + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
  return EARTH_RADIUS_M * c;
}

function parseNumber(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function classifySegments(points = []) {
  const segments = { flat: 0, moderate: 0, steep: 0 };

  for (let i = 1; i < points.length; i += 1) {
    const prev = points[i - 1];
    const current = points[i];
    if (prev.ele == null || current.ele == null) continue;

    const distance = haversineMeters(prev, current);
    if (distance <= 0) continue;

    const gradient = Math.abs(((current.ele - prev.ele) / distance) * 100);
    if (gradient < 5) segments.flat += 1;
    else if (gradient < 12) segments.moderate += 1;
    else segments.steep += 1;
  }

  const total = segments.flat + segments.moderate + segments.steep;
  if (!total) {
    return {
      counts: segments,
      ratio: { flat: 0, moderate: 0, steep: 0 }
    };
  }

  return {
    counts: segments,
    ratio: {
      flat: Number((segments.flat / total).toFixed(3)),
      moderate: Number((segments.moderate / total).toFixed(3)),
      steep: Number((segments.steep / total).toFixed(3))
    }
  };
}

function extractPoints(gpxString) {
  const points = [];
  const trkPointRegex = /<trkpt\s+[^>]*lat="([^"]+)"[^>]*lon="([^"]+)"[^>]*>([\s\S]*?)<\/trkpt>/gi;
  let match = trkPointRegex.exec(gpxString);

  while (match) {
    const lat = parseNumber(match[1]);
    const lon = parseNumber(match[2]);
    const body = match[3] || '';
    const eleMatch = body.match(/<ele>([^<]+)<\/ele>/i);
    const timeMatch = body.match(/<time>([^<]+)<\/time>/i);
    const ele = eleMatch ? parseNumber(eleMatch[1]) : null;

    if (lat != null && lon != null) {
      points.push({
        lat,
        lon,
        ele,
        time: timeMatch?.[1] || null
      });
    }

    match = trkPointRegex.exec(gpxString);
  }

  return points;
}

function estimateDurationHours(distanceKm, elevationGainM) {
  const flatKmPerHour = 4.5;
  const ascentMPerHour = 500;
  const flatHours = distanceKm / flatKmPerHour;
  const ascentHours = elevationGainM / ascentMPerHour;
  return Number((flatHours + ascentHours).toFixed(2));
}

async function loadGpxString(input) {
  if (!input) {
    throw new Error('GPX input is required');
  }

  if (typeof input === 'string') {
    const trimmed = input.trim();
    if (trimmed.startsWith('<')) return trimmed;
    if (typeof window !== 'undefined') {
      throw new Error('File paths are not supported in browser context');
    }
    const { readFile } = await import('node:fs/promises');
    const buffer = await readFile(input, 'utf8');
    return buffer;
  }

  if (typeof Blob !== 'undefined' && input instanceof Blob) {
    return input.text();
  }

  if (typeof input.text === 'function') {
    return input.text();
  }

  throw new Error('Unsupported GPX input. Provide GPX XML string, file path, Blob, or File.');
}

export async function parseGPX(input) {
  const gpxString = await loadGpxString(input);
  const points = extractPoints(gpxString);

  if (points.length < 2) {
    return {
      points,
      totalDistanceKm: 0,
      elevationGainM: 0,
      elevationLossM: 0,
      altitudeProfile: { min: null, max: null },
      segmentation: classifySegments(points),
      durationEstimateHours: 0
    };
  }

  let totalDistanceM = 0;
  let elevationGainM = 0;
  let elevationLossM = 0;
  let minAltitude = Infinity;
  let maxAltitude = -Infinity;

  for (let i = 1; i < points.length; i += 1) {
    const prev = points[i - 1];
    const current = points[i];
    totalDistanceM += haversineMeters(prev, current);

    if (current.ele != null) {
      minAltitude = Math.min(minAltitude, current.ele);
      maxAltitude = Math.max(maxAltitude, current.ele);
    }

    if (prev.ele != null && current.ele != null) {
      const delta = current.ele - prev.ele;
      if (delta > 0) elevationGainM += delta;
      else elevationLossM += Math.abs(delta);
    }
  }

  if (points[0].ele != null) {
    minAltitude = Math.min(minAltitude, points[0].ele);
    maxAltitude = Math.max(maxAltitude, points[0].ele);
  }

  const totalDistanceKm = Number((totalDistanceM / 1000).toFixed(2));
  const gain = Math.round(elevationGainM);

  return {
    points,
    totalDistanceKm,
    elevationGainM: gain,
    elevationLossM: Math.round(elevationLossM),
    altitudeProfile: {
      min: Number.isFinite(minAltitude) ? Math.round(minAltitude) : null,
      max: Number.isFinite(maxAltitude) ? Math.round(maxAltitude) : null
    },
    segmentation: classifySegments(points),
    durationEstimateHours: estimateDurationHours(totalDistanceKm, gain)
  };
}

export default parseGPX;
