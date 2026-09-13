import { Link } from 'react-router-dom';
import { Sparkles, FileCheck, ArrowLeft, Shield, CheckCircle, Scale, AlertTriangle, LifeBuoy, Mail } from 'lucide-react';
import { usePageSeo } from '../lib/seo';

export const TermsPage = () => {
  usePageSeo({
    title: 'Terms of Service — ReviewVault',
    description: 'Terms and conditions governing the use of ReviewVault for collecting, moderating, and embedding customer testimonials.',
    canonical: 'https://cheery-hummingbird-7ecc95.netlify.app/terms',
  });

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 selection:bg-brand-500/30 selection:text-brand-200 relative overflow-hidden">
      {/* Ambient background glow */}
      <div className="ambient-glow" />

      {/* Header */}
      <header className="sticky top-0 z-40 w-full glass-panel border-b border-zinc-800/80 backdrop-blur-xl">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-pink-500 p-[1px] shadow-glow-sm">
              <div className="w-full h-full bg-zinc-950 rounded-[11px] flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-brand-400" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-display font-bold text-lg text-white tracking-tight">ReviewVault</span>
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
              <Link to="/" className="hover:text-zinc-200 transition-colors">ReviewVault</Link>
            </li>
            <li className="text-zinc-600" aria-hidden="true">/</li>
            <li className="text-zinc-200 font-medium" aria-current="page">Terms of Service</li>
          </ol>
        </nav>

        <div className="mb-10 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-500/10 text-brand-300 text-xs font-semibold mb-4 border border-brand-500/25">
            <FileCheck className="w-4 h-4 text-brand-400" />
            <span>Legal Agreement</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold font-display text-white tracking-tight">
            Terms of Service
          </h1>
          <p className="text-sm text-zinc-400 mt-2">
            Last updated: September 13, 2026
          </p>
        </div>

        <div className="space-y-8 text-sm text-zinc-300 leading-relaxed">
          {/* Section 1 */}
          <section className="glass-panel p-6 sm:p-8 rounded-2xl border border-zinc-800 space-y-3">
            <div className="flex items-center gap-2.5 text-white font-semibold text-base">
              <Scale className="w-5 h-5 text-brand-400" />
              <h2>1. Agreement & Services Provided</h2>
            </div>
            <p>
              By accessing or using ReviewVault ("the Service"), you agree to be bound by these Terms of Service. ReviewVault provides website owners and online businesses with software tools to create dedicated collection links, gather customer feedback, moderate testimonials through an administrative dashboard, and embed approved testimonials on their websites via embeddable widgets.
            </p>
            <p>
              If you do not agree to these Terms, you may not use the Service.
            </p>
          </section>

          {/* Section 2 */}
          <section className="glass-panel p-6 sm:p-8 rounded-2xl border border-zinc-800 space-y-3">
            <div className="flex items-center gap-2.5 text-white font-semibold text-base">
              <Shield className="w-5 h-5 text-brand-400" />
              <h2>2. Account Registration & Security</h2>
            </div>
            <p>
              To manage collections and moderate testimonials, you must register for an account using a valid email address. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You agree to notify us immediately of any unauthorized access or security breach.
            </p>
          </section>

          {/* Section 3 */}
          <section className="glass-panel p-6 sm:p-8 rounded-2xl border border-zinc-800 space-y-3">
            <div className="flex items-center gap-2.5 text-white font-semibold text-base">
              <CheckCircle className="w-5 h-5 text-brand-400" />
              <h2>3. Testimonial Collection & Submitter Rights</h2>
            </div>
            <p>
              When customers submit testimonials through your ReviewVault collection links, they provide explicit consent for the review content, name, role, and avatar to be displayed publicly. ReviewVault requires that all submitters agree to publish their feedback before submission.
            </p>
            <p>
              Customer contact information (such as email addresses) is collected strictly for verification by the business owner and is never made publicly accessible through ReviewVault widgets.
            </p>
          </section>

          {/* Section 4 */}
          <section className="glass-panel p-6 sm:p-8 rounded-2xl border border-zinc-800 space-y-3">
            <div className="flex items-center gap-2.5 text-white font-semibold text-base">
              <FileCheck className="w-5 h-5 text-brand-400" />
              <h2>4. Moderation & Content Ownership</h2>
            </div>
            <p>
              You retain total editorial discretion over testimonials submitted to your collections. You are solely responsible for reviewing and approving testimonials before publication. Testimonials do not appear on your website until you explicitly mark them as "approved" in your dashboard.
            </p>
            <p>
              You may reject, archive, or delete testimonials at any time. ReviewVault does not claim ownership over the customer feedback submitted through your collections.
            </p>
          </section>

          {/* Section 5 */}
          <section className="glass-panel p-6 sm:p-8 rounded-2xl border border-zinc-800 space-y-3">
            <div className="flex items-center gap-2.5 text-white font-semibold text-base">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
              <h2>5. Acceptable Use Policy</h2>
            </div>
            <p>
              You agree not to use ReviewVault to:
            </p>
            <ul className="list-disc list-inside space-y-1 text-zinc-400 pl-2">
              <li>Collect, store, or display defamatory, obscene, fraudulent, or unlawful content;</li>
              <li>Impersonate any person or misrepresent affiliations with third parties;</li>
              <li>Fabricate customer testimonials or engage in deceptive advertising practices;</li>
              <li>Attempt to reverse-engineer, exploit, or disrupt the Service infrastructure;</li>
              <li>Send unsolicited bulk communications (spam) using collection links.</li>
            </ul>
          </section>

          {/* Section 6 */}
          <section className="glass-panel p-6 sm:p-8 rounded-2xl border border-zinc-800 space-y-3">
            <div className="flex items-center gap-2.5 text-white font-semibold text-base">
              <Scale className="w-5 h-5 text-brand-400" />
              <h2>6. Intellectual Property</h2>
            </div>
            <p>
              The ReviewVault platform, including its software code, user interface designs, logos, widget layouts, and documentation, is the exclusive property of ReviewVault and its licensors. You are granted a non-exclusive, revocable license to embed the ReviewVault widgets on your websites in accordance with these Terms.
            </p>
          </section>

          {/* Section 7 */}
          <section className="glass-panel p-6 sm:p-8 rounded-2xl border border-zinc-800 space-y-3">
            <div className="flex items-center gap-2.5 text-white font-semibold text-base">
              <LifeBuoy className="w-5 h-5 text-brand-400" />
              <h2>7. Service Availability & Disclaimers</h2>
            </div>
            <p>
              The Service is provided on an "as is" and "as available" basis. While we strive to maintain uninterrupted service availability and fast widget delivery, we do not guarantee that the Service will be completely error-free or uninterrupted at all times. Routine maintenance, updates, or third-party cloud outages may occasionally affect availability.
            </p>
          </section>

          {/* Section 8 */}
          <section className="glass-panel p-6 sm:p-8 rounded-2xl border border-zinc-800 space-y-3">
            <div className="flex items-center gap-2.5 text-white font-semibold text-base">
              <Shield className="w-5 h-5 text-brand-400" />
              <h2>8. Limitation of Liability</h2>
            </div>
            <p>
              To the maximum extent permitted by applicable law, ReviewVault and its operators shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits, data, or goodwill arising out of or in connection with your access to or use of the Service.
            </p>
          </section>

          {/* Section 9 */}
          <section className="glass-panel p-6 sm:p-8 rounded-2xl border border-zinc-800 space-y-3">
            <div className="flex items-center gap-2.5 text-white font-semibold text-base">
              <Mail className="w-5 h-5 text-brand-400" />
              <h2>9. Termination & Contact</h2>
            </div>
            <p>
              We reserve the right to suspend or terminate accounts that violate these Terms. You may stop using the Service and request deletion of your account and data at any time.
            </p>
            <p>
              For questions regarding these Terms of Service, please contact the platform administrator at{' '}
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
          <span>ReviewVault • Testimonial Collector & Moderation Dashboard</span>
          <div className="flex items-center gap-4">
            <Link to="/" className="hover:text-zinc-300">Home</Link>
            <Link to="/privacy-policy" className="hover:text-zinc-300">Privacy Policy</Link>
            <Link to="/login" className="hover:text-zinc-300">Log In</Link>
            <Link to="/signup" className="hover:text-zinc-300">Sign Up</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};
