import React, { useState } from 'react';
import {
  ArrowRight,
  CheckCircle2,
  Copy,
  Check,
  ExternalLink,
  FileText,
  Sparkles,
  Download,
  QrCode,
  Smartphone,
  X,
  Layers,
  Heart,
  MessageSquareQuote,
  ShieldCheck,
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
  onCollect,
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
  const approvedReviews = reviews.filter(r => r.status === 'approved');
  const hasApprovedProof = approvedReviews.length > 0;
  const pendingCount = reviews.filter(r => r.status === 'pending').length;
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
    <div className="max-w-5xl mx-auto py-4 px-2 sm:px-4 space-y-6 animate-fade-in font-sans">
      
      {/* Apple Executive Hero Header */}
      <section className="apple-glass-card rounded-2xl p-6 sm:p-7 border border-black/[0.06] bg-white/80 backdrop-blur-2xl relative overflow-hidden">
        {/* Subtle Ambient Radial Glow */}
        <div className="absolute -top-16 -right-16 w-56 h-56 bg-violet-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-700 text-[11px] font-bold tracking-tight">
              <Sparkles className="w-3.5 h-3.5 text-violet-600" />
              <span>Social Proof Engine</span>
              <span className="text-violet-300">•</span>
              <span className="text-zinc-600 font-medium">{project?.name || 'Workspace'}</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-950 tracking-tight font-display">
              Social proof, engineered to convert.
            </h1>

            <p className="text-xs sm:text-sm text-zinc-500 leading-relaxed">
              Three precision stages to capture authentic customer praise, curate high-impact stories, and publish dynamic widgets across your website.
            </p>
          </div>

          {/* Apple Progress Capsule & Quick Form Preview */}
          <div className="shrink-0 flex flex-col sm:items-end gap-3">
            <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-zinc-50/80 border border-black/[0.06]">
              <div className="flex gap-1">
                {[1, 2, 3].map((step) => {
                  const isFilled = step <= completedSteps;
                  return (
                    <div
                      key={step}
                      className={`h-1.5 w-6 rounded-full transition-all duration-500 ${
                        isFilled ? 'bg-violet-600' : 'bg-zinc-200'
                      }`}
                    />
                  );
                })}
              </div>
              <span className="text-xs font-bold text-zinc-800">
                {completedSteps} / 3 complete
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyLink}
                className="apple-touch inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-zinc-50 text-zinc-800 border border-black/[0.08] text-xs font-semibold shadow-2xs transition-all cursor-pointer"
                title="Copy public collection URL"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-zinc-500" />}
                <span>{copied ? 'Copied Link' : 'Copy Link'}</span>
              </button>

              <button
                onClick={onOpenForm}
                className="apple-touch inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-semibold shadow-xs transition-all cursor-pointer"
                title="Preview live form as seen by your customers"
              >
                <span>Preview Form</span>
                <ExternalLink className="w-3 h-3 text-zinc-400" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Apple Bento Workflow Architecture (3 Intelligent Stages) */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
        
        {/* Stage 01 · Ingest & Connect */}
        <div className={`apple-glass-card rounded-2xl p-5 sm:p-6 border transition-all duration-300 flex flex-col justify-between relative overflow-hidden group ${
          hasProof ? 'border-emerald-500/20 bg-emerald-500/[0.02]' : 'border-violet-500/25 bg-violet-500/[0.02]'
        }`}>
          <div>
            <div className="flex items-center justify-between gap-2 mb-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 font-mono">
                Stage 01 · Ingest
              </span>
              {hasProof ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  {reviews.length} Captured
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-violet-50 text-violet-700 border border-violet-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-violet-600 animate-pulse" />
                  Action Required
                </span>
              )}
            </div>

            <h3 className="text-base font-bold text-zinc-950 tracking-tight">
              Capture & Ingest Proof
            </h3>

            <p className="text-xs text-zinc-500 leading-relaxed mt-1.5 mb-5">
              Collect authentic customer testimonials via your branded form, or sync verified ratings directly from Google Maps and Meta.
            </p>
          </div>

          <div className="space-y-2 pt-2">
            <button
              onClick={onCollect}
              className="apple-touch w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-semibold shadow-xs transition-all cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <FileText className="w-3.5 h-3.5 text-violet-300" />
                <span>Collection Form</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-zinc-400 group-hover:translate-x-0.5 transition-transform" />
            </button>

            <button
              onClick={onImport}
              className="apple-touch w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-white hover:bg-zinc-50 text-zinc-800 border border-black/[0.08] text-xs font-semibold shadow-2xs transition-all cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Download className="w-3.5 h-3.5 text-violet-600" />
                <span>Import Reviews (Google, Meta)</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-zinc-400 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </div>

        {/* Stage 02 · Curate & Verify */}
        <div className={`apple-glass-card rounded-2xl p-5 sm:p-6 border transition-all duration-300 flex flex-col justify-between relative overflow-hidden group ${
          hasApprovedProof
            ? 'border-emerald-500/20 bg-emerald-500/[0.02]'
            : hasProof
            ? 'border-violet-500/25 bg-violet-500/[0.02]'
            : 'border-black/[0.06] bg-white/70'
        }`}>
          <div>
            <div className="flex items-center justify-between gap-2 mb-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 font-mono">
                Stage 02 · Curate
              </span>
              {hasApprovedProof ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  {approvedReviews.length} Approved
                </span>
              ) : hasProof ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                  {pendingCount} Pending
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-zinc-100 text-zinc-400">
                  Awaiting Proof
                </span>
              )}
            </div>

            <h3 className="text-base font-bold text-zinc-950 tracking-tight">
              Curate & Spotlight
            </h3>

            <p className="text-xs text-zinc-500 leading-relaxed mt-1.5 mb-4">
              Review feedback, verify authenticity, and spotlight high-impact quotes ready for live embeds.
            </p>

            {/* Live Moderation Stats Spec */}
            <div className="px-3 py-2 rounded-xl bg-zinc-50/80 border border-black/[0.04] text-[11px] font-medium text-zinc-600 flex items-center justify-between mb-4">
              <span>Approved: <strong className="text-emerald-700">{approvedReviews.length}</strong></span>
              <span className="text-zinc-300">•</span>
              <span>Pending: <strong className="text-amber-700">{pendingCount}</strong></span>
              <span className="text-zinc-300">•</span>
              <span>Rating: <strong className="text-zinc-900">{avgRating}★</strong></span>
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={onProof}
              className={`apple-touch w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold shadow-xs transition-all cursor-pointer ${
                hasProof
                  ? 'bg-zinc-950 hover:bg-zinc-800 text-white'
                  : 'bg-zinc-100 text-zinc-400 hover:bg-zinc-200 hover:text-zinc-600'
              }`}
            >
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Moderate Library ({reviews.length})</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-zinc-400 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </div>

        {/* Stage 03 · Broadcast & Studio */}
        <div className={`apple-glass-card rounded-2xl p-5 sm:p-6 border transition-all duration-300 flex flex-col justify-between relative overflow-hidden group ${
          publishComplete
            ? 'border-emerald-500/20 bg-emerald-500/[0.02]'
            : hasApprovedProof
            ? 'border-violet-500/25 bg-violet-500/[0.02]'
            : 'border-black/[0.06] bg-white/70'
        }`}>
          <div>
            <div className="flex items-center justify-between gap-2 mb-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 font-mono">
                Stage 03 · Broadcast
              </span>
              {publishComplete ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  Live on Site
                </span>
              ) : hasApprovedProof ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-violet-50 text-violet-700 border border-violet-200">
                  <Sparkles className="w-3 h-3 text-violet-600" />
                  Ready to Embed
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-zinc-100 text-zinc-400">
                  Unlocks with Proof
                </span>
              )}
            </div>

            <h3 className="text-base font-bold text-zinc-950 tracking-tight">
              Studio & Embeds
            </h3>

            <p className="text-xs text-zinc-500 leading-relaxed mt-1.5 mb-4">
              Deploy approved testimonials as responsive Wall of Love grids, floating social proof toasts, and trust badges.
            </p>

            {/* Apple Micro-Widget Showcase Chips */}
            <div className="grid grid-cols-2 gap-1.5 mb-4">
              <div className="px-2 py-1.5 rounded-lg bg-zinc-50 border border-black/[0.04] text-[10px] font-semibold text-zinc-700 flex items-center gap-1.5">
                <Heart className="w-3 h-3 text-rose-500" />
                <span>Wall of Love</span>
              </div>
              <div className="px-2 py-1.5 rounded-lg bg-zinc-50 border border-black/[0.04] text-[10px] font-semibold text-zinc-700 flex items-center gap-1.5">
                <MessageSquareQuote className="w-3 h-3 text-violet-500" />
                <span>Social Toast</span>
              </div>
              <div className="px-2 py-1.5 rounded-lg bg-zinc-50 border border-black/[0.04] text-[10px] font-semibold text-zinc-700 flex items-center gap-1.5">
                <Layers className="w-3 h-3 text-blue-500" />
                <span>Marquee Carousel</span>
              </div>
              <div className="px-2 py-1.5 rounded-lg bg-zinc-50 border border-black/[0.04] text-[10px] font-semibold text-zinc-700 flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-amber-500" />
                <span>Trust Badge</span>
              </div>
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={onStudio}
              className={`apple-touch w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold shadow-xs transition-all cursor-pointer ${
                hasApprovedProof
                  ? 'bg-violet-600 hover:bg-violet-700 text-white shadow-violet-500/20'
                  : 'bg-zinc-950 hover:bg-zinc-800 text-white'
              }`}
            >
              <div className="flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Launch Studio</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-violet-200 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </div>

      </section>

      {/* Integrated Apple Quick Launch Dock (High-Efficiency Spatial Utility) */}
      <section className="apple-glass-card rounded-2xl p-4 sm:p-5 border border-black/[0.06] bg-white/80 backdrop-blur-xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center shrink-0">
            <Smartphone className="w-5 h-5 text-violet-700" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold text-zinc-950 tracking-tight">
              Customer Collection Link
            </p>
            <p className="text-[11px] font-mono text-zinc-500 truncate max-w-xs sm:max-w-md">
              {collectionUrl}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <button
            onClick={() => setShowQrModal(true)}
            className="apple-touch px-3 py-1.5 rounded-xl bg-white hover:bg-zinc-50 text-zinc-800 border border-black/[0.08] text-xs font-semibold shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer"
            title="Generate high-resolution QR code"
          >
            <QrCode className="w-3.5 h-3.5 text-zinc-600" />
            <span>QR Code</span>
          </button>

          <button
            onClick={handleCopyLink}
            className="apple-touch px-3 py-1.5 rounded-xl bg-white hover:bg-zinc-50 text-zinc-800 border border-black/[0.08] text-xs font-semibold shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer"
            title="Copy link"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-zinc-500" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>

          <button
            onClick={onOpenForm}
            className="apple-touch px-3.5 py-1.5 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-semibold shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
            title="Open customer collection form"
          >
            <span>Open Form</span>
            <ExternalLink className="w-3 h-3 text-zinc-400" />
          </button>
        </div>
      </section>

      {/* High-Resolution Apple QR Modal */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
          <div className="bg-zinc-950 border border-zinc-800/80 rounded-3xl p-6 sm:p-7 max-w-3xl w-full shadow-2xl relative my-auto max-h-[94vh] overflow-y-auto">
            <button
              onClick={() => setShowQrModal(false)}
              className="apple-touch absolute top-5 right-5 p-1.5 rounded-full text-zinc-400 hover:text-white hover:bg-white/10 transition-colors z-20 cursor-pointer"
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

export default WelcomeView;
