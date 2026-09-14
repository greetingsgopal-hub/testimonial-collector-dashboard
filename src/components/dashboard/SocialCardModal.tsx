import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  X, 
  Download, 
  Share2, 
  Copy, 
  Check, 
  Sparkles, 
  CheckCircle2, 
  Smartphone, 
  Square, 
  Monitor,
  ExternalLink,
  Globe,
  RefreshCw,
  AlertCircle,
  Send,
  Link as LinkIcon,
  Layers
} from 'lucide-react';
import { Review, SocialPlatform } from '../../types';
import { analytics } from '../../lib/analytics';
import { socialClient, SocialStatusResponse } from '../../lib/socialClient';
import { ConnectedAccountsModal } from './ConnectedAccountsModal';

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
    label: 'Square', 
    ratio: '1:1', 
    width: 1080, 
    height: 1080,
    icon: Square 
  },
  story: { 
    label: 'Story/Reel', 
    ratio: '9:16', 
    width: 1080, 
    height: 1920,
    icon: Smartphone 
  },
};

const THEMES: Record<
  SocialCardTheme, 
  { name: string; bgStart: string; bgEnd: string; accent: string; text: string; subtext: string; border: string }
> = {
  midnight: {
    name: 'Midnight Obsidian',
    bgStart: '#090a0f',
    bgEnd: '#131622',
    accent: '#6366f1',
    text: '#ffffff',
    subtext: '#94a3b8',
    border: 'rgba(255, 255, 255, 0.1)',
  },
  brand: {
    name: 'Purple Velvet',
    bgStart: '#1e1035',
    bgEnd: '#0f0728',
    accent: '#ec4899',
    text: '#ffffff',
    subtext: '#cbd5e1',
    border: 'rgba(168, 85, 247, 0.25)',
  },
  emerald: {
    name: 'Emerald Tech',
    bgStart: '#061a14',
    bgEnd: '#020d0a',
    accent: '#10b981',
    text: '#ffffff',
    subtext: '#a7f3d0',
    border: 'rgba(16, 185, 129, 0.2)',
  },
  sunset: {
    name: 'Sunset Flame',
    bgStart: '#200b14',
    bgEnd: '#12050b',
    accent: '#f97316',
    text: '#ffffff',
    subtext: '#fed7aa',
    border: 'rgba(249, 115, 22, 0.2)',
  },
  clean: {
    name: 'Minimal Light',
    bgStart: '#f8fafc',
    bgEnd: '#e2e8f0',
    accent: '#3b82f6',
    text: '#0f172a',
    subtext: '#475569',
    border: 'rgba(15, 23, 42, 0.12)',
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
    description: '1-Click Direct Publishing to your LinkedIn feed via the official Posts API.',
  },
  twitter: {
    name: 'X (Twitter)',
    defaultFormat: 'landscape',
    icon: TwitterIcon,
    color: '#1d9bf0',
    description: 'Official Web Intent pre-fills tweet text and hashtags; direct API available with X developer credentials.',
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
    `"${review.content}"\n\n— ${review.name}${review.role ? `, ${review.role}` : ''}${review.company ? ` at ${review.company}` : ''}\n\n#CustomerLove #Testimonial #SocialProof`
  );

  // Toggles
  const [showStars] = useState(true);
  const [showAuthor] = useState(true);
  const [showBadge] = useState(true);

  // Direct Publishing State
  const [statusData, setStatusData] = useState<SocialStatusResponse | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishSuccess, setPublishSuccess] = useState<{
    platform: string;
    postId?: string;
    postUrl?: string;
    publishedAt?: string;
  } | null>(null);
  const [publishError, setPublishError] = useState<string | null>(null);
  const [isPublishingAll, setIsPublishingAll] = useState(false);
  const [publishAllSummary, setPublishAllSummary] = useState<string | null>(null);
  const [showAccountsModal, setShowAccountsModal] = useState(false);

  // Status feedback for manual tools
  const [isExporting, setIsExporting] = useState(false);
  const [copiedCaption, setCopiedCaption] = useState(false);
  const [shareSuccess, setShareSuccess] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Load connection status on mount
  const loadConnectionStatus = async () => {
    const res = await socialClient.getStatus();
    setStatusData(res);
  };

  useEffect(() => {
    analytics.socialCardOpened(format);
    analytics.socialComposerOpened(review.id);
    analytics.distributionViewed('social');
    loadConnectionStatus();
  }, []);

  // Update content when review changes
  useEffect(() => {
    if (review) {
      setQuoteText(review.content);
      setCaptionText(
        `"${review.content}"\n\n— ${review.name}${review.role ? `, ${review.role}` : ''}${review.company ? ` at ${review.company}` : ''}\n\n#CustomerLove #Testimonial #SocialProof`
      );
      setPublishSuccess(null);
      setPublishError(null);
    }
  }, [review, projectName]);

  const handleSelectPlatform = (platform: SocialPlatform) => {
    setSelectedPlatform(platform);
    setFormat(PLATFORMS[platform].defaultFormat);
    setPublishSuccess(null);
    setPublishError(null);
    analytics.socialPlatformSelected(platform);
  };

  // Render to canvas
  const renderCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { width, height } = FORMAT_CONFIG[format];
    const themeConfig = THEMES[theme];

    canvas.width = width;
    canvas.height = height;

    // Background Gradient
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, themeConfig.bgStart);
    gradient.addColorStop(1, themeConfig.bgEnd);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Subtle ambient glow circle in top corner
    const glow = ctx.createRadialGradient(width * 0.85, height * 0.15, 10, width * 0.85, height * 0.15, width * 0.6);
    glow.addColorStop(0, themeConfig.accent + '25');
    glow.addColorStop(1, 'transparent');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, width, height);

    // Inner Border
    const padding = format === 'story' ? 90 : 64;
    ctx.strokeStyle = themeConfig.border;
    ctx.lineWidth = 2;
    ctx.strokeRect(padding / 2, padding / 2, width - padding, height - padding);

    // Content placement
    let currentY = padding * 1.5;

    // 1. Star Rating
    if (showStars) {
      const starCount = review.rating || 5;
      const starSize = format === 'story' ? 36 : 28;
      const starGap = 10;
      const starStartX = padding;

      ctx.fillStyle = '#f59e0b'; // Amber-400
      for (let i = 0; i < 5; i++) {
        const x = starStartX + i * (starSize + starGap);
        const y = currentY;
        if (i < starCount) {
          drawStar(ctx, x, y, starSize / 2, starSize / 4, 5);
        } else {
          ctx.save();
          ctx.fillStyle = 'rgba(150, 150, 150, 0.3)';
          drawStar(ctx, x, y, starSize / 2, starSize / 4, 5);
          ctx.restore();
        }
      }
      currentY += starSize + 36;
    }

    // 2. Large Decorative Quote Mark
    ctx.fillStyle = themeConfig.accent;
    ctx.font = `bold ${format === 'story' ? '88px' : '72px'} "Outfit", "Inter", sans-serif`;
    ctx.fillText('“', padding, currentY);
    currentY += 24;

    // 3. Quote Text (Multi-line wrap)
    const quoteFontSize = format === 'story' ? 44 : format === 'square' ? 42 : 36;
    const lineHeight = quoteFontSize * 1.38;
    ctx.fillStyle = themeConfig.text;
    ctx.font = `500 ${quoteFontSize}px "Outfit", "Inter", -apple-system, BlinkMacSystemFont, sans-serif`;

    const maxTextWidth = width - padding * 2;
    const maxLines = format === 'story' ? 14 : format === 'square' ? 9 : 6;
    const lines = wrapText(ctx, quoteText, maxTextWidth);

    for (let i = 0; i < Math.min(lines.length, maxLines); i++) {
      let lineToDraw = lines[i];
      if (i === maxLines - 1 && lines.length > maxLines) {
        lineToDraw += '...';
      }
      ctx.fillText(lineToDraw, padding, currentY);
      currentY += lineHeight;
    }

    // 4. Author & Attribution
    if (showAuthor) {
      currentY += 32;

      // Author Name
      ctx.fillStyle = themeConfig.text;
      ctx.font = `bold ${format === 'story' ? '38px' : '32px'} "Outfit", "Inter", sans-serif`;
      ctx.fillText(review.name, padding, currentY);

      // Role & Company
      const roleText = [review.role, review.company].filter(Boolean).join(' • ');
      if (roleText) {
        currentY += format === 'story' ? 42 : 36;
        ctx.fillStyle = themeConfig.subtext;
        ctx.font = `400 ${format === 'story' ? '28px' : '24px'} "Inter", sans-serif`;
        ctx.fillText(roleText, padding, currentY);
      }
    }

    // 5. ReviewVault Verified Badge (Bottom right)
    if (showBadge) {
      const badgeText = `Verified by ${projectName}`;
      ctx.font = `600 20px "Inter", sans-serif`;
      const badgeWidth = ctx.measureText(badgeText).width + 50;
      const badgeHeight = 44;
      const badgeX = width - padding - badgeWidth;
      const badgeY = height - padding - badgeHeight;

      // Badge pill background
      ctx.fillStyle = theme === 'clean' ? 'rgba(0, 0, 0, 0.06)' : 'rgba(255, 255, 255, 0.08)';
      roundRect(ctx, badgeX, badgeY, badgeWidth, badgeHeight, 22);
      ctx.fill();

      // Badge border
      ctx.strokeStyle = themeConfig.border;
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Checkmark icon
      ctx.fillStyle = themeConfig.accent;
      ctx.beginPath();
      ctx.arc(badgeX + 22, badgeY + 22, 9, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = theme === 'clean' ? '#ffffff' : '#000000';
      ctx.font = 'bold 12px sans-serif';
      ctx.fillText('✓', badgeX + 18, badgeY + 26);

      // Badge text
      ctx.fillStyle = themeConfig.text;
      ctx.font = `600 18px "Inter", sans-serif`;
      ctx.fillText(badgeText, badgeX + 38, badgeY + 28);
    }
  }, [format, theme, quoteText, showStars, showAuthor, showBadge, review, projectName]);

  useEffect(() => {
    renderCanvas();
  }, [renderCanvas]);

  // Helper: Draw Star Shape
  function drawStar(ctx: CanvasRenderingContext2D, cx: number, cy: number, outerRadius: number, innerRadius: number, points: number) {
    let rot = (Math.PI / 2) * 3;
    let x = cx;
    let y = cy;
    const step = Math.PI / points;

    ctx.beginPath();
    ctx.moveTo(cx, cy - outerRadius);
    for (let i = 0; i < points; i++) {
      x = cx + Math.cos(rot) * outerRadius;
      y = cy + Math.sin(rot) * outerRadius;
      ctx.lineTo(x, y);
      rot += step;

      x = cx + Math.cos(rot) * innerRadius;
      y = cy + Math.sin(rot) * innerRadius;
      ctx.lineTo(x, y);
      rot += step;
    }
    ctx.lineTo(cx, cy - outerRadius);
    ctx.closePath();
    ctx.fill();
  }

  // Helper: Wrap Text
  function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
    const words = text.replace(/\n+/g, ' ').split(' ');
    const lines: string[] = [];
    let currentLine = '';

    for (let i = 0; i < words.length; i++) {
      const testLine = currentLine ? `${currentLine} ${words[i]}` : words[i];
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxWidth && i > 0) {
        lines.push(currentLine);
        currentLine = words[i];
      } else {
        currentLine = testLine;
      }
    }
    if (currentLine) {
      lines.push(currentLine);
    }
    return lines;
  }

  // Helper: Rounded Rectangle
  function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
    if (w < 2 * r) r = w / 2;
    if (h < 2 * r) r = h / 2;
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  // 1-Click Direct Publish to Platform
  const handleDirectPublish = async () => {
    if (isPublishing) return; // double-click protection
    setPublishError(null);
    setPublishSuccess(null);

    if (review.status !== 'approved') {
      setPublishError('Moderation Gate: Only approved testimonials can be published to social media.');
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) {
      setPublishError('Canvas rendering error. Please try again.');
      return;
    }

    const mediaBase64 = canvas.toDataURL('image/png');
    setIsPublishing(true);
    analytics.socialPublishStarted(selectedPlatform);

    const result = await socialClient.publish({
      reviewId: review.id,
      platform: selectedPlatform,
      caption: captionText,
      mediaBase64,
    });

    setIsPublishing(false);

    if (result.success) {
      setPublishSuccess({
        platform: selectedPlatform,
        postId: result.postId,
        postUrl: result.postUrl,
        publishedAt: result.publishedAt,
      });
      analytics.socialPublishSucceeded(selectedPlatform, result.postId);
      await loadConnectionStatus();
    } else {
      setPublishError(result.error || `Publishing to ${selectedPlatform} failed.`);
      analytics.socialPublishFailed(selectedPlatform, result.error);
      if (result.reauthRequired) {
        analytics.socialReauthRequired(selectedPlatform);
      }
    }
  };

  // Publish to All Connected Platforms
  const handlePublishAll = async () => {
    if (isPublishingAll || !statusData) return;
    const connectedPlatforms = (['linkedin', 'twitter', 'facebook', 'instagram'] as SocialPlatform[]).filter(
      (p) => statusData.connections[p]?.connected
    );

    if (connectedPlatforms.length === 0) {
      setPublishError('No social accounts are currently connected.');
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const mediaBase64 = canvas.toDataURL('image/png');

    setIsPublishingAll(true);
    setPublishError(null);
    setPublishSuccess(null);
    analytics.socialPublishAllStarted(connectedPlatforms.length);

    const results: Record<string, boolean> = {};

    for (const p of connectedPlatforms) {
      const res = await socialClient.publish({
        reviewId: review.id,
        platform: p,
        caption: captionText,
        mediaBase64,
      });
      results[p] = res.success;
    }

    setIsPublishingAll(false);
    analytics.socialPublishAllCompleted();
    await loadConnectionStatus();

    const succeeded = Object.entries(results).filter(([_, s]) => s).map(([p]) => p);
    const failed = Object.entries(results).filter(([_, s]) => !s).map(([p]) => p);

    if (failed.length === 0) {
      setPublishSuccess({
        platform: 'All Connected Platforms',
        publishedAt: new Date().toISOString(),
      });
      setPublishAllSummary(`Successfully published to ${succeeded.join(', ')}!`);
    } else {
      setPublishAllSummary(`Published: ${succeeded.join(', ') || 'None'}. Failed: ${failed.join(', ')}`);
    }
  };

  // Connect Account Trigger
  const handleConnectPlatform = async (platform: SocialPlatform) => {
    analytics.socialConnectStarted(platform);
    const res = await socialClient.initOAuth(platform);
    if (res.authUrl) {
      window.location.href = res.authUrl;
    } else {
      setPublishError(res.error || 'Failed to initialize account connection.');
    }
  };

  // 1-Click Download Image (Manual Fallback)
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

      handleCopyCaption();
      handleDownload();
    }, 'image/png');
  };

  const currentConnection = statusData?.connections[selectedPlatform];
  const isConnected = currentConnection?.connected;
  const isExpired = currentConnection?.status === 'expired';
  const totalConnectedCount = statusData
    ? (['linkedin', 'twitter', 'facebook', 'instagram'] as SocialPlatform[]).filter(
        (p) => statusData.connections[p]?.connected
      ).length
    : 0;

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
                  Social Proof Studio — One-Click Publishing
                </h3>
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  <Globe className="w-2.5 h-2.5" /> Website Widget Live
                </span>
                <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold bg-brand-500/15 text-brand-300 border border-brand-500/30">
                  Direct API Publishing
                </span>
              </div>
              <p className="text-[11px] text-zinc-400">
                Turn approved customer wins into live social posts with one final Publish click.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAccountsModal(true)}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs font-semibold border border-zinc-800 transition-colors cursor-pointer"
            >
              <LinkIcon className="w-3.5 h-3.5 text-brand-400" />
              <span>Accounts</span>
            </button>
            <button
              id="social-card-close"
              onClick={onClose}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
              aria-label="Close social distribution hub"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body: Split view (Controls Left, Live Preview Right) */}
        <div className="flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-12">
          
          {/* Controls Panel (5 cols) */}
          <div className="lg:col-span-5 p-5 sm:p-6 border-b lg:border-b-0 lg:border-r border-zinc-800 space-y-5 bg-zinc-950/40">
            
            {/* 1. Target Social Platform */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400">
                  1. Choose Social Platform
                </label>
                <button
                  onClick={() => setShowAccountsModal(true)}
                  className="text-[11px] text-brand-400 hover:text-brand-300 font-medium cursor-pointer"
                >
                  Manage Accounts
                </button>
              </div>

              <div className="grid grid-cols-4 gap-2">
                {(Object.keys(PLATFORMS) as SocialPlatform[]).map((pKey) => {
                  const p = PLATFORMS[pKey];
                  const Icon = p.icon;
                  const isSelected = selectedPlatform === pKey;
                  const conn = statusData?.connections[pKey];
                  const isConn = conn?.connected;
                  const isExp = conn?.status === 'expired';

                  return (
                    <button
                      key={pKey}
                      id={`platform-tab-${pKey}`}
                      onClick={() => handleSelectPlatform(pKey)}
                      className={`relative px-2.5 py-2.5 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-brand-600/20 border-brand-500 text-white shadow-glow-sm'
                          : 'bg-zinc-900/80 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                      }`}
                    >
                      {/* Connection status indicator dot */}
                      {isConn && (
                        <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-zinc-950" title="Connected" />
                      )}
                      {isExp && (
                        <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-amber-400 ring-2 ring-zinc-950" title="Expired" />
                      )}

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

            {/* 2. Format / Aspect Ratio Selector */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">
                2. Aspect Ratio & Preset
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(Object.keys(FORMAT_CONFIG) as SocialCardFormat[]).map((fKey) => {
                  const config = FORMAT_CONFIG[fKey];
                  const Icon = config.icon;
                  const isSelected = format === fKey;
                  return (
                    <button
                      key={fKey}
                      id={`format-btn-${fKey}`}
                      onClick={() => setFormat(fKey)}
                      className={`px-3 py-2 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-zinc-800 border-white/20 text-white shadow-sm'
                          : 'bg-zinc-900/40 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{config.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3. Theme Selector */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">
                3. Card Theme
              </label>
              <div className="grid grid-cols-5 gap-2">
                {(Object.keys(THEMES) as SocialCardTheme[]).map((tKey) => {
                  const t = THEMES[tKey];
                  const isSelected = theme === tKey;
                  return (
                    <button
                      key={tKey}
                      id={`theme-btn-${tKey}`}
                      onClick={() => setTheme(tKey)}
                      className={`group relative p-1.5 rounded-xl border text-center transition-all cursor-pointer ${
                        isSelected
                          ? 'border-brand-500 shadow-glow-sm scale-105'
                          : 'border-zinc-800 hover:border-zinc-700'
                      }`}
                      title={t.name}
                    >
                      <div
                        className="h-8 rounded-lg w-full flex items-center justify-center border border-white/10"
                        style={{
                          background: `linear-gradient(135deg, ${t.bgStart}, ${t.bgEnd})`,
                        }}
                      >
                        {isSelected && <Check className="w-3.5 h-3.5 text-white drop-shadow" />}
                      </div>
                      <span className="block text-[10px] text-zinc-400 mt-1 truncate">
                        {t.name.split(' ')[0]}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 4. Caption & Quote Text */}
            <div className="space-y-3">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400">
                    4. Social Post Caption
                  </label>
                  <span className="text-[11px] text-zinc-500 font-mono">
                    {captionText.length} chars
                  </span>
                </div>
                <textarea
                  rows={3}
                  value={captionText}
                  onChange={(e) => setCaptionText(e.target.value)}
                  placeholder="Caption for social post..."
                  className="glass-input w-full p-2.5 rounded-xl text-xs text-zinc-200 resize-none font-sans leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                  Graphic Quote Text
                </label>
                <input
                  type="text"
                  value={quoteText}
                  onChange={(e) => setQuoteText(e.target.value)}
                  placeholder="Quote text on graphic..."
                  className="glass-input w-full px-3 py-1.5 rounded-xl text-xs text-zinc-200"
                />
              </div>
            </div>
          </div>

          {/* Preview & Distribution Actions Panel (7 cols) */}
          <div className="lg:col-span-7 p-5 sm:p-6 flex flex-col justify-between bg-zinc-950/80 space-y-5">
            
            {/* Live Canvas Preview Container */}
            <div className="flex-1 flex flex-col items-center justify-center min-h-[260px] sm:min-h-[320px] p-2 sm:p-4 rounded-2xl bg-zinc-900/40 border border-zinc-800/80 overflow-hidden">
              <canvas
                id="social-card-canvas"
                ref={canvasRef}
                className="max-h-[280px] sm:max-h-[340px] w-auto max-w-full rounded-2xl shadow-2xl border border-white/10 object-contain transition-all"
                style={{
                  aspectRatio: FORMAT_CONFIG[format].ratio.replace(':', '/'),
                }}
              />
              <div className="text-[11px] text-zinc-500 mt-2 flex items-center gap-2">
                <span>{PLATFORMS[selectedPlatform].name}</span>
                <span>•</span>
                <span>{FORMAT_CONFIG[format].label}</span>
                <span>•</span>
                <span>{FORMAT_CONFIG[format].width} × {FORMAT_CONFIG[format].height} px (High-DPI)</span>
              </div>
            </div>

            {/* DIRECT 1-CLICK PUBLISHING HUB */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-zinc-900/90 to-zinc-950 border border-zinc-800 shadow-lg space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs font-bold text-white uppercase tracking-wider">
                    One-Click Direct Publishing
                  </span>
                </div>
                
                {isConnected ? (
                  <span className="text-[11px] font-semibold text-emerald-400 flex items-center gap-1 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>{currentConnection?.accountName || 'Connected'}</span>
                  </span>
                ) : isExpired ? (
                  <span className="text-[11px] font-semibold text-amber-400 flex items-center gap-1 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
                    <AlertCircle className="w-3 h-3" />
                    <span>Expired — Reconnect</span>
                  </span>
                ) : (
                  <span className="text-[11px] font-semibold text-zinc-400 bg-zinc-800/60 px-2.5 py-0.5 rounded-full border border-zinc-700/60">
                    Not Connected
                  </span>
                )}
              </div>

              {/* Success Notification */}
              {publishSuccess && (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300 flex items-center justify-between gap-3 animate-fade-in">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <div>
                      <p className="font-semibold">
                        ✓ Published to {PLATFORMS[selectedPlatform].name}!
                      </p>
                      {publishAllSummary && <p className="text-[11px] text-emerald-400">{publishAllSummary}</p>}
                    </div>
                  </div>
                  {publishSuccess.postUrl && (
                    <a
                      href={publishSuccess.postUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors flex items-center gap-1 shrink-0"
                    >
                      <span>View Post</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              )}

              {/* Error Notification */}
              {publishError && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300 flex items-start gap-2.5 animate-fade-in">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <div className="flex-1 space-y-1">
                    <p className="font-semibold">Publishing Notice</p>
                    <p>{publishError}</p>
                  </div>
                </div>
              )}

              {/* Primary Direct Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-1">
                {isConnected ? (
                  <>
                    <button
                      id="direct-publish-btn"
                      onClick={handleDirectPublish}
                      disabled={isPublishing || isPublishingAll}
                      className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs sm:text-sm shadow-glow-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98] cursor-pointer disabled:opacity-50"
                    >
                      {isPublishing ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Publishing to {PLATFORMS[selectedPlatform].name}...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          <span>Publish to {PLATFORMS[selectedPlatform].name}</span>
                        </>
                      )}
                    </button>

                    {totalConnectedCount > 1 && (
                      <button
                        onClick={handlePublishAll}
                        disabled={isPublishing || isPublishingAll}
                        className="w-full sm:w-auto py-3 px-4 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-200 hover:text-white font-semibold text-xs sm:text-sm border border-zinc-700 flex items-center justify-center gap-2 transition-colors cursor-pointer shrink-0 disabled:opacity-50"
                        title="Publish to all currently connected accounts"
                      >
                        <Layers className="w-4 h-4 text-brand-400" />
                        <span>{isPublishingAll ? 'Publishing All...' : `Publish Everywhere (${totalConnectedCount})`}</span>
                      </button>
                    )}
                  </>
                ) : isExpired ? (
                  <button
                    onClick={() => handleConnectPlatform(selectedPlatform)}
                    className="w-full py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs sm:text-sm shadow-glow-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98] cursor-pointer"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>Reconnect {PLATFORMS[selectedPlatform].name}</span>
                  </button>
                ) : (
                  <button
                    id="connect-account-btn"
                    onClick={() => handleConnectPlatform(selectedPlatform)}
                    className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-brand-600 to-pink-600 hover:from-brand-500 hover:to-pink-500 text-white font-bold text-xs sm:text-sm shadow-glow-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98] cursor-pointer"
                  >
                    <LinkIcon className="w-4 h-4" />
                    <span>Connect {PLATFORMS[selectedPlatform].name} to Enable 1-Click Publishing</span>
                  </button>
                )}
              </div>
            </div>

            {/* MANUAL FALLBACK ACTIONS STRIP */}
            <div className="space-y-2 pt-1 border-t border-zinc-800/80">
              <div className="flex items-center justify-between text-[11px] text-zinc-500">
                <span>Manual Fallback Options:</span>
                <button
                  onClick={handleOpenPlatformIntent}
                  className="text-brand-400 hover:text-brand-300 font-medium flex items-center gap-1 cursor-pointer"
                >
                  <span>Open Official Share Web Intent</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-2">
                {/* Fallback 1: Download Image */}
                <button
                  id="social-download-btn"
                  onClick={handleDownload}
                  disabled={isExporting}
                  className="w-full sm:flex-1 py-2 px-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white font-medium text-xs border border-zinc-800 flex items-center justify-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                >
                  <Download className="w-3.5 h-3.5 text-zinc-400" />
                  <span>{isExporting ? 'Exporting...' : `Download ${PLATFORMS[selectedPlatform].name} PNG`}</span>
                </button>

                {/* Fallback 2: Copy Caption */}
                <button
                  id="social-copy-text-btn"
                  onClick={handleCopyCaption}
                  className="w-full sm:w-auto py-2 px-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white font-medium text-xs border border-zinc-800 flex items-center justify-center gap-1.5 transition-colors shrink-0 cursor-pointer"
                >
                  {copiedCaption ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-zinc-400" />
                      <span>Copy Caption</span>
                    </>
                  )}
                </button>

                {/* Fallback 3: Device Share */}
                <button
                  id="social-share-btn"
                  onClick={handleNativeShare}
                  className="w-full sm:w-auto py-2 px-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white font-medium text-xs border border-zinc-800 flex items-center justify-center gap-1.5 transition-colors shrink-0 cursor-pointer"
                  title="Share via device share sheet"
                >
                  {shareSuccess ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Shared!</span>
                    </>
                  ) : (
                    <>
                      <Share2 className="w-3.5 h-3.5 text-brand-400" />
                      <span>Device Share</span>
                    </>
                  )}
                </button>
              </div>

              <div className="flex items-center justify-between text-[11px] text-zinc-500 pt-1">
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  <span>Zero PII: Customer email & internal IDs excluded</span>
                </span>
                <span className="hidden sm:inline">Dual Channel: Website Widget remains live</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Connected Accounts Management Modal */}
      {showAccountsModal && (
        <ConnectedAccountsModal
          isOpen={showAccountsModal}
          onClose={() => setShowAccountsModal(false)}
          onStatusUpdated={loadConnectionStatus}
        />
      )}
    </div>
  );
};
