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

        <a
          data-testid="toolbar-test-live-btn"
          href={collectionUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="apple-touch flex items-center justify-center gap-1.5 py-1.5 px-2.5 rounded-lg bg-white dark:bg-slate-900 shadow-2xs border border-slate-200/80 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-all active:scale-[0.98] text-xs font-medium text-slate-800 dark:text-slate-200 cursor-pointer"
          title="Test Live"
        >
          <ExternalLink className="w-4 h-4 text-violet-600 dark:text-violet-400" />
          <span>Test Live</span>
        </a>

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

      {/* 4. Actionable Empty State & Encouraging Inline Banner */}
      {totalCount === 0 && (
        <div className="rounded-xl border border-violet-500/20 bg-gradient-to-r from-violet-500/10 via-indigo-500/10 to-purple-500/10 p-3.5 sm:p-4 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fade-in">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-violet-600/10 border border-violet-500/20 text-violet-700 flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4 text-violet-600" />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white tracking-tight">
                Your collection form is live!
              </h3>
              <p className="text-[11px] text-slate-600 dark:text-slate-300">
                Share your link or print your QR code to start gathering praise.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleCopy}
              className="px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700 text-xs font-medium shadow-2xs transition-all flex items-center gap-1 cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
              <span>{copied ? 'Copied Link!' : 'Copy Share Link'}</span>
            </button>
            <button
              data-testid="preview-sample-submissions-btn"
              onClick={onViewProof}
              className="px-2.5 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-700 text-white text-xs font-semibold shadow-2xs transition-all flex items-center gap-1 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Preview Sample Submissions</span>
            </button>
          </div>
        </div>
      )}

      {/* 5. Active Campaign Spotlight Card (Streamlined & Compact) */}
      <div className="relative overflow-hidden rounded-xl bg-white dark:bg-slate-900 shadow-2xs p-3 space-y-2.5 border border-slate-200/80 dark:border-slate-800">
        <div className="flex items-start justify-between relative z-10 gap-2">
          <div className="space-y-0.5 min-w-0 flex-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className={`inline-flex items-center gap-1 px-1.5 py-0.2 rounded-full text-[11px] font-semibold ${
                isFormActive
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200/50'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${isFormActive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
                <span>{isFormActive ? 'Active' : 'Paused'}</span>
              </span>

              <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[11px]">
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

            <h2 className="text-[15px] font-semibold text-slate-900 dark:text-white leading-snug truncate">
              {formTitle}
            </h2>
          </div>

          <button
            type="button"
            onClick={onConfigureForm}
            className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 text-indigo-600 dark:text-indigo-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
            title="Configure form"
          >
            <Share2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Compact Horizontal Snapshot Bar */}
        <div data-testid="form-customer-preview-snippet" className="rounded-lg overflow-hidden bg-slate-50 dark:bg-slate-950/60 border border-slate-200/60 dark:border-slate-800/80 relative group flex items-center justify-between p-2">
          <div className="flex items-center gap-2 min-w-0">
            <img 
              alt="Active Collection Form Preview" 
              className="w-16 h-10 rounded object-cover object-top opacity-90 shrink-0 border border-slate-200 dark:border-slate-700" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDOEIvgFPR5Qt9FyS9yY-auht0kem2gUultI_IwAJYT_TC56io0-V0fRcR1JrCyct9W3UQG4bb858oIgCJjVjcrBPKL0-vZ8R6TZgIPABeR-Sa4kc1bcSObpHBvUC7J_CMv3z5nhlBV_iHmUHGPbrJXAa2qRANmXhI2ObuS3udy8lHsxTh5Q295DKk9LrYVMg0kZUNmtwLi8HupQac7br4njQGb41Z12jV0jASPwTQ3bk4lo2Iq0uS9P9uiLQF1amXoIA"
            />
            <div className="min-w-0">
              <div className="flex items-center gap-1 text-amber-500">
                <Star className="w-3 h-3 fill-amber-400" />
                <span className="text-[11px] text-slate-900 dark:text-white font-semibold">5-Star Prompt</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                Live intake form active • {cleanBusinessName}
              </p>
            </div>
          </div>
          <span className="text-[10px] bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/50 dark:border-indigo-800/50 px-2 py-0.5 rounded-full text-indigo-600 dark:text-indigo-400 font-medium shrink-0">
            Preview
          </span>
        </div>

        {/* Interactive Feedback Mode Controls */}
        <div data-testid="review-mode-controls" className="flex items-center justify-between gap-2 pt-0.5">
          <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">Intake Mode</span>
          <div className="inline-flex items-center p-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 gap-1">
            <button
              data-testid="mode-toggle-text"
              type="button"
              onClick={() => handleSelectMode('text')}
              className={`px-2 py-1 rounded-md text-[11px] font-medium transition-all flex items-center gap-1 cursor-pointer ${
                reviewMode === 'text'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <FileText className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
              <span>Text+Rating</span>
            </button>

            <button
              data-testid="mode-toggle-video"
              type="button"
              onClick={() => handleSelectMode('video')}
              className={`px-2 py-1 rounded-md text-[11px] font-medium transition-all flex items-center gap-1 cursor-pointer ${
                reviewMode === 'video'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Video className="w-3 h-3 text-violet-600 dark:text-violet-400" />
              <span>Video</span>
            </button>

            <button
              data-testid="mode-toggle-rating"
              type="button"
              onClick={() => handleSelectMode('rating')}
              className={`px-2 py-1 rounded-md text-[11px] font-medium transition-all flex items-center gap-1 cursor-pointer ${
                reviewMode === 'rating'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Star className="w-3 h-3 text-amber-500" />
              <span>Rating Only</span>
            </button>
          </div>
        </div>

        {/* Shareable URL Container - Compact */}
        <div data-testid="collection-link-card" className="rounded-lg bg-slate-100 dark:bg-slate-800/80 p-2 flex items-center justify-between gap-2 border border-slate-200/50 dark:border-slate-700/50">
          <div className="flex items-center gap-1.5 min-w-0 flex-1">
            <Globe className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
            <span className="text-[12px] font-mono text-slate-700 dark:text-slate-200 truncate select-all">
              {collectionUrl}
            </span>
          </div>
          <button
            type="button"
            data-testid="copy-collection-link-btn"
            onClick={handleCopy}
            className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 px-2 py-1 rounded bg-white dark:bg-slate-700 active:bg-indigo-50 font-label-sm text-xs font-semibold shadow-2xs transition-colors shrink-0 cursor-pointer"
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

      {/* 7. Multi-channel Collection Options (Unified Grouped Card) */}
      <div className="flex flex-col space-y-1.5">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-[15px] font-semibold text-slate-900 dark:text-white font-display">
            Distribution Channels
          </h3>
          <span className="text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold bg-indigo-50 dark:bg-indigo-950/50 px-2 py-0.5 rounded-full">
            4 Channels
          </span>
        </div>

        <div className="rounded-xl bg-white dark:bg-slate-900 shadow-2xs border border-slate-200/80 dark:border-slate-800 overflow-hidden divide-y divide-slate-100 dark:divide-slate-800">
          {/* Channel 1: Dedicated Branded URL */}
          <div 
            onClick={handleCopy}
            className="p-2.5 flex items-center justify-between transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer"
          >
            <div className="flex items-center gap-2.5 min-w-0 flex-1">
              <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
                <Globe className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-semibold text-slate-900 dark:text-white truncate">Custom Branded Link</span>
                  <span className="px-1.5 py-0.2 rounded-full bg-slate-100 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 text-[10px] font-semibold">
                    Active
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                  Direct share via Slack, SMS or WhatsApp
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 shrink-0 ml-1" />
          </div>

          {/* Channel 2: Email Campaign */}
          <div 
            onClick={() => onNavigateToCampaigns ? onNavigateToCampaigns() : (onSendInvites ? onSendInvites() : handleCopy())}
            className="p-2.5 flex items-center justify-between transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer"
          >
            <div className="flex items-center gap-2.5 min-w-0 flex-1">
              <div className="w-8 h-8 rounded-lg bg-violet-50 dark:bg-violet-950/60 flex items-center justify-center text-violet-600 dark:text-violet-400 shrink-0">
                <Mail className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-semibold text-slate-900 dark:text-white truncate">Email Campaign</span>
                  <span className="px-1.5 py-0.2 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 text-[10px] font-semibold">
                    Scheduled
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                  Automated drip requests post-checkout
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 shrink-0 ml-1" />
          </div>

          {/* Channel 3: Packaging QR */}
          <div 
            onClick={() => setShowQrModal(true)}
            className="p-2.5 flex items-center justify-between transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer"
          >
            <div className="flex items-center gap-2.5 min-w-0 flex-1">
              <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
                <QrCode className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-xs font-semibold text-slate-900 dark:text-white truncate block">
                  In-Person &amp; Packaging QR
                </span>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                  Print vector cards for product unboxings
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 shrink-0 ml-1" />
          </div>

          {/* Channel 4: Website Embed */}
          <div 
            onClick={() => onNavigateToWidgets ? onNavigateToWidgets() : onConfigureForm()}
            className="p-2.5 flex items-center justify-between transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer"
          >
            <div className="flex items-center gap-2.5 min-w-0 flex-1">
              <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-violet-600 dark:text-violet-400 shrink-0">
                <Code className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-xs font-semibold text-slate-900 dark:text-white truncate block">
                  Inline Web Pop-up
                </span>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                  Embed 1-line script onto your app dashboard
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 shrink-0 ml-1" />
          </div>
        </div>
      </div>

      {/* 8. Form Customization Callout (Compact) */}
      <div className="rounded-xl bg-slate-100/90 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 p-2.5 flex items-center justify-between shadow-2xs">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-white dark:bg-slate-900 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shadow-2xs shrink-0">
            <Palette className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h4 className="text-xs font-semibold text-slate-900 dark:text-white truncate">Styling &amp; Branding</h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">Custom logo, questions &amp; color palette</p>
          </div>
        </div>
        <button 
          type="button"
          onClick={onConfigureForm}
          className="text-indigo-600 dark:text-indigo-400 text-[12px] font-semibold hover:underline flex items-center gap-0.5 shrink-0 ml-2 cursor-pointer"
        >
          <span>Edit</span>
          <ChevronRight className="w-3.5 h-3.5" />
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
