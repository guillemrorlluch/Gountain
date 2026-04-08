import React from 'https://esm.sh/react@19.2.0';

const REFINEMENT_FIELDS = [
  {
    key: 'recent_elevation_capacity',
    label: 'Recent elevation capacity',
    helper: 'How well your body has recently handled sustained gain / altitude.'
  },
  {
    key: 'similar_route_experience',
    label: 'Similar route experience',
    helper: 'Hands-on recency with similar terrain and commitment.'
  },
  {
    key: 'exposure_tolerance',
    label: 'Exposure tolerance',
    helper: 'Comfort and control on airy sections.'
  },
  {
    key: 'multi_day_experience',
    label: 'Multi-day experience',
    helper: 'Experience sustaining performance across long efforts.'
  },
  {
    key: 'current_form',
    label: 'Current form',
    helper: 'Current fitness and freshness this week.'
  },
  {
    key: 'gear_readiness',
    label: 'Gear readiness',
    helper: 'Confidence in critical footwear/navigation/safety kit.'
  }
];

export default function ReadinessRefinementForm({ profile, onChange, completion }) {
  return (
    <details className="readiness-refinement" aria-live="polite">
      <summary className="readiness-refinement__summary-row">
        <span>Refine estimate</span>
        <strong>{completion.percent}% refined</strong>
      </summary>
      <p className="readiness-refinement__hint">
        Keep this secondary: adjust only high-impact fields to refine the decision score.
      </p>
      <div className="readiness-refinement__fields">
        {REFINEMENT_FIELDS.map((field) => {
          const value = Number(profile?.[field.key] ?? 0);
          return (
            <label key={field.key} className="readiness-refinement__field">
              <span>{field.label}</span>
              <small>{field.helper}</small>
              <div className="readiness-refinement__inputs">
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="1"
                  value={value}
                  onChange={(event) => onChange(field.key, event.target.value)}
                />
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="1"
                  value={value}
                  onChange={(event) => onChange(field.key, event.target.value)}
                />
              </div>
            </label>
          );
        })}
      </div>
    </details>
  );
}
