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
  Play,
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { Review } from '../../../types';
import { buildRichSnippetJsonLd } from './richSnippetSchema';

interface RichSnippetViewProps {
  reviews?: Review[];
  onOpenSocialCard?: (review: Review) => void;
}

export type PlatformTab = 'wordpress' | 'shopify' | 'webflow' | 'framer' | 'html' | 'vibe';

export const RichSnippetView: React.FC<RichSnippetViewProps> = ({
  reviews = [],
  onOpenSocialCard,
}) => {
  const { project, workspace } = useAuth();
  const [copied, setCopied] = useState(false);
  const [copiedAiPrompt, setCopiedAiPrompt] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [selectedPlatform, setSelectedPlatform] = useState<PlatformTab>('wordpress');
  const [showAdvancedConfig, setShowAdvancedConfig] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);

  // Schema Customization State
  const [schemaType, setSchemaType] = useState<'Product' | 'SoftwareApplication'>('SoftwareApplication');
  const [businessName, setBusinessName] = useState(project?.name || workspace?.name || 'Panda Praise');
  const [websiteUrl, setWebsiteUrl] = useState(project?.websiteUrl || 'https://pandapraise.com');

  const approvedReviews = reviews.filter((r) => r.status === 'approved');
  const eligibleReviews = approvedReviews.filter(
    (r) => r.isSample !== true && r.source !== 'sample' && Number.isFinite(r.rating) && r.rating >= 1 && r.rating <= 5
  );
  const calculatedRating = eligibleReviews.length
    ? (eligibleReviews.reduce((sum, r) => sum + r.rating, 0) / eligibleReviews.length).toFixed(2)
    : null;
  const calculatedCount = eligibleReviews.length;
  const isDemoStats = eligibleReviews.length === 0;
  const [description, setDescription] = useState(
    'Collect, manage, and showcase customer testimonials and reviews with Panda Praise.'
  );
  const effectiveRating = calculatedRating;
  const effectiveCount = calculatedCount;
  const schemaJson = buildRichSnippetJsonLd({
    entityType: schemaType, name: businessName, url: websiteUrl, description, reviews: eligibleReviews,
  });
  const jsonLdCode = schemaJson
    ? `<script type="application/ld+json">\n${schemaJson}\n</script>`
    : null;
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };
  const handleCopy = async () => {
    if (!jsonLdCode) {
      showToast('No snippet generated. Add eligible, approved reviews first.');
      return;
    }
    try {
      await navigator.clipboard.writeText(jsonLdCode);
      setCopied(true);
      showToast('Copied JSON-LD. Google decides whether a rich result appears.');
      setTimeout(() => setCopied(false), 3000);
    } catch {
      setCopied(false);
    }
  };

  const handleCopyAiPrompt = async () => {
    if (!jsonLdCode) {
      showToast('No snippet generated. Add eligible, approved reviews first.');
      return;
    }
    const promptText = `Add this Google Review structured data (JSON-LD) inside the <head> tag of my website's root index.html (or layout.tsx template) to signal review ratings to Google Search:\n\n${jsonLdCode}`;
    try {
      await navigator.clipboard.writeText(promptText);
      setCopiedAiPrompt(true);
      showToast('Copied AI prompt for Cursor / Lovable / v0 / Bolt!');
      setTimeout(() => setCopiedAiPrompt(false), 3000);
    } catch {
      setCopiedAiPrompt(false);
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
      videoTitle: string;
      videoDuration: string;
      screenTitle: string;
      actionHighlight: string;
      videoSummary: string;
      steps: string[];
      timestamps: { time: string; label: string; desc: string }[];
      tip?: string;
    }
  > = {
    wordpress: {
      name: 'WordPress',
      quickLocation: 'WPCode → Code Snippets → Header & Footer',
      videoTitle: 'How to Install Google Stars on WordPress in 45 Seconds',
      videoDuration: '45s',
      screenTitle: 'WordPress Admin → Code Snippets → Header & Footer',
      actionHighlight: 'Paste verified JSON-LD into Header field',
      videoSummary: 'Open WPCode → Header & Footer, paste verified JSON-LD into the Header field, and save. The exact steps depend on your installed WPCode version.',
      steps: [
        'Open your WordPress Admin dashboard (yourdomain.com/wp-admin).',
        'In WordPress Admin, open Code Snippets → Header & Footer (WPCode).',
        'Paste verified JSON-LD into the Header field only when that placement matches your setup.',
        'Click Save Changes and confirm the actual success message.',
        'Test the published URL. Valid markup does not guarantee Google will show stars.',
      ],
      timestamps: [
        { time: '0:05', label: 'Open WP Admin', desc: 'Navigate to your WordPress dashboard' },
        { time: '0:18', label: 'Open Header Scripts', desc: 'Go to WPCode or RankMath Custom Scripts' },
        { time: '0:32', label: 'Paste Schema Code', desc: 'Paste the Panda Praise JSON-LD snippet' },
        { time: '0:42', label: 'Save & Purge Cache', desc: 'Click Save Changes and purge cache' },
      ],
      tip: 'If using caching plugins (WP Rocket, LiteSpeed), purge your cache after saving.',
    },
    shopify: {
      name: 'Shopify',
      quickLocation: 'Online Store → Themes → Edit code → theme.liquid',
      videoTitle: 'How to Install Google Stars on Shopify in 45 Seconds',
      videoDuration: '45s',
      screenTitle: 'Shopify Admin → Online Store → Themes → theme.liquid',
      actionHighlight: 'Paste on line before </head>',
      videoSummary: 'Open your active theme code, locate theme.liquid, scroll to the closing </head> tag, and paste the code on a new line right above it.',
      steps: [
        'Log in to Shopify Admin (admin.shopify.com) and go to Online Store → Themes.',
        'Click the "..." (Actions) button next to your active theme and select "Edit code".',
        'In the Layout folder in the left sidebar, click to open theme.liquid.',
        'Scroll down or search for the closing </head> tag.',
        'Paste your Panda Praise code on a new line directly BEFORE </head>.',
        'Click the green "Save" button in the top right.',
      ],
      timestamps: [
        { time: '0:08', label: 'Open Themes', desc: 'Go to Online Store → Themes' },
        { time: '0:20', label: 'Edit Code', desc: 'Click "..." Actions → Edit code' },
        { time: '0:31', label: 'Locate </head>', desc: 'Open theme.liquid and search </head>' },
        { time: '0:42', label: 'Paste & Save', desc: 'Paste above </head> and click Save' },
      ],
      tip: 'Adding before </head> ensures Google indexes the review schema on all storefront pages.',
    },
    webflow: {
      name: 'Webflow',
      quickLocation: 'Project Settings → Custom Code → Head Code',
      videoTitle: 'How to Install Google Stars on Webflow in 40 Seconds',
      videoDuration: '40s',
      screenTitle: 'Webflow Dashboard → Project Settings → Custom Code',
      actionHighlight: 'Paste in Head Code Box across all pages',
      videoSummary: 'Go to Project Settings → Custom Code, paste your Panda Praise schema code into the Head Code textarea, and hit Publish.',
      steps: [
        'Open your Webflow Dashboard and select your project.',
        'Go to Project Settings (or gear icon in Designer) → "Custom Code".',
        'Locate the "Head Code" box (runs inside <head> across all pages).',
        'Paste your Panda Praise Golden Stars code into the box.',
        'Click "Save Changes" and hit "Publish" to selected domains.',
      ],
      timestamps: [
        { time: '0:06', label: 'Project Settings', desc: 'Open Webflow Dashboard project settings' },
        { time: '0:18', label: 'Custom Code', desc: 'Click Custom Code tab in the left bar' },
        { time: '0:28', label: 'Paste into Head Code', desc: 'Paste snippet into Head Code box' },
        { time: '0:38', label: 'Publish Site', desc: 'Save changes and hit Publish' },
      ],
      tip: 'Requires Webflow Basic hosting plan or higher to publish custom code.',
    },
    framer: {
      name: 'Framer',
      quickLocation: 'Site Settings → General → Custom Code → Head Start',
      videoTitle: 'How to Install Google Stars on Framer in 40 Seconds',
      videoDuration: '40s',
      screenTitle: 'Framer Studio → Site Settings → Custom Code → Head Start',
      actionHighlight: 'Paste into Head Start (or End of <head>)',
      videoSummary: 'Open Framer editor, go to Site Settings → General → Custom Code, paste into the Head Start input, and click Publish.',
      steps: [
        'Open your project in the Framer editor.',
        'Click the Framer logo in the top-left → Site Settings → General.',
        'Scroll down to the "Custom Code" section.',
        'Paste your code into the "Head Start" (or "End of <head>") input box.',
        'Close settings and click "Publish" in the top-right corner.',
      ],
      timestamps: [
        { time: '0:05', label: 'Site Settings', desc: 'Click Framer icon → Site Settings' },
        { time: '0:16', label: 'Scroll to Custom Code', desc: 'Navigate down to Custom Code section' },
        { time: '0:27', label: 'Paste in Head Start', desc: 'Paste snippet into Head Start box' },
        { time: '0:38', label: 'Publish to Web', desc: 'Close settings and click Publish' },
      ],
      tip: 'Framer automatically bundles the structured JSON-LD into your live HTML output.',
    },
    html: {
      name: 'HTML / Next.js',
      quickLocation: '<head> of index.html or root layout.tsx template',
      videoTitle: 'How to Install Google Stars on HTML / Next.js in 35 Seconds',
      videoDuration: '35s',
      screenTitle: 'VS Code → app/layout.tsx or public/index.html',
      actionHighlight: 'Render inside <head> tag directly',
      videoSummary: 'In static HTML, paste between <head> and </head>. In Next.js App Router, inject inside app/layout.tsx using script tag.',
      steps: [
        'Static HTML: Open your root index.html and paste directly between <head> and </head>.',
        'Next.js (App Router): Open app/layout.tsx and add inside <head> using <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(...) }} />.',
        'Next.js (Pages Router): Import Head from "next/head" and paste inside <Head> in _document.tsx or _app.tsx.',
        'Deploy your frontend build to production.',
      ],
      timestamps: [
        { time: '0:05', label: 'Open Layout / Index', desc: 'Open app/layout.tsx or index.html' },
        { time: '0:15', label: 'Inject JSON-LD', desc: 'Insert script tag inside <head>' },
        { time: '0:26', label: 'Run Local Build', desc: 'Verify zero hydration mismatch' },
        { time: '0:34', label: 'Deploy & Test', desc: 'Deploy and test with Google Rich Results' },
      ],
      tip: 'Verify zero hydration mismatch by ensuring the schema script renders directly in static markup.',
    },
    vibe: {
      name: 'AI & Vibe Coded (Cloudflare / Netlify)',
      quickLocation: 'AI Prompt / index.html <head> / Cloudflare & Netlify Edge',
      videoTitle: 'How to Install Google Stars on Vibe Coded Sites in 30 Seconds',
      videoDuration: '30s',
      screenTitle: 'AI Prompt / index.html <head> / Cloudflare & Netlify Edge',
      actionHighlight: 'Paste into AI prompt or site <head>',
      videoSummary: 'Copy the 1-click AI prompt to paste into Cursor/Lovable, or paste directly into index.html <head>, or use Netlify/Cloudflare snippet injection without touching code.',
      steps: [
        '1-Click AI Prompt: Click "Copy AI Prompt" below and paste into Cursor, Lovable, Bolt, or v0 to install automatically.',
        'Direct HTML / Vite: Open index.html and paste between <head> and </head> (e.g. papasystem.in).',
        'Netlify: Site Settings → Build & Deploy → Snippet Injection → Add Snippet (insert before </head>).',
        'Cloudflare: Domain Dashboard → Rules / Snippets or Zaraz → Inject into Header.',
        'Test your published URL in Google Rich Results Test.',
      ],
      timestamps: [
        { time: '0:05', label: 'Copy AI Prompt', desc: 'Click Copy AI Prompt button below' },
        { time: '0:12', label: 'Prompt AI Agent', desc: 'Paste into Cursor, Lovable, Bolt, or v0' },
        { time: '0:22', label: 'Or Edge Injection', desc: 'Inject in Cloudflare or Netlify dashboard' },
        { time: '0:30', label: 'Deploy & Verify', desc: 'Check with Google Rich Results Test' },
      ],
      tip: 'Perfect for vibe-coded sites hosted on Cloudflare Pages or Netlify (like papasystem.in). Use the 1-click AI prompt to let your AI assistant do the work!',
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
              <span>Review Structured Data</span>
              <span className="text-amber-400">•</span>
              <span className="text-amber-800 font-semibold">Review Structured Data Generator</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-950 tracking-tight font-display">
              Review Structured Data Generator
            </h1>

            <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed">
              Generate review structured data from eligible, approved customer ratings. Valid markup does not guarantee that Google will display stars; eligibility depends on Google's guidelines and the content visible on your page.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] text-zinc-500 font-medium">
              <span className="inline-flex items-center gap-1.5 text-emerald-700 font-semibold bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                <Sparkles className="w-3 h-3 text-emerald-600" /> JSON-LD Generator
              </span>
              <span>• Requires eligible review data</span>
              <span>• Google controls rich-result display</span>
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
              Illustrative Search Preview
            </h2>
          </div>
          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
            {isDemoStats ? 'Preview only — no eligible ratings' : 'Illustrative preview — not Google output'}
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

          {/* Illustrative preview; not a live Google result */}
          <div className="flex items-center flex-wrap gap-2 text-xs pt-0.5">
            {effectiveRating !== null ? (
              <>
                <div className="flex items-center gap-0.5 text-amber-500" aria-label="Illustrative rating stars">
                  {[1, 2, 3, 4, 5].map((s) => <Star key={s} className="w-4 h-4 fill-amber-400 text-amber-400" />)}
                </div>
                <span className="font-bold text-zinc-900 text-xs">Illustrative rating: {effectiveRating}</span>
                <span className="text-zinc-500 text-xs">• {effectiveCount} eligible approved ratings</span>
              </>
            ) : <span className="text-amber-800 text-xs">No eligible approved ratings. Aggregate-rating markup will not be generated.</span>}
          </div>
          <p className="text-[11px] text-zinc-500">This is a design preview, not a Google Search result or validation result. Use markup only when these genuine ratings refer to the selected entity and are visible on the target page.</p>

          {/* Description */}
          <p className="text-xs text-zinc-600 leading-relaxed pt-1 line-clamp-2">
            {description}
          </p>
        </div>
      </section>

      {/* ── Unified Ready-to-Paste Star Code Studio ── */}
      <section className="apple-glass-card rounded-2xl p-5 sm:p-6 border border-black/[0.06] bg-white/80 backdrop-blur-xl space-y-5">
        {/* Dock Header with Platform Switcher */}
        <div className="space-y-3.5 pb-4 border-b border-black/[0.05]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Code2 className="w-4 h-4 text-[#6701e6]" />
                <h3 className="text-sm font-bold text-zinc-950">
                  Review Structured Data (JSON-LD)
                </h3>
              </div>
              <p className="text-xs text-zinc-500">
                Select your platform below for instant, tailor-made placement instructions.
              </p>
            </div>
            <span className="self-start sm:self-auto text-[10px] font-bold text-[#6701e6] bg-purple-50 border border-purple-200/80 px-2.5 py-1 rounded-full">
              6 Supported Platforms
            </span>
          </div>

          {/* Platform Tabs Selector: Clean responsive wrapping with generous breathing room and zero cutoff */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            {(['wordpress', 'shopify', 'webflow', 'framer', 'html', 'vibe'] as PlatformTab[]).map((p) => {
              const isSelected = selectedPlatform === p;
              return (
                <button
                  key={p}
                  type="button"
                  onClick={() => setSelectedPlatform(p)}
                  className={`apple-touch px-3.5 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#6701e6] text-white shadow-xs font-bold ring-2 ring-violet-500/20'
                      : 'bg-zinc-100/90 hover:bg-zinc-200/80 text-zinc-700 border border-zinc-200/80'
                  }`}
                >
                  {p === 'vibe' ? 'AI & Vibe Coded' : platformGuides[p].name}
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

            <div className="flex flex-wrap items-center gap-2">
              {/* Watch Video Tutorial Trigger Button */}
              <button
                type="button"
                onClick={() => setShowVideoModal(true)}
                className="apple-touch inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-violet-700 bg-violet-100/90 hover:bg-violet-200/90 border border-violet-300 shadow-2xs transition-all cursor-pointer group"
              >
                <Play className="w-3 h-3 fill-violet-600 text-violet-600 group-hover:scale-110 transition-transform" />
                <span>View Setup Guide (Preview)</span>
                <span className="text-[10px] font-semibold text-violet-600 bg-white/90 px-1.5 py-0.2 rounded-full border border-violet-200">
                  {platformGuides[selectedPlatform].videoDuration}
                </span>
              </button>

              <span className="text-[10px] font-bold text-purple-700 bg-white/90 border border-purple-200 px-2.5 py-0.5 rounded-full inline-flex self-start sm:self-auto">
                Target: {platformGuides[selectedPlatform].quickLocation}
              </span>
            </div>
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
              <span>Copied! Paste into your site header, then validate eligibility. Google decides whether stars appear.</span>
            </div>
            <span className="text-[10px] uppercase font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full shrink-0">
              Ready to Paste
            </span>
          </div>
        )}

        {/* Code Snippet Box */}
        <div className="relative group">
          <pre className="p-4 rounded-xl bg-zinc-950 text-purple-200 text-xs font-mono overflow-x-auto leading-relaxed border border-zinc-800 scrollbar-thin max-h-56 select-all">
            {jsonLdCode ?? 'No JSON-LD generated. Add genuine, approved, non-sample ratings and verify they are visible on the target page.'}
          </pre>
        </div>

        {/* Action Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
          <div className="flex items-center gap-2 text-xs text-zinc-500">
            <span className="font-mono text-[11px] bg-zinc-100 px-2 py-0.5 rounded-md border border-zinc-200 font-semibold text-zinc-700">
              JSON-LD • Schema.org
            </span>
            <span>{effectiveRating !== null ? `Calculated from ${effectiveCount} approved ratings (${effectiveRating}★ average)` : "No eligible rating data available"}</span>
          </div>

          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            {/* Primary Copy Button */}
            <button
              onClick={handleCopy}
              className="apple-touch inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#6701e6] hover:bg-[#5200bd] text-white text-xs font-bold shadow-xs transition-all cursor-pointer active:scale-95"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? '✓ Snippet Copied!' : 'Copy JSON-LD'}</span>
            </button>

            {/* 1-Click AI Prompt Copy Button for Cursor, Lovable, Bolt, v0 */}
            <button
              type="button"
              onClick={handleCopyAiPrompt}
              className="apple-touch inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-violet-50 hover:bg-violet-100 text-violet-800 border border-violet-200 text-xs font-bold shadow-2xs transition-all cursor-pointer active:scale-95"
              title="Copy 1-click prompt for Cursor, Lovable, Bolt, or v0"
            >
              {copiedAiPrompt ? <Check className="w-4 h-4 text-emerald-600" /> : <Sparkles className="w-4 h-4 text-violet-600" />}
              <span>{copiedAiPrompt ? '✓ AI Prompt Copied!' : 'Copy AI Prompt (Cursor / Lovable / v0)'}</span>
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
                    <option value="SoftwareApplication">SoftwareApplication (software only)</option>
                    <option value="Product">Product (a specific product only)</option>
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

                            <p className="text-[11px] leading-relaxed text-amber-900 bg-amber-50 border border-amber-200 rounded-lg p-3">Use Product only for reviews of that specific product, and SoftwareApplication only for reviews of that software. Use only genuine ratings visible on the target page. Google may not show a rich result even when markup is valid.</p>
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

      {/* ── Interactive Platform Video Tutorial Modal ── */}
      {showVideoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-md animate-fade-in">
          <div
            className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-violet-600 text-white flex items-center justify-center shadow-xs">
                  <Play className="w-4 h-4 fill-white text-white ml-0.5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 leading-snug">
                    {platformGuides[selectedPlatform].videoTitle}
                  </h3>
                  <p className="text-[11px] text-slate-500 font-medium">
                    Target: {platformGuides[selectedPlatform].quickLocation}
                  </p>
                </div>
              </div>
              <button
                type="button"
                aria-label="Close Video Tutorial"
                onClick={() => setShowVideoModal(false)}
                className="w-8 h-8 rounded-full bg-slate-200/60 hover:bg-slate-200 text-slate-600 hover:text-slate-900 flex items-center justify-center transition-colors cursor-pointer text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {/* Modal Body with Scroll */}
            <div className="p-5 overflow-y-auto space-y-4">
              {/* Simulated 16:9 HD Screencast Stage */}
              <div className="aspect-video w-full rounded-2xl bg-zinc-950 relative overflow-hidden border border-zinc-800 shadow-inner flex flex-col justify-between p-4 group">
                {/* Stage Header Bar */}
                <div className="flex items-center justify-between text-zinc-400 text-xs pb-2 border-b border-zinc-800/80">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    <span className="font-mono text-[11px] text-zinc-300 ml-1">
                      {platformGuides[selectedPlatform].screenTitle}
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-violet-950 text-violet-300 border border-violet-800">
                    Illustrative Guide — Not a Recording
                  </span>
                </div>

                {/* Animated Interactive Screen Mockup */}
                <div className="my-auto py-2 px-3 sm:px-6 flex flex-col items-center justify-center text-center space-y-2.5">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-xs font-bold animate-pulse">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{platformGuides[selectedPlatform].actionHighlight}</span>
                  </div>
                  <p className="text-zinc-200 text-xs max-w-md font-sans">
                    {platformGuides[selectedPlatform].videoSummary}
                  </p>
                  <div className="p-2.5 rounded-xl bg-zinc-900/90 border border-zinc-700/80 max-w-lg w-full text-left font-mono text-[11px] text-violet-300 truncate">
                    &lt;script type="application/ld+json"&gt; {businessName} Schema... &lt;/script&gt;
                  </div>
                </div>

                {/* Player Controls Bar */}
                <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between text-xs text-zinc-400">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                    <span className="text-[11px] font-mono text-zinc-300">
                      0:00 / {platformGuides[selectedPlatform].videoDuration}
                    </span>
                  </div>
                  <span className="text-[10px] text-zinc-400 font-sans">
                    Static walkthrough preview — not a video
                  </span>
                </div>
              </div>

              {/* Step-by-Step Timestamps */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Key Timestamps & Click-by-Click Guide
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {platformGuides[selectedPlatform].timestamps.map((ts, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-start gap-2.5 text-xs hover:border-violet-300 transition-colors"
                    >
                      <span className="px-1.5 py-0.5 rounded font-mono font-bold text-[10px] bg-violet-100 text-violet-700 border border-violet-200 shrink-0">
                        {ts.time}
                      </span>
                      <div className="min-w-0">
                        <strong className="text-slate-900 font-semibold block truncate leading-tight">
                          {ts.label}
                        </strong>
                        <span className="text-slate-500 text-[11px] leading-tight block">
                          {ts.desc}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Footer with In-Modal Copy & Close */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-2.5">
              <span className="text-[11px] text-slate-500">
                Paste directly into <strong className="text-slate-700">{platformGuides[selectedPlatform].quickLocation}</strong>
              </span>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => {
                    handleCopy();
                  }}
                  className="apple-touch flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copied ? '✓ Code Copied!' : 'Copy Schema Code'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowVideoModal(false)}
                  className="apple-touch px-3.5 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RichSnippetView;
