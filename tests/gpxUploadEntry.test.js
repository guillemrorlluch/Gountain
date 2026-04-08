import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

test('GPX upload entry point is discoverable and wired to upload handler', () => {
  const source = readFileSync(new URL('../App.jsx', import.meta.url), 'utf8');

  assert.ok(source.includes('Upload GPX'), 'upload trigger label should be visible');
  assert.ok(source.includes('id="gpx-upload-input"'), 'file input id should exist');
  assert.ok(source.includes('onClick={() => gpxInputRef.current?.click()}'), 'CTA should open the file picker');
  assert.ok(source.includes('onChange={handleGPXUpload}'), 'file input should be wired to the GPX upload handler');
  assert.ok(source.includes('accept=".gpx,application/gpx+xml,application/xml,text/xml"'), 'file input should accept GPX files');
  assert.ok(source.includes('aria-live="polite"'), 'status updates should be announced');
  assert.ok(source.includes('aria-label="Analyze GPX route"'), 'upload group should be announced for accessibility');
});
