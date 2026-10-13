import React from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { USE_CASES } from '../lib/seoData';
import { usePageSeo } from '../lib/seo';
import { Sparkles, ArrowRight, CheckCircle2 } from 'lucide-react';
import { PandaPraiseIcon } from '../components/PandaPraiseLogo';

export const UseCasePage: React.FC = () => {
  const location = useLocation();
  const { slug } = useParams<{ slug?: string }>();

  // Resolve matching use case either from pathname or slug
  const pathname = location.pathname.replace(/\/$/, '');
  const uc =
    USE_CASES.find((u) => u.path === pathname) ||
    USE_CASES.find((u) => u.slug === slug?.toLowerCase()) ||
    USE_CASES[0];

  usePageSeo({
    title: uc.metaTitle,
    description: uc.metaDescription,
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-purple-500/30">
      {/* Header */}
      <header className="border-b border-white/10 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 font-bold text-lg text-white">
            <PandaPraiseIcon size={28} />
            <span>PandaPraise</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link to="/pricing" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">Pricing</Link>
            <Link to="/signup" className="px-4 py-2 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-500 text-white transition-all shadow-md">Get Started Free</Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-6 py-16 sm:py-24 space-y-16">
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-900/40 border border-purple-500/30 text-purple-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Tailored for {uc.industry}</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            {uc.heroHeadline}
          </h1>
          <p className="text-base sm:text-lg text-slate-400 font-normal">
            {uc.heroSubtitle}
          </p>
          <div className="pt-4">
            <Link
              to="/signup"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl font-bold text-sm bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-lg transition-all"
            >
              <span>Get Started Free</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Recommended Layout Banner */}
        <div className="p-6 rounded-3xl bg-purple-950/30 border border-purple-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">Recommended Widget Layout</span>
            <h2 className="text-lg font-bold text-white mt-1">{uc.recommendedLayout}</h2>
          </div>
          <Link
            to="/signup"
            className="px-5 py-2.5 rounded-xl font-bold text-xs bg-white text-purple-950 hover:bg-purple-50 transition-colors shrink-0"
          >
            Preview in Studio
          </Link>
        </div>

        {/* Key Benefits */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {uc.keyBenefits.map((b, i) => (
            <div key={i} className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-purple-400">
                <CheckCircle2 className="w-4 h-4" />
                <h3 className="text-base font-bold text-white">{b.title}</h3>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">{b.desc}</p>
            </div>
          ))}
        </div>

        {/* FAQs */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-white text-center">Frequently Asked Questions</h2>
          <div className="space-y-3 max-w-2xl mx-auto">
            {uc.faqs.map((faq, i) => (
              <div key={i} className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
                <h3 className="text-sm font-bold text-white">{faq.question}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{faq.answer}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};
export default UseCasePage;
