import { routeTo847Input } from './routeTo847Input.js';

export function readinessSourceTo847Input(source) {
  if (!source || typeof source !== 'object') {
    return routeTo847Input({});
  }

  // Route-first entry point. Supports future source types (e.g. GPX) without
  // changing panel integration.
  if (source.sourceType === 'gpx_track') {
    return routeTo847Input(source.routeLike || {});
  }

  return routeTo847Input(source);
}

export default readinessSourceTo847Input;
