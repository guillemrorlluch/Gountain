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
  assert.ok(['low', 'medium', 'high'].includes(routeDemand.technical.exposure));
  assert.ok(Array.isArray(routeDemand.technical.route_segments));
  assert.ok(routeDemand.technical.route_segments.length >= 1);
  assert.equal(routeDemand.environmental.weather_exposure, 'unknown');
});

test('segmentation and terrain classification distinguish technical route from smooth route', () => {
  const smoothRoute = gpxToRouteDemand({
    points: [
      { lat: 40, lon: -105, ele: 2000 },
      { lat: 40.002, lon: -105.002, ele: 2008 },
      { lat: 40.004, lon: -105.004, ele: 2013 },
      { lat: 40.006, lon: -105.006, ele: 2018 },
      { lat: 40.008, lon: -105.008, ele: 2022 }
    ],
    totalDistanceKm: 1.2,
    elevationGainM: 22,
    elevationLossM: 0,
    altitudeProfile: { min: 2000, max: 2022 },
    segmentation: { ratio: { flat: 0.9, moderate: 0.1, steep: 0 } },
    durationEstimateHours: 0.4
  });

  const technicalRoute = gpxToRouteDemand({
    points: [
      { lat: 40, lon: -105, ele: 2100 },
      { lat: 40.002, lon: -105.001, ele: 2170 },
      { lat: 40.004, lon: -105.002, ele: 2120 },
      { lat: 40.006, lon: -105.003, ele: 2240 },
      { lat: 40.008, lon: -105.004, ele: 2180 },
      { lat: 40.01, lon: -105.005, ele: 2325 }
    ],
    totalDistanceKm: 1.4,
    elevationGainM: 315,
    elevationLossM: 90,
    altitudeProfile: { min: 2100, max: 2325 },
    segmentation: { ratio: { flat: 0.05, moderate: 0.35, steep: 0.6 } },
    durationEstimateHours: 1.2
  });

  assert.ok(technicalRoute.technical.route_segments.length >= smoothRoute.technical.route_segments.length);
  assert.ok(technicalRoute.technical.terrain_complexity > smoothRoute.technical.terrain_complexity);
  assert.ok(technicalRoute.technical.exposure_score >= smoothRoute.technical.exposure_score);
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

test('technical segmentation meaningfully impacts readiness outputs', () => {
  const userInput = userTo847Input({ general_resilience_score: 66, exposure_tolerance_score: 55 });
  const easyDemand = gpxToRouteDemand({
    points: [
      { lat: 39.9, lon: -105.1, ele: 1800 },
      { lat: 39.902, lon: -105.102, ele: 1810 },
      { lat: 39.904, lon: -105.104, ele: 1818 }
    ],
    totalDistanceKm: 0.9,
    elevationGainM: 18,
    elevationLossM: 0,
    altitudeProfile: { min: 1800, max: 1818 },
    segmentation: { ratio: { flat: 1, moderate: 0, steep: 0 } },
    durationEstimateHours: 0.35
  });
  const hardDemand = gpxToRouteDemand({
    points: [
      { lat: 39.9, lon: -105.1, ele: 2500 },
      { lat: 39.902, lon: -105.102, ele: 2590 },
      { lat: 39.904, lon: -105.104, ele: 2520 },
      { lat: 39.906, lon: -105.106, ele: 2660 }
    ],
    totalDistanceKm: 1.1,
    elevationGainM: 230,
    elevationLossM: 70,
    altitudeProfile: { min: 2500, max: 2660 },
    segmentation: { ratio: { flat: 0.05, moderate: 0.2, steep: 0.75 } },
    durationEstimateHours: 1.1
  });

  const easyReadiness = calculateRouteReadiness847(
    merge847Input(readinessSourceTo847Input({ sourceType: 'gpx_track', routeDemand: easyDemand }), userInput)
  );
  const hardReadiness = calculateRouteReadiness847(
    merge847Input(readinessSourceTo847Input({ sourceType: 'gpx_track', routeDemand: hardDemand }), userInput)
  );

  assert.ok(hardReadiness.derived.derived_core_technical_demand_score >= easyReadiness.derived.derived_core_technical_demand_score);
  assert.ok(hardReadiness.score <= easyReadiness.score);
});
