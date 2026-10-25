import React, { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, 
  Play, 
  Pause, 
  Copy, 
  Check, 
  Download, 
  ShoppingBag, 
  Smartphone, 
  Square, 
  Tv, 
  TrendingUp,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { ParsedHighIntentReview } from '../../reviews/types';
import { generateMetaAdCreative } from '../adGenerator';
import { MetaAdCreative, MetaAdFormat } from '../types';


export interface MetaAdGeneratorStudioProps {
  selectedReview?: ParsedHighIntentReview | null;
  brandName?: string;
  onAdSaved?: (ad: MetaAdCreative) => void;
}

const DEFAULT_SAMPLE_REVIEW: ParsedHighIntentReview = {
  id: 'sample_kurta_1',
  rawReviewId: 'raw_sample_1',
  authorName: 'Ananya Sharma',
  authorCity: 'Bengaluru',
  productTitle: 'Handloom Lavender Kurta Set',
  originalBody: 'I was hesitant about buying from an Instagram ad, but the fabric is breathable pure cotton, deep pockets are a lifesaver, and everyone in office asked where I got it. Delivered COD in 3 days!',
  cleanedText: 'I was hesitant about buying from an Instagram ad, but the fabric is breathable pure cotton, deep pockets are a lifesaver, and everyone in office asked where I got it. Delivered COD in 3 days!',
  intentCategory: 'Skeptic Converted',
  isCodMentioned: true,
  mediaType: 'video',
  mediaUrl: '/demo_meta_ad.mp4',
  intentScore: 94,
  categories: ['skeptic_converted', 'social_compliments', 'feature_delight'],
  extractedKeyPhrase: 'deep pockets are a lifesaver and everyone in office asked where I got it',
  suggestedAdAngles: ['Skeptic to Believer', 'Social Proof & Compliment Magnet'],
  isEligibleForMetaAd: true,
};

export const MetaAdGeneratorStudio: React.FC<MetaAdGeneratorStudioProps> = ({
  selectedReview,
  brandName: defaultBrand = 'Aesthetic D2C Apparel',
  onAdSaved,
}) => {
  const [brandName, setBrandName] = useState(defaultBrand);
  const activeReview = selectedReview || DEFAULT_SAMPLE_REVIEW;
  
  const [creative, setCreative] = useState<MetaAdCreative>(() => 
    generateMetaAdCreative(activeReview, defaultBrand)
  );

  const [activeFormat, setActiveFormat] = useState<MetaAdFormat>('9:16');
  const [selectedHookIndex, setSelectedHookIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [isPushedToShopify, setIsPushedToShopify] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);

  // Re-generate ad creative when review or brand name changes
  useEffect(() => {
    const updated = generateMetaAdCreative(activeReview, brandName);
    setCreative(updated);
    setIsSaved(false);
    setIsPushedToShopify(false);
  }, [activeReview, brandName]);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleSaveToLibrary = () => {
    setIsSaved(true);
    if (onAdSaved) onAdSaved(creative);
    
    // Persist to local storage for MetaAdsLibraryPage
    try {
      const existing = JSON.parse(localStorage.getItem('pandapraise_v2_custom_ads') || '[]');
      const newAdItem = {
        id: creative.id,
        customerName: creative.customerName,
        productName: creative.productName,
        hookText: creative.hooks[selectedHookIndex]?.hookText || creative.hooks[0].hookText,
        videoUrl: creative.videoUrl || '/demo_meta_ad.mp4',
        ctr: creative.metricsEstimate.estCtr,
        ratios: ['9:16', '1:1', '4:5'],
        createdAt: 'Just now',
      };
      localStorage.setItem('pandapraise_v2_custom_ads', JSON.stringify([newAdItem, ...existing]));
    } catch (e) {
      console.error('Error saving ad to localStorage:', e);
    }
  };

  const currentHook = creative.hooks[selectedHookIndex] || creative.hooks[0];

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 lg:p-8 shadow-sm space-y-8">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center gap-1.5 border border-emerald-500/20">
              <Sparkles className="w-3.5 h-3.5" />
              Meta Ads Creative Engine
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Targeted for Indian D2C Shopify Brands
            </span>
          </div>
          <h2 className="text-2xl font-black text-slate-950 dark:text-white tracking-tight">
            Review-to-Meta-Ad Studio
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Transform customer testimony from <span className="font-semibold text-slate-900 dark:text-slate-200">{activeReview.authorName}</span> into a high-converting Meta UGC Ad.
          </p>
        </div>

        {/* Brand Name Input Pill */}
        <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/80 p-2 rounded-2xl border border-slate-200 dark:border-slate-700">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 pl-2">Brand:</span>
          <input
            type="text"
            value={brandName}
            onChange={(e) => setBrandName(e.target.value)}
            className="text-xs font-bold text-slate-900 dark:text-white bg-transparent outline-none w-44"
            placeholder="Store Name"
          />
        </div>
      </div>

      {/* Main Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Visual Video Layout & Hook Overlay (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Format Selector Tabs */}
          <div className="flex items-center justify-between bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl">
            <button
              type="button"
              onClick={() => setActiveFormat('9:16')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition ${
                activeFormat === '9:16'
                  ? 'bg-white dark:bg-slate-900 text-slate-950 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              9:16 Reels
            </button>
            <button
              type="button"
              onClick={() => setActiveFormat('1:1')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition ${
                activeFormat === '1:1'
                  ? 'bg-white dark:bg-slate-900 text-slate-950 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Square className="w-3.5 h-3.5" />
              1:1 Feed
            </button>
            <button
              type="button"
              onClick={() => setActiveFormat('4:5')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition ${
                activeFormat === '4:5'
                  ? 'bg-white dark:bg-slate-900 text-slate-950 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Tv className="w-3.5 h-3.5" />
              4:5 Catalog
            </button>
          </div>

          {/* Video Preview Box */}
          <div className="relative rounded-3xl overflow-hidden bg-black border border-slate-800 shadow-xl flex items-center justify-center">
            <div
              className={`relative w-full transition-all flex items-center justify-center ${
                activeFormat === '9:16'
                  ? 'aspect-[9/16] max-h-[520px]'
                  : activeFormat === '1:1'
                  ? 'aspect-square max-h-[440px]'
                  : 'aspect-[4/5] max-h-[480px]'
              }`}
            >
              <video
                ref={videoRef}
                src={creative.videoUrl || '/demo_meta_ad.mp4'}
                loop
                muted
                playsInline
                className="w-full h-full object-cover"
              />

              {/* Top Viral Hook Overlay (Burned Badge Style) */}
              <div className="absolute top-4 left-3.5 right-3.5 pointer-events-none z-10 animate-fade-in">
                <div className="bg-black/85 backdrop-blur-md border border-emerald-500/40 rounded-2xl p-3 shadow-2xl">
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 flex items-center gap-1">
                      <Zap className="w-3 h-3 fill-emerald-400" />
                      {currentHook.label}
                    </span>
                    <span className="text-[9px] font-bold text-slate-400 bg-white/10 px-1.5 py-0.5 rounded">
                      0:00 - 0:0{currentHook.onScreenDurationSec}s
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm font-extrabold text-white leading-snug drop-shadow-sm">
                    "{currentHook.hookText}"
                  </p>
                </div>
              </div>

              {/* Bottom Indian D2C Trust Banner Overlay */}
              <div className="absolute bottom-3 left-3 right-3 pointer-events-none z-10">
                <div className="bg-slate-950/90 backdrop-blur-md border border-white/10 rounded-xl p-2.5 flex items-center justify-between shadow-lg">
                  <div className="space-y-0.5">
                    <p className="text-[11px] font-bold text-white leading-tight">
                      {creative.productName}
                    </p>
                    <p className="text-[9px] text-emerald-400 font-semibold flex items-center gap-1">
                      <ShieldCheck className="w-2.5 h-2.5" />
                      COD Available • 7-Day Exchange
                    </p>
                  </div>
                  <div className="px-2.5 py-1 rounded-lg bg-emerald-500 text-slate-950 font-black text-[10px] tracking-tight uppercase">
                    Shop Now
                  </div>
                </div>
              </div>

              {/* Center Play / Pause Floating Toggle */}
              <button
                type="button"
                onClick={togglePlay}
                className="absolute inset-0 m-auto w-14 h-14 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-md border border-white/20 text-white flex items-center justify-center transition shadow-2xl active:scale-90"
              >
                {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-1" />}
              </button>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 gap-3 p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-800 text-center">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 block">Est. Meta CTR</span>
              <span className="text-sm font-black text-emerald-600 dark:text-emerald-400 flex items-center justify-center gap-1">
                <TrendingUp className="w-3.5 h-3.5" />
                {creative.metricsEstimate.estCtr}
              </span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 block">Target UGC ROAS</span>
              <span className="text-sm font-black text-slate-900 dark:text-white">
                {creative.metricsEstimate.targetRoas}
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Viral Hook Selector & Meta Copy Deck (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Hook Angles Deck */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-500" />
                Select High-Converting D2C Hook (3-Sec Burn)
              </label>
              <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                AI Tuned for Indian Shoppers
              </span>
            </div>

            <div className="grid grid-cols-1 gap-2.5">
              {creative.hooks.map((hook, index) => {
                const isSelected = selectedHookIndex === index;
                return (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setSelectedHookIndex(index)}
                    className={`text-left p-3.5 rounded-2xl border transition flex items-start justify-between gap-3 ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20 shadow-xs ring-1 ring-emerald-500/50'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900'
                    }`}
                  >
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 block">
                        {hook.label}
                      </span>
                      <p className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white">
                        "{hook.hookText}"
                      </p>
                    </div>
                    {isSelected ? (
                      <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-3 h-3" />
                      </span>
                    ) : (
                      <span className="w-5 h-5 rounded-full border border-slate-300 dark:border-slate-700 shrink-0 mt-0.5" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Meta Direct-Response Ad Copy Deck */}
          <div className="space-y-4 bg-slate-50 dark:bg-slate-800/40 p-5 rounded-3xl border border-slate-200 dark:border-slate-800">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center justify-between">
              <span>Meta Ads Manager Copy Pack</span>
              <span className="text-[11px] text-slate-500 font-normal">Click to copy field</span>
            </h3>

            {/* Primary Text */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">Primary Text</label>
                <button
                  type="button"
                  onClick={() => copyToClipboard(creative.copy.primaryText, 'primary')}
                  className="text-[11px] font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
                >
                  {copiedField === 'primary' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  {copiedField === 'primary' ? 'Copied' : 'Copy'}
                </button>
              </div>
              <textarea
                readOnly
                rows={4}
                value={creative.copy.primaryText}
                className="w-full text-xs font-mono p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none"
              />
            </div>

            {/* Headline */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">Headline</label>
                <button
                  type="button"
                  onClick={() => copyToClipboard(creative.copy.headline, 'headline')}
                  className="text-[11px] font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
                >
                  {copiedField === 'headline' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  {copiedField === 'headline' ? 'Copied' : 'Copy'}
                </button>
              </div>
              <input
                type="text"
                readOnly
                value={creative.copy.headline}
                className="w-full text-xs font-mono p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none"
              />
            </div>

            {/* Call To Action & Trust Badges */}
            <div className="pt-2 border-t border-slate-200 dark:border-slate-700/60 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 flex-wrap">
                {creative.copy.trustBadges.map((badge, idx) => (
                  <span
                    key={idx}
                    className="text-[10px] font-medium bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 px-2 py-0.5 rounded-md"
                  >
                    ✓ {badge}
                  </span>
                ))}
              </div>
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700">
                CTA: {creative.copy.callToAction}
              </span>
            </div>
          </div>

          {/* Action Deck */}
          <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
            <button
              type="button"
              onClick={handleSaveToLibrary}
              disabled={isSaved}
              className={`flex-1 w-full py-3 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-sm ${
                isSaved
                  ? 'bg-emerald-600 text-white cursor-default'
                  : 'bg-slate-950 dark:bg-white text-white dark:text-slate-950 hover:opacity-90'
              }`}
            >
              {isSaved ? <Check className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
              <span>{isSaved ? 'Saved to Meta Ads Library!' : 'Save to Meta Ads Library'}</span>
            </button>

            <a
              href="/demo_meta_ad.mp4"
              download={`${creative.productName.toLowerCase().replace(/\s+/g, '_')}_meta_ad_9x16.mp4`}
              className="w-full sm:w-auto py-3 px-4 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-bold transition flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              <span>Download MP4</span>
            </a>

            <button
              type="button"
              onClick={() => {
                setIsPushedToShopify(true);
                setTimeout(() => setIsPushedToShopify(false), 3000);
              }}
              className="w-full sm:w-auto py-3 px-4 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 text-xs font-bold hover:bg-purple-100 transition flex items-center justify-center gap-2"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>{isPushedToShopify ? 'Pushed to Shopify PDP!' : 'Push to Shopify PDP'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
