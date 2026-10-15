import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Star,
  FileText,
  CheckCircle2,
  CreditCard,
  Layers,
  Mail,
  Gift,
  X,
  ShieldCheck,
  Globe,
  Share2,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { isSuperadmin } from '../../lib/admin';
import SidebarFooter from './SidebarFooter';

export type DashboardTab =
  | 'welcome'
  | 'forms'
  | 'import'
  | 'proof'
  | 'widgets'
  | 'social'
  | 'campaigns'
  | 'feedback'
  | 'tags'
  | 'rich-snippet'
  | 'analyze'
  | 'referral'
  | 'integrate'
  | 'settings';

interface DashboardSidebarProps {
  activeTab: DashboardTab;
  setActiveTab: (tab: DashboardTab) => void;
  proofCount?: number;
  /** Mobile drawer state — below lg the sidebar is an off-canvas slide-over. */
  mobileOpen?: boolean;
  onClose?: () => void;
}

export const DashboardSidebar: React.FC<DashboardSidebarProps> = ({
  activeTab,
  setActiveTab,
  proofCount = 0,
  mobileOpen = false,
  onClose,
}) => {
  const { user } = useAuth();
  const [postDropdownOpen, setPostDropdownOpen] = useState(true);

  // Close the mobile drawer on Escape
  useEffect(() => {
    if (!mobileOpen || !onClose) return;
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [mobileOpen, onClose]);

  return (
    <aside className={`w-64 min-w-[16rem] shrink-0 bg-[#f4f7fb]/95 backdrop-blur-2xl border-r border-slate-200/80 flex flex-col h-screen select-none font-sans text-sm fixed inset-y-0 left-0 z-40 transform transition-transform duration-300 ease-out lg:sticky lg:top-0 lg:z-30 lg:translate-x-0 ${mobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}`}>
      
      {/* Brand Header */}
      <div className="px-5 py-3.5 border-b border-slate-200/60 flex items-center justify-between">
        <Link to="/dashboard" className="flex items-center gap-2 group apple-touch">
          <span className="font-extrabold text-lg tracking-tight text-slate-900 font-display whitespace-nowrap flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-violet-600 shadow-xs shadow-violet-600/50" />
            PandaPraise
          </span>
        </Link>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close navigation"
          className="lg:hidden p-1.5 -mr-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
        >
          <X className="w-4.5 h-4.5" />
        </button>
      </div>


      {/* ── Navigation Items (Cleanly Spaced Apple HIG Simple Stack) ── */}
      <div className="flex-1 overflow-y-auto px-3.5 pt-3 pb-6 space-y-1 scrollbar-thin">
        
        {/* 1. Welcome Hub */}
        <button
          onClick={() => setActiveTab('welcome')}
          className={`apple-touch group w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            activeTab === 'welcome'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-200/60 hover:text-slate-900'
          }`}
        >
          <Star className={`w-4 h-4 transition-colors ${activeTab === 'welcome' ? 'text-amber-400 fill-amber-400' : 'text-slate-400 group-hover:text-slate-600'}`} />
          <span>Welcome Hub</span>
        </button>

        {/* 2. Collect or Import */}
        <button
          onClick={() => setActiveTab('forms')}
          className={`apple-touch group w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            activeTab === 'forms' || activeTab === 'import'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-200/60 hover:text-slate-900'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <FileText className={`w-4 h-4 transition-colors ${activeTab === 'forms' || activeTab === 'import' ? 'text-white' : 'text-slate-400 group-hover:text-slate-600'}`} />
            <span>Collect or Import</span>
          </div>
        </button>

        {/* 3. Evaluate (Moderation Queue) */}
        <button
          onClick={() => setActiveTab('proof')}
          className={`apple-touch group w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            activeTab === 'proof'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-200/60 hover:text-slate-900'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className={`w-4 h-4 transition-colors ${activeTab === 'proof' ? 'text-white' : 'text-slate-400 group-hover:text-slate-600'}`} />
            <span>Evaluate</span>
          </div>
          {proofCount > 0 ? (
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
              activeTab === 'proof' ? 'bg-white/20 text-white' : 'bg-violet-500/10 text-violet-700'
            }`}>
              {proofCount}
            </span>
          ) : null}
        </button>

        {/* 4. Post on Internet (Dropdown) */}
        <div className="space-y-0.5 pt-0.5">
          <button
            type="button"
            onClick={() => {
              setPostDropdownOpen(!postDropdownOpen);
              if (!postDropdownOpen && activeTab !== 'widgets' && activeTab !== 'social') {
                setActiveTab('widgets');
              }
            }}
            className={`apple-touch group w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'widgets' || activeTab === 'social'
                ? 'text-slate-900 font-bold bg-slate-200/60'
                : 'text-slate-600 hover:bg-slate-200/60 hover:text-slate-900'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Globe className={`w-4 h-4 transition-colors ${activeTab === 'widgets' || activeTab === 'social' ? 'text-violet-600' : 'text-slate-400 group-hover:text-slate-600'}`} />
              <span>Widgets & Embeds</span>
            </div>
            {postDropdownOpen ? (
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            )}
          </button>

          {postDropdownOpen && (
            <div className="pl-6 pr-1 py-0.5 space-y-1 animate-fade-in">
              {/* On Website */}
              <button
                onClick={() => setActiveTab('widgets')}
                className={`apple-touch group w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  activeTab === 'widgets'
                    ? 'bg-slate-900 text-white font-semibold shadow-2xs'
                    : 'text-slate-600 hover:bg-slate-200/50 hover:text-slate-900'
                }`}
              >
                <Layers className={`w-3.5 h-3.5 ${activeTab === 'widgets' ? 'text-white' : 'text-slate-400 group-hover:text-slate-600'}`} />
                <span>On Website</span>
              </button>

              {/* On Social Media */}
              <button
                onClick={() => setActiveTab('social')}
                className={`apple-touch group w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  activeTab === 'social'
                    ? 'bg-slate-900 text-white font-semibold shadow-2xs'
                    : 'text-slate-600 hover:bg-slate-200/50 hover:text-slate-900'
                }`}
              >
                <Share2 className={`w-3.5 h-3.5 ${activeTab === 'social' ? 'text-white' : 'text-slate-400 group-hover:text-slate-600'}`} />
                <span>On Social Media</span>
              </button>
            </div>
          )}
        </div>

        {/* 5. Automated Review Campaigns */}
        <button
          onClick={() => setActiveTab('campaigns')}
          className={`apple-touch group w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            activeTab === 'campaigns'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-200/60 hover:text-slate-900'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <Mail className={`w-4 h-4 transition-colors ${activeTab === 'campaigns' ? 'text-white' : 'text-slate-400 group-hover:text-slate-600'}`} />
            <span>Campaigns</span>
          </div>
          <span className={`px-1.5 py-0.2 rounded-md text-[9px] font-bold ${
            activeTab === 'campaigns' ? 'bg-white/20 text-white' : 'bg-emerald-50 text-emerald-700'
          }`}>
            Auto
          </span>
        </button>

        {/* Subtle Separator */}
        <div className="pt-2 pb-1">
          <div className="h-px bg-slate-200/70" />
        </div>

        {/* 6. Referral Program */}
        <button
          onClick={() => setActiveTab('referral')}
          className={`apple-touch group w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            activeTab === 'referral'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-200/60 hover:text-slate-900'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <Gift className={`w-4 h-4 transition-colors ${activeTab === 'referral' ? 'text-amber-300' : 'text-purple-600 group-hover:text-purple-700'}`} />
            <span>Referrals</span>
          </div>
          <span className={`px-1.5 py-0.5 rounded-md text-[9px] font-bold ${
            activeTab === 'referral' ? 'bg-white/20 text-white' : 'bg-amber-100 text-amber-800'
          }`}>
            Free Month
          </span>
        </button>

        {/* 7. Billing & Plans */}
        <button
          onClick={() => setActiveTab('settings')}
          className={`apple-touch group w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            activeTab === 'settings' || activeTab === 'integrate'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-200/60 hover:text-slate-900'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <CreditCard className={`w-4 h-4 transition-colors ${activeTab === 'settings' || activeTab === 'integrate' ? 'text-white' : 'text-slate-400 group-hover:text-slate-600'}`} />
            <span>Billing & Plans</span>
          </div>
        </button>

        {/* 8. Superadmin Platform Console (Visible only to authorized root admins) */}
        {isSuperadmin(user?.email) && (
          <div className="pt-2 mt-2 border-t border-slate-200/60">
            <Link
              to="/admin"
              className="apple-touch group w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer bg-red-500/10 text-red-700 hover:bg-red-500/15 border border-red-500/20"
            >
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-4 h-4 text-red-600" />
                <span>Superadmin</span>
              </div>
              <span className="px-1.5 py-0.2 rounded text-[9px] font-bold uppercase bg-red-600 text-white">
                Root
              </span>
            </Link>
          </div>
        )}
      </div>

      {/* ── Unified Bottom Profile Chip & Popover Dropdown ── */}
      <SidebarFooter />
    </aside>
  );
};

export default DashboardSidebar;
