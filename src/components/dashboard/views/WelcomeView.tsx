import React, { useState } from 'react';
import {
  ArrowRight,
  CheckCircle2,
  Copy,
  Check,
  ExternalLink,
  Download,
  QrCode,
  X,
  Star,
  Send,
  ThumbsUp,
  Globe,
  Sparkles,
  Layers,
  Sparkle,
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { QrCodeGenerator } from '../QrCodeGenerator';

interface WelcomeViewProps {
  onOpenForm: () => void;
  onCollect: () => void;
  onImport: () => void;
  onProof: () => void;
  onOpenWall?: () => void;
  onRichSnippet?: () => void;
  onWidgets?: () => void;
  reviews: Array<{ status: string; rating?: number; isSample?: boolean }>;
  publishComplete: boolean;
  isViewingSampleData?: boolean;
  onClearSampleData?: () => void;
}

export const WelcomeView: React.FC<WelcomeViewProps> = ({
  onOpenForm,
  onCollect,
  onImport,
  onProof,
  onOpenWall,
  onRichSnippet,
  onWidgets,
  reviews,
  publishComplete,
  isViewingSampleData = false,
  onClearSampleData,
}) => {
  const { project, collectionForm } = useAuth();
  const [copied, setCopied] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);

  const publicSlug = collectionForm?.publicSlug || project?.slug || 'feedback';
  const collectionUrl = `${window.location.origin}/c/${publicSlug}`;

  const hasProof = reviews.length > 0;
  const approvedReviews = reviews.filter((r) => r.status === 'approved');
  const hasApprovedProof = approvedReviews.length > 0;
  const pendingCount = reviews.filter((r) => r.status === 'pending').length;
  const avgRating = reviews.length > 0
    ? (reviews.reduce((acc, r) => acc + (r.rating || 5), 0) / reviews.length).toFixed(1)
    : '5.0';

  // Gamified onboarding checklist state
  const step1Done = hasProof || copied;
  const step2Done = hasApprovedProof;
  const step3Done = publishComplete;
  const completedSteps = Number(step1Done) + Number(step2Done) + Number(step3Done);
  const progressPercent = Math.round((completedSteps / 3) * 100);

  const handleCopyLink = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    navigator.clipboard.writeText(collectionUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWidgetsAction = onWidgets || onOpenWall || (() => {});

  return (
    <div className="max-w-5xl mx-auto py-2 sm:py-4 px-2 sm:px-4 space-y-5 animate-fade-in font-sans">

      {/* ── 1. Dismissible Dynamic Sample Data Banner ── */}
      {isViewingSampleData && (
        <aside aria-label="Sample Data Notification" className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-violet-600/10 via-purple-600/10 to-indigo-600/10 border border-violet-500/25 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs animate-fade-in backdrop-blur-md">
          <div className="flex items-center gap-2.5">
            <span className="flex h-2.5 w-2.5 relative shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-violet-600" />
            </span>
            <p className="text-xs sm:text-sm font-semibold text-slate-900 leading-snug">
              You are viewing sample reviews. Import your own or share your collection link to get started!
            </p>
          </div>
          {onClearSampleData && (
            <button
              type="button"
              onClick={onClearSampleData}
              className="apple-touch px-3.5 py-1.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200/90 text-xs font-bold text-slate-700 hover:text-slate-950 transition-all shrink-0 cursor-pointer shadow-2xs self-start sm:self-auto flex items-center gap-1.5"
            >
              <span>Clear Sample Data</span>
              <X className="w-3 h-3 text-slate-400" />
            </button>
          )}
        </aside>
      )}

      {/* ── Friendly Apple Welcome Header & Gamified Micro-Checklist ── */}
      <section className="apple-glass-card p-6 sm:p-7 relative overflow-hidden">
        <div className="absolute -top-16 -right-16 w-64 h-64 bg-violet-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-52 h-52 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-1.5 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-600/10 border border-violet-600/20 text-violet-700 text-xs font-bold tracking-tight">
              <span>✦</span>
              <span>Social Proof Engine</span>
              <span className="text-violet-300">•</span>
              <span className="text-slate-700 font-semibold">{project?.name || 'My Business'}</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-950 tracking-tight font-display">
              Turn buyer trust into automated sales.
            </h1>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
              Gather verified reviews effortlessly, style your collections, and put irresistible proof in front of every prospective customer.
            </p>
          </div>

          {/* Gamified Onboarding Progress Header (Micro-Checklist) */}
          <div data-testid="onboarding-checklist-header" className="shrink-0 w-full lg:w-80">
            <div className="p-3.5 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 shadow-xs backdrop-blur-md space-y-3">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-slate-900 flex items-center gap-1.5">
                  <Sparkle className="w-3.5 h-3.5 text-violet-600 fill-violet-600" />
                  <span>Onboarding Progress</span>
                </span>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-violet-100 text-violet-800">
                  {completedSteps} of 3 done ({progressPercent}%)
                </span>
              </div>

              {/* Smooth Animated Progress Bar */}
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-violet-600 to-indigo-600 h-2 rounded-full transition-all duration-700 ease-out"
                  style={{ width: `${Math.max(8, progressPercent)}%` }}
                />
              </div>

              {/* Micro-Checklist Items */}
              <div className="space-y-1.5 pt-1">
                <button
                  type="button"
                  onClick={onCollect}
                  className="w-full flex items-center justify-between text-left text-[11px] font-medium text-slate-700 hover:text-violet-700 transition-colors py-0.5 cursor-pointer"
                >
                  <span className="flex items-center gap-1.5 truncate">
                    {step1Done ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    ) : (
                      <span className="w-3.5 h-3.5 rounded-full border border-slate-300 shrink-0 inline-block" />
                    )}
                    <span className={step1Done ? 'line-through text-slate-400' : ''}>
                      Preview review form or share link
                    </span>
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">Step 1</span>
                </button>

                <button
                  type="button"
                  onClick={onProof}
                  className="w-full flex items-center justify-between text-left text-[11px] font-medium text-slate-700 hover:text-violet-700 transition-colors py-0.5 cursor-pointer"
                >
                  <span className="flex items-center gap-1.5 truncate">
                    {step2Done ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    ) : (
                      <span className="w-3.5 h-3.5 rounded-full border border-slate-300 shrink-0 inline-block" />
                    )}
                    <span className={step2Done ? 'line-through text-slate-400' : ''}>
                      Curate & style collection
                    </span>
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">Step 2</span>
                </button>

                <button
                  type="button"
                  onClick={handleWidgetsAction}
                  className="w-full flex items-center justify-between text-left text-[11px] font-medium text-slate-700 hover:text-violet-700 transition-colors py-0.5 cursor-pointer"
                >
                  <span className="flex items-center gap-1.5 truncate">
                    {step3Done ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    ) : (
                      <span className="w-3.5 h-3.5 rounded-full border border-slate-300 shrink-0 inline-block" />
                    )}
                    <span className={step3Done ? 'line-through text-slate-400' : ''}>
                      Preview live widgets & Wall of Love
                    </span>
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">Step 3</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 3 Big, Interactive Cards (Wizard Steps with Co-Primary Actions) ── */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">

        {/* STEP 1: Collect reviews from buyers */}
        <div
          data-testid="wizard-step-1"
          onClick={onCollect}
          className={`apple-glass-card p-5 sm:p-6 flex flex-col justify-between relative overflow-hidden transition-all cursor-pointer hover:shadow-lg hover:border-violet-500/50 group ${
            hasProof ? 'border-emerald-500/40 bg-emerald-50/20' : 'border-violet-500/30'
          }`}
        >
          <div>
            <div className="flex items-center justify-between gap-2 mb-3">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-violet-100 text-violet-800">
                Step 1 · Collect
              </span>
              {hasProof ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  {reviews.length} Received!
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-pulse" />
                  Waiting for reviews
                </span>
              )}
            </div>

            <div className="w-10 h-10 rounded-2xl bg-violet-600/10 text-violet-600 flex items-center justify-center mb-3 border border-violet-600/20 group-hover:scale-105 transition-transform">
              <Send className="w-5 h-5" />
            </div>

            <h3 className="text-base font-bold text-slate-950 tracking-tight group-hover:text-violet-700 transition-colors">
              1. Collect reviews from buyers
            </h3>

            <p className="text-xs text-slate-600 leading-relaxed mt-1.5 mb-3.5 font-normal">
              Send your link to customers, print an in-person QR stand, or sync existing Google & Meta reviews.
            </p>

            {/* Direct Form Link Capsule with 1-click Copy & QR code */}
            <div
              onClick={(e) => e.stopPropagation()}
              className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-2 mb-4 shadow-2xs"
            >
              <span className="text-[11px] font-mono text-slate-600 truncate select-all">{collectionUrl}</span>
              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="apple-touch px-2 py-1 rounded-lg text-[11px] font-bold text-violet-700 hover:bg-violet-100 transition-colors flex items-center gap-1 cursor-pointer"
                  title="Copy link"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowQrModal(true);
                  }}
                  className="apple-touch p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
                  title="Show QR Code"
                >
                  <QrCode className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Co-Primary Button Grid in Step 1 */}
          <div
            onClick={(e) => e.stopPropagation()}
            className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1"
          >
            <button
              type="button"
              data-testid="preview-review-form-btn"
              onClick={onOpenForm}
              className="apple-touch apple-btn-primary w-full flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-semibold cursor-pointer text-center"
              title="Open your public review form in a new tab"
            >
              <span>💌</span>
              <span className="truncate">Preview Review Form</span>
              <ExternalLink className="w-3.5 h-3.5 shrink-0 opacity-70" />
            </button>

            <button
              type="button"
              data-testid="import-reviews-btn"
              onClick={onImport}
              className="apple-touch w-full flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-semibold bg-violet-50 hover:bg-violet-100 text-violet-800 border border-violet-200/80 hover:border-violet-300 transition-all cursor-pointer text-center shadow-2xs"
              title="Import existing reviews from Google, Meta, Trustpilot, CSV and more"
            >
              <Download className="w-3.5 h-3.5 text-violet-600 shrink-0" />
              <span className="truncate">Import from Google & Meta</span>
            </button>
          </div>
        </div>

        {/* STEP 2: Customize your collections */}
        <div
          data-testid="wizard-step-2"
          onClick={onProof}
          className={`apple-glass-card p-5 sm:p-6 flex flex-col justify-between relative overflow-hidden transition-all cursor-pointer hover:shadow-lg hover:border-violet-500/50 group ${
            hasApprovedProof
              ? 'border-emerald-500/40 bg-emerald-50/20'
              : hasProof
              ? 'border-violet-500/30'
              : 'border-slate-200/80 opacity-90'
          }`}
        >
          <div>
            <div className="flex items-center justify-between gap-2 mb-3">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700">
                Step 2 · Customize
              </span>
              {hasApprovedProof ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  {approvedReviews.length} Approved!
                </span>
              ) : hasProof ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-pulse" />
                  {pendingCount} to review
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-500">
                  Waiting for step 1
                </span>
              )}
            </div>

            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center mb-3 border border-amber-500/20 group-hover:scale-105 transition-transform">
              <ThumbsUp className="w-5 h-5" />
            </div>

            <h3 className="text-base font-bold text-slate-950 tracking-tight group-hover:text-amber-700 transition-colors">
              2. Customize your collections
            </h3>

            <p className="text-xs text-slate-600 leading-relaxed mt-1.5 mb-4 font-normal">
              Approve customer praise, select Wall of Love themes, and curate the stories you showcase.
            </p>

            {/* Simple Stats Pill */}
            <div className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200/80 text-[11px] font-semibold text-slate-700 flex items-center justify-between mb-4 shadow-2xs">
              <span className="flex items-center gap-1">
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span>{approvedReviews.length} Approved</span>
              </span>
              <span className="text-slate-300">•</span>
              <span className="flex items-center gap-1">
                <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
                <span>{avgRating} Average</span>
              </span>
            </div>
          </div>

          <div onClick={(e) => e.stopPropagation()} className="pt-1">
            <button
              type="button"
              onClick={onProof}
              className={`apple-touch w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold cursor-pointer ${
                hasProof
                  ? 'apple-btn-primary'
                  : 'bg-slate-100 text-slate-500 hover:bg-slate-200/80'
              }`}
            >
              <div className="flex items-center gap-2">
                <span>⭐</span>
                <span>Curate & Style Collection ({reviews.length})</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* STEP 3: Post them on the internet */}
        <div
          data-testid="wizard-step-3"
          onClick={handleWidgetsAction}
          className={`apple-glass-card p-5 sm:p-6 flex flex-col justify-between relative overflow-hidden transition-all cursor-pointer hover:shadow-lg hover:border-violet-500/50 group ${
            publishComplete
              ? 'border-emerald-500/40 bg-emerald-50/20'
              : hasApprovedProof
              ? 'border-violet-500/30'
              : 'border-slate-200/80 opacity-90'
          }`}
        >
          <div>
            <div className="flex items-center justify-between gap-2 mb-3">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700">
                Step 3 · Post Online
              </span>
              {publishComplete ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  Live on Website!
                </span>
              ) : hasApprovedProof ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-violet-100 text-violet-800">
                  <Sparkles className="w-3.5 h-3.5 text-violet-600" />
                  Ready to post!
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-500">
                  Unlocks with reviews
                </span>
              )}
            </div>

            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center mb-3 border border-emerald-500/20 group-hover:scale-105 transition-transform">
              <Globe className="w-5 h-5" />
            </div>

            <h3 className="text-base font-bold text-slate-950 tracking-tight group-hover:text-emerald-700 transition-colors">
              3. Post them on the internet
            </h3>

            <p className="text-xs text-slate-600 leading-relaxed mt-1.5 mb-3 font-normal">
              Embed your live Wall of Love widget on your website with 1 line of HTML code.
            </p>

            {/* SEO Rich Snippets as Clean Secondary Option */}
            <div onClick={(e) => e.stopPropagation()} className="mb-3.5">
              <button
                type="button"
                onClick={onRichSnippet}
                className="w-full px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100/90 border border-slate-200/80 text-[11px] font-semibold text-slate-700 flex items-center justify-between transition-colors cursor-pointer group/seo"
              >
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3 text-amber-500" />
                  <span>Google Rich Snippets (SEO Schema)</span>
                </div>
                <ArrowRight className="w-3 h-3 text-slate-400 group-hover/seo:text-slate-600 transition-colors" />
              </button>
            </div>
          </div>

          <div onClick={(e) => e.stopPropagation()} className="pt-1">
            <button
              type="button"
              onClick={handleWidgetsAction}
              className="apple-touch apple-btn-primary w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold cursor-pointer shadow-xs"
            >
              <div className="flex items-center gap-2">
                <Layers className="w-3.5 h-3.5" />
                <span>Preview Live Widgets & Wall of Love</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </section>

      {/* QR Code Modal */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
          <div className="bg-white/95 backdrop-blur-2xl border border-slate-200/80 rounded-3xl p-6 sm:p-7 max-w-3xl w-full shadow-2xl relative my-auto max-h-[94vh] overflow-y-auto text-slate-900">
            <button
              type="button"
              onClick={() => setShowQrModal(false)}
              className="apple-touch absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors z-20 cursor-pointer"
              title="Close"
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

export default WelcomeView;
