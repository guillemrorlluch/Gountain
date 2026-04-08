import React, { useEffect, useMemo, useRef, useState } from 'https://esm.sh/react@19.2.0';
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

const MOBILE_QUERY = '(max-width: 768px)';

export default function App({ destinations = [], onSelectDestination }) {
  const [availableDestinations, setAvailableDestinations] = useState(() => {
    const fromWindow = getWindowDestinations();
    return fromWindow.length ? fromWindow : destinations;
  });
  const [selectedDestination, setSelectedDestination] = useState(null);
  const [userProfile, setUserProfile] = useState(() => loadCurrentUserProfile());
  const [gpxError, setGpxError] = useState('');
  const [gpxStatus, setGpxStatus] = useState('');
  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' && window.matchMedia(MOBILE_QUERY).matches);
  const [mobileTab, setMobileTab] = useState('explore');
  const gpxInputRef = useRef(null);

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    const media = window.matchMedia(MOBILE_QUERY);
    const sync = () => setIsMobile(media.matches);
    sync();
    media.addEventListener('change', sync);
    return () => media.removeEventListener('change', sync);
  }, []);

  useEffect(() => {
    if (!isMobile) return;
    if (selectedDestination) {
      setMobileTab('explore');
    }
  }, [isMobile, selectedDestination]);

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
    const syncPanelState = () => {
      const menuExpanded = document.getElementById('btnMenu')?.getAttribute('aria-expanded') === 'true';
      const infoExpanded = document.getElementById('btnInfo')?.getAttribute('aria-expanded') === 'true';
      document.body.classList.toggle('app-major-panel-open', menuExpanded || infoExpanded);
    };

    window.addEventListener('click', syncPanelState);
    window.addEventListener('keydown', syncPanelState);
    syncPanelState();
    return () => {
      window.removeEventListener('click', syncPanelState);
      window.removeEventListener('keydown', syncPanelState);
      document.body.classList.remove('app-major-panel-open');
    };
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
      setGpxStatus(`Processing ${file.name}...`);
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
      setGpxStatus(`Loaded ${file.name}`);
    } catch (error) {
      console.error('[RouteReadiness] failed to parse GPX', error);
      setGpxError('Could not parse GPX file. Please upload a valid GPX track.');
      setGpxStatus('');
    } finally {
      event.target.value = '';
    }
  };

  const shouldShowRoutePanel = !isMobile || mobileTab === 'explore';

  return (
    <div className="app-ui">
      <div className="app-ui__search">
        <SearchBar
          destinations={sanitizedDestinations}
          onSelect={handleSelect}
          showActionIcon
        />
      </div>

      <div className={`app-ui__route-panel ${shouldShowRoutePanel ? '' : 'hidden'}`}>
        <RouteReadinessPanel
          destination={selectedDestination}
          userProfile={userProfile}
          onChangeUserProfile={handleProfileChange}
        />
      </div>

      <div className={`app-ui__gpx-upload ${isMobile && mobileTab !== 'saved' ? 'hidden' : ''}`} role="group" aria-label="Analyze GPX route">
        <input
          id="gpx-upload-input"
          className="app-ui__gpx-input"
          type="file"
          ref={gpxInputRef}
          accept=".gpx,application/gpx+xml,application/xml,text/xml"
          onChange={handleGPXUpload}
          aria-describedby="gpx-upload-help"
        />
        <button
          type="button"
          className="app-ui__gpx-trigger"
          onClick={() => gpxInputRef.current?.click()}
          aria-controls="gpx-upload-input"
        >
          Upload GPX
        </button>
        <span id="gpx-upload-help" className="app-ui__gpx-help">Upload or analyze a .gpx track file</span>
        {gpxStatus ? (
          <p className="app-ui__gpx-status" aria-live="polite">{gpxStatus}</p>
        ) : null}
        {gpxError ? <p className="app-ui__gpx-error">{gpxError}</p> : null}
      </div>

      <BottomNavigation
        initialActiveId={isMobile ? 'map' : 'explore'}
        onChange={(id) => setMobileTab(id)}
      />
    </div>
  );
}
