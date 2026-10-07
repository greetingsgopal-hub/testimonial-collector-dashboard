import React, { useState } from 'react';
import { Star, ArrowRight, Sparkles, User, Briefcase, CheckCircle2 } from 'lucide-react';
import { ReviewInput } from '../../types';
import { validateReviewInput, sanitizeText } from '../../lib/security';
import { CollectorLang, COLLECTOR_TRANSLATIONS } from '../../lib/collectorI18n';

interface TestimonialFormProps {
  formData: ReviewInput;
  setFormData: React.Dispatch<React.SetStateAction<ReviewInput>>;
  onSubmit: (data: ReviewInput) => Promise<void>;
  isSubmitting: boolean;
  lang?: CollectorLang;
}

export const TestimonialForm: React.FC<TestimonialFormProps> = ({
  formData,
  setFormData,
  onSubmit,
  isSubmitting,
  lang = 'en',
}) => {
  const t = COLLECTOR_TRANSLATIONS[lang]?.positiveForm;
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const activeRating = hoverRating !== null ? hoverRating : formData.rating;

  const handleRatingChange = (val: number) => {
    setFormData((prev) => ({ ...prev, rating: val }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const validation = validateReviewInput(formData);
    if (!validation.valid) {
      setErrorMsg(validation.error || 'Please fill in all required fields.');
      return;
    }

    const sanitizedData: ReviewInput = {
      ...formData,
      type: 'text',
      videoUrl: undefined,
      name: sanitizeText(formData.name, 100),
      email: formData.email ? formData.email.trim().toLowerCase().slice(0, 150) : '',
      role: sanitizeText(formData.role, 100),
      company: formData.company ? sanitizeText(formData.company, 100) : '',
      title: formData.title ? sanitizeText(formData.title, 150) : '',
      content: sanitizeText(formData.content, 2500),
      tags: (formData.tags || []).map((t) => sanitizeText(t, 30)).filter(Boolean).slice(0, 10),
      consent: true,
    };

    try {
      await onSubmit(sanitizedData);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to submit review. Please try again.');
    }
  };

  const ratingDescriptions: Record<number, string> = {
    1: '1 of 5 · Disappointing',
    2: '2 of 5 · Needs Improvement',
    3: '3 of 5 · Met Expectations',
    4: '4 of 5 · Very Good',
    5: '5 of 5 · Outstanding',
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white/95 backdrop-blur-xl rounded-3xl p-6 sm:p-9 border border-slate-200/80 shadow-[0_12px_40px_rgb(0,0,0,0.06)] space-y-6 text-slate-900 transition-all font-sans"
    >
      {/* Header */}
      <div className="space-y-1.5">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-50 text-violet-700 text-xs font-semibold tracking-tight border border-violet-200/60">
          <Sparkles className="w-3.5 h-3.5" />
          <span>{t?.badge || 'Customer Voice'}</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-950 tracking-tight font-display">
          {t?.title || 'Share Your Experience'}
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 font-normal leading-relaxed">
          {t?.subtitle || 'Takes less than a minute and helps others make informed decisions.'}
        </p>
      </div>

      {/* 1. Rating (Stars) */}
      <div className="space-y-2 pt-1">
        <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">
          Rating <span className="text-violet-600">*</span>
        </label>
        <div className="flex flex-wrap items-center gap-3">
          <div className="inline-flex items-center gap-1.5 p-2 rounded-2xl bg-slate-50/90 border border-slate-200/80 shadow-2xs">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                type="button"
                key={star}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(null)}
                onClick={() => handleRatingChange(star)}
                className="p-1 rounded-xl hover:scale-115 active:scale-95 transition-transform duration-150 focus:outline-none cursor-pointer"
                aria-label={`${star} star`}
              >
                <Star
                  className={`w-7 h-7 sm:w-8 sm:h-8 transition-colors ${
                    star <= activeRating
                      ? 'text-amber-400 fill-amber-400 drop-shadow-[0_0_6px_rgba(251,191,36,0.5)]'
                      : 'text-slate-200 hover:text-slate-300'
                  }`}
                />
              </button>
            ))}
          </div>
          <span className="text-xs font-semibold text-slate-700 bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200/70">
            {ratingDescriptions[activeRating] || `${activeRating} of 5`}
          </span>
        </div>
      </div>

      {/* 2. Headline */}
      <div className="space-y-1.5">
        <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">
          Headline
        </label>
        <input
          type="text"
          placeholder="e.g. Exactly what our team needed"
          value={formData.title || ''}
          onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
          className="w-full px-4 py-3 rounded-2xl text-sm bg-slate-50/80 border border-slate-200/90 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-violet-600 focus:ring-4 focus:ring-violet-500/10 transition-all shadow-2xs"
          maxLength={120}
        />
      </div>

      {/* 3. Testimonial */}
      <div className="space-y-1.5">
        <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">
          Testimonial <span className="text-violet-600">*</span>
        </label>
        <textarea
          rows={4}
          placeholder="What did you love most? Share your honest thoughts and experience..."
          value={formData.content}
          onChange={(e) => setFormData((prev) => ({ ...prev, content: e.target.value }))}
          className="w-full px-4 py-3.5 rounded-2xl text-sm leading-relaxed bg-slate-50/80 border border-slate-200/90 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-violet-600 focus:ring-4 focus:ring-violet-500/10 transition-all shadow-2xs resize-none"
          required
        />
      </div>

      {/* 4 & 5. Name and Role/Position Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
        {/* Name */}
        <div className="space-y-1.5">
          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Name <span className="text-violet-600">*</span>
          </label>
          <div className="relative">
            <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              placeholder="e.g. Alex Rivera"
              value={formData.name}
              onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
              className="w-full pl-10 pr-4 py-3 rounded-2xl text-sm bg-slate-50/80 border border-slate-200/90 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-violet-600 focus:ring-4 focus:ring-violet-500/10 transition-all shadow-2xs"
              required
            />
          </div>
        </div>

        {/* Role / Position */}
        <div className="space-y-1.5">
          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Role / Position <span className="text-violet-600">*</span>
          </label>
          <div className="relative">
            <Briefcase className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              placeholder="e.g. Product Lead or Buyer"
              value={formData.role}
              onChange={(e) => setFormData((prev) => ({ ...prev, role: e.target.value }))}
              className="w-full pl-10 pr-4 py-3 rounded-2xl text-sm bg-slate-50/80 border border-slate-200/90 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-violet-600 focus:ring-4 focus:ring-violet-500/10 transition-all shadow-2xs"
              required
            />
          </div>
        </div>
      </div>

      {/* Error Message */}
      {errorMsg && (
        <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium animate-fade-in">
          {errorMsg}
        </div>
      )}

      {/* Submit Button */}
      <div className="pt-2 space-y-2.5">
        <button
          id="submit-testimonial-btn"
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3.5 px-6 rounded-2xl bg-slate-950 hover:bg-slate-900 text-white font-semibold text-sm shadow-sm hover:shadow active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Submitting...</span>
            </>
          ) : (
            <>
              <span>{t?.submitBtn || 'Submit Review'}</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>

        <p className="text-center text-[11px] text-slate-400 font-normal">
          Protected by Panda Praise · No account or password required
        </p>
      </div>
    </form>
  );
};
