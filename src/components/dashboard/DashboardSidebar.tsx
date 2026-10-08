import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Star,
  FileText,
  Download,
  CheckCircle2,
  Globe,
  Puzzle,
  Settings,
  LogOut,
  Layers,
  Check,
  Plus,
  ChevronsUpDown,
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
  const {
    user,
    workspace,
    project,
    allProjects = [],
    setActiveProject,
    createNewProject,
    signOut,
  } = useAuth();

  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [isSubmittingProject, setIsSubmittingProject] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const activeWorkspaceName = workspace?.name || project?.name || 'Main Workspace';
  const displayName = user?.displayName || (user?.email ? user.email.split('@')[0] : 'Admin');
  const userEmail = user?.email || '';
  const userInitial = displayName.charAt(0).toUpperCase();
  const planTier = (workspace?.plan || 'free').toUpperCase();

  // Close profile dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
        setIsCreatingProject(false);
      }
    };
    if (showProfileMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showProfileMenu]);

  const handleSelectProject = (p: Project) => {
    setActiveProject(p);
    setShowProfileMenu(false);
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName.trim()) return;
    setIsSubmittingProject(true);
    try {
      const created = await createNewProject(newProjectName.trim());
      if (created) {
        await setActiveProject(created);
      }
      setNewProjectName('');
      setIsCreatingProject(false);
      setShowProfileMenu(false);
    } catch (err) {
      console.error('Failed to create workspace:', err);
    } finally {
      setIsSubmittingProject(false);
    }
  };

  return (
    <aside className="w-64 min-w-[16rem] shrink-0 bg-[#f4f7fb]/95 backdrop-blur-2xl border-r border-slate-200/80 flex flex-col h-screen sticky top-0 select-none z-30 font-sans text-sm">
      
      {/* Brand Header */}
      <div className="px-5 py-3.5 border-b border-slate-200/60 flex items-center justify-between">
        <Link to="/dashboard" className="flex items-center gap-2 group apple-touch">
          <span className="font-extrabold text-lg tracking-tight text-slate-900 font-display whitespace-nowrap flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-violet-600 shadow-xs shadow-violet-600/50" />
            Panda Praise
          </span>
        </Link>
      </div>

      {/* ── Active Workspace Header Card (Matches Bottom Menu Naming) ── */}
      <div className="p-3 border-b border-slate-200/60">
        <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/90 border border-slate-200/70 shadow-2xs">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-violet-600 to-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs">
              {activeWorkspaceName.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p id="sidebar-top-workspace-name" className="text-xs font-bold text-slate-900 truncate leading-tight tracking-tight">
                {activeWorkspaceName}
              </p>
              <p className="text-[11px] font-medium text-emerald-600 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>Active Workspace</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Navigation Items (Cleanly Spaced Apple HIG Simple Stack) ── */}
      <div className="flex-1 overflow-y-auto px-3.5 pt-3 pb-6 space-y-1 scrollbar-thin">
        
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

        {/* 5. Post Online */}
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

        {/* 6. Integrations */}
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

      {/* ── Unified Bottom Profile Chip & Popover Dropdown ── */}
      <div ref={menuRef} className="p-3 border-t border-slate-200/60 bg-white/70 relative mt-auto">
        <button
          type="button"
          id="sidebar-profile-chip"
          onClick={() => setShowProfileMenu(!showProfileMenu)}
          className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-slate-100/80 transition-all text-left min-w-0 cursor-pointer group border border-transparent hover:border-slate-200/60"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-violet-600 to-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-2xs">
              {userInitial}
            </div>
            <div className="min-w-0">
              <p id="sidebar-profile-display-name" className="text-xs font-bold text-slate-900 truncate leading-tight group-hover:text-violet-700 transition-colors">
                {displayName}
              </p>
              <p id="sidebar-profile-workspace-name" className="text-[11px] text-slate-500 truncate leading-tight">
                {activeWorkspaceName}
              </p>
            </div>
          </div>
          <ChevronsUpDown className="w-4 h-4 text-slate-400 group-hover:text-slate-600 shrink-0 ml-1 transition-colors" />
        </button>

        {/* Unified Profile & Workspace Dropdown Popover */}
        {showProfileMenu && (
          <div
            id="sidebar-profile-dropdown"
            className="absolute bottom-full left-3 right-3 mb-2 bg-white rounded-2xl border border-slate-200/90 shadow-2xl overflow-hidden py-1.5 z-50 animate-in fade-in slide-in-from-bottom-2 duration-150"
          >
            {/* User & Plan Info */}
            <div className="px-3.5 py-2.5 border-b border-slate-100 flex items-center justify-between">
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-900 truncate">{displayName}</p>
                {userEmail && <p className="text-[11px] text-slate-400 truncate">{userEmail}</p>}
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-violet-100 text-violet-700 border border-violet-200 shrink-0 ml-1">
                {planTier}
              </span>
            </div>

            {/* Workspace & Project Switcher Section */}
            <div className="px-3 pt-2 pb-1 flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Workspaces & Projects
              </span>
              <span className="text-[10px] font-semibold text-slate-400">
                {allProjects.length} total
              </span>
            </div>

            {/* Project Switcher List */}
            <div id="sidebar-project-list" className="max-h-40 overflow-y-auto px-1 py-0.5 space-y-0.5 scrollbar-thin">
              {allProjects.map((p) => {
                const isActive = p.id === project?.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => handleSelectProject(p)}
                    className={`w-full px-2.5 py-1.5 rounded-lg text-left flex items-center justify-between text-xs transition-colors cursor-pointer ${
                      isActive
                        ? 'bg-violet-50 text-violet-700 font-bold'
                        : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-violet-600' : 'bg-slate-300'}`} />
                      <span className="truncate">{p.name}</span>
                    </div>
                    {isActive && <Check className="w-3.5 h-3.5 text-violet-600 shrink-0 ml-1" />}
                  </button>
                );
              })}
            </div>

            {/* Create New Workspace Action */}
            <div className="px-2 pt-1 pb-1.5 border-b border-slate-100">
              {!isCreatingProject ? (
                <button
                  type="button"
                  id="create-workspace-btn"
                  onClick={() => setIsCreatingProject(true)}
                  className="w-full px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:text-violet-700 hover:bg-violet-50/60 flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 text-violet-600" />
                  <span>Create New Workspace</span>
                </button>
              ) : (
                <form onSubmit={handleCreateProject} className="p-1 space-y-1.5 animate-in fade-in">
                  <input
                    type="text"
                    autoFocus
                    required
                    value={newProjectName}
                    onChange={(e) => setNewProjectName(e.target.value)}
                    placeholder="Workspace name..."
                    className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-violet-600 focus:border-violet-600"
                  />
                  <div className="flex items-center justify-end gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        setIsCreatingProject(false);
                        setNewProjectName('');
                      }}
                      className="px-2 py-1 text-[11px] font-medium text-slate-500 hover:text-slate-700 rounded cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmittingProject || !newProjectName.trim()}
                      className="px-2.5 py-1 text-[11px] font-bold bg-violet-600 text-white rounded-md hover:bg-violet-700 transition-colors disabled:opacity-50 cursor-pointer shadow-2xs"
                    >
                      {isSubmittingProject ? 'Creating...' : 'Create'}
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* Account Settings & High-Contrast Sign Out */}
            <div className="p-1.5 space-y-0.5">
              <button
                type="button"
                id="sidebar-account-settings-btn"
                onClick={() => {
                  setActiveTab('settings');
                  setShowProfileMenu(false);
                }}
                className="w-full px-2.5 py-1.5 rounded-lg text-left flex items-center gap-2 text-xs text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer font-medium"
              >
                <Settings className="w-3.5 h-3.5 text-slate-400" />
                <span>Account Settings</span>
              </button>

              <button
                type="button"
                id="sidebar-sign-out-btn"
                onClick={() => signOut()}
                className="w-full px-2.5 py-1.5 rounded-lg text-left flex items-center gap-2 text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 transition-colors cursor-pointer font-semibold"
              >
                <LogOut className="w-3.5 h-3.5 text-rose-500" />
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
