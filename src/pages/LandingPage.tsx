import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, 
  Check, 
  Clock,
  Search, 
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
import { MotionAccordion } from '../components/MotionAccordion';
import { BeforeAfterVideoPlayer } from '../components/meta-ads/BeforeAfterVideoPlayer';


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
    a: 'Panda Praise embeds seamlessly using a lightweight HTML code snippet or universal iframe. Verified on custom HTML, WordPress, Webflow, Framer, Shopify, Squarespace, Wix, React, and Next.js, with platform-specific setup guides in your dashboard.',
  },
  {
    q: 'Can I import my existing reviews from other platforms?',
    a: 'Yes! Upload a CSV of your existing reviews, or connect Google, LinkedIn, Instagram or Facebook to pull reviews in.',
  },
];

export const LandingPage: React.FC = () => {
  usePageSeo({
    title: 'Panda Praise V2 — WhatsApp Customer Videos to Meta Ads',
    description: 'Turn authentic WhatsApp customer videos into high-converting Meta Ads in 24 hours. Built for Indian Shopify D2C brands.',
    canonical: `${window.location.origin}/`,
  });

  const { user } = useAuth();
  const [activeShareTab, setActiveShareTab] = useState<'widgets' | 'walls' | 'popups' | 'images'>('widgets');
  const [interactiveWidgetTab, setInteractiveWidgetTab] = useState<'wall' | 'ticker' | 'badge' | 'card'>('wall');
  const [showHeartTab, setShowHeartTab] = useState(false);
  const [showSocialToast, setShowSocialToast] = useState(false);
  const [searchQueryMock, setSearchQueryMock] = useState('do the techs actually use it');
  const [isWallModalOpen, setIsWallModalOpen] = useState(false);


  // Smart boundary check to prevent toast colliding with footer or CTAs
  const footerRef = useRef<HTMLElement>(null);
  const [isNearFooter, setIsNearFooter] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const y = window.scrollY;
      setShowHeartTab(y > 500);
      setShowSocialToast(y > 1650);

      if (footerRef.current) {
        const footerRect = footerRef.current.getBoundingClientRect();
        setIsNearFooter(footerRect.top < window.innerHeight + 120);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#FFFFFF] text-[#0F172A] selection:bg-brand-500/20 selection:text-brand-900 relative pb-20 sm:pb-0 font-sans">
      
      {/* ── 1. Top Announcement Bar ── */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white text-xs sm:text-sm font-medium py-2.5 px-4 text-center flex items-center justify-center gap-2">
        <span className="px-2 py-0.5 rounded bg-black/25 text-xs font-bold uppercase tracking-wider">⚡ REAL CUSTOMER VIDEOS</span>
        <span>Real Customer UGC Beats AI Actors Every Single Time (2.3%+ Meta CTR)</span>
        <span className="hidden sm:inline">|</span>
        <Link to="/signup" className="underline hover:text-emerald-100 font-bold">Get 5 Ads for ₹1,500 →</Link>
      </div>

      {/* ── 2. Header / Navigation ── */}
      <header className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between border-b border-gray-100 bg-white sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <Link to="/" className="text-2xl font-black tracking-tighter text-gray-900 flex items-center gap-2">
            <span>🐼</span>
            <span>Panda<span className="text-emerald-600">Praise</span> <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full uppercase ml-1">V2</span></span>
          </Link>
        </div>
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
          <button onClick={() => scrollToSection('pipeline-section')} className="hover:text-gray-900 transition-colors cursor-pointer">How It Works</button>
          <button onClick={() => scrollToSection('comparison-section')} className="hover:text-gray-900 transition-colors cursor-pointer">Before vs After</button>
          <button onClick={() => scrollToSection('pricing-section')} className="hover:text-gray-900 transition-colors cursor-pointer">Pricing (INR)</button>
          <button onClick={() => scrollToSection('faq')} className="hover:text-gray-900 transition-colors cursor-pointer">FAQ</button>
        </nav>
        <div className="flex items-center gap-4">
          <Link to={user ? "/dashboard" : "/login"} className="text-sm font-semibold text-gray-700 hover:text-gray-900">
            Login
          </Link>
          <Link
            to={user ? "/dashboard" : "/signup"}
            onClick={() => analytics.signupStarted('header_nav')}
            className="px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-sm hover:bg-emerald-500 transition shadow-lg shadow-emerald-600/20"
          >
            Connect Shopify
          </Link>
        </div>
      </header>

      {/* ── 3. Hero Section ── */}
      <section className="max-w-5xl mx-auto px-4 pt-16 sm:pt-20 pb-8 text-center relative z-10">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold mb-8 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          Built for Indian Shopify D2C Brands Spending ₹2L+/mo on Meta
        </div>

        {/* Headline */}
        <h1 className="max-w-4xl mx-auto text-center font-black tracking-tight text-gray-950 leading-[1.08] mb-6 text-3xl sm:text-5xl md:text-6xl lg:text-[64px]">
          <span>Turn WhatsApp Customer Videos into </span>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-700">
            Meta Ads in 24 Hours.
          </span>
        </h1>

        {/* Sub-headline */}
        <p className="text-gray-600 text-base sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed font-normal">
          Real customer videos beat AI actors every single time. Connect your Shopify store and WhatsApp. We automatically collect authentic video reviews, burn viral hooks and Hormozi captions, and deliver 5 Meta-ready ads to your dashboard.
        </p>

        {/* CTA Button Group */}
        <div className="flex flex-col items-center gap-4">
          <Link
            to={user ? "/dashboard" : "/signup"}
            onClick={() => {
              analytics.ctaClicked('hero_primary', '/signup');
              analytics.signupStarted('hero_primary');
            }}
            className="px-8 py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-base sm:text-lg transition-all duration-200 shadow-xl shadow-emerald-600/30 flex items-center gap-2 cursor-pointer group"
          >
            <span>Connect Your Shopify Store (Get 5 Ads for ₹1,500)</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>

          {/* Micro Trust Specs */}
          <div className="flex flex-wrap justify-center items-center gap-4 sm:gap-8 text-xs text-gray-500 font-semibold mt-2">
            <span className="flex items-center gap-1.5 text-emerald-700">✓ No monthly widget lock-in</span>
            <span className="flex items-center gap-1.5 text-emerald-700">✓ Ready in 24 hours</span>
            <span className="flex items-center gap-1.5 text-emerald-700">✓ 9:16, 1:1 & 4:5 ratios included</span>
          </div>
        </div>

        {/* ── Interactive Before / After Video Player ── */}
        <div className="mt-12">
          <BeforeAfterVideoPlayer />
        </div>
      </section>


      {/* ── 4. The 3-Step Automated Pipeline Section ── */}
      <section id="pipeline-section" className="py-20 bg-slate-900 text-white relative overflow-hidden">
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-black uppercase tracking-wider text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-3.5 py-1.5 rounded-full">
              Automated UGC Machine
            </span>
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight mt-4 text-white">
              Shopify Order ➔ WhatsApp ➔ 5 Meta Ads.
            </h2>
            <p className="text-slate-400 text-base sm:text-lg mt-3">
              Zero manual follow-ups. Zero expensive freelance video editors.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="bg-slate-800/60 border border-slate-700/80 p-8 rounded-3xl relative flex flex-col justify-between">
              <div className="absolute -top-4 -left-2 w-10 h-10 rounded-2xl bg-emerald-500 text-slate-950 font-black flex items-center justify-center text-lg shadow-lg shadow-emerald-500/30">
                1
              </div>
              <div className="pt-2">
                <span className="text-xs font-bold uppercase text-emerald-400 tracking-wider">Step 01 • Connect</span>
                <h3 className="text-xl font-bold text-white mt-1">Plug In Shopify &amp; WhatsApp</h3>
                <p className="text-sm text-slate-400 mt-3 leading-relaxed">
                  Enter your store URL and WhatsApp Business number. Our system syncs automatically with Shopify delivery webhooks.
                </p>
              </div>
              <div className="mt-6 p-4 rounded-2xl bg-slate-950/60 border border-slate-800 text-xs font-mono text-emerald-300">
                ⚡ Trigger: Order Delivered + 7 Days
              </div>
            </div>

            {/* Step 2 */}
            <div className="bg-slate-800/60 border border-slate-700/80 p-8 rounded-3xl relative flex flex-col justify-between">
              <div className="absolute -top-4 -left-2 w-10 h-10 rounded-2xl bg-emerald-500 text-slate-950 font-black flex items-center justify-center text-lg shadow-lg shadow-emerald-500/30">
                2
              </div>
              <div className="pt-2">
                <span className="text-xs font-bold uppercase text-emerald-400 tracking-wider">Step 02 • Collect</span>
                <h3 className="text-xl font-bold text-white mt-1">Frictionless WhatsApp Video</h3>
                <p className="text-sm text-slate-400 mt-3 leading-relaxed">
                  Customers don't open email surveys. They send a 20-second video on WhatsApp to unlock flat ₹100 off their next purchase.
                </p>
              </div>
              <div className="mt-6 p-4 rounded-2xl bg-slate-950/60 border border-slate-800 text-xs text-slate-300">
                💬 <em>"Loved your kurta? Send a 20s video review &amp; get ₹100 coupon."</em>
              </div>
            </div>

            {/* Step 3 */}
            <div className="bg-slate-800/60 border border-slate-700/80 p-8 rounded-3xl relative flex flex-col justify-between">
              <div className="absolute -top-4 -left-2 w-10 h-10 rounded-2xl bg-emerald-500 text-slate-950 font-black flex items-center justify-center text-lg shadow-lg shadow-emerald-500/30">
                3
              </div>
              <div className="pt-2">
                <span className="text-xs font-bold uppercase text-emerald-400 tracking-wider">Step 03 • Render</span>
                <h3 className="text-xl font-bold text-white mt-1">1-Click Meta Ad Generator</h3>
                <p className="text-sm text-slate-400 mt-3 leading-relaxed">
                  Our pipeline automatically burns 3 proven viral D2C hooks and animated Hormozi captions in 9:16, 1:1, and 4:5.
                </p>
              </div>
              <div className="mt-6 p-4 rounded-2xl bg-slate-950/60 border border-slate-800 text-xs font-bold text-emerald-400 flex items-center justify-between">
                <span>📦 5 Meta Ads Ready</span>
                <span>CRF 18 HD</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 5. Indian D2C Comparison Table ("Why Real UGC Wins") ── */}
      <section id="comparison-section" className="max-w-6xl mx-auto px-6 py-24">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            Performance Truth
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-950 tracking-tight mt-3">
            Real Customer UGC vs. Fake AI Actors
          </h2>
          <p className="text-slate-600 mt-2 text-sm sm:text-base">
            Indian shoppers can spot generic AI avatars from a mile away. Real customer reviews drive genuine purchases.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-xs uppercase tracking-wider text-gray-500">
                <th className="py-4 px-6 font-bold">Feature</th>
                <th className="py-4 px-6 font-bold text-rose-600">Old Way / AI Actors</th>
                <th className="py-4 px-6 font-bold text-emerald-700 bg-emerald-50/50">PandaPraise V2 UGC</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              <tr>
                <td className="py-4 px-6 font-semibold text-gray-900">Shopper Trust &amp; Authenticity</td>
                <td className="py-4 px-6 text-gray-600">Uncanny valley, robotic lip-sync</td>
                <td className="py-4 px-6 font-bold text-emerald-700 bg-emerald-50/30">100% Real buyers holding actual products</td>
              </tr>
              <tr>
                <td className="py-4 px-6 font-semibold text-gray-900">Average Meta CTR</td>
                <td className="py-4 px-6 text-rose-600 font-bold">0.6% – 0.9% (High ad fatigue)</td>
                <td className="py-4 px-6 font-black text-emerald-700 bg-emerald-50/30">2.1% – 2.8% (Scroll-stopping hook)</td>
              </tr>
              <tr>
                <td className="py-4 px-6 font-semibold text-gray-900">Cost Per Creative</td>
                <td className="py-4 px-6 text-gray-600">₹1,500 – ₹3,000 per video editing agency</td>
                <td className="py-4 px-6 font-bold text-emerald-700 bg-emerald-50/30">₹300 per ad (₹1,500 for 5 ads)</td>
              </tr>
              <tr>
                <td className="py-4 px-6 font-semibold text-gray-900">Turnaround Time</td>
                <td className="py-4 px-6 text-gray-600">5 to 7 days back-and-forth</td>
                <td className="py-4 px-6 font-bold text-emerald-700 bg-emerald-50/30">Under 24 hours on autopilot</td>
              </tr>
              <tr>
                <td className="py-4 px-6 font-semibold text-gray-900">Captions &amp; Aspect Ratios</td>
                <td className="py-4 px-6 text-gray-600">Manual SRT files or extra fees</td>
                <td className="py-4 px-6 font-bold text-emerald-700 bg-emerald-50/30">Pre-burnt Hormozi captions in 9:16, 1:1, 4:5</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* ── 6. Transparent INR Pricing Section ── */}
      <section id="pricing-section" className="py-24 bg-gray-50 border-t border-gray-200">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              Clear Indian Pricing (INR)
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-slate-950 tracking-tight mt-3">
              Pay As You Grow. Zero Lock-In.
            </h2>
            <p className="text-slate-600 mt-2 text-base">
              No free plan. No useless widget fees. Pay only for ready-to-run Meta ad creatives that generate sales.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch max-w-4xl mx-auto">
            {/* Plan 1: Starter Pack */}
            <div className="bg-white p-8 rounded-3xl border border-gray-200 shadow-sm flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold uppercase text-gray-500 tracking-wider">Pay-As-You-Go</span>
                <h3 className="text-2xl font-black text-gray-900 mt-1">5 Meta Ads Pack</h3>
                <p className="text-xs text-gray-500 mt-2">
                  Ideal for testing your first batch of WhatsApp UGC on Meta Ads.
                </p>
                <div className="mt-6 flex items-baseline gap-2">
                  <span className="text-4xl font-black text-gray-950">₹1,500</span>
                  <span className="text-xs text-gray-500 font-bold">one-time payment</span>
                </div>
                <div className="text-xs text-emerald-700 font-bold mt-1">₹300 per finished ad</div>

                <ul className="mt-6 space-y-3 text-xs sm:text-sm text-gray-700 border-t border-gray-100 pt-6">
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600" /> 5 Meta-Ready Ad Creatives</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600" /> 3 Viral D2C Hook Variations</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600" /> Hormozi-Style Animated Subtitles</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600" /> 9:16 (Reels), 1:1 (Feed), 4:5 Multi-Export</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600" /> Instant Razorpay / UPI Checkout</li>
                </ul>
              </div>

              <Link
                to="/signup?plan=pack"
                className="mt-8 w-full py-3.5 rounded-xl bg-gray-900 hover:bg-black text-white font-bold text-sm text-center transition-all block"
              >
                Buy 5 Ads for ₹1,500
              </Link>
            </div>

            {/* Plan 2: Growth Monthly Subscription */}
            <div className="bg-gradient-to-b from-slate-950 to-slate-900 p-8 rounded-3xl border-2 border-emerald-500 shadow-xl text-white flex flex-col justify-between relative">
              <span className="absolute -top-3 right-6 bg-emerald-500 text-slate-950 text-[10px] font-black uppercase tracking-wider py-1 px-3 rounded-full shadow-md">
                Most Popular for D2C Brands
              </span>
              <div>
                <span className="text-xs font-bold uppercase text-emerald-400 tracking-wider">Automated Growth</span>
                <h3 className="text-2xl font-black text-white mt-1">D2C Scale Pipeline</h3>
                <p className="text-xs text-slate-400 mt-2">
                  Automated Shopify WhatsApp triggers + monthly batch of ready-to-scale ads.
                </p>
                <div className="mt-6 flex items-baseline gap-2">
                  <span className="text-4xl font-black text-white">₹2,999</span>
                  <span className="text-xs text-slate-400 font-bold">/ month</span>
                </div>
                <div className="text-xs text-emerald-400 font-bold mt-1">Includes 20 Meta Ads every month</div>

                <ul className="mt-6 space-y-3 text-xs sm:text-sm text-slate-300 border-t border-slate-800 pt-6">
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> <strong>20 Meta-Ready Ads / month</strong></li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> Automated Shopify Delivered + 7d trigger</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> Automated 48h WhatsApp reminder nagger</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> Up to 500 WhatsApp customer triggers/mo</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> One-click Push to Shopify Product Page</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> Priority 12-Hour Render Queue</li>
                </ul>
              </div>

              <Link
                to="/signup?plan=growth"
                className="mt-8 w-full py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm text-center transition-all block shadow-lg shadow-emerald-500/30"
              >
                Start Growth Plan (₹2,999/mo)
              </Link>
            </div>
          </div>
        </div>
      </section>


      {/* ── 6. FEATURE 1: "COLLECT" (Two-Column Alternating: Text LEFT, Visual RIGHT) ── */}
      <section id="collect-section" className="border-t border-gray-200/80 bg-gradient-to-b from-white via-amber-50/20 to-white py-20 sm:py-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            
            {/* Column A: Text Content */}
            <div className="lg:col-span-6 text-left">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200/70 text-amber-800 text-xs font-bold tracking-wide uppercase mb-4">
                <MessageSquare className="w-3.5 h-3.5 text-amber-600" />
                <span>01 / Collect Testimonials</span>
              </div>

              <h2 className="text-3xl sm:text-4xl lg:text-[40px] font-bold text-slate-950 tracking-tight leading-[1.16]">
                Collect Authentic Reviews & Praise on Autopilot
              </h2>

              <p className="mt-4 text-base sm:text-lg text-gray-600 leading-relaxed">
                Launch branded collection forms in 2 seconds. No apps, downloads, or customer logins required. Capture authentic customer stories and 5-star praise effortlessly.
              </p>

              {/* Feature Checklist Bullets */}
              <ul className="mt-6 space-y-3 text-sm text-gray-700 font-medium">
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Automate customer review collection with guided prompts</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Share via direct link, embed anywhere, or trigger via QR code</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Import existing reviews from CSV, or connect Google, LinkedIn, Instagram & Facebook</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Automate with API access & webhooks (paid plans)</span>
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

            </div>

            {/* Column B: Product Demonstration Mockup */}
            <div className="lg:col-span-6">
              <div className="rounded-3xl bg-gradient-to-br from-amber-400 to-orange-500 p-6 sm:p-10 shadow-xl">
                <div className="bg-white rounded-2xl p-6 sm:p-7 shadow-2xl max-w-md mx-auto text-left">
                  <div className="flex items-center gap-3 mb-4">
                    <img
                      src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
                      alt="Sample collector form preview"
                      loading="lazy"
                      width="44"
                      height="44"
                      className="w-11 h-11 rounded-full object-cover ring-2 ring-amber-200"
                    />
                    <div>
                      <h3 className="font-bold text-gray-900 text-sm sm:text-base">
                        Share a testimonial for my course 🫶
                      </h3>
                      <p className="text-xs text-gray-600">Takes less than 2 seconds</p>
                    </div>
                  </div>

                  {/* Mock collector review container */}
                  <div className="rounded-2xl bg-purple-50/70 border border-purple-200/80 p-5 mb-4 text-left space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div role="img" aria-label="5 out of 5 stars" className="flex text-amber-500 text-sm">
                        <span>★★★★★</span>
                      </div>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                        2-Second Verified
                      </span>
                    </div>
                    <p className="text-xs text-gray-800 font-medium">
                      "Panda Praise is genuinely the fastest way we've ever gathered customer testimonials. Zero friction!"
                    </p>
                    <p className="text-[11px] text-gray-500">
                      — Verified Client Feedback
                    </p>
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
      <section id="find-section" className="border-t border-gray-200/80 bg-gradient-to-b from-slate-50 via-purple-50/20 to-slate-50 py-20 sm:py-24">
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
                        <p className="text-xs text-gray-600">Admin</p>
                      </div>
                    </div>

                    <div>
                      <p className="text-[10px] font-bold tracking-wider text-gray-600 uppercase">COLLECT</p>
                      <p className="mt-1 text-gray-600 hover:text-gray-900 cursor-pointer">Forms</p>
                      <p className="mt-1 text-gray-600 hover:text-gray-900 cursor-pointer">Import</p>
                    </div>

                    <div>
                      <p className="text-[10px] font-bold tracking-wider text-gray-600 uppercase">MANAGE</p>
                      <p className="mt-1 rounded bg-[#6701e6]/10 px-2 py-1 font-bold text-[#6701e6]">Proof</p>
                      <p className="mt-1 text-gray-600 hover:text-gray-900 cursor-pointer">Tags</p>
                    </div>

                    <div>
                      <p className="text-[10px] font-bold tracking-wider text-gray-600 uppercase">SHARE</p>
                      <p className="mt-1 text-gray-600 hover:text-gray-900 cursor-pointer">Embeds</p>
                      <p className="mt-1 text-gray-600 hover:text-gray-900 cursor-pointer">Thank Yous</p>
                    </div>
                  </div>

                  {/* Main Proof Area */}
                  <div className="col-span-12 sm:col-span-8 p-4 sm:p-5">
                    <div className="flex items-center justify-between">
                      <p className="text-sm sm:text-base font-bold text-gray-900">
                        Your Proof <span className="ml-1 rounded-full bg-gray-100 px-2 py-0.5 text-xs font-semibold text-gray-700">118</span>
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
                      <span className="text-gray-600 text-[11px]">Customers praise:</span>
                      <span className="rounded-full border border-gray-200 px-2 py-0.5 text-gray-600 text-[11px]">Ease of use <b>42</b></span>
                      <span className="rounded-full border border-gray-200 px-2 py-0.5 text-gray-600 text-[11px]">Time saved <b>38</b></span>
                      <span className="rounded-full border border-gray-200 px-2 py-0.5 text-gray-600 text-[11px]">Support <b>29</b></span>
                    </div>

                    {/* Keyword search bar */}
                    <div className="mt-3.5 flex items-center gap-2">
                      <div className="min-w-0 flex-1 rounded-lg border border-[#6701e6]/40 px-3 py-1.5 text-xs text-gray-800 flex items-center gap-2 bg-purple-50/20">
                        <Search className="w-3.5 h-3.5 text-gray-400" />
                        <input
                          type="text"
                          aria-label="Search testimonials by keyword"
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
                          <span className="rounded bg-emerald-50 px-1.5 py-0.5 text-[10px] font-bold text-emerald-800">Approved</span>
                        </div>
                        <div role="img" aria-label="5 out of 5 stars" className="text-xs text-amber-500 my-0.5"><span aria-hidden="true">★★★★★</span></div>
                        <p className="text-xs text-gray-700">"I was sure the techs would never use it. They picked it up in a day."</p>
                      </div>

                      {/* Proof row 2 */}
                      <div className="rounded-xl border border-gray-200 p-2.5 bg-white shadow-xs text-left">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-gray-900">Dave Hartley · Owner, Hartley Plumbing</span>
                          <span className="rounded bg-emerald-50 px-1.5 py-0.5 text-[10px] font-bold text-emerald-800">Approved</span>
                        </div>
                        <div role="img" aria-label="5 out of 5 stars" className="text-xs text-amber-500 my-0.5"><span aria-hidden="true">★★★★★</span></div>
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

              <h2 className="text-3xl sm:text-4xl lg:text-[40px] font-bold text-slate-950 tracking-tight leading-[1.16]">
                Every Testimonial, Instantly at Your Fingertips
              </h2>

              <p className="mt-4 text-base sm:text-lg text-gray-600 leading-relaxed">
                Search, filter, and tag every customer review in one unified, searchable vault. Stop losing rave reviews in Slack, email threads, and screenshots.
              </p>

              {/* Checklist */}
              <ul className="mt-6 space-y-3 text-sm text-gray-700 font-medium">
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Search every testimonial by keyword, name, company, or role</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Filter by rating, status, source, form, and custom tags</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Import reviews from CSV, LinkedIn, Facebook, and Instagram</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Clock className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                  <span>Chrome extension, Slack integration & 1-click case studies — coming soon</span>
                </li>
              </ul>

              {/* In-Section Quote — product truth, no fabricated attribution */}
              <figure className="relative border-l-2 border-black py-2 pl-4 text-left mt-8 max-w-lg">
                <blockquote className="text-xs sm:text-sm text-gray-700 leading-relaxed">
                  <p>
                    Every testimonial you collect flows through moderation —{' '}
                    <mark className="senja-yellow-mark">
                      nothing goes live until you approve it
                    </mark>{' '}
                    , and one click publishes it to your Wall of Love, website, or socials.
                  </p>
                </blockquote>
                <figcaption className="mt-2.5 text-[11px] font-semibold text-gray-500 uppercase tracking-wide">
                  Built into every plan
                </figcaption>
              </figure>
            </div>

          </div>
        </div>
      </section>

      {/* ── 8. FEATURE 3: "PUBLISH & SHARE" (Full Showcase Transformation Architecture) ── */}
      <section id="share-section" className="border-t border-gray-200/80 bg-white py-20 sm:py-28 lg:py-32 text-center">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-indigo-50 border border-indigo-200/70 text-brand-600 text-xs font-bold tracking-wide uppercase mb-5">
            <Sparkles className="w-3.5 h-3.5 text-brand-600" />
            <span>03 / Publish Everywhere</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-950 tracking-tight max-w-3xl mx-auto leading-tight text-balance">
            One Testimonial, 12 Ways to Share It
          </h2>

          <p className="mt-4 sm:mt-5 text-base sm:text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed text-balance">
            Don't let your best reviews collect digital dust. Panda Praise turns every testimonial into widgets, social proof cards, popups, and case studies.
          </p>

          {/* 6 Checklist Bullets in Balanced Grid */}
          <div className="mt-10 mb-12 sm:mb-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-3.5 text-left max-w-4xl mx-auto text-xs sm:text-sm text-gray-700 font-medium">
            <div className="flex items-start gap-2">
              <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>Widgets, popups and Walls of Love</span>
            </div>
            <div className="flex items-start gap-2">
              <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>Social proof cards & feed graphics</span>
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
              <span>Lightning-fast CDN widget delivery</span>
            </div>
          </div>

          {/* Interactive Tabbed Sharing Showcase Card */}
          <div className="rounded-3xl border border-gray-200 bg-white p-6 sm:p-10 shadow-lg max-w-5xl mx-auto">
            
            {/* Pill Tab Switcher */}
            <div className="flex justify-center-safe gap-2 overflow-x-auto pb-2">
              {[
                { id: 'widgets', label: 'Widgets' },
                { id: 'walls', label: 'Walls of Love' },
                { id: 'popups', label: 'Popups' },
                { id: 'images', label: 'Social Proof Cards' },
              ].map((tab) => {
                const isActive = activeShareTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveShareTab(tab.id as any)}
                    className={`shrink-0 whitespace-nowrap rounded-full px-4 sm:px-5 py-2 text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                      isActive
                        ? 'bg-brand-600 text-white shadow-md'
                        : 'border border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100 hover:text-gray-900'
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
                    Interactive, attention-grabbing widgets designed to convert. Click below to preview each widget format live:
                  </p>

                  {/* Interactive Widget Format Switcher */}
                  <div className="mt-6 flex flex-wrap items-center justify-center gap-2 max-w-3xl mx-auto">
                    {[
                      { id: 'wall', label: 'Wall of Love', icon: '✨' },
                      { id: 'ticker', label: 'Marquee Ticker', icon: '⚡' },
                      { id: 'badge', label: 'Rating Badge', icon: '⭐' },
                      { id: 'card', label: 'Social Proof Card', icon: '💬' },
                    ].map((w) => {
                      const isSelected = interactiveWidgetTab === w.id;
                      return (
                        <button
                          key={w.id}
                          type="button"
                          id={`interactive-widget-tab-${w.id}`}
                          onClick={() => setInteractiveWidgetTab(w.id as any)}
                          className={`rounded-full px-4 py-2 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                            isSelected
                              ? 'bg-brand-600 text-white shadow-md scale-105'
                              : 'border border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-700 hover:text-gray-950'
                          }`}
                        >
                          <span>{w.icon}</span>
                          <span>{w.label}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Dynamic Interactive Mock Widget Canvas */}
                  <div className="mt-8 max-w-4xl mx-auto" id="interactive-widget-preview-canvas">
                    {/* Format A: Wall of Love Masonry Grid */}
                    {interactiveWidgetTab === 'wall' && (
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left animate-in fade-in duration-200">
                        {INITIAL_REVIEWS.slice(0, 3).map((r, i) => (
                          <div
                            key={i}
                            className="p-4 rounded-2xl border border-gray-200 bg-white shadow-sm hover:shadow-md hover:border-violet-300 transition-all group"
                          >
                            <div role="img" aria-label="5 out of 5 stars" className="flex text-amber-500 text-xs mb-2">
                              <span>★★★★★</span>
                            </div>
                            <p className="text-xs text-gray-800 leading-relaxed line-clamp-3 mb-3">
                              "{r.content}"
                            </p>
                            <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                              <img src={r.avatarUrl} alt={r.name} className="w-7 h-7 rounded-full object-cover ring-1 ring-violet-200" />
                              <div className="text-[11px] truncate">
                                <span className="font-bold text-gray-900 block truncate">{r.name}</span>
                                <span className="text-gray-500 truncate">{r.company || 'Verified Customer'}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Format B: Marquee Ticker */}
                    {interactiveWidgetTab === 'ticker' && (
                      <div className="rounded-2xl border border-gray-200 bg-slate-900 text-white p-5 shadow-lg overflow-hidden animate-in fade-in duration-200">
                        <div className="flex items-center justify-between mb-3 text-xs text-slate-400">
                          <span className="font-semibold text-emerald-400 flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                            Live Testimonial Marquee (Auto-scrolling)
                          </span>
                          <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-slate-300">Infinite Carousel</span>
                        </div>
                        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-none">
                          {INITIAL_REVIEWS.slice(0, 4).map((r, i) => (
                            <div key={i} className="min-w-[260px] bg-slate-800/80 rounded-xl p-3 border border-slate-700/60 shrink-0 text-left">
                              <div className="flex items-center gap-1 text-amber-400 text-xs mb-1">
                                ★★★★★
                              </div>
                              <p className="text-xs text-slate-200 line-clamp-2 leading-relaxed">
                                "{r.content}"
                              </p>
                              <div className="mt-2 text-[10px] text-slate-400 flex items-center gap-1.5">
                                <span className="font-bold text-white">{r.name}</span>
                                <span>•</span>
                                <span>{r.company}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Format C: Rating Badge */}
                    {interactiveWidgetTab === 'badge' && (
                      <div className="flex flex-wrap items-center justify-center gap-6 p-8 rounded-2xl border border-gray-200 bg-gradient-to-r from-violet-50/50 via-white to-amber-50/50 shadow-sm animate-in fade-in duration-200">
                        {/* Big Google-style Badge */}
                        <div className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-white border border-gray-200 shadow-md">
                          <div className="w-10 h-10 rounded-xl bg-violet-600 text-white flex items-center justify-center font-bold text-sm">
                            ★ 4.9
                          </div>
                          <div className="text-left">
                            <div className="flex items-center gap-0.5 text-amber-500 text-xs">
                              ★★★★★
                            </div>
                            <p className="text-xs font-bold text-gray-900 mt-0.5">1,280+ 5-Star Reviews</p>
                            <p className="text-[10px] text-gray-500">Verified by Panda Praise</p>
                          </div>
                        </div>

                        {/* Floating trust pill */}
                        <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
                          <span className="w-2 h-2 rounded-full bg-emerald-500" />
                          <span>Your rating, always on display</span>
                        </div>
                      </div>
                    )}

                    {/* Format D: Social Proof Card */}
                    {interactiveWidgetTab === 'card' && (
                      <div className="max-w-md mx-auto p-6 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-700 text-white shadow-xl text-left animate-in fade-in duration-200 relative overflow-hidden">
                        <div className="absolute top-2 right-4 text-white/10 text-6xl font-serif font-black select-none pointer-events-none">
                          “
                        </div>
                        <div className="flex items-center gap-1 text-amber-300 text-sm mb-3">
                          ★★★★★
                        </div>
                        <p className="text-sm sm:text-base font-semibold leading-relaxed mb-4 text-white">
                          "This is where your customer's words shine — a real quote from a real customer, beautifully framed on your site."
                        </p>
                        <div className="flex items-center justify-between pt-3 border-t border-white/20">
                          <div>
                            <p className="text-xs font-bold text-white">Your Customer</p>
                            <p className="text-[11px] text-violet-200">Your biggest fan</p>
                          </div>
                          <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-bold">
                            Sample
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  <p className="mt-4 text-[11px] text-gray-400">
                    Live interactive preview with sample reviews — easily embedded with a 1-line copy-paste code snippet.
                  </p>
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
                      className="px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs sm:text-sm font-bold shadow-md transition-transform hover:scale-105 cursor-pointer"
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
                      alt="Sample popup preview"
                      loading="lazy"
                      width="40"
                      height="40"
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div>
                      <div role="img" aria-label="5 out of 5 stars" className="flex text-amber-500 text-xs mb-1"><span aria-hidden="true">★★★★★</span></div>
                      <p className="text-xs text-gray-800">"This is how a testimonial popup appears to your website visitors."</p>
                      <p className="text-[11px] text-gray-600 mt-1 font-semibold">Sample preview · Just now</p>
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
                    <div role="img" aria-label="5 out of 5 stars" className="flex text-amber-300 text-xs mb-2"><span aria-hidden="true">★★★★★</span></div>
                    <p className="text-sm font-semibold mb-3">"Your customer's testimonial appears here as a branded image."</p>
                    <div className="text-xs text-purple-100">
                      Sample preview — their photo, name, company & role, ready to share on your socials.
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Product-truth quote under Showcase — no fabricated customer attribution */}
          <figure className="relative border-l-2 border-brand-600 py-2 pl-4 text-left mx-auto mt-10 max-w-xl">
            <blockquote className="text-xs sm:text-sm text-gray-700 leading-relaxed">
              <p>
                Every testimonial you collect can be turned into a branded image, social card, or widget —{' '}
                <mark className="senja-yellow-mark">
                  ready to share on your socials, in emails, or on your website
                </mark>
                , without any design work.
              </p>
            </blockquote>
            <figcaption className="mt-2.5 text-[11px] font-semibold text-gray-500 uppercase tracking-wide">
              Built into every plan
            </figcaption>
          </figure>
        </div>
      </section>

      {/* ── 9. FEATURE 4: "THANK & DELIGHT" (Two-Column Alternating: Visual LEFT, Text RIGHT) ── */}
      <section id="delight-section" className="border-t border-gray-200/80 bg-gradient-to-b from-purple-50/30 via-pink-50/20 to-white py-20 sm:py-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            
            {/* Column A: Visual Demonstration (Delight & Rewards Card) */}
            <div className="lg:col-span-6 order-2 lg:order-1">
              <div className="rounded-3xl border border-gray-200 bg-white p-6 sm:p-8 shadow-xl max-w-md mx-auto text-left relative overflow-hidden">
                <span className="absolute top-4 right-4 rounded-full bg-gray-100 text-gray-500 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide">Coming soon — preview</span>
                <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <span className="p-2 rounded-xl bg-indigo-50 text-brand-600">
                      <Gift className="w-5 h-5" />
                    </span>
                    <div>
                      <p className="font-bold text-sm text-gray-900">Thank You Gift Dispatched</p>
                      <p className="text-[11px] text-gray-500">Delivered to client via email & Slack</p>
                    </div>
                  </div>
                  <span className="rounded-full bg-emerald-50 text-emerald-700 px-2 py-0.5 text-xs font-bold">Sent ✨</span>
                </div>

                <div className="mt-4 p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100">
                  <p className="text-xs text-indigo-950 font-medium leading-relaxed">
                    "Hey Taylor! Loved your review about our onboarding speed. Here is a $25 gift perk and early access to our new widget templates!"
                  </p>
                  <div className="mt-3 flex items-center justify-between text-xs font-bold text-brand-600">
                    <span>Coupon: PRAISE-VIP-25</span>
                    <span className="bg-white px-2 py-0.5 rounded border border-indigo-200 text-[10px]">Claimed</span>
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-3 text-xs text-gray-500">
                  <span className="flex h-2 w-2 rounded-full bg-gray-300" />
                  <span>Client reaction notifications (Slack sync planned)</span>
                </div>
              </div>
            </div>

            {/* Column B: Text Content */}
            <div className="lg:col-span-6 order-1 lg:order-2 text-left">
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-pink-50 border border-pink-200/70 text-pink-700 text-xs font-bold tracking-wide uppercase mb-4">
                <Gift className="w-3.5 h-3.5 text-pink-600" />
                <span>04 / Delight & Reward</span>
              </div>

              <h2 className="text-3xl sm:text-4xl lg:text-[40px] font-bold text-slate-950 tracking-tight leading-[1.16]">
                Thank Every Customer Like It's Still Day One
              </h2>

              <p className="mt-4 text-base sm:text-lg text-gray-600 leading-relaxed">
                You didn't grow by treating people like numbers. Track which customers deserve a thank-you and keep the moment alive.
              </p>

              {/* Checklist */}
              <ul className="mt-6 space-y-3 text-sm text-gray-700 font-medium">
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Find the customers who deserve an immediate thank you</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Track and celebrate the customers who leave 5-star praise</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Clock className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                  <span>Thank-you notes, e-gifts & reward automation — coming soon</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Clock className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                  <span>Slack reaction streaming — coming soon</span>
                </li>
              </ul>

              {/* Product-truth quote — no fabricated customer attribution */}
              <figure className="relative border-l-2 border-brand-600 py-2 pl-4 text-left mt-8 max-w-lg">
                <blockquote className="text-xs sm:text-sm text-gray-700 leading-relaxed">
                  <p>
                    <mark className="senja-yellow-mark">Your happiest customers are your best marketing</mark> — Panda Praise keeps every piece of their praise organized and ready to publish.
                  </p>
                </blockquote>
                <figcaption className="mt-2.5 text-[11px] font-semibold text-gray-500 uppercase tracking-wide">
                  Built into every plan
                </figcaption>
              </figure>
            </div>

          </div>
        </div>
      </section>

      {/* ── 10. "Built for you" Personas Section ── */}
      <section className="max-w-5xl mx-auto px-6 py-20 text-center border-t border-gray-200/80">
        <p className="text-xs font-semibold tracking-wider uppercase text-brand-600 mb-2">
          Built for you
        </p>
        <h2 className="mt-2 text-3xl sm:text-4xl font-bold text-slate-950 tracking-tight max-w-3xl mx-auto">
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
          <p className="text-xs font-semibold tracking-wider uppercase text-brand-600 mb-2">Got questions?</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-950 tracking-tight mt-1">
            Frequently Asked Questions
          </h2>
          <p className="text-sm sm:text-base text-gray-600 mt-2">
            Everything you need to know about collecting, organizing, and publishing verified proof.
          </p>
        </div>

        <MotionAccordion
          items={FAQ_ITEMS.map((item) => ({
            question: item.q,
            answer: item.a,
          }))}
          itemClassName="bg-white border border-gray-200/90 hover:border-brand-500/30 transition-colors shadow-xs"
        />
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

        {/* Rotating Circular Stamp (decorative — no fabricated counts) */}
        <div className="pointer-events-none absolute right-10 top-1/2 hidden -translate-y-1/2 text-white/80 lg:block" aria-hidden="true">
          <svg className="stamp-spin" width="140" height="140" viewBox="0 0 170 170" fill="none">
            <defs>
              <path id="stamp-circle-closing" d="M85,85 m-62,0 a62,62 0 1,1 124,0 a62,62 0 1,1 -124,0" />
            </defs>
            <circle cx="85" cy="85" r="80" stroke="currentColor" strokeWidth="2" />
            <circle cx="85" cy="85" r="44" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 6" />
            <text fontSize="12" fontWeight="600" letterSpacing="3" fill="currentColor">
              <textPath href="#stamp-circle-closing">✦ COLLECT • MODERATE • PUBLISH • </textPath>
            </text>
          </svg>
        </div>

        <div className="relative mx-auto max-w-3xl px-6">
          <p className="text-xs font-semibold tracking-wider uppercase text-purple-200 mb-2">Start in 2 minutes</p>
          <h2 className="mt-2 text-3xl sm:text-5xl font-bold text-white tracking-tight max-w-3xl mx-auto">
            Ready to boost your business with social proof?
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm sm:text-base text-white/90 leading-relaxed">
            Set up in minutes and discover how easy it is to collect, manage, and share the social proof that drives your business forward.
          </p>

          <ul className="mx-auto mt-6 inline-flex flex-col gap-2 text-left text-xs sm:text-sm text-white/90">
            <li className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-300" />
              <span>Collect authentic customer reviews on autopilot</span>
            </li>
            <li className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-300" />
              <span>Import existing reviews from CSV or connected platforms</span>
            </li>
            <li className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-300" />
              <span>Share proof on your website, sales pages, pitches, emails, & socials</span>
            </li>
          </ul>

          <div className="mt-8 flex items-center justify-center">
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
          </div>
        </div>
      </section>

      {/* ── 13. Comprehensive SaaS Footer (Clean Deduplicated 4-Column Structure) ── */}
      <footer ref={footerRef} id="landing-footer" className="bg-gray-50 border-t border-gray-200">
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
                <span className="font-bold text-xl sm:text-2xl tracking-tight text-slate-950">
                  Panda <span className="text-[#6701e6]">Praise</span>
                </span>
              </Link>
              <p className="mt-4 max-w-[14rem] text-sm leading-relaxed text-gray-600">
                Collect, manage and share testimonials in minutes.
              </p>
              <div className="mt-4">
                <Link
                  to="/signup"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#6701e6] text-white text-xs font-bold hover:bg-[#5400bd] transition-colors shadow-2xs"
                >
                  <span>Start for Free</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* 4 Clean Deduplicated Columns */}
            <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4 text-left">
              
              {/* Product */}
              <div>
                <h3 className="text-[11px] font-bold uppercase tracking-wider text-gray-900">Product</h3>
                <ul className="mt-4 space-y-2.5 text-sm text-gray-600">
                  <li><button onClick={() => scrollToSection('collect-section')} className="hover:text-gray-900 transition-colors text-left cursor-pointer">Collect Testimonials</button></li>
                  <li><button onClick={() => scrollToSection('find-section')} className="hover:text-gray-900 transition-colors text-left cursor-pointer">Search & Proof Vault</button></li>
                  <li><button onClick={() => scrollToSection('share-section')} className="hover:text-gray-900 transition-colors text-left cursor-pointer">Testimonial Widgets</button></li>
                  <li><button onClick={() => setIsWallModalOpen(true)} className="hover:text-gray-900 transition-colors text-left cursor-pointer">Wall of Love</button></li>
                  <li><Link to="/c/feedback" className="hover:text-gray-900 transition-colors">Live Collector Form</Link></li>
                </ul>
              </div>

              {/* Resources */}
              <div>
                <h3 className="text-[11px] font-bold uppercase tracking-wider text-gray-900">Resources</h3>
                <ul className="mt-4 space-y-2.5 text-sm text-gray-600">
                  <li><Link to="/pricing" className="hover:text-gray-900 transition-colors">Pricing & Plans</Link></li>
                  <li><Link to="/roadmap" className="hover:text-gray-900 transition-colors">Product Roadmap</Link></li>
                  <li><Link to="/blog" className="hover:text-gray-900 transition-colors">Blog & Guides</Link></li>
                  <li><button onClick={() => setIsWallModalOpen(true)} className="hover:text-gray-900 transition-colors text-left cursor-pointer">Live Wall of Love Demo</button></li>
                  <li><button onClick={() => scrollToSection('faq')} className="hover:text-gray-900 transition-colors text-left cursor-pointer">FAQ</button></li>
                </ul>
              </div>

              {/* Integrations */}
              <div>
                <h3 className="text-[11px] font-bold uppercase tracking-wider text-gray-900">Integrations</h3>
                <ul className="mt-4 space-y-2.5 text-sm text-gray-600">
                  <li><button onClick={() => scrollToSection('collect-section')} className="hover:text-gray-900 transition-colors text-left cursor-pointer">Google & Meta Reviews</button></li>
                  <li><button onClick={() => scrollToSection('collect-section')} className="hover:text-gray-900 transition-colors text-left cursor-pointer">CSV & Chat Screenshot Importer</button></li>
                  <li><button onClick={() => scrollToSection('share-section')} className="hover:text-gray-900 transition-colors text-left cursor-pointer">Shopify & HTML Embeds</button></li>
                  <li><button onClick={() => scrollToSection('share-section')} className="hover:text-gray-900 transition-colors text-left cursor-pointer">REST API & Webhooks</button></li>
                </ul>
              </div>

              {/* Account & Legal */}
              <div>
                <h3 className="text-[11px] font-bold uppercase tracking-wider text-gray-900">Account & Legal</h3>
                <ul className="mt-4 space-y-2.5 text-sm text-gray-600">
                  <li><Link to="/about" className="hover:text-gray-900 transition-colors">About Us</Link></li>
                  <li><Link to="/contact" className="hover:text-gray-900 transition-colors">Contact Support</Link></li>
                  <li><Link to="/terms" className="hover:text-gray-900 transition-colors">Terms of Service</Link></li>
                  <li><Link to="/privacy" className="hover:text-gray-900 transition-colors">Privacy Policy</Link></li>
                  <li><Link to="/refund-policy" className="hover:text-gray-900 transition-colors">Refund Policy</Link></li>
                </ul>
              </div>

            </div>
          </div>

          {/* Copyright and Legal Row */}
          <div className="mt-8 border-t border-gray-200/80 pt-6 flex flex-wrap items-center justify-between gap-4 text-xs text-gray-600 text-left">
            <span>© 2026 Panda Praise Ltd. All rights reserved.</span>
            <div className="flex flex-wrap items-center gap-5">
              <Link to="/about" className="hover:text-gray-900 transition-colors">About Us</Link>
              <Link to="/contact" className="hover:text-gray-900 transition-colors">Contact</Link>
              <Link to="/terms" className="hover:text-gray-900 transition-colors">Terms of Service</Link>
              <Link to="/privacy" className="hover:text-gray-900 transition-colors">Privacy Policy</Link>
              <Link to="/refund-policy" className="hover:text-gray-900 transition-colors">Refund Policy</Link>
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
          sampleLabel="Sample preview — not real Panda Praise customers"
        />
      )}

      {showSocialToast && (
        <SocialProofToast
          reviews={INITIAL_REVIEWS}
          position="bottom-left"
          onOpenWallOfLove={() => setIsWallModalOpen(true)}
          sampleLabel="Sample"
          hideWhenBlocked={isNearFooter}
        />
      )}
    </div>
  );
};
