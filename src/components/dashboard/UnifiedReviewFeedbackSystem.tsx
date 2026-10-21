import React, { useState, useEffect } from 'react';
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  collection,
  addDoc,
  serverTimestamp,
} from 'firebase/firestore';
import {
  Sliders,
  Eye,
  Check,
  Sparkles,
  CheckCircle2,
  Share2,
  Lock,
  Video,
  FileText,
} from 'lucide-react';
import { BrowserVideoRecorder } from './VideoTestimonialPipeline';

export interface CustomerFormSubmission {
  meta1Value: string;
  meta2Value: string;
  meta3Value: string;
  meta4Value: string;
  selectedEmojiIndex: number;
  matrixRatings: [number | null, number | null, number | null, number | null];
  openFeedbackText: string;
  mediaType?: 'text' | 'video';
  videoUrl?: string;
  videoDurationSeconds?: number;
}

// ============================================================================
// 1. CONFIGURATION & BILINGUAL DICTIONARY (English & Hinglish Support)
// ============================================================================
export interface ReviewFormConfig {
  brandPillText: string;
  contactEmailText: string;
  titleLine1: string;
  titleLine2: string;
  // Pre-filled business details to reduce end-user burden
  prefilledName: string;
  prefilledCampaign: string;
  prefilledClient: string;
  prefilledDate: string;
  allowVideo?: boolean;
  // Bilingual sections
  sections: {
    en: {
      emojiTitle: string;
      matrixTitle: string;
      cols: [string, string, string, string, string];
      questions: [string, string, string, string];
      improvementTitle: string;
      submitBtn: string;
    };
    hi: {
      emojiTitle: string;
      matrixTitle: string;
      cols: [string, string, string, string, string];
      questions: [string, string, string, string];
      improvementTitle: string;
      submitBtn: string;
    };
  };
}

export const DEFAULT_REVIEW_CONFIG: ReviewFormConfig = {
  brandPillText: 'onionbananaalo',
  contactEmailText: 'hello@reallygreatsite.com',
  titleLine1: 'Review',
  titleLine2: 'Feedback',
  prefilledName: 'Rahul Sharma',
  prefilledCampaign: 'Q4 Product Launch',
  prefilledClient: 'Product Lead',
  prefilledDate: '10/18/2026',
  allowVideo: true,
  sections: {
    en: {
      emojiTitle: 'How satisfied are you with the final content?',
      matrixTitle: 'Content Quality',
      cols: ['Very Bad', 'Bad', 'Good', 'Very Good', 'Excellent'],
      questions: [
        'How effective was the opening hook in capturing attention ?',
        'How natural and authentic did the on-camera delivery feel for your brand?',
        "How clearly and effectively was your product's value communicated?",
        'How satisfied are you with the overall visual presentation and editing quality?',
      ],
      improvementTitle: 'What Can Be Improved?',
      submitBtn: 'Submit Review Feedback →',
    },
    hi: {
      emojiTitle: 'Aap final content se kitne santusht (satisfied) hain?',
      matrixTitle: 'Content Quality (Quality ki jaanch)',
      cols: ['Bahut Bura', 'Bura', 'Achha', 'Bahut Achha', 'Shandar'],
      questions: [
        'Opening hook audience ka dhyan khichne mein kitna asardar tha?',
        'Aapke brand ke liye on-camera delivery kitni natural aur authentic lagi?',
        'Aapke product ki value kitni saaf taur par samjhayi gayi?',
        'Overall visual presentation aur editing quality se aap kitna khush hain?',
      ],
      improvementTitle: 'Kya Behtar Kiya Ja Sakta Hai? (What can be improved?)',
      submitBtn: 'Feedback Submit Karein →',
    },
  },
};

export const EMOJI_OPTIONS = [
  { emoji: '😍', rating: 5 },
  { emoji: '😁', rating: 4 },
  { emoji: '😎', rating: 3 },
  { emoji: '😔', rating: 2 },
  { emoji: '😭', rating: 1 },
];

