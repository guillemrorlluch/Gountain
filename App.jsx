import { useEffect, useMemo, useState } from 'react';
import BottomNavigation from './components/BottomNavigation.jsx';
import SearchBar from './components/SearchBar.jsx';

const EVENT_NAME = 'gountain:destinations-updated';
const SELECT_EVENT = 'gountain:destination-selected';

const getWindowDestinations = () => {
  if (typeof window === 'undefined') return [];
  return Array.isArray(window.__AVAILABLE_DESTINATIONS__)
    ? window.__AVAILABLE_DESTINATIONS__
    : [];
};

export default function App({ destinations = [], onSelectDestination }) {
  const [availableDestinations, setAvailableDestinations] = useState(() => {
    const fromWindow = getWindowDestinations();
    return fromWindow.length ? fromWindow : destinations;
  });

  useEffect(() => {
    if (destinations.length) {
      setAvailableDestinations(destinations);
    }
  }, [destinations]);

  useEffect(() => {
    const handleUpdate = (event) => {
      const next = Array.isArray(event.detail) ? event.detail : [];
      setAvailableDestinations(next);
    };

    window.addEventListener(EVENT_NAME, handleUpdate);
    return () => window.removeEventListener(EVENT_NAME, handleUpdate);
  }, []);

  const sanitizedDestinations = useMemo(
    () =>
      availableDestinations.filter((destination) => destination && destination.name),
    [availableDestinations]
  );

  const handleSelect = (destination) => {
    onSelectDestination?.(destination);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent(SELECT_EVENT, { detail: destination })
      );
    }
  };

  return (
    <div className="app-ui">
      <div className="app-ui__search">
        <SearchBar
          destinations={sanitizedDestinations}
          onSelect={handleSelect}
          showActionIcon
        />
      </div>
      <BottomNavigation initialActiveId="search" />
    </div>
  );
}
