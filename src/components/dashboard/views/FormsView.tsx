import React, { useState } from 'react';
import { 
  Plus, 
  Copy, 
  Check, 
  ExternalLink, 
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
        <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-7 shadow-xs hover:border-gray-300 transition-all space-y-6">
          
          {/* Top Section: Form Identity & Status Badges */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-2">
              <h2 className="text-xl font-bold text-gray-900 tracking-tight font-display">
                {formTitle}
              </h2>
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                    isFormActive
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-gray-100 text-gray-600 border-gray-200'
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${isFormActive ? 'bg-emerald-500 animate-pulse' : 'bg-gray-400'}`}></span>
                  {isFormActive ? 'Active • Accepting responses' : 'Paused / Inactive'}
                </span>

                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-50 text-purple-700 border border-purple-200">
                  <FileText className="w-3.5 h-3.5 text-purple-600" />
                  Verified Text Mode
                </span>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200 text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap"
                title="Copy public form link"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-600 font-bold">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-gray-500" />
                    <span>Copy Link</span>
                  </>
                )}
              </button>

              <a
                href={collectionUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-[#6701e6] border border-purple-200 text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap"
                title="Open live collector form in new tab"
              >
                <span>Test Live Form</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Activated Mandatory Metrics Grid (Spacious & Clean) */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 p-5 sm:p-6 rounded-2xl bg-gray-50/80 border border-gray-100">
            <div className="space-y-1">
              <span className="block text-2xl font-bold text-gray-900 tracking-tight">{totalCount}</span>
              <span className="text-xs font-bold text-gray-800">Total Collected</span>
              <p className="text-[11px] text-gray-500">Customer testimonials</p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-1.5">
                <span className="text-2xl font-bold text-gray-900 tracking-tight">{avgRating}</span>
                <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
              </div>
              <span className="text-xs font-bold text-gray-800">Average Rating</span>
              <p className="text-[11px] text-gray-500">From verified feedback</p>
            </div>
            <div className="space-y-1">
              <span className="block text-2xl font-bold text-emerald-600 tracking-tight">{approvedCount}</span>
              <span className="text-xs font-bold text-gray-800">Approved Proof</span>
              <p className="text-[11px] text-gray-500">Live on public widgets</p>
            </div>
            <div className="space-y-1">
              <span className="block text-2xl font-bold text-[#6701e6] tracking-tight">Text Only</span>
              <span className="text-xs font-bold text-gray-800">Active Review Mode</span>
              <p className="text-[11px] text-gray-500">Video input suspended</p>
            </div>
          </div>

          {/* Bottom Action Row */}
          <div className="flex items-center justify-between pt-1">
            <button
              onClick={onViewProof}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-900 hover:bg-gray-800 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              <MessageSquare className="w-4 h-4 text-purple-300" />
              <span>View Proof ({totalCount})</span>
            </button>

            <span className="text-xs text-gray-400 font-mono">
              Slug: /c/{publicSlug}
            </span>
          </div>

        </div>
      </div>

      {/* QR Code Modal */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-zinc-950 border border-zinc-800/80 rounded-3xl p-6 sm:p-7 max-w-3xl w-full shadow-2xl relative my-auto max-h-[94vh] overflow-y-auto">
            <button
              onClick={() => setShowQrModal(false)}
              className="absolute top-5 right-5 p-1.5 rounded-full text-zinc-400 hover:text-white hover:bg-white/10 transition-colors z-20"
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
