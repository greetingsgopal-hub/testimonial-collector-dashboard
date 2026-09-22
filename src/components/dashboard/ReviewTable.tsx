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
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <Check className="w-3 h-3" /> Approved
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
            <Clock className="w-3 h-3 text-amber-500" /> Pending
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
            <X className="w-3 h-3" /> Rejected
          </span>
        );
      case 'archived':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-gray-100 text-gray-700 border border-gray-200">
            <Archive className="w-3 h-3" /> Archived
          </span>
        );
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs sm:text-sm">
          <thead className="bg-gray-50/80 text-gray-500 border-b border-gray-200 text-[11px] uppercase tracking-wider font-semibold">
            <tr>
              <th className="py-3.5 px-4">Reviewer</th>
              <th className="py-3.5 px-4">Rating</th>
              <th className="py-3.5 px-4">Feedback Content</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-4">Date</th>
              <th className="py-3.5 px-4 text-right">Moderation Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {reviews.map((review) => (
              <tr 
                key={review.id}
                className="hover:bg-purple-50/20 transition-colors cursor-pointer group"
                onClick={() => onOpenDetails(review)}
              >
                {/* Reviewer Column */}
                <td className="py-3.5 px-4 whitespace-nowrap">
                  <div className="flex items-center gap-3">
                    {review.avatarUrl ? (
                      <img
                        src={review.avatarUrl}
                        alt={review.name}
                        className="w-8 h-8 rounded-full object-cover ring-1 ring-gray-200 shrink-0"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-purple-100 text-[#6701e6] flex items-center justify-center font-bold text-xs shrink-0 border border-purple-200">
                        {review.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="min-w-0">
                      <div className="font-bold text-gray-900 flex items-center gap-1.5">
                        <span>{review.name}</span>
                        {review.isFeatured && (
                          <Sparkles className="w-3 h-3 text-amber-500 fill-amber-500" />
                        )}
                      </div>
                      <div className="text-[11px] text-gray-500 truncate">
                        {review.role} {review.company ? `• ${review.company}` : ''}
                      </div>
                    </div>
                  </div>
                </td>

                {/* Rating */}
                <td className="py-3.5 px-4 whitespace-nowrap">
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={`w-3.5 h-3.5 ${
                          s <= review.rating
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-gray-200'
                        }`}
                      />
                    ))}
                  </div>
                </td>

                {/* Content */}
                <td className="py-3.5 px-4 max-w-xs md:max-w-md">
                  <p className="text-gray-700 text-xs line-clamp-2 leading-relaxed">
                    {review.title && <strong className="text-gray-900 font-semibold mr-1">{review.title} —</strong>}
                    "{review.content}"
                  </p>
                </td>

                {/* Status */}
                <td className="py-3.5 px-4 whitespace-nowrap">
                  {getStatusBadge(review.status)}
                </td>

                {/* Date */}
                <td className="py-3.5 px-4 whitespace-nowrap text-gray-500 text-xs">
                  {new Date(review.createdAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                  })}
                </td>

                {/* Action Buttons */}
                <td className="py-3.5 px-4 whitespace-nowrap text-right" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center justify-end gap-1">
                    {/* Quick Star */}
                    <button
                      disabled={review.status !== 'approved'}
                      onClick={() => onToggleFeatured(review.id, review.isFeatured)}
                      className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                        review.status !== 'approved'
                          ? 'opacity-30 cursor-not-allowed text-gray-300'
                          : review.isFeatured
                          ? 'text-amber-500 bg-amber-50'
                          : 'text-gray-400 hover:text-amber-500 hover:bg-gray-100'
                      }`}
                      title={
                        review.status !== 'approved'
                          ? 'Only approved testimonials can be featured'
                          : review.isFeatured
                          ? 'Remove from Featured'
                          : 'Mark as Featured'
                      }
                    >
                      <Star className={`w-3.5 h-3.5 ${review.isFeatured ? 'fill-amber-400 text-amber-400' : ''}`} />
                    </button>

                    {/* Create Social Post (Approved only) */}
                    {review.status === 'approved' && onOpenSocialCard && (
                      <button
                        onClick={() => onOpenSocialCard(review)}
                        className="p-1.5 rounded-lg text-[#6701e6] hover:bg-purple-50 transition-colors cursor-pointer"
                        title="Create Social Post"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                      </button>
                    )}

                    {/* Approve */}
                    <button
                      onClick={() => onUpdateStatus(review.id, 'approved')}
                      className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                        review.status === 'approved'
                          ? 'text-emerald-700 bg-emerald-50'
                          : 'text-gray-400 hover:text-emerald-600 hover:bg-emerald-50'
                      }`}
                      title="Approve"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>

                    {/* Reject */}
                    <button
                      onClick={() => onUpdateStatus(review.id, 'rejected')}
                      className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                        review.status === 'rejected'
                          ? 'text-rose-700 bg-rose-50'
                          : 'text-gray-400 hover:text-rose-600 hover:bg-rose-50'
                      }`}
                      title="Reject"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>

                    {/* Archive */}
                    <button
                      onClick={() => onUpdateStatus(review.id, 'archived')}
                      className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                        review.status === 'archived'
                          ? 'text-gray-800 bg-gray-200'
                          : 'text-gray-400 hover:text-gray-700 hover:bg-gray-100'
                      }`}
                      title="Archive"
                    >
                      <Archive className="w-3.5 h-3.5" />
                    </button>

                    {/* Delete */}
                    <button
                      onClick={() => onDelete(review.id)}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
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
