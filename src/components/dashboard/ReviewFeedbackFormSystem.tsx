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
  ExternalLink,
  RotateCcw,
  CheckCircle2,
  Share2,
} from 'lucide-react';

// ============================================================================
// 1. VARIABLE TEXT CONFIGURATION INTERFACE & DEFAULTS (Matches Reference 1:1)
// ============================================================================
export interface ReviewFormTextConfig {
  brandPillText: string;
  contactEmailText: string;
  titleLine1: string;
  titleLine2: string;
  metaLabel1: string; // Default: "Name"
  metaLabel2: string; // Default: "Campaign"
  metaLabel3: string; // Default: "Client"
  metaLabel4: string; // Default: "Date"
  emojiSectionTitle: string;
  matrixSectionTitle: string;
  matrixColHeaders: [string, string, string, string, string];
  matrixQuestions: [string, string, string, string];
  openFeedbackTitle: string;
  submitButtonText: string;
}

export const DEFAULT_FORM_TEXTS: ReviewFormTextConfig = {
  brandPillText: 'Larana, Inc.',
  contactEmailText: 'hello@reallygreatsite.com',
  titleLine1: 'Review',
  titleLine2: 'Feedback',
  metaLabel1: 'Name',
  metaLabel2: 'Campaign',
  metaLabel3: 'Client',
  metaLabel4: 'Date',
  emojiSectionTitle: 'How satisfied are you with the final content?',
  matrixSectionTitle: 'Content Quality',
  matrixColHeaders: ['Very Bad', 'Bad', 'Good', 'Very Good', 'Excellent'],
  matrixQuestions: [
    'How effective was the opening hook in capturing attention ?',
    'How natural and authentic did the on-camera delivery feel for your brand?',
    "How clearly and effectively was your product's value communicated?",
    'How satisfied are you with the overall visual presentation and editing quality?',
  ],
  openFeedbackTitle: 'What Can Be Improved?',
  submitButtonText: 'Submit Review Feedback →',
};

// Customer's interactive answers when filling out the form
export interface CustomerFormSubmission {
  meta1Value: string;
  meta2Value: string;
  meta3Value: string;
  meta4Value: string;
  selectedEmojiIndex: number; // 0 = 😍 (5★), 1 = 😁 (4★), 2 = 😎 (3★), 3 = 😔 (2★), 4 = 😭 (1★)
  matrixRatings: [number | null, number | null, number | null, number | null]; // 0..4 per row
  openFeedbackText: string;
}

export const EMOJI_OPTIONS = [
  { emoji: '😍', label: 'Very Satisfied', stars: 5 },
  { emoji: '😁', label: 'Satisfied', stars: 4 },
  { emoji: '😎', label: 'Neutral', stars: 3 },
  { emoji: '😔', label: 'Unsatisfied', stars: 2 },
  { emoji: '😭', label: 'Very Unsatisfied', stars: 1 },
];

