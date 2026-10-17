import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Share2,
  Download,
  Copy,
  Check,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  Palette,
  Send,
} from 'lucide-react';
import { Review } from '../../types';

interface SocialMediaBroadcastHubProps {
  isOpen: boolean;
  onClose: () => void;
  reviews: Review[];
  initialReviewId?: string;
  brandName?: string;
}

// Brand Icons
const LinkedInIcon = ({ className = 'w-4 h-4' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
  </svg>
);

const XTwitterIcon = ({ className = 'w-4 h-4' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const WhatsAppIcon = ({ className = 'w-4 h-4' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2m.01 1.67c2.2 0 4.26.86 5.82 2.42a8.23 8.23 0 0 1 2.41 5.83c0 4.54-3.7 8.24-8.24 8.24-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.2 8.2 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24M8.53 7.33c-.16 0-.36.06-.54.26-.19.2-.72.71-.72 1.73s.74 2.01.84 2.15c.1.14 1.45 2.22 3.52 3.11.49.21.88.34 1.18.44.5.16.95.14 1.31.08.4-.06 1.22-.5 1.4-.98.17-.49.17-.91.12-.99-.05-.08-.18-.13-.37-.23s-1.11-.55-1.28-.61c-.17-.06-.3-.1-.43.1-.13.2-.5 1.01-.61 1.14-.11.14-.22.15-.41.05-.19-.1-.8-.29-1.52-.93-.56-.5-.94-1.11-1.05-1.3-.11-.19-.01-.3.08-.39.09-.08.19-.22.28-.33.1-.11.13-.19.19-.32.07-.13.03-.24-.02-.34s-.43-1.04-.59-1.42c-.16-.38-.32-.32-.44-.33z" />
  </svg>
);

const FacebookIcon = ({ className = 'w-4 h-4' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);

const THEMES = [
  { id: 'purple', name: 'Panda Violet', bg: ['#4c1d95', '#6b21a8', '#9333ea'], text: '#ffffff' },
  { id: 'emerald', name: 'Emerald Trust', bg: ['#064e3b', '#047857', '#059669'], text: '#ffffff' },
  { id: 'midnight', name: 'Midnight Tech', bg: ['#0f172a', '#1e293b', '#334155'], text: '#ffffff' },
  { id: 'sunset', name: 'Sunset Crimson', bg: ['#7c2d12', '#c2410c', '#ea580c'], text: '#ffffff' },
];

export const SocialMediaBroadcastHub: React.FC<SocialMediaBroadcastHubProps> = ({
  isOpen,
  onClose,
  reviews,
  initialReviewId,
  brandName = 'PandaPraise',
}) => {
  const [selectedReviewId, setSelectedReviewId] = useState<string>(() => {
    if (initialReviewId) return initialReviewId;
    return reviews[0]?.id || '';
  });

  const [activeTheme, setActiveTheme] = useState(THEMES[0]);
  const [caption, setCaption] = useState<string>('');
  const [copiedCaption, setCopiedCaption] = useState(false);
  const [copiedImage, setCopiedImage] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const selectedReview = reviews.find((r) => r.id === selectedReviewId) || reviews[0] || {
    id: 'sample',
    name: 'Sarah Jenkins',
    role: 'Founder & CEO',
    company: 'GrowthScale',
    content: 'PandaPraise completely transformed our customer social proof. Conversions increased by 38% in the first week!',
    rating: 5,
  };

  useEffect(() => {
    if (initialReviewId) {
      setSelectedReviewId(initialReviewId);
    } else if (reviews.length > 0 && !selectedReviewId) {
      setSelectedReviewId(reviews[0].id);
    }
  }, [initialReviewId, reviews]);

  // Update caption when selected review changes
  useEffect(() => {
    const author = selectedReview?.name || 'Verified Customer';
    const roleCompany = selectedReview?.role
      ? ` (${selectedReview.role}${selectedReview.company ? ` @ ${selectedReview.company}` : ''})`
      : '';
    const quote = selectedReview?.content || 'Incredible experience!';
    setCaption(
      `" ${quote} "\n\n— ${author}${roleCompany}\n\nVerified Customer Review on @PandaPraise 🐾\n#CustomerLove #SocialProof #CustomerExperience`
    );
  }, [selectedReviewId]);

  // Render High-Res 1080x1080 Canvas Card
  const renderCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const size = 1080;
    canvas.width = size;
    canvas.height = size;

    // 1. Background Gradient
    const gradient = ctx.createLinearGradient(0, 0, size, size);
    gradient.addColorStop(0, activeTheme.bg[0]);
    gradient.addColorStop(0.5, activeTheme.bg[1]);
    gradient.addColorStop(1, activeTheme.bg[2]);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);

    // Decorative subtle rings
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.07)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(size * 0.85, size * 0.15, 300, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(size * 0.1, size * 0.9, 250, 0, Math.PI * 2);
    ctx.stroke();

    // 2. Inner Glass Card Container
    const cardPad = 80;
    const cardW = size - cardPad * 2;
    const cardH = size - cardPad * 2;
    const cardR = 48;

    ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
    ctx.lineWidth = 3;

    // Rounded rectangle function
    ctx.beginPath();
    ctx.roundRect(cardPad, cardPad, cardW, cardH, cardR);
    ctx.fill();
    ctx.stroke();

    // 3. Top Header: Verified Badge & Stars
    const contentX = cardPad + 60;
    let currentY = cardPad + 90;

    // Verified Pill
    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.beginPath();
    ctx.roundRect(contentX, currentY - 30, 260, 48, 24);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 22px system-ui, -apple-system, sans-serif';
    ctx.fillText('✓ VERIFIED REVIEW', contentX + 24, currentY + 2);

    // Star Rating (5 Gold Stars)
    const rating = selectedReview?.rating || 5;
    const starX = cardPad + cardW - 60 - rating * 40;
    ctx.fillStyle = '#fbbf24';
    ctx.font = '36px system-ui, -apple-system, sans-serif';
    for (let i = 0; i < rating; i++) {
      ctx.fillText('★', starX + i * 40, currentY + 4);
    }

    currentY += 100;

    // 4. Large Quote Mark
    ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
    ctx.font = 'bold 120px Georgia, serif';
    ctx.fillText('“', contentX, currentY);

    currentY += 40;

    // 5. Review Content Text (Auto-wrapped)
    ctx.fillStyle = '#ffffff';
    ctx.font = '500 36px system-ui, -apple-system, sans-serif';
    const rawQuote = selectedReview?.content || 'Great service and wonderful customer experience!';
    const maxWidth = cardW - 120;
    const lineHeight = 52;

    const words = rawQuote.split(' ');
    let line = '';
    let linesDrawn = 0;
    const maxLines = 8;

    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + ' ';
      const metrics = ctx.measureText(testLine);
      const testWidth = metrics.width;
      if (testWidth > maxWidth && n > 0) {
        ctx.fillText(line, contentX, currentY);
        line = words[n] + ' ';
        currentY += lineHeight;
        linesDrawn++;
        if (linesDrawn >= maxLines) {
          ctx.fillText(line.trim() + '...', contentX, currentY);
          line = '';
          break;
        }
      } else {
        line = testLine;
      }
    }
    if (line) {
      ctx.fillText(line, contentX, currentY);
    }

    // 6. Bottom Author Info Block
    const bottomY = cardPad + cardH - 120;

    // Avatar Circle
    const avatarR = 44;
    const avatarCenterX = contentX + avatarR;
    const avatarCenterY = bottomY + avatarR;

    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.beginPath();
    ctx.arc(avatarCenterX, avatarCenterY, avatarR, 0, Math.PI * 2);
    ctx.fill();

    // Author Initials
    const author = selectedReview?.name || 'Verified Customer';
    const initials = author
      .split(' ')
      .map((w) => w[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 32px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(initials, avatarCenterX, avatarCenterY + 11);
    ctx.textAlign = 'left';

    // Author Name & Role
    const textStartX = avatarCenterX + avatarR + 24;
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 36px system-ui, -apple-system, sans-serif';
    ctx.fillText(author, textStartX, bottomY + 38);

    const roleText = [selectedReview?.role, selectedReview?.company].filter(Boolean).join(' • ') || 'Happy Client';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.font = '500 24px system-ui, -apple-system, sans-serif';
    ctx.fillText(roleText, textStartX, bottomY + 76);

    // 7. Right Footer Watermark: Panda Praise Badge
    const rightFooterX = cardPad + cardW - 60;
    ctx.textAlign = 'right';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.font = 'bold 22px system-ui, -apple-system, sans-serif';
    ctx.fillText(`🐼 Verified by ${brandName}`, rightFooterX, bottomY + 60);
    ctx.textAlign = 'left';
  };

  useEffect(() => {
    if (isOpen) {
      renderCanvas();
    }
  }, [isOpen, selectedReviewId, activeTheme]);

  // Download High-Res Image
  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setDownloading(true);
    const link = document.createElement('a');
    link.download = `pandapraise-review-${selectedReview?.name ? selectedReview.name.toLowerCase().replace(/\s+/g, '-') : 'testimonial'}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
    setTimeout(() => setDownloading(false), 800);
  };

  // Copy Image to Clipboard
  const handleCopyImage = async () => {
    const canvas = canvasRef.current;
    if (!canvas || !navigator.clipboard) return;
    try {
      canvas.toBlob(async (blob) => {
        if (!blob) return;
        await navigator.clipboard.write([
          new ClipboardItem({ 'image/png': blob }),
        ]);
        setCopiedImage(true);
        setTimeout(() => setCopiedImage(false), 2000);
      });
    } catch (err) {
      console.warn('Clipboard write failed:', err);
    }
  };

  // Copy Caption to Clipboard
  const handleCopyCaption = () => {
    navigator.clipboard.writeText(caption);
    setCopiedCaption(true);
    setTimeout(() => setCopiedCaption(false), 2000);
  };

  // Direct Social Share Intents (100% Reliable, Zero Broken Redirects)
  const shareToLinkedIn = () => {
    const url = `https://www.linkedin.com/feed/?shareActive=true&text=${encodeURIComponent(caption)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const shareToX = () => {
    const url = `https://x.com/intent/post?text=${encodeURIComponent(caption)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const shareToWhatsApp = () => {
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(caption)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const shareToFacebook = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?quote=${encodeURIComponent(caption)}&u=${encodeURIComponent(window.location.origin)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-md animate-fade-in"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-5xl max-h-[92vh] overflow-y-auto rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-slate-100 dark:border-slate-800 sticky top-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur z-20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center shadow-sm">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                  1-Click Social Broadcast Studio
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-[11px] font-bold text-emerald-700 dark:text-emerald-300">
                  Direct Intent Engine
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Generate high-res 1080×1080 branded social cards &amp; broadcast across LinkedIn, X, and WhatsApp instantly.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Studio Body */}
        <div className="p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Canvas Preview & Theme Controls */}
          <div className="lg:col-span-6 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Palette className="w-4 h-4 text-purple-600" />
                <span>1080×1080 Branded Card Preview</span>
              </span>
              {/* Theme selector pills */}
              <div className="flex items-center gap-1.5">
                {THEMES.map((th) => (
                  <button
                    key={th.id}
                    type="button"
                    title={th.name}
                    onClick={() => setActiveTheme(th)}
                    className={`w-6 h-6 rounded-full transition-all cursor-pointer ${
                      activeTheme.id === th.id
                        ? 'ring-2 ring-purple-600 ring-offset-2 scale-110'
                        : 'opacity-70 hover:opacity-100'
                    }`}
                    style={{
                      background: `linear-gradient(135deg, ${th.bg[0]}, ${th.bg[2]})`,
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Canvas Render Container */}
            <div className="aspect-square w-full rounded-2xl overflow-hidden shadow-lg border border-slate-200 dark:border-slate-800 bg-slate-950 flex items-center justify-center relative">
              <canvas
                ref={canvasRef}
                className="w-full h-full object-contain"
                style={{ imageRendering: 'auto' }}
              />
            </div>

            {/* Download & Copy Image Actions */}
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={handleDownload}
                disabled={downloading}
                className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-98"
              >
                <Download className="w-4 h-4" />
                <span>{downloading ? 'Exporting...' : 'Download 1080p PNG'}</span>
              </button>
              <button
                type="button"
                onClick={handleCopyImage}
                className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-98"
              >
                {copiedImage ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span>Copied Card!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 text-slate-500" />
                    <span>Copy Card Image</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Right Column: Review Selection, Composer & 1-Click Broadcast */}
          <div className="lg:col-span-6 space-y-4 flex flex-col justify-between">
            <div className="space-y-4">
              {/* Review Picker */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Select Approved Testimonial
                </label>
                <select
                  value={selectedReviewId}
                  onChange={(e) => setSelectedReviewId(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-white focus:border-purple-600 focus:ring-2 focus:ring-purple-600/10 shadow-2xs cursor-pointer"
                >
                  {reviews.length === 0 ? (
                    <option value="sample">Sarah Jenkins — GrowthScale (Sample)</option>
                  ) : (
                    reviews.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name || 'Anonymous'} — {(r.content || '').slice(0, 50)}...
                      </option>
                    ))
                  )}
                </select>
              </div>

              {/* Caption Composer */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                    <span>Social Media Post Caption</span>
                  </label>
                  <button
                    type="button"
                    onClick={handleCopyCaption}
                    className="text-[11px] font-semibold text-purple-600 hover:text-purple-700 flex items-center gap-1 cursor-pointer"
                  >
                    {copiedCaption ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedCaption ? 'Copied' : 'Copy Text'}</span>
                  </button>
                </div>
                <textarea
                  rows={5}
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-3 text-xs text-slate-900 dark:text-white leading-relaxed focus:border-purple-600 focus:ring-2 focus:ring-purple-600/10 shadow-2xs resize-none"
                />
              </div>

              {/* Quick Prompt Presets */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  1-Click Caption Hooks:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      const quote = selectedReview?.content || '';
                      setCaption(
                        `🚀 Nothing beats authentic customer love!\n\n"${quote}"\n\n— ${selectedReview?.name || 'Customer'}\n\n#CustomerSuccess #Growth #SocialProof`
                      );
                    }}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-purple-50 dark:hover:bg-purple-950/60 border border-slate-200 dark:border-slate-700 text-[11px] font-medium text-slate-700 dark:text-slate-300 cursor-pointer transition-colors"
                  >
                    🚀 Customer Win
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const quote = selectedReview?.content || '';
                      setCaption(
                        `⭐ Honored to receive this 5-star review:\n\n"${quote}"\n\n— ${selectedReview?.name || 'Customer'}\n\nCheck out all verified reviews on our live Proof Wall!`
                      );
                    }}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-purple-50 dark:hover:bg-purple-950/60 border border-slate-200 dark:border-slate-700 text-[11px] font-medium text-slate-700 dark:text-slate-300 cursor-pointer transition-colors"
                  >
                    ⭐ 5-Star Spotlight
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const quote = selectedReview?.content || '';
                      setCaption(
                        `"${quote}"\n\n— ${selectedReview?.name || 'Verified Client'} on @PandaPraise`
                      );
                    }}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-purple-50 dark:hover:bg-purple-950/60 border border-slate-200 dark:border-slate-700 text-[11px] font-medium text-slate-700 dark:text-slate-300 cursor-pointer transition-colors"
                  >
                    💬 Short &amp; Punchy
                  </button>
                </div>
              </div>
            </div>

            {/* 1-Click Broadcast Channels */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Send className="w-3.5 h-3.5 text-purple-600" />
                  <span>1-Click Social Media Broadcast</span>
                </span>
                <span className="text-[10px] text-slate-400">
                  Opens official composer pre-filled
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {/* LinkedIn */}
                <button
                  type="button"
                  onClick={shareToLinkedIn}
                  className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-[#0a66c2] hover:bg-[#084e96] text-white text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95"
                >
                  <LinkedInIcon className="w-4 h-4 fill-white" />
                  <span>LinkedIn</span>
                  <ExternalLink className="w-3 h-3 opacity-70" />
                </button>

                {/* X (Twitter) */}
                <button
                  type="button"
                  onClick={shareToX}
                  className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95"
                >
                  <XTwitterIcon className="w-3.5 h-3.5 fill-white" />
                  <span>Post on X</span>
                  <ExternalLink className="w-3 h-3 opacity-70" />
                </button>

                {/* WhatsApp */}
                <button
                  type="button"
                  onClick={shareToWhatsApp}
                  className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-[#25D366] hover:bg-[#20ba5a] text-white text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95"
                >
                  <WhatsAppIcon className="w-4 h-4 fill-white" />
                  <span>WhatsApp</span>
                  <ExternalLink className="w-3 h-3 opacity-70" />
                </button>

                {/* Facebook */}
                <button
                  type="button"
                  onClick={shareToFacebook}
                  className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-[#1877F2] hover:bg-[#166fe5] text-white text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95"
                >
                  <FacebookIcon className="w-4 h-4 fill-white" />
                  <span>Facebook</span>
                  <ExternalLink className="w-3 h-3 opacity-70" />
                </button>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  Tip: Click <strong>"Download 1080p PNG"</strong> above first to attach the branded card image to your post!
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default SocialMediaBroadcastHub;
