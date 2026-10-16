import React from 'react';
import { Star, Heart } from 'lucide-react';
import { getPlanEntitlements } from '../hooks/usePlanEntitlements';

export interface EmbeddedReview {
  id: string;
  name: string;
  role?: string;
  company?: string;
  avatarUrl?: string;
  rating: number;
  content: string;
  videoUrl?: string;
  createdAt?: string;
}

export interface WallOfLoveEmbedProps {
  workspace: {
    id: string;
    name: string;
    plan?: string;
    remove_branding?: boolean;
    custom_css?: string;
  };
  reviews: EmbeddedReview[];
  theme?: 'dark' | 'light' | 'minimal';
}

export const WallOfLoveEmbed: React.FC<WallOfLoveEmbedProps> = ({
  workspace,
  reviews,
  theme = 'dark',
}) => {
  const entitlements = getPlanEntitlements(workspace.plan);

  // Custom CSS injection: ONLY allowed on Agency & Lifetime plans
  const shouldInjectCustomCss = entitlements.canUseCustomCss && Boolean(workspace.custom_css);

  // Branding: Forced on Starter / Free workspaces.
  // Can only be hidden if on Pro/Agency/Lifetime AND remove_branding is true.
  const showBranding = !(entitlements.canRemoveBranding && workspace.remove_branding);

  const isLight = theme === 'light';

  return (
    <div
      id="pandapraise-wall-embed"
      data-workspace-id={workspace.id}
      data-plan={entitlements.plan}
      className={`w-full max-w-7xl mx-auto p-6 md:p-8 font-sans ${
        isLight ? 'bg-slate-50 text-slate-900' : 'bg-[#0B0F19] text-slate-100'
      }`}
    >
      {/* 1. Custom CSS Injection (Agency & Lifetime Exclusive) */}
      {shouldInjectCustomCss && (
        <style dangerouslySetInnerHTML={{ __html: workspace.custom_css || '' }} />
      )}

      {/* Grid of Testimonials */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reviews.map((r) => (
          <div
            key={r.id}
            className={`p-6 rounded-2xl border transition-all duration-200 flex flex-col justify-between ${
              isLight
                ? 'bg-white border-slate-200 shadow-sm hover:shadow-md'
                : 'bg-slate-900/80 border-slate-800 shadow-xl hover:border-slate-700'
            }`}
          >
            <div>
              {/* Star Rating */}
              <div className="flex items-center gap-1 text-amber-400 mb-3">
                {[...Array(Math.min(5, Math.max(1, r.rating)))].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-current" />
                ))}
              </div>

              {/* Review Content */}
              <p
                className={`text-sm leading-relaxed mb-4 ${
                  isLight ? 'text-slate-700' : 'text-slate-300'
                }`}
              >
                "{r.content}"
              </p>
            </div>

            {/* Author Attribution */}
            <div className="flex items-center gap-3 pt-4 border-t border-slate-800/40">
              {r.avatarUrl ? (
                <img
                  src={r.avatarUrl}
                  alt={r.name}
                  className="w-10 h-10 rounded-full object-cover border border-slate-700"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-purple-600/20 text-purple-400 font-bold flex items-center justify-center text-sm border border-purple-500/30">
                  {r.name.slice(0, 1).toUpperCase()}
                </div>
              )}
              <div>
                <h4 className="text-xs font-bold text-white">{r.name}</h4>
                <p className="text-[11px] text-slate-400">
                  {r.role || 'Verified Customer'} {r.company ? `• ${r.company}` : ''}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 2. "Powered by PandaPraise" Viral Badge (Forced on Starter/Free) */}
      {showBranding && (
        <div id="pandapraise-branding-badge" className="mt-8 text-center">
          <a
            href={`https://pandapraise.com?utm_source=embed&utm_medium=referral&utm_campaign=powered_by&ref=${encodeURIComponent(
              workspace.id
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-slate-900/90 text-slate-400 hover:text-white border border-slate-800 shadow-sm transition-all"
          >
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-current" />
            <span>Powered by PandaPraise</span>
          </a>
        </div>
      )}
    </div>
  );
};

export default WallOfLoveEmbed;
