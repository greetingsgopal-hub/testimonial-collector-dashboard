import React, { useState } from 'react';
import {
  Building2,
  Users,
  CreditCard,
  Palette,
  Key,
  Check,
  Crown,
  ExternalLink,
  Plus,
  Mail,
  Shield,
  Save,
  Copy,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { usePageSeo } from '../../lib/seo';
import { PLAN_PRICING } from '../../lib/planLimits';
import { TeamRole, PLAN_LIMITS, Project } from '../../types';

type SettingsTab = 'general' | 'team' | 'billing' | 'branding' | 'api';

export const WorkspaceSettings: React.FC = () => {
  usePageSeo({
    title: 'Workspace Settings — Panda Praise',
    description: 'Manage your workspace settings, team members, billing, and integrations.',
  });

  const { workspace, project, user, allProjects = [] } = useAuth();
  const [activeTab, setActiveTab] = useState<SettingsTab>('general');
  const [wsName, setWsName] = useState(workspace?.name || 'My Workspace');
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<TeamRole>('editor');

  const plan = workspace?.plan || 'free';
  const limits = PLAN_LIMITS[plan];
  const pricing = PLAN_PRICING[plan];

  const projectsList = allProjects.length > 0 ? allProjects : (project ? [project] : []);

  const usage = {
    testimonials: { current: 6, max: limits.maxTestimonials === -1 ? '∞' : limits.maxTestimonials, percent: 40 },
    projects: { current: projectsList.length, max: limits.maxProjects === -1 ? '∞' : limits.maxProjects, percent: (projectsList.length / (limits.maxProjects === -1 ? 100 : limits.maxProjects)) * 100 },
    seats: { current: 1, max: limits.maxSeats === -1 ? '∞' : limits.maxSeats, percent: (1 / (limits.maxSeats === -1 ? 10 : limits.maxSeats)) * 100 },
  };

  const tabs = [
    { id: 'general' as SettingsTab, label: 'General', icon: Building2 },
    { id: 'team' as SettingsTab, label: 'Team', icon: Users },
    { id: 'billing' as SettingsTab, label: 'Billing & Plan', icon: CreditCard },
    { id: 'branding' as SettingsTab, label: 'Branding', icon: Palette },
    { id: 'api' as SettingsTab, label: 'API & Webhooks', icon: Key },
  ];

  const handleSave = async () => {
    setIsSaving(true);
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
        <h2 className="text-2xl font-bold font-display text-gray-900 tracking-tight">Workspace Settings</h2>
        <p className="text-sm text-gray-500 mt-1">
          Manage your workspace, team, billing, and integrations.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar Tabs */}
        <div className="lg:w-52 flex-shrink-0">
          <nav className="flex lg:flex-col gap-1.5 p-1 bg-white border border-gray-200 rounded-2xl shadow-xs">
            {tabs.map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer
                    ${isActive
                      ? 'bg-purple-50 text-[#6701e6] shadow-2xs font-bold'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100/70'}`}
                >
                  <Icon size={16} className={isActive ? 'text-[#6701e6]' : 'text-gray-400'} />
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
              <div className="p-6 rounded-2xl bg-white border border-gray-200 shadow-xs space-y-4">
                <h3 className="text-base font-bold text-gray-900">Workspace Details</h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-gray-700 mb-1 block">Workspace Name</label>
                    <input
                      type="text"
                      value={wsName}
                      onChange={e => setWsName(e.target.value)}
                      className="w-full max-w-sm px-3.5 py-2 text-sm rounded-xl bg-white border border-gray-300 text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#6701e6] focus:border-[#6701e6]"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-700 mb-1 block">Workspace ID</label>
                    <div className="flex items-center gap-2">
                      <code className="px-3 py-2 text-xs rounded-xl bg-gray-50 border border-gray-200 text-gray-600 font-mono">
                        {workspace?.id || 'N/A'}
                      </code>
                      <button onClick={() => handleCopy(workspace?.id || '')} className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 cursor-pointer">
                        {copied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-700 mb-1 block">Owner</label>
                    <p className="text-sm font-medium text-gray-800">{user?.email}</p>
                  </div>
                </div>

                <div className="pt-2 flex items-center gap-3">
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold
                             bg-[#6701e6] hover:bg-[#5200bd] text-white transition-colors
                             disabled:opacity-50 cursor-pointer shadow-xs"
                  >
                    {isSaving ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : saved ? (
                      <Check size={15} className="text-white" />
                    ) : (
                      <Save size={15} />
                    )}
                    {saved ? 'Saved!' : 'Save Changes'}
                  </button>
                </div>
              </div>

              {/* Usage Overview */}
              <div className="p-6 rounded-2xl bg-white border border-gray-200 shadow-xs">
                <h3 className="text-base font-bold text-gray-900 mb-4">Usage Overview</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {[
                    { label: 'Testimonials', ...usage.testimonials },
                    { label: 'Projects', ...usage.projects },
                    { label: 'Team Seats', ...usage.seats },
                  ].map(item => (
                    <div key={item.label} className="p-4 rounded-xl bg-gray-50 border border-gray-200">
                      <p className="text-xs font-semibold text-gray-500 mb-1">{item.label}</p>
                      <p className="text-xl font-extrabold text-gray-950">
                        {item.current} <span className="text-xs font-normal text-gray-400">/ {item.max}</span>
                      </p>
                      <div className="mt-2.5 h-1.5 rounded-full bg-gray-200 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500
                            ${item.percent > 90 ? 'bg-red-500' : item.percent > 70 ? 'bg-amber-500' : 'bg-[#6701e6]'}`}
                          style={{ width: `${Math.min(item.percent, 100)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Projects List */}
              <div className="p-6 rounded-2xl bg-white border border-gray-200 shadow-xs">
                <h3 className="text-base font-bold text-gray-900 mb-4">Projects ({projectsList.length})</h3>
                <div className="space-y-2">
                  {projectsList.map((p: Project) => (
                    <div key={p.id} className="flex items-center gap-3 p-3.5 rounded-xl bg-gray-50 border border-gray-200">
                      <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center text-[#6701e6] font-bold text-xs">
                        {p.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">{p.name}</p>
                        <p className="text-xs text-gray-500 truncate">{p.websiteUrl || 'No website'}</p>
                      </div>
                      {p.id === project?.id && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-[#6701e6]">Active</span>
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
              <div className="p-6 rounded-2xl bg-white border border-gray-200 shadow-xs space-y-4">
                <h3 className="text-base font-bold text-gray-900">Invite Team Member</h3>
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-1">
                    <div className="relative">
                      <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="email"
                        value={inviteEmail}
                        onChange={e => setInviteEmail(e.target.value)}
                        placeholder="teammate@company.com"
                        className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl bg-white border border-gray-300 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#6701e6] focus:border-[#6701e6]"
                      />
                    </div>
                  </div>
                  <select
                    value={inviteRole}
                    onChange={e => setInviteRole(e.target.value as TeamRole)}
                    className="px-3.5 py-2.5 text-sm rounded-xl bg-white border border-gray-300 text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#6701e6] focus:border-[#6701e6] appearance-none cursor-pointer"
                  >
                    <option value="editor">Editor</option>
                    <option value="viewer">Viewer</option>
                    <option value="admin">Admin</option>
                  </select>
                  <button
                    disabled={!inviteEmail.trim() || limits.maxSeats <= 1}
                    className="flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl text-sm font-bold bg-[#6701e6] hover:bg-[#5200bd] text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-xs"
                  >
                    <Plus size={14} />
                    Invite
                  </button>
                </div>
                {limits.maxSeats <= 1 && (
                  <p className="text-xs text-amber-800 bg-amber-50 p-3 rounded-xl border border-amber-200 flex items-center gap-1.5">
                    <Crown size={12} className="text-amber-600" />
                    Team seats require a Starter or Pro plan.
                  </p>
                )}
              </div>

              {/* Current Members */}
              <div className="p-6 rounded-2xl bg-white border border-gray-200 shadow-xs">
                <h3 className="text-base font-bold text-gray-900 mb-4">Team Members</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-3 p-3.5 rounded-xl bg-gray-50 border border-gray-200">
                    <div className="w-8 h-8 rounded-full bg-purple-100 text-[#6701e6] flex items-center justify-center font-bold text-xs border border-purple-200">
                      {(user?.displayName || user?.email || 'U').charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-900">{user?.displayName || user?.email}</p>
                      <p className="text-xs text-gray-500">{user?.email}</p>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">Owner</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── Billing ── */}
          {activeTab === 'billing' && (
            <div className="space-y-6">
              <div className="p-6 rounded-2xl bg-white border border-gray-200 shadow-xs">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500">Current Plan</h3>
                    <div className="flex items-center gap-2 mt-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold
                        ${plan === 'pro' ? 'bg-purple-100 text-[#6701e6]' :
                          plan === 'starter' ? 'bg-purple-50 text-[#6701e6]' :
                          'bg-gray-100 text-gray-700'}`}>
                        {pricing.name}
                      </span>
                      <span className="text-2xl font-extrabold text-gray-950">${PLAN_PRICING[plan].monthly}</span>
                      <span className="text-xs text-gray-500">/month</span>
                    </div>
                  </div>
                  {plan === 'free' && (
                    <a href="/onboarding/upgrade" className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold bg-black hover:bg-gray-800 text-white transition-all shadow-xs">
                      <Crown size={14} className="text-amber-400" />
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
                    <div key={item.label} className="p-3.5 rounded-xl bg-gray-50 border border-gray-200 text-center">
                      <p className="text-lg font-bold text-gray-900">{item.value}</p>
                      <p className="text-[11px] text-gray-500">{item.label}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Feature checklist */}
              <div className="p-6 rounded-2xl bg-white border border-gray-200 shadow-xs">
                <h3 className="text-base font-bold text-gray-900 mb-4">Included Features</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
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
                    <div key={feat.name} className="flex items-center gap-2 text-xs sm:text-sm">
                      {feat.ok ? (
                        <Check size={14} className="text-emerald-600 font-bold" />
                      ) : (
                        <Shield size={14} className="text-gray-300" />
                      )}
                      <span className={feat.ok ? 'text-gray-900 font-medium' : 'text-gray-400'}>{feat.name}</span>
                      {!feat.ok && plan === 'free' && (
                        <a href="/onboarding/upgrade" className="text-[11px] text-[#6701e6] hover:underline font-bold ml-auto">Upgrade →</a>
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
              <div className="p-6 rounded-2xl bg-white border border-gray-200 shadow-xs space-y-4">
                <h3 className="text-base font-bold text-gray-900">Workspace Branding</h3>
                <p className="text-xs text-gray-500">
                  Customize how your workspace appears to customers in collection forms and widgets.
                </p>
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-gray-700 mb-1 block">Logo URL</label>
                    <input
                      type="url"
                      defaultValue={workspace?.logoUrl || ''}
                      placeholder="https://yoursite.com/logo.png"
                      className="w-full max-w-md px-3.5 py-2 text-sm rounded-xl bg-white border border-gray-300 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#6701e6] focus:border-[#6701e6]"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-700 mb-1 block">Brand Color</label>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        defaultValue={workspace?.brandColor || '#6701e6'}
                        className="w-10 h-10 rounded-lg border border-gray-300 cursor-pointer bg-transparent"
                      />
                      <input
                        type="text"
                        defaultValue={workspace?.brandColor || '#6701e6'}
                        placeholder="#6701e6"
                        className="w-32 px-3 py-2 text-sm rounded-xl bg-white border border-gray-300 text-gray-900 font-mono focus:outline-none focus:ring-1 focus:ring-[#6701e6] focus:border-[#6701e6]"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-700 mb-1 block">Custom Domain</label>
                    <input
                      type="text"
                      defaultValue={workspace?.customDomain || ''}
                      placeholder="love.yourbrand.com"
                      disabled={!limits.customDomain}
                      className="w-full max-w-md px-3.5 py-2 text-sm rounded-xl bg-white border border-gray-300 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#6701e6] focus:border-[#6701e6] disabled:opacity-40 disabled:cursor-not-allowed"
                    />
                    {!limits.customDomain && (
                      <p className="mt-1.5 text-xs text-amber-700 flex items-center gap-1 font-medium">
                        <Crown size={11} className="text-amber-500" /> Available on Starter plan and above
                      </p>
                    )}
                  </div>
                </div>

                <button
                  onClick={handleSave}
                  className="mt-6 flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold bg-[#6701e6] hover:bg-[#5200bd] text-white transition-colors cursor-pointer shadow-xs"
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
              <div className="p-6 rounded-2xl bg-white border border-gray-200 shadow-xs space-y-3">
                <h3 className="text-base font-bold text-gray-900">API Keys</h3>
                <p className="text-xs text-gray-500">
                  Use API keys to access the Panda Praise REST API programmatically.
                </p>

                {limits.apiAccess ? (
                  <div className="space-y-3 pt-2">
                    <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-between">
                      <div>
                        <p className="text-xs font-mono font-semibold text-gray-900">pp_live_••••••••</p>
                        <p className="text-[11px] text-gray-500">Created on signup • Read & Write</p>
                      </div>
                      <button className="text-xs font-semibold text-rose-600 hover:text-rose-700 cursor-pointer">Revoke</button>
                    </div>
                    <button className="flex items-center gap-1.5 text-xs font-bold text-[#6701e6] hover:underline cursor-pointer">
                      <Plus size={14} />
                      Generate New API Key
                    </button>
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-amber-50 border border-amber-200">
                    <p className="text-xs font-medium text-amber-800 flex items-center gap-2">
                      <Crown size={14} className="text-amber-600" />
                      API access requires a Starter plan or above.
                    </p>
                  </div>
                )}
              </div>

              <div className="p-6 rounded-2xl bg-white border border-gray-200 shadow-xs space-y-3">
                <h3 className="text-base font-bold text-gray-900">Webhooks</h3>
                <p className="text-xs text-gray-500">
                  Get notified when testimonials are created, approved, or deleted.
                </p>

                {limits.webhooks ? (
                  <div className="space-y-3 pt-2">
                    <p className="text-xs text-gray-500">No webhooks configured yet.</p>
                    <button className="flex items-center gap-1.5 text-xs font-bold text-[#6701e6] hover:underline cursor-pointer">
                      <Plus size={14} />
                      Add Webhook Endpoint
                    </button>
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-amber-50 border border-amber-200">
                    <p className="text-xs font-medium text-amber-800 flex items-center gap-2">
                      <Crown size={14} className="text-amber-600" />
                      Webhooks require a Starter plan or above.
                    </p>
                  </div>
                )}
              </div>

              {/* API Docs link */}
              <div className="p-6 rounded-2xl bg-purple-50/60 border border-purple-200">
                <h3 className="text-sm font-bold text-[#6701e6] mb-1">📖 API Documentation</h3>
                <p className="text-xs text-gray-600 mb-3">
                  Full REST API reference with code samples for Node.js, Python, and curl.
                </p>
                <button className="flex items-center gap-1.5 text-xs font-bold text-[#6701e6] hover:underline cursor-pointer">
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
