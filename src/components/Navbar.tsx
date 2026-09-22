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
import { PLAN_PRICING } from '../lib/planLimits';

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
  const planName = PLAN_PRICING[plan].name;

  const collectionUrl = collectionForm
    ? `${window.location.origin}/c/${collectionForm.publicSlug}`
    : `${window.location.origin}/c/pulse-feedback`;

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
    <header className="sticky top-0 z-40 w-full bg-white border-b border-gray-200 shadow-xs font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand & Project Switcher */}
        <div className="flex items-center gap-3 shrink-0">
          <Link to="/dashboard" className="flex items-center gap-1.5 focus:outline-none whitespace-nowrap">
            <span className="font-display font-black text-xl text-[#6701e6] tracking-tight hover:opacity-95 transition-opacity whitespace-nowrap">
              Panda Praise
            </span>
          </Link>

          {isDemoMode && (
            <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 shrink-0">
              Demo
            </span>
          )}

          <div className="hidden sm:flex items-center gap-1.5 text-xs text-gray-400 pl-3 border-l border-gray-200">
            <span className="flex items-center gap-1 text-gray-600 font-medium whitespace-nowrap">
              <Building2 className="w-3.5 h-3.5 text-[#6701e6]" />
              {workspace?.name || 'Workspace'}
            </span>
            <span>/</span>
            <ProjectSwitcher />
          </div>
        </div>

        {/* View Switcher Tabs (Senja Exact) */}
        <nav className="flex items-center gap-2">
          <div className="flex items-center p-1 bg-gray-100 rounded-xl border border-gray-200">
            {navTabs.map(tab => {
              const Icon = tab.icon;
              const isActive = activeView === tab.id;
              return (
                <button
                  key={tab.id}
                  id={`nav-${tab.id}-btn`}
                  onClick={() => setActiveView(tab.id)}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap ${
                    isActive
                      ? 'bg-[#6701e6] text-white shadow-xs'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200/60'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{tab.label}</span>
                  {tab.badge && tab.badge > 0 && (
                    <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber-400 text-gray-950">
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Quick Share Collection Link Button */}
          <div className="hidden md:flex items-center gap-1 bg-purple-50/70 border border-purple-200 p-1 rounded-xl shrink-0">
            <button
              onClick={handleCopyLink}
              className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold text-[#6701e6] hover:bg-purple-100/80 transition-colors cursor-pointer whitespace-nowrap"
              title="Copy public collection link to send to clients"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedLink ? 'Link Copied!' : 'Share Form'}</span>
            </button>
            <a
              href={collectionUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 rounded-lg text-[#6701e6] hover:bg-purple-100/80 transition-colors"
              title="Open public form in new tab"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </nav>

        {/* Right action controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Plan Badge */}
          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200">
            {plan !== 'free' && <Crown className="w-3 h-3 text-amber-500" />}
            {planName}
          </div>

          {/* Upgrade Button (free users only) */}
          {plan === 'free' && (
            <Link
              to="/onboarding/upgrade"
              className="hidden md:flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-black hover:bg-gray-800 text-white transition-all shadow-xs cursor-pointer"
            >
              <Crown className="w-3 h-3 text-amber-400" />
              Upgrade
            </Link>
          )}

          {/* Database indicator button */}
          <button
            id="database-config-btn"
            onClick={onOpenDatabaseConfig}
            title="Database Connection Status"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-gray-50 hover:bg-gray-100 border border-gray-200 text-xs font-medium text-gray-700 transition-colors cursor-pointer"
          >
            <span className="relative flex h-2 w-2">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                backend.type === 'firebase' ? 'bg-emerald-400' : 'bg-amber-400'
              }`}></span>
              <span className={`relative inline-flex rounded-full h-2 w-2 ${
                backend.type === 'firebase' ? 'bg-emerald-500' : 'bg-amber-500'
              }`}></span>
            </span>
            <Database className="w-3.5 h-3.5 text-gray-500" />
            <span className="hidden xl:inline text-xs">{backend.type === 'firebase' ? 'Firebase' : 'Demo DB'}</span>
          </button>

          {/* User profile & Sign out */}
          <div className="flex items-center gap-2 pl-2 border-l border-gray-200">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-purple-100 text-[#6701e6] font-bold text-xs flex items-center justify-center border border-purple-200">
                {userInitial}
              </div>
              <div className="hidden xl:flex flex-col text-left">
                <span className="text-xs font-bold text-gray-900 truncate max-w-[120px]">
                  {user?.displayName || (user?.email ? user.email.split('@')[0] : 'Admin')}
                </span>
                <span className="text-[10px] text-gray-400 truncate max-w-[120px]">
                  {user?.email || 'Logged in'}
                </span>
              </div>
            </div>

            <button
              onClick={() => signOut()}
              title="Sign Out"
              className="p-2 rounded-xl bg-gray-50 hover:bg-red-50 border border-gray-200 text-gray-500 hover:text-red-600 transition-colors cursor-pointer"
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
