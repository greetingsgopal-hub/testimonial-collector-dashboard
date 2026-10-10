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
    <div className="min-h-screen bg-slate-50 text-slate-800 relative selection:bg-purple-100 selection:text-[#6701e6]">
      {/* Ambient background glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-100/40 via-slate-50 to-slate-50 pointer-events-none" />

      {/* Header */}
      <header className="sticky top-0 z-40 w-full bg-white/80 backdrop-blur-md border-b border-gray-200/80">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <PandaPraiseIcon size={36} colorMode="gradient" className="shrink-0" />
            <div className="flex items-center gap-1.5">
              <span className="font-display font-extrabold text-lg text-gray-900 tracking-tight">
                Panda <span className="bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">Praise</span>
              </span>
            </div>
          </Link>

          <Link
            to="/"
            className="px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold text-gray-700 bg-white border border-gray-200 shadow-2xs hover:bg-gray-50 hover:text-gray-900 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-gray-500" />
            <span>Back to Home</span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 relative z-10">
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="mb-6">
          <ol className="flex items-center space-x-2 text-xs text-gray-500 font-medium">
            <li>
              <Link to="/" className="hover:text-gray-900 transition-colors">Panda Praise</Link>
            </li>
            <li className="text-gray-300" aria-hidden="true">/</li>
            <li className="text-gray-900 font-semibold" aria-current="page">Refund Policy</li>
          </ol>
        </nav>

        <div className="mb-10 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-50 text-[#6701e6] text-xs font-bold mb-4 border border-purple-200">
            <RefreshCw className="w-3.5 h-3.5 text-[#6701e6]" />
            <span>Customer Satisfaction Guarantee</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold font-display text-gray-900 tracking-tight">
            Refund & Cancellation Policy
          </h1>
          <p className="text-sm text-gray-500 mt-2">
            Last updated: October 10, 2026
          </p>
        </div>

        <div className="space-y-6 text-sm text-gray-600 leading-relaxed">
          {/* Section 1: 14-Day Money Back Guarantee */}
          <section className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-200/90 shadow-xs space-y-3">
            <div className="flex items-center gap-2.5 text-gray-900 font-bold text-base">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <h2>14-Day Unconditional Money-Back Guarantee</h2>
            </div>
            <p>
              We want you to be 100% satisfied with Panda Praise. If Panda Praise does not help you collect more authentic reviews or elevate your brand credibility, you are entitled to a full refund within <strong className="text-gray-900 font-semibold">14 calendar days</strong> of your initial license purchase.
            </p>
            <p className="text-xs text-gray-500 bg-emerald-50/70 border border-emerald-200/80 p-3 rounded-xl text-emerald-800">
              ✓ Applies unconditionally to all paid license tiers, including the Founding Lifetime Deal Pass and Annual Pro subscriptions.
            </p>
          </section>

          {/* Section 2: Cancellation of Recurring Subscriptions */}
          <section className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-200/90 shadow-xs space-y-3">
            <div className="flex items-center gap-2.5 text-gray-900 font-bold text-base">
              <Clock className="w-5 h-5 text-[#6701e6]" />
              <h2>Subscription Cancellations</h2>
            </div>
            <p>
              You can cancel your recurring monthly or annual subscription at any time directly through your <strong className="text-gray-900">Workspace Settings &rarr; Billing</strong> tab or by sending an email to our support team.
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-gray-600">
              <li>Cancellations take effect immediately at the end of your current paid billing period.</li>
              <li>You will retain full access to all features, widgets, and collected testimonials until the period concludes.</li>
              <li>No further automatic renewal charges will be billed to your credit card or UPI mandate.</li>
            </ul>
          </section>

          {/* Section 3: Payout and Processing Timelines */}
          <section className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-200/90 shadow-xs space-y-3">
            <div className="flex items-center gap-2.5 text-gray-900 font-bold text-base">
              <CreditCard className="w-5 h-5 text-indigo-600" />
              <h2>Refund Processing Timelines</h2>
            </div>
            <p>
              Once approved by our support desk, refunds are automatically credited back to your original payment method:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="p-4 rounded-xl bg-gray-50 border border-gray-200">
                <p className="text-xs font-bold text-gray-900">Stripe / Credit & Debit Cards</p>
                <p className="text-[11px] text-gray-500 mt-1">Processed within 5 to 10 business days depending on your bank's clearance cycle.</p>
              </div>
              <div className="p-4 rounded-xl bg-gray-50 border border-gray-200">
                <p className="text-xs font-bold text-gray-900">Razorpay / UPI & NetBanking</p>
                <p className="text-[11px] text-gray-500 mt-1">Recredited directly to your originating VPA or bank account within 2 to 5 business days.</p>
              </div>
            </div>
          </section>

          {/* Section 4: Abuse & Exceptions */}
          <section className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-200/90 shadow-xs space-y-3">
            <div className="flex items-center gap-2.5 text-gray-900 font-bold text-base">
              <ShieldAlert className="w-5 h-5 text-amber-600" />
              <h2>Exceptions and Fair Use</h2>
            </div>
            <p className="text-gray-600">
              To protect our creator community against fraudulent exploitation, refund requests may be declined if:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-gray-500 text-xs">
              <li>The refund request is initiated after 14 calendar days from the purchase date.</li>
              <li>An account is found to have systematically scraped thousands of customer reviews using automated bots prior to requesting a refund.</li>
              <li>An account is terminated due to terms-of-service violations (e.g., hosting abusive, deceptive, or defamatory content).</li>
            </ul>
          </section>

          {/* Section 5: How to Claim */}
          <section className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-200/90 shadow-xs space-y-3">
            <div className="flex items-center gap-2.5 text-gray-900 font-bold text-base">
              <Mail className="w-5 h-5 text-purple-600" />
              <h2>Requesting a Refund</h2>
            </div>
            <p>
              To initiate a refund, please send an email to our support desk with your workspace ID and purchase receipt:
            </p>
            <div className="p-4 rounded-xl bg-purple-50/70 border border-purple-200 text-[#6701e6] font-mono text-xs font-bold flex items-center justify-between">
              <span>support@pandapraise.com</span>
              <span className="text-[11px] font-sans text-purple-700 bg-purple-100/80 px-2 py-0.5 rounded-md">24h response time</span>
            </div>
            <p className="text-xs text-gray-500">
              Our team reviews and processes all refund and billing inquiries within 24 business hours.
            </p>
          </section>
        </div>

        {/* Footer */}
        <div className="mt-12 pt-6 border-t border-gray-200 flex flex-wrap items-center justify-between text-xs text-gray-500 gap-4">
          <span>© 2026 Panda Praise Ltd. All rights reserved.</span>
          <div className="flex items-center gap-4">
            <Link to="/terms" className="hover:text-gray-900 transition-colors">Terms of Service</Link>
            <Link to="/privacy-policy" className="hover:text-gray-900 transition-colors">Privacy Policy</Link>
            <Link to="/pricing" className="hover:text-gray-900 transition-colors">Pricing</Link>
          </div>
        </div>
      </main>
    </div>
  );
};
