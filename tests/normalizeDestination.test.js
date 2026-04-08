import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeDestination } from '../engine/domain/routeDomain.js';

test('normalizes destination with canonical name while preserving nombre', () => {
  const raw = {
    id: 'x1',
    nombre: 'Aneto',
    continente: 'europe',
    coords: ['42.63', '0.65']
  };

  const result = normalizeDestination(raw);
  assert.equal(result.name, 'Aneto');
  assert.equal(result.nombre, 'Aneto');
  assert.equal(result.continente, 'Europa');
  assert.deepEqual(result.coords, [42.63, 0.65]);
});

