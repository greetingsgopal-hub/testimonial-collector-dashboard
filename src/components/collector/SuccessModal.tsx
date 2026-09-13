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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="glass-panel w-full max-w-md rounded-2xl p-6 sm:p-8 border border-white/15 shadow-2xl relative overflow-hidden animate-slide-up text-center">
        
        {/* Glow effect */}
        <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-48 h-48 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Success Icon */}
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-glow-emerald">
          <CheckCircle2 className="w-8 h-8" />
        </div>

        {/* Clear Status Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 text-xs font-semibold mb-3">
          <span>Received • Awaiting Review</span>
        </div>

        <h3 className="text-2xl font-bold font-display text-white mb-2">
          Thank you — your testimonial has been received
        </h3>
        <p className="text-sm text-zinc-300 mb-6 leading-relaxed">
          It has been sent to the business owner for review. You don't need to do anything else.
        </p>

        {/* Review Reference ID (Only shown in dashboard testing mode, hidden for public visitors) */}
        {!isPublicView && (
          <div className="p-3 rounded-xl bg-zinc-900/90 border border-zinc-800 flex items-center justify-between text-xs text-zinc-400 mb-6">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-brand-400" />
              Ref: <code className="text-zinc-200 font-mono">{review.id}</code>
            </span>
            <button
              onClick={handleCopyId}
              className="flex items-center gap-1 px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
        )}

        {/* Action Buttons */}
        <div className={`grid ${isPublicView ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2'} gap-3`}>
          <button
            onClick={() => {
              onResetForm();
              onClose();
            }}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-sm font-medium text-zinc-200 transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Submit Another Testimonial</span>
          </button>

          {!isPublicView && onGoToDashboard && (
            <button
              onClick={() => {
                onClose();
                onGoToDashboard();
              }}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-pink-600 hover:from-brand-500 hover:to-pink-500 text-sm font-semibold text-white shadow-glow-sm transition-all"
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
