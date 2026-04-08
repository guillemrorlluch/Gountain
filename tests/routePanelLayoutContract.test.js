import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

test('selected-route panel keeps readiness block before route info', () => {
  const source = readFileSync(new URL('../components/RouteReadinessPanel.jsx', import.meta.url), 'utf8');
  const selectedRouteHeading = source.indexOf('<h3>Selected route</h3>');
  const readinessPrimary = source.indexOf('route-readiness__primary');
  const routeInfo = source.indexOf('route-readiness__route-info');

  assert.ok(selectedRouteHeading >= 0, 'selected route heading should exist');
  assert.ok(readinessPrimary >= 0, 'readiness primary block should exist');
  assert.ok(routeInfo >= 0, 'route info block should exist');
  assert.ok(readinessPrimary < routeInfo, 'readiness block should render before route info');
});

test('refinement remains compact and secondary in details disclosure', () => {
  const source = readFileSync(new URL('../components/ReadinessRefinementForm.jsx', import.meta.url), 'utf8');

  assert.ok(source.includes('<details className="readiness-refinement"'), 'refinement should be collapsible');
  assert.ok(source.includes('Keep this secondary:'), 'copy should reinforce secondary refinement role');
});
