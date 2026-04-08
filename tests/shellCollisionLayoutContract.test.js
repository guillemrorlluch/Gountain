import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

test('desktop route panel starts below top-right map controls area', () => {
  const source = readFileSync(new URL('../styles.css', import.meta.url), 'utf8');

  assert.ok(source.includes('.mapboxgl-ctrl-top-right{ top:5.15rem; right:.85rem; }'), 'map controls top offset contract should be explicit');
  assert.ok(source.includes('.app-ui__route-panel{\n  position:fixed;\n  right:1rem;\n  left:auto;\n  transform:none;\n  top:13.4rem;'), 'route panel top should be pushed below control stack');
});
