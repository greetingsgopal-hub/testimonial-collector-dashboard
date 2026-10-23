import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, ShoppingBag, MessageSquare, Save, Zap } from 'lucide-react';
import { WhatsAppTemplatePreview } from '../components/meta-ads/WhatsAppTemplatePreview';

export const WhatsAppShopifyOnboardingPage: React.FC = () => {
  const navigate = useNavigate();
  const [shopifyStore, setShopifyStore] = useState('ananyafashion.myshopify.com');
  const [shopifyToken, setShopifyToken] = useState('shpat_live_9482948291849182');
  const [whatsappNumber, setWhatsappNumber] = useState('+91 98765 43210');
  const [delayDays, setDelayDays] = useState(7);
  const [discountAmount, setDiscountAmount] = useState('₹100');
  const [isConnected, setIsConnected] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

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
            Whenever a customer order status changes to <strong className="text-white">Delivered + 7 Days</strong>, PandaPraise automatically sends a WhatsApp video request with an instant discount code.
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
