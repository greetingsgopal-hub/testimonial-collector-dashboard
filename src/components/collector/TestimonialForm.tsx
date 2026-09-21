import React, { useState } from 'react';
import { 
  Star, 
  Send, 
  Sparkles, 
  User, 
  Mail, 
  Briefcase, 
  Building2, 
  Check,
  Wand2,
  RotateCcw,
  ShieldCheck,
  Flame,
  Zap,
  Video,
  Gift,
  MessageSquare,
  HelpCircle
} from 'lucide-react';
import { ReviewInput } from '../../types';
import { validateReviewInput, sanitizeText } from '../../lib/security';
import { 
  polishWithAI, 
  calculateImpactScore, 
  INSPIRATION_STARTERS, 
  TestimonialTone 
} from '../../lib/ai-assistant';

interface TestimonialFormProps {
  formData: ReviewInput;
  setFormData: React.Dispatch<React.SetStateAction<ReviewInput>>;
  onSubmit: (data: ReviewInput) => Promise<void>;
  isSubmitting: boolean;
}

const RATING_DESCRIPTIONS: Record<number, string> = {
  1: '😞 Disappointing (1/5)',
  2: '😐 Needs Improvement (2/5)',
  3: '🙂 Met Expectations (3/5)',
  4: '😊 Very Satisfied (4/5)',
  5: '🚀 Absolutely Phenomenal! (5/5)',
};

