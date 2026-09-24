import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ArrowRight, 
  ChevronDown, 
  Check, 
  X as XIcon, 
  Play, 
  Search, 
  Video, 
  MessageSquare,
  Gift,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { usePageSeo } from '../lib/seo';
import { analytics } from '../lib/analytics';
import { INITIAL_REVIEWS } from '../lib/seedData';
import { FloatingReviewDrawer } from '../components/widgets/FloatingReviewDrawer';
import { SocialProofToast } from '../components/widgets/SocialProofToast';

const FAQ_ITEMS = [
  {
    q: 'Do I need a developer every time I receive a new testimonial?',
    a: 'No. The website widget is installed once with a simple one-line embed code. After installation, newly approved testimonials appear on your site automatically.',
  },
  {
    q: 'Do my customers need to create an account to leave a review?',
    a: 'No. Customers submit testimonials through your branded public link in under 60 seconds without creating any account or downloading an app.',
  },
  {
    q: 'Can I approve testimonials before they appear on my website?',
    a: 'Yes. Every incoming testimonial lands in your private moderation inbox first. You maintain 100% control over which reviews get published.',
  },
  {
    q: 'Can customer email addresses appear publicly?',
    a: 'Never. Customer emails, phone numbers, and private contact details are kept strictly private and never exposed to website visitors.',
  },
  {
    q: 'How does Panda Praise integrate with my website?',
    a: 'Panda Praise works with any website builder including WordPress, Webflow, Framer, Shopify, Squarespace, Wix, React, Next.js, and custom HTML.',
  },
  {
    q: 'Can I import my existing reviews from other platforms?',
    a: 'Yes! You can import existing reviews from Google, Trustpilot, Twitter/X, LinkedIn, G2, Capterra, Product Hunt, or upload via CSV in one click.',
  },
];

const CLIENT_LOGOS = [
  { name: 'om', node: <span className="text-xl font-bold tracking-tight text-gray-500 font-sans">om</span> },
  { name: 'pickupmusic', node: <span className="text-base font-semibold tracking-wide text-gray-500 font-sans">pickupmusic</span> },
  { name: 'Marketing Examined', node: <span className="text-base font-bold text-gray-500 flex items-center gap-1.5"><span className="text-amber-500">★</span> Marketing Examined</span> },
  { name: 'unplugged.', node: <span className="text-base italic text-gray-500 font-sans">unplugged.</span> },
  { name: 'Easlo', node: <span className="text-base font-bold text-gray-600 flex items-center gap-1.5"><span>👓</span> Easlo</span> },
  { name: 'Breakcold', node: <span className="text-base font-bold text-gray-600 flex items-center gap-1.5"><span className="bg-gray-800 text-white text-xs px-1 py-0.5 rounded font-bold">Br</span> Breakcold</span> },
  { name: 'immutable', node: <span className="text-base font-bold tracking-tight text-gray-500">immutable</span> },
  { name: 'Substack', node: <span className="text-base font-semibold text-gray-500 flex items-center gap-1.5"><span className="w-3 h-3 bg-[#FF6719] rounded-sm inline-block" /> Substack</span> },
  { name: 'Beehiiv', node: <span className="text-base font-extrabold text-gray-500">beehiiv</span> },
  { name: 'ConvertKit', node: <span className="text-base font-bold text-gray-500 flex items-center gap-1.5"><span className="w-3 h-3 bg-rose-400 rounded-full inline-block" /> ConvertKit</span> },
  { name: 'Kajabi', node: <span className="text-base font-semibold text-gray-500">kajabi</span> },
  { name: 'Podia', node: <span className="text-base font-bold text-gray-500">podia</span> },
];

