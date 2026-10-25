import React, { useState } from 'react';
import { ShopifyConnectCard } from '../features/shopify/components/ShopifyConnectCard';
import { ReviewImportStudio } from '../features/reviews/components/ReviewImportStudio';
import { MetaAdStudio } from '../features/meta-ads/components/MetaAdStudio';

export const ReviewToMetaAdsStudioPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'connect' | 'reviews' | 'ads'>('reviews');

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-white selection:bg-emerald-500 selection:text-white p-4 md:p-12">
      <div className="max-w-6xl mx-auto space-y-10">
        
        {/* Hero Header with Glassmorphism & Staggered Feel */}
        <div className="relative overflow-hidden rounded-3xl border border-gray-800 bg-gradient-to-r from-gray-900/80 via-gray-900/50 to-gray-900/80 backdrop-blur-xl p-8 md:p-10 shadow-2xl">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold tracking-wide uppercase">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                D2C India Performance Engine
              </div>
              <h1 className="text-3xl md:text-5xl font-black tracking-tight text-white">
                Review-to-Meta-Ad <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">Studio</span>
              </h1>
              <p className="text-gray-400 text-sm md:text-base leading-relaxed">
                Transform raw customer reviews and WhatsApp COD feedback into high-converting Meta Ad creatives in seconds. Zero guesswork, maximum ROAS.
              </p>
            </div>

            {/* Premium Tab Bar with Glow Transition */}
            <div className="flex bg-gray-950/80 border border-gray-800 p-1.5 rounded-2xl shadow-inner self-start">
              <button
                onClick={() => setActiveTab('connect')}
                className={`px-5 py-2.5 text-xs font-bold rounded-xl transition-all duration-300 cursor-pointer ${
                  activeTab === 'connect'
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-900/30'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                1. Store Sync
              </button>
              <button
                onClick={() => setActiveTab('reviews')}
                className={`px-5 py-2.5 text-xs font-bold rounded-xl transition-all duration-300 cursor-pointer ${
                  activeTab === 'reviews'
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-900/30'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                2. Ingestion
              </button>
              <button
                onClick={() => setActiveTab('ads')}
                className={`px-5 py-2.5 text-xs font-bold rounded-xl transition-all duration-300 cursor-pointer ${
                  activeTab === 'ads'
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-900/30'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                3. Ad Studio
              </button>
            </div>
          </div>
        </div>

        {/* Dynamic Content View with Smooth Fade-In */}
        <div className="transition-all duration-500 ease-out">
          {activeTab === 'connect' && <ShopifyConnectCard />}
          {activeTab === 'reviews' && <ReviewImportStudio />}
          {activeTab === 'ads' && <MetaAdStudio />}
        </div>

      </div>
    </div>
  );
};
