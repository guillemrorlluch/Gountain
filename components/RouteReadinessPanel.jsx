import { useMemo } from 'react';
import { routeTo847Input } from '../engine/readiness/adapters/routeTo847Input.js';
import { userTo847Input } from '../engine/readiness/adapters/userTo847Input.js';
import { merge847Input } from '../engine/readiness/adapters/merge847Input.js';
import { calculateRouteReadiness847 } from '../engine/readiness/RouteReadinessModelProduction.js';

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

function labelForPenalty(key) {
  return PENALTY_LABELS[key] || formatFallbackLabel(key);
}

function labelForHardStop(key) {
  return HARD_STOP_LABELS[key] || formatFallbackLabel(key);
}

function summarize(result) {
  if (!result) return { sentence: 'Readiness unavailable.', gaps: [] };
  const sentence = result.hardStops.length
    ? 'Critical blockers detected. Do not proceed until hard stops are resolved.'
    : result.score >= 70
      ? 'Readiness looks solid for current assumptions.'
      : result.score >= 50
        ? 'Readiness is moderate and requires caution.'
        : 'Readiness is currently low for this route profile.';

  const sortedPenalties = Object.entries(result.penalties)
    .sort((a, b) => b[1] - a[1])
    .filter(([, value]) => value > 0)
    .slice(0, 3)
    .map(([name]) => labelForPenalty(name));

  return { sentence, gaps: sortedPenalties };
}

export default function RouteReadinessPanel({ destination, userProfile }) {
  const readiness = useMemo(() => {
    if (!destination) return null;
    const routeInput = routeTo847Input(destination);
    const userInput = userTo847Input(userProfile || {});
    const merged = merge847Input(routeInput, userInput);
    return calculateRouteReadiness847(merged);
  }, [destination, userProfile]);

  if (!destination) {
    return (
      <section className="route-readiness" aria-live="polite">
        <h3>Route readiness</h3>
        <p>Select a route to view readiness.</p>
      </section>
    );
  }

  if (!readiness) {
    return (
      <section className="route-readiness" aria-live="polite">
        <h3>Route readiness</h3>
        <p>Readiness data is not available for this route yet.</p>
      </section>
    );
  }

  const summary = summarize(readiness);
  const topSubscores = Object.entries(readiness.subScores)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  return (
    <section className="route-readiness" aria-live="polite">
      <h3>Route readiness</h3>
      <div className="route-readiness__metrics">
        <span>Score: <strong>{readiness.score}</strong></span>
        <span>Band: <strong>{readiness.band}</strong></span>
        <span>Decision: <strong>{readiness.decision}</strong></span>
        <span>Confidence: <strong>{readiness.confidence}</strong></span>
      </div>

      <p className="route-readiness__summary">{summary.sentence}</p>

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

      {readiness.hardStops.length > 0 ? (
        <div className="route-readiness__hardstops">
          <strong>Hard stops:</strong>
          <ul>
            {readiness.hardStops.map((stop) => <li key={stop}>{labelForHardStop(stop)}</li>)}
          </ul>
        </div>
      ) : null}
    </section>
  );
}
