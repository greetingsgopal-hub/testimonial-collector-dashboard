import React, { useState } from 'react';
import { generateShopifyOAuthUrl } from '../shopifyAuth';

export const ShopifyConnectCard: React.FC = () => {
  const [shopDomain, setShopDomain] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConnect = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleaned = shopDomain.trim().toLowerCase().replace(/https?:\/\//, '').replace(/\/$/, '');
    if (!cleaned || !cleaned.includes('.myshopify.com')) {
      setError('Please enter a valid myshopify.com domain (e.g., your-store.myshopify.com)');
      return;
    }

    setLoading(true);
    try {
      const clientId = import.meta.env.VITE_SHOPIFY_CLIENT_ID || 'mock_client_id';
      const redirectUri = `${window.location.origin}/auth/shopify/callback`;
      const oauthUrl = generateShopifyOAuthUrl(cleaned, clientId, redirectUri);
      
      // Redirect to Shopify OAuth
      window.location.href = oauthUrl;
    } catch (err: any) {
      setError(err.message || 'Failed to initiate Shopify connection');
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm">
      <div className="max-w-xl">
        <span className="inline-block px-3 py-1 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 text-xs font-semibold rounded-full mb-3">
          Shopify D2C Integration
        </span>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          Connect Your Shopify Store
        </h2>
        <p className="text-gray-600 dark:text-gray-400 text-sm mb-6">
          Sync real customer reviews, WhatsApp feedback, and COD order data instantly to generate high-converting Meta ad creatives tailored for Indian shoppers.
        </p>

        <form onSubmit={handleConnect} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Shopify Store Domain
            </label>
            <div className="flex rounded-lg shadow-sm">
              <input
                type="text"
                value={shopDomain}
                onChange={(e) => setShopDomain(e.target.value)}
                placeholder="my-brand.myshopify.com"
                className="flex-1 min-w-0 block w-full px-3 py-2.5 rounded-l-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-emerald-500 focus:border-emerald-500"
              />
              <span className="inline-flex items-center px-3 rounded-r-lg border border-l-0 border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 text-xs">
                .myshopify.com
              </span>
            </div>
            {error && <p className="mt-1.5 text-xs text-red-600">{error}</p>}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Redirecting to Shopify...' : 'Connect Store & Sync Reviews'}
          </button>
        </form>
      </div>
    </div>
  );
};
