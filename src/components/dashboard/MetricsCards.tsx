import React from 'react';
import { 
  Star, 
  Clock, 
  CheckCircle2, 
  MessageSquareQuote, 
  TrendingUp, 
  Sparkles 
} from 'lucide-react';
import { ReviewStats } from '../../types';

interface MetricsCardsProps {
  stats: ReviewStats;
  onFilterByStatus?: (status: any) => void;
  onFilterByRating?: (rating: number) => void;
}

export const MetricsCards: React.FC<MetricsCardsProps> = ({
  stats,
  onFilterByStatus,
  onFilterByRating,
}) => {
  const approvalRate = stats.total > 0 
    ? Math.round((stats.approvedCount / stats.total) * 100) 
    : 100;

  return (
    <div className="space-y-4">
      {/* Top 4 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Reviews */}
        <div className="glass-panel p-5 rounded-2xl border border-white/10 relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Total Reviews
            </span>
            <div className="p-2 rounded-xl bg-brand-500/10 text-brand-400 border border-brand-500/20">
              <MessageSquareQuote className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold font-display text-white">{stats.total}</span>
            <span className="text-xs text-zinc-400">across all channels</span>
          </div>
          <div className="mt-2 text-xs text-brand-300/80 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{stats.featuredCount} pinned as featured</span>
          </div>
        </div>

        {/* Average Rating */}
        <div className="glass-panel p-5 rounded-2xl border border-white/10 relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Average Rating
            </span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Star className="w-4 h-4 fill-amber-400" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold font-display text-white">
              {stats.averageRating > 0 ? stats.averageRating : '—'}
            </span>
            <span className="text-xs text-zinc-400">/ 5.0</span>
          </div>
          <div className="mt-2 flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star
                key={s}
                className={`w-3.5 h-3.5 ${
                  s <= Math.round(stats.averageRating)
                    ? 'text-amber-400 fill-amber-400'
                    : 'text-zinc-700'
                }`}
              />
            ))}
            <span className="text-xs text-zinc-400 ml-1">
              ({stats.approvedCount} approved)
            </span>
          </div>
        </div>

        {/* Pending Moderation */}
        <div 
          onClick={() => onFilterByStatus?.('pending')}
          className={`glass-panel p-5 rounded-2xl border transition-all cursor-pointer ${
            stats.pendingCount > 0 
              ? 'border-amber-500/40 bg-amber-500/5 hover:border-amber-400' 
              : 'border-white/10 hover:border-zinc-700'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Pending Moderation
            </span>
            <div className={`p-2 rounded-xl ${
              stats.pendingCount > 0 
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30 animate-pulse' 
                : 'bg-zinc-800 text-zinc-400'
            }`}>
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className={`text-3xl font-bold font-display ${stats.pendingCount > 0 ? 'text-amber-400' : 'text-white'}`}>
              {stats.pendingCount}
            </span>
            <span className="text-xs text-zinc-400">waiting for review</span>
          </div>
          <div className="mt-2 text-xs text-zinc-400">
            {stats.pendingCount > 0 ? 'Click to inspect pending queue' : 'Moderation queue is empty'}
          </div>
        </div>

        {/* Approval Rate */}
        <div className="glass-panel p-5 rounded-2xl border border-white/10 relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Approval Rate
            </span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold font-display text-white">{approvalRate}%</span>
            <span className="text-xs text-emerald-400 flex items-center gap-0.5">
              <CheckCircle2 className="w-3.5 h-3.5" /> {stats.approvedCount} live
            </span>
          </div>
          <div className="mt-2 text-xs text-zinc-400">
            {stats.rejectedCount} rejected • {stats.archivedCount} archived
          </div>
        </div>
      </div>

      {/* Rating Distribution Bar */}
      <div className="glass-panel p-4 rounded-2xl border border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="text-xs font-semibold uppercase tracking-wider text-zinc-400 shrink-0">
          Rating Breakdown:
        </div>
        <div className="grid grid-cols-5 gap-2 sm:gap-3 w-full max-w-2xl">
          {[5, 4, 3, 2, 1].map((rating) => {
            const count = stats.ratingBreakdown[rating] || 0;
            const percentage = stats.total > 0 ? Math.round((count / stats.total) * 100) : 0;
            return (
              <button
                key={rating}
                onClick={() => onFilterByRating?.(rating)}
                className="flex flex-col items-center gap-1 p-2 rounded-xl bg-zinc-900/80 hover:bg-zinc-800/80 border border-zinc-800 transition-colors text-center group"
                title={`Filter by ${rating} Stars (${count} reviews)`}
              >
                <div className="flex items-center gap-0.5 text-xs font-semibold text-zinc-300 group-hover:text-amber-300">
                  <span>{rating}</span>
                  <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                </div>
                <div className="w-full bg-zinc-800 rounded-full h-1.5 overflow-hidden">
                  <div 
                    className="bg-amber-400 h-full rounded-full transition-all duration-500" 
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="text-[10px] text-zinc-500">{count} ({percentage}%)</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
