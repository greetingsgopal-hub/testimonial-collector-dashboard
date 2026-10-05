import React, { useState } from 'react';
import {
  Search,
  Mail,
  Trash2,
  ShieldCheck,
  ExternalLink,
  Copy,
  Check,
  HeartHandshake,
  Filter,
} from 'lucide-react';
import { Review } from '../../../types';
import { useAuth } from '../../../context/AuthContext';

interface FeedbackViewProps {
  feedbackList?: Review[];
  onDeleteFeedback?: (id: string) => void;
}

export const FeedbackView: React.FC<FeedbackViewProps> = ({
  feedbackList = [],
  onDeleteFeedback,
}) => {
  const { project, collectionForm } = useAuth();
  const [search, setSearch] = useState('');
  const [ratingFilter, setRatingFilter] = useState<'all' | 1 | 2 | 3>('all');
  const [copied, setCopied] = useState(false);

  const publicSlug = collectionForm?.publicSlug || project?.slug || 'feedback';
  const collectionUrl = `${window.location.origin}/c/${publicSlug}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(collectionUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Filtered by search and star rating
  const filtered = feedbackList.filter(f => {
    const matchesSearch =
      f.name.toLowerCase().includes(search.toLowerCase()) ||
      f.content.toLowerCase().includes(search.toLowerCase()) ||
      (f.email && f.email.toLowerCase().includes(search.toLowerCase()));

    const matchesRating = ratingFilter === 'all' || f.rating === ratingFilter;

    return matchesSearch && matchesRating;
  });

  const count1Star = feedbackList.filter(f => f.rating === 1).length;
  const count2Star = feedbackList.filter(f => f.rating === 2).length;
  const count3Star = feedbackList.filter(f => f.rating === 3).length;

  return (
    <div className="max-w-5xl mx-auto py-4 px-2 sm:px-4 space-y-6 animate-fade-in font-sans">
      
      {/* Apple Executive Hero Header */}
      <section className="apple-glass-card rounded-2xl p-6 sm:p-7 border border-black/[0.06] bg-white/80 backdrop-blur-2xl relative overflow-hidden">
        {/* Subtle Ambient Radial Lighting */}
        <div className="absolute -top-16 -right-16 w-56 h-56 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-violet-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 text-[11px] font-bold tracking-tight">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Reputation Shield</span>
              <span className="text-emerald-300">•</span>
              <span className="text-zinc-600 font-medium">{project?.name || 'Workspace'}</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-950 tracking-tight font-display">
              Private Customer Insights & Resolution
            </h1>

            <p className="text-xs sm:text-sm text-zinc-500 leading-relaxed">
              Autonomous reputation shield. Submissions with 1–3 stars are intercepted privately so you can resolve customer concerns directly before anything touches public platforms.
            </p>
          </div>

          {/* Tactical Status Cards */}
          <div className="shrink-0 grid grid-cols-3 gap-2.5 sm:gap-3">
            <div className="px-3.5 py-2.5 rounded-xl bg-zinc-50/90 border border-black/[0.05] text-center">
              <span className="block text-base font-extrabold text-emerald-600 font-mono">100%</span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Shielded</span>
            </div>
            <div className="px-3.5 py-2.5 rounded-xl bg-zinc-50/90 border border-black/[0.05] text-center">
              <span className="block text-base font-extrabold text-zinc-900 font-mono">≤ 3★</span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Route Rule</span>
            </div>
            <div className="px-3.5 py-2.5 rounded-xl bg-zinc-50/90 border border-black/[0.05] text-center">
              <span className={`block text-base font-extrabold font-mono ${feedbackList.length > 0 ? 'text-amber-600' : 'text-zinc-900'}`}>
                {feedbackList.length}
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">In Inbox</span>
            </div>
          </div>
        </div>
      </section>

      {/* Apple Search & Rating Filter Toolbar */}
      <section className="apple-glass-card rounded-xl p-2.5 sm:p-3 flex flex-col sm:flex-row items-center justify-between gap-3 border border-black/[0.06] bg-white/80 backdrop-blur-xl">
        {/* Search Input */}
        <div className="relative w-full sm:max-w-xs">
          <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by customer, note, email..."
            className="w-full pl-9 pr-3 py-1.5 bg-zinc-50/80 hover:bg-zinc-50 focus:bg-white border border-black/[0.06] focus:border-zinc-400 rounded-lg text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-none transition-all"
          />
        </div>

        {/* Rating Filter Segmented Controls */}
        <div className="flex items-center gap-1.5 w-full sm:w-auto justify-end overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setRatingFilter('all')}
            className={`apple-touch px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              ratingFilter === 'all'
                ? 'bg-zinc-950 text-white shadow-xs'
                : 'bg-zinc-50 hover:bg-zinc-100 text-zinc-600 border border-black/[0.05]'
            }`}
          >
            All ({feedbackList.length})
          </button>
          <button
            onClick={() => setRatingFilter(1)}
            className={`apple-touch px-2.5 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 cursor-pointer ${
              ratingFilter === 1
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-zinc-50 hover:bg-zinc-100 text-zinc-600 border border-black/[0.05]'
            }`}
          >
            <span>1★</span>
            <span className="opacity-70">({count1Star})</span>
          </button>
          <button
            onClick={() => setRatingFilter(2)}
            className={`apple-touch px-2.5 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 cursor-pointer ${
              ratingFilter === 2
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-zinc-50 hover:bg-zinc-100 text-zinc-600 border border-black/[0.05]'
            }`}
          >
            <span>2★</span>
            <span className="opacity-70">({count2Star})</span>
          </button>
          <button
            onClick={() => setRatingFilter(3)}
            className={`apple-touch px-2.5 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 cursor-pointer ${
              ratingFilter === 3
                ? 'bg-amber-500 text-white shadow-xs'
                : 'bg-zinc-50 hover:bg-zinc-100 text-zinc-600 border border-black/[0.05]'
            }`}
          >
            <span>3★</span>
            <span className="opacity-70">({count3Star})</span>
          </button>
        </div>
      </section>

      {/* Main Content: High-Efficiency Bento or Active Items */}
      {feedbackList.length === 0 ? (
        /* Empty Inbox: Apple Shield Active Hub */
        <div className="space-y-5">
          <section className="apple-glass-card rounded-2xl p-8 sm:p-10 border border-emerald-500/20 bg-emerald-500/[0.02] backdrop-blur-2xl text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center mx-auto text-emerald-600 shadow-xs">
              <ShieldCheck className="w-7 h-7" />
            </div>

            <div className="space-y-1.5 max-w-lg mx-auto">
              <h2 className="text-lg font-bold text-zinc-950 tracking-tight">
                Your Public Reputation is 100% Protected
              </h2>
              <p className="text-xs text-zinc-500 leading-relaxed">
                Zero detractor feedback or low ratings have been received. When a customer rates 1–3 stars on your collection form, their comments are automatically diverted to this private inbox so you can resolve them one-on-one before anything is published.
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2.5 pt-2">
              <button
                onClick={handleCopyLink}
                className="apple-touch inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-zinc-50 text-zinc-800 border border-black/[0.08] text-xs font-semibold shadow-2xs transition-all cursor-pointer"
                title="Copy public collection link"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-zinc-500" />}
                <span>{copied ? 'Copied Form Link' : 'Copy Form Link'}</span>
              </button>

              <button
                onClick={() => window.open(collectionUrl, '_blank')}
                className="apple-touch inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-semibold shadow-xs transition-all cursor-pointer"
                title="Open collection form to test low-rating interception"
              >
                <span>Test Interception Form</span>
                <ExternalLink className="w-3.5 h-3.5 text-zinc-400" />
              </button>
            </div>
          </section>

          {/* How Private Interception Works (Apple 3-Stage Bento Architecture) */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="apple-glass-card rounded-2xl p-5 border border-black/[0.06] bg-white/70 backdrop-blur-xl space-y-2">
              <div className="w-8 h-8 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-700 mb-3">
                <Filter className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 font-mono">
                01 · Automated Filter
              </span>
              <h3 className="text-sm font-bold text-zinc-900">
                1–3 Star Interception
              </h3>
              <p className="text-xs text-zinc-500 leading-relaxed">
                When customers rate 1–3 stars, the form instantly switches to private feedback mode, prompting for constructive critique.
              </p>
            </div>

            <div className="apple-glass-card rounded-2xl p-5 border border-black/[0.06] bg-white/70 backdrop-blur-xl space-y-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-700 mb-3">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 font-mono">
                02 · Zero Public Exposure
              </span>
              <h3 className="text-sm font-bold text-zinc-900">
                Guaranteed Wall Shield
              </h3>
              <p className="text-xs text-zinc-500 leading-relaxed">
                These responses are blocked from public Wall of Love grids, social proof toasts, and Google Rich Snippet feeds.
              </p>
            </div>

            <div className="apple-glass-card rounded-2xl p-5 border border-black/[0.06] bg-white/70 backdrop-blur-xl space-y-2">
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-700 mb-3">
                <HeartHandshake className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 font-mono">
                03 · Closed-Loop Resolution
              </span>
              <h3 className="text-sm font-bold text-zinc-900">
                Direct 1-on-1 Contact
              </h3>
              <p className="text-xs text-zinc-500 leading-relaxed">
                Use one-click pre-drafted email replies to resolve customer pain points directly and turn detractors into promoters.
              </p>
            </div>
          </section>
        </div>
      ) : filtered.length === 0 ? (
        /* Search has no results */
        <div className="apple-glass-card rounded-2xl py-16 text-center space-y-3 border border-black/[0.06] bg-white/80">
          <div className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center mx-auto text-zinc-400">
            <Search className="w-5 h-5" />
          </div>
          <p className="text-sm font-semibold text-zinc-800">No feedback matching your filters</p>
          <p className="text-xs text-zinc-400">Try changing your search terms or resetting the star filter.</p>
          <button
            onClick={() => { setSearch(''); setRatingFilter('all'); }}
            className="apple-touch px-3 py-1.5 rounded-lg bg-zinc-950 text-white text-xs font-semibold cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        /* Active Feedback Cards */
        <div className="space-y-3">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="apple-glass-card rounded-2xl p-5 sm:p-6 border border-black/[0.06] bg-white/80 backdrop-blur-xl shadow-xs hover:shadow-md transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-5 group"
            >
              <div className="space-y-2.5 max-w-2xl">
                <div className="flex flex-wrap items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-zinc-800 to-zinc-950 text-white flex items-center justify-center text-xs font-bold font-mono">
                    {item.name ? item.name[0].toUpperCase() : 'U'}
                  </div>

                  <span className="text-xs font-bold text-zinc-900">{item.name}</span>

                  {/* Rating Badge */}
                  <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                    item.rating === 1
                      ? 'bg-rose-50 text-rose-700 border-rose-200'
                      : item.rating === 2
                      ? 'bg-amber-50 text-amber-700 border-amber-200'
                      : 'bg-amber-50/70 text-amber-700 border-amber-200'
                  }`}>
                    <span>{item.rating}★</span>
                    <span>{item.rating === 1 ? 'Needs Attention' : item.rating === 2 ? 'Fair' : 'Constructive'}</span>
                  </div>

                  <span className="text-[10px] text-zinc-400 font-mono">
                    {new Date(item.createdAt).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-zinc-700 leading-relaxed italic bg-zinc-50/60 p-3 rounded-xl border border-black/[0.03]">
                  "{item.content}"
                </p>

                {item.email && (
                  <div className="flex items-center gap-1.5 text-[11px] text-zinc-500 font-mono">
                    <Mail className="w-3.5 h-3.5 text-zinc-400" />
                    <span>{item.email}</span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                {item.email && (
                  <a
                    href={`mailto:${item.email}?subject=${encodeURIComponent(`Following up on your experience with ${project?.name || 'our service'}`)}&body=${encodeURIComponent(`Hi ${item.name},\n\nThank you for sharing your candid feedback. We take your experience seriously and would love to make this right.\n\nBest regards,\n${project?.name || 'The Team'}`)}`}
                    className="apple-touch px-3.5 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-semibold shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>Resolve via Email</span>
                  </a>
                )}

                {onDeleteFeedback && (
                  <button
                    onClick={() => onDeleteFeedback(item.id)}
                    className="apple-touch p-2 rounded-xl text-zinc-400 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-100 transition-all cursor-pointer"
                    title="Delete feedback entry"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};

export default FeedbackView;
