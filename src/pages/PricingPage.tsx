import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Check,
  ArrowRight,
  Crown,
  ChevronDown,
  Star,
  Sparkles,
  Globe,
  Zap,
  ShieldCheck,
} from 'lucide-react';
import { usePageSeo } from '../lib/seo';
import { PandaPraiseIcon } from '../components/PandaPraiseLogo';

const FAQ_ITEMS = [
  {
    q: 'What is the Founding Member offer?',
    a: 'Founding Members pay ₹4,999 once and get lifetime access to Panda Praise. This is a limited early-supporter offer for Indian founders, agencies, and businesses before we move to subscription-only pricing.',
  },
  {
    q: 'What happens after I pay ₹4,999?',
    a: 'You get lifetime access to all current and future features. No recurring charges. Ever.',
  },
  {
    q: 'Can I just subscribe instead?',
    a: 'Yes. You can pay ₹799/month (billed monthly) or ₹399/month (billed annually as ₹4,788). Founding Member is the best deal if you plan to use Panda Praise long-term.',
  },
  {
    q: 'Can I cancel my subscription?',
    a: 'Absolutely. Cancel anytime from your billing dashboard in 1 click. You retain complete access to your paid plan until the end of your current billing period.',
  },
  {
    q: 'Do you provide a GST invoice for tax credit?',
    a: 'Yes! Instant GST invoices with your business name and GSTIN are generated for all transactions, allowing you to claim full 18% input tax credit.',
  },
];

