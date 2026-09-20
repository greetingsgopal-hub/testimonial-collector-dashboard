import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Check,
  X,
  Sparkles,
  ArrowRight,
  Crown,
  Zap,
  Shield,
  ChevronDown,
  Star,
  HelpCircle,
} from 'lucide-react';
import { usePageSeo } from '../lib/seo';
import { PandaPraiseIcon } from '../components/PandaPraiseLogo';
import { PLAN_PRICING } from '../lib/planLimits';
import { PlanTier } from '../types';

interface PlanFeature {
  name: string;
  free: string | boolean;
  starter: string | boolean;
  pro: string | boolean;
  tooltip?: string;
}

const FEATURES: PlanFeature[] = [
  { name: 'Testimonials', free: 'Up to 15', starter: 'Unlimited', pro: 'Unlimited' },
  { name: 'Projects', free: '1', starter: '1', pro: '5 (add-ons available)' },
  { name: 'Team seats', free: '1', starter: '2', pro: '5 (add-ons available)' },
  { name: 'Collection forms', free: true, starter: true, pro: true },
  { name: 'Text & video testimonials', free: true, starter: true, pro: true },
  { name: 'Widget views', free: 'Unlimited', starter: 'Unlimited', pro: 'Unlimited' },
  { name: 'Wall of Love', free: true, starter: true, pro: true },
  { name: 'Social card creator', free: true, starter: true, pro: true },
  { name: 'CSV & JSON export', free: true, starter: true, pro: true },
  { name: 'Remove Panda Praise branding', free: false, starter: true, pro: true },
  { name: 'HD video quality', free: false, starter: true, pro: true },
  { name: 'Custom domain', free: false, starter: true, pro: true, tooltip: 'Point your own domain to your Wall of Love' },
  { name: 'Import from 30+ platforms', free: false, starter: true, pro: true },
  { name: 'API access', free: false, starter: true, pro: true },
  { name: 'Webhooks', free: false, starter: true, pro: true },
  { name: 'Zapier integration', free: false, starter: true, pro: true },
  { name: 'Sentiment analysis', free: false, starter: true, pro: true },
  { name: 'Rich Snippets (SEO)', free: false, starter: false, pro: true, tooltip: 'Show star ratings in Google search results' },
  { name: 'Testimonial translation', free: false, starter: false, pro: true },
  { name: 'AI case study generator', free: false, starter: false, pro: true },
  { name: 'Priority support', free: false, starter: false, pro: true },
];

const FAQ_ITEMS = [
  {
    q: 'Can I try Panda Praise before paying?',
    a: 'Yes! The Free plan is fully functional and never expires. Use it as long as you like. When you need more features or testimonials, upgrade anytime.',
  },
  {
    q: 'Can I cancel my subscription?',
    a: 'Absolutely. Cancel anytime from your billing dashboard. You\'ll keep your current plan until the end of the billing period, then you\'ll be moved to the Free plan.',
  },
  {
    q: 'What happens to my testimonials if I downgrade?',
    a: 'Your testimonials are safe. If you exceed the Free plan limit, older testimonials will be hidden (not deleted) until you upgrade again or remove some.',
  },
  {
    q: 'Can I add more projects or seats to the Pro plan?',
    a: 'Yes! On the Pro plan, you can purchase additional projects ($10/mo each) and team seats ($5/mo each) as add-ons.',
  },
  {
    q: 'Do you offer annual billing?',
    a: 'Yes. Save up to 20% with annual billing. Toggle between monthly and annual pricing on this page to see the difference.',
  },
];

