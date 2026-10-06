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
  Heart,
  MessageSquareQuote,
  Star,
  Layers,
  Send,
  ThumbsUp,
  Globe,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { QrCodeGenerator } from '../QrCodeGenerator';

interface WelcomeViewProps {
  onOpenForm: () => void;
  onCollect: () => void;
  onImport: () => void;
  onProof: () => void;
  onStudio: () => void;
  reviews: Array<{ status: string; rating?: number }>;
  publishComplete: boolean;
}

export const WelcomeView: React.FC<WelcomeViewProps> = ({
  onOpenForm,
  onCollect: _onCollect,
  onImport,
  onProof,
  onStudio,
  reviews,
  publishComplete,
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

  const completedSteps = Number(hasProof) + Number(hasApprovedProof) + Number(publishComplete);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(collectionUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto py-2 sm:py-4 px-2 sm:px-4 space-y-5 animate-fade-in font-sans">
      
      {/* ── Friendly Apple Welcome Header ── */}
      <section className="apple-glass-card p-6 sm:p-7 relative overflow-hidden">
        <div className="absolute -top-16 -right-16 w-64 h-64 bg-violet-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-52 h-52 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-1.5 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-600/10 border border-violet-600/20 text-violet-700 text-xs font-bold tracking-tight">
              <span>🚀</span>
              <span>Quick Start Guide</span>
              <span className="text-violet-300">•</span>
              <span className="text-slate-700 font-semibold">{project?.name || 'My Business'}</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-950 tracking-tight font-display">
              Get happy reviews in 3 easy steps
            </h1>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
              Share your link with customers, pick your favorite reviews, and show them on your website.
            </p>
          </div>

          {/* Simple Progress Counter (Light & Uncluttered) */}
          <div className="shrink-0">
            <div className="inline-flex items-center gap-2.5 px-3.5 py-2 rounded-2xl bg-slate-50/90 border border-slate-200/80 shadow-2xs">
              <div className="flex gap-1.5">
                {[1, 2, 3].map((step) => {
                  const isDone = step <= completedSteps;
                  return (
                    <div
                      key={step}
                      className={`h-2 w-5 rounded-full transition-all duration-500 ${
                        isDone ? 'bg-violet-600 shadow-xs shadow-violet-500/40' : 'bg-slate-200'
                      }`}
                    />
                  );
                })}
              </div>
              <span className="text-xs font-bold text-slate-800">
                {completedSteps} of 3 done
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ── 3 Big, Crystal-Clear Cards (Simple Enough for a 12-Year-Old) ── */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* STEP 1: Ask for Reviews */}
        <div className={`apple-glass-card p-5 sm:p-6 flex flex-col justify-between relative overflow-hidden transition-all ${
          hasProof ? 'border-emerald-500/40 bg-emerald-50/20' : 'border-violet-500/30'
        }`}>
          <div>
            <div className="flex items-center justify-between gap-2 mb-3">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-violet-100 text-violet-800">
                Step 1 · Start Here
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

            <div className="w-10 h-10 rounded-2xl bg-violet-600/10 text-violet-600 flex items-center justify-center mb-3 border border-violet-600/20">
              <Send className="w-5 h-5" />
            </div>

            <h3 className="text-base font-bold text-slate-950 tracking-tight">
              1. Ask for reviews
            </h3>

            <p className="text-xs text-slate-600 leading-relaxed mt-1.5 mb-3.5 font-normal">
              Send this link to anyone who bought from you. They click it and type why they love your product.
            </p>

            {/* Direct Form Link Capsule with 1-click Copy & QR code */}
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-2 mb-4 shadow-2xs">
              <span className="text-[11px] font-mono text-slate-600 truncate select-all">{collectionUrl}</span>
              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={handleCopyLink}
                  className="apple-touch px-2 py-1 rounded-lg text-[11px] font-bold text-violet-700 hover:bg-violet-100 transition-colors flex items-center gap-1 cursor-pointer"
                  title="Copy link"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
                <button
                  onClick={() => setShowQrModal(true)}
                  className="apple-touch p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
                  title="Show QR Code"
                >
                  <QrCode className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-2 pt-1">
            <button
              onClick={onOpenForm}
              className="apple-touch apple-btn-primary w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold cursor-pointer"
              title="Open your public review form in a new tab"
            >
              <div className="flex items-center gap-2">
                <span>💌</span>
                <span>Preview Review Form</span>
              </div>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={onImport}
              className="apple-touch apple-btn-secondary w-full flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Download className="w-3.5 h-3.5 text-violet-600" />
                <span>Import from Google & Meta</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
            </button>
          </div>
        </div>

        {/* STEP 2: Pick Your Favorites */}
        <div className={`apple-glass-card p-5 sm:p-6 flex flex-col justify-between relative overflow-hidden transition-all ${
          hasApprovedProof
            ? 'border-emerald-500/40 bg-emerald-50/20'
            : hasProof
            ? 'border-violet-500/30'
            : 'border-slate-200/80 opacity-90'
        }`}>
          <div>
            <div className="flex items-center justify-between gap-2 mb-3">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700">
                Step 2 · Moderate
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

            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center mb-3 border border-amber-500/20">
              <ThumbsUp className="w-5 h-5" />
            </div>

            <h3 className="text-base font-bold text-slate-950 tracking-tight">
              2. Pick your favorites
            </h3>

            <p className="text-xs text-slate-600 leading-relaxed mt-1.5 mb-4 font-normal">
              Read what people wrote. Click approve on the best reviews so they can be shown on your website.
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

          <div className="pt-1">
            <button
              onClick={onProof}
              className={`apple-touch w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold cursor-pointer ${
                hasProof
                  ? 'apple-btn-primary'
                  : 'bg-slate-100 text-slate-500 hover:bg-slate-200/80'
              }`}
            >
              <div className="flex items-center gap-2">
                <span>⭐</span>
                <span>Review Testimonials ({reviews.length})</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* STEP 3: Show Them Off */}
        <div className={`apple-glass-card p-5 sm:p-6 flex flex-col justify-between relative overflow-hidden transition-all ${
          publishComplete
            ? 'border-emerald-500/40 bg-emerald-50/20'
            : hasApprovedProof
            ? 'border-violet-500/30'
            : 'border-slate-200/80 opacity-90'
        }`}>
          <div>
            <div className="flex items-center justify-between gap-2 mb-3">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700">
                Step 3 · Go Live
              </span>
              {publishComplete ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  Live on Website!
                </span>
              ) : hasApprovedProof ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-violet-100 text-violet-800">
                  <Sparkles className="w-3.5 h-3.5 text-violet-600" />
                  Ready to show!
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-500">
                  Unlocks with reviews
                </span>
              )}
            </div>

            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center mb-3 border border-emerald-500/20">
              <Globe className="w-5 h-5" />
            </div>

            <h3 className="text-base font-bold text-slate-950 tracking-tight">
              3. Show them off
            </h3>

            <p className="text-xs text-slate-600 leading-relaxed mt-1.5 mb-4 font-normal">
              Put your reviews on your website. When visitors see happy customers, they trust you and buy!
            </p>

            {/* 4 Simple Widget Previews */}
            <div className="grid grid-cols-2 gap-1.5 mb-4">
              <div className="px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200/70 text-[11px] font-semibold text-slate-700 flex items-center gap-1.5">
                <Heart className="w-3 h-3 text-rose-500 fill-rose-500" />
                <span>Wall of Love</span>
              </div>
              <div className="px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200/70 text-[11px] font-semibold text-slate-700 flex items-center gap-1.5">
                <MessageSquareQuote className="w-3 h-3 text-violet-500" />
                <span>Popup Toast</span>
              </div>
              <div className="px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200/70 text-[11px] font-semibold text-slate-700 flex items-center gap-1.5">
                <Layers className="w-3 h-3 text-blue-500" />
                <span>Slider Carousel</span>
              </div>
              <div className="px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200/70 text-[11px] font-semibold text-slate-700 flex items-center gap-1.5">
                <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
                <span>Rating Badge</span>
              </div>
            </div>
          </div>

          <div className="pt-1">
            <button
              onClick={onStudio}
              className={`apple-touch w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold cursor-pointer ${
                hasApprovedProof
                  ? 'apple-btn-primary'
                  : 'bg-slate-900 hover:bg-slate-800 text-white shadow-xs'
              }`}
            >
              <div className="flex items-center gap-2">
                <span>🎨</span>
                <span>Customize Widgets</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </section>

      {/* QR Code Modal */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
          <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-7 max-w-3xl w-full shadow-2xl relative my-auto max-h-[94vh] overflow-y-auto">
            <button
              onClick={() => setShowQrModal(false)}
              className="apple-touch absolute top-5 right-5 p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors z-20 cursor-pointer"
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
