import { useEffect, useMemo, useState } from 'react';
import BottomNavigation from './components/BottomNavigation.jsx';
import SearchBar from './components/SearchBar.jsx';
import RouteReadinessPanel from './components/RouteReadinessPanel.jsx';
import {
  createUpdatedCurrentUserProfile,
  loadCurrentUserProfile,
  saveCurrentUserProfile
} from './engine/readiness/currentUserProfile.js';

const EVENT_NAME = 'gountain:destinations-updated';
const SELECT_EVENT = 'gountain:destination-selected';

const getWindowDestinations = () => {
  if (typeof window === 'undefined') return [];
  return Array.isArray(window.__AVAILABLE_DESTINATIONS__)
    ? window.__AVAILABLE_DESTINATIONS__
    : [];
};

const normalizeDestinationName = (destination) => {
  if (!destination) return destination;
  return {
    ...destination,
    name: destination.name || destination.nombre || ''
  };
};

export default function App({ destinations = [], onSelectDestination }) {
  const [availableDestinations, setAvailableDestinations] = useState(() => {
    const fromWindow = getWindowDestinations();
    return fromWindow.length ? fromWindow : destinations;
  });
  const [selectedDestination, setSelectedDestination] = useState(null);
  const [userProfile, setUserProfile] = useState(() => loadCurrentUserProfile());

  useEffect(() => {
    if (destinations.length) {
      setAvailableDestinations(destinations);
    }
  }, [destinations]);

  useEffect(() => {
    const handleUpdate = (event) => {
      const next = Array.isArray(event.detail) ? event.detail : [];
      setAvailableDestinations(next.map(normalizeDestinationName));
    };

    window.addEventListener(EVENT_NAME, handleUpdate);
    return () => window.removeEventListener(EVENT_NAME, handleUpdate);
  }, []);

  useEffect(() => {
    const onDestinationSelected = (event) => {
      setSelectedDestination(normalizeDestinationName(event.detail));
    };
    window.addEventListener(SELECT_EVENT, onDestinationSelected);
    return () => window.removeEventListener(SELECT_EVENT, onDestinationSelected);
  }, []);

  useEffect(() => {
    saveCurrentUserProfile(userProfile);
  }, [userProfile]);

  const sanitizedDestinations = useMemo(
    () =>
      availableDestinations
        .map(normalizeDestinationName)
        .filter((destination) => destination && destination.name),
    [availableDestinations]
  );

  const handleSelect = (destination) => {
    const normalized = normalizeDestinationName(destination);
    setSelectedDestination(normalized);
    onSelectDestination?.(normalized);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent(SELECT_EVENT, { detail: normalized })
      );
    }
  };

  const handleProfileChange = (key, value) => {
    setUserProfile((current) => createUpdatedCurrentUserProfile(current, key, value));
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
      <div className="app-ui__route-panel">
        <RouteReadinessPanel
          destination={selectedDestination}
          userProfile={userProfile}
          onChangeUserProfile={handleProfileChange}
        />
      </div>
      <BottomNavigation initialActiveId="search" />
    </div>
  );
}
