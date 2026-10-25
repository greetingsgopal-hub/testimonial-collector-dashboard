import React, { useState } from 'react';
import { publishAdToMetaManager } from '../metaMarketingApi';
import { MetaAdCreative } from '../types';

interface CampaignDeployCardProps {
  ad: MetaAdCreative;
  shopDomain: string;
  productUrl: string;
}

export const CampaignDeployCard: React.FC<CampaignDeployCardProps> = ({ ad, shopDomain, productUrl }) => {
  const [adAccountId, setAdAccountId] = useState('');
  const [pageId, setPageId] = useState('');
  const [accessToken, setAccessToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [resultMessage, setResultMessage] = useState<{ success: boolean; text: string } | null>(null);

  const handleDeploy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adAccountId || !pageId || !accessToken) {
      setResultMessage({ success: false, text: 'Please fill in all Meta API credentials.' });
      return;
    }

    setLoading(true);
    setResultMessage(null);

    try {
      const res = await publishAdToMetaManager({
        shopDomain,
        accessToken,
        adAccountId,
        pageId,
        creativeTitle: `${ad.productTitle} - ${ad.id}`,
        primaryText: ad.primaryText,
        headline: ad.headline,
        ctaType: ad.ctaButton === 'Order on COD' ? 'SHOP_NOW' : 'SHOP_NOW',
        destinationUrl: productUrl,
      });

      if (res.success) {
        setResultMessage({ success: true, text: 'Successfully pushed ad creative to Meta Ads Manager!' });
      } else {
        setResultMessage({ success: false, text: res.error || 'Failed to publish ad.' });
      }
    } catch (err: any) {
      setResultMessage({ success: false, text: err.message || 'Network error during API push.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm">
      <h4 className="text-md font-bold text-gray-900 dark:text-white mb-2">
        Launch Directly to Meta Ads Manager 🎯
      </h4>
      <p className="text-xs text-gray-600 dark:text-gray-400 mb-4">
        Push this review-based creative straight to your Facebook/Instagram ad account.
      </p>

      <form onSubmit={handleDeploy} className="space-y-3">
        <div>
          <label className="block text-[11px] font-medium text-gray-700 dark:text-gray-300 mb-1">Meta Ad Account ID (act_...)</label>
          <input
            type="text"
            value={adAccountId}
            onChange={(e) => setAdAccountId(e.target.value)}
            placeholder="act_123456789"
            className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-xs text-gray-900 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-[11px] font-medium text-gray-700 dark:text-gray-300 mb-1">Facebook Page ID</label>
          <input
            type="text"
            value={pageId}
            onChange={(e) => setPageId(e.target.value)}
            placeholder="1029384756"
            className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-xs text-gray-900 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-[11px] font-medium text-gray-700 dark:text-gray-300 mb-1">Meta System User Access Token</label>
          <input
            type="password"
            value={accessToken}
            onChange={(e) => setAccessToken(e.target.value)}
            placeholder="EAA..."
            className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-xs text-gray-900 dark:text-white"
          />
        </div>

        {resultMessage && (
          <p className={`text-xs p-2 rounded-lg ${resultMessage.success ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'}`}>
            {resultMessage.text}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-sm disabled:opacity-50 transition-colors cursor-pointer"
        >
          {loading ? 'Publishing to Meta...' : '🚀 Push Creative to Meta Ads Manager'}
        </button>
      </form>
    </div>
  );
};
