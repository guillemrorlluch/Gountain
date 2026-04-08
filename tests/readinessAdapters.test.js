import test from 'node:test';
import assert from 'node:assert/strict';
import { routeTo847Input } from '../engine/readiness/adapters/routeTo847Input.js';
import { userTo847Input } from '../engine/readiness/adapters/userTo847Input.js';
import { merge847Input } from '../engine/readiness/adapters/merge847Input.js';

test('route adapter maps key route fields', () => {
  const routeInput = routeTo847Input({
    dificultad: 'AD',
    altitud_m: 3200,
    botas: ['La Sportiva Nepal Cube GTX'],
    tipo: 'Travesía',
    scramble: { si: true, grado: 'II' }
  });

  assert.ok(routeInput.route_technical_terrain_technicality_demand > 50);
  assert.ok(routeInput.route_physical_max_altitude_load > 0);
});

test('user adapter maps baseline fields', () => {
  const userInput = userTo847Input({
    general_resilience_score: 70,
    route_planning_skill: 62,
    medical_constraints_flag_score: 0
  });

  assert.equal(userInput.user_profile_general_resilience_score, 70);
  assert.equal(userInput.user_skills_route_planning_skill, 62);
});

test('merge adapter combines input maps', () => {
  const merged = merge847Input({ a: 1, b: 2 }, { b: 4, c: 9 });
  assert.deepEqual(merged, { a: 1, b: 4, c: 9 });
});
