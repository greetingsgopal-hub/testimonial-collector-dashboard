import React, { useState } from "react";

// 01 CONNECT - OAUTH 1-CLICK - Firebase version - Shopify in 47s
export const ShopifyConnect_Firebase: React.FC = () => {
  const [shopDomain, setShopDomain] = useState('');
  const [error, setError] = useState('');
  const [connecting, setConnecting] = useState(false);

  const handleConnect = () => {
    const normalized = shopDomain.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/$/, '');
    const shop = normalized.endsWith('.myshopify.com') ? normalized : `${normalized}.myshopify.com`;
    if (!/^[a-z0-9][a-z0-9-]*\.myshopify\.com$/.test(shop)) {
      setError('Enter a valid Shopify store name or myshopify.com domain.');
      return;
    }
    setError('');
    setConnecting(true);
    window.location.assign(`/api/shopify/auth?shop=${encodeURIComponent(shop)}`);
  };

  const connectedShop = new URLSearchParams(window.location.search).get('shopify_connected');
  const authorizationError = new URLSearchParams(window.location.search).get('shopify_error');

  return (
    <div className="rounded-[20px] bg-[#1C1C1F] border border-white/[0.06] p-6 w-full flex flex-col justify-between">
      <div>
        <div className="flex justify-between items-center mb-4">
          <span className="text-[20px] font-light text-white/20 tabular-nums font-mono">01</span>
          <span className="text-[10px] px-2.5 py-1 rounded-full bg-white/[0.06] border border-white/[0.08] tracking-widest text-white/40 font-mono">
            OAUTH • 1-CLICK
          </span>
        </div>
        <h3 className="text-[14px] font-bold tracking-[0.15em] text-white">CONNECT</h3>
        <p className="mt-2 text-[13px] text-white/50 leading-[1.6]">
          Authorize your Shopify store. Order triggers become available after webhook setup.
        </p>
      </div>
      
      <div className="mt-6">
        <label className="block text-[11px] text-white/50" htmlFor="shop-domain">Shopify store</label>
        <input id="shop-domain" value={shopDomain} onChange={(event) => setShopDomain(event.target.value)} placeholder="your-store.myshopify.com" className="mt-1 mb-3 w-full rounded-xl bg-white/[0.06] border border-white/10 px-3 py-2 text-sm text-white placeholder:text-white/30" />
        {!connecting && !connectedShop && (
          <button 
            onClick={handleConnect}
            className="w-full h-[44px] rounded-full bg-white text-black font-semibold text-[14px] hover:bg-white/90 active:scale-[0.98] transition-all tabular-nums shadow-md"
          >
            Connect Shopify Store
          </button>
        )}
        {connecting && (
          <div className="w-full h-[44px] rounded-full bg-white/[0.06] border border-white/[0.10] grid place-items-center tabular-nums text-[13px] text-white/60 font-mono animate-pulse">
            Opening Shopify authorization…
          </div>
        )}
        {connectedShop && (
          <div className="w-full h-[44px] rounded-full bg-[#00D632]/20 border border-[#00D632]/30 grid place-items-center text-[13px] text-[#00D632] font-medium tabular-nums">
            ✓ Shopify authorization completed — {connectedShop}
          </div>
        )}
        {(error || authorizationError) && <p role="alert" className="mt-2 text-xs text-red-300">{error || authorizationError}</p>}
        <div className="mt-3 text-[11px] text-white/30 tabular-nums font-mono">
          Shopify OAuth • connected status is returned by the authorization callback
        </div>
      </div>
    </div>
  );
};

export default ShopifyConnect_Firebase;

