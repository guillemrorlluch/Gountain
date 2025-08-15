import test from 'node:test';
import assert from 'node:assert/strict';
import { markerColor, BOOT_COLORS } from '../app.js';

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
