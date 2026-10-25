export default function BillingTest() {
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
      order_id: orderId,
      name: 'PandaPraise',
      handler: async (resp: any) => {
        const v = await fetch(`${apiUrl}/api/billing/verify`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
          body: JSON.stringify({ ...resp, drop }),
        });
        const data = await v.json();
        alert(`Paid! adsLeft: ${data.adsLeft}`);
      },
    });
    rzp.open();
  };

  return (
    <div className="p-8 bg-[#0A0A0B] min-h-screen text-[#F8F6F1] font-sans">
      <h1 className="text-2xl font-bold text-white mb-4">Test Razorpay Drops</h1>
      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => buy('starter')}
          className="h-10 px-4 bg-white/10 hover:bg-white/20 text-white rounded font-medium cursor-pointer transition-colors"
        >
          Starter ₹1500 • 5 ads (TEST)
        </button>
        <button
          onClick={() => buy('growth')}
          className="h-10 px-4 bg-[#FFE600] hover:brightness-110 text-black rounded font-bold cursor-pointer transition-all"
        >
          Growth ₹2999 • 20 ads
        </button>
        <button
          onClick={() => buy('scale')}
          className="h-10 px-4 bg-white/10 hover:bg-white/20 text-white rounded font-medium cursor-pointer transition-colors"
        >
          Scale ₹6999 • 50 ads
        </button>
      </div>
      <div className="mt-4 text-white/50 text-xs">
        Use test card: 4111 1111 1111 1111 • CVV 123 • Exp 12/30
      </div>
    </div>
  );
}
