import React, { useState } from 'react';
import {
  Shield,
  Copy,
  Check,
  ShoppingBag,
  CreditCard,
  Workflow,
  Sparkles,
} from 'lucide-react';
import {
  SHOPIFY_ROUTES_TEMPLATE,
  BILLING_ROUTES_TEMPLATE,
  SHOPIFY_CONNECT_BUTTON_TEMPLATE,
  BILLING_WIDGET_TEMPLATE,
  USAGE_GUARD_TEMPLATE,
  ENV_EXAMPLE_TEMPLATE,
} from './shopifyRazorpayTemplates';

interface TabItem {
  id: 'shopify' | 'billing' | 'frontend' | 'flow';
  label: string;
  meta: string;
}

const TABS: TabItem[] = [
  { id: 'shopify', label: 'Shopify OAuth', meta: 'server/routes/shopify.js' },
  { id: 'billing', label: 'Razorpay Drops', meta: 'server/routes/billing.js' },
  { id: 'frontend', label: 'Dashboard UI', meta: '3 components' },
  { id: 'flow', label: 'Flow + ENV', meta: '.env.example' },
];

export const ShopifyRazorpayIntegrationStudio: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'shopify' | 'billing' | 'frontend' | 'flow'>('shopify');
  const [toasts, setToasts] = useState<string[]>([]);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Shopify Interactive State
  const [shopify, setShopify] = useState({
    connected: false,
    shop: 'your-store.myshopify.com',
    ordersTracked: 47,
  });

  // Billing & Usage Interactive State
  const [usage, setUsage] = useState({
    adsTotal: 20,
    adsUsed: 12,
    adsLeft: 8,
    drop: 'growth',
    daysLeft: 23,
  });

  const showToast = (msg: string) => {
    setToasts((prev) => [...prev, msg]);
    setTimeout(() => {
      setToasts((prev) => prev.slice(1));
    }, 2600);
  };

  const copyToClipboard = (text: string, label = 'Copied', key?: string) => {
    try {
      navigator.clipboard.writeText(text);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    }
    showToast(`${label} ✓`);
    if (key) {
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 1800);
    }
  };

  const handleBuyDrop = (plan: 'starter' | 'growth' | 'scale') => {
    showToast(`Creating Razorpay order for ${plan}…`);
    setTimeout(() => {
      const dropBonus = {
        starter: { total: 5 },
        growth: { total: 20 },
        scale: { total: 50 },
      };
      const added = dropBonus[plan].total;
      setUsage((prev) => ({
        ...prev,
        adsTotal: prev.adsTotal + added,
        adsLeft: prev.adsLeft + added,
        drop: plan,
      }));
      showToast(`Paid ✓ ${plan} • ${added} ads added`);
    }, 700);
  };

  const handleDownloadDecrement = () => {
    if (usage.adsLeft <= 0) {
      showToast('402 — No ads left, buy more');
      return;
    }
    setUsage((prev) => ({
      ...prev,
      adsUsed: prev.adsUsed + 1,
      adsLeft: Math.max(0, prev.adsLeft - 1),
    }));
    showToast('Downloaded • adsLeft decremented');
  };

  const percentUsed = usage.adsTotal
    ? Math.round((usage.adsUsed / usage.adsTotal) * 100)
    : 0;

  return (
    <div className="min-h-screen w-full bg-[#0A0A0B] text-[#F8F6F1] font-sans overflow-x-hidden selection:bg-[#FFE600] selection:text-black">
      {/* ── Top Header ── */}
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-[#0A0A0B]/90 border-b border-[#232326]">
        <div className="mx-auto max-w-[1140px] px-5 md:px-7 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-[#FFE600] grid place-items-center text-black font-extrabold text-[15px] shadow-[0_0_15px_rgba(255,230,0,0.3)]">
              P
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[14px] font-bold tracking-tight text-white">
                  PandaPraise
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#141416] border border-[#232326] text-[#9A9996] tracking-widest font-mono">
                  FINAL INTEGRATION
                </span>
              </div>
              <span className="text-[11px] text-[#6B6A68]">
                Shopify OAuth + Razorpay Drop Enforcement • v2.1.0
              </span>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-3">
            <span className="h-2 w-2 rounded-full bg-[#22C55E] animate-pulse" />
            <span className="text-[11px] text-[#9A9996] font-mono">
              PRODUCTION READY • 4 TABS • COPY-PASTE
            </span>
          </div>
        </div>

        {/* ── Tabs Navigation ── */}
        <div className="mx-auto max-w-[1140px] px-5 md:px-7">
          <div className="flex gap-2 overflow-x-auto py-2.5 -mb-px scrollbar-none">
            {TABS.map((tab, idx) => {
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    showToast(`${tab.label} opened`);
                  }}
                  className={`group flex items-center gap-2.5 h-9 px-4 rounded-full border text-[13px] font-medium whitespace-nowrap transition-all cursor-pointer ${
                    active
                      ? 'bg-[#FFE600] border-[#FFE600] text-black shadow-[0_0_20px_rgba(255,230,0,0.25)]'
                      : 'bg-[#141416] border-[#232326] text-[#9A9996] hover:text-white hover:border-[#2E2E32]'
                  }`}
                >
                  <span
                    className={`h-5 w-5 rounded-full grid place-items-center text-[11px] font-bold ${
                      active
                        ? 'bg-black text-[#FFE600]'
                        : 'bg-[#0A0A0B] border border-[#232326] text-[#6B6A68]'
                    }`}
                  >
                    {idx + 1}
                  </span>
                  <span>{tab.label}</span>
                  <span
                    className={`hidden md:inline text-[10px] font-mono px-1.5 py-0.5 rounded-full ${
                      active
                        ? 'bg-black/15 text-black/80'
                        : 'bg-[#0A0A0B] text-[#6B6A68] border border-[#232326]'
                    }`}
                  >
                    {tab.meta}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* ── Main Workspace ── */}
      <main className="mx-auto max-w-[1140px] px-5 md:px-7 py-6 md:py-8 space-y-6">
        {/* Metric / Palette Tag Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#141416] border border-[#232326] text-[11px] text-[#9A9996]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#FFE600]" />
            <span>DARK #0A0A0B • RAISED #141416 • ACCENT #FFE600 • TEXT #F8F6F1</span>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-[#6B6A68] font-mono">
            <Shield className="w-3.5 h-3.5 text-[#22C55E]" />
            <span>JWT • HMAC • Razorpay sig • BullMQ ready</span>
          </div>
        </div>

        {/* ════════ TAB 1: SHOPIFY OAUTH ════════ */}
        {activeTab === 'shopify' && (
          <div className="grid grid-cols-1 lg:grid-cols-[1.15fr_0.85fr] gap-6 items-start">
            {/* Code Block: server/routes/shopify.js */}
            <div className="rounded-2xl bg-[#141416] border border-[#232326] overflow-hidden shadow-2xl">
              <div className="h-13 px-5 flex items-center justify-between border-b border-[#232326] bg-[#1A1A1E]/60">
                <div className="flex items-center gap-3">
                  <span className="h-7 w-7 rounded-lg bg-[#FFE600] grid place-items-center text-black font-bold text-[12px]">
                    1
                  </span>
                  <div>
                    <p className="text-[13px] font-semibold text-white">
                      server/routes/shopify.js
                    </p>
                    <p className="text-[11px] text-[#6B6A68] font-mono">
                      Express • HMAC • JWT • Webhook
                    </p>
                  </div>
                </div>
                <button
                  onClick={() =>
                    copyToClipboard(SHOPIFY_ROUTES_TEMPLATE, 'Shopify file copied', 'shopify')
                  }
                  className="h-8 px-3.5 rounded-full bg-white text-black text-[12px] font-semibold hover:bg-[#FFE600] transition-colors cursor-pointer flex items-center gap-1.5 min-w-[92px] justify-center"
                >
                  {copiedKey === 'shopify' ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-black" />
                      <span>Copied ✓</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-black" />
                      <span>Copy file</span>
                    </>
                  )}
                </button>
              </div>

              <div className="relative">
                <pre className="font-mono text-[11.5px] leading-[1.65] p-5 overflow-x-auto max-h-[720px] text-[#D6D5D2] whitespace-pre-wrap break-words">
                  {SHOPIFY_ROUTES_TEMPLATE}
                </pre>
              </div>
            </div>

            {/* Interactive Preview & Checklists */}
            <div className="flex flex-col gap-5">
              {/* Live OAuth Preview */}
              <div className="rounded-2xl bg-[#141416] border border-[#232326] p-5 shadow-xl">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-[13px] font-semibold text-white flex items-center gap-2">
                    <ShoppingBag className="w-4 h-4 text-[#FFE600]" />
                    <span>Live OAuth Preview</span>
                  </h3>
                  <span className="text-[10px] tracking-widest px-2 py-0.5 rounded-full bg-[#FFE600]/10 text-[#FFE600] border border-[#FFE600]/20 font-mono font-bold">
                    INTERACTIVE
                  </span>
                </div>

                {!shopify.connected ? (
                  <div className="space-y-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className="h-8 w-8 rounded-lg bg-[#FFE600] grid place-items-center text-black font-bold text-[12px]">
                        S
                      </div>
                      <p className="text-[13px] font-semibold text-white">
                        Connect Shopify (47s)
                      </p>
                      <span className="ml-auto h-2 w-2 rounded-full bg-[#FFE600] animate-pulse" />
                    </div>

                    <div className="flex gap-2">
                      <input
                        value={shopify.shop}
                        onChange={(e) =>
                          setShopify({ ...shopify, shop: e.target.value })
                        }
                        placeholder="your-store.myshopify.com"
                        className="flex-1 h-10 px-3.5 rounded-lg bg-[#0A0A0B] border border-[#2E2E32] text-[13px] text-white placeholder:text-[#6B6A68] outline-none focus:border-[#FFE600] font-mono transition-colors"
                      />
                      <button
                        onClick={() => {
                          if (!shopify.shop.includes('.myshopify.com')) {
                            showToast('Use your-store.myshopify.com');
                            return;
                          }
                          showToast('Redirecting to Shopify OAuth…');
                          setTimeout(() => {
                            setShopify({ ...shopify, connected: true });
                            showToast('OAuth success • JWT issued ✓');
                          }, 900);
                        }}
                        className="h-10 px-5 rounded-lg bg-[#FFE600] text-black text-[13px] font-semibold hover:brightness-110 cursor-pointer shadow-[0_0_15px_rgba(255,230,0,0.2)]"
                      >
                        Connect
                      </button>
                    </div>

                    <p className="text-[11px] text-[#6B6A68] font-mono">
                      GET /auth/shopify?shop=… → 302 to Shopify • scopes read_orders,read_customers
                    </p>
                  </div>
                ) : (
                  <div className="rounded-xl bg-[#0A0A0B] border border-[#232326] px-4 py-3 flex items-center gap-3">
                    <span className="h-2 w-2 rounded-full bg-[#22C55E] animate-pulse" />
                    <span className="text-[12px] font-medium text-white">
                      Connected ✓ <span className="text-[#FFE600] font-mono">{shopify.shop}</span> • {shopify.ordersTracked} orders tracked
                    </span>
                    <button
                      onClick={() => setShopify({ ...shopify, connected: false })}
                      className="ml-auto text-[11px] text-[#6B6A68] hover:text-white underline cursor-pointer"
                    >
                      Disconnect
                    </button>
                  </div>
                )}

                {/* API & Webhook Specs */}
                <div className="mt-5 grid grid-cols-2 gap-2.5">
                  <div className="rounded-lg bg-[#0A0A0B] border border-[#232326] p-3">
                    <p className="text-[10px] tracking-widest text-[#6B6A68] font-mono">
                      ENDPOINT
                    </p>
                    <p className="font-mono text-[11px] text-white mt-1">
                      GET /api/shopify/connected
                    </p>
                    <p className="text-[11px] text-[#22C55E] font-mono mt-1">
                      → {`{ connected: ${shopify.connected}, ordersTracked: 47 }`}
                    </p>
                  </div>

                  <div className="rounded-lg bg-[#0A0A0B] border border-[#232326] p-3">
                    <p className="text-[10px] tracking-widest text-[#6B6A68] font-mono">
                      WEBHOOK
                    </p>
                    <p className="font-mono text-[11px] text-white mt-1 truncate">
                      POST /api/shopify/webhook/orders/create
                    </p>
                    <p className="text-[11px] text-[#9A9996] font-mono mt-1">
                      verify HMAC → 7d delay → WA template
                    </p>
                  </div>
                </div>

                <div className="mt-4 rounded-lg bg-[#FFE600]/10 border border-[#FFE600]/20 p-3">
                  <p className="text-[11px] font-semibold text-[#FFE600]">
                    .env needed
                  </p>
                  <p className="font-mono text-[11px] text-[#9A9996] mt-1">
                    SHOPIFY_API_KEY, SHOPIFY_API_SECRET, SHOPIFY_WEBHOOK_SECRET, JWT_SECRET
                  </p>
                </div>
              </div>

              {/* Security Checklist */}
              <div className="rounded-2xl bg-[#141416] border border-[#232326] p-5 shadow-xl">
                <h4 className="text-[11px] font-bold tracking-widest text-[#6B6A68] font-mono uppercase">
                  Security Checklist
                </h4>
                <ul className="mt-3.5 space-y-2 text-[12px] text-[#9A9996]">
                  {[
                    'timingSafeEqual for HMAC compare',
                    'state CSRF cookie httpOnly + secure',
                    'raw body for webhook verify',
                    'JWT role: merchant_admin, plan free→paid',
                    'encrypt accessToken at rest in prod DB',
                  ].map((item, idx) => (
                    <li key={idx} className="flex items-center gap-2.5">
                      <span className="text-[#22C55E] font-bold">✓</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* ════════ TAB 2: RAZORPAY DROPS ════════ */}
        {activeTab === 'billing' && (
          <div className="grid grid-cols-1 lg:grid-cols-[1.15fr_0.85fr] gap-6 items-start">
            {/* Code Block: server/routes/billing.js */}
            <div className="rounded-2xl bg-[#141416] border border-[#232326] overflow-hidden shadow-2xl">
              <div className="h-13 px-5 flex items-center justify-between border-b border-[#232326] bg-[#1A1A1E]/60">
                <div className="flex items-center gap-3">
                  <span className="h-7 w-7 rounded-lg bg-[#FFE600] grid place-items-center text-black font-bold text-[12px]">
                    2
                  </span>
                  <div>
                    <p className="text-[13px] font-semibold text-white">
                      server/routes/billing.js
                    </p>
                    <p className="text-[11px] text-[#6B6A68] font-mono">
                      Razorpay • Drops • Usage guard
                    </p>
                  </div>
                </div>
                <button
                  onClick={() =>
                    copyToClipboard(BILLING_ROUTES_TEMPLATE, 'Billing file copied', 'billing')
                  }
                  className="h-8 px-3.5 rounded-full bg-white text-black text-[12px] font-semibold hover:bg-[#FFE600] transition-colors cursor-pointer flex items-center gap-1.5 min-w-[92px] justify-center"
                >
                  {copiedKey === 'billing' ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-black" />
                      <span>Copied ✓</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-black" />
                      <span>Copy file</span>
                    </>
                  )}
                </button>
              </div>

              <pre className="font-mono text-[11.5px] leading-[1.65] p-5 overflow-x-auto max-h-[720px] text-[#D6D5D2] whitespace-pre-wrap break-words">
                {BILLING_ROUTES_TEMPLATE}
              </pre>
            </div>

            {/* Interactive Drop Enforcement Simulator */}
            <div className="flex flex-col gap-5">
              <div className="rounded-2xl bg-[#141416] border border-[#232326] p-5 shadow-xl">
                <div className="flex items-center justify-between">
                  <h3 className="text-[13px] font-semibold text-white flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-[#FFE600]" />
                    <span>Drop Enforcement Preview</span>
                  </h3>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#0A0A0B] border border-[#232326] text-[#9A9996] font-mono">
                    {usage.daysLeft} days left
                  </span>
                </div>

                <div className="mt-5 flex items-center gap-5">
                  {/* Circular Radial Gauge */}
                  <div className="relative h-22 w-22 grid place-items-center shrink-0">
                    <svg viewBox="0 0 88 88" className="h-22 w-22 -rotate-90">
                      <circle
                        cx="44"
                        cy="44"
                        r="36"
                        fill="none"
                        stroke="#1E1E22"
                        strokeWidth="8"
                      />
                      <circle
                        cx="44"
                        cy="44"
                        r="36"
                        fill="none"
                        stroke="#FFE600"
                        strokeWidth="8"
                        strokeDasharray={`${Math.round((percentUsed / 100) * 226)} 226`}
                        strokeLinecap="round"
                        className="transition-all duration-500 ease-out"
                      />
                    </svg>
                    <span className="absolute text-[18px] font-bold text-white font-mono">
                      {percentUsed}%
                    </span>
                  </div>

                  {/* Usage Numbers Grid */}
                  <div className="flex-1 grid grid-cols-3 gap-2">
                    <div className="rounded-lg bg-[#0A0A0B] border border-[#232326] p-3 text-center">
                      <p className="text-[11px] text-[#6B6A68]">Total</p>
                      <p className="text-[18px] font-bold text-white font-mono">
                        {usage.adsTotal}
                      </p>
                    </div>
                    <div className="rounded-lg bg-[#0A0A0B] border border-[#232326] p-3 text-center">
                      <p className="text-[11px] text-[#6B6A68]">Used</p>
                      <p className="text-[18px] font-bold text-white font-mono">
                        {usage.adsUsed}
                      </p>
                    </div>
                    <div className="rounded-lg bg-[#FFE600]/10 border border-[#FFE600]/20 p-3 text-center">
                      <p className="text-[11px] text-[#FFE600]">Left</p>
                      <p className="text-[18px] font-bold text-[#FFE600] font-mono">
                        {usage.adsLeft}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Instant Plan Buy Buttons */}
                <div className="mt-5 grid grid-cols-3 gap-2">
                  {[
                    { id: 'starter' as const, price: '₹1500', ads: '5 ads' },
                    { id: 'growth' as const, price: '₹2999', ads: '20 ads' },
                    { id: 'scale' as const, price: '₹6999', ads: '50 ads' },
                  ].map((p) => (
                    <button
                      key={p.id}
                      onClick={() => handleBuyDrop(p.id)}
                      className="h-12 rounded-lg bg-[#FFE600] text-black text-[12px] font-bold leading-tight hover:brightness-110 flex flex-col items-center justify-center cursor-pointer transition-all shadow-sm"
                    >
                      <span>{p.price}</span>
                      <span className="text-[10px] opacity-75">{p.ads}</span>
                    </button>
                  ))}
                </div>

                {/* Download Ad Simulation */}
                <div className="mt-4">
                  <button
                    onClick={handleDownloadDecrement}
                    className={`w-full h-11 rounded-lg text-[13px] font-semibold border transition-all cursor-pointer ${
                      usage.adsLeft > 0
                        ? 'bg-white text-black border-white hover:bg-[#FFE600] hover:border-[#FFE600]'
                        : 'bg-[#1A1A1E] text-[#6B6A68] border-[#2E2E32] cursor-not-allowed opacity-60'
                    }`}
                  >
                    {usage.adsLeft > 0
                      ? '↓ Download Ad (decrement demo)'
                      : 'Blocked — No ads left'}
                  </button>
                  <p className="mt-2 text-[11px] text-[#6B6A68] font-mono text-center">
                    POST /api/ads/download → requireAdsLeft → 402 if adsLeft==0
                  </p>
                </div>
              </div>

              {/* Drop Logic Pricing Specs */}
              <div className="rounded-2xl bg-[#0A0A0B] border border-[#232326] p-5 shadow-xl">
                <p className="text-[11px] font-bold tracking-widest text-[#6B6A68] font-mono uppercase">
                  DROP LOGIC
                </p>
                <div className="mt-3.5 space-y-2 font-mono text-[11px] text-[#9A9996]">
                  <div className="flex justify-between items-center py-1 border-b border-[#1A1A1E]">
                    <span className="text-white font-medium">starter</span>
                    <span className="text-white">₹1500 • 5 ads • ₹300/ad</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-[#1A1A1E]">
                    <span className="text-[#FFE600] font-medium">growth</span>
                    <span className="text-[#FFE600]">₹2999 • 20 ads • ₹149/ad ★</span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="text-white font-medium">scale</span>
                    <span className="text-white">₹6999 • 50 ads • ₹139/ad</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ════════ TAB 3: DASHBOARD UI ════════ */}
        {activeTab === 'frontend' && (
          <div className="space-y-6">
            {/* 3 Component Code Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              {[
                {
                  title: 'ShopifyConnectButton.tsx',
                  code: SHOPIFY_CONNECT_BUTTON_TEMPLATE,
                  desc: 'Yellow 47s → Green Connected',
                },
                {
                  title: 'BillingWidget.tsx',
                  code: BILLING_WIDGET_TEMPLATE,
                  desc: 'Radial 60% • Razorpay Checkout',
                },
                {
                  title: 'UsageGuard.tsx',
                  code: USAGE_GUARD_TEMPLATE,
                  desc: 'Modal + Upsell when 0',
                },
              ].map((comp) => (
                <div
                  key={comp.title}
                  className="rounded-2xl bg-[#141416] border border-[#232326] overflow-hidden flex flex-col shadow-xl"
                >
                  <div className="h-13 px-4 flex items-center justify-between border-b border-[#232326] bg-[#1A1A1E]/60">
                    <div>
                      <p className="text-[12px] font-semibold text-white">
                        {comp.title}
                      </p>
                      <p className="text-[11px] text-[#6B6A68]">{comp.desc}</p>
                    </div>
                    <button
                      onClick={() =>
                        copyToClipboard(comp.code, `${comp.title} copied`, comp.title)
                      }
                      className="h-7 px-3 rounded-full bg-white text-black text-[11px] font-semibold hover:bg-[#FFE600] transition-colors cursor-pointer min-w-[72px]"
                    >
                      {copiedKey === comp.title ? 'Copied ✓' : 'Copy'}
                    </button>
                  </div>
                  <pre className="font-mono text-[10.5px] leading-[1.6] p-4 overflow-x-auto max-h-[520px] text-[#D6D5D2] whitespace-pre-wrap break-words flex-1">
                    {comp.code}
                  </pre>
                </div>
              ))}
            </div>

            {/* Live Interactive UI Preview */}
            <div className="rounded-2xl bg-[#141416] border border-[#232326] p-5 md:p-6 shadow-2xl">
              <div className="flex items-center gap-3">
                <span className="h-7 w-7 rounded-lg bg-white grid place-items-center text-black font-bold text-[11px]">
                  UI
                </span>
                <h3 className="text-[14px] font-semibold text-white">
                  Dashboard Components — Live
                </h3>
                <span className="ml-auto text-[11px] px-2.5 py-1 rounded-full bg-[#FFE600] text-black font-semibold font-mono">
                  Preview
                </span>
              </div>

              <div className="mt-6 grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-5">
                {/* Simulated Connect Button */}
                <div className="rounded-xl bg-[#0A0A0B] border border-[#232326] p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-[#FFE600] grid place-items-center text-black font-bold text-xs">
                      S
                    </div>
                    <p className="text-[13px] font-semibold text-white">
                      Connect Shopify (47s)
                    </p>
                    <span className="ml-auto text-[10px] tracking-widest px-2 py-0.5 rounded-full bg-[#FFE600]/10 text-[#FFE600] border border-[#FFE600]/20 font-mono">
                      REQUIRED
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <input
                      defaultValue="your-store.myshopify.com"
                      className="flex-1 h-10 px-3 rounded-lg bg-[#141416] border border-[#2E2E32] text-[13px] text-white placeholder:text-[#6B6A68] outline-none font-mono"
                    />
                    <button
                      onClick={() => showToast('Redirecting to OAuth initiation…')}
                      className="h-10 px-5 rounded-lg bg-[#FFE600] text-black text-[13px] font-semibold hover:brightness-110 cursor-pointer"
                    >
                      Connect
                    </button>
                  </div>
                </div>

                {/* Simulated Usage Bar */}
                <div className="rounded-xl bg-[#0A0A0B] border border-[#232326] p-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-[13px] font-semibold text-white">Usage</h4>
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#141416] border border-[#232326] text-[#9A9996] font-mono">
                      23 days left
                    </span>
                  </div>

                  <div className="mt-3 flex items-center gap-3">
                    <div className="h-3 w-3 rounded-full bg-[#FFE600]" />
                    <div className="flex-1 h-2 rounded-full bg-[#1E1E22] overflow-hidden">
                      <div className="h-full w-[60%] bg-[#FFE600]" />
                    </div>
                    <span className="text-[12px] font-bold text-white font-mono">
                      60%
                    </span>
                  </div>

                  <p className="mt-3 font-mono text-[11px] text-[#9A9996]">
                    20 ads • 12 used • 8 left • Growth drop
                  </p>

                  <div className="mt-3 grid grid-cols-3 gap-2">
                    <button
                      onClick={() => handleBuyDrop('starter')}
                      className="h-9 rounded-lg bg-[#FFE600] text-black text-[11px] font-bold hover:brightness-110 cursor-pointer"
                    >
                      ₹1500
                    </button>
                    <button
                      onClick={() => handleBuyDrop('growth')}
                      className="h-9 rounded-lg bg-[#FFE600] text-black text-[11px] font-bold hover:brightness-110 cursor-pointer"
                    >
                      ₹2999
                    </button>
                    <button
                      onClick={() => handleBuyDrop('scale')}
                      className="h-9 rounded-lg bg-white text-black text-[11px] font-bold hover:brightness-110 cursor-pointer"
                    >
                      ₹6999
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ════════ TAB 4: FLOW + ENV ════════ */}
        {activeTab === 'flow' && (
          <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-6 items-start">
            {/* Merchant Journey Timeline */}
            <div className="rounded-2xl bg-[#141416] border border-[#232326] p-5 md:p-6 shadow-2xl">
              <div className="flex items-center gap-3 mb-6">
                <span className="h-7 w-7 rounded-lg bg-[#FFE600] grid place-items-center text-black font-bold text-[11px]">
                  4
                </span>
                <h3 className="text-[14px] font-semibold text-white flex items-center gap-2">
                  <Workflow className="w-4 h-4 text-[#FFE600]" />
                  <span>Full Flow Diagram</span>
                </h3>
                <span className="ml-auto text-[10px] px-2 py-0.5 rounded-full bg-[#0A0A0B] border border-[#232326] text-[#6B6A68] font-mono">
                  MERCHANT JOURNEY
                </span>
              </div>

              <div className="relative">
                <div className="absolute left-[15px] top-[12px] bottom-[12px] w-px bg-gradient-to-b from-[#FFE600] via-[#232326] to-[#232326] opacity-60" />

                <div className="space-y-3">
                  {[
                    {
                      step: '01',
                      title: 'Merchant lands /dashboard',
                      desc: 'Check JWT • storeDomain from token',
                      color: '#9A9996',
                      active: false,
                    },
                    {
                      step: '02',
                      title: 'Not connected Shopify',
                      desc: 'Show Connect button yellow 47s state',
                      color: '#FFE600',
                      active: true,
                    },
                    {
                      step: '03',
                      title: 'OAuth → /auth/shopify?shop=…',
                      desc: '302 redirect • scopes read_orders,read_customers',
                      color: '#9A9996',
                      active: false,
                    },
                    {
                      step: '04',
                      title: 'Callback verifies HMAC + state',
                      desc: 'Exchange code → accessToken • Save DB • Issue JWT role merchant_admin',
                      color: '#22C55E',
                      active: false,
                    },
                    {
                      step: '05',
                      title: 'Connected ✓ • Check billing usage',
                      desc: 'GET /api/billing/usage • adsTotal 0? → upsell',
                      color: '#9A9996',
                      active: false,
                    },
                    {
                      step: '06',
                      title: 'No drop paid → Show Buy Growth ₹2999',
                      desc: 'CTA: Buy Growth Drop 20 ads',
                      color: '#FFE600',
                      active: true,
                    },
                    {
                      step: '07',
                      title: 'Razorpay Checkout',
                      desc: 'POST /api/billing/create-order → new Razorpay(options).open()',
                      color: '#9A9996',
                      active: false,
                    },
                    {
                      step: '08',
                      title: 'Verify signature • Save payment',
                      desc: 'POST /api/billing/verify • adsLeft 20 • daysLeft 30',
                      color: '#22C55E',
                      active: false,
                    },
                    {
                      step: '09',
                      title: 'Can download ads',
                      desc: 'POST /api/ads/download • requireAdsLeft • decrement adsLeft',
                      color: '#9A9996',
                      active: false,
                    },
                    {
                      step: '10',
                      title: 'When 0 → Block + Upsell modal',
                      desc: '402 Payment Required • UsageGuard shows Buy More',
                      color: '#EF4444',
                      active: false,
                    },
                  ].map((item) => (
                    <div key={item.step} className="flex gap-4 items-start relative z-10">
                      <div
                        className={`h-8 w-8 rounded-full grid place-items-center text-[11px] font-bold shrink-0 border ${
                          item.active
                            ? 'bg-[#FFE600] text-black border-[#FFE600] shadow-[0_0_12px_rgba(255,230,0,0.4)]'
                            : 'bg-[#0A0A0B] text-[#9A9996] border-[#232326]'
                        }`}
                      >
                        {item.step}
                      </div>
                      <div
                        className={`flex-1 rounded-xl border p-3 ${
                          item.active
                            ? 'bg-[#FFE600]/[0.06] border-[#FFE600]/30'
                            : 'bg-[#0A0A0B] border-[#232326]'
                        }`}
                      >
                        <p
                          className="text-[12px] font-semibold"
                          style={{ color: item.active ? '#FFE600' : '#F8F6F1' }}
                        >
                          {item.title}
                        </p>
                        <p className="text-[11px] text-[#6B6A68] mt-0.5 font-mono">
                          {item.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Webhook Flow Timeline Horizontal Pills */}
              <div className="mt-8 rounded-xl bg-[#0A0A0B] border border-[#232326] p-4">
                <p className="text-[11px] font-bold tracking-widest text-[#6B6A68] font-mono uppercase mb-3">
                  WEBHOOK FLOW
                </p>
                <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono">
                  <span className="px-2.5 py-1 rounded-full bg-[#141416] border border-[#232326] text-white">
                    Shopify order fulfilled
                  </span>
                  <span className="text-[#6B6A68]">→</span>
                  <span className="px-2.5 py-1 rounded-full bg-[#141416] border border-[#232326] text-[#9A9996]">
                    BullMQ delay 7d
                  </span>
                  <span className="text-[#6B6A68]">→</span>
                  <span className="px-2.5 py-1 rounded-full bg-[#FFE600]/10 border border-[#FFE600]/20 text-[#FFE600]">
                    WA template video_review_reward_7day
                  </span>
                  <span className="text-[#6B6A68]">→</span>
                  <span className="px-2.5 py-1 rounded-full bg-[#141416] border border-[#232326] text-white">
                    Customer replies video
                  </span>
                  <span className="text-[#6B6A68]">→</span>
                  <span className="px-2.5 py-1 rounded-full bg-[#141416] border border-[#232326] text-white">
                    Inbox → Approve
                  </span>
                  <span className="text-[#6B6A68]">→</span>
                  <span className="px-2.5 py-1 rounded-full bg-[#22C55E]/10 border border-[#22C55E]/20 text-[#22C55E]">
                    Download → Decrement
                  </span>
                </div>
              </div>
            </div>

            {/* .env.example Code & Installation Steps */}
            <div className="rounded-2xl bg-[#141416] border border-[#232326] overflow-hidden shadow-2xl">
              <div className="h-13 px-5 flex items-center justify-between border-b border-[#232326] bg-[#1A1A1E]/60">
                <div className="flex items-center gap-3">
                  <span className="h-7 w-7 rounded-lg bg-white grid place-items-center text-black font-bold text-[11px]">
                    .env
                  </span>
                  <p className="text-[13px] font-semibold text-white">
                    .env.example
                  </p>
                </div>
                <button
                  onClick={() =>
                    copyToClipboard(ENV_EXAMPLE_TEMPLATE, '.env.example copied', 'env')
                  }
                  className="h-8 px-3.5 rounded-full bg-[#FFE600] text-black text-[12px] font-semibold hover:brightness-110 transition-colors cursor-pointer min-w-[88px]"
                >
                  {copiedKey === 'env' ? 'Copied ✓' : 'Copy'}
                </button>
              </div>

              <pre className="font-mono text-[11px] leading-[1.65] p-5 overflow-x-auto text-[#9A9996] whitespace-pre-wrap break-words max-h-[460px]">
                {ENV_EXAMPLE_TEMPLATE}
              </pre>

              <div className="px-5 pb-5">
                <div className="rounded-xl bg-[#0A0A0B] border border-[#232326] p-4">
                  <p className="text-[11px] font-semibold text-white mb-2 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#FFE600]" />
                    <span>Install steps</span>
                  </p>
                  <div className="font-mono text-[11px] text-[#6B6A68] space-y-1.5">
                    <p>1. npm i express razorpay jsonwebtoken bullmq ioredis</p>
                    <p>2. Add routes to server/index.js</p>
                    <p>3. Set webhook in Shopify Partners: orders/create</p>
                    <p>
                      4. Add &lt;script
                      src=&quot;https://checkout.razorpay.com/v1/checkout.js&quot;&gt;&lt;/script&gt;
                    </p>
                    <p>5. Deploy • Test OAuth with .myshopify.com store</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Footer ── */}
        <footer className="mt-12 flex flex-wrap items-center justify-between gap-3 text-[11px] text-[#6B6A68] font-mono border-t border-[#141416] pt-6">
          <span>
            Built for PandaPraise • Global Standard • Dark #0A0A0B / Raised #141416 / Accent #FFE600
          </span>
          <span>
            JWT + HMAC + Razorpay sig verified • Production-ready copy-paste
          </span>
        </footer>
      </main>

      {/* ── Animated Floating Toast Notifications ── */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-2 pointer-events-none">
        {toasts.map((toast, idx) => (
          <div
            key={idx}
            className="pointer-events-auto px-4 py-2 rounded-full bg-[#FFE600] text-black text-[13px] font-semibold shadow-[0_8px_24px_rgba(0,0,0,0.5)] animate-in fade-in slide-in-from-bottom-2 duration-200"
          >
            {toast}
          </div>
        ))}
      </div>
    </div>
  );
};
