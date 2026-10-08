import { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { TestimonialForm } from '../components/collector/TestimonialForm';
import { LivePreviewCard } from '../components/collector/LivePreviewCard';
import { SuccessModal } from '../components/collector/SuccessModal';
import { Review, ReviewInput, CollectionForm, Project } from '../types';
import { storage, getActiveBackendInfo } from '../lib/storage';
import { AlertCircle, Building2, Clock, ShieldCheck } from 'lucide-react';
import { usePageSeo } from '../lib/seo';
import { analytics } from '../lib/analytics';
import { cleanBrandOrProductName, deduplicateRepeatedString } from '../lib/security';
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

export const PublicCollectorPage = () => {
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

  // Single-Step Seamless Form State
  const [formData, setFormData] = useState<ReviewInput>(INITIAL_FORM_STATE);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedReview, setSubmittedReview] = useState<Review | null>(null);

  const displayBrand = cleanBrandOrProductName(formConfig?.settings?.brandName) || cleanBrandOrProductName(project?.name);
  const cleanedTitle = deduplicateRepeatedString(formConfig?.title) || 'Share Your Experience';

  const pageTitle = displayBrand && displayBrand.toLowerCase() !== 'panda praise'
    ? `${cleanedTitle} — ${displayBrand} | Panda Praise`
    : `${cleanedTitle} — Panda Praise`;

  usePageSeo({
    title: pageTitle,
    description: formConfig?.description || 'Submit your verified feedback and customer testimonial.',
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
        const errorCode = err?.code || 'unknown';
        const errorMessage = err?.message || String(err);
        console.error('[PublicCollector] Error loading form:', {
          code: errorCode,
          message: errorMessage,
          backend: backend.type,
          firebaseProjectId: backend.type === 'firebase' ? backend.projectId : undefined,
          collectionSlug,
        });
        setError('Failed to load collection form. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    loadPublicForm();
  }, [collectionSlug]);

  const handleSubmit = async (data: ReviewInput) => {
    setIsSubmitting(true);
    try {
      const autoTagSetting = formConfig?.settings?.autoTag;
      const autoTags = Array.isArray(autoTagSetting)
        ? autoTagSetting
        : (autoTagSetting || '')
            .split(/[,;\s]+/)
            .map(t => t.trim().replace(/^#/, ''))
            .filter(Boolean);

      const isPrivate = (data.rating || 5) <= 3;
      const combinedTags = Array.from(new Set([
        ...(data.tags || []),
        ...autoTags,
        ...(isPrivate ? ['private-feedback'] : ['Verified']),
      ]));

      // PRIORITY 1: Anonymous submissions are ALWAYS pending initially.
      // The anonymous client must NEVER directly create an approved public testimonial.
      const created = await storage.createReview(
        {
          ...data,
          tags: combinedTags,
          projectId: formConfig?.projectId,
          collectionFormId: formConfig?.id,
          status: 'pending',
          consent: true,
          source: 'form',
        },
        formConfig?.projectId
      );

      // Trusted auto-approval evaluation
      if (storage.evaluateAutoApproval) {
        await storage.evaluateAutoApproval(created.id, formConfig?.projectId);
      }

      analytics.publicCollectionSubmitted();
      analytics.testimonialSubmissionCompleted({
        projectId: formConfig?.projectId || 'unknown',
        formId: formConfig?.id || 'unknown',
        hasAvatar: Boolean(data.avatarUrl),
      });
      setSubmittedReview(created);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FAF9F6] flex flex-col items-center justify-center text-gray-500 font-sans">
        <div className="w-10 h-10 border-2 border-[#6701e6]/30 border-t-[#6701e6] rounded-full animate-spin mb-4" />
        <p className="text-sm font-medium text-gray-700">Loading collection form...</p>
      </div>
    );
  }

  if (isClosed) {
    return (
      <div className="min-h-screen bg-[#FAF9F6] flex flex-col items-center justify-center p-4 text-center font-sans">
        <div className="max-w-md p-8 rounded-3xl bg-white border border-gray-200 space-y-4 shadow-lg">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
            <Clock className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold font-display text-gray-900">Collection Paused</h2>
          <p className="text-xs text-gray-600 leading-relaxed">
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
            <h3 className="text-xl font-bold font-display text-gray-900">Collection Form Not Found</h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              The review link <code className="bg-slate-100 px-1.5 py-0.5 rounded text-gray-800 font-mono">/c/{collectionSlug}</code> does not exist or has not been configured yet.
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
              className="inline-flex items-center justify-center w-full mt-2 py-2.5 px-4 rounded-xl bg-[#6701e6] hover:bg-[#5200bd] text-white font-bold text-xs transition-colors shadow-xs"
            >
              Open Dashboard
            </a>
          </div>

          <div className="pt-2">
            <a href="/" className="text-xs font-semibold text-gray-400 hover:text-gray-600 transition-colors">
              ← Return to PandaPraise Home
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50/40 via-slate-50 to-slate-100 text-gray-900 font-sans selection:bg-emerald-100 selection:text-emerald-900 flex flex-col">
      
      {/* Public Header */}
      <header className="w-full border-b border-gray-200/70 bg-white/90 backdrop-blur-md py-2 px-4 sm:px-6 sticky top-0 z-30 shadow-2xs">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-3 sm:gap-4">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="font-extrabold text-sm text-[#6701e6] font-display shrink-0">
              Panda Praise
            </span>
            {displayBrand && displayBrand.toLowerCase() !== 'panda praise' && (
              <>
                <span className="text-gray-300 shrink-0">•</span>
                <span className="font-medium text-xs text-gray-700 flex items-center gap-1.5 truncate">
                  <Building2 className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                  <span className="truncate">{displayBrand}</span>
                </span>
              </>
            )}
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Bilingual Switcher: English & Hinglish */}
            <div className="flex items-center p-0.5 bg-slate-100 rounded-full border border-slate-200 shadow-2xs">
              <button
                type="button"
                onClick={() => handleSetLang('en')}
                className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                  lang === 'en'
                    ? 'bg-white text-slate-900 shadow-xs ring-1 ring-slate-200/80'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
                title="Switch to English"
                aria-label="Switch to English"
              >
                <span>🇬🇧</span>
                <span>English</span>
              </button>
              <button
                type="button"
                onClick={() => handleSetLang('hi')}
                className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                  lang === 'hi'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
                title="Hinglish mein dekhein"
                aria-label="Switch to Hinglish"
              >
                <span>🇮🇳</span>
                <span>Hinglish</span>
              </button>
            </div>

            <div className="flex items-center gap-1.5 sm:gap-2 text-[11px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200/80 px-2.5 py-1 rounded-full shrink-0 shadow-2xs">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span className="hidden sm:inline">Verified Secure Feedback</span>
              <span className="sm:hidden">Verified</span>
            </div>
          </div>
        </div>
      </header>

      {/* Reassurance Ribbon: Punchy & Clear */}
      <div className="w-full bg-emerald-50/60 border-b border-emerald-100/70 py-1.5 px-4 text-center">
        <div className="max-w-4xl mx-auto flex items-center justify-center gap-2 text-xs font-medium text-emerald-900">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span>Takes less than 30 seconds. No login required.</span>
        </div>
      </div>

      {/* Main Experience: Unified Single-Step CRO Flow */}
      <main className="flex-1 max-w-4xl mx-auto w-full p-4 sm:p-6 lg:p-8 animate-fade-in space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-7">
            <TestimonialForm
              formData={formData}
              setFormData={setFormData}
              onSubmit={handleSubmit}
              isSubmitting={isSubmitting}
              lang={lang}
            />
          </div>

          <div className="lg:col-span-5 space-y-2">
            <div className="flex items-center justify-between px-1">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                {t.livePreview.badge}
              </p>
              <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60">
                Real-time
              </span>
            </div>
            <LivePreviewCard data={formData} lang={lang} />
          </div>
        </div>

        {/* Discreet Referral Link */}
        <div className="text-center pt-4">
          <a
            href="/?ref=collector_badge"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-[11px] text-slate-400 hover:text-slate-600 transition-colors group cursor-pointer"
          >
            <span>Powered by</span>
            <span className="text-violet-600 font-semibold group-hover:underline">Panda Praise ↗</span>
          </a>
        </div>
      </main>

      {/* Success Celebration Modal */}
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
  );
};
export default PublicCollectorPage;
