import React from 'react';
import { Star, Quote, CheckCircle2, Building2, Play, Video } from 'lucide-react';
import { ReviewInput } from '../../types';

interface LivePreviewCardProps {
  data: ReviewInput;
}

export const LivePreviewCard: React.FC<LivePreviewCardProps> = ({ data }) => {
  const stars = [1, 2, 3, 4, 5];

  return (
    <div className="relative">
      <div className="absolute -top-3 left-4 z-10 px-3 py-0.5 rounded-full bg-[#6701e6] text-white text-[11px] font-bold tracking-wide uppercase shadow-md flex items-center gap-1.5">
        <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
        Live Preview
      </div>

      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-gray-200 shadow-xl relative overflow-hidden group text-gray-900">
        {/* Subtle background glow */}
        <div className="absolute top-0 right-0 w-36 h-36 bg-purple-100/60 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none" />

        {/* Rating Stars & Quote Icon */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-1">
            {stars.map((star) => (
              <Star
                key={star}
                className={`w-5 h-5 ${
                  star <= data.rating
                    ? 'text-amber-400 fill-amber-400 drop-shadow-[0_0_6px_rgba(251,191,36,0.6)]'
                    : 'text-gray-200'
                } transition-colors`}
              />
            ))}
          </div>

          <Quote className="w-6 h-6 text-purple-100 group-hover:text-purple-300 transition-colors" />
        </div>

        {/* Review Title if present */}
        {data.title && (
          <h4 className="text-base font-bold text-gray-950 mb-2 font-display">
            "{data.title}"
          </h4>
        )}

        {/* Video Testimonial Preview */}
        {data.videoUrl && (
          <div className="mb-4 p-3 rounded-2xl bg-purple-50/80 border border-purple-200 flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#6701e6] flex items-center justify-center text-white shrink-0 shadow-xs">
              <Play className="w-4 h-4 fill-white ml-0.5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-bold text-[#6701e6] flex items-center gap-1.5">
                <Video className="w-3.5 h-3.5 text-[#6701e6]" />
                <span>Video Testimonial Attached</span>
              </div>
              <p className="text-[11px] text-gray-600 truncate">{data.videoUrl}</p>
            </div>
          </div>
        )}

        {/* Testimonial Content */}
        <p className="text-gray-700 text-sm sm:text-base leading-relaxed mb-6 italic font-sans">
          {data.content.trim() ? (
            `"${data.content}"`
          ) : (
            <span className="text-gray-400 not-italic">
              Your feedback and testimonial will appear here in real time as you fill out the form...
            </span>
          )}
        </p>

        {/* Tags */}
        {data.tags && data.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-6">
            {data.tags.map((tag) => (
              <span
                key={tag}
                className="px-2.5 py-0.5 rounded-lg text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* User Bio Footer */}
        <div className="pt-4 border-t border-gray-100 flex items-center gap-3.5">
          {data.avatarUrl ? (
            <img
              src={data.avatarUrl}
              alt={data.name ? `${data.name}'s profile avatar` : 'Customer avatar preview'}
              className="w-12 h-12 rounded-full object-cover ring-2 ring-purple-100 shadow-sm"
              onError={(e) => {
                // fallback if image fails
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-[#6701e6] flex items-center justify-center font-bold text-white text-base shadow-sm">
              {data.name ? data.name.charAt(0).toUpperCase() : '?'}
            </div>
          )}

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h5 className="text-sm font-bold text-gray-950 truncate">
                {data.name.trim() || 'Your Full Name'}
              </h5>
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            </div>
            <p className="text-xs text-gray-500 truncate flex items-center gap-1.5 mt-0.5">
              <span>{data.role.trim() || 'Role / Position'}</span>
              {data.company && (
                <>
                  <span className="text-gray-300">•</span>
                  <span className="flex items-center gap-1 text-gray-700 font-medium">
                    <Building2 className="w-3 h-3 text-gray-400" />
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
