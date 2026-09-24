import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { TestimonialForm } from '../components/collector/TestimonialForm';
import { LivePreviewCard } from '../components/collector/LivePreviewCard';
import { SuccessModal } from '../components/collector/SuccessModal';
import { Review, ReviewInput, CollectionForm, Project } from '../types';
import { storage, getActiveBackendInfo } from '../lib/storage';
import { AlertCircle, ArrowLeft, Building2, Clock, Star, CheckCircle2 } from 'lucide-react';
import { usePageSeo } from '../lib/seo';
import { analytics } from '../lib/analytics';
import { cleanBrandOrProductName, deduplicateRepeatedString } from '../lib/security';

const INITIAL_FORM_STATE: ReviewInput = {
  name: '',
  email: '',
  role: '',
  company: '',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  rating: 5,
  title: '',
  content: '',
  type: 'text',
  tags: ['Quality', 'Recommended'],
  consent: true,
};

type CollectionStep = 'rating' | 'negative-feedback' | 'positive-form';

export const PublicCollectorPage = () => {
  const { collectionSlug } = useParams<{ collectionSlug: string }>();
  
  const [formConfig, setFormConfig] = useState<CollectionForm | null>(null);
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isClosed, setIsClosed] = useState(false);

  // 2-Branch Senja Step Flow (Matches 02:33 - 02:44 in video)
  const [step, setStep] = useState<CollectionStep>('rating');
  const [selectedRating, setSelectedRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [negativeFeedback, setNegativeFeedback] = useState<string>('');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState<boolean>(false);

  const [formData, setFormData] = useState<ReviewInput>(INITIAL_FORM_STATE);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedReview, setSubmittedReview] = useState<Review | null>(null);

  const displayBrand = cleanBrandOrProductName(project?.name || formConfig?.settings?.brandName);
  const displayProductName = displayBrand || 'our product';
  const cleanedTitle = deduplicateRepeatedString(formConfig?.title) || 'Share Your Experience';

  const pageTitle = displayBrand && displayBrand.toLowerCase() !== 'panda praise'
    ? `${cleanedTitle} — ${displayBrand} | Panda Praise`
    : `${cleanedTitle} — Panda Praise`;

  usePageSeo({
    title: pageTitle,
    description: formConfig?.description || 'Submit your verified feedback and customer testimonial.',
  });

  useEffect(() => {
    const loadPublicForm = async () => {
      setIsLoading(true);
      setError(null);
      setIsClosed(false);

      try {
        if (!collectionSlug) {
          setError('Invalid or missing collection link.');
          setIsLoading(false);
          return;
        }

        const result = await storage.getCollectionFormBySlug(collectionSlug);
        if (!result) {
          setError(`Collection form "${collectionSlug}" was not found.`);
          setIsLoading(false);
          return;
        }

        if (!result.form.isActive) {
          setIsClosed(true);
          setIsLoading(false);
          return;
        }

        setFormConfig(result.form);
        setProject(result.project);
      } catch (err: any) {
        const backend = getActiveBackendInfo();
        const errorCode = err?.code || 'unknown';
        const errorMessage = err?.message || String(err);
        console.error('[PublicCollector] Error loading form:', {
          code: errorCode,
          message: errorMessage,
          backend: backend.type,
          firebaseProjectId: backend.type === 'firebase' ? backend.projectId : undefined,
          collectionSlug,
        });
        setError('Failed to load collection form. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    loadPublicForm();
  }, [collectionSlug]);

  const handleRatingContinue = () => {
    if (selectedRating <= 3) {
      setStep('negative-feedback');
    } else {
      setFormData(prev => ({ ...prev, rating: selectedRating }));
      setStep('positive-form');
    }
  };

  const handleNegativeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!negativeFeedback.trim()) return;
    setIsSubmitting(true);

    try {
      await storage.createReview(
        {
          name: 'Private Customer',
          email: '',
          role: 'Customer',
          rating: selectedRating,
          content: negativeFeedback.trim(),
          type: 'text',
          tags: ['private-feedback'],
          projectId: formConfig?.projectId,
          collectionFormId: formConfig?.id,
          status: 'rejected', // routes to private feedback inbox
          consent: false,
        },
        formConfig?.projectId
      );
      setFeedbackSubmitted(true);
    } catch (err) {
      console.error('Failed to submit private feedback:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (data: ReviewInput) => {
    setIsSubmitting(true);
    try {
      const autoTagSetting = formConfig?.settings?.autoTag;
      const autoTags = Array.isArray(autoTagSetting)
        ? autoTagSetting
        : (autoTagSetting || '')
            .split(/[,;\s]+/)
            .map(t => t.trim().replace(/^#/, ''))
            .filter(Boolean);

      const isAutoApprove = Boolean(formConfig?.settings?.autoApprove);
      const combinedTags = Array.from(new Set([...(data.tags || []), ...autoTags]));

      const created = await storage.createReview(
        {
          ...data,
          tags: combinedTags,
          projectId: formConfig?.projectId,
          collectionFormId: formConfig?.id,
          status: isAutoApprove ? 'approved' : 'pending',
          consent: true,
        },
        formConfig?.projectId
      );
      analytics.publicCollectionSubmitted();
      analytics.testimonialSubmissionCompleted({
        projectId: formConfig?.projectId || 'unknown',
        formId: formConfig?.id || 'unknown',
        hasAvatar: Boolean(data.avatarUrl),
      });
      setSubmittedReview(created);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FAF9F6] flex flex-col items-center justify-center text-gray-500 font-sans">
        <div className="w-10 h-10 border-2 border-[#6701e6]/30 border-t-[#6701e6] rounded-full animate-spin mb-4" />
        <p className="text-sm font-medium text-gray-700">Loading collection form...</p>
      </div>
    );
  }

  if (isClosed) {
    return (
      <div className="min-h-screen bg-[#FAF9F6] flex flex-col items-center justify-center p-4 text-center font-sans">
        <div className="max-w-md p-8 rounded-3xl bg-white border border-gray-200 space-y-4 shadow-lg">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
            <Clock className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold font-display text-gray-900">Collection Paused</h2>
          <p className="text-xs text-gray-600 leading-relaxed">
            This collection form is currently closed and not accepting new responses. Thank you for your interest!
          </p>
        </div>
      </div>
    );
  }

  if (error || !formConfig) {
    return (
      <div className="min-h-screen bg-[#FAF9F6] flex flex-col items-center justify-center p-4 text-center font-sans">
        <div className="max-w-md p-8 rounded-3xl bg-white border border-red-200 space-y-4 shadow-lg">
          <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold font-display text-gray-900">Form Unavailable</h3>
          <p className="text-xs text-gray-600 leading-relaxed">
            {error || 'This testimonial collection form does not exist.'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-gray-900 font-sans selection:bg-purple-100 selection:text-purple-900 flex flex-col">
      
      {/* Public Header */}
      <header className="w-full border-b border-gray-200/80 bg-white/90 backdrop-blur-md py-4 px-4 sm:px-8">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="font-extrabold text-sm text-[#6701e6] font-display shrink-0">
              Panda Praise
            </span>
            {displayBrand && displayBrand.toLowerCase() !== 'panda praise' && (
              <>
                <span className="text-gray-300 shrink-0">•</span>
                <span className="font-medium text-xs text-gray-700 flex items-center gap-1.5 truncate">
                  <Building2 className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                  <span className="truncate">{displayBrand}</span>
                </span>
              </>
            )}
          </div>

          <div className="text-[11px] text-gray-400 shrink-0">
            Powered by <span className="font-bold text-[#6701e6]">Panda Praise</span>
          </div>
        </div>
      </header>

      {/* Main Experience */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-8">
        
        {/* ── STEP 1: INITIAL 5-STAR RATING CARD (Matches Senja 02:33 in video) ── */}
        {step === 'rating' && (
          <div className="w-full max-w-lg bg-white rounded-3xl border border-gray-200/80 shadow-xl p-8 sm:p-12 text-center space-y-6 animate-scale-in">
            
            {/* Brand Logo */}
            <div className="space-y-1">
              <span className="font-black text-xl text-[#6701e6] font-display">
                Panda Praise
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 font-display break-words">
                Do you enjoy using {displayProductName}?
              </h2>
              <p className="text-xs text-gray-500">
                On a scale of 1 to 5, how would you rate us?
              </p>
            </div>

            {/* 5 Interactive Stars */}
            <div className="flex items-center justify-center gap-2 py-4">
              {[1, 2, 3, 4, 5].map((star) => {
                const isActive = (hoverRating || selectedRating) >= star;
                return (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setSelectedRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="p-1 text-gray-200 hover:scale-110 transition-transform cursor-pointer"
                  >
                    <Star
                      className={`w-9 h-9 sm:w-11 sm:h-11 transition-colors ${
                        isActive ? 'text-amber-400 fill-amber-400' : 'text-gray-200'
                      }`}
                    />
                  </button>
                );
              })}
            </div>

            {/* Continue Button */}
            <button
              onClick={handleRatingContinue}
              className="w-full py-3.5 px-6 rounded-2xl bg-[#6701e6] hover:bg-[#5200bd] text-white font-bold text-sm transition-all shadow-xs hover:shadow cursor-pointer"
            >
              Continue
            </button>

            {/* Footer link */}
            <div className="pt-2 text-[11px] text-gray-400">
              Collect testimonials with <span className="text-[#6701e6] font-semibold">Panda Praise ↗</span>
            </div>
          </div>
        )}

        {/* ── STEP 2A: NEGATIVE FEEDBACK INBOX (1-3 STARS) (Matches Senja 02:38 in video) ── */}
        {step === 'negative-feedback' && (
          <div className="w-full max-w-lg bg-white rounded-3xl border border-gray-200/80 shadow-xl p-8 sm:p-12 text-center space-y-6 animate-fade-in relative">
            
            {/* Back Button */}
            <button
              onClick={() => setStep('rating')}
              className="absolute top-6 left-6 p-2 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
              title="Change rating"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>

            {feedbackSubmitted ? (
              <div className="space-y-4 py-8">
                <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 font-display">
                  Thank you for your honesty!
                </h3>
                <p className="text-xs text-gray-600 max-w-xs mx-auto leading-relaxed">
                  Your feedback has been delivered directly to the founders. We'll use your notes to improve {displayProductName}.
                </p>
              </div>
            ) : (
              <form onSubmit={handleNegativeSubmit} className="space-y-5">
                <div className="space-y-1">
                  <span className="font-black text-xl text-[#6701e6] font-display">
                    Panda Praise
                  </span>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 font-display">
                    Sorry to hear that!
                  </h2>
                  <p className="text-xs text-gray-500">
                    I'm sorry to hear you don't like our product. Can you share what went wrong?
                  </p>
                </div>

                <textarea
                  rows={4}
                  required
                  value={negativeFeedback}
                  onChange={(e) => setNegativeFeedback(e.target.value)}
                  placeholder="Write your feedback..."
                  className="w-full p-4 rounded-2xl bg-gray-50 border border-gray-200 text-xs text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-[#6701e6] focus:border-[#6701e6] resize-none"
                />

                <button
                  type="submit"
                  disabled={isSubmitting || !negativeFeedback.trim()}
                  className="w-full py-3.5 px-6 rounded-2xl bg-[#6701e6] hover:bg-[#5200bd] text-white font-bold text-sm transition-all shadow-xs hover:shadow cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? 'Submitting...' : 'Continue'}
                </button>
              </form>
            )}

            {/* Footer link */}
            <div className="pt-2 text-[11px] text-gray-400">
              Collect testimonials with <span className="text-[#6701e6] font-semibold">Panda Praise ↗</span>
            </div>
          </div>
        )}

        {/* ── STEP 2B: POSITIVE TESTIMONIAL FORM (4-5 STARS) ── */}
        {step === 'positive-form' && (
          <div className="w-full max-w-5xl mx-auto py-6 animate-fade-in space-y-6">
            
            <button
              onClick={() => setStep('rating')}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-gray-900 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Change rating</span>
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              <div className="lg:col-span-7">
                <TestimonialForm
                  formData={formData}
                  setFormData={setFormData}
                  onSubmit={handleSubmit}
                  isSubmitting={isSubmitting}
                />
              </div>

              <div className="lg:col-span-5 sticky top-8 space-y-4">
                <LivePreviewCard data={formData} />
              </div>
            </div>
          </div>
        )}

      </main>

      {/* Success Celebration Modal */}
      {submittedReview && (
        <SuccessModal
          review={submittedReview}
          isPublicView={true}
          businessName={displayBrand || formConfig?.settings?.brandName || formConfig?.title}
          projectId={formConfig?.projectId}
          onClose={() => setSubmittedReview(null)}
          onResetForm={() => {
            setFormData(INITIAL_FORM_STATE);
            setStep('rating');
          }}
        />
      )}
    </div>
  );
};
export default PublicCollectorPage;