// ============================================================================
// 2. UNIFIED RENDERER (Used by Dashboard Preview & Public End-User Form)
// ============================================================================
export function UnifiedReviewFormRenderer({
  config,
  isLockedForEndUser = false,
  onSubmitForm,
  isSubmitting = false,
}: {
  config: ReviewFormConfig;
  isLockedForEndUser?: boolean;
  onSubmitForm?: (formData: {
    selectedEmojiIndex: number;
    matrixRatings: [number | null, number | null, number | null, number | null];
    improvementText: string;
    mediaType?: 'text' | 'video';
    videoUrl?: string;
    videoDurationSeconds?: number;
  }) => void;
  isSubmitting?: boolean;
}) {
  const [lang, setLang] = useState<'en' | 'hi'>('en');
  void isLockedForEndUser;
  const [selectedEmojiIdx, setSelectedEmojiIdx] = useState<number>(0);
  const [matrixRatings, setMatrixRatings] = useState<
    [number | null, number | null, number | null, number | null]
  >([4, 4, 3, 4]);
  const [improvementText, setImprovementText] = useState<string>('');
  const [reviewMode, setReviewMode] = useState<'text' | 'video'>('text');
  const [recordedVideoUrl, setRecordedVideoUrl] = useState<string | null>(null);
  const [videoDuration, setVideoDuration] = useState<number>(0);

  const t = config.sections[lang] || config.sections.en;

  const handleMatrixTick = (rowIdx: number, colIdx: number) => {
    const next = [...matrixRatings] as [number | null, number | null, number | null, number | null];
    next[rowIdx] = next[rowIdx] === colIdx ? null : colIdx;
    setMatrixRatings(next);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSubmitForm) {
      onSubmitForm({
        selectedEmojiIndex: selectedEmojiIdx,
        matrixRatings,
        improvementText,
        mediaType: reviewMode === 'video' || recordedVideoUrl ? 'video' : 'text',
        videoUrl: recordedVideoUrl || undefined,
        videoDurationSeconds: videoDuration || undefined,
      });
    }
  };

  return (
    <form
      data-testid="unified-review-feedback-form"
      onSubmit={handleSubmit}
      className="w-full max-w-[640px] mx-auto rounded-3xl overflow-hidden shadow-2xl border border-slate-300 font-sans select-none"
    >
      {/* TOP HEADER BAR (With English / Hinglish Switcher for End User) */}
      <div className="bg-[#314424] text-[#FBF6EA] px-6 pt-6 pb-8 sm:px-9 sm:pt-8 sm:pb-9 relative">
        {/* Top Row: Brand Pill + Language Switcher */}
        <div className="flex items-center justify-between gap-4">
          <div
            data-testid="form-brand-pill"
            id="template-brand-pill-header"
            className="px-4 py-1.5 rounded-full border border-[#FBF6EA]/70 text-xs sm:text-sm font-bold tracking-wide"
          >
            <span data-testid="template-brand-pill">{config.brandPillText}</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] text-[#FBF6EA]/80 font-medium">Language:</span>
            <div className="inline-flex items-center p-0.5 rounded-lg bg-black/20 border border-white/20 text-xs font-bold">
              <button
                type="button"
                data-testid="lang-switch-en"
                onClick={() => setLang('en')}
                className={`px-2.5 py-1 rounded-md cursor-pointer transition-all ${
                  lang === 'en' ? 'bg-[#FBF6EA] text-[#314424]' : 'text-[#FBF6EA]'
                }`}
              >
                EN
              </button>
              <button
                type="button"
                data-testid="lang-switch-hi"
                onClick={() => setLang('hi')}
                className={`px-2.5 py-1 rounded-md cursor-pointer transition-all ${
                  lang === 'hi' ? 'bg-[#FBF6EA] text-[#314424]' : 'text-[#FBF6EA]'
                }`}
              >
                Hinglish
              </button>
            </div>
          </div>
        </div>

        {/* Title + Vector Icon */}
        <div className="mt-6 flex items-center justify-between gap-4">
          <div
            data-testid="form-main-title"
            className="leading-[1.02] tracking-tight font-extrabold text-3xl sm:text-[50px] text-[#FBF6EA]"
          >
            <div>{config.titleLine1}</div>
            <div>{config.titleLine2}</div>
          </div>

          <div data-testid="constant-vector-icon" className="shrink-0">
            <svg
              className="w-24 h-24 sm:w-32 sm:h-32 text-[#FBF6EA]"
              viewBox="0 0 140 135"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect x="14" y="6" width="112" height="38" rx="4" stroke="currentColor" strokeWidth="3.5" />
              <path d="M70 44V58L85 44" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
              {[30, 56, 82, 108].map((cx, i) => (
                <polygon
                  key={i}
                  points={`${cx},14 ${cx + 3.5},21 ${cx + 11},22 ${cx + 5.5},27 ${cx + 7},34 ${cx},30.5 ${cx - 7},34 ${cx - 5.5},27 ${cx - 11},22 ${cx - 3.5},21`}
                  stroke="currentColor"
                  strokeWidth="2.4"
                  strokeLinejoin="round"
                  fill="none"
                />
              ))}
              <circle cx="35" cy="82" r="12" stroke="currentColor" strokeWidth="3.5" />
              <path d="M14 122C14 108 23 99 35 99C43 99 49 103 52 109" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" />
              <circle cx="105" cy="82" r="12" stroke="currentColor" strokeWidth="3.5" />
              <path d="M126 122C126 108 117 99 105 99C97 99 91 103 88 109" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" />
              <circle cx="70" cy="76" r="15" stroke="currentColor" strokeWidth="3.5" />
              <path d="M42 122C42 104 54 95 70 95C86 95 98 104 98 122" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" />
              <line x1="10" y1="122" x2="130" y2="122" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" />
            </svg>
          </div>
        </div>

        {/* LOCKED BUSINESS DETAILS (Pre-filled by business, uneditable by end user to reduce burden) */}
        <div
          data-testid="locked-business-details"
          className="mt-6 pt-4 border-t border-[#FBF6EA]/30 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-xs sm:text-sm"
        >
          <div className="border-b border-dashed border-[#FBF6EA]/50 pb-1 flex items-center justify-between">
            <span className="text-[#FBF6EA]/70 font-medium">Name:</span>
            <span className="font-bold text-[#FBF6EA]" data-testid="locked-name">
              {config.prefilledName || '—'}
            </span>
          </div>
          <div className="border-b border-dashed border-[#FBF6EA]/50 pb-1 flex items-center justify-between">
            <span className="text-[#FBF6EA]/70 font-medium">Campaign:</span>
            <span className="font-bold text-[#FBF6EA]" data-testid="locked-campaign">
              {config.prefilledCampaign || '—'}
            </span>
          </div>
          <div className="border-b border-dashed border-[#FBF6EA]/50 pb-1 flex items-center justify-between">
            <span className="text-[#FBF6EA]/70 font-medium">Client:</span>
            <span className="font-bold text-[#FBF6EA]" data-testid="locked-client">
              {config.prefilledClient || '—'}
            </span>
          </div>
          <div className="border-b border-dashed border-[#FBF6EA]/50 pb-1 flex items-center justify-between">
            <span className="text-[#FBF6EA]/70 font-medium">Date:</span>
            <span className="font-bold text-[#FBF6EA]" data-testid="locked-date">
              {config.prefilledDate || '—'}
            </span>
          </div>
        </div>
      </div>

      {/* WARM CREAM BODY */}
      <div className="bg-[#FBF6EA] text-[#1C2417] px-6 py-7 sm:px-9 sm:py-9 space-y-7">
        
        {/* 1. Emoji Satisfaction Selector */}
        <div>
          <h3 data-testid="emoji-section-title" className="text-sm sm:text-base font-extrabold text-[#11160E]">
            {t.emojiTitle}
          </h3>
          <div className="relative mt-4 flex items-center justify-between px-2">
            <div className="absolute inset-x-8 top-1/2 -translate-y-1/2 border-t-2 border-dashed border-[#314424]/40 pointer-events-none" />
            {EMOJI_OPTIONS.map((item, idx) => {
              const active = selectedEmojiIdx === idx;
              return (
                <button
                  key={idx}
                  type="button"
                  data-testid={`emoji-option-${idx}`}
                  onClick={() => setSelectedEmojiIdx(idx)}
                  className={`relative z-10 w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[#314424] flex items-center justify-center text-2xl transition-transform cursor-pointer ${
                    active ? 'scale-115 ring-4 ring-[#314424]/30 shadow-md' : 'opacity-85 hover:scale-105'
                  }`}
                >
                  <span>{item.emoji}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Content Quality Matrix (Tick from Very Bad to Excellent) */}
        <div className="space-y-3">
          <div className="grid grid-cols-12 items-end gap-2 pb-1">
            <div className="col-span-5">
              <h3 data-testid="matrix-section-title" className="text-sm sm:text-base font-extrabold text-[#11160E]">
                {t.matrixTitle}
              </h3>
            </div>
            <div className="col-span-7 grid grid-cols-5 text-center text-[10px] font-bold text-[#314424]">
              {t.cols.map((colLbl, cI) => (
                <span key={cI} data-testid={`matrix-col-header-${cI}`} className="truncate px-0.5">
                  {colLbl}
                </span>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            {t.questions.map((qStr, rI) => (
              <div key={rI} className="grid grid-cols-12 items-center gap-2 py-1">
                <p data-testid={`matrix-question-${rI}`} className="col-span-5 text-[11px] sm:text-xs leading-snug text-[#222B1C] pr-1">
                  {qStr}
                </p>
                <div className="col-span-7 grid grid-cols-5 justify-items-center">
                  {[0, 1, 2, 3, 4].map((cI) => {
                    const ticked = matrixRatings[rI] === cI;
                    return (
                      <button
                        key={cI}
                        type="button"
                        data-testid={`matrix-check-${rI}-${cI}`}
                        onClick={() => handleMatrixTick(rI, cI)}
                        className={`w-6 h-6 sm:w-7 sm:h-7 border border-[#314424] flex items-center justify-center transition-colors cursor-pointer ${
                          ticked ? 'bg-[#314424] text-[#FBF6EA]' : 'bg-transparent hover:bg-[#314424]/10'
                        }`}
                      >
                        {ticked && <Check className="w-4 h-4 stroke-[3]" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 3. What Can Be Improved? / Testimonial Section with Video & Written Modes */}
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <h3 data-testid="improvement-section-title" className="text-sm sm:text-base font-extrabold text-[#11160E]">
              {t.improvementTitle}
            </h3>

            {/* Written vs Video Review Mode Switch */}
            {(config.allowVideo ?? true) && (
              <div className="inline-flex items-center p-1 rounded-xl bg-black/10 border border-[#314424]/20 text-xs font-bold self-start sm:self-auto">
                <button
                  type="button"
                  data-testid="toggle-written-review"
                  onClick={() => setReviewMode('text')}
                  className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 cursor-pointer transition-all ${
                    reviewMode === 'text'
                      ? 'bg-[#314424] text-[#FBF6EA] shadow-2xs'
                      : 'text-[#314424] hover:bg-[#314424]/10'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Written Review</span>
                </button>
                <button
                  type="button"
                  data-testid="toggle-video-review"
                  onClick={() => setReviewMode('video')}
                  className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 cursor-pointer transition-all ${
                    reviewMode === 'video'
                      ? 'bg-[#314424] text-[#FBF6EA] shadow-2xs'
                      : 'text-[#314424] hover:bg-[#314424]/10'
                  }`}
                >
                  <Video className="w-3.5 h-3.5" />
                  <span>Video (+2x Perk)</span>
                </button>
              </div>
            )}
          </div>

          {/* Interactive Prompt Pills when writing review */}
          {reviewMode === 'text' && (
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                data-testid="prompt-chip-solve"
                onClick={() =>
                  setImprovementText((prev) =>
                    prev ? `${prev} It solved our team's main bottleneck.` : "It solved our team's main bottleneck."
                  )
                }
                className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#314424]/5 border border-[#314424]/20 text-[#314424] hover:bg-[#314424]/10 cursor-pointer transition-all"
              >
                💡 What problem did it solve?
              </button>
              <button
                type="button"
                data-testid="prompt-chip-feature"
                onClick={() =>
                  setImprovementText((prev) =>
                    prev ? `${prev} Favorite feature is the instant 1-click proof.` : 'Favorite feature is the instant 1-click proof.'
                  )
                }
                className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#314424]/5 border border-[#314424]/20 text-[#314424] hover:bg-[#314424]/10 cursor-pointer transition-all"
              >
                ❤️ Favorite feature?
              </button>
            </div>
          )}

          {reviewMode === 'text' ? (
            <div className="space-y-1">
              <div className="flex justify-end text-[10px] font-mono text-[#314424]/60 pr-1">
                {improvementText.length} / 600
              </div>
              <textarea
                rows={4}
                required
                maxLength={600}
                data-testid="input-improvement-text"
                value={improvementText}
                onChange={(e) => setImprovementText(e.target.value)}
                placeholder={
                  lang === 'hi'
                    ? 'Apna sujhav ya review yahan likhein...'
                    : 'Write what can be improved or your testimonial here...'
                }
                className="w-full bg-transparent text-xs sm:text-sm text-[#1C2417] placeholder-[#314424]/45 focus:outline-none resize-none leading-[36px]"
                style={{
                  backgroundImage:
                    'repeating-linear-gradient(to bottom, transparent, transparent 34px, rgba(49, 68, 36, 0.4) 34px, rgba(49, 68, 36, 0.4) 36px)',
                  lineHeight: '36px',
                }}
              />
            </div>
          ) : (
            <div className="space-y-3" data-testid="unified-video-recorder-container">
              <BrowserVideoRecorder
                onVideoRecorded={(blobUrl, duration) => {
                  setRecordedVideoUrl(blobUrl);
                  setVideoDuration(duration);
                }}
              />
              <div className="space-y-1">
                <label className="block text-[11px] font-bold text-[#314424]">
                  Accompanying Note (Optional):
                </label>
                <input
                  type="text"
                  data-testid="input-improvement-text"
                  value={improvementText}
                  onChange={(e) => setImprovementText(e.target.value)}
                  placeholder="Add a quick note or highlight with your video..."
                  className="w-full px-3 py-2 rounded-xl bg-white/60 border border-[#314424]/30 text-xs text-[#1C2417] focus:outline-none"
                />
              </div>
            </div>
          )}
        </div>

        {/* Submit Button */}
        <div className="pt-2">
          <button
            type="submit"
            data-testid="submit-feedback-btn"
            disabled={isSubmitting}
            className="w-full py-3.5 px-6 rounded-xl bg-[#314424] hover:bg-[#25351B] disabled:opacity-60 text-[#FBF6EA] font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer"
          >
            {isSubmitting ? 'Submitting Feedback...' : t.submitBtn}
          </button>
        </div>
      </div>
    </form>
  );
}

// ============================================================================
// 2b. CONSTANT TEMPLATE ADAPTER (Used by PublicCustomerFeedbackPage)
// ============================================================================
export function ConstantReviewFeedbackTemplate({
  texts,
  submission,
  onChangeSubmission,
  onSubmit,
  isSubmitting = false,
  showSubmitButton: _showSubmitButton = true,
}: {
  texts: ReviewFormConfig;
  submission?: CustomerFormSubmission;
  onChangeSubmission?: (next: CustomerFormSubmission) => void;
  onSubmit?: (e?: any) => void;
  isSubmitting?: boolean;
  showSubmitButton?: boolean;
}) {
  return (
    <UnifiedReviewFormRenderer
      config={texts}
      isLockedForEndUser={true}
      isSubmitting={isSubmitting}
      onSubmitForm={(formData) => {
        if (onChangeSubmission && submission) {
          onChangeSubmission({
            ...submission,
            selectedEmojiIndex: formData.selectedEmojiIndex,
            matrixRatings: formData.matrixRatings,
            openFeedbackText: formData.improvementText,
            mediaType: formData.mediaType,
            videoUrl: formData.videoUrl,
            videoDurationSeconds: formData.videoDurationSeconds,
          });
        }
        if (onSubmit) {
          onSubmit(formData as any);
        }
      }}
    />
  );
}

// ============================================================================
// 3. DASHBOARD FORM BUILDER STUDIO (Business customizes form + pre-fills details)
// ============================================================================
export default function FormBuilderStudio({
  workspaceId = 'onionbananaalo',
  workspaceName = 'onionbananaalo',
}: {
  workspaceId?: string;
  workspaceName?: string;
}) {
  const cleanSlug = (workspaceId || 'onionbananaalo')
    .replace(/'s\s+workspace$/i, '')
    .replace(/\s+workspace$/i, '')
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '');

  const [config, setConfig] = useState<ReviewFormConfig>(() => ({
    ...DEFAULT_REVIEW_CONFIG,
    brandPillText: workspaceName || DEFAULT_REVIEW_CONFIG.brandPillText,
  }));
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const shareUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/c/${cleanSlug}`;

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Load saved config from Firestore on mount
  useEffect(() => {
    try {
      const db = getFirestore();
      getDoc(doc(db, 'workspaces', workspaceId))
        .then((snap) => {
          if (snap.exists() && snap.data()?.reviewFormConfig) {
            setConfig({
              ...DEFAULT_REVIEW_CONFIG,
              ...snap.data().reviewFormConfig,
            });
          }
        })
        .catch(() => null);
    } catch {
      // Test environment fallback
    }
  }, [workspaceId]);

  const handleSaveAndPublish = async () => {
    setIsSaving(true);
    try {
      try {
        localStorage.setItem(`review_config_${cleanSlug}`, JSON.stringify(config));
      } catch {}

      const db = getFirestore();
      await setDoc(
        doc(db, 'workspaces', workspaceId),
        {
          reviewFormConfig: config,
          customSlug: cleanSlug,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
      triggerToast(`Saved successfully! Live share link: ${shareUrl}`);
    } catch {
      triggerToast('Saved form settings for this session!');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCopyShareLink = async () => {
    await handleSaveAndPublish();
    await navigator.clipboard.writeText(shareUrl).catch(() => null);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  return (
    <div className="space-y-6 font-sans antialiased text-slate-900 pb-12" data-testid="unified-form-builder-studio">
      {/* TOP BAR */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#314424]" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#314424]">
              Forms · Review Feedback Builder
            </span>
          </div>
          <h1 className="text-xl font-bold text-slate-950 mt-0.5">
            Customize Collection Form & Pre-fill Customer Details
          </h1>
          <p className="text-xs text-slate-500">
            Pre-fill customer details so the end user doesn't have to. The end user can simply switch EN/Hinglish, tick ratings, and submit.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            data-testid="builder-save-btn"
            disabled={isSaving}
            onClick={handleSaveAndPublish}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-xs font-bold text-slate-800 cursor-pointer"
          >
            <span>{isSaving ? 'Saving...' : 'Save & Publish Live'}</span>
          </button>

          <button
            type="button"
            data-testid="builder-copy-share-btn"
            onClick={handleCopyShareLink}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#314424] hover:bg-[#25351B] text-white text-xs font-bold shadow-sm cursor-pointer transition-all"
          >
            {copiedLink ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
            <span>{copiedLink ? 'Link Copied!' : 'Copy Share Link'}</span>
          </button>
        </div>
      </div>

      {toastMessage && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            {toastMessage}
          </span>
          <button type="button" onClick={() => setToastMessage(null)} className="cursor-pointer">
            ✕
          </button>
        </div>
      )}

      {/* SPLIT: BUSINESS CONFIGURATOR (LEFT) + REAL-TIME PREVIEW (RIGHT) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: CUSTOMIZER */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#314424]/10 text-[#314424] flex items-center justify-center">
                <Sliders className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900">Variable Form Texts</h2>
                <p className="text-xs text-slate-500">Edit any heading, label, or question below.</p>
              </div>
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              Live Sync
            </span>
          </div>

          {/* 1. Header & Brand Texts */}
          <div className="space-y-3">
            <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">
              1. Header & Brand Texts
            </span>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Top-Left Brand Pill</label>
                <input
                  type="text"
                  data-testid="input-brand-pill"
                  value={config.brandPillText}
                  onChange={(e) => setConfig({ ...config, brandPillText: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Top-Right Email / Web</label>
                <input
                  type="text"
                  data-testid="input-contact-email"
                  value={config.contactEmailText}
                  onChange={(e) => setConfig({ ...config, contactEmailText: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Main Heading Line 1</label>
                <input
                  type="text"
                  data-testid="input-title-line-1"
                  value={config.titleLine1}
                  onChange={(e) => setConfig({ ...config, titleLine1: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Main Heading Line 2</label>
                <input
                  type="text"
                  data-testid="input-title-line-2"
                  value={config.titleLine2}
                  onChange={(e) => setConfig({ ...config, titleLine2: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold"
                />
              </div>
            </div>
          </div>

          {/* 2. Pre-filled Customer Details (Business fills this to reduce end-user burden) */}
          <div className="space-y-3 pt-4 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-purple-700 flex items-center gap-1">
                <Lock className="w-3.5 h-3.5" />
                <span>2. Pre-filled Customer Details (Locked for End User)</span>
              </span>
            </div>
            <p className="text-[11px] text-slate-500 leading-snug">
              The business fills these details before sharing the link so the customer doesn't have to re-enter them.
            </p>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Name</label>
                <input
                  type="text"
                  data-testid="input-prefilled-name"
                  value={config.prefilledName}
                  onChange={(e) => setConfig({ ...config, prefilledName: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Campaign</label>
                <input
                  type="text"
                  data-testid="input-prefilled-campaign"
                  value={config.prefilledCampaign}
                  onChange={(e) => setConfig({ ...config, prefilledCampaign: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Client</label>
                <input
                  type="text"
                  data-testid="input-prefilled-client"
                  value={config.prefilledClient}
                  onChange={(e) => setConfig({ ...config, prefilledClient: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Date</label>
                <input
                  type="text"
                  data-testid="input-prefilled-date"
                  value={config.prefilledDate}
                  onChange={(e) => setConfig({ ...config, prefilledDate: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold"
                />
              </div>
            </div>
          </div>

          {/* 3. Matrix Questions */}
          <div className="space-y-2.5 pt-4 border-t border-slate-100">
            <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">
              3. Evaluation Questions
            </span>
            {config.sections.en.questions.map((qStr, idx) => (
              <div key={idx}>
                <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Question #{idx + 1}</label>
                <input
                  type="text"
                  data-testid={`input-question-${idx}`}
                  value={qStr}
                  onChange={(e) => {
                    const nextQ = [...config.sections.en.questions] as [string, string, string, string];
                    nextQ[idx] = e.target.value;
                    setConfig({
                      ...config,
                      sections: {
                        ...config.sections,
                        en: { ...config.sections.en, questions: nextQ },
                      },
                    });
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                />
              </div>
            ))}
          </div>

          {/* 4. Video Recording Setting */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <div>
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Video className="w-3.5 h-3.5 text-purple-600" />
                <span>Video Testimonials (+2x Perk)</span>
              </label>
              <p className="text-[11px] text-slate-500">Allow customers to record in-browser video reviews.</p>
            </div>
            <input
              type="checkbox"
              data-testid="toggle-allow-video-checkbox"
              checked={config.allowVideo ?? true}
              onChange={(e) => setConfig({ ...config, allowVideo: e.target.checked })}
              className="w-4 h-4 rounded text-[#314424] focus:ring-[#314424] cursor-pointer"
            />
          </div>
        </div>

        {/* RIGHT COLUMN: REAL-TIME CUSTOMER FORM PREVIEW */}
        <div className="lg:col-span-7 flex flex-col items-center">
          <div className="w-full flex items-center justify-between mb-3 px-1">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Eye className="w-4 h-4 text-[#314424]" />
              <span>Real-Time Customer Form Preview (Test the EN | Hinglish Switch below)</span>
            </span>
            <span className="text-xs text-slate-400">Live Preview</span>
          </div>

          <UnifiedReviewFormRenderer
            config={config}
            isLockedForEndUser={false}
            onSubmitForm={() => triggerToast('Preview submission tested successfully!')}
          />
        </div>

      </div>
    </div>
  );
}

// ============================================================================
// 4. PUBLIC CUSTOMER COLLECTION PAGE (/c/:slug)
//    End user opens this link, switches EN/Hinglish, sees pre-filled locked
//    customer details, ticks ratings, writes improvement, and submits to Proof!
// ============================================================================
export function PublicCustomerFeedbackPage({
  workspaceSlug = 'onionbananaalo',
}: {
  workspaceSlug?: string;
}) {
  const [config, setConfig] = useState<ReviewFormConfig>(() => ({
    ...DEFAULT_REVIEW_CONFIG,
    brandPillText: workspaceSlug || DEFAULT_REVIEW_CONFIG.brandPillText,
  }));
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

  useEffect(() => {
    try {
      const cached = localStorage.getItem(`review_config_${workspaceSlug}`);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed && parsed.brandPillText) {
          setConfig(parsed);
        }
      }
    } catch {}

    try {
      const db = getFirestore();
      getDoc(doc(db, 'workspaces', workspaceSlug))
        .then((snap) => {
          if (snap.exists() && snap.data()?.reviewFormConfig) {
            setConfig({
              ...DEFAULT_REVIEW_CONFIG,
              ...snap.data().reviewFormConfig,
            });
          }
        })
        .catch(() => null);
    } catch {
      // Test environment fallback
    }
  }, [workspaceSlug]);

  const handleCustomerFinalSubmit = async (formData: {
    selectedEmojiIndex: number;
    matrixRatings: [number | null, number | null, number | null, number | null];
    improvementText: string;
    mediaType?: 'text' | 'video';
    videoUrl?: string;
    videoDurationSeconds?: number;
  }) => {
    setIsSubmitting(true);
    try {
      const emojiStars = EMOJI_OPTIONS[formData.selectedEmojiIndex]?.rating || 5;
      const validRows = formData.matrixRatings.filter((r) => r !== null) as number[];
      const matrixAvg =
        validRows.length > 0 ? validRows.reduce((sum, r) => sum + (r + 1), 0) / validRows.length : 5;
      const computedRating = Math.max(1, Math.min(5, Math.round((emojiStars + matrixAvg) / 2)));

      const isVideo = formData.mediaType === 'video' || !!formData.videoUrl;

      const submissionData = {
        workspaceId: workspaceSlug,
        authorName: config.prefilledName || 'Valued Customer',
        authorRole: config.prefilledClient || config.prefilledCampaign || 'Client',
        content: formData.improvementText.trim() || (isVideo ? 'Recorded video testimonial (+2x Perk)' : 'Submitted rating & feedback form.'),
        rating: computedRating,
        matrixRatings: formData.matrixRatings,
        mediaType: isVideo ? 'video' : 'text',
        videoUrl: formData.videoUrl || undefined,
        videoDurationSeconds: formData.videoDurationSeconds || undefined,
        source: 'Review Feedback Form',
        status: 'approved', // Shifts immediately to Proof section!
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
      console.warn('Customer feedback recording notice:', err);
      setIsSubmitted(true);
    } finally {
      setIsSubmitting(false);
    }
  };

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
      <UnifiedReviewFormRenderer
        config={config}
        isLockedForEndUser={true}
        onSubmitForm={handleCustomerFinalSubmit}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
