import test from 'node:test';
import assert from 'node:assert/strict';
import { computeBounds } from '../app.js';

test('computes bounding box from coordinates', () => {
  const data = [
    { coords: [10, 20] },
    { coords: [-5, 40] }
  ];
  assert.deepEqual(computeBounds(data), { west: 20, south: -5, east: 40, north: 10 });
});

test('returns null for empty input', () => {
  assert.equal(computeBounds([]), null);
});
