import React from 'react';
import { Workspace, PLAN_LIMITS } from '../../types';
import { Sparkles, ArrowRight, Zap } from 'lucide-react';

interface PlanLimitBannerProps {
  workspace: Workspace | null;
  testimonialCount: number;
  onUpgrade?: () => void;
}

export const PlanLimitBanner: React.FC<PlanLimitBannerProps> = ({
  workspace,
  testimonialCount,
  onUpgrade,
}) => {
  const plan = workspace?.plan || 'free';
  const limits = PLAN_LIMITS[plan];
  const max = limits.maxTestimonials;

  // Paid plans (unlimited testimonials) do not show the banner
  if (max === -1 || plan !== 'free') {
    return null;
  }

  const isLimitReached = testimonialCount >= max;
  const isNearLimit = testimonialCount >= 12;

  if (!isNearLimit && !isLimitReached) {
    return null;
  }

  const percent = Math.min(Math.round((testimonialCount / max) * 100), 100);

  return (
    <div
      role="region"
      aria-label="Plan Limit Alert"
      className={`mx-6 mt-4 p-4 rounded-2xl border transition-all duration-200 ${
        isLimitReached
          ? 'bg-gradient-to-r from-amber-500/10 via-rose-500/10 to-purple-500/10 border-amber-300/80 dark:border-amber-500/30 shadow-xs'
          : 'bg-purple-50/70 border-purple-200 dark:bg-purple-950/20 dark:border-purple-800/40 shadow-2xs'
      }`}
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div
            className={`p-2 rounded-xl shrink-0 ${
              isLimitReached
                ? 'bg-amber-500/20 text-amber-700 dark:text-amber-300'
                : 'bg-purple-600/15 text-purple-700 dark:text-purple-300'
            }`}
          >
            {isLimitReached ? (
              <Zap className="w-5 h-5 text-amber-600" />
            ) : (
              <Sparkles className="w-5 h-5 text-purple-600" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                {isLimitReached
                  ? '⚡ Free plan limit reached'
                  : 'Approaching testimonial limit'}
              </h4>
              <span
                className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                  isLimitReached
                    ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200'
                    : 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-200'
                }`}
              >
                {testimonialCount} / {max}
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 max-w-xl">
              {isLimitReached
                ? "You've collected 15/15 testimonials on the Free Plan. Upgrade to Pro for unlimited testimonials, zero PandaPraise branding, and 1080p HD video collection."
                : "You're close to the 15-testimonial free cap. Upgrade to Pro to collect unlimited reviews and unlock video testimonials."}
            </p>
            {/* Progress Bar */}
            <div className="w-full max-w-xs bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full mt-2.5 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  isLimitReached ? 'bg-amber-500' : 'bg-purple-600'
                }`}
                style={{ width: `${percent}%` }}
              />
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={onUpgrade}
          className={`shrink-0 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all shadow-sm cursor-pointer ${
            isLimitReached
              ? 'bg-gradient-to-r from-[#6701e6] to-[#9333ea] hover:from-[#5400bd] hover:to-[#7e22ce] text-white hover:shadow-md'
              : 'bg-white hover:bg-slate-50 text-purple-700 border border-purple-200 hover:border-purple-300'
          }`}
        >
          <span>Upgrade to Pro</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
