import { useEffect, useState } from 'react';

export const BillingWidget = () => {
  const [usage, setUsage] = useState<any>(null);

  useEffect(() => {
    const apiUrl = import.meta.env.VITE_API_URL || '';
    const shop = new URLSearchParams(window.location.search).get('shop') || '';
    fetch(`${apiUrl}/api/billing/usage?shop=${shop}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    })
      .then((r) => r.json())
      .then(setUsage)
      .catch(() => {});
  }, []);

  const buy = async (drop: string) => {
    const apiUrl = import.meta.env.VITE_API_URL || '';
    const res = await fetch(`${apiUrl}/api/billing/create-order`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({ drop }),
    });
    const { orderId, key, amount } = await res.json();
    const rzp = new (window as any).Razorpay({
      key,
      amount,
      currency: 'INR',
      name: 'PandaPraise',
      order_id: orderId,
      handler: async (resp: any) => {
        await fetch(`${apiUrl}/api/billing/verify`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
          body: JSON.stringify({ ...resp, drop }),
        });
        location.reload();
      },
    });
    rzp.open();
  };

  if (!usage?.drop)
    return (
      <div className="p-4 bg-[#141416] border border-white/[0.06] rounded-xl shadow-lg">
        <div className="text-white text-sm mb-3 font-medium">No ads left</div>
        <button
          onClick={() => buy('growth')}
          className="w-full h-10 bg-[#FFE600] text-black rounded-lg font-semibold hover:brightness-110 cursor-pointer transition-all shadow-sm"
        >
          Buy Growth Drop ₹2999 (20 ads)
        </button>
      </div>
    );

  const percent = usage.adsTotal
    ? Math.round((usage.adsUsed / usage.adsTotal) * 100)
    : 0;

  return (
    <div className="p-4 bg-[#141416] border border-white/[0.06] rounded-xl shadow-lg">
      <div className="flex justify-between text-white text-sm">
        <span>
          {usage.adsTotal} ads • {usage.adsUsed} used • {usage.adsLeft} left
        </span>
        <span className="font-mono font-bold">{percent}%</span>
      </div>
      <div className="mt-2 w-full h-1.5 bg-white/[0.1] rounded-full overflow-hidden">
        <div
          className="h-full bg-[#FFE600] transition-all duration-300"
          style={{ width: `${percent}%` }}
        />
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2">
        <button
          onClick={() => buy('starter')}
          className="h-8 bg-white/[0.06] hover:bg-white/[0.1] text-white rounded text-xs cursor-pointer transition-colors"
        >
          ₹1500 • 5
        </button>
        <button
          onClick={() => buy('growth')}
          className="h-8 bg-[#FFE600] hover:brightness-110 text-black rounded text-xs font-semibold cursor-pointer transition-all"
        >
          ₹2999 • 20
        </button>
        <button
          onClick={() => buy('scale')}
          className="h-8 bg-white/[0.06] hover:bg-white/[0.1] text-white rounded text-xs cursor-pointer transition-colors"
        >
          ₹6999 • 50
        </button>
      </div>
    </div>
  );
};
