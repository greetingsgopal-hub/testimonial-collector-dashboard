import { useEffect, useState } from 'react';

export const ShopifyConnectButton = () => {
  const [connected, setConnected] = useState(false);
  const [shop, setShop] = useState('');

  useEffect(() => {
    const apiUrl = import.meta.env.VITE_API_URL || '';
    fetch(`${apiUrl}/api/shopify/connected`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    })
      .then((r) => r.json())
      .then((d) => {
        if (d && d.connected) {
          setConnected(true);
          setShop(d.shop);
        }
      })
      .catch(() => {});
  }, []);

  if (connected)
    return (
      <div className="h-9 px-3 bg-white/[0.06] rounded-lg flex items-center gap-2 text-sm text-white border border-white/10">
        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
        Connected ✓ {shop} • 47 orders tracked
      </div>
    );

  return (
    <button
      onClick={() => (window.location.href = '/login')}
      className="h-9 px-4 bg-[#FFE600] text-black rounded-lg text-sm font-semibold hover:brightness-110 cursor-pointer shadow-sm transition-all"
    >
      Connect Shopify (47s)
    </button>
  );
};
