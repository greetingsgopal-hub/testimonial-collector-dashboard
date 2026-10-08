import React, { useState } from 'react';
import { 
  Copy, 
  Check, 
  ExternalLink, 
  MessageSquare, 
  Star, 
  QrCode, 
  FileText, 
  Video,
  Sparkles,
  Settings,
  X
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { Review, ReviewStats, CollectionForm } from '../../../types';
import { cleanBrandOrProductName, deduplicateRepeatedString } from '../../../lib/security';
import { QrCodeGenerator } from '../QrCodeGenerator';

interface FormsViewProps {
  onConfigureForm: () => void;
  onSendInvites?: () => void;
  onViewProof: () => void;
  onUpdateForm?: (updates: Partial<CollectionForm>) => Promise<void> | void;
  reviews?: Review[];
  stats?: ReviewStats;
}

export const FormsView: React.FC<FormsViewProps> = ({
  onConfigureForm,
  onViewProof,
  onUpdateForm,
  reviews = [],
  stats,
}) => {
  const { project, collectionForm } = useAuth();
  const [copied, setCopied] = useState(false);
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
  const brandColor = collectionForm?.settings?.brandColor || '#6701e6';

  // Active Metrics Calculations
  const totalCount = reviews.length > 0 ? reviews.length : (stats?.total ?? 0);
  const approvedCount = reviews.length > 0 
    ? reviews.filter(r => r.status === 'approved').length 
    : (stats?.approvedCount ?? 0);

  const avgRating = stats?.averageRating && stats.averageRating > 0
    ? stats.averageRating.toFixed(1)
    : (reviews.length > 0 
        ? (reviews.reduce((sum, r) => sum + (r.rating || 5), 0) / reviews.length).toFixed(1) 
        : '5.0');

  const handleCopy = () => {
    navigator.clipboard.writeText(collectionUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
      } else if (mode === 'rating') {
        onUpdateForm({
          allowVideo: false,
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
    <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 space-y-6 font-sans">
      
      {/* Header & Unified Toolbar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-2 border-b border-gray-100">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight font-display">Collect testimonials</h1>
          <p className="text-xs text-gray-500 mt-1">
            Capture authentic customer reviews and ratings using your branded collection form.
          </p>
        </div>

        {/* 4. Unified Action Toolbar */}
        <div data-testid="collection-action-toolbar" className="flex flex-wrap items-center gap-2 self-start lg:self-auto">
          <button
            data-testid="toolbar-qr-btn"
            onClick={() => setShowQrModal(true)}
            className="px-3 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-[#6701e6] border border-purple-200 text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
            title="Generate QR code for tables, receipts, or packaging"
          >
            <QrCode className="w-3.5 h-3.5 shrink-0" />
            <span>QR Code</span>
          </button>

          <a
            data-testid="toolbar-test-live-btn"
            href={collectionUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-2 rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200 text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
            title="Open live collector form in new tab"
          >
            <span>Test Live Form</span>
            <ExternalLink className="w-3.5 h-3.5 text-gray-400" />
          </a>

          <button
            data-testid="toolbar-configure-btn"
            onClick={onConfigureForm}
            className="px-4 py-2 rounded-xl bg-[#6701e6] hover:bg-[#5200bd] text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0"
          >
            <Settings className="w-3.5 h-3.5 shrink-0" />
            <span>Configure collection form</span>
          </button>
        </div>
      </div>

      {/* 1. Actionable Empty State & Encouraging Inline Banner */}
      {totalCount === 0 && (
        <div className="rounded-2xl border border-violet-500/20 bg-gradient-to-r from-violet-500/10 via-indigo-500/10 to-purple-500/10 p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fade-in">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-violet-600/10 border border-violet-500/20 text-violet-700 flex items-center justify-center shrink-0 shadow-2xs">
              <Sparkles className="w-5 h-5 text-violet-600" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                Your collection form is live!
              </h3>
              <p className="text-xs text-slate-600 mt-0.5">
                Share your link or print your QR code to start gathering praise.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleCopy}
              className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-800 border border-slate-200/80 text-xs font-semibold shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
              <span>{copied ? 'Copied Link!' : 'Copy Share Link'}</span>
            </button>
            <button
              onClick={() => setShowQrModal(true)}
              className="px-3.5 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-semibold shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <QrCode className="w-3.5 h-3.5" />
              <span>Print QR Code</span>
            </button>
          </div>
        </div>
      )}

      {/* Primary Collection Form Card */}
      <div className="space-y-4">
        <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-7 shadow-xs hover:border-gray-300 transition-all space-y-6">
          
          {/* Top Section: Form Identity & Status Badges */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="space-y-2">
              <h2 className="text-xl font-bold text-gray-900 tracking-tight font-display">
                {formTitle}
              </h2>
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                    isFormActive
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-gray-100 text-gray-600 border-gray-200'
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${isFormActive ? 'bg-emerald-500 animate-pulse' : 'bg-gray-400'}`}></span>
                  {isFormActive ? 'Active • Accepting responses' : 'Paused / Inactive'}
                </span>

                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-50 text-purple-700 border border-purple-200">
                  <FileText className="w-3.5 h-3.5 text-purple-600" />
                  {reviewMode === 'video' ? 'Video + Text Enabled' : reviewMode === 'rating' ? 'Rating Focused' : 'Verified Text Mode'}
                </span>
              </div>
            </div>

            {/* 3. Interactive Review Mode Controls */}
            <div data-testid="review-mode-controls" className="flex flex-col gap-1.5">
              <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Feedback Mode</span>
              <div className="inline-flex items-center p-1 rounded-xl bg-gray-100 border border-gray-200/80 gap-1">
                <button
                  data-testid="mode-toggle-text"
                  type="button"
                  onClick={() => handleSelectMode('text')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                    reviewMode === 'text'
                      ? 'bg-white text-gray-900 shadow-2xs font-bold'
                      : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  <FileText className="w-3 h-3 text-purple-600" />
                  <span>Text + Rating</span>
                </button>

                <button
                  data-testid="mode-toggle-video"
                  type="button"
                  onClick={() => handleSelectMode('video')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                    reviewMode === 'video'
                      ? 'bg-white text-gray-900 shadow-2xs font-bold'
                      : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  <Video className="w-3 h-3 text-indigo-600" />
                  <span>Video Enabled</span>
                </button>

                <button
                  data-testid="mode-toggle-rating"
                  type="button"
                  onClick={() => handleSelectMode('rating')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                    reviewMode === 'rating'
                      ? 'bg-white text-gray-900 shadow-2xs font-bold'
                      : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  <Star className="w-3 h-3 text-amber-500" />
                  <span>Rating Only</span>
                </button>
              </div>
            </div>
          </div>

          {/* 2. Enhanced "Your Collection Link" Sub-Card & Customer Preview */}
          <div data-testid="collection-link-card" className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-gray-50 to-purple-50/30 border border-purple-100/80 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-gray-900">Your Collection Link</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">Live</span>
                </div>
                <p className="text-xs text-gray-500 mt-0.5 font-mono break-all select-all">
                  {collectionUrl}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  data-testid="copy-collection-link-btn"
                  onClick={handleCopy}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white hover:bg-gray-50 text-gray-800 border border-gray-300 shadow-2xs text-xs font-semibold transition-all cursor-pointer whitespace-nowrap"
                  title="Copy public form link"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-600 font-bold">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-gray-500" />
                      <span>Copy Link</span>
                    </>
                  )}
                </button>

                <a
                  href={collectionUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-[#6701e6] border border-purple-200 text-xs font-semibold transition-all cursor-pointer whitespace-nowrap"
                  title="Test link in new tab"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Preview</span>
                </a>
              </div>
            </div>

            {/* Customer Experience Micro-Preview Snippet */}
            <div data-testid="form-customer-preview-snippet" className="pt-3 border-t border-purple-100/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2.5">
                <div 
                  className="w-7 h-7 rounded-lg text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-2xs"
                  style={{ backgroundColor: brandColor }}
                >
                  {cleanBusinessName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <span className="font-bold text-gray-900">{cleanBusinessName}</span>
                  <span className="text-gray-400 mx-1.5">•</span>
                  <span className="text-gray-500">Customer feedback form view</span>
                </div>
              </div>

              <div className="flex items-center gap-2 text-gray-500">
                <div className="flex items-center text-amber-400">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} className="w-3.5 h-3.5 fill-amber-400" />
                  ))}
                </div>
                <span className="text-[11px] text-gray-400">5-star rating enabled</span>
              </div>
            </div>
          </div>

          {/* Activated Mandatory Metrics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 p-5 sm:p-6 rounded-2xl bg-gray-50/80 border border-gray-100">
            <div className="space-y-1">
              <span className="block text-2xl font-bold text-gray-900 tracking-tight">{totalCount}</span>
              <span className="text-xs font-bold text-gray-800">Total Collected</span>
              <p className="text-[11px] text-gray-500">Customer testimonials</p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-1.5">
                <span className="text-2xl font-bold text-gray-900 tracking-tight">{avgRating}</span>
                <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
              </div>
              <span className="text-xs font-bold text-gray-800">Average Rating</span>
              <p className="text-[11px] text-gray-500">From verified feedback</p>
            </div>
            <div className="space-y-1">
              <span className="block text-2xl font-bold text-emerald-600 tracking-tight">{approvedCount}</span>
              <span className="text-xs font-bold text-gray-800">Approved Proof</span>
              <p className="text-[11px] text-gray-500">Live on public widgets</p>
            </div>
            <div className="space-y-1">
              <span className="block text-2xl font-bold text-[#6701e6] tracking-tight">
                {reviewMode === 'video' ? 'Video + Text' : reviewMode === 'rating' ? 'Rating Only' : 'Text Only'}
              </span>
              <span className="text-xs font-bold text-gray-800">Active Review Mode</span>
              <p className="text-[11px] text-gray-500">
                {reviewMode === 'video' ? 'Video responses active' : reviewMode === 'rating' ? 'Star ratings only' : 'Video input suspended'}
              </p>
            </div>
          </div>

          {/* Bottom Action Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
            <div className="flex items-center gap-2.5">
              {totalCount === 0 ? (
                <>
                  <button
                    data-testid="preview-sample-submissions-btn"
                    onClick={onViewProof}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <span>Preview Sample Submissions</span>
                  </button>
                  <button
                    onClick={onViewProof}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold transition-all cursor-pointer"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-gray-500" />
                    <span>View Proof (0)</span>
                  </button>
                </>
              ) : (
                <button
                  onClick={onViewProof}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-900 hover:bg-gray-800 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                >
                  <MessageSquare className="w-4 h-4 text-purple-300" />
                  <span>View Proof ({totalCount})</span>
                </button>
              )}
            </div>

            <span className="text-xs text-gray-400 font-mono">
              Slug: /c/{publicSlug}
            </span>
          </div>

        </div>
      </div>

      {/* QR Code Modal */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-zinc-950 border border-zinc-800/80 rounded-3xl p-6 sm:p-7 max-w-3xl w-full shadow-2xl relative my-auto max-h-[94vh] overflow-y-auto">
            <button
              onClick={() => setShowQrModal(false)}
              className="absolute top-5 right-5 p-1.5 rounded-full text-zinc-400 hover:text-white hover:bg-white/10 transition-colors z-20"
              title="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
            <QrCodeGenerator onClose={() => setShowQrModal(false)} />
          </div>
        </div>
      )}

    </div>
  );
};
