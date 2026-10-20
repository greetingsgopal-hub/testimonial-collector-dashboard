import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Hammer, Compass, Sparkles } from 'lucide-react';
import { usePageSeo } from '../lib/seo';
import { PandaPraiseIcon } from '../components/PandaPraiseLogo';

export const RoadmapPage: React.FC = () => {
  usePageSeo({
    title: 'Product Roadmap — Panda Praise',
    description: 'Explore live features, what is currently in active development, and what is planned next for Panda Praise.',
    canonical: `${window.location.origin}/roadmap`,
  });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 relative selection:bg-purple-100 selection:text-[#6701e6]">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-100/40 via-slate-50 to-slate-50 pointer-events-none" />

      {/* Header */}
      <header className="sticky top-0 z-40 w-full bg-white/80 backdrop-blur-md border-b border-gray-200/80">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <PandaPraiseIcon size={36} colorMode="gradient" className="shrink-0" />
            <div className="flex items-center gap-1.5">
              <span className="font-display font-extrabold text-lg text-gray-900 tracking-tight">
                Panda <span className="bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">Praise</span>
              </span>
            </div>
          </Link>

          <Link
            to="/"
            className="px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold text-gray-700 bg-white border border-gray-200 shadow-2xs hover:bg-gray-50 hover:text-gray-900 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-gray-500" />
            <span>Back to Home</span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 relative z-10">
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="mb-6">
          <ol className="flex items-center space-x-2 text-xs text-gray-500 font-medium">
            <li>
              <Link to="/" className="hover:text-gray-900 transition-colors">Panda Praise</Link>
            </li>
            <li className="text-gray-300" aria-hidden="true">/</li>
            <li className="text-gray-900 font-semibold" aria-current="page">Product Roadmap</li>
          </ol>
        </nav>

        {/* Title Card */}
        <div className="bg-white rounded-2xl border border-gray-200/80 p-6 sm:p-10 shadow-xs mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 text-purple-700 text-xs font-semibold mb-4">
            <Sparkles className="w-4 h-4" />
            <span>Transparency First</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-gray-950 tracking-tight mb-3">
            Product Roadmap
          </h1>
          <p className="text-gray-600 text-base sm:text-lg leading-relaxed max-w-2xl">
            We strictly separate what is live from what is planned. Only live features are sold, so you always know exactly what you are getting today.
          </p>
        </div>

        {/* 3 Columns: Live, In Development, Planned */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Live Today */}
          <div className="bg-white rounded-2xl border border-emerald-200/80 p-6 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-emerald-700 font-bold text-sm mb-4">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span>Live Today</span>
              </div>
              <ul className="space-y-3 text-xs text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                  <span><strong>Testimonial Collection Forms:</strong> Branded public link &amp; QR codes</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                  <span><strong>Embeddable Widgets:</strong> Responsive Wall of Love, Ticker, Badges, and Cards</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                  <span><strong>Moderation Inbox:</strong> Approve, tag, filter, and reject incoming praise</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                  <span><strong>Razorpay &amp; Lifetime Passes:</strong> Pay once, own forever</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                  <span><strong>Rich Snippet Schema Export:</strong> Google-ready structured reviews</span>
                </li>
              </ul>
            </div>
            <div className="mt-6 pt-4 border-t border-emerald-100 text-[11px] text-emerald-700 font-semibold">
              Available to all users today
            </div>
          </div>

          {/* In Active Development */}
          <div className="bg-white rounded-2xl border border-indigo-200/80 p-6 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-indigo-700 font-bold text-sm mb-4">
                <Hammer className="w-5 h-5 text-indigo-600" />
                <span>In Development</span>
              </div>
              <ul className="space-y-3 text-xs text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                  <span><strong>Chrome Extension:</strong> 1-click import from X, LinkedIn, and DM threads</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                  <span><strong>Slack Bot Notification:</strong> Instant team notifications on new reviews</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                  <span><strong>Webhook Event Hub:</strong> Trigger custom zaps on approval</span>
                </li>
              </ul>
            </div>
            <div className="mt-6 pt-4 border-t border-indigo-100 text-[11px] text-indigo-700 font-semibold">
              Targeted Q1 2025 release
            </div>
          </div>

          {/* Planned */}
          <div className="bg-white rounded-2xl border border-purple-200/80 p-6 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-purple-700 font-bold text-sm mb-4">
                <Compass className="w-5 h-5 text-purple-600" />
                <span>Planned Next</span>
              </div>
              <ul className="space-y-3 text-xs text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-1.5 shrink-0" />
                  <span><strong>Automated Reward &amp; Gifting:</strong> Send gift codes to verified reviewers</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-1.5 shrink-0" />
                  <span><strong>Video Testimonial Recording:</strong> In-browser video capture with transcript</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-1.5 shrink-0" />
                  <span><strong>AI Sentiment Clustering:</strong> Group praise by customer persona</span>
                </li>
              </ul>
            </div>
            <div className="mt-6 pt-4 border-t border-purple-100 text-[11px] text-purple-700 font-semibold">
              Subject to community voting
            </div>
          </div>
        </div>

        {/* Suggestion Card */}
        <div className="p-6 rounded-2xl bg-white border border-gray-200 flex items-center justify-between gap-4">
          <div>
            <h3 className="font-bold text-gray-900 text-sm">Have a feature request?</h3>
            <p className="text-xs text-gray-500 mt-0.5">We build features requested directly by founders and creators.</p>
          </div>
          <Link to="/contact" className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 transition">
            Submit Feedback
          </Link>
        </div>
      </main>
    </div>
  );
};
