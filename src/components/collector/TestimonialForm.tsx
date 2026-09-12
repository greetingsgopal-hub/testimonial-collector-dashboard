import React, { useState } from 'react';
import { 
  Star, 
  Send, 
  Video, 
  FileText, 
  Sparkles, 
  User, 
  Mail, 
  Briefcase, 
  Building2, 
  Check, 
  Link as LinkIcon 
} from 'lucide-react';
import { ReviewInput } from '../../types';

interface TestimonialFormProps {
  formData: ReviewInput;
  setFormData: React.Dispatch<React.SetStateAction<ReviewInput>>;
  onSubmit: (data: ReviewInput) => Promise<void>;
  isSubmitting: boolean;
}

const RATING_DESCRIPTIONS: Record<number, string> = {
  1: 'Disappointing (1/5)',
  2: 'Needs Improvement (2/5)',
  3: 'Met Expectations (3/5)',
  4: 'Very Satisfied (4/5)',
  5: 'Phenomenal! (5/5)',
};

const SUGGESTED_PROMPTS = [
  'What problem did we solve for you?',
  'What metric or result improved most?',
  'How was your onboarding experience?',
];

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
];

const COMMON_TAGS = ['SaaS', 'UI/UX', 'Performance', 'Support', 'Developer Experience', 'High ROI', 'Integration'];

