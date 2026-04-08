import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

test('map popup template is minimal and points users to selected-route panel', () => {
  const source = readFileSync(new URL('../map.js', import.meta.url), 'utf8');
  const popupStart = source.indexOf('function popupHtml(d){');
  const popupEnd = source.indexOf('// =====================================================\n// COLORS + GEO');
  const popupSource = source.slice(popupStart, popupEnd);

  assert.ok(popupSource.includes('popup popup--minimal'), 'popup should use minimal template class');
  assert.ok(popupSource.includes('Use the selected-route panel for readiness score and route details.'), 'popup should redirect to selected-route panel');
  assert.equal(popupSource.includes('AllTrails'), false, 'popup should not include heavy external links block');
  assert.equal(popupSource.includes('photosHtml'), false, 'popup should not render photo gallery in popup template');
});
