import { useState, useEffect } from 'react';
import {
  LayoutTemplate,
  Eye,
  Star,
  Video,
  FileText,
  CheckCircle2,
  Copy,
  Sliders,
  ExternalLink,
  Save,
  Check,
} from 'lucide-react';
import { CollectionForm } from '../../types';

export interface FormTemplate {
  id: string;
  name: string;
  theme: 'midnight' | 'emerald' | 'sunset' | 'minimal';
  bgClass: string;
  cardClass: string;
  accentColor: string;
  heading: string;
  subheading: string;
}

export const PRESET_TEMPLATES: FormTemplate[] = [
  {
    id: 'midnight',
    name: 'Midnight Sleek',
    theme: 'midnight',
    bgClass: 'bg-[#0F172A] text-white',
    cardClass: 'bg-[#1E293B] border-slate-700 text-slate-100',
    accentColor: '#7C3AED',
    heading: 'How was your experience with us?',
    subheading: 'Your honest feedback helps us improve and guides future customers.',
  },
  {
    id: 'emerald',
    name: 'Emerald Trust',
    theme: 'emerald',
    bgClass: 'bg-[#F0FDF4] text-slate-900',
    cardClass: 'bg-white border-emerald-200 text-slate-900 shadow-sm',
    accentColor: '#059669',
    heading: 'Share your success story!',
    subheading: 'Takes less than 30 seconds. No login required.',
  },
  {
    id: 'sunset',
    name: 'Sunset Warmth',
    theme: 'sunset',
    bgClass: 'bg-[#FFFBEB] text-slate-900',
    cardClass: 'bg-white border-amber-200 text-slate-900 shadow-sm',
    accentColor: '#D97706',
    heading: 'We love hearing from you!',
    subheading: 'Tell us what problem we solved for you today.',
  },
  {
    id: 'minimal',
    name: 'Modern Minimal',
    theme: 'minimal',
    bgClass: 'bg-[#FAFAFA] text-slate-900',
    cardClass: 'bg-white border-slate-200 text-slate-900 shadow-sm',
    accentColor: '#18181B',
    heading: 'Leave a verified review',
    subheading: 'Share your thoughts, results, or favorite feature.',
  },
];

export interface CollectionFormBuilderProps {
  workspaceName?: string;
  collectionForm?: CollectionForm | null;
  onUpdateForm?: (updates: Partial<CollectionForm>) => Promise<void> | void;
  publicCollectionUrl?: string;
}

