import React, { useState } from 'react';
import { 
  Plus, 
  Copy, 
  Check, 
  ExternalLink, 
  Settings, 
  MessageSquare, 
  Star, 
  QrCode, 
  FileText, 
  X
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { Review, ReviewStats } from '../../../types';
import { cleanBrandOrProductName, deduplicateRepeatedString } from '../../../lib/security';
import { QrCodeGenerator } from '../QrCodeGenerator';

interface FormsViewProps {
  onConfigureForm: () => void;
  onSendInvites?: () => void;
  onViewProof: () => void;
  reviews?: Review[];
  stats?: ReviewStats;
}

export const FormsView: React.FC<FormsViewProps> = ({
  onConfigureForm,
  onViewProof,
  reviews = [],
  stats,
}) => {
  const { project, collectionForm } = useAuth();
  const [copied, setCopied] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);

  // Business Name Resolution: Ensure active business name (e.g. papasystem) is used instead of personal owner's name
  const cleanBusinessName =
    cleanBrandOrProductName(collectionForm?.settings?.brandName) ||
    cleanBrandOrProductName(project?.name) ||
    project?.name ||
    'our business';

  // Sanitize title to avoid stale "Gopal's Testimonials" or "Testimonial Form"
  let formTitle = deduplicateRepeatedString(collectionForm?.title?.trim()) || '';
  if (
    !formTitle ||
    formTitle.includes("Gopal's Testimonials") ||
    formTitle.includes("Gopal’s Testimonials") ||
    formTitle.toLowerCase().includes('testimonials') ||
    formTitle.endsWith('Testimonial Form')
  ) {
    formTitle = `Share your experience with ${cleanBusinessName}`;
  }

  const publicSlug = collectionForm?.publicSlug || project?.slug || 'feedback';
  const collectionUrl = `${window.location.origin}/c/${publicSlug}`;
  const isFormActive = collectionForm?.isActive ?? true;

  // Active Metrics Calculations (Activated mandatory metrics)
  const totalCount = reviews.length > 0 ? reviews.length : (stats?.total ?? 0);
  const approvedCount = reviews.length > 0 
    ? reviews.filter(r => r.status === 'approved').length 
    : (stats?.approvedCount ?? 0);

  const avgRating = stats?.averageRating && stats.averageRating > 0
    ? stats.averageRating.toFixed(1)
    : (reviews.length > 0 
        ? (reviews.reduce((sum, r) => sum + (r.rating || 5), 0) / reviews.length).toFixed(1) 
        : '5.0');

  const handleCopy = () => {
    navigator.clipboard.writeText(collectionUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 space-y-6 font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-gray-100">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight font-display">Collect testimonials</h1>
          <p className="text-xs text-gray-500 mt-1">
            Capture authentic customer reviews and ratings using your branded collection form.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => setShowQrModal(true)}
            className="px-3.5 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-[#6701e6] border border-purple-200 text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
            title="Generate QR code for tables, receipts, or packaging"
          >
            <QrCode className="w-3.5 h-3.5 shrink-0" />
            <span>QR Code</span>
          </button>

          <button
            onClick={onConfigureForm}
            className="px-4 py-2 rounded-xl bg-[#6701e6] hover:bg-[#5200bd] text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0"
          >
            <Plus className="w-3.5 h-3.5 shrink-0" />
            <span>Configure collection form</span>
          </button>
        </div>
      </div>

      {/* Primary Collection Form Card */}
      <div className="space-y-4">
        <div className="bg-white border border-gray-200 rounded-2xl p-5 sm:p-6 shadow-xs hover:border-gray-300 transition-all flex flex-col gap-6">
          
          {/* Top Section: Form Identity, Live URL & Status */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
            
            {/* Left: Thumbnail & Details */}
            <div className="flex items-start gap-4 min-w-0 flex-1">
              
              {/* Form Mini Thumbnail */}
              <a
                href={collectionUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-28 h-20 rounded-xl bg-purple-50/70 border border-purple-100 shrink-0 p-2.5 flex flex-col justify-between shadow-2xs hover:border-[#6701e6] transition-colors group cursor-pointer"
                title="Preview live collection form"
              >
                <div className="flex items-center gap-1 text-[10px] font-bold text-[#6701e6]">
                  <span className="w-2 h-2 rounded-full bg-[#6701e6]"></span>
                  <span className="truncate">{cleanBusinessName}</span>
                </div>
                <p className="text-[9px] text-gray-600 line-clamp-1">Rate your experience</p>
                <div className="flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} className="w-2.5 h-2.5 text-amber-400 fill-amber-400" />
                  ))}
                </div>
              </a>

              {/* Title, Badges & URL */}
              <div className="space-y-2 min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-base font-bold text-gray-900 break-words">{formTitle}</h3>
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                      isFormActive
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-gray-100 text-gray-600 border-gray-200'
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${isFormActive ? 'bg-emerald-500 animate-pulse' : 'bg-gray-400'}`}></span>
                    {isFormActive ? 'Active' : 'Paused'}
                  </span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-purple-50 text-purple-700 border border-purple-200">
                    <FileText className="w-3 h-3 text-purple-600" />
                    Verified Text Mode
                  </span>
                </div>

                {/* URL Chip */}
                <div className="inline-flex max-w-full items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-50 border border-gray-200 text-xs text-gray-700 font-mono">
                  <span className="truncate max-w-[200px] sm:max-w-xs md:max-w-md">{collectionUrl}</span>
                  <button
                    onClick={handleCopy}
                    className="inline-flex items-center gap-1 text-gray-500 hover:text-gray-900 transition-colors cursor-pointer shrink-0 ml-1 font-sans font-medium"
                    title="Copy form link"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-[11px] text-emerald-600 font-bold">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span className="text-[11px]">Copy</span>
                      </>
                    )}
                  </button>
                  <a
                    href={collectionUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-gray-800 transition-colors shrink-0 p-0.5"
                    title="Open live form in new tab"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </div>

          </div>

          {/* Activated Mandatory Metrics Grid (Replacing the 4 dummy dashes) */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-xl bg-gray-50/70 border border-gray-100">
            <div className="space-y-0.5">
              <span className="block text-xl font-bold text-gray-900">{totalCount}</span>
              <span className="text-xs font-semibold text-gray-700">Total Collected</span>
              <p className="text-[10px] text-gray-500">Customer testimonials</p>
            </div>
            <div className="space-y-0.5">
              <div className="flex items-center gap-1">
                <span className="text-xl font-bold text-gray-900">{avgRating}</span>
                <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
              </div>
              <span className="text-xs font-semibold text-gray-700">Average Rating</span>
              <p className="text-[10px] text-gray-500">From verified feedback</p>
            </div>
            <div className="space-y-0.5">
              <span className="block text-xl font-bold text-emerald-600">{approvedCount}</span>
              <span className="text-xs font-semibold text-gray-700">Approved Proof</span>
              <p className="text-[10px] text-gray-500">Live on public widgets</p>
            </div>
            <div className="space-y-0.5">
              <span className="block text-xl font-bold text-purple-700">Text Form</span>
              <span className="text-xs font-semibold text-gray-700">Active Review Mode</span>
              <p className="text-[10px] text-gray-500">Video input suspended</p>
            </div>
          </div>

          {/* Action Row */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-gray-100">
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={onViewProof}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-50 hover:bg-gray-100 text-gray-800 border border-gray-200 text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap"
              >
                <MessageSquare className="w-3.5 h-3.5 text-gray-600" />
                <span>View Proof ({totalCount})</span>
              </button>

              <button
                onClick={() => setShowQrModal(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-50 hover:bg-purple-100 text-[#6701e6] border border-purple-200 text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap"
              >
                <QrCode className="w-3.5 h-3.5" />
                <span>QR Code & Poster</span>
              </button>

              <button
                onClick={onConfigureForm}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap"
              >
                <Settings className="w-3.5 h-3.5 text-gray-500" />
                <span>Configure Form</span>
              </button>
            </div>

            <a
              href={collectionUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#6701e6] hover:text-[#5200bd] transition-colors"
            >
              <span>Test Live Form</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

        </div>
      </div>

      {/* QR Code Modal */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 max-w-xl w-full shadow-2xl relative">
            <button
              onClick={() => setShowQrModal(false)}
              className="absolute top-4 right-4 p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
              title="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
            <QrCodeGenerator onClose={() => setShowQrModal(false)} />
          </div>
        </div>
      )}

    </div>
  );
};
