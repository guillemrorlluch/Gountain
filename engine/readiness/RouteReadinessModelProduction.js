// RouteReadinessModelProduction.js
// Gountain — Route Readiness Model (production-oriented v1)
// Exact variable registry: 847 variables
// JavaScript port for current JS-first repository, preserving baseline structure.

function clamp(n, min = 0, max = 100) {
  return Math.max(min, Math.min(max, n));
}

function round(n) {
  return Math.round(n * 10) / 10;
}

function avg(values) {
  if (!values.length) return 0;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

function weightedAverage(items) {
  const totalWeight = items.reduce((sum, item) => sum + item.weight, 0);
  if (totalWeight <= 0) return 0;
  const weightedSum = items.reduce((sum, item) => sum + item.value * item.weight, 0);
  return weightedSum / totalWeight;
}

function ratioMatch(capacity, demand) {
  if (demand <= 0) return 100;
  const ratio = capacity / demand;
  if (ratio >= 1.2) return 95;
  if (ratio >= 1.0) return 85 + (ratio - 1.0) * 50;
  if (ratio >= 0.8) return 55 + (ratio - 0.8) * 150;
  if (ratio >= 0.6) return 25 + (ratio - 0.6) * 150;
  return clamp(ratio * 40);
}

function makeFixedVariables(group, keys, usage, layer = 'raw') {
  return keys.map((key) => ({
    key,
    label: key,
    group,
    layer,
    type: 'number',
    usage,
    min: 0,
    max: 100
  }));
}

function makeCartesianVariables(group, namespace, dimensions, metrics, usage, layer = 'raw') {
  const out = [];
  for (const dimension of dimensions) {
    for (const metric of metrics) {
      out.push({
        key: `${namespace}_${dimension}_${metric}`,
        label: `${namespace} ${dimension} ${metric}`,
        group,
        layer,
        type: 'number',
        usage,
        min: 0,
        max: 100
      });
    }
  }
  return out;
}

const BASE_PROFILE = makeFixedVariables('base_profile', [
  'user_profile_age_score',
  'user_profile_weight_score',
  'user_profile_height_score',
  'user_profile_pack_weight_score',
  'user_profile_bmi_proxy_score',
  'user_profile_home_altitude_score',
  'user_profile_training_years_score',
  'user_profile_primary_sport_score',
  'user_profile_secondary_sport_score',
  'user_profile_general_mobility_score',
  'user_profile_general_resilience_score',
  'user_profile_schedule_flexibility_score',
  'user_profile_sleep_baseline_score',
  'user_profile_nutrition_baseline_score',
  'user_profile_hydration_baseline_score',
  'user_profile_time_budget_score',
  'user_profile_risk_tolerance_score',
  'user_profile_decision_discipline_score',
  'user_profile_stress_load_score',
  'user_profile_heat_tolerance_score',
  'user_profile_cold_tolerance_score',
  'user_profile_altitude_tolerance_score',
  'user_profile_exposure_tolerance_score',
  'user_profile_self_rescue_baseline_score',
  'user_profile_navigation_baseline_score',
  'user_profile_group_dependence_score',
  'user_profile_recent_illness_flag_score',
  'user_profile_medical_constraints_flag_score'
], 'score');

const USER_FITNESS = makeCartesianVariables('user_fitness', 'user_fitness', [
  'aerobic_capacity', 'anaerobic_capacity', 'muscular_endurance', 'leg_strength', 'uphill_efficiency',
  'downhill_tolerance', 'cadence_control', 'heart_rate_control', 'power_hiking_capacity', 'core_stability',
  'mobility', 'durability'
], ['status', 'baseline', 'trend', 'recent', 'chronic', 'confidence'], 'score');

const USER_RECOVERY = makeCartesianVariables('user_recovery', 'user_recovery',
  ['fatigue', 'recovery', 'sleep', 'hrv', 'resting_hr', 'strain'],
  ['status', 'baseline', 'trend', 'penalty', 'confidence'], 'penalty');

const USER_CONSTRAINTS = makeCartesianVariables('user_constraints', 'user_constraints',
  ['knee', 'ankle', 'hip', 'lower_back', 'shoulder', 'foot', 'vertigo', 'pain', 'health'],
  ['risk', 'status', 'trend', 'penalty'], 'penalty');

const USER_EXPERIENCE = makeCartesianVariables('user_experience', 'user_experience', [
  'hiking', 'trekking', 'scrambling', 'snow', 'ice', 'navigation', 'altitude', 'multi_day',
  'night_movement', 'winter_travel', 'glacier_travel', 'bivouac'
], ['experience', 'recency', 'volume', 'success', 'confidence'], 'score');

const USER_GEAR = makeCartesianVariables('user_gear', 'user_gear', [
  'footwear', 'socks', 'layering', 'shell', 'insulation', 'pack', 'poles', 'hydration',
  'nutrition', 'navigation_tools', 'emergency_kit', 'battery_system'
], ['match', 'readiness', 'redundancy', 'confidence'], 'score');

const USER_SKILLS = makeCartesianVariables('user_skills', 'user_skills', [
  'weather_reading', 'route_planning', 'bailout_planning', 'group_management',
  'self_rescue', 'pace_control', 'risk_assessment', 'decision_making'
], ['skill', 'readiness', 'trend', 'confidence'], 'score');

const ROUTE_PHYSICAL = makeCartesianVariables('route_physical', 'route_physical', [
  'distance', 'elevation_gain', 'elevation_loss', 'moving_time', 'total_time',
  'max_altitude', 'avg_gradient', 'steepest_section'
], ['load', 'severity', 'variability', 'constraint', 'confidence'], 'score');

const ROUTE_SURFACE = makeCartesianVariables('route_surface', 'route_surface',
  ['trail', 'rock', 'scree', 'slab', 'mud', 'snow', 'ice', 'bushwhack', 'river_crossing'],
  ['coverage', 'severity', 'instability', 'consequence', 'confidence'], 'score');

const ROUTE_TECHNICAL = makeCartesianVariables('route_technical', 'route_technical', [
  'terrain_technicality', 'route_finding', 'scrambling', 'exposure', 'rockfall',
  'objective_hazard', 'hands_on_sections', 'consequence_of_error', 'trail_marking'
], ['demand', 'severity', 'penalty', 'confidence'], 'score');

const WEATHER_ENV = makeCartesianVariables('weather_environment', 'weather_environment', [
  'heat', 'cold', 'storm', 'wind', 'precipitation', 'lightning', 'visibility', 'freeze_thaw', 'avalanche', 'remoteness'
], ['risk', 'severity', 'variability', 'penalty', 'confidence'], 'penalty');

const ROUTE_OPERATIONS = makeCartesianVariables('route_operations', 'route_operations', [
  'bailout', 'water_availability', 'daylight', 'seasonality', 'mandatory_gear',
  'access', 'exit', 'signal', 'rescue_delay', 'commitment'
], ['difficulty', 'constraint', 'penalty', 'confidence'], 'score');

const HISTORY_CONTEXT = makeCartesianVariables('history_context', 'history_context', [
  'similar_route', 'similar_distance', 'similar_elevation', 'similar_altitude',
  'similar_exposure', 'similar_terrain', 'recent_mountain_days', 'recent_failures'
], ['match', 'recency', 'success', 'confidence'], 'score');

const DATA_QUALITY = makeCartesianVariables('data_quality', 'data_quality',
  ['user_data', 'route_data', 'weather_data', 'map_data', 'hazard_data', 'history_data', 'gear_data'],
  ['coverage', 'freshness', 'confidence'], 'confidence');

const DERIVED_SUBSCORES = makeCartesianVariables('derived_subscores', 'derived_subscores',
  ['physical_fit', 'technical_fit', 'environmental_fit', 'logistics_fit', 'resilience_fit', 'skills_fit', 'operational_fit'],
  ['score', 'weight', 'confidence', 'priority', 'explanation'], 'score', 'derived');

const DERIVED_MISMATCH = makeCartesianVariables('derived_mismatch', 'derived_mismatch',
  ['distance', 'elevation', 'altitude', 'exposure', 'route_finding', 'weather', 'gear', 'commitment'],
  ['mismatch', 'gap', 'penalty', 'confidence'], 'penalty', 'derived');

const DERIVED_RISK = makeCartesianVariables('derived_risk', 'derived_risk',
  ['fatigue', 'injury', 'technical', 'environmental', 'logistical', 'weather_window', 'objective_hazard', 'decision_quality'],
  ['risk', 'severity', 'penalty', 'confidence'], 'penalty', 'derived');

const DERIVED_CONFIDENCE = makeCartesianVariables('derived_confidence', 'derived_confidence',
  ['model', 'user', 'route', 'weather', 'gear', 'history', 'overall_explainability', 'data_reliability'],
  ['score', 'status', 'priority', 'confidence'], 'confidence', 'derived');

const DERIVED_RECOMMENDATION = makeCartesianVariables('derived_recommendation', 'derived_recommendation',
  ['training', 'gear', 'timing', 'route_choice', 'pacing', 'hydration', 'nutrition', 'partner', 'bailout_plan'],
  ['priority', 'impact', 'urgency', 'confidence'], 'explanation', 'derived');

const DERIVED_PROGRESSION = makeCartesianVariables('derived_progression', 'derived_progression',
  ['base_build', 'uphill_build', 'downhill_build', 'technical_build', 'navigation_build', 'altitude_build', 'multi_day_build', 'winter_build', 'recovery_build'],
  ['readiness', 'gap', 'priority', 'confidence'], 'explanation', 'derived');

const DERIVED_CORE = makeCartesianVariables('derived_core', 'derived_core',
  ['physical_demand', 'technical_demand', 'environmental_demand', 'logistics_demand', 'physical_capacity', 'technical_capacity', 'environmental_capacity', 'logistics_capacity'],
  ['score', 'weight', 'confidence', 'priority'], 'score', 'derived');

const DERIVED_EXPLANATION = makeCartesianVariables('derived_explanation', 'derived_explanation',
  ['readiness', 'gaps', 'timing', 'route_choice', 'safety', 'training', 'gear'],
  ['score', 'priority', 'clarity', 'confidence', 'impact', 'urgency'], 'explanation', 'derived');

export const ROUTE_READINESS_VARIABLES = [
  ...BASE_PROFILE, ...USER_FITNESS, ...USER_RECOVERY, ...USER_CONSTRAINTS, ...USER_EXPERIENCE,
  ...USER_GEAR, ...USER_SKILLS, ...ROUTE_PHYSICAL, ...ROUTE_SURFACE, ...ROUTE_TECHNICAL,
  ...WEATHER_ENV, ...ROUTE_OPERATIONS, ...HISTORY_CONTEXT, ...DATA_QUALITY, ...DERIVED_SUBSCORES,
  ...DERIVED_MISMATCH, ...DERIVED_RISK, ...DERIVED_CONFIDENCE, ...DERIVED_RECOMMENDATION,
  ...DERIVED_PROGRESSION, ...DERIVED_CORE, ...DERIVED_EXPLANATION
];

if (ROUTE_READINESS_VARIABLES.length !== 847) {
  throw new Error(`Expected 847 variables, got ${ROUTE_READINESS_VARIABLES.length}`);
}

export const VARIABLE_KEYS = ROUTE_READINESS_VARIABLES.map((v) => v.key);
export const VARIABLE_INDEX = Object.fromEntries(ROUTE_READINESS_VARIABLES.map((v) => [v.key, v]));

export function createEmpty847Input(defaultValue = 0) {
  return Object.fromEntries(VARIABLE_KEYS.map((key) => [key, defaultValue]));
}

function get(input, key, fallback = 0) {
  const value = input[key];
  return typeof value === 'number' && Number.isFinite(value) ? clamp(value) : fallback;
}

function averageKeys(input, keys) {
  if (!keys.length) return 0;
  return avg(keys.map((k) => get(input, k)));
}

function averageByPrefix(input, prefix) {
  const keys = VARIABLE_KEYS.filter((k) => k.startsWith(prefix));
  return averageKeys(input, keys);
}

const K = {
  userFitness: {
    aerobic: 'user_fitness_aerobic_capacity_', muscularEndurance: 'user_fitness_muscular_endurance_', legStrength: 'user_fitness_leg_strength_', uphill: 'user_fitness_uphill_efficiency_', downhill: 'user_fitness_downhill_tolerance_', mobility: 'user_fitness_mobility_', durability: 'user_fitness_durability_'
  },
  userRecovery: {
    fatigue: 'user_recovery_fatigue_', recovery: 'user_recovery_recovery_', sleep: 'user_recovery_sleep_', hrv: 'user_recovery_hrv_', strain: 'user_recovery_strain_'
  },
  userExperience: {
    hiking: 'user_experience_hiking_', trekking: 'user_experience_trekking_', scrambling: 'user_experience_scrambling_', snow: 'user_experience_snow_', ice: 'user_experience_ice_', navigation: 'user_experience_navigation_', altitude: 'user_experience_altitude_', multiDay: 'user_experience_multi_day_', winter: 'user_experience_winter_travel_', bivouac: 'user_experience_bivouac_'
  },
  userGear: {
    footwear: 'user_gear_footwear_', layering: 'user_gear_layering_', hydration: 'user_gear_hydration_', nutrition: 'user_gear_nutrition_', navigationTools: 'user_gear_navigation_tools_', emergencyKit: 'user_gear_emergency_kit_', battery: 'user_gear_battery_system_', pack: 'user_gear_pack_'
  },
  userSkills: {
    weather: 'user_skills_weather_reading_', routePlanning: 'user_skills_route_planning_', bailoutPlanning: 'user_skills_bailout_planning_', selfRescue: 'user_skills_self_rescue_', paceControl: 'user_skills_pace_control_', riskAssessment: 'user_skills_risk_assessment_', decisionMaking: 'user_skills_decision_making_'
  },
  userConstraints: {
    knee: 'user_constraints_knee_', ankle: 'user_constraints_ankle_', vertigo: 'user_constraints_vertigo_', pain: 'user_constraints_pain_', health: 'user_constraints_health_'
  },
  routePhysical: {
    distance: 'route_physical_distance_', gain: 'route_physical_elevation_gain_', loss: 'route_physical_elevation_loss_', movingTime: 'route_physical_moving_time_', totalTime: 'route_physical_total_time_', altitude: 'route_physical_max_altitude_', gradient: 'route_physical_avg_gradient_', steep: 'route_physical_steepest_section_'
  },
  routeTechnical: {
    technicality: 'route_technical_terrain_technicality_', routeFinding: 'route_technical_route_finding_', scrambling: 'route_technical_scrambling_', exposure: 'route_technical_exposure_', rockfall: 'route_technical_rockfall_', objectiveHazard: 'route_technical_objective_hazard_', consequence: 'route_technical_consequence_of_error_', trailMarking: 'route_technical_trail_marking_'
  },
  weather: {
    heat: 'weather_environment_heat_', cold: 'weather_environment_cold_', storm: 'weather_environment_storm_', wind: 'weather_environment_wind_', precipitation: 'weather_environment_precipitation_', lightning: 'weather_environment_lightning_', visibility: 'weather_environment_visibility_', avalanche: 'weather_environment_avalanche_', remoteness: 'weather_environment_remoteness_'
  },
  ops: {
    bailout: 'route_operations_bailout_', water: 'route_operations_water_availability_', daylight: 'route_operations_daylight_', seasonality: 'route_operations_seasonality_', mandatoryGear: 'route_operations_mandatory_gear_', access: 'route_operations_access_', exit: 'route_operations_exit_', signal: 'route_operations_signal_', rescueDelay: 'route_operations_rescue_delay_', commitment: 'route_operations_commitment_'
  },
  history: {
    similarRoute: 'history_context_similar_route_', similarElevation: 'history_context_similar_elevation_', similarAltitude: 'history_context_similar_altitude_', similarExposure: 'history_context_similar_exposure_', terrain: 'history_context_similar_terrain_', mountainDays: 'history_context_recent_mountain_days_', failures: 'history_context_recent_failures_'
  },
  dataq: {
    user: 'data_quality_user_data_', route: 'data_quality_route_data_', weather: 'data_quality_weather_data_', map: 'data_quality_map_data_', hazard: 'data_quality_hazard_data_', history: 'data_quality_history_data_', gear: 'data_quality_gear_data_'
  }
};

export function derive847(input) {
  const physicalCapacity = weightedAverage([
    { value: averageByPrefix(input, K.userFitness.aerobic), weight: 0.20 }, { value: averageByPrefix(input, K.userFitness.muscularEndurance), weight: 0.18 },
    { value: averageByPrefix(input, K.userFitness.legStrength), weight: 0.14 }, { value: averageByPrefix(input, K.userFitness.uphill), weight: 0.12 },
    { value: averageByPrefix(input, K.userFitness.downhill), weight: 0.10 }, { value: averageByPrefix(input, K.userFitness.mobility), weight: 0.10 },
    { value: averageByPrefix(input, K.userFitness.durability), weight: 0.08 }, { value: 100 - averageByPrefix(input, K.userRecovery.fatigue), weight: 0.08 }
  ]);

  const technicalCapacity = weightedAverage([
    { value: averageByPrefix(input, K.userExperience.hiking), weight: 0.10 }, { value: averageByPrefix(input, K.userExperience.trekking), weight: 0.10 },
    { value: averageByPrefix(input, K.userExperience.scrambling), weight: 0.18 }, { value: averageByPrefix(input, K.userExperience.navigation), weight: 0.18 },
    { value: averageByPrefix(input, K.userExperience.snow), weight: 0.10 }, { value: averageByPrefix(input, K.userExperience.ice), weight: 0.08 },
    { value: averageByPrefix(input, K.userSkills.routePlanning), weight: 0.10 }, { value: averageByPrefix(input, K.userSkills.riskAssessment), weight: 0.08 },
    { value: averageByPrefix(input, K.userSkills.decisionMaking), weight: 0.08 }
  ]);

  const environmentalCapacity = weightedAverage([
    { value: get(input, 'user_profile_heat_tolerance_score'), weight: 0.18 }, { value: get(input, 'user_profile_cold_tolerance_score'), weight: 0.18 },
    { value: get(input, 'user_profile_altitude_tolerance_score'), weight: 0.18 }, { value: get(input, 'user_profile_exposure_tolerance_score'), weight: 0.18 },
    { value: averageByPrefix(input, K.userExperience.altitude), weight: 0.10 }, { value: averageByPrefix(input, K.userSkills.weather), weight: 0.10 },
    { value: 100 - averageByPrefix(input, K.userConstraints.vertigo), weight: 0.08 }
  ]);

  const logisticsCapacity = weightedAverage([
    { value: averageByPrefix(input, K.userGear.footwear), weight: 0.10 }, { value: averageByPrefix(input, K.userGear.layering), weight: 0.08 },
    { value: averageByPrefix(input, K.userGear.pack), weight: 0.06 }, { value: averageByPrefix(input, K.userGear.hydration), weight: 0.10 },
    { value: averageByPrefix(input, K.userGear.nutrition), weight: 0.10 }, { value: averageByPrefix(input, K.userGear.navigationTools), weight: 0.14 },
    { value: averageByPrefix(input, K.userGear.emergencyKit), weight: 0.16 }, { value: averageByPrefix(input, K.userGear.battery), weight: 0.06 },
    { value: averageByPrefix(input, K.userSkills.bailoutPlanning), weight: 0.10 }, { value: averageByPrefix(input, K.userSkills.selfRescue), weight: 0.10 }
  ]);

  const resilienceCapacity = weightedAverage([
    { value: get(input, 'user_profile_general_resilience_score'), weight: 0.16 }, { value: get(input, 'user_profile_decision_discipline_score'), weight: 0.14 },
    { value: 100 - averageByPrefix(input, K.userConstraints.pain), weight: 0.10 }, { value: 100 - averageByPrefix(input, K.userConstraints.knee), weight: 0.08 },
    { value: 100 - averageByPrefix(input, K.userConstraints.ankle), weight: 0.08 }, { value: averageByPrefix(input, K.userRecovery.recovery), weight: 0.12 },
    { value: averageByPrefix(input, K.userRecovery.sleep), weight: 0.10 }, { value: averageByPrefix(input, K.history.similarRoute), weight: 0.12 },
    { value: averageByPrefix(input, K.history.mountainDays), weight: 0.10 }
  ]);

  const physicalDemand = weightedAverage([
    { value: averageByPrefix(input, K.routePhysical.distance), weight: 0.18 }, { value: averageByPrefix(input, K.routePhysical.gain), weight: 0.22 },
    { value: averageByPrefix(input, K.routePhysical.loss), weight: 0.10 }, { value: averageByPrefix(input, K.routePhysical.movingTime), weight: 0.18 },
    { value: averageByPrefix(input, K.routePhysical.totalTime), weight: 0.08 }, { value: averageByPrefix(input, K.routePhysical.altitude), weight: 0.12 },
    { value: averageByPrefix(input, K.routePhysical.gradient), weight: 0.06 }, { value: averageByPrefix(input, K.routePhysical.steep), weight: 0.06 }
  ]);

  const technicalDemand = weightedAverage([
    { value: averageByPrefix(input, K.routeTechnical.technicality), weight: 0.18 }, { value: averageByPrefix(input, K.routeTechnical.routeFinding), weight: 0.16 },
    { value: averageByPrefix(input, K.routeTechnical.scrambling), weight: 0.16 }, { value: averageByPrefix(input, K.routeTechnical.exposure), weight: 0.16 },
    { value: averageByPrefix(input, K.routeTechnical.rockfall), weight: 0.08 }, { value: averageByPrefix(input, K.routeTechnical.objectiveHazard), weight: 0.12 },
    { value: averageByPrefix(input, K.routeTechnical.consequence), weight: 0.10 }, { value: 100 - averageByPrefix(input, K.routeTechnical.trailMarking), weight: 0.04 }
  ]);

  const environmentalDemand = weightedAverage([
    { value: averageByPrefix(input, K.weather.heat), weight: 0.08 }, { value: averageByPrefix(input, K.weather.cold), weight: 0.08 },
    { value: averageByPrefix(input, K.weather.storm), weight: 0.16 }, { value: averageByPrefix(input, K.weather.wind), weight: 0.12 },
    { value: averageByPrefix(input, K.weather.precipitation), weight: 0.10 }, { value: averageByPrefix(input, K.weather.lightning), weight: 0.12 },
    { value: averageByPrefix(input, K.weather.visibility), weight: 0.10 }, { value: averageByPrefix(input, K.weather.avalanche), weight: 0.10 },
    { value: averageByPrefix(input, K.weather.remoteness), weight: 0.14 }
  ]);

  const logisticsDemand = weightedAverage([
    { value: averageByPrefix(input, K.ops.bailout), weight: 0.16 }, { value: 100 - averageByPrefix(input, K.ops.water), weight: 0.10 },
    { value: averageByPrefix(input, K.ops.daylight), weight: 0.10 }, { value: averageByPrefix(input, K.ops.seasonality), weight: 0.08 },
    { value: averageByPrefix(input, K.ops.mandatoryGear), weight: 0.16 }, { value: averageByPrefix(input, K.ops.access), weight: 0.08 },
    { value: averageByPrefix(input, K.ops.exit), weight: 0.08 }, { value: 100 - averageByPrefix(input, K.ops.signal), weight: 0.06 },
    { value: averageByPrefix(input, K.ops.rescueDelay), weight: 0.08 }, { value: averageByPrefix(input, K.ops.commitment), weight: 0.10 }
  ]);

  const physicalFit = ratioMatch(physicalCapacity, physicalDemand);
  const technicalFit = ratioMatch(technicalCapacity, technicalDemand);
  const environmentalFit = ratioMatch(environmentalCapacity, environmentalDemand);
  const logisticsFit = ratioMatch(logisticsCapacity, logisticsDemand);
  const resilienceFit = clamp(resilienceCapacity);

  const distanceMismatch = Math.max(0, averageByPrefix(input, K.routePhysical.distance) - physicalCapacity);
  const elevationMismatch = Math.max(0, averageByPrefix(input, K.routePhysical.gain) - physicalCapacity);
  const altitudeMismatch = Math.max(0, averageByPrefix(input, K.routePhysical.altitude) - get(input, 'user_profile_altitude_tolerance_score'));
  const exposureMismatch = Math.max(0, averageByPrefix(input, K.routeTechnical.exposure) - get(input, 'user_profile_exposure_tolerance_score'));
  const routeFindingMismatch = Math.max(0, averageByPrefix(input, K.routeTechnical.routeFinding) - averageByPrefix(input, K.userExperience.navigation));
  const weatherMismatch = Math.max(0, averageByPrefix(input, K.weather.storm) - averageByPrefix(input, K.userSkills.weather));
  const gearMismatch = Math.max(0, averageByPrefix(input, K.ops.mandatoryGear) - logisticsCapacity);
  const commitmentMismatch = Math.max(0, averageByPrefix(input, K.ops.commitment) - get(input, 'user_profile_schedule_flexibility_score'));

  const fatigueRisk = weightedAverage([
    { value: averageByPrefix(input, K.userRecovery.fatigue), weight: 0.40 }, { value: averageByPrefix(input, K.userRecovery.strain), weight: 0.25 },
    { value: 100 - averageByPrefix(input, K.userRecovery.sleep), weight: 0.20 }, { value: 100 - averageByPrefix(input, K.userRecovery.recovery), weight: 0.15 }
  ]);

  const injuryRisk = weightedAverage([
    { value: averageByPrefix(input, K.userConstraints.knee), weight: 0.22 }, { value: averageByPrefix(input, K.userConstraints.ankle), weight: 0.22 },
    { value: averageByPrefix(input, K.userConstraints.pain), weight: 0.20 }, { value: averageByPrefix(input, K.userConstraints.health), weight: 0.18 },
    { value: averageByPrefix(input, K.userFitness.durability), weight: -0.18 }
  ]);

  const technicalRisk = weightedAverage([
    { value: averageByPrefix(input, K.routeTechnical.technicality), weight: 0.24 }, { value: averageByPrefix(input, K.routeTechnical.scrambling), weight: 0.20 },
    { value: averageByPrefix(input, K.routeTechnical.exposure), weight: 0.20 }, { value: averageByPrefix(input, K.routeTechnical.consequence), weight: 0.18 },
    { value: averageByPrefix(input, K.routeTechnical.routeFinding), weight: 0.18 }
  ]);

  const environmentalRisk = weightedAverage([
    { value: averageByPrefix(input, K.weather.storm), weight: 0.22 }, { value: averageByPrefix(input, K.weather.wind), weight: 0.16 },
    { value: averageByPrefix(input, K.weather.lightning), weight: 0.22 }, { value: averageByPrefix(input, K.weather.visibility), weight: 0.14 },
    { value: averageByPrefix(input, K.weather.avalanche), weight: 0.14 }, { value: averageByPrefix(input, K.weather.remoteness), weight: 0.12 }
  ]);

  const logisticalRisk = weightedAverage([
    { value: averageByPrefix(input, K.ops.bailout), weight: 0.22 }, { value: averageByPrefix(input, K.ops.commitment), weight: 0.20 },
    { value: averageByPrefix(input, K.ops.rescueDelay), weight: 0.18 }, { value: 100 - averageByPrefix(input, K.ops.signal), weight: 0.16 },
    { value: averageByPrefix(input, K.ops.access), weight: 0.12 }, { value: averageByPrefix(input, K.ops.exit), weight: 0.12 }
  ]);

  const weatherWindowRisk = weightedAverage([
    { value: averageByPrefix(input, K.weather.storm), weight: 0.25 }, { value: averageByPrefix(input, K.weather.wind), weight: 0.20 },
    { value: averageByPrefix(input, K.weather.precipitation), weight: 0.15 }, { value: averageByPrefix(input, K.weather.visibility), weight: 0.15 },
    { value: averageByPrefix(input, K.weather.lightning), weight: 0.25 }
  ]);

  const objectiveHazardRisk = weightedAverage([
    { value: averageByPrefix(input, K.routeTechnical.objectiveHazard), weight: 0.40 }, { value: averageByPrefix(input, K.routeTechnical.rockfall), weight: 0.20 },
    { value: averageByPrefix(input, K.weather.avalanche), weight: 0.20 }, { value: averageByPrefix(input, 'route_surface_river_crossing_'), weight: 0.20 }
  ]);

  const decisionQualityRisk = 100 - weightedAverage([
    { value: get(input, 'user_profile_decision_discipline_score'), weight: 0.30 },
    { value: averageByPrefix(input, K.userSkills.decisionMaking), weight: 0.30 },
    { value: averageByPrefix(input, K.userSkills.riskAssessment), weight: 0.20 },
    { value: averageByPrefix(input, K.userSkills.paceControl), weight: 0.20 }
  ]);

  const modelConfidence = avg([
    averageByPrefix(input, K.dataq.user), averageByPrefix(input, K.dataq.route), averageByPrefix(input, K.dataq.weather),
    averageByPrefix(input, K.dataq.map), averageByPrefix(input, K.dataq.hazard), averageByPrefix(input, K.dataq.history), averageByPrefix(input, K.dataq.gear)
  ]);

  return {
    derived_core_physical_capacity_score: round(physicalCapacity),
    derived_core_technical_capacity_score: round(technicalCapacity),
    derived_core_environmental_capacity_score: round(environmentalCapacity),
    derived_core_logistics_capacity_score: round(logisticsCapacity),
    derived_core_physical_demand_score: round(physicalDemand),
    derived_core_technical_demand_score: round(technicalDemand),
    derived_core_environmental_demand_score: round(environmentalDemand),
    derived_core_logistics_demand_score: round(logisticsDemand),
    derived_subscores_physical_fit_score: round(physicalFit),
    derived_subscores_technical_fit_score: round(technicalFit),
    derived_subscores_environmental_fit_score: round(environmentalFit),
    derived_subscores_logistics_fit_score: round(logisticsFit),
    derived_subscores_resilience_fit_score: round(resilienceFit),
    derived_mismatch_distance_mismatch: round(distanceMismatch),
    derived_mismatch_elevation_mismatch: round(elevationMismatch),
    derived_mismatch_altitude_mismatch: round(altitudeMismatch),
    derived_mismatch_exposure_mismatch: round(exposureMismatch),
    derived_mismatch_route_finding_mismatch: round(routeFindingMismatch),
    derived_mismatch_weather_mismatch: round(weatherMismatch),
    derived_mismatch_gear_mismatch: round(gearMismatch),
    derived_mismatch_commitment_mismatch: round(commitmentMismatch),
    derived_risk_fatigue_risk: round(clamp(fatigueRisk)),
    derived_risk_injury_risk: round(clamp(injuryRisk)),
    derived_risk_technical_risk: round(clamp(technicalRisk)),
    derived_risk_environmental_risk: round(clamp(environmentalRisk)),
    derived_risk_logistical_risk: round(clamp(logisticalRisk)),
    derived_risk_weather_window_risk: round(clamp(weatherWindowRisk)),
    derived_risk_objective_hazard_risk: round(clamp(objectiveHazardRisk)),
    derived_risk_decision_quality_risk: round(clamp(decisionQualityRisk)),
    derived_confidence_model_score: round(clamp(modelConfidence)),
    derived_confidence_user_score: round(clamp(averageByPrefix(input, K.dataq.user))),
    derived_confidence_route_score: round(clamp(averageByPrefix(input, K.dataq.route))),
    derived_confidence_weather_score: round(clamp(averageByPrefix(input, K.dataq.weather))),
    derived_confidence_gear_score: round(clamp(averageByPrefix(input, K.dataq.gear))),
    derived_confidence_history_score: round(clamp(averageByPrefix(input, K.dataq.history))),
    derived_confidence_data_reliability_score: round(clamp(modelConfidence))
  };
}

export function calculateRouteReadiness847(input) {
  const derived = derive847(input);

  const subScores = {
    physical_fit: derived.derived_subscores_physical_fit_score ?? 0,
    technical_fit: derived.derived_subscores_technical_fit_score ?? 0,
    environmental_fit: derived.derived_subscores_environmental_fit_score ?? 0,
    logistics_fit: derived.derived_subscores_logistics_fit_score ?? 0,
    resilience_fit: derived.derived_subscores_resilience_fit_score ?? 0
  };

  const penalties = {
    fatigue_penalty: round(Math.max(0, (derived.derived_risk_fatigue_risk - 65) * 0.22)),
    injury_penalty: round(Math.max(0, (derived.derived_risk_injury_risk - 55) * 0.24)),
    technical_penalty: round(Math.max(0, (derived.derived_risk_technical_risk - 70) * 0.18)),
    environmental_penalty: round(Math.max(0, (derived.derived_risk_environmental_risk - 65) * 0.20)),
    logistical_penalty: round(Math.max(0, (derived.derived_risk_logistical_risk - 65) * 0.16)),
    mismatch_penalty: round(avg([
      derived.derived_mismatch_distance_mismatch ?? 0,
      derived.derived_mismatch_elevation_mismatch ?? 0,
      derived.derived_mismatch_altitude_mismatch ?? 0,
      derived.derived_mismatch_exposure_mismatch ?? 0,
      derived.derived_mismatch_route_finding_mismatch ?? 0,
      derived.derived_mismatch_weather_mismatch ?? 0,
      derived.derived_mismatch_gear_mismatch ?? 0,
      derived.derived_mismatch_commitment_mismatch ?? 0
    ]) * 0.18)
  };

  const hardStops = [];

  if (get(input, 'user_profile_recent_illness_flag_score') >= 80) hardStops.push('recent_illness');
  if (get(input, 'user_profile_medical_constraints_flag_score') >= 80) hardStops.push('medical_constraint');

  if (derived.derived_mismatch_exposure_mismatch >= 55 && averageByPrefix(input, K.userConstraints.vertigo) >= 60) {
    hardStops.push('exposure_vertigo_conflict');
  }
  if (averageByPrefix(input, K.weather.lightning) >= 85) hardStops.push('lightning_window');
  if (averageByPrefix(input, K.weather.avalanche) >= 80) hardStops.push('avalanche_window');
  if (derived.derived_mismatch_gear_mismatch >= 60) hardStops.push('mandatory_gear_gap');

  if (averageByPrefix(input, K.routeTechnical.objectiveHazard) >= 85 && averageByPrefix(input, K.userSkills.selfRescue) < 45) {
    hardStops.push('objective_hazard_self_rescue_gap');
  }

  const baseScore = weightedAverage([
    { value: subScores.physical_fit, weight: 0.28 },
    { value: subScores.technical_fit, weight: 0.24 },
    { value: subScores.environmental_fit, weight: 0.18 },
    { value: subScores.logistics_fit, weight: 0.16 },
    { value: subScores.resilience_fit, weight: 0.14 }
  ]);

  const totalPenalty = Object.values(penalties).reduce((sum, value) => sum + value, 0);
  const hardStopPenalty = hardStops.length * 12;
  const finalScore = round(clamp(baseScore - totalPenalty - hardStopPenalty));
  const confidence = round(derived.derived_confidence_model_score ?? 60);

  let band = 'not_ready';
  let decision = 'do_not_go';

  if (finalScore >= 78) {
    band = 'strong';
    decision = 'go';
  } else if (finalScore >= 60) {
    band = 'good';
    decision = 'go_with_caution';
  } else if (finalScore >= 40) {
    band = 'caution';
    decision = 'adapt_plan';
  }

  if (hardStops.length > 0) {
    decision = 'do_not_go';
    if (finalScore >= 40) band = 'caution';
  }

  const populatedVariables = VARIABLE_KEYS.filter((key) => typeof input[key] === 'number').length;

  return {
    score: finalScore,
    band,
    decision,
    confidence,
    totalVariables: ROUTE_READINESS_VARIABLES.length,
    populatedVariables,
    subScores,
    penalties,
    hardStops,
    derived
  };
}

export const demoInput = (() => {
  const d = createEmpty847Input(50);
  d.user_profile_general_resilience_score = 72;
  d.user_profile_decision_discipline_score = 76;
  d.user_profile_schedule_flexibility_score = 68;
  d.user_profile_heat_tolerance_score = 70;
  d.user_profile_cold_tolerance_score = 60;
  d.user_profile_altitude_tolerance_score = 58;
  d.user_profile_exposure_tolerance_score = 62;
  d.user_profile_recent_illness_flag_score = 0;
  d.user_profile_medical_constraints_flag_score = 0;

  d.user_fitness_aerobic_capacity_status = 78;
  d.user_fitness_muscular_endurance_status = 74;
  d.user_fitness_leg_strength_status = 71;
  d.user_fitness_uphill_efficiency_status = 73;
  d.user_fitness_downhill_tolerance_status = 66;
  d.user_fitness_mobility_status = 70;
  d.user_fitness_durability_status = 72;

  d.user_recovery_fatigue_status = 35;
  d.user_recovery_recovery_status = 70;
  d.user_recovery_sleep_status = 67;
  d.user_recovery_hrv_status = 63;
  d.user_recovery_strain_status = 42;

  d.user_constraints_knee_risk = 18;
  d.user_constraints_ankle_risk = 14;
  d.user_constraints_vertigo_risk = 28;
  d.user_constraints_pain_risk = 16;
  d.user_constraints_health_risk = 10;

  d.user_experience_hiking_experience = 85;
  d.user_experience_trekking_experience = 76;
  d.user_experience_scrambling_experience = 61;
  d.user_experience_navigation_experience = 64;
  d.user_experience_snow_experience = 40;
  d.user_experience_ice_experience = 28;
  d.user_experience_altitude_experience = 55;
  d.user_experience_multi_day_experience = 71;
  d.user_experience_bivouac_experience = 58;

  d.user_gear_footwear_readiness = 78;
  d.user_gear_layering_readiness = 72;
  d.user_gear_pack_readiness = 70;
  d.user_gear_hydration_readiness = 76;
  d.user_gear_nutrition_readiness = 71;
  d.user_gear_navigation_tools_readiness = 74;
  d.user_gear_emergency_kit_readiness = 68;
  d.user_gear_battery_system_readiness = 73;

  d.user_skills_weather_reading_skill = 64;
  d.user_skills_route_planning_skill = 70;
  d.user_skills_bailout_planning_skill = 66;
  d.user_skills_self_rescue_skill = 55;
  d.user_skills_pace_control_skill = 72;
  d.user_skills_risk_assessment_skill = 68;
  d.user_skills_decision_making_skill = 74;

  d.route_physical_distance_load = 63;
  d.route_physical_elevation_gain_load = 76;
  d.route_physical_elevation_loss_load = 64;
  d.route_physical_moving_time_load = 69;
  d.route_physical_total_time_load = 72;
  d.route_physical_max_altitude_load = 61;
  d.route_physical_avg_gradient_load = 58;
  d.route_physical_steepest_section_load = 62;

  d.route_technical_terrain_technicality_demand = 66;
  d.route_technical_route_finding_demand = 57;
  d.route_technical_scrambling_demand = 61;
  d.route_technical_exposure_demand = 54;
  d.route_technical_rockfall_demand = 35;
  d.route_technical_objective_hazard_demand = 48;
  d.route_technical_consequence_of_error_demand = 57;
  d.route_technical_trail_marking_demand = 45;

  d.weather_environment_heat_risk = 34;
  d.weather_environment_cold_risk = 41;
  d.weather_environment_storm_risk = 39;
  d.weather_environment_wind_risk = 46;
  d.weather_environment_precipitation_risk = 33;
  d.weather_environment_lightning_risk = 18;
  d.weather_environment_visibility_risk = 29;
  d.weather_environment_avalanche_risk = 5;
  d.weather_environment_remoteness_risk = 52;

  d.route_operations_bailout_difficulty = 57;
  d.route_operations_water_availability_difficulty = 38;
  d.route_operations_daylight_difficulty = 46;
  d.route_operations_seasonality_difficulty = 44;
  d.route_operations_mandatory_gear_difficulty = 58;
  d.route_operations_access_difficulty = 40;
  d.route_operations_exit_difficulty = 36;
  d.route_operations_signal_difficulty = 48;
  d.route_operations_rescue_delay_difficulty = 43;
  d.route_operations_commitment_difficulty = 53;

  d.history_context_similar_route_match = 70;
  d.history_context_similar_elevation_match = 66;
  d.history_context_similar_altitude_match = 58;
  d.history_context_similar_exposure_match = 61;
  d.history_context_similar_terrain_match = 64;
  d.history_context_recent_mountain_days_match = 69;
  d.history_context_recent_failures_match = 32;

  d.data_quality_user_data_confidence = 88;
  d.data_quality_route_data_confidence = 84;
  d.data_quality_weather_data_confidence = 81;
  d.data_quality_map_data_confidence = 79;
  d.data_quality_hazard_data_confidence = 74;
  d.data_quality_history_data_confidence = 76;
  d.data_quality_gear_data_confidence = 83;
  return d;
})();
