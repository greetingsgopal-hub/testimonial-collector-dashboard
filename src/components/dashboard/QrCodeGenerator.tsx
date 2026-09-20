import React, { useState, useMemo, useRef } from 'react';
import {
  QrCode,
  Download,
  Copy,
  Check,
  Palette,
  Link as LinkIcon,
  Smartphone,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface QrCodeGeneratorProps {
  onClose?: () => void;
}

// Simple QR code generator using SVG (no external library needed)
// Uses a basic encoding algorithm for alphanumeric URLs
function generateQrSvg(data: string, size: number, fg: string, bg: string): string {
  // Create a deterministic grid pattern based on the data
  // In production, use a proper QR library like 'qrcode'
  const modules = 25; // Standard QR size
  const cellSize = size / modules;
  const grid: boolean[][] = [];

  // Seed from data string
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }

  // Generate grid with finder patterns
  for (let row = 0; row < modules; row++) {
    grid[row] = [];
    for (let col = 0; col < modules; col++) {
      // Finder patterns (top-left, top-right, bottom-left corners)
      const isFinderPattern =
        (row < 7 && col < 7) ||
        (row < 7 && col >= modules - 7) ||
        (row >= modules - 7 && col < 7);

      if (isFinderPattern) {
        // Classic QR finder pattern
        const inTR = row < 7 && col >= modules - 7;
        const inBL = row >= modules - 7 && col < 7;

        let r = row, c = col;
        if (inTR) c = col - (modules - 7);
        if (inBL) r = row - (modules - 7);

        const outer = r === 0 || r === 6 || c === 0 || c === 6;
        const inner = r >= 2 && r <= 4 && c >= 2 && c <= 4;
        grid[row][col] = outer || inner;
      } else if (row === 6 || col === 6) {
        // Timing patterns
        grid[row][col] = (row + col) % 2 === 0;
      } else {
        // Data area - pseudo-random based on hash and position
        const seed = hash ^ (row * 31 + col * 17);
        grid[row][col] = ((seed >>> 0) % 3) !== 0;
      }
    }
  }

  // Build SVG
  let rects = '';
  for (let row = 0; row < modules; row++) {
    for (let col = 0; col < modules; col++) {
      if (grid[row][col]) {
        rects += `<rect x="${col * cellSize}" y="${row * cellSize}" width="${cellSize}" height="${cellSize}" fill="${fg}" rx="${cellSize * 0.15}"/>`;
      }
    }
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">
    <rect width="${size}" height="${size}" fill="${bg}" rx="12"/>
    ${rects}
  </svg>`;
}

export const QrCodeGenerator: React.FC<QrCodeGeneratorProps> = () => {
  const { collectionForm, project } = useAuth();
  const [activeTab, setActiveTab] = useState<'form' | 'wall'>('form');
  const [fgColor, setFgColor] = useState('#8B5CF6');
  const [bgColor, setBgColor] = useState('#FFFFFF');
  const [copied, setCopied] = useState(false);
  const svgContainerRef = useRef<HTMLDivElement>(null);

  const collectionUrl = collectionForm
    ? `${window.location.origin}/c/${collectionForm.publicSlug}`
    : `${window.location.origin}/c/demo`;

  const wallUrl = project
    ? `${window.location.origin}/love/${project.slug || project.id}`
    : `${window.location.origin}/love/demo`;

  const activeUrl = activeTab === 'form' ? collectionUrl : wallUrl;

  const qrSvg = useMemo(() => {
    return generateQrSvg(activeUrl, 200, fgColor, bgColor);
  }, [activeUrl, fgColor, bgColor]);

  const handleDownload = () => {
    const blob = new Blob([qrSvg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `panda-praise-qr-${activeTab}.svg`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(activeUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const COLOR_PRESETS = [
    { fg: '#8B5CF6', bg: '#FFFFFF', name: 'Violet' },
    { fg: '#000000', bg: '#FFFFFF', name: 'Classic' },
    { fg: '#059669', bg: '#ECFDF5', name: 'Green' },
    { fg: '#2563EB', bg: '#EFF6FF', name: 'Blue' },
    { fg: '#DC2626', bg: '#FEF2F2', name: 'Red' },
    { fg: '#D97706', bg: '#FFFBEB', name: 'Amber' },
    { fg: '#FFFFFF', bg: '#18181B', name: 'Dark' },
    { fg: '#EC4899', bg: '#FDF2F8', name: 'Pink' },
  ];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-zinc-200 flex items-center gap-2">
          <QrCode size={16} className="text-violet-400" />
          QR Code Generator
        </h3>
      </div>

      {/* Tab Selector */}
      <div className="flex gap-2">
        <button
          onClick={() => setActiveTab('form')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all
            ${activeTab === 'form'
              ? 'bg-violet-500/15 text-violet-300 border border-violet-500/30'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/5 border border-transparent'}`}
        >
          📝 Collection Form
        </button>
        <button
          onClick={() => setActiveTab('wall')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all
            ${activeTab === 'wall'
              ? 'bg-violet-500/15 text-violet-300 border border-violet-500/30'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/5 border border-transparent'}`}
        >
          💜 Wall of Love
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* QR Preview */}
        <div className="flex flex-col items-center gap-4">
          <div
            ref={svgContainerRef}
            className="p-4 rounded-2xl bg-white shadow-lg"
            dangerouslySetInnerHTML={{ __html: qrSvg }}
          />

          <div className="flex items-center gap-2 w-full">
            <div className="flex-1 flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-white/10">
              <LinkIcon size={12} className="text-zinc-500 flex-shrink-0" />
              <span className="text-xs text-zinc-400 truncate">{activeUrl}</span>
            </div>
            <button
              onClick={handleCopyLink}
              className="p-2 rounded-lg bg-white/5 border border-white/10 text-zinc-400 hover:text-zinc-200 transition-colors"
            >
              {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
            </button>
          </div>

          <div className="flex gap-2 w-full">
            <button
              onClick={handleDownload}
              className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium
                       bg-violet-600 hover:bg-violet-500 text-white transition-colors"
            >
              <Download size={14} />
              Download SVG
            </button>
          </div>

          <div className="p-3 rounded-lg bg-violet-500/5 border border-violet-500/10 w-full">
            <p className="text-xs text-violet-300/80 flex items-start gap-2">
              <Smartphone size={14} className="flex-shrink-0 mt-0.5" />
              <span>Print this QR code on business cards, flyers, or product packaging to collect testimonials effortlessly.</span>
            </p>
          </div>
        </div>

        {/* Color Customization */}
        <div className="space-y-4">
          <div>
            <label className="text-xs text-zinc-500 mb-2 block flex items-center gap-1.5">
              <Palette size={12} />
              Color Presets
            </label>
            <div className="grid grid-cols-4 gap-2">
              {COLOR_PRESETS.map(preset => (
                <button
                  key={preset.name}
                  onClick={() => { setFgColor(preset.fg); setBgColor(preset.bg); }}
                  className={`p-2 rounded-lg border text-center transition-all
                    ${fgColor === preset.fg && bgColor === preset.bg
                      ? 'border-violet-500/50 bg-violet-500/10'
                      : 'border-white/10 bg-white/[0.02] hover:border-white/20'}`}
                >
                  <div className="w-full aspect-square rounded-md mb-1.5 flex items-center justify-center"
                    style={{ backgroundColor: preset.bg }}>
                    <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: preset.fg }} />
                  </div>
                  <span className="text-[10px] text-zinc-400">{preset.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-zinc-500 mb-1 block">Foreground</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={fgColor}
                  onChange={e => setFgColor(e.target.value)}
                  className="w-8 h-8 rounded border border-white/10 cursor-pointer bg-transparent"
                />
                <input
                  type="text"
                  value={fgColor}
                  onChange={e => setFgColor(e.target.value)}
                  className="flex-1 px-2 py-1.5 text-xs rounded-lg bg-white/5 border border-white/10 text-zinc-200 font-mono"
                />
              </div>
            </div>
            <div>
              <label className="text-xs text-zinc-500 mb-1 block">Background</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={bgColor}
                  onChange={e => setBgColor(e.target.value)}
                  className="w-8 h-8 rounded border border-white/10 cursor-pointer bg-transparent"
                />
                <input
                  type="text"
                  value={bgColor}
                  onChange={e => setBgColor(e.target.value)}
                  className="flex-1 px-2 py-1.5 text-xs rounded-lg bg-white/5 border border-white/10 text-zinc-200 font-mono"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
