import React, { useState } from 'react';
import { generateMetaAdVariations } from '../adGenerator';
import { MetaAdCreative } from '../types';

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

  const handleGenerateAds = () => {
    setIsGenerating(true);
    try {
      const generated = generateMetaAdVariations({
        id: 'rev-sample-1',
        originalText: sampleReviewText,
        cleanedText: sampleReviewText,
        author: customerName,
        rating: 5,
        intentScore: 92,
        intentCategory: 'quality',
        isCodMentioned: sampleReviewText.toLowerCase().includes('cod'),
        isDeliveryMentioned: sampleReviewText.toLowerCase().includes('delivery') || sampleReviewText.toLowerCase().includes('fast'),
        extractedKeywords: ['fabric quality', 'premium cotton', 'fast delivery']
      }, productTitle);

      setAdCreatives(generated);
    } catch (err) {
      console.error('Failed to generate ad variations:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyAd = (ad: MetaAdCreative) => {
    const headline = ad.hook?.headline || ad.hooks?.[0]?.hookText || '';
    const fullText = `[HOOK: ${headline}]\n\n${ad.primaryText}\n\nCTA: ${ad.ctaButton}`;
    navigator.clipboard.writeText(fullText);
    setCopiedId(ad.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <span className="inline-block px-3 py-1 bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 text-xs font-semibold rounded-full mb-2">
              Meta Ads Studio AI
            </span>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              Review-to-Meta-Ad Creative Generator
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Transforming review for <span className="font-semibold text-emerald-600">"{productTitle}"</span> by {customerName}
            </p>
          </div>

          <button
            onClick={handleGenerateAds}
            disabled={isGenerating}
            className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold text-sm rounded-xl shadow-md disabled:opacity-50 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            {isGenerating ? 'Generating Creatives...' : '⚡ Generate 3 Meta Ad Variations'}
          </button>
        </div>

        <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-800 text-sm text-gray-700 dark:text-gray-300 italic">
          "{sampleReviewText}"
        </div>
      </div>

      {adCreatives.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {adCreatives.map((ad, idx) => (
            <div 
              key={ad.id}
              className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 shadow-sm flex flex-col justify-between relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 bg-emerald-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl uppercase tracking-wider">
                Variation {idx + 1} ({ad.format?.toUpperCase() || '9:16'})
              </div>

              <div className="space-y-4 pt-2">
                <div>
                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Pattern Hook</span>
                  <p className="text-sm font-bold text-gray-900 dark:text-white mt-0.5">
                    "{ad.hook?.headline || ad.hooks?.[0]?.hookText}"
                  </p>
                </div>

                <div>
                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Primary Ad Copy</span>
                  <p className="text-xs text-gray-600 dark:text-gray-300 mt-1 whitespace-pre-line bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg border border-gray-100 dark:border-gray-800">
                    {ad.primaryText}
                  </p>
                </div>

                <div className="flex items-center justify-between text-xs pt-2 border-t border-gray-100 dark:border-gray-800">
                  <span className="text-gray-500">CTA Button:</span>
                  <span className="font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 px-2.5 py-1 rounded-md">
                    {ad.ctaButton}
                  </span>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-800">
                <button
                  onClick={() => handleCopyAd(ad)}
                  className="w-full py-2.5 px-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-semibold text-xs rounded-xl hover:opacity-90 transition-opacity flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  {copiedId === ad.id ? '✓ Copied to Clipboard!' : 'Copy Ad Bundle 📋'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
