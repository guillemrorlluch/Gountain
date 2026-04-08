const STORAGE_KEY = 'gountain.currentUserProfile.v1';

export const CURRENT_USER_PROFILE_FIELDS = [
  'general_resilience_score',
  'decision_discipline_score',
  'altitude_tolerance_score',
  'aerobic_capacity_status',
  'route_planning_skill',
  'self_rescue_skill',
  'footwear_readiness',
  'navigation_tools_readiness',
  'emergency_kit_readiness',
  'recovery_sleep_status'
];

export const DEFAULT_CURRENT_USER_PROFILE = {
  general_resilience_score: 55,
  decision_discipline_score: 55,
  schedule_flexibility_score: 55,
  altitude_tolerance_score: 50,
  exposure_tolerance_score: 50,
  aerobic_capacity_status: 55,
  muscular_endurance_status: 52,
  leg_strength_status: 52,
  route_planning_skill: 50,
  risk_assessment_skill: 50,
  self_rescue_skill: 45,
  footwear_readiness: 55,
  navigation_tools_readiness: 55,
  emergency_kit_readiness: 50,
  recovery_fatigue_status: 45,
  recovery_sleep_status: 55,
  recovery_recovery_status: 55,
  recent_illness_flag_score: 0,
  medical_constraints_flag_score: 0,
  data_quality_user_data_confidence: 65,
  data_quality_history_data_confidence: 55,
  data_quality_gear_data_confidence: 60
};

function clampProfileValue(value, fallback) {
  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.max(0, Math.min(100, Math.round(n)));
}

function getSafeLocalStorage() {
  if (typeof window === 'undefined') return null;
  try {
    const storage = window.localStorage;
    const probe = '__gountain_profile_probe__';
    storage.setItem(probe, '1');
    storage.removeItem(probe);
    return storage;
  } catch {
    return null;
  }
}

export function sanitizeCurrentUserProfile(rawProfile = {}) {
  const sanitized = { ...DEFAULT_CURRENT_USER_PROFILE };
  Object.entries(DEFAULT_CURRENT_USER_PROFILE).forEach(([key, defaultValue]) => {
    sanitized[key] = clampProfileValue(rawProfile[key], defaultValue);
  });
  return sanitized;
}

export function loadCurrentUserProfile() {
  if (typeof window === 'undefined') {
    return { ...DEFAULT_CURRENT_USER_PROFILE };
  }

  const fromWindow = sanitizeCurrentUserProfile(window.__CURRENT_USER_PROFILE__ || {});
  const storage = getSafeLocalStorage();

  if (!storage) return fromWindow;

  try {
    const raw = storage.getItem(STORAGE_KEY);
    if (!raw) return fromWindow;
    return sanitizeCurrentUserProfile(JSON.parse(raw));
  } catch {
    return fromWindow;
  }
}

export function saveCurrentUserProfile(profile) {
  if (typeof window === 'undefined') return;
  const sanitized = sanitizeCurrentUserProfile(profile);
  window.__CURRENT_USER_PROFILE__ = sanitized;

  const storage = getSafeLocalStorage();
  if (!storage) return;

  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(sanitized));
  } catch {
    // Persistence is best-effort. Keep runtime profile flow alive.
  }
}

export function createUpdatedCurrentUserProfile(profile, key, value) {
  return sanitizeCurrentUserProfile({
    ...profile,
    [key]: value
  });
}
