import { getMapboxToken } from '/config.js';

const params = new URLSearchParams(location.search);
const debugEnv = params.get('debug') === 'env';

function showBanner(msg){
  const banner = document.createElement('div');
  banner.id = 'env-banner';
  banner.textContent = msg;
  banner.style.cssText = 'position:fixed;top:0;left:0;right:0;padding:4px 8px;background:#b91c1c;color:#fff;font-size:12px;text-align:center;z-index:3000';
  document.body.appendChild(banner);
}

async function init(){
  const token = await getMapboxToken();
  if (token && !debugEnv) return;
  let data = {};
  if (debugEnv) {
    try {
      const res = await fetch('/api/env', { cache: 'no-store' });
      if (res.ok) data = await res.json();
    } catch {}
  }
  const msg = debugEnv ? `env: ${JSON.stringify(data)}` : 'MAPBOX_TOKEN missing';
  showBanner(msg);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