export const LandingPage: React.FC = () => {
  usePageSeo({
    title: 'Panda Praise — Collect, Manage and Share Testimonials',
    description: 'The easiest way to collect testimonials and add them to your website. Get started for free with Panda Praise.',
    canonical: `${window.location.origin}/`,
  });

  const navigate = useNavigate();
  const { user, enableDemoMode } = useAuth();
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  const [activeShareTab, setActiveShareTab] = useState<'widgets' | 'videos' | 'walls' | 'popups' | 'images' | 'hosting'>('widgets');
  const [selectedWidgetTag, setSelectedWidgetTag] = useState('Testimonial Image Gallery');
  const [showHeartTab, setShowHeartTab] = useState(false);
  const [showSocialToast, setShowSocialToast] = useState(false);
  const [searchQueryMock, setSearchQueryMock] = useState('do the techs actually use it');
  const [isWallModalOpen, setIsWallModalOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const y = window.scrollY;
      setShowHeartTab(y > 500);
      setShowSocialToast(y > 1650);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
    <div className="min-h-screen bg-[#FAF9F6] text-gray-900 selection:bg-purple-500/20 selection:text-purple-900 relative overflow-hidden pb-20 sm:pb-0 font-sans">
      
      {/* ── 1. Top Announcement Quiz Bar ── */}
      <div className="bg-[#6701e6] hover:bg-[#5400bd] transition-colors text-white py-2 px-4 text-center relative z-50 flex items-center justify-center gap-2 shadow-xs text-xs sm:text-sm font-medium cursor-pointer">
        <Link to="/signup" className="flex items-center gap-1.5 hover:underline">
          <span className="bg-white/20 text-white text-[11px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
            Free quiz
          </span>
          <span>What's your Social Proof Score?</span>
          <span className="hidden sm:inline text-white/80 ml-1">| Take the quiz →</span>
        </Link>
      </div>

      {/* Ambient background glow — Senja signature purple radial wash */}
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[40rem]" style={{ background: 'radial-gradient(75rem 28rem at 50% -4rem, rgb(103 1 230 / 0.08), transparent)' }} />

      {/* ── 2. Header / Navigation ── */}
      <header className="sticky top-0 z-40 w-full bg-white/95 border-b border-gray-200/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-6 h-18 flex items-center justify-between">
          
          {/* Logo strictly clean text "Panda Praise" */}
          <Link to="/" className="flex items-center gap-2 group">
            <span className="font-display font-extrabold text-2xl tracking-tight text-gray-950 group-hover:text-purple-950 transition-colors">
              Panda <span className="text-[#6701e6]">Praise</span>
            </span>
          </Link>

          {/* Nav Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
            <Link to="/pricing" className="hover:text-[#6701e6] transition-colors">
              Pricing
            </Link>
            <button
              onClick={() => scrollToSection('collect-section')}
              className="hover:text-[#6701e6] transition-colors cursor-pointer"
            >
              Product
            </button>
            <button
              onClick={() => scrollToSection('share-section')}
              className="hover:text-[#6701e6] transition-colors cursor-pointer"
            >
              Customers
            </button>
            <button
              onClick={() => scrollToSection('comparison-section')}
              className="hover:text-[#6701e6] transition-colors cursor-pointer"
            >
              Why Panda Praise
            </button>
            <button
              onClick={() => scrollToSection('faq')}
              className="hover:text-[#6701e6] transition-colors cursor-pointer"
            >
              Resources
            </button>
          </nav>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-3">
            {user ? (
              <>
                <Link
                  to="/dashboard"
                  className="px-3.5 py-1.5 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 text-xs sm:text-sm font-medium transition-colors flex items-center gap-1.5"
                >
                  <span>Dashboard</span>
                  <ArrowRight className="w-3.5 h-3.5 text-gray-500" />
                </Link>
                <Link
                  to="/dashboard?new=true"
                  className="px-4 py-2 rounded-xl bg-[#6701e6] hover:bg-[#5400bd] text-white text-xs sm:text-sm font-semibold shadow-sm transition-all hover:scale-[1.02]"
                >
                  Start for free
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-3 py-1.5 text-xs sm:text-sm font-medium text-gray-600 hover:text-gray-950 transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  onClick={() => analytics.signupStarted('header_nav')}
                  className="px-4 py-2 rounded-xl bg-[#6701e6] hover:bg-[#5400bd] text-white text-xs sm:text-sm font-semibold shadow-sm transition-all hover:scale-[1.02]"
                >
                  Start for free
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ── 3. Hero Section (Reconstructed SaaS Architecture) ── */}
      <section className="max-w-5xl mx-auto px-6 pt-16 sm:pt-20 pb-16 text-center relative z-10">
        
        {/* Floating purple sparkle doodle */}
        <div className="absolute left-2 sm:-left-8 top-20 hidden sm:block text-[#6701e6] opacity-75 animate-pulse">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0 L14.6 9.4 L24 12 L14.6 14.6 L12 24 L9.4 14.6 L0 12 L9.4 9.4 Z" />
          </svg>
        </div>

        {/* Top Eyebrow Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-50/80 border border-purple-200/60 mb-6 shadow-xs">
          <span className="flex h-2 w-2 rounded-full bg-[#6701e6] animate-pulse" />
          <span className="text-xs font-semibold text-[#6701e6]">The #1 Social Proof Platform for Growing Businesses</span>
        </div>

        {/* Primary H1: Balanced 2-line structure without awkward wrap */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold font-display text-gray-950 tracking-tight leading-[1.12] max-w-4xl mx-auto">
          <span className="sm:whitespace-nowrap">Turn Customer Praise into</span> <br className="hidden sm:inline" />
          <span className="senja-purple-mark mt-2 whitespace-nowrap">
            Your #1 Sales Engine
          </span>
        </h1>

        {/* Subheadline directly below H1 */}
        <p className="mt-6 text-base sm:text-xl text-gray-600 max-w-xl text-balance mx-auto leading-relaxed font-normal">
          <span className="senja-dotted font-medium text-gray-900">Meet Panda Praise</span> — the easiest way to collect, organize, and showcase verified customer proof.
        </p>

        {/* 3 Green Checkmark Reassurance Bullets */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs sm:text-sm text-gray-600 font-medium">
          <div className="flex items-center gap-1.5">
            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Automate video & text collection</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Import from 30+ platforms in 1 click</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Embed widgets, popups & Walls of Love</span>
          </div>
        </div>

        {/* Hero CTA Cluster */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <div className="senja-hero-cta flex items-center">
            <div className="senja-cta-ring">
              <Link
                to="/signup"
                onClick={() => {
                  analytics.ctaClicked('hero_primary', '/signup');
                  analytics.signupStarted('hero_primary');
                }}
                className="senja-btn-primary px-8 py-3.5 sm:py-4 text-base sm:text-lg shadow-xl hover:scale-105 transition-all inline-flex items-center gap-2 font-bold"
              >
                <span>Start for free today</span>
                <ArrowRight className="w-5 h-5 text-white" aria-hidden="true" />
              </Link>
            </div>
          </div>
          <button
            onClick={handleLaunchDemo}
            className="px-6 py-3.5 sm:py-4 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 font-semibold text-sm transition-all shadow-xs flex items-center gap-2 cursor-pointer self-center"
          >
            <Play className="w-4 h-4 text-[#6701e6]" />
            <span>Try Interactive Demo</span>
          </button>
        </div>

        {/* Microcopy reassurance */}
        <p className="mt-2.5 text-xs text-gray-500 font-medium">
          Free forever • No credit card required • 2-minute setup
        </p>

        {/* Avatar Stack + "loved by 20,000+ customers" */}
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-2.5">
          <div className="flex items-center -space-x-2">
            {[
              'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&auto=format&fit=crop&q=80',
              'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&auto=format&fit=crop&q=80',
              'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&auto=format&fit=crop&q=80',
              'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&auto=format&fit=crop&q=80',
              'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=80&auto=format&fit=crop&q=80',
            ].map((img, i) => (
              <img
                key={i}
                src={img}
                alt="Happy customer"
                className="w-7 h-7 rounded-full object-cover ring-2 ring-white"
              />
            ))}
          </div>
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-amber-500 font-bold tracking-tight">★★★★★</span>
            <span className="font-semibold text-gray-700">loved by 20,000+ customers</span>
          </div>
        </div>

        {/* Featured Social Proof Quote Card (Anchored above marquee) */}
        <div className="mt-10 max-w-3xl mx-auto p-5 rounded-2xl bg-white/90 backdrop-blur-sm border border-purple-100/90 shadow-md">
          <div className="flex items-center justify-center gap-1 text-amber-500 mb-2" aria-label="Rated 5 out of 5 stars">
            {[1, 2, 3, 4, 5].map((s) => (
              <span key={s} className="text-sm">★</span>
            ))}
          </div>
          <blockquote className="text-sm sm:text-base font-medium text-gray-800 italic leading-relaxed">
            “I've seen a tangible impact on revenue and conversion by sharing customer proof.”
          </blockquote>
          <div className="mt-3 flex items-center justify-center gap-2.5">
            <img
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=160&auto=format&fit=crop&q=80"
              alt="Jay Clouse"
              className="w-8 h-8 rounded-full object-cover ring-2 ring-purple-200"
            />
            <div className="text-left leading-tight">
              <span className="text-xs font-bold text-gray-900 block">Jay Clouse</span>
              <span className="text-xs text-gray-500">Founder, Creator Science</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── 4. Client Logo Moving Marquee (Senja Exact Parity) ── */}
      <section className="relative w-full overflow-hidden py-8 border-y border-gray-200/70 bg-white/60">
        <div className="marquee-track flex items-center gap-12 sm:gap-16">
          {CLIENT_LOGOS.map((logo, idx) => (
            <div
              key={`logo-a-${idx}`}
              className="shrink-0 flex items-center justify-center opacity-70 hover:opacity-100 transition-opacity select-none cursor-default"
            >
              {logo.node}
            </div>
          ))}
          {/* Duplicate loop for seamless infinite rotation */}
          {CLIENT_LOGOS.map((logo, idx) => (
            <div
              key={`logo-b-${idx}`}
              aria-hidden="true"
              className="shrink-0 flex items-center justify-center opacity-70 hover:opacity-100 transition-opacity select-none cursor-default"
            >
              {logo.node}
            </div>
          ))}
        </div>
      </section>

      {/* ── 5. Before / After Comparison Cards ("The proof advantage") ── */}
      <section id="comparison-section" aria-labelledby="comparison-heading" className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <p className="font-caveat text-3xl text-[#6701e6] -rotate-1 mb-1">
            The proof advantage
          </p>
          <h2 id="comparison-heading" className="text-3xl sm:text-4xl font-extrabold font-display text-gray-950 tracking-tight max-w-md mx-auto text-balance">
            Why Winning Brands Rely on Social Proof
          </h2>
          <p className="text-sm sm:text-base text-gray-600 mt-3 max-w-xl mx-auto">
            See the undeniable impact verified customer praise has on your conversion rates.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Card 1: You Without Social Proof */}
          <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-xs flex flex-col justify-between">
            <div>
              <div className="rounded-2xl overflow-hidden mb-6 aspect-[16/9] bg-gray-100 border border-gray-200 shadow-inner">
                <img
                  src="/assets/senja/video-without.BT548AK4_Z15YjLo.webp"
                  alt="You Without Social Proof"
                  loading="lazy"
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="text-xl font-bold font-display text-gray-900 text-center mb-6">
                You Without Social Proof
              </h3>
              <ul className="space-y-3.5 text-xs sm:text-sm text-gray-600 max-w-sm mx-auto">
                <li className="flex items-start gap-3">
                  <XIcon className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                  <span>Struggling to <span className="senja-dotted">build trust</span></span>
                </li>
                <li className="flex items-start gap-3">
                  <XIcon className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                  <span>Watching sales trickle in</span>
                </li>
                <li className="flex items-start gap-3">
                  <XIcon className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                  <span>Working overtime to prove yourself</span>
                </li>
                <li className="flex items-start gap-3">
                  <XIcon className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                  <span>Blending in with competitors</span>
                </li>
                <li className="flex items-start gap-3">
                  <XIcon className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                  <span>Losing leads to buyer hesitation</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Card 2: You With Social Proof */}
          <div className="bg-purple-50/20 border-2 border-purple-300/80 rounded-3xl p-6 sm:p-8 shadow-lg shadow-purple-500/5 flex flex-col justify-between relative">
            <div>
              <div className="rounded-2xl overflow-hidden mb-6 aspect-[16/9] bg-purple-100 border border-purple-200 shadow-inner">
                <img
                  src="/assets/senja/video-with.Ctn8dyn5_1S8Qct.webp"
                  alt="You With Social Proof celebration"
                  loading="lazy"
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="text-xl font-bold font-display text-gray-900 text-center mb-6">
                You With Social Proof
              </h3>
              <ul className="space-y-3.5 text-xs sm:text-sm text-gray-700 max-w-sm mx-auto font-medium">
                <li className="flex items-start gap-3">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Win customer trust instantly</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Sell like hotcakes</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Turn your audience into advocates</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Stand out from competitors</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Market with confidence</span>
                </li>
              </ul>
            </div>
          </div>

        </div>
      </section>

      {/* ── 6. FEATURE 1: "COLLECT" (Two-Column Alternating: Text LEFT, Visual RIGHT) ── */}
      <section id="collect-section" className="border-t border-gray-200/80 bg-white py-20 sm:py-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            
            {/* Column A: Text Content */}
            <div className="lg:col-span-6 text-left">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200/70 text-amber-800 text-xs font-bold tracking-wide uppercase mb-4">
                <MessageSquare className="w-3.5 h-3.5 text-amber-600" />
                <span>01 / Collect Testimonials</span>
              </div>

              <h2 className="text-3xl sm:text-4xl lg:text-[42px] font-extrabold font-display text-gray-950 tracking-tight leading-[1.15]">
                Collect Video & Text Reviews on Autopilot
              </h2>

              <p className="mt-4 text-base sm:text-lg text-gray-600 leading-relaxed">
                Launch branded collection forms in 30 seconds. No apps, downloads, or customer logins required. Capture authentic video stories and 5-star praise effortlessly.
              </p>

              {/* Feature Checklist Bullets */}
              <ul className="mt-6 space-y-3 text-sm text-gray-700 font-medium">
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Automate video and text collection with guided prompts</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Share via direct link, embed anywhere, or trigger via QR code</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Import from 30+ platforms including Google, Trustpilot & CSV</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Automate triggers with Zapier, webhooks & collection APIs</span>
                </li>
              </ul>

              {/* Action Link & CTA */}
              <div className="mt-8 flex flex-wrap items-center gap-4">
                <Link
                  to="/signup"
                  className="px-6 py-3 rounded-xl bg-[#6701e6] hover:bg-[#5400bd] text-white font-bold text-sm shadow-md transition-all hover:scale-105 inline-flex items-center gap-2"
                >
                  <span>Start collecting for free</span>
                  <ArrowRight className="w-4 h-4 text-white" />
                </Link>
                <Link
                  to="/c/feedback"
                  className="px-5 py-3 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 font-semibold text-sm transition-colors flex items-center gap-1.5"
                >
                  <span>Test live collector form</span>
                  <ExternalLink className="w-4 h-4 text-gray-400" />
                </Link>
              </div>

              {/* In-Section Testimonial Quote */}
              <figure className="relative border-l-2 border-black py-2 pl-4 text-left mt-8 max-w-lg">
                <blockquote className="text-xs sm:text-sm text-gray-700 leading-relaxed">
                  <p>
                    Panda Praise made it so easy and quick to collect testimonials.{' '}
                    <mark className="senja-yellow-mark">
                      Took me less than 5 minutes to start collecting
                    </mark>
                    , and adding them to my website was even quicker!
                  </p>
                </blockquote>
                <figcaption className="mt-2.5 flex items-center gap-2.5">
                  <img
                    src="/assets/senja/jamie-northrup.C6GwZu-2_s1skM.webp"
                    alt="Jamie Northrup"
                    loading="lazy"
                    className="h-8 w-8 rounded-full object-cover border border-gray-200"
                  />
                  <div>
                    <p className="font-bold text-gray-900 text-xs">Jamie Northrup</p>
                    <p className="text-[11px] text-gray-500">Minimalist Hustler</p>
                  </div>
                </figcaption>
              </figure>
            </div>

            {/* Column B: Product Demonstration Mockup */}
            <div className="lg:col-span-6">
              <div className="rounded-3xl bg-gradient-to-br from-amber-400 to-orange-500 p-6 sm:p-10 shadow-xl">
                <div className="bg-white rounded-2xl p-6 sm:p-7 shadow-2xl max-w-md mx-auto text-left">
                  <div className="flex items-center gap-3 mb-4">
                    <img
                      src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
                      alt="Creator"
                      className="w-11 h-11 rounded-full object-cover ring-2 ring-amber-200"
                    />
                    <div>
                      <h3 className="font-bold text-gray-900 text-sm sm:text-base">
                        Share a testimonial for my course 🫶
                      </h3>
                      <p className="text-xs text-gray-500">Takes less than 60 seconds</p>
                    </div>
                  </div>

                  {/* Mock video container */}
                  <div className="rounded-xl bg-gray-900 text-white p-5 mb-4 flex flex-col items-center justify-center text-center aspect-video relative overflow-hidden group">
                    <div className="w-11 h-11 rounded-full bg-[#6701e6] flex items-center justify-center text-white shadow-lg mb-2 group-hover:scale-110 transition-transform">
                      <Video className="w-5 h-5" />
                    </div>
                    <p className="text-xs font-semibold">Record a video testimonial</p>
                    <p className="text-[11px] text-gray-400 mt-1">or submit a written review below</p>
                  </div>

                  {/* Prompt helpers */}
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    <span className="text-[11px] bg-gray-100 text-gray-700 px-2.5 py-1 rounded-full font-medium">✨ What was your biggest win?</span>
                    <span className="text-[11px] bg-gray-100 text-gray-700 px-2.5 py-1 rounded-full font-medium">🚀 Would you recommend us?</span>
                  </div>

                  <Link
                    to="/c/feedback"
                    className="w-full py-2.5 rounded-xl bg-[#6701e6] hover:bg-[#5400bd] text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-sm transition-all"
                  >
                    <span>Test live collector form</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── 7. FEATURE 2: "ORGANIZE" (Two-Column Alternating: Visual LEFT, Text RIGHT) ── */}
      <section id="find-section" className="border-t border-gray-200/80 bg-gray-50/70 py-20 sm:py-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            
            {/* Column A: Product Mockup (Proof Vault Window) */}
            <div className="lg:col-span-7 order-2 lg:order-1">
              <div className="rounded-2xl border border-gray-200 bg-white shadow-xl overflow-hidden text-left">
                {/* Browser Bar */}
                <div className="flex items-center gap-1.5 border-b border-gray-200 bg-gray-50 px-4 py-3">
                  <span className="h-2.5 w-2.5 rounded-full bg-rose-400"></span>
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-400"></span>
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-400"></span>
                  <span className="ml-3 rounded bg-white px-2 py-0.5 text-xs text-gray-500 border border-gray-200">
                    app.pandapraise.com/proof
                  </span>
                </div>

                <div className="grid grid-cols-12">
                  {/* Sidebar */}
                  <div className="col-span-12 sm:col-span-4 border-b sm:border-b-0 sm:border-r border-gray-100 p-4 space-y-4 text-xs">
                    <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#6701e6]/10 text-xs font-bold text-[#6701e6]">
                        E
                      </span>
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-gray-800">Erin Doyle</p>
                        <p className="text-xs text-gray-500">Admin</p>
                      </div>
                    </div>

                    <div>
                      <p className="text-[10px] font-bold tracking-wider text-gray-400 uppercase">COLLECT</p>
                      <p className="mt-1 text-gray-600 hover:text-gray-900 cursor-pointer">Forms</p>
                      <p className="mt-1 text-gray-600 hover:text-gray-900 cursor-pointer">Import</p>
                    </div>

                    <div>
                      <p className="text-[10px] font-bold tracking-wider text-gray-400 uppercase">MANAGE</p>
                      <p className="mt-1 rounded bg-[#6701e6]/10 px-2 py-1 font-bold text-[#6701e6]">Proof</p>
                      <p className="mt-1 text-gray-600 hover:text-gray-900 cursor-pointer">Tags</p>
                    </div>

                    <div>
                      <p className="text-[10px] font-bold tracking-wider text-gray-400 uppercase">SHARE</p>
                      <p className="mt-1 text-gray-600 hover:text-gray-900 cursor-pointer">Studio</p>
                      <p className="mt-1 text-gray-600 hover:text-gray-900 cursor-pointer">Thank Yous</p>
                    </div>
                  </div>

                  {/* Main Proof Area */}
                  <div className="col-span-12 sm:col-span-8 p-4 sm:p-5">
                    <div className="flex items-center justify-between">
                      <p className="text-sm sm:text-base font-bold text-gray-900">
                        Your Proof <span className="ml-1 rounded-full bg-gray-100 px-2 py-0.5 text-xs font-semibold text-gray-500">118</span>
                      </p>
                      <Link
                        to="/signup"
                        className="rounded-lg border border-gray-200 px-2.5 py-1 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                      >
                        + Invite customer
                      </Link>
                    </div>

                    {/* Tag filters */}
                    <div className="mt-3 flex flex-wrap items-center gap-1.5 text-xs">
                      <span className="text-gray-500 text-[11px]">Customers praise:</span>
                      <span className="rounded-full border border-gray-200 px-2 py-0.5 text-gray-600 text-[11px]">Ease of use <b>42</b></span>
                      <span className="rounded-full border border-gray-200 px-2 py-0.5 text-gray-600 text-[11px]">Time saved <b>38</b></span>
                      <span className="rounded-full border border-gray-200 px-2 py-0.5 text-gray-600 text-[11px]">Support <b>29</b></span>
                    </div>

                    {/* Natural language search bar */}
                    <div className="mt-3.5 flex items-center gap-2">
                      <div className="min-w-0 flex-1 rounded-lg border border-[#6701e6]/40 px-3 py-1.5 text-xs text-gray-800 flex items-center gap-2 bg-purple-50/20">
                        <Search className="w-3.5 h-3.5 text-gray-400" />
                        <input
                          type="text"
                          value={searchQueryMock}
                          onChange={(e) => setSearchQueryMock(e.target.value)}
                          className="bg-transparent focus:outline-none w-full text-xs text-gray-800"
                        />
                      </div>
                    </div>

                    {/* Matched Case Study Card */}
                    <div className="mt-3 space-y-2">
                      <div className="rounded-xl border border-purple-200 bg-purple-50/40 p-2.5 text-left">
                        <p className="text-xs font-bold text-gray-900">
                          How Hartley Plumbing cut missed jobs to zero in one month
                        </p>
                        <p className="mt-0.5 text-[11px] text-[#6701e6]">
                          ✨ Case study generated with Panda Praise AI · 1 metric
                        </p>
                      </div>

                      {/* Proof row 1 */}
                      <div className="rounded-xl border border-gray-200 p-2.5 bg-white shadow-xs text-left">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-gray-900">Sam Marsh · Marsh & Sons</span>
                          <span className="rounded bg-emerald-50 px-1.5 py-0.5 text-[10px] font-bold text-emerald-600">Approved</span>
                        </div>
                        <div className="text-xs text-amber-500 my-0.5">★★★★★</div>
                        <p className="text-xs text-gray-700">"I was sure the techs would never use it. They picked it up in a day."</p>
                      </div>

                      {/* Proof row 2 */}
                      <div className="rounded-xl border border-gray-200 p-2.5 bg-white shadow-xs text-left">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-gray-900">Dave Hartley · Owner, Hartley Plumbing</span>
                          <span className="rounded bg-emerald-50 px-1.5 py-0.5 text-[10px] font-bold text-emerald-600">Approved</span>
                        </div>
                        <div className="text-xs text-amber-500 my-0.5">★★★★★</div>
                        <p className="text-xs text-gray-700">"Scheduling used to eat my Sundays. Now it runs itself."</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Column B: Text Content */}
            <div className="lg:col-span-5 order-1 lg:order-2 text-left">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 border border-purple-200/70 text-[#6701e6] text-xs font-bold tracking-wide uppercase mb-4">
                <Search className="w-3.5 h-3.5 text-[#6701e6]" />
                <span>02 / Organize & Search</span>
              </div>

              <h2 className="text-3xl sm:text-4xl lg:text-[42px] font-extrabold font-display text-gray-950 tracking-tight leading-[1.15]">
                Every Testimonial, Instantly at Your Fingertips
              </h2>

              <p className="mt-4 text-base sm:text-lg text-gray-600 leading-relaxed">
                Search, filter, and tag every customer review in one unified, searchable vault. Stop losing rave reviews in Slack, email threads, and screenshots.
              </p>

              {/* Checklist */}
              <ul className="mt-6 space-y-3 text-sm text-gray-700 font-medium">
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Search with natural language queries</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Filter by offer, buyer persona, industry, or product tier</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Instant access via Chrome extension & Slack integration</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Generate instant case studies with 1 click</span>
                </li>
              </ul>

              {/* In-Section Testimonial Quote */}
              <figure className="relative border-l-2 border-black py-2 pl-4 text-left mt-8 max-w-lg">
                <blockquote className="text-xs sm:text-sm text-gray-700 leading-relaxed">
                  <p>
                    Within ten minutes of signing up,{' '}
                    <mark className="senja-yellow-mark">
                      I had already upgraded twice
                    </mark>{' '}
                    because I immediately wanted all our client stories organized in Panda Praise.
                  </p>
                </blockquote>
                <figcaption className="mt-2.5 flex items-center gap-2.5">
                  <img
                    src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format&fit=crop&q=80"
                    alt="Melissa Kwan"
                    className="h-8 w-8 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-bold text-gray-900 text-xs">Melissa Kwan</p>
                    <p className="text-[11px] text-gray-500">Founder of eWebinar</p>
                  </div>
                </figcaption>
              </figure>
            </div>

          </div>
        </div>
      </section>

      {/* ── 8. FEATURE 3: "PUBLISH & SHARE" (Full Showcase Transformation Architecture) ── */}
      <section id="share-section" className="border-t border-gray-200/80 bg-white py-20 sm:py-24 text-center">
        <div className="max-w-6xl mx-auto px-6">
          
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200/70 text-blue-700 text-xs font-bold tracking-wide uppercase mb-4">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>03 / Publish Everywhere</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-[44px] font-extrabold font-display text-gray-950 tracking-tight max-w-3xl mx-auto leading-[1.15]">
            One Testimonial, 12 Ways to Share It
          </h2>

          <p className="mt-4 text-base sm:text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Don't let your best reviews collect digital dust. Panda Praise turns every testimonial into widgets, videos, Reels, popups, and case studies.
          </p>

          {/* 6 Checklist Bullets in Balanced Grid */}
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-3 text-left max-w-4xl mx-auto text-xs sm:text-sm text-gray-700 font-medium">
            <div className="flex items-start gap-2">
              <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>Widgets, popups and Walls of Love</span>
            </div>
            <div className="flex items-start gap-2">
              <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>Social videos, Reels & feed graphics</span>
            </div>
            <div className="flex items-start gap-2">
              <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>Case studies that close deals</span>
            </div>
            <div className="flex items-start gap-2">
              <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>Google stars with Rich Snippets</span>
            </div>
            <div className="flex items-start gap-2">
              <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>Share links that drop proof anywhere</span>
            </div>
            <div className="flex items-start gap-2">
              <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>Ad-free video hosting built in</span>
            </div>
          </div>

          {/* Interactive Tabbed Sharing Showcase Card */}
          <div className="mt-12 rounded-3xl border border-gray-200 bg-white p-6 sm:p-10 shadow-lg max-w-5xl mx-auto">
            
            {/* Pill Tab Switcher */}
            <div className="flex justify-center-safe gap-2 overflow-x-auto pb-2">
              {[
                { id: 'widgets', label: 'Widgets' },
                { id: 'videos', label: 'Social Videos' },
                { id: 'walls', label: 'Walls of Love' },
                { id: 'popups', label: 'Popups' },
                { id: 'images', label: 'Testimonial Images' },
                { id: 'hosting', label: 'Video Hosting' },
              ].map((tab) => {
                const isActive = activeShareTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveShareTab(tab.id as any)}
                    className={`shrink-0 whitespace-nowrap rounded-full px-4 sm:px-5 py-2 text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                      isActive
                        ? 'bg-[#6701e6] text-white shadow-md'
                        : 'border border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Dynamic Content Panel */}
            <div className="mt-8">
              {activeShareTab === 'widgets' && (
                <div>
                  <h3 className="text-xl sm:text-2xl font-bold font-display text-gray-950">
                    Showcase Your Proof Anywhere
                  </h3>
                  <p className="mt-2 text-xs sm:text-sm text-gray-600 max-w-xl mx-auto">
                    More attention-grabbing widgets than anywhere else. Install once with copy-paste code, and watch approved testimonials update live.
                  </p>

                  {/* 22 Widget Tags Grid */}
                  <div className="mt-6 flex flex-wrap justify-center gap-2 max-w-4xl mx-auto">
                    {[
                      'Testimonial Image Gallery',
                      'Testimonial Masonry',
                      'Testimonial Marquee',
                      'Testimonial Carousel',
                      'Slab Carousel',
                      'Rating Badge',
                      'Bold Highlights',
                      'Company Logos',
                      'Single Video',
                      'Social Star',
                      'Hero Quotes',
                      'Bricks',
                      'Avatars Pro',
                      'Avatars Grid',
                      'Testimonial Highlights',
                      'Minimalist List',
                      'Compact Testimonials',
                      'Candy Carousel',
                      'Classic Cards',
                      'Quote Grid',
                      'Modern Slider',
                      'Testimonial Bubble List'
                    ].map((w) => {
                      const isSelected = selectedWidgetTag === w;
                      return (
                        <button
                          key={w}
                          type="button"
                          onClick={() => setSelectedWidgetTag(w)}
                          className={`rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
                            isSelected
                              ? 'bg-[#6701e6] text-white shadow-xs'
                              : 'border border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-700'
                          }`}
                        >
                          {w}
                        </button>
                      );
                    })}
                  </div>

                  {/* Live Widget Cards Preview */}
                  <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 text-left max-w-4xl mx-auto">
                    {INITIAL_REVIEWS.slice(0, 3).map((r, i) => (
                      <div key={i} className="p-4 rounded-xl border border-gray-200 bg-white shadow-xs hover:border-purple-200 transition-colors">
                        <div className="flex text-amber-500 text-xs mb-2">★★★★★</div>
                        <p className="text-xs text-gray-800 italic line-clamp-3 mb-3">"{r.content}"</p>
                        <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                          <img src={r.avatarUrl} alt={r.name} className="w-6 h-6 rounded-full object-cover" />
                          <div className="text-[11px] truncate">
                            <span className="font-bold text-gray-900 block">{r.name}</span>
                            <span className="text-gray-400 truncate">{r.company}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeShareTab === 'videos' && (
                <div>
                  <h3 className="text-xl sm:text-2xl font-bold font-display text-gray-950">
                    Share Video Testimonials on Your Social Media
                  </h3>
                  <p className="mt-2 text-xs sm:text-sm text-gray-600 max-w-xl mx-auto">
                    Get more visits to your site with stunning videos and Reels that you can share directly to your feeds.
                  </p>
                  <div className="mt-6 mx-auto max-w-xs aspect-[9/16] rounded-2xl bg-zinc-950 text-white p-5 flex flex-col justify-between shadow-2xl relative">
                    <div className="flex items-center justify-between text-xs text-zinc-400">
                      <span>Panda Praise Studio</span>
                      <span className="text-rose-500 font-bold flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" /> LIVE
                      </span>
                    </div>
                    <div className="text-center my-auto">
                      <div className="w-14 h-14 rounded-full bg-[#6701e6] flex items-center justify-center mx-auto text-white shadow-lg mb-3">
                        <Play className="w-6 h-6 fill-white ml-0.5" />
                      </div>
                      <p className="text-sm font-semibold">"This tool 3x'd our customer conversions in 30 days!"</p>
                    </div>
                    <div className="text-left text-xs text-zinc-300">
                      <p className="font-bold text-white">@founder_growth</p>
                      <p className="text-zinc-400">Auto-captioned with waveform 🎵</p>
                    </div>
                  </div>
                </div>
              )}

              {activeShareTab === 'walls' && (
                <div>
                  <h3 className="text-xl sm:text-2xl font-bold font-display text-gray-950">
                    Link to Walls of Love in Emails, Navigations and Bios
                  </h3>
                  <p className="mt-2 text-xs sm:text-sm text-gray-600 max-w-xl mx-auto">
                    Show off your best testimonials with our beautiful Walls of Love. More customization options, CTAs, and filters.
                  </p>
                  <div className="mt-6 flex flex-wrap justify-center gap-2">
                    {['Whimsical Theme', 'Noire Theme', 'Pastel Theme', 'Hong Kong Theme'].map((th) => (
                      <span key={th} className="rounded-full border border-gray-200 bg-gray-50 px-3.5 py-1.5 text-xs font-medium text-gray-700">
                        {th}
                      </span>
                    ))}
                  </div>
                  <div className="mt-6">
                    <button
                      onClick={() => setIsWallModalOpen(true)}
                      className="px-6 py-2.5 rounded-xl bg-[#6701e6] hover:bg-[#5400bd] text-white text-xs sm:text-sm font-bold shadow-md transition-transform hover:scale-105 cursor-pointer"
                    >
                      Open Wall of Love Preview
                    </button>
                  </div>
                </div>
              )}

              {activeShareTab === 'popups' && (
                <div>
                  <h3 className="text-xl sm:text-2xl font-bold font-display text-gray-950">
                    Add Testimonial Popups to Your Website
                  </h3>
                  <p className="mt-2 text-xs sm:text-sm text-gray-600 max-w-xl mx-auto">
                    Add social proof in seconds and generate FOMO with stylish popups shown to high-intent buyers.
                  </p>
                  <div className="mt-6 max-w-md mx-auto p-4 rounded-2xl bg-white border border-gray-200 shadow-lg text-left flex items-start gap-3">
                    <img
                      src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&auto=format&fit=crop&q=80"
                      alt="Reviewer"
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div>
                      <div className="flex text-amber-500 text-xs mb-1">★★★★★</div>
                      <p className="text-xs text-gray-800">"Panda Praise made our checkout conversion jump 28% in 2 weeks."</p>
                      <p className="text-[11px] text-gray-500 mt-1 font-semibold">David K. · Just now</p>
                    </div>
                  </div>
                </div>
              )}

              {activeShareTab === 'images' && (
                <div>
                  <h3 className="text-xl sm:text-2xl font-bold font-display text-gray-950">
                    Share Image Testimonials on Your Socials
                  </h3>
                  <p className="mt-2 text-xs sm:text-sm text-gray-600 max-w-xl mx-auto">
                    Get more visits to your site with stunning images that you can share on your socials. Drive visits, sales and signups.
                  </p>
                  <div className="mt-6 max-w-md mx-auto p-6 rounded-2xl bg-gradient-to-r from-[#6701e6] to-indigo-600 text-white shadow-xl text-left">
                    <div className="flex text-amber-300 text-xs mb-2">★★★★★</div>
                    <p className="text-sm font-semibold mb-3">"Panda Praise is the single most valuable growth tool we adopted this year."</p>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-white text-[#6701e6] font-bold text-xs flex items-center justify-center">E</div>
                      <div className="text-xs">
                        <span className="font-bold block">Elena Rostova</span>
                        <span className="text-purple-200 text-[11px]">VP Growth @ SaaSify</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeShareTab === 'hosting' && (
                <div>
                  <h3 className="text-xl sm:text-2xl font-bold font-display text-gray-950">
                    Unlimited, Ad-Free Hosting for Your Video Testimonials
                  </h3>
                  <p className="mt-2 text-xs sm:text-sm text-gray-600 max-w-xl mx-auto">
                    Ditch Wistia, YouTube and Vimeo. Add your video testimonials to your website with dedicated, ad-free video hosting.
                  </p>
                  <ul className="mt-6 mx-auto w-fit space-y-2 text-left text-xs sm:text-sm text-gray-700">
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>All your video testimonials in one place</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>Share with a link or embed with widgets</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>100% ad-free, fast CDN video delivery</span>
                    </li>
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Testimonial Quote under Showcase */}
          <figure className="relative border-l-2 border-black py-2 pl-4 text-left mx-auto mt-10 max-w-xl">
            <blockquote className="text-xs sm:text-sm text-gray-700 leading-relaxed">
              <p>
                We have collected tons of testimonials and previously it was a bit fiddly...{' '}
                <mark className="senja-yellow-mark">
                  if we need a quick social media post, want to add proof to an email or use as ads, we can just pick right from Panda Praise
                </mark>
                , love it. They're like our very own social proof emojis now!
              </p>
            </blockquote>
            <figcaption className="mt-2.5 flex items-center gap-2.5">
              <img
                src="/assets/senja/michael-heap.BPuupf8X_67hTa.webp"
                alt="Michael Heap"
                loading="lazy"
                className="h-8 w-8 rounded-full object-cover border border-gray-200"
              />
              <div>
                <p className="font-bold text-gray-900 text-xs">Michael Heap</p>
                <p className="text-[11px] text-gray-500">Chrome Web Store review</p>
              </div>
            </figcaption>
          </figure>
        </div>
      </section>

      {/* ── 9. FEATURE 4: "THANK & DELIGHT" (Two-Column Alternating: Visual LEFT, Text RIGHT) ── */}
      <section className="border-t border-gray-200/80 bg-gray-50/70 py-20 sm:py-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            
            {/* Column A: Visual Demonstration (Delight & Rewards Card) */}
            <div className="lg:col-span-6 order-2 lg:order-1">
              <div className="rounded-3xl border border-gray-200 bg-white p-6 sm:p-8 shadow-xl max-w-md mx-auto text-left relative overflow-hidden">
                <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <span className="p-2 rounded-xl bg-purple-100 text-[#6701e6]">
                      <Gift className="w-5 h-5" />
                    </span>
                    <div>
                      <p className="font-bold text-sm text-gray-900">Thank You Gift Dispatched</p>
                      <p className="text-[11px] text-gray-500">Delivered to client via email & Slack</p>
                    </div>
                  </div>
                  <span className="rounded-full bg-emerald-50 text-emerald-700 px-2 py-0.5 text-xs font-bold">Sent ✨</span>
                </div>

                <div className="mt-4 p-4 rounded-2xl bg-purple-50/60 border border-purple-100">
                  <p className="text-xs text-purple-950 font-medium leading-relaxed">
                    "Hey Nathan! Loved your review about our support speed. Here is a $25 Amazon perk and early access to our V2 dashboard!"
                  </p>
                  <div className="mt-3 flex items-center justify-between text-xs font-bold text-[#6701e6]">
                    <span>Coupon: PRAISE-VIP-25</span>
                    <span className="bg-white px-2 py-0.5 rounded border border-purple-200 text-[10px]">Claimed</span>
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-3 text-xs text-gray-500">
                  <span className="flex h-2 w-2 rounded-full bg-emerald-500" />
                  <span>Client reaction synced to #testimonials in Slack</span>
                </div>
              </div>
            </div>

            {/* Column B: Text Content */}
            <div className="lg:col-span-6 order-1 lg:order-2 text-left">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-pink-50 border border-pink-200/70 text-pink-700 text-xs font-bold tracking-wide uppercase mb-4">
                <Gift className="w-3.5 h-3.5 text-pink-600" />
                <span>04 / Delight & Reward</span>
              </div>

              <h2 className="text-3xl sm:text-4xl lg:text-[42px] font-extrabold font-display text-gray-950 tracking-tight leading-[1.15]">
                Thank Every Customer Like It's Still Day One
              </h2>

              <p className="mt-4 text-base sm:text-lg text-gray-600 leading-relaxed">
                You didn't grow by treating people like numbers. Send personal thank-you videos, gifts, and reward notes at any scale.
              </p>

              {/* Checklist */}
              <ul className="mt-6 space-y-3 text-sm text-gray-700 font-medium">
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Find the customers who deserve an immediate thank you</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Send automated e-gifts, discount codes, and feature unlocks</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Record short personal thank-you videos with 1 click</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Stream customer reactions straight to Slack</span>
                </li>
              </ul>

              {/* Quote Block */}
              <figure className="relative border-l-2 border-black py-2 pl-4 text-left mt-8 max-w-lg">
                <blockquote className="text-xs sm:text-sm text-gray-700 leading-relaxed">
                  <p>
                    <mark className="senja-yellow-mark">Panda Praise is simply awesome</mark>. They work hard providing a wide list of review integrations, and their constant presence with their customers makes all the difference.
                  </p>
                </blockquote>
                <figcaption className="mt-2.5 flex items-center gap-2.5">
                  <img
                    src="/assets/senja/nathan-falceso.BOeFR7x3_24DNsr.webp"
                    alt="Nathan Falceso"
                    loading="lazy"
                    className="h-8 w-8 rounded-full object-cover border border-gray-200"
                  />
                  <div>
                    <p className="font-bold text-gray-900 text-xs">Nathan Falceso</p>
                    <p className="text-[11px] text-gray-500">Verified User</p>
                  </div>
                </figcaption>
              </figure>
            </div>

          </div>
        </div>
      </section>

      {/* ── 10. "Built for you" Personas Section ── */}
      <section className="max-w-5xl mx-auto px-6 py-20 text-center border-t border-gray-200/80">
        <p className="font-caveat text-3xl text-[#6701e6] -rotate-1">
          Built for you
        </p>
        <h2 className="mt-2 font-display text-3xl sm:text-4xl font-extrabold text-gray-950 max-w-3xl mx-auto">
          Whatever You Make, Panda Praise Fits How You Work
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-sm sm:text-base text-gray-600 leading-relaxed">
          Whether you're a creator, run a SaaS, or sell your own kind of niche thing — Panda Praise is the go-to tool for collecting, managing, and showing off your social proof.
        </p>
        
        {/* Senja Rounded-Full Persona Tags Grid */}
        <div className="mt-8 flex flex-wrap justify-center gap-3 max-w-4xl mx-auto">
          {[
            'Creators',
            'Communities',
            'SaaS companies',
            'Agencies',
            'Course creators',
            'Newsletters',
            'Freelancers',
            'Employees',
            'Ecommerce',
            'Sales teams',
            'Real estate agents',
            'Events',
            'Coaches',
          ].map((persona) => (
            <Link
              key={persona}
              to="/signup"
              className="rounded-full border border-gray-200 bg-gray-50 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:border-purple-300 hover:bg-purple-50 hover:text-[#6701e6]"
            >
              {persona}
            </Link>
          ))}
        </div>
      </section>

      {/* ── 11. Frequently Asked Questions Section ── */}
      <section id="faq" className="max-w-4xl mx-auto px-6 py-20 relative z-10 border-t border-gray-200">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <p className="font-caveat text-3xl text-[#6701e6]">Got questions?</p>
          <h2 className="text-3xl sm:text-4xl font-extrabold font-display text-gray-950 tracking-tight mt-1">
            Frequently Asked Questions
          </h2>
          <p className="text-sm sm:text-base text-gray-600 mt-2">
            Everything you need to know about collecting, organizing, and publishing verified proof.
          </p>
        </div>

        <div className="space-y-3">
          {FAQ_ITEMS.map((item, idx) => {
            const isOpen = openFaqIndex === idx;
            return (
              <div
                key={idx}
                className="bg-white rounded-2xl overflow-hidden transition-all shadow-xs border border-gray-200"
              >
                <button
                  onClick={() => toggleFaq(idx)}
                  className="w-full px-6 py-4 text-left flex items-center justify-between gap-4 hover:bg-gray-50/80 transition-colors cursor-pointer"
                  aria-expanded={isOpen}
                >
                  <span className="text-sm sm:text-base font-semibold text-gray-900">
                    {item.q}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-gray-500 shrink-0 transition-transform duration-200 ${
                      isOpen ? 'transform rotate-180 text-[#6701e6]' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-6 pb-4 pt-1 text-xs sm:text-sm text-gray-600 leading-relaxed border-t border-gray-100 bg-gray-50/50">
                    {item.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* ── 12. Closing Hero CTA Block (Senja Signature Purple Block) ── */}
      <section className="relative overflow-hidden bg-[#6701e6] py-20 text-center text-white">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(60rem 26rem at 50% 130%, rgb(145 56 255 / 0.55), transparent 70%), radial-gradient(42rem 18rem at 8% -30%, rgb(73 1 164 / 0.65), transparent 70%)',
          }}
          aria-hidden="true"
        />

        {/* Tone-on-tone motifs */}
        <svg className="pointer-events-none absolute -bottom-28 -right-24 w-[420px] -rotate-6 opacity-[0.14]" viewBox="0 0 120 112" fill="none" stroke="#fff" strokeWidth="4" aria-hidden="true">
          <path d="M60 34 C60 20 48 10 34 10 C16 10 6 24 6 38 C6 66 36 84 60 102 C84 84 114 66 114 38 C114 24 104 10 86 10 C72 10 60 20 60 34 Z" />
        </svg>

        {/* Rotating Circular Stamp */}
        <div className="pointer-events-none absolute right-10 top-1/2 hidden -translate-y-1/2 text-white/80 lg:block">
          <svg className="stamp-spin" width="140" height="140" viewBox="0 0 170 170" fill="none">
            <defs>
              <path id="stamp-circle-closing" d="M85,85 m-62,0 a62,62 0 1,1 124,0 a62,62 0 1,1 -124,0" />
            </defs>
            <circle cx="85" cy="85" r="80" stroke="currentColor" strokeWidth="2" />
            <circle cx="85" cy="85" r="44" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 6" />
            <text fontSize="12" fontWeight="600" letterSpacing="3" fill="currentColor">
              <textPath href="#stamp-circle-closing">✦ LOVED BY 20,000+ CUSTOMERS </textPath>
            </text>
          </svg>
        </div>

        <div className="relative mx-auto max-w-3xl px-6">
          <p className="font-caveat text-3xl text-purple-200">Start in 2 minutes</p>
          <h2 className="mt-2 font-display text-3xl sm:text-5xl font-extrabold tracking-tight max-w-3xl mx-auto">
            Ready to boost your business with social proof?
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm sm:text-base text-white/90 leading-relaxed">
            Set up in minutes and discover how easy it is to collect, manage, and share the social proof that drives your business forward.
          </p>

          <ul className="mx-auto mt-6 inline-flex flex-col gap-2 text-left text-xs sm:text-sm text-white/90">
            <li className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-300" />
              <span>Collect text & video testimonials on autopilot</span>
            </li>
            <li className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-300" />
              <span>Import testimonials from over 30 platforms</span>
            </li>
            <li className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-300" />
              <span>Share proof on your website, sales pages, pitches, emails, & socials</span>
            </li>
          </ul>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/signup"
              onClick={() => {
                analytics.ctaClicked('closing_cta', '/signup');
                analytics.signupStarted('closing_cta');
              }}
              className="px-8 py-4 rounded-xl bg-white text-gray-950 font-bold text-base shadow-xl hover:bg-gray-100 hover:scale-105 transition-all inline-flex items-center gap-2"
            >
              <span>Start for free today</span>
              <ArrowRight className="w-5 h-5 text-gray-950" aria-hidden="true" />
            </Link>
            <button
              onClick={handleLaunchDemo}
              className="px-6 py-4 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-sm border border-white/20 transition-colors flex items-center gap-2 cursor-pointer"
            >
              <Play className="w-4 h-4 text-white" />
              <span>Try Interactive Demo</span>
            </button>
          </div>
        </div>
      </section>

      {/* ── 13. Comprehensive SaaS Footer (Senja Exact Multi-Column Structure) ── */}
      <footer className="bg-gray-50 border-t border-gray-200">
        {/* Wavy Senja divider SVG line */}
        <div className="flex justify-center pt-10 text-[#6701e6]">
          <svg width="220" height="22" viewBox="0 0 220 22" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" aria-hidden="true">
            <path d="M4 14 Q17 2 30 14 T56 14 T82 14 T108 14 T134 14 T160 14 T186 14 T212 14" />
          </svg>
        </div>

        <div className="mx-auto max-w-6xl px-6 pt-10 pb-16">
          <div className="grid gap-12 lg:grid-cols-[16rem_1fr] lg:gap-16">
            
            {/* Column 0: Brand Info */}
            <div className="text-left">
              <Link to="/" className="inline-flex items-center">
                <span className="font-display font-extrabold text-2xl tracking-tight text-gray-950">
                  Panda <span className="text-[#6701e6]">Praise</span>
                </span>
              </Link>
              <p className="mt-4 max-w-[14rem] text-sm leading-relaxed text-gray-500">
                Collect, manage and share testimonials in minutes.
              </p>
            </div>

            {/* 4 Multi-Columns */}
            <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4 text-left">
              
              {/* Product */}
              <div>
                <h3 className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">Product</h3>
                <ul className="mt-4 space-y-2.5 text-sm text-gray-600">
                  <li><button onClick={() => scrollToSection('collect-section')} className="hover:text-gray-900 transition-colors text-left cursor-pointer">Collect Testimonials</button></li>
                  <li><button onClick={() => scrollToSection('find-section')} className="hover:text-gray-900 transition-colors text-left cursor-pointer">Import Testimonials</button></li>
                  <li><Link to="/c/feedback" className="hover:text-gray-900 transition-colors">Video Testimonials</Link></li>
                  <li><button onClick={() => scrollToSection('share-section')} className="hover:text-gray-900 transition-colors text-left cursor-pointer">Testimonial Widgets</button></li>
                  <li><button onClick={() => setIsWallModalOpen(true)} className="hover:text-gray-900 transition-colors text-left cursor-pointer">Wall of Love</button></li>
                  <li><Link to="/signup" className="hover:text-gray-900 transition-colors">Case Study Generator</Link></li>
                  <li><Link to="/signup" className="hover:text-gray-900 transition-colors">Thank Yous</Link></li>
                  <li><Link to="/signup" className="hover:text-gray-900 transition-colors">Free Migration</Link></li>
                </ul>
              </div>

              {/* Resources */}
              <div>
                <h3 className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">Resources</h3>
                <ul className="mt-4 space-y-2.5 text-sm text-gray-600">
                  <li><Link to="/signup" className="hover:text-gray-900 transition-colors">Blog</Link></li>
                  <li><Link to="/signup" className="hover:text-gray-900 transition-colors">Free Tools</Link></li>
                  <li><Link to="/signup" className="hover:text-gray-900 transition-colors">Testimonial Examples</Link></li>
                  <li><Link to="/signup" className="hover:text-gray-900 transition-colors">Testimonial Questions</Link></li>
                  <li><Link to="/signup" className="hover:text-gray-900 transition-colors">Testimonial Templates</Link></li>
                  <li><Link to="/signup" className="hover:text-gray-900 transition-colors">Use Cases</Link></li>
                  <li><button onClick={() => scrollToSection('faq')} className="hover:text-gray-900 transition-colors text-left cursor-pointer">Help Center</button></li>
                </ul>
              </div>

              {/* Compare */}
              <div>
                <h3 className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">Compare</h3>
                <ul className="mt-4 space-y-2.5 text-sm text-gray-600">
                  <li><button onClick={() => scrollToSection('comparison-section')} className="hover:text-gray-900 transition-colors text-left cursor-pointer">All alternatives</button></li>
                  <li><Link to="/signup" className="hover:text-gray-900 transition-colors">Boast.io alternative</Link></li>
                  <li><Link to="/signup" className="hover:text-gray-900 transition-colors">Bonjoro alternative</Link></li>
                  <li><Link to="/signup" className="hover:text-gray-900 transition-colors">Elfsight alternative</Link></li>
                  <li><Link to="/signup" className="hover:text-gray-900 transition-colors">Famewall alternative</Link></li>
                  <li><Link to="/signup" className="hover:text-gray-900 transition-colors">Testimonial.to alternative</Link></li>
                  <li><Link to="/signup" className="hover:text-gray-900 transition-colors">Trustmary alternative</Link></li>
                  <li><Link to="/signup" className="hover:text-gray-900 transition-colors">VideoAsk alternative</Link></li>
                </ul>
              </div>

              {/* Company */}
              <div>
                <h3 className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">Company</h3>
                <ul className="mt-4 space-y-2.5 text-sm text-gray-600">
                  <li><Link to="/" className="hover:text-gray-900 transition-colors">About us</Link></li>
                  <li><Link to="/pricing" className="hover:text-gray-900 transition-colors">Pricing</Link></li>
                  <li><button onClick={() => scrollToSection('comparison-section')} className="hover:text-gray-900 transition-colors text-left cursor-pointer">Customer Stories</button></li>
                  <li><button onClick={() => setIsWallModalOpen(true)} className="hover:text-gray-900 transition-colors text-left cursor-pointer">Our Wall of Love 💖</button></li>
                  <li><Link to="/signup" className="hover:text-gray-900 transition-colors">Affiliate program</Link></li>
                  <li><Link to="/c/feedback" className="hover:text-gray-900 transition-colors">Leave a Review</Link></li>
                  <li><Link to="/login" className="hover:text-gray-900 transition-colors">Login</Link></li>
                  <li><Link to="/signup" className="hover:text-gray-900 transition-colors">What's new ✨</Link></li>
                </ul>
              </div>

            </div>
          </div>

          {/* Personas Cross-Linking Row */}
          <div className="mt-12 border-t border-gray-200/80 pt-6 text-left">
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-2 text-[13px]">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">Panda Praise for</span>
              {['Agencies', 'Coaches', 'Communities', 'Course Creators', 'Creators', 'Ecommerce', 'Employees', 'Events', 'Freelancers', 'Newsletters', 'Real estate agents', 'SaaS', 'Sales teams'].map((p, idx, arr) => (
                <React.Fragment key={p}>
                  <Link to="/signup" className="text-gray-500 transition-colors hover:text-gray-900">
                    {p}
                  </Link>
                  {idx < arr.length - 1 && <span className="select-none text-gray-300">·</span>}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Copyright and Legal Row */}
          <div className="mt-6 border-t border-gray-200/80 pt-6 flex flex-wrap items-center justify-between gap-4 text-xs text-gray-500 text-left">
            <span>© 2026 Panda Praise Ltd. All rights reserved.</span>
            <div className="flex items-center gap-5">
              <Link to="/terms" className="hover:text-gray-900 transition-colors">Terms of Service</Link>
              <Link to="/privacy-policy" className="hover:text-gray-900 transition-colors">Privacy Policy</Link>
              <Link to="/pricing" className="hover:text-gray-900 transition-colors">Discount code policy</Link>
            </div>
          </div>
        </div>
      </footer>

      {/* ── 14. Floating Elements (Controlled to prevent hero and card obstruction) ── */}
      {showHeartTab && (
        <FloatingReviewDrawer
          reviews={INITIAL_REVIEWS}
          variant="wall-heart"
          defaultOpen={isWallModalOpen}
        />
      )}

      {showSocialToast && (
        <SocialProofToast
          reviews={INITIAL_REVIEWS}
          position="bottom-left"
          onOpenWallOfLove={() => setIsWallModalOpen(true)}
        />
      )}
    </div>
  );
};
