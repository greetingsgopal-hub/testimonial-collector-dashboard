import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  CheckCircle2,
  ShoppingBag,
  MessageSquare,
  Save,
  Zap,
  Download,
  Copy,
  Check,
  FileCode,
  Mail,
} from 'lucide-react';
import { WhatsAppTemplatePreview } from '../components/meta-ads/WhatsAppTemplatePreview';

const SHOPIFY_FLOW_JSON = `{
  "name": "PandaPraise - Ask Video Review on Day 7",
  "trigger": {
    "type": "shopify/fulfillment/order_fulfilled",
    "description": "When order is fulfilled/delivered"
  },
  "conditions": [
    {
      "field": "order.tags",
      "operator": "NOT_CONTAINS",
      "value": "video_asked"
    }
  ],
  "actions": [
    {
      "type": "delay",
      "duration": "7_days",
      "description": "Wait 7 days for customer to use product"
    },
    {
      "type": "http_request",
      "method": "POST",
      "url": "https://pandapraise.com/api/v1/whatsapp/send-template",
      "headers": {
        "Content-Type": "application/json",
        "x-api-key": "{{YOUR_PANDAPRAISE_API_KEY}}"
      },
      "body": {
        "customer_phone": "{{order.customer.phone}}",
        "customer_name": "{{order.customer.firstName}}",
        "product_name": "{{order.lineItems.first.productTitle}}",
        "store_name": "{{shop.name}}",
        "reward_amount": "100",
        "order_id": "{{order.id}}",
        "template_name": "video_review_reward_7day"
      }
    },
    {
      "type": "add_tags",
      "tags": ["video_asked", "pandapraise_pending"]
    }
  ],
  "second_flow": {
    "name": "PandaPraise - Reminder 48h Later",
    "trigger": {
      "type": "tag_added",
      "tag": "pandapraise_pending"
    },
    "actions": [
      {
        "type": "delay",
        "duration": "2_days"
      },
      {
        "type": "condition",
        "field": "order.tags",
        "operator": "CONTAINS",
        "value": "video_received",
        "if_true": "STOP",
        "if_false": {
          "type": "http_request",
          "method": "POST",
          "url": "https://pandapraise.com/api/v1/whatsapp/send-template",
          "headers": {
            "Content-Type": "application/json",
            "x-api-key": "{{YOUR_PANDAPRAISE_API_KEY}}"
          },
          "body": {
            "customer_phone": "{{order.customer.phone}}",
            "customer_name": "{{order.customer.firstName}}",
            "template_name": "video_reminder_48h"
          }
        }
      }
    ]
  }
}`;

