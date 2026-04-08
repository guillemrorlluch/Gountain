import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeDestination } from '../engine/domain/routeDomain.js';
import { userTo847Input } from '../engine/readiness/adapters/userTo847Input.js';
import { merge847Input } from '../engine/readiness/adapters/merge847Input.js';
import { readinessSourceTo847Input } from '../engine/readiness/adapters/readinessSourceTo847Input.js';
import {
  DEFAULT_MINIMAL_REFINEMENT_PROFILE,
  sanitizeCurrentUserProfile,
  createUpdatedCurrentUserProfile,
  loadCurrentUserProfile,
  saveCurrentUserProfile,
  toExpandedUserProfile,
  getRefinementCompletion
} from '../engine/readiness/currentUserProfile.js';
import { calculateRouteReadiness847 } from '../engine/readiness/RouteReadinessModelProduction.js';

function readinessFor(routeSource, refinementProfile) {
  return calculateRouteReadiness847(
    merge847Input(
      readinessSourceTo847Input(routeSource),
      userTo847Input(toExpandedUserProfile(refinementProfile))
    )
  );
}

test('minimal profile sanitizes and clamps values', () => {
  const sanitized = sanitizeCurrentUserProfile({
    recent_elevation_capacity: '79',
    current_form: 300,
    exposure_tolerance: -20,
    unknown_key: 12
  });

  assert.equal(sanitized.recent_elevation_capacity, 79);
  assert.equal(sanitized.current_form, 100);
  assert.equal(sanitized.exposure_tolerance, 0);
  assert.equal(
    sanitized.similar_route_experience,
    DEFAULT_MINIMAL_REFINEMENT_PROFILE.similar_route_experience
  );
  assert.equal(sanitized.unknown_key, undefined);
});

test('route-first flow yields preliminary readiness and refines score with compact inputs', () => {
  const route = normalizeDestination({
    id: 'ridge-commitment',
    nombre: 'Ridge Commitment Route',
    dificultad: 'D',
    tipo: 'Alpina',
    altitud_m: 5200,
    botas: ['Botas dobles'],
    scramble: { si: true, grado: 'IV roca' }
  });

  const preliminary = readinessFor(route, DEFAULT_MINIMAL_REFINEMENT_PROFILE);

  const refined = createUpdatedCurrentUserProfile(
    createUpdatedCurrentUserProfile(DEFAULT_MINIMAL_REFINEMENT_PROFILE, 'current_form', 72),
    'similar_route_experience',
    70
  );
  const refinedResult = readinessFor(route, refined);

  assert.equal(typeof preliminary.score, 'number');
  assert.equal(preliminary.totalVariables, 847);
  assert.notEqual(preliminary.score, refinedResult.score);
  assert.ok(refinedResult.score > preliminary.score);
});

test('future GPX path uses readiness source adapter contract', () => {
  const gpxLikeSource = {
    sourceType: 'gpx_track',
    routeLike: {
      nombre: 'Uploaded GPX Route',
      dificultad: 'AD',
      tipo: 'Travesía',
      altitud_m: 4300,
      botas: ['Botas dobles']
    }
  };

  const result = readinessFor(gpxLikeSource, DEFAULT_MINIMAL_REFINEMENT_PROFILE);
  assert.equal(typeof result.score, 'number');
  assert.equal(result.totalVariables, 847);
});

test('completion tracks how many refinement fields diverge from defaults', () => {
  const unchanged = getRefinementCompletion(DEFAULT_MINIMAL_REFINEMENT_PROFILE);
  const changed = getRefinementCompletion({
    ...DEFAULT_MINIMAL_REFINEMENT_PROFILE,
    current_form: 65,
    gear_readiness: 70
  });

  assert.equal(unchanged.changed, 0);
  assert.equal(changed.changed, 2);
  assert.equal(changed.total, 6);
});

test('save/load profile does not throw when localStorage is blocked', () => {
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
    saveCurrentUserProfile({ current_form: 72 });
    const loaded = loadCurrentUserProfile();
    assert.equal(loaded.current_form, 72);
  });

  global.window = previousWindow;
});
