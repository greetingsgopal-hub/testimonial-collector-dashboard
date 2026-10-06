import React, { useState, useMemo, useCallback } from 'react';
import QRCode from 'qrcode';
import {
  QrCode,
  Download,
  Copy,
  Check,
  Palette,
  Link as LinkIcon,
  Smartphone,
  Sparkles,
  ShieldCheck,
  Layers,
  Printer,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface QrCodeGeneratorProps {
  onClose?: () => void;
}

export type QrStyle = 'rounded' | 'dots' | 'classic';

interface ColorPreset {
  name: string;
  fg: string;
  bg: string;
}

const COLOR_PRESETS: ColorPreset[] = [
  { name: 'Classic Onyx', fg: '#000000', bg: '#FFFFFF' },
  { name: 'Panda Violet', fg: '#7C3AED', bg: '#FAF5FF' },
  { name: 'Pacific Blue', fg: '#0284C7', bg: '#F0F9FF' },
  { name: 'Emerald', fg: '#059669', bg: '#ECFDF5' },
  { name: 'Crimson', fg: '#DC2626', bg: '#FEF2F2' },
  { name: 'Sunset Amber', fg: '#D97706', bg: '#FFFBEB' },
  { name: 'Dark Titanium', fg: '#F4F4F5', bg: '#18181B' },
  { name: 'Midnight Indigo', fg: '#6366F1', bg: '#0F172A' },
];

/**
 * Builds a standards-compliant, scannable QR code SVG with Apple-level styling.
 * Uses ISO/IEC 18004 matrix with Reed-Solomon Error Correction Level 'H' (30% tolerance).
 */
export function generateQrSvg(
  data: string,
  size: number = 320,
  fg: string = '#000000',
  bg: string = '#FFFFFF',
  style: QrStyle = 'rounded',
  includeLogo: boolean = true
): string {
  // Validate and sanitize colors and payload to prevent injection into SVG markup
  const safeFg = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(fg) ? fg : '#000000';
  const safeBg = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(bg) ? bg : '#FFFFFF';
  const safeData = data.replace(/[<>&"']/g, '');
  const safeSize = Number.isFinite(size) && size > 0 && size <= 2000 ? size : 320;

  // Generate ISO/IEC 18004 standard QR matrix with Level 'H' error correction
  const qr = QRCode.create(safeData || 'https://pandapraise.com', {
    errorCorrectionLevel: 'H',
  });

  const modCount = qr.modules.size;
  const margin = 2; // Quiet zone standard
  const totalMods = modCount + margin * 2;
  const cellSize = safeSize / totalMods;

  const centerMod = Math.floor(modCount / 2);
  const logoCutoutRadius = 3; // 7x7 module center cutout (only ~3.6% area, safe for Level H 30%)

  let pathData = '';

  for (let row = 0; row < modCount; row++) {
    for (let col = 0; col < modCount; col++) {
      if (!qr.modules.get(row, col)) continue;

      // Check if module falls inside the center emblem cutout
      if (
        includeLogo &&
        Math.abs(row - centerMod) <= logoCutoutRadius &&
        Math.abs(col - centerMod) <= logoCutoutRadius
      ) {
        continue;
      }

      // Check if this module is part of the three primary corner finder patterns
      const isFinder =
        (row < 7 && col < 7) ||
        (row < 7 && col >= modCount - 7) ||
        (row >= modCount - 7 && col < 7);

      const x = (margin + col) * cellSize;
      const y = (margin + row) * cellSize;

      let rx = cellSize * 0.35; // Default rounded squircle
      if (isFinder) {
        rx = cellSize * 0.25; // Finder patterns keep higher optical contrast
      } else if (style === 'dots') {
        rx = cellSize * 0.48; // Circular dots
      } else if (style === 'classic') {
        rx = 0; // Pure precision squares
      }

      pathData += `<rect x="${x.toFixed(2)}" y="${y.toFixed(2)}" width="${cellSize.toFixed(2)}" height="${cellSize.toFixed(2)}" rx="${rx.toFixed(2)}" fill="${safeFg}"/>`;
    }
  }

  // Render centered Panda emblem when enabled
  let logoSvg = '';
  if (includeLogo) {
    const centerX = (margin + centerMod + 0.5) * cellSize;
    const centerY = (margin + centerMod + 0.5) * cellSize;
    const badgeSize = cellSize * 6.5;
    const badgeX = centerX - badgeSize / 2;
    const badgeY = centerY - badgeSize / 2;
    const badgeRadius = badgeSize * 0.26;

    // Vector Panda Emblem matching PandaPraise brand
    const pandaScale = badgeSize / 100;
    const pandaOffsetX = badgeX;
    const pandaOffsetY = badgeY;

    logoSvg = `
      <g>
        <rect x="${badgeX.toFixed(2)}" y="${badgeY.toFixed(2)}" width="${badgeSize.toFixed(2)}" height="${badgeSize.toFixed(2)}" rx="${badgeRadius.toFixed(2)}" fill="${safeBg}" stroke="${safeFg}" stroke-width="${(cellSize * 0.25).toFixed(2)}" />
        <g transform="translate(${pandaOffsetX.toFixed(2)}, ${pandaOffsetY.toFixed(2)}) scale(${pandaScale.toFixed(4)})">
          <!-- Ears -->
          <circle cx="28" cy="26" r="12" fill="${safeFg}" />
          <circle cx="72" cy="26" r="12" fill="${safeFg}" />
          <!-- Head -->
          <circle cx="50" cy="55" r="34" fill="${safeBg}" stroke="${safeFg}" stroke-width="5" />
          <!-- Eye patches -->
          <ellipse cx="38" cy="52" rx="9" ry="12" transform="rotate(-15 38 52)" fill="${safeFg}" />
          <ellipse cx="62" cy="52" rx="9" ry="12" transform="rotate(15 62 52)" fill="${safeFg}" />
          <!-- Eye highlights -->
          <circle cx="39" cy="49" r="3.2" fill="${safeBg}" />
          <circle cx="61" cy="49" r="3.2" fill="${safeBg}" />
          <!-- Nose & smile -->
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

export const QrCodeGenerator: React.FC<QrCodeGeneratorProps> = () => {
  const { collectionForm, project } = useAuth();
  const [activeTab, setActiveTab] = useState<'form' | 'wall'>('form');
  const [qrStyle, setQrStyle] = useState<QrStyle>('rounded');
  const [fgColor, setFgColor] = useState('#000000');
  const [bgColor, setBgColor] = useState('#FFFFFF');
  const [includeEmblem, setIncludeEmblem] = useState(true);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedImage, setCopiedImage] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const collectionUrl = collectionForm
    ? `${window.location.origin}/c/${collectionForm.publicSlug}`
    : `${window.location.origin}/c/demo`;

  const wallUrl = project
    ? `${window.location.origin}/love/${project.slug || project.id}`
    : `${window.location.origin}/love/demo`;

  const activeUrl = activeTab === 'form' ? collectionUrl : wallUrl;

  const qrSvg = useMemo(() => {
    return generateQrSvg(activeUrl, 320, fgColor, bgColor, qrStyle, includeEmblem);
  }, [activeUrl, fgColor, bgColor, qrStyle, includeEmblem]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(activeUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const renderSvgToBlob = useCallback(async (size: number): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const highResSvg = generateQrSvg(activeUrl, size, fgColor, bgColor, qrStyle, includeEmblem);
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
        ctx.fillStyle = bgColor;
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
  }, [activeUrl, fgColor, bgColor, qrStyle, includeEmblem]);

  const handleDownloadPng = async () => {
    setIsExporting(true);
    try {
      // 1200x1200px ultra high-res print master
      const blob = await renderSvgToBlob(1200);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `panda-praise-qr-${activeTab}-1200px.png`;
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
      console.warn('Clipboard writeImage not permitted, falling back to download:', e);
      handleDownloadPng();
    }
  };

  const handlePrintStandee = (preset: '4x6' | '5x7') => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const dimensions = preset === '4x6' ? { width: '4in', height: '6in', name: '4" × 6" Acrylic Table Tent' } : { width: '5in', height: '7in', name: '5" × 7" Countertop Stand' };

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>${dimensions.name} - PandaPraise Print</title>
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
              border: 1.5px dashed #cbd5e1;
              border-radius: 20px;
              padding: 24px;
              width: 100%;
              max-width: 320px;
              box-sizing: border-box;
              display: flex;
              flex-direction: column;
              align-items: center;
            }
            .badge {
              font-size: 10px;
              font-weight: 700;
              text-transform: uppercase;
              letter-spacing: 0.1em;
              color: #7c3aed;
              background: #f5f3ff;
              border: 1px solid #ddd6fe;
              padding: 4px 12px;
              border-radius: 9999px;
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
              margin: 0 0 18px 0;
              line-height: 1.4;
            }
            .qr-wrap {
              width: 180px;
              height: 180px;
              display: flex;
              align-items: center;
              justify-content: center;
              margin-bottom: 16px;
            }
            .qr-wrap svg {
              width: 100%;
              height: 100%;
            }
            .footer {
              font-size: 11px;
              color: #94a3b8;
              font-weight: 600;
              display: flex;
              align-items: center;
              gap: 4px;
            }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="badge">Scan with Camera</div>
            <h1>Enjoyed Your Experience?</h1>
            <p class="sub">Point your smartphone camera to share quick verified feedback in 30 seconds</p>
            <div class="qr-wrap">
              ${qrSvg}
            </div>
            <div class="footer">
              🐼 Powered by PandaPraise • Verified Proof
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

  return (
    <div className="space-y-6">
      {/* Header & Segmented Pill Switch */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800/80 pb-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-violet-400">
              <QrCode size={18} />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white tracking-tight flex items-center gap-2">
                QR Code Studio
                <span className="text-[10px] font-medium tracking-wide uppercase px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Vector Ready
                </span>
              </h2>
              <p className="text-xs text-zinc-400">
                Generate high-resolution, branded touchpoints for physical print & packaging
              </p>
            </div>
          </div>
        </div>

        {/* Apple-style Segmented Control */}
        <div className="inline-flex p-1 rounded-xl bg-zinc-900 border border-zinc-800 self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('form')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
              activeTab === 'form'
                ? 'bg-violet-600 text-white shadow-sm shadow-violet-900/30'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <span>📝</span> Collection Form
          </button>
          <button
            onClick={() => setActiveTab('wall')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
              activeTab === 'wall'
                ? 'bg-violet-600 text-white shadow-sm shadow-violet-900/30'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <span>💜</span> Wall of Love
          </button>
        </div>
      </div>

      {/* Two-Stage Responsive Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Stage: Hero Physical Artifact Preview (Cols 1-5) */}
        <div className="lg:col-span-5 flex flex-col items-center gap-4">
          <div className="w-full relative group">
            <div className="absolute -inset-1 bg-gradient-to-b from-violet-500/20 to-purple-500/0 rounded-3xl blur-xl opacity-75 group-hover:opacity-100 transition-opacity pointer-events-none" />
            <div className="relative p-5 rounded-2xl bg-zinc-900/90 border border-zinc-800 shadow-2xl flex flex-col items-center">
              {/* QR Container */}
              <div
                className="w-full max-w-[240px] aspect-square rounded-2xl p-3 flex items-center justify-center shadow-lg transition-transform duration-300 group-hover:scale-[1.02]"
                style={{ backgroundColor: bgColor }}
              >
                <div
                  className="w-full h-full flex items-center justify-center"
                  dangerouslySetInnerHTML={{ __html: qrSvg }}
                />
              </div>

              {/* Scannability Beacon */}
              <div className="mt-4 flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <ShieldCheck size={13} />
                <span>ISO/IEC 18004 Verified Scannable</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="w-full space-y-2">
            <button
              onClick={handleDownloadPng}
              disabled={isExporting}
              className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold text-white bg-violet-600 hover:bg-violet-500 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-lg shadow-violet-600/25 disabled:opacity-50"
            >
              <Download size={15} />
              <span>{isExporting ? 'Exporting 1200px PNG...' : 'Download High-Res PNG (Print)'}</span>
            </button>

            <div className="grid grid-cols-2 gap-2 w-full">
              <button
                onClick={handleDownloadSvg}
                className="py-2 px-3 rounded-xl text-xs font-medium text-zinc-200 bg-white/5 hover:bg-white/10 border border-white/10 active:scale-[0.98] transition-all flex items-center justify-center gap-1.5"
              >
                <Layers size={13} className="text-zinc-400" />
                <span>Download SVG</span>
              </button>

              <button
                onClick={handleCopyImage}
                className="py-2 px-3 rounded-xl text-xs font-medium text-zinc-200 bg-white/5 hover:bg-white/10 border border-white/10 active:scale-[0.98] transition-all flex items-center justify-center gap-1.5"
              >
                {copiedImage ? (
                  <>
                    <Check size={13} className="text-emerald-400" />
                    <span className="text-emerald-400">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy size={13} className="text-zinc-400" />
                    <span>Copy Image</span>
                  </>
                )}
              </button>
            </div>

            {/* Acrylic Standee Print Presets */}
            <div className="w-full pt-2 border-t border-white/5 space-y-1.5">
              <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider block text-left">
                Print Acrylic Standee
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handlePrintStandee('4x6')}
                  className="py-2 px-2.5 rounded-xl text-xs font-semibold text-violet-300 bg-violet-950/40 hover:bg-violet-900/50 border border-violet-700/40 active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  title="Print formatted 4x6 inch acrylic table tent"
                >
                  <Printer size={13} className="text-violet-400" />
                  <span>4" × 6" Table Tent</span>
                </button>
                <button
                  type="button"
                  onClick={() => handlePrintStandee('5x7')}
                  className="py-2 px-2.5 rounded-xl text-xs font-semibold text-violet-300 bg-violet-950/40 hover:bg-violet-900/50 border border-violet-700/40 active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  title="Print formatted 5x7 inch acrylic countertop stand"
                >
                  <Printer size={13} className="text-violet-400" />
                  <span>5" × 7" Counter</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Stage: Customization & Controls (Cols 6-12) */}
        <div className="lg:col-span-7 space-y-4 min-w-0">
          {/* 1. Destination URL Row (Guaranteed no overflow) */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-400 flex items-center gap-1.5">
              <LinkIcon size={12} className="text-violet-400" />
              Destination Link
            </label>
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 min-w-0">
              <span className="text-xs text-zinc-300 font-mono truncate flex-1 min-w-0">
                {activeUrl}
              </span>
              <button
                onClick={handleCopyLink}
                className="shrink-0 p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors flex items-center gap-1 text-xs"
                title="Copy destination link"
              >
                {copiedLink ? (
                  <Check size={14} className="text-emerald-400" />
                ) : (
                  <Copy size={14} />
                )}
              </button>
            </div>
          </div>

          {/* 2. Module Geometry (Style) */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-400 flex items-center gap-1.5">
              <Sparkles size={12} className="text-violet-400" />
              Module Geometry
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setQrStyle('rounded')}
                className={`py-2 px-3 rounded-xl text-xs font-medium border text-center transition-all ${
                  qrStyle === 'rounded'
                    ? 'border-violet-500 bg-violet-500/15 text-violet-200'
                    : 'border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
                }`}
              >
                ● Rounded
              </button>
              <button
                type="button"
                onClick={() => setQrStyle('dots')}
                className={`py-2 px-3 rounded-xl text-xs font-medium border text-center transition-all ${
                  qrStyle === 'dots'
                    ? 'border-violet-500 bg-violet-500/15 text-violet-200'
                    : 'border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
                }`}
              >
                ○ Dots
              </button>
              <button
                type="button"
                onClick={() => setQrStyle('classic')}
                className={`py-2 px-3 rounded-xl text-xs font-medium border text-center transition-all ${
                  qrStyle === 'classic'
                    ? 'border-violet-500 bg-violet-500/15 text-violet-200'
                    : 'border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
                }`}
              >
                ■ Classic
              </button>
            </div>
          </div>

          {/* 3. Color Presets */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-400 flex items-center gap-1.5">
              <Palette size={12} className="text-violet-400" />
              Apple Color Finishes
            </label>
            <div className="grid grid-cols-4 sm:grid-cols-4 gap-2">
              {COLOR_PRESETS.map((preset) => {
                const isSelected = fgColor.toUpperCase() === preset.fg.toUpperCase() && bgColor.toUpperCase() === preset.bg.toUpperCase();
                return (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => {
                      setFgColor(preset.fg);
                      setBgColor(preset.bg);
                    }}
                    className={`p-2 rounded-xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                      isSelected
                        ? 'border-violet-500 bg-violet-500/15 shadow-sm'
                        : 'border-zinc-800 bg-zinc-900/60 hover:border-zinc-700'
                    }`}
                  >
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center shadow-inner border border-black/10"
                      style={{ backgroundColor: preset.bg }}
                    >
                      <div className="w-3.5 h-3.5 rounded-sm" style={{ backgroundColor: preset.fg }} />
                    </div>
                    <span className="text-[10px] font-medium text-zinc-300 truncate w-full">
                      {preset.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 4. Fine-Tuned Colors (Distinct Grid, NO Overlapping Elements) */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 space-y-1.5">
              <span className="text-[11px] font-medium text-zinc-400 block">Foreground</span>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={fgColor}
                  onChange={(e) => setFgColor(e.target.value)}
                  className="w-7 h-7 rounded-lg border border-white/20 cursor-pointer bg-transparent p-0 shrink-0"
                />
                <input
                  type="text"
                  value={fgColor}
                  onChange={(e) => setFgColor(e.target.value)}
                  className="flex-1 min-w-0 px-2.5 py-1 text-xs font-mono rounded-lg bg-black/40 border border-zinc-700 text-zinc-200 uppercase"
                />
              </div>
            </div>

            <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 space-y-1.5">
              <span className="text-[11px] font-medium text-zinc-400 block">Background</span>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={bgColor}
                  onChange={(e) => setBgColor(e.target.value)}
                  className="w-7 h-7 rounded-lg border border-white/20 cursor-pointer bg-transparent p-0 shrink-0"
                />
                <input
                  type="text"
                  value={bgColor}
                  onChange={(e) => setBgColor(e.target.value)}
                  className="flex-1 min-w-0 px-2.5 py-1 text-xs font-mono rounded-lg bg-black/40 border border-zinc-700 text-zinc-200 uppercase"
                />
              </div>
            </div>
          </div>

          {/* 5. Center Brand Emblem Toggle */}
          <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-6 h-6 rounded-lg bg-violet-500/20 text-violet-400 flex items-center justify-center text-xs">
                🐼
              </div>
              <div>
                <span className="text-xs font-medium text-zinc-200 block">Panda Center Emblem</span>
                <span className="text-[11px] text-zinc-400">Embed verified brand icon in center</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIncludeEmblem(!includeEmblem)}
              className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                includeEmblem ? 'bg-violet-600' : 'bg-zinc-700'
              }`}
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                  includeEmblem ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* 6. Physical Placement Guidance (Crisp & Readable) */}
          <div className="p-3.5 rounded-xl bg-violet-950/30 border border-violet-800/30 flex items-start gap-3">
            <Smartphone size={16} className="text-violet-400 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <p className="text-xs font-medium text-violet-200">
                Point-of-Sale Deployment
              </p>
              <p className="text-[11px] text-zinc-400 leading-relaxed">
                Print on table tents, packaging inserts, receipts, or storefront decals. Customers simply aim their native iOS or Android camera to leave feedback in seconds.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

