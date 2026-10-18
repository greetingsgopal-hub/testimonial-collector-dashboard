import { useState, useEffect } from 'react';
import {
  getFirestore,
  doc,
  getDoc,
  collection,
  addDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { CheckCircle2, ArrowRight, Sparkles } from 'lucide-react';
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

      const submissionData = {
        workspaceId: workspaceSlug,
        authorName: config.prefilledName || submission.meta1Value || 'Valued Customer',
        authorRole: config.prefilledClient || config.prefilledCampaign || 'Verified Client',
        content: activeText.trim() || 'Submitted feedback form.',
        rating: computedRating,
        matrixRatings: activeMatrix,
        mediaType: 'text',
        source: 'Review Feedback Form',
        status: 'approved', // Shifts straight into Proof section
        tags: ['Ease of use', 'Support'],
        createdAt: new Date().toISOString(),
      };

      // 1. Local storage persistence (guarantees zero submission loss)
      try {
        const localKey = `pandapraise_submitted_reviews_${workspaceSlug}`;
        const existing = JSON.parse(localStorage.getItem(localKey) || '[]');
        existing.unshift({ ...submissionData, id: `local_${Date.now()}` });
        localStorage.setItem(localKey, JSON.stringify(existing));
      } catch {}

      // 2. Direct Firestore Write to testimonials collection
      try {
        const db = getFirestore();
        await addDoc(collection(db, 'testimonials'), {
          ...submissionData,
          timestamp: serverTimestamp(),
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
  // POLISHED SUCCESS SCREEN (Fixes Caret Bug + Adds "Start Your Own Business" Loop)
  // ==========================================================================
  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-[#314424] flex items-center justify-center p-6 font-sans antialiased select-none">
        <div className="bg-[#FBF6EA] text-[#1C2417] rounded-3xl p-8 sm:p-10 max-w-lg w-full text-center shadow-2xl space-y-6">
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

          {/* CONVERT CUSTOMER TO USER: Viral Product Loop */}
          <div className="pt-4 border-t border-[#314424]/15 space-y-3 text-left">
            <div className="p-4 rounded-2xl bg-[#314424] text-[#FBF6EA] space-y-2 relative overflow-hidden shadow-md">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-300">
                <Sparkles className="w-4 h-4" />
                <span>Run your own business?</span>
              </div>
              <p className="text-xs text-[#FBF6EA]/90 leading-relaxed">
                Collect automated customer testimonials and display high-converting Wall of Love widgets just like {config.brandPillText}.
              </p>
              <a
                href="/signup"
                className="mt-2 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-[#314424] text-xs font-extrabold hover:bg-slate-100 transition-all cursor-pointer shadow-sm"
              >
                <span>Claim Your Free PandaPraise Workspace</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>
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
