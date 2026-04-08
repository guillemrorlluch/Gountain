// app.js — domain compatibility facade
import {
  BOOT_COLORS,
  normalizeDiff,
  markerColor,
  monthsToSeasons,
  withinFilters,
  computeBounds
} from './engine/domain/routeDomain.js';

function renderBootLegend() {
  const ul = document.getElementById('legend-botas');
  if (!ul) return;
  ul.innerHTML = '';
  Object.entries(BOOT_COLORS).forEach(([name, color]) => {
    const li = document.createElement('li');
    li.innerHTML = `<span class="pill" style="background:${color}33;border-color:${color};color:#fff">${name}</span>`;
    ul.appendChild(li);
  });
}

if (typeof window !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    renderBootLegend();
  });
}

export {
  normalizeDiff,
  markerColor,
  withinFilters,
  BOOT_COLORS,
  monthsToSeasons,
  computeBounds
};

export default {
  normalizeDiff,
  markerColor,
  withinFilters,
  BOOT_COLORS,
  monthsToSeasons,
  computeBounds
};
