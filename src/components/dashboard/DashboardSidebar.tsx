import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Star,
  FileText,
  Download,
  CheckCircle2,
  Globe,
  Puzzle,
  Settings,
  ChevronDown,
  LogOut,
  Layers,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Project } from '../../types';

export type DashboardTab =
  | 'welcome'
  | 'forms'
  | 'import'
  | 'proof'
  | 'widgets'
  | 'feedback'
  | 'tags'
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
  const { user, project, allProjects = [], setActiveProject, signOut } = useAuth();
  const [showProjectMenu, setShowProjectMenu] = useState(false);

  const displayName = user?.displayName || (user?.email ? user.email.split('@')[0] : 'Admin');
  const userInitial = displayName.charAt(0).toUpperCase();

  const handleSelectProject = (p: Project) => {
    setActiveProject(p);
    setShowProjectMenu(false);
  };

  return (
    <aside className="w-64 min-w-[16rem] shrink-0 bg-[#f4f7fb]/95 backdrop-blur-2xl border-r border-slate-200/80 flex flex-col h-screen sticky top-0 select-none z-30 font-sans text-sm">
      
      {/* Brand Header */}
      <div className="px-5 py-4 border-b border-slate-200/60 flex items-center justify-between">
        <Link to="/dashboard" className="flex items-center gap-2 group apple-touch">
          <span className="font-extrabold text-lg tracking-tight text-slate-900 font-display whitespace-nowrap flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-violet-600 shadow-xs shadow-violet-600/50" />
            Panda Praise
          </span>
        </Link>
      </div>

      {/* User & Workspace Card */}
      <div className="p-3 border-b border-slate-200/60">
        <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/90 hover:bg-white transition-all border border-slate-200/70 shadow-2xs">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-violet-600 to-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs">
              {userInitial}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-slate-900 truncate leading-tight tracking-tight">{displayName}</p>
              <p className="text-[11px] font-medium text-emerald-600 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span>Active Workspace</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Items (Apple HIG Simple Stack — No Category Noise) */}
      <div className="flex-1 overflow-y-auto px-3.5 pt-3 pb-24 space-y-1 scrollbar-thin">
        
        {/* Welcome Hub */}
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

        {/* 1. Collect */}
        <button
          onClick={() => setActiveTab('forms')}
          className={`apple-touch group w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            activeTab === 'forms'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-200/60 hover:text-slate-900'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <FileText className={`w-4 h-4 transition-colors ${activeTab === 'forms' ? 'text-white' : 'text-slate-400 group-hover:text-slate-600'}`} />
            <span>Collect</span>
          </div>
        </button>

        {/* 2. Import */}
        <button
          onClick={() => setActiveTab('import')}
          className={`apple-touch group w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            activeTab === 'import'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-200/60 hover:text-slate-900'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <Download className={`w-4 h-4 transition-colors ${activeTab === 'import' ? 'text-white' : 'text-slate-400 group-hover:text-slate-600'}`} />
            <span>Import</span>
          </div>
        </button>

        {/* 3. Moderation Queue */}
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
            <span>Moderation Queue</span>
          </div>
          {proofCount > 0 ? (
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
              activeTab === 'proof' ? 'bg-white/20 text-white' : 'bg-violet-500/10 text-violet-700'
            }`}>
              {proofCount}
            </span>
          ) : null}
        </button>

        {/* 4. Widgets */}
        <button
          onClick={() => setActiveTab('widgets')}
          className={`apple-touch group w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            activeTab === 'widgets'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-200/60 hover:text-slate-900'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <Layers className={`w-4 h-4 transition-colors ${activeTab === 'widgets' ? 'text-white' : 'text-slate-400 group-hover:text-slate-600'}`} />
            <span>Widgets</span>
          </div>
        </button>

        {/* 4. Post Online */}
        <button
          onClick={() => setActiveTab('rich-snippet')}
          className={`apple-touch group w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            activeTab === 'rich-snippet'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-200/60 hover:text-slate-900'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <Globe className={`w-4 h-4 transition-colors ${activeTab === 'rich-snippet' ? 'text-white' : 'text-slate-400 group-hover:text-slate-600'}`} />
            <span>Post Online</span>
          </div>
        </button>

        {/* Subtle Separator */}
        <div className="pt-2 pb-1">
          <div className="h-px bg-slate-200/70" />
        </div>

        {/* Integrations */}
        <button
          onClick={() => setActiveTab('integrate')}
          className={`apple-touch group w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            activeTab === 'integrate'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-200/60 hover:text-slate-900'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <Puzzle className={`w-4 h-4 transition-colors ${activeTab === 'integrate' ? 'text-white' : 'text-slate-400 group-hover:text-slate-600'}`} />
            <span>Integrations</span>
          </div>
        </button>
      </div>

      {/* Bottom Project Switcher & Workspace Bar */}
      <div className="p-3 border-t border-slate-200/60 bg-white/60 relative">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setShowProjectMenu(!showProjectMenu)}
            className="flex-1 flex items-center justify-between px-2.5 py-2 rounded-xl hover:bg-slate-100 transition-colors text-left min-w-0 cursor-pointer"
          >
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-6 h-6 rounded-lg bg-violet-600/10 text-violet-700 flex items-center justify-center font-bold text-xs shrink-0">
                {project?.name ? project.name.charAt(0).toUpperCase() : 'P'}
              </div>
              <span className="text-xs font-bold text-slate-800 truncate">
                {project?.name || 'Main Product'}
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-1" />
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`p-2 rounded-xl hover:bg-slate-100 text-slate-500 hover:text-slate-900 transition-colors cursor-pointer ml-1 ${
              activeTab === 'settings' ? 'bg-violet-50 text-violet-700' : ''
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
