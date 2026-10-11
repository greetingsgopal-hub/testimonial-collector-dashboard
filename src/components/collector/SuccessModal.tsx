import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { Clock, Download, Copy, Check, X, ArrowRight, ExternalLink, PlusCircle, UserPlus, ShieldCheck } from 'lucide-react';
import { Review } from '../../types';
import { analytics } from '../../lib/analytics';
import { CollectorLang } from '../../lib/collectorI18n';

interface SuccessModalProps {
  review: Review | null;
  onClose: () => void;
  onGoToDashboard?: () => void;
  onResetForm: () => void;
  isPublicView?: boolean;
  businessName?: string;
  projectId?: string;
  formId?: string;
  lang?: CollectorLang;
}

export const SuccessModal: React.FC<SuccessModalProps> = ({
  review,
  onClose,
  onGoToDashboard,
  onResetForm,
  isPublicView = false,
  businessName,
  projectId,
  formId,
  lang: initialLang = 'en',
}) => {
  const [lang, setLang] = useState<CollectorLang>(initialLang);
  const [copiedCoupon, setCopiedCoupon] = useState(false);
  const [invited, setInvited] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [downloaded, setDownloaded] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Fire celebratory confetti cannon on mount if canvas context is supported
    try {
      const testCanvas = document.createElement('canvas');
      if (typeof testCanvas.getContext === 'function' && testCanvas.getContext('2d')) {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#059669', '#10b981', '#34d399', '#f59e0b', '#6366f1'],
        });
      }
    } catch {
      // Confetti non-fatal in headless environments
    }

    if (isPublicView) {
      analytics.viralCtaViewed({
        has_business_name: Boolean(businessName),
      });
    }
  }, [isPublicView, businessName]);

  if (!review) return null;

  const displayBrand = businessName || 'papasystem';
  const rawName = (review.name || '').trim();
  const firstName = rawName ? rawName.split(' ')[0] : 'there';
  const fullName = rawName || 'Alex Rivera';
  const initials = rawName
    ? rawName
        .split(' ')
        .map((p) => p[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : 'AR';

  const authorRole = [review.role, review.company].filter(Boolean).join(' @ ') || 'Product Lead @ Acme Corp';
  const headline = review.title || 'Exactly what our team needed';
  const reviewBody =
    review.content ||
    'PandaPraise cut our social proof collection time by 80%. The live widget embed and verified badges boosted our conversion rate within 48 hours!';
  const rating = typeof review.rating === 'number' && review.rating > 0 ? review.rating : 5;

  const handleCopyCoupon = () => {
    const couponCode = 'PRAISE20';
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(couponCode).catch(() => {});
    }
    setCopiedCoupon(true);
    setTimeout(() => setCopiedCoupon(false), 2200);
  };

  const handleInvite = () => {
    const shareUrl = window.location.href;
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(shareUrl).catch(() => {});
    }
    setInvited(true);
    setTimeout(() => setInvited(false), 2200);
  };

  const handleDownloadCard = () => {
    setDownloading(true);
    setTimeout(() => {
      setDownloading(false);
      setDownloaded(true);

      // Trigger a clean SVG image download of the review card
      try {
        const svgCard = `
          <svg xmlns="http://www.w3.org/2000/svg" width="600" height="340" viewBox="0 0 600 340">
            <defs>
              <linearGradient id="topGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stop-color="#10b981" />
                <stop offset="50%" stop-color="#2dd4bf" />
                <stop offset="100%" stop-color="#6366f1" />
              </linearGradient>
            </defs>
            <rect width="600" height="340" rx="20" fill="#ffffff" stroke="#e2e8f0" stroke-width="2"/>
            <rect x="0" y="0" width="600" height="8" rx="4" fill="url(#topGrad)"/>
            <text x="32" y="44" font-family="-apple-system, sans-serif" font-size="16" fill="#f59e0b" font-weight="bold">★★★★★ ${rating.toFixed(1)}</text>
            <text x="568" y="44" font-family="-apple-system, sans-serif" font-size="12" fill="#94a3b8" text-anchor="end">Verified via PandaPraise</text>
            <text x="32" y="85" font-family="-apple-system, sans-serif" font-size="20" fill="#0f172a" font-weight="bold">“${headline.replace(/"/g, '')}”</text>
            <text x="32" y="125" font-family="-apple-system, sans-serif" font-size="15" fill="#334155" width="536">
              <tspan x="32" dy="0">“${reviewBody.slice(0, 75).replace(/"/g, '')}</tspan>
              <tspan x="32" dy="24">${reviewBody.slice(75, 150).replace(/"/g, '')}...”</tspan>
            </text>
            <line x1="32" y1="240" x2="568" y2="240" stroke="#f1f5f9" stroke-width="1.5" />
            <circle cx="56" cy="285" r="24" fill="#059669" />
            <text x="56" y="291" font-family="-apple-system, sans-serif" font-size="14" fill="#ffffff" font-weight="bold" text-anchor="middle">${initials}</text>
            <text x="96" y="280" font-family="-apple-system, sans-serif" font-size="15" fill="#0f172a" font-weight="bold">${fullName} ✓</text>
            <text x="96" y="300" font-family="-apple-system, sans-serif" font-size="12" fill="#64748b">${authorRole}</text>
            <rect x="470" y="270" width="98" height="28" rx="6" fill="#f8fafc" stroke="#e2e8f0"/>
            <text x="519" y="288" font-family="-apple-system, sans-serif" font-size="11" fill="#059669" font-weight="bold" text-anchor="middle">● ${displayBrand}</text>
          </svg>
        `;
        const blob = new Blob([svgCard], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${displayBrand}-praise-${fullName.toLowerCase().replace(/\s+/g, '-')}.svg`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } catch {
        // Fallback gracefully
      }

      setTimeout(() => {
        setDownloaded(false);
      }, 2400);
    }, 1200);
  };

  const handleShareTwitter = () => {
    const text = `Just left a review for @${displayBrand}: "${reviewBody.slice(0, 120)}..."`;
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(window.location.href)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleShareLinkedIn = () => {
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleViralSignup = () => {
    analytics.viralCtaClicked({
      source: 'testimonial_submission',
      has_customer_name: Boolean(review.name),
      has_customer_company: Boolean(review.company),
    });

    try {
      const cleanFirstName = review.name ? review.name.trim().split(' ')[0] : '';
      sessionStorage.setItem(
        'pandapraise_viral_origin',
        JSON.stringify({
          source: 'testimonial',
          customerFirstName: cleanFirstName,
          customerEmail: review.email || '',
          referredFromProjectId: projectId || review.projectId || '',
          referredFromFormId: formId || review.collectionFormId || '',
          timestamp: Date.now(),
        })
      );
    } catch {
      // Ignore sessionStorage exceptions
    }

    onClose();
    navigate('/signup?source=testimonial');
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Praise Submitted"
      className="fixed inset-0 z-50 overflow-y-auto bg-[#f9f8fb] text-[#0f0e1b] min-h-screen font-sans antialiased selection:bg-emerald-100 selection:text-emerald-900"
    >
      {/* Celebration ambient background sparkles */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-[34rem] h-[22rem] bg-gradient-to-b from-emerald-100/50 via-teal-50/30 to-transparent blur-3xl" />
        <div className="confetti-dot absolute top-20 left-8 w-2 h-2 rounded-full bg-emerald-400 opacity-60" />
        <div
          className="confetti-dot absolute top-28 right-10 w-2.5 h-2.5 rounded-full bg-amber-400 opacity-70"
          style={{ animationDelay: '1.2s' }}
        />
        <div
          className="confetti-dot absolute top-44 left-14 w-1.5 h-1.5 rounded-full bg-indigo-400 opacity-50"
          style={{ animationDelay: '0.7s' }}
        />
        <div
          className="confetti-dot absolute top-60 right-16 w-2 h-2 rounded-full bg-teal-400 opacity-60"
          style={{ animationDelay: '1.8s' }}
        />
      </div>

      <div className="relative z-10 max-w-md mx-auto min-h-screen flex flex-col justify-between pb-10">
        {/* Top Navigation / Shared Context Bar */}
        <header className="w-full">
          <div className="flex items-center bg-[#f9f8fb]/90 backdrop-blur-md px-4 py-3 justify-between sticky top-0 z-20 border-b border-black/[0.04]">
            <div className="flex items-center gap-2">
              {/* PandaPraise mini panda badge */}
              <div className="size-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white shadow-sm font-bold text-sm tracking-tighter">
                🐾
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-bold tracking-tight text-[#0f0e1b]">{displayBrand}</span>
                  <span className="inline-flex items-center justify-center size-3.5 rounded-full bg-emerald-100 text-emerald-700">
                    <svg className="w-2.5 h-2.5 fill-current" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </span>
                </div>
                <span className="text-[10px] text-gray-400 font-medium tracking-wide flex items-center gap-1">
                  via PandaPraise
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              {/* Language toggle badge */}
              <button
                onClick={() => setLang(lang === 'en' ? 'hi' : 'en')}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold text-gray-600 bg-white border border-gray-200 shadow-[0_1px_2px_rgba(0,0,0,0.03)] hover:bg-gray-50 transition-colors cursor-pointer"
                type="button"
              >
                <span>🌐</span>
                <span>{lang === 'en' ? 'EN' : 'Hinglish'}</span>
              </button>

              {/* Dismiss / Close minimal action */}
              <button
                onClick={onClose}
                aria-label="Close form view"
                className="size-8 rounded-full flex items-center justify-center text-gray-500 hover:text-gray-800 hover:bg-white/80 transition-colors cursor-pointer"
                type="button"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </header>

        {/* Main Content Container */}
        <main className="px-4 pt-4 flex-1 flex flex-col">
          {/* Celebration & Confirmation Hero */}
          <section className="text-center pt-2 pb-5">
            {/* Floating Celebratory Icon with Emerald Glow */}
            <div className="relative inline-flex items-center justify-center mb-4">
              <div className="absolute inset-0 rounded-full bg-emerald-200/60 blur-md animate-badge-glow" />
              <div className="relative size-16 rounded-2xl bg-gradient-to-tr from-emerald-600 via-emerald-500 to-teal-400 p-[2px] shadow-lg shadow-emerald-600/20">
                <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center">
                  <svg className="w-8 h-8 text-emerald-600 fill-current" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              </div>
              <span className="absolute -top-1 -right-2 text-amber-400 text-lg select-none">✨</span>
              <span className="absolute -bottom-1 -left-2 text-emerald-500 text-sm select-none">✦</span>
            </div>

            <h1 className="text-[#0f0e1b] tracking-tight font-display text-2xl font-extrabold leading-snug">
              {lang === 'hi'
                ? `Aap Kamaal Hain, ${firstName}! 🎉`
                : `You're amazing, ${firstName}! 🎉`}
            </h1>
            <p className="text-gray-600 text-sm font-normal leading-relaxed mt-2 max-w-xs mx-auto">
              Your story inspires our team and helps future customers make confident choices. Thank you for championing{' '}
              <span className="font-semibold text-gray-900">{displayBrand}</span>.
            </p>

            {/* Status Chip */}
            <div className="mt-3.5 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-xs font-semibold shadow-xs">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600" />
              </span>
              <span>Verified Customer Review • Awaiting 1-Click Approval</span>
            </div>
          </section>

          {/* Section: Live Card of Their Submitted Review (Vanity Card) */}
          <section className="mt-2 text-left">
            <div className="flex items-center justify-between px-1 mb-2">
              <h2 className="text-xs font-bold uppercase tracking-wider text-gray-500 font-display flex items-center gap-1.5">
                <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <span>Your Live Praise Card</span>
              </h2>
              <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                Live Preview
              </span>
            </div>

            {/* The Review Card itself */}
            <div
              id="praiseCardToDownload"
              className="relative bg-white rounded-2xl p-5 border border-gray-200/80 shadow-[0_4px_20px_-4px_rgba(15,14,27,0.06)] overflow-hidden"
            >
              {/* Subtle top gradient accent */}
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 via-teal-400 to-indigo-500" />

              {/* Rating Stars + Timestamp */}
              <div className="flex items-center justify-between mb-3.5 pt-0.5">
                <div className="flex items-center gap-1 text-amber-400">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <svg
                      key={s}
                      className={`h-4 w-4 ${s <= rating ? 'text-amber-400 fill-current' : 'text-slate-200 fill-current'}`}
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                  <span className="text-xs font-bold text-gray-700 ml-1.5">{rating.toFixed(1)}</span>
                </div>
                <span className="text-[11px] font-medium text-gray-400 flex items-center gap-1">
                  <Clock className="w-3 h-3" /> Just now
                </span>
              </div>

              {/* Headline */}
              <h3 className="text-base font-bold text-[#0f0e1b] tracking-tight font-display mb-2">
                “{headline}”
              </h3>

              {/* Body Quote */}
              <p className="text-gray-700 text-[13.5px] leading-relaxed mb-4">
                “{reviewBody}”
              </p>

              {/* Author Info & Verification */}
              <div className="flex items-center justify-between pt-3.5 border-t border-gray-100">
                <div className="flex items-center gap-2.5">
                  {review.avatarUrl ? (
                    <img
                      src={review.avatarUrl}
                      alt={fullName}
                      className="size-9 rounded-full object-cover ring-2 ring-emerald-50 shadow-inner"
                    />
                  ) : (
                    <div className="size-9 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 text-white font-bold text-xs flex items-center justify-center ring-2 ring-emerald-50 shadow-inner">
                      {initials}
                    </div>
                  )}
                  <div>
                    <div className="flex items-center gap-1">
                      <span className="text-xs font-bold text-gray-900 leading-tight">{fullName}</span>
                      <svg className="w-3.5 h-3.5 text-emerald-600 fill-current" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <p className="text-[11px] text-gray-500 font-medium leading-none mt-0.5">{authorRole}</p>
                  </div>
                </div>

                {/* Brand verification tag */}
                <div className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded-md border border-gray-200/60">
                  <span className="size-1.5 rounded-full bg-emerald-500" />
                  <span className="text-[10px] font-semibold text-gray-600">{displayBrand}</span>
                </div>
              </div>
            </div>

            {/* Social Share & Download Buttons */}
            <div className="mt-3 flex items-center gap-2">
              <button
                id="downloadCardBtn"
                onClick={handleDownloadCard}
                type="button"
                className="flex-1 py-2.5 px-3 bg-white hover:bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-800 flex items-center justify-center gap-1.5 shadow-xs transition-all active:scale-[0.98] cursor-pointer"
              >
                {downloading ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-emerald-600/30 border-t-emerald-600 rounded-full animate-spin" />
                    <span>Preparing PNG...</span>
                  </>
                ) : downloaded ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span>Saved to Photos!</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 text-emerald-600" />
                    <span>Download Share Card</span>
                  </>
                )}
              </button>

              <button
                onClick={handleShareTwitter}
                aria-label="Share on X"
                className="size-10 bg-white hover:bg-gray-50 border border-gray-200 rounded-xl flex items-center justify-center text-gray-700 hover:text-black transition-colors active:scale-95 shadow-xs cursor-pointer"
                type="button"
              >
                <svg className="size-4 fill-current" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </button>

              <button
                onClick={handleShareLinkedIn}
                aria-label="Share on LinkedIn"
                className="size-10 bg-white hover:bg-gray-50 border border-gray-200 rounded-xl flex items-center justify-center text-[#0a66c2] hover:bg-blue-50/50 transition-colors active:scale-95 shadow-xs cursor-pointer"
                type="button"
              >
                <svg className="size-4 fill-current" viewBox="0 0 24 24">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                </svg>
              </button>
            </div>
          </section>

          {/* Post-Submission Engagement & Reward */}
          <section className="mt-5 space-y-3 text-left">
            {/* Gift / Reward Card */}
            <div className="relative overflow-hidden bg-gradient-to-br from-emerald-900 to-teal-950 rounded-2xl p-4 text-white shadow-md">
              <div className="absolute -right-6 -bottom-6 size-28 rounded-full bg-emerald-500/10 blur-xl pointer-events-none" />
              <div className="flex items-start gap-3">
                <div className="size-10 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-xl shrink-0">
                  🎁
                </div>
                <div className="flex-1">
                  <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-emerald-300">
                    A token of gratitude
                  </span>
                  <h4 className="text-sm font-bold tracking-tight text-white font-display">
                    You unlocked 20% off renewal
                  </h4>
                  <p className="text-xs text-emerald-100/80 mt-0.5 leading-snug">
                    Or choose a $25 Amazon/App Store gift card. Use code at checkout.
                  </p>
                </div>
              </div>

              {/* Promo Code Box + Copy Trigger */}
              <div className="mt-3 pt-3 border-t border-emerald-800/60 flex items-center gap-2">
                <div className="flex-1 bg-black/30 border border-emerald-400/25 rounded-lg px-3 py-1.5 flex items-center justify-between">
                  <span className="font-mono text-xs font-bold tracking-wider text-emerald-300" id="couponCode">
                    PRAISE20
                  </span>
                  <span className="text-[10px] text-gray-400">Valid 30 days</span>
                </div>
                <button
                  onClick={handleCopyCoupon}
                  type="button"
                  className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-lg text-xs font-bold flex items-center gap-1 transition-all active:scale-95 cursor-pointer"
                >
                  {copiedCoupon ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span id="copyBtnText">{copiedCoupon ? 'Copied!' : 'Copy'}</span>
                </button>
              </div>
            </div>

            {/* Referral / Viral Loop */}
            <div className="bg-white rounded-2xl p-4 border border-gray-200/80 flex items-center gap-3 shadow-xs">
              <div className="size-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
                <UserPlus className="w-5 h-5 text-indigo-600" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-xs font-bold text-[#0f0e1b] font-display truncate">Know another founder?</h4>
                <p className="text-[11px] text-gray-500 leading-snug mt-0.5">
                  Invite a friend to {displayBrand} & get 1 month free when they join.
                </p>
              </div>
              <button
                onClick={handleInvite}
                type="button"
                className="shrink-0 px-2.5 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
              >
                <span>{invited ? 'Link Copied!' : 'Invite'}</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            {/* Viral Growth CTA for PandaPraise (collect reviews for yourself) */}
            <div className="bg-gradient-to-r from-purple-50 via-white to-emerald-50 rounded-2xl p-4 border border-purple-200/80 flex items-center justify-between gap-3 shadow-xs">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-bold text-[#6701e6] bg-purple-100/70 px-2 py-0.5 rounded-full uppercase tracking-wider">
                    Collect Proof
                  </span>
                </div>
                <h4 className="text-xs font-bold text-gray-950 font-display mt-1">Need reviews for your product?</h4>
                <p className="text-[11px] text-gray-500 leading-snug mt-0.5">
                  Collect, curate & embed customer praise free in under 2 minutes.
                </p>
              </div>
              <button
                onClick={handleViralSignup}
                type="button"
                className="shrink-0 px-3 py-2 rounded-xl bg-[#6701e6] hover:bg-[#5400bd] text-white text-xs font-bold flex items-center gap-1 transition-all shadow-sm cursor-pointer"
              >
                <span>Try Free</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* If in dashboard testing mode */}
            {onGoToDashboard && (
              <div className="pt-1 flex items-center justify-between text-xs text-gray-500">
                <span>Dashboard Mode</span>
                <button
                  onClick={() => {
                    onClose();
                    onGoToDashboard();
                  }}
                  className="text-[#6701e6] font-bold hover:underline cursor-pointer flex items-center gap-1"
                >
                  <span>Go to Dashboard</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            )}
          </section>

          {/* Next Steps & Return Navigation */}
          <section className="mt-6 space-y-2">
            <button
              onClick={onClose}
              type="button"
              className="w-full py-3 bg-[#0f0e1b] hover:bg-black text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all active:scale-[0.98] cursor-pointer"
            >
              <span>Return to {displayBrand}</span>
              <ExternalLink className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                onResetForm();
                onClose();
              }}
              type="button"
              className="w-full py-2.5 bg-transparent hover:bg-gray-100 text-gray-600 rounded-xl text-xs font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Submit another praise or update this one</span>
            </button>
          </section>
        </main>

        {/* Trust & Verification Footer */}
        <footer className="mt-8 pt-4 px-4 text-center border-t border-gray-200/60">
          <div className="flex items-center justify-center gap-2 text-[11px] font-medium text-gray-400">
            <span className="flex items-center gap-1 text-gray-500 font-semibold">
              <span>Powered by</span>
              <span className="text-emerald-700 font-bold">PandaPraise</span>
              <span>🐾</span>
            </span>
            <span>•</span>
            <span className="flex items-center gap-1 text-gray-400">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              SOC2 &amp; GDPR Compliant
            </span>
          </div>
          <p className="text-[10px] text-gray-400 mt-1">
            Your testimonial will be published in according with {displayBrand}'s terms of service.
          </p>
        </footer>
      </div>
    </div>
  );
};
