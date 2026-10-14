import React from 'react';
import { X, Check, Sparkles, Zap, ShieldCheck } from 'lucide-react';
import { startRazorpayCheckout } from '../../lib/razorpay';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPlan?: (plan: 'pro' | 'founding') => void;
}

export const UpgradeModal: React.FC<UpgradeModalProps> = ({
  isOpen,
  onClose,
  onSelectPlan,
}) => {
  if (!isOpen) return null;

  const handleChoosePro = async () => {
    if (onSelectPlan) {
      onSelectPlan('pro');
    } else {
      const res = await startRazorpayCheckout('pro');
      if (!res.success) {
        window.location.href = '/dashboard/settings?tab=billing&plan=pro&checkout=true';
      }
    }
  };

  const handleChooseFounding = async () => {
    if (onSelectPlan) {
      onSelectPlan('founding');
    } else {
      const res = await startRazorpayCheckout('founding');
      if (!res.success) {
        window.location.href = '/dashboard/settings?tab=billing&plan=founding&checkout=true';
      }
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="upgrade-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in font-sans"
    >
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Top Gradient Bar */}
        <div className="h-2.5 w-full bg-gradient-to-r from-[#e11d48] via-[#a855f7] to-[#6701e6]" />

        {/* Header */}
        <div className="p-6 sm:p-8 border-b border-slate-100 dark:border-slate-800 flex items-start justify-between">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 text-xs font-bold mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Unlock Unlimited Growth</span>
            </div>
            <h2
              id="upgrade-modal-title"
              className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight"
            >
              Upgrade to PandaPraise Pro
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Scale past the 15-review free limit and collect high-converting social proof on autopilot.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Plans Grid */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Pro Plan Card */}
            <div className="relative rounded-2xl border-2 border-purple-600 dark:border-purple-500 bg-purple-50/40 dark:bg-purple-950/20 p-5 flex flex-col justify-between shadow-sm">
              <div className="absolute -top-3 right-4 px-2.5 py-0.5 rounded-full bg-purple-600 text-white text-[10px] font-extrabold uppercase tracking-wider">
                Popular
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Zap className="w-4 h-4 text-purple-600" />
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">Pro Monthly</h3>
                </div>
                <div className="flex items-baseline gap-1 my-3">
                  <span className="text-3xl font-black text-slate-900 dark:text-white">$19</span>
                  <span className="text-xs text-slate-500 font-medium">/ month</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 mb-4">
                  For growing startups and businesses needing complete social proof infrastructure.
                </p>
                <ul className="space-y-2.5 text-xs text-slate-700 dark:text-slate-300">
                  <li className="flex items-center gap-2 font-medium">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Unlimited Testimonials</span>
                  </li>
                  <li className="flex items-center gap-2 font-medium">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Remove Branding</span>
                  </li>
                  <li className="flex items-center gap-2 font-medium">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>HD Video Collection</span>
                  </li>
                  <li className="flex items-center gap-2 font-medium">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>All 5 Widget Layouts</span>
                  </li>
                  <li className="flex items-center gap-2 font-medium">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Webhooks & REST API</span>
                  </li>
                </ul>
              </div>

              <button
                type="button"
                data-testid="upgrade-pro-btn"
                onClick={handleChoosePro}
                className="mt-6 w-full py-2.5 px-4 rounded-xl font-bold text-xs bg-gradient-to-r from-[#6701e6] to-[#9333ea] hover:from-[#5400bd] hover:to-[#7e22ce] text-white shadow-md hover:shadow-lg transition-all cursor-pointer"
              >
                Upgrade to Pro ($19/mo)
              </button>
            </div>

            {/* Lifetime Founding Member */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <ShieldCheck className="w-4 h-4 text-amber-500" />
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">Founding Pass</h3>
                </div>
                <div className="flex items-baseline gap-1 my-3">
                  <span className="text-3xl font-black text-slate-900 dark:text-white">$149</span>
                  <span className="text-xs text-slate-500 font-medium">one-time</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 mb-4">
                  Pay once, enjoy Pro features forever. Zero recurring monthly fees.
                </p>
                <ul className="space-y-2.5 text-xs text-slate-700 dark:text-slate-300">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>All Pro Features Included</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Lifetime Access Guarantee</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Priority Support</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Early Access to New Widgets</span>
                  </li>
                </ul>
              </div>

              <button
                type="button"
                data-testid="upgrade-founding-btn"
                onClick={handleChooseFounding}
                className="mt-6 w-full py-2.5 px-4 rounded-xl font-bold text-xs bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 shadow-sm transition-all cursor-pointer"
              >
                Get Lifetime Pass ($149)
              </button>
            </div>

          </div>

          <p className="text-center text-[11px] text-slate-400">
            🔒 Secure 256-bit Stripe encrypted checkout • Cancel anytime in 1 click
          </p>
        </div>
      </div>
    </div>
  );
};
