import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Zap,
  Star,
  FileText,
  Download,
  CheckCircle2,
  MessageSquare,
  Tag,
  Sparkles,
  Film,
  HeartHandshake,
  Palette,
  Search,
  BarChart3,
  Puzzle,
  Settings,
  ChevronDown,
  LogOut,
  Lock,
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
  | 'proof-reels'
  | 'thank-yous'
  | 'brand-kit'
  | 'rich-snippet'
  | 'analyze'
  | 'integrate'
  | 'settings';

interface DashboardSidebarProps {
  activeTab: DashboardTab;
  setActiveTab: (tab: DashboardTab) => void;
  proofCount?: number;
  feedbackCount?: number;
}

export const DashboardSidebar: React.FC<DashboardSidebarProps> = ({
  activeTab,
  setActiveTab,
  proofCount = 0,
  feedbackCount = 0,
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
    <aside className="w-64 min-w-[16rem] shrink-0 bg-white border-r border-gray-200 flex flex-col h-screen sticky top-0 select-none z-30 font-sans text-sm">
      
      {/* Brand Header */}
      <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
        <Link to="/dashboard" className="flex items-center gap-2 group">
          <span className="font-extrabold text-lg tracking-tight text-[#6701e6] font-display whitespace-nowrap">
            Panda Praise
          </span>
        </Link>
      </div>

      {/* User & Plan Header */}
      <div className="p-3 border-b border-gray-100">
        <div className="flex items-center justify-between p-2 rounded-xl bg-gray-50/80 hover:bg-gray-100/80 transition-colors">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-7 h-7 rounded-full bg-purple-100 text-[#6701e6] font-bold text-xs flex items-center justify-center shrink-0 border border-purple-200">
              {userInitial}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-gray-900 truncate leading-tight">{displayName}</p>
              <p className="text-[11px] font-medium text-gray-500 capitalize">{plan} plan</p>
            </div>
          </div>
        </div>

        {/* Upgrade Callout Button */}
        {plan === 'free' && (
          <Link
            to="/onboarding/upgrade"
            className="mt-2 w-full py-2 px-3 rounded-xl bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200/80 hover:border-purple-300 text-[#6701e6] flex items-center justify-center gap-2 text-xs font-bold transition-all shadow-2xs hover:shadow-xs cursor-pointer"
          >
            <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
            <span>Upgrade</span>
          </Link>
        )}
      </div>

      {/* Navigation Sections */}
      <div className="flex-1 overflow-y-auto px-3.5 pt-3 pb-24 space-y-6 scrollbar-thin">
        
        {/* Top Welcome Quick Access */}
        <div>
          <button
            onClick={() => setActiveTab('welcome')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
              activeTab === 'welcome'
                ? 'bg-purple-50 text-[#6701e6]'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            <Star className={`w-4 h-4 ${activeTab === 'welcome' ? 'text-[#6701e6] fill-[#6701e6]' : 'text-gray-400'}`} />
            <span>Welcome</span>
          </button>
        </div>

        {/* Section: COLLECT */}
        <div className="space-y-1">
          <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-gray-400">Collect</p>
          <button
            onClick={() => setActiveTab('forms')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
              activeTab === 'forms'
                ? 'bg-purple-50 text-[#6701e6]'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <FileText className="w-4 h-4 text-gray-400" />
              <span>Forms</span>
            </div>
          </button>

          <button
            onClick={() => setActiveTab('import')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
              activeTab === 'import'
                ? 'bg-purple-50 text-[#6701e6]'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Download className="w-4 h-4 text-gray-400" />
              <span>Import</span>
            </div>
          </button>
        </div>

        {/* Section: MANAGE */}
        <div className="space-y-1">
          <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-gray-400">Manage</p>
          <button
            onClick={() => setActiveTab('proof')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
              activeTab === 'proof'
                ? 'bg-purple-50 text-[#6701e6]'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-gray-400" />
              <span>Proof</span>
            </div>
            {proofCount > 0 ? (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-[#6701e6]">
                {proofCount}
              </span>
            ) : (
              <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-emerald-100 text-emerald-700">
                New 1
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('feedback')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
              activeTab === 'feedback'
                ? 'bg-purple-50 text-[#6701e6]'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <MessageSquare className="w-4 h-4 text-gray-400" />
              <span>Feedback</span>
            </div>
            {feedbackCount > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                {feedbackCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('tags')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
              activeTab === 'tags'
                ? 'bg-purple-50 text-[#6701e6]'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Tag className="w-4 h-4 text-gray-400" />
              <span>Tags</span>
            </div>
          </button>
        </div>

        {/* Section: SHARE */}
        <div className="space-y-1">
          <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-gray-400">Share</p>
          <button
            onClick={() => setActiveTab('studio')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
              activeTab === 'studio'
                ? 'bg-purple-50 text-[#6701e6]'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Sparkles className="w-4 h-4 text-gray-400" />
              <span>Studio</span>
            </div>
            <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-emerald-100 text-emerald-700">
              New 1
            </span>
          </button>

          <button
            onClick={() => setActiveTab('proof-reels')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
              activeTab === 'proof-reels'
                ? 'bg-purple-50 text-[#6701e6]'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Film className="w-4 h-4 text-gray-400" />
              <span>Proof Reels</span>
            </div>
          </button>

          <button
            onClick={() => setActiveTab('thank-yous')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
              activeTab === 'thank-yous'
                ? 'bg-purple-50 text-[#6701e6]'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <HeartHandshake className="w-4 h-4 text-gray-400" />
              <span>Thank Yous</span>
            </div>
          </button>

          <button
            onClick={() => setActiveTab('brand-kit')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
              activeTab === 'brand-kit'
                ? 'bg-purple-50 text-[#6701e6]'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Palette className="w-4 h-4 text-gray-400" />
              <span>Brand Kit</span>
            </div>
            <Lock className="w-3 h-3 text-gray-400" />
          </button>

          <button
            onClick={() => setActiveTab('rich-snippet')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
              activeTab === 'rich-snippet'
                ? 'bg-purple-50 text-[#6701e6]'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Search className="w-4 h-4 text-gray-400" />
              <span>Rich Snippet</span>
            </div>
            <Zap className="w-3 h-3 text-amber-500 fill-amber-400" />
          </button>
        </div>

        {/* Section: ANALYZE */}
        <div className="space-y-1">
          <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-gray-400">Analyze</p>
          <button
            onClick={() => setActiveTab('analyze')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
              activeTab === 'analyze'
                ? 'bg-purple-50 text-[#6701e6]'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <BarChart3 className="w-4 h-4 text-gray-400" />
              <span>Analyze</span>
            </div>
          </button>
        </div>

        {/* Utility Section */}
        <div className="space-y-1 pt-2 border-t border-gray-100">
          <button
            onClick={() => setActiveTab('integrate')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
              activeTab === 'integrate'
                ? 'bg-purple-50 text-[#6701e6]'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Puzzle className="w-4 h-4 text-gray-400" />
              <span>Integrate</span>
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