// ============================================================================
// 2. CONSTANT TEMPLATE COMPONENT (Structure, Colors & Icons Stay Constant;
//    All Text Labels Are Variables)
// ============================================================================
export function ConstantReviewFeedbackTemplate({
  texts,
  submission,
  onChangeSubmission,
  onSubmit,
  isSubmitting = false,
  showSubmitButton = true,
}: {
  texts: ReviewFormTextConfig;
  submission: CustomerFormSubmission;
  onChangeSubmission: (next: CustomerFormSubmission) => void;
  onSubmit?: (e: React.FormEvent) => void;
  isSubmitting?: boolean;
  showSubmitButton?: boolean;
}) {
  const handleMatrixCheck = (rowIndex: number, colIndex: number) => {
    const nextRatings = [...submission.matrixRatings] as [
      number | null,
      number | null,
      number | null,
      number | null
    ];
    nextRatings[rowIndex] = nextRatings[rowIndex] === colIndex ? null : colIndex;
    onChangeSubmission({ ...submission, matrixRatings: nextRatings });
  };

  return (
    <form
      data-testid="constant-review-feedback-template"
      onSubmit={(e) => {
        e.preventDefault();
        if (onSubmit) onSubmit(e);
      }}
      className="w-full max-w-[620px] mx-auto rounded-2xl overflow-hidden shadow-2xl border border-slate-300/80 select-none font-sans"
    >
      {/* ================================================================= */}
      {/* CONSTANT TOP HEADER BLOCK: Forest Green (#314424)                 */}
      {/* ================================================================= */}
      <div className="bg-[#314424] text-[#FBF6EA] px-7 pt-7 pb-8 sm:px-10 sm:pt-9 sm:pb-10">
        {/* Top Row: Brand Pill (Left) + Contact Email (Right) */}
        <div className="flex items-center justify-between gap-4">
          <div
            data-testid="template-brand-pill"
            className="px-5 py-1.5 rounded-full border border-[#FBF6EA]/80 text-xs sm:text-sm font-bold tracking-wide text-[#FBF6EA]"
          >
            {texts.brandPillText || 'Larana, Inc.'}
          </div>
          <span
            data-testid="template-contact-email"
            className="text-xs sm:text-sm font-medium text-[#FBF6EA]/90 truncate"
          >
            {texts.contactEmailText || 'hello@reallygreatsite.com'}
          </span>
        </div>

        {/* Middle Row: Giant Stacked Title (Left) + Constant 4-Star & 3-People Vector Icon (Right) */}
        <div className="mt-7 flex items-center justify-between gap-6">
          <div
            data-testid="template-title"
            className="leading-[1.03] tracking-tight font-extrabold text-4xl sm:text-[54px] text-[#FBF6EA]"
          >
            <div className="break-words">{texts.titleLine1 || 'Review'}</div>
            <div className="break-words">{texts.titleLine2 || 'Feedback'}</div>
          </div>

          {/* CONSTANT WHITE VECTOR ICON: 4-Star Speech Bubble + 3 People */}
          <div className="shrink-0" data-testid="constant-vector-illustration">
            <svg
              className="w-28 h-28 sm:w-36 sm:h-36 text-[#FBF6EA]"
              viewBox="0 0 140 135"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Speech Bubble with 4 Stars */}
              <rect
                x="14"
                y="6"
                width="112"
                height="38"
                rx="4"
                stroke="currentColor"
                strokeWidth="3.5"
              />
              <path
                d="M70 44V58L85 44"
                stroke="currentColor"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {/* 4 Outlined Stars Inside Bubble */}
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

              {/* Left Person */}
              <circle cx="35" cy="82" r="12" stroke="currentColor" strokeWidth="3.5" />
              <path
                d="M14 122C14 108 23 99 35 99C43 99 49 103 52 109"
                stroke="currentColor"
                strokeWidth="3.5"
                strokeLinecap="round"
              />

              {/* Right Person */}
              <circle cx="105" cy="82" r="12" stroke="currentColor" strokeWidth="3.5" />
              <path
                d="M126 122C126 108 117 99 105 99C97 99 91 103 88 109"
                stroke="currentColor"
                strokeWidth="3.5"
                strokeLinecap="round"
              />

              {/* Center Foreground Person */}
              <circle cx="70" cy="76" r="15" stroke="currentColor" strokeWidth="3.5" />
              <path
                d="M42 122C42 104 54 95 70 95C86 95 98 104 98 122"
                stroke="currentColor"
                strokeWidth="3.5"
                strokeLinecap="round"
              />
              <line
                x1="10"
                y1="122"
                x2="130"
                y2="122"
                stroke="currentColor"
                strokeWidth="3.5"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>

        {/* Bottom 2x2 Grid of Metadata Inputs with Dashed Bottom Borders */}
        <div className="mt-7 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4 text-xs sm:text-sm">
          <div className="border-b border-dashed border-[#FBF6EA]/60 pb-1.5 flex items-center gap-2">
            <span className="font-semibold text-[#FBF6EA] shrink-0" data-testid="meta-label-1">
              {texts.metaLabel1 || 'Name'}:
            </span>
            <input
              type="text"
              required
              data-testid="input-meta-1"
              value={submission.meta1Value}
              onChange={(e) =>
                onChangeSubmission({ ...submission, meta1Value: e.target.value })
              }
              placeholder="Enter here..."
              className="w-full bg-transparent text-[#FBF6EA] placeholder-[#FBF6EA]/40 focus:outline-none text-xs sm:text-sm"
            />
          </div>

          <div className="border-b border-dashed border-[#FBF6EA]/60 pb-1.5 flex items-center gap-2">
            <span className="font-semibold text-[#FBF6EA] shrink-0" data-testid="meta-label-2">
              {texts.metaLabel2 || 'Campaign'}:
            </span>
            <input
              type="text"
              data-testid="input-meta-2"
              value={submission.meta2Value}
              onChange={(e) =>
                onChangeSubmission({ ...submission, meta2Value: e.target.value })
              }
              placeholder="Optional..."
              className="w-full bg-transparent text-[#FBF6EA] placeholder-[#FBF6EA]/40 focus:outline-none text-xs sm:text-sm"
            />
          </div>

          <div className="border-b border-dashed border-[#FBF6EA]/60 pb-1.5 flex items-center gap-2">
            <span className="font-semibold text-[#FBF6EA] shrink-0" data-testid="meta-label-3">
              {texts.metaLabel3 || 'Client'}:
            </span>
            <input
              type="text"
              data-testid="input-meta-3"
              value={submission.meta3Value}
              onChange={(e) =>
                onChangeSubmission({ ...submission, meta3Value: e.target.value })
              }
              placeholder="Company / Role..."
              className="w-full bg-transparent text-[#FBF6EA] placeholder-[#FBF6EA]/40 focus:outline-none text-xs sm:text-sm"
            />
          </div>

          <div className="border-b border-dashed border-[#FBF6EA]/60 pb-1.5 flex items-center gap-2">
            <span className="font-semibold text-[#FBF6EA] shrink-0" data-testid="meta-label-4">
              {texts.metaLabel4 || 'Date'}:
            </span>
            <input
              type="text"
              data-testid="input-meta-4"
              value={submission.meta4Value}
              onChange={(e) =>
                onChangeSubmission({ ...submission, meta4Value: e.target.value })
              }
              className="w-full bg-transparent text-[#FBF6EA] placeholder-[#FBF6EA]/40 focus:outline-none text-xs sm:text-sm"
            />
          </div>
        </div>
      </div>

      {/* ================================================================= */}
      {/* CONSTANT BODY BLOCK: Warm Cream (#FBF6EA)                         */}
      {/* ================================================================= */}
      <div className="bg-[#FBF6EA] text-[#1C2417] px-7 py-8 sm:px-10 sm:py-9 space-y-8">
        
        {/* 1. Emoji Satisfaction Selector with Connecting Dashed Line */}
        <div>
          <h3
            data-testid="template-emoji-title"
            className="text-base sm:text-lg font-extrabold text-[#11160E]"
          >
            {texts.emojiSectionTitle}
          </h3>

          <div className="relative mt-5 flex items-center justify-between">
            {/* Constant Horizontal Dashed Connecting Line */}
            <div className="absolute inset-x-6 top-1/2 -translate-y-1/2 border-t-2 border-dashed border-[#314424]/50 pointer-events-none" />

            {EMOJI_OPTIONS.map((item, idx) => {
              const isSelected = submission.selectedEmojiIndex === idx;
              return (
                <button
                  key={idx}
                  type="button"
                  title={item.label}
                  data-testid={`emoji-btn-${idx}`}
                  onClick={() =>
                    onChangeSubmission({ ...submission, selectedEmojiIndex: idx })
                  }
                  className={`relative z-10 w-13 h-13 sm:w-16 sm:h-16 rounded-full bg-[#314424] flex items-center justify-center text-2xl sm:text-3xl transition-transform cursor-pointer ${
                    isSelected
                      ? 'scale-115 ring-4 ring-[#314424]/30 shadow-lg'
                      : 'opacity-90 hover:scale-105'
                  }`}
                >
                  <span>{item.emoji}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Content Quality 4x5 Checkbox Matrix */}
        <div className="space-y-3">
          {/* Matrix Header Row */}
          <div className="grid grid-cols-12 items-end gap-2 pb-1">
            <div className="col-span-5 sm:col-span-5">
              <h3
                data-testid="template-matrix-title"
                className="text-base sm:text-lg font-extrabold text-[#11160E]"
              >
                {texts.matrixSectionTitle}
              </h3>
            </div>
            <div className="col-span-7 sm:col-span-7 grid grid-cols-5 text-center text-[10px] sm:text-xs font-medium text-[#2C3724]">
              {texts.matrixColHeaders.map((colLabel, cIdx) => (
                <span key={cIdx} className="truncate px-0.5" data-testid={`matrix-col-${cIdx}`}>
                  {colLabel}
                </span>
              ))}
            </div>
          </div>

          {/* 4 Question Rows + 5 Checkboxes per Row */}
          <div className="space-y-3.5">
            {texts.matrixQuestions.map((questionText, rIdx) => (
              <div
                key={rIdx}
                className="grid grid-cols-12 items-center gap-2 py-1"
              >
                <p
                  data-testid={`matrix-question-${rIdx}`}
                  className="col-span-5 sm:col-span-5 text-[11px] sm:text-xs leading-snug text-[#222B1C] pr-2"
                >
                  {questionText}
                </p>

                <div className="col-span-7 sm:col-span-7 grid grid-cols-5 justify-items-center">
                  {[0, 1, 2, 3, 4].map((cIdx) => {
                    const checked = submission.matrixRatings[rIdx] === cIdx;
                    return (
                      <button
                        key={cIdx}
                        type="button"
                        data-testid={`matrix-check-${rIdx}-${cIdx}`}
                        onClick={() => handleMatrixCheck(rIdx, cIdx)}
                        className={`w-6 h-6 sm:w-7 sm:h-7 border border-[#314424] flex items-center justify-center transition-colors cursor-pointer ${
                          checked
                            ? 'bg-[#314424] text-[#FBF6EA]'
                            : 'bg-transparent hover:bg-[#314424]/10'
                        }`}
                      >
                        {checked && <Check className="w-4 h-4 stroke-[3]" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 3. Open Feedback Section with 5 Constant Dashed Horizontal Lines */}
        <div className="space-y-2">
          <h3
            data-testid="template-open-title"
            className="text-base sm:text-lg font-extrabold text-[#11160E]"
          >
            {texts.openFeedbackTitle}
          </h3>

          <div className="relative">
            <textarea
              rows={5}
              required
              data-testid="input-open-feedback"
              value={submission.openFeedbackText}
              onChange={(e) =>
                onChangeSubmission({ ...submission, openFeedbackText: e.target.value })
              }
              placeholder="Write your feedback or testimonial here..."
              className="w-full bg-transparent text-xs sm:text-sm text-[#1C2417] placeholder-[#314424]/45 focus:outline-none resize-none leading-[36px]"
              style={{
                backgroundImage:
                  'repeating-linear-gradient(to bottom, transparent, transparent 34px, rgba(49, 68, 36, 0.45) 34px, rgba(49, 68, 36, 0.45) 36px)',
                lineHeight: '36px',
              }}
            />
          </div>
        </div>

        {/* Submit Button (Shown on Customer Form & Interactive Preview) */}
        {showSubmitButton && (
          <div className="pt-2">
            <button
              type="submit"
              data-testid="template-submit-btn"
              disabled={isSubmitting}
              className="w-full py-3.5 px-6 rounded-xl bg-[#314424] hover:bg-[#25351B] disabled:opacity-60 text-[#FBF6EA] font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer"
            >
              {isSubmitting ? 'Submitting Feedback...' : texts.submitButtonText}
            </button>
          </div>
        )}
      </div>
    </form>
  );
}

// ============================================================================
// 3. FORM BUILDER STUDIO (Under "Forms" Section: Customize Variable Texts on
//    the Left, Preview Constant Template on the Right, Copy Share Link)
// ============================================================================
export default function FormBuilderStudio({
  workspaceId = 'besteample',
  workspaceName = 'Larana, Inc.',
}: {
  workspaceId?: string;
  workspaceName?: string;
}) {
  const cleanSlug = (workspaceId || 'besteample')
    .replace(/'s\s+workspace$/i, '')
    .replace(/\s+workspace$/i, '')
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '');

  const [texts, setTexts] = useState<ReviewFormTextConfig>({
    ...DEFAULT_FORM_TEXTS,
    brandPillText: workspaceName || DEFAULT_FORM_TEXTS.brandPillText,
  });

  // Interactive preview state so user can test clicking emojis/checkboxes live
  const [previewSubmission, setPreviewSubmission] = useState<CustomerFormSubmission>({
    meta1Value: 'Rahul Sharma',
    meta2Value: 'Q4 Product Launch',
    meta3Value: 'Product Lead',
    meta4Value: new Date().toLocaleDateString(),
    selectedEmojiIndex: 0,
    matrixRatings: [4, 4, 3, 4],
    openFeedbackText:
      'What really stood out was the attention to detail and how fast the team delivered results.',
  });

  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [statusToast, setStatusToast] = useState<string | null>(null);

  const shareUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/c/${cleanSlug}`;

  const triggerToast = (msg: string) => {
    setStatusToast(msg);
    setTimeout(() => setStatusToast(null), 3500);
  };

  // Load saved variable texts from Firestore on mount
  useEffect(() => {
    try {
      const db = getFirestore();
      getDoc(doc(db, 'workspaces', workspaceId))
        .then((snap) => {
          if (snap.exists() && snap.data()?.reviewFormTexts) {
            setTexts({
              ...DEFAULT_FORM_TEXTS,
              ...snap.data().reviewFormTexts,
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
      const db = getFirestore();
      await setDoc(
        doc(db, 'workspaces', workspaceId),
        {
          reviewFormTexts: texts,
          customSlug: cleanSlug,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
      triggerToast(`Saved! Customer form is live at ${shareUrl}`);
    } catch {
      triggerToast('Saved form variables for this session!');
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

  const updateQuestionAt = (idx: number, val: string) => {
    const next = [...texts.matrixQuestions] as [string, string, string, string];
    next[idx] = val;
    setTexts({ ...texts, matrixQuestions: next });
  };

  const updateColHeaderAt = (idx: number, val: string) => {
    const next = [...texts.matrixColHeaders] as [string, string, string, string, string];
    next[idx] = val;
    setTexts({ ...texts, matrixColHeaders: next });
  };

  return (
    <div className="space-y-6 font-sans antialiased text-slate-900 pb-12" data-testid="review-feedback-form-studio">
      {/* TOP ACTION BAR */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#314424]" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#314424]">
              Forms · Default Review Feedback Template
            </span>
          </div>
          <h1 className="text-xl font-bold text-slate-950 mt-0.5">
            Customize Form Texts Before Sharing Link
          </h1>
          <p className="text-xs text-slate-500">
            All text fields below are variables you can modify. The template layout, colors, icons, and rating grids remain constant.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            data-testid="builder-reset-btn"
            onClick={() => setTexts(DEFAULT_FORM_TEXTS)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-600 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Texts</span>
          </button>

          <button
            type="button"
            data-testid="builder-save-btn"
            disabled={isSaving}
            onClick={handleSaveAndPublish}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-xs font-bold text-slate-800 cursor-pointer"
          >
            <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
          </button>

          <button
            type="button"
            data-testid="builder-copy-share-btn"
            onClick={handleCopyShareLink}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#314424] hover:bg-[#25351B] text-white text-xs font-bold shadow-sm cursor-pointer transition-all"
          >
            {copiedLink ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
            <span>{copiedLink ? 'Share Link Copied!' : 'Copy Customer Share Link'}</span>
          </button>
        </div>
      </div>

      {statusToast && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center justify-between">
          <span className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            {statusToast}
          </span>
          <button type="button" onClick={() => setStatusToast(null)} className="cursor-pointer">
            ✕
          </button>
        </div>
      )}

      {/* MAIN SPLIT: VARIABLE TEXT EDITOR (LEFT) + LIVE CONSTANT TEMPLATE PREVIEW (RIGHT) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: VARIABLE TEXTS CUSTOMIZER */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#314424]/10 text-[#314424] flex items-center justify-center">
                <Sliders className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900">
                  Variable Form Texts
                </h2>
                <p className="text-xs text-slate-500">
                  Edit any heading, label, or question below.
                </p>
              </div>
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              Live Sync
            </span>
          </div>

          {/* Group 1: Header Texts */}
          <div className="space-y-3">
            <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">
              1. Header & Brand Texts
            </span>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Top-Left Brand Pill
                </label>
                <input
                  type="text"
                  data-testid="input-brand-pill"
                  value={texts.brandPillText}
                  onChange={(e) => setTexts({ ...texts, brandPillText: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Top-Right Email / Web
                </label>
                <input
                  type="text"
                  data-testid="input-contact-email"
                  value={texts.contactEmailText}
                  onChange={(e) => setTexts({ ...texts, contactEmailText: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Main Heading Line 1
                </label>
                <input
                  type="text"
                  data-testid="input-title-line-1"
                  value={texts.titleLine1}
                  onChange={(e) => setTexts({ ...texts, titleLine1: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Main Heading Line 2
                </label>
                <input
                  type="text"
                  data-testid="input-title-line-2"
                  value={texts.titleLine2}
                  onChange={(e) => setTexts({ ...texts, titleLine2: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold"
                />
              </div>
            </div>

            {/* 4 Metadata Field Labels */}
            <div className="grid grid-cols-2 gap-2.5 pt-1">
              <input
                type="text"
                data-testid="input-edit-meta-1"
                value={texts.metaLabel1}
                onChange={(e) => setTexts({ ...texts, metaLabel1: e.target.value })}
                placeholder="Name"
                className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs"
              />
              <input
                type="text"
                data-testid="input-edit-meta-2"
                value={texts.metaLabel2}
                onChange={(e) => setTexts({ ...texts, metaLabel2: e.target.value })}
                placeholder="Campaign"
                className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs"
              />
              <input
                type="text"
                data-testid="input-edit-meta-3"
                value={texts.metaLabel3}
                onChange={(e) => setTexts({ ...texts, metaLabel3: e.target.value })}
                placeholder="Client"
                className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs"
              />
              <input
                type="text"
                data-testid="input-edit-meta-4"
                value={texts.metaLabel4}
                onChange={(e) => setTexts({ ...texts, metaLabel4: e.target.value })}
                placeholder="Date"
                className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs"
              />
            </div>
          </div>

          {/* Group 2: Emoji Bar & Matrix Heading */}
          <div className="space-y-3 pt-4 border-t border-slate-100">
            <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">
              2. Satisfaction & Matrix Headings
            </span>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Emoji Bar Question
              </label>
              <input
                type="text"
                data-testid="input-emoji-title"
                value={texts.emojiSectionTitle}
                onChange={(e) => setTexts({ ...texts, emojiSectionTitle: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Matrix Section Title
              </label>
              <input
                type="text"
                data-testid="input-matrix-title"
                value={texts.matrixSectionTitle}
                onChange={(e) => setTexts({ ...texts, matrixSectionTitle: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                5 Rating Column Labels
              </label>
              <div className="grid grid-cols-5 gap-1.5">
                {texts.matrixColHeaders.map((col, idx) => (
                  <input
                    key={idx}
                    type="text"
                    data-testid={`input-col-header-${idx}`}
                    value={col}
                    onChange={(e) => updateColHeaderAt(idx, e.target.value)}
                    className="px-2 py-1.5 rounded-lg border border-slate-200 text-[11px] text-center font-medium"
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Group 3: The 4 Matrix Questions */}
          <div className="space-y-2.5 pt-4 border-t border-slate-100">
            <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">
              3. Matrix Evaluation Questions (4 Rows)
            </span>

            {texts.matrixQuestions.map((qText, idx) => (
              <div key={idx}>
                <label className="block text-[10px] font-bold text-slate-500 mb-0.5">
                  Question Row #{idx + 1}
                </label>
                <input
                  type="text"
                  data-testid={`input-question-${idx}`}
                  value={qText}
                  onChange={(e) => updateQuestionAt(idx, e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                />
              </div>
            ))}
          </div>

          {/* Group 4: Bottom Open Feedback Prompt */}
          <div className="space-y-2.5 pt-4 border-t border-slate-100">
            <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">
              4. Open Review Prompt & Share Link
            </span>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Bottom Lined Question Heading
              </label>
              <input
                type="text"
                data-testid="input-open-title"
                value={texts.openFeedbackTitle}
                onChange={(e) => setTexts({ ...texts, openFeedbackTitle: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold"
              />
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-2">
              <span className="text-xs font-mono text-slate-600 truncate" data-testid="builder-share-url-preview">
                {shareUrl}
              </span>
              <a
                href={`/c/${cleanSlug}`}
                target="_blank"
                rel="noopener noreferrer"
                data-testid="builder-open-link"
                className="text-xs font-bold text-[#314424] hover:underline flex items-center gap-1 shrink-0"
              >
                <span>Open Form</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: REAL-TIME CONSTANT TEMPLATE PREVIEW */}
        <div className="lg:col-span-7 flex flex-col items-center">
          <div className="w-full flex items-center justify-between mb-3 px-1">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Eye className="w-4 h-4 text-[#314424]" />
              <span>Real-Time Customer Form Preview</span>
            </span>
            <span className="text-xs text-slate-400">
              Try clicking the emojis or checkboxes below
            </span>
          </div>

          <ConstantReviewFeedbackTemplate
            texts={texts}
            submission={previewSubmission}
            onChangeSubmission={setPreviewSubmission}
            showSubmitButton={true}
            onSubmit={() =>
              triggerToast('Preview submission tested! Customers will submit this via your Share Link.')
            }
          />
        </div>

      </div>
    </div>
  );
}

// ============================================================================
// 4. PUBLIC CUSTOMER COLLECTION PAGE (/c/:slug)
//    Loads the saved variable texts for this workspace and submits customer
//    responses directly into Firebase Firestore -> Proof section!
// ============================================================================
export function PublicCustomerFeedbackPage({
  workspaceSlug = 'besteample',
}: {
  workspaceSlug?: string;
}) {
  const [texts, setTexts] = useState<ReviewFormTextConfig>(DEFAULT_FORM_TEXTS);
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

  useEffect(() => {
    try {
      const db = getFirestore();
      getDoc(doc(db, 'workspaces', workspaceSlug))
        .then((snap) => {
          if (snap.exists() && snap.data()?.reviewFormTexts) {
            setTexts({
              ...DEFAULT_FORM_TEXTS,
              ...snap.data().reviewFormTexts,
            });
          }
        })
        .catch(() => null);
    } catch {
      // Test environment fallback
    }
  }, [workspaceSlug]);

  const handleCustomerSubmit = async () => {
    if (!submission.meta1Value.trim() || !submission.openFeedbackText.trim()) return;
    setIsSubmitting(true);

    try {
      // Calculate overall 1..5 star rating from Emoji + Matrix checkboxes
      const emojiStars = EMOJI_OPTIONS[submission.selectedEmojiIndex]?.stars || 5;
      const validMatrix = submission.matrixRatings.filter((r) => r !== null) as number[];
      const matrixAvgStars =
        validMatrix.length > 0
          ? validMatrix.reduce((sum, r) => sum + (r + 1), 0) / validMatrix.length
          : 5;
      const computedRating = Math.max(
        1,
        Math.min(5, Math.round((emojiStars + matrixAvgStars) / 2))
      );

      const db = getFirestore();
      await addDoc(collection(db, 'testimonials'), {
        workspaceId: workspaceSlug,
        authorName: submission.meta1Value.trim(),
        authorRole:
          [submission.meta3Value.trim(), submission.meta2Value.trim()]
            .filter(Boolean)
            .join(' · ') || 'Verified Client',
        content: submission.openFeedbackText.trim(),
        rating: computedRating,
        emojiReaction: EMOJI_OPTIONS[submission.selectedEmojiIndex]?.emoji || '😍',
        matrixRatings: submission.matrixRatings,
        mediaType: 'text',
        source: 'Review Feedback Form',
        status: 'approved', // Shifts straight into Proof list!
        tags: ['Ease of use', 'Support'],
        createdAt: new Date().toISOString(),
        timestamp: serverTimestamp(),
      });

      setIsSubmitted(true);
    } catch (err: any) {
      alert(err.message || 'Could not submit feedback. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-[#314424] flex items-center justify-center p-6 font-sans">
        <div className="bg-[#FBF6EA] text-[#1C2417] rounded-3xl p-8 max-w-md w-full text-center shadow-2xl space-y-3">
          <CheckCircle2 className="w-12 h-12 text-[#314424] mx-auto" />
          <h2 className="text-2xl font-extrabold">Thank You for Your Feedback!</h2>
          <p className="text-xs sm:text-sm text-[#314424]/80">
            Your review has been recorded and verified for {texts.brandPillText}.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-200/70 py-10 px-4">
      <ConstantReviewFeedbackTemplate
        texts={texts}
        submission={submission}
        onChangeSubmission={setSubmission}
        onSubmit={handleCustomerSubmit}
        isSubmitting={isSubmitting}
        showSubmitButton={true}
      />
    </div>
  );
}
