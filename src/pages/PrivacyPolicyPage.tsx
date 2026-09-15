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
            <li className="text-zinc-200 font-medium" aria-current="page">Privacy Policy</li>
          </ol>
        </nav>

        <div className="mb-10 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-500/10 text-brand-300 text-xs font-semibold mb-4 border border-brand-500/25">
            <Shield className="w-4 h-4 text-brand-400" />
            <span>Privacy & Data Protection</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold font-display text-white tracking-tight">
            Privacy Policy
          </h1>
          <p className="text-sm text-zinc-400 mt-2">
            Last updated: September 13, 2026
          </p>
        </div>

        <div className="space-y-8 text-sm text-zinc-300 leading-relaxed">
          {/* Section 1 */}
          <section className="glass-panel p-6 sm:p-8 rounded-2xl border border-zinc-800 space-y-3">
            <div className="flex items-center gap-2.5 text-white font-semibold text-base">
              <FileText className="w-5 h-5 text-brand-400" />
              <h2>1. Overview</h2>
            </div>
            <p>
              Panda Praise provides software for business owners to collect testimonials from their customers, moderate feedback, and display approved social proof on their websites. This Privacy Policy explains in plain language what data is collected, how it is handled, and how your privacy is protected.
            </p>
          </section>

          {/* Section 2 */}
          <section className="glass-panel p-6 sm:p-8 rounded-2xl border border-zinc-800 space-y-4">
            <div className="flex items-center gap-2.5 text-white font-semibold text-base">
              <Lock className="w-5 h-5 text-brand-400" />
              <h2>2. Information We Collect</h2>
            </div>
            
            <div className="space-y-3 pl-2">
              <h3 className="text-sm font-semibold text-zinc-100">A. Account Information (Business Owners)</h3>
              <p>
                When you create a Panda Praise account as a website owner or business operator, we collect your email address and authentication credentials. This information is used exclusively to provision your workspace, manage your collection forms, and give you access to your moderation dashboard.
              </p>

              <h3 className="text-sm font-semibold text-zinc-100">B. Testimonial Submitter Information (Customers)</h3>
              <p>
                When customers submit feedback through a public Panda Praise collection link, they provide information directly to the business owner, including:
              </p>
              <ul className="list-disc list-inside space-y-1 text-zinc-400 pl-2">
                <li>Full Name</li>
                <li>Email Address (used strictly for verification and contact by the business owner)</li>
                <li>Job Title and Company Name (optional)</li>
                <li>Star Rating and Testimonial Text</li>
                <li>Avatar or Profile Image URL (optional)</li>
                <li>Explicit consent confirmation to display the testimonial publicly</li>
              </ul>
            </div>
          </section>

          {/* Section 3 */}
          <section className="glass-panel p-6 sm:p-8 rounded-2xl border border-zinc-800 space-y-3">
            <div className="flex items-center gap-2.5 text-white font-semibold text-base">
              <Eye className="w-5 h-5 text-brand-400" />
              <h2>3. Public vs. Private Information</h2>
            </div>
            <p>
              We enforce strict data separation between what is shown publicly and what is kept confidential:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-zinc-900/80 border border-emerald-500/20">
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block mb-1">
                  Publicly Visible (When Approved)
                </span>
                <ul className="text-xs text-zinc-400 space-y-1 list-disc list-inside">
                  <li>Reviewer Name</li>
                  <li>Role and Company</li>
                  <li>Star Rating & Testimonial Quote</li>
                  <li>Avatar Image</li>
                </ul>
              </div>

              <div className="p-4 rounded-xl bg-zinc-900/80 border border-amber-500/20">
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block mb-1">
                  Strictly Confidential (Never Public)
                </span>
                <ul className="text-xs text-zinc-400 space-y-1 list-disc list-inside">
                  <li>Submitter Email Address</li>
                  <li>Internal Account Identifiers</li>
                  <li>Unapproved or Rejected Submissions</li>
                  <li>Account Passwords & Tokens</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Section 4 */}
          <section className="glass-panel p-6 sm:p-8 rounded-2xl border border-zinc-800 space-y-3">
            <div className="flex items-center gap-2.5 text-white font-semibold text-base">
              <Shield className="w-5 h-5 text-brand-400" />
              <h2>4. Moderation and Publication</h2>
            </div>
            <p>
              Submitted testimonials do NOT publish automatically. All submissions first enter the business owner's private moderation queue in a "pending" status. The business owner has total discretion to approve, feature, archive, or reject any testimonial. Only testimonials explicitly marked as "approved" are served to the public website embed widget.
            </p>
          </section>

          {/* Section 5 */}
          <section className="glass-panel p-6 sm:p-8 rounded-2xl border border-zinc-800 space-y-3">
            <div className="flex items-center gap-2.5 text-white font-semibold text-base">
              <Server className="w-5 h-5 text-brand-400" />
              <h2>5. Hosting and Infrastructure</h2>
            </div>
            <p>
              Panda Praise utilizes industry-standard cloud infrastructure to host and deliver services:
            </p>
            <ul className="list-disc list-inside space-y-1 text-zinc-400 pl-2">
              <li><strong className="text-zinc-200">Google Firebase / Cloud Firestore:</strong> Authentication identity management, encrypted database storage, and file hosting. Data access is governed by security rules verifying tenant ownership.</li>
              <li><strong className="text-zinc-200">Cloudflare Workers:</strong> Global delivery and secure hosting for the Panda Praise frontend and embeddable widget assets over encrypted HTTPS.</li>
                  <li><strong className="text-zinc-200">Netlify Functions:</strong> Serverless backend endpoints used for social OAuth and publishing operations.</li>
            </ul>
          </section>

          {/* Section 6 */}
          <section className="glass-panel p-6 sm:p-8 rounded-2xl border border-zinc-800 space-y-3">
            <div className="flex items-center gap-2.5 text-white font-semibold text-base">
              <Cookie className="w-5 h-5 text-brand-400" />
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
          <section className="glass-panel p-6 sm:p-8 rounded-2xl border border-zinc-800 space-y-3">
            <div className="flex items-center gap-2.5 text-white font-semibold text-base">
              <Lock className="w-5 h-5 text-brand-400" />
              <h2>7. Data Retention and Deletion</h2>
            </div>
            <p>
              Account owners retain full control over their data. When you delete a testimonial in your moderation dashboard, it is permanently removed from the active database and ceases to appear in any public widget immediately. To request account deletion or data removal, please contact us.
            </p>
          </section>

          {/* Section 8 */}
          <section className="glass-panel p-6 sm:p-8 rounded-2xl border border-zinc-800 space-y-3">
            <div className="flex items-center gap-2.5 text-white font-semibold text-base">
              <Mail className="w-5 h-5 text-brand-400" />
              <h2>8. Contact and Policy Updates</h2>
            </div>
            <p>
              We may update this Privacy Policy from time to time to reflect operational changes or improvements in our service. Any changes will be posted on this page with an updated revision date.
            </p>
            <p>
              For any questions regarding this Privacy Policy or your data, you can reach out via the project repository or contact the platform administrator at{' '}
              <a href="mailto:myprojectpotato@gmail.com" className="text-brand-400 hover:text-brand-300 font-medium underline">
                myprojectpotato@gmail.com
              </a>.
            </p>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-800/80 py-8 text-xs text-zinc-500 text-center relative z-10">
        <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span>Panda Praise • Testimonial Collector & Moderation Dashboard</span>
          <div className="flex items-center gap-4">
            <Link to="/" className="hover:text-zinc-300">Home</Link>
            <Link to="/terms" className="hover:text-zinc-300">Terms</Link>
            <Link to="/login" className="hover:text-zinc-300">Log In</Link>
            <Link to="/signup" className="hover:text-zinc-300">Sign Up</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};
