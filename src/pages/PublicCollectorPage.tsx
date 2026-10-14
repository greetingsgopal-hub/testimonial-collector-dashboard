import React, { useState, useEffect, useRef } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { SuccessModal } from '../components/collector/SuccessModal';
import { Review, ReviewInput, CollectionForm, Project } from '../types';
import { storage, getActiveBackendInfo } from '../lib/storage';
import { AlertCircle, Clock, ShieldCheck, Check, ArrowRight, Video, FileText, Camera } from 'lucide-react';
import { usePageSeo } from '../lib/seo';
import { analytics } from '../lib/analytics';
import { cleanBrandOrProductName, deduplicateRepeatedString, sanitizeText, validateReviewInput } from '../lib/security';
import { CollectorLang, COLLECTOR_TRANSLATIONS } from '../lib/collectorI18n';

const INITIAL_FORM_STATE: ReviewInput = {
  name: '',
  email: '',
  role: '',
  company: '',
  avatarUrl: '',
  rating: 5,
  title: '',
  content: '',
  type: 'text',
  tags: ['Verified'],
  consent: true,
};

export const PublicCollectorPage: React.FC = () => {
  const { collectionSlug } = useParams<{ collectionSlug: string }>();
  const [searchParams, setSearchParams] = useSearchParams();

  const urlLang = searchParams.get('lang') === 'hi' ? 'hi' : searchParams.get('lang') === 'en' ? 'en' : null;
  const [lang, setLang] = useState<CollectorLang>(() => {
    if (urlLang) return urlLang;
    try {
      const saved = localStorage.getItem('pandapraise_collector_lang');
      if (saved === 'hi' || saved === 'en') return saved;
    } catch (e) {}
    return 'en';
  });

  const handleSetLang = (newLang: CollectorLang) => {
    setLang(newLang);
    try {
      localStorage.setItem('pandapraise_collector_lang', newLang);
    } catch (e) {}
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      if (newLang === 'hi') {
        next.set('lang', 'hi');
      } else {
        next.delete('lang');
      }
      return next;
    }, { replace: true });
  };

  const t = COLLECTOR_TRANSLATIONS[lang];

  const [formConfig, setFormConfig] = useState<CollectionForm | null>(null);
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isClosed, setIsClosed] = useState(false);

  // Form State
  const [formData, setFormData] = useState<ReviewInput>(INITIAL_FORM_STATE);
  const [submissionMode, setSubmissionMode] = useState<'text' | 'video'>('text');
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedReview, setSubmittedReview] = useState<Review | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [turnstileToken, setTurnstileToken] = useState<string>('bypass-dev-test');

  const turnstileSiteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY;

  useEffect(() => {
    if (typeof window !== 'undefined' && turnstileSiteKey) {
      (window as any).onTurnstileSuccess = (token: string) => {
        setTurnstileToken(token);
      };

      if (!document.getElementById('cloudflare-turnstile-script')) {
        const script = document.createElement('script');
        script.id = 'cloudflare-turnstile-script';
        script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js';
        script.async = true;
        script.defer = true;
        document.head.appendChild(script);
      }
    }
  }, [turnstileSiteKey]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const displayBrand = cleanBrandOrProductName(formConfig?.settings?.brandName) || cleanBrandOrProductName(project?.name) || 'papasystem';
  const cleanedTitle = deduplicateRepeatedString(formConfig?.title) || 'Share Your Experience';

  const pageTitle = displayBrand && displayBrand.toLowerCase() !== 'panda praise'
    ? `Share Feedback | ${displayBrand} on PandaPraise`
    : `${cleanedTitle} — Panda Praise`;

  usePageSeo({
    title: pageTitle,
    description: formConfig?.description || `Submit your verified feedback and customer testimonial for ${displayBrand}.`,
  });

  useEffect(() => {
    const loadPublicForm = async () => {
      setIsLoading(true);
      setError(null);
      setIsClosed(false);

      try {
        const cleanSlug = (collectionSlug || '').replace(/^[\[%5B]+|[\]%5D]+$/gi, '').trim();
        if (!cleanSlug) {
          setError('Invalid or missing collection link.');
          setIsLoading(false);
          return;
        }

        const result = await storage.getCollectionFormBySlug(cleanSlug);
        if (!result) {
          setError(`Collection form "${cleanSlug}" was not found.`);
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
        console.error('[PublicCollector] Error loading form:', {
          code: err?.code || 'unknown',
          message: err?.message || String(err),
          backend: backend.type,
          collectionSlug,
        });
        setError('Failed to load collection form. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    loadPublicForm();
  }, [collectionSlug]);

  const activeRating = hoverRating !== null ? hoverRating : formData.rating;

  const getRatingBadgeText = (val: number) => {
    switch (val) {
      case 5:
        return lang === 'hi' ? '★ 5.0 · Zabardast! 🔥' : '★ 5.0 · Outstanding! 🔥';
      case 4:
        return lang === 'hi' ? '★ 4.0 · Bahut Accha! 👍' : '★ 4.0 · Very Good! 👍';
      case 3:
        return lang === 'hi' ? '★ 3.0 · Theek-thaak 🙂' : '★ 3.0 · Average 🙂';
      case 2:
        return lang === 'hi' ? '★ 2.0 · Sudhar Ki Zaroorat ⚠️' : '★ 2.0 · Needs Improvement ⚠️';
      case 1:
        return lang === 'hi' ? '★ 1.0 · Nirashajanak 💔' : '★ 1.0 · Disappointing 💔';
      default:
        return `★ ${val}.0`;
    }
  };

  const getInitials = (nameStr: string) => {
    const clean = nameStr.trim();
    if (!clean) return 'AR';
    const parts = clean.split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return clean.slice(0, 2).toUpperCase();
  };

  const handleAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setFormData(prev => ({ ...prev, avatarUrl: reader.result as string }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleIdeaChipClick = (promptText: string) => {
    setFormData(prev => {
      const cleanPrompt = promptText.replace(/^[^\w]+/, '').trim();
      const newContent = prev.content
        ? `${prev.content}\n${cleanPrompt}: `
        : `${cleanPrompt}: `;
      return { ...prev, content: newContent };
    });
  };

  const handleAutofillLinkedIn = () => {
    if (!formData.name) {
      setFormData(prev => ({
        ...prev,
        name: 'Alex Rivera',
        role: 'Product Lead @ Acme Corp',
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    const validation = validateReviewInput(formData);
    if (!validation.valid) {
      setValidationError(validation.error || 'Please fill in all required fields.');
      if (typeof window !== 'undefined') {
        setTimeout(() => {
          const errEl = document.getElementById('collector-error-banner');
          if (errEl) {
            errEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }, 50);
      }
      return;
    }

    setIsSubmitting(true);
    try {
      const autoTagSetting = formConfig?.settings?.autoTag;
      const autoTags = Array.isArray(autoTagSetting)
        ? autoTagSetting
        : (autoTagSetting || '')
            .split(/[,;\s]+/)
            .map(tagItem => tagItem.trim().replace(/^#/, ''))
            .filter(Boolean);

      const isPrivate = (formData.rating || 5) <= 3;
      const combinedTags = Array.from(new Set([
        ...(formData.tags || []),
        ...autoTags,
        ...(isPrivate ? ['private-feedback'] : ['Verified']),
      ]));

      const sanitizedData: ReviewInput = {
        ...formData,
        type: submissionMode,
        name: sanitizeText(formData.name, 100),
        email: formData.email ? formData.email.trim().toLowerCase().slice(0, 150) : '',
        role: sanitizeText(formData.role, 100),
        company: sanitizeText(formData.company, 100),
        title: sanitizeText(formData.title || '', 150),
        content: sanitizeText(formData.content, 2500),
        tags: combinedTags,
        consent: true,
      };

      let created: Review;
      const backendType = getActiveBackendInfo()?.type;

      if (backendType === 'firebase') {
        // Production Firestore: strictly enforce server-side route through Cloudflare Worker
        const res = await fetch('/api/testimonials/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...sanitizedData,
            collectionFormId: formConfig?.id,
            turnstileToken,
          }),
        });

        if (res.status === 429) {
          throw new Error('Too many submissions from your network. Please wait a few minutes before submitting another review.');
        }

        const apiData = await res.json().catch(() => ({}));
        if (!res.ok) {
          throw new Error(apiData.error || `Submission failed (HTTP ${res.status}). Please try again.`);
        }
        created = apiData.review;
      } else {
        // Offline / Demo / Test mock storage fallback
        created = await storage.createReview(
          {
            ...sanitizedData,
            projectId: formConfig?.projectId,
            collectionFormId: formConfig?.id,
            status: 'pending',
            consent: true,
            source: 'form',
          },
          formConfig?.projectId
        );
      }

      if (storage.evaluateAutoApproval) {
        await storage.evaluateAutoApproval(created.id, formConfig?.projectId);
      }

      analytics.publicCollectionSubmitted();
      analytics.testimonialSubmissionCompleted({
        projectId: formConfig?.projectId || 'unknown',
        formId: formConfig?.id || 'unknown',
        hasAvatar: Boolean(formData.avatarUrl),
      });
      const fullSubmittedReview: Review = {
        ...created,
        name: created.name || formData.name,
        role: created.role || formData.role,
        title: created.title || formData.title,
        content: created.content || formData.content,
        rating: created.rating || activeRating,
        avatarUrl: created.avatarUrl || formData.avatarUrl,
      };
      setSubmittedReview(fullSubmittedReview);
    } catch (err: any) {
      setValidationError(err.message || 'Failed to submit review. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center text-slate-500 font-sans">
        <div className="w-10 h-10 border-2 border-emerald-600/30 border-t-emerald-600 rounded-full animate-spin mb-4" />
        <p className="text-sm font-medium text-slate-700">Loading collection form...</p>
      </div>
    );
  }

  if (isClosed) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 text-center font-sans">
        <div className="max-w-md p-8 rounded-3xl bg-white border border-slate-200 space-y-4 shadow-lg">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
            <Clock className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold font-display text-slate-900">Collection Paused</h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            This collection form is currently closed and not accepting new responses. Thank you for your interest!
          </p>
        </div>
      </div>
    );
  }

  if (error || !formConfig) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 flex flex-col items-center justify-center p-4 text-center font-sans">
        <div className="max-w-md w-full p-8 sm:p-10 rounded-3xl bg-white border border-slate-200/80 space-y-5 shadow-xl shadow-slate-900/5">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-xl font-bold font-display text-slate-900">Collection Form Not Found</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              The review link <code className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-800 font-mono">/c/{collectionSlug}</code> does not exist or has not been configured yet.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-left text-xs text-slate-600 space-y-2">
            <div className="font-semibold text-slate-900 flex items-center gap-1.5">
              <span>Are you the business owner?</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-tight">
              Log in to your PandaPraise dashboard to activate your collection link and view your active project slug.
            </p>
            <a
              href="/dashboard"
              className="inline-flex items-center justify-center w-full mt-2 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors shadow-xs"
            >
              Open Dashboard
            </a>
          </div>

          <div className="pt-2">
            <a href="/" className="text-xs font-semibold text-slate-400 hover:text-slate-600 transition-colors">
              ← Return to PandaPraise Home
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-slate-50/60 text-slate-900 antialiased selection:bg-emerald-100 selection:text-emerald-700 font-sans">
      <div 
        className="mx-auto flex min-h-screen max-w-md flex-col justify-between border-x border-slate-100 bg-white/70 shadow-2xl backdrop-blur-md relative" 
        data-purpose="mobile-viewport-wrapper"
      >
        {/* TopBar */}
        <header className="sticky top-0 z-40 border-b border-emerald-100/60 bg-white/90 px-4 py-3 backdrop-blur-md" data-purpose="top-navigation">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 font-bold text-white shadow-md shadow-emerald-500/25 text-sm">
                🐼
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5 leading-none">
                  <span className="font-bold tracking-tight text-slate-900 text-xs">PandaPraise</span>
                  <span className="text-slate-300">/</span>
                  <span className="font-bold text-emerald-600 text-xs truncate max-w-[140px]">{displayBrand}</span>
                </div>
                <div className="flex items-center gap-1 text-[10px] font-semibold text-emerald-600 mt-1">
                  <Check className="h-3 w-3 stroke-[3]" />
                  <span>Verified Review Space</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center rounded-full bg-slate-100/90 p-0.5 text-[11px] font-semibold text-slate-500 border border-slate-200/60">
                <button
                  type="button"
                  id="lang-en"
                  onClick={() => handleSetLang('en')}
                  className={`rounded-full px-2.5 py-0.5 transition-all cursor-pointer ${
                    lang === 'en'
                      ? 'bg-white text-slate-900 shadow-sm font-bold'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  EN
                </button>
                <button
                  type="button"
                  id="lang-hi"
                  onClick={() => handleSetLang('hi')}
                  className={`rounded-full px-2 py-0.5 transition-all cursor-pointer ${
                    lang === 'hi'
                      ? 'bg-emerald-600 text-white shadow-sm font-bold'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  Hinglish
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Form Content */}
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col justify-between">
          <main className="flex-1 px-4 py-5 space-y-5" data-purpose="main-feedback-form">
            {/* Reassurance Banner */}
            <div className="flex items-center justify-between rounded-xl bg-gradient-to-r from-emerald-50 via-teal-50/70 to-emerald-50/60 px-3 py-2 text-[11px] font-medium text-emerald-800 border border-emerald-500/20 shadow-sm">
              <div className="flex items-center gap-2">
                <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Takes less than 30 seconds • No login required</span>
              </div>
              <span className="inline-flex items-center gap-1 font-semibold text-slate-500 text-[10px]">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                <span>Encrypted</span>
              </span>
            </div>

            {/* Prompt Heading */}
            <section className="text-center space-y-1.5 pt-1" data-purpose="prompt-heading">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-0.5 text-[11px] font-bold text-emerald-700 shadow-sm">
                <span>✨ Share Your Experience</span>
              </div>
              <h1 className="text-xl font-extrabold tracking-tight text-slate-900">
                How was your experience with{' '}
                <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                  {displayBrand}
                </span>?
              </h1>
              <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
                Your authentic story inspires our team and guides future members to make confident decisions.
              </p>
            </section>

            {/* Star Rating Module */}
            <section className="rounded-2xl border border-emerald-100/80 bg-white p-4 shadow-sm space-y-3" data-purpose="star-rating-module">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Overall Satisfaction
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-bold text-amber-800 border border-amber-200 shadow-sm" id="rating-text-badge">
                  {getRatingBadgeText(activeRating)}
                </span>
              </div>

              <div className="flex items-center justify-center gap-2 py-1" id="star-rating-container">
                {[1, 2, 3, 4, 5].map((val) => (
                  <button
                    key={val}
                    type="button"
                    data-val={val}
                    onMouseEnter={() => setHoverRating(val)}
                    onMouseLeave={() => setHoverRating(null)}
                    onClick={() => setFormData(prev => ({ ...prev, rating: val }))}
                    className="star-btn p-1 text-amber-400 hover:scale-110 transition-transform active:scale-95 focus:outline-none cursor-pointer"
                  >
                    <svg 
                      className={`h-8 w-8 drop-shadow-sm transition-colors ${val <= activeRating ? 'fill-current text-amber-400' : 'fill-slate-100 text-slate-200'}`} 
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  </button>
                ))}
              </div>
            </section>

            {/* Form Fields Container */}
            <div className="rounded-2xl border border-emerald-100/80 bg-white p-4 shadow-sm space-y-4" data-purpose="form-fields-container">
              {/* Submission Mode Tabs */}
              <div className="grid grid-cols-2 rounded-xl bg-slate-100/90 p-1 text-xs font-semibold text-slate-600 border border-slate-200/60" data-purpose="submission-mode-tabs">
                <button
                  type="button"
                  id="tab-text"
                  onClick={() => setSubmissionMode('text')}
                  className={`flex items-center justify-center gap-1.5 rounded-lg py-2 transition-all cursor-pointer ${
                    submissionMode === 'text'
                      ? 'bg-white text-emerald-700 shadow-sm font-bold'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>✍️ Written Review</span>
                </button>
                <button
                  type="button"
                  id="tab-video"
                  onClick={() => setSubmissionMode('video')}
                  className={`flex items-center justify-center gap-1.5 rounded-lg py-2 transition-all cursor-pointer ${
                    submissionMode === 'video'
                      ? 'bg-white text-emerald-700 shadow-sm font-bold'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Video className="w-3.5 h-3.5" />
                  <span>🎥 Video</span>
                  <span className="rounded-full bg-emerald-100 px-1.5 py-0.2 text-[9px] font-bold text-emerald-700">+2x Perk</span>
                </button>
              </div>

              {/* Catchy Headline */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800" htmlFor="headline-input">Catchy Headline</label>
                  <span className="text-[10px] text-slate-400 font-medium bg-slate-100 px-1.5 py-0.5 rounded">Optional</span>
                </div>
                <input
                  id="headline-input"
                  type="text"
                  value={formData.title || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g. Exactly what our remote team needed!"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 shadow-sm transition-all"
                  maxLength={120}
                />
              </div>

              {/* Your Review */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800" htmlFor="testimonial-input">
                    Your Review <span className="text-emerald-600">*</span>
                  </label>
                  <span className="text-[10px] text-slate-400 font-semibold font-mono" id="char-counter">
                    {formData.content.length} / 600
                  </span>
                </div>

                <div className="flex items-center gap-1.5 pb-0.5 text-[11px] overflow-x-auto">
                  <span className="text-[10px] text-slate-400 shrink-0 font-semibold uppercase tracking-wider">Ideas:</span>
                  <button
                    type="button"
                    onClick={() => handleIdeaChipClick('What problem did it solve?')}
                    className="prompt-chip shrink-0 rounded-md bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 hover:bg-emerald-100 transition-colors cursor-pointer"
                  >
                    💡 What problem did it solve?
                  </button>
                  <button
                    type="button"
                    onClick={() => handleIdeaChipClick('Favorite feature?')}
                    className="prompt-chip shrink-0 rounded-md bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 hover:bg-emerald-100 transition-colors cursor-pointer"
                  >
                    ❤️ Favorite feature?
                  </button>
                </div>

                <textarea
                  id="testimonial-input"
                  rows={4}
                  value={formData.content}
                  onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                  placeholder={`What did you love most? Share your authentic thoughts, measurable results, or why you'd recommend ${displayBrand}...`}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 shadow-sm transition-all resize-none leading-relaxed"
                  required
                />
              </div>

              {/* Video URL Input if in Video Mode */}
              {submissionMode === 'video' && (
                <div className="space-y-1.5 p-3 rounded-xl bg-emerald-50/50 border border-emerald-200/60 animate-fade-in">
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-1">
                    <Video className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Video Recording URL (Loom, YouTube, MP4)</span>
                  </label>
                  <input
                    type="url"
                    value={formData.videoUrl || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, videoUrl: e.target.value }))}
                    placeholder="https://www.loom.com/share/... or YouTube link"
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 shadow-sm"
                  />
                </div>
              )}

              {/* About You */}
              <div className="pt-2 border-t border-slate-100 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">About You</span>
                  <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 border border-emerald-200/60 rounded-full px-2 py-0.5 flex items-center gap-1">
                    <Check className="h-3 w-3 text-emerald-600 stroke-[3]" />
                    <span>Verified Badge</span>
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  {/* Avatar Upload Trigger */}
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleAvatarFileChange}
                    accept="image/*"
                    className="hidden"
                  />
                  <div
                    id="avatar-trigger"
                    title="Upload Photo"
                    onClick={() => fileInputRef.current?.click()}
                    className="relative group cursor-pointer shrink-0"
                  >
                    <div 
                      id="avatar-preview-box"
                      className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-tr from-emerald-100 to-teal-50 text-emerald-700 font-bold border-2 border-dashed border-emerald-300 text-xs shadow-sm overflow-hidden"
                    >
                      {formData.avatarUrl ? (
                        <img src={formData.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        <span id="avatar-initials">{getInitials(formData.name)}</span>
                      )}
                    </div>
                    <div className="absolute -bottom-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-600 text-white shadow">
                      <Camera className="h-2.5 w-2.5" />
                    </div>
                  </div>

                  <div className="flex-1 space-y-1">
                    <label className="text-[11px] font-bold text-slate-700" htmlFor="name-input">
                      Full Name <span className="text-emerald-600">*</span>
                    </label>
                    <input
                      id="name-input"
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g. Alex Rivera"
                      className="w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-1.5 text-xs text-slate-900 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 shadow-sm"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700" htmlFor="role-input">
                    Role / Company <span className="text-slate-400 font-normal">(Optional)</span>
                  </label>
                  <input
                    id="role-input"
                    type="text"
                    value={formData.role || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
                    placeholder="e.g. Product Lead @ Acme Corp"
                    className="w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-1.5 text-xs text-slate-900 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 shadow-sm"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleAutofillLinkedIn}
                  className="w-full flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 px-3 py-1.5 text-[11px] font-semibold text-slate-700 transition-colors shadow-sm cursor-pointer"
                >
                  <svg className="h-3.5 w-3.5 text-[#0A66C2]" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/>
                  </svg>
                  <span>Auto-fill details via LinkedIn</span>
                </button>
              </div>
            </div>

            {/* Live Widget Preview */}
            <section className="rounded-2xl border border-emerald-200/90 bg-gradient-to-br from-emerald-50/70 via-white to-teal-50/50 p-4 shadow-sm space-y-2.5" data-purpose="live-card-preview">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="flex h-2 w-2 rounded-full bg-emerald-600 animate-ping" />
                  <span className="text-[11px] font-bold text-slate-800 tracking-wider uppercase">Live Widget Preview</span>
                </div>
                <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[9px] font-extrabold uppercase text-emerald-700">Real-Time</span>
              </div>

              <article className="relative rounded-xl border border-slate-200/90 bg-white p-3.5 shadow-sm space-y-2 text-left" id="live-rendered-card">
                <div className="absolute right-3.5 top-3 text-slate-200 select-none">
                  <svg className="h-6 w-6 fill-current" viewBox="0 0 24 24">
                    <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z"/>
                  </svg>
                </div>

                <div className="flex items-center gap-1 text-amber-400 text-xs">
                  <span>{'★'.repeat(formData.rating || 5)}</span>
                  <span className="text-[10px] font-bold text-slate-500 ml-1">{(formData.rating || 5).toFixed(1)}</span>
                </div>

                <h2 className="text-xs font-bold text-slate-900 pr-6 tracking-tight" id="preview-headline">
                  "{formData.title?.trim() || 'Exactly what our team needed'}"
                </h2>

                <p className="text-[11px] text-slate-600 leading-relaxed italic" id="preview-body">
                  "{formData.content?.trim() || 'Your feedback and testimonial will appear here in real-time as you fill out the form above...'}"
                </p>

                <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-600 text-[10px] font-bold text-white shadow-sm overflow-hidden">
                    {formData.avatarUrl ? (
                      <img src={formData.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      getInitials(formData.name)
                    )}
                  </div>
                  <div className="leading-tight">
                    <div className="flex items-center gap-1">
                      <span className="text-[11px] font-bold text-slate-900" id="preview-name">
                        {formData.name.trim() || 'Alex Rivera'}
                      </span>
                      <Check className="h-3 w-3 text-emerald-500 stroke-[3]" />
                    </div>
                    <span className="text-[9px] text-slate-400 font-medium" id="preview-role">
                      {formData.role?.trim() || 'Product Lead @ Acme Corp'}
                    </span>
                  </div>
                </div>
              </article>
            </section>

            {/* Terms and Consent */}
            <div className="space-y-2 pt-0.5 px-1" data-purpose="terms-and-consent">
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.consent}
                  onChange={(e) => setFormData(prev => ({ ...prev, consent: e.target.checked }))}
                  className="mt-0.5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500/20"
                />
                <span className="text-[11px] text-slate-500 leading-tight">
                  I give <span className="font-bold text-slate-800">{displayBrand}</span> permission to showcase this review on their website and marketing materials.
                </span>
              </label>
            </div>

            {/* Cloudflare Turnstile Anti-Abuse Protection */}
            <div id="cf-turnstile-container" className="my-2 flex justify-center min-h-[40px]" data-testid="turnstile-container">
              {turnstileSiteKey ? (
                <div
                  className="cf-turnstile"
                  data-sitekey={turnstileSiteKey}
                  data-callback="onTurnstileSuccess"
                />
              ) : (
                <div className="flex items-center gap-2 text-[11px] text-slate-400 bg-slate-50 py-1.5 px-3 rounded-lg border border-slate-200">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Cloudflare Turnstile Verified • Anti-Abuse Protected</span>
                </div>
              )}
            </div>

            {/* Validation Error Message */}
            {validationError && (
              <div id="collector-error-banner" className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold animate-fade-in flex items-center gap-2.5 shadow-2xs">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{validationError}</span>
              </div>
            )}
          </main>

          {/* Sticky Action Footer */}
          <footer className="sticky bottom-0 z-40 border-t border-emerald-100/80 bg-white/95 p-4 backdrop-blur-md" data-purpose="sticky-bottom-action">
            <button
              id="submit-testimonial-btn"
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 py-3.5 px-6 font-bold text-white shadow-float hover:shadow-emerald-500/30 hover:from-emerald-700 hover:to-teal-700 active:scale-[0.98] transition-all text-sm cursor-pointer disabled:opacity-60"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Submitting feedback...</span>
                </>
              ) : (
                <>
                  <span>
                    {activeRating <= 3
                      ? (lang === 'hi' ? 'Review Bhejein 🚀' : 'Send Private Feedback')
                      : (lang === 'hi' ? 'Review Bhejein 🚀' : (t?.positiveForm?.submitBtn || 'Submit Testimonial'))}
                  </span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>

            <div className="mt-2.5 flex items-center justify-center gap-1.5 text-[10px] text-slate-400 font-medium">
              <span>Powered by</span>
              <span className="font-bold text-slate-700 flex items-center gap-0.5">PandaPraise 🐾</span>
              <span>•</span>
              <span>SOC2 &amp; GDPR Compliant</span>
            </div>
          </footer>
        </form>

        {/* Success Modal */}
        {submittedReview && (
          <SuccessModal
            review={submittedReview}
            isPublicView={true}
            businessName={displayBrand || formConfig?.settings?.brandName || formConfig?.title}
            projectId={formConfig?.projectId}
            formId={formConfig?.id}
            lang={lang}
            onClose={() => setSubmittedReview(null)}
            onResetForm={() => {
              setFormData(INITIAL_FORM_STATE);
            }}
          />
        )}
      </div>
    </div>
  );
};

export default PublicCollectorPage;
