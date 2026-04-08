import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

test('RouteReadinessPanel keeps an explicit null-destination placeholder state', () => {
  const source = readFileSync(new URL('../components/RouteReadinessPanel.jsx', import.meta.url), 'utf8');
  assert.match(source, /if\s*\(!destination\)\s*\{[\s\S]*Select a route to open the decision panel\./);
});

test('RouteReadinessPanel guards confidence derivation when destination/readiness is missing', () => {
  const source = readFileSync(new URL('../components/RouteReadinessPanel.jsx', import.meta.url), 'utf8');
  assert.match(source, /if\s*\(!destination\s*\|\|\s*!readiness\)/);
  assert.match(source, /Confidence is unavailable until a route is selected\./);
});
