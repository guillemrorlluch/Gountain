import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeDestination } from '../engine/domain/routeDomain.js';
import { routeTo847Input } from '../engine/readiness/adapters/routeTo847Input.js';
import { userTo847Input } from '../engine/readiness/adapters/userTo847Input.js';
import { merge847Input } from '../engine/readiness/adapters/merge847Input.js';
import {
  DEFAULT_CURRENT_USER_PROFILE,
  sanitizeCurrentUserProfile,
  createUpdatedCurrentUserProfile,
  loadCurrentUserProfile,
  saveCurrentUserProfile
} from '../engine/readiness/currentUserProfile.js';
import { calculateRouteReadiness847 } from '../engine/readiness/RouteReadinessModelProduction.js';

function readinessFor(route, userProfile) {
  return calculateRouteReadiness847(
    merge847Input(routeTo847Input(route), userTo847Input(userProfile))
  );
}

test('profile model sanitizes and clamps persisted values', () => {
  const sanitized = sanitizeCurrentUserProfile({
    general_resilience_score: '79',
    decision_discipline_score: 300,
    altitude_tolerance_score: -20,
    unknown_key: 12
  });

  assert.equal(sanitized.general_resilience_score, 79);
  assert.equal(sanitized.decision_discipline_score, 100);
  assert.equal(sanitized.altitude_tolerance_score, 0);
  assert.equal(sanitized.route_planning_skill, DEFAULT_CURRENT_USER_PROFILE.route_planning_skill);
  assert.equal(sanitized.unknown_key, undefined);
});

test('edited profile values flow into merged 847 input and change readiness output', () => {
  const route = normalizeDestination({
    id: 'ridge-commitment',
    nombre: 'Ridge Commitment Route',
    dificultad: 'D',
    tipo: 'Alpina',
    altitud_m: 5200,
    botas: ['Botas dobles'],
    scramble: { si: true, grado: 'IV roca' }
  });

  const baselineProfile = { ...DEFAULT_CURRENT_USER_PROFILE };
  const editedProfile = createUpdatedCurrentUserProfile(
    createUpdatedCurrentUserProfile(baselineProfile, 'route_planning_skill', 10),
    'self_rescue_skill',
    10
  );

  const baselineMerged = merge847Input(routeTo847Input(route), userTo847Input(baselineProfile));
  const editedMerged = merge847Input(routeTo847Input(route), userTo847Input(editedProfile));

  const baselineResult = readinessFor(route, baselineProfile);
  const editedResult = readinessFor(route, editedProfile);

  assert.equal(editedMerged.user_skills_route_planning_skill, 10);
  assert.equal(editedMerged.user_skills_self_rescue_skill, 10);
  assert.notEqual(baselineResult.score, editedResult.score);
  assert.ok(editedResult.score < baselineResult.score);
});

test('saveCurrentUserProfile does not throw when localStorage is blocked', () => {
  const previousWindow = global.window;
  global.window = {
    __CURRENT_USER_PROFILE__: null,
    localStorage: {
      setItem() { throw new Error('blocked'); },
      removeItem() { throw new Error('blocked'); },
      getItem() { throw new Error('blocked'); }
    }
  };

  assert.doesNotThrow(() => {
    saveCurrentUserProfile({ general_resilience_score: 72 });
  });
  assert.equal(global.window.__CURRENT_USER_PROFILE__.general_resilience_score, 72);

  global.window = previousWindow;
});

test('loadCurrentUserProfile falls back gracefully when localStorage is blocked', () => {
  const previousWindow = global.window;
  global.window = {
    __CURRENT_USER_PROFILE__: { general_resilience_score: 68 },
    localStorage: {
      setItem() { throw new Error('blocked'); },
      removeItem() { throw new Error('blocked'); },
      getItem() { throw new Error('blocked'); }
    }
  };

  const loaded = loadCurrentUserProfile();

  assert.equal(loaded.general_resilience_score, 68);
  assert.equal(loaded.route_planning_skill, DEFAULT_CURRENT_USER_PROFILE.route_planning_skill);

  global.window = previousWindow;
});
