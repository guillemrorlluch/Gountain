import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

test('continent icon is explicit trigger wired to continent select picker', () => {
  const source = readFileSync(new URL('../index.html', import.meta.url), 'utf8');

  assert.ok(source.includes('id="btnContinent"'), 'continent icon button should have explicit id');
  assert.ok(source.includes("const btnContinent = $('#btnContinent');"), 'script should query continent trigger');
  assert.ok(source.includes('select.showPicker'), 'trigger should attempt native showPicker when available');
  assert.ok(source.includes("select.classList.toggle('is-open', nextOpen);"), 'trigger should fallback to explicit dropdown toggle');
  assert.ok(source.includes("select?.addEventListener('change', closeContinentSelect);"), 'fallback dropdown should close on change');
});
