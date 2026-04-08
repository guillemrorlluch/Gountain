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

function haversineMeters(a, b) {
  if (!a || !b) return 0;
  const toRad = (v) => (Number(v) * Math.PI) / 180;
  const R = 6371000;
  const dLat = toRad((b.lat || 0) - (a.lat || 0));
  const dLon = toRad((b.lon || 0) - (a.lon || 0));
  const lat1 = toRad(a.lat || 0);
  const lat2 = toRad(b.lat || 0);
  const h = Math.sin(dLat / 2) ** 2
    + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

function median(values = []) {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? (sorted[mid - 1] + sorted[mid]) / 2
    : sorted[mid];
}

function stddev(values = []) {
  if (!values.length) return 0;
  const avg = values.reduce((sum, value) => sum + value, 0) / values.length;
  const variance = values.reduce((sum, value) => sum + (value - avg) ** 2, 0) / values.length;
  return Math.sqrt(variance);
}

function classifyTerrainBand({ avgAbsGradient = 0, sustainedSteepRatio = 0, sharpDeltaRatio = 0, unevenness = 0 }) {
  const score = (avgAbsGradient * 2.7) + (sustainedSteepRatio * 34) + (sharpDeltaRatio * 28) + (unevenness * 22);
  if (score >= 80) return 'very_high';
  if (score >= 58) return 'high';
  if (score >= 36) return 'moderate';
  return 'low';
}

function splitIntoMeaningfulSegments(points = []) {
  if (points.length < 2) return [];

  const legs = [];
  for (let i = 1; i < points.length; i += 1) {
    const a = points[i - 1];
    const b = points[i];
    const distanceM = haversineMeters(a, b);
    if (!Number.isFinite(distanceM) || distanceM < 8) continue;
    if (!Number.isFinite(a.ele) || !Number.isFinite(b.ele)) continue;

    const elevationDelta = b.ele - a.ele;
    const gradient = (elevationDelta / distanceM) * 100;
    legs.push({ distanceM, elevationDelta, gradient, absGradient: Math.abs(gradient) });
  }

  if (!legs.length) return [];

  const gradientValues = legs.map((leg) => leg.absGradient);
  const medianGradient = median(gradientValues);
  const transitionThreshold = Math.max(4, medianGradient * 0.85);
  const maxSegmentDistanceM = 700;

  const segments = [];
  let current = null;

  const finalize = () => {
    if (!current || current.legs.length < 1) return;
    const gradients = current.legs.map((leg) => leg.gradient);
    const absGradients = current.legs.map((leg) => leg.absGradient);
    const steepLegs = current.legs.filter((leg) => leg.absGradient >= 18).length;
    const sharpDeltas = gradients.slice(1).filter((g, idx) => Math.abs(g - gradients[idx]) >= 10).length;
    const sustainedClimbDistanceM = current.legs
      .filter((leg) => leg.gradient >= 12)
      .reduce((sum, leg) => sum + leg.distanceM, 0);
    const sustainedSteepRatio = current.distanceM > 0 ? sustainedClimbDistanceM / current.distanceM : 0;
    const sharpDeltaRatio = current.legs.length > 1 ? sharpDeltas / (current.legs.length - 1) : 0;
    const unevenness = Math.min(1, stddev(absGradients) / 8);
    const avgAbsGradient = absGradients.reduce((sum, value) => sum + value, 0) / absGradients.length;
    const terrainBand = classifyTerrainBand({
      avgAbsGradient,
      sustainedSteepRatio,
      sharpDeltaRatio,
      unevenness
    });

    const technicalScore = clamp01To100(
      24
      + (avgAbsGradient * 2.2)
      + (sustainedSteepRatio * 30)
      + (sharpDeltaRatio * 20)
      + (unevenness * 18)
      + (steepLegs / current.legs.length) * 16,
      45
    );

    segments.push({
      distance_km: Number((current.distanceM / 1000).toFixed(2)),
      elevation_gain_m: Math.max(0, Math.round(current.elevationDeltaM)),
      elevation_loss_m: Math.max(0, Math.round(-current.elevationDeltaM)),
      avg_abs_gradient: Number(avgAbsGradient.toFixed(2)),
      sustained_steep_ratio: Number(sustainedSteepRatio.toFixed(3)),
      sharp_transition_ratio: Number(sharpDeltaRatio.toFixed(3)),
      unevenness: Number(unevenness.toFixed(3)),
      terrain_band: terrainBand,
      technical_score: technicalScore
    });
  };

  legs.forEach((leg, index) => {
    if (!current) {
      current = { legs: [leg], distanceM: leg.distanceM, elevationDeltaM: leg.elevationDelta };
      return;
    }

    const prev = current.legs[current.legs.length - 1];
    const transition = Math.abs(leg.absGradient - prev.absGradient);
    const forceSplit = transition >= transitionThreshold || current.distanceM >= maxSegmentDistanceM;

    if (forceSplit) {
      finalize();
      current = { legs: [leg], distanceM: leg.distanceM, elevationDeltaM: leg.elevationDelta };
      return;
    }

    current.legs.push(leg);
    current.distanceM += leg.distanceM;
    current.elevationDeltaM += leg.elevationDelta;

    if (index === legs.length - 1) finalize();
  });

  if (current && segments.length === 0) {
    finalize();
  }

  return segments;
}

function classifyExposure({ gradientScore = 0, altitudeMax = 0, transitionRisk = 0, terrainScore = 0 }) {
  const score = clamp01To100(
    (gradientScore * 0.42)
    + (Math.min(100, altitudeMax / 45) * 0.22)
    + (transitionRisk * 0.16)
    + (terrainScore * 0.2),
    40
  );

  const level = score >= 66 ? 'high' : score >= 42 ? 'medium' : 'low';
  return { score, level };
}

function deriveTechnicalFromSegments(gpxData = {}) {
  const segments = splitIntoMeaningfulSegments(gpxData.points || []);
  if (!segments.length) {
    return {
      segments: [],
      terrainComplexity: inferTerrainComplexity(gpxData.segmentation),
      exposure: { score: 38, level: 'low' },
      highlights: []
    };
  }

  const totalDistanceKm = segments.reduce((sum, segment) => sum + segment.distance_km, 0) || 1;
  const weightedTerrain = segments.reduce((sum, segment) => (
    sum + segment.technical_score * (segment.distance_km / totalDistanceKm)
  ), 0);
  const transitionRisk = clamp01To100(
    (segments.reduce((sum, s) => sum + s.sharp_transition_ratio, 0) / segments.length) * 100,
    35
  );
  const gradientScore = clamp01To100(
    (segments.reduce((sum, s) => sum + s.avg_abs_gradient, 0) / segments.length) * 5.2,
    40
  );
  const altitudeMax = Number(gpxData.altitudeProfile?.max) || 0;
  const exposure = classifyExposure({
    gradientScore,
    altitudeMax,
    transitionRisk,
    terrainScore: weightedTerrain
  });

  const highSegments = segments.filter((segment) => segment.technical_score >= 68).length;
  const veryHighSegments = segments.filter((segment) => segment.terrain_band === 'very_high').length;
  const highlights = [];
  if (highSegments > 0) highlights.push(`${highSegments} segment(s) show sustained steep technical load`);
  if (veryHighSegments > 0) highlights.push(`${veryHighSegments} segment(s) have very high terrain variability`);
  if (exposure.level !== 'low') highlights.push(`Exposure estimated as ${exposure.level} due to gradient + altitude transitions`);

  return {
    segments,
    terrainComplexity: clamp01To100(weightedTerrain, 45),
    exposure,
    highlights
  };
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
  const technicalModel = deriveTechnicalFromSegments(gpxData);

  return createRouteDemandModel({
    physical: {
      distance,
      elevation_gain: elevationGain,
      elevation_loss: elevationLoss,
      duration_estimate: durationEstimate
    },
    technical: {
      terrain_complexity: technicalModel.terrainComplexity,
      exposure: technicalModel.exposure.level,
      exposure_score: technicalModel.exposure.score,
      route_segments: technicalModel.segments
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
    },
    insights: {
      terrain_model: 'phase5_heuristic_segmentation',
      highlights: technicalModel.highlights
    }
  });
}

export default gpxToRouteDemand;
