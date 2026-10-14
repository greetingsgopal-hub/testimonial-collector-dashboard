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
    <div className="space-y-6 font-sans">
      {/* ── 4 Equal White Metric Cards (Single Horizontal Row) ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        
        {/* Metric 1: Total Proof */}
        <div 
          onClick={() => onFilterByStatus?.('all')}
          className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs flex flex-col justify-between group active:scale-[0.99] cursor-pointer hover:border-purple-300 dark:hover:border-purple-700 transition-all"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Total Proof
            </span>
            <ShieldCheck className="w-4 h-4 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              {stats.total} Verified
            </span>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 font-medium">
              {stats.approvedCount} live on Wall
            </p>
          </div>
        </div>

        {/* Metric 2: Avg Rating */}
        <div 
          onClick={() => onFilterByRating?.(5)}
          className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs flex flex-col justify-between group active:scale-[0.99] cursor-pointer hover:border-purple-300 dark:hover:border-purple-700 transition-all"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Avg Rating
            </span>
            <Star className="w-4 h-4 text-amber-500 fill-amber-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                {avgRating}
              </span>
              <div className="flex items-center text-amber-400 text-xs">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    className={`w-3.5 h-3.5 ${
                      s <= Math.round(Number(avgRating))
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-slate-200 dark:text-slate-700'
                    }`}
                  />
                ))}
              </div>
            </div>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 font-medium">
              {stats.approvedCount} approved
            </p>
          </div>
        </div>

        {/* Metric 3: Pending Queue */}
        <div 
          onClick={() => onFilterByStatus?.('pending')}
          className={`p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border shadow-2xs flex flex-col justify-between group active:scale-[0.99] cursor-pointer transition-all ${
            stats.pendingCount > 0
              ? 'border-amber-300/80 dark:border-amber-800/80 hover:border-amber-400'
              : 'border-slate-200/80 dark:border-slate-800 hover:border-purple-300 dark:hover:border-purple-700'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Pending Queue
            </span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div>
            <span className={`text-xl sm:text-2xl font-black tracking-tight ${
              stats.pendingCount > 0
                ? 'text-amber-700 dark:text-amber-400'
                : 'text-slate-900 dark:text-white'
            }`}>
              {stats.pendingCount} Awaiting
            </span>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 font-medium">
              Median wait: 1.4h
            </p>
          </div>
        </div>

        {/* Metric 4: Direct Intake & Live Broadcast Status */}
        <div 
          onClick={() => onFilterByStatus?.(isAwaitingFirstApproval ? 'pending' : 'all')}
          className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs flex flex-col justify-between group active:scale-[0.99] cursor-pointer hover:border-purple-300 dark:hover:border-purple-700 transition-all"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Direct Intake
              <span className="sr-only">Live Broadcast Rate</span>
            </span>
            <Layers className="w-4 h-4 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            {isAwaitingFirstApproval ? (
              <div>
                <span className="text-xl sm:text-2xl font-black text-amber-600 dark:text-amber-400 tracking-tight">
                  Awaiting Approval
                </span>
                <p className="text-xs text-amber-700/80 dark:text-amber-300/80 mt-1 font-medium">
                  Ready to broadcast once approved ({stats.pendingCount} pending)
                </p>
              </div>
            ) : (
              <div>
                <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  100% Direct
                </span>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 font-medium">
                  Automated ingest
                </p>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* ── Rating Breakdown Card ── */}
      <div className="rounded-2xl sm:rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-4 sm:p-6 flex flex-col md:flex-row items-center justify-between gap-4 shadow-2xs">
        <div className="flex items-center gap-2 shrink-0">
          <Star className="w-4 h-4 text-amber-500 fill-amber-400" />
          <span className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">
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
                className="flex flex-col items-center gap-1.5 p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 hover:bg-purple-50/50 dark:hover:bg-slate-800 border border-slate-200/70 dark:border-slate-700 transition-all text-center group cursor-pointer"
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