export function CollectionFormBuilder({
  workspaceName = 'papasystem',
  collectionForm,
  onUpdateForm,
  publicCollectionUrl,
}: CollectionFormBuilderProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<FormTemplate>(PRESET_TEMPLATES[0]);
  const [formHeading, setFormHeading] = useState<string>(
    collectionForm?.title || `How was your experience with ${workspaceName}?`
  );
  const [formSubheading, setFormSubheading] = useState<string>(
    collectionForm?.description || 'Your honest feedback helps our team improve and guides future customers.'
  );
  const [allowVideo, setAllowVideo] = useState<boolean>(collectionForm?.allowVideo ?? true);
  const [allowText, setAllowText] = useState<boolean>(collectionForm?.allowText ?? true);
  const [primaryColor, setPrimaryColor] = useState<string>(PRESET_TEMPLATES[0].accentColor);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  // Sync state if collectionForm prop updates
  useEffect(() => {
    if (collectionForm?.title) {
      setFormHeading(collectionForm.title);
    }
    if (collectionForm?.description) {
      setFormSubheading(collectionForm.description);
    }
    if (collectionForm?.allowVideo !== undefined) {
      setAllowVideo(collectionForm.allowVideo);
    }
    if (collectionForm?.allowText !== undefined) {
      setAllowText(collectionForm.allowText);
    }
  }, [collectionForm]);

  // Live Preview Form State
  const [previewRating, setPreviewRating] = useState<number>(5);
  const [previewText, setPreviewText] = useState<string>('');

  const fallbackUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/c/${workspaceName.toLowerCase().replace(/[^a-z0-9]/g, '')}`
    : `https://pandapraise.com/c/${workspaceName}`;
  const effectiveUrl = publicCollectionUrl || fallbackUrl;

  const handleApplyTemplate = (tpl: FormTemplate) => {
    setSelectedTemplate(tpl);
    setFormHeading(tpl.heading);
    setFormSubheading(tpl.subheading);
    setPrimaryColor(tpl.accentColor);
  };

  const handleCopyLink = () => {
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(effectiveUrl).catch(() => {});
    }
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleSaveForm = async () => {
    setIsSaving(true);
    try {
      if (onUpdateForm) {
        await onUpdateForm({
          title: formHeading,
          description: formSubheading,
          allowVideo,
          allowText,
        });
      }
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    } catch (err) {
      console.error('Failed to save collection form:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 font-sans text-slate-900" data-testid="collection-form-builder-studio">
      {/* ── SECTION HEADER ── */}
      <section className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-purple-600 animate-pulse" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
              Collection Form Builder
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white mt-1">
            Form Builder
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Configure questions, check the live preview card, and choose from pre-made theme templates.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
          <button
            type="button"
            data-testid="builder-copy-link-btn"
            onClick={handleCopyLink}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/60 text-slate-700 dark:text-slate-200 text-xs font-bold shadow-2xs transition-all cursor-pointer"
          >
            {copiedLink ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-slate-500" />}
            <span>{copiedLink ? 'Link Copied!' : 'Copy Form Link'}</span>
          </button>

          <a
            href={effectiveUrl}
            target="_blank"
            rel="noopener noreferrer"
            data-testid="builder-open-live-btn"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-sm transition-all cursor-pointer"
          >
            <ExternalLink className="w-4 h-4" />
            <span>Open Live Form</span>
          </a>
        </div>
      </section>

      {/* ── TOP SPLIT: COLLECTION FORM (LEFT) & PREVIEW (RIGHT) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* TOP-LEFT: COLLECTION FORM */}
        <div className="lg:col-span-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-2xs space-y-5">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-2xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-300 flex items-center justify-center">
                <Sliders className="w-4.5 h-4.5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Collection FORM</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Settings, questions & media permissions.</p>
              </div>
            </div>

            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300">
              Live Editor
            </span>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Form Heading Title
              </label>
              <input
                type="text"
                data-testid="builder-heading-input"
                value={formHeading}
                onChange={(e) => setFormHeading(e.target.value)}
                placeholder="e.g. How was your experience with us?"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-purple-600 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Subheading / Instructions
              </label>
              <textarea
                rows={2}
                data-testid="builder-subheading-input"
                value={formSubheading}
                onChange={(e) => setFormSubheading(e.target.value)}
                placeholder="e.g. Your feedback helps our team improve..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-purple-600 transition-colors resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <label className="flex items-center gap-2.5 p-3 rounded-2xl border border-slate-200 dark:border-slate-700/80 bg-slate-50 dark:bg-slate-800/50 cursor-pointer hover:bg-slate-100/60 transition-colors">
                <input
                  type="checkbox"
                  data-testid="builder-allow-text"
                  checked={allowText}
                  onChange={(e) => setAllowText(e.target.checked)}
                  className="rounded text-purple-600 focus:ring-purple-500 w-4 h-4 cursor-pointer"
                />
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                  Written Review
                </span>
              </label>

              <label className="flex items-center gap-2.5 p-3 rounded-2xl border border-slate-200 dark:border-slate-700/80 bg-slate-50 dark:bg-slate-800/50 cursor-pointer hover:bg-slate-100/60 transition-colors">
                <input
                  type="checkbox"
                  data-testid="builder-allow-video"
                  checked={allowVideo}
                  onChange={(e) => setAllowVideo(e.target.checked)}
                  className="rounded text-purple-600 focus:ring-purple-500 w-4 h-4 cursor-pointer"
                />
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <Video className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                  Video (+2x Perk)
                </span>
              </label>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Accent / Brand Color
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  data-testid="builder-color-picker"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="w-10 h-10 rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer p-1 bg-white dark:bg-slate-800"
                />
                <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700">
                  {primaryColor}
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <span className="text-xs text-slate-400">
                Changes take effect live on <code className="text-purple-600 font-mono">/c/{workspaceName}</code>
              </span>
              <button
                type="button"
                data-testid="builder-save-btn"
                onClick={handleSaveForm}
                disabled={isSaving}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-purple-600 dark:hover:bg-purple-700 text-white font-bold text-xs shadow-sm transition-all cursor-pointer disabled:opacity-50"
              >
                {saveSuccess ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Saved Live ✓</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>{isSaving ? 'Saving...' : 'Apply & Save Live'}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* TOP-RIGHT: PREVIEW */}
        <div className="lg:col-span-6 bg-slate-950 rounded-3xl border border-slate-800 p-6 shadow-xl text-white relative">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
            <div className="flex items-center gap-2 text-xs font-bold tracking-wider text-purple-400 uppercase">
              <Eye className="w-4 h-4" />
              <span>Preview</span>
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              Interactive Live Card
            </span>
          </div>

          {/* Rendered Preview Card */}
          <div
            data-testid="builder-preview-card"
            className={`rounded-2xl p-6 border transition-all ${selectedTemplate.cardClass}`}
          >
            <div className="text-center space-y-2 mb-6">
              <span className="text-[10px] font-bold uppercase tracking-wider opacity-75">
                ★ Verified Space • {workspaceName}
              </span>
              <h3 className="text-xl font-extrabold tracking-tight">{formHeading}</h3>
              <p className="text-xs opacity-80 max-w-sm mx-auto leading-relaxed">{formSubheading}</p>
            </div>

            {/* Overall Satisfaction Star Module */}
            <div className="bg-black/5 dark:bg-white/5 rounded-xl p-4 text-center border border-current/10 mb-4">
              <span className="text-[10px] font-bold uppercase tracking-wider opacity-75 block mb-1.5">
                OVERALL SATISFACTION
              </span>
              <div className="flex justify-center gap-2">
                {[1, 2, 3, 4, 5].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setPreviewRating(s)}
                    className="cursor-pointer transition-transform hover:scale-115 active:scale-95"
                  >
                    <Star
                      className={`w-6 h-6 ${
                        s <= previewRating ? 'text-amber-400 fill-amber-400' : 'opacity-25'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Media Selector Tabs */}
            <div className="grid grid-cols-2 gap-2 my-4 opacity-90 text-xs font-bold">
              {allowText && (
                <div
                  className="py-2.5 rounded-lg text-center border border-current/20 bg-black/5"
                  style={{ borderColor: primaryColor }}
                >
                  Written Review
                </div>
              )}
              {allowVideo && (
                <div className="py-2.5 rounded-lg text-center border border-current/20 bg-black/5">
                  Video (+2x Perk)
                </div>
              )}
            </div>

            {/* Mock Textarea */}
            <textarea
              rows={3}
              value={previewText}
              onChange={(e) => setPreviewText(e.target.value)}
              placeholder="Type your authentic review here to see live preview..."
              className="w-full rounded-xl border border-current/20 p-3 text-xs bg-black/5 dark:bg-white/5 opacity-80 focus:outline-none focus:opacity-100 transition-opacity resize-none"
            />

            <button
              type="button"
              className="mt-4 w-full py-3 rounded-xl text-white font-bold text-xs shadow-md transition-all cursor-pointer hover:brightness-105"
              style={{ backgroundColor: primaryColor }}
            >
              Submit Testimonial →
            </button>
          </div>
        </div>

      </div>

      {/* ── BOTTOM: TEMPLATES COLLECTION ── */}
      <section className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-2xs space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-2xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-300 flex items-center justify-center">
            <LayoutTemplate className="w-4.5 h-4.5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Templates Collection</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Click any pre-made theme template to instantly apply it to your collection form.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {PRESET_TEMPLATES.map((tpl) => {
            const isSelected = selectedTemplate.id === tpl.id;
            return (
              <div
                key={tpl.id}
                data-testid={`template-${tpl.id}`}
                onClick={() => handleApplyTemplate(tpl)}
                className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'border-purple-600 ring-2 ring-purple-600/20 bg-purple-50/20 dark:bg-purple-950/20'
                    : 'border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-sm text-slate-900 dark:text-white">{tpl.name}</span>
                    {isSelected && <CheckCircle2 className="w-4 h-4 text-purple-600 dark:text-purple-400" />}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                    {tpl.subheading}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3.5 h-3.5 rounded-full border border-slate-300 shadow-2xs"
                      style={{ backgroundColor: tpl.accentColor }}
                    />
                    <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                      {tpl.theme}
                    </span>
                  </div>
                  <span className="text-[11px] font-bold text-purple-600 dark:text-purple-400">
                    {isSelected ? 'Applied ✓' : 'Apply →'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

export default CollectionFormBuilder;
