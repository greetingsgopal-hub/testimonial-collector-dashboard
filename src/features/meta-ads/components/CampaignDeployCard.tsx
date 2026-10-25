import React, { useState } from 'react';
import { publishAdToMetaManager } from '../metaMarketingApi';
import { MetaAdCreative } from '../types';
import { Send, Shield, AlertCircle, CheckCircle2, Lock } from 'lucide-react';

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
    <div className="relative overflow-hidden rounded-2xl border border-gray-800 bg-gradient-to-b from-gray-900/95 via-gray-950/90 to-gray-950 p-5 shadow-2xl backdrop-blur-2xl space-y-4">
      <div className="flex items-center justify-between border-b border-gray-800/80 pb-3">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Send className="w-3.5 h-3.5" />
          </span>
          <h4 className="text-sm font-black text-white tracking-tight">
            Deploy to Meta Ads Manager
          </h4>
        </div>
        <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2 py-0.5 rounded-md flex items-center gap-1">
          <Shield className="w-2.5 h-2.5" />
          Graph API v19.0
        </span>
      </div>

      <p className="text-xs text-gray-400 leading-relaxed">
        Push this review ad creative directly into your active Facebook & Instagram ad set with 1 click.
      </p>

      <form onSubmit={handleDeploy} className="space-y-3">
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-300 mb-1">
            Meta Ad Account ID
          </label>
          <input
            type="text"
            value={adAccountId}
            onChange={(e) => setAdAccountId(e.target.value)}
            placeholder="act_123456789"
            className="w-full px-3 py-2 rounded-xl border border-gray-700 bg-gray-900/80 text-xs text-white placeholder-gray-500 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 focus:outline-none font-mono"
          />
        </div>

        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-300 mb-1">
            Facebook Page ID
          </label>
          <input
            type="text"
            value={pageId}
            onChange={(e) => setPageId(e.target.value)}
            placeholder="1029384756"
            className="w-full px-3 py-2 rounded-xl border border-gray-700 bg-gray-900/80 text-xs text-white placeholder-gray-500 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 focus:outline-none font-mono"
          />
        </div>

        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-300 mb-1 flex items-center justify-between">
            <span>System User Access Token</span>
            <span className="text-[10px] text-gray-400 flex items-center gap-0.5">
              <Lock className="w-2.5 h-2.5" /> Encrypted In-Flight
            </span>
          </label>
          <input
            type="password"
            value={accessToken}
            onChange={(e) => setAccessToken(e.target.value)}
            placeholder="EAA..."
            className="w-full px-3 py-2 rounded-xl border border-gray-700 bg-gray-900/80 text-xs text-white placeholder-gray-500 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 focus:outline-none font-mono"
          />
        </div>

        {resultMessage && (
          <div
            className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
              resultMessage.success
                ? 'bg-emerald-950/60 border-emerald-800 text-emerald-300'
                : 'bg-rose-950/60 border-rose-800 text-rose-300'
            }`}
          >
            {resultMessage.success ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            )}
            <span>{resultMessage.text}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 px-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 active:scale-98 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-emerald-950/30 disabled:opacity-50 transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          {loading ? (
            <span>Publishing to Meta...</span>
          ) : (
            <>
              <span>🚀 Push Creative to Meta Manager</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};
