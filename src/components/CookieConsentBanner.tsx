import React, { useState, useEffect } from 'react';
import { ShieldCheck, X } from 'lucide-react';

export const CookieConsentBanner: React.FC = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('pp_cookie_consent');
    if (!consent) {
      setVisible(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('pp_cookie_consent', 'accepted');
    setVisible(false);
  };

  const handleDecline = () => {
    localStorage.setItem('pp_cookie_consent', 'essential_only');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <aside
      aria-label="Cookie preferences"
      className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-50 p-5 rounded-2xl bg-zinc-950/95 text-white border border-white/10 shadow-2xl backdrop-blur-xl animate-fade-in font-sans text-xs"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2 text-purple-400 font-bold text-sm">
          <ShieldCheck size={18} />
          <span>Privacy & Cookie Preferences</span>
        </div>
        <button
          onClick={handleDecline}
          className="text-zinc-400 hover:text-white transition-colors cursor-pointer p-0.5"
          title="Dismiss"
        >
          <X size={16} />
        </button>
      </div>

      <p className="mt-2 text-zinc-300 leading-relaxed">
        We use essential cookies to provide our services and optional analytics cookies to measure distribution performance in compliance with GDPR and CCPA.
      </p>

      <div className="mt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3 text-[11px]">
          <a
            href="/cookie-policy"
            className="text-zinc-400 hover:text-white underline"
          >
            Cookie Policy
          </a>
          <span className="text-zinc-600">•</span>
          <a
            href="/privacy-policy"
            className="text-zinc-400 hover:text-white underline"
          >
            Privacy Policy
          </a>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleDecline}
            className="px-3 py-1.5 rounded-xl border border-white/10 text-zinc-300 hover:bg-white/5 transition-all text-xs font-semibold cursor-pointer"
          >
            Essential Only
          </button>
          <button
            onClick={handleAccept}
            className="px-4 py-1.5 rounded-xl bg-[#6701e6] hover:bg-[#5200bd] text-white transition-all text-xs font-bold shadow-md shadow-purple-500/20 cursor-pointer"
          >
            Accept All
          </button>
        </div>
      </div>
    </aside>
  );
};
