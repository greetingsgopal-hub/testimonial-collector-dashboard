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
  Globe,
  Share2
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
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-700 border border-emerald-500/20 shadow-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Approved
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/10 text-amber-700 border border-amber-500/20 shadow-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            Pending
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-500/10 text-rose-700 border border-rose-500/20 shadow-xs">
            <X className="w-3 h-3" /> Rejected
          </span>
        );
      case 'archived':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-zinc-100 text-zinc-600 border border-zinc-200">
            <Archive className="w-3 h-3" /> Archived
          </span>
        );
    }
  };

  const getSourceIcon = (source?: string) => {
    if (!source || source === 'form' || source === 'manual') return null;
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-black/[0.03] text-zinc-600 border border-black/[0.05] capitalize">
        {source}
      </span>
    );
  };

  return (
    <div className="apple-glass-card p-5 sm:p-6 flex flex-col justify-between relative group font-sans text-zinc-900 apple-touch-subtle">
      
      {/* Top row: Status, Badges, and Quick Actions */}
      <div>
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-1.5 flex-wrap">
            {getStatusBadge(review.status)}
            {review.status === 'approved' && (
              <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/10 text-emerald-700 border border-emerald-500/20" title="Live on website widget">
                <Globe className="w-2.5 h-2.5" /> Widget Live
              </span>
            )}
            {review.isFeatured && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/10 text-amber-700 border border-amber-500/20 shadow-xs">
                <Sparkles className="w-3 h-3 text-amber-500" /> Featured
              </span>
            )}
            {getSourceIcon(review.source)}
            {review.screenshotPlatform && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-500/10 text-indigo-700 border border-indigo-500/20 capitalize">
                {review.screenshotPlatform}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1">
            {/* Quick Star / Feature toggle */}
            <button
              disabled={review.status !== 'approved'}
              onClick={() => onToggleFeatured(review.id, review.isFeatured)}
              className={`p-1.5 rounded-lg transition-all apple-touch ${
                review.status !== 'approved'
                  ? 'opacity-25 cursor-not-allowed text-zinc-300'
                  : review.isFeatured
                  ? 'text-amber-500 bg-amber-500/10 hover:bg-amber-500/20'
                  : 'text-zinc-400 hover:text-zinc-700 hover:bg-black/[0.04]'
              }`}
              title={
                review.status !== 'approved'
                  ? 'Only approved testimonials can be featured'
                  : review.isFeatured
                  ? 'Remove from Featured'
                  : 'Mark as Featured'
              }
            >
              <Star className={`w-4 h-4 ${review.isFeatured ? 'fill-amber-400 text-amber-500' : ''}`} />
            </button>

            {/* Create Social Post (Only for approved reviews) */}
            {review.status === 'approved' && onOpenSocialCard && (
              <button
                onClick={() => onOpenSocialCard(review)}
                className="p-1.5 rounded-lg text-violet-600 hover:bg-violet-500/10 transition-colors apple-touch"
                title="Create Social Post"
                aria-label="Create Social Post"
              >
                <Sparkles className="w-4 h-4" />
              </button>
            )}

            {/* Open Detail Modal */}
            <button
              onClick={() => onOpenDetails(review)}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 hover:bg-black/[0.04] transition-colors apple-touch"
              title="Inspect details"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Rating & Date */}
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star
                key={s}
                className={`w-3.5 h-3.5 ${
                  s <= review.rating
                    ? 'text-amber-400 fill-amber-400'
                    : 'text-zinc-200'
                }`}
              />
            ))}
          </div>
          <span className="text-[11px] text-zinc-400 font-medium">{formattedDate}</span>
        </div>

        {/* Headline */}
        {review.title && (
          <h4 className="text-sm font-bold text-zinc-950 mb-1.5 line-clamp-1 font-display tracking-tight">
            {review.title}
          </h4>
        )}

        {/* Content */}
        <p className="text-zinc-700 text-xs sm:text-sm leading-relaxed mb-4 line-clamp-4 font-normal">
          "{review.content}"
        </p>

        {/* Video Link Pill if video */}
        {review.type === 'video' && sanitizeUrl(review.videoUrl) && (
          <div className="mb-3">
            <a
              href={sanitizeUrl(review.videoUrl)}
              target="_blank"
              rel="noopener noreferrer"
              className="apple-touch inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-pink-500/10 text-pink-700 hover:bg-pink-500/20 text-xs font-semibold border border-pink-500/20 transition-colors"
            >
              <Video className="w-3.5 h-3.5" />
              <span>Watch Video Testimonial</span>
              <ExternalLink className="w-3 h-3 ml-0.5" />
            </a>
          </div>
        )}

        {/* Screenshot Proof Preview if screenshot */}
        {review.screenshotUrl && (
          <div className="mb-3 rounded-xl overflow-hidden border border-zinc-200/80 bg-zinc-50 relative group/img">
            <img
              src={review.screenshotUrl}
              alt={review.title || 'Screenshot Proof'}
              className="w-full max-h-48 object-contain object-top rounded-xl transition-transform duration-300 group-hover/img:scale-[1.02]"
              loading="lazy"
            />
            <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-black/75 backdrop-blur-xs text-white text-[10px] font-semibold tracking-wide shadow-xs">
              {review.screenshotPlatform ? `${review.screenshotPlatform.toUpperCase()} PROOF` : 'CHAT PROOF'}
            </div>
          </div>
        )}

        {/* Tags */}
        {review.tags && review.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {review.tags.map((tag) => (
              <span
                key={tag}
                className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-black/[0.03] text-zinc-600 border border-black/[0.05]"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Bottom Footer: Reviewer Info & Moderation Action Bar */}
      <div className="pt-4 border-t border-black/[0.05] space-y-3">
        {/* Reviewer Details */}
        <div className="flex items-center gap-2.5">
          {review.avatarUrl ? (
            <img
              src={review.avatarUrl}
              alt={review.name}
              className="w-9 h-9 rounded-full object-cover ring-2 ring-white shadow-xs"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          ) : (
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-violet-600 to-indigo-500 text-white font-bold text-xs flex items-center justify-center shadow-xs">
              {review.name.charAt(0).toUpperCase()}
            </div>
          )}

          <div className="min-w-0 flex-1">
            <h5 className="text-xs font-bold text-zinc-950 truncate tracking-tight">{review.name}</h5>
            <p className="text-[11px] text-zinc-500 truncate flex items-center gap-1">
              <span>{review.role || 'Verified Customer'}</span>
              {review.company && (
                <>
                  <span className="text-zinc-300">•</span>
                  <span className="text-zinc-700 font-medium truncate">{review.company}</span>
                </>
              )}
            </p>
          </div>
        </div>

        {/* Quick Social Share / Export Image Button */}
        {onOpenSocialCard && (
          <button
            type="button"
            onClick={() => onOpenSocialCard(review)}
            className="apple-touch w-full py-1.5 px-3 rounded-xl bg-violet-500/10 hover:bg-violet-500/15 border border-violet-500/20 text-violet-700 text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
            title="Create branded social media image for Twitter, LinkedIn, and Instagram"
          >
            <Share2 className="w-3.5 h-3.5 text-violet-600" />
            <span>Export as Social Image (PNG)</span>
          </button>
        )}

        {/* Apple Tactile Moderation Action Bar */}
        <div className="grid grid-cols-4 gap-1.5 pt-0.5">
          {/* Approve */}
          <button
            onClick={() => onUpdateStatus(review.id, 'approved')}
            className={`apple-touch py-1.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1 transition-all cursor-pointer ${
              review.status === 'approved'
                ? 'bg-emerald-500/15 text-emerald-800 border border-emerald-500/30 shadow-2xs'
                : 'bg-slate-50 hover:bg-emerald-50 text-slate-600 hover:text-emerald-700 border border-slate-200/80'
            }`}
            title="Approve Review"
          >
            <Check className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Approve</span>
          </button>

          {/* Reject */}
          <button
            onClick={() => onUpdateStatus(review.id, 'rejected')}
            className={`apple-touch py-1.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1 transition-all cursor-pointer ${
              review.status === 'rejected'
                ? 'bg-rose-500/15 text-rose-800 border border-rose-500/30 shadow-2xs'
                : 'bg-slate-50 hover:bg-rose-50 text-slate-600 hover:text-rose-700 border border-slate-200/80'
            }`}
            title="Reject Review"
          >
            <X className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reject</span>
          </button>

          {/* Archive */}
          <button
            onClick={() => onUpdateStatus(review.id, 'archived')}
            className={`apple-touch py-1.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1 transition-all cursor-pointer ${
              review.status === 'archived'
                ? 'bg-slate-200 text-slate-800 border border-slate-300 shadow-2xs'
                : 'bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200/80'
            }`}
            title="Archive Review"
          >
            <Archive className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Archive</span>
          </button>

          {/* Delete */}
          <button
            onClick={() => onDelete(review.id)}
            className="apple-touch py-1.5 rounded-xl text-xs font-semibold bg-slate-50 hover:bg-rose-50 text-slate-400 hover:text-rose-600 border border-slate-200/80 flex items-center justify-center gap-1 transition-all cursor-pointer"
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

