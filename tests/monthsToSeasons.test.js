import test from 'node:test';
import assert from 'node:assert/strict';
import { monthsToSeasons } from '../app.js';

test('maps month range to seasons', () => {
  assert.deepEqual(monthsToSeasons('Jun–Aug'), ['Verano']);
  assert.deepEqual(monthsToSeasons('Nov–Mar'), ['Otoño','Invierno','Primavera']);
});

test('returns empty array on invalid input', () => {
  assert.deepEqual(monthsToSeasons(''), []);
});

test('supports hyphen-separated ranges', () => {
  assert.deepEqual(monthsToSeasons('Jun-Aug'), ['Verano']);
});
