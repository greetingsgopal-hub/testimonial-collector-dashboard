import React, { useState, useRef, useEffect } from 'react';
import { ChevronsUpDown, Plus, LogOut, Check, Layers, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { isSuperadmin } from '../../lib/admin';
import { Project } from '../../types';

export interface SidebarFooterProps {
  initialDisplayName?: string;
  initialEmail?: string;
  initialWorkspace?: string;
}

export default function SidebarFooter({
  initialDisplayName,
  initialEmail,
  initialWorkspace,
}: SidebarFooterProps = {}) {
  const {
    user,
    workspace,
    project,
    allProjects = [],
    setActiveProject,
    createNewProject,
    signOut,
  } = useAuth();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [isSubmittingProject, setIsSubmittingProject] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
        setIsCreatingProject(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Coordinated Workspace & User Display logic
  const activeProjectName =
    project?.name ||
    initialWorkspace ||
    (workspace?.name && !workspace.name.includes("'s") ? workspace.name : 'papasystem');

  const workspaceDisplay = activeProjectName.toLowerCase().endsWith('workspace')
    ? activeProjectName
    : `${activeProjectName} workspace`;

  const displayName = user?.displayName || initialDisplayName || 'Gopal Kumar Thakur';
  const userEmail = user?.email || initialEmail || 'greetings.gopal@gmail.com';
  const userInitial = displayName.charAt(0).toUpperCase();
  const planTier = (workspace?.plan || 'free').toUpperCase();

  const handleSelectProject = (p: Project) => {
    setActiveProject(p);
    setIsDropdownOpen(false);
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName.trim() || isSubmittingProject) return;
    try {
      setIsSubmittingProject(true);
      await createNewProject(newProjectName.trim());
      setNewProjectName('');
      setIsCreatingProject(false);
      setIsDropdownOpen(false);
    } catch (err) {
      console.error('Failed to create workspace project:', err);
    } finally {
      setIsSubmittingProject(false);
    }
  };

  const effectiveProjects = allProjects.length > 0 ? allProjects : [
    { id: 'proj-default', name: activeProjectName, slug: activeProjectName.toLowerCase() } as Project
  ];

  return (
    <div className="relative p-3 border-t border-slate-200/80" ref={dropdownRef}>
      {/* Popover Menu (Anchored cleanly above footer) */}
      {isDropdownOpen && (
        <div
          id="sidebar-profile-dropdown"
          className="absolute bottom-full left-3 right-3 mb-2 bg-white rounded-2xl border border-slate-200 shadow-xl p-3 z-50 animate-in fade-in zoom-in-95 duration-150"
        >
          <div className="px-3 py-2 border-b border-slate-100 flex items-center justify-between">
            <div className="min-w-0">
              <p className="text-xs font-bold text-slate-900 truncate">{displayName}</p>
              <p className="text-[11px] text-slate-500 truncate">{userEmail}</p>
            </div>
            <span className="px-2 py-0.5 text-[10px] font-bold bg-purple-50 text-purple-700 rounded-full">
              {planTier}
            </span>
          </div>

          <div className="py-2">
            <p className="px-3 text-[10px] font-bold tracking-wider text-slate-400 uppercase mb-1">
              Workspaces & Projects
            </p>

            <div id="sidebar-project-list" className="max-h-40 overflow-y-auto px-1 py-0.5 space-y-0.5 scrollbar-thin">
              {effectiveProjects.map((p) => {
                const isActive = p.name === activeProjectName || p.id === project?.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => handleSelectProject(p)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                      isActive
                        ? 'bg-purple-50/70 text-purple-700'
                        : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <span className="flex items-center gap-2 truncate">
                      <Layers className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-purple-600' : 'text-slate-400'}`} />
                      <span className="truncate">{p.name}</span>
                    </span>
                    {isActive && <Check className="w-3.5 h-3.5 text-purple-600 shrink-0" />}
                  </button>
                );
              })}
            </div>

            {!isCreatingProject ? (
              <button
                type="button"
                id="create-workspace-btn"
                onClick={() => setIsCreatingProject(true)}
                className="mt-1 w-full flex items-center gap-2 px-3 py-2 rounded-xl text-slate-600 hover:bg-slate-50 text-xs font-medium transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 text-slate-400 shrink-0" />
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
                  className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-purple-600 focus:border-purple-600"
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
                    className="px-2.5 py-1 text-[11px] font-bold bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors disabled:opacity-50 cursor-pointer shadow-2xs"
                  >
                    {isSubmittingProject ? 'Creating...' : 'Create'}
                  </button>
                </div>
              </form>
            )}
          </div>

          <div className="pt-2 border-t border-slate-100 space-y-0.5">
            {isSuperadmin(user?.email) && (
              <Link
                to="/admin"
                id="sidebar-superadmin-console-link"
                onClick={() => setIsDropdownOpen(false)}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-slate-700 hover:bg-slate-50 text-xs font-medium transition-colors cursor-pointer"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span>Admin Console</span>
              </Link>
            )}

            <button
              type="button"
              id="sidebar-sign-out-btn"
              onClick={() => signOut()}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-red-600 hover:bg-red-50 text-xs font-semibold transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5 shrink-0" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}

      {/* Sidebar Profile Trigger Button */}
      <button
        type="button"
        id="sidebar-profile-chip"
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 transition-colors text-left cursor-pointer"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-full bg-purple-600 text-white font-bold text-sm flex items-center justify-center shrink-0 shadow-sm">
            {userInitial}
          </div>
          <div className="min-w-0">
            <p id="sidebar-profile-display-name" className="text-xs font-bold text-slate-900 truncate">{displayName}</p>
            <p id="sidebar-profile-workspace-name" className="text-[11px] text-slate-500 truncate">{workspaceDisplay}</p>
          </div>
        </div>
        <ChevronsUpDown className="w-4 h-4 text-slate-400 shrink-0" />
      </button>
    </div>
  );
}

export { SidebarFooter };
