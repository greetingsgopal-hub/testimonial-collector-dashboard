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
  BadgeCheck
} from 'lucide-react';
import { Review, ReviewStatus } from '../../types';
import { sanitizeUrl } from '../../lib/security';

interface ReviewCardProps {
  review: Review;
  isSelected?: boolean;
  onToggleSelect?: (id: string) => void;
  onUpdateStatus: (id: string, status: ReviewStatus) => void;
  onToggleFeatured: (id: string, current: boolean) => void;
  onDelete: (id: string) => void;
  onOpenDetails: (review: Review) => void;
  onOpenSocialCard?: (review: Review) => void;
}

export const ReviewCard: React.FC<ReviewCardProps> = ({
  review,
  isSelected,
  onToggleSelect,
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
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-200 border border-emerald-300/60 dark:border-emerald-800">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 dark:bg-emerald-400" />
            Approved
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200 border border-amber-300/60 dark:border-amber-800">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            Pending
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-200 border border-rose-300/60 dark:border-rose-800">
            <X className="w-3 h-3 text-rose-600" /> Rejected
          </span>
        );
      case 'archived':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300/60 dark:border-slate-700">
            <Archive className="w-3 h-3 text-slate-500" /> Archived
          </span>
        );
    }
  };

  const intakeSourceText = review.source === 'import'
    ? 'Imported'
    : review.source === 'manual'
    ? 'Direct Intake'
    : 'Form Direct';

  return (
    <article 
      className={`proof-card rounded-2xl p-5 sm:p-6 flex flex-col justify-between relative group font-sans transition-all duration-200 ${
        isSelected 
          ? 'ring-2 ring-indigo-600 dark:ring-indigo-500 bg-indigo-50/30 dark:bg-indigo-950/20' 
          : 'bg-white dark:bg-slate-900'
      }`}
    >
      <div>
        {/* ── Top Meta Row ── */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            {onToggleSelect && (
              <input
                type="checkbox"
                aria-label={`Select review by ${review.name}`}
                checked={!!isSelected}
                onChange={() => onToggleSelect(review.id)}
                className="w-4 h-4 rounded text-indigo-600 focus:ring-0 accent-indigo-600 cursor-pointer"
              />
            )}
            {getStatusBadge(review.status)}
            <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">
              {formattedDate}
            </span>
          </div>

          <div className="flex items-center gap-1">
            {/* Quick Star / Feature toggle */}
            <button
              type="button"
              disabled={review.status !== 'approved'}
              onClick={() => onToggleFeatured(review.id, review.isFeatured)}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                review.status !== 'approved'
                  ? 'opacity-30 cursor-not-allowed text-slate-300 dark:text-slate-600'
                  : review.isFeatured
                  ? 'text-amber-500 bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100'
                  : 'text-slate-400 hover:text-amber-500 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
              title={
                review.status !== 'approved'
                  ? 'Only approved testimonials can be featured'
                  : review.isFeatured
                  ? 'Remove from Featured'
                  : 'Mark as Featured'
              }
              aria-label="Toggle Featured"
            >
              <Star className={`w-4 h-4 ${review.isFeatured ? 'fill-amber-400 text-amber-500' : ''}`} />
            </button>

            {/* Inspect Detail Modal */}
            <button
              type="button"
              onClick={() => onOpenDetails(review)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title="Inspect details"
              aria-label="Inspect details"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ── Star Rating Row ── */}
        <div className="flex items-center gap-1 mb-2 text-amber-500">
          {[1, 2, 3, 4, 5].map((s) => (
            <Star
              key={s}
              className={`w-3.5 h-3.5 ${
                s <= review.rating
                  ? 'fill-amber-400 text-amber-400'
                  : 'text-slate-200 dark:text-slate-700'
              }`}
            />
          ))}
          <span className="ml-1 text-xs font-bold text-slate-900 dark:text-white">
            {review.rating.toFixed(1)}
          </span>
        </div>

        {/* ── Testimonial Pull-Quote / Headline ── */}
        {review.title && (
          <h3 className="font-headline-sm text-sm sm:text-base font-bold text-slate-950 dark:text-white mb-1.5 line-clamp-1 tracking-tight">
            “{review.title}”
          </h3>
        )}

        {/* ── Full Quote Body ── */}
        <p className="text-slate-700 dark:text-slate-300 text-xs sm:text-sm leading-relaxed mb-3.5 line-clamp-4 font-normal">
          "{review.content}"
        </p>

        {/* Video Player or Link Pill if video */}
        {review.type === 'video' && sanitizeUrl(review.videoUrl) && (
          <div className="mb-3 space-y-2">
            {review.videoUrl && (review.videoUrl.startsWith('blob:') || review.videoUrl.startsWith('data:video') || /\.(mp4|webm|mov|m4v)($|\?)/i.test(review.videoUrl)) ? (
              <div className="rounded-xl overflow-hidden bg-black border border-slate-200/80 dark:border-slate-800 relative shadow-2xs">
                <video
                  src={sanitizeUrl(review.videoUrl)}
                  controls
                  preload="metadata"
                  className="w-full max-h-56 object-contain bg-slate-950 mx-auto"
                />
              </div>
            ) : null}
            <div>
              <a
                href={sanitizeUrl(review.videoUrl)}
                target="_blank"
                rel="noopener noreferrer"
                className="apple-touch inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-pink-50 dark:bg-pink-950/40 text-pink-700 dark:text-pink-300 hover:bg-pink-100 text-xs font-semibold border border-pink-200/80 dark:border-pink-800 transition-colors"
              >
                <Video className="w-3.5 h-3.5" />
                <span>Watch Video Testimonial</span>
                <ExternalLink className="w-3 h-3 ml-0.5" />
              </a>
            </div>
          </div>
        )}

        {/* Screenshot Proof Preview if screenshot */}
        {review.screenshotUrl && (
          <div className="mb-3 rounded-xl overflow-hidden border border-slate-200/80 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 relative group/img">
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

        {/* Modern Tag Pills */}
        {review.tags && review.tags.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 mb-3.5">
            {review.tags.map((tag) => (
              <span
                key={tag}
                className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* ── Customer Attribution & Actions Toolbar ── */}
      <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 space-y-3">
        
        {/* Attribution Row with Avatar and Social Card Button */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            {review.avatarUrl ? (
              <img
                src={review.avatarUrl}
                alt={review.name}
                className="w-9 h-9 rounded-full object-cover ring-2 ring-white dark:ring-slate-800 shadow-2xs shrink-0"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-600 to-violet-600 text-white font-bold text-xs flex items-center justify-center shadow-2xs shrink-0">
                {review.name.charAt(0).toUpperCase()}
              </div>
            )}

            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-1 truncate">
                <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                  {review.name}
                </span>
                <BadgeCheck className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
              </div>
              <span className="text-[11px] text-slate-400 dark:text-slate-500 truncate capitalize">
                {review.role || 'Verified Customer'} • {intakeSourceText}
              </span>
            </div>
          </div>

          {onOpenSocialCard && (
            <button
              type="button"
              onClick={() => onOpenSocialCard(review)}
              className="apple-touch flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 text-xs font-semibold border border-indigo-200/80 dark:border-indigo-800 transition-colors shrink-0 cursor-pointer shadow-2xs"
              title="Create branded social graphic"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span className="hidden sm:inline">Social Card</span>
            </button>
          )}
        </div>

        {/* Moderation Actions Toolbar */}
        <div className="grid grid-cols-4 gap-1.5 pt-1">
          {/* Approve */}
          <button
            type="button"
            onClick={() => onUpdateStatus(review.id, 'approved')}
            className={`apple-touch py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1 transition-all cursor-pointer ${
              review.status === 'approved'
                ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-200 border border-emerald-300 shadow-2xs'
                : 'bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-slate-700 dark:text-slate-200 hover:text-emerald-700 dark:hover:text-emerald-300 border border-slate-200/70 dark:border-slate-700'
            }`}
            title="Approve Review"
          >
            <Check className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Approve</span>
          </button>

          {/* Reject */}
          <button
            type="button"
            onClick={() => onUpdateStatus(review.id, 'rejected')}
            className={`apple-touch py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1 transition-all cursor-pointer ${
              review.status === 'rejected'
                ? 'bg-rose-100 dark:bg-rose-950/80 text-rose-800 dark:text-rose-200 border border-rose-300 shadow-2xs'
                : 'bg-slate-100 dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-slate-700 dark:text-slate-200 hover:text-rose-700 dark:hover:text-rose-300 border border-slate-200/70 dark:border-slate-700'
            }`}
            title="Reject Review"
          >
            <X className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reject</span>
          </button>

          {/* Archive */}
          <button
            type="button"
            onClick={() => onUpdateStatus(review.id, 'archived')}
            className={`apple-touch py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1 transition-all cursor-pointer ${
              review.status === 'archived'
                ? 'bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white border border-slate-300 shadow-2xs'
                : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200/70 dark:border-slate-700'
            }`}
            title="Archive Review"
          >
            <Archive className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Archive</span>
          </button>

          {/* Delete */}
          <button
            type="button"
            onClick={() => onDelete(review.id)}
            className="apple-touch py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 border border-slate-200/70 dark:border-slate-700 flex items-center justify-center gap-1 transition-all cursor-pointer"
            title="Delete Permanently"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Delete</span>
          </button>
        </div>

      </div>
    </article>
  );
};

export default ReviewCard;