export const PricingPage = () => {
  usePageSeo({
    title: 'Pricing — Panda Praise (India Edition)',
    description: 'Simple, transparent pricing. Flexible subscriptions from ₹399/mo or lifetime Founding Member access for ₹4,999. Built for Indian businesses.',
  });

  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  const { user } = useAuth();
  const [billingCycle, setBillingCycle] = useState<'annual' | 'monthly'>('annual');
  const [selectedPlan, setSelectedPlan] = useState<'founding' | 'annual' | 'monthly'>('founding');
  const [checkoutLoading, setCheckoutLoading] = useState<'founding' | 'annual' | 'monthly' | 'extension' | null>(null);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  const [currency, setCurrency] = useState<'INR' | 'USD'>('INR');

  const handleCheckout = async (plan: 'founding' | 'annual' | 'monthly' | 'extension') => {
    if (plan !== 'extension') {
      setSelectedPlan(plan);
    }
    setCheckoutError(null);
    if (!user) {
      window.location.href = `/signup?plan=${plan}&currency=${currency}`;
      return;
    }
    setCheckoutLoading(plan);
    try {
      window.location.href = `/dashboard/settings?plan=${plan}&currency=${currency}&checkout=true`;
    } catch {
      setCheckoutError('Redirecting to your billing dashboard…');
      window.location.href = '/dashboard/settings';
    } finally {
      setCheckoutLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans">
      <header className="border-b border-white/5 bg-zinc-950/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <PandaPraiseIcon size={28} />
            <span className="text-lg font-bold bg-gradient-to-r from-violet-400 to-purple-300 bg-clip-text text-transparent">
              Panda Praise
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <Link to="/login" className="text-sm text-zinc-400 hover:text-zinc-200 transition-colors">Sign In</Link>
            <Link to="/signup" className="px-4 py-2 rounded-lg text-sm font-medium bg-violet-600 hover:bg-violet-500 text-white transition-colors">Get Started</Link>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-16 sm:py-24">
        {/* Apple Hero Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-zinc-900 border border-white/10 text-zinc-300 text-xs font-medium mb-5 shadow-xs">
            <span className="text-sm leading-none">{currency === 'INR' ? '🇮🇳' : '🌐'}</span>
            <span>{currency === 'INR' ? 'Built for Indian Businesses & Creators' : 'Available Worldwide • Zero Hostage Fees'}</span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white mb-3">
            Simple, transparent pricing.
          </h1>
          <p className="text-base sm:text-lg text-zinc-400 max-w-2xl mx-auto font-normal">
            Flexible monthly and annual plans for growing teams — or lock in lifetime access with our Founding Member pass.
          </p>
          <div className="flex items-center justify-center gap-2 sm:gap-2.5 mt-2.5 text-xs text-zinc-500 font-medium tracking-wide">
            {currency === 'INR' ? (
              <>
                <span>UPI</span>
                <span className="text-zinc-700">•</span>
                <span>RuPay</span>
                <span className="text-zinc-700">•</span>
                <span>Netbanking</span>
                <span className="text-zinc-700">•</span>
                <span>Instant GST Invoice</span>
              </>
            ) : (
              <>
                <span>Credit Cards</span>
                <span className="text-zinc-700">•</span>
                <span>Apple Pay</span>
                <span className="text-zinc-700">•</span>
                <span>Google Pay</span>
                <span className="text-zinc-700">•</span>
                <span>Stripe Verified</span>
              </>
            )}
          </div>
        </div>

        {/* Currency Switcher: India (INR) vs Worldwide (USD) */}
        <div className="flex items-center justify-center mb-6">
          <div className="inline-flex items-center p-1 rounded-full bg-zinc-900 border border-white/10 text-xs shadow-inner">
            <button
              type="button"
              id="currency-toggle-inr"
              onClick={() => setCurrency('INR')}
              className={`px-4 py-1.5 rounded-full font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                currency === 'INR'
                  ? 'bg-violet-600 text-white shadow-xs'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <span>🇮🇳 INR (₹)</span>
            </button>
            <button
              type="button"
              id="currency-toggle-usd"
              onClick={() => setCurrency('USD')}
              className={`px-4 py-1.5 rounded-full font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                currency === 'USD'
                  ? 'bg-violet-600 text-white shadow-xs'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <span>🌐 USD ($) Worldwide</span>
            </button>
          </div>
        </div>

        {/* Dynamic Billing Rhythm Toggle */}
        <div className="flex items-center justify-center mb-12">
          <div className="inline-flex items-center p-1.5 rounded-full bg-zinc-900 border border-white/10 shadow-inner">
            <button
              type="button"
              id="billing-toggle-annual"
              onClick={() => {
                setBillingCycle('annual');
                setSelectedPlan('annual');
              }}
              className={`px-5 py-2 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                billingCycle === 'annual'
                  ? 'bg-white text-zinc-950 shadow-md scale-[1.02]'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <span>Annual Billing</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                billingCycle === 'annual' ? 'bg-emerald-100 text-emerald-800' : 'bg-emerald-500/20 text-emerald-400'
              }`}>
                Save 50%
              </span>
            </button>
            <button
              type="button"
              id="billing-toggle-monthly"
              onClick={() => {
                setBillingCycle('monthly');
                setSelectedPlan('monthly');
              }}
              className={`px-5 py-2 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                billingCycle === 'monthly'
                  ? 'bg-white text-zinc-950 shadow-md scale-[1.02]'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <span>Monthly Billing</span>
            </button>
          </div>
        </div>

        {checkoutError && (
          <div className="max-w-2xl mx-auto mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-sm text-center">
            {checkoutError}
          </div>
        )}

        {/* 3-Column Pricing Grid with Founding Member as the Anchor */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-6xl mx-auto mb-12 items-stretch" id="pricing-plans-grid">
          
          {/* Card 1: Lifetime Pass (Founding Member) - Glowing Anchor */}
          <div
            id="plan-card-founding"
            onClick={() => setSelectedPlan('founding')}
            className={`relative rounded-3xl p-7 sm:p-8 flex flex-col justify-between transition-all duration-300 cursor-pointer overflow-hidden ${
              selectedPlan === 'founding'
                ? 'bg-gradient-to-b from-zinc-900 to-zinc-950 border-2 border-amber-400/80 shadow-[0_0_40px_rgba(245,158,11,0.22)] ring-1 ring-amber-400/30 scale-[1.02]'
                : 'bg-zinc-900/60 border border-amber-400/40 hover:border-amber-400/70 hover:bg-zinc-900/80'
            }`}
          >
            {/* Glowing top line - cleanly clipped by overflow-hidden */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500" />
            
            <div>
              <div className="flex flex-wrap items-center justify-between gap-2 mb-4 pt-1">
                <span className="px-3 py-1 rounded-full bg-amber-400/15 border border-amber-400/30 text-amber-300 text-[10px] font-extrabold uppercase tracking-wider inline-flex items-center gap-1.5 shadow-xs whitespace-nowrap">
                  <Crown size={12} className="text-amber-400 shrink-0" />
                  Most Popular • Lifetime Pass
                </span>
                <span className="text-[10px] font-bold text-amber-300/90 uppercase tracking-wider bg-amber-400/10 border border-amber-400/20 px-2.5 py-0.5 rounded-full whitespace-nowrap">
                  Limited Deal
                </span>
              </div>

              <h2 className="text-xl font-bold text-white mb-1">Founding Member</h2>
              <p className="text-xs text-zinc-400 mb-6">Pay once. Use Panda Praise for life without recurring fees.</p>

              <div className="flex items-baseline gap-1.5 mb-6">
                <span className="text-4xl sm:text-5xl font-black tracking-tight text-white">{currency === 'INR' ? '₹4,999' : '$49'}</span>
                <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">{currency === 'INR' ? 'One-time payment' : 'One-time payment • Lifetime'}</span>
              </div>

              <div className="space-y-3 py-5 border-t border-white/10 text-xs text-zinc-300">
                <div className="flex items-center gap-2">
                  <Check size={14} className="text-emerald-400 shrink-0" />
                  <span><strong className="text-white font-semibold">Zero recurring monthly charges</strong>. Ever.</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check size={14} className="text-emerald-400 shrink-0" />
                  <span><strong className="text-white font-semibold">Lifetime access</strong> to all present & future features</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check size={14} className="text-emerald-400 shrink-0" />
                  <span><strong className="text-white font-semibold">Unlimited verified testimonials</strong> & embeds</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check size={14} className="text-emerald-400 shrink-0" />
                  <span>Wall of Love, Marquee & all interactive widgets</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check size={14} className="text-emerald-400 shrink-0" />
                  <span><strong className="text-white font-semibold">{currency === 'INR' ? 'Instant GST invoice' : 'Instant digital receipt'}</strong> {currency === 'INR' ? 'for full 18% tax credit' : 'with tax deduction'}</span>
                </div>
              </div>
            </div>

            <div>
              <button
                type="button"
                id="btn-checkout-founding"
                onClick={(e) => {
                  e.stopPropagation();
                  handleCheckout('founding');
                }}
                disabled={checkoutLoading !== null}
                className="w-full mt-6 py-3.5 rounded-full text-xs font-extrabold transition-all flex items-center justify-center gap-2 cursor-pointer bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-zinc-950 shadow-lg shadow-amber-500/20"
              >
                {checkoutLoading === 'founding' ? 'Starting checkout…' : 'Get Lifetime Access'}
                <ArrowRight size={14} className="text-zinc-950" />
              </button>

              {/* Local payment trust anchor */}
              <div className="mt-3 flex items-center justify-center gap-1.5 text-[11px] text-zinc-400">
                <span className="text-emerald-400 font-bold">⚡ Instant Activation</span>
                <span>•</span>
                <span>{currency === 'INR' ? 'UPI & RuPay' : 'Apple & Google Pay'}</span>
                <span>•</span>
                <span>{currency === 'INR' ? 'GST Invoice' : 'Stripe Verified'}</span>
              </div>
            </div>
          </div>

          {/* Card 2: Annual Pro */}
          <div
            id="plan-card-annual"
            onClick={() => setSelectedPlan('annual')}
            className={`relative rounded-3xl p-7 sm:p-8 flex flex-col justify-between transition-all duration-300 cursor-pointer ${
              selectedPlan === 'annual'
                ? 'bg-zinc-900 border-2 border-emerald-400/80 ring-2 ring-emerald-500/20 shadow-2xl shadow-emerald-500/10 scale-[1.02]'
                : 'bg-zinc-900/40 border border-white/10 hover:border-white/20 hover:bg-zinc-900/60'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[10px] font-bold uppercase tracking-wider">
                  Save 50% • Best Subscription
                </span>
                {selectedPlan === 'annual' && (
                  <span className="text-[10px] font-bold text-white uppercase tracking-wider">
                    ● Selected
                  </span>
                )}
              </div>

              <h2 className="text-xl font-bold text-white mb-1">Annual Pro</h2>
              <p className="text-xs text-zinc-400 mb-6">Best for growing businesses, startups & agencies.</p>

              <div className="flex items-baseline gap-1.5 mb-1">
                <span className="text-4xl sm:text-5xl font-black tracking-tight text-white">{currency === 'INR' ? '₹399' : '$9'}</span>
                <span className="text-xs font-semibold text-zinc-400">/month</span>
              </div>
              <p className="text-[11px] text-emerald-400 font-medium mb-6">
                {currency === 'INR' ? '₹4,788 billed annually (Save ₹4,800/yr)' : '$108 billed annually (Save $120/yr)'}
              </p>

              <div className="space-y-3 py-5 border-t border-white/10 text-xs text-zinc-300">
                <div className="flex items-center gap-2">
                  <Check size={14} className="text-emerald-400 shrink-0" />
                  <span><strong className="text-white font-semibold">Save 50%</strong> compared to monthly billing</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check size={14} className="text-emerald-400 shrink-0" />
                  <span><strong className="text-white font-semibold">Unlimited verified testimonials</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <Check size={14} className="text-emerald-400 shrink-0" />
                  <span>Custom branding & custom domains</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check size={14} className="text-emerald-400 shrink-0" />
                  <span>Priority email & WhatsApp support</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check size={14} className="text-emerald-400 shrink-0" />
                  <span><strong className="text-white font-semibold">{currency === 'INR' ? 'Instant GST invoice' : 'Instant digital receipt'}</strong></span>
                </div>
              </div>
            </div>

            <div>
              <button
                type="button"
                id="btn-checkout-annual"
                onClick={(e) => {
                  e.stopPropagation();
                  handleCheckout('annual');
                }}
                disabled={checkoutLoading !== null}
                className={`w-full mt-6 py-3.5 rounded-full text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  selectedPlan === 'annual'
                    ? 'bg-white text-zinc-950 hover:bg-zinc-200 shadow-lg'
                    : 'bg-white/10 hover:bg-white/20 border border-white/15 text-white'
                }`}
              >
                {checkoutLoading === 'annual' ? 'Starting checkout…' : 'Choose Annual Pro'}
              </button>

              {/* Local payment trust anchor */}
              <div className="mt-3 flex items-center justify-center gap-1.5 text-[11px] text-zinc-400">
                <span className="text-emerald-400 font-bold">⚡ Instant Activation</span>
                <span>•</span>
                <span>{currency === 'INR' ? 'UPI & RuPay' : 'Apple & Google Pay'}</span>
                <span>•</span>
                <span>{currency === 'INR' ? 'GST Invoice' : 'Stripe Verified'}</span>
              </div>
            </div>
          </div>

          {/* Card 3: Monthly Pro */}
          <div
            id="plan-card-monthly"
            onClick={() => setSelectedPlan('monthly')}
            className={`relative rounded-3xl p-7 sm:p-8 flex flex-col justify-between transition-all duration-300 cursor-pointer ${
              selectedPlan === 'monthly'
                ? 'bg-zinc-900 border-2 border-violet-400/80 ring-2 ring-violet-500/20 shadow-2xl shadow-violet-500/10 scale-[1.02]'
                : 'bg-zinc-900/40 border border-white/10 hover:border-white/20 hover:bg-zinc-900/60'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="px-3 py-1 rounded-full bg-zinc-800 border border-white/10 text-zinc-300 text-[10px] font-bold uppercase tracking-wider">
                  Flexible Month-to-Month
                </span>
                {selectedPlan === 'monthly' && (
                  <span className="text-[10px] font-bold text-white uppercase tracking-wider">
                    ● Selected
                  </span>
                )}
              </div>

              <h2 className="text-xl font-bold text-white mb-1">Monthly Pro</h2>
              <p className="text-xs text-zinc-400 mb-6">Month-to-month agility with zero long-term commitment.</p>

              <div className="flex items-baseline gap-1.5 mb-1">
                <span className="text-4xl sm:text-5xl font-black tracking-tight text-white">{currency === 'INR' ? '₹799' : '$19'}</span>
                <span className="text-xs font-semibold text-zinc-400">/month</span>
              </div>
              <p className="text-[11px] text-zinc-400 mb-6">Billed monthly • Cancel anytime in 1 click</p>

              <div className="space-y-3 py-5 border-t border-white/10 text-xs text-zinc-300">
                <div className="flex items-center gap-2">
                  <Check size={14} className="text-emerald-400 shrink-0" />
                  <span><strong className="text-white font-semibold">Cancel anytime in 1 click</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <Check size={14} className="text-emerald-400 shrink-0" />
                  <span><strong className="text-white font-semibold">No long-term lock-in</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <Check size={14} className="text-emerald-400 shrink-0" />
                  <span>Unlimited verified testimonials</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check size={14} className="text-emerald-400 shrink-0" />
                  <span>Remove Panda Praise branding</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check size={14} className="text-emerald-400 shrink-0" />
                  <span><strong className="text-white font-semibold">{currency === 'INR' ? 'Instant GST invoice' : 'Instant digital receipt'}</strong></span>
                </div>
              </div>
            </div>

            <div>
              <button
                type="button"
                id="btn-checkout-monthly"
                onClick={(e) => {
                  e.stopPropagation();
                  handleCheckout('monthly');
                }}
                disabled={checkoutLoading !== null}
                className={`w-full mt-6 py-3.5 rounded-full text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  selectedPlan === 'monthly'
                    ? 'bg-white text-zinc-950 hover:bg-zinc-200 shadow-lg'
                    : 'bg-white/10 hover:bg-white/20 border border-white/15 text-white'
                }`}
              >
                {checkoutLoading === 'monthly' ? 'Starting checkout…' : 'Choose Monthly Pro'}
              </button>

              {/* Local payment trust anchor */}
              <div className="mt-3 flex items-center justify-center gap-1.5 text-[11px] text-zinc-400">
                <span className="text-emerald-400 font-bold">⚡ Instant Activation</span>
                <span>•</span>
                <span>{currency === 'INR' ? 'UPI & RuPay' : 'Apple & Google Pay'}</span>
                <span>•</span>
                <span>{currency === 'INR' ? 'GST Invoice' : 'Stripe Verified'}</span>
              </div>
            </div>
          </div>

        </div>

        {/* Local Payment Trust Banner */}
        <div className="max-w-4xl mx-auto mb-16 p-4 rounded-2xl bg-zinc-900/50 border border-white/10 flex flex-wrap items-center justify-between gap-4 text-xs text-zinc-400">
          <div className="flex items-center gap-2 text-zinc-200 font-semibold">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>100% Secure Checkout for Indian Businesses</span>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-zinc-400">
            <span className="font-semibold text-white">⚡ Instant UPI (GPay, PhonePe, Paytm)</span>
            <span>•</span>
            <span>RuPay & Cards</span>
            <span>•</span>
            <span>Netbanking</span>
            <span>•</span>
            <span className="text-emerald-400 font-semibold">18% GST Input Credit</span>
          </div>
        </div>

        {/* Optional Power-ups & Add-ons Sub-Grid */}
        <div className="max-w-6xl mx-auto mb-20" id="powerups-and-addons">
          <div className="flex items-center gap-2 mb-6">
            <Sparkles className="w-4 h-4 text-violet-400" />
            <h3 className="text-sm font-bold text-white tracking-wide uppercase">
              Optional Power-ups & Add-ons
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Add-on 1: Chrome Extension Pro */}
            <div className="rounded-2xl bg-zinc-900/60 border border-white/10 hover:border-violet-500/40 p-6 flex flex-col justify-between transition-all">
              <div>
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400 shrink-0 mt-0.5">
                    <Globe className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-white">PandaPraise Chrome Extension Pro</h4>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        7-Day Free Trial
                      </span>
                    </div>
                    <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                      1-Click WhatsApp Web in-chat clipper, UPI payment screenshot tags, and instant sales chat drops.
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 text-[11px] text-zinc-400 py-3 border-t border-white/5">
                  <span className="bg-zinc-800/60 px-2 py-0.5 rounded">✓ WhatsApp Web Clipper</span>
                  <span className="bg-zinc-800/60 px-2 py-0.5 rounded">✓ UPI Proof Tagging</span>
                  <span className="bg-zinc-800/60 px-2 py-0.5 rounded">✓ 1-Click Message Drops</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 mt-2 border-t border-white/10">
                <div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-black text-white">₹100</span>
                    <span className="text-xs text-zinc-400">/month</span>
                  </div>
                  <span className="text-[10px] text-zinc-500 block">Just ₹3/day • 7-day free trial</span>
                </div>
                <button
                  type="button"
                  id="btn-checkout-extension"
                  onClick={() => handleCheckout('extension')}
                  className="px-5 py-2.5 rounded-full bg-white text-zinc-950 hover:bg-zinc-200 font-bold text-xs shadow-md transition-all whitespace-nowrap cursor-pointer"
                >
                  {checkoutLoading === 'extension' ? 'Starting trial…' : 'Start 7-Day Free Trial'}
                </button>
              </div>
            </div>

            {/* Add-on 2: White-Glove CSS & Widget Match */}
            <div className="rounded-2xl bg-zinc-900/60 border border-white/10 hover:border-amber-500/40 p-6 flex flex-col justify-between transition-all">
              <div>
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0 mt-0.5">
                    <Zap className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-white">White-Glove Widget Styling & Setup</h4>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20">
                        Included Free
                      </span>
                    </div>
                    <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                      Our engineering team writes custom CSS to match your exact website fonts, palette, and CMS layout.
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 text-[11px] text-zinc-400 py-3 border-t border-white/5">
                  <span className="bg-zinc-800/60 px-2 py-0.5 rounded">✓ Custom Font & CSS Match</span>
                  <span className="bg-zinc-800/60 px-2 py-0.5 rounded">✓ 24-Hour Turnaround</span>
                  <span className="bg-zinc-800/60 px-2 py-0.5 rounded">✓ Webflow, Shopify & Framer</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 mt-2 border-t border-white/10">
                <div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-black text-white">₹0</span>
                    <span className="text-xs text-emerald-400 font-bold ml-1">Included</span>
                  </div>
                  <span className="text-[10px] text-zinc-500 block">Complimentary with Pro & Lifetime</span>
                </div>
                <Link
                  to="/signup"
                  className="px-5 py-2.5 rounded-full bg-white/10 hover:bg-white text-white hover:text-zinc-950 font-bold text-xs transition-all whitespace-nowrap border border-white/10 text-center"
                >
                  Claim Setup
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* FAQs */}
        <div className="max-w-2xl mx-auto mb-20">
          <h2 className="text-2xl font-bold text-white text-center mb-8">Frequently Asked Questions</h2>
          <div className="space-y-3">
            {FAQ_ITEMS.map((item, idx) => (
              <div key={idx} className="rounded-xl border border-white/10 overflow-hidden transition-colors hover:border-white/15">
                <button
                  type="button"
                  onClick={() => setOpenFaqIndex(openFaqIndex === idx ? null : idx)}
                  className="w-full flex items-center justify-between px-5 py-4 text-left cursor-pointer"
                >
                  <span className="text-sm font-medium text-zinc-200">{item.q}</span>
                  <ChevronDown
                    size={16}
                    className={`text-zinc-500 flex-shrink-0 ml-4 transition-transform duration-200 ${
                      openFaqIndex === idx ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {openFaqIndex === idx && (
                  <div className="px-5 pb-4">
                    <p className="text-sm text-zinc-400 leading-relaxed">{item.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Closing CTA */}
        <div className="text-center pb-12">
          <div className="p-8 sm:p-12 rounded-2xl bg-gradient-to-b from-violet-500/10 to-transparent border border-violet-500/20">
            <div className="flex justify-center gap-0.5 mb-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star key={i} size={20} className="text-amber-400 fill-amber-400" />
              ))}
            </div>
            <h3 className="text-2xl font-bold text-white mb-3">
              Ready to turn happy customers into your best marketing?
            </h3>
            <p className="text-zinc-400 mb-6 max-w-md mx-auto">
              Start collecting, managing, and sharing testimonials with Panda Praise today.
            </p>
            <Link
              to="/signup"
              className="inline-flex items-center gap-2 px-8 py-3 rounded-xl text-sm font-semibold bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white shadow-lg shadow-violet-500/20 transition-all duration-200"
            >
              Get Started
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>

      <footer className="border-t border-white/10 py-8 text-xs text-zinc-500">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start gap-2">
            <PandaPraiseIcon size={20} />
            <span>© 2026 Panda Praise Ltd. All rights reserved.</span>
          </div>
          <div className="flex items-center justify-center gap-6">
            <Link to="/" className="hover:text-zinc-300 transition-colors">Home</Link>
            <Link to="/terms" className="hover:text-zinc-300 transition-colors">Terms of Service</Link>
            <Link to="/privacy-policy" className="hover:text-zinc-300 transition-colors">Privacy Policy</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};