import React, { useState, useMemo } from 'react';
import { 
  Code2, 
  Copy, 
  Check, 
  Sparkles, 
  Star, 
  Eye, 
  Sliders,
  Layers,
  Award,
  Maximize2,
  MessageSquarePlus,
  Bell,
  ArrowLeft,
  Filter,
  Square,
  Moon,
  Sun,
  ShieldCheck,
  Globe,
  Heart
} from 'lucide-react';
import { Review, WidgetType, WidgetSettings } from '../../types';
import { useAuth } from '../../context/AuthContext';

export type CmsPlatform = 'script' | 'wordpress' | 'webflow' | 'framer' | 'shopify' | 'squarespace' | 'wix' | 'react' | 'nextjs' | 'html' | 'iframe';
export type WallTheme = 'light_gradient' | 'dark' | 'minimalist';

// Custom Brand Icons
const GoogleIcon = ({ className = 'w-3.5 h-3.5' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
  </svg>
);

const LinkedInIcon = ({ className = 'w-3.5 h-3.5' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="#0A66C2">
    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
  </svg>
);

const InstagramIcon = ({ className = 'w-3.5 h-3.5' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none">
    <rect width="24" height="24" rx="6" fill="url(#ig-grad-widget)" />
    <path d="M12 7.2A4.8 4.8 0 1 0 16.8 12 4.8 4.8 0 0 0 12 7.2zm0 7.9A3.1 3.1 0 1 1 15.1 12 3.1 3.1 0 0 1 12 15.1zm4.9-8.1a1.1 1.1 0 1 1-1.1-1.1 1.1 1.1 0 0 1 1.1 1.1z" fill="#FFF"/>
    <defs>
      <linearGradient id="ig-grad-widget" x1="0" y1="24" x2="24" y2="0" gradientUnits="userSpaceOnUse">
        <stop stopColor="#FFDC80" />
        <stop offset="0.25" stopColor="#F77737" />
        <stop offset="0.5" stopColor="#F56040" />
        <stop offset="0.75" stopColor="#FD1D1D" />
        <stop offset="1" stopColor="#C13584" />
      </linearGradient>
    </defs>
  </svg>
);

const FacebookIcon = ({ className = 'w-3.5 h-3.5' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="#1877F2">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);

interface WidgetStudioProps {
  reviews: Review[];
  onBack?: () => void;
  onOpenProof?: () => void;
}

export const WidgetStudio: React.FC<WidgetStudioProps> = ({ reviews, onBack, onOpenProof }) => {
  const { project } = useAuth();
  const projectWidgetId = project?.id;

  const [settings, setSettings] = useState<WidgetSettings>({
    type: 'wall',
    theme: 'light',
    primaryColor: '#6701e6',
    showRating: true,
    showAvatar: true,
    showDate: true,
    showCompany: true,
    maxCount: 9,
    onlyFeatured: false,
    autoAddByRating: 0,
    autoAddByTags: [],
  });

  // Wall of Love Theme & Source Filters
  const [wallTheme, setWallTheme] = useState<WallTheme>('light_gradient');
  const [minRating, setMinRating] = useState<number>(0);
  const [selectedSources, setSelectedSources] = useState<string[]>([
    'google',
    'linkedin',
    'instagram',
    'facebook',
    'direct',
  ]);

  const [cmsPlatform, setCmsPlatform] = useState<CmsPlatform>('script');
  const [copied, setCopied] = useState(false);

  // All approved reviews from project or fallback demo reviews
  const approvedReviews = useMemo(
    () => reviews.filter((r) => r.status === 'approved'),
    [reviews]
  );

  // Dynamic filtered reviews with source platform support & rating filter
  const filteredReviews = useMemo(() => {
    let list = approvedReviews;
    if (minRating > 0) {
      list = list.filter((r) => r.rating >= minRating);
    }
    if (selectedSources.length > 0) {
      list = list.filter((r: any) => {
        const src = (r.source || 'direct').toLowerCase();
        return selectedSources.some((s) => src.includes(s));
      });
    }
    return list;
  }, [approvedReviews, minRating, selectedSources]);

  const displayReviews = filteredReviews.slice(0, settings.maxCount);

  const toggleSource = (source: string) => {
    setSelectedSources((prev) =>
      prev.includes(source)
        ? prev.length > 1
          ? prev.filter((s) => s !== source)
          : prev
        : [...prev, source]
    );
  };

  const runtimeScriptUrl = 'https://pandapraise.com/embed.js';

  const getEmbedSnippet = () => {
    const projId = projectWidgetId || '';
    const sourcesStr = selectedSources.join(',');

    switch (cmsPlatform) {
      case 'script':
      case 'html':
      default:
        return `<div id="panda-praise-wall" data-project-id="${projId}" data-theme="${wallTheme}" data-min-rating="${minRating}" data-sources="${sourcesStr}"></div>\n<script src="${runtimeScriptUrl}" async></script>`;

      case 'wordpress':
        return `<!-- WordPress: Add a Custom HTML block and paste this code -->\n<div id="panda-praise-wall" data-project-id="${projId}" data-theme="${wallTheme}" data-min-rating="${minRating}" data-sources="${sourcesStr}"></div>\n<script src="${runtimeScriptUrl}" async></script>`;

      case 'webflow':
        return `<!-- Webflow: Add an Embed component (shortcut E) and paste this code -->\n<div id="panda-praise-wall" data-project-id="${projId}" data-theme="${wallTheme}" data-min-rating="${minRating}" data-sources="${sourcesStr}"></div>\n<script src="${runtimeScriptUrl}" async></script>`;

      case 'framer':
        return `<!-- Framer: Insert > Utility > Embed > HTML -->\n<div id="panda-praise-wall" data-project-id="${projId}" data-theme="${wallTheme}" data-min-rating="${minRating}" data-sources="${sourcesStr}"></div>\n<script src="${runtimeScriptUrl}" async></script>`;

      case 'shopify':
        return `<!-- Shopify: Theme Editor > Add section > Custom Liquid -->\n<div id="panda-praise-wall" data-project-id="${projId}" data-theme="${wallTheme}" data-min-rating="${minRating}" data-sources="${sourcesStr}"></div>\n<script src="${runtimeScriptUrl}" async></script>`;

      case 'squarespace':
        return `<!-- Squarespace: Add a Code Block (set mode to HTML) and paste this code -->\n<div id="panda-praise-wall" data-project-id="${projId}" data-theme="${wallTheme}" data-min-rating="${minRating}" data-sources="${sourcesStr}"></div>\n<script src="${runtimeScriptUrl}" async></script>`;

      case 'wix':
        return `<!-- Wix: Add Elements (+) > Embed Code > Embed HTML -->\n<div id="panda-praise-wall" data-project-id="${projId}" data-theme="${wallTheme}" data-min-rating="${minRating}" data-sources="${sourcesStr}"></div>\n<script src="${runtimeScriptUrl}" async></script>`;

      case 'react':
        return `// In your React component:\nimport { useEffect } from 'react';\n\nexport function WallOfLove() {\n  useEffect(() => {\n    const script = document.createElement('script');\n    script.src = '${runtimeScriptUrl}';\n    script.async = true;\n    document.body.appendChild(script);\n    return () => { script.remove(); };\n  }, []);\n\n  return (\n    <div\n      id="panda-praise-wall"\n      data-project-id="${projId}"\n      data-theme="${wallTheme}"\n      data-min-rating="${minRating}"\n      data-sources="${sourcesStr}"\n    />\n  );\n}`;

      case 'nextjs':
        return `// In your Next.js component (App Router or Pages):\n'use client';\nimport Script from 'next/script';\n\nexport function WallOfLove() {\n  return (\n    <section>\n      <div\n        id="panda-praise-wall"\n        data-project-id="${projId}"\n        data-theme="${wallTheme}"\n        data-min-rating="${minRating}"\n        data-sources="${sourcesStr}"\n      />\n      <Script src="${runtimeScriptUrl}" strategy="lazyOnload" />\n    </section>\n  );\n}`;

      case 'iframe':
        return `<iframe src="https://pandapraise.com/w/${projId}?theme=${wallTheme === 'dark' ? 'dark' : 'light'}" width="100%" height="600" frameborder="0" style="border:none;border-radius:16px;width:100%;min-height:600px;"></iframe>`;
    }
  };

  const getCmsGuide = () => {
    switch (cmsPlatform) {
      case 'script':
      default:
        return {
          title: 'Universal Script Tag (Recommended)',
          step1: 'Copy the code. You don\'t need to change anything.',
          step2: 'Paste into a Custom HTML block and publish. Works on any website.',
        };
      case 'wordpress':
        return {
          title: 'WordPress Installation',
          step1: 'Add a Custom HTML block where you want the widget.',
          step2: 'Paste the Panda Praise code and update your page.',
        };
      case 'webflow':
        return {
          title: 'Webflow Installation',
          step1: 'Add an Embed element from the Add panel where you want the widget.',
          step2: 'Paste the snippet above, click "Save & Close", and publish.',
        };
      case 'framer':
        return {
          title: 'Framer Installation',
          step1: 'Open the Insert menu (shortcut I), choose Utility → "Embed" (HTML mode).',
          step2: 'Paste the snippet above and set width to 100%.',
        };
      case 'shopify':
        return {
          title: 'Shopify Installation',
          step1: 'In Shopify Theme Editor, click "Add section" → "Custom Liquid" or "Custom HTML".',
          step2: 'Paste the code snippet above and click "Save".',
        };
      case 'squarespace':
        return {
          title: 'Squarespace Installation',
          step1: 'Add a Code block where you want the widget and set mode to HTML.',
          step2: 'Paste the code snippet above and click "Save".',
        };
      case 'wix':
        return {
          title: 'Wix Installation',
          step1: 'Click Add Elements (+) → Embed Code → Embed HTML.',
          step2: 'Paste the code snippet into the HTML box and resize to fit your section.',
        };
      case 'react':
        return {
          title: 'React Installation',
          step1: 'Drop this React component into your page or testimonials section.',
          step2: 'Renders dynamically on the client with zero build overhead.',
        };
      case 'nextjs':
        return {
          title: 'Next.js Installation (App Router / Pages)',
          step1: 'Use next/script with lazyOnload strategy as shown above.',
          step2: 'Prevents SSR hydration mismatch and optimizes script loading.',
        };
      case 'html':
        return {
          title: 'Custom HTML Installation (e.g. papasystem.in)',
          step1: 'Paste the <div> container and <script> tag into your HTML document.',
          step2: 'Zero frameworks required. Renders instantly on any static or dynamic page.',
        };
      case 'iframe':
        return {
          title: 'Universal iframe Embed',
          step1: 'Paste the <iframe> tag into any CMS that restricts custom JavaScript.',
          step2: 'Isolated, responsive container rendered directly by Panda Praise.',
        };
    }
  };

  const handlePublishSetup = () => {
    const projectId = project?.id;
    if (!projectId) return;
    localStorage.setItem(`panda-praise:publish-complete:${projectId}`, new Date().toISOString());
    window.dispatchEvent(new CustomEvent('panda-praise:publish-complete'));
  };

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(getEmbedSnippet());
      setCopied(true);
      handlePublishSetup();
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  const guide = getCmsGuide();

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans">
      {/* Studio Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-200 shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            {onBack && (
              <button
                onClick={onBack}
                className="px-2.5 py-1 rounded-lg text-xs font-semibold text-gray-600 hover:text-gray-900 hover:bg-gray-100 flex items-center gap-1 transition-colors cursor-pointer mr-2"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>
            )}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 text-[#6701e6] text-xs font-bold uppercase tracking-wider border border-purple-200">
              <Sparkles className="w-3.5 h-3.5" />
              Wall of Love & Widget Studio
            </div>
          </div>
          <h2 className="text-2xl font-bold font-display text-gray-950 tracking-tight">
            Embeddable Testimonial Widgets
          </h2>
          <p className="text-sm text-gray-500">
            Publish once. When you approve new testimonials in Panda Praise, your live website Wall of Love updates automatically.
          </p>
        </div>

        {/* Widget Format Selector */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-gray-100 rounded-xl border border-gray-200 self-start md:self-auto">
          {[
            { id: 'wall', label: 'Wall of Love', icon: Layers },
            { id: 'carousel', label: 'Carousel', icon: Maximize2 },
            { id: 'spotlight', label: 'Single Card', icon: Sparkles },
            { id: 'badge', label: 'Trust Badge', icon: Award },
            { id: 'floating_tab', label: 'Floating Tab', icon: MessageSquarePlus },
            { id: 'social_toast', label: 'Social Toast', icon: Bell },
          ].map((item) => {
            const Icon = item.icon;
            const isSelected = settings.type === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setSettings((prev) => ({ ...prev, type: item.id as WidgetType }))}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#6701e6] text-white shadow-xs'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200/60'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3 Universal Steps to Add to Any Website */}
      <div className="bg-gradient-to-r from-purple-50 via-indigo-50 to-pink-50 p-5 rounded-2xl border border-purple-200/80 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
          <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[#6701e6] text-white text-xs font-black">
              ✓
            </span>
            Add Panda Praise to Your Website (3 Universal Steps)
          </h2>
          <span className="text-[11px] font-semibold text-purple-700 bg-white/80 px-2.5 py-1 rounded-full border border-purple-200">
            Works with any website builder & custom HTML
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="bg-white/90 backdrop-blur-xs p-3.5 rounded-xl border border-purple-100 shadow-2xs">
            <div className="flex items-center gap-2 mb-1">
              <span className="w-5 h-5 rounded-full bg-purple-100 text-[#6701e6] font-black text-xs flex items-center justify-center">1</span>
              <p className="text-xs font-bold text-gray-800">Copy your widget code</p>
            </div>
            <p className="text-[11px] text-gray-600 leading-relaxed">
              Select your platform below and click <strong>Copy Embed Code</strong>. You do not need to configure any code.
            </p>
          </div>
          <div className="bg-white/90 backdrop-blur-xs p-3.5 rounded-xl border border-purple-100 shadow-2xs">
            <div className="flex items-center gap-2 mb-1">
              <span className="w-5 h-5 rounded-full bg-purple-100 text-[#6701e6] font-black text-xs flex items-center justify-center">2</span>
              <p className="text-xs font-bold text-gray-800">Paste where you want reviews</p>
            </div>
            <p className="text-[11px] text-gray-600 leading-relaxed">
              Add a <strong>Custom HTML / Embed block</strong> in your website editor (e.g. WordPress, Webflow, Shopify, or your HTML file).
            </p>
          </div>
          <div className="bg-white/90 backdrop-blur-xs p-3.5 rounded-xl border border-purple-100 shadow-2xs">
            <div className="flex items-center gap-2 mb-1">
              <span className="w-5 h-5 rounded-full bg-purple-100 text-[#6701e6] font-black text-xs flex items-center justify-center">3</span>
              <p className="text-xs font-bold text-gray-800">Publish your website</p>
            </div>
            <p className="text-[11px] text-gray-600 leading-relaxed">
              Save and hit <strong>Publish</strong>. When you approve new testimonials in Panda Praise, your live site updates automatically.
            </p>
          </div>
        </div>
      </div>

      {/* Grid: Customizer (Left) & Preview (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Controls & Dynamic Rules (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          
          {/* 1. Theme Customization */}
          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-3.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-[#6701e6]" />
              1. Theme & Appearance
            </h3>

            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'light_gradient', label: 'Light Gradient', icon: Sun, desc: 'Pastel purple glow' },
                { id: 'dark', label: 'Dark Mode', icon: Moon, desc: 'Sleek onyx & neon' },
                { id: 'minimalist', label: 'Minimalist', icon: Square, desc: 'Clean wireframe' },
              ].map((th) => {
                const isSelected = wallTheme === th.id;
                const Icon = th.icon;
                return (
                  <button
                    key={th.id}
                    onClick={() => {
                      setWallTheme(th.id as WallTheme);
                      setSettings((prev) => ({ ...prev, theme: th.id === 'dark' ? 'dark' : 'light' }));
                    }}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'border-[#6701e6] bg-purple-50/70 ring-2 ring-[#6701e6]/20'
                        : 'border-gray-200 bg-gray-50/50 hover:bg-gray-100 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <Icon className={`w-4 h-4 ${isSelected ? 'text-[#6701e6]' : 'text-gray-500'}`} />
                      {isSelected && <span className="w-2 h-2 rounded-full bg-[#6701e6]" />}
                    </div>
                    <div>
                      <p className={`text-xs font-bold ${isSelected ? 'text-[#6701e6]' : 'text-gray-900'}`}>
                        {th.label}
                      </p>
                      <p className="text-[10px] text-gray-500 leading-tight">{th.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Rating & Platform Source Filters */}
          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700 flex items-center gap-2">
              <Filter className="w-4 h-4 text-[#6701e6]" />
              2. Filter Rating & Sources
            </h3>

            {/* Minimum Star Rating */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-700 block">
                Minimum Star Rating
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { value: 0, label: 'All Reviews', desc: '1–5 Stars' },
                  { value: 4, label: '4+ Stars', desc: 'High satisfaction' },
                  { value: 5, label: '5 Stars Only', desc: 'Top praise only' },
                ].map((r) => {
                  const isSelected = minRating === r.value;
                  return (
                    <button
                      key={r.value}
                      onClick={() => setMinRating(r.value)}
                      className={`py-2 px-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer text-center ${
                        isSelected
                          ? 'bg-[#6701e6] text-white border-[#6701e6] shadow-xs'
                          : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      <div>{r.label}</div>
                      <div className={`text-[10px] font-normal ${isSelected ? 'text-purple-200' : 'text-gray-500'}`}>
                        {r.desc}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Toggle Sources (Google, LinkedIn, Instagram, Facebook, Direct) */}
            <div className="space-y-2 pt-2 border-t border-gray-100">
              <label className="text-xs font-semibold text-gray-700 block">
                Included Review Sources
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {[
                  { id: 'google', label: 'Google', icon: <GoogleIcon /> },
                  { id: 'linkedin', label: 'LinkedIn', icon: <LinkedInIcon /> },
                  { id: 'instagram', label: 'Instagram', icon: <InstagramIcon /> },
                  { id: 'facebook', label: 'Facebook', icon: <FacebookIcon /> },
                  { id: 'direct', label: 'Direct Form', icon: <Globe className="w-3.5 h-3.5 text-gray-500" /> },
                ].map((src) => {
                  const isChecked = selectedSources.includes(src.id);
                  return (
                    <button
                      key={src.id}
                      type="button"
                      onClick={() => toggleSource(src.id)}
                      className={`py-2 px-2.5 rounded-xl border text-xs font-semibold flex items-center justify-between transition-all cursor-pointer ${
                        isChecked
                          ? 'bg-purple-50/70 border-[#6701e6]/40 text-gray-900 font-bold'
                          : 'bg-gray-50/70 border-gray-200 text-gray-400 opacity-60 hover:opacity-90'
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        {src.icon}
                        <span>{src.label}</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={isChecked}
                        readOnly
                        className="rounded border-gray-300 text-[#6701e6] focus:ring-[#6701e6] pointer-events-none"
                      />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Max Items */}
            <div className="space-y-1.5 pt-2 border-t border-gray-100">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-gray-700">Display Limit</span>
                <span className="text-[#6701e6] font-bold">{settings.maxCount} testimonials</span>
              </div>
              <input
                type="range"
                min="3"
                max="18"
                step="3"
                value={settings.maxCount}
                onChange={(e) => setSettings((prev) => ({ ...prev, maxCount: Number(e.target.value) }))}
                className="w-full accent-[#6701e6] cursor-pointer"
              />
            </div>
          </div>

          {/* 3. Embed Code Generator */}
          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-3.5">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700 flex items-center gap-2">
                <Code2 className="w-4 h-4 text-[#6701e6]" />
                3. One-Click Embed Snippet
              </h3>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                Zero Layout Shift
              </span>
            </div>

            {/* Platform Selector Tabs */}
            <div className="flex flex-wrap gap-1 p-1 bg-gray-100 rounded-xl text-[11px] font-semibold">
              {[
                { id: 'script', label: 'Script Tag' },
                { id: 'wordpress', label: 'WordPress' },
                { id: 'webflow', label: 'Webflow' },
                { id: 'framer', label: 'Framer' },
                { id: 'shopify', label: 'Shopify' },
                { id: 'squarespace', label: 'Squarespace' },
                { id: 'wix', label: 'Wix' },
                { id: 'react', label: 'React' },
                { id: 'nextjs', label: 'Next.js' },
                { id: 'html', label: 'Custom HTML (papasystem.in)' },
                { id: 'iframe', label: 'iFrame Fallback' },
              ].map((p) => (
                <button
                  key={p.id}
                  onClick={() => setCmsPlatform(p.id as CmsPlatform)}
                  className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                    cmsPlatform === p.id
                      ? 'bg-white text-[#6701e6] font-bold shadow-xs'
                      : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>

            {/* Guidance */}
            <div className="p-3 rounded-xl bg-purple-50/60 border border-purple-200/80 text-xs text-gray-700 space-y-1">
              <p className="font-bold text-[#6701e6]">{guide.title}</p>
              <p className="text-[11px] text-gray-600">1. {guide.step1}</p>
              <p className="text-[11px] text-gray-600">2. {guide.step2}</p>
            </div>

            {/* Code Box */}
            <div className="p-3.5 rounded-xl bg-gray-950 font-mono text-[11px] text-emerald-400 border border-gray-800 overflow-x-auto select-all max-h-36 scrollbar-thin">
              <pre className="whitespace-pre-wrap">{getEmbedSnippet()}</pre>
            </div>

            <button
              onClick={handleCopyCode}
              className="w-full py-3 rounded-xl bg-[#6701e6] hover:bg-[#5200bd] text-xs font-bold text-white flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md hover:shadow-lg active:scale-[0.99]"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? '✓ Snippet Copied to Clipboard!' : 'Copy Embed Code'}</span>
            </button>
          </div>
        </div>

        {/* Right Column: Live Interactive Widget Preview Canvas (7 cols) */}
        <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-gray-200 shadow-xs flex flex-col min-h-[620px]">
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-5">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-[#6701e6]" />
              <span className="text-xs font-bold uppercase tracking-wider text-gray-700">
                Live Interactive Wall of Love Preview
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Showing {displayReviews.length} matching reviews</span>
            </div>
          </div>

          {/* Canvas Wrapper */}
          <div
            className={`flex-1 rounded-2xl p-6 transition-all duration-300 overflow-y-auto max-h-[750px] scrollbar-thin ${
              wallTheme === 'dark'
                ? 'bg-[#0f172a] border border-gray-800 text-white'
                : wallTheme === 'minimalist'
                  ? 'bg-white border border-gray-200 text-gray-900 shadow-xs'
                  : 'bg-gradient-to-br from-purple-50/50 via-white to-indigo-50/40 border border-purple-100 text-gray-900'
            }`}
          >
            {displayReviews.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-8">
                <div className="w-12 h-12 rounded-2xl bg-purple-100 text-[#6701e6] flex items-center justify-center mb-3">
                  <Filter className="w-6 h-6" />
                </div>
                <h4 className="text-base font-bold text-gray-900 mb-1">No Matching Testimonials</h4>
                <p className="text-xs text-gray-500 max-w-sm mb-4">
                  Approve at least one testimonial to preview and publish your proof here.
                </p>
                <button
                  onClick={() => {
                    if (onOpenProof) onOpenProof();
                    else {
                      setMinRating(0);
                      setSelectedSources(['google', 'linkedin', 'instagram', 'facebook', 'direct']);
                    }
                  }}
                  className="px-4 py-2 rounded-xl bg-[#6701e6] hover:bg-[#5200bd] text-white text-xs font-bold cursor-pointer transition-colors shadow-xs"
                >
                  Go to Proof
                </button>
              </div>
            ) : settings.type === 'wall' ? (
              /* Masonry Wall of Love */
              <div className="space-y-6">
                <div className="columns-1 md:columns-2 gap-4 [column-fill:_balance]">
                  {displayReviews.map((r: any) => {
                    const source = (r.source || 'direct').toLowerCase();
                    return (
                      <div
                        key={r.id}
                        className={`break-inside-avoid mb-4 p-5 rounded-2xl transition-all duration-200 flex flex-col justify-between ${
                          wallTheme === 'dark'
                            ? 'bg-[#1e293b] border border-white/10 text-gray-100 shadow-md hover:border-purple-500/50'
                            : wallTheme === 'minimalist'
                              ? 'bg-white border border-gray-200 text-gray-900 hover:border-gray-950'
                              : 'bg-white border border-purple-100/80 text-gray-900 shadow-xs hover:shadow-md hover:border-[#6701e6]/40'
                        }`}
                      >
                        {/* Top row: Stars + Source */}
                        <div className="flex items-center justify-between gap-2 mb-3">
                          <div className="flex items-center gap-0.5">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-3.5 h-3.5 ${
                                  i < r.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>

                          {/* Source badge */}
                          {source === 'google' && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                              <GoogleIcon /> Google
                            </span>
                          )}
                          {source === 'linkedin' && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-50 text-[#0A66C2] border border-sky-200">
                              <LinkedInIcon /> LinkedIn
                            </span>
                          )}
                          {source === 'instagram' && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-pink-50 text-[#E4405F] border border-pink-200">
                              <InstagramIcon /> Instagram
                            </span>
                          )}
                          {source === 'facebook' && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-[#1877F2] border border-blue-200">
                              <FacebookIcon /> Facebook
                            </span>
                          )}
                        </div>

                        {/* Review text */}
                        <p className={`text-xs leading-relaxed mb-4 ${
                          wallTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                        }`}>
                          "{r.content || r.text}"
                        </p>

                        {/* Author info */}
                        <div className={`flex items-center gap-3 pt-3 border-t ${
                          wallTheme === 'dark' ? 'border-white/10' : 'border-gray-100'
                        }`}>
                          <div className="w-8 h-8 rounded-full overflow-hidden bg-purple-100 shrink-0 border border-gray-200">
                            {r.avatarUrl ? (
                              <img src={r.avatarUrl} alt={r.name} className="w-full h-full object-cover" />
                            ) : (
                              <span className="text-xs font-bold text-[#6701e6] flex items-center justify-center h-full">
                                {r.name?.charAt(0) || 'U'}
                              </span>
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1">
                              <p className={`text-xs font-bold leading-tight truncate ${
                                wallTheme === 'dark' ? 'text-white' : 'text-gray-900'
                              }`}>
                                {r.name}
                              </p>
                              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                            </div>
                            <p className="text-[10.5px] text-gray-400 truncate leading-tight">
                              {r.role || r.authorTitle || ''} {r.company ? `• ${r.company}` : ''}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Footer Attribution Badge */}
                <div className="text-center pt-2">
                  <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full border ${
                    wallTheme === 'dark'
                      ? 'bg-white/5 text-gray-400 border-white/10'
                      : 'bg-white text-gray-600 border-gray-200 shadow-2xs'
                  }`}>
                    <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
                    Verified with Panda Praise
                  </span>
                </div>
              </div>
            ) : (
              /* Other widget formats fallback preview */
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {displayReviews.map((r: any) => (
                  <div
                    key={r.id}
                    className={`p-4 rounded-xl border ${
                      wallTheme === 'dark'
                        ? 'bg-gray-900 border-gray-800 text-gray-100'
                        : 'bg-white border-gray-200 text-gray-900 shadow-2xs'
                    }`}
                  >
                    <div className="flex items-center gap-1 mb-2">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3.5 h-3.5 ${
                            i < r.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-xs leading-relaxed italic mb-3">"{r.content || r.text}"</p>
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full overflow-hidden bg-purple-100 shrink-0">
                        {r.avatarUrl ? (
                          <img src={r.avatarUrl} alt={r.name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-[10px] font-bold text-[#6701e6] flex items-center justify-center h-full">
                            {r.name?.charAt(0) || 'U'}
                          </span>
                        )}
                      </div>
                      <div>
                        <p className="text-xs font-bold leading-tight">{r.name}</p>
                        <p className="text-[10px] text-gray-500">
                          {r.role} {r.company ? `• ${r.company}` : ''}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
