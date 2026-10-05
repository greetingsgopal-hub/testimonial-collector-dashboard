import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Zap,
  Star,
  FileText,
  Download,
  CheckCircle2,
  Sparkles,
  Search,
  Puzzle,
  Settings,
  ChevronDown,
  LogOut,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Project } from '../../types';

export type DashboardTab =
  | 'welcome'
  | 'forms'
  | 'import'
  | 'proof'
  | 'feedback'
  | 'tags'
  | 'studio'
  | 'rich-snippet'
  | 'analyze'
  | 'integrate'
  | 'settings';

interface DashboardSidebarProps {
  activeTab: DashboardTab;
  setActiveTab: (tab: DashboardTab) => void;
  proofCount?: number;
}

export const DashboardSidebar: React.FC<DashboardSidebarProps> = ({
  activeTab,
  setActiveTab,
  proofCount = 0,
}) => {
  const { user, workspace, project, allProjects = [], setActiveProject, signOut } = useAuth();
  const [showProjectMenu, setShowProjectMenu] = useState(false);

  const plan = workspace?.plan || 'free';
  const displayName = user?.displayName || (user?.email ? user.email.split('@')[0] : 'Admin');
  const userInitial = displayName.charAt(0).toUpperCase();

  const handleSelectProject = (p: Project) => {
    setActiveProject(p);
    setShowProjectMenu(false);
  };

  return (
    <aside className="w-64 min-w-[16rem] shrink-0 bg-white/80 backdrop-blur-2xl border-r border-black/[0.06] flex flex-col h-screen sticky top-0 select-none z-30 font-sans text-sm">
      
      {/* Brand Header */}
      <div className="px-5 py-4 border-b border-black/[0.04] flex items-center justify-between">
        <Link to="/dashboard" className="flex items-center gap-2 group apple-touch">
          <span className="font-extrabold text-lg tracking-tight text-zinc-950 font-display whitespace-nowrap flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-violet-600 shadow-xs shadow-violet-600/50" />
            Panda Praise
          </span>
        </Link>
      </div>

      {/* User & Plan Header */}
      <div className="p-3 border-b border-black/[0.04]">
        <div className="flex items-center justify-between p-2 rounded-xl bg-black/[0.02] hover:bg-black/[0.04] transition-colors border border-black/[0.03]">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-violet-600 to-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs">
              {userInitial}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-zinc-900 truncate leading-tight tracking-tight">{displayName}</p>
              <p className="text-[11px] font-medium text-zinc-400 capitalize">{plan} plan</p>
            </div>
          </div>
        </div>

        {/* Upgrade Callout Button */}
        {plan === 'free' && (
          <Link
            to="/onboarding/upgrade"
            className="apple-touch mt-2 w-full py-2 px-3 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white flex items-center justify-center gap-1.5 text-xs font-semibold shadow-xs shadow-violet-600/20 cursor-pointer"
          >
            <Zap className="w-3.5 h-3.5 fill-current" />
            <span>Upgrade Workspace</span>
          </Link>
        )}
      </div>

      {/* Navigation Sections */}
      <div className="flex-1 overflow-y-auto px-3.5 pt-3 pb-24 space-y-5 scrollbar-thin">
        
        {/* Top Welcome Quick Access */}
        <div>
          <button
            onClick={() => setActiveTab('welcome')}
            className={`apple-touch w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
              activeTab === 'welcome'
                ? 'bg-zinc-950 text-white shadow-xs'
                : 'text-zinc-600 hover:bg-black/[0.04] hover:text-zinc-950'
            }`}
          >
            <Star className={`w-4 h-4 ${activeTab === 'welcome' ? 'text-amber-400 fill-amber-400' : 'text-zinc-400'}`} />
            <span>Welcome Hub</span>
          </button>
        </div>

        {/* Section: COLLECT */}
        <div className="space-y-1">
          <p className="px-3 text-[10px] font-semibold uppercase tracking-wider text-zinc-400">Collect</p>
          <button
            onClick={() => setActiveTab('forms')}
            className={`apple-touch w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
              activeTab === 'forms'
                ? 'bg-zinc-950 text-white shadow-xs'
                : 'text-zinc-600 hover:bg-black/[0.04] hover:text-zinc-950'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <FileText className="w-4 h-4 text-zinc-400" />
              <span>Forms & Capture</span>
            </div>
          </button>

          <button
            onClick={() => setActiveTab('import')}
            className={`apple-touch w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
              activeTab === 'import'
                ? 'bg-zinc-950 text-white shadow-xs'
                : 'text-zinc-600 hover:bg-black/[0.04] hover:text-zinc-950'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Download className="w-4 h-4 text-zinc-400" />
              <span>Import Sources</span>
            </div>
          </button>
        </div>

        {/* Section: MANAGE */}
        <div className="space-y-1">
          <p className="px-3 text-[10px] font-semibold uppercase tracking-wider text-zinc-400">Manage Proof</p>
          <button
            onClick={() => setActiveTab('proof')}
            className={`apple-touch w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
              activeTab === 'proof'
                ? 'bg-zinc-950 text-white shadow-xs'
                : 'text-zinc-600 hover:bg-black/[0.04] hover:text-zinc-950'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-zinc-400" />
              <span>Testimonials</span>
            </div>
            {proofCount > 0 ? (
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                activeTab === 'proof' ? 'bg-white/20 text-white' : 'bg-violet-500/10 text-violet-700'
              }`}>
                {proofCount}
              </span>
            ) : null}
          </button>
        </div>

        {/* Section: SHARE */}
        <div className="space-y-1">
          <p className="px-3 text-[10px] font-semibold uppercase tracking-wider text-zinc-400">Studio & Embeds</p>
          <button
            onClick={() => setActiveTab('studio')}
            className={`apple-touch w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
              activeTab === 'studio'
                ? 'bg-zinc-950 text-white shadow-xs'
                : 'text-zinc-600 hover:bg-black/[0.04] hover:text-zinc-950'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Sparkles className="w-4 h-4 text-zinc-400" />
              <span>Widget Studio</span>
            </div>
            <span className="px-1.5 py-0.5 rounded-full text-[9px] font-semibold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
              Live
            </span>
          </button>

          <button
            onClick={() => setActiveTab('rich-snippet')}
            className={`apple-touch w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
              activeTab === 'rich-snippet'
                ? 'bg-zinc-950 text-white shadow-xs'
                : 'text-zinc-600 hover:bg-black/[0.04] hover:text-zinc-950'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Search className="w-4 h-4 text-zinc-400" />
              <span>Google Rich Snippets</span>
            </div>
          </button>
        </div>

        {/* Utility Section */}
        <div className="space-y-1 pt-2 border-t border-black/[0.04]">
          <button
            onClick={() => setActiveTab('integrate')}
            className={`apple-touch w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
              activeTab === 'integrate'
                ? 'bg-zinc-950 text-white shadow-xs'
                : 'text-zinc-600 hover:bg-black/[0.04] hover:text-zinc-950'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Puzzle className="w-4 h-4 text-zinc-400" />
              <span>Integrations</span>
            </div>
          </button>
        </div>
      </div>

      {/* Bottom Project Switcher & Workspace Bar */}
      <div className="p-3 border-t border-gray-100 bg-gray-50/50 relative">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setShowProjectMenu(!showProjectMenu)}
            className="flex-1 flex items-center justify-between px-2.5 py-2 rounded-xl hover:bg-gray-100 transition-colors text-left min-w-0 cursor-pointer"
          >
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-6 h-6 rounded-lg bg-[#6701e6]/10 text-[#6701e6] flex items-center justify-center font-bold text-xs shrink-0">
                {project?.name ? project.name.charAt(0).toUpperCase() : 'P'}
              </div>
              <span className="text-xs font-bold text-gray-800 truncate">
                {project?.name || 'Main Product'}
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-gray-400 shrink-0 ml-1" />
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`p-2 rounded-xl hover:bg-gray-100 text-gray-500 hover:text-gray-900 transition-colors cursor-pointer ml-1 ${
              activeTab === 'settings' ? 'bg-purple-50 text-[#6701e6]' : ''
            }`}
            title="Project Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>

        {/* Project Switcher Popover */}
        {showProjectMenu && (
          <div className="absolute bottom-full left-3 right-3 mb-2 bg-white rounded-2xl border border-gray-200 shadow-xl overflow-hidden py-1 z-50 animate-slide-up">
            <div className="px-3 py-2 border-b border-gray-100 flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Projects</span>
              <span className="text-[10px] text-gray-500">{allProjects.length} total</span>
            </div>
            <div className="max-h-48 overflow-y-auto py-1">
              {allProjects.map((p) => (
                <button
                  key={p.id}
                  onClick={() => handleSelectProject(p)}
                  className={`w-full px-3 py-2 text-left flex items-center justify-between text-xs transition-colors cursor-pointer ${
                    p.id === project?.id ? 'bg-purple-50 text-[#6701e6] font-bold' : 'hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  <span className="truncate">{p.name}</span>
                  {p.id === project?.id && <span className="w-1.5 h-1.5 rounded-full bg-[#6701e6]" />}
                </button>
              ))}
            </div>
            <div className="border-t border-gray-100 p-2 flex items-center justify-between">
              <button
                onClick={() => signOut()}
                className="flex items-center gap-1.5 text-xs text-rose-600 hover:text-rose-700 px-2 py-1 rounded-lg hover:bg-rose-50 cursor-pointer font-medium"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
export default DashboardSidebar;
