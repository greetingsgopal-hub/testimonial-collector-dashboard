import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Check,
  ChevronDown,
  ChevronUp,
  Loader2,
  CheckCircle2,
  MessageSquare,
  Sparkles,
  Smartphone,
} from 'lucide-react';
import { initiateV2Checkout } from '../services/razorpayService';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState<string | null>(null);

  // Dock-style product tabs
  const [activeTab, setActiveTab] = useState<'raw' | 'captions' | 'hooks' | 'meta5'>('meta5');
  const [activeHookIndex, setActiveHookIndex] = useState<number>(0);

  const HOOKS = [
    { title: 'POV: Kurta with real pockets?? 🔥', ctr: '2.42% CTR', badge: 'Curious Hook' },
    { title: '1 honest complaint about Flora roll-on... 🤐', ctr: '2.15% CTR', badge: 'Authentic Critique' },
    { title: "Don't buy this before watching this ⚠️", ctr: '2.68% CTR', badge: 'Pattern Interrupt' },
  ];

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
      q: 'Do I need to give you WhatsApp access?',
      a: 'Yes, we use the official WhatsApp Cloud API (~30 paise per message) or you can run our Day 1 Concierge MVP where Shopify alerts you and you send in 30 seconds.',
    },
    {
      q: 'Can I edit in VN / CapCut for free?',
      a: 'Yes. But you won’t collect 20 customer videos a month manually without chasing. We automate collection on Day 7 post-delivery and return 5 Meta-ready ads in 24 hours.',
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

  return (
    <div className="min-h-screen bg-[#faf9f7] text-[#121722] font-sans antialiased selection:bg-[#d5ecff] selection:text-[#0068f9]">
      
      {/* ── TOP NOTIFICATION BANNER ── */}
      {paymentSuccess && (
        <div className="bg-[#046645] text-white text-xs font-medium py-2.5 px-4 text-center sticky top-0 z-50">
          {paymentSuccess}
        </div>
      )}

      {/* ── DOCK TOP NAVIGATION BAR ── */}
      <header className="sticky top-0 z-40 bg-white border-b border-[#efefef]">
        <div className="max-w-[1200px] mx-auto px-6 h-18 flex items-center justify-between">
          
          {/* Logo Left */}
          <Link to="/" className="flex items-center gap-2.5 text-lg font-semibold tracking-tight text-[#121722]">
            <span className="text-2xl">🐼</span>
            <span className="font-bold">PandaPraise</span>
          </Link>

          {/* Nav Links Center */}
          <nav className="hidden md:flex items-center gap-8 text-[15px] font-medium text-[#121722]">
            <button onClick={() => scrollTo('how-it-works')} className="hover:text-[#0068f9] transition-colors cursor-pointer">
              How it works
            </button>
            <button onClick={() => scrollTo('demo')} className="hover:text-[#0068f9] transition-colors cursor-pointer">
              Transformation
            </button>
            <button onClick={() => scrollTo('metrics')} className="hover:text-[#0068f9] transition-colors cursor-pointer">
              Customers
            </button>
            <button onClick={() => scrollTo('why-not-vn')} className="hover:text-[#0068f9] transition-colors cursor-pointer">
              Why not VN?
            </button>
            <button onClick={() => scrollTo('pricing')} className="hover:text-[#0068f9] transition-colors cursor-pointer">
              Pricing
            </button>
            <button onClick={() => scrollTo('faq')} className="hover:text-[#0068f9] transition-colors cursor-pointer">
              FAQ
            </button>
          </nav>

          {/* Auth Actions Right */}
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="hidden sm:inline-flex text-[14px] font-medium text-[#121722] hover:text-[#0068f9] px-2.5 py-1.5 transition-colors"
            >
              Log in
            </Link>

            <Link
              to="/dashboard/shopify-whatsapp"
              className="hidden lg:inline-flex text-[14px] font-medium text-[#121722] bg-white border border-[#efefef] hover:border-[#d6e4f1] rounded-[48px] px-5 py-2.5 transition-colors"
            >
              Shopify Flow
            </Link>

            <button
              type="button"
              disabled={isProcessingPayment}
              onClick={() => handleRazorpayBuy('pack_5')}
              className="px-5 py-2.5 rounded-[48px] bg-[#0068f9] hover:bg-[#024bb1] disabled:opacity-50 text-white font-medium text-[14px] sm:text-[15px] transition-colors flex items-center gap-2 cursor-pointer"
            >
              {isProcessingPayment ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <span>Get 5 Ads for ₹1,500</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* ── HERO SECTION (DOCK CREAM TO BLUE GRADIENT) ── */}
      <section className="relative pt-20 pb-24 border-b border-[#efefef] bg-gradient-to-b from-[#faf9f7] via-[#faf9f7] to-[#d5ecff]/40">
        <div className="max-w-[1200px] mx-auto px-6 text-center">
          
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-[100px] bg-[#f4f0ff] border border-[#d6e4f1]/60 text-[13px] font-medium text-[#121722] mb-8">
            <span className="w-2 h-2 rounded-full bg-[#0068f9]"></span>
            <span>Meta-Ready UGC Pipeline</span>
            <span className="text-[#6736eb] font-semibold">2.4x Higher CTR</span>
          </div>

          {/* Display Headline (Dock 84px Display Type Style) */}
          <h1 className="text-4xl sm:text-6xl lg:text-[76px] font-semibold tracking-[-0.03em] text-[#121722] leading-[1.06] max-w-4xl mx-auto">
            Your customers already made your best ad.
          </h1>
          <h2 className="text-2xl sm:text-4xl lg:text-[50px] font-semibold tracking-[-0.025em] text-[#0068f9] mt-3 leading-[1.12]">
            You just haven't unlocked it yet.
          </h2>

          {/* Subtext (18px weight 400 #121722 max-width ~640px) */}
          <p className="mt-7 text-base sm:text-[18px] text-[#121722] max-w-[640px] mx-auto leading-[1.5] text-balance">
            Turn real WhatsApp video reviews into Meta-ready UGC ads in 24 hours. No actors. No studios. Just captions, hooks, and crops that actually sell on Indian Shopify.
          </p>

          {/* Paired CTAs: Ghost Button + Filled Cobalt Button */}
          <div className="mt-9 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/dashboard/studio"
              className="w-full sm:w-auto px-6 py-3.5 rounded-[48px] bg-[#0068f9] hover:bg-[#024bb1] text-white font-medium text-[15px] sm:text-[16px] transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-[0_1px_2px_rgba(0,104,249,0.15)]"
            >
              <span>Upload a WhatsApp Video — See Demo Ad</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <button
              type="button"
              onClick={() => scrollTo('demo')}
              className="w-full sm:w-auto px-6 py-3.5 rounded-[48px] bg-white hover:bg-[#fbfaf7] text-[#121722] font-medium text-[15px] sm:text-[16px] border border-[#efefef] hover:border-[#d6e4f1] transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>See Before / After Transformation</span>
            </button>
          </div>

          {/* Checklist / Step Items in Dock Style */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-[14px] text-[#121722]">
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 rounded-full bg-[#046645] flex items-center justify-center text-white text-[10px]">✓</span>
              <span>Day 7 Automated WhatsApp Trigger</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 rounded-full bg-[#046645] flex items-center justify-center text-white text-[10px]">✓</span>
              <span>5 Meta-Ready Ads in 24 Hours</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 rounded-full bg-[#046645] flex items-center justify-center text-white text-[10px]">✓</span>
              <span>100% Commercial UGC Rights Release</span>
            </div>
          </div>

          {/* ── DOCK PRODUCT FEATURE CARD (PURE LIGHT UI INTERFACE — NO 3D SCI-FI RENDERS) ── */}
          <div className="mt-16 max-w-[1040px] mx-auto text-left">
            
            {/* Dock Tab Bar (horizontal row, pill background for active tab) */}
            <div className="flex items-center justify-center gap-2 sm:gap-4 overflow-x-auto pb-4 mb-4">
              {[
                { id: 'raw', label: '1. WhatsApp Inbound' },
                { id: 'captions', label: '2. Hormozi Captions' },
                { id: 'hooks', label: '3. Tested Indian Hooks' },
                { id: 'meta5', label: '4. 5 Meta Formats' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-5 py-2.5 rounded-[48px] text-[15px] font-medium transition-colors cursor-pointer whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'bg-white text-[#121722] border border-[#efefef] shadow-[0_1px_1px_rgba(0,0,0,0.05)]'
                      : 'text-[#777c86] hover:text-[#121722]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Pure Product Interface Card (Clean White, 16px radius, hairline border, Dock micro-shadow) */}
            <div className="rounded-[16px] border border-[#efefef] bg-white p-6 sm:p-8 shadow-[rgba(0,0,0,0.04)_0px_20px_20px_-8px]">
              
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                {/* Left Side: Authentic WhatsApp Review Message Thread Card */}
                <div className="lg:col-span-6 rounded-[16px] bg-[#fbfaf7] border border-[#efefef] p-5 space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-[#efefef]">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-[#046645]/15 text-[#046645] flex items-center justify-center font-bold text-xs">
                        <MessageSquare className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-[13px] font-semibold text-[#121722] block">
                          WhatsApp Business Inbox
                        </span>
                        <span className="text-[11px] text-[#777c86]">Order #1042 • Ananya Kurta</span>
                      </div>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-[100px] bg-[#d5ecff] text-[#0068f9] text-[11px] font-medium">
                      Delivered + 7 Days
                    </span>
                  </div>

                  {/* Outbound Template Message */}
                  <div className="rounded-[12px] bg-white border border-[#efefef] p-3 text-[13px] text-[#121722] space-y-1">
                    <span className="text-[11px] text-[#777c86] block font-mono">Template: video_review_reward_7day</span>
                    <p className="leading-relaxed">
                      "Hey Anjali! 🐼 Your Chanderi Kurta was delivered 7 days back — how is it? Send a quick 20 sec video (1 acchi baat, 1 kharab baat) &amp; get ₹100 OFF your next order!"
                    </p>
                  </div>

                  {/* Inbound Customer Video Review Bubble */}
                  <div className="rounded-[12px] bg-[#f4f0ff] border border-[#d6e4f1] p-3.5 space-y-2">
                    <div className="flex items-center justify-between text-[12px]">
                      <span className="font-semibold text-[#6736eb] flex items-center gap-1.5">
                        <Smartphone className="w-3.5 h-3.5" />
                        Inbound Customer Video (0:19)
                      </span>
                      <span className="text-[#777c86] text-[11px]">Received 14:02</span>
                    </div>
                    <div className="p-2.5 bg-white rounded-[8px] border border-[#efefef] text-[12px] text-[#121722]">
                      <p className="font-medium text-[#121722]">
                        “Kurta fitting is very nice, fabric is pure cotton linen. Best thing is actual deep side pockets!”
                      </p>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-[#046645] font-medium pt-1">
                      <span>✓ Rights Released: "YES, USE AS AD ❤️"</span>
                      <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">₹100 Code Sent</span>
                    </div>
                  </div>
                </div>

                {/* Right Side: What PandaPraise Generates in 24 Hours */}
                <div className="lg:col-span-6 space-y-5">
                  <div>
                    <span className="text-[13px] font-semibold text-[#0068f9] uppercase tracking-[0.077em]">
                      24-Hour Done-For-You Pipeline
                    </span>
                    <h3 className="text-[24px] font-semibold text-[#121722] mt-1 leading-[1.3]">
                      5 Meta Ads ready to scale
                    </h3>
                    <p className="text-[15px] text-[#777c86] mt-2 leading-[1.56]">
                      We take that 19-second raw WhatsApp review and burn 3 pattern-interrupting hooks, apply word-by-word kinetic captions, and export all 3 Meta ratios.
                    </p>
                  </div>

                  {/* Hook selector buttons */}
                  <div className="space-y-2 pt-1">
                    <span className="text-[13px] font-medium text-[#777c86] block">
                      Active Hook Variations:
                    </span>
                    {HOOKS.map((hook, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setActiveHookIndex(idx)}
                        className={`w-full text-left p-3 rounded-[12px] border transition-colors cursor-pointer flex items-center justify-between text-[13px] ${
                          activeHookIndex === idx
                            ? 'bg-[#fbfaf7] border-[#0068f9] text-[#121722] font-semibold'
                            : 'bg-white border-[#efefef] text-[#777c86] hover:text-[#121722]'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-[#f4f0ff] text-[#0068f9] flex items-center justify-center text-[11px] font-bold">
                            {idx + 1}
                          </span>
                          <span>{hook.title}</span>
                        </div>
                        <span className="text-[#0068f9] font-medium text-[12px]">{hook.ctr}</span>
                      </button>
                    ))}
                  </div>

                  {/* Multi-Ratio Badges */}
                  <div className="p-3.5 rounded-[12px] bg-[#fbfaf7] border border-[#efefef] flex items-center justify-between text-[13px]">
                    <span className="text-[#777c86]">Deliverables:</span>
                    <div className="flex items-center gap-2 text-[12px] font-mono text-[#121722]">
                      <span className="px-2 py-0.5 rounded bg-white border border-[#efefef]">9:16 Reel</span>
                      <span className="px-2 py-0.5 rounded bg-white border border-[#efefef]">1:1 Feed</span>
                      <span className="px-2 py-0.5 rounded bg-white border border-[#efefef]">4:5 Carousel</span>
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => handleRazorpayBuy('pack_5')}
                      className="px-6 py-3 rounded-[48px] bg-[#0068f9] hover:bg-[#024bb1] text-white text-[14px] font-medium transition-colors cursor-pointer inline-flex items-center gap-2"
                    >
                      <span>Get 5 Ads for ₹1,500</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

              </div>

            </div>

          </div>

        </div>
      </section>

      {/* ── DOCK CUSTOMER STAT CARDS (SOCIAL PROOF) ── */}
      <section id="metrics" className="max-w-[1200px] mx-auto px-6 py-20">
        <div className="text-center max-w-xl mx-auto mb-14">
          <span className="text-[13px] font-semibold text-[#0068f9] uppercase tracking-[0.077em]">
            Real Results
          </span>
          <h2 className="text-[32px] sm:text-[40px] font-semibold text-[#121722] tracking-[-0.02em] mt-1 leading-[1.2]">
            Why Indian D2C stores stopped paying for actors
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Card 1 */}
          <div className="rounded-[16px] bg-[#fbfaf7] border border-[#efefef] p-6 shadow-[0_1px_1px_rgba(0,0,0,0.07)] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-[14px] font-medium text-[#777c86] pb-4 border-b border-[#efefef]">
                <span className="text-[#121722] font-semibold">Be Bodywise Store</span>
                <span>Flora Roll-on</span>
              </div>
              <div className="text-[44px] font-semibold text-[#0068f9] mt-6 tracking-tight leading-none">
                2.42% CTR
              </div>
              <p className="text-[15px] text-[#777c86] mt-3 leading-[1.56]">
                Real customer video outperformed studio-recorded ads by 2.4x on Meta Reels.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-[#efefef] text-[13px] font-medium text-[#046645] flex items-center gap-1.5">
              <span>✓ +110% ROAS improvement</span>
            </div>
          </div>

          {/* Card 2 */}
          <div className="rounded-[16px] bg-[#fbfaf7] border border-[#efefef] p-6 shadow-[0_1px_1px_rgba(0,0,0,0.07)] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-[14px] font-medium text-[#777c86] pb-4 border-b border-[#efefef]">
                <span className="text-[#121722] font-semibold">Ananya Apparel</span>
                <span>Chanderi Kurta</span>
              </div>
              <div className="text-[44px] font-semibold text-[#6736eb] mt-6 tracking-tight leading-none">
                40%+ Reply
              </div>
              <p className="text-[15px] text-[#777c86] mt-3 leading-[1.56]">
                Day 7 automated WhatsApp reminder with ₹100 discount coupon gets massive response without chasing.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-[#efefef] text-[13px] font-medium text-[#046645] flex items-center gap-1.5">
              <span>✓ Zero manual Google Drive links</span>
            </div>
          </div>

          {/* Card 3 */}
          <div className="rounded-[16px] bg-[#fbfaf7] border border-[#efefef] p-6 shadow-[0_1px_1px_rgba(0,0,0,0.07)] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-[14px] font-medium text-[#777c86] pb-4 border-b border-[#efefef]">
                <span className="text-[#121722] font-semibold">Minimalist Men</span>
                <span>Hair &amp; Beard D2C</span>
              </div>
              <div className="text-[44px] font-semibold text-[#0068f9] mt-6 tracking-tight leading-none">
                24 Hours
              </div>
              <p className="text-[15px] text-[#777c86] mt-3 leading-[1.56]">
                From raw WhatsApp video to 5 Meta-ready ads with hooks, subtitles, and all 3 aspect ratios.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-[#efefef] text-[13px] font-medium text-[#046645] flex items-center gap-1.5">
              <span>✓ Meta Ad Library ready</span>
            </div>
          </div>

        </div>
      </section>

      {/* ── HOW IT WORKS (3 DOCK FEATURE CARDS) ── */}
      <section id="how-it-works" className="max-w-[1200px] mx-auto px-6 py-20 border-t border-[#efefef]">
        <div className="text-center max-w-xl mx-auto mb-14">
          <span className="text-[13px] font-semibold text-[#0068f9] uppercase tracking-[0.077em]">
            Step-by-Step Flow
          </span>
          <h2 className="text-[32px] sm:text-[40px] font-semibold text-[#121722] tracking-[-0.02em] mt-1 leading-[1.2]">
            How PandaPraise Works
          </h2>
          <p className="text-[16px] text-[#777c86] mt-2">
            No chasing customers on Instagram. No Google Drive links. Fully automated on Shopify.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Card 1: Connect */}
          <div className="rounded-[16px] bg-white border border-[#efefef] p-6 shadow-[0_1px_1px_rgba(0,0,0,0.07)] flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-[60px] bg-[#f4f0ff] text-[#0068f9] font-semibold text-[15px] flex items-center justify-center mb-6">
                1
              </div>
              <h3 className="text-[20px] font-semibold text-[#121722]">Connect</h3>
              <p className="text-[15px] text-[#777c86] mt-2 leading-[1.56]">
                Link Shopify. We auto-trigger WhatsApp 7 days after delivery when customer has used the product.
              </p>
            </div>
            <div className="mt-8 p-3.5 rounded-[12px] bg-[#fbfaf7] border border-[#efefef] text-[13px] text-[#121722] italic">
              “Hey Anjali, loved your kurta? Send 20 sec video, get ₹100 off”
            </div>
          </div>

          {/* Card 2: Collect */}
          <div className="rounded-[16px] bg-white border border-[#efefef] p-6 shadow-[0_1px_1px_rgba(0,0,0,0.07)] flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-[60px] bg-[#f4f0ff] text-[#0068f9] font-semibold text-[15px] flex items-center justify-center mb-6">
                2
              </div>
              <h3 className="text-[20px] font-semibold text-[#121722]">Collect</h3>
              <p className="text-[15px] text-[#777c86] mt-2 leading-[1.56]">
                Videos land in your dashboard. No chasing. No Drive links. 48h automated nudge if they forget.
              </p>
            </div>
            <div className="mt-8 p-3.5 rounded-[12px] bg-[#fbfaf7] border border-[#efefef] text-[13px] text-[#046645] font-medium flex items-center gap-1.5">
              <span>✓ Auto-nudge active via WhatsApp Cloud API</span>
            </div>
          </div>

          {/* Card 3: Convert */}
          <div className="rounded-[16px] bg-white border border-[#efefef] p-6 shadow-[0_1px_1px_rgba(0,0,0,0.07)] flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-[60px] bg-[#f4f0ff] text-[#0068f9] font-semibold text-[15px] flex items-center justify-center mb-6">
                3
              </div>
              <h3 className="text-[20px] font-semibold text-[#121722]">We Text-Edit</h3>
              <p className="text-[15px] text-[#777c86] mt-2 leading-[1.56]">
                You get 5 Meta-ready ads: Hook + Big Captions + 9:16/1:1/4:5 + CTA in 24 hours.
              </p>
            </div>
            <div className="mt-8 p-3.5 rounded-[12px] bg-[#0068f9] text-white text-[13px] font-medium">
              Ready for Meta Ads Manager &amp; Shopify Product Page
            </div>
          </div>

        </div>
      </section>

      {/* ── BEFORE / AFTER SIDE-BY-SIDE TRANSFORMATION (PURE CLEAN DOCK INTERFACE) ── */}
      <section id="demo" className="py-20 bg-white border-y border-[#efefef]">
        <div className="max-w-[1200px] mx-auto px-6 text-center">
          <span className="text-[13px] font-semibold text-[#0068f9] uppercase tracking-[0.077em]">
            Side-By-Side Comparison
          </span>
          <h2 className="text-[32px] sm:text-[40px] font-semibold text-[#121722] tracking-[-0.02em] mt-1 leading-[1.2]">
            See the 24-Hour Transformation
          </h2>
          <p className="text-[16px] text-[#777c86] mt-2 max-w-lg mx-auto">
            What your customer sends on WhatsApp vs what we deliver back for Meta Ads Manager.
          </p>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
            
            {/* Left: What Customer Sends */}
            <div className="rounded-[16px] bg-[#fbfaf7] border border-[#efefef] p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#efefef]">
                <span className="text-[13px] font-semibold uppercase tracking-wider text-[#777c86]">
                  Raw WhatsApp Video (What Customer Sends)
                </span>
                <span className="px-2.5 py-0.5 rounded-[100px] bg-rose-50 text-rose-700 text-[11px] font-semibold border border-rose-200">
                  0.42% CTR
                </span>
              </div>
              <div className="p-4 rounded-[12px] bg-white border border-[#efefef] space-y-2">
                <span className="text-[11px] text-[#777c86] block font-mono">19-second raw recording</span>
                <p className="text-[14px] text-[#121722] leading-relaxed">
                  "Haanji, product accha hai, fitting mast hai. Maine kal shaam ko pehna tha..."
                </p>
              </div>
              <ul className="space-y-2 text-[13px] text-[#777c86] pt-1">
                <li className="flex items-center gap-2">✕ No hook in first 3 seconds (users swipe past)</li>
                <li className="flex items-center gap-2">✕ No captions (85% watch Reels with audio OFF)</li>
                <li className="flex items-center gap-2">✕ Wrong framing &amp; uneven room audio</li>
              </ul>
            </div>

            {/* Right: What PandaPraise Delivers */}
            <div className="rounded-[16px] bg-white border-2 border-[#0068f9] p-6 space-y-4 shadow-[rgba(0,0,0,0.04)_0px_20px_20px_-8px]">
              <div className="flex items-center justify-between pb-3 border-b border-[#efefef]">
                <span className="text-[13px] font-semibold uppercase tracking-wider text-[#0068f9] flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-[#0068f9]" />
                  PandaPraise Meta-Ready UGC Ad
                </span>
                <span className="px-2.5 py-0.5 rounded-[100px] bg-emerald-100 text-emerald-800 text-[11px] font-bold">
                  2.42% CTR (+466% ROAS)
                </span>
              </div>
              <div className="p-4 rounded-[12px] bg-[#fbfaf7] border border-[#efefef] space-y-2">
                <span className="text-[11px] font-bold text-[#0068f9] uppercase tracking-wide block">
                  Burned Hook: "POV: Kurta with real pockets?? 🔥"
                </span>
                <p className="text-[14px] font-bold text-[#121722] leading-relaxed">
                  "FITTING IS MAST. FABRIC IS PURE COTTON LINEN."
                </p>
                <span className="inline-block text-[11px] font-medium text-[#046645] bg-emerald-50 px-2 py-0.5 rounded">
                  End CTA: ₹100 OFF with code ANJALI100
                </span>
              </div>
              <ul className="space-y-2 text-[13px] text-[#121722] font-medium pt-1">
                <li className="flex items-center gap-2 text-[#046645]">
                  <CheckCircle2 className="w-4 h-4" /> 3 Indian D2C hooks tested for maximum thumb-stop
                </li>
                <li className="flex items-center gap-2 text-[#046645]">
                  <CheckCircle2 className="w-4 h-4" /> Word-by-word bold kinetic subtitles with yellow highlight
                </li>
                <li className="flex items-center gap-2 text-[#046645]">
                  <CheckCircle2 className="w-4 h-4" /> Delivered in 9:16 Reel, 1:1 Square, and 4:5 Feed
                </li>
              </ul>
            </div>

          </div>
        </div>
      </section>

      {/* ── WHY NOT VN / CAPCUT COMPARISON TABLE ── */}
      <section id="why-not-vn" className="py-20 bg-[#fbfaf7] border-y border-[#efefef]">
        <div className="max-w-[960px] mx-auto px-6">
          <div className="text-center mb-12">
            <span className="text-[13px] font-semibold text-[#0068f9] uppercase tracking-[0.077em]">
              Honest Comparison
            </span>
            <h2 className="text-[32px] sm:text-[40px] font-semibold text-[#121722] tracking-[-0.02em] mt-1 leading-[1.2]">
              Why not VN / CapCut / InVideo?
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse bg-white rounded-[16px] border border-[#efefef] shadow-[0_1px_1px_rgba(0,0,0,0.07)] overflow-hidden text-[15px]">
              <thead>
                <tr className="border-b border-[#efefef] text-[13px] uppercase tracking-[0.077em] text-[#777c86] bg-[#fbfaf7]">
                  <th className="py-4 px-6 font-semibold">Workflow</th>
                  <th className="py-4 px-6 font-semibold">VN / CapCut / Freelancers</th>
                  <th className="py-4 px-6 font-semibold text-[#0068f9] bg-[#d5ecff]/20">PandaPraise</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#efefef]">
                <tr>
                  <td className="py-4 px-6 font-medium text-[#121722]">Customer Sourcing</td>
                  <td className="py-4 px-6 text-[#777c86]">You chase customers manually on Instagram</td>
                  <td className="py-4 px-6 font-medium text-[#0068f9] bg-[#d5ecff]/10">We auto-collect via WhatsApp on Day 7</td>
                </tr>
                <tr>
                  <td className="py-4 px-6 font-medium text-[#121722]">Hook Strategy</td>
                  <td className="py-4 px-6 text-[#777c86]">You guess hooks and titles manually</td>
                  <td className="py-4 px-6 font-medium text-[#0068f9] bg-[#d5ecff]/10">We burn 3 proven Indian D2C hooks</td>
                </tr>
                <tr>
                  <td className="py-4 px-6 font-medium text-[#121722]">Time Commitment</td>
                  <td className="py-4 px-6 text-[#777c86]">1 video = 45 mins editing time</td>
                  <td className="py-4 px-6 font-medium text-[#0068f9] bg-[#d5ecff]/10">5 ads = 24 hours, completely done-for-you</td>
                </tr>
                <tr>
                  <td className="py-4 px-6 font-medium text-[#121722]">Commercial Release</td>
                  <td className="py-4 px-6 text-[#777c86]">No formal rights release proof</td>
                  <td className="py-4 px-6 font-medium text-[#0068f9] bg-[#d5ecff]/10">Template 3 captures explicit Meta ad consent</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ── PRICING SECTION (DOCK STYLE) ── */}
      <section id="pricing" className="max-w-[1200px] mx-auto px-6 py-24">
        <div className="text-center max-w-xl mx-auto mb-16">
          <span className="text-[13px] font-semibold text-[#0068f9] uppercase tracking-[0.077em]">
            Transparent Pricing
          </span>
          <h2 className="text-[32px] sm:text-[40px] font-semibold text-[#121722] tracking-[-0.02em] mt-1 leading-[1.2]">
            Start with 5 ads for ₹1,500
          </h2>
          <p className="text-[16px] text-[#777c86] mt-2">
            No subscription required to test. Pay with Razorpay (UPI, Netbanking, Cards).
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
          
          {/* Tier 1: Starter */}
          <div className="rounded-[16px] bg-white border border-[#efefef] p-7 shadow-[0_1px_1px_rgba(0,0,0,0.07)] flex flex-col justify-between">
            <div>
              <span className="text-[13px] font-semibold uppercase tracking-[0.077em] text-[#777c86]">Pay-As-You-Go</span>
              <h3 className="text-[24px] font-semibold text-[#121722] mt-1">Starter</h3>
              <div className="mt-4 flex items-baseline gap-1.5">
                <span className="text-[40px] font-semibold text-[#121722]">₹1,500</span>
                <span className="text-[13px] text-[#777c86] font-medium">one-time</span>
              </div>
              <ul className="mt-6 space-y-3 text-[14px] text-[#121722] border-t border-[#efefef] pt-6">
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#0068f9]" /> 5 Meta-ready ads from your videos</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#0068f9]" /> 24h delivery</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#0068f9]" /> All ratios (9:16, 1:1, 4:5)</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#0068f9]" /> GST Tax Invoice Included</li>
              </ul>
            </div>
            <button
              type="button"
              disabled={isProcessingPayment}
              onClick={() => handleRazorpayBuy('pack_5')}
              className="mt-8 w-full py-3 rounded-[48px] bg-white hover:bg-[#fbfaf7] text-[#121722] font-medium text-[15px] border border-[#efefef] hover:border-[#d6e4f1] transition-colors cursor-pointer text-center"
            >
              Pay ₹1,500 with Razorpay
            </button>
          </div>

          {/* Tier 2: Growth (Highlighted) */}
          <div className="rounded-[16px] bg-[#fbfaf7] border-2 border-[#0068f9] p-7 shadow-[rgba(0,0,0,0.04)_0px_20px_20px_-8px] flex flex-col justify-between relative">
            <span className="absolute -top-3.5 right-6 bg-[#0068f9] text-white text-[11px] font-medium py-1 px-3.5 rounded-[100px]">
              Most Popular
            </span>
            <div>
              <span className="text-[13px] font-semibold uppercase tracking-[0.077em] text-[#0068f9]">Automated Scale</span>
              <h3 className="text-[24px] font-semibold text-[#121722] mt-1">Growth</h3>
              <div className="mt-4 flex items-baseline gap-1.5">
                <span className="text-[40px] font-semibold text-[#121722]">₹2,999</span>
                <span className="text-[13px] text-[#777c86] font-medium">/ month</span>
              </div>
              <ul className="mt-6 space-y-3 text-[14px] text-[#121722] border-t border-[#efefef] pt-6">
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#0068f9]" /> <strong>20 ads / month</strong></li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#0068f9]" /> Auto WhatsApp collection</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#0068f9]" /> Hook performance tracker</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#0068f9]" /> 48h automated reminder drips</li>
              </ul>
            </div>
            <button
              type="button"
              disabled={isProcessingPayment}
              onClick={() => handleRazorpayBuy('monthly_growth')}
              className="mt-8 w-full py-3 rounded-[48px] bg-[#0068f9] hover:bg-[#024bb1] text-white font-medium text-[15px] transition-colors cursor-pointer text-center"
            >
              Subscribe — ₹2,999/mo
            </button>
          </div>

          {/* Tier 3: Scale */}
          <div className="rounded-[16px] bg-white border border-[#efefef] p-7 shadow-[0_1px_1px_rgba(0,0,0,0.07)] flex flex-col justify-between">
            <div>
              <span className="text-[13px] font-semibold uppercase tracking-[0.077em] text-[#777c86]">Volume</span>
              <h3 className="text-[24px] font-semibold text-[#121722] mt-1">Scale</h3>
              <div className="mt-4 flex items-baseline gap-1.5">
                <span className="text-[40px] font-semibold text-[#121722]">₹6,999</span>
                <span className="text-[13px] text-[#777c86] font-medium">/ month</span>
              </div>
              <ul className="mt-6 space-y-3 text-[14px] text-[#121722] border-t border-[#efefef] pt-6">
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#0068f9]" /> <strong>50 ads / month</strong></li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#0068f9]" /> Dedicated WhatsApp Cloud setup</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#0068f9]" /> Direct Shopify Product page push</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#0068f9]" /> Dedicated Growth Strategist</li>
              </ul>
            </div>
            <button
              type="button"
              disabled={isProcessingPayment}
              onClick={() => handleRazorpayBuy('monthly_growth')}
              className="mt-8 w-full py-3 rounded-[48px] bg-white hover:bg-[#fbfaf7] text-[#121722] font-medium text-[15px] border border-[#efefef] hover:border-[#d6e4f1] transition-colors cursor-pointer text-center"
            >
              Subscribe — ₹6,999/mo
            </button>
          </div>

        </div>
      </section>

      {/* ── FAQ ACCORDION ── */}
      <section id="faq" className="max-w-[760px] mx-auto px-6 py-20 border-t border-[#efefef]">
        <div className="text-center mb-12">
          <span className="text-[13px] font-semibold text-[#0068f9] uppercase tracking-[0.077em]">
            Common Questions
          </span>
          <h2 className="text-[32px] font-semibold text-[#121722] tracking-[-0.02em] mt-1">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-3">
          {FAQS.map((item, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                className="rounded-[16px] border border-[#efefef] p-5 cursor-pointer hover:border-[#d6e4f1] transition-colors bg-white shadow-[0_1px_1px_rgba(0,0,0,0.05)]"
                onClick={() => setOpenFaq(isOpen ? null : idx)}
              >
                <div className="flex items-center justify-between gap-4">
                  <h3 className="text-[16px] font-semibold text-[#121722]">{item.q}</h3>
                  {isOpen ? <ChevronUp className="w-4 h-4 text-[#0068f9]" /> : <ChevronDown className="w-4 h-4 text-[#777c86]" />}
                </div>
                {isOpen && (
                  <p className="mt-3 text-[15px] text-[#777c86] leading-[1.56] pt-2 border-t border-[#efefef]">
                    {item.a}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* ── DOCK SIGNATURE GRADIENT CTA BANNER ── */}
      <section className="relative overflow-hidden border-t border-[#efefef] py-24 px-6 text-center" style={{ background: 'linear-gradient(135deg, #faf9f7 0%, #c8dcf5 65%, #0068f9 100%)' }}>
        <div className="max-w-[800px] mx-auto">
          <span className="text-[13px] font-semibold uppercase tracking-[0.077em] text-[#0068f9] bg-white px-3.5 py-1.5 rounded-[100px] border border-[#efefef] inline-block mb-6 shadow-xs">
            Start This Weekend
          </span>
          <h2 className="text-3xl sm:text-[48px] font-semibold text-[#121722] tracking-[-0.03em] leading-[1.12]">
            Stop paying ₹10k for fake UGC. Your real customers already did it for free.
          </h2>
          <p className="mt-4 text-[16px] text-[#121722] max-w-lg mx-auto leading-[1.5]">
            Turn your existing WhatsApp customer videos into 5 high-converting Meta UGC ads within 24 hours.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              type="button"
              disabled={isProcessingPayment}
              onClick={() => handleRazorpayBuy('pack_5')}
              className="w-full sm:w-auto px-7 py-3.5 rounded-[48px] bg-[#0068f9] hover:bg-[#024bb1] text-white font-medium text-[16px] transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-[0_2px_8px_rgba(0,104,249,0.25)]"
            >
              <span>Get 5 Ads for ₹1,500</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <Link
              to="/dashboard/shopify-whatsapp"
              className="w-full sm:w-auto px-6 py-3.5 rounded-[48px] bg-white hover:bg-[#fbfaf7] text-[#121722] font-medium text-[16px] border border-[#efefef] transition-colors"
            >
              View Shopify Setup
            </Link>
          </div>
        </div>
      </section>

      {/* ── DOCK FOOTER (WHITE BACKGROUND, 1PX BORDER) ── */}
      <footer className="bg-white border-t border-[#efefef] py-16 px-6">
        <div className="max-w-[1200px] mx-auto">
          <div className="flex flex-col md:flex-row items-start justify-between gap-8 pb-12 border-b border-[#efefef]">
            <div>
              <Link to="/" className="flex items-center gap-2 text-lg font-bold text-[#121722]">
                <span className="text-2xl">🐼</span>
                <span>PandaPraise</span>
              </Link>
              <p className="text-[14px] text-[#777c86] mt-2 max-w-xs leading-[1.5]">
                Turn real WhatsApp customer reviews into high-converting Meta Ads for Indian Shopify brands.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 text-[14px]">
              <div>
                <span className="font-semibold text-[#121722] block mb-3">Product</span>
                <ul className="space-y-2 text-[#777c86]">
                  <li><button onClick={() => scrollTo('how-it-works')} className="hover:text-[#0068f9] cursor-pointer">How it works</button></li>
                  <li><button onClick={() => scrollTo('demo')} className="hover:text-[#0068f9] cursor-pointer">Transformation</button></li>
                  <li><Link to="/dashboard/ads" className="hover:text-[#0068f9]">Ad Library</Link></li>
                  <li><Link to="/dashboard/shopify-whatsapp" className="hover:text-[#0068f9]">Shopify Flow</Link></li>
                </ul>
              </div>

              <div>
                <span className="font-semibold text-[#121722] block mb-3">Plans</span>
                <ul className="space-y-2 text-[#777c86]">
                  <li><button onClick={() => scrollTo('pricing')} className="hover:text-[#0068f9] cursor-pointer">Starter ₹1,500</button></li>
                  <li><button onClick={() => scrollTo('pricing')} className="hover:text-[#0068f9] cursor-pointer">Growth ₹2,999/mo</button></li>
                  <li><button onClick={() => scrollTo('pricing')} className="hover:text-[#0068f9] cursor-pointer">Scale ₹6,999/mo</button></li>
                </ul>
              </div>

              <div>
                <span className="font-semibold text-[#121722] block mb-3">Legal</span>
                <ul className="space-y-2 text-[#777c86]">
                  <li><Link to="/privacy-policy" className="hover:text-[#0068f9]">Privacy Policy</Link></li>
                  <li><Link to="/terms" className="hover:text-[#0068f9]">Terms of Service</Link></li>
                  <li><Link to="/refund-policy" className="hover:text-[#0068f9]">Refund Policy</Link></li>
                </ul>
              </div>
            </div>
          </div>

          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-[13px] text-[#a5a5a5] gap-4">
            <p>© 2026 PandaPraise. All rights reserved.</p>
            <p>Built for Indian D2C Shopify Founders.</p>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default LandingPage;
