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
  Send,
  Eye,
  Copy,
  Check,
  ChevronRight,
  ShieldCheck,
  RefreshCw,
  Settings2,
  X,
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

  const handleToggleStatus = async (camp: Campaign) => {
    const nextStatus: Campaign['status'] = camp.status === 'active' ? 'paused' : 'active';
    const updated: Campaign = { ...camp, status: nextStatus, updatedAt: new Date().toISOString() };
    setCampaigns((prev) => prev.map((c) => (c.id === camp.id ? updated : c)));
    try {
      await storage.updateCampaign?.(camp.id, updated);
    } catch {
      // rollback if failed
      setCampaigns((prev) => prev.map((c) => (c.id === camp.id ? camp : c)));
    }
  };

  const handleDeleteCampaign = async (id: string) => {
    if (!confirm('Are you sure you want to delete this automated review campaign?')) return;
    setCampaigns((prev) => prev.filter((c) => c.id !== id));
    try {
      await storage.deleteCampaign?.(id);
    } catch (err) {
      console.error('Delete campaign failed', err);
      loadCampaigns();
    }
  };

  const handleSaveCampaign = async () => {
    if (!formName.trim()) return;
    setIsSaving(true);
    try {
      if (editingCampaign) {
        const updated: Campaign = {
          ...editingCampaign,
          name: formName.trim(),
          channel: formChannel,
          delayDays: formDelayDays,
          template: {
            subject: formChannel === 'email' ? formSubject : undefined,
            messageBody: formBody,
            ctaText: formCta,
            senderName: formChannel === 'email' ? formSender : undefined,
          },
          updatedAt: new Date().toISOString(),
        };
        await storage.updateCampaign?.(editingCampaign.id, updated);
        setCampaigns((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
      } else {
        const input: CampaignInput = {
          projectId: activeProjectId,
          ownerId: user?.uid || 'demo-user',
          name: formName.trim(),
          channel: formChannel,
          status: 'active',
          triggerType: 'webhook',
          delayDays: formDelayDays,
          template: {
            subject: formChannel === 'email' ? formSubject : undefined,
            messageBody: formBody,
            ctaText: formCta,
            senderName: formChannel === 'email' ? formSender : undefined,
          },
        };
        const created = await storage.createCampaign?.(input);
        if (created) {
          setCampaigns((prev) => [created, ...prev]);
        } else {
          // Local fallback
          const localNew: Campaign = {
            ...input,
            id: `camp-${Date.now()}`,
            stats: { sent: 0, opened: 0, clicked: 0, converted: 0 },
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          setCampaigns((prev) => [localNew, ...prev]);
        }
      }
      setIsModalOpen(false);
    } catch (err) {
      console.error('Save campaign failed', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleTriggerSimulatedTest = async (camp: Campaign) => {
    setTestSendNotice(`Dispatched simulated test for "${camp.name}" to your account email!`);
    setTimeout(() => setTestSendNotice(null), 4000);
  };

  const handleCopyText = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleInsertVariable = (varName: string) => {
    setFormBody((prev) => `${prev} {{${varName}}}`);
  };

  const previewVars = {
    customer_name: 'Alex Rivera',
    company_name: companyName,
    product_name: 'Workspace Pro Plan',
    order_id: 'ord_98741',
  };

  const interpolatedPreview = interpolateTemplate(formBody, previewVars);
  const interpolatedSubject = interpolateTemplate(formSubject, previewVars);

  return (
    <div className="space-y-6 max-w-5xl mx-auto font-sans pb-16">
      
      {/* ── 1. Top White Hero Card ── */}
      <div className="rounded-2xl sm:rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-5 sm:p-6 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-2xl bg-purple-50 dark:bg-purple-950/60 border border-purple-200/70 dark:border-purple-800 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0 shadow-2xs">
            <Sparkles className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight font-display">
                Automated Review Request Drips
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800">
                Live Engine
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Send personalized review requests via Email & WhatsApp automatically after purchases or milestones.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setShowWebhookGuide(true)}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold border border-slate-200/80 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Code2 className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <span>Inbound Webhook Docs</span>
          </button>

          <button
            type="button"
            onClick={handleOpenCreate}
            className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-all shadow-2xs active:scale-95 flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Create Campaign</span>
          </button>
        </div>
      </div>

      {/* Test Notice Banner */}
      {testSendNotice && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 text-xs font-medium flex items-center gap-2.5 shadow-2xs animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{testSendNotice}</span>
        </div>
      )}

      {/* ── 2. Four Equal White Metric Cards in a Single Horizontal Row ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Active Automations */}
        <div className="rounded-2xl sm:rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-5 shadow-2xs flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Active Automations
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            {activeCount}
          </div>
          <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">
            {campaigns.length} total configured
          </p>
        </div>

        {/* Card 2: Total Invites Sent */}
        <div className="rounded-2xl sm:rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-5 shadow-2xs flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Total Invites Sent
            </span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
              <Send className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            {totalSent}
          </div>
          <p className="text-xs text-emerald-600 dark:text-emerald-400 font-bold">
            ↑ 100% automated delivery
          </p>
        </div>

        {/* Card 3: Average Click Rate */}
        <div className="rounded-2xl sm:rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-5 shadow-2xs flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Average Click Rate
            </span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            {avgClickRate}%
          </div>
          <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">
            {totalClicked} total clicks recorded
          </p>
        </div>

        {/* Card 4: Review Conversion */}
        <div className="rounded-2xl sm:rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-5 shadow-2xs flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Review Conversion
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            {avgConversionRate}%
          </div>
          <p className="text-xs text-emerald-600 dark:text-emerald-400 font-bold">
            {totalConverted} verified reviews received
          </p>
        </div>
      </div>

      {/* ── 3. Section Header ── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">
              Drip Automations
            </h2>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200/80 dark:border-purple-800">
              {campaigns.length}
            </span>
          </div>
          <span className="text-xs text-slate-400 font-medium">Triggered via Webhooks & API</span>
        </div>

        {isLoading ? (
          <div className="py-16 text-center text-slate-400 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-2xs">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-purple-600" />
            <p className="text-xs font-semibold">Loading automated campaigns...</p>
          </div>
        ) : campaigns.length === 0 ? (
          <div className="rounded-2xl sm:rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-12 text-center shadow-2xs space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-purple-50 dark:bg-purple-950/60 border border-purple-200/70 dark:border-purple-800 text-purple-600 dark:text-purple-400 flex items-center justify-center mx-auto mb-3 shadow-2xs">
              <Mail className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">No campaigns yet</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto leading-relaxed">
              Create an email or WhatsApp drip campaign to automatically invite customers to leave a review.
            </p>
            <button
              onClick={handleOpenCreate}
              className="mt-2 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-all shadow-2xs active:scale-95 inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Create First Campaign</span>
            </button>
          </div>
        ) : (
          /* ── 4. Two Equal Automation Cards Side-by-Side ── */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {campaigns.map((camp) => {
              const isEmail = camp.channel === 'email';
              const isPaused = camp.status === 'paused';
              const clickPct = camp.stats.sent > 0 ? ((camp.stats.clicked / camp.stats.sent) * 100).toFixed(0) : '0';
              const convPct = camp.stats.clicked > 0 ? ((camp.stats.converted / camp.stats.clicked) * 100).toFixed(0) : '0';

              return (
                <div
                  key={camp.id}
                  className={`rounded-2xl sm:rounded-3xl bg-white dark:bg-slate-900 border transition-all flex flex-col justify-between space-y-4 p-5 sm:p-6 shadow-2xs ${
                    isPaused
                      ? 'opacity-70 border-slate-200/60 dark:border-slate-800/60'
                      : 'border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="space-y-3">
                    {/* Top Row: Channel Pill, Timing Pill, Status Toggle */}
                    <div className="flex items-center justify-between gap-3 flex-wrap">
                      <div className="flex items-center gap-2">
                        {isEmail ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200/80 dark:border-purple-800">
                            <Mail className="w-3.5 h-3.5" />
                            <span>Email Drip</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200/80 dark:border-teal-800">
                            <MessageCircle className="w-3.5 h-3.5" />
                            <span>WhatsApp Drip</span>
                          </span>
                        )}

                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500 dark:text-slate-400 bg-slate-100/80 dark:bg-slate-800 px-2.5 py-0.5 rounded-full">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span>{camp.delayDays === 0 ? 'Instant' : `${camp.delayDays}d after purchase`}</span>
                        </span>
                      </div>

                      {/* Status Toggle Button */}
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(camp)}
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer border ${
                          camp.status === 'active'
                            ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200/80 dark:border-emerald-800 hover:bg-emerald-100'
                            : 'bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-200/80 dark:border-amber-800 hover:bg-amber-100'
                        }`}
                      >
                        {camp.status === 'active' ? (
                          <Play className="w-2.5 h-2.5 fill-emerald-700 dark:fill-emerald-300" />
                        ) : (
                          <Pause className="w-2.5 h-2.5 fill-amber-700 dark:fill-amber-300" />
                        )}
                        <span>{camp.status === 'active' ? 'Active' : 'Paused'}</span>
                      </button>
                    </div>

                    {/* Campaign Title */}
                    <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight truncate">
                      {camp.name}
                    </h3>

                    {/* Preview of Email Subject & Body (Soft Gray Box) */}
                    <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-3.5 border border-slate-100 dark:border-slate-800 space-y-1">
                      {isEmail && camp.template.subject && (
                        <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                          "{camp.template.subject}"
                        </p>
                      )}
                      <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                        {camp.template.messageBody}
                      </p>
                    </div>
                  </div>

                  {/* Four Mini-Stats Row & Action Dock */}
                  <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800/80">
                    <div className="grid grid-cols-4 gap-2 text-center">
                      <div className="bg-slate-50 dark:bg-slate-800/50 py-2 px-1 rounded-xl border border-slate-100 dark:border-slate-800">
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold block uppercase tracking-wider">
                          SENT
                        </span>
                        <span className="text-xs font-black text-slate-800 dark:text-white">
                          {camp.stats.sent}
                        </span>
                      </div>
                      <div className="bg-slate-50 dark:bg-slate-800/50 py-2 px-1 rounded-xl border border-slate-100 dark:border-slate-800">
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold block uppercase tracking-wider">
                          OPENED
                        </span>
                        <span className="text-xs font-black text-slate-800 dark:text-white">
                          {camp.stats.opened}
                        </span>
                      </div>
                      <div className="bg-slate-50 dark:bg-slate-800/50 py-2 px-1 rounded-xl border border-slate-100 dark:border-slate-800">
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold block uppercase tracking-wider">
                          CLICKED
                        </span>
                        <span className="text-xs font-black text-slate-800 dark:text-white">
                          {clickPct}%
                        </span>
                      </div>
                      <div className="bg-slate-50 dark:bg-slate-800/50 py-2 px-1 rounded-xl border border-slate-100 dark:border-slate-800">
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold block uppercase tracking-wider">
                          CONVERTED
                        </span>
                        <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">
                          {convPct}%
                        </span>
                      </div>
                    </div>

                    {/* Bottom Actions Row: Send Test + Configure + Trash */}
                    <div className="flex items-center justify-between gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => handleTriggerSimulatedTest(camp)}
                        className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700 flex items-center gap-1.5 cursor-pointer shadow-2xs transition-all"
                        title="Simulate dispatch"
                      >
                        <Send className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                        <span>Send Test</span>
                      </button>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(camp)}
                          className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 transition-all cursor-pointer shadow-2xs"
                        >
                          Configure
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteCampaign(camp.id)}
                          className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-all cursor-pointer"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fade-in font-sans">
          <div className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200/80 dark:border-slate-800 w-full max-w-4xl max-h-[92vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950/60 border border-purple-200/70 dark:border-purple-800 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold text-sm shadow-2xs">
                  <Settings2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                    {editingCampaign ? 'Configure Campaign' : 'Create Automated Review Campaign'}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Customize message templates with personalized tokens and live interactive preview.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body: Split Screen Builder (Left) + Sticky Preview (Right) */}
            <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Configuration Controls (lg:col-span-7) */}
              <div className="lg:col-span-7 space-y-4">
                {/* Channel Selector */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Dispatch Channel
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setFormChannel('email')}
                      className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex items-center gap-3 ${
                        formChannel === 'email'
                          ? 'border-purple-600 bg-purple-50/50 dark:bg-purple-950/20 text-purple-950 dark:text-purple-200 ring-2 ring-purple-500/20 shadow-2xs'
                          : 'border-slate-200/80 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      <div className="w-8 h-8 rounded-xl bg-purple-100 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300 flex items-center justify-center shrink-0">
                        <Mail className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold">Email Message</div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400">Delivered via Resend/SMTP</div>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setFormChannel('whatsapp')}
                      className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex items-center gap-3 ${
                        formChannel === 'whatsapp'
                          ? 'border-teal-600 bg-teal-50/50 dark:bg-teal-950/20 text-teal-950 dark:text-teal-200 ring-2 ring-teal-500/20 shadow-2xs'
                          : 'border-slate-200/80 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      <div className="w-8 h-8 rounded-xl bg-teal-100 dark:bg-teal-900/60 text-teal-700 dark:text-teal-300 flex items-center justify-center shrink-0">
                        <MessageCircle className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold">WhatsApp Direct</div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400">Delivered via Twilio API</div>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Campaign Name */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Campaign Name
                  </label>
                  <input
                    type="text"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g. Post-Purchase Review Sequence"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200/80 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 shadow-2xs"
                  />
                </div>

                {/* Delay Days */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Dispatch Delay
                    </label>
                    <span className="text-xs font-bold text-purple-600 dark:text-purple-400">
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
                    className="w-full accent-purple-600 cursor-pointer"
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
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Email Subject Line
                    </label>
                    <input
                      type="text"
                      value={formSubject}
                      onChange={(e) => setFormSubject(e.target.value)}
                      placeholder="e.g. How was your recent experience with {{company_name}}?"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200/80 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 shadow-2xs"
                    />
                  </div>
                )}

                {/* Variable Insertion Chips */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1.5 flex items-center gap-1.5">
                    <Sparkles className="w-3 h-3 text-amber-500" />
                    <span>Insert Dynamic Variables</span>
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {['customer_name', 'company_name', 'product_name', 'order_id', 'invite_url'].map((v) => (
                      <button
                        key={v}
                        type="button"
                        onClick={() => handleInsertVariable(v)}
                        className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-purple-50 dark:bg-purple-950/60 hover:bg-purple-100 dark:hover:bg-purple-900/60 text-purple-700 dark:text-purple-300 border border-purple-200/80 dark:border-purple-800 transition-all cursor-pointer shadow-2xs"
                      >
                        + {'{{' + v + '}}'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Message Body */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Message Body
                  </label>
                  <textarea
                    rows={6}
                    value={formBody}
                    onChange={(e) => setFormBody(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200/80 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 leading-relaxed font-sans shadow-2xs"
                  />
                </div>

                {/* CTA Button Text */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      CTA Button Text
                    </label>
                    <input
                      type="text"
                      value={formCta}
                      onChange={(e) => setFormCta(e.target.value)}
                      placeholder="Share Your Experience"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200/80 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 shadow-2xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Sender Name
                    </label>
                    <input
                      type="text"
                      value={formSender}
                      onChange={(e) => setFormSender(e.target.value)}
                      placeholder="Panda Praise Team"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200/80 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 shadow-2xs"
                    />
                  </div>
                </div>
              </div>

              {/* Right Column: Sticky Live Interactive Mockup Preview (lg:col-span-5) */}
              <div className="lg:col-span-5 flex flex-col">
                <div className="sticky top-0 bg-slate-50/90 dark:bg-slate-800/60 p-4 rounded-2xl sm:rounded-3xl border border-slate-200/80 dark:border-slate-700 shadow-2xs flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200 dark:border-slate-700">
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                        <Eye className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                        <span>Interactive Recipient Preview</span>
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-purple-100 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300">
                        Live Data Simulation
                      </span>
                    </div>

                    {formChannel === 'email' ? (
                      /* Clean Email Preview */
                      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-700 p-4 shadow-2xs space-y-3">
                        <div className="text-[11px] text-slate-400 space-y-1 pb-2 border-b border-slate-100 dark:border-slate-800">
                          <div>
                            <strong className="text-slate-600 dark:text-slate-300 font-semibold">From:</strong> {formSender} &lt;invites@pandapraise.com&gt;
                          </div>
                          <div>
                            <strong className="text-slate-600 dark:text-slate-300 font-semibold">To:</strong> Alex Rivera &lt;alex@example.com&gt;
                          </div>
                          <div>
                            <strong className="text-slate-600 dark:text-slate-300 font-semibold">Subject:</strong>{' '}
                            <span className="text-slate-800 dark:text-white font-bold">{interpolatedSubject}</span>
                          </div>
                        </div>

                        <div className="pt-2 text-xs text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
                          {interpolatedPreview}
                        </div>

                        <div className="pt-3 pb-2 text-center">
                          <button
                            type="button"
                            className="px-5 py-2.5 rounded-full bg-slate-900 hover:bg-black text-white text-xs font-bold shadow-xs inline-flex items-center gap-1.5 transition-all"
                          >
                            <span>{formCta}</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="text-[10px] text-slate-400 text-center border-t border-slate-100 dark:border-slate-800 pt-2">
                          Powered by Panda Praise Verified Testimonials
                        </div>
                      </div>
                    ) : (
                      /* WhatsApp Message Bubble Preview */
                      <div className="bg-[#e5ddd5] dark:bg-slate-950 rounded-2xl p-4 shadow-2xs space-y-3">
                        <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xs px-3 py-1.5 rounded-xl text-[11px] font-medium text-slate-700 dark:text-slate-200 flex items-center justify-between border border-slate-200/60 dark:border-slate-800">
                          <span className="font-bold">{companyName} Verified</span>
                          <span className="text-[10px] text-slate-400">12:45 PM</span>
                        </div>

                        <div className="bg-[#dcf8c6] dark:bg-emerald-950/80 p-3.5 rounded-2xl rounded-tr-xs shadow-2xs max-w-[92%] ml-auto text-xs text-slate-800 dark:text-emerald-100 leading-relaxed space-y-2 border border-emerald-200/60 dark:border-emerald-800/60">
                          <div className="whitespace-pre-wrap">{interpolatedPreview}</div>
                          <div className="p-2 bg-white/80 dark:bg-slate-900/80 rounded-xl border border-emerald-200/60 dark:border-emerald-800 flex items-center justify-between gap-2">
                            <span className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300 line-clamp-1">
                              👉 {formCta}
                            </span>
                            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">pandapraise.com</span>
                          </div>
                          <div className="text-[9px] text-slate-400 text-right">12:45 PM ✓✓</div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="pt-3 border-t border-slate-200/80 dark:border-slate-700 text-[11px] text-slate-500 dark:text-slate-400 text-center">
                    Tokens are replaced with actual customer metadata upon trigger.
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-all cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleSaveCampaign}
                disabled={isSaving || !formName.trim()}
                className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-all shadow-2xs active:scale-95 disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fade-in font-sans">
          <div className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200/80 dark:border-slate-800 w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950/60 border border-purple-200/70 dark:border-purple-800 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold text-sm shadow-2xs">
                  <Code2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                    Inbound Trigger Webhook
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Connect Stripe, Shopify, Zapier, or your backend to trigger review drip sequences.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowWebhookGuide(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
              {/* Webhook Endpoint */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Endpoint URL (POST)
                </label>
                <div className="flex items-center gap-2">
                  <code className="flex-1 p-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl font-mono text-[11px] text-purple-700 dark:text-purple-300 border border-slate-200/80 dark:border-slate-700 break-all select-all">
                    https://pandapraise.com/api/webhook/campaign-trigger
                  </code>
                  <button
                    type="button"
                    onClick={() =>
                      handleCopyText('https://pandapraise.com/api/webhook/campaign-trigger', 'url')
                    }
                    className="p-2.5 rounded-xl border border-slate-200/80 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 cursor-pointer shadow-2xs transition-all"
                  >
                    {copiedKey === 'url' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* JSON Payload Example */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Request Body (JSON)
                </label>
                <pre className="p-3.5 bg-slate-900 text-emerald-400 rounded-2xl font-mono text-[11px] overflow-x-auto leading-relaxed border border-slate-800 shadow-2xs">
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
              <div className="p-4 rounded-2xl bg-purple-50/70 dark:bg-purple-950/40 border border-purple-200/80 dark:border-purple-800/80 space-y-1.5 shadow-2xs">
                <div className="flex items-center gap-2 text-purple-900 dark:text-purple-200 font-bold">
                  <ShieldCheck className="w-4 h-4 text-purple-700 dark:text-purple-300" />
                  <span>HMAC-SHA256 Signature Verification</span>
                </div>
                <p className="text-[11px] text-purple-800 dark:text-purple-300 leading-relaxed">
                  Sign requests using header <code>X-PandaPraise-Signature: hex(hmac_sha256(secret, raw_payload))</code>.
                  Prevents spoofing and guarantees authenticity.
                </p>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/50 text-right">
              <button
                type="button"
                onClick={() => setShowWebhookGuide(false)}
                className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold transition-all cursor-pointer shadow-2xs active:scale-95"
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