export const TestimonialForm: React.FC<TestimonialFormProps> = ({
  formData,
  setFormData,
  onSubmit,
  isSubmitting,
}) => {
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [newTagInput, setNewTagInput] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const activeRating = hoverRating !== null ? hoverRating : formData.rating;

  const handleRatingChange = (val: number) => {
    setFormData((prev) => ({ ...prev, rating: val }));
  };

  const handleToggleTag = (tag: string) => {
    setFormData((prev) => {
      const exists = prev.tags.includes(tag);
      return {
        ...prev,
        tags: exists ? prev.tags.filter((t) => t !== tag) : [...prev.tags, tag],
      };
    });
  };

  const handleAddCustomTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && newTagInput.trim()) {
      e.preventDefault();
      const cleaned = newTagInput.trim().replace(/^#/, '');
      if (!formData.tags.includes(cleaned)) {
        setFormData((prev) => ({ ...prev, tags: [...prev.tags, cleaned] }));
      }
      setNewTagInput('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!formData.name.trim()) {
      setErrorMsg('Please enter your full name.');
      return;
    }
    if (!formData.email.trim() || !formData.email.includes('@')) {
      setErrorMsg('Please provide a valid email address.');
      return;
    }
    if (!formData.role.trim()) {
      setErrorMsg('Please specify your role or job title.');
      return;
    }
    if (!formData.content.trim() || formData.content.trim().length < 15) {
      setErrorMsg('Please write a testimonial of at least 15 characters.');
      return;
    }
    if (!formData.consent) {
      setErrorMsg('Please check the permission box to allow featuring your review.');
      return;
    }

    try {
      await onSubmit(formData);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to submit review. Please try again.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="glass-panel rounded-2xl p-6 sm:p-8 border border-white/10 space-y-6">
      
      {/* Form Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-500/10 text-brand-400 text-xs font-semibold uppercase tracking-wider mb-2 border border-brand-500/20">
          <Sparkles className="w-3.5 h-3.5" />
          Customer Voice
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold font-display text-white tracking-tight">
          Share Your Feedback
        </h2>
        <p className="text-sm text-zinc-400 mt-1">
          Your honest experience helps us improve and helps others make informed decisions.
        </p>
      </div>

      {/* Mode Switch: Text vs Video */}
      <div className="grid grid-cols-2 gap-2 p-1 bg-zinc-900/90 rounded-xl border border-zinc-800">
        <button
          type="button"
          onClick={() => setFormData((prev) => ({ ...prev, type: 'text' }))}
          className={`flex items-center justify-center gap-2 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
            formData.type === 'text'
              ? 'bg-zinc-800 text-white shadow-sm border border-zinc-700'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <FileText className="w-4 h-4 text-brand-400" />
          <span>Written Review</span>
        </button>

        <button
          type="button"
          onClick={() => setFormData((prev) => ({ ...prev, type: 'video' }))}
          className={`flex items-center justify-center gap-2 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
            formData.type === 'video'
              ? 'bg-zinc-800 text-white shadow-sm border border-zinc-700'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Video className="w-4 h-4 text-pink-400" />
          <span>Video Testimonial</span>
        </button>
      </div>

      {/* Rating Picker */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">
          Your Overall Rating <span className="text-pink-500">*</span>
        </label>
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-1.5 p-2 rounded-xl bg-zinc-900/80 border border-zinc-800/80">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                type="button"
                key={star}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(null)}
                onClick={() => handleRatingChange(star)}
                className="p-1 rounded-lg hover:scale-125 transition-transform duration-150 focus:outline-none"
              >
                <Star
                  className={`w-7 h-7 sm:w-8 sm:h-8 ${
                    star <= activeRating
                      ? 'text-amber-400 fill-amber-400 drop-shadow-[0_0_10px_rgba(251,191,36,0.6)]'
                      : 'text-zinc-700 hover:text-zinc-500'
                  } transition-colors`}
                />
              </button>
            ))}
          </div>
          <span className="text-xs sm:text-sm font-medium text-amber-300">
            {RATING_DESCRIPTIONS[activeRating]}
          </span>
        </div>
      </div>

      {/* Video URL Input (if video type) */}
      {formData.type === 'video' && (
        <div className="animate-fade-in space-y-1">
          <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400">
            Video Link (Loom, YouTube, Vimeo, or MP4)
          </label>
          <div className="relative">
            <LinkIcon className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3.5" />
            <input
              type="url"
              placeholder="https://www.loom.com/share/..."
              value={formData.videoUrl || ''}
              onChange={(e) => setFormData((prev) => ({ ...prev, videoUrl: e.target.value }))}
              className="glass-input w-full pl-10 pr-4 py-2.5 rounded-xl text-sm"
            />
          </div>
        </div>
      )}

      {/* Review Headline / Title */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
          Headline (Optional)
        </label>
        <input
          type="text"
          placeholder="e.g. Best developer tool we adopted this year"
          value={formData.title || ''}
          onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
          className="glass-input w-full px-4 py-2.5 rounded-xl text-sm"
          maxLength={100}
        />
      </div>

      {/* Testimonial Textarea */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
            Your Testimonial <span className="text-pink-500">*</span>
          </label>
          <span className="text-xs text-zinc-500">
            {formData.content.length} characters
          </span>
        </div>
        <textarea
          rows={4}
          placeholder="Tell us what you loved, the results you achieved, or how it helped your team..."
          value={formData.content}
          onChange={(e) => setFormData((prev) => ({ ...prev, content: e.target.value }))}
          className="glass-input w-full px-4 py-3 rounded-xl text-sm leading-relaxed"
          required
        />
        
        {/* Helpful suggestion pills */}
        <div className="flex flex-wrap items-center gap-1.5 mt-2">
          <span className="text-[11px] text-zinc-500">Inspiration:</span>
          {SUGGESTED_PROMPTS.map((prompt) => (
            <button
              key={prompt}
              type="button"
              onClick={() => {
                setFormData((prev) => ({
                  ...prev,
                  content: prev.content ? `${prev.content} ${prompt} ` : `${prompt} `,
                }));
              }}
              className="text-[11px] text-zinc-400 hover:text-brand-300 bg-zinc-900 hover:bg-zinc-800 px-2 py-0.5 rounded-md border border-zinc-800 transition-colors"
            >
              + {prompt}
            </button>
          ))}
        </div>
      </div>

      {/* Submitter Info Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Name */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
            Full Name <span className="text-pink-500">*</span>
          </label>
          <div className="relative">
            <User className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3.5" />
            <input
              type="text"
              placeholder="Alex Rivera"
              value={formData.name}
              onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
              className="glass-input w-full pl-10 pr-4 py-2.5 rounded-xl text-sm"
              required
            />
          </div>
        </div>

        {/* Email */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
            Email Address <span className="text-pink-500">*</span>
            <span className="text-[10px] text-zinc-500 lowercase ml-1">(kept private)</span>
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3.5" />
            <input
              type="email"
              placeholder="alex@company.com"
              value={formData.email}
              onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
              className="glass-input w-full pl-10 pr-4 py-2.5 rounded-xl text-sm"
              required
            />
          </div>
        </div>

        {/* Role */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
            Role / Job Title <span className="text-pink-500">*</span>
          </label>
          <div className="relative">
            <Briefcase className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3.5" />
            <input
              type="text"
              placeholder="Senior Engineer"
              value={formData.role}
              onChange={(e) => setFormData((prev) => ({ ...prev, role: e.target.value }))}
              className="glass-input w-full pl-10 pr-4 py-2.5 rounded-xl text-sm"
              required
            />
          </div>
        </div>

        {/* Company */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
            Company / Organization
          </label>
          <div className="relative">
            <Building2 className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3.5" />
            <input
              type="text"
              placeholder="Acme Corp"
              value={formData.company || ''}
              onChange={(e) => setFormData((prev) => ({ ...prev, company: e.target.value }))}
              className="glass-input w-full pl-10 pr-4 py-2.5 rounded-xl text-sm"
            />
          </div>
        </div>
      </div>

      {/* Avatar Selection */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
          Avatar Photo (Image URL or Pick Preset)
        </label>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <input
            type="url"
            placeholder="https://example.com/avatar.jpg"
            value={formData.avatarUrl || ''}
            onChange={(e) => setFormData((prev) => ({ ...prev, avatarUrl: e.target.value }))}
            className="glass-input flex-1 w-full px-4 py-2 rounded-xl text-xs sm:text-sm"
          />

          {/* Quick preset choices */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-500">Presets:</span>
            {PRESET_AVATARS.map((url, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setFormData((prev) => ({ ...prev, avatarUrl: url }))}
                className={`w-7 h-7 rounded-full overflow-hidden border-2 transition-transform hover:scale-110 ${
                  formData.avatarUrl === url ? 'border-brand-500 ring-2 ring-brand-500/50' : 'border-zinc-700'
                }`}
              >
                <img src={url} alt={`Preset ${idx + 1}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Category / Topic Tags */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
          Tags / Highlights
        </label>
        <div className="flex flex-wrap gap-1.5 mb-2">
          {COMMON_TAGS.map((tag) => {
            const isSelected = formData.tags.includes(tag);
            return (
              <button
                key={tag}
                type="button"
                onClick={() => handleToggleTag(tag)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                  isSelected
                    ? 'bg-brand-500/20 text-brand-300 border border-brand-500/40 shadow-sm'
                    : 'bg-zinc-900 text-zinc-400 border border-zinc-800 hover:text-zinc-200 hover:bg-zinc-800/60'
                }`}
              >
                {isSelected && <Check className="w-3 h-3 inline mr-1" />}
                #{tag}
              </button>
            );
          })}
        </div>
        <input
          type="text"
          placeholder="Type custom tag and press Enter..."
          value={newTagInput}
          onChange={(e) => setNewTagInput(e.target.value)}
          onKeyDown={handleAddCustomTag}
          className="glass-input w-full px-3 py-1.5 rounded-lg text-xs text-zinc-300"
        />
      </div>

      {/* Consent Checkbox */}
      <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800/80">
        <label className="flex items-start gap-3 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={formData.consent}
            onChange={(e) => setFormData((prev) => ({ ...prev, consent: e.target.checked }))}
            className="mt-0.5 h-4 w-4 rounded border-zinc-700 bg-zinc-900 text-brand-600 focus:ring-brand-500 focus:ring-offset-zinc-900 cursor-pointer"
            required
          />
          <span className="text-xs text-zinc-300 leading-normal">
            I give permission to feature this testimonial on your public website, marketing materials, and social proof widgets.
          </span>
        </label>
      </div>

      {/* Error Message */}
      {errorMsg && (
        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-medium animate-fade-in">
          {errorMsg}
        </div>
      )}

      {/* Submit Button */}
      <button
        id="submit-testimonial-btn"
        type="submit"
        disabled={isSubmitting}
        className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-brand-600 via-indigo-600 to-pink-600 hover:from-brand-500 hover:via-indigo-500 hover:to-pink-500 text-white font-semibold text-sm shadow-glow flex items-center justify-center gap-2 transition-all transform active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
      >
        {isSubmitting ? (
          <>
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            <span>Submitting Review...</span>
          </>
        ) : (
          <>
            <Send className="w-4 h-4" />
            <span>Submit Testimonial</span>
          </>
        )}
      </button>
    </form>
  );
};
