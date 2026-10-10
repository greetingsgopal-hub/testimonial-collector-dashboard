import React, { useState, useEffect, useMemo } from 'react';
import {
  Code2,
  Copy,
  Check,
  X,
  ExternalLink,
  Globe,
  Sparkles,
  Layers,
  Monitor,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Loader2,
  ShieldCheck,
  Terminal,
  FileCode2,
} from 'lucide-react';

export type EmbedPlatform = 'webflow' | 'wordpress' | 'shopify' | 'react' | 'iframe';

export interface EmbedCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId?: string;
  widgetType?: string;
  theme?: string;
  minRating?: number;
  sources?: string[];
  maxCount?: number;
  publicWallUrl?: string;
}

export const EmbedCodeModal: React.FC<EmbedCodeModalProps> = ({
  isOpen,
  onClose,
  projectId,
  widgetType = 'wall',
  theme = 'light_gradient',
  minRating = 0,
  sources = [],
  maxCount = 12,
  publicWallUrl,
}) => {
  const [activeTab, setActiveTab] = useState<EmbedPlatform>('webflow');
  const [reactSubTab, setReactSubTab] = useState<'html' | 'react' | 'nextjs'>('react');
  const [copied, setCopied] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  // Live website verification state
  const [verifyUrl, setVerifyUrl] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifyResult, setVerifyResult] = useState<{
    verified: boolean;
    details: string;
    hasScript: boolean;
    hasContainer: boolean;
  } | null>(null);

  // Handle ESC key listener & body scroll lock
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen, onClose]);

  // Generate dynamic embed snippets
  const cleanProjectId = projectId || 'YOUR_PROJECT_ID';
  const sourcesStr = sources.length > 0 ? sources.join(',') : '';

  const snippetCode = useMemo(() => {
    const attrs = [
      `id="panda-praise-wall"`,
      `data-project-id="${cleanProjectId}"`,
      `data-widget-type="${widgetType}"`,
      `data-theme="${theme}"`,
      minRating > 0 ? `data-min-rating="${minRating}"` : null,
      sourcesStr ? `data-sources="${sourcesStr}"` : null,
      maxCount !== 12 ? `data-max-count="${maxCount}"` : null,
    ].filter(Boolean).join(' ');

    const htmlEmbed = `<div ${attrs}></div>\n<script src="https://pandapraise.com/widget.js" async></script>`;

    switch (activeTab) {
      case 'webflow':
        return `<!-- Webflow / Framer Embed -->\n${htmlEmbed}`;
      case 'wordpress':
        return `<!-- WordPress: Custom HTML block or Elementor HTML widget -->\n${htmlEmbed}`;
      case 'shopify':
        return `<!-- Shopify: Custom Liquid section or theme.liquid -->\n${htmlEmbed}`;
      case 'react':
        if (reactSubTab === 'react') {
          return `// React Component (Vite, CRA, Remix)
import React, { useEffect } from 'react';

export function TestimonialWidget() {
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://pandapraise.com/widget.js';
    script.async = true;
    document.body.appendChild(script);
    return () => { script.remove(); };
  }, []);

  return (
    <div
      id="panda-praise-wall"
      data-project-id="${cleanProjectId}"
      data-widget-type="${widgetType}"
      data-theme="${theme}"${minRating > 0 ? `\n      data-min-rating="${minRating}"` : ''}${sourcesStr ? `\n      data-sources="${sourcesStr}"` : ''}
    />
  );
}`;
        }
        if (reactSubTab === 'nextjs') {
          return `// Next.js App or Pages Router
'use client';
import Script from 'next/script';

export function TestimonialWidget() {
  return (
    <section className="w-full">
      <div
        id="panda-praise-wall"
        data-project-id="${cleanProjectId}"
        data-widget-type="${widgetType}"
        data-theme="${theme}"${minRating > 0 ? `\n        data-min-rating="${minRating}"` : ''}
      />
      <Script src="https://pandapraise.com/widget.js" strategy="lazyOnload" />
    </section>
  );
}`;
        }
        return `<!-- Custom HTML: Paste right before closing </body> tag -->\n${htmlEmbed}`;
      case 'iframe':
        return `<iframe\n  src="https://pandapraise.com/w/${cleanProjectId}?embed=true"\n  width="100%"\n  height="600"\n  frameborder="0"\n  style="border:0; width:100%; min-height:600px; border-radius:16px;"\n  loading="lazy"\n></iframe>`;
      default:
        return htmlEmbed;
    }
  }, [cleanProjectId, widgetType, theme, minRating, sourcesStr, maxCount, activeTab, reactSubTab]);

  const handleCopy = async () => {
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(snippetCode);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  const handleCopyLink = async () => {
    if (!publicWallUrl) return;
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(publicWallUrl);
      }
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    } catch {
      setLinkCopied(false);
    }
  };

  const handleVerify = async () => {
    if (!verifyUrl.trim()) return;
    setIsVerifying(true);
    setVerifyResult(null);
    try {
      const res = await fetch('/api/verify-widget', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: verifyUrl.trim(), projectId: cleanProjectId }),
      });
      const data = await res.json();
      setVerifyResult({
        verified: Boolean(data?.verified),
        details: data?.details || (data?.verified ? 'Widget detected and active!' : 'Could not find widget snippet on this page.'),
        hasScript: Boolean(data?.hasScript),
        hasContainer: Boolean(data?.hasContainer),
      });
    } catch {
      setVerifyResult({
        verified: false,
        details: 'Verification request timed out. Make sure your site is publicly accessible.',
        hasScript: false,
        hasContainer: false,
      });
    } finally {
      setIsVerifying(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="embed-modal-title"
      data-testid="modal-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div
        className="bg-white dark:bg-slate-900 rounded-3xl border border-gray-200 dark:border-slate-800 shadow-2xl max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 text-gray-900 dark:text-gray-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-slate-800 bg-gray-50/70 dark:bg-slate-950/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-violet-100 dark:bg-violet-900/40 text-[#6701e6] dark:text-violet-400 flex items-center justify-center shrink-0">
              <Code2 className="w-5 h-5" />
            </div>
            <div>
              <h2 id="embed-modal-title" className="text-base sm:text-lg font-bold text-gray-950 dark:text-white flex items-center gap-2">
                <span>Get Embed Code & Installation Guide</span>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-violet-100 dark:bg-violet-900/60 text-[#6701e6] dark:text-violet-300 border border-violet-200 dark:border-violet-700/60">
                  {widgetType}
                </span>
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Paste the snippet into your website to showcase verified social proof.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close embed modal"
            className="w-8 h-8 rounded-full bg-gray-200/60 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-600 dark:text-gray-300 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Content Scroll Area */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 scrollbar-thin">
          {/* Snippet Header & Copy Box */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-gray-800 dark:text-gray-200">
                <FileCode2 className="w-4 h-4 text-[#6701e6] dark:text-violet-400" />
                <span>Your Embed Code Snippet</span>
              </div>
              <span className="text-[11px] text-gray-500 dark:text-gray-400">
                Zero layout shift • Automatic updates
              </span>
            </div>

            <div className="relative rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden shadow-inner">
              {/* Syntax Highlighted Box */}
              <pre className="p-4 pt-4 pr-32 font-mono text-[11px] leading-relaxed text-emerald-400 overflow-x-auto select-all max-h-48 scrollbar-thin">
                <code>{snippetCode}</code>
              </pre>

              {/* Prominent Copy Button */}
              <div className="absolute right-3 top-3">
                <button
                  type="button"
                  data-testid="copy-snippet-btn"
                  onClick={handleCopy}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-md active:scale-95 ${
                    copied
                      ? 'bg-emerald-600 text-white'
                      : 'bg-[#6701e6] hover:bg-[#5200bd] text-white hover:shadow-violet-500/25'
                  }`}
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-white" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Code</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Platform-Specific Tabbed Guides */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-gray-900 dark:text-gray-100 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-[#6701e6] dark:text-violet-400" />
                <span>Choose Your Publishing Platform:</span>
              </label>
              <span className="text-[11px] text-gray-500 dark:text-gray-400">Click for exact steps</span>
            </div>

            {/* Platform Tab Buttons */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                data-testid="tab-webflow"
                onClick={() => setActiveTab('webflow')}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-2.5 ${
                  activeTab === 'webflow'
                    ? 'border-[#6701e6] bg-violet-50/70 dark:bg-violet-950/40 text-[#6701e6] dark:text-violet-300 font-bold ring-2 ring-violet-500/20'
                    : 'border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-800/60 hover:bg-gray-50 dark:hover:bg-slate-800 text-gray-700 dark:text-gray-300 text-xs font-semibold'
                }`}
              >
                <div className="w-7 h-7 rounded-lg bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                  <Monitor className="w-3.5 h-3.5" />
                </div>
                <div className="truncate">
                  <span className="block text-xs">Webflow / Framer</span>
                  <span className="block text-[10px] text-gray-500 dark:text-gray-400 font-normal">Custom Embed</span>
                </div>
              </button>

              <button
                type="button"
                data-testid="tab-wordpress"
                onClick={() => setActiveTab('wordpress')}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-2.5 ${
                  activeTab === 'wordpress'
                    ? 'border-[#6701e6] bg-violet-50/70 dark:bg-violet-950/40 text-[#6701e6] dark:text-violet-300 font-bold ring-2 ring-violet-500/20'
                    : 'border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-800/60 hover:bg-gray-50 dark:hover:bg-slate-800 text-gray-700 dark:text-gray-300 text-xs font-semibold'
                }`}
              >
                <div className="w-7 h-7 rounded-lg bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                  <Globe className="w-3.5 h-3.5" />
                </div>
                <div className="truncate">
                  <span className="block text-xs">WordPress</span>
                  <span className="block text-[10px] text-gray-500 dark:text-gray-400 font-normal">Gutenberg / Elementor</span>
                </div>
              </button>

              <button
                type="button"
                data-testid="tab-shopify"
                onClick={() => setActiveTab('shopify')}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-2.5 ${
                  activeTab === 'shopify'
                    ? 'border-[#6701e6] bg-violet-50/70 dark:bg-violet-950/40 text-[#6701e6] dark:text-violet-300 font-bold ring-2 ring-violet-500/20'
                    : 'border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-800/60 hover:bg-gray-50 dark:hover:bg-slate-800 text-gray-700 dark:text-gray-300 text-xs font-semibold'
                }`}
              >
                <div className="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
                <div className="truncate">
                  <span className="block text-xs">Shopify</span>
                  <span className="block text-[10px] text-gray-500 dark:text-gray-400 font-normal">Liquid Section</span>
                </div>
              </button>

              <button
                type="button"
                data-testid="tab-react"
                onClick={() => setActiveTab('react')}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-2.5 ${
                  activeTab === 'react'
                    ? 'border-[#6701e6] bg-violet-50/70 dark:bg-violet-950/40 text-[#6701e6] dark:text-violet-300 font-bold ring-2 ring-violet-500/20'
                    : 'border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-800/60 hover:bg-gray-50 dark:hover:bg-slate-800 text-gray-700 dark:text-gray-300 text-xs font-semibold'
                }`}
              >
                <div className="w-7 h-7 rounded-lg bg-cyan-100 dark:bg-cyan-900/40 text-cyan-600 dark:text-cyan-400 flex items-center justify-center shrink-0">
                  <Terminal className="w-3.5 h-3.5" />
                </div>
                <div className="truncate">
                  <span className="block text-xs">React / Next.js</span>
                  <span className="block text-[10px] text-gray-500 dark:text-gray-400 font-normal">Custom Code</span>
                </div>
              </button>
            </div>

            {/* Instruction Card for Selected Platform */}
            <div className="p-4 rounded-2xl bg-gray-50/90 dark:bg-slate-800/40 border border-gray-200/80 dark:border-slate-800 space-y-3.5">
              {activeTab === 'webflow' && (
                <div className="space-y-3 text-xs">
                  <div className="flex items-center justify-between pb-2 border-b border-gray-200/60 dark:border-slate-700">
                    <span className="font-bold text-gray-900 dark:text-white">Webflow & Framer Walkthrough</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300">
                      Drag & Drop
                    </span>
                  </div>
                  <ol className="space-y-2 text-gray-700 dark:text-gray-300">
                    <li className="flex items-start gap-2">
                      <span className="w-4 h-4 rounded-full bg-violet-200 dark:bg-violet-900/80 text-[#6701e6] dark:text-violet-300 font-black text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                        1
                      </span>
                      <span>
                        In your Webflow Designer or Framer Canvas, open the <strong>Add Elements (+)</strong> panel (press <kbd className="px-1 py-0.5 rounded bg-gray-200 dark:bg-slate-700 text-[10px]">A</kbd> or <kbd className="px-1 py-0.5 rounded bg-gray-200 dark:bg-slate-700 text-[10px]">Cmd+E</kbd>).
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-4 h-4 rounded-full bg-violet-200 dark:bg-violet-900/80 text-[#6701e6] dark:text-violet-300 font-black text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                        2
                      </span>
                      <span>
                        Search for <strong>Embed</strong> (in Webflow) or <strong>Custom HTML / Utility Embed</strong> (in Framer) and drag it into your desired section.
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-4 h-4 rounded-full bg-violet-200 dark:bg-violet-900/80 text-[#6701e6] dark:text-violet-300 font-black text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                        3
                      </span>
                      <span>Paste your copied snippet code into the embed editor and click <strong>Save & Close</strong>.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-4 h-4 rounded-full bg-violet-200 dark:bg-violet-900/80 text-[#6701e6] dark:text-violet-300 font-black text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                        4
                      </span>
                      <span><strong>Publish your website</strong> live. Webflow and Framer render custom script embeds exclusively on published domains.</span>
                    </li>
                  </ol>
                </div>
              )}

              {activeTab === 'wordpress' && (
                <div className="space-y-3 text-xs">
                  <div className="flex items-center justify-between pb-2 border-b border-gray-200/60 dark:border-slate-700">
                    <span className="font-bold text-gray-900 dark:text-white">WordPress (Gutenberg & Elementor)</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300">
                      Gutenberg & Elementor
                    </span>
                  </div>
                  <ol className="space-y-2 text-gray-700 dark:text-gray-300">
                    <li className="flex items-start gap-2">
                      <span className="w-4 h-4 rounded-full bg-violet-200 dark:bg-violet-900/80 text-[#6701e6] dark:text-violet-300 font-black text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                        1
                      </span>
                      <span>Open the target Page or Post in your WordPress Admin Editor.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-4 h-4 rounded-full bg-violet-200 dark:bg-violet-900/80 text-[#6701e6] dark:text-violet-300 font-black text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                        2
                      </span>
                      <span>
                        In Gutenberg, type <kbd className="px-1 py-0.5 rounded bg-gray-200 dark:bg-slate-700 text-[10px]">/html</kbd> and add the <strong>Custom HTML</strong> block. In Elementor, search and drag the <strong>HTML</strong> widget.
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-4 h-4 rounded-full bg-violet-200 dark:bg-violet-900/80 text-[#6701e6] dark:text-violet-300 font-black text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                        3
                      </span>
                      <span>Paste your PandaPraise snippet into the block and click <strong>Update / Publish</strong>.</span>
                    </li>
                  </ol>
                </div>
              )}

              {activeTab === 'shopify' && (
                <div className="space-y-3 text-xs">
                  <div className="flex items-center justify-between pb-2 border-b border-gray-200/60 dark:border-slate-700">
                    <span className="font-bold text-gray-900 dark:text-white">Shopify Storefront</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300">
                      Theme Editor
                    </span>
                  </div>
                  <ol className="space-y-2 text-gray-700 dark:text-gray-300">
                    <li className="flex items-start gap-2">
                      <span className="w-4 h-4 rounded-full bg-violet-200 dark:bg-violet-900/80 text-[#6701e6] dark:text-violet-300 font-black text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                        1
                      </span>
                      <span>Go to <strong>Shopify Admin &gt; Online Store &gt; Themes</strong> and click <strong>Customize</strong>.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-4 h-4 rounded-full bg-violet-200 dark:bg-violet-900/80 text-[#6701e6] dark:text-violet-300 font-black text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                        2
                      </span>
                      <span>In your layout sidebar, click <strong>Add section</strong> and select <strong>Custom Liquid</strong> (or Custom HTML).</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-4 h-4 rounded-full bg-violet-200 dark:bg-violet-900/80 text-[#6701e6] dark:text-violet-300 font-black text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                        3
                      </span>
                      <span>Paste the snippet code into the Liquid editor, drag it into place, and click <strong>Save</strong>.</span>
                    </li>
                  </ol>
                  <div className="p-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-[11px] text-amber-900 dark:text-amber-200 flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                    <span>For full sitewide footers, you can also paste the script into <code>layout/theme.liquid</code> right above the closing <code>&lt;/body&gt;</code> tag.</span>
                  </div>
                </div>
              )}

              {activeTab === 'react' && (
                <div className="space-y-3 text-xs">
                  <div className="flex items-center justify-between pb-2 border-b border-gray-200/60 dark:border-slate-700">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setReactSubTab('react')}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          reactSubTab === 'react'
                            ? 'bg-[#6701e6] text-white'
                            : 'bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-slate-700'
                        }`}
                      >
                        React Component
                      </button>
                      <button
                        type="button"
                        onClick={() => setReactSubTab('nextjs')}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          reactSubTab === 'nextjs'
                            ? 'bg-[#6701e6] text-white'
                            : 'bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-slate-700'
                        }`}
                      >
                        Next.js (App / Pages)
                      </button>
                      <button
                        type="button"
                        onClick={() => setReactSubTab('html')}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          reactSubTab === 'html'
                            ? 'bg-[#6701e6] text-white'
                            : 'bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-slate-700'
                        }`}
                      >
                        Plain HTML
                      </button>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-100 dark:bg-cyan-900/60 text-cyan-700 dark:text-cyan-300">
                      Developer
                    </span>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                    {reactSubTab === 'react' && 'In React (Vite / CRA), dynamically inject the script inside a useEffect hook to ensure client-side execution and clean unmounting.'}
                    {reactSubTab === 'nextjs' && 'In Next.js, leverage next/script with strategy="lazyOnload" to guarantee zero impact on initial Core Web Vitals.'}
                    {reactSubTab === 'html' && 'In static HTML or single page applications, place the script tag immediately before the closing </body> tag.'}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Standalone Hosted URL Option */}
          {publicWallUrl && (
            <div className="p-4 rounded-2xl bg-violet-50/50 dark:bg-violet-950/20 border border-violet-100 dark:border-violet-900/40 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#6701e6] dark:text-violet-400">
                  Or Share as Standalone Hosted Link:
                </span>
                <a
                  href={publicWallUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[11px] text-[#6701e6] dark:text-violet-400 hover:underline flex items-center gap-1 font-semibold"
                >
                  <span>Open Wall</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={publicWallUrl}
                  className="flex-1 px-3 py-2 rounded-xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-800/80 text-xs font-mono text-gray-700 dark:text-gray-300 select-all"
                />
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="px-3.5 py-2 rounded-xl bg-slate-900 dark:bg-slate-700 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
                >
                  {linkCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{linkCopied ? 'Copied!' : 'Copy Link'}</span>
                </button>
              </div>
            </div>
          )}

          {/* Automated Live Website Verifier */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/60 border border-gray-200 dark:border-slate-800 space-y-3 shadow-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span className="text-xs font-bold text-gray-900 dark:text-white">
                  Automated Live Website Verifier
                </span>
              </div>
              <span className="text-[10px] font-semibold text-gray-500 dark:text-gray-400">
                Installation Check
              </span>
            </div>

            <p className="text-[11px] text-gray-600 dark:text-gray-400">
              Enter the URL where you published the widget to test if your script tag and container are active.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <div className="relative flex-1">
                <Globe className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="url"
                  value={verifyUrl}
                  onChange={(e) => setVerifyUrl(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !isVerifying) {
                      e.preventDefault();
                      handleVerify();
                    }
                  }}
                  placeholder="https://yourwebsite.com"
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#6701e6]/30"
                />
              </div>
              <button
                type="button"
                onClick={handleVerify}
                disabled={isVerifying || !verifyUrl.trim()}
                className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-slate-700 hover:bg-slate-800 disabled:opacity-50 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer shrink-0"
              >
                {isVerifying ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-purple-300" />
                    <span>Verifying...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Verify Installation</span>
                  </>
                )}
              </button>
            </div>

            {verifyResult && (
              <div
                className={`p-3 rounded-xl border text-xs ${
                  verifyResult.verified
                    ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800 text-emerald-950 dark:text-emerald-200'
                    : 'bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800 text-rose-950 dark:text-rose-200'
                }`}
              >
                <div className="flex items-start gap-2">
                  {verifyResult.verified ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  )}
                  <div className="space-y-0.5 flex-1">
                    <p className="font-bold">{verifyResult.details}</p>
                    {verifyResult.verified && (
                      <div className="pt-1 flex items-center gap-3 text-[10px] font-semibold text-emerald-800 dark:text-emerald-300">
                        <span>✓ Script Tag: {verifyResult.hasScript ? 'Detected' : 'Active'}</span>
                        <span>✓ Container: {verifyResult.hasContainer ? 'Found' : 'Auto-Mounted'}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 dark:border-slate-800 bg-gray-50/70 dark:bg-slate-950/40 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <span>Approved testimonials update dynamically without modifying code.</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-gray-200 dark:bg-slate-800 hover:bg-gray-300 dark:hover:bg-slate-700 text-gray-800 dark:text-gray-200 font-bold transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
