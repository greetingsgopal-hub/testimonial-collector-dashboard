import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Zap,
  ExternalLink,
  ArrowUpRight,
  Receipt,
  FileText,
  Check,
  Building2,
  Lock
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

export const AccountBillingView: React.FC<AccountBillingViewProps> = ({
  workspace: propWorkspace,
  onUpgrade,
}) => {
  const { workspace: authWorkspace, project, user } = useAuth();
  const workspace = propWorkspace || authWorkspace;
  const [stripeSubscription, setStripeSubscription] = useState<StripeSubscriptionInfo | null>(null);
  const [billingPortalLoading, setBillingPortalLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
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

  const planTier = stripeSubscription?.plan || workspace?.plan || 'free';
  const isPaidPlan = planTier !== 'free';
  const planDisplayName = planTier.charAt(0).toUpperCase() + planTier.slice(1);

  const planFeatures = [
    'Unlimited Text & Video Testimonials',
    'Custom Subdomain Collection Forms',
    'Embeddable Wall of Love & Carousel Studio',
    '1-Click Social Media Distribution',
    'Automated Review Request Drips (Email & WhatsApp)',
    'Inbound Webhooks & Developer REST API',
    'AI Sentiment & Spam Moderation Shield',
    'Bank-grade SSL & Cloudflare Edge Acceleration',
  ];

  const simulatedInvoices = [
    { id: 'INV-2026-004', date: 'Oct 01, 2026', amount: isPaidPlan ? '$29.00' : '$0.00', status: 'Paid' },
    { id: 'INV-2026-003', date: 'Sep 01, 2026', amount: isPaidPlan ? '$29.00' : '$0.00', status: 'Paid' },
    { id: 'INV-2026-002', date: 'Aug 01, 2026', amount: isPaidPlan ? '$29.00' : '$0.00', status: 'Paid' },
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
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800">
                <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                <span>Stripe Connected</span>
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Manage your PandaPraise workspace subscription tier, invoices, and payment cards securely via Stripe.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 self-start sm:self-auto">
          {isPaidPlan ? (
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
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-all shadow-2xs active:scale-95 flex items-center gap-1.5 cursor-pointer"
            >
              <span>Upgrade Plan</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* ── 2. Four Equal White Metric Cards in a Single Row (Referrals Style) ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Current Plan */}
        <div className="rounded-2xl sm:rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-5 shadow-2xs flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Current Plan
            </span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            {planDisplayName} Plan
          </div>
          <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">
            Status: {stripeSubscription?.subscriptionStatus || 'active'}
          </p>
        </div>

        {/* Card 2: Billing Cycle */}
        <div className="rounded-2xl sm:rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-5 shadow-2xs flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Billing Cycle
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            {isPaidPlan ? '$29 / mo' : '$0 / mo'}
          </div>
          <p className="text-xs text-emerald-600 dark:text-emerald-400 font-bold">
            ↑ Standard Monthly Renewal
          </p>
        </div>

        {/* Card 3: Proof Quota */}
        <div className="rounded-2xl sm:rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-5 shadow-2xs flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Proof Limit
            </span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Unlimited
          </div>
          <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">
            Text, audio & video proof
          </p>
        </div>

        {/* Card 4: Payment Security */}
        <div className="rounded-2xl sm:rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-5 shadow-2xs flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Payment Security
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            PCI-DSS L1
          </div>
          <p className="text-xs text-emerald-600 dark:text-emerald-400 font-bold">
            Encrypted Stripe Infrastructure
          </p>
        </div>
      </div>

      {/* ── 3. Two Equal Cards Side-by-Side ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        
        {/* Left Card: Active Subscription & Plan Features */}
        <div className="rounded-2xl sm:rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-5 sm:p-6 shadow-2xs flex flex-col justify-between space-y-5">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {planDisplayName} Tier
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {isPaidPlan
                    ? 'All features unlocked with automatic scaling & live support.'
                    : 'Get started with essential customer review collection.'}
                </p>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200/80 dark:border-purple-800">
                {isPaidPlan ? '$29 / month' : 'Free Forever'}
              </span>
            </div>

            {/* Included Features List */}
            <div className="space-y-2.5">
              {planFeatures.map((feat, idx) => (
                <div key={idx} className="flex items-center gap-2.5 text-xs text-slate-700 dark:text-slate-300">
                  <div className="w-4 h-4 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                    <Check className="w-2.5 h-2.5" />
                  </div>
                  <span>{feat}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={onUpgrade || (() => (window.location.href = '/pricing'))}
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-all shadow-2xs active:scale-95 cursor-pointer"
            >
              {isPaidPlan ? 'Change Plan Tier' : 'Upgrade to Pro Tier'}
            </button>
            <button
              type="button"
              onClick={handleBillingPortal}
              disabled={billingPortalLoading}
              className="text-xs font-bold text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 flex items-center gap-1 cursor-pointer transition-colors"
            >
              <span>Manage on Stripe →</span>
            </button>
          </div>
        </div>

        {/* Right Card: Billing Invoices & Receipts History */}
        <div className="rounded-2xl sm:rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-5 sm:p-6 shadow-2xs flex flex-col justify-between space-y-5">
          <div className="space-y-4">
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
                    Download past billing statements and invoices.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleBillingPortal}
                className="text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 flex items-center gap-1 cursor-pointer"
              >
                <span>View All</span>
              </button>
            </div>

            {/* Invoices List */}
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
          </div>

          <div className="p-3 rounded-xl bg-purple-50/60 dark:bg-purple-950/30 border border-purple-200/70 dark:border-purple-800 text-[11px] text-slate-600 dark:text-slate-400 flex items-center gap-2">
            <Lock className="w-3.5 h-3.5 text-purple-600 shrink-0" />
            <span>Invoices are synced with Stripe. Need tax exemption or VAT number? Update via portal.</span>
          </div>
        </div>

      </div>

      {/* ── 4. Workspace Account Identity Card ── */}
      <div className="rounded-2xl sm:rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-5 sm:p-6 shadow-2xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950/60 border border-purple-200/70 dark:border-purple-800 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0 shadow-2xs">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                Workspace & Account Details
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Primary ownership and workspace tenant identifiers.
              </p>
            </div>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500">
            ID: {project?.id || workspace?.id || 'default'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3.5 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Active Workspace
            </span>
            <span className="text-xs font-bold text-slate-900 dark:text-white truncate block">
              {workspace?.name || project?.name || 'Main Workspace'}
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Account Owner
            </span>
            <span className="text-xs font-bold text-slate-900 dark:text-white truncate block">
              {user?.displayName || 'Workspace Admin'}
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Billing Email
            </span>
            <span className="text-xs font-bold text-slate-900 dark:text-white truncate block">
              {user?.email || 'admin@pandapraise.com'}
            </span>
          </div>
        </div>
      </div>

    </div>
  );
};
