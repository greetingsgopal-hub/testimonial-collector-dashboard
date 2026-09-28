import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Check,
  X,
  ArrowRight,
  Crown,
  Shield,
  ChevronDown,
  Star,
  HelpCircle,
  Gem,
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
      { name: 'Text & video testimonials', free: true, paid: true },
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
      { name: 'HD video quality', free: false, paid: true },
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
    a: 'Founding Members pay $150 once and get lifetime access to Panda Praise. This is a limited early-supporter offer before we move to subscription-only pricing.',
  },
  {
    q: 'What happens after I pay $150?',
    a: 'You get lifetime access to all current and future features. No recurring charges. Ever.',
  },
  {
    q: 'Can I just subscribe instead?',
    a: 'Yes. You can pay $10/month (billed monthly) or $5/month (billed annually as $60). Founding Member is the better deal if you plan to use Panda Praise long-term.',
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
    title: 'Pricing — Panda Praise',
    description: 'Lifetime access for $150 — pay once, use forever. Or subscribe at $5/month (billed annually).',
  });

  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  const { user } = useAuth();
  const [checkoutLoading, setCheckoutLoading] = useState<'founding' | 'subscription' | null>(null);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  const handleCheckout = async (plan: 'founding' | 'subscription') => {
    setCheckoutError(null);
    if (!user) {
      window.location.href = '/login';
      return;
    }
    setCheckoutLoading(plan);
    try {
      setCheckoutError('Checkout is not yet configured. Please contact support@pandapraise.com to purchase.');
    } catch {
      setCheckoutError('Failed to start checkout. Please try again.');
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
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 text-xs font-medium mb-6">
            <Shield size={12} />
            Simple pricing
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white mb-3 leading-tight">Pay once. Use forever.</h1>
          <p className="text-lg text-zinc-400 max-w-xl mx-auto">Founding members lock in lifetime access. Or subscribe month-to-month.</p>
        </div>

        {checkoutError && <div className="max-w-2xl mx-auto mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-sm text-center">{checkoutError}</div>}

        <div className="max-w-2xl mx-auto mb-12">
          <div className="relative rounded-3xl bg-gradient-to-b from-violet-500/20 to-purple-500/10 border-2 border-violet-500/40 p-8 sm:p-10 shadow-2xl shadow-violet-500/20">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <span className="px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-extrabold uppercase tracking-wider shadow-lg flex items-center gap-1.5"><Gem size={12} />Founding Member</span>
            </div>
            <div className="text-center">
              <div className="flex items-baseline justify-center gap-2 mb-2">
                <span className="text-6xl sm:text-7xl font-black text-white">$150</span>
                <span className="text-lg font-bold text-violet-300">ONE TIME</span>
              </div>
              <p className="text-violet-200 font-semibold mb-6">Pay once. Use Panda Praise for life.</p>
              <p className="text-sm text-zinc-400 mb-6 max-w-md mx-auto">Founding members lock in lifetime access before regular pricing.<span className="block mt-1 text-zinc-500">Designed to deliver long-term value.</span></p>
              <button type="button" onClick={() => handleCheckout('founding')} disabled={checkoutLoading !== null} className="w-full sm:w-auto px-8 py-4 rounded-2xl text-base font-bold bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white shadow-lg shadow-violet-500/30 transition-all disabled:opacity-50 flex items-center justify-center gap-2 mx-auto">{checkoutLoading === 'founding' ? 'Starting checkout…' : <><Crown size={18} className="text-amber-400" />Become a Founding Member</>}</button>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 max-w-2xl mx-auto mb-12">
          <div className="flex-1 h-px bg-white/10" />
          <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Or subscribe</span>
          <div className="flex-1 h-px bg-white/10" />
        </div>

        <div className="max-w-2xl mx-auto mb-20">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="relative rounded-2xl bg-gradient-to-b from-emerald-500/15 to-emerald-500/5 border-2 border-emerald-500/40 p-6 text-left">
              <div className="absolute -top-2.5 left-4"><span className="px-2.5 py-1 rounded-full bg-emerald-500 text-white text-[10px] font-extrabold uppercase tracking-wider shadow-md">Best Value</span></div>
              <p className="text-xs font-bold text-emerald-300 uppercase tracking-wider mb-1">Annual</p>
              <div className="flex items-baseline gap-1 mb-2"><span className="text-4xl font-black text-white">$5</span><span className="text-sm text-zinc-400">/month</span></div>
              <p className="text-xs text-zinc-400 mb-4">$60 billed annually</p>
              <p className="text-[11px] text-emerald-300 font-medium">Save 50% vs monthly</p>
            </div>
            <div className="relative rounded-2xl bg-white/[0.03] border border-white/10 p-6 text-left">
              <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1">Monthly</p>
              <div className="flex items-baseline gap-1 mb-2"><span className="text-4xl font-black text-white">$10</span><span className="text-sm text-zinc-400">/month</span></div>
              <p className="text-xs text-zinc-500 mb-4">Billed monthly</p>
              <p className="text-[11px] text-zinc-600">Cancel anytime</p>
            </div>
          </div>
          <p className="text-center text-xs text-zinc-500 mt-4">Both plans include the same features. Annual saves you money.</p>
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