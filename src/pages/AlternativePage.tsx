import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { COMPETITORS } from '../lib/seoData';
import { usePageSeo } from '../lib/seo';
import { Check, X, ArrowRight, Sparkles } from 'lucide-react';
import { PandaPraiseIcon } from '../components/PandaPraiseLogo';

export const AlternativePage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const comp = COMPETITORS.find((c) => c.slug === slug?.toLowerCase()) || COMPETITORS[0];

  usePageSeo({
    title: comp.metaTitle,
    description: comp.metaDescription,
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

      {/* Hero */}
      <main className="max-w-6xl mx-auto px-6 py-16 sm:py-24 space-y-16">
        <div className="text-center max-w-3xl mx-auto space-y-5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-900/40 border border-purple-500/30 text-purple-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>2026 Comparison Teardown</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            PandaPraise vs {comp.name}
          </h1>
          <p className="text-base sm:text-lg text-slate-400 font-normal">
            {comp.tagline}. {comp.pricingTeardown}
          </p>
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/signup"
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl font-bold text-sm bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-lg transition-all text-center flex items-center justify-center gap-2"
            >
              <span>Switch to PandaPraise Free</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <a
              href="#matrix"
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl font-bold text-sm bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-center"
            >
              View Feature Matrix
            </a>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{comp.name} Pricing</span>
            <div className="text-2xl font-black text-slate-300">{comp.competitorPrice}</div>
            <p className="text-xs text-slate-500">Steep monthly fees, strict review caps, and locked features.</p>
          </div>

          <div className="p-6 rounded-3xl bg-purple-950/30 border border-purple-500/40 space-y-2 relative overflow-hidden">
            <div className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-purple-600 text-white text-[10px] font-extrabold uppercase tracking-wide">Better Value</div>
            <span className="text-xs font-bold text-purple-300 uppercase tracking-wider">PandaPraise Pricing</span>
            <div className="text-2xl font-black text-white">{comp.pandaPraisePrice}</div>
            <p className="text-xs text-purple-200">15 reviews free forever. Lifetime licenses available with zero hostage fees.</p>
          </div>
        </div>

        {/* Feature Comparison Matrix */}
        <section id="matrix" className="space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Feature Comparison</h2>
            <p className="text-sm text-slate-400">Direct comparison on performance, widget customizability, and features.</p>
          </div>

          <div className="overflow-x-auto rounded-3xl border border-slate-800 bg-slate-900/40">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/80">
                  <th className="p-4 sm:p-5 font-bold text-slate-300">Feature</th>
                  <th className="p-4 sm:p-5 font-bold text-purple-400">PandaPraise</th>
                  <th className="p-4 sm:p-5 font-bold text-slate-400">{comp.name}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {comp.featureMatrix.map((m) => (
                  <tr key={m.feature}>
                    <td className="p-4 sm:p-5 font-medium text-slate-200">
                      {m.feature}
                      {m.note && <span className="block text-xs text-slate-500 mt-0.5">{m.note}</span>}
                    </td>
                    <td className="p-4 sm:p-5 font-bold text-white">
                      {typeof m.pandaPraise === 'boolean' ? (
                        m.pandaPraise ? (
                          <span className="inline-flex items-center gap-1.5 text-emerald-400 font-bold"><Check className="w-4 h-4" /> Yes</span>
                        ) : (
                          <span className="text-slate-500"><X className="w-4 h-4" /></span>
                        )
                      ) : (
                        m.pandaPraise
                      )}
                    </td>
                    <td className="p-4 sm:p-5 text-slate-400">
                      {typeof m.competitor === 'boolean' ? (
                        m.competitor ? (
                          <span className="inline-flex items-center gap-1.5 text-slate-300"><Check className="w-4 h-4" /> Yes</span>
                        ) : (
                          <span className="text-rose-400 inline-flex items-center gap-1"><X className="w-4 h-4" /> No</span>
                        )
                      ) : (
                        m.competitor
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Why Switch */}
        <section className="space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Why Businesses Switch to PandaPraise</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {comp.whySwitch.map((w, i) => (
              <div key={i} className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-3">
                <span className="w-8 h-8 rounded-full bg-purple-900/60 text-purple-300 font-black text-xs flex items-center justify-center">0{i + 1}</span>
                <p className="text-sm text-slate-200 leading-relaxed font-medium">{w}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Migration Guide */}
        <section className="space-y-6 p-8 rounded-3xl bg-slate-900/40 border border-slate-800">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Migration Guide</h2>
            <p className="text-sm text-slate-400">Switch from {comp.name} in under 3 minutes.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
            {comp.migrationSteps.map((s) => (
              <div key={s.step} className="space-y-2">
                <div className="text-xs font-bold text-purple-400 uppercase tracking-wider">Step {s.step}</div>
                <h3 className="text-base font-bold text-white">{s.title}</h3>
                <p className="text-xs text-slate-400">{s.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section className="space-y-6 max-w-3xl mx-auto">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Frequently Asked Questions</h2>
          </div>
          <div className="space-y-4">
            {comp.faqs.map((faq, i) => (
              <div key={i} className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                <h3 className="text-sm font-bold text-white">{faq.question}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{faq.answer}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <div className="p-10 rounded-3xl bg-gradient-to-r from-purple-900/60 via-indigo-900/60 to-purple-900/60 border border-purple-500/40 text-center space-y-4">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Ready to upgrade your social proof?</h2>
          <p className="text-sm text-purple-200 max-w-md mx-auto">
            Free tier includes 15 reviews forever. Set up your first Wall of Love in less than 2 minutes.
          </p>
          <div className="pt-2">
            <Link to="/signup" className="inline-block px-8 py-3 rounded-xl font-bold text-sm bg-white text-slate-950 hover:bg-slate-100 shadow-xl transition-all">
              Get Started Free
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
};
export default AlternativePage;
