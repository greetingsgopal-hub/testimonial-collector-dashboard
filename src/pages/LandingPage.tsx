import { Link, useNavigate } from 'react-router-dom';
import { 
  Sparkles, 
  ArrowRight, 
  ShieldCheck, 
  Layers, 
  Send, 
  Lock, 
  Play
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const LandingPage = () => {
  const navigate = useNavigate();
  const { user, enableDemoMode } = useAuth();

  const handleLaunchDemo = () => {
    enableDemoMode();
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 selection:bg-brand-500/30 selection:text-brand-200 relative overflow-hidden">
      
      {/* Ambient background glow */}
      <div className="ambient-glow" />

      {/* Header */}
      <header className="sticky top-0 z-40 w-full glass-panel border-b border-zinc-800/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-pink-500 p-[1px] shadow-glow-sm">
              <div className="w-full h-full bg-zinc-950 rounded-[11px] flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-brand-400" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-display font-bold text-lg text-white tracking-tight">ReviewVault</span>
              <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-brand-500/15 text-brand-300 border border-brand-500/30">
                SaaS v1.0
              </span>
            </div>
          </Link>

          <nav className="flex items-center gap-3">
            {user ? (
              <Link
                to="/dashboard"
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 text-white text-xs sm:text-sm font-semibold shadow-glow-sm flex items-center gap-1.5"
              >
                <span>Go to Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <>
                <button
                  onClick={handleLaunchDemo}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-400 hover:text-white hover:bg-zinc-900 border border-zinc-800 transition-colors flex items-center gap-1.5"
                >
                  <Play className="w-3.5 h-3.5 text-brand-400" />
                  <span>Try Demo</span>
                </button>
                <Link
                  to="/login"
                  className="px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium text-zinc-300 hover:text-white transition-colors"
                >
                  Log In
                </Link>
                <Link
                  to="/signup"
                  className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs sm:text-sm font-semibold shadow-glow-sm transition-all"
                >
                  Sign Up Free
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 text-center relative z-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-500/10 text-brand-300 text-xs font-semibold mb-6 border border-brand-500/25 animate-fade-in">
          <ShieldCheck className="w-4 h-4 text-brand-400" />
          <span>Multi-Tenant • Row Level Security • Supabase Powered</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold font-display text-white tracking-tight leading-[1.15] max-w-4xl mx-auto">
          Turn Customer Praise into <br className="hidden sm:inline" />
          <span className="bg-gradient-to-r from-brand-400 via-pink-400 to-amber-300 bg-clip-text text-transparent">
            Unstoppable Social Proof
          </span>
        </h1>

        <p className="text-base sm:text-lg text-zinc-400 mt-6 max-w-2xl mx-auto leading-relaxed">
          Collect reviews effortlessly via dedicated public collection URLs, moderate submissions from a private multi-tenant dashboard, and showcase high-converting social proof.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/signup"
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-brand-600 via-indigo-600 to-pink-600 hover:from-brand-500 hover:via-indigo-500 hover:to-pink-500 text-white font-semibold text-sm shadow-glow flex items-center justify-center gap-2 transition-all transform hover:scale-[1.02]"
          >
            <span>Start Collecting Reviews</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <button
            onClick={handleLaunchDemo}
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-zinc-900/90 hover:bg-zinc-800 text-zinc-300 hover:text-white font-medium text-sm border border-zinc-800 flex items-center justify-center gap-2 transition-colors"
          >
            <Play className="w-4 h-4 text-brand-400" />
            <span>Explore Dashboard Demo</span>
          </button>
        </div>

        {/* Feature Pill Highlights */}
        <div className="mt-14 grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
          <div className="glass-panel p-5 rounded-2xl border border-white/10 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-brand-500/10 text-brand-400 flex items-center justify-center">
              <Send className="w-4 h-4" />
            </div>
            <h4 className="text-sm font-bold text-white">Standalone Public URLs</h4>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Send customers directly to your dedicated collection link. Completely isolated from your private admin area.
            </p>
          </div>

          <div className="glass-panel p-5 rounded-2xl border border-white/10 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-pink-500/10 text-pink-400 flex items-center justify-center">
              <Lock className="w-4 h-4" />
            </div>
            <h4 className="text-sm font-bold text-white">Strict Multi-Tenant RLS</h4>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Every workspace, project, and testimonial has verified cryptographic ownership back to your Supabase account.
            </p>
          </div>

          <div className="glass-panel p-5 rounded-2xl border border-white/10 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
            <h4 className="text-sm font-bold text-white">Social Proof Widgets</h4>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Curate approved reviews into a Wall of Love, responsive carousel, or trust badges for your checkout flow.
            </p>
          </div>
        </div>

        {/* Public Collection Demo Preview Link */}
        <div className="mt-12 p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 max-w-xl mx-auto flex items-center justify-between text-xs">
          <span className="text-zinc-400">
            Want to see how customers submit feedback?
          </span>
          <Link
            to="/c/pulse-feedback"
            className="text-brand-400 hover:text-brand-300 font-semibold flex items-center gap-1"
          >
            <span>View Public Collector Form</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-800/80 py-8 text-xs text-zinc-500 text-center">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span>ReviewVault • Secure Multi-Tenant Social Proof Platform</span>
          <div className="flex items-center gap-4">
            <Link to="/login" className="hover:text-zinc-300">Log In</Link>
            <Link to="/signup" className="hover:text-zinc-300">Sign Up</Link>
            <a href="https://github.com/greetingsgopal-hub/testimonial-collector-dashboard" target="_blank" rel="noopener noreferrer" className="hover:text-zinc-300">GitHub</a>
          </div>
        </div>
      </footer>
    </div>
  );
};
