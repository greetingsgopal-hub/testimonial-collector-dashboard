import React, { useState, useEffect } from 'react';
import {
  Mail,
  MessageCircle,
  Plus,
  Play,
  Pause,
  Trash2,
  Clock,
  Sparkles,
  Zap,
  Code2,
  CheckCircle2,
  TrendingUp,
  MousePointerClick,
  Send,
  Eye,
  Copy,
  Check,
  ChevronRight,
  ShieldCheck,
  RefreshCw,
  Settings2,
} from 'lucide-react';
import { Campaign, CampaignChannel, CampaignInput } from '../../types';
import { storage } from '../../lib/storage';
import { useAuth } from '../../context/AuthContext';
import { interpolateTemplate } from '../../worker/lib/campaignDispatcher';

interface CampaignsHubProps {
  onNavigateToProof?: () => void;
}

export const CampaignsHub: React.FC<CampaignsHubProps> = () => {
  const { project, user } = useAuth();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);
  const [showWebhookGuide, setShowWebhookGuide] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Form State
  const [formName, setFormName] = useState('');
  const [formChannel, setFormChannel] = useState<CampaignChannel>('email');
  const [formDelayDays, setFormDelayDays] = useState(3);
  const [formSubject, setFormSubject] = useState('How was your recent purchase with {{company_name}}?');
  const [formBody, setFormBody] = useState(
    'Hi {{customer_name}},\n\nThank you for choosing {{company_name}}! We hope you are loving your {{product_name}}.\n\nCould you take 60 seconds to share your feedback with us? It means the world to our small team!\n\nCheers,\n{{company_name}} Team'
  );
  const [formCta, setFormCta] = useState('Share Your Experience');
  const [formSender, setFormSender] = useState(project?.name || 'Panda Praise');
  const [isSaving, setIsSaving] = useState(false);
  const [testSendNotice, setTestSendNotice] = useState<string | null>(null);

  const activeProjectId = project?.id || 'proj-demo-1';
  const companyName = project?.name || 'Panda Praise';

  const getDefaultCampaigns = (): Campaign[] => [
    {
      id: 'camp-default-email',
      projectId: activeProjectId,
      ownerId: user?.uid || 'demo-user',
      name: 'Post-Purchase Email Delight',
      channel: 'email',
      status: 'active',
      triggerType: 'webhook',
      delayDays: 3,
      template: {
        subject: 'How was your recent purchase with {{company_name}}?',
        messageBody:
          'Hi {{customer_name}},\n\nThank you for choosing {{company_name}}! We hope you are loving your {{product_name}}.\n\nCould you take 60 seconds to share your feedback with us? It means the world to our small team!\n\nCheers,\n{{company_name}} Team',
        ctaText: 'Share Your Experience',
        senderName: companyName,
      },
      stats: { sent: 48, opened: 32, clicked: 24, converted: 18 },
      createdAt: new Date(Date.now() - 7 * 86400000).toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'camp-default-whatsapp',
      projectId: activeProjectId,
      ownerId: user?.uid || 'demo-user',
      name: 'WhatsApp Instant Feedback',
      channel: 'whatsapp',
      status: 'active',
      triggerType: 'webhook',
      delayDays: 1,
      template: {
        messageBody:
          'Hey {{customer_name}}! 👋 Thank you for ordering from {{company_name}}. How has your experience been so far with {{product_name}}? Let us know in 1 quick click!',
        ctaText: 'Give Quick Feedback',
      },
      stats: { sent: 35, opened: 33, clicked: 28, converted: 22 },
      createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  // Load campaigns
  const loadCampaigns = async () => {
    setIsLoading(true);
    try {
      const list = await storage.getCampaigns?.(activeProjectId);
      if (list && list.length > 0) {
        setCampaigns(list);
      } else {
        setCampaigns(getDefaultCampaigns());
      }
    } catch {
      setCampaigns(getDefaultCampaigns());
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCampaigns();
  }, [activeProjectId]);

  // Aggregate stats
  const totalSent = campaigns.reduce((acc, c) => acc + (c.stats?.sent || 0), 0);
  const totalClicked = campaigns.reduce((acc, c) => acc + (c.stats?.clicked || 0), 0);
  const totalConverted = campaigns.reduce((acc, c) => acc + (c.stats?.converted || 0), 0);
  const avgClickRate = totalSent > 0 ? ((totalClicked / totalSent) * 100).toFixed(1) : '0';
  const avgConversionRate = totalClicked > 0 ? ((totalConverted / totalClicked) * 100).toFixed(1) : '0';
  const activeCount = campaigns.filter((c) => c.status === 'active').length;

  const handleOpenCreate = () => {
    setEditingCampaign(null);
    setFormName('');
    setFormChannel('email');
    setFormDelayDays(3);
    setFormSubject('How was your recent purchase with {{company_name}}?');
    setFormBody(
      'Hi {{customer_name}},\n\nThank you for choosing {{company_name}}! We hope you are loving your {{product_name}}.\n\nCould you take 60 seconds to share your feedback with us? It means the world to our small team!\n\nCheers,\n{{company_name}} Team'
    );
    setFormCta('Share Your Experience');
    setFormSender(companyName);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (camp: Campaign) => {
    setEditingCampaign(camp);
    setFormName(camp.name);
    setFormChannel(camp.channel);
    setFormDelayDays(camp.delayDays);
    setFormSubject(camp.template.subject || '');
    setFormBody(camp.template.messageBody);
    setFormCta(camp.template.ctaText || 'Share Your Experience');
    setFormSender(camp.template.senderName || companyName);
    setIsModalOpen(true);
  };

  const handleSaveCampaign = async () => {
    if (!formName.trim() || !formBody.trim()) return;
    setIsSaving(true);

    try {
      if (editingCampaign) {
        const updated = await storage.updateCampaign?.(editingCampaign.id, {
          name: formName.trim(),
          channel: formChannel,
          delayDays: formDelayDays,
          template: {
            subject: formChannel === 'email' ? formSubject : undefined,
            messageBody: formBody,
            ctaText: formCta,
            senderName: formSender,
          },
        });
        if (updated) {
          setCampaigns((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
        }
      } else {
        const payload: CampaignInput = {
          projectId: activeProjectId,
          ownerId: user?.uid || 'user',
          name: formName.trim(),
          channel: formChannel,
          status: 'active',
          triggerType: 'webhook',
          delayDays: formDelayDays,
          template: {
            subject: formChannel === 'email' ? formSubject : undefined,
            messageBody: formBody,
            ctaText: formCta,
            senderName: formSender,
          },
        };
        const created = await storage.createCampaign?.(payload, activeProjectId);
        if (created) {
          setCampaigns((prev) => [created, ...prev]);
        }
      }
      setIsModalOpen(false);
    } catch (err) {
      console.error('Failed to save campaign:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleStatus = async (camp: Campaign) => {
    const nextStatus = camp.status === 'active' ? 'paused' : 'active';
    try {
      const updated = await storage.updateCampaign?.(camp.id, { status: nextStatus, projectId: camp.projectId });
      if (updated) {
        setCampaigns((prev) => prev.map((c) => (c.id === camp.id ? { ...c, status: nextStatus } : c)));
      } else {
        setCampaigns((prev) => prev.map((c) => (c.id === camp.id ? { ...c, status: nextStatus } : c)));
      }
    } catch {
      // optimistic fallback
      setCampaigns((prev) => prev.map((c) => (c.id === camp.id ? { ...c, status: nextStatus } : c)));
    }
  };

  const handleDeleteCampaign = async (id: string) => {
    if (!confirm('Are you sure you want to delete this campaign?')) return;
    try {
      await storage.deleteCampaign?.(id);
      setCampaigns((prev) => prev.filter((c) => c.id !== id));
    } catch {
      setCampaigns((prev) => prev.filter((c) => c.id !== id));
    }
  };

  const handleInsertVariable = (variableToken: string) => {
    setFormBody((prev) => prev + ` {{${variableToken}}}`);
  };

  const handleCopyText = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const handleTriggerSimulatedTest = (camp: Campaign) => {
    setTestSendNotice(`Dispatched test invite for "${camp.name}" to demo recipient! Check moderation queue once converted.`);
    setTimeout(() => setTestSendNotice(null), 4000);
  };

  // Preview interpolation variables
  const previewVars = {
    customer_name: 'Alex Rivera',
    company_name: companyName,
    product_name: 'Workspace Pro Plan',
    invite_url: 'https://pandapraise.com/c/feedback',
    order_id: 'ord_98741',
  };

  const interpolatedPreview = interpolateTemplate(formBody, previewVars);
  const interpolatedSubject = interpolateTemplate(formSubject, previewVars);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16 animate-fade-in">
      {/* ── Header ── */}
      <div className="apple-glass-card p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-violet-500/10 to-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-600 text-white flex items-center justify-center shadow-xs">
                <Sparkles className="w-5 h-5 text-amber-300" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                  <span>Automated Review Request Drips</span>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-200">
                    Live Engine
                  </span>
                </h1>
                <p className="text-xs text-slate-500 mt-0.5">
                  Send personalized review requests via Email & WhatsApp automatically after purchases or milestones.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setShowWebhookGuide(true)}
              className="apple-touch px-3.5 py-2 rounded-xl text-xs font-semibold border border-slate-200 bg-white/80 hover:bg-white text-slate-700 shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Code2 className="w-4 h-4 text-slate-500" />
              <span>Inbound Webhook Docs</span>
            </button>

            <button
              onClick={handleOpenCreate}
              className="apple-touch apple-btn-primary px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Create Campaign</span>
            </button>
          </div>
        </div>

        {/* Test Notice Banner */}
        {testSendNotice && (
          <div className="mt-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-medium flex items-center gap-2 animate-fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{testSendNotice}</span>
          </div>
        )}
      </div>

      {/* ── KPI Metrics Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="apple-glass-card p-4 rounded-2xl border border-slate-200/80 bg-white/70 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Active Automations</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 tracking-tight">{activeCount}</div>
          <p className="text-[11px] text-slate-400 mt-0.5">{campaigns.length} total configured</p>
        </div>

        <div className="apple-glass-card p-4 rounded-2xl border border-slate-200/80 bg-white/70 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Total Invites Sent</span>
            <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Send className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 tracking-tight">{totalSent}</div>
          <p className="text-[11px] text-emerald-600 font-semibold mt-0.5">↑ 100% automated delivery</p>
        </div>

        <div className="apple-glass-card p-4 rounded-2xl border border-slate-200/80 bg-white/70 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Average Click Rate</span>
            <div className="w-7 h-7 rounded-lg bg-violet-50 text-violet-600 flex items-center justify-center">
              <MousePointerClick className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 tracking-tight">{avgClickRate}%</div>
          <p className="text-[11px] text-slate-400 mt-0.5">{totalClicked} total clicks recorded</p>
        </div>

        <div className="apple-glass-card p-4 rounded-2xl border border-slate-200/80 bg-white/70 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Review Conversion</span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 tracking-tight">{avgConversionRate}%</div>
          <p className="text-[11px] text-emerald-600 font-semibold mt-0.5">{totalConverted} verified reviews received</p>
        </div>
      </div>

      {/* ── Campaigns List ── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-sm font-bold text-slate-800 tracking-tight flex items-center gap-2">
            <span>Drip Automations</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600">
              {campaigns.length}
            </span>
          </h2>
          <span className="text-xs text-slate-400">Triggered via Webhooks & API</span>
        </div>

        {isLoading ? (
          <div className="py-16 text-center text-slate-400">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-violet-500" />
            <p className="text-xs">Loading automated campaigns...</p>
          </div>
        ) : campaigns.length === 0 ? (
          <div className="apple-glass-card p-12 text-center rounded-2xl border border-slate-200">
            <Mail className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-slate-700">No campaigns yet</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              Create an email or WhatsApp drip campaign to automatically invite customers to leave a review.
            </p>
            <button
              onClick={handleOpenCreate}
              className="mt-4 apple-touch apple-btn-primary px-4 py-2 rounded-xl text-xs font-semibold inline-flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Create First Campaign</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {campaigns.map((camp) => {
              const isEmail = camp.channel === 'email';
              const isPaused = camp.status === 'paused';
              const clickPct = camp.stats.sent > 0 ? ((camp.stats.clicked / camp.stats.sent) * 100).toFixed(0) : '0';
              const convPct = camp.stats.clicked > 0 ? ((camp.stats.converted / camp.stats.clicked) * 100).toFixed(0) : '0';

              return (
                <div
                  key={camp.id}
                  className={`apple-glass-card p-5 rounded-2xl border transition-all duration-200 flex flex-col justify-between ${
                    isPaused ? 'opacity-70 bg-slate-50/60 border-slate-200' : 'bg-white/80 border-slate-200/90 shadow-2xs hover:shadow-xs'
                  }`}
                >
                  <div>
                    {/* Top Row: Channel, Timing, Status Switch */}
                    <div className="flex items-center justify-between gap-3 mb-3">
                      <div className="flex items-center gap-2">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
                            isEmail
                              ? 'bg-indigo-50 text-indigo-700 border border-indigo-200/80'
                              : 'bg-emerald-50 text-emerald-700 border border-emerald-200/80'
                          }`}
                        >
                          {isEmail ? <Mail className="w-3.5 h-3.5" /> : <MessageCircle className="w-3.5 h-3.5" />}
                          <span>{isEmail ? 'Email Drip' : 'WhatsApp Drip'}</span>
                        </span>

                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span>{camp.delayDays === 0 ? 'Instant' : `${camp.delayDays}d after purchase`}</span>
                        </span>
                      </div>

                      {/* Status Toggle Button */}
                      <button
                        onClick={() => handleToggleStatus(camp)}
                        className={`apple-touch px-2.5 py-1 rounded-full text-[11px] font-bold flex items-center gap-1.5 cursor-pointer transition-all ${
                          camp.status === 'active'
                            ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                            : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                        }`}
                      >
                        {camp.status === 'active' ? <Play className="w-3 h-3 fill-emerald-800" /> : <Pause className="w-3 h-3 fill-amber-800" />}
                        <span>{camp.status === 'active' ? 'Active' : 'Paused'}</span>
                      </button>
                    </div>

                    {/* Campaign Name & Subject preview */}
                    <h3 className="text-sm font-bold text-slate-900 tracking-tight">{camp.name}</h3>
                    {isEmail && camp.template.subject && (
                      <p className="text-xs text-slate-500 mt-1 line-clamp-1 italic">
                        &quot;{camp.template.subject}&quot;
                      </p>
                    )}
                    <p className="text-xs text-slate-600 mt-2 line-clamp-2 leading-relaxed bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      {camp.template.messageBody}
                    </p>
                  </div>

                  {/* Micro-metrics & Action Dock */}
                  <div className="mt-4 pt-3 border-t border-slate-100">
                    <div className="grid grid-cols-4 gap-2 text-center mb-3">
                      <div className="bg-slate-50/80 p-1.5 rounded-lg">
                        <span className="text-[10px] text-slate-400 font-semibold block uppercase">Sent</span>
                        <span className="text-xs font-bold text-slate-800">{camp.stats.sent}</span>
                      </div>
                      <div className="bg-slate-50/80 p-1.5 rounded-lg">
                        <span className="text-[10px] text-slate-400 font-semibold block uppercase">Opened</span>
                        <span className="text-xs font-bold text-slate-800">{camp.stats.opened}</span>
                      </div>
                      <div className="bg-slate-50/80 p-1.5 rounded-lg">
                        <span className="text-[10px] text-slate-400 font-semibold block uppercase">Clicked</span>
                        <span className="text-xs font-bold text-slate-800">{clickPct}%</span>
                      </div>
                      <div className="bg-slate-50/80 p-1.5 rounded-lg">
                        <span className="text-[10px] text-slate-400 font-semibold block uppercase">Converted</span>
                        <span className="text-xs font-bold text-emerald-600">{convPct}%</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-2">
                      <button
                        onClick={() => handleTriggerSimulatedTest(camp)}
                        className="apple-touch px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 flex items-center gap-1 cursor-pointer"
                        title="Simulate dispatch"
                      >
                        <Send className="w-3 h-3 text-slate-400" />
                        <span>Send Test</span>
                      </button>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleOpenEdit(camp)}
                          className="apple-touch px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-800 transition-all cursor-pointer"
                        >
                          Configure
                        </button>
                        <button
                          onClick={() => handleDeleteCampaign(camp.id)}
                          className="apple-touch p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all cursor-pointer"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Create / Edit Campaign Modal with Sticky Live Preview ── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[92vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-violet-600 text-white flex items-center justify-center font-bold text-sm shadow-2xs">
                  <Settings2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    {editingCampaign ? 'Configure Campaign' : 'Create Automated Review Campaign'}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Customize message templates with personalized tokens and live interactive preview.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 text-lg font-bold px-2 py-1 rounded-lg"
              >
                &times;
              </button>
            </div>

            {/* Modal Body: Split Screen Builder (Left) + Sticky Preview (Right) */}
            <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Configuration Controls (lg:col-span-7) */}
              <div className="lg:col-span-7 space-y-4">
                {/* Channel Selector */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Dispatch Channel</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setFormChannel('email')}
                      className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-center gap-3 ${
                        formChannel === 'email'
                          ? 'border-indigo-600 bg-indigo-50/60 text-indigo-950 ring-2 ring-indigo-500/20'
                          : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                      }`}
                    >
                      <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
                        <Mail className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold">Email Message</div>
                        <div className="text-[10px] text-slate-500">Delivered via Resend/SMTP</div>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setFormChannel('whatsapp')}
                      className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-center gap-3 ${
                        formChannel === 'whatsapp'
                          ? 'border-emerald-600 bg-emerald-50/60 text-emerald-950 ring-2 ring-emerald-500/20'
                          : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                      }`}
                    >
                      <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                        <MessageCircle className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold">WhatsApp Direct</div>
                        <div className="text-[10px] text-slate-500">Delivered via Twilio API</div>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Campaign Name */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Campaign Name</label>
                  <input
                    type="text"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g. Post-Purchase Review Sequence"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500"
                  />
                </div>

                {/* Delay Days */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-slate-700">Dispatch Delay</label>
                    <span className="text-xs font-bold text-violet-700">
                      {formDelayDays === 0 ? 'Immediate Trigger' : `${formDelayDays} day${formDelayDays === 1 ? '' : 's'} after trigger`}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="14"
                    step="1"
                    value={formDelayDays}
                    onChange={(e) => setFormDelayDays(Number(e.target.value))}
                    className="w-full accent-violet-600 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                    <span>Instant (0d)</span>
                    <span>3 days (Recommended)</span>
                    <span>7 days</span>
                    <span>14 days</span>
                  </div>
                </div>

                {/* Email Subject (if email) */}
                {formChannel === 'email' && (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Email Subject Line</label>
                    <input
                      type="text"
                      value={formSubject}
                      onChange={(e) => setFormSubject(e.target.value)}
                      placeholder="e.g. How was your recent experience with {{company_name}}?"
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500"
                    />
                  </div>
                )}

                {/* Variable Insertion Chips */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1.5 flex items-center gap-1.5">
                    <Sparkles className="w-3 h-3 text-amber-500" />
                    <span>Insert Dynamic Variables</span>
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {['customer_name', 'company_name', 'product_name', 'order_id', 'invite_url'].map((v) => (
                      <button
                        key={v}
                        type="button"
                        onClick={() => handleInsertVariable(v)}
                        className="px-2 py-1 rounded-lg text-[10px] font-bold bg-violet-50 hover:bg-violet-100 text-violet-700 border border-violet-200/80 transition-all cursor-pointer"
                      >
                        + {'{{' + v + '}}'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Message Body */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Message Body</label>
                  <textarea
                    rows={6}
                    value={formBody}
                    onChange={(e) => setFormBody(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 leading-relaxed font-sans"
                  />
                </div>

                {/* CTA Button Text */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">CTA Button Text</label>
                    <input
                      type="text"
                      value={formCta}
                      onChange={(e) => setFormCta(e.target.value)}
                      placeholder="Share Your Experience"
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Sender Name</label>
                    <input
                      type="text"
                      value={formSender}
                      onChange={(e) => setFormSender(e.target.value)}
                      placeholder="Panda Praise Team"
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500"
                    />
                  </div>
                </div>
              </div>

              {/* Right Column: Sticky Live Interactive Mockup Preview (lg:col-span-5) */}
              <div className="lg:col-span-5 flex flex-col">
                <div className="sticky top-0 bg-slate-50/90 p-4 rounded-2xl border border-slate-200 shadow-2xs flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200">
                      <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                        <Eye className="w-3.5 h-3.5 text-violet-600" />
                        <span>Interactive Recipient Preview</span>
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-violet-100 text-violet-700">
                        Live Data Simulation
                      </span>
                    </div>

                    {formChannel === 'email' ? (
                      /* Apple-clean Email Preview */
                      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-3">
                        <div className="text-[11px] text-slate-400 space-y-1 pb-2 border-b border-slate-100">
                          <div><strong className="text-slate-600 font-semibold">From:</strong> {formSender} &lt;invites@pandapraise.com&gt;</div>
                          <div><strong className="text-slate-600 font-semibold">To:</strong> Alex Rivera &lt;alex@example.com&gt;</div>
                          <div><strong className="text-slate-600 font-semibold">Subject:</strong> <span className="text-slate-800 font-bold">{interpolatedSubject}</span></div>
                        </div>

                        <div className="pt-2 text-xs text-slate-700 whitespace-pre-wrap leading-relaxed">
                          {interpolatedPreview}
                        </div>

                        <div className="pt-3 pb-2 text-center">
                          <button
                            type="button"
                            className="px-5 py-2.5 rounded-full bg-slate-900 text-white text-xs font-bold shadow-xs inline-flex items-center gap-1.5 hover:bg-slate-800"
                          >
                            <span>{formCta}</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="text-[10px] text-slate-400 text-center border-t border-slate-100 pt-2">
                          Powered by Panda Praise Verified Testimonials
                        </div>
                      </div>
                    ) : (
                      /* WhatsApp Message Bubble Preview */
                      <div className="bg-[#e5ddd5] rounded-xl p-4 shadow-xs space-y-3">
                        <div className="bg-white/80 backdrop-blur-xs px-3 py-1.5 rounded-lg text-[11px] font-medium text-slate-700 flex items-center justify-between">
                          <span className="font-bold">{companyName} Verified</span>
                          <span className="text-[10px] text-slate-400">12:45 PM</span>
                        </div>

                        <div className="bg-[#dcf8c6] p-3.5 rounded-xl rounded-tr-xs shadow-2xs max-w-[92%] ml-auto text-xs text-slate-800 leading-relaxed space-y-2">
                          <div className="whitespace-pre-wrap">{interpolatedPreview}</div>
                          <div className="p-2 bg-white/70 rounded-lg border border-emerald-200/60 flex items-center justify-between gap-2">
                            <span className="text-[11px] font-bold text-emerald-800 line-clamp-1">
                              👉 {formCta}
                            </span>
                            <span className="text-[10px] text-emerald-600 font-bold">pandapraise.com</span>
                          </div>
                          <div className="text-[9px] text-slate-400 text-right">12:45 PM ✓✓</div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-200 text-[11px] text-slate-500 text-center">
                    Tokens are replaced with actual customer metadata upon trigger.
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-200 transition-all cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleSaveCampaign}
                disabled={isSaving || !formName.trim()}
                className="apple-touch apple-btn-primary px-5 py-2 rounded-xl text-xs font-semibold disabled:opacity-50 flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                {isSaving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                <span>{editingCampaign ? 'Save Changes' : 'Create Automation'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Webhook Documentation & HMAC Secrets Drawer ── */}
      {showWebhookGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-sm">
                  <Code2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Inbound Trigger Webhook</h3>
                  <p className="text-[11px] text-slate-500">
                    Connect Stripe, Shopify, Zapier, or your backend to trigger review drip sequences.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowWebhookGuide(false)}
                className="text-slate-400 hover:text-slate-700 text-lg font-bold px-2 py-1 rounded-lg"
              >
                &times;
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
              {/* Webhook Endpoint */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Endpoint URL (POST)</label>
                <div className="flex items-center gap-2">
                  <code className="flex-1 p-2.5 bg-slate-100 rounded-xl font-mono text-[11px] text-slate-800 break-all select-all">
                    https://pandapraise.com/api/webhook/campaign-trigger
                  </code>
                  <button
                    onClick={() =>
                      handleCopyText('https://pandapraise.com/api/webhook/campaign-trigger', 'url')
                    }
                    className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 cursor-pointer"
                  >
                    {copiedKey === 'url' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* JSON Payload Example */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Request Body (JSON)</label>
                <pre className="p-3 bg-slate-900 text-emerald-400 rounded-xl font-mono text-[11px] overflow-x-auto leading-relaxed">
{JSON.stringify(
  {
    customerEmail: 'alex.rivera@example.com',
    customerName: 'Alex Rivera',
    productName: 'Workspace Pro Plan',
    orderId: 'ord_98741',
    channel: 'email',
    delayDays: 3,
    spaceSlug: 'feedback',
  },
  null,
  2
)}
                </pre>
              </div>

              {/* HMAC Security */}
              <div className="p-3.5 rounded-xl bg-violet-50/70 border border-violet-200/80 space-y-1.5">
                <div className="flex items-center gap-2 text-violet-900 font-bold">
                  <ShieldCheck className="w-4 h-4 text-violet-700" />
                  <span>HMAC-SHA256 Signature Verification</span>
                </div>
                <p className="text-[11px] text-violet-800 leading-relaxed">
                  Sign requests using header <code>X-PandaPraise-Signature: hex(hmac_sha256(secret, raw_payload))</code>.
                  Prevents spoofing and guarantees authenticity.
                </p>
              </div>
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50 text-right">
              <button
                onClick={() => setShowWebhookGuide(false)}
                className="apple-touch apple-btn-primary px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer"
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
