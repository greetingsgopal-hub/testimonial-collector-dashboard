import React, { useState } from 'react';
import { ShopifyConnectCard } from '../features/shopify/components/ShopifyConnectCard';
import { ReviewImportStudio } from '../features/reviews/components/ReviewImportStudio';
import { MetaAdStudio } from '../features/meta-ads/components/MetaAdStudio';

export const ReviewToMetaAdsStudioPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'connect' | 'reviews' | 'ads'>('reviews');

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-white p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-xs font-bold rounded-md">
                D2C India Edition
              </span>
              <span className="text-xs text-gray-500">Shopify Meta Ads Engine</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              Review-to-Meta-Ad Studio 🚀
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Turn real customer experiences and WhatsApp COD feedback into high-converting Meta Ad creatives in seconds.
            </p>
          </div>

          {/* Navigation Tabs */}
          <div className="flex bg-gray-200 dark:bg-gray-800 p-1 rounded-xl self-start">
            <button
              onClick={() => setActiveTab('connect')}
              className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'connect'
                  ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              1. Shopify Connect
            </button>
            <button
              onClick={() => setActiveTab('reviews')}
              className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'reviews'
                  ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              2. Review Ingestion
            </button>
            <button
              onClick={() => setActiveTab('ads')}
              className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'ads'
                  ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              3. Meta Ad Generator
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="transition-all">
          {activeTab === 'connect' && <ShopifyConnectCard />}
          {activeTab === 'reviews' && <ReviewImportStudio />}
          {activeTab === 'ads' && <MetaAdStudio />}
        </div>

      </div>
    </div>
  );
};
