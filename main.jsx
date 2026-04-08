import React from 'https://esm.sh/react@19.2.0';
import { createRoot } from 'https://esm.sh/react-dom@19.2.0/client';
import App from './App.jsx';

const rootElement = document.getElementById('react-ui');

if (rootElement) {
  rootElement.dataset.reactUiMount = 'starting';
  try {
    const root = createRoot(rootElement);
    root.render(<App />);
    rootElement.dataset.reactUiMount = 'mounted';
  } catch (error) {
    rootElement.dataset.reactUiMount = 'error';
    rootElement.innerHTML = `
      <div class="app-ui-debug">
        React UI failed to mount. Check console for details.
      </div>
    `;
    console.error('[React UI] mount failed', error);
  }
}
