import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Star,
  FileText,
  CheckCircle2,
  CreditCard,
  Mail,
  Gift,
  X,
  Share2,
  ArrowDownToLine,
  BarChart2,
} from 'lucide-react';
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
  // Close the mobile drawer on Escape
  useEffect(() => {
    if (!mobileOpen || !onClose) return;
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [mobileOpen, onClose]);

  const navItemClass = (isActive: boolean) =>
    `w-full text-left flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-colors cursor-pointer ${
      isActive
        ? 'bg-[#f4effe] text-purple-700 font-semibold shadow-2xs'
        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 font-medium'
    }`;

  return (
    <aside
      className={`w-64 min-w-[16rem] shrink-0 bg-white/95 backdrop-blur-2xl border-r border-slate-200/80 flex flex-col h-screen select-none font-sans text-sm fixed inset-y-0 left-0 z-40 transform transition-transform duration-300 ease-out lg:sticky lg:top-0 lg:z-30 lg:translate-x-0 ${
        mobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
      }`}
    >
      {/* Brand Header */}
      <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between">
        <Link to="/dashboard" className="flex items-center gap-2 group apple-touch">
          <span className="font-extrabold text-base tracking-tight text-slate-900 font-display whitespace-nowrap flex items-center gap-2">
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

      {/* ── Navigation Items (Divided into Stitch Architecture) ── */}
      <div className="flex-1 overflow-y-auto px-3.5 py-3 space-y-4 scrollbar-thin">
        {/* GROUP 1: COLLECT */}
        <div>
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 px-3">
            COLLECT
          </p>
          <ul className="space-y-0.5">
            <li>
              <button
                type="button"
                onClick={() => setActiveTab('forms')}
                className={navItemClass(activeTab === 'forms')}
              >
                <div className="flex items-center gap-2.5">
                  <FileText className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>Forms</span>
                </div>
                <span className="sr-only">Collect or Import</span>
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={() => setActiveTab('import')}
                className={navItemClass(activeTab === 'import')}
              >
                <div className="flex items-center gap-2.5">
                  <ArrowDownToLine className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>Import</span>
                </div>
              </button>
            </li>
          </ul>
        </div>

        {/* GROUP 2: MANAGE */}
        <div>
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 px-3">
            MANAGE
          </p>
          <ul className="space-y-0.5">
            <li>
              <button
                type="button"
                onClick={() => setActiveTab('proof')}
                className={navItemClass(activeTab === 'proof')}
              >
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>Proof</span>
                  <span className="sr-only">Customize</span>
                </div>
                {proofCount > 0 ? (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-violet-500/10 text-purple-700">
                    {proofCount}
                  </span>
                ) : null}
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={() => setActiveTab('analyze')}
                className={navItemClass(activeTab === 'analyze')}
              >
                <div className="flex items-center gap-2.5">
                  <BarChart2 className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>Analytics</span>
                </div>
              </button>
            </li>
          </ul>
        </div>

        {/* GROUP 3: SHARE */}
        <div>
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 px-3">
            SHARE
          </p>
          <ul className="space-y-0.5">
            <li>
              <button
                type="button"
                onClick={() => setActiveTab('widgets')}
                className={navItemClass(activeTab === 'widgets' || activeTab === 'social')}
              >
                <div className="flex items-center gap-2.5">
                  <Share2 className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>Embeds</span>
                  <span className="sr-only">Post on internet</span>
                </div>
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={() => setActiveTab('campaigns')}
                className={navItemClass(activeTab === 'campaigns')}
              >
                <div className="flex items-center gap-2.5">
                  <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>Thank Yous</span>
                  <span className="sr-only">Campaigns</span>
                </div>
                <span className="px-1.5 py-0.2 rounded-md text-[9px] font-bold bg-emerald-50 text-emerald-700">
                  Auto
                </span>
              </button>
            </li>
          </ul>
        </div>

        {/* GROUP 4: MORE & ACCOUNT */}
        <div>
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 px-3">
            ACCOUNT & GROWTH
          </p>
          <ul className="space-y-0.5">
            <li>
              <button
                type="button"
                onClick={() => setActiveTab('welcome')}
                className={navItemClass(activeTab === 'welcome')}
              >
                <div className="flex items-center gap-2.5">
                  <Star className="w-4 h-4 text-amber-400 fill-amber-400 shrink-0" />
                  <span>Welcome Hub</span>
                </div>
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={() => setActiveTab('referral')}
                className={navItemClass(activeTab === 'referral')}
              >
                <div className="flex items-center gap-2.5">
                  <Gift className="w-4 h-4 text-purple-600 shrink-0" />
                  <span>Referrals</span>
                </div>
                <span className="px-1.5 py-0.5 rounded-md text-[9px] font-bold bg-amber-100 text-amber-800">
                  Free Month
                </span>
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={() => setActiveTab('settings')}
                className={navItemClass(activeTab === 'settings' || activeTab === 'integrate')}
              >
                <div className="flex items-center gap-2.5">
                  <CreditCard className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>Billing & Plans</span>
                </div>
              </button>
            </li>
          </ul>
        </div>
      </div>

      {/* ── Bottom Workspace Switcher & Profile Chip ── */}
      <SidebarFooter />
    </aside>
  );
};

export default DashboardSidebar;
