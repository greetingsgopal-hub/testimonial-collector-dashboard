import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  X, 
  Download, 
  Share2, 
  Copy, 
  Check, 
  Sparkles, 
  Star, 
  CheckCircle2, 
  Smartphone, 
  Square, 
  Monitor,
  ExternalLink,
  Globe
} from 'lucide-react';
import { Review } from '../../types';
import { analytics } from '../../lib/analytics';

const LinkedinIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.2V10.9H6.46M7.83 6.25a1.64 1.64 0 1 0 0 3.28 1.64 1.64 0 0 0 0-3.28z" />
  </svg>
);

const TwitterIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const InstagramIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden="true">
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

const FacebookIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);

export type SocialCardFormat = 'landscape' | 'square' | 'story';
export type SocialCardTheme = 'midnight' | 'brand' | 'emerald' | 'sunset' | 'clean';
export type SocialPlatform = 'linkedin' | 'twitter' | 'instagram' | 'facebook';

interface SocialCardModalProps {
  review: Review | null;
  projectName?: string;
  onClose: () => void;
}

const FORMAT_CONFIG: Record<
  SocialCardFormat, 
  { label: string; ratio: string; width: number; height: number; icon: React.ComponentType<{ className?: string }> }
> = {
  landscape: { 
    label: 'Landscape', 
    ratio: '1.91:1', 
    width: 1200, 
    height: 630,
    icon: Monitor 
  },
  square: { 
    label: 'Square Post', 
    ratio: '1:1', 
    width: 1080, 
    height: 1080,
    icon: Square 
  },
  story: { 
    label: 'Story / Reel', 
    ratio: '9:16', 
    width: 1080, 
    height: 1920,
    icon: Smartphone 
  },
};

const THEMES: Record<
  SocialCardTheme, 
  {
    name: string;
    bgGradient: [string, string, string];
    cardBg: string;
    cardBorder: string;
    textPrimary: string;
    textSecondary: string;
    quoteColor: string;
    accentGlow: string;
    badgeBg: string;
    badgeText: string;
    isLight?: boolean;
  }
> = {
  midnight: {
    name: 'Midnight Obsidian',
    bgGradient: ['#09090b', '#121217', '#18181b'],
    cardBg: 'rgba(24, 24, 27, 0.85)',
    cardBorder: 'rgba(255, 255, 255, 0.12)',
    textPrimary: '#ffffff',
    textSecondary: '#a1a1aa',
    quoteColor: '#8b5cf6',
    accentGlow: 'rgba(139, 92, 246, 0.15)',
    badgeBg: 'rgba(139, 92, 246, 0.15)',
    badgeText: '#c4b5fd',
  },
  brand: {
    name: 'Purple Velvet',
    bgGradient: ['#1e1b4b', '#312e81', '#4c1d95'],
    cardBg: 'rgba(15, 23, 42, 0.75)',
    cardBorder: 'rgba(168, 85, 247, 0.3)',
    textPrimary: '#ffffff',
    textSecondary: '#cbd5e1',
    quoteColor: '#ec4899',
    accentGlow: 'rgba(236, 72, 153, 0.2)',
    badgeBg: 'rgba(236, 72, 153, 0.2)',
    badgeText: '#fbcfe8',
  },
  emerald: {
    name: 'Emerald Tech',
    bgGradient: ['#022c22', '#064e3b', '#065f46'],
    cardBg: 'rgba(6, 78, 59, 0.65)',
    cardBorder: 'rgba(52, 211, 153, 0.25)',
    textPrimary: '#ffffff',
    textSecondary: '#a7f3d0',
    quoteColor: '#34d399',
    accentGlow: 'rgba(52, 211, 153, 0.15)',
    badgeBg: 'rgba(16, 185, 129, 0.2)',
    badgeText: '#6ee7b7',
  },
  sunset: {
    name: 'Sunset Flame',
    bgGradient: ['#2e1065', '#581c87', '#831843'],
    cardBg: 'rgba(30, 27, 75, 0.75)',
    cardBorder: 'rgba(251, 146, 60, 0.3)',
    textPrimary: '#ffffff',
    textSecondary: '#fed7aa',
    quoteColor: '#f97316',
    accentGlow: 'rgba(249, 115, 22, 0.2)',
    badgeBg: 'rgba(249, 115, 22, 0.2)',
    badgeText: '#ffedd5',
  },
  clean: {
    name: 'Minimal Light',
    bgGradient: ['#f8fafc', '#f1f5f9', '#e2e8f0'],
    cardBg: 'rgba(255, 255, 255, 0.95)',
    cardBorder: 'rgba(0, 0, 0, 0.08)',
    textPrimary: '#0f172a',
    textSecondary: '#475569',
    quoteColor: '#6366f1',
    accentGlow: 'rgba(99, 102, 241, 0.1)',
    badgeBg: 'rgba(99, 102, 241, 0.12)',
    badgeText: '#4338ca',
    isLight: true,
  },
};

