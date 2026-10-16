import { Component, ErrorInfo, ReactNode } from 'react';
import { RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[PandaPraise ErrorBoundary] Uncaught exception:', error, errorInfo);

    // If chunk failed to load (new deploy replaced chunk), automatically reload with cache-bust once
    const isChunkError =
      error.message?.includes('dynamically imported module') ||
      error.message?.includes('Loading chunk') ||
      error.message?.includes('Failed to fetch') ||
      error.name === 'ChunkLoadError';

    if (isChunkError) {
      const lastReload = parseInt(sessionStorage.getItem('pp_chunk_reload_ts') || '0', 10);
      const now = Date.now();
      // Allow automatic reload once every 15 seconds to avoid fast infinite loops
      if (now - lastReload > 15000) {
        sessionStorage.setItem('pp_chunk_reload_ts', now.toString());
        this.handleReload();
      }
    }
  }

  private handleReload = () => {
    try {
      sessionStorage.removeItem('pp_chunk_reloaded');
      sessionStorage.removeItem('pp_preload_reloaded');
      sessionStorage.removeItem('pp_chunk_reload_ts');
      if ('caches' in window) {
        caches.keys().then((keys) => Promise.all(keys.map((k) => caches.delete(k)))).catch(() => {});
      }
    } catch {
      // ignore storage access restrictions
    }

    const bustUrl = new URL(window.location.href);
    bustUrl.searchParams.set('_v', Date.now().toString());
    window.location.replace(bustUrl.toString());
  };

  private handleHardReset = () => {
    try {
      sessionStorage.clear();
      if ('caches' in window) {
        caches.keys().then((keys) => Promise.all(keys.map((k) => caches.delete(k)))).catch(() => {});
      }
    } catch {
      // ignore
    }
    window.location.replace(`/dashboard?_v=${Date.now()}`);
  };

  public render() {
    if (this.state.hasError) {
      const errorMsg = this.state.error?.message || '';
      const isChunkError =
        errorMsg.includes('dynamically imported module') ||
        errorMsg.includes('Loading chunk') ||
        errorMsg.includes('Failed to fetch') ||
        this.state.error?.name === 'ChunkLoadError';

      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-6 font-sans">
          <div className="max-w-md w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-violet-50 dark:bg-violet-950/60 text-violet-600 flex items-center justify-center mx-auto border border-violet-200/60 dark:border-violet-800/60 shadow-2xs">
              <span className="text-2xl">🐼</span>
            </div>

            <div className="space-y-1">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                Panda Praise is updating
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                {isChunkError
                  ? 'A fresh version was just deployed. Click below to continue with the latest updates.'
                  : 'An unexpected application state occurred. Click below to refresh or return to your dashboard.'}
              </p>
            </div>

            <div className="space-y-2 pt-1">
              <button
                type="button"
                onClick={this.handleReload}
                className="apple-touch w-full py-2.5 px-4 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer shadow-sm transition-all active:scale-98"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reload Application</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={this.handleHardReset}
                  className="apple-touch flex-1 py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-medium transition-colors cursor-pointer"
                >
                  Clear Cache & Reset
                </button>

                <a
                  href={`/dashboard?_v=${Date.now()}`}
                  className="apple-touch flex-1 py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-medium transition-colors text-center inline-block"
                >
                  Dashboard
                </a>
              </div>
            </div>

            {this.state.error && (
              <details className="text-left mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <summary className="text-[11px] font-medium text-slate-400 hover:text-slate-600 dark:text-slate-500 cursor-pointer select-none">
                  Technical Details
                </summary>
                <div className="mt-2 p-2.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800 text-[10px] font-mono text-slate-600 dark:text-slate-400 overflow-x-auto max-h-36">
                  <p className="font-bold text-red-600 dark:text-red-400 break-words">{this.state.error.message}</p>
                  {this.state.error.stack && (
                    <pre className="mt-1 whitespace-pre-wrap opacity-75">{this.state.error.stack}</pre>
                  )}
                </div>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
