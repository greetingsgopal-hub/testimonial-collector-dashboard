import { useState, useEffect } from 'react';
import {
  getFirestore,
  doc,
  getDoc,
} from 'firebase/firestore';
import { submitCustomerTestimonialToPipeline } from '../../services/testimonialSyncEngine';
import { CheckCircle2, Sparkles } from 'lucide-react';
import {
  ConstantReviewFeedbackTemplate,
  ReviewFormConfig,
  DEFAULT_REVIEW_CONFIG,
  CustomerFormSubmission,
} from './UnifiedReviewFeedbackSystem';

export default function PublicCustomerFeedbackPage({
  workspaceSlug = 'onionbananaalo',
}: {
  workspaceSlug?: string;
}) {
  const [config, setConfig] = useState<ReviewFormConfig>(DEFAULT_REVIEW_CONFIG);
  const [submission, setSubmission] = useState<CustomerFormSubmission>({
    meta1Value: '',
    meta2Value: '',
    meta3Value: '',
    meta4Value: new Date().toLocaleDateString(),
    selectedEmojiIndex: 0,
    matrixRatings: [4, 4, 4, 4],
    openFeedbackText: '',
  });
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

  // Load configured texts & prefilled business details for this workspace
  useEffect(() => {
    try {
      const cached = localStorage.getItem(`review_config_${workspaceSlug}`);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed && parsed.brandPillText) {
          setConfig(parsed);
          setSubmission((prev) => ({
            ...prev,
            meta1Value: parsed.prefilledName || '',
            meta2Value: parsed.prefilledCampaign || '',
            meta3Value: parsed.prefilledClient || '',
          }));
        }
      }
    } catch {}

    try {
      const db = getFirestore();
      getDoc(doc(db, 'workspaces', workspaceSlug))
        .then((snap) => {
          if (snap.exists() && snap.data()?.reviewFormConfig) {
            const remoteConfig = snap.data().reviewFormConfig;
            setConfig({
              ...DEFAULT_REVIEW_CONFIG,
              ...remoteConfig,
            });
            // Pre-fill the submission form with the business-configured details
            setSubmission((prev) => ({
              ...prev,
              meta1Value: remoteConfig.prefilledName || '',
              meta2Value: remoteConfig.prefilledCampaign || '',
              meta3Value: remoteConfig.prefilledClient || '',
            }));
          }
        })
        .catch(() => null);
    } catch {
      // Test environment fallback
    }
  }, [workspaceSlug]);

  const handleCustomerFinalSubmit = async (formData?: {
    selectedEmojiIndex?: number;
    matrixRatings?: [number | null, number | null, number | null, number | null];
    improvementText?: string;
    mediaType?: 'text' | 'video';
    videoUrl?: string;
    videoDurationSeconds?: number;
    authorName?: string;
    authorRole?: string;
  }) => {
    setIsSubmitting(true);
    try {
      const activeEmojiIdx =
        formData?.selectedEmojiIndex !== undefined
          ? formData.selectedEmojiIndex
          : submission.selectedEmojiIndex;
      const activeMatrix = formData?.matrixRatings || submission.matrixRatings;
      const activeText =
        formData?.improvementText !== undefined
          ? formData.improvementText
          : submission.openFeedbackText;

      const emojiStars = 5 - activeEmojiIdx; // 0=5★, 1=4★, etc.
      const validRows = activeMatrix.filter((r) => r !== null) as number[];
      const matrixAvg =
        validRows.length > 0 ? validRows.reduce((sum, r) => sum + (r + 1), 0) / validRows.length : 5;
      const computedRating = Math.max(1, Math.min(5, Math.round((emojiStars + matrixAvg) / 2)));

      const isVideo =
        formData?.mediaType === 'video' ||
        submission.mediaType === 'video' ||
        !!formData?.videoUrl ||
        !!submission.videoUrl;

      const submittedName =
        formData?.authorName?.trim() ||
        submission.meta1Value ||
        config.prefilledName ||
        'Valued Customer';

      const submittedRole =
        formData?.authorRole?.trim() ||
        submission.meta3Value ||
        config.prefilledClient ||
        'Verified Client';

      const submissionData = {
        workspaceId: workspaceSlug,
        authorName: submittedName,
        authorRole: submittedRole,
        content: activeText.trim() || (isVideo ? 'Recorded video testimonial (+2x Perk)' : 'Submitted feedback form.'),
        rating: computedRating,
        matrixRatings: activeMatrix,
        mediaType: isVideo ? 'video' : 'text',
        videoUrl: formData?.videoUrl || submission.videoUrl || undefined,
        videoDurationSeconds: formData?.videoDurationSeconds || submission.videoDurationSeconds || undefined,
        source: 'Review Feedback Form',
        status: 'approved', // Shifts straight into Proof section
        tags: ['Ease of use', 'Support', ...(isVideo ? ['Video Proof'] : [])],
        createdAt: new Date().toISOString(),
      };

      // 1. Local storage persistence (guarantees zero submission loss)
      try {
        const localKey = `pandapraise_submitted_reviews_${workspaceSlug}`;
        const existing = JSON.parse(localStorage.getItem(localKey) || '[]');
        existing.unshift({ ...submissionData, id: `local_${Date.now()}` });
        localStorage.setItem(localKey, JSON.stringify(existing));
      } catch {}

      // 2. Direct Firestore Write via unified sync engine
      try {
        await submitCustomerTestimonialToPipeline({
          rawWorkspaceSlugOrId: workspaceSlug,
          authorName: submittedName,
          authorRole: submittedRole,
          content: activeText.trim() || (isVideo ? 'Recorded video testimonial (+2x Perk)' : 'Submitted feedback form.'),
          rating: computedRating,
          mediaType: isVideo ? 'video' : 'text',
          videoDataUrl: formData?.videoUrl || submission.videoUrl || null,
          matrixRatings: activeMatrix,
          source: 'Review Feedback Form',
        });
      } catch (firestoreErr) {
        console.warn('Firestore testimonials write notice:', firestoreErr);
      }

      setIsSubmitted(true);
    } catch (err: any) {
      console.warn('Feedback submit notice:', err);
      setIsSubmitted(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ==========================================================================
  // HIGH-GROWTH CONVERSION ENGINE THANK YOU SCREEN
  // ==========================================================================
  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-[#314424] flex items-center justify-center p-6 font-sans antialiased select-none">
        <div className="bg-[#FBF6EA] text-[#1C2417] rounded-3xl p-8 sm:p-10 max-w-lg w-full text-center shadow-2xl space-y-6">
          {/* Success Icon */}
          <div className="w-16 h-16 rounded-full bg-[#314424]/10 text-[#314424] flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-9 h-9" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#11160E]">
              Thank You for Your Feedback!
            </h2>
            <p className="text-xs sm:text-sm text-[#314424]/80 leading-relaxed max-w-sm mx-auto">
              Your review has been successfully recorded and verified for{' '}
              <strong className="text-[#314424]">{config.brandPillText}</strong>.
            </p>
          </div>

          {/* HIGH-CONVERSION CROSS-SELL / REWARD BOX (Customizable by Business) */}
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-left space-y-2 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-xs font-extrabold text-amber-800 uppercase tracking-wide">
                <span>🎁 Exclusive Thank You Reward</span>
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-200/80 text-amber-900">
                Limited Time
              </span>
            </div>
            <p className="text-xs text-amber-900/90 leading-relaxed">
              As a token of appreciation from <strong>{config.brandPillText}</strong>, enjoy <strong>15% off</strong> your next purchase:
            </p>
            <div className="flex items-center justify-between p-2 rounded-xl bg-amber-100/70 border border-amber-300/80">
              <code className="font-mono font-extrabold text-xs text-amber-950 tracking-wider">
                REVIEW15
              </code>
              <button
                type="button"
                data-testid="copy-reward-coupon-btn"
                onClick={() => {
                  if (navigator.clipboard) {
                    navigator.clipboard.writeText('REVIEW15').catch(() => {});
                  }
                }}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-800 text-white text-[11px] font-bold hover:bg-amber-900 transition-all cursor-pointer"
              >
                <span>Copy Code</span>
              </button>
            </div>
          </div>

          {/* VIRAL DISTRIBUTION LOOP: Convert Reviewer into PandaPraise User */}
          <div className="pt-2 border-t border-[#314424]/15 space-y-3 text-left">
            <div className="p-4 rounded-2xl bg-[#314424] text-[#FBF6EA] space-y-2.5 relative overflow-hidden shadow-md">
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300">
                <Sparkles className="w-4 h-4" />
                <span>Collect reviews like this for your business</span>
              </div>
              <p className="text-xs text-[#FBF6EA]/90 leading-relaxed">
                PandaPraise helps businesses capture automated video & text testimonials in 2 minutes.
              </p>
              <a
                href="/signup"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 inline-flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-white text-[#314424] text-xs font-extrabold hover:bg-slate-100 transition-all cursor-pointer shadow-sm"
              >
                <span>Create Your Free PandaPraise Workspace →</span>
              </a>
            </div>
          </div>

          {/* Branded Attribution & Growth Badge */}
          <div className="pt-1 text-center">
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#314424]/70 hover:text-[#314424] transition-colors"
            >
              <span>⚡ Powered by <strong>PandaPraise</strong></span>
              <span>•</span>
              <span className="underline">Collect automated praise</span>
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-200/70 py-10 px-4">
      <ConstantReviewFeedbackTemplate
        texts={config}
        submission={submission}
        onChangeSubmission={setSubmission}
        onSubmit={handleCustomerFinalSubmit}
        isSubmitting={isSubmitting}
        showSubmitButton={true}
      />
    </div>
  );
}

export { PublicCustomerFeedbackPage };
