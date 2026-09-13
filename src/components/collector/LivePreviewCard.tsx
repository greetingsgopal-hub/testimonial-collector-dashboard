import React from 'react';
import { Star, Quote, Video, CheckCircle2, Building2 } from 'lucide-react';
import { ReviewInput } from '../../types';

interface LivePreviewCardProps {
  data: ReviewInput;
}

export const LivePreviewCard: React.FC<LivePreviewCardProps> = ({ data }) => {
  const stars = [1, 2, 3, 4, 5];

  return (
    <div className="relative">
      <div className="absolute -top-3 left-4 z-10 px-3 py-0.5 rounded-full bg-gradient-to-r from-brand-600 to-pink-500 text-white text-[11px] font-semibold tracking-wide uppercase shadow-md flex items-center gap-1.5">
        <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
        Live Preview
      </div>

      <div className="glass-card rounded-2xl p-6 sm:p-7 border border-white/10 relative overflow-hidden group">
        {/* Subtle background glow */}
        <div className="absolute top-0 right-0 w-36 h-36 bg-brand-500/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none" />

        {/* Rating Stars & Type */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-1">
            {stars.map((star) => (
              <Star
                key={star}
                className={`w-5 h-5 ${
                  star <= data.rating
                    ? 'text-amber-400 fill-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]'
                    : 'text-zinc-700'
                } transition-colors`}
              />
            ))}
          </div>

          {data.type === 'video' ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-pink-500/15 text-pink-400 text-xs font-medium border border-pink-500/30">
              <Video className="w-3.5 h-3.5" />
              Video Review
            </span>
          ) : (
            <Quote className="w-6 h-6 text-zinc-700 group-hover:text-brand-400/40 transition-colors" />
          )}
        </div>

        {/* Review Title if present */}
        {data.title && (
          <h4 className="text-base font-semibold text-white mb-2 font-display">
            "{data.title}"
          </h4>
        )}

        {/* Testimonial Content */}
        <p className="text-zinc-300 text-sm sm:text-base leading-relaxed mb-6 italic">
          {data.content.trim() ? (
            `"${data.content}"`
          ) : (
            <span className="text-zinc-600 not-italic">
              Your feedback and testimonial will appear here in real time as you fill out the form...
            </span>
          )}
        </p>

        {/* Video Link Preview if applicable */}
        {data.type === 'video' && data.videoUrl && (
          <div className="mb-5 p-3 rounded-xl bg-zinc-900/90 border border-zinc-800 flex items-center justify-between text-xs">
            <span className="text-zinc-400 truncate max-w-[240px]">{data.videoUrl}</span>
            <span className="text-pink-400 font-medium flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Video Linked
            </span>
          </div>
        )}

        {/* Tags */}
        {data.tags && data.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-6">
            {data.tags.map((tag) => (
              <span
                key={tag}
                className="px-2.5 py-0.5 rounded-md text-xs font-medium bg-zinc-800/80 text-zinc-300 border border-zinc-700/60"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* User Bio Footer */}
        <div className="pt-4 border-t border-zinc-800/80 flex items-center gap-3.5">
          {data.avatarUrl ? (
            <img
              src={data.avatarUrl}
              alt={data.name ? `${data.name}'s profile avatar` : 'Customer avatar preview'}
              className="w-12 h-12 rounded-full object-cover ring-2 ring-brand-500/30 shadow-md"
              onError={(e) => {
                // fallback if image fails
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-brand-600 to-indigo-600 flex items-center justify-center font-bold text-white text-base shadow-md">
              {data.name ? data.name.charAt(0).toUpperCase() : '?'}
            </div>
          )}

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h5 className="text-sm font-semibold text-white truncate">
                {data.name.trim() || 'Your Full Name'}
              </h5>
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            </div>
            <p className="text-xs text-zinc-400 truncate flex items-center gap-1.5 mt-0.5">
              <span>{data.role.trim() || 'Role / Position'}</span>
              {data.company && (
                <>
                  <span className="text-zinc-600">•</span>
                  <span className="flex items-center gap-1 text-zinc-300">
                    <Building2 className="w-3 h-3 text-zinc-500" />
                    {data.company.trim()}
                  </span>
                </>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
