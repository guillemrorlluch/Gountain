import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

test('safe-area logic reserves right-side space when desktop route panel is visible', () => {
  const source = readFileSync(new URL('../map.js', import.meta.url), 'utf8');

  assert.ok(source.includes("const routePanel = $('.app-ui__route-panel');"), 'safe area should inspect route panel');
  assert.ok(source.includes('routePanelRight = (!mobile && isVisible(routePanel))'), 'route panel guard should only apply on desktop');
  assert.ok(source.includes('const right = Math.max(glossaryRight, routePanelRight, base);'), 'right safe area should reserve route panel space');
});
