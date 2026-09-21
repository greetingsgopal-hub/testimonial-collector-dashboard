import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { TestimonialForm } from '../components/collector/TestimonialForm';
import { LivePreviewCard } from '../components/collector/LivePreviewCard';
import { SuccessModal } from '../components/collector/SuccessModal';
import { Review, ReviewInput, CollectionForm, Project } from '../types';
import { storage, getActiveBackendInfo } from '../lib/storage';
import { AlertCircle, ArrowLeft, Building2, Clock } from 'lucide-react';
import { usePageSeo } from '../lib/seo';
import { analytics } from '../lib/analytics';
import { PandaPraiseIcon } from '../components/PandaPraiseLogo';

const INITIAL_FORM_STATE: ReviewInput = {
  name: '',
  email: '',
  role: '',
  company: '',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  rating: 5,
  title: '',
  content: '',
  type: 'text',
  tags: ['Quality', 'Recommended'],
  consent: true,
};

export const PublicCollectorPage = () => {
  const { collectionSlug } = useParams<{ collectionSlug: string }>();
  
  const [formConfig, setFormConfig] = useState<CollectionForm | null>(null);
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isClosed, setIsClosed] = useState(false);
  const [debugDetails, setDebugDetails] = useState<string | null>(null);

  const pageTitle = formConfig?.title
    ? `${formConfig.title} — Panda Praise`
    : project?.name
    ? `Submit Testimonial for ${project.name} — Panda Praise`
    : 'Submit Your Testimonial — Panda Praise';

  const pageDescription =
    formConfig?.description || 'Submit your verified feedback and customer testimonial.';

  usePageSeo({
    title: pageTitle,
    description: pageDescription,
  });

  const [formData, setFormData] = useState<ReviewInput>(INITIAL_FORM_STATE);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedReview, setSubmittedReview] = useState<Review | null>(null);

  useEffect(() => {
    const loadPublicForm = async () => {
      setIsLoading(true);
      setError(null);
      setIsClosed(false);
      setDebugDetails(null);

      try {
        if (!collectionSlug) {
          setError('Invalid or missing collection link.');
          setIsLoading(false);
          return;
        }

        const result = await storage.getCollectionFormBySlug(collectionSlug);
        if (!result) {
          setError(`Collection form "${collectionSlug}" was not found.`);
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
        if (new URLSearchParams(window.location.search).get('debug') === '1') {
          setDebugDetails(JSON.stringify({
            code: errorCode,
            message: errorMessage,
            backend: backend.type,
            firebaseProjectId: backend.type === 'firebase' ? backend.projectId : undefined,
            collectionSlug,
          }, null, 2));
        }
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
      const created = await storage.createReview(
        {
          ...data,
          projectId: formConfig?.projectId,
          collectionFormId: formConfig?.id,
          status: 'pending',
          consent: true,
        },
        formConfig?.projectId
      );
      analytics.publicCollectionSubmitted();
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
      <div className="min-h-screen bg-[#FAF9F6] flex flex-col items-center justify-center p-4 text-center">
        <div className="ambient-glow-light" />
        <div className="senja-light-card max-w-md p-8 rounded-3xl border border-gray-200 space-y-4 relative z-10 shadow-lg">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
            <Clock className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold font-display text-gray-900">Collection Paused</h2>
          <p className="text-xs text-gray-600 leading-relaxed font-sans">
            This testimonial collection form is currently closed and not accepting new responses. Thank you for your interest!
          </p>
          <div className="pt-2">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-xs font-semibold text-gray-800 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Return to Panda Praise</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (error || !formConfig) {
    return (
      <div className="min-h-screen bg-[#FAF9F6] flex flex-col items-center justify-center p-4 text-center">
        <div className="ambient-glow-light" />
        <div className="senja-light-card max-w-md p-8 rounded-3xl border border-red-200 space-y-4 relative z-10 shadow-lg">
          <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold font-display text-gray-900">Form Unavailable</h3>
          <p className="text-xs text-gray-600 leading-relaxed font-sans">
            {error || 'This testimonial collection form does not exist.'}
          </p>
          {debugDetails && (
            <pre className="mt-4 max-w-full overflow-auto rounded-xl bg-gray-50 border border-gray-200 p-3 text-left text-[10px] leading-relaxed text-amber-700 whitespace-pre-wrap">
              {debugDetails}
            </pre>
          )}
          <div className="pt-2">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-xs text-[#6701e6] hover:underline font-semibold"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Return to Panda Praise Home</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-gray-900 selection:bg-purple-500/20 selection:text-purple-900 relative overflow-x-hidden">
      <div className="ambient-glow-light" />

      {/* Clean, Non-Admin Public Header */}
      <header className="w-full border-b border-gray-200 bg-white/90 backdrop-blur-md py-4 px-4 sm:px-8 relative z-20">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <PandaPraiseIcon size={28} colorMode="gradient" className="shrink-0" />
            {project && (
              <span className="font-display font-semibold text-sm text-gray-900 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-gray-500" />
                {project.name}
              </span>
            )}
          </div>

          <div className="text-[11px] text-gray-500 font-sans">
            Powered by <Link to="/" className="text-[#6701e6] hover:underline font-semibold">Panda Praise 🐼</Link>
          </div>
        </div>
      </header>

      {/* Main Collection Experience */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative z-10">
        
        {/* Header Title & Subtitle from Form Model */}
        <div className="text-center max-w-2xl mx-auto mb-8 animate-fade-in">
          <h1 className="text-3xl sm:text-5xl font-extrabold font-display text-gray-950 tracking-tight">
            {formConfig.title}
          </h1>
          {formConfig.description && (
            <p className="text-sm text-gray-600 mt-2.5 leading-relaxed font-sans">
              {formConfig.description}
            </p>
          )}
        </div>

        {/* Dual Panel Form + Live Preview */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-7">
            <TestimonialForm
              formData={formData}
              setFormData={setFormData}
              onSubmit={handleSubmit}
              isSubmitting={isSubmitting}
            />
          </div>

          <div className="lg:col-span-5 sticky top-8 space-y-4">
            <LivePreviewCard data={formData} />
          </div>
        </div>
      </main>

      {/* Success Celebration Modal */}
      {submittedReview && (
        <SuccessModal
          review={submittedReview}
          isPublicView={true}
          onClose={() => setSubmittedReview(null)}
          onResetForm={() => setFormData(INITIAL_FORM_STATE)}
        />
      )}
    </div>
  );
};
