import React, { useState } from 'react';
import { 
  X, 
  Copy, 
  Check, 
  ExternalLink, 
  Globe, 
  ToggleLeft, 
  ToggleRight,
  AlertCircle,
  Save
} from 'lucide-react';
import { CollectionForm } from '../../types';
import { storage } from '../../lib/storage';
import { cleanBrandOrProductName, deduplicateRepeatedString } from '../../lib/security';

interface CollectionConfigModalProps {
  collectionForm: CollectionForm | null;
  projectId?: string;
  onClose: () => void;
  onSaved: (form: CollectionForm) => void;
}

export const CollectionConfigModal: React.FC<CollectionConfigModalProps> = ({
  collectionForm,
  projectId = 'proj-demo-1',
  onClose,
  onSaved,
}) => {
  const [title, setTitle] = useState(
    deduplicateRepeatedString(collectionForm?.title) || 'Share Your Experience'
  );
  const [brandName, setBrandName] = useState(
    collectionForm?.settings?.brandName || (collectionForm as any)?.publicBrandName || ''
  );
  const [description, setDescription] = useState(
    collectionForm?.description || 'Your honest feedback helps our team and community grow.'
  );
  const [publicSlug, setPublicSlug] = useState(collectionForm?.publicSlug || 'feedback');
  const [isActive, setIsActive] = useState(collectionForm?.isActive ?? true);
  const [allowVideo, setAllowVideo] = useState(collectionForm?.allowVideo ?? true);
  const [autoTag, setAutoTag] = useState(collectionForm?.settings?.autoTag || '');
  const [autoApprove, setAutoApprove] = useState(collectionForm?.settings?.autoApprove ?? false);

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
        autoTag: autoTag.trim() || undefined,
        autoApprove,
      };

      if (collectionForm?.id) {
        saved = await storage.updateCollectionForm(collectionForm.id, {
          title: cleanTitle.trim(),
          description: description.trim(),
          publicSlug: publicSlug.trim(),
          isActive,
          allowVideo,
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
          isActive,
          allowVideo,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fade-in">
      <div className="bg-white w-full max-w-xl rounded-2xl border border-gray-200 shadow-2xl overflow-hidden animate-slide-up flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-[#6701e6] flex items-center justify-center border border-purple-100">
              <Globe className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900">Collection Settings</h3>
              <p className="text-xs text-gray-500">Configure your customer-facing collection form</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-5 sm:p-6 space-y-5 overflow-y-auto">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Shareable Link Box */}
          <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500">
              Shareable Public URL
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={publicUrl}
                className="w-full px-3 py-2 rounded-lg bg-white border border-gray-300 text-xs font-mono text-gray-800 focus:outline-none"
              />
              <button
                type="button"
                onClick={handleCopyLink}
                className="px-3 py-2 rounded-lg bg-[#6701e6] hover:bg-[#5200bd] text-xs font-bold text-white flex items-center gap-1.5 shrink-0 transition-colors cursor-pointer shadow-xs"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
              <a
                href={publicUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg bg-white hover:bg-gray-100 border border-gray-200 text-gray-600 hover:text-gray-900 shrink-0 transition-colors cursor-pointer"
                title="Preview public page"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Brand / Product Name */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
              Brand / Product Name
            </label>
            <input
              type="text"
              value={brandName}
              onChange={(e) => setBrandName(e.target.value)}
              placeholder="e.g. Acme Inc or Panda Praise"
              className="w-full px-3.5 py-2 rounded-xl text-sm bg-white border border-gray-300 text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#6701e6] focus:border-[#6701e6]"
            />
            <p className="text-[11px] text-gray-500 mt-1">
              Used in the rating question: "Do you enjoy using {cleanBrandOrProductName(brandName) || 'our product'}?"
            </p>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
              Collection Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Share Your Experience with Acme"
              className="w-full px-3.5 py-2 rounded-xl text-sm bg-white border border-gray-300 text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#6701e6] focus:border-[#6701e6]"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
              Instructions / Prompt for Customers
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What questions or topics should customers address?"
              className="w-full px-3.5 py-2 rounded-xl text-xs bg-white border border-gray-300 text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#6701e6] focus:border-[#6701e6] leading-relaxed resize-none"
            />
          </div>

          {/* Public Slug */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
              URL Identifier (Slug) *
            </label>
            <div className="flex items-center">
              <span className="px-3 py-2 bg-gray-100 border border-r-0 border-gray-300 rounded-l-xl text-xs font-mono text-gray-500 select-none">
                /c/
              </span>
              <input
                type="text"
                required
                value={publicSlug}
                onChange={handleSlugChange}
                placeholder="e.g. pulse-feedback"
                className="flex-1 px-3 py-2 rounded-r-xl text-xs font-mono bg-white border border-gray-300 text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#6701e6] focus:border-[#6701e6]"
              />
            </div>
            <p className="text-[11px] text-gray-500 mt-1">
              Lowercase letters, numbers, and hyphens only. Must be unique across the platform.
            </p>
          </div>

          {/* Status & Options */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {/* Active Toggle */}
            <div
              onClick={() => setIsActive(!isActive)}
              className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                isActive
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : 'bg-gray-50 border-gray-200 text-gray-500'
              }`}
            >
              <div>
                <div className="text-xs font-bold">Active for Submissions</div>
                <div className="text-[10px] text-gray-500">
                  {isActive ? 'Accepting new responses' : 'Closed / Paused'}
                </div>
              </div>
              {isActive ? (
                <ToggleRight className="w-6 h-6 text-emerald-600" />
              ) : (
                <ToggleLeft className="w-6 h-6 text-gray-400" />
              )}
            </div>

            {/* Video Toggle */}
            <div
              onClick={() => setAllowVideo(!allowVideo)}
              className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                allowVideo
                  ? 'bg-purple-50 border-purple-200 text-[#6701e6]'
                  : 'bg-gray-50 border-gray-200 text-gray-500'
              }`}
            >
              <div>
                <div className="text-xs font-bold">Accept Video Links</div>
                <div className="text-[10px] text-gray-500">
                  {allowVideo ? 'Loom / YouTube enabled' : 'Text-only form'}
                </div>
              </div>
              {allowVideo ? (
                <ToggleRight className="w-6 h-6 text-[#6701e6]" />
              ) : (
                <ToggleLeft className="w-6 h-6 text-gray-400" />
              )}
            </div>
          </div>

          {/* Automatic Tagging & Auto-Approval Settings */}
          <div className="p-4 rounded-xl bg-purple-50/50 border border-purple-200 space-y-3">
            <div className="text-xs font-bold text-gray-900 uppercase tracking-wider">
              Automatic Processing Rules
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Auto-Tag Incoming Testimonials
              </label>
              <input
                type="text"
                value={autoTag}
                onChange={(e) => setAutoTag(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                placeholder="e.g. enterprise, saas, onboarding"
                className="w-full px-3 py-2 rounded-lg text-xs bg-white border border-gray-300 text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#6701e6]"
              />
              <p className="text-[10px] text-gray-500 mt-1">
                Submissions via this form will automatically receive this tag for widget targeting.
              </p>
            </div>

            <label className="flex items-center gap-2.5 pt-1 text-xs text-gray-700 font-medium cursor-pointer">
              <input
                type="checkbox"
                checked={autoApprove}
                onChange={(e) => setAutoApprove(e.target.checked)}
                className="rounded border-gray-300 text-[#6701e6] focus:ring-[#6701e6]"
              />
              <span>Automatically approve testimonials from this form (skip pending queue)</span>
            </label>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2 rounded-xl bg-[#6701e6] hover:bg-[#5200bd] text-xs font-bold text-white flex items-center gap-1.5 transition-all shadow-xs cursor-pointer disabled:opacity-50"
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
