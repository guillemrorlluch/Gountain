import { createEmpty847Input } from '../RouteReadinessModelProduction.js';

function clamp01To100(value, fallback = 50) {
  const num = Number(value);
  if (!Number.isFinite(num)) return fallback;
  return Math.max(0, Math.min(100, Math.round(num)));
}

export function routeDemandTo847Input(routeDemand = {}) {
  const input = createEmpty847Input(50);

  const distanceKm = Number(routeDemand.physical?.distance) || 0;
  const gain = Number(routeDemand.physical?.elevation_gain) || 0;
  const loss = Number(routeDemand.physical?.elevation_loss) || 0;
  const durationHours = Number(routeDemand.physical?.duration_estimate) || 0;
  const maxAltitude = Number(routeDemand.environmental?.altitude?.max) || 0;
  const complexity = Number(routeDemand.technical?.terrain_complexity) || 50;
  const exposureScore = Number(routeDemand.technical?.exposure_score);
  const remoteness = Number(routeDemand.environmental?.remoteness) || 35;
  const commitment = Number(routeDemand.logistics?.commitment) || 45;
  const bailoutDifficulty = Number(routeDemand.logistics?.bailout_difficulty) || 45;
  const completeness = Number(routeDemand.confidence?.completeness) || 0;

  input.route_physical_distance_load = clamp01To100(distanceKm * 5.5, 50);
  input.route_physical_elevation_gain_load = clamp01To100(gain / 35, 48);
  input.route_physical_elevation_loss_load = clamp01To100(loss / 35, 48);
  input.route_physical_moving_time_load = clamp01To100(durationHours * 8, 50);
  input.route_physical_total_time_load = clamp01To100(durationHours * 9, 50);
  input.route_physical_max_altitude_load = clamp01To100(maxAltitude / 80, 40);
  input.route_physical_avg_gradient_load = clamp01To100((gain / Math.max(distanceKm * 1000, 1)) * 100 * 5, 40);

  input.route_technical_terrain_technicality_demand = clamp01To100(complexity, 50);
  input.route_technical_route_finding_demand = clamp01To100(complexity + 6, 55);
  input.route_technical_scrambling_demand = clamp01To100(complexity + 8, 55);
  input.route_technical_exposure_demand = Number.isFinite(exposureScore)
    ? clamp01To100(exposureScore, 52)
    : clamp01To100(complexity + 4, 52);

  input.weather_environment_remoteness_risk = clamp01To100(remoteness, 35);
  input.route_operations_commitment_difficulty = clamp01To100(commitment, 45);
  input.route_operations_bailout_difficulty = clamp01To100(bailoutDifficulty, 45);

  // GPX gives direct route geometry, improving route confidence over static inferred mappings.
  input.data_quality_route_data_confidence = clamp01To100(72 + completeness * 24, 75);
  input.data_quality_map_data_confidence = clamp01To100(65 + completeness * 20, 70);
  input.data_quality_weather_data_confidence = 58;

  return input;
}

export default routeDemandTo847Input;
