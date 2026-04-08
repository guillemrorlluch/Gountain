import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

test('header uses inline SVG mountain logo with wordmark', () => {
  const source = readFileSync(new URL('../index.html', import.meta.url), 'utf8');

  assert.ok(source.includes('class="topbar__logo-svg"'), 'header should include inline svg logo class');
  assert.ok(source.includes('clip0_1_639'), 'provided logo clipPath should be preserved');
  assert.ok(source.includes('<span class="topbar__title">Gountain</span>'), 'wordmark should remain next to logo');
});
