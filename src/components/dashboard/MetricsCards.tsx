import React from 'react';
import { 
  Star, 
  Clock, 
  CheckCircle2, 
  MessageSquareQuote, 
  TrendingUp, 
  Sparkles,
  ArrowUpRight
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
    <div className="space-y-4 font-sans">
      {/* Top 4 Apple Tactile KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Reviews */}
        <div 
          onClick={() => onFilterByStatus?.('all')}
          className="apple-glass-card p-5 relative overflow-hidden group cursor-pointer apple-touch"
        >
          <div className="flex items-center justify-between relative z-10">
            <span className="text-[11px] font-bold tracking-wider uppercase text-slate-500">
              Total Proof
            </span>
            <div className="w-8 h-8 rounded-xl bg-violet-500/10 text-violet-600 flex items-center justify-center border border-violet-500/20 group-hover:scale-105 transition-transform">
              <MessageSquareQuote className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2 relative z-10">
            <span className="text-3xl font-extrabold font-display text-slate-900 tracking-tight">{stats.total}</span>
            <span className="text-xs text-slate-500 font-medium">verified</span>
          </div>
          <div className="mt-2 text-xs text-violet-700 font-semibold flex items-center gap-1.5 relative z-10">
            <Sparkles className="w-3.5 h-3.5 text-violet-500" />
            <span>{stats.featuredCount} on Wall of Love</span>
          </div>
        </div>

        {/* Average Rating */}
        <div 
          onClick={() => onFilterByRating?.(5)}
          className="apple-glass-card p-5 relative overflow-hidden group cursor-pointer apple-touch"
        >
          <div className="flex items-center justify-between relative z-10">
            <span className="text-[11px] font-bold tracking-wider uppercase text-slate-500">
              Average Rating
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center border border-amber-500/20 group-hover:scale-105 transition-transform">
              <Star className="w-4 h-4 fill-amber-400 text-amber-500" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2 relative z-10">
            <span className="text-3xl font-extrabold font-display text-slate-900 tracking-tight">
              {stats.averageRating > 0 ? stats.averageRating : '5.0'}
            </span>
            <span className="text-xs text-slate-500 font-medium">/ 5.0</span>
          </div>
          <div className="mt-2 flex items-center gap-1 relative z-10">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star
                key={s}
                className={`w-3.5 h-3.5 ${
                  s <= Math.round(stats.averageRating || 5)
                    ? 'text-amber-400 fill-amber-400'
                    : 'text-slate-200'
                }`}
              />
            ))}
            <span className="text-xs text-slate-500 ml-1.5 font-medium">
              ({stats.approvedCount} approved)
            </span>
          </div>
        </div>

        {/* Pending Moderation */}
        <div 
          onClick={() => onFilterByStatus?.('pending')}
          className={`apple-glass-card p-5 relative overflow-hidden group cursor-pointer apple-touch ${
            stats.pendingCount > 0 
              ? 'border-amber-400/60 bg-amber-50/40' 
              : ''
          }`}
        >
          <div className="flex items-center justify-between relative z-10">
            <span className="text-[11px] font-bold tracking-wider uppercase text-slate-500">
              Queue Status
            </span>
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center border transition-transform group-hover:scale-105 ${
              stats.pendingCount > 0 
                ? 'bg-amber-500/20 text-amber-700 border-amber-500/30' 
                : 'bg-slate-100 text-slate-500 border-slate-200'
            }`}>
              <Clock className={`w-4 h-4 ${stats.pendingCount > 0 ? 'animate-pulse' : ''}`} />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2 relative z-10">
            <span className={`text-3xl font-extrabold font-display tracking-tight ${
              stats.pendingCount > 0 ? 'text-amber-600' : 'text-slate-900'
            }`}>
              {stats.pendingCount}
            </span>
            <span className="text-xs text-slate-500 font-medium">in queue</span>
          </div>
          <div className="mt-2 text-xs text-slate-500 font-medium flex items-center gap-1 relative z-10">
            {stats.pendingCount > 0 ? (
              <span className="text-amber-700 font-semibold flex items-center gap-1">
                <span>Review queue</span>
                <ArrowUpRight className="w-3 h-3" />
              </span>
            ) : (
              <span className="text-emerald-600 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> All caught up
              </span>
            )}
          </div>
        </div>

        {/* Approval Rate */}
        <div 
          onClick={() => onFilterByStatus?.('approved')}
          className="apple-glass-card p-5 relative overflow-hidden group cursor-pointer apple-touch"
        >
          <div className="flex items-center justify-between relative z-10">
            <span className="text-[11px] font-bold tracking-wider uppercase text-slate-500">
              Live Broadcast Rate
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center border border-emerald-500/20 group-hover:scale-105 transition-transform">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2 relative z-10">
            <span className="text-3xl font-extrabold font-display text-slate-900 tracking-tight">{approvalRate}%</span>
            <span className="text-xs text-emerald-600 font-semibold flex items-center gap-0.5">
              <CheckCircle2 className="w-3.5 h-3.5" /> {stats.approvedCount} live
            </span>
          </div>
          <div className="mt-2 text-xs text-slate-400 relative z-10 font-medium">
            {stats.rejectedCount} archived / filtered
          </div>
        </div>
      </div>

      {/* Apple Rating Breakdown Track */}
      <div className="apple-glass-card p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 shrink-0">
          <Star className="w-4 h-4 text-amber-500 fill-amber-400" />
          <span className="text-xs font-bold text-slate-800">
            Rating Breakdown:
          </span>
        </div>
        <div className="grid grid-cols-5 gap-2 sm:gap-3 w-full max-w-2xl">
          {[5, 4, 3, 2, 1].map((rating) => {
            const count = stats.ratingBreakdown[rating] || 0;
            const percentage = stats.total > 0 ? Math.round((count / stats.total) * 100) : 0;
            return (
              <button
                key={rating}
                onClick={() => onFilterByRating?.(rating)}
                className="apple-touch flex flex-col items-center gap-1.5 p-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200/70 transition-all text-center group cursor-pointer"
                title={`Filter by ${rating} Stars (${count} reviews)`}
              >
                <div className="flex items-center gap-1 text-xs font-bold text-slate-700 group-hover:text-amber-600">
                  <span>{rating}</span>
                  <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                </div>
                <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-amber-400 to-amber-500 h-full rounded-full transition-all duration-500" 
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="text-[10px] text-slate-500 font-semibold">{count} ({percentage}%)</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
export default MetricsCards;
