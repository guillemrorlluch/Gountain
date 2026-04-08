import { createEmpty847Input } from '../RouteReadinessModelProduction.js';

export function userTo847Input(user = {}) {
  const input = createEmpty847Input(50);

  input.user_profile_general_resilience_score = Number(user.general_resilience_score ?? 55);
  input.user_profile_decision_discipline_score = Number(user.decision_discipline_score ?? 55);
  input.user_profile_schedule_flexibility_score = Number(user.schedule_flexibility_score ?? 55);
  input.user_profile_altitude_tolerance_score = Number(user.altitude_tolerance_score ?? 50);
  input.user_profile_exposure_tolerance_score = Number(user.exposure_tolerance_score ?? 50);

  input.user_fitness_aerobic_capacity_status = Number(user.aerobic_capacity_status ?? 55);
  input.user_fitness_muscular_endurance_status = Number(user.muscular_endurance_status ?? 52);
  input.user_fitness_leg_strength_status = Number(user.leg_strength_status ?? 52);

  input.user_skills_route_planning_skill = Number(user.route_planning_skill ?? 50);
  input.user_skills_risk_assessment_skill = Number(user.risk_assessment_skill ?? 50);
  input.user_skills_self_rescue_skill = Number(user.self_rescue_skill ?? 45);

  input.user_gear_footwear_readiness = Number(user.footwear_readiness ?? 55);
  input.user_gear_navigation_tools_readiness = Number(user.navigation_tools_readiness ?? 55);
  input.user_gear_emergency_kit_readiness = Number(user.emergency_kit_readiness ?? 50);

  input.user_profile_recent_illness_flag_score = Number(user.recent_illness_flag_score ?? 0);
  input.user_profile_medical_constraints_flag_score = Number(user.medical_constraints_flag_score ?? 0);

  // TODO: connect wearable/recovery feeds for these fields.
  input.user_recovery_fatigue_status = Number(user.recovery_fatigue_status ?? 45);
  input.user_recovery_sleep_status = Number(user.recovery_sleep_status ?? 55);
  input.user_recovery_recovery_status = Number(user.recovery_recovery_status ?? 55);

  input.data_quality_user_data_confidence = Number(user.data_quality_user_data_confidence ?? 65);
  input.data_quality_history_data_confidence = Number(user.data_quality_history_data_confidence ?? 55);
  input.data_quality_gear_data_confidence = Number(user.data_quality_gear_data_confidence ?? 60);

  return input;
}

export default userTo847Input;
