import React, { useState } from 'react';
import { Star, Copy, Check, Code } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';

export const RichSnippetView: React.FC = () => {
  const { project } = useAuth();
  const [copied, setCopied] = useState(false);

  const jsonLdCode = `<script type="application/ld+json">
{
  "@context": "https://schema.org/",
  "@type": "Product",
  "name": "${project?.name || 'My Product'}",
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.9",
    "reviewCount": "128",
    "bestRating": "5",
    "worstRating": "1"
  }
}
</script>`;

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonLdCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 space-y-8 font-sans">
      
      {/* Header (Matches Senja 03:55) */}
      <div className="space-y-1 pb-2 border-b border-gray-100">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight font-display">
          Add star ratings to your search results
        </h1>
        <p className="text-xs text-gray-500">
          Rich snippets help you improve your SEO and increase your click-through rate by adding star ratings to your search results.
        </p>
      </div>

      {/* Google Search Result Mock (Matches Senja 03:55) */}
      <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-4 max-w-2xl">
        <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Google SERP Preview</span>

        <div className="space-y-1.5 p-4 rounded-2xl bg-gray-50 border border-gray-100">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span className="w-4 h-4 rounded-full bg-purple-100 text-[#6701e6] flex items-center justify-center font-bold text-[10px]">P</span>
            <span className="truncate">{project?.websiteUrl || 'https://mywebsite.com'}</span>
          </div>

          <h3 className="text-base font-semibold text-blue-800 hover:underline cursor-pointer">
            {project?.name || 'My Product'} — Customer Reviews & Testimonials
          </h3>

          <div className="flex items-center gap-2 text-xs">
            <div className="flex items-center gap-0.5 text-amber-500">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              ))}
            </div>
            <span className="font-bold text-gray-800">Rating: 4.9</span>
            <span className="text-gray-400">• ‎128 reviews</span>
          </div>

          <p className="text-xs text-gray-600 line-clamp-2">
            Verified customer testimonials and ratings for {project?.name || 'our service'}. See why hundreds of teams rely on us every day.
          </p>
        </div>
      </div>

      {/* Explanation & Schema.org JSON-LD snippet */}
      <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-xs space-y-4 max-w-2xl">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
            <Code className="w-4 h-4 text-[#6701e6]" />
            <span>Schema.org JSON-LD Embed Code</span>
          </span>

          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-50 hover:bg-purple-100 text-[#6701e6] border border-purple-200 text-xs font-semibold transition-colors cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied code!' : 'Copy snippet'}</span>
          </button>
        </div>

        <pre className="p-4 rounded-xl bg-gray-900 text-purple-200 text-xs font-mono overflow-x-auto">
          {jsonLdCode}
        </pre>

        <ul className="text-xs text-gray-500 space-y-1 list-disc list-inside pt-1">
          <li>It takes anywhere between 2-8 weeks for Google to index rich snippets.</li>
          <li>Google chooses which searches to display rich snippets for, so we can't guarantee that they'll appear.</li>
          <li>You can increase the likelihood of rich snippets being displayed by keeping testimonials fresh.</li>
        </ul>
      </div>

    </div>
  );
};
