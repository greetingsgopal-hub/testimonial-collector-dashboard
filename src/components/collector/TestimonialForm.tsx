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
    <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-xl space-y-6 text-gray-900 relative">
      
      {/* Form Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 text-[#6701e6] text-xs font-semibold uppercase tracking-wider mb-2 border border-purple-200/80">
          <Sparkles className="w-3.5 h-3.5" />
          Customer Voice
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold font-display text-gray-950 tracking-tight">
          Share Your Feedback
        </h2>
        <p className="text-sm text-gray-600 mt-1 font-sans">
          Your honest experience helps us improve and helps others make informed decisions.
        </p>
      </div>

      {/* Mode Switcher (Senja-style: Text vs Video) */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-1.5 bg-gray-100/90 rounded-2xl border border-gray-200">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => {
              setIsVideoMode(false);
              setFormData((p) => ({ ...p, type: 'text' }));
            }}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              !isVideoMode
                ? 'bg-[#6701e6] text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-950'
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
                ? 'bg-[#6701e6] text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-950'
            }`}
          >
            <Video className="w-3.5 h-3.5" />
            <span>Video Review</span>
          </button>
        </div>

        <span className="text-[11px] text-purple-700 font-medium px-2 flex items-center gap-1.5 self-center sm:self-auto">
          <Gift className="w-3.5 h-3.5 text-purple-600" />
          <span>Reward unlocked on submission!</span>
        </span>
      </div>

      {/* Video URL Input if in Video Mode */}
      {isVideoMode && (
        <div className="p-4 rounded-2xl bg-purple-50/70 border border-purple-200 space-y-2 animate-fade-in">
          <label className="block text-xs font-bold uppercase tracking-wider text-[#6701e6]">
            Video Link (Loom, YouTube, Vimeo, or MP4) <span className="text-pink-500">*</span>
          </label>
          <input
            type="url"
            placeholder="https://www.loom.com/share/... or https://youtube.com/watch?v=..."
            value={formData.videoUrl || ''}
            onChange={(e) => setFormData((p) => ({ ...p, videoUrl: e.target.value }))}
            className="w-full px-4 py-2.5 rounded-xl text-xs sm:text-sm bg-white border border-gray-300 text-gray-900 focus:outline-none focus:border-[#6701e6] focus:ring-2 focus:ring-[#6701e6]/15 transition-all shadow-xs"
            required={isVideoMode}
          />
          <p className="text-[11px] text-gray-500">
            Paste your Loom, YouTube, or Vimeo recording link. It will automatically render on the live social wall!
          </p>
        </div>
      )}

      {/* Rating Picker */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
          Your Overall Rating <span className="text-pink-500">*</span>
        </label>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 p-2 rounded-2xl bg-gray-50 border border-gray-200 shadow-xs">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                type="button"
                key={star}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(null)}
                onClick={() => handleRatingChange(star)}
                className="p-1 rounded-lg hover:scale-125 transition-transform duration-150 focus:outline-none cursor-pointer"
              >
                <Star
                  className={`w-7 h-7 sm:w-8 sm:h-8 ${
                    star <= activeRating
                      ? 'text-amber-400 fill-amber-400 drop-shadow-[0_0_6px_rgba(251,191,36,0.6)]'
                      : 'text-gray-300 hover:text-gray-400'
                  } transition-colors`}
                />
              </button>
            ))}
          </div>
          <span className="text-xs sm:text-sm font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full">
            {RATING_DESCRIPTIONS[activeRating]}
          </span>
        </div>
      </div>

      {/* Review Headline / Title */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
          Headline (Optional)
        </label>
        <input
          type="text"
          placeholder="e.g. Best developer tool we adopted this year"
          value={formData.title || ''}
          onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
          className="w-full px-4 py-2.5 rounded-xl text-sm bg-white border border-gray-300 text-gray-900 focus:outline-none focus:border-[#6701e6] focus:ring-2 focus:ring-[#6701e6]/15 transition-all shadow-xs"
          maxLength={100}
        />
      </div>

      {/* Testimonial Textarea with AI Assistant */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <label className="text-xs font-bold uppercase tracking-wider text-gray-700">
              Your Testimonial <span className="text-pink-500">*</span>
            </label>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-purple-50 border border-purple-200 text-[10px] font-semibold text-[#6701e6]">
              <Sparkles className="w-2.5 h-2.5" />
              AI Assistant
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Impact score pill */}
            <span className={`text-[11px] font-semibold flex items-center gap-1 ${impact.color}`}>
              <Flame className="w-3 h-3" />
              {impact.label}
            </span>
            <span className="text-xs text-gray-500">
              {formData.content.length} chars
            </span>
          </div>
        </div>

        {/* AI Assistant Quick Actions Bar */}
        <div className="p-2.5 rounded-2xl bg-purple-50/70 border border-purple-200/80 flex flex-wrap items-center justify-between gap-2 shadow-xs">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handlePolish}
              disabled={isPolishing}
              className="px-3.5 py-1.5 rounded-xl bg-[#6701e6] hover:bg-[#5400bd] text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer disabled:opacity-50"
            >
              <Wand2 className={`w-3.5 h-3.5 ${isPolishing ? 'animate-spin' : ''}`} />
              <span>{isPolishing ? 'Enhancing...' : '✨ Polish with AI'}</span>
            </button>

            {originalContent !== null && (
              <button
                type="button"
                onClick={handleUndo}
                className="px-2.5 py-1.5 rounded-xl bg-white hover:bg-gray-100 text-gray-700 border border-gray-200 text-xs font-medium flex items-center gap-1 transition-colors cursor-pointer"
                title="Undo AI edit"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Undo</span>
              </button>
            )}

            {aiSuccessBadge && (
              <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1 animate-fade-in">
                <Check className="w-3 h-3" />
                {aiSuccessBadge}
              </span>
            )}
          </div>

          {/* Tone Selector */}
          <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-gray-200 shadow-xs">
            <span className="text-[10px] text-gray-500 uppercase px-1 font-semibold">Tone:</span>
            {(['enthusiastic', 'professional', 'concise'] as TestimonialTone[]).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTone(t)}
                className={`px-2.5 py-0.5 rounded-lg text-[10px] font-medium capitalize transition-colors cursor-pointer ${
                  tone === t
                    ? 'bg-[#6701e6] text-white shadow-xs'
                    : 'text-gray-600 hover:text-gray-950 hover:bg-gray-100'
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
          className="w-full px-4 py-3 rounded-2xl text-sm leading-relaxed bg-white border border-gray-300 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#6701e6] focus:ring-2 focus:ring-[#6701e6]/15 transition-all shadow-xs"
          required
        />
        
        {/* Inspiration Starters */}
        <div className="space-y-2 pt-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-semibold text-gray-500 flex items-center gap-1">
              <Zap className="w-3 h-3 text-amber-500" />
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
                className="text-[11px] text-gray-700 hover:text-[#6701e6] bg-white hover:bg-purple-50/80 px-2.5 py-1 rounded-lg border border-gray-200 hover:border-purple-300 transition-all cursor-pointer font-medium shadow-xs"
              >
                {starter.label}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] text-gray-500 font-medium">Quick ideas:</span>
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
                className="text-[11px] text-gray-600 hover:text-[#6701e6] bg-gray-50 hover:bg-purple-50/50 px-2.5 py-0.5 rounded-md border border-gray-200 hover:border-purple-200 transition-colors cursor-pointer"
              >
                + {prompt}
              </button>
            ))}
          </div>

          {/* Guided 3-Question Prompt Cards (Senja signature style) */}
          <div className="pt-3 border-t border-gray-200">
            <span className="text-[11px] font-bold text-gray-700 mb-2 flex items-center gap-1">
              <HelpCircle className="w-3.5 h-3.5 text-[#6701e6]" />
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
                  className="p-3 rounded-2xl bg-purple-50/40 hover:bg-purple-50/90 border border-purple-200/70 hover:border-[#6701e6]/40 text-left transition-all group cursor-pointer shadow-xs"
                >
                  <div className="text-xs font-bold text-[#6701e6] flex items-center gap-1.5 mb-1">
                    <span>{item.icon}</span>
                    <span>{item.label}</span>
                  </div>
                  <p className="text-[11px] text-gray-600 group-hover:text-gray-900 leading-tight">
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
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
            Full Name <span className="text-pink-500">*</span>
          </label>
          <div className="relative">
            <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              placeholder="Alex Rivera"
              value={formData.name}
              onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm bg-white border border-gray-300 text-gray-900 focus:outline-none focus:border-[#6701e6] focus:ring-2 focus:ring-[#6701e6]/15 transition-all shadow-xs"
              required
            />
          </div>
        </div>

        {/* Email */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
            Email Address <span className="text-pink-500">*</span>
            <span className="text-[10px] text-emerald-700 font-semibold lowercase ml-1.5 inline-flex items-center gap-0.5 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              <ShieldCheck className="w-3 h-3 text-emerald-600" />
              (kept private)
            </span>
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
            <input
              type="email"
              placeholder="alex@company.com"
              value={formData.email}
              onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm bg-white border border-gray-300 text-gray-900 focus:outline-none focus:border-[#6701e6] focus:ring-2 focus:ring-[#6701e6]/15 transition-all shadow-xs"
              required
            />
          </div>
        </div>

        {/* Role */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
            Role / Job Title <span className="text-pink-500">*</span>
          </label>
          <div className="relative">
            <Briefcase className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              placeholder="Senior Engineer"
              value={formData.role}
              onChange={(e) => setFormData((prev) => ({ ...prev, role: e.target.value }))}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm bg-white border border-gray-300 text-gray-900 focus:outline-none focus:border-[#6701e6] focus:ring-2 focus:ring-[#6701e6]/15 transition-all shadow-xs"
              required
            />
          </div>
        </div>

        {/* Company */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
            Company / Organization
          </label>
          <div className="relative">
            <Building2 className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              placeholder="Acme Corp"
              value={formData.company || ''}
              onChange={(e) => setFormData((prev) => ({ ...prev, company: e.target.value }))}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm bg-white border border-gray-300 text-gray-900 focus:outline-none focus:border-[#6701e6] focus:ring-2 focus:ring-[#6701e6]/15 transition-all shadow-xs"
            />
          </div>
        </div>
      </div>

      {/* Avatar Selection */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
          Avatar Photo (Image URL or Pick Preset)
        </label>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <input
            type="url"
            placeholder="https://example.com/avatar.jpg"
            value={formData.avatarUrl || ''}
            onChange={(e) => setFormData((prev) => ({ ...prev, avatarUrl: e.target.value }))}
            className="flex-1 w-full px-4 py-2 rounded-xl text-xs sm:text-sm bg-white border border-gray-300 text-gray-900 focus:outline-none focus:border-[#6701e6] focus:ring-2 focus:ring-[#6701e6]/15 transition-all shadow-xs"
          />

          {/* Quick preset choices */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 font-medium">Presets:</span>
            {PRESET_AVATARS.map((url, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setFormData((prev) => ({ ...prev, avatarUrl: url }))}
                className={`w-7 h-7 rounded-full overflow-hidden border-2 transition-transform hover:scale-110 cursor-pointer ${
                  formData.avatarUrl === url ? 'border-[#6701e6] ring-2 ring-[#6701e6]/30' : 'border-gray-300'
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
        <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
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
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#6701e6]/10 text-[#6701e6] border border-[#6701e6]/30 shadow-xs font-semibold'
                    : 'bg-gray-100 text-gray-600 border border-gray-200 hover:text-gray-950 hover:bg-gray-200/70'
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
          className="w-full px-3 py-2 rounded-xl text-xs bg-white border border-gray-300 text-gray-900 focus:outline-none focus:border-[#6701e6] focus:ring-2 focus:ring-[#6701e6]/15 transition-all shadow-xs"
        />
      </div>

      {/* Consent Checkbox */}
      <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200">
        <label className="flex items-start gap-3 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={formData.consent}
            onChange={(e) => setFormData((prev) => ({ ...prev, consent: e.target.checked }))}
            className="mt-0.5 h-4 w-4 rounded border-gray-300 text-[#6701e6] focus:ring-[#6701e6] cursor-pointer"
            required
          />
          <span className="text-xs text-gray-700 leading-normal font-medium font-sans">
            I give permission to feature this testimonial on your public website, marketing materials, and social proof widgets.
          </span>
        </label>
      </div>

      {/* Error Message */}
      {errorMsg && (
        <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium animate-fade-in">
          {errorMsg}
        </div>
      )}

      {/* Submit Button */}
      <button
        id="submit-testimonial-btn"
        type="submit"
        disabled={isSubmitting}
        className="w-full py-4 px-6 rounded-xl bg-[#6701e6] hover:bg-[#5400bd] text-white font-bold text-base shadow-lg shadow-purple-600/25 border border-purple-400/20 flex items-center justify-center gap-2 transition-all transform active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer font-display"
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
