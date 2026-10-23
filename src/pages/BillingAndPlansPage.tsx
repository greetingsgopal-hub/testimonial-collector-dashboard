import React, { useState } from 'react';
import {
  CreditCard,
  Sparkles,
  Video,
  ShieldCheck,
  Check,
  Building2,
  Receipt,
  Info,
  Pencil,
  ExternalLink,
  Zap,
  ArrowRight,
  X,
  Loader2,
  Radio,
  FileCheck2,
  Layers,
  ShoppingBag,
  TrendingUp,
} from 'lucide-react';
import { initiateV2Checkout, V2_PLANS } from '../services/razorpayService';

export interface PaymentMethodDetails {
  type: string;
  headline: string;
  subtext: string;
}

export interface InvoiceItem {
  id: string;
  paymentId: string;
  date: string;
  amount: string;
  planName: string;
  status: 'Paid';
}

export interface BillingAndPlansPageProps {
  hideSidebar?: boolean;
  workspace?: any;
}

export default function BillingAndPlansPage({
  hideSidebar = false,
  workspace,
}: BillingAndPlansPageProps = {}) {
  const [currentPlan, setCurrentPlan] = useState<'pack_5' | 'monthly_growth' | 'none'>(() => {
    try {
      const saved = localStorage.getItem('pandapraise_v2_active_plan');
      if (saved === 'monthly_growth' || saved === 'pack_5') return saved;
    } catch {}
    return 'monthly_growth';
  });

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodDetails | null>(() => {
    try {
      const saved = localStorage.getItem('pandapraise_rzp_payment_method');
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      type: 'UPI AutoPay',
      headline: 'Google Pay (UPI / HDFC)',
      subtext: 'Auto-renews monthly via Razorpay',
    };
  });

  const [invoices, setInvoices] = useState<InvoiceItem[]>(() => {
    try {
      const saved = localStorage.getItem('pandapraise_rzp_invoices_v2');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [
      {
        id: 'INV-2026-8842',
        paymentId: 'pay_RZP914820A',
        date: '18 Oct 2026',
        amount: '₹2,999.00',
        planName: 'D2C Growth Pipeline (20 Ads)',
        status: 'Paid',
      },
      {
        id: 'INV-2026-8109',
        paymentId: 'pay_RZP749211C',
        date: '28 Sep 2026',
        amount: '₹1,500.00',
        planName: '5 Meta Ads Pack',
        status: 'Paid',
      },
    ];
  });

  const [isProcessing, setIsProcessing] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const [isEditingBilling, setIsEditingBilling] = useState(false);
  const [billingInfo, setBillingInfo] = useState(() => {
    try {
      const saved = localStorage.getItem('pandapraise_billing_info');
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      companyName: workspace?.name || 'Aesthetic D2C Apparel Pvt Ltd',
      billingEmail: 'founders@aestheticd2c.in',
      taxId: '27AABCA1234M1Z2',
      storeUrl: 'aesthetic-apparel.myshopify.com',
    };
  });
  const [formState, setFormState] = useState(billingInfo);

  const handleCheckout = async (planId: 'pack_5' | 'monthly_growth') => {
    setNotification(null);
    setIsProcessing(true);

    try {
      const result = await initiateV2Checkout(planId, {
        companyName: billingInfo.companyName,
        email: billingInfo.billingEmail,
        taxId: billingInfo.taxId,
      });

      if (result.success) {
        setCurrentPlan(planId);
        try {
          localStorage.setItem('pandapraise_v2_active_plan', planId);
        } catch {}

        const newInvoice: InvoiceItem = {
          id: result.invoiceId || `INV-2026-${Math.floor(1000 + Math.random() * 9000)}`,
          paymentId: result.paymentId || 'pay_DEMO_OK',
          date: result.date || 'Just now',
          amount: `₹${result.amount?.toLocaleString('en-IN') || (planId === 'pack_5' ? '1,500' : '2,999')}.00`,
          planName: result.planName || V2_PLANS[planId].name,
          status: 'Paid',
        };

        const updatedInvoices = [newInvoice, ...invoices];
        setInvoices(updatedInvoices);
        try {
          localStorage.setItem('pandapraise_rzp_invoices_v2', JSON.stringify(updatedInvoices));
        } catch {}

        setPaymentMethod({
          type: 'Razorpay UPI',
          headline: 'UPI / Netbanking Verified',
          subtext: planId === 'monthly_growth' ? 'Renews at ₹2,999/mo' : 'One-time Pack Activated',
        });

        setNotification({
          type: 'success',
          message: `Payment successful! Unlocked ${V2_PLANS[planId].name}. Video rendering quota updated.`,
        });
      } else {
        setNotification({
          type: 'error',
          message: result.error || 'Payment was cancelled or could not be completed.',
        });
      }
    } catch (err: any) {
      setNotification({
        type: 'error',
        message: err.message || 'Payment failed. Please try again.',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSaveBilling = (e: React.FormEvent) => {
    e.preventDefault();
    setBillingInfo(formState);
    try {
      localStorage.setItem('pandapraise_billing_info', JSON.stringify(formState));
    } catch {}
    setIsEditingBilling(false);
  };

  const mainContent = (
    <main className="flex-1 p-6 lg:p-8 max-w-6xl w-full mx-auto space-y-6">
      {notification && (
        <div
          className={`px-4 py-3 rounded-xl text-xs font-semibold flex items-center justify-between border ${
            notification.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-red-50 border-red-200 text-red-800'
          }`}
        >
          <span>{notification.message}</span>
          <button
            type="button"
            onClick={() => setNotification(null)}
            className="text-slate-500 hover:text-slate-800 font-bold ml-4"
          >
            ✕
          </button>
        </div>
      )}

      {/* HEADER BANNER */}
      <section className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-start md:items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600 shrink-0">
            <CreditCard className="w-6 h-6" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                Billing & Meta Ad Pipeline Quota
              </h1>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                {currentPlan === 'monthly_growth'
                  ? 'D2C Growth Plan (₹2,999/mo) • Active'
                  : currentPlan === 'pack_5'
                  ? '5 Meta Ads Pack (₹1,500) • Active'
                  : 'No Active Pipeline'}
              </span>
            </div>
            <p className="text-sm text-slate-500 mt-1">
              Indian Shopify D2C pricing: Turn raw WhatsApp customer videos into Meta Ads. Powered by Razorpay UPI & GST tax invoices.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="/dashboard/ads"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs shadow-sm transition-all"
          >
            <Video className="w-4 h-4 text-purple-600" />
            <span>View 15 Generated Ads</span>
          </a>
        </div>
      </section>

      {/* TOP 4 KPI CARDS */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Active Tier */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm flex flex-col justify-between min-h-[160px]">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">Current Tier</span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="my-1">
            <div className="text-xl font-bold text-slate-900 tracking-tight">
              {currentPlan === 'monthly_growth' ? 'D2C Growth Plan' : '5 Meta Ads Pack'}
            </div>
          </div>
          <div className="space-y-1.5">
            <div className="w-full h-1.5 bg-purple-100 rounded-full overflow-hidden">
              <div className="h-full w-full bg-purple-600 rounded-full" />
            </div>
            <p className="text-xs font-semibold text-purple-700 truncate">
              {currentPlan === 'monthly_growth' ? '₹2,999 / month • Renews 18 Nov' : '₹1,500 One-time • Pay per pack'}
            </p>
          </div>
        </div>

        {/* Card 2: Meta Ads Remaining */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm flex flex-col justify-between min-h-[160px]">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">Ads Generation Quota</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="my-1">
            <div className="text-xl font-bold text-slate-900 tracking-tight">
              14 / 20 Used
            </div>
          </div>
          <div className="space-y-1.5">
            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full w-[70%] bg-emerald-500 rounded-full" />
            </div>
            <p className="text-xs text-slate-500 truncate">
              6 Meta Ads remaining in this cycle
            </p>
          </div>
        </div>

        {/* Card 3: WhatsApp Ingestion */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm flex flex-col justify-between min-h-[160px]">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">WhatsApp Submissions</span>
            <div className="w-8 h-8 rounded-lg bg-green-50 text-green-600 flex items-center justify-center">
              <Radio className="w-4 h-4" />
            </div>
          </div>
          <div className="my-1">
            <div className="text-xl font-bold text-slate-900 tracking-tight">
              18 Videos
            </div>
          </div>
          <div className="space-y-1.5">
            <div className="w-full h-1.5 bg-green-100 rounded-full overflow-hidden">
              <div className="h-full w-full bg-green-600 rounded-full" />
            </div>
            <p className="text-xs text-green-700 font-medium truncate">
              92% submission rate on ₹100 coupon
            </p>
          </div>
        </div>

        {/* Card 4: Payment Instrument */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm flex flex-col justify-between min-h-[160px]">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">Razorpay Payment</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="my-1">
            <div className="text-base font-bold text-slate-900 tracking-tight truncate">
              {paymentMethod ? paymentMethod.headline : 'UPI AutoPay'}
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-slate-500 truncate">
              {paymentMethod ? paymentMethod.subtext : 'Secured with Razorpay India'}
            </p>
            <p className="text-[10px] text-slate-400 font-medium">100% Indian GST Invoiced</p>
          </div>
        </div>
      </section>

      {/* PLAN PRICING COMPARISON SECTION */}
      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Choose Your Meta Ad Pipeline Tier</h2>
          <p className="text-xs text-slate-500">
            No bloated subscriptions. Pay only for Meta ads generated from real customer WhatsApp reviews.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* PLAN 1: 5 ADS PACK */}
          <div
            className={`rounded-2xl p-6 bg-white border-2 flex flex-col justify-between transition-all ${
              currentPlan === 'pack_5'
                ? 'border-purple-600 shadow-md ring-2 ring-purple-100'
                : 'border-slate-200 hover:border-slate-300 shadow-sm'
            }`}
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 uppercase tracking-wide">
                  Pay-per-pack
                </span>
                {currentPlan === 'pack_5' && (
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-purple-50 text-purple-700 border border-purple-200">
                    Active
                  </span>
                )}
              </div>

              <div className="mt-4">
                <h3 className="text-xl font-bold text-slate-900">5 Meta Ads Pack</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Perfect for testing your first batch of UGC ads on Meta without recurring commitments.
                </p>
              </div>

              <div className="mt-5 flex items-baseline gap-1.5">
                <span className="text-3xl font-extrabold text-slate-900">₹1,500</span>
                <span className="text-xs text-slate-500 font-medium">one-time payment (+ GST)</span>
              </div>
              <p className="text-[11px] text-purple-700 font-semibold mt-1">
                Only ₹300 per Meta ad creative
              </p>

              <ul className="mt-6 space-y-3 text-xs text-slate-700 border-t border-slate-100 pt-5">
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-purple-600 shrink-0 stroke-[2.5]" />
                  <span><strong>5 Raw Customer Videos Processed</strong></span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-purple-600 shrink-0 stroke-[2.5]" />
                  <span><strong>15 Variations:</strong> 3 Viral D2C Hooks burned per video</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-purple-600 shrink-0 stroke-[2.5]" />
                  <span>Hormozi Word-by-Word Animated Captions</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-purple-600 shrink-0 stroke-[2.5]" />
                  <span>9:16 (Reel/Story), 1:1 (Feed), 4:5 (Catalog) Formats</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-purple-600 shrink-0 stroke-[2.5]" />
                  <span>One-click ZIP Download with Adscriptly library</span>
                </li>
              </ul>
            </div>

            <button
              type="button"
              disabled={isProcessing}
              onClick={() => handleCheckout('pack_5')}
              className="mt-6 w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-semibold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Opening Razorpay...</span>
                </>
              ) : (
                <>
                  <span>Buy 5 Ads Pack — ₹1,500</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>

          {/* PLAN 2: D2C GROWTH PIPELINE (RECOMMENDED) */}
          <div
            className={`rounded-2xl p-6 bg-gradient-to-b from-[#FAF7FF] to-white border-2 flex flex-col justify-between transition-all relative ${
              currentPlan === 'monthly_growth'
                ? 'border-purple-600 shadow-lg ring-2 ring-purple-200'
                : 'border-purple-300 hover:border-purple-400 shadow-sm'
            }`}
          >
            <div className="absolute -top-3 left-6">
              <span className="px-3 py-1 rounded-full text-[11px] font-extrabold bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-sm tracking-wide">
                🔥 MOST POPULAR FOR SHOPIFY D2C
              </span>
            </div>

            <div>
              <div className="flex items-center justify-between pt-1">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-800 uppercase tracking-wide">
                  Automated Pipeline
                </span>
                {currentPlan === 'monthly_growth' && (
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Current Plan
                  </span>
                )}
              </div>

              <div className="mt-4">
                <h3 className="text-xl font-bold text-slate-900">D2C Growth Pipeline</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Fully automated from Shopify delivery to Meta-ready ads every single month.
                </p>
              </div>

              <div className="mt-5 flex items-baseline gap-1.5">
                <span className="text-3xl font-extrabold text-slate-900">₹2,999</span>
                <span className="text-xs text-slate-500 font-medium">/ month (+ GST)</span>
              </div>
              <p className="text-[11px] text-emerald-700 font-semibold mt-1">
                20 Meta Ads included • ₹149 per ad
              </p>

              <ul className="mt-6 space-y-3 text-xs text-slate-700 border-t border-purple-100 pt-5">
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 stroke-[2.5]" />
                  <span><strong>20 Meta Ads / Month (60 Hook Variations)</strong></span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 stroke-[2.5]" />
                  <span><strong>Automated WhatsApp Trigger</strong> (Shopify Delivered + 7d)</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 stroke-[2.5]" />
                  <span><strong>Auto ₹100 Coupon Delivery</strong> on video response</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 stroke-[2.5]" />
                  <span><strong>48-Hour Polite WhatsApp Reminder Drips</strong></span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 stroke-[2.5]" />
                  <span><strong>Push to Shopify Video Reviews:</strong> Embed on PDPs in 1-click</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 stroke-[2.5]" />
                  <span>Dedicated D2C Growth Slack & Priority GPU Render</span>
                </li>
              </ul>
            </div>

            <button
              type="button"
              disabled={isProcessing}
              onClick={() => handleCheckout('monthly_growth')}
              className="mt-6 w-full py-2.5 px-4 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-semibold text-xs shadow-md shadow-purple-200 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Opening Razorpay...</span>
                </>
              ) : (
                <>
                  <span>Subscribe to Pipeline — ₹2,999/mo</span>
                  <Zap className="w-3.5 h-3.5 fill-current" />
                </>
              )}
            </button>
          </div>
        </div>
      </section>

      {/* LOWER SECTION: BILLING INFO & TAX INVOICES */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: GST Profile */}
        <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">GSTIN & D2C Brand Profile</h3>
                <p className="text-xs text-slate-500 mt-0.5">Compliant Indian B2B invoicing for 18% GST input credit.</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setFormState(billingInfo);
                setIsEditingBilling(true);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-purple-600 hover:bg-purple-50 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Pencil className="w-3.5 h-3.5" />
              <span>Edit Details</span>
            </button>
          </div>

          <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-200/60">
              <span className="block text-[10px] font-bold tracking-wider text-slate-400 uppercase">Registered Brand</span>
              <span className="mt-1 block text-xs font-bold text-slate-900 break-words">{billingInfo.companyName}</span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-200/60">
              <span className="block text-[10px] font-bold tracking-wider text-slate-400 uppercase">GSTIN (Input Credit)</span>
              <span className="mt-1 block text-xs font-bold text-slate-900 font-mono">{billingInfo.taxId || 'Not provided'}</span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-200/60">
              <span className="block text-[10px] font-bold tracking-wider text-slate-400 uppercase">Shopify Store</span>
              <span className="mt-1 block text-xs font-bold text-slate-900 font-mono truncate">{billingInfo.storeUrl}</span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-200/60">
              <span className="block text-[10px] font-bold tracking-wider text-slate-400 uppercase">Billing Email</span>
              <span className="mt-1 block text-xs font-bold text-slate-900 truncate">{billingInfo.billingEmail}</span>
            </div>
          </div>

          <div className="mt-4 p-3 rounded-xl bg-purple-50/60 border border-purple-100 flex items-center gap-2.5">
            <TrendingUp className="w-4 h-4 text-purple-600 shrink-0" />
            <p className="text-xs text-purple-900 leading-tight">
              Average ROI on PandaPraise UGC ads: <strong>+466% ROAS lift</strong> compared to static product images.
            </p>
          </div>
        </div>

        {/* Right: Invoices */}
        <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                <Receipt className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Tax Invoices & Receipts</h3>
                <p className="text-xs text-slate-500 mt-0.5">Download GST compliant receipts generated via Razorpay.</p>
              </div>
            </div>

            <div className="mt-5 space-y-2.5">
              {invoices.map((inv) => (
                <div
                  key={inv.id}
                  className="flex items-center justify-between p-3 rounded-xl border border-slate-200/70 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                      <FileCheck2 className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900">{inv.planName}</p>
                      <p className="text-[11px] text-slate-500">
                        {inv.id} • {inv.date} ({inv.paymentId})
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-slate-900">{inv.amount}</span>
                    <span className="px-2 py-0.5 text-[10px] font-semibold bg-emerald-50 text-emerald-700 rounded-full">
                      {inv.status}
                    </span>
                    <button
                      type="button"
                      onClick={() => alert(`Downloading GST Invoice ${inv.id} for ${inv.amount}`)}
                      title="Download Invoice"
                      className="text-slate-400 hover:text-purple-600 cursor-pointer"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-5 rounded-xl bg-slate-50 border border-slate-200/70 px-4 py-3 flex items-center gap-3">
            <Info className="w-4 h-4 text-slate-500 shrink-0" />
            <p className="text-xs text-slate-600 leading-snug">
              Razorpay generates valid GST tax invoices with 18% IGST/CGST split for instant input tax claims.
            </p>
          </div>
        </div>
      </section>
    </main>
  );

  const editBillingModal = isEditingBilling && (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-slate-200 max-w-md w-full p-6 shadow-xl">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <h3 className="text-base font-bold text-slate-900">Edit D2C Brand Billing Details</h3>
          <button
            type="button"
            onClick={() => setIsEditingBilling(false)}
            className="text-slate-400 hover:text-slate-600 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSaveBilling} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Brand / Company Name
            </label>
            <input
              type="text"
              required
              value={formState.companyName}
              onChange={(e) => setFormState({ ...formState, companyName: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-purple-600"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              GSTIN (Tax ID for Input Credit)
            </label>
            <input
              type="text"
              value={formState.taxId}
              onChange={(e) => setFormState({ ...formState, taxId: e.target.value })}
              placeholder="e.g. 27AABCA1234M1Z2"
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm font-mono focus:outline-none focus:border-purple-600"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Shopify Store Domain
            </label>
            <input
              type="text"
              value={formState.storeUrl}
              onChange={(e) => setFormState({ ...formState, storeUrl: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm font-mono focus:outline-none focus:border-purple-600"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Invoicing Email
            </label>
            <input
              type="email"
              required
              value={formState.billingEmail}
              onChange={(e) => setFormState({ ...formState, billingEmail: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-purple-600"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsEditingBilling(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-purple-600 hover:bg-purple-700 text-white cursor-pointer"
            >
              Save Details
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  if (hideSidebar) {
    return (
      <div className="font-sans antialiased w-full">
        {mainContent}
        {editBillingModal}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F6FA] text-slate-900 flex font-sans antialiased">
      {/* V2 DASHBOARD SIDEBAR */}
      <aside className="w-64 bg-white border-r border-slate-200/80 flex flex-col justify-between shrink-0 select-none">
        <div>
          <div className="h-16 px-6 flex items-center gap-3 border-b border-slate-100">
            <div className="w-8 h-8 rounded-xl bg-purple-600 flex items-center justify-center text-white font-black text-sm">
              🐼
            </div>
            <div>
              <span className="font-bold text-base tracking-tight text-slate-900">
                PandaPraise
              </span>
              <span className="ml-1.5 px-1.5 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-700">
                V2
              </span>
            </div>
          </div>

          <nav className="p-3 space-y-1 text-sm font-medium text-slate-600">
            <a
              href="/dashboard"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 transition-colors"
            >
              <Video className="w-4 h-4 text-slate-400" />
              <span>WhatsApp Queue</span>
            </a>

            <a
              href="/dashboard/ads"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 transition-colors"
            >
              <Sparkles className="w-4 h-4 text-purple-600" />
              <span>Meta Ads Library</span>
            </a>

            <a
              href="/dashboard/connect"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 transition-colors"
            >
              <ShoppingBag className="w-4 h-4 text-slate-400" />
              <span>Shopify Onboarding</span>
            </a>

            <div className="pt-3 mt-3 border-t border-slate-100 space-y-1">
              <a
                href="/billing"
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-purple-50 text-purple-700 font-semibold shadow-xs"
              >
                <CreditCard className="w-4 h-4 text-purple-600" />
                <span>Billing & Plans</span>
              </a>

              <a
                href="/"
                className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs text-slate-400 hover:text-slate-600"
              >
                <span>← Back to Landing Page</span>
              </a>
            </div>
          </nav>
        </div>

        <div className="p-4 border-t border-slate-100">
          <div className="flex items-center gap-3 p-2 rounded-xl bg-slate-50 border border-slate-200/60">
            <div className="w-8 h-8 rounded-lg bg-purple-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
              {billingInfo.companyName.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-slate-900 truncate">{billingInfo.companyName}</p>
              <p className="text-[10px] text-slate-500 font-mono truncate">{billingInfo.storeUrl}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* MAIN VIEW */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white border-b border-slate-200/80 px-8 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5 text-sm">
            <span className="font-bold text-slate-900">Billing & Pipeline Plans</span>
            <span className="text-slate-300">•</span>
            <span className="inline-flex items-center gap-1.5 text-slate-500 text-xs font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              Razorpay Secured (INR)
            </span>
          </div>
        </header>

        {mainContent}
      </div>

      {editBillingModal}
    </div>
  );
}

export { BillingAndPlansPage };
