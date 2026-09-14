import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  ChevronDown, 
  Link2, 
  Send, 
  ShieldCheck, 
  Monitor, 
  Play,
  Star,
  Code
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { usePageSeo } from '../lib/seo';
import { analytics } from '../lib/analytics';
import { PandaPraiseIcon } from '../components/PandaPraiseLogo';

const FAQ_ITEMS = [
  {
    q: 'Do I need a developer every time I receive a new testimonial?',
    a: 'No. The website widget is installed once. After installation, newly approved testimonials appear automatically.',
  },
  {
    q: 'Do my customers need to create an account?',
    a: 'No. Customers can submit testimonials through your public collection link without creating a Panda Praise account.',
  },
  {
    q: 'Can I approve testimonials before they appear on my website?',
    a: 'Yes. Testimonials enter your moderation workflow first. You decide which ones are approved and published.',
  },
  {
    q: 'Can customer email addresses appear publicly?',
    a: 'No. Customer contact information is kept out of the public testimonial view.',
  },
  {
    q: 'How does Panda Praise appear on my website?',
    a: 'You install the Panda Praise widget on your website once using the provided embed code. After that, approved testimonials are loaded through the existing widget automatically.',
  },
];

export const LandingPage = () => {
  usePageSeo({
    title: 'Panda Praise — Collect and Display Customer Testimonials',
    description: 'Collect customer testimonials with a simple shareable link, approve the best reviews, and display them automatically on your website with Panda Praise.',
    canonical: 'https://cheery-hummingbird-7ecc95.netlify.app/',
  });

  const navigate = useNavigate();
  const { user, enableDemoMode } = useAuth();
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  const handleLaunchDemo = () => {
    analytics.ctaClicked('demo_mode', '/dashboard');
    enableDemoMode();
    navigate('/dashboard');
  };

  const toggleFaq = (idx: number) => {
    setOpenFaqIndex(openFaqIndex === idx ? null : idx);
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 selection:bg-brand-500/30 selection:text-brand-200 relative overflow-hidden pb-20 sm:pb-0">
      
      {/* Ambient background glow */}
      <div className="ambient-glow" />

      {/* Header */}
      <header className="sticky top-0 z-40 w-full glass-panel border-b border-zinc-800/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <PandaPraiseIcon size={38} colorMode="gradient" className="shrink-0" />
            <div className="flex items-center gap-1.5">
              <span className="font-display font-extrabold text-lg text-white tracking-tight">
                Panda <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Praise</span>
              </span>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="flex items-center gap-2 sm:gap-4">
            <button
              onClick={() => scrollToSection('how-it-works')}
              className="text-xs sm:text-sm font-medium text-zinc-400 hover:text-zinc-200 transition-colors px-2 py-1"
            >
              How It Works
            </button>
            <button
              onClick={() => scrollToSection('widget-demo')}
              className="text-xs sm:text-sm font-medium text-zinc-400 hover:text-zinc-200 transition-colors px-2 py-1 hidden sm:inline-block"
            >
              Live Widget
            </button>
            <button
              onClick={() => scrollToSection('faq')}
              className="text-xs sm:text-sm font-medium text-zinc-400 hover:text-zinc-200 transition-colors px-2 py-1"
            >
              FAQ
            </button>

            {user ? (
              <Link
                to="/dashboard"
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 text-white text-xs sm:text-sm font-semibold shadow-glow-sm flex items-center gap-1.5 ml-2"
              >
                <span>Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <div className="flex items-center gap-2 sm:gap-3 ml-2">
                <Link
                  to="/login"
                  className="px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium text-zinc-300 hover:text-white transition-colors"
                >
                  Log In
                </Link>
                <Link
                  to="/signup"
                  onClick={() => analytics.signupStarted('header_nav')}
                  className="px-3.5 sm:px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs sm:text-sm font-semibold shadow-glow-sm transition-all"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 sm:pt-24 pb-14 text-center relative z-10">
        {/* Core Differentiator Tag */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-500/10 text-brand-300 text-xs font-semibold mb-6 border border-brand-500/25 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-brand-400 shrink-0" />
          <span>Install Once • Updates Automatically • Zero Developer Involvement</span>
        </div>

        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold font-display text-white tracking-tight leading-[1.15] max-w-4xl mx-auto">
          Collect customer testimonials, approve the best ones, and{' '}
          <span className="bg-gradient-to-r from-brand-400 via-pink-400 to-amber-300 bg-clip-text text-transparent">
            display them automatically.
          </span>
        </h1>

        <p className="text-base sm:text-lg text-zinc-400 mt-6 max-w-2xl mx-auto leading-relaxed">
          Embed the Panda Praise widget on your website once. When you approve new client testimonials in your dashboard, they appear in your live widget instantly—without touching code or asking a developer.
        </p>

        {/* Primary & Secondary CTAs */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5 sm:gap-4">
          <Link
            to="/signup"
            onClick={() => {
              analytics.ctaClicked('hero_primary', '/signup');
              analytics.signupStarted('hero_primary');
            }}
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-brand-600 via-indigo-600 to-pink-600 hover:from-brand-500 hover:via-indigo-500 hover:to-pink-500 text-white font-semibold text-sm shadow-glow flex items-center justify-center gap-2 transition-all transform hover:scale-[1.02]"
          >
            <span>Start Collecting Testimonials</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <button
            onClick={() => {
              analytics.ctaClicked('see_how_it_works', '#how-it-works');
              scrollToSection('how-it-works');
            }}
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-zinc-900/90 hover:bg-zinc-800 text-zinc-300 hover:text-white font-medium text-sm border border-zinc-800 flex items-center justify-center gap-2 transition-colors"
          >
            <span>See How It Works</span>
            <ChevronDown className="w-4 h-4 text-zinc-400" />
          </button>
        </div>

        {/* Commercial Banner */}
        <div className="mt-12 p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 max-w-2xl mx-auto text-xs text-zinc-400 flex items-center justify-center gap-2 text-center sm:text-left">
          <Sparkles className="w-4 h-4 text-amber-400 shrink-0 hidden sm:block" />
          <span>
            <strong className="text-zinc-200">The Panda Praise Guarantee:</strong> Your website integration is a one-time setup. After that, your website stays fresh automatically whenever you approve feedback.
          </span>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10 border-t border-zinc-800/60">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-400 uppercase tracking-wider mb-2">
            <span>Simple 4-Step Workflow</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold font-display text-white tracking-tight">
            How Panda Praise Works
          </h2>
          <p className="text-sm text-zinc-400 mt-3 leading-relaxed">
            Your website integration is a one-time installation. After that, Panda Praise handles the testimonial updates.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Step 1 */}
          <div className="glass-panel p-6 rounded-2xl border border-zinc-800/80 hover:border-zinc-700 transition-all flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-mono font-bold text-brand-400 bg-brand-500/10 px-2.5 py-1 rounded-lg border border-brand-500/20">
                  Step 01
                </span>
                <div className="w-8 h-8 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-300">
                  <Link2 className="w-4 h-4" />
                </div>
              </div>
              <h3 className="text-base font-bold text-white mb-2">
                Create your collection link
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Create a Panda Praise collection and get a dedicated, shareable link for your business.
              </p>
            </div>
            <div className="pt-3 border-t border-zinc-800/60 text-[11px] text-zinc-500">
              Setup takes under 2 minutes
            </div>
          </div>

          {/* Step 2 */}
          <div className="glass-panel p-6 rounded-2xl border border-zinc-800/80 hover:border-zinc-700 transition-all flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-mono font-bold text-pink-400 bg-pink-500/10 px-2.5 py-1 rounded-lg border border-pink-500/20">
                  Step 02
                </span>
                <div className="w-8 h-8 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-300">
                  <Send className="w-4 h-4" />
                </div>
              </div>
              <h3 className="text-base font-bold text-white mb-2">
                Send it to your customers
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Customers submit their testimonial directly through your link without creating an account.
              </p>
            </div>
            <div className="pt-3 border-t border-zinc-800/60 text-[11px] text-zinc-500">
              Zero login barrier for clients
            </div>
          </div>

          {/* Step 3 */}
          <div className="glass-panel p-6 rounded-2xl border border-zinc-800/80 hover:border-zinc-700 transition-all flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-mono font-bold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20">
                  Step 03
                </span>
                <div className="w-8 h-8 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-300">
                  <ShieldCheck className="w-4 h-4" />
                </div>
              </div>
              <h3 className="text-base font-bold text-white mb-2">
                Review and approve
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Approve the testimonials you want to publish. Reject spam or unwanted submissions with one click.
              </p>
            </div>
            <div className="pt-3 border-t border-zinc-800/60 text-[11px] text-zinc-500">
              Complete moderation control
            </div>
          </div>

          {/* Step 4 */}
          <div className="glass-panel p-6 rounded-2xl border border-zinc-800/80 hover:border-zinc-700 transition-all flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                  Step 04
                </span>
                <div className="w-8 h-8 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-300">
                  <Monitor className="w-4 h-4" />
                </div>
              </div>
              <h3 className="text-base font-bold text-white mb-2">
                Display automatically
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Install the Panda Praise widget on your website once. Approved testimonials appear automatically without changing website code.
              </p>
            </div>
            <div className="pt-3 border-t border-zinc-800/60 text-[11px] text-zinc-500">
              Never re-embed or re-deploy
            </div>
          </div>
        </div>

        {/* Live Form Demo Callout */}
        <div className="mt-10 p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 max-w-xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <span className="text-zinc-400 text-center sm:text-left">
            Want to test what your customers see when submitting feedback?
          </span>
          <Link
            to="/c/pulse-feedback"
            className="text-brand-400 hover:text-brand-300 font-semibold flex items-center gap-1 shrink-0"
          >
            <span>Preview Collection Form</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </section>

      {/* Live Widget Example & Automatic Update Promise */}
      <section id="widget-demo" className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10 border-t border-zinc-800/60">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 text-brand-300 text-xs font-semibold mb-3 border border-brand-500/25">
            <Code className="w-3.5 h-3.5 text-brand-400" />
            <span>Zero-Maintenance Website Widget</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold font-display text-white tracking-tight">
            Install Once. Your Approved Testimonials Update Automatically.
          </h2>
          <p className="text-sm text-zinc-400 mt-3 leading-relaxed">
            The website owner installs the Panda Praise widget once. When you approve new client reviews in your dashboard, they appear in your live widget automatically—without touching website code or asking a developer for every new review.
          </p>
        </div>

        {/* Live Widget Mockup Frame */}
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-zinc-800/80 shadow-2xl relative">
          <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4 mb-6">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-500/40 border border-red-500/60" />
              <span className="w-3 h-3 rounded-full bg-amber-500/40 border border-amber-500/60" />
              <span className="w-3 h-3 rounded-full bg-emerald-500/40 border border-emerald-500/60" />
              <span className="ml-2 text-xs font-mono text-zinc-500 hidden sm:inline">
                yourwebsite.com/testimonials
              </span>
            </div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 text-[11px] font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Live Auto-Sync Active</span>
            </div>
          </div>

          {/* 3 Verified Testimonial Cards in Widget Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Card 1 */}
            <div className="p-4 rounded-xl bg-zinc-900/90 border border-zinc-800 shadow-md flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-1 mb-2">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <p className="text-xs text-zinc-200 leading-relaxed italic mb-3">
                  "Panda Praise made collecting feedback effortless. Our conversion rate increased within weeks."
                </p>
              </div>
              <div className="flex items-center gap-2.5 pt-2 border-t border-zinc-800/80">
                <div className="w-7 h-7 rounded-full bg-brand-600 text-white font-bold text-[10px] flex items-center justify-center">
                  E
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-white truncate">Elena Rostova</div>
                  <div className="text-[10px] text-zinc-400 truncate">Lead Architect • HexaCorp</div>
                </div>
              </div>
            </div>

            {/* Card 2 */}
            <div className="p-4 rounded-xl bg-zinc-900/90 border border-zinc-800 shadow-md flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-1 mb-2">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <p className="text-xs text-zinc-200 leading-relaxed italic mb-3">
                  "The embed code literally never breaks. Approved reviews show up immediately on our landing page."
                </p>
              </div>
              <div className="flex items-center gap-2.5 pt-2 border-t border-zinc-800/80">
                <div className="w-7 h-7 rounded-full bg-indigo-600 text-white font-bold text-[10px] flex items-center justify-center">
                  M
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-white truncate">Marcus Vance</div>
                  <div className="text-[10px] text-zinc-400 truncate">Head of Growth • ScaleFlow</div>
                </div>
              </div>
            </div>

            {/* Card 3 */}
            <div className="p-4 rounded-xl bg-zinc-900/90 border border-zinc-800 shadow-md flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-1 mb-2">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <p className="text-xs text-zinc-200 leading-relaxed italic mb-3">
                  "Best zero-bloat social proof tool we have ever used. Setup took under 2 minutes."
                </p>
              </div>
              <div className="flex items-center gap-2.5 pt-2 border-t border-zinc-800/80">
                <div className="w-7 h-7 rounded-full bg-pink-600 text-white font-bold text-[10px] flex items-center justify-center">
                  P
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-white truncate">Priya Sharma</div>
                  <div className="text-[10px] text-zinc-400 truncate">VP Engineering • CloudNova</div>
                </div>
              </div>
            </div>
          </div>

          {/* Workflow callout strip */}
          <div className="mt-8 pt-6 border-t border-zinc-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
            <div className="text-zinc-400 text-center sm:text-left">
              <strong className="text-zinc-200">How it connects:</strong> Client submits via your link → You approve in Panda Praise → Widget updates in real time.
            </div>
            <Link
              to="/signup"
              onClick={() => {
                analytics.ctaClicked('widget_section_cta', '/signup');
                analytics.signupStarted('widget_section_cta');
              }}
              className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs transition-colors flex items-center gap-1.5 shrink-0"
            >
              <span>Get Your Embed Code</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Frequently Asked Questions Section */}
      <section id="faq" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10 border-t border-zinc-800/60">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-400 uppercase tracking-wider mb-2">
            <span>Got Questions?</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold font-display text-white tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-sm text-zinc-400 mt-2">
            Everything you need to know about collecting and displaying testimonials with Panda Praise.
          </p>
        </div>

        <div className="space-y-3">
          {FAQ_ITEMS.map((item, idx) => {
            const isOpen = openFaqIndex === idx;
            return (
              <div
                key={idx}
                className="glass-panel rounded-2xl border border-zinc-800/80 overflow-hidden transition-all"
              >
                <button
                  onClick={() => toggleFaq(idx)}
                  className="w-full px-6 py-4 text-left flex items-center justify-between gap-4 hover:bg-zinc-900/40 transition-colors"
                  aria-expanded={isOpen}
                >
                  <span className="text-sm font-semibold text-white">
                    {item.q}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-zinc-400 shrink-0 transition-transform duration-200 ${
                      isOpen ? 'transform rotate-180 text-brand-400' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-6 pb-4 pt-1 text-xs sm:text-sm text-zinc-300 leading-relaxed border-t border-zinc-800/40 bg-zinc-950/40 animate-fade-in">
                    {item.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Bottom CTA Card */}
        <div className="mt-14 glass-panel p-8 rounded-3xl border border-brand-500/20 text-center relative overflow-hidden">
          <div className="relative z-10 max-w-xl mx-auto space-y-4">
            <h3 className="text-2xl font-bold font-display text-white">
              Ready to automate your website's social proof?
            </h3>
            <p className="text-xs sm:text-sm text-zinc-400">
              Create your collection link now. Your customers can submit feedback immediately, and you can embed your widget in minutes.
            </p>
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                to="/signup"
                onClick={() => {
                  analytics.ctaClicked('bottom_banner', '/signup');
                  analytics.signupStarted('bottom_banner');
                }}
                className="w-full sm:w-auto px-7 py-3 rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 text-white font-semibold text-sm shadow-glow flex items-center justify-center gap-2 transition-all"
              >
                <span>Start Collecting Testimonials</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <button
                onClick={handleLaunchDemo}
                className="w-full sm:w-auto px-5 py-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white font-medium text-xs sm:text-sm border border-zinc-800 flex items-center justify-center gap-2 transition-colors"
              >
                <Play className="w-3.5 h-3.5 text-brand-400" />
                <span>Try Demo Dashboard</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-800/80 py-10 text-xs text-zinc-500 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-display font-bold text-sm text-zinc-300">Panda Praise</span>
            <span className="text-zinc-600">•</span>
            <span>Collect and Display Customer Testimonials Automatically</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
            <button
              onClick={() => scrollToSection('how-it-works')}
              className="hover:text-zinc-300 transition-colors"
            >
              How It Works
            </button>
            <button
              onClick={() => scrollToSection('widget-demo')}
              className="hover:text-zinc-300 transition-colors"
            >
              Live Widget
            </button>
            <button
              onClick={() => scrollToSection('faq')}
              className="hover:text-zinc-300 transition-colors"
            >
              FAQ
            </button>
            <Link to="/privacy-policy" className="hover:text-zinc-300 transition-colors">
              Privacy Policy
            </Link>
            <Link to="/terms" className="hover:text-zinc-300 transition-colors">
              Terms
            </Link>
            <Link to="/brand-kit" className="text-purple-400 hover:text-purple-300 font-semibold transition-colors">
              Brand Kit
            </Link>
            <Link to="/login" className="hover:text-zinc-300 transition-colors">
              Log In
            </Link>
            <Link to="/signup" className="hover:text-zinc-300 transition-colors">
              Sign Up
            </Link>
            <a
              href="https://github.com/greetingsgopal-hub/testimonial-collector-dashboard"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-zinc-300 transition-colors"
            >
              GitHub
            </a>
          </div>
        </div>
      </footer>

      {/* Mobile-Only Sticky CTA Bar */}
      <div 
        className="fixed bottom-0 left-0 right-0 z-40 sm:hidden glass-panel border-t border-zinc-800/90 bg-zinc-950/95 backdrop-blur-xl px-4 py-2.5 shadow-2xl"
        style={{ paddingBottom: 'max(0.625rem, env(safe-area-inset-bottom))' }}
        role="region"
        aria-label="Quick Action"
      >
        <div className="flex items-center justify-between gap-3 max-w-md mx-auto">
          <div className="text-left min-w-0">
            <div className="text-xs font-bold text-white truncate">Install Once. Auto Updates.</div>
            <div className="text-[10px] text-zinc-400 truncate">No developer needed for new reviews</div>
          </div>
          <Link
            to="/signup"
            onClick={() => {
              analytics.ctaClicked('mobile_sticky_cta', '/signup');
              analytics.signupStarted('mobile_sticky_cta');
            }}
            className="shrink-0 px-3.5 py-2 rounded-xl bg-gradient-to-r from-brand-600 to-pink-600 hover:from-brand-500 hover:to-pink-500 text-white font-semibold text-xs shadow-glow-sm flex items-center gap-1.5 active:scale-95 transition-transform"
          >
            <span>Start Collecting</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
};
