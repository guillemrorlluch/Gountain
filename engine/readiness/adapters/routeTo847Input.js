import { createEmpty847Input } from '../RouteReadinessModelProduction.js';

function clamp01To100(value, fallback = 50) {
  const num = Number(value);
  if (!Number.isFinite(num)) return fallback;
  return Math.max(0, Math.min(100, num));
}

const DIFFICULTY_BASE = {
  F: 30,
  PD: 45,
  AD: 62,
  D: 78,
  ED: 88
};

function difficultyToDemand(route = {}) {
  const raw = String(route.dificultad || '').toUpperCase();
  if (raw.startsWith('PD')) return DIFFICULTY_BASE.PD;
  if (raw.startsWith('AD')) return DIFFICULTY_BASE.AD;
  if (raw.startsWith('D')) return DIFFICULTY_BASE.D;
  if (raw.startsWith('ED')) return DIFFICULTY_BASE.ED;
  if (raw.startsWith('F')) return DIFFICULTY_BASE.F;
  return 50;
}

export function routeTo847Input(route = {}) {
  const input = createEmpty847Input(50);
  const altitude = clamp01To100((Number(route.altitud_m) || 0) / 80);
  const technicalDemand = difficultyToDemand(route);

  input.route_physical_max_altitude_load = altitude;
  input.route_physical_elevation_gain_load = clamp01To100((Number(route.desnivel_m) || Number(route.altitud_m) * 0.4 || 0) / 40);
  input.route_physical_distance_load = clamp01To100(Number(route.distancia_km) * 6 || 55);

  input.route_technical_terrain_technicality_demand = technicalDemand;
  input.route_technical_scrambling_demand = route.scramble?.si ? clamp01To100(technicalDemand + 8) : clamp01To100(technicalDemand - 8);
  input.route_technical_exposure_demand = clamp01To100(technicalDemand + (route.scramble?.grado ? 6 : 0));

  input.route_operations_mandatory_gear_difficulty = Array.isArray(route.botas) ? clamp01To100(35 + route.botas.length * 12) : 50;
  input.route_operations_commitment_difficulty = clamp01To100(route.tipo?.includes('Travesía') ? 68 : 52);

  // TODO: map route weather forecasts when a weather feed is connected.
  input.weather_environment_storm_risk = 45;
  input.weather_environment_lightning_risk = 35;
  input.weather_environment_avalanche_risk = 20;

  // TODO: map data confidence from provenance metadata once available.
  input.data_quality_route_data_confidence = 75;
  input.data_quality_map_data_confidence = 72;
  input.data_quality_weather_data_confidence = 60;

  return input;
}

export default routeTo847Input;
