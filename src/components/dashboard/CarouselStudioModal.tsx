import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  X, 
  Download, 
  ChevronLeft, 
  ChevronRight, 
  Copy, 
  Check, 
  Layers, 
  Sliders
} from 'lucide-react';
import { Review } from '../../types';

export type CarouselTheme = 'obsidian' | 'editorial' | 'neon' | 'corporate';

interface CarouselStudioModalProps {
  approvedReviews: Review[];
  projectName?: string;
  websiteUrl?: string;
  initialSelectedReviewIds?: string[];
  onClose: () => void;
}

interface CarouselSlide {
  type: 'hook' | 'review' | 'cta';
  title?: string;
  subtitle?: string;
  review?: Review;
  ctaText?: string;
  pageNumber: number;
  totalPages: number;
}

const THEMES: Record<
  CarouselTheme,
  {
    name: string;
    bgStart: string;
    bgEnd: string;
    cardBg: string;
    accent: string;
    accentGradient: string;
    textColor: string;
    subtextColor: string;
    starColor: string;
    quoteColor: string;
    borderColor: string;
  }
> = {
  obsidian: {
    name: 'SaaS Obsidian Dark',
    bgStart: '#090a0f',
    bgEnd: '#131622',
    cardBg: 'rgba(255, 255, 255, 0.04)',
    accent: '#a855f7',
    accentGradient: 'linear-gradient(135deg, #a855f7, #ec4899)',
    textColor: '#ffffff',
    subtextColor: '#94a3b8',
    starColor: '#f59e0b',
    quoteColor: '#a855f7',
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  editorial: {
    name: 'Minimalist Editorial',
    bgStart: '#18181b',
    bgEnd: '#09090b',
    cardBg: 'rgba(255, 255, 255, 0.03)',
    accent: '#facc15',
    accentGradient: 'linear-gradient(135deg, #fbbf24, #d97706)',
    textColor: '#f8fafc',
    subtextColor: '#a1a1aa',
    starColor: '#fbbf24',
    quoteColor: '#e4e4e7',
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  neon: {
    name: 'Neon Gradient Pop',
    bgStart: '#2e1065',
    bgEnd: '#701a75',
    cardBg: 'rgba(255, 255, 255, 0.08)',
    accent: '#f43f5e',
    accentGradient: 'linear-gradient(135deg, #ec4899, #f43f5e)',
    textColor: '#ffffff',
    subtextColor: '#fbcfe8',
    starColor: '#fde047',
    quoteColor: '#f472b6',
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  corporate: {
    name: 'Corporate Trust Blue',
    bgStart: '#0f172a',
    bgEnd: '#1e293b',
    cardBg: 'rgba(255, 255, 255, 0.05)',
    accent: '#38bdf8',
    accentGradient: 'linear-gradient(135deg, #0284c7, #38bdf8)',
    textColor: '#ffffff',
    subtextColor: '#94a3b8',
    starColor: '#fbbf24',
    quoteColor: '#38bdf8',
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
};

export const CarouselStudioModal: React.FC<CarouselStudioModalProps> = ({
  approvedReviews,
  projectName = 'Panda Praise',
  websiteUrl = 'pandapraise.dev',
  initialSelectedReviewIds,
  onClose,
}) => {
  // Selected review IDs for carousel (minimum 2, max 6)
  const [selectedIds, setSelectedIds] = useState<string[]>(() => {
    if (initialSelectedReviewIds && initialSelectedReviewIds.length >= 2) {
      return initialSelectedReviewIds.slice(0, 6);
    }
    return approvedReviews.slice(0, 4).map((r) => r.id);
  });

  const [theme, setTheme] = useState<CarouselTheme>('obsidian');
  const [activeSlideIndex, setActiveSlideIndex] = useState<number>(0);
  const [hookTitle, setHookTitle] = useState<string>(`What Founders Are Saying About ${projectName}`);
  const [ctaTitle, setCtaTitle] = useState<string>('Ready to turn customer love into social proof?');
  const [ctaButtonText, setCtaButtonText] = useState<string>(`Start Free at ${websiteUrl}`);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [copiedCaption, setCopiedCaption] = useState<boolean>(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const activeTheme = THEMES[theme];

  // Filter reviews currently selected
  const activeReviews = approvedReviews.filter((r) => selectedIds.includes(r.id));

  // Build slide models: Hook (1) + Selected Reviews (N) + Outro CTA (1)
  const totalSlides = activeReviews.length + 2;

  const slides: CarouselSlide[] = [
    {
      type: 'hook',
      title: hookTitle,
      subtitle: `Verified client feedback & real reviews from top leaders.`,
      pageNumber: 1,
      totalPages: totalSlides,
    },
    ...activeReviews.map((rev, i) => ({
      type: 'review' as const,
      review: rev,
      pageNumber: i + 2,
      totalPages: totalSlides,
    })),
    {
      type: 'cta',
      title: ctaTitle,
      ctaText: ctaButtonText,
      pageNumber: totalSlides,
      totalPages: totalSlides,
    },
  ];

  const currentSlide = slides[activeSlideIndex] || slides[0];

  const toggleReview = (id: string) => {
    if (selectedIds.includes(id)) {
      if (selectedIds.length <= 2) return; // Enforce minimum 2 reviews
      setSelectedIds(selectedIds.filter((item) => item !== id));
    } else {
      if (selectedIds.length >= 6) return; // Enforce max 6 reviews
      setSelectedIds([...selectedIds, id]);
    }
    setActiveSlideIndex(0);
  };

  // Render a specific slide onto an HTML5 Canvas at 1080x1080
  const renderSlideToCanvas = useCallback(
    async (slide: CarouselSlide, canvas: HTMLCanvasElement): Promise<void> => {
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const size = 1080;
      canvas.width = size;
      canvas.height = size;

      // 1. Background Gradient
      const grad = ctx.createLinearGradient(0, 0, size, size);
      grad.addColorStop(0, activeTheme.bgStart);
      grad.addColorStop(1, activeTheme.bgEnd);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, size, size);

      // Subtle ambient halo
      const halo = ctx.createRadialGradient(size * 0.8, size * 0.2, 50, size * 0.8, size * 0.2, 500);
      halo.addColorStop(0, `${activeTheme.accent}33`);
      halo.addColorStop(1, 'transparent');
      ctx.fillStyle = halo;
      ctx.fillRect(0, 0, size, size);

      // 2. Header Bar: Panda Praise Brand & Slide Indicator
      ctx.fillStyle = activeTheme.textColor;
      ctx.font = 'bold 30px "Outfit", "Inter", sans-serif';
      ctx.fillText(projectName, 80, 100);

      // Slide Counter pill on top right
      const counterText = `${slide.pageNumber} / ${slide.totalPages}`;
      ctx.font = 'bold 24px "Inter", sans-serif';
      const counterWidth = ctx.measureText(counterText).width + 36;
      ctx.fillStyle = activeTheme.borderColor;
      ctx.beginPath();
      ctx.roundRect(size - 80 - counterWidth, 70, counterWidth, 44, 22);
      ctx.fill();

      ctx.fillStyle = activeTheme.subtextColor;
      ctx.fillText(counterText, size - 80 - counterWidth + 18, 100);

      // 3. Render slide content based on type
      if (slide.type === 'hook') {
        // --- COVER / HOOK SLIDE ---
        // 5 Star Rating
        ctx.fillStyle = activeTheme.starColor;
        for (let s = 0; s < 5; s++) {
          drawStar(ctx, 80 + s * 46, 260, 20, 10, 5);
        }

        // Hook Headline
        ctx.fillStyle = activeTheme.textColor;
        ctx.font = 'bold 64px "Outfit", "Inter", sans-serif';
        wrapText(ctx, slide.title || '', 80, 360, size - 160, 80);

        // Subtitle
        ctx.fillStyle = activeTheme.subtextColor;
        ctx.font = '500 32px "Inter", sans-serif';
        wrapText(ctx, slide.subtitle || '', 80, 680, size - 160, 48);

        // Swipe CTA bar at bottom
        ctx.fillStyle = activeTheme.cardBg;
        ctx.beginPath();
        ctx.roundRect(80, 880, size - 160, 100, 24);
        ctx.fill();
        ctx.strokeStyle = activeTheme.borderColor;
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.fillStyle = activeTheme.textColor;
        ctx.font = 'bold 30px "Outfit", "Inter", sans-serif';
        ctx.fillText('Swipe to read customer reviews ➔', 120, 942);
      } else if (slide.type === 'review' && slide.review) {
        // --- REVIEW SLIDE ---
        const r = slide.review;

        // Big Quote Icon
        ctx.fillStyle = activeTheme.quoteColor;
        ctx.font = 'bold 110px "Outfit", "Inter", serif';
        ctx.fillText('“', 80, 240);

        // Star Rating
        ctx.fillStyle = activeTheme.starColor;
        for (let s = 0; s < r.rating; s++) {
          drawStar(ctx, 160 + s * 40, 200, 16, 8, 5);
        }

        // Testimonial Quote Text
        ctx.fillStyle = activeTheme.textColor;
        ctx.font = '500 42px "Outfit", "Inter", sans-serif';
        const quoteText = `"${r.content}"`;
        wrapText(ctx, quoteText, 80, 330, size - 160, 60, 7);

        // Author Card Container
        const cardY = 790;
        ctx.fillStyle = activeTheme.cardBg;
        ctx.beginPath();
        ctx.roundRect(80, cardY, size - 160, 170, 28);
        ctx.fill();
        ctx.strokeStyle = activeTheme.borderColor;
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Author Name
        ctx.fillStyle = activeTheme.textColor;
        ctx.font = 'bold 36px "Outfit", "Inter", sans-serif';
        ctx.fillText(r.name, 130, cardY + 70);

        // Role & Company
        const roleString = [r.role, r.company].filter(Boolean).join(' • ');
        ctx.fillStyle = activeTheme.subtextColor;
        ctx.font = '500 26px "Inter", sans-serif';
        ctx.fillText(roleString, 130, cardY + 115);

        // Verified Badge on bottom right of author card
        const badgeText = 'Verified Review';
        ctx.font = 'bold 20px "Inter", sans-serif';
        ctx.fillStyle = '#10b981';
        ctx.fillText(`✓ ${badgeText}`, size - 310, cardY + 95);
      } else if (slide.type === 'cta') {
        // --- OUTRO / CTA SLIDE ---
        // Big Centered Praise Panda Icon or Badge
        ctx.fillStyle = activeTheme.accent;
        ctx.font = 'bold 34px "Outfit", "Inter", sans-serif';
        ctx.fillText('PANDA PRAISE • VERIFIED SOCIAL PROOF', 80, 280);

        // Main CTA Headline
        ctx.fillStyle = activeTheme.textColor;
        ctx.font = 'bold 64px "Outfit", "Inter", sans-serif';
        wrapText(ctx, slide.title || '', 80, 380, size - 160, 80);

        // Big CTA Button Graphic
        const btnY = 660;
        ctx.fillStyle = activeTheme.accent;
        ctx.beginPath();
        ctx.roundRect(80, btnY, size - 160, 120, 30);
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 38px "Outfit", "Inter", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(slide.ctaText || 'Get Started Now', size / 2, btnY + 74);
        ctx.textAlign = 'left';

        // Bottom Trust Micro-proof
        ctx.fillStyle = activeTheme.subtextColor;
        ctx.font = '500 26px "Inter", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Automatic website updates • 1-click social media distribution', size / 2, 860);
        ctx.textAlign = 'left';
      }
    },
    [activeTheme, projectName]
  );

  // Helper: Draw 5-pointed star
  const drawStar = (
    ctx: CanvasRenderingContext2D,
    cx: number,
    cy: number,
    outerR: number,
    innerR: number,
    points = 5
  ) => {
    let rot = (Math.PI / 2) * 3;
    let x = cx;
    let y = cy;
    const step = Math.PI / points;

    ctx.beginPath();
    ctx.moveTo(cx, cy - outerR);
    for (let i = 0; i < points; i++) {
      x = cx + Math.cos(rot) * outerR;
      y = cy + Math.sin(rot) * outerR;
      ctx.lineTo(x, y);
      rot += step;

      x = cx + Math.cos(rot) * innerR;
      y = cy + Math.sin(rot) * innerR;
      ctx.lineTo(x, y);
      rot += step;
    }
    ctx.lineTo(cx, cy - outerR);
    ctx.closePath();
    ctx.fill();
  };

  // Helper: Wrap text on canvas
  const wrapText = (
    ctx: CanvasRenderingContext2D,
    text: string,
    x: number,
    y: number,
    maxWidth: number,
    lineHeight: number,
    maxLines = 10
  ) => {
    const words = text.split(' ');
    let line = '';
    let currentY = y;
    let linesDrawn = 0;

    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + ' ';
      const metrics = ctx.measureText(testLine);
      const testWidth = metrics.width;
      if (testWidth > maxWidth && n > 0) {
        ctx.fillText(line, x, currentY);
        line = words[n] + ' ';
        currentY += lineHeight;
        linesDrawn++;
        if (linesDrawn >= maxLines) {
          ctx.fillText('...', x, currentY);
          return;
        }
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line, x, currentY);
  };

  // Re-render live preview whenever slide or theme changes
  useEffect(() => {
    if (canvasRef.current) {
      renderSlideToCanvas(currentSlide, canvasRef.current);
    }
  }, [currentSlide, activeTheme, renderSlideToCanvas]);

  // Download all slides as individual PNGs for Instagram & LinkedIn
  const handleDownloadAllSlides = async () => {
    setIsExporting(true);
    try {
      const tempCanvas = document.createElement('canvas');
      for (let i = 0; i < slides.length; i++) {
        const slide = slides[i];
        await renderSlideToCanvas(slide, tempCanvas);

        const dataUrl = tempCanvas.toDataURL('image/png', 1.0);
        const a = document.createElement('a');
        a.href = dataUrl;
        a.download = `${projectName.toLowerCase().replace(/[^a-z0-9]/g, '-')}-carousel-slide-${i + 1}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        // Small throttle between downloads
        await new Promise((r) => setTimeout(r, 200));
      }
    } catch (err) {
      console.error('[CarouselStudio] Error exporting slides:', err);
    } finally {
      setIsExporting(false);
    }
  };

  // Copy viral carousel post caption
  const handleCopyCaption = () => {
    const quotes = activeReviews
      .map((r) => `⭐ "${r.content.slice(0, 100)}..." — ${r.name} (${r.role}${r.company ? `, ${r.company}` : ''})`)
      .join('\n\n');

    const caption = `Nothing builds trust faster than authentic customer praise. 💬✨\n\nSwipe through to see what founders and teams are saying about ${projectName}:\n\n${quotes}\n\n👉 Join them today at ${websiteUrl}\n\n#CustomerLove #SocialProof #SaaS #Growth #Testimonials #${projectName.replace(/\s+/g, '')}`;

    navigator.clipboard.writeText(caption);
    setCopiedCaption(true);
    setTimeout(() => setCopiedCaption(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="glass-panel w-full max-w-5xl rounded-3xl border border-white/10 shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-zinc-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center">
              <Layers className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <span>Multi-Review Social Carousel Studio</span>
                <span className="px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-300 text-[10px] font-semibold border border-pink-500/30">
                  Canva-Grade
                </span>
              </h2>
              <p className="text-xs text-zinc-400">
                Format multiple reviews into high-converting swipeable carousels for LinkedIn and Instagram.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body: Left Control Panel + Right Canvas Preview */}
        <div className="grid grid-cols-1 lg:grid-cols-12 flex-1 overflow-y-auto">
          {/* Left Controls (5 cols) */}
          <div className="lg:col-span-5 p-6 border-b lg:border-b-0 lg:border-r border-white/10 space-y-6 overflow-y-auto bg-zinc-950/40">
            {/* 1. Theme Selector */}
            <div className="space-y-2.5">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-purple-400" />
                <span>Canva Design Theme</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                {(Object.keys(THEMES) as CarouselTheme[]).map((thKey) => {
                  const th = THEMES[thKey];
                  const isSelected = theme === thKey;
                  return (
                    <button
                      key={thKey}
                      type="button"
                      onClick={() => setTheme(thKey)}
                      className={`p-3 rounded-xl text-left border text-xs font-semibold transition-all ${
                        isSelected
                          ? 'border-purple-500 bg-purple-500/15 text-white shadow-sm'
                          : 'border-white/10 hover:border-white/20 bg-zinc-900/60 text-zinc-400'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <div
                          className="w-3.5 h-3.5 rounded-full border border-white/20 shrink-0"
                          style={{ background: th.accentGradient }}
                        />
                        <span className="truncate">{th.name}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Review Selection (Multi-select) */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                  Included Reviews ({selectedIds.length} of {approvedReviews.length})
                </label>
                <span className="text-[10px] text-zinc-500">Pick 2 to 6</span>
              </div>
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {approvedReviews.map((rev) => {
                  const isChecked = selectedIds.includes(rev.id);
                  return (
                    <div
                      key={rev.id}
                      onClick={() => toggleReview(rev.id)}
                      className={`p-2.5 rounded-xl border text-xs cursor-pointer flex items-center justify-between transition-all ${
                        isChecked
                          ? 'bg-purple-950/30 border-purple-500/40 text-white'
                          : 'bg-zinc-900/40 border-white/5 text-zinc-400 hover:border-white/15'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 truncate mr-2">
                        <div
                          className={`w-4 h-4 rounded-md flex items-center justify-center border shrink-0 transition-colors ${
                            isChecked
                              ? 'bg-purple-600 border-purple-500 text-white'
                              : 'border-zinc-700 bg-zinc-800'
                          }`}
                        >
                          {isChecked && <Check className="w-3 h-3" />}
                        </div>
                        <div className="truncate">
                          <span className="font-semibold text-zinc-200">{rev.name}</span>
                          <span className="text-zinc-500 ml-1.5 truncate">
                            {rev.company || rev.role}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-0.5 text-amber-400 shrink-0">
                        <span>★</span>
                        <span>{rev.rating}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 3. Text Customization */}
            <div className="space-y-3 pt-2 border-t border-white/10">
              <div>
                <label className="block text-[11px] font-semibold text-zinc-400 mb-1">
                  Cover Hook Headline
                </label>
                <input
                  type="text"
                  value={hookTitle}
                  onChange={(e) => setHookTitle(e.target.value)}
                  className="glass-input w-full px-3 py-2 rounded-xl text-xs"
                  placeholder="e.g. Why Founders Love Panda Praise"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-zinc-400 mb-1">
                  Final Slide Headline
                </label>
                <input
                  type="text"
                  value={ctaTitle}
                  onChange={(e) => setCtaTitle(e.target.value)}
                  className="glass-input w-full px-3 py-2 rounded-xl text-xs"
                  placeholder="e.g. Ready to turn customer love into social proof?"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-zinc-400 mb-1">
                  Final Slide CTA Button / Link
                </label>
                <input
                  type="text"
                  value={ctaButtonText}
                  onChange={(e) => setCtaButtonText(e.target.value)}
                  className="glass-input w-full px-3 py-2 rounded-xl text-xs"
                  placeholder="e.g. Start Free at yourwebsite.com"
                />
              </div>
            </div>

            {/* 4. Action Buttons */}
            <div className="space-y-2 pt-2">
              <button
                type="button"
                disabled={isExporting}
                onClick={handleDownloadAllSlides}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-semibold text-xs shadow-glow-sm flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
              >
                {isExporting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Rendering Slides...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    <span>Download All Carousel Slides (PNGs)</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleCopyCaption}
                className="w-full py-2.5 px-4 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white font-medium text-xs border border-white/10 flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                {copiedCaption ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span className="text-emerald-400">Post Caption Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Copy Viral Post Caption</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Right Live Slide Preview (7 cols) */}
          <div className="lg:col-span-7 p-6 flex flex-col items-center justify-between bg-black/40 relative">
            {/* Slide Navigation Pill bar */}
            <div className="flex items-center justify-between w-full max-w-md mb-4 text-xs">
              <span className="font-semibold text-zinc-400 uppercase tracking-wider text-[11px]">
                {currentSlide.type === 'hook'
                  ? 'Slide 1: Hook Cover'
                  : currentSlide.type === 'cta'
                  ? `Slide ${currentSlide.pageNumber}: Final CTA`
                  : `Slide ${currentSlide.pageNumber}: Review by ${currentSlide.review?.name}`}
              </span>
              <span className="text-purple-400 font-mono font-bold">
                {activeSlideIndex + 1} / {totalSlides}
              </span>
            </div>

            {/* The Live Rendered Canvas Frame */}
            <div className="relative w-full max-w-md aspect-square rounded-2xl overflow-hidden shadow-2xl border border-white/15 group">
              <canvas
                ref={canvasRef}
                className="w-full h-full object-contain block bg-zinc-950"
              />

              {/* Prev / Next floating overlay arrows */}
              <button
                type="button"
                disabled={activeSlideIndex === 0}
                onClick={() => setActiveSlideIndex((prev) => Math.max(0, prev - 1))}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-zinc-950/80 hover:bg-zinc-900 border border-white/20 text-white flex items-center justify-center transition-all disabled:opacity-30 cursor-pointer shadow-lg"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <button
                type="button"
                disabled={activeSlideIndex === totalSlides - 1}
                onClick={() => setActiveSlideIndex((prev) => Math.min(totalSlides - 1, prev + 1))}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-zinc-950/80 hover:bg-zinc-900 border border-white/20 text-white flex items-center justify-center transition-all disabled:opacity-30 cursor-pointer shadow-lg"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {/* Slide Dots / Quick Jump */}
            <div className="flex items-center gap-2 mt-5">
              {slides.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActiveSlideIndex(idx)}
                  className={`h-2 rounded-full transition-all cursor-pointer ${
                    activeSlideIndex === idx
                      ? 'w-7 bg-purple-500'
                      : 'w-2 bg-zinc-700 hover:bg-zinc-500'
                  }`}
                  title={`Jump to Slide ${idx + 1}`}
                />
              ))}
            </div>

            <p className="text-[11px] text-zinc-500 mt-3 text-center">
              Format: 1080 × 1080 (Square 1:1) • Ready to upload as swipeable LinkedIn Document or Instagram Carousel.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
