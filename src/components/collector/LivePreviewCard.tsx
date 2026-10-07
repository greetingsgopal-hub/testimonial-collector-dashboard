import React from 'react';
import { Star, Quote, CheckCircle2 } from 'lucide-react';
import { ReviewInput } from '../../types';
import { CollectorLang, COLLECTOR_TRANSLATIONS } from '../../lib/collectorI18n';

interface LivePreviewCardProps {
  data: ReviewInput;
  lang?: CollectorLang;
}

export const LivePreviewCard: React.FC<LivePreviewCardProps> = ({ data, lang = 'en' }) => {
  const t = COLLECTOR_TRANSLATIONS[lang]?.livePreview;
  const stars = [1, 2, 3, 4, 5];

  return (
    <div className="relative">
      <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden group text-slate-900">
        {/* Rating Stars & Quote Icon */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1">
            {stars.map((star) => (
              <Star
                key={star}
                className={`w-4 h-4 sm:w-4.5 sm:h-4.5 ${
                  star <= data.rating
                    ? 'text-amber-400 fill-amber-400 drop-shadow-[0_0_5px_rgba(251,191,36,0.5)]'
                    : 'text-slate-200'
                } transition-colors`}
              />
            ))}
          </div>

          <Quote className="w-5 h-5 text-slate-200 group-hover:text-slate-300 transition-colors" />
        </div>

        {/* Review Title if present */}
        {data.title && (
          <h4 className="text-sm font-bold text-slate-950 mb-1.5 font-display truncate">
            "{data.title}"
          </h4>
        )}

        {/* Testimonial Content */}
        <p className="text-slate-700 text-xs sm:text-sm leading-relaxed mb-4 italic font-sans line-clamp-3">
          {data.content.trim() ? (
            `"${data.content}"`
          ) : (
            <span className="text-slate-400 not-italic">
              {t?.placeholderContent || 'Your feedback and testimonial will appear here in real time as you fill out the form...'}
            </span>
          )}
        </p>

        {/* User Bio Footer */}
        <div className="pt-3 border-t border-slate-100">
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h5 className="text-xs sm:text-sm font-bold text-slate-950 truncate">
                {data.name.trim() || 'Your Full Name'}
              </h5>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            </div>
            <p className="text-[11px] text-slate-500 truncate mt-0.5">
              {data.role.trim() || 'Role / Position'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
