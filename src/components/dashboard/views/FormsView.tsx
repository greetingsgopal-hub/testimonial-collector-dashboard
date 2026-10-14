import React, { useState } from 'react';
import { 
  Copy, 
  Check, 
  Star, 
  QrCode, 
  Video,
  Sparkles,
  Settings,
  Radio,
  Inbox,
  CheckCircle2,
  Mail,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { Review, ReviewStats, CollectionForm } from '../../../types';
import { QrCodeGenerator } from '../QrCodeGenerator';

export interface FormsViewProps {
  onConfigureForm: () => void;
  onSendInvites?: () => void;
  onViewProof: () => void;
  onUpdateForm?: (updates: Partial<CollectionForm>) => Promise<void> | void;
  onNavigateToCampaigns?: () => void;
  onNavigateToWidgets?: () => void;
  reviews?: Review[];
  stats?: ReviewStats;
}

export const FormsView: React.FC<FormsViewProps> = ({
  onConfigureForm,
  onSendInvites: _onSendInvites,
  onViewProof,
  onUpdateForm: _onUpdateForm,
  onNavigateToCampaigns: _onNavigateToCampaigns,
  onNavigateToWidgets: _onNavigateToWidgets,
  reviews = [],
  stats,
}) => {
  const { project, collectionForm } = useAuth();
  const [copied, setCopied] = useState(false);
  const [channelToast, setChannelToast] = useState<string | null>(null);
  const [showQrModal, setShowQrModal] = useState(false);

  // Review Mode for Pulse Metric Display
  const reviewMode: 'text' | 'video' | 'rating' = collectionForm?.allowVideo
    ? 'video'
    : (collectionForm?.settings?.requireRating ? 'rating' : 'text');

  const publicSlug = collectionForm?.publicSlug || project?.slug || 'feedback';
  const collectionUrl = `${window.location.origin}/c/${publicSlug}`;

  // Active Metrics Calculations
  const totalCount = reviews.length > 0 ? reviews.length : (stats?.total ?? 0);
  const approvedCount = reviews.length > 0 
    ? reviews.filter(r => r.status === 'approved').length 
    : (stats?.approvedCount ?? 0);
  const pendingCount = reviews.length > 0
    ? reviews.filter(r => r.status === 'pending').length
    : (stats?.pendingCount ?? 0);

  const avgRating = stats?.averageRating && stats.averageRating > 0
    ? stats.averageRating.toFixed(1)
    : (reviews.length > 0 
        ? (reviews.reduce((sum, r) => sum + (r.rating || 5), 0) / reviews.length).toFixed(1) 
        : '5.0');

  const handleCopy = () => {
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(collectionUrl).catch(() => {});
    }
    setCopied(true);
    setChannelToast('Direct intake link copied to clipboard!');
    setTimeout(() => {
      setCopied(false);
      setChannelToast(null);
    }, 2500);
  };

  return (
    <div className="max-w-4xl mx-auto py-4 px-3 sm:px-6 space-y-3 font-sans">
      
      {/* 1. Breadcrumb & Workspace Status Bar */}
      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-label-sm text-xs shadow-2xs">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-pulse" />
            <span>Collect</span>
            <span className="text-slate-400">•</span>
            <span className="font-semibold text-slate-900 dark:text-white">{project?.slug || 'feedback'}</span>
          </div>
        </div>

        <div className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 px-2 py-0.5 rounded-full text-xs font-semibold shadow-2xs">
          <Radio className="w-3 h-3 animate-pulse" />
          <span>Live Intake</span>
        </div>
      </div>

      {/* 2. Screen Header */}
      <div className="flex flex-col">
        <div className="flex items-center justify-between">
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight font-display">
            Collect Testimonials
          </h1>
          <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0" />
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 leading-snug">
          Capture authentic customer reviews and ratings using your branded collection form.
        </p>
      </div>

      {/* 3. Quick Action Toolbar */}
      <div data-testid="collection-action-toolbar" className="grid grid-cols-3 gap-2">
        <button
          type="button"
          data-testid="toolbar-qr-btn"
          onClick={() => setShowQrModal(true)}
          className="apple-touch flex items-center justify-center gap-1.5 py-1.5 px-2.5 rounded-lg bg-white dark:bg-slate-900 shadow-2xs border border-slate-200/80 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-all active:scale-[0.98] text-xs font-medium text-slate-800 dark:text-slate-200 cursor-pointer"
          title="QR Code"
        >
          <QrCode className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          <span>QR Code</span>
        </button>

        <button
          type="button"
          data-testid="toolbar-copy-link-btn"
          onClick={handleCopy}
          className="apple-touch flex items-center justify-center gap-1.5 py-1.5 px-2.5 rounded-lg bg-white dark:bg-slate-900 shadow-2xs border border-slate-200/80 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-all active:scale-[0.98] text-xs font-medium text-slate-800 dark:text-slate-200 cursor-pointer"
          title="Copy Share Link"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4 text-emerald-600" />
              <span className="text-emerald-600 font-semibold">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-4 h-4 text-violet-600 dark:text-violet-400" />
              <span>Copy Share Link</span>
            </>
          )}
        </button>

        <button
          type="button"
          data-testid="toolbar-configure-btn"
          onClick={onConfigureForm}
          className="apple-touch flex items-center justify-center gap-1.5 py-1.5 px-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow-2xs transition-all active:scale-[0.98] text-xs font-semibold cursor-pointer"
          title="Settings"
        >
          <Settings className="w-4 h-4 text-white" />
          <span>Settings</span>
        </button>
      </div>

      {channelToast && (
        <p className="text-center text-xs font-medium text-emerald-600 dark:text-emerald-400 animate-fade-in">
          {channelToast}
        </p>
      )}

      {/* 6. Live Collection Performance & Analytics Grid (Compact) */}
      <div className="flex flex-col space-y-2">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-1.5">
            <Radio className="w-4 h-4 text-indigo-600 dark:text-indigo-400 animate-pulse" />
            <h3 className="text-[15px] font-semibold text-slate-900 dark:text-white font-display">
              Collection Pulse
            </h3>
          </div>
          <span className="text-[11px] text-slate-500 dark:text-slate-400">Realtime</span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {/* Total Submissions Card */}
          <div className="rounded-xl bg-white dark:bg-slate-900 p-2.5 shadow-2xs border border-slate-200/80 dark:border-slate-800 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Total Collected</span>
              <div className="w-6 h-6 rounded-md bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                <Inbox className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className="text-[18px] text-slate-900 dark:text-white font-bold font-display">{totalCount}</span>
              {totalCount > 0 && <span className="text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold">+{totalCount} this wk</span>}
            </div>
            <p className="text-[11px] text-slate-400">Authentic reviews</p>
          </div>

          {/* Average Rating Card */}
          <div className="rounded-xl bg-white dark:bg-slate-900 p-2.5 shadow-2xs border border-slate-200/80 dark:border-slate-800 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Avg Rating</span>
              <div className="w-6 h-6 rounded-md bg-amber-50 dark:bg-amber-950/60 flex items-center justify-center text-amber-500">
                <Star className="w-3.5 h-3.5 fill-amber-400" />
              </div>
            </div>
            <div className="mt-1 flex items-baseline gap-1">
              <span className="text-[18px] text-slate-900 dark:text-white font-bold font-display">{avgRating}</span>
              <div className="flex text-amber-400 scale-90 origin-left">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} className="w-3 h-3 fill-amber-400" />
                ))}
              </div>
            </div>
            <p className="text-[11px] text-slate-400">Verified customers</p>
          </div>

          {/* Approved Proof */}
          <div className="rounded-xl bg-white dark:bg-slate-900 p-2.5 shadow-2xs border border-slate-200/80 dark:border-slate-800 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Approved Proof</span>
              <div className="w-6 h-6 rounded-md bg-emerald-50 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-600">
                <CheckCircle2 className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className="text-[18px] text-emerald-600 dark:text-emerald-400 font-bold font-display">{approvedCount}</span>
              {pendingCount > 0 && <span className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold">{pendingCount} Pending</span>}
            </div>
            <p className="text-[11px] text-slate-400">Live on wall widgets</p>
          </div>

          {/* Intake Mode */}
          <div className="rounded-xl bg-white dark:bg-slate-900 p-2.5 shadow-2xs border border-slate-200/80 dark:border-slate-800 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Format Mode</span>
              <div className="w-6 h-6 rounded-md bg-violet-50 dark:bg-violet-950/60 flex items-center justify-center text-violet-600">
                <Video className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className="text-[16px] text-slate-900 dark:text-white font-semibold font-display">
                {reviewMode === 'video' ? 'Hybrid' : reviewMode === 'rating' ? 'Ratings' : 'Text'}
              </span>
              <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-medium">
                {reviewMode === 'video' ? 'Video+Text' : reviewMode === 'rating' ? 'Stars' : 'Text+Stars'}
              </span>
            </div>
            <p className="text-[11px] text-slate-400">All inputs enabled</p>
          </div>
        </div>

        {/* Compact Review Pipeline Callout Banner */}
        <div className="rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 p-2.5 flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0">
              <Mail className="w-4 h-4 text-white" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-slate-900 dark:text-white leading-tight truncate">
                {pendingCount > 0 ? `${pendingCount} Submissions in Queue` : `${totalCount} Submissions in Queue`}
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                Review and publish to your Wall
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onViewProof}
            className="apple-touch flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-[12px] font-semibold active:scale-95 transition-all shrink-0 ml-2 cursor-pointer"
          >
            <span>Moderate</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* QR Code Modal */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-7 max-w-3xl w-full shadow-2xl relative my-auto max-h-[94vh] overflow-y-auto text-slate-900 dark:text-slate-100">
            <QrCodeGenerator onClose={() => setShowQrModal(false)} />
          </div>
        </div>
      )}

    </div>
  );
};
