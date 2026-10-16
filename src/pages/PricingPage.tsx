import { useState, useEffect } from 'react';
import {
  Check,
  Minus,
  Globe,
  Crown,
  ArrowRight,
  ChevronDown,
  Loader2,
  CheckCircle2,
  CreditCard,
  QrCode,
  Building2,
  X,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { usePageSeo } from '../lib/seo';
import { useAuth } from '../context/AuthContext';

declare global {
  interface Window {
    Razorpay?: any;
  }
}

export type Currency = 'INR' | 'USD';
export type BillingCycle = 'annual' | 'monthly';
export type PlanId = 'starter' | 'pro' | 'agency' | 'lifetime';

export interface PlanConfig {
  id: PlanId;
  name: string;
  badge: string;
  description: string;
  popular?: boolean;
  pricing: {
    INR: { monthly: number; annual: number; annualTotal: number };
    USD: { monthly: number; annual: number; annualTotal: number };
  };
  ctaText: string;
  features: string[];
}

// Dynamically load the official Razorpay SDK script
function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') {
      resolve(false);
      return;
    }
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export const PLANS: PlanConfig[] = [
  {
    id: 'starter',
    name: 'Starter',
    badge: 'FREE FOREVER',
    description: 'Essential social proof collection for early projects and solo makers.',
    pricing: {
      INR: { monthly: 0, annual: 0, annualTotal: 0 },
      USD: { monthly: 0, annual: 0, annualTotal: 0 },
    },
    ctaText: 'Start Free Forever',
    features: [
      'Up to 10 Text & 2 Video Testimonials',
      '1 Standard Collection Form Link',
      'Basic Wall of Love & Carousel Embed',
      '1-Click Social Media Sharing',
      'Bank-grade SSL & Cloudflare Edge CDN',
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    badge: 'MOST POPULAR',
    description: 'For growing SaaS startups, creators, and D2C brands scaling conversions.',
    popular: true,
    pricing: {
      INR: { monthly: 799, annual: 399, annualTotal: 4788 },
      USD: { monthly: 29, annual: 19, annualTotal: 228 },
    },
    ctaText: 'Upgrade to Pro',
    features: [
      'Unlimited Text, Audio & Video Testimonials',
      'Remove "Powered by PandaPraise" Branding',
      'Automated Review Drips (Email & WhatsApp)',
      'PandaPraise Chrome Extension Pro Included',
      'Custom Subdomain & Custom Domain Forms',
      'AI Sentiment Analysis & Spam Moderation',
      'Priority Email & Chat Support',
    ],
  },
  {
    id: 'agency',
    name: 'Agency & Scale',
    badge: 'MULTI-WORKSPACE & API',
    description: 'For agencies and high-volume teams managing multiple brands & custom pipelines.',
    pricing: {
      INR: { monthly: 2499, annual: 1499, annualTotal: 17988 },
      USD: { monthly: 79, annual: 49, annualTotal: 588 },
    },
    ctaText: 'Get Agency Scale',
    features: [
      'Everything in Pro + 5 Dedicated Workspaces',
      '5 Team Member Seats & Role Permissions',
      'Inbound Webhooks & Developer REST API',
      'White-Glove Custom CSS Widget Setup (Free)',
      'Dedicated Account Manager & SLA',
      'Custom B2B GST / Tax Invoicing',
    ],
  },
];

export const COMPARISON_ROWS = [
  { label: 'Text Testimonials', starter: '10 proofs', pro: 'Unlimited', agency: 'Unlimited' },
  { label: 'Video & Audio Testimonials', starter: '2 proofs', pro: 'Unlimited', agency: 'Unlimited' },
  { label: 'Dedicated Workspaces', starter: '1 Workspace', pro: '1 Workspace', agency: '5 Workspaces' },
  { label: 'Remove PandaPraise Branding', starter: false, pro: true, agency: true },
  { label: 'Chrome Extension Pro (WhatsApp Clipper)', starter: false, pro: true, agency: true },
  { label: 'Automated Email & WhatsApp Drips', starter: false, pro: true, agency: true },
  { label: 'Custom Domain & Subdomain', starter: false, pro: true, agency: true },
  { label: 'AI Sentiment & Spam Shield', starter: false, pro: true, agency: true },
  { label: 'Developer REST API & Webhooks', starter: false, pro: false, agency: true },
  { label: 'White-Glove Custom CSS Engineering', starter: false, pro: false, agency: true },
];

export const FAQS = [
  {
    q: 'How does the Founding Member Lifetime Pass work?',
    a: 'Pay once and unlock lifetime Pro access for your workspace plus extra bonus workspaces, with zero recurring monthly or annual fees. Limited strictly to our first 50 founding supporters.',
  },
  {
    q: 'Can I pay in INR with UPI/RuPay or in USD with an International Card?',
    a: 'Yes! Toggle between INR (₹) and USD ($) at the top of the page. Our Razorpay checkout supports Instant UPI (GPay, PhonePe, Paytm), RuPay, Netbanking, and all global Visa, Mastercard, and Amex cards.',
  },
  {
    q: 'Do you provide a compliant GST Invoice for 18% Input Tax Credit?',
    a: 'Yes. Immediately after your payment is verified via Razorpay, you can enter your company GSTIN inside your Billing & Plans dashboard to download compliant B2B tax invoices.',
  },
  {
    q: 'What happens if I start on the Free Forever plan and upgrade later?',
    a: 'All your collected text and video testimonials, collection links, and embedded Wall of Love widgets remain 100% intact. Upgrading simply removes the PandaPraise badge and unlocks unlimited quotas immediately.',
  },
  {
    q: 'Can I cancel my monthly or annual subscription anytime?',
    a: 'Absolutely. There is zero lock-in. You can manage or cancel your subscription anytime directly inside your workspace Billing & Plans tab.',
  },
];

export function PricingPage() {
  usePageSeo({
    title: 'PandaPraise Pricing | Simple, Transparent Plans for High-Converting Social Proof',
    description:
      'Explore PandaPraise pricing: Starter free forever, Pro for scaling SaaS, and Agency multi-workspace. Instant UPI, RuPay, global cards, and GST invoicing.',
  });

  const { user } = useAuth();
  const [currency, setCurrency] = useState<Currency>('INR');
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('annual');
  const [loadingPlan, setLoadingPlan] = useState<PlanId | null>(null);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [checkoutBanner, setCheckoutBanner] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  interface SandboxModalData {
    orderId: string;
    amount: number;
    currency: Currency;
    planId: PlanId;
    planLabel: string;
  }

  const [sandboxModal, setSandboxModal] = useState<SandboxModalData | null>(null);
  const [sandboxSimulating, setSandboxSimulating] = useState<boolean>(false);
  const [sandboxMethod, setSandboxMethod] = useState<'upi' | 'card' | 'netbanking'>('upi');

  // Auto-detect location: default to INR for Indian timezones, USD for worldwide
  useEffect(() => {
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
      if (tz.includes('Calcutta') || tz.includes('Kolkata') || tz.includes('Asia/Colombo')) {
        setCurrency('INR');
      } else {
        setCurrency('USD');
      }
    } catch {
      setCurrency('INR');
    }
  }, []);

  const RAZORPAY_KEY_ID =
    (import.meta as any).env?.VITE_RAZORPAY_KEY_ID || 'rzp_live_YOUR_KEY_HERE';
  // Replace with your Firebase Cloud Functions base URL or Cloudflare Worker fallback
  const rawApiBase =
    (import.meta as any).env?.VITE_FIREBASE_API_BASE ||
    (import.meta as any).env?.VITE_API_BASE_URL ||
    '';
  const FIREBASE_API_BASE = rawApiBase.replace(/\/$/, '');

  const formatMoney = (amount: number) => {
    if (currency === 'INR') {
      return `₹${amount.toLocaleString('en-IN')}`;
    }
    return `$${amount.toLocaleString('en-US')}`;
  };

  // REAL RAZORPAY CHECKOUT PIPELINE FOR FIREBASE & CLOUDFLARE
  const handleRealRazorpayCheckout = async (
    planId: PlanId,
    planLabel: string,
    amountMajorUnits: number
  ) => {
    if (planId === 'starter') {
      window.location.href = '/signup';
      return;
    }

    setCheckoutBanner(null);
    setLoadingPlan(planId);

    try {
      const amountInSubunits = amountMajorUnits * 100; // e.g. ₹399 -> 39900 paise
      const userId = user?.id || localStorage.getItem('pandapraise_user_id') || 'guest_user';

      // Step 1: Request an official order_id from backend
      const orderEndpoint = FIREBASE_API_BASE ? `${FIREBASE_API_BASE}/createRazorpayOrder` : '/createRazorpayOrder';
      const orderRes = await fetch(orderEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: amountInSubunits,
          currency,
          planId,
          userId,
        }),
      });

      const orderData = await orderRes.json();
      if (!orderRes.ok) {
        throw new Error(orderData.error || 'Failed to create Razorpay secure order.');
      }

      // If backend is running in Sandbox mode or has no live keys, open Sandbox Checkout window immediately
      if (orderData.sandbox) {
        setLoadingPlan(null);
        setSandboxModal({
          orderId: orderData.orderId,
          amount: amountMajorUnits,
          currency,
          planId,
          planLabel,
        });
        return;
      }

      const sdkLoaded = await loadRazorpayScript();
      if (!sdkLoaded) {
        // Fallback to sandbox modal if SDK blocked by browser or offline
        setLoadingPlan(null);
        setSandboxModal({
          orderId: orderData.orderId,
          amount: amountMajorUnits,
          currency,
          planId,
          planLabel,
        });
        return;
      }

      // Step 2: Open the official Razorpay Modal
      const options = {
        key: orderData.keyId || RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'PandaPraise',
        description: `${planLabel} (${planId === 'lifetime' ? 'Lifetime Pass' : billingCycle})`,
        order_id: orderData.orderId,
        theme: { color: '#7C3AED' },
        handler: async (response: {
          razorpay_order_id: string;
          razorpay_payment_id: string;
          razorpay_signature: string;
        }) => {
          // Step 3: Verify HMAC signature on backend & update Firestore workspace
          const verifyEndpoint = FIREBASE_API_BASE ? `${FIREBASE_API_BASE}/verifyRazorpayPayment` : '/verifyRazorpayPayment';
          const verifyRes = await fetch(verifyEndpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              planId,
              userId,
            }),
          });

          if (verifyRes.ok) {
            setCheckoutBanner({
              type: 'success',
              message: `Payment successful! ID: ${response.razorpay_payment_id}. Upgrading your workspace...`,
            });
            setTimeout(() => {
              window.location.href = '/?upgraded=true';
            }, 2000);
          } else {
            setCheckoutBanner({
              type: 'error',
              message: 'Payment received by Razorpay, but database verification failed. Contact support.',
            });
          }
          setLoadingPlan(null);
        },
        modal: {
          ondismiss: () => {
            setLoadingPlan(null);
          },
        },
      };

      try {
        const rzp = new window.Razorpay(options);
        rzp.open();
      } catch (sdkError: any) {
        console.warn('Razorpay SDK modal open failed, launching Sandbox fallback:', sdkError);
        setLoadingPlan(null);
        setSandboxModal({
          orderId: orderData.orderId,
          amount: amountMajorUnits,
          currency,
          planId,
          planLabel,
        });
      }
    } catch (err: any) {
      setCheckoutBanner({
        type: 'error',
        message: err.message || 'Checkout initialization failed.',
      });
      setLoadingPlan(null);
    }
  };

  const handleSimulateSandboxPayment = async () => {
    if (!sandboxModal) return;
    setSandboxSimulating(true);

    try {
      const userId = user?.id || localStorage.getItem('pandapraise_user_id') || 'guest_user';
      const verifyEndpoint = FIREBASE_API_BASE ? `${FIREBASE_API_BASE}/verifyRazorpayPayment` : '/verifyRazorpayPayment';
      const verifyRes = await fetch(verifyEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          razorpay_order_id: sandboxModal.orderId,
          razorpay_payment_id: `pay_sandbox_${Date.now()}`,
          razorpay_signature: `sandbox_sig_${Date.now()}`,
          planId: sandboxModal.planId,
          userId,
        }),
      });

      if (verifyRes.ok) {
        setSandboxModal(null);
        setCheckoutBanner({
          type: 'success',
          message: `Payment verified in Sandbox Mode! Upgrading your workspace to ${sandboxModal.planLabel}...`,
        });
        setTimeout(() => {
          window.location.href = '/?upgraded=true';
        }, 1800);
      } else {
        const errData = await verifyRes.json().catch(() => ({}));
        throw new Error(errData.error || 'Payment verification failed in database');
      }
    } catch (err: any) {
      setCheckoutBanner({
        type: 'error',
        message: err.message || 'Sandbox simulation failed.',
      });
    } finally {
      setSandboxSimulating(false);
    }
  };

  const lifetimePrice = currency === 'INR' ? 4999 : 149;

  return (
    <div className="min-h-screen bg-[#07090E] text-slate-100 font-sans antialiased selection:bg-purple-600 selection:text-white">
      {/* ================= NAVBAR ================= */}
      <header className="sticky top-0 z-40 backdrop-blur-md bg-[#07090E]/85 border-b border-white/10">
        <div className="max-w-7xl mx-auto h-16 px-6 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-purple-600 flex items-center justify-center text-white font-extrabold text-sm shadow-lg shadow-purple-600/30">
              🐼
            </div>
            <span className="font-bold text-lg tracking-tight text-white">
              PandaPraise
            </span>
          </a>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
            <a href="#features" className="hover:text-white transition-colors">
              Features
            </a>
            <a href="#comparison" className="hover:text-white transition-colors">
              Compare Plans
            </a>
            <a href="#faq" className="hover:text-white transition-colors">
              FAQ
            </a>
          </nav>

          <div className="flex items-center gap-4">
            <a
              href="/login"
              className="text-sm font-medium text-slate-300 hover:text-white transition-colors"
            >
              Sign In
            </a>
            <a
              href="/signup"
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-sm font-semibold shadow-lg shadow-purple-600/25 transition-all"
            >
              Get Started Free
            </a>
          </div>
        </div>
      </header>

      {/* ================= HERO SECTION ================= */}
      <section className="relative pt-16 pb-12 px-6 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[320px] bg-purple-600/15 blur-[130px] pointer-events-none rounded-full" />

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-slate-300 mb-6">
            {currency === 'INR' ? (
              <>
                <span>🇮🇳</span>
                <span>Built for Indian Businesses, SaaS & Creators</span>
              </>
            ) : (
              <>
                <Globe className="w-3.5 h-3.5 text-purple-400" />
                <span>Trusted by High-Converting SaaS Teams & Creators Worldwide</span>
              </>
            )}
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-[1.1]">
            Simple, transparent pricing.
          </h1>

          <p className="mt-5 text-base sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Flexible monthly and annual plans for growing teams — or lock in lifetime access with our Founding Member pass.
          </p>

          <p className="mt-4 text-xs font-medium text-slate-400 flex flex-wrap items-center justify-center gap-x-3 gap-y-1">
            {currency === 'INR' ? (
              <>
                <span>UPI</span>
                <span>•</span>
                <span>RuPay</span>
                <span>•</span>
                <span>Netbanking</span>
                <span>•</span>
                <span className="text-purple-300">Instant GST Invoice</span>
              </>
            ) : (
              <>
                <span>Global Cards</span>
                <span>•</span>
                <span>Apple Pay</span>
                <span>•</span>
                <span>Instant B2B Tax Receipts</span>
              </>
            )}
          </p>

          {/* Currency and Billing Controls */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <div className="inline-flex items-center p-1 rounded-full bg-white/5 border border-white/10">
              <button
                type="button"
                id="currency-toggle-inr"
                onClick={() => setCurrency('INR')}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  currency === 'INR'
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                🇮🇳 INR (₹)
              </button>
              <button
                type="button"
                id="currency-toggle-usd"
                onClick={() => setCurrency('USD')}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  currency === 'USD'
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Globe className="w-3.5 h-3.5" />
                <span>USD ($) Worldwide</span>
              </button>
            </div>

            <div className="inline-flex items-center p-1 rounded-full bg-white/5 border border-white/10">
              <button
                type="button"
                id="billing-toggle-annual"
                onClick={() => setBillingCycle('annual')}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                  billingCycle === 'annual'
                    ? 'bg-white text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <span>Annual Billing</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/20 text-emerald-600">
                  Save 50%
                </span>
              </button>
              <button
                type="button"
                id="billing-toggle-monthly"
                onClick={() => setBillingCycle('monthly')}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  billingCycle === 'monthly'
                    ? 'bg-white text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Monthly Billing
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ================= NOTIFICATION BANNER ================= */}
      {checkoutBanner && (
        <div className="max-w-5xl mx-auto px-6 mb-6">
          <div
            className={`p-4 rounded-2xl border flex items-center justify-between gap-4 text-sm font-medium ${
              checkoutBanner.type === 'success'
                ? 'bg-emerald-950/70 border-emerald-500/40 text-emerald-200'
                : 'bg-red-950/70 border-red-500/40 text-red-200'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-5 h-5 shrink-0" />
              <span>{checkoutBanner.message}</span>
            </div>
            <button
              type="button"
              onClick={() => setCheckoutBanner(null)}
              className="text-xs font-bold opacity-75 hover:opacity-100 cursor-pointer"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* ================= PRICING CARDS ================= */}
      <section className="max-w-7xl mx-auto px-6 pb-12">
        <div id="pricing-plans-grid" className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
          {PLANS.map((plan) => {
            const priceObj = plan.pricing[currency];
            const displayedMonthly =
              billingCycle === 'annual' ? priceObj.annual : priceObj.monthly;
            const checkoutChargeAmount =
              plan.id === 'starter'
                ? 0
                : billingCycle === 'annual'
                ? priceObj.annualTotal
                : priceObj.monthly;

            const isBusy = loadingPlan === plan.id;

            return (
              <div
                key={plan.id}
                id={`plan-card-${plan.id}`}
                className={`relative rounded-3xl p-7 flex flex-col justify-between transition-all ${
                  plan.popular
                    ? 'bg-gradient-to-b from-[#151126] to-[#0D0F17] border-2 border-purple-500 shadow-2xl shadow-purple-900/20'
                    : 'bg-[#0D0F17] border border-white/10'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-purple-600 text-white text-[11px] font-extrabold tracking-wider uppercase shadow-lg">
                    Most Popular • Best Subscription
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-3 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase bg-white/5 text-purple-300 border border-white/10">
                      {plan.badge}
                    </span>
                    {plan.id !== 'starter' && billingCycle === 'annual' && (
                      <span className="text-xs font-bold text-emerald-400">
                        Save 50%
                      </span>
                    )}
                  </div>

                  <h2 className="text-2xl font-bold text-white mt-4">{plan.name}</h2>
                  <p className="text-xs text-slate-400 mt-1.5 min-h-[34px] leading-relaxed">
                    {plan.description}
                  </p>

                  <div className="mt-6 pb-6 border-b border-white/10">
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
                        {formatMoney(displayedMonthly)}
                      </span>
                      <span className="text-xs font-medium text-slate-400">
                        {plan.id === 'starter' ? '/ forever' : '/month'}
                      </span>
                    </div>

                    <p className="text-xs mt-2 font-medium text-slate-400">
                      {plan.id === 'starter' ? (
                        'No credit card required'
                      ) : billingCycle === 'annual' ? (
                        <span className="text-emerald-400">
                          {currency === 'INR'
                            ? `₹${priceObj.annualTotal.toLocaleString('en-IN')} billed annually`
                            : `$${priceObj.annualTotal} billed annually`}
                        </span>
                      ) : (
                        'Billed monthly • Cancel anytime'
                      )}
                    </p>
                  </div>

                  <ul className="mt-6 space-y-3 text-xs sm:text-sm text-slate-300">
                    {plan.features.map((feat, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5 stroke-[2.5]" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-8 pt-4">
                  <button
                    type="button"
                    id={`btn-checkout-${plan.id}`}
                    disabled={isBusy}
                    onClick={() =>
                      handleRealRazorpayCheckout(
                        plan.id,
                        `PandaPraise ${plan.name}`,
                        checkoutChargeAmount
                      )
                    }
                    className={`w-full py-3.5 px-5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      plan.popular
                        ? 'bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-600/30'
                        : plan.id === 'starter'
                        ? 'bg-white/10 hover:bg-white/15 text-white'
                        : 'bg-white text-slate-950 hover:bg-slate-200'
                    }`}
                  >
                    {isBusy ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Opening Razorpay...</span>
                      </>
                    ) : (
                      <>
                        <span>{plan.ctaText}</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>

                  <p className="mt-3 text-[11px] text-center text-slate-500">
                    {plan.id === 'starter'
                      ? 'Instant workspace setup in 30 seconds'
                      : '⚡ Instant Activation • UPI & RuPay • GST Invoice'}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ================= FOUNDING MEMBER LIFETIME PASS BANNER ================= */}
      <section className="max-w-7xl mx-auto px-6 pb-16">
        <div id="plan-card-lifetime" className="rounded-3xl bg-gradient-to-r from-amber-500/10 via-[#14111D] to-purple-600/10 border-2 border-amber-400/50 p-7 sm:p-9 shadow-2xl relative overflow-hidden">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div className="space-y-3 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/15 border border-amber-400/30 text-amber-300 text-xs font-extrabold uppercase tracking-wider">
                <Crown className="w-3.5 h-3.5" />
                <span>Most Popular • Lifetime Pass • Limited Deal</span>
              </div>

              <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
                Founding Member Pass
              </h3>

              <p className="text-sm text-slate-300 leading-relaxed">
                Pay once. Use Panda Praise for life without recurring fees. Zero recurring monthly charges ever. Lifetime access to all present & future features.
              </p>

              <div className="pt-2 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs font-semibold text-amber-200/90">
                <span className="flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-amber-400" />Unlimited Testimonials
                </span>
                <span className="flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-amber-400" />Wall of Love & Widgets
                </span>
                <span className="flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-amber-400" />Instant GST Invoice
                </span>
              </div>
            </div>

            <div className="bg-[#0B0D14] border border-amber-400/30 rounded-2xl p-6 lg:min-w-[300px] text-center shrink-0">
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400">
                One-Time Payment
              </span>
              <div className="text-4xl font-extrabold text-white mt-1">
                {formatMoney(lifetimePrice)}
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Zero recurring fees • Lifetime license
              </p>

              <button
                type="button"
                id="btn-checkout-lifetime"
                disabled={loadingPlan === 'lifetime'}
                onClick={() =>
                  handleRealRazorpayCheckout(
                    'lifetime',
                    'PandaPraise Founding Member Lifetime Pass',
                    lifetimePrice
                  )
                }
                className="mt-5 w-full py-3.5 px-5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-400/20 transition-all cursor-pointer"
              >
                {loadingPlan === 'lifetime' ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Opening Razorpay...</span>
                  </>
                ) : (
                  <>
                    <span>Get Lifetime Access</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ================= COMPARISON TABLE ================= */}
      <section id="comparison" className="max-w-5xl mx-auto px-6 pb-20">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-white">
            Compare plans side-by-side
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Transparent quotas with zero hidden fees.
          </p>
        </div>

        <div className="rounded-3xl bg-[#0D0F17] border border-white/10 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 bg-white/[0.02] text-xs uppercase tracking-wider text-slate-400">
                  <th className="p-4 sm:p-5 font-bold">Feature</th>
                  <th className="p-4 sm:p-5 font-bold text-center">Starter</th>
                  <th className="p-4 sm:p-5 font-bold text-center text-purple-400">Pro</th>
                  <th className="p-4 sm:p-5 font-bold text-center text-amber-300">Agency</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10 text-xs sm:text-sm">
                {COMPARISON_ROWS.map((row, i) => (
                  <tr key={i} className="hover:bg-white/[0.02]">
                    <td className="p-4 sm:p-5 font-medium text-slate-200">{row.label}</td>
                    {(['starter', 'pro', 'agency'] as const).map((tierKey) => {
                      const val = row[tierKey];
                      return (
                        <td key={tierKey} className="p-4 sm:p-5 text-center">
                          {typeof val === 'boolean' ? (
                            val ? (
                              <Check className="w-4 h-4 text-emerald-400 mx-auto stroke-[2.5]" />
                            ) : (
                              <Minus className="w-4 h-4 text-slate-600 mx-auto" />
                            )
                          ) : (
                            <span className="font-semibold text-slate-200">{val}</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ================= FAQ SECTION ================= */}
      <section id="faq" className="max-w-3xl mx-auto px-6 pb-20">
        <h2 className="text-2xl sm:text-3xl font-bold text-center text-white mb-8">
          Frequently Asked Questions
        </h2>

        <div className="space-y-3">
          {FAQS.map((item, idx) => {
            const isOpen = openFaqIndex === idx;
            return (
              <div
                key={idx}
                className="rounded-2xl bg-[#0D0F17] border border-white/10 overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                  className="w-full px-6 py-4 text-left flex items-center justify-between gap-4 font-semibold text-sm text-white hover:bg-white/[0.02] transition-colors cursor-pointer"
                >
                  <span>{item.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 shrink-0 transition-transform ${
                      isOpen ? 'rotate-180 text-purple-400' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-6 pb-5 text-xs sm:text-sm text-slate-400 leading-relaxed border-t border-white/5 pt-3">
                    {item.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* ================= FOOTER ================= */}
      <footer className="border-t border-white/10 py-8 px-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span>🐼</span>
            <span className="font-semibold text-slate-300">Panda Praise</span>
            <span>•</span>
            <span>© 2026 Panda Praise Ltd. All rights reserved.</span>
          </div>
          <div className="flex items-center gap-6">
            <a href="/" className="hover:text-slate-300">
              Home
            </a>
            <a href="/terms" className="hover:text-slate-300">
              Terms of Service
            </a>
            <a href="/privacy" className="hover:text-slate-300">
              Privacy Policy
            </a>
          </div>
        </div>
      </footer>

      {/* ================= SANDBOX PAYMENT WINDOW MODAL ================= */}
      {sandboxModal && (
        <div
          id="sandbox-payment-modal"
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200"
        >
          <div className="bg-[#0D0F17] border border-purple-500/40 rounded-3xl max-w-lg w-full shadow-2xl shadow-purple-900/30 overflow-hidden relative">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-[#17112B] via-[#10121C] to-[#17112B] p-6 border-b border-white/10 flex items-start justify-between">
              <div>
                <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 text-[10px] font-extrabold uppercase tracking-wider mb-2">
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  <span>Sandbox Test Mode</span>
                </div>
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <span>🐼</span>
                  <span>PandaPraise Checkout</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  {sandboxModal.planLabel} • Order: <span className="font-mono text-purple-300">{sandboxModal.orderId}</span>
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSandboxModal(null)}
                className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Total Due Row */}
            <div className="px-6 py-4 bg-white/[0.02] border-b border-white/5 flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Amount Due</span>
              <div className="text-2xl font-extrabold text-white">
                {formatMoney(sandboxModal.amount)}
              </div>
            </div>

            {/* Payment Method Tabs */}
            <div className="p-6 space-y-5">
              <div className="grid grid-cols-3 gap-2 p-1 bg-white/5 rounded-2xl border border-white/10">
                <button
                  type="button"
                  onClick={() => setSandboxMethod('upi')}
                  className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    sandboxMethod === 'upi'
                      ? 'bg-purple-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <QrCode className="w-3.5 h-3.5" />
                  <span>Instant UPI</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSandboxMethod('card')}
                  className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    sandboxMethod === 'card'
                      ? 'bg-purple-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>Cards</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSandboxMethod('netbanking')}
                  className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    sandboxMethod === 'netbanking'
                      ? 'bg-purple-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Building2 className="w-3.5 h-3.5" />
                  <span>Netbanking</span>
                </button>
              </div>

              {/* Method Details */}
              {sandboxMethod === 'upi' && (
                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 space-y-3">
                  <div className="flex items-center justify-between text-xs text-slate-300">
                    <span className="font-semibold">Simulated UPI Apps</span>
                    <span className="text-[11px] text-emerald-400 flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" /> Zero Friction
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-lg bg-white/10 text-xs font-mono text-purple-300">
                      GPay
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-white/10 text-xs font-mono text-purple-300">
                      PhonePe
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-white/10 text-xs font-mono text-purple-300">
                      Paytm
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-white/10 text-xs font-mono text-purple-300">
                      BHIM UPI
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Razorpay UPI simulator test ID: <span className="text-white font-mono">success@razorpay</span>. Click below to simulate instant UPI approval & webhook settlement.
                  </p>
                </div>
              )}

              {sandboxMethod === 'card' && (
                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-300">
                    <span className="font-semibold">Test RuPay / Visa / Mastercard</span>
                    <span className="text-[11px] text-purple-300 font-mono">CVV: 123</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-black/40 border border-white/10 font-mono text-xs text-slate-200">
                    4111 •••• •••• 1111 (Exp: 12/28)
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Instant 3D-Secure simulation with automatic OTP bypass in Sandbox Mode.
                  </p>
                </div>
              )}

              {sandboxMethod === 'netbanking' && (
                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 space-y-2">
                  <div className="text-xs text-slate-300 font-semibold">Simulated Banks</div>
                  <div className="grid grid-cols-2 gap-2 text-xs text-slate-300 font-medium">
                    <span className="p-2 rounded-xl bg-white/5 border border-white/5 text-center">HDFC Bank</span>
                    <span className="p-2 rounded-xl bg-white/5 border border-white/5 text-center">ICICI Bank</span>
                    <span className="p-2 rounded-xl bg-white/5 border border-white/5 text-center">State Bank of India</span>
                    <span className="p-2 rounded-xl bg-white/5 border border-white/5 text-center">Axis Bank</span>
                  </div>
                </div>
              )}

              {/* Action Button */}
              <button
                type="button"
                id="btn-simulate-sandbox-pay"
                disabled={sandboxSimulating}
                onClick={handleSimulateSandboxPayment}
                className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-sm shadow-xl shadow-purple-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-75"
              >
                {sandboxSimulating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Verifying Sandbox Payment...</span>
                  </>
                ) : (
                  <>
                    <span>Simulate Successful Payment ({formatMoney(sandboxModal.amount)})</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <p className="text-[10px] text-center text-slate-500 flex items-center justify-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
                <span>Simulates real Razorpay checkout & verifies backend HMAC signatures</span>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Floating Notification Toast */}
      {checkoutBanner && (
        <div className="fixed bottom-6 right-6 z-50 max-w-md w-full px-4 animate-in slide-in-from-bottom duration-300">
          <div
            className={`p-4 rounded-2xl border shadow-2xl backdrop-blur-md flex items-center justify-between gap-4 text-sm font-medium ${
              checkoutBanner.type === 'success'
                ? 'bg-emerald-950/90 border-emerald-500/50 text-emerald-200 shadow-emerald-950/50'
                : 'bg-red-950/90 border-red-500/50 text-red-200 shadow-red-950/50'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-5 h-5 shrink-0" />
              <span>{checkoutBanner.message}</span>
            </div>
            <button
              type="button"
              onClick={() => setCheckoutBanner(null)}
              className="text-xs font-bold opacity-75 hover:opacity-100 cursor-pointer"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default PricingPage;

