import React, { useState } from 'react';
import { Plus, Copy, Check, ExternalLink, Settings, Send, MessageSquare, Star } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';

interface FormsViewProps {
  onConfigureForm: () => void;
  onSendInvites: () => void;
  onViewProof: () => void;
}

export const FormsView: React.FC<FormsViewProps> = ({
  onConfigureForm,
  onSendInvites,
  onViewProof,
}) => {
  const { project, collectionForm } = useAuth();
  const [copied, setCopied] = useState(false);

  const formTitle = collectionForm?.title || `${project?.name || 'Main Product'} Testimonial Form`;
  const publicSlug = collectionForm?.publicSlug || project?.slug || 'feedback';
  const collectionUrl = `${window.location.origin}/c/${publicSlug}`;

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
            Create a simple customer form and share it to collect new testimonials.
          </p>
        </div>

        <button
          onClick={onConfigureForm}
          className="px-4 py-2 rounded-xl bg-[#6701e6] hover:bg-[#5200bd] text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 self-start sm:self-auto cursor-pointer whitespace-nowrap shrink-0"
        >
          <Plus className="w-3.5 h-3.5 shrink-0" />
          <span>Configure collection form</span>
        </button>
      </div>

      {/* Forms List */}
      <div className="space-y-4">
        <div className="bg-white border border-gray-200 rounded-2xl p-5 sm:p-6 shadow-xs hover:border-gray-300 transition-all flex flex-col xl:flex-row xl:items-center justify-between gap-6">
          
          {/* Left: Thumbnail & Details */}
          <div className="flex items-start gap-4 min-w-0 flex-1">
            
            {/* Form Mini Thumbnail */}
            <div className="w-28 h-20 rounded-xl bg-purple-50/60 border border-purple-100 shrink-0 p-2.5 flex flex-col justify-between shadow-2xs">
              <div className="flex items-center gap-1 text-[10px] font-bold text-[#6701e6]">
                <span className="w-2 h-2 rounded-full bg-[#6701e6]"></span>
                <span className="truncate">Panda Praise</span>
              </div>
              <p className="text-[9px] text-gray-600 line-clamp-1">Rate your experience</p>
              <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} className="w-2.5 h-2.5 text-amber-400 fill-amber-400" />
                ))}
              </div>
            </div>

            {/* Info */}
            <div className="space-y-2.5 min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-gray-900 break-words">{formTitle}</h3>
                <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" title="Active"></span>
              </div>

              {/* URL Chip */}
              <div className="inline-flex max-w-full items-center gap-2 px-2.5 py-1.5 rounded-lg bg-gray-50 border border-gray-200 text-xs text-gray-600 font-mono">
                <span className="truncate max-w-[200px] sm:max-w-xs md:max-w-sm">{collectionUrl}</span>
                <button
                  onClick={handleCopy}
                  className="text-gray-400 hover:text-gray-700 transition-colors cursor-pointer shrink-0 ml-1"
                  title="Copy form link"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
                <a
                  href={collectionUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-gray-700 transition-colors shrink-0"
                  title="Open live form"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2 pt-0.5">
                <button
                  onClick={onSendInvites}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-purple-50 hover:bg-purple-100 text-[#6701e6] border border-purple-200 text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap"
                >
                  <Send className="w-3 h-3" />
                  <span>Share link</span>
                </button>
                <button
                  onClick={onViewProof}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200 text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap"
                >
                  <MessageSquare className="w-3 h-3 text-gray-500" />
                  <span>View proof</span>
                </button>
                <button
                  onClick={onConfigureForm}
                  className="p-1 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
                  title="Form Settings"
                >
                  <Settings className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Right: Metrics Grid (Matches Senja 02:47) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 border-t xl:border-t-0 xl:border-l border-gray-100 pt-4 xl:pt-0 xl:pl-6 shrink-0">
            <div className="text-center px-2">
              <span className="block text-lg font-bold text-gray-900">—</span>
              <span className="text-[11px] text-gray-400 font-medium whitespace-nowrap">invites</span>
            </div>
            <div className="text-center px-2">
              <span className="block text-lg font-bold text-gray-900">—</span>
              <span className="text-[11px] text-gray-400 font-medium whitespace-nowrap">unique visits</span>
            </div>
            <div className="text-center px-2">
              <span className="block text-lg font-bold text-gray-900">—</span>
              <span className="text-[11px] text-gray-400 font-medium whitespace-nowrap">testimonials</span>
            </div>
            <div className="text-center px-2">
              <span className="block text-lg font-bold text-emerald-600">—</span>
              <span className="text-[11px] text-gray-400 font-medium whitespace-nowrap">response rate</span>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
};
