import React, { useState } from 'react';
import {
  Settings,
  Users,
  CreditCard,
  Globe,
  Palette,
  Mail,
  Copy,
  Check,
  Plus,
  Shield,
  Crown,
  Save,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { TeamRole, PLAN_LIMITS } from '../../types';
import { getUsageSummary, PLAN_PRICING } from '../../lib/planLimits';

type SettingsTab = 'general' | 'team' | 'billing' | 'branding' | 'api';

export const WorkspaceSettings: React.FC = () => {
  const { workspace, user, project, allProjects } = useAuth();
  const [activeTab, setActiveTab] = useState<SettingsTab>('general');
  const [wsName, setWsName] = useState(workspace?.name || '');
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Team invite state
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<TeamRole>('editor');
  const [copied, setCopied] = useState(false);

  const usage = getUsageSummary(workspace);
  const plan = workspace?.plan || 'free';
  const limits = PLAN_LIMITS[plan];
  const pricing = PLAN_PRICING[plan];

  const tabs: { id: SettingsTab; label: string; icon: typeof Settings }[] = [
    { id: 'general', label: 'General', icon: Settings },
    { id: 'team', label: 'Team', icon: Users },
    { id: 'billing', label: 'Billing', icon: CreditCard },
    { id: 'branding', label: 'Branding', icon: Palette },
    { id: 'api', label: 'API & Webhooks', icon: Globe },
  ];

  const handleSave = async () => {
    setIsSaving(true);
    // Simulate save
    await new Promise(r => setTimeout(r, 600));
    setIsSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-white">Workspace Settings</h2>
        <p className="text-sm text-zinc-400 mt-1">
          Manage your workspace, team, billing, and integrations.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar Tabs */}
        <div className="lg:w-48 flex-shrink-0">
          <nav className="flex lg:flex-col gap-1">
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all
                    ${activeTab === tab.id
                      ? 'bg-violet-500/10 text-violet-300 border border-violet-500/20'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/5'}`}
                >
                  <Icon size={16} />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* ── General ── */}
          {activeTab === 'general' && (
            <div className="space-y-6">
              <div className="p-6 rounded-xl bg-white/[0.02] border border-white/10">
                <h3 className="text-sm font-semibold text-zinc-200 mb-4">Workspace Details</h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-xs text-zinc-500 mb-1 block">Workspace Name</label>
                    <input
                      type="text"
                      value={wsName}
                      onChange={e => setWsName(e.target.value)}
                      className="w-full max-w-sm px-3 py-2 text-sm rounded-lg bg-white/5 border border-white/10 text-zinc-200 focus:outline-none focus:ring-1 focus:ring-violet-500/50"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-zinc-500 mb-1 block">Workspace ID</label>
                    <div className="flex items-center gap-2">
                      <code className="px-3 py-2 text-sm rounded-lg bg-white/5 border border-white/10 text-zinc-400 font-mono">
                        {workspace?.id || 'N/A'}
                      </code>
                      <button onClick={() => handleCopy(workspace?.id || '')} className="p-1.5 rounded hover:bg-white/5 text-zinc-500 hover:text-zinc-300">
                        {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-zinc-500 mb-1 block">Owner</label>
                    <p className="text-sm text-zinc-300">{user?.email}</p>
                  </div>
                </div>

                <div className="mt-6 flex items-center gap-3">
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium
                             bg-violet-600 hover:bg-violet-500 text-white transition-colors
                             disabled:opacity-50"
                  >
                    {isSaving ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : saved ? (
                      <Check size={15} className="text-emerald-300" />
                    ) : (
                      <Save size={15} />
                    )}
                    {saved ? 'Saved!' : 'Save Changes'}
                  </button>
                </div>
              </div>

              {/* Usage Overview */}
              <div className="p-6 rounded-xl bg-white/[0.02] border border-white/10">
                <h3 className="text-sm font-semibold text-zinc-200 mb-4">Usage Overview</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {[
                    { label: 'Testimonials', ...usage.testimonials },
                    { label: 'Projects', ...usage.projects },
                    { label: 'Team Seats', ...usage.seats },
                  ].map(item => (
                    <div key={item.label} className="p-4 rounded-lg bg-white/[0.02] border border-white/5">
                      <p className="text-xs text-zinc-500 mb-1">{item.label}</p>
                      <p className="text-lg font-bold text-zinc-200">
                        {item.current} <span className="text-sm font-normal text-zinc-500">/ {item.max}</span>
                      </p>
                      <div className="mt-2 h-1.5 rounded-full bg-white/5 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500
                            ${item.percent > 90 ? 'bg-red-500' : item.percent > 70 ? 'bg-amber-500' : 'bg-violet-500'}`}
                          style={{ width: `${Math.min(item.percent, 100)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Projects List */}
              <div className="p-6 rounded-xl bg-white/[0.02] border border-white/10">
                <h3 className="text-sm font-semibold text-zinc-200 mb-4">Projects ({allProjects.length})</h3>
                <div className="space-y-2">
                  {allProjects.map(p => (
                    <div key={p.id} className="flex items-center gap-3 p-3 rounded-lg bg-white/[0.02] border border-white/5">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500/20 to-purple-500/20 flex items-center justify-center">
                        <span className="text-xs font-bold text-violet-300">{p.name.charAt(0).toUpperCase()}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-zinc-200 truncate">{p.name}</p>
                        <p className="text-xs text-zinc-500 truncate">{p.websiteUrl || 'No website'}</p>
                      </div>
                      {p.id === project?.id && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-violet-500/20 text-violet-300">Active</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── Team ── */}
          {activeTab === 'team' && (
            <div className="space-y-6">
              <div className="p-6 rounded-xl bg-white/[0.02] border border-white/10">
                <h3 className="text-sm font-semibold text-zinc-200 mb-4">Invite Team Member</h3>
                <div className="flex gap-3">
                  <div className="flex-1">
                    <div className="relative">
                      <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                      <input
                        type="email"
                        value={inviteEmail}
                        onChange={e => setInviteEmail(e.target.value)}
                        placeholder="teammate@company.com"
                        className="w-full pl-10 pr-4 py-2.5 text-sm rounded-lg bg-white/5 border border-white/10 text-zinc-200 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-violet-500/50"
                      />
                    </div>
                  </div>
                  <select
                    value={inviteRole}
                    onChange={e => setInviteRole(e.target.value as TeamRole)}
                    className="px-3 py-2 text-sm rounded-lg bg-white/5 border border-white/10 text-zinc-200 focus:outline-none focus:ring-1 focus:ring-violet-500/50 appearance-none cursor-pointer"
                  >
                    <option value="editor">Editor</option>
                    <option value="viewer">Viewer</option>
                    <option value="admin">Admin</option>
                  </select>
                  <button
                    disabled={!inviteEmail.trim() || limits.maxSeats <= 1}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium bg-violet-600 hover:bg-violet-500 text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <Plus size={14} />
                    Invite
                  </button>
                </div>
                {limits.maxSeats <= 1 && (
                  <p className="mt-3 text-xs text-amber-300/70 flex items-center gap-1.5">
                    <Crown size={12} />
                    Team seats require a Starter or Pro plan.
                  </p>
                )}
              </div>

              {/* Current Members */}
              <div className="p-6 rounded-xl bg-white/[0.02] border border-white/10">
                <h3 className="text-sm font-semibold text-zinc-200 mb-4">Team Members</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-white/[0.02] border border-white/5">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                      <span className="text-xs font-bold text-white">
                        {(user?.displayName || user?.email || 'U').charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-zinc-200">{user?.displayName || user?.email}</p>
                      <p className="text-xs text-zinc-500">{user?.email}</p>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-500/20 text-amber-300">Owner</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── Billing ── */}
          {activeTab === 'billing' && (
            <div className="space-y-6">
              <div className="p-6 rounded-xl bg-white/[0.02] border border-white/10">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h3 className="text-sm font-semibold text-zinc-200">Current Plan</h3>
                    <div className="flex items-center gap-2 mt-2">
                      <span className={`px-3 py-1 rounded-full text-sm font-bold
                        ${plan === 'pro' ? 'bg-amber-500/20 text-amber-300' :
                          plan === 'starter' ? 'bg-violet-500/20 text-violet-300' :
                          'bg-white/10 text-zinc-300'}`}>
                        {pricing.name}
                      </span>
                      <span className="text-2xl font-extrabold text-white">${PLAN_PRICING[plan].monthly}</span>
                      <span className="text-sm text-zinc-500">/month</span>
                    </div>
                  </div>
                  {plan === 'free' && (
                    <a href="/pricing" className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium bg-gradient-to-r from-violet-600 to-purple-600 text-white hover:from-violet-500 hover:to-purple-500 transition-all">
                      <Crown size={14} />
                      Upgrade
                    </a>
                  )}
                </div>

                {/* Plan features summary */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { label: 'Testimonials', value: limits.maxTestimonials === -1 ? '∞' : limits.maxTestimonials },
                    { label: 'Projects', value: limits.maxProjects === -1 ? '∞' : limits.maxProjects },
                    { label: 'Team Seats', value: limits.maxSeats === -1 ? '∞' : limits.maxSeats },
                    { label: 'Widgets', value: limits.maxWidgets === -1 ? '∞' : limits.maxWidgets },
                  ].map(item => (
                    <div key={item.label} className="p-3 rounded-lg bg-white/[0.02] border border-white/5 text-center">
                      <p className="text-lg font-bold text-zinc-200">{item.value}</p>
                      <p className="text-[11px] text-zinc-500">{item.label}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Feature checklist */}
              <div className="p-6 rounded-xl bg-white/[0.02] border border-white/10">
                <h3 className="text-sm font-semibold text-zinc-200 mb-4">Included Features</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {[
                    { name: 'Remove branding', ok: limits.removeBranding },
                    { name: 'HD video', ok: limits.hdVideo },
                    { name: 'Rich Snippets (SEO)', ok: limits.richSnippets },
                    { name: 'Translation', ok: limits.translation },
                    { name: 'API access', ok: limits.apiAccess },
                    { name: 'Webhooks', ok: limits.webhooks },
                    { name: 'Custom domain', ok: limits.customDomain },
                    { name: 'Sentiment analysis', ok: limits.sentimentAnalysis },
                    { name: 'Case study generator', ok: limits.caseStudyGenerator },
                    { name: 'Priority support', ok: limits.prioritySupport },
                  ].map(feat => (
                    <div key={feat.name} className="flex items-center gap-2 text-sm">
                      {feat.ok ? (
                        <Check size={14} className="text-emerald-400" />
                      ) : (
                        <Shield size={14} className="text-zinc-600" />
                      )}
                      <span className={feat.ok ? 'text-zinc-300' : 'text-zinc-600'}>{feat.name}</span>
                      {!feat.ok && plan === 'free' && (
                        <span className="text-[10px] text-amber-400/60 ml-auto">Upgrade →</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── Branding ── */}
          {activeTab === 'branding' && (
            <div className="space-y-6">
              <div className="p-6 rounded-xl bg-white/[0.02] border border-white/10">
                <h3 className="text-sm font-semibold text-zinc-200 mb-4">Workspace Branding</h3>
                <p className="text-xs text-zinc-500 mb-4">
                  Customize how your workspace appears to customers in collection forms and widgets.
                </p>
                <div className="space-y-4">
                  <div>
                    <label className="text-xs text-zinc-500 mb-1 block">Logo URL</label>
                    <input
                      type="url"
                      defaultValue={workspace?.logoUrl || ''}
                      placeholder="https://yoursite.com/logo.png"
                      className="w-full max-w-md px-3 py-2 text-sm rounded-lg bg-white/5 border border-white/10 text-zinc-200 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-violet-500/50"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-zinc-500 mb-1 block">Brand Color</label>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        defaultValue={workspace?.brandColor || '#8B5CF6'}
                        className="w-10 h-10 rounded-lg border border-white/10 cursor-pointer bg-transparent"
                      />
                      <input
                        type="text"
                        defaultValue={workspace?.brandColor || '#8B5CF6'}
                        placeholder="#8B5CF6"
                        className="w-32 px-3 py-2 text-sm rounded-lg bg-white/5 border border-white/10 text-zinc-200 font-mono focus:outline-none focus:ring-1 focus:ring-violet-500/50"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-zinc-500 mb-1 block">Custom Domain</label>
                    <input
                      type="text"
                      defaultValue={workspace?.customDomain || ''}
                      placeholder="love.yourbrand.com"
                      disabled={!limits.customDomain}
                      className="w-full max-w-md px-3 py-2 text-sm rounded-lg bg-white/5 border border-white/10 text-zinc-200 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-violet-500/50 disabled:opacity-40 disabled:cursor-not-allowed"
                    />
                    {!limits.customDomain && (
                      <p className="mt-1.5 text-xs text-amber-300/70 flex items-center gap-1">
                        <Crown size={11} /> Available on Starter plan and above
                      </p>
                    )}
                  </div>
                </div>

                <button
                  onClick={handleSave}
                  className="mt-6 flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-violet-600 hover:bg-violet-500 text-white transition-colors"
                >
                  <Save size={15} />
                  Save Branding
                </button>
              </div>
            </div>
          )}

          {/* ── API & Webhooks ── */}
          {activeTab === 'api' && (
            <div className="space-y-6">
              <div className="p-6 rounded-xl bg-white/[0.02] border border-white/10">
                <h3 className="text-sm font-semibold text-zinc-200 mb-2">API Keys</h3>
                <p className="text-xs text-zinc-500 mb-4">
                  Use API keys to access the Panda Praise REST API programmatically.
                </p>

                {limits.apiAccess ? (
                  <div className="space-y-3">
                    <div className="p-3 rounded-lg bg-white/[0.02] border border-white/5 flex items-center justify-between">
                      <div>
                        <p className="text-sm text-zinc-300 font-mono">pp_live_••••••••</p>
                        <p className="text-xs text-zinc-500">Created on signup • Read & Write</p>
                      </div>
                      <button className="text-xs text-red-400 hover:text-red-300">Revoke</button>
                    </div>
                    <button className="flex items-center gap-1.5 text-sm text-violet-400 hover:text-violet-300">
                      <Plus size={14} />
                      Generate New API Key
                    </button>
                  </div>
                ) : (
                  <div className="p-4 rounded-lg bg-amber-500/5 border border-amber-500/10">
                    <p className="text-sm text-amber-300/80 flex items-center gap-2">
                      <Crown size={14} />
                      API access requires a Starter plan or above.
                    </p>
                  </div>
                )}
              </div>

              <div className="p-6 rounded-xl bg-white/[0.02] border border-white/10">
                <h3 className="text-sm font-semibold text-zinc-200 mb-2">Webhooks</h3>
                <p className="text-xs text-zinc-500 mb-4">
                  Get notified when testimonials are created, approved, or deleted.
                </p>

                {limits.webhooks ? (
                  <div className="space-y-3">
                    <p className="text-sm text-zinc-400">No webhooks configured yet.</p>
                    <button className="flex items-center gap-1.5 text-sm text-violet-400 hover:text-violet-300">
                      <Plus size={14} />
                      Add Webhook Endpoint
                    </button>
                  </div>
                ) : (
                  <div className="p-4 rounded-lg bg-amber-500/5 border border-amber-500/10">
                    <p className="text-sm text-amber-300/80 flex items-center gap-2">
                      <Crown size={14} />
                      Webhooks require a Starter plan or above.
                    </p>
                  </div>
                )}
              </div>

              {/* API Docs link */}
              <div className="p-6 rounded-xl bg-violet-500/5 border border-violet-500/10">
                <h3 className="text-sm font-semibold text-violet-200 mb-2">📖 API Documentation</h3>
                <p className="text-xs text-zinc-400 mb-3">
                  Full REST API reference with code samples for Node.js, Python, and curl.
                </p>
                <button className="flex items-center gap-1.5 text-sm text-violet-400 hover:text-violet-300">
                  View Documentation
                  <ExternalLink size={13} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
