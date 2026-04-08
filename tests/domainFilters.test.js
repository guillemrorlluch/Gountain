import test from 'node:test';
import assert from 'node:assert/strict';
import { withinFilters } from '../engine/domain/routeDomain.js';

test('withinFilters matches season using meses fallback', () => {
  const destination = {
    continente: 'Europa',
    dificultad: 'AD',
    tipo: 'Travesía',
    botas: ['Bestard Teix Lady GTX'],
    meses: 'Jun–Aug',
    altitud_m: 2100
  };

  const filters = {
    continente: new Set(['Europa']),
    dificultad: new Set(['AD']),
    tipo: new Set(['Travesía']),
    botas: new Set(['Bestard Teix Lady GTX']),
    season: new Set(['Verano']),
    altitude: { min: 1500, max: 2500 }
  };

  assert.equal(withinFilters(destination, filters), true);
});
