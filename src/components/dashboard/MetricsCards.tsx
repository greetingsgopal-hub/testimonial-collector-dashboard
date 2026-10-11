import React from 'react';
import { 
  Star, 
  Clock, 
  ShieldCheck, 
  Layers
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
  const avgRating = stats.averageRating > 0 ? Number(stats.averageRating).toFixed(1) : '5.0';
  const isAwaitingFirstApproval = stats.total > 0 && stats.approvedCount === 0 && stats.pendingCount > 0;

  return (
    <div className="space-y-3 font-sans">
      {/* ── Horizontal Scrollable Luminous Metric Strip ── */}
      <div className="flex items-stretch gap-3 overflow-x-auto pb-1 no-scrollbar sm:grid sm:grid-cols-2 lg:grid-cols-4">
        
        {/* Metric 1: Total Proof */}
        <div 
          onClick={() => onFilterByStatus?.('all')}
          className="shrink-0 w-48 sm:w-auto rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-4 shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group active:scale-[0.99]"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Total Proof
            </span>
            <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2.5 flex items-baseline gap-1.5">
            <span className="text-xl sm:text-2xl font-bold font-display text-slate-900 dark:text-white tracking-tight">
              {stats.total} Verified
            </span>
          </div>
          <span className="text-xs text-slate-400 dark:text-slate-500 mt-1 font-medium">
            {stats.approvedCount} live on Wall
          </span>
        </div>

        {/* Metric 2: Avg Rating */}
        <div 
          onClick={() => onFilterByRating?.(5)}
          className="shrink-0 w-48 sm:w-auto rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-4 shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group active:scale-[0.99]"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Avg Rating
            </span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-500 flex items-center justify-center">
              <Star className="w-4 h-4 fill-amber-400" />
            </div>
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-xl sm:text-2xl font-bold font-display text-slate-900 dark:text-white tracking-tight">
              {avgRating}
            </span>
            <div className="flex items-center text-amber-400 text-xs">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  className={`w-3 h-3 ${
                    s <= Math.round(Number(avgRating))
                      ? 'fill-amber-400 text-amber-400'
                      : 'text-slate-200 dark:text-slate-700'
                  }`}
                />
              ))}
            </div>
          </div>
          <span className="text-xs text-slate-400 dark:text-slate-500 mt-1 font-medium">
            {stats.approvedCount} approved
          </span>
        </div>

        {/* Metric 3: Pending Queue */}
        <div 
          onClick={() => onFilterByStatus?.('pending')}
          className={`shrink-0 w-48 sm:w-auto rounded-2xl bg-white dark:bg-slate-900 border p-4 shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group active:scale-[0.99] ${
            stats.pendingCount > 0
              ? 'border-amber-300/80 dark:border-amber-800/80 bg-amber-50/30 dark:bg-amber-950/20'
              : 'border-slate-200/80 dark:border-slate-800'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Pending Queue
            </span>
            <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
              stats.pendingCount > 0
                ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
            }`}>
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2.5 flex items-baseline gap-1.5">
            <span className={`text-xl sm:text-2xl font-bold font-display tracking-tight ${
              stats.pendingCount > 0
                ? 'text-amber-700 dark:text-amber-400'
                : 'text-slate-900 dark:text-white'
            }`}>
              {stats.pendingCount} Awaiting
            </span>
          </div>
          <span className="text-xs text-slate-400 dark:text-slate-500 mt-1 font-medium">
            {stats.pendingCount > 0 ? 'Action required' : 'Median wait: 1.4h'}
          </span>
        </div>

        {/* Metric 4: Direct Intake & Live Broadcast Status */}
        <div 
          onClick={() => onFilterByStatus?.(isAwaitingFirstApproval ? 'pending' : 'all')}
          className="shrink-0 w-48 sm:w-auto rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-4 shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group active:scale-[0.99]"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              {isAwaitingFirstApproval ? 'Live Broadcast Rate' : 'Direct Intake'}
            </span>
            <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
              isAwaitingFirstApproval
                ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400'
                : 'bg-violet-50 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400'
            }`}>
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2.5 flex items-baseline gap-1.5">
            {isAwaitingFirstApproval ? (
              <span className="text-lg sm:text-xl font-bold font-display text-amber-600 dark:text-amber-400 tracking-tight">
                Awaiting Approval
              </span>
            ) : (
              <span className="text-xl sm:text-2xl font-bold font-display text-slate-900 dark:text-white tracking-tight">
                100% Direct
              </span>
            )}
            {isAwaitingFirstApproval && (
              <span className="text-xs font-semibold text-amber-700 dark:text-amber-300">
                {stats.pendingCount} pending
              </span>
            )}
          </div>
          <span className="text-xs text-slate-400 dark:text-slate-500 mt-1 font-medium">
            {isAwaitingFirstApproval ? 'Ready to broadcast once approved' : 'Automated ingest'}
          </span>
        </div>

      </div>

      {/* ── Apple Rating Breakdown Track ── */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-3.5 sm:p-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-2xs">
        <div className="flex items-center gap-2 shrink-0">
          <Star className="w-4 h-4 text-amber-500 fill-amber-400" />
          <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
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
                type="button"
                onClick={() => onFilterByRating?.(rating)}
                className="apple-touch flex flex-col items-center gap-1.5 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/70 dark:border-slate-700 transition-all text-center group cursor-pointer"
                title={`Filter by ${rating} Stars (${count} reviews)`}
              >
                <div className="flex items-center gap-1 text-xs font-bold text-slate-700 dark:text-slate-300 group-hover:text-amber-600 dark:group-hover:text-amber-400">
                  <span>{rating}</span>
                  <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-amber-400 to-amber-500 h-full rounded-full transition-all duration-500" 
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold">{count} ({percentage}%)</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default MetricsCards;
