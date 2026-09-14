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
  Clock
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
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            <Check className="w-3 h-3" /> Approved
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/30 animate-pulse">
            <Clock className="w-3 h-3" /> Pending
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-red-500/15 text-red-400 border border-red-500/30">
            <X className="w-3 h-3" /> Rejected
          </span>
        );
      case 'archived':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-zinc-800 text-zinc-400 border border-zinc-700">
            <Archive className="w-3 h-3" /> Archived
          </span>
        );
    }
  };

  return (
    <div className="glass-card rounded-2xl p-5 sm:p-6 border border-white/10 flex flex-col justify-between relative group hover:border-brand-500/40 transition-all">
      
      {/* Top row: Status, Featured Star, and More */}
      <div>
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            {getStatusBadge(review.status)}
            {review.isFeatured && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30">
                <Sparkles className="w-3 h-3" /> Featured
              </span>
            )}
          </div>

          <div className="flex items-center gap-1">
            {/* Quick Star / Feature toggle */}
            <button
              disabled={review.status !== 'approved'}
              onClick={() => onToggleFeatured(review.id, review.isFeatured)}
              className={`p-1.5 rounded-lg transition-colors ${
                review.status !== 'approved'
                  ? 'opacity-30 cursor-not-allowed text-zinc-600'
                  : review.isFeatured
                  ? 'text-amber-400 bg-amber-400/10 hover:bg-amber-400/20'
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
              <Star className={`w-4 h-4 ${review.isFeatured ? 'fill-amber-400' : ''}`} />
            </button>

            {/* Create Social Post (Only for approved reviews) */}
            {review.status === 'approved' && onOpenSocialCard && (
              <button
                onClick={() => onOpenSocialCard(review)}
                className="p-1.5 rounded-lg text-brand-400 hover:text-white hover:bg-brand-600/25 transition-colors"
                title="Create Social Post"
                aria-label="Create Social Post"
              >
                <Sparkles className="w-4 h-4" />
              </button>
            )}

            {/* Open Detail Modal */}
            <button
              onClick={() => onOpenDetails(review)}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
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
                    : 'text-zinc-700'
                }`}
              />
            ))}
          </div>
          <span className="text-[11px] text-zinc-500">{formattedDate}</span>
        </div>

        {/* Headline */}
        {review.title && (
          <h4 className="text-sm font-semibold text-white mb-1.5 line-clamp-1 font-display">
            {review.title}
          </h4>
        )}

        {/* Content */}
        <p className="text-zinc-300 text-xs sm:text-sm leading-relaxed mb-4 line-clamp-4">
          "{review.content}"
        </p>

        {/* Video Link Pill if video */}
        {review.type === 'video' && sanitizeUrl(review.videoUrl) && (
          <div className="mb-3">
            <a
              href={sanitizeUrl(review.videoUrl)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-pink-500/10 text-pink-400 hover:bg-pink-500/20 text-xs font-medium border border-pink-500/20 transition-colors"
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
                className="px-2 py-0.5 rounded text-[10px] font-medium bg-zinc-800 text-zinc-400 border border-zinc-700/60"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Bottom Footer: Reviewer Info & Moderation Action Bar */}
      <div className="pt-4 border-t border-zinc-800/80 space-y-3">
        {/* Reviewer Details */}
        <div className="flex items-center gap-3">
          {review.avatarUrl ? (
            <img
              src={review.avatarUrl}
              alt={review.name}
              className="w-9 h-9 rounded-full object-cover ring-1 ring-zinc-700"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          ) : (
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-brand-600 to-indigo-600 flex items-center justify-center font-bold text-white text-xs shadow-sm">
              {review.name.charAt(0).toUpperCase()}
            </div>
          )}

          <div className="min-w-0 flex-1">
            <h5 className="text-xs font-semibold text-white truncate">{review.name}</h5>
            <p className="text-[11px] text-zinc-400 truncate flex items-center gap-1">
              <span>{review.role}</span>
              {review.company && (
                <>
                  <span className="text-zinc-600">•</span>
                  <span className="text-zinc-300 truncate">{review.company}</span>
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
            className={`py-1.5 rounded-lg text-xs font-medium flex items-center justify-center gap-1 transition-colors ${
              review.status === 'approved'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 cursor-default'
                : 'bg-zinc-900 hover:bg-emerald-500/20 text-zinc-400 hover:text-emerald-400 border border-zinc-800'
            }`}
            title="Approve Review"
          >
            <Check className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Approve</span>
          </button>

          {/* Reject */}
          <button
            onClick={() => onUpdateStatus(review.id, 'rejected')}
            className={`py-1.5 rounded-lg text-xs font-medium flex items-center justify-center gap-1 transition-colors ${
              review.status === 'rejected'
                ? 'bg-red-500/20 text-red-300 border border-red-500/40 cursor-default'
                : 'bg-zinc-900 hover:bg-red-500/20 text-zinc-400 hover:text-red-400 border border-zinc-800'
            }`}
            title="Reject Review"
          >
            <X className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reject</span>
          </button>

          {/* Archive */}
          <button
            onClick={() => onUpdateStatus(review.id, 'archived')}
            className={`py-1.5 rounded-lg text-xs font-medium flex items-center justify-center gap-1 transition-colors ${
              review.status === 'archived'
                ? 'bg-zinc-700 text-zinc-200 border border-zinc-600 cursor-default'
                : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-300 border border-zinc-800'
            }`}
            title="Archive Review"
          >
            <Archive className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Archive</span>
          </button>

          {/* Delete */}
          <button
            onClick={() => onDelete(review.id)}
            className="py-1.5 rounded-lg text-xs font-medium bg-zinc-900 hover:bg-red-500/20 text-zinc-500 hover:text-red-400 border border-zinc-800 flex items-center justify-center gap-1 transition-colors"
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
