import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeDestination } from '../engine/domain/routeDomain.js';
import { routeTo847Input } from '../engine/readiness/adapters/routeTo847Input.js';
import { userTo847Input } from '../engine/readiness/adapters/userTo847Input.js';
import { merge847Input } from '../engine/readiness/adapters/merge847Input.js';
import { calculateRouteReadiness847 } from '../engine/readiness/RouteReadinessModelProduction.js';

test('selected route flows through normalization -> adapters -> readiness result', () => {
  const selectedRoute = normalizeDestination({
    id: 'denali',
    nombre: 'Denali (West Buttress)',
    dificultad: 'AD',
    tipo: 'Travesía',
    altitud_m: 6190,
    botas: ['Botas triple capa (8000 m+)'],
    scramble: { si: true, grado: 'III nieve' },
    coords: [63.07, -151.01]
  });

  const routeInput = routeTo847Input(selectedRoute);
  const userInput = userTo847Input({
    general_resilience_score: 67,
    route_planning_skill: 65,
    self_rescue_skill: 58
  });
  const mergedInput = merge847Input(routeInput, userInput);
  const result = calculateRouteReadiness847(mergedInput);

  assert.equal(selectedRoute.name, 'Denali (West Buttress)');
  assert.equal(typeof result.score, 'number');
  assert.equal(result.totalVariables, 847);
  assert.ok(['not_ready', 'caution', 'good', 'strong'].includes(result.band));
  assert.ok(Array.isArray(result.hardStops));
});
