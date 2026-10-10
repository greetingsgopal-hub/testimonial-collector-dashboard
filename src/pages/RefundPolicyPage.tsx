import { Link } from 'react-router-dom';
import { ArrowLeft, RefreshCw, CheckCircle2, Clock, Mail, ShieldAlert, CreditCard } from 'lucide-react';
import { usePageSeo } from '../lib/seo';
import { PandaPraiseIcon } from '../components/PandaPraiseLogo';

export const RefundPolicyPage = () => {
  usePageSeo({
    title: 'Refund & Cancellation Policy — Panda Praise',
    description: "Panda Praise's 14-day money-back guarantee, refund terms, and subscription cancellation guidelines.",
    canonical: `${window.location.origin}/refund-policy`,
  });

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 selection:bg-brand-500/30 selection:text-brand-200 relative overflow-hidden">
      {/* Ambient background glow */}
      <div className="ambient-glow" />

      {/* Header */}
      <header className="sticky top-0 z-40 w-full glass-panel border-b border-zinc-800/80 backdrop-blur-xl">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <PandaPraiseIcon size={36} colorMode="gradient" className="shrink-0" />
            <div className="flex items-center gap-1.5">
              <span className="font-display font-extrabold text-lg text-white tracking-tight">
                Panda <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Praise</span>
              </span>
            </div>
          </Link>

          <Link
            to="/"
            className="px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium text-zinc-300 hover:text-white hover:bg-zinc-900 border border-zinc-800 transition-colors flex items-center gap-1.5"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Home</span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 relative z-10">
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="mb-6">
          <ol className="flex items-center space-x-2 text-xs text-zinc-400">
            <li>
              <Link to="/" className="hover:text-zinc-200 transition-colors">Panda Praise</Link>
            </li>
            <li className="text-zinc-600" aria-hidden="true">/</li>
            <li className="text-zinc-200 font-medium" aria-current="page">Refund Policy</li>
          </ol>
        </nav>

        <div className="mb-10 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-500/10 text-brand-300 text-xs font-semibold mb-4 border border-brand-500/25">
            <RefreshCw className="w-4 h-4 text-brand-400" />
            <span>Customer Satisfaction Guarantee</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold font-display text-white tracking-tight">
            Refund & Cancellation Policy
          </h1>
          <p className="text-sm text-zinc-400 mt-2">
            Last updated: October 10, 2026
          </p>
        </div>

        <div className="space-y-8 text-sm text-zinc-300 leading-relaxed">
          {/* Section 1: 14-Day Money Back Guarantee */}
          <section className="glass-panel p-6 sm:p-8 rounded-2xl border border-zinc-800 space-y-3">
            <div className="flex items-center gap-2.5 text-white font-semibold text-base">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <h2>14-Day Unconditional Money-Back Guarantee</h2>
            </div>
            <p>
              We want you to be 100% satisfied with Panda Praise. If Panda Praise does not help you collect more authentic reviews or elevate your brand credibility, you are entitled to a full refund within <strong>14 calendar days</strong> of your initial license purchase.
            </p>
            <p className="text-xs text-zinc-400">
              Applies to all paid license tiers, including the Founding Lifetime Deal Pass and Annual Pro subscriptions.
            </p>
          </section>

          {/* Section 2: Cancellation of Recurring Subscriptions */}
          <section className="glass-panel p-6 sm:p-8 rounded-2xl border border-zinc-800 space-y-3">
            <div className="flex items-center gap-2.5 text-white font-semibold text-base">
              <Clock className="w-5 h-5 text-brand-400" />
              <h2>Subscription Cancellations</h2>
            </div>
            <p>
              You can cancel your recurring monthly or annual plan at any time directly through your <strong>Workspace Settings &rarr; Billing</strong> tab or by contacting support.
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-zinc-400">
              <li>Cancellations take effect immediately at the end of your current paid billing period.</li>
              <li>You will retain full access to all features and active widgets until the period concludes.</li>
              <li>No further automatic renewals will be billed to your credit card or UPI mandate.</li>
            </ul>
          </section>

          {/* Section 3: Payout and Processing Timelines */}
          <section className="glass-panel p-6 sm:p-8 rounded-2xl border border-zinc-800 space-y-3">
            <div className="flex items-center gap-2.5 text-white font-semibold text-base">
              <CreditCard className="w-5 h-5 text-sky-400" />
              <h2>Refund Processing Timelines</h2>
            </div>
            <p>
              Once approved, refunds are processed back to the original method of payment:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800/80">
                <p className="text-xs font-bold text-white">Stripe / Credit & Debit Cards</p>
                <p className="text-[11px] text-zinc-400 mt-1">Processed within 5 to 10 business days depending on your bank.</p>
              </div>
              <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800/80">
                <p className="text-xs font-bold text-white">Razorpay / UPI & NetBanking</p>
                <p className="text-[11px] text-zinc-400 mt-1">Recredited directly to your originating VPA/account within 2 to 5 business days.</p>
              </div>
            </div>
          </section>

          {/* Section 4: Abuse & Exceptions */}
          <section className="glass-panel p-6 sm:p-8 rounded-2xl border border-zinc-800 space-y-3">
            <div className="flex items-center gap-2.5 text-white font-semibold text-base">
              <ShieldAlert className="w-5 h-5 text-amber-400" />
              <h2>Exceptions and Fair Use</h2>
            </div>
            <p className="text-zinc-400">
              To protect our creator community against fraudulent exploitation, refund requests may be declined if:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-zinc-400 text-xs">
              <li>The refund request is initiated after 14 calendar days from the purchase date.</li>
              <li>An account is found to have systematically scraped thousands of customer reviews using automated bots prior to requesting a refund.</li>
              <li>An account is terminated due to terms-of-service violations (e.g. hosting abusive or defamatory content).</li>
            </ul>
          </section>

          {/* Section 5: How to Claim */}
          <section className="glass-panel p-6 sm:p-8 rounded-2xl border border-zinc-800 space-y-3">
            <div className="flex items-center gap-2.5 text-white font-semibold text-base">
              <Mail className="w-5 h-5 text-purple-400" />
              <h2>Requesting a Refund</h2>
            </div>
            <p>
              To initiate a refund, please send an email to our support desk with your workspace ID and purchase receipt:
            </p>
            <div className="p-4 rounded-xl bg-brand-500/10 border border-brand-500/20 text-brand-200 font-mono text-xs">
              support@pandapraise.com
            </div>
            <p className="text-xs text-zinc-400">
              Our support team reviews and responds to all billing inquiries within 24 business hours.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
};
