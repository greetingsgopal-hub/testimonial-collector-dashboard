import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Check,
  X,
  ArrowRight,
  Crown,
  ChevronDown,
  Star,
  HelpCircle,
} from 'lucide-react';
import { usePageSeo } from '../lib/seo';
import { PandaPraiseIcon } from '../components/PandaPraiseLogo';

interface PlanFeature {
  name: string;
  free: string | boolean;
  paid: string | boolean;
  tooltip?: string;
}

interface FeatureCategory {
  title: string;
  features: PlanFeature[];
}

const FEATURE_CATEGORIES: FeatureCategory[] = [
  {
    title: 'Core Features & Limits',
    features: [
      { name: 'Testimonials', free: 'Up to 15', paid: 'Unlimited' },
      { name: 'Projects', free: '1', paid: '1' },
      { name: 'Team seats', free: '1', paid: '2' },
      { name: 'Collection forms', free: true, paid: true },
      { name: 'Customer testimonial collection forms', free: true, paid: true },
      { name: 'Widget views', free: 'Unlimited', paid: 'Unlimited' },
      { name: 'CSV & JSON export', free: true, paid: true },
    ],
  },
  {
    title: 'Widgets & Customization',
    features: [
      { name: 'Wall of Love', free: true, paid: true },
      { name: 'Social card creator', free: true, paid: true },
      { name: 'Remove Panda Praise branding', free: false, paid: true },
      { name: 'High-res social proof export', free: false, paid: true },
      { name: 'Custom domain', free: false, paid: true, tooltip: 'Point your own domain to your Wall of Love' },
    ],
  },
  {
    title: 'Integrations & Automation',
    features: [
      { name: 'Import from CSV & connected platforms', free: false, paid: true },
      { name: 'API access', free: false, paid: 'Coming soon' },
      { name: 'Webhooks', free: false, paid: 'Coming soon' },
      { name: 'Zapier integration', free: false, paid: 'Coming soon', tooltip: 'Join the waitlist from the Integrations page' },
    ],
  },
  {
    title: 'Analytics & Support',
    features: [
      { name: 'Sentiment analysis', free: false, paid: 'Coming soon' },
      { name: 'Email support', free: false, paid: true },
    ],
  },
];

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
    q: 'Can I try Panda Praise before paying?',
    a: 'Yes! The Free plan is fully functional and never expires. Use it as long as you like. Upgrade when you need more features or testimonials.',
  },
  {
    q: 'Can I cancel my subscription?',
    a: 'Absolutely. Cancel anytime from your billing dashboard. You keep your current plan until the end of the billing period, then move to Free.',
  },
];

