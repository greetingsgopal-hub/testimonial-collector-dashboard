import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { usePageSeo } from '../lib/seo';
import { PandaPraiseIcon } from '../components/PandaPraiseLogo';

export const NotFoundPage = () => {
  usePageSeo({
    title: 'Page Not Found — Panda Praise',
    description: "The page you're looking for doesn't exist or may have moved.",
  });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 relative selection:bg-purple-100 selection:text-[#6701e6] flex flex-col justify-between">
      {/* Ambient background glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-100/40 via-slate-50 to-slate-50 pointer-events-none" />

      {/* Header */}
      <header className="sticky top-0 z-40 w-full bg-white/80 backdrop-blur-md border-b border-gray-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <PandaPraiseIcon size={36} colorMode="gradient" className="shrink-0" />
            <span className="font-display font-extrabold text-lg text-gray-900 tracking-tight">
              Panda <span className="bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">Praise</span>
            </span>
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

      {/* Main 404 Card */}
      <main className="max-w-xl mx-auto px-4 py-20 text-center z-10">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-purple-50 border border-purple-200 mb-6 shadow-xs">
          <span className="text-3xl font-extrabold text-[#6701e6] font-mono">404</span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold font-display text-gray-900 tracking-tight mb-3">
          Page not found
        </h1>

        <p className="text-sm sm:text-base text-gray-600 mb-8 max-w-md mx-auto leading-relaxed">
          The page you're looking for doesn't exist, has been moved, or the link may be mistyped.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5">
          <Link
            to="/"
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-white hover:bg-gray-50 text-gray-700 hover:text-gray-900 text-sm font-bold border border-gray-200 shadow-2xs transition-colors flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Panda Praise</span>
          </Link>

          <Link
            to="/signup"
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#6701e6] hover:bg-[#5200bd] text-white text-sm font-bold shadow-xs transition-all flex items-center justify-center gap-2"
          >
            <span>Start Free</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200/80 py-6 text-xs text-gray-500 text-center relative z-10">
        <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span>Panda Praise • Testimonial Collector & Moderation Dashboard</span>
          <div className="flex items-center gap-4">
            <Link to="/" className="hover:text-gray-900">Home</Link>
            <Link to="/pricing" className="hover:text-gray-900">Pricing</Link>
            <Link to="/terms" className="hover:text-gray-900">Terms</Link>
            <Link to="/privacy-policy" className="hover:text-gray-900">Privacy Policy</Link>
            <Link to="/refund-policy" className="hover:text-gray-900">Refund Policy</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};
