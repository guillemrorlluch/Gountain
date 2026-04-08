import test from 'node:test';
import assert from 'node:assert/strict';
import { parseGPX } from '../engine/gpx/parseGPX.js';
import { gpxToRouteDemand } from '../engine/gpx/gpxToRouteDemand.js';
import { readinessSourceTo847Input } from '../engine/readiness/adapters/readinessSourceTo847Input.js';
import { routeTo847Input } from '../engine/readiness/adapters/routeTo847Input.js';
import { merge847Input } from '../engine/readiness/adapters/merge847Input.js';
import { userTo847Input } from '../engine/readiness/adapters/userTo847Input.js';
import { calculateRouteReadiness847 } from '../engine/readiness/RouteReadinessModelProduction.js';
import { getConfidencePresentation } from '../engine/readiness/readinessTransparency.js';

const SAMPLE_GPX = `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="test-suite">
  <trk>
    <name>Sample Route</name>
    <trkseg>
      <trkpt lat="40.0000" lon="-105.0000"><ele>1600</ele><time>2024-01-01T10:00:00Z</time></trkpt>
      <trkpt lat="40.0050" lon="-105.0100"><ele>1685</ele><time>2024-01-01T10:20:00Z</time></trkpt>
      <trkpt lat="40.0110" lon="-105.0180"><ele>1650</ele><time>2024-01-01T10:45:00Z</time></trkpt>
      <trkpt lat="40.0160" lon="-105.0220"><ele>1725</ele><time>2024-01-01T11:05:00Z</time></trkpt>
    </trkseg>
  </trk>
</gpx>`;

test('parseGPX extracts distance, elevation, altitude profile, and segmentation', async () => {
  const parsed = await parseGPX(SAMPLE_GPX);

  assert.ok(parsed.totalDistanceKm > 0);
  assert.ok(parsed.elevationGainM > 0);
  assert.ok(parsed.elevationLossM > 0);
  assert.equal(parsed.altitudeProfile.min, 1600);
  assert.equal(parsed.altitudeProfile.max, 1725);
  assert.ok(parsed.segmentation.ratio.flat + parsed.segmentation.ratio.moderate + parsed.segmentation.ratio.steep <= 1.001);
});

test('gpxToRouteDemand normalizes extracted metrics with explicit defaults', async () => {
  const parsed = await parseGPX(SAMPLE_GPX);
  const routeDemand = gpxToRouteDemand(parsed);

  assert.equal(routeDemand.confidence.source, 'gpx');
  assert.ok(routeDemand.confidence.completeness > 0);
  assert.ok(routeDemand.physical.distance > 0);
  assert.equal(routeDemand.technical.exposure, 'unknown');
  assert.equal(routeDemand.environmental.weather_exposure, 'unknown');
});

test('GPX source flows through readinessSourceTo847Input -> calculateRouteReadiness847', async () => {
  const parsed = await parseGPX(SAMPLE_GPX);
  const routeDemand = gpxToRouteDemand(parsed);
  const routeInput = readinessSourceTo847Input({
    sourceType: 'gpx_track',
    routeDemand
  });

  const merged = merge847Input(routeInput, userTo847Input({ general_resilience_score: 66 }));
  const readiness = calculateRouteReadiness847(merged);

  assert.equal(typeof readiness.score, 'number');
  assert.equal(readiness.totalVariables, 847);
  assert.ok(readiness.confidence >= 0 && readiness.confidence <= 100);
});

test('GPX-backed confidence presentation is higher than static inferred route at same raw confidence', async () => {
  const parsed = await parseGPX(SAMPLE_GPX);
  const routeDemand = gpxToRouteDemand(parsed);
  const gpxInput = readinessSourceTo847Input({ sourceType: 'gpx_track', routeDemand });
  const staticInput = routeTo847Input({ dificultad: 'AD', altitud_m: 3200, tipo: 'Travesía' });

  assert.ok(gpxInput.data_quality_route_data_confidence > staticInput.data_quality_route_data_confidence);

  const completion = { changed: 1, total: 6, percent: 16, changedFields: ['current_form'] };
  const gpxPresentation = getConfidencePresentation(80, completion, { sourceType: 'gpx_track' });
  const staticPresentation = getConfidencePresentation(80, completion, {});

  assert.ok(gpxPresentation.displayedConfidence > staticPresentation.displayedConfidence);
  assert.ok(gpxPresentation.detail.includes('GPX geometry'));
});
