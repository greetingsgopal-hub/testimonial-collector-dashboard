import React from 'react';
import { 
  Star, 
  Check, 
  X, 
  Archive, 
  Trash2, 
  Sparkles, 
  ExternalLink, 
  Video, 
  MoreHorizontal,
  Clock,
  Globe
} from 'lucide-react';
import { Review, ReviewStatus } from '../../types';
import { sanitizeUrl } from '../../lib/security';

interface ReviewCardProps {
  review: Review;
  onUpdateStatus: (id: string, status: ReviewStatus) => void;
  onToggleFeatured: (id: string, current: boolean) => void;
  onDelete: (id: string) => void;
  onOpenDetails: (review: Review) => void;
  onOpenSocialCard?: (review: Review) => void;
}

export const ReviewCard: React.FC<ReviewCardProps> = ({
  review,
  onUpdateStatus,
  onToggleFeatured,
  onDelete,
  onOpenDetails,
  onOpenSocialCard,
}) => {
  const formattedDate = new Date(review.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

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
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200 animate-pulse">
            <Clock className="w-3 h-3" /> Pending
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-red-50 text-red-700 border border-red-200">
            <X className="w-3 h-3" /> Rejected
          </span>
        );
      case 'archived':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-gray-100 text-gray-600 border border-gray-200">
            <Archive className="w-3 h-3" /> Archived
          </span>
        );
    }
  };

  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-200 shadow-xs flex flex-col justify-between relative group hover:border-[#6701e6]/40 hover:shadow-md transition-all font-sans text-gray-900">
      
      {/* Top row: Status, Featured Star, and More */}
      <div>
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            {getStatusBadge(review.status)}
            {review.status === 'approved' && (
              <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100" title="Broadcasting to website widget">
                <Globe className="w-2.5 h-2.5" /> Widget Live
              </span>
            )}
            {review.isFeatured && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                <Sparkles className="w-3 h-3" /> Featured
              </span>
            )}
          </div>

          <div className="flex items-center gap-1">
            {/* Quick Star / Feature toggle */}
            <button
              disabled={review.status !== 'approved'}
              onClick={() => onToggleFeatured(review.id, review.isFeatured)}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                review.status !== 'approved'
                  ? 'opacity-30 cursor-not-allowed text-gray-300'
                  : review.isFeatured
                  ? 'text-amber-500 bg-amber-50 hover:bg-amber-100'
                  : 'text-gray-400 hover:text-gray-700 hover:bg-gray-100'
              }`}
              title={
                review.status !== 'approved'
                  ? 'Only approved testimonials can be featured'
                  : review.isFeatured
                  ? 'Remove from Featured'
                  : 'Mark as Featured'
              }
            >
              <Star className={`w-4 h-4 ${review.isFeatured ? 'fill-amber-400 text-amber-400' : ''}`} />
            </button>

            {/* Create Social Post (Only for approved reviews) */}
            {review.status === 'approved' && onOpenSocialCard && (
              <button
                onClick={() => onOpenSocialCard(review)}
                className="p-1.5 rounded-lg text-[#6701e6] hover:bg-purple-50 transition-colors cursor-pointer"
                title="Create Social Post"
                aria-label="Create Social Post"
              >
                <Sparkles className="w-4 h-4" />
              </button>
            )}

            {/* Open Detail Modal */}
            <button
              onClick={() => onOpenDetails(review)}
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
              title="Inspect details"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Rating & Date */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star
                key={s}
                className={`w-4 h-4 ${
                  s <= review.rating
                    ? 'text-amber-400 fill-amber-400'
                    : 'text-gray-200'
                }`}
              />
            ))}
          </div>
          <span className="text-[11px] text-gray-400 font-medium">{formattedDate}</span>
        </div>

        {/* Headline */}
        {review.title && (
          <h4 className="text-sm font-bold text-gray-950 mb-1.5 line-clamp-1 font-display">
            {review.title}
          </h4>
        )}

        {/* Content */}
        <p className="text-gray-700 text-xs sm:text-sm leading-relaxed mb-4 line-clamp-4">
          "{review.content}"
        </p>

        {/* Video Link Pill if video */}
        {review.type === 'video' && sanitizeUrl(review.videoUrl) && (
          <div className="mb-3">
            <a
              href={sanitizeUrl(review.videoUrl)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-pink-50 text-pink-700 hover:bg-pink-100 text-xs font-semibold border border-pink-200 transition-colors"
            >
              <Video className="w-3.5 h-3.5" />
              <span>Watch Video Testimonial</span>
              <ExternalLink className="w-3 h-3 ml-0.5" />
            </a>
          </div>
        )}

        {/* Tags */}
        {review.tags && review.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {review.tags.map((tag) => (
              <span
                key={tag}
                className="px-2 py-0.5 rounded text-[10px] font-semibold bg-gray-100 text-gray-600 border border-gray-200"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Bottom Footer: Reviewer Info & Moderation Action Bar */}
      <div className="pt-4 border-t border-gray-100 space-y-3">
        {/* Reviewer Details */}
        <div className="flex items-center gap-3">
          {review.avatarUrl ? (
            <img
              src={review.avatarUrl}
              alt={review.name}
              className="w-9 h-9 rounded-full object-cover ring-1 ring-gray-200"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          ) : (
            <div className="w-9 h-9 rounded-full bg-purple-100 text-[#6701e6] border border-purple-200 flex items-center justify-center font-bold text-xs shadow-xs">
              {review.name.charAt(0).toUpperCase()}
            </div>
          )}

          <div className="min-w-0 flex-1">
            <h5 className="text-xs font-bold text-gray-950 truncate">{review.name}</h5>
            <p className="text-[11px] text-gray-500 truncate flex items-center gap-1">
              <span>{review.role}</span>
              {review.company && (
                <>
                  <span className="text-gray-400">•</span>
                  <span className="text-gray-700 font-medium truncate">{review.company}</span>
                </>
              )}
            </p>
          </div>
        </div>

        {/* Moderation Action Buttons Bar */}
        <div className="grid grid-cols-4 gap-1.5 pt-1">
          {/* Approve */}
          <button
            onClick={() => onUpdateStatus(review.id, 'approved')}
            className={`py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer ${
              review.status === 'approved'
                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                : 'bg-white hover:bg-emerald-50 text-gray-600 hover:text-emerald-700 border border-gray-200'
            }`}
            title="Approve Review"
          >
            <Check className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Approve</span>
          </button>

          {/* Reject */}
          <button
            onClick={() => onUpdateStatus(review.id, 'rejected')}
            className={`py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer ${
              review.status === 'rejected'
                ? 'bg-red-100 text-red-800 border border-red-300'
                : 'bg-white hover:bg-red-50 text-gray-600 hover:text-red-700 border border-gray-200'
            }`}
            title="Reject Review"
          >
            <X className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reject</span>
          </button>

          {/* Archive */}
          <button
            onClick={() => onUpdateStatus(review.id, 'archived')}
            className={`py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer ${
              review.status === 'archived'
                ? 'bg-gray-200 text-gray-800 border border-gray-300'
                : 'bg-white hover:bg-gray-100 text-gray-600 hover:text-gray-900 border border-gray-200'
            }`}
            title="Archive Review"
          >
            <Archive className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Archive</span>
          </button>

          {/* Delete */}
          <button
            onClick={() => onDelete(review.id)}
            className="py-1.5 rounded-lg text-xs font-semibold bg-white hover:bg-red-50 text-gray-400 hover:text-red-600 border border-gray-200 flex items-center justify-center gap-1 transition-colors cursor-pointer"
            title="Delete Permanently"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Delete</span>
          </button>
        </div>
      </div>
    </div>
  );
};
export default ReviewCard;