const PLATFORMS: Record<
  SocialPlatform,
  {
    name: string;
    defaultFormat: SocialCardFormat;
    icon: React.ComponentType<{ className?: string }>;
    color: string;
    description: string;
  }
> = {
  linkedin: {
    name: 'LinkedIn',
    defaultFormat: 'landscape',
    icon: LinkedinIcon,
    color: '#0a66c2',
    description: 'Landscape post (1.91:1). Perfect for founder updates, B2B case studies & LinkedIn feeds.',
  },
  twitter: {
    name: 'X (Twitter)',
    defaultFormat: 'landscape',
    icon: TwitterIcon,
    color: '#1d9bf0',
    description: 'Landscape card (1.91:1). 1-click official Web Intent pre-fills tweet text and hashtags.',
  },
  instagram: {
    name: 'Instagram',
    defaultFormat: 'square',
    icon: InstagramIcon,
    color: '#e1306c',
    description: '1:1 Square Feed post or 9:16 Story. High-DPI asset export for mobile and desktop publishing.',
  },
  facebook: {
    name: 'Facebook',
    defaultFormat: 'landscape',
    icon: FacebookIcon,
    color: '#1877f2',
    description: 'Landscape post (1.91:1). Verified Facebook Share dialog and feed image export.',
  },
};

