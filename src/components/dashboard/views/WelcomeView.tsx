import React, { useState } from 'react';
import {
  Sparkles,
  Send,
  ThumbsUp,
  Globe,
  Copy,
  Check,
  ExternalLink,
  Download,
  QrCode,
  Star,
  X,
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { ReviewQrCardModal } from '../ReviewQrCardModal';

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
  onRichSnippet: _onRichSnippet,
  onWidgets,
  reviews,
  publishComplete,
  isViewingSampleData = false,
  onClearSampleData,
}) => {
  const { workspace, project, collectionForm } = useAuth();
  const [copied, setCopied] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);

  const publicSlug = collectionForm?.publicSlug || project?.slug || 'feedback';
  const collectionUrl = `${window.location.origin}/c/${publicSlug}`;

  const hasProof = reviews.length > 0;
  const approvedReviews = reviews.filter((r) => r.status === 'approved');
  const hasApprovedProof = approvedReviews.length > 0;
  const pendingCount = reviews.filter((r) => r.status === 'pending').length;
  const avgRating =
    approvedReviews.length > 0
      ? (approvedReviews.reduce((acc, r) => acc + (r.rating || 5), 0) / approvedReviews.length).toFixed(1)
      : '0.0';

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
    <div className="space-y-6 max-w-5xl mx-auto font-sans">
      {/* ── Optional Dynamic Sample Data Banner ── */}
      {isViewingSampleData && (
        <aside
          aria-label="Sample Data Notification"
          className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-violet-600/10 via-purple-600/10 to-indigo-600/10 border border-violet-500/25 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs animate-fade-in backdrop-blur-md"
        >
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
              className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200/90 text-xs font-bold text-slate-700 hover:text-slate-950 transition-all shrink-0 cursor-pointer shadow-2xs self-start sm:self-auto flex items-center gap-1.5"
            >
              <span>Clear Sample Data</span>
              <X className="w-3 h-3 text-slate-400" />
            </button>
          )}
        </aside>
      )}

      {/* ── 1. Full-Width Purple-to-Violet Hero Card ── */}
      <div className="relative rounded-3xl bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 text-white p-6 sm:p-8 overflow-hidden shadow-xl">
        <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Left: Badge, Headline, Supporting sentence */}
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold mb-3 border border-white/20">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Social Proof Engine</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Turn buyer trust into automated sales.
            </h1>
            <p className="text-xs sm:text-sm text-purple-100 mt-2 leading-relaxed">
              Gather verified reviews effortlessly, style your collections, and put irresistible proof in front of every prospective customer.
            </p>
          </div>

          {/* Right: Compact Onboarding Progress Block */}
          <div
            data-testid="onboarding-checklist-header"
            className="w-full lg:w-80 shrink-0 p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 space-y-3"
          >
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="flex items-center gap-1.5 text-white">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>Onboarding Progress</span>
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-white/20 text-white border border-white/20">
                {completedSteps} of 3 done ({progressPercent}%)
              </span>
            </div>

            {/* Thin progress bar */}
            <div className="w-full bg-white/20 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-white h-1.5 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${Math.max(6, progressPercent)}%` }}
              />
            </div>

            {/* Three numbered circles (1-2-3) */}
            <div className="flex items-center justify-between pt-1">
              {[
                { step: 1, label: 'Collect', done: step1Done, onClick: onCollect },
                { step: 2, label: 'Customize', done: step2Done, onClick: onProof },
                { step: 3, label: 'Post Online', done: step3Done, onClick: handleWidgetsAction },
              ].map((item, idx) => (
                <React.Fragment key={item.step}>
                  <button
                    type="button"
                    onClick={item.onClick}
                    className="flex items-center gap-2 cursor-pointer group"
                    title={`Step ${item.step}: ${item.label}`}
                  >
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                        item.done
                          ? 'bg-white text-purple-900 shadow-sm'
                          : 'bg-white/20 text-white border border-white/30'
                      }`}
                    >
                      {item.done ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : item.step}
                    </div>
                    <span className="text-[11px] font-medium text-purple-100 hidden sm:inline">
                      {item.label}
                    </span>
                  </button>
                  {idx < 2 && <div className="h-0.5 flex-1 bg-white/20 mx-2" />}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── 2. Three Equal-Width White Rounded Cards ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* CARD 1: Purple Accent · Collect reviews from buyers */}
        <div
          data-testid="wizard-step-1"
          onClick={onCollect}
          className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs flex flex-col justify-between cursor-pointer hover:shadow-md hover:border-purple-300 dark:hover:border-purple-700 transition-all group"
        >
          <div>
            <div className="flex items-center justify-between gap-2 mb-3">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300">
                Step 1 · Collect
              </span>
              {hasProof ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
                  <Check className="w-3 h-3 text-emerald-600" />
                  <span>{reviews.length} Received</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-amber-100 text-amber-800">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                  <span>Waiting for reviews</span>
                </span>
              )}
            </div>

            <div className="w-10 h-10 rounded-2xl bg-purple-100 dark:bg-purple-950/50 text-purple-700 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <Send className="w-5 h-5" />
            </div>

            <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-purple-700 transition-colors">
              Collect reviews from buyers
            </h3>

            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-4 leading-relaxed line-clamp-2">
              Send your link to customers, print an in-person QR stand, or sync existing Google &amp; Meta reviews.
            </p>

            {/* Copyable link field */}
            <div
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 mb-4"
            >
              <span className="flex-1 text-[11px] font-mono text-slate-600 dark:text-slate-300 truncate select-all px-1">
                {collectionUrl}
              </span>
              <button
                type="button"
                onClick={handleCopyLink}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-white dark:bg-slate-700 text-purple-700 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-950/40 border border-slate-200/80 dark:border-slate-600 shadow-2xs transition-all cursor-pointer shrink-0"
                title="Copy link"
              >
                {copied ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-600" />
                    <span>Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3 text-purple-700" />
                    <span>Copy</span>
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowQrModal(true);
                }}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors cursor-pointer"
                title="Show QR Code"
              >
                <QrCode className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Two buttons: Solid purple "Preview" + outline "Import" */}
          <div
            onClick={(e) => e.stopPropagation()}
            className="grid grid-cols-2 gap-2 mt-auto pt-2"
          >
            <button
              type="button"
              data-testid="preview-review-form-btn"
              onClick={onOpenForm}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-sm transition-all cursor-pointer"
              title="Preview review form in a new tab"
            >
              <span>Preview</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-80" />
            </button>
            <button
              type="button"
              data-testid="import-reviews-btn"
              onClick={onImport}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-white dark:bg-slate-800 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 hover:bg-purple-50 dark:hover:bg-purple-950/30 font-bold text-xs shadow-2xs transition-all cursor-pointer"
              title="Import reviews from Google & Meta"
            >
              <Download className="w-3.5 h-3.5 text-purple-600" />
              <span>Import</span>
            </button>
          </div>
        </div>

        {/* CARD 2: Orange Accent · Customize your collections */}
        <div
          data-testid="wizard-step-2"
          onClick={onProof}
          className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs flex flex-col justify-between cursor-pointer hover:shadow-md hover:border-amber-300 dark:hover:border-amber-700 transition-all group"
        >
          <div>
            <div className="flex items-center justify-between gap-2 mb-3">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300">
                Step 2 · Customize
              </span>
              {hasApprovedProof ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
                  <Check className="w-3 h-3 text-emerald-600" />
                  <span>{approvedReviews.length} Approved</span>
                </span>
              ) : hasProof ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-amber-100 text-amber-800">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                  <span>{pendingCount} to review</span>
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                  Waiting for step 1
                </span>
              )}
            </div>

            <div className="w-10 h-10 rounded-2xl bg-amber-100 dark:bg-amber-950/50 text-amber-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <ThumbsUp className="w-5 h-5" />
            </div>

            <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-amber-700 transition-colors">
              Customize your collections
            </h3>

            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-4 leading-relaxed line-clamp-2">
              Approve customer praise, select Wall of Love themes, and curate the stories you showcase.
            </p>

            {/* Mini-stats pill */}
            <div className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 mb-4 text-[11px] font-semibold text-slate-700 dark:text-slate-300">
              <span className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span>{approvedReviews.length} Approved</span>
              </span>
              <span className="text-slate-300 dark:text-slate-600">•</span>
              <span className="flex items-center gap-1.5">
                <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
                <span>{avgRating} Average</span>
              </span>
            </div>
          </div>

          {/* Button: Disabled gray or solid purple "Curate & Style" */}
          <div onClick={(e) => e.stopPropagation()} className="mt-auto pt-2">
            <button
              type="button"
              onClick={onProof}
              disabled={!hasProof}
              className={`w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                hasProof
                  ? 'bg-purple-600 hover:bg-purple-700 text-white shadow-sm cursor-pointer'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed border border-slate-200/60 dark:border-slate-700/60'
              }`}
            >
              <span>Curate &amp; Style Collection</span>
            </button>
          </div>
        </div>

        {/* CARD 3: Teal Accent · Post them on the internet */}
        <div
          data-testid="wizard-step-3"
          onClick={handleWidgetsAction}
          className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs flex flex-col justify-between cursor-pointer hover:shadow-md hover:border-teal-300 dark:hover:border-teal-700 transition-all group"
        >
          <div>
            <div className="flex items-center justify-between gap-2 mb-3">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-teal-50 text-teal-700 dark:bg-teal-950/40 dark:text-teal-300">
                Step 3 · Post Online
              </span>
              {publishComplete ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
                  <Check className="w-3 h-3 text-emerald-600" />
                  <span>Live on Website!</span>
                </span>
              ) : hasApprovedProof ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-teal-100 text-teal-800">
                  <Sparkles className="w-3 h-3 text-teal-600" />
                  <span>Ready to post!</span>
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                  Unlocks with reviews
                </span>
              )}
            </div>

            <div className="w-10 h-10 rounded-2xl bg-teal-100 dark:bg-teal-950/50 text-teal-700 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <Globe className="w-5 h-5" />
            </div>

            <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-teal-700 transition-colors">
              Post them on the internet
            </h3>

            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-4 leading-relaxed line-clamp-2">
              Embed your live Wall of Love widget on your website with 1 line of HTML code.
            </p>
          </div>

          {/* Button: Solid purple "Preview Live Widgets & Wall of Love" */}
          <div onClick={(e) => e.stopPropagation()} className="mt-auto pt-2">
            <button
              type="button"
              onClick={handleWidgetsAction}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-sm transition-all cursor-pointer"
            >
              <span>Preview Live Widgets &amp; Wall of Love</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-80" />
            </button>
          </div>
        </div>
      </div>

      {/* ── Direct Review QR Card Modal ── */}
      {showQrModal && (
        <ReviewQrCardModal
          isOpen={showQrModal}
          onClose={() => setShowQrModal(false)}
          workspaceId={project?.slug || collectionForm?.publicSlug || workspace?.slug || 'papasystem'}
          workspaceName={project?.name || collectionForm?.settings?.brandName || workspace?.name || 'papasystem'}
          userPlan={(workspace?.plan === 'free' ? 'starter' : workspace?.plan) || 'pro'}
        />
      )}
    </div>
  );
};

export default WelcomeView;
