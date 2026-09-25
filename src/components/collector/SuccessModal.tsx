import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { CheckCircle2, ArrowRight, PlusCircle, Sparkles, Copy, Check } from 'lucide-react';
import { Review } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { analytics } from '../../lib/analytics';

interface SuccessModalProps {
  review: Review | null;
  onClose: () => void;
  onGoToDashboard?: () => void;
  onResetForm: () => void;
  isPublicView?: boolean;
  businessName?: string;
  projectId?: string;
  formId?: string;
}

export const SuccessModal: React.FC<SuccessModalProps> = ({
  review,
  onClose,
  onGoToDashboard,
  onResetForm,
  isPublicView = false,
  businessName,
  projectId,
  formId,
}) => {
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    // Fire confetti cannon
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#8b5cf6', '#ec4899', '#3b82f6', '#10b981', '#f59e0b'],
    });

    if (isPublicView) {
      analytics.viralCtaViewed({
        has_business_name: Boolean(businessName),
      });
    }
  }, [isPublicView, businessName]);

  if (!review) return null;

  const handleCopyId = () => {
    navigator.clipboard.writeText(review.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleViralSignup = () => {
    analytics.viralCtaClicked({
      source: 'testimonial_submission',
      has_customer_name: Boolean(review.name),
      has_customer_company: Boolean(review.company),
    });

    // Priority 3 & 5: Store non-sensitive attribution and minimal first-name context in browser session
    try {
      const cleanFirstName = review.name ? review.name.trim().split(' ')[0] : '';
      sessionStorage.setItem(
        'pandapraise_viral_origin',
        JSON.stringify({
          source: 'testimonial',
          customerFirstName: cleanFirstName,
          customerEmail: review.email || '',
          referredFromProjectId: projectId || review.projectId || '',
          referredFromFormId: formId || review.collectionFormId || '',
          timestamp: Date.now(),
        })
      );
    } catch (e) {
      // Ignore sessionStorage exceptions
    }

    onClose();
    navigate('/signup?source=testimonial');
  };

  const recipientBusiness = businessName || 'the business owner';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="bg-white w-full max-w-md rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-2xl relative overflow-hidden animate-slide-up text-center text-gray-900 my-auto">
        
        {/* Glow effect */}
        <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-48 h-48 bg-purple-100/60 rounded-full blur-3xl pointer-events-none" />

        {/* Success Icon */}
        <div className="w-14 h-14 sm:w-16 sm:h-16 mx-auto mb-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shadow-xs">
          <CheckCircle2 className="w-7 h-7 sm:w-8 sm:h-8" />
        </div>

        {/* Clear Status Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold mb-3">
          <span>✓ Testimonial submitted</span>
        </div>

        <h3 className="text-xl sm:text-2xl font-extrabold font-display text-gray-950 mb-2 leading-snug">
          Thank you{review.name ? `, ${review.name}` : ''}!
        </h3>
        <p className="text-xs sm:text-sm text-gray-600 mb-5 leading-relaxed font-sans">
          Your testimonial has been sent to <strong className="text-gray-900 font-semibold">{recipientBusiness}</strong>. It will appear on their website once approved.
        </p>

        {/* Review Reference ID (Dashboard view only) */}
        {!isPublicView && (
          <div className="p-3 rounded-2xl bg-gray-50 border border-gray-200 flex items-center justify-between text-xs text-gray-600 mb-5 font-sans">
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

        {/* ── VIRAL GROWTH CTA (Section 2 & 3 Exact) ── */}
        {isPublicView && (
          <div className="mb-5 pt-5 border-t border-gray-100 text-left">
            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-b from-purple-50/70 to-white border border-purple-200/80 shadow-xs relative overflow-hidden">
              <div className="flex items-center gap-1.5 mb-1.5">
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#6701e6] uppercase tracking-wider bg-purple-100/60 px-2 py-0.5 rounded-md">
                  <Sparkles className="w-3 h-3" /> Panda Praise for You
                </span>
              </div>

              <h4 className="text-sm sm:text-base font-extrabold text-gray-950 font-display leading-snug">
                Want to collect testimonials for your own business?
              </h4>
              <p className="text-xs text-gray-600 mt-1 leading-relaxed font-sans">
                Create your free Panda Praise account and get your own testimonial link.
              </p>

              <div className="mt-3.5 space-y-2.5">
                <button
                  onClick={handleViralSignup}
                  className="w-full py-3 px-4 rounded-xl bg-[#6701e6] hover:bg-[#5200bd] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-95 shadow-md cursor-pointer"
                >
                  <span>Create My Free Panda Praise</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <div className="flex items-center justify-between text-[11px] text-gray-500 pt-0.5">
                  <span>No credit card required.</span>
                  <button
                    onClick={() => {
                      onClose();
                      navigate('/login');
                    }}
                    className="text-[#6701e6] font-semibold hover:underline cursor-pointer"
                  >
                    Already have an account? Sign in →
                  </button>
                </div>

                {user && (
                  <div className="mt-2 pt-2.5 border-t border-purple-100/80 flex items-center justify-between gap-2 text-[11px] text-gray-500">
                    <span className="truncate max-w-[200px]">
                      Signed in as <strong className="text-gray-900 font-medium">{user.email}</strong>
                    </span>
                    <button
                      onClick={() => {
                        onClose();
                        navigate('/dashboard');
                      }}
                      className="text-[#6701e6] font-bold hover:underline shrink-0 flex items-center gap-0.5 cursor-pointer"
                    >
                      <span>Go to Dashboard</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Existing Secondary Action Buttons */}
        <div className={`grid ${isPublicView ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2'} gap-2.5 font-display`}>
          <button
            onClick={() => {
              onResetForm();
              onClose();
            }}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-xs sm:text-sm font-semibold text-gray-700 transition-colors cursor-pointer"
          >
            <PlusCircle className="w-4 h-4 text-gray-500" />
            <span>Submit Another Testimonial</span>
          </button>

          {!isPublicView && onGoToDashboard && (
            <button
              onClick={() => {
                onClose();
                onGoToDashboard();
              }}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#6701e6] hover:bg-[#5400bd] text-xs sm:text-sm font-bold text-white shadow-md transition-all cursor-pointer"
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