const SENJA_GUIDED_QUESTIONS = [
  {
    icon: '🎯',
    label: 'The Challenge',
    prompt: 'What problem were you trying to solve before using this?',
    starter: 'Before finding this, our biggest challenge was ',
  },
  {
    icon: '📈',
    label: 'The Outcome',
    prompt: 'What specific metric or result improved the most?',
    starter: 'Since adopting it, the most noticeable result has been ',
  },
  {
    icon: '💬',
    label: 'Recommendation',
    prompt: 'What would you say to someone considering trying it?',
    starter: 'To anyone considering this, I would say: ',
  },
];

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
  const [tone, setTone] = useState<TestimonialTone>('enthusiastic');
  const [originalContent, setOriginalContent] = useState<string | null>(null);
  const [isPolishing, setIsPolishing] = useState(false);
  const [aiSuccessBadge, setAiSuccessBadge] = useState<string | null>(null);

  const impact = calculateImpactScore(formData.content);

  const handlePolish = () => {
    setIsPolishing(true);
    setOriginalContent(formData.content);
    setTimeout(() => {
      const result = polishWithAI(formData.content, tone, {
        role: formData.role,
        company: formData.company,
        name: formData.name,
      });
      setFormData((prev) => ({
        ...prev,
        content: result.polishedText,
        title: prev.title || result.headline,
        tags: Array.from(new Set([...prev.tags, ...result.suggestedTags])),
      }));
      setIsPolishing(false);
      setAiSuccessBadge('✨ Polished with AI!');
      setTimeout(() => setAiSuccessBadge(null), 3000);
    }, 400);
  };

  const handleUndo = () => {
    if (originalContent !== null) {
      setFormData((prev) => ({ ...prev, content: originalContent }));
      setOriginalContent(null);
    }
  };

  const [isVideoMode, setIsVideoMode] = useState(formData.type === 'video');

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

    const validation = validateReviewInput(formData);
    if (!validation.valid) {
      setErrorMsg(validation.error || 'Please fill in all required fields correctly.');
      return;
    }

    // Sanitize payload fields
    const sanitizedData: ReviewInput = {
      ...formData,
      type: isVideoMode ? 'video' : 'text',
      videoUrl: isVideoMode && formData.videoUrl ? sanitizeText(formData.videoUrl, 500) : undefined,
      name: sanitizeText(formData.name, 100),
      email: formData.email.trim().toLowerCase().slice(0, 150),
      role: sanitizeText(formData.role, 100),
      company: formData.company ? sanitizeText(formData.company, 100) : undefined,
      title: formData.title ? sanitizeText(formData.title, 150) : undefined,
      content: sanitizeText(formData.content, 2500),
      tags: formData.tags.map((t) => sanitizeText(t, 30)).filter(Boolean).slice(0, 10),
    };

    try {
      await onSubmit(sanitizedData);
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

      {/* Mode Switcher (Senja-style: Text vs Video) */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-1.5 bg-zinc-900/90 rounded-2xl border border-zinc-800">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => {
              setIsVideoMode(false);
              setFormData((p) => ({ ...p, type: 'text' }));
            }}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              !isVideoMode
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Write Review</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setIsVideoMode(true);
              setFormData((p) => ({ ...p, type: 'video' }));
            }}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              isVideoMode
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Video className="w-3.5 h-3.5" />
            <span>Video Review</span>
          </button>
        </div>

        <span className="text-[11px] text-zinc-400 px-2 flex items-center gap-1 self-center sm:self-auto">
          <Gift className="w-3.5 h-3.5 text-pink-400" />
          <span>Reward unlocked on submission!</span>
        </span>
      </div>

      {/* Video URL Input if in Video Mode */}
      {isVideoMode && (
        <div className="p-4 rounded-xl bg-purple-950/25 border border-purple-500/30 space-y-2 animate-fade-in">
          <label className="block text-xs font-semibold uppercase tracking-wider text-purple-300">
            Video Link (Loom, YouTube, Vimeo, or MP4) <span className="text-pink-500">*</span>
          </label>
          <input
            type="url"
            placeholder="https://www.loom.com/share/... or https://youtube.com/watch?v=..."
            value={formData.videoUrl || ''}
            onChange={(e) => setFormData((p) => ({ ...p, videoUrl: e.target.value }))}
            className="glass-input w-full px-4 py-2.5 rounded-xl text-xs sm:text-sm"
            required={isVideoMode}
          />
          <p className="text-[11px] text-zinc-400">
            Paste your Loom, YouTube, or Vimeo recording link. It will automatically render on the live social wall!
          </p>
        </div>
      )}

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

      {/* Testimonial Textarea with AI Assistant */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Your Testimonial <span className="text-pink-500">*</span>
            </label>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-[10px] font-semibold text-purple-300">
              <Sparkles className="w-2.5 h-2.5" />
              AI Assistant
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Impact score pill */}
            <span className={`text-[11px] font-medium flex items-center gap-1 ${impact.color}`}>
              <Flame className="w-3 h-3" />
              {impact.label}
            </span>
            <span className="text-xs text-zinc-500">
              {formData.content.length} chars
            </span>
          </div>
        </div>

        {/* AI Assistant Quick Actions Bar */}
        <div className="p-2.5 rounded-xl bg-zinc-900/90 border border-purple-500/20 flex flex-wrap items-center justify-between gap-2 shadow-inner">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handlePolish}
              disabled={isPolishing}
              className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm hover:shadow-purple-500/20 transition-all cursor-pointer disabled:opacity-50"
            >
              <Wand2 className={`w-3.5 h-3.5 ${isPolishing ? 'animate-spin' : ''}`} />
              <span>{isPolishing ? 'Enhancing...' : '✨ Polish with AI'}</span>
            </button>

            {originalContent !== null && (
              <button
                type="button"
                onClick={handleUndo}
                className="px-2 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs flex items-center gap-1 transition-colors cursor-pointer"
                title="Undo AI edit"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Undo</span>
              </button>
            )}

            {aiSuccessBadge && (
              <span className="text-[11px] font-semibold text-emerald-400 flex items-center gap-1 animate-fade-in">
                <Check className="w-3 h-3" />
                {aiSuccessBadge}
              </span>
            )}
          </div>

          {/* Tone Selector */}
          <div className="flex items-center gap-1 bg-zinc-950 p-1 rounded-lg border border-zinc-800">
            <span className="text-[10px] text-zinc-500 uppercase px-1">Tone:</span>
            {(['enthusiastic', 'professional', 'concise'] as TestimonialTone[]).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTone(t)}
                className={`px-2 py-0.5 rounded text-[10px] font-medium capitalize transition-colors ${
                  tone === t
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <textarea
          rows={4}
          placeholder="Tell us what you loved, the results you achieved, or how it helped your team... (or type rough notes and click ✨ Polish with AI!)"
          value={formData.content}
          onChange={(e) => setFormData((prev) => ({ ...prev, content: e.target.value }))}
          className="glass-input w-full px-4 py-3 rounded-xl text-sm leading-relaxed"
          required
        />
        
        {/* Inspiration Starters */}
        <div className="space-y-1.5 pt-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] text-zinc-500 flex items-center gap-1">
              <Zap className="w-3 h-3 text-amber-400" />
              1-Click Starters:
            </span>
            {INSPIRATION_STARTERS.map((starter) => (
              <button
                key={starter.label}
                type="button"
                onClick={() => {
                  setFormData((prev) => ({
                    ...prev,
                    content: prev.content ? `${prev.content} ${starter.text}` : starter.text,
                    title: prev.title || starter.headline,
                  }));
                }}
                className="text-[11px] text-zinc-300 hover:text-purple-300 bg-zinc-900/90 hover:bg-purple-950/40 px-2.5 py-1 rounded-md border border-zinc-800 hover:border-purple-500/30 transition-all cursor-pointer"
              >
                {starter.label}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] text-zinc-500">Quick ideas:</span>
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

          {/* Guided 3-Question Prompt Cards (Senja style) */}
          <div className="pt-2 border-t border-zinc-800/60">
            <span className="text-[11px] font-semibold text-zinc-400 mb-1.5 flex items-center gap-1">
              <HelpCircle className="w-3 h-3 text-purple-400" />
              Not sure what to write? Click a question to start your draft:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-1.5">
              {SENJA_GUIDED_QUESTIONS.map((item) => (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => {
                    setFormData((prev) => ({
                      ...prev,
                      content: prev.content ? `${prev.content} ${item.starter}` : item.starter,
                    }));
                  }}
                  className="p-2.5 rounded-xl bg-zinc-900/70 hover:bg-zinc-800/80 border border-zinc-800 hover:border-purple-500/30 text-left transition-all group cursor-pointer"
                >
                  <div className="text-xs font-semibold text-purple-300 flex items-center gap-1 mb-1">
                    <span>{item.icon}</span>
                    <span>{item.label}</span>
                  </div>
                  <p className="text-[11px] text-zinc-400 group-hover:text-zinc-300 leading-tight">
                    {item.prompt}
                  </p>
                </button>
              ))}
            </div>
          </div>
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
            <span className="text-[10px] text-zinc-400 lowercase ml-1.5 inline-flex items-center gap-0.5">
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
              (kept private)
            </span>
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
