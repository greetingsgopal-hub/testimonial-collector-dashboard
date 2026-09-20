import React, { useState, useRef, useEffect } from 'react';
import {
  ChevronDown,
  Plus,
  Check,
  Folder,
  Settings,
  Trash2,
  Crown,
  X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Project, PLAN_LIMITS, isAtPlanLimit } from '../../types';

interface ProjectSwitcherProps {
  onSettingsClick?: (project: Project) => void;
}

export const ProjectSwitcher: React.FC<ProjectSwitcherProps> = ({ onSettingsClick }) => {
  const {
    project,
    workspace,
    allProjects,
    setActiveProject,
    createNewProject,
    deleteProjectById,
  } = useAuth();

  const [isOpen, setIsOpen] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectUrl, setNewProjectUrl] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const plan = workspace?.plan || 'free';
  const atLimit = isAtPlanLimit(plan, 'maxProjects', allProjects.length);
  const maxProjects = PLAN_LIMITS[plan].maxProjects;

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setShowCreateForm(false);
        setConfirmDeleteId(null);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleCreateProject = async () => {
    if (!newProjectName.trim() || isCreating) return;
    setIsCreating(true);
    const created = await createNewProject(newProjectName.trim(), newProjectUrl.trim() || undefined);
    if (created) {
      await setActiveProject(created);
      setNewProjectName('');
      setNewProjectUrl('');
      setShowCreateForm(false);
    }
    setIsCreating(false);
  };

  const handleDeleteProject = async (id: string) => {
    const success = await deleteProjectById(id);
    if (success) {
      setConfirmDeleteId(null);
    }
  };

  if (!project) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        onClick={() => { setIsOpen(!isOpen); setShowCreateForm(false); setConfirmDeleteId(null); }}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg
                   bg-white/5 hover:bg-white/10 border border-white/10
                   transition-all duration-200 group max-w-[220px]"
      >
        <div className="w-5 h-5 rounded bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center flex-shrink-0">
          <Folder size={11} className="text-white" />
        </div>
        <span className="text-sm font-medium text-zinc-200 truncate">
          {project.name}
        </span>
        <ChevronDown
          size={14}
          className={`text-zinc-400 transition-transform duration-200 flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-72 z-50
                        bg-zinc-900/95 backdrop-blur-xl border border-white/10
                        rounded-xl shadow-2xl shadow-black/40 overflow-hidden
                        animate-in fade-in slide-in-from-top-2">
          {/* Header */}
          <div className="px-3 py-2.5 border-b border-white/5">
            <p className="text-[11px] uppercase tracking-wider text-zinc-500 font-semibold">
              Projects ({allProjects.length}/{maxProjects === -1 ? '∞' : maxProjects})
            </p>
          </div>

          {/* Project List */}
          <div className="max-h-48 overflow-y-auto py-1">
            {allProjects.map((p) => (
              <div key={p.id} className="group relative">
                {confirmDeleteId === p.id ? (
                  /* Delete Confirmation */
                  <div className="flex items-center gap-2 px-3 py-2 bg-red-500/10">
                    <span className="text-xs text-red-300 flex-1">Delete "{p.name}"?</span>
                    <button
                      onClick={() => handleDeleteProject(p.id)}
                      className="text-[11px] px-2 py-0.5 rounded bg-red-500/20 text-red-300 hover:bg-red-500/30 transition-colors"
                    >
                      Yes
                    </button>
                    <button
                      onClick={() => setConfirmDeleteId(null)}
                      className="text-[11px] px-2 py-0.5 rounded bg-white/5 text-zinc-400 hover:bg-white/10 transition-colors"
                    >
                      No
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setActiveProject(p);
                      setIsOpen(false);
                    }}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 text-left
                               transition-all duration-150
                               ${p.id === project.id
                                 ? 'bg-violet-500/10 text-violet-200'
                                 : 'text-zinc-300 hover:bg-white/5'}`}
                  >
                    <div className={`w-4 h-4 rounded flex items-center justify-center flex-shrink-0
                                    ${p.id === project.id
                                      ? 'bg-violet-500/30'
                                      : 'bg-white/5'}`}>
                      {p.id === project.id ? (
                        <Check size={10} className="text-violet-300" />
                      ) : (
                        <Folder size={10} className="text-zinc-500" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{p.name}</p>
                      {p.websiteUrl && (
                        <p className="text-[11px] text-zinc-500 truncate">{p.websiteUrl}</p>
                      )}
                    </div>

                    {/* Action icons (visible on hover) */}
                    <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      {onSettingsClick && (
                        <button
                          onClick={(e) => { e.stopPropagation(); onSettingsClick(p); setIsOpen(false); }}
                          className="p-1 rounded hover:bg-white/10 text-zinc-500 hover:text-zinc-300"
                          title="Project settings"
                        >
                          <Settings size={12} />
                        </button>
                      )}
                      {allProjects.length > 1 && (
                        <button
                          onClick={(e) => { e.stopPropagation(); setConfirmDeleteId(p.id); }}
                          className="p-1 rounded hover:bg-red-500/10 text-zinc-500 hover:text-red-400"
                          title="Delete project"
                        >
                          <Trash2 size={12} />
                        </button>
                      )}
                    </div>
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Create New Project */}
          <div className="border-t border-white/5">
            {showCreateForm ? (
              <div className="p-3 space-y-2">
                <input
                  type="text"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  placeholder="Project name"
                  autoFocus
                  className="w-full px-2.5 py-1.5 text-sm rounded-lg
                           bg-white/5 border border-white/10
                           text-zinc-200 placeholder-zinc-500
                           focus:outline-none focus:ring-1 focus:ring-violet-500/50 focus:border-violet-500/50"
                  onKeyDown={(e) => e.key === 'Enter' && handleCreateProject()}
                />
                <input
                  type="url"
                  value={newProjectUrl}
                  onChange={(e) => setNewProjectUrl(e.target.value)}
                  placeholder="Website URL (optional)"
                  className="w-full px-2.5 py-1.5 text-sm rounded-lg
                           bg-white/5 border border-white/10
                           text-zinc-200 placeholder-zinc-500
                           focus:outline-none focus:ring-1 focus:ring-violet-500/50 focus:border-violet-500/50"
                  onKeyDown={(e) => e.key === 'Enter' && handleCreateProject()}
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleCreateProject}
                    disabled={!newProjectName.trim() || isCreating}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5
                             text-sm font-medium rounded-lg
                             bg-violet-600 hover:bg-violet-500 text-white
                             disabled:opacity-40 disabled:cursor-not-allowed
                             transition-colors"
                  >
                    {isCreating ? (
                      <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <Plus size={14} />
                    )}
                    Create
                  </button>
                  <button
                    onClick={() => { setShowCreateForm(false); setNewProjectName(''); setNewProjectUrl(''); }}
                    className="px-3 py-1.5 text-sm rounded-lg bg-white/5 text-zinc-400
                             hover:bg-white/10 transition-colors"
                  >
                    <X size={14} />
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => {
                  if (atLimit) return;
                  setShowCreateForm(true);
                }}
                disabled={atLimit}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-left
                          text-sm transition-colors
                          ${atLimit
                            ? 'text-zinc-500 cursor-not-allowed'
                            : 'text-violet-400 hover:bg-violet-500/5 hover:text-violet-300'}`}
              >
                {atLimit ? (
                  <>
                    <Crown size={14} className="text-amber-400" />
                    <span>Upgrade for more projects</span>
                  </>
                ) : (
                  <>
                    <Plus size={14} />
                    <span>New Project</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
