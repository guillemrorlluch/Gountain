# Gountain UI Layout & Overlay Architecture

This document is the developer-facing map of how Gountain's UI is composed and where to edit each area safely.

## 1) High-level app structure

### Entry points
- `index.html`: static shell, topbar, filter/glossary panels, map container, and script/style loading order.
- `map.js`: Mapbox initialization, basemap switching, data loading (`data/destinos.json`), marker/popup behavior, and map-safe-area calculations.
- `main.jsx` + `App.jsx`: React overlay UI mounted into `#react-ui` (search bar, GPX upload card, readiness panel, mobile bottom nav).
- `styles.css`: legacy + core visual styling.
- `styles/overlay-system.css`: canonical overlay layer system and collision fixes loaded after `styles.css`.

## 2) Runtime flow (what runs first)

1. `index.html` loads base shell and map container.
2. Browser loads `dist/app.bundle.js` (domain facade utilities) and `map.js`.
3. `map.js` runs `initMapOnce()` on `DOMContentLoaded`.
4. Map `load` event triggers:
   - terrain/sky setup,
   - basemap switcher wiring,
   - destination data loading,
   - panel toggles.
5. React mounts from `main.jsx` into `#react-ui` and renders `App.jsx`.
6. `App.jsx` listens for destination events and syncs search/GPX/readiness overlays.

## 3) Overlay regions (current canonical model)

Use these regions when placing UI elements:

- **Map base layer** (`z: 0`): `#map-container`, `#map`.
- **Marker/cluster layer** (`z: 10`): destination chips and map symbols.
- **Map controls layer** (`z: 20`): Mapbox controls, Layers button, basemap switcher.
- **Floating cards layer** (`z: 30`): search field shell, GPX card, readiness card, bottom nav.
- **Dropdown/expanded layer** (`z: 40`): search results dropdown and expanded card menus.
- **Modal layer** (`z: 50`): reserved for modal-level UI.

Tokens are centralized in `styles/overlay-system.css` (`--z-map-base`, `--z-map-markers`, `--z-map-controls`, `--z-floating-card`, `--z-floating-dropdown`, `--z-modal`).

## 4) Where each key UI element lives

### Top search/results panel
- Created: `App.jsx` (`<SearchBar />` inside `.app-ui__search-region`).
- Styled: `styles.css` (search visuals) + `styles/overlay-system.css` (positioning/layout region).
- Positioning: overlay shell grid, centered top region.

### GPX upload CTA/card
- Created: `App.jsx` (`.app-ui__gpx-upload`).
- Styled: `styles.css` (component visuals) + `styles/overlay-system.css` (region placement + collision rules).
- Positioning: first item in overlay row (desktop), first stacked card (mobile).

### Readiness/decision panel
- Created: `App.jsx` with `<RouteReadinessPanel />` in `.app-ui__route-panel`.
- Styled: `styles.css` (readiness card internals) + `styles/overlay-system.css` (region and sizing behavior).
- Positioning: right side card on desktop, stacked below GPX on mobile.

### Map controls / side buttons
- Created: Mapbox controls in `map.js`, `#layers-toggle` from `index.html`.
- Styled: `styles.css` + control top offsets overridden in `styles/overlay-system.css`.
- Positioning: tied to `--map-controls-top` token to avoid overlapping top overlay shell.

### Popups / dropdowns
- Popups: created in `map.js`, styled in `styles.css` (`.mapboxgl-popup*`).
- Search dropdown: `SearchBar.jsx`, layered via `--z-floating-dropdown`.

## 5) Manual editing guide (safe edits)

### Adjust spacing between overlay cards
- Edit `--overlay-shell-gap` in `styles/overlay-system.css`.

### Move all map controls up/down together
- Edit `--map-controls-top` in `styles/overlay-system.css`.

### Change top shell horizontal breathing room
- Edit `--overlay-shell-padding-x`.

### Change desktop panel widths
- `.app-ui__overlay-row` grid columns and `.app-ui__route-panel` width.

### Change mobile stacking behavior
- `@media (max-width: 768px)` section in `styles/overlay-system.css`.

## 6) Known limitations and follow-up work

1. `styles.css` still contains legacy duplicate sections and historic overrides; it should be progressively split into domain files (`base.css`, `map.css`, `overlays.css`, `readiness.css`) in a future low-risk pass.
2. `index.html` includes a large inline script for filters/panel toggles; moving this to a dedicated module would improve traceability and testing.
3. Some UI labels/microcopy are mixed English/Spanish and can be normalized later.
4. Map safe-area logic in `map.js` is now overlay-aware, but a future step can expose token values directly from CSS for tighter sync.