export const SocialCardModal: React.FC<SocialCardModalProps> = ({
  review,
  projectName = 'ReviewVault',
  onClose,
}) => {
  if (!review) return null;

  // Selected Platform
  const [selectedPlatform, setSelectedPlatform] = useState<SocialPlatform>('linkedin');

  // Format & Theme
  const [format, setFormat] = useState<SocialCardFormat>('landscape');
  const [theme, setTheme] = useState<SocialCardTheme>('midnight');
  
  // Content states
  const [quoteText, setQuoteText] = useState(review.content);
  const [captionText, setCaptionText] = useState(
    `"${review.content}"\n\n— ${review.name}${review.role ? `, ${review.role}` : ''}${review.company ? ` at ${review.company}` : ''}\n\n#socialproof #customerfeedback #${projectName.toLowerCase().replace(/[^a-z0-9]/g, '')}`
  );

  // Toggles
  const [showStars, setShowStars] = useState(true);
  const [showAuthor, setShowAuthor] = useState(true);
  const [showBadge, setShowBadge] = useState(true);

  // Status feedback
  const [isExporting, setIsExporting] = useState(false);
  const [copiedCaption, setCopiedCaption] = useState(false);
  const [shareSuccess, setShareSuccess] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Track initial open
  useEffect(() => {
    analytics.socialCardOpened(format);
    analytics.distributionViewed('social');
  }, []);

  // Update content when review changes
  useEffect(() => {
    if (review) {
      setQuoteText(review.content);
      setCaptionText(
        `"${review.content}"\n\n— ${review.name}${review.role ? `, ${review.role}` : ''}${review.company ? ` at ${review.company}` : ''}\n\n#socialproof #customerfeedback #${projectName.toLowerCase().replace(/[^a-z0-9]/g, '')}`
      );
    }
  }, [review, projectName]);

  // When platform changes, apply default recommended format and log
  const handleSelectPlatform = (platform: SocialPlatform) => {
    setSelectedPlatform(platform);
    setFormat(PLATFORMS[platform].defaultFormat);
    analytics.socialPlatformSelected(platform);
  };

  // Render to canvas
  const renderCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const config = FORMAT_CONFIG[format];
    const themeConfig = THEMES[theme];

    canvas.width = config.width;
    canvas.height = config.height;

    const W = config.width;
    const H = config.height;

    // 1. Background Gradient
    const bgGrad = ctx.createLinearGradient(0, 0, W, H);
    bgGrad.addColorStop(0, themeConfig.bgGradient[0]);
    bgGrad.addColorStop(0.5, themeConfig.bgGradient[1]);
    bgGrad.addColorStop(1, themeConfig.bgGradient[2]);
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, W, H);

    // Subtle ambient glow orbs
    ctx.save();
    const glowGrad = ctx.createRadialGradient(W * 0.8, H * 0.2, 50, W * 0.8, H * 0.2, W * 0.5);
    glowGrad.addColorStop(0, themeConfig.accentGlow);
    glowGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = glowGrad;
    ctx.fillRect(0, 0, W, H);
    ctx.restore();

    // 2. Inner Card Container
    const marginX = format === 'story' ? 80 : format === 'square' ? 90 : 100;
    const marginY = format === 'story' ? 220 : format === 'square' ? 120 : 70;
    const cardWidth = W - marginX * 2;
    const cardHeight = H - marginY * 2;
    const cardRadius = 36;

    ctx.save();
    ctx.beginPath();
    ctx.roundRect(marginX, marginY, cardWidth, cardHeight, cardRadius);
    ctx.fillStyle = themeConfig.cardBg;
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = themeConfig.cardBorder;
    ctx.stroke();
    ctx.restore();

    // 3. Decorative Big Quote Mark
    ctx.save();
    ctx.font = 'bold 160px Georgia, serif';
    ctx.fillStyle = themeConfig.quoteColor;
    ctx.globalAlpha = 0.35;
    ctx.fillText('“', marginX + 60, marginY + 140);
    ctx.restore();

    // 4. Star Rating
    let curY = marginY + (format === 'story' ? 140 : format === 'square' ? 120 : 90);
    const contentLeft = marginX + 70;
    const maxTextWidth = cardWidth - 140;

    if (showStars && review.rating > 0) {
      const starSize = format === 'story' ? 38 : 34;
      const starSpacing = 10;
      const starY = curY;

      for (let i = 0; i < 5; i++) {
        const starX = contentLeft + i * (starSize + starSpacing);
        const isFilled = i < review.rating;
        drawStar(ctx, starX + starSize / 2, starY, starSize / 2, isFilled ? '#fbbf24' : 'rgba(161, 161, 170, 0.3)');
      }
      curY += starSize + 40;
    } else {
      curY += 20;
    }

    // 5. Quote Text wrapping
    ctx.save();
    let fontSize = 42;
    if (format === 'story') {
      fontSize = quoteText.length > 200 ? 36 : quoteText.length > 120 ? 44 : 52;
    } else if (format === 'square') {
      fontSize = quoteText.length > 200 ? 34 : quoteText.length > 120 ? 40 : 46;
    } else {
      fontSize = quoteText.length > 240 ? 28 : quoteText.length > 140 ? 34 : 40;
    }

    ctx.font = `600 ${fontSize}px system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
    ctx.fillStyle = themeConfig.textPrimary;
    const lineHeight = fontSize * 1.45;

    // Wrap text lines
    const words = quoteText.split(' ');
    let line = '';
    const lines: string[] = [];

    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + ' ';
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxTextWidth && n > 0) {
        lines.push(line.trim());
        line = words[n] + ' ';
      } else {
        line = testLine;
      }
    }
    lines.push(line.trim());

    // Max lines safeguard
    const maxLines = format === 'story' ? 14 : format === 'square' ? 9 : 6;
    const displayedLines = lines.slice(0, maxLines);
    if (lines.length > maxLines) {
      displayedLines[maxLines - 1] = displayedLines[maxLines - 1] + '...';
    }

    for (let i = 0; i < displayedLines.length; i++) {
      ctx.fillText(displayedLines[i], contentLeft, curY);
      curY += lineHeight;
    }
    ctx.restore();

    // 6. Author Row & Branding at the bottom of the card
    const bottomPadding = format === 'story' ? 90 : 70;
    const authorY = marginY + cardHeight - bottomPadding;

    if (showAuthor) {
      const avatarRadius = format === 'story' ? 42 : 36;
      const avatarCenterX = contentLeft + avatarRadius;
      const avatarCenterY = authorY - 10;

      ctx.save();
      const avatarGrad = ctx.createLinearGradient(
        avatarCenterX - avatarRadius, 
        avatarCenterY - avatarRadius, 
        avatarCenterX + avatarRadius, 
        avatarCenterY + avatarRadius
      );
      avatarGrad.addColorStop(0, '#8b5cf6');
      avatarGrad.addColorStop(1, '#ec4899');
      ctx.beginPath();
      ctx.arc(avatarCenterX, avatarCenterY, avatarRadius, 0, Math.PI * 2);
      ctx.fillStyle = avatarGrad;
      ctx.fill();

      // Initial
      ctx.font = `bold ${Math.round(avatarRadius * 1.05)}px system-ui, sans-serif`;
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const initial = (review.name || 'C').charAt(0).toUpperCase();
      ctx.fillText(initial, avatarCenterX, avatarCenterY + 2);
      ctx.restore();

      // Name & role
      ctx.save();
      const textX = avatarCenterX + avatarRadius + 24;
      const nameY = avatarCenterY - (review.role || review.company ? 10 : 0);

      ctx.font = `bold ${format === 'story' ? 34 : 30}px system-ui, -apple-system, sans-serif`;
      ctx.fillStyle = themeConfig.textPrimary;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText(review.name, textX, nameY);

      // Role + Company
      const subDetails = [review.role, review.company].filter(Boolean).join(' • ');
      if (subDetails) {
        ctx.font = `500 ${format === 'story' ? 24 : 22}px system-ui, -apple-system, sans-serif`;
        ctx.fillStyle = themeConfig.textSecondary;
        ctx.fillText(subDetails, textX, nameY + 32);
      }
      ctx.restore();
    }

    // 7. Verified / ReviewVault Badge
    if (showBadge) {
      ctx.save();
      const badgeText = `Verified via ${projectName}`;
      const badgeFontSize = format === 'story' ? 22 : 19;
      ctx.font = `600 ${badgeFontSize}px system-ui, -apple-system, sans-serif`;
      const badgeWidth = ctx.measureText(badgeText).width + 48;
      const badgeHeight = 44;
      const badgeX = marginX + cardWidth - badgeWidth - 50;
      const badgeY = authorY - 32;

      ctx.beginPath();
      ctx.roundRect(badgeX, badgeY, badgeWidth, badgeHeight, 22);
      ctx.fillStyle = themeConfig.badgeBg;
      ctx.fill();
      ctx.strokeStyle = themeConfig.cardBorder;
      ctx.lineWidth = 1.5;
      ctx.stroke();

      drawMiniCheck(ctx, badgeX + 22, badgeY + badgeHeight / 2, themeConfig.badgeText);

      ctx.fillStyle = themeConfig.badgeText;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText(badgeText, badgeX + 38, badgeY + badgeHeight / 2 + 1);
      ctx.restore();
    }
  }, [format, theme, quoteText, showStars, showAuthor, showBadge, review, projectName]);

  function drawStar(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number, color: string) {
    ctx.save();
    ctx.beginPath();
    for (let i = 0; i < 5; i++) {
      ctx.lineTo(
        cx + r * Math.cos(((18 + i * 72) * Math.PI) / 180),
        cy - r * Math.sin(((18 + i * 72) * Math.PI) / 180)
      );
      ctx.lineTo(
        cx + (r / 2) * Math.cos(((54 + i * 72) * Math.PI) / 180),
        cy - (r / 2) * Math.sin(((54 + i * 72) * Math.PI) / 180)
      );
    }
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
    ctx.restore();
  }

  function drawMiniCheck(ctx: CanvasRenderingContext2D, x: number, y: number, color: string) {
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(x - 5, y);
    ctx.lineTo(x - 2, y + 4);
    ctx.lineTo(x + 5, y - 4);
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = color;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();
    ctx.restore();
  }

  useEffect(() => {
    renderCanvas();
  }, [renderCanvas]);

  // 1-Click Download Image
  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    setIsExporting(true);
    analytics.socialCardDownloaded(format);

    canvas.toBlob((blob) => {
      if (!blob) {
        setIsExporting(false);
        return;
      }
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      const safeName = (review.name || 'testimonial').toLowerCase().replace(/[^a-z0-9]/g, '-');
      link.download = `${safeName}-${selectedPlatform}-${format}.png`;
      link.href = url;
      link.click();
      URL.revokeObjectURL(url);
      setIsExporting(false);
    }, 'image/png');
  };

  // Copy Post Caption
  const handleCopyCaption = () => {
    navigator.clipboard.writeText(captionText);
    analytics.socialCaptionCopied(selectedPlatform);
    setCopiedCaption(true);
    setTimeout(() => setCopiedCaption(false), 2000);
  };

  // Open Platform Share / Web Intent
  const handleOpenPlatformIntent = () => {
    const origin = window.location.origin;
    analytics.socialIntentOpened(selectedPlatform);

    if (selectedPlatform === 'linkedin') {
      const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(origin)}`;
      window.open(url, '_blank', 'noopener,noreferrer,width=600,height=600');
    } else if (selectedPlatform === 'twitter') {
      const tweetText = `${captionText.substring(0, 240)}`;
      const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}&url=${encodeURIComponent(origin)}`;
      window.open(url, '_blank', 'noopener,noreferrer,width=600,height=500');
    } else if (selectedPlatform === 'facebook') {
      const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(origin)}`;
      window.open(url, '_blank', 'noopener,noreferrer,width=600,height=500');
    }
  };

  // Native Web Share API
  const handleNativeShare = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    analytics.socialCardShared(format);

    canvas.toBlob(async (blob) => {
      if (!blob) return;

      const file = new File([blob], `${review.name}-testimonial.png`, { type: 'image/png' });
      const shareData = {
        title: `${review.name}'s Review of ${projectName}`,
        text: captionText,
        files: [file],
      };

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        try {
          await navigator.share(shareData);
          setShareSuccess(true);
          setTimeout(() => setShareSuccess(false), 3000);
          return;
        } catch (err: any) {
          if (err.name !== 'AbortError') {
            console.error('Share failed:', err);
          }
        }
      }

      // Fallback: Copy caption & download image
      handleCopyCaption();
      handleDownload();
    }, 'image/png');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="glass-panel w-full max-w-5xl rounded-3xl border border-white/15 shadow-2xl overflow-hidden flex flex-col my-auto max-h-[95vh]">
        
        {/* Header with Dual Channel Notice */}
        <div className="px-5 py-4 sm:px-6 sm:py-4.5 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-brand-600 to-pink-500 p-[1px] shadow-glow-sm">
              <div className="w-full h-full bg-zinc-950 rounded-[10px] flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-brand-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-bold font-display text-white">
                  Social Distribution Hub
                </h3>
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  <Globe className="w-2.5 h-2.5" /> Website Widget Live
                </span>
                <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold bg-brand-500/15 text-brand-300 border border-brand-500/30">
                  Social Ready
                </span>
              </div>
              <p className="text-[11px] text-zinc-400">
                Independent multi-platform distribution for LinkedIn, X, Instagram & Facebook
              </p>
            </div>
          </div>

          <button
            id="social-card-close"
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
            aria-label="Close social distribution hub"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body: Split view (Controls Left, Live Preview Right) */}
        <div className="flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-12">
          
          {/* Controls Panel (5 cols) */}
          <div className="lg:col-span-5 p-5 sm:p-6 border-b lg:border-b-0 lg:border-r border-zinc-800 space-y-5 bg-zinc-950/40">
            
            {/* 1. Target Social Platform */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">
                1. Choose Social Platform
              </label>
              <div className="grid grid-cols-4 gap-2">
                {(Object.keys(PLATFORMS) as SocialPlatform[]).map((pKey) => {
                  const p = PLATFORMS[pKey];
                  const Icon = p.icon;
                  const isSelected = selectedPlatform === pKey;
                  return (
                    <button
                      key={pKey}
                      id={`platform-tab-${pKey}`}
                      onClick={() => handleSelectPlatform(pKey)}
                      className={`px-2.5 py-2.5 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-brand-600/20 border-brand-500 text-white shadow-glow-sm'
                          : 'bg-zinc-900/80 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${isSelected ? 'text-brand-400' : 'text-zinc-500'}`} />
                      <span className="text-[11px] truncate">{p.name.split(' ')[0]}</span>
                    </button>
                  );
                })}
              </div>
              <p className="text-[11px] text-zinc-400 mt-2 leading-relaxed">
                {PLATFORMS[selectedPlatform].description}
              </p>
            </div>

            {/* 2. Format / Ratio (Adapted for chosen platform) */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                  2. Graphic Aspect Ratio
                </label>
                <span className="text-[10px] text-zinc-500">
                  {FORMAT_CONFIG[format].width} × {FORMAT_CONFIG[format].height} px
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {(Object.keys(FORMAT_CONFIG) as SocialCardFormat[]).map((fmtKey) => {
                  const cfg = FORMAT_CONFIG[fmtKey];
                  const Icon = cfg.icon;
                  const isSelected = format === fmtKey;
                  return (
                    <button
                      key={fmtKey}
                      id={`social-format-${fmtKey}`}
                      onClick={() => setFormat(fmtKey)}
                      className={`px-3 py-2 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1 transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-brand-600/20 border-brand-500 text-white shadow-glow-sm'
                          : 'bg-zinc-900/80 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                      }`}
                    >
                      <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-brand-400' : 'text-zinc-500'}`} />
                      <span>{cfg.label.split(' ')[0]}</span>
                      <span className="text-[10px] text-zinc-500">{cfg.ratio}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3. Post Caption Composer */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                  3. Social Post Caption
                </label>
                <button
                  onClick={() =>
                    setCaptionText(
                      `"${review.content}"\n\n— ${review.name}${review.role ? `, ${review.role}` : ''}${review.company ? ` at ${review.company}` : ''}\n\n#socialproof #customerfeedback #${projectName.toLowerCase().replace(/[^a-z0-9]/g, '')}`
                    )
                  }
                  className="text-[11px] text-brand-400 hover:text-brand-300 transition-colors cursor-pointer"
                >
                  Reset
                </button>
              </div>
              <textarea
                id="social-caption-input"
                rows={3}
                value={captionText}
                onChange={(e) => setCaptionText(e.target.value)}
                placeholder="Write post caption with hashtags..."
                className="glass-input w-full p-2.5 rounded-xl text-xs text-zinc-200 leading-relaxed resize-none font-mono"
              />
              <div className="flex items-center justify-between text-[10px] text-zinc-500 mt-1">
                <span>{captionText.length} characters</span>
                <span>Original review in database remains untouched</span>
              </div>
            </div>

            {/* 4. Style & Palette Selection */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">
                4. Theme Palette
              </label>
              <div className="grid grid-cols-5 gap-2">
                {(Object.keys(THEMES) as SocialCardTheme[]).map((tKey) => {
                  const t = THEMES[tKey];
                  const isSelected = theme === tKey;
                  return (
                    <button
                      key={tKey}
                      onClick={() => setTheme(tKey)}
                      className={`h-9 rounded-xl border flex items-center justify-center relative transition-all cursor-pointer ${
                        isSelected ? 'ring-2 ring-brand-400 border-white scale-105 shadow-md' : 'border-zinc-800 hover:border-zinc-700'
                      }`}
                      style={{
                        background: `linear-gradient(135deg, ${t.bgGradient[0]}, ${t.bgGradient[2]})`,
                      }}
                      title={t.name}
                    >
                      {isSelected && <Check className={`w-3.5 h-3.5 ${t.isLight ? 'text-zinc-900' : 'text-white'}`} />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 5. Display Elements & Quote Trimming */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">
                5. Card Elements
              </label>
              <div className="grid grid-cols-3 gap-2 mb-3">
                <button
                  type="button"
                  onClick={() => setShowStars(!showStars)}
                  className={`px-2 py-1.5 rounded-xl text-xs font-medium border flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                    showStars ? 'bg-zinc-800 text-white border-zinc-700' : 'bg-zinc-900/50 text-zinc-500 border-zinc-800/80'
                  }`}
                >
                  <Star className={`w-3 h-3 ${showStars ? 'text-amber-400 fill-amber-400' : 'text-zinc-600'}`} />
                  <span>Stars</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowAuthor(!showAuthor)}
                  className={`px-2 py-1.5 rounded-xl text-xs font-medium border flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                    showAuthor ? 'bg-zinc-800 text-white border-zinc-700' : 'bg-zinc-900/50 text-zinc-500 border-zinc-800/80'
                  }`}
                >
                  <CheckCircle2 className={`w-3 h-3 ${showAuthor ? 'text-brand-400' : 'text-zinc-600'}`} />
                  <span>Author</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowBadge(!showBadge)}
                  className={`px-2 py-1.5 rounded-xl text-xs font-medium border flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                    showBadge ? 'bg-zinc-800 text-white border-zinc-700' : 'bg-zinc-900/50 text-zinc-500 border-zinc-800/80'
                  }`}
                >
                  <Sparkles className={`w-3 h-3 ${showBadge ? 'text-emerald-400' : 'text-zinc-600'}`} />
                  <span>Badge</span>
                </button>
              </div>

              {/* Card Quote input */}
              <input
                type="text"
                value={quoteText}
                onChange={(e) => setQuoteText(e.target.value)}
                placeholder="Quote text on graphic..."
                className="glass-input w-full px-3 py-1.5 rounded-xl text-xs text-zinc-200"
              />
            </div>
          </div>

          {/* Preview & Distribution Actions Panel (7 cols) */}
          <div className="lg:col-span-7 p-5 sm:p-6 flex flex-col justify-between bg-zinc-950/80 space-y-5">
            
            {/* Live Canvas Preview Container */}
            <div className="flex-1 flex flex-col items-center justify-center min-h-[280px] sm:min-h-[350px] p-2 sm:p-4 rounded-2xl bg-zinc-900/40 border border-zinc-800/80 overflow-hidden">
              <canvas
                id="social-card-canvas"
                ref={canvasRef}
                className="max-h-[300px] sm:max-h-[360px] w-auto max-w-full rounded-2xl shadow-2xl border border-white/10 object-contain transition-all"
                style={{
                  aspectRatio: FORMAT_CONFIG[format].ratio.replace(':', '/'),
                }}
              />
              <div className="text-[11px] text-zinc-500 mt-2.5 flex items-center gap-2">
                <span>{PLATFORMS[selectedPlatform].name}</span>
                <span>•</span>
                <span>{FORMAT_CONFIG[format].label}</span>
                <span>•</span>
                <span>{FORMAT_CONFIG[format].width} × {FORMAT_CONFIG[format].height} px (High-DPI)</span>
              </div>
            </div>

            {/* Platform Verified Workflow Strip */}
            <div className="p-3 rounded-xl bg-zinc-900/70 border border-zinc-800 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-zinc-200 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>{PLATFORMS[selectedPlatform].name} Distribution Workflow</span>
                </span>
                <span className="text-[10px] text-zinc-400">Verified Platform Integration</span>
              </div>

              {selectedPlatform === 'linkedin' && (
                <div className="text-[11px] text-zinc-400 space-y-2">
                  <p>
                    1-Click LinkedIn Share intent creates an official draft with your live ReviewVault URL. Download the high-DPI card to attach for maximum visual engagement.
                  </p>
                  <div className="flex items-center gap-2 pt-0.5">
                    <button
                      id="linkedin-intent-btn"
                      onClick={handleOpenPlatformIntent}
                      className="px-3 py-1.5 rounded-lg bg-[#0a66c2] hover:bg-[#095196] text-white font-medium text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <LinkedinIcon className="w-3.5 h-3.5" />
                      <span>Open LinkedIn Composer</span>
                      <ExternalLink className="w-3 h-3 opacity-70" />
                    </button>
                    <button
                      onClick={handleCopyCaption}
                      className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-medium text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>{copiedCaption ? 'Copied!' : 'Copy Caption'}</span>
                    </button>
                  </div>
                </div>
              )}

              {selectedPlatform === 'twitter' && (
                <div className="text-[11px] text-zinc-400 space-y-2">
                  <p>
                    Official X Web Intent pre-fills your tweet text and hashtags in one click. Attach the landscape graphic to stop the scroll.
                  </p>
                  <div className="flex items-center gap-2 pt-0.5">
                    <button
                      id="twitter-intent-btn"
                      onClick={handleOpenPlatformIntent}
                      className="px-3 py-1.5 rounded-lg bg-[#1d9bf0] hover:bg-[#1a8cd8] text-white font-medium text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <TwitterIcon className="w-3.5 h-3.5" />
                      <span>Compose on X (Web Intent)</span>
                      <ExternalLink className="w-3 h-3 opacity-70" />
                    </button>
                    <button
                      onClick={handleCopyCaption}
                      className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-medium text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>{copiedCaption ? 'Copied!' : 'Copy Caption'}</span>
                    </button>
                  </div>
                </div>
              )}

              {selectedPlatform === 'instagram' && (
                <div className="text-[11px] text-zinc-400 space-y-2">
                  <p>
                    <strong className="text-zinc-300">Meta API Policy:</strong> Direct programmatic posting is restricted by Meta exclusively to connected Business accounts via the Graph API. For personal & creator accounts: Download the image, copy the caption, and share via mobile or Web Share.
                  </p>
                  <div className="flex items-center gap-2 pt-0.5">
                    <button
                      onClick={handleNativeShare}
                      className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-[#833ab4] via-[#fd1d1d] to-[#fcb045] text-white font-medium text-xs flex items-center gap-1.5 transition-opacity hover:opacity-90 cursor-pointer"
                    >
                      <InstagramIcon className="w-3.5 h-3.5" />
                      <span>Device Share Sheet</span>
                    </button>
                    <button
                      onClick={handleCopyCaption}
                      className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-medium text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>{copiedCaption ? 'Copied!' : 'Copy Caption'}</span>
                    </button>
                  </div>
                </div>
              )}

              {selectedPlatform === 'facebook' && (
                <div className="text-[11px] text-zinc-400 space-y-2">
                  <p>
                    Opens Facebook's verified share dialog to share your live ReviewVault page, or attach the high-res graphic for a photo post.
                  </p>
                  <div className="flex items-center gap-2 pt-0.5">
                    <button
                      id="facebook-intent-btn"
                      onClick={handleOpenPlatformIntent}
                      className="px-3 py-1.5 rounded-lg bg-[#1877f2] hover:bg-[#166fe5] text-white font-medium text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <FacebookIcon className="w-3.5 h-3.5" />
                      <span>Share to Facebook</span>
                      <ExternalLink className="w-3 h-3 opacity-70" />
                    </button>
                    <button
                      onClick={handleCopyCaption}
                      className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-medium text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>{copiedCaption ? 'Copied!' : 'Copy Caption'}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Core Action Buttons Bar */}
            <div className="space-y-2.5 pt-1 border-t border-zinc-800">
              <div className="flex flex-col sm:flex-row items-center gap-2.5">
                {/* Primary: Download Image */}
                <button
                  id="social-download-btn"
                  onClick={handleDownload}
                  disabled={isExporting}
                  className="w-full sm:flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-brand-600 to-pink-600 hover:from-brand-500 hover:to-pink-500 text-white font-semibold text-xs sm:text-sm shadow-glow-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98] cursor-pointer disabled:opacity-50"
                >
                  <Download className="w-4 h-4" />
                  <span>{isExporting ? 'Exporting...' : `Download ${PLATFORMS[selectedPlatform].name} Card (PNG)`}</span>
                </button>

                {/* Secondary: Copy Caption */}
                <button
                  id="social-copy-text-btn"
                  onClick={handleCopyCaption}
                  className="w-full sm:w-auto py-2.5 px-4 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-200 hover:text-white font-medium text-xs sm:text-sm border border-zinc-800 flex items-center justify-center gap-2 transition-colors shrink-0 cursor-pointer"
                >
                  {copiedCaption ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span>Copied Caption!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 text-zinc-400" />
                      <span>Copy Caption</span>
                    </>
                  )}
                </button>

                {/* Tertiary: Device Share */}
                <button
                  id="social-share-btn"
                  onClick={handleNativeShare}
                  className="w-full sm:w-auto py-2.5 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-medium text-xs sm:text-sm border border-zinc-700 flex items-center justify-center gap-2 transition-colors shrink-0 cursor-pointer"
                  title="Share via device share sheet"
                >
                  {shareSuccess ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span>Shared!</span>
                    </>
                  ) : (
                    <>
                      <Share2 className="w-4 h-4 text-brand-400" />
                      <span>Share</span>
                    </>
                  )}
                </button>
              </div>

              <div className="flex items-center justify-between text-[11px] text-zinc-500 pt-1">
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  <span>Zero PII: Customer email & internal IDs excluded</span>
                </span>
                <span className="hidden sm:inline">ReviewVault Dual Channel Distribution</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
