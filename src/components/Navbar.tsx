import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Code2, 
  Database,
  ExternalLink,
  LogOut,
  Copy,
  Check,
  Building2,
  Crown,
  Download,
  Settings,
} from 'lucide-react';
import { getActiveBackendInfo } from '../lib/storage';
import { useAuth } from '../context/AuthContext';
import { ProjectSwitcher } from './dashboard/ProjectSwitcher';

export type DashboardView = 'dashboard' | 'widgets' | 'import' | 'settings';

interface NavbarProps {
  activeView: DashboardView;
  setActiveView: (view: DashboardView) => void;
  pendingCount: number;
  onOpenDatabaseConfig: () => void;
  onOpenWelcomeModal?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeView,
  setActiveView,
  pendingCount,
  onOpenDatabaseConfig,
  onOpenWelcomeModal: _onOpenWelcomeModal,
}) => {
  const backend = getActiveBackendInfo();
  const { user, workspace, collectionForm, signOut, isDemoMode } = useAuth();
  const [copiedLink, setCopiedLink] = useState(false);

  const plan = workspace?.plan || 'free';
  const planName = plan === 'free' ? 'Free' : 'Paid';

  const collectionUrl = collectionForm
    ? `${window.location.origin}/c/${collectionForm.publicSlug}`
    : `${window.location.origin}/c/feedback`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(collectionUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const navTabs: { id: DashboardView; label: string; icon: typeof LayoutDashboard; badge?: number }[] = [
    { id: 'dashboard', label: 'Proof', icon: LayoutDashboard, badge: pendingCount },
    { id: 'widgets', label: 'Widgets', icon: Code2 },
    { id: 'import', label: 'Import', icon: Download },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const userInitial = (user?.displayName || user?.email || 'U').charAt(0).toUpperCase();

  return (
    <header className="sticky top-0 z-40 w-full bg-[#0b101b] border-b border-[#1f293d] shadow-xs font-sans text-[#f8fafc]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand & Project Switcher */}
        <div className="flex items-center gap-3 shrink-0">
          <Link to="/dashboard" className="flex items-center gap-2 focus:outline-none whitespace-nowrap">
            <div className="w-7 h-7 rounded-md bg-white flex items-center justify-center text-[#030712] font-black text-xs shadow-xs">
              P
            </div>
            <span className="font-sans font-bold text-lg text-white tracking-tight hover:text-[#56c5d0] transition-colors whitespace-nowrap">
              Panda Praise
            </span>
          </Link>

          {isDemoMode && (
            <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-md bg-[#1f293d] text-[#56c5d0] border border-[#1f293d] shrink-0">
              Demo
            </span>
          )}

          <div className="hidden sm:flex items-center gap-1.5 text-xs text-[#94a3b8] pl-3 border-l border-[#1f293d]">
            <span className="flex items-center gap-1 text-[#cbd5e1] font-medium whitespace-nowrap">
              <Building2 className="w-3.5 h-3.5 text-[#56c5d0]" />
              {workspace?.name || 'Workspace'}
            </span>
            <span>/</span>
            <ProjectSwitcher />
          </div>
        </div>

        {/* View Switcher Tabs (Slate Minimal) */}
        <nav className="flex items-center gap-2">
          <div className="flex items-center p-1 bg-[#030712] rounded-md border border-[#1f293d]">
            {navTabs.map(tab => {
              const Icon = tab.icon;
              const isActive = activeView === tab.id;
              return (
                <button
                  key={tab.id}
                  id={`nav-${tab.id}-btn`}
                  onClick={() => setActiveView(tab.id)}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-all cursor-pointer whitespace-nowrap ${
                    isActive
                      ? 'bg-white text-[#030712] shadow-xs font-semibold'
                      : 'text-[#94a3b8] hover:text-white hover:bg-[#1f293d]/50'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{tab.label}</span>
                  {tab.badge && tab.badge > 0 && (
                    <span className="ml-1 px-1.5 py-0.2 rounded-md text-[10px] font-bold bg-[#56c5d0] text-[#030712]">
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Quick Share Collection Link Button */}
          <div className="hidden md:flex items-center gap-1 bg-[#0b101b] border border-[#1f293d] p-1 rounded-md shrink-0">
            <button
              onClick={handleCopyLink}
              className="flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium text-[#56c5d0] hover:bg-[#1f293d]/60 transition-colors cursor-pointer whitespace-nowrap"
              title="Copy public collection link to send to clients"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedLink ? 'Link Copied!' : 'Share Form'}</span>
            </button>
            <a
              href={collectionUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 rounded-md text-[#94a3b8] hover:text-[#56c5d0] hover:bg-[#1f293d]/60 transition-colors"
              title="Open public form in new tab"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </nav>

        {/* Right action controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Plan Badge */}
          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-[#1f293d] text-[#56c5d0] border border-[#1f293d]">
            {plan !== 'free' && <Crown className="w-3 h-3 text-[#56c5d0]" />}
            {planName}
          </div>

          {/* Upgrade Button (free users only) */}
          {plan === 'free' && (
            <Link
              to="/onboarding/upgrade"
              className="hidden md:flex items-center gap-1.5 px-3.5 py-1.5 rounded-md text-xs font-semibold bg-white hover:bg-slate-200 text-[#030712] transition-all shadow-xs cursor-pointer"
            >
              <Crown className="w-3 h-3 text-amber-500" />
              Upgrade
            </Link>
          )}

          {/* Database indicator button */}
          <button
            id="database-config-btn"
            onClick={onOpenDatabaseConfig}
            title="Database Connection Status"
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#030712] hover:bg-[#1f293d] border border-[#1f293d] text-xs font-medium text-[#cbd5e1] transition-colors cursor-pointer"
          >
            <span className="relative flex h-2 w-2">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                backend.type === 'firebase' ? 'bg-emerald-400' : 'bg-[#56c5d0]'
              }`}></span>
              <span className={`relative inline-flex rounded-full h-2 w-2 ${
                backend.type === 'firebase' ? 'bg-emerald-500' : 'bg-[#56c5d0]'
              }`}></span>
            </span>
            <Database className="w-3.5 h-3.5 text-[#94a3b8]" />
            <span className="hidden xl:inline text-xs">{backend.type === 'firebase' ? 'Firebase' : 'Demo DB'}</span>
          </button>

          {/* User profile & Sign out */}
          <div className="flex items-center gap-2 pl-2 border-l border-[#1f293d]">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-md bg-[#1f293d] text-[#56c5d0] font-bold text-xs flex items-center justify-center border border-[#1f293d]">
                {userInitial}
              </div>
              <div className="hidden xl:flex flex-col text-left">
                <span className="text-xs font-semibold text-white truncate max-w-[120px]">
                  {user?.displayName || (user?.email ? user.email.split('@')[0] : 'Admin')}
                </span>
                <span className="text-[10px] text-[#94a3b8] truncate max-w-[120px]">
                  {user?.email || 'Logged in'}
                </span>
              </div>
            </div>

            <button
              onClick={() => signOut()}
              title="Sign Out"
              className="p-2 rounded-md bg-[#030712] hover:bg-[#1f293d] border border-[#1f293d] text-[#94a3b8] hover:text-[#f35d5a] transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
export default Navbar;
