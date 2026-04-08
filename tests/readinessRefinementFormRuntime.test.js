import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

test('readiness refinement form imports React for classic JSX runtime bundling', () => {
  const source = readFileSync(new URL('../components/ReadinessRefinementForm.jsx', import.meta.url), 'utf8');

  assert.match(
    source,
    /import\s+React\s+from\s+['"]https:\/\/esm\.sh\/react@19\.2\.0['"]/,
    'ReadinessRefinementForm must import React when build uses classic JSX runtime'
  );
});

test('selected-route panel continues rendering refinement form in non-null route path', () => {
  const source = readFileSync(new URL('../components/RouteReadinessPanel.jsx', import.meta.url), 'utf8');

  assert.ok(
    source.includes('<ReadinessRefinementForm'),
    'selected-route path should include the refinement form component'
  );
});
