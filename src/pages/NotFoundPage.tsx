import { Link } from 'react-router-dom';
import { Sparkles, ArrowLeft, ArrowRight } from 'lucide-react';
import { usePageSeo } from '../lib/seo';

export const NotFoundPage = () => {
  usePageSeo({
    title: 'Page Not Found — Panda Praise',
    description: "The page you're looking for doesn't exist or may have moved.",
  });

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 selection:bg-brand-500/30 selection:text-brand-200 relative overflow-hidden flex flex-col justify-between">
      <div className="ambient-glow" />

      {/* Header */}
      <header className="w-full glass-panel border-b border-zinc-800/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-pink-500 p-[1px] shadow-glow-sm">
              <div className="w-full h-full bg-zinc-950 rounded-[11px] flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-brand-400" />
              </div>
            </div>
            <span className="font-display font-bold text-lg text-white tracking-tight">Panda Praise</span>
          </Link>
        </div>
      </header>

      {/* Main 404 Card */}
      <main className="max-w-xl mx-auto px-4 py-16 text-center z-10">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-zinc-900 border border-zinc-800 mb-6 shadow-glow-sm">
          <span className="text-3xl font-extrabold text-brand-400 font-mono">404</span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold font-display text-white tracking-tight mb-3">
          Page not found
        </h1>

        <p className="text-sm sm:text-base text-zinc-400 mb-8 max-w-md mx-auto leading-relaxed">
          The page you're looking for doesn't exist or may have moved.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5">
          <Link
            to="/"
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-200 hover:text-white text-sm font-medium border border-zinc-800 transition-colors flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Panda Praise</span>
          </Link>

          <Link
            to="/signup"
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 text-white text-sm font-semibold shadow-glow-sm transition-all flex items-center justify-center gap-2"
          >
            <span>Start Collecting Testimonials</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-800/80 py-6 text-xs text-zinc-500 text-center">
        <div className="max-w-7xl mx-auto px-4">
          <span>Panda Praise • Testimonial Collector & Moderation Dashboard</span>
        </div>
      </footer>
    </div>
  );
};
