import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Download, 
  ArrowLeft, 
  ShoppingBag, 
  Layers
} from 'lucide-react';
import { AdCard, MetaAdItem } from '../components/meta-ads/AdCard';

const SAMPLE_ADS: MetaAdItem[] = [
  {
    id: 'ad_1',
    customerName: 'Ananya Sharma',
    productName: 'Oversized Lavender Hoodie',
    hookText: 'POV: You finally found a kurta with deep pockets 🔥',
    videoUrl: '/demo_meta_ad.mp4',
    ctr: '2.42%',
    ratios: ['9:16', '1:1', '4:5'],
    createdAt: 'Today',
  },
  {
    id: 'ad_2',
    customerName: 'Ananya Sharma',
    productName: 'Oversized Lavender Hoodie',
    hookText: "I wore this for 10 hours straight — here's the honest truth 🤐",
    videoUrl: '/demo_meta_ad.mp4',
    ctr: '2.15%',
    ratios: ['9:16', '1:1', '4:5'],
    createdAt: 'Today',
  },
  {
    id: 'ad_3',
    customerName: 'Rohit Mehta',
    productName: 'Matte Clay Hair Pomade',
    hookText: "Don't buy this before watching this video ⚠️",
    videoUrl: '/demo_meta_ad.mp4',
    ctr: '2.68%',
    ratios: ['9:16', '1:1', '4:5'],
    createdAt: 'Yesterday',
  },
  {
    id: 'ad_4',
    customerName: 'Sneha Patel',
    productName: 'Chanderi Silk Saree',
    hookText: 'Why everyone on my Instagram is asking where I got this ✨',
    videoUrl: '/demo_meta_ad.mp4',
    ctr: '2.84%',
    ratios: ['9:16', '1:1', '4:5'],
    createdAt: '2 days ago',
  },
];

export const MetaAdsLibraryPage: React.FC = () => {
  const [ads] = useState<MetaAdItem[]>(() => {
    try {
      const customStr = localStorage.getItem('pandapraise_v2_custom_ads');
      if (customStr) {
        const customItems = JSON.parse(customStr);
        const mapped: MetaAdItem[] = customItems.map((c: any) => ({
          id: c.id,
          customerName: 'Studio Render (You)',
          productName: c.productName || 'Custom Product',
          hookText: c.hook || 'Viral UGC Hook',
          videoUrl: c.videoUrl || '/demo_meta_ad.mp4',
          ctr: '2.75%',
          ratios: ['9:16', '1:1', '4:5'],
          createdAt: c.createdAt || 'Just now',
        }));
        return [...mapped, ...SAMPLE_ADS];
      }
    } catch {}
    return SAMPLE_ADS;
  });
  const [filterProduct, setFilterProduct] = useState<string>('all');
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const filteredAds = filterProduct === 'all' 
    ? ads 
    : ads.filter(a => a.productName.toLowerCase().includes(filterProduct.toLowerCase()));

  const handleDownloadAll = () => {
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 3000);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans p-6 sm:p-10">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <Link
            to="/dashboard/collection"
            className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Collection Queue
          </Link>
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
            <Layers className="w-3.5 h-3.5" />
            Adscriptly-Style Creative Library
          </div>
        </div>

        {/* Top Header & Bulk Action */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
              <span>Ready Meta Ad Creatives</span>
              <span className="text-xs bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 px-2.5 py-1 rounded-full font-bold">
                {ads.length} Ads Generated
              </span>
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Real customer UGC edited with viral hooks &amp; Hormozi captions. Pre-formatted for Meta Ads Manager.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/dashboard/studio"
              className="px-4 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs sm:text-sm flex items-center gap-2 transition shadow-lg shadow-purple-600/30"
            >
              <span>✨ Create in Studio</span>
            </Link>
            <button
              type="button"
              onClick={handleDownloadAll}
              className="px-5 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs sm:text-sm flex items-center gap-2 transition shadow-lg shadow-emerald-500/30 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              {downloadSuccess ? 'Downloaded Package!' : 'Download All (.zip)'}
            </button>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 text-xs">
          <span className="text-slate-500 font-bold uppercase tracking-wider mr-2">Filter Product:</span>
          {['all', 'Hoodie', 'Pomade', 'Saree'].map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setFilterProduct(item)}
              className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer capitalize ${
                filterProduct === item
                  ? 'bg-emerald-500 text-slate-950 shadow-sm'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {item === 'all' ? 'All Products' : item}
            </button>
          ))}
        </div>

        {/* Ad Cards Grid (Adscriptly style) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredAds.map((ad) => (
            <AdCard key={ad.id} ad={ad} />
          ))}
        </div>

        {/* Footer Guidance Card */}
        <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <strong className="text-sm text-white block">One-Click Shopify Storefront Sync</strong>
              <p className="text-xs text-slate-400 mt-0.5">
                Click "Push to Shopify" on any ad card to embed the video review directly above your store's "Add to Cart" button.
              </p>
            </div>
          </div>
          <Link
            to="/dashboard/connect"
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition shrink-0"
          >
            Configure Shopify Embed
          </Link>
        </div>
      </div>
    </div>
  );
};
