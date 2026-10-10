import { Link } from 'react-router-dom';
import { Shield, ArrowLeft, Lock, Eye, Server, Cookie, Mail, FileText } from 'lucide-react';
import { usePageSeo } from '../lib/seo';
import { PandaPraiseIcon } from '../components/PandaPraiseLogo';

export const PrivacyPolicyPage = () => {
  usePageSeo({
    title: 'Privacy Policy — Panda Praise',
    description: "Panda Praise's privacy policy explaining data collection, testimonial submitter privacy, and usage.",
    canonical: `${window.location.origin}/privacy-policy`,
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
            <li className="text-gray-900 font-semibold" aria-current="page">Privacy Policy</li>
          </ol>
        </nav>

        <div className="mb-10 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-50 text-[#6701e6] text-xs font-bold mb-4 border border-purple-200">
            <Shield className="w-3.5 h-3.5 text-[#6701e6]" />
            <span>Privacy & Data Protection</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold font-display text-gray-900 tracking-tight">
            Privacy Policy
          </h1>
          <p className="text-sm text-gray-500 mt-2">
            Last updated: October 10, 2026
          </p>
        </div>

        <div className="space-y-6 text-sm text-gray-600 leading-relaxed">
          {/* Section 1 */}
          <section className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-200/90 shadow-xs space-y-3">
            <div className="flex items-center gap-2.5 text-gray-900 font-bold text-base">
              <FileText className="w-5 h-5 text-[#6701e6]" />
              <h2>1. Overview</h2>
            </div>
            <p>
              Panda Praise provides software for business owners to collect testimonials from their customers, moderate feedback, and display approved social proof on their websites. This Privacy Policy explains in plain language what data is collected, how it is handled, and how your privacy is protected.
            </p>
          </section>

          {/* Section 2 */}
          <section className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-200/90 shadow-xs space-y-4">
            <div className="flex items-center gap-2.5 text-gray-900 font-bold text-base">
              <Lock className="w-5 h-5 text-[#6701e6]" />
              <h2>2. Information We Collect</h2>
            </div>
            
            <div className="space-y-4 pl-1">
              <div>
                <h3 className="text-sm font-bold text-gray-900">A. Account Information (Business Owners)</h3>
                <p className="mt-1">
                  When you create a Panda Praise account as a website owner or business operator, we collect your email address and authentication credentials. This information is used exclusively to provision your workspace, manage your collection forms, and give you access to your moderation dashboard.
                </p>
              </div>

              <div>
                <h3 className="text-sm font-bold text-gray-900">B. Testimonial Submitter Information (Customers)</h3>
                <p className="mt-1">
                  When customers submit feedback through a public Panda Praise collection link, they provide information directly to the business owner, including:
                </p>
                <ul className="list-disc list-inside space-y-1 text-gray-500 pl-2 mt-2">
                  <li>Full Name</li>
                  <li>Email Address (used strictly for verification and contact by the business owner)</li>
                  <li>Job Title and Company Name (optional)</li>
                  <li>Star Rating and Testimonial Text</li>
                  <li>Avatar or Profile Image URL (optional)</li>
                  <li>Explicit consent confirmation to display the testimonial publicly</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Section 3 */}
          <section className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-200/90 shadow-xs space-y-3">
            <div className="flex items-center gap-2.5 text-gray-900 font-bold text-base">
              <Eye className="w-5 h-5 text-[#6701e6]" />
              <h2>3. Public vs. Private Information</h2>
            </div>
            <p>
              We enforce strict data separation between what is shown publicly and what is kept confidential:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200">
                <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider block mb-2">
                  Publicly Visible (When Approved)
                </span>
                <ul className="text-xs text-emerald-900 space-y-1.5 list-disc list-inside">
                  <li>Reviewer Name</li>
                  <li>Role and Company</li>
                  <li>Star Rating & Testimonial Quote</li>
                  <li>Avatar Image</li>
                </ul>
              </div>

              <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200">
                <span className="text-xs font-bold text-amber-800 uppercase tracking-wider block mb-2">
                  Strictly Confidential (Never Public)
                </span>
                <ul className="text-xs text-amber-900 space-y-1.5 list-disc list-inside">
                  <li>Submitter Email Address</li>
                  <li>Internal Account Identifiers</li>
                  <li>Unapproved or Rejected Submissions</li>
                  <li>Account Passwords & Tokens</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Section 4 */}
          <section className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-200/90 shadow-xs space-y-3">
            <div className="flex items-center gap-2.5 text-gray-900 font-bold text-base">
              <Shield className="w-5 h-5 text-emerald-600" />
              <h2>4. Moderation and Publication</h2>
            </div>
            <p>
              Submitted testimonials do NOT publish automatically. All submissions first enter the business owner's private moderation queue in a "pending" status. The business owner has total discretion to approve, feature, archive, or reject any testimonial. Only testimonials explicitly marked as "approved" are served to the public website embed widget.
            </p>
          </section>

          {/* Section 5 */}
          <section className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-200/90 shadow-xs space-y-3">
            <div className="flex items-center gap-2.5 text-gray-900 font-bold text-base">
              <Server className="w-5 h-5 text-indigo-600" />
              <h2>5. Hosting and Infrastructure</h2>
            </div>
            <p>
              Panda Praise utilizes industry-standard cloud infrastructure to host and deliver services:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-600 pl-2">
              <li><strong className="text-gray-900">Google Firebase / Cloud Firestore:</strong> Authentication identity management, encrypted database storage, and file hosting. Data access is governed by security rules verifying tenant ownership.</li>
              <li><strong className="text-gray-900">Cloudflare Workers:</strong> Global delivery and secure hosting for the Panda Praise frontend and embeddable widget assets over encrypted HTTPS.</li>
              <li><strong className="text-gray-900">Google reCAPTCHA Enterprise (App Check):</strong> Optional abuse protection for public form submissions, activated per site configuration.</li>
            </ul>
          </section>

          {/* Section 6 */}
          <section className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-200/90 shadow-xs space-y-3">
            <div className="flex items-center gap-2.5 text-gray-900 font-bold text-base">
              <Cookie className="w-5 h-5 text-amber-600" />
              <h2>6. Cookies and Analytics</h2>
            </div>
            <p>
              Panda Praise does not use advertising trackers, marketing cookies, or behavioral profiling cookies. Essential local storage is used solely to maintain your authenticated login session.
            </p>
            <p>
              If Google Analytics is configured by the site operator, it operates in privacy-first mode with IP anonymization enabled, collecting only aggregated high-level page visit events. We never transmit names, emails, or testimonial content to analytics services.
            </p>
          </section>

          {/* Section 7 */}
          <section className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-200/90 shadow-xs space-y-3">
            <div className="flex items-center gap-2.5 text-gray-900 font-bold text-base">
              <Lock className="w-5 h-5 text-[#6701e6]" />
              <h2>7. Data Retention and Deletion (GDPR Article 17)</h2>
            </div>
            <p>
              Account owners retain full control over their data. When you delete a testimonial in your moderation dashboard, it is permanently removed from the active database and ceases to appear in any public widget immediately. Under GDPR Article 17, business owners can also permanently purge their entire workspace and customer testimonials via the Workspace Settings Danger Zone.
            </p>
          </section>

          {/* Section 8 */}
          <section className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-200/90 shadow-xs space-y-3">
            <div className="flex items-center gap-2.5 text-gray-900 font-bold text-base">
              <Mail className="w-5 h-5 text-purple-600" />
              <h2>8. Contact and Policy Updates</h2>
            </div>
            <p>
              We may update this Privacy Policy from time to time to reflect operational changes or improvements in our service. Any changes will be posted on this page with an updated revision date.
            </p>
            <div className="p-4 rounded-xl bg-purple-50/70 border border-purple-200 text-[#6701e6] font-mono text-xs font-bold flex items-center justify-between">
              <span>support@pandapraise.com</span>
              <span className="text-[11px] font-sans text-purple-700 bg-purple-100/80 px-2 py-0.5 rounded-md">Data Protection Officer</span>
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="mt-12 pt-6 border-t border-gray-200 flex flex-wrap items-center justify-between text-xs text-gray-500 gap-4">
          <span>© 2026 Panda Praise Ltd. All rights reserved.</span>
          <div className="flex items-center gap-4">
            <Link to="/" className="hover:text-gray-900 transition-colors">Home</Link>
            <Link to="/terms" className="hover:text-gray-900 transition-colors">Terms of Service</Link>
            <Link to="/refund-policy" className="hover:text-gray-900 transition-colors">Refund Policy</Link>
            <Link to="/pricing" className="hover:text-gray-900 transition-colors">Pricing</Link>
          </div>
        </div>
      </main>
    </div>
  );
};
