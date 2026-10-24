import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Check,
  Play,
  ChevronDown,
  ChevronUp,
  Loader2,
  Sparkles,
  Sliders,
  Smartphone,
  Star,
} from 'lucide-react';
import { BeforeAfterVideoPlayer } from '../components/meta-ads/BeforeAfterVideoPlayer';
import { initiateV2Checkout } from '../services/razorpayService';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState<string | null>(null);

  // Workflow Loom simulation video player state
  const [isLoomPlaying, setIsLoomPlaying] = useState(false);

  // Memberstack-style interactive studio demo state
  const [activeStudioTab, setActiveStudioTab] = useState<'raw' | 'captions' | 'hooks' | 'meta5'>('meta5');
  const [selectedHook, setSelectedHook] = useState<'pocket' | 'complaint' | 'warning'>('pocket');
  const [captionStyle, setCaptionStyle] = useState<'hormozi' | 'clean' | 'neon'>('hormozi');
  const [aspectRatio, setAspectRatio] = useState<'9:16' | '4:5' | '1:1'>('9:16');

  // "I want to..." interactive dropdown state
  const [isIntentOpen, setIsIntentOpen] = useState(false);
  const [intentText, setIntentText] = useState('turn WhatsApp videos into Meta Ads');

  const handleRazorpayBuy = async (planId: 'pack_5' | 'monthly_growth') => {
    setIsProcessingPayment(true);
    setPaymentSuccess(null);
    try {
      const res = await initiateV2Checkout(planId, {
        companyName: 'D2C Merchant Store',
        email: 'merchant@store.in',
      });
      if (res.success) {
        setPaymentSuccess(`Payment received! Order ID: ${res.orderId}. Your 5 ads pack is activated.`);
        setTimeout(() => {
          navigate('/dashboard/studio');
        }, 1500);
      }
    } catch (err: any) {
      console.error('Payment error:', err);
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const FAQS = [
    {
      q: 'Is editing with AI?',
      a: 'No. Real customer face stays. We only add text, kinetic hooks, and 9:16 crops. Meta loves real human faces and actively penalizes synthetic AI avatars.',
    },
    {
      q: 'Do I need to give you WhatsApp?',
      a: 'Yes, we use the official WhatsApp Cloud API (~30 paise per message) or you can run our Day 1 Concierge MVP where Shopify alerts you and you send in 30 seconds.',
    },
    {
      q: 'Can I edit in VN / CapCut for free?',
      a: 'Yes. But you won’t collect 20 customer videos a month manually without chasing. We automate collection on Day 7 post-delivery and return 5 Meta-ready ads in 24h.',
    },
    {
      q: 'What if customer video is shaky or has bad lighting?',
      a: 'That is exactly what sells on Reels. Raw + honest = instant trust. We clean background noise, add bold captions, and test 3 high-converting Indian hooks.',
    },
    {
      q: 'Do I get commercial rights to run Meta ads?',
      a: 'Yes. Our automated Template 3 asks customer for explicit commercial ad release ("Reply YES to use as ad"). You get 100% legal rights to scale.',
    },
  ];

  const HOOK_TEXTS = {
    pocket: 'POV: Kurta with real pockets?? 🔥',
    complaint: '1 honest complaint about Flora roll-on... 🤐',
    warning: "Don't buy this before watching this ⚠️",
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans antialiased selection:bg-[#4353FF]/15 selection:text-[#4353FF]">
      
      {/* ── TOP NOTIFICATION BANNER ── */}
      {paymentSuccess && (
        <div className="bg-emerald-600 text-white text-xs font-bold py-2.5 px-4 text-center sticky top-0 z-50 shadow-md">
          {paymentSuccess}
        </div>
      )}

      {/* ── MEMBERSTACK-STYLE FLOATING NAVBAR ── */}
      <header className="sticky top-4 z-40 px-4 sm:px-6">
        <nav className="mx-auto max-w-7xl bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200/80 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.06)] px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 shrink-0 group">
            <span className="text-2xl group-hover:scale-110 transition-transform">🐼</span>
            <div className="flex flex-col">
              <span className="text-lg font-black tracking-tight text-slate-950 flex items-center gap-1.5">
                PandaPraise
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-200/60">
                  D2C UGC
                </span>
              </span>
            </div>
          </Link>

          {/* Memberstack "I want to..." Guided Selector (Desktop) */}
          <div className="hidden lg:flex items-center justify-center flex-1 min-w-0">
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsIntentOpen(!isIntentOpen)}
                className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50/80 hover:bg-white hover:border-[#4353FF]/40 px-4 py-2 text-xs font-semibold text-slate-700 transition-all shadow-xs cursor-pointer"
              >
                <span className="text-slate-400 font-medium">I want to</span>
                <span className="text-[#4353FF] font-bold underline decoration-[#4353FF]/30 underline-offset-2">
                  {intentText}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {isIntentOpen && (
                <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 w-80 bg-white rounded-2xl border border-slate-200 shadow-2xl p-2 z-50 text-xs space-y-1">
                  {[
                    { label: 'turn WhatsApp videos into Meta Ads', action: () => scrollTo('demo-player') },
                    { label: 'see live ads running on Instagram', action: () => scrollTo('live-ads') },
                    { label: 'connect my Shopify store in 10 mins', action: () => navigate('/dashboard/shopify-whatsapp') },
                    { label: 'compare pricing (Starter ₹1,500)', action: () => scrollTo('pricing') },
                    { label: 'read why VN / CapCut is too slow', action: () => scrollTo('why-not-vn') },
                  ].map((item, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setIntentText(item.label);
                        setIsIntentOpen(false);
                        item.action();
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-50 text-slate-700 font-medium hover:text-[#4353FF] transition flex items-center justify-between cursor-pointer"
                    >
                      <span>{item.label}</span>
                      <ArrowRight className="w-3 h-3 text-slate-400" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-600">
            <button onClick={() => scrollTo('how-it-works')} className="hover:text-slate-950 transition cursor-pointer">
              How it works
            </button>
            <button onClick={() => scrollTo('demo-player')} className="hover:text-slate-950 transition cursor-pointer">
              Demo
            </button>
            <button onClick={() => scrollTo('why-not-vn')} className="hover:text-slate-950 transition cursor-pointer">
              Why not VN?
            </button>
            <button onClick={() => scrollTo('pricing')} className="hover:text-slate-950 transition cursor-pointer">
              Pricing
            </button>
            <Link to="/dashboard/ads" className="hover:text-slate-950 transition">
              Ad Library
            </Link>
          </div>

          {/* CTA Group */}
          <div className="flex items-center gap-3 shrink-0">
            <Link
              to="/login"
              className="hidden sm:inline-flex text-xs font-bold text-slate-700 hover:text-slate-950 px-2 py-1.5"
            >
              Sign In
            </Link>
            <button
              type="button"
              disabled={isProcessingPayment}
              onClick={() => handleRazorpayBuy('pack_5')}
              className="px-4 sm:px-5 py-2.5 rounded-xl bg-[#4353FF] hover:bg-[#3444ED] disabled:opacity-50 text-white font-bold text-xs sm:text-sm shadow-md shadow-[#4353FF]/20 hover:shadow-lg hover:shadow-[#4353FF]/30 transition-all flex items-center gap-2 cursor-pointer group"
            >
              {isProcessingPayment ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Loading...</span>
                </>
              ) : (
                <>
                  <span>Get 5 Ads for ₹1,500</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </>
              )}
            </button>
          </div>
        </nav>
      </header>

      {/* ── HERO SECTION WITH MEMBERSTACK GEOMETRIC GRID ── */}
      <section className="relative overflow-hidden pt-12 pb-20 sm:pt-20 sm:pb-28 border-b border-slate-100">
        
        {/* Memberstack Background Grid Pattern */}
        <div
          className="absolute inset-0 pointer-events-none opacity-60"
          style={{
            backgroundImage:
              'linear-gradient(to right, #F1F5F9 1px, transparent 1px), linear-gradient(to bottom, #F1F5F9 1px, transparent 1px)',
            backgroundSize: '4rem 4rem',
            maskImage: 'radial-gradient(ellipse 70% 60% at 50% 10%, #000 60%, transparent 100%)',
            WebkitMaskImage: 'radial-gradient(ellipse 70% 60% at 50% 10%, #000 60%, transparent 100%)',
          }}
        />

        <div className="relative max-w-6xl mx-auto px-6 text-center">
          
          {/* Top Metric Badges (Memberstack Style) */}
          <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3 mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-slate-200/80 text-xs font-semibold text-slate-700 shadow-xs">
              <span className="w-2 h-2 rounded-full bg-[#1877F2]"></span>
              <span>Meta Ads</span>
              <span className="text-emerald-600 font-black">2.4x Higher CTR</span>
              <span className="text-slate-400">vs AI UGC</span>
            </div>

            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-slate-200/80 text-xs font-semibold text-slate-700 shadow-xs">
              <span className="w-2 h-2 rounded-full bg-[#95BF47]"></span>
              <span>Shopify D2C</span>
              <span className="text-slate-950 font-bold">₹2L+/mo Brands</span>
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-slate-200/80 text-xs font-semibold text-slate-700 shadow-xs">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span className="font-bold text-slate-950">4.9 / 5</span>
              <span className="text-slate-400">Indian D2C</span>
            </div>
          </div>

          {/* Main H1 & H2 Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-slate-950 leading-[1.08] max-w-4xl mx-auto">
            Your customers already made your best ad.
          </h1>
          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight text-[#4353FF] mt-4 leading-tight">
            You just have it lost on WhatsApp.
          </h2>

          {/* Subtitle */}
          <p className="mt-6 text-base sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Turn real WhatsApp video reviews into Meta-ready UGC ads in 24 hours. No actors. No studios. Just captions, hooks, and crops that actually sell on Indian Shopify.
          </p>

          {/* Dual CTAs (Memberstack Button Aesthetics) */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/dashboard/studio"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-[#4353FF] hover:bg-[#3444ED] text-white font-extrabold text-base shadow-xl shadow-[#4353FF]/20 hover:shadow-2xl hover:shadow-[#4353FF]/30 transition-all flex items-center justify-center gap-2.5 cursor-pointer group"
            >
              <span>Upload a WhatsApp Video — See Demo Ad</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>

            <button
              type="button"
              onClick={() => scrollTo('live-ads')}
              className="w-full sm:w-auto px-7 py-4 rounded-2xl border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-slate-800 font-bold text-base transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
            >
              <span>See Live Ads Running Now →</span>
            </button>
          </div>

          {/* Trust Checkmarks Row */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs font-semibold text-slate-500">
            <div className="flex items-center gap-1.5 text-slate-700">
              <Check className="w-4 h-4 text-emerald-500" />
              Day 7 Automated WhatsApp Trigger
            </div>
            <div className="flex items-center gap-1.5 text-slate-700">
              <Check className="w-4 h-4 text-emerald-500" />
              5 Meta-Ready Ads in 24 Hours
            </div>
            <div className="flex items-center gap-1.5 text-slate-700">
              <Check className="w-4 h-4 text-emerald-500" />
              100% Commercial UGC Rights Release
            </div>
          </div>

          {/* ── MEMBERSTACK-SIGNATURE INTERACTIVE PRODUCT SHOWCASE ── */}
          <div className="mt-14 max-w-5xl mx-auto">
            <div className="rounded-3xl border border-slate-200/90 bg-white p-3 sm:p-5 shadow-2xl shadow-slate-900/10 flex flex-col lg:flex-row gap-6 items-stretch text-left">
              
              {/* Left Column: Browser Frame with Interactive Tabs */}
              <div className="flex-1 min-w-0 rounded-2xl border border-slate-200 bg-slate-950 overflow-hidden flex flex-col shadow-inner">
                
                {/* Browser Title Bar */}
                <div className="px-4 py-3 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-[#FF5F57]"></span>
                    <span className="w-3 h-3 rounded-full bg-[#FFBD2E]"></span>
                    <span className="w-3 h-3 rounded-full bg-[#28CA41]"></span>
                    <span className="text-slate-400 font-mono ml-2 text-[11px] hidden sm:inline">
                      pandapraise.com/d2c/flora-rollon-meta-ad
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-[#4353FF]/20 text-[#4353FF] font-bold text-[10px] border border-[#4353FF]/30">
                    Live Engine
                  </span>
                </div>

                {/* 4 Step Switcher Tabs (Memberstack Demo Style) */}
                <div className="grid grid-cols-4 border-b border-slate-800 bg-slate-900/40 text-[11px] font-semibold">
                  {[
                    { id: 'raw', label: '1. Raw Video' },
                    { id: 'captions', label: '2. Hormozi' },
                    { id: 'hooks', label: '3. Hook Test' },
                    { id: 'meta5', label: '4. 5 Meta Ads' },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActiveStudioTab(tab.id as any)}
                      className={`py-2.5 px-2 text-center transition-colors cursor-pointer border-b-2 ${
                        activeStudioTab === tab.id
                          ? 'border-[#4353FF] text-white bg-slate-850 font-bold'
                          : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Interactive Player Screen */}
                <div className="relative aspect-video sm:aspect-[16/10] bg-slate-900 flex items-center justify-center overflow-hidden p-4">
                  {/* Background Video Demo */}
                  <video
                    src="/demo_meta_ad.mp4"
                    loop
                    muted
                    autoPlay
                    playsInline
                    className="absolute inset-0 w-full h-full object-cover opacity-85"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-slate-950/40 pointer-events-none" />

                  {/* Dynamic Overlays Based on Tabs */}
                  {activeStudioTab === 'raw' && (
                    <div className="relative z-10 p-4 rounded-2xl bg-black/75 backdrop-blur-md border border-white/10 max-w-xs text-center text-white">
                      <div className="w-8 h-8 rounded-full bg-slate-800 mx-auto flex items-center justify-center mb-2">
                        <Smartphone className="w-4 h-4 text-emerald-400" />
                      </div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                        Raw WhatsApp Inbound
                      </span>
                      <p className="text-xs font-medium text-slate-200 mt-1">
                        "Hey, received the Flora roll-on. The lavender fragrance is genuinely nice..."
                      </p>
                      <span className="inline-block mt-2 text-[10px] text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-full border border-amber-400/20">
                        19 sec vertical • Shaky • Uncut
                      </span>
                    </div>
                  )}

                  {activeStudioTab === 'captions' && (
                    <div className="relative z-10 text-center space-y-2">
                      <span className="text-[10px] uppercase font-black tracking-widest text-[#4353FF] bg-black/60 px-3 py-1 rounded-full border border-[#4353FF]/30">
                        Auto-Kinetic Text
                      </span>
                      <div className="text-xl sm:text-2xl font-black text-white drop-shadow-[0_4px_12px_rgba(0,0,0,0.9)] uppercase tracking-wide">
                        <span className="text-yellow-300">FRAGRANCE</span> LASTS 12 HOURS
                      </div>
                      <div className="text-sm font-bold text-slate-200 drop-shadow-md">
                        Zero aluminum • 100% natural
                      </div>
                    </div>
                  )}

                  {activeStudioTab === 'hooks' && (
                    <div className="relative z-10 w-full max-w-sm text-center">
                      <div className="bg-black/90 backdrop-blur-md text-white text-xs sm:text-sm font-black px-4 py-2.5 rounded-2xl border border-white/20 shadow-2xl">
                        {HOOK_TEXTS[selectedHook]}
                      </div>
                      <span className="inline-block mt-3 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                        Top 3 Second Retention +44%
                      </span>
                    </div>
                  )}

                  {activeStudioTab === 'meta5' && (
                    <div className="relative z-10 w-full max-w-md">
                      <div className="bg-black/80 backdrop-blur-md p-4 rounded-2xl border border-white/15 text-white space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-black text-white flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
                            5 Meta Ads Export Ready
                          </span>
                          <span className="px-2 py-0.5 rounded-full bg-emerald-500 text-slate-950 font-black text-[10px]">
                            2.42% CTR
                          </span>
                        </div>
                        <p className="text-xs text-slate-300 font-medium">
                          {HOOK_TEXTS[selectedHook]}
                        </p>
                        <div className="flex items-center gap-2 pt-1">
                          <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                            {aspectRatio}
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                            Hormozi Yellow
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                            Auto CTA
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer Bar */}
                <div className="px-4 py-2.5 bg-slate-900 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                  <span className="flex items-center gap-1.5 text-emerald-400 font-bold text-[11px]">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    24h Done-For-You Delivery
                  </span>
                  <span className="text-[11px] font-mono text-slate-400">
                    Ratio: {aspectRatio}
                  </span>
                </div>
              </div>

              {/* Right Column: Memberstack-Style Dark Inspector Sidebar */}
              <div className="w-full lg:w-80 rounded-2xl bg-[#1E293B] border border-slate-700/80 p-5 text-white flex flex-col justify-between shadow-xl">
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-700 pb-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                      <Sliders className="w-4 h-4 text-[#4353FF]" />
                      Ad Inspector
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-[#4353FF]/20 text-[#8B98FF] font-mono font-bold">
                      Interactive
                    </span>
                  </div>

                  {/* Hook Selector */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wide">
                      Select Hook Angle
                    </label>
                    <div className="space-y-1">
                      {[
                        { id: 'pocket', label: '1. POV Curious' },
                        { id: 'complaint', label: '2. 1 Honest Complaint' },
                        { id: 'warning', label: '3. Stop Scrolling Warning' },
                      ].map((h) => (
                        <button
                          key={h.id}
                          type="button"
                          onClick={() => {
                            setSelectedHook(h.id as any);
                            setActiveStudioTab('hooks');
                          }}
                          className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center justify-between ${
                            selectedHook === h.id
                              ? 'bg-[#4353FF] text-white shadow-sm'
                              : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300'
                          }`}
                        >
                          <span>{h.label}</span>
                          {selectedHook === h.id && <Check className="w-3.5 h-3.5" />}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Caption Typography */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wide">
                      Caption Style
                    </label>
                    <div className="grid grid-cols-3 gap-1.5">
                      {[
                        { id: 'hormozi', label: 'Hormozi' },
                        { id: 'clean', label: 'Sans' },
                        { id: 'neon', label: 'Neon' },
                      ].map((font) => (
                        <button
                          key={font.id}
                          type="button"
                          onClick={() => {
                            setCaptionStyle(font.id as any);
                            setActiveStudioTab('captions');
                          }}
                          className={`py-2 rounded-xl text-[11px] font-bold transition text-center cursor-pointer ${
                            captionStyle === font.id
                              ? 'bg-amber-400 text-slate-950'
                              : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300'
                          }`}
                        >
                          {font.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Aspect Ratio */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wide">
                      Export Aspect Ratio
                    </label>
                    <div className="grid grid-cols-3 gap-1.5">
                      {(['9:16', '4:5', '1:1'] as const).map((ratio) => (
                        <button
                          key={ratio}
                          type="button"
                          onClick={() => setAspectRatio(ratio)}
                          className={`py-2 rounded-xl text-[11px] font-mono font-bold transition text-center cursor-pointer ${
                            aspectRatio === ratio
                              ? 'bg-emerald-500 text-slate-950'
                              : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300'
                          }`}
                        >
                          {ratio}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-700/80">
                  <button
                    type="button"
                    onClick={() => handleRazorpayBuy('pack_5')}
                    className="w-full py-2.5 rounded-xl bg-[#4353FF] hover:bg-[#3444ED] text-white font-bold text-xs text-center transition cursor-pointer shadow-md"
                  >
                    Build 5 Ads from My Videos →
                  </button>
                </div>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* ── MEMBERSTACK-STYLE LOGO MARQUEE (INDIAN D2C BRANDS) ── */}
      <section className="py-12 bg-white border-b border-slate-100 overflow-hidden">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <p className="text-xs uppercase font-bold tracking-widest text-slate-400 mb-6">
            Converting 2.4x better for fast-growing Indian D2C stores
          </p>

          <div
            className="flex items-center justify-center gap-8 sm:gap-14 flex-wrap opacity-75 grayscale hover:grayscale-0 transition-all duration-300"
            style={{
              maskImage: 'linear-gradient(to right, transparent, black 15%, black 85%, transparent)',
              WebkitMaskImage: 'linear-gradient(to right, transparent, black 15%, black 85%, transparent)',
            }}
          >
            {[
              'Be Bodywise',
              'Man Matters',
              'Snitch',
              'Minimalist',
              'BlissClub',
              'Foxtale',
              'Mokobara',
            ].map((brand, i) => (
              <span
                key={i}
                className="text-base sm:text-lg font-black tracking-tighter text-slate-800 hover:text-[#4353FF] transition-colors"
              >
                {brand}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── SOCIAL PROOF BAR ── */}
      <section className="bg-slate-950 text-white py-10 border-b border-slate-800">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <p className="text-base sm:text-xl font-bold tracking-tight text-slate-200 leading-relaxed">
            “Real videos convert <span className="text-emerald-400 underline decoration-emerald-500 font-extrabold">2.4x better</span> than AI actors in India. We don't make fake UGC. We edit real ones.”
          </p>
        </div>
      </section>

      {/* ── HOW IT WORKS (3 COLUMNS) ── */}
      <section id="how-it-works" className="max-w-6xl mx-auto px-6 py-24">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-wider text-[#4353FF] bg-[#4353FF]/10 px-3 py-1 rounded-full border border-[#4353FF]/20">
            Simple 3-Step System
          </span>
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-slate-950 mt-3">
            How It Works
          </h2>
          <p className="text-slate-600 text-base mt-2">
            No chasing customers. No Google Drive links. Fully automated on Shopify.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Column 1: Connect */}
          <div className="p-8 rounded-3xl bg-white border border-slate-200 shadow-sm hover:shadow-xl transition-all flex flex-col justify-between group">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-[#4353FF]/10 text-[#4353FF] font-black text-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                1
              </div>
              <h3 className="text-2xl font-black text-slate-950">Connect</h3>
              <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                Link Shopify. We auto-trigger WhatsApp 7 days after delivery.
              </p>
            </div>
            <div className="mt-8 p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
              <p className="text-xs text-slate-700 italic">
                “Hey Anjali, loved your kurta? Send 20 sec video, get ₹100 off”
              </p>
            </div>
          </div>

          {/* Column 2: Collect */}
          <div className="p-8 rounded-3xl bg-white border border-slate-200 shadow-sm hover:shadow-xl transition-all flex flex-col justify-between group">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-[#4353FF]/10 text-[#4353FF] font-black text-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                2
              </div>
              <h3 className="text-2xl font-black text-slate-950">Collect</h3>
              <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                Videos land in your dashboard. No chasing. No Drive links. We follow up.
              </p>
            </div>
            <div className="mt-8 p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
              <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wide block">
                ✓ Auto-nudge active
              </span>
              <p className="text-xs text-slate-600 mt-0.5">
                48-hour polite WhatsApp reminder sent to unsubmitted reviews.
              </p>
            </div>
          </div>

          {/* Column 3: We Text-Edit */}
          <div className="p-8 rounded-3xl bg-white border border-slate-200 shadow-sm hover:shadow-xl transition-all flex flex-col justify-between group">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-[#4353FF]/10 text-[#4353FF] font-black text-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                3
              </div>
              <h3 className="text-2xl font-black text-slate-950">We Text-Edit</h3>
              <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                You get 5 ads: Hook + Big Captions + 9:16/1:1/4:5 + CTA.
              </p>
            </div>
            <div className="mt-8 p-4 rounded-2xl bg-[#4353FF] text-white shadow-md shadow-[#4353FF]/20">
              <span className="text-xs font-bold block">Ready for Meta Ads Manager</span>
              <p className="text-[11px] text-blue-100 mt-0.5">
                Download ZIP or push to Shopify Product Page in 1 click.
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* ── DEMO PLAYER (BEFORE VS AFTER SPLIT SCREEN) ── */}
      <section id="demo-player" className="py-24 bg-slate-900 text-white border-y border-slate-800">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <span className="text-xs font-bold uppercase tracking-wider text-[#8B98FF] bg-[#4353FF]/20 px-3 py-1 rounded-full border border-[#4353FF]/30">
            Interactive Split-Screen
          </span>
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight mt-3">
            See the Transformation
          </h2>
          <p className="text-slate-400 text-sm sm:text-base mt-2 max-w-xl mx-auto">
            Left: Raw WhatsApp video • Right: Same video with "POV: Kurta with real pockets??" + big Hormozi captions
          </p>

          <div className="mt-12">
            <BeforeAfterVideoPlayer />
          </div>
        </div>
      </section>

      {/* ── SCREEN RECORDING / LOOM DEMO SECTION (WhatsApp → Pipeline → Ad) ── */}
      <section className="py-20 bg-white border-b border-slate-100">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="rounded-3xl bg-slate-950 border border-slate-800 p-4 sm:p-6 shadow-2xl text-left">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-500/80"></span>
                <span className="w-3 h-3 rounded-full bg-amber-500/80"></span>
                <span className="w-3 h-3 rounded-full bg-emerald-500/80"></span>
                <span className="text-slate-400 font-mono ml-2 text-[11px] sm:text-xs">
                  Screen Demo: WhatsApp ➔ Engine ➔ Meta Ad in 24h
                </span>
              </div>
              <span className="text-emerald-400 font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[11px]">
                Loom Workflow
              </span>
            </div>

            <div className="relative mt-4 aspect-video bg-slate-900 rounded-2xl overflow-hidden flex items-center justify-center group">
              <video
                src="/demo_meta_ad.mp4"
                loop
                playsInline
                controls
                className="w-full h-full object-cover"
                onPlay={() => setIsLoomPlaying(true)}
                onPause={() => setIsLoomPlaying(false)}
              />
              {!isLoomPlaying && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center pointer-events-none">
                  <div className="w-16 h-16 rounded-full bg-[#4353FF] text-white flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
                    <Play className="w-6 h-6 fill-current ml-1" />
                  </div>
                </div>
              )}
            </div>
            <p className="mt-3 text-xs text-slate-400 text-center">
              Watch real screen workflow: Customer WhatsApp submission auto-burns 3 D2C hooks and exports in 9:16, 1:1, and 4:5.
            </p>
          </div>
        </div>
      </section>

      {/* ── 3 LIVE AD EXAMPLES (ADS RUNNING RIGHT NOW) ── */}
      <section id="live-ads" className="max-w-6xl mx-auto px-6 py-24">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            Live Library Showcase
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-950 tracking-tight mt-3">
            Ads running right now using real videos
          </h2>
          <p className="text-slate-600 text-sm mt-2">
            Real customer reviews running on Instagram Reels &amp; Facebook Feeds for Indian D2C stores.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Card 1 */}
          <div className="bg-slate-900 rounded-3xl p-5 text-white shadow-xl flex flex-col justify-between hover:-translate-y-1 transition-transform">
            <div className="relative aspect-[9/14] bg-black rounded-2xl overflow-hidden">
              <video src="/demo_meta_ad.mp4" loop muted autoPlay playsInline className="w-full h-full object-cover" />
              <div className="absolute top-3 left-3 right-3 bg-black/80 backdrop-blur-xs text-white text-[11px] font-extrabold px-3 py-1.5 rounded-xl border border-white/20 text-center">
                POV: Kurta with real pockets?? 🔥
              </div>
              <div className="absolute bottom-3 right-3 px-2 py-0.5 rounded-full bg-emerald-500 text-white font-bold text-[9px]">
                2.42% CTR
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between text-xs">
              <div>
                <p className="font-bold text-white">Linen Apparel Store</p>
                <p className="text-[11px] text-slate-400">Reel Ad (9:16)</p>
              </div>
              <span className="px-2 py-1 rounded-lg bg-slate-800 text-slate-300 font-mono text-[11px]">
                Meta Active
              </span>
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-slate-900 rounded-3xl p-5 text-white shadow-xl flex flex-col justify-between hover:-translate-y-1 transition-transform">
            <div className="relative aspect-[9/14] bg-black rounded-2xl overflow-hidden">
              <video src="/demo_meta_ad.mp4" loop muted autoPlay playsInline className="w-full h-full object-cover" />
              <div className="absolute top-3 left-3 right-3 bg-black/80 backdrop-blur-xs text-white text-[11px] font-extrabold px-3 py-1.5 rounded-xl border border-white/20 text-center">
                I wore this for 10 hours straight... 🤐
              </div>
              <div className="absolute bottom-3 right-3 px-2 py-0.5 rounded-full bg-emerald-500 text-white font-bold text-[9px]">
                2.15% CTR
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between text-xs">
              <div>
                <p className="font-bold text-white">Hair Pomade D2C</p>
                <p className="text-[11px] text-slate-400">Reel Ad (9:16)</p>
              </div>
              <span className="px-2 py-1 rounded-lg bg-slate-800 text-slate-300 font-mono text-[11px]">
                Meta Active
              </span>
            </div>
          </div>

          {/* Card 3 */}
          <div className="bg-slate-900 rounded-3xl p-5 text-white shadow-xl flex flex-col justify-between hover:-translate-y-1 transition-transform">
            <div className="relative aspect-[9/14] bg-black rounded-2xl overflow-hidden">
              <video src="/demo_meta_ad.mp4" loop muted autoPlay playsInline className="w-full h-full object-cover" />
              <div className="absolute top-3 left-3 right-3 bg-black/80 backdrop-blur-xs text-white text-[11px] font-extrabold px-3 py-1.5 rounded-xl border border-white/20 text-center">
                Don't buy this before watching this ⚠️
              </div>
              <div className="absolute bottom-3 right-3 px-2 py-0.5 rounded-full bg-emerald-500 text-white font-bold text-[9px]">
                2.68% CTR
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between text-xs">
              <div>
                <p className="font-bold text-white">Chanderi Silk Saree</p>
                <p className="text-[11px] text-slate-400">Reel Ad (9:16)</p>
              </div>
              <span className="px-2 py-1 rounded-lg bg-slate-800 text-slate-300 font-mono text-[11px]">
                Meta Active
              </span>
            </div>
          </div>
        </div>

        <div className="text-center mt-10">
          <Link
            to="/dashboard/ads"
            className="inline-flex items-center gap-2 text-sm font-bold text-[#4353FF] hover:underline"
          >
            <span>Open Adscriptly Creative Library to inspect all formats</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* ── WHY NOT VN / INVIDEO COMPARISON TABLE ── */}
      <section id="why-not-vn" className="py-24 bg-slate-50 border-y border-slate-200">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 bg-white px-3 py-1 rounded-full border border-slate-200">
              Honest Comparison
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-950 tracking-tight mt-3">
              Why not VN / InVideo?
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden text-sm">
              <thead>
                <tr className="bg-slate-100/70 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500">
                  <th className="py-4 px-6 font-bold text-slate-500">Feature</th>
                  <th className="py-4 px-6 font-bold text-slate-700">VN / CapCut / InVideo</th>
                  <th className="py-4 px-6 font-bold text-[#4353FF] bg-[#4353FF]/5">PandaPraise</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <td className="py-4 px-6 font-bold text-slate-800">Customer Sourcing</td>
                  <td className="py-4 px-6 text-slate-600">You chase customers on Instagram/Email</td>
                  <td className="py-4 px-6 font-bold text-[#4353FF] bg-[#4353FF]/5">We auto-collect via WhatsApp</td>
                </tr>
                <tr>
                  <td className="py-4 px-6 font-bold text-slate-800">Hook Strategy</td>
                  <td className="py-4 px-6 text-slate-600">You guess hooks manually</td>
                  <td className="py-4 px-6 font-bold text-[#4353FF] bg-[#4353FF]/5">We add 3 proven Indian hooks</td>
                </tr>
                <tr>
                  <td className="py-4 px-6 font-bold text-slate-800">Time Commitment</td>
                  <td className="py-4 px-6 text-slate-600">1 video = 45 mins editing</td>
                  <td className="py-4 px-6 font-bold text-[#4353FF] bg-[#4353FF]/5">5 ads = 24 hours, done-for-you</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ── PRICING SECTION (MEMBERSTACK AESTHETIC) ── */}
      <section id="pricing" className="max-w-6xl mx-auto px-6 py-24">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-wider text-[#4353FF] bg-[#4353FF]/10 px-3 py-1 rounded-full border border-[#4353FF]/20">
            Transparent INR Pricing
          </span>
          <h2 className="text-3xl sm:text-5xl font-black text-slate-950 tracking-tight mt-3">
            Pricing
          </h2>
          <p className="text-slate-600 text-sm sm:text-base mt-2">
            No subscription needed to try. Pay with Razorpay (UPI, Netbanking, Cards).
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          
          {/* Tier 1: Starter */}
          <div className="p-8 rounded-3xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between hover:shadow-lg transition-all">
            <div>
              <span className="text-xs font-bold uppercase text-slate-400 tracking-wider">Pay-As-You-Go</span>
              <h3 className="text-2xl font-black text-slate-900 mt-1">Starter</h3>
              <div className="mt-4 flex items-baseline gap-1.5">
                <span className="text-4xl font-black text-slate-950">₹1,500</span>
                <span className="text-xs text-slate-500 font-bold">one-time</span>
              </div>
              <ul className="mt-6 space-y-3 text-xs sm:text-sm text-slate-700 border-t border-slate-100 pt-6">
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#4353FF]" /> 5 Meta-ready ads from your videos</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#4353FF]" /> 24h delivery</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#4353FF]" /> All ratios (9:16, 1:1, 4:5)</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#4353FF]" /> GST Tax Invoice Included</li>
              </ul>
            </div>
            <button
              type="button"
              disabled={isProcessingPayment}
              onClick={() => handleRazorpayBuy('pack_5')}
              className="mt-8 w-full py-3.5 rounded-xl bg-slate-950 hover:bg-slate-800 disabled:opacity-50 text-white font-bold text-xs sm:text-sm text-center transition-all cursor-pointer shadow-sm"
            >
              Pay ₹1,500 with Razorpay
            </button>
          </div>

          {/* Tier 2: Growth (Most Popular) */}
          <div className="p-8 rounded-3xl bg-gradient-to-b from-[#F5F7FF] to-white border-2 border-[#4353FF] shadow-xl flex flex-col justify-between relative hover:shadow-2xl transition-all">
            <span className="absolute -top-3.5 right-6 bg-[#4353FF] text-white text-[10px] font-black uppercase tracking-wider py-1 px-3.5 rounded-full shadow-md">
              Most Popular
            </span>
            <div>
              <span className="text-xs font-bold uppercase text-[#4353FF] tracking-wider">Automated Scale</span>
              <h3 className="text-2xl font-black text-slate-900 mt-1">Growth</h3>
              <div className="mt-4 flex items-baseline gap-1.5">
                <span className="text-4xl font-black text-slate-950">₹2,999</span>
                <span className="text-xs text-slate-500 font-bold">/ month</span>
              </div>
              <ul className="mt-6 space-y-3 text-xs sm:text-sm text-slate-700 border-t border-blue-100 pt-6">
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#4353FF]" /> <strong>20 ads / month</strong></li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#4353FF]" /> Auto WhatsApp collection</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#4353FF]" /> Hook performance tracker</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#4353FF]" /> 48h automated reminder drips</li>
              </ul>
            </div>
            <button
              type="button"
              disabled={isProcessingPayment}
              onClick={() => handleRazorpayBuy('monthly_growth')}
              className="mt-8 w-full py-3.5 rounded-xl bg-[#4353FF] hover:bg-[#3444ED] disabled:opacity-50 text-white font-bold text-xs sm:text-sm text-center transition-all cursor-pointer shadow-lg shadow-[#4353FF]/25"
            >
              Subscribe — ₹2,999/mo
            </button>
          </div>

          {/* Tier 3: Scale */}
          <div className="p-8 rounded-3xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between hover:shadow-lg transition-all">
            <div>
              <span className="text-xs font-bold uppercase text-slate-400 tracking-wider">Enterprise Volume</span>
              <h3 className="text-2xl font-black text-slate-900 mt-1">Scale</h3>
              <div className="mt-4 flex items-baseline gap-1.5">
                <span className="text-4xl font-black text-slate-950">₹6,999</span>
                <span className="text-xs text-slate-500 font-bold">/ month</span>
              </div>
              <ul className="mt-6 space-y-3 text-xs sm:text-sm text-slate-700 border-t border-slate-100 pt-6">
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#4353FF]" /> <strong>50 ads / month</strong></li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#4353FF]" /> WhatsApp API setup &amp; dedicated number</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#4353FF]" /> Direct Shopify Product page push</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#4353FF]" /> Dedicated Growth Strategist</li>
              </ul>
            </div>
            <button
              type="button"
              disabled={isProcessingPayment}
              onClick={() => handleRazorpayBuy('monthly_growth')}
              className="mt-8 w-full py-3.5 rounded-xl bg-slate-950 hover:bg-slate-800 disabled:opacity-50 text-white font-bold text-xs sm:text-sm text-center transition-all cursor-pointer shadow-sm"
            >
              Subscribe — ₹6,999/mo
            </button>
          </div>

        </div>

        <p className="mt-8 text-center text-xs text-slate-500 font-medium">
          [Pay with Razorpay] No subscription needed to try. 100% money-back guarantee if Meta disapproves ads.
        </p>
      </section>

      {/* ── FAQ SECTION ── */}
      <section id="faq" className="max-w-3xl mx-auto px-6 py-20 border-t border-slate-200">
        <div className="text-center mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-[#4353FF] bg-[#4353FF]/10 px-3 py-1 rounded-full border border-[#4353FF]/20">
            Got Questions?
          </span>
          <h2 className="text-3xl font-black text-slate-950 tracking-tight mt-3">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-4">
          {FAQS.map((item, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                className="border border-slate-200 rounded-2xl p-5 cursor-pointer hover:border-slate-300 transition-colors bg-white shadow-2xs"
                onClick={() => setOpenFaq(isOpen ? null : idx)}
              >
                <div className="flex items-center justify-between gap-4">
                  <h3 className="text-base font-bold text-slate-900">{item.q}</h3>
                  {isOpen ? <ChevronUp className="w-4 h-4 text-[#4353FF]" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                </div>
                {isOpen && (
                  <p className="mt-3 text-sm text-slate-600 leading-relaxed pt-2 border-t border-slate-100">
                    {item.a}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* ── FOOTER CTA (MEMBERSTACK HIGH-IMPACT CANVAS) ── */}
      <section className="relative overflow-hidden bg-slate-950 text-white py-24 px-6 text-center">
        
        {/* Subtle grid on footer */}
        <div
          className="absolute inset-0 pointer-events-none opacity-20"
          style={{
            backgroundImage:
              'linear-gradient(to right, #475569 1px, transparent 1px), linear-gradient(to bottom, #475569 1px, transparent 1px)',
            backgroundSize: '3rem 3rem',
          }}
        />

        <div className="relative max-w-3xl mx-auto">
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
            Stop paying ₹10k for fake UGC. Your real customers already did it for free.
          </h2>
          <p className="mt-4 text-slate-400 text-sm sm:text-base max-w-xl mx-auto">
            Get 5 Meta-ready ads from your existing WhatsApp customer videos in the next 24 hours.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              type="button"
              disabled={isProcessingPayment}
              onClick={() => handleRazorpayBuy('pack_5')}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-[#4353FF] hover:bg-[#3444ED] text-white font-extrabold text-base shadow-xl shadow-[#4353FF]/40 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <span>Get 5 Ads for ₹1,500 — Upload Now</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <Link
              to="/dashboard/shopify-whatsapp"
              className="w-full sm:w-auto px-6 py-4 rounded-2xl bg-slate-900 hover:bg-slate-850 text-slate-300 font-bold text-sm border border-slate-800 transition-colors"
            >
              View Shopify Setup
            </Link>
          </div>

          <div className="mt-12 pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
            <div className="flex items-center gap-2">
              <span>🐼 PandaPraise</span>
              <span>•</span>
              <span>Shopify WhatsApp to Meta Ads Pipeline</span>
            </div>
            <div className="flex items-center gap-4">
              <Link to="/privacy-policy" className="hover:text-slate-300">Privacy Policy</Link>
              <Link to="/terms" className="hover:text-slate-300">Terms of Service</Link>
              <Link to="/refund-policy" className="hover:text-slate-300">Refund Policy</Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

export default LandingPage;
