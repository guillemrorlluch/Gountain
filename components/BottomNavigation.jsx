import { useMemo, useState } from 'react';

const HomeIcon = ({ filled }) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
    <path
      d="M4 10.5L12 4l8 6.5v8a1 1 0 0 1-1 1h-4.5a1 1 0 0 1-1-1v-4.5h-3V19a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-8Z"
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinejoin="round"
    />
  </svg>
);

const SearchIcon = ({ filled }) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
    <circle
      cx="11"
      cy="11"
      r="6"
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth="1.6"
    />
    <path
      d="M16.5 16.5 20 20"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
    />
  </svg>
);

const BellIcon = ({ filled }) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
    <path
      d="M6.5 9.5a5.5 5.5 0 1 1 11 0v4.2c0 .6.24 1.18.66 1.6l1.34 1.35H4.5l1.34-1.35c.42-.42.66-1 .66-1.6V9.5Z"
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinejoin="round"
    />
    <path
      d="M9.5 19a2.5 2.5 0 0 0 5 0"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
    />
  </svg>
);

const UserIcon = ({ filled }) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
    <circle
      cx="12"
      cy="8"
      r="3.5"
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth="1.6"
    />
    <path
      d="M4.5 19.5c1.9-3.2 4.6-4.8 7.5-4.8s5.6 1.6 7.5 4.8"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
    />
  </svg>
);

const DEFAULT_ITEMS = [
  { id: 'home', label: 'Inicio', Icon: HomeIcon },
  { id: 'search', label: 'Explorar', Icon: SearchIcon },
  { id: 'alerts', label: 'Alertas', Icon: BellIcon },
  { id: 'profile', label: 'Perfil', Icon: UserIcon }
];

export default function BottomNavigation({ items = DEFAULT_ITEMS, initialActiveId, onChange }) {
  const initialId = useMemo(
    () => initialActiveId ?? items[0]?.id,
    [initialActiveId, items]
  );
  const [activeId, setActiveId] = useState(initialId);

  return (
    <nav className="bottom-nav" aria-label="Bottom navigation">
      <div className="bottom-nav__list" role="tablist">
        {items.map(({ id, label, Icon }) => {
          const isActive = id === activeId;
          return (
            <button
              key={id}
              type="button"
              className={`bottom-nav__item${isActive ? ' is-active' : ''}`}
              aria-pressed={isActive}
              onClick={() => {
                setActiveId(id);
                onChange?.(id);
              }}
            >
              <span className="bottom-nav__icon" aria-hidden="true">
                <Icon filled={isActive} />
              </span>
              <span className="bottom-nav__label">{label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
