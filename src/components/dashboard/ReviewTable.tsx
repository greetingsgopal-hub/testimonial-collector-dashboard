import React from 'react';
import { 
  Star, 
  Check, 
  X, 
  Archive, 
  Trash2, 
  Sparkles, 
  Clock 
} from 'lucide-react';
import { Review, ReviewStatus } from '../../types';

interface ReviewTableProps {
  reviews: Review[];
  onUpdateStatus: (id: string, status: ReviewStatus) => void;
  onToggleFeatured: (id: string, current: boolean) => void;
  onDelete: (id: string) => void;
  onOpenDetails: (review: Review) => void;
  onOpenSocialCard?: (review: Review) => void;
}

export const ReviewTable: React.FC<ReviewTableProps> = ({
  reviews,
  onUpdateStatus,
  onToggleFeatured,
  onDelete,
  onOpenDetails,
  onOpenSocialCard,
}) => {
  const getStatusBadge = (status: ReviewStatus) => {
    switch (status) {
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            <Check className="w-2.5 h-2.5" /> Approved
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/30 animate-pulse">
            <Clock className="w-2.5 h-2.5" /> Pending
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-red-500/15 text-red-400 border border-red-500/30">
            <X className="w-2.5 h-2.5" /> Rejected
          </span>
        );
      case 'archived':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-zinc-800 text-zinc-400 border border-zinc-700">
            <Archive className="w-2.5 h-2.5" /> Archived
          </span>
        );
    }
  };

  return (
    <div className="glass-panel rounded-2xl border border-white/10 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs sm:text-sm">
          <thead className="bg-zinc-900/90 text-zinc-400 border-b border-zinc-800 text-[11px] uppercase tracking-wider font-semibold">
            <tr>
              <th className="py-3.5 px-4">Reviewer</th>
              <th className="py-3.5 px-4">Rating</th>
              <th className="py-3.5 px-4">Feedback Content</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-4">Date</th>
              <th className="py-3.5 px-4 text-right">Moderation Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/60">
            {reviews.map((review) => (
              <tr 
                key={review.id}
                className="hover:bg-zinc-800/30 transition-colors cursor-pointer group"
                onClick={() => onOpenDetails(review)}
              >
                {/* Reviewer Column */}
                <td className="py-3 px-4 whitespace-nowrap">
                  <div className="flex items-center gap-3">
                    {review.avatarUrl ? (
                      <img
                        src={review.avatarUrl}
                        alt={review.name}
                        className="w-8 h-8 rounded-full object-cover ring-1 ring-zinc-700 shrink-0"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-brand-600 to-indigo-600 flex items-center justify-center font-bold text-white text-xs shrink-0">
                        {review.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="min-w-0">
                      <div className="font-semibold text-white flex items-center gap-1.5">
                        <span>{review.name}</span>
                        {review.isFeatured && (
                          <Sparkles className="w-3 h-3 text-amber-400 fill-amber-400" />
                        )}
                      </div>
                      <div className="text-[11px] text-zinc-400 truncate">
                        {review.role} {review.company ? `• ${review.company}` : ''}
                      </div>
                    </div>
                  </div>
                </td>

                {/* Rating */}
                <td className="py-3 px-4 whitespace-nowrap">
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={`w-3.5 h-3.5 ${
                          s <= review.rating
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-zinc-700'
                        }`}
                      />
                    ))}
                  </div>
                </td>

                {/* Content */}
                <td className="py-3 px-4 max-w-xs md:max-w-md">
                  <p className="text-zinc-300 text-xs line-clamp-2">
                    {review.title && <strong className="text-white font-medium mr-1">{review.title} —</strong>}
                    "{review.content}"
                  </p>
                </td>

                {/* Status */}
                <td className="py-3 px-4 whitespace-nowrap">
                  {getStatusBadge(review.status)}
                </td>

                {/* Date */}
                <td className="py-3 px-4 whitespace-nowrap text-zinc-400 text-xs">
                  {new Date(review.createdAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                  })}
                </td>

                {/* Action Buttons (prevent row click triggering) */}
                <td className="py-3 px-4 whitespace-nowrap text-right" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center justify-end gap-1">
                    {/* Star Featured */}
                    {/* Quick Star */}
                    <button
                      disabled={review.status !== 'approved'}
                      onClick={() => onToggleFeatured(review.id, review.isFeatured)}
                      className={`p-1.5 rounded-lg transition-colors ${
                        review.status !== 'approved'
                          ? 'opacity-30 cursor-not-allowed text-zinc-600'
                          : review.isFeatured
                          ? 'text-amber-400 bg-amber-400/10'
                          : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800'
                      }`}
                      title={
                        review.status !== 'approved'
                          ? 'Only approved testimonials can be featured'
                          : review.isFeatured
                          ? 'Remove from Featured'
                          : 'Mark as Featured'
                      }
                    >
                      <Star className={`w-3.5 h-3.5 ${review.isFeatured ? 'fill-amber-400' : ''}`} />
                    </button>

                    {/* Create Social Post (Approved only) */}
                    {review.status === 'approved' && onOpenSocialCard && (
                      <button
                        onClick={() => onOpenSocialCard(review)}
                        className="p-1.5 rounded-lg text-brand-400 hover:text-white hover:bg-brand-600/25 transition-colors"
                        title="Create Social Post"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                      </button>
                    )}

                    {/* Approve */}
                    <button
                      onClick={() => onUpdateStatus(review.id, 'approved')}
                      className={`p-1.5 rounded-lg transition-colors ${
                        review.status === 'approved'
                          ? 'text-emerald-400 bg-emerald-500/15'
                          : 'text-zinc-500 hover:text-emerald-400 hover:bg-zinc-800'
                      }`}
                      title="Approve"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>

                    {/* Reject */}
                    <button
                      onClick={() => onUpdateStatus(review.id, 'rejected')}
                      className={`p-1.5 rounded-lg transition-colors ${
                        review.status === 'rejected'
                          ? 'text-red-400 bg-red-500/15'
                          : 'text-zinc-500 hover:text-red-400 hover:bg-zinc-800'
                      }`}
                      title="Reject"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>

                    {/* Archive */}
                    <button
                      onClick={() => onUpdateStatus(review.id, 'archived')}
                      className={`p-1.5 rounded-lg transition-colors ${
                        review.status === 'archived'
                          ? 'text-zinc-200 bg-zinc-700'
                          : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800'
                      }`}
                      title="Archive"
                    >
                      <Archive className="w-3.5 h-3.5" />
                    </button>

                    {/* Delete */}
                    <button
                      onClick={() => onDelete(review.id)}
                      className="p-1.5 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-zinc-800 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
