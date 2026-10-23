import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Check,
  Play,
  ChevronDown,
  ChevronUp,
  Loader2,
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
      a: 'No. Real customer face stays. We only add text. Meta loves real faces, bans AI actors.',
    },
    {
      q: 'Do I need to give you WhatsApp?',
      a: 'Yes, we use official WhatsApp Cloud API. 30 paise per message.',
    },
    {
      q: 'Can I edit in VN for free?',
      a: 'Yes. But you won’t collect 20 videos a month manually. We do.',
    },
    {
      q: 'What if customer video is bad quality?',
      a: 'That’s what sells. Shaky + real = trust. We fix audio, not authenticity.',
    },
  ];

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans antialiased selection:bg-purple-100 selection:text-purple-900">
      
      {/* ── TOP NOTIFICATION BANNER ── */}
      {paymentSuccess && (
        <div className="bg-emerald-600 text-white text-xs font-bold py-2.5 px-4 text-center sticky top-0 z-50">
          {paymentSuccess}
        </div>
      )}

      {/* ── NAVIGATION ── */}
      <header className="border-b border-slate-100 bg-white/95 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 text-xl font-black tracking-tight text-slate-950">
            <span className="text-2xl">🐼</span>
            <span>PandaPraise</span>
          </Link>

          {/* Nav Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600">
            <button onClick={() => scrollTo('how-it-works')} className="hover:text-slate-950 transition-colors cursor-pointer">
              How it works
            </button>
            <button onClick={() => scrollTo('demo-player')} className="hover:text-slate-950 transition-colors cursor-pointer">
              Demo
            </button>
            <button onClick={() => scrollTo('why-not-vn')} className="hover:text-slate-950 transition-colors cursor-pointer">
              Why not VN?
            </button>
            <button onClick={() => scrollTo('pricing')} className="hover:text-slate-950 transition-colors cursor-pointer">
              Pricing
            </button>
            <button onClick={() => scrollTo('faq')} className="hover:text-slate-950 transition-colors cursor-pointer">
              FAQ
            </button>
          </nav>

          {/* Primary CTA */}
          <div className="flex items-center gap-3">
            <Link
              to="/dashboard/ads"
              className="hidden sm:inline-flex text-xs font-bold text-slate-600 hover:text-slate-950 px-3 py-2"
            >
              Ad Library
            </Link>
            <button
              type="button"
              disabled={isProcessingPayment}
              onClick={() => handleRazorpayBuy('pack_5')}
              className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-bold text-xs sm:text-sm shadow-md shadow-purple-200 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              {isProcessingPayment ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Loading Razorpay...</span>
                </>
              ) : (
                <>
                  <span>Get 5 Ads for ₹1,500</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* ── HERO SECTION ── */}
      <section className="max-w-5xl mx-auto px-6 pt-16 sm:pt-24 pb-16 text-center">
        
        {/* Main H1 & H2 */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-slate-950 leading-[1.08] max-w-4xl mx-auto">
          Your customers already made your best ad.
        </h1>
        <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight text-purple-600 mt-4 leading-tight">
          You just have it lost on WhatsApp.
        </h2>

        {/* Hero Paragraph */}
        <p className="mt-6 text-base sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
          Turn real WhatsApp video reviews into Meta-ready UGC ads in 24 hours. No actors. No studios. Just captions, hooks, and crops that actually sell on Indian Shopify.
        </p>

        {/* CTA Button Group */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/dashboard/studio"
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-base shadow-xl shadow-purple-200 transition-all flex items-center justify-center gap-2 cursor-pointer group"
          >
            <span>Upload a WhatsApp Video — See Demo Ad</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>

          <Link
            to="/dashboard/ads"
            className="w-full sm:w-auto px-7 py-4 rounded-2xl border-2 border-slate-200 hover:border-slate-300 text-slate-800 font-bold text-base transition-colors flex items-center justify-center gap-2 cursor-pointer bg-white"
          >
            <span>See Live Ads Running Now →</span>
          </Link>
        </div>

        {/* Hero Quick Value Props */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs sm:text-sm font-semibold text-slate-500">
          <span className="flex items-center gap-1.5 text-slate-700">
            <span className="w-2 h-2 rounded-full bg-slate-400"></span>
            <strong>Before:</strong> Shaky 19 sec video on WhatsApp
          </span>
          <span className="text-slate-300">•</span>
          <span className="flex items-center gap-1.5 text-purple-700 font-bold">
            <span className="w-2 h-2 rounded-full bg-purple-600"></span>
            <strong>After:</strong> 9:16 Hormozi-captioned ad with 2.1% CTR
          </span>
        </div>

        {/* ── SCREEN RECORDING / LOOM DEMO SECTION (WhatsApp → Pipeline → Ad) ── */}
        <div className="mt-12 rounded-3xl bg-slate-950 border border-slate-800 p-4 sm:p-6 shadow-2xl text-left max-w-4xl mx-auto">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-500/80"></span>
              <span className="w-3 h-3 rounded-full bg-amber-500/80"></span>
              <span className="w-3 h-3 rounded-full bg-emerald-500/80"></span>
              <span className="text-slate-400 font-mono ml-2">Screen Demo: WhatsApp ➔ Engine ➔ Meta Ad in 24h</span>
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
                <div className="w-16 h-16 rounded-full bg-purple-600 text-white flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
                  <Play className="w-6 h-6 fill-current ml-1" />
                </div>
              </div>
            )}
          </div>
          <p className="mt-3 text-xs text-slate-400 text-center">
            Watch real screen workflow: Customer WhatsApp submission auto-burns 3 D2C hooks and exports in 9:16, 1:1, and 4:5.
          </p>
        </div>

      </section>

      {/* ── SOCIAL PROOF BAR ── */}
      <section className="bg-slate-950 text-white py-8 border-y border-slate-800">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <p className="text-base sm:text-xl font-bold tracking-tight text-slate-200">
            “Real videos convert <span className="text-emerald-400 underline decoration-emerald-500">2.4x better</span> than AI actors in India. We don't make fake UGC. We edit real ones.”
          </p>
        </div>
      </section>

      {/* ── HOW IT WORKS (3 COLUMNS) ── */}
      <section id="how-it-works" className="max-w-6xl mx-auto px-6 py-24">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-wider text-purple-600 bg-purple-50 px-3 py-1 rounded-full border border-purple-200">
            Simple 3-Step System
          </span>
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-slate-950 mt-3">
            How It Works
          </h2>
          <p className="text-slate-600 text-base mt-2">
            No chasing customers. No Google Drive links. Fully automated.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Column 1: Connect */}
          <div className="p-8 rounded-3xl bg-[#FAF7FF] border border-purple-200/80 flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-2xl bg-purple-600 text-white font-black text-base flex items-center justify-center mb-6 shadow-md shadow-purple-300">
                1
              </div>
              <h3 className="text-2xl font-black text-slate-950">Connect</h3>
              <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                Link Shopify. We auto-trigger WhatsApp 7 days after delivery.
              </p>
            </div>
            <div className="mt-8 p-4 rounded-2xl bg-white border border-purple-200/60 shadow-xs">
              <p className="text-xs text-slate-700 italic">
                “Hey Anjali, loved your kurta? Send 20 sec video, get ₹100 off”
              </p>
            </div>
          </div>

          {/* Column 2: Collect */}
          <div className="p-8 rounded-3xl bg-[#FAF7FF] border border-purple-200/80 flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-2xl bg-purple-600 text-white font-black text-base flex items-center justify-center mb-6 shadow-md shadow-purple-300">
                2
              </div>
              <h3 className="text-2xl font-black text-slate-950">Collect</h3>
              <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                Videos land in your dashboard. No chasing. No Drive links. We follow up.
              </p>
            </div>
            <div className="mt-8 p-4 rounded-2xl bg-white border border-purple-200/60 shadow-xs">
              <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wide block">
                ✓ Auto-nudge active
              </span>
              <p className="text-xs text-slate-600 mt-0.5">
                48-hour polite WhatsApp reminder sent to unsubmitted reviews.
              </p>
            </div>
          </div>

          {/* Column 3: We Text-Edit */}
          <div className="p-8 rounded-3xl bg-[#FAF7FF] border border-purple-200/80 flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-2xl bg-purple-600 text-white font-black text-base flex items-center justify-center mb-6 shadow-md shadow-purple-300">
                3
              </div>
              <h3 className="text-2xl font-black text-slate-950">We Text-Edit</h3>
              <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                You get 5 ads: Hook + Big Captions + 9:16/1:1/4:5 + CTA.
              </p>
            </div>
            <div className="mt-8 p-4 rounded-2xl bg-purple-600 text-white shadow-md">
              <span className="text-xs font-bold block">Ready for Meta Ads Manager</span>
              <p className="text-[11px] text-purple-100 mt-0.5">
                Download ZIP or push to Shopify Product Page in 1 click.
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* ── DEMO PLAYER (SPLIT SCREEN) ── */}
      <section id="demo-player" className="py-20 bg-slate-900 text-white border-y border-slate-800">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <span className="text-xs font-bold uppercase tracking-wider text-purple-400 bg-purple-500/10 px-3 py-1 rounded-full border border-purple-500/30">
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

      {/* ── 3 LIVE AD EXAMPLES (ADS RUNNING RIGHT NOW) ── */}
      <section className="max-w-6xl mx-auto px-6 py-24">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            Live Library Showcase
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-950 tracking-tight mt-3">
            Ads running right now using real videos
          </h2>
          <p className="text-slate-600 text-sm mt-2">
            Real customer reviews running on Instagram Reels & Facebook Feeds for Indian D2C stores.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Card 1 */}
          <div className="bg-slate-900 rounded-3xl p-5 text-white shadow-xl flex flex-col justify-between">
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
          <div className="bg-slate-900 rounded-3xl p-5 text-white shadow-xl flex flex-col justify-between">
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
          <div className="bg-slate-900 rounded-3xl p-5 text-white shadow-xl flex flex-col justify-between">
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
            className="inline-flex items-center gap-2 text-sm font-bold text-purple-600 hover:text-purple-700 underline"
          >
            <span>Open Adscriptly Creative Library to inspect all formats</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* ── WHY NOT VN / INVIDEO COMPARISON TABLE ── */}
      <section id="why-not-vn" className="py-20 bg-slate-50 border-y border-slate-200">
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
                  <th className="py-4 px-6 font-bold text-purple-700 bg-purple-50/50">PandaPraise</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <td className="py-4 px-6 font-bold text-slate-800">Customer Sourcing</td>
                  <td className="py-4 px-6 text-slate-600">You chase customers on Instagram/Email</td>
                  <td className="py-4 px-6 font-bold text-purple-700 bg-purple-50/30">We auto-collect via WhatsApp</td>
                </tr>
                <tr>
                  <td className="py-4 px-6 font-bold text-slate-800">Hook Strategy</td>
                  <td className="py-4 px-6 text-slate-600">You guess hooks manually</td>
                  <td className="py-4 px-6 font-bold text-purple-700 bg-purple-50/30">We add 3 proven Indian hooks</td>
                </tr>
                <tr>
                  <td className="py-4 px-6 font-bold text-slate-800">Time Commitment</td>
                  <td className="py-4 px-6 text-slate-600">1 video = 45 mins editing</td>
                  <td className="py-4 px-6 font-bold text-purple-700 bg-purple-50/30">5 ads = 24 hours, done-for-you</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ── PRICING SECTION ── */}
      <section id="pricing" className="max-w-6xl mx-auto px-6 py-24">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-wider text-purple-600 bg-purple-50 px-3 py-1 rounded-full border border-purple-200">
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
          <div className="p-8 rounded-3xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold uppercase text-slate-400 tracking-wider">Pay-As-You-Go</span>
              <h3 className="text-2xl font-black text-slate-900 mt-1">Starter</h3>
              <div className="mt-4 flex items-baseline gap-1.5">
                <span className="text-4xl font-black text-slate-950">₹1,500</span>
                <span className="text-xs text-slate-500 font-bold">one-time</span>
              </div>
              <ul className="mt-6 space-y-3 text-xs sm:text-sm text-slate-700 border-t border-slate-100 pt-6">
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-purple-600" /> 5 Meta-ready ads from your videos</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-purple-600" /> 24h delivery</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-purple-600" /> All ratios (9:16, 1:1, 4:5)</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-purple-600" /> GST Tax Invoice Included</li>
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
          <div className="p-8 rounded-3xl bg-gradient-to-b from-[#FAF7FF] to-white border-2 border-purple-600 shadow-xl flex flex-col justify-between relative">
            <span className="absolute -top-3 right-6 bg-purple-600 text-white text-[10px] font-black uppercase tracking-wider py-1 px-3 rounded-full shadow-md">
              Most Popular
            </span>
            <div>
              <span className="text-xs font-bold uppercase text-purple-700 tracking-wider">Automated Scale</span>
              <h3 className="text-2xl font-black text-slate-900 mt-1">Growth</h3>
              <div className="mt-4 flex items-baseline gap-1.5">
                <span className="text-4xl font-black text-slate-950">₹2,999</span>
                <span className="text-xs text-slate-500 font-bold">/ month</span>
              </div>
              <ul className="mt-6 space-y-3 text-xs sm:text-sm text-slate-700 border-t border-purple-100 pt-6">
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-purple-600" /> <strong>20 ads / month</strong></li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-purple-600" /> Auto WhatsApp collection</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-purple-600" /> Hook performance tracker</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-purple-600" /> 48h automated reminder drips</li>
              </ul>
            </div>
            <button
              type="button"
              disabled={isProcessingPayment}
              onClick={() => handleRazorpayBuy('monthly_growth')}
              className="mt-8 w-full py-3.5 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-bold text-xs sm:text-sm text-center transition-all cursor-pointer shadow-lg shadow-purple-200"
            >
              Subscribe — ₹2,999/mo
            </button>
          </div>

          {/* Tier 3: Scale */}
          <div className="p-8 rounded-3xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold uppercase text-slate-400 tracking-wider">Enterprise Volume</span>
              <h3 className="text-2xl font-black text-slate-900 mt-1">Scale</h3>
              <div className="mt-4 flex items-baseline gap-1.5">
                <span className="text-4xl font-black text-slate-950">₹6,999</span>
                <span className="text-xs text-slate-500 font-bold">/ month</span>
              </div>
              <ul className="mt-6 space-y-3 text-xs sm:text-sm text-slate-700 border-t border-slate-100 pt-6">
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-purple-600" /> <strong>50 ads / month</strong></li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-purple-600" /> WhatsApp API setup & dedicated number</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-purple-600" /> Direct Shopify Product page push</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-purple-600" /> Dedicated Growth Strategist</li>
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
          <span className="text-xs font-bold uppercase tracking-wider text-purple-600 bg-purple-50 px-3 py-1 rounded-full border border-purple-200">
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
                  {isOpen ? <ChevronUp className="w-4 h-4 text-purple-600" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
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

      {/* ── FOOTER CTA ── */}
      <section className="bg-slate-950 text-white py-24 px-6 text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
            Stop paying ₹10k for fake UGC. Your real customers already did it for free.
          </h2>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              type="button"
              disabled={isProcessingPayment}
              onClick={() => handleRazorpayBuy('pack_5')}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-base shadow-xl shadow-purple-900/40 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <span>Get 5 Ads for ₹1,500 — Upload Now</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <Link
              to="/dashboard/studio"
              className="w-full sm:w-auto px-6 py-4 rounded-2xl bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold text-sm border border-slate-800 transition-colors"
            >
              Open Studio First
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
