import React from 'react';
import { 
  Sparkles, 
  LayoutDashboard, 
  Send, 
  Code2, 
  Database
} from 'lucide-react';
import { getActiveBackendInfo } from '../lib/storage';

interface NavbarProps {
  activeView: 'collector' | 'dashboard' | 'widgets';
  setActiveView: (view: 'collector' | 'dashboard' | 'widgets') => void;
  pendingCount: number;
  onOpenDatabaseConfig: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeView,
  setActiveView,
  pendingCount,
  onOpenDatabaseConfig,
}) => {
  const backend = getActiveBackendInfo();

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-zinc-800/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveView('dashboard')}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-pink-500 p-[1px] shadow-glow-sm">
            <div className="w-full h-full bg-zinc-950 rounded-[11px] flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-brand-400 animate-pulse-subtle" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-display font-bold text-lg text-white tracking-tight">ReviewVault</span>
              <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-brand-500/15 text-brand-300 border border-brand-500/30">
                v1.0
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 hidden sm:block">Open Testimonial Architecture</p>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <nav className="flex items-center p-1 bg-zinc-900/90 rounded-xl border border-zinc-800/80 shadow-inner">
          <button
            id="nav-collector-btn"
            onClick={() => setActiveView('collector')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
              activeView === 'collector'
                ? 'bg-gradient-to-r from-brand-600 to-brand-500 text-white shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
            }`}
          >
            <Send className="w-4 h-4" />
            <span>Collector Form</span>
          </button>

          <button
            id="nav-dashboard-btn"
            onClick={() => setActiveView('dashboard')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all relative ${
              activeView === 'dashboard'
                ? 'bg-gradient-to-r from-brand-600 to-brand-500 text-white shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Dashboard</span>
            {pendingCount > 0 && (
              <span className="ml-1 px-1.5 py-0.2 rounded-full text-[11px] font-bold bg-amber-500 text-zinc-950 animate-pulse">
                {pendingCount}
              </span>
            )}
          </button>

          <button
            id="nav-widgets-btn"
            onClick={() => setActiveView('widgets')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
              activeView === 'widgets'
                ? 'bg-gradient-to-r from-brand-600 to-brand-500 text-white shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
            }`}
          >
            <Code2 className="w-4 h-4" />
            <span className="hidden md:inline">Embed Widgets</span>
            <span className="md:hidden">Widgets</span>
          </button>
        </nav>

        {/* Right action controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Database indicator button */}
          <button
            id="database-config-btn"
            onClick={onOpenDatabaseConfig}
            title="Configure Database (Supabase / Postgres / REST)"
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800 text-xs font-medium text-zinc-300 transition-colors"
          >
            <span className="relative flex h-2 w-2">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                backend.type === 'supabase' ? 'bg-emerald-400' : 'bg-brand-400'
              }`}></span>
              <span className={`relative inline-flex rounded-full h-2 w-2 ${
                backend.type === 'supabase' ? 'bg-emerald-500' : 'bg-brand-500'
              }`}></span>
            </span>
            <Database className="w-3.5 h-3.5 text-zinc-400" />
            <span className="hidden lg:inline">{backend.type === 'supabase' ? 'Supabase' : 'Database'}</span>
          </button>

          {/* GitHub Reference Link */}
          <a
            href="https://github.com/reviews-kits-team/reviews-kits"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-lg bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors"
            title="Reference Architecture (reviews-kits)"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
            </svg>
          </a>
        </div>
      </div>
    </header>
  );
};
