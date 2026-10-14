import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import './index.css';

// Automatically recover when a new deployment invalidates cached chunk hashes
window.addEventListener('vite:preloadError', (event) => {
  console.warn('[PandaPraise] Chunk load failed after new deployment, refreshing...', event);
  const reloaded = sessionStorage.getItem('pp_preload_reloaded');
  if (!reloaded) {
    sessionStorage.setItem('pp_preload_reloaded', '1');
    window.location.reload();
  }
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>,
);

