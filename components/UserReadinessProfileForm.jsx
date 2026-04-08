const PROFILE_CONTROLS = [
  { key: 'general_resilience_score', label: 'Resilience' },
  { key: 'decision_discipline_score', label: 'Decision discipline' },
  { key: 'altitude_tolerance_score', label: 'Altitude tolerance' },
  { key: 'aerobic_capacity_status', label: 'Aerobic fitness' },
  { key: 'route_planning_skill', label: 'Route planning' },
  { key: 'self_rescue_skill', label: 'Self rescue' },
  { key: 'footwear_readiness', label: 'Footwear readiness' },
  { key: 'navigation_tools_readiness', label: 'Navigation tools' }
];

export default function UserReadinessProfileForm({ profile, onChange }) {
  return (
    <section className="user-profile" aria-live="polite">
      <h3>Your readiness profile</h3>
      <p className="user-profile__hint">Edit core assumptions used by route readiness.</p>
      <div className="user-profile__grid">
        {PROFILE_CONTROLS.map((control) => {
          const value = Number(profile?.[control.key] ?? 0);
          return (
            <label key={control.key} className="user-profile__field">
              <span>{control.label}</span>
              <div className="user-profile__input-row">
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="1"
                  value={value}
                  onChange={(event) => onChange(control.key, event.target.value)}
                />
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="1"
                  value={value}
                  onChange={(event) => onChange(control.key, event.target.value)}
                />
              </div>
            </label>
          );
        })}
      </div>
    </section>
  );
}
