import React, { useState } from 'react';
import {
  DollarSign,
  TrendingUp,
  Share2,
  Copy,
  Check,
  Gift,
  Zap,
  CreditCard,
  Users,
} from 'lucide-react';
import {
  AffiliateProfile,
  getStoredAffiliateProfile,
  saveAffiliateProfile,
  createDefaultAffiliateProfile,
  buildAffiliateReferralUrl,
} from '../lib/affiliate';
import { usePageSeo } from '../lib/seo';

export const AffiliatePage: React.FC = () => {
  usePageSeo({
    title: 'Partner & Affiliate Program — Panda Praise',
    description: 'Earn 30% to 40% lifetime recurring commission on every customer you refer to PandaPraise.',
  });

  const [profile, setProfile] = useState<AffiliateProfile>(() => {
    return getStoredAffiliateProfile() || createDefaultAffiliateProfile('growthpartner', 'Alex Rivera', 'alex@growthlabs.com', 'standard');
  });

  const [copiedLink, setCopiedLink] = useState(false);
  const [calculatorCustomers, setCalculatorCustomers] = useState(25);
  const [calculatorPlanPrice, setCalculatorPlanPrice] = useState(49);
  const [selectedTier, setSelectedTier] = useState<'standard' | 'agency'>('standard');
  const [payoutLoading, setPayoutLoading] = useState(false);
  const [payoutSuccess, setPayoutSuccess] = useState(false);

  const referralUrl = buildAffiliateReferralUrl(profile.slug, window.location.origin);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleConnectStripe = async () => {
    setPayoutLoading(true);
    try {
      const res = await fetch('/api/affiliates/payout-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug: profile.slug }),
      });
      const data = await res.json();
      if (data.onboardingUrl) {
        setPayoutSuccess(true);
        const updated = { ...profile, stripeConnected: true };
        setProfile(updated);
        saveAffiliateProfile(updated);
      }
    } catch (err) {
      console.error('Failed to initiate payout onboarding:', err);
    } finally {
      setPayoutLoading(false);
    }
  };

  const calculatedMonthly = Math.round(calculatorCustomers * calculatorPlanPrice * (selectedTier === 'agency' ? 0.4 : 0.3));
  const calculatedAnnual = calculatedMonthly * 12;

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans antialiased selection:bg-[#6701e6] selection:text-white">
      {/* Top Navigation */}
      <nav className="border-b border-gray-100 sticky top-0 bg-white/90 backdrop-blur-md z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2.5 font-black text-xl text-gray-900 tracking-tight">
            <span className="w-8 h-8 rounded-xl bg-[#6701e6] text-white flex items-center justify-center font-bold text-sm shadow-md shadow-purple-500/20">
              🐼
            </span>
            Panda<span className="text-[#6701e6]">Praise</span>
            <span className="ml-2 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-purple-50 text-[#6701e6] border border-purple-100">
              Partners
            </span>
          </a>
          <div className="flex items-center gap-3">
            <a href="/login" className="text-xs font-semibold text-gray-600 hover:text-gray-900 px-3 py-2">
              Log In
            </a>
            <a
              href="#portal"
              className="px-4 py-2 rounded-xl text-xs font-bold bg-[#6701e6] hover:bg-[#5200bd] text-white transition-all shadow-md shadow-purple-500/20"
            >
              Affiliate Portal
            </a>
          </div>
        </div>
      </nav>

      {/* Hero Header */}
      <section className="pt-16 pb-12 sm:pt-24 sm:pb-16 bg-gradient-to-b from-purple-50/50 via-white to-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-100/80 text-[#6701e6] text-xs font-bold mb-6">
            <Gift size={14} />
            30% — 40% Lifetime Recurring Commission
          </div>
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-gray-900 tracking-tight leading-[1.1]">
            Turn Your Audience Into <br />
            <span className="bg-gradient-to-r from-[#6701e6] to-indigo-600 bg-clip-text text-transparent">
              High-Yield Monthly Income
            </span>
          </h1>
          <p className="mt-5 text-base sm:text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Every business needs testimonials to convert visitors. Partner with PandaPraise and get paid every single month for every customer you refer, forever.
          </p>
        </div>
      </section>

      {/* Calculator Section */}
      <section className="py-12 bg-gray-50 border-y border-gray-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/80 shadow-xl shadow-purple-500/5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Affiliate Earnings Calculator</h3>
                <p className="text-xs text-gray-500">Estimate your recurring income based on referred paid customers.</p>
              </div>
              <div className="flex items-center gap-1.5 p-1 bg-gray-100 rounded-xl">
                <button
                  onClick={() => setSelectedTier('standard')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    selectedTier === 'standard' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  Standard (30%)
                </button>
                <button
                  onClick={() => setSelectedTier('agency')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    selectedTier === 'agency' ? 'bg-[#6701e6] text-white shadow-xs' : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  Agency (40%)
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              <div className="space-y-5">
                <div>
                  <div className="flex justify-between text-xs font-bold text-gray-700 mb-2">
                    <span>Referred Customers: {calculatorCustomers}</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="150"
                    step="5"
                    value={calculatorCustomers}
                    onChange={(e) => setCalculatorCustomers(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#6701e6]"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-bold text-gray-700 mb-2">
                    <span>Average Plan: ${calculatorPlanPrice}/month</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { name: 'Starter', price: 19 },
                      { name: 'Pro', price: 49 },
                      { name: 'Business', price: 99 },
                    ].map((p) => (
                      <button
                        key={p.price}
                        onClick={() => setCalculatorPlanPrice(p.price)}
                        className={`p-2.5 rounded-xl border text-center transition-all ${
                          calculatorPlanPrice === p.price
                            ? 'border-[#6701e6] bg-purple-50/50 text-[#6701e6] font-bold'
                            : 'border-gray-200 bg-gray-50 text-gray-600 hover:border-gray-300'
                        }`}
                      >
                        <div className="text-xs">{p.name}</div>
                        <div className="text-sm font-bold">${p.price}/mo</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-900 to-indigo-950 rounded-2xl p-6 text-white text-center shadow-lg">
                <p className="text-xs font-medium text-purple-200 uppercase tracking-wider">Your Estimated Earnings</p>
                <div className="text-4xl sm:text-5xl font-black mt-2 text-white tracking-tight">
                  ${calculatedMonthly.toLocaleString()}
                  <span className="text-lg font-semibold text-purple-300">/month</span>
                </div>
                <div className="mt-2 text-sm text-purple-200 font-medium">
                  = ${calculatedAnnual.toLocaleString()} recurring every year
                </div>
                <p className="mt-4 text-[11px] text-purple-300/80">
                  Paid monthly via direct bank deposit or Stripe Connect. 60-day attribution cookie.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Live Affiliate Dashboard / Portal */}
      <section id="portal" className="py-12 sm:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-5">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#6701e6]">Partner Command Center</span>
              <h2 className="text-2xl font-bold text-gray-900 mt-1">Your Live Referral Hub</h2>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                Active Partner ({profile.commissionRate * 100}% Recurring)
              </span>
            </div>
          </div>

          {/* Referral Link Box */}
          <div className="p-6 rounded-3xl bg-purple-50/50 border border-purple-100 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                <Share2 size={14} className="text-[#6701e6]" />
                Your Unique Affiliate Referral Link
              </label>
              <span className="text-[11px] text-gray-500 font-medium">60-Day Cookie Attribution</span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={referralUrl}
                className="w-full px-4 py-3 text-xs sm:text-sm font-mono rounded-xl bg-white border border-gray-300 text-gray-900 focus:outline-none select-all"
              />
              <button
                onClick={handleCopyLink}
                className="flex items-center gap-1.5 px-5 py-3 rounded-xl text-xs font-bold bg-[#6701e6] hover:bg-[#5200bd] text-white transition-all shadow-md shadow-purple-500/20 whitespace-nowrap cursor-pointer"
              >
                {copiedLink ? <Check size={14} /> : <Copy size={14} />}
                {copiedLink ? 'Copied!' : 'Copy Link'}
              </button>
            </div>
          </div>

          {/* Performance Stats Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-white border border-gray-200 shadow-xs">
              <div className="text-xs text-gray-500 font-medium flex items-center gap-1.5">
                <Users size={14} className="text-gray-400" />
                Referral Clicks
              </div>
              <div className="text-2xl font-black text-gray-900 mt-2">{profile.clicks}</div>
              <div className="text-[11px] text-gray-500 font-medium mt-1">
                {profile.clicks > 0 ? 'Unique visits tracked' : 'Share link to start'}
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-gray-200 shadow-xs">
              <div className="text-xs text-gray-500 font-medium flex items-center gap-1.5">
                <Zap size={14} className="text-gray-400" />
                Conversions
              </div>
              <div className="text-2xl font-black text-gray-900 mt-2">{profile.conversions}</div>
              <div className="text-[11px] text-purple-600 font-semibold mt-1">
                {profile.clicks > 0
                  ? `${((profile.conversions / profile.clicks) * 100).toFixed(1)}% conv. rate`
                  : '0.0% conv. rate'}
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-gray-200 shadow-xs">
              <div className="text-xs text-gray-500 font-medium flex items-center gap-1.5">
                <TrendingUp size={14} className="text-gray-400" />
                Attributed MRR
              </div>
              <div className="text-2xl font-black text-gray-900 mt-2">${profile.totalRevenueAttributedUsd}</div>
              <div className="text-[11px] text-gray-500 font-medium mt-1">Active customer spend</div>
            </div>

            <div className="p-5 rounded-2xl bg-purple-50/70 border border-purple-200 shadow-xs">
              <div className="text-xs text-[#6701e6] font-bold flex items-center gap-1.5">
                <DollarSign size={14} className="text-[#6701e6]" />
                Unpaid Balance
              </div>
              <div className="text-2xl font-black text-[#6701e6] mt-2">${profile.unpaidEarningsUsd}</div>
              <div className="text-[11px] text-purple-700 font-semibold mt-1">
                {profile.unpaidEarningsUsd > 0 ? 'Payout scheduled 1st' : 'Net-30 automatic payout'}
              </div>
            </div>
          </div>

          {/* Automated Stripe Connect Payout Setup */}
          <div className="p-6 rounded-3xl bg-white border border-gray-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-100 text-[#6701e6] flex items-center justify-center shrink-0">
                <CreditCard size={20} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-gray-900">Direct Payouts via Stripe Connect</h4>
                <p className="text-xs text-gray-500 mt-0.5">
                  Connect your bank account or debit card for zero-fee automatic monthly payouts.
                </p>
                {(profile.stripeConnected || payoutSuccess) && (
                  <span className="inline-flex items-center gap-1 mt-2 text-xs font-semibold text-emerald-600">
                    <Check size={13} /> Stripe Connect Account Verified
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={handleConnectStripe}
              disabled={payoutLoading || profile.stripeConnected || payoutSuccess}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                (profile.stripeConnected || payoutSuccess)
                  ? 'bg-gray-100 text-gray-500 cursor-default'
                  : 'bg-[#6701e6] hover:bg-[#5200bd] text-white shadow-md shadow-purple-500/20'
              }`}
            >
              {payoutLoading ? 'Connecting...' : (profile.stripeConnected || payoutSuccess) ? 'Account Connected' : 'Connect Stripe Account'}
            </button>
          </div>

          {/* Tier Comparison */}
          <div className="pt-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Partner Tiers & Benefits</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-6 rounded-2xl bg-white border border-gray-200 space-y-3">
                <div className="flex justify-between items-start">
                  <h4 className="font-bold text-gray-900">Standard Affiliate</h4>
                  <span className="px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-700 text-xs font-bold">30% Lifetime</span>
                </div>
                <p className="text-xs text-gray-500">Perfect for creators, bloggers, software review sites, and SaaS founders.</p>
                <ul className="text-xs text-gray-700 space-y-2 pt-2">
                  <li className="flex items-center gap-2"><Check size={14} className="text-emerald-500" /> 30% recurring commission on all plans</li>
                  <li className="flex items-center gap-2"><Check size={14} className="text-emerald-500" /> 60-day attribution cookie window</li>
                  <li className="flex items-center gap-2"><Check size={14} className="text-emerald-500" /> Real-time click and conversion tracking</li>
                  <li className="flex items-center gap-2"><Check size={14} className="text-emerald-500" /> Promotional banner and copy pack</li>
                </ul>
              </div>

              <div className="p-6 rounded-2xl bg-gradient-to-br from-purple-50 to-indigo-50/50 border border-purple-200 space-y-3">
                <div className="flex justify-between items-start">
                  <h4 className="font-bold text-[#6701e6]">Agency & Enterprise Partner</h4>
                  <span className="px-2.5 py-0.5 rounded-full bg-[#6701e6] text-white text-xs font-bold">40% Lifetime</span>
                </div>
                <p className="text-xs text-gray-600">Built for marketing agencies, Webflow/Shopify design shops, and consultancies.</p>
                <ul className="text-xs text-gray-800 space-y-2 pt-2">
                  <li className="flex items-center gap-2"><Check size={14} className="text-[#6701e6]" /> 40% recurring commission on all customer seats</li>
                  <li className="flex items-center gap-2"><Check size={14} className="text-[#6701e6]" /> Multi-client workspace management dashboard</li>
                  <li className="flex items-center gap-2"><Check size={14} className="text-[#6701e6]" /> Co-branded client portals & white-label options</li>
                  <li className="flex items-center gap-2"><Check size={14} className="text-[#6701e6]" /> Dedicated partner support manager</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-8 bg-gray-50 text-center text-xs text-gray-500">
        <p>© 2026 PandaPraise. All rights reserved. PandaPraise Partner Agreement applies.</p>
      </footer>
    </div>
  );
};
