import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { TestimonialForm } from '../components/collector/TestimonialForm';
import { LivePreviewCard } from '../components/collector/LivePreviewCard';
import { SuccessModal } from '../components/collector/SuccessModal';
import { Review, ReviewInput, CollectionForm, Project } from '../types';
import { storage } from '../lib/storage';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import { Sparkles, AlertCircle, ArrowLeft, Building2 } from 'lucide-react';

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

  const [formData, setFormData] = useState<ReviewInput>(INITIAL_FORM_STATE);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedReview, setSubmittedReview] = useState<Review | null>(null);

  useEffect(() => {
    const loadPublicForm = async () => {
      setIsLoading(true);
      setError(null);

      try {
        if (!collectionSlug) {
          setError('Invalid or missing collection link.');
          setIsLoading(false);
          return;
        }

        if (isSupabaseConfigured && supabase) {
          // Cloud Supabase lookup
          const { data: formRow, error: formErr } = await supabase
            .from('collection_forms')
            .select('*')
            .eq('public_slug', collectionSlug)
            .eq('is_active', true)
            .maybeSingle();

          if (formErr || !formRow) {
            setError(`Collection form "${collectionSlug}" was not found or is currently inactive.`);
            setIsLoading(false);
            return;
          }

          const { data: projRow } = await supabase
            .from('projects')
            .select('*')
            .eq('id', formRow.project_id)
            .maybeSingle();

          setFormConfig({
            id: formRow.id,
            projectId: formRow.project_id,
            publicSlug: formRow.public_slug,
            title: formRow.title,
            description: formRow.description,
            isActive: formRow.is_active,
            allowVideo: formRow.allow_video,
            settings: formRow.settings,
            createdAt: formRow.created_at,
            updatedAt: formRow.updated_at,
          });

          setProject(projRow ? {
            id: projRow.id,
            workspaceId: projRow.workspace_id,
            name: projRow.name,
            slug: projRow.slug,
            websiteUrl: projRow.website_url,
            createdAt: projRow.created_at,
          } : null);
        } else {
          // Local/Demo Mode fallback for testing: support default slugs
          if (collectionSlug === 'pulse-feedback' || collectionSlug === 'demo-feedback') {
            setFormConfig({
              id: 'form-demo-1',
              projectId: 'proj-demo-1',
              publicSlug: collectionSlug,
              title: 'Share Your Experience with Pulse AI',
              description: 'We would love to hear how Pulse AI helped you scale.',
              isActive: true,
              allowVideo: true,
              createdAt: new Date().toISOString(),
            });
            setProject({
              id: 'proj-demo-1',
              workspaceId: 'ws-demo-1',
              name: 'Pulse AI',
              slug: 'pulse-ai',
              createdAt: new Date().toISOString(),
            });
          } else {
            setError(`Collection form "${collectionSlug}" was not found in the database.`);
          }
        }
      } catch (err: any) {
        console.error('[PublicCollector] Error loading form:', err);
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
      setSubmittedReview(created);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center text-zinc-400">
        <div className="w-10 h-10 border-2 border-brand-500/30 border-t-brand-500 rounded-full animate-spin mb-4" />
        <p className="text-sm font-medium text-zinc-300">Loading collection form...</p>
      </div>
    );
  }

  if (error || !formConfig) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-4 text-center">
        <div className="ambient-glow" />
        <div className="glass-panel max-w-md p-8 rounded-2xl border border-red-500/20 space-y-4 relative z-10 shadow-2xl">
          <div className="w-12 h-12 rounded-xl bg-red-500/10 text-red-400 flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold font-display text-white">Form Unavailable</h3>
          <p className="text-xs text-zinc-400 leading-relaxed">
            {error || 'This testimonial collection form does not exist or has been paused by the owner.'}
          </p>
          <div className="pt-2">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-xs text-brand-400 hover:text-brand-300 font-medium"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Return to ReviewVault Home</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 selection:bg-brand-500/30 selection:text-brand-200 relative overflow-x-hidden">
      <div className="ambient-glow" />

      {/* Clean, Non-Admin Public Header */}
      <header className="w-full border-b border-zinc-800/80 glass-panel py-4 px-4 sm:px-8 relative z-20">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-brand-600 to-pink-500 p-[1px]">
              <div className="w-full h-full bg-zinc-950 rounded-[7px] flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-brand-400" />
              </div>
            </div>
            {project && (
              <span className="font-display font-semibold text-sm text-white flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-zinc-400" />
                {project.name}
              </span>
            )}
          </div>

          <div className="text-[11px] text-zinc-500">
            Powered by <Link to="/" className="text-zinc-400 hover:text-white font-medium underline">ReviewVault</Link>
          </div>
        </div>
      </header>

      {/* Main Collection Experience */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative z-10">
        
        {/* Header Title & Subtitle from Form Model */}
        <div className="text-center max-w-2xl mx-auto mb-8 animate-fade-in">
          <h1 className="text-2xl sm:text-4xl font-extrabold font-display text-white tracking-tight">
            {formConfig.title}
          </h1>
          {formConfig.description && (
            <p className="text-xs sm:text-sm text-zinc-400 mt-2 leading-relaxed">
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
          onClose={() => setSubmittedReview(null)}
          onGoToDashboard={() => {
            setSubmittedReview(null);
          }}
          onResetForm={() => setFormData(INITIAL_FORM_STATE)}
        />
      )}
    </div>
  );
};
