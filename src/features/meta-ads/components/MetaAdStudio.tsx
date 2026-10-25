import React, { useState } from 'react';
import { parseReviewInput } from '../../reviews/reviewParser';
import { generateMetaAdVariations } from '../adGenerator';
import { MetaAdCreative } from '../types';
import { AdCanvasRenderer } from './AdCanvasRenderer';
import { CampaignDeployCard } from './CampaignDeployCard';
import { summarizeMerchantAnalytics } from '../../analytics/roasTracker';
import { Sparkles, TrendingUp, Copy, Check, Send } from 'lucide-react';

interface MetaAdStudioProps {
  sampleReviewText?: string;
  customerName?: string;
  productTitle?: string;
}

export const MetaAdStudio: React.FC<MetaAdStudioProps> = ({
  sampleReviewText = "Ordered COD for my mom in Delhi, delivery was super fast and fabric quality is premium cotton. She loved it!",
  customerName = "Priya S.",
  productTitle = "Handloom Cotton Kurti"
}) => {
  const [adCreatives, setAdCreatives] = useState<MetaAdCreative[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [deployingAdId, setDeployingAdId] = useState<string | null>(null);

  const analyticsSummary = summarizeMerchantAnalytics([
    {
      adId: 'sample-ad-1',
      reviewId: 'rev-sample-1',
      productTitle: productTitle,
      impressions: 14200,
      clicks: 432,
      ordersCount: 38,
      totalRevenueInr: 75620,
      adSpendInr: 13500,
    },
    {
      adId: 'sample-ad-2',
      reviewId: 'rev-sample-2',
      productTitle: 'Handcrafted Kolhapuri Loafers',
      impressions: 18900,
      clicks: 567,
      ordersCount: 44,
      totalRevenueInr: 105600,
      adSpendInr: 18800,
    },
  ]);

  const handleGenerateAds = () => {
    setIsGenerating(true);
    try {
      const parsedReview = parseReviewInput({
        id: 'rev-sample-1',
        body: sampleReviewText,
        author: customerName,
        productTitle: productTitle,
        rating: 5,
      });

      const generated = generateMetaAdVariations(parsedReview, productTitle);
      setAdCreatives(generated);
    } catch (err) {
      console.error('Failed to generate ad variations:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyAd = (ad: MetaAdCreative) => {
    const headline = ad.hook?.headline || ad.headline || '';
    const fullText = `[HOOK: ${headline}]\n\n${ad.primaryText}\n\nCTA: ${ad.ctaButton}`;
    navigator.clipboard.writeText(fullText);
    setCopiedId(ad.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-8">
      {/* Top Studio Hero & Live ROAS Command Bar */}
      <div className="relative overflow-hidden rounded-3xl border border-gray-800 bg-gradient-to-b from-gray-900/90 via-gray-950/80 to-gray-950 p-6 md:p-10 shadow-2xl backdrop-blur-2xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8">
          <div className="space-y-2 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                Meta Ads Studio AI
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-300 text-xs font-bold font-mono">
                <TrendingUp className="w-3.5 h-3.5 text-teal-400" />
                Live Attribution: {analyticsSummary.overallRoas} ROAS
              </span>
            </div>

            <h3 className="text-2xl md:text-4xl font-black text-white tracking-tight">
              Review-to-Meta-Ad Creative Generator
            </h3>

            <p className="text-sm md:text-base text-gray-400 leading-relaxed">
              Transforming review for <span className="font-semibold text-emerald-400">"{productTitle}"</span> by <span className="text-white font-semibold">{customerName}</span> into high-converting creatives for Indian D2C shoppers.
            </p>
          </div>

          <button
            onClick={handleGenerateAds}
            disabled={isGenerating}
            className="px-7 py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 active:scale-95 text-white font-black text-xs uppercase tracking-wider rounded-2xl shadow-xl shadow-emerald-950/40 transition-all flex items-center justify-center gap-2.5 disabled:opacity-50 cursor-pointer shrink-0"
          >
            {isGenerating ? 'Synthesizing Creatives...' : '⚡ Generate 3 Meta Ad Variations'}
          </button>
        </div>

        {/* Live Performance Ticker Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-4 rounded-2xl bg-gray-950/80 border border-gray-800/80 mb-6">
          <div className="space-y-0.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Total Attributed Revenue</span>
            <p className="text-lg md:text-xl font-black text-white font-mono">{analyticsSummary.revenueFormatted}</p>
          </div>
          <div className="space-y-0.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Blended UGC ROAS</span>
            <p className="text-lg md:text-xl font-black text-emerald-400 font-mono">{analyticsSummary.overallRoas}</p>
          </div>
          <div className="space-y-0.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Attributed Orders</span>
            <p className="text-lg md:text-xl font-black text-teal-300 font-mono">{analyticsSummary.orders} Orders</p>
          </div>
          <div className="space-y-0.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Est. Average CTR</span>
            <p className="text-lg md:text-xl font-black text-amber-400 font-mono">3.04%</p>
          </div>
        </div>

        {/* Active Customer Review In-Focus Pill */}
        <div className="p-4 rounded-2xl bg-gray-900/50 border border-gray-800/80 flex items-start gap-3">
          <span className="text-xl">💬</span>
          <div className="space-y-1">
            <p className="text-xs md:text-sm text-gray-200 font-medium italic">
              "{sampleReviewText}"
            </p>
            <p className="text-[11px] text-gray-400 font-semibold">
              — <span className="text-white">{customerName}</span> for <span className="text-emerald-400 font-bold">{productTitle}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Generated 3 Variations Deck */}
      {adCreatives.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {adCreatives.map((ad, idx) => (
            <div 
              key={ad.id}
              className="group relative overflow-hidden rounded-3xl border border-gray-800 bg-gradient-to-b from-gray-900/90 via-gray-950/80 to-gray-950 p-6 shadow-2xl backdrop-blur-2xl hover:border-emerald-500/50 hover:shadow-2xl hover:shadow-emerald-950/20 transition-all duration-300 flex flex-col justify-between space-y-6"
            >
              {/* Header Badges */}
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-black tracking-wider uppercase">
                  Variation {idx + 1} ({ad.format})
                </span>
                <span className="text-[11px] font-mono text-gray-400 bg-gray-900 px-2.5 py-0.5 rounded-md border border-gray-800">
                  {ad.templateStyle?.replace(/_/g, ' ')}
                </span>
              </div>

              {/* HTML5 Canvas Visual Ad Renderer */}
              <div className="rounded-2xl overflow-hidden border border-gray-800/80 bg-gray-950 p-1">
                <AdCanvasRenderer ad={ad} reviewQuote={sampleReviewText} />
              </div>

              {/* Ad Copy Stack */}
              <div className="space-y-4">
                {/* Pattern Interrupt Hook */}
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 block mb-1">
                    Pattern Hook
                  </span>
                  <p className="text-sm font-black text-white leading-snug">
                    "{ad.hook?.headline || ad.headline}"
                  </p>
                  {ad.hook?.subheadline && (
                    <p className="text-xs text-gray-400 mt-1">
                      {ad.hook.subheadline}
                    </p>
                  )}
                </div>

                {/* Primary Text Copy Box */}
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-gray-400 block mb-1">
                    Primary Ad Copy
                  </span>
                  <div className="p-3.5 rounded-xl border border-gray-800/80 bg-gray-950/90 text-xs text-gray-300 whitespace-pre-line font-mono max-h-40 overflow-y-auto leading-relaxed shadow-inner">
                    {ad.primaryText}
                  </div>
                </div>

                {/* CTA & Trust Strip */}
                <div className="flex items-center justify-between text-xs pt-2 border-t border-gray-800/80">
                  <span className="text-gray-400 font-medium">CTA Button:</span>
                  <span className="font-black text-emerald-300 bg-emerald-950/80 border border-emerald-800/60 px-3 py-1 rounded-lg">
                    {ad.ctaButton}
                  </span>
                </div>
              </div>

              {/* Action Buttons Deck */}
              <div className="space-y-2.5 pt-2 border-t border-gray-800/80">
                <button
                  onClick={() => handleCopyAd(ad)}
                  className="w-full py-2.5 px-4 bg-gray-800 hover:bg-gray-700 active:scale-98 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                >
                  {copiedId === ad.id ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Copied to Clipboard!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Ad Bundle 📋</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => setDeployingAdId(deployingAdId === ad.id ? null : ad.id)}
                  className="w-full py-2.5 px-4 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 hover:from-emerald-500/20 hover:to-teal-500/20 active:scale-98 text-emerald-300 border border-emerald-500/30 hover:border-emerald-500/60 font-bold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{deployingAdId === ad.id ? 'Hide Deploy Drawer' : '🚀 Push to Meta Ads Manager'}</span>
                </button>

                {deployingAdId === ad.id && (
                  <div className="pt-2 animate-fade-in">
                    <CampaignDeployCard
                      ad={ad}
                      shopDomain="store.myshopify.com"
                      productUrl="https://store.in/products/bestseller"
                    />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
