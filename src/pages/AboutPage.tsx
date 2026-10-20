import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Building2, MapPin, Mail, Phone, ShieldCheck, HeartHandshake } from 'lucide-react';
import { usePageSeo } from '../lib/seo';
import { PandaPraiseIcon } from '../components/PandaPraiseLogo';

export const AboutPage: React.FC = () => {
  usePageSeo({
    title: 'About Us — Panda Praise',
    description: 'Who is behind Panda Praise, how we work, our ethical testimonial principles, and how to reach us.',
    canonical: `${window.location.origin}/about`,
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
            <li className="text-gray-900 font-semibold" aria-current="page">About Us</li>
          </ol>
        </nav>

        {/* Hero Header */}
        <div className="bg-white rounded-2xl border border-gray-200/80 p-6 sm:p-10 shadow-xs mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 text-purple-700 text-xs font-semibold mb-4">
            <HeartHandshake className="w-4 h-4" />
            <span>Our Mission & Transparency</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-gray-950 tracking-tight mb-4">
            About Panda Praise
          </h1>
          <p className="text-gray-600 text-base sm:text-lg leading-relaxed max-w-2xl mb-6">
            Panda Praise is a testimonial collection and social-proof display engine built for small businesses, creators, and independent SaaS teams who want to turn happy customers into credible, verifiable proof on their websites without monthly hostage fees.
          </p>
          <div className="text-xs text-gray-500">
            Last updated: 1 January 2025 · Jurisdiction: Bengaluru, Karnataka, India
          </div>
        </div>

        {/* Who We Are Card */}
        <div className="bg-white rounded-2xl border border-gray-200/80 p-6 sm:p-8 shadow-xs mb-8 space-y-6">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-indigo-600" />
            <span>Who We Are</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
              <div className="font-semibold text-gray-900 flex items-center gap-2 mb-1">
                <Building2 className="w-4 h-4 text-gray-500" /> Legal Entity
              </div>
              <p className="text-gray-600">Panda Praise Technologies</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
              <div className="font-semibold text-gray-900 flex items-center gap-2 mb-1">
                <MapPin className="w-4 h-4 text-gray-500" /> Registered Address
              </div>
              <p className="text-gray-600">Bengaluru, Karnataka, PIN 560001, India</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
              <div className="font-semibold text-gray-900 flex items-center gap-2 mb-1">
                <Mail className="w-4 h-4 text-gray-500" /> Support Contact
              </div>
              <a href="mailto:support@pandapraise.com" className="text-indigo-600 hover:underline">
                support@pandapraise.com
              </a>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
              <div className="font-semibold text-gray-900 flex items-center gap-2 mb-1">
                <Phone className="w-4 h-4 text-gray-500" /> Contact Support
              </div>
              <p className="text-gray-600">Online 24/7 Ticketing &amp; Email</p>
            </div>
          </div>
        </div>

        {/* How We Work Card */}
        <div className="bg-white rounded-2xl border border-gray-200/80 p-6 sm:p-8 shadow-xs mb-8 space-y-4">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <span>How We Work (Authenticity Standards)</span>
          </h2>
          <p className="text-gray-600 text-sm leading-relaxed">
            We collect testimonials only with the explicit consent of the person giving them. We do not fabricate, edit, or falsify the substance of any customer review, and we display the attribution chosen by the reviewer.
          </p>
          <p className="text-gray-600 text-sm leading-relaxed">
            If you believe a testimonial hosted by Panda Praise is inaccurate or was collected without consent, email{' '}
            <a href="mailto:privacy@pandapraise.com" className="text-indigo-600 hover:underline font-medium">
              privacy@pandapraise.com
            </a>{' '}
            and our moderation compliance team will investigate and take immediate corrective action.
          </p>
        </div>

        {/* Links to Contact & Legal */}
        <div className="p-6 rounded-2xl bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200/80 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="font-bold text-gray-900">Have questions or grievance reports?</h3>
            <p className="text-xs text-gray-600 mt-0.5">Reach out to our compliance and support officers anytime.</p>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/contact" className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 transition shadow-xs">
              Contact Us
            </Link>
            <Link to="/roadmap" className="px-4 py-2 rounded-xl bg-white border border-gray-300 text-gray-700 text-xs font-semibold hover:bg-gray-50 transition">
              View Roadmap
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
};
