import { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { Star, Quote, ExternalLink, Filter, AlertCircle, RefreshCw } from 'lucide-react';
import { storage } from '../lib/storage';
import { Review, WallOfLoveTheme } from '../types';
import { usePageSeo } from '../lib/seo';
import { PandaPraiseIcon } from '../components/PandaPraiseLogo';
import { filterTestimonials, parseFilterRulesFromParams } from '../lib/testimonialFilter';

// ── Theme Definitions ───────────────────────────────────────
const THEME_STYLES: Record<WallOfLoveTheme, {
  bg: string;
  cardBg: string;
  cardBorder: string;
  text: string;
  textSecondary: string;
  accent: string;
  starColor: string;
  headerBg: string;
}> = {
  default: {
    bg: 'bg-zinc-950',
    cardBg: 'bg-zinc-900/80',
    cardBorder: 'border-white/10',
    text: 'text-zinc-100',
    textSecondary: 'text-zinc-400',
    accent: 'text-violet-400',
    starColor: 'text-amber-400',
    headerBg: 'bg-zinc-950',
  },
  noire: {
    bg: 'bg-black',
    cardBg: 'bg-zinc-950',
    cardBorder: 'border-zinc-800',
    text: 'text-zinc-100',
    textSecondary: 'text-zinc-500',
    accent: 'text-white',
    starColor: 'text-zinc-300',
    headerBg: 'bg-black',
  },
  pastel: {
    bg: 'bg-[#fdf6f0]',
    cardBg: 'bg-white',
    cardBorder: 'border-[#e8ddd4]',
    text: 'text-[#2d2420]',
    textSecondary: 'text-[#8a7b70]',
    accent: 'text-[#c97b5a]',
    starColor: 'text-[#e8a85c]',
    headerBg: 'bg-[#fdf6f0]',
  },
  whimsical: {
    bg: 'bg-gradient-to-br from-violet-50 to-pink-50',
    cardBg: 'bg-white/80 backdrop-blur-sm',
    cardBorder: 'border-violet-200/50',
    text: 'text-violet-900',
    textSecondary: 'text-violet-500',
    accent: 'text-pink-500',
    starColor: 'text-amber-500',
    headerBg: 'bg-violet-50/80',
  },
  vibrant: {
    bg: 'bg-gradient-to-br from-indigo-950 via-purple-950 to-pink-950',
    cardBg: 'bg-white/5 backdrop-blur-lg',
    cardBorder: 'border-white/10',
    text: 'text-white',
    textSecondary: 'text-purple-300/70',
    accent: 'text-pink-400',
    starColor: 'text-yellow-400',
    headerBg: 'bg-transparent',
  },
  hong_kong: {
    bg: 'bg-[#0a0a14]',
    cardBg: 'bg-[#12122a]/80',
    cardBorder: 'border-[#2a2a5a]/50',
    text: 'text-[#e0e0ff]',
    textSecondary: 'text-[#8080b0]',
    accent: 'text-[#ff6b9d]',
    starColor: 'text-[#ffd700]',
    headerBg: 'bg-[#0a0a14]',
  },
};

const THEME_NAMES: Record<WallOfLoveTheme, string> = {
  default: 'Default',
  noire: 'Noire',
  pastel: 'Pastel',
  whimsical: 'Whimsical',
  vibrant: 'Vibrant',
  hong_kong: 'Hong Kong',
};

// ── Wall of Love Page ───────────────────────────────────────
export const WallOfLovePage = () => {
  const { slug } = useParams<{ slug: string }>();
  const searchParams = new URLSearchParams(window.location.search);

  const themeParam = (searchParams.get('theme') || 'default') as WallOfLoveTheme;
  const title = searchParams.get('title') || 'Wall of Love';
  const subtitle = searchParams.get('subtitle') || 'See what our customers are saying';
  const ctaText = searchParams.get('cta_text') || '';
  const ctaUrl = searchParams.get('cta_url') || '';
  const projectId = searchParams.get('project') || slug || '';

  usePageSeo({
    title: `${title} — Panda Praise`,
    description: subtitle,
  });

  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTheme, setActiveTheme] = useState<WallOfLoveTheme>(themeParam);
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [showThemePicker, setShowThemePicker] = useState(false);

  const theme = THEME_STYLES[activeTheme];

  const loadReviews = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const allReviews = await storage.getReviews(projectId || undefined);
      const params = new URLSearchParams(window.location.search);
      const rules = parseFilterRulesFromParams(params);
      const qualifying = filterTestimonials(allReviews, rules);
      setReviews(qualifying);
    } catch (err: any) {
      console.error('[WallOfLove] Failed to load reviews:', err);
      setError(err?.message || 'Failed to load Wall of Love. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadReviews();
  }, [projectId]);

  // Collect all unique tags
  const allTags = useMemo(() => {
    const tags = new Set<string>();
    reviews.forEach(r => r.tags?.forEach(t => tags.add(t)));
    return Array.from(tags);
  }, [reviews]);

  const filteredReviews = useMemo(() => {
    if (!activeTag) return reviews;
    return reviews.filter(r => r.tags?.some(t => t.toLowerCase() === activeTag.toLowerCase()));
  }, [reviews, activeTag]);

  // Masonry column distribution
  const columns = useMemo(() => {
    const cols: Review[][] = [[], [], []];
    filteredReviews.forEach((r, i) => {
      cols[i % 3].push(r);
    });
    return cols;
  }, [filteredReviews]);

  if (isLoading) {
    return (
      <div className={`min-h-screen ${theme.bg} flex items-center justify-center`}>
        <div className="w-8 h-8 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className={`min-h-screen ${theme.bg} ${theme.text} flex flex-col items-center justify-center p-6 text-center`}>
        <div className={`max-w-md p-8 rounded-3xl ${theme.cardBg} border ${theme.cardBorder} space-y-4 shadow-xl`}>
          <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
          <h3 className="text-xl font-bold">Unable to load Wall of Love</h3>
          <p className={`text-xs ${theme.textSecondary} leading-relaxed`}>{error}</p>
          <button
            onClick={loadReviews}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-violet-600 hover:bg-violet-700 text-white cursor-pointer shadow-xs transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Retry</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${theme.bg} ${theme.text}`}>
      {/* Header */}
      <header className={`${theme.headerBg} border-b ${theme.cardBorder} sticky top-0 z-30 backdrop-blur-xl`}>
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <PandaPraiseIcon size={28} />
            <div>
              <h1 className="text-lg font-bold">{title}</h1>
              <p className={`text-xs ${theme.textSecondary}`}>{subtitle}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Theme Switcher */}
            <div className="relative">
              <button
                onClick={() => setShowThemePicker(!showThemePicker)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border ${theme.cardBorder} ${theme.cardBg} ${theme.textSecondary} hover:opacity-80 transition-opacity`}
              >
                🎨 {THEME_NAMES[activeTheme]}
              </button>
              {showThemePicker && (
                <div className={`absolute right-0 top-full mt-2 w-40 ${theme.cardBg} border ${theme.cardBorder} rounded-xl shadow-2xl overflow-hidden z-50`}>
                  {(Object.keys(THEME_STYLES) as WallOfLoveTheme[]).map(t => (
                    <button
                      key={t}
                      onClick={() => { setActiveTheme(t); setShowThemePicker(false); }}
                      className={`w-full text-left px-3 py-2 text-sm transition-colors
                        ${t === activeTheme ? `${theme.accent} font-medium` : `${theme.textSecondary} hover:opacity-80`}`}
                    >
                      {THEME_NAMES[t]}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* CTA Button */}
            {ctaText && ctaUrl && (
              <a
                href={ctaUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold
                         bg-gradient-to-r from-violet-600 to-purple-600 text-white hover:from-violet-500 hover:to-purple-500 transition-all"
              >
                {ctaText}
                <ExternalLink size={14} />
              </a>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Tag Filters */}
        {allTags.length > 0 && (
          <div className="flex items-center gap-2 mb-8 flex-wrap">
            <Filter size={14} className={theme.textSecondary} />
            <button
              onClick={() => setActiveTag(null)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all border
                ${!activeTag
                  ? `${theme.accent} border-current`
                  : `${theme.textSecondary} ${theme.cardBorder} hover:opacity-80`}`}
            >
              All ({reviews.length})
            </button>
            {allTags.map(tag => (
              <button
                key={tag}
                onClick={() => setActiveTag(activeTag === tag ? null : tag)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all border
                  ${activeTag === tag
                    ? `${theme.accent} border-current`
                    : `${theme.textSecondary} ${theme.cardBorder} hover:opacity-80`}`}
              >
                {tag}
              </button>
            ))}
          </div>
        )}

        {/* Masonry Grid */}
        {filteredReviews.length === 0 ? (
          <div className={`py-20 text-center ${theme.cardBg} border ${theme.cardBorder} rounded-3xl p-8`}>
            <Quote size={44} className={`mx-auto ${theme.textSecondary} opacity-30 mb-3`} />
            <p className={`text-lg font-bold ${theme.text}`}>
              {activeTag ? `No testimonials tagged #${activeTag}` : 'No testimonials published yet'}
            </p>
            <p className={`text-xs ${theme.textSecondary} opacity-80 mt-1 max-w-sm mx-auto`}>
              {activeTag
                ? 'Try selecting another tag or view all testimonials.'
                : 'Approved testimonials matching your publishing rules will appear here automatically.'}
            </p>
            {activeTag && (
              <button
                onClick={() => setActiveTag(null)}
                className="mt-4 px-4 py-1.5 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/20 text-current transition-colors cursor-pointer"
              >
                Clear tag filter
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {columns.map((col, colIdx) => (
              <div key={colIdx} className="space-y-5">
                {col.map((review) => (
                  <TestimonialCard key={review.id} review={review} theme={theme} activeTheme={activeTheme} />
                ))}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer / Branding */}
      <footer className={`py-8 text-center border-t ${theme.cardBorder}`}>
        <a
          href="https://pandapraise.dev"
          target="_blank"
          rel="noopener noreferrer"
          className={`inline-flex items-center gap-2 text-xs ${theme.textSecondary} hover:opacity-80 transition-opacity`}
        >
          <PandaPraiseIcon size={16} />
          Powered by Panda Praise
        </a>
      </footer>
    </div>
  );
};

// ── Testimonial Card ────────────────────────────────────────
interface TestimonialCardProps {
  review: Review;
  theme: typeof THEME_STYLES[WallOfLoveTheme];
  activeTheme: WallOfLoveTheme;
}

const TestimonialCard: React.FC<TestimonialCardProps> = ({ review, theme, activeTheme }) => {
  const isLight = activeTheme === 'pastel' || activeTheme === 'whimsical';

  return (
    <div className={`p-5 rounded-2xl border ${theme.cardBg} ${theme.cardBorder} transition-all duration-300 hover:scale-[1.01]`}>
      {/* Stars */}
      {review.rating > 0 && (
        <div className="flex gap-0.5 mb-3">
          {[1, 2, 3, 4, 5].map(s => (
            <Star
              key={s}
              size={14}
              className={`${s <= review.rating ? `${theme.starColor} fill-current` : `${theme.textSecondary} opacity-30`}`}
            />
          ))}
        </div>
      )}

      {/* Title */}
      {review.title && (
        <h3 className={`text-sm font-semibold mb-2 ${theme.text}`}>{review.title}</h3>
      )}

      {/* Content */}
      <p className={`text-sm leading-relaxed ${theme.text} opacity-90`}>
        "{review.content}"
      </p>

      {/* Video */}
      {review.type === 'video' && review.videoUrl && (
        <div className="mt-3 rounded-xl overflow-hidden aspect-video bg-black/20">
          <iframe
            src={review.videoUrl}
            className="w-full h-full"
            allowFullScreen
            loading="lazy"
            title={`Video testimonial from ${review.name}`}
          />
        </div>
      )}

      {/* Author */}
      <div className="flex items-center gap-3 mt-4 pt-3 border-t border-current/5">
        <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold
          ${isLight ? 'bg-violet-100 text-violet-600' : 'bg-white/10 text-white'}`}>
          {review.avatarUrl ? (
            <img src={review.avatarUrl} alt={review.name} className="w-full h-full rounded-full object-cover" />
          ) : (
            review.name.charAt(0).toUpperCase()
          )}
        </div>
        <div>
          <p className={`text-sm font-medium ${theme.text}`}>{review.name}</p>
          {(review.role || review.company) && (
            <p className={`text-xs ${theme.textSecondary}`}>
              {[review.role, review.company].filter(Boolean).join(' at ')}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

// Need React import for FC type
import React from 'react';
