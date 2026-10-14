import { Link } from 'react-router-dom';
import { ArrowLeft, Cookie, CheckCircle2, ShieldCheck, Settings, Info, Lock } from 'lucide-react';
import { usePageSeo } from '../lib/seo';
import { PandaPraiseIcon } from '../components/PandaPraiseLogo';

export const CookiePolicyPage = () => {
  usePageSeo({
    title: 'Cookie Policy — Panda Praise',
    description: "Panda Praise's cookie policy explaining essential cookies, referral attribution, and privacy preferences.",
    canonical: `${window.location.origin}/cookie-policy`,
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
            <li className="text-gray-900 font-semibold" aria-current="page">Cookie Policy</li>
          </ol>
        </nav>

        <div className="mb-10 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-50 text-amber-700 text-xs font-bold mb-4 border border-amber-200">
            <Cookie className="w-3.5 h-3.5 text-amber-600" />
            <span>GDPR & ePrivacy Compliant</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold font-display text-gray-900 tracking-tight">
            Cookie Policy
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            Last Updated: October 14, 2026 • Effective Immediately
          </p>
        </div>

        {/* Content Card */}
        <div className="bg-white border border-gray-200/80 rounded-2xl p-6 sm:p-10 shadow-sm space-y-8 text-sm leading-relaxed text-gray-600">
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Info className="w-5 h-5 text-[#6701e6]" />
              1. What Are Cookies?
            </h2>
            <p>
              Cookies are small data files placed on your browser or device when you visit a website. We use cookies and similar browser storage technologies (such as localStorage) solely to operate our authentication infrastructure, remember user preferences, and attribute verified affiliate/referral conversions.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              2. Categories of Cookies We Use
            </h2>
            
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="p-4 rounded-xl border border-gray-100 bg-gray-50/50 space-y-2">
                <span className="font-semibold text-gray-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-emerald-600" />
                  Strictly Necessary (Essential)
                </span>
                <p className="text-xs text-gray-500">
                  Required for you to navigate Panda Praise and securely authenticate. These store your session token and CSRF state. Cannot be disabled without breaking application functionality.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-gray-100 bg-gray-50/50 space-y-2">
                <span className="font-semibold text-gray-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-purple-600" />
                  Functional & Attribution
                </span>
                <p className="text-xs text-gray-500">
                  Used to remember user theme settings and track 60-day affiliate/referral link attribution (<code className="text-[#6701e6] bg-purple-50 px-1 rounded">pp_ref</code>). We do NOT use invasive advertising tracking cookies or behavioral profile trackers.
                </p>
              </div>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Cookie className="w-5 h-5 text-amber-600" />
              3. Specific Cookies & Storage Keys
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border border-gray-200 rounded-xl overflow-hidden">
                <thead className="bg-gray-50 text-gray-700 font-semibold border-b border-gray-200">
                  <tr>
                    <th className="p-3">Key / Cookie Name</th>
                    <th className="p-3">Type</th>
                    <th className="p-3">Purpose</th>
                    <th className="p-3">Duration</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  <tr>
                    <td className="p-3 font-mono font-medium text-gray-900">pp_cookie_consent</td>
                    <td className="p-3">localStorage</td>
                    <td className="p-3">Remembers your cookie preferences</td>
                    <td className="p-3">1 Year</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-mono font-medium text-gray-900">pp_ref</td>
                    <td className="p-3">HTTP Cookie</td>
                    <td className="p-3">Partner & referral attribution</td>
                    <td className="p-3">60 Days</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-mono font-medium text-gray-900">firebase:authUser</td>
                    <td className="p-3">IndexedDB</td>
                    <td className="p-3">Maintains authenticated dashboard session</td>
                    <td className="p-3">Session / Persistent</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Settings className="w-5 h-5 text-indigo-600" />
              4. How to Manage or Revoke Consent
            </h2>
            <p>
              You can modify your cookie choices at any time through our on-site banner or by clearing your browser cookies. Most web browsers allow you to control cookies through their settings preferences.
            </p>
            <p className="pt-2 text-xs text-gray-500">
              For any privacy questions, contact us at <a href="mailto:support@pandapraise.com" className="text-[#6701e6] underline font-semibold">support@pandapraise.com</a> or review our <Link to="/privacy-policy" className="text-[#6701e6] underline font-semibold">Privacy Policy</Link>.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
};
