import React, { useState } from 'react';
import { 
  Copy, 
  Check, 
  ExternalLink, 
  Star, 
  QrCode, 
  FileText, 
  Video,
  Sparkles,
  Settings,
  Radio,
  Inbox,
  CheckCircle2,
  Mail,
  Globe,
  Code,
  ChevronRight,
  Palette,
  ArrowRight,
  Share2
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { Review, ReviewStats, CollectionForm } from '../../../types';
import { cleanBrandOrProductName, deduplicateRepeatedString } from '../../../lib/security';
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
  onSendInvites,
  onViewProof,
  onUpdateForm,
  onNavigateToCampaigns,
  onNavigateToWidgets,
  reviews = [],
  stats,
}) => {
  const { project, collectionForm } = useAuth();
  const [copied, setCopied] = useState(false);
  const [channelToast, setChannelToast] = useState<string | null>(null);
  const [showQrModal, setShowQrModal] = useState(false);

  // Review Mode Quick-Toggle State
  const [reviewMode, setReviewMode] = useState<'text' | 'video' | 'rating'>(() => {
    if (collectionForm?.allowVideo) return 'video';
    return 'text';
  });

  // Business Name Resolution
  const cleanBusinessName =
    cleanBrandOrProductName(collectionForm?.settings?.brandName) ||
    cleanBrandOrProductName(project?.name) ||
    project?.name ||
    'our business';

  // Sanitize title to avoid stale "Gopal's Testimonials" or "Testimonial Form"
  let formTitle = deduplicateRepeatedString(collectionForm?.title?.trim()) || '';
  if (
    !formTitle ||
    formTitle.includes("Gopal's Testimonials") ||
    formTitle.includes("Gopal’s Testimonials") ||
    formTitle.toLowerCase().includes('testimonials') ||
    formTitle.endsWith('Testimonial Form')
  ) {
    formTitle = `Share your experience with ${cleanBusinessName}`;
  }

  const publicSlug = collectionForm?.publicSlug || project?.slug || 'feedback';
  const collectionUrl = `${window.location.origin}/c/${publicSlug}`;
  const isFormActive = collectionForm?.isActive ?? true;
  const brandColor = collectionForm?.settings?.brandColor || '#3525cd';

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
    navigator.clipboard.writeText(collectionUrl);
    setCopied(true);
    setChannelToast('Direct intake link copied to clipboard!');
    setTimeout(() => {
      setCopied(false);
      setChannelToast(null);
    }, 2500);
  };

  const handleSelectMode = (mode: 'text' | 'video' | 'rating') => {
    setReviewMode(mode);
    if (onUpdateForm) {
      if (mode === 'video') {
        onUpdateForm({
          allowVideo: true,
          settings: {
            ...collectionForm?.settings,
            requireRating: true,
          },
        });
      } else {
        onUpdateForm({
          allowVideo: false,
          settings: {
            ...collectionForm?.settings,
            requireRating: true,
          },
        });
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6 space-y-6 font-sans">
      
      {/* 1. Breadcrumb & Workspace Status Bar */}
      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse" />
            <span className="font-semibold">Collect</span>
            <span className="text-slate-400">•</span>
            <span className="text-slate-900 dark:text-white font-bold">{project?.slug || 'feedback'}</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/50 dark:border-indigo-800/50 px-3 py-1 rounded-full text-xs font-semibold shadow-2xs">
          <Radio className="w-3.5 h-3.5 animate-pulse" />
          <span>Live Intake</span>
        </div>
      </div>

      {/* 2. Screen Header */}
      <div className="flex flex-col space-y-1">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight font-display">
            Collect Testimonials
          </h1>
          <Sparkles className="w-6 h-6 text-indigo-600 dark:text-indigo-400 shrink-0" />
        </div>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed max-w-2xl">
          Capture authentic customer reviews and ratings using your branded collection form.
        </p>
      </div>

      {/* 3. Quick Action Toolbar */}
      <div data-testid="collection-action-toolbar" className="grid grid-cols-3 gap-2.5 sm:gap-3">
        <button
          type="button"
          data-testid="toolbar-qr-btn"
          onClick={() => setShowQrModal(true)}
          className="apple-touch flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-all text-xs font-semibold text-slate-800 dark:text-slate-200 cursor-pointer active:scale-[0.98]"
          title="Generate print-ready QR codes for tables, packaging or receipts"
        >
          <QrCode className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          <span>QR Code</span>
        </button>

        <a
          data-testid="toolbar-test-live-btn"
          href={collectionUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="apple-touch flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-all text-xs font-semibold text-slate-800 dark:text-slate-200 cursor-pointer active:scale-[0.98]"
          title="Open live collection form in a new tab"
        >
          <ExternalLink className="w-4 h-4 text-violet-600 dark:text-violet-400" />
          <span>Test Live</span>
        </a>

        <button
          type="button"
          data-testid="toolbar-configure-btn"
          onClick={onConfigureForm}
          className="apple-touch flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm text-xs font-bold transition-all cursor-pointer active:scale-[0.98]"
          title="Configure form questions, branding and fields"
        >
          <Settings className="w-4 h-4 text-white" />
          <span>Settings</span>
        </button>
      </div>

      {/* 4. Actionable Empty State & Encouraging Inline Banner */}
      {totalCount === 0 && (
        <div className="rounded-2xl border border-violet-500/20 bg-gradient-to-r from-violet-500/10 via-indigo-500/10 to-purple-500/10 p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fade-in">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-violet-600/10 border border-violet-500/20 text-violet-700 flex items-center justify-center shrink-0 shadow-2xs">
              <Sparkles className="w-5 h-5 text-violet-600" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">
                Your collection form is live!
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                Share your link or print your QR code to start gathering praise.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleCopy}
              className="px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700 text-xs font-semibold shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
              <span>{copied ? 'Copied Link!' : 'Copy Share Link'}</span>
            </button>
            <button
              data-testid="preview-sample-submissions-btn"
              onClick={onViewProof}
              className="px-3.5 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-semibold shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Preview Sample Submissions</span>
            </button>
          </div>
        </div>
      )}

      {/* 5. Active Campaign Spotlight Card */}
      <div className="relative overflow-hidden rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm p-5 sm:p-7 space-y-5">
        {/* Ambient Top Glow */}
        <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-indigo-500/10 dark:bg-indigo-500/20 blur-3xl pointer-events-none" />

        <div className="flex items-start justify-between relative z-10 gap-3">
          <div className="space-y-1.5 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                isFormActive
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${isFormActive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
                <span>{isFormActive ? 'Active' : 'Paused'}</span>
              </span>

              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/60">
                {reviewMode === 'video' ? (
                  <>
                    <Video className="w-3 h-3 text-indigo-600" />
                    <span>Video + Text</span>
                  </>
                ) : reviewMode === 'rating' ? (
                  <>
                    <Star className="w-3 h-3 text-amber-500" />
                    <span>Rating Focused</span>
                  </>
                ) : (
                  <>
                    <FileText className="w-3 h-3 text-indigo-600" />
                    <span>Verified Text</span>
                  </>
                )}
              </span>
            </div>

            <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white pt-1 tracking-tight font-display">
              {formTitle}
            </h2>
          </div>

          <button
            type="button"
            onClick={onConfigureForm}
            className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center shrink-0 text-indigo-600 dark:text-indigo-400 transition-colors cursor-pointer"
            title="Configure Form Settings"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>

        {/* Live Form Visual Snapshot & Interactive Preview */}
        <div data-testid="form-customer-preview-snippet" className="rounded-2xl overflow-hidden bg-slate-50 dark:bg-slate-950/50 border border-slate-200/60 dark:border-slate-800 shadow-inner relative group">
          <div className="p-4 sm:p-5 flex flex-col justify-between min-h-[140px] bg-gradient-to-br from-indigo-50/40 via-white to-slate-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-950">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div 
                  className="w-8 h-8 rounded-xl text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-2xs"
                  style={{ backgroundColor: brandColor }}
                >
                  {cleanBusinessName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">{cleanBusinessName}</h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Customer feedback form view</p>
                </div>
              </div>
              <span className="text-[10px] font-semibold bg-white/80 dark:bg-slate-800/80 backdrop-blur-md px-2.5 py-1 rounded-full text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700 shadow-2xs">
                Live Form Preview
              </span>
            </div>

            <div className="pt-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex text-amber-400">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} className="w-4 h-4 fill-amber-400" />
                  ))}
                </div>
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">5-Star Prompt</span>
              </div>
              <span className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">Ready to collect</span>
            </div>
          </div>
        </div>

        {/* Interactive Feedback Mode Controls */}
        <div data-testid="review-mode-controls" className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-1">
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Intake Mode</span>
          <div className="inline-flex items-center p-1 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 gap-1 self-start sm:self-auto">
            <button
              data-testid="mode-toggle-text"
              type="button"
              onClick={() => handleSelectMode('text')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                reviewMode === 'text'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <FileText className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>Text + Rating</span>
            </button>

            <button
              data-testid="mode-toggle-video"
              type="button"
              onClick={() => handleSelectMode('video')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                reviewMode === 'video'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Video className="w-3.5 h-3.5 text-violet-600 dark:text-violet-400" />
              <span>Video Enabled</span>
            </button>

            <button
              data-testid="mode-toggle-rating"
              type="button"
              onClick={() => handleSelectMode('rating')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                reviewMode === 'rating'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Star className="w-3.5 h-3.5 text-amber-500" />
              <span>Rating Only</span>
            </button>
          </div>
        </div>

        {/* Dedicated "Your Collection Link" Card */}
        <div data-testid="collection-link-card" className="rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50 p-4 space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white">
              <Globe className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>Public Intake Link</span>
            </span>
            <span className="text-indigo-600 dark:text-indigo-400 font-semibold text-[11px]">No login required</span>
          </div>

          <div className="flex items-center gap-2 bg-white dark:bg-slate-800 px-3 py-2 rounded-xl border border-slate-200/80 dark:border-slate-700 shadow-2xs">
            <span className="text-xs font-mono text-slate-600 dark:text-slate-300 truncate select-all flex-1">
              {collectionUrl}
            </span>
            <button
              type="button"
              data-testid="copy-collection-link-btn"
              onClick={handleCopy}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/80 dark:hover:bg-indigo-900/80 text-indigo-600 dark:text-indigo-400 text-xs font-bold transition-colors cursor-pointer shrink-0 active:scale-95"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-600">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
          {channelToast && (
            <p className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 animate-fade-in">
              {channelToast}
            </p>
          )}
        </div>
      </div>

      {/* 6. Collection Pulse & Realtime Analytics */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-indigo-600 dark:text-indigo-400 animate-pulse" />
            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white font-display">
              Collection Pulse
            </h3>
          </div>
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Realtime</span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          {/* Total Collected */}
          <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-4 sm:p-5 shadow-2xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Collected</span>
              <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <Inbox className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-display">
                {totalCount}
              </span>
              {totalCount > 0 && (
                <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400">
                  +{totalCount} this wk
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Authentic reviews</p>
          </div>

          {/* Average Rating */}
          <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-4 sm:p-5 shadow-2xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Avg Rating</span>
              <div className="w-7 h-7 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-500 flex items-center justify-center">
                <Star className="w-4 h-4 fill-amber-400" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-display">
                {avgRating}
              </span>
              <div className="flex text-amber-400">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} className="w-3 h-3 fill-amber-400" />
                ))}
              </div>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Verified customers</p>
          </div>

          {/* Approved Proof */}
          <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-4 sm:p-5 shadow-2xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Approved Proof</span>
              <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 font-display">
                {approvedCount}
              </span>
              {pendingCount > 0 && (
                <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400">
                  {pendingCount} Pending
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Live on wall widgets</p>
          </div>

          {/* Format Mode */}
          <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-4 sm:p-5 shadow-2xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Format Mode</span>
              <div className="w-7 h-7 rounded-lg bg-violet-50 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400 flex items-center justify-center">
                <Video className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-base sm:text-lg font-bold text-slate-900 dark:text-white font-display block leading-tight">
                {reviewMode === 'video' ? 'Hybrid' : reviewMode === 'rating' ? 'Ratings' : 'Text'}
              </span>
              <span className="text-[11px] text-indigo-600 dark:text-indigo-400 font-medium">
                {reviewMode === 'video' ? 'Video + Text + Stars' : reviewMode === 'rating' ? 'Stars Only' : 'Text + Stars'}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">All inputs enabled</p>
          </div>
        </div>

        {/* Review Pipeline Callout Banner */}
        <div className="rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200/60 dark:border-indigo-800/60 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-sm">
              <Mail className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900 dark:text-white">
                {pendingCount > 0 ? `${pendingCount} Submissions in Queue` : `${totalCount} Testimonials in Pipeline`}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Review and publish to your Wall of Love & website embeds
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onViewProof}
            className="apple-touch flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer self-start sm:self-auto shrink-0 active:scale-95"
          >
            <span>Moderate</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 7. Distribution Channels */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white font-display">
            Distribution Channels
          </h3>
          <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 px-2.5 py-0.5 rounded-full">
            4 Channels
          </span>
        </div>

        <div className="space-y-2.5">
          {/* Channel 1: Custom Branded Link */}
          <div 
            onClick={handleCopy}
            className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-4 shadow-2xs flex items-center justify-between hover:border-indigo-300 dark:hover:border-indigo-700 transition-all cursor-pointer group"
          >
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <Globe className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-slate-900 dark:text-white truncate">Custom Branded Link</span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold">
                    Active
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                  Direct share via Slack, SMS, WhatsApp or direct link
                </p>
              </div>
            </div>
            <button
              type="button"
              className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 group-hover:text-indigo-600 transition-colors shrink-0"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Channel 2: Email Campaign */}
          <div 
            onClick={() => onNavigateToCampaigns ? onNavigateToCampaigns() : (onSendInvites ? onSendInvites() : handleCopy())}
            className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-4 shadow-2xs flex items-center justify-between hover:border-violet-300 dark:hover:border-violet-700 transition-all cursor-pointer group"
          >
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-violet-50 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <Mail className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-slate-900 dark:text-white truncate">Email Campaign</span>
                  <span className="px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 text-[10px] font-bold">
                    Automated
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                  Automated drip review requests post-checkout
                </p>
              </div>
            </div>
            <button
              type="button"
              className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 group-hover:text-violet-600 transition-colors shrink-0"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Channel 3: In-Person & Packaging QR */}
          <div 
            onClick={() => setShowQrModal(true)}
            className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-4 shadow-2xs flex items-center justify-between hover:border-indigo-300 dark:hover:border-indigo-700 transition-all cursor-pointer group"
          >
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <QrCode className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-slate-900 dark:text-white truncate">In-Person & Packaging QR</span>
                  <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-bold">
                    Print Kit
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                  Print vector cards and acrylic standees for product unboxings
                </p>
              </div>
            </div>
            <button
              type="button"
              className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 group-hover:text-indigo-600 transition-colors shrink-0"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Channel 4: Inline Web Pop-up */}
          <div 
            onClick={() => onNavigateToWidgets ? onNavigateToWidgets() : onConfigureForm()}
            className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-4 shadow-2xs flex items-center justify-between hover:border-violet-300 dark:hover:border-violet-700 transition-all cursor-pointer group"
          >
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-violet-50 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <Code className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-slate-900 dark:text-white truncate">Inline Web Pop-up</span>
                  <span className="px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 text-[10px] font-bold">
                    Embed
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                  Embed 1-line script onto your SaaS or e-commerce store
                </p>
              </div>
            </div>
            <button
              type="button"
              className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 group-hover:text-violet-600 transition-colors shrink-0"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 8. Form Customization Callout */}
      <div className="rounded-2xl bg-slate-100/90 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 p-4 sm:p-5 flex items-center justify-between shadow-2xs">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shadow-2xs shrink-0">
            <Palette className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">Styling & Branding</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">Custom logo, questions & color palette</p>
          </div>
        </div>

        <button
          type="button"
          onClick={onConfigureForm}
          className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 text-xs font-bold flex items-center gap-0.5 transition-colors cursor-pointer"
        >
          <span>Edit</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* 9. QR Code Modal */}
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
