const UNKNOWN = 'unknown';

function clamp01(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(1, n));
}

export function createRouteDemandModel(overrides = {}) {
  return {
    physical: {
      distance: 0,
      elevation_gain: 0,
      elevation_loss: 0,
      duration_estimate: 0,
      ...(overrides.physical || {})
    },
    technical: {
      terrain_complexity: 0,
      exposure: UNKNOWN,
      ...(overrides.technical || {})
    },
    environmental: {
      altitude: { min: null, max: null },
      remoteness: 0,
      weather_exposure: UNKNOWN,
      ...(overrides.environmental || {})
    },
    logistics: {
      commitment: 0,
      bailout_difficulty: 0,
      ...(overrides.logistics || {})
    },
    confidence: {
      completeness: 0,
      source: 'gpx',
      ...(overrides.confidence || {})
    }
  };
}

export function normalizeRouteDemandConfidence(completenessRaw) {
  const bounded = clamp01(completenessRaw);
  return Number(bounded.toFixed(2));
}

export default createRouteDemandModel;
