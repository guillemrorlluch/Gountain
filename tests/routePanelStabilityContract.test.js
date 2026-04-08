import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

test('route panel remains primary with scan-first metrics and compact rationale', () => {
  const source = readFileSync(new URL('../components/RouteReadinessPanel.jsx', import.meta.url), 'utf8');

  assert.ok(source.includes('route-readiness__headline-metrics'), 'panel should keep prominent scan-first metrics');
  assert.ok(source.includes('Quick rationale'), 'panel should keep concise explanation heading');
  assert.ok(source.includes('ReadinessRefinementForm'), 'refinement form should still be present');
});

test('app keeps panel visibility stable across repeated route selections', () => {
  const source = readFileSync(new URL('../App.jsx', import.meta.url), 'utf8');

  assert.ok(source.includes("if (selectedDestination) {\n      setMobileTab('explore');"), 'route selection should normalize to explore panel on mobile');
  assert.ok(source.includes('const shouldShowRoutePanel = !isMobile || mobileTab === \'explore\';'), 'route panel visibility should be deterministic');
});
