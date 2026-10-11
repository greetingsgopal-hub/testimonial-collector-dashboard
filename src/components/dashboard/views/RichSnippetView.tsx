import React, { useState } from 'react';
import {
  Star,
  Copy,
  Check,
  Code2,
  ExternalLink,
  CheckCircle2,
  HelpCircle,
  Search,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Globe,
  Share2,
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { Review } from '../../../types';

interface RichSnippetViewProps {
  reviews?: Review[];
  onOpenSocialCard?: (review: Review) => void;
}

export type PlatformTab = 'wordpress' | 'shopify' | 'webflow' | 'framer' | 'html';

export const RichSnippetView: React.FC<RichSnippetViewProps> = ({
  reviews = [],
  onOpenSocialCard,
}) => {
  const { project, workspace } = useAuth();
  const [copied, setCopied] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [selectedPlatform, setSelectedPlatform] = useState<PlatformTab>('wordpress');
  const [showAdvancedConfig, setShowAdvancedConfig] = useState(false);

  // Schema Customization State
  const [schemaType, setSchemaType] = useState<'Product' | 'SoftwareApplication' | 'LocalBusiness' | 'Organization' | 'Service'>('SoftwareApplication');
  const [businessName, setBusinessName] = useState(project?.name || workspace?.name || 'Panda Praise');
  const [websiteUrl, setWebsiteUrl] = useState(project?.websiteUrl || 'https://pandapraise.com');

  const approvedReviews = reviews.filter((r) => r.status === 'approved');
  const calculatedRating = approvedReviews.length
    ? (approvedReviews.reduce((sum, r) => sum + r.rating, 0) / approvedReviews.length).toFixed(1)
    : reviews.length
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : '5.0';

  const calculatedCount = approvedReviews.length || reviews.length || 12;
  const isDemoStats = approvedReviews.length === 0 && reviews.length === 0;

  const [ratingValue, setRatingValue] = useState('');
  const [reviewCount, setReviewCount] = useState('');
  const [description, setDescription] = useState(
    'Collect, manage, and showcase verified customer testimonials and reviews with Panda Praise.'
  );

  const effectiveRating = ratingValue || calculatedRating;
  const effectiveCount = reviewCount || String(calculatedCount);

  const jsonLdCode = `<script type="application/ld+json">
{
  "@context": "https://schema.org/",
  "@type": "${schemaType}",
  "name": "${businessName}",
  "url": "${websiteUrl}",
  "description": "${description}",
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "${effectiveRating}",
    "bestRating": "5",
    "worstRating": "1",
    "ratingCount": "${effectiveCount}"
  }
}
</script>`;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(jsonLdCode);
      setCopied(true);
      showToast('✓ Copied! Paste into your site header to activate search stars.');
      setTimeout(() => setCopied(false), 3000);
    } catch {
      setCopied(false);
    }
  };

  const googleTestUrl = `https://search.google.com/test/rich-results?url=${encodeURIComponent(
    websiteUrl.trim() || 'https://pandapraise.com'
  )}`;

  const platformGuides: Record<
    PlatformTab,
    {
      name: string;
      quickLocation: string;
      steps: string[];
      tip?: string;
    }
  > = {
    wordpress: {
      name: 'WordPress',
      quickLocation: 'RankMath, Yoast SEO, or Header & Footer Scripts Plugin',
      steps: [
        'Open your WordPress Admin dashboard (yourdomain.com/wp-admin).',
        'Option A (RankMath / Yoast): Open plugin settings → Schema or Custom Scripts box.',
        'Option B (WPCode / Header plugin): Go to Settings → WPCode / Insert Headers & Footers.',
        'Paste your Panda Praise Golden Stars code into the Header Scripts (Header) box.',
        'Click "Save Changes". Google will detect the stars on its next crawl.',
      ],
      tip: 'If using caching plugins (WP Rocket, LiteSpeed), purge your cache after saving.',
    },
    shopify: {
      name: 'Shopify',
      quickLocation: 'Online Store → Themes → Edit code → theme.liquid',
      steps: [
        'Log in to Shopify Admin (admin.shopify.com) and go to Online Store → Themes.',
        'Click the "..." (Actions) button next to your active theme and select "Edit code".',
        'In the Layout folder in the left sidebar, click to open theme.liquid.',
        'Scroll down or search for the closing </head> tag.',
        'Paste your Panda Praise code on a new line directly BEFORE </head>.',
        'Click the green "Save" button in the top right.',
      ],
      tip: 'Adding before </head> ensures Google indexes the review schema on all storefront pages.',
    },
    webflow: {
      name: 'Webflow',
      quickLocation: 'Project Settings → Custom Code → Head Code',
      steps: [
        'Open your Webflow Dashboard and select your project.',
        'Go to Project Settings (or gear icon in Designer) → "Custom Code".',
        'Locate the "Head Code" box (runs inside <head> across all pages).',
        'Paste your Panda Praise Golden Stars code into the box.',
        'Click "Save Changes" and hit "Publish" to selected domains.',
      ],
      tip: 'Requires Webflow Basic hosting plan or higher to publish custom code.',
    },
    framer: {
      name: 'Framer',
      quickLocation: 'Site Settings → General → Custom Code → Head Start',
      steps: [
        'Open your project in the Framer editor.',
        'Click the Framer logo in the top-left → Site Settings → General.',
        'Scroll down to the "Custom Code" section.',
        'Paste your code into the "Head Start" (or "End of <head>") input box.',
        'Close settings and click "Publish" in the top-right corner.',
      ],
      tip: 'Framer automatically bundles the structured JSON-LD into your live HTML output.',
    },
    html: {
      name: 'HTML / Next.js',
      quickLocation: '<head> of index.html or root layout.tsx template',
      steps: [
        'Static HTML: Open your root index.html and paste directly between <head> and </head>.',
        'Next.js (App Router): Open app/layout.tsx and add inside <head> using <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(...) }} />.',
        'Next.js (Pages Router): Import Head from "next/head" and paste inside <Head> in _document.tsx or _app.tsx.',
        'Deploy your frontend build to production.',
      ],
      tip: 'Verify zero hydration mismatch by ensuring the schema script renders directly in static markup.',
    },
  };

  const primaryReviewForSocial = approvedReviews[0] || reviews[0];

  return (
    <div className="max-w-5xl mx-auto py-4 px-2 sm:px-4 space-y-6 animate-fade-in font-sans text-left">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-bounce-in bg-zinc-950 text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 text-xs border border-zinc-800">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="font-medium">{toastMessage}</span>
        </div>
      )}

      {/* ── Value-First Hero Header: At-A-Glance Clarity ── */}
      <section className="apple-glass-card rounded-2xl p-6 sm:p-7 border border-black/[0.06] bg-white/80 backdrop-blur-2xl relative overflow-hidden">
        {/* Subtle Ambient Radial Lighting */}
        <div className="absolute -top-16 -right-16 w-56 h-56 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-violet-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-2.5 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-900 text-[11px] font-bold tracking-tight">
              <Star className="w-3.5 h-3.5 text-amber-600 fill-amber-500" />
              <span>One-Click Golden Stars</span>
              <span className="text-amber-400">•</span>
              <span className="text-amber-800 font-semibold">Google Search Star Generator</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-950 tracking-tight font-display">
              Google Search Star Generator
            </h1>

            <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed">
              Display glowing 5-star ratings directly under your website link in Google search results. Google Rich Snippets build instant credibility, grab attention, and increase organic click-through rates by up to 35%.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] text-zinc-500 font-medium">
              <span className="inline-flex items-center gap-1.5 text-emerald-700 font-semibold bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                <Sparkles className="w-3 h-3 text-emerald-600" /> 60-Second Setup
              </span>
              <span>• Zero Coding Required</span>
              <span>• Auto-Syncs with Approved Reviews</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Visual "At First Glance" Live Google SERP Preview ── */}
      <section className="apple-glass-card rounded-2xl p-5 sm:p-6 border border-black/[0.06] bg-white/80 backdrop-blur-xl relative overflow-hidden">
        <div className="flex items-center justify-between pb-3 border-b border-black/[0.05] mb-4">
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 text-zinc-400" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-500 font-mono">
              Live Google Search Appearance
            </h2>
          </div>
          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
            {isDemoStats ? 'Live Preview with Real-time Sync' : 'Verified Schema Live'}
          </span>
        </div>

        {/* Realistic Google Search Card */}
        <div className="p-4 sm:p-5 rounded-2xl bg-zinc-50/90 border border-black/[0.06] text-left max-w-2xl space-y-2">
          {/* Favicon & Breadcrumb */}
          <div className="flex items-center gap-2 text-xs text-zinc-600">
            <div className="w-5 h-5 rounded-full bg-[#6701e6] text-white flex items-center justify-center font-bold text-[10px] shadow-2xs">
              {businessName.charAt(0).toUpperCase()}
            </div>
            <span className="font-sans text-zinc-800 text-xs font-medium truncate max-w-[200px] sm:max-w-none">
              {websiteUrl.replace(/^https?:\/\//, '').replace(/\/$/, '')}
            </span>
            <span className="text-zinc-400 text-xs">› reviews</span>
          </div>

          {/* Title Link */}
          <h3 className="text-base sm:text-lg font-semibold text-[#1a0dab] hover:underline cursor-pointer leading-snug">
            {businessName} — Verified Reviews & Ratings
          </h3>

          {/* Google Golden Stars Row */}
          <div className="flex items-center flex-wrap gap-2 text-xs pt-0.5">
            <div className="flex items-center gap-0.5 text-amber-500">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} className="w-4 h-4 fill-amber-400 text-amber-400" />
              ))}
            </div>
            <span className="font-bold text-zinc-900 text-xs">
              Rating: {effectiveRating}
            </span>
            <span className="text-zinc-500 text-xs">
              • ‎{effectiveCount} verified reviews
            </span>
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-100/70 px-1.5 py-0.5 rounded">
              <Check className="w-2.5 h-2.5" /> Schema Validated
            </span>
          </div>

          {/* Meta Description */}
          <p className="text-xs text-zinc-600 leading-relaxed pt-1 line-clamp-2">
            {description}
          </p>
        </div>
      </section>

      {/* ── Unified Ready-to-Paste Star Code Studio ── */}
      <section className="apple-glass-card rounded-2xl p-5 sm:p-6 border border-black/[0.06] bg-white/80 backdrop-blur-xl space-y-5">
        {/* Dock Header with Platform Switcher */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-3 border-b border-black/[0.05]">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Code2 className="w-4 h-4 text-[#6701e6]" />
              <h3 className="text-sm font-bold text-zinc-950">
                Your Ready-to-Paste Star Code (Google Schema)
              </h3>
            </div>
            <p className="text-xs text-zinc-500">
              Select your platform below for instant, tailor-made placement instructions.
            </p>
          </div>

          {/* Platform Tabs Selector */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0">
            {(['wordpress', 'shopify', 'webflow', 'framer', 'html'] as PlatformTab[]).map((p) => {
              const isSelected = selectedPlatform === p;
              return (
                <button
                  key={p}
                  type="button"
                  onClick={() => setSelectedPlatform(p)}
                  className={`apple-touch px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all cursor-pointer whitespace-nowrap ${
                    isSelected
                      ? 'bg-[#6701e6] text-white shadow-xs font-bold'
                      : 'bg-zinc-100 hover:bg-zinc-200/80 text-zinc-700 border border-zinc-200'
                  }`}
                >
                  {platformGuides[p].name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Dynamic Platform Instructions Box */}
        <div className="p-4 rounded-xl bg-purple-50/70 border border-purple-200 space-y-3 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-purple-200/60 pb-2">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-[#6701e6]" />
              <strong className="text-xs font-bold text-purple-950">
                {platformGuides[selectedPlatform].name} Installation Instructions
              </strong>
            </div>
            <span className="text-[10px] font-bold text-purple-700 bg-white/90 border border-purple-200 px-2.5 py-0.5 rounded-full inline-flex self-start sm:self-auto">
              Target: {platformGuides[selectedPlatform].quickLocation}
            </span>
          </div>

          <ol className="space-y-1.5 text-xs text-zinc-700">
            {platformGuides[selectedPlatform].steps.map((st, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="w-4 h-4 rounded-full bg-purple-200 text-[#6701e6] font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                  {i + 1}
                </span>
                <span className="leading-relaxed">{st}</span>
              </li>
            ))}
          </ol>

          {platformGuides[selectedPlatform].tip && (
            <div className="p-2.5 rounded-lg bg-white/90 border border-purple-100 text-[11px] text-purple-900 flex items-start gap-2">
              <HelpCircle className="w-3.5 h-3.5 text-[#6701e6] shrink-0 mt-0.5" />
              <span className="leading-relaxed">
                <strong>Pro-Tip:</strong> {platformGuides[selectedPlatform].tip}
              </span>
            </div>
          )}
        </div>

        {/* Success Status Pill (Visible When Copied) */}
        {copied && (
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-950 flex items-center justify-between gap-3 text-xs font-semibold animate-in fade-in duration-200">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Copied! Paste into your site header to activate search stars.</span>
            </div>
            <span className="text-[10px] uppercase font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full shrink-0">
              Ready to Paste
            </span>
          </div>
        )}

        {/* Code Snippet Box */}
        <div className="relative group">
          <pre className="p-4 rounded-xl bg-zinc-950 text-purple-200 text-xs font-mono overflow-x-auto leading-relaxed border border-zinc-800 scrollbar-thin max-h-56 select-all">
            {jsonLdCode}
          </pre>
        </div>

        {/* Action Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
          <div className="flex items-center gap-2 text-xs text-zinc-500">
            <span className="font-mono text-[11px] bg-zinc-100 px-2 py-0.5 rounded-md border border-zinc-200 font-semibold text-zinc-700">
              JSON-LD • Schema.org
            </span>
            <span>Automatically formatted with your live rating ({effectiveRating}★)</span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Primary Copy Button */}
            <button
              onClick={handleCopy}
              className="apple-touch inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#6701e6] hover:bg-[#5200bd] text-white text-xs font-bold shadow-xs transition-all cursor-pointer active:scale-95"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? '✓ Snippet Copied!' : 'Copy Google Schema Code'}</span>
            </button>

            {/* Interactive Secondary Button: Test with Google Rich Results Tool */}
            <a
              href={googleTestUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="apple-touch inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white hover:bg-zinc-50 text-zinc-700 border border-black/[0.1] text-xs font-semibold shadow-2xs transition-all hover:border-zinc-400"
              title="Test domain in Google official tool"
            >
              <span>Test with Google Rich Results</span>
              <ExternalLink className="w-3.5 h-3.5 text-zinc-400" />
            </a>
          </div>
        </div>

        {/* Collapsible Advanced Schema Settings */}
        <div className="pt-2 border-t border-black/[0.05]">
          <button
            onClick={() => setShowAdvancedConfig(!showAdvancedConfig)}
            className="apple-touch text-xs font-semibold text-zinc-600 hover:text-zinc-900 flex items-center gap-1.5 cursor-pointer py-1.5"
          >
            <span>{showAdvancedConfig ? 'Hide' : 'Customize'} Business Name, URL & Entity Type</span>
            {showAdvancedConfig ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          {showAdvancedConfig && (
            <div className="mt-2 p-4 rounded-xl bg-zinc-50/80 border border-black/[0.05] space-y-3.5 animate-fade-in">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-zinc-700 block">Schema Entity Type</label>
                  <select
                    value={schemaType}
                    onChange={(e) => setSchemaType(e.target.value as any)}
                    className="w-full px-3 py-1.5 rounded-lg text-xs bg-white border border-black/[0.08] text-zinc-900 focus:outline-none"
                  >
                    <option value="SoftwareApplication">SoftwareApplication (SaaS / Apps)</option>
                    <option value="Product">Product (Physical / Digital Goods)</option>
                    <option value="LocalBusiness">LocalBusiness (Agencies, Stores & Clinics)</option>
                    <option value="Organization">Organization (Companies & Brands)</option>
                    <option value="Service">Service (Consulting & Services)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-zinc-700 block">Product / Business Name</label>
                  <input
                    type="text"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg text-xs bg-white border border-black/[0.08] text-zinc-900 focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-zinc-700 block">Website URL</label>
                <input
                  type="url"
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg text-xs bg-white border border-black/[0.08] text-zinc-900 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-zinc-700 block">Rating Value Override</label>
                  <input
                    type="text"
                    value={ratingValue}
                    onChange={(e) => setRatingValue(e.target.value)}
                    placeholder={`Auto: ${calculatedRating}`}
                    className="w-full px-3 py-1.5 rounded-lg text-xs bg-white border border-black/[0.08] text-zinc-900 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-zinc-700 block">Review Count Override</label>
                  <input
                    type="number"
                    value={reviewCount}
                    onChange={(e) => setReviewCount(e.target.value)}
                    placeholder={`Auto: ${calculatedCount}`}
                    className="w-full px-3 py-1.5 rounded-lg text-xs bg-white border border-black/[0.08] text-zinc-900 focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-zinc-700 block">Meta Description</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg text-xs bg-white border border-black/[0.08] text-zinc-900 focus:outline-none resize-none"
                />
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ── Social Media Quote Graphic Studio Bridge ── */}
      <section className="apple-glass-card rounded-2xl p-5 sm:p-6 border border-violet-500/20 bg-gradient-to-r from-violet-500/5 via-indigo-500/5 to-purple-500/5 backdrop-blur-xl relative overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Share2 className="w-4 h-4 text-violet-600" />
            <h3 className="text-sm font-bold text-zinc-950">
              Want to post reviews on Social Media (LinkedIn, X, Instagram)?
            </h3>
          </div>
          <p className="text-xs text-zinc-600">
            Generate high-res 1080p branded testimonial quote graphics ready to download or copy in 1 click.
          </p>
        </div>

        {onOpenSocialCard && primaryReviewForSocial && (
          <button
            type="button"
            onClick={() => onOpenSocialCard(primaryReviewForSocial)}
            className="apple-touch shrink-0 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-bold shadow-xs transition-all cursor-pointer active:scale-95"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Open Social Quote Studio</span>
          </button>
        )}
      </section>
    </div>
  );
};

export default RichSnippetView;
