import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import './index.css';

// Automatically recover when a new deployment invalidates cached chunk hashes
window.addEventListener('vite:preloadError', (event) => {
  console.warn('[PandaPraise] Chunk load failed after new deployment, refreshing with cache-bust...', event);
  const lastReload = parseInt(sessionStorage.getItem('pp_preload_time') || '0', 10);
  const now = Date.now();
  if (now - lastReload > 12000) {
    sessionStorage.setItem('pp_preload_time', now.toString());
    try {
      if ('caches' in window) {
        caches.keys().then((keys) => Promise.all(keys.map((k) => caches.delete(k)))).catch(() => {});
      }
    } catch {
      // ignore
    }
    const bustUrl = new URL(window.location.href);
    bustUrl.searchParams.set('_v', now.toString());
    window.location.replace(bustUrl.toString());
  }
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>,
);

