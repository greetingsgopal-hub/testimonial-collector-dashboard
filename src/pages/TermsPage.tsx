import { Link } from 'react-router-dom';
import { 
  Scale, 
  ArrowLeft, 
  Shield, 
  FileCheck, 
  AlertTriangle, 
  LifeBuoy, 
  Mail, 
  CheckCircle,
  CreditCard 
} from 'lucide-react';
import { usePageSeo } from '../lib/seo';
import { PandaPraiseIcon } from '../components/PandaPraiseLogo';

export const TermsPage = () => {
  usePageSeo({
    title: 'Terms of Service — Panda Praise',
    description: 'Terms and conditions governing the use of the Panda Praise testimonial collection and widget display platform.',
    canonical: `${window.location.origin}/terms`,
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
            <li className="text-gray-900 font-semibold" aria-current="page">Terms of Service</li>
          </ol>
        </nav>

        <div className="mb-10 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-50 text-[#6701e6] text-xs font-bold mb-4 border border-purple-200">
            <FileCheck className="w-3.5 h-3.5 text-[#6701e6]" />
            <span>Legal Agreement</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold font-display text-gray-900 tracking-tight">
            Terms of Service
          </h1>
          <p className="text-sm text-gray-500 mt-2">
            Last updated: October 10, 2026
          </p>
        </div>

        <div className="space-y-6 text-sm text-gray-600 leading-relaxed">
          {/* Section 1 */}
          <section className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-200/90 shadow-xs space-y-3">
            <div className="flex items-center gap-2.5 text-gray-900 font-bold text-base">
              <Scale className="w-5 h-5 text-[#6701e6]" />
              <h2>1. Agreement & Services Provided</h2>
            </div>
            <p>
              By accessing or using Panda Praise ("the Service"), you agree to be bound by these Terms of Service. Panda Praise provides website owners and online businesses with software tools to create dedicated collection links, gather customer feedback, moderate testimonials through an administrative dashboard, and embed approved testimonials on their websites via embeddable widgets.
            </p>
            <p>
              If you do not agree to these Terms, you may not use the Service.
            </p>
          </section>

          {/* Section 2 */}
          <section className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-200/90 shadow-xs space-y-3">
            <div className="flex items-center gap-2.5 text-gray-900 font-bold text-base">
              <Shield className="w-5 h-5 text-[#6701e6]" />
              <h2>2. Account Registration & Security</h2>
            </div>
            <p>
              To manage collections and moderate testimonials, you must register for an account using a valid email address. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You agree to notify us immediately of any unauthorized access or security breach.
            </p>
          </section>

          {/* Section 3 */}
          <section className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-200/90 shadow-xs space-y-3">
            <div className="flex items-center gap-2.5 text-gray-900 font-bold text-base">
              <CheckCircle className="w-5 h-5 text-emerald-600" />
              <h2>3. Testimonial Collection & Submitter Rights</h2>
            </div>
            <p>
              When customers submit testimonials through your Panda Praise collection links, they provide explicit consent for the review content, name, role, and avatar to be displayed publicly. Panda Praise requires that all submitters agree to publish their feedback before submission.
            </p>
            <p>
              Customer contact information (such as email addresses) is collected strictly for verification by the business owner and is never made publicly accessible through Panda Praise widgets.
            </p>
          </section>

          {/* Section 4 */}
          <section className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-200/90 shadow-xs space-y-3">
            <div className="flex items-center gap-2.5 text-gray-900 font-bold text-base">
              <FileCheck className="w-5 h-5 text-[#6701e6]" />
              <h2>4. Moderation & Content Ownership</h2>
            </div>
            <p>
              You retain total editorial discretion over testimonials submitted to your collections. You are solely responsible for reviewing and approving testimonials before publication. Testimonials do not appear on your website until you explicitly mark them as "approved" in your dashboard.
            </p>
            <p>
              You may reject, archive, or delete testimonials at any time. Panda Praise does not claim ownership over the customer feedback submitted through your collections.
            </p>
          </section>

          {/* Section 5 */}
          <section className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-200/90 shadow-xs space-y-3">
            <div className="flex items-center gap-2.5 text-gray-900 font-bold text-base">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
              <h2>5. Acceptable Use Policy</h2>
            </div>
            <p>
              You agree not to use Panda Praise to:
            </p>
            <ul className="list-disc list-inside space-y-1.5 text-gray-500 pl-2">
              <li>Collect, store, or display defamatory, obscene, fraudulent, or unlawful content;</li>
              <li>Impersonate any person or misrepresent affiliations with third parties;</li>
              <li>Fabricate fake customer testimonials or engage in deceptive advertising practices;</li>
              <li>Attempt to reverse-engineer, exploit, or disrupt the Service infrastructure;</li>
              <li>Send unsolicited bulk communications (spam) using collection links.</li>
            </ul>
          </section>

          {/* Section 6 */}
          <section className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-200/90 shadow-xs space-y-3">
            <div className="flex items-center gap-2.5 text-gray-900 font-bold text-base">
              <Scale className="w-5 h-5 text-indigo-600" />
              <h2>6. Intellectual Property</h2>
            </div>
            <p>
              The Panda Praise platform, including its software code, user interface designs, logos, widget layouts, and documentation, is the exclusive property of Panda Praise and its licensors. You are granted a non-exclusive, revocable license to embed the Panda Praise widgets on your websites in accordance with these Terms.
            </p>
          </section>

          {/* Section 7 */}
          <section className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-200/90 shadow-xs space-y-3">
            <div className="flex items-center gap-2.5 text-gray-900 font-bold text-base">
              <LifeBuoy className="w-5 h-5 text-[#6701e6]" />
              <h2>7. Service Availability & Disclaimers</h2>
            </div>
            <p>
              The Service is provided on an "as is" and "as available" basis. While we strive to maintain uninterrupted service availability and fast widget delivery, we do not guarantee that the Service will be completely error-free or uninterrupted at all times. Routine maintenance, updates, or third-party cloud outages may occasionally affect availability.
            </p>
          </section>

          {/* Section 8 — Billing & 14-Day Refund Policy */}
          <section className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-200/90 shadow-xs space-y-3">
            <div className="flex items-center gap-2.5 text-gray-900 font-bold text-base">
              <CreditCard className="w-5 h-5 text-emerald-600" />
              <h2>8. Billing, Subscriptions & Refund Terms</h2>
            </div>
            <p>
              Paid plans are billed in advance on a monthly or annual basis, or as a one-time lifetime purchase, at the prices displayed on our pricing page at the time of purchase.
            </p>
            <p>
              All paid tiers (including Founding Lifetime Deals and Annual subscriptions) are backed by our <strong className="text-gray-900">14-Day Unconditional Money-Back Guarantee</strong>. You may request a refund within 14 calendar days of your initial purchase in accordance with our{' '}
              <Link to="/refund-policy" className="text-[#6701e6] hover:underline font-bold">
                Refund Policy
              </Link>.
            </p>
            <p>
              You may cancel recurring subscriptions at any time through your Workspace Settings. Upon cancellation, you retain full access until the end of your prepaid billing period.
            </p>
          </section>

          {/* Section 9 */}
          <section className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-200/90 shadow-xs space-y-3">
            <div className="flex items-center gap-2.5 text-gray-900 font-bold text-base">
              <Shield className="w-5 h-5 text-gray-900" />
              <h2>9. Limitation of Liability</h2>
            </div>
            <p>
              To the maximum extent permitted by applicable law, Panda Praise and its operators shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits, data, or goodwill arising out of or in connection with your access to or use of the Service.
            </p>
          </section>

          {/* Section 10 */}
          <section className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-200/90 shadow-xs space-y-3">
            <div className="flex items-center gap-2.5 text-gray-900 font-bold text-base">
              <Mail className="w-5 h-5 text-[#6701e6]" />
              <h2>10. Termination & Contact</h2>
            </div>
            <p>
              We reserve the right to suspend or terminate accounts that violate these Terms. You may stop using the Service and request deletion of your account and data at any time via your dashboard settings.
            </p>
            <div className="p-4 rounded-xl bg-purple-50/70 border border-purple-200 text-[#6701e6] font-mono text-xs font-bold flex items-center justify-between">
              <span>support@pandapraise.com</span>
              <span className="text-[11px] font-sans text-purple-700 bg-purple-100/80 px-2 py-0.5 rounded-md">Legal inquiries</span>
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="mt-12 pt-6 border-t border-gray-200 flex flex-wrap items-center justify-between text-xs text-gray-500 gap-4">
          <span>© 2026 Panda Praise Ltd. All rights reserved.</span>
          <div className="flex items-center gap-4">
            <Link to="/" className="hover:text-gray-900 transition-colors">Home</Link>
            <Link to="/privacy-policy" className="hover:text-gray-900 transition-colors">Privacy Policy</Link>
            <Link to="/refund-policy" className="hover:text-gray-900 transition-colors">Refund Policy</Link>
            <Link to="/pricing" className="hover:text-gray-900 transition-colors">Pricing</Link>
          </div>
        </div>
      </main>
    </div>
  );
};
