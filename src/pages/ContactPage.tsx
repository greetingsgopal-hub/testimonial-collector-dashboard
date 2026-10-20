import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Mail, ShieldAlert, CreditCard, Send, CheckCircle2, Building, Clock } from 'lucide-react';
import { usePageSeo } from '../lib/seo';
import { PandaPraiseIcon } from '../components/PandaPraiseLogo';

export const ContactPage: React.FC = () => {
  usePageSeo({
    title: 'Contact Us — Panda Praise',
    description: 'Reach the Panda Praise team for customer support, privacy data requests, billing, and grievance officer communications.',
    canonical: `${window.location.origin}/contact`,
  });

  const [formSent, setFormSent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: '', email: '', subject: 'support', message: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.error || `Server responded with status ${res.status}. Please email support@pandapraise.com directly.`);
      }

      setFormSent(true);
    } catch (err: any) {
      console.error('[ContactPage] Submission failed:', err);
      setSubmitError(err.message || 'Failed to submit inquiry. Please try again or email support@pandapraise.com.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 relative selection:bg-purple-100 selection:text-[#6701e6]">
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
            <li className="text-gray-900 font-semibold" aria-current="page">Contact Us</li>
          </ol>
        </nav>

        {/* Title Card */}
        <div className="bg-white rounded-2xl border border-gray-200/80 p-6 sm:p-10 shadow-xs mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 text-purple-700 text-xs font-semibold mb-4">
            <Clock className="w-4 h-4" />
            <span>Response within 2 business days</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-gray-950 tracking-tight mb-3">
            Contact Panda Praise
          </h1>
          <p className="text-gray-600 text-base sm:text-lg leading-relaxed max-w-2xl">
            Whether you have questions about widget embeds, need billing assistance, or want to submit privacy data requests, our team is here to assist.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {/* Quick Channels */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-gray-200/80 p-6 shadow-xs">
              <h2 className="text-base font-bold text-gray-900 flex items-center gap-2 mb-2">
                <Mail className="w-4 h-4 text-indigo-600" />
                <span>General & Technical Support</span>
              </h2>
              <p className="text-xs text-gray-500 mb-3">For product questions, embedding issues, and setup assistance.</p>
              <a href="mailto:support@pandapraise.com" className="text-sm font-semibold text-indigo-600 hover:underline">
                support@pandapraise.com
              </a>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200/80 p-6 shadow-xs">
              <h2 className="text-base font-bold text-gray-900 flex items-center gap-2 mb-2">
                <ShieldAlert className="w-4 h-4 text-emerald-600" />
                <span>Privacy &amp; Data Requests (DPDP / GDPR)</span>
              </h2>
              <p className="text-xs text-gray-500 mb-3">Access, correction, export, consent withdrawal, or deletion requests.</p>
              <a href="mailto:privacy@pandapraise.com" className="text-sm font-semibold text-emerald-700 hover:underline">
                privacy@pandapraise.com
              </a>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200/80 p-6 shadow-xs">
              <h2 className="text-base font-bold text-gray-900 flex items-center gap-2 mb-2">
                <CreditCard className="w-4 h-4 text-purple-600" />
                <span>Billing &amp; Refunds</span>
              </h2>
              <p className="text-xs text-gray-500 mb-3">For invoices, GST receipts, plan upgrades, and refund inquiries.</p>
              <a href="mailto:support@pandapraise.com" className="text-sm font-semibold text-purple-700 hover:underline">
                support@pandapraise.com
              </a>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200/80 p-6 shadow-xs">
              <h2 className="text-base font-bold text-gray-900 flex items-center gap-2 mb-2">
                <Building className="w-4 h-4 text-slate-600" />
                <span>Grievance Officer & Registered Office</span>
              </h2>
              <p className="text-xs text-gray-600 leading-relaxed">
                Panda Praise Technologies · Bengaluru, Karnataka, PIN 560001, India<br />
                Grievance Officer: Designated Compliance Lead · <a href="mailto:support@pandapraise.com" className="text-indigo-600 underline">support@pandapraise.com</a>
              </p>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-white rounded-2xl border border-gray-200/80 p-6 sm:p-8 shadow-xs flex flex-col justify-between">
            {formSent ? (
              <div className="py-12 flex flex-col items-center justify-center text-center">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-4">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Message Dispatched!</h3>
                <p className="text-xs text-gray-600 max-w-xs mb-6">
                  Thank you for reaching out. We have received your inquiry and our team will get back to you within 2 business days.
                </p>
                <button
                  type="button"
                  onClick={() => setFormSent(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-gray-100 hover:bg-gray-200 text-gray-700 transition"
                >
                  Send another inquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <h2 className="text-base font-bold text-gray-900">Send an Direct Inquiry</h2>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Your Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Jane Doe"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Your Email</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="jane@company.com"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Category</label>
                  <select
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                  >
                    <option value="support">General Technical Support</option>
                    <option value="billing">Billing & Refund Inquiry</option>
                    <option value="privacy">Privacy & Data Request</option>
                    <option value="enterprise">Custom Plan & Enterprise</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Message</label>
                  <textarea
                    rows={4}
                    required
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Describe how we can help you..."
                  />
                </div>

                {submitError && (
                  <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center justify-between">
                    <span>{submitError}</span>
                    <button
                      type="button"
                      onClick={() => setSubmitError(null)}
                      className="text-rose-500 hover:text-rose-800 font-bold ml-2"
                    >
                      ✕
                    </button>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed text-white text-xs font-bold shadow-sm transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isSubmitting ? (
                    <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Send className="w-3.5 h-3.5" />
                  )}
                  <span>{isSubmitting ? 'Sending inquiry...' : 'Submit Message'}</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};
