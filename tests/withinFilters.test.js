import test from 'node:test';
import assert from 'node:assert/strict';
import { withinFilters } from '../app.js';

function emptyFilters() {
  return {
    continente: new Set(),
    dificultad: new Set(),
    botas: new Set(),
    tipo: new Set(),
    season: new Set(),
    altitude: { min: null, max: null }
  };
}

test('returns true when no filters set', () => {
  const F = emptyFilters();
  const d = { continente: 'Asia', dificultad: 'AD1', tipo: 'Volcan', botas: ['Scarpa'] };
  assert.equal(withinFilters(d, F), true);
});

test('filters by continent', () => {
  const F = emptyFilters();
  F.continente.add('Asia');
  assert.equal(withinFilters({ continente: 'Asia', dificultad: '', tipo: '', botas: [] }, F), true);
  assert.equal(withinFilters({ continente: 'Europa', dificultad: '', tipo: '', botas: [] }, F), false);
});

test('filters by difficulty bucket', () => {
  const F = emptyFilters();
  F.dificultad.add('AD');
  assert.equal(withinFilters({ continente: '', dificultad: 'AD2', tipo: '', botas: [] }, F), true);
  assert.equal(withinFilters({ continente: '', dificultad: 'F', tipo: '', botas: [] }, F), false);
});

test('filters by boots', () => {
  const F = emptyFilters();
  F.botas.add('Scarpa Ribelle Lite HD');
  assert.equal(withinFilters({ continente: '', dificultad: '', tipo: '', botas: ['Scarpa Ribelle Lite HD'] }, F), true);
  assert.equal(withinFilters({ continente: '', dificultad: '', tipo: '', botas: ['La Sportiva Nepal Cube GTX'] }, F), false);
  assert.equal(withinFilters({ continente: '', dificultad: '', tipo: '', botas: undefined }, F), false);
});

test('filters by altitude range', () => {
  const F = emptyFilters();
  F.altitude.min = 1000;
  F.altitude.max = 2000;
  assert.equal(withinFilters({ continente:'', dificultad:'', tipo:'', botas:[], altitud_m:1500 }, F), true);
  assert.equal(withinFilters({ continente:'', dificultad:'', tipo:'', botas:[], altitud_m:2500 }, F), false);
});

test('filters by season', () => {
  const F = emptyFilters();
  F.season.add('Verano');
  assert.equal(withinFilters({ continente:'', dificultad:'', tipo:'', botas:[], seasons:['Verano','Otoño'] }, F), true);
  assert.equal(withinFilters({ continente:'', dificultad:'', tipo:'', botas:[], seasons:['Invierno'] }, F), false);
});

test('combined filters must all match', () => {
  const F = {
    continente: new Set(['Asia']),
    dificultad: new Set(['AD']),
    botas: new Set(['Scarpa Ribelle Lite HD']),
    tipo: new Set(['Volcan']),
    season: new Set(),
    altitude: { min: null, max: null }
  };
  const good = { continente: 'Asia', dificultad: 'AD1', tipo: 'Volcan', botas: ['Scarpa Ribelle Lite HD'] };
  const bad = { continente: 'Asia', dificultad: 'AD1', tipo: 'Trek', botas: ['Scarpa Ribelle Lite HD'] };
  assert.equal(withinFilters(good, F), true);
  assert.equal(withinFilters(bad, F), false);
});
