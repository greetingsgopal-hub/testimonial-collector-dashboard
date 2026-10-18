import { useState, useEffect } from 'react';
import type { ChangeEvent } from 'react';
import {
  QrCode,
  Download,
  Copy,
  Printer,
  Check,
  X,
  Upload,
  Camera,
  Star,
  FileCode2,
} from 'lucide-react';

export type QrTargetMode = 'form' | 'wall';
export type CardTheme = 'light' | 'midnight' | 'purple';
export type CenterIconMode = 'initials' | 'custom' | 'panda' | 'none';

export interface ReviewQrCardModalProps {
  isOpen?: boolean;
  onClose?: () => void;
  workspaceId?: string;
  workspaceName?: string;
  userPlan?: 'starter' | 'pro' | 'agency' | 'lifetime';
}

const THEME_STYLES: Record<
  CardTheme,
  {
    name: string;
    cardBg: string;
    textPrimary: string;
    textSecondary: string;
    qrBoxBg: string;
    badgeBg: string;
    canvasBgStart: string;
    canvasBgEnd: string;
    canvasText: string;
    canvasSubtext: string;
  }
> = {
  light: {
    name: 'Clean Light',
    cardBg: 'bg-white text-slate-900 border-slate-200',
    textPrimary: 'text-slate-900',
    textSecondary: 'text-slate-500',
    qrBoxBg: 'bg-white border-slate-200/80',
    badgeBg: 'bg-purple-50 text-purple-700 border-purple-200',
    canvasBgStart: '#FFFFFF',
    canvasBgEnd: '#F8FAFC',
    canvasText: '#0F172A',
    canvasSubtext: '#64748B',
  },
  midnight: {
    name: 'Midnight Dark',
    cardBg: 'bg-[#0F172A] text-white border-slate-800',
    textPrimary: 'text-white',
    textSecondary: 'text-slate-400',
    qrBoxBg: 'bg-white border-white/10',
    badgeBg: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    canvasBgStart: '#0F172A',
    canvasBgEnd: '#1E293B',
    canvasText: '#FFFFFF',
    canvasSubtext: '#94A3B8',
  },
  purple: {
    name: 'Royal Purple',
    cardBg: 'bg-gradient-to-b from-[#5B21B6] to-[#2E1065] text-white border-purple-700',
    textPrimary: 'text-white',
    textSecondary: 'text-purple-200',
    qrBoxBg: 'bg-white border-white/20',
    badgeBg: 'bg-white/15 text-amber-300 border-white/20',
    canvasBgStart: '#5B21B6',
    canvasBgEnd: '#2E1065',
    canvasText: '#FFFFFF',
    canvasSubtext: '#DDD6FE',
  },
};

