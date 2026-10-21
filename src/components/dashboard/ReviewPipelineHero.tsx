import React from 'react';
import { 
  Sparkles, 
  Send, 
  Settings, 
  History, 
  Link as LinkIcon, 
  CheckSquare, 
  BrainCircuit, 
  ArrowRight,
  Zap,
  TrendingUp,
  Video
} from 'lucide-react';
import { Review, ReviewStats } from '../../types';

interface ReviewPipelineHeroProps {
  stats: ReviewStats;
  reviews: Review[];
  projectName?: string;
  onBatchToggle: () => void;
  onInspectSentiment?: () => void;
  onInviteCustomer: () => void;
  onOpenSocialCard: () => void;
  onConfigure: () => void;
  onOpenHistory?: () => void;
  onOpenAccounts?: () => void;
  isBatchActive?: boolean;
}

export const ReviewPipelineHero: React.FC<ReviewPipelineHeroProps> = ({
  stats,
  reviews,
  projectName = 'Primary Workspace',
  onBatchToggle,
  onInspectSentiment,
  onInviteCustomer,
  onOpenSocialCard,
  onConfigure,
  onOpenHistory,
  onOpenAccounts,
  isBatchActive = false,
}) => {
  // Compute micro sentiment stats dynamically
  const positiveReviews = reviews.filter((r) => r.rating >= 4);
  const neutralReviews = reviews.filter((r) => r.rating === 3);
  const delightCount = reviews.filter((r) => r.rating === 5).length;
  const videoReviewCount = reviews.filter((r) => r.type === 'video' || Boolean(r.videoUrl)).length;
  const sentimentPct = reviews.length > 0 
    ? Math.round((positiveReviews.length / reviews.length) * 100) 
    : 100;

  return (
    <div className="space-y-6 font-sans">
      {/* ── Main Luminous Review Pipeline Card ── */}
      <div className="relative overflow-hidden rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 shadow-2xs flex flex-col gap-6">
        
        {/* Soft Ambient Radial Glow */}
        <div className="absolute -right-12 -top-12 w-64 h-64 bg-purple-500/10 dark:bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />

        {/* Top Header Row with Status Badges and Action Group */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 relative z-10">
          <div className="flex flex-col gap-2">
            
            {/* Status Pills */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200 text-xs font-bold border border-amber-300/60 dark:border-amber-800">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                <span>{stats.pendingCount} Awaiting Moderation</span>
              </span>

              {videoReviewCount > 0 && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-pink-100 dark:bg-pink-950/60 text-pink-900 dark:text-pink-200 text-xs font-bold border border-pink-200/80 dark:border-pink-800 animate-fade-in">
                  <Video className="w-3.5 h-3.5 text-pink-600 dark:text-pink-400" />
                  <span>{videoReviewCount} Video Proof{videoReviewCount === 1 ? '' : 's'}</span>
                </span>
              )}

              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-200 text-xs font-bold border border-purple-200/80 dark:border-purple-800">
                <Zap className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                <span>Sync Active</span>
              </span>

              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium text-slate-500 dark:text-slate-400">
                {projectName}
              </span>
            </div>

            {/* Headline & Description */}
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-950 dark:text-white tracking-tight mt-1">
              Review Pipeline
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-xl leading-relaxed">
              Moderate incoming customer proofs, verify authenticity, and broadcast live to your Wall of Love.
            </p>
          </div>

          {/* Quick Action Group */}
          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            <button
              type="button"
              onClick={onBatchToggle}
              className={`inline-flex items-center justify-center gap-2 h-10 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-2xs active:scale-95 ${
                isBatchActive
                  ? 'bg-purple-700 text-white shadow-purple-500/25 ring-2 ring-purple-500/40'
                  : 'bg-purple-600 hover:bg-purple-700 text-white'
              }`}
              title="Toggle multi-item bulk moderation"
            >
              <CheckSquare className="w-4 h-4" />
              <span>{isBatchActive ? 'Batch Active' : 'Batch'}</span>
            </button>

            <button
              type="button"
              onClick={onInviteCustomer}
              className="inline-flex items-center justify-center gap-1.5 h-10 px-3.5 rounded-xl bg-white dark:bg-slate-900 hover:bg-purple-50 dark:hover:bg-purple-950/30 text-purple-700 dark:text-purple-300 text-xs font-bold transition-all cursor-pointer border border-purple-200 dark:border-purple-800/80 shadow-2xs"
              title="Copy review invitation link"
            >
              <Send className="w-3.5 h-3.5" />
              <span>+ Invite</span>
            </button>

            <button
              type="button"
              onClick={onOpenSocialCard}
              className="inline-flex items-center justify-center gap-1.5 h-10 px-3.5 rounded-xl bg-white dark:bg-slate-900 hover:bg-purple-50 dark:hover:bg-purple-950/30 text-purple-700 dark:text-purple-300 text-xs font-bold transition-all cursor-pointer border border-purple-200 dark:border-purple-800/80 shadow-2xs"
              title="Create branded quote image"
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
              <span className="hidden sm:inline">Social Card</span>
            </button>

            <button
              type="button"
              onClick={onConfigure}
              className="p-2.5 h-10 w-10 rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-all cursor-pointer border border-slate-200/80 dark:border-slate-800 shadow-2xs flex items-center justify-center"
              title="Configure Collection Form"
              aria-label="Configure Collection Form"
            >
              <Settings className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={onOpenHistory}
              className="p-2.5 h-10 w-10 rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-all cursor-pointer border border-slate-200/80 dark:border-slate-800 shadow-2xs flex items-center justify-center"
              title="Publish History & Refresh"
              aria-label="Publish History & Refresh"
            >
              <History className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={onOpenAccounts}
              className="p-2.5 h-10 w-10 rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-purple-700 dark:text-purple-300 transition-all cursor-pointer border border-slate-200/80 dark:border-slate-800 shadow-2xs flex items-center justify-center"
              title="Connected Accounts"
              aria-label="Connected Accounts"
            >
              <LinkIcon className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ── Micro AI Sentiment Ribbon ── */}
        <div className="relative z-10 p-3.5 rounded-2xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-full bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 flex items-center justify-center shrink-0 shadow-2xs">
              <BrainCircuit className="w-4 h-4" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5 truncate">
                <span>AI Sentiment {sentimentPct}% Positive</span>
                <TrendingUp className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 inline" />
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                Stable · {delightCount} Delight{delightCount === 1 ? '' : 's'}, {neutralReviews.length} Neutral
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onInspectSentiment}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white dark:bg-slate-900 text-purple-700 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-950/40 text-xs font-bold border border-purple-200 dark:border-purple-800 shadow-2xs transition-all shrink-0 cursor-pointer"
          >
            <span>Inspect</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </div>
  );
};

export default ReviewPipelineHero;
