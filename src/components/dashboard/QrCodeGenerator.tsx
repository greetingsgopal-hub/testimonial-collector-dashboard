import React, { useState, useMemo, useCallback } from 'react';
import QRCode from 'qrcode';
import {
  QrCode,
  Download,
  Copy,
  Check,
  Printer,
  Layers,
  X,
  Star,
  Camera,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export interface QrCodeGeneratorProps {
  onClose?: () => void;
}


export type QrStyle = 'rounded' | 'dots' | 'classic';

interface AppleFinish {
  name: string;
  fg: string;
  bg: string;
}

const APPLE_FINISHES: AppleFinish[] = [
  { name: 'Space Black', fg: '#0f172a', bg: '#ffffff' },
];

/**
 * Builds a standards-compliant, scannable QR code SVG with Apple-level styling.
 * Level 'H' Reed-Solomon Error Correction (30% tolerance).
 */
export function generateQrSvg(
  data: string,
  size: number = 320,
  fg: string = '#0f172a',
  bg: string = '#ffffff',
  style: QrStyle = 'classic',
  includeLogo: boolean = true
): string {
  const safeFg = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(fg) ? fg : '#0f172a';
  const safeBg = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(bg) ? bg : '#ffffff';
  const safeData = data.replace(/[<>&"']/g, '');
  const safeSize = Number.isFinite(size) && size > 0 && size <= 2000 ? size : 320;

  const qr = QRCode.create(safeData || 'https://pandapraise.com', {
    errorCorrectionLevel: 'H',
  });

  const modCount = qr.modules.size;
  const margin = 2;
  const totalMods = modCount + margin * 2;
  const cellSize = safeSize / totalMods;

  const centerMod = Math.floor(modCount / 2);
  const logoCutoutRadius = 3;

  let pathData = '';

  for (let row = 0; row < modCount; row++) {
    for (let col = 0; col < modCount; col++) {
      if (!qr.modules.get(row, col)) continue;

      if (
        includeLogo &&
        Math.abs(row - centerMod) <= logoCutoutRadius &&
        Math.abs(col - centerMod) <= logoCutoutRadius
      ) {
        continue;
      }

      const isFinder =
        (row < 7 && col < 7) ||
        (row < 7 && col >= modCount - 7) ||
        (row >= modCount - 7 && col < 7);

      const x = (margin + col) * cellSize;
      const y = (margin + row) * cellSize;

      let rx = 0;
      if (style === 'classic') {
        rx = 0;
      } else if (isFinder) {
        rx = cellSize * 0.25;
      } else if (style === 'dots') {
        rx = cellSize * 0.48;
      } else {
        rx = cellSize * 0.35;
      }

      pathData += `<rect x="${x.toFixed(2)}" y="${y.toFixed(2)}" width="${cellSize.toFixed(2)}" height="${cellSize.toFixed(2)}" rx="${rx.toFixed(2)}" fill="${safeFg}" />`;
    }
  }

  let logoSvg = '';
  if (includeLogo) {
    const badgeSize = (logoCutoutRadius * 2 + 1) * cellSize;
    const badgeX = (margin + centerMod - logoCutoutRadius) * cellSize;
    const badgeY = (margin + centerMod - logoCutoutRadius) * cellSize;
    const badgeRadius = cellSize * 0.9;

    const pandaScale = badgeSize / 100;
    const pandaOffsetX = badgeX;
    const pandaOffsetY = badgeY;

    logoSvg = `
      <g>
        <rect x="${badgeX.toFixed(2)}" y="${badgeY.toFixed(2)}" width="${badgeSize.toFixed(2)}" height="${badgeSize.toFixed(2)}" rx="${badgeRadius.toFixed(2)}" fill="${safeBg}" stroke="${safeFg}" stroke-width="${(cellSize * 0.22).toFixed(2)}" />
        <g transform="translate(${pandaOffsetX.toFixed(2)}, ${pandaOffsetY.toFixed(2)}) scale(${pandaScale.toFixed(4)})">
          <circle cx="28" cy="26" r="12" fill="${safeFg}" />
          <circle cx="72" cy="26" r="12" fill="${safeFg}" />
          <circle cx="50" cy="55" r="34" fill="${safeBg}" stroke="${safeFg}" stroke-width="5" />
          <ellipse cx="38" cy="52" rx="9" ry="12" transform="rotate(-15 38 52)" fill="${safeFg}" />
          <ellipse cx="62" cy="52" rx="9" ry="12" transform="rotate(15 62 52)" fill="${safeFg}" />
          <circle cx="39" cy="49" r="3.2" fill="${safeBg}" />
          <circle cx="61" cy="49" r="3.2" fill="${safeBg}" />
          <ellipse cx="50" cy="68" rx="6" ry="4" fill="${safeFg}" />
          <path d="M46 74 Q50 77 54 74" stroke="${safeFg}" stroke-width="2.8" fill="none" stroke-linecap="round" />
        </g>
      </g>
    `;
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${safeSize} ${safeSize}" width="${safeSize}" height="${safeSize}" shape-rendering="geometricPrecision">
    <rect width="${safeSize}" height="${safeSize}" fill="${safeBg}" rx="${safeSize * 0.08}"/>
    ${pathData}
    ${logoSvg}
  </svg>`;
}

export const QrCodeGenerator: React.FC<QrCodeGeneratorProps> = ({ onClose }) => {
  const { collectionForm, project } = useAuth();
  const [activeTab, setActiveTab] = useState<'form' | 'wall'>('form');
  const [qrStyle, setQrStyle] = useState<QrStyle>('classic');
  const [selectedFinish, setSelectedFinish] = useState<AppleFinish>(APPLE_FINISHES[0]);
  const [includeEmblem, setIncludeEmblem] = useState(true);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedImage, setCopiedImage] = useState(false);
  const [isExporting, setIsExporting] = useState(false);


  const collectionUrl = collectionForm
    ? `${window.location.origin}/c/${collectionForm.publicSlug}`
    : `${window.location.origin}/c/feedback`;

  const wallUrl = project
    ? `${window.location.origin}/love/${project.slug || project.id}`
    : `${window.location.origin}/love/demo`;

  const activeUrl = activeTab === 'form' ? collectionUrl : wallUrl;

  const qrSvg = useMemo(() => {
    return generateQrSvg(activeUrl, 320, selectedFinish.fg, selectedFinish.bg, qrStyle, includeEmblem);
  }, [activeUrl, selectedFinish, qrStyle, includeEmblem]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(activeUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const renderSvgToBlob = useCallback(async (size: number): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const highResSvg = generateQrSvg(activeUrl, size, selectedFinish.fg, selectedFinish.bg, qrStyle, includeEmblem);
      const svgBlob = new Blob([highResSvg], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(svgBlob);
      const img = new Image();

      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          URL.revokeObjectURL(url);
          reject(new Error('Canvas context unavailable'));
          return;
        }
        ctx.fillStyle = selectedFinish.bg;
        ctx.fillRect(0, 0, size, size);
        ctx.drawImage(img, 0, 0, size, size);
        URL.revokeObjectURL(url);

        canvas.toBlob((blob) => {
          if (blob) resolve(blob);
          else reject(new Error('Failed to generate PNG blob'));
        }, 'image/png');
      };

      img.onerror = (err) => {
        URL.revokeObjectURL(url);
        reject(err);
      };

      img.src = url;
    });
  }, [activeUrl, selectedFinish, qrStyle, includeEmblem]);

  const handleDownloadPng = async () => {
    setIsExporting(true);
    try {
      const blob = await renderSvgToBlob(1200);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `panda-praise-qr-${activeTab}.png`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error('PNG export failed:', e);
    } finally {
      setIsExporting(false);
    }
  };

  const handleDownloadSvg = () => {
    const blob = new Blob([qrSvg], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `panda-praise-qr-${activeTab}.svg`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopyImage = async () => {
    try {
      const blob = await renderSvgToBlob(800);
      if (navigator.clipboard && window.ClipboardItem) {
        await navigator.clipboard.write([
          new ClipboardItem({ 'image/png': blob }),
        ]);
        setCopiedImage(true);
        setTimeout(() => setCopiedImage(false), 2000);
      } else {
        handleDownloadPng();
      }
    } catch (e) {
      console.warn('Clipboard writeImage failed, falling back to download:', e);
      handleDownloadPng();
    }
  };

  const handlePrintStandee = (preset: '4x6' | '5x7') => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const dimensions = preset === '4x6'
      ? { width: '4in', height: '6in', name: '4" × 6" Table Tent' }
      : { width: '5in', height: '7in', name: '5" × 7" Counter Stand' };

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>${dimensions.name} - Panda Praise</title>
          <style>
            @page {
              size: ${dimensions.width} ${dimensions.height};
              margin: 0;
            }
            body {
              margin: 0;
              padding: 0.35in;
              font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", Roboto, sans-serif;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              text-align: center;
              box-sizing: border-box;
              height: 100vh;
              background: #ffffff;
              color: #0f172a;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            .card {
              border: 1.5px dashed #e2e8f0;
              border-radius: 24px;
              padding: 28px;
              width: 100%;
              max-width: 340px;
              box-sizing: border-box;
              display: flex;
              flex-direction: column;
              align-items: center;
              background: #fafafa;
            }
            .brand {
              display: flex;
              align-items: center;
              gap: 6px;
              font-size: 13px;
              font-weight: 700;
              color: #0f172a;
              margin-bottom: 12px;
            }
            h1 {
              font-size: 20px;
              font-weight: 800;
              margin: 0 0 6px 0;
              color: #0f172a;
              letter-spacing: -0.02em;
            }
            p.sub {
              font-size: 12px;
              color: #64748b;
              margin: 0 0 16px 0;
              line-height: 1.4;
            }
            .qr-wrap {
              width: 190px;
              height: 190px;
              display: flex;
              align-items: center;
              justify-content: center;
              margin-bottom: 16px;
              background: #ffffff;
              border-radius: 18px;
              padding: 12px;
              box-shadow: 0 4px 12px rgba(0,0,0,0.05);
            }
            .qr-wrap svg {
              width: 100%;
              height: 100%;
            }
            .footer {
              font-size: 11px;
              color: #94a3b8;
              font-weight: 600;
            }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="brand">🐼 Panda Praise</div>
            <h1>Enjoyed your experience?</h1>
            <p class="sub">Scan with your camera to leave a quick review</p>
            <div class="qr-wrap">
              ${qrSvg}
            </div>
            <div class="footer">
              Scan with iPhone or Android camera
            </div>
          </div>
          <script>
            window.onload = function() {
              setTimeout(function() {
                window.print();
              }, 250);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const businessName = (collectionForm as any)?.settings?.brandName || project?.name || 'PandaPraise';

  return (
    <div className="space-y-6 font-sans">
      
      {/* ── Header with Title, Destination Switcher & Close Button ── */}
      <div className="flex items-center justify-between gap-3 pb-4 border-b border-slate-200/80 dark:border-slate-800">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-2xl bg-violet-600/10 dark:bg-violet-500/20 border border-violet-600/20 dark:border-violet-500/30 flex items-center justify-center text-violet-700 dark:text-violet-400 shadow-2xs shrink-0">
            <QrCode className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h2 className="text-base sm:text-lg font-bold text-slate-950 dark:text-white tracking-tight flex items-center gap-2 truncate">
              Review QR Card
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate hidden sm:block">
              Customers point their smartphone camera to leave a review in seconds.
            </p>
          </div>
        </div>

        {/* Right Header: Destination Switch + Non-colliding Close Button */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="inline-flex p-1 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/60 shadow-2xs">
            <button
              type="button"
              onClick={() => setActiveTab('form')}
              className={`apple-touch px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'form'
                  ? 'bg-white dark:bg-slate-900 text-slate-950 dark:text-white shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Review Form
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('wall')}
              className={`apple-touch px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'wall'
                  ? 'bg-white dark:bg-slate-900 text-slate-950 dark:text-white shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Wall of Love
            </button>
          </div>

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title="Close modal"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* ── Main Two-Column Layout ── */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        
        {/* Left: Interactive Acrylic Standee Card Mockup */}
        <div className="md:col-span-5 flex flex-col items-center gap-3">
          <div className="w-full rounded-3xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 p-5 shadow-inner flex flex-col items-center relative overflow-hidden">
            
            {/* The Acrylic Standee Card */}
            <div className="relative w-full max-w-[240px] pt-2 pb-1 flex flex-col items-center">
              
              {/* Card Body */}
              <div
                className="w-full rounded-2xl p-4 flex flex-col items-center text-center shadow-lg border border-white/60 dark:border-white/10 relative transition-transform duration-300 hover:scale-[1.02]"
                style={{ backgroundColor: selectedFinish.bg }}
              >
                {/* Brand / Header */}
                <div className="mb-2 w-full">
                  <p className="text-xs font-bold truncate tracking-tight text-slate-900">
                    {businessName}
                  </p>
                  {/* 5 Rating Stars */}
                  <div className="flex items-center justify-center gap-0.5 mt-1" aria-label="5 out of 5 stars">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-[11px] font-semibold text-slate-600 mt-1">
                    {activeTab === 'form' ? 'Leave us a review' : 'See our wall of love'}
                  </p>
                </div>

                {/* The QR Code Container */}
                <div className="w-full aspect-square rounded-xl p-2 bg-white shadow-xs border border-slate-200/60 flex items-center justify-center">
                  <div
                    className="w-full h-full flex items-center justify-center"
                    dangerouslySetInnerHTML={{ __html: qrSvg }}
                  />
                </div>

                {/* Scan Instruction Footer */}
                <div className="mt-3 flex items-center justify-center gap-1.5 text-[10px] font-semibold text-slate-500">
                  <Camera className="w-3 h-3 text-slate-500" />
                  <span>Scan with phone camera</span>
                </div>
              </div>

              {/* Physical Acrylic Base Foot Simulation */}
              <div className="w-3/4 h-2 mt-1 rounded-full bg-slate-300/60 dark:bg-slate-700/60 blur-[1px] shadow-sm" />
            </div>

            <div className="mt-2 text-center">
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                Ready to display on front desk or tabletop
              </span>
            </div>
          </div>

          {/* Quick Destination Pill */}
          <div className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-2 shadow-2xs">
            <span className="text-[11px] font-mono text-slate-600 dark:text-slate-300 truncate flex-1 min-w-0 select-all">
              {activeUrl}
            </span>
            <button
              type="button"
              onClick={handleCopyLink}
              className="apple-touch px-2 py-1 rounded-lg text-[11px] font-bold text-violet-700 dark:text-violet-400 hover:bg-violet-100 dark:hover:bg-violet-900/30 transition-colors flex items-center gap-1 shrink-0 cursor-pointer"
              title="Copy link"
            >
              {copiedLink ? <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-3 h-3" />}
              <span>{copiedLink ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
        </div>

        {/* Right: Customization Controls & Tiered Actions */}
        <div className="md:col-span-7 space-y-4">
          
          {/* 1. Finish Color - Non-truncating Swatches */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <label className="font-bold text-slate-800 dark:text-slate-200">
                Finish Color
              </label>
              <span className="text-slate-500 dark:text-slate-400 font-medium">
                {selectedFinish.name}
              </span>
            </div>
            <div className="flex items-center gap-2.5 flex-wrap">
              {APPLE_FINISHES.map((finish) => {
                const isSelected = selectedFinish.name === finish.name;
                return (
                  <button
                    key={finish.name}
                    type="button"
                    onClick={() => setSelectedFinish(finish)}
                    className={`apple-touch relative w-9 h-9 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                      isSelected
                        ? 'ring-2 ring-violet-600 ring-offset-2 dark:ring-offset-slate-900 scale-105 shadow-sm'
                        : 'hover:scale-105 opacity-85 hover:opacity-100'
                    }`}
                    style={{ backgroundColor: finish.fg }}
                    title={finish.name}
                    aria-label={finish.name}
                  >
                    {isSelected && <Check className="w-4 h-4 text-white drop-shadow-xs" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Shape Geometry */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Corner Geometry
              </label>
              <span className="text-slate-500 dark:text-slate-400 font-medium">
                Classic
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setQrStyle('classic')}
                className="apple-touch py-2 px-3.5 rounded-xl text-xs font-semibold border text-center transition-all cursor-pointer border-violet-600 bg-violet-600 text-white shadow-xs flex items-center gap-1.5"
              >
                ■ Classic
              </button>
            </div>
          </div>

          {/* 3. Center Brand Emblem Switch */}
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-3 shadow-2xs">
            <div className="flex items-center gap-2.5">
              <span className="text-base">🐼</span>
              <div>
                <span className="text-xs font-bold text-slate-900 dark:text-slate-100 block">Panda Center Icon</span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">Show verified brand icon in center</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIncludeEmblem(!includeEmblem)}
              className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
                includeEmblem ? 'bg-violet-600' : 'bg-slate-300 dark:bg-slate-700'
              }`}
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                  includeEmblem ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* 4. Tiered Action Buttons */}
          <div className="space-y-3 pt-1">
            <button
              type="button"
              onClick={handleDownloadPng}
              disabled={isExporting}
              className="apple-touch apple-btn-primary w-full py-2.5 px-4 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isExporting ? 'Exporting High-Res PNG...' : 'Download QR Code (PNG)'}</span>
            </button>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleDownloadSvg}
                className="apple-touch apple-btn-secondary py-2 px-3 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center justify-center gap-1.5 cursor-pointer bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750"
              >
                <Layers className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                <span>Save Vector (SVG)</span>
              </button>

              <button
                type="button"
                onClick={handleCopyImage}
                className="apple-touch apple-btn-secondary py-2 px-3 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center justify-center gap-1.5 cursor-pointer bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750"
              >
                {copiedImage ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span className="text-emerald-700 dark:text-emerald-400">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                    <span>Copy Image</span>
                  </>
                )}
              </button>
            </div>

            {/* Acrylic Standee Print Options */}
            <div className="pt-2 border-t border-slate-200/80 dark:border-slate-800">
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-1.5">
                Print Tabletop Cards
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handlePrintStandee('4x6')}
                  className="apple-touch py-2 px-2.5 rounded-xl text-xs font-semibold text-violet-700 dark:text-violet-300 bg-violet-50 dark:bg-violet-950/40 hover:bg-violet-100 dark:hover:bg-violet-900/40 border border-violet-200 dark:border-violet-800 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  title="Print formatted 4x6 inch acrylic table tent"
                >
                  <Printer className="w-3.5 h-3.5 text-violet-600 dark:text-violet-400" />
                  <span>4" × 6" Table Tent</span>
                </button>
                <button
                  type="button"
                  onClick={() => handlePrintStandee('5x7')}
                  className="apple-touch py-2 px-2.5 rounded-xl text-xs font-semibold text-violet-700 dark:text-violet-300 bg-violet-50 dark:bg-violet-950/40 hover:bg-violet-100 dark:hover:bg-violet-900/40 border border-violet-200 dark:border-violet-800 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  title="Print formatted 5x7 inch acrylic countertop stand"
                >
                  <Printer className="w-3.5 h-3.5 text-violet-600 dark:text-violet-400" />
                  <span>5" × 7" Countertop</span>
                </button>
              </div>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
};

export default QrCodeGenerator;
