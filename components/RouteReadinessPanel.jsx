import { useEffect, useMemo } from 'react';
import { userTo847Input } from '../engine/readiness/adapters/userTo847Input.js';
import { merge847Input } from '../engine/readiness/adapters/merge847Input.js';
import { readinessSourceTo847Input } from '../engine/readiness/adapters/readinessSourceTo847Input.js';
import { calculateRouteReadiness847 } from '../engine/readiness/RouteReadinessModelProduction.js';
import {
  getRefinementCompletion,
  toExpandedUserProfile
} from '../engine/readiness/currentUserProfile.js';
import {
  calculateEstimateQuality,
  getConfidencePresentation,
  buildReadinessExplanation
} from '../engine/readiness/readinessTransparency.js';
import ReadinessRefinementForm from './ReadinessRefinementForm.jsx';

const PENALTY_LABELS = {
  fatigue_penalty: 'Fatigue load exceeds current recovery',
  injury_penalty: 'Injury risk is elevated for this plan',
  technical_penalty: 'Technical route demand is above skills',
  environmental_penalty: 'Weather / environment adds meaningful risk',
  logistical_penalty: 'Logistics and route operations are limiting',
  mismatch_penalty: 'Route-to-user mismatch across key demands'
};

const HARD_STOP_LABELS = {
  recent_illness: 'Recent illness flag is too high',
  medical_constraint: 'Medical constraints require plan deferral',
  exposure_vertigo_conflict: 'Exposure and vertigo conflict is unsafe',
  lightning_window: 'Lightning hazard window is currently critical',
  avalanche_window: 'Avalanche hazard window is currently critical',
  mandatory_gear_gap: 'Mandatory gear gap creates a hard stop',
  objective_hazard_self_rescue_gap: 'Objective hazards exceed self-rescue margin'
};

