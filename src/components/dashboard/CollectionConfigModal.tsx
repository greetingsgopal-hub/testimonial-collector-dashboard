import React, { useState } from 'react';
import {
  X,
  Copy,
  Check,
  ExternalLink,
  Globe,
  AlertCircle,
  Save,
} from 'lucide-react';
import { CollectionForm } from '../../types';
import { storage } from '../../lib/storage';
import { cleanBrandOrProductName, deduplicateRepeatedString } from '../../lib/security';

interface CollectionConfigModalProps {
  collectionForm: CollectionForm | null;
  projectId?: string;
  projectName?: string;
  onClose: () => void;
  onSaved: (form: CollectionForm) => void;
}

export const CollectionConfigModal: React.FC<CollectionConfigModalProps> = ({
  collectionForm,
  projectId = 'proj-demo-1',
  projectName,
  onClose,
  onSaved,
}) => {
  const fallbackBrand = cleanBrandOrProductName(projectName) || projectName || '';
  const initialBrand =
    collectionForm?.settings?.brandName || (collectionForm as any)?.publicBrandName || fallbackBrand;

  const rawTitle = deduplicateRepeatedString(collectionForm?.title) || '';
  const isStaleTitle =
    !rawTitle ||
    rawTitle.includes("Gopal's Testimonials") ||
    rawTitle.includes("Gopal’s Testimonials") ||
    rawTitle.toLowerCase().includes('testimonials') ||
    rawTitle.endsWith('Testimonial Form');

  const initialTitle = isStaleTitle
    ? `Share your experience with ${initialBrand || fallbackBrand || 'our business'}`
    : rawTitle;

  const [title, setTitle] = useState(initialTitle);
  const [brandName, setBrandName] = useState(initialBrand);
  const [description, setDescription] = useState(
    collectionForm?.description || 'Your honest feedback helps our team and community grow.'
  );
  const [publicSlug, setPublicSlug] = useState(collectionForm?.publicSlug || 'feedback');

  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [copied, setCopied] = useState(false);

  // Validate slug formatting: alphanumeric and hyphens only
  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const sanitized = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '');
    setPublicSlug(sanitized);
    if (error) setError(null);
  };

  const publicUrl = `${window.location.origin}/c/${publicSlug || 'feedback'}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanTitle = deduplicateRepeatedString(title) || 'Share Your Experience';
    const cleanBrand = cleanBrandOrProductName(brandName);

    if (!cleanTitle.trim()) {
      setError('Collection title is required.');
      return;
    }

    if (!publicSlug.trim()) {
      setError('Public URL slug is required.');
      return;
    }

    setIsSaving(true);
    try {
      let saved: CollectionForm;
      const formSettings = {
        ...collectionForm?.settings,
        brandName: cleanBrand || undefined,
      };

      if (collectionForm?.id) {
        saved = await storage.updateCollectionForm(collectionForm.id, {
          title: cleanTitle.trim(),
          description: description.trim(),
          publicSlug: publicSlug.trim(),
          isActive: collectionForm.isActive ?? true,
          allowVideo: collectionForm.allowVideo ?? false,
          projectId: collectionForm.projectId || projectId,
          settings: formSettings,
          ...((cleanBrand ? { publicBrandName: cleanBrand } : {}) as any),
        });
      } else {
        saved = await storage.createCollectionForm({
          projectId,
          title: cleanTitle.trim(),
          description: description.trim(),
          publicSlug: publicSlug.trim(),
          isActive: true,
          allowVideo: false,
          settings: formSettings,
          ...((cleanBrand ? { publicBrandName: cleanBrand } : {}) as any),
        });
      }
      onSaved(saved);
      onClose();
    } catch (err: any) {
      console.error('[CollectionConfig] Save failed:', err);
      setError(err.message || 'Failed to save collection settings. Slug may already be taken.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md animate-fade-in font-sans">
      <div className="bg-white dark:bg-slate-900 w-full max-w-xl rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-2xl overflow-hidden animate-slide-up flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-100 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 flex items-center justify-center shrink-0">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Collection Settings</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Configure your customer-facing collection form</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-5 sm:p-6 space-y-5 overflow-y-auto">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2 shadow-2xs">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Section: SHAREABLE PUBLIC URL */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/60 space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              SHAREABLE PUBLIC URL
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={publicUrl}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-700 text-xs font-mono text-slate-800 dark:text-slate-200 select-all focus:outline-none"
              />
              <button
                type="button"
                onClick={handleCopyLink}
                className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-xs font-bold text-white flex items-center gap-1.5 shrink-0 transition-colors shadow-sm cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
              <a
                href={publicUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white shrink-0 transition-colors cursor-pointer"
                title="Preview public page"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Clean Form Fields */}
          <div className="space-y-4">
            {/* Brand / Product Name */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Brand / Product Name
              </label>
              <input
                type="text"
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
                placeholder="e.g. Acme Inc or Panda Praise"
                className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700 text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-900 focus:border-purple-600 focus:ring-2 focus:ring-purple-600/10 transition-all shadow-2xs"
              />
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                Displayed on review invitations and public collection pages.
              </p>
            </div>

            {/* Collection Title * */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Collection Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Share Your Experience with Acme"
                className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700 text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-900 focus:border-purple-600 focus:ring-2 focus:ring-purple-600/10 transition-all shadow-2xs"
              />
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                The primary headline shown at the top of your collection form.
              </p>
            </div>

            {/* Instructions / Prompt for Customers (textarea) */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Instructions / Prompt for Customers
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What questions or topics should customers address?"
                className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700 text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-900 focus:border-purple-600 focus:ring-2 focus:ring-purple-600/10 transition-all shadow-2xs leading-relaxed resize-none"
              />
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                Provide helpful guidance or question prompts to inspire authentic responses.
              </p>
            </div>

            {/* URL Identifier (Slug) * with fixed “/c/” prefix */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                URL Identifier (Slug) *
              </label>
              <div className="flex items-center">
                <span className="px-3.5 py-2.5 bg-slate-100 dark:bg-slate-800 border border-r-0 border-slate-200/80 dark:border-slate-700 rounded-l-xl text-xs font-mono text-slate-500 select-none">
                  /c/
                </span>
                <input
                  type="text"
                  required
                  value={publicSlug}
                  onChange={handleSlugChange}
                  placeholder="e.g. your-feedback"
                  className="flex-1 px-3.5 py-2.5 rounded-r-xl text-xs font-mono bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700 text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-900 focus:border-purple-600 focus:ring-2 focus:ring-purple-600/10 transition-all shadow-2xs"
                />
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                Lowercase letters, numbers, and hyphens only. Must be unique across the platform.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-xs font-bold text-white flex items-center gap-1.5 transition-all shadow-sm cursor-pointer disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSaving ? 'Saving...' : 'Save Collection Settings'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CollectionConfigModal;
