import { createRouteDemandModel, normalizeRouteDemandConfidence } from '../domain/routeDemandModel.js';

function clamp01To100(value, fallback = 50) {
  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.max(0, Math.min(100, Math.round(n)));
}

function inferTerrainComplexity(segmentation = {}) {
  const steepRatio = segmentation?.ratio?.steep || 0;
  const moderateRatio = segmentation?.ratio?.moderate || 0;
  return clamp01To100(30 + steepRatio * 55 + moderateRatio * 25, 45);
}

function inferRemoteness(distanceKm = 0) {
  return clamp01To100(25 + distanceKm * 2.1, 30);
}

function inferCommitment(distanceKm = 0, durationEstimate = 0) {
  return clamp01To100(20 + distanceKm * 1.7 + durationEstimate * 3.2, 35);
}

function inferBailoutDifficulty(segmentation = {}, elevationGain = 0) {
  const steepFactor = (segmentation?.ratio?.steep || 0) * 40;
  const elevationFactor = Math.min(30, elevationGain / 50);
  return clamp01To100(25 + steepFactor + elevationFactor, 38);
}

export function gpxToRouteDemand(gpxData = {}) {
  const hasDistance = Number.isFinite(gpxData.totalDistanceKm);
  const hasGain = Number.isFinite(gpxData.elevationGainM);
  const hasLoss = Number.isFinite(gpxData.elevationLossM);
  const hasAltitude = Number.isFinite(gpxData.altitudeProfile?.max) || Number.isFinite(gpxData.altitudeProfile?.min);
  const hasSegmentation = Boolean(gpxData.segmentation);

  const observed = [hasDistance, hasGain, hasLoss, hasAltitude, hasSegmentation].filter(Boolean).length;
  const completeness = normalizeRouteDemandConfidence(observed / 5);

  const distance = hasDistance ? Number(gpxData.totalDistanceKm.toFixed(2)) : 0;
  const elevationGain = hasGain ? Math.round(gpxData.elevationGainM) : 0;
  const elevationLoss = hasLoss ? Math.round(gpxData.elevationLossM) : 0;
  const durationEstimate = Number.isFinite(gpxData.durationEstimateHours)
    ? Number(gpxData.durationEstimateHours.toFixed(2))
    : Number((distance / 4.5 + elevationGain / 500).toFixed(2));

  return createRouteDemandModel({
    physical: {
      distance,
      elevation_gain: elevationGain,
      elevation_loss: elevationLoss,
      duration_estimate: durationEstimate
    },
    technical: {
      terrain_complexity: inferTerrainComplexity(gpxData.segmentation),
      exposure: 'unknown'
    },
    environmental: {
      altitude: {
        min: Number.isFinite(gpxData.altitudeProfile?.min) ? gpxData.altitudeProfile.min : null,
        max: Number.isFinite(gpxData.altitudeProfile?.max) ? gpxData.altitudeProfile.max : null
      },
      remoteness: inferRemoteness(distance),
      weather_exposure: 'unknown'
    },
    logistics: {
      commitment: inferCommitment(distance, durationEstimate),
      bailout_difficulty: inferBailoutDifficulty(gpxData.segmentation, elevationGain)
    },
    confidence: {
      completeness,
      source: 'gpx'
    }
  });
}

export default gpxToRouteDemand;
