const test = require('node:test');
const assert = require('node:assert/strict');
const { monthsToSeasons } = require('../app.js');

test('maps month range to seasons', () => {
  assert.deepEqual(monthsToSeasons('Jun–Aug'), ['Verano']);
  assert.deepEqual(monthsToSeasons('Nov–Mar'), ['Otoño','Invierno','Primavera']);
});

test('returns empty array on invalid input', () => {
  assert.deepEqual(monthsToSeasons(''), []);
});
