const test = require('node:test');
const assert = require('node:assert/strict');
const { normalizeDiff } = require('../app.js');

test('normalizeDiff buckets', () => {
  assert.equal(normalizeDiff('AD'), 'AD');
  assert.equal(normalizeDiff('PD'), 'PD');
  assert.equal(normalizeDiff('D'), 'D');
  assert.equal(normalizeDiff('F'), 'F');
  assert.equal(normalizeDiff('Trekking in Alps'), 'Trek');
});