export const PricingPage = () => {
  usePageSeo({
    title: 'Pricing — Panda Praise (India Edition)',
    description: 'Lifetime access for ₹4,999 — pay once, use forever. Or subscribe at ₹399/month (billed annually). Built for Indian businesses.',
  });

  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  const { user } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState<'founding' | 'annual' | 'monthly'>('founding');
  const [checkoutLoading, setCheckoutLoading] = useState<'founding' | 'annual' | 'monthly' | 'extension' | null>(null);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  const handleCheckout = async (plan: 'founding' | 'annual' | 'monthly' | 'extension') => {
    if (plan !== 'extension') {
      setSelectedPlan(plan);
    }
    setCheckoutError(null);
    if (!user) {
      window.location.href = `/signup?plan=${plan}`;
      return;
    }
    setCheckoutLoading(plan);
    try {
      window.location.href = `/dashboard/settings?plan=${plan}&checkout=true`;
    } catch {
      setCheckoutError('Redirecting to your billing dashboard…');
      window.location.href = '/dashboard/settings';
    } finally {
      setCheckoutLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
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
            <Link to="/signup" className="px-4 py-2 rounded-lg text-sm font-medium bg-violet-600 hover:bg-violet-500 text-white transition-colors">Get Started Free</Link>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-16 sm:py-24">
        {/* Apple Hero Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-zinc-900 border border-white/10 text-zinc-300 text-xs font-medium mb-5 shadow-xs">
            <span className="text-sm leading-none">🇮🇳</span>
            <span>Built for Indians</span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white mb-3">
            Pay once. Use forever.
          </h1>
          <p className="text-base sm:text-lg text-zinc-400 max-w-xl mx-auto font-normal">
            Founding members lock in lifetime access.
          </p>
          <div className="flex items-center justify-center gap-2 sm:gap-2.5 mt-2.5 text-xs text-zinc-500 font-medium tracking-wide">
            <span>UPI</span>
            <span className="text-zinc-700">•</span>
            <span>RuPay</span>
            <span className="text-zinc-700">•</span>
            <span>Netbanking</span>
            <span className="text-zinc-700">•</span>
            <span>Cards accepted</span>
          </div>
        </div>

        {/* Apple Segmented Plan Navigator (Allows user to toggle & test all 3) */}
        <div className="flex items-center justify-center mb-12">
          <div className="inline-flex p-1.5 rounded-full bg-zinc-900 border border-white/10 shadow-inner max-w-full overflow-x-auto">
            <button
              type="button"
              onClick={() => setSelectedPlan('founding')}
              className={`px-4 sm:px-6 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                selectedPlan === 'founding'
                  ? 'bg-white text-zinc-950 shadow-md scale-[1.02]'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Crown size={13} className={selectedPlan === 'founding' ? 'text-amber-500' : 'text-zinc-500'} />
              <span>Lifetime Pass (₹4,999)</span>
            </button>
            <button
              type="button"
              onClick={() => setSelectedPlan('annual')}
              className={`px-4 sm:px-6 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                selectedPlan === 'annual'
                  ? 'bg-white text-zinc-950 shadow-md scale-[1.02]'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <span>Annual Pro (₹399/mo)</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                selectedPlan === 'annual' ? 'bg-emerald-100 text-emerald-800' : 'bg-emerald-500/20 text-emerald-400'
              }`}>
                Save 50%
              </span>
            </button>
            <button
              type="button"
              onClick={() => setSelectedPlan('monthly')}
              className={`px-4 sm:px-6 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                selectedPlan === 'monthly'
                  ? 'bg-white text-zinc-950 shadow-md scale-[1.02]'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <span>Monthly Pro (₹799/mo)</span>
            </button>
          </div>
        </div>

        {checkoutError && <div className="max-w-2xl mx-auto mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-sm text-center">{checkoutError}</div>}

        {/* Apple 3-Card Interactive Grid: All 3 are selectable and navigable */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-6xl mx-auto mb-16">
          
          {/* Card 1: Lifetime Pass (Founding Member) */}
          <div
            onClick={() => setSelectedPlan('founding')}
            className={`relative rounded-3xl p-7 sm:p-8 flex flex-col justify-between transition-all duration-200 cursor-pointer ${
              selectedPlan === 'founding'
                ? 'bg-zinc-900 border-2 border-white ring-4 ring-white/10 shadow-2xl shadow-violet-500/10 scale-[1.02]'
                : 'bg-zinc-900/40 border border-white/10 hover:border-white/20 hover:bg-zinc-900/60'
            }`}
          >
            {selectedPlan === 'founding' && (
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" />
            )}
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <Crown size={12} className="text-amber-400" />
                  Lifetime Pass
                </span>
                {selectedPlan === 'founding' && (
                  <span className="text-[10px] font-bold text-white uppercase tracking-wider">
                    ● Selected
                  </span>
                )}
              </div>

              <h2 className="text-xl font-bold text-white mb-1">Founding Member</h2>
              <p className="text-xs text-zinc-400 mb-6">Pay once. Use Panda Praise for life.</p>

              <div className="flex items-baseline gap-1.5 mb-6">
                <span className="text-4xl sm:text-5xl font-black tracking-tight text-white">₹4,999</span>
                <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">One-time</span>
              </div>

              <div className="space-y-3 py-5 border-t border-white/10 text-xs text-zinc-300">
                <div className="flex items-center gap-2">
                  <Check size={14} className="text-emerald-400 shrink-0" />
                  <span>Unlimited verified testimonials</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check size={14} className="text-emerald-400 shrink-0" />
                  <span>Wall of Love & embed widgets</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check size={14} className="text-emerald-400 shrink-0" />
                  <span>Zero recurring monthly charges</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check size={14} className="text-emerald-400 shrink-0" />
                  <span>Instant GST invoice on request</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleCheckout('founding');
              }}
              disabled={checkoutLoading !== null}
              className={`w-full mt-6 py-3.5 rounded-full text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                selectedPlan === 'founding'
                  ? 'bg-white text-zinc-950 hover:bg-zinc-200 shadow-lg'
                  : 'bg-white/10 hover:bg-white/20 border border-white/15 text-white'
              }`}
            >
              {checkoutLoading === 'founding' ? 'Starting checkout…' : 'Get Lifetime Access'}
            </button>
          </div>

          {/* Card 2: Annual Pro */}
          <div
            onClick={() => setSelectedPlan('annual')}
            className={`relative rounded-3xl p-7 sm:p-8 flex flex-col justify-between transition-all duration-200 cursor-pointer ${
              selectedPlan === 'annual'
                ? 'bg-zinc-900 border-2 border-white ring-4 ring-white/10 shadow-2xl shadow-emerald-500/10 scale-[1.02]'
                : 'bg-zinc-900/40 border border-white/10 hover:border-white/20 hover:bg-zinc-900/60'
            }`}
          >
            {selectedPlan === 'annual' && (
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" />
            )}
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[10px] font-bold uppercase tracking-wider">
                  Save 50% • Best Value
                </span>
                {selectedPlan === 'annual' && (
                  <span className="text-[10px] font-bold text-white uppercase tracking-wider">
                    ● Selected
                  </span>
                )}
              </div>

              <h2 className="text-xl font-bold text-white mb-1">Annual Pro</h2>
              <p className="text-xs text-zinc-400 mb-6">Best for growing businesses & agencies.</p>

              <div className="flex items-baseline gap-1.5 mb-1">
                <span className="text-4xl sm:text-5xl font-black tracking-tight text-white">₹399</span>
                <span className="text-xs font-semibold text-zinc-400">/month</span>
              </div>
              <p className="text-[11px] text-zinc-400 mb-6">₹4,788 billed annually</p>

              <div className="space-y-3 py-5 border-t border-white/10 text-xs text-zinc-300">
                <div className="flex items-center gap-2">
                  <Check size={14} className="text-emerald-400 shrink-0" />
                  <span>Unlimited verified testimonials</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check size={14} className="text-emerald-400 shrink-0" />
                  <span>Custom branding & domains</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check size={14} className="text-emerald-400 shrink-0" />
                  <span>Priority email support</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check size={14} className="text-emerald-400 shrink-0" />
                  <span>Save ₹4,800 vs monthly plan</span>
                </div>
              </div>
            </div>

            <button
              type="button"
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
          </div>

          {/* Card 3: Monthly Pro */}
          <div
            onClick={() => setSelectedPlan('monthly')}
            className={`relative rounded-3xl p-7 sm:p-8 flex flex-col justify-between transition-all duration-200 cursor-pointer ${
              selectedPlan === 'monthly'
                ? 'bg-zinc-900 border-2 border-white ring-4 ring-white/10 shadow-2xl shadow-violet-500/10 scale-[1.02]'
                : 'bg-zinc-900/40 border border-white/10 hover:border-white/20 hover:bg-zinc-900/60'
            }`}
          >
            {selectedPlan === 'monthly' && (
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" />
            )}
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="px-3 py-1 rounded-full bg-zinc-800 border border-white/10 text-zinc-300 text-[10px] font-bold uppercase tracking-wider">
                  Flexible
                </span>
                {selectedPlan === 'monthly' && (
                  <span className="text-[10px] font-bold text-white uppercase tracking-wider">
                    ● Selected
                  </span>
                )}
              </div>

              <h2 className="text-xl font-bold text-white mb-1">Monthly Pro</h2>
              <p className="text-xs text-zinc-400 mb-6">Month-to-month agility. Cancel anytime.</p>

              <div className="flex items-baseline gap-1.5 mb-1">
                <span className="text-4xl sm:text-5xl font-black tracking-tight text-white">₹799</span>
                <span className="text-xs font-semibold text-zinc-400">/month</span>
              </div>
              <p className="text-[11px] text-zinc-400 mb-6">Billed monthly • Cancel anytime</p>

              <div className="space-y-3 py-5 border-t border-white/10 text-xs text-zinc-300">
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
                  <span>All core and widget features</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check size={14} className="text-emerald-400 shrink-0" />
                  <span>Cancel anytime in 1 click</span>
                </div>
              </div>
            </div>

            <button
              type="button"
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
          </div>

        </div>

        {/* India Micro-SaaS Extension Plan */}
        <div className="max-w-4xl mx-auto mb-16 rounded-3xl bg-zinc-900/60 border border-white/15 p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="text-left">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase tracking-wider mb-2">
              🇮🇳 India Edition • 7-Day Free Trial
            </div>
            <h3 className="text-lg font-bold text-white">
              PandaPraise Chrome Extension Pro
            </h3>
            <p className="text-xs text-zinc-400 mt-1 max-w-md">
              1-Click WhatsApp Web in-chat clipper, UPI payment proof tags, and instant sales chat drops. Just ₹3/day.
            </p>
          </div>
          <div className="flex items-center gap-4 shrink-0">
            <div className="text-right">
              <div className="flex items-baseline gap-1 justify-end">
                <span className="text-3xl font-extrabold text-white">₹100</span>
                <span className="text-xs text-zinc-400">/month</span>
              </div>
              <span className="text-[10px] text-emerald-400 font-semibold block">7-Day Free Trial</span>
            </div>
            <button
              type="button"
              onClick={() => handleCheckout('extension')}
              className="px-6 py-3 rounded-full bg-white text-zinc-950 hover:bg-zinc-200 font-bold text-xs shadow-lg transition-all whitespace-nowrap cursor-pointer"
            >
              Start 7-Day Trial
            </button>
          </div>
        </div>

        <div className="text-center mb-20">
          <p className="text-sm text-zinc-400 mb-2">Not ready to pay?</p>
          <Link to="/signup" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold bg-white/5 hover:bg-white/10 text-zinc-200 border border-white/10 transition-all">Start with Free Plan<ArrowRight size={16} /></Link>
          <p className="text-xs text-zinc-600 mt-2">Up to 15 testimonials, forever free.</p>
        </div>

        <div className="mb-20 max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-white">Feature Comparison</h2>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1">Compare Free vs Paid (Founding Member or Subscription).</p>
          </div>
          <div className="overflow-x-auto rounded-2xl border border-white/10 bg-zinc-900/40 shadow-xl">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 bg-white/[0.04]">
                  <th className="text-left py-3 px-4 text-zinc-200 font-semibold text-xs sm:text-sm">Feature</th>
                  <th className="text-center py-3 px-4 text-zinc-300 font-semibold text-xs sm:text-sm w-28 sm:w-32">Free</th>
                  <th className="text-center py-3 px-4 text-emerald-300 font-semibold text-xs sm:text-sm w-28 sm:w-32">Paid</th>
                </tr>
              </thead>
              <tbody>
                {FEATURE_CATEGORIES.map((category) => (
                  <React.Fragment key={category.title}>
                    <tr className="border-y border-white/10 bg-gradient-to-r from-violet-950/40 via-purple-950/30 to-transparent">
                      <td colSpan={3} className="py-2.5 px-4 text-left text-xs font-bold uppercase tracking-wider text-violet-300">{category.title}</td>
                    </tr>
                    {category.features.map((f, idx) => (
                      <tr key={f.name} className={`transition-colors hover:bg-white/[0.04] border-b border-white/[0.04] ${idx % 2 === 0 ? 'bg-white/[0.015]' : 'bg-transparent'}`}>
                        <td className="py-2.5 px-4 text-zinc-300 flex items-center gap-1.5 font-medium text-xs sm:text-sm">{f.name}{f.tooltip && (<span className="group relative inline-flex items-center"><HelpCircle size={13} className="text-zinc-500 cursor-help hover:text-zinc-300 transition-colors" /><span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1 rounded-lg bg-zinc-800 text-xs text-zinc-200 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none border border-white/10 shadow-lg z-20">{f.tooltip}</span></span>)}</td>
                        {(['free', 'paid'] as const).map((tier) => {
                          const val = f[tier];
                          return (<td key={tier} className="text-center py-2.5 px-4 text-xs sm:text-sm">{val === true ? (<Check size={16} className="text-emerald-400 mx-auto" />) : val === false ? (<X size={16} className="text-zinc-700 mx-auto" />) : (<span className="text-zinc-300 font-medium">{val}</span>)}</td>);
                        })}
                      </tr>
                    ))}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="max-w-2xl mx-auto mb-20">
          <h2 className="text-2xl font-bold text-white text-center mb-8">Frequently Asked Questions</h2>
          <div className="space-y-3">
            {FAQ_ITEMS.map((item, idx) => (
              <div key={idx} className="rounded-xl border border-white/10 overflow-hidden transition-colors hover:border-white/15">
                <button onClick={() => setOpenFaqIndex(openFaqIndex === idx ? null : idx)} className="w-full flex items-center justify-between px-5 py-4 text-left"><span className="text-sm font-medium text-zinc-200">{item.q}</span><ChevronDown size={16} className={`text-zinc-500 flex-shrink-0 ml-4 transition-transform duration-200 ${openFaqIndex === idx ? 'rotate-180' : ''}`} /></button>
                {openFaqIndex === idx && (<div className="px-5 pb-4"><p className="text-sm text-zinc-400 leading-relaxed">{item.a}</p></div>)}
              </div>
            ))}
          </div>
        </div>

        <div className="text-center pb-12">
          <div className="p-8 sm:p-12 rounded-2xl bg-gradient-to-b from-violet-500/10 to-transparent border border-violet-500/20">
            <div className="flex justify-center gap-0.5 mb-4">{[1, 2, 3, 4, 5].map(i => (<Star key={i} size={20} className="text-amber-400 fill-amber-400" />))}</div>
            <h3 className="text-2xl font-bold text-white mb-3">Ready to turn happy customers into your best marketing?</h3>
            <p className="text-zinc-400 mb-6 max-w-md mx-auto">Start collecting, managing, and sharing testimonials with Panda Praise today.</p>
            <Link to="/signup" className="inline-flex items-center gap-2 px-8 py-3 rounded-xl text-sm font-semibold bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white shadow-lg shadow-violet-500/20 transition-all duration-200">Get Started Free<ArrowRight size={16} /></Link>
          </div>
        </div>
      </div>

      <footer className="border-t border-white/10 py-8 text-xs text-zinc-500">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start gap-2"><PandaPraiseIcon size={20} /><span>© 2026 Panda Praise Ltd. All rights reserved.</span></div>
          <div className="flex items-center justify-center gap-6"><Link to="/" className="hover:text-zinc-300 transition-colors">Home</Link><Link to="/terms" className="hover:text-zinc-300 transition-colors">Terms of Service</Link><Link to="/privacy-policy" className="hover:text-zinc-300 transition-colors">Privacy Policy</Link></div>
        </div>
      </footer>
    </div>
  );
};