import React, { useState } from 'react';
import { parseReviewInput } from '../reviewParser';
import { filterAndRankReviews } from '../intentFilter';
import { ParsedHighIntentReview } from '../types';

export interface ReviewImportStudioProps {
  onSelectReview?: (review: ParsedHighIntentReview) => void;
}

export const ReviewImportStudio: React.FC<ReviewImportStudioProps> = ({ onSelectReview }) => {
  const [rawInput, setRawInput] = useState('');
  const [processedReviews, setProcessedReviews] = useState<ParsedHighIntentReview[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleAnalyze = () => {
    if (!rawInput.trim()) return;
    setIsAnalyzing(true);

    try {
      // Split input by lines or double newlines to simulate bulk review import
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

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
          Paste Customer Reviews / WhatsApp Feedback
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Drop raw customer text below. Our AI parser extracts pain points, transformation stories, and intent scores to turn them into Meta Ad scripts.
        </p>

        <textarea
          rows={5}
          value={rawInput}
          onChange={(e) => setRawInput(e.target.value)}
          placeholder={`"Ordered COD for my mom in Delhi, delivery was super fast and fabric quality is premium cotton. She loved it!"\n\n"Best skincare serum I've used. Reduced acne marks in 7 days."`}
          className="w-full p-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-emerald-500 focus:border-emerald-500 mb-4 font-mono"
        />

        <div className="flex justify-end">
          <button
            onClick={handleAnalyze}
            disabled={isAnalyzing || !rawInput.trim()}
            className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm rounded-xl shadow-sm disabled:opacity-50 transition-colors"
          >
            {isAnalyzing ? 'Analyzing Intent...' : 'Extract & Score Reviews'}
          </button>
        </div>
      </div>

      {processedReviews.length > 0 && (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm">
          <h4 className="text-md font-bold text-gray-900 dark:text-white mb-4">
            High-Intent Ad Candidates ({processedReviews.length})
          </h4>

          <div className="space-y-4">
            {processedReviews.map((rev) => (
              <div 
                key={rev.id} 
                className="p-4 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 uppercase">
                      {rev.intentCategory}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      Intent Score: <strong className="text-emerald-600">{rev.intentScore}/100</strong>
                    </span>
                    {rev.isCodMentioned && (
                      <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-medium">
                        COD Verified
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-800 dark:text-gray-200 italic">
                    "{rev.cleanedText}"
                  </p>
                </div>

                <button
                  onClick={() => {
                    if (onSelectReview) {
                      onSelectReview(rev);
                    } else {
                      alert(`Ready to generate Meta Ad creative for review: "${rev.cleanedText.substring(0, 30)}..."`);
                    }
                  }}
                  className="px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-xs font-semibold rounded-lg hover:opacity-90 transition-opacity self-start md:self-center cursor-pointer"
                >
                  Generate Meta Ad ⚡
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
