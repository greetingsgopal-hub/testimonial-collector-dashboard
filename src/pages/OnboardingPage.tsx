import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Check,
  Folder,
  Globe,
  MessageSquarePlus,
  Code2,
  Copy,
  Rocket,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { usePageSeo } from '../lib/seo';
import { PandaPraiseIcon } from '../components/PandaPraiseLogo';

const STEPS = [
  { id: 'project', title: 'Create Your Project', icon: Folder, description: 'Name your product or brand' },
  { id: 'form', title: 'Configure Collection', icon: MessageSquarePlus, description: 'Customize your testimonial form' },
  { id: 'embed', title: 'Get Your Embed Code', icon: Code2, description: 'Add testimonials to your website' },
  { id: 'done', title: 'You\'re All Set!', icon: Rocket, description: 'Start collecting testimonials' },
];

export const OnboardingPage = () => {
  usePageSeo({
    title: 'Get Started — Panda Praise',
    description: 'Set up your testimonial collection in under 2 minutes.',
  });

  const navigate = useNavigate();
  const { project, collectionForm, updateProjectDetails } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [projectName, setProjectName] = useState(project?.name || '');
  const [websiteUrl, setWebsiteUrl] = useState(project?.websiteUrl || '');
  const [formTitle, setFormTitle] = useState(collectionForm?.title || 'Share Your Experience');
  const [formDescription, setFormDescription] = useState(
    collectionForm?.description || 'Your honest feedback helps us grow and serve you better.'
  );
  const [copied, setCopied] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const collectorUrl = collectionForm
    ? `${window.location.origin}/c/${collectionForm.publicSlug}`
    : '';

  const widgetUrl = project
    ? `${window.location.origin}/w/${project.id}?type=wall&theme=dark`
    : '';

  const embedCode = `<iframe
  src="${widgetUrl}"
  style="width:100%;min-height:400px;border:none;"
  loading="lazy"
  title="Customer Testimonials"
></iframe>`;

  const handleNextStep = async () => {
    if (currentStep === 0 && project) {
      // Save project details
      setIsSaving(true);
      await updateProjectDetails(project.id, {
        name: projectName.trim() || project.name,
        websiteUrl: websiteUrl.trim() || undefined,
      });
      setIsSaving(false);
    }
    setCurrentStep(Math.min(currentStep + 1, STEPS.length - 1));
  };

  const handlePrevStep = () => {
    setCurrentStep(Math.max(currentStep - 1, 0));
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFinish = () => {
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col">
      {/* Header */}
      <header className="border-b border-white/5 bg-zinc-950/80 backdrop-blur-xl">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center gap-3">
          <PandaPraiseIcon size={28} />
          <span className="text-lg font-bold bg-gradient-to-r from-violet-400 to-purple-300 bg-clip-text text-transparent">
            Panda Praise
          </span>
        </div>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        {/* Progress Steps */}
        <div className="flex items-center gap-2 mb-12">
          {STEPS.map((step, idx) => {
            const StepIcon = step.icon;
            const isActive = idx === currentStep;
            const isComplete = idx < currentStep;

            return (
              <div key={step.id} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300
                    ${isComplete
                        ? 'bg-emerald-500/20 border-2 border-emerald-500/50'
                        : isActive
                          ? 'bg-violet-500/20 border-2 border-violet-500/50 ring-4 ring-violet-500/10'
                          : 'bg-white/5 border-2 border-white/10'
                      }`}
                  >
                    {isComplete ? (
                      <Check size={16} className="text-emerald-400" />
                    ) : (
                      <StepIcon size={16} className={isActive ? 'text-violet-400' : 'text-zinc-500'} />
                    )}
                  </div>
                  <span
                    className={`text-[11px] mt-1.5 font-medium text-center max-w-[80px] leading-tight
                    ${isActive ? 'text-violet-300' : isComplete ? 'text-emerald-400/70' : 'text-zinc-600'}`}
                  >
                    {step.title}
                  </span>
                </div>
                {idx < STEPS.length - 1 && (
                  <div
                    className={`w-12 h-0.5 mx-1 mt-[-18px] rounded-full transition-colors
                    ${idx < currentStep ? 'bg-emerald-500/30' : 'bg-white/5'}`}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Step Content */}
        <div className="w-full max-w-lg">
          {/* ── Step 0: Project Setup ── */}
          {currentStep === 0 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-violet-500/10 border border-violet-500/20 mb-4">
                  <Folder size={28} className="text-violet-400" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">What are you collecting testimonials for?</h2>
                <p className="text-zinc-400">Name your product, service, or brand.</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-1.5">Project Name *</label>
                  <input
                    type="text"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    placeholder="e.g. My SaaS Product"
                    autoFocus
                    className="w-full px-4 py-3 text-sm rounded-xl
                             bg-white/5 border border-white/10
                             text-zinc-100 placeholder-zinc-500
                             focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500/50
                             transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-1.5">Website URL (optional)</label>
                  <div className="relative">
                    <Globe size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
                    <input
                      type="url"
                      value={websiteUrl}
                      onChange={(e) => setWebsiteUrl(e.target.value)}
                      placeholder="https://yourwebsite.com"
                      className="w-full pl-10 pr-4 py-3 text-sm rounded-xl
                               bg-white/5 border border-white/10
                               text-zinc-100 placeholder-zinc-500
                               focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500/50
                               transition-all"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── Step 1: Collection Form ── */}
          {currentStep === 1 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 mb-4">
                  <MessageSquarePlus size={28} className="text-emerald-400" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Customize Your Collection Form</h2>
                <p className="text-zinc-400">This is what your customers will see when leaving a testimonial.</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-1.5">Form Title</label>
                  <input
                    type="text"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    className="w-full px-4 py-3 text-sm rounded-xl
                             bg-white/5 border border-white/10
                             text-zinc-100 placeholder-zinc-500
                             focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500/50
                             transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-1.5">Description</label>
                  <textarea
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 text-sm rounded-xl resize-none
                             bg-white/5 border border-white/10
                             text-zinc-100 placeholder-zinc-500
                             focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500/50
                             transition-all"
                  />
                </div>

                {/* Preview */}
                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
                  <p className="text-[11px] uppercase tracking-wider text-zinc-500 font-semibold mb-3">Preview — Collection Link</p>
                  <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-white/10">
                    <Globe size={14} className="text-zinc-500 flex-shrink-0" />
                    <span className="text-sm text-violet-300 truncate">{collectorUrl || 'your-link-here'}</span>
                    <button
                      onClick={() => handleCopy(collectorUrl)}
                      className="ml-auto p-1 rounded hover:bg-white/10 text-zinc-500 hover:text-zinc-300"
                    >
                      {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── Step 2: Embed Code ── */}
          {currentStep === 2 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/20 mb-4">
                  <Code2 size={28} className="text-blue-400" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Add Testimonials to Your Website</h2>
                <p className="text-zinc-400">Copy this embed code and paste it anywhere on your site.</p>
              </div>

              <div className="space-y-4">
                <div className="relative">
                  <pre className="p-4 rounded-xl bg-zinc-900 border border-white/10 text-sm text-emerald-300 overflow-x-auto font-mono leading-relaxed">
                    {embedCode}
                  </pre>
                  <button
                    onClick={() => handleCopy(embedCode)}
                    className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-lg
                             bg-white/10 hover:bg-white/15 text-xs font-medium transition-colors
                             text-zinc-300 hover:text-white"
                  >
                    {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                </div>

                <div className="p-4 rounded-xl bg-violet-500/5 border border-violet-500/10">
                  <p className="text-sm text-violet-300 flex items-start gap-2">
                    <Sparkles size={16} className="flex-shrink-0 mt-0.5" />
                    <span>
                      You can customize your widget layout (Wall of Love, Carousel, Badge, etc.)
                      from the <strong>Widget Studio</strong> in your dashboard anytime.
                    </span>
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ── Step 3: Done ── */}
          {currentStep === 3 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300 text-center">
              <div className="mb-8">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-violet-500/20 border border-emerald-500/20 mb-6">
                  <Rocket size={36} className="text-emerald-400" />
                </div>
                <h2 className="text-3xl font-bold text-white mb-3">You're All Set! 🎉</h2>
                <p className="text-zinc-400 text-lg max-w-md mx-auto">
                  Your testimonial collection is ready. Share your link, embed your widget, and start building trust.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-colors">
                  <p className="text-sm font-medium text-zinc-200 mb-1">📨 Share your collection link</p>
                  <p className="text-xs text-zinc-500">Send it to customers via email, chat, or social media.</p>
                </div>
                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-colors">
                  <p className="text-sm font-medium text-zinc-200 mb-1">🎨 Design your widget</p>
                  <p className="text-xs text-zinc-500">Choose from 20+ styles in the Widget Studio.</p>
                </div>
                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-colors">
                  <p className="text-sm font-medium text-zinc-200 mb-1">📥 Import existing reviews</p>
                  <p className="text-xs text-zinc-500">Pull in reviews from Google, G2, Twitter & more.</p>
                </div>
                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-colors">
                  <p className="text-sm font-medium text-zinc-200 mb-1">💜 Create a Wall of Love</p>
                  <p className="text-xs text-zinc-500">Showcase all your best testimonials on a dedicated page.</p>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between mt-10 pt-6 border-t border-white/5">
            <button
              onClick={currentStep === 0 ? () => navigate('/dashboard') : handlePrevStep}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium
                       text-zinc-400 hover:text-zinc-200 hover:bg-white/5 transition-all"
            >
              <ArrowLeft size={16} />
              {currentStep === 0 ? 'Skip Setup' : 'Back'}
            </button>

            {currentStep < STEPS.length - 1 ? (
              <button
                onClick={handleNextStep}
                disabled={currentStep === 0 && !projectName.trim()}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold
                         bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500
                         text-white shadow-lg shadow-violet-500/20
                         disabled:opacity-40 disabled:cursor-not-allowed
                         transition-all duration-200"
              >
                {isSaving ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    Continue
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            ) : (
              <button
                onClick={handleFinish}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold
                         bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500
                         text-white shadow-lg shadow-emerald-500/20
                         transition-all duration-200"
              >
                Go to Dashboard
                <ChevronRight size={16} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
