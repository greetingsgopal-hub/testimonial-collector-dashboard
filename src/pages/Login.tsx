import { useState } from 'react';

export default function Login() {
  const [shop, setShop] = useState('');
  const [showShop, setShowShop] = useState(false);
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPass, setAdminPass] = useState('');
  const [admin2FA, setAdmin2FA] = useState('');
  const [showAdmin, setShowAdmin] = useState(false);

  const handleShopify = () => {
    if (!showShop) { setShowShop(true); return; }
    if (!shop) return;
    const apiUrl = import.meta.env.VITE_API_URL || '';
    window.location.href = `${apiUrl}/auth/shopify?shop=${shop}`;
  };

  const handleAdmin = async () => {
    if (!showAdmin) { setShowAdmin(true); return; }
    const apiUrl = import.meta.env.VITE_API_URL || '';
    const res = await fetch(`${apiUrl}/api/auth/admin/login`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: adminEmail, password: adminPass, code: admin2FA })
    });
    const data = await res.json();
    if (data.token) {
      localStorage.setItem('token', data.token);
      window.location.href = '/admin';
    } else alert(data.error);
  };

  return (
    <div className="min-h-screen bg-[#0A0A0B] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#141416] border border-white/[0.06] rounded-2xl p-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-lg bg-[#FFE600] flex items-center justify-center text-black font-bold">P</div>
          <div><div className="text-white font-bold">PandaPraise</div><div className="text-[10px] text-white/50 uppercase tracking-widest">Merchant OS</div></div>
        </div>
        {!showAdmin ? (
          <>
            <button onClick={handleShopify} className="w-full h-11 bg-[#95BF47] text-white rounded-lg font-semibold flex items-center justify-center gap-2 cursor-pointer">
              <span>🛍️</span> {showShop ? `Connect ${shop}` : 'Continue with Shopify'}
            </button>
            {showShop && <input value={shop} onChange={e=>setShop(e.target.value)} placeholder="your-store.myshopify.com" className="mt-3 w-full h-10 bg-[#0A0A0B] border border-white/[0.1] rounded-lg px-3 text-white text-sm" />}
            <div className="my-4 text-center text-white/30 text-xs">OR</div>
            <button onClick={()=>setShowAdmin(true)} className="w-full h-11 bg-transparent border border-white/[0.1] text-white rounded-lg font-medium cursor-pointer">Admin Login • 2FA required</button>
          </>
        ) : (
          <>
            <input value={adminEmail} onChange={e=>setAdminEmail(e.target.value)} placeholder="admin@pandapraise.com" className="w-full h-10 bg-[#0A0A0B] border border-white/[0.1] rounded-lg px-3 text-white text-sm mb-3" />
            <input value={adminPass} onChange={e=>setAdminPass(e.target.value)} type="password" placeholder="Password" className="w-full h-10 bg-[#0A0A0B] border border-white/[0.1] rounded-lg px-3 text-white text-sm mb-3" />
            <input value={admin2FA} onChange={e=>setAdmin2FA(e.target.value)} placeholder="2FA Code" className="w-full h-10 bg-[#0A0A0B] border border-white/[0.1] rounded-lg px-3 text-white text-sm mb-3" />
            <button onClick={handleAdmin} className="w-full h-11 bg-[#FFE600] text-black rounded-lg font-semibold cursor-pointer">Login as Admin</button>
            <button onClick={()=>setShowAdmin(false)} className="w-full mt-3 text-white/50 text-xs cursor-pointer">← Back to Shopify login</button>
          </>
        )}
        <div className="mt-8 text-center text-xs text-white/30">SOC2 Type II • Encrypted • 99.98% uptime</div>
      </div>
    </div>
  );
}
