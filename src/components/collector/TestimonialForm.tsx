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
  Gift,
  HelpCircle,
  Upload,
  Camera,
  Trash2
} from 'lucide-react';
import { ReviewInput } from '../../types';
import { validateReviewInput, sanitizeText } from '../../lib/security';
import { 
  polishWithAI, 
  calculateImpactScore, 
  INSPIRATION_STARTERS, 
  TestimonialTone 
} from '../../lib/ai-assistant';
import { CollectorLang, COLLECTOR_TRANSLATIONS } from '../../lib/collectorI18n';

interface TestimonialFormProps {
  formData: ReviewInput;
  setFormData: React.Dispatch<React.SetStateAction<ReviewInput>>;
  onSubmit: (data: ReviewInput) => Promise<void>;
  isSubmitting: boolean;
  lang?: CollectorLang;
}

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
  lang = 'en',
}) => {
  const t = COLLECTOR_TRANSLATIONS[lang].positiveForm;
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [newTagInput, setNewTagInput] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [tone, setTone] = useState<TestimonialTone>('enthusiastic');
  const [originalContent, setOriginalContent] = useState<string | null>(null);
  const [isPolishing, setIsPolishing] = useState(false);
  const [aiSuccessBadge, setAiSuccessBadge] = useState<string | null>(null);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMsg('Please select an image file (JPEG, PNG, or WebP).');
      return;
    }

    setIsUploadingPhoto(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxDim = 256;
        let width = img.width;
        let height = img.height;
        if (width > height) {
          if (width > maxDim) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          }
        } else {
          if (height > maxDim) {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL('image/webp', 0.85);
          setFormData((prev) => ({ ...prev, avatarUrl: dataUrl }));
        }
        setIsUploadingPhoto(false);
      };
      img.onerror = () => {
        setIsUploadingPhoto(false);
        setErrorMsg('Failed to process image file.');
      };
      img.src = event.target?.result as string;
    };
    reader.onerror = () => {
      setIsUploadingPhoto(false);
      setErrorMsg('Failed to read image.');
    };
    reader.readAsDataURL(file);
  };

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
      type: 'text',
      videoUrl: undefined,
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
          {t.badge}
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold font-display text-gray-950 tracking-tight">
          {t.title}
        </h2>
        <p className="text-sm text-gray-600 mt-1 font-sans">
          {t.subtitle}
        </p>
      </div>

      {/* Reward Notice Badge */}
      {t.rewardNotice && (
        <div className="flex items-center gap-2 px-3.5 py-2.5 bg-purple-50/80 rounded-2xl border border-purple-200/70 text-xs text-purple-800 font-medium">
          <Gift className="w-4 h-4 text-purple-600 shrink-0" />
          <span>{t.rewardNotice}</span>
        </div>
      )}

      {/* Rating Picker */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
          {t.ratingLabel} <span className="text-pink-500">*</span>
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
            {t.ratingDescriptions[activeRating] || `${activeRating}/5`}
          </span>
        </div>
      </div>

      {/* Review Headline / Title */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
          {t.headlineLabel}
        </label>
        <input
          type="text"
          placeholder={t.headlinePlaceholder}
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
              {t.contentLabel} <span className="text-pink-500">*</span>
            </label>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-purple-50 border border-purple-200 text-[10px] font-semibold text-[#6701e6]">
              <Sparkles className="w-2.5 h-2.5" />
              {t.aiAssistant}
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Impact score pill */}
            <span className={`text-[11px] font-semibold flex items-center gap-1 ${impact.color}`}>
              <Flame className="w-3 h-3" />
              {impact.label}
            </span>
            <span className="text-xs text-gray-500">
              {formData.content.length} {t.charsCount}
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
              <span>{isPolishing ? t.polishingBtn : t.polishBtn}</span>
            </button>

            {originalContent !== null && (
              <button
                type="button"
                onClick={handleUndo}
                className="px-2.5 py-1.5 rounded-xl bg-white hover:bg-gray-100 text-gray-700 border border-gray-200 text-xs font-medium flex items-center gap-1 transition-colors cursor-pointer"
                title="Undo edit"
              >
                <RotateCcw className="w-3 h-3" />
                <span>{t.undoBtn}</span>
              </button>
            )}

            {aiSuccessBadge && (
              <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1 animate-fade-in">
                <Check className="w-3 h-3" />
                {t.polishedBadge}
              </span>
            )}
          </div>

          {/* Tone Selector */}
          <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-gray-200 shadow-xs">
            <span className="text-[10px] text-gray-500 uppercase px-1 font-semibold">{t.toneLabel}</span>
            {(['enthusiastic', 'professional', 'concise'] as TestimonialTone[]).map((toneKey) => (
              <button
                key={toneKey}
                type="button"
                onClick={() => setTone(toneKey)}
                className={`px-2.5 py-0.5 rounded-lg text-[10px] font-medium capitalize transition-colors cursor-pointer ${
                  tone === toneKey
                    ? 'bg-[#6701e6] text-white shadow-xs'
                    : 'text-gray-600 hover:text-gray-950 hover:bg-gray-100'
                }`}
              >
                {t.tones[toneKey] || toneKey}
              </button>
            ))}
          </div>
        </div>

        <textarea
          rows={4}
          placeholder={t.contentPlaceholder}
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
              {t.startersLabel}
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
            <span className="text-[11px] text-gray-500 font-medium">{t.quickIdeasLabel}</span>
            {t.suggestedPrompts.map((prompt: string) => (
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
              {t.guidedHeading}
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-1.5">
              {t.guidedQuestions.map((item) => (
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
            {t.fullNameLabel} <span className="text-pink-500">*</span>
          </label>
          <div className="relative">
            <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              placeholder={t.fullNamePlaceholder}
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
            {t.emailLabel} <span className="text-pink-500">*</span>
            <span className="text-[10px] text-emerald-700 font-semibold lowercase ml-1.5 inline-flex items-center gap-0.5 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              <ShieldCheck className="w-3 h-3 text-emerald-600" />
              {t.emailPrivateBadge}
            </span>
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
            <input
              type="email"
              placeholder={t.emailPlaceholder}
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
            {t.roleLabel} <span className="text-pink-500">*</span>
          </label>
          <div className="relative">
            <Briefcase className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              placeholder={t.rolePlaceholder}
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
            {t.companyLabel}
          </label>
          <div className="relative">
            <Building2 className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              placeholder={t.companyPlaceholder}
              value={formData.company || ''}
              onChange={(e) => setFormData((prev) => ({ ...prev, company: e.target.value }))}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm bg-white border border-gray-300 text-gray-900 focus:outline-none focus:border-[#6701e6] focus:ring-2 focus:ring-[#6701e6]/15 transition-all shadow-xs"
            />
          </div>
        </div>
      </div>

      {/* Avatar / Photo Selection */}
      <div className="p-4 rounded-2xl bg-gray-50/70 border border-gray-200 space-y-3">
        <label className="block text-xs font-bold uppercase tracking-wider text-gray-700">
          {t.photoLabel}
        </label>

        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          {/* Avatar Preview */}
          <div className="w-14 h-14 rounded-full overflow-hidden bg-purple-100 border-2 border-purple-200 shrink-0 flex items-center justify-center shadow-xs">
            {formData.avatarUrl ? (
              <img src={formData.avatarUrl} alt="Avatar Preview" className="w-full h-full object-cover" />
            ) : (
              <Camera className="w-6 h-6 text-purple-400" />
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex-1 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <label className="px-3.5 py-1.5 rounded-xl bg-[#6701e6] hover:bg-[#5400bd] text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs cursor-pointer transition-colors">
                <Upload className="w-3.5 h-3.5" />
                <span>{isUploadingPhoto ? t.processingPhoto : t.uploadPhotoBtn}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                  disabled={isUploadingPhoto}
                />
              </label>

              {formData.avatarUrl && (
                <button
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, avatarUrl: '' }))}
                  className="px-2.5 py-1.5 rounded-xl bg-white hover:bg-gray-100 border border-gray-300 text-gray-700 text-xs font-medium flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <Trash2 className="w-3 h-3 text-red-500" />
                  <span>{t.removePhotoBtn}</span>
                </button>
              )}
            </div>

            {/* Presets & URL Fallback */}
            <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] text-gray-500">
              <span className="font-medium">{t.pickPreset}</span>
              <div className="flex items-center gap-1.5">
                {PRESET_AVATARS.map((url, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, avatarUrl: url }))}
                    className={`w-6 h-6 rounded-full overflow-hidden border transition-transform hover:scale-110 cursor-pointer ${
                      formData.avatarUrl === url ? 'border-[#6701e6] ring-2 ring-[#6701e6]/40' : 'border-gray-300'
                    }`}
                  >
                    <img src={url} alt={`Preset ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Category / Topic Tags */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
          {t.tagsLabel}
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
          placeholder={t.tagsPlaceholder}
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
            {t.consentText}
            {' '}
            <a href="/privacy-policy" target="_blank" rel="noopener noreferrer" className="underline text-gray-500 hover:text-gray-700">
              {t.privacyLink}
            </a>
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
            <span>{t.submittingBtn}</span>
          </>
        ) : (
          <>
            <Send className="w-4 h-4" />
            <span>{t.submitBtn}</span>
          </>
        )}
      </button>
    </form>
  );
};
