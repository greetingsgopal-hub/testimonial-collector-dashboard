import React, { useState } from 'react';
import {
  Sparkles,
  Award,
  Layers,
  Heart,
  ArrowRight,
  Code2,
  Copy,
  Check,
  MessageSquareQuote,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';

interface StudioViewProps {
  onOpenWidgetCreator?: () => void;
  onOpenSocialCard?: () => void;
  onOpenWallOfLove?: () => void;
  approvedCount?: number;
  onOpenProof?: () => void;
  onCollect?: () => void;
}

export const StudioView: React.FC<StudioViewProps> = ({
  onOpenWidgetCreator,
  onOpenSocialCard,
  onOpenWallOfLove,
  approvedCount = 0,
  onOpenProof,
  onCollect,
}) => {
  const { project } = useAuth();
  const [copiedCode, setCopiedCode] = useState(false);

  const sampleEmbedScript = `<script defer src="https://pandapraise.com/widget.js" data-project="${project?.slug || 'my-project'}"></script>`;

  const handleCopyScript = () => {
    navigator.clipboard.writeText(sampleEmbedScript);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2200);
  };

  return (
    <div className="max-w-6xl mx-auto py-4 px-2 sm:px-4 space-y-6 animate-fade-in font-sans text-left">
      
      {/* ── Apple Executive Hero Header: At-A-Glance Value ── */}
      <section className="apple-glass-card rounded-2xl p-6 sm:p-7 border border-black/[0.06] bg-white/80 backdrop-blur-2xl relative overflow-hidden">
        {/* Subtle Ambient Radial Lighting */}
        <div className="absolute -top-16 -right-16 w-56 h-56 bg-violet-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-700 text-[11px] font-bold tracking-tight">
              <Sparkles className="w-3.5 h-3.5 text-violet-600" />
              <span>Interactive Embed Studio</span>
              <span className="text-violet-300">•</span>
              <span className="text-zinc-600 font-medium">Website Social Proof</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-950 tracking-tight font-display">
              Turn Customer Proof into High-Converting Website Widgets
            </h1>

            <p className="text-xs sm:text-sm text-zinc-500 leading-relaxed">
              Deploy responsive Walls of Love, dynamic floating social proof toasts, and trust badges onto any website in under 60 seconds. Compatible with WordPress, Shopify, Webflow, Framer, and custom code.
            </p>
          </div>

          {/* Tactical Status & Quick Action */}
          <div className="shrink-0 flex flex-col sm:items-end gap-2.5">
            <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-zinc-50/80 border border-black/[0.06]">
              <span className={`w-2 h-2 rounded-full ${approvedCount > 0 ? 'bg-emerald-500 animate-pulse' : 'bg-violet-500'}`} />
              <span className="text-xs font-bold text-zinc-800">
                {approvedCount > 0 ? `${approvedCount} Approved Testimonials Ready` : 'Interactive Preview Mode Active'}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyScript}
                className="apple-touch inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-zinc-50 text-zinc-800 border border-black/[0.08] text-xs font-semibold shadow-2xs transition-all cursor-pointer"
                title="Copy universal embed script"
              >
                {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Code2 className="w-3.5 h-3.5 text-zinc-500" />}
                <span>{copiedCode ? 'Copied Script' : 'Copy Embed Code'}</span>
              </button>

              <button
                onClick={onOpenWallOfLove || onOpenWidgetCreator}
                className="apple-touch inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-semibold shadow-xs transition-all cursor-pointer"
              >
                <span>Create New Widget</span>
                <ArrowRight className="w-3.5 h-3.5 text-zinc-400" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Activation Accelerator Banner (When proof is 0, invites without blocking) ── */}
      {approvedCount === 0 && (
        <section className="apple-glass-card rounded-2xl p-4 sm:p-5 border border-violet-500/20 bg-violet-500/[0.02] backdrop-blur-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-700 shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-zinc-950">
                Studio is running with interactive live previews
              </p>
              <p className="text-[11px] text-zinc-500 mt-0.5">
                Explore and customize all 4 widget formats below. Once you approve real testimonials, they will instantly stream to your live website widgets.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={onOpenProof}
              className="apple-touch px-3 py-1.5 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-semibold shadow-xs transition-all cursor-pointer"
            >
              Review Pending Proof
            </button>
            <button
              onClick={onCollect}
              className="apple-touch px-3 py-1.5 rounded-xl bg-white hover:bg-zinc-50 text-zinc-800 border border-black/[0.08] text-xs font-semibold shadow-2xs transition-all cursor-pointer"
            >
              Collect New Proof
            </button>
          </div>
        </section>
      )}

      {/* ── 3-Step Guided Workflow Deck (How to Use This at First Glance) ── */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="apple-glass-card rounded-2xl p-5 border border-black/[0.06] bg-white/70 backdrop-blur-xl space-y-2">
          <div className="w-8 h-8 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-700 font-bold text-xs font-mono mb-2">
            01
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 font-mono">
            Choose Widget Format
          </span>
          <h3 className="text-sm font-bold text-zinc-950">
            Select Your Display Style
          </h3>
          <p className="text-xs text-zinc-500 leading-relaxed">
            Choose between a full-page Wall of Love, floating social proof toasts, continuous marquee ribbon, or trust badges.
          </p>
        </div>

        <div className="apple-glass-card rounded-2xl p-5 border border-black/[0.06] bg-white/70 backdrop-blur-xl space-y-2">
          <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-700 font-bold text-xs font-mono mb-2">
            02
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 font-mono">
            Customize Brand Appearance
          </span>
          <h3 className="text-sm font-bold text-zinc-950">
            Tailor Colors & Layout
          </h3>
          <p className="text-xs text-zinc-500 leading-relaxed">
            Match your website's aesthetic with dark/light themes, rounded corners, star colors, and verified customer badges.
          </p>
        </div>

        <div className="apple-glass-card rounded-2xl p-5 border border-black/[0.06] bg-white/70 backdrop-blur-xl space-y-2">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-700 font-bold text-xs font-mono mb-2">
            03
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 font-mono">
            Paste 1-Line Embed
          </span>
          <h3 className="text-sm font-bold text-zinc-950">
            Instant Automatic Sync
          </h3>
          <p className="text-xs text-zinc-500 leading-relaxed">
            Paste one script tag into your website. Every time you approve a new review in Panda Praise, your website updates instantly.
          </p>
        </div>
      </section>

      {/* ── Apple Bento Showcase: The 4 Core Flagship Widget Formats ── */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-zinc-950 tracking-tight font-display">
            Flagship Widget Formats
          </h2>
          <span className="text-xs text-zinc-400">
            Click any format to customize and generate embed code
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
          
          {/* Format 1: Wall of Love */}
          <div className="apple-glass-card rounded-2xl p-5 sm:p-6 border border-black/[0.06] bg-white/80 backdrop-blur-xl shadow-xs hover:shadow-md transition-all flex flex-col justify-between group">
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                  <Heart className="w-3 h-3 text-rose-500 fill-rose-500" />
                  Most Popular • Full Page Proof
                </span>
                <span className="text-[10px] font-mono text-zinc-400">Masonry Grid</span>
              </div>

              <h3 className="text-base font-bold text-zinc-950">
                Wall of Love (Masonry Grid)
              </h3>
              <p className="text-xs text-zinc-500 leading-relaxed mt-1 mb-4">
                A rich, responsive masonry grid displaying all your approved reviews with photo avatars, verified badges, and 5-star ratings. Perfect for dedicated testimonials pages.
              </p>

              {/* Realistic Micro-Preview */}
              <div className="p-3.5 rounded-xl bg-zinc-50/90 border border-black/[0.04] grid grid-cols-2 gap-2 mb-5">
                <div className="p-2.5 rounded-lg bg-white border border-black/[0.06] shadow-2xs space-y-1">
                  <div className="flex items-center gap-1.5">
                    <div className="w-4 h-4 rounded-full bg-violet-600 text-white text-[8px] font-bold flex items-center justify-center">S</div>
                    <span className="text-[10px] font-bold text-zinc-800">Sarah K.</span>
                    <span className="text-[9px] text-amber-500">★★★★★</span>
                  </div>
                  <p className="text-[9px] text-zinc-500 line-clamp-2 italic">"Increased our conversions by 40% in just two weeks!"</p>
                </div>
                <div className="p-2.5 rounded-lg bg-white border border-black/[0.06] shadow-2xs space-y-1">
                  <div className="flex items-center gap-1.5">
                    <div className="w-4 h-4 rounded-full bg-emerald-600 text-white text-[8px] font-bold flex items-center justify-center">D</div>
                    <span className="text-[10px] font-bold text-zinc-800">David M.</span>
                    <span className="text-[9px] text-amber-500">★★★★★</span>
                  </div>
                  <p className="text-[9px] text-zinc-500 line-clamp-2 italic">"Setup took less than 2 minutes. Outstanding product."</p>
                </div>
              </div>
            </div>

            <button
              onClick={onOpenWallOfLove || onOpenWidgetCreator}
              className="apple-touch w-full flex items-center justify-between px-4 py-2.5 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-semibold shadow-xs transition-all cursor-pointer"
            >
              <span>Launch Wall of Love Creator</span>
              <ArrowRight className="w-3.5 h-3.5 text-zinc-400 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>

          {/* Format 2: Social Proof Toast */}
          <div className="apple-glass-card rounded-2xl p-5 sm:p-6 border border-black/[0.06] bg-white/80 backdrop-blur-xl shadow-xs hover:shadow-md transition-all flex flex-col justify-between group">
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-violet-50 text-violet-700 border border-violet-200">
                  <MessageSquareQuote className="w-3 h-3 text-violet-600" />
                  High Conversion • Real-Time
                </span>
                <span className="text-[10px] font-mono text-zinc-400">Floating Popup</span>
              </div>

              <h3 className="text-base font-bold text-zinc-950">
                Floating Social Proof Toast
              </h3>
              <p className="text-xs text-zinc-500 leading-relaxed mt-1 mb-4">
                Subtle, non-intrusive notification bubbles that pop up in the bottom corner of your website, showing genuine purchases and recent 5-star reviews to browse visitors.
              </p>

              {/* Realistic Micro-Preview */}
              <div className="p-3.5 rounded-xl bg-zinc-50/90 border border-black/[0.04] flex items-center justify-center mb-5">
                <div className="w-full max-w-xs p-2.5 rounded-xl bg-white border border-black/[0.08] shadow-sm flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-emerald-500/10 text-emerald-700 flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-zinc-900 truncate">Alex Rivera</span>
                      <span className="text-[9px] text-zinc-400">2m ago</span>
                    </div>
                    <p className="text-[9px] text-zinc-500 truncate">Verified customer left a 5★ review</p>
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={onOpenWidgetCreator}
              className="apple-touch w-full flex items-center justify-between px-4 py-2.5 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-semibold shadow-xs transition-all cursor-pointer"
            >
              <span>Launch Toast Popup Creator</span>
              <ArrowRight className="w-3.5 h-3.5 text-zinc-400 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>

          {/* Format 3: Infinite Marquee Carousel */}
          <div className="apple-glass-card rounded-2xl p-5 sm:p-6 border border-black/[0.06] bg-white/80 backdrop-blur-xl shadow-xs hover:shadow-md transition-all flex flex-col justify-between group">
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                  <Layers className="w-3 h-3 text-blue-600" />
                  Homepage Hero • Continuous Ribbon
                </span>
                <span className="text-[10px] font-mono text-zinc-400">Smooth Loop</span>
              </div>

              <h3 className="text-base font-bold text-zinc-950">
                Infinite Marquee Carousel
              </h3>
              <p className="text-xs text-zinc-500 leading-relaxed mt-1 mb-4">
                A smooth, continuously scrolling ribbon of testimonials. Designed to sit directly below hero headlines or brand logos to give visitors instant proof without clicking.
              </p>

              {/* Realistic Micro-Preview */}
              <div className="p-3.5 rounded-xl bg-zinc-50/90 border border-black/[0.04] overflow-hidden mb-5">
                <div className="flex items-center gap-2 text-xs">
                  <div className="px-3 py-1.5 rounded-lg bg-white border border-black/[0.06] shadow-2xs whitespace-nowrap text-[10px] font-medium flex items-center gap-1.5">
                    <span className="text-amber-500">★★★★★</span>
                    <span>"Super clean UX!" — <strong>Mark T.</strong></span>
                  </div>
                  <div className="px-3 py-1.5 rounded-lg bg-white border border-black/[0.06] shadow-2xs whitespace-nowrap text-[10px] font-medium flex items-center gap-1.5">
                    <span className="text-amber-500">★★★★★</span>
                    <span>"Helped close our deals." — <strong>Lisa R.</strong></span>
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={onOpenSocialCard || onOpenWidgetCreator}
              className="apple-touch w-full flex items-center justify-between px-4 py-2.5 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-semibold shadow-xs transition-all cursor-pointer"
            >
              <span>Launch Carousel Creator</span>
              <ArrowRight className="w-3.5 h-3.5 text-zinc-400 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>

          {/* Format 4: Trust Badge & Micro-Embed */}
          <div className="apple-glass-card rounded-2xl p-5 sm:p-6 border border-black/[0.06] bg-white/80 backdrop-blur-xl shadow-xs hover:shadow-md transition-all flex flex-col justify-between group">
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                  <Award className="w-3 h-3 text-amber-600" />
                  Footer & Checkout Conversion
                </span>
                <span className="text-[10px] font-mono text-zinc-400">Micro Chip</span>
              </div>

              <h3 className="text-base font-bold text-zinc-950">
                Panda Trust Badge
              </h3>
              <p className="text-xs text-zinc-500 leading-relaxed mt-1 mb-4">
                A compact, verifiable rating badge designed for checkout forms, call-to-action buttons, and website footers. Displays real-time average rating and verified review count.
              </p>

              {/* Realistic Micro-Preview */}
              <div className="p-3.5 rounded-xl bg-zinc-50/90 border border-black/[0.04] flex items-center justify-center mb-5">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-black/[0.08] shadow-xs">
                  <div className="flex items-center text-amber-400 text-xs">
                    ★★★★★
                  </div>
                  <span className="text-[11px] font-bold text-zinc-900">5.0 Rating</span>
                  <span className="text-[10px] text-zinc-400">• Verified by Panda Praise</span>
                </div>
              </div>
            </div>

            <button
              onClick={onOpenWidgetCreator}
              className="apple-touch w-full flex items-center justify-between px-4 py-2.5 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-semibold shadow-xs transition-all cursor-pointer"
            >
              <span>Launch Badge Creator</span>
              <ArrowRight className="w-3.5 h-3.5 text-zinc-400 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>

        </div>
      </section>

      {/* ── Universal Quick Embed Dock (Clean Spatial Utility) ── */}
      <section className="apple-glass-card rounded-2xl p-4 sm:p-5 border border-black/[0.06] bg-white/80 backdrop-blur-xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-700 shrink-0">
            <Code2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-bold text-zinc-950">
              Universal Embed Script (Compatible with All Sites)
            </p>
            <p className="text-[11px] font-mono text-zinc-500 truncate max-w-xs sm:max-w-md">
              {sampleEmbedScript}
            </p>
          </div>
        </div>

        <button
          onClick={handleCopyScript}
          className="apple-touch px-3.5 py-2 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-semibold shadow-xs transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
        >
          {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-zinc-400" />}
          <span>{copiedCode ? 'Copied 1-Line Code' : 'Copy Embed Code'}</span>
        </button>
      </section>

    </div>
  );
};

export default StudioView;
