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
  Mail,
  CheckCircle2,
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
  const [showQrModal, setShowQrModal] = useState(false);

  const publicSlug = collectionForm?.publicSlug || project?.slug || 'feedback';
  const collectionUrl = `${window.location.origin}/c/${publicSlug}`;

  // Active Metrics Calculations
  const totalCount = reviews.length > 0 ? reviews.length : (stats?.total ?? 0);
  const approvedCount =
    reviews.length > 0
      ? reviews.filter((r) => r.status === 'approved').length
      : (stats?.approvedCount ?? 0);
  const pendingCount =
    reviews.length > 0
      ? reviews.filter((r) => r.status === 'pending').length
      : (stats?.pendingCount ?? 0);

  const avgRating =
    stats?.averageRating && stats.averageRating > 0
      ? stats.averageRating.toFixed(1)
      : reviews.length > 0
      ? (reviews.reduce((sum, r) => sum + (r.rating || 5), 0) / reviews.length).toFixed(1)
      : '0.0';

  const handleCopy = () => {
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(collectionUrl).catch(() => {});
    }
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 2500);
  };

  const projectName = project?.name || project?.slug || 'feedback';

  return (
    <div className="space-y-6 font-sans">
      {/* ── 2. Full-Width Purple-to-Violet Hero Card ── */}
      <div className="relative rounded-3xl bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 text-white p-6 sm:p-8 overflow-hidden shadow-xl">
        <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10">
          {/* Top Row: Pill Badge on Left, Green-Dot Indicator on Right */}
          <div className="flex items-center justify-between gap-3 mb-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold border border-white/20">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Collect · {projectName}</span>
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold text-white border border-white/20">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Live Intake</span>
            </div>
          </div>

          {/* Headline */}
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Collect Testimonials
          </h1>

          {/* One short clean white supporting sentence */}
          <p className="text-xs sm:text-sm text-purple-100 mt-2 leading-relaxed max-w-xl">
            Capture authentic customer reviews and ratings using your branded collection form.
          </p>

          {/* Action Buttons Row */}
          <div data-testid="collection-action-toolbar" className="mt-6 flex flex-wrap items-center gap-3">
            <button
              type="button"
              data-testid="toolbar-qr-btn"
              onClick={() => setShowQrModal(true)}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white text-purple-900 hover:bg-purple-50 font-bold text-xs shadow-md transition-all cursor-pointer"
              title="QR Code"
            >
              <QrCode className="w-4 h-4 text-purple-700" />
              <span>QR Code</span>
            </button>

            <button
              type="button"
              data-testid="toolbar-copy-link-btn"
              onClick={handleCopy}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white text-purple-900 hover:bg-purple-50 font-bold text-xs shadow-md transition-all cursor-pointer"
              title="Copy Share Link"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span className="text-emerald-700">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-purple-700" />
                  <span>Copy Share Link</span>
                </>
              )}
            </button>

            <button
              type="button"
              data-testid="toolbar-configure-btn"
              onClick={onConfigureForm}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-purple-900/60 hover:bg-purple-900/80 text-white font-bold text-xs border border-white/20 shadow-md transition-all cursor-pointer"
              title="Settings"
            >
              <Settings className="w-4 h-4 text-purple-200" />
              <span>Settings</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── 3. Section Header: Collection Pulse ── */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <Radio className="w-4 h-4 text-purple-600 dark:text-purple-400 animate-pulse" />
          <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
            Collection Pulse
          </h2>
        </div>
        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Realtime</span>
      </div>

      {/* ── 4. Four Equal White Metric Cards in 2x2 Grid ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
        {/* Card 1: Total Collected */}
        <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Total Collected
            </span>
            <Mail className="w-4 h-4 text-purple-600" />
          </div>
          <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            {totalCount}
          </span>
          <span className="text-xs text-slate-400 mt-1">Authentic reviews</span>
        </div>

        {/* Card 2: Avg Rating */}
        <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Avg Rating
            </span>
            <Star className="w-4 h-4 text-amber-500" />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              {avgRating}
            </span>
            <div className="flex text-amber-400 gap-0.5">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} className="w-3.5 h-3.5 fill-amber-400" />
              ))}
            </div>
          </div>
          <span className="text-xs text-slate-400 mt-1">Verified customers</span>
        </div>

        {/* Card 3: Approved Proof */}
        <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Approved Proof
            </span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <span className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400">
            {approvedCount}
          </span>
          <span className="text-xs text-slate-400 mt-1">Live on wall widgets</span>
        </div>

        {/* Card 4: Format Mode */}
        <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Format Mode
            </span>
            <Video className="w-4 h-4 text-purple-600" />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              Hybrid
            </span>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300">
              Video+Text
            </span>
          </div>
          <span className="text-xs text-slate-400 mt-1">All inputs enabled</span>
        </div>
      </div>

      {/* ── 5. Bottom Full-Width Light-Purple Banner Card ── */}
      <div className="p-5 sm:p-6 rounded-2xl bg-purple-50 dark:bg-purple-950/30 border border-purple-200/70 dark:border-purple-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-2xl bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 flex items-center justify-center shrink-0">
            <Mail className="w-5 h-5 text-purple-700 dark:text-purple-300" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              {pendingCount > 0 ? `${pendingCount} Submissions in Queue` : `${totalCount} Submissions in Queue`}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Review, approve, and publish authentic stories to your Wall of Love.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onViewProof}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-sm transition-all shrink-0 cursor-pointer"
        >
          <span>Moderate →</span>
        </button>
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

export default FormsView;
