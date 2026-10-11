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
  TrendingUp
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
  const sentimentPct = reviews.length > 0 
    ? Math.round((positiveReviews.length / reviews.length) * 100) 
    : 100;

  return (
    <div className="space-y-3 font-sans">
      {/* ── Main Luminous Review Pipeline Card ── */}
      <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-5 sm:p-6 shadow-[0_8px_24px_rgba(53,37,205,0.06)] dark:shadow-none flex flex-col gap-4">
        
        {/* Soft Ambient Radial Glow */}
        <div className="absolute -right-10 -top-10 w-48 h-48 bg-indigo-500/10 dark:bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-violet-500/10 dark:bg-violet-500/5 rounded-full blur-3xl pointer-events-none" />

        {/* Top Header Row with Badges and Batch Button */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 relative z-10">
          <div className="flex flex-col gap-1.5">
            
            {/* Status Pills */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200 text-xs font-semibold border border-amber-300/60 dark:border-amber-800">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                <span>{stats.pendingCount} Awaiting Moderation</span>
              </span>

              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-violet-100 dark:bg-violet-950/60 text-violet-800 dark:text-violet-200 text-xs font-semibold border border-violet-200/80 dark:border-violet-800">
                <Zap className="w-3 h-3 text-violet-600 dark:text-violet-400" />
                <span>Sync Active</span>
              </span>

              <span className="hidden md:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium text-slate-500 dark:text-slate-400">
                {projectName}
              </span>
            </div>

            {/* Headline & Description */}
            <h1 className="text-xl sm:text-2xl font-bold font-display text-slate-950 dark:text-white tracking-tight mt-1">
              Review Pipeline
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-xl">
              Moderate incoming customer proofs, verify authenticity, and broadcast live to your Wall of Love.
            </p>
          </div>

          {/* Quick Action Group */}
          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            <button
              type="button"
              onClick={onBatchToggle}
              className={`apple-touch flex items-center justify-center gap-1.5 h-10 px-4 rounded-xl text-xs font-semibold transition-all cursor-pointer shadow-sm active:scale-95 ${
                isBatchActive
                  ? 'bg-violet-700 text-white shadow-violet-500/25 ring-2 ring-violet-500/40'
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white'
              }`}
              title="Toggle multi-item bulk moderation"
            >
              <CheckSquare className="w-4 h-4" />
              <span>{isBatchActive ? 'Batch Active' : 'Batch'}</span>
            </button>

            <button
              type="button"
              onClick={onInviteCustomer}
              className="apple-touch flex items-center justify-center gap-1.5 h-10 px-3.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 text-xs font-semibold transition-colors cursor-pointer border border-slate-200/80 dark:border-slate-700"
              title="Copy review invitation link"
            >
              <Send className="w-3.5 h-3.5" />
              <span>+ Invite</span>
            </button>

            <button
              type="button"
              onClick={onOpenSocialCard}
              className="apple-touch flex items-center justify-center gap-1.5 h-10 px-3.5 rounded-xl bg-violet-50 dark:bg-violet-950/40 hover:bg-violet-100 dark:hover:bg-violet-900/40 text-violet-700 dark:text-violet-300 text-xs font-semibold transition-colors cursor-pointer border border-violet-200/80 dark:border-violet-800"
              title="Create branded quote image"
            >
              <Sparkles className="w-3.5 h-3.5 text-violet-600 dark:text-violet-400" />
              <span className="hidden sm:inline">Social Card</span>
            </button>

            <button
              type="button"
              onClick={onConfigure}
              className="apple-touch p-2.5 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer border border-slate-200/80 dark:border-slate-700"
              title="Configure Collection Form"
              aria-label="Configure Collection Form"
            >
              <Settings className="w-4 h-4" />
            </button>

            {onOpenHistory && (
              <button
                type="button"
                onClick={onOpenHistory}
                className="apple-touch p-2.5 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer border border-slate-200/80 dark:border-slate-700"
                title="Publish History"
                aria-label="Publish History"
              >
                <History className="w-4 h-4" />
              </button>
            )}

            {onOpenAccounts && (
              <button
                type="button"
                onClick={onOpenAccounts}
                className="apple-touch p-2.5 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 transition-colors cursor-pointer border border-emerald-200/80 dark:border-emerald-800"
                title="Connected Accounts"
                aria-label="Connected Accounts"
              >
                <LinkIcon className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* ── Micro AI Sentiment Ribbon ── */}
        <div className="relative z-10 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-full bg-violet-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <BrainCircuit className="w-4 h-4" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-1.5 truncate">
                <span>AI Sentiment {sentimentPct}% Positive</span>
                <TrendingUp className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 inline" />
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                Stable • {delightCount} Delight{delightCount === 1 ? '' : 's'}, {neutralReviews.length} Neutral
              </span>
            </div>
          </div>

          {onInspectSentiment && (
            <button
              type="button"
              onClick={onInspectSentiment}
              className="apple-touch px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 text-indigo-700 dark:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold shadow-2xs border border-slate-200/80 dark:border-slate-700 transition-all shrink-0 cursor-pointer flex items-center gap-1"
            >
              <span>Inspect</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          )}
        </div>

      </div>
    </div>
  );
};

export default ReviewPipelineHero;
