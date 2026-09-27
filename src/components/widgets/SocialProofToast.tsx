import React, { useState, useEffect } from 'react';
import { Star, X } from 'lucide-react';
import { Review } from '../../types';

interface SocialProofToastProps {
  reviews: Review[];
  position?: 'bottom-left' | 'bottom-right' | 'top-right' | 'top-left';
  displayDuration?: number; // ms to show
  interval?: number;        // ms between toasts
  onOpenWallOfLove?: () => void;
  /** When set, reviews are sample data and this label is shown on each toast. */
  sampleLabel?: string;
}

interface CuratedToast {
  name: string;
  role: string;
  avatarUrl: string;
  highlightText: string;
  fullTextBefore: string;
  fullTextAfter: string;
  platformIcon?: 'x' | 'facebook' | 'producthunt' | 'google';
}

// Toasts now render the REAL reviews passed in via props — the previous
// hardcoded fake-person toasts (attributed to invented customers) were removed.

export const SocialProofToast: React.FC<SocialProofToastProps> = ({
  reviews: _reviews = [],
  position = 'bottom-left',
  displayDuration = 6500,
  interval = 4000,
  onOpenWallOfLove,
  sampleLabel,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  // Only real, approved reviews passed via props are shown. No fake fallbacks.
  const toasts: CuratedToast[] = React.useMemo(() => {
    const approved = _reviews.filter((r) => r.status === 'approved' && r.content?.trim());
    return approved.map((r) => ({
      name: r.name,
      role: r.role || r.company || 'Customer',
      avatarUrl: r.avatarUrl || '',
      highlightText: r.title || '',
      fullTextBefore: r.title ? '' : r.content.slice(0, 140),
      fullTextAfter: r.title ? r.content.slice(0, 140) : '',
    }));
  }, [_reviews]);

  useEffect(() => {
    if (isDismissed) return;

    // Show initial toast after 1.8 seconds
    const initialTimer = setTimeout(() => {
      setIsVisible(true);
    }, 1800);

    return () => clearTimeout(initialTimer);
  }, [isDismissed]);

  useEffect(() => {
    if (!isVisible || isDismissed) return;

    const hideTimer = setTimeout(() => {
      setIsVisible(false);

        setTimeout(() => {
          if (!isDismissed && toasts.length > 0) {
            setCurrentIndex((prev) => (prev + 1) % toasts.length);
            setIsVisible(true);
          }
        }, interval);
    }, displayDuration);

    return () => clearTimeout(hideTimer);
  }, [isVisible, isDismissed, displayDuration, interval]);

  if (isDismissed || !isVisible || toasts.length === 0) return null;

  const current = toasts[currentIndex % toasts.length];
  if (!current) return null;

  const positionClasses = {
    'bottom-left': 'bottom-4 left-4 sm:bottom-6 sm:left-6 2xl:left-8',
    'bottom-right': 'bottom-4 right-4 sm:bottom-6 sm:right-6 2xl:right-8',
    'top-right': 'top-4 right-4 sm:top-6 sm:right-6',
    'top-left': 'top-4 left-4 sm:top-6 sm:left-6',
  }[position];

  return (
    <div
      onClick={onOpenWallOfLove}
      className={`fixed ${positionClasses} z-40 hidden md:block max-w-[310px] w-full transition-all duration-300 transform translate-y-0 cursor-pointer animate-fade-in`}
    >
      <div className="bg-white/95 backdrop-blur-md p-3.5 sm:p-4 rounded-2xl border border-gray-200 shadow-[0_12px_36px_-6px_rgba(0,0,0,0.15)] flex items-start gap-3 relative hover:scale-[1.02] transition-transform font-sans">
        
        {/* Dismiss Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setIsDismissed(true);
          }}
          className="absolute top-2.5 right-2.5 p-1 text-gray-400 hover:text-gray-700 rounded-md transition-colors"
          title="Dismiss"
          aria-label="Dismiss notification"
        >
          <X className="w-3.5 h-3.5" />
        </button>

        {/* Reviewer Photo with rounded corners */}
        <div className="shrink-0">
          {current.avatarUrl ? (
            <img
              src={current.avatarUrl}
              alt={current.name}
              className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl object-cover ring-1 ring-gray-200 shadow-xs"
              loading="lazy"
            />
          ) : (
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gray-100 ring-1 ring-gray-200 shadow-xs flex items-center justify-center text-sm font-bold text-gray-500">
              {current.name?.trim()?.[0]?.toUpperCase() || '?'}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 pr-3">
          {/* 5 Orange Stars */}
          <div className="flex items-center gap-0.5 mb-1.5">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star
                key={s}
                className="w-3.5 h-3.5 text-amber-500 fill-amber-500"
              />
            ))}
          </div>

          {/* Quote with highlighted text */}
          <p className="text-xs sm:text-sm text-gray-800 leading-snug line-clamp-3">
            {current.fullTextBefore}
            <mark className="bg-amber-100/90 text-gray-950 px-1 py-0.5 rounded font-medium">
              {current.highlightText}
            </mark>
            {current.fullTextAfter}
          </p>

          {/* Attribution & Platform Badge */}
          <div className="flex items-center justify-between mt-2 pt-1 text-xs text-gray-500">
            <span className="font-medium text-gray-700">
              {current.name} <span className="text-gray-400">/</span> {current.role}
            </span>
            {sampleLabel && (
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide ml-1 shrink-0">
                {sampleLabel}
              </span>
            )}

            {/* Platform Icon */}
            {current.platformIcon === 'x' && (
              <span className="text-xs font-bold text-gray-700 ml-1">𝕏</span>
            )}
            {current.platformIcon === 'facebook' && (
              <span className="w-3.5 h-3.5 rounded-full bg-blue-600 text-white font-bold text-[10px] flex items-center justify-center ml-1">f</span>
            )}
            {current.platformIcon === 'google' && (
              <span className="text-xs font-bold text-red-500 ml-1">G</span>
            )}
            {current.platformIcon === 'producthunt' && (
              <span className="w-3.5 h-3.5 rounded-full bg-amber-600 text-white font-bold text-[10px] flex items-center justify-center ml-1">P</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