export const PricingPage = () => {
  usePageSeo({
    title: 'Pricing — Panda Praise',
    description: 'Simple, transparent pricing for testimonial collection. Start free, upgrade when you need more.',
  });

  const [isAnnual, setIsAnnual] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  const getPrice = (plan: PlanTier) => {
    const pricing = PLAN_PRICING[plan];
    return isAnnual ? pricing.annual : pricing.monthly;
  };

  const plans: { tier: PlanTier; badge?: string; highlighted?: boolean }[] = [
    { tier: 'free' },
    { tier: 'starter', badge: 'Most Popular', highlighted: true },
    { tier: 'pro', badge: 'Best Value' },
  ];

  const planIcons: Record<PlanTier, typeof Zap> = {
    free: Sparkles,
    starter: Zap,
    pro: Crown,
  };

  const planGradients: Record<PlanTier, string> = {
    free: 'from-zinc-500 to-zinc-600',
    starter: 'from-violet-500 to-purple-600',
    pro: 'from-amber-500 to-orange-600',
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      {/* Header */}
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
            <Link
              to="/signup"
              className="px-4 py-2 rounded-lg text-sm font-medium bg-violet-600 hover:bg-violet-500 text-white transition-colors"
            >
              Get Started Free
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-16 sm:py-24">
        {/* Hero */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 text-xs font-medium mb-6">
            <Shield size={12} />
            Simple, transparent pricing
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white mb-4 leading-tight">
            Start free. Upgrade when<br className="hidden sm:block" /> you're ready to grow.
          </h1>
          <p className="text-lg text-zinc-400 max-w-xl mx-auto mb-8">
            No credit card required. No hidden fees. Cancel anytime.
          </p>

          {/* Billing Toggle */}
          <div className="inline-flex items-center gap-3 bg-white/5 rounded-full p-1 border border-white/10">
            <button
              onClick={() => setIsAnnual(false)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200
                ${!isAnnual ? 'bg-violet-600 text-white shadow-lg' : 'text-zinc-400 hover:text-zinc-200'}`}
            >
              Monthly
            </button>
            <button
              onClick={() => setIsAnnual(true)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 flex items-center gap-1.5
                ${isAnnual ? 'bg-violet-600 text-white shadow-lg' : 'text-zinc-400 hover:text-zinc-200'}`}
            >
              Annual
              <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300">
                SAVE 20%
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
          {plans.map(({ tier, badge, highlighted }) => {
            const Icon = planIcons[tier];
            const price = getPrice(tier);
            const pricing = PLAN_PRICING[tier];

            return (
              <div
                key={tier}
                className={`relative rounded-2xl p-6 sm:p-8 transition-all duration-300
                  ${highlighted
                    ? 'bg-gradient-to-b from-violet-500/10 to-purple-500/5 border-2 border-violet-500/30 shadow-2xl shadow-violet-500/10 scale-[1.02]'
                    : 'bg-white/[0.02] border border-white/10 hover:border-white/20'}`}
              >
                {badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold
                      ${tier === 'starter'
                        ? 'bg-violet-600 text-white'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'}`}>
                      {badge}
                    </span>
                  </div>
                )}

                <div className="mb-6">
                  <div className={`inline-flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br ${planGradients[tier]} mb-4`}>
                    <Icon size={18} className="text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white">{pricing.name}</h3>
                  <p className="text-sm text-zinc-500 mt-1">{pricing.tagline}</p>
                </div>

                <div className="mb-6">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-extrabold text-white">
                      ${price}
                    </span>
                    {price > 0 && (
                      <span className="text-sm text-zinc-500">/mo</span>
                    )}
                  </div>
                  {isAnnual && price > 0 && (
                    <p className="text-xs text-zinc-500 mt-1">
                      Billed ${price * 12}/year
                    </p>
                  )}
                </div>

                <Link
                  to="/signup"
                  className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all duration-200
                    ${highlighted
                      ? 'bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white shadow-lg shadow-violet-500/20'
                      : 'bg-white/5 hover:bg-white/10 text-zinc-200 border border-white/10'}`}
                >
                  {tier === 'free' ? 'Start Free' : `Start with ${pricing.name}`}
                  <ArrowRight size={16} />
                </Link>

                {/* Quick feature list */}
                <ul className="mt-6 space-y-2.5">
                  {FEATURES.slice(0, 9).map((f) => {
                    const val = f[tier];
                    const isAvailable = val === true || (typeof val === 'string' && val !== '');
                    return (
                      <li key={f.name} className="flex items-start gap-2.5 text-sm">
                        {isAvailable ? (
                          <Check size={15} className="text-emerald-400 flex-shrink-0 mt-0.5" />
                        ) : (
                          <X size={15} className="text-zinc-600 flex-shrink-0 mt-0.5" />
                        )}
                        <span className={isAvailable ? 'text-zinc-300' : 'text-zinc-600'}>
                          {typeof val === 'string' ? `${f.name}: ${val}` : f.name}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </div>

        {/* Feature Comparison Table */}
        <div className="mb-20">
          <h2 className="text-2xl font-bold text-white text-center mb-8">Feature Comparison</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-3 px-4 text-zinc-400 font-medium">Feature</th>
                  <th className="text-center py-3 px-4 text-zinc-400 font-medium w-28">Free</th>
                  <th className="text-center py-3 px-4 text-violet-300 font-medium w-28">Starter</th>
                  <th className="text-center py-3 px-4 text-amber-300 font-medium w-28">Pro</th>
                </tr>
              </thead>
              <tbody>
                {FEATURES.map((f, idx) => (
                  <tr key={f.name} className={`border-b border-white/5 ${idx % 2 === 0 ? 'bg-white/[0.01]' : ''}`}>
                    <td className="py-3 px-4 text-zinc-300 flex items-center gap-1.5">
                      {f.name}
                      {f.tooltip && (
                        <span className="group relative">
                          <HelpCircle size={13} className="text-zinc-600 cursor-help" />
                          <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 rounded-lg bg-zinc-800 text-xs text-zinc-300 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none border border-white/10">
                            {f.tooltip}
                          </span>
                        </span>
                      )}
                    </td>
                    {(['free', 'starter', 'pro'] as PlanTier[]).map(tier => {
                      const val = f[tier];
                      return (
                        <td key={tier} className="text-center py-3 px-4">
                          {val === true ? (
                            <Check size={16} className="text-emerald-400 mx-auto" />
                          ) : val === false ? (
                            <X size={16} className="text-zinc-700 mx-auto" />
                          ) : (
                            <span className="text-zinc-300">{val}</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* FAQ */}
        <div className="max-w-2xl mx-auto mb-20">
          <h2 className="text-2xl font-bold text-white text-center mb-8">Frequently Asked Questions</h2>
          <div className="space-y-3">
            {FAQ_ITEMS.map((item, idx) => (
              <div
                key={idx}
                className="rounded-xl border border-white/10 overflow-hidden transition-colors hover:border-white/15"
              >
                <button
                  onClick={() => setOpenFaqIndex(openFaqIndex === idx ? null : idx)}
                  className="w-full flex items-center justify-between px-5 py-4 text-left"
                >
                  <span className="text-sm font-medium text-zinc-200">{item.q}</span>
                  <ChevronDown
                    size={16}
                    className={`text-zinc-500 flex-shrink-0 ml-4 transition-transform duration-200
                      ${openFaqIndex === idx ? 'rotate-180' : ''}`}
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

        {/* Final CTA */}
        <div className="text-center pb-12">
          <div className="p-8 sm:p-12 rounded-2xl bg-gradient-to-b from-violet-500/10 to-transparent border border-violet-500/20">
            <div className="flex justify-center gap-0.5 mb-4">
              {[1, 2, 3, 4, 5].map(i => (
                <Star key={i} size={20} className="text-amber-400 fill-amber-400" />
              ))}
            </div>
            <h3 className="text-2xl font-bold text-white mb-3">
              Ready to turn happy customers into your best marketing?
            </h3>
            <p className="text-zinc-400 mb-6 max-w-md mx-auto">
              Join thousands of businesses using Panda Praise to collect, manage, and share testimonials.
            </p>
            <Link
              to="/signup"
              className="inline-flex items-center gap-2 px-8 py-3 rounded-xl text-sm font-semibold
                       bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500
                       text-white shadow-lg shadow-violet-500/20 transition-all duration-200"
            >
              Get Started Free
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
