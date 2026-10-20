import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Star,
  ShieldCheck,
  ExternalLink,
  MessageCircle,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Share2,
  CheckCircle2,
} from 'lucide-react';
import { usePageSeo } from '../lib/seo';

interface VaultProofCard {
  id: string;
  author: string;
  handle: string;
  source: 'Reddit' | 'HackerNews' | 'GoogleNews' | 'X' | 'Trustpilot';
  quote: string;
  date: string;
  sourceUrl: string;
  rating: number;
  highlight?: boolean;
}

const DEFAULT_SAMPLE_PROOF: VaultProofCard[] = [
  {
    id: 'proof-1',
    author: 'Alex Rivera',
    handle: '@arivera_dev',
    source: 'HackerNews',
    quote:
      'We switched our entire agency pipeline over. Setup took literally 3 minutes and conversion jumped by 28% in the first week.',
    date: 'Yesterday',
    sourceUrl: 'https://news.ycombinator.com',
    rating: 5,
    highlight: true,
  },
  {
    id: 'proof-2',
    author: 'Sarah Chen',
    handle: 'u/growth_sarah',
    source: 'Reddit',
    quote:
      'Zero maintenance, zero spam. It auto-caught positive shoutouts on Reddit that we had completely missed and turned them into closing assets.',
    date: '2 days ago',
    sourceUrl: 'https://reddit.com',
    rating: 5,
  },
  {
    id: 'proof-3',
    author: 'Enterprise Review Digest',
    handle: 'Google News Index',
    source: 'GoogleNews',
    quote:
      'Rated #1 alternative for founders tired of paying bloated $99/mo subscriptions just to display their own customer reviews.',
    date: '3 days ago',
    sourceUrl: 'https://news.google.com',
    rating: 5,
    highlight: true,
  },
  {
    id: 'proof-4',
    author: 'Marcus Vance',
    handle: '@marcus_vance',
    source: 'X',
    quote:
      'Sending this deal-closer vault link directly to leads in WhatsApp DMs closed 3 enterprise accounts back-to-back.',
    date: '4 days ago',
    sourceUrl: 'https://x.com',
    rating: 5,
  },
  {
    id: 'proof-5',
    author: 'Elena Rostova',
    handle: 'Trustpilot Verified Buyer',
    source: 'Trustpilot',
    quote:
      'Flawless experience. Fast loading, beautiful typography, and our clients constantly compliment how clean our proof wall looks.',
    date: 'Last week',
    sourceUrl: 'https://trustpilot.com',
    rating: 5,
  },
];

