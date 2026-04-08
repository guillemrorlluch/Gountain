import test from 'node:test';
import assert from 'node:assert/strict';
import {
  classifyReadinessState,
  calculateEstimateQuality,
  getConfidencePresentation
} from '../engine/readiness/readinessTransparency.js';

test('readiness state classification progresses from preliminary to strong', () => {
  const preliminary = classifyReadinessState({
    changed: 0,
    total: 6,
    percent: 0,
    changedFields: []
  });
  const partial = classifyReadinessState({
    changed: 2,
    total: 6,
    percent: 33,
    changedFields: ['current_form', 'gear_readiness']
  });
  const strong = classifyReadinessState({
    changed: 5,
    total: 6,
    percent: 83,
    changedFields: ['current_form', 'gear_readiness', 'similar_route_experience', 'recent_elevation_capacity', 'multi_day_experience']
  });

  assert.equal(preliminary.label, 'Preliminary estimate');
  assert.equal(partial.label, 'Partially refined');
  assert.equal(strong.label, 'Strongly personalized');
});

test('estimate quality communicates default-driven vs personalized source mix', () => {
  const preliminary = calculateEstimateQuality({ changed: 0, total: 6, percent: 0, changedFields: [] });
  const partial = calculateEstimateQuality({
    changed: 3,
    total: 6,
    percent: 50,
    changedFields: ['current_form', 'similar_route_experience', 'gear_readiness']
  });

  assert.equal(preliminary.sourceMix.route, 40);
  assert.equal(preliminary.sourceMix.user, 0);
  assert.equal(preliminary.sourceMix.defaults, 60);
  assert.ok(preliminary.qualityMessage.includes('defaults'));

  assert.ok(partial.sourceMix.user > preliminary.sourceMix.user);
  assert.ok(partial.sourceMix.defaults < preliminary.sourceMix.defaults);
  assert.ok(partial.qualityMessage.includes('personalized'));
});

test('confidence messaging is guarded when refinement coverage is low', () => {
  const lowCoverage = getConfidencePresentation(88, {
    changed: 0,
    total: 6,
    percent: 0,
    changedFields: []
  });
  const highCoverage = getConfidencePresentation(88, {
    changed: 5,
    total: 6,
    percent: 83,
    changedFields: ['current_form', 'gear_readiness', 'similar_route_experience', 'recent_elevation_capacity', 'multi_day_experience']
  });

  assert.equal(lowCoverage.displayedConfidence, 62);
  assert.ok(lowCoverage.detail.includes('capped'));
  assert.ok(highCoverage.displayedConfidence > lowCoverage.displayedConfidence);
  assert.ok(highCoverage.detail.includes('key personalization'));
});

test('confidence presentation tolerates null route context', () => {
  const presentation = getConfidencePresentation(72, {
    changed: 0,
    total: 6,
    percent: 0,
    changedFields: []
  }, null);

  assert.equal(presentation.displayedConfidence, 62);
  assert.equal(presentation.rawConfidence, 72);
  assert.ok(typeof presentation.detail === 'string');
});