export const WhatsAppShopifyOnboardingPage: React.FC = () => {
  const navigate = useNavigate();
  const [shopifyStore, setShopifyStore] = useState('ananyafashion.myshopify.com');
  const [shopifyToken, setShopifyToken] = useState('shpat_live_9482948291849182');
  const [whatsappNumber, setWhatsappNumber] = useState('+91 98765 43210');
  const [delayDays, setDelayDays] = useState(7);
  const [discountAmount, setDiscountAmount] = useState('₹100');
  const [isConnected, setIsConnected] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Flow tab switcher: 'automated' vs 'manual'
  const [flowMode, setFlowMode] = useState<'automated' | 'manual'>('automated');
  const [copiedFlow, setCopiedFlow] = useState(false);

  const handleCopyFlow = () => {
    navigator.clipboard.writeText(SHOPIFY_FLOW_JSON);
    setCopiedFlow(true);
    setTimeout(() => setCopiedFlow(false), 2000);
  };

  const handleDownloadFlow = () => {
    const blob = new Blob([SHOPIFY_FLOW_JSON], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'shopify-flow-pandapraise.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setIsConnected(true);
    }, 600);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans p-6 sm:p-10">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Shopify Webhook Listening
          </div>
        </div>

        {/* Header Title */}
        <div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight flex items-center gap-3">
            <span>Connect Shopify &amp; WhatsApp Cloud</span>
          </h1>
          <p className="text-slate-400 text-base mt-2 max-w-2xl leading-relaxed">
            Whenever a customer order status changes to <strong className="text-white">Delivered + 7 Days</strong>, PandaPraise automatically triggers the Hinglish WhatsApp video request with an instant discount code.
          </p>
        </div>

        {/* Two-Column Grid: Form Left, WhatsApp Mockup Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Column 1: Configuration Form */}
          <form onSubmit={handleSave} className="lg:col-span-7 bg-slate-900 border border-slate-800 p-6 sm:p-8 rounded-3xl shadow-xl space-y-6">
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
                <ShoppingBag className="w-5 h-5 text-emerald-400" />
                1. Shopify Store Connection
              </h2>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Shopify Store Domain
                </label>
                <input
                  type="text"
                  value={shopifyStore}
                  onChange={(e) => setShopifyStore(e.target.value)}
                  placeholder="yourstore.myshopify.com"
                  className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono text-sm focus:border-emerald-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Shopify Admin API Access Token
                </label>
                <input
                  type="password"
                  value={shopifyToken}
                  onChange={(e) => setShopifyToken(e.target.value)}
                  placeholder="shpat_..."
                  className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono text-sm focus:border-emerald-500 focus:outline-none"
                  required
                />
                <span className="text-[11px] text-slate-500 mt-1 block">
                  Requires <code>read_orders</code> and <code>read_fulfillments</code> permissions.
                </span>
              </div>
            </div>

            <div className="space-y-4 pt-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
                <MessageSquare className="w-5 h-5 text-emerald-400" />
                2. WhatsApp Business API Trigger
              </h2>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  WhatsApp Business Sender Number
                </label>
                <input
                  type="text"
                  value={whatsappNumber}
                  onChange={(e) => setWhatsappNumber(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono text-sm focus:border-emerald-500 focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    Trigger Delay Post-Delivery
                  </label>
                  <select
                    value={delayDays}
                    onChange={(e) => setDelayDays(Number(e.target.value))}
                    className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:border-emerald-500 focus:outline-none"
                  >
                    <option value={3}>3 Days (Fast)</option>
                    <option value={5}>5 Days</option>
                    <option value={7}>7 Days (Recommended)</option>
                    <option value={10}>10 Days</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    Video Incentive Coupon
                  </label>
                  <input
                    type="text"
                    value={discountAmount}
                    onChange={(e) => setDiscountAmount(e.target.value)}
                    placeholder="₹100"
                    className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Status Feedback Banner */}
            {isConnected && (
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <div>
                  <span className="text-xs font-bold text-emerald-300 block">
                    Pipeline Active &amp; Verified
                  </span>
                  <p className="text-[11px] text-emerald-400/80">
                    Listening for Shopify order deliveries. Customers will be prompted automatically after {delayDays} days.
                  </p>
                </div>
              </div>
            )}

            {/* Buttons */}
            <div className="flex items-center gap-4 pt-2">
              <button
                type="submit"
                disabled={isSaving}
                className="px-6 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm flex items-center gap-2 transition shadow-lg shadow-emerald-500/30 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                {isSaving ? 'Verifying...' : 'Save & Activate Automation'}
              </button>

              <button
                type="button"
                onClick={() => navigate('/dashboard/collection')}
                className="px-5 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm transition cursor-pointer"
              >
                View Collection Queue →
              </button>
            </div>
          </form>

          {/* Column 2: Live WhatsApp Mockup Preview */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-emerald-400" />
                Customer WhatsApp Experience (3 Templates)
              </span>
              <span className="text-[10px] text-emerald-400 font-mono font-bold">40% Reply Rate</span>
            </div>

            <WhatsAppTemplatePreview
              storeName="Ananya D2C"
              sampleProduct="Floral Anarkali Kurta"
              discountAmount={discountAmount.replace(/[^0-9]/g, '') || '100'}
            />
          </div>
        </div>

        {/* ── READY-TO-IMPORT SHOPIFY FLOW & CONCIERGE MVP SECTION ── */}
        <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                  Ready-To-Import
                </span>
                <span className="text-xs text-slate-400 font-mono">Shopify Flow • Day 7 Automation</span>
              </div>
              <h2 className="text-2xl font-black text-white mt-2">
                Deploy The Auto-Trigger Flow into Shopify
              </h2>
            </div>

            {/* Mode Switcher Tabs */}
            <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded-2xl border border-slate-800">
              <button
                type="button"
                onClick={() => setFlowMode('automated')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  flowMode === 'automated'
                    ? 'bg-emerald-500 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <FileCode className="w-3.5 h-3.5" />
                Automated Mode (API)
              </button>
              <button
                type="button"
                onClick={() => setFlowMode('manual')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  flowMode === 'manual'
                    ? 'bg-purple-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Mail className="w-3.5 h-3.5" />
                Day 1 Concierge MVP (No Code)
              </button>
            </div>
          </div>

          {/* TAB 1: AUTOMATED SHOPIFY FLOW */}
          {flowMode === 'automated' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5">
                  <span className="text-emerald-400 font-bold block text-sm">Step 1: Open Shopify Flow</span>
                  <p className="text-slate-300 leading-relaxed">
                    Go to <strong>Shopify Admin</strong> ➔ <strong>Apps</strong> ➔ <strong>Flow</strong> ➔ <strong>Create Workflow</strong> ➔ Click <strong>Import</strong>.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5">
                  <span className="text-emerald-400 font-bold block text-sm">Step 2: Upload or Paste JSON</span>
                  <p className="text-slate-300 leading-relaxed">
                    Download or copy the ready-to-import Flow JSON below and paste into the Shopify Flow importer.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5">
                  <span className="text-emerald-400 font-bold block text-sm">Step 3: Update API Key</span>
                  <p className="text-slate-300 leading-relaxed">
                    Replace <code className="text-emerald-300">{"{{YOUR_PANDAPRAISE_API_KEY}}"}</code> with your key from the developer dashboard.
                  </p>
                </div>
              </div>

              {/* JSON Action Bar & Code Block */}
              <div className="rounded-2xl border border-slate-800 bg-slate-950 overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 bg-slate-900 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                    <span className="text-xs font-mono font-bold text-slate-300">shopify-flow-day7-pandapraise.json</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleCopyFlow}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 transition flex items-center gap-1.5 cursor-pointer"
                    >
                      {copiedFlow ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      {copiedFlow ? 'Copied!' : 'Copy Flow JSON'}
                    </button>
                    <button
                      type="button"
                      onClick={handleDownloadFlow}
                      className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-xs font-black text-slate-950 transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Download JSON
                    </button>
                  </div>
                </div>

                <pre className="p-4 text-xs font-mono text-slate-300 overflow-x-auto max-h-72 leading-relaxed selection:bg-emerald-500/30">
                  {SHOPIFY_FLOW_JSON}
                </pre>
              </div>

              {/* Variable Checklist */}
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 text-xs space-y-2">
                <span className="font-bold text-white block">What you need to check:</span>
                <ul className="list-disc list-inside space-y-1 text-slate-300">
                  <li><code className="text-emerald-400">{"{{YOUR_PANDAPRAISE_API_KEY}}"}</code> ➔ Replace with your active API key (starts with <code className="text-slate-400">pp_live_...</code>).</li>
                  <li><code className="text-emerald-400">https://pandapraise.com/api/v1/whatsapp/send-template</code> ➔ Your live production endpoint on Cloudflare Edge.</li>
                </ul>
              </div>
            </div>
          )}

          {/* TAB 2: DAY 1 CONCIERGE MVP */}
          {flowMode === 'manual' && (
            <div className="space-y-6">
              <div className="p-4 rounded-2xl bg-purple-950/30 border border-purple-500/30 space-y-2">
                <span className="text-xs uppercase font-bold tracking-wider text-purple-400 flex items-center gap-1.5">
                  <Mail className="w-4 h-4" />
                  Day 1 Concierge MVP — Zero Code Needed Today
                </span>
                <p className="text-xs text-purple-200/90 leading-relaxed">
                  Don't wait for Meta WhatsApp API approval or complex webhook setups. Use this <strong>internal email alert flow</strong> to validate with your first 10 Shopify stores right now. Each order takes only 30 seconds.
                </p>
              </div>

              {/* 4-Step Loop */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="w-6 h-6 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold text-xs">1</div>
                  <strong className="text-white block font-bold">Shopify Flow Email</strong>
                  <p className="text-slate-400 leading-relaxed">
                    Trigger: <strong>Order Fulfilled</strong> ➔ Delay <strong>7 Days</strong> ➔ Send internal email to you:
                    <span className="block font-mono text-[11px] text-purple-300 mt-1 bg-slate-900 p-1.5 rounded">
                      "Order &#123;&#123;order.name&#125;&#125; for &#123;&#123;order.customer.phone&#125;&#125; delivered 7 days back. Send Template 1."
                    </span>
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="w-6 h-6 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold text-xs">2</div>
                  <strong className="text-white block font-bold">30-Sec WhatsApp Send</strong>
                  <p className="text-slate-400 leading-relaxed">
                    Copy Template 1 from your phone and send to customer:
                    <span className="block text-[11px] text-slate-300 italic mt-1 bg-slate-900 p-1.5 rounded">
                      "Aapne roll-on use kiya? 1 acchi baat, 1 kharab baat 10 sec me bata do — ₹100 off!"
                    </span>
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="w-6 h-6 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold text-xs">3</div>
                  <strong className="text-white block font-bold">Run Auto-Pipeline</strong>
                  <p className="text-slate-400 leading-relaxed">
                    Save customer video to <code className="text-purple-300">/uploads/&#123;store&#125;</code> and execute Docker:
                    <span className="block font-mono text-[10px] text-emerald-400 mt-1 bg-slate-900 p-1.5 rounded">
                      docker run -v ./uploads:/app/uploads pandapraise/meta-ugc-pipeline
                    </span>
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="w-6 h-6 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold text-xs">4</div>
                  <strong className="text-white block font-bold">Deliver 5 Meta Ads</strong>
                  <p className="text-slate-400 leading-relaxed">
                    Send 5 generated 9:16 ads to store owner on WhatsApp and mark tag <code className="text-emerald-400">video_received</code> in Shopify.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── 10-MINUTE META SETUP & COPY-PASTE GUIDE ── */}
        <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                10-Minute Fast Track
              </span>
              <h2 className="text-xl font-black text-white mt-2">
                How to set up WhatsApp Templates in Meta WhatsApp Manager
              </h2>
            </div>
            <span className="text-xs text-slate-400">
              Official WhatsApp Cloud API • ~30 paise / message
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <span className="text-emerald-400 font-bold block text-sm">Step 1 • Meta Manager</span>
              <p className="text-slate-300 leading-relaxed">
                Open <strong>Meta Business Manager</strong> ➔ <strong>WhatsApp Manager</strong> ➔ <strong>Message Templates</strong>. Click <strong>Create New</strong>.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <span className="text-emerald-400 font-bold block text-sm">Step 2 • Paste Hinglish Copy</span>
              <p className="text-slate-300 leading-relaxed">
                Select Category: <strong>Marketing</strong>, Language: <strong>English / Hindi mix</strong>. Copy each template using the <strong>Copy Meta Template</strong> button above.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <span className="text-emerald-400 font-bold block text-sm">Step 3 • Shopify Flow Setup</span>
              <p className="text-slate-300 leading-relaxed">
                Order Fulfilled ➔ Delay 7 days ➔ Send Template 1 (Collection) ➔ If no reply in 48h, send Template 2 (Nudge) ➔ On reply, send Template 3 (Rights).
              </p>
            </div>
          </div>

          {/* Pro-Tip Box */}
          <div className="p-4 rounded-2xl bg-purple-950/40 border border-purple-500/30 flex items-start gap-3 text-xs">
            <span className="text-lg">🔥</span>
            <div>
              <strong className="text-purple-300 block font-bold">
                Pro Tip: "Can you complain about one thing and praise one thing?"
              </strong>
              <p className="text-purple-200/80 mt-1 leading-relaxed">
                Don't just ask "Can you give a review?". Indian shoppers love critiquing products. Asking for <em>1 acchi baat, 1 kharab baat</em> gets <strong>2x more video replies</strong> than formal English requests!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
