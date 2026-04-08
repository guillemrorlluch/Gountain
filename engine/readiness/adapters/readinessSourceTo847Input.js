import { routeTo847Input } from './routeTo847Input.js';
import { routeDemandTo847Input } from './routeDemandTo847Input.js';

export function readinessSourceTo847Input(source) {
  if (!source || typeof source !== 'object') {
    return routeTo847Input({});
  }

  if (source.sourceType === 'gpx_track' && source.routeDemand) {
    return routeDemandTo847Input(source.routeDemand);
  }

  if (source.sourceType === 'gpx_track') {
    return routeTo847Input(source.routeLike || {});
  }

  return routeTo847Input(source);
}

export default readinessSourceTo847Input;
