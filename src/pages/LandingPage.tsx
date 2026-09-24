import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ArrowRight, 
  ChevronDown, 
  Check, 
  X as XIcon, 
  Play, 
  Search, 
  Video, 
  MessageSquare
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
    a: 'No. The website widget is installed once. After installation, newly approved testimonials appear automatically.',
  },
  {
    q: 'Do my customers need to create an account?',
    a: 'No. Customers can submit testimonials through your public collection link without creating an account.',
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

const CLIENT_LOGOS = [
  { name: 'om', node: <span className="text-xl font-bold tracking-tight text-gray-500 font-sans">om</span> },
  { name: 'pickupmusic', node: <span className="text-base font-semibold tracking-wide text-gray-500 font-mono">pickupmusic</span> },
  { name: 'Marketing Examined', node: <span className="text-base font-bold text-gray-500 flex items-center gap-1.5"><span className="text-amber-500">★</span> Marketing Examined</span> },
  { name: 'unplugged.', node: <span className="text-base font-serif italic text-gray-500">unplugged.</span> },
  { name: 'Easlo', node: <span className="text-base font-bold text-gray-600 flex items-center gap-1.5"><span>👓</span> Easlo</span> },
  { name: 'Breakcold', node: <span className="text-base font-bold text-gray-600 flex items-center gap-1.5"><span className="bg-gray-800 text-white text-[11px] px-1 py-0.5 rounded font-bold">Br</span> Breakcold</span> },
  { name: 'immutable', node: <span className="text-base font-bold tracking-tight text-gray-500">immutable</span> },
  { name: 'Substack', node: <span className="text-base font-semibold text-gray-500 flex items-center gap-1.5"><span className="w-3 h-3 bg-[#FF6719] rounded-xs inline-block" /> Substack</span> },
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
  const [activeShareTab, setActiveShareTab] = useState<'videos' | 'widgets' | 'walls' | 'popups' | 'images' | 'hosting'>('widgets');
  const [searchQueryMock, setSearchQueryMock] = useState('do the techs actually use it');
  const [isWallModalOpen, setIsWallModalOpen] = useState(false);

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
      
      {/* ── 1. Top Announcement Quiz Bar (Senja Exact) ── */}
      <div className="bg-[#6701e6] hover:bg-[#5400bd] transition-colors text-white py-2 px-4 text-center relative z-50 flex items-center justify-center gap-2 shadow-sm text-xs sm:text-sm font-medium cursor-pointer">
        <Link to="/signup" className="flex items-center gap-1.5 hover:underline">
          <span className="bg-white/20 text-white text-[11px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider">
            Free quiz
          </span>
          <span>What's your Social Proof Score?</span>
          <span className="hidden sm:inline text-white/80 ml-1">| Take the quiz →</span>
        </Link>
      </div>

      {/* Ambient background glow — Senja signature purple radial wash */}
      <div className="ambient-glow-light" />

      {/* ── 2. Header / Navigation ── */}
      <header className="sticky top-0 z-40 w-full bg-white/90 border-b border-gray-200 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Logo strictly clean text "Panda Praise" — NO panda icon/logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <span className="font-display font-extrabold text-2xl tracking-tight text-gray-950 group-hover:text-purple-950 transition-colors">
              Panda <span className="text-[#6701e6]">Praise</span>
            </span>
          </Link>

          {/* Nav Links */}
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-gray-600">
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
              <Link
                to="/dashboard"
                className="px-4 py-2 rounded-xl bg-[#6701e6] hover:bg-[#5400bd] text-white text-xs sm:text-sm font-semibold shadow-md flex items-center gap-1.5 transition-all hover:scale-[1.02]"
              >
                <span>Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
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
                  Sign up for free
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ── 3. Hero Section (Screenshot 1 Exact) ── */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 sm:pt-20 pb-16 text-center relative z-10">
        
        {/* Floating purple 4-point sparkle doodle on left */}
        <div className="absolute left-2 sm:-left-12 top-16 hidden sm:block text-[#6701e6] opacity-80 animate-pulse">
          <svg width="34" height="34" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0 L14.6 9.4 L24 12 L14.6 14.6 L12 24 L9.4 14.6 L0 12 L9.4 9.4 Z" />
          </svg>
        </div>

        {/* Floating 5 purple stars doodle on right */}
        <div className="absolute right-2 sm:-right-8 top-28 hidden sm:block text-[#6701e6] opacity-80">
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4].map((s) => (
              <span key={s} className="text-base text-[#6701e6]">★</span>
            ))}
            <span className="text-base text-[#6701e6]">☆</span>
          </div>
        </div>

        {/* Giant Quote Headline with Purple Highlight Box */}
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold font-display text-gray-950 tracking-tight leading-snug sm:leading-tight lg:leading-[1.25] max-w-4xl mx-auto">
          “I've already seen a{' '}
          <span className="senja-purple-mark my-1 sm:my-1.5">
            tangible impact
          </span>{' '}
          <span className="senja-purple-mark my-1 sm:my-1.5">
            on revenue and conversion
          </span>{' '}
          by sharing more social proof.”
        </h1>

        {/* Attribution: Jay Clouse */}
        <div className="mt-6 flex items-center justify-center gap-3">
          <img
            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=160&auto=format&fit=crop&q=80"
            alt="Jay Clouse"
            className="w-10 h-10 rounded-full object-cover ring-2 ring-purple-200"
          />
          <div className="text-left leading-tight">
            <div className="text-sm font-bold text-gray-900">Jay Clouse</div>
            <div className="text-xs text-gray-500">Founder, Creator Science</div>
          </div>
        </div>

        {/* Subheadline with dotted underline */}
        <p className="mt-8 text-base sm:text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
          <span className="senja-dotted font-medium text-gray-900">Meet Panda Praise</span>. The easiest way to gather customer testimonials and case studies, then share them everywhere to increase trust and sales.
        </p>

        {/* 3 Green Checkmark Bullets */}
        <div className="mt-6 flex flex-col sm:inline-flex text-left space-y-2.5 text-xs sm:text-sm text-gray-700 max-w-xl mx-auto">
          <div className="flex items-start gap-2.5">
            <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>Collect text & video testimonials on autopilot, or import from 30+ platforms</span>
          </div>
          <div className="flex items-start gap-2.5">
            <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>Find the perfect one in seconds — from Slack or any browser tab</span>
          </div>
          <div className="flex items-start gap-2.5">
            <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>Turn it into a widget, video, image, popup, Wall of Love, or case study</span>
          </div>
        </div>

        {/* Giant Glowing CTA Button */}
        <div className="mt-8 flex justify-center">
          <div className="senja-hero-cta">
            <div className="senja-cta-ring">
              <Link
                to="/signup"
                onClick={() => {
                  analytics.ctaClicked('hero_primary', '/signup');
                  analytics.signupStarted('hero_primary');
                }}
                className="senja-btn-primary px-8 py-3.5 sm:py-4 text-lg sm:text-xl shadow-xl hover:scale-105 transition-all"
              >
                <span>Start for free today</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Avatar Stack + "loved by 20,000+ customers" */}
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-2.5">
          <div className="flex items-center -space-x-2">
            {[
              'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&auto=format&fit=crop&q=80',
              'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&auto=format&fit=crop&q=80',
              'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=80&auto=format&fit=crop&q=80',
              'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&auto=format&fit=crop&q=80',
              'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=80&auto=format&fit=crop&q=80',
            ].map((img, i) => (
              <img
                key={i}
                src={img}
                alt="customer"
                className="w-7 h-7 rounded-full border-2 border-white object-cover shadow-xs"
              />
            ))}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-gray-700">
            <span className="text-amber-500 font-bold">★★★★★</span>
            <span className="font-medium text-gray-600">loved by 20,000+ customers</span>
          </div>
        </div>
      </section>

      {/* ── 4. Client Logo Moving Marquee (Senja Exact Parity) ── */}
      <section className="w-full overflow-hidden relative py-8 sm:py-10 border-y border-gray-200/80 bg-white/50 my-6 sm:my-8">
        {/* Left Fade Gradient Mask */}
        <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-24 sm:w-44 bg-gradient-to-r from-[#FAF9F6] via-[#FAF9F6]/90 to-transparent z-10" />

        {/* Right Fade Gradient Mask */}
        <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-24 sm:w-44 bg-gradient-to-l from-[#FAF9F6] via-[#FAF9F6]/90 to-transparent z-10" />

        {/* Infinite Moving Marquee Track */}
        <div className="marquee-track flex items-center gap-12 sm:gap-16 whitespace-nowrap">
          {/* First loop */}
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

      {/* ── 5. Before / After Comparison Meme Cards (Screenshot 2 Exact) ── */}
      <section id="comparison-section" className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          
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
                  <span>Second-guessing yourself</span>
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

      {/* ── 6. "Collect" Section (Screenshot 3 Exact) ── */}
      <section id="collect-section" className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center relative">
        
        {/* Floating speech bubble doodle on left */}
        <div className="absolute left-4 sm:left-12 top-8 hidden sm:block text-[#6701e6] opacity-80">
          <MessageSquare className="w-8 h-8" />
        </div>

        {/* Cursive kicker */}
        <p className="font-caveat text-3xl text-[#6701e6] -rotate-2">
          Collect
        </p>

        <h2 className="mt-2 text-3xl sm:text-4xl lg:text-5xl font-extrabold font-display text-gray-950 tracking-tight">
          Create a simple collection form in 30 seconds
        </h2>

        <p className="mt-4 text-sm sm:text-base text-gray-600 max-w-2xl mx-auto leading-relaxed">
          Create your form, customize it and add your personalized intro video. With Panda Praise you'll collect twice as many testimonials.
        </p>

        {/* 6 Two-Column Green Checkmarks */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-2 text-left max-w-2xl mx-auto text-xs sm:text-sm text-gray-700">
          <div className="flex items-start gap-2">
            <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>Automate <span className="senja-dotted">video and text collection</span></span>
          </div>
          <div className="flex items-start gap-2">
            <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>Share or embed your form anywhere</span>
          </div>
          <div className="flex items-start gap-2">
            <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>Offer rewards to collect even more</span>
          </div>
          <div className="flex items-start gap-2">
            <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>Import from 30+ platforms or CSV</span>
          </div>
          <div className="flex items-start gap-2">
            <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>Trigger 24/7 testimonial invites</span>
          </div>
          <div className="flex items-start gap-2">
            <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>Automate with Zapier, API & webhooks</span>
          </div>
        </div>

        {/* Embedded Interactive Collection Form Mockup (Orange/Amber Container) */}
        <div className="mt-10 rounded-3xl bg-gradient-to-br from-amber-400 to-orange-500 p-6 sm:p-12 shadow-xl max-w-3xl mx-auto text-left">
          <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-2xl max-w-lg mx-auto">
            <div className="flex items-center gap-3 mb-4">
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
                alt="Creator"
                className="w-11 h-11 rounded-full object-cover ring-2 ring-amber-200"
              />
              <div>
                <h4 className="font-bold text-gray-900 text-sm sm:text-base">
                  Share a testimonial for my course 🫶
                </h4>
                <p className="text-xs text-gray-500">Takes less than 60 seconds</p>
              </div>
            </div>

            {/* Mock video container */}
            <div className="rounded-xl bg-gray-900 text-white p-6 mb-4 flex flex-col items-center justify-center text-center aspect-video relative overflow-hidden group">
              <div className="w-12 h-12 rounded-full bg-[#6701e6] flex items-center justify-center text-white shadow-lg mb-2 group-hover:scale-110 transition-transform">
                <Video className="w-5 h-5" />
              </div>
              <p className="text-xs font-semibold">Record a video testimonial</p>
              <p className="text-[11px] text-gray-400 mt-1">or submit a written review below</p>
            </div>

            {/* Prompt helpers */}
            <div className="flex flex-wrap gap-1.5 mb-4">
              <span className="text-[11px] bg-gray-100 text-gray-600 px-2 py-1 rounded-full">✨ What was your biggest win?</span>
              <span className="text-[11px] bg-gray-100 text-gray-600 px-2 py-1 rounded-full">🚀 Would you recommend us?</span>
            </div>

            <Link
              to="/c/feedback"
              className="w-full py-3 rounded-xl bg-[#6701e6] hover:bg-[#5400bd] text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-md transition-all"
            >
              <span>Test Live Collector Form</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* CTA Button */}
        <div className="mt-8 flex justify-center">
          <Link
            to="/signup"
            className="px-8 py-3.5 rounded-xl bg-[#6701e6] hover:bg-[#5400bd] text-white font-bold text-base shadow-md transition-all hover:scale-105"
          >
            Sign up for free
          </Link>
        </div>

        {/* Quote Block with thick black left border */}
        <figure className="relative border-l-2 border-black py-2 pl-5 text-left mx-auto mt-10 max-w-xl">
          <blockquote className="text-sm sm:text-base text-gray-700 leading-relaxed">
            <p>
              Panda Praise made it so easy and quick to collect testimonials.{' '}
              <mark className="senja-yellow-mark">
                Took me less than 5 minutes to start collecting
              </mark>{' '}
              them, and adding them to my website was even quicker! Thanks for this awesome tool.
            </p>
          </blockquote>
          <figcaption className="mt-4 flex items-center gap-3">
            <img
              src="/assets/senja/jamie-northrup.C6GwZu-2_s1skM.webp"
              alt="Jamie Northrup"
              loading="lazy"
              className="h-10 w-10 rounded-full object-cover shadow-xs border border-gray-200"
            />
            <div>
              <p className="font-semibold text-gray-900 text-sm">Jamie Northrup</p>
              <p className="text-xs text-gray-500">Minimalist Hustler</p>
            </div>
          </figcaption>
        </figure>
      </section>

      {/* ── 7. "Find" Section (Screenshot 4 Exact) ── */}
      <section id="find-section" className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center relative border-t border-gray-200">
        
        {/* Floating 5 stars doodle on top right */}
        <div className="absolute right-4 sm:right-12 top-10 hidden sm:block text-[#6701e6] opacity-80">
          <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4].map((s) => (
              <span key={s} className="text-lg text-[#6701e6]">★</span>
            ))}
            <span className="text-lg text-[#6701e6]">☆</span>
          </div>
        </div>

        {/* Cursive kicker */}
        <p className="font-caveat text-3xl text-[#6701e6] rotate-1">
          Find
        </p>

        <h2 className="mt-2 text-3xl sm:text-4xl lg:text-5xl font-extrabold font-display text-gray-950 tracking-tight">
          Where the f*ck is that screenshot?
        </h2>

        <p className="mt-4 text-sm sm:text-base text-gray-600 max-w-2xl mx-auto leading-relaxed">
          The perfect testimonial for every pitch, page and post. With Panda Praise you'll have one place for all your proof, ready for you and your team to share.
        </p>

        {/* Checklist */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-2 text-left max-w-2xl mx-auto text-xs sm:text-sm text-gray-700">
          <div className="flex items-start gap-2">
            <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>Search with natural language</span>
          </div>
          <div className="flex items-start gap-2">
            <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>Filter by offer, buyer, industry, product, plan</span>
          </div>
          <div className="flex items-start gap-2">
            <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>Share everywhere from the Chrome Extension</span>
          </div>
          <div className="flex items-start gap-2">
            <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>Ask the Slack bot for recommendations</span>
          </div>
          <div className="flex items-start gap-2">
            <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>Always-on access with the MCP</span>
          </div>
        </div>

        {/* Rich Browser Mockup (app.pandapraise.com/proof) */}
        <div className="mt-10 rounded-2xl border border-gray-200 bg-white shadow-xl overflow-hidden text-left max-w-4xl mx-auto">
          {/* Browser Bar */}
          <div className="flex items-center gap-1.5 border-b border-gray-200 bg-gray-50 px-4 py-3">
            <span className="h-2.5 w-2.5 rounded-full bg-rose-400"></span>
            <span className="h-2.5 w-2.5 rounded-full bg-amber-400"></span>
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400"></span>
            <span className="ml-3 rounded bg-white px-2 py-0.5 text-xs text-gray-500 font-mono border border-gray-200">
              app.pandapraise.com/proof
            </span>
          </div>

          <div className="grid grid-cols-12">
            {/* Sidebar */}
            <div className="col-span-12 sm:col-span-3 border-b sm:border-b-0 sm:border-r border-gray-100 p-4 space-y-4 text-xs">
              <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#6701e6]/10 text-xs font-bold text-[#6701e6]">
                  E
                </span>
                <div className="min-w-0">
                  <p className="truncate font-semibold text-gray-800">Erin Doyle</p>
                  <p className="text-[11px] text-gray-400">Admin</p>
                </div>
              </div>

              <div>
                <p className="text-[11px] font-bold tracking-wide text-gray-400">COLLECT</p>
                <p className="mt-1 text-gray-600 hover:text-gray-900 cursor-pointer">Forms</p>
                <p className="mt-1 text-gray-600 hover:text-gray-900 cursor-pointer">Import</p>
              </div>

              <div>
                <p className="text-[11px] font-bold tracking-wide text-gray-400">MANAGE</p>
                <p className="mt-1 rounded bg-[#6701e6]/10 px-2 py-1 font-bold text-[#6701e6]">Proof</p>
                <p className="mt-1 text-gray-600 hover:text-gray-900 cursor-pointer">Tags</p>
              </div>

              <div>
                <p className="text-[11px] font-bold tracking-wide text-gray-400">SHARE</p>
                <p className="mt-1 text-gray-600 hover:text-gray-900 cursor-pointer">Studio</p>
                <p className="mt-1 text-gray-600 hover:text-gray-900 cursor-pointer">Thank Yous</p>
              </div>
            </div>

            {/* Main Proof Area */}
            <div className="col-span-12 sm:col-span-6 p-5">
              <div className="flex items-center justify-between">
                <p className="text-base font-bold text-gray-900">
                  Your Proof <span className="ml-1 rounded-full bg-gray-100 px-2 py-0.5 text-xs font-semibold text-gray-500">118</span>
                </p>
                <Link
                  to="/signup"
                  className="rounded-lg border border-gray-200 px-2.5 py-1 text-[11px] font-semibold text-gray-700 hover:bg-gray-50"
                >
                  + Invite a customer
                </Link>
              </div>

              {/* Tag filters */}
              <div className="mt-3 flex flex-wrap items-center gap-1.5 text-[11px]">
                <span className="text-gray-400">Your customers talk about:</span>
                <span className="rounded-full border border-gray-200 px-2 py-0.5 text-gray-600">Ease of scheduling <b>42</b></span>
                <span className="rounded-full border border-gray-200 px-2 py-0.5 text-gray-600">Time saved <b>38</b></span>
                <span className="rounded-full border border-gray-200 px-2 py-0.5 text-gray-600">Customer support <b>29</b></span>
                <span className="rounded-full border border-gray-200 px-2 py-0.5 text-gray-600">Onboarding <b>21</b></span>
              </div>

              {/* Natural language search bar */}
              <div className="mt-4 flex items-center gap-2">
                <div className="min-w-0 flex-1 rounded-lg border border-[#6701e6]/40 px-3 py-1.5 text-xs text-gray-800 flex items-center gap-2 bg-purple-50/20">
                  <Search className="w-3.5 h-3.5 text-gray-400" />
                  <input
                    type="text"
                    value={searchQueryMock}
                    onChange={(e) => setSearchQueryMock(e.target.value)}
                    className="bg-transparent focus:outline-none w-full text-xs text-gray-800"
                  />
                </div>
                <span className="hidden lg:block rounded-lg border border-gray-200 px-2 py-1.5 text-[11px] text-gray-600">All ⌄</span>
                <span className="hidden lg:block rounded-lg border border-gray-200 px-2 py-1.5 text-[11px] text-gray-600">Tags ⌄</span>
              </div>

              {/* Matched Case Study Card */}
              <div className="mt-4 space-y-2.5">
                <div className="rounded-xl border border-purple-200 bg-purple-50/30 p-3">
                  <p className="text-xs font-bold text-gray-900">
                    How Hartley Plumbing cut missed jobs to zero in one month
                  </p>
                  <p className="mt-1 text-[11px] text-[#6701e6]">
                    ✨ Case study generated with Panda Praise AI · 1 metric
                  </p>
                </div>

                {/* Proof row 1 */}
                <div className="rounded-xl border border-gray-200 p-3 bg-white shadow-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-gray-900">Sam Marsh</span>
                      <span className="text-[11px] text-gray-400">· Marsh & Sons Electrical</span>
                    </div>
                    <span className="rounded bg-emerald-50 px-1.5 py-0.5 text-[10px] font-bold text-emerald-600">
                      Approved
                    </span>
                  </div>
                  <div className="text-[11px] text-amber-500 my-0.5">★★★★★</div>
                  <p className="text-xs text-gray-700">"I was sure the techs would never use it. They picked it up in a day."</p>
                </div>

                {/* Proof row 2 */}
                <div className="rounded-xl border border-gray-200 p-3 bg-white shadow-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-gray-900">Dave Hartley</span>
                      <span className="text-[11px] text-gray-400">· Owner, Hartley Plumbing</span>
                    </div>
                    <span className="rounded bg-emerald-50 px-1.5 py-0.5 text-[10px] font-bold text-emerald-600">
                      Approved
                    </span>
                  </div>
                  <div className="text-[11px] text-amber-500 my-0.5">★★★★★</div>
                  <p className="text-xs text-gray-700">"Scheduling used to eat my Sundays. Now it runs itself and the lads just check their phones."</p>
                </div>
              </div>
            </div>

            {/* Right Search & Filter Panel */}
            <div className="hidden sm:block sm:col-span-3 border-l border-gray-100 p-4 text-xs">
              <p className="font-bold text-gray-800 mb-3">Search and Filter</p>
              <div className="space-y-2 text-[11px] text-gray-500">
                <p className="flex items-center justify-between border-b border-gray-100 pb-1.5">Status <span>⌄</span></p>
                <p className="flex items-center justify-between border-b border-gray-100 pb-1.5">Source <span>⌄</span></p>
                <p className="flex items-center justify-between border-b border-gray-100 pb-1.5">Rating <span>⌄</span></p>
                <p className="flex items-center justify-between border-b border-gray-100 pb-1.5">Tags <span>⌄</span></p>
                <p className="flex items-center justify-between">Type <span>⌄</span></p>
              </div>
            </div>
          </div>
        </div>

        {/* Quote Block with thick black left border */}
        <figure className="relative border-l-2 border-black py-2 pl-5 text-left mx-auto mt-10 max-w-xl">
          <blockquote className="text-sm sm:text-base text-gray-700 leading-relaxed">
            <p>
              Within ten minutes of signing up,{' '}
              <mark className="senja-yellow-mark">
                I had already upgraded twice
              </mark>{' '}
              because I immediately wanted to give up the old mess and have all our client stories in Panda Praise.
            </p>
          </blockquote>
          <figcaption className="mt-4 flex items-center gap-3">
            <img
              src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format&fit=crop&q=80"
              alt="Melissa Kwan"
              className="h-10 w-10 rounded-full object-cover"
            />
            <div>
              <p className="font-semibold text-gray-900 text-sm">Melissa Kwan</p>
              <p className="text-xs text-gray-500">Founder of eWebinar</p>
            </div>
          </figcaption>
        </figure>
      </section>

      {/* ── 8. "Share Everywhere" & Studio Section (Screenshot 5 Exact) ── */}
      <section id="share-section" className="bg-gray-50 py-16 sm:py-20 border-t border-gray-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          
          {/* Cursive kicker */}
          <p className="font-caveat text-3xl text-[#6701e6] -rotate-1">
            Share everywhere
          </p>

          <h2 className="mt-2 text-3xl sm:text-4xl lg:text-5xl font-extrabold font-display text-gray-950 tracking-tight">
            One testimonial, 12 ways to share it
          </h2>

          <p className="mt-4 text-sm sm:text-base text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Don't let your best proof collect digital dust. Panda Praise turns every testimonial into widgets, videos, Reels, images, popups and case studies. Proof at every step of your funnel.
          </p>

          {/* Checklist */}
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-2 text-left max-w-2xl mx-auto text-xs sm:text-sm text-gray-700">
            <div className="flex items-start gap-2">
              <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>Widgets, popups and Walls of Love</span>
            </div>
            <div className="flex items-start gap-2">
              <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>Social videos, Reels and images for your feeds</span>
            </div>
            <div className="flex items-start gap-2">
              <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>Case studies that close deals for you</span>
            </div>
            <div className="flex items-start gap-2">
              <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>Get stars in Google with Rich Snippets</span>
            </div>
            <div className="flex items-start gap-2">
              <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>Share links that drop proof anywhere</span>
            </div>
            <div className="flex items-start gap-2">
              <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>Unlimited ad-free video hosting built in</span>
            </div>
          </div>

          {/* Interactive Tabbed Sharing Showcase Card */}
          <div className="mt-10 rounded-2xl border border-gray-200 bg-white p-6 sm:p-8 shadow-sm">
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
                    className={`shrink-0 whitespace-nowrap rounded-full px-4 py-2 text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                      isActive
                        ? 'bg-[#6701e6] text-white shadow-md'
                        : 'border border-gray-200 bg-white text-gray-600 hover:bg-gray-100'
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
                  <h3 className="text-xl sm:text-2xl font-bold font-display text-gray-900">
                    Add testimonial widgets to your website
                  </h3>
                  <p className="mt-2 text-xs sm:text-sm text-gray-600 max-w-xl mx-auto">
                    More attention-grabbing widgets than anywhere else. Install once, updates automatically.
                  </p>

                  {/* Widget tags list */}
                  <div className="mt-6 flex flex-wrap justify-center gap-2 max-w-3xl mx-auto">
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
                      'Avatars Grid',
                      'Candy Carousel',
                    ].map((w) => (
                      <span key={w} className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs font-medium text-gray-700">
                        {w}
                      </span>
                    ))}
                  </div>

                  {/* Live Widget Cards Preview */}
                  <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
                    {INITIAL_REVIEWS.slice(0, 3).map((r, i) => (
                      <div key={i} className="p-4 rounded-xl border border-gray-200 bg-white shadow-xs">
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
                  <h3 className="text-xl sm:text-2xl font-bold font-display text-gray-900">
                    Share video testimonials on your social media
                  </h3>
                  <p className="mt-2 text-xs sm:text-sm text-gray-600 max-w-xl mx-auto">
                    Get more visits to your site with stunning 9:16 vertical videos and Reels.
                  </p>
                  <div className="mt-6 mx-auto max-w-xs aspect-[9/16] rounded-2xl bg-zinc-950 text-white p-5 flex flex-col justify-between shadow-2xl relative">
                    <div className="flex items-center justify-between text-xs text-zinc-400">
                      <span>Panda Praise Reel Studio</span>
                      <span className="text-pink-500 font-bold">● LIVE</span>
                    </div>
                    <div className="text-center my-auto">
                      <div className="w-14 h-14 rounded-full bg-[#6701e6] flex items-center justify-center mx-auto text-white shadow-glow mb-3">
                        <Play className="w-6 h-6 fill-white ml-0.5" />
                      </div>
                      <p className="text-xs font-semibold">"This tool 3x'd our customer conversions!"</p>
                    </div>
                    <div className="text-left text-[11px] text-zinc-300">
                      <p className="font-bold text-white">@founder_growth</p>
                      <p className="text-zinc-400">Auto-captioned with waveform 🎵</p>
                    </div>
                  </div>
                </div>
              )}

              {activeShareTab === 'walls' && (
                <div>
                  <h3 className="text-xl sm:text-2xl font-bold font-display text-gray-900">
                    Link to Walls of Love in emails, navigations and bios
                  </h3>
                  <p className="mt-2 text-xs sm:text-sm text-gray-600 max-w-xl mx-auto">
                    Show off your best testimonials with our beautiful Walls of Love.
                  </p>
                  <div className="mt-4 flex flex-wrap justify-center gap-2">
                    {['Whimsical Theme', 'Noire Theme', 'Pastel Theme', 'Hong Kong Theme'].map((th) => (
                      <span key={th} className="rounded-full border border-gray-200 bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
                        {th}
                      </span>
                    ))}
                  </div>
                  <div className="mt-6">
                    <button
                      onClick={() => setIsWallModalOpen(true)}
                      className="px-5 py-2.5 rounded-xl bg-[#6701e6] hover:bg-[#5400bd] text-white text-xs font-bold shadow-md transition-transform hover:scale-105"
                    >
                      Open Wall of Love Preview
                    </button>
                  </div>
                </div>
              )}

              {activeShareTab === 'popups' && (
                <div>
                  <h3 className="text-xl sm:text-2xl font-bold font-display text-gray-900">
                    Add testimonial popups to your website
                  </h3>
                  <p className="mt-2 text-xs sm:text-sm text-gray-600 max-w-xl mx-auto">
                    Add social proof in seconds and generate FOMO with stylish corner popups.
                  </p>
                  <p className="mt-4 text-xs text-purple-700 font-semibold">
                    Look at the bottom-left corner of this screen to see the live toaster in action!
                  </p>
                </div>
              )}

              {activeShareTab === 'images' && (
                <div>
                  <h3 className="text-xl sm:text-2xl font-bold font-display text-gray-900">
                    Share image testimonials on your socials
                  </h3>
                  <p className="mt-2 text-xs sm:text-sm text-gray-600 max-w-xl mx-auto">
                    Drive visits, sales and signups with beautiful social cards.
                  </p>
                  <div className="mt-6 max-w-md mx-auto p-5 rounded-2xl bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-xl text-left">
                    <div className="flex text-amber-300 text-xs mb-2">★★★★★</div>
                    <p className="text-sm font-semibold mb-3">"Panda Praise is the single most valuable growth tool we adopted this year."</p>
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-white text-purple-700 font-bold text-xs flex items-center justify-center">E</div>
                      <div className="text-xs">
                        <span className="font-bold">Elena Rostova</span>
                        <span className="text-purple-200 block text-[10px]">VP Growth</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeShareTab === 'hosting' && (
                <div>
                  <h3 className="text-xl sm:text-2xl font-bold font-display text-gray-900">
                    Unlimited, ad-free hosting for your video testimonials
                  </h3>
                  <p className="mt-2 text-xs sm:text-sm text-gray-600 max-w-xl mx-auto">
                    Ditch Wistia, YouTube and Vimeo. Add your video testimonials with dedicated, lightning-fast hosting.
                  </p>
                  <div className="mt-6 inline-flex flex-col gap-2 text-xs text-gray-700 text-left">
                    <div className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600" /> All your video testimonials in one place</div>
                    <div className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600" /> Share with a link or embed with widgets</div>
                    <div className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600" /> 100% ad-free video hosting</div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Quote Block with thick black left border */}
          <figure className="relative border-l-2 border-black py-2 pl-5 text-left mx-auto mt-10 max-w-xl">
            <blockquote className="text-sm sm:text-base text-gray-700 leading-relaxed">
              <p>
                We have collected tons of testimonials and previously it was a bit fiddly...{' '}
                <mark className="senja-yellow-mark">
                  if we need a quick social media post, want to add proof to an email or use as ads, we can just pick right from Panda Praise
                </mark>
                , love it. They're like our very own social proof emojis now!
              </p>
            </blockquote>
            <figcaption className="mt-4 flex items-center gap-3">
              <img
                src="/assets/senja/michael-heap.BPuupf8X_67hTa.webp"
                alt="Michael Heap"
                loading="lazy"
                className="h-10 w-10 rounded-full object-cover shadow-xs border border-gray-200"
              />
              <div>
                <p className="font-semibold text-gray-900 text-sm">Michael Heap</p>
                <p className="text-xs text-gray-500">Chrome Web Store review</p>
              </div>
            </figcaption>
          </figure>
        </div>
      </section>

      {/* ── 9. "Thank" Section (Senja Feature) ── */}
      <section className="bg-white py-16 sm:py-20 border-t border-gray-200 text-center">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <p className="font-caveat text-3xl text-[#6701e6] rotate-1">
            Thank
          </p>

          <h2 className="mt-2 text-3xl sm:text-4xl lg:text-5xl font-extrabold font-display text-gray-950 tracking-tight">
            Thank every customer like it's still day one
          </h2>

          <p className="mt-4 text-sm sm:text-base text-gray-600 max-w-2xl mx-auto leading-relaxed">
            You didn't grow by treating people like numbers. Send personal thank-you videos, gifts and notes, at any size.
          </p>

          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-2 text-left max-w-2xl mx-auto text-xs sm:text-sm text-gray-700">
            <div className="flex items-start gap-2">
              <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>Find the customers you should thank</span>
            </div>
            <div className="flex items-start gap-2">
              <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>Send e-gifts, coupons and discounts</span>
            </div>
            <div className="flex items-start gap-2">
              <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>Unlock features as a thank you</span>
            </div>
            <div className="flex items-start gap-2">
              <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>Record personal notes and videos</span>
            </div>
            <div className="flex items-start gap-2">
              <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>See who redeems every gift</span>
            </div>
            <div className="flex items-start gap-2">
              <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>Get reactions delivered to Slack</span>
            </div>
          </div>

          <figure className="relative border-l-2 border-black py-2 pl-5 text-left mx-auto mt-10 max-w-xl">
            <blockquote className="text-sm sm:text-base text-gray-700 leading-relaxed">
              <p>
                <mark className="senja-yellow-mark">Panda Praise is simply awesome</mark>. They work hard providing a wide list of review integrations, showing how the company is built in public, and their constant presence with their customers.
              </p>
            </blockquote>
            <figcaption className="mt-4 flex items-center gap-3">
              <img
                src="/assets/senja/nathan-falceso.BOeFR7x3_24DNsr.webp"
                alt="Nathan Falceso"
                loading="lazy"
                className="h-10 w-10 rounded-full object-cover shadow-xs border border-gray-200"
              />
              <div>
                <p className="font-semibold text-gray-900 text-sm">Nathan Falceso</p>
                <p className="text-xs text-gray-500">Verified User</p>
              </div>
            </figcaption>
          </figure>
        </div>
      </section>

      {/* ── 10. "Built for you" Personas Section ── */}
      <section className="max-w-5xl mx-auto px-6 py-16 text-center border-t border-gray-200">
        <p className="font-caveat text-3xl text-[#6701e6] -rotate-1">
          Built for you
        </p>
        <h2 className="mt-2 font-display text-3xl font-extrabold sm:text-4xl text-gray-950">
          Whatever you make, Panda Praise fits how you work
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-sm text-gray-600">
          Whether you're a creator, run a SaaS, or sell your own kind of niche thing — Panda Praise is the go-to tool for collecting, managing, and showing off your social proof.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-2.5 max-w-3xl mx-auto">
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
            <span
              key={persona}
              className="rounded-full border border-gray-200 bg-white px-4 py-1.5 text-xs sm:text-sm font-medium text-gray-700 shadow-xs hover:border-[#6701e6]/40 hover:bg-[#6701e6]/5 hover:text-[#6701e6] transition-colors"
            >
              {persona}
            </span>
          ))}
        </div>
      </section>

      {/* ── 11. Frequently Asked Questions Section ── */}
      <section id="faq" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10 border-t border-gray-200">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <p className="font-caveat text-3xl text-[#6701e6]">Got Questions?</p>
          <h2 className="text-2xl sm:text-3xl font-extrabold font-display text-gray-950 tracking-tight mt-1">
            Frequently Asked Questions
          </h2>
          <p className="text-sm text-gray-600 mt-2">
            Everything you need to know about collecting and displaying testimonials with Panda Praise.
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
                  <div className="px-6 pb-4 pt-1 text-xs sm:text-sm text-gray-600 leading-relaxed border-t border-gray-100 bg-gray-50/50 animate-fade-in">
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
          <p className="font-caveat text-3xl text-white/80">Testimonials made easy</p>
          <h2 className="mt-2 font-display text-3xl sm:text-5xl font-extrabold tracking-tight">
            Ready to boost your business with social proof?
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm sm:text-base text-white/80 leading-relaxed">
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
              className="px-8 py-4 rounded-xl bg-white text-gray-950 font-bold text-base shadow-xl hover:bg-gray-100 hover:scale-105 transition-all"
            >
              Start for free today
            </Link>
            <button
              onClick={handleLaunchDemo}
              className="px-6 py-4 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-sm border border-white/20 transition-colors flex items-center gap-2"
            >
              <Play className="w-4 h-4 text-white" />
              <span>Try Demo Dashboard</span>
            </button>
          </div>
        </div>
      </section>

      {/* ── 13. Footer ── */}
      <footer className="border-t border-gray-200 py-10 text-xs text-gray-500 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-display font-extrabold text-base text-gray-900">Panda Praise</span>
            <span className="text-gray-300">•</span>
            <span>Collect, Manage and Share Testimonials</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
            <Link to="/pricing" className="hover:text-gray-900 transition-colors">Pricing</Link>
            <Link to="/c/pandapraise-feedback" className="text-[#6701e6] hover:underline font-semibold">Leave a Review</Link>
            <Link to="/privacy-policy" className="hover:text-gray-900 transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-gray-900 transition-colors">Terms</Link>
            <Link to="/login" className="hover:text-gray-900 transition-colors">Login</Link>
            <Link to="/signup" className="hover:text-gray-900 transition-colors">Sign up for free</Link>
          </div>
        </div>
      </footer>

      {/* ── 14. Floating Elements ── */}
      {/* Senja-Class Vertical Floating Wall of Love Heart Tab on Right Edge */}
      <FloatingReviewDrawer
        reviews={INITIAL_REVIEWS}
        variant="wall-heart"
        defaultOpen={isWallModalOpen}
      />

      {/* Senja-Class Social Proof Popup Toast on Bottom Left */}
      <SocialProofToast
        reviews={INITIAL_REVIEWS}
        position="bottom-left"
        onOpenWallOfLove={() => setIsWallModalOpen(true)}
      />
    </div>
  );
};
