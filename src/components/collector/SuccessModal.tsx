import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { CheckCircle2, ArrowRight, PlusCircle, Sparkles, Copy, Check } from 'lucide-react';
import { Review } from '../../types';

interface SuccessModalProps {
  review: Review | null;
  onClose: () => void;
  onGoToDashboard?: () => void;
  onResetForm: () => void;
  isPublicView?: boolean;
}

export const SuccessModal: React.FC<SuccessModalProps> = ({
  review,
  onClose,
  onGoToDashboard,
  onResetForm,
  isPublicView = false,
}) => {
  const [copied, setCopied] = React.useState(false);

  useEffect(() => {
    // Fire confetti cannon
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#8b5cf6', '#ec4899', '#3b82f6', '#10b981', '#f59e0b'],
    });
  }, []);

  if (!review) return null;

  const handleCopyId = () => {
    navigator.clipboard.writeText(review.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white w-full max-w-md rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-2xl relative overflow-hidden animate-slide-up text-center text-gray-900">
        
        {/* Glow effect */}
        <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-48 h-48 bg-purple-100/60 rounded-full blur-3xl pointer-events-none" />

        {/* Success Icon */}
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shadow-xs">
          <CheckCircle2 className="w-8 h-8" />
        </div>

        {/* Clear Status Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold mb-3">
          <span>Received • Awaiting Review</span>
        </div>

        <h3 className="text-2xl font-extrabold font-display text-gray-950 mb-2">
          Thank you — your testimonial has been received
        </h3>
        <p className="text-sm text-gray-600 mb-6 leading-relaxed font-sans">
          It has been sent to the business owner for review. You don't need to do anything else.
        </p>

        {/* Review Reference ID */}
        {!isPublicView && (
          <div className="p-3 rounded-2xl bg-gray-50 border border-gray-200 flex items-center justify-between text-xs text-gray-600 mb-6 font-sans">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#6701e6]" />
              Ref: <code className="text-gray-900 font-mono font-semibold">{review.id}</code>
            </span>
            <button
              onClick={handleCopyId}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white hover:bg-gray-100 text-gray-700 border border-gray-200 transition-colors font-medium cursor-pointer shadow-xs"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
        )}

        {/* Action Buttons */}
        <div className={`grid ${isPublicView ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2'} gap-3 font-display`}>
          <button
            onClick={() => {
              onResetForm();
              onClose();
            }}
            className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-sm font-bold text-gray-800 transition-colors cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Submit Another</span>
          </button>

          {!isPublicView && onGoToDashboard && (
            <button
              onClick={() => {
                onClose();
                onGoToDashboard();
              }}
              className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#6701e6] hover:bg-[#5400bd] text-sm font-bold text-white shadow-md transition-all cursor-pointer"
            >
              <span>View in Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
