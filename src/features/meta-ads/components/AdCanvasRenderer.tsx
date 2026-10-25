import React, { useEffect, useRef } from 'react';
import { MetaAdCreative } from '../types';

interface AdCanvasRendererProps {
  ad: MetaAdCreative;
  reviewQuote: string;
}

export const AdCanvasRenderer: React.FC<AdCanvasRendererProps> = ({ ad, reviewQuote }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set resolution based on format
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
      grad.addColorStop(0, '#111827'); // Slate Dark
      grad.addColorStop(1, '#1f2937');
    } else {
      grad.addColorStop(0, '#31102F'); // Deep Maroon/Plum for Indian Festive/D2C
      grad.addColorStop(1, '#111827');
    }
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    // 2. Top Pattern-Interrupt Hook Pill
    ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
    ctx.beginPath();
    drawRoundRect(ctx, 80, 100, width - 160, 130, 24);
    ctx.fill();

    ctx.fillStyle = '#34d399';
    ctx.font = 'bold 34px sans-serif';
    ctx.textAlign = 'center';
    const hookHeadline = ad.hook?.headline || ad.headline || '';
    ctx.fillText(hookHeadline.slice(0, 48), width / 2, 180);

    // 3. Central Review Card (WhatsApp Bubble or Clean White Card)
    const cardY = height * 0.25;
    const cardHeight = height * 0.46;
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    drawRoundRect(ctx, 80, cardY, width - 160, cardHeight, 36);
    ctx.fill();

    // 5-Star Rating Row
    ctx.fillStyle = '#fbbf24';
    ctx.font = 'bold 48px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('★★★★★', 140, cardY + 90);

    // Verified Badge
    ctx.fillStyle = '#059669';
    ctx.font = 'bold 28px sans-serif';
    ctx.fillText('✓ VERIFIED INDIAN BUYER', 430, cardY + 85);

    // Wrap & Render Customer Review Quote
    ctx.fillStyle = '#111827';
    ctx.font = 'italic 42px sans-serif';
    wrapText(ctx, `"${reviewQuote}"`, 140, cardY + 180, width - 280, 58);

    // Customer Attribution Footer inside Card
    ctx.fillStyle = '#4b5563';
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
    const cta = ad.ctaButton || 'SHOP NOW';
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
  };

  return (
    <div className="space-y-2">
      <div className="relative rounded-xl overflow-hidden border border-gray-200 dark:border-gray-800 bg-black aspect-square flex items-center justify-center">
        <canvas
          ref={canvasRef}
          className="max-h-full max-w-full object-contain"
        />
      </div>
      <button
        onClick={handleDownloadPng}
        type="button"
        className="w-full py-2 px-3 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 text-emerald-700 dark:text-emerald-300 font-semibold text-xs rounded-lg transition-colors cursor-pointer"
      >
        ⬇ Download Ready-to-Run PNG ({ad.format})
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