function formatFallbackLabel(key) {
  return key
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function summarize(result) {
  if (!result) return { sentence: 'Readiness unavailable.', gaps: [] };
  const sentence = result.hardStops.length
    ? 'Critical blockers detected. Do not proceed until hard stops are resolved.'
    : result.score >= 70
      ? 'Preliminary readiness looks solid for this route.'
      : result.score >= 50
        ? 'Preliminary readiness is moderate; refine assumptions below.'
        : 'Preliminary readiness is low; refine assumptions before deciding.';

  const sortedPenalties = Object.entries(result.penalties)
    .sort((a, b) => b[1] - a[1])
    .filter(([, value]) => value > 0)
    .slice(0, 3)
    .map(([name]) => PENALTY_LABELS[name] || formatFallbackLabel(name));

  return { sentence, gaps: sortedPenalties };
}

function formatValue(value, fallback = '—') {
  if (value == null || value === '') return fallback;
  if (Array.isArray(value)) return value.length ? value.join(', ') : fallback;
  return value;
}

export default function RouteReadinessPanel({
  destination,
  userProfile,
  onChangeUserProfile
}) {
  const expandedProfile = useMemo(
    () => toExpandedUserProfile(userProfile || {}),
    [userProfile]
  );

  const readiness = useMemo(() => {
    if (!destination) return null;
    const routeInput = readinessSourceTo847Input(destination);
    const userInput = userTo847Input(expandedProfile);
    const merged = merge847Input(routeInput, userInput);
    return calculateRouteReadiness847(merged);
  }, [destination, expandedProfile]);

  const completion = useMemo(() => getRefinementCompletion(userProfile), [userProfile]);
  const estimateQuality = useMemo(() => calculateEstimateQuality(completion), [completion]);
  const confidencePresentation = useMemo(
    () => getConfidencePresentation(readiness?.confidence, completion, destination),
    [readiness?.confidence, completion, destination]
  );

  useEffect(() => {
    if (!destination) {
      console.debug('[RouteReadinessPanel] destination prop is empty');
      return;
    }
    console.debug('[RouteReadinessPanel] destination prop received', destination);
  }, [destination]);

  useEffect(() => {
    if (!destination) return;
    console.debug('[RouteReadinessPanel] readiness result generated', readiness);
  }, [destination, readiness]);

  if (!destination) {
    return (
      <section className="route-readiness" aria-live="polite">
        <h3>Selected route</h3>
        <p>Select a route to open the decision panel.</p>
      </section>
    );
  }

  if (!readiness) {
    return (
      <section className="route-readiness" aria-live="polite">
        <h3>Selected route</h3>
        <p>Readiness data is not available for this route yet.</p>
      </section>
    );
  }

  const summary = summarize(readiness);
  const explanation = buildReadinessExplanation({
    readiness,
    summary,
    estimateQuality,
    routeContext: destination
  });
  const topSubscores = Object.entries(readiness.subScores)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  return (
    <section className="route-readiness" aria-live="polite">
      <h3>Selected route</h3>

      <div className="route-readiness__primary" data-testid="readiness-primary">
        <h4>Readiness decision</h4>
        <div className="route-readiness__metrics">
          <span>Score: <strong>{readiness.score}</strong></span>
          <span>Band: <strong>{readiness.band}</strong></span>
          <span>Decision: <strong>{readiness.decision}</strong></span>
          <span>State: <strong>{estimateQuality.state.label}</strong></span>
          <span>Confidence: <strong>{confidencePresentation.displayedConfidence}</strong></span>
        </div>
        <p className="route-readiness__summary">{summary.sentence}</p>
        <p className="route-readiness__quality-message">{estimateQuality.qualityMessage}</p>
        <p className="route-readiness__progressive-note">
          Estimate starts from route demand and improves as you refine {completion.changed}/{completion.total} high-impact fields.
        </p>
        <div className="route-readiness__source-mix">
          <span>Route data {estimateQuality.sourceMix.route}%</span>
          <span>User inputs {estimateQuality.sourceMix.user}%</span>
          <span>Estimated/default {estimateQuality.sourceMix.defaults}%</span>
        </div>
        <p className="route-readiness__confidence-note">
          Confidence uses data coverage guardrails ({confidencePresentation.rawConfidence} raw): {confidencePresentation.detail}
        </p>
      </div>

      <div className="route-readiness__route-info" data-testid="route-info">
        <h4>{formatValue(destination.name || destination.nombre)}</h4>
        <dl>
          <div><dt>Continent</dt><dd>{formatValue(destination.continente)}</dd></div>
          <div><dt>Type</dt><dd>{formatValue(destination.tipo)}</dd></div>
          <div><dt>Altitude</dt><dd>{destination.altitud_m ? `${destination.altitud_m} m` : '—'}</dd></div>
          <div><dt>Difficulty</dt><dd>{formatValue(destination.dificultad)}</dd></div>
          <div><dt>Months</dt><dd>{formatValue(destination.meses)}</dd></div>
          <div><dt>Boots</dt><dd>{formatValue(destination.botas)}</dd></div>
          <div><dt>Gear</dt><dd>{formatValue(destination.equipo)}</dd></div>
          <div><dt>Logistics</dt><dd>{formatValue(destination.logistica || destination.permisos || destination.guia)}</dd></div>
        </dl>
      </div>

      <ul className="route-readiness__subscores">
        {topSubscores.map(([name, value]) => (
          <li key={name}>{formatFallbackLabel(name)}: {Math.round(value)}</li>
        ))}
      </ul>

      {summary.gaps.length > 0 ? (
        <ul className="route-readiness__gaps">
          {summary.gaps.map((gap) => <li key={gap}>{gap}</li>)}
        </ul>
      ) : (
        <p className="route-readiness__gaps-empty">No major limiting gaps detected.</p>
      )}

      <div className="route-readiness__explanation">
        <strong>Why this score looks like this</strong>
        <ul>
          <li>{explanation.routeDriven}</li>
          <li>{explanation.technicalWhy}</li>
          <li>{explanation.userGap}</li>
          <li>{explanation.uncertainty}</li>
        </ul>
      </div>

      {readiness.hardStops.length > 0 ? (
        <div className="route-readiness__hardstops">
          <strong>Hard stops:</strong>
          <ul>
            {readiness.hardStops.map((stop) => (
              <li key={stop}>{HARD_STOP_LABELS[stop] || formatFallbackLabel(stop)}</li>
            ))}
          </ul>
        </div>
      ) : null}

      <ReadinessRefinementForm
        profile={userProfile}
        onChange={onChangeUserProfile}
        completion={completion}
      />
    </section>
  );
}
