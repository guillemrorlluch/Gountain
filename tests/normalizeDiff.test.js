import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeDiff } from '../app.js';

test('normalizeDiff buckets', () => {
  assert.equal(normalizeDiff('AD'), 'AD');
  assert.equal(normalizeDiff('PD'), 'PD');
  assert.equal(normalizeDiff('D'), 'D');
  assert.equal(normalizeDiff('F'), 'F');
  assert.equal(normalizeDiff('Trekking in Alps'), 'Trek');
  assert.equal(normalizeDiff('Alpine style'), 'Alpine style');
});
