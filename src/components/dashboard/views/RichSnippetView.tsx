import React, { useState } from 'react';
import { 
  Star, 
  Copy, 
  Check, 
  Code2, 
  Sparkles, 
  ExternalLink, 
  Globe, 
  CheckCircle2,
  HelpCircle,
  Layers,
  Search
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { Review } from '../../../types';

interface RichSnippetViewProps { reviews?: Review[]; }\n\nexport const RichSnippetView: React.FC<RichSnippetViewProps> = ({ reviews = [] }) => {
  const { project, workspace } = useAuth();
  const [copied, setCopied] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Schema Customization State
  const [schemaType, setSchemaType] = useState<'Product' | 'SoftwareApplication' | 'LocalBusiness' | 'Organization' | 'Service'>('SoftwareApplication');
  const [businessName, setBusinessName] = useState(project?.name || workspace?.name || 'Panda Praise');
  const [websiteUrl, setWebsiteUrl] = useState(project?.websiteUrl || 'https://pandapraise.com');
  const approvedReviews = reviews.filter(r => r.status === 'approved');
  const calculatedRating = approvedReviews.length ? (approvedReviews.reduce((sum, r) => sum + r.rating, 0) / approvedReviews.length).toFixed(1) : '';
  const calculatedCount = approvedReviews.length;
  const [ratingValue, setRatingValue] = useState('');
  const [reviewCount, setReviewCount] = useState('');
  const [description, setDescription] = useState(
    'Collect, manage, and showcase verified customer testimonials and video reviews with Panda Praise.'
  );

  const effectiveRating = ratingValue || calculatedRating;
  const effectiveCount = reviewCount || String(calculatedCount);
  const jsonLdCode = `<script type="application/ld+json">
{
  "@context": "https://schema.org/",
  "@type": "${schemaType}",
  "name": "${businessName}",
  "url": "${websiteUrl}",
  "description": "${description}",
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "${effectiveRating}",
    "bestRating": "5",
    "worstRating": "1",
    "ratingCount": "${effectiveCount}"
  }
}
</script>`;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonLdCode);
    setCopied(true);
    showToast('Schema code copied to clipboard!');
    setTimeout(() => setCopied(false), 2200);
  };

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 space-y-8 font-sans text-left">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-bounce-in bg-gray-900 text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 text-xs border border-gray-800">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="space-y-1.5 pb-4 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold text-gray-950 tracking-tight font-display">
            Google Rich Snippets & SEO Schema
          </h1>
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-gray-50 text-gray-600 text-xs font-semibold border border-gray-200">
            <Sparkles className="w-3 h-3 text-gray-500" />
            Schema preview
          </span>
        </div>
        <p className="text-xs sm:text-sm text-gray-600 leading-relaxed max-w-3xl">
          Generate structured data from your approved testimonials so search engines can understand your review information. Only use ratings and counts that match your real customer proof.
        </p>
      </div>

      {/* Main Configuration Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Schema Generator Controls (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Main Card: Google Rich Snippets & SEO Schema */}
          <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-7 shadow-xs space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-brand-50 border border-brand-100 text-brand-600 flex items-center justify-center">
                  <Search className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-gray-900">Configure Schema Data</h2>
                  <p className="text-xs text-gray-500">Customize the structured data for your website</p>
                </div>
              </div>

              <span className="text-[11px] font-bold text-gray-500 bg-gray-100 px-2.5 py-1 rounded-lg">
                JSON-LD
              </span>
            </div>

            <div className="space-y-4">
              {/* Schema Entity Type */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-gray-400" />
                  <span>Schema Entity Type</span>
                </label>
                <select
                  value={schemaType}
                  onChange={(e) => setSchemaType(e.target.value as any)}
                  className="w-full px-3.5 py-2 rounded-xl text-xs bg-gray-50 border border-gray-200 text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                >
                  <option value="SoftwareApplication">SoftwareApplication (SaaS / Apps)</option>
                  <option value="Product">Product (Physical / Digital Goods)</option>
                  <option value="LocalBusiness">LocalBusiness (Agencies, Stores & Clinics)</option>
                  <option value="Organization">Organization (Companies & Brands)</option>
                  <option value="Service">Service (Consulting & Services)</option>
                </select>
              </div>

              {/* Name & URL in 2 cols */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700 block">Product / Business Name</label>
                  <input
                    type="text"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder="e.g. Acme Corp"
                    className="w-full px-3.5 py-2 rounded-xl text-xs bg-gray-50 border border-gray-200 text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700 flex items-center gap-1">
                    <Globe className="w-3 h-3 text-gray-400" />
                    <span>Website URL</span>
                  </label>
                  <input
                    type="url"
                    value={websiteUrl}
                    onChange={(e) => setWebsiteUrl(e.target.value)}
                    placeholder="https://yourwebsite.com"
                    className="w-full px-3.5 py-2 rounded-xl text-xs bg-gray-50 border border-gray-200 text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                  />
                </div>
              </div>

              {/* Rating Value & Review Count */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700 flex items-center gap-1">
                    <Star className="w-3 h-3 text-amber-500 fill-amber-400" />
                    <span>Aggregate Rating Value (out of 5)</span>
                  </label>
                  <input
                    type="text"
                    value={ratingValue}
                    onChange={(e) => setRatingValue(e.target.value)}
                    placeholder={calculatedRating || 'Collect approved reviews first'}
                    className="w-full px-3.5 py-2 rounded-xl text-xs bg-gray-50 border border-gray-200 font-mono text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700 block">Total Review Count</label>
                  <input
                    type="number"
                    value={reviewCount}
                    onChange={(e) => setReviewCount(e.target.value)}
                    placeholder={calculatedCount ? String(calculatedCount) : '0'}
                    className="w-full px-3.5 py-2 rounded-xl text-xs bg-gray-50 border border-gray-200 font-mono text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                  />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700 block">Meta Description</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl text-xs bg-gray-50 border border-gray-200 text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 resize-none"
                />
              </div>
            </div>
          </div>

          {/* Generated JSON-LD Code Box */}
          <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-7 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Code2 className="w-4 h-4 text-brand-600" />
                <h3 className="text-sm font-bold text-gray-900">Generated JSON-LD Schema Code</h3>
              </div>

              <button
                type="button"
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-xs transition-all cursor-pointer hover:scale-[1.02]"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-white" />
                    <span>Copied Schema Code!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-white" />
                    <span>Copy Schema Code</span>
                  </>
                )}
              </button>
            </div>

            <div className="relative">
              <pre className="p-4 rounded-2xl bg-slate-950 text-purple-200 text-xs font-mono overflow-x-auto leading-relaxed border border-slate-800 selection:bg-brand-600 selection:text-white">
                {jsonLdCode}
              </pre>
            </div>

            <div className="p-3.5 rounded-xl bg-purple-50/70 border border-purple-100 text-xs text-brand-900 flex items-start gap-2">
              <HelpCircle className="w-4 h-4 text-brand-600 shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                Paste this script code into the <code className="bg-white px-1 py-0.5 rounded border border-purple-200 font-mono text-[11px]">&lt;head&gt;</code> or <code className="bg-white px-1 py-0.5 rounded border border-purple-200 font-mono text-[11px]">&lt;body&gt;</code> of your website. Google crawlers will automatically parse it during the next site index.
              </p>
            </div>
          </div>

        </div>

        {/* Right Column: Google Live SERP Preview & Guidance (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Live Google Search Preview Card */}
          <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-gray-900">Live Google SERP Preview</span>
              </div>
              <span className="text-[10px] font-bold text-gray-600 bg-gray-50 px-2 py-0.5 rounded-full border border-gray-200">
                Preview only
              </span>
            </div>

            {/* Google Search Result Box */}
            <div className="space-y-2 p-4 sm:p-5 rounded-2xl bg-gray-50/90 border border-gray-200/90 text-left">
              {/* URL & Favicon */}
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <div className="w-4 h-4 rounded-full bg-brand-600 text-white flex items-center justify-center font-bold text-[9px]">
                  P
                </div>
                <span className="truncate max-w-[220px] font-sans text-gray-700 text-[11px]">
                  {websiteUrl.replace(/^https?:\/\//, '')}
                </span>
                <span className="text-gray-400">› reviews</span>
              </div>

              {/* Title link */}
              <h3 className="text-base sm:text-lg font-semibold text-[#1a0dab] hover:underline cursor-pointer leading-snug line-clamp-2">
                {businessName} — Verified Reviews & Ratings
              </h3>

              {/* Gold Stars & Rating Bar */}
              <div className="flex items-center flex-wrap gap-2 text-xs pt-0.5">
                <div className="flex items-center gap-0.5 text-amber-500">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <span className="font-bold text-gray-800 text-xs">Rating: {effectiveRating || '—'}</span>
                <span className="text-gray-500 text-xs">• ‎{effectiveCount || '0'} reviews</span>
              </div>

              {/* Snippet Description */}
              <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed pt-1">
                {description}
              </p>
            </div>

            <p className="text-[11px] text-gray-500 italic">
              * Preview only. Search engines decide whether and how eligible structured data appears in search results.
            </p>
          </div>

          {/* Quick Installation Checklist */}
          <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-xs space-y-4 text-left">
            <h3 className="text-sm font-bold text-gray-900">How to Install in 60 Seconds</h3>
            
            <ul className="space-y-3 text-xs text-gray-600">
              <li className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-brand-50 text-brand-700 font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                  1
                </span>
                <span>Click <strong>Copy Schema Code</strong> above to copy the JSON-LD snippet.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-brand-50 text-brand-700 font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                  2
                </span>
                <span>Paste inside your site's custom code header (WordPress, Webflow, Framer, Next.js, or Shopify).</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-brand-50 text-brand-700 font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                  3
                </span>
                <span>Test your live URL with Google's Rich Results Test tool to confirm validation.</span>
              </li>
            </ul>

            <a
              href="https://search.google.com/test/rich-results"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-1.5 w-full py-2 px-3 rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200 text-xs font-semibold transition-colors"
            >
              <span>Test with Google Rich Results Tool</span>
              <ExternalLink className="w-3.5 h-3.5 text-gray-400" />
            </a>
          </div>

        </div>

      </div>

    </div>
  );
};
