import { useMemo } from 'react';
import { routeTo847Input } from '../engine/readiness/adapters/routeTo847Input.js';
import { userTo847Input } from '../engine/readiness/adapters/userTo847Input.js';
import { merge847Input } from '../engine/readiness/adapters/merge847Input.js';
import { calculateRouteReadiness847 } from '../engine/readiness/RouteReadinessModelProduction.js';

function formatKey(key) {
  return key.replace(/_/g, ' ');
}

function summarize(result) {
  if (!result) return { sentence: 'Readiness unavailable.', gaps: [] };
  const sentence = result.hardStops.length
    ? 'Critical blockers detected for this plan.'
    : result.score >= 70
      ? 'Readiness looks solid for current assumptions.'
      : result.score >= 50
        ? 'Readiness is moderate and requires caution.'
        : 'Readiness is currently low for this route profile.';

  const sortedPenalties = Object.entries(result.penalties)
    .sort((a, b) => b[1] - a[1])
    .filter(([, value]) => value > 0)
    .slice(0, 3)
    .map(([name]) => formatKey(name));

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
          <li key={name}>{formatKey(name)}: {Math.round(value)}</li>
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
            {readiness.hardStops.map((stop) => <li key={stop}>{formatKey(stop)}</li>)}
          </ul>
        </div>
      ) : null}
    </section>
  );
}
