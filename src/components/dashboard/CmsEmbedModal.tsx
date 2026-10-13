import React, { useState } from 'react';
import {
  X,
  Copy,
  Check,
  Download,
  Code2,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import { CMS_PLATFORMS, WidgetLayout, WidgetTheme } from '../../lib/cmsEmbeds';

interface CmsEmbedModalProps {
  isOpen: boolean;
  onClose: () => void;
  spaceSlug: string;
}

export const CmsEmbedModal: React.FC<CmsEmbedModalProps> = ({
  isOpen,
  onClose,
  spaceSlug,
}) => {
  const [selectedPlatformId, setSelectedPlatformId] = useState<string>('shopify');
  const [selectedLayout, setSelectedLayout] = useState<WidgetLayout>('marquee');
  const [selectedTheme, setSelectedTheme] = useState<WidgetTheme>('system');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const activePlatform = CMS_PLATFORMS.find((p) => p.id === selectedPlatformId) || CMS_PLATFORMS[0];
  const snippet = activePlatform.snippet(spaceSlug || 'your-space', selectedLayout, selectedTheme);

  const handleCopy = () => {
    navigator.clipboard.writeText(snippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadWpPlugin = () => {
    const element = document.createElement('a');
    element.setAttribute('href', '/pandapraise-wp-plugin.php');
    element.setAttribute('download', 'pandapraise-wp-plugin.php');
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-fade-in font-sans">
      <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-3xl w-full shadow-2xl relative my-auto max-h-[92vh] overflow-y-auto text-gray-900 space-y-6 border border-gray-100">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
          title="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 text-[#6701e6] text-xs font-bold mb-2">
            <Sparkles size={13} />
            Third-Party CMS & Website Integrations
          </div>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">
            Install Testimonial Widget
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Embed your verified reviews into any CMS in under 2 minutes with zero layout shift.
          </p>
        </div>

        {/* Platform Selector Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-2">
          {CMS_PLATFORMS.map((platform) => {
            const isSelected = platform.id === selectedPlatformId;
            return (
              <button
                key={platform.id}
                onClick={() => setSelectedPlatformId(platform.id)}
                className={`p-3 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1.5 ${
                  isSelected
                    ? 'border-[#6701e6] bg-purple-50/60 text-[#6701e6] font-bold shadow-xs'
                    : 'border-gray-200 bg-gray-50/50 text-gray-600 hover:border-gray-300 hover:bg-gray-100/50'
                }`}
              >
                <span className="text-xs font-bold">{platform.name.split(' ')[0]}</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white border border-gray-200 text-gray-500 font-semibold">
                  {platform.setupTime}
                </span>
              </button>
            );
          })}
        </div>

        {/* Layout & Theme Selector */}
        <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-gray-700">Layout:</span>
            <div className="flex items-center gap-1.5 flex-wrap">
              {(['marquee', 'wall', 'carousel', 'badge'] as WidgetLayout[]).map((layout) => (
                <button
                  key={layout}
                  onClick={() => setSelectedLayout(layout)}
                  className={`px-3 py-1 rounded-xl text-xs font-bold capitalize transition-all cursor-pointer ${
                    selectedLayout === layout
                      ? 'bg-[#6701e6] text-white shadow-xs'
                      : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  {layout === 'marquee' ? '⚡ Marquee Ticker' : layout}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-gray-700">Theme:</span>
            {(['system', 'light', 'dark'] as WidgetTheme[]).map((t) => (
              <button
                key={t}
                onClick={() => setSelectedTheme(t)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold capitalize transition-all cursor-pointer ${
                  selectedTheme === t
                    ? 'bg-slate-900 text-white'
                    : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-100'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Instructions Steps */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
            {activePlatform.name} Installation Steps:
          </h4>
          <ol className="space-y-2 text-xs text-gray-600 list-decimal list-inside bg-gray-50/50 p-4 rounded-2xl border border-gray-200">
            {activePlatform.instructions.map((step, idx) => (
              <li key={idx} className="leading-relaxed">
                {step}
              </li>
            ))}
          </ol>
        </div>

        {/* Code Snippet Box */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
              <Code2 size={14} className="text-[#6701e6]" />
              Ready-to-Paste Code Snippet
            </span>
            <div className="flex items-center gap-2">
              {activePlatform.id === 'wordpress' && (
                <button
                  onClick={handleDownloadWpPlugin}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-gray-100 hover:bg-gray-200 text-gray-700 transition-all cursor-pointer"
                >
                  <Download size={13} />
                  Download .PHP Plugin
                </button>
              )}
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold bg-[#6701e6] hover:bg-[#5200bd] text-white transition-all shadow-md shadow-purple-500/20 cursor-pointer"
              >
                {copied ? <Check size={13} /> : <Copy size={13} />}
                {copied ? 'Copied!' : 'Copy Code'}
              </button>
            </div>
          </div>

          <div className="p-4 bg-slate-900 text-slate-200 rounded-2xl font-mono text-xs overflow-x-auto border border-slate-800">
            <pre className="whitespace-pre overflow-x-auto">{snippet}</pre>
          </div>
        </div>

        {/* Shadow DOM Isolation Assurance */}
        <div className="p-3.5 rounded-xl bg-purple-50/80 border border-purple-200 flex items-center gap-2.5 text-xs text-purple-900">
          <CheckCircle2 size={16} className="text-[#6701e6] shrink-0" />
          <span>
            <strong>Zero CSS Bleed:</strong> All PandaPraise widgets run in isolated <strong>Shadow DOM</strong>, guaranteeing your host theme styles won't break the widget design.
          </span>
        </div>

      </div>
    </div>
  );
};
