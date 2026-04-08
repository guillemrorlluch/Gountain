import test from 'node:test';
import assert from 'node:assert/strict';
import {
  ROUTE_READINESS_VARIABLES,
  demoInput,
  calculateRouteReadiness847,
  derive847
} from '../engine/readiness/RouteReadinessModelProduction.js';

test('registry length is exactly 847', () => {
  assert.equal(ROUTE_READINESS_VARIABLES.length, 847);
});

test('demo input returns stable readiness structure', () => {
  const result = calculateRouteReadiness847(demoInput);
  assert.equal(typeof result.score, 'number');
  assert.equal(result.totalVariables, 847);
  assert.ok(Array.isArray(result.hardStops));
  assert.ok(result.subScores.physical_fit >= 0);
  assert.ok(result.decision);
});

test('derive847 returns expected derived keys', () => {
  const derived = derive847(demoInput);
  assert.equal(typeof derived.derived_subscores_physical_fit_score, 'number');
  assert.equal(typeof derived.derived_risk_fatigue_risk, 'number');
  assert.equal(typeof derived.derived_confidence_model_score, 'number');
});
