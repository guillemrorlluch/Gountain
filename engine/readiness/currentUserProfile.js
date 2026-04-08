const STORAGE_KEY = 'gountain.currentRefinementProfile.v1';

export const MINIMAL_REFINEMENT_FIELDS = [
  'recent_elevation_capacity',
  'similar_route_experience',
  'exposure_tolerance',
  'multi_day_experience',
  'current_form',
  'gear_readiness'
];

export const DEFAULT_MINIMAL_REFINEMENT_PROFILE = {
  recent_elevation_capacity: 50,
  similar_route_experience: 45,
  exposure_tolerance: 50,
  multi_day_experience: 40,
  current_form: 52,
  gear_readiness: 55
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
    const probe = '__gountain_refinement_probe__';
    storage.setItem(probe, '1');
    storage.removeItem(probe);
    return storage;
  } catch {
    return null;
  }
}

export function sanitizeCurrentUserProfile(rawProfile = {}) {
  const sanitized = { ...DEFAULT_MINIMAL_REFINEMENT_PROFILE };
  Object.entries(DEFAULT_MINIMAL_REFINEMENT_PROFILE).forEach(([key, defaultValue]) => {
    sanitized[key] = clampProfileValue(rawProfile[key], defaultValue);
  });
  return sanitized;
}

export function loadCurrentUserProfile() {
  if (typeof window === 'undefined') {
    return { ...DEFAULT_MINIMAL_REFINEMENT_PROFILE };
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
    // Best effort only.
  }
}

export function createUpdatedCurrentUserProfile(profile, key, value) {
  return sanitizeCurrentUserProfile({
    ...profile,
    [key]: value
  });
}

export function toExpandedUserProfile(refinementProfile = {}) {
  const p = sanitizeCurrentUserProfile(refinementProfile);
  const fitness = p.current_form;
  const gear = p.gear_readiness;

  return {
    general_resilience_score: Math.round((fitness + p.multi_day_experience) / 2),
    decision_discipline_score: Math.round((p.similar_route_experience + p.exposure_tolerance) / 2),
    schedule_flexibility_score: Math.round((50 + p.multi_day_experience) / 2),
    altitude_tolerance_score: p.recent_elevation_capacity,
    exposure_tolerance_score: p.exposure_tolerance,
    aerobic_capacity_status: fitness,
    muscular_endurance_status: Math.round((fitness + p.multi_day_experience) / 2),
    leg_strength_status: Math.round((fitness + p.recent_elevation_capacity) / 2),
    route_planning_skill: p.similar_route_experience,
    risk_assessment_skill: Math.round((p.similar_route_experience + p.exposure_tolerance) / 2),
    self_rescue_skill: Math.round((p.similar_route_experience + p.current_form) / 2),
    footwear_readiness: gear,
    navigation_tools_readiness: gear,
    emergency_kit_readiness: Math.round((gear + p.multi_day_experience) / 2),
    recovery_fatigue_status: Math.round(100 - fitness),
    recovery_sleep_status: Math.round((fitness + 55) / 2),
    recovery_recovery_status: Math.round((fitness + p.multi_day_experience) / 2),
    data_quality_user_data_confidence: 65,
    data_quality_history_data_confidence: Math.round((p.similar_route_experience + 55) / 2),
    data_quality_gear_data_confidence: Math.round((gear + 60) / 2)
  };
}

export function getRefinementCompletion(profile = {}) {
  const p = sanitizeCurrentUserProfile(profile);
  const changedFields = MINIMAL_REFINEMENT_FIELDS.filter(
    (field) => p[field] !== DEFAULT_MINIMAL_REFINEMENT_PROFILE[field]
  );
  const changed = changedFields.length;
  return {
    changed,
    changedFields,
    total: MINIMAL_REFINEMENT_FIELDS.length,
    percent: Math.round((changed / MINIMAL_REFINEMENT_FIELDS.length) * 100)
  };
}
