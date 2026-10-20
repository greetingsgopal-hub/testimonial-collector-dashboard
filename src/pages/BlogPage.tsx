import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, BookOpen, Clock, ArrowRight } from 'lucide-react';
import { usePageSeo } from '../lib/seo';
import { PandaPraiseIcon } from '../components/PandaPraiseLogo';

const POSTS = [
  {
    slug: 'collect-testimonials-without-annoying-customers',
    title: 'How to Collect Testimonials Without Annoying Your Customers',
    readTime: '4 min read',
    category: 'Best Practices',
    excerpt:
      'The best time to ask for a testimonial is immediately after a customer experiences a clear win. Learn how to ask one specific question and obtain verifiable consent without friction.',
    content: (
      <>
        <p>
          The best time to ask for a testimonial is immediately after a customer experiences a clear win — right after a successful onboarding, a resolved support ticket, or a milestone they told you about.
        </p>
        <p className="mt-2">
          Ask one specific question (“What changed for you after switching?”) rather than a generic “Would you leave a review?”. Always show the person exactly how their words will be displayed, and give them a one-click way to withdraw consent. A testimonial collected with clear consent is worth ten collected in a rush.
        </p>
      </>
    ),
  },
  {
    slug: 'display-social-proof-without-slowing-down-site',
    title: 'Displaying Social Proof Without Slowing Down Your Website',
    readTime: '3 min read',
    category: 'Performance & SEO',
    excerpt:
      'Testimonial widgets are a common cause of layout shift and slow Largest Contentful Paint. Here is how to keep your widgets ultra-fast and SEO-friendly.',
    content: (
      <>
        <p>
          Testimonial widgets are a common cause of layout shift and slow Largest Contentful Paint. Reserve a fixed height for the widget container, lazy-load it below the fold, and serve it from a single cached endpoint rather than one request per testimonial.
        </p>
        <p className="mt-2">
          If your widget blocks the main thread, move it into an iframe with a fixed size. Fast pages convert better than pretty ones.
        </p>
      </>
    ),
  },
  {
    slug: 'why-performance-claims-need-footnotes',
    title: 'Why Growth Claims and Conversion Percentages Need Proof',
    readTime: '3 min read',
    category: 'Ethics & Compliance',
    excerpt:
      'Performance claims on a marketing site are advertising. In India, the US, the UK, and the EU, an unsupported statistical claim can be treated as misleading. Here is how to substantiate them.',
    content: (
      <>
        <p>
          Performance claims on a marketing site are advertising. In India, the US, the UK, and the EU, an unsupported statistical claim can be treated as misleading.
        </p>
        <p className="mt-2">
          If you publish a number, link it to a named case study with the customer’s written permission, state the sample size and the measurement window, and update it when it stops being true. A credible small number beats an incredible big one.
        </p>
      </>
    ),
  },
];

export const BlogPage: React.FC = () => {
  usePageSeo({
    title: 'Blog — Practical Social Proof & Testimonial Insights | Panda Praise',
    description: 'Practical, concise engineering and marketing notes on collecting and displaying customer testimonials ethically and fast.',
    canonical: `${window.location.origin}/blog`,
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
            <li className="text-gray-900 font-semibold" aria-current="page">Blog</li>
          </ol>
        </nav>

        {/* Title Card */}
        <div className="bg-white rounded-2xl border border-gray-200/80 p-6 sm:p-10 shadow-xs mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 text-purple-700 text-xs font-semibold mb-4">
            <BookOpen className="w-4 h-4" />
            <span>Engineering &amp; Growth Insights</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-gray-950 tracking-tight mb-3">
            The Panda Praise Blog
          </h1>
          <p className="text-gray-600 text-base sm:text-lg leading-relaxed max-w-2xl">
            Practical, short, and written by our founding engineering team. No fluff — just actionable ways to collect and display verified social proof.
          </p>
        </div>

        {/* Post List */}
        <div className="space-y-6 mb-12">
          {POSTS.map((post, idx) => (
            <article key={idx} className="bg-white rounded-2xl border border-gray-200/80 p-6 sm:p-8 shadow-xs hover:border-indigo-300 transition-all">
              <div className="flex items-center gap-3 text-xs mb-3">
                <span className="px-2.5 py-0.5 rounded-full bg-purple-50 text-[#6701e6] font-semibold">
                  {post.category}
                </span>
                <span className="text-gray-400">·</span>
                <span className="text-gray-500 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {post.readTime}
                </span>
              </div>
              <h2 className="text-xl font-bold text-gray-900 tracking-tight mb-3">
                {post.title}
              </h2>
              <div className="text-sm text-gray-600 leading-relaxed space-y-2">
                {post.content}
              </div>
            </article>
          ))}
        </div>

        {/* CTA Card */}
        <div className="p-8 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white flex flex-col sm:flex-row items-center justify-between gap-6 shadow-md">
          <div>
            <h3 className="text-lg font-bold">Ready to start collecting verified proof?</h3>
            <p className="text-purple-100 text-xs sm:text-sm mt-1">Get started free today with no credit card required.</p>
          </div>
          <Link
            to="/signup"
            className="px-6 py-3 rounded-xl bg-white text-indigo-700 font-bold text-xs sm:text-sm hover:bg-purple-50 transition shrink-0 flex items-center gap-2"
          >
            <span>Start Free</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </main>
    </div>
  );
};
