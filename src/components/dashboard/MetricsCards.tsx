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
    <div className="space-y-4 font-sans">
      {/* Top 4 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Reviews */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
              Total Reviews
            </span>
            <div className="p-2 rounded-xl bg-purple-50 text-[#6701e6] border border-purple-100">
              <MessageSquareQuote className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold font-display text-gray-950">{stats.total}</span>
            <span className="text-xs text-gray-500">across all channels</span>
          </div>
          <div className="mt-2 text-xs text-purple-700 font-medium flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{stats.featuredCount} pinned as featured</span>
          </div>
        </div>

        {/* Average Rating */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
              Average Rating
            </span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600 border border-amber-100">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold font-display text-gray-950">
              {stats.averageRating > 0 ? stats.averageRating : '—'}
            </span>
            <span className="text-xs text-gray-500">/ 5.0</span>
          </div>
          <div className="mt-2 flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star
                key={s}
                className={`w-3.5 h-3.5 ${
                  s <= Math.round(stats.averageRating)
                    ? 'text-amber-400 fill-amber-400'
                    : 'text-gray-300'
                }`}
              />
            ))}
            <span className="text-xs text-gray-500 ml-1 font-medium">
              ({stats.approvedCount} approved)
            </span>
          </div>
        </div>

        {/* Pending Moderation */}
        <div 
          onClick={() => onFilterByStatus?.('pending')}
          className={`p-5 rounded-2xl border transition-all cursor-pointer shadow-xs ${
            stats.pendingCount > 0 
              ? 'border-amber-400 bg-amber-50/50 hover:bg-amber-50' 
              : 'bg-white border-gray-200 hover:border-gray-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
              Pending Moderation
            </span>
            <div className={`p-2 rounded-xl ${
              stats.pendingCount > 0 
                ? 'bg-amber-100 text-amber-700 border border-amber-200 animate-pulse' 
                : 'bg-gray-100 text-gray-500'
            }`}>
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className={`text-3xl font-extrabold font-display ${stats.pendingCount > 0 ? 'text-amber-600' : 'text-gray-950'}`}>
              {stats.pendingCount}
            </span>
            <span className="text-xs text-gray-500">waiting for review</span>
          </div>
          <div className="mt-2 text-xs text-gray-500 font-medium">
            {stats.pendingCount > 0 ? 'Click to inspect pending queue' : 'Moderation queue is empty'}
          </div>
        </div>

        {/* Approval Rate */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
              Approval Rate
            </span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold font-display text-gray-950">{approvalRate}%</span>
            <span className="text-xs text-emerald-600 font-bold flex items-center gap-0.5">
              <CheckCircle2 className="w-3.5 h-3.5" /> {stats.approvedCount} live
            </span>
          </div>
          <div className="mt-2 text-xs text-gray-500">
            {stats.rejectedCount} rejected • {stats.archivedCount} archived
          </div>
        </div>
      </div>

      {/* Rating Distribution Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="text-xs font-bold uppercase tracking-wider text-gray-500 shrink-0">
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
                className="flex flex-col items-center gap-1 p-2 rounded-xl bg-gray-50 hover:bg-gray-100 border border-gray-200 transition-colors text-center group cursor-pointer"
                title={`Filter by ${rating} Stars (${count} reviews)`}
              >
                <div className="flex items-center gap-0.5 text-xs font-bold text-gray-700 group-hover:text-amber-600">
                  <span>{rating}</span>
                  <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                  <div 
                    className="bg-amber-400 h-full rounded-full transition-all duration-500" 
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="text-[10px] text-gray-400 font-medium">{count} ({percentage}%)</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
export default MetricsCards;
