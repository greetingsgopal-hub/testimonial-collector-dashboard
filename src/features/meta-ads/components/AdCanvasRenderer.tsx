import React, { useEffect, useRef, useState } from 'react';
import { MetaAdCreative } from '../types';
import { Download, Sparkles, Check } from 'lucide-react';

interface AdCanvasRendererProps {
  ad: MetaAdCreative;
  reviewQuote: string;
}

export const AdCanvasRenderer: React.FC<AdCanvasRendererProps> = ({ ad, reviewQuote }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [downloaded, setDownloaded] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set high-res canvas dimensions
    const width = 1080;
    const height = ad.format === '9:16' ? 1920 : ad.format === '4:5' ? 1350 : 1080;
    canvas.width = width;
    canvas.height = height;

    // 1. Background Gradient based on template style
    const grad = ctx.createLinearGradient(0, 0, width, height);
    if (ad.templateStyle === 'whatsapp_chat_proof') {
      grad.addColorStop(0, '#064e3b'); // Deep Emerald
      grad.addColorStop(1, '#022c22');
    } else if (ad.templateStyle === 'founder_quote_card') {
      grad.addColorStop(0, '#0f172a'); // Slate / Obsidian Dark
      grad.addColorStop(1, '#1e293b');
    } else {
      grad.addColorStop(0, '#4a044e'); // Deep Indian Festive Plum
      grad.addColorStop(1, '#0f172a');
    }
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    // Subtle atmospheric circular ambient light
    const glowGrad = ctx.createRadialGradient(width * 0.8, height * 0.2, 50, width * 0.8, height * 0.2, 400);
    glowGrad.addColorStop(0, 'rgba(52, 211, 153, 0.25)');
    glowGrad.addColorStop(1, 'rgba(52, 211, 153, 0)');
    ctx.fillStyle = glowGrad;
    ctx.fillRect(0, 0, width, height);

    // 2. Top Pattern-Interrupt Hook Pill
    ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
    ctx.beginPath();
    drawRoundRect(ctx, 80, 100, width - 160, 130, 24);
    ctx.fill();

    ctx.fillStyle = '#34d399';
    ctx.font = 'bold 36px sans-serif';
    ctx.textAlign = 'center';
    const hookHeadline = ad.hook?.headline || ad.headline || '';
    ctx.fillText(hookHeadline.slice(0, 48), width / 2, 180);

    // 3. Central Review Card (Clean White Floating Proof Card)
    const cardY = height * 0.25;
    const cardHeight = height * 0.46;
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    drawRoundRect(ctx, 80, cardY, width - 160, cardHeight, 36);
    ctx.fill();

    // 5-Star Rating Row
    ctx.fillStyle = '#f59e0b';
    ctx.font = 'bold 48px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('★★★★★', 140, cardY + 90);

    // Verified Badge
    ctx.fillStyle = '#059669';
    ctx.font = 'bold 28px sans-serif';
    ctx.fillText('✓ VERIFIED INDIAN BUYER', 430, cardY + 85);

    // Wrap & Render Customer Review Quote
    ctx.fillStyle = '#0f172a';
    ctx.font = 'italic 42px sans-serif';
    wrapText(ctx, `"${reviewQuote}"`, 140, cardY + 180, width - 280, 58);

    // Customer Attribution Footer inside Card
    ctx.fillStyle = '#475569';
    ctx.font = 'bold 32px sans-serif';
    ctx.fillText(`— ${ad.customerAttribution}`, 140, cardY + cardHeight - 60);

    // 4. Bottom COD & Trust Badges Bar
    const footerY = height - 220;
    ctx.fillStyle = '#10b981';
    ctx.beginPath();
    drawRoundRect(ctx, 80, footerY, width - 160, 120, 24);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 36px sans-serif';
    ctx.textAlign = 'center';
    const cta = ad.ctaButton || 'ORDER NOW';
    ctx.fillText(
      `${ad.productTitle.toUpperCase()}  •  ${cta.toUpperCase()}`,
      width / 2,
      footerY + 72
    );
  }, [ad, reviewQuote]);

  const handleDownloadPng = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const url = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = `meta-ad-${ad.format.replace(':', 'x')}-${ad.id}.png`;
    a.click();
    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 2500);
  };

  return (
    <div className="space-y-3">
      {/* Canvas Viewport Box */}
      <div className="relative rounded-2xl overflow-hidden border border-gray-800 bg-gray-950 aspect-square flex items-center justify-center shadow-xl group">
        <canvas
          ref={canvasRef}
          className="max-h-full max-w-full object-contain transition-transform duration-300 group-hover:scale-[1.02]"
        />
        <div className="absolute top-2 left-2 px-2.5 py-1 rounded-md bg-gray-950/80 backdrop-blur-md border border-gray-800 text-[10px] font-mono font-bold text-gray-300 flex items-center gap-1.5">
          <Sparkles className="w-3 h-3 text-emerald-400" />
          <span>{ad.format} Resolution</span>
        </div>
      </div>

      {/* High-Impact Download Button */}
      <button
        onClick={handleDownloadPng}
        type="button"
        className="w-full py-2.5 px-3 bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-emerald-500/10 hover:from-emerald-500/20 hover:to-teal-500/20 active:scale-98 text-emerald-300 border border-emerald-500/30 hover:border-emerald-500/60 font-bold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
      >
        {downloaded ? (
          <>
            <Check className="w-3.5 h-3.5 text-emerald-400" />
            <span>Saved {ad.format} PNG!</span>
          </>
        ) : (
          <>
            <Download className="w-3.5 h-3.5" />
            <span>Download PNG ({ad.format})</span>
          </>
        )}
      </button>
    </div>
  );
};

// Helper for roundRect with graceful fallback for all environments
function drawRoundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  if (typeof (ctx as any).roundRect === 'function') {
    (ctx as any).roundRect(x, y, w, h, r);
  } else {
    ctx.rect(x, y, w, h);
  }
}

// Helper to word-wrap review quote on HTML5 Canvas
function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number
) {
  const words = text.split(' ');
  let line = '';
  let currentY = y;

  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + ' ';
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && n > 0) {
      ctx.fillText(line, x, currentY);
      line = words[n] + ' ';
      currentY += lineHeight;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line, x, currentY);
}
