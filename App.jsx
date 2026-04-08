import { useEffect, useMemo, useState } from 'react';
import BottomNavigation from './components/BottomNavigation.jsx';
import SearchBar from './components/SearchBar.jsx';
import RouteReadinessPanel from './components/RouteReadinessPanel.jsx';
import { parseGPX } from './engine/gpx/parseGPX.js';
import { gpxToRouteDemand } from './engine/gpx/gpxToRouteDemand.js';
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
  const [gpxError, setGpxError] = useState('');

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
    if (typeof window === 'undefined') return;
    if (!selectedDestination) {
      console.debug('[RouteReadiness] selectedDestination cleared');
      return;
    }
    console.debug('[RouteReadiness] selectedDestination updated', selectedDestination);
  }, [selectedDestination]);

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

  const handleGPXUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setGpxError('');
      const parsed = await parseGPX(file);
      const routeDemand = gpxToRouteDemand(parsed);
      const gpxDestination = {
        id: `gpx-${Date.now()}`,
        sourceType: 'gpx_track',
        name: `GPX: ${file.name}`,
        nombre: `GPX: ${file.name}`,
        routeDemand,
        gpxMetrics: parsed,
        altitud_m: parsed.altitudeProfile?.max || null,
        distancia_km: parsed.totalDistanceKm,
        desnivel_m: parsed.elevationGainM,
        tipo: 'GPX import',
        dificultad: 'Auto-estimated',
        meses: 'Unknown',
        botas: [],
        equipo: []
      };

      setSelectedDestination(gpxDestination);
      onSelectDestination?.(gpxDestination);
    } catch (error) {
      console.error('[RouteReadiness] failed to parse GPX', error);
      setGpxError('Could not parse GPX file. Please upload a valid GPX track.');
    } finally {
      event.target.value = '';
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
        <div className="app-ui__gpx-upload" role="group" aria-label="Analyze GPX route">
          <input
            id="gpx-upload-input"
            className="app-ui__gpx-input"
            type="file"
            accept=".gpx,application/gpx+xml,application/xml,text/xml"
            onChange={handleGPXUpload}
            aria-describedby="gpx-upload-help"
          />
          <label className="app-ui__gpx-trigger" htmlFor="gpx-upload-input">Analyze GPX</label>
          <span id="gpx-upload-help" className="app-ui__gpx-help">Upload a .gpx track file</span>
          {gpxError ? <p className="app-ui__gpx-error">{gpxError}</p> : null}
        </div>
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
