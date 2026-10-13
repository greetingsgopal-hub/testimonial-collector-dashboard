import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { Star, Quote, Filter, ExternalLink, AlertCircle, RefreshCw, ShieldCheck, Video, Copy, Check, FileText, Download, X } from 'lucide-react';
import { storage } from '../lib/storage';
import { Review, WallOfLoveTheme } from '../types';
import { usePageSeo } from '../lib/seo';
import { PandaPraiseIcon } from '../components/PandaPraiseLogo';
import { filterTestimonials, parseFilterRulesFromParams } from '../lib/testimonialFilter';
import { generateCaseStudy, caseStudyToMarkdown, CaseStudy } from '../lib/ai-case-study';

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
  const [showCaseStudyModal, setShowCaseStudyModal] = useState(false);
  const [copiedCaseStudy, setCopiedCaseStudy] = useState(false);

  const theme = THEME_STYLES[activeTheme];

  const activeCaseStudy: CaseStudy | null = useMemo(() => {
    if (!reviews.length) return null;
    return generateCaseStudy(reviews, title || slug || 'PandaPraise');
  }, [reviews, title, slug]);

  const handleCopyCaseStudy = () => {
    if (!activeCaseStudy) return;
    const md = caseStudyToMarkdown(activeCaseStudy);
    navigator.clipboard.writeText(md);
    setCopiedCaseStudy(true);
    setTimeout(() => setCopiedCaseStudy(false), 2000);
  };

  const handleDownloadCaseStudy = () => {
    if (!activeCaseStudy) return;
    const md = caseStudyToMarkdown(activeCaseStudy);
    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `case-study-${(slug || 'customer').toLowerCase()}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

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
            {/* Verified Trust Badge */}
            <div className={`hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${
              activeTheme === 'pastel' || activeTheme === 'whimsical'
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20'
            }`}>
              <ShieldCheck size={13} className={activeTheme === 'pastel' || activeTheme === 'whimsical' ? 'text-emerald-600' : 'text-emerald-400'} />
              <span>100% Verified Proof</span>
            </div>

            {/* Export Case Study Trigger */}
            <button
              onClick={() => setShowCaseStudyModal(true)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border ${theme.cardBorder} ${theme.cardBg} ${theme.textSecondary} hover:opacity-100 hover:border-violet-500/40 transition-all cursor-pointer`}
              title="Export 5-star customer proof into a structured Case Study"
            >
              <FileText size={13} className="text-violet-400" />
              <span className="hidden sm:inline">Export Case Study</span>
              <span className="sm:hidden">Case Study</span>
            </button>

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

      {/* Case Study Export Modal */}
      {showCaseStudyModal && activeCaseStudy && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className={`w-full max-w-2xl max-h-[85vh] flex flex-col rounded-2xl border ${theme.cardBg} ${theme.cardBorder} shadow-2xl overflow-hidden`}>
            {/* Modal Header */}
            <div className={`px-6 py-4 border-b ${theme.cardBorder} flex items-center justify-between`}>
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-violet-400" />
                <h3 className="font-bold text-sm">Customer Case Study Export</h3>
              </div>
              <button
                onClick={() => setShowCaseStudyModal(false)}
                className={`p-1 rounded-lg ${theme.textSecondary} hover:opacity-80 cursor-pointer`}
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body / Preview */}
            <div className="p-6 overflow-y-auto space-y-4 text-xs leading-relaxed">
              <div className="p-4 rounded-xl bg-violet-500/10 border border-violet-500/20 space-y-1">
                <span className="text-[10px] uppercase font-bold tracking-wider text-violet-400">Success Story</span>
                <h4 className="text-base font-bold text-white">{activeCaseStudy.title}</h4>
                <p className={`${theme.textSecondary}`}>{activeCaseStudy.subtitle}</p>
                <p className="text-[11px] text-zinc-400 mt-2">
                  Customer: <span className="text-zinc-200 font-semibold">{activeCaseStudy.customerName}</span> ({activeCaseStudy.customerRole} at {activeCaseStudy.customerCompany})
                </p>
              </div>

              <div>
                <h5 className="font-semibold text-zinc-200 mb-1">The Challenge</h5>
                <p className={theme.textSecondary}>{activeCaseStudy.challenge}</p>
              </div>

              <div>
                <h5 className="font-semibold text-zinc-200 mb-1">The Solution</h5>
                <p className={theme.textSecondary}>{activeCaseStudy.solution}</p>
              </div>

              {activeCaseStudy.results.length > 0 && (
                <div>
                  <h5 className="font-semibold text-zinc-200 mb-1.5">Key Results</h5>
                  <ul className="space-y-1">
                    {activeCaseStudy.results.map((r, i) => (
                      <li key={i} className="flex items-center gap-1.5 text-zinc-300">
                        <span className="text-emerald-400">✓</span> {r}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {activeCaseStudy.testimonialQuotes.length > 0 && (
                <div>
                  <h5 className="font-semibold text-zinc-200 mb-1.5">Customer Quotes</h5>
                  <div className="space-y-2">
                    {activeCaseStudy.testimonialQuotes.map((q, i) => (
                      <blockquote key={i} className={`p-3 rounded-lg border ${theme.cardBorder} bg-black/20 italic`}>
                        "{q.content}"
                        <span className="block mt-1 font-semibold not-italic text-[11px] text-zinc-400">
                          — {q.author}, {q.role}
                        </span>
                      </blockquote>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className={`px-6 py-4 border-t ${theme.cardBorder} flex items-center justify-between`}>
              <span className={`text-[11px] ${theme.textSecondary}`}>
                {activeCaseStudy.wordCount} words · Ready for blog, sales collateral, or PDF
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyCaseStudy}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-zinc-800 hover:bg-zinc-700 text-zinc-200 transition-colors cursor-pointer"
                >
                  {copiedCaseStudy ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                  <span>{copiedCaseStudy ? 'Copied Markdown' : 'Copy Markdown'}</span>
                </button>
                <button
                  onClick={handleDownloadCaseStudy}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-violet-600 hover:bg-violet-500 text-white transition-colors cursor-pointer"
                >
                  <Download size={14} />
                  <span>Download .md</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer / Branding */}
      <footer className={`py-8 text-center border-t ${theme.cardBorder}`}>
        <a
          href="https://pandapraise.com"
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
  const [copied, setCopied] = useState(false);

  const handleCopyQuote = (e: React.MouseEvent) => {
    e.stopPropagation();
    const text = `"${review.content}" — ${review.name}${review.company ? `, ${review.company}` : ''}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareX = (e: React.MouseEvent) => {
    e.stopPropagation();
    const snippet = review.content.length > 200 ? `${review.content.slice(0, 197)}...` : review.content;
    const text = `"${snippet}" — ${review.name}`;
    const shareUrl = window.location.href;
    const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`;
    window.open(tweetUrl, '_blank', 'noopener,noreferrer');
  };

  const handleShareLinkedIn = (e: React.MouseEvent) => {
    e.stopPropagation();
    const shareUrl = window.location.href;
    const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
    window.open(linkedInUrl, '_blank', 'noopener,noreferrer');
  };

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

      {/* Screenshot Proof */}
      {review.screenshotUrl && (
        <div className="mt-3 rounded-xl overflow-hidden border border-current/10 bg-black/5 relative group cursor-pointer">
          <img
            src={review.screenshotUrl}
            alt={review.title || 'Verified Chat Proof'}
            className="w-full max-h-72 object-contain rounded-xl transition-transform duration-300 group-hover:scale-[1.01]"
            loading="lazy"
            onClick={() => window.open(review.screenshotUrl, '_blank')}
          />
          <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-black/75 backdrop-blur-xs text-white text-[10px] font-semibold tracking-wide">
            {review.screenshotPlatform ? `${review.screenshotPlatform.toUpperCase()} PROOF` : 'CHAT PROOF'}
          </div>
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
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <p className={`text-sm font-medium ${theme.text}`}>{review.name}</p>
            {review.editedByOwner && (
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border shrink-0 ${
                isLight
                  ? 'bg-gray-50 text-gray-500 border-gray-200'
                  : 'bg-white/5 text-gray-400 border-white/10'
              }`}>
                Edited by business
              </span>
            )}
            {review.screenshotPlatform || review.type === 'screenshot' ? (
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border shrink-0 transition-all ${
                isLight
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200 shadow-2xs'
                  : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
              }`}>
                <ShieldCheck size={10} className={isLight ? 'text-emerald-600' : 'text-emerald-400'} />
                <span className="capitalize">{review.screenshotPlatform || 'Chat'} Proof</span>
              </span>
            ) : review.type === 'video' ? (
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border shrink-0 transition-all ${
                isLight
                  ? 'bg-purple-50 text-purple-700 border-purple-200 shadow-2xs'
                  : 'bg-purple-500/15 text-purple-300 border-purple-500/30'
              }`}>
                <Video size={10} className={isLight ? 'text-purple-600' : 'text-purple-300'} />
                <span>Verified Video</span>
              </span>
            ) : (review.source || '').toLowerCase().includes('google') ? (
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border shrink-0 transition-all ${
                isLight
                  ? 'bg-blue-50 text-blue-700 border-blue-200 shadow-2xs'
                  : 'bg-blue-500/15 text-blue-300 border-blue-500/30'
              }`}>
                <span className="font-extrabold text-[10px] leading-none text-blue-600">G</span>
                <span>Google Review</span>
              </span>
            ) : (review.source || '').toLowerCase().includes('twitter') || (review.source || '').toLowerCase().includes('x') ? (
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border shrink-0 transition-all ${
                isLight
                  ? 'bg-slate-100 text-slate-800 border-slate-300 shadow-2xs'
                  : 'bg-white/10 text-slate-200 border-white/20'
              }`}>
                <span className="font-bold text-[10px]">𝕏</span>
                <span>Verified on X</span>
              </span>
            ) : (review.source || '').toLowerCase().includes('linkedin') ? (
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border shrink-0 transition-all ${
                isLight
                  ? 'bg-sky-50 text-sky-800 border-sky-200 shadow-2xs'
                  : 'bg-sky-500/15 text-sky-300 border-sky-500/30'
              }`}>
                <span className="font-bold text-[10px] text-sky-600">in</span>
                <span>Verified LinkedIn</span>
              </span>
            ) : (
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border shrink-0 transition-all ${
                isLight
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200 shadow-2xs'
                  : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
              }`}>
                <ShieldCheck size={10} className={isLight ? 'text-emerald-600' : 'text-emerald-400'} />
                <span>Verified Customer</span>
              </span>
            )}
          </div>
          {(review.role || review.company) && (
            <p className={`text-xs ${theme.textSecondary}`}>
              {[review.role, review.company].filter(Boolean).join(' at ')}
            </p>
          )}
        </div>
      </div>

      {/* 1-Click Viral Sharing Actions */}
      <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-current/5 text-xs">
        <button
          onClick={handleCopyQuote}
          title="Copy Quote"
          className={`inline-flex items-center gap-1 px-2 py-1 rounded-md transition-colors cursor-pointer ${
            copied
              ? 'text-emerald-500 bg-emerald-500/10'
              : `${theme.textSecondary} hover:opacity-100 hover:bg-current/5`
          }`}
        >
          {copied ? <Check size={12} /> : <Copy size={12} />}
          <span className="text-[11px] font-medium">{copied ? 'Copied!' : 'Copy Quote'}</span>
        </button>

        <div className="flex items-center gap-1.5">
          <button
            onClick={handleShareX}
            title="Share to X"
            className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium transition-colors cursor-pointer ${theme.textSecondary} hover:text-white hover:bg-current/10`}
          >
            <span>𝕏</span>
            <span className="hidden sm:inline">Post</span>
          </button>
          <button
            onClick={handleShareLinkedIn}
            title="Share to LinkedIn"
            className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium transition-colors cursor-pointer ${theme.textSecondary} hover:text-sky-400 hover:bg-current/10`}
          >
            <span className="font-bold">in</span>
            <span className="hidden sm:inline">Share</span>
          </button>
        </div>
      </div>
    </div>
  );
};
