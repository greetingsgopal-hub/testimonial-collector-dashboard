import React, { useState } from 'react';
import { parseReviewInput } from '../reviewParser';
import { filterAndRankReviews } from '../intentFilter';
import { ParsedHighIntentReview } from '../types';
import { Sparkles, ArrowRight, ShieldCheck, MapPin, Truck, Zap } from 'lucide-react';

export interface ReviewImportStudioProps {
  onSelectReview?: (review: ParsedHighIntentReview) => void;
}

const SAMPLE_PRESETS = [
  {
    label: 'Pune Cotton Kurti (COD)',
    text: 'Ordered on COD in Pune. The cotton kurti fabric is super soft and delivery took only 2 days! Fitting is flawless.',
  },
  {
    label: 'Jaipur Kolhapuri Loafers',
    text: 'Bought these handcrafted leather loafers for my brother wedding in Jaipur. Complete paisa vasool quality and zero blisters!',
  },
  {
    label: 'Delhi Vitamin C Serum',
    text: 'Delivered in 24 hours to South Delhi. I was skeptical after seeing ads on Instagram, but it cleared my acne pigmentation within a week.',
  },
];

export const ReviewImportStudio: React.FC<ReviewImportStudioProps> = ({ onSelectReview }) => {
  const [rawInput, setRawInput] = useState('');
  const [processedReviews, setProcessedReviews] = useState<ParsedHighIntentReview[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleAnalyze = () => {
    if (!rawInput.trim()) return;
    setIsAnalyzing(true);

    try {
      const items = rawInput.split('\n\n').filter(Boolean);
      const parsed = items.map((item, idx) => parseReviewInput(item, `import-${idx}`));
      const ranked = filterAndRankReviews(parsed);

      setProcessedReviews(ranked);
    } catch (err) {
      console.error('Failed to parse reviews:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSelectPreset = (text: string) => {
    setRawInput(text);
  };

  return (
    <div className="space-y-8">
      {/* Input Glass Card */}
      <div className="relative overflow-hidden rounded-3xl border border-gray-800 bg-gradient-to-b from-gray-900/90 via-gray-950/80 to-gray-950 p-6 md:p-8 shadow-2xl backdrop-blur-2xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                AI Objection & Intent Parser
              </span>
              <span className="text-xs text-gray-400">Judge.me • Loox • WhatsApp • CSV</span>
            </div>
            <h3 className="text-xl md:text-2xl font-black text-white tracking-tight">
              Ingest Reviews & WhatsApp Voice-of-Customer
            </h3>
            <p className="text-xs md:text-sm text-gray-400 mt-1">
              Extract high-converting angles: COD assurance, fabric quality proof, fast delivery to Tier-1/Tier-2 cities, and Paisa-Vasool value.
            </p>
          </div>

          <button
            onClick={handleAnalyze}
            disabled={isAnalyzing || !rawInput.trim()}
            className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 active:scale-95 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-emerald-950/40 transition-all flex items-center justify-center gap-2 disabled:opacity-40 cursor-pointer self-start md:self-center"
          >
            {isAnalyzing ? (
              <span>Scoring Reviews...</span>
            ) : (
              <>
                <span>Extract & Score Intent</span>
                <Zap className="w-4 h-4 fill-white" />
              </>
            )}
          </button>
        </div>

        {/* Quick Click Presets */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">1-Click Presets:</span>
          {SAMPLE_PRESETS.map((preset, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSelectPreset(preset.text)}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-gray-800/80 hover:bg-gray-700/80 text-gray-200 border border-gray-700/60 hover:border-emerald-500/50 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <span>{preset.label}</span>
            </button>
          ))}
        </div>

        {/* Textarea */}
        <div className="relative rounded-2xl border border-gray-800 bg-gray-950/90 focus-within:border-emerald-500/70 focus-within:ring-2 focus-within:ring-emerald-500/20 transition-all">
          <textarea
            rows={5}
            value={rawInput}
            onChange={(e) => setRawInput(e.target.value)}
            placeholder={`Paste customer reviews or WhatsApp chat replies here (separate with double empty lines for bulk import)...\n\nExample:\n"Ordered COD for my mom in Delhi, delivery was super fast and fabric quality is premium cotton. She loved it!"`}
            className="w-full bg-transparent p-4 text-xs md:text-sm text-gray-100 placeholder-gray-500 font-mono focus:outline-none resize-none leading-relaxed"
          />
          <div className="flex items-center justify-between px-4 py-2 bg-gray-900/60 border-t border-gray-800/60 rounded-b-2xl text-[11px] text-gray-500">
            <span>Separated by blank lines</span>
            <span>{rawInput.split('\n\n').filter(Boolean).length} Candidate(s) Detected</span>
          </div>
        </div>
      </div>

      {/* Results Deck */}
      {processedReviews.length > 0 && (
        <div className="relative overflow-hidden rounded-3xl border border-gray-800 bg-gradient-to-b from-gray-900/90 via-gray-950/80 to-gray-950 p-6 md:p-8 shadow-2xl backdrop-blur-2xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-800 pb-4">
            <div>
              <h4 className="text-lg md:text-xl font-black text-white tracking-tight flex items-center gap-2">
                <span>Scored Meta Ad Candidates</span>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold border border-emerald-500/30">
                  {processedReviews.length} Ready
                </span>
              </h4>
              <p className="text-xs text-gray-400 mt-0.5">
                Ranked by conversion potential for Indian Shopify D2C campaigns.
              </p>
            </div>
            <span className="text-xs font-mono text-emerald-400 bg-emerald-950/50 border border-emerald-800/50 px-3 py-1.5 rounded-xl self-start sm:self-auto">
              ✓ Ready for HTML5 Ad Renderer
            </span>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {processedReviews.map((rev) => (
              <div 
                key={rev.id} 
                className="group relative overflow-hidden rounded-2xl border border-gray-800 bg-gradient-to-r from-gray-900/60 via-gray-950/60 to-gray-900/60 hover:border-emerald-500/40 p-5 transition-all duration-300 hover:shadow-xl hover:shadow-emerald-950/20 flex flex-col md:flex-row md:items-center justify-between gap-5"
              >
                <div className="space-y-3 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-extrabold px-3 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 uppercase tracking-wider">
                      {rev.intentCategory.replace('_', ' ')}
                    </span>

                    <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-gray-800 text-gray-300 border border-gray-700">
                      Score: <strong className="text-emerald-400">{rev.intentScore}/100</strong>
                    </span>

                    {rev.buyerCity && rev.buyerCity !== 'India' && (
                      <span className="text-xs font-medium px-2.5 py-1 rounded-lg bg-teal-950/60 text-teal-300 border border-teal-800/60 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-teal-400" />
                        {rev.buyerCity}
                      </span>
                    )}

                    {rev.isCodMentioned && (
                      <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-amber-950/60 text-amber-300 border border-amber-800/60 flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3 text-amber-400" />
                        COD Mentioned
                      </span>
                    )}

                    {rev.isDeliveryMentioned && (
                      <span className="text-xs font-medium px-2.5 py-1 rounded-lg bg-blue-950/60 text-blue-300 border border-blue-800/60 flex items-center gap-1">
                        <Truck className="w-3 h-3 text-blue-400" />
                        Fast Delivery
                      </span>
                    )}
                  </div>

                  <p className="text-sm md:text-base text-gray-200 font-medium italic leading-relaxed">
                    "{rev.cleanedText}"
                  </p>

                  <div className="flex items-center gap-4 text-xs text-gray-400 font-medium">
                    <span>— <strong className="text-gray-200">{rev.author}</strong></span>
                    <span>•</span>
                    <span className="text-emerald-400 font-semibold">{rev.adAngleSuggestion}</span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    if (onSelectReview) {
                      onSelectReview(rev);
                    } else {
                      alert(`Review selected for Meta Ad generation: "${rev.cleanedText.substring(0, 40)}..."`);
                    }
                  }}
                  className="px-5 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 active:scale-95 text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-lg shadow-emerald-950/30 transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer"
                >
                  <span>Build Ad Variations</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
