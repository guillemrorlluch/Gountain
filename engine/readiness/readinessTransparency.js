const STATE_LABELS = {
  preliminary: 'Preliminary estimate',
  partial: 'Partially refined',
  strong: 'Strongly personalized'
};

const KEY_REFINEMENT_FIELDS = [
  'current_form',
  'similar_route_experience',
  'recent_elevation_capacity',
  'gear_readiness'
];

function clampPercent(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(100, Math.round(n)));
}

export function classifyReadinessState(completion = {}) {
  const changed = Number.isFinite(completion.changed) ? completion.changed : 0;
  const total = Number.isFinite(completion.total) && completion.total > 0 ? completion.total : 6;
  const percent = clampPercent(completion.percent ?? (changed / total) * 100);
  const changedFields = new Set(completion.changedFields || []);
  const keyCompleted = KEY_REFINEMENT_FIELDS.filter((field) => changedFields.has(field)).length;

  if (percent <= 17 || (changed <= 1 && keyCompleted <= 1)) {
    return {
      id: 'preliminary',
      label: STATE_LABELS.preliminary,
      keyCompleted
    };
  }

  if (percent >= 67 && (changed >= 4 || keyCompleted >= 3)) {
    return {
      id: 'strong',
      label: STATE_LABELS.strong,
      keyCompleted
    };
  }

  return {
    id: 'partial',
    label: STATE_LABELS.partial,
    keyCompleted
  };
}

export function calculateEstimateQuality(completion = {}) {
  const state = classifyReadinessState(completion);
  const coverage = clampPercent(completion.percent);
  const userShare = Math.round((coverage / 100) * 45);
  const routeShare = 40;
  const defaultShare = Math.max(0, 100 - routeShare - userShare);

  const byState = {
    preliminary: 'Mostly route + defaults; personalize key fields before trusting fine-grained precision.',
    partial: 'Route fit is personalized in places, but defaults still influence the estimate.',
    strong: 'Meaningful user refinement is applied; estimate is now mostly route + your inputs.'
  };

  return {
    state,
    coverage,
    sourceMix: {
      route: routeShare,
      user: userShare,
      defaults: defaultShare
    },
    qualityMessage: byState[state.id]
  };
}

export function getConfidencePresentation(rawConfidence, completion = {}) {
  const quality = calculateEstimateQuality(completion);
  const raw = clampPercent(rawConfidence);
  const caps = {
    preliminary: 62,
    partial: 76,
    strong: 92
  };
  const displayedConfidence = Math.min(raw, caps[quality.state.id]);

  const detailByState = {
    preliminary: 'Confidence is intentionally capped until more personalization is provided.',
    partial: 'Confidence reflects mixed evidence from route facts and partial personalization.',
    strong: 'Confidence can rise because key personalization inputs are now covered.'
  };

  return {
    displayedConfidence,
    rawConfidence: raw,
    detail: detailByState[quality.state.id]
  };
}

export function buildReadinessExplanation({ readiness, summary, estimateQuality }) {
  const demands = readiness?.derived || {};
  const routeDifficulty = [
    ['Physical demand', demands.derived_core_physical_demand_score],
    ['Technical demand', demands.derived_core_technical_demand_score],
    ['Environmental demand', demands.derived_core_environmental_demand_score]
  ]
    .filter(([, value]) => typeof value === 'number')
    .sort((a, b) => b[1] - a[1])[0];

  return {
    routeDriven: routeDifficulty
      ? `${routeDifficulty[0]} is currently the strongest route-driven limiter (${Math.round(routeDifficulty[1])}/100).`
      : 'Route-driven difficulty is estimated from terrain, altitude, and route constraints.',
    userGap: summary?.gaps?.length
      ? `Top user-specific gap: ${summary.gaps[0]}.`
      : 'No major user-specific gaps are currently flagged.',
    uncertainty: estimateQuality.state.id === 'strong'
      ? 'Uncertainty is lower because most high-impact refinement inputs are no longer defaulted.'
      : `Uncertainty remains meaningful: about ${estimateQuality.sourceMix.defaults}% of this estimate is still default/inferred.`
  };
}
