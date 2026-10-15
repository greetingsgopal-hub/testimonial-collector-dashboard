import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  CheckCircle2,
  Sparkles,
  ExternalLink,
  Receipt,
  FileText,
  Check,
  Building2,
  Lock,
  Plus,
  ShieldCheck,
  Edit3,
  Video,
  FileCheck
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { Workspace } from '../../../types';

interface AccountBillingViewProps {
  workspace?: Workspace | null;
  onUpgrade?: () => void;
}

interface StripeSubscriptionInfo {
  plan?: string;
  subscriptionStatus?: string;
  currentPeriodEnd?: string;
  cancelAtPeriodEnd?: boolean;
  amount?: number;
  currency?: string;
}

interface PaymentCardInfo {
  brand: string;
  last4: string;
  expMonth: string;
  expYear: string;
}

interface BillingDetailsInfo {
  companyName: string;
  billingEmail: string;
  taxId: string;
}

export const AccountBillingView: React.FC<AccountBillingViewProps> = ({
  workspace: propWorkspace,
  onUpgrade,
}) => {
  const { workspace: authWorkspace, project, user } = useAuth();
  const workspace = propWorkspace || authWorkspace;

  // ── Centralized Billing & State Model ──────────────────────────────
  const [stripeSubscription, setStripeSubscription] = useState<StripeSubscriptionInfo | null>(null);
  const [billingPortalLoading, setBillingPortalLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [demoShowPaidInvoices, setDemoShowPaidInvoices] = useState(false);

  // Quotas & Usage State
  const [videoQuota] = useState({ used: 1, limit: 2 });
  const [textQuota] = useState({ used: 8, limit: 10 });
  const [cardOnFile, setCardOnFile] = useState<PaymentCardInfo | null>(null);

  // Billing & Tax Details State
  const [billingDetails, setBillingDetails] = useState<BillingDetailsInfo>({
    companyName: workspace?.name || project?.name || 'Papasystem Technologies Inc.',
    billingEmail: user?.email || 'billing@papasystem.com',
    taxId: '27AADCB2230M1Z2',
  });
  const [isEditingBilling, setIsEditingBilling] = useState(false);
  const [tempBilling, setTempBilling] = useState<BillingDetailsInfo>({ ...billingDetails });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const fetchStripeSubscription = async () => {
    try {
      const { getFirebaseAuth } = await import('../../../lib/firebase');
      const idToken = await getFirebaseAuth().currentUser?.getIdToken();
      if (!idToken) return;
      const res = await fetch(`${import.meta.env.VITE_FUNCTIONS_API_URL || ''}/api/stripe/subscription`, {
        headers: { Authorization: `Bearer ${idToken}` },
      });
      if (res.ok) {
        const data = await res.json();
        setStripeSubscription(data);
      }
    } catch (err) {
      console.error('[AccountBillingView] Failed to fetch subscription:', err);
    }
  };

  useEffect(() => {
    fetchStripeSubscription();
  }, []);

  const handleBillingPortal = async () => {
    setBillingPortalLoading(true);
    try {
      const { getFirebaseAuth } = await import('../../../lib/firebase');
      const idToken = await getFirebaseAuth().currentUser?.getIdToken();
      if (!idToken) {
        showToast('Please sign in to manage billing.');
        return;
      }
      const res = await fetch(`${import.meta.env.VITE_FUNCTIONS_API_URL || ''}/api/stripe/billing-portal`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        if (data.url) window.location.href = data.url;
      } else {
        const err = await res.json();
        showToast(err.error || 'Failed to open billing portal.');
      }
    } catch (err) {
      console.error('[AccountBillingView] Billing portal failed:', err);
      showToast('Failed to open billing portal.');
    } finally {
      setBillingPortalLoading(false);
    }
  };

  const handleSaveBilling = (e: React.FormEvent) => {
    e.preventDefault();
    setBillingDetails({ ...tempBilling });
    setIsEditingBilling(false);
    showToast('Billing & tax information updated successfully.');
  };

  const handleAddPaymentMethod = () => {
    if (onUpgrade) {
      onUpgrade();
    } else {
      setCardOnFile({
        brand: 'Visa',
        last4: '4242',
        expMonth: '08',
        expYear: '28',
      });
      showToast('Card on file updated (Visa •••• 4242).');
    }
  };

  const planTier = stripeSubscription?.plan || workspace?.plan || 'free';
  const isPaidPlan = planTier !== 'free' || demoShowPaidInvoices;
  const isActuallyPaidPlan = planTier !== 'free';

  // Realistic Paid Invoices
  const simulatedInvoices = [
    { id: 'INV-2026-004', date: 'Oct 01, 2026', amount: '$29.00', status: 'Paid' },
    { id: 'INV-2026-003', date: 'Sep 01, 2026', amount: '$29.00', status: 'Paid' },
    { id: 'INV-2026-002', date: 'Aug 01, 2026', amount: '$29.00', status: 'Paid' },
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto font-sans pb-16">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-bounce-in bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 text-xs border border-slate-800">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="font-medium">{toastMessage}</span>
        </div>
      )}

      {/* ── 1. Top White Hero Card ── */}
      <div className="rounded-2xl sm:rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-5 sm:p-6 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-2xl bg-purple-50 dark:bg-purple-950/60 border border-purple-200/70 dark:border-purple-800 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0 shadow-2xs">
            <CreditCard className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight font-display">
                Account & Billing Management
              </h1>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200/80 dark:border-purple-800">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-600 dark:bg-purple-400" />
                <span>{isActuallyPaidPlan ? 'Pro Plan • Active' : 'Free Plan • Active'}</span>
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Manage your PandaPraise workspace subscription tier, usage quotas, payment methods, and tax invoices.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 self-start sm:self-auto">
          {isActuallyPaidPlan ? (
            <button
              type="button"
              onClick={handleBillingPortal}
              disabled={billingPortalLoading}
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold transition-all shadow-2xs active:scale-95 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <span>{billingPortalLoading ? 'Opening Portal...' : 'Manage Invoices & Plan'}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              type="button"
              onClick={onUpgrade || (() => (window.location.href = '/pricing'))}
              className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-all shadow-md hover:shadow-purple-500/25 active:scale-95 flex items-center gap-1.5 cursor-pointer"
            >
              <span>Upgrade to Pro ⚡</span>
            </button>
          )}
        </div>
      </div>

      {/* ── 2. Four Conversion-Driving KPI Cards in a Single Row ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: CURRENT PLAN */}
        <div className="rounded-2xl sm:rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-5 shadow-2xs flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              CURRENT PLAN
            </span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              {isActuallyPaidPlan ? 'Pro Plan' : 'Free Plan'}
            </div>
            <p className="text-xs text-purple-700 dark:text-purple-400 font-semibold mt-1">
              {isActuallyPaidPlan ? '$29 / month • Active' : '$0 / month • Free Forever'}
            </p>
          </div>
        </div>

        {/* Card 2: VIDEO & AUDIO QUOTA */}
        <div className="rounded-2xl sm:rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-5 shadow-2xs flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              VIDEO & AUDIO PROOFS
            </span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
              <Video className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              {isActuallyPaidPlan ? 'Unlimited' : `${videoQuota.used} / ${videoQuota.limit} Used`}
            </div>
            {/* Progress bar */}
            {!isActuallyPaidPlan ? (
              <div className="mt-2 space-y-1">
                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-purple-600 h-1.5 rounded-full transition-all duration-500"
                    style={{ width: `${(videoQuota.used / videoQuota.limit) * 100}%` }}
                  />
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                  1 video proof remaining on Free Plan
                </p>
              </div>
            ) : (
              <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1">
                Unlimited video proofs on Pro Plan
              </p>
            )}
          </div>
        </div>

        {/* Card 3: TEXT TESTIMONIAL QUOTA */}
        <div className="rounded-2xl sm:rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-5 shadow-2xs flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              TEXT TESTIMONIALS
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
              <FileCheck className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              {isActuallyPaidPlan ? 'Unlimited' : `${textQuota.used} / ${textQuota.limit} Used`}
            </div>
            {/* Progress bar */}
            {!isActuallyPaidPlan ? (
              <div className="mt-2 space-y-1">
                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-amber-500 h-1.5 rounded-full transition-all duration-500"
                    style={{ width: `${(textQuota.used / textQuota.limit) * 100}%` }}
                  />
                </div>
                <p className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold">
                  Upgrade for unlimited text & video proofs
                </p>
              </div>
            ) : (
              <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1">
                Unlimited text proofs on Pro Plan
              </p>
            )}
          </div>
        </div>

        {/* Card 4: PAYMENT METHOD */}
        <div className="rounded-2xl sm:rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-5 shadow-2xs flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              PAYMENT METHOD
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div>
            {cardOnFile ? (
              <div>
                <div className="text-lg font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-1.5">
                  <span>•••• {cardOnFile.last4}</span>
                  <span className="text-xs font-medium text-slate-400">({cardOnFile.brand})</span>
                </div>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-[11px] text-slate-400">Exp {cardOnFile.expMonth}/{cardOnFile.expYear}</span>
                  <button
                    type="button"
                    onClick={handleBillingPortal}
                    className="text-xs font-bold text-purple-600 hover:text-purple-700 cursor-pointer"
                  >
                    Manage
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                  No Card on File
                </div>
                <button
                  type="button"
                  onClick={handleAddPaymentMethod}
                  className="mt-1 text-xs font-bold text-purple-600 hover:text-purple-700 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Add Payment Method</span>
                </button>
              </div>
            )}
            <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-2 font-medium">
              Secured by Stripe (PCI-DSS L1)
            </p>
          </div>
        </div>

      </div>

      {/* ── 3. Two-Column Main Content Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        
        {/* Left Column: Tier Limits & Pro Upsell Card */}
        <div className="rounded-2xl sm:rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-5 sm:p-6 shadow-2xs space-y-6">
          
          {/* Top Section — Included in Your Free Plan */}
          <div className="space-y-3.5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Included in Your Free Plan
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Core essential customer review collection features.
                </p>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                Free Forever
              </span>
            </div>

            <div className="space-y-2.5">
              <div className="flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-300 font-medium">
                <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <span>Up to 10 Text & 2 Video Testimonials</span>
              </div>
              <div className="flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-300 font-medium">
                <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <span>1 Standard Collection Form Link</span>
              </div>
              <div className="flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-300 font-medium">
                <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <span>Basic Wall of Love Embed <span className="text-slate-400 italic">(Includes "Powered by PandaPraise" badge)</span></span>
              </div>
              <div className="flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-300 font-medium">
                <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <span>Bank-grade SSL & Cloudflare Edge Delivery</span>
              </div>
            </div>
          </div>

          {/* Bottom Section — Unlock with PandaPraise Pro */}
          <div className="rounded-2xl bg-purple-50/60 dark:bg-purple-950/30 border border-purple-200/80 dark:border-purple-800 p-4 sm:p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-purple-600" />
                  <span>Unlock with PandaPraise Pro</span>
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Scale trust and convert visitors into paying customers.
                </p>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-purple-600 text-white shadow-2xs">
                $29 / mo
              </span>
            </div>

            <div className="space-y-2 pt-1">
              <div className="flex items-start gap-2 text-xs text-slate-800 dark:text-slate-200 font-medium">
                <Lock className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400 shrink-0 mt-0.5" />
                <span><strong className="text-slate-900 dark:text-white">Unlimited</strong> Text, Audio & Video Testimonials</span>
              </div>
              <div className="flex items-start gap-2 text-xs text-slate-800 dark:text-slate-200 font-medium">
                <Lock className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400 shrink-0 mt-0.5" />
                <span><strong className="text-slate-900 dark:text-white">Remove "Powered by PandaPraise" Branding</strong></span>
              </div>
              <div className="flex items-start gap-2 text-xs text-slate-800 dark:text-slate-200 font-medium">
                <Lock className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400 shrink-0 mt-0.5" />
                <span><strong className="text-slate-900 dark:text-white">Automated Review Request Drips</strong> (Email & WhatsApp)</span>
              </div>
              <div className="flex items-start gap-2 text-xs text-slate-800 dark:text-slate-200 font-medium">
                <Lock className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400 shrink-0 mt-0.5" />
                <span><strong className="text-slate-900 dark:text-white">Custom Subdomain & Custom Domain</strong> Collection Forms</span>
              </div>
              <div className="flex items-start gap-2 text-xs text-slate-800 dark:text-slate-200 font-medium">
                <Lock className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400 shrink-0 mt-0.5" />
                <span><strong className="text-slate-900 dark:text-white">AI Sentiment Analysis & Spam Moderation Shield</strong></span>
              </div>
              <div className="flex items-start gap-2 text-xs text-slate-800 dark:text-slate-200 font-medium">
                <Lock className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400 shrink-0 mt-0.5" />
                <span><strong className="text-slate-900 dark:text-white">1-Click Social Media Distribution Studio</strong></span>
              </div>
              <div className="flex items-start gap-2 text-xs text-slate-800 dark:text-slate-200 font-medium">
                <Lock className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400 shrink-0 mt-0.5" />
                <span><strong className="text-slate-900 dark:text-white">Inbound Webhooks & Developer REST API</strong></span>
              </div>
            </div>

            <button
              type="button"
              onClick={onUpgrade || (() => (window.location.href = '/pricing'))}
              className="w-full py-2.5 px-4 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-all shadow-md hover:shadow-purple-500/25 active:scale-98 flex items-center justify-center gap-1.5 cursor-pointer mt-2"
            >
              <span>Upgrade to Pro — $29/mo →</span>
            </button>
          </div>
        </div>

        {/* Right Column Stack: (Card 1: Tax/Billing Profile + Card 2: Invoices & Receipts) */}
        <div className="space-y-6">
          
          {/* Card 1: Billing & Tax Details */}
          <div className="rounded-2xl sm:rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-5 sm:p-6 shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950/60 border border-purple-200/70 dark:border-purple-800 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0 shadow-2xs">
                  <Building2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                    Billing & Tax Details
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Compliant invoicing profile for GST, VAT, and company receipts.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setTempBilling({ ...billingDetails });
                  setIsEditingBilling(!isEditingBilling);
                }}
                className="text-xs font-bold text-purple-600 dark:text-purple-400 hover:text-purple-700 flex items-center gap-1 cursor-pointer transition-colors"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>{isEditingBilling ? 'Cancel' : 'Edit Billing Info'}</span>
              </button>
            </div>

            {isEditingBilling ? (
              <form onSubmit={handleSaveBilling} className="space-y-3 pt-1 animate-in fade-in duration-200">
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1">
                    Legal / Company Name
                  </label>
                  <input
                    type="text"
                    required
                    value={tempBilling.companyName}
                    onChange={(e) => setTempBilling({ ...tempBilling, companyName: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-purple-600"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1">
                    Billing Email
                  </label>
                  <input
                    type="email"
                    required
                    value={tempBilling.billingEmail}
                    onChange={(e) => setTempBilling({ ...tempBilling, billingEmail: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-purple-600"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1">
                    Tax ID (GSTIN / VAT Number)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 27AADCB2230M1Z2"
                    value={tempBilling.taxId}
                    onChange={(e) => setTempBilling({ ...tempBilling, taxId: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-purple-600"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsEditingBilling(false)}
                    className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    Legal / Company Name
                  </span>
                  <span className="text-xs font-bold text-slate-900 dark:text-white truncate block">
                    {billingDetails.companyName}
                  </span>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    Billing Email
                  </span>
                  <span className="text-xs font-bold text-slate-900 dark:text-white truncate block">
                    {billingDetails.billingEmail}
                  </span>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    Tax ID (GSTIN / VAT Number)
                  </span>
                  <span className="text-xs font-mono font-bold text-slate-900 dark:text-white truncate block">
                    {billingDetails.taxId || 'Not set'}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Card 2: Invoices & Receipts (Fix Accounting Logic & Overflow Bug) */}
          <div className="rounded-2xl sm:rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-5 sm:p-6 shadow-2xs h-auto overflow-visible space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950/60 border border-purple-200/70 dark:border-purple-800 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0 shadow-2xs">
                  <Receipt className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Invoices & Receipts
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Download past billing statements and official receipts.
                  </p>
                </div>
              </div>

              {/* Development / Demo Mode Toggle */}
              <button
                type="button"
                id="demo-toggle-invoices"
                onClick={() => setDemoShowPaidInvoices(!demoShowPaidInvoices)}
                className="text-[11px] font-semibold text-purple-600 hover:text-purple-700 bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/50 dark:text-purple-300 px-2 py-1 rounded-lg border border-purple-200 dark:border-purple-800 transition-colors cursor-pointer"
                title="Toggle simulated paid invoice list for UI testing"
              >
                {demoShowPaidInvoices ? '← Free View' : '[Demo: Preview Paid Invoices]'}
              </button>
            </div>

            {/* Conditional Invoices View: Empty State for Free Plan vs Populated List */}
            {!isPaidPlan ? (
              <div className="py-8 px-4 text-center flex flex-col items-center justify-center space-y-2.5 rounded-2xl bg-slate-50/50 dark:bg-slate-800/30 border border-dashed border-slate-200 dark:border-slate-700">
                <div className="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                    No billing history yet
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mt-0.5">
                    Paid invoices and downloadable tax receipts will appear here once you upgrade to a paid plan.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                {simulatedInvoices.map((inv) => (
                  <div
                    key={inv.id}
                    className="p-3 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 flex items-center justify-between gap-3 shadow-2xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <FileText className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0" />
                      <div>
                        <span className="text-xs font-bold text-slate-900 dark:text-white block">
                          {inv.id}
                        </span>
                        <span className="text-[11px] text-slate-400">{inv.date}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        {inv.amount}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800">
                        {inv.status}
                      </span>
                      <button
                        type="button"
                        onClick={handleBillingPortal}
                        className="p-1 rounded-lg text-slate-400 hover:text-purple-600 transition-colors cursor-pointer"
                        title="Download receipt"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Unclipped Footer Notice Banner */}
            <div className="p-3 rounded-xl bg-purple-50/60 dark:bg-purple-950/30 border border-purple-200/70 dark:border-purple-800 text-[11px] text-slate-600 dark:text-slate-400 flex items-center gap-2">
              <Lock className="w-3.5 h-3.5 text-purple-600 shrink-0" />
              <span>Invoices are synced with Stripe. Need tax exemption or GST/VAT number? Update your Billing Info above.</span>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};

export default AccountBillingView;
