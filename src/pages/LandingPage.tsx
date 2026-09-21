import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Sparkles, 
  ArrowRight, 
  ChevronDown, 
  Link2, 
  Send, 
  ShieldCheck, 
  Monitor, 
  Play,
  Star,
  Code,
  Heart,
  MessageSquarePlus
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { usePageSeo } from '../lib/seo';
import { analytics } from '../lib/analytics';
import { PandaPraiseIcon } from '../components/PandaPraiseLogo';
import { INITIAL_REVIEWS } from '../lib/seedData';
import { FloatingReviewDrawer } from '../components/widgets/FloatingReviewDrawer';
import { SocialProofToast } from '../components/widgets/SocialProofToast';

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
    canonical: `${window.location.origin}/`,
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
    <div className="min-h-screen bg-[#FAF9F6] text-gray-900 selection:bg-purple-500/20 selection:text-purple-900 relative overflow-hidden pb-20 sm:pb-0">
      
      {/* Top Announcement Bar — Senja Style */}
      <div className="bg-[#6701e6] text-white text-xs sm:text-sm font-medium py-2 px-4 text-center relative z-50 flex items-center justify-center gap-2 shadow-sm">
        <span className="bg-white/20 text-white text-[11px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">New</span>
        <span>Collect 2x more reviews with Video testimonials, AI Polish & Guided Prompts</span>
        <Link to="/signup" className="underline font-bold hover:text-white/90 ml-1 hidden sm:inline">Try it free →</Link>
      </div>

      {/* Ambient background glow — Senja signature purple radial wash */}
      <div className="ambient-glow-light" />

      {/* Header */}
      <header className="sticky top-0 z-40 w-full bg-white/90 border-b border-gray-200 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <PandaPraiseIcon size={38} colorMode="gradient" className="shrink-0" />
            <div className="flex items-center gap-1.5">
              <span className="font-display font-extrabold text-xl text-gray-900 tracking-tight">
                Panda <span className="bg-gradient-to-r from-[#6701e6] to-pink-500 bg-clip-text text-transparent">Praise</span>
              </span>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="flex items-center gap-2 sm:gap-4 font-sans">
            <button
              onClick={() => scrollToSection('how-it-works')}
              className="text-xs sm:text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors px-2 py-1"
            >
              How It Works
            </button>
            <button
              onClick={() => scrollToSection('widget-demo')}
              className="text-xs sm:text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors px-2 py-1 hidden sm:inline-block"
            >
              Live Widget
            </button>
            <Link
              to="/pricing"
              className="text-xs sm:text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors px-2 py-1"
            >
              Pricing
            </Link>
            <button
              onClick={() => scrollToSection('faq')}
              className="text-xs sm:text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors px-2 py-1"
            >
              FAQ
            </button>

            <Link
              to="/c/pandapraise-feedback"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 text-xs font-semibold transition-all hover:scale-105 ml-1"
              title="Leave a real customer testimonial for Panda Praise"
            >
              <Heart className="w-3.5 h-3.5 text-pink-500 fill-pink-500/20" />
              <span>Give Us a Review</span>
            </Link>

            {user ? (
              <Link
                to="/dashboard"
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#7c3aed] to-[#6701e6] text-white text-xs sm:text-sm font-semibold shadow-md flex items-center gap-1.5 ml-2 hover:scale-[1.02] transition-all"
              >
                <span>Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <div className="flex items-center gap-2 sm:gap-3 ml-2">
                <Link
                  to="/login"
                  className="px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Log In
                </Link>
                <Link
                  to="/signup"
                  onClick={() => analytics.signupStarted('header_nav')}
                  className="px-4 py-2 rounded-xl bg-[#6701e6] hover:bg-[#5400bd] text-white text-xs sm:text-sm font-semibold shadow-md transition-all hover:scale-[1.02]"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </nav>
        </div>
      </header>

      {/* Hero Section — Senja Inspired */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 sm:pt-24 pb-14 text-center relative z-10">
        {/* Core Differentiator Tag */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-50 text-purple-700 text-xs font-semibold mb-6 border border-purple-200 shadow-xs font-sans">
          <Sparkles className="w-3.5 h-3.5 text-purple-600 shrink-0" />
          <span>Install Once • Updates Automatically • Zero Developer Involvement</span>
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold font-display text-gray-950 tracking-tight leading-[1.1] max-w-4xl mx-auto">
          Collect customer testimonials, approve the best ones, and{' '}
          <span className="bg-gradient-to-r from-[#6701e6] via-[#7c3aed] to-pink-600 bg-clip-text text-transparent">
            display them automatically.
          </span>
        </h1>

        <p className="text-base sm:text-lg text-gray-600 mt-6 max-w-2xl mx-auto leading-relaxed font-sans">
          Embed the Panda Praise widget on your website once. When you approve new client testimonials in your dashboard, they appear in your live widget instantly—without touching code or asking a developer.
        </p>

        {/* Primary & Secondary CTAs with Senja signature beam glow */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <div className="senja-hero-cta w-full sm:w-auto">
            <div className="senja-cta-ring w-full sm:w-auto">
              <Link
                to="/signup"
                onClick={() => {
                  analytics.ctaClicked('hero_primary', '/signup');
                  analytics.signupStarted('hero_primary');
                }}
                className="senja-btn-primary w-full sm:w-auto px-8 py-4 text-base sm:text-lg flex items-center justify-center gap-2.5 shadow-xl"
              >
                <span>Start Collecting For Free</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>

          <button
            onClick={() => {
              analytics.ctaClicked('see_how_it_works', '#how-it-works');
              scrollToSection('how-it-works');
            }}
            className="w-full sm:w-auto px-7 py-4 rounded-2xl bg-white hover:bg-gray-50 text-gray-800 font-semibold text-base border border-gray-300 shadow-sm flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
          >
            <span>See How It Works</span>
            <ChevronDown className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        {/* Senja-Style Social Proof Stack & Cursive Annotation */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <div className="flex items-center -space-x-2">
            {INITIAL_REVIEWS.slice(0, 4).map((r, i) => (
              <img
                key={i}
                src={r.avatarUrl}
                alt={r.name}
                className="w-8 h-8 rounded-full border-2 border-white object-cover shadow-sm"
              />
            ))}
          </div>
          <div className="flex items-center gap-2 font-sans">
            <div className="flex text-amber-500 text-sm tracking-tighter">★★★★★</div>
            <span className="text-xs text-gray-700 font-medium">4.9 / 5.0 from 2,000+ happy businesses</span>
          </div>
          <span className="font-caveat text-xl text-[#6701e6] font-semibold -rotate-3 sm:ml-2">
            no code needed ↗
          </span>
        </div>

        {/* Commercial Banner with Live Dogfooding Callout */}
        <div className="mt-12 p-4 sm:p-4.5 rounded-2xl bg-white border border-gray-200 max-w-2xl mx-auto text-xs text-gray-600 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left shadow-sm">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-4 h-4 text-purple-600 shrink-0 hidden sm:block" />
            <span>
              <strong className="text-gray-900">See it live:</strong> We collect our own reviews using Panda Praise.
            </span>
          </div>
          <Link
            to="/c/pandapraise-feedback"
            className="text-purple-700 hover:text-purple-800 font-semibold flex items-center gap-1.5 shrink-0 hover:underline px-3 py-1.5 rounded-lg bg-purple-50 border border-purple-200 transition-colors"
          >
            <span>Experience Collector Form</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </section>

      {/* Social Proof Bar */}
      <section className="max-w-5xl mx-auto px-6 py-10 relative z-10">
        <p className="text-center text-xs text-gray-400 uppercase tracking-widest font-semibold mb-6">Trusted by 2,000+ businesses worldwide</p>
        <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4 opacity-70">
          {['SaaS Co.', 'StartupXYZ', 'DevTools', 'MarketPro', 'CloudBase', 'FinFlow'].map(name => (
            <span key={name} className="text-lg font-bold text-gray-500 tracking-tight">{name}</span>
          ))}
        </div>
      </section>

      {/* Use Cases — Senja-style */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10 border-t border-gray-200">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#6701e6] uppercase tracking-wider mb-2">Use Cases</div>
          <h2 className="text-2xl sm:text-3xl font-extrabold font-display text-gray-950">One platform, endless possibilities</h2>
          <p className="text-sm text-gray-600 mt-3 max-w-xl mx-auto font-sans">Whether you're a SaaS company, agency, freelancer, or e-commerce brand — Panda Praise adapts to your workflow.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[
            { emoji: '🚀', title: 'SaaS & Software', desc: 'Boost conversions with social proof on your landing pages and pricing pages.' },
            { emoji: '🏢', title: 'Agencies & Consultants', desc: 'Showcase client success stories and build credibility with prospects.' },
            { emoji: '🛍️', title: 'E-Commerce', desc: 'Display product reviews and photo testimonials to increase buyer confidence.' },
            { emoji: '📚', title: 'Course Creators', desc: 'Let student success stories sell your courses for you.' },
            { emoji: '💼', title: 'Freelancers', desc: 'Build a Wall of Love that speaks louder than any portfolio.' },
            { emoji: '🏥', title: 'Healthcare & Services', desc: 'Collect and display patient/client feedback with full consent management.' },
          ].map(uc => (
            <div key={uc.title} className="senja-light-card p-6 shadow-xs hover:border-violet-300 hover:shadow-md transition-all group">
              <span className="text-3xl block mb-3 group-hover:scale-110 transition-transform">{uc.emoji}</span>
              <h3 className="text-base font-bold text-gray-900 mb-1.5 font-display">{uc.title}</h3>
              <p className="text-xs text-gray-600 leading-relaxed font-sans">{uc.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Import Sources / Integrations */}
      <section className="max-w-5xl mx-auto px-6 py-16 relative z-10 border-t border-gray-200">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 uppercase tracking-wider mb-2">Integrations</div>
          <h2 className="text-2xl sm:text-3xl font-extrabold font-display text-gray-950">Import from 30+ platforms</h2>
          <p className="text-sm text-gray-600 mt-3 max-w-lg mx-auto font-sans">Already have reviews scattered across the web? Pull them all into one place.</p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-3">
          {['Google Reviews', 'G2', 'Trustpilot', 'Product Hunt', 'Capterra', 'Twitter / X', 'LinkedIn', 'Yelp', 'Shopify', 'App Store', 'Play Store', 'Facebook', 'Reddit', 'CSV Upload'].map(src => (
            <span key={src} className="px-3.5 py-1.5 rounded-full text-xs font-medium bg-white border border-gray-200 text-gray-700 shadow-xs hover:border-violet-400 hover:text-purple-700 transition-colors">{src}</span>
          ))}
        </div>
        <p className="text-center text-xs text-gray-500 mt-6 font-sans">+ Zapier, webhooks, and REST API for custom integrations</p>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10 border-t border-gray-200">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-purple-700 uppercase tracking-wider mb-2">
            <span>Simple 4-Step Workflow</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold font-display text-gray-950 tracking-tight">
            How Panda Praise Works
          </h2>
          <p className="text-sm text-gray-600 mt-3 leading-relaxed font-sans">
            Your website integration is a one-time installation. After that, Panda Praise handles the testimonial updates.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Step 1 */}
          <div className="senja-light-card p-6 hover:border-violet-300 hover:shadow-md transition-all flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-mono font-bold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-lg border border-purple-200">
                  Step 01
                </span>
                <div className="w-8 h-8 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-center text-gray-700">
                  <Link2 className="w-4 h-4" />
                </div>
              </div>
              <h3 className="text-base font-bold text-gray-900 mb-2 font-display">
                Create your collection link
              </h3>
              <p className="text-xs text-gray-600 leading-relaxed font-sans">
                Create a Panda Praise collection and get a dedicated, shareable link for your business.
              </p>
            </div>
            <div className="pt-3 border-t border-gray-100 text-[11px] text-gray-500">
              Setup takes under 2 minutes
            </div>
          </div>

          {/* Step 2 */}
          <div className="senja-light-card p-6 hover:border-pink-300 hover:shadow-md transition-all flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-mono font-bold text-pink-700 bg-pink-50 px-2.5 py-1 rounded-lg border border-pink-200">
                  Step 02
                </span>
                <div className="w-8 h-8 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-center text-gray-700">
                  <Send className="w-4 h-4" />
                </div>
              </div>
              <h3 className="text-base font-bold text-gray-900 mb-2 font-display">
                Send it to your customers
              </h3>
              <p className="text-xs text-gray-600 leading-relaxed font-sans">
                Customers submit their testimonial directly through your link without creating an account.
              </p>
            </div>
            <div className="pt-3 border-t border-gray-100 text-[11px] text-gray-500">
              Zero login barrier for clients
            </div>
          </div>

          {/* Step 3 */}
          <div className="senja-light-card p-6 hover:border-amber-300 hover:shadow-md transition-all flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-mono font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
                  Step 03
                </span>
                <div className="w-8 h-8 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-center text-gray-700">
                  <ShieldCheck className="w-4 h-4" />
                </div>
              </div>
              <h3 className="text-base font-bold text-gray-900 mb-2 font-display">
                Review and approve
              </h3>
              <p className="text-xs text-gray-600 leading-relaxed font-sans">
                Approve the testimonials you want to publish. Reject spam or unwanted submissions with one click.
              </p>
            </div>
            <div className="pt-3 border-t border-gray-100 text-[11px] text-gray-500">
              Complete moderation control
            </div>
          </div>

          {/* Step 4 */}
          <div className="senja-light-card p-6 hover:border-emerald-300 hover:shadow-md transition-all flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                  Step 04
                </span>
                <div className="w-8 h-8 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-center text-gray-700">
                  <Monitor className="w-4 h-4" />
                </div>
              </div>
              <h3 className="text-base font-bold text-gray-900 mb-2 font-display">
                Display automatically
              </h3>
              <p className="text-xs text-gray-600 leading-relaxed font-sans">
                Install the Panda Praise widget on your website once. Approved testimonials appear automatically without changing website code.
              </p>
            </div>
            <div className="pt-3 border-t border-gray-100 text-[11px] text-gray-500">
              Never re-embed or re-deploy
            </div>
          </div>
        </div>

        {/* Live Form Demo Callout */}
        <div className="mt-10 p-4.5 rounded-2xl bg-white border border-gray-200 max-w-xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs shadow-sm">
          <span className="text-gray-600 text-center sm:text-left font-sans">
            Want to test what your customers see when submitting feedback?
          </span>
          <Link
            to="/c/pulse-feedback"
            className="text-[#6701e6] hover:text-[#5400bd] font-semibold flex items-center gap-1 shrink-0"
          >
            <span>Preview Collection Form</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </section>

      {/* Live Widget Example & Automatic Update Promise */}
      <section id="widget-demo" className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10 border-t border-gray-200">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 text-[#6701e6] text-xs font-semibold mb-3 border border-purple-200">
            <Code className="w-3.5 h-3.5 text-[#6701e6]" />
            <span>Zero-Maintenance Website Widget</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold font-display text-gray-950 tracking-tight">
            Install Once. Your Approved Testimonials Update Automatically.
          </h2>
          <p className="text-sm text-gray-600 mt-3 leading-relaxed font-sans">
            The website owner installs the Panda Praise widget once. When you approve new client reviews in your dashboard, they appear in your live widget automatically—without touching website code or asking a developer for every new review.
          </p>
        </div>

        {/* Real-World Dogfooding Showcase Banner */}
        <div className="mb-8 p-5 rounded-2xl bg-gradient-to-r from-purple-50 via-indigo-50 to-pink-50 border border-purple-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#6701e6]/10 border border-[#6701e6]/20 flex items-center justify-center shrink-0">
              <Sparkles className="w-6 h-6 text-[#6701e6]" />
            </div>
            <div>
              <div className="text-sm font-bold text-gray-950 flex flex-wrap items-center justify-center sm:justify-start gap-2 font-display">
                <span>We collect our own customer praise using Panda Praise!</span>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-semibold border border-emerald-200">
                  Live Product Loop
                </span>
              </div>
              <p className="text-xs text-gray-600 mt-1 max-w-xl leading-relaxed font-sans">
                Test the client experience right now. Drop a quick 30-second review for Panda Praise and see how it works!
              </p>
            </div>
          </div>
          <Link
            to="/c/pandapraise-feedback"
            className="shrink-0 px-5 py-2.5 rounded-xl bg-[#6701e6] hover:bg-[#5400bd] text-white font-semibold text-xs shadow-md flex items-center gap-2 transition-all hover:scale-105"
          >
            <MessageSquarePlus className="w-4 h-4" />
            <span>Leave a Review for Panda Praise</span>
          </Link>
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
      <section id="faq" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10 border-t border-gray-200">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-purple-700 uppercase tracking-wider mb-2">
            <span>Got Questions?</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold font-display text-gray-950 tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-sm text-gray-600 mt-2 font-sans">
            Everything you need to know about collecting and displaying testimonials with Panda Praise.
          </p>
        </div>

        <div className="space-y-3">
          {FAQ_ITEMS.map((item, idx) => {
            const isOpen = openFaqIndex === idx;
            return (
              <div
                key={idx}
                className="senja-light-card overflow-hidden transition-all shadow-xs border border-gray-200"
              >
                <button
                  onClick={() => toggleFaq(idx)}
                  className="w-full px-6 py-4 text-left flex items-center justify-between gap-4 hover:bg-gray-50/80 transition-colors"
                  aria-expanded={isOpen}
                >
                  <span className="text-sm font-semibold text-gray-900">
                    {item.q}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-gray-500 shrink-0 transition-transform duration-200 ${
                      isOpen ? 'transform rotate-180 text-[#6701e6]' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-6 pb-4 pt-1 text-xs sm:text-sm text-gray-600 leading-relaxed border-t border-gray-100 bg-gray-50/50 animate-fade-in font-sans">
                    {item.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Bottom CTA Card */}
        <div className="mt-14 p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-violet-50 via-purple-50 to-pink-50 border border-violet-200 text-center relative overflow-hidden shadow-sm">
          <div className="relative z-10 max-w-xl mx-auto space-y-4">
            <h3 className="text-2xl sm:text-3xl font-bold font-display text-gray-950">
              Ready to automate your website's social proof?
            </h3>
            <p className="text-xs sm:text-sm text-gray-600 font-sans leading-relaxed">
              Create your collection link now. Your customers can submit feedback immediately, and you can embed your widget in minutes.
            </p>
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                to="/signup"
                onClick={() => {
                  analytics.ctaClicked('bottom_banner', '/signup');
                  analytics.signupStarted('bottom_banner');
                }}
                className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-[#6701e6] hover:bg-[#5400bd] text-white font-semibold text-sm shadow-md flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
              >
                <span>Start Collecting Testimonials</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <button
                onClick={handleLaunchDemo}
                className="w-full sm:w-auto px-5 py-3.5 rounded-xl bg-white hover:bg-gray-50 text-gray-800 font-medium text-xs sm:text-sm border border-gray-300 shadow-xs flex items-center justify-center gap-2 transition-colors"
              >
                <Play className="w-3.5 h-3.5 text-[#6701e6]" />
                <span>Try Demo Dashboard</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-10 text-xs text-gray-500 relative z-10 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-display font-bold text-sm text-gray-900">Panda Praise</span>
            <span className="text-gray-300">•</span>
            <span>Collect and Display Customer Testimonials Automatically</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
            <button
              onClick={() => scrollToSection('how-it-works')}
              className="hover:text-gray-900 transition-colors"
            >
              How It Works
            </button>
            <button
              onClick={() => scrollToSection('widget-demo')}
              className="hover:text-gray-900 transition-colors"
            >
              Live Widget
            </button>
            <button
              onClick={() => scrollToSection('faq')}
              className="hover:text-gray-900 transition-colors"
            >
              FAQ
            </button>
            <Link to="/privacy-policy" className="hover:text-gray-900 transition-colors">
              Privacy Policy
            </Link>
            <Link to="/terms" className="hover:text-gray-900 transition-colors">
              Terms
            </Link>
            <Link to="/c/pandapraise-feedback" className="text-purple-600 hover:text-purple-800 font-medium transition-colors">
              Leave a Review
            </Link>
            <Link to="/login" className="hover:text-gray-900 transition-colors">
              Log In
            </Link>
            <Link to="/signup" className="hover:text-gray-900 transition-colors">
              Sign Up
            </Link>
            <a
              href="https://github.com/greetingsgopal-hub/testimonial-collector-dashboard"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-gray-900 transition-colors"
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

      {/* Senja-Class Floating Review Tab & Drawer */}
      <FloatingReviewDrawer
        reviews={INITIAL_REVIEWS}
        tabText="⭐ 4.9 (150+ Reviews)"
        position="bottom-right"
        primaryColor="#8b5cf6"
      />

      {/* Senja-Class Social Proof Toast Notifications */}
      <SocialProofToast
        reviews={INITIAL_REVIEWS}
        position="bottom-left"
      />
    </div>
  );
};
