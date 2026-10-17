import React, { useState } from 'react';
import { Workspace } from '../../types';
import { generateReferralUrl } from '../../lib/referral';
import {
  Gift,
  Copy,
  Check,
  Share2,
  Users,
  Award,
  Sparkles,
} from 'lucide-react';
import { OneClickSocialSharing } from './OneClickSocialSharing';

interface ReferralHubProps {
  workspace: Workspace | null;
}

export const ReferralHub: React.FC<ReferralHubProps> = ({ workspace }) => {
  const [copied, setCopied] = useState(false);

  const referralCode = workspace?.slug || workspace?.id || 'vip-growth';
  const referralUrl = generateReferralUrl(referralCode);

  const handleCopy = () => {
    navigator.clipboard.writeText(referralUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };



  const clicks = Number((workspace as any)?.referralClicks || 0);
  const signups = Number((workspace as any)?.referralSignups || 0);
  const freeMonths = Number((workspace as any)?.freeMonthsEarned || signups);
  const savedAmount = freeMonths * 19;

  const metrics = [
    { label: 'Referral Clicks', value: `${clicks}`, icon: Share2, color: 'text-purple-600' },
    { label: 'Signups', value: `${signups}`, icon: Users, color: 'text-indigo-600' },
    { label: 'Free Months Earned', value: `${freeMonths} ${freeMonths === 1 ? 'Month' : 'Months'}`, icon: Award, color: 'text-amber-500' },
    { label: 'Saved on Subscription', value: `$${savedAmount.toFixed(2)}`, icon: Sparkles, color: 'text-emerald-500' },
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto font-sans">
      
      {/* ── 1. Hero Promo Card ── */}
      <div className="relative rounded-3xl bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 text-white p-6 sm:p-8 overflow-hidden shadow-xl">
        <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold mb-3 border border-white/20">
            <Gift className="w-3.5 h-3.5 text-amber-300" />
            <span>Referral Program</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Give 1 Month, Get 1 Month
          </h2>
          <p className="text-xs sm:text-sm text-purple-100 mt-2 leading-relaxed">
            Invite fellow founders, agency owners, and creators to PandaPraise.
            When they sign up with your unique link, they receive a free month of Pro, and your workspace gets a free month credited automatically.
          </p>

          {/* Referral Link Box */}
          <div className="mt-6 flex flex-col sm:flex-row items-stretch sm:items-center gap-2 max-w-xl">
            <div className="flex-1 flex items-center bg-white/10 backdrop-blur-md border border-white/20 rounded-xl px-3.5 py-2.5 text-xs text-purple-50 font-mono select-all overflow-hidden truncate">
              {referralUrl}
            </div>
            <button
              type="button"
              data-testid="copy-ref-btn"
              onClick={handleCopy}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-white text-purple-900 hover:bg-purple-50 font-bold text-xs shadow-md transition-all shrink-0 cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-purple-700" />
                  <span>Copy Invite Link</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ── 2. Performance Metrics Row ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {metrics.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.label}
              className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  {item.label}
                </span>
                <Icon className={`w-4 h-4 ${item.color}`} />
              </div>
              <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                {item.value}
              </span>
            </div>
          );
        })}
      </div>

      {/* ── 3. Quick Social Sharing ── */}
      <OneClickSocialSharing referralCode={referralCode} />

      {/* ── 4. How It Works ── */}
      <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200/60 dark:border-slate-800">
        <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4">
          How it works
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="flex items-start gap-3">
            <span className="w-6 h-6 rounded-full bg-purple-600 text-white text-xs font-bold flex items-center justify-center shrink-0">
              1
            </span>
            <div>
              <h5 className="text-xs font-bold text-slate-900 dark:text-white">Share Your Link</h5>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Send your link to founders or post on social media. 60-day cookie tracking included.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <span className="w-6 h-6 rounded-full bg-purple-600 text-white text-xs font-bold flex items-center justify-center shrink-0">
              2
            </span>
            <div>
              <h5 className="text-xs font-bold text-slate-900 dark:text-white">Friend Joins</h5>
              <p className="text-[11px] text-slate-500 mt-0.5">
                They sign up and unlock 30 days of Pro completely free without restrictions.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <span className="w-6 h-6 rounded-full bg-purple-600 text-white text-xs font-bold flex items-center justify-center shrink-0">
              3
            </span>
            <div>
              <h5 className="text-xs font-bold text-slate-900 dark:text-white">You Get Rewarded</h5>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Your workspace is credited with +1 month of Pro automatically. Stack as many as you like!
              </p>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};
