import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCw, Home, LifeBuoy } from 'lucide-react';
import { PandaPraiseIcon } from './PandaPraiseLogo';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  isChunkLoadError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    isChunkLoadError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    const errorMsg = error?.message || '';
    const isChunkLoadError =
      errorMsg.includes('Failed to fetch dynamically imported module') ||
      errorMsg.includes('Loading chunk') ||
      errorMsg.includes('Importing a module script failed');

    return {
      hasError: true,
      error,
      isChunkLoadError,
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[ErrorBoundary] Uncaught exception in React component tree:', error, errorInfo);

    // If dynamic chunk loading failed due to a new deployment, auto-reload once to fetch fresh chunks
    const isChunkLoadError =
      error?.message?.includes('Failed to fetch dynamically imported module') ||
      error?.message?.includes('Loading chunk');

    if (isChunkLoadError) {
      const reloadKey = 'pp_chunk_reload_timestamp';
      const lastReload = sessionStorage.getItem(reloadKey);
      const now = Date.now();
      if (!lastReload || now - parseInt(lastReload, 10) > 10000) {
        sessionStorage.setItem(reloadKey, now.toString());
        console.warn('[ErrorBoundary] Auto-reloading page to fetch latest deployed chunk assets...');
        window.location.reload();
      }
    }
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleGoHome = () => {
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans text-slate-800">
          <div className="max-w-md w-full bg-white rounded-3xl border border-gray-200/90 shadow-xl p-6 sm:p-8 text-center animate-fade-in">
            <div className="flex justify-center mb-4">
              <PandaPraiseIcon size={48} colorMode="gradient" />
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 text-rose-600 text-xs font-semibold mb-3">
              <AlertCircle size={14} />
              <span>Application Notice</span>
            </div>

            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight mb-2">
              {this.state.isChunkLoadError
                ? 'New Version Available'
                : 'Something went wrong'}
            </h1>

            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed mb-6">
              {this.state.isChunkLoadError
                ? 'A new deployment of Panda Praise is live. Please reload to load the latest application assets.'
                : 'An unexpected error occurred while displaying this page. You can reload the page or return to the homepage.'}
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-6">
              <button
                type="button"
                onClick={this.handleReload}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition shadow-sm flex items-center justify-center gap-2 cursor-pointer"
              >
                <RefreshCw size={14} />
                <span>Reload Page</span>
              </button>
              <button
                type="button"
                onClick={this.handleGoHome}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold text-xs transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <Home size={14} />
                <span>Return Home</span>
              </button>
            </div>

            {this.state.error && (
              <details className="text-left text-[11px] text-gray-500 bg-gray-50 rounded-xl p-3 border border-gray-200">
                <summary className="font-semibold cursor-pointer hover:text-gray-800">
                  Technical Details
                </summary>
                <pre className="mt-2 overflow-x-auto whitespace-pre-wrap font-mono text-[10px] text-rose-700">
                  {this.state.error.toString()}
                </pre>
              </details>
            )}

            <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-center gap-4 text-xs text-gray-500">
              <a href="/contact" className="hover:text-indigo-600 flex items-center gap-1 transition-colors">
                <LifeBuoy size={12} /> Contact Support
              </a>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
