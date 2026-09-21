import React, { useState, useEffect } from 'react';
import { Star, X, ShieldCheck } from 'lucide-react';
import { Review } from '../../types';

interface SocialProofToastProps {
  reviews: Review[];
  position?: 'bottom-left' | 'bottom-right' | 'top-right' | 'top-left';
  displayDuration?: number; // ms to show
  interval?: number;        // ms between toasts
}

export const SocialProofToast: React.FC<SocialProofToastProps> = ({
  reviews = [],
  position = 'bottom-left',
  displayDuration = 6000,
  interval = 12000,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  const approvedReviews = reviews.filter((r) => r.status === 'approved');

  useEffect(() => {
    if (approvedReviews.length === 0 || isDismissed) return;

    // Show initial toast after 2.5 seconds
    const initialTimer = setTimeout(() => {
      setIsVisible(true);
    }, 2500);

    return () => clearTimeout(initialTimer);
  }, [approvedReviews.length, isDismissed]);

  useEffect(() => {
    if (!isVisible || isDismissed) return;

    // Hide after displayDuration
    const hideTimer = setTimeout(() => {
      setIsVisible(false);

      // Queue next review after interval
      setTimeout(() => {
        if (!isDismissed) {
          setCurrentIndex((prev) => (prev + 1) % approvedReviews.length);
          setIsVisible(true);
        }
      }, interval);
    }, displayDuration);

    return () => clearTimeout(hideTimer);
  }, [isVisible, isDismissed, displayDuration, interval, approvedReviews.length]);

  if (approvedReviews.length === 0 || isDismissed || !isVisible) return null;

  const currentReview = approvedReviews[currentIndex];
  if (!currentReview) return null;

  const positionClasses = {
    'bottom-left': 'bottom-6 left-6',
    'bottom-right': 'bottom-6 right-6',
    'top-right': 'top-6 right-6',
    'top-left': 'top-6 left-6',
  }[position];

  return (
    <div
      className={`fixed ${positionClasses} z-40 max-w-sm w-full animate-bounce-subtle cursor-pointer transition-all duration-300`}
    >
      <div className="glass-card p-3.5 sm:p-4 rounded-2xl border border-white/15 bg-zinc-900/95 backdrop-blur-xl shadow-2xl flex items-start gap-3 relative hover:scale-[1.02] transition-transform">
        
        {/* Dismiss Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setIsDismissed(true);
          }}
          className="absolute top-2 right-2 p-1 text-zinc-500 hover:text-white rounded-md transition-colors"
          title="Dismiss"
        >
          <X className="w-3.5 h-3.5" />
        </button>

        {/* Avatar or Initial */}
        <div className="shrink-0 mt-0.5">
          {currentReview.avatarUrl ? (
            <img
              src={currentReview.avatarUrl}
              alt={currentReview.name}
              className="w-10 h-10 rounded-full object-cover ring-2 ring-purple-500/40 shadow-md"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 text-white font-bold flex items-center justify-center text-sm shadow-md">
              {currentReview.name.charAt(0)}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 pr-4">
          <div className="flex items-center gap-1 mb-1">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star
                key={s}
                className={`w-3 h-3 ${
                  s <= currentReview.rating
                    ? 'text-amber-400 fill-amber-400'
                    : 'text-zinc-700'
                }`}
              />
            ))}
            <span className="text-[10px] text-zinc-400 font-medium ml-1">Verified Review</span>
          </div>

          <p className="text-xs text-zinc-200 line-clamp-2 italic leading-relaxed">
            "{currentReview.content}"
          </p>

          <div className="flex items-center gap-1.5 mt-1 text-[11px] text-zinc-400">
            <span className="font-semibold text-white truncate">{currentReview.name}</span>
            {currentReview.company && (
              <>
                <span>•</span>
                <span className="truncate">{currentReview.company}</span>
              </>
            )}
            <ShieldCheck className="w-3 h-3 text-emerald-400 shrink-0" />
          </div>
        </div>
      </div>
    </div>
  );
};