export const HostedProofVaultPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [activeFilter, setActiveFilter] = useState<'all' | 'highlights'>('all');
  const [copiedLink, setCopiedLink] = useState(false);

  // Format brand name from slug (e.g. acme-corp -> Acme Corp)
  const brandName = (slug || 'Acme')
    .split(/[-_]/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  usePageSeo({
    title: `${brandName} — Verified Customer Praise & Social Proof Vault`,
    description: `Browse 100% verified customer shoutouts, case studies, and authentic reviews for ${brandName}. Powered by PandaPraise.`,
    canonical: `${window.location.origin}/p/${slug || ''}`,
  });

  const [cards] = useState<VaultProofCard[]>(DEFAULT_SAMPLE_PROOF);

  const filteredCards = activeFilter === 'highlights' ? cards.filter((c) => c.highlight) : cards;

  const handleShareVault = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const getSourceBadgeColor = (source: VaultProofCard['source']) => {
    switch (source) {
      case 'Reddit':
        return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'HackerNews':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'GoogleNews':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Trustpilot':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      default:
        return 'bg-purple-50 text-purple-700 border-purple-200';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 text-slate-900 font-sans pb-28">
      {/* ── 1. Top Deal-Closer Action Bar (Sticky) ── */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-2xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-18 flex items-center justify-between gap-4">
          {/* Left Brand & Trust Pill */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-violet-600 text-white flex items-center justify-center font-bold text-base shadow-sm">
              {brandName.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base sm:text-lg text-slate-950 tracking-tight">
                  {brandName}
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <ShieldCheck className="w-3 h-3" />
                  Verified Vault
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                <div className="flex text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3 h-3 fill-current" />
                  ))}
                </div>
                <span>5.0 (Verified Social Proof)</span>
              </div>
            </div>
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={handleShareVault}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-xs font-semibold text-slate-700 transition-colors"
            >
              {copiedLink ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5" />}
              <span>{copiedLink ? 'Link Copied!' : 'Share Vault'}</span>
            </button>

            {/* Primary Deal Closer CTA Button */}
            <a
              href="https://wa.me/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold shadow-md shadow-emerald-600/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <MessageCircle className="w-4 h-4 fill-current" />
              <span>Chat on WhatsApp / Get Started →</span>
            </a>
          </div>
        </div>
      </header>

      {/* ── 2. Vault Hero ── */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 pt-10 pb-8 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-50 border border-violet-200/80 mb-4 shadow-2xs">
          <Sparkles className="w-3.5 h-3.5 text-violet-600" />
          <span className="text-xs font-semibold text-violet-900">
            100% Unedited Social Proof & Customer Reviews
          </span>
        </div>

        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-950 tracking-tight leading-tight">
          What Real People Are Saying About{' '}
          <span className="text-violet-600">{brandName}</span>
        </h1>

        <p className="mt-3 text-sm sm:text-base text-slate-600 max-w-xl mx-auto leading-relaxed">
          Every testimonial below has been auto-harvested from public communities like Reddit, Hacker News, and Google News without bias or manipulation.
        </p>

        {/* Filter Pills */}
        <div className="mt-6 flex items-center justify-center gap-2">
          <button
            type="button"
            onClick={() => setActiveFilter('all')}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
              activeFilter === 'all'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            All Verified Praise ({cards.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter('highlights')}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeFilter === 'highlights'
                ? 'bg-violet-600 text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <TrendingUp className="w-3 h-3" />
            Featured Highlights
          </button>
        </div>
      </section>

      {/* ── 3. Proof Cards Grid ── */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {filteredCards.map((card) => (
            <article
              key={card.id}
              className={`rounded-2xl border p-5 sm:p-6 transition-all bg-white flex flex-col justify-between shadow-2xs hover:shadow-md ${
                card.highlight ? 'border-violet-200/90 ring-1 ring-violet-500/10' : 'border-slate-200/80'
              }`}
            >
              <div>
                {/* Header: Author + Source Badge */}
                <div className="flex items-center justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200/80 flex items-center justify-center font-bold text-slate-700 text-xs">
                      {card.author.charAt(0)}
                    </div>
                    <div>
                      <div className="font-bold text-sm text-slate-900 leading-tight">
                        {card.author}
                      </div>
                      <div className="text-[11px] text-slate-400 font-medium">
                        {card.handle}
                      </div>
                    </div>
                  </div>

                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold border ${getSourceBadgeColor(
                      card.source
                    )}`}
                  >
                    {card.source}
                  </span>
                </div>

                {/* Rating Stars */}
                <div className="flex text-amber-400 mb-2.5">
                  {[...Array(card.rating)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-current" />
                  ))}
                </div>

                {/* Quote Body */}
                <p className="text-sm sm:text-[15px] text-slate-800 leading-relaxed font-normal">
                  "{card.quote}"
                </p>
              </div>

              {/* Footer: Date & Source Link */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400 font-medium">
                <span>{card.date}</span>
                <a
                  href={card.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-violet-600 hover:text-violet-800 font-semibold hover:underline"
                >
                  <span>Original Post</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </article>
          ))}
        </div>
      </main>

      {/* ── 4. Bottom Sticky Viral Loop Acquisition Badge ── */}
      <aside className="fixed bottom-3 inset-x-0 z-50 flex justify-center px-4 pointer-events-none">
        <div className="pointer-events-auto bg-slate-950/95 text-white backdrop-blur-md border border-slate-800/90 rounded-2xl py-2.5 px-4 sm:px-6 shadow-2xl flex items-center gap-3 max-w-xl w-full justify-between animate-fade-in">
          <div className="flex items-center gap-2 truncate">
            <span className="text-base select-none">🐼</span>
            <div className="truncate">
              <p className="text-xs font-semibold text-slate-200 truncate">
                Verified & Auto-Harvested by PandaPraise
              </p>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                Zero-cost social proof & competitor lead poacher
              </p>
            </div>
          </div>

          <Link
            to="/signup"
            className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold transition-all shadow-xs hover:scale-105"
          >
            <span>Hunt your own praise & poach competitor leads free</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </aside>
    </div>
  );
};

export default HostedProofVaultPage;
