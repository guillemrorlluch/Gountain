const test = require('node:test');
const assert = require('node:assert/strict');
const { markerColor, BOOT_COLORS } = require('../app.js');

test('returns specific color for known boot', () => {
  const d = { botas: ['Scarpa Ribelle Lite HD'] };
  assert.equal(markerColor(d), BOOT_COLORS['Scarpa Ribelle Lite HD']);
});

test('respects priority order', () => {
  const d = { botas: ['Cualquiera', 'Scarpa Ribelle Lite HD'] };
  assert.equal(markerColor(d), BOOT_COLORS['Scarpa Ribelle Lite HD']);
});

test('defaults to green when unknown', () => {
  const d = { botas: ['Unknown Boot'] };
  assert.equal(markerColor(d), '#22c55e');
});

test('defaults when botas missing', () => {
  const d = {};
  assert.equal(markerColor(d), '#22c55e');
});
