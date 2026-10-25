import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  SERVER_JS_TEMPLATE,
  ENV_TEMPLATE,
  TEMPLATE_JSON,
  SHOPIFY_FLOW_JSON,
} from './whatsappTemplates';

type TabId = 'server' | 'env' | 'template' | 'flow';
type ViewMode = 'code' | 'preview' | 'simulator';

export const WhatsAppApiStepStudio: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabId>('server');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [tabTick, setTabTick] = useState(0);
  const [viewMode, setViewMode] = useState<ViewMode>('code');
  const preRef = useRef<HTMLPreElement>(null);

  // Live test simulator state
  const [simPhone, setSimPhone] = useState('+91 98765 43210');
  const [simName, setSimName] = useState('Aarav');
  const [simProduct, setSimProduct] = useState('The Cozy Hoodie');
  const [simOrderId, setSimOrderId] = useState('#1042');
  const [simResponse, setSimResponse] = useState<any>(null);
  const [isSending, setIsSending] = useState(false);

  const copyToClipboard = (text: string, key: string) => {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand('copy');
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    } catch (e) {
      console.error('Failed to copy', e);
    }
    document.body.removeChild(textarea);
  };

  const handleTabChange = (tab: TabId) => {
    setActiveTab(tab);
    setTabTick((p) => p + 1);
  };

  const handleSimulateSend = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);
    setSimResponse(null);

    setTimeout(() => {
      // Normalize phone logic
      let p = simPhone.replace(/[\s\-\(\)\.]/g, '');
      if (p.startsWith('00')) p = '+' + p.slice(2);
      if (p.startsWith('0') && !p.startsWith('+')) p = p.slice(1);
      if (/^\d{10}$/.test(p)) p = '+91' + p;
      if (/^91\d{10}$/.test(p)) p = '+' + p;

      const mockMsgId = 'wamid.HBgL' + Math.random().toString(36).substring(2, 10).toUpperCase() + 'A1B2C3D4';

      setSimResponse({
        success: true,
        messageId: mockMsgId,
        to: p,
        template: 'video_review_reward_7day',
        customerName: simName,
        productName: simProduct,
        orderId: simOrderId,
        status: 'delivered',
        rewardOffer: '₹100 Cashback via RazorpayX',
        nextAction: 'auto-followup in 24h if no reply',
        timestamp: new Date().toISOString(),
      });
      setIsSending(false);
    }, 450);
  };

  const getActiveCode = () => {
    switch (activeTab) {
      case 'server':
        return SERVER_JS_TEMPLATE;
      case 'env':
        return ENV_TEMPLATE;
      case 'template':
        return TEMPLATE_JSON;
      case 'flow':
        return SHOPIFY_FLOW_JSON;
    }
  };

  const getCodeLineCount = () => {
    switch (activeTab) {
      case 'server':
        return `${SERVER_JS_TEMPLATE.split('\n').length} lines`;
      case 'env':
        return '6 vars';
      case 'template':
      case 'flow':
        return 'JSON spec';
    }
  };

  return (
    <div className="min-h-screen bg-[#fafaf7] dark:bg-[#0e0e10] text-zinc-900 dark:text-zinc-100 flex flex-col font-mono selection:bg-[#c6ff00] selection:text-black">
      {/* Top Header */}
      <header className="sticky top-0 z-30 bg-[#fafaf7]/90 dark:bg-[#0e0e10]/90 border-b border-[#e8e5dc] dark:border-[#2a2a2e] backdrop-blur-xl">
        <div className="max-w-[1280px] mx-auto px-5 md:px-8 h-[64px] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              to="/dashboard"
              className="w-8 h-8 rounded-[8px] bg-zinc-900 text-white dark:bg-white dark:text-black flex items-center justify-center font-bold text-[14px] hover:scale-105 transition-transform"
            >
              P
            </Link>
            <div className="flex items-baseline gap-2">
              <span className="font-serif text-[20px] leading-none tracking-tight font-bold">
                PandaPraise
              </span>
              <span className="text-[10px] tracking-widest uppercase px-2 py-0.5 rounded-full bg-[#c6ff00] text-black font-bold">
                Step 1 • API
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            <div className="hidden lg:flex items-center gap-2 text-[11px] text-zinc-500">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Razorpay Integrated • WhatsApp Cloud v20.0</span>
            </div>

            {/* View Mode Switcher */}
            <div className="flex items-center bg-zinc-200 dark:bg-zinc-800 p-0.5 rounded-full text-[11px]">
              <button
                type="button"
                onClick={() => setViewMode('code')}
                className={`px-3 py-1 rounded-full font-medium transition ${
                  viewMode === 'code'
                    ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-sm'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                }`}
              >
                Spec &amp; Code
              </button>
              <button
                type="button"
                onClick={() => setViewMode('preview')}
                className={`px-3 py-1 rounded-full font-medium transition ${
                  viewMode === 'preview'
                    ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-sm'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                }`}
              >
                WhatsApp Preview
              </button>
              <button
                type="button"
                onClick={() => setViewMode('simulator')}
                className={`px-3 py-1 rounded-full font-medium transition ${
                  viewMode === 'simulator'
                    ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-sm'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                }`}
              >
                Test Endpoint
              </button>
            </div>

            <button
              type="button"
              onClick={() => copyToClipboard(SERVER_JS_TEMPLATE, 'header')}
              className="h-9 px-4 rounded-full bg-zinc-900 text-white text-[12px] font-medium tracking-wide hover:bg-black transition-colors dark:bg-white dark:text-black flex items-center gap-1.5 shadow-sm"
            >
              {copiedKey === 'header' ? 'COPIED ✓' : 'COPY SERVER.JS'}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-[1280px] mx-auto w-full px-5 md:px-8 py-6 md:py-10 flex-1 grid grid-cols-1 lg:grid-cols-[330px_1fr] gap-6 md:gap-8 items-start">
        {/* Left Sidebar / Spec Overview */}
        <div className="flex flex-col gap-6">
          <div>
            <h1 className="font-serif text-[42px] md:text-[50px] leading-[0.92] tracking-[-0.03em] font-normal">
              WhatsApp
              <br />
              send-template
              <br />
              <span className="italic opacity-60">API for rewards.</span>
            </h1>
            <p className="mt-4 text-[13px] leading-6 text-zinc-600 dark:text-zinc-400 max-w-[32ch]">
              One file. Express + WhatsApp Cloud. Validates E.164, normalizes Indian +91 numbers, retries 429, handles template errors. Ready for Shopify Flow via{' '}
              <code className="bg-zinc-200 dark:bg-zinc-800 px-1.5 py-0.5 rounded text-[11px] text-zinc-900 dark:text-zinc-200">
                x-api-key
              </code>
              .
            </p>
          </div>

          {/* Endpoint Spec Card */}
          <div className="rounded-[16px] border border-[#e8e5dc] dark:border-[#2a2a2e] bg-white dark:bg-[#161618] p-4 flex flex-col gap-4 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-[11px] tracking-widest uppercase font-bold text-zinc-700 dark:text-zinc-300">
                Endpoint Spec
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 font-bold">
                POST
              </span>
            </div>

            <div className="space-y-3 text-[12px]">
              <div className="flex flex-col gap-1">
                <span className="text-zinc-500 uppercase text-[10px] tracking-wide">
                  Route
                </span>
                <code className="text-[12px] font-bold text-zinc-900 dark:text-zinc-100 break-all bg-zinc-100 dark:bg-zinc-900 p-1.5 rounded">
                  /api/v1/whatsapp/send-template
                </code>
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-zinc-500 uppercase text-[10px] tracking-wide">
                  Auth Header
                </span>
                <code className="bg-zinc-100 dark:bg-zinc-800/60 p-1.5 rounded text-[11px] text-zinc-800 dark:text-zinc-300 font-mono">
                  x-api-key: sk_live_...
                </code>
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-zinc-500 uppercase text-[10px] tracking-wide">
                  Body Parameters
                </span>
                <div className="bg-zinc-100 dark:bg-[#1e1e20] rounded-[10px] p-3 text-[11px] leading-5 text-zinc-700 dark:text-zinc-300 font-mono space-y-1">
                  <div>
                    <span className="opacity-60">customerPhone</span>{' '}
                    <span className="text-red-500 font-bold">*</span>{' '}
                    <span className="text-emerald-600 dark:text-emerald-400">"+91..."</span>
                  </div>
                  <div>
                    <span className="opacity-60">customerName</span>{' '}
                    <span>"Aarav"</span>
                  </div>
                  <div>
                    <span className="opacity-60">productName</span>{' '}
                    <span>"The Cozy Hoodie"</span>
                  </div>
                  <div>
                    <span className="opacity-60">orderId</span>{' '}
                    <span className="text-red-500 font-bold">*</span>{' '}
                    <span>"#1042"</span>
                  </div>
                  <div>
                    <span className="opacity-60">shopDomain</span>{' '}
                    <span>"store.myshopify.com"</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-zinc-500 uppercase text-[10px] tracking-wide">
                  Success Response
                </span>
                <div className="bg-[#0e0e10] text-[#c6ff00] rounded-[10px] p-3 text-[11px] leading-5 font-mono overflow-x-auto">
                  {'{ success: true, messageId: "wamid...", nextAction: "auto-followup in 24h if no reply" }'}
                </div>
              </div>
            </div>
          </div>

          {/* Flow Logic Lime Card */}
          <div className="rounded-[16px] border border-[#c6ff00]/40 bg-[#c6ff00] text-black p-4 shadow-sm">
            <div className="text-[11px] tracking-widest uppercase font-bold mb-2">
              Flow Logic
            </div>
            <ol className="space-y-2 text-[12px] leading-5 list-decimal list-inside font-medium">
              <li>Shopify fulfillment → 7 day delay (Flow)</li>
              <li>Flow → POST this endpoint with customer phone</li>
              <li>
                We send <code className="bg-black/10 px-1 py-0.5 rounded text-[11px]">video_review_reward_7day</code> template
              </li>
              <li>
                If no reply in 24h → cron hits <code className="bg-black/10 px-1 py-0.5 rounded text-[11px]">/followup</code>
              </li>
              <li>Webhook reply → Step 2 (collect video)</li>
            </ol>
          </div>

          {/* Value Props Pills */}
          <div className="flex flex-col gap-2 text-[11px] text-zinc-600 dark:text-zinc-400">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-white dark:bg-[#161618] border border-[#e8e5dc] dark:border-[#2a2a2e] flex items-center justify-center font-bold text-[10px]">
                1
              </span>
              <span>429 retry with exponential backoff</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-white dark:bg-[#161618] border border-[#e8e5dc] dark:border-[#2a2a2e] flex items-center justify-center font-bold text-[10px]">
                2
              </span>
              <span>Indian number auto-normalization</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-white dark:bg-[#161618] border border-[#e8e5dc] dark:border-[#2a2a2e] flex items-center justify-center font-bold text-[10px]">
                3
              </span>
              <span>Template approval JSON included</span>
            </div>
          </div>
        </div>

        {/* Right Main Stage: Code Inspector / Phone Simulator / Test Dispatcher */}
        <div className="flex flex-col rounded-[20px] border border-[#232326] bg-[#0e0e10] overflow-hidden shadow-[0_20px_60px_-20px_rgba(0,0,0,0.5)] min-h-[680px]">
          {/* Stage Header with Tabs */}
          <div className="flex items-center justify-between px-4 md:px-5 h-[52px] border-b border-[#1e1e20] bg-[#161618] gap-2">
            {viewMode === 'code' ? (
              <div className="flex items-center gap-1 p-1 rounded-full bg-[#0e0e10] border border-[#232326] max-w-full overflow-x-auto">
                {(
                  [
                    { id: 'server', label: 'server.js' },
                    { id: 'env', label: '.env' },
                    { id: 'template', label: 'template.json' },
                    { id: 'flow', label: 'flow.json' },
                  ] as const
                ).map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => handleTabChange(t.id)}
                    className={`px-3 h-7 rounded-full text-[11px] tracking-wide transition-all shrink-0 font-medium ${
                      activeTab === t.id
                        ? 'bg-white text-black shadow-sm font-bold'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            ) : viewMode === 'preview' ? (
              <span className="text-[12px] font-bold text-zinc-300 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#25D366]" />
                WhatsApp Cloud Customer Preview (Hinglish Template)
              </span>
            ) : (
              <span className="text-[12px] font-bold text-[#c6ff00] flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#c6ff00] animate-ping" />
                Live API Test Dispatcher
              </span>
            )}

            <div className="flex items-center gap-2">
              <div className="hidden md:flex items-center gap-1.5 text-[10px] text-zinc-500">
                <span className="w-2 h-2 rounded-full bg-zinc-700" />
                <span className="w-2 h-2 rounded-full bg-zinc-700" />
                <span className="w-2 h-2 rounded-full bg-[#c6ff00]" />
              </div>

              {viewMode === 'code' && (
                <button
                  type="button"
                  onClick={() => copyToClipboard(getActiveCode(), activeTab)}
                  className="h-8 px-3.5 rounded-full bg-[#c6ff00] text-black text-[11px] font-bold hover:bg-[#d4ff4d] transition-colors flex items-center gap-1"
                >
                  {copiedKey === activeTab ? 'COPIED ✓' : 'COPY'}
                </button>
              )}
            </div>
          </div>

          {/* View Mode 1: Code Viewer */}
          {viewMode === 'code' && (
            <div className="relative flex-1 flex flex-col overflow-hidden">
              <div className="flex-1 overflow-auto p-4 md:p-6">
                <pre
                  ref={preRef}
                  key={tabTick}
                  className="text-[11px] md:text-[12px] leading-[1.7] text-[#e4e4e7] whitespace-pre-wrap break-words font-mono"
                >
                  <code>{getActiveCode()}</code>
                </pre>
              </div>

              {/* Bottom Sticky Status Bar */}
              <div className="sticky bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-[#0e0e10] via-[#0e0e10]/95 to-transparent pointer-events-none">
                <div className="flex items-center justify-between pointer-events-auto">
                  <div className="flex items-center gap-2 text-[10px] text-zinc-500 bg-[#161618] border border-[#232326] rounded-full px-3 h-7">
                    <span>Node 18+</span>
                    <span className="opacity-30">•</span>
                    <span>Express 4.x</span>
                    <span className="opacity-30">•</span>
                    <span className="hidden md:inline">Antigravity Ready</span>
                  </div>
                  <div className="text-[10px] text-zinc-500 font-mono">
                    {getCodeLineCount()}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* View Mode 2: Live WhatsApp Phone Simulator */}
          {viewMode === 'preview' && (
            <div className="flex-1 p-6 flex flex-col items-center justify-center bg-[#0b141a]/90">
              <div className="w-full max-w-[360px] rounded-[36px] border-4 border-zinc-700 bg-[#efeae2] dark:bg-[#0b141a] overflow-hidden shadow-2xl flex flex-col">
                {/* Phone Top Bar */}
                <div className="bg-[#008069] text-white px-4 py-3 flex items-center justify-between shadow">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center font-bold text-xs">
                      PP
                    </div>
                    <div>
                      <div className="text-xs font-bold leading-none">PandaPraise Store</div>
                      <div className="text-[10px] text-white/80 leading-none mt-1">
                        Verified Business Account
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <span>📞</span>
                    <span>⋮</span>
                  </div>
                </div>

                {/* Chat Bubble Area */}
                <div className="p-4 space-y-3 flex-1 min-h-[380px] flex flex-col justify-end bg-repeat" style={{ backgroundImage: 'radial-gradient(rgba(0,0,0,0.06) 1px, transparent 1px)', backgroundSize: '16px 16px' }}>
                  {/* Customer WhatsApp Bubble */}
                  <div className="bg-white dark:bg-[#1f2c34] text-zinc-900 dark:text-zinc-100 rounded-2xl rounded-tl-sm p-3.5 shadow-md border border-black/5 text-[12px] leading-relaxed space-y-2">
                    <div className="font-bold text-[#008069] dark:text-[#25D366] text-[11px] uppercase tracking-wide">
                      Thanks for buying {simProduct}!
                    </div>
                    <p className="text-[12px]">
                      Hi <span className="font-semibold">{simName}</span>,
                      <br /><br />
                      Loved <span className="font-semibold">{simProduct}</span>? Record a 15-sec video review &amp; get <span className="font-bold text-emerald-600 dark:text-[#25D366]">₹100 cashback via RazorpayX</span> instantly.
                      <br /><br />
                      Your review helps others shop better. Takes less than a minute!
                    </p>
                    <div className="text-[10px] text-zinc-500 pt-1 border-t border-black/5 dark:border-white/5 flex items-center justify-between">
                      <span>Offer valid for 7 days from delivery</span>
                      <span className="text-[9px]">10:42 AM</span>
                    </div>
                  </div>

                  {/* Quick Action Buttons */}
                  <div className="space-y-1.5 pt-1">
                    <button
                      type="button"
                      onClick={() => alert('Simulating customer selecting: 📹 Send Video Review')}
                      className="w-full py-2 px-3 rounded-xl bg-white dark:bg-[#1f2c34] hover:bg-emerald-50 dark:hover:bg-[#2a3942] border border-[#25D366]/40 text-[#008069] dark:text-[#25D366] text-xs font-bold transition flex items-center justify-center gap-2 shadow-sm"
                    >
                      📹 Send Video Review
                    </button>
                    <button
                      type="button"
                      onClick={() => alert('Customer selected: Not now')}
                      className="w-full py-1.5 px-3 rounded-xl bg-white/70 dark:bg-[#1f2c34]/70 hover:bg-white dark:hover:bg-[#2a3942] border border-black/10 dark:border-white/10 text-zinc-500 dark:text-zinc-400 text-xs transition flex items-center justify-center"
                    >
                      Not now
                    </button>
                    <a
                      href="#rewards"
                      onClick={(e) => {
                        e.preventDefault();
                        alert(`See Reward Info URL:\nhttps://pandapraise.in/rewards?type=video&order=${simOrderId}`);
                      }}
                      className="w-full py-1.5 px-3 rounded-xl bg-white/70 dark:bg-[#1f2c34]/70 hover:bg-white dark:hover:bg-[#2a3942] border border-black/10 dark:border-white/10 text-blue-600 dark:text-blue-400 text-xs transition flex items-center justify-center gap-1"
                    >
                      🔗 See Reward Info
                    </a>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* View Mode 3: Live API Test Dispatcher */}
          {viewMode === 'simulator' && (
            <div className="flex-1 p-6 flex flex-col gap-6 overflow-y-auto">
              <div className="bg-[#161618] border border-[#232326] rounded-xl p-5">
                <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#c6ff00]" />
                  Simulate Inbound POST Request
                </h3>
                <p className="text-xs text-zinc-400 mb-4">
                  Test the exact payload validation, Indian phone number normalization, and response format.
                </p>

                <form onSubmit={handleSimulateSend} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] text-zinc-400 uppercase mb-1">
                      Customer Phone (Supports raw, 10-digit, or +91)
                    </label>
                    <input
                      type="text"
                      value={simPhone}
                      onChange={(e) => setSimPhone(e.target.value)}
                      className="w-full bg-[#0e0e10] border border-[#2a2a2e] text-white px-3 py-2 rounded-lg text-xs font-mono focus:border-[#c6ff00] outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-zinc-400 uppercase mb-1">
                      Customer First Name
                    </label>
                    <input
                      type="text"
                      value={simName}
                      onChange={(e) => setSimName(e.target.value)}
                      className="w-full bg-[#0e0e10] border border-[#2a2a2e] text-white px-3 py-2 rounded-lg text-xs font-mono focus:border-[#c6ff00] outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-zinc-400 uppercase mb-1">
                      Product Name
                    </label>
                    <input
                      type="text"
                      value={simProduct}
                      onChange={(e) => setSimProduct(e.target.value)}
                      className="w-full bg-[#0e0e10] border border-[#2a2a2e] text-white px-3 py-2 rounded-lg text-xs font-mono focus:border-[#c6ff00] outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-zinc-400 uppercase mb-1">
                      Shopify Order ID
                    </label>
                    <input
                      type="text"
                      value={simOrderId}
                      onChange={(e) => setSimOrderId(e.target.value)}
                      className="w-full bg-[#0e0e10] border border-[#2a2a2e] text-white px-3 py-2 rounded-lg text-xs font-mono focus:border-[#c6ff00] outline-none"
                      required
                    />
                  </div>

                  <div className="md:col-span-2 flex justify-end">
                    <button
                      type="submit"
                      disabled={isSending}
                      className="px-5 py-2.5 rounded-full bg-[#c6ff00] text-black font-bold text-xs hover:bg-[#d4ff4d] transition-all disabled:opacity-50 flex items-center gap-2"
                    >
                      {isSending ? 'Simulating WhatsApp Dispatch...' : 'Dispatch Test POST'}
                    </button>
                  </div>
                </form>
              </div>

              {simResponse && (
                <div className="bg-[#161618] border border-[#232326] rounded-xl p-5 space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-emerald-400">
                    <span>HTTP 200 OK — Template Dispatched</span>
                    <span className="text-zinc-500 font-mono">18ms</span>
                  </div>
                  <pre className="bg-[#0e0e10] p-4 rounded-lg text-[11px] leading-5 text-[#c6ff00] font-mono overflow-x-auto">
                    {JSON.stringify(simResponse, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Bottom Footer Bar */}
      <footer className="mt-auto border-t border-[#e8e5dc] dark:border-[#2a2a2e] py-4 px-5 md:px-8 bg-[#fafaf7] dark:bg-[#0e0e10]">
        <div className="max-w-[1280px] mx-auto flex flex-col md:flex-row gap-3 md:items-center justify-between text-[11px] text-zinc-500">
          <div className="flex items-center gap-3">
            <span className="px-2.5 py-1 rounded-full bg-white dark:bg-[#161618] border border-[#e8e5dc] dark:border-[#2a2a2e] text-zinc-700 dark:text-zinc-300 font-mono">
              npm i express dotenv axios
            </span>
            <span className="hidden md:inline font-mono">
              → node server.js → POST /api/v1/whatsapp/send-template
            </span>
          </div>
          <div className="flex items-center gap-2.5">
            <span>Step 1 of 3</span>
            <span className="w-16 h-1.5 rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden flex">
              <span className="w-1/3 bg-[#c6ff00] h-full" />
            </span>
            <span className="text-zinc-900 dark:text-zinc-100 font-bold">
              WhatsApp reward ask
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
};