export default function ReviewQrCardModal({
  isOpen = true,
  onClose,
  workspaceId = 'papasystem',
  workspaceName = 'papasystem',
  userPlan = 'pro',
}: ReviewQrCardModalProps) {
  const [targetMode, setTargetMode] = useState<QrTargetMode>('form');
  const [cardTheme, setCardTheme] = useState<CardTheme>('light');
  const [centerIconMode, setCenterIconMode] = useState<CenterIconMode>('initials');
  const [customLogoUrl, setCustomLogoUrl] = useState<string | null>(null);

  const [headline, setHeadline] = useState<string>('Leave us a review');
  const [showIncentive, setShowIncentive] = useState<boolean>(true);
  const [incentiveText, setIncentiveText] = useState<string>('🎁 Video review unlocks +2x perk');

  const [actionToast, setActionToast] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState<boolean>(false);

  useEffect(() => {
    if (targetMode === 'wall' && headline === 'Leave us a review') {
      setHeadline('See why customers love us');
    } else if (targetMode === 'form' && headline === 'See why customers love us') {
      setHeadline('Leave us a review');
    }
  }, [targetMode]);

  if (!isOpen) return null;

  const cleanSlug = workspaceId.toLowerCase().replace(/[^a-z0-9-]/g, '');
  const targetUrl =
    targetMode === 'form'
      ? `https://pandapraise.com/c/${cleanSlug}`
      : `https://pandapraise.com/w/${cleanSlug}`;
  const displayShortUrl =
    targetMode === 'form'
      ? `pandapraise.com/c/${cleanSlug}`
      : `pandapraise.com/w/${cleanSlug}`;

  // High Error Correction (ECC=H, 30% redundancy) ensures 100% instant scan even with a center badge
  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=600x600&ecc=H&margin=1&data=${encodeURIComponent(
    targetUrl
  )}`;
  const qrSvgUrl = `https://api.qrserver.com/v1/create-qr-code/?size=600x600&ecc=H&margin=1&format=svg&data=${encodeURIComponent(
    targetUrl
  )}`;

  const activeTheme = THEME_STYLES[cardTheme];

  const triggerToast = (msg: string) => {
    setActionToast(msg);
    setTimeout(() => setActionToast(null), 3000);
  };

  const handleCustomLogoUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      setCustomLogoUrl(evt.target?.result as string);
      setCenterIconMode('custom');
      triggerToast('Custom brand logo applied to QR center!');
    };
    reader.readAsDataURL(file);
  };

  // Helper to draw rounded rectangle on Canvas with fallback for older browsers
  const drawRoundRect = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    r: number
  ) => {
    if (typeof ctx.roundRect === 'function') {
      ctx.roundRect(x, y, w, h, r);
    } else {
      ctx.moveTo(x + r, y);
      ctx.lineTo(x + w - r, y);
      ctx.quadraticCurveTo(x + w, y, x + w, y + r);
      ctx.lineTo(x + w, y + h - r);
      ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
      ctx.lineTo(x + r, y + h);
      ctx.quadraticCurveTo(x, y + h, x, y + h - r);
      ctx.lineTo(x, y + r);
      ctx.quadraticCurveTo(x, y, x + r, y);
      ctx.closePath();
    }
  };

  // Render High-DPI 1200x1800 (4"x6" @ 300 DPI) Printable Stand Card onto HTML5 Canvas
  const generateHighResCardCanvas = async (): Promise<HTMLCanvasElement> => {
    const canvas = document.createElement('canvas');
    canvas.width = 1200;
    canvas.height = 1800;
    const ctx = canvas.getContext('2d');
    if (!ctx) return canvas;

    // 1. Background Fill
    const grad = ctx.createLinearGradient(0, 0, 0, 1800);
    grad.addColorStop(0, activeTheme.canvasBgStart);
    grad.addColorStop(1, activeTheme.canvasBgEnd);
    ctx.fillStyle = grad;
    ctx.beginPath();
    drawRoundRect(ctx, 0, 0, 1200, 1800, 64);
    ctx.fill();

    // Subtle Border for Light Mode
    if (cardTheme === 'light') {
      ctx.strokeStyle = '#E2E8F0';
      ctx.lineWidth = 8;
      ctx.strokeRect(4, 4, 1192, 1792);
    }

    ctx.textAlign = 'center';

    // 2. Brand Name Header
    ctx.fillStyle = activeTheme.canvasText;
    ctx.font = '800 58px Inter, system-ui, sans-serif';
    ctx.fillText(workspaceName, 600, 180);

    // 3. 5 Gold Stars
    ctx.fillStyle = '#F59E0B';
    ctx.font = 'bold 64px sans-serif';
    ctx.fillText('★ ★ ★ ★ ★', 600, 275);

    // 4. Call-to-Action Headline
    ctx.fillStyle = activeTheme.canvasText;
    ctx.font = '700 44px Inter, system-ui, sans-serif';
    ctx.fillText(headline, 600, 360);

    // 5. Optional Incentive Pill
    if (showIncentive && incentiveText.trim()) {
      ctx.fillStyle = cardTheme === 'light' ? '#F3E8FF' : 'rgba(255,255,255,0.14)';
      ctx.beginPath();
      drawRoundRect(ctx, 220, 405, 760, 72, 36);
      ctx.fill();

      ctx.fillStyle = cardTheme === 'light' ? '#6D28D9' : '#FDE68A';
      ctx.font = 'bold 28px Inter, system-ui, sans-serif';
      ctx.fillText(incentiveText.trim(), 600, 451);
    }

    // 6. White QR Container Box (with generous quiet zone)
    const qrBoxY = showIncentive ? 530 : 470;
    ctx.fillStyle = '#FFFFFF';
    ctx.shadowColor = 'rgba(15, 23, 42, 0.12)';
    ctx.shadowBlur = 40;
    ctx.beginPath();
    drawRoundRect(ctx, 170, qrBoxY, 860, 860, 48);
    ctx.fill();
    ctx.shadowBlur = 0;

    if (cardTheme === 'light') {
      ctx.strokeStyle = '#E2E8F0';
      ctx.lineWidth = 4;
      ctx.stroke();
    }

    // 7. Load & Draw High-Res QR Matrix
    const qrImg = new Image();
    qrImg.crossOrigin = 'anonymous';
    await new Promise((resolve) => {
      qrImg.onload = resolve;
      qrImg.onerror = resolve;
      qrImg.src = qrImageUrl;
    });
    ctx.drawImage(qrImg, 230, qrBoxY + 60, 740, 740);

    // 8. Draw Buffered Center Icon (Quiet Zone prevents scan failures)
    if (centerIconMode !== 'none') {
      const centerX = 600;
      const centerY = qrBoxY + 430;

      // White Quiet Zone Box
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      drawRoundRect(ctx, centerX - 78, centerY - 78, 156, 156, 36);
      ctx.fill();

      if (centerIconMode === 'custom' && customLogoUrl) {
        const logoImg = new Image();
        await new Promise((resolve) => {
          logoImg.onload = resolve;
          logoImg.onerror = resolve;
          logoImg.src = customLogoUrl;
        });
        ctx.drawImage(logoImg, centerX - 62, centerY - 62, 124, 124);
      } else if (centerIconMode === 'initials') {
        ctx.fillStyle = '#7C3AED';
        ctx.beginPath();
        drawRoundRect(ctx, centerX - 64, centerY - 64, 128, 128, 28);
        ctx.fill();

        ctx.fillStyle = '#FFFFFF';
        ctx.font = '800 54px Inter, system-ui, sans-serif';
        ctx.fillText(workspaceName.slice(0, 2).toUpperCase(), centerX, centerY + 19);
      } else if (centerIconMode === 'panda') {
        ctx.fillStyle = '#F3E8FF';
        ctx.beginPath();
        drawRoundRect(ctx, centerX - 64, centerY - 64, 128, 128, 28);
        ctx.fill();

        ctx.font = '68px sans-serif';
        ctx.fillText('🐼', centerX, centerY + 24);
      }
    }

    // 9. Bottom Scan Instructions & Human-Readable Fallback Link
    const footerY = qrBoxY + 955;
    ctx.fillStyle = activeTheme.canvasText;
    ctx.font = 'bold 34px Inter, system-ui, sans-serif';
    ctx.fillText('📷  Scan with phone camera', 600, footerY);

    ctx.fillStyle = activeTheme.canvasSubtext;
    ctx.font = '600 26px monospace';
    ctx.fillText(displayShortUrl, 600, footerY + 60);

    if (userPlan === 'starter') {
      ctx.fillStyle = activeTheme.canvasSubtext;
      ctx.font = '500 22px Inter, system-ui, sans-serif';
      ctx.fillText('Verified by PandaPraise', 600, 1745);
    }

    return canvas;
  };

  // Action 1: Download Full Printable Stand Card (PNG)
  const handleDownloadFullCardPng = async () => {
    setIsExporting(true);
    try {
      const canvas = await generateHighResCardCanvas();
      const link = document.createElement('a');
      link.download = `${cleanSlug}-qr-review-card.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      triggerToast('Downloaded 300-DPI Printable QR Card (PNG)!');
    } finally {
      setIsExporting(false);
    }
  };

  // Action 2: Download Raw Vector QR Code (SVG)
  const handleDownloadRawSvg = async () => {
    try {
      const res = await fetch(qrSvgUrl);
      const blob = await res.blob();
      const link = document.createElement('a');
      link.download = `${cleanSlug}-raw-qr.svg`;
      link.href = URL.createObjectURL(blob);
      link.click();
      triggerToast('Downloaded raw vector QR code (SVG)!');
    } catch {
      window.open(qrSvgUrl, '_blank', 'noopener,noreferrer');
    }
  };

  // Action 3: Copy Full Card Image to Clipboard
  const handleCopyCardImage = async () => {
    setIsExporting(true);
    try {
      const canvas = await generateHighResCardCanvas();
      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, 'image/png')
      );
      if (blob && navigator.clipboard && window.ClipboardItem) {
        await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
        triggerToast('QR Card image copied to clipboard!');
      } else {
        await navigator.clipboard.writeText(targetUrl);
        triggerToast('Direct QR review link copied to clipboard!');
      }
    } catch {
      await navigator.clipboard.writeText(targetUrl).catch(() => null);
      triggerToast('Direct QR review link copied to clipboard!');
    } finally {
      setIsExporting(false);
    }
  };

  // Action 4: Print Exact Physical Tabletop Tent (4"x6" / A6 or 5"x7" / A5)
  const handlePrintTabletopCard = async (size: '4x6' | '5x7') => {
    setIsExporting(true);
    try {
      const canvas = await generateHighResCardCanvas();
      const dataUrl = canvas.toDataURL('image/png');
      const widthCss = size === '4x6' ? '4in' : '5in';
      const heightCss = size === '4x6' ? '6in' : '7in';

      const printWin = window.open('', '_blank', 'width=800,height=900');
      if (!printWin) {
        triggerToast('Please allow pop-ups to open the print dialog.');
        return;
      }

      printWin.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Print ${workspaceName} QR Card (${size})</title>
            <style>
              @page { size: ${widthCss} ${heightCss}; margin: 0; }
              body {
                margin: 0;
                display: flex;
                align-items: center;
                justify-content: center;
                background: #f8fafc;
                min-height: 100vh;
              }
              img {
                width: ${widthCss};
                height: ${heightCss};
                object-fit: contain;
                box-shadow: 0 10px 30px rgba(0,0,0,0.1);
              }
              @media print {
                body { background: transparent; }
                img { box-shadow: none; width: 100%; height: 100%; }
              }
            </style>
          </head>
          <body>
            <img src="${dataUrl}" onload="setTimeout(() => { window.print(); }, 250);" />
          </body>
        </html>
      `);
      printWin.document.close();
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 font-sans antialiased">
      {/* Modal Container: Clean Rounded Corners, Zero Clipped Right Scrollbar */}
      <div className="bg-white rounded-3xl border border-slate-200 max-w-4xl w-full p-6 sm:p-7 shadow-2xl overflow-hidden">
        
        {/* 1. MODAL HEADER (No Truncated Subtitle) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-purple-50 border border-purple-100 text-purple-600 flex items-center justify-center shrink-0">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 leading-tight">
                Review QR Card Studio
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Customers scan with their phone camera to leave a verified review in seconds.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 self-end sm:self-center">
            {/* Target Switcher: Review Form vs Wall of Love */}
            <div className="inline-flex items-center p-1 rounded-xl bg-slate-100 border border-slate-200">
              <button
                type="button"
                onClick={() => setTargetMode('form')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  targetMode === 'form'
                    ? 'bg-white text-purple-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Review Form
              </button>
              <button
                type="button"
                onClick={() => setTargetMode('wall')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  targetMode === 'wall'
                    ? 'bg-white text-purple-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Wall of Love
              </button>
            </div>

            {onClose && (
              <button
                type="button"
                onClick={onClose}
                aria-label="Close modal"
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* TOAST NOTIFICATION */}
        {actionToast && (
          <div className="mt-4 px-4 py-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Check className="w-4 h-4 text-emerald-600" />
              {actionToast}
            </span>
            <button type="button" onClick={() => setActionToast(null)} className="cursor-pointer">
              ✕
            </button>
          </div>
        )}

        {/* 2. TWO-COLUMN STUDIO BODY */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
          
          {/* LEFT COLUMN: True 2:3 Tabletop Stand Preview Card */}
          <div className="md:col-span-5 bg-slate-50/80 rounded-2xl border border-slate-200/80 p-5 flex flex-col items-center justify-between">
            <div
              className={`w-full max-w-[270px] rounded-2xl border p-5 shadow-lg flex flex-col items-center text-center justify-between transition-all ${activeTheme.cardBg}`}
            >
              {/* Card Top Header */}
              <div className="w-full space-y-1">
                <p className={`text-base font-extrabold tracking-tight ${activeTheme.textPrimary}`}>
                  {workspaceName}
                </p>
                <div className="flex items-center justify-center gap-1 text-amber-400 text-sm">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>
                <p className={`text-xs font-semibold pt-0.5 ${activeTheme.textPrimary}`}>
                  {headline || 'Leave us a review'}
                </p>

                {showIncentive && incentiveText && (
                  <div className="pt-1">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${activeTheme.badgeBg}`}
                    >
                      {incentiveText}
                    </span>
                  </div>
                )}
              </div>

              {/* QR Matrix Container with Buffered Center Icon */}
              <div
                className={`my-3.5 p-3 rounded-2xl border relative flex items-center justify-center shadow-xs ${activeTheme.qrBoxBg}`}
              >
                <img
                  src={qrImageUrl}
                  alt={`QR Code for ${workspaceName}`}
                  className="w-44 h-44 block rounded-lg"
                />

                {centerIconMode !== 'none' && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    {/* 4px White Quiet Zone Buffer so QR Scanners Never Fail */}
                    <div className="w-11 h-11 rounded-xl bg-white p-1 shadow-md flex items-center justify-center border border-slate-100">
                      {centerIconMode === 'custom' && customLogoUrl ? (
                        <img
                          src={customLogoUrl}
                          alt="Brand Logo"
                          className="w-full h-full object-contain rounded-lg"
                        />
                      ) : centerIconMode === 'initials' ? (
                        <div className="w-full h-full rounded-lg bg-purple-600 text-white font-extrabold text-xs flex items-center justify-center">
                          {workspaceName.slice(0, 2).toUpperCase()}
                        </div>
                      ) : (
                        <div className="w-full h-full rounded-lg bg-purple-50 text-base flex items-center justify-center">
                          🐼
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Card Footer: Scan Callout + Short Fallback URL */}
              <div className="w-full space-y-1">
                <div
                  className={`flex items-center justify-center gap-1.5 text-[11px] font-bold ${activeTheme.textPrimary}`}
                >
                  <Camera className="w-3.5 h-3.5 opacity-80" />
                  <span>Scan with phone camera</span>
                </div>
                <p className={`text-[10px] font-mono truncate ${activeTheme.textSecondary}`}>
                  {displayShortUrl}
                </p>
              </div>
            </div>

            <p className="text-[11px] font-medium text-slate-400 mt-3 text-center">
              300-DPI Print-Ready Tabletop & Countertop Stand
            </p>
          </div>

          {/* RIGHT COLUMN: Full Customizer + Export & Global Print Actions */}
          <div className="md:col-span-7 flex flex-col justify-between space-y-4">
            <div className="space-y-4">
              {/* Customizer 1: Card Theme */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  1. Stand Theme Style
                </label>
                <div className="grid grid-cols-3 gap-2.5">
                  {(['light', 'midnight', 'purple'] as CardTheme[]).map((tKey) => (
                    <button
                      key={tKey}
                      type="button"
                      onClick={() => setCardTheme(tKey)}
                      className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center justify-between ${
                        cardTheme === tKey
                          ? 'border-purple-600 bg-purple-50/50 text-purple-900 ring-2 ring-purple-600/15'
                          : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                      }`}
                    >
                      <span>{THEME_STYLES[tKey].name}</span>
                      {cardTheme === tKey && <Check className="w-3.5 h-3.5 text-purple-600" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Customizer 2: Center Brand Badge (Replaces forced Panda-only toggle) */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    2. Center QR Brand Badge
                  </label>
                  <label className="text-[11px] font-bold text-purple-600 hover:text-purple-700 cursor-pointer flex items-center gap-1">
                    <Upload className="w-3 h-3" />
                    <span>Upload Custom Logo</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleCustomLogoUpload}
                      className="hidden"
                    />
                  </label>
                </div>

                <div className="grid grid-cols-4 gap-2">
                  {[
                    { id: 'initials', label: `Initials (${workspaceName.slice(0, 2).toUpperCase()})` },
                    { id: 'custom', label: 'Custom Logo' },
                    { id: 'panda', label: '🐼 Panda' },
                    { id: 'none', label: 'None' },
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => {
                        if (opt.id === 'custom' && !customLogoUrl) {
                          triggerToast('Click "Upload Custom Logo" above to select your logo file.');
                          return;
                        }
                        setCenterIconMode(opt.id as CenterIconMode);
                      }}
                      className={`py-2 px-2.5 rounded-xl border text-[11px] font-bold transition-all cursor-pointer truncate ${
                        centerIconMode === opt.id
                          ? 'border-purple-600 bg-purple-50/50 text-purple-900'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Customizer 3: Custom Headline & Optional Customer Reward */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Card Call-to-Action
                  </label>
                  <input
                    type="text"
                    maxLength={36}
                    value={headline}
                    onChange={(e) => setHeadline(e.target.value)}
                    placeholder="Leave us a review"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:border-purple-600"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Reward / Perk Badge
                    </label>
                    <input
                      type="checkbox"
                      checked={showIncentive}
                      onChange={(e) => setShowIncentive(e.target.checked)}
                      className="rounded text-purple-600 cursor-pointer"
                    />
                  </div>
                  <input
                    type="text"
                    maxLength={40}
                    disabled={!showIncentive}
                    value={incentiveText}
                    onChange={(e) => setIncentiveText(e.target.value)}
                    placeholder="🎁 10% off your next order"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 disabled:bg-slate-50 disabled:text-slate-400 text-xs font-semibold text-slate-800 focus:outline-none focus:border-purple-600"
                  />
                </div>
              </div>
            </div>

            {/* 3. EXPORT & PRINT BUTTONS */}
            <div className="space-y-2.5 pt-2 border-t border-slate-100">
              <button
                type="button"
                disabled={isExporting}
                onClick={handleDownloadFullCardPng}
                className="w-full py-3 px-4 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-60 text-white font-bold text-xs sm:text-sm shadow-sm shadow-purple-200 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Download Full Stand Card (300-DPI PNG)</span>
              </button>

              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={handleDownloadRawSvg}
                  className="py-2.5 px-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <FileCode2 className="w-4 h-4 text-purple-600" />
                  <span>Raw QR Only (SVG)</span>
                </button>

                <button
                  type="button"
                  disabled={isExporting}
                  onClick={handleCopyCardImage}
                  className="py-2.5 px-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Copy className="w-4 h-4 text-purple-600" />
                  <span>Copy Card Image</span>
                </button>
              </div>

              <div className="pt-2">
                <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Print Tabletop Cards (US & Metric Print-Shop Sizes)
                </span>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => handlePrintTabletopCard('4x6')}
                    className="py-2.5 px-3 rounded-xl bg-purple-50/70 hover:bg-purple-100/80 border border-purple-200/80 text-purple-700 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>4" × 6" (A6) Table Tent</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handlePrintTabletopCard('5x7')}
                    className="py-2.5 px-3 rounded-xl bg-purple-50/70 hover:bg-purple-100/80 border border-purple-200/80 text-purple-700 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>5" × 7" (A5) Countertop</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export { ReviewQrCardModal };
