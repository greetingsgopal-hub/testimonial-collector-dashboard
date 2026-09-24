import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Check,
  ArrowRight,
  Code,
  Image as ImageIcon,
  Video as VideoIcon,
  Grid,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { usePageSeo } from '../lib/seo';
import { analytics } from '../lib/analytics';

export const OnboardingUpgradePage: React.FC = () => {
  usePageSeo({
    title: 'Share Testimonials in More Ways — Panda Praise',
    description: 'Explore hundreds of images, widgets, Walls of Love, and social videos you can create with Panda Praise.',
  });

  const navigate = useNavigate();
  const { user } = useAuth();

  // Active view: 'showcase' (matching the screenshot) or 'plans' (commercial pricing plans)
  const [viewMode, setViewMode] = useState<'showcase' | 'plans'>('showcase');
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('annual');

  // User initial for the 3rd overlapping circle in top header
  const userInitial = (user?.displayName || user?.email || 'G').charAt(0).toUpperCase();

  const handleContinueToDashboard = () => {
    analytics.signupCompleted();
    navigate('/dashboard');
  };

  const handleSelectPlan = (plan: 'free' | 'starter' | 'pro') => {
    analytics.ctaClicked(`select_plan_${plan}`, '/dashboard');
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-[#fafafa] text-gray-900 flex flex-col font-sans selection:bg-purple-500/20 selection:text-purple-900 pb-28">
      
      {/* ── 1. Top Ribbon with 3 Intersecting Circles (Screenshot Exact) ── */}
      <div className="h-20 sm:h-24 w-full bg-[#6701e6] relative">
        <div className="absolute left-1/2 -bottom-7 sm:-bottom-8 -translate-x-1/2 flex items-center justify-center">
          <div className="flex items-center">
            
            {/* Circle 1: Gray avatar silhouette */}
            <div className="w-13 h-13 sm:w-16 sm:h-16 rounded-full bg-gray-200 border-4 border-white shadow-md flex items-center justify-center text-gray-400 z-10">
              <svg className="w-7 h-7 sm:w-8 sm:h-8 fill-gray-400" viewBox="0 0 24 24">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
              </svg>
            </div>

            {/* Circle 2: White circle with purple heart */}
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white border-2 border-gray-100 shadow-md flex items-center justify-center text-[#6701e6] -ml-3 sm:-ml-4 z-20">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="#6701e6">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
            </div>

            {/* Circle 3: Dark circle with user's initial */}
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-black border-2 border-white shadow-md flex items-center justify-center text-white font-extrabold text-sm sm:text-base -ml-3 sm:-ml-4 z-30">
              {userInitial}
            </div>

          </div>
        </div>
      </div>

      {/* ── 2. Headline & Subheadline (Screenshot Exact) ── */}
      <div className="pt-12 sm:pt-14 px-4 sm:px-6 max-w-4xl mx-auto text-center">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold font-display text-gray-950 tracking-tight leading-snug">
          <span className="block">With Panda Praise, share your testimonials</span>
          <span className="block">in more ways than anywhere else!</span>
        </h1>
        <p className="text-sm sm:text-base text-gray-500 mt-3 max-w-3xl mx-auto leading-relaxed sm:whitespace-nowrap">
          Here are just a few of the widgets, social images, and Walls of Love you can create.
        </p>

        {/* View Switcher Pill (Showcase vs Commercial Plans) */}
        <div className="mt-6 inline-flex p-1 rounded-full bg-gray-200/80 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setViewMode('showcase')}
            className={`px-4 py-1.5 rounded-full transition-all cursor-pointer ${
              viewMode === 'showcase'
                ? 'bg-white text-gray-950 shadow-xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Showcase Formats
          </button>
          <button
            type="button"
            onClick={() => setViewMode('plans')}
            className={`px-4 py-1.5 rounded-full transition-all cursor-pointer ${
              viewMode === 'plans'
                ? 'bg-[#6701e6] text-white shadow-xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Compare Plans & Pricing
          </button>
        </div>
      </div>

      {/* ── 3. SHOWCASE VIEW (Matching Screenshot) ── */}
      {viewMode === 'showcase' && (
        <div className="mt-10 px-4 sm:px-6 max-w-6xl mx-auto w-full animate-fade-in">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-start">
            
            {/* ── Column 1: Card 1 (Denis Kulikov) + Card 2 (Widget Snippets) ── */}
            <div className="space-y-4">
              
              {/* Card 1: Denis Kulikov Dark Image Card */}
              <div className="rounded-2xl bg-[#1c1c1f] text-white p-5 border border-zinc-800 shadow-md relative overflow-hidden">
                <div className="flex justify-end mb-3">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/10 text-white/90 text-[11px] font-medium border border-white/15">
                    <ImageIcon className="w-3 h-3" /> Image
                  </span>
                </div>

                <div className="flex gap-3.5 items-start">
                  <img
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=160&auto=format&fit=crop&q=80"
                    alt="Denis Kulikov"
                    className="w-14 h-14 rounded-xl object-cover shrink-0 grayscale ring-1 ring-white/10"
                  />
                  <div>
                    <div className="flex text-amber-400 text-xs mb-1.5">★★★★★</div>
                    <p className="text-xs sm:text-[13px] leading-relaxed font-normal">
                      <mark className="bg-amber-300 text-zinc-950 px-1 py-0.5 rounded font-semibold">
                        Hands down the best testimonial tool for SaaS.
                      </mark>{' '}
                      We sell x2 more just because every landing page has a stunning wall of love.
                    </p>
                    <p className="text-[11px] text-zinc-400 mt-3 font-medium">Denis Kulikov</p>
                  </div>
                </div>

                {/* Bottom-right colorful retro starburst graphic */}
                <div className="absolute -bottom-2 -right-2 w-10 h-10 opacity-70 pointer-events-none">
                  <svg viewBox="0 0 40 40" fill="none">
                    <path d="M20 0L24 16L40 20L24 24L20 40L16 24L0 20L16 16L20 0Z" fill="#14b8a6"/>
                    <circle cx="20" cy="20" r="4" fill="#f59e0b"/>
                  </svg>
                </div>
              </div>

              {/* Card 2: Beatrice / Multi-Widget Card */}
              <div className="rounded-2xl bg-white p-4 border border-gray-200 shadow-xs relative">
                <div className="flex justify-end mb-3">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-700 text-[11px] font-medium border border-gray-200">
                    <Code className="w-3 h-3" /> Widget
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-100">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-5 h-5 rounded-full bg-emerald-500 text-white text-[9px] font-bold flex items-center justify-center">B</div>
                      <div>
                        <p className="text-[11px] font-bold text-gray-900 leading-none">Beatrice</p>
                        <p className="text-[9px] text-gray-400 leading-none mt-0.5">French private tutor maths & physics</p>
                      </div>
                    </div>
                    <div className="text-amber-400 text-[10px]">★★★★★</div>
                    <p className="text-[10px] text-gray-600 mt-1">
                      Before Panda Praise, I tested many testimonial aggregators. They were expensive, lacked flexibility. Support was non-responsive.
                    </p>
                  </div>

                  <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-100">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-5 h-5 rounded-full bg-purple-500 text-white text-[9px] font-bold flex items-center justify-center">A</div>
                      <div>
                        <p className="text-[11px] font-bold text-gray-900 leading-none">Alastair Dodge</p>
                        <p className="text-[9px] text-gray-400 leading-none mt-0.5">Founder of General English</p>
                      </div>
                    </div>
                    <div className="text-amber-400 text-[10px]">★★★★★</div>
                    <p className="text-[10px] text-gray-600 mt-1">
                      I previously managed all testimonials manually, and it was both a time-sink and meant I didn't collect nearly enough.
                    </p>
                  </div>
                </div>
              </div>

            </div>

            {/* ── Column 2: Card 3 (Mobile Widget Modal) + Card 4 (Wall of Love Bungee) ── */}
            <div className="space-y-4">
              
              {/* Card 3: Mobile Pop-up Widget */}
              <div className="rounded-2xl bg-white p-3.5 border border-gray-200 shadow-xs relative">
                <div className="flex justify-end mb-2">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-700 text-[11px] font-medium border border-gray-200">
                    <Code className="w-3 h-3" /> Widget
                  </span>
                </div>

                <div className="rounded-xl border border-gray-200 overflow-hidden bg-white shadow-xs">
                  {/* Purple top header */}
                  <div className="bg-[#6701e6] text-white p-3 text-center">
                    <p className="font-extrabold text-xs">Our Testimonials</p>
                    <p className="text-[10px] text-purple-200 mt-0.5">Our customers love us. Here's why you will too.</p>
                    <button className="mt-2 w-full py-1.5 bg-black text-white text-[11px] font-bold rounded-lg cursor-pointer">
                      Get started for free
                    </button>
                  </div>

                  {/* Body testimonial */}
                  <div className="p-3">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-gray-200 text-gray-600 text-[10px] font-bold flex items-center justify-center">LR</div>
                      <div>
                        <p className="text-[10px] font-bold text-gray-900 leading-none">Luc Rozman</p>
                        <p className="text-[8px] text-gray-400 leading-none mt-0.5">Creator of GrowthHackers</p>
                      </div>
                    </div>
                    <div className="text-amber-400 text-[9px] mt-1">★★★★★</div>
                    <p className="text-[9px] text-gray-600 mt-1 leading-snug">
                      Absolutely Panda Praise's biggest fan. This app is changing the game on getting social proof and making it so effortless on my side.
                    </p>
                    <div className="mt-3 pt-2 border-t border-gray-100 flex items-center justify-between text-[8px] text-gray-400">
                      <span>❤️ Made with Panda Praise</span>
                      <div className="w-5 h-5 rounded-full bg-black text-white flex items-center justify-center text-[9px]">❤</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 4: Wall of Love for Bungee */}
              <div className="rounded-2xl bg-[#6701e6] text-white p-4 border border-purple-400/30 shadow-md relative overflow-hidden">
                <div className="flex justify-end mb-2">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/15 text-white text-[11px] font-medium border border-white/20">
                    <Grid className="w-3 h-3" /> Wall of Love
                  </span>
                </div>

                <div className="flex items-start gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center shrink-0">
                    <div className="w-0 h-0 border-y-4 border-y-transparent border-l-6 border-l-white ml-0.5" />
                  </div>
                  <div>
                    <p className="font-extrabold text-sm leading-tight">Testimonials for Bungee</p>
                    <p className="text-[11px] text-white/80 mt-1">
                      We're loved by entrepreneurs, creators, freelancers and...
                    </p>
                  </div>
                </div>
              </div>

            </div>

            {/* ── Column 3: Card 5 (Michel Bardelmeijer Social Video with Retro Shapes) ── */}
            <div className="space-y-4">
              
              <div className="rounded-2xl p-4 shadow-md relative overflow-hidden border border-orange-200/50"
                   style={{
                     backgroundColor: '#f8fafc',
                     backgroundImage: 'radial-gradient(circle at 0% 0%, #fb923c 25%, transparent 26%), radial-gradient(circle at 100% 0%, #0284c7 25%, transparent 26%), radial-gradient(circle at 0% 100%, #14b8a6 25%, transparent 26%), radial-gradient(circle at 100% 100%, #f43f5e 25%, transparent 26%)',
                     backgroundSize: '40px 40px',
                   }}>
                
                <div className="flex justify-end mb-3 relative z-10">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/90 text-gray-800 text-[11px] font-bold shadow-xs border border-gray-200">
                    <VideoIcon className="w-3 h-3 text-purple-600" /> Social Video
                  </span>
                </div>

                {/* Overlaid Card */}
                <div className="bg-white rounded-xl p-4 shadow-lg border border-gray-200 relative z-10">
                  <div className="flex text-amber-500 text-xs mb-1.5">★★★★★</div>
                  <p className="text-xs text-gray-800 leading-relaxed font-normal">
                    Loving Panda Praise! We needed an easy-to-use testimonial solution with great design for redirect.pizza, which{' '}
                    <mark className="bg-amber-200 text-gray-900 px-1 py-0.5 rounded font-semibold">
                      Panda Praise fully delivers
                    </mark>
                    . Excellent interface and "just works".
                  </p>

                  <div className="flex items-center gap-2 mt-3 pt-2 border-t border-gray-100">
                    <img
                      src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80"
                      alt="Michel"
                      className="w-7 h-7 rounded-full object-cover"
                    />
                    <div>
                      <p className="text-[11px] font-bold text-gray-900 leading-none">Michel Bardelmeijer</p>
                      <p className="text-[9px] text-gray-500 leading-none mt-0.5">Founder of redirect.pizza</p>
                    </div>
                  </div>
                </div>

                {/* Bottom party person illustration accent */}
                <div className="flex justify-end mt-2 relative z-10">
                  <div className="relative">
                    <img
                      src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80"
                      alt="Avatar"
                      className="w-12 h-12 rounded-full object-cover ring-2 ring-white shadow-md"
                    />
                    <span className="absolute -top-2 -right-1 text-base">🎉</span>
                  </div>
                </div>
              </div>

            </div>

            {/* ── Column 4: Card 6 (Fed - Pastel Image Card) + Card 7 (Jay Clouse) ── */}
            <div className="space-y-4">
              
              {/* Card 6: Fed Sage/Pastel Editorial Image Card */}
              <div className="rounded-2xl bg-[#e3dcd1] text-gray-900 p-4 border border-[#cfc5b8] shadow-sm relative overflow-hidden">
                <div className="flex justify-end mb-2">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/70 text-gray-800 text-[11px] font-medium border border-gray-300">
                    <ImageIcon className="w-3 h-3" /> Image
                  </span>
                </div>

                <div className="flex gap-3 items-start">
                  <img
                    src="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=160&auto=format&fit=crop&q=80"
                    alt="Fed"
                    className="w-16 h-18 rounded-2xl object-cover shrink-0 shadow-xs"
                  />
                  <div>
                    <p className="font-extrabold text-sm text-gray-950">Fed</p>
                    <div className="flex text-amber-600 text-xs my-0.5">★★★★★</div>
                    <p className="text-[10px] text-gray-600 font-medium">Founder, BetterProof</p>
                  </div>
                </div>

                <p className="text-xs text-gray-800 mt-2.5 leading-relaxed">
                  Promoting in the newsletter and working with the founder has been a fantastic experience! I sponsored 2 newsletters, and{' '}
                  <mark className="bg-yellow-200 text-gray-950 px-1 py-0.5 rounded font-semibold">
                    the ads already paid for themselves
                  </mark>{' '}
                  even after just the first one went out.
                </p>

                {/* Bottom decorative semicircle shapes row */}
                <div className="flex gap-1 mt-3 justify-center">
                  <div className="w-5 h-2.5 bg-rose-400 rounded-t-full" />
                  <div className="w-5 h-2.5 bg-orange-400 rounded-b-full" />
                  <div className="w-5 h-2.5 bg-teal-400 rounded-t-full" />
                  <div className="w-5 h-2.5 bg-indigo-400 rounded-b-full" />
                  <div className="w-5 h-2.5 bg-purple-400 rounded-t-full" />
                </div>
              </div>

              {/* Card 7: Jay Clouse Purple Creator Card */}
              <div className="rounded-2xl bg-gradient-to-r from-[#6701e6] to-[#7c3aed] text-white p-3.5 shadow-md flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <img
                    src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&auto=format&fit=crop&q=80"
                    alt="Jay Clouse"
                    className="w-9 h-9 rounded-full object-cover ring-2 ring-white/30"
                  />
                  <div>
                    <div className="flex items-center gap-1">
                      <p className="font-bold text-xs">Jay Clouse</p>
                      <span className="text-[10px] text-sky-300">✔</span>
                    </div>
                    <p className="text-[10px] text-purple-200">@jayclouse</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button className="w-6 h-6 rounded-full bg-white/20 text-white flex items-center justify-center text-xs">←</button>
                  <button className="w-6 h-6 rounded-full bg-white/20 text-white flex items-center justify-center text-xs">→</button>
                </div>
              </div>

            </div>

          </div>
        </div>
      )}

      {/* ── 4. COMMERCIAL PLANS VIEW (Direct Plan Selection & Upgrade) ── */}
      {viewMode === 'plans' && (
        <div className="mt-10 px-4 sm:px-6 max-w-5xl mx-auto w-full animate-fade-in">
          
          {/* Monthly / Annual Billing Toggle */}
          <div className="flex justify-center mb-8">
            <div className="inline-flex items-center p-1 rounded-full bg-gray-200/80">
              <button
                type="button"
                onClick={() => setBillingCycle('monthly')}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  billingCycle === 'monthly' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-600'
                }`}
              >
                Monthly billing
              </button>
              <button
                type="button"
                onClick={() => setBillingCycle('annual')}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  billingCycle === 'annual' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-600'
                }`}
              >
                <span>Annual billing</span>
                <span className="px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-extrabold">Save 20%</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Free Plan */}
            <div className="rounded-3xl bg-white border border-gray-200 p-6 flex flex-col justify-between shadow-xs">
              <div>
                <h3 className="font-extrabold text-xl text-gray-950">Free Forever</h3>
                <p className="text-xs text-gray-500 mt-1">Start collecting and testing social proof.</p>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-3xl font-black text-gray-950">$0</span>
                  <span className="text-xs text-gray-500">/ forever</span>
                </div>

                <div className="mt-6 space-y-2.5 text-xs text-gray-700">
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" /> Up to 15 video & text testimonials
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" /> 1 Collection Form
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" /> Wall of Love & Widget Embeds
                  </div>
                  <div className="flex items-center gap-2 text-gray-400">
                    <span className="text-gray-400 font-bold ml-1">•</span> Panda Praise badge on widgets
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleSelectPlan('free')}
                className="w-full mt-8 py-3 rounded-xl border-2 border-gray-300 hover:border-gray-900 text-gray-900 font-bold text-xs transition-colors cursor-pointer"
              >
                Continue with Free Plan
              </button>
            </div>

            {/* Starter Plan */}
            <div className="rounded-3xl bg-white border border-gray-200 p-6 flex flex-col justify-between shadow-xs">
              <div>
                <h3 className="font-extrabold text-xl text-gray-950">Starter</h3>
                <p className="text-xs text-gray-500 mt-1">For growing businesses & creators.</p>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-3xl font-black text-gray-950">
                    {billingCycle === 'annual' ? '$24' : '$29'}
                  </span>
                  <span className="text-xs text-gray-500">/ month</span>
                </div>

                <div className="mt-6 space-y-2.5 text-xs text-gray-700">
                  <div className="flex items-center gap-2 font-medium">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" /> Unlimited testimonials
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" /> Remove Panda Praise branding
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" /> 3 Collection Forms
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" /> 2 Team Seats
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" /> Sizzle Reel & Social Cards
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleSelectPlan('starter')}
                className="w-full mt-8 py-3 rounded-xl bg-gray-950 hover:bg-gray-800 text-white font-bold text-xs transition-colors cursor-pointer"
              >
                Start 7-Day Free Trial
              </button>
            </div>

            {/* Pro Plan (Highlighted Most Popular) */}
            <div className="rounded-3xl bg-white border-2 border-[#6701e6] p-6 flex flex-col justify-between shadow-xl relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-[#6701e6] text-white text-[10px] font-extrabold uppercase tracking-wider shadow-sm">
                Most Popular
              </div>

              <div>
                <h3 className="font-extrabold text-xl text-gray-950">Pro</h3>
                <p className="text-xs text-gray-500 mt-1">For teams scaling serious social proof.</p>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-3xl font-black text-[#6701e6]">
                    {billingCycle === 'annual' ? '$49' : '$59'}
                  </span>
                  <span className="text-xs text-gray-500">/ month</span>
                </div>

                <div className="mt-6 space-y-2.5 text-xs text-gray-700">
                  <div className="flex items-center gap-2 font-bold text-gray-950">
                    <Check className="w-4 h-4 text-[#6701e6] shrink-0" /> Unlimited testimonials & forms
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#6701e6] shrink-0" /> 5 Projects included
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#6701e6] shrink-0" /> 5 Team Seats
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#6701e6] shrink-0" /> Custom Domains (Wall of Love)
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#6701e6] shrink-0" /> Google SEO Rich Snippets
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#6701e6] shrink-0" /> Automatic Translation
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleSelectPlan('pro')}
                className="w-full mt-8 py-3 rounded-xl bg-[#6701e6] hover:bg-[#5400bd] text-white font-bold text-xs shadow-md transition-all cursor-pointer"
              >
                Start 7-Day Pro Trial
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ── 5. Bottom Sticky Black Floating Pill "Continue →" (Screenshot Exact) ── */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          type="button"
          onClick={handleContinueToDashboard}
          className="px-6 sm:px-8 py-3.5 bg-black hover:bg-gray-800 text-white font-bold text-sm sm:text-base rounded-full shadow-2xl flex items-center gap-2 hover:scale-[1.03] active:scale-95 transition-all cursor-pointer border border-white/20"
        >
          <span>Continue</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
};
export default OnboardingUpgradePage;
