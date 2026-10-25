import React, { useState } from 'react';
import { generateShopifyOAuthUrl } from '../shopifyAuth';
import { ShoppingBag, ShieldCheck, Zap, ArrowRight, CheckCircle2 } from 'lucide-react';

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

  const handleQuickSample = (domain: string) => {
    setShopDomain(domain);
    setError(null);
  };

  return (
    <div className="relative overflow-hidden rounded-3xl border border-gray-800 bg-gradient-to-b from-gray-900/90 via-gray-950/80 to-gray-950 p-6 md:p-10 shadow-2xl backdrop-blur-2xl">
      {/* Background Ambient Glow */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-teal-500/10 blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-3xl">
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-wider">
            <ShoppingBag className="w-3.5 h-3.5" />
            Official Shopify App Bridge
          </span>
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-gray-800 border border-gray-700 text-gray-400 text-xs font-medium">
            <ShieldCheck className="w-3 h-3 text-emerald-400" />
            Verified Read-Only Scopes
          </span>
        </div>

        <h2 className="text-2xl md:text-4xl font-black text-white tracking-tight mb-3">
          Connect Your Shopify Store in <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">60 Seconds</span>
        </h2>

        <p className="text-gray-400 text-sm md:text-base leading-relaxed mb-8">
          Sync real customer reviews, WhatsApp feedback, and verified COD order data to generate high-converting Meta ad creatives tuned specifically for Indian buyers.
        </p>

        {/* Value Proposition Pills */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
          <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-gray-900/60 border border-gray-800/80">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="text-xs text-gray-300 font-medium">Zero Code Installation</span>
          </div>
          <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-gray-900/60 border border-gray-800/80">
            <Zap className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="text-xs text-gray-300 font-medium">Auto COD Detection</span>
          </div>
          <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-gray-900/60 border border-gray-800/80">
            <ShieldCheck className="w-4 h-4 text-teal-400 shrink-0" />
            <span className="text-xs text-gray-300 font-medium">AES-256 Token Storage</span>
          </div>
        </div>

        <form onSubmit={handleConnect} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-2">
              Your Shopify Store Domain
            </label>
            <div className="flex flex-col sm:flex-row rounded-2xl border border-gray-700 bg-gray-950/80 p-1.5 focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/20 transition-all shadow-inner">
              <input
                type="text"
                value={shopDomain}
                onChange={(e) => setShopDomain(e.target.value)}
                placeholder="brand-name.myshopify.com"
                className="flex-1 min-w-0 bg-transparent px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none"
              />
              <button
                type="submit"
                disabled={loading}
                className="mt-2 sm:mt-0 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 active:scale-98 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-emerald-950/40 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {loading ? (
                  <span>Connecting...</span>
                ) : (
                  <>
                    <span>Connect & Sync</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
            {error && (
              <p className="mt-2 text-xs font-semibold text-rose-400 bg-rose-950/40 border border-rose-800/60 rounded-xl px-3 py-2">
                ⚠️ {error}
              </p>
            )}
          </div>

          {/* Quick Demo Pre-fills */}
          <div className="flex items-center gap-2 pt-2">
            <span className="text-[11px] text-gray-500 font-medium">Quick test stores:</span>
            <button
              type="button"
              onClick={() => handleQuickSample('bombay-shirts.myshopify.com')}
              className="text-[11px] text-emerald-400 hover:text-emerald-300 underline font-mono cursor-pointer"
            >
              bombay-shirts.myshopify.com
            </button>
            <span className="text-gray-600">•</span>
            <button
              type="button"
              onClick={() => handleQuickSample('jaipur-crafts.myshopify.com')}
              className="text-[11px] text-emerald-400 hover:text-emerald-300 underline font-mono cursor-pointer"
            >
              jaipur-crafts.myshopify.com
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
