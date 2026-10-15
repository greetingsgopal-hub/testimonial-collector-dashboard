import React, { useState } from 'react';
import { Share2, ExternalLink, Check } from 'lucide-react';

export interface OneClickSocialSharingProps {
  referralCode?: string;
}

export const OneClickSocialSharing: React.FC<OneClickSocialSharingProps> = ({
  referralCode = 'greetingsgopal-ws-FKLVoT',
}) => {
  const [copiedPlatform, setCopiedPlatform] = useState<string | null>(null);

  const referralUrl = `https://pandapraise.com/r/${referralCode}`;
  const sharePitch = `I use PandaPraise to collect and embed customer testimonials in 2 minutes. Sign up through my invite link and get 1 free month of Pro!`;
  const fullShareText = `${sharePitch} ${referralUrl}`;

  const handleSocialShare = async (platform: 'x' | 'linkedin' | 'whatsapp') => {
    // Always copy the full draft to clipboard as a backup
    try {
      await navigator.clipboard.writeText(fullShareText);
      setCopiedPlatform(platform);
      setTimeout(() => setCopiedPlatform(null), 2500);
    } catch {
      // Clipboard fallback ignored if blocked by browser
    }

    const encodedFullText = encodeURIComponent(fullShareText);

    const shareUrls: Record<'x' | 'linkedin' | 'whatsapp', string> = {
      // X / Twitter pre-filled intent
      x: `https://x.com/intent/post?text=${encodedFullText}`,

      // FIX: LinkedIn Feed Composer intent (Pre-fills full text + preserves referral link)
      linkedin: `https://www.linkedin.com/feed/?shareActive=true&text=${encodedFullText}`,

      // WhatsApp pre-filled message intent
      whatsapp: `https://api.whatsapp.com/send?text=${encodedFullText}`,
    };

    window.open(shareUrls[platform], '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm">
      <div className="flex items-center justify-between gap-4 mb-4">
        <h3 className="text-base font-bold text-slate-900 dark:text-white">
          1-Click Social Sharing
        </h3>
        {copiedPlatform && (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 dark:text-emerald-300 px-2.5 py-1 rounded-full border border-emerald-200/60 dark:border-emerald-800 animate-in fade-in">
            <Check className="w-3.5 h-3.5" />
            Draft copied to clipboard & opened {copiedPlatform.toUpperCase()}
          </span>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {/* Share on X / Twitter */}
        <button
          type="button"
          onClick={() => handleSocialShare('x')}
          className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-xl bg-[#0F172A] hover:bg-slate-800 text-white font-semibold text-sm transition-all cursor-pointer shadow-xs"
        >
          <Share2 className="w-4 h-4" />
          <span>Share on X / Twitter</span>
        </button>

        {/* Share on LinkedIn (Now pre-fills full pitch + referral link) */}
        <button
          type="button"
          onClick={() => handleSocialShare('linkedin')}
          className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-xl bg-[#0A66C2] hover:bg-[#004182] text-white font-semibold text-sm transition-all cursor-pointer shadow-xs"
        >
          <ExternalLink className="w-4 h-4" />
          <span>Share on LinkedIn</span>
        </button>

        {/* Share on WhatsApp */}
        <button
          type="button"
          onClick={() => handleSocialShare('whatsapp')}
          className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-xl bg-[#16C65A] hover:bg-[#12a84b] text-white font-semibold text-sm transition-all cursor-pointer shadow-xs"
        >
          <Share2 className="w-4 h-4" />
          <span>Share on WhatsApp</span>
        </button>
      </div>
    </div>
  );
};

export default OneClickSocialSharing;
