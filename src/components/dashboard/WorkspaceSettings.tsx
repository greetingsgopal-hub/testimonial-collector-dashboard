import React, { useState, useEffect } from 'react';
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
  Trash2,
  AlertTriangle,
  Lock,
  Send,
  CheckCircle2,
  Sparkles,
  X,
} from 'lucide-react';
import { CmsEmbedModal } from './CmsEmbedModal';
import { useAuth } from '../../context/AuthContext';
import { usePageSeo } from '../../lib/seo';
import { TeamRole, PLAN_LIMITS, Project } from '../../types';
import { startRazorpayCheckout } from '../../lib/razorpay';
import { requestAccountDeletion } from '../../lib/account';
import { usePlanEntitlements } from '../../hooks/usePlanEntitlements';
import { storage } from '../../lib/storage';

type SettingsTab = 'general' | 'team' | 'billing' | 'branding' | 'api' | 'security';

export const WorkspaceSettings: React.FC = () => {
  usePageSeo({
    title: 'Workspace Settings — Panda Praise',
    description: 'Manage your workspace settings, team members, billing, security, and integrations.',
  });

  const { workspace, project, user, allProjects = [], updateProjectDetails, deleteProjectById, resetPassword, signOut } = useAuth();
  const entitlements = usePlanEntitlements(workspace);
  const [activeTab, setActiveTab] = useState<SettingsTab>('general');
  const [wsName, setWsName] = useState(workspace?.name || project?.name || 'My Workspace');
  const [removeBranding, setRemoveBranding] = useState<boolean>(workspace?.remove_branding || false);
  const [customCss, setCustomCss] = useState<string>(workspace?.custom_css || '');
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<TeamRole>('editor');

  // Danger Zone / GDPR Deletion State
  const [isDeleting, setIsDeleting] = useState(false);
  const [showAccountDeleteModal, setShowAccountDeleteModal] = useState(false);
  const [deleteConfirmationText, setDeleteConfirmationText] = useState('');
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [accountDeletionError, setAccountDeletionError] = useState<string | null>(null);

  // Billing and checkout state
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);
  const [checkoutCanceled, setCheckoutCanceled] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('checkout_success') === 'true' || params.get('checkout') === 'success') {
        setCheckoutSuccess(true);
        setActiveTab('billing');
      } else if (params.get('checkout_canceled') === 'true' || params.get('checkout') === 'canceled') {
        setCheckoutCanceled(true);
        setActiveTab('billing');
      }
    }
  }, []);
  const [billingError, setBillingError] = useState<string | null>(null);

  // Security Tab State
  const [passwordResetSent, setPasswordResetSent] = useState(false);
  const [passwordResetError, setPasswordResetError] = useState<string | null>(null);

  // Webhooks & CMS Integrations State (Phase 3)
  const [showCmsEmbedModal, setShowCmsEmbedModal] = useState(false);
  const [slackWebhookUrl, setSlackWebhookUrl] = useState('');
  const [discordWebhookUrl, setDiscordWebhookUrl] = useState('');
  const [zapierWebhookUrl, setZapierWebhookUrl] = useState('');
  const [testingWebhookPlatform, setTestingWebhookPlatform] = useState<string | null>(null);
  const [webhookTestFeedback, setWebhookTestFeedback] = useState<Record<string, { success: boolean; msg: string }>>({});

  const handleTestWebhook = async (platform: 'slack' | 'discord' | 'zapier', url: string) => {
    if (!url) return;
    setTestingWebhookPlatform(platform);
    try {
      const res = await fetch('/api/webhooks/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ platform, targetUrl: url }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setWebhookTestFeedback(prev => ({ ...prev, [platform]: { success: true, msg: 'Test alert sent successfully!' } }));
      } else {
        setWebhookTestFeedback(prev => ({ ...prev, [platform]: { success: false, msg: data.error || 'Failed to dispatch test' } }));
      }
    } catch (err: any) {
      setWebhookTestFeedback(prev => ({ ...prev, [platform]: { success: false, msg: err.message || 'Network error' } }));
    } finally {
      setTestingWebhookPlatform(null);
    }
  };

  const handleStartCheckout = async (plan: string = 'monthly') => {
    setIsCheckingOut(true);
    setBillingError(null);
    try {
      const res = await startRazorpayCheckout(plan);
      if (!res.success && res.error) {
        setBillingError(res.error);
      }
    } catch (err: any) {
      setBillingError(err.message || 'Failed to start checkout');
    } finally {
      setIsCheckingOut(false);
    }
  };

  const handleOpenBillingPortal = async () => {
    // Direct upgrade / plan switch for active subscriptions
    handleStartCheckout('monthly');
  };

  const handleExecuteAccountDeletion = async () => {
    if (deleteConfirmationText !== 'DELETE') return;
    setIsDeletingAccount(true);
    setAccountDeletionError(null);
    try {
      const res = await requestAccountDeletion();
      if (res.success) {
        if (signOut) {
          await signOut();
        }
        try {
          localStorage.clear();
        } catch {}
        window.location.href = '/';
      } else {
        setAccountDeletionError(res.error || 'Failed to delete account.');
      }
    } catch (err: any) {
      setAccountDeletionError(err.message || 'Network error during account deletion.');
    } finally {
      setIsDeletingAccount(false);
    }
  };

  const plan = workspace?.plan || 'free';
  const limits = PLAN_LIMITS[plan];

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
    { id: 'security' as SettingsTab, label: 'Security & Auth', icon: Lock },
  ];

  const handleSave = async () => {
    setIsSaving(true);
    try {
      if (project?.id && updateProjectDetails) {
        await updateProjectDetails(project.id, { name: wsName.trim() });
      }
      if (workspace?.id && storage.updateWorkspace) {
        await storage.updateWorkspace(workspace.id, {
          remove_branding: removeBranding,
          custom_css: customCss,
        });
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error('Failed to update workspace details:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteWorkspace = async () => {
    const targetName = wsName.trim();
    const confirmation = window.prompt(
      `GDPR Right to be Forgotten: To permanently delete this workspace and all associated customer testimonials, type "${targetName}" to confirm:`
    );
    if (confirmation !== targetName) {
      if (confirmation !== null) {
        alert('Workspace name did not match. Deletion cancelled.');
      }
      return;
    }

    setIsDeleting(true);
    try {
      if (project?.id && deleteProjectById) {
        await deleteProjectById(project.id);
      }
      window.location.href = '/dashboard';
    } catch (err) {
      console.error('Failed to delete workspace:', err);
      alert('Failed to delete workspace. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleTriggerPasswordReset = async () => {
    if (!user?.email) return;
    setPasswordResetError(null);
    try {
      const res = await resetPassword(user.email);
      if (res.success) {
        setPasswordResetSent(true);
      } else {
        setPasswordResetError(res.error || 'Failed to dispatch reset email.');
      }
    } catch (err: any) {
      setPasswordResetError(err.message || 'Error triggering reset email.');
    }
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

              {/* Danger Zone: Workspace Deletion / GDPR Article 17 */}
              <div className="p-6 rounded-2xl bg-rose-50/50 border border-rose-200 shadow-xs space-y-4">
                <div className="flex items-center gap-2 text-rose-700">
                  <AlertTriangle size={18} />
                  <h3 className="text-base font-bold">Danger Zone</h3>
                </div>
                <p className="text-xs text-rose-600/90 leading-relaxed">
                  Permanently delete this workspace and all associated customer testimonials, campaign forms, and widget configurations. Under GDPR Article 17 (Right to Erasure), all stored customer review records will be purged immediately. This action cannot be undone.
                </p>

                <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-t border-rose-200">
                  <div>
                    <p className="text-xs font-bold text-gray-900">Delete Workspace & Testimonials</p>
                    <p className="text-[11px] text-gray-500">Requires typing workspace name to confirm</p>
                  </div>
                  <button
                    onClick={handleDeleteWorkspace}
                    disabled={isDeleting}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white transition-colors disabled:opacity-50 cursor-pointer shadow-xs"
                  >
                    <Trash2 size={14} />
                    {isDeleting ? 'Deleting Workspace...' : 'Delete Workspace'}
                  </button>
                </div>

                <div className="pt-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-t border-rose-200">
                  <div>
                    <p className="text-xs font-bold text-rose-900">Permanent Account Deletion (GDPR Article 17)</p>
                    <p className="text-[11px] text-rose-700/80">Purges account, cancels subscriptions, and deletes all workspace data</p>
                  </div>
                  <button
                    onClick={() => {
                      setDeleteConfirmationText('');
                      setAccountDeletionError(null);
                      setShowAccountDeleteModal(true);
                    }}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-rose-950 hover:bg-black text-rose-200 transition-colors cursor-pointer shadow-xs"
                  >
                    <AlertTriangle size={14} />
                    Delete Account & All Data
                  </button>
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
                    Team seats require a paid plan.
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
              {checkoutSuccess && (
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-center justify-between shadow-2xs animate-fade-in">
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    <div>
                      <p className="text-sm font-bold">Subscription Activated! 🎉</p>
                      <p className="text-xs text-emerald-700">Thank you for upgrading. Your Pro features and limits are now active.</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setCheckoutSuccess(false)}
                    className="text-xs text-emerald-700 hover:text-emerald-900 font-semibold cursor-pointer px-2 py-1"
                  >
                    Dismiss
                  </button>
                </div>
              )}

              {checkoutCanceled && (
                <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 text-gray-700 flex items-center justify-between shadow-2xs animate-fade-in">
                  <div className="flex items-center gap-2.5">
                    <AlertTriangle className="w-5 h-5 text-gray-500 shrink-0" />
                    <div>
                      <p className="text-sm font-bold">Checkout Canceled</p>
                      <p className="text-xs text-gray-500">No charges were made. You can upgrade whenever you're ready.</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setCheckoutCanceled(false)}
                    className="text-xs text-gray-600 hover:text-gray-900 font-semibold cursor-pointer px-2 py-1"
                  >
                    Dismiss
                  </button>
                </div>
              )}

              {(workspace?.subscriptionStatus === 'past_due' || workspace?.subscriptionStatus === 'halted') && (
                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 text-amber-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
                  <div className="flex items-center gap-2.5">
                    <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
                    <div>
                      <p className="text-sm font-bold">Subscription Payment {workspace?.subscriptionStatus === 'halted' ? 'Halted' : 'Past Due'}</p>
                      <p className="text-xs text-amber-700">Your latest recurring payment failed or was halted. Please re-subscribe to maintain uninterrupted access.</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleStartCheckout('monthly')}
                    disabled={isCheckingOut}
                    className="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-all shadow-xs shrink-0 cursor-pointer disabled:opacity-50"
                  >
                    {isCheckingOut ? 'Opening...' : 'Renew Subscription'}
                  </button>
                </div>
              )}

              <div className="p-6 rounded-2xl bg-white border border-gray-200 shadow-xs">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500">Current Plan</h3>
                    <div className="flex items-center gap-2 mt-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold
                        ${plan === 'pro' ? 'bg-purple-100 text-[#6701e6]' :
                          plan === 'starter' ? 'bg-purple-50 text-[#6701e6]' :
                          'bg-gray-100 text-gray-700'}`}>
                        {plan === 'free' ? 'Free' : 'Paid'}
                      </span>
                      {plan === 'free' ? (
                        <span className="text-xs text-gray-500">Up to 15 testimonials</span>
                      ) : (
                        <span className="text-xs text-gray-500">Full access</span>
                      )}
                    </div>
                  </div>
                  {billingError && (
                    <div className="w-full text-xs text-rose-600 font-medium">
                      {billingError}
                    </div>
                  )}
                  {plan === 'free' ? (
                    <button
                      onClick={() => handleStartCheckout('monthly')}
                      disabled={isCheckingOut}
                      className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold bg-black hover:bg-gray-800 text-white transition-all shadow-xs cursor-pointer disabled:opacity-50"
                    >
                      <Crown size={14} className="text-amber-400" />
                      {isCheckingOut ? 'Loading...' : 'Upgrade to Pro'}
                    </button>
                  ) : (
                    <button
                      onClick={handleOpenBillingPortal}
                      disabled={isCheckingOut}
                      className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold bg-[#6701e6] hover:bg-[#5200bd] text-white transition-all shadow-xs cursor-pointer disabled:opacity-50"
                    >
                      <CreditCard size={14} />
                      {isCheckingOut ? 'Opening...' : 'Manage Subscription'}
                    </button>
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
                    { name: 'High-res social cards', ok: true },
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
                  {/* Remove Branding Toggle */}
                  <div className="flex items-center justify-between p-3.5 rounded-xl border border-gray-200 bg-gray-50/50">
                    <div>
                      <span className="text-xs font-bold text-gray-900 block">Remove "Powered by PandaPraise" Branding</span>
                      <span className="text-[11px] text-gray-500">Hide the viral watermark badge from all public walls, widgets, and collection forms.</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={removeBranding}
                        disabled={!entitlements.canRemoveBranding}
                        onChange={(e) => setRemoveBranding(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#6701e6] peer-disabled:opacity-40"></div>
                    </label>
                  </div>
                  {!entitlements.canRemoveBranding && (
                    <p className="text-xs text-amber-700 flex items-center gap-1 font-medium">
                      <Crown size={11} className="text-amber-500" /> Branding removal requires Pro, Agency or Lifetime plan.
                    </p>
                  )}

                  {/* Custom Domain */}
                  <div>
                    <label className="text-xs font-semibold text-gray-700 mb-1 block">Custom Domain</label>
                    <input
                      type="text"
                      defaultValue={workspace?.customDomain || ''}
                      placeholder="love.yourbrand.com"
                      disabled={!entitlements.canUseCustomDomain}
                      className="w-full max-w-md px-3.5 py-2 text-sm rounded-xl bg-white border border-gray-300 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#6701e6] focus:border-[#6701e6] disabled:opacity-40 disabled:cursor-not-allowed"
                    />
                    {!entitlements.canUseCustomDomain && (
                      <p className="mt-1.5 text-xs text-amber-700 flex items-center gap-1 font-medium">
                        <Crown size={11} className="text-amber-500" /> Custom Domain requires Pro, Agency or Lifetime plan.
                      </p>
                    )}
                  </div>

                  {/* White-Glove Custom CSS */}
                  <div>
                    <label className="text-xs font-semibold text-gray-700 mb-1 block">White-Glove Custom CSS</label>
                    <textarea
                      rows={3}
                      value={customCss}
                      onChange={(e) => setCustomCss(e.target.value)}
                      placeholder=".pandapraise-card { border-radius: 16px; }"
                      disabled={!entitlements.canUseCustomCss}
                      className="w-full max-w-lg px-3.5 py-2 text-xs font-mono rounded-xl bg-white border border-gray-300 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#6701e6] focus:border-[#6701e6] disabled:opacity-40 disabled:cursor-not-allowed"
                    />
                    {!entitlements.canUseCustomCss && (
                      <p className="mt-1 text-xs text-amber-700 flex items-center gap-1 font-medium">
                        <Crown size={11} className="text-amber-500" /> Custom CSS injection is available on Agency & Lifetime plans.
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
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-gray-900">Developer REST API Keys</h3>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-[#6701e6] border border-purple-200">
                    Agency Exclusive
                  </span>
                </div>
                <p className="text-xs text-gray-500">
                  Use your secret PandaPraise API key (`X-PandaPraise-Key`) to query live testimonials via GET `/api/v1/testimonials` programmatically.
                </p>

                {entitlements.canUseRestApiAndWebhooks ? (
                  <div className="space-y-3 pt-2">
                    <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-between">
                      <div>
                        <p className="text-xs font-mono font-semibold text-gray-900">
                          {workspace?.api_key || 'pp_live_••••••••••••••••'}
                        </p>
                        <p className="text-[11px] text-gray-500">Active Agency API Key • Full REST Access</p>
                      </div>
                      <button
                        onClick={() => handleCopy(workspace?.api_key || 'pp_live_agency_token')}
                        className="text-xs font-semibold text-[#6701e6] hover:underline cursor-pointer"
                      >
                        {copied ? 'Copied!' : 'Copy Key'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-amber-50 border border-amber-200">
                    <p className="text-xs font-medium text-amber-800 flex items-center gap-2">
                      <Crown size={14} className="text-amber-600" />
                      Developer REST API access is exclusive to the Agency Plan.
                    </p>
                    <a href="/pricing" className="mt-2 inline-block text-xs font-bold text-[#6701e6] hover:underline">
                      Upgrade to Agency →
                    </a>
                  </div>
                )}
              </div>

              <div className="p-6 rounded-2xl bg-white border border-gray-200 shadow-xs space-y-4">
                <div>
                  <h3 className="text-base font-bold text-gray-900">Real-Time Alert Webhooks</h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Dispatch instant alerts when testimonials are submitted or approved to Slack, Discord, or Zapier/Make.
                  </p>
                </div>

                <div className="space-y-4 pt-2">
                  {/* Slack Alert */}
                  <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-[#E01E5A]"></span>
                        Slack Incoming Webhook URL
                      </label>
                      <button
                        onClick={() => handleTestWebhook('slack', slackWebhookUrl || 'https://hooks.slack.com/services/demo')}
                        disabled={testingWebhookPlatform === 'slack'}
                        className="flex items-center gap-1 px-3 py-1 text-xs font-bold rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-800 transition-all cursor-pointer disabled:opacity-50"
                      >
                        <Send size={12} />
                        {testingWebhookPlatform === 'slack' ? 'Sending...' : 'Send Test Card'}
                      </button>
                    </div>
                    <input
                      type="url"
                      value={slackWebhookUrl}
                      onChange={(e) => setSlackWebhookUrl(e.target.value)}
                      placeholder="https://hooks.slack.com/services/T00/B00/XXXX"
                      className="w-full px-3 py-2 text-xs font-mono rounded-lg bg-white border border-gray-300 text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#6701e6]"
                    />
                    {webhookTestFeedback['slack'] && (
                      <p className={`text-[11px] font-semibold flex items-center gap-1 ${
                        webhookTestFeedback['slack'].success ? 'text-emerald-600' : 'text-rose-600'
                      }`}>
                        {webhookTestFeedback['slack'].success ? <CheckCircle2 size={12} /> : null}
                        {webhookTestFeedback['slack'].msg}
                      </p>
                    )}
                  </div>

                  {/* Discord Alert */}
                  <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-[#5865F2]"></span>
                        Discord Webhook URL
                      </label>
                      <button
                        onClick={() => handleTestWebhook('discord', discordWebhookUrl || 'https://discord.com/api/webhooks/demo')}
                        disabled={testingWebhookPlatform === 'discord'}
                        className="flex items-center gap-1 px-3 py-1 text-xs font-bold rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-800 transition-all cursor-pointer disabled:opacity-50"
                      >
                        <Send size={12} />
                        {testingWebhookPlatform === 'discord' ? 'Sending...' : 'Send Test Embed'}
                      </button>
                    </div>
                    <input
                      type="url"
                      value={discordWebhookUrl}
                      onChange={(e) => setDiscordWebhookUrl(e.target.value)}
                      placeholder="https://discord.com/api/webhooks/..."
                      className="w-full px-3 py-2 text-xs font-mono rounded-lg bg-white border border-gray-300 text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#6701e6]"
                    />
                    {webhookTestFeedback['discord'] && (
                      <p className={`text-[11px] font-semibold flex items-center gap-1 ${
                        webhookTestFeedback['discord'].success ? 'text-emerald-600' : 'text-rose-600'
                      }`}>
                        {webhookTestFeedback['discord'].success ? <CheckCircle2 size={12} /> : null}
                        {webhookTestFeedback['discord'].msg}
                      </p>
                    )}
                  </div>

                  {/* Generic REST / Zapier Webhook */}
                  <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-[#FF4A00]"></span>
                        Zapier / Make.com REST Hook Trigger
                      </label>
                      <button
                        onClick={() => handleTestWebhook('zapier', zapierWebhookUrl || 'https://hooks.zapier.com/hooks/catch/demo')}
                        disabled={testingWebhookPlatform === 'zapier'}
                        className="flex items-center gap-1 px-3 py-1 text-xs font-bold rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-800 transition-all cursor-pointer disabled:opacity-50"
                      >
                        <Send size={12} />
                        {testingWebhookPlatform === 'zapier' ? 'Sending...' : 'Send Test Ping'}
                      </button>
                    </div>
                    <input
                      type="url"
                      value={zapierWebhookUrl}
                      onChange={(e) => setZapierWebhookUrl(e.target.value)}
                      placeholder="https://hooks.zapier.com/hooks/catch/..."
                      className="w-full px-3 py-2 text-xs font-mono rounded-lg bg-white border border-gray-300 text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#6701e6]"
                    />
                    {webhookTestFeedback['zapier'] && (
                      <p className={`text-[11px] font-semibold flex items-center gap-1 ${
                        webhookTestFeedback['zapier'].success ? 'text-emerald-600' : 'text-rose-600'
                      }`}>
                        {webhookTestFeedback['zapier'].success ? <CheckCircle2 size={12} /> : null}
                        {webhookTestFeedback['zapier'].msg}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Third-Party CMS Embed Integrations */}
              <div className="p-6 rounded-2xl bg-white border border-gray-200 shadow-xs space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-base font-bold text-gray-900 flex items-center gap-1.5">
                      <Sparkles size={16} className="text-[#6701e6]" />
                      Third-Party CMS Embeds & Plugins
                    </h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Ready-to-copy code snippets & downloadable WordPress plugin for Shopify, WordPress, Webflow, Framer, and Notion.
                    </p>
                  </div>
                  <button
                    onClick={() => setShowCmsEmbedModal(true)}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-[#6701e6] hover:bg-[#5200bd] text-white transition-all shadow-md shadow-purple-500/20 whitespace-nowrap cursor-pointer"
                  >
                    Open CMS Installer →
                  </button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-2">
                  {['Shopify', 'WordPress', 'Webflow', 'Framer', 'Notion'].map((platform) => (
                    <div key={platform} className="p-2.5 rounded-xl bg-gray-50 border border-gray-200 text-center text-xs font-bold text-gray-700">
                      {platform}
                    </div>
                  ))}
                </div>
              </div>

              {/* Developer Documentation & Affiliates */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-6 rounded-2xl bg-purple-50/60 border border-purple-200 space-y-2">
                  <h3 className="text-sm font-bold text-[#6701e6] flex items-center gap-1.5">
                    📖 Developer API Reference
                  </h3>
                  <p className="text-xs text-gray-600">
                    Full REST API reference with OpenAPI 3.0 specification and code samples for Node.js, Python, and curl.
                  </p>
                  <a
                    href="/developers"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#6701e6] hover:underline pt-1"
                  >
                    Open API Console & Docs
                    <ExternalLink size={13} />
                  </a>
                </div>

                <div className="p-6 rounded-2xl bg-emerald-50/60 border border-emerald-200 space-y-2">
                  <h3 className="text-sm font-bold text-emerald-800 flex items-center gap-1.5">
                    🎁 Partner & Affiliate Program
                  </h3>
                  <p className="text-xs text-gray-600">
                    Earn 30% to 40% lifetime recurring commissions on every customer you refer to PandaPraise.
                  </p>
                  <a
                    href="/affiliates"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:underline pt-1"
                  >
                    View Affiliate Portal
                    <ExternalLink size={13} />
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* ── Security & Authentication ── */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              <div className="p-6 rounded-2xl bg-white border border-gray-200 shadow-xs space-y-4">
                <div className="flex items-center gap-2">
                  <Lock size={18} className="text-[#6701e6]" />
                  <h3 className="text-base font-bold text-gray-900">Account Credentials & Access</h3>
                </div>
                <p className="text-xs text-gray-500">
                  Manage your login credentials, authentication tokens, and account recovery options.
                </p>

                <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 space-y-3">
                  <div>
                    <label className="text-xs font-semibold text-gray-600">Authenticated Email</label>
                    <p className="text-sm font-bold text-gray-900 mt-0.5">{user?.email || 'N/A'}</p>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-gray-600">Authentication Method</label>
                    <p className="text-xs text-gray-700 mt-0.5">Firebase Secure Authentication (OAuth / Email Link)</p>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-gray-600">Active Session Status</label>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                      <span className="text-xs font-semibold text-emerald-700">Encrypted JWT Session Active</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-gray-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold text-gray-900">Password Reset Dispatch</p>
                    <p className="text-[11px] text-gray-500">Send an authorized password change token to your email</p>
                  </div>
                  <button
                    onClick={handleTriggerPasswordReset}
                    className="px-4 py-2 text-xs font-bold rounded-xl bg-white border border-gray-300 text-gray-800 hover:bg-gray-50 hover:border-gray-400 transition-colors shadow-2xs cursor-pointer"
                  >
                    Send Password Reset Link
                  </button>
                </div>

                {passwordResetSent && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-semibold text-emerald-800 flex items-center gap-2">
                    <Check size={14} className="text-emerald-600" />
                    Reset instructions have been dispatched to {user?.email}. Check your inbox!
                  </div>
                )}

                {passwordResetError && (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-semibold text-rose-800">
                    {passwordResetError}
                  </div>
                )}
              </div>

              {/* Data Protection & Compliance (GDPR Article 17, CCPA) */}
              <div className="p-6 rounded-2xl bg-white border border-gray-200 shadow-xs space-y-3">
                <h3 className="text-base font-bold text-gray-900">Privacy & Data Governance</h3>
                <p className="text-xs text-gray-500">
                  Panda Praise complies with global data privacy frameworks including GDPR (EU/UK) and CCPA (California).
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-200">
                    <p className="text-xs font-bold text-gray-900">GDPR Article 17 Compliant</p>
                    <p className="text-[11px] text-gray-500 mt-0.5">Automated hard deletion of customer reviews upon workspace purge.</p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-200">
                    <p className="text-xs font-bold text-gray-900">Sub-processor Encryption</p>
                    <p className="text-[11px] text-gray-500 mt-0.5">All customer avatars and video testimonials encrypted at rest via Cloudflare/Firebase.</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Third-Party CMS Embed Modal */}
      <CmsEmbedModal
        isOpen={showCmsEmbedModal}
        onClose={() => setShowCmsEmbedModal(false)}
        spaceSlug={project?.slug || 'demo'}
      />

      {/* GDPR Article 17 Account Deletion Confirmation Modal */}
      {showAccountDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-rose-200 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <div className="flex items-center gap-2 text-rose-700">
                <AlertTriangle size={20} />
                <h3 className="text-base font-bold text-gray-900">Delete Account & All Data</h3>
              </div>
              <button
                onClick={() => setShowAccountDeleteModal(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl space-y-2">
              <p className="text-xs font-bold text-rose-900">
                GDPR Article 17 — Irreversible Purge
              </p>
              <p className="text-xs text-rose-700/90 leading-relaxed">
                This action cannot be undone. All your workspaces, projects, collected testimonials, widgets, social integrations, and active Stripe subscriptions will be immediately and permanently deleted.
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-700 block">
                Type <span className="font-mono font-bold text-rose-600">DELETE</span> to confirm:
              </label>
              <input
                type="text"
                value={deleteConfirmationText}
                onChange={e => setDeleteConfirmationText(e.target.value)}
                placeholder="DELETE"
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-gray-300 font-mono focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
              />
            </div>

            {accountDeletionError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-semibold text-rose-800">
                {accountDeletionError}
              </div>
            )}

            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                onClick={() => setShowAccountDeleteModal(false)}
                disabled={isDeletingAccount}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleExecuteAccountDeletion}
                disabled={deleteConfirmationText !== 'DELETE' || isDeletingAccount}
                className="px-4 py-2 text-xs font-bold rounded-xl bg-rose-600 hover:bg-rose-700 text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-xs"
              >
                {isDeletingAccount ? 'Permanently Purging...' : 'Permanently Delete Account'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
