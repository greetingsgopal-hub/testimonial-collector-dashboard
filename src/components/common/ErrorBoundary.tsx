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

    // If chunk failed to load (new deploy replaced chunk), automatically reload once
    const isChunkError =
      error.message?.includes('dynamically imported module') ||
      error.message?.includes('Loading chunk') ||
      error.name === 'ChunkLoadError';

    if (isChunkError) {
      const reloaded = sessionStorage.getItem('pp_chunk_reloaded');
      if (!reloaded) {
        sessionStorage.setItem('pp_chunk_reloaded', '1');
        window.location.reload();
      }
    }
  }

  private handleReload = () => {
    sessionStorage.removeItem('pp_chunk_reloaded');
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
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
                A fresh version was just deployed. Click below to continue with the latest updates.
              </p>
            </div>

            <button
              type="button"
              onClick={this.handleReload}
              className="apple-touch w-full py-2.5 px-4 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer shadow-sm transition-all active:scale-98"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reload Application</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
