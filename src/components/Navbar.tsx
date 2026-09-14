import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Code2, 
  Database,
  ExternalLink,
  LogOut,
  Copy,
  Check,
  Building2,
  FolderKanban
} from 'lucide-react';
import { getActiveBackendInfo } from '../lib/storage';
import { useAuth } from '../context/AuthContext';

import { PandaPraiseIcon } from './PandaPraiseLogo';

interface NavbarProps {
  activeView: 'dashboard' | 'widgets';
  setActiveView: (view: 'dashboard' | 'widgets') => void;
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
  const { user, workspace, project, collectionForm, signOut, isDemoMode } = useAuth();
  const [copiedLink, setCopiedLink] = useState(false);

  const collectionUrl = collectionForm
    ? `${window.location.origin}/c/${collectionForm.publicSlug}`
    : `${window.location.origin}/c/pulse-feedback`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(collectionUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-zinc-800/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand & Workspace Context */}
        <div className="flex items-center gap-3">
          <PandaPraiseIcon size={36} colorMode="gradient" className="shrink-0" />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-display font-extrabold text-base sm:text-lg text-white tracking-tight">
                Panda <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Praise</span>
              </span>
              {isDemoMode && (
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse">
                  Demo Mode
                </span>
              )}
            </div>
            {/* Workspace & Project Pills */}
            <div className="flex items-center gap-1.5 text-[11px] text-zinc-400 mt-0.5">
              <span className="flex items-center gap-1 text-zinc-300 font-medium">
                <Building2 className="w-3 h-3 text-brand-400" />
                {workspace?.name || 'My Workspace'}
              </span>
              <span>/</span>
              <span className="flex items-center gap-1 text-zinc-400">
                <FolderKanban className="w-3 h-3 text-zinc-500" />
                {project?.name || 'Primary Project'}
              </span>
            </div>
          </div>
        </div>

        {/* View Switcher Tabs & Public Link Button */}
        <nav className="flex items-center gap-2">
          <div className="flex items-center p-1 bg-zinc-900/90 rounded-xl border border-zinc-800/80 shadow-inner">
            <button
              id="nav-dashboard-btn"
              onClick={() => setActiveView('dashboard')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                activeView === 'dashboard'
                  ? 'bg-gradient-to-r from-brand-600 to-brand-500 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Reviews</span>
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
              <span>Widgets</span>
            </button>
          </div>

          {/* Quick Share Collection Link Button */}
          <div className="hidden md:flex items-center gap-1 bg-zinc-900/80 border border-zinc-800 p-1 rounded-xl">
            <button
              onClick={handleCopyLink}
              className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold text-brand-300 hover:text-brand-200 hover:bg-brand-500/10 transition-colors"
              title="Copy public collection link to send to clients"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedLink ? 'Link Copied!' : 'Share Form Link'}</span>
            </button>
            <a
              href={collectionUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
              title="Open public form in new tab"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </nav>

        {/* Right action controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Database indicator button */}
          <button
            id="database-config-btn"
            onClick={onOpenDatabaseConfig}
            title="Database Connection Status"
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800 text-xs font-medium text-zinc-300 transition-colors"
          >
            <span className="relative flex h-2 w-2">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                backend.type === 'firebase' ? 'bg-emerald-400' : 'bg-amber-400'
              }`}></span>
              <span className={`relative inline-flex rounded-full h-2 w-2 ${
                backend.type === 'firebase' ? 'bg-emerald-500' : 'bg-amber-500'
              }`}></span>
            </span>
            <Database className="w-3.5 h-3.5 text-zinc-400" />
            <span className="hidden lg:inline">{backend.type === 'firebase' ? 'Firebase' : 'Demo DB'}</span>
          </button>

          {/* User profile & Sign out */}
          <div className="flex items-center gap-2 pl-2 border-l border-zinc-800">
            <div className="hidden xl:flex flex-col text-right">
              <span className="text-xs font-semibold text-zinc-200 truncate max-w-[140px]">
                {user?.email ? user.email.split('@')[0] : 'Demo User'}
              </span>
              <span className="text-[10px] text-zinc-500 truncate max-w-[140px]">
                {user?.email || 'Offline'}
              </span>
            </div>

            <button
              onClick={() => signOut()}
              title="Sign Out"
              className="p-2 rounded-lg bg-zinc-900/80 hover:bg-red-500/15 border border-zinc-800 text-zinc-400 hover:text-red-400 transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
